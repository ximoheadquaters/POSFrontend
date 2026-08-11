import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import {
  Breadcrumbs,
  ErrorPanel,
  LoadingPanel,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { posPlatformApi } from "../../../services/posPlatformApi";
import {
  moduleCode,
  moduleName,
  modulesFrom,
  moduleState,
  organizationBusinessProfile,
  organizationFrom,
  organizationName,
  organizationPlan,
  organizationStatus,
} from "./posModels";

const BUSINESS_PROFILES = [
  {
    value: "retail",
    label: "Retail",
    description: "Stores selling packaged and measured goods.",
  },
  {
    value: "food_service",
    label: "Food service",
    description: "Recipes, ingredients, and prepared food workflows.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Retail catalog plus food-service operations.",
  },
];

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
  const currentBusinessProfile = organizationBusinessProfile(organization);
  const [businessProfile, setBusinessProfile] = useState(currentBusinessProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const enabledModuleCount = modules.filter(
    (module) => moduleState(module).enabled,
  ).length;
  const overriddenModuleCount = modules.filter(
    (module) => moduleState(module).hasOverride,
  ).length;

  useEffect(() => {
    setBusinessProfile(currentBusinessProfile);
  }, [currentBusinessProfile]);

  if (organizationResource.loading) return <LoadingPanel />;
  if (organizationResource.error) {
    return (
      <ErrorPanel
        error={organizationResource.error}
        onRetry={organizationResource.refresh}
      />
    );
  }

  async function saveBusinessProfile() {
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await posPlatformApi.updateOrganizationProfile(organizationId, {
        businessProfile,
      });
      setProfileMessage({
        type: "success",
        text: "Business type updated. Ask the owner to refresh POS (or sign out/in) to reload modules.",
      });
      await Promise.all([
        organizationResource.refresh(),
        modulesResource.refresh(),
      ]);
    } catch (error) {
      setProfileMessage({ type: "error", text: error.message });
    } finally {
      setSavingProfile(false);
    }
  }

  const details = [
    { label: "Organization ID", value: organizationId, mono: true },
    { label: "Business name", value: name },
    {
      label: "Business type",
      value: String(currentBusinessProfile).replaceAll("_", " "),
    },
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
      label: "Owner email",
      value:
        organization?.owner?.email ??
        organization?.email ??
        organization?.contactEmail ??
        organization?.contact_email,
    },
    {
      label: "Owner",
      value:
        organization?.owner?.displayName ||
        organization?.owner?.email ||
        "—",
    },
    {
      label: "Invitation",
      value: organization?.owner?.invitationStatus || "—",
    },
    { label: "Created", value: organization?.createdAt ?? organization?.created_at },
  ];

  return (
    <>
      <Breadcrumbs organization={name} />

      <header className="mb-5 flex flex-col justify-between gap-4 border-b border-[#E2E6EB] pb-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F0F2F4] text-sm font-bold tracking-[-0.04em] text-[#596273]">
            {name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#929AA5]">
              Ximo POS organization
            </p>
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate text-3xl font-semibold tracking-[-0.055em] text-[#17241C] sm:text-4xl">
                {name}
              </h1>
              <SubscriptionStatus value={organizationStatus(organization)} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="hidden border-r border-[#E2E6EB] pr-4 text-right sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929AA5]">
              Current plan
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-[#303746]">
              {organizationPlan(organization)}
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D9DFE4] bg-white px-3.5 text-sm font-semibold text-[#303746] transition hover:border-[#BFC8D0] hover:bg-[#F8F9FA]"
            to={`/admin/systems/pos/organizations/${organizationId}/subscription`}
          >
            Manage plan
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-white transition hover:bg-primary-600"
            to={`/admin/systems/pos/organizations/${organizationId}/modules`}
          >
            Manage modules
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-[#E2E6EB] bg-white px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#EDF0F2] pb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-[#252B3A]">Organization profile</h2>
            <p className="mt-0.5 text-xs text-[#929AA5]">
              Core record details for this POS workspace.
            </p>
          </div>
          <span className="hidden text-xs text-[#929AA5] sm:inline">Account record</span>
        </div>
        <dl className="grid gap-x-8 gap-y-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
          {details.map(({ label, value, mono }) => (
            <div key={label} className="min-w-0">
              <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929AA5]">
                {label}
              </dt>
              <dd
                className={`mt-1.5 truncate text-sm font-semibold capitalize text-[#303746] ${mono ? "font-mono text-[11px] normal-case" : ""}`}
                title={value || undefined}
              >
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-4 rounded-xl border border-[#E2E6EB] bg-white px-5 py-4 sm:px-6">
        <div className="border-b border-[#EDF0F2] pb-3.5">
          <h2 className="text-sm font-semibold text-[#252B3A]">Business type</h2>
          <p className="mt-0.5 text-xs text-[#929AA5]">
            Changes which POS modules are available for this organization&apos;s profile.
          </p>
        </div>
        {profileMessage ? (
          <div
            role={profileMessage.type === "error" ? "alert" : "status"}
            className={`mt-4 rounded-lg border p-3 text-sm ${
              profileMessage.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-[#E2E6EB] bg-[#F3F5F6] text-[#596273]"
            }`}
          >
            {profileMessage.text}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {BUSINESS_PROFILES.map((profile) => {
            const selected = businessProfile === profile.value;
            return (
              <button
                key={profile.value}
                type="button"
                onClick={() => setBusinessProfile(profile.value)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-[#E2E6EB] bg-white hover:border-[#BFC8D0]"
                }`}
              >
                <p className="text-sm font-semibold text-[#252B3A]">{profile.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#7F8793]">{profile.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            disabled={savingProfile || businessProfile === currentBusinessProfile}
            onClick={saveBusinessProfile}
          >
            {savingProfile ? "Saving…" : "Save business type"}
          </Button>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-[#E2E6EB] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF0F2] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-[#252B3A]">Module access</h2>
            <p className="mt-0.5 text-xs text-[#929AA5]">
              Effective access, including plan defaults and manual overrides.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#7F8793]">
            <span><strong className="font-semibold text-[#4A5660]">{enabledModuleCount}</strong> enabled</span>
            {overriddenModuleCount > 0 && (
              <span className="border-l border-[#E2E6EB] pl-3"><strong className="font-semibold text-[#4A5660]">{overriddenModuleCount}</strong> overridden</span>
            )}
          </div>
        </div>

        {modulesResource.loading ? (
          <div className="p-5">
            <LoadingPanel />
          </div>
        ) : modulesResource.error ? (
          <div className="p-5">
            <ErrorPanel
              error={modulesResource.error}
              onRetry={modulesResource.refresh}
            />
          </div>
        ) : modules.length ? (
          <ul className="grid md:grid-cols-2">
            {modules.map((module, index) => {
              const state = moduleState(module);
              return (
                <li
                  key={moduleCode(module)}
                  className={`flex min-w-0 items-center justify-between gap-4 border-t border-[#EDF0F2] px-5 py-3.5 sm:px-6 ${index % 2 === 0 ? "md:border-r" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#303746]">
                      {moduleName(module)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-[#929AA5]">
                      {moduleCode(module)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <ModuleState enabled={state.enabled} />
                    <p className="mt-1 text-[10px] text-[#929AA5]">{state.source}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#303746]">No modules configured</p>
            <p className="mt-1 text-xs text-[#929AA5]">
              Module access will appear here once it is available for this organization.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function SubscriptionStatus({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  const isCurrent = ["active", "enabled"].includes(normalized);
  const label = String(value || "Unknown").replaceAll("_", " ");

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${isCurrent ? "text-[#596273]" : "text-[#929AA5]"}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-[#66717F]" : "bg-[#C4CBD1]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function ModuleState({ enabled }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${enabled ? "text-[#4A5660]" : "text-[#929AA5]"}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-[#66717F]" : "bg-[#C4CBD1]"}`}
        aria-hidden="true"
      />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}
