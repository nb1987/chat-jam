import express from "express";
import {
  countUnreadMsg,
  deleteChatRoom,
  deleteMessage,
  fetchChatRoomHistory,
  getChatSummaries,
  getOrCreateRoomId,
} from "../services/chat-service.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/history/:roomId/:friendId",
  authenticateToken,
  async (req, res) => {
    try {
      const { roomId, friendId } = req.params;
      const cursor =
        req.query?.cursor === "undefined" ? null : req.query?.cursor;
      const cursorId =
        req.query?.cursorId === "undefined" ? null : req.query?.cursorId;

      const history = await fetchChatRoomHistory(
        req.user.id,
        roomId,
        friendId,
        cursor,
        cursorId
      );
      res.status(200).json(history);
    } catch (err) {
      console.error("fetching error,", err.message);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  }
);

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

router.delete("/exit/:roomId", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    await deleteChatRoom(roomId);
    res.status(204);
  } catch (err) {
    console.error("chatRoom deletion error,", err.message);
    res.status(500).json({ error: "Failed to exit the requested chat" });
  }
});

export default router;
