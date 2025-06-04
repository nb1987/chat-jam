import { useNavigate, NavLink } from "react-router";
import { useState } from "react";
import { Cog8ToothIcon, UserPlusIcon } from "@heroicons/react/24/solid";
export default function TopNavigation() {
  const navigate = useNavigate();

  const tabs = [
    {
      icon: <UserPlusIcon />,
      name: "Add a friend",
      href: "/add-friend",
      current: window.location.pathname === "/add-friend",
    },
    {
      icon: <Cog8ToothIcon />,
      name: "Settings",
      href: "/settings",
      current: window.location.pathname === "/settings",
    },
  ];

  const [currentTab, setCurrentTab] = useState(
    tabs.find((tab) => tab.current)?.name || null
  );

  const handleNavigation = (name) => {
    const selectedTab = tabs.find((tab) => tab.name === name);
    setCurrentTab(selectedTab.name);
    navigate(currentTab.href);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-xs border-t border-gray-50 z-50">
      <div className="flex justify-end items-center h-14 pr-22 gap-8">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            onClick={() => handleNavigation(tab.name)}
            className="flex flex-col items-center text-xs font-medium"
          >
            <span className="h-5 w-5">{tab.icon}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
