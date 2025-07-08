import { useEffect, useRef, useState } from "react";
import { sendMsg } from "@frontend/services/socket";

export default function MessageInput({ roomId, senderId, wrongCondition }) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (wrongCondition) return;

    sendMsg(roomId, text, senderId);
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="mt-3 flex items-end gap-2 border-t pt-3">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          handleChange(value);
        }}
        className="flex-1 resize-none overflow-hidden rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-300"
        placeholder="Type a message..."
      />

      <button
        onClick={handleSend}
        className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold shadow-sm
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
