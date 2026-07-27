import { Link } from "react-router-dom";
import Spinner from "../common/Spinner";

export function Breadcrumbs({ organization }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-neutral-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="hover:text-primary" to="/admin">
            Super Admin
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-primary" to="/admin/systems">
            Systems
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-primary" to="/admin/systems/pos">
            Ximo POS
          </Link>
        </li>
        {organization && (
          <>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-800">{organization}</li>
          </>
        )}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm text-neutral-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}

export function StatusBadge({ value, tone }) {
  const normalized = String(value || "unknown").toLowerCase();
  const color =
    tone ||
    (["active", "enabled"].includes(normalized)
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : ["disabled", "cancelled", "expired"].includes(normalized)
        ? "bg-red-50 text-red-700 ring-red-600/20"
        : "bg-amber-50 text-amber-700 ring-amber-600/20");
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${color}`}
    >
      {String(value || "Unknown").replaceAll("_", " ")}
    </span>
  );
}

export function ErrorPanel({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-red-200 bg-red-50 p-5 text-red-800"
    >
      <p className="font-medium">POS data could not be loaded</p>
      <p className="mt-1 text-sm">
        {error?.message || "An unexpected error occurred."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-semibold underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingPanel() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-card border border-neutral-200 bg-white">
      <Spinner size="lg" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function InfoGrid({ items }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-neutral-800">
            {value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
