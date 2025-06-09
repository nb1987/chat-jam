import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserIcon, PencilIcon } from "@heroicons/react/24/solid";

export default function Profile({ userInfo, dialogOpens, setDialogOpens }) {
  const { id, username, userImgSrc } = userInfo;
  const [editButtonClicked, setEditButtonClicked] = useState(false);

  return (
    <div>
      <Dialog open={dialogOpens} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-sm min-h-[20rem] sm:min-h-[24rem] transform overflow-hidden rounded-lg bg-white px-4 pt-4 text-left shadow-xl transition-all sm:p-6"
            >
              <div className="px-4 sm:px-6">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    onClick={() => setDialogOpens(false)}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-6">
                {userImgSrc ? (
                  <img
                    alt="user image"
                    src={userImgSrc}
                    className="size-16 rounded-full"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center size-22 rounded-full bg-gray-100">
                    <UserIcon className="h-14 w-14 text-gray-500" />
                  </span>
                )}
                <p className="text-lg font-medium text-gray-900">{username}</p>
              </div>

              <div
                className="border-t border-gray-300 mt-12 pt-6 sm:pb-0.5 flex flex-col items-center justify-center gap-2 py-4"
                onClick={() => setEditButtonClicked(true)}
              >
                <PencilIcon className="h-4 w-4 text-gray-700" />

                <button
                  type="submit"
                  className="inline-flex justify-center py-2 text-sm font-semibold text-gray-700"
                >
                  Edit Profile
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
