import { useEffect, useRef, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { usStates } from "@frontend/utils/selectOptons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Button from "@frontend/components/shared/Button";
import Label from "@frontend/components/shared/Label";
import AccountService from "@frontend/services/account.service";
import AuthContext from "@frontend/contexts/auth-context";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";

const selectStyle =
  "col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 *:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

// user can know if the email already exists while typing.

export default function SignUp({ onSuccessfulLogin }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Sign up - ChatJam";
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const authContext = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]; // temp file in this function.
    setSelectedFile(file);

    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG and PNG files are allowed.");
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error("File is too large. Max size is 1MB.");
        return;
      }

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
    if (!file) return;
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }; // simulate a click on the 'input' element.

  const handleSignUp = async (email, password, username, city, state) => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("city", city);
    formData.append("state", state);

    if (selectedFile) {
      formData.append("userImgSrc", selectedFile);
    }

    const accountService = new AccountService(
      new AbortController(),
      authContext
    );

    try {
      const { tokenPair } = await accountService.createUserAccount(formData);
      authContext.setAccessToken(tokenPair.accessToken);
      onSuccessfulLogin(tokenPair);
      navigate("/friends", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = ({ email, password, username, city, state }) => {
    handleSignUp(email, password, username, city, state);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mt-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 sm:max-w-xl"
        >
          <div className="col-span-full flex items-center gap-x-8">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile image preview"
                className="w-24 h-24 rounded-full object-cover"
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
            <Label htmlFor="username" labelText="Username" />
            <input
              type="text"
              id="username"
              name="username"
              {...register("username", {
                required: true,
              })}
              className={inputStyle}
            />
            {errors.username?.type === "required" && (
              <p className="text-red-500">Please enter your username.</p>
            )}
          </div>

          <div className="col-span-full">
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

          <div className="col-span-full">
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

          <div className="sm:col-span-3">
            <Label htmlFor="city" labelText="City" />
            <input
              type="city"
              id="city"
              name="city"
              {...register("city", {
                required: true,
              })}
              className={inputStyle}
            />
            {errors.city && <p className="text-red-500">Please enter city.</p>}
          </div>

          <div className="sm:col-span-3">
            <Label htmlFor="state" labelText="State" />
            <div className="mt-2 grid grid-cols-1">
              <select
                id="state"
                name="state"
                className={selectStyle}
                {...register("state", { required: "State is required" })}
              >
                <option value="">Select your state</option>
                {usStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
              />
              {errors.state && (
                <p className="text-red-500">Please enter state.</p>
              )}
            </div>
          </div>

          <div className="mt-4 mb-8 flex">
            <Button
              type="submit"
              isProcessing={isProcessing}
              buttonStyle={buttonStyle}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
