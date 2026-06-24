import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Spinner, Pill, salaryLabel } from "../components/ui.jsx";

function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card group block p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400/30 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold text-white group-hover:text-brand-200 transition"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {job.title}
          </h3>
          <p className="text-sm text-slate-500">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-violet-400/20 text-lg font-bold text-brand-300 ring-1 ring-white/10">
          {job.company?.[0]?.toUpperCase() || "?"}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">
        {job.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Pill tone="green">{salaryLabel(job)}</Pill>
        <Pill>{job.employment_type}</Pill>
      </div>
    </Link>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState(null);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setJobs(null);
    const qs = search ? `?q=${encodeURIComponent(search)}` : "";
    api
      .get(`/jobs${qs}`, { auth: false })
      .then((data) => active && setJobs(data))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div>
      {/* Hero — dark panel with neon accents */}
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#080d1e] via-[#0c1328] to-[#0d0e1f] px-8 py-14 sm:px-12">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-0 h-60 w-60 rounded-full bg-violet-600/12 blur-3xl" />
        {/* Scanline shimmer */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
          }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            AI-powered hiring - CI/CD smoke test live
          </span>

          <h1
            className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            <span className="text-white">Find a job</span>
            <br />
            <span
              style={{
                backgroundImage:
                  "linear-gradient(100deg, #67e8f9 0%, #818cf8 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              that loves you back
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-slate-400">
            Apply once, let AI screen your resume, and interview by voice — all
            in one place.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
            }}
            className="mt-8 flex max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur focus-within:border-brand-400/50 focus-within:shadow-lg focus-within:shadow-brand-500/20 transition-all"
          >
            <input
              className="flex-1 border-0 bg-transparent px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none"
              placeholder="Search title or company…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn-primary m-1.5 px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between">
        <h2
          className="text-base font-semibold text-slate-300"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {search ? `Results for "${search}"` : "Open roles"}
        </h2>
        {search && (
          <button
            onClick={() => {
              setQ("");
              setSearch("");
            }}
            className="text-sm text-brand-300 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {error && <p className="text-rose-400">{error}</p>}
      {!jobs && !error && <Spinner label="Loading jobs…" />}
      {jobs && jobs.length === 0 && (
        <p className="text-slate-400">No jobs found. Try a different search.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs?.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
