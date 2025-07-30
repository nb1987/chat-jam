import { insertMsg, updateMsgAsRead } from "./chat-service.js";
import { isSenderBlocked } from "./users-service.js";

// io: 카톡 본사 서버
// io.on("connection", ..} 의 뜻은
// 내가 로그인을 했고, (프론트에서 socket.connect() 실행함 )
// 본사 서버로 내 소켓이 연결 요청을 하자 "connection" 콜백 실행

export default function socketHandler(io) {
  const pendingLastMsgs = new Map();
  const timers = new Map();

  io.on("connection", (socket) => {
    console.log("📍Backend socket is connected: ", socket.id);

    socket.on("register", async (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`); // 개인 알림용 룸에 들어감.
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(`room_${roomId}`);
      console.log("📍Joined the chat room");
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(`room_${roomId}`);
    });

    // { id, room_id, user_id, friend_id, text, created_at, is_read } = insertedMsg
    socket.on("sendMsg", async ({ roomId, text, senderId, friendId }) => {
      try {
        const insertedMsg = await insertMsg(roomId, text, senderId, friendId);
        const senderIsBlocked = await isSenderBlocked(senderId, friendId);
        pendingLastMsgs.set(roomId, insertedMsg);

        if (!senderIsBlocked) {
          io.to(`room_${roomId}`).emit("messageToRoom", insertedMsg);
          io.to(`user_${friendId}`).emit("notifyMessage", insertedMsg);

          // need username, userImgSrc
          if (!timers.has(roomId)) {
            const timerId = setTimeout(() => {
              const last = pendingLastMsgs.get(roomId);
              // 객체에 이름을 붙여서 보낼 순 없을까
              // 내가 차단을 안 당했다면 채팅방 소속인 나와 상대의 chat 페이지도 동시에 업데이트
              io.to(`room_${roomId}`).emit("updateChatSummary", {
                room_id: last.room_id,
                lastMsg: last.text,
                lastMsgAt: last.created_at,
              });
              pendingLastMsgs.delete(roomId);
              timers.delete(roomId);
            }, 200);

            timers.set(roomId, timerId);
          }
        } else {
          socket.emit("msgToMe", insertedMsg); // chatRoom
          socket.emit("updateChatSummary", {
            id: friendId,
            lastMsg: last.text,
            lastMsgAt: last.created_at,
          }); // chat
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
          io.to(`room_${roomId}`).emit("receiveReadMsg", readMsg);
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
