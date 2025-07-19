import React from "react";

const SocketContext = React.createContext({
  socket: null,
  setSocket: () => {},
  userExitedOnPurpose: { current: false },
});

export default SocketContext;
