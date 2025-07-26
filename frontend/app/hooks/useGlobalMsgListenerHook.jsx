import { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { socket } from "@frontend/services/socket";
import UnreadContext from "@frontend/contexts/unread-context";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import NewMessageAlert from "@frontend/components/notifications/NewMessageAlert";

export default function useGlobalMsgListenerHook() {
  const { setUnreadCount } = useContext(UnreadContext);
  const { currentRoomId } = useContext(CurrentRoomContext);

  useEffect(() => {
    const handleGlobalUnreadCount = (insertedMsg) => {
      if (insertedMsg.room_id !== currentRoomId)
        setUnreadCount((count) => {
          const currentCount = count[insertedMsg.room_id];
          return {
            ...count,
            [insertedMsg.room_id]: (currentCount || 0) + 1,
          };
        });

      toast.custom(
        (t) => (
          <div className={t.visible ? "animate-enter" : "animate-leave"}>
            <NewMessageAlert />
          </div>
        ),
        { duration: 3000 }
      );
    };

    socket.on("msgToFriend", handleGlobalUnreadCount);
    return () => socket.off("msgToFriend", handleGlobalUnreadCount);
  }, [setUnreadCount, currentRoomId]);
}
