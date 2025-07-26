import ChatService from "@frontend/services/chat.service";
import { useCallback } from "react";
import toast from "react-hot-toast";

// move `loadMoreMessages` logic from `ChatRoom`
export default function useChatHandlers({
  authContext,
  friendId,
  roomState,
  setRoomState,
  setShouldAutoScroll,
  setIsFetchMoreMsg,
  messageCursor,
  setMessageCursor,
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

  const PAGE_SIZE = 10;

  const loadMoreMessages = useCallback(async () => {
    const controller = new AbortController();
    const chatService = new ChatService(controller, authContext);
    try {
      setShouldAutoScroll(false);
      setIsFetchMoreMsg(true);

      const prevCursor = messageCursor; //

      const moreHistory = await chatService.getChatHistory(
        roomState.roomId,
        friendId,
        messageCursor
      );

      if (moreHistory.length < PAGE_SIZE) {
        setHasMoreChatHistory(false); // 더 가져올 메시지 없음
      }
      if (
        moreHistory.length > 0 &&
        prevCursor &&
        prevCursor.created_at ===
          moreHistory[moreHistory.length - 1].created_at &&
        prevCursor.id === moreHistory[moreHistory.length - 1].id
      )
        return;

      if (moreHistory.length > 0) {
        const oldest = moreHistory[moreHistory.length - 1]; // 업데이트 전 길이 체크
        setMessageCursor({ created_at: oldest.created_at, id: oldest.id });
      } // 커서 설정 전 null 체크

      setRoomState((state) => ({
        ...state,
        msgHistory: [...moreHistory.reverse(), ...state.msgHistory],
      }));
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while loading chat history");
      }
    } finally {
      setIsFetchMoreMsg(false);
    }
  }, [
    authContext,
    friendId,
    roomState,
    setRoomState,
    setShouldAutoScroll,
    setIsFetchMoreMsg,
    messageCursor,
    setMessageCursor,
    setHasMoreChatHistory,
  ]);

  return { onLocalMsgDelete, loadMoreMessages };
}
