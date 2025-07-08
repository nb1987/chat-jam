import { useState, useEffect, useRef, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { jwtDecode } from "jwt-decode";

import { joinRoom, socket } from "@frontend/services/socket";
import useMsgToRoomHook from "./useMsgToRoomHook";
import MessageBubble from "@frontend/components/ui/ChatRoom/MessageBubble";
import AuthContext from "@frontend/contexts/auth-context";
import AccountService from "@frontend/services/account.service";
import ChatService from "@frontend/services/chat.service";
import Spinner from "@frontend/components/shared/Spinner";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useScrollToBottomHook from "./useScrollToBottomHook";
import useEmitUnreadMsgHook from "@frontend/components/ui/ChatRoom/useEmitUnreadMsgHook";
import useReceiveReadMsgHook from "./useReceiveReadMsgHook";
import useSocketErrorHook from "./useSocketErrorHook";
import useSocketDisconnectAlert from "./useSocketDisconnectAlert";
import SocketContext from "@frontend/contexts/socket-context";

export default function ChatRoom({ friendObj, startChatRoom, closeModal }) {
  const authContext = useContext(AuthContext);
  const { setUnreadCount } = useContext(SocketContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const { id: friendId, username: friendName } = friendObj;

  const [roomState, setRoomState] = useState({
    isLoading: false,
    error: null,
    roomId: "",
    msgHistory: [],
    myInfo: {},
  });

  const [isRoomReady, setIsRoomReady] = useState(false);
  const chatHistoryBottomRef = useRef(null);
  const userExitedOnPurpose = useRef(false); // state처럼 렌더링에 영향을 안 줌,

  useEffect(() => {
    userExitedOnPurpose.current = false;
  }, []);

  useEffect(() => {
    setUnreadCount((state) => ({
      ...state,
      [roomState.roomId]: 0,
    }));
  }, []); // 다른 방들은 안 읽은 메시지 개수를 유지함.

  useMsgToRoomHook(roomState.roomId, setRoomState);
  useEmitUnreadMsgHook(
    roomState.msgHistory,
    roomState.roomId,
    roomState.myInfo.id
  );
  useReceiveReadMsgHook(setRoomState, roomState.roomId);
  useScrollToBottomHook(chatHistoryBottomRef, roomState.msgHistory);
  useSocketErrorHook();
  useSocketDisconnectAlert(userExitedOnPurpose);

  const handleLeaveRoom = () => {
    userExitedOnPurpose.current = true;
    socket.disconnect();
    closeModal();
  };

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

  const onLocalMsgDelete = (msgId) => {
    setRoomState((state) => ({
      ...state,
      msgHistory: state.msgHistory.map((m) =>
        m.id === msgId
          ? { ...m, is_deleted: true, text: "This message is deleted" }
          : m
      ),
    }));
  };

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
              <ChatHeader
                friendName={friendName}
                closeModal={handleLeaveRoom}
              />

              {/* list of messages & each msg has msg obj. */}
              <div className="flex-1 overflow-y-auto space-y-2 px-1">
                {roomState.msgHistory.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    myInfo={roomState.myInfo}
                    friendInfo={friendObj}
                    onLocalMsgDelete={onLocalMsgDelete}
                  />
                ))}
                <div ref={chatHistoryBottomRef} />
              </div>

              <MessageInput
                roomId={roomState.roomId}
                senderId={roomState.myInfo.id || decodedUser.id}
                wrongConditon={!isRoomReady || !roomState.myInfo?.id}
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
