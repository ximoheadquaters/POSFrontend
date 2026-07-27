import { Link } from "react-router-dom";
import {
  AdminBreadcrumbs,
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminUi";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";

export default function SystemsPage() {
  const resource = usePosResource(platformAdminApi.listSystems, []);
  return (
    <>
      <AdminBreadcrumbs items={[{ label: "Systems" }]} />
      <PageHeader
        title="Systems"
        description="Manage the Ximo products available to clients. Each product remains the source of truth for its own operational data."
      />
      {resource.loading ? (
        <AdminLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resource.data?.map((system) => {
            const available = system.availability === "available";
            return (
              <article
                key={system.code}
                className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 font-bold text-primary">
                    {system.name.slice(5, 8).toUpperCase()}
                  </div>
                  <StatusBadge value={system.availability} />
                </div>
                <h2 className="mt-5 text-lg font-semibold">{system.name}</h2>
                <p className="mt-2 min-h-10 text-sm text-neutral-500">
                  {system.description}
                </p>
                {available ? (
                  <Link
                    className="mt-5 inline-flex rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white"
                    to={`/admin/systems/${system.code}`}
                  >
                    Manage system
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-5 rounded-button border border-neutral-200 px-4 py-2 text-sm text-neutral-400"
                  >
                    Coming soon
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
