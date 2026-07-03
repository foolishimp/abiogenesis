// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-031
// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-033
// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-034
// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-040
// Supports: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-011

import type {
  GtlRequirementsAlgebraDeclarationBundle
} from "../../../gtl/m01/contracts/requirements_algebra.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  type AssuranceClosureDecision
} from "./assurance.js";
import {
  type EvidenceAdmittedRuntimeEvent,
  type GraphReentryPoint,
  type RequirementRouteFactProjectedRuntimeEvent,
  type RuntimeEvent
} from "./carriers.js";
import type {
  RuntimeContinuationTransitionProjection
} from "./continuation_transition.js";
import {
  admitRequirementEventPayload,
  bindRequirementEvidence,
  buildEdgeRequirementEnvironment,
  constructAuthorityContextFragment,
  constructDestinationTopology,
  constructRequirementRelation,
  constructRequirementTerm,
  constructRequirementTestRelation,
  constructTraversalSpan,
  foldRequirementEvidence,
  residualizeRequirementFolds,
  projectRequirements,
  projectRequirementLedger,
  requirementAbgTruthRefFromAssuranceClosureDecision,
  type AuthorityContextFragment,
  type DestinationTopology,
  type EdgeRequirementEnvironment,
  type RequirementEdgeRef,
  type RequirementEvidenceBinding,
  type RequirementEventPayload,
  type RequirementEventPayloadKind,
  type RequirementFoldProjection,
  type RequirementLedger,
  type RequirementProjection,
  type RequirementQueryReadModel,
  type RequirementResidualProjection,
  type RequirementRelation,
  type RequirementTerm,
  type RequirementTestRelation,
  type TraversalSpan
} from "./requirements_algebra.js";

export type AuthorityRegime = "F_D" | "F_P" | "F_H";

export type RouteRejectionKind =
  | "malformed_input"
  | "unknown_ref"
  | "dangling_ref"
  | "stale_or_superseded"
  | "forged_ref"
  | "semantic_assessment_required"
  | "human_decision_required"
  | "not_ready";

export interface RouteAccepted<T> {
  readonly status: "accepted";
  readonly value: T;
  readonly emittedEventRefs: readonly string[];
  readonly sourceRefs: readonly string[];
}

export interface RouteRejected {
  readonly status: "rejected";
  readonly reason: RouteRejectionKind;
  readonly diagnostics: readonly string[];
  readonly sourceRefs: readonly string[];
}

export type RouteResult<T> = RouteAccepted<T> | RouteRejected;

export interface RouteReplayFact {
  readonly kind: string;
  readonly ref: string;
  readonly sourceEventRef: string;
  readonly payload: unknown;
}

export class AdmittedRef<Kind extends string> {
  protected readonly __admittedRefBrand: Kind;

  public constructor(input: {
    readonly kind: Kind;
    readonly ref: string;
    readonly sourceEventRef: string;
    readonly digest: string;
  }) {
    assertNonEmptyString(input.kind, "AdmittedRef.kind");
    assertNonEmptyString(input.ref, "AdmittedRef.ref");
    assertNonEmptyString(input.sourceEventRef, "AdmittedRef.sourceEventRef");
    assertNonEmptyString(input.digest, "AdmittedRef.digest");
    this.__admittedRefBrand = input.kind;
    this.kind = input.kind;
    this.ref = input.ref;
    this.sourceEventRef = input.sourceEventRef;
    this.digest = input.digest;
    Object.freeze(this);
  }

  public readonly kind: Kind;
  public readonly ref: string;
  public readonly sourceEventRef: string;
  public readonly digest: string;
}

export class RuntimeScopeRef {
  protected readonly __runtimeScopeRefBrand: "runtime_scope";

  public constructor(input: {
    readonly runRef: string;
    readonly graphCallRef: string | null;
    readonly frameRef: string | null;
    readonly continuationRef: string | null;
    readonly graphFunctionRef: string;
    readonly graphVectorRef: string;
    readonly spanRef: string;
  }) {
    assertNonEmptyString(input.runRef, "RuntimeScopeRef.runRef");
    assertNullableNonEmptyString(input.graphCallRef, "RuntimeScopeRef.graphCallRef");
    assertNullableNonEmptyString(input.frameRef, "RuntimeScopeRef.frameRef");
    assertNullableNonEmptyString(input.continuationRef, "RuntimeScopeRef.continuationRef");
    assertNonEmptyString(input.graphFunctionRef, "RuntimeScopeRef.graphFunctionRef");
    assertNonEmptyString(input.graphVectorRef, "RuntimeScopeRef.graphVectorRef");
    assertNonEmptyString(input.spanRef, "RuntimeScopeRef.spanRef");
    this.__runtimeScopeRefBrand = "runtime_scope";
    this.runRef = input.runRef;
    this.graphCallRef = input.graphCallRef;
    this.frameRef = input.frameRef;
    this.continuationRef = input.continuationRef;
    this.graphFunctionRef = input.graphFunctionRef;
    this.graphVectorRef = input.graphVectorRef;
    this.spanRef = input.spanRef;
    Object.freeze(this);
  }

  public readonly runRef: string;
  public readonly graphCallRef: string | null;
  public readonly frameRef: string | null;
  public readonly continuationRef: string | null;
  public readonly graphFunctionRef: string;
  public readonly graphVectorRef: string;
  public readonly spanRef: string;
}

export interface AdmitDeclarationsInput {
  readonly bundle: GtlRequirementsAlgebraDeclarationBundle;
  readonly runtimeScope: RuntimeScopeRef;
  readonly authorityRefs: readonly AdmittedRef<"authority_snapshot">[];
}

export interface AdmitDeclarationsOutput {
  readonly admittedRequirementEvents: readonly RequirementEventPayload[];
  readonly ledger: RequirementLedger;
  readonly admittedRequirementEventRefs: readonly AdmittedRef<"requirement_event">[];
  readonly ledgerRef: AdmittedRef<"requirement_ledger_projection">;
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface BindExecutionEvidenceInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly environment: EdgeRequirementEnvironment;
  readonly requirementProjectionRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly runtimeEvidenceEventRef: AdmittedRef<"runtime_evidence_event">;
  readonly replayFacts: readonly RouteReplayFact[];
  readonly byproduct?: boolean | undefined;
}

export interface BindExecutionEvidenceOutput {
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly emittedRequirementEvents: readonly RequirementEventPayload[];
  readonly evidenceBindingRefs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface ProjectRequirementFoldFromAssuranceClosureInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly environment: EdgeRequirementEnvironment;
  readonly requirementProjectionRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly evidenceBindingRefs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly assuranceClosureDecisionRef: AdmittedRef<"assurance_closure_decision">;
  readonly requirementClosureDecisionRefsByRequirementId?:
    | Readonly<Record<string, AdmittedRef<"assurance_closure_decision">>>
    | undefined;
  readonly proofCoverageTruthRefsByRequirementId?:
    | Readonly<Record<string, readonly string[]>>
    | undefined;
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface ProjectRequirementFoldFromAssuranceClosureOutput {
  readonly folds: readonly RequirementFoldProjection[];
  readonly emittedRequirementEvents: readonly RequirementEventPayload[];
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface ProjectRequirementResidualsFromFoldsInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly environment: EdgeRequirementEnvironment;
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface ProjectRequirementResidualsFromFoldsOutput {
  readonly residuals: readonly RequirementResidualProjection[];
  readonly emittedRequirementEvents: readonly RequirementEventPayload[];
  readonly residualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface RequirementRouteRuntimeContext {
  readonly ledger: RequirementLedger;
  readonly replayFacts: readonly RouteReplayFact[];
  readonly requirementProjectionRefsByVectorIndex: Readonly<Record<number, readonly AdmittedRef<"requirement_projection">[]>>;
  readonly admissionRuntimeEvents?:
    | readonly RequirementRouteFactProjectedRuntimeEvent[]
    | undefined;
}

export interface BuildRequirementRouteRuntimeContextFromDeclarationsInput {
  readonly bundle: GtlRequirementsAlgebraDeclarationBundle;
  readonly runtimeScope: RuntimeScopeRef;
  readonly edges: readonly RequirementEdgeRef[];
  readonly authorityRefs?: readonly AdmittedRef<"authority_snapshot">[] | undefined;
}

export interface EmitRequirementRouteFactsForEdgeCloseInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly context: RequirementRouteRuntimeContext;
  readonly edge: RequirementEdgeRef;
  readonly runtimeEvents: readonly EvidenceAdmittedRuntimeEvent[];
  readonly closureDecision: AssuranceClosureDecision;
  readonly continuationTransitions?:
    | readonly RuntimeContinuationTransitionProjection[]
    | undefined;
  readonly reentryPoints?: readonly GraphReentryPoint[] | undefined;
  readonly policyRefs?: readonly string[] | undefined;
  readonly requirementClosureDecisionRefsByRequirementId?:
    | Readonly<Record<string, AdmittedRef<"assurance_closure_decision">>>
    | undefined;
}

export interface RequirementRouteEdgeCloseEmission {
  readonly environment: EdgeRequirementEnvironment;
  readonly emittedRequirementEvents: readonly RequirementEventPayload[];
  readonly emittedRuntimeEvents: readonly RequirementRouteFactProjectedRuntimeEvent[];
  readonly replayFacts: readonly RouteReplayFact[];
  readonly evidenceBindingRefs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly residualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly dispositionRefs: readonly AdmittedRef<"requirement_lifecycle_disposition">[];
}

export type RequirementLifecycleDispositionKind =
  | "closed"
  | "continuation_available"
  | "reentry_available"
  | "blocked";

export interface RequirementLifecycleDisposition {
  readonly kind: "requirement_lifecycle_disposition";
  readonly dispositionRef: string;
  readonly disposition: RequirementLifecycleDispositionKind;
  readonly residualRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly reentryRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly reason: string;
}

export interface ResolveRequirementLifecycleDispositionInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly residualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly continuationRefs: readonly AdmittedRef<"continuation_transition">[];
  readonly activeContinuationRefs?:
    | readonly AdmittedRef<"continuation_transition">[]
    | undefined;
  readonly reentryRefs: readonly AdmittedRef<"graph_reentry_point">[];
  readonly policyRefs: readonly AdmittedRef<"runtime_policy">[];
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface ResolveRequirementLifecycleDispositionOutput {
  readonly disposition: RequirementLifecycleDisposition;
  readonly dispositionRef: AdmittedRef<"requirement_lifecycle_disposition">;
  readonly replayFacts: readonly RouteReplayFact[];
}

export interface RequirementLifecycleStateReadModel {
  readonly kind: "requirement_lifecycle_state_read_model";
  readonly requirementQuery: RequirementQueryReadModel;
  readonly dispositionRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface ProjectRequirementLifecycleStateInput {
  readonly query: RequirementQueryReadModel;
  readonly dispositionRefs: readonly (AdmittedRef<"requirement_lifecycle_disposition"> | string)[];
  readonly replayFacts?: readonly RouteReplayFact[] | undefined;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
}

export function mintRuntimeScopeRef(
  input: ConstructorParameters<typeof RuntimeScopeRef>[0]
): RuntimeScopeRef {
  return new RuntimeScopeRef(input);
}

export function mintAdmittedRef<Kind extends string>(input: {
  readonly kind: Kind;
  readonly ref: string;
  readonly sourceEventRef: string;
  readonly payload: unknown;
}): AdmittedRef<Kind> {
  return new AdmittedRef({
    kind: input.kind,
    ref: input.ref,
    sourceEventRef: input.sourceEventRef,
    digest: stableSha256Digest(input.payload)
  });
}

export function resolveAdmittedRef<Kind extends string>(input: {
  readonly admittedRef: AdmittedRef<Kind>;
  readonly replayFacts: readonly RouteReplayFact[];
  readonly expectedKind: Kind;
}): RouteResult<RouteReplayFact> {
  if (!(input.admittedRef instanceof AdmittedRef)) {
    return rejected("malformed_input", ["AdmittedRef is not nominally branded"], []);
  }
  if (input.admittedRef.kind !== input.expectedKind) {
    return rejected(
      "malformed_input",
      [`AdmittedRef kind ${input.admittedRef.kind} does not match ${input.expectedKind}`],
      [input.admittedRef.ref]
    );
  }
  const fact = input.replayFacts.find((candidate) =>
    candidate.kind === input.expectedKind &&
    candidate.ref === input.admittedRef.ref &&
    candidate.sourceEventRef === input.admittedRef.sourceEventRef
  );
  if (fact === undefined) {
    return rejected("unknown_ref", [`Unknown admitted ref ${input.admittedRef.ref}`], [input.admittedRef.ref]);
  }
  const digest = stableSha256Digest(fact.payload);
  if (digest !== input.admittedRef.digest) {
    return rejected("forged_ref", [`Digest mismatch for admitted ref ${input.admittedRef.ref}`], [input.admittedRef.ref]);
  }
  return accepted(fact, [], [input.admittedRef.ref]);
}

export function admitDeclarations(
  input: AdmitDeclarationsInput
): RouteResult<AdmitDeclarationsOutput> {
  if (!(input.runtimeScope instanceof RuntimeScopeRef)) {
    return rejected("malformed_input", ["runtimeScope is not a RuntimeScopeRef"], []);
  }
  for (const authorityRef of input.authorityRefs) {
    if (!(authorityRef instanceof AdmittedRef)) {
      return rejected("malformed_input", ["authorityRefs must be admitted refs"], []);
    }
  }

  try {
    const events = declarationBundleToRequirementEvents(input.bundle);
    const ledger = projectRequirementLedger(events);
    const replayFacts = replayFactsForRequirementEvents(events, ledger);
    const admittedRequirementEventRefs = events.map((event) =>
      mintAdmittedRef({
        kind: "requirement_event" as const,
        ref: event.eventRef,
        sourceEventRef: event.eventRef,
        payload: event
      })
    );
    const ledgerRef = mintAdmittedRef({
      kind: "requirement_ledger_projection" as const,
      ref: ledger.ledgerRef,
      sourceEventRef: `requirement-ledger-projection:${stableSha256Digest(ledger.eventRefs)}`,
      payload: ledger
    });

    return accepted(
      Object.freeze({
        admittedRequirementEvents: Object.freeze([...events]),
        ledger,
        admittedRequirementEventRefs: Object.freeze(admittedRequirementEventRefs),
        ledgerRef,
        replayFacts
      }),
      events.map((event) => event.eventRef),
      [input.bundle.declarationKey, input.runtimeScope.runRef, ...input.authorityRefs.map((ref) => ref.ref)]
    );
  } catch (error) {
    return rejected(
      "malformed_input",
      [error instanceof Error ? error.message : String(error)],
      [input.bundle.declarationKey, input.runtimeScope.runRef]
    );
  }
}

export function buildRequirementRouteRuntimeContextFromDeclarations(
  input: BuildRequirementRouteRuntimeContextFromDeclarationsInput
): RouteResult<RequirementRouteRuntimeContext> {
  const admitted = admitDeclarations({
    bundle: input.bundle,
    runtimeScope: input.runtimeScope,
    authorityRefs: input.authorityRefs ?? Object.freeze([])
  });
  if (admitted.status === "rejected") {
    return admitted;
  }

  const projectionEventsByRef = new Map<string, RequirementEventPayload>();
  const projectionRefsByRef = new Map<string, AdmittedRef<"requirement_projection">>();
  const requirementProjectionRefsByVectorIndex:
    Record<number, AdmittedRef<"requirement_projection">[]> = {};

  for (const edge of input.edges) {
    const environment = buildEdgeRequirementEnvironment({
      ledger: admitted.value.ledger,
      edge
    });
    const projections = projectRequirements({
      ledger: admitted.value.ledger,
      environment
    });
    const refs: AdmittedRef<"requirement_projection">[] = [];
    for (const projection of projections) {
      const existingRef = projectionRefsByRef.get(projection.projectionRef);
      if (existingRef !== undefined) {
        refs.push(existingRef);
        continue;
      }
      const event = admitRequirementEventPayload({
        kind: "requirement_projection_admitted",
        eventRef: requirementEventRef(
          "requirement_projection_admitted",
          projection.projectionRef,
          { projection, edge }
        ),
        projection
      });
      const projectionRef = mintAdmittedRef({
        kind: "requirement_projection" as const,
        ref: projection.projectionRef,
        sourceEventRef: event.eventRef,
        payload: projection
      });
      projectionEventsByRef.set(projection.projectionRef, event);
      projectionRefsByRef.set(projection.projectionRef, projectionRef);
      refs.push(projectionRef);
    }
    requirementProjectionRefsByVectorIndex[edge.vectorIndex] = refs;
  }

  const projectionEvents = Object.freeze([...projectionEventsByRef.values()]);
  const requirementEvents = Object.freeze([
    ...admitted.value.admittedRequirementEvents,
    ...projectionEvents
  ]);
  const ledger = projectRequirementLedger(requirementEvents);
  const replayFacts = replayFactsForRequirementEvents(requirementEvents, ledger);
  const admissionRuntimeEvents = Object.freeze(
    input.edges.flatMap((edge) => {
      const environment = buildEdgeRequirementEnvironment({ ledger, edge });
      return requirementEvents
        .filter((event) => requirementEventAppliesToEnvironment(event, environment))
        .map((event) =>
          constructRequirementRouteFactProjectedEvent({
            runtimeScope: input.runtimeScope,
            edge,
            payload: event,
            sourceEventRefs: [event.eventRef],
            sourceProjectionRefs: routePayloadProjectionRefs(event),
            causationEventRefs: [event.eventRef]
          })
        );
    })
  );
  return accepted(
    Object.freeze({
      ledger,
      replayFacts,
      requirementProjectionRefsByVectorIndex: Object.freeze(
        Object.fromEntries(
          Object.entries(requirementProjectionRefsByVectorIndex).map(
            ([vectorIndex, refs]) => [vectorIndex, Object.freeze([...refs])]
          )
        )
      ),
      admissionRuntimeEvents
    }),
    admissionRuntimeEvents.map((event) => event.routeEventRef),
    [input.bundle.declarationKey, ...input.edges.map((edge) => edge.edge)]
  );
}

function requirementEventAppliesToEnvironment(
  event: RequirementEventPayload,
  environment: EdgeRequirementEnvironment
): boolean {
  const activeRequirementIds = new Set(
    environment.activeTerms.map((term) => term.requirementId)
  );
  const activeRelationRefs = new Set(
    environment.activeRelations.map((relation) => relation.relationId)
  );
  const activeSpanIds = new Set(
    environment.activeSpans.map((span) => span.spanId)
  );
  switch (event.kind) {
    case "requirement_term_admitted":
      return activeRequirementIds.has(event.term.requirementId);
    case "requirement_relation_admitted":
      return activeRelationRefs.has(event.relation.relationId);
    case "traversal_span_admitted":
      return activeSpanIds.has(event.span.spanId);
    case "authority_context_fragment_admitted":
      return environment.activeContextFragments.some((fragment) =>
        fragment.fragmentRef === event.fragment.fragmentRef
      );
    case "destination_topology_admitted":
      return environment.activeDestinationTopologies.some((topology) =>
        topology.topologyRef === event.topology.topologyRef
      );
    case "requirement_test_relation_admitted":
      return environment.activeTestRelations.some((relation) =>
        relation.relationRef === event.testRelation.relationRef
      );
    case "requirement_projection_admitted":
      return (
        activeRequirementIds.has(event.projection.requirementId) &&
        activeSpanIds.has(event.projection.spanId)
      );
    case "requirement_evidence_bound":
      return activeRequirementIds.has(event.binding.requirementId);
    case "requirement_fold_projected":
      return activeRequirementIds.has(event.fold.requirementId);
    case "requirement_residual_projected":
      return activeRequirementIds.has(event.residual.requirementId);
  }
}

export function bindExecutionEvidence(
  input: BindExecutionEvidenceInput
): RouteResult<BindExecutionEvidenceOutput> {
  if (!(input.runtimeScope instanceof RuntimeScopeRef)) {
    return rejected("malformed_input", ["runtimeScope is not a RuntimeScopeRef"], []);
  }
  const evidenceResolution = resolveAdmittedRef({
    admittedRef: input.runtimeEvidenceEventRef,
    replayFacts: input.replayFacts,
    expectedKind: "runtime_evidence_event"
  });
  if (evidenceResolution.status === "rejected") {
    return evidenceResolution;
  }
  const runtimeEvidence = evidenceAdmittedRuntimeEventPayload(
    evidenceResolution.value.payload
  );
  if (runtimeEvidence === null) {
    return rejected(
      "malformed_input",
      [`Resolved ${input.runtimeEvidenceEventRef.ref} is not an EvidenceAdmittedRuntimeEvent`],
      [input.runtimeEvidenceEventRef.ref]
    );
  }
  if (!runtimeEvidenceMatchesScope(input.runtimeScope, runtimeEvidence)) {
    return rejected(
      "dangling_ref",
      [`Runtime evidence ${runtimeEvidence.evidenceRef} does not belong to runtime scope ${input.runtimeScope.runRef}`],
      [runtimeEvidence.evidenceRef]
    );
  }

  const projectionResolution = resolveRequirementProjectionRefs({
    refs: input.requirementProjectionRefs,
    replayFacts: input.replayFacts
  });
  if (projectionResolution.status === "rejected") {
    return projectionResolution;
  }

  const matchingProjections = projectionsMatchingRuntimeEvidence(
    runtimeEvidence,
    projectionResolution.value
  );
  const evidenceBindings = matchingProjections.map((projection) =>
    bindRequirementEvidence({
      environment: input.environment,
      projection,
      evidenceRef: requirementEvidenceBindingRef(runtimeEvidence, projection),
      path: null,
      digest: runtimeEvidence.inputDigest ??
        runtimeEvidence.authorityDigest ??
        stableSha256Digest(runtimeEvidence),
      admitted:
        runtimeEvidence.complete &&
        !runtimeEvidence.contradictsAuthority &&
        !runtimeEvidence.deferred,
      nonClosing:
        runtimeEvidence.shallow &&
        !runtimeEvidence.complete &&
        !runtimeEvidence.contradictsAuthority &&
        !runtimeEvidence.deferred,
      byproduct: input.byproduct ?? false,
      current: true
    })
  );
  const emittedRequirementEvents = evidenceBindings.map((binding) =>
    admitRequirementEventPayload({
      kind: "requirement_evidence_bound",
      eventRef: requirementEventRef(
        "requirement_evidence_bound",
        binding.evidenceRef,
        {
          binding,
          runtimeEvidenceEventRef: input.runtimeEvidenceEventRef.ref
        }
      ),
      binding
    })
  );
  const evidenceBindingRefs = evidenceBindings.map((binding, index) => {
    const event = emittedRequirementEvents[index];
    if (event === undefined || event.kind !== "requirement_evidence_bound") {
      throw new TypeError("Requirement evidence binding event construction failed");
    }
    return mintAdmittedRef({
      kind: "requirement_evidence_binding" as const,
      ref: binding.evidenceRef,
      sourceEventRef: event.eventRef,
      payload: binding
    });
  });
  const replayFacts = appendRequirementEventFacts(
    input.replayFacts,
    emittedRequirementEvents
  );

  return accepted(
    Object.freeze({
      evidenceBindings: Object.freeze(evidenceBindings),
      emittedRequirementEvents: Object.freeze(emittedRequirementEvents),
      evidenceBindingRefs: Object.freeze(evidenceBindingRefs),
      replayFacts
    }),
    emittedRequirementEvents.map((event) => event.eventRef),
    [
      input.runtimeEvidenceEventRef.ref,
      ...input.requirementProjectionRefs.map((ref) => ref.ref)
    ]
  );
}

function runtimeEvidenceAppliesToProjection(
  evidence: EvidenceAdmittedRuntimeEvent,
  projection: RequirementProjection
): boolean {
  if (evidence.authorityRef === null) {
    return false;
  }
  return (
    evidence.authorityRef === projection.requirementId ||
    evidence.authorityRef === projection.projectionRef ||
    projection.sourceRefs.includes(evidence.authorityRef)
  );
}

function projectionsMatchingRuntimeEvidence(
  evidence: EvidenceAdmittedRuntimeEvent,
  projections: readonly RequirementProjection[]
): readonly RequirementProjection[] {
  const matching = projections.filter((projection) =>
    runtimeEvidenceAppliesToProjection(evidence, projection)
  );
  if (matching.length > 0) {
    return Object.freeze(matching);
  }
  return projections.length === 1 ? Object.freeze([...projections]) : Object.freeze([]);
}

function scopedClosureTruthRef(
  closureDecision: AssuranceClosureDecision,
  requirementId: string,
  decision: AssuranceClosureDecision["decision"]
): string {
  return requirementAbgTruthRefFromAssuranceClosureDecision(Object.freeze({
    ...closureDecision,
    decision,
    projectionRef: [
      closureDecision.projectionRef,
      "requirement",
      encodeURIComponent(requirementId)
    ].join(":")
  }));
}

function scopedClosureDecisionForRequirement(input: {
  readonly closureDecision: AssuranceClosureDecision;
  readonly requirementId: string;
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
}): AssuranceClosureDecision["decision"] {
  const bindings = input.evidenceBindings.filter((binding) =>
    binding.requirementId === input.requirementId
  );
  if (bindings.some((binding) => binding.bindingStatus === "non_closing")) {
    return "retry";
  }
  if (bindings.some((binding) => binding.bindingStatus === "admitted")) {
    return input.closureDecision.decision === "close"
      ? "close"
      : input.closureDecision.decision;
  }
  return input.closureDecision.decision;
}

function sourceTruthRefsByRequirementId(input: {
  readonly runtimeScope: RuntimeScopeRef;
  readonly closureDecision: AssuranceClosureDecision;
  readonly requirementClosureDecisionRefsByRequirementId?:
    | Readonly<Record<string, AdmittedRef<"assurance_closure_decision">>>
    | undefined;
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly proofCoverageTruthRefsByRequirementId?:
    | Readonly<Record<string, readonly string[]>>
    | undefined;
  readonly replayFacts: readonly RouteReplayFact[];
}): RouteResult<Readonly<Record<string, readonly string[]>>> {
  const projectedRequirementIds = Object.freeze([
    ...new Set(input.projections.map((projection) => projection.requirementId))
  ]);
  const boundRequirementIds = new Set(
    input.evidenceBindings.map((binding) => binding.requirementId)
  );
  const output: Record<string, readonly string[]> = {};
  const explicitRefs = input.requirementClosureDecisionRefsByRequirementId;
  for (const requirementId of projectedRequirementIds) {
    const proofCoverageTruthRefs = input.proofCoverageTruthRefsByRequirementId?.[requirementId] ?? [];
    const explicitRef = explicitRefs?.[requirementId];
    if (explicitRef !== undefined) {
      const resolution = resolveAdmittedRef({
        admittedRef: explicitRef,
        replayFacts: input.replayFacts,
        expectedKind: "assurance_closure_decision"
      });
      if (resolution.status === "rejected") {
        return resolution;
      }
      const decision = assuranceClosureDecisionPayload(resolution.value.payload);
      if (decision === null) {
        return rejected(
          "malformed_input",
          [`Resolved ${explicitRef.ref} is not an AssuranceClosureDecision`],
          [explicitRef.ref]
        );
      }
      if (!assuranceDecisionMatchesScope(input.runtimeScope, decision)) {
        return rejected(
          "dangling_ref",
          [`Assurance closure decision ${decision.projectionRef} does not belong to runtime scope ${input.runtimeScope.runRef}`],
          [decision.projectionRef]
        );
      }
      output[requirementId] = Object.freeze([
        ...proofCoverageTruthRefs,
        requirementAbgTruthRefFromAssuranceClosureDecision(decision)
      ]);
      continue;
    }
    if (projectedRequirementIds.length === 1 || boundRequirementIds.has(requirementId)) {
      output[requirementId] = Object.freeze([
        ...proofCoverageTruthRefs,
        scopedClosureTruthRef(
          input.closureDecision,
          requirementId,
          scopedClosureDecisionForRequirement({
            closureDecision: input.closureDecision,
            requirementId,
            evidenceBindings: input.evidenceBindings
          })
        )
      ]);
    }
  }
  return accepted(Object.freeze(output), [], projectedRequirementIds);
}

export function projectRequirementFoldFromAssuranceClosure(
  input: ProjectRequirementFoldFromAssuranceClosureInput
): RouteResult<ProjectRequirementFoldFromAssuranceClosureOutput> {
  if (!(input.runtimeScope instanceof RuntimeScopeRef)) {
    return rejected("malformed_input", ["runtimeScope is not a RuntimeScopeRef"], []);
  }
  const assuranceResolution = resolveAdmittedRef({
    admittedRef: input.assuranceClosureDecisionRef,
    replayFacts: input.replayFacts,
    expectedKind: "assurance_closure_decision"
  });
  if (assuranceResolution.status === "rejected") {
    return assuranceResolution;
  }
  const closureDecision = assuranceClosureDecisionPayload(
    assuranceResolution.value.payload
  );
  if (closureDecision === null) {
    return rejected(
      "malformed_input",
      [`Resolved ${input.assuranceClosureDecisionRef.ref} is not an AssuranceClosureDecision`],
      [input.assuranceClosureDecisionRef.ref]
    );
  }
  if (!assuranceDecisionMatchesScope(input.runtimeScope, closureDecision)) {
    return rejected(
      "dangling_ref",
      [`Assurance closure decision ${closureDecision.projectionRef} does not belong to runtime scope ${input.runtimeScope.runRef}`],
      [closureDecision.projectionRef]
    );
  }

  const projectionResolution = resolveRequirementProjectionRefs({
    refs: input.requirementProjectionRefs,
    replayFacts: input.replayFacts
  });
  if (projectionResolution.status === "rejected") {
    return projectionResolution;
  }
  const bindingResolution = resolveRequirementEvidenceBindingRefs({
    refs: input.evidenceBindingRefs,
    replayFacts: input.replayFacts
  });
  if (bindingResolution.status === "rejected") {
    return bindingResolution;
  }

  const sourceTruthResolution = sourceTruthRefsByRequirementId({
    runtimeScope: input.runtimeScope,
    closureDecision,
    requirementClosureDecisionRefsByRequirementId:
      input.requirementClosureDecisionRefsByRequirementId,
    projections: projectionResolution.value,
    evidenceBindings: bindingResolution.value,
    replayFacts: input.replayFacts,
    proofCoverageTruthRefsByRequirementId:
      input.proofCoverageTruthRefsByRequirementId
  });
  if (sourceTruthResolution.status === "rejected") {
    return sourceTruthResolution;
  }
  const folds = foldRequirementEvidence({
    environment: input.environment,
    projections: projectionResolution.value,
    evidenceBindings: bindingResolution.value,
    sourceAbgTruthRefs: Object.freeze([]),
    sourceAbgTruthRefsByRequirementId: sourceTruthResolution.value
  });
  const emittedRequirementEvents = folds.map((fold) =>
    admitRequirementEventPayload({
      kind: "requirement_fold_projected",
      eventRef: requirementEventRef(
        "requirement_fold_projected",
        fold.foldRef,
        {
          fold,
          assuranceClosureDecisionRef: input.assuranceClosureDecisionRef.ref
        }
      ),
      fold
    })
  );
  const foldRefs = folds.map((fold, index) => {
    const event = emittedRequirementEvents[index];
    if (event === undefined || event.kind !== "requirement_fold_projected") {
      throw new TypeError("Requirement fold event construction failed");
    }
    return mintAdmittedRef({
      kind: "requirement_fold_projection" as const,
      ref: fold.foldRef,
      sourceEventRef: event.eventRef,
      payload: fold
    });
  });
  const replayFacts = appendRequirementEventFacts(
    input.replayFacts,
    emittedRequirementEvents
  );

  return accepted(
    Object.freeze({
      folds,
      emittedRequirementEvents: Object.freeze(emittedRequirementEvents),
      foldRefs: Object.freeze(foldRefs),
      replayFacts
    }),
    emittedRequirementEvents.map((event) => event.eventRef),
    [
      input.assuranceClosureDecisionRef.ref,
      ...input.evidenceBindingRefs.map((ref) => ref.ref),
      ...input.requirementProjectionRefs.map((ref) => ref.ref)
    ]
  );
}

export function projectRequirementResidualsFromFolds(
  input: ProjectRequirementResidualsFromFoldsInput
): RouteResult<ProjectRequirementResidualsFromFoldsOutput> {
  if (!(input.runtimeScope instanceof RuntimeScopeRef)) {
    return rejected("malformed_input", ["runtimeScope is not a RuntimeScopeRef"], []);
  }
  const foldResolution = resolveRequirementFoldRefs({
    refs: input.foldRefs,
    replayFacts: input.replayFacts
  });
  if (foldResolution.status === "rejected") {
    return foldResolution;
  }
  const residuals = residualizeRequirementFolds({
    environment: input.environment,
    folds: foldResolution.value
  });
  const emittedRequirementEvents = residuals.map((residual) =>
    admitRequirementEventPayload({
      kind: "requirement_residual_projected",
      eventRef: requirementEventRef(
        "requirement_residual_projected",
        residual.residualRef,
        { residual, foldRefs: input.foldRefs.map((ref) => ref.ref) }
      ),
      residual
    })
  );
  const residualRefs = residuals.map((residual, index) => {
    const event = emittedRequirementEvents[index];
    if (event === undefined || event.kind !== "requirement_residual_projected") {
      throw new TypeError("Requirement residual event construction failed");
    }
    return mintAdmittedRef({
      kind: "requirement_residual_projection" as const,
      ref: residual.residualRef,
      sourceEventRef: event.eventRef,
      payload: residual
    });
  });

  return accepted(
    Object.freeze({
      residuals,
      emittedRequirementEvents: Object.freeze(emittedRequirementEvents),
      residualRefs: Object.freeze(residualRefs),
      replayFacts: appendRequirementEventFacts(
        input.replayFacts,
        emittedRequirementEvents
      )
    }),
    emittedRequirementEvents.map((event) => event.eventRef),
    input.foldRefs.map((ref) => ref.ref)
  );
}

export function emitRequirementRouteFactsForEdgeClose(
  input: EmitRequirementRouteFactsForEdgeCloseInput
): RouteResult<RequirementRouteEdgeCloseEmission> {
  const projectionRefs =
    input.context.requirementProjectionRefsByVectorIndex[input.edge.vectorIndex] ??
    Object.freeze([]);
  if (projectionRefs.length === 0) {
    return rejected(
      "not_ready",
      [`No admitted requirement projection refs for vector ${input.edge.vectorIndex}`],
      [input.edge.edge]
    );
  }

  const environment = buildEdgeRequirementEnvironment({
    ledger: input.context.ledger,
    edge: input.edge
  });
  const scopedEvidence = input.runtimeEvents.filter((event) =>
    runtimeEvidenceMatchesScope(input.runtimeScope, event) &&
    event.vectorIndex === input.edge.vectorIndex &&
    event.edge === input.edge.edge
  );
  if (scopedEvidence.length === 0) {
    return rejected(
      "not_ready",
      [`No admitted runtime evidence event for vector ${input.edge.vectorIndex}`],
      [input.edge.edge]
    );
  }

  let replayFacts = input.context.replayFacts;
  const evidenceBindingRefs: AdmittedRef<"requirement_evidence_binding">[] = [];
  const emittedRequirementEvents: RequirementEventPayload[] = [];
  for (const evidence of scopedEvidence) {
    const evidenceEventRef = `runtime-event:evidence_admitted:${evidence.evidenceRef}:${stableSha256Digest(evidence)}`;
    const runtimeEvidenceEventRef = mintAdmittedRef({
      kind: "runtime_evidence_event" as const,
      ref: evidence.evidenceRef,
      sourceEventRef: evidenceEventRef,
      payload: evidence
    });
    const binding = bindExecutionEvidence({
      runtimeScope: input.runtimeScope,
      environment,
      requirementProjectionRefs: projectionRefs,
      runtimeEvidenceEventRef,
      replayFacts: Object.freeze([
        ...replayFacts,
        fact("runtime_evidence_event", evidence.evidenceRef, evidenceEventRef, evidence)
      ])
    });
    if (binding.status === "rejected") {
      return binding;
    }
    replayFacts = binding.value.replayFacts;
    evidenceBindingRefs.push(...binding.value.evidenceBindingRefs);
    emittedRequirementEvents.push(...binding.value.emittedRequirementEvents);
  }

  const assuranceEventRef = `runtime-projection:assurance_closure_decision:${input.closureDecision.projectionRef}:${stableSha256Digest(input.closureDecision)}`;
  const closureRef = mintAdmittedRef({
    kind: "assurance_closure_decision" as const,
    ref: input.closureDecision.projectionRef,
    sourceEventRef: assuranceEventRef,
    payload: input.closureDecision
  });
  const fold = projectRequirementFoldFromAssuranceClosure({
    runtimeScope: input.runtimeScope,
    environment,
    requirementProjectionRefs: projectionRefs,
    evidenceBindingRefs,
    assuranceClosureDecisionRef: closureRef,
    requirementClosureDecisionRefsByRequirementId:
      input.requirementClosureDecisionRefsByRequirementId,
    replayFacts: Object.freeze([
      ...replayFacts,
      fact("assurance_closure_decision", input.closureDecision.projectionRef, assuranceEventRef, input.closureDecision)
    ])
  });
  if (fold.status === "rejected") {
    return fold;
  }
  replayFacts = fold.value.replayFacts;
  emittedRequirementEvents.push(...fold.value.emittedRequirementEvents);

  const residual = projectRequirementResidualsFromFolds({
    runtimeScope: input.runtimeScope,
    environment,
    foldRefs: fold.value.foldRefs,
    replayFacts
  });
  if (residual.status === "rejected") {
    return residual;
  }
  replayFacts = residual.value.replayFacts;
  emittedRequirementEvents.push(...residual.value.emittedRequirementEvents);

  const continuationRefs: AdmittedRef<"continuation_transition">[] = [];
  const activeContinuationRefs: AdmittedRef<"continuation_transition">[] = [];
  const reentryRefs: AdmittedRef<"graph_reentry_point">[] = [];
  const admitReentryPoint = (point: GraphReentryPoint) => {
    if (reentryRefs.some((ref) => ref.ref === `graph-reentry-point:${point}`)) {
      return;
    }
    const payload = Object.freeze({
      kind: "graph_reentry_point",
      reEntryPoint: point,
      runtimeScope: input.runtimeScope.runRef,
      edge: input.edge.edge
    });
    const ref = `graph-reentry-point:${point}`;
    const sourceEventRef = `runtime-projection:graph_reentry_point:${encodeURIComponent(point)}:${stableSha256Digest(payload)}`;
    replayFacts = Object.freeze([
      ...replayFacts,
      fact("graph_reentry_point", ref, sourceEventRef, payload)
    ]);
    reentryRefs.push(
      mintAdmittedRef({
        kind: "graph_reentry_point" as const,
        ref,
        sourceEventRef,
        payload
      })
    );
  };
  for (const transition of input.continuationTransitions ?? Object.freeze([])) {
    if (!continuationTransitionMatchesRoute(input.runtimeScope, input.edge, transition)) {
      return rejected(
        "dangling_ref",
        [`Continuation transition ${transition.projectionRef} does not belong to requirement route edge ${input.edge.edge}`],
        [transition.projectionRef]
      );
    }
    const sourceEventRef = continuationTransitionSourceEventRef(transition);
    replayFacts = Object.freeze([
      ...replayFacts,
      fact("continuation_transition", transition.projectionRef, sourceEventRef, transition)
    ]);
    if (
      transition.disposition === "advance_vector" ||
      transition.disposition === "close" ||
      transition.disposition === "retry_same_edge" ||
      transition.disposition === "yield_continuation"
    ) {
      const admittedTransitionRef = mintAdmittedRef({
        kind: "continuation_transition" as const,
        ref: transition.projectionRef,
        sourceEventRef,
        payload: transition
      });
      continuationRefs.push(admittedTransitionRef);
      if (
        transition.disposition === "retry_same_edge" ||
        transition.disposition === "yield_continuation"
      ) {
        activeContinuationRefs.push(admittedTransitionRef);
      }
    }
    if (transition.disposition === "reprice") {
      admitReentryPoint("requirements");
    }
  }

  for (const point of input.reentryPoints ?? Object.freeze([])) {
    admitReentryPoint(point);
  }

  const policyRefs: AdmittedRef<"runtime_policy">[] = [];
  for (const policyRef of input.policyRefs ?? Object.freeze([])) {
    const payload = Object.freeze({
      kind: "runtime_policy",
      policyRef,
      runtimeScope: input.runtimeScope.runRef
    });
    const sourceEventRef = `runtime-projection:runtime_policy:${encodeURIComponent(policyRef)}:${stableSha256Digest(payload)}`;
    replayFacts = Object.freeze([
      ...replayFacts,
      fact("runtime_policy", policyRef, sourceEventRef, payload)
    ]);
    policyRefs.push(
      mintAdmittedRef({
        kind: "runtime_policy" as const,
        ref: policyRef,
        sourceEventRef,
        payload
      })
    );
  }

  const disposition = resolveRequirementLifecycleDisposition({
    runtimeScope: input.runtimeScope,
    residualRefs: residual.value.residualRefs,
    continuationRefs,
    activeContinuationRefs,
    reentryRefs,
    policyRefs,
    replayFacts
  });
  if (disposition.status === "rejected") {
    return disposition;
  }
  replayFacts = disposition.value.replayFacts;
  const emittedRuntimeEvents = Object.freeze([
    ...emittedRequirementEvents.map((event) =>
      constructRequirementRouteFactProjectedEvent({
        runtimeScope: input.runtimeScope,
        edge: input.edge,
        payload: event,
        sourceEventRefs: [event.eventRef],
        sourceProjectionRefs: routePayloadProjectionRefs(event),
        causationEventRefs: [event.eventRef]
      })
    ),
    constructRequirementRouteFactProjectedEvent({
      runtimeScope: input.runtimeScope,
      edge: input.edge,
      payload: disposition.value.disposition,
      sourceEventRefs: [disposition.value.dispositionRef.sourceEventRef],
      sourceProjectionRefs: [disposition.value.dispositionRef.ref],
      causationEventRefs: [disposition.value.dispositionRef.sourceEventRef]
    })
  ]);

  return accepted(
    Object.freeze({
      environment,
      emittedRequirementEvents: Object.freeze(emittedRequirementEvents),
      emittedRuntimeEvents,
      replayFacts,
      evidenceBindingRefs: Object.freeze(evidenceBindingRefs),
      foldRefs: fold.value.foldRefs,
      residualRefs: residual.value.residualRefs,
      dispositionRefs: Object.freeze([disposition.value.dispositionRef])
    }),
    emittedRequirementEvents.map((event) => event.eventRef),
    [input.edge.edge, input.closureDecision.projectionRef]
  );
}

export function resolveRequirementLifecycleDisposition(
  input: ResolveRequirementLifecycleDispositionInput
): RouteResult<ResolveRequirementLifecycleDispositionOutput> {
  if (!(input.runtimeScope instanceof RuntimeScopeRef)) {
    return rejected("malformed_input", ["runtimeScope is not a RuntimeScopeRef"], []);
  }
  const residualResolution = resolveRequirementResidualRefs({
    refs: input.residualRefs,
    replayFacts: input.replayFacts
  });
  if (residualResolution.status === "rejected") {
    return residualResolution;
  }
  for (const ref of input.continuationRefs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "continuation_transition"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
  }
  for (const ref of input.activeContinuationRefs ?? input.continuationRefs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "continuation_transition"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
  }
  for (const ref of input.reentryRefs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "graph_reentry_point"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
  }
  for (const ref of input.policyRefs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "runtime_policy"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
  }

  const residualRefs = residualResolution.value.map((residual) => residual.residualRef);
  const continuationRefs = input.continuationRefs.map((ref) => ref.ref);
  const activeContinuationRefs =
    input.activeContinuationRefs === undefined
      ? continuationRefs
      : input.activeContinuationRefs.map((ref) => ref.ref);
  const reentryRefs = input.reentryRefs.map((ref) => ref.ref);
  const policyRefs = input.policyRefs.map((ref) => ref.ref);
  const disposition = lifecycleDispositionKind({
    residualRefs,
    continuationRefs: activeContinuationRefs,
    reentryRefs
  });
  const payload: RequirementLifecycleDisposition = Object.freeze({
    kind: "requirement_lifecycle_disposition",
    dispositionRef: `requirement-lifecycle-disposition:${stableSha256Digest({
      residualRefs,
      continuationRefs,
      reentryRefs,
      policyRefs
    })}`,
    disposition,
    residualRefs: Object.freeze(residualRefs),
    continuationRefs: Object.freeze(continuationRefs),
    reentryRefs: Object.freeze(reentryRefs),
    policyRefs: Object.freeze(policyRefs),
    reason: lifecycleDispositionReason(disposition)
  });
  const sourceProjectionRef = `requirement-lifecycle-disposition:${stableSha256Digest(payload)}`;
  return accepted(
    Object.freeze({
      disposition: payload,
      dispositionRef: mintAdmittedRef({
        kind: "requirement_lifecycle_disposition" as const,
        ref: payload.dispositionRef,
        sourceEventRef: sourceProjectionRef,
        payload
      }),
      replayFacts: Object.freeze([
        ...input.replayFacts,
        fact(
          "requirement_lifecycle_disposition",
          payload.dispositionRef,
          sourceProjectionRef,
          payload
        )
      ])
    }),
    [],
    [...residualRefs, ...continuationRefs, ...reentryRefs, ...policyRefs]
  );
}

export function projectRequirementLifecycleState(
  input: ProjectRequirementLifecycleStateInput
): RouteResult<RequirementLifecycleStateReadModel> {
  const replayFacts = Object.freeze([
    ...(input.replayFacts ?? Object.freeze([])),
    ...requirementRouteReplayFactsFromRuntimeEvents(
      input.runtimeEvents ?? Object.freeze([])
    )
  ]);
  const dispositionRefs: string[] = [];
  const sourceEventRefs: string[] = [];
  const sourceProjectionRefs: string[] = [];
  for (const ref of input.dispositionRefs) {
    if (typeof ref === "string") {
      const fact = replayFacts.find((candidate) =>
        candidate.kind === "requirement_lifecycle_disposition" &&
        candidate.ref === ref
      );
      if (fact === undefined) {
        return rejected(
          "unknown_ref",
          [`Unknown requirement lifecycle disposition ref ${ref}`],
          [ref]
        );
      }
      dispositionRefs.push(ref);
      sourceEventRefs.push(fact.sourceEventRef);
      sourceProjectionRefs.push(ref);
    } else {
      const resolution = resolveAdmittedRef({
        admittedRef: ref,
        replayFacts,
        expectedKind: "requirement_lifecycle_disposition"
      });
      if (resolution.status === "rejected") {
        return resolution;
      }
      dispositionRefs.push(ref.ref);
      sourceEventRefs.push(ref.sourceEventRef);
      sourceProjectionRefs.push(ref.ref);
    }
  }
  return accepted(
    Object.freeze({
      kind: "requirement_lifecycle_state_read_model",
      requirementQuery: input.query,
      dispositionRefs: Object.freeze(dispositionRefs),
      sourceEventRefs: Object.freeze(sourceEventRefs),
      sourceProjectionRefs: Object.freeze(sourceProjectionRefs)
    }),
    [],
    [...input.query.requirementIds, ...dispositionRefs]
  );
}

export function requirementRouteReplayFactsFromRuntimeEvents(
  events: readonly RuntimeEvent[]
): readonly RouteReplayFact[] {
  const facts: RouteReplayFact[] = [];
  for (const event of events) {
    if (event.kind !== "requirement_route_fact_projected") {
      continue;
    }
    if (event.routePayloadKind === "requirement_lifecycle_disposition") {
      facts.push(fact(
        "requirement_lifecycle_disposition",
        event.routePayloadRef,
        event.routeEventRef,
        event.requirementPayload
      ));
      continue;
    }
    const requirementEvent = admitRequirementEventPayload(
      event.requirementPayload
    );
    facts.push(fact(
      "requirement_event",
      requirementEvent.eventRef,
      event.routeEventRef,
      requirementEvent
    ));
    facts.push(replayFactForRequirementEvent(requirementEvent));
  }
  return Object.freeze(facts);
}

function constructRequirementRouteFactProjectedEvent(input: {
  readonly runtimeScope: RuntimeScopeRef;
  readonly edge: import("./requirements_algebra.js").RequirementEdgeRef;
  readonly payload: RequirementEventPayload | RequirementLifecycleDisposition;
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
}): RequirementRouteFactProjectedRuntimeEvent {
  if (input.runtimeScope.graphCallRef === null) {
    throw new TypeError("Requirement route runtime event requires graphCallRef");
  }
  if (input.runtimeScope.frameRef === null) {
    throw new TypeError("Requirement route runtime event requires frameRef");
  }
  const routePayloadRef = requirementRoutePayloadRef(input.payload);
  const routeEventRef = [
    "requirement-route-fact",
    encodeURIComponent(input.runtimeScope.runRef),
    String(input.edge.vectorIndex),
    encodeURIComponent(input.edge.edge),
    encodeURIComponent(routePayloadRef),
    stableSha256Digest(input.sourceEventRefs)
  ].join(":");
  return Object.freeze({
    kind: "requirement_route_fact_projected",
    basisId: input.runtimeScope.runRef,
    graphFunctionId: input.runtimeScope.graphFunctionRef,
    runId: input.runtimeScope.runRef,
    workKey: null,
    graphCallId: input.runtimeScope.graphCallRef,
    frameId: input.runtimeScope.frameRef,
    vectorIndex: input.edge.vectorIndex,
    edge: input.edge.edge,
    routeEventRef,
    routePayloadKind: input.payload.kind,
    routePayloadRef,
    routePayloadDigest: stableSha256Digest(input.payload),
    requirementPayload: input.payload,
    sourceEventRefs: Object.freeze([...input.sourceEventRefs]),
    sourceProjectionRefs: Object.freeze([...input.sourceProjectionRefs]),
    causationEventRefs: Object.freeze([...input.causationEventRefs]),
    correlationId: [
      "correlation://requirement-route",
      encodeURIComponent(input.runtimeScope.runRef),
      String(input.edge.vectorIndex),
      stableSha256Digest(input.payload)
    ].join("/")
  });
}

function requirementRoutePayloadRef(
  payload: RequirementEventPayload | RequirementLifecycleDisposition
): string {
  if (payload.kind === "requirement_lifecycle_disposition") {
    return payload.dispositionRef;
  }
  return payload.eventRef;
}

function routePayloadProjectionRefs(
  payload: RequirementEventPayload
): readonly string[] {
  switch (payload.kind) {
    case "requirement_evidence_bound":
      return Object.freeze([payload.binding.evidenceRef]);
    case "requirement_fold_projected":
      return Object.freeze([payload.fold.foldRef]);
    case "requirement_residual_projected":
      return Object.freeze([payload.residual.residualRef]);
    case "requirement_projection_admitted":
      return Object.freeze([payload.projection.projectionRef]);
    case "requirement_term_admitted":
      return Object.freeze([payload.term.requirementId]);
    case "requirement_relation_admitted":
      return Object.freeze([payload.relation.relationId]);
    case "traversal_span_admitted":
      return Object.freeze([payload.span.spanId]);
    case "authority_context_fragment_admitted":
      return Object.freeze([payload.fragment.fragmentRef]);
    case "destination_topology_admitted":
      return Object.freeze([payload.topology.topologyRef]);
    case "requirement_test_relation_admitted":
      return Object.freeze([payload.testRelation.relationRef]);
  }
}

function declarationBundleToRequirementEvents(
  bundle: GtlRequirementsAlgebraDeclarationBundle
): readonly RequirementEventPayload[] {
  const payloads: RequirementEventPayload[] = [];

  for (const declaration of bundle.requirements) {
    const term = constructRequirementTerm({
      requirementId: declaration.requirementId,
      termKind: declaration.termKind,
      stableId: declaration.stableId,
      sourceRef: declaration.sourceRef,
      sourceDigest: declaration.sourceDigest,
      text: declaration.sourceRef,
      relationRefs: declaration.relationRefs,
      spanRefs: declaration.spanRefs,
      contextRefs: declaration.contextRefs,
      evidencePolicyRefs: declaration.evidencePolicyRefs,
      projectionRefs: []
    });
    payloads.push(termPayload(term));
  }

  for (const declaration of bundle.relations) {
    const relation = constructRequirementRelation({
      relationId: declaration.relationId,
      relationKind: declaration.relationKind,
      fromRequirementId: declaration.fromRequirementId,
      toRequirementId: declaration.toRequirementId,
      sourceRef: declaration.relationId,
      evidenceRefs: []
    });
    payloads.push(relationPayload(relation));
  }

  for (const declaration of bundle.spans) {
    const span = constructTraversalSpan({
      spanId: declaration.spanId,
      graphFunctionRef: declaration.graphFunctionRef,
      graphVectorRefs: declaration.graphVectorRefs,
      vectorIndexes: declaration.vectorIndexes,
      sourceNodeRef: declaration.sourceNodeRef,
      targetNodeRef: declaration.targetNodeRef,
      frameRefs: declaration.frameRefs,
      zoomRefs: declaration.zoomRefs,
      foldbackRefs: declaration.foldbackRefs,
      aliasRefs: declaration.aliasRefs
    });
    payloads.push(spanPayload(span));
  }

  for (const declaration of bundle.contextFragments) {
    const fragment = constructAuthorityContextFragment({
      fragmentRef: declaration.fragmentRef,
      stage: declaration.originStage,
      constraintScope: declaration.constraintScope,
      digest: declaration.digest,
      promotionPolicyRef: declaration.promotionPolicyRef,
      appliesToRefs: declaration.appliesToRefs,
      routingOutcome: "constraint_only"
    });
    payloads.push(authorityContextPayload(fragment));
  }

  for (const declaration of bundle.destinationTopologies) {
    const topology = constructDestinationTopology({
      topologyRef: declaration.topologyRef,
      frameworkRef: declaration.frameworkRef,
      constraintRefs: declaration.constraintRefs,
      appliesToRefs: declaration.appliesToRefs
    });
    payloads.push(destinationTopologyPayload(topology));
  }

  for (const declaration of bundle.testRelations) {
    const testRelation = constructRequirementTestRelation({
      relationRef: declaration.relationRef,
      requirementId: declaration.requirementId,
      assetProjectionRef: declaration.assetProjectionRef,
      testSourceProjectionRef: declaration.testSourceProjectionRef,
      testExecutionProjectionRef: declaration.testExecutionProjectionRef,
      interpretationProjectionRef: declaration.interpretationProjectionRef,
      componentTestRootRefs: declaration.componentTestRootRefs,
      evidencePolicyRef: declaration.evidencePolicyRef
    });
    payloads.push(testRelationPayload(testRelation));
  }

  return Object.freeze(payloads);
}

function termPayload(term: RequirementTerm): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "requirement_term_admitted",
    eventRef: requirementEventRef("requirement_term_admitted", term.requirementId, term),
    term
  });
}

function relationPayload(relation: RequirementRelation): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "requirement_relation_admitted",
    eventRef: requirementEventRef("requirement_relation_admitted", relation.relationId, relation),
    relation
  });
}

function spanPayload(span: TraversalSpan): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "traversal_span_admitted",
    eventRef: requirementEventRef("traversal_span_admitted", span.spanId, span),
    span
  });
}

function authorityContextPayload(fragment: AuthorityContextFragment): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "authority_context_fragment_admitted",
    eventRef: requirementEventRef("authority_context_fragment_admitted", fragment.fragmentRef, fragment),
    fragment
  });
}

function destinationTopologyPayload(topology: DestinationTopology): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "destination_topology_admitted",
    eventRef: requirementEventRef("destination_topology_admitted", topology.topologyRef, topology),
    topology
  });
}

function testRelationPayload(testRelation: RequirementTestRelation): RequirementEventPayload {
  return admitRequirementEventPayload({
    kind: "requirement_test_relation_admitted",
    eventRef: requirementEventRef("requirement_test_relation_admitted", testRelation.relationRef, testRelation),
    testRelation
  });
}

function requirementEventRef(
  kind: RequirementEventPayloadKind,
  ref: string,
  payload: unknown
): string {
  return `requirement-event:${kind}:${encodeURIComponent(ref)}:${stableSha256Digest(payload)}`;
}

function replayFactsForRequirementEvents(
  events: readonly RequirementEventPayload[],
  ledger: RequirementLedger
): readonly RouteReplayFact[] {
  const facts: RouteReplayFact[] = [];
  for (const event of events) {
    facts.push(Object.freeze({
      kind: "requirement_event",
      ref: event.eventRef,
      sourceEventRef: event.eventRef,
      payload: event
    }));
    facts.push(replayFactForRequirementEvent(event));
  }
  facts.push(Object.freeze({
    kind: "requirement_ledger_projection",
    ref: ledger.ledgerRef,
    sourceEventRef: `requirement-ledger-projection:${stableSha256Digest(ledger.eventRefs)}`,
    payload: ledger
  }));
  return Object.freeze(facts);
}

function appendRequirementEventFacts(
  replayFacts: readonly RouteReplayFact[],
  events: readonly RequirementEventPayload[]
): readonly RouteReplayFact[] {
  const facts: RouteReplayFact[] = [...replayFacts];
  for (const event of events) {
    facts.push(Object.freeze({
      kind: "requirement_event",
      ref: event.eventRef,
      sourceEventRef: event.eventRef,
      payload: event
    }));
    facts.push(replayFactForRequirementEvent(event));
  }
  return Object.freeze(facts);
}

function replayFactForRequirementEvent(event: RequirementEventPayload): RouteReplayFact {
  switch (event.kind) {
    case "requirement_term_admitted":
      return fact("requirement_term", event.term.requirementId, event.eventRef, event.term);
    case "requirement_relation_admitted":
      return fact("requirement_relation", event.relation.relationId, event.eventRef, event.relation);
    case "traversal_span_admitted":
      return fact("traversal_span", event.span.spanId, event.eventRef, event.span);
    case "authority_context_fragment_admitted":
      return fact("authority_context_fragment", event.fragment.fragmentRef, event.eventRef, event.fragment);
    case "destination_topology_admitted":
      return fact("destination_topology", event.topology.topologyRef, event.eventRef, event.topology);
    case "requirement_test_relation_admitted":
      return fact("requirement_test_relation", event.testRelation.relationRef, event.eventRef, event.testRelation);
    case "requirement_projection_admitted":
      return fact("requirement_projection", event.projection.projectionRef, event.eventRef, event.projection);
    case "requirement_evidence_bound":
      return fact("requirement_evidence_binding", event.binding.evidenceRef, event.eventRef, event.binding);
    case "requirement_fold_projected":
      return fact("requirement_fold_projection", event.fold.foldRef, event.eventRef, event.fold);
    case "requirement_residual_projected":
      return fact("requirement_residual_projection", event.residual.residualRef, event.eventRef, event.residual);
  }
}

function fact(kind: string, ref: string, sourceEventRef: string, payload: unknown): RouteReplayFact {
  return Object.freeze({ kind, ref, sourceEventRef, payload });
}

function requirementEvidenceBindingRef(
  event: EvidenceAdmittedRuntimeEvent,
  projection: RequirementProjection
): string {
  return [
    event.evidenceRef,
    encodeURIComponent(projection.projectionRef)
  ].join("#requirement-projection=");
}

function resolveRequirementProjectionRefs(input: {
  readonly refs: readonly AdmittedRef<"requirement_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}): RouteResult<readonly RequirementProjection[]> {
  const projections: RequirementProjection[] = [];
  for (const ref of input.refs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "requirement_projection"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
    const projection = requirementProjectionPayload(resolution.value.payload);
    if (projection === null) {
      return rejected(
        "malformed_input",
        [`Resolved ${ref.ref} is not a RequirementProjection`],
        [ref.ref]
      );
    }
    projections.push(projection);
  }
  return accepted(Object.freeze(projections), [], input.refs.map((ref) => ref.ref));
}

function resolveRequirementEvidenceBindingRefs(input: {
  readonly refs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly replayFacts: readonly RouteReplayFact[];
}): RouteResult<readonly RequirementEvidenceBinding[]> {
  const bindings: RequirementEvidenceBinding[] = [];
  for (const ref of input.refs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "requirement_evidence_binding"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
    const binding = requirementEvidenceBindingPayload(resolution.value.payload);
    if (binding === null) {
      return rejected(
        "malformed_input",
        [`Resolved ${ref.ref} is not a RequirementEvidenceBinding`],
        [ref.ref]
      );
    }
    bindings.push(binding);
  }
  return accepted(Object.freeze(bindings), [], input.refs.map((ref) => ref.ref));
}

function resolveRequirementFoldRefs(input: {
  readonly refs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}): RouteResult<readonly RequirementFoldProjection[]> {
  const folds: RequirementFoldProjection[] = [];
  for (const ref of input.refs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "requirement_fold_projection"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
    const fold = requirementFoldProjectionPayload(resolution.value.payload);
    if (fold === null) {
      return rejected(
        "malformed_input",
        [`Resolved ${ref.ref} is not a RequirementFoldProjection`],
        [ref.ref]
      );
    }
    folds.push(fold);
  }
  return accepted(Object.freeze(folds), [], input.refs.map((ref) => ref.ref));
}

function resolveRequirementResidualRefs(input: {
  readonly refs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly replayFacts: readonly RouteReplayFact[];
}): RouteResult<readonly RequirementResidualProjection[]> {
  const residuals: RequirementResidualProjection[] = [];
  for (const ref of input.refs) {
    const resolution = resolveAdmittedRef({
      admittedRef: ref,
      replayFacts: input.replayFacts,
      expectedKind: "requirement_residual_projection"
    });
    if (resolution.status === "rejected") {
      return resolution;
    }
    const residual = requirementResidualProjectionPayload(resolution.value.payload);
    if (residual === null) {
      return rejected(
        "malformed_input",
        [`Resolved ${ref.ref} is not a RequirementResidualProjection`],
        [ref.ref]
      );
    }
    residuals.push(residual);
  }
  return accepted(Object.freeze(residuals), [], input.refs.map((ref) => ref.ref));
}

function requirementProjectionPayload(input: unknown): RequirementProjection | null {
  return isRequirementProjection(input) ? input : null;
}

function requirementEvidenceBindingPayload(input: unknown): RequirementEvidenceBinding | null {
  return isRequirementEvidenceBinding(input) ? input : null;
}

function evidenceAdmittedRuntimeEventPayload(input: unknown): EvidenceAdmittedRuntimeEvent | null {
  return isEvidenceAdmittedRuntimeEvent(input) ? input : null;
}

function assuranceClosureDecisionPayload(input: unknown): AssuranceClosureDecision | null {
  return isAssuranceClosureDecision(input) ? input : null;
}

function requirementFoldProjectionPayload(input: unknown): RequirementFoldProjection | null {
  return isRequirementFoldProjection(input) ? input : null;
}

function requirementResidualProjectionPayload(input: unknown): RequirementResidualProjection | null {
  return isRequirementResidualProjection(input) ? input : null;
}

function isRequirementProjection(input: unknown): input is RequirementProjection {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "requirement_projection";
}

function isRequirementEvidenceBinding(input: unknown): input is RequirementEvidenceBinding {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "requirement_evidence_binding";
}

function isRequirementFoldProjection(input: unknown): input is RequirementFoldProjection {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "requirement_fold_projection";
}

function isRequirementResidualProjection(input: unknown): input is RequirementResidualProjection {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "requirement_residual_projection";
}

function isEvidenceAdmittedRuntimeEvent(input: unknown): input is EvidenceAdmittedRuntimeEvent {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "evidence_admitted";
}

function isAssuranceClosureDecision(input: unknown): input is AssuranceClosureDecision {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  return "kind" in input && input.kind === "assurance_closure_decision";
}

function runtimeEvidenceMatchesScope(
  scope: RuntimeScopeRef,
  event: EvidenceAdmittedRuntimeEvent
): boolean {
  return (
    scope.runRef === event.basisId &&
    (scope.graphCallRef === null || scope.graphCallRef === event.graphCallId) &&
    (scope.frameRef === null || scope.frameRef === event.frameId)
  );
}

function assuranceDecisionMatchesScope(
  scope: RuntimeScopeRef,
  decision: AssuranceClosureDecision
): boolean {
  return (
    scope.runRef === decision.scope.basisId &&
    (scope.graphCallRef === null || scope.graphCallRef === decision.scope.graphCallId) &&
    (scope.frameRef === null || scope.frameRef === decision.scope.frameId)
  );
}

function continuationTransitionMatchesRoute(
  scope: RuntimeScopeRef,
  edge: import("./requirements_algebra.js").RequirementEdgeRef,
  transition: RuntimeContinuationTransitionProjection
): boolean {
  return (
    scope.runRef === transition.basisId &&
    scope.graphFunctionRef === transition.graphFunctionId &&
    (scope.graphCallRef === null || scope.graphCallRef === transition.graphCallId) &&
    (scope.frameRef === null || scope.frameRef === transition.frameId) &&
    edge.vectorIndex === transition.vectorIndex &&
    edge.edge === transition.edge
  );
}

function continuationTransitionSourceEventRef(
  transition: RuntimeContinuationTransitionProjection
): string {
  return `runtime-projection:continuation_transition:${transition.projectionRef}:${stableSha256Digest(transition)}`;
}

function lifecycleDispositionKind(input: {
  readonly residualRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly reentryRefs: readonly string[];
}): RequirementLifecycleDispositionKind {
  if (input.residualRefs.length === 0) {
    return "closed";
  }
  if (input.reentryRefs.length > 0) {
    return "reentry_available";
  }
  if (input.continuationRefs.length > 0) {
    return "continuation_available";
  }
  return "blocked";
}

function lifecycleDispositionReason(
  disposition: RequirementLifecycleDispositionKind
): string {
  switch (disposition) {
    case "closed":
      return "no residual pressure remains";
    case "continuation_available":
      return "residual pressure has admitted continuation truth";
    case "reentry_available":
      return "residual pressure has admitted re-entry truth";
    case "blocked":
      return "residual pressure remains without admitted continuation or re-entry truth";
  }
}

function accepted<T>(
  value: T,
  emittedEventRefs: readonly string[],
  sourceRefs: readonly string[]
): RouteAccepted<T> {
  return Object.freeze({
    status: "accepted",
    value,
    emittedEventRefs: Object.freeze([...emittedEventRefs]),
    sourceRefs: Object.freeze([...sourceRefs])
  });
}

function rejected(
  reason: RouteRejectionKind,
  diagnostics: readonly string[],
  sourceRefs: readonly string[]
): RouteRejected {
  return Object.freeze({
    status: "rejected",
    reason,
    diagnostics: Object.freeze([...diagnostics]),
    sourceRefs: Object.freeze([...sourceRefs])
  });
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

function assertNullableNonEmptyString(value: string | null, label: string): void {
  if (value !== null) {
    assertNonEmptyString(value, label);
  }
}
