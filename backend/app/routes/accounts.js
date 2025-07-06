import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { storage } from "../config/cloudinary.js";
import {
  createAccount,
  getUserInfo,
  getUserInfoByEmail,
  getHashedPassword,
  editUserProfile,
  insertResetToken,
  getUserByResetToken,
  updateWithNewPassword,
  changeWithNewPassword,
  deleteAccount,
} from "../services/account-service.js";
import { getUserFriends } from "../services/users-service.js";
import {
  generateTokens,
  getUserFromToken,
  hashPassword,
  verifyPassword,
} from "../utils/auth.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { sendPasswordResetEmail } from "../utils/reset-password.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/signup", upload.single("userImgSrc"), async (req, res) => {
  try {
    const payload = req.body;
    const userImgSrc = req.file?.path || null;
    const createdUser = await createAccount(payload, userImgSrc);

    const tokens = generateTokens({ id: createdUser.id });

    res.status(201).json({
      message: "Account created successfully",
      id: createdUser.id,
      tokenPair: tokens,
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

      res.status(200).json({
        message: "Logged in successfully",
        id: loggedInUser.id,
        tokenPair: tokens,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error,", err.message);
    res.status(500).json({ error: "Failed to log in" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const user = await getUserInfoByEmail(req.body.email);
    const token = randomUUID();

    if (user) {
      await insertResetToken(user.id, {
        password_reset_token: token,
        password_reset_requested_at: new Date(),
      });
      const resetLink = `${req.get("origin")}/update-password?token=${token}`;
      await sendPasswordResetEmail(req.body.email, user.username, resetLink);
      res.sendStatus(204);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(401);
  }
});

// user forgot the password & updating pw
router.post("/update-password", async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    const user = await getUserByResetToken(resetToken);

    if (!user) {
      return res.status(400).json({ error: "User is not found" });
    }

    const requestedAt = new Date(user.password_reset_requested_at);
    const fiveMinsAgo = new Date(Date.now() - 60 * 5 * 1000);
    if (requestedAt < fiveMinsAgo) {
      return res.status(410).json({
        error: "Verification link has expired. Please request a new one.",
      });
    }

    const hashedPw = hashPassword(password);
    const loggedInUser = await updateWithNewPassword(user.id, {
      password: hashedPw,
      password_reset_token: null,
      password_reset_requested_at: null,
    });

    const tokens = generateTokens({ id: user.id });

    res.status(200).json({
      message: "Logged in successfully",
      id: loggedInUser.id,
      tokenPair: tokens,
    });
  } catch (err) {
    console.error("Error during password update:", err);
    res.sendStatus(401);
  }
});

// account setting page
router.patch("/change-password", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    const hashedPw = hashPassword(password);
    await changeWithNewPassword(req.user.id, hashedPw);

    res.status(201).json({
      message: "Updated password successfuly",
    });
  } catch (err) {
    console.error("Error during password update:", err);
    res.sendStatus(401);
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
      const userImgSrc = req.file?.path || null;

      const trimmedInfo = {
        username: username.trim(),
        city: city.trim(),
        state,
        userImgSrc,
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

router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    await deleteAccount(req.user.id);
    res.sendStatus(204);
  } catch (err) {
    console.error("account deletion error,", err.message);
    res.status(500).json({ error: "Failed to delete the requested account" });
  }
});

export default router;
