import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

export default function useMsgToRoomHook(roomId, setRoomState) {
  // 실시간 메시지 수신 & 채팅 목록에 반영
  useEffect(() => {
    if (!roomId) return;

    const handleNewMsg = (insertedMsg) => {
      if (insertedMsg.room_id !== roomId) return;

      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.some((m) => m.id === insertedMsg.id)
          ? state.msgHistory // prevent inserting duplicate msg
          : [...state.msgHistory, insertedMsg],
      }));
    };
    socket.on("msgToRoom", handleNewMsg); // 메시지를 받는 이벤트가 발생함.
    console.log("📍Receiving event to handle new msg in front");

    return () => socket.off("msgToRoom", handleNewMsg);
  }, [setRoomState, roomId]);
}
