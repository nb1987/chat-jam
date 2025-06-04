import TopNavigation from "./TopNavigation";
import BottomNavigation from "./BottomNavigation";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="pt-14 pb-14 min-h-screen">
      <TopNavigation />
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
