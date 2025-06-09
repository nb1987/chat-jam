import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

export default function SearchFormModal({ open, onClose, label }) {
  return (
    <div>
      <Dialog open={open} onClose={onClose} className="relative z-10">
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
                    onClick={onClose}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-6 mb-10">
                <p className="text-lg font-medium text-gray-900">{label}</p>
                Form
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
