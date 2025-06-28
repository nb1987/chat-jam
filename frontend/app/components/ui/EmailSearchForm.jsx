import { useForm } from "react-hook-form";
import UsersService from "@frontend/services/users.service";
import { useContext } from "react";
import AuthContext from "@frontend/contexts/auth-context";

const buttonStyle =
  "flex w-full ml-2 justify-center px-3 py-1.5 text-sm/6 font-semibold text-gray-800";
const inputStyle =
  "block w-full flew-grow rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";

// searchState = {searchedUser, isSearching, hasSearched, error}
export default function EmailSearchForm({ setSearchState }) {
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

  const onSearchSubmit = async ({ email }) => {
    try {
      setSearchState((state) => ({
        ...state,
        isSearching: true,
      }));
      const result = await usersService.searchUserByEmail(email);
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
      <div className="flex items-center justify-between gap-2 w-full">
        <input
          type="text"
          id="email"
          name="email"
          {...register("email", {
            required: true,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            },
          })}
          className={inputStyle}
          placeholder="Enter the user's email address"
        />
        <button type="submit" buttonStyle={buttonStyle}>
          Search
        </button>
      </div>

      {errors.email?.type === "required" && (
        <p className="text-red-500">Please enter email.</p>
      )}
    </form>
  );
}
