import { useEffect, useRef, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { usStates } from "@frontend/utils/selectOptons";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Button from "@frontend/components/shared/Button";
import Label from "@frontend/components/shared/Label";
import AccountService from "@frontend/services/account.service";
import AuthContext from "@frontend/contexts/auth-context";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Spinner from "../shared/Spinner";
import ErrorPage from "../notifications/ErrorPage";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";

const selectStyle =
  "col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 *:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

export default function EditUserProfile() {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    userData: {},
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Edit Profile - ChatJam";

    const abortController = new AbortController();
    const accountService = new AccountService(abortController, authContext);

    const fetchPageData = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const data = await accountService.getUserInfo();

        setPage((state) => ({
          ...state,
          userData: data,
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
  }, [authContext]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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
    }
    if (!file) return;
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }; // simulate a click on the 'input' element.

  const handleEditSubmit = async (username, city, state) => {
    setIsProcessing(true);

    const formData = new FormData();
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
      await accountService.editUserAccount(formData);
      navigate("/friends", { replace: true });
    } catch (err) {
      console.error(err);

      if (err.response?.status === 400 && err.response.data?.error) {
        toast.error(err.response.data.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = ({ username, city, state }) => {
    handleEditSubmit(username, city, state);
  };

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (page.error) {
    return <ErrorPage text={page.error} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mt-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 sm:max-w-xl"
        >
          <div className="col-span-full flex items-center gap-x-8">
            {page.userData.userImgSrc ? (
              <img
                alt="user image"
                src={page.userData.userImgSrc}
                className="size-26 flex-none rounded-lg bg-gray-800 object-cover"
              />
            ) : (
              <UserCircleIcon className="size-26 text-gray-400" />
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
                JPG, JPEG or PNG. 1MB max.
              </p>
            </div>
          </div>

          <div className="col-span-full">
            <Label htmlFor="username" labelText="Username" />
            <input
              type="text"
              defaultValue={page.userData.username}
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

          <div className="sm:col-span-3">
            <Label htmlFor="city" labelText="City" />
            <input
              type="city"
              defaultValue={page.userData.city}
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
                defaultValue={page.userData.state || ""}
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
