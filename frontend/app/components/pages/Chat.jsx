import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import AuthContext from "@frontend/contexts/auth-context";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import Spinner from "@frontend/components/shared/Spinner";
import ChatService from "@frontend/services/chat.service";
import ChatRoom from "@frontend/components/ui/ChatRoom";

export default function Chat() {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    chatFriends: [],
  });

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [startChat, setStartChat] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    const abortController = new AbortController();
    const chatService = new ChatService(abortController, authContext);

    const fetchPageData = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const data = await chatService.getChatFriends();

        setPage((state) => ({
          ...state,
          isLoading: false,
          chatFriends: data,
        }));
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
          setPage((state) => ({
            ...state,
            error: "Unexpected error while loading data",
            isLoading: false,
          }));
        }
      }
    };

    fetchPageData();

    return () => {
      abortController.abort();
    };
  }, [authContext, refetchTrigger]);

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (page.error) {
    return <ErrorPage text={page.error} />;
  }

  return (
    <div className="w-full md:w-[600px] lg:w-[800px] xl:w-[1000px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">💬 Messages</h1>

      {page.isLoading ? (
        <div className="text-center text-gray-500">Loading chat history...</div>
      ) : (
        <ul className="border border-gray-200 p-2 rounded-md w-full">
          {page.chatFriends.map((friend) => (
            <li
              key={friend.id}
              onClick={() => {
                setStartChat(true);
                setSelectedFriend(friend);
              }}
              className="flex flex-col gap-1 p-4 hover:bg-gray-100 cursor-pointer "
            >
              <div className="flex items-center gap-4">
                {friend.userImgSrc ? (
                  <img
                    alt="user image"
                    src={friend.userImgSrc.replace(
                      "/upload/",
                      "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
                    )}
                    className="size-14 shrink-0 rounded-full bg-gray-300"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center size-14 rounded-full bg-gray-100">
                    <UserIcon className="h-10 w-10 text-gray-500" />
                  </span>
                )}

                <div className="flex-1">
                  <div className="text-lg font-semibold">{friend.username}</div>

                  <div className="flex flex-1 overflow-hidden justify-between items-center">
                    <div
                      className="text-sm text-gray-500 truncate w-full
    max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[480px]"
                    >
                      {friend.lastMsg}
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap ml-4 shrink-0">
                      {friend.lastMsgAt &&
                        new Date(friend.lastMsgAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {startChat && (
        <ChatRoom
          friendObj={selectedFriend}
          startChatRoom={startChat}
          closeModal={() => {
            setStartChat(false);
            setRefetchTrigger((state) => !state);
          }}
        />
      )}
    </div>
  );
}
