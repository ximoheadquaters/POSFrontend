const variants = {
  primary: "bg-primary text-white hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "border border-[#E0E4E8] bg-white text-[#303746] hover:bg-[#F3F5F6] active:bg-[#EAEDF0]",
  danger:
    "bg-[#B84A42] text-white hover:bg-[#A13E35] active:bg-[#8F352F]",
  ghost: "bg-transparent text-primary hover:bg-[#F3F5F6]",
};

const sizes = {
  sm: "min-h-10 px-3.5 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-xl font-semibold
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
