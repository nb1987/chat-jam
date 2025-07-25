import { useNavigate, NavLink } from "react-router";
import { useContext, useState } from "react";
import {
  UserIcon,
  ChatBubbleOvalLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import UnreadContext from "@frontend/contexts/unread-context";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const { unreadCount } = useContext(UnreadContext);
  const totalMsgs = Object.values(unreadCount).reduce(
    (sum, count) => sum + Number(count),
    0
  );

  const tabs = [
    {
      icon: <UserIcon />,
      name: "Friends",
      href: "/friends",
      current: window.location.pathname === "/friends",
    },

    {
      icon: <ChatBubbleOvalLeftIcon />,
      name: "Chat",
      href: "/chat",
      current: window.location.pathname === "/chat",
    },
    {
      icon: <MagnifyingGlassIcon />,
      name: "Search",
      href: "/explore",
      current: window.location.pathname === "/explore",
    },
  ];

  const [currentTab, setCurrentTab] = useState(
    tabs.find((tab) => tab.current)?.name || "Friends"
  );

  const handleNavigation = (name) => {
    const selectedTab = tabs.find((tab) => tab.name === name);
    setCurrentTab(selectedTab.name);
    navigate(currentTab.href);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            onClick={() => handleNavigation(tab.name)}
            className={`flex flex-col items-center text-xs font-medium ${
              currentTab === tab.name ? "text-orange-600" : "text-gray-500"
            }`}
          >
            <span className="size-6 relative">
              {tab.icon}
              {tab.name === "Chat" && totalMsgs > 0 && (
                <span className="absolute top-0 left-6 block h-2 w-2 rounded-full bg-orange-400"></span>
              )}
            </span>
            <span>{tab.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
