import { Link, useParams } from "react-router-dom";
import {
  Breadcrumbs,
  ErrorPanel,
  InfoGrid,
  LoadingPanel,
  PageHeader,
  StatusBadge,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { posPlatformApi } from "../../../services/posPlatformApi";
import {
  moduleCode,
  moduleName,
  modulesFrom,
  moduleState,
  organizationFrom,
  organizationName,
  organizationPlan,
  organizationStatus,
} from "./posModels";

export default function OrganizationDetailsPage() {
  const { organizationId } = useParams();
  const organizationResource = usePosResource(
    () => posPlatformApi.getOrganization(organizationId),
    [organizationId],
  );
  const modulesResource = usePosResource(
    () => posPlatformApi.getModules(organizationId),
    [organizationId],
  );
  const organization = organizationFrom(organizationResource.data);
  const modules = modulesFrom(modulesResource.data);
  const name = organizationName(organization);

  if (organizationResource.loading) return <LoadingPanel />;
  if (organizationResource.error)
    return (
      <ErrorPanel
        error={organizationResource.error}
        onRetry={organizationResource.refresh}
      />
    );

  return (
    <>
      <Breadcrumbs organization={name} />
      <PageHeader
        title={name}
        description="Organization information, subscription status, and effective POS module access."
        actions={
          <>
            <Link
              className="rounded-button border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
              to={`/admin/systems/pos/organizations/${organizationId}/subscription`}
            >
              Manage plan
            </Link>
            <Link
              className="rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
              to={`/admin/systems/pos/organizations/${organizationId}/modules`}
            >
              Manage modules
            </Link>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold">
            Organization information
          </h2>
          <InfoGrid
            items={[
              { label: "Organization ID", value: organizationId },
              { label: "Business name", value: name },
              {
                label: "Currency",
                value:
                  organization?.currency ??
                  organization?.currencyCode ??
                  organization?.currency_code,
              },
              {
                label: "Timezone",
                value:
                  organization?.timezone ??
                  organization?.timeZone ??
                  organization?.time_zone,
              },
              {
                label: "Email",
                value:
                  organization?.email ??
                  organization?.contactEmail ??
                  organization?.contact_email,
              },
              {
                label: "Created",
                value: organization?.createdAt ?? organization?.created_at,
              },
            ]}
          />
        </section>
        <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Subscription</h2>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Current plan
          </p>
          <p className="mt-1 text-xl font-semibold capitalize">
            {organizationPlan(organization)}
          </p>
          <div className="mt-4">
            <StatusBadge value={organizationStatus(organization)} />
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-card border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">POS modules</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Plan defaults and manual overrides are shown separately.
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-primary"
            to={`/admin/systems/pos/organizations/${organizationId}/modules`}
          >
            Manage
          </Link>
        </div>
        {modulesResource.loading ? (
          <div className="p-6">
            <LoadingPanel />
          </div>
        ) : modulesResource.error ? (
          <div className="p-6">
            <ErrorPanel
              error={modulesResource.error}
              onRetry={modulesResource.refresh}
            />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {modules.map((module) => {
              const state = moduleState(module);
              return (
                <li
                  key={moduleCode(module)}
                  className="flex flex-col justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">{moduleName(module)}</p>
                    <p className="text-xs text-neutral-400">
                      {moduleCode(module)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      value={state.enabled ? "enabled" : "disabled"}
                    />
                    <StatusBadge
                      value={state.source}
                      tone={
                        state.hasOverride
                        ? "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
                          : state.planEnabled
                            ? "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
                            : "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
