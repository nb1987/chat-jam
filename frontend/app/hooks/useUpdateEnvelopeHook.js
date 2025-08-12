import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

export default function useUpdateEnvelopeHook(setPage) {
  useEffect(() => {
    const handleReadMsg = ({ roomId }) => {
      setPage((state) => ({
        ...state,
        chatSummaries: state.chatSummaries.map((chat) =>
          chat.room_id === roomId ? { ...chat, lastMsgIsRead: true } : chat
        ),
      }));
    };

    socket.on("receiveReadMsg", handleReadMsg);

    return () => socket.off("receiveReadMsg", handleReadMsg);
  }, []);
}
