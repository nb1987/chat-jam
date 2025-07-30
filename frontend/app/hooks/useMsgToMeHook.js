import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

export default function useMsgToMeHook(roomId, setRoomState) {
  useEffect(() => {
    if (!roomId) return;

    const handleNewMsg = (insertedMsg) => {
      setRoomState((state) => ({
        ...state,
        msgHistory:
          !insertedMsg?.id ||
          state.msgHistory.some((m) => m.id === insertedMsg.id)
            ? state.msgHistory // prevent inserting duplicate msg
            : [...state.msgHistory, insertedMsg],
      }));
    };

    socket.on("msgToMe", handleNewMsg); // 메시지를 받는 이벤트가 발생함.

    return () => socket.off("msgToMe", handleNewMsg);
  }, [roomId, setRoomState]);
}
