import ChatService from "@frontend/services/chat.service";
import { useCallback } from "react";
import toast from "react-hot-toast";

export default function useChatHandlers({
  authContext,
  friendId,
  roomState,
  setRoomState,
  setShouldAutoScroll,
  isFetchingMoreMsg,
  setIsFetchingMoreMsg,
  messageCursor,
  setMessageCursor,
  hasMoreChatHistory,
  setHasMoreChatHistory,
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

    if (!hasMoreChatHistory || isFetchingMoreMsg) return;

    try {
      setShouldAutoScroll(false);
      setIsFetchingMoreMsg(true);

      const { messages, nextCursor, hasMore } =
        await chatService.getChatHistory(
          roomState.roomId,
          friendId,
          messageCursor
        );

      setRoomState((state) => ({
        ...state,
        msgHistory: [...[...messages].reverse(), ...state.msgHistory],
      }));
      setHasMoreChatHistory(hasMore);
      setMessageCursor(nextCursor);
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while loading chat history");
      }
    } finally {
      setIsFetchingMoreMsg(false);
    }
  }, [
    authContext,
    friendId,
    roomState,
    setRoomState,
    setShouldAutoScroll,
    isFetchingMoreMsg,
    setIsFetchingMoreMsg,
    messageCursor,
    setMessageCursor,
    hasMoreChatHistory,
    setHasMoreChatHistory,
  ]);

  return { onLocalMsgDelete, loadMoreMessages };
}
