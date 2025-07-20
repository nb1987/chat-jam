import {
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/react";
import { useContext, useState } from "react";
import ChatRoomSettingModal from "@frontend/components/ui/ChatRoom/ChatRoomSettingModal";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import ChatService from "@frontend/services/chat.service";
import AuthContext from "@frontend/contexts/auth-context";
import toast from "react-hot-toast";
import Toggle from "@frontend/components/shared/Toggle";

export default function ChatRoomSettings({
  friendId,
  blockFriend,
  setBlockFriend,
}) {
  const [exitModalOpens, setExitModalOpens] = useState(false);
  const { currentRoomId, setCurrentRoomId } = useContext(CurrentRoomContext);
  const authContext = useContext(AuthContext);
  const abortController = new AbortController();
  const chatService = new ChatService(abortController, authContext);

  const exitChat = async () => {
    try {
      await chatService.exitChatRoom(currentRoomId);
      setCurrentRoomId(null);
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        toast.error(err.message);
      }
    }
  };

  return (
    <div>
      <Menu as="div" className="relative">
        <MenuButton className="focus:outline-none">
          <ChevronRightIcon className="size-5 text-gray-400 cursor-pointer" />
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10 outline-none">
          <div>
            <div className="p-2 hover:bg-gray-50">
              <div className="flex items-center cursor-pointer">
                <span className="ml-1 mr-2">Block this user</span>
                <Toggle
                  blockFriend={blockFriend}
                  handleClick={() => {
                    setBlockFriend((prev) => {
                      return !prev;
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <MenuItem>
            {({ close }) => (
              <div className="p-2 hover:bg-gray-50">
                <div
                  onClick={() => {
                    close();
                    setExitModalOpens(true);
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <ArrowRightStartOnRectangleIcon className="size-4 text-gray-600" />
                  <span className="ml-2">Exit chat</span>
                </div>
              </div>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>

      {exitModalOpens && (
        <ChatRoomSettingModal
          modalOpens={exitModalOpens}
          onClose={() => setExitModalOpens(false)}
          warningText="You won't be able to access this chat again."
          confirmText="exit this chat"
          action={exitChat}
        />
      )}
    </div>
  );
}

//  {clearModalOpens && (
//       <ChatRoomSettingModal
//         modalOpens={clearModalOpens}
//         onClose={() => setClearModalOpens(false)}
//         warningText="This will permanently delete all the messages."
//         confirmText="clear chat history"
//       />
//     )}
