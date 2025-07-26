import TopNavigation from "./TopNavigation";
import BottomNavigation from "./BottomNavigation";
import { Outlet } from "react-router-dom";
import useGlobalMsgListenerHook from "@frontend/hooks/useGlobalMsgListenerHook.jsx";
import useSocketDisconnectAlert from "@frontend/hooks/useSocketDisconnectAlert";

export default function MainLayout() {
  useSocketDisconnectAlert();
  useGlobalMsgListenerHook();

  return (
    <div className="pt-14 pb-14 min-h-screen">
      <TopNavigation />
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
