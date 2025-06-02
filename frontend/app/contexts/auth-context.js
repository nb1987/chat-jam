import React from "react";

const AuthContext = React.createContext({
  accessToken: null,
  setAccessToken: () => {},
});

export default AuthContext;
