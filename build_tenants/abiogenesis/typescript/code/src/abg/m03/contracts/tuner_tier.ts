// Implements: REQ-R-ABG3-TUNER-001..-012 (T-217 Phase 4) — the tuner's
// deterministic half. The tuner is the OPTIMISATION judgment program:
// it reads replay-derived models only (TUNER-002), writes DECLARATION
// DRAFTS only (TUNER-004), and every write travels draft -> ratify
// (F_H default) or draft -> reject. It never diagnoses (observer/tuner
// separation) and never mutates live surfaces: a ratified draft
// re-enters as ordinary admitted work through its owning ticket.

import type {
  RuntimeEvent,
  TunerDraftAdmittedEvent,
  TunerDraftRatifiedEvent,
  TunerDraftRejectedEvent,
  TunerProposalKind
} from "./carriers.js";
import type { GtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";
import { constructGtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  codepointCompare,
  decisiveByAdmissionOrdinal
} from "./admission_hygiene.js";
import { freezeStringArray } from "./runtime_support.js";

// ── factories (self-certified draftRef) ─────────────────────────────

export function constructTunerDraftAdmittedEvent(input: {
  readonly proposalKind: TunerProposalKind;
  readonly proposer: string;
  readonly telemetryBasisRefs: readonly string[];
  readonly affectedDeclarationRefs: readonly string[];
  readonly beforeDigest: string;
  readonly afterDigest: string;
  readonly equivalenceContractRef?: string | null;
  readonly citedSignalRefs?: readonly string[];
  readonly summary: string;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): TunerDraftAdmittedEvent {
  const equivalenceContractRef = input.equivalenceContractRef ?? null;
  const draftRef = `tuner-draft:${stableSha256Digest({
    proposalKind: input.proposalKind,
    proposer: input.proposer,
    affectedDeclarationRefs: input.affectedDeclarationRefs,
    beforeDigest: input.beforeDigest,
    afterDigest: input.afterDigest,
    equivalenceContractRef,
    summary: input.summary
  })}`;
  return Object.freeze({
    kind: "tuner_draft_admitted",
    draftRef,
    proposalKind: input.proposalKind,
    proposer: input.proposer,
    telemetryBasisRefs: freezeStringArray(input.telemetryBasisRefs),
    affectedDeclarationRefs: freezeStringArray(input.affectedDeclarationRefs),
    beforeDigest: input.beforeDigest,
    afterDigest: input.afterDigest,
    equivalenceContractRef,
    citedSignalRefs: freezeStringArray(input.citedSignalRefs ?? []),
    summary: input.summary,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

export function constructTunerDraftRatifiedEvent(input: {
  readonly draftRef: string;
  readonly ratifiedBy?: string | null;
  readonly ratificationPolicyRef?: string | null;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): TunerDraftRatifiedEvent {
  return Object.freeze({
    kind: "tuner_draft_ratified",
    draftRef: input.draftRef,
    ratifiedBy: input.ratifiedBy ?? null,
    ratificationPolicyRef: input.ratificationPolicyRef ?? null,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

export function constructTunerDraftRejectedEvent(input: {
  readonly draftRef: string;
  readonly rejectedBy: string;
  readonly reason: string;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): TunerDraftRejectedEvent {
  return Object.freeze({
    kind: "tuner_draft_rejected",
    draftRef: input.draftRef,
    rejectedBy: input.rejectedBy,
    reason: input.reason,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

// ── draft state (TUNER-005): replay-derived, decisive by ordinal ────

export type TunerDraftState = "draft" | "ratified" | "rejected";

export interface TunerDraftStateRow {
  readonly draftRef: string;
  readonly state: TunerDraftState;
  readonly proposalKind: TunerProposalKind;
  readonly proposer: string;
  readonly summary: string;
  readonly decidedBy: string | null;
}

export function deriveTunerDraftStates(
  events: readonly RuntimeEvent[]
): readonly TunerDraftStateRow[] {
  const draftsByRef = new Map<string, TunerDraftAdmittedEvent>();
  const decisionsByRef = new Map<string, RuntimeEvent[]>();
  for (const event of events) {
    if (event.kind === "tuner_draft_admitted") {
      draftsByRef.set(event.draftRef, event);
    }
    if (
      event.kind === "tuner_draft_ratified" ||
      event.kind === "tuner_draft_rejected"
    ) {
      const rows = decisionsByRef.get(event.draftRef) ?? [];
      rows.push(event);
      decisionsByRef.set(event.draftRef, rows);
    }
  }
  const rows: TunerDraftStateRow[] = [];
  for (const [draftRef, draft] of draftsByRef) {
    const decision = decisiveByAdmissionOrdinal(
      decisionsByRef.get(draftRef) ?? [],
      `Tuner draft decision (${draftRef})`
    );
    rows.push(
      Object.freeze({
        draftRef,
        state:
          decision === null
            ? "draft"
            : decision.kind === "tuner_draft_ratified"
              ? "ratified"
              : "rejected",
        proposalKind: draft.proposalKind,
        proposer: draft.proposer,
        summary: draft.summary,
        decidedBy:
          decision === null
            ? null
            : decision.kind === "tuner_draft_ratified"
              ? (decision.ratifiedBy ?? decision.ratificationPolicyRef)
              : decision.kind === "tuner_draft_rejected"
                ? decision.rejectedBy
                : null
      })
    );
  }
  return Object.freeze(
    rows.sort((left, right) => codepointCompare(left.draftRef, right.draftRef))
  );
}

// ── mode/track signals (TUNER-010): typed replay-derived observables ─

export interface TunerModeSignalRow {
  readonly signalRef: string;
  readonly signalKind:
    | "route_variance"
    | "retry_density"
    | "rail_break";
  readonly subjectRef: string;
  readonly value: number;
  readonly evidenceRefs: readonly string[];
}

export function deriveTunerModeSignals(
  events: readonly RuntimeEvent[]
): readonly TunerModeSignalRow[] {
  const rows: TunerModeSignalRow[] = [];
  // route variance per graph function: how many distinct entries were
  // selected for one graphFunctionRef (composition entropy's coarse form)
  const selectionsByFunction = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.kind === "graph_function_selected") {
      const key = event.selectedGraphFunctionRef;
      const set = selectionsByFunction.get(key) ?? new Set();
      set.add(event.selectedEntryRef);
      selectionsByFunction.set(key, set);
    }
  }
  for (const [subjectRef, entries] of selectionsByFunction) {
    rows.push(
      Object.freeze({
        signalRef: `tuner-signal:route_variance:${subjectRef}`,
        signalKind: "route_variance" as const,
        subjectRef,
        value: entries.size,
        evidenceRefs: Object.freeze([...entries].sort(codepointCompare))
      })
    );
  }
  // retry density per basis: attempts recorded before the terminal
  const attemptsByBasis = new Map<string, number>();
  for (const event of events) {
    if (event.kind === "actor_invocation_started") {
      attemptsByBasis.set(
        event.basisId,
        (attemptsByBasis.get(event.basisId) ?? 0) + 1
      );
    }
  }
  for (const [subjectRef, attempts] of attemptsByBasis) {
    if (attempts > 1) {
      rows.push(
        Object.freeze({
          signalRef: `tuner-signal:retry_density:${subjectRef}`,
          signalKind: "retry_density" as const,
          subjectRef,
          value: attempts,
          evidenceRefs: Object.freeze([subjectRef])
        })
      );
    }
  }
  // rail-break: a declared path halting on ambiguity projects a
  // mode-selection signal BEFORE same-edge retry burn.
  // NAMED GAP (codex P2, review round 2026-07-10, FPC-021): the reason
  // TEXT is the only ambiguity witness replay carries today — matching
  // it is a DECLARED INTERIM, not signal authority. The Prime source is
  // a typed ambiguity class on the halt carrier (an EVENTS-family
  // rider); this scan retires with it, and consumers treat rail_break
  // as pressure, never as admission authority.
  for (const event of events) {
    if (
      event.kind === "terminal_reached" &&
      event.terminalKind === "gap_stop" &&
      event.reason !== null &&
      /ambiguity|ambiguous/iu.test(event.reason)
    ) {
      rows.push(
        Object.freeze({
          signalRef: `tuner-signal:rail_break:${event.basisId}`,
          signalKind: "rail_break" as const,
          subjectRef: event.basisId,
          value: 1,
          evidenceRefs: Object.freeze([event.reason])
        })
      );
    }
  }
  return Object.freeze(
    rows.sort((left, right) => codepointCompare(left.signalRef, right.signalRef))
  );
}

// ── per-configuration cost rows (TUNER-002 / T-110 economics slot) ──

export interface ConfigurationCostRow {
  readonly configurationRef: string;
  readonly invocationCount: number;
  readonly totalDurationMs: number;
}

export function deriveConfigurationCostRows(
  events: readonly RuntimeEvent[]
): readonly ConfigurationCostRow[] {
  const startedAt = new Map<string, { config: string; timeMs: number }>();
  const totals = new Map<string, { invocations: number; durationMs: number }>();
  for (const event of events) {
    if (event.kind === "actor_invocation_started") {
      const ordinalTime =
        "eventTimeUnixMs" in event && typeof event.eventTimeUnixMs === "number"
          ? event.eventTimeUnixMs
          : null;
      if (ordinalTime !== null) {
        startedAt.set(event.actorInvocationId, {
          config: `${event.workerId}|${event.backendId}`,
          timeMs: ordinalTime
        });
      }
    }
    if (event.kind === "actor_invocation_closed") {
      const started = startedAt.get(event.actorInvocationId);
      // consume the start: a duplicated close event is inert instead of
      // double-counting the same invocation (review finding)
      startedAt.delete(event.actorInvocationId);
      const closedTime =
        "eventTimeUnixMs" in event && typeof event.eventTimeUnixMs === "number"
          ? event.eventTimeUnixMs
          : null;
      if (started !== undefined && closedTime !== null) {
        const row = totals.get(started.config) ?? {
          invocations: 0,
          durationMs: 0
        };
        row.invocations += 1;
        row.durationMs += Math.max(0, closedTime - started.timeMs);
        totals.set(started.config, row);
      }
    }
  }
  return Object.freeze(
    [...totals.entries()]
      .map(([configurationRef, row]) =>
        Object.freeze({
          configurationRef,
          invocationCount: row.invocations,
          totalDurationMs: row.durationMs
        })
      )
      .sort((left, right) =>
        codepointCompare(left.configurationRef, right.configurationRef)
      )
  );
}

// ── post-ratification divergence (TUNER-007) ────────────────────────

export interface TunerDivergenceObligation {
  readonly draftRef: string;
  readonly equivalenceContractRef: string;
  readonly divergenceEvidenceRef: string;
  readonly demotionRequired: true;
  readonly intakeRequired: true;
}

// Divergence DETECTION is live-run work; this derivation is the LAW it
// feeds: a ratified annealing draft whose equivalence contract has a
// divergence row owes demotion back to the F_P generic AND an intake —
// through the observer's seat, never inside this judgment.
export function deriveTunerDivergenceObligations(input: {
  readonly events: readonly RuntimeEvent[];
  readonly divergenceRows: readonly {
    readonly equivalenceContractRef: string;
    readonly evidenceRef: string;
  }[];
}): readonly TunerDivergenceObligation[] {
  const ratifiedAnnealings = deriveTunerDraftStates(input.events).filter(
    (row) => row.state === "ratified" && row.proposalKind === "annealing"
  );
  const draftsByContract = new Map<string, string>();
  for (const event of input.events) {
    if (
      event.kind === "tuner_draft_admitted" &&
      event.proposalKind === "annealing" &&
      event.equivalenceContractRef !== null &&
      ratifiedAnnealings.some((row) => row.draftRef === event.draftRef)
    ) {
      draftsByContract.set(event.equivalenceContractRef, event.draftRef);
    }
  }
  const obligations: TunerDivergenceObligation[] = [];
  for (const divergence of input.divergenceRows) {
    const draftRef = draftsByContract.get(divergence.equivalenceContractRef);
    if (draftRef !== undefined) {
      obligations.push(
        Object.freeze({
          draftRef,
          equivalenceContractRef: divergence.equivalenceContractRef,
          divergenceEvidenceRef: divergence.evidenceRef,
          demotionRequired: true as const,
          intakeRequired: true as const
        })
      );
    }
  }
  return Object.freeze(
    obligations.sort((left, right) =>
      codepointCompare(left.draftRef, right.draftRef)
    )
  );
}

// ── the declared tuner module (TUNER-001, catalog citizen) ──────────

export const ABG_TUNER_MODULE_DECLARATIONS: readonly GtlLibraryEntryDeclaration[] =
  Object.freeze([
    constructGtlLibraryEntryDeclaration({
      declarationRef: "gtl-declaration://abg/tuner/default-loop",
      entryRef: "gtl://abg/tuner/default-loop",
      libraryScope: "system",
      entryKind: "graph_function",
      namespace: "abg.tuner",
      ownerRef: "owner://abg/substrate",
      version: "4.6.0-dev",
      graphFunctionRef: "graph-function://abg/tuner/default-loop",
      interfaceRef: "interface://abg/tuner/report-propose-ratify",
      sourceContractRef: "contract://abg/tuner/telemetry-read-models",
      targetContractRef: "contract://abg/tuner/declaration-drafts",
      contextRefs: ["context://abg/tuner/cost-read-models"],
      authorityRefs: ["authority://abg/tuner/draft-only-write-boundary"],
      overlayRefs: [],
      provenanceRefs: ["provenance://abg/T-206-tuner"],
      readinessRefs: [],
      proofRefs: ["proof://abg/tuner/deterministic-verb-differentials"],
      policyRefs: [
        "policy://abg/tuner/fh-ratification-default",
        "policy://abg/tuner/solve-optimize-separation"
      ],
      declarationSourceRefs: ["gtl://module/abg/tuner"]
    })
  ]);
