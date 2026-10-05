import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const pageCode = fs.readFileSync(
  path.resolve(__dirname, "../pages/Dashboard/Clients/ClientDetailsPage.jsx"),
  "utf8",
);
const wizardCode = fs.readFileSync(
  path.resolve(__dirname, "../pages/Dashboard/Clients/PosActivationWizard.jsx"),
  "utf8",
);

describe("POS business-profile provisioning", () => {
  test("requires an explicit retail, food-service, or hybrid selection", () => {
    expect(wizardCode).toContain('"retail"');
    expect(wizardCode).toContain('"food_service"');
    expect(wizardCode).toContain('"hybrid"');
    expect(wizardCode).toContain("!values.businessProfile");
  });

  test("sends the selected profile to the server-owned activation flow", () => {
    expect(pageCode).toContain("<PosActivationWizard");
    expect(wizardCode).toContain("activateClientPos");
    expect(wizardCode).toContain("provisioning: values");
  });
});
