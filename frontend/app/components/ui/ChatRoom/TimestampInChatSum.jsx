import { format, isToday } from "date-fns";

export default function TimestampInChatSum({ lastMsgAt }) {
  const msgDate = new Date(lastMsgAt);
  if (isNaN(msgDate)) {
    return "?:??";
  }

  const modifiedLastDate = isToday(msgDate)
    ? format(msgDate, "HH:mm")
    : format(msgDate, "yyyy/MM/dd");

  return modifiedLastDate;
}
