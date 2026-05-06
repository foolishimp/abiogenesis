// Implements: T-120
// Implements: REQ-R-ABG3-EVENTS-018
// Implements: REQ-R-ABG3-PROJECTION-013

import type {
  ExecutionBasis,
  RuntimeEvent
} from "./carriers.js";
import { RUNTIME_EVENT_KIND_VALUES } from "./carriers.js";
import { assertBasisEvent, vectorEdge } from "./runtime_support.js";

type RuntimeEventKind = RuntimeEvent["kind"];

export const RUNTIME_FLUENT_SCOPE_VALUES = Object.freeze([
  "basis",
  "run",
  "graph_call",
  "frame",
  "vector",
  "continuation",
  "temporal"
] as const);

export type RuntimeFluentScope =
  (typeof RUNTIME_FLUENT_SCOPE_VALUES)[number];

export const RUNTIME_FLUENT_NAME_VALUES = Object.freeze([
  "basis_admitted",
  "graph_call_open",
  "frame_open",
  "vector_traversal_planned",
  "vector_evaluated",
  "vector_closed",
  "retry_repair_planned",
  "continuation_open",
  "continuation_terminated",
  "reset_scope_active",
  "temporal_timer_pending",
  "temporal_timer_fired",
  "temporal_eligible",
  "scheduled_continuation_open",
  "temporal_deadline_breached"
] as const);

export type RuntimeFluentName =
  (typeof RUNTIME_FLUENT_NAME_VALUES)[number];

export interface RuntimeFluent {
  readonly kind: "runtime_fluent";
  readonly name: RuntimeFluentName;
  readonly scope: RuntimeFluentScope;
  readonly basisId: string | null;
  readonly graphFunctionId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly continuationId: string | null;
  readonly constraintRef: string | null;
  readonly timerIntentRef: string | null;
  readonly timerOutcomeRef: string | null;
  readonly schedulePolicyRef: string | null;
  readonly ref: string | null;
}

export interface RuntimeFluentPattern {
  readonly kind: "runtime_fluent_pattern";
  readonly name: RuntimeFluentName | null;
  readonly scope: RuntimeFluentScope | null;
  readonly basisId: string | null;
  readonly graphFunctionId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly continuationId: string | null;
  readonly constraintRef: string | null;
  readonly timerIntentRef: string | null;
  readonly timerOutcomeRef: string | null;
  readonly schedulePolicyRef: string | null;
  readonly ref: string | null;
}

export interface RuntimeEventCalculusEffect {
  readonly initiates: readonly RuntimeFluent[];
  readonly terminates: readonly RuntimeFluent[];
  readonly clips: readonly RuntimeFluentPattern[];
  readonly declips: readonly RuntimeFluentPattern[];
}

export interface RuntimeEventCalculusContext {
  readonly basis?: ExecutionBasis | undefined;
}

export interface RuntimeEventCalculusAxiom {
  readonly kind: "event_calculus_axiom";
  readonly eventKind: RuntimeEventKind;
  readonly deriveEffects: (
    event: RuntimeEvent,
    context: RuntimeEventCalculusContext
  ) => RuntimeEventCalculusEffect;
}

export interface RuntimeDerivedFluentRule {
  readonly kind: "derived_fluent_rule";
  readonly ruleRef: string;
  readonly derive: (input: {
    readonly holds: readonly RuntimeFluent[];
  }) => readonly RuntimeFluent[];
}

export interface RuntimeEventCalculusEffectRow {
  readonly kind: "event_calculus_effect_row";
  readonly eventKind: string;
  readonly initiates: readonly RuntimeFluent[];
  readonly terminates: readonly RuntimeFluent[];
  readonly clips: readonly RuntimeFluentPattern[];
  readonly declips: readonly RuntimeFluentPattern[];
}

export interface RuntimeEventCalculusProjection {
  readonly kind: "event_calculus_projection";
  readonly basisId: string | null;
  readonly holds: readonly RuntimeFluent[];
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
}

export interface RuntimeEventCalculusReplayInput {
  readonly basis?: ExecutionBasis | undefined;
  readonly events: readonly RuntimeEvent[];
  readonly axioms?: readonly RuntimeEventCalculusAxiom[] | undefined;
  readonly initiallyP?: readonly RuntimeFluent[] | undefined;
  readonly initiallyN?: readonly RuntimeFluent[] | undefined;
  readonly derivedRules?: readonly RuntimeDerivedFluentRule[] | undefined;
  readonly undeclaredEventBehavior?: "reject" | "ignore" | undefined;
}

export interface RuntimeFluentInput {
  readonly name: RuntimeFluentName;
  readonly scope: RuntimeFluentScope;
  readonly basisId?: string | null | undefined;
  readonly graphFunctionId?: string | null | undefined;
  readonly graphCallId?: string | null | undefined;
  readonly frameId?: string | null | undefined;
  readonly runId?: string | null | undefined;
  readonly workKey?: string | null | undefined;
  readonly vectorIndex?: number | null | undefined;
  readonly edge?: string | null | undefined;
  readonly continuationId?: string | null | undefined;
  readonly constraintRef?: string | null | undefined;
  readonly timerIntentRef?: string | null | undefined;
  readonly timerOutcomeRef?: string | null | undefined;
  readonly schedulePolicyRef?: string | null | undefined;
  readonly ref?: string | null | undefined;
}

type RuntimeFluentPatternInput = Omit<
  RuntimeFluentInput,
  "name" | "scope"
> & {
  readonly name?: RuntimeFluentName | null | undefined;
  readonly scope?: RuntimeFluentScope | null | undefined;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function assertOptionalNonEmptyString(
  value: string | null,
  label: string
): void {
  if (value !== null && value.length === 0) {
    throw new TypeError(`${label} must be null or non-empty`);
  }
}

function assertOptionalNonNegativeInteger(
  value: number | null,
  label: string
): void {
  if (value !== null && (!Number.isInteger(value) || value < 0)) {
    throw new TypeError(`${label} must be null or a non-negative integer`);
  }
}

function assertKnownRuntimeFluentName(value: RuntimeFluentName | null): void {
  if (value === null) {
    return;
  }
  if (!RUNTIME_FLUENT_NAME_VALUES.includes(value)) {
    throw new TypeError(`Unsupported RuntimeFluent.name ${JSON.stringify(value)}`);
  }
}

function assertKnownRuntimeFluentScope(value: RuntimeFluentScope | null): void {
  if (value === null) {
    return;
  }
  if (!RUNTIME_FLUENT_SCOPE_VALUES.includes(value)) {
    throw new TypeError(`Unsupported RuntimeFluent.scope ${JSON.stringify(value)}`);
  }
}

function assertKnownRuntimeEventKind(value: string): asserts value is RuntimeEventKind {
  if (!RUNTIME_EVENT_KIND_VALUES.some((kind) => kind === value)) {
    throw new TypeError(`Unsupported RuntimeEvent.kind ${JSON.stringify(value)}`);
  }
}

function assertEventKind<K extends RuntimeEventKind>(
  event: RuntimeEvent,
  kind: K
): asserts event is Extract<RuntimeEvent, { readonly kind: K }> {
  if (event.kind !== kind) {
    throw new TypeError(
      `Event Calculus axiom for ${kind} received ${JSON.stringify(event.kind)}`
    );
  }
}

function scalarOrNull(value: string | null | undefined): string | null {
  return value ?? null;
}

function numberOrNull(value: number | null | undefined): number | null {
  return value ?? null;
}

function validateRuntimeFluent(fluent: RuntimeFluent): void {
  assertKnownRuntimeFluentName(fluent.name);
  assertKnownRuntimeFluentScope(fluent.scope);
  assertOptionalNonEmptyString(fluent.basisId, "RuntimeFluent.basisId");
  assertOptionalNonEmptyString(
    fluent.graphFunctionId,
    "RuntimeFluent.graphFunctionId"
  );
  assertOptionalNonEmptyString(fluent.graphCallId, "RuntimeFluent.graphCallId");
  assertOptionalNonEmptyString(fluent.frameId, "RuntimeFluent.frameId");
  assertOptionalNonEmptyString(fluent.runId, "RuntimeFluent.runId");
  assertOptionalNonEmptyString(fluent.workKey, "RuntimeFluent.workKey");
  assertOptionalNonNegativeInteger(
    fluent.vectorIndex,
    "RuntimeFluent.vectorIndex"
  );
  assertOptionalNonEmptyString(fluent.edge, "RuntimeFluent.edge");
  assertOptionalNonEmptyString(
    fluent.continuationId,
    "RuntimeFluent.continuationId"
  );
  assertOptionalNonEmptyString(
    fluent.constraintRef,
    "RuntimeFluent.constraintRef"
  );
  assertOptionalNonEmptyString(
    fluent.timerIntentRef,
    "RuntimeFluent.timerIntentRef"
  );
  assertOptionalNonEmptyString(
    fluent.timerOutcomeRef,
    "RuntimeFluent.timerOutcomeRef"
  );
  assertOptionalNonEmptyString(
    fluent.schedulePolicyRef,
    "RuntimeFluent.schedulePolicyRef"
  );
  assertOptionalNonEmptyString(fluent.ref, "RuntimeFluent.ref");
}

function validateRuntimeFluentPattern(pattern: RuntimeFluentPattern): void {
  assertKnownRuntimeFluentName(pattern.name);
  assertKnownRuntimeFluentScope(pattern.scope);
  assertOptionalNonEmptyString(pattern.basisId, "RuntimeFluentPattern.basisId");
  assertOptionalNonEmptyString(
    pattern.graphFunctionId,
    "RuntimeFluentPattern.graphFunctionId"
  );
  assertOptionalNonEmptyString(
    pattern.graphCallId,
    "RuntimeFluentPattern.graphCallId"
  );
  assertOptionalNonEmptyString(pattern.frameId, "RuntimeFluentPattern.frameId");
  assertOptionalNonEmptyString(pattern.runId, "RuntimeFluentPattern.runId");
  assertOptionalNonEmptyString(pattern.workKey, "RuntimeFluentPattern.workKey");
  assertOptionalNonNegativeInteger(
    pattern.vectorIndex,
    "RuntimeFluentPattern.vectorIndex"
  );
  assertOptionalNonEmptyString(pattern.edge, "RuntimeFluentPattern.edge");
  assertOptionalNonEmptyString(
    pattern.continuationId,
    "RuntimeFluentPattern.continuationId"
  );
  assertOptionalNonEmptyString(
    pattern.constraintRef,
    "RuntimeFluentPattern.constraintRef"
  );
  assertOptionalNonEmptyString(
    pattern.timerIntentRef,
    "RuntimeFluentPattern.timerIntentRef"
  );
  assertOptionalNonEmptyString(
    pattern.timerOutcomeRef,
    "RuntimeFluentPattern.timerOutcomeRef"
  );
  assertOptionalNonEmptyString(
    pattern.schedulePolicyRef,
    "RuntimeFluentPattern.schedulePolicyRef"
  );
  assertOptionalNonEmptyString(pattern.ref, "RuntimeFluentPattern.ref");
}

export function constructRuntimeFluent(input: RuntimeFluentInput): RuntimeFluent {
  const fluent = Object.freeze({
    kind: "runtime_fluent",
    name: input.name,
    scope: input.scope,
    basisId: scalarOrNull(input.basisId),
    graphFunctionId: scalarOrNull(input.graphFunctionId),
    graphCallId: scalarOrNull(input.graphCallId),
    frameId: scalarOrNull(input.frameId),
    runId: scalarOrNull(input.runId),
    workKey: scalarOrNull(input.workKey),
    vectorIndex: numberOrNull(input.vectorIndex),
    edge: scalarOrNull(input.edge),
    continuationId: scalarOrNull(input.continuationId),
    constraintRef: scalarOrNull(input.constraintRef),
    timerIntentRef: scalarOrNull(input.timerIntentRef),
    timerOutcomeRef: scalarOrNull(input.timerOutcomeRef),
    schedulePolicyRef: scalarOrNull(input.schedulePolicyRef),
    ref: scalarOrNull(input.ref)
  } satisfies RuntimeFluent);
  validateRuntimeFluent(fluent);
  return fluent;
}

export function constructRuntimeFluentPattern(
  input: RuntimeFluentPatternInput
): RuntimeFluentPattern {
  const pattern = Object.freeze({
    kind: "runtime_fluent_pattern",
    name: input.name ?? null,
    scope: input.scope ?? null,
    basisId: scalarOrNull(input.basisId),
    graphFunctionId: scalarOrNull(input.graphFunctionId),
    graphCallId: scalarOrNull(input.graphCallId),
    frameId: scalarOrNull(input.frameId),
    runId: scalarOrNull(input.runId),
    workKey: scalarOrNull(input.workKey),
    vectorIndex: numberOrNull(input.vectorIndex),
    edge: scalarOrNull(input.edge),
    continuationId: scalarOrNull(input.continuationId),
    constraintRef: scalarOrNull(input.constraintRef),
    timerIntentRef: scalarOrNull(input.timerIntentRef),
    timerOutcomeRef: scalarOrNull(input.timerOutcomeRef),
    schedulePolicyRef: scalarOrNull(input.schedulePolicyRef),
    ref: scalarOrNull(input.ref)
  } satisfies RuntimeFluentPattern);
  validateRuntimeFluentPattern(pattern);
  return pattern;
}

export function runtimeFluentKey(fluent: RuntimeFluent): string {
  validateRuntimeFluent(fluent);
  return JSON.stringify([
    fluent.name,
    fluent.scope,
    fluent.basisId,
    fluent.graphFunctionId,
    fluent.graphCallId,
    fluent.frameId,
    fluent.runId,
    fluent.workKey,
    fluent.vectorIndex,
    fluent.edge,
    fluent.continuationId,
    fluent.constraintRef,
    fluent.timerIntentRef,
    fluent.timerOutcomeRef,
    fluent.schedulePolicyRef,
    fluent.ref
  ]);
}

export function runtimeFluentPatternKey(pattern: RuntimeFluentPattern): string {
  validateRuntimeFluentPattern(pattern);
  return JSON.stringify([
    pattern.name,
    pattern.scope,
    pattern.basisId,
    pattern.graphFunctionId,
    pattern.graphCallId,
    pattern.frameId,
    pattern.runId,
    pattern.workKey,
    pattern.vectorIndex,
    pattern.edge,
    pattern.continuationId,
    pattern.constraintRef,
    pattern.timerIntentRef,
    pattern.timerOutcomeRef,
    pattern.schedulePolicyRef,
    pattern.ref
  ]);
}

export function runtimeFluentMatchesPattern(
  fluent: RuntimeFluent,
  pattern: RuntimeFluentPattern
): boolean {
  validateRuntimeFluent(fluent);
  validateRuntimeFluentPattern(pattern);
  return (
    (pattern.name === null || fluent.name === pattern.name) &&
    (pattern.scope === null || fluent.scope === pattern.scope) &&
    (pattern.basisId === null || fluent.basisId === pattern.basisId) &&
    (pattern.graphFunctionId === null ||
      fluent.graphFunctionId === pattern.graphFunctionId) &&
    (pattern.graphCallId === null ||
      fluent.graphCallId === pattern.graphCallId) &&
    (pattern.frameId === null || fluent.frameId === pattern.frameId) &&
    (pattern.runId === null || fluent.runId === pattern.runId) &&
    (pattern.workKey === null || fluent.workKey === pattern.workKey) &&
    (pattern.vectorIndex === null ||
      fluent.vectorIndex === pattern.vectorIndex) &&
    (pattern.edge === null || fluent.edge === pattern.edge) &&
    (pattern.continuationId === null ||
      fluent.continuationId === pattern.continuationId) &&
    (pattern.constraintRef === null ||
      fluent.constraintRef === pattern.constraintRef) &&
    (pattern.timerIntentRef === null ||
      fluent.timerIntentRef === pattern.timerIntentRef) &&
    (pattern.timerOutcomeRef === null ||
      fluent.timerOutcomeRef === pattern.timerOutcomeRef) &&
    (pattern.schedulePolicyRef === null ||
      fluent.schedulePolicyRef === pattern.schedulePolicyRef) &&
    (pattern.ref === null || fluent.ref === pattern.ref)
  );
}

function completeEffect(
  input: Partial<RuntimeEventCalculusEffect>
): RuntimeEventCalculusEffect {
  const effect = Object.freeze({
    initiates: Object.freeze([...(input.initiates ?? Object.freeze([]))]),
    terminates: Object.freeze([...(input.terminates ?? Object.freeze([]))]),
    clips: Object.freeze([...(input.clips ?? Object.freeze([]))]),
    declips: Object.freeze([...(input.declips ?? Object.freeze([]))])
  } satisfies RuntimeEventCalculusEffect);
  for (const fluent of effect.initiates) {
    validateRuntimeFluent(fluent);
  }
  for (const fluent of effect.terminates) {
    validateRuntimeFluent(fluent);
  }
  for (const pattern of effect.clips) {
    validateRuntimeFluentPattern(pattern);
  }
  for (const pattern of effect.declips) {
    validateRuntimeFluentPattern(pattern);
  }
  const initiated = new Set(effect.initiates.map((fluent) => runtimeFluentKey(fluent)));
  const terminated = new Set(
    effect.terminates.map((fluent) => runtimeFluentKey(fluent))
  );
  for (const key of initiated) {
    if (terminated.has(key)) {
      throw new TypeError(
        "Event Calculus effect cannot both initiate and terminate the same fluent"
      );
    }
  }
  return effect;
}

function eventRuntimeScope(
  event: RuntimeEvent,
  basis: ExecutionBasis | undefined
): {
  readonly basisId: string | null;
  readonly graphFunctionId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly runId: string | null;
  readonly workKey: string | null;
} {
  return Object.freeze({
    basisId: "basisId" in event ? event.basisId : (basis?.id ?? null),
    graphFunctionId:
      "graphFunctionId" in event ? event.graphFunctionId : (basis?.graphFunction.id ?? null),
    graphCallId: "graphCallId" in event ? event.graphCallId : null,
    frameId: "frameId" in event ? event.frameId : null,
    runId:
      "runId" in event
        ? event.runId
        : (basis?.runId ?? null),
    workKey:
      "workKey" in event
        ? event.workKey
        : (basis?.workKey ?? null)
  });
}

export function constructVectorRuntimeFluent(input: {
  readonly basis: ExecutionBasis;
  readonly name:
    | "vector_traversal_planned"
    | "vector_evaluated"
    | "vector_closed"
    | "retry_repair_planned"
    | "temporal_eligible";
  readonly vectorIndex: number;
  readonly graphCallId?: string | null | undefined;
  readonly frameId?: string | null | undefined;
  readonly constraintRef?: string | null | undefined;
  readonly timerIntentRef?: string | null | undefined;
  readonly schedulePolicyRef?: string | null | undefined;
  readonly ref?: string | null | undefined;
}): RuntimeFluent {
  return constructRuntimeFluent({
    name: input.name,
    scope: "vector",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: input.graphCallId ?? null,
    frameId: input.frameId ?? null,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    constraintRef: input.constraintRef,
    timerIntentRef: input.timerIntentRef,
    schedulePolicyRef: input.schedulePolicyRef,
    ref: input.ref
  });
}

export function constructVectorClosedRuntimeFluent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly graphCallId?: string | null | undefined;
  readonly frameId?: string | null | undefined;
}): RuntimeFluent {
  return constructVectorRuntimeFluent({
    basis: input.basis,
    name: "vector_closed",
    vectorIndex: input.vectorIndex,
    graphCallId: input.graphCallId,
    frameId: input.frameId
  });
}

function resetClipPattern(
  event: Extract<RuntimeEvent, { readonly kind: "reset" }>
): RuntimeFluentPattern {
  switch (event.scope) {
    case "workspace":
      return constructRuntimeFluentPattern({
        runId: event.runId
      });
    case "work_key":
      return constructRuntimeFluentPattern({
        runId: event.runId,
        workKey: event.workKey
      });
    case "edge":
      return constructRuntimeFluentPattern({
        runId: event.runId,
        workKey: event.workKey,
        edge: event.edge
      });
    default: {
      const exhaustive: never = event.scope;
      throw new TypeError(`Unsupported reset scope ${JSON.stringify(exhaustive)}`);
    }
  }
}

function basisAdmittedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "basis_admitted");
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "basis_admitted",
        scope: "basis",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        runId: event.runId,
        workKey: event.workKey,
        ref: event.resolvedRuntimeRef
      })
    ]
  });
}

function graphCallOpenedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "graph_call_opened");
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "graph_call_open",
        scope: "graph_call",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        runId: event.runId,
        workKey: event.workKey
      })
    ]
  });
}

function frameOpenedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  assertEventKind(event, "frame_opened");
  const scope = eventRuntimeScope(event, context.basis);
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "frame_open",
        scope: "frame",
        basisId: event.basisId,
        graphFunctionId: scope.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: scope.runId,
        workKey: scope.workKey
      })
    ]
  });
}

function vectorAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext,
  name:
    | "vector_traversal_planned"
    | "vector_evaluated"
    | "vector_closed"
    | "retry_repair_planned"
): RuntimeEventCalculusEffect {
  if (context.basis === undefined) {
    throw new TypeError(`${name} Event Calculus axiom requires ExecutionBasis`);
  }
  if (!("vectorIndex" in event)) {
    throw new TypeError(`${name} Event Calculus axiom requires vectorIndex`);
  }
  if (!("graphCallId" in event) || !("frameId" in event)) {
    throw new TypeError(`${name} Event Calculus axiom requires graph frame scope`);
  }
  return completeEffect({
    initiates: [
      constructVectorRuntimeFluent({
        basis: context.basis,
        name,
        vectorIndex: event.vectorIndex,
        graphCallId: event.graphCallId,
        frameId: event.frameId
      })
    ]
  });
}

function continuationTerminatedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  assertEventKind(event, "continuation_terminated");
  const scope = eventRuntimeScope(event, context.basis);
  const terminated = constructRuntimeFluent({
    name: "continuation_terminated",
    scope: "continuation",
    basisId: event.basisId,
    graphFunctionId: scope.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    runId: scope.runId,
    workKey: scope.workKey,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    continuationId: event.continuationId,
    ref: event.causedByRetryRunId
  });
  const open = constructRuntimeFluent({
    ...terminated,
    name: "continuation_open"
  });
  return completeEffect({
    initiates: [terminated],
    terminates: [open]
  });
}

function continuationReopenedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  assertEventKind(event, "continuation_reopened");
  const scope = eventRuntimeScope(event, context.basis);
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "continuation_open",
        scope: "continuation",
        basisId: event.basisId,
        graphFunctionId: scope.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: scope.runId,
        workKey: scope.workKey,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        continuationId: event.continuationId,
        ref: event.causedByRetryRunId
      })
    ]
  });
}

function resetAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "reset");
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "reset_scope_active",
        scope: "run",
        runId: event.runId,
        workKey: event.workKey,
        edge: event.edge,
        ref: event.reason
      })
    ],
    clips: [resetClipPattern(event)]
  });
}

function temporalPendingFluent(
  event: Extract<RuntimeEvent, { readonly kind: "timer_intent_admitted" }>
): RuntimeFluent {
  return constructRuntimeFluent({
    name: "temporal_timer_pending",
    scope: "temporal",
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    runId: event.runId,
    workKey: event.workKey,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    constraintRef: event.constraintRef,
    timerIntentRef: event.timerIntentRef,
    schedulePolicyRef: event.schedulePolicyRef
  });
}

function timerIntentAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "timer_intent_admitted");
  return completeEffect({
    initiates: [temporalPendingFluent(event)]
  });
}

function timerOutcomeAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  assertEventKind(event, "timer_outcome_admitted");
  const pending = constructRuntimeFluent({
    name: "temporal_timer_pending",
    scope: "temporal",
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    runId: event.runId,
    workKey: event.workKey,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    constraintRef: event.constraintRef,
    timerIntentRef: event.timerIntentRef,
    schedulePolicyRef: event.schedulePolicyRef
  });
  if (event.outcome !== "timer_fired") {
    return completeEffect({
      terminates: [pending]
    });
  }
  const basis = context.basis;
  if (basis === undefined) {
    throw new TypeError("timer_outcome_admitted EC axiom requires ExecutionBasis");
  }
  return completeEffect({
    terminates: [pending],
    initiates: [
      constructRuntimeFluent({
        name: "temporal_timer_fired",
        scope: "temporal",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: event.runId,
        workKey: event.workKey,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        constraintRef: event.constraintRef,
        timerIntentRef: event.timerIntentRef,
        timerOutcomeRef: event.timerOutcomeRef,
        schedulePolicyRef: event.schedulePolicyRef,
        ref: event.providerReceiptRef
      }),
      constructRuntimeFluent({
        name: "temporal_eligible",
        scope: "vector",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: event.runId,
        workKey: event.workKey,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        constraintRef: event.constraintRef,
        timerIntentRef: event.timerIntentRef,
        schedulePolicyRef: event.schedulePolicyRef
      })
    ]
  });
}

function scheduledContinuationReopenedAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "scheduled_continuation_reopened");
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "scheduled_continuation_open",
        scope: "continuation",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: event.runId,
        workKey: event.workKey,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        continuationId: event.scheduledContinuationRef,
        constraintRef: event.constraintRef,
        timerIntentRef: event.timerIntentRef,
        timerOutcomeRef: event.timerOutcomeRef,
        schedulePolicyRef: event.schedulePolicyRef,
        ref: event.scheduledContinuationRef
      })
    ]
  });
}

function deadlineBreachAxiom(
  event: RuntimeEvent,
  context: RuntimeEventCalculusContext
): RuntimeEventCalculusEffect {
  void context;
  assertEventKind(event, "deadline_breach_admitted");
  return completeEffect({
    initiates: [
      constructRuntimeFluent({
        name: "temporal_deadline_breached",
        scope: "temporal",
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        runId: event.runId,
        workKey: event.workKey,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        constraintRef: event.constraintRef,
        schedulePolicyRef: event.schedulePolicyRef,
        ref: event.deadlineBreachRef
      })
    ]
  });
}

export const RUNTIME_EVENT_CALCULUS_AXIOMS = Object.freeze([
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "basis_admitted",
    deriveEffects: basisAdmittedAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "graph_call_opened",
    deriveEffects: graphCallOpenedAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "frame_opened",
    deriveEffects: frameOpenedAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "vector_traversal_planned",
    deriveEffects: (event: RuntimeEvent, context: RuntimeEventCalculusContext) =>
      vectorAxiom(event, context, "vector_traversal_planned")
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "vector_evaluated",
    deriveEffects: (event: RuntimeEvent, context: RuntimeEventCalculusContext) =>
      vectorAxiom(event, context, "vector_evaluated")
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "vector_closed",
    deriveEffects: (event: RuntimeEvent, context: RuntimeEventCalculusContext) =>
      vectorAxiom(event, context, "vector_closed")
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "retry_repair_planned",
    deriveEffects: (event: RuntimeEvent, context: RuntimeEventCalculusContext) =>
      vectorAxiom(event, context, "retry_repair_planned")
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "continuation_terminated",
    deriveEffects: continuationTerminatedAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "continuation_reopened",
    deriveEffects: continuationReopenedAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "reset",
    deriveEffects: resetAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "timer_intent_admitted",
    deriveEffects: timerIntentAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "timer_outcome_admitted",
    deriveEffects: timerOutcomeAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "deadline_breach_admitted",
    deriveEffects: deadlineBreachAxiom
  }),
  Object.freeze({
    kind: "event_calculus_axiom",
    eventKind: "scheduled_continuation_reopened",
    deriveEffects: scheduledContinuationReopenedAxiom
  })
] satisfies readonly RuntimeEventCalculusAxiom[]);

export function admitRuntimeEventCalculusAxioms(
  axioms: readonly RuntimeEventCalculusAxiom[]
): readonly RuntimeEventCalculusAxiom[] {
  const seen = new Set<RuntimeEventKind>();
  const admitted: RuntimeEventCalculusAxiom[] = [];
  for (const axiom of axioms) {
    if (axiom.kind !== "event_calculus_axiom") {
      throw new TypeError("Event Calculus axiom must carry event_calculus_axiom kind");
    }
    assertKnownRuntimeEventKind(axiom.eventKind);
    if (seen.has(axiom.eventKind)) {
      throw new TypeError(
        `Duplicate Event Calculus axiom for ${JSON.stringify(axiom.eventKind)}`
      );
    }
    if (typeof axiom.deriveEffects !== "function") {
      throw new TypeError("Event Calculus axiom requires deriveEffects");
    }
    seen.add(axiom.eventKind);
    admitted.push(axiom);
  }
  return Object.freeze(admitted);
}

function axiomMap(
  axioms: readonly RuntimeEventCalculusAxiom[]
): ReadonlyMap<RuntimeEventKind, RuntimeEventCalculusAxiom> {
  const admitted = admitRuntimeEventCalculusAxioms(axioms);
  return new Map(admitted.map((axiom) => [axiom.eventKind, axiom]));
}

export function runtimeEventCalculusAxiomFor(
  eventKind: string,
  axioms: readonly RuntimeEventCalculusAxiom[] = RUNTIME_EVENT_CALCULUS_AXIOMS
): RuntimeEventCalculusAxiom {
  if (!isNonEmptyString(eventKind)) {
    throw new TypeError("Event Calculus event kind must be non-empty");
  }
  assertKnownRuntimeEventKind(eventKind);
  const found = axiomMap(axioms).get(eventKind);
  if (found === undefined) {
    throw new TypeError(
      `No Event Calculus axiom declared for ${JSON.stringify(eventKind)}`
    );
  }
  return found;
}

export function eventCalculusEffectsForEvent(input: {
  readonly event: RuntimeEvent;
  readonly basis?: ExecutionBasis | undefined;
  readonly axioms?: readonly RuntimeEventCalculusAxiom[] | undefined;
}): RuntimeEventCalculusEffect {
  if (!isNonEmptyString(input.event.kind)) {
    throw new TypeError("Event Calculus event requires non-empty kind");
  }
  assertKnownRuntimeEventKind(input.event.kind);
  if (input.basis !== undefined) {
    assertBasisEvent(input.basis, input.event);
  }
  const axiom = runtimeEventCalculusAxiomFor(
    input.event.kind,
    input.axioms ?? RUNTIME_EVENT_CALCULUS_AXIOMS
  );
  return completeEffect(
    axiom.deriveEffects(input.event, {
      ...(input.basis === undefined ? {} : { basis: input.basis })
    })
  );
}

function projectionFromHoldMap(input: {
  readonly basisId: string | null;
  readonly holds: ReadonlyMap<string, RuntimeFluent>;
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
}): RuntimeEventCalculusProjection {
  return Object.freeze({
    kind: "event_calculus_projection",
    basisId: input.basisId,
    holds: Object.freeze(
      [...input.holds.values()].sort((left, right) =>
        runtimeFluentKey(left).localeCompare(runtimeFluentKey(right))
      )
    ),
    effectRows: Object.freeze([...input.effectRows]),
    clippedFluentRefs: Object.freeze([...input.clippedFluentRefs]),
    declippedPatternRefs: Object.freeze([...input.declippedPatternRefs])
  } satisfies RuntimeEventCalculusProjection);
}

function applyDerivedRules(input: {
  readonly basisId: string | null;
  readonly holds: Map<string, RuntimeFluent>;
  readonly derivedKeys: Set<string>;
  readonly rules: readonly RuntimeDerivedFluentRule[];
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
}): void {
  for (const key of input.derivedKeys) {
    input.holds.delete(key);
  }
  input.derivedKeys.clear();
  const snapshot = projectionFromHoldMap({
    basisId: input.basisId,
    holds: input.holds,
    effectRows: input.effectRows,
    clippedFluentRefs: input.clippedFluentRefs,
    declippedPatternRefs: input.declippedPatternRefs
  });
  for (const rule of input.rules) {
    if (rule.kind !== "derived_fluent_rule") {
      throw new TypeError("Derived fluent rule must carry derived_fluent_rule kind");
    }
    if (!isNonEmptyString(rule.ruleRef)) {
      throw new TypeError("Derived fluent rule requires ruleRef");
    }
    const derived = rule.derive({ holds: snapshot.holds });
    for (const fluent of derived) {
      validateRuntimeFluent(fluent);
      const key = runtimeFluentKey(fluent);
      input.holds.set(key, fluent);
      input.derivedKeys.add(key);
    }
  }
}

export function deriveRuntimeEventCalculusProjection(
  input: RuntimeEventCalculusReplayInput
): RuntimeEventCalculusProjection {
  const axioms = axiomMap(input.axioms ?? RUNTIME_EVENT_CALCULUS_AXIOMS);
  const holds = new Map<string, RuntimeFluent>();
  const effectRows: RuntimeEventCalculusEffectRow[] = [];
  const clippedFluentRefs: string[] = [];
  const declippedPatternRefs: string[] = [];
  const derivedKeys = new Set<string>();
  const basisId = input.basis?.id ?? null;
  const undeclaredEventBehavior = input.undeclaredEventBehavior ?? "reject";
  const derivedRules = Object.freeze([...(input.derivedRules ?? Object.freeze([]))]);

  for (const fluent of input.initiallyP ?? Object.freeze([])) {
    validateRuntimeFluent(fluent);
    holds.set(runtimeFluentKey(fluent), fluent);
  }
  for (const fluent of input.initiallyN ?? Object.freeze([])) {
    validateRuntimeFluent(fluent);
    holds.delete(runtimeFluentKey(fluent));
  }
  applyDerivedRules({
    basisId,
    holds,
    derivedKeys,
    rules: derivedRules,
    effectRows,
    clippedFluentRefs,
    declippedPatternRefs
  });

  for (const event of input.events) {
    if (input.basis !== undefined) {
      assertBasisEvent(input.basis, event);
    }
    if (!isNonEmptyString(event.kind)) {
      throw new TypeError("Event Calculus replay requires non-empty event kind");
    }
    assertKnownRuntimeEventKind(event.kind);
    const axiom = axioms.get(event.kind);
    if (axiom === undefined) {
      if (undeclaredEventBehavior === "ignore") {
        continue;
      }
      throw new TypeError(
        `No Event Calculus axiom declared for ${JSON.stringify(event.kind)}`
      );
    }
    const effect = completeEffect(
      axiom.deriveEffects(event, {
        ...(input.basis === undefined ? {} : { basis: input.basis })
      })
    );
    for (const fluent of effect.terminates) {
      holds.delete(runtimeFluentKey(fluent));
    }
    for (const pattern of effect.clips) {
      for (const [key, fluent] of [...holds.entries()]) {
        if (runtimeFluentMatchesPattern(fluent, pattern)) {
          holds.delete(key);
          clippedFluentRefs.push(key);
        }
      }
    }
    for (const pattern of effect.declips) {
      declippedPatternRefs.push(runtimeFluentPatternKey(pattern));
    }
    for (const fluent of effect.initiates) {
      holds.set(runtimeFluentKey(fluent), fluent);
    }
    const row = Object.freeze({
      kind: "event_calculus_effect_row",
      eventKind: event.kind,
      initiates: effect.initiates,
      terminates: effect.terminates,
      clips: effect.clips,
      declips: effect.declips
    } satisfies RuntimeEventCalculusEffectRow);
    effectRows.push(row);
    applyDerivedRules({
      basisId,
      holds,
      derivedKeys,
      rules: derivedRules,
      effectRows,
      clippedFluentRefs,
      declippedPatternRefs
    });
  }

  return projectionFromHoldMap({
    basisId,
    holds,
    effectRows,
    clippedFluentRefs,
    declippedPatternRefs
  });
}

export const deriveHoldsAt = deriveRuntimeEventCalculusProjection;

export function holdsAt(
  projection: RuntimeEventCalculusProjection,
  fluent: RuntimeFluent
): boolean {
  const key = runtimeFluentKey(fluent);
  return projection.holds.some((candidate) => runtimeFluentKey(candidate) === key);
}

export function eventCalculusEffectInitiates(
  effect: RuntimeEventCalculusEffect,
  fluent: RuntimeFluent
): boolean {
  const key = runtimeFluentKey(fluent);
  return effect.initiates.some((candidate) => runtimeFluentKey(candidate) === key);
}

export function eventCalculusEffectTerminates(
  effect: RuntimeEventCalculusEffect,
  fluent: RuntimeFluent
): boolean {
  const key = runtimeFluentKey(fluent);
  return effect.terminates.some((candidate) => runtimeFluentKey(candidate) === key);
}
