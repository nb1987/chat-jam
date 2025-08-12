import { subscribePush } from "@frontend/services/pushClient";

export default function NotificationPrompt({ userId, setNotifyStatus }) {
  const handleAllow = async () => {
    const permission = await Notification.requestPermission();
    setNotifyStatus("granted");
    if (permission === "granted") await subscribePush(userId);
  };

  const handleDeny = async () => {
    setNotifyStatus("denied");
  };

  return (
    <div className="p-12 border-1px solid br-8 m-12">
      <div className="flex items-center justify-center">
        Notify me when new messages arrive.
      </div>
      <button onClick={handleAllow} className="px-10">
        Allow
      </button>
      <button onClick={handleDeny} className="px-10">
        Deny
      </button>
    </div>
  );
}
