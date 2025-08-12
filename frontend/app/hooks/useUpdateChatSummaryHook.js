import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

// id == 나와 대화하고 있는 유저의 아이디
export default function useUpdateChatSummaryHook(setPage) {
  useEffect(() => {
    const handleLastMsg = ({ id, lastMsg, lastMsgAt, lastMsgIsRead }) => {
      setPage((state) => {
        const updatedSummaries = state.chatSummaries.map((chat) =>
          chat.id === id ? { ...chat, lastMsg, lastMsgAt, lastMsgIsRead } : chat
        );
        updatedSummaries.sort(
          (a, b) => new Date(b.lastMsgAt) - new Date(a.lastMsgAt)
        );
        return { ...state, chatSummaries: updatedSummaries };
      });
    };

    socket.on("updateChatSummary", handleLastMsg);

    return () => {
      socket.off("updateChatSummary", handleLastMsg);
    };
  }, []);
}
