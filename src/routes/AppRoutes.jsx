import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Spinner from "../components/common/Spinner";
import AdminRoute from "./AdminRoute";
import ClientRoute from "./ClientRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import ClientLayout from "../layouts/ClientLayout";
import PublicRoute from "./PublicRoute";
import { logStage } from "../utils/logger";

function lazyRoute(importer, route) {
  return lazy(() =>
    importer().catch((error) => {
      logStage("lazy route import", error, { route });
      throw error;
    }),
  );
}

const LandingPage = lazyRoute(() => import("../pages/Landing/LandingPage"), "landing");
const AboutPage = lazyRoute(() => import("../pages/About/AboutPage"), "about");
const ServicesPage = lazyRoute(() => import("../pages/Services/ServicesPage"), "services");
const ContactPage = lazyRoute(() => import("../pages/Contact/ContactPage"), "contact");
const PricingPage = lazyRoute(() => import("../pages/Pricing/PricingPage"), "pricing");
const SignupPage = lazyRoute(() => import("../pages/Signup/SignupPage"), "account");
const CheckoutPage = lazyRoute(() => import("../pages/Checkout/CheckoutPage"), "checkout");
const CheckoutProcessingPage = lazyRoute(
  () => import("../pages/Checkout/CheckoutProcessingPage"),
  "checkout-processing",
);
const CheckoutSuccessPage = lazyRoute(
  () => import("../pages/Checkout/CheckoutSuccessPage"),
  "checkout-success",
);
const CheckoutFailedPage = lazyRoute(
  () => import("../pages/Checkout/CheckoutFailedPage"),
  "checkout-failed",
);
const ResetPasswordPage = lazyRoute(
  () => import("../pages/Login/ResetPasswordPage"),
  "reset-password",
);
const NotFoundPage = lazyRoute(() => import("../pages/NotFound/NotFoundPage"), "not-found");
const Dashboard = lazyRoute(() => import("../pages/Dashboard/Dashboard"), "dashboard");
const ClientsPage = lazyRoute(
  () => import("../pages/Dashboard/Clients/ClientsPage"),
  "clients",
);
const ClientDetailsPage = lazyRoute(
  () => import("../pages/Dashboard/Clients/ClientDetailsPage"),
  "client-details",
);
const SystemsPage = lazyRoute(
  () => import("../pages/Dashboard/Systems/SystemsPage"),
  "systems",
);
const OrganizationsPage = lazyRoute(
  () => import("../pages/Dashboard/POS/OrganizationsPage"),
  "pos-organizations",
);
const OrganizationDetailsPage = lazyRoute(
  () => import("../pages/Dashboard/POS/OrganizationDetailsPage"),
  "pos-organization-details",
);
const SubscriptionPage = lazyRoute(
  () => import("../pages/Dashboard/POS/SubscriptionPage"),
  "pos-subscription",
);
const TenantBillingPage = lazyRoute(
  () => import("../pages/Dashboard/Billing/TenantBillingPage"),
  "tenant-billing",
);
const PlatformBillingPage = lazyRoute(
  () => import("../pages/Dashboard/PlatformBilling/PlatformBillingPage"),
  "platform-billing",
);
const ModulesPage = lazyRoute(() => import("../pages/Dashboard/POS/ModulesPage"), "pos-modules");
const PlansPage = lazyRoute(() => import("../pages/Dashboard/POS/PlansPage"), "pos-plans");
const ClientHomePage = lazyRoute(() => import("../pages/Client/ClientHomePage"), "client-home");
const ClientPlaceholderPage = lazyRoute(
  () => import("../pages/Client/ClientPlaceholderPage"),
  "client-placeholder",
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function AccountAccessPage() {
  const location = useLocation();

  return (
    <SignupPage
      initialMode={location.pathname === "/login" ? "signin" : "signup"}
    />
  );
}

function AccountAccessPath() {
  return null;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/processing"
            element={<CheckoutProcessingPage />}
          />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/failed" element={<CheckoutFailedPage />} />
          <Route path="/settings/billing" element={<TenantBillingPage />} />
          <Route path="/billing" element={<TenantBillingPage />} />
        </Route>
        <Route element={<PublicRoute />}>
          <Route element={<AccountAccessPage />}>
            <Route path="/signup" element={<AccountAccessPath />} />
            <Route path="/login" element={<AccountAccessPath />} />
          </Route>
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ClientRoute />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientHomePage />} />
            <Route
              path="reports"
              element={<ClientPlaceholderPage section="reports" />}
            />
            <Route
              path="branches"
              element={<ClientPlaceholderPage section="branches" />}
            />
            <Route
              path="inventory"
              element={<ClientPlaceholderPage section="inventory" />}
            />
            <Route
              path="customers"
              element={<ClientPlaceholderPage section="customers" />}
            />
            <Route
              path="settings"
              element={<ClientPlaceholderPage section="settings" />}
            />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="systems" element={<SystemsPage />} />
            <Route path="systems/pos" element={<OrganizationsPage />} />
            <Route path="systems/pos/plans" element={<PlansPage />} />
            <Route path="billing" element={<PlatformBillingPage />} />
            <Route
              path="billing/subscriptions"
              element={<PlatformBillingPage />}
            />
            <Route path="billing/checkouts" element={<PlatformBillingPage />} />
            <Route path="billing/webhooks" element={<PlatformBillingPage />} />
            <Route
              path="billing/provisioning"
              element={<PlatformBillingPage />}
            />
            <Route
              path="systems/pos/organizations/:organizationId"
              element={<OrganizationDetailsPage />}
            />
            <Route
              path="systems/pos/organizations/:organizationId/subscription"
              element={<SubscriptionPage />}
            />
            <Route
              path="systems/pos/organizations/:organizationId/modules"
              element={<ModulesPage />}
            />
            <Route path="pos" element={<OrganizationsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
