import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import Login from "@frontend/components/pages/Login";
import SignUp from "@frontend/components/pages/SignUp";
import Friends from "@frontend/components/pages/Friends";
import Chat from "@frontend/components/pages/Chat";
import Explore from "@frontend/components/pages/Explore";
import EditUserProfile from "@frontend/components/pages/EditUserProfile";
import ResetPassword from "@frontend/components/pages/ResetPassword";
import UpdatePassword from "@frontend/components/pages/UpdatePassword";
import AccountSettings from "@frontend/components/pages/AccountSettings";
import AccountDeleted from "@frontend/components/notifications/AccountDeleted";
import PageNotFound from "@frontend/components/notifications/PageNotFound";
import Spinner from "@frontend/components/shared/Spinner";
import MainLayout from "@frontend/components/layout/MainLayout";
import AccountService from "@frontend/services/account.service";
import FriendsContext from "@frontend/contexts/friends-context";
import AuthContext from "@frontend/contexts/auth-context";
import SocketContext from "@frontend/contexts/socket-context";
import { socket as socketInstance } from "@frontend/services/socket";
import useSocketDisconnectAlert from "./components/ui/ChatRoom/useSocketDisconnectAlert";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userExitedOnPurpose = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const publicRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/update-password",
  ];

  useSocketDisconnectAlert();

  useEffect(() => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, {});

    const restoreAccessToken = async () => {
      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          setIsLoading(false);
          setSocket(socketInstance);
          navigate("/login");
        } else {
          const tokenPair = await accountService.getTokenPair(refreshToken);
          setAccessToken(tokenPair.accessToken);
          setSocket(socketInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.log(
          "User not logged in or refreshToken is invalid",
          err.message
        );
        if (!abortController.signal.aborted) {
          if (err.status === 401 && window.location.pathname !== "/login") {
            Cookies.remove("refreshToken", { path: "/" });
            navigate("/login");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!accessToken && !publicRoutes.includes(location.pathname)) {
      restoreAccessToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  const loginHandler = (tokenPair) => {
    Cookies.set("refreshToken", tokenPair.refreshToken, { expires: 14 });
    setAccessToken(tokenPair.accessToken);
    navigate("/friends");
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      <FriendsContext.Provider value={{ friends, setFriends }}>
        <SocketContext.Provider
          value={{ socket, setSocket, userExitedOnPurpose }}
        >
          <Toaster position="top-center" reverseOrder={false} />

          {isLoading ? (
            <Spinner />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  !accessToken &&
                  !publicRoutes.some((route) =>
                    location.pathname.startsWith(route)
                  ) ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <Navigate to="/friends" replace />
                  )
                }
              />

              <Route
                path="/login"
                element={<Login onSuccessfulLogin={loginHandler} />}
              />
              <Route
                path="/signup"
                element={<SignUp onSuccessfulLogin={loginHandler} />}
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/update-password"
                element={<UpdatePassword onSuccessfulLogin={loginHandler} />}
              />
              <Route path="/account-deleted" element={<AccountDeleted />} />

              <Route element={<MainLayout />}>
                <Route path="/friends" element={<Friends />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/edit-profile" element={<EditUserProfile />} />
                <Route path="/account-settings" element={<AccountSettings />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          )}
        </SocketContext.Provider>
      </FriendsContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
