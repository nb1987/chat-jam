import { useEffect, useRef } from "react";

// filter()는 조건이 맞는 것만 골라냄.
// true일 때만 배열에 남기고, false면 제거함.
export function useRetrySendingUnreadHook(socket) {
  const retryQueue = useRef([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (retryQueue.current.length === 0) return;

      retryQueue.current = retryQueue.current.filter((item) => {
        if (item.numOfRetry > 3) {
          return false; // 빈 배열이 됨 => 재시도 안 함
        }

        socket.emit(
          "sendUnreadMsg",
          {
            unreadMsgIds: item.unreadMsgIds,
            roomId: item.roomId,
          },
          (res) => {
            if (!res.success) {
              item.numOfRetry += 1; // 재시도의 기회를 한번 더 줌.
            }
          }
        );

        return true; // 빈 배열로 만들지 않고 그대로 남겨놓음.
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const addToRetryQueue = (unreadMsgIds, roomId) => {
    retryQueue.current.push({
      unreadMsgIds,
      roomId,
      numOfRetry: 1,
    });
  };

  return { addToRetryQueue };
}
