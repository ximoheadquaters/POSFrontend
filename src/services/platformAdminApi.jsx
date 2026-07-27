import { supabase } from "../config/supabase";

export class PlatformAdminError extends Error {
  constructor(message, code = "PLATFORM_REQUEST_FAILED") {
    super(message);
    this.name = "PlatformAdminError";
    this.code = code;
  }
}

function assertResult({ data, error }, fallback) {
  if (error)
    throw new PlatformAdminError(error.message || fallback, error.code);
  return data;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new PlatformAdminError("Your session has expired.", "UNAUTHORIZED");
  }
  return data.user.id;
}

export const platformAdminApi = {
  async listClients() {
    return assertResult(
      await supabase
        .from("clients")
        .select(
          "id, kind, status, legal_name, display_name, primary_email, primary_phone, industry, created_at, client_systems(id, system_code, status)",
        )
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      "Clients could not be loaded.",
    );
  },

  async getClient(clientId) {
    return assertResult(
      await supabase
        .from("clients")
        .select(
          "*, client_contacts(*), client_addresses(*), client_systems(*, systems(*))",
        )
        .eq("id", clientId)
        .single(),
      "The client could not be loaded.",
    );
  },

  async createClient(values) {
    const userId = await currentUserId();
    return assertResult(
      await supabase
        .from("clients")
        .insert({
          kind: values.kind,
          status: values.status,
          legal_name: values.legalName.trim(),
          display_name: values.displayName.trim() || null,
          primary_email: values.primaryEmail.trim() || null,
          primary_phone: values.primaryPhone.trim() || null,
          industry: values.industry.trim() || null,
          preferred_currency: values.currency.toUpperCase(),
          timezone: values.timezone,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single(),
      "The client could not be created.",
    );
  },

  async listSystems() {
    return assertResult(
      await supabase.from("systems").select("*").order("display_order"),
      "Systems could not be loaded.",
    );
  },

  async assignSystem(clientId, values) {
    const userId = await currentUserId();
    return assertResult(
      await supabase
        .from("client_systems")
        .insert({
          client_id: clientId,
          system_code: values.systemCode,
          external_tenant_id: values.externalTenantId,
          status: "active",
          activated_at: new Date().toISOString(),
          metadata: values.metadata || {},
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single(),
      "The system could not be assigned.",
    );
  },

  async removeSystem(assignmentId) {
    return assertResult(
      await supabase.from("client_systems").delete().eq("id", assignmentId),
      "The system assignment could not be removed.",
    );
  },
};
