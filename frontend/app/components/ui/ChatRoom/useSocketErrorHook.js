import { socket } from "@frontend/services/socket";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function useMsgToRoomHook() {
  useEffect(() => {
    const handleMsgEror = (error) => {
      switch (error.code) {
        case "INSERT_FAILED":
          toast.error(error.message);
          break;
        case "MARK_AS_READ_FAILED":
          toast.error(error.message);
          break;
        default:
          toast.error("Unknown error occured.");
      }
    };

    socket.on("msgError", handleMsgEror);

    return () => socket.off("msgError", handleMsgEror);
  }, []);
}
