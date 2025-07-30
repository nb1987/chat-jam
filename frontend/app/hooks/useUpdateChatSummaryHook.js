import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

export default function useUpdateChatSummaryHook(setPage) {
  useEffect(() => {
    const handleLastMsg = (id, lastMsg, lastMsgAt) => {
      setPage((state) => ({
        ...state,
        chatSummaries: state.chatSummaries.map((chat) =>
          chat.id === id ? { ...chat, lastMsg, lastMsgAt } : chat
        ),
      }));
    };

    socket.on("updateChatSummary", handleLastMsg);

    return () => socket.off("updateChatSummary", handleLastMsg);
  }, []);
}
