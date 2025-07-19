import { XMarkIcon } from "@heroicons/react/24/solid";

import ChatRoomSettings from "./ChatRoomSettings";

export default function ChatHeader({ friendName, closeModal }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat with {friendName}</h2>
        <span className="pl-2">
          <ChatRoomSettings />
        </span>
      </div>

      <button
        onClick={closeModal}
        className="text-gray-400 hover:text-gray-500"
      >
        <XMarkIcon className="size-5" />
      </button>
    </div>
  );
}
