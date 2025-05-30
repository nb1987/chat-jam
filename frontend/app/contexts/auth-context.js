import React from "react";

const AuthContext = React.createContext({
  accessToken: null,
  setAccessToken: () => {},
  isNewUser: false,
  setIsNewUser: () => {},
});

export default AuthContext;
