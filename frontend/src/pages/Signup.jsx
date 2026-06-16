import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Alert } from "../components/ui.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await signup(form);
      navigate(user.role === "recruiter" ? "/recruiter" : "/", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const RoleCard = ({ value, icon, title, desc }) => (
    <button
      type="button"
      onClick={() => setForm({ ...form, role: value })}
      className={`flex-1 rounded-xl border p-4 text-left transition-all ${
        form.role === value
          ? "border-brand-400/60 bg-brand-400/10 ring-2 ring-brand-400/20 shadow-lg shadow-brand-500/10"
          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <div className="mb-2 text-xl">{icon}</div>
      <div
        className="text-sm font-semibold text-slate-100"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </div>
      <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
    </button>
  );

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-4 h-60 w-96 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="card relative p-8">
        <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-tl-2xl bg-brand-400/8 blur-2xl" />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Get started
          </div>
          <h1
            className="text-3xl font-extrabold text-white"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Join Hirewave in a few seconds.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <div className="flex gap-3">
              <RoleCard
                value="candidate"
                icon="👤"
                title="I'm a candidate"
                desc="Find & apply to jobs"
              />
              <RoleCard
                value="recruiter"
                icon="🏢"
                title="I'm a recruiter"
                desc="Post jobs & hire"
              />
            </div>

            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={form.full_name}
                onChange={set("full_name")}
                required
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set("password")}
                minLength={6}
                required
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              className="btn-primary w-full py-3 text-base"
              disabled={busy}
            >
              {busy ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-300 hover:text-brand-200 hover:underline transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
