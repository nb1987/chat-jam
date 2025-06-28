import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

import {
  createAccount,
  getUserInfo,
  getUserInfoByEmail,
  getHashedPassword,
  editUserProfile,
} from "../services/account-service.js";
import { getUserFriends } from "../services/users-service.js";
import {
  generateTokens,
  getUserFromToken,
  verifyPassword,
} from "../utils/auth.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/signup", upload.single("userImgSrc"), async (req, res) => {
  try {
    const payload = req.body;
    const file = req.file;
    let imageUrl = file?.secure_url || file?.url || null;
    const createdUser = await createAccount(payload, imageUrl);

    const tokens = generateTokens({ id: createdUser.id });
    res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Account created successfully",
      id: createdUser.id,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    console.error("Signup error,", err.message);
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { password: storedPassword } = await getHashedPassword(email.trim());

    if (!storedPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let salt, hashedPassword;
    try {
      ({ salt, hashedPassword } = JSON.parse(storedPassword));
    } catch (err) {
      console.error("Failed to parse password in DB", err.message);
      return res.status(500).json({ error: "Failed to process login" });
    }

    if (!hashedPassword) {
      res.send(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = verifyPassword(password, salt, hashedPassword);

    if (passwordMatches) {
      const loggedInUser = await getUserInfoByEmail(email.trim());
      const tokens = generateTokens({ id: loggedInUser.id });

      res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Logged in successfully",
        id: loggedInUser.id,
        accessToken: tokens.accessToken,
      });
    }
  } catch (err) {
    console.error("Login error,", err.message);
    res.status(500).json({ error: "Failed to log in" });
  }
});

router.post("/refresh-tokens", async (req, res) => {
  try {
    const user = await getUserFromToken(req.body.refreshToken);
    const userInfo = await getUserInfo(user.id);

    if (userInfo) {
      const tokens = generateTokens({ id: userInfo.id });
      res.json(tokens);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(401);
  }
});

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userData = await getUserInfo(req.user.id);
    res.status(200).json(userData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

router.get("/user/friends", authenticateToken, async (req, res) => {
  try {
    const friends = await getUserFriends(req.user.id);
    res.status(200).json(friends);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch a list of friends" });
  }
});

router.patch(
  "/edit-profile",
  authenticateToken,
  upload.single("userImgSrc"),
  async (req, res) => {
    try {
      const { username, city, state } = req.body;
      const file = req.file;
      console.log("req.file: uploaded in cloudinary", file);

      let imageUrl = file?.secure_url || file?.url || null;

      const trimmedInfo = {
        username: username.trim(),
        city: city.trim(),
        state,
        imageUrl,
      };
      const updatedInfo = await editUserProfile(req.user.id, trimmedInfo);
      res.status(200).json(updatedInfo);
    } catch (err) {
      console.error(
        "error from updating user info,",
        err.stack || err.message || err
      );

      if (err.message.includes("duplicate key")) {
        return res.status(400).json({ error: "Username already taken" });
      }

      res.status(500).json({ error: "Failed to update user info" });
    }
  }
);

export default router;
