export default function Card({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        rounded-2xl border border-[#DDE8E0] bg-white p-4 sm:p-5
        ${hover ? "transition-colors hover:border-[#C7D8CC]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
