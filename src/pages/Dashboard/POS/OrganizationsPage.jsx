import { Link } from "react-router-dom";
import { ErrorPanel, LoadingPanel, PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import { PortalIcon } from "../../../components/portal/PortalShell";
import usePosResource from "../../../hooks/usePosResource";
import { posPlatformApi, unwrapCollection } from "../../../services/posPlatformApi";

function value(organization, ...keys) {
  return keys.map((key) => organization?.[key]).find((item) => item !== undefined && item !== null);
}

function organizationDetails(organization) {
  const organizationId = value(organization, "id", "organizationId", "organization_id");
  const businessName = value(organization, "businessName", "business_name", "name") || "Unnamed organization";
  const plan = value(organization, "planCode", "plan_code", "subscriptionPlan", "plan") || "Unassigned";
  const status = value(organization, "subscriptionStatus", "subscription_status", "status");
  const enabledModules = value(organization, "enabledModuleCount", "enabled_module_count", "enabledModulesCount") ?? 0;
  const currency = value(organization, "currency", "currencyCode", "currency_code") || "—";
  const timezone = value(organization, "timezone", "timeZone", "time_zone") || "—";
  return {
    organizationId,
    businessName,
    plan: typeof plan === "object" ? plan.name || plan.code : plan,
    status,
    enabledModules,
    locale: `${currency} · ${timezone}`,
  };
}

export default function OrganizationsPage() {
  const resource = usePosResource(posPlatformApi.listOrganizations, []);
  const organizations = unwrapCollection(resource.data, ["organizations"]);

  return (
    <>
      <PageHeader
        title="Ximo POS"
        description="Organizations, subscriptions, and module access managed through the platform."
        actions={
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#C9D9CC] bg-white px-4 text-sm font-semibold text-[#1A593B] transition-colors hover:bg-[#F0F4F2]"
            to="/admin/systems/pos/plans"
          >
            Plans & modules
          </Link>
        }
      />
      {resource.loading ? (
        <LoadingPanel />
      ) : resource.error ? (
        <ErrorPanel error={resource.error} onRetry={resource.refresh} />
      ) : (
        <section className="portal-surface">
          <div className="flex flex-col gap-2 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="portal-section-heading">Organizations</h2>
              <p className="portal-supporting-copy mt-1">Subscription and access status for each POS business.</p>
            </div>
            <p className="text-sm font-semibold text-[#1A593B]">{organizations.length} total</p>
          </div>

          {organizations.length ? (
            <>
              <ul className="divide-y divide-[#EDF1EE] md:hidden">
                {organizations.map((organization) => {
                  const item = organizationDetails(organization);
                  return (
                    <li key={item.organizationId}>
                      <Link
                        to={`/admin/systems/pos/organizations/${item.organizationId}`}
                        className="block px-4 py-4 transition-colors hover:bg-[#F8FAF8]"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF2EE] text-[#1A593B]">
                            <PortalIcon name="pos" className="h-[18px] w-[18px]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="min-w-0 truncate text-sm font-semibold text-[#25352B]">{item.businessName}</p>
                              <StatusBadge value={item.status} />
                            </div>
                            <p className="mt-1 truncate text-xs text-[#748177]">{item.plan}</p>
                          </div>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 border-t border-[#EDF1EE] pt-3 text-xs">
                          <div><dt className="text-[#819087]">Modules</dt><dd className="mt-1 font-semibold text-[#435248]">{item.enabledModules} enabled</dd></div>
                          <div><dt className="text-[#819087]">Locale</dt><dd className="mt-1 truncate font-semibold text-[#435248]">{item.locale}</dd></div>
                        </dl>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-[#E7ECE7]">
                  <thead className="bg-[#F8F9FA]">
                    <tr>
                      {["Business", "Plan", "Status", "Modules", "Locale", ""].map((heading) => (
                        <th key={heading || "action"} scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#758176]">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF0ED]">
                    {organizations.map((organization) => {
                      const item = organizationDetails(organization);
                      return (
                        <tr key={item.organizationId} className="transition-colors hover:bg-[#F8FAF8]">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#25352B]">{item.businessName}</p>
                            <p className="mt-1 max-w-[210px] truncate text-xs text-[#879187]">{item.organizationId}</p>
                          </td>
                          <td className="px-5 py-4 text-sm capitalize text-[#59645C]">{item.plan}</td>
                          <td className="px-5 py-4"><StatusBadge value={item.status} /></td>
                          <td className="px-5 py-4 text-sm font-medium text-[#39443D]">{item.enabledModules} enabled</td>
                          <td className="max-w-[230px] truncate px-5 py-4 text-sm text-[#59645C]">{item.locale}</td>
                          <td className="px-5 py-4 text-right">
                            <Link className="text-sm font-semibold text-[#1A593B] hover:text-[#164A32]" to={`/admin/systems/pos/organizations/${item.organizationId}`}>
                              Manage<span className="sr-only"> {item.businessName}</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
                <PortalIcon name="pos" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-base font-semibold text-[#25352B]">No POS organizations</p>
              <p className="mt-1 text-sm text-[#748177]">Organizations appear here after they are provisioned for a client.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
