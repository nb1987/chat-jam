import { useContext, useEffect } from "react";
import { socket } from "@frontend/services/socket";
import UnreadContext from "@frontend/contexts/unread-context";
import CurrentRoomContext from "@frontend/contexts/current-room-context";

export default function useGlobalMsgListenerHook() {
  const { unreadCount, setUnreadCount } = useContext(UnreadContext);
  const { currentRoomId } = useContext(CurrentRoomContext);

  useEffect(() => {
    const handleGlobalUnreadCount = (insertedMsg) => {
      if (insertedMsg.room_id !== currentRoomId) {
        setUnreadCount((count) => {
          const currentCount = count[insertedMsg.room_id] || 0;
          return {
            ...count,
            [insertedMsg.room_id]: currentCount + 1,
          };
        });
      }
    };

    socket.on("msgToFriend", handleGlobalUnreadCount);
    return () => socket.off("msgToFriend", handleGlobalUnreadCount);
  }, [setUnreadCount, currentRoomId]);
}
