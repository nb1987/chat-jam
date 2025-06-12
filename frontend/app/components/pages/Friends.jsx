import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "@frontend/contexts/auth-context";
import FriendsContext from "@frontend/contexts/friends-context";
import AccountService from "@frontend/services/account.service";
import Spinner from "@frontend/components/shared/Spinner";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import ListedFriend from "@frontend/components/ui/ListedFriend";
import Profile from "@frontend/components/shared/Profile";

export default function Friends() {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;
  const { friends, setFriends } = useContext(FriendsContext);
  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    userData: {},
  });

  const [dialogOpens, setDialogOpens] = useState(false);

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    const abortController = new AbortController();
    const accountService = new AccountService(abortController, authContext);

    const fetchPageData = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const data = await accountService.getUserInfo();
        const fetchedFriends = await accountService.getUserFriends();

        setPage((state) => ({
          ...state,
          userData: data,
          isLoading: false,
        }));
        setFriends(fetchedFriends);
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

    fetchPageData();

    return () => {
      abortController.abort();
    };
  }, []);

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (page.error) {
    return <ErrorPage text={page.error} />;
  }

  return (
    <>
      {!page.isLoading && !page.error && (
        <ul
          role="list of friends"
          className="divide-y divide-gray-200 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <li key={1} onClick={() => setDialogOpens(true)} className="py-1">
            <ListedFriend person={page.userData} />
          </li>
          <li key={2} className="py-1">
            {friends.length === 0 ? (
              <p className="mt-4 ml-4">No friends yet</p>
            ) : (
              friends.map((f) => <ListedFriend key={f.id} person={f} />)
            )}
          </li>
        </ul>
      )}

      {dialogOpens && (
        <Profile
          userInfo={page.userData}
          dialogOpens={dialogOpens}
          setDialogOpens={setDialogOpens}
        />
      )}
    </>
  );
}
