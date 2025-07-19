import UnreadContext from "@frontend/contexts/unread-context";
import { socket } from "@frontend/services/socket";
import { useContext, useEffect } from "react";

// { id, room_id, user_id, text, created_at, friend_id, is_read }
export default function useRefreshChatSummaryHook() {
  const { setUnreadCount } = useContext(UnreadContext);

  useEffect(() => {
    const handleNewMsg = (insertedMsg) => {
      setUnreadCount((count) => {
        const currentCount = count[insertedMsg.room_id] || 0;
        return {
          ...count,
          [insertedMsg.room_id]: currentCount + 1,
        };
      });
    };

    socket.on("msgToFriend", handleNewMsg);

    return () => socket.off("msgToFriend", handleNewMsg);
  }, [setUnreadCount]);
}

//   count = {
//     101: 2,
//     103: 5
//   };
