import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Login from "@frontend/components/pages/Login";
import SignUp from "./components/pages/SignUp";
import Settings from "@frontend/components/pages/Settings";
import AddFriend from "@frontend/components/pages/AddFriend";
import Friends from "@frontend/components/pages/Friends";
import Chat from "@frontend/components/pages/Chat";
//import Profile from "@frontend/components/pages/Profile";
import Search from "@frontend/components/pages/Search";
import PageNotFound from "@frontend/components/notifications/PageNotFound";
import AuthContext from "@frontend/contexts/auth-context";
import MainLayout from "@frontend/components/layout/MainLayout";

function App() {
  const [accessToken, setAccessToken] = useState(null);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<MainLayout />}>
          <Route path="/friends" element={<Friends />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/search" element={<Search />} />
          <Route path="/add-friend" element={<AddFriend />} />
          {/* <Route path="/profile/:username" element={<Profile />} /> */}

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
