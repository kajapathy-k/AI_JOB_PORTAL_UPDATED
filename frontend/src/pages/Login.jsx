import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Alert } from "../components/ui.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "recruiter" ? "/recruiter" : from, {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function fill(demoEmail) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  return (
    <div className="mx-auto max-w-md py-6">
      {/* Ambient glow behind card */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-8 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="card relative p-8">
        {/* Corner glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-tr-2xl bg-violet-500/10 blur-2xl" />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            Secure login
          </div>
          <h1
            className="text-3xl font-extrabold text-white"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Log in to apply and track your interviews.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            {error && <Alert tone="error">{error}</Alert>}
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button
              className="btn-primary w-full py-3 text-base"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Log in →"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            New here?{" "}
            <Link
              to="/signup"
              className="font-semibold text-brand-300 hover:text-brand-200 hover:underline transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Demo box */}
      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/3 p-4 text-sm">
        <p className="font-semibold text-slate-300">Try a demo account</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => fill("candidate@demo.com")}
            className="btn-ghost text-xs"
          >
            Candidate
          </button>
          <button
            onClick={() => fill("recruiter@demo.com")}
            className="btn-ghost text-xs"
          >
            Recruiter
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          password for both: password123
        </p>
      </div>
    </div>
  );
}
