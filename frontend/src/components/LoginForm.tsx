import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StatusIndicator } from "./StatusIndicator";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@medwrangler.com");
    setPassword("demo123");
    setError(null);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">💊 MedWrangler</h1>
          <p className="login-subtitle">
            Your personal medication management system
          </p>
        </div>

        {error && (
          <StatusIndicator
            type="warning"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="demo-section">
          <div className="divider">
            <span>Demo Access</span>
          </div>

          <button
            type="button"
            onClick={fillDemoCredentials}
            className="demo-button"
            disabled={isLoading}
          >
            🚀 Use Demo Credentials
          </button>

          <div className="demo-info">
            <p>
              <strong>Email:</strong> demo@medwrangler.com
            </p>
            <p>
              <strong>Password:</strong> demo123
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p>
            This is a demo version of MedWrangler. Use the demo credentials
            above to explore the medication management features.
          </p>
        </div>
      </div>
    </div>
  );
}
