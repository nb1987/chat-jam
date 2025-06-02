import express from "express";
import { createAccount } from "../services/account-service.js";
import { generateTokens } from "../utils/auth.js";

const router = express.Router();

router.post("/accounts/signup", async (req, res) => {
  try {
    const payload = req.body;
    const createdUser = await createAccount(payload);

    const tokens = generateTokens({ id: createdUser.id });

    res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
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

export default router;
