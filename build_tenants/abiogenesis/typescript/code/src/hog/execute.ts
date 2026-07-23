import {
  admitApplicationChildPreparationRefusal,
  admitApplicationChildFoldback,
  admitChildClosure,
  admitChildFoldback,
  admitChildPreparationRefusal,
  admitClosure,
  admitEvidence,
  admitFanOutCompletion,
  admitJudgment,
  admitResult,
  admitRetryAttempt,
  admitRetryProgress,
  admitRecursionRoute,
  admitRuntimeFailure,
  admitRoute,
  completeRejectedCCall,
  deriveProbabilisticTransportEvidence,
  deriveSubTraversalEvidence,
  openCCall,
  projectRetryEligibility,
  replay,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type ActorProcessObservation,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type CCallEvidenceCandidate,
  type CCallAdmissionRejection,
  type CCall,
  type ExecutionBasis,
  type FanOutCompletionAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RetryInputBasis,
  type RuntimeAdmissionBasis,
  invokeActorProcess,
} from "../abg/index.js";
import type {
  LeafInvocationPort,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from "../implementation/invocation_port.js";
import type {
  ClosureContract,
  FanOutApplication,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import type {
  DeterministicEvidenceCandidate,
  ProbabilisticTransportEvidenceCandidate,
} from "../abg/c_call.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  proposeFailureJudgment,
  proposeJudgment,
  type DeclaredJudgmentRelation,
} from "./judgment.js";
import {
  proposeBlockedRoute,
  proposeFanOutRoute,
  proposeJudgedRoute,
  proposeRecursionRoute,
  proposeRetryRoute,
  proposeWorkflowBlockedRoute,
} from "./traversal_route.js";
import {
  applyRoute,
  applyRecursionRoute,
  deriveCompletedTraversalStep,
  deriveRecursionReentryCursor,
  deriveRetryTraversalStep,
  type TraversalCursor,
  type TraversalStep,
  type TraversalStopRef,
} from "./traversal.js";

export interface DeterministicLeafSuccessCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface DeterministicLeafFailureCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef: string;
}

export type DeterministicLeafCandidate<Output> =
  | DeterministicLeafFailureCandidate
  | DeterministicLeafSuccessCandidate<Output>;

export interface ExecutableLeafSuccessCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly CCallEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface ExecutableLeafFailureCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure";
  readonly evidenceCandidates: readonly CCallEvidenceCandidate[];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef: string;
}

export type ExecutableLeafCandidate<Output> =
  | ExecutableLeafFailureCandidate
  | ExecutableLeafSuccessCandidate<Output>;

export interface ExecutableTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface ExecutableTraversalCompletion {
  readonly kind: "executable_traversal_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "advanced"
    | "application_ready"
    | "blocked"
    | "closed"
    | "failed"
    | "refused";
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly closureRef: string | null;
  readonly nextCursor: TraversalCursor | null;
  readonly resultValue: JsonValue | null;
  readonly continuationKind: "advance" | "retry" | null;
  readonly nextInputContractRef: string | null;
  readonly replayState: ReplayState;
  readonly diagnosticRef: string | null;
}

export interface RetainedRetryInput extends RetryInputBasis {
  readonly value: Readonly<Record<string, JsonValue>>;
}

export interface CompleteExecutableTraversalInput<
  Input,
  Output,
> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: TraversalStopRef;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly retryInput?: RetainedRetryInput;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly terminalMode?:
    | "close_run"
    | "return_to_application"
    | "return_to_parent";
  readonly applicationCompletionMode?: "close_run" | "return_to_parent";
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteDeferredRecursionInput {
  readonly completion: ExecutableTraversalCompletion;
  readonly application: Readonly<RecurseApplication>;
  readonly clock: ExecutableTraversalClock;
}

export interface AdvanceDeferredRecursionInput
  extends CompleteDeferredRecursionInput {
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
}

export interface BlockDeferredRecursionPreparationInput
  extends CompleteDeferredRecursionInput {
  readonly preparationRefusal: {
    readonly stage:
      | "basis_admission"
      | "graph_materialization"
      | "graph_validation"
      | "membership"
      | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
  };
}

interface WorkflowParentTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly graph: Readonly<GtlGraph>;
  readonly workflowStep: TraversalStep;
  readonly parentCCall: CCall;
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteWorkflowPreparationRefusalInput
  extends WorkflowParentTraversalInput {
  readonly preparationRefusal: {
    readonly kind: "child_traversal_preparation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly stage:
      | "basis_admission"
      | "graph_materialization"
      | "graph_validation"
      | "membership"
      | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
  };
}

export interface CompleteWorkflowTraversalInput
  extends WorkflowParentTraversalInput {
  readonly program: Readonly<GtlProgram>;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly resultValueKind: string;
  readonly failureValueKind: string;
  readonly validateSuccessResult: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly judgmentRelation: DeclaredJudgmentRelation<
    Readonly<Record<string, JsonValue>>,
    Readonly<Record<string, JsonValue>>
  >;
  readonly fanOutApplication?: Readonly<FanOutApplication>;
  readonly validateFanOutVector?: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
}

export type DeterministicTraversalClock = ExecutableTraversalClock;
export type DeterministicTraversalCompletion = ExecutableTraversalCompletion;
export type CompleteDeterministicTraversalInput<Input, Output> =
  CompleteExecutableTraversalInput<Input, Output>;

interface DeferredApplicationState {
  readonly input: CompleteExecutableTraversalInput<unknown, unknown>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly continuationStep: TraversalStep;
}

const deferredApplicationStates = new WeakMap<
  object,
  DeferredApplicationState
>();

function basis(
  clock: ExecutableTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

function cursorBasis<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  stage: string,
): RuntimeAdmissionBasis {
  const eventRef = traversalCursorAdmissionEventRef(
    input.store,
    input.traversalStop.cursor,
  );
  return {
    ...basis(input.clock, stage),
    causationEventRefs: eventRef === null ? [] : [eventRef],
  };
}

function completion(
  disposition: ExecutableTraversalCompletion["disposition"],
  replayState: ReplayState,
  values: {
    readonly cCallRef?: string;
    readonly resultRef?: string;
    readonly judgmentRef?: string;
    readonly closureRef?: string;
    readonly nextCursor?: TraversalCursor;
    readonly resultValue?: JsonValue;
    readonly continuationKind?: "advance" | "retry";
    readonly nextInputContractRef?: string;
    readonly diagnosticRef?: string;
  } = {},
): ExecutableTraversalCompletion {
  return deepFreeze({
    kind: "executable_traversal_completion" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: values.cCallRef ?? null,
    resultRef: values.resultRef ?? null,
    judgmentRef: values.judgmentRef ?? null,
    closureRef: values.closureRef ?? null,
    nextCursor: values.nextCursor ?? null,
    resultValue: values.resultValue ?? null,
    continuationKind: values.continuationKind ?? null,
    nextInputContractRef: values.nextInputContractRef ?? null,
    replayState,
    diagnosticRef: values.diagnosticRef ?? null,
  }) as ExecutableTraversalCompletion;
}

function replayRun(input: Pick<CompleteExecutableTraversalInput<unknown, unknown>, "store" | "openedTraversalScope">): ReplayState {
  return replay(input.store, { runId: input.openedTraversalScope.runId });
}

function completeBlockedTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  values: {
    readonly judgmentRef: string;
    readonly judgmentEventRef: string;
    readonly reasonRef: string;
    readonly resultRef: string;
  },
): ExecutableTraversalCompletion {
  const resultEvent = input.store.readAll().find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      isRecord(event.payload) &&
      event.payload.resultRef === values.resultRef,
  );
  const resultValue =
    resultEvent !== undefined &&
      isRecord(resultEvent.payload) &&
      Object.hasOwn(resultEvent.payload, "value")
      ? resultEvent.payload.value as JsonValue
      : null;
  const currentReplay = replayRun(input);
  const proposal = proposeBlockedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    values.judgmentRef,
    currentReplay,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    const diagnosticRef = `diagnostic://abiogenesis/hog/${proposal.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "blocked-route-proposal-refusal"),
        causationEventRefs: [values.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      diagnosticRef,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    currentReplay,
    proposal,
    basis(input.clock, "blocked-route"),
    {
      cCall,
      judgmentRef: values.judgmentRef,
      judgmentEventRef: values.judgmentEventRef,
      reasonRef: values.reasonRef,
    },
    { terminalizeRun: input.terminalMode !== "return_to_parent" },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    (input.terminalMode !== "return_to_parent" && route.runStoppedEventRef === null)
  ) {
    const diagnosticRef = route.kind === "admitted_traversal_route"
      ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
      : `diagnostic://abiogenesis/hog/${route.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "blocked-route-admission-refusal"),
        causationEventRefs: [values.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      diagnosticRef,
    });
  }
  return completion("blocked", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: values.resultRef,
    judgmentRef: values.judgmentRef,
    resultValue,
    diagnosticRef: values.reasonRef,
  });
}

function completeRetryTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  rejection: CCallAdmissionRejection,
  failureClass: "contract_failure" | "no_output" | "transport_failure",
): ExecutableTraversalCompletion | null {
  const eligibility = projectRetryEligibility(
    input.store,
    input.graph,
    input.traversalStop.cursor,
    failureClass,
    rejection.diagnosticRef,
  );
  if (eligibility.disposition !== "retry") return null;
  const retryInput = input.retryInput;
  if (
    retryInput === undefined ||
    retryInput.inputContractRef.length === 0 ||
    sha256Canonical(retryInput.value as unknown as JsonValue) !==
      retryInput.inputDigest
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/hog/retry-input-basis-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      eligibility as unknown as JsonValue,
      diagnosticRef,
      cursorBasis(input, "retry-input-refusal"),
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      diagnosticRef,
    });
  }
  const rejected = completeRejectedCCall(
    input.store,
    cCall,
    rejection,
    basis(input.clock, "retry-judgment"),
    "retry",
  );
  const progress = admitRetryProgress(
    input.store,
    input.graph,
    input.traversalStop.cursor,
    cCall,
    rejected,
    failureClass,
    rejection.diagnosticRef,
    basis(input.clock, "retry-progress"),
  );
  if (progress.kind !== "retry_progress_admission") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${progress.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      progress as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-progress-refusal"),
        causationEventRefs: [rejected.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const retryStep = deriveRetryTraversalStep(
    input.graph,
    input.traversalStop.cursor,
    retryInput,
  );
  if (retryStep.kind !== "traversal_step" || retryStep.targetCursor === null) {
    const diagnosticRef = retryStep.kind === "traversal_refusal"
      ? `diagnostic://abiogenesis/hog/${retryStep.code}@5`
      : "diagnostic://abiogenesis/hog/retry-target-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      retryStep as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-step-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const progressReplay = replayRun(input);
  const proposal = proposeRetryRoute(
    input.graph,
    retryStep,
    cCall,
    progress,
    progressReplay,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${proposal.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-route-proposal-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    retryStep.targetCursor,
    progressReplay,
    proposal,
    basis(input.clock, "retry-route"),
    { cCall, progress },
  );
  if (route.kind !== "admitted_traversal_route") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${route.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-route-admission-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const nextCursor = applyRoute(retryStep, route);
  if (nextCursor.kind === "traversal_refusal") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
    });
  }
  const attempt = admitRetryAttempt(
    input.store,
    input.executionBasis,
    input.graph,
    nextCursor,
    route.admissionEventRef,
    basis(input.clock, "retry-attempt"),
  );
  if (attempt.kind !== "retry_attempt_admission") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${attempt.code}@5`,
    });
  }
  return completion("advanced", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: rejected.refusalResultRef,
    judgmentRef: rejected.rejectionJudgmentRef,
    nextCursor,
    resultValue: retryInput.value as unknown as JsonValue,
    continuationKind: "retry",
    nextInputContractRef: retryInput.inputContractRef,
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceCandidate(
  value: unknown,
  regime: "F_D" | "F_P",
): value is DeterministicEvidenceCandidate | ProbabilisticTransportEvidenceCandidate {
  if (!isRecord(value) ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.implementationRef !== "string" || value.implementationRef.length === 0 ||
    typeof value.inputDigest !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) ||
    typeof value.outputDigest !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(value.outputDigest)) {
    return false;
  }
  return regime === "F_D"
    ? value.kind === "deterministic_evidence_candidate"
    : value.kind === "probabilistic_transport_evidence_candidate";
}

function isLeafCandidate<Output>(
  value: unknown,
  regime: "F_D" | "F_P",
  validateSuccessResult: (candidate: unknown) => candidate is Readonly<Output>,
  failureValueKind: string,
): value is ExecutableLeafCandidate<Output> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
    evidence.every((candidate) => isEvidenceCandidate(candidate, regime)) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? regime === "F_P" || validateSuccessResult(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

function totalizedFailureCandidate<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  failureClass: "implementation_exception" | "malformed_return",
  failureValueKind: string,
): DeterministicLeafFailureCandidate {
  const diagnosticRef = `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: failureValueKind,
    schemaVersion: "5.0.0" as const,
    failureClass,
    diagnosticRef,
  }) as Readonly<Record<string, JsonValue>>;
  const outputDigest = sha256Canonical(resultCandidate);
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: input.implementationResolution.implementationRef,
      inputDigest: input.inputDigest,
      outputDigest,
    }],
    resultCandidate,
    diagnosticRef,
  }) as DeterministicLeafFailureCandidate;
}

export async function completeExecutableTraversal<
  Input,
  Output,
>(
  input: CompleteExecutableTraversalInput<Input, Output>,
): Promise<ExecutableTraversalCompletion> {
  const computeRegime = input.traversalStop.computeRegime;
  if (computeRegime === "F_H") {
    const diagnosticRef = "diagnostic://abiogenesis/hog/interaction-leaf-requires-continuation@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      { computeRegime },
      diagnosticRef,
      cursorBasis(input, "interaction-leaf-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest ||
    input.leafPort.publicationDigest !== input.implementationSet.publicationDigest
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      { implementationSetRef: input.implementationSet.implementationSetRef },
      diagnosticRef,
      cursorBasis(input, "leaf-port-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const failureValueKind = input.leafPort.contractValueKind(
    input.traversalStop.failureContractRef,
    "failure",
  );
  const resultValueKind = input.leafPort.contractValueKind(
    input.traversalStop.outputContractRef,
    "output",
  );
  const judgmentRelation = input.leafPort.resolveJudgmentRelation(
    input.traversalStop.judgmentPredicateRef,
  );
  if (
    failureValueKind === null ||
    resultValueKind === null ||
    judgmentRelation === null
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/implementation/result-contract-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      {
        failureContractRef: input.traversalStop.failureContractRef,
        judgmentPredicateRef: input.traversalStop.judgmentPredicateRef,
        outputContractRef: input.traversalStop.outputContractRef,
      },
      diagnosticRef,
      cursorBasis(input, "leaf-contract-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const validateSuccessCandidate = (value: unknown): value is Readonly<Output> =>
    input.leafPort.validateContractValue(
      input.traversalStop.outputContractRef,
      "output",
      value,
    );
  const validateSuccessResult = (value: unknown): value is Readonly<Output> =>
    validateSuccessCandidate(value) &&
    (computeRegime !== "F_P" || judgmentRelation.evaluate(input.input, value));
  if (
    sha256Canonical(input.input as unknown as JsonValue) !== input.inputDigest ||
    input.inputDigest !== input.traversalStop.cursor.inputDigest
  ) {
    const diagnosticRef = "diagnostic://abiogenesis/hog/input-basis-mismatch@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      {
        admittedInputDigest: input.traversalStop.cursor.inputDigest,
        suppliedInputDigest: input.inputDigest,
      },
      diagnosticRef,
      cursorBasis(input, "input-basis-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const opened = openCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graph,
    input.traversalStop,
    input.implementationSet,
    input.implementationResolution,
    basis(input.clock, "c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      opened as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${opened.code}@5`,
      cursorBasis(input, "c-call-open-refusal"),
    );
    return completion("failed", replayRun(input), {
      diagnosticRef: `diagnostic://abiogenesis/hog/${opened.code}@5`,
    });
  }
  const cCall = opened.cCall;
  let actorObservation: ActorProcessObservation | null = null;
  let dispatchCount = 0;
  const probabilisticEffects: ProbabilisticLeafEffectPort | null = computeRegime === "F_P"
    ? input.actorRuntimeBinding === undefined
      ? null
      : {
          invokeWorker: async (request) => {
            if (dispatchCount !== 0) {
              throw new TypeError("one F_P C-call may dispatch exactly one actor invocation");
            }
            dispatchCount += 1;
            const observation = await invokeActorProcess({
              store: input.store,
              executionBasis: input.executionBasis,
              scope: input.openedTraversalScope,
              cCall,
              expectedInputDigest: input.inputDigest,
              runtime: input.actorRuntimeBinding!,
              request,
              dispatchOrdinal: dispatchCount,
              basis: basis(input.clock, "actor-process"),
            });
            actorObservation = observation;
            return observation;
          },
        }
    : null;
  let realized: unknown;
  let leaf: ExecutableLeafCandidate<Output>;
  try {
    if (computeRegime === "F_P" && probabilisticEffects === null) {
      throw new TypeError("F_P traversal requires an ABG-owned actor runtime binding");
    }
    realized = await input.leafPort.invoke(
      input.implementationResolution,
      input.input as Readonly<Record<string, JsonValue>>,
      probabilisticEffects,
    );
    leaf = isLeafCandidate<Output>(
      realized,
      computeRegime,
      validateSuccessCandidate,
      failureValueKind,
    )
      ? realized
      : totalizedFailureCandidate(input, "malformed_return", failureValueKind);
  } catch {
    leaf = totalizedFailureCandidate(input, "implementation_exception", failureValueKind);
  }
  const evidenceCandidates: readonly CCallEvidenceCandidate[] = computeRegime === "F_P"
    ? actorObservation === null
      ? []
      : [deriveProbabilisticTransportEvidence(cCall, actorObservation)]
    : leaf.evidenceCandidates;
  const evidence = [];
  for (const candidate of evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      cCall,
      candidate,
      cCall.evidenceContractRef,
      input.inputDigest,
      basis(input.clock, "evidence"),
    );
    if (admitted.kind === "c_call_admission_rejection") {
      const rejected = completeRejectedCCall(
        input.store,
        cCall,
        admitted,
        basis(input.clock, "evidence-rejection"),
      );
      return completeBlockedTraversal(input, cCall, {
        resultRef: rejected.refusalResultRef,
        judgmentRef: rejected.rejectionJudgmentRef,
        judgmentEventRef: rejected.judgmentEventRef,
        reasonRef: admitted.diagnosticRef,
      });
    }
    evidence.push(admitted);
  }
  const result = admitResult(
    input.store,
    cCall,
    leaf.resultCandidate as unknown as JsonValue,
    leaf.disposition,
    leaf.disposition === "success"
      ? cCall.outputContractRef
      : cCall.failureContractRef,
    leaf.disposition === "success"
      ? resultValueKind
      : failureValueKind,
    leaf.disposition === "success"
      ? validateSuccessResult
      : (value) => isRecord(value) &&
        value.kind === failureValueKind &&
        value.schemaVersion === "5.0.0" &&
        value.diagnosticRef === leaf.diagnosticRef,
    evidence,
    basis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    if (
      leaf.disposition === "success" &&
      !validateSuccessCandidate(leaf.resultCandidate)
    ) {
      const retry = completeRetryTraversal(
        input,
        cCall,
        result,
        "contract_failure",
      );
      if (retry !== null) return retry;
    }
    const rejected = completeRejectedCCall(
      input.store,
      cCall,
      result,
      basis(input.clock, "result-rejection"),
    );
    return completeBlockedTraversal(input, cCall, {
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      judgmentEventRef: rejected.judgmentEventRef,
      reasonRef: result.diagnosticRef,
    });
  }
  const resultReplay = replayRun(input);
  const judgmentCandidate = leaf.disposition === "success"
    ? proposeJudgment(
      cCall,
      result,
      resultReplay,
      input.input,
      judgmentRelation,
      cCall.judgmentContractRef,
    )
    : proposeFailureJudgment(
      cCall,
      result,
      resultReplay,
      leaf.diagnosticRef,
      cCall.judgmentContractRef,
    );
  const judgment = admitJudgment(
    input.store,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      cCall,
      judgment,
      basis(input.clock, "judgment-rejection"),
    );
    return completeBlockedTraversal(input, cCall, {
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      judgmentEventRef: rejected.judgmentEventRef,
      reasonRef: judgment.diagnosticRef,
    });
  }
  if (judgment.judgment !== "advance") {
    return completeBlockedTraversal(input, cCall, {
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      judgmentEventRef: judgment.admissionEventRef,
      reasonRef: judgment.reasonRef,
    });
  }
  const judgedReplay = replayRun(input);
  const continuationStep = deriveCompletedTraversalStep(
    input.graph,
    input.traversalStop.cursor,
    {
      inputRef: result.resultRef,
      inputDigest: result.valueDigest,
    },
  );
  if (continuationStep.kind !== "traversal_step") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      continuationStep as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
      {
        ...basis(input.clock, "continuation-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      diagnosticRef: `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
    });
  }
  if (input.terminalMode === "return_to_application") {
    if (continuationStep.directStep.stepKind !== "complete_term") {
      const diagnosticRef =
        "diagnostic://abiogenesis/hog/application-locus-not-terminal@5";
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        continuationStep as unknown as JsonValue,
        diagnosticRef,
        {
          ...basis(input.clock, "application-defer-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef,
      });
    }
    const ready = completion("application_ready", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
    deferredApplicationStates.set(ready, {
      input: input as CompleteExecutableTraversalInput<unknown, unknown>,
      cCall,
      result,
      judgment,
      continuationStep,
    });
    return ready;
  }
  const proposal = proposeJudgedRoute(
    input.graph,
    continuationStep,
    cCall,
    result,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      {
        ...basis(input.clock, "route-proposal-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${proposal.code}@5`,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    continuationStep.targetCursor,
    judgedReplay,
    proposal,
    basis(input.clock, "route"),
    { cCall, result, judgment },
  );
  if (route.kind !== "admitted_traversal_route") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      {
        ...basis(input.clock, "route-admission-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        nextCursor as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        {
          ...basis(input.clock, "route-application-refusal"),
          causationEventRefs: [route.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      });
    }
    return completion("advanced", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: cCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      diagnosticRef: "diagnostic://abiogenesis/hog/unexpected-judged-route@5",
    });
  }
  const routeReplay = replayRun(input);
  if (input.terminalMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      input.store,
      input.openedTraversalScope,
      cCall,
      result,
      judgment,
      route,
      routeReplay,
      input.closureContract,
      basis(input.clock, "child-closure"),
    );
    if (childClosure.kind !== "child_closure_admission") {
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${childClosure.code}@5`,
      });
    }
    return completion("closed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: childClosure.closureRef,
      resultValue: result.value,
    });
  }
  const closure = admitClosure(
    input.store,
    cCall,
    result,
    judgment,
    route,
    routeReplay,
    input.closureContract,
    basis(input.clock, "closure"),
  );
  if (closure.kind !== "closure_admission") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${closure.code}@5`,
    });
  }
  return completion("closed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}

function requireDeferredApplicationState(
  value: ExecutableTraversalCompletion,
): DeferredApplicationState {
  const state = deferredApplicationStates.get(value);
  if (value.disposition !== "application_ready" || state === undefined) {
    throw new TypeError(
      "application completion requires the exact HoG-issued deferred capability",
    );
  }
  return state;
}

function failDeferredApplication(
  state: DeferredApplicationState,
  value: ExecutableTraversalCompletion,
  clock: ExecutableTraversalClock,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  deferredApplicationStates.delete(value);
  admitRuntimeFailure(
    state.input.store,
    state.input.executionBasis,
    state.input.openedTraversalScope,
    "route",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: clock.eventTime,
      correlationId: `${clock.correlationId}/${stage}`,
      causationEventRefs: [state.judgment.admissionEventRef],
    },
  );
  return completion("failed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef,
  });
}

function exactDeferredApplication(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
): boolean {
  return state.input.graph.template.applications.find(
    (candidate) => candidate.applicationRef === application.applicationRef,
  ) === application &&
    state.cCall.compositionRef === application.applicationRef;
}

export function completeDeferredApplicationTerminal(
  input: CompleteDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== true
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-refusal",
      "diagnostic://abiogenesis/hog/application-terminal-not-declared@5",
      input.application as unknown as JsonValue,
    );
  }
  const judgedReplay = replayRun(state.input);
  const proposal = proposeJudgedRoute(
    state.input.graph,
    state.continuationStep,
    state.cCall,
    state.result,
    state.judgment,
    judgedReplay,
    state.input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    state.input.traversalStop.cursor,
    null,
    judgedReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-terminal-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
    },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "terminal"
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-terminal-route-mismatch@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  deferredApplicationStates.delete(input.completion);
  const routeReplay = replayRun(state.input);
  if (state.input.applicationCompletionMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      state.input.store,
      state.input.openedTraversalScope,
      state.cCall,
      state.result,
      state.judgment,
      route,
      routeReplay,
      state.input.closureContract,
      {
        eventTime: input.clock.eventTime,
        correlationId:
          `${input.clock.correlationId}/application-child-closure`,
        causationEventRefs: [],
      },
    );
    if (childClosure.kind !== "child_closure_admission") {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${childClosure.code}@5`,
      });
    }
    return completion("closed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      closureRef: childClosure.closureRef,
      resultValue: state.result.value,
    });
  }
  const closure = admitClosure(
    state.input.store,
    state.cCall,
    state.result,
    state.judgment,
    route,
    routeReplay,
    state.input.closureContract,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-closure`,
      causationEventRefs: [],
    },
  );
  if (closure.kind !== "closure_admission") {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${closure.code}@5`,
    });
  }
  return completion("closed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: state.result.value,
  });
}

export function advanceDeferredRecursion(
  input: AdvanceDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  const childValue = input.childCompletion.resultValue;
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false ||
    input.application.foldback.binding !== "$" ||
    (
      input.childCompletion.disposition !== "closed" &&
      input.childCompletion.disposition !== "blocked"
    ) ||
    (
      input.childCompletion.disposition === "closed"
        ? input.childCompletion.closureRef === null
        : input.childCompletion.closureRef !== null
    ) ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    typeof childValue !== "object" ||
    childValue === null ||
    Array.isArray(childValue)
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-foldback-refusal",
      "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const foldback = admitApplicationChildFoldback(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.cCall,
    state.judgment.judgmentRef,
    state.input.traversalStop.cursor,
    input.childExecutionBasis,
    input.childTraversalScope,
    {
      resultRef: input.childCompletion.resultRef,
      judgmentRef: input.childCompletion.judgmentRef,
      closureRef: input.childCompletion.closureRef,
    },
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-foldback`,
      causationEventRefs: [],
    },
  );
  if (foldback.kind !== "application_child_foldback_admission") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-foldback-admission",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  if (foldback.childDisposition === "blocked") {
    const foldbackReplay = replayRun(state.input);
    const proposal = proposeRecursionRoute(
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      state.cCall,
      state.judgment,
      foldback,
      foldbackReplay,
      state.cCall.transitionContractRef,
      "blocked",
    );
    if (proposal.kind !== "traversal_route_candidate") {
      return failDeferredApplication(
        state,
        input.completion,
        input.clock,
        "application-child-stop-proposal",
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        proposal as unknown as JsonValue,
      );
    }
    const route = admitRecursionRoute(
      state.input.store,
      state.input.executionBasis,
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      foldbackReplay,
      proposal,
      {
        eventTime: input.clock.eventTime,
        correlationId:
          `${input.clock.correlationId}/application-child-stop-route`,
        causationEventRefs: [],
      },
      {
        cCall: state.cCall,
        result: state.result,
        judgment: state.judgment,
        foldback,
      },
    );
    deferredApplicationStates.delete(input.completion);
    if (
      route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "blocked" ||
      route.runStoppedEventRef === null
    ) {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef: route.kind === "admitted_traversal_route"
          ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
          : `diagnostic://abiogenesis/hog/${route.code}@5`,
      });
    }
    return completion("blocked", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: foldback.childResultRef,
      judgmentRef: state.judgment.judgmentRef,
      resultValue: childValue as JsonValue,
      diagnosticRef: foldback.childReasonRef ??
        "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
    });
  }
  const targetCursor = deriveRecursionReentryCursor(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    {
      inputRef: foldback.childResultRef,
      inputDigest: foldback.outputDigest,
    },
  );
  if (targetCursor.kind === "traversal_refusal") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-reentry-derivation",
      `diagnostic://abiogenesis/hog/${targetCursor.code}@5`,
      targetCursor as unknown as JsonValue,
    );
  }
  const foldbackReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    targetCursor,
    state.cCall,
    state.judgment,
    foldback,
    foldbackReplay,
    state.cCall.transitionContractRef,
    "advance",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    targetCursor,
    foldbackReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRecursionRoute(
    state.input.traversalStop.cursor,
    targetCursor,
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  deferredApplicationStates.delete(input.completion);
  return completion("advanced", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: foldback.childResultRef,
    judgmentRef: state.judgment.judgmentRef,
    nextCursor,
    resultValue: childValue as JsonValue,
    continuationKind: "advance",
    nextInputContractRef: input.application.outputContractRef,
  });
}

export function blockDeferredRecursion(
  input: CompleteDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-bound-refusal",
      "diagnostic://abiogenesis/hog/application-bound-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const judgedReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    judgedReplay,
    state.cCall.transitionContractRef,
    "blocked",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-bound-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    judgedReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-bound`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
    },
  );
  deferredApplicationStates.delete(input.completion);
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    route.runStoppedEventRef === null
  ) {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  return completion("blocked", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: "reason://abiogenesis/recursion/bound-exhausted@5",
  });
}

export function blockDeferredRecursionPreparation(
  input: BlockDeferredRecursionPreparationInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-refusal",
      "diagnostic://abiogenesis/hog/application-preparation-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const refusalAdmission = admitApplicationChildPreparationRefusal(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.cCall,
    state.result,
    state.judgment,
    state.input.traversalStop.cursor,
    {
      childGraphFunctionRef: input.application.graphFunctionRef,
      inputRef: state.result.resultRef,
      inputDigest: state.result.valueDigest,
      ...input.preparationRefusal,
    },
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/preparation-refusal`,
      causationEventRefs: [],
    },
  );
  if (
    refusalAdmission.kind !==
      "application_child_preparation_refusal_admission"
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-admission",
      `diagnostic://abiogenesis/hog/${refusalAdmission.code}@5`,
      refusalAdmission as unknown as JsonValue,
    );
  }
  const refusalReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    refusalReplay,
    state.cCall.transitionContractRef,
    "blocked",
    refusalAdmission,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    refusalReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId:
        `${input.clock.correlationId}/preparation-blocked-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
      preparationRefusal: refusalAdmission,
    },
  );
  deferredApplicationStates.delete(input.completion);
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    route.runStoppedEventRef === null
  ) {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  return completion("blocked", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: input.preparationRefusal.diagnosticRef,
  });
}

function failWorkflowTraversal(
  input: WorkflowParentTraversalInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  return completion("failed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), { cCallRef: input.parentCCall.cCallRef, diagnosticRef });
}

function completeBlockedWorkflowTraversal(
  input: WorkflowParentTraversalInput,
  resultRef: string,
  judgmentRef: string,
  judgmentEventRef: string,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const currentReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const proposal = proposeWorkflowBlockedRoute(
    input.graph,
    input.workflowStep,
    input.parentCCall,
    judgmentRef,
    currentReplay,
    input.parentCCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "workflow-blocked-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.workflowStep.sourceCursor,
    null,
    currentReplay,
    proposal,
    basis(input.clock, "workflow-blocked-route"),
    {
      cCall: input.parentCCall,
      judgmentRef,
      judgmentEventRef,
      reasonRef,
    },
  );
  if (route.kind !== "admitted_traversal_route" || route.runStoppedEventRef === null) {
    return failWorkflowTraversal(
      input,
      "workflow-blocked-route-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion("blocked", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef,
    judgmentRef,
    diagnosticRef: reasonRef,
  });
}

function completeFanOutWorkflowRoute(
  input: CompleteWorkflowTraversalInput,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  fanOutCompletion: FanOutCompletionAdmission,
  continuationStep: TraversalStep,
): ExecutableTraversalCompletion {
  const application = input.fanOutApplication;
  if (application === undefined) {
    return failWorkflowTraversal(
      input,
      "fan-out-application",
      "diagnostic://abiogenesis/hog/fan-out-application-absent@5",
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const completionReplay = replay(input.store, {
    runId: input.openedTraversalScope.runId,
  });
  const proposal = proposeFanOutRoute(
    input.graph,
    application,
    continuationStep,
    input.parentCCall,
    fanOutCompletion,
    completionReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    continuationStep.sourceCursor,
    continuationStep.targetCursor,
    completionReplay,
    proposal,
    basis(input.clock, "fan-out-route"),
    {
      cCall: input.parentCCall,
      application,
      completion: fanOutCompletion,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (fanOutCompletion.completionKind === "partial_stop") {
    if (route.routeKind !== "blocked" || route.runStoppedEventRef === null) {
      return failWorkflowTraversal(
        input,
        "fan-out-partial-stop",
        "diagnostic://abiogenesis/hog/fan-out-run-stop-absent@5",
        route as unknown as JsonValue,
      );
    }
    return completion("blocked", replay(input.store, {
      runId: input.openedTraversalScope.runId,
    }), {
      cCallRef: input.parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: judgment.reasonRef,
    });
  }
  if (route.routeKind !== "advance") {
    return failWorkflowTraversal(
      input,
      "fan-out-complete-route",
      "diagnostic://abiogenesis/hog/fan-out-advance-absent@5",
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRoute(continuationStep, route);
  if (nextCursor.kind === "traversal_refusal") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion("advanced", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef: fanOutCompletion.outputVectorRef,
    judgmentRef: judgment.judgmentRef,
    nextCursor,
    resultValue: fanOutCompletion.outputVector,
    continuationKind: "advance",
    nextInputContractRef: fanOutCompletion.outputVectorContractRef,
  });
}

export function completeWorkflowPreparationRefusal(
  input: CompleteWorkflowPreparationRefusalInput,
): ExecutableTraversalCompletion {
  if (input.workflowStep.directStep.stepKind !== "enter_child") {
    return failWorkflowTraversal(
      input,
      "workflow-preparation-refusal-step",
      "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
      input.workflowStep as unknown as JsonValue,
    );
  }
  const admitted = admitChildPreparationRefusal(
    input.store,
    input.parentCCall,
    {
      kind: "child_preparation_refusal_candidate",
      schemaVersion: "5.0.0",
      childGraphFunctionRef: input.workflowStep.directStep.graphFunctionRef,
      inputRef: input.workflowStep.sourceCursor.inputRef,
      inputDigest: input.workflowStep.sourceCursor.inputDigest,
      stage: input.preparationRefusal.stage,
      diagnosticRef: input.preparationRefusal.diagnosticRef,
      message: input.preparationRefusal.message,
    },
    basis(input.clock, "child-preparation-refusal"),
  );
  if (admitted.kind !== "child_preparation_refusal_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-preparation-refusal-admission",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  const rejected = completeRejectedCCall(
    input.store,
    input.parentCCall,
    admitted.admissionRejection,
    {
      ...basis(input.clock, "child-preparation-rejection"),
      causationEventRefs: [admitted.admissionEventRef],
    },
  );
  return completeBlockedWorkflowTraversal(
    input,
    rejected.refusalResultRef,
    rejected.rejectionJudgmentRef,
    rejected.judgmentEventRef,
    input.preparationRefusal.diagnosticRef,
  );
}

export function completeWorkflowTraversal(
  input: CompleteWorkflowTraversalInput,
): ExecutableTraversalCompletion {
  if (
    input.parentCCall.callClass !== "workflow" ||
    input.workflowStep.directStep.stepKind !== "enter_child" ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    input.childCompletion.resultValue === null ||
    (input.childCompletion.disposition !== "closed" &&
      input.childCompletion.disposition !== "blocked")
  ) {
    return failWorkflowTraversal(
      input,
      "workflow-child-completion",
      "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
      input.childCompletion as unknown as JsonValue,
    );
  }
  const foldback = admitChildFoldback(
    input.store,
    input.parentCCall,
    input.childExecutionBasis,
    input.childTraversalScope,
    {
      childResultRef: input.childCompletion.resultRef,
      childJudgmentRef: input.childCompletion.judgmentRef,
      childClosureRef: input.childCompletion.closureRef,
    },
    basis(input.clock, "child-foldback"),
  );
  if (foldback.kind !== "child_foldback_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-child-foldback",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  const evidence = admitEvidence(
    input.store,
    input.parentCCall,
    deriveSubTraversalEvidence(input.parentCCall, foldback, input.inputDigest),
    input.parentCCall.evidenceContractRef,
    input.inputDigest,
    basis(input.clock, "sub-traversal-evidence"),
  );
  if (evidence.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      evidence,
      basis(input.clock, "sub-traversal-evidence-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      evidence.diagnosticRef,
    );
  }
  const childSucceeded = input.childCompletion.disposition === "closed";
  const childValue = input.childCompletion.resultValue;
  const result = admitResult(
    input.store,
    input.parentCCall,
    childValue,
    childSucceeded ? "success" : "failure",
    childSucceeded
      ? input.parentCCall.outputContractRef
      : input.parentCCall.failureContractRef,
    childSucceeded ? input.resultValueKind : input.failureValueKind,
    childSucceeded
      ? input.validateSuccessResult
      : (value) => isRecord(value) &&
        value.kind === input.failureValueKind &&
        value.schemaVersion === "5.0.0",
    [evidence],
    basis(input.clock, "workflow-result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      result,
      basis(input.clock, "workflow-result-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      result.diagnosticRef,
    );
  }
  const resultReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const judgmentCandidate = childSucceeded
    ? proposeJudgment(
        input.parentCCall,
        result,
        resultReplay,
        input.input,
        input.judgmentRelation,
        input.parentCCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        input.parentCCall,
        result,
        resultReplay,
        input.childCompletion.diagnosticRef ??
          "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
        input.parentCCall.judgmentContractRef,
      );
  const judgment = admitJudgment(
    input.store,
    input.parentCCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "workflow-judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      judgment,
      basis(input.clock, "workflow-judgment-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      judgment.diagnosticRef,
    );
  }
  const fanOutEnabled =
    input.fanOutApplication !== undefined &&
    input.validateFanOutVector !== undefined;
  if (
    (input.fanOutApplication === undefined) !==
      (input.validateFanOutVector === undefined)
  ) {
    return failWorkflowTraversal(
      input,
      "fan-out-context",
      "diagnostic://abiogenesis/hog/fan-out-context-incomplete@5",
      { cCallRef: input.parentCCall.cCallRef },
    );
  }
  if (judgment.judgment !== "advance") {
    if (fanOutEnabled) {
      const fanOutCompletion = admitFanOutCompletion({
        store: input.store,
        executionBasis: input.executionBasis,
        graph: input.graph,
        application: input.fanOutApplication!,
        sourceCursor: input.workflowStep.sourceCursor,
        replayState: replay(input.store, {
          runId: input.openedTraversalScope.runId,
        }),
        completionKind: "partial_stop",
        validateOutputVector: input.validateFanOutVector!,
        basis: basis(input.clock, "fan-out-partial-stop"),
      });
      if (fanOutCompletion.kind !== "fan_out_completion_admission") {
        return failWorkflowTraversal(
          input,
          "fan-out-partial-stop-admission",
          `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
          fanOutCompletion as unknown as JsonValue,
        );
      }
      return completeFanOutWorkflowRoute(
        input,
        result,
        judgment,
        fanOutCompletion,
        input.workflowStep,
      );
    }
    return completeBlockedWorkflowTraversal(
      input,
      result.resultRef,
      judgment.judgmentRef,
      judgment.admissionEventRef,
      judgment.reasonRef,
    );
  }
  const continuationStep = deriveCompletedTraversalStep(
    input.graph,
    input.workflowStep.sourceCursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (continuationStep.kind !== "traversal_step") {
    return failWorkflowTraversal(
      input,
      "workflow-continuation",
      `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
      continuationStep as unknown as JsonValue,
    );
  }
  if (
    fanOutEnabled &&
    continuationStep.directStep.stepKind === "continue_term" &&
    continuationStep.directStep.relation === "compose_next"
  ) {
    const fanOutCompletion = admitFanOutCompletion({
      store: input.store,
      executionBasis: input.executionBasis,
      graph: input.graph,
      application: input.fanOutApplication!,
      sourceCursor: input.workflowStep.sourceCursor,
      replayState: replay(input.store, {
        runId: input.openedTraversalScope.runId,
      }),
      completionKind: "complete_vector",
      validateOutputVector: input.validateFanOutVector!,
      basis: basis(input.clock, "fan-out-complete-vector"),
    });
    if (
      fanOutCompletion.kind !== "fan_out_completion_admission" ||
      fanOutCompletion.completionKind !== "complete_vector"
    ) {
      return failWorkflowTraversal(
        input,
        "fan-out-complete-vector-admission",
        fanOutCompletion.kind === "fan_out_completion_admission"
          ? "diagnostic://abiogenesis/hog/fan-out-completion-kind-mismatch@5"
          : `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
        fanOutCompletion as unknown as JsonValue,
      );
    }
    const fanInStep = deriveCompletedTraversalStep(
      input.graph,
      input.workflowStep.sourceCursor,
      {
        inputRef: fanOutCompletion.outputVectorRef,
        inputDigest: fanOutCompletion.outputVectorDigest,
      },
    );
    if (fanInStep.kind !== "traversal_step") {
      return failWorkflowTraversal(
        input,
        "fan-in-continuation",
        `diagnostic://abiogenesis/hog/${fanInStep.code}@5`,
        fanInStep as unknown as JsonValue,
      );
    }
    return completeFanOutWorkflowRoute(
      input,
      result,
      judgment,
      fanOutCompletion,
      fanInStep,
    );
  }
  const judgedReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const routeCandidate = proposeJudgedRoute(
    input.graph,
    continuationStep,
    input.parentCCall,
    result,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (routeCandidate.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "workflow-route-proposal",
      `diagnostic://abiogenesis/hog/${routeCandidate.code}@5`,
      routeCandidate as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.workflowStep.sourceCursor,
    continuationStep.targetCursor,
    judgedReplay,
    routeCandidate,
    basis(input.clock, "workflow-route"),
    { cCall: input.parentCCall, result, judgment },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failWorkflowTraversal(
      input,
      "workflow-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      return failWorkflowTraversal(
        input,
        "workflow-route-application",
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replay(input.store, {
      runId: input.openedTraversalScope.runId,
    }), {
      cCallRef: input.parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: input.parentCCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return failWorkflowTraversal(
      input,
      "workflow-route-kind",
      "diagnostic://abiogenesis/hog/unexpected-workflow-route@5",
      route as unknown as JsonValue,
    );
  }
  const closure = admitClosure(
    input.store,
    input.parentCCall,
    result,
    judgment,
    route,
    replay(input.store, { runId: input.openedTraversalScope.runId }),
    input.closureContract,
    basis(input.clock, "workflow-closure"),
  );
  if (closure.kind !== "closure_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-closure",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}
