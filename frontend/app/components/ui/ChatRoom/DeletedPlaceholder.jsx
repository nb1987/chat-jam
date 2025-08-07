import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function DeletedPlaceholder() {
  return (
    <div className="flex items-center gap-1 italic text-sm text-gray-100">
      <span>
        <ExclamationCircleIcon className="size-5 text-gray-100" />
      </span>
      This message is deleted.
    </div>
  );
}
