import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
