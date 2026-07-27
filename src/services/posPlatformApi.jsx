import api from "../app/axios";

export class PosPlatformError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "PosPlatformError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function toError(error) {
  if (!error.response) {
    return new PosPlatformError("Unable to reach the Ximo website server.", {
      code: "NETWORK_ERROR",
    });
  }
  const body = error.response.data?.error;
  const defaults = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to manage POS organizations.",
    422: "The POS Platform could not validate this change.",
    503: "The POS Platform is currently unavailable.",
  };
  return new PosPlatformError(
    body?.message ||
      defaults[error.response.status] ||
      "The POS request failed.",
    {
      status: error.response.status,
      code: body?.code,
      details: body?.details,
    },
  );
}

async function request(config) {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw toError(error);
  }
}

export const posPlatformApi = {
  listPlans: () => request({ url: "/admin/pos/plans" }),
  listOrganizations: () => request({ url: "/admin/pos/organizations" }),
  createOrganization: (body, idempotencyKey) =>
    request({
      method: "post",
      url: "/admin/pos/organizations",
      data: body,
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  getOrganization: (organizationId) =>
    request({
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}`,
    }),
  getModules: (organizationId) =>
    request({
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}/modules`,
    }),
  updateSubscription: (organizationId, body) =>
    request({
      method: "patch",
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}/subscription`,
      data: body,
    }),
  setModuleOverride: (organizationId, moduleCode, body) =>
    request({
      method: "put",
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}/modules/${encodeURIComponent(moduleCode)}`,
      data: body,
    }),
  removeModuleOverride: (organizationId, moduleCode) =>
    request({
      method: "delete",
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}/modules/${encodeURIComponent(moduleCode)}`,
    }),
  resendOwnerInvitation: (organizationId, email) =>
    request({
      method: "post",
      url: `/admin/pos/organizations/${encodeURIComponent(organizationId)}/owner-invitation/resend`,
      data: { email },
    }),
};

export function unwrapCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of [...keys, "data", "items", "results"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  return [];
}

export function unwrapEntity(payload, keys = []) {
  for (const key of keys) {
    if (payload?.[key]) return payload[key];
    if (payload?.data?.[key]) return payload.data[key];
  }
  return payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
}
