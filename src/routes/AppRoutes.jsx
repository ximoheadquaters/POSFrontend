import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Spinner from "../components/common/Spinner";
import AdminRoute from "./AdminRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicRoute from "./PublicRoute";

const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const ServicesPage = lazy(() => import("../pages/Services/ServicesPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
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
const ModulesPage = lazy(() => import("../pages/Dashboard/POS/ModulesPage"));

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
        </Route>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="systems" element={<SystemsPage />} />
            <Route path="systems/pos" element={<OrganizationsPage />} />
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
