import api from "../app/axios";

export const publicApi = {
  /**
   * Fetch canonical public plans catalog
   */
  getPublicPlans: async () => {
    const response = await api.get("/public/plans");
    return response.data;
  },

  /**
   * Create a checkout session
   */
  createCheckoutSession: async (payload) => {
    const response = await api.post("/public/checkout/session", payload);
    return response.data;
  },

  /**
   * Get public checkout session status by token
   */
  getCheckoutStatus: async (token) => {
    const response = await api.get(`/public/checkout/status/${token}`);
    return response.data;
  },

  /**
   * Renew current subscription
   */
  renewSubscription: async () => {
    const response = await api.post("/billing/renew", {});
    return response.data;
  },
};
