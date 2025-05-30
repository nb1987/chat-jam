import * as jwt_decode from "jwt-decode";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router";
import AuthContext from "@frontend/contexts/auth-context";

export default function LandingPageAfterLogin() {
  useEffect(() => {
    document.title = "ChatJam, Talk Smart";
  }, []);

  const authContext = useContext(AuthContext);

  //   const decoded = jwt_decode(token);
  // console.log(decoded);

  return <></>;
}
