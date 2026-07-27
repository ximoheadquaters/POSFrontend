import AppRoutes from "./routes/AppRoutes";
import AuthBootstrap from "./components/auth/AuthBootstrap";

export default function App() {
  return (
    <AuthBootstrap>
      <AppRoutes />
    </AuthBootstrap>
  );
}
