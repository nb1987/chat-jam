import { useCallback } from "react";

// move `loadMoreMessages` logic from `ChatRoom`
export default function useChatHandlers({ setRoomState }) {
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

  return { onLocalMsgDelete };
}
