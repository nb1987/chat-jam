import { useState, useEffect, useRef, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";

import { socket, joinRoom, sendMsg } from "@frontend/services/socket";
import MessageBubble from "@frontend/components/ui/MessageBubble";
import AuthContext from "@frontend/contexts/auth-context";
import AccountService from "@frontend/services/account.service";
import ChatService from "@frontend/services/chat.service";
import Spinner from "@frontend/components/shared/Spinner";
import ErrorPage from "@frontend/components/notifications/ErrorPage";

export default function ChatRoom({ friendObj, startChatRoom, closeModal }) {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const { id: friendId, username: friendName } = friendObj;

  const [roomState, setRoomState] = useState({
    isLoading: false,
    error: null,
    roomId: "",
    msgHistory: [],
    text: "",
    isTyping: false,
    myInfo: {},
  });

  const [isRoomReady, setIsRoomReady] = useState(false);

  const chatHistoryBottomRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, authContext);
    const chatService = new ChatService(abortController, authContext);

    const prepareChatRoom = async () => {
      try {
        setRoomState((state) => ({ ...state, isLoading: true }));
        const myData = await accountService.getUserInfo();
        const chatRoomId = await chatService.getChatRoomId(friendId);
        const chatHistory = await chatService.getChatHistory(chatRoomId);

        setRoomState((state) => ({
          ...state,
          isLoading: false,
          roomId: chatRoomId,
          msgHistory: chatHistory,
          myInfo: myData,
        }));

        setIsRoomReady(true);
        joinRoom(chatRoomId);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
          setRoomState((state) => ({
            ...state,
            error: "Unexpected error while loading data",
            isLoading: false,
          }));
        }
      }
    };

    prepareChatRoom();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      chatHistoryBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [roomState.msgHistory]);

  const handleSend = () => {
    if (!isRoomReady || !roomState.myInfo?.id) return;

    const currentText = roomState.text;
    const senderId = roomState.myInfo.id || decodedUser.id;

    sendMsg(roomState.roomId, currentText, senderId);

    setRoomState((state) => ({
      ...state,
      text: "",
      isTyping: false,
    }));
  };

  // insertedMsg = { room_id, user_id, text, created_at }
  useEffect(() => {
    const handleNewMsg = (insertedMsg) => {
      const { room_id } = insertedMsg;

      setRoomState((state) => {
        if (room_id !== state.roomId) return state;

        return {
          ...state,
          msgHistory: [...state.msgHistory, insertedMsg],
        };
      });
    };

    socket.on("msgToRoom", handleNewMsg);
    return () => socket.off("msgToRoom", handleNewMsg);
  }, []);

  if (roomState.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (roomState.error) {
    return <ErrorPage text={roomState.error} />;
  }

  return (
    <div>
      <Dialog open={startChatRoom} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-md h-[80vh] sm:min-h-[28rem] 
             bg-white px-4 pt-4 pb-3 text-left rounded-lg shadow-xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">
                  Chat with {friendName}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* list of messages */}
              <div className="flex-1 overflow-y-auto space-y-2 px-1">
                {roomState.msgHistory.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    myInfo={roomState.myInfo}
                    friendInfo={friendObj}
                  />
                ))}
                <div ref={chatHistoryBottomRef} />
              </div>

              <div className="mt-3 flex items-end gap-2 border-t pt-3">
                <textarea
                  rows={1}
                  value={roomState.text}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoomState((state) => ({
                      ...state,
                      text: value,
                      isTyping: value.trim().length > 0,
                    }));
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="flex-1 resize-none overflow-hidden rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-300"
                  placeholder="Type a message..."
                />

                <button
                  onClick={handleSend}
                  className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold shadow-sm
        ${
          roomState.isTyping
            ? "bg-orange-400 text-white hover:bg-orange-500"
            : "bg-gray-300 text-gray-400 cursor-default"
        }
      `}
                  disabled={!roomState.isTyping}
                >
                  Send
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
