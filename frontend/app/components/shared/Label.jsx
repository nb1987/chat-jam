export default function Label({ htmlFor, labelText }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm/6 font-medium text-gray-800"
    >
      {labelText}
    </label>
  );
}
