import { Link } from "react-router-dom";
import Spinner from "../common/Spinner";

export function Breadcrumbs({ organization }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-[#758176]">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="transition hover:text-primary" to="/admin">
            Super Admin
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="transition hover:text-primary" to="/admin/systems">
            Systems
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="transition hover:text-primary" to="/admin/systems/pos">
            Ximo POS
          </Link>
        </li>
        {organization && (
          <>
            <li aria-hidden="true">/</li>
            <li className="text-[#39443D]">{organization}</li>
          </>
        )}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#E2E6EB] pb-7 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA2AD]">
          Ximo operations
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-[#17241C] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68736A] sm:text-base">
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
      ? "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
      : ["disabled", "cancelled", "expired"].includes(normalized)
        ? "bg-[#FCECEA] text-[#A13E35] ring-[#EDC5C0]"
        : "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]");
  return (
    <span
      className={`inline-flex h-7 w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold capitalize ring-1 ring-inset ${color}`}
    >
      {String(value || "Unknown").replaceAll("_", " ")}
    </span>
  );
}

export function ErrorPanel({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-[#EDC5C0] bg-[#FCECEA] p-5 text-[#8A3028]"
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
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-[#E2E6EB] bg-white">
      <Spinner size="lg" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function InfoGrid({ items }) {
  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#879187]">
            {label}
          </dt>
          <dd className="mt-1.5 text-sm font-semibold text-[#26342A]">
            {value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
