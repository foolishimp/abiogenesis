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
import { fileURLToPath, pathToFileURL } from "node:url";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKER_TRANSPORT_FAILURE_CLASS_VALUES } from "./transport_contracts.js";

export const ROOT_EVENT_KIND_VALUES = [
  "public_operation_artifact_admitted",
  "public_operation_admitted",
  "invocation_admitted",
  "invocation_refused",
  "implementation_admitted",
  "basis_admitted",
  "declaration_reprice_admitted",
  "replay_log_attested",
  "workspace_hygiene_stamped",
  "defect_intake_admitted",
  "run_resumed",
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
  "assessed",
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
  "continuation_abandoned",
  "continuation_superseded",
  "continuation_reentry_link_admitted",
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
  "actionCatalogDigest actionCatalogRef actionCatalogRows actorRef basisClass basisDigest basisRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId closureContractDigest closureContractRef constructionComposition constructionCompositionDigest constructionCompositionRef entryRef evidenceContractRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef implementationResolutionRef implementationSetDigest implementationSetRef interactionSetDigest interactionSetRef invocationAdmissionRef invocationDigest invocationRef judgmentContractRef localExecutableLeafKeys localImplementationSubsetDigest localInteractionLeafKeys localInteractionSubsetDigest parentCCallRef parentExecutionBasisRef parentTraversalScopeRef programDigest programRef programValidationRef rawInputAdmissionRef rawInputDigest rawInputValue refusalContractRef refusalValueKind rejectionContractRef replayProjectionRef resultContractRef rootImplementationSetDigest rootImplementationSetRef rootInteractionSetDigest rootInteractionSetRef terminalKind terminalPredicateRef transitionContractRef workspaceBindingDigest workspaceBindingId",
);
const GRAPH_OPEN_PAYLOAD = payloadKeys(
  "executionBasisRef graphCallDigest graphCallId graphDigest graphFunctionDigest graphFunctionRef graphRef invocationRef runId",
);
const FRAME_OPEN_PAYLOAD = payloadKeys(
  "admittedInputDigest admittedInputRef attempt executionBasisRef frameDigest frameId frameLineageId graphCallId invocationRef parentFrameId runId",
);
const C_CALL_OPEN_PAYLOAD = payloadKeys(
  "attempt basisId batchRef cCallDigest cCallRef callClass cursorDigest cursorRef edgeRef frameId graphCallId graphFunctionRef programLocusRef retryPath stageRole taskOrdinal vectorIndex",
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
  "actorInvocationRef actorRef apiRetryCount artifactDigests cCallRef disposition exitObserved failureClass finalOutput implementationRef inputDigest instructionContractRef materializationPlanRef observedOutputDigest processRef processSignal processStatus progressEventCount promptDigest rendererRef requestDigest requestRef resultContractRef signalSequence stderrByteLength stdoutByteLength structuredEventCount terminationConfirmed timedOut toolCallCount transportBindingDigest transportBindingRef transportDigest transportLane workerBindingRef",
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
const RETRY_FAILURE_PROGRESS_PAYLOAD = payloadKeys(
  "attempt attemptRef budget cCallRef completedAttempts failureClass failureSignalRef inputContractRef inputDigest inputRef judgmentRef progressClass progressDigest progressRef remainingBudget resultRef retryBoundaryRef retryPath",
);
const RETRY_STOPPED_PROGRESS_PAYLOAD = payloadKeys(
  "attempt attemptRef budget cCallRef completedAttempts failureClass failureSignalRef inputContractRef inputDigest inputRef judgmentRef predecessorProgressRef progressClass progressDigest progressRef remainingBudget resultRef retryBoundaryRef retryPath stopReason",
);
const WITNESSED_ACT_PAYLOAD = payloadKeys(
  "act actorDigest actorRef contentContractDigest contentContractRef contentKind contentValue contentValueDigest contentValueRef context evidence provenance subjectDigest subjectKind subjectRef witnessedActDigest witnessedActRef",
);

const ROOT_EVENT_CONTRACTS = Object.freeze({
  public_operation_artifact_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "artifact artifactDigest artifactRef authorityScopeDigest authorityScopeRef causationEventRefs correlationId definitionDigest invocationDigest invocationPayloadDigest invocationRef memberKey operationId ownerAdmittedDisposition productSemanticsBasisDigest publicationDigest resolvedLock workspaceAuthorityBasis",
      ),
      payloadKeys("operationId artifactRef artifactDigest"),
    )],
  },
  public_operation_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs catalogApplicationDigests catalogApplicationRefs catalogBasisDigest catalogBasisRef catalogHandle catalogViewId definitionDigest graphFunctionRef gtlEntryCoordinate gtlEntryTerm invocationDigest invocationRef memberKey operationId policyDigest policyRef programRef programValidationDigest programValidationRef selectedDefinitionDigest selectedDefinitionRef variant workspaceBindingId",
        ),
        payloadKeys(
          "catalogApplicationDigests catalogApplicationRefs operationId invocationRef invocationDigest variant",
        ),
      ),
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs catalogBasisDigest catalogBasisRef catalogHandle catalogViewId definitionDigest graphFunctionRef gtlEntryCoordinate gtlEntryTerm invocationDigest invocationRef memberKey operationId policyDigest policyRef programRef programValidationDigest programValidationRef selectedDefinitionDigest selectedDefinitionRef variant workspaceBindingId",
        ),
        payloadKeys(
          "operationId invocationRef invocationDigest variant",
        ),
      ),
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs capabilityRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId continuationRef definitionDigest graphFunctionDigest graphFunctionRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId policyDigest policyRef programDigest programRef variant workspaceBindingDigest workspaceBindingId",
        ),
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs capabilityRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId continuationRef definitionDigest graphFunctionDigest graphFunctionRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId policyDigest policyRef programDigest programRef variant workspaceBindingDigest workspaceBindingId",
        ),
      ),
      payloadVariant(
        payloadKeys(
          "actorDigest actorRef authorityScopeDigest authorityScopeRef capabilityGrantDigest capabilityGrantRef definitionDigest dependencyLockDigest dependencyLockRef executionBasisDigest executionBasisRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId productSetDigest productSetRef workspaceBindingDigest workspaceBindingRef",
        ),
        undefined,
        { operationId: "abg.operation.witness.admit" },
      ),
      payloadVariant(
        payloadKeys(
          "actorDigest actorRef authorityScopeDigest authorityScopeRef capabilityGrantDigest capabilityGrantRef definitionDigest dependencyLockDigest dependencyLockRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId productSetDigest productSetRef workspaceBindingDigest workspaceBindingRef",
        ),
        undefined,
        { operationId: "abg.operation.witness.admit" },
      ),
    ],
  },
  invocation_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs capabilityGrants catalogApplicationDigests catalogApplicationRefs catalogViewDigest catalogViewId graphFunctionDigest graphFunctionRef inputContractRef invocationAdmissionDigest invocationAdmissionRef invocationDigest invocationRef invocationVariant outputContractRef policyDigest policyRef programDigest programRef programValidationDigest programValidationRef publicRequestAdmissionRef publicRequestDigest publicRequestInvocationRef publicStart rawInputAdmissionRef rawInputDigest reentryBasis sourceResultBasis workspaceBindingDigest workspaceBindingId workspaceId",
        ),
        payloadKeys(
          "catalogApplicationDigests catalogApplicationRefs invocationAdmissionRef invocationAdmissionDigest invocationRef reentryBasis sourceResultBasis",
        ),
        undefined,
        payloadKeys("publicStart reentryBasis sourceResultBasis"),
      ),
      payloadVariant(
        payloadKeys(
          "actorRef authorityDigest authorityRef capabilityGrantRefs capabilityGrants catalogApplicationDigests catalogApplicationRefs catalogBasisDigest catalogBasisRef catalogHandle catalogViewDigest catalogViewId graphFunctionDigest graphFunctionRef gtlEntryCoordinate gtlEntryTerm inputContractRef invocationAdmissionDigest invocationAdmissionRef invocationDigest invocationRef invocationVariant outputContractRef policyDigest policyRef programDigest programRef programValidationDigest programValidationRef publicRequestAdmissionRef publicRequestDigest publicRequestInvocationRef publicStart rawInputAdmissionRef rawInputDigest reentryBasis selectedDefinitionDigest selectedDefinitionRef sourceResultBasis workspaceBindingDigest workspaceBindingId workspaceId",
        ),
        payloadKeys(
          "catalogApplicationDigests catalogApplicationRefs invocationAdmissionRef invocationAdmissionDigest invocationRef reentryBasis sourceResultBasis",
        ),
        undefined,
        payloadKeys("publicStart reentryBasis sourceResultBasis"),
      ),
    ],
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
        payloadKeys("basisRef basisDigest basisClass rawInputValue"),
        { basisClass: "root" },
      ),
      payloadVariant(
        BASIS_PAYLOAD,
        payloadKeys("basisRef basisDigest basisClass rawInputValue"),
        { basisClass: "child" },
      ),
    ],
  },
  declaration_reprice_admitted: {
    variants: [WORKSPACE_EVENT, RUN_EVENT],
    payloadVariants: [payloadVariant(combinePayloadKeys(
      WITNESSED_ACT_PAYLOAD,
      payloadKeys(
        "afterDigest beforeDigest changeClass declarationRef operatorActorRef owningTicketRef reason repriceRef",
      ),
    ))],
  },
  replay_log_attested: {
    variants: [WORKSPACE_EVENT, RUN_EVENT],
    payloadVariants: [payloadVariant(combinePayloadKeys(
      WITNESSED_ACT_PAYLOAD,
      payloadKeys("attestationRef attestedBy chainDigest eventCount"),
    ))],
  },
  workspace_hygiene_stamped: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [payloadVariant(
      combinePayloadKeys(
        WITNESSED_ACT_PAYLOAD,
        payloadKeys("hygieneRef observedBy rows segmentRef"),
      ),
      undefined,
      undefined,
      payloadKeys("segmentRef"),
    )],
  },
  defect_intake_admitted: {
    variants: [RUN_EVENT],
    payloadVariants: [payloadVariant(combinePayloadKeys(
      WITNESSED_ACT_PAYLOAD,
      payloadKeys(
        "changeClass haltDiagnosisDigest haltDiagnosisRef intakeRef owner reEntryPoint summary triagedBy",
      ),
    ))],
  },
  run_resumed: {
    variants: [RUN_EVENT],
    payloadVariants: [payloadVariant(combinePayloadKeys(
      WITNESSED_ACT_PAYLOAD,
      payloadKeys("operatorActorRef reasonDetail reasonKind"),
    ))],
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
          payloadKeys(
            "childGraphFunctionRef failureContractRef judgmentPredicateRef",
          ),
        ),
        payloadKeys(
          "cCallRef cCallDigest callClass childGraphFunctionRef failureContractRef judgmentPredicateRef",
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
        "actorInvocationRef actorRef cCallRef dispatchOrdinal implementationRef inputDigest promptDigest requestDigest requestRef transportBindingDigest transportBindingRef workerBindingRef",
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
      combinePayloadKeys(ACTOR_TERMINAL_PAYLOAD, payloadKeys("transportDigest consumedTransportBindingRef consumedStdoutEventRefs consumedStderrEventRefs consumedArtifactEventRef")),
      payloadKeys("actorInvocationRef processRef cCallRef disposition"),
    )],
  },
  actor_invocation_failed: {
    variants: [ACTOR_INVOCATION_EVENT],
    payloadVariants: [
      payloadVariant(
        combinePayloadKeys(ACTOR_TERMINAL_PAYLOAD, payloadKeys("transportDigest consumedTransportBindingRef consumedStdoutEventRefs consumedStderrEventRefs consumedArtifactEventRef")),
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
            "actorInvocationRef actorRef apiRetryCount artifactDigests candidateDigest candidateRef exitObserved instructionContractRef materializationPlanRef observedOutputDigest processRef processSignal processStatus progressEventCount promptDigest rawOutputDigest rendererRef requestDigest requestRef resultContractRef signalSequence stderrByteLength stdoutByteLength structuredEventCount terminationConfirmed timedOut toolCallCount transportBindingDigest transportBindingRef transportDigest transportDisposition transportFailureClass transportLane workerBindingRef",
          ),
        ),
        EVIDENCE_IO_PAYLOAD,
        { evidenceClass: "probabilistic_transport" },
      ),
      payloadVariant(
        combinePayloadKeys(
          EVIDENCE_IO_PAYLOAD,
          payloadKeys(
            "childClosureRef childDisposition childExecutionBasisDigest childExecutionBasisRef childFrameId childGraphCallId childJudgmentRef childOutputDigest childReasonRef childResultDigest childResultRef childTerminalEventRef foldbackDigest foldbackEventRef foldbackRef",
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
        "cCallRef contractRef judgment judgmentDigest judgmentRef predicateRef reasonRef replayStateDigest resultDigest resultRef retryAttemptRef",
      ),
      payloadKeys(
        "judgmentRef judgmentDigest cCallRef resultRef judgment retryAttemptRef",
      ),
      undefined,
      payloadKeys("retryAttemptRef"),
    )],
  },
  assessed: {
    variants: [C_CALL_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "actorDigest actorRef assessment assessmentContractDigest assessmentContractRef assessmentDigest assessmentRef assessmentValueDigest assessmentValueRef capabilityGrantDigest capabilityGrantRef closureEligible disposition evidence executionBasisDigest executionBasisRef expectedResultDigest expectedResultRef invocationDigest invocationRef residuals",
      ),
    )],
  },
  retry_attempt_opened: {
    variants: [FRAME_EVENT],
    payloadVariants: [payloadVariant(
      payloadKeys(
        "attempt attemptDigest attemptManifestRef attemptRef budget inputContractRef inputDigest inputRef inputValue priorJudgmentRef priorRouteRef retryBoundaryRef retryPath retryTermPath retryableFailureClasses taskOrdinal wrappedTermPath",
      ),
      payloadKeys(
        "attemptRef attemptDigest attemptManifestRef retryBoundaryRef attempt",
      ),
    )],
  },
  retry_progress_recorded: {
    variants: [FRAME_EVENT],
    payloadVariants: [
      payloadVariant(
        RETRY_FAILURE_PROGRESS_PAYLOAD,
        RETRY_FAILURE_PROGRESS_PAYLOAD,
        { progressClass: "retry" },
      ),
      payloadVariant(
        RETRY_STOPPED_PROGRESS_PAYLOAD,
        RETRY_STOPPED_PROGRESS_PAYLOAD,
        { progressClass: "stopped" },
        payloadKeys("predecessorProgressRef"),
      ),
      payloadVariant(
        payloadKeys(
          "attempt attemptRef cCallRef completedRetryDepth completionClass completionWitnessEventRef judgmentRef predecessorProgressRef progressClass progressDigest progressRef resultRef retryBoundaryRef retryPath sourceCursorDigest sourceCursorRef",
        ),
        payloadKeys("progressRef progressDigest progressClass attemptRef retryBoundaryRef retryPath completedRetryDepth completionClass completionWitnessEventRef cCallRef resultRef judgmentRef sourceCursorRef sourceCursorDigest predecessorProgressRef"),
        { progressClass: "completed" },
        payloadKeys("predecessorProgressRef"),
      ),
      payloadVariant(
        payloadKeys(
          "attempt attemptRef cCallRef completedRetryDepth completionClass completionWitnessEventRef judgmentRef predecessorProgressRef progressClass progressDigest progressRef resultRef retryBoundaryRef retryPath sourceCursorDigest sourceCursorRef targetCursorDigest targetCursorRef",
        ),
        payloadKeys("progressRef progressDigest progressClass attemptRef retryBoundaryRef retryPath completedRetryDepth completionClass completionWitnessEventRef cCallRef resultRef judgmentRef sourceCursorRef sourceCursorDigest targetCursorRef targetCursorDigest predecessorProgressRef"),
        { progressClass: "completed" },
        payloadKeys("predecessorProgressRef"),
      ),
      payloadVariant(
        payloadKeys(
          "attempt attemptRef completedRetryDepth completionClass completionWitnessEventRef predecessorProgressRef progressClass progressDigest progressRef retryBoundaryRef retryPath sourceCursorDigest sourceCursorRef targetCursorDigest targetCursorRef",
        ),
        payloadKeys("progressRef progressDigest progressClass attemptRef retryBoundaryRef retryPath completedRetryDepth completionClass completionWitnessEventRef sourceCursorRef sourceCursorDigest targetCursorRef targetCursorDigest predecessorProgressRef"),
        {
          progressClass: "completed",
          completionClass: "structural_identity_success",
        },
        payloadKeys("predecessorProgressRef"),
      ),
    ],
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
        "actorCapabilityRef cCall cCallRef causedByEventRef continuationDigest continuationKind continuationRef executionBasisDigest executionBasisRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef heldCursor heldCursorDigest heldCursorRef holdRouteRef implementationSetDigest implementationSetRef inputDigest inputRef inputValue installId interactionSetDigest interactionSetRef linkDigest linkRef manifestDigest openedTraversalScope pendingJudgment pendingResult productContentDigest productId programDigest programRef programValidationRef requestContractRef requestDigest requestRef responseContractRef scopeDigest scopeRef workspaceBindingDigest workspaceBindingId catalogViewDigest catalogViewId",
      ), payloadKeys(
        "actorCapabilityRef cCall cCallRef causedByEventRef continuationDigest continuationKind continuationRef executionBasisDigest executionBasisRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef heldCursor heldCursorDigest heldCursorRef holdRouteRef implementationSetDigest implementationSetRef inputDigest inputRef inputValue installId interactionSetDigest interactionSetRef manifestDigest openedTraversalScope pendingJudgment pendingResult productContentDigest productId programDigest programRef programValidationRef requestContractRef requestDigest requestRef responseContractRef scopeDigest scopeRef workspaceBindingDigest workspaceBindingId catalogViewDigest catalogViewId",
      )),
      payloadVariant(
        payloadKeys(
          "actorCapabilityRef cCall cCallRef causedByEventRef constructionIntentDigest constructionIntentRef continuationDigest continuationKind continuationRef executionBasisDigest executionBasisRef graphDigest graphFunctionDigest graphFunctionRef graphRef graphValidationRef heldCursor heldCursorDigest heldCursorRef holdRouteRef implementationSetDigest implementationSetRef inputDigest inputRef inputValue installId interactionSetDigest interactionSetRef linkDigest linkRef manifestDigest openedTraversalScope pendingJudgment pendingResult productContentDigest productId programDigest programRef programValidationRef requestContractRef requestDigest requestRef responseContractRef scopeDigest scopeRef workspaceBindingDigest workspaceBindingId catalogViewDigest catalogViewId",
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
    payloadVariants: [payloadVariant(
      payloadKeys(
        "actorRef capabilityRef closureContract continuationRef durablePrefixDigest openedEventRef publicOperationEventRef respondedEventRef responseDigest responseRef responseValue successorCursor successorCursorDigest successorCursorRef successorInputContractRef successorInputDigest successorInputRef successorInputValue successorInputValueKind",
      ),
      payloadKeys(
        "actorRef capabilityRef closureContract continuationRef durablePrefixDigest openedEventRef publicOperationEventRef respondedEventRef responseDigest responseRef responseValue successorCursor successorCursorDigest successorCursorRef successorInputContractRef successorInputDigest successorInputRef successorInputValue successorInputValueKind",
      ),
      undefined,
      payloadKeys("successorInputContractRef"),
    )],
  },
  continuation_abandoned: {
    variants: [CONTINUATION_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "candidateDigest candidateRef causedByEventRef continuationDigest continuationKind continuationRef terminalDisposition",
    ))],
  },
  continuation_superseded: {
    variants: [CONTINUATION_EVENT],
    payloadVariants: [payloadVariant(payloadKeys(
      "candidateDigest candidateRef causedByEventRef continuationDigest continuationKind continuationRef terminalDisposition",
    ))],
  },
  continuation_reentry_link_admitted: {
    variants: [WORKSPACE_EVENT],
    payloadVariants: [
      payloadVariant(
        payloadKeys("linkDigest linkRef predecessorContinuationId predecessorDisposition predecessorRunId successorKind successorRunId workspaceBindingDigest workspaceBindingId"),
        undefined,
        { successorKind: "none" },
      ),
      payloadVariant(
        payloadKeys("continuationKind linkDigest linkRef plannedContinuationId plannedOpeningBasisDigest plannedOpeningBasisRef predecessorContinuationId predecessorDisposition predecessorRunId successorKind successorRunId workspaceBindingDigest workspaceBindingId"),
        undefined,
        { successorKind: "some" },
      ),
    ],
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
    payloadVariants: [
      payloadVariant(
        payloadKeys("cCallRef disposition judgmentRef reasonRef routeRef"),
        payloadKeys("disposition routeRef reasonRef"),
      ),
      payloadVariant(payloadKeys(
        "act actorDigest actorRef contentContractDigest contentContractRef contentKind contentValue contentValueDigest contentValueRef context evidence operatorActorRef provenance reasonDetail reasonKind subjectDigest subjectKind subjectRef witnessedActDigest witnessedActRef",
      )),
    ],
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

export interface EventStoreAppendRefusal {
  readonly kind: "event_store_append_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "prefix_mismatch" | "sink_unavailable";
  readonly message: string;
}

export type CheckedArtifactAppendResult =
  | EventStoreAppendRefusal
  | Readonly<{
      event: RuntimeEvent;
      successorPrefix: DurablePrefixCoordinate;
    }>;

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

export interface DurablePrefixCoordinate {
  readonly kind: "durable_prefix_coordinate";
  readonly schemaVersion: "5.0.0";
  readonly eventLogRef: string;
  readonly prefixLength: number;
  readonly prefixDigest: Sha256Digest;
  readonly storeIdentity: {
    readonly device: number;
    readonly inode: number;
    readonly eventContractDigest: Sha256Digest;
  };
  readonly coordinateDigest: Sha256Digest;
}

export type DurablePrefixReadFailureCode =
  | "file_identity_mismatch"
  | "prefix_length_mismatch"
  | "prefix_digest_mismatch"
  | "event_contract_digest_mismatch"
  | "event_envelope_invalid"
  | "admission_ordinal_invalid";

export class DurablePrefixReadError extends TypeError {
  constructor(
    readonly code: DurablePrefixReadFailureCode,
    message: string,
  ) {
    super(message);
  }
}

export interface NewEmptyAppendSinkRequest {
  readonly kind: "new_empty_append_sink_request";
  readonly schemaVersion: "5.0.0";
  readonly eventLogPath: string;
}

export interface EventStoreAcquisitionRefusal {
  readonly kind: "event_store_acquisition_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "basis_mismatch" | "sink_exists" | "sink_unavailable";
  readonly message: string;
}

export interface NewEmptyAppendSinkContext {
  readonly store: AbgEventStore;
  readonly prefix: DurablePrefixCoordinate;
}

export type NewEmptyAppendSinkResult =
  | EventStoreAcquisitionRefusal
  | NewEmptyAppendSinkContext;

export interface EventStoreCloseHandoff {
  readonly prefix: DurablePrefixCoordinate;
  readonly reopenAuthority: EventStoreReopenAuthority;
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
  readonly prefix: DurablePrefixCoordinate;
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

function durablePrefixCoordinate(
  path: string,
  identity: DurableFileIdentity,
  bytes: Buffer,
): DurablePrefixCoordinate {
  const body = {
    kind: "durable_prefix_coordinate" as const,
    schemaVersion: "5.0.0" as const,
    eventLogRef: pathToFileURL(path).href,
    prefixLength: bytes.byteLength,
    prefixDigest: sha256Bytes(bytes),
    storeIdentity: {
      device: identity.device,
      inode: identity.inode,
      eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
    },
  };
  const coordinate = deepFreeze({
    ...body,
    coordinateDigest: sha256Canonical(body),
  }) as DurablePrefixCoordinate;
  if (!validateDurablePrefixCoordinate(coordinate)) {
    throw new TypeError("ABG durable prefix coordinate construction failed validation");
  }
  return coordinate;
}

export function validateDurablePrefixCoordinate(
  value: unknown,
): value is DurablePrefixCoordinate {
  if (!isRecord(value)) return false;
  const keys = [
    "coordinateDigest",
    "eventLogRef",
    "kind",
    "prefixDigest",
    "prefixLength",
    "schemaVersion",
    "storeIdentity",
  ];
  if (
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((key) => !keys.includes(key)) ||
    !isRecord(value.storeIdentity)
  ) {
    return false;
  }
  const identityKeys = ["device", "eventContractDigest", "inode"];
  if (
    Object.keys(value.storeIdentity).length !== identityKeys.length ||
    Object.keys(value.storeIdentity).some((key) => !identityKeys.includes(key))
  ) {
    return false;
  }
  let canonicalEventLogRef: string;
  try {
    const url = new URL(value.eventLogRef as string);
    if (url.protocol !== "file:" || url.host !== "") return false;
    canonicalEventLogRef = pathToFileURL(resolve(fileURLToPath(url))).href;
  } catch {
    return false;
  }
  const identity = value.storeIdentity;
  const body = {
    kind: value.kind,
    schemaVersion: value.schemaVersion,
    eventLogRef: value.eventLogRef,
    prefixLength: value.prefixLength,
    prefixDigest: value.prefixDigest,
    storeIdentity: {
      device: identity.device,
      inode: identity.inode,
      eventContractDigest: identity.eventContractDigest,
    },
  };
  return value.kind === "durable_prefix_coordinate" &&
    value.schemaVersion === "5.0.0" &&
    value.eventLogRef === canonicalEventLogRef &&
    Number.isSafeInteger(value.prefixLength) &&
    (value.prefixLength as number) >= 0 &&
    isSha256Digest(value.prefixDigest) &&
    Number.isSafeInteger(identity.device) &&
    (identity.device as number) >= 0 &&
    Number.isSafeInteger(identity.inode) &&
    (identity.inode as number) >= 0 &&
    identity.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST &&
    isSha256Digest(value.coordinateDigest) &&
    sha256Canonical(body as unknown as JsonValue) === value.coordinateDigest;
}

export function validateEventStoreReopenAuthority(
  value: unknown,
): value is EventStoreReopenAuthority {
  if (!isRecord(value)) return false;
  const keys = [
    "authorityDigest",
    "device",
    "durableByteLength",
    "eventContractDigest",
    "eventLogDigest",
    "eventLogPath",
    "inode",
    "kind",
    "schemaVersion",
  ];
  if (
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((key) => !keys.includes(key)) ||
    value.kind !== "event_store_reopen_authority" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.eventLogPath !== "string" ||
    resolve(value.eventLogPath) !== value.eventLogPath ||
    !Number.isSafeInteger(value.device) ||
    (value.device as number) < 0 ||
    !Number.isSafeInteger(value.inode) ||
    (value.inode as number) < 0 ||
    !Number.isSafeInteger(value.durableByteLength) ||
    (value.durableByteLength as number) < 0 ||
    !isSha256Digest(value.eventLogDigest) ||
    value.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST ||
    !isSha256Digest(value.authorityDigest)
  ) return false;
  const body = {
    kind: value.kind,
    schemaVersion: value.schemaVersion,
    eventLogPath: value.eventLogPath,
    device: value.device,
    inode: value.inode,
    eventLogDigest: value.eventLogDigest,
    durableByteLength: value.durableByteLength,
    eventContractDigest: value.eventContractDigest,
  };
  return sha256Canonical(body as JsonValue) === value.authorityDigest;
}

export function validateEventStoreCloseHandoff(
  value: unknown,
): value is EventStoreCloseHandoff {
  if (
    !isRecord(value) ||
    Object.keys(value).length !== 2 ||
    !("prefix" in value) ||
    !("reopenAuthority" in value) ||
    !validateDurablePrefixCoordinate(value.prefix) ||
    !validateEventStoreReopenAuthority(value.reopenAuthority)
  ) return false;
  const { prefix, reopenAuthority } = value;
  return prefix.eventLogRef === pathToFileURL(reopenAuthority.eventLogPath).href &&
    prefix.prefixLength === reopenAuthority.durableByteLength &&
    prefix.prefixDigest === reopenAuthority.eventLogDigest &&
    prefix.storeIdentity.device === reopenAuthority.device &&
    prefix.storeIdentity.inode === reopenAuthority.inode &&
    prefix.storeIdentity.eventContractDigest === reopenAuthority.eventContractDigest;
}

export function readRuntimeEventsAtDurablePrefix(
  prefix: DurablePrefixCoordinate,
): readonly RuntimeEvent[] {
  if (!validateDurablePrefixCoordinate(prefix)) {
    const rawPrefix: unknown = prefix;
    const suppliedContract = typeof rawPrefix === "object" &&
        rawPrefix !== null &&
        "storeIdentity" in rawPrefix &&
        typeof rawPrefix.storeIdentity === "object" &&
        rawPrefix.storeIdentity !== null &&
        "eventContractDigest" in rawPrefix.storeIdentity
      ? rawPrefix.storeIdentity.eventContractDigest
      : undefined;
    throw new DurablePrefixReadError(
      suppliedContract !== undefined &&
          suppliedContract !== ROOT_EVENT_CONTRACT_DIGEST
        ? "event_contract_digest_mismatch"
        : "event_envelope_invalid",
      "ABG durable prefix coordinate is invalid",
    );
  }
  const path = resolve(fileURLToPath(prefix.eventLogRef));
  let descriptor: number | null = null;
  try {
    try {
      descriptor = openSync(path, constants.O_RDONLY);
    } catch (error) {
      throw new DurablePrefixReadError(
        "file_identity_mismatch",
        `ABG durable prefix file is unavailable: ${String(error)}`,
      );
    }
    const beforePath = statSync(path);
    const beforeDescriptor = fstatSync(descriptor);
    if (
      !beforePath.isFile() ||
      !beforeDescriptor.isFile() ||
      beforePath.dev !== prefix.storeIdentity.device ||
      beforePath.ino !== prefix.storeIdentity.inode ||
      beforeDescriptor.dev !== prefix.storeIdentity.device ||
      beforeDescriptor.ino !== prefix.storeIdentity.inode
    ) {
      throw new DurablePrefixReadError(
        "file_identity_mismatch",
        "ABG durable prefix file identity differs from coordinate",
      );
    }
    if (
      beforePath.size < prefix.prefixLength ||
      beforeDescriptor.size < prefix.prefixLength
    ) {
      throw new DurablePrefixReadError(
        "prefix_length_mismatch",
        "ABG durable prefix file ended before the selected prefix",
      );
    }
    const bytes = readDescriptorBytes(descriptor, prefix.prefixLength);
    const afterPath = statSync(path);
    const afterDescriptor = fstatSync(descriptor);
    if (
      afterPath.dev !== beforePath.dev ||
      afterPath.ino !== beforePath.ino ||
      afterDescriptor.dev !== beforeDescriptor.dev ||
      afterDescriptor.ino !== beforeDescriptor.ino
    ) {
      throw new DurablePrefixReadError(
        "file_identity_mismatch",
        "ABG durable prefix file identity changed during read",
      );
    }
    if (
      afterPath.size < prefix.prefixLength ||
      afterDescriptor.size < prefix.prefixLength
    ) {
      throw new DurablePrefixReadError(
        "prefix_length_mismatch",
        "ABG durable prefix file ended during read",
      );
    }
    if (sha256Bytes(bytes) !== prefix.prefixDigest) {
      throw new DurablePrefixReadError(
        "prefix_digest_mismatch",
        "ABG durable prefix bytes differ from coordinate",
      );
    }
    try {
      return validateHistoricalEvents(bytes);
    } catch (error) {
      if (error instanceof DurablePrefixReadError) throw error;
      throw new DurablePrefixReadError(
        "event_envelope_invalid",
        String(error),
      );
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

function durableEventBytes(events: readonly RuntimeEvent[]): string {
  return events
    .map((event) => `${canonicalJson(event as unknown as JsonValue)}\n`)
    .join("");
}

export function durableRuntimeEventPrefixDigest(
  events: readonly RuntimeEvent[],
): Sha256Digest {
  return sha256Bytes(Buffer.from(durableEventBytes(events), "utf8"));
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

export function assertHeldEventStoreAtDurablePrefix(
  store: AbgEventStore,
  prefix: DurablePrefixCoordinate,
): void {
  if (!validateDurablePrefixCoordinate(prefix)) {
    throw new TypeError("ABG held-store prefix is invalid");
  }
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  const descriptor = assertDurableSinkUnchanged(state);
  if (
    state.durableLogPath === null ||
    state.durableFileIdentity === null ||
    pathToFileURL(state.durableLogPath).href !== prefix.eventLogRef ||
    state.durableByteLength !== prefix.prefixLength ||
    state.durableFileIdentity.device !== prefix.storeIdentity.device ||
    state.durableFileIdentity.inode !== prefix.storeIdentity.inode
  ) {
    throw new TypeError("ABG held store differs from the selected durable prefix");
  }
  const bytes = readDescriptorBytes(descriptor, state.durableByteLength);
  const held = durablePrefixCoordinate(
    state.durableLogPath,
    state.durableFileIdentity,
    bytes,
  );
  if (held.coordinateDigest !== prefix.coordinateDigest) {
    throw new TypeError("ABG held store bytes differ from the selected durable prefix");
  }
}

export function selectHeldEventStoreDurablePrefix(
  store: AbgEventStore,
): DurablePrefixCoordinate {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  const descriptor = assertDurableSinkUnchanged(state);
  return durablePrefixCoordinate(
    state.durableLogPath!,
    state.durableFileIdentity!,
    readDescriptorBytes(descriptor, state.durableByteLength),
  );
}

export function assertHeldEventStoreAtRuntimeEventPrefix(
  store: AbgEventStore,
  expectedEvents: readonly RuntimeEvent[],
): DurablePrefixCoordinate {
  const held = selectHeldEventStoreDurablePrefix(store);
  const expectedEventDigest = sha256Canonical(
    expectedEvents as unknown as JsonValue,
  );
  const durableEvents = readRuntimeEventsAtDurablePrefix(held);
  if (
    store.digest() !== expectedEventDigest ||
    sha256Canonical(durableEvents as unknown as JsonValue) !==
      expectedEventDigest ||
    held.prefixDigest !== durableRuntimeEventPrefixDigest(expectedEvents)
  ) {
    throw new TypeError(
      "ABG held durable predecessor bytes differ from the exact in-memory event prefix",
    );
  }
  return held;
}

function exactDurableAppendAttemptSuffix(
  descriptor: number,
  priorByteLength: number,
  encoded: Buffer,
  observedByteLength: number,
): boolean {
  const suffixByteLength = observedByteLength - priorByteLength;
  if (suffixByteLength < 0 || suffixByteLength > encoded.byteLength) {
    return false;
  }
  if (suffixByteLength === 0) return true;
  const observed = Buffer.alloc(suffixByteLength);
  let offset = 0;
  while (offset < observed.byteLength) {
    const read = readSync(
      descriptor,
      observed,
      offset,
      observed.byteLength - offset,
      priorByteLength + offset,
    );
    if (read === 0) return false;
    offset += read;
  }
  return observed.equals(encoded.subarray(0, suffixByteLength));
}

function appendDurablyBatch(
  state: EventStoreState,
  events: readonly RuntimeEvent[],
): DurablePrefixCoordinate | null {
  if (events.length === 0 || state.durableLogPath === null) return null;
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
    return durablePrefixCoordinate(
      state.durableLogPath,
      state.durableFileIdentity!,
      readDescriptorBytes(descriptor, state.durableByteLength),
    );
  } catch (error) {
    let rollbackError: unknown;
    try {
      const status = fstatSync(descriptor);
      if (!exactDurableAppendAttemptSuffix(
        descriptor,
        priorByteLength,
        encoded,
        status.size,
      )) {
        throw new TypeError(
          "ABG durable event sink contains a foreign or ambiguous suffix; ownership is poisoned without truncation",
        );
      }
      if (status.size > priorByteLength) {
        ftruncateSync(descriptor, priorByteLength);
        fsyncSync(descriptor);
      }
      state.durableByteLength = priorByteLength;
      assertDurableSinkUnchanged(state);
    } catch (caught) {
      rollbackError = caught;
      try {
        releaseDurableOwnership(state);
      } catch {
        // The poisoned context is already closed; retain both primary failures.
      }
      throw new AggregateError(
        [error, rollbackError],
        "ABG durable event append failed and its suffix could not be proven safe to roll back",
      );
    }
    throw error;
  }
}

export function projectRuntimeEventFromValidatedHistory(
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

const EVENT_STORE_CONSTRUCTION_AUTHORITY = Symbol(
  "event_store_construction_authority",
);

export class AbgEventStore {
  constructor(authority: typeof EVENT_STORE_CONSTRUCTION_AUTHORITY) {
    if (authority !== EVENT_STORE_CONSTRUCTION_AUTHORITY) {
      throw new TypeError("ABG Event Store construction is module-private");
    }
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

  projectReopenAuthorityAndClose(): EventStoreCloseHandoff {
    const state = eventState.get(this);
    if (state === undefined) throw new TypeError("event store state is unavailable");
    const descriptor = assertDurableSinkUnchanged(state);
    const path = state.durableLogPath!;
    const identity = state.durableFileIdentity!;
    const bytes = readDescriptorBytes(descriptor, state.durableByteLength);
    assertDurableSinkUnchanged(state);
    const authorityBody = {
      kind: "event_store_reopen_authority" as const,
      schemaVersion: "5.0.0" as const,
      eventLogPath: path,
      device: identity.device,
      inode: identity.inode,
      eventLogDigest: sha256Bytes(bytes),
      durableByteLength: state.durableByteLength,
      eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
    };
    const reopenAuthority = deepFreeze({
      ...authorityBody,
      authorityDigest: sha256Canonical(authorityBody),
    });
    const prefix = durablePrefixCoordinate(path, identity, bytes);
    const handoff = Object.freeze({ prefix, reopenAuthority });
    if (!validateEventStoreCloseHandoff(handoff)) {
      throw new TypeError("ABG durable close handoff failed validation");
    }
    releaseDurableOwnership(state);
    return handoff;
  }
}

function acquisitionRefusal(
  code: EventStoreAcquisitionRefusal["code"],
  message: string,
): EventStoreAcquisitionRefusal {
  return deepFreeze({
    kind: "event_store_acquisition_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

export function createNewEmptyAppendSink(
  request: NewEmptyAppendSinkRequest,
): NewEmptyAppendSinkResult {
  if (
    !isRecord(request) ||
    Object.keys(request).length !== 3 ||
    !["eventLogPath", "kind", "schemaVersion"].every((key) => key in request) ||
    request.kind !== "new_empty_append_sink_request" ||
    request.schemaVersion !== "5.0.0" ||
    typeof request.eventLogPath !== "string" ||
    request.eventLogPath.length === 0 ||
    resolve(request.eventLogPath) !== request.eventLogPath
  ) {
    return acquisitionRefusal(
      "basis_mismatch",
      "new-empty append acquisition requires one exact canonical request",
    );
  }
  const path = request.eventLogPath;
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "", { encoding: "utf8", flag: "wx" });
  } catch (error) {
    const code = isRecord(error) && error.code === "EEXIST"
      ? "sink_exists" as const
      : "sink_unavailable" as const;
    return acquisitionRefusal(
      code,
      code === "sink_exists"
        ? `new-empty append acquisition requires an absent target: ${String(error)}`
        : `new-empty append acquisition cannot create its explicit target: ${String(error)}`,
    );
  }
  let owned:
    | {
        readonly descriptor: number;
        readonly identity: DurableFileIdentity;
        readonly lock: DurableAppendLock;
      }
    | undefined;
  try {
    owned = openOwnedDurableSink(path);
    const store = new AbgEventStore(EVENT_STORE_CONSTRUCTION_AUTHORITY);
    eventState.set(store, {
      events: [],
      durableLogPath: path,
      durableDescriptor: owned.descriptor,
      durableFileIdentity: owned.identity,
      durableAppendLock: owned.lock,
      durableByteLength: 0,
      durableAppendClosed: false,
      transactionStartIndex: null,
    });
    const prefix = durablePrefixCoordinate(path, owned.identity, Buffer.alloc(0));
    return Object.freeze({ store, prefix });
  } catch (error) {
    if (owned !== undefined) {
      try {
        closeSync(owned.descriptor);
      } catch {
        // Preserve the acquisition refusal.
      }
      try {
        releaseDurableAppendLock(owned.lock);
      } catch {
        // Preserve the acquisition refusal.
      }
    }
    try {
      unlinkSync(path);
    } catch {
      // Preserve the acquisition refusal.
    }
    return acquisitionRefusal(
      "sink_unavailable",
      `new-empty append acquisition failed: ${String(error)}`,
    );
  }
}

export function isEventStoreAdmissionOpen(store: AbgEventStore): boolean {
  const state = eventState.get(store);
  return state !== undefined && !state.durableAppendClosed;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactReferenceDigestSet(value: unknown): boolean {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) =>
      isRecord(entry) &&
      Object.keys(entry).length === 2 &&
      Object.hasOwn(entry, "ref") &&
      Object.hasOwn(entry, "digest") &&
      typeof entry.ref === "string" &&
      entry.ref.length > 0 &&
      isSha256Digest(entry.digest)
    ) &&
    new Set(value.map((entry) => (entry as { readonly ref: string }).ref))
        .size === value.length;
}

function exactStringKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  return actual.length === required.length &&
    actual.every((key, index) => key === required[index]);
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
  if (candidate.kind === "retry_progress_recorded") {
    const positiveInteger = (value: JsonValue | undefined): boolean =>
      Number.isSafeInteger(value) && Number(value) > 0;
    const positiveIntegerArray = (value: JsonValue | undefined): boolean =>
      Array.isArray(value) && value.length > 0 && value.every(positiveInteger);
    const retryPath = Array.isArray(payload.retryPath) ? payload.retryPath : [];
    if (
      !positiveInteger(payload.attempt) ||
      !positiveIntegerArray(payload.retryPath) ||
      payload.attempt !== retryPath.at(-1) ||
      ((payload.progressClass === "retry" ||
        payload.progressClass === "stopped") && (
        !positiveInteger(payload.budget) ||
        !positiveIntegerArray(payload.completedAttempts) ||
        !Number.isSafeInteger(payload.remainingBudget) ||
        Number(payload.remainingBudget) < 0 ||
        !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
          String(payload.failureClass) as
            (typeof WORKER_TRANSPORT_FAILURE_CLASS_VALUES)[number],
        )
      )) ||
      (payload.progressClass === "stopped" &&
        !(
          (payload.stopReason === "boundary_terminal" &&
            payload.predecessorProgressRef === null) ||
          (payload.stopReason === "propagated_inner_stop" &&
            typeof payload.predecessorProgressRef === "string" &&
            payload.predecessorProgressRef.length > 0)
        )) ||
      (payload.progressClass === "completed" &&
        (!positiveInteger(payload.completedRetryDepth) ||
          payload.completedRetryDepth !== retryPath.length ||
          ![
            "judged_success",
            "fan_out_success",
            "fh_resume_success",
            "structural_identity_success",
          ].includes(String(payload.completionClass)) ||
          (payload.completionClass === "structural_identity_success" &&
            (Object.hasOwn(payload, "cCallRef") ||
              Object.hasOwn(payload, "resultRef") ||
              Object.hasOwn(payload, "judgmentRef"))) ||
          (payload.completionClass !== "structural_identity_success" &&
            (!Object.hasOwn(payload, "cCallRef") ||
              !Object.hasOwn(payload, "resultRef") ||
              !Object.hasOwn(payload, "judgmentRef")))))
    ) {
      throw new TypeError("retry progress payload carries invalid required value types");
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
    candidate.kind === "assessed" &&
    !["admitted", "rejected", "retry", "blocked"].includes(
      String(payload.disposition),
    )
  ) {
    throw new TypeError("result assessment event carries an unknown disposition");
  }
  if (
    [
      "declaration_reprice_admitted",
      "replay_log_attested",
      "workspace_hygiene_stamped",
      "defect_intake_admitted",
      "run_resumed",
      "run_stopped",
    ].includes(candidate.kind) &&
    Object.hasOwn(payload, "witnessedActRef")
  ) {
    const expectedAct = candidate.kind === "declaration_reprice_admitted"
      ? "reprice"
      : candidate.kind === "replay_log_attested"
        ? "attest"
        : candidate.kind === "workspace_hygiene_stamped"
          ? "hygiene-stamp"
          : candidate.kind === "defect_intake_admitted"
            ? "intake"
            : candidate.kind === "run_resumed"
              ? "run-resumed"
              : "run-stopped";
    const witnessedBody = {
      act: payload.act,
      actor: { ref: payload.actorRef, digest: payload.actorDigest },
      subject: {
        kind: payload.subjectKind,
        ref: payload.subjectRef,
        digest: payload.subjectDigest,
      },
      content: {
        kind: payload.contentKind,
        contractRef: payload.contentContractRef,
        contractDigest: payload.contentContractDigest,
        valueRef: payload.contentValueRef,
        valueDigest: payload.contentValueDigest,
        value: payload.contentValue,
      },
      context: payload.context,
      evidence: payload.evidence,
      provenance: payload.provenance,
    };
    const witnessedActDigest = sha256Canonical(
      witnessedBody as unknown as JsonValue,
    );
    if (
      payload.act !== expectedAct ||
      !isSha256Digest(payload.actorDigest) ||
      !isSha256Digest(payload.subjectDigest) ||
      !isSha256Digest(payload.contentContractDigest) ||
      !isSha256Digest(payload.contentValueDigest) ||
      payload.contentValueDigest !== sha256Canonical(payload.contentValue!) ||
      !isExactReferenceDigestSet(payload.evidence) ||
      !isExactReferenceDigestSet(payload.provenance) ||
      payload.witnessedActDigest !== witnessedActDigest ||
      payload.witnessedActRef !==
        `witnessed-act://abiogenesis/${witnessedActDigest.slice("sha256:".length)}`
    ) {
      throw new TypeError(
        "witness event payload is not one exact self-certified actor-attributed act",
      );
    }
  }
  if (
    candidate.kind === "declaration_reprice_admitted" &&
    (
      payload.beforeDigest === payload.afterDigest ||
      ![
        "goal_reprice",
        "intent_reprice",
        "product_reprice",
        "requirement_reprice",
        "design_reframe",
        "realization_refactor",
      ].includes(String(payload.changeClass)) ||
      payload.repriceRef !== `declaration-reprice:${sha256Canonical({
        declarationRef: payload.declarationRef!,
        beforeDigest: payload.beforeDigest!,
        afterDigest: payload.afterDigest!,
        changeClass: payload.changeClass!,
        owningTicketRef: payload.owningTicketRef!,
      } as JsonValue)}`
    )
  ) {
    throw new TypeError("declaration reprice event carries invalid change truth");
  }
  if (
    candidate.kind === "replay_log_attested" &&
    (
      !Number.isSafeInteger(payload.eventCount) ||
      Number(payload.eventCount) < 0 ||
      payload.attestationRef !== `replay-attestation:${sha256Canonical({
        basisId: candidate.basisId,
        chainDigest: payload.chainDigest!,
        eventCount: payload.eventCount!,
        attestedBy: payload.attestedBy!,
      } as JsonValue)}`
    )
  ) {
    throw new TypeError("replay attestation event is not self-certified");
  }
  if (
    candidate.kind === "defect_intake_admitted" &&
    (
      ![
        "goal_reprice",
        "intent_reprice",
        "product_reprice",
        "requirement_reprice",
        "design_reframe",
        "realization_refactor",
      ].includes(String(payload.changeClass)) ||
      ![
        "goals",
        "intent",
        "product_definition",
        "requirements",
        "design_surface",
        "realization",
        "proof",
      ].includes(String(payload.reEntryPoint)) ||
      payload.intakeRef !== `defect-intake:${sha256Canonical({
        basisId: candidate.basisId,
        haltDiagnosisRef: payload.haltDiagnosisRef!,
        owner: payload.owner!,
        changeClass: payload.changeClass!,
        reEntryPoint: payload.reEntryPoint!,
        summary: payload.summary!,
        evidenceRefs: (payload.evidence as unknown as readonly {
          readonly ref: string;
        }[]).map((row) => row.ref),
        triagedBy: payload.triagedBy!,
      } as unknown as JsonValue)}`
    )
  ) {
    throw new TypeError("defect intake event carries an invalid re-entry relation");
  }
  if (candidate.kind === "workspace_hygiene_stamped") {
    if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
      throw new TypeError("workspace hygiene event requires non-empty rows");
    }
    for (const row of payload.rows) {
      if (
        !isRecord(row) ||
        Object.keys(row).length !== 5 ||
        !exactStringKeys(row, [
          "artifactRef",
          "observedDigest",
          "admittedDigest",
          "classification",
          "copyOutRef",
        ])
      ) {
        throw new TypeError("workspace hygiene event carries an invalid row");
      }
      const expected = row.observedDigest === null && row.admittedDigest === null
        ? null
        : row.observedDigest === null
          ? "missing"
          : row.admittedDigest === null
            ? "untracked"
            : row.observedDigest === row.admittedDigest
              ? "clean"
              : "foreign_write";
      if (
        expected === null ||
        row.classification !== expected ||
        (expected === "foreign_write" &&
          (typeof row.copyOutRef !== "string" || row.copyOutRef.length === 0))
      ) {
        throw new TypeError("workspace hygiene row differs from digest-pair truth");
      }
    }
    const hygieneDigest = sha256Canonical({
      basisId: candidate.basisId,
      segmentRef: payload.segmentRef!,
      observedBy: payload.observedBy!,
      rows: payload.rows,
    } as unknown as JsonValue);
    if (payload.hygieneRef !== `workspace-hygiene:${hygieneDigest}`) {
      throw new TypeError("workspace hygiene event is not self-certified");
    }
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
    Object.hasOwn(payload, "disposition") &&
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
  if (
    candidate.kind === "run_stopped" &&
    Object.hasOwn(payload, "reasonKind") &&
    ![
      "operator_stop",
      "operator_abort",
      "external_interruption",
      "campaign_close",
    ].includes(String(payload.reasonKind))
  ) {
    throw new TypeError("operator run stop event carries an unknown reason kind");
  }
  if (
    candidate.kind === "run_resumed" &&
    ![
      "operator_resume",
      "reprice_reentry",
      "external_recovery",
      "campaign_continue",
    ].includes(String(payload.reasonKind))
  ) {
    throw new TypeError("operator run resume event carries an unknown reason kind");
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
      !Number.isSafeInteger(admissionOrdinal) ||
      admissionOrdinal !== admitted.length + 1
    ) {
      throw new DurablePrefixReadError(
        "admission_ordinal_invalid",
        "durable ABG event log contains an invalid admission ordinal",
      );
    }
    if (
      typeof eventId !== "string" ||
      !isSha256Digest(payloadDigest) ||
      !isRuntimeEventCandidateShape(candidateValue)
    ) {
      throw new TypeError("durable ABG event log contains an invalid envelope");
    }
    const reconstructed = projectRuntimeEventFromValidatedHistory(
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
  authority: unknown,
): EventStoreReopenResult {
  if (
    isRecord(authority) &&
    isSha256Digest(authority.eventContractDigest) &&
    authority.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST
  ) {
    return reopenRefusal(
      "contract_mismatch",
      "event-store reopen authority names another event contract",
    );
  }
  if (!validateEventStoreReopenAuthority(authority)) {
    return reopenRefusal(
      "basis_mismatch",
      "event-store reopen authority is not self-consistent",
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

  const store = new AbgEventStore(EVENT_STORE_CONSTRUCTION_AUTHORITY);
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
  const prefix = durablePrefixCoordinate(exactPath, owned.identity, bytes);
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
    prefix,
  });
}

export function admitRuntimeEvent(
  store: AbgEventStore,
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  if (candidate.kind === "public_operation_artifact_admitted") {
    throw new TypeError(
      "artifact truth is reachable only through its checked owner ingress",
    );
  }
  return admitRuntimeEventInternal(store, candidate).event;
}

function admitRuntimeEventInternal(
  store: AbgEventStore,
  candidate: RuntimeEventCandidate,
): Readonly<{
  event: RuntimeEvent;
  successorPrefix: DurablePrefixCoordinate | null;
}> {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  const events = state.events;
  const event = projectRuntimeEventFromValidatedHistory(events, candidate);
  const successorPrefix =
    state.durableLogPath !== null &&
    state.transactionStartIndex === null
      ? appendDurablyBatch(state, [event])
      : null;
  events.push(event);
  return Object.freeze({ event, successorPrefix });
}

function appendRefusal(
  code: EventStoreAppendRefusal["code"],
  message: string,
): EventStoreAppendRefusal {
  return deepFreeze({
    kind: "event_store_append_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

export function appendCheckedArtifactEvent(
  store: AbgEventStore,
  expectedPredecessor: DurablePrefixCoordinate,
  initiatedEvent: RuntimeEventCandidate & Readonly<{
    kind: "public_operation_artifact_admitted";
  }>,
): CheckedArtifactAppendResult {
  if (
    !isRecord(initiatedEvent.payload) ||
    ![
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
    ].includes(String(initiatedEvent.payload.operationId))
  ) {
    throw new TypeError(
      "checked artifact ingress is closed to Product install and workspace binding",
    );
  }
  try {
    assertHeldEventStoreAtDurablePrefix(store, expectedPredecessor);
  } catch (error) {
    return appendRefusal("prefix_mismatch", String(error));
  }
  try {
    const admitted = admitRuntimeEventInternal(store, initiatedEvent);
    if (admitted.successorPrefix === null) {
      throw new TypeError("checked artifact append produced no durable successor");
    }
    return Object.freeze({
      event: admitted.event,
      successorPrefix: admitted.successorPrefix,
    });
  } catch (error) {
    return appendRefusal("sink_unavailable", String(error));
  }
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
    if (candidate.kind === "public_operation_artifact_admitted") {
      throw new TypeError(
        "artifact truth is reachable only through its checked owner ingress",
      );
    }
    const event = projectRuntimeEventFromValidatedHistory(staged, candidate);
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

export interface RuntimeEventTransactionResult<T> {
  readonly value: T;
  readonly successorPrefix: DurablePrefixCoordinate | null;
}

export interface NonEmptyRuntimeEventTransactionResult<T> {
  readonly value: T;
  readonly successorPrefix: DurablePrefixCoordinate;
}

function runRuntimeEventTransaction<T>(
  store: AbgEventStore,
  action: () => T,
  requireDurableSuccessor = false,
): RuntimeEventTransactionResult<T> {
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
    const value = action();
    const admitted = state.events.slice(startIndex);
    if (
      requireDurableSuccessor &&
      (state.durableLogPath === null || admitted.length === 0)
    ) {
      throw new TypeError(
        "non-empty durable ABG transaction admitted no durable events",
      );
    }
    const successorPrefix = state.durableLogPath !== null && admitted.length !== 0
      ? appendDurablyBatch(state, admitted)
      : null;
    return Object.freeze({ value, successorPrefix });
  } catch (error) {
    state.events.splice(startIndex);
    throw error;
  } finally {
    state.transactionStartIndex = null;
  }
}

export function admitRuntimeEventTransaction<T>(
  store: AbgEventStore,
  action: () => T,
): T {
  return runRuntimeEventTransaction(store, action).value;
}

export function admitRuntimeEventTransactionAtExpectedPrefix<T>(
  store: AbgEventStore,
  expectedPrefixDigest: Sha256Digest,
  action: () => T,
): RuntimeEventTransactionResult<T> {
  if (store.digest() !== expectedPrefixDigest) {
    throw new TypeError(
      "runtime event append requires the exact expected immutable prefix",
    );
  }
  return runRuntimeEventTransaction(store, action);
}

/**
 * The only cross-owner transaction ingress. The durable coordinate is the
 * caller's authority; ABG alone translates it to the in-memory event digest
 * used by its transaction guard.
 */
export function admitRuntimeEventTransactionAtDurablePrefix<T>(
  store: AbgEventStore,
  expectedPredecessor: DurablePrefixCoordinate,
  action: () => T,
): RuntimeEventTransactionResult<T> {
  assertHeldEventStoreAtDurablePrefix(store, expectedPredecessor);
  const durableEvents = readRuntimeEventsAtDurablePrefix(expectedPredecessor);
  const expectedEventDigest = sha256Canonical(
    durableEvents as unknown as JsonValue,
  );
  if (store.digest() !== expectedEventDigest) {
    throw new TypeError(
      "runtime event transaction requires the exact durable event predecessor",
    );
  }
  return runRuntimeEventTransaction(store, action);
}

/**
 * Admits at least one event at an exact durable predecessor. Receipt validation
 * belongs inside `action`; once this returns, the successor is non-null by
 * construction and callers may only attach it to the completed receipt body.
 */
export function admitNonEmptyRuntimeEventTransactionAtDurablePrefix<T>(
  store: AbgEventStore,
  expectedPredecessor: DurablePrefixCoordinate,
  action: () => T,
): NonEmptyRuntimeEventTransactionResult<T> {
  assertHeldEventStoreAtDurablePrefix(store, expectedPredecessor);
  const durableEvents = readRuntimeEventsAtDurablePrefix(expectedPredecessor);
  const expectedEventDigest = sha256Canonical(
    durableEvents as unknown as JsonValue,
  );
  if (store.digest() !== expectedEventDigest) {
    throw new TypeError(
      "runtime event transaction requires the exact durable event predecessor",
    );
  }
  return runRuntimeEventTransaction(
    store,
    action,
    true,
  ) as NonEmptyRuntimeEventTransactionResult<T>;
}

export function assertRuntimeEventTransactionActive(
  store: AbgEventStore,
): void {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  if (state.transactionStartIndex === null) {
    throw new TypeError(
      "planned event admission requires one active outer transaction",
    );
  }
}

export function isRuntimeEventTransactionActive(
  store: AbgEventStore,
): boolean {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  return state.transactionStartIndex !== null;
}

export function compareAndAppendExpectedPrefix(
  store: AbgEventStore,
  expectedPrefixDigest: Sha256Digest,
  factories: readonly RuntimeEventCandidateFactory[],
): readonly RuntimeEvent[] {
  if (store.digest() !== expectedPrefixDigest) {
    throw new TypeError(
      "runtime event append requires the exact expected immutable prefix",
    );
  }
  return admitRuntimeEventBatch(store, factories);
}
