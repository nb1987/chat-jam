import { useEffect, useContext, useState } from "react";
import AuthContext from "@frontend/contexts/auth-context";
import Button from "../shared/Button";
import InputField from "../shared/InputField";

const buttonStyle =
  "flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function Login() {
  useEffect(() => {
    document.title = "Log in - ChatJam";
  }, []);

  const authContext = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="/chatjam_with_text.png"
          className="mx-auto h-25 w-auto"
        />
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form action="#" method="POST" className="space-y-6">
          <div>
            <InputField
              htmlFor="email"
              label="Email address"
              id="email"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </div>

          <div>
            <InputField
              htmlFor="password"
              label="Password"
              id="password"
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="password"
            />
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
          <a
            href="#"
            className="font-semibold text-gray-500 hover:text-orange-600"
          >
            Not a member?{" "}
          </a>

          <a
            href="#"
            className="font-semibold text-orange-400 hover:text-orange-600"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
