import { insertMsg, updateMsgAsRead } from "./chat-service.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("Socket is connected: ", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMsg", async ({ roomId, text, senderId }) => {
      try {
        const insertedMsg = await insertMsg(roomId, text, senderId);
        io.to(roomId).emit("msgToRoom", insertedMsg);
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
