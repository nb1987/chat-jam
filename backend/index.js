import "module-alias/register.js";

import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import "dotenv/config";

import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app); // create HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
}); // create Socket.IO server
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`🚩Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    // receive event from client
    io.emit("chat message", msg); // emit the message to client
  });
});

server.listen(PORT, () => {
  console.log(`🚩Server running on port ${PORT}`);
});
