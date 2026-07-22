import {
  admitClosure,
  admitEvidence,
  admitJudgment,
  admitResult,
  admitRuntimeFailure,
  admitTransition,
  completeRejectedCCall,
  openCCall,
  replay,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type AdmittedImplementationResolution,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { DeterministicEvidenceCandidate } from "../abg/c_call.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  proposeFailureJudgment,
  proposeJudgment,
  type DeclaredJudgmentRelation,
} from "./judgment.js";
import { proposeTerminalTransition } from "./transition.js";
import type { TraversalStopRef } from "./traversal.js";

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

export interface DeterministicTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface DeterministicTraversalCompletion {
  readonly kind: "deterministic_traversal_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "blocked" | "closed" | "failed" | "refused";
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly closureRef: string | null;
  readonly replayState: ReplayState;
  readonly diagnosticRef: string | null;
}

export interface CompleteDeterministicTraversalInput<
  Input,
  Output,
> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: TraversalStopRef;
  readonly implementationResolution: AdmittedImplementationResolution;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly failureValueKind: string;
  readonly resultValueKind: string;
  readonly validateSuccessResult: (value: unknown) => value is Readonly<Output>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly judgmentRelation: DeclaredJudgmentRelation<Input, Output>;
  readonly realize: (input: Readonly<Input>) => unknown;
  readonly clock: DeterministicTraversalClock;
}

function basis(
  clock: DeterministicTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

function cursorBasis<Input, Output>(
  input: CompleteDeterministicTraversalInput<Input, Output>,
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
  disposition: DeterministicTraversalCompletion["disposition"],
  replayState: ReplayState,
  values: {
    readonly cCallRef?: string;
    readonly resultRef?: string;
    readonly judgmentRef?: string;
    readonly closureRef?: string;
    readonly diagnosticRef?: string;
  } = {},
): DeterministicTraversalCompletion {
  return deepFreeze({
    kind: "deterministic_traversal_completion" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: values.cCallRef ?? null,
    resultRef: values.resultRef ?? null,
    judgmentRef: values.judgmentRef ?? null,
    closureRef: values.closureRef ?? null,
    replayState,
    diagnosticRef: values.diagnosticRef ?? null,
  }) as DeterministicTraversalCompletion;
}

function replayRun(input: Pick<CompleteDeterministicTraversalInput<unknown, unknown>, "store" | "openedTraversalScope">): ReplayState {
  return replay(input.store, { runId: input.openedTraversalScope.runId });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceCandidate(value: unknown): value is DeterministicEvidenceCandidate {
  return isRecord(value) &&
    value.kind === "deterministic_evidence_candidate" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.implementationRef === "string" && value.implementationRef.length !== 0 &&
    typeof value.inputDigest === "string" && /^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) &&
    typeof value.outputDigest === "string" && /^sha256:[a-f0-9]{64}$/u.test(value.outputDigest);
}

function isLeafCandidate<Output>(
  value: unknown,
  validateSuccessResult: (candidate: unknown) => candidate is Readonly<Output>,
  failureValueKind: string,
): value is DeterministicLeafCandidate<Output> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    evidence.length > 0 &&
    evidence.every(isEvidenceCandidate) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? validateSuccessResult(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

function totalizedFailureCandidate<Input, Output>(
  input: CompleteDeterministicTraversalInput<Input, Output>,
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

export function completeDeterministicTraversal<
  Input,
  Output,
>(
  input: CompleteDeterministicTraversalInput<Input, Output>,
): DeterministicTraversalCompletion {
  if (
    sha256Canonical(input.input as unknown as JsonValue) !== input.inputDigest ||
    input.inputDigest !== input.executionBasis.rawInputDigest
  ) {
    const diagnosticRef = "diagnostic://abiogenesis/hog/input-basis-mismatch@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      {
        admittedInputDigest: input.executionBasis.rawInputDigest,
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
  let realized: unknown;
  let leaf: DeterministicLeafCandidate<Output>;
  try {
    realized = input.realize(input.input);
    leaf = isLeafCandidate<Output>(
      realized,
      input.validateSuccessResult,
      input.failureValueKind,
    )
      ? realized
      : totalizedFailureCandidate(input, "malformed_return");
  } catch {
    leaf = totalizedFailureCandidate(input, "implementation_exception");
  }
  const evidence = [];
  for (const candidate of leaf.evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      cCall,
      candidate,
      input.closureContract.evidenceContractRef,
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
      return completion("blocked", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: rejected.refusalResultRef,
        judgmentRef: rejected.rejectionJudgmentRef,
        diagnosticRef: admitted.diagnosticRef,
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
      ? input.closureContract.resultContractRef
      : cCall.failureContractRef,
    leaf.disposition === "success"
      ? input.resultValueKind
      : input.failureValueKind,
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
    return completion("blocked", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: result.diagnosticRef,
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
      input.closureContract.judgmentContractRef,
    )
    : proposeFailureJudgment(
      cCall,
      result,
      resultReplay,
      leaf.diagnosticRef,
      input.closureContract.judgmentContractRef,
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
    return completion("blocked", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: judgment.diagnosticRef,
    });
  }
  if (judgment.judgment !== "advance") {
    return completion("blocked", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: judgment.reasonRef,
    });
  }
  const judgedReplay = replayRun(input);
  const proposal = proposeTerminalTransition(
    input.graph,
    input.traversalStop,
    cCall,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "transition_proposal") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "transition",
      proposal as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      {
        ...basis(input.clock, "transition-proposal-refusal"),
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
  const transition = admitTransition(
    input.store,
    input.graph,
    cCall,
    judgment,
    judgedReplay,
    proposal,
    basis(input.clock, "transition"),
  );
  if (transition.kind !== "admitted_transition") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "transition",
      transition as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${transition.code}@5`,
      {
        ...basis(input.clock, "transition-admission-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${transition.code}@5`,
    });
  }
  const transitionReplay = replayRun(input);
  const closure = admitClosure(
    input.store,
    cCall,
    result,
    judgment,
    transition,
    transitionReplay,
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
  });
}
