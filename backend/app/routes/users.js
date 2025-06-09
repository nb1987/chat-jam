import express from "express";
import { addFriend, exploreUsers } from "../services/users-service.js";

const router = express.Router();

router.get("/:userId/others", async (req, res) => {
  try {
    const { userId } = req.params;
    const usersData = await exploreUsers(userId);

    res.status(200).json(usersData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch users data" });
  }
});

router.post("/:userId/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    await addFriend(userId, friendId);

    res.status(201).json({ message: "Friend added" });
  } catch (err) {
    console.error("Failed to add friend:", err);

    res.status(500).json({
      error: "Internal server error. Could not add the user as a friend.",
    });
  }
});

export default router;
