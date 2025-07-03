import pool from "../config/db.js";

export async function getUserFriends(userId) {
  const q = `
  SELECT u.id, u.username, u.userImgSrc AS "userImgSrc"
  FROM users u
  JOIN friends f ON 
    (u.id = f.user1_id AND f.user2_id = $1)
    OR (u.id = f.user2_id AND f.user1_id = $1)
  WHERE u.id != $1
  `;

  const result = await pool.query(q, [userId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

// exclude already-added users & self
export async function exploreUsers(userId) {
  const q = `
  SELECT id, username, userImgSrc AS "userImgSrc", city, state 
  FROM users u
  LEFT JOIN friends f
    ON (f.user1_id = $1 AND f.user2_id = u.id)
    OR (f.user2_id = $1 AND f.user1_id = u.id)
   WHERE u.id != $1 AND f.user1_id IS NULL
  `;

  const result = await pool.query(q, [userId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

export async function addFriend(userId, friendId) {
  const q = `
  INSERT INTO friends (user1_id, user2_id)
  VALUES ($1, $2)
  ON CONFLICT DO NOTHING
  `;

  await pool.query(q, [userId, friendId]);
  return { message: "Friend added" };
}

export async function searchUserByEmail(email) {
  const q = `
  SELECT id, username, userImgSrc AS "userImgSrc"
  FROM users 
  WHERE email = $1 
  `;

  const result = await pool.query(q, [email]);
  return Array.isArray(result.rows) ? result.rows[0] : null;
}

export async function searchUserByUsername(username) {
  const q = `
  SELECT id, username, userImgSrc AS "userImgSrc"
  FROM users 
  WHERE username = $1 
  `;

  const result = await pool.query(q, [username]);
  return Array.isArray(result.rows) ? result.rows[0] : null;
}
