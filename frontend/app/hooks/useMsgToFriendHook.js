import { useContext, useEffect } from "react";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import UnreadContext from "@frontend/contexts/unread-context";
import { socket } from "@frontend/services/socket";

// 내가 보낸 메시지가 db에 저장되어 친구에게 감 => UI 업데이트
// msg that I sent to friend is saved in DB and goes to friend
// to update friend's UI & unread msg count.
export default function useMsgToFriendHook(setRoomState) {
  const { setUnreadCount } = useContext(UnreadContext);
  const { currentRoomId } = useContext(CurrentRoomContext);

  useEffect(() => {
    const handleNewMsg = (insertedMsg) => {
      // 친구가 현재 채팅방에 없음, 이 채팅방의 안 읽은 메시지 수 증가함
      if (insertedMsg.room_id !== currentRoomId) {
        setUnreadCount((count) => ({
          ...count, // 다른 방들은 그대로 둠
          [insertedMsg.room_id]: (count[insertedMsg.room_id] || 0) + 1,
        })); // (해당 채팅방의 메시지 수 || 없으면 0) 그리고 1을 더함.

        return;
      } else {
        setRoomState((state) => ({
          ...state,
          msgHistory: state.msgHistory.some((m) => m.id === insertedMsg.id)
            ? state.msgHistory // prevent inserting duplicate msg
            : [...state.msgHistory, insertedMsg],
        }));
      }
    };

    socket.on("msgToFriend", handleNewMsg); // 메시지를 받는 이벤트가 발생함.

    return () => socket.off("msgToFriend", handleNewMsg);
  }, [setRoomState, currentRoomId, setUnreadCount]);
}

//   count = {
//     101: 2,
//     103: 5
//   };
