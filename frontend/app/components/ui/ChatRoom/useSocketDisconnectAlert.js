import { useEffect } from "react";
import { socket } from "@frontend/services/socket";
import toast from "react-hot-toast";

// "beforeunload" : 페이지를 나가기 직전, 새로고침하기 직전

export default function useSocketDisconnectAlert(userExitedOnPurpose) {
  useEffect(() => {
    const handleUserExit = () => {
      userExitedOnPurpose.current = true;
    };
    // 일부러 페이지를 나간다면 true가 됨
    window.addEventListener("beforeunload", handleUserExit);

    socket.on("disconnect", () => {
      if (!userExitedOnPurpose.current) {
        toast.error("Network is unstable. Reconnecting...");
      } // 네트워크 연결이 끊겼기 때문에 '일부러 나갔다'는 거짓이 됨.
    });

    return () => {
      socket.off("disconnect");
      window.removeEventListener("beforeunload", handleUserExit);
    };
  });
}
