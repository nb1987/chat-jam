import { useContext, useEffect } from "react";
import { socket } from "@frontend/services/socket";
import toast from "react-hot-toast";
import SocketContext from "@frontend/contexts/socket-context";

// "beforeunload" : 페이지를 나가기 직전, 새로고침하기 직전
// 소켓 끊김을 알아차리는 커스텀 훅
export default function useSocketDisconnectAlert() {
  const { userExitedOnPurpose } = useContext(SocketContext);

  useEffect(() => {
    const handleUserExit = () => {
      userExitedOnPurpose.current = true;
      socket.disconnect();
    };
    // 일부러 페이지를 나간다면 true가 됨
    window.addEventListener("beforeunload", handleUserExit);

    return () => {
      socket.off("disconnect");
      window.removeEventListener("beforeunload", handleUserExit);
    };
  }, [userExitedOnPurpose]);

  socket.on("disconnect", () => {
    if (!userExitedOnPurpose.current) {
      toast.error("Network is unstable. Reconnecting...");
    } // 네트워크 연결이 끊겼기 때문에 '일부러 나갔다'는 거짓이 됨.
  });
}
