import React from "react";

const SocketContext = React.createContext({
  socket: null,
  setSocket: () => {},
  unreadCount: {},
  setUnreadCount: () => {},
});

export default SocketContext;
