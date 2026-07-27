import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { authService } from "../../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.updatePassword(password);
      navigate("/admin", { replace: true });
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Use at least eight characters.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
