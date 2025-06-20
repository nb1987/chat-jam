import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import Login from "@frontend/components/pages/Login";
import SignUp from "@frontend/components/pages/SignUp";
import Friends from "@frontend/components/pages/Friends";
import Chat from "@frontend/components/pages/Chat";
import Explore from "@frontend/components/pages/Explore";
import PageNotFound from "@frontend/components/notifications/PageNotFound";
import Spinner from "@frontend/components/shared/Spinner";
import MainLayout from "@frontend/components/layout/MainLayout";
import AccountService from "@frontend/services/account.service";
import FriendsContext from "@frontend/contexts/friends-context";
import AuthContext from "@frontend/contexts/auth-context";
import SocketContext from "@frontend/contexts/socket-context";
import { socket as socketInstance } from "@frontend/services/socket";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

    if (!accessToken) {
      restoreAccessToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      <FriendsContext.Provider value={{ friends, setFriends }}>
        <SocketContext.Provider value={{ socket, setSocket }}>
          <Toaster position="top-center" reverseOrder={false} />

          {isLoading ? (
            <Spinner />
          ) : (
            <Routes>
              <Route
                index
                element={
                  accessToken ? (
                    <Navigate to="/friends" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              <Route element={<MainLayout />}>
                <Route path="/friends" element={<Friends />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/explore" element={<Explore />} />
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
