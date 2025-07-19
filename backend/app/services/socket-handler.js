import { insertMsg, updateMsgAsRead } from "./chat-service.js";

// io: 카톡 본사 서버
// io.on("connection", (socket) => {..}
// 내가 앱으로 접속하면 본사 서버로 연결 요청을 한 것, "connection" 콜백 실행

export default function socketHandler(io) {
  // 내 소켓 아이디를 저장, `userSocketMap[userId] = socket.id`
  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    console.log("📍Backend socket is connected: ", socket.id);

    socket.on("register", async (userId) => {
      userSocketMap.set(userId, socket.id);
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log("📍Joined the chat room");
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });

    //프론트에서 내가 메시지를 보냈고, DB에 저장함
    // { id, room_id, user_id, text, created_at, friend_id, is_read } = insertedMsg
    socket.on("sendMsg", async ({ roomId, text, senderId, friendId }) => {
      try {
        const receiverSocketId = userSocketMap.get(friendId);
        const insertedMsg = await insertMsg(roomId, text, senderId, friendId);

        socket.emit("msgToMe", insertedMsg); // 나에게 보내서 UI 업데이트

        // 친구가 소켓 연결이 된 상태(로그인을 함)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("msgToFriend", insertedMsg);
        }
      } catch (err) {
        console.error("Failed to insert message:", err.message);
        socket.emit("msgError", {
          code: "INSERT_FAILED",
          message: "Failed to send message",
        });
      }
    });

    socket.on("sendUnreadMsg", async ({ unreadMsgIds, roomId }, callback) => {
      try {
        const updatedMsgs = await updateMsgAsRead(unreadMsgIds, roomId);
        updatedMsgs.map((readMsg) => {
          io.to(roomId).emit("receiveReadMsg", readMsg);
        });
        callback({ success: true });
      } catch (err) {
        console.error("Failed while receiving messages:", err.message);
        callback({ success: false });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}
