import { format, isToday, isYesterday } from "date-fns";

export default function DateSeparator({ createdAt }) {
  const date = new Date(createdAt);
  let label;

  if (isToday(date)) {
    label = "Today";
  } else if (isYesterday(date)) {
    label = "Yesterday";
  } else {
    label = format(date, "MM. dd. yyyy");
  }

  return (
    <div className="my-4 px-8">
      <div className="flex items-center">
        <div aria-hidden="true" className="flex-1 border-t border-gray-300" />
        <span className="mx-2 bg-white px-2 text-sm text-gray-500">
          {label}
        </span>
        <div aria-hidden="true" className="flex-1 border-t border-gray-300" />
      </div>
    </div>
  );
}

// msg.createdAt = "2025-07-17T22:46:32.015Z"

// new Date("2025-07-17T22:46:32.015Z") = Fri Jul 18 2025 07:46:32 GMT+0900

// new Date("2025-07-17T22:46:32.015Z").toDateString() = Fri Jul 18 2025
