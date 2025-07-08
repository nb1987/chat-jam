import { socket } from "@frontend/services/socket";
import { useEffect, useMemo } from "react";

// 읽지않은 메시지 목록을 계산해놓음,
// useMemo에서 반환하는 값을 매번 계산하는 것을 피함.
export default function useEmitUnreadMsgHook(msgHistory, roomId, myId) {
  const unreadMsgIds = useMemo(() => {
    return msgHistory
      .filter((msg) => !msg.is_read && msg.user_id !== myId)
      .map((msg) => msg.id);
  }, [msgHistory, myId]);
  // 상대방이 나한테 메시지를 보냈고, 내가 읽었음.
  // 상대방이 보내준 메시지를 서버에게 읽었다고 알려야함.

  useEffect(() => {
    if (roomId && unreadMsgIds.length > 0) {
      socket.emit("sendUnreadMsg", { unreadMsgIds, roomId });
    }

    // return () => socket.off("markAsRead"); 보내는 쪽은 이벤트 해제가 필요없음.
  }, [unreadMsgIds, roomId, msgHistory]);
}
