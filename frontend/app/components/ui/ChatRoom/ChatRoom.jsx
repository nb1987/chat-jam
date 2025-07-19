import { useState, useEffect, useRef, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

import { joinRoom, leaveRoom } from "@frontend/services/socket";
import MessageBubble from "@frontend/components/ui/ChatRoom/MessageBubble";
import AuthContext from "@frontend/contexts/auth-context";
import SocketContext from "@frontend/contexts/socket-context";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import AccountService from "@frontend/services/account.service";
import ChatService from "@frontend/services/chat.service";
import Spinner from "@frontend/components/shared/Spinner";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useMsgToMeHook from "@frontend/hooks/useMsgToMeHook";
import useScrollToBottomHook from "@frontend/hooks/useScrollToBottomHook";
import useEmitUnreadMsgHook from "@frontend/hooks/useEmitUnreadMsgHook";
import useReceiveReadMsgHook from "@frontend/hooks/useReceiveReadMsgHook";
import useSocketErrorHook from "@frontend/hooks/useSocketErrorHook";
import useMsgToFriendHook from "@frontend/hooks/useMsgToFriendHook";
import SpinnerMini from "@frontend/components/shared/SpinnerMini";
import useChatHandlers from "@frontend/hooks/useChatHandlers";

export default function ChatRoom({ friendObj, startChatRoom, closeModal }) {
  const authContext = useContext(AuthContext);
  const { userExitedOnPurpose } = useContext(SocketContext);
  const { setCurrentRoomId } = useContext(CurrentRoomContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [roomState, setRoomState] = useState({
    isLoading: false,
    error: null,
    roomId: "",
    msgHistory: [],
    myInfo: {},
  });

  const { id: friendId, username: friendName } = friendObj;
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [defaultPage, setDefaultPage] = useState(0);
  const [fetchMoreMsg, setFetchMoreMsg] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // 📌
  const scrollBottomRef = useRef(null); // 📌
  const scrollRef = useRef(null); // 📌
  const isLoadingMoreRef = useRef(false); // 📌

  useEffect(() => {
    userExitedOnPurpose.current = false;
  }, [userExitedOnPurpose]);

  useMsgToMeHook(roomState.roomId, setRoomState);
  useMsgToFriendHook(setRoomState); // 친구는 로그인한 상태

  useEmitUnreadMsgHook(
    roomState.msgHistory,
    roomState.roomId,
    roomState.myInfo.id
  );
  useReceiveReadMsgHook(setRoomState, roomState.myInfo.id);

  useScrollToBottomHook(
    scrollBottomRef,
    roomState.msgHistory,
    shouldAutoScroll
  ); // 📌
  useSocketErrorHook();

  const { onLocalMsgDelete } = useChatHandlers({ setRoomState });

  const handleLeaveRoom = () => {
    userExitedOnPurpose.current = true;
    setCurrentRoomId(null);
    leaveRoom(roomState.roomId);
    closeModal();
  };

  useEffect(() => {
    if (roomState.error) {
      toast.dismiss();
      toast.error(roomState.error);
    }
  }, [roomState.error]);

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
          msgHistory: [...chatHistory].reverse(),
          myInfo: myData,
        }));

        setIsRoomReady(true);
        joinRoom(chatRoomId);
        setCurrentRoomId(chatRoomId);
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
  }, [authContext, setCurrentRoomId, friendId]);

  //📌 move this logic to `useChatHandlers` later.
  const loadMoreMessages = async () => {
    const controller = new AbortController();
    const chatService = new ChatService(controller, authContext);
    try {
      setShouldAutoScroll(false);
      setFetchMoreMsg(true);
      const offset = (defaultPage + 1) * 50;
      const moreHistory = await chatService.getChatHistory(
        roomState.roomId,
        offset
      );

      setRoomState((state) => ({
        ...state,
        msgHistory: [...state.msgHistory, moreHistory.reverse()],
      }));
      setDefaultPage((page) => page + 1);
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while loading chat history");
      }
    } finally {
      setFetchMoreMsg(false);
    }
  };

  // 📌 위&아래로 스크롤했을 때 실행됨, 스크롤이 맨 위로 도달하면 메시지 불러오기.
  const handleScroll = async () => {
    const msgContainer = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = msgContainer;
    // scrollTop: 스크롤된 거리 (위에서 얼마나 내려갔나)
    // scrollHeight: 스크롤 가능한 전체 콘텐츠 높이
    // clientHeight: 실제로 보이는 채팅창 높이

    // 스크롤이 맨 아래에 있나 확인함. 5px 이내로 가까우면 true.
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isAtBottom) {
      setShouldAutoScroll(true);
    } else {
      setShouldAutoScroll(false);
    } // 메시지를 불러오는 중이 아니라면 스크롤이 내려가면 안됨

    if (scrollTop === 0 && !fetchMoreMsg && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      const currentScrollHeight = msgContainer.scrollHeight;

      await loadMoreMessages();

      setTimeout(() => {
        const newScrollHeight = msgContainer.scrollHeight;
        const heightDiff = newScrollHeight - currentScrollHeight;
        msgContainer.scrollTop = heightDiff;
      }, 0);

      isLoadingMoreRef.current = false;
    }
  };

  if (roomState.isLoading || !decodedUser) {
    return <Spinner />;
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

              {/* list of messages & each msg has msg obj.📌 */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-2 px-1"
              >
                {fetchMoreMsg && (
                  <div className="flex justify-center py-2">
                    <SpinnerMini />
                  </div>
                )}

                {roomState.msgHistory.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    myInfo={roomState.myInfo}
                    friendInfo={friendObj}
                    onLocalMsgDelete={onLocalMsgDelete}
                    loadMoreMessages={loadMoreMessages}
                    fetchMoreMsg={fetchMoreMsg}
                    setFetchMoreMsg={setFetchMoreMsg}
                  />
                ))}
                <div ref={scrollBottomRef} />
              </div>

              <MessageInput
                roomId={roomState.roomId}
                senderId={roomState.myInfo.id || decodedUser.id}
                wrongConditon={!isRoomReady || !roomState.myInfo?.id}
                friendId={friendId}
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
