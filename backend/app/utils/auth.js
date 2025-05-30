import crypto from "crypto";
import jwt from "jsonwebtoken";
import { promisify } from "util";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { salt, hashedPassword };
};

const verifyPassword = (password, salt, storedHash) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return hash === storedHash;
};

function generateTokens(account) {
  const data = {
    id: account.id,
    nickname: account.nickname,
  };
  return {
    accessToken: jwt.sign(
      { ...data, tokenType: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    ),
    refreshToken: jwt.sign(
      { id: account.id, tokenType: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    ),
  };
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const verifyToken = promisify(jwt.verify);

async function getUserFromToken(token) {
  try {
    const user = await verifyToken(token, process.env.JWT_SECRET);
    return user;
  } catch (e) {
    console.error("Access token invalid:", e.message);
    throw new Error("Invalid access token");
  }
}

exports = {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  getUserFromToken,
};
