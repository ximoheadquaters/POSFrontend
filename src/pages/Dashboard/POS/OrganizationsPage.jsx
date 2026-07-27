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
        <div className="overflow-hidden rounded-card border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
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
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
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
                    <tr key={organizationId} className="hover:bg-neutral-50/70">
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-neutral-900">
                          {businessName || "Unnamed organization"}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {organizationId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm capitalize">
                        {typeof plan === "object"
                          ? plan.name || plan.code
                          : plan}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge value={status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm">
                        {enabledModules} enabled
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-600">
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
                          className="text-sm font-semibold text-primary hover:text-primary-700"
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
            <div className="p-10 text-center text-sm text-neutral-500">
              No POS organizations were returned.
            </div>
          )}
        </div>
      )}
    </>
  );
}
