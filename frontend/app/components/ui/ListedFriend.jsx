import { UserIcon } from "@heroicons/react/24/solid";

export default function ListedFriend({ person }) {
  const { username, userImgSrc } = person;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="relative flex items-center space-x-3 bg-white px-6 py-2">
        <div className="shrink-0">
          {userImgSrc ? (
            <img
              alt="user image"
              src={userImgSrc.replace(
                "/upload/",
                "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
              )}
              className="size-10 rounded-full"
            />
          ) : (
            <span className="inline-flex items-center justify-center size-10 rounded-full bg-gray-100">
              <UserIcon className="h-6 w-6 text-gray-500" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="focus:outline-hidden">
            <span aria-hidden="true" className="absolute inset-0" />
            <p className="text-sm font-medium text-gray-900">{username}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
