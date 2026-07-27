export default function SectionTitle({
  subtitle,
  title,
  description,
  align = "center",
  className = "",
}) {
  const alignments = {
    center: "text-center",
    left: "text-left",
  };

  return (
    <div
      className={`max-w-3xl mx-auto mb-12 md:mb-16 ${alignments[align]} ${className}`}
    >
      {subtitle && (
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="text-section text-neutral-900 text-balance">{title}</h2>
      )}
      {description && (
        <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
