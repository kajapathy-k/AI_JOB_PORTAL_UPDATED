import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth.jsx";
import { Spinner, Pill, salaryLabel } from "../components/ui.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get(`/jobs/${id}`, { auth: false })
      .then((d) => active && setJob(d))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className="text-rose-400">{error}</p>;
  if (!job) return <Spinner label="Loading job…" />;

  function onApply() {
    if (!user) return navigate("/login", { state: { from: { pathname: `/jobs/${id}/apply` } } });
    if (user.role !== "candidate") return;
    navigate(`/jobs/${id}/apply`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm text-brand-300 hover:underline">
        ← Back to jobs
      </Link>

      <div className="card mt-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="mt-1 text-slate-400">
              {job.company} · {job.location}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10 text-2xl font-bold text-brand-300">
            {job.company?.[0]?.toUpperCase() || "?"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone="green">{salaryLabel(job)}</Pill>
          <Pill>{job.employment_type}</Pill>
          <Pill>{job.location}</Pill>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">About the role</h2>
          <p className="mt-2 whitespace-pre-line text-slate-200">{job.description || "—"}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Requirements</h2>
          <p className="mt-2 whitespace-pre-line text-slate-200">{job.requirements || "—"}</p>
        </section>

        <div className="mt-8 border-t border-white/10 pt-6">
          {user?.role === "recruiter" ? (
            <p className="text-sm text-slate-400">Recruiters can’t apply to jobs.</p>
          ) : (
            <button onClick={onApply} className="btn-primary w-full sm:w-auto">
              Apply with your resume
            </button>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Your resume is screened by AI. Strong matches are invited to a short voice interview.
          </p>
        </div>
      </div>
    </div>
  );
}
