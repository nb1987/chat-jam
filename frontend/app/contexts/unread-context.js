import React from "react";

const UnreadContext = React.createContext({
  unreadCount: {},
  setUnreadCount: () => {},
});

export default UnreadContext;
