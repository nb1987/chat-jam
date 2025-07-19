import React from "react";

const CurrentRoomContext = React.createContext({
  currentRoomId: null,
  setCurrentRoomId: () => {},
});

export default CurrentRoomContext;
