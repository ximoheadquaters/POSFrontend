import { Link } from "react-router-dom";
import Spinner from "../common/Spinner";

export function AdminBreadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-[#758176]">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="transition hover:text-primary" to="/admin">
            Super Admin
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="contents">
            <span aria-hidden="true">/</span>
            {item.to ? (
              <Link className="transition hover:text-primary" to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className="text-[#39443D]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminLoading() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-[#E2E6EB] bg-white">
      <Spinner size="lg" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function AdminError({ error, retry }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-[#EDC5C0] bg-[#FCECEA] p-5 text-[#8A3028]"
    >
      <p className="font-medium">Data could not be loaded</p>
      <p className="mt-1 text-sm">{error?.message}</p>
      {retry && (
        <button
          className="mt-3 text-sm font-semibold underline"
          onClick={retry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
