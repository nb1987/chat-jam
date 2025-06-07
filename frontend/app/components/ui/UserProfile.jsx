import {
  ChatBubbleBottomCenterIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

export default function UserProfile({ user }) {
  const { id, username, userImgSrc, city, state } = user;

  return (
    <>
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {username}
            </h3>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            {city}, {state}
          </p>
        </div>
        {userImgSrc ? (
          <img
            alt="user image"
            src={userImgSrc}
            className="size-10 shrink-0 rounded-full bg-gray-300"
          />
        ) : (
          <span className="inline-flex items-center justify-center size-10 rounded-full bg-gray-100">
            <UserIcon className="h-6 w-6 text-gray-500" />
          </span>
        )}
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <a
              href={`${id}`}
              className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <PlusIcon aria-hidden="true" className="size-5 text-gray-400" />
              Add to friend
            </a>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <a
              href={`${id}`}
              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <ChatBubbleBottomCenterIcon
                aria-hidden="true"
                className="size-5 text-gray-400"
              />
              Send a message
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
