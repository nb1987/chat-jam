import express from "express";
import {
  countUnreadMsg,
  deleteMessage,
  fetchChatRoomHistory,
  getChatSummaries,
  getOrCreateRoomId,
} from "../services/chat-service.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/history/:roomId", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const offset = parseInt(req.query.offset) || 0;
    const history = await fetchChatRoomHistory(roomId, offset);
    res.status(200).json(history);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.get("/chat-summaries", authenticateToken, async (req, res) => {
  try {
    const chatSummaries = await getChatSummaries(req.user.id);
    res.status(200).json(chatSummaries);
  } catch (err) {
    console.error("message error,", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch friends with chat history" });
  }
});

router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const count = await countUnreadMsg(req.user.id);
    res.status(200).json(count);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: "Failed to count unread messages" });
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

router.patch(
  "/delete-message/:messageId",
  authenticateToken,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const deletedMsg = await deleteMessage(messageId);
      res.status(201).json(deletedMsg);
    } catch (err) {
      console.error("delete error,", err.message);
      res.status(500).json({ error: "Failed to delete the requested message" });
    }
  }
);

export default router;
