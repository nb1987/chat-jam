import { insertMsg, updateMsgAsRead } from "./chat-service.js";

// io: 카톡 본사 서버
// io.on("connection", (socket) => {..}
// 내가 앱으로 접속하면 본사 서버로 연결 요청을 한 것, "connection" 콜백 실행

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("📍Socket is connected: ", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log("📍Joined the chat room");
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log("📍Left the chat room");
    });

    socket.on("sendMsg", async ({ roomId, text, senderId }) => {
      try {
        const insertedMsg = await insertMsg(roomId, text, senderId);
        io.to(roomId).emit("msgToRoom", insertedMsg);
        console.log("📍Emitting `msgToRoom` to front after saving in db");
      } catch (err) {
        console.error("Failed to insert message:", err.message);
        socket.emit("msgError", {
          code: "INSERT_FAILED",
          message: "Failed to send message",
        });
      }
    });

    socket.on("sendUnreadMsg", async ({ unreadMsgIds, roomId }) => {
      try {
        const updatedMsgs = await updateMsgAsRead(unreadMsgIds, roomId);
        updatedMsgs.map((msg) => {
          io.to(roomId).emit("receiveReadMsg", msg.id);
          console.log(
            "📍Emitting `receiveReadMsg to front after updating in db"
          );
        });
      } catch (err) {
        console.error("Failed while receiving messages:", err.message);
        socket.emit("msgError", {
          code: "MARK_AS_READ_FAILED",
          message: "Read confirmation failed.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}
