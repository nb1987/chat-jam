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
  SELECT id, username, userImgSrc AS "userImgSrc", city, state FROM users
  WHERE id = $1
  `;

  const result = await pool.query(q, [userId]);
  return result.rows[0];
}

export async function getUserInfoByEmail(email) {
  const q = `
  SELECT id, username, userImgSrc AS "userImgSrc" FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0];
}

export async function getUserByResetToken(token) {
  const q = `
  SELECT id, username, userImgSrc AS "userImgSrc", password_reset_requested_at FROM users
  WHERE password_reset_token = $1
  `;

  const result = await pool.query(q, [token]);
  return result.rows[0];
}

// userImgSrc is returned as 'userimgsrc'
export async function createAccount(payload, imageUrl) {
  const account = Account.createAccount(payload, imageUrl);

  const q = `
    INSERT INTO users (username, email, password, userImgSrc, city, state)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, userImgSrc AS "userImgSrc"
    `;

  const values = [
    account.username,
    account.email,
    account.passwordHash,
    account.userImgSrc ?? null,
    account.city,
    account.state,
  ];

  const result = await pool.query(q, values);
  return result.rows[0];
}

// userImgSrc is returned as 'userimgsrc'
export async function updateWithNewPassword(userId, payload) {
  const values = [
    payload.password,
    payload.password_reset_token,
    payload.password_reset_requested_at,
    userId,
  ];

  const q = `
    UPDATE users 
    SET password = $1, password_reset_token = $2, password_reset_requested_at = $3
    WHERE id = $4
    RETURNING id, username, userImgSrc AS "userImgSrc"
  `;

  const result = await pool.query(q, values);
  return result.rows[0];
}

export async function changeWithNewPassword(userId, hashedPw) {
  const values = [hashedPw, userId];

  const q = `
    UPDATE users 
    SET password = $1
    WHERE id = $2
    RETURNING id
  `;

  const result = await pool.query(q, values);
  return result.rows[0];
}

// userImgSrc is returned as 'userimgsrc'
export async function editUserProfile(userId, trimmedInfo) {
  const userInfo = await getUserInfo(userId);

  const username = trimmedInfo.username || userInfo.username;
  const city = trimmedInfo.city || userInfo.city;
  const state = trimmedInfo.state || userInfo.state;
  const userImgSrc = trimmedInfo.userImgSrc ?? userInfo.userImgSrc;

  const values = [username, city, state, userImgSrc, userId];

  const q = `
    UPDATE users 
    SET username = $1, city = $2, state = $3, userImgSrc = $4
    WHERE id = $5
    RETURNING id, username, userImgSrc AS "userImgSrc"
  `;

  await pool.query(q, values);
}

// userImgSrc is returned as 'userimgsrc'
export async function insertResetToken(userId, accountPayload) {
  const values = [
    accountPayload.password_reset_token,
    accountPayload.password_reset_requested_at,
    userId,
  ];

  const q = `
    UPDATE users 
    SET password_reset_token = $1, password_reset_requested_at = $2
    WHERE id = $3
    RETURNING id, username, userImgSrc AS "userImgSrc"
  `;

  const result = await pool.query(q, values);
  return result.rows[0];
}

export async function deleteAccount(userId) {
  const q = `
    DELETE FROM users 
    WHERE id = $1
  `;

  await pool.query(q, [userId]);
}
