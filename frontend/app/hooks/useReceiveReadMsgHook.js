import UnreadContext from "@frontend/contexts/unread-context";
import { socket } from "@frontend/services/socket";
import { useContext, useEffect } from "react";

export default function useReceiveReadMsgHook(setRoomState, myId) {
  const { setUnreadCount } = useContext(UnreadContext);

  useEffect(() => {
    // 안 읽었다는 표시를 해제
    const handleReadMsg = ({ roomId, ids }) => {
      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.map((m) =>
          m.room_id === roomId && ids.includes(m.id)
            ? { ...m, is_read: true }
            : m
        ),
      }));
    };
    socket.on("receiveReadMsg", handleReadMsg);

    return () => socket.off("receiveReadMsg", handleReadMsg);
  }, [setRoomState, setUnreadCount, myId]);
}
