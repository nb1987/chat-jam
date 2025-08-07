import { updateMessageStatus } from "@frontend/localforage/messageStore";
import { sendMsg } from "@frontend/services/socket";

export async function sendLocalMsg(pendingMsgInfo, setLocalMsgs) {
  try {
    const { tempId, serverId, serverCreatedAt } = await sendMsg(pendingMsgInfo); // sendMsg()로 반환된 Promise가 완료될 때까지 기다림

    updateMessageStatus(tempId, "sent", serverId, serverCreatedAt); // 로컬 DB 업데이트

    setLocalMsgs(
      (prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: serverId,
                status: "sent",
                created_at: serverCreatedAt,
              }
            : msg
        ) // UI 업데이트
    );
  } catch ({ tempId }) {
    updateMessageStatus(tempId, "failed");
    setLocalMsgs((prev) =>
      prev.map((msg) =>
        msg.id === tempId ? { ...msg, status: "failed" } : msg
      )
    );
  }
}
