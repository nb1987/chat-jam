import pool from "../config/db.js";

export async function getAllUsersExceptSelf(userId) {
  const q = `
  SELECT id, username, userImgSrc, city, state 
  FROM users
  WHERE id != $1
  `;

  const result = await pool.query(q, [userId]);

  return Array.isArray(result.rows) ? result.rows : [];
}
