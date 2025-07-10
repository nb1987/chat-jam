import { jwtDecode } from "jwt-decode";
import { useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "@frontend/contexts/auth-context";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import Spinner from "@frontend/components/shared/Spinner";
import ChatService from "@frontend/services/chat.service";
import ChatRoom from "@frontend/components/ui/ChatRoom/ChatRoom";
import ChatListItem from "../ui/ChatListItem";

// {id, username, userImgSrc, lastMsg,lastMsgAt, lastMsgSenderId, lastMsgIsRead}

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

  const fetchPageData = useCallback(async () => {
    const abortController = new AbortController();
    const chatService = new ChatService(abortController, authContext);

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
  }, []);

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    fetchPageData();
  }, [fetchPageData]);

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (page.error) {
    return <ErrorPage text={page.error} />;
  }

  return (
    <div className="w-full md:w-[600px] lg:w-[800px] xl:w-[1000px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">💬 Messages</h1>

      {!page.chatFriends ? (
        <div></div>
      ) : (
        <ul className="border border-gray-200 p-1 rounded-md w-full">
          {page.chatFriends.map((friend) => (
            <li
              key={friend.id}
              onClick={() => {
                setStartChat(true);
                setSelectedFriend(friend);
              }}
              className="flex flex-col gap-1 p-2 hover:bg-gray-100 cursor-pointer "
            >
              <ChatListItem
                friendLastMsgAt={friend.lastMsgAt}
                friendLastMsg={friend.lastMsg}
                friendUsername={friend.username}
                friendUserImgSrc={friend.userImgSrc}
                lastMsgSenderIsFriend={friend.id !== decodedUser.id}
                msgIsUnreadByMe={!friend.lastMsgIsRead}
              />
            </li>
          ))}
        </ul>
      )}
      {startChat && selectedFriend && (
        <ChatRoom
          friendObj={selectedFriend}
          startChatRoom={startChat}
          closeModal={() => {
            setStartChat(false);
            fetchPageData();
          }}
        />
      )}
    </div>
  );
}
