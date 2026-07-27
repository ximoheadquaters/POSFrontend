import { describe, expect, it } from "vitest";
import { moduleState, modulesFrom, organizationFrom } from "./posModels";

describe("POS response models", () => {
  it("unwraps nested Platform API responses", () => {
    expect(
      organizationFrom({ data: { organization: { id: "org-1" } } }),
    ).toEqual({ id: "org-1" });
    expect(
      modulesFrom({ data: { modules: [{ code: "inventory" }] } }),
    ).toHaveLength(1);
  });

  it("distinguishes plan defaults from enabled overrides", () => {
    expect(moduleState({ planEnabled: true, enabled: true })).toEqual({
      enabled: true,
      hasOverride: false,
      planEnabled: true,
      source: "Enabled by plan",
      planLabel: "Included in plan",
    });
    expect(moduleState({ planEnabled: false, overrideEnabled: true })).toEqual({
      enabled: true,
      hasOverride: true,
      planEnabled: false,
      source: "Enabled by override",
      planLabel: "Not in plan",
    });
  });

  it("distinguishes disabled overrides", () => {
    expect(
      moduleState({ planEnabled: true, overrideEnabled: false }),
    ).toMatchObject({
      enabled: false,
      hasOverride: true,
      source: "Disabled by override",
    });
  });

  it("understands the Platform API module contract", () => {
    expect(
      moduleState({
        includedInPlan: true,
        overrideEnabled: null,
        effectiveEnabled: true,
      }),
    ).toMatchObject({
      enabled: true,
      hasOverride: false,
      planEnabled: true,
      source: "Enabled by plan",
    });
    expect(
      moduleState({
        includedInPlan: false,
        overrideEnabled: null,
        effectiveEnabled: false,
      }),
    ).toMatchObject({
      enabled: false,
      hasOverride: false,
      planEnabled: false,
      source: "Not included in plan",
    });
  });
});
