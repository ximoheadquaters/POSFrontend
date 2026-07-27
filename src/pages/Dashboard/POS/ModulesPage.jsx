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
  const organization = organizationFrom(organizationResource.data);
  const modules = modulesFrom(modulesResource.data);
  const name = organizationName(organization);

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
          className={`mb-5 rounded-card border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {message.text}
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-4 rounded-card border border-neutral-200 bg-white p-4 text-xs text-neutral-600">
        <span>
          <strong className="text-neutral-800">Plan default:</strong> access
          inherited from subscription
        </span>
        <span>
          <strong className="text-violet-700">Manual override:</strong> access
          explicitly enabled or disabled by an administrator
        </span>
      </div>
      <div className="space-y-3">
        {modules.map((module) => {
          const state = moduleState(module);
          return (
            <article
              key={moduleCode(module)}
              className="rounded-card border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-semibold">{moduleName(module)}</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    {moduleCode(module)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={state.enabled ? "enabled" : "disabled"} />
                  <StatusBadge
                    value={state.source}
                    tone={
                      state.hasOverride
                        ? "bg-violet-50 text-violet-700 ring-violet-600/20"
                        : "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openChange(module, "enable")}
                    disabled={state.hasOverride && state.enabled}
                  >
                    Enable override
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openChange(module, "disable")}
                    disabled={state.hasOverride && !state.enabled}
                  >
                    Disable override
                  </Button>
                  {state.hasOverride && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openChange(module, "remove")}
                    >
                      Remove override
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
