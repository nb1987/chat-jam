import { useContext, useEffect, useMemo } from "react";
import UnreadContext from "@frontend/contexts/unread-context";
import { socket } from "@frontend/services/socket";
import { useRetrySendingUnreadHook } from "@frontend/hooks/useRetrySendingUnreadHook";

// DB에 아직 읽지않은 메시지로 된 아이디 목록을 계산해놓음,
// useMemo에서 반환하는 값을 매번 계산하는 것을 피함.
export default function useEmitUnreadMsgHook(msgHistory, roomId, myId) {
  const { setUnreadCount } = useContext(UnreadContext);
  const { addToRetryQueue } = useRetrySendingUnreadHook(socket);

  const unreadMsgIds = useMemo(() => {
    return msgHistory
      .filter((msg) => !msg.is_read && msg.user_id !== myId)
      .map((msg) => msg.id);
  }, [msgHistory, myId]);
  // 상대방이 나한테 메시지를 보냈고, 이제 챗방에서 내가 읽었음.
  // 상대방이 보내준 메시지를 서버에게 읽었다고 알려야함.

  useEffect(() => {
    if (!roomId || unreadMsgIds.length === 0) return;

    if (roomId && unreadMsgIds.length > 0) {
      const numOfUnreadMsgs = unreadMsgIds.length;

      setUnreadCount((count) => ({
        ...count,
        [roomId]: Math.max((count[roomId] || 0) - numOfUnreadMsgs, 0),
      }));

      socket.emit("sendUnreadMsg", { unreadMsgIds, roomId }, (res) => {
        if (!res.success) {
          addToRetryQueue(unreadMsgIds, roomId);
        } // 서버 응답이 실패시 재시도 큐에 추가"
      });
    }
  }, [unreadMsgIds, roomId, msgHistory, setUnreadCount, addToRetryQueue]);
}
