import TopNavigation from "./TopNavigation";
import BottomNavigation from "./BottomNavigation";
import { Outlet } from "react-router-dom";
import useGlobalMsgListenerHook from "@frontend/hooks/useGlobalMsgListenerHook";
import useSocketDisconnectAlert from "@frontend/hooks/useSocketDisconnectAlert";

export default function MainLayout() {
  useGlobalMsgListenerHook();
  useSocketDisconnectAlert();

  return (
    <div className="pt-14 pb-14 min-h-screen">
      <TopNavigation />
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
