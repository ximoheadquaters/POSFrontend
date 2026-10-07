import { supabase } from "../config/supabase";

export class PlatformAdminError extends Error {
  constructor(message, code = "PLATFORM_REQUEST_FAILED", details = null) {
    super(message);
    this.name = "PlatformAdminError";
    this.code = code;
    this.details = details;
  }
}

function assertResult({ data, error }, fallback) {
  if (error) {
    throw new PlatformAdminError(
      error.message || fallback,
      error.code,
      error.details || error.hint || null,
    );
  }
  return data;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new PlatformAdminError("Your session has expired.", "UNAUTHORIZED");
  }
  return data.user.id;
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
  const authAccounts = Array.isArray(client.client_auth_accounts)
    ? client.client_auth_accounts
    : client.client_auth_accounts
      ? [client.client_auth_accounts]
      : [];
  const clientAuthAccount = authAccounts[0] || null;
  return {
    ...client,
    client_systems: (client.client_systems || []).map(normalizeAssignment),
    client_auth_accounts: authAccounts,
    client_auth_account: clientAuthAccount,
  };
}

function clientDisplayName(client) {
  return client?.display_name || client?.legal_name || "another client";
}

export const platformAdminApi = {
  async listClients() {
    const clientColumns =
      "id, kind, status, legal_name, display_name, primary_email, primary_phone, industry, created_at, client_systems(id, system_code, status)";
    const accountColumns =
      "client_auth_accounts(user_id, email, email_confirmed_at, source)";
    let result = await supabase
      .from("clients")
      .select(`${clientColumns}, ${accountColumns}`)
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    // The website can be deployed independently from the database migration.
    // Continue showing the existing client list until PostgREST has the new
    // client-auth relationship, instead of failing the whole admin screen.
    if (
      result.error &&
      (result.error.code === "PGRST200" || result.error.code === "PGRST205") &&
      result.error.message?.includes("client_auth_accounts")
    ) {
      result = await supabase
        .from("clients")
        .select(clientColumns)
        .neq("status", "archived")
        .order("created_at", { ascending: false });
    }

    const clients = assertResult(result, "Clients could not be loaded.");
    return (clients || []).map(normalizeClient);
  },

  async getClient(clientId) {
    const primaryResult = await supabase
      .from("clients")
      .select(
        "*, client_auth_accounts(user_id, email, email_confirmed_at, source), client_contacts(*), client_addresses(*), client_systems(*, application:applications!client_systems_system_code_fkey(*))",
      )
      .eq("id", clientId)
      .single();

    if (
      primaryResult.error &&
      (primaryResult.error.code === "PGRST200" ||
        primaryResult.error.code === "PGRST205" ||
        primaryResult.error.message?.includes("applications"))
    ) {
      const fallbackResult = await supabase
        .from("clients")
        .select("*, client_contacts(*), client_addresses(*), client_systems(*)")
        .eq("id", clientId)
        .single();
      const client = assertResult(
        fallbackResult,
        "The client could not be loaded.",
      );
      return normalizeClient(client);
    }

    const client = assertResult(
      primaryResult,
      "The client could not be loaded.",
    );
    return normalizeClient(client);
  },

  async createClient(values) {
    const userId = await currentUserId();
    const primaryEmail = values.primaryEmail.trim().toLowerCase();

    if (primaryEmail) {
      const { data: existingClients, error: existingClientsError } =
        await supabase
          .from("clients")
          .select("id, legal_name, display_name, status")
          .ilike("primary_email", primaryEmail)
          .neq("status", "archived")
          .limit(1);

      if (existingClientsError) {
        throw new PlatformAdminError(
          existingClientsError.message ||
            "Existing clients could not be checked.",
          existingClientsError.code,
          existingClientsError.details || existingClientsError.hint || null,
        );
      }

      if (existingClients?.[0]) {
        const existing = existingClients[0];
        throw new PlatformAdminError(
          `${clientDisplayName(existing)} already has a client record for ${primaryEmail}. Open that client instead of creating a duplicate.`,
          "CLIENT_EMAIL_EXISTS",
          { client: existing },
        );
      }
    }

    return assertResult(
      await supabase
        .from("clients")
        .insert({
          kind: values.kind,
          status: values.status,
          legal_name: values.legalName.trim(),
          display_name: values.displayName.trim() || null,
          primary_email: primaryEmail || null,
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
    const result = await supabase
      .from("applications")
      .select(
        "id, code, name, description, launch_url, is_active, created_at, updated_at",
      )
      .order("name");

    // Older platform databases still expose the legacy systems catalogue while
    // the canonical applications migration is being deployed. Read that real
    // catalogue instead of showing an error for a known transition state.
    if (
      result.error?.code === "PGRST205" &&
      result.error.message?.includes("public.applications")
    ) {
      const legacySystems = assertResult(
        await supabase
          .from("systems")
          .select("code, name, description, display_order")
          .order("display_order"),
        "Systems could not be loaded.",
      );
      return (legacySystems || []).map((system, index) =>
        normalizeApplication(
          {
            ...system,
            code: system.code === "pos" ? "ximo_pos" : system.code,
            is_active: true,
          },
          system.display_order ?? index,
        ),
      );
    }

    const applications = assertResult(result, "Systems could not be loaded.");
    return (applications || []).map(normalizeApplication);
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
