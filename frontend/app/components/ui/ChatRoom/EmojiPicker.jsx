import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useRef, useEffect } from "react";

export default function EmojiPicker({ setText, setIsTyping, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <div ref={pickerRef}>
      <Picker
        data={data}
        onEmojiSelect={(emoji) => {
          setText((text) => text + emoji.native);
          setIsTyping(true);
        }}
        theme="light"
        showPreview={false}
        previewPosition="none"
      />
    </div>
  );
}
