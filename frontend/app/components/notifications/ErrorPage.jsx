export default function ErrorPage({ text }) {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          {text || "An unexpected error occurred."}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/login"
            className="rounded-md bg-sky-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Go back home
          </a>
        </div>
      </div>
    </main>
  );
}
