import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API, getToken } from "../api";
import { Spinner, ScoreRing, Alert, StatusBadge } from "../components/ui.jsx";

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || null;
}

function playBase64Wav(b64) {
  if (!b64) return;
  new Audio("data:audio/wav;base64," + b64).play().catch(() => {});
}

export default function Interview() {
  const { id } = useParams(); // application id
  const [application, setApplication] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [threadId, setThreadId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [log, setLog] = useState([]); // [{q, a}]
  const [assessment, setAssessment] = useState(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const recordedMimeType = useRef("audio/webm");

  useEffect(() => {
    api
      .get(`/applications/${id}`)
      .then((a) => {
        setApplication(a);
        if (
          a.interview?.assessment &&
          Object.keys(a.interview.assessment).length
        ) {
          setAssessment(a.interview.assessment);
        }
      })
      .catch((e) => setLoadError(e.message));
  }, [id]);

  const role = application?.job?.title || "the role";

  async function startInterview() {
    setBusy(true);
    setStatus("Generating the first question…");
    setLog([]);
    setAssessment(null);
    try {
      const data = await api.post("/interview/start", {
        role,
        application_id: Number(id),
      });
      setThreadId(data.thread_id);
      setQuestion(data.question_text);
      playBase64Wav(data.question_audio);
      setStatus(data.audio_warning || "Listen, then record your answer.");
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setBusy(false);
  }

  async function startRecording() {
    if (!question || !threadId) return setStatus("Start the interview first.");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      return setStatus("Audio recording is not supported in this browser.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      chunks.current = [];
      recordedMimeType.current = mimeType || "audio/webm";
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mr.addEventListener("dataavailable", (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      });
      mr.addEventListener("stop", () =>
        stream.getTracks().forEach((t) => t.stop()),
      );
      mediaRecorder.current = mr;
      mr.start();
      setRecording(true);
      setStatus("Recording… speak your answer.");
    } catch (e) {
      setStatus("Microphone error: " + (e.message || "permission denied"));
    }
  }

  async function stopAndSubmit() {
    const mr = mediaRecorder.current;
    if (!mr) return;
    setRecording(false);
    setBusy(true);
    setStatus("Transcribing and thinking…");

    await new Promise((resolve) => {
      mr.addEventListener("stop", resolve, { once: true });
      mr.stop();
    });

    if (chunks.current.length === 0) {
      setStatus("No audio captured. Please try again.");
      setBusy(false);
      return;
    }

    const blob = new Blob(chunks.current, { type: recordedMimeType.current });
    const form = new FormData();
    form.append("thread_id", threadId);
    const ext = recordedMimeType.current.includes("mp4") ? "m4a" : "webm";
    form.append("audio", blob, `answer.${ext}`);

    // Use raw fetch here: multipart body + bearer token, no JSON wrapper.
    try {
      const res = await fetch(`${API}/interview/answer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to submit answer");

      setLog((prev) => [...prev, { q: question, a: data.transcript }]);

      if (data.done) {
        setQuestion(null);
        setAssessment(data.assessment);
        playBase64Wav(data.closing_audio);
        setStatus(data.audio_warning || "Interview complete.");
        await persistResult(data.assessment);
      } else {
        setQuestion(data.question_text);
        playBase64Wav(data.question_audio);
        setStatus(
          data.audio_warning || "Listen, then record your next answer.",
        );
      }
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setBusy(false);
  }

  async function persistResult(a) {
    try {
      await api.patch(`/applications/${id}/interview-result`, {
        thread_id: threadId,
        score: a?.overall_score ?? null,
        recommendation: a?.recommendation ?? null,
        summary: a?.summary ?? "",
        assessment: a || {},
      });
    } catch {
      /* non-fatal: candidate still sees their result */
    }
  }

  if (loadError) return <Alert tone="error">{loadError}</Alert>;
  if (!application) return <Spinner label="Loading interview…" />;

  const alreadyDone =
    application.status === "interview_completed" && assessment;
  const notInvited = application.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/applications"
        className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200 transition hover:underline"
      >
        ← My applications
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-white"
            style={{
              fontFamily: "’Space Grotesk’, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Voice Interview
          </h1>
          <p className="text-sm text-slate-500">
            {application.job?.title} · {application.job?.company}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {notInvited ? (
        <div className="mt-5">
          <Alert tone="error">
            This application didn’t pass resume screening.
          </Alert>
        </div>
      ) : (
        <>
          {/* Pre-start */}
          {!threadId && !assessment && (
            <div className="card relative mt-6 overflow-hidden p-10 text-center">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/8 to-transparent" />
              <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-32 w-64 rounded-full bg-brand-400/15 blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-brand-400/30 bg-brand-400/10 text-4xl shadow-xl shadow-brand-500/20 ring-4 ring-brand-400/8">
                  🎙️
                </div>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "’Space Grotesk’, sans-serif" }}
                >
                  Ready to begin?
                </h2>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                  You’ll be asked a few questions. Listen carefully, then record
                  your spoken answer. AI assesses you at the end.
                </p>
                <button
                  onClick={startInterview}
                  disabled={busy}
                  className="btn-primary mt-7 px-10 py-3 text-base"
                >
                  {busy ? "Preparing…" : "Begin interview →"}
                </button>
              </div>
            </div>
          )}

          {/* Active question */}
          {question && (
            <div className="card relative mt-6 overflow-hidden p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-3xl bg-brand-500/8 blur-2xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Live · Interviewer asks
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-slate-100">
                  {question}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      disabled={busy}
                      className="btn-primary flex items-center gap-2.5 px-5 py-2.5"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-base">
                        🎙️
                      </span>
                      Record answer
                    </button>
                  ) : (
                    <button
                      onClick={stopAndSubmit}
                      className="flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all"
                      style={{
                        backgroundImage:
                          "linear-gradient(120deg, #fb7185, #e11d48)",
                        boxShadow: "0 0 20px -4px rgba(244, 63, 94, 0.7)",
                        animation: "pulse-ring 1.5s infinite",
                      }}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base">
                        ⏹
                      </span>
                      Stop &amp; submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-4 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 opacity-70" />
              <p className="text-sm text-slate-400 font-mono">{status}</p>
            </div>
          )}

          {/* Transcript */}
          {log.length > 0 && (
            <div className="card mt-6 p-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Session transcript
              </h3>
              <div className="space-y-4">
                {log.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/6 bg-white/3 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                      Q{i + 1}
                    </p>
                    <p className="text-sm text-slate-200">{t.q}</p>
                    <p className="mt-2 text-sm text-slate-500 italic">
                      "{t.a}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final assessment */}
          {assessment && (
            <div className="card relative mt-6 overflow-hidden p-6">
              <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-tl-3xl bg-violet-500/8 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-5">
                  <ScoreRing score={assessment.overall_score} />
                  <div>
                    <h3
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: "’Space Grotesk’, sans-serif" }}
                    >
                      Interview assessment
                    </h3>
                    <p className="text-sm text-slate-400">
                      Recommendation:{" "}
                      <strong className="text-slate-200">
                        {assessment.recommendation}
                      </strong>
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-slate-300">{assessment.summary}</p>
                <div className="mt-5 grid gap-4 rounded-xl border border-white/8 bg-white/3 p-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-400">
                      Strengths
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-300">
                      {assessment.strengths?.map((x, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-0.5 text-brand-400">✓</span> {x}
                        </li>
                      )) || <li className="text-slate-500">—</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-400">
                      Areas to improve
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-300">
                      {assessment.weaknesses?.map((x, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-0.5 text-rose-400">•</span> {x}
                        </li>
                      )) || <li className="text-slate-500">—</li>}
                    </ul>
                  </div>
                </div>
                {!alreadyDone && (
                  <p className="mt-5 text-sm text-brand-300">
                    ✓ Saved to your application. The recruiter can now review
                    it.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
