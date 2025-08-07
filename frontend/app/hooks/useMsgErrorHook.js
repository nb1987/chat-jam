import { socket } from "@frontend/services/socket";
import { useEffect } from "react";
import { updateMessageStatus } from "@frontend/localforage/messageStore";

export default function useMsgErrorHook(setLocalMsgs) {
  useEffect(() => {
    const handleMsgEror = (pendingMsg) => {
      updateMessageStatus(pendingMsg.id, "failed");

      setLocalMsgs((state) =>
        state.map((msg) =>
          msg.map(msg.id === pendingMsg.id ? { ...msg, status: "failed" } : msg)
        )
      );
    };

    socket.on("msgInsertError", handleMsgEror);

    return () => socket.off("msgInsertError", handleMsgEror);
  }, []);
}
// localMsgs는 'pending' 혹은 'sent' 두 가지로만 존재함.
// 서버에 저장이 안 되었다면 'pending'인 상태로 되돌아온 것인데
// 또 'pending' 이라고 고쳐야 할까? 서버에서 그냥 메시지 객체만 보내도 되는 거 아닐까
