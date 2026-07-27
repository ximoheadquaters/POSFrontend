export default function Card({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        bg-white border border-neutral-200 rounded-card p-6
        ${hover ? "transition-shadow duration-200 hover:shadow-lg" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
