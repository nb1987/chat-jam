import { XMarkIcon } from "@heroicons/react/24/solid";

export default function ChatHeader({ friendName, closeModal }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">Chat with {friendName}</h2>
      <button
        onClick={closeModal}
        className="text-gray-400 hover:text-gray-500"
      >
        <XMarkIcon className="size-5" />
      </button>
    </div>
  );
}
