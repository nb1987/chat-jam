import React from "react";

const SocketContext = React.createContext({
  socket: null,
  setSocket: () => {},
});

export default SocketContext;
