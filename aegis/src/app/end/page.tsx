import Link from "next/link";
import Shell from "@/components/Shell";

type SearchParams = { case?: string; decision?: string; audit?: string };

function prettyDecision(d?: string) {
  if (!d) return "\u2014";
  if (d === "approve") return "APPROVED";
  if (d === "challenge") return "DEFERRED";
  if (d === "override") return "OVERRIDDEN";
  return d;
}

function decisionColor(d?: string) {
  if (d === "approve") return "text-green-400";
  if (d === "challenge") return "text-amber-400";
  if (d === "override") return "text-red-400";
  return "text-neutral-400";
}

export default function EndPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const caseId = searchParams.case ?? "\u2014";
  const decision = prettyDecision(searchParams.decision);
  const audit = searchParams.audit ?? "\u2014";
  const complianceRate =
    searchParams.decision === "approve"
      ? "100%"
      : searchParams.decision === "challenge"
        ? "67%"
        : "33%";

  return (
    <Shell>
      <div className="grid min-h-[80dvh] place-items-center">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.3em] text-red-500/80 mb-4">
              SESSION TERMINATED
            </p>
            <div className="font-mono text-3xl font-bold tracking-[0.15em] text-neutral-100">
              SHIFT COMPLETE.
            </div>
            <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-neutral-700">
              ALL ACTIONS LOGGED // RECORDS SEALED
            </div>
          </div>

          {/* Session summary */}
          <div className="border border-neutral-800 bg-neutral-950 p-5 font-mono text-sm">
            <div className="mb-4 text-[10px] uppercase tracking-[0.25em] text-neutral-600">
              Session Summary
            </div>

            <div className="space-y-2 text-neutral-500">
              <div>
                <span className="text-neutral-700">&gt; </span>
                Final case: <span className="text-neutral-300">#{caseId}</span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Final action:{" "}
                <span className={`font-bold ${decisionColor(searchParams.decision)}`}>
                  {decision}
                </span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Audit heat:{" "}
                <span className={
                  Number(audit) >= 2 ? "font-bold text-red-400" : "font-bold text-amber-400"
                }>
                  {audit}/3
                </span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Compliance rate:{" "}
                <span className={
                  searchParams.decision === "approve"
                    ? "text-green-400"
                    : "text-red-400"
                }>
                  {complianceRate}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-neutral-800 pt-4 space-y-1.5 text-[10px] tracking-[0.1em] text-neutral-700">
              <div>&gt; Your session data has been archived.</div>
              <div>&gt; Performance metrics forwarded to supervisory review.</div>
              <div>&gt; Tomorrow&apos;s queue: 17 cases.</div>
            </div>
          </div>

          {/* The system watches */}
          <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4 font-mono text-[10px] tracking-[0.1em] text-neutral-600">
            <span className="text-red-500/60">&gt;</span>{" "}
            Every decision you made was logged, timestamped, and scored.
            The system doesn&apos;t distinguish between following orders and making choices.
            It only measures compliance.
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/case"
              className="border border-neutral-800 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-300"
            >
              REPLAY
            </Link>
            <Link
              href="/"
              className="border border-red-500/50 bg-red-600/10 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-red-400 transition hover:bg-red-600/20"
            >
              LOG OUT
            </Link>
          </div>

          <p className="mt-6 font-mono text-[9px] tracking-[0.2em] text-neutral-800">
            AEGIS v4.2.1 // CLASSIFICATION: RESTRICTED
          </p>
        </div>
      </div>
    </Shell>
  );
}
