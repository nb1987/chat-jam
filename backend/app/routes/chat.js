import express from "express";
import {
  fetchChatRoomHistory,
  getOrCreateRoomId,
} from "../services/chat-service.js";
import { authenticateToken } from "../mddleware/auth.middleware.js";

const router = express.Router();

router.get("/history/:roomId", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const history = await fetchChatRoomHistory(roomId);
    res.status(200).json(history);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.get("/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const roomId = await getOrCreateRoomId(req.user.id, friendId);
    res.status(200).json(roomId);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to get room id" });
  }
});

// router.post("/insert-msg", authenticateToken, async (req, res) => {
//   try {
//     const { roomId, text, senderId, createdAt } = req.body;
//     const insertedMsgObj = await insertMsg(roomId, text, senderId, createdAt);
//     res.status(201).json(insertedMsgObj);
//   } catch (err) {
//     console.error("message error,", err.message);
//     res.status(500).json({ error: "Failed to insert message" });
//   }
// });

export default router;
