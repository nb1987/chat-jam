import { useForm } from "react-hook-form";
import Label from "../shared/Label";
import { useState } from "react";
import Button from "../shared/Button";
import AccountService from "@frontend/services/account.service";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm();

  const accountService = new AccountService(new AbortController(), {});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const onPasswordResetAttempt = async ({ email }) => {
    setError("");
    clearErrors();
    setIsProcessing(true);
    try {
      await accountService.resetPasswordRequest(email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occured.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="ChatJam logo"
          src="/chatjam_with_text.png"
          className="mx-auto h-30 w-auto"
        />
      </div>

      <div className="mt-10 text-center sm:mx-auto sm:w-full sm:max-w-sm">
        {success && <p>We've sent a password reset request to your email.</p>}

        {!success && (
          <form
            onSubmit={handleSubmit(onPasswordResetAttempt)}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="email" labelText="Email" />
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
            </div>
            {errors.email?.type === "required" && (
              <p className="text-red-500">Please enter your email.</p>
            )}
            {errors.email?.type === "pattern" && (
              <p className="text-red-500">
                Please enter a valid email address.
              </p>
            )}

            <div>
              <Button
                type="submit"
                isProcessing={isProcessing}
                text="Processing..."
                buttonStyle={buttonStyle}
              >
                Reset password
              </Button>
            </div>
          </form>
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
