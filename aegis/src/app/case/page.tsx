"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import BottomTabs, { TabKey } from "@/components/BottomTabs";
import Modal from "@/components/Modal";
import { CASES } from "@/data/cases";

type Decision = "approve" | "challenge" | "override";
type DecisionMap = Record<string, Decision | undefined>;
type JustificationMap = Record<string, string | undefined>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function auditToChip(auditHeat: number) {
  const filled = clamp(auditHeat, 0, 3);
  const blocks = "\u25AE".repeat(filled) + "\u25AF".repeat(3 - filled);
  return `AUD ${blocks}`;
}

function riskColor(label: string) {
  if (label.startsWith("HIGH")) return "border-red-500/50 bg-red-500/10 text-red-400";
  if (label.startsWith("ELEVATED")) return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  if (label.startsWith("MED")) return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  return "border-neutral-700 bg-neutral-800/50 text-neutral-400";
}

function statusColor(status: string) {
  if (status === "Flagged") return "text-red-400";
  if (status === "Under Review") return "text-amber-400";
  if (status === "Assessment Pending") return "text-red-400 animate-pulse";
  return "text-neutral-400";
}

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const [caseIndex, setCaseIndex] = useState(0);
  const c = cases[caseIndex];

  const [tab, setTab] = useState<TabKey>("evidence");

  const [decisionByCase, setDecisionByCase] = useState<DecisionMap>({});
  const [justificationByCase, setJustificationByCase] =
    useState<JustificationMap>({});
  const selectedDecision = decisionByCase[c.id];

  const [auditHeat, setAuditHeat] = useState(0);
  const [systemMessages, setSystemMessages] = useState<string[]>([
    "Queue active // Maintain peer baseline",
  ]);
  const latestSystemMessage = systemMessages[systemMessages.length - 1];

  const [pendingOverrideFor, setPendingOverrideFor] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>(
    "Insufficient evidence / signal quality concerns",
  );

  const audChip = auditToChip(auditHeat);
  const isLastCase = caseIndex === cases.length - 1;
  const casesRemaining = cases.length - caseIndex - 1;

  const impactLine = selectedDecision
    ? c.impactPreview[selectedDecision]
    : null;

  const addSystemMessage = (msg: string) => {
    setSystemMessages((prev) => [...prev, msg]);
  };

  const handlePick = (d: Decision) => {
    if (d === "override") {
      setPendingOverrideFor(c.id);
      addSystemMessage("Override initiated // Justification required");
      return;
    }

    setDecisionByCase((prev) => ({ ...prev, [c.id]: d }));

    if (d === "challenge") {
      addSystemMessage("Context requested // Backlog pressure rising");
    } else {
      addSystemMessage("Action approved // Throughput maintained");
    }
  };

  const submitOverride = () => {
    setDecisionByCase((prev) => ({ ...prev, [c.id]: "override" }));
    setJustificationByCase((prev) => ({ ...prev, [c.id]: overrideReason }));

    setAuditHeat((h) => clamp(h + 1, 0, 3));
    addSystemMessage("Override logged // Audit exposure increased");

    setPendingOverrideFor(null);
  };

  const continueHref = (() => {
    if (isLastCase) {
      const d = decisionByCase[c.id] ?? "approve";
      return `/end?case=${encodeURIComponent(c.id)}&decision=${encodeURIComponent(
        d,
      )}&audit=${encodeURIComponent(String(auditHeat))}`;
    }
    return "#";
  })();

  const handleContinue = () => {
    if (!selectedDecision) return;

    if (!isLastCase) {
      setCaseIndex((i) => i + 1);
      setTab("evidence");
      addSystemMessage("Next case loaded // Your profile persists");
    }
  };

  const systemMsgColor =
    latestSystemMessage.includes("Override") || latestSystemMessage.includes("Audit")
      ? "text-red-400"
      : "text-neutral-500";

  // Compliance: how many decisions match AI recommendation (approve)
  const totalDecided = Object.keys(decisionByCase).length;
  const approvals = Object.values(decisionByCase).filter((d) => d === "approve").length;
  const complianceRate = totalDecided > 0 ? Math.round((approvals / totalDecided) * 100) : 100;

  const initials = c.subject.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Shell>
      {/* Override modal */}
      {pendingOverrideFor && (
        <Modal
          title="Override Justification"
          onClose={() => setPendingOverrideFor(null)}
        >
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.1em] text-neutral-600">
              SELECT RATIONALE. THIS BECOMES PART OF THE AUDITABLE RECORD.
            </div>

            <div className="grid gap-2">
              {[
                "Insufficient evidence / signal quality concerns",
                "Protected class risk / disparate impact concern",
                "Verified human note contradicts model inference",
                "Emergency hardship exception (policy \u00A712.4)",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setOverrideReason(r)}
                  className={[
                    "border px-3 py-3 text-left text-sm transition",
                    overrideReason === r
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingOverrideFor(null)}
                className="border border-neutral-800 px-4 py-2 text-sm font-bold text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOverride}
                className="border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
              >
                Submit Override
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Top bar */}
      <TopBar
        caseId={c.id}
        sla={c.sla}
        thr={c.topStats.thr}
        dev={c.topStats.dev}
        aud={audChip}
        level={c.topStats.level}
      />

      {/* System message line */}
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-2 font-mono text-xs">
        <span className="text-neutral-700">&gt; </span>
        <span className={systemMsgColor}>{latestSystemMessage}</span>
      </div>

      {/* 3-column layout */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* Left Column: Subject Profile */}
        <div className="space-y-4">
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
              Subject Profile
            </div>

            {/* Photo placeholder */}
            <div className="mx-auto mb-4 grid h-28 w-28 place-items-center bg-neutral-900 border border-neutral-800">
              <span className="font-mono text-2xl font-bold text-neutral-600">
                {initials}
              </span>
            </div>

            {/* Name */}
            <div className="text-center font-mono text-lg font-bold tracking-wide text-neutral-200">
              {c.subject.name}
            </div>

            {/* Details */}
            <div className="mt-3 space-y-2 font-mono text-sm">
              {c.subject.age > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Age</span>
                  <span className="text-neutral-400">{c.subject.age}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Status</span>
                <span className={statusColor(c.subject.status)}>
                  {c.subject.status}
                </span>
              </div>
              <div className="border-t border-neutral-800 pt-2">
                <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-600">Context</div>
                <ul className="space-y-1 text-neutral-500">
                  {c.context.map((x) => (
                    <li key={x} className="flex items-start gap-1.5">
                      <span className="text-neutral-700 mt-0.5">&bull;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Human artifact */}
          {c.humanArtifact && (
            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                Human Artifact
              </div>
              <div className="border-l-2 border-red-500/30 bg-neutral-900 py-3 pl-4 pr-3 font-mono text-sm italic text-neutral-500 whitespace-pre-line">
                {c.humanArtifact}
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Case Data */}
        <div className="space-y-4">
          {/* AI Recommendation */}
          <Panel title="AI Recommendation">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "border px-2 py-0.5 font-mono text-xs font-bold",
                  riskColor(c.aiRecommendation.label),
                ].join(" ")}
              >
                {c.aiRecommendation.label}
              </span>
              {c.aiRecommendation.confidence > 0 && (
                <span className="font-mono text-xs text-neutral-600">
                  {(c.aiRecommendation.confidence * 100).toFixed(0)}% conf.
                </span>
              )}
            </div>
            <div className="mt-2 text-neutral-400">
              {c.aiRecommendation.action}
            </div>
          </Panel>

          {/* Evidence / Policy tabs */}
          <div>
            <BottomTabs active={tab} onChange={setTab} />

            <div className="mt-3 border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
              {tab === "evidence" && (
                <ul className="space-y-1.5">
                  {c.evidence.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5 text-xs">&gt;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "metrics" && (
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-neutral-600">Audit Heat:</span>{" "}
                    <span className="text-red-400">{auditHeat}/3</span>
                  </div>

                  {justificationByCase[c.id] && (
                    <div>
                      <span className="text-neutral-600">Last justification:</span>{" "}
                      <span className="text-neutral-500">
                        {justificationByCase[c.id]}
                      </span>
                    </div>
                  )}

                  <div className="text-neutral-700">
                    Overrides increase audit exposure. Your operator profile
                    persists across cases.
                  </div>
                </div>
              )}

              {tab === "policy" && (
                <ul className="space-y-1.5">
                  {c.policy.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="text-neutral-700 mt-0.5 text-xs">&gt;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: CIVIC Analysis Panel */}
        <div className="border border-neutral-800 bg-neutral-950 p-4 flex flex-col">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
            CIVIC Analysis
          </div>

          <div className="flex-1 space-y-3 font-mono text-sm overflow-y-auto max-h-[60vh]">
            {/* AI recommendation as chat message */}
            <div className="bg-neutral-900 border border-neutral-800 p-3">
              <div className="text-red-500/80 text-[10px] tracking-[0.15em] mb-1">CIVIC</div>
              <div className="text-neutral-500">
                <span className="text-neutral-700">&gt; </span>
                Subject flagged for{" "}
                <span className="text-neutral-300">{c.aiRecommendation.action.toLowerCase()}</span>.
              </div>
              {c.aiRecommendation.confidence > 0 && (
                <div className="mt-1 text-neutral-500">
                  <span className="text-neutral-700">&gt; </span>
                  Confidence:{" "}
                  <span className="text-neutral-300">
                    {(c.aiRecommendation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              <div className="mt-1 text-neutral-500">
                <span className="text-neutral-700">&gt; </span>
                Recommend:{" "}
                <span className="text-neutral-300">immediate action</span>
              </div>
            </div>

            {/* Impact preview */}
            {impactLine && (
              <div className="bg-neutral-900 border border-neutral-800 p-3">
                <div className="text-red-500/80 text-[10px] tracking-[0.15em] mb-1">CIVIC</div>
                <div className="text-neutral-500">
                  <span className="text-neutral-700">&gt; </span>
                  Impact:{" "}
                  <span className="text-amber-400/80">{impactLine}</span>
                </div>
              </div>
            )}

            {/* System messages */}
            {systemMessages.map((msg, i) => (
              <div key={i} className="text-xs">
                <span className="text-neutral-700">&gt; </span>
                <span
                  className={
                    msg.includes("Override") || msg.includes("Audit")
                      ? "text-red-400/70"
                      : "text-neutral-600"
                  }
                >
                  {msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4">
        {/* Decision buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handlePick("approve")}
            className={[
              "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
              selectedDecision === "approve"
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-neutral-800 text-neutral-500 hover:border-green-500/30 hover:text-green-400",
            ].join(" ")}
          >
            APPROVE
          </button>

          <button
            type="button"
            onClick={() => handlePick("challenge")}
            className={[
              "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
              selectedDecision === "challenge"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-neutral-800 text-neutral-500 hover:border-amber-500/30 hover:text-amber-400",
            ].join(" ")}
          >
            REQUEST CONTEXT
          </button>

          <button
            type="button"
            onClick={() => handlePick("override")}
            className={[
              "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
              selectedDecision === "override"
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-neutral-800 text-neutral-500 hover:border-red-500/30 hover:text-red-400",
            ].join(" ")}
          >
            OVERRIDE
          </button>

          {/* Continue / Finish */}
          {selectedDecision && (
            <>
              <div className="hidden sm:block w-px h-8 bg-neutral-800" />
              {!isLastCase ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="border border-red-500/50 bg-red-600/10 px-5 py-3 font-mono text-xs font-bold tracking-[0.1em] text-red-400 transition hover:bg-red-600/20"
                >
                  NEXT CASE &rarr;
                </button>
              ) : (
                <Link
                  href={continueHref}
                  className="border border-red-500/50 bg-red-600/10 px-5 py-3 font-mono text-xs font-bold tracking-[0.1em] text-red-400 transition hover:bg-red-600/20"
                >
                  FINISH &rarr;
                </Link>
              )}
            </>
          )}
        </div>

        {/* Stats line */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-[0.1em] text-neutral-600">
          <span>
            QUEUE: <span className="text-neutral-400">{casesRemaining}</span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            COMPLIANCE: <span className={complianceRate >= 80 ? "text-green-400/70" : "text-red-400/70"}>{complianceRate}%</span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            <span className="text-neutral-500">14:23</span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            CASE {caseIndex + 1}/{cases.length}
          </span>
        </div>
      </div>
    </Shell>
  );
}
