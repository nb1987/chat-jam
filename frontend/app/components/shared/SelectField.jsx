import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function SelectField({
  htmlFor,
  label,
  optionLabel,
  id,
  name,
  options,
  value,
  onChange,
}) {
  return (
    <>
      <label
        htmlFor={htmlFor}
        className="block text-sm/6 font-medium text-gray-800"
      >
        {label}
      </label>
      <div className="mt-2 grid grid-cols-1">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 *:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6"
        >
          <option value="">{optionLabel}</option>
          {options.map((entry) => (
            <option key={entry.value}>{entry.label}</option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
        />
      </div>
    </>
  );
}
