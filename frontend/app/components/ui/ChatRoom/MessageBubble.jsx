import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import ChatService from "@frontend/services/chat.service";
import AuthContext from "@frontend/contexts/auth-context";
import FriendMsgBubble from "./FriendMsgBubble";
// msg = { id, room_id, user_id, friend_id, text, created_at, id_deleted, is_read }
// myInfo = {id, username, image}
export default function MessageBubble({
  msg,
  myInfo,
  friendInfo,
  onLocalMsgDelete,
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
      await chatService.DeleteMessage(msgId);
      onLocalMsgDelete(msgId);
      setSelectedMsgId(null);
      setShowMenu(false);
    } catch (err) {
      toast.error(err);
    }
  };

  if (!decodedUser) {
    return <Spinner />;
  }

  return (
    <div className={`flex mb-2 ${isItMe ? "justify-end" : "justify-start"}`}>
      {!isItMe && (
        <FriendMsgBubble
          friendImg={friendInfo?.userImgSrc}
          friendName={friendInfo?.username}
          text={msg.text}
          createdAt={msg.created_at}
          msgIsDeleted={msg.is_deleted}
        />
      )}

      {isItMe && (
        <div className="flex items-end gap-2">
          {!msg.is_read && (
            <span className="flex gap-1 text-xs text-orange-600">unread</span>
          )}
          <span className="text-xs text-gray-500">
            {msg.created_at && !isNaN(new Date(msg.created_at))
              ? format(new Date(msg.created_at), "HH:mm")
              : "??:??"}
          </span>
          <div
            ref={bubbleRef}
            onContextMenu={
              !msg.is_deleted ? (e) => handleContextMenu(e, msg.id) : undefined
            } // right click happens
            className="relative px-3 py-2 rounded-xl max-w-xs bg-orange-400 text-sm text-white rounded-br-none"
          >
            {msg.is_deleted ? (
              <div className="flex items-center gap-1 italic text-sm text-gray-100">
                <span>
                  <ExclamationCircleIcon className="size-5 text-gray-100" />
                </span>
                This message is deleted.
              </div>
            ) : (
              msg.text
            )}
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
              handleDeleteMsg(msg.id);
            }}
          >
            Delete Message
          </button>
        </div>
      )}
    </div>
  );
}
