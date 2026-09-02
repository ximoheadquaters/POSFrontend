import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/Button";
import {
  Breadcrumbs,
  ErrorPanel,
  LoadingPanel,
  PageHeader,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import {
  posPlatformApi,
  unwrapCollection,
} from "../../../services/posPlatformApi";

export default function PlansPage() {
  const plansResource = usePosResource(() => posPlatformApi.listPlans(), []);
  const modulesResource = usePosResource(
    () => posPlatformApi.listModulesCatalog(),
    [],
  );
  const plans = unwrapCollection(plansResource.data, ["plans"]).filter(
    (plan) => plan.isActive !== false,
  );
  const catalog = unwrapCollection(modulesResource.data, ["modules"]).sort(
    (a, b) => String(a.name || a.code).localeCompare(String(b.name || b.code)),
  );

  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.code === selectedPlanCode) || null,
    [plans, selectedPlanCode],
  );

  useEffect(() => {
    if (!selectedPlanCode && plans[0]?.code) {
      setSelectedPlanCode(plans[0].code);
    }
  }, [plans, selectedPlanCode]);

  useEffect(() => {
    const codes = (selectedPlan?.modules || [])
      .map((module) => module.code)
      .filter(Boolean);
    setSelectedModules(codes);
    setMessage(null);
  }, [selectedPlan]);

  function toggleModule(code) {
    setSelectedModules((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code].sort(),
    );
  }

  async function save() {
    if (!selectedPlanCode) return;
    setSaving(true);
    setMessage(null);
    try {
      await posPlatformApi.updatePlanModules(selectedPlanCode, {
        moduleCodes: selectedModules,
      });
      setMessage({
        type: "success",
        text: `${selectedPlan?.name || selectedPlanCode} modules updated. Organizations on this plan should refresh POS to reload access.`,
      });
      await plansResource.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (plansResource.loading || modulesResource.loading) return <LoadingPanel />;
  if (plansResource.error) {
    return (
      <ErrorPanel error={plansResource.error} onRetry={plansResource.refresh} />
    );
  }
  if (modulesResource.error) {
    return (
      <ErrorPanel
        error={modulesResource.error}
        onRetry={modulesResource.refresh}
      />
    );
  }

  const baseline = new Set(
    (selectedPlan?.modules || []).map((module) => module.code).filter(Boolean),
  );
  const dirty =
    selectedModules.length !== baseline.size ||
    selectedModules.some((code) => !baseline.has(code));

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title="Plan modules"
        description="Choose which POS modules are included in each subscription plan."
        actions={
          <Link className="text-sm font-semibold text-primary" to="/admin/systems/pos">
            Back to organizations
          </Link>
        }
      />

      {message ? (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-5 rounded-card border p-4 text-sm ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#E2E6EB] bg-[#F3F5F6] text-[#596273]"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="rounded-card border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#929AA5]">
            Plans
          </p>
          <div className="space-y-2">
            {plans.map((plan) => {
              const active = plan.code === selectedPlanCode;
              return (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setSelectedPlanCode(plan.code)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-[#E2E6EB] hover:border-[#BFC8D0]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#252B3A]">
                    {plan.name || plan.code}
                  </p>
                  <p className="mt-1 text-xs text-[#7F8793]">
                    {(plan.modules || []).length} modules
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#252B3A]">
                {selectedPlan?.name || "Select a plan"}
              </h2>
              <p className="mt-1 text-sm text-[#7F8793]">
                {selectedPlan?.description ||
                  "Toggle modules included by default for this plan."}
              </p>
            </div>
            <Button type="button" disabled={!dirty || saving} onClick={save}>
              {saving ? "Saving…" : "Save plan modules"}
            </Button>
          </div>

          {selectedPlan ? (
            <ul className="mt-4 divide-y divide-[#EDF0F2]">
              {catalog.map((module) => {
                const code = module.code;
                const checked = selectedModules.includes(code);
                return (
                  <li
                    key={code}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggleModule(code)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[#303746]">
                          {module.name || code}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] text-[#929AA5]">
                          {code}
                        </span>
                        {module.description ? (
                          <span className="mt-1 block text-xs text-[#7F8793]">
                            {module.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        checked ? "text-[#4A5660]" : "text-[#929AA5]"
                      }`}
                    >
                      {checked ? "Included" : "Not included"}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#7F8793]">Select a plan to edit.</p>
          )}
        </section>
      </div>
    </>
  );
}
