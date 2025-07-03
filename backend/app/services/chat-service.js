import pool from "../config/db.js";

export async function fetchChatRoomHistory(roomId) {
  const q = `
SELECT room_id, user_id, text, created_at
FROM messages
WHERE room_id = $1
ORDER BY created_at ASC
LIMIT 50 OFFSET 0;
`;

  const result = await pool.query(q, [roomId]);
  return Array.isArray(result.rows) ? result.rows : [];
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

export async function insertMsg(roomId, text, senderId) {
  if (!roomId || !senderId) {
    console.error("Invalid input: roomId or senderId is missing.");
    throw new Error("Invalid roomId or senderId");
  }

  const q = `
    INSERT INTO messages (room_id, text, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, room_id, user_id, text, created_at
  `;

  const result = await pool.query(q, [roomId, text, senderId]);
  return result.rows[0];
}

export async function getChatFriendsInfo(userId) {
  const q = `
    SELECT 
      u.id, 
      u.username, 
      u.userImgSrc AS "userImgSrc",
      m.text AS "lastMsg",
      m.created_at AS "lastMsgAt"
    FROM users u 
    JOIN chat_rooms cr
      ON (u.id = cr.user1_id AND cr.user2_id = $1)
      OR (u.id = cr.user2_id AND cr.user1_id = $1)
    LEFT JOIN LATERAL (
      SELECT text, created_at
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
