import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  Breadcrumbs,
  ErrorPanel,
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
} from "./posModels";

export default function ModulesPage() {
  const { organizationId } = useParams();
  const organizationResource = usePosResource(
    () => posPlatformApi.getOrganization(organizationId),
    [organizationId],
  );
  const modulesResource = usePosResource(
    () => posPlatformApi.getModules(organizationId),
    [organizationId],
  );
  const [change, setChange] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState("all");
  const organization = organizationFrom(organizationResource.data);
  const modules = modulesFrom(modulesResource.data);
  const name = organizationName(organization);
  const moduleRows = modules.map((module) => ({
    module,
    state: moduleState(module),
  }));
  const counts = moduleRows.reduce(
    (total, row) => ({
      enabled: total.enabled + Number(row.state.enabled),
      disabled: total.disabled + Number(!row.state.enabled),
      overrides: total.overrides + Number(row.state.hasOverride),
    }),
    { enabled: 0, disabled: 0, overrides: 0 },
  );
  const visibleModules = moduleRows.filter(({ state }) => {
    if (filter === "enabled") return state.enabled;
    if (filter === "disabled") return !state.enabled;
    if (filter === "overrides") return state.hasOverride;
    return true;
  });

  function openChange(module, action) {
    setReason("");
    setMessage(null);
    setChange({ module, action });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const code = moduleCode(change.module);
      if (change.action === "remove") {
        await posPlatformApi.removeModuleOverride(organizationId, code);
      } else {
        await posPlatformApi.setModuleOverride(organizationId, code, {
          enabled: change.action === "enable",
          reason: reason.trim(),
        });
      }
      setChange(null);
      setMessage({
        type: "success",
        text: `${moduleName(change.module)} now follows the updated access rule.`,
      });
      await Promise.all([
        modulesResource.refresh(),
        organizationResource.refresh(),
      ]);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (organizationResource.loading || modulesResource.loading)
    return <LoadingPanel />;
  if (organizationResource.error)
    return (
      <ErrorPanel
        error={organizationResource.error}
        onRetry={organizationResource.refresh}
      />
    );
  if (modulesResource.error)
    return (
      <ErrorPanel
        error={modulesResource.error}
        onRetry={modulesResource.refresh}
      />
    );

  return (
    <>
      <Breadcrumbs organization={name} />
      <PageHeader
        title="Module management"
        description={`Control manual module overrides for ${name}. Removing an override returns the module to its plan default.`}
        actions={
          <Link
            className="text-sm font-semibold text-primary"
            to={`/admin/systems/pos/organizations/${organizationId}`}
          >
            ← Back to organization
          </Link>
        }
      />
      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-5 rounded-card border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#E2E6EB] bg-[#F3F5F6] text-[#596273]"}`}
        >
          {message.text}
        </div>
      )}
      <div className="mb-5 rounded-card border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#F3F5F6] px-4 py-3">
            <p className="text-2xl font-semibold text-[#434B58]">
              {counts.enabled}
            </p>
            <p className="text-xs font-semibold text-[#596273]">
              Enabled modules
            </p>
          </div>
          <div className="rounded-xl bg-[#F3F5F6] px-4 py-3">
            <p className="text-2xl font-semibold text-[#434B58]">
              {counts.disabled}
            </p>
            <p className="text-xs font-semibold text-[#596273]">
              Disabled modules
            </p>
          </div>
          <div className="rounded-xl bg-[#F3F5F6] px-4 py-3">
            <p className="text-2xl font-semibold text-[#434B58]">
              {counts.overrides}
            </p>
            <p className="text-xs font-semibold text-[#596273]">
              Manual overrides
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-neutral-100 pt-4 lg:flex-row lg:items-center">
          <p className="text-xs leading-5 text-neutral-500">
            <strong className="text-[#39443D]">Plan access</strong> follows
            the subscription automatically.{" "}
            <strong className="text-[#39443D]">Manual overrides</strong> take
            priority until removed.
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter modules"
          >
            {[
              ["all", `All (${modules.length})`],
              ["enabled", `Enabled (${counts.enabled})`],
              ["disabled", `Disabled (${counts.disabled})`],
              ["overrides", `Overrides (${counts.overrides})`],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                  filter === value
                    ? "bg-primary text-white ring-primary"
                    : "bg-white text-neutral-600 ring-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {visibleModules.map(({ module, state }) => {
          return (
            <article
              key={moduleCode(module)}
              className={`rounded-card border bg-white p-5 shadow-sm transition-colors ${
                state.hasOverride
                    ? "border-[#E2E6EB]"
                    : state.enabled
                    ? "border-[#E2E6EB]"
                    : "border-neutral-200"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0 md:w-1/3">
                  <h2 className="font-semibold">{moduleName(module)}</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    {moduleCode(module)}
                  </p>
                </div>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <StatusBadge
                    value={state.enabled ? "Access enabled" : "Access disabled"}
                    tone={
                      state.enabled
                        ? "bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
                        : "bg-[#FCECEA] text-[#A13E35] ring-[#EDC5C0]"
                    }
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
                  {state.hasOverride && (
                    <StatusBadge
                      value={state.planLabel}
                      tone="bg-[#F0F2F4] text-[#596273] ring-[#E0E4E8]"
                    />
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {state.enabled ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openChange(module, "disable")}
                      disabled={state.hasOverride && !state.enabled}
                    >
                      Manually disable
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openChange(module, "enable")}
                      disabled={state.hasOverride && state.enabled}
                    >
                      Manually enable
                    </Button>
                  )}
                  {state.hasOverride && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openChange(module, "remove")}
                    >
                      Return to plan
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!modules.length && (
          <div className="rounded-card border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
            No POS modules were returned.
          </div>
        )}
        {modules.length > 0 && !visibleModules.length && (
          <div className="rounded-card border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="font-medium text-neutral-700">
              No modules match this filter
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-primary hover:underline"
              onClick={() => setFilter("all")}
            >
              Show all modules
            </button>
          </div>
        )}
      </div>
      <Modal
        isOpen={Boolean(change)}
        onClose={() => !saving && setChange(null)}
        title={
          change?.action === "remove"
            ? "Remove manual override?"
            : `Confirm ${change?.action} override`
        }
      >
        {change && (
          <>
            <p className="text-sm text-neutral-600">
              {change.action === "remove"
                ? `${moduleName(change.module)} will follow its subscription plan again.`
                : `${moduleName(change.module)} will be manually ${change.action}d, regardless of its plan default.`}
            </p>
            {change.action !== "remove" && (
              <div className="mt-5">
                <label
                  htmlFor="overrideReason"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="overrideReason"
                  rows="3"
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why this override is required"
                  className="w-full rounded-button border border-neutral-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setChange(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={save}
                loading={saving}
                disabled={change.action !== "remove" && !reason.trim()}
              >
                {change.action === "remove"
                  ? "Remove override"
                  : "Save override"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
