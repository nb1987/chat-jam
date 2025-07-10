import { io } from "socket.io-client";

export const socket = io(); // 내 스마트폰의 카카오톡 앱

export const joinRoom = (roomId) => {
  if (socket.connected) {
    socket.emit("joinRoom", roomId);
    console.log("📍`joinRoom` event emitted in front");
  } else {
    socket.once("connect", () => {
      socket.emit("joinRoom", roomId);
      console.log("📍`joinRoom` event emitted after socket connect in front");
    });
  }
};
// socket.once (한 번만 실행하고 제거)

export const leaveRoom = (roomId) => {
  socket.emit("leaveRoom", roomId);
  console.log("📍`leaveRoom` event emitted in front");
};

export const sendMsg = (roomId, text, senderId) => {
  socket.emit("sendMsg", { roomId, text, senderId });
  console.log("📍Emitting event to send msg in front");
};
