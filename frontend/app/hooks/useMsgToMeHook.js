import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

// msg that I sent to friend is saved in DB and came back to me
// to update my UI.
export default function useMsgToMeHook(roomId, setRoomState) {
  // 내가 보낸 메시지가 db에 저장되어 돌아옴 => UI 업데이트

  useEffect(() => {
    if (!roomId) return;

    const handleNewMsg = (insertedMsg) => {
      console.log("📌insertedMsg received in useMsgToMeHook:", insertedMsg);

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
