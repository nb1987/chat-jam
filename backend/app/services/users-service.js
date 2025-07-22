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

export async function isSenderBlocked(senderId, receiverId) {
  const q = `
    SELECT 1
    FROM blocked_users
    WHERE blocked_id = $1 AND blocker_id = $2
  `;
  const result = await pool.query(q, [senderId, receiverId]);
  return result.rowCount > 0;
}

export async function didUserBlockFriend(senderId, receiverId) {
  const q = `
    SELECT 1
    FROM blocked_users
    WHERE blocker_id = $1 AND blocked_id = $2
  `;
  const result = await pool.query(q, [senderId, receiverId]);
  return result.rowCount > 0;
}

// 나를 차단한 친구들 목록
export async function getIdsWhoBlockedUser(userId) {
  const q = `
    SELECT blocker_id
    FROM blocked_users
    WHERE blocked_id = $1
  `;
  const result = await pool.query(q, [userId]);
  return result.rows.map((row) => row.blocker_id);
}

export async function blockFriend(userId, friendId) {
  const q = `
  INSERT INTO blocked_users (blocker_id, blocked_id)
  VALUES ($1, $2)
  `;
  try {
    await pool.query(q, [userId, friendId]);
    return { message: "Blocked the requested user." };
  } catch (err) {
    console.error(err);
    return { error: "Failed to block user." };
  }
}

export async function unblockFriend(userId, friendId) {
  const q = `
  DELETE FROM blocked_users 
  WHERE blocker_id = $1 AND blocked_id = $2
  `;
  try {
    await pool.query(q, [userId, friendId]);
    return { message: "Blocked the requested user." };
  } catch (err) {
    console.error(err);
    return { message: "Unblocked the requested user." };
  }
}

export async function removeFriend(userId, friendId) {
  const q = `
    DELETE FROM friends
    WHERE (user1_id = $1 AND user2_id = $2)
       OR (user1_id = $2 AND user2_id = $1)
  `;
  try {
    await pool.query(q, [userId, friendId]);
    return { message: "Removed the requested user." };
  } catch (err) {
    console.error(err);
    return { message: "Failed to remove the requested user." };
  }
}
