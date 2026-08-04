import { Link } from "react-router-dom";
import {
  Breadcrumbs,
  ErrorPanel,
  LoadingPanel,
  PageHeader,
  StatusBadge,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import {
  posPlatformApi,
  unwrapCollection,
} from "../../../services/posPlatformApi";

function value(organization, ...keys) {
  return keys
    .map((key) => organization?.[key])
    .find((item) => item !== undefined && item !== null);
}

export default function OrganizationsPage() {
  const resource = usePosResource(posPlatformApi.listOrganizations, []);
  const organizations = unwrapCollection(resource.data, ["organizations"]);

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title="Ximo POS"
        description="Manage Ximo POS organizations, subscriptions, and module access through the Express Platform API."
      />
      {resource.loading ? (
        <LoadingPanel />
      ) : resource.error ? (
        <ErrorPanel error={resource.error} onRetry={resource.refresh} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E6EB] bg-white shadow-[0_14px_38px_rgba(31,39,52,0.045)]">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E7ECE7] px-5 py-5 sm:flex-row sm:items-end sm:px-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA2AD]">POS operations</p>
              <p className="mt-1 text-sm text-[#68736A]">Subscriptions, module access, and the operational context behind each POS organization.</p>
            </div>
            <p className="text-sm font-semibold text-[#39443D]">{organizations.length} organizations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E7ECE7]">
              <thead className="bg-[#F8F7F1]">
                <tr>
                  {[
                    "Business",
                    "Plan",
                    "Status",
                    "Modules",
                    "Locale",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[#758176]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF0ED]">
                {organizations.map((organization) => {
                  const organizationId = value(
                    organization,
                    "id",
                    "organizationId",
                    "organization_id",
                  );
                  const businessName = value(
                    organization,
                    "businessName",
                    "business_name",
                    "name",
                  );
                  const plan =
                    value(
                      organization,
                      "planCode",
                      "plan_code",
                      "subscriptionPlan",
                      "plan",
                    ) || "Unassigned";
                  const status = value(
                    organization,
                    "subscriptionStatus",
                    "subscription_status",
                    "status",
                  );
                  const enabledModules =
                    value(
                      organization,
                      "enabledModuleCount",
                      "enabled_module_count",
                      "enabledModulesCount",
                    ) ?? 0;
                  return (
                    <tr key={organizationId} className="transition hover:bg-[#F8F7F1]">
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-[#17241C]">
                          {businessName || "Unnamed organization"}
                        </p>
                        <p className="mt-1 text-xs text-[#879187]">
                          {organizationId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm capitalize text-[#59645C]">
                        {typeof plan === "object"
                          ? plan.name || plan.code
                          : plan}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge value={status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#39443D]">
                        {enabledModules} enabled
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#59645C]">
                        {value(
                          organization,
                          "currency",
                          "currencyCode",
                          "currency_code",
                        ) || "—"}{" "}
                        ·{" "}
                        {value(
                          organization,
                          "timezone",
                          "timeZone",
                          "time_zone",
                        ) || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          className="text-sm font-semibold text-primary transition hover:text-[#17241C]"
                          to={`/admin/systems/pos/organizations/${organizationId}`}
                        >
                          View & manage
                          <span className="sr-only"> {businessName}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!organizations.length && (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#17241C]">No POS organizations yet.</p>
              <p className="mt-2 text-sm text-[#68736A]">Organizations will appear here when they are provisioned for a client.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
