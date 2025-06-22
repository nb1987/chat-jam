import { format } from "date-fns";

// msg = { room_id, user_id, text, created_at }
// myInfo = {id, username, image}
export default function MessageBubble({ msg, myInfo }) {
  const isMine = msg.user_id === myInfo.id;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div>
        <div
          className={`px-3 py-2 rounded-xl max-w-xs text-sm
            ${
              isMine
                ? "bg-orange-400 text-white rounded-br-none"
                : "bg-gray-200 text-gray-900 rounded-bl-none"
            }
          `}
        >
          {msg.text}
        </div>
        <div className="text-xs text-gray-400 mt-1 px-1">
          {format(new Date(msg.created_at), "HH:mm")}
        </div>
      </div>
    </div>
  );
}
