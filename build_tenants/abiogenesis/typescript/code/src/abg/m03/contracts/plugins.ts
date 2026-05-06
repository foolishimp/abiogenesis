// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-EVENTS

import type {
  ActorInvocationRef,
  ExecutionBasis,
  PluginTraversalKind,
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeRegime
} from "./carriers.js";
import type { FpTransformRequest } from "./fp_stages.js";
import { constructFpTransformRequest } from "./fp_stages.js";
import type {
  AbgFallbackBundle,
  PluginTraversalObserverBindingSelection
} from "./plugin_traversal_observer.js";
import {
  tryResolvePluginTraversalObserverBinding
} from "./plugin_traversal_observer.js";
import type {
  TraversalAttemptEnvelope,
  TraversalStrategySelection
} from "./traversal_modulation.js";
import type { RetryFrontierProjection } from "./retry_frontier.js";
import { deriveRetryFrontierProjection } from "./retry_frontier.js";
import {
  parseBoolean,
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  freezeNumberArray,
  freezeStringArray,
  frameIdForBasis,
  graphCallIdForBasis
} from "./runtime_support.js";
import { sourceProjectionRef } from "./projection.js";

export const ENGINE_PLUGIN_KIND_VALUES = Object.freeze([
  "runtime_event_sink",
  "fd_evaluator",
  "fp_dispatch",
  "fh_admission",
  "result_assessment",
  "event_ingress",
  "continuation_repair",
  "policy_provider",
  "assurance_authority_snapshot_provider",
  "assurance_evidence_adapter",
  "assurance_ambiguity_classifier",
  "assurance_closure_policy_provider",
  "assurance_gain_function_adapter",
  "runtime_identity_provider",
  "operator_asset_resolver",
  "context_resolver",
  "projection_consumer",
  "hook_ref"
] as const);

export type EnginePluginKind =
  (typeof ENGINE_PLUGIN_KIND_VALUES)[number];

export const ENGINE_PLUGIN_AUTHORITY_VALUES = Object.freeze([
  "sink",
  "effect_plugin",
  "provider",
  "resolver",
  "projection_consumer",
  "declaration_ref"
] as const);

export type EnginePluginAuthority =
  (typeof ENGINE_PLUGIN_AUTHORITY_VALUES)[number];

export type EnginePluginEventAuthority =
  | "engine_emit_only"
  | "sink_receive_only"
  | "none";

export const ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES = Object.freeze([
  "runner_consumed",
  "public_runtime_consumed",
  "assurance_consumed",
  "engine_law_consumed",
  "read_model_consumed",
  "declarative_contract"
] as const);

export type EnginePluginRuntimeBindingStatus =
  (typeof ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES)[number];

export interface EnginePluginContract {
  readonly kind: "engine_plugin_contract";
  readonly ref: string;
  readonly pluginKind: EnginePluginKind;
  readonly authority: EnginePluginAuthority;
  readonly inputCarrier: string;
  readonly outputCarrier: string;
  readonly eventAuthority: EnginePluginEventAuthority;
  readonly maySelectNextVector: false;
  readonly mayEmitRuntimeEvents: false;
  readonly mayCloseTraversal: false;
  readonly mayOwnIterationLoop: false;
}

export interface EnginePluginInventoryEntry {
  readonly kind: "engine_plugin_inventory_entry";
  readonly contract: EnginePluginContract;
  readonly runtimeBindingStatus: EnginePluginRuntimeBindingStatus;
  readonly proofScope: string;
  readonly engineOwnedLaw: string;
  readonly pluginOwnedScope: string;
  readonly positiveProof: string;
  readonly negativeProof: string;
  readonly collapseFamily: EnginePluginAuthority;
  readonly distinctAuthorityReason: string | null;
}

export interface EnginePluginInput {
  readonly kind: "engine_plugin_input";
  readonly contract: EnginePluginContract;
  readonly basisId: string;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly sourceProjectionRef: string;
  readonly expectedEdge: string | null;
  readonly expectedAssessmentIds: readonly string[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
  readonly retryAttemptRefs: RuntimeAggregateProjection["retryAttemptRefs"];
  readonly retryProgressRefs: RuntimeAggregateProjection["retryProgressRefs"];
  readonly retryFrontier: RetryFrontierProjection;
  readonly actorInvocationRef: ActorInvocationRef | null;
  readonly fpTransformRequest: FpTransformRequest | null;
  readonly pluginTraversalObserverBinding: PluginTraversalObserverBindingSelection | null;
  readonly traversalStrategySelection: TraversalStrategySelection | null;
  readonly traversalAttemptEnvelope: TraversalAttemptEnvelope | null;
}

export interface EnginePluginOutcomeBase {
  readonly evidenceRefs: readonly string[];
  readonly reason: string | null;
}

export interface FdEvaluationOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fd_evaluation";
  readonly status: "accepted" | "blocked";
}

export interface FpDispatchOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fp_dispatch";
  readonly status: "dispatched" | "blocked";
  readonly resultRef: string | null;
  readonly attachedResultArtifact: Readonly<Record<string, unknown>> | null;
}

export interface FhAdmissionOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fh_admission";
  readonly status: "escalated" | "blocked";
}

export type EnginePluginOutcome =
  | FdEvaluationOutcome
  | FpDispatchOutcome
  | FhAdmissionOutcome;

export type EnginePluginMaybePromise<T> = T | Promise<T>;

export interface FdEvaluatorPlugin {
  readonly contract: EnginePluginContract;
  readonly evaluate: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FdEvaluationOutcome>;
}

export interface FpDispatchPlugin {
  readonly contract: EnginePluginContract;
  // The runner emits fp_dispatch_requested before invoking this effect edge.
  readonly dispatch: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FpDispatchOutcome>;
}

export interface FhAdmissionPlugin {
  readonly contract: EnginePluginContract;
  readonly admit: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FhAdmissionOutcome>;
}

export interface EngineRunnerPluginSet {
  readonly fdEvaluator?: FdEvaluatorPlugin;
  readonly fpDispatch?: FpDispatchPlugin;
  readonly fhAdmission?: FhAdmissionPlugin;
}

interface EnginePluginContractInput {
  readonly ref: string;
  readonly pluginKind: EnginePluginKind;
  readonly authority: EnginePluginAuthority;
  readonly inputCarrier: string;
  readonly outputCarrier: string;
  readonly eventAuthority?: EnginePluginEventAuthority | undefined;
  readonly maySelectNextVector?: false | undefined;
  readonly mayEmitRuntimeEvents?: false | undefined;
  readonly mayCloseTraversal?: false | undefined;
  readonly mayOwnIterationLoop?: false | undefined;
}

const FORBIDDEN_OUTCOME_AUTHORITY_FIELDS = Object.freeze([
  "runtimeEvents",
  "events",
  "nextVectorIndex",
  "closedVectorIndexes",
  "transition",
  "closureKind",
  "graphCallId",
  "frameId",
  "vectorIndex",
  "actorInvocationId",
  "actorInvocationRef"
] as const);

function assertPluginKind(kind: string, label: string): EnginePluginKind {
  switch (kind) {
    case "runtime_event_sink":
    case "fd_evaluator":
    case "fp_dispatch":
    case "fh_admission":
    case "result_assessment":
    case "event_ingress":
    case "continuation_repair":
    case "policy_provider":
    case "assurance_authority_snapshot_provider":
    case "assurance_evidence_adapter":
    case "assurance_ambiguity_classifier":
    case "assurance_closure_policy_provider":
    case "assurance_gain_function_adapter":
    case "runtime_identity_provider":
    case "operator_asset_resolver":
    case "context_resolver":
    case "projection_consumer":
    case "hook_ref":
      return kind;
    default:
      throw new TypeError(
        `${label}: expected engine plugin kind, got ${JSON.stringify(kind)}`
      );
  }
}

function assertPluginAuthority(
  authority: string,
  label: string
): EnginePluginAuthority {
  switch (authority) {
    case "sink":
    case "effect_plugin":
    case "provider":
    case "resolver":
    case "projection_consumer":
    case "declaration_ref":
      return authority;
    default:
      throw new TypeError(
        `${label}: expected engine plugin authority, got ${JSON.stringify(authority)}`
      );
  }
}

function assertEventAuthority(
  authority: string,
  label: string
): EnginePluginEventAuthority {
  if (
    authority === "engine_emit_only" ||
    authority === "sink_receive_only" ||
    authority === "none"
  ) {
    return authority;
  }
  throw new TypeError(
    `${label}: expected plugin event authority, got ${JSON.stringify(authority)}`
  );
}

function assertFalseAuthorityFlag(value: unknown, label: string): false {
  if (value === undefined) {
    return false;
  }
  if (parseBoolean(value, label) !== false) {
    throw new TypeError(`${label}: plugin contract cannot own engine authority`);
  }
  return false;
}

function rejectForbiddenOutcomeAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_OUTCOME_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: plugin outcome cannot own engine authority`
      );
    }
  }
}

function normalizeReason(
  input: string | null | undefined,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (input.length === 0) {
    throw new TypeError(`${label} must be non-empty when supplied`);
  }
  return input;
}

function parseOptionalReason(
  input: Readonly<Record<string, unknown>>,
  label: string
): string | null {
  const reason = parseOptionalField(input, "reason");
  if (reason === undefined || reason === null) {
    return null;
  }
  return parseNonEmptyString(reason, `${label}.reason`);
}

function parseOptionalEvidenceRefs(
  input: Readonly<Record<string, unknown>>,
  label: string
): readonly string[] {
  const evidence = parseOptionalField(input, "evidenceRefs");
  if (evidence === undefined) {
    return Object.freeze([]);
  }
  return parseStringArray(evidence, `${label}.evidenceRefs`);
}

function pluginContract(input: EnginePluginContractInput): EnginePluginContract {
  return Object.freeze({
    kind: "engine_plugin_contract",
    ref: input.ref,
    pluginKind: input.pluginKind,
    authority: input.authority,
    inputCarrier: input.inputCarrier,
    outputCarrier: input.outputCarrier,
    eventAuthority: input.eventAuthority ?? "engine_emit_only",
    maySelectNextVector: input.maySelectNextVector ?? false,
    mayEmitRuntimeEvents: input.mayEmitRuntimeEvents ?? false,
    mayCloseTraversal: input.mayCloseTraversal ?? false,
    mayOwnIterationLoop: input.mayOwnIterationLoop ?? false
  });
}

export function constructEnginePluginContract(
  input: EnginePluginContractInput
): EnginePluginContract {
  return pluginContract({
    ref: parseNonEmptyString(input.ref, "EnginePluginContract.ref"),
    pluginKind: assertPluginKind(
      input.pluginKind,
      "EnginePluginContract.pluginKind"
    ),
    authority: assertPluginAuthority(
      input.authority,
      "EnginePluginContract.authority"
    ),
    inputCarrier: parseNonEmptyString(
      input.inputCarrier,
      "EnginePluginContract.inputCarrier"
    ),
    outputCarrier: parseNonEmptyString(
      input.outputCarrier,
      "EnginePluginContract.outputCarrier"
    ),
    eventAuthority:
      input.eventAuthority === undefined
        ? undefined
        : assertEventAuthority(
            input.eventAuthority,
            "EnginePluginContract.eventAuthority"
          ),
    maySelectNextVector: false,
    mayEmitRuntimeEvents: false,
    mayCloseTraversal: false,
    mayOwnIterationLoop: false
  });
}

export function admitEnginePluginContract(
  input: unknown,
  label = "EnginePluginContract"
): EnginePluginContract {
  const contractObject = parsePlainObject(input, label);
  const kind = parseString(contractObject["kind"], `${label}.kind`);
  if (kind !== "engine_plugin_contract") {
    throw new TypeError(
      `${label}.kind: expected "engine_plugin_contract", got ${JSON.stringify(kind)}`
    );
  }
  const eventAuthorityInput = parseOptionalField(contractObject, "eventAuthority");
  return pluginContract({
    ref: parseNonEmptyString(contractObject["ref"], `${label}.ref`),
    pluginKind: assertPluginKind(
      parseString(contractObject["pluginKind"], `${label}.pluginKind`),
      `${label}.pluginKind`
    ),
    authority: assertPluginAuthority(
      parseString(contractObject["authority"], `${label}.authority`),
      `${label}.authority`
    ),
    inputCarrier: parseNonEmptyString(
      contractObject["inputCarrier"],
      `${label}.inputCarrier`
    ),
    outputCarrier: parseNonEmptyString(
      contractObject["outputCarrier"],
      `${label}.outputCarrier`
    ),
    eventAuthority:
      eventAuthorityInput === undefined
        ? "engine_emit_only"
        : assertEventAuthority(
            parseString(eventAuthorityInput, `${label}.eventAuthority`),
            `${label}.eventAuthority`
          ),
    maySelectNextVector: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "maySelectNextVector"),
      `${label}.maySelectNextVector`
    ),
    mayEmitRuntimeEvents: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayEmitRuntimeEvents"),
      `${label}.mayEmitRuntimeEvents`
    ),
    mayCloseTraversal: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayCloseTraversal"),
      `${label}.mayCloseTraversal`
    ),
    mayOwnIterationLoop: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayOwnIterationLoop"),
      `${label}.mayOwnIterationLoop`
    )
  });
}

export function constructEnginePluginInput(input: {
  readonly contract: EnginePluginContract;
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents?: readonly RuntimeEvent[] | undefined;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly actorInvocationRef?: ActorInvocationRef | null | undefined;
  readonly traversalStrategySelection?:
    | TraversalStrategySelection
    | null
    | undefined;
  readonly traversalAttemptEnvelope?: TraversalAttemptEnvelope | null | undefined;
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
}): EnginePluginInput {
  const contract = admitEnginePluginContract(input.contract);
  assertProjectionBasis(input.basis, input.projection, "EnginePluginInput");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("EnginePluginInput requires a graph vector");
  }
  const retryFrontier = deriveRetryFrontierProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    events: input.replayEvents ?? Object.freeze([]),
    vectorIndex: input.vectorIndex
  });
  const normalizedActorInvocationRef =
    input.actorInvocationRef === undefined ||
    input.actorInvocationRef === null
      ? null
      : Object.freeze({
          actorInvocationId: input.actorInvocationRef.actorInvocationId,
          attemptIndex: input.actorInvocationRef.attemptIndex,
          dispatchRef: input.actorInvocationRef.dispatchRef,
          resultRef: input.actorInvocationRef.resultRef
        });
  const pluginTraversalKind: PluginTraversalKind | null =
    input.regime === "F_P"
      ? "transform"
      : input.regime === "F_D"
        ? "eval"
        : null;
  const pluginTraversalObserverBinding =
    pluginTraversalKind !== null
      ? tryResolvePluginTraversalObserverBinding({
          traversalKind: pluginTraversalKind,
          vector,
          graphFunction: input.basis.graphFunction,
          roles: input.basis.job.roles,
          defaultsBundle: input.abgFallbackBundle ?? null,
          fallbackEnabled:
            input.pluginTraversalObserverFallbackKinds?.includes(
              pluginTraversalKind
            ) ??
            input.pluginTraversalObserverFallbackEnabled ??
            false
        })
      : null;
  const fpTransformRequest =
    input.regime === "F_P" && normalizedActorInvocationRef !== null
      ? constructFpTransformRequest({
          basis: input.basis,
          projection: input.projection,
          vectorIndex: input.vectorIndex,
          edge: input.edge,
          actorInvocationRef: normalizedActorInvocationRef,
          sourceProjectionRef: sourceProjectionRef(input.projection),
          expectedAssessmentIds: vector.evaluators.map(
            (evaluator) => evaluator.name
          ),
          retryFrontier,
          pluginTraversalObserverBinding
        })
      : null;
  return Object.freeze({
    kind: "engine_plugin_input",
    contract,
    basisId: input.basis.id,
    graphCallId: input.projection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.projection.frameId ?? frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    jobId: input.basis.job.id,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    regime: input.regime,
    sourceProjectionRef: sourceProjectionRef(input.projection),
    expectedEdge: input.edge,
    expectedAssessmentIds: freezeStringArray(
      vector.evaluators.map((evaluator) => evaluator.name)
    ),
    closedVectorIndexes: freezeNumberArray(input.projection.closedVectorIndexes),
    assessedEdges: freezeStringArray(input.projection.assessedEdges),
    retryAttemptRefs: Object.freeze([...input.projection.retryAttemptRefs]),
    retryProgressRefs: Object.freeze([...input.projection.retryProgressRefs]),
    retryFrontier,
    actorInvocationRef: normalizedActorInvocationRef,
    fpTransformRequest,
    pluginTraversalObserverBinding,
    traversalStrategySelection: input.traversalStrategySelection ?? null,
    traversalAttemptEnvelope: input.traversalAttemptEnvelope ?? null
  });
}

export function constructFdEvaluationOutcome(input: {
  readonly status: FdEvaluationOutcome["status"];
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FdEvaluationOutcome {
  return Object.freeze({
    kind: "fd_evaluation",
    status: input.status,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FdEvaluationOutcome.reason")
  });
}

export function constructFpDispatchOutcome(input: {
  readonly status: FpDispatchOutcome["status"];
  readonly resultRef?: string | null;
  readonly attachedResultArtifact?: Readonly<Record<string, unknown>> | null;
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FpDispatchOutcome {
  return Object.freeze({
    kind: "fp_dispatch",
    status: input.status,
    resultRef: normalizeReason(input.resultRef, "FpDispatchOutcome.resultRef"),
    attachedResultArtifact:
      input.attachedResultArtifact === undefined ||
      input.attachedResultArtifact === null
        ? null
        : parsePlainObject(
            input.attachedResultArtifact,
            "FpDispatchOutcome.attachedResultArtifact"
          ),
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FpDispatchOutcome.reason")
  });
}

export function constructFhAdmissionOutcome(input: {
  readonly status: FhAdmissionOutcome["status"];
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FhAdmissionOutcome {
  return Object.freeze({
    kind: "fh_admission",
    status: input.status,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FhAdmissionOutcome.reason")
  });
}

export function admitFdEvaluationOutcome(
  input: unknown,
  label = "FdEvaluationOutcome"
): FdEvaluationOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fd_evaluation") {
    throw new TypeError(
      `${label}.kind: expected "fd_evaluation", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "accepted" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected accepted or blocked, got ${JSON.stringify(status)}`
    );
  }
  return constructFdEvaluationOutcome({
    status,
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

export function admitFpDispatchOutcome(
  input: unknown,
  label = "FpDispatchOutcome"
): FpDispatchOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fp_dispatch") {
    throw new TypeError(
      `${label}.kind: expected "fp_dispatch", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "dispatched" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected dispatched or blocked, got ${JSON.stringify(status)}`
    );
  }
  const resultRef = parseOptionalField(outcomeObject, "resultRef");
  const attachedResultArtifact = parseOptionalField(
    outcomeObject,
    "attachedResultArtifact"
  );
  return constructFpDispatchOutcome({
    status,
    resultRef:
      resultRef === undefined || resultRef === null
        ? null
        : parseNonEmptyString(resultRef, `${label}.resultRef`),
    attachedResultArtifact:
      attachedResultArtifact === undefined || attachedResultArtifact === null
        ? null
        : parsePlainObject(
            attachedResultArtifact,
            `${label}.attachedResultArtifact`
          ),
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

export function admitFhAdmissionOutcome(
  input: unknown,
  label = "FhAdmissionOutcome"
): FhAdmissionOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fh_admission") {
    throw new TypeError(
      `${label}.kind: expected "fh_admission", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "escalated" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected escalated or blocked, got ${JSON.stringify(status)}`
    );
  }
  return constructFhAdmissionOutcome({
    status,
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

const runtimeEventSinkContract = constructEnginePluginContract({
  ref: "plugin://abg/runtime-event-sink",
  pluginKind: "runtime_event_sink",
  authority: "sink",
  inputCarrier: "RuntimeEvent",
  outputCarrier: "void",
  eventAuthority: "sink_receive_only"
});

const fdEvaluatorContract = constructEnginePluginContract({
  ref: "plugin://abg/fd-evaluator",
  pluginKind: "fd_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FdEvaluationOutcome"
});

const fpDispatchContract = constructEnginePluginContract({
  ref: "plugin://abg/fp-dispatch",
  pluginKind: "fp_dispatch",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpDispatchOutcome"
});

const fhAdmissionContract = constructEnginePluginContract({
  ref: "plugin://abg/fh-admission",
  pluginKind: "fh_admission",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FhAdmissionOutcome"
});

const inventoryInputs = Object.freeze([
  {
    contract: runtimeEventSinkContract,
    engineOwnedLaw: "ABG emits admitted runtime events and preserves append-only truth.",
    pluginOwnedScope: "Receive event effects such as append, stream, mirror, or observe.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.runtime_event_sink.positive",
    negativeProof: "t072-m03-plugin-contract-negative.runtime_event_sink.authority",
    distinctAuthorityReason: "Sink receives events after ABG admission; it does not produce plugin outcomes."
  },
  {
    contract: fdEvaluatorContract,
    engineOwnedLaw: "ABG selects the vector, admits F_D output, emits evaluation/closure, and repeats.",
    pluginOwnedScope: "Run deterministic checks and return accepted or blocked.",
    positiveProof: "test_m03_engine_owned_iterate_runner_unit.fd_evaluator.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fd_evaluator.authority",
    distinctAuthorityReason: null
  },
  {
    contract: fpDispatchContract,
    engineOwnedLaw: "ABG selects the vector, binds one actor invocation to one F_P dispatch attempt, and publishes runtime truth.",
    pluginOwnedScope: "Run or bind the external probabilistic worker effect for the supplied invocation.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.fp_dispatch.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fp_dispatch.authority",
    distinctAuthorityReason: null
  },
  {
    contract: fhAdmissionContract,
    engineOwnedLaw: "ABG selects the vector and publishes human-gate-required runtime truth.",
    pluginOwnedScope: "Bind the human approval or escalation surface.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.fh_admission.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fh_admission.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/result-assessment",
      pluginKind: "result_assessment",
      authority: "effect_plugin",
      inputCarrier: "ResultArtifact",
      outputCarrier: "ResultIngestOutcome"
    }),
    engineOwnedLaw: "ABG admits result truth before it can affect replay-derived closure.",
    pluginOwnedScope: "Parse or fetch external result artifacts.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.result_assessment.positive",
    negativeProof: "t072-m03-plugin-contract-negative.result_assessment.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/event-ingress",
      pluginKind: "event_ingress",
      authority: "provider",
      inputCarrier: "ExternalEventEnvelope",
      outputCarrier: "RuntimeEventCandidate"
    }),
    engineOwnedLaw: "ABG admission decides whether external event candidates enter runtime truth.",
    pluginOwnedScope: "Provide external event envelopes.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.event_ingress.positive",
    negativeProof: "t072-m03-plugin-contract-negative.event_ingress.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/continuation-repair",
      pluginKind: "continuation_repair",
      authority: "effect_plugin",
      inputCarrier: "RetryRepairDecision",
      outputCarrier: "RetryRepairPluginOutcome"
    }),
    engineOwnedLaw: "ABG owns retry budget, continuation termination, reopen identity, and repair events.",
    pluginOwnedScope: "Perform external repair effects requested by ABG decision carriers.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.continuation_repair.positive",
    negativeProof: "t072-m03-plugin-contract-negative.continuation_repair.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/policy-provider",
      pluginKind: "policy_provider",
      authority: "provider",
      inputCarrier: "StartIntent",
      outputCarrier: "ResolvedPolicyIdentity"
    }),
    engineOwnedLaw: "ABG admits resolved policy before it can bind traversal regime.",
    pluginOwnedScope: "Provide policy bundles from domain configuration or runtime substrate.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.policy_provider.positive",
    negativeProof: "t072-m03-plugin-contract-negative.policy_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-authority-snapshot-provider",
      pluginKind: "assurance_authority_snapshot_provider",
      authority: "provider",
      inputCarrier: "AssuranceScopeRef",
      outputCarrier: "AssuranceAuthoritySnapshot"
    }),
    engineOwnedLaw: "ABG admits authority/input snapshots and owns digest-bound assurance projection.",
    pluginOwnedScope: "Provide current authority and input snapshot refs for one assurance scope.",
    positiveProof: "test_t092_total_assurance_projection_unit.authority_snapshot_provider.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.authority_snapshot_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-evidence-adapter",
      pluginKind: "assurance_evidence_adapter",
      authority: "provider",
      inputCarrier: "TraversalEnvelopeView",
      outputCarrier: "AssuranceEvidenceRow"
    }),
    engineOwnedLaw: "ABG admits evidence rows from current runtime truth and owns row classification.",
    pluginOwnedScope: "Adapt admitted runtime facts into evidence candidates.",
    positiveProof: "test_t092_total_assurance_projection_unit.evidence_adapter.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.evidence_adapter.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-ambiguity-classifier",
      pluginKind: "assurance_ambiguity_classifier",
      authority: "provider",
      inputCarrier: "AssuranceAuthoritySnapshot + AssuranceEvidenceRow",
      outputCarrier: "AssuranceAmbiguityRow"
    }),
    engineOwnedLaw: "ABG owns the closed ambiguity vocabulary, total row projection, and precedence.",
    pluginOwnedScope: "Propose domain-aware classification for admitted authority/evidence inputs.",
    positiveProof: "test_t092_total_assurance_projection_unit.ambiguity_classifier.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.ambiguity_classifier.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-closure-policy-provider",
      pluginKind: "assurance_closure_policy_provider",
      authority: "provider",
      inputCarrier: "AssuranceProjection",
      outputCarrier: "AssuranceClosurePolicy"
    }),
    engineOwnedLaw: "ABG folds assurance rows into one closure decision.",
    pluginOwnedScope: "Provide retry, reprice, block, and defer policy values.",
    positiveProof: "test_t092_total_assurance_projection_unit.closure_policy_provider.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.closure_policy_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-gain-function-adapter",
      pluginKind: "assurance_gain_function_adapter",
      authority: "provider",
      inputCarrier: "AssuranceEvidenceRow",
      outputCarrier: "GainSignal"
    }),
    engineOwnedLaw: "ABG admits gain signals as evidence inputs without letting them close scopes.",
    pluginOwnedScope: "Provide downstream domain gain signals or scoring.",
    positiveProof: "test_t092_total_assurance_projection_unit.gain_function_adapter.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.gain_function_adapter.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/runtime-identity-provider",
      pluginKind: "runtime_identity_provider",
      authority: "provider",
      inputCarrier: "StartIntent",
      outputCarrier: "ResolvedRuntimeIdentity"
    }),
    engineOwnedLaw: "ABG admits runtime identity before event, projection, or dispatch binding.",
    pluginOwnedScope: "Provide worker/backend/build identity from runtime substrate.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.runtime_identity_provider.positive",
    negativeProof: "t072-m03-plugin-contract-negative.runtime_identity_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/operator-asset-resolver",
      pluginKind: "operator_asset_resolver",
      authority: "resolver",
      inputCarrier: "OperatorAssetQueryContract",
      outputCarrier: "OperatorAssetResolution"
    }),
    engineOwnedLaw: "ABG consumes admitted asset resolution without learning domain asset layout.",
    pluginOwnedScope: "Resolve operator assets from a domain-owned store or projection.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.operator_asset_resolver.positive",
    negativeProof: "t072-m03-plugin-contract-negative.operator_asset_resolver.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/context-resolver",
      pluginKind: "context_resolver",
      authority: "resolver",
      inputCarrier: "ContextRef",
      outputCarrier: "ResolvedContext"
    }),
    engineOwnedLaw: "ABG consumes admitted context snapshots and keeps traversal authority.",
    pluginOwnedScope: "Resolve workspace, registry, event, or external context references.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.context_resolver.positive",
    negativeProof: "t072-m03-plugin-contract-negative.context_resolver.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/projection-consumer",
      pluginKind: "projection_consumer",
      authority: "projection_consumer",
      inputCarrier: "RuntimeAggregateProjection",
      outputCarrier: "ProjectionReadModel",
      eventAuthority: "none"
    }),
    engineOwnedLaw: "ABG projections are replay-derived read models.",
    pluginOwnedScope: "Consume projections for gaps, live status, dashboards, or reporting.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.projection_consumer.positive",
    negativeProof: "t072-m03-plugin-contract-negative.projection_consumer.authority",
    distinctAuthorityReason: "Projection consumers are read-model observers, not effect plugins."
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/hook-ref",
      pluginKind: "hook_ref",
      authority: "declaration_ref",
      inputCarrier: "GtlHookRef",
      outputCarrier: "EnginePluginContract",
      eventAuthority: "none"
    }),
    engineOwnedLaw: "ABG treats GTL hook references as declarations until resolved through a contract.",
    pluginOwnedScope: "Declare a hook target without executable hidden controller authority.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.hook_ref.positive",
    negativeProof: "t072-m03-plugin-contract-negative.hook_ref.authority",
    distinctAuthorityReason: "GTL hook refs are declarations, not runtime implementation callbacks."
  }
] as const);

function runtimeBindingStatusFor(
  pluginKind: EnginePluginKind
): EnginePluginRuntimeBindingStatus {
  switch (pluginKind) {
    case "runtime_event_sink":
    case "fd_evaluator":
    case "fp_dispatch":
    case "fh_admission":
      return "runner_consumed";
    case "result_assessment":
    case "event_ingress":
    case "policy_provider":
    case "runtime_identity_provider":
    case "operator_asset_resolver":
      return "public_runtime_consumed";
    case "assurance_authority_snapshot_provider":
    case "assurance_evidence_adapter":
    case "assurance_ambiguity_classifier":
    case "assurance_closure_policy_provider":
    case "assurance_gain_function_adapter":
      return "assurance_consumed";
    case "continuation_repair":
      return "engine_law_consumed";
    case "projection_consumer":
      return "read_model_consumed";
    case "context_resolver":
    case "hook_ref":
      return "declarative_contract";
    default: {
      const exhaustive: never = pluginKind;
      throw new TypeError(`Unsupported engine plugin kind ${JSON.stringify(exhaustive)}`);
    }
  }
}

function proofScopeFor(pluginKind: EnginePluginKind): string {
  const status = runtimeBindingStatusFor(pluginKind);
  switch (status) {
    case "runner_consumed":
      return "runner consumer proof";
    case "public_runtime_consumed":
      return "public runtime consumer proof";
    case "assurance_consumed":
      return "assurance projection provider proof";
    case "engine_law_consumed":
      return "engine-owned law proof; extension effects remain downstream";
    case "read_model_consumed":
      return "replay-derived read-model consumer proof";
    case "declarative_contract":
      return "declarative contract proof; no executable plugin authority in current TS surface";
    default: {
      const exhaustive: never = status;
      throw new TypeError(
        `Unsupported engine plugin runtime binding status ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

const inventoryEntries: readonly EnginePluginInventoryEntry[] = Object.freeze(
  inventoryInputs.map((entry) =>
    Object.freeze({
      kind: "engine_plugin_inventory_entry",
      contract: entry.contract,
      runtimeBindingStatus: runtimeBindingStatusFor(entry.contract.pluginKind),
      proofScope: proofScopeFor(entry.contract.pluginKind),
      engineOwnedLaw: entry.engineOwnedLaw,
      pluginOwnedScope: entry.pluginOwnedScope,
      positiveProof: entry.positiveProof,
      negativeProof: entry.negativeProof,
      collapseFamily: entry.contract.authority,
      distinctAuthorityReason: entry.distinctAuthorityReason
    })
  )
);

export function enginePluginInventory(): readonly EnginePluginInventoryEntry[] {
  return inventoryEntries;
}

export const defaultFdEvaluatorPlugin: FdEvaluatorPlugin = Object.freeze({
  contract: fdEvaluatorContract,
  evaluate: (input: EnginePluginInput): FdEvaluationOutcome =>
    constructFdEvaluationOutcome({
      status: "accepted",
      evidenceRefs: [input.sourceProjectionRef]
    })
});

export const defaultFpDispatchPlugin: FpDispatchPlugin = Object.freeze({
  contract: fpDispatchContract,
  dispatch: (input: EnginePluginInput): FpDispatchOutcome =>
    constructFpDispatchOutcome({
      status: "dispatched",
      resultRef: `result:fp_dispatch:${JSON.stringify({
        basisId: input.basisId,
        edge: input.edge
      })}`,
      evidenceRefs: [input.sourceProjectionRef]
    })
});

export const defaultFhAdmissionPlugin: FhAdmissionPlugin = Object.freeze({
  contract: fhAdmissionContract,
  admit: (input: EnginePluginInput): FhAdmissionOutcome =>
    constructFhAdmissionOutcome({
      status: "escalated",
      reason: "human gate required",
      evidenceRefs: [input.sourceProjectionRef]
    })
});
