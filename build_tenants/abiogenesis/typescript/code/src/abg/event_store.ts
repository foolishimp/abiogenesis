import {
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  ftruncateSync,
  linkSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
  unlinkSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export const ROOT_EVENT_KIND_VALUES = [
  "public_operation_artifact_admitted",
  "public_operation_admitted",
  "registry_entry_admitted",
  "invocation_admitted",
  "invocation_refused",
  "implementation_admitted",
  "basis_admitted",
  "run_segment_opened",
  "graph_call_opened",
  "frame_opened",
  "traversal_cursor_entered",
  "c_call_opened",
  "c_call_fibre_selected",
  "actor_transport_binding_admitted",
  "actor_invocation_started",
  "actor_process_started",
  "actor_process_spawn_failed",
  "actor_process_stdout_observed",
  "actor_process_stderr_observed",
  "actor_process_timeout_observed",
  "actor_process_signal_requested",
  "actor_process_exited",
  "actor_process_termination_unconfirmed",
  "actor_result_artifact_observed",
  "actor_invocation_closed",
  "actor_invocation_failed",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged",
  "retry_attempt_opened",
  "retry_progress_recorded",
  "child_foldback_admitted",
  "child_preparation_refused",
  "fan_out_completion_admitted",
  "traversal_route_admitted",
  "construction_intent_selected",
  "construction_delta_observed",
  "fh_interaction_opened",
  "fh_interaction_responded",
  "fh_interaction_resume_admitted",
  "runtime_failure_observed",
  "run_stopped",
  "terminal_reached",
  "frame_closed",
  "graph_call_closed",
  "run_closed",
] as const;

export type RootEventKind = (typeof ROOT_EVENT_KIND_VALUES)[number];

const ROOT_EVENT_AGGREGATE_TYPE_VALUES = [
  "actor_invocation",
  "c_call",
  "continuation",
  "frame",
  "graph_call",
  "process",
  "run",
  "transport_binding",
  "workspace",
] as const;

type RootEventAggregateType =
  (typeof ROOT_EVENT_AGGREGATE_TYPE_VALUES)[number];

type RootEventEnvelopeIdentity =
  | "frameId"
  | "frameLineageId"
  | "graphCallId"
  | "graphFunctionRef"
  | "materializationRef"
  | "runId";

interface RootEventContractVariant {
  readonly aggregateType: RootEventAggregateType;
  readonly scopeClass: "run" | "workspace";
  readonly requiredEnvelopeIdentities: readonly RootEventEnvelopeIdentity[];
  readonly payloadVariantIndexes?: readonly number[];
}

interface RootEventPayloadVariant {
  readonly requiredPayloadKeys: readonly string[];
  readonly allowedPayloadKeys: readonly string[];
  readonly expectedPayload?: Readonly<Record<string, string>>;
  readonly nullablePayloadKeys?: readonly string[];
}

interface RootEventContract {
  readonly variants: readonly RootEventContractVariant[];
  readonly payloadVariants: readonly RootEventPayloadVariant[];
}

const payloadKeys = (value: string): readonly string[] =>
  Object.freeze(value.trim().split(/\s+/u));

const combinePayloadKeys = (
  ...sets: readonly (readonly string[])[]
): readonly string[] => Object.freeze([...new Set(sets.flat())]);

const payloadVariant = (
  allowedPayloadKeys: readonly string[],
  requiredPayloadKeys: readonly string[] = allowedPayloadKeys,
  expectedPayload?: Readonly<Record<string, string>>,
  nullablePayloadKeys?: readonly string[],
): RootEventPayloadVariant => Object.freeze({
  allowedPayloadKeys,
  requiredPayloadKeys,
  ...(expectedPayload === undefined
    ? {}
    : { expectedPayload: Object.freeze(expectedPayload) }),
  ...(nullablePayloadKeys === undefined
    ? {}
    : { nullablePayloadKeys: Object.freeze(nullablePayloadKeys) }),
});

const coupledContractVariant = (
  variant: RootEventContractVariant,
  payloadVariantIndexes: readonly number[],
): RootEventContractVariant => Object.freeze({
  ...variant,
  payloadVariantIndexes: Object.freeze(payloadVariantIndexes),
});

const WORKSPACE_EVENT = Object.freeze({
  aggregateType: "workspace" as const,
  scopeClass: "workspace" as const,
  requiredEnvelopeIdentities: Object.freeze([]),
});
const RUN_EVENT = Object.freeze({
  aggregateType: "run" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze(["runId"] as const),
});
const GRAPH_CALL_EVENT = Object.freeze({
  aggregateType: "graph_call" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
  ] as const),
});
const FRAME_EVENT = Object.freeze({
  aggregateType: "frame" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});
const C_CALL_EVENT = Object.freeze({
  aggregateType: "c_call" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});
const ACTOR_INVOCATION_EVENT = Object.freeze({
  aggregateType: "actor_invocation" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});
const PROCESS_EVENT = Object.freeze({
  aggregateType: "process" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});
const TRANSPORT_BINDING_EVENT = Object.freeze({
  aggregateType: "transport_binding" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});
const CONTINUATION_EVENT = Object.freeze({
  aggregateType: "continuation" as const,
  scopeClass: "run" as const,
  requiredEnvelopeIdentities: Object.freeze([
    "runId",
    "graphCallId",
    "frameId",
  ] as const),
});

const IMPLEMENTATION_SET_PAYLOAD = payloadKeys(
  "implementationSet implementationSetDigest implementationSetRef interactionSet interactionSetDigest interactionSetRef",
);
const LEGACY_IMPLEMENTATION_PAYLOAD = payloadKeys(
  "catalogViewDigest catalogViewId computeRegime failureContractRef graphFunctionDigest graphFunctionRef graphValidationDigest graphValidationRef implementationBindingDigest implementationBindingRef implementationDescriptorDigest implementationRef inputContractRef modulePath namedSymbol nodeRef outputContractRef packageName packageVersion programValidationRef publicationDigest refusalContractRef resolutionCandidateDigest resolutionCandidateRef resolutionDigest resolutionRef resolutionValidationDigest resolutionValidationRef",
);
const BASIS_PAYLOAD = payloadKeys(
  "actionCatalogDigest actionCatalogRef actionCatalogRows actorRef basisClass basisDigest basisRef catalogViewDigest catalogViewId closureContractDigest closureContractRef constructionComposition constructionCompositionDigest constructionCompositionRef entryRef evidenceContractRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef implementationResolutionRef implementationSetDigest implementationSetRef interactionSetDigest interactionSetRef invocationAdmissionRef invocationDigest invocationRef judgmentContractRef localExecutableLeafKeys localImplementationSubsetDigest localInteractionLeafKeys localInteractionSubsetDigest parentExecutionBasisRef parentTraversalScopeRef programDigest programRef programValidationRef rawInputAdmissionRef rawInputDigest refusalContractRef refusalValueKind rejectionContractRef replayProjectionRef resultContractRef rootImplementationSetDigest rootImplementationSetRef rootInteractionSetDigest rootInteractionSetRef terminalKind terminalPredicateRef transitionContractRef workspaceBindingDigest workspaceBindingId",
);
const GRAPH_OPEN_PAYLOAD = payloadKeys(
  "executionBasisRef graphCallDigest graphCallId graphDigest graphFunctionDigest graphFunctionRef graphRef invocationRef runId",
);
const FRAME_OPEN_PAYLOAD = payloadKeys(
  "admittedInputDigest admittedInputRef attempt executionBasisRef frameDigest frameId frameLineageId graphCallId invocationRef parentFrameId runId",
);
const C_CALL_OPEN_PAYLOAD = payloadKeys(
  "attempt basisId batchRef cCallDigest cCallRef callClass edgeRef frameId graphCallId graphFunctionRef programLocusRef retryPath stageRole taskOrdinal vectorIndex",
);
const C_CALL_FIBRE_PAYLOAD = payloadKeys(
  "actorCapabilityRef armId cCallRef callClass compositionRef continuationContractRef implementationBindingRef implementationRef implementationRequirementKey implementationSetRef interactionKind interactionRequirementKey interactionSetRef regime requestContractRef responseContractRef",
);
const PROCESS_STREAM_PAYLOAD = payloadKeys(
  "actorInvocationRef byteLength chunkDigest processRef streamOrdinal",
);
const ACTOR_TERMINAL_PAYLOAD = payloadKeys(
  "actorInvocationRef cCallRef disposition failureClass processRef transportBindingDigest transportBindingRef",
);
const ACTOR_OBSERVATION_PAYLOAD = payloadKeys(
  "actorInvocationRef actorRef apiRetryCount artifactDigests cCallRef disposition exitObserved failureClass finalOutput implementationRef inputDigest instructionContractRef materializationPlanRef observedOutputDigest processRef processSignal processStatus progressEventCount promptDigest rendererRef resultContractRef signalSequence stderrByteLength stdoutByteLength structuredEventCount terminationConfirmed timedOut toolCallCount transportBindingDigest transportBindingRef transportDigest transportLane workerBindingRef",
);
const EVIDENCE_PAYLOAD = payloadKeys(
  "cCallRef contractRef evidenceClass evidenceDigest evidenceRef",
);
const EVIDENCE_IO_PAYLOAD = combinePayloadKeys(
  EVIDENCE_PAYLOAD,
  payloadKeys("implementationRef inputDigest outputDigest"),
);
const FOLDBACK_PAYLOAD = payloadKeys(
  "childClosureRef childDisposition childExecutionBasisDigest childExecutionBasisRef childFrameId childGraphCallId childJudgmentRef childReasonRef childResultDigest childResultRef childTerminalEventRef foldbackDigest foldbackRef outputDigest parentCCallRef",
);
const FAN_OUT_PAYLOAD = payloadKeys(
  "applicationRef batchRef completionDigest completionKind completionRef inputMemberContractRef inputVectorRef outputMemberContractRef outputVectorContractRef",
);
const ROUTE_PAYLOAD = payloadKeys(
  "cCallRef consumedAvailabilityRefs contractRef declarationDigest declarationRef graphSpanReentryProjection graphSpanReentryProjectionDigest graphSpanReentryProjectionRef judgmentRef nextActionProjection nextActionProjectionDigest nextActionProjectionRef replayStateDigest routeDigest routeKind routeRef sourceCursorDigest sourceCursorRef targetCursorDigest targetCursorRef",
);
const TERMINAL_PAYLOAD = payloadKeys(
  "cCallRef closureContractDigest closureContractRef closureDigest closureRef judgmentRef resultRef routeRef terminalKind",
);

const ROOT_EVENT_CONTRACTS = Object.freeze({
  public_operation_artifact_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "artifactDigest artifactRef authorityScopeDigest authorityScopeRef causationEventRefs correlationId definitionDigest definitionKey invocationDigest invocationPayloadDigest invocationRef operationId ownerAdmittedDisposition",
      ),
      payloadKeys("operationId artifactRef artifactDigest"),
    )],
  },
  public_operation_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs catalogViewId definitionDigest definitionKey graphFunctionRef invocationDigest invocationRef operationId policyDigest policyRef programRef variant workspaceBindingId",
        ),
        payloadKeys("operationId invocationRef invocationDigest variant"),
      ),
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs catalogViewId continuationRef definitionDigest definitionKey graphFunctionRef invocationDigest invocationRef operationId policyDigest policyRef programRef variant workspaceBindingId",
        ),
        payloadKeys(
          "operationId invocationRef invocationDigest variant continuationRef",
        ),
      ),
    ],
  },
  registry_entry_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "candidateId catalogId handle operationId rowDigest rowDisposition",
      ),
      payloadKeys("operationId handle rowDigest rowDisposition"),
    )],
  },
  invocation_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "actorRef authorityDigest authorityRef capabilityGrantRefs catalogViewDigest catalogViewId graphFunctionDigest graphFunctionRef inputContractRef invocationAdmissionDigest invocationAdmissionRef invocationDigest invocationRef invocationVariant outputContractRef policyDigest policyRef programDigest programRef programValidationDigest programValidationRef publicRequestAdmissionRef publicRequestDigest publicRequestInvocationRef publicStart rawInputAdmissionRef rawInputDigest reentryBasis workspaceBindingDigest workspaceBindingId",
      ),
      payloadKeys(
        "invocationAdmissionRef invocationAdmissionDigest invocationRef reentryBasis",
      ),
      undefined,
      payloadKeys("publicStart reentryBasis"),
    )],
  },
  invocation_refused: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "contractOrDiagnosticRefs invocationAdmissionRef refusalDigest refusalRef stage subjectDigest",
      ),
      payloadKeys("refusalRef refusalDigest stage"),
    )],
  },
  implementation_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [
      payloadVariant(
        IMPLEMENTATION_SET_PAYLOAD,
        payloadKeys(
          "implementationSetRef implementationSetDigest interactionSetRef interactionSetDigest",
        ),
      ),
      payloadVariant(
        combinePayloadKeys(
          IMPLEMENTATION_SET_PAYLOAD,
          LEGACY_IMPLEMENTATION_PAYLOAD,
        ),
        payloadKeys(
          "implementationSetRef implementationSetDigest interactionSetRef interactionSetDigest implementationBindingRef",
        ),
      ),
    ],
  },
  basis_admitted: {
    variants: [
      coupledContractVariant(WORKSPACE_EVENT, [0]),
      coupledContractVariant(FRAME_EVENT, [1]),
    ],
    payloadVariants: [
      payloadVariant(
        BASIS_PAYLOAD,
        payloadKeys("basisRef basisDigest basisClass"),
        { basisClass: "root" },
      ),
      payloadVariant(
        BASIS_PAYLOAD,
        payloadKeys("basisRef basisDigest basisClass"),
        { basisClass: "child" },
      ),
    ],
  },
  run_segment_opened: {
    variants: [RUN_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "executionBasisDigest executionBasisRef graphDigest graphFunctionRef graphRef invocationAdmissionRef invocationRef programRef runDigest runId workspaceBindingId",
      ),
      payloadKeys(
        "executionBasisDigest executionBasisRef graphDigest graphFunctionRef graphRef invocationAdmissionRef invocationRef programRef runDigest runId workspaceBindingId",
      ),
    )],
  },
  graph_call_opened: {
    variants: [
      coupledContractVariant(GRAPH_CALL_EVENT, [0, 1]),
    ],
    payloadVariants: [
      payloadVariant(
        GRAPH_OPEN_PAYLOAD,
        payloadKeys("graphCallId graphCallDigest"),
      ),
      payloadVariant(
        combinePayloadKeys(GRAPH_OPEN_PAYLOAD, payloadKeys("parentFrameId")),
        payloadKeys("graphCallId graphCallDigest parentFrameId"),
      ),
    ],
  },
  frame_opened: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      FRAME_OPEN_PAYLOAD,
      payloadKeys("frameId frameDigest frameLineageId attempt parentFrameId"),
    )],
  },
  traversal_cursor_entered: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "attempt cursorDigest cursorRef executionBasisDigest executionBasisRef graphFunctionDigest graphFunctionRef inputDigest inputRef materializationDigest materializationRef programDigest programRef retryPath taskOrdinal termPath traversalScopeDigest traversalScopeRef",
      ),
      payloadKeys("cursorRef cursorDigest"),
    )],
  },
  c_call_opened: {
    variants: [C_CALL_EVENT],
    payloadVariants: [
      payloadVariant(
        C_CALL_OPEN_PAYLOAD,
        payloadKeys("cCallRef cCallDigest callClass"),
        { callClass: "leaf" },
      ),
      payloadVariant(
        combinePayloadKeys(
          C_CALL_OPEN_PAYLOAD,
          payloadKeys("childGraphFunctionRef failureContractRef"),
        ),
        payloadKeys(
          "cCallRef cCallDigest callClass childGraphFunctionRef failureContractRef",
        ),
        { callClass: "workflow" },
      ),
    ],
  },
  c_call_fibre_selected: {
    variants: [C_CALL_EVENT],
    payloadVariants: [
      payloadVariant(
        C_CALL_FIBRE_PAYLOAD,
        payloadKeys("cCallRef callClass armId regime"),
        { callClass: "leaf" },
      ),
      payloadVariant(
        combinePayloadKeys(
          C_CALL_FIBRE_PAYLOAD,
          payloadKeys("childGraphFunctionRef"),
        ),
        payloadKeys("cCallRef callClass armId regime childGraphFunctionRef"),
        { callClass: "workflow" },
      ),
    ],
  },
  actor_transport_binding_admitted: {
    variants: [TRANSPORT_BINDING_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "actorRef agentKey archiveRoot args cCallRef command cwd dispatchOrdinal environmentDigest environmentPolicyDigest implementationBindingRef implementationRef inputDigest lane parser paths promptDigest promptTransport responseJsonSchemaDigest terminationGraceMs timeoutMs transportBindingDigest transportBindingRef transportContractDigest transportPlanDigest workerBindingRef",
      ),
      payloadKeys(
        "transportBindingRef transportBindingDigest cCallRef",
      ),
    )],
  },
  actor_invocation_started: {
    variants: [ACTOR_INVOCATION_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "actorInvocationRef actorRef cCallRef dispatchOrdinal implementationRef inputDigest promptDigest transportBindingDigest transportBindingRef workerBindingRef",
      ),
      payloadKeys("actorInvocationRef transportBindingRef cCallRef"),
    )],
  },
  actor_process_started: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef cCallRef processId processRef"),
      payloadKeys("actorInvocationRef processRef processId"),
    )],
  },
  actor_process_spawn_failed: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef diagnosticDigest processRef"),
      payloadKeys("actorInvocationRef processRef diagnosticDigest"),
    )],
  },
  actor_process_stdout_observed: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      PROCESS_STREAM_PAYLOAD,
      payloadKeys("actorInvocationRef processRef streamOrdinal chunkDigest"),
    )],
  },
  actor_process_stderr_observed: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      PROCESS_STREAM_PAYLOAD,
      payloadKeys("actorInvocationRef processRef streamOrdinal chunkDigest"),
    )],
  },
  actor_process_timeout_observed: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef processRef timeoutMs"),
    )],
  },
  actor_process_signal_requested: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef processRef signal"),
    )],
  },
  actor_process_exited: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef processRef signal status"),
      payloadKeys("processRef status signal"),
    )],
  },
  actor_process_termination_unconfirmed: {
    variants: [PROCESS_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("actorInvocationRef processRef"),
    )],
  },
  actor_result_artifact_observed: {
    variants: [ACTOR_INVOCATION_EVENT],
    payloadVariants: [payloadVariant(
      ACTOR_OBSERVATION_PAYLOAD,
      payloadKeys(
        "actorInvocationRef processRef artifactDigests disposition",
      ),
    )],
  },
  actor_invocation_closed: {
    variants: [ACTOR_INVOCATION_EVENT],
    payloadVariants: [payloadVariant(
      combinePayloadKeys(ACTOR_TERMINAL_PAYLOAD, payloadKeys("transportDigest")),
      payloadKeys("actorInvocationRef processRef cCallRef disposition"),
    )],
  },
  actor_invocation_failed: {
    variants: [ACTOR_INVOCATION_EVENT],
    payloadVariants: [
      payloadVariant(
        combinePayloadKeys(ACTOR_TERMINAL_PAYLOAD, payloadKeys("transportDigest")),
        payloadKeys(
          "actorInvocationRef processRef cCallRef disposition failureClass transportDigest",
        ),
      ),
      payloadVariant(
        combinePayloadKeys(
          ACTOR_TERMINAL_PAYLOAD,
          payloadKeys("diagnosticDigest"),
        ),
        payloadKeys(
          "actorInvocationRef processRef cCallRef disposition failureClass diagnosticDigest",
        ),
        { failureClass: "transport_exception" },
      ),
    ],
  },
  c_call_evidenced: {
    variants: [C_CALL_EVENT],
    payloadVariants: [
      payloadVariant(
        EVIDENCE_IO_PAYLOAD,
        EVIDENCE_IO_PAYLOAD,
        { evidenceClass: "deterministic" },
      ),
      payloadVariant(
        combinePayloadKeys(
          EVIDENCE_IO_PAYLOAD,
          payloadKeys(
            "actorInvocationRef actorRef apiRetryCount artifactDigests exitObserved instructionContractRef materializationPlanRef processRef processSignal processStatus progressEventCount promptDigest rendererRef resultContractRef signalSequence stderrByteLength stdoutByteLength structuredEventCount terminationConfirmed timedOut toolCallCount transportBindingDigest transportBindingRef transportDigest transportDisposition transportFailureClass transportLane workerBindingRef",
          ),
        ),
        EVIDENCE_IO_PAYLOAD,
        { evidenceClass: "probabilistic_transport" },
      ),
      payloadVariant(
        combinePayloadKeys(
          EVIDENCE_IO_PAYLOAD,
          payloadKeys(
            "childClosureRef childDisposition childExecutionBasisDigest childExecutionBasisRef childFrameId childGraphCallId childJudgmentRef childReasonRef childResultDigest childResultRef childTerminalEventRef foldbackDigest foldbackEventRef foldbackRef",
          ),
        ),
        EVIDENCE_IO_PAYLOAD,
        { evidenceClass: "sub_traversal" },
        payloadKeys("implementationRef"),
      ),
      payloadVariant(
        combinePayloadKeys(
          EVIDENCE_PAYLOAD,
          payloadKeys(
            "candidateDigest diagnosticRef rejectedContractRef rejectedStage",
          ),
        ),
        EVIDENCE_PAYLOAD,
        { evidenceClass: "admission_rejection" },
      ),
      payloadVariant(
        combinePayloadKeys(
          EVIDENCE_IO_PAYLOAD,
          payloadKeys("requestDigest requestRef"),
        ),
        EVIDENCE_IO_PAYLOAD,
        { evidenceClass: "interaction_request" },
        payloadKeys("implementationRef"),
      ),
    ],
  },
  c_call_result_admitted: {
    variants: [C_CALL_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "cCallRef contractRef evidenceRefs resultClass resultDigest resultRef value valueDigest valueKind",
      ),
      payloadKeys("resultRef resultDigest cCallRef resultClass"),
    )],
  },
  c_call_judged: {
    variants: [C_CALL_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "cCallRef contractRef judgment judgmentDigest judgmentRef predicateRef reasonRef replayStateDigest resultDigest resultRef",
      ),
      payloadKeys(
        "judgmentRef judgmentDigest cCallRef resultRef judgment",
      ),
    )],
  },
  retry_attempt_opened: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "attempt attemptDigest attemptRef budget inputContractRef inputDigest inputRef priorJudgmentRef priorRouteRef retryBoundaryRef retryPath retryTermPath retryableFailureClasses taskOrdinal wrappedTermPath",
      ),
      payloadKeys("attemptRef attemptDigest retryBoundaryRef attempt"),
    )],
  },
  retry_progress_recorded: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "attempt attemptRef budget cCallRef completedAttempts failureClass failureSignalRef inputContractRef inputDigest inputRef judgmentRef progressDigest progressRef remainingBudget resultRef retryBoundaryRef",
      ),
      payloadKeys("progressRef progressDigest attemptRef failureClass"),
    )],
  },
  child_foldback_admitted: {
    variants: [FRAME_EVENT],
    payloadVariants: [
      payloadVariant(
        FOLDBACK_PAYLOAD,
        payloadKeys(
          "foldbackRef foldbackDigest parentCCallRef childDisposition childResultRef",
        ),
      ),
      payloadVariant(
        combinePayloadKeys(
          FOLDBACK_PAYLOAD,
          payloadKeys(
            "applicationFoldbackRef applicationRef parentJudgmentRef sourceCursorDigest sourceCursorRef",
          ),
        ),
        payloadKeys(
          "foldbackRef foldbackDigest parentCCallRef childDisposition childResultRef applicationRef",
        ),
      ),
    ],
  },
  child_preparation_refused: {
    variants: [
      coupledContractVariant(C_CALL_EVENT, [0]),
      coupledContractVariant(FRAME_EVENT, [1]),
    ],
    payloadVariants: [
      payloadVariant(
        payloadKeys(
          "candidateDigest childGraphFunctionRef diagnosticRef inputDigest inputRef kind message parentCCallRef schemaVersion stage",
        ),
        payloadKeys("childGraphFunctionRef stage candidateDigest"),
      ),
      payloadVariant(
        payloadKeys(
          "applicationRef childGraphFunctionRef diagnosticRef inputDigest inputRef message parentCCallRef parentJudgmentRef refusalDigest refusalRef sourceCursorRef stage",
        ),
        payloadKeys(
          "childGraphFunctionRef stage refusalRef refusalDigest",
        ),
      ),
    ],
  },
  fan_out_completion_admitted: {
    variants: [FRAME_EVENT],
    payloadVariants: [
      payloadVariant(
        combinePayloadKeys(
          FAN_OUT_PAYLOAD,
          payloadKeys(
            "outputVector outputVectorDigest outputVectorRef taskRows",
          ),
        ),
        payloadKeys(
          "completionRef completionDigest completionKind outputVector outputVectorDigest outputVectorRef taskRows",
        ),
        { completionKind: "complete_vector" },
      ),
      payloadVariant(
        combinePayloadKeys(
          FAN_OUT_PAYLOAD,
          payloadKeys("completedRows stoppingRow unstartedRows"),
        ),
        payloadKeys(
          "completionRef completionDigest completionKind completedRows stoppingRow unstartedRows",
        ),
        { completionKind: "partial_stop" },
      ),
    ],
  },
  traversal_route_admitted: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      ROUTE_PAYLOAD,
      payloadKeys("routeRef routeDigest routeKind"),
    )],
  },
  construction_intent_selected: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "actionCatalogDigest actionCatalogRef actionCatalogRowDigest constructionIntent constructionIntentDigest constructionIntentRef nextActionBasis nextActionBasisDigest nextActionBasisRef nextActionProjection nextActionProjectionDigest nextActionProjectionRef routeRef targetCursorDigest targetCursorRef",
    ))],
  },
  construction_delta_observed: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "actionEvaluation actionEvaluationAdmission actionEvaluationAdmissionDigest actionEvaluationAdmissionRef actionEvaluationDigest actionEvaluationRef constructionCompositionDigest constructionCompositionRef constructionIntentDigest constructionIntentRef deltaDigest deltaRef edgeClosureDecision edgeClosureDecisionDigest edgeClosureDecisionRef edgeFulfillmentLedger edgeFulfillmentLedgerDigest edgeFulfillmentLedgerRef runtimeEvidenceEventRefs semanticEvidenceAssetRefs sourceCCallRef sourceJudgmentRef sourceResultDigest sourceResultRef targetCursorDigest targetCursorRef targetOutcomeRef workspaceBindingDigest workspaceBindingId",
    ))],
  },
  fh_interaction_opened: {
    variants: [CONTINUATION_EVENT],
    payloadVariants: [
      payloadVariant(payloadKeys(
        "actorCapabilityRef cCall cCallRef causedByEventRef continuationDigest continuationKind continuationRef executionBasisDigest executionBasisRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef heldCursor heldCursorDigest heldCursorRef holdRouteRef implementationSetDigest implementationSetRef inputDigest inputRef inputValue installId interactionSetDigest interactionSetRef manifestDigest openedTraversalScope pendingJudgment pendingResult productContentDigest productId programDigest programRef programValidationRef requestContractRef requestDigest requestRef responseContractRef scopeDigest scopeRef workspaceBindingDigest workspaceBindingId catalogViewDigest catalogViewId",
      )),
      payloadVariant(
        payloadKeys(
          "actorCapabilityRef cCall cCallRef causedByEventRef constructionIntentDigest constructionIntentRef continuationDigest continuationKind continuationRef executionBasisDigest executionBasisRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef heldCursor heldCursorDigest heldCursorRef holdRouteRef implementationSetDigest implementationSetRef inputDigest inputRef inputValue installId interactionSetDigest interactionSetRef manifestDigest openedTraversalScope pendingJudgment pendingResult productContentDigest productId programDigest programRef programValidationRef requestContractRef requestDigest requestRef responseContractRef scopeDigest scopeRef workspaceBindingDigest workspaceBindingId catalogViewDigest catalogViewId",
        ),
        payloadKeys(
          "continuationRef continuationDigest constructionIntentRef constructionIntentDigest",
        ),
      ),
    ],
  },
  fh_interaction_responded: {
    variants: [CONTINUATION_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "actorRef capabilityRef continuationRef publicOperationEventRef responseContractRef responseDigest responseRef responseValue",
    ))],
  },
  fh_interaction_resume_admitted: {
    variants: [CONTINUATION_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "actorRef capabilityRef continuationRef durablePrefixDigest openedEventRef publicOperationEventRef respondedEventRef responseDigest responseRef responseValue successorCursorDigest successorCursorRef successorInputDigest successorInputRef successorInputValue",
    ))],
  },
  runtime_failure_observed: {
    variants: [
      coupledContractVariant(RUN_EVENT, [0]),
      coupledContractVariant(FRAME_EVENT, [1]),
    ],
    payloadVariants: [
      payloadVariant(
        payloadKeys(
          "basisId diagnosticRef failureDigest failureRef frameId graphCallId runId stage subjectDigest",
        ),
        payloadKeys("failureRef failureDigest stage subjectDigest"),
      ),
      payloadVariant(
        payloadKeys("cCallRef code failureClass subjectDigest"),
        payloadKeys("failureClass code subjectDigest cCallRef"),
      ),
    ],
  },
  run_stopped: {
    variants: [RUN_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("cCallRef disposition judgmentRef reasonRef routeRef"),
      payloadKeys("disposition routeRef reasonRef"),
    )],
  },
  terminal_reached: {
    variants: [FRAME_EVENT],
    payloadVariants: [
      payloadVariant(
        TERMINAL_PAYLOAD,
        payloadKeys("closureRef closureDigest routeRef terminalKind"),
      ),
      payloadVariant(
        combinePayloadKeys(
          TERMINAL_PAYLOAD,
          payloadKeys("childFrameId childGraphCallId"),
        ),
        payloadKeys(
          "closureRef closureDigest routeRef terminalKind childFrameId childGraphCallId",
        ),
      ),
    ],
  },
  frame_closed: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("closureContractRef frameId terminalReachedEventRef"),
      payloadKeys("frameId terminalReachedEventRef"),
    )],
  },
  graph_call_closed: {
    variants: [GRAPH_CALL_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("closureContractRef frameClosedEventRef graphCallId"),
      payloadKeys("graphCallId frameClosedEventRef"),
    )],
  },
  run_closed: {
    variants: [RUN_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys("closureContractRef graphCallClosedEventRef runId"),
      payloadKeys("runId graphCallClosedEventRef"),
    )],
  },
} as const satisfies Readonly<Record<RootEventKind, RootEventContract>>);

export const ROOT_EVENT_CONTRACT_DIGEST = sha256Canonical({
  schemaVersion: "5.0.0",
  aggregateTypes: ROOT_EVENT_AGGREGATE_TYPE_VALUES,
  eventKinds: ROOT_EVENT_KIND_VALUES,
  eventContracts: ROOT_EVENT_CONTRACTS,
} as unknown as JsonValue);

export interface RuntimeEventCandidate {
  readonly kind: RootEventKind;
  readonly eventTime: string;
  readonly aggregateType: RootEventAggregateType;
  readonly aggregateId: string;
  readonly parentAggregateId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly workflowVersion: "5.0.0";
  readonly scopeClass: "run" | "workspace";
  readonly basisId: string;
  readonly runId?: string;
  readonly graphFunctionRef?: string;
  readonly materializationRef?: string;
  readonly graphCallId?: string;
  readonly frameId?: string;
  readonly frameLineageId?: string;
  readonly payload: JsonValue;
}

export interface RuntimeEvent extends RuntimeEventCandidate {
  readonly eventId: string;
  readonly admissionOrdinal: number;
  readonly payloadDigest: Sha256Digest;
}

export interface RuntimeEventScope {
  readonly invocationRef?: string;
  readonly runId?: string;
}

export type RuntimeEventCandidateFactory = (
  admittedInBatch: readonly RuntimeEvent[],
) => RuntimeEventCandidate;

export interface EventStoreReopenAuthority {
  readonly kind: "event_store_reopen_authority";
  readonly schemaVersion: "5.0.0";
  readonly eventLogPath: string;
  readonly device: number;
  readonly inode: number;
  readonly eventLogDigest: Sha256Digest;
  readonly durableByteLength: number;
  readonly eventContractDigest: Sha256Digest;
  readonly authorityDigest: Sha256Digest;
}

export interface ReopenedEventStoreContext {
  readonly kind: "reopened_event_store_context";
  readonly schemaVersion: "5.0.0";
  readonly eventLogPath: string;
  readonly eventLogDigest: Sha256Digest;
  readonly eventContractDigest: Sha256Digest;
  readonly historicalEventCount: number;
  readonly maxAdmissionOrdinal: number;
  readonly nextAdmissionOrdinal: number;
  readonly store: AbgEventStore;
}

export interface EventStoreReopenRefusal {
  readonly kind: "event_store_reopen_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "contract_mismatch"
    | "durable_log_mismatch"
    | "invalid_event_history"
    | "sink_unavailable";
  readonly message: string;
}

export type EventStoreReopenResult =
  | EventStoreReopenRefusal
  | ReopenedEventStoreContext;

interface DurableFileIdentity {
  readonly device: number;
  readonly inode: number;
}

interface DurableAppendLock {
  readonly descriptor: number;
  readonly path: string;
}

interface EventStoreState {
  readonly events: RuntimeEvent[];
  durableLogPath: string | null;
  durableDescriptor: number | null;
  durableFileIdentity: DurableFileIdentity | null;
  durableAppendLock: DurableAppendLock | null;
  durableByteLength: number;
  durableAppendClosed: boolean;
  transactionStartIndex: number | null;
}

const eventState = new WeakMap<AbgEventStore, EventStoreState>();

const RUNTIME_EVENT_REQUIRED_KEYS = Object.freeze([
  "admissionOrdinal",
  "aggregateId",
  "aggregateType",
  "basisId",
  "causationEventRefs",
  "correlationId",
  "eventId",
  "eventTime",
  "kind",
  "parentAggregateId",
  "payload",
  "payloadDigest",
  "scopeClass",
  "workflowVersion",
]);

const RUNTIME_EVENT_OPTIONAL_KEYS = Object.freeze([
  "frameId",
  "frameLineageId",
  "graphCallId",
  "graphFunctionRef",
  "materializationRef",
  "runId",
]);

const RUNTIME_EVENT_CANDIDATE_REQUIRED_KEYS = Object.freeze(
  RUNTIME_EVENT_REQUIRED_KEYS.filter(
    (key) =>
      key !== "admissionOrdinal" &&
      key !== "eventId" &&
      key !== "payloadDigest",
  ),
);

function payloadInvocationRef(event: RuntimeEvent): string | null {
  if (typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) {
    return null;
  }
  const value = (event.payload as Readonly<Record<string, JsonValue>>).invocationRef;
  return typeof value === "string" ? value : null;
}

export function selectRuntimeEvents(
  events: readonly RuntimeEvent[],
  scope?: RuntimeEventScope,
): readonly RuntimeEvent[] {
  if (scope === undefined) return Object.freeze([...events]);
  const byId = new Map(events.map((event) => [event.eventId, event]));
  const selected = new Set<string>();
  for (const event of events) {
    if (
      (scope.runId !== undefined && event.runId === scope.runId) ||
      (scope.invocationRef !== undefined &&
        (event.parentAggregateId === scope.invocationRef ||
          payloadInvocationRef(event) === scope.invocationRef))
    ) {
      selected.add(event.eventId);
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const event of events) {
      if (!selected.has(event.eventId)) continue;
      for (const causeRef of event.causationEventRefs) {
        const cause = byId.get(causeRef);
        if (cause === undefined) {
          throw new TypeError("scoped replay encountered an unknown causation event");
        }
        if (
          event.runId !== undefined &&
          cause.runId !== undefined &&
          cause.runId !== event.runId
        ) {
          throw new TypeError("scoped replay cannot cross a run causation boundary");
        }
        if (!selected.has(causeRef)) {
          selected.add(causeRef);
          changed = true;
        }
      }
    }
  }
  return Object.freeze(events.filter((event) => selected.has(event.eventId)));
}

function durableIdentity(path: string): DurableFileIdentity {
  const status = statSync(path);
  if (!status.isFile()) {
    throw new TypeError("ABG durable event sink must be a regular file");
  }
  return {
    device: status.dev,
    inode: status.ino,
  };
}

function descriptorIdentity(descriptor: number): DurableFileIdentity {
  const status = fstatSync(descriptor);
  if (!status.isFile()) {
    throw new TypeError("ABG durable event sink descriptor must name a regular file");
  }
  return {
    device: status.dev,
    inode: status.ino,
  };
}

function sameDurableIdentity(
  left: DurableFileIdentity,
  right: DurableFileIdentity,
): boolean {
  return left.device === right.device && left.inode === right.inode;
}

function isNodeError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { readonly code?: unknown }).code === code
  );
}

function durableLockPath(identity: DurableFileIdentity): string {
  const lockRoot = join(tmpdir(), "abiogenesis-event-store-locks-v5");
  mkdirSync(lockRoot, { recursive: true });
  return join(lockRoot, `${identity.device}-${identity.inode}.lock`);
}

let durableLockAttempt = 0;

function acquireDurableAppendLock(
  identity: DurableFileIdentity,
): DurableAppendLock {
  const path = durableLockPath(identity);
  durableLockAttempt += 1;
  const pendingPath = `${path}.${process.pid}.${durableLockAttempt}.pending`;
  let descriptor: number | null = null;
  let linked = false;
  try {
    descriptor = openSync(pendingPath, "wx", 0o600);
    const body = canonicalJson({
      kind: "abiogenesis_event_store_append_lock",
      schemaVersion: "5.0.0",
      device: identity.device,
      inode: identity.inode,
      ownerPid: process.pid,
    });
    writeFileSync(descriptor, `${body}\n`, "utf8");
    fsyncSync(descriptor);
    linkSync(pendingPath, path);
    linked = true;
    unlinkSync(pendingPath);
    return { descriptor, path };
  } catch (error) {
    if (linked && descriptor !== null) {
      try {
        if (
          sameDurableIdentity(
            descriptorIdentity(descriptor),
            durableIdentity(path),
          )
        ) {
          unlinkSync(path);
        }
      } catch {
        // Preserve the lock-acquisition failure.
      }
    }
    if (descriptor !== null) {
      try {
        closeSync(descriptor);
      } catch {
        // Preserve the lock-acquisition failure.
      }
    }
    try {
      unlinkSync(pendingPath);
    } catch {
      // Preserve the lock-acquisition failure.
    }
    if (isNodeError(error, "EEXIST")) {
      throw new TypeError(
        "ABG durable event sink already has an exclusive append lock; abandoned locks require explicit operator recovery",
      );
    }
    throw error;
  }
}

function releaseDurableAppendLock(lock: DurableAppendLock | null): void {
  if (lock === null) return;
  let releaseError: unknown;
  try {
    const descriptorFileIdentity = descriptorIdentity(lock.descriptor);
    const pathFileIdentity = durableIdentity(lock.path);
    if (!sameDurableIdentity(descriptorFileIdentity, pathFileIdentity)) {
      throw new TypeError(
        "ABG durable append lock identity changed before release",
      );
    }
    unlinkSync(lock.path);
  } catch (error) {
    releaseError = error;
  }
  try {
    closeSync(lock.descriptor);
  } catch (error) {
    if (releaseError === undefined) releaseError = error;
  }
  if (releaseError !== undefined) throw releaseError;
}

function openOwnedDurableSink(
  path: string,
  expectedIdentity?: DurableFileIdentity,
): {
  readonly descriptor: number;
  readonly identity: DurableFileIdentity;
  readonly lock: DurableAppendLock;
} {
  const descriptor = openSync(path, constants.O_RDWR | constants.O_APPEND);
  let lock: DurableAppendLock | null = null;
  try {
    const identity = descriptorIdentity(descriptor);
    if (
      expectedIdentity !== undefined &&
      !sameDurableIdentity(identity, expectedIdentity)
    ) {
      throw new TypeError("ABG durable event sink identity differs from authority");
    }
    lock = acquireDurableAppendLock(identity);
    const pathIdentity = durableIdentity(path);
    if (!sameDurableIdentity(identity, pathIdentity)) {
      throw new TypeError("ABG durable event sink changed while ownership was acquired");
    }
    return { descriptor, identity, lock };
  } catch (error) {
    if (lock !== null) {
      try {
        releaseDurableAppendLock(lock);
      } catch {
        // Preserve the acquisition failure as the primary error.
      }
    }
    closeSync(descriptor);
    throw error;
  }
}

function releaseDurableOwnership(state: EventStoreState): void {
  let closeError: unknown;
  if (state.durableDescriptor !== null) {
    try {
      closeSync(state.durableDescriptor);
    } catch (error) {
      closeError = error;
    }
    state.durableDescriptor = null;
  }
  try {
    releaseDurableAppendLock(state.durableAppendLock);
  } catch (error) {
    if (closeError === undefined) closeError = error;
  }
  state.durableAppendLock = null;
  state.durableAppendClosed = true;
  if (closeError !== undefined) throw closeError;
}

function readDescriptorBytes(
  descriptor: number,
  byteLength: number,
): Buffer {
  const bytes = Buffer.alloc(byteLength);
  let offset = 0;
  while (offset < byteLength) {
    const read = readSync(
      descriptor,
      bytes,
      offset,
      byteLength - offset,
      offset,
    );
    if (read === 0) {
      throw new TypeError("ABG durable event sink ended before its owned length");
    }
    offset += read;
  }
  return bytes;
}

function durableEventBytes(events: readonly RuntimeEvent[]): string {
  return events
    .map((event) => `${canonicalJson(event as unknown as JsonValue)}\n`)
    .join("");
}

function assertDurableSinkUnchanged(state: EventStoreState): number {
  const path = state.durableLogPath;
  const descriptor = state.durableDescriptor;
  const identity = state.durableFileIdentity;
  if (
    path === null ||
    descriptor === null ||
    identity === null ||
    state.durableAppendLock === null ||
    state.durableAppendClosed
  ) {
    throw new TypeError("ABG durable event sink is not open for append");
  }
  const status = statSync(path);
  const descriptorStatus = fstatSync(descriptor);
  if (
    !status.isFile() ||
    !descriptorStatus.isFile() ||
    status.dev !== identity.device ||
    status.ino !== identity.inode ||
    descriptorStatus.dev !== identity.device ||
    descriptorStatus.ino !== identity.inode ||
    status.size !== state.durableByteLength ||
    descriptorStatus.size !== state.durableByteLength
  ) {
    throw new TypeError(
      "ABG durable event sink identity or append position changed",
    );
  }
  return descriptor;
}

function appendDurablyBatch(
  state: EventStoreState,
  events: readonly RuntimeEvent[],
): void {
  const descriptor = assertDurableSinkUnchanged(state);
  const priorByteLength = state.durableByteLength;
  const encoded = Buffer.from(durableEventBytes(events), "utf8");
  try {
    let offset = 0;
    while (offset < encoded.byteLength) {
      const written = writeSync(
        descriptor,
        encoded,
        offset,
        encoded.byteLength - offset,
      );
      if (written <= 0) {
        throw new TypeError("ABG durable event append made no progress");
      }
      offset += written;
    }
    fsyncSync(descriptor);
    const status = fstatSync(descriptor);
    if (status.size !== priorByteLength + encoded.byteLength) {
      throw new TypeError("ABG durable event append length is inconsistent");
    }
    const appended = Buffer.alloc(encoded.byteLength);
    const read = readSync(
      descriptor,
      appended,
      0,
      appended.byteLength,
      priorByteLength,
    );
    if (read !== appended.byteLength || !appended.equals(encoded)) {
      throw new TypeError("ABG durable event append bytes are inconsistent");
    }
    state.durableByteLength = status.size;
    assertDurableSinkUnchanged(state);
  } catch (error) {
    try {
      const status = fstatSync(descriptor);
      if (status.size !== priorByteLength) {
        ftruncateSync(descriptor, priorByteLength);
        fsyncSync(descriptor);
      }
      state.durableByteLength = priorByteLength;
      assertDurableSinkUnchanged(state);
    } catch (rollbackError) {
      try {
        releaseDurableOwnership(state);
      } catch {
        // The poisoned context is already closed; retain both primary failures.
      }
      throw new AggregateError(
        [error, rollbackError],
        "ABG durable event append failed and its unadmitted suffix could not be rolled back",
      );
    }
    throw error;
  }
}

function constructRuntimeEvent(
  events: readonly RuntimeEvent[],
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  if (
    !isRecord(candidate) ||
    !hasOnlyRuntimeEventCandidateKeys(candidate) ||
    !isRuntimeEventCandidateShape(candidate)
  ) {
    throw new TypeError("runtime event candidate has an invalid envelope");
  }
  assertRuntimeEventContract(candidate);
  if (
    new Set(candidate.causationEventRefs).size !== candidate.causationEventRefs.length ||
    candidate.causationEventRefs.some(
      (eventRef) => !events.some((event) => event.eventId === eventRef),
    )
  ) {
    throw new TypeError("runtime event causation refs must be unique admitted events in this store");
  }
  const causeEvents = candidate.causationEventRefs.map((eventRef) =>
    events.find((event) => event.eventId === eventRef)!,
  );
  if (
    causeEvents.some((cause) =>
      candidate.runId === undefined
        ? cause.runId !== undefined
        : cause.runId !== undefined && cause.runId !== candidate.runId)
  ) {
    throw new TypeError("runtime event causation cannot cross a run scope");
  }
  const immutableCandidate = deepFreeze(
    JSON.parse(canonicalJson(candidate as unknown as JsonValue)) as RuntimeEventCandidate,
  );
  const admissionOrdinal = events.length + 1;
  const payloadDigest = sha256Canonical(immutableCandidate.payload);
  const eventId = `event://abiogenesis/${sha256Canonical({
    ...immutableCandidate,
    payloadDigest,
    admissionOrdinal,
  }).slice("sha256:".length)}`;
  return deepFreeze({
    ...immutableCandidate,
    eventId,
    admissionOrdinal,
    payloadDigest,
  }) as RuntimeEvent;
}

export class AbgEventStore {
  constructor() {
    eventState.set(this, {
      events: [],
      durableLogPath: null,
      durableDescriptor: null,
      durableFileIdentity: null,
      durableAppendLock: null,
      durableByteLength: 0,
      durableAppendClosed: false,
      transactionStartIndex: null,
    });
  }

  readAll(): readonly RuntimeEvent[] {
    return Object.freeze([...(eventState.get(this)?.events ?? [])]);
  }

  readScope(scope: RuntimeEventScope): readonly RuntimeEvent[] {
    return selectRuntimeEvents(this.readAll(), scope);
  }

  digest(scope?: RuntimeEventScope): Sha256Digest {
    const events = scope === undefined ? this.readAll() : this.readScope(scope);
    return sha256Canonical(events as unknown as JsonValue);
  }

  configureDurableLog(path: string): void {
    const state = eventState.get(this);
    if (state === undefined) throw new TypeError("event store state is unavailable");
    const exactPath = resolve(path);
    if (state.durableLogPath !== null) {
      if (state.durableLogPath !== exactPath) {
        throw new TypeError("ABG event store cannot change its configured durable log");
      }
      return;
    }
    if (state.durableAppendClosed) {
      throw new TypeError("ABG durable event sink is unavailable for exclusive append");
    }
    mkdirSync(dirname(exactPath), { recursive: true });
    writeFileSync(exactPath, "", { encoding: "utf8", flag: "wx" });
    try {
      const owned = openOwnedDurableSink(exactPath);
      state.durableLogPath = exactPath;
      state.durableDescriptor = owned.descriptor;
      state.durableFileIdentity = owned.identity;
      state.durableAppendLock = owned.lock;
      state.durableByteLength = 0;
      if (state.events.length !== 0) {
        appendDurablyBatch(state, state.events);
      }
    } catch (error) {
      try {
        unlinkSync(exactPath);
      } catch {
        // Preserve the ownership failure; the empty unowned sink is harmless.
      }
      throw error;
    }
  }

  configuredDurableLogPath(): string | null {
    return eventState.get(this)?.durableLogPath ?? null;
  }

  closeDurableLog(): void {
    const state = eventState.get(this);
    if (state === undefined) throw new TypeError("event store state is unavailable");
    if (state.durableLogPath !== null && !state.durableAppendClosed) {
      releaseDurableOwnership(state);
    }
  }

  projectReopenAuthorityAndClose(): EventStoreReopenAuthority {
    const state = eventState.get(this);
    if (state === undefined) throw new TypeError("event store state is unavailable");
    const descriptor = assertDurableSinkUnchanged(state);
    const path = state.durableLogPath!;
    const identity = state.durableFileIdentity!;
    const bytes = readDescriptorBytes(descriptor, state.durableByteLength);
    assertDurableSinkUnchanged(state);
    const body = {
      kind: "event_store_reopen_authority" as const,
      schemaVersion: "5.0.0" as const,
      eventLogPath: path,
      device: identity.device,
      inode: identity.inode,
      eventLogDigest: sha256Bytes(bytes),
      durableByteLength: state.durableByteLength,
      eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
    };
    const authority = deepFreeze({
      ...body,
      authorityDigest: sha256Canonical(body),
    });
    releaseDurableOwnership(state);
    return authority;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRuntimeEventContract(
  candidate: RuntimeEventCandidate,
): void {
  const contract: RootEventContract = ROOT_EVENT_CONTRACTS[candidate.kind];
  const envelope = candidate as unknown as Readonly<Record<string, unknown>>;
  const envelopeVariants = contract.variants.filter(
    (entry) =>
      entry.aggregateType === candidate.aggregateType &&
      entry.scopeClass === candidate.scopeClass &&
      entry.requiredEnvelopeIdentities.every(
        (key) => typeof envelope[key] === "string" && envelope[key] !== "",
      ),
  );
  if (envelopeVariants.length === 0) {
    throw new TypeError(
      "runtime event kind, aggregate type, and scope class do not form an admitted variant",
    );
  }
  if (
    candidate.scopeClass === "workspace" &&
    (
      candidate.runId !== undefined ||
      candidate.graphCallId !== undefined ||
      candidate.frameId !== undefined ||
      candidate.frameLineageId !== undefined
    )
  ) {
    throw new TypeError("workspace runtime event cannot carry run-local scope identities");
  }
  if (
    (candidate.aggregateType === "run" &&
      candidate.aggregateId !== candidate.runId) ||
    (candidate.aggregateType === "graph_call" &&
      candidate.aggregateId !== candidate.graphCallId) ||
    (candidate.aggregateType === "frame" &&
      candidate.aggregateId !== candidate.frameId)
  ) {
    throw new TypeError("runtime event aggregate identity differs from its scope identity");
  }
  const payload = candidate.payload;
  if (!isRecord(payload)) {
    throw new TypeError("runtime event payload must be one closed object");
  }
  const payloadKeysPresent = Object.keys(payload);
  const contractMatches = envelopeVariants.flatMap((envelopeVariant) =>
    contract.payloadVariants.flatMap((payloadVariant, payloadVariantIndex) => {
      const admittedIndexes = envelopeVariant.payloadVariantIndexes ??
        contract.payloadVariants.map((_, index) => index);
      return admittedIndexes.includes(payloadVariantIndex) &&
          payloadVariant.requiredPayloadKeys.every((key) =>
            Object.hasOwn(payload, key)
          ) &&
          payloadKeysPresent.every((key) =>
            payloadVariant.allowedPayloadKeys.includes(key)
          ) &&
          Object.entries(payloadVariant.expectedPayload ?? {}).every(
            ([key, expected]) => payload[key] === expected,
          )
        ? [{ envelopeVariant, payloadVariant }]
        : [];
    })
  );
  if (contractMatches.length !== 1) {
    throw new TypeError("runtime event payload matches no admitted event-contract variant");
  }
  const selectedPayloadVariant = contractMatches[0]!.payloadVariant;
  for (const key of selectedPayloadVariant.requiredPayloadKeys) {
    const value = payload[key];
    if (
      key.endsWith("Digest") &&
      !isSha256Digest(value)
    ) {
      throw new TypeError("runtime event payload carries an invalid required digest");
    }
    if (
      (key.endsWith("Ref") || key.endsWith("Id")) &&
      key !== "processId" &&
      !(key === "parentFrameId" && value === null) &&
      !(
        value === null &&
        selectedPayloadVariant.nullablePayloadKeys?.includes(key) === true
      ) &&
      (typeof value !== "string" || value.length === 0)
    ) {
      throw new TypeError("runtime event payload carries an invalid required identity");
    }
  }
  for (const [payloadKey, envelopeValue] of [
    ["runId", candidate.runId],
    ["graphCallId", candidate.graphCallId],
    ["frameId", candidate.frameId],
  ] as const) {
    if (
      Object.hasOwn(payload, payloadKey) &&
      payload[payloadKey] !== envelopeValue
    ) {
      throw new TypeError("runtime event payload identity differs from its envelope");
    }
  }
  if (
    (candidate.aggregateType === "c_call" &&
      Object.hasOwn(payload, "cCallRef") &&
      payload.cCallRef !== candidate.aggregateId) ||
    (candidate.aggregateType === "actor_invocation" &&
      payload.actorInvocationRef !== candidate.aggregateId) ||
    (candidate.aggregateType === "process" &&
      payload.processRef !== candidate.aggregateId) ||
    (candidate.aggregateType === "transport_binding" &&
      payload.transportBindingRef !== candidate.aggregateId)
  ) {
    throw new TypeError("runtime event payload aggregate identity is inconsistent");
  }
  if (
    candidate.kind === "actor_process_started" &&
    (!Number.isSafeInteger(payload.processId) || Number(payload.processId) <= 0)
  ) {
    throw new TypeError("actor process event carries an invalid process identity");
  }
  if (
    candidate.kind === "basis_admitted" &&
    (
      !["root", "child"].includes(String(payload.basisClass)) ||
      (candidate.aggregateType === "workspace" &&
        payload.basisClass !== "root") ||
      (candidate.aggregateType === "frame" &&
        payload.basisClass !== "child")
    )
  ) {
    throw new TypeError("execution-basis event carries an invalid basis class");
  }
  if (
    (candidate.kind === "c_call_opened" ||
      candidate.kind === "c_call_fibre_selected") &&
    !["leaf", "workflow"].includes(String(payload.callClass))
  ) {
    throw new TypeError("C-call event carries an unknown call class");
  }
  if (
    candidate.kind === "c_call_evidenced" &&
    ![
      "deterministic",
      "interaction_request",
      "probabilistic_transport",
      "sub_traversal",
      "admission_rejection",
    ].includes(String(payload.evidenceClass))
  ) {
    throw new TypeError("C-call evidence event carries an unknown evidence class");
  }
  if (
    candidate.kind === "c_call_result_admitted" &&
    !["success", "failure", "pending", "refusal"].includes(
      String(payload.resultClass),
    )
  ) {
    throw new TypeError("C-call result event carries an unknown result class");
  }
  if (
    candidate.kind === "traversal_route_admitted" &&
    ![
      "advance",
      "re_enter",
      "retry",
      "terminal",
      "hold",
      "gap_stop",
      "blocked",
      "failed",
    ].includes(
      String(payload.routeKind),
    )
  ) {
    throw new TypeError(
      `traversal route event carries unknown route kind ${String(payload.routeKind)}`,
    );
  }
  if (
    candidate.kind === "fan_out_completion_admitted" &&
    !["complete_vector", "partial_stop"].includes(
      String(payload.completionKind),
    )
  ) {
    throw new TypeError("fan-out completion event carries an unknown completion kind");
  }
  if (
    candidate.kind === "c_call_fibre_selected" &&
    !["F_D", "F_P", "F_H"].includes(String(payload.regime))
  ) {
    throw new TypeError("C-call fibre event carries an unknown compute regime");
  }
  if (
    candidate.kind === "child_foldback_admitted" &&
    !["closed", "blocked", "failed"].includes(
      String(payload.childDisposition),
    )
  ) {
    throw new TypeError("child foldback event carries an unknown disposition");
  }
  if (
    candidate.kind === "run_stopped" &&
    ![
      "blocked",
      "failed",
      "gap_stop",
      "reprice_required",
      "repair",
      "inspect_runtime_archive",
      "reprice",
      "escalate",
      "operator_abort",
      "campaign_close",
    ].includes(
      String(payload.disposition),
    )
  ) {
    throw new TypeError("run stop event carries an unknown disposition");
  }
}

function hasOnlyRuntimeEventKeys(value: Readonly<Record<string, unknown>>): boolean {
  const allowed = new Set([
    ...RUNTIME_EVENT_REQUIRED_KEYS,
    ...RUNTIME_EVENT_OPTIONAL_KEYS,
  ]);
  return RUNTIME_EVENT_REQUIRED_KEYS.every((key) => Object.hasOwn(value, key)) &&
    Object.keys(value).every((key) => allowed.has(key));
}

function hasOnlyRuntimeEventCandidateKeys(
  value: Readonly<Record<string, unknown>>,
): boolean {
  const allowed = new Set([
    ...RUNTIME_EVENT_CANDIDATE_REQUIRED_KEYS,
    ...RUNTIME_EVENT_OPTIONAL_KEYS,
  ]);
  return RUNTIME_EVENT_CANDIDATE_REQUIRED_KEYS.every((key) =>
    Object.hasOwn(value, key)
  ) && Object.keys(value).every((key) => allowed.has(key));
}

function isRuntimeEventCandidateShape(
  value: Readonly<Record<string, unknown>>,
): boolean {
  const optionalStringsValid = RUNTIME_EVENT_OPTIONAL_KEYS.every(
    (key) =>
      !Object.hasOwn(value, key) ||
      (typeof value[key] === "string" && value[key].length > 0),
  );
  return (
    typeof value.kind === "string" &&
    ROOT_EVENT_KIND_VALUES.includes(value.kind as RootEventKind) &&
    typeof value.eventTime === "string" &&
    !Number.isNaN(Date.parse(value.eventTime)) &&
    typeof value.aggregateType === "string" &&
    ROOT_EVENT_AGGREGATE_TYPE_VALUES.includes(
      value.aggregateType as RootEventAggregateType,
    ) &&
    typeof value.aggregateId === "string" &&
    value.aggregateId.length > 0 &&
    (
      value.parentAggregateId === null ||
      (
        typeof value.parentAggregateId === "string" &&
        value.parentAggregateId.length > 0
      )
    ) &&
    Array.isArray(value.causationEventRefs) &&
    value.causationEventRefs.every(
      (eventRef) => typeof eventRef === "string" && eventRef.length > 0,
    ) &&
    typeof value.correlationId === "string" &&
    value.correlationId.length > 0 &&
    value.workflowVersion === "5.0.0" &&
    (value.scopeClass === "run" || value.scopeClass === "workspace") &&
    typeof value.basisId === "string" &&
    value.basisId.length > 0 &&
    Object.hasOwn(value, "payload") &&
    optionalStringsValid
  );
}

export function validateHistoricalEvents(
  bytes: Uint8Array,
): readonly RuntimeEvent[] {
  const encoded = Buffer.from(bytes).toString("utf8");
  if (
    encoded.includes("\r") ||
    (encoded.length !== 0 && !encoded.endsWith("\n"))
  ) {
      throw new TypeError("durable ABG event log has an incomplete trailing row");
  }
  const lines = encoded.length === 0
    ? []
    : encoded.slice(0, -1).split("\n");
  if (lines.some((line) => line.length === 0)) {
    throw new TypeError("durable ABG event log contains a blank record");
  }
  const admitted: RuntimeEvent[] = [];
  for (const line of lines) {
    let decoded: unknown;
    try {
      decoded = JSON.parse(line);
    } catch {
      throw new TypeError("durable ABG event log contains invalid JSON");
    }
    if (
      !isRecord(decoded) ||
      !hasOnlyRuntimeEventKeys(decoded) ||
      canonicalJson(decoded as JsonValue) !== line
    ) {
      throw new TypeError("durable ABG event log contains a noncanonical event");
    }
    const {
      eventId,
      admissionOrdinal,
      payloadDigest,
      ...candidateValue
    } = decoded;
    if (
      typeof eventId !== "string" ||
      !Number.isSafeInteger(admissionOrdinal) ||
      !isSha256Digest(payloadDigest) ||
      !isRuntimeEventCandidateShape(candidateValue)
    ) {
      throw new TypeError("durable ABG event log contains an invalid envelope");
    }
    const reconstructed = constructRuntimeEvent(
      admitted,
      candidateValue as unknown as RuntimeEventCandidate,
    );
    if (
      reconstructed.eventId !== eventId ||
      reconstructed.admissionOrdinal !== admissionOrdinal ||
      reconstructed.payloadDigest !== payloadDigest ||
      canonicalJson(reconstructed as unknown as JsonValue) !== line
    ) {
      throw new TypeError(
        "durable ABG event log contains restamped or inconsistent history",
      );
    }
    admitted.push(reconstructed);
  }
  return Object.freeze(admitted);
}

function reopenRefusal(
  code: EventStoreReopenRefusal["code"],
  message: string,
): EventStoreReopenRefusal {
  return deepFreeze({
    kind: "event_store_reopen_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

export function reopenEventStore(
  authority: EventStoreReopenAuthority,
): EventStoreReopenResult {
  if (!isRecord(authority)) {
    return reopenRefusal(
      "basis_mismatch",
      "event-store reopen authority is not one exact carrier",
    );
  }
  const authorityKeys = new Set([
    "authorityDigest",
    "device",
    "durableByteLength",
    "eventContractDigest",
    "eventLogDigest",
    "eventLogPath",
    "inode",
    "kind",
    "schemaVersion",
  ]);
  if (
    Object.keys(authority).length !== authorityKeys.size ||
    Object.keys(authority).some((key) => !authorityKeys.has(key))
  ) {
    return reopenRefusal(
      "basis_mismatch",
      "event-store reopen authority has an open or incomplete shape",
    );
  }
  const authorityDigest = authority.authorityDigest;
  const authorityBody = {
    kind: authority.kind,
    schemaVersion: authority.schemaVersion,
    eventLogPath: authority.eventLogPath,
    device: authority.device,
    inode: authority.inode,
    eventLogDigest: authority.eventLogDigest,
    durableByteLength: authority.durableByteLength,
    eventContractDigest: authority.eventContractDigest,
  };
  if (
    authority.kind !== "event_store_reopen_authority" ||
    authority.schemaVersion !== "5.0.0" ||
    resolve(authority.eventLogPath) !== authority.eventLogPath ||
    !Number.isSafeInteger(authority.device) ||
    !Number.isSafeInteger(authority.inode) ||
    !isSha256Digest(authority.eventLogDigest) ||
    !Number.isSafeInteger(authority.durableByteLength) ||
    authority.durableByteLength < 0 ||
    !isSha256Digest(authority.eventContractDigest) ||
    !isSha256Digest(authorityDigest) ||
    sha256Canonical(authorityBody) !== authorityDigest
  ) {
    return reopenRefusal(
      "basis_mismatch",
      "event-store reopen authority is not self-consistent",
    );
  }
  if (authority.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) {
    return reopenRefusal(
      "contract_mismatch",
      "event-store reopen authority names another event contract",
    );
  }
  const exactPath = authority.eventLogPath;
  let owned:
    | {
        readonly descriptor: number;
        readonly identity: DurableFileIdentity;
        readonly lock: DurableAppendLock;
      }
    | undefined;
  try {
    owned = openOwnedDurableSink(exactPath, {
      device: authority.device,
      inode: authority.inode,
    });
  } catch (error) {
    return reopenRefusal(
      "sink_unavailable",
      `durable event sink cannot acquire exact append ownership: ${String(error)}`,
    );
  }
  let bytes: Buffer;
  try {
    const status = fstatSync(owned.descriptor);
    bytes = readDescriptorBytes(owned.descriptor, status.size);
    const finalStatus = fstatSync(owned.descriptor);
    const pathIdentity = durableIdentity(exactPath);
    if (
      finalStatus.size !== status.size ||
      !sameDurableIdentity(owned.identity, pathIdentity)
    ) {
      throw new TypeError("durable event sink changed while its prefix was read");
    }
  } catch (error) {
    closeSync(owned.descriptor);
    releaseDurableAppendLock(owned.lock);
    return reopenRefusal(
      "sink_unavailable",
      `durable event sink cannot be opened: ${String(error)}`,
    );
  }
  if (
    bytes.byteLength !== authority.durableByteLength ||
    sha256Bytes(bytes) !== authority.eventLogDigest
  ) {
    closeSync(owned.descriptor);
    releaseDurableAppendLock(owned.lock);
    return reopenRefusal(
      "durable_log_mismatch",
      "durable event sink differs from the selected exact prefix",
    );
  }
  let events: readonly RuntimeEvent[];
  try {
    events = validateHistoricalEvents(bytes);
  } catch (error) {
    closeSync(owned.descriptor);
    releaseDurableAppendLock(owned.lock);
    return reopenRefusal("invalid_event_history", String(error));
  }

  const store = new AbgEventStore();
  eventState.set(store, {
    events: [...events],
    durableLogPath: exactPath,
    durableDescriptor: owned.descriptor,
    durableFileIdentity: owned.identity,
    durableAppendLock: owned.lock,
    durableByteLength: bytes.byteLength,
    durableAppendClosed: false,
    transactionStartIndex: null,
  });
  return Object.freeze({
    kind: "reopened_event_store_context" as const,
    schemaVersion: "5.0.0" as const,
    eventLogPath: exactPath,
    eventLogDigest: authority.eventLogDigest,
    eventContractDigest: authority.eventContractDigest,
    historicalEventCount: events.length,
    maxAdmissionOrdinal: events.length,
    nextAdmissionOrdinal: events.length + 1,
    store,
  });
}

export function admitRuntimeEvent(
  store: AbgEventStore,
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  const events = state.events;
  const event = constructRuntimeEvent(events, candidate);
  if (
    state.durableLogPath !== null &&
    state.transactionStartIndex === null
  ) {
    appendDurablyBatch(state, [event]);
  }
  events.push(event);
  return event;
}

export function admitRuntimeEventBatch(
  store: AbgEventStore,
  factories: readonly RuntimeEventCandidateFactory[],
): readonly RuntimeEvent[] {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  if (factories.length === 0) return Object.freeze([]);
  const staged = [...state.events];
  const admitted: RuntimeEvent[] = [];
  for (const factory of factories) {
    const candidate = factory(Object.freeze([...admitted]));
    const event = constructRuntimeEvent(staged, candidate);
    staged.push(event);
    admitted.push(event);
  }
  if (
    state.durableLogPath !== null &&
    state.transactionStartIndex === null
  ) {
    appendDurablyBatch(state, admitted);
  }
  state.events.push(...admitted);
  return Object.freeze(admitted);
}

export function admitRuntimeEventTransaction<T>(
  store: AbgEventStore,
  action: () => T,
): T {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  if (state.transactionStartIndex !== null) {
    throw new TypeError("ABG event admission transactions cannot nest");
  }
  const startIndex = state.events.length;
  state.transactionStartIndex = startIndex;
  try {
    const result = action();
    const admitted = state.events.slice(startIndex);
    if (state.durableLogPath !== null && admitted.length !== 0) {
      appendDurablyBatch(state, admitted);
    }
    return result;
  } catch (error) {
    state.events.splice(startIndex);
    throw error;
  } finally {
    state.transactionStartIndex = null;
  }
}
