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
