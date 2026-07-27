export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        className={`
          w-full px-4 py-3 rounded-button border
          bg-white text-neutral-800 placeholder-neutral-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          ${error ? "border-red-400 focus:ring-red-400" : "border-neutral-200 hover:border-neutral-300"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
