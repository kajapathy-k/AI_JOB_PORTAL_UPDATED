import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? "text-brand-300 bg-brand-400/10 ring-1 ring-brand-400/30"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0a0f1e]/85 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-3 select-none">
          {/* Animated logo mark */}
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-violet-600 text-white shadow-lg shadow-brand-500/40 transition-all group-hover:scale-110 group-hover:shadow-brand-400/60">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 14c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
              <path d="M3 9c2-3 4-3 6 0" opacity="0.45" />
            </svg>
          </span>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-white">Hire</span>
            <span
              style={{
                backgroundImage: "linear-gradient(100deg, #67e8f9, #818cf8)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              wave
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Jobs
          </NavLink>

          {user?.role === "candidate" && (
            <NavLink to="/applications" className={linkClass}>
              My applications
            </NavLink>
          )}
          {user?.role === "recruiter" && (
            <NavLink to="/recruiter" className={linkClass}>
              Recruiter
            </NavLink>
          )}

          {user ? (
            <div className="ml-3 flex items-center gap-3 border-l border-white/10 pl-3">
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.full_name || user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-3 flex items-center gap-2 border-l border-white/10 pl-3">
              <Link to="/login" className="btn-ghost text-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
