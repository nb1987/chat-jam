import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import ChatService from "@frontend/services/chat.service";
import AuthContext from "@frontend/contexts/auth-context";
import FriendMsgBubble from "./FriendMsgBubble";
import { updateMessageStatus } from "@frontend/localforage/messageStore";
import { sendLocalMsg } from "@frontend/utils/sendLocalMsg";
import DeletedPlaceholder from "./DeletedPlaceholder";
import TimestampInRoom from "./TimestampInRoom";
import UnreadBadge from "./UnreadBadge";
import PendingIcon from "./PendingIcon";
// myInfo = {id, username, image}

// {user_id, text, created_at, is_deleted, is_read, status, id} = msg
export default function MessageBubble({
  msg,
  myInfo,
  friendInfo,
  onLocalMsgDelete,
  setLocalMsgs,
}) {
  const { id: myId } = myInfo;
  const isItMe = msg.user_id === myId;

  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const bubbleRef = useRef(null);

  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const abortController = new AbortController();
  const chatService = new ChatService(abortController, authContext);

  const handleContextMenu = (e, msgId) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    setMenuPosition({ x: rect.right + 1, y: rect.top });
    setSelectedMsgId(msgId);
    setShowMenu(true);
  };

  const handleClickOutside = (e) => {
    if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
      setSelectedMsgId(null);
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDeleteMsg = async (msgId) => {
    try {
      await chatService.deleteMessage(msgId);
      onLocalMsgDelete(msgId);
      setSelectedMsgId(null);
      setShowMenu(false);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleResend = async (failedMsg) => {
    await updateMessageStatus(failedMsg.id, "pending");
    sendLocalMsg(failedMsg, setLocalMsgs);
  };

  if (!decodedUser) {
    return <Spinner />;
  }

  return (
    <div className={`flex mb-2 ${isItMe ? "justify-end" : "justify-start"}`}>
      {!isItMe && (
        <FriendMsgBubble
          friendInfo={friendInfo}
          text={msg.text}
          createdAt={msg.created_at}
          msgIsDeleted={msg.is_deleted}
        />
      )}

      {isItMe && (
        <div className="flex items-end gap-2">
          {msg.status === "pending" && <PendingIcon />}
          {!msg.is_read && msg.status === "sent" && <UnreadBadge />}
          {msg.status === "failed" && (
            <span
              onClick={() => handleResend(msg)}
              className="flex gap-1 pb-2 cursor-pointer"
            >
              <ArrowPathIcon className="size-4 text-red-600" />
            </span>
          )}
          {msg.status !== "failed" && (
            <TimestampInRoom createdAt={msg.created_at} />
          )}

          <div
            ref={bubbleRef}
            onContextMenu={
              !msg.is_deleted ? (e) => handleContextMenu(e, msg.id) : undefined
            } // right click happens
            className="relative px-3 py-2 rounded-xl max-w-xs bg-orange-100 text-sm text-gray-800 rounded-br-none"
          >
            {msg.is_deleted ? <DeletedPlaceholder /> : msg.text}
          </div>
        </div>
      )}

      {selectedMsgId && showMenu && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-md z-50"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <button
            className="w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-gray-100"
            onClick={() => {
              handleDeleteMsg(Number(msg.id));
            }}
          >
            Delete Message
          </button>
        </div>
      )}
    </div>
  );
}
