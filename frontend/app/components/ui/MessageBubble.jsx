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
      {!isItMe &&
        (profileImg ? (
          <img
            alt="user image"
            src={profileImg.replace(
              "/upload/",
              "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
            )}
            className="size-8 shrink-0 rounded-full mr-2"
          />
        ) : (
          <span className="inline-flex items-center justify-center size-14 rounded-full bg-gray-100">
            <UserIcon className="h-10 w-10 text-gray-500" />
          </span>
        ))}

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

      {isItMe &&
        (profileImg ? (
          <img
            alt="user image"
            src={profileImg.replace(
              "/upload/",
              "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
            )}
            className="size-8 shrink-0 rounded-full ml-2"
          />
        ) : (
          <span className="inline-flex items-center justify-center size-14 rounded-full bg-gray-100">
            <UserIcon className="h-10 w-10 text-gray-500" />
          </span>
        ))}
    </div>
  );
}
