import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Spinner from "../components/common/Spinner";
import AdminRoute from "./AdminRoute";
import ClientRoute from "./ClientRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import ClientLayout from "../layouts/ClientLayout";
import PublicRoute from "./PublicRoute";

const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const ServicesPage = lazy(() => import("../pages/Services/ServicesPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
const PricingPage = lazy(() => import("../pages/Pricing/PricingPage"));
const SignupPage = lazy(() => import("../pages/Signup/SignupPage"));
const CheckoutPage = lazy(() => import("../pages/Checkout/CheckoutPage"));
const CheckoutProcessingPage = lazy(
  () => import("../pages/Checkout/CheckoutProcessingPage"),
);
const CheckoutSuccessPage = lazy(
  () => import("../pages/Checkout/CheckoutSuccessPage"),
);
const CheckoutFailedPage = lazy(
  () => import("../pages/Checkout/CheckoutFailedPage"),
);
const LoginPage = lazy(() => import("../pages/Login/LoginPage"));
const ResetPasswordPage = lazy(
  () => import("../pages/Login/ResetPasswordPage"),
);
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ClientsPage = lazy(
  () => import("../pages/Dashboard/Clients/ClientsPage"),
);
const ClientDetailsPage = lazy(
  () => import("../pages/Dashboard/Clients/ClientDetailsPage"),
);
const SystemsPage = lazy(
  () => import("../pages/Dashboard/Systems/SystemsPage"),
);
const OrganizationsPage = lazy(
  () => import("../pages/Dashboard/POS/OrganizationsPage"),
);
const OrganizationDetailsPage = lazy(
  () => import("../pages/Dashboard/POS/OrganizationDetailsPage"),
);
const SubscriptionPage = lazy(
  () => import("../pages/Dashboard/POS/SubscriptionPage"),
);
const TenantBillingPage = lazy(
  () => import("../pages/Dashboard/Billing/TenantBillingPage"),
);
const PlatformBillingPage = lazy(
  () => import("../pages/Dashboard/PlatformBilling/PlatformBillingPage"),
);
const ModulesPage = lazy(() => import("../pages/Dashboard/POS/ModulesPage"));
const PlansPage = lazy(() => import("../pages/Dashboard/POS/PlansPage"));
const ClientHomePage = lazy(() => import("../pages/Client/ClientHomePage"));
const ClientPlaceholderPage = lazy(
  () => import("../pages/Client/ClientPlaceholderPage"),
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
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
          <Route path="/signup" element={<SignupPage />} />
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
          <Route path="/login" element={<LoginPage />} />
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
