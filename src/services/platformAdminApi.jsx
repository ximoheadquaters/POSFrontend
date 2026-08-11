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

function applicationCodeForDatabase(code) {
  return code === "pos" ? "ximo_pos" : code;
}

function applicationCodeForUi(code) {
  return code === "ximo_pos" ? "pos" : code;
}

function normalizeApplication(application, displayOrder = 0) {
  if (!application) return null;
  return {
    ...application,
    application_code: application.code,
    code: applicationCodeForUi(application.code),
    availability: application.is_active ? "available" : "coming_soon",
    display_order: displayOrder,
  };
}

function normalizeAssignment(assignment) {
  const application = normalizeApplication(assignment.application);
  const databaseCode = assignment.system_code || application?.application_code;
  const { application: _application, ...values } = assignment;
  return {
    ...values,
    system_code: applicationCodeForUi(databaseCode),
    application_code: databaseCode,
    systems: application,
  };
}

function normalizeClient(client) {
  return {
    ...client,
    client_systems: (client.client_systems || []).map(normalizeAssignment),
  };
}

export const platformAdminApi = {
  async listClients() {
    const clients = assertResult(
      await supabase
        .from("clients")
        .select(
          "id, kind, status, legal_name, display_name, primary_email, primary_phone, industry, created_at, client_systems(id, system_code, status)",
        )
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      "Clients could not be loaded.",
    );
    return (clients || []).map(normalizeClient);
  },

  async getClient(clientId) {
    const client = assertResult(
      await supabase
        .from("clients")
        .select(
          "*, client_contacts(*), client_addresses(*), client_systems(*, application:applications!client_systems_system_code_fkey(*))",
        )
        .eq("id", clientId)
        .single(),
      "The client could not be loaded.",
    );
    return normalizeClient(client);
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
    const applications = assertResult(
      await supabase
        .from("applications")
        .select(
          "id, code, name, description, launch_url, is_active, created_at, updated_at",
        )
        .order("name"),
      "Systems could not be loaded.",
    );
    return (applications || []).map(normalizeApplication);
  },

  async assignSystem(clientId, values) {
    const userId = await currentUserId();
    return assertResult(
      await supabase
        .from("client_systems")
        .insert({
          client_id: clientId,
          system_code: applicationCodeForDatabase(values.systemCode),
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

  async updateSystemMetadata(assignmentId, metadata) {
    const userId = await currentUserId();
    return assertResult(
      await supabase
        .from("client_systems")
        .update({
          metadata,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single(),
      "The system assignment could not be updated.",
    );
  },
};
