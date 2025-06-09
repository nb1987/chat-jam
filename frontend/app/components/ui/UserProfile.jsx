import {
  ChatBubbleBottomCenterIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import UsersService from "@frontend/services/users.service";
import { useContext, useState } from "react";
import AuthContext from "@frontend/contexts/auth-context";
import { jwtDecode } from "jwt-decode";

export default function UserProfile({ searchedUser }) {
  const { id: friendId, username, userImgSrc, city, state } = searchedUser;
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [errorForAdding, setErrorForAdding] = useState("");

  const abortController = new AbortController();
  const usersService = new UsersService(abortController, authContext);

  const handleAddFriend = async (userId, friendId) => {
    try {
      setIsAddingFriend(true);
      const data = await usersService.addFriend(userId, friendId);
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        setErrorForAdding("Unexpected error while adding friend.");
      }
    }
  };

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
            className="size-14 shrink-0 rounded-full bg-gray-300"
          />
        ) : (
          <span className="inline-flex items-center justify-center size-14 rounded-full bg-gray-100">
            <UserIcon className="h-10 w-10 text-gray-500" />
          </span>
        )}
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <div
              onClick={() => {
                handleAddFriend(decodedUser.id, friendId);
              }}
              className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <PlusIcon aria-hidden="true" className="size-5 text-gray-400" />
              Add to friend
            </div>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <div
              onClick={() => {}}
              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <ChatBubbleBottomCenterIcon
                aria-hidden="true"
                className="size-5 text-gray-400"
              />
              Send a message
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
