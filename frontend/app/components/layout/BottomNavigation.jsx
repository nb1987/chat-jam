import { useNavigate, NavLink } from "react-router";
import { useState } from "react";
import {
  UserIcon,
  ChatBubbleOvalLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

export default function BottomNavigation() {
  const navigate = useNavigate();

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
      href: "/search",
      current: window.location.pathname === "/search",
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
            <span className="h-4 w-4">{tab.icon}</span> {tab.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
