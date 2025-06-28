import { useForm } from "react-hook-form";
import Button from "@frontend/components/shared/Button";
import UsersService from "@frontend/services/users.service";
import { useContext } from "react";
import AuthContext from "@frontend/contexts/auth-context";

const buttonStyle =
  "flex w-full justify-center px-3 py-1.5 text-sm/6 font-semibold text-gray-800";
const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";

export default function UsernameSearchForm({ setSearchState }) {
  const authContext = useContext(AuthContext);
  const abortController = new AbortController();
  const usersService = new UsersService(abortController, authContext);
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSearchSubmit = async ({ username }) => {
    try {
      setSearchState((state) => ({
        ...state,
        isSearching: true,
      }));
      const result = await usersService.searchUserByUsername(username);
      setSearchState({
        searchedUser: result,
        isSearching: false,
        hasSearched: true,
        error: null,
      });
      reset();
      clearErrors();
    } catch (err) {
      console.error(err);
      if (!abortController.signal.aborted) {
        console.error(err);
        setSearchState((state) => ({
          ...state,
          isSearching: false,
          error: "Unexpected error while loading data",
        }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSearchSubmit)} className="space-y-6">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          id="username"
          name="username"
          {...register("username", { required: true })}
          className={inputStyle}
          placeholder="Enter the username"
        />
        <button type="submit" buttonStyle={buttonStyle}>
          Search
        </button>
      </div>

      {errors.username && (
        <p className="text-red-500">Please enter username.</p>
      )}
    </form>
  );
}
