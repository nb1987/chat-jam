import React from "react";

const FriendsContext = React.createContext({
  friends: [],
  setFriends: () => {},
});

export default FriendsContext;
