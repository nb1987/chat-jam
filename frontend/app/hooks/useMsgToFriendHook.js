import { useContext, useEffect } from "react";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import { socket } from "@frontend/services/socket";

export default function useMsgToFriendHook(setRoomState) {
  const { currentRoomId } = useContext(CurrentRoomContext);

  useEffect(() => {
    const handleNewMsg = (insertedMsg) => {
      if (insertedMsg.room_id == currentRoomId)
        setRoomState((state) => ({
          ...state,
          msgHistory: state.msgHistory.some((m) => m.id === insertedMsg.id)
            ? state.msgHistory // prevent inserting duplicate msg
            : [...state.msgHistory, insertedMsg],
        }));
    };

    socket.on("messageToFriend", handleNewMsg);

    return () => socket.off("messageToFriend", handleNewMsg);
  }, [setRoomState, currentRoomId]);
}
