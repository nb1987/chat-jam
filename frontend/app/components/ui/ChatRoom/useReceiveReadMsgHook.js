import { socket } from "@frontend/services/socket";
import { useEffect } from "react";

export default function useReceiveReadMsgHook(setRoomState, roomId) {
  useEffect(() => {
    if (!roomId) return;

    const handleReadMsg = (msgId) => {
      setRoomState((state) => ({
        ...state,
        msgHistory: state.msgHistory.map((m) =>
          m.id === msgId ? { ...m, is_read: true } : m
        ),
      }));
    };
    socket.on("receiveReadMsg", handleReadMsg);
    console.log("📍Receiving event to handle read msg in front");

    return () => socket.off("receiveReadMsg", handleReadMsg);
  }, [setRoomState, roomId]);
}
