import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  AdminBreadcrumbs,
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminUi";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";

const initialForm = {
  kind: "company",
  status: "prospect",
  legalName: "",
  displayName: "",
  primaryEmail: "",
  primaryPhone: "",
  industry: "",
  currency: "PHP",
  timezone: "Asia/Manila",
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const resource = usePosResource(platformAdminApi.listClients, []);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const client = await platformAdminApi.createClient(form);
      setCreating(false);
      navigate(`/admin/clients/${client.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminBreadcrumbs items={[{ label: "Clients" }]} />
      <PageHeader
        title="Clients"
        description="Manage core client information and the Ximo systems assigned to each client."
        actions={<Button onClick={() => setCreating(true)}>Add client</Button>}
      />
      {resource.loading ? (
        <AdminLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="overflow-hidden rounded-card border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {[
                    "Client",
                    "Type",
                    "Status",
                    "Systems",
                    "Contact",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {resource.data?.map((client) => (
                  <tr key={client.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {client.display_name || client.legal_name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {client.legal_name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize">
                      {client.kind}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={client.status} />
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {client.client_systems?.length || 0}
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-600">
                      {client.primary_email || client.primary_phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="text-sm font-semibold text-primary"
                        to={`/admin/clients/${client.id}`}
                      >
                        View & manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!resource.data?.length && (
            <div className="p-10 text-center text-sm text-neutral-500">
              No clients yet. Add the first client to begin.
            </div>
          )}
        </div>
      )}
      <Modal
        isOpen={creating}
        onClose={() => !saving && setCreating(false)}
        title="Add client"
      >
        <form onSubmit={create} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-button bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Legal name"
              required
              value={form.legalName}
              onChange={(value) => setForm({ ...form, legalName: value })}
            />
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(value) => setForm({ ...form, displayName: value })}
            />
            <SelectField
              label="Client type"
              value={form.kind}
              options={["company", "individual"]}
              onChange={(value) => setForm({ ...form, kind: value })}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["prospect", "active", "inactive"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <Field
              label="Email"
              type="email"
              value={form.primaryEmail}
              onChange={(value) => setForm({ ...form, primaryEmail: value })}
            />
            <Field
              label="Phone"
              value={form.primaryPhone}
              onChange={(value) => setForm({ ...form, primaryPhone: value })}
            />
            <Field
              label="Industry"
              value={form.industry}
              onChange={(value) => setForm({ ...form, industry: value })}
            />
            <Field
              label="Currency"
              required
              maxLength={3}
              value={form.currency}
              onChange={(value) => setForm({ ...form, currency: value })}
            />
          </div>
          <Field
            label="Timezone"
            required
            value={form.timezone}
            onChange={(value) => setForm({ ...form, timezone: value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setCreating(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create client
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, onChange, ...props }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-button border border-neutral-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
