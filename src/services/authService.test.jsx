import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../app/axios";
import {
  getAccessTokenClaims,
  resolveSessionAuth,
  sessionToAuth,
} from "./authService";

vi.mock("../app/axios", () => ({
  default: { get: vi.fn() },
}));

function tokenFor(payload) {
  const encoded = btoa(JSON.stringify(payload))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `header.${encoded}.signature`;
}

describe("authentication session mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
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

  it("uses the canonical platform role returned by the website API", async () => {
    api.get.mockResolvedValue({
      data: {
        role: "super_admin",
        platformAdmin: {
          id: "user-1",
          role: "super_admin",
          displayName: "Ximo Platform Owner",
        },
      },
    });

    const session = {
      access_token: tokenFor({ sub: "user-1" }),
      user: { id: "user-1", app_metadata: {} },
    };
    await expect(resolveSessionAuth(session)).resolves.toMatchObject({
      role: "super_admin",
      platformAdmin: {
        id: "user-1",
        role: "super_admin",
      },
    });
    expect(api.get).toHaveBeenCalledWith("/auth/session");
  });
});
