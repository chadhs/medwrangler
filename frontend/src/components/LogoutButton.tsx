import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Add a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="logout-section">
      <span className="user-welcome">Welcome, {user?.name}</span>
      <button
        onClick={handleLogout}
        className={`logout-button ${isLoggingOut ? "loading" : ""}`}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <span className="loading-spinner small">⏳</span>
            Signing Out...
          </>
        ) : (
          <>
            <span className="logout-icon">🚪</span>
            Sign Out
          </>
        )}
      </button>
    </div>
  );
}
