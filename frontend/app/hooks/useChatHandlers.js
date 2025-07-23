import ChatService from "@frontend/services/chat.service";
import { useCallback } from "react";
import toast from "react-hot-toast";

// move `loadMoreMessages` logic from `ChatRoom`
export default function useChatHandlers({
  setRoomState,
  authContext,
  setShouldAutoScroll,
  setFetchMoreMsg,
  defaultPage,
  roomState,
  setDefaultPage,
}) {
  const onLocalMsgDelete = useCallback(
    (msgId) => {
      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.map((m) =>
          m.id === msgId ? { ...m, deletedAt: new Date().toISOString() } : m
        ),
      }));
    },
    [setRoomState]
  );

  const loadMoreMessages = useCallback(async () => {
    const controller = new AbortController();
    const chatService = new ChatService(controller, authContext);
    try {
      setShouldAutoScroll(false);
      setFetchMoreMsg(true);
      const offset = (defaultPage + 1) * 50;
      const moreHistory = await chatService.getChatHistory(
        roomState.roomId,
        offset
      );

      setRoomState((state) => ({
        ...state,
        msgHistory: [
          ...moreHistory.sort((a, b) =>
            a.created_at === b.created_at
              ? a.id - b.id
              : a.created_at - b.created_at
          ),
          ...state.msgHistory,
        ],
      }));
      setDefaultPage((page) => page + 1);
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while loading chat history");
      }
    } finally {
      setFetchMoreMsg(false);
    }
  }, [
    authContext,
    setShouldAutoScroll,
    setFetchMoreMsg,
    defaultPage,
    roomState,
    setDefaultPage,
    setRoomState,
  ]);

  return { onLocalMsgDelete, loadMoreMessages };
}
