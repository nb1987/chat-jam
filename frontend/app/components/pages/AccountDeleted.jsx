import { CheckIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function AccountDeleted() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center mt-24">
      <div className="mx-auto max-w-3xl">
        <div
          className="mx-auto w-20 h-20 rounded-full bg-green-400
             flex items-center justify-center shadow-xl
             ring-4 ring-emerald-100 mb-10 animate-in fade-in zoom-in duration-300"
        >
          <CheckIcon className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">Account Deleted</h1>
        <p className="mt-2 text-gray-600">
          Your account has been permanently removed.
        </p>

        <div className="flex flex-col items-center justify-center mt-10">
          <Link
            to="/"
            className="px-6 py-2 text-gray-400 hover:text-gray-600 border-b border-transparent hover:border-gray-300 pb-0.5 transition"
          >
            Return to Homepage
          </Link>
          <Link
            to="/signup"
            className="py-3 text-sm text-gray-400 hover:text-gray-600 border-b border-transparent hover:border-gray-300 pb-0.5 transition"
          >
            Changed your mind? You can sign up again anytime.
          </Link>
        </div>
      </div>
    </div>
  );
}
