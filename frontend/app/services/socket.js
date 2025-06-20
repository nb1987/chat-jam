import { io } from "socket.io-client";

const httpServer = import.meta.env.VITE_BACKEND_URL;

export const socket = io(httpServer);

export const joinRoom = (roomId) => {
  socket.emit("joinRoom", roomId);
};

export const sendMsg = ({ roomId, msgString, senderId }) => {
  socket.emit("sendMsg", { roomId, msgString, senderId });
};

export const receiveMsg = (msgObj) => {
  socket.on("receiveMsg", msgObj);
};
// { senderId, text: msgString, createdAt: new Date().toLocaleTimeString()}
