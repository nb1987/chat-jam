import { MenuItem, MenuItems } from "@headlessui/react";

export default function DeleteMsgMenu({ onDelete }) {
  return (
    <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10 outline-none">
      <MenuItem>
        {({ close }) => (
          <div className="p-2 hover:bg-gray-50">
            <div
              onClick={() => {
                onDelete();
                close();
              }}
              className="flex items-center cursor-pointer"
            >
              <span className="ml-2">Delete this message</span>
            </div>
          </div>
        )}
      </MenuItem>
    </MenuItems>
  );
}
