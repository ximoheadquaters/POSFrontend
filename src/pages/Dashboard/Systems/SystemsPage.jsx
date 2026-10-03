import { Link } from "react-router-dom";
import { AdminError, AdminLoading } from "../../../components/admin/AdminUi";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import { PortalIcon } from "../../../components/portal/PortalShell";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";

export default function SystemsPage() {
  const resource = usePosResource(platformAdminApi.listSystems, []);

  return (
    <>
      <PageHeader
        title="Systems"
        description="Products available for client organizations and their operating teams."
      />
      {resource.loading ? (
        <AdminLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <section className="portal-surface">
          <div className="flex flex-col gap-2 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="portal-section-heading">Available systems</h2>
              <p className="portal-supporting-copy mt-1">Assign a system only when it is ready for the client.</p>
            </div>
            <p className="text-sm font-semibold text-[#1A593B]">{resource.data?.length || 0} total</p>
          </div>
          {resource.data?.length ? (
            <ul className="divide-y divide-[#EDF1EE]">
              {resource.data.map((system) => {
                const available = system.availability === "available";
                return (
                  <li key={system.code} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF2EE] text-[#1A593B]">
                      <PortalIcon name="systems" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold text-[#25352B]">{system.name}</h2>
                      <p className="mt-1 max-w-2xl text-sm leading-5 text-[#748177]">{system.description || "Ximo product"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <StatusBadge value={system.availability} />
                      {available ? (
                        <Link
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#C9D9CC] bg-white px-3.5 text-sm font-semibold text-[#1A593B] transition-colors hover:bg-[#F0F4F2]"
                          to={`/admin/systems/${system.code}`}
                        >
                          Manage
                        </Link>
                      ) : (
                        <span className="inline-flex min-h-10 items-center text-sm font-medium text-[#748177]">Unavailable</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
                <PortalIcon name="systems" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-base font-semibold text-[#25352B]">No systems configured</p>
              <p className="mt-1 text-sm text-[#748177]">Configured products will appear here.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
