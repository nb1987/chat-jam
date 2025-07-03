import { Menu, MenuItem } from "@headlessui/react";
import { MenuItems, MenuButton } from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useContext } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import AuthContext from "@frontend/contexts/auth-context";

export default function SettingsPanel() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("refreshToken");
    authContext.setAccessToken(null);
    navigate("/login");
  };

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton className="focus:outline-none">
          <Cog8ToothIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10 outline-none">
          <MenuItem>
            {({ close }) => (
              <div className="p-2 hover:bg-gray-50">
                <div
                  onClick={() => {
                    close();
                    navigate("/account-settings");
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <LockClosedIcon className="h-6 w-6 text-gray-600" />
                  <span className="ml-2">Account Settings</span>
                </div>
              </div>
            )}
          </MenuItem>

          <MenuItem>
            <div className="p-2 hover:bg-gray-50">
              <div
                onClick={handleLogout}
                className="flex items-center cursor-pointer"
              >
                <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-gray-600" />
                <span className="ml-2">Sign out</span>
              </div>
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
    </>
  );
}
