import { socket } from "@frontend/services/socket";
import { useEffect, useContext } from "react";
import SocketContext from "@frontend/contexts/socket-context";

export default function useMsgToRoomHook(roomId, setRoomState) {
  const { setUnreadCount } = useContext(SocketContext);

  // 실시간 메시지 수신 & 채팅 목록에 반영
  useEffect(() => {
    if (!roomId) return;

    const handleNewMsg = (insertedMsg) => {
      if (insertedMsg.room_id !== roomId) {
        setUnreadCount((count) => count + 1);
        return;
      }
      // 내가 속한 채팅방이 아니라면 메시지 수신을 하면 안 됨.
      // 다른 방에서 메시지가 도착함 => 아직 안 읽은 메시지의 숫자가 올라감

      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.some((m) => m.id === insertedMsg.id)
          ? state.msgHistory // prevent inserting duplicate msg
          : [...state.msgHistory, insertedMsg],
      }));
    };
    socket.on("msgToRoom", handleNewMsg); // 메시지를 받는 이벤트가 발생함.

    return () => socket.off("msgToRoom", handleNewMsg);
  }, [setRoomState, roomId]);
}
