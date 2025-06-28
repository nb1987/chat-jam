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
  SELECT id, username, userImgSrc, city, state FROM users
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

export async function createAccount(payload, imageUrl) {
  const account = Account.createAccount(payload, imageUrl);

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

export async function editUserProfile(userId, trimmedInfo) {
  const userInfo = await getUserInfo(userId);

  const username = trimmedInfo.username || userInfo.username;
  const city = trimmedInfo.city || userInfo.city;
  const state = trimmedInfo.state || userInfo.state;
  const userImgSrc = trimmedInfo.imageUrl ?? userInfo.userImgSrc;

  const values = [username, city, state, userImgSrc, userId];

  const q = `
    UPDATE users 
    SET username = $1, city = $2, state = $3, userImgSrc = $4
    WHERE id = $5
  `;

  const result = await pool.query(q, values);
  return result.rows[0];
}
