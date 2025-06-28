import { format } from "date-fns";

// msg = { room_id, user_id, text, created_at }
// myInfo = {id, username, image}
export default function MessageBubble({ msg, myInfo, friendInfo }) {
  const { username: friendName, userImgSrc: friendImg } = friendInfo;
  const { id: myId, username: myName, userImgSrc: myImg } = myInfo;

  const isItMe = msg.user_id === myId;
  const profileImg = isItMe ? myImg : friendImg;
  const profileName = isItMe ? myName : friendName;

  return (
    <div
      className={`flex items-start mb-4 ${
        isItMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isItMe && (
        <img
          src={profileImg}
          alt="profile image"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}

      <div>
        <div
          className={`text-xs mb-1 ${
            isItMe ? "text-right" : "text-left"
          } text-gray-500`}
        >
          {profileName}
        </div>

        <div
          className={`px-3 py-2 rounded-xl max-w-xs text-sm ${
            isItMe
              ? "bg-orange-400 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          {msg.text}
        </div>

        <div className="text-xs text-gray-400 mt-1 px-1">
          {format(new Date(msg.created_at), "HH:mm")}
        </div>
      </div>

      {isItMe && (
        <img
          src={profileImg}
          alt="profile"
          className="w-8 h-8 rounded-full ml-2"
        />
      )}
    </div>
  );
}
