import { useEffect, useContext, useState } from "react";
import {
  registerSW,
  subscribePush,
  sendModeToSW,
  checkNotifyPermission,
} from "@frontend/services/pushClient";
import QuietModeContext from "@frontend/contexts/quiet-mode-context";

export default function usePushNotifications(userId) {
  const { mode } = useContext(QuietModeContext);
  const [notifyStatus, setNotifyStatus] = useState(() =>
    checkNotifyPermission()
  ); // 렌더링 시 한번만 계산

  // 1) SW 등록 (앱 시작 시)
  useEffect(() => {
    registerSW();
  }, []);

  // 2. push 구독
  useEffect(() => {
    if (!userId) return;
    if (notifyStatus === "granted") {
      subscribePush(userId);
    }
  }, [userId, notifyStatus]);

  // 3) 모드가 바뀌면 서비스워커에 전달
  useEffect(() => {
    if (mode) sendModeToSW(mode);
  }, [mode]);

  return { notifyStatus, setNotifyStatus };
}
