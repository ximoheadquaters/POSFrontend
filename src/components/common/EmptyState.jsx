export default function EmptyState({
  title = "No data found",
  description,
  icon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-neutral-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-neutral-700">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
