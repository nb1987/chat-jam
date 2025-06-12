import express from "express";
import {
  addFriend,
  exploreUsers,
  searchUserByEmail,
  searchUserByUsername,
} from "../services/users-service.js";
import { authenticateToken } from "../mddleware/auth.middleware.js";

const router = express.Router();

router.get("/user/others", authenticateToken, async (req, res) => {
  try {
    const usersData = await exploreUsers(req.user.id);

    res.status(200).json(usersData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch users data" });
  }
});

// authenticateToken?
router.get("/search-by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const userData = await searchUserByEmail(email);

    res.status(200).json(userData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "User does not exist" });
  }
});

router.get("/search-by-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userData = await searchUserByUsername(username);

    res.status(200).json(userData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "User does not exist" });
  }
});

router.post("/user/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    await addFriend(req.user.id, friendId);

    res.status(201).json({ message: "Friend added" });
  } catch (err) {
    console.error("Failed to add friend:", err);

    res.status(500).json({
      error: "Internal server error. Could not add the user as a friend.",
    });
  }
});

export default router;
