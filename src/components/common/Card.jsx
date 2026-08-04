export default function Card({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        rounded-2xl border border-[#E2E6EB] bg-white p-6
        ${hover ? "transition duration-200 hover:-translate-y-0.5 hover:border-[#D2D7DE] hover:shadow-[0_18px_45px_rgba(31,39,52,0.08)]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
