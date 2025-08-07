import pool from "../config/db.js";
import { isSenderBlocked } from "./users-service.js";

const PAGE_SIZE = 10;

const not_blocked_with_cursor = () => {
  return `
    SELECT * FROM messages_columns_arranged
    WHERE room_id = $1
    AND (
      created_at < $2::timestamp 
      OR (created_at = $2::timestamp AND id < $3)
      )
    ORDER BY created_at DESC, id DESC
    LIMIT 11
  `;
}; // roomId, cursor, cursorId,

const not_blocked_without_cursor = () => {
  return `
    SELECT * FROM messages_columns_arranged
    WHERE room_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT 11
  `;
};

const blocked_with_cursor = () => {
  return `
    SELECT * FROM (
      SELECT *, 'messages' AS source
      FROM messages_columns_arranged AS m
      WHERE 
        (m.user_id = $1 AND m.friend_id = $2)
        OR
        (m.user_id = $2 AND m.friend_id = $1)

      UNION ALL

      SELECT *, 'blocked' AS source
      FROM blocked_messages AS bm
      WHERE 
        (bm.user_id = $1 AND bm.friend_id = $2)  
        OR
        (bm.user_id = $2 AND bm.friend_id = $1) 
    ) AS all_messages
    WHERE 
      (created_at < $3)
      OR (created_at = $3 AND id < $4)
    ORDER BY created_at DESC, id DESC
    LIMIT 11
  `;
}; //    userId, friendId, cursor, cursorId,

const blocked_without_cursor = () => {
  return `
    SELECT * FROM (
      SELECT *, 'messages' AS source
      FROM messages_columns_arranged AS m
      WHERE 
        (m.user_id = $1 AND m.friend_id = $2)
        OR
        (m.user_id = $2 AND m.friend_id = $1)

      UNION ALL

      SELECT *, 'blocked' AS source
      FROM blocked_messages AS bm
      WHERE 
        (bm.user_id = $1 AND bm.friend_id = $2)  
        OR
        (bm.user_id = $2 AND bm.friend_id = $1)    
    ) AS all_messages
    ORDER BY created_at DESC, id DESC
    LIMIT 11
  `; //  userId, friendId,
};

// ({ rows } = await pool.query(...)) 괄호로 {row}를 감싼 이유는:
// 이미 변수가 선언되어 있고, 다른 값을 할당할 때 씀.
export async function fetchChatRoomHistory(
  userId,
  roomId,
  friendId,
  cursor = null,
  cursorId = null
) {
  const isBlocked = await isSenderBlocked(userId, friendId);
  let rows;

  if (!isBlocked) {
    if (cursor) {
      ({ rows } = await pool.query(not_blocked_with_cursor(), [
        roomId,
        cursor,
        cursorId,
      ]));
    } else {
      ({ rows } = await pool.query(not_blocked_without_cursor(), [roomId]));
    }
  } else {
    if (cursor) {
      ({ rows } = await pool.query(blocked_with_cursor(), [
        userId,
        friendId,
        cursor,
        cursorId,
      ]));
    } else {
      ({ rows } = await pool.query(blocked_without_cursor(), [
        userId,
        friendId,
      ]));
    }
  }
  const hasMore = rows.length > PAGE_SIZE;
  const messages = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? {
        createdAt: rows[rows.length - 1].created_at.toISOString(),
        id: rows[rows.length - 1].id,
      }
    : { createdAt: null, id: null };
  return { messages, nextCursor, hasMore };
}

export async function getOrCreateRoomId(userId, friendId) {
  const userLow = Math.min(userId, friendId);
  const userHigh = Math.max(userId, friendId);

  const room_exists_q = `
  SELECT id
  FROM chat_rooms
  WHERE user_low = $1
  AND user_high = $2
`;

  const create_room_q = `
  INSERT INTO chat_rooms
  (user1_id, user2_id)
  VALUES ($1, $2) 
  RETURNING id
`;

  const roomResult = await pool.query(room_exists_q, [userLow, userHigh]);

  if (roomResult.rows.length > 0) {
    return roomResult.rows[0].id;
  } else {
    const newRoom = await pool.query(create_room_q, [userId, friendId]);
    return newRoom.rows[0].id;
  }
}

async function insertBlockedMsg(
  roomId,
  text,
  senderId,
  friendId,
  clientCreatedAt
) {
  const q = `
    INSERT INTO blocked_messages (room_id, text, user_id, friend_id, client_created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(q, [
    roomId,
    text,
    senderId,
    friendId,
    clientCreatedAt,
  ]);
  return result.rows[0];
}

export async function insertMsg(
  roomId,
  text,
  senderId,
  friendId,
  clientCreatedAt
) {
  const q = `
    INSERT INTO messages (room_id, text, user_id, friend_id, client_created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const isBlocked = await isSenderBlocked(senderId, friendId);
  if (isBlocked) {
    return insertBlockedMsg(roomId, text, senderId, friendId, clientCreatedAt);
  } else {
    const result = await pool.query(q, [
      roomId,
      text,
      senderId,
      friendId,
      clientCreatedAt,
    ]);
    return result.rows[0];
  }
}

// room_id  text  created_at  is_read  sender_id  other_user_id
//    10                                  1             2
//    10                                  2             1
//    100                                 2             1
function mergedMsgTable() {
  return `
    SELECT 
      room_id,
      text,
      created_at::timestamp,
      is_read,
      user_id AS sender_id,
      CASE WHEN user_id = $1 THEN friend_id
           ELSE user_id
           END AS other_user_id
    FROM messages
    WHERE user_id = $1 OR friend_id = $1
  
    UNION ALL
  
    SELECT 
      room_id,
      text,
      created_at::timestamp,
      is_read,
      user_id AS sender_id,
      friend_id AS other_user_id
    FROM blocked_messages
    WHERE user_id = $1 
  `;
}

// 한 친구당 하나씩 메시지 요약 (상대방을 기준으로 그룹화)
// 같은 사람에 대해 여러 행이 있으면 맨 위의 것만 하나 남김.
export async function getChatSummaries(userId) {
  const q = `
    SELECT DISTINCT ON (m.other_user_id)
      u.id, 
      u.username, 
      u.userImgSrc AS "userImgSrc",  
      m.text AS "lastMsg",
      m.room_id,
      m.created_at AS "lastMsgAt",
      m.sender_id AS "lastMsgSenderId",
      m.is_read AS "lastMsgIsRead"
    FROM (
      ${mergedMsgTable()} 
    ) AS m
    JOIN users u ON u.id = m.other_user_id
    ORDER BY m.other_user_id, m.created_at DESC
    `;

  const result = await pool.query(q, [userId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

export async function deleteMessage(messageId) {
  const check_table_q = `SELECT id FROM messages WHERE id = $1`;
  const checkResult = await pool.query(check_table_q, [messageId]);

  let q;
  let table = "messages";
  if (checkResult.rowCount === 0) {
    table = "blocked_messages";
  }
  q = `
    UPDATE ${table}
    SET text = 'This message is deleted.', is_deleted = true
    WHERE id = $1
    RETURNING id, text, is_deleted
  `;
  const result = await pool.query(q, [messageId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

// messageIds is an array
export async function updateMsgAsRead(messageIds, roomId) {
  const q = `
    UPDATE messages
    SET is_read = true
    WHERE id = ANY($1::int[])
    AND room_id = $2
    RETURNING id, is_read, user_id, friend_id, room_id
  `;
  const result = await pool.query(q, [messageIds, roomId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

export async function countUnreadMsg(userId) {
  const q = `
    SELECT room_id, COUNT(*) AS total
    FROM messages
    WHERE is_read = false
    AND user_id != $1
    AND room_id IN (
      SELECT id FROM chat_rooms
      WHERE user1_id = $1 OR user2_id = $1
      )
    GROUP BY room_id
  `;
  const result = await pool.query(q, [userId]);
  return result.rows;
} // 내가 참여한 채팅방에서 상대방이 보냈고, 내가 아직 안 읽은 메시지들

export async function deleteChatRoom(roomId) {
  const q = `
    DELETE FROM chat_rooms
    WHERE id = $1
  `;
  await pool.query(q, [roomId]);
}
