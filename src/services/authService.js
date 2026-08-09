import { isSupabaseConfigured, supabase } from "../config/supabase";
import api from "../app/axios";

export class AuthenticationError extends Error {
  constructor(message, code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthenticationError(
      "Authentication is not configured for this environment.",
      "AUTH_NOT_CONFIGURED",
    );
  }
}

function friendlyError(error) {
  const message = String(error?.message || "");
  if (/invalid login credentials/i.test(message)) {
    return new AuthenticationError(
      "The email address or password is incorrect.",
      "INVALID_CREDENTIALS",
    );
  }
  if (/email not confirmed/i.test(message)) {
    return new AuthenticationError(
      "Confirm your email address before signing in.",
      "EMAIL_NOT_CONFIRMED",
    );
  }
  if (/rate limit|too many/i.test(message)) {
    return new AuthenticationError(
      "Too many attempts. Please wait before trying again.",
      "RATE_LIMITED",
    );
  }
  return new AuthenticationError(
    message || "Authentication failed. Please try again.",
    error?.code,
  );
}

export function getAccessTokenClaims(accessToken) {
  try {
    const payload = accessToken?.split(".")[1];
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map(
          (character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        )
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function sessionToAuth(session) {
  if (!session) return { user: null, token: null, role: null };
  const claims = getAccessTokenClaims(session.access_token);
  return {
    user: session.user,
    token: session.access_token,
    role:
      claims.user_role ??
      session.user?.app_metadata?.user_role ??
      session.user?.app_metadata?.role ??
      null,
  };
}

export async function resolveSessionAuth(session) {
  const auth = sessionToAuth(session);
  if (!session) return auth;

  try {
    const { data } = await api.get("/auth/session");
    if (data?.role) {
      return {
        ...auth,
        role: data.role,
        platformAdmin: data.platformAdmin ?? null,
      };
    }
  } catch (error) {
    console.warn(
      "Unable to resolve the current platform role.",
      error?.response?.data?.error?.message ?? error?.message,
    );
  }

  if (auth.role && auth.role !== "super_admin") return auth;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role_code")
    .eq("user_id", session.user.id);

  if (error) {
    console.warn("Unable to resolve the current website role.", error.message);
    return auth;
  }

  const priority = [
    "admin",
    "client_manager",
    "staff",
    "client_user",
  ];
  const roles = new Set((data || []).map((item) => item.role_code));
  return {
    ...auth,
    role:
      priority.find((candidate) => roles.has(candidate)) ??
      data?.[0]?.role_code ??
      null,
  };
}

export const authService = {
  async getSession() {
    ensureConfigured();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw friendlyError(error);
    return data.session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) =>
      callback(session),
    ).data.subscription;
  },

  async signIn(email, password) {
    ensureConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw friendlyError(error);
    return data.session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw friendlyError(error);
  },

  async sendPasswordReset(email) {
    ensureConfigured();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    if (error) throw friendlyError(error);
  },

  async updatePassword(password) {
    ensureConfigured();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw friendlyError(error);
  },
};
