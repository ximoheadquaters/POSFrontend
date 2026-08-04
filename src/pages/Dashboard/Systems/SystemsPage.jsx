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
          {resource.data?.map((system, index) => {
            const available = system.availability === "available";
            return (
              <article
                key={system.code}
                className={`group relative overflow-hidden rounded-2xl border border-[#E2E6EB] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D2D7DE] hover:shadow-[0_20px_50px_rgba(31,39,52,0.09)] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
              >
                {index === 0 && <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border border-[#E7EBEF] bg-[#F5F6F7]" />}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] font-bold text-[#697382]">
                    {system.name.slice(5, 8).toUpperCase()}
                  </div>
                  <StatusBadge value={system.availability} />
                </div>
                <div className="relative">
                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA2AD]">Ximo product</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#17241C]">{system.name}</h2>
                </div>
                <p className="relative mt-3 min-h-10 max-w-xl text-sm leading-6 text-[#68736A]">
                  {system.description}
                </p>
                {available ? (
                  <Link
                    className="relative mt-7 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold text-primary transition hover:border-[#17241C] hover:text-[#17241C]"
                    to={`/admin/systems/${system.code}`}
                  >
                    Manage system <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="relative mt-7 border-b border-[#C9D4CA] pb-1 text-sm font-semibold text-[#97A197]"
                  >
                    Coming soon
                  </button>
                )}
              </article>
            );
          })}
          {!resource.data?.length && (
            <div className="md:col-span-2 xl:col-span-3 rounded-[22px] border border-dashed border-[#BFCDBF] bg-[#F8F7F1] p-10 text-center">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#17241C]">The product catalog is waiting.</p>
              <p className="mt-2 text-sm text-[#68736A]">Available systems will appear here once they are configured for Ximo.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
