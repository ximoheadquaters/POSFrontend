import { Link } from "react-router-dom";
import { Breadcrumbs, PageHeader } from "../../components/pos/PosUi";

export default function Dashboard() {
  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title="Super Admin"
        description="Manage Ximo platform services and connected products."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Link
          to="/admin/clients"
          className="block rounded-card border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Platform records
          </p>
          <h2 className="mt-2 text-lg font-semibold">Clients</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manage client information and assigned Ximo systems.
          </p>
        </Link>
        <Link
          to="/admin/systems"
          className="block rounded-card border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Products
          </p>
          <h2 className="mt-2 text-lg font-semibold">Systems</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manage Ximo POS today and enable future products from one catalog.
          </p>
        </Link>
      </div>
    </>
  );
}
