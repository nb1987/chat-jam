import { useForm } from "react-hook-form";
import Button from "@frontend/components/shared/Button";

const buttonStyle =
  "flex w-full justify-center px-3 py-1.5 text-sm/6 font-semibold text-gray-800";
const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";

export default function EmailSearchForm({ handleSearch, searchState }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSearchSubmit = ({ email }) => {
    handleSearch(email);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSearchSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
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
        />
        <Button
          type="submit"
          text="searching"
          isProcessing={searchState.isSearching}
          buttonStyle={buttonStyle}
        >
          Search
        </Button>
      </div>

      <p className="text-sm font-small text-gray-700">Search with email</p>

      {errors.email && <p className="text-red-500">Please enter email.</p>}
      {errors.email?.type === "pattern" && (
        <p className="text-red-500">Please enter a valid email address.</p>
      )}
    </form>
  );
}
