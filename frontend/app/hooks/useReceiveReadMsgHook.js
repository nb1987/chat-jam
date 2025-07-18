import UnreadContext from "@frontend/contexts/unread-context";
import { socket } from "@frontend/services/socket";
import { useContext, useEffect } from "react";

// { id, is_read, user_id, friend_id, room_id } = readMsg
export default function useReceiveReadMsgHook(setRoomState, myId) {
  const { setUnreadCount } = useContext(UnreadContext);

  useEffect(() => {
    // 안 읽었다는 표시를 해제
    const handleReadMsg = (readMsg) => {
      const { id: readMsgId } = readMsg;

      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.map((m) =>
          m.id === readMsgId ? { ...m, is_read: true } : m
        ),
      }));
    };
    socket.on("receiveReadMsg", handleReadMsg);

    return () => socket.off("receiveReadMsg", handleReadMsg);
  }, [setRoomState, setUnreadCount, myId]);
}
