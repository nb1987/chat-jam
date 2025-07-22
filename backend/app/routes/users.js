import express from "express";
import {
  addFriend,
  exploreUsers,
  searchUserByEmail,
  searchUserByUsername,
  blockFriend,
  unblockFriend,
  isSenderBlocked,
  didUserBlockFriend,
  getUserFriends,
} from "../services/users-service.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/friends", authenticateToken, async (req, res) => {
  try {
    const friends = await getUserFriends(req.user.id);
    res.status(200).json(friends);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch a list of friends" });
  }
});

router.get("/explore", authenticateToken, async (req, res) => {
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

router.get(
  "/is-sender-blocked/:friendId",
  authenticateToken,
  async (req, res) => {
    try {
      const { friendId } = req.params;
      const result = await isSenderBlocked(req.user.id, friendId);
      res.status(200).json(result);
    } catch (err) {
      console.error("fetching error,", err.message);
      res.status(500).json({ error: "Failed to fetch blocked user status" });
    }
  }
);

router.get(
  "/did-sender-block-friend/:friendId",
  authenticateToken,
  async (req, res) => {
    try {
      const { friendId } = req.params;
      const result = await didUserBlockFriend(req.user.id, friendId);
      res.status(200).json(result);
    } catch (err) {
      console.error("fetching error,", err.message);
      res.status(500).json({ error: "Failed to fetch block status" });
    }
  }
);

router.post("/add-friend/:friendId", authenticateToken, async (req, res) => {
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

router.post("/block-friend/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    await blockFriend(req.user.id, friendId);

    res.status(201).json({ message: "Blocked the requested user." });
  } catch (err) {
    console.error("Failed to block the requested user:", err);

    res.status(500).json({
      error: "Internal server error. Could not block the user.",
    });
  }
});

router.delete(
  "/unblock-friend/:friendId",
  authenticateToken,
  async (req, res) => {
    try {
      const { friendId } = req.params;
      await unblockFriend(req.user.id, friendId);

      res.status(201).json({ message: "Unblocked the requested user." });
    } catch (err) {
      console.error("Failed to unblock the requested user:", err);

      res.status(500).json({
        error: "Internal server error. Could not unblock the requested user.",
      });
    }
  }
);

router.delete(
  "/remove-friend/:friendId",
  authenticateToken,
  async (req, res) => {
    try {
      const { friendId } = req.params;
      await removeFriend(req.user.id, friendId);

      res.status(201).json({ message: "Removed the requested user." });
    } catch (err) {
      console.error("Failed to remove the requested user:", err);

      res.status(500).json({
        error: "Internal server error. Could not remove the requested user.",
      });
    }
  }
);
export default router;
