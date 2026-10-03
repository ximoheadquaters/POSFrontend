import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routesSource = fs.readFileSync(
  path.resolve(__dirname, "../routes/AppRoutes.jsx"),
  "utf8",
);
const billingSource = fs
  .readFileSync(
    path.resolve(__dirname, "../pages/Dashboard/Billing/TenantBillingPage.jsx"),
    "utf8",
  )
  .replace(/\s+/g, " ");

describe("Tenant billing workspace", () => {
  test("keeps tenant billing outside the super-admin route tree", () => {
    expect(routesSource.includes('path="/settings/billing"')).toBe(true);
    expect(routesSource.includes("TenantBillingPage")).toBe(true);
    expect(routesSource.indexOf("/settings/billing")).toBeLessThan(
      routesSource.indexOf("<Route element={<AdminRoute />}>"),
    );
  });

  test("communicates each subscription state in plain language", () => {
    [
      "Your subscription is active.",
      "Your trial is active.",
      "We couldn’t renew your subscription.",
      "Your subscription needs attention.",
      "Your subscription will end soon.",
    ].forEach((message) => expect(billingSource.includes(message)).toBe(true));
  });

  test("shows the paid-through date and grace-period guidance", () => {
    expect(billingSource.includes("Next Renewal / Period End")).toBe(true);
    expect(billingSource.includes("Grace period ends:")).toBe(true);
    expect(billingSource.includes("Your store data is safely preserved.")).toBe(
      true,
    );
  });

  test("keeps paid provisioning recovery separate from another payment", () => {
    expect(
      billingSource.includes(
        "Your payment was received, but store setup is not complete.",
      ),
    ).toBe(true);
    expect(billingSource.includes("Retry Setup")).toBe(true);
    expect(billingSource.includes("Pay Again")).toBe(false);
  });

  test("uses customer-facing capabilities and hides internal role codes", () => {
    expect(billingSource.includes("Point of Sale Checkout")).toBe(true);
    expect(billingSource.includes("Products & Inventory Management")).toBe(
      true,
    );
    expect(billingSource.includes("mod_inventory_core")).toBe(false);
    expect(billingSource.includes("recipes_internal")).toBe(false);
  });

  test("does not fabricate payment credentials", () => {
    expect(
      billingSource.includes("Payment method details are not available yet."),
    ).toBe(true);
    expect(billingSource.includes("•••• 4242")).toBe(false);
  });

  test("explains unavailable and test-mode billing safely", () => {
    expect(
      billingSource.includes(
        "Online billing management is not available yet. Contact Ximo support.",
      ),
    ).toBe(true);
    expect(billingSource.includes("Contact Sales")).toBe(true);
    expect(
      billingSource.includes(
        "Test billing action — no real payment will be processed.",
      ),
    ).toBe(true);
  });

  test("uses the server-provided plan price", () => {
    expect(billingSource.includes("subscription.plan.monthlyPrice")).toBe(true);
    expect(
      billingSource.includes("Number(subscription.plan.monthlyPrice)"),
    ).toBe(true);
  });

  test("describes the impact of a downgrade before confirmation", () => {
    expect(billingSource.includes("Your data will not be deleted")).toBe(true);
    expect(
      billingSource.includes(
        "Features outside the new plan will become unavailable",
      ),
    ).toBe(true);
  });

  test("validates and formats the cancellation paid-through date", () => {
    expect(billingSource.includes('timeZone: "Asia/Manila"')).toBe(true);
    expect(billingSource.includes('toLocaleDateString( "en-PH"')).toBe(true);
    expect(
      billingSource.includes(
        "We couldn’t determine your paid-through date. Contact Ximo support before canceling.",
      ),
    ).toBe(true);
    expect(
      billingSource.includes(
        "isNaN(new Date(subscription.currentPeriodEnd).getTime())",
      ),
    ).toBe(true);
  });

  test("has clear empty, permission, and mobile states", () => {
    expect(billingSource.includes("No invoices are available yet.")).toBe(true);
    expect(
      billingSource.includes(
        "Only your organization’s billing administrator can manage the subscription.",
      ),
    ).toBe(true);
    expect(billingSource.includes("min-h-[44px]")).toBe(true);
    expect(billingSource.includes("portal-surface")).toBe(true);
  });
});
