import {
  unwrapCollection,
  unwrapEntity,
} from "../../../services/posPlatformApi";

export function organizationFrom(payload) {
  return unwrapEntity(payload, ["organization"]);
}

export function modulesFrom(payload) {
  return unwrapCollection(payload, ["modules"]);
}

export function organizationName(organization) {
  return (
    organization?.businessName ??
    organization?.business_name ??
    organization?.name ??
    "POS organization"
  );
}

export function organizationPlan(organization) {
  const plan = organization?.plan ?? organization?.subscriptionPlan;
  return (
    organization?.planCode ??
    organization?.plan_code ??
    plan?.code ??
    plan?.name ??
    plan ??
    "Unassigned"
  );
}

export function organizationStatus(organization) {
  return (
    organization?.subscriptionStatus ??
    organization?.subscription_status ??
    organization?.status ??
    "unknown"
  );
}

export function moduleState(module) {
  const overrideValue =
    module?.overrideEnabled ??
    module?.override_enabled ??
    module?.override?.enabled ??
    (module?.source === "override" ? module.enabled : undefined);
  const hasOverride =
    typeof overrideValue === "boolean" ||
    module?.hasOverride === true ||
    module?.has_override === true;
  const planEnabled =
    module?.includedInPlan ??
    module?.included_in_plan ??
    module?.planEnabled ??
    module?.plan_enabled ??
    module?.enabledByPlan ??
    module?.enabled_by_plan ??
    false;
  const effectiveValue =
    module?.effectiveEnabled ??
    module?.effective_enabled ??
    module?.isEnabled ??
    module?.is_enabled ??
    module?.enabled;
  const enabled = hasOverride
    ? Boolean(overrideValue)
    : typeof effectiveValue === "boolean"
      ? effectiveValue
      : Boolean(planEnabled);
  const source = hasOverride
    ? enabled
      ? "Enabled by override"
      : "Disabled by override"
    : planEnabled
      ? "Enabled by plan"
      : "Not included in plan";

  return {
    enabled,
    hasOverride,
    planEnabled: Boolean(planEnabled),
    source,
    planLabel: planEnabled ? "Included in plan" : "Not in plan",
  };
}

export function moduleCode(module) {
  return module?.code ?? module?.moduleCode ?? module?.module_code;
}

export function moduleName(module) {
  return (
    module?.name ??
    module?.displayName ??
    module?.display_name ??
    moduleCode(module)
  );
}
