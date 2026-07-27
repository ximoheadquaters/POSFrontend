import { describe, expect, it } from "vitest";
import { getAccessTokenClaims, sessionToAuth } from "./authService";

function tokenFor(payload) {
  const encoded = btoa(JSON.stringify(payload))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `header.${encoded}.signature`;
}

describe("authentication session mapping", () => {
  it("reads the custom user_role claim", () => {
    const token = tokenFor({ sub: "user-1", user_role: "super_admin" });
    expect(getAccessTokenClaims(token).user_role).toBe("super_admin");
    expect(
      sessionToAuth({
        access_token: token,
        user: { id: "user-1", app_metadata: {} },
      }),
    ).toMatchObject({
      token,
      role: "super_admin",
      user: { id: "user-1" },
    });
  });

  it("clears authentication when no session exists", () => {
    expect(sessionToAuth(null)).toEqual({
      user: null,
      token: null,
      role: null,
    });
  });
});
