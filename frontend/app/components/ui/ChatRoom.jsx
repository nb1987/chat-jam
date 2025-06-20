import { useState, useEffect, Fragment } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import { socket, sendMsg, receiveMsg } from "@frontend/services/socket";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function ChatRoom({ friendId, startChatRoom, closeModal }) {
  const [msgHistory, setMsgHistory] = useState([]);
  const [text, setText] = useState("");

  const roomId = "";

  // useEffect(() => {
  //   joinRoom(roomId);
  // }, []);

  const handleSend = () => {
    sendMsg({ roomId, text });
    setMsgHistory((state) => [...state, { text }]);
    setText("");
  };

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
              className="relative w-[90%] max-w-sm min-h-[20rem] sm:min-h-[24rem] transform overflow-hidden rounded-lg bg-white px-4 pt-4 text-left shadow-xl transition-all sm:p-6"
            >
              <div className="px-4 sm:px-6">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex  items-center justify-center gap-2 px-4 sm:px-6">
                <textarea
                  type="text"
                  onChange={(e) => setText(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6"
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* {messages.map((msg, idx) => (
        <div key={idx}>
          {msg.sender === userId ? "You" : "Friend"}: {msg.message}
        </div>
      ))} */}
    </div>
  );
}
