import pool from "../config/db.js";
import Account from "../models/account.js";

export async function getAccount(id) {
  const q = `
  SELECT(*) FROM users
  WHERE id = $1
  `;

  const result = await pool.query(q, [id]);

  if (result.rows.length > 0) {
    return Account.createAccount(result.rows[0]); // return Account instance
  }
  return null;
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
