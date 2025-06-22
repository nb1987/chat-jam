import { io } from "socket.io-client";

export const socket = io();

export const joinRoom = (roomId) => {
  socket.emit("joinRoom", roomId);
};

export const sendMsg = (roomId, msgString, senderId) => {
  socket.emit("sendMsg", { roomId, msgString, senderId });
};
