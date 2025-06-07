import pool from "../config/db.js";
import Account from "../models/account.js";

export async function getHashedPassword(email) {
  const q = `
  SELECT password FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0] || null;
}

export async function getUserInfo(userId) {
  const q = `
  SELECT id, username, userImgSrc FROM users
  WHERE id = $1
  `;

  const result = await pool.query(q, [userId]);
  return result.rows[0];
}

export async function getUserInfoByEmail(email) {
  const q = `
  SELECT id, username, userImgSrc FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0];
}

export async function getUserFriends(userId) {
  const q = `
  SELECT u.id, u.username, u.userImgSrc 
  FROM users u
  JOIN friends f ON 
    (u.id = f.user1_id AND f.user2_id = $1)
    OR (u.id = f.user2_id AND f.user1_id = $1)
  WHERE u.id != $1
  `;

  const result = await pool.query(q, [userId]);
  return Array.isArray(result.rows) ? result.rows : [];
}

export async function createAccount(payload) {
  const account = Account.createAccount(payload);

  const q = `
    INSERT INTO users (username, email, password, userImgSrc, city, state)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
    `;

  const values = [
    account.username,
    account.email,
    account.passwordHash,
    account.userImgSrc,
    account.city,
    account.state,
  ];

  const result = await pool.query(q, values);
  return result.rows[0];
}
