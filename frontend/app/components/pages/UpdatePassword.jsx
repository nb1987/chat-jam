import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import Button from "@frontend/components/shared/Button";
import AccountService from "@frontend/services/account.service";
import Label from "@frontend/components/shared/Label";
import ErrorPage from "@frontend/components/notifications/ErrorPage";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function UpdatePassword({ onSuccessfulLogin }) {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [updatePwSuccess, setUpdatePwSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm();

  const accountService = new AccountService(new AbortController(), {});
  const resetToken = searchParams.get("token");

  const onPasswordUpdate = async ({ password }) => {
    try {
      clearErrors();
      setIsProcessing(true);
      const result = await accountService.updatePassword(resetToken, password);
      setUpdatePwSuccess(true);
      setTimeout(() => {
        onSuccessfulLogin(result.tokenPair);
      }, 2500);
    } catch (err) {
      const errorMsg = err?.response?.data?.error;
      setError(errorMsg || "Unexpected error");
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
        {updatePwSuccess && (
          <>
            <div className="mt-6 text-center text-xl">
              <p>
                Your password has been successfully reset, and you are now
                signed in. You'll be redirected in just a moment...
              </p>
            </div>
          </>
        )}

        {!updatePwSuccess && (
          <form onSubmit={handleSubmit(onPasswordUpdate)} className="space-y-6">
            <div>
              <Label htmlFor="password" labelText="New Password" />
              <input
                type="password"
                id="password"
                name="password"
                {...register("password", {
                  required: true,
                  minLength: 6,
                  maxLength: 12,
                })}
                className={inputStyle}
              />
              <div className="mt-2">
                <Label htmlFor="password" labelText="Confirm Password" />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: true,
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                  })}
                  className={inputStyle}
                />
              </div>
            </div>
            {errors.email?.type === "required" && (
              <p className="text-red-500">Please enter new password.</p>
            )}
            {errors.password?.type === "minLength" ||
              (errors.password?.type === "maxLength" && (
                <p className="text-red-500">
                  Password must be between 6 and 12 characters.
                </p>
              ))}
            {errors.confirmPassword && (
              <p className="text-red-500">{errors.confirmPassword.message}</p>
            )}
            <div>
              <Button
                type="submit"
                isProcessing={isProcessing}
                text="Processing..."
                buttonStyle={buttonStyle}
              >
                Reset new password
              </Button>
            </div>
          </form>
        )}
        {error && <ErrorPage text={error} />}
      </div>
    </div>
  );
}
