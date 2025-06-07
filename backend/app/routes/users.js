import express from "express";
import { getAllUsersExceptSelf } from "../services/users-service.js";

const router = express.Router();

router.get("/:userId/others", async (req, res) => {
  try {
    const { userId } = req.params;
    const usersData = await getAllUsersExceptSelf(userId);

    res.status(200).json(usersData);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch users data" });
  }
});

export default router;
