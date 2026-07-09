// Implements: REQ-R-ABG3-FPC-018/-019 (T-217 Phase 3) — the OBSERVER
// TIER: the construction episode law pointed at the system's own
// telemetry. This module owns the deterministic half of that episode:
//
//   1. the OBSERVER OBSERVABLE SET (FPC-018): one typed assembly over
//      the Phase 1 sense organs — halt diagnosis, citability, frozen
//      law, hygiene, segments, attestation verification, reprice and
//      basis-fork obligations (the constitutional-versus-projected
//      drift facts), plus the declared cost-row slot Phase 4 populates;
//   2. OBSERVATION PRESSURE derivation: observables pressed into
//      FPC-003 pressure rows with severity and evidence refs;
//   3. the NON-CONSTRUCTIVE catalog law (FPC-019): the observer's
//      action rows are typed block, F_H input, ticket/reprice proposal,
//      escalation, and drill (view restriction through the session
//      allowlist) — never constructive, never optimisation terms
//      (observer and tuner are separate judgment programs);
//   4. TRIAGED TICKET DRAFTS (FPC-007's non-constructive outcome): the
//      MECHANICAL triage rules — signature classes whose (owner,
//      change_class, re-entry) derive deterministically from typed
//      replay facts. Signatures needing semantic judgment (the T-032
//      campaign's contract-contradiction/shape-family classes) route to
//      the F_P seat as fh_input drafts rather than guessing: diagnosis
//      the kernel cannot prove is a question, not a classification.
//
// Ratification: drafts are READ-MODEL proposals (derived, replay-
// visible, never events). The ratifying act is the operator grammar's
// intake verb — an actor-attributed admitted event (WITNESS-011); a
// draft that was never ratified simply never becomes an intake.

import type {
  GraphChangeClass,
  GraphReentryPoint,
  RuntimeEvent
} from "./carriers.js";
import {
  deriveHaltDiagnosis,
  type HaltDiagnosisProjection
} from "./halt_diagnosis.js";
import {
  deriveCitabilityPredicate,
  deriveWorkspaceHygienePredicate,
  type CitabilityPredicate,
  type WorkspaceHygienePredicate
} from "./workspace_hygiene.js";
import {
  deriveFrozenLawPredicate,
  mintExecutionBasisSpineRef,
  type FrozenLawPredicate
} from "./declaration_reprice.js";
import { deriveRunSegments } from "./run_segments.js";
import { verifyReplayLogAttestations } from "./replay_attestation.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import { codepointCompare } from "./admission_hygiene.js";

// ── 1. the observer observable set (FPC-018) ────────────────────────

export interface ObserverObservables {
  readonly kind: "observer_observables";
  readonly haltDiagnosis: HaltDiagnosisProjection;
  readonly citability: CitabilityPredicate;
  readonly frozenLaw: FrozenLawPredicate;
  readonly hygiene: WorkspaceHygienePredicate;
  readonly segmentCount: number;
  readonly attestationCount: number;
  readonly attestationsVerified: boolean;
  // constitutional-versus-projected drift facts
  readonly repriceObligationRefs: readonly string[];
  readonly basisForkObligationRefs: readonly string[];
  readonly schemaRejections: readonly {
    readonly payloadRef: string;
    readonly schemaRef: string | null;
    readonly issueKinds: readonly string[];
  }[];
  // Phase 4 populates: per-configuration cost rows (declared slot)
  readonly costRowRefs: readonly string[];
}

// Single-log drift facts. The RESUME-TIME guards consume (prior,
// startup) splits; the observer reads ONE persisted record after the
// fact, so drift derives from the record itself: a declarationRef
// admitted under more than one digest, or one spine admitted under more
// than one basis id, without a covering reprice ref. (Exact-pair digest
// coverage stays the ADMISSION routes' law; the observer's pressure is
// ref-level by design — it drafts, it does not adjudicate.)
function observedDeclarationDriftRefs(
  events: readonly RuntimeEvent[]
): readonly string[] {
  const digestsByRef = new Map<string, Set<string>>();
  const repricePairsByRef = new Map<
    string,
    { readonly beforeDigest: string; readonly afterDigest: string }[]
  >();
  const coveredRefs = new Set<string>();
  const driftRefs = new Set<string>();
  for (const event of events) {
    if (event.kind === "registry_entry_admitted") {
      const digests = digestsByRef.get(event.declarationRef) ?? new Set();
      digests.add(event.declarationDigest);
      digestsByRef.set(event.declarationRef, digests);
    }
    if (event.kind === "declaration_reprice_admitted") {
      // codex P2 (review round 2026-07-10): coverage follows the S1
      // exact-pair law where digests are observable. Reason-channel
      // drifts (the guard blocked before admitting the second digest)
      // retire at ref level — their pairs are not in the record.
      coveredRefs.add(event.declarationRef);
      const pairs = repricePairsByRef.get(event.declarationRef) ?? [];
      pairs.push({
        beforeDigest: event.beforeDigest,
        afterDigest: event.afterDigest
      });
      repricePairsByRef.set(event.declarationRef, pairs);
    }
    // the S1 guard BLOCKS drifted resumes before admitting the drifted
    // entry, so the drift's replay witness is the typed halt reason —
    // the second channel alongside two-digest admission records. The
    // guard COMMA-JOINS multiple drifted refs into one reason; each is
    // its own drift fact (review finding: one draft per declaration,
    // never one draft over a joined string).
    if (event.kind === "terminal_reached" && event.reason !== null) {
      const match = /^declaration_reprice_required:\s*(.+)$/u.exec(
        event.reason
      );
      if (match?.[1] !== undefined) {
        for (const ref of match[1].split(",")) {
          if (ref.trim().length > 0) {
            driftRefs.add(ref.trim());
          }
        }
      }
    }
  }
  const pairCovered = (ref: string, digests: ReadonlySet<string>): boolean =>
    (repricePairsByRef.get(ref) ?? []).some(
      (pair) =>
        digests.has(pair.beforeDigest) && digests.has(pair.afterDigest)
    );
  const uncovered = new Set<string>();
  for (const [ref, digests] of digestsByRef) {
    // two-digest drifts demand PAIR coverage: a reprice on the ref that
    // does not name the observed digest pair leaves the drift standing
    if (digests.size > 1 && !pairCovered(ref, digests)) {
      uncovered.add(ref);
    }
  }
  for (const ref of driftRefs) {
    if (!digestsByRef.has(ref) || (digestsByRef.get(ref)?.size ?? 0) <= 1) {
      // reason-channel drift: digests unobservable, ref-level retirement
      if (!coveredRefs.has(ref)) {
        uncovered.add(ref);
      }
    }
  }
  return Object.freeze([...uncovered].sort(codepointCompare));
}

function observedBasisForkSpineRefs(
  events: readonly RuntimeEvent[]
): readonly string[] {
  const basisIdsBySpine = new Map<string, Set<string>>();
  const coveredRefs = new Set<string>();
  for (const event of events) {
    if (event.kind === "basis_admitted") {
      const spineRef = mintExecutionBasisSpineRef({
        graphFunctionId: event.graphFunctionId,
        jobId: event.jobId,
        runId: event.runId,
        workKey: event.workKey
      });
      const ids = basisIdsBySpine.get(spineRef) ?? new Set();
      ids.add(event.basisId);
      basisIdsBySpine.set(spineRef, ids);
    }
    if (event.kind === "declaration_reprice_admitted") {
      coveredRefs.add(event.declarationRef);
    }
  }
  return Object.freeze(
    [...basisIdsBySpine.entries()]
      .filter(([spineRef, ids]) => ids.size > 1 && !coveredRefs.has(spineRef))
      .map(([spineRef]) => spineRef)
      .sort(codepointCompare)
  );
}

export function deriveObserverObservables(
  events: readonly RuntimeEvent[]
): ObserverObservables {
  const attestationRows = verifyReplayLogAttestations(events);
  const schemaRejections = events.flatMap((event) =>
    event.kind === "payload_rejected" &&
    event.rejectionClass === "schema_invalid"
      ? [
          Object.freeze({
            payloadRef: event.payloadRef,
            schemaRef: event.schemaRef,
            issueKinds: Object.freeze(
              [
                ...new Set(
                  (event.issues ?? []).map((issue) => issue.issueKind)
                )
              ].sort(codepointCompare)
            )
          })
        ]
      : []
  );
  return Object.freeze({
    kind: "observer_observables",
    haltDiagnosis: deriveHaltDiagnosis(events),
    citability: deriveCitabilityPredicate(events),
    frozenLaw: deriveFrozenLawPredicate(events),
    hygiene: deriveWorkspaceHygienePredicate(events),
    segmentCount: deriveRunSegments(events).length,
    attestationCount: attestationRows.length,
    attestationsVerified: attestationRows.every((row) => row.verified),
    repriceObligationRefs: observedDeclarationDriftRefs(events),
    basisForkObligationRefs: observedBasisForkSpineRefs(events),
    schemaRejections: Object.freeze(schemaRejections),
    costRowRefs: Object.freeze([])
  });
}

// ── 3. the non-constructive catalog (FPC-019) ───────────────────────

export const OBSERVER_ACTION_KIND_VALUES = Object.freeze([
  "typed_block",
  "fh_input",
  "ticket_draft",
  "reprice_proposal",
  "escalation",
  "drill_view_restriction"
] as const);

export type ObserverActionKind = (typeof OBSERVER_ACTION_KIND_VALUES)[number];

export interface ObserverActionCatalogRow {
  readonly actionRef: string;
  readonly actionKind: ObserverActionKind;
  readonly description: string;
}

export const OBSERVER_ACTION_CATALOG: readonly ObserverActionCatalogRow[] =
  Object.freeze([
    Object.freeze({
      actionRef: "observer-action://abg/typed-block",
      actionKind: "typed_block" as const,
      description: "project a typed block naming the failing conjuncts"
    }),
    Object.freeze({
      actionRef: "observer-action://abg/fh-input",
      actionKind: "fh_input" as const,
      description:
        "route a diagnosis question to the human F_H seat with evidence refs"
    }),
    Object.freeze({
      actionRef: "observer-action://abg/ticket-draft",
      actionKind: "ticket_draft" as const,
      description:
        "propose a triaged ticket draft (owner, change class, re-entry)"
    }),
    Object.freeze({
      actionRef: "observer-action://abg/reprice-proposal",
      actionKind: "reprice_proposal" as const,
      description:
        "propose a declaration reprice covering observed substrate drift"
    }),
    Object.freeze({
      actionRef: "observer-action://abg/escalation",
      actionKind: "escalation" as const,
      description: "escalate past the current frame to the operator"
    }),
    Object.freeze({
      actionRef: "observer-action://abg/drill",
      actionKind: "drill_view_restriction" as const,
      description:
        "narrow the session view to a scope through the declared allowlist (WITNESS-015)"
    })
  ]);

// FPC-019 separation law: the observer's catalog holds NO constructive
// actions and NO optimisation terms — diagnosis and policy rewrite never
// share one judgment. Enforced over any catalog claiming observer scope.
const OBSERVER_FORBIDDEN_TERM_PATTERN =
  /(anneal|calibrat|optimi[sz]|tune|crystalliz)/iu;

export function assertObserverCatalogNonConstructive(
  rows: readonly { readonly actionKind: string; readonly description: string }[]
): void {
  for (const row of rows) {
    if (
      !(OBSERVER_ACTION_KIND_VALUES as readonly string[]).includes(
        row.actionKind
      )
    ) {
      throw new TypeError(
        `Observer catalog rejects constructive/unknown action kind ${JSON.stringify(row.actionKind)}`
      );
    }
    if (OBSERVER_FORBIDDEN_TERM_PATTERN.test(row.description)) {
      throw new TypeError(
        "Observer catalog rejects optimisation terms: observer and tuner are separate judgment programs (FPC-019)"
      );
    }
  }
}

// ── 4. triaged ticket drafts (FPC-007) ──────────────────────────────

export interface ObserverTicketDraft {
  readonly kind: "observer_ticket_draft";
  readonly draftRef: string;
  readonly actionKind: Extract<
    ObserverActionKind,
    "ticket_draft" | "reprice_proposal" | "fh_input"
  >;
  readonly owner: string;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly summary: string;
  readonly triageReason: string;
  readonly evidenceRefs: readonly string[];
}

function draft(input: {
  readonly actionKind: ObserverTicketDraft["actionKind"];
  readonly owner: string;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly summary: string;
  readonly triageReason: string;
  readonly evidenceRefs: readonly string[];
}): ObserverTicketDraft {
  return Object.freeze({
    kind: "observer_ticket_draft",
    draftRef: `observer-draft:${stableSha256Digest({
      actionKind: input.actionKind,
      owner: input.owner,
      changeClass: input.changeClass,
      reEntryPoint: input.reEntryPoint,
      summary: input.summary
    })}`,
    actionKind: input.actionKind,
    owner: input.owner,
    changeClass: input.changeClass,
    reEntryPoint: input.reEntryPoint,
    summary: input.summary,
    triageReason: input.triageReason,
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  });
}

// The MECHANICAL triage rules. Each rule maps a typed replay signature
// to (owner, change_class, re-entry) — the intake-triage upward walk
// encoded for the signature classes the kernel can PROVE. Anything
// needing semantic judgment routes to the F_P/F_H seat as fh_input.
export function deriveObserverTicketDrafts(
  observables: ObserverObservables
): readonly ObserverTicketDraft[] {
  const drafts: ObserverTicketDraft[] = [];

  // substrate drift without a covering reprice: constitutional truth
  // changed while direction stayed stable => requirement_reprice at the
  // requirements layer, owned by the declaration surface + its ticket
  for (const declarationRef of observables.repriceObligationRefs) {
    drafts.push(
      draft({
        actionKind: "reprice_proposal",
        owner: "specification/requirements + owning ticket",
        changeClass: "requirement_reprice",
        reEntryPoint: "requirements",
        summary: `declaration ${declarationRef} drifted without a covering reprice`,
        triageReason:
          "upward walk: admitted declaration content diverged from replayed truth; first missing layer is the ratified requirement covering the change",
        evidenceRefs: [declarationRef]
      })
    );
  }

  // basis fork: policy/binding identity changed mid-spine without
  // ratification => the realization STRUCTURE changed => design_reframe
  for (const spineRef of observables.basisForkObligationRefs) {
    drafts.push(
      draft({
        actionKind: "ticket_draft",
        owner: "design surface + owning ticket",
        changeClass: "design_reframe",
        reEntryPoint: "design_surface",
        summary: `execution spine ${spineRef} forked (policy/binding identity changed mid-run) without a covering reprice`,
        triageReason:
          "upward walk: requirements stable; the resolved policy/binding structure changed => design_reframe at the basis seam",
        evidenceRefs: [spineRef]
      })
    );
  }

  // schema-invalid worker payloads: the T-213 defect class — the worker
  // boundary's shape law failed => design_reframe at the design surface
  for (const rejection of observables.schemaRejections) {
    drafts.push(
      draft({
        actionKind: "ticket_draft",
        owner: "worker-boundary schema declarations",
        changeClass: "design_reframe",
        reEntryPoint: "design_surface",
        summary: `worker payload ${rejection.payloadRef} rejected against ${rejection.schemaRef ?? "its declared schema"} (${rejection.issueKinds.join(", ")})`,
        triageReason:
          "typed artifact schema violation: the declared shape and the worker's output disagree — reframe the boundary contract, never patch the reader (T-213 law)",
        evidenceRefs: [rejection.payloadRef]
      })
    );
  }

  // foreign-written evidence: inadmissible for closure until re-measured
  // — an operator-workspace act, not a substrate change: the lawful
  // remediation is re-measurement (and a reprice only if the change was
  // intended), so the draft is a realization-layer hygiene ticket
  for (const artifactRef of observables.hygiene.taintedArtifactRefs) {
    drafts.push(
      draft({
        actionKind: "ticket_draft",
        owner: "workspace hygiene + re-measurement instrument",
        changeClass: "realization_refactor",
        reEntryPoint: "realization",
        summary: `evidence surface ${artifactRef} is foreign-written or missing; closure is blocked until re-measured clean`,
        triageReason:
          "hygiene taint is worksite truth, not constitutional drift: re-measure (kernel instrument), and only an intended content change escalates to a reprice",
        evidenceRefs: [artifactRef]
      })
    );
  }

  // attestation verification failure: the record itself is suspect —
  // that is never mechanically classifiable; route to the human seat
  if (observables.attestationCount > 0 && !observables.attestationsVerified) {
    drafts.push(
      draft({
        actionKind: "fh_input",
        owner: "F_H seat",
        changeClass: null,
        reEntryPoint: null,
        summary:
          "replay-log attestation verification FAILED: the record between attestations does not reproduce its chained digest",
        triageReason:
          "tamper-evidence fired; determining what happened requires judgment over the preserved record — the kernel proves divergence, never intent",
        evidenceRefs: []
      })
    );
  }

  // a halt whose reason class carries no mechanical rule: a QUESTION for
  // the seat, not a guess — the observer never classifies what it
  // cannot prove (FPC-021: no authority from narrative). The question
  // fires when the HALT ITSELF is unaddressed — an unrelated taint or
  // fork draft must not silence it (review finding).
  const haltReason = observables.haltDiagnosis.haltReason ?? "";
  const haltAddressed =
    (/^declaration_reprice_required:/u.test(haltReason) &&
      observables.repriceObligationRefs.length > 0) ||
    (/basis_fork_detected/u.test(haltReason) &&
      observables.basisForkObligationRefs.length > 0) ||
    (/schema/iu.test(haltReason) && observables.schemaRejections.length > 0);
  if (observables.haltDiagnosis.halted && !haltAddressed) {
    drafts.push(
      draft({
        actionKind: "fh_input",
        owner: "F_H seat",
        changeClass: null,
        reEntryPoint: null,
        summary: `run halted (${observables.haltDiagnosis.haltReason ?? "no reason recorded"}) with no mechanically-classifiable drift signature`,
        triageReason:
          "the halt's observable signature matches no mechanical triage rule; classification requires the episode's F_P judgment under the F_H seat",
        evidenceRefs: [observables.haltDiagnosis.diagnosisRef]
      })
    );
  }

  // one draft per distinct proposal: repeated rejections of the same
  // payload re-derive the same content-derived draftRef (review finding)
  const deduped = new Map<string, ObserverTicketDraft>();
  for (const row of drafts) {
    deduped.set(row.draftRef, row);
  }
  return Object.freeze(
    [...deduped.values()].sort((left, right) =>
      codepointCompare(left.draftRef, right.draftRef)
    )
  );
}
