import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  removeSubscription,
  saveSubscription,
} from "../services/push-service.js";

const router = express.Router();

// 구독 저장
router.post("/subscribe", authenticateToken, (req, res) => {
  const { subscription } = req.body || {};
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "invalid payload" });
  }
  saveSubscription(req.user.id, subscription);
  return res.sendStatus(201);
});

// 구독 해제
router.post("/unsubscribe", authenticateToken, (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) {
    return res.status(400).json({ error: "invalid payload" });
  }
  removeSubscription(req.user.id, endpoint);
  return res.sendStatus(204);
});

export default router;
