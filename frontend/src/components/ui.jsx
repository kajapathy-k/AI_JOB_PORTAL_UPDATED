// Small presentational helpers shared across pages.

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const STATUS_STYLES = {
  screening: "bg-amber-500/15 text-amber-300",
  interview_invited: "bg-blue-500/15 text-blue-300",
  interview_completed: "bg-violet-500/15 text-violet-300",
  rejected: "bg-rose-500/15 text-rose-300",
  hired: "bg-brand-500/15 text-brand-200",
  declined: "bg-white/8 text-slate-400",
};

const STATUS_LABELS = {
  screening: "Screening",
  interview_invited: "Interview invited",
  interview_completed: "Interview completed",
  rejected: "Not advanced",
  hired: "Hired",
  declined: "Declined",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] || "bg-white/8 text-slate-400"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function ScoreRing({ score }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const color =
    value >= 75
      ? "text-brand-400"
      : value >= 50
        ? "text-amber-400"
        : "text-rose-400";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          className={color}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-200">
        {value}
      </span>
    </div>
  );
}

export function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-white/8 text-slate-300",
    green: "bg-brand-500/10 text-brand-300",
    red: "bg-rose-500/10 text-rose-400",
  };
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Alert({ children, tone = "info" }) {
  const tones = {
    info: "bg-blue-500/10 text-blue-300 border-blue-400/30",
    error: "bg-rose-500/10 text-rose-300 border-rose-400/30",
    success: "bg-brand-500/10 text-brand-200 border-brand-400/30",
  };
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function salaryLabel(job) {
  const { salary_min, salary_max } = job;
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (salary_min && salary_max)
    return `${fmt(salary_min)} – ${fmt(salary_max)}`;
  if (salary_min) return `from ${fmt(salary_min)}`;
  if (salary_max) return `up to ${fmt(salary_max)}`;
  return "Not disclosed";
}
