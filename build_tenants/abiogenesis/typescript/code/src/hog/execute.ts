import {
  admitClosure,
  admitEvidence,
  admitJudgment,
  admitResult,
  admitRuntimeFailure,
  admitRoute,
  completeRejectedCCall,
  deriveProbabilisticTransportEvidence,
  openCCall,
  replay,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type ActorProcessObservation,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type CCallEvidenceCandidate,
  type CCall,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
  invokeActorProcess,
} from "../abg/index.js";
import type { ProbabilisticLeafEffectPort } from "../implementation/contracts.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
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
import { proposeBlockedRoute, proposeJudgedRoute } from "./traversal_route.js";
import {
  applyRoute,
  deriveCompletedTraversalStep,
  type TraversalCursor,
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
  readonly disposition: "advanced" | "blocked" | "closed" | "failed" | "refused";
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly closureRef: string | null;
  readonly nextCursor: TraversalCursor | null;
  readonly resultValue: JsonValue | null;
  readonly replayState: ReplayState;
  readonly diagnosticRef: string | null;
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
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly failureValueKind: string;
  readonly resultValueKind: string;
  readonly validateSuccessCandidate?: (value: unknown) => value is Readonly<Output>;
  readonly validateSuccessResult: (value: unknown) => value is Readonly<Output>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly judgmentRelation: DeclaredJudgmentRelation<Input, Output>;
  readonly realize: (
    input: Readonly<Input>,
    effects: ProbabilisticLeafEffectPort | null,
  ) => unknown | Promise<unknown>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly clock: ExecutableTraversalClock;
}

export type DeterministicTraversalClock = ExecutableTraversalClock;
export type DeterministicTraversalCompletion = ExecutableTraversalCompletion;
export type CompleteDeterministicTraversalInput<Input, Output> =
  CompleteExecutableTraversalInput<Input, Output>;

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
  );
  if (route.kind !== "admitted_traversal_route" || route.runStoppedEventRef === null) {
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
    diagnosticRef: values.reasonRef,
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
): DeterministicLeafFailureCandidate {
  const diagnosticRef = `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: input.failureValueKind,
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
  const probabilisticEffects: ProbabilisticLeafEffectPort | null = computeRegime === "F_P"
    ? input.actorRuntimeBinding === undefined
      ? null
      : {
          invokeWorker: async (request) => {
            const observation = await invokeActorProcess({
              store: input.store,
              executionBasis: input.executionBasis,
              scope: input.openedTraversalScope,
              cCall,
              expectedInputDigest: input.inputDigest,
              runtime: input.actorRuntimeBinding!,
              request,
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
    realized = await input.realize(input.input, probabilisticEffects);
    leaf = isLeafCandidate<Output>(
      realized,
      computeRegime,
      input.validateSuccessCandidate ?? input.validateSuccessResult,
      input.failureValueKind,
    )
      ? realized
      : totalizedFailureCandidate(input, "malformed_return");
  } catch {
    leaf = totalizedFailureCandidate(input, "implementation_exception");
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
      ? input.resultValueKind
      : input.failureValueKind,
    leaf.disposition === "success"
      ? input.validateSuccessResult
      : (value) => isRecord(value) &&
        value.kind === input.failureValueKind &&
        value.schemaVersion === "5.0.0" &&
        value.diagnosticRef === leaf.diagnosticRef,
    evidence,
    basis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
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
      input.judgmentRelation,
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
