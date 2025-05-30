import { Route, Routes } from "react-router-dom";
import LandingAfterLogin from "@frontend/components/pages/LandingAfterLogin";
import Login from "@frontend/components/pages/Login";
import SignUp from "./components/pages/SignUp";
import Settings from "@frontend/components/pages/Settings";
import PageNotFound from "@frontend/components/pages/PageNotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/after-login" element={<LandingAfterLogin />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
