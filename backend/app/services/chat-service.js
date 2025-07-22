import pool from "../config/db.js";
import { isSenderBlocked, getIdsWhoBlockedUser } from "./users-service.js";

const not_blocked_q = `
    SELECT *
    FROM messages
    WHERE room_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT 50 OFFSET $2;
  `; // 최신 메시지부터

const blocked_q = `
SELECT *
FROM (
  SELECT
    id,
    room_id,
    user_id,
    friend_id,
    text,
    created_at::timestamp,
    is_deleted,
    is_read
  FROM messages
  WHERE room_id = $1
    
  UNION ALL
  SELECT 
    id, 
    room_id, 
    sender_id AS user_id, 
    receiver_id AS friend_id, 
    text, 
    created_at::timestamp, 
    is_deleted, 
    is_read
  FROM blocked_messages
  WHERE room_id = $1 AND sender_id = $2             
) AS all_messages
  ORDER BY created_at DESC, id DESC
  LIMIT 50 OFFSET $3;
  `;

// OFFSET = 몇번째부터 데이터를 가져올 것인가. 1~50, 51~100
export async function fetchChatRoomHistory(
  userId,
  roomId,
  friendId,
  offset = 0
) {
  const isBlocked = await isSenderBlocked(userId, friendId);

  if (!isBlocked) {
    const result = await pool.query(not_blocked_q, [roomId, offset]);
    return Array.isArray(result.rows) ? result.rows : [];
  } else {
    const result = await pool.query(blocked_q, [roomId, userId, offset]);
    return Array.isArray(result.rows) ? result.rows : [];
  }
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

async function insertBlockedMsg(roomId, text, senderId, friendId) {
  const q = `
    INSERT INTO blocked_messages (room_id, text, sender_id, receiver_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await pool.query(q, [roomId, text, senderId, friendId]);
  return result.rows[0];
}

export async function insertMsg(roomId, text, senderId, friendId) {
  const q = `
    INSERT INTO messages (room_id, text, user_id, friend_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const isBlocked = await isSenderBlocked(senderId, friendId);
  if (isBlocked) {
    return insertBlockedMsg(roomId, text, senderId, friendId);
  } else {
    const result = await pool.query(q, [roomId, text, senderId, friendId]);
    return result.rows[0];
  }
}

function getAllMessagesSubQuery() {
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
    WHERE user_id = $1 AND friend_id = ANY($2)
       OR friend_id = $1 AND user_id = ANY($2)
    
  UNION ALL

  SELECT  
    room_id, 
    text, 
    created_at::timestamp, 
    is_read, 
    sender_id,
    CASE 
      WHEN sender_id = $1 THEN receiver_id
      ELSE sender_id
      END AS other_user_id
  FROM blocked_messages
  WHERE sender_id = $1 AND receiver_id = ANY($2)
     OR receiver_id = $1 AND sender_id = ANY($2)
  `;
}

async function getSummariesFromBlockers(userId, arrayOfIds) {
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
  ${getAllMessagesSubQuery()} 
) AS m
JOIN users u ON u.id = m.other_user_id
ORDER BY m.other_user_id, m.created_at DESC
LIMIT 1
  `;
  const result = await pool.query(q, [userId, arrayOfIds]);
  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    userImgSrc: row.userImgSrc,
    lastMsg: row.lastMsg,
    room_id: row.room_id,
    lastMsgAt: row.lastMsgAt,
    lastMsgSenderId: row.lastMsgSenderId,
    lastMsgIsRead: row.lastMsgIsRead,
  }));
}

async function getNormalSummaries(userId) {
  const q = `
    SELECT 
      u.id, 
      u.username, 
      u.userImgSrc AS "userImgSrc",
      m.text AS "lastMsg",
      m.room_id,
      m.created_at AS "lastMsgAt",
      m.user_id AS "lastMsgSenderId",
      m.is_read AS "lastMsgIsRead"
    FROM users u 
    JOIN chat_rooms cr
      ON (u.id = cr.user1_id AND cr.user2_id = $1)
      OR (u.id = cr.user2_id AND cr.user1_id = $1)
    LEFT JOIN LATERAL (
      SELECT text, created_at, user_id, is_read, room_id
      FROM messages
      WHERE room_id = cr.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    WHERE u.id != $1 
  `;
  const result = await pool.query(q, [userId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

// 내가 아닌 상대방의 정보/ 마지막 메시지와 시간, 속해있는 채팅방 ID
// 마지막 메시지 보낸이/ 읽음 여부
export async function getChatSummaries(userId) {
  const arrayOfIds = await getIdsWhoBlockedUser(userId);
  let summariesWithBlockers = [];
  let normalSummaries = [];

  if (arrayOfIds.length > 0) {
    summariesWithBlockers = await getSummariesFromBlockers(userId, arrayOfIds);
  }
  normalSummaries = await getNormalSummaries(userId);

  const sortedSurmmaries = [...summariesWithBlockers, ...normalSummaries].sort(
    (a, b) => new Date(b.lastMsgAt) - new Date(a.lastMsgAt)
  );

  return sortedSurmmaries;
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
