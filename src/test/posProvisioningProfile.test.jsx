import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const pageCode = fs.readFileSync(
  path.resolve(
    __dirname,
    "../pages/Dashboard/Clients/ClientDetailsPage.jsx",
  ),
  "utf8",
);

describe("POS business-profile provisioning", () => {
  test("requires an explicit retail, food-service, or hybrid selection", () => {
    expect(pageCode).toContain('value: "retail"');
    expect(pageCode).toContain('value: "food_service"');
    expect(pageCode).toContain('value: "hybrid"');
    expect(pageCode).toContain("!provisioning.businessProfile");
  });

  test("stores the selected profile with the client system assignment", () => {
    expect(pageCode).toContain(
      "businessProfile: provisioning.businessProfile",
    );
  });
});
