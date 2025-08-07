import { format } from "date-fns";

export default function TimestampInRoom({ createdAt }) {
  return (
    <span className="text-xs text-gray-500">
      {createdAt && !isNaN(new Date(createdAt))
        ? format(new Date(createdAt), "HH:mm")
        : "??:??"}
    </span>
  );
}
