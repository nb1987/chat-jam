import { socket } from "@frontend/services/socket";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function useSocketErrorHook() {
  useEffect(() => {
    const handleMsgEror = (error) => {
      switch (error.code) {
        case "INSERT_FAILED":
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
