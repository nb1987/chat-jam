import pool from "../config/db.js";
import { isSenderBlocked } from "./users-service.js";

const PAGE_SIZE = 10;

function mergedTableForHistory() {
  return `
    SELECT *
    FROM messages_columns_arranged
    WHERE (user_id = $1 AND friend_id = $2)
       OR (user_id = $2 AND friend_id = $1)

    UNION ALL
  
    SELECT *
    FROM blocked_messages
    WHERE user_id = $1 AND friend_id = $2
  `;
}

// cursor = (msg)created_at, cursorId = (msg)id
export async function fetchChatRoomHistory(
  userId,
  roomId,
  friendId,
  cursor = null,
  cursorId = null
) {
  const q = `
    SELECT * 
    FROM (
      ${mergedTableForHistory()}
      ) AS m
    WHERE room_id = $3
    ${
      cursor
        ? `AND (
      created_at < $4::timestamp 
      OR (created_at = $4::timestamp AND id < $5)
      )`
        : ""
    }
    ORDER BY created_at DESC, id DESC
    LIMIT ${PAGE_SIZE + 1};
  `;

  const params = cursor
    ? [userId, friendId, roomId, cursor, cursorId]
    : [userId, friendId, roomId];
  const { rows } = await pool.query(q, params);

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
// rows[rows.length - 1].created_at = Date 객체! 따라서
// 문자열로 변환시켜 반환함 => toISOString()

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
