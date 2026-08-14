import { WORKER_TRANSPORT_FAILURE_CLASS_VALUES, admitEvidence, admitJudgment, admitResult, completeRejectedCCall, deriveProbabilisticTransportEvidence, replay, type AdmittedCCallJudgment, type AdmittedCCallEvidence, type AdmittedCCallResult, type CCall, type CCallEvidenceCandidate } from "../abg/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitProbabilisticResultCandidate } from "./probabilistic_result_admission.js";
import { proposeFailureJudgment, proposeJudgment } from "./judgment.js";
import { basis, completeBlockedTraversal, completeRuntimeFailureTransition, type CompleteExecutableTraversalInput, type ExecutableTraversalCompletion } from "./execute.js";
import type { ClosedLeafOwnerReceipt } from "../implementation/contracts.js";

export interface AdmittedLeafOutcome {
  readonly kind: "admitted_leaf_outcome"; readonly cCall: CCall;
  readonly result: AdmittedCCallResult; readonly judgment: AdmittedCCallJudgment;
}

export type LeafAdmissionResult = AdmittedLeafOutcome | ExecutableTraversalCompletion |
  ReturnType<typeof completeRuntimeFailureTransition>;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function admitLeafOutcome(
  input: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >,
  cCall: CCall,
  invocation: ClosedLeafOwnerReceipt,
  failureValueKind: string,
  resultValueKind: string,
): LeafAdmissionResult {
  const regime = input.traversalStop.computeRegime;
  const candidate = invocation.candidate;
  const exchange = invocation.receipt?.computeRegime === "F_P"
    ? invocation.receipt.actorProcessExchange
    : null;
  const request = exchange?.request ?? null;
  const observation = exchange?.observation ?? null;
  const occurrence = {
    cCallRef: cCall.cCallRef,
    runId: cCall.runId,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    programLocusRef: cCall.programLocusRef,
    taskOrdinal: cCall.taskOrdinal,
    attempt: cCall.attempt,
  };
  const probabilistic = regime === "F_P" && request !== null && observation !== null
    ? admitProbabilisticResultCandidate({
        leafPort: input.leafPort,
        occurrence,
        resolution: input.implementationResolution,
        input: input.input,
        request,
        observation,
      })
    : null;
  const evidenceCandidates: readonly CCallEvidenceCandidate[] = regime === "F_P"
    ? request === null || observation === null ||
        (observation.disposition === "success" &&
          probabilistic?.kind !== "contract_admitted_probabilistic_result_candidate")
      ? []
      : [deriveProbabilisticTransportEvidence(
          cCall,
          request,
          observation,
          probabilistic?.kind === "contract_admitted_probabilistic_result_candidate"
            ? probabilistic
            : null,
          candidate.resultCandidate,
          invocation.workerContracts!.instructionContractRef,
          invocation.workerContracts!.resultContractRef,
        )]
    : candidate.evidenceCandidates;
  const evidence: AdmittedCCallEvidence[] = [];
  for (const row of evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
      cCall,
      row,
      cCall.evidenceContractRef,
      input.inputDigest,
      basis(input.clock, "evidence"),
      invocation.workerContracts?.instructionContractRef,
      invocation.workerContracts?.resultContractRef,
      regime === "F_P" && request !== null && observation !== null
        ? {
            request,
            observation,
            admittedResultCarrier:
              probabilistic?.kind === "contract_admitted_probabilistic_result_candidate"
                ? probabilistic
                : null,
          }
        : null,
    );
    if (admitted.kind === "c_call_admission_rejection") {
      const rejected = completeRejectedCCall(
        input.store,
        input.graph,
        input.graphFunction,
        input.traversalStop.cursor,
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
  const retrySource = evidence.length === 1 &&
      evidence[0]!.evidenceClass === "probabilistic_transport" &&
      evidence[0]!.transportDisposition === "failure" &&
      typeof evidence[0]!.transportFailureClass === "string" &&
      WORKER_TRANSPORT_FAILURE_CLASS_VALUES.some(
        (failureClass) => failureClass === evidence[0]!.transportFailureClass,
      )
    ? evidence[0]!
    : null;
  if (candidate.disposition === "failure" && cCall.retryPath.length > 0 && retrySource) {
    return completeRuntimeFailureTransition(
      input,
      cCall,
      retrySource,
      candidate.resultCandidate,
      failureValueKind,
    );
  }
  const result = admitResult(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    candidate.resultCandidate,
    candidate.disposition,
    candidate.disposition === "success" ? cCall.outputContractRef : cCall.failureContractRef,
    candidate.disposition === "success" ? resultValueKind : failureValueKind,
    candidate.disposition === "success"
      ? (value) =>
        (regime !== "F_P" ||
          (probabilistic?.kind === "contract_admitted_probabilistic_result_candidate" &&
            probabilistic.rawResultContractRef ===
              invocation.workerContracts?.resultContractRef &&
            probabilistic.targetOutputContractRef === cCall.outputContractRef &&
            probabilistic.inputDigest === input.inputDigest)) &&
        input.leafPort.validateContractValue(cCall.outputContractRef, "output", value) &&
        (regime !== "F_P" ||
          input.leafPort.resolveJudgmentRelation(cCall.judgmentPredicateRef)!
            .evaluate(input.input, value)) &&
        input.leafPort.validateResultEvidenceLineage(
          cCall.outputContractRef,
          value as Readonly<Record<string, JsonValue>>,
          evidence.map((row) => deepFreeze({
            cCallRef: cCall.cCallRef,
            cCallAttempt: cCall.attempt,
            evidenceRef: row.evidenceRef,
            evidenceDigest: row.evidenceDigest,
            evidenceClass: row.evidenceClass,
            outputDigest: row.outputDigest,
            transportDigest: row.evidenceClass === "probabilistic_transport" &&
                "transportDigest" in row && typeof row.transportDigest === "string"
              ? row.transportDigest
              : null,
          })),
        )
      : (value) => isRecord(value) && value.kind === failureValueKind &&
        value.schemaVersion === "5.0.0" &&
        value.diagnosticRef === candidate.diagnosticRef,
    evidence,
    basis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    if (candidate.disposition === "success" && cCall.retryPath.length > 0 &&
        !input.leafPort.validateContractValue(
          cCall.outputContractRef,
          "output",
          candidate.resultCandidate,
        )) {
      return completeRuntimeFailureTransition(
        input,
        cCall,
        result,
        candidate.resultCandidate,
        failureValueKind,
      );
    }
    const rejected = completeRejectedCCall(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
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
  const relation = input.leafPort.resolveJudgmentRelation(cCall.judgmentPredicateRef)!;
  const replayState = replay(input.store, { runId: cCall.runId });
  const proposal = candidate.disposition === "success"
    ? proposeJudgment(cCall, result, replayState, input.input, relation, cCall.judgmentContractRef)
    : proposeFailureJudgment(
        cCall,
        result,
        replayState,
        candidate.diagnosticRef,
        cCall.judgmentContractRef,
      );
  const judgment = admitJudgment(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    result,
    proposal,
    replayState,
    basis(input.clock, "judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
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
  return deepFreeze({ kind: "admitted_leaf_outcome" as const, cCall, result, judgment });
}
