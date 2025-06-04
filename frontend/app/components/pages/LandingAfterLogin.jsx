import { useNavigate, NavLink } from "react-router";
import { useState } from "react";

export default function LandingPageAfterLogin() {
  const navigate = useNavigate();

  const tabs = [
    {
      name: "Friends",
      href: "/friends",
      current: window.location.pathname === "/friends",
    },
    {
      name: "Chat",
      href: "/chat",
      current: window.location.pathname === "/chat",
    },
    {
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
    <>
      <div className="min-h-full">
        <div className="overflow-hidden bg-white shadow-sm">
          <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            {tabs.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => handleNavigation(item.name)}
                className={
                  (currentTab
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  "inline-flex items-center  px-1 pt-1 text-sm font-medium")
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
