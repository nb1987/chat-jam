import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "@frontend/components/pages/Login";
import SignUp from "@frontend/components/pages/SignUp";
import AddFriend from "@frontend/components/pages/AddFriend";
import Friends from "@frontend/components/pages/Friends";
import Chat from "@frontend/components/pages/Chat";
import Search from "@frontend/components/pages/Search";
import PageNotFound from "@frontend/components/notifications/PageNotFound";
import AuthContext from "@frontend/contexts/auth-context";
import MainLayout from "@frontend/components/layout/MainLayout";
import AccountService from "@frontend/services/account.service";
import Spinner from "@frontend/components/shared/Spinner";
import { Toaster } from "react-hot-toast";

function App() {
  const [accessToken, setAccessToken] = useState(null);
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
          navigate("/login");
        } else {
          const tokenPair = await accountService.getTokenPair(refreshToken);

          setAccessToken(tokenPair.accessToken);
          setIsLoading(false);
        }
      } catch (err) {
        console.log("User not logged in or refreshing expired", err.message);
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
      <Toaster position="top-center" reverseOrder={false} />

      {isLoading ? (
        <Spinner />
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<MainLayout />}>
            <Route path="/friends" element={<Friends />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/search" element={<Search />} />
            <Route path="/add-friend" element={<AddFriend />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      )}
    </AuthContext.Provider>
  );
}

export default App;
