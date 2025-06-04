import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Button from "../shared/Button";
import SelectField from "../shared/SelectField";
import InputField from "../shared/InputField";
import { usStates } from "@frontend/utils/selectOptons";
import AccountService from "@frontend/services/account.service";
import AuthContext from "@frontend/contexts/auth-context";

export default function SignUp() {
  useEffect(() => {
    document.title = "Sign up - ChatJam";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userImgSrc, setUserImgSrc] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const authContext = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File is too large. Max size is 1MB.");
        return;
      }
    }
    if (!file) return;

    const reader = new FileReader(); // file reading object is created

    reader.onloadend = () => {
      setUserImgSrc(reader.result);
    }; // fires when reading is finished. 'reader.result' is encoded string of the file.
    reader.readAsDataURL(file); // read the file and encode it.
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }; // simulate a click on the 'input' element.

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const accountService = new AccountService(
      new AbortController(),
      authContext
    );
    try {
      const result = await accountService.createUserAccount(
        email,
        password,
        username,
        userImgSrc,
        city,
        state
      );
      authContext.setAccessToken(result.accessToken);
      navigate("/friends", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mt-12">
        <form
          method="POST"
          onSubmit={handleSignUp}
          className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 sm:max-w-xl"
        >
          <div className="col-span-full flex items-center gap-x-8">
            {userImgSrc ? (
              <img
                alt="user image"
                src={userImgSrc}
                className="size-24 flex-none rounded-lg bg-gray-800 object-cover"
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-gray-400" />
            )}

            <input
              ref={fileInputRef}
              type="file"
              name="userImgSrc"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div>
              <Button
                onClick={triggerFileSelect}
                type="button"
                buttonStyle="underline px-3 py-2 text-sm font-semibold text-gray-600 hover:text-blue-500"
              >
                Change profile image
              </Button>
              <p className="mt-2 ml-3 text-xs/5 text-gray-400">
                JPG or PNG. 1MB max.
              </p>
            </div>
          </div>

          <div className="col-span-full">
            <InputField
              htmlFor="username"
              label="Username"
              id="username"
              value={username}
              name="username"
              onChange={(e) => setUsername(e.target.value)}
              type="username"
              autoComplete="username"
            />
          </div>
          <div className="col-span-full">
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
          <div className="col-span-full">
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
          <div className="sm:col-span-3">
            <InputField
              htmlFor="city"
              label="City"
              id="city"
              value={city}
              name="city"
              onChange={(e) => setCity(e.target.value)}
              type="city"
              autoComplete="city"
            />
          </div>
          <div className="sm:col-span-3">
            <SelectField
              htmlFor="state"
              label="State"
              optionLabel="Select your state"
              id="state"
              name="state"
              options={usStates}
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>

          <div className="mt-4 mb-8 flex">
            <Button
              type="submit"
              isProcessing={isProcessing}
              buttonStyle="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
