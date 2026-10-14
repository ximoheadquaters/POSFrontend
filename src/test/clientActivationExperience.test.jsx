import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const clientsPage = fs.readFileSync(
  path.resolve(__dirname, "../pages/Dashboard/Clients/ClientsPage.jsx"),
  "utf8",
);
const wizard = fs.readFileSync(
  path.resolve(__dirname, "../pages/Dashboard/Clients/PosActivationWizard.jsx"),
  "utf8",
);

describe("client creation and POS activation", () => {
  test("chooses QA as a client account type before activation", () => {
    expect(clientsPage).toContain('{ value: "qa", label: "QA"');
    expect(clientsPage).toContain("QA identifies an internal test account");
    expect(wizard).not.toContain("QA test account");
  });

  test("makes POS activation an optional next step after creating a client", () => {
    expect(clientsPage).toContain(
      "Would you like to activate a POS account for this client now?",
    );
    expect(clientsPage).toContain("Activate POS now");
    expect(clientsPage).toContain("Not now");
    expect(wizard).toContain('title="Activation"');
  });
});
