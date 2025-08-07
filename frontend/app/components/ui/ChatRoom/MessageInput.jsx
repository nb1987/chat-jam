import { useEffect, useRef, useState } from "react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import EmojiPicker from "@frontend/components/ui/ChatRoom/EmojiPicker";
import { saveLocalMessage } from "@frontend/localforage/messageStore";
import { sendLocalMsg } from "@frontend/utils/sendLocalMsg";

export default function MessageInput({
  roomId,
  senderId,
  wrongCondition,
  friendId,
  blockFriend,
  setLocalMsgs,
}) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (wrongCondition) return;

    const pendingMsgInfo = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      room_id: roomId,
      text,
      user_id: senderId,
      friend_id: friendId,
      status: "pending",
      created_at: new Date().toISOString(),
      is_deleted: false,
      is_read: false,
    };
    saveLocalMessage(pendingMsgInfo); // locally save
    setLocalMsgs((pre) => [...pre, pendingMsgInfo]); // UI update

    sendLocalMsg(pendingMsgInfo, setLocalMsgs); // to server
    setText("");
    setIsTyping(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleChange = (value) => {
    setText(value);
    setIsTyping(value.trim().length > 0);
  };

  useEffect(() => {
    textareaRef.current.focus();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="mt-3 flex items-end gap-2 border-t pt-3">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            const value = e.target.value;
            handleChange(value);
          }}
          placeholder="Type a message..."
          disabled={blockFriend}
          className="w-full resize-none overflow-hidden rounded-md bg-white pl-2 pr-10 py-2 text-sm shadow-sm ring-1 ring-gray-300"
        />
        <div
          onClick={() => setShowEmojiPicker(true)}
          className="absolute right-2 top-2 ml-2"
        >
          <FaceSmileIcon className="size-6 text-gray-400" />
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker
              setText={setText}
              setIsTyping={setIsTyping}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        className={`flex items-center self-start mt-[1px] shrink-0 rounded-md px-4 py-2 text-sm font-semibold shadow-sm
        ${
          isTyping
            ? "bg-orange-400 text-white hover:bg-orange-500"
            : "bg-gray-300 text-gray-400 cursor-default"
        }
      `}
        disabled={!isTyping}
      >
        Send
      </button>
    </div>
  );
}
