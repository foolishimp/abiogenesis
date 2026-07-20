import {
  admitClosure,
  admitEvidence,
  admitJudgment,
  admitResult,
  admitTransition,
  completeRejectedCCall,
  openCCall,
  replay,
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
import type { JsonValue } from "../product/index.js";
import type { DeterministicEvidenceCandidate } from "../abg/c_call.js";
import { deepFreeze } from "../product/immutable.js";
import { proposeJudgment, type DeclaredJudgmentRelation } from "./judgment.js";
import { proposeTerminalTransition } from "./transition.js";
import type { TraversalStopRef } from "./traversal.js";

export interface DeterministicLeafCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface DeterministicTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface DeterministicTraversalCompletion {
  readonly kind: "deterministic_traversal_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "blocked" | "closed" | "refused";
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
  readonly resultValueKind: string;
  readonly closureContract: Readonly<ClosureContract>;
  readonly judgmentRelation: DeclaredJudgmentRelation<Input, Output>;
  readonly realize: (
    input: Readonly<Input>,
  ) => Readonly<DeterministicLeafCandidate<Output>>;
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

export function completeDeterministicTraversal<
  Input,
  Output,
>(
  input: CompleteDeterministicTraversalInput<Input, Output>,
): DeterministicTraversalCompletion {
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
    return completion("refused", replay(input.store), {
      diagnosticRef: `diagnostic://abiogenesis/hog/${opened.code}@5`,
    });
  }
  const cCall = opened.cCall;
  const leaf = input.realize(input.input);
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
      return completion("blocked", replay(input.store), {
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
    input.closureContract.resultContractRef,
    input.resultValueKind,
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
    return completion("blocked", replay(input.store), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: result.diagnosticRef,
    });
  }
  const resultReplay = replay(input.store);
  const judgmentCandidate = proposeJudgment(
    cCall,
    result,
    resultReplay,
    input.input,
    input.judgmentRelation,
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
    return completion("blocked", replay(input.store), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: judgment.diagnosticRef,
    });
  }
  if (judgment.judgment !== "advance") {
    return completion("blocked", replay(input.store), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: judgment.reasonRef,
    });
  }
  const judgedReplay = replay(input.store);
  const proposal = proposeTerminalTransition(
    input.graph,
    input.traversalStop,
    cCall,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "transition_proposal") {
    return completion("refused", replay(input.store), {
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
    return completion("refused", replay(input.store), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${transition.code}@5`,
    });
  }
  const transitionReplay = replay(input.store);
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
    return completion("refused", replay(input.store), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${closure.code}@5`,
    });
  }
  return completion("closed", replay(input.store), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
  });
}
