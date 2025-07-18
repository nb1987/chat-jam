import {
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/react";

export default function ChatRoomSettings() {
  return (
    <div>
      <Menu as="div" className="relative">
        <MenuButton className="focus:outline-none">
          <ChevronRightIcon className="size-5 text-gray-400 cursor-pointer" />
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10 outline-none">
          <MenuItem>
            {({ close }) => (
              <div className="p-2 hover:bg-gray-50">
                <div
                  onClick={() => {
                    close();
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <ChatBubbleBottomCenterTextIcon className="size-4 text-gray-600" />
                  <span className="ml-2">Delete chat history</span>
                </div>
              </div>
            )}
          </MenuItem>

          <MenuItem>
            <div className="p-2 hover:bg-gray-50">
              <div
                onClick={() => {}}
                className="flex items-center cursor-pointer"
              >
                <ArrowRightStartOnRectangleIcon className="size-4 text-gray-600" />
                <span className="ml-2">Leave this room</span>
              </div>
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
