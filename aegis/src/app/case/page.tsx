"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import BottomTabs, { TabKey } from "@/components/BottomTabs";
import { CASES } from "@/data/cases";

type Decision = "approve" | "challenge" | "override";
type DecisionMap = Record<string, Decision | undefined>;

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const [caseIndex, setCaseIndex] = useState(0);
  const c = cases[caseIndex];

  const [tab, setTab] = useState<TabKey>("evidence");
  const [decisionByCase, setDecisionByCase] = useState<DecisionMap>({});
  const selectedDecision = decisionByCase[c.id];

  const impactLine = selectedDecision
    ? c.impactPreview[selectedDecision]
    : "Select a decision to preview impact…";

  const isLastCase = caseIndex === cases.length - 1;

  const handlePick = (d: Decision) => {
    setDecisionByCase((prev) => ({ ...prev, [c.id]: d }));
  };

  const continueHref = (() => {
    // If last case, go to conclusion and pass the final case decision in query params (commit 2 will expand)
    if (isLastCase) {
      const d = decisionByCase[c.id] ?? "approve";
      return `/end?case=${encodeURIComponent(c.id)}&decision=${encodeURIComponent(d)}`;
    }
    return "#";
  })();

  const handleContinue = () => {
    if (!selectedDecision) return; // require a decision
    if (!isLastCase) {
      setCaseIndex((i) => i + 1);
      setTab("evidence"); // reset tab each case
    }
    // if last case, we rely on Link navigation
  };

  return (
    <Shell>
      <TopBar
        caseId={c.id}
        sla={c.sla}
        thr={c.topStats.thr}
        dev={c.topStats.dev}
        aud={c.topStats.aud}
        level={c.topStats.level}
      />

      <main className="mt-5 rounded-3xl border border-neutral-300 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-bold tracking-wide text-neutral-600">
            CASE ROOM • {caseIndex + 1}/{cases.length}
          </div>

          <div className="text-xs text-neutral-500">
            {isLastCase ? "Final case" : "Next case ready"}
          </div>
        </div>

        {/* 2×2 panels */}
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="AI Recommendation">
            <div className="flex items-center gap-2">
              <span aria-hidden>⚠️</span>
              <span className="font-bold">
                {c.aiRecommendation.label} • {c.aiRecommendation.confidence}
              </span>
            </div>
            <div className="mt-2 text-neutral-700">
              {c.aiRecommendation.action}
            </div>
          </Panel>

          <Panel title="Context">
            <ul className="list-disc space-y-1 pl-5 text-neutral-700">
              {c.context.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Decision">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePick("approve")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  selectedDecision === "approve"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ✓ Approve
              </button>

              <button
                type="button"
                onClick={() => handlePick("challenge")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  selectedDecision === "challenge"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ? Challenge
              </button>

              <button
                type="button"
                onClick={() => handlePick("override")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  selectedDecision === "override"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ⚠ Override
              </button>
            </div>

            {/* If selected strip + continue */}
            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="font-bold">If selected:</span>{" "}
                <span className="text-neutral-700">{impactLine}</span>
              </div>

              {!isLastCase ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedDecision}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-white",
                    selectedDecision
                      ? "bg-neutral-900 hover:bg-neutral-800"
                      : "bg-neutral-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  Next Case →
                </button>
              ) : (
                <Link
                  href={continueHref}
                  onClick={(e) => {
                    if (!selectedDecision) e.preventDefault();
                  }}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-white",
                    selectedDecision
                      ? "bg-neutral-900 hover:bg-neutral-800"
                      : "bg-neutral-400 pointer-events-none",
                  ].join(" ")}
                >
                  Finish →
                </Link>
              )}
            </div>
          </Panel>

          <Panel title="Human Artifact">
            <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-3 text-neutral-800">
              {c.humanArtifact}
            </div>
          </Panel>
        </div>

        {/* Bottom tabs */}
        <div className="mt-4">
          <BottomTabs active={tab} onChange={setTab} />

          <div className="mt-3 rounded-2xl border border-neutral-300 bg-white p-4 text-sm text-neutral-800">
            {tab === "evidence" && (
              <ul className="list-disc space-y-1 pl-5">
                {c.evidence.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}

            {tab === "metrics" && (
              <div className="text-neutral-700">
                Placeholder metrics view (wire this to real state next).
              </div>
            )}

            {tab === "policy" && (
              <ul className="list-disc space-y-1 pl-5">
                {c.policy.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </Shell>
  );
}
