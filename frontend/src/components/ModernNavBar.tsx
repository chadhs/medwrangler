import { Link, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home" },
  { path: "/add-med", label: "Medications" },
  { path: "/schedule", label: "Schedule" },
];

export function ModernNavBar() {
  const location = useLocation();

  return (
    <header className="modern-header">
      <div className="header-container">
        <h1 className="app-title">
          <Link to="/" className="title-link">
            💊 MedWrangler
          </Link>
        </h1>

        <nav className="modern-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
