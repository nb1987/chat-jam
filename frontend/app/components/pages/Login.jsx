import { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthContext from "@frontend/contexts/auth-context";
import AccountService from "@frontend/services/account.service";
import Button from "@frontend/components/shared/Button";
import Label from "@frontend/components/shared/Label";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function Login({ onSuccessfulLogin }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Log in - ChatJam";
  }, []);

  const authContext = useContext(AuthContext);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async (email, password) => {
    setIsProcessing(true);

    const accountService = new AccountService(
      new AbortController(),
      authContext
    );

    try {
      const { tokenPair } = await accountService.loginUser(email, password);
      authContext.setAccessToken(tokenPair.accessToken);
      onSuccessfulLogin(tokenPair);
      navigate("/friends", { replace: true });
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message;
      toast.error(errorMsg || "Unexpected error");
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = ({ email, password }) => {
    handleLogin(email, password);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="ChatJam logo"
          src="/chatjam_with_text.png"
          className="mx-auto h-25 w-auto"
        />
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {errors.email?.type === "required" && (
              <p className="text-red-500">Please enter your email.</p>
            )}
            {errors.email?.type === "pattern" && (
              <p className="text-red-500">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password" labelText="Password" />
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
            {errors.password?.type === "required" && (
              <p className="text-red-500">Please enter password.</p>
            )}
            {(errors.password?.type === "minLength" ||
              errors.password?.type === "maxLength") && (
              <p className="text-red-500">
                Password must be between 6 and 12 characters.
              </p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              isProcessing={isProcessing}
              text="Logging in..."
              buttonStyle={buttonStyle}
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="flex justify-between mt-6">
          <Link
            to="/signup"
            className="font-semibold text-gray-500 hover:text-orange-600"
          >
            Not a member?{" "}
          </Link>

          <Link
            to="/reset-password"
            className="font-semibold text-orange-400 hover:text-orange-600"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
