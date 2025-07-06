import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function DeleteMsgMenu({ onDelete }) {
  return (
    <Menu as="div" className="fixed top-20 left-20 z-50 bg-red-100 p-4">
      {/* <Menu as="div" className="absolute top-full right-0 mt-1 z-50 bg-red-200"> */}
      <MenuButton className="sr-only">⋯</MenuButton>
      <MenuItems className="bg-white border border-gray-200 rounded shadow-md text-sm w-40">
        <MenuItem>
          {({ close }) => (
            <button
              onClick={() => {
                onDelete();
                close();
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
            >
              Delete Message
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
