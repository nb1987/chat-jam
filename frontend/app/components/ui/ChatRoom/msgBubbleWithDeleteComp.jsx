// This file is different version of MessageBuble component using DeleteMsgMenu component.

import { UserIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { useContext, useEffect, useRef, useState } from "react";
import { Menu, MenuButton } from "@headlessui/react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import ChatService from "@frontend/services/chat.service";
import AuthContext from "@frontend/contexts/auth-context";
import DeleteMsgMenu from "@frontend/components/ui/ChatRoom/DeleteMsgMenu";
// msg = { id, room_id, user_id, text, created_at, id_deleted }
// myInfo = {id, username, image}
export default function MessageBubble({
  msg,
  myInfo,
  friendInfo,
  onLocalMsgDelete,
}) {
  const { username: friendName, userImgSrc: friendImg } = friendInfo;
  const { id: myId } = myInfo;
  const isItMe = msg.user_id === myId;

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
    setSelectedMsgId(msgId);
  };

  const handleClickOutside = (e) => {
    if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
      setSelectedMsgId(null);
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
        <div className="flex items-start gap-2">
          {friendImg ? (
            <img
              src={friendImg.replace(
                "/upload/",
                "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
              )}
              alt="user"
              className="size-8 shrink-0 rounded-full"
            />
          ) : (
            <span className="inline-flex items-center justify-center size-10 rounded-full bg-gray-100 shrink-0">
              <UserIcon className="size-8 text-gray-500" />
            </span>
          )}

          <div>
            <div className="text-xs text-gray-500 mb-1">{friendName}</div>
            <div className="flex items-end gap-2">
              <div className="relative px-3 py-2 rounded-xl max-w-xs bg-gray-200 text-sm text-gray-900 rounded-bl-none">
                {msg.text}
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(msg.created_at), "HH:mm")}
              </span>
            </div>
          </div>
        </div>
      )}

      {isItMe && (
        <Menu as="div" className="relative inline-block text-left">
          <span className="text-xs text-gray-500">
            {format(new Date(msg.created_at), "HH:mm")}
          </span>
          <MenuButton className="w-full">
            <div
              ref={bubbleRef}
              onContextMenu={
                !msg.is_deleted
                  ? (e) => handleContextMenu(e, msg.id)
                  : undefined
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
          </MenuButton>
          <DeleteMsgMenu onDelete={() => handleDeleteMsg(selectedMsgId)} />
        </Menu>
      )}
    </div>
  );
}
