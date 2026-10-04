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

export function PageHeader({ title, description, actions, mobileCompact = false }) {
  return (
    <div className={`mb-6 flex flex-col justify-between gap-4 border-b border-[#DDE8E0] pb-5 sm:flex-row sm:items-end ${mobileCompact ? "max-md:mb-4 max-md:gap-0 max-md:border-b-0 max-md:pb-0" : ""}`}>
      <div className="min-w-0">
        <h1 className={`text-2xl font-semibold tracking-[-0.035em] text-[#17241C] sm:text-3xl ${mobileCompact ? "max-md:hidden" : ""}`}>
          {title}
        </h1>
        {description && (
          <p className={`mt-2 max-w-2xl text-sm leading-5 text-[#68736A] ${mobileCompact ? "max-md:mt-0 max-md:text-[#4C4239]" : ""}`}>
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

export function StatusBadge({ value, tone, className = "", wrap = false }) {
  const label = String(value || "Unknown").replaceAll("_", " ");
  const normalized = label.toLowerCase();
  const color =
    tone ||
    (["active", "enabled", "available"].includes(normalized)
      ? "bg-[#386F55]/10 text-[#1A593B] ring-[#386F55]/20"
      : ["disabled", "cancelled", "expired"].includes(normalized)
        ? "bg-[#4C4239]/10 text-[#4C4239] ring-[#4C4239]/15"
        : "bg-[#4C4239]/10 text-[#4C4239] ring-[#4C4239]/15");
  return (
    <span
      title={label}
      className={`inline-flex min-h-7 max-w-full shrink-0 items-center justify-center overflow-hidden rounded-lg px-2.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${
        wrap ? "whitespace-normal" : "whitespace-nowrap"
      } ${color} ${className}`}
    >
      <span
        className={
          wrap
            ? "min-w-0 break-words text-center leading-4"
            : "min-w-0 truncate"
        }
      >
        {label}
      </span>
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
