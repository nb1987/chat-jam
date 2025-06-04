import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "@frontend/contexts/auth-context";
import AccountService from "@frontend/services/account.service";

export default function Friends() {
  const authContext = useContext(AuthContext);
  const decodedUser = jwtDecode(authContext.accessToken);

  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    userData: [],
    // listOfFriends: null,
  });

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    const abortController = new AbortController();
    const accountService = new AccountService(abortController, authContext);

    const fetchUserInfo = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const data = await accountService.getUserInfo(decodedUser.id);

        setPage((state) => ({ ...state, userData: data, isLoading: false }));
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
          setPage((state) => ({
            ...state,
            error: "Unexpected error while loading data",
            isLoading: false,
          }));
        }
      }
    };
    fetchUserInfo();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <ul
        role="list of friends"
        className="divide-y divide-gray-200 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <li key={1} className="py-4">
          {page.userData.username}
        </li>
        <li key={2} className="py-4">
          60 friends
        </li>
      </ul>
    </>
  );
}
