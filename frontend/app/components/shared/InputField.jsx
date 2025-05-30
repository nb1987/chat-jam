export default function InputField({
  htmlFor,
  label,
  id,
  value,
  name,
  onChange,
  type,
  autoComplete,
}) {
  return (
    <>
      <label
        htmlFor={htmlFor}
        className="block text-sm/6 font-medium text-gray-800"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          value={value}
          name={name}
          type={type}
          autoComplete={autoComplete}
          onChange={onChange}
          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6"
        />
      </div>
    </>
  );
}
