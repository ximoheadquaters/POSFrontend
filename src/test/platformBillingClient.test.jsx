import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routesSource = fs.readFileSync(
  path.resolve(__dirname, "../routes/AppRoutes.jsx"),
  "utf8",
);
const billingSource = fs.readFileSync(
  path.resolve(
    __dirname,
    "../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx",
  ),
  "utf8",
);

describe("Platform billing workspace", () => {
  test("keeps the platform billing route inside the super-admin workspace", () => {
    expect(routesSource.includes("PlatformBillingPage")).toBe(true);
    expect(routesSource.lastIndexOf('path="billing"')).toBeGreaterThan(
      routesSource.indexOf("<Route element={<AdminRoute />}>"),
    );
  });

  test("uses an operational header and a compact section chooser", () => {
    expect(billingSource.includes('title="Billing activity"')).toBe(true);
    expect(billingSource.includes("Billing section")).toBe(true);
    expect(billingSource.includes("Checkout sessions")).toBe(true);
    expect(billingSource.includes("Webhook events")).toBe(true);
  });

  test("shows billing health counts from the overview DTO", () => {
    expect(billingSource.includes("overview?.activeSubscriptionsCount")).toBe(
      true,
    );
    expect(
      billingSource.includes("overview?.paidProvisioningFailuresCount"),
    ).toBe(true);
    expect(billingSource.includes("overview?.failedWebhooksCount")).toBe(true);
  });

  test("keeps subscription status and search controls available", () => {
    expect(billingSource.includes("Search organization or owner email")).toBe(
      true,
    );
    expect(billingSource.includes("All statuses")).toBe(true);
    expect(billingSource.includes("debouncedSubscriptionSearch")).toBe(true);
  });

  test("never renders raw checkout or webhook payload data", () => {
    expect(billingSource.includes("item.publicTokenMasked")).toBe(true);
    expect(billingSource.includes("public_token")).toBe(false);
    expect(billingSource.includes("item.payload")).toBe(false);
    expect(billingSource.includes("item.rawBody")).toBe(false);
  });

  test("gates provisioning recovery on a paid, verified checkout", () => {
    expect(
      billingSource.includes("item.paymentConfirmedAt && item.emailVerifiedAt"),
    ).toBe(true);
    expect(
      billingSource.includes('disabled={item.status === "provisioning"}'),
    ).toBe(true);
    expect(billingSource.includes("Retry setup")).toBe(true);
  });

  test("requires a reason for every sensitive operational action", () => {
    expect(billingSource.includes("if (!reasonInput.trim())")).toBe(true);
    expect(billingSource.includes("disabled={!reasonInput.trim()}")).toBe(true);
    expect(billingSource.includes("platform audit trail")).toBe(true);
  });

  test("explains the impact of suspension and reactivation", () => {
    expect(billingSource.includes("Store data remains preserved.")).toBe(true);
    expect(
      billingSource.includes(
        "Access will be restored according to the organization’s plan",
      ),
    ).toBe(true);
  });

  test("preserves every existing billing action endpoint", () => {
    [
      "/admin/billing/subscriptions/${selectedTarget.id}/extend-trial",
      "/admin/billing/subscriptions/${selectedTarget.id}/suspend",
      "/admin/billing/subscriptions/${selectedTarget.id}/reactivate",
      "/admin/billing/checkouts/${selectedTarget.id}/retry-provisioning",
      "/admin/billing/webhooks/${selectedTarget.id}/reprocess",
    ].forEach((endpoint) =>
      expect(billingSource.includes(endpoint)).toBe(true),
    );
  });

  test("uses mobile record cards instead of a horizontal table scroll", () => {
    expect(billingSource.includes("xl:hidden")).toBe(true);
    expect(billingSource.includes("xl:table")).toBe(true);
    expect(billingSource.includes("overflow-x-auto")).toBe(false);
  });

  test("retains server pagination for each operational list", () => {
    expect(billingSource.includes("PaginationControls")).toBe(true);
    expect(billingSource.includes("pagination.totalPages")).toBe(true);
    expect(billingSource.includes("Previous")).toBe(true);
    expect(billingSource.includes("Next")).toBe(true);
  });
});
