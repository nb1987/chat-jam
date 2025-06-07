import UserProfile from "@frontend/components/ui/UserProfile";
import UsersService from "@frontend/services/users.service";
import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import Spinner from "@frontend/components/shared/Spinner";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import AuthContext from "@frontend/contexts/auth-context";

export default function Search() {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    usersData: [],
  });

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    const abortController = new AbortController();
    const usersService = new UsersService(abortController, authContext);

    const fetchPageData = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const allUsers = await usersService.getAllUsersExceptSelf(
          decodedUser.id
        );

        setPage((state) => ({
          ...state,
          usersData: allUsers,
          isLoading: false,
        }));
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

  return (
    <>
      {page.isLoading && <Spinner />}
      {page.error && <ErrorPage text={page.error} />}

      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {page.usersData.map((user) => (
          <li
            key={user.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm"
          >
            <UserProfile user={user} />
          </li>
        ))}
      </ul>
    </>
  );
}
