import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requestUse: vi.fn(),
  responseUse: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: mocks.requestUse },
        response: { use: mocks.responseUse },
      },
    })),
  },
}));

vi.mock("../config/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: mocks.signOut,
    },
  },
}));

describe("website API response handling", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.requestUse.mockClear();
    mocks.responseUse.mockClear();
    mocks.signOut.mockClear();
  });

  it("does not destroy a valid website session when a downstream API returns 401", async () => {
    await import("./axios");

    const rejectResponse = mocks.responseUse.mock.calls[0][1];
    const error = { response: { status: 401 } };

    await expect(rejectResponse(error)).rejects.toBe(error);
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
