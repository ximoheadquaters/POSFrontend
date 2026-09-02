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
      <div className="max-md:hidden">
        <AdminBreadcrumbs items={[{ label: "Systems" }]} />
      </div>
      <PageHeader
        title="Systems"
        description="Manage the Ximo products available to clients. Each product remains the source of truth for its own operational data."
        mobileCompact
      />
      {resource.loading ? (
        <AdminLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resource.data?.map((system) => {
            const available = system.availability === "available";

            return (
              <article
                key={system.code}
                className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-[22px] border border-[#1A593B]/15 bg-white p-5 shadow-[0_10px_26px_rgba(26,89,59,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#386F55] hover:shadow-[0_18px_38px_rgba(26,89,59,0.12)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A593B] text-sm font-bold tracking-[-0.04em] text-white shadow-[0_8px_16px_rgba(26,89,59,0.18)]">
                    {system.name.slice(5, 8).toUpperCase()}
                  </div>
                  <StatusBadge value={system.availability} />
                </div>
                <div>
                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#386F55]">Ximo product</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#000000]">{system.name}</h2>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#4C4239]">{system.description}</p>
                {available ? (
                  <Link
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-[#1A593B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#386F55]"
                    to={`/admin/systems/${system.code}`}
                  >
                    Manage system
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-auto inline-flex w-fit items-center rounded-xl bg-[#4C4239]/10 px-4 py-2.5 text-sm font-semibold text-[#4C4239]"
                  >
                    Coming soon
                  </button>
                )}
              </article>
            );
          })}
          {!resource.data?.length && (
            <div className="md:col-span-2 xl:col-span-3 rounded-[22px] border border-dashed border-[#386F55] bg-white p-10 text-center">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#000000]">The product catalog is waiting.</p>
              <p className="mt-2 text-sm text-[#4C4239]">Available systems will appear here once they are configured for Ximo.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
