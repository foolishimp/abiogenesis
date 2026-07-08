// T-188 carry-through PRODUCER: derives the admitted events for one
// accepted attached-result site. Extracted from the engine runner (DMM
// self-review F3) — the runner sequences and emits; derivation lives here.
// LAW (T-188): admission runs ONLY after the attached result payload is
// itself admitted (the runner calls this inside the accepted branch — a
// rejected payload must not mint coverage truth); strength refs resolve
// against the ADMITTED ledger, never list presence or startup booleans;
// coverage refs are producer-computed and carried on the event (no
// close-site reconstruction).
import type { ActorInvocation, RuntimeEvent } from "./carriers.js";
import type {
  RequirementProofCarryThroughAdmittedEvent
} from "./carriers.js";
import {
  admitRequirementProofCarryThroughOutput,
  constructRequirementProofCandidateClassificationTable,
  constructRequirementProofCarryThroughContract,
  constructRequirementProofCarryThroughOutputEnvelope,
  projectRequirementProofCoverage,
  requirementAbgTruthRefFromRequirementProofCoverage,
  type RequirementProofCandidateClassificationTable,
  type RequirementProofCarryThroughContract
} from "./requirement_proof_carry_through.js";
import {
  constructDerivedProofDepthInstructionTruth,
  type DerivedDependencyInstructionTruth,
  type DerivedProofDepthInstructionTruth
} from "./instruction_assembly.js";
import { constructRequirementProofCarryThroughAdmittedEvent } from "./event_factories.js";
import { deriveAdmittedStrengthRefSet } from "./payload_ledger.js";
import {
  deriveEarnedDepthTruthForRequirements,
  deriveKillObligations,
  deriveUnprovenKillObligationGapRefs
} from "./depth_proof_map.js";

export interface RequirementProofCarryThroughStartupEntry {
  readonly contract: RequirementProofCarryThroughContract;
  readonly classificationTable: RequirementProofCandidateClassificationTable;
  readonly requirementIds: readonly string[];
  readonly envelopeTemplate: Omit<
    Parameters<typeof constructRequirementProofCarryThroughOutputEnvelope>[0],
    "envelopeRef" | "evidenceRefs" | "replayIdentity" | "replayDigest"
  >;
  readonly edge?: string | undefined;
}

export interface RequirementProofCarryThroughStartupInput {
  readonly entries: readonly RequirementProofCarryThroughStartupEntry[];
}

// STARTUP ADMISSION (T-205 carry-through applicability; F_D totality law):
// the startup family is OPEN ingress. This admission is the ONE total
// function over that open domain — it collapses raw entries into the
// ADMITTED carrier at engine entry, fail-closed with entry-indexed
// diagnostics (the admitHandlerRegistry/temporal-startup precedent).
// Depth law (review probe 2026-07-08): a kind-tag check is NOT admission —
// the deep validators are the EXISTING carrier constructors, re-run here so
// the admitted entries carry RECONSTRUCTED contract and classification-table
// carriers and a probe-validated envelope template. Consumers accept only
// `AdmittedRequirementProofCarryThroughStartup`; they are total over it and
// must not re-validate or grow guards against raw shapes.
export interface AdmittedRequirementProofCarryThroughStartup {
  readonly kind: "admitted_requirement_proof_carry_through_startup";
  readonly entries: readonly RequirementProofCarryThroughStartupEntry[];
}

// Rejection facts are a CLOSED typed vocabulary (the temporal-startup
// precedent), never pattern-matched prose. `message` is diagnostic only.
export type RequirementProofCarryThroughStartupAdmissionIssueKind =
  | "startup_not_object"
  | "entries_not_array"
  | "entry_not_object"
  | "contract_inadmissible"
  | "classification_table_inadmissible"
  | "envelope_template_inadmissible"
  | "requirement_ids_invalid"
  | "edge_invalid";

export interface RequirementProofCarryThroughStartupAdmissionIssue {
  readonly issueKind: RequirementProofCarryThroughStartupAdmissionIssueKind;
  readonly at: string;
  readonly message: string;
}

const CARRY_THROUGH_ADMISSION_PROBE_REF =
  "admission-probe://requirement-proof-carry-through";

// lone surrogates pass length checks but throw URIError in
// encodeURIComponent at ref minting — reject them at the one ingress
const LONE_SURROGATE = /\p{Surrogate}/u;

function admissionIssueMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function admitRequirementProofCarryThroughStartup(
  input: RequirementProofCarryThroughStartupInput | undefined
): {
  readonly accepted: boolean;
  readonly issues: readonly RequirementProofCarryThroughStartupAdmissionIssue[];
  readonly admitted: AdmittedRequirementProofCarryThroughStartup | undefined;
} {
  if (input === undefined) {
    return Object.freeze({
      accepted: true,
      issues: Object.freeze([]),
      admitted: undefined
    });
  }
  const issues: RequirementProofCarryThroughStartupAdmissionIssue[] = [];
  const reject = (
    issueKind: RequirementProofCarryThroughStartupAdmissionIssueKind,
    at: string,
    message: string
  ): void => {
    issues.push(Object.freeze({ issueKind, at, message }));
  };
  const rejected = () =>
    Object.freeze({
      accepted: false,
      issues: Object.freeze([...issues]),
      admitted: undefined
    });
  const wellFormedNonEmpty = (value: unknown): value is string =>
    typeof value === "string" && value.length > 0 && !LONE_SURROGATE.test(value);
  if (input === null || typeof input !== "object") {
    reject("startup_not_object", "startup", "startup must be an object with an entries array");
    return rejected();
  }
  if (!Array.isArray(input.entries)) {
    reject("entries_not_array", "startup.entries", "entries must be an array");
    return rejected();
  }
  const admittedEntries: RequirementProofCarryThroughStartupEntry[] = [];
  for (const [index, entry] of input.entries.entries()) {
    const at = `entries[${index}]`;
    if (entry === null || typeof entry !== "object") {
      reject("entry_not_object", at, "must be a startup entry object");
      continue;
    }
    let contract: RequirementProofCarryThroughContract | null = null;
    if (entry.contract === null || typeof entry.contract !== "object") {
      reject("contract_inadmissible", `${at}.contract`, "must be a requirement proof carry-through contract");
    } else {
      try {
        contract = constructRequirementProofCarryThroughContract(entry.contract);
      } catch (error) {
        reject("contract_inadmissible", `${at}.contract`, admissionIssueMessage(error));
      }
    }
    let classificationTable: RequirementProofCandidateClassificationTable | null = null;
    if (entry.classificationTable === null || typeof entry.classificationTable !== "object") {
      reject("classification_table_inadmissible", `${at}.classificationTable`, "must be a candidate classification table");
    } else {
      try {
        classificationTable = constructRequirementProofCandidateClassificationTable(
          entry.classificationTable
        );
      } catch (error) {
        reject("classification_table_inadmissible", `${at}.classificationTable`, admissionIssueMessage(error));
      }
    }
    let admittedTemplate: RequirementProofCarryThroughStartupEntry["envelopeTemplate"] | null = null;
    if (entry.envelopeTemplate === null || typeof entry.envelopeTemplate !== "object") {
      reject("envelope_template_inadmissible", `${at}.envelopeTemplate`, "must be an envelope template object");
    } else {
      // probe construction proves the template can never throw at
      // production time (real refs are engine-derived non-empty strings) —
      // and the ADMITTED template is derived FROM the probe result, so the
      // admitted carrier is constructor-frozen and canonical throughout;
      // a caller mutating the raw template's arrays after admission cannot
      // reach it (self-review F1, 2026-07-08).
      try {
        const probe = constructRequirementProofCarryThroughOutputEnvelope({
          ...entry.envelopeTemplate,
          envelopeRef: CARRY_THROUGH_ADMISSION_PROBE_REF,
          evidenceRefs: Object.freeze([CARRY_THROUGH_ADMISSION_PROBE_REF]),
          replayIdentity: CARRY_THROUGH_ADMISSION_PROBE_REF
        });
        const {
          kind: _kind,
          envelopeRef: _envelopeRef,
          evidenceRefs: _evidenceRefs,
          replayIdentity: _replayIdentity,
          replayDigest: _replayDigest,
          ...canonicalTemplate
        } = probe;
        admittedTemplate = Object.freeze(canonicalTemplate);
      } catch (error) {
        reject("envelope_template_inadmissible", `${at}.envelopeTemplate`, admissionIssueMessage(error));
      }
    }
    const requirementIdsValid =
      Array.isArray(entry.requirementIds) &&
      entry.requirementIds.length > 0 &&
      entry.requirementIds.every((requirementId: unknown) => wellFormedNonEmpty(requirementId));
    if (!requirementIdsValid) {
      reject(
        "requirement_ids_invalid",
        `${at}.requirementIds`,
        "must be a non-empty array of non-empty well-formed strings"
      );
    }
    const edgeValid = entry.edge === undefined || wellFormedNonEmpty(entry.edge);
    if (!edgeValid) {
      reject("edge_invalid", `${at}.edge`, "must be undefined or a non-empty well-formed string");
    }
    if (
      contract !== null &&
      classificationTable !== null &&
      admittedTemplate !== null &&
      requirementIdsValid &&
      edgeValid
    ) {
      admittedEntries.push(
        Object.freeze({
          contract,
          classificationTable,
          requirementIds: Object.freeze([...entry.requirementIds]),
          envelopeTemplate: admittedTemplate,
          edge: entry.edge
        })
      );
    }
  }
  if (issues.length > 0) {
    return rejected();
  }
  return Object.freeze({
    accepted: true,
    issues: Object.freeze([]),
    admitted: Object.freeze({
      kind: "admitted_requirement_proof_carry_through_startup" as const,
      entries: Object.freeze(admittedEntries)
    })
  });
}

// STARTUP-ENTRY SCOPE LAW (T-205 carry-through applicability): the two
// dimensions of an entry answer different questions and must not be
// conflated —
//   entry.edge          scopes PRODUCTION: on which edge's accepted attached
//                       result the producer emits coverage truth;
//   entry.requirementIds scope OBLIGATION: which requirements OWE coverage
//                       wherever their pressure is active (carry-through
//                       pressure crosses edges by design).
// Both consumers (producer emission, edge-close expectedness) derive from
// these two functions; a second sibling filter is drift.
function carryThroughEntryProducesOnEdge(
  entry: RequirementProofCarryThroughStartupEntry,
  edge: string
): boolean {
  return entry.edge === undefined || entry.edge === edge;
}

// The ONE derivation home for "which obligationRefs does an entry's
// contract owe" — consumed by both the producer emission path and the
// cross-entry owedness merge below. A second sibling extraction is drift.
function owedObligationRefsForEntry(
  entry: RequirementProofCarryThroughStartupEntry
): readonly string[] {
  return Object.freeze(
    [...new Set(
      entry.contract.fulfillmentBindings.map((binding) => binding.obligationRef)
    )].sort()
  );
}

function carryThroughOwedObligationRefsByRequirementId(
  startup: AdmittedRequirementProofCarryThroughStartup | undefined
): ReadonlyMap<string, readonly string[]> {
  const owed = new Map<string, Set<string>>();
  if (startup === undefined) {
    return new Map<string, readonly string[]>();
  }
  for (const entry of startup.entries) {
    const entryRefs = owedObligationRefsForEntry(entry);
    for (const requirementId of entry.requirementIds) {
      const refs = owed.get(requirementId) ?? new Set<string>();
      for (const obligationRef of entryRefs) {
        refs.add(obligationRef);
      }
      owed.set(requirementId, refs);
    }
  }
  const frozen = new Map<string, readonly string[]>();
  for (const [requirementId, refs] of owed) {
    frozen.set(requirementId, Object.freeze([...refs].sort()));
  }
  return frozen;
}

// -007 REQUIREMENT PRESSURE (T-030 reopen): the ENGINE-derived refs that
// instruction assembly delivers to the F_P worker for a requirement-
// bearing vector. One derivation home; the runner binds these as
// requirement_pressure runtime facts, the manifest carries them as
// requirementPressureRefs, and replay reconstructs them from the same
// inputs. Sources: admitted route facts in replay (terms, spans with
// vectorIndexes, obligation projections — ABG-emitted, shapes known) plus
// the ADMITTED carry-through startup (owed obligation refs + declared
// proof obligation refs). Products supply declarations only; ABG derives,
// binds, emits, and replays the pressure.
interface RequirementRoutePayloadShapes {
  readonly kind?: unknown;
  readonly term?: { readonly requirementId?: unknown; readonly spanRefs?: unknown };
  readonly span?: { readonly spanId?: unknown; readonly vectorIndexes?: unknown };
  readonly projection?: {
    readonly requirementId?: unknown;
    readonly spanId?: unknown;
    readonly projectionRef?: unknown;
    readonly sourceRefs?: unknown;
  };
}

function routePayloadOf(event: RuntimeEvent): RequirementRoutePayloadShapes | null {
  if (event.kind !== "requirement_route_fact_projected") {
    return null;
  }
  const payload = (event as { readonly requirementPayload?: unknown }).requirementPayload;
  return payload !== null && typeof payload === "object"
    ? (payload as RequirementRoutePayloadShapes)
    : null;
}

function stringsOf(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function deriveRequirementPressureRefsForVector(input: {
  readonly replayEvents: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly startup: AdmittedRequirementProofCarryThroughStartup | undefined;
}): ReadonlyMap<string, readonly string[]> {
  const spannedVectorsBySpanId = new Map<string, readonly number[]>();
  const spanIdsByRequirementId = new Map<string, Set<string>>();
  const refsByRequirementId = new Map<string, Set<string>>();
  const note = (requirementId: string, spanId: string | null, refs: readonly string[]): void => {
    const spanIds = spanIdsByRequirementId.get(requirementId) ?? new Set<string>();
    if (spanId !== null) {
      spanIds.add(spanId);
    }
    spanIdsByRequirementId.set(requirementId, spanIds);
    const bucket = refsByRequirementId.get(requirementId) ?? new Set<string>();
    for (const ref of refs) {
      bucket.add(ref);
    }
    refsByRequirementId.set(requirementId, bucket);
  };
  for (const event of input.replayEvents) {
    const payload = routePayloadOf(event);
    if (payload === null) {
      continue;
    }
    if (payload.kind === "traversal_span_admitted" && typeof payload.span?.spanId === "string") {
      spannedVectorsBySpanId.set(
        payload.span.spanId,
        Array.isArray(payload.span.vectorIndexes)
          ? payload.span.vectorIndexes.filter((row): row is number => Number.isInteger(row))
          : []
      );
    } else if (
      payload.kind === "requirement_term_admitted" &&
      typeof payload.term?.requirementId === "string"
    ) {
      for (const spanRef of stringsOf(payload.term.spanRefs)) {
        note(payload.term.requirementId, spanRef, [payload.term.requirementId]);
      }
    } else if (
      payload.kind === "requirement_projection_admitted" &&
      typeof payload.projection?.requirementId === "string"
    ) {
      note(
        payload.projection.requirementId,
        typeof payload.projection.spanId === "string" ? payload.projection.spanId : null,
        [
          payload.projection.requirementId,
          ...(typeof payload.projection.projectionRef === "string"
            ? [payload.projection.projectionRef]
            : []),
          ...stringsOf(payload.projection.sourceRefs)
        ]
      );
    }
  }
  const owedRefs = carryThroughOwedObligationRefsByRequirementId(input.startup);
  const proofRefsByRequirementId = new Map<string, Set<string>>();
  for (const entry of input.startup?.entries ?? []) {
    for (const requirementId of entry.requirementIds) {
      const bucket = proofRefsByRequirementId.get(requirementId) ?? new Set<string>();
      for (const ref of stringsOf(entry.envelopeTemplate.proofObligationRefs)) {
        bucket.add(ref);
      }
      proofRefsByRequirementId.set(requirementId, bucket);
    }
  }
  const output = new Map<string, readonly string[]>();
  for (const [requirementId, spanIds] of spanIdsByRequirementId) {
    const covers = [...spanIds].some((spanId) =>
      (spannedVectorsBySpanId.get(spanId) ?? []).includes(input.vectorIndex)
    );
    if (!covers) {
      continue;
    }
    output.set(
      requirementId,
      Object.freeze(
        [...new Set([
          ...(refsByRequirementId.get(requirementId) ?? []),
          ...(owedRefs.get(requirementId) ?? []),
          ...(proofRefsByRequirementId.get(requirementId) ?? [])
        ])].sort()
      )
    );
  }
  return output;
}

// Fold-input assembly for one edge close (REQ-R-ABG3-REQUIREMENT-PROOF-
// CARRY-THROUGH-002/-005/-010/-013/-037). Two sources, one map:
// 1. SCAN: admitted coverage truth refs from replay, identity-scoped to the
//    closing (basisId, vectorIndex, edge). Rejected ADMISSIONS still carry
//    residual coverage truth — an output that failed envelope law is
//    no-close pressure, not silence (the rejected-PAYLOAD case is excluded
//    upstream: no emission happens without an accepted attached payload).
//    Identity scope is basis + edge + vector — not vectorIndex alone;
//    recursive/repeated graph calls reuse vector indexes. frameId/graphCallId/
//    runId matching is the named residual (the close site does not carry
//    frame/run identity today).
// 2. SYNTHESIS: for every requirement OWED coverage by an admitted startup
//    entry with no admitted coverage truth at this close, the existing
//    projector applied to zero admissions yields the residual projection —
//    "required but missing" becomes typed replay-derived pressure, never
//    silence. No contract naming the requirement -> no map entry -> the
//    -038 transitional path is preserved unchanged.
// F_D TOTALITY: this is a total function over the finite admitted state —
// the per-(requirement, close-identity) cell lattice
//   { not_owed, owed_uncovered, covered(eligible|residual|blocked) }
// folded from a finite replay prefix plus admitted startup. It adds no new
// state, status, or event kind: owed_uncovered maps to the existing
// `residual` status and nothing else. Domain closure is enforced by the
// signature: only the ADMITTED carrier (deep-reconstructed at engine entry
// by admitRequirementProofCarryThroughStartup) is accepted; this function
// must not accumulate guards against raw ingress shapes.
export function deriveRequirementProofCoverageTruthRefsForEdgeClose(input: {
  readonly startup: AdmittedRequirementProofCarryThroughStartup | undefined;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly basisId: string;
  readonly vectorIndex: number;
  readonly edge: string | undefined;
}): Readonly<Record<string, readonly string[]>> {
  const output: Record<string, readonly string[]> = {};
  for (const event of input.replayEvents) {
    if (event.kind !== "requirement_proof_carry_through_admitted") {
      continue;
    }
    if (
      event.vectorIndex !== input.vectorIndex ||
      event.basisId !== input.basisId ||
      (input.edge !== undefined && event.edge !== input.edge)
    ) {
      continue;
    }
    event.coverageRequirementIds.forEach((requirementId, index) => {
      const truthRef = event.coverageTruthRefs[index];
      if (truthRef === undefined) {
        return;
      }
      output[requirementId] = Object.freeze([
        ...(output[requirementId] ?? []),
        truthRef
      ]);
    });
  }
  for (const [requirementId, obligationRefs] of
    carryThroughOwedObligationRefsByRequirementId(input.startup)) {
    if (output[requirementId] !== undefined) {
      continue;
    }
    const coverage = projectRequirementProofCoverage({
      // deterministic over close identity: same replay -> same ref.
      // scheme://path form matches the module's ref grammar (the family's
      // only single-colon ref was a review finding).
      projectionRef: [
        `carry-through-close://${encodeURIComponent(input.basisId)}`,
        `/vector/${input.vectorIndex}`,
        `/edge/${encodeURIComponent(input.edge ?? `vector-${input.vectorIndex}`)}`,
        `/coverage/${encodeURIComponent(requirementId)}`
      ].join(""),
      requirementId,
      requiredRequirementObligationRefs: obligationRefs,
      admissions: [],
      dependencyInstructionTruth: null,
      proofDepthInstructionTruth: null
    });
    output[requirementId] = Object.freeze([
      requirementAbgTruthRefFromRequirementProofCoverage(coverage)
    ]);
  }
  return Object.freeze(output);
}

export function deriveRequirementProofCarryThroughAdmittedEvents(input: {
  readonly startup: AdmittedRequirementProofCarryThroughStartup | undefined;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly invocation: ActorInvocation;
  readonly frameLineageId: string | null;
  readonly resultRef: string;
  readonly planDependencyTruth: DerivedDependencyInstructionTruth | null;
  readonly planProofDepthTruth: DerivedProofDepthInstructionTruth | null;
}): readonly RequirementProofCarryThroughAdmittedEvent[] {
  if (input.startup === undefined) {
    return Object.freeze([]);
  }
  // Strength resolution consumes the ONE named replay-derived projection
  // (REQ -035 interim equivalence; full ProofStrengthAdmission carrier is
  // the named successor).
  const admittedLedgerRefs = deriveAdmittedStrengthRefSet(input.replayEvents);
  const events: RequirementProofCarryThroughAdmittedEvent[] = [];
  for (const entry of input.startup.entries) {
    if (!carryThroughEntryProducesOnEdge(entry, input.invocation.edge)) {
      continue;
    }
    const envelope = constructRequirementProofCarryThroughOutputEnvelope({
      ...entry.envelopeTemplate,
      envelopeRef: `${input.resultRef}/requirement-proof-carry-through`,
      evidenceRefs: Object.freeze([input.resultRef]),
      replayIdentity: `${input.invocation.actorInvocationId}/carry-through`
    });
    const admission = admitRequirementProofCarryThroughOutput({
      contract: entry.contract,
      classificationTable: entry.classificationTable,
      envelope
    });
    // T-210 break 2 (-034/-039): for requirements with an ADMITTED
    // depth-proof map, depth truth is EARNED — declared classes and typed
    // gaps derive from the map plus admitted test-identity evidence, and
    // plan/template declaration equality is severed from closure
    // authority. Unmapped requirements retain the transitional
    // plan-declared path.
    const earnedDepth = deriveEarnedDepthTruthForRequirements({
      replayEvents: input.replayEvents,
      requirementIds: entry.requirementIds,
      requiredDepthClassRefs: entry.contract.requiredDepthClassRefs,
      admittedEvidenceRefs: admittedLedgerRefs
    });
    // T-210 break 3 (-039): kill obligations project from the admitted
    // map's adversarial-class rows — cardinality discovered at admission,
    // never declared. Unproven obligations flow as typed depth gaps
    // through the EXISTING gate; no map means no obligations here (owed
    // map absence is already the earned-depth concern above).
    const killObligationGapRefs = deriveUnprovenKillObligationGapRefs({
      obligations: deriveKillObligations({
        replayEvents: input.replayEvents,
        requirementIds: entry.requirementIds,
        adversarialDepthClassRefs: entry.contract.adversarialDepthClassRefs
      }),
      admittedEvidenceRefs: admittedLedgerRefs
    });
    const proofDepthTruth = constructDerivedProofDepthInstructionTruth({
      admittedLedgerRefs,
      truthRef: `${envelope.envelopeRef}/proof-depth`,
      // depth policy is ADMITTED PLAN truth (compiled at startup), not
      // runner-synthesized
      depthPolicyRef: input.planProofDepthTruth?.depthPolicyRef ?? null,
      depthPolicyDigest: input.planProofDepthTruth?.depthPolicyDigest ?? null,
      targetRefs: [envelope.contractRef],
      requiredDepthClassRefs: entry.contract.requiredDepthClassRefs,
      declaredDepthClassRefs: earnedDepth.mapped
        ? earnedDepth.declaredDepthClassRefs
        : envelope.depthClassRefs,
      declaredDepthObligationRefs: envelope.proofObligationRefs,
      notApplicableDepthClassRefs: [],
      typedDepthGapRefs: [
        ...(earnedDepth.mapped ? earnedDepth.typedDepthGapRefs : []),
        ...killObligationGapRefs
      ],
      proofStrengthAdmissionRefs: envelope.proofStrengthAdmissionRefs,
      fdStrengthCriterionRefs: envelope.fdStrengthCriterionRefs,
      adversarialVerificationRefs: envelope.adversarialAttemptRefs,
      adversarialCounterexampleRefs: envelope.counterexampleRefs,
      sourceProjectionRefs: [envelope.envelopeRef],
      // Derive-only fields: the constructor ignores caller values and
      // derives internally (ledger-resolved via admittedLedgerRefs above).
      depthComplete: false,
      proofStrengthAdmitted: false
    });
    const coverageRequirementIds: string[] = [];
    const coverageStatuses: string[] = [];
    const coverageIssueKindSet = new Set<string>();
    const coverageTruthRefs: string[] = [];
    for (const requirementId of entry.requirementIds) {
      const coverage = projectRequirementProofCoverage({
        projectionRef: `${envelope.envelopeRef}/coverage/${requirementId}`,
        requirementId,
        // same derivation home as the close-site owedness merge — produced
        // and synthesized coverage share one required-set truth
        requiredRequirementObligationRefs: owedObligationRefsForEntry(entry),
        admissions: [admission],
        dependencyInstructionTruth: input.planDependencyTruth,
        proofDepthInstructionTruth: proofDepthTruth
      });
      coverageRequirementIds.push(requirementId);
      coverageStatuses.push(coverage.status);
      for (const issueKind of coverage.issueKinds) {
        coverageIssueKindSet.add(issueKind);
      }
      coverageTruthRefs.push(
        requirementAbgTruthRefFromRequirementProofCoverage(coverage)
      );
    }
    events.push(
      constructRequirementProofCarryThroughAdmittedEvent({
        invocation: input.invocation,
        frameLineageId: input.frameLineageId,
        correlationId: input.invocation.actorInvocationId,
        envelopeRef: admission.envelope.envelopeRef,
        contractRef: entry.contract.contractRef,
        categoryKey: admission.categoryKey,
        accepted: admission.accepted,
        sourceRequirementObligationRefs:
          admission.envelope.sourceRequirementObligationRefs,
        proofObligationRefs: admission.envelope.proofObligationRefs,
        evidenceRoleRefs: admission.envelope.evidenceRoleRefs,
        issueKinds: Object.freeze(admission.issues.map((row) => row.issueKind)),
        coverageRequirementIds: Object.freeze([...coverageRequirementIds]),
        coverageStatuses: Object.freeze([...coverageStatuses]),
        coverageIssueKinds: Object.freeze([...coverageIssueKindSet]),
        coverageTruthRefs: Object.freeze([...coverageTruthRefs]),
        replayIdentity: admission.envelope.replayIdentity,
        replayDigest: admission.envelope.replayDigest
      })
    );
  }
  return Object.freeze(events);
}
