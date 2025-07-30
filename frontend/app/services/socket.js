import { io } from "socket.io-client";

export const socket = io(); // 내 카톡 앱, 로그인 후(App) 서버로 연결을 실행함

export const registerSocket = (socket, userId) => {
  if (socket.connected) {
    socket.emit("register", userId);
  } else {
    socket.once("connect", () => {
      socket.emit("register", userId);
    });
  }
};

export const joinRoom = (roomId) => {
  if (socket.connected) {
    socket.emit("joinRoom", roomId);
  } else {
    socket.once("connect", () => {
      socket.emit("joinRoom", roomId);
    });
  }
};
// socket.once (한 번만 실행하고 제거)

export const leaveRoom = (roomId) => {
  socket.emit("leaveRoom", roomId);
};

export const sendMsg = (roomId, text, senderId, friendId) => {
  socket.emit("sendMsg", { roomId, text, senderId, friendId });
};
