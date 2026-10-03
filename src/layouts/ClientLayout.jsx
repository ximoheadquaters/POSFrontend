import { useCallback, useEffect, useRef, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../app/axios";
import PortalShell from "../components/portal/PortalShell";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      {
        to: "/client",
        label: "Dashboard",
        shortLabel: "Home",
        icon: "home",
        end: true,
      },
      { to: "/client/reports", label: "Reports", icon: "reports" },
      { to: "/client/branches", label: "Branches", icon: "branches" },
      {
        to: "/client/inventory",
        label: "Inventory",
        shortLabel: "Stock",
        icon: "inventory",
      },
      {
        to: "/client/customers",
        label: "Customers",
        shortLabel: "People",
        icon: "customers",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/client/billing", label: "Billing", icon: "billing" },
      { to: "/client/settings", label: "Settings", icon: "settings" },
    ],
  },
];

function sectionTitle(pathname) {
  if (pathname.startsWith("/client/reports")) return "Reports";
  if (pathname.startsWith("/client/branches")) return "Branches";
  if (pathname.startsWith("/client/inventory")) return "Inventory";
  if (pathname.startsWith("/client/customers")) return "Customers";
  if (pathname.startsWith("/client/billing")) return "Billing";
  if (pathname.startsWith("/client/settings")) return "Settings";
  return "Dashboard";
}

export default function ClientLayout() {
  const { clientPreview = false } = useOutletContext() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, isLoading } = useAuth();
  const [workspace, setWorkspace] = useState(() => {
    try {
      const cached = sessionStorage.getItem("ximo_client_workspace");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loadingWorkspace, setLoadingWorkspace] = useState(!workspace);
  const hasLoadedInitialWorkspace = useRef(false);

  const fetchWorkspace = useCallback(
    async (background = false) => {
      if (!background && !workspace) setLoadingWorkspace(true);
      try {
        const res = await api.get("/client/workspace");
        if (res.data?.data) {
          setWorkspace(res.data.data);
          try {
            sessionStorage.setItem(
              "ximo_client_workspace",
              JSON.stringify(res.data.data),
            );
          } catch {
            // Storage can be unavailable in private browser contexts.
          }
        }
      } catch (err) {
        console.warn("Failed to load workspace data:", err?.message);
      } finally {
        setLoadingWorkspace(false);
      }
    },
    [workspace],
  );

  useEffect(() => {
    if (hasLoadedInitialWorkspace.current) return;
    hasLoadedInitialWorkspace.current = true;
    fetchWorkspace(Boolean(workspace));
  }, [fetchWorkspace, workspace]);

  const accountName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Client account";
  const accountDetail = user?.email || "Development preview";

  async function handleSignOut() {
    if (clientPreview) {
      navigate("/", { replace: true });
      return;
    }

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // Keep the workspace visible so the client can retry.
    }
  }

  return (
    <PortalShell
      groups={navigationGroups}
      mobileItems={navigationGroups[0].items}
      sectionTitle={sectionTitle(location.pathname)}
      sectionSubtitle={clientPreview ? "Preview workspace" : "Client workspace"}
      workspaceLabel="Client workspace"
      accountName={clientPreview ? "Preview workspace" : accountName}
      accountDetail={accountDetail}
      accountNotice={
        clientPreview ? (
          <p className="rounded-xl border border-[#E8D99E] bg-[#FFF9E7] px-3 py-2 text-xs leading-5 text-[#755A18]">
            Preview mode only. Business data stays private.
          </p>
        ) : null
      }
      onSignOut={handleSignOut}
      signOutDisabled={isLoading}
      signOutLabel={clientPreview ? "Exit preview" : "Sign out"}
      topActions={
        clientPreview ? (
          <span className="rounded-lg border border-[#E8D99E] bg-[#FFF9E7] px-3 py-2 text-xs font-medium text-[#755A18]">
            Preview mode
          </span>
        ) : null
      }
    >
      <Outlet
        context={{
          clientPreview,
          workspace,
          loadingWorkspace,
          refreshWorkspace: () => fetchWorkspace(false),
        }}
      />
    </PortalShell>
  );
}
