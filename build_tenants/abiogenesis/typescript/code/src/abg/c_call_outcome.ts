import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
} from "../gtl/contracts.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ActorRuntimeBinding } from "./actor_process.js";
import {
  admitEvidence,
  admitJudgment,
  admitResult,
  completeRejectedCCall,
  deriveProbabilisticTransportEvidence,
  deriveSubTraversalEvidence,
  isAdmittedCCallResult,
  projectAdmittedCCallStateAtPrefix,
  projectCCallCarrierPhaseAtPrefix,
  type AdmittedCCallEvidence,
  type AdmittedCCallResult,
  type CCall,
  type CCallAdmissionRejection,
  type CCallEvidenceCandidate,
  type CCallRuntimeFailureSource,
  type ChildFoldbackAdmission,
  type RehydratedAdmittedCCallState,
  type JudgmentCandidate,
  type RejectedCCallCompletion,
} from "./c_call.js";
import type {
  AdmittedImplementationResolutionRow,
  AdmittedImplementationSet,
  ExecutionBasis,
  RuntimeAdmissionBasis,
} from "./execution_basis.js";
import type { AbgEventStore } from "./event_store.js";
import {
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  assertHeldEventStoreAtDurablePrefix,
  isRuntimeEventTransactionActive,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { admitProbabilisticResultCandidate } from "./probabilistic_result.js";
import {
  projectActiveRuntimeTransaction,
  projectRuntimeTruthAtDurablePrefix,
  replayValidatedRuntimeEventPrefix,
  type ActiveRuntimeTransactionProjection,
  type ReplayState,
} from "./replay.js";
import type { TraversalCursorCandidate } from "./traversal_cursor.js";
import type { OpenedTraversalScope } from "./open_call.js";
import {
  admitScopeClosure,
  type ScopeClosureAdmission,
  type ScopeClosureAdmissionRefusal,
} from "./closure.js";
import {
  admitTraversalTransitionInActiveTransaction,
  type RouteTransitionAdmission,
  type RouteTransitionResult,
} from "./traversal_route.js";
import type { TraversalTransitionCandidate } from "./traversal_transition.js";

function isJsonRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface CCallAdmissionContext {
  readonly store: AbgEventStore;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cursor: TraversalCursorCandidate;
  readonly cCall: CCall;
  readonly basis: RuntimeAdmissionBasis;
}

interface CCallOutcomeCommonInput extends CCallAdmissionContext {
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly outputValueKind: string;
  readonly failureValueKind: string;
}

interface LeafCCallOutcomeInput extends CCallOutcomeCommonInput {
  readonly outcomeClass: "leaf";
  readonly implementationSet: AdmittedImplementationSet;
  readonly resolution: AdmittedImplementationResolutionRow;
  readonly ownerReceipt: Readonly<ClosedLeafOwnerReceipt>;
}

export type AdmitCCallResultInput =
  | (LeafCCallOutcomeInput & Readonly<{
      regime: "F_D";
    }>)
  | (LeafCCallOutcomeInput & Readonly<{
      regime: "F_P";
      actorRuntimeBinding: ActorRuntimeBinding;
    }>)
  | (CCallOutcomeCommonInput & Readonly<{
      outcomeClass: "workflow";
      resultDisposition: "success";
      resultCandidate: Readonly<Record<string, JsonValue>>;
      foldback: ChildFoldbackAdmission;
    }>)
  | (CCallOutcomeCommonInput & Readonly<{
      outcomeClass: "workflow";
      resultDisposition: "failure";
      resultCandidate: Readonly<Record<string, JsonValue>>;
      failureDiagnosticRef: string;
      foldback: ChildFoldbackAdmission;
    }>);

interface CCallOutcomeReceiptBase {
  readonly kind: "admitted_c_call_outcome";
  readonly schemaVersion: "5.0.0";
  readonly replayState: ReplayState;
  readonly runtimePrefix: ValidatedRuntimeEventPrefix;
  readonly successorPrefix: DurablePrefixCoordinate;
}

export interface ResultCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
  readonly disposition: "result";
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
}

export interface JudgedCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
  readonly disposition: "judged";
  readonly admitted: RehydratedAdmittedCCallState;
}

export interface RetryCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
  readonly disposition: "retry";
  readonly cCall: CCall;
  readonly source: CCallRuntimeFailureSource;
  readonly failureCandidate: JsonValue;
  readonly failureValueKind: string;
}

export interface BlockedCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
  readonly disposition: "blocked";
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly completion: RejectedCCallCompletion;
  readonly diagnosticRef: string;
}

export type AdmittedCCallOutcomeReceipt =
  | ResultCCallOutcomeReceipt
  | JudgedCCallOutcomeReceipt
  | RetryCCallOutcomeReceipt
  | BlockedCCallOutcomeReceipt;

type ResultCCallOutcomeReceiptBody = Omit<
  ResultCCallOutcomeReceipt,
  "successorPrefix"
>;
type JudgedCCallOutcomeReceiptBody = Omit<
  JudgedCCallOutcomeReceipt,
  "successorPrefix"
>;
type RetryCCallOutcomeReceiptBody = Omit<
  RetryCCallOutcomeReceipt,
  "successorPrefix"
>;
type BlockedCCallOutcomeReceiptBody = Omit<
  BlockedCCallOutcomeReceipt,
  "successorPrefix"
>;
export interface AdmitCCallJudgmentInput {
  readonly store: AbgEventStore;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cursor: TraversalCursorCandidate;
  readonly outcome: ResultCCallOutcomeReceipt;
  readonly candidate: JudgmentCandidate;
  readonly basis: RuntimeAdmissionBasis;
}

export interface AdmitCCallRejectionInput extends CCallAdmissionContext {
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly rejection: CCallAdmissionRejection;
}

export type AdmitCCallJudgmentResult =
  | JudgedCCallOutcomeReceipt
  | BlockedCCallOutcomeReceipt;

export interface AdmitCCallCompletionInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly source: TraversalCursorCandidate;
  readonly target: TraversalCursorCandidate | null;
  readonly outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
  readonly candidate: TraversalTransitionCandidate | null;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly closureContract: Readonly<ClosureContract>;
  readonly basis: RuntimeAdmissionBasis;
  readonly deferToApplication?: true;
}

type CCallCompletionPayload =
  | Readonly<{
      disposition: "application_ready";
      outcome: JudgedCCallOutcomeReceipt;
      replayState: ReplayState;
    }>
  | Readonly<{
      disposition: "advanced";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmission;
    }>
  | Readonly<{
      disposition: "blocked";
      outcome: BlockedCCallOutcomeReceipt | JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmission;
    }>
  | Readonly<{
      disposition: "failed";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmission;
    }>
  | Readonly<{
      disposition: "closed";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmission;
      closure: ScopeClosureAdmission;
    }>;

type RouteTransitionAdmissionBody = Omit<
  RouteTransitionAdmission,
  "successorPrefix"
>;

type StagedCCallCompletionPayload =
  | Readonly<{
      disposition: "advanced";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmissionBody;
    }>
  | Readonly<{
      disposition: "blocked";
      outcome: BlockedCCallOutcomeReceipt | JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmissionBody;
    }>
  | Readonly<{
      disposition: "failed";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmissionBody;
    }>
  | Readonly<{
      disposition: "closed";
      outcome: JudgedCCallOutcomeReceipt;
      transition: RouteTransitionAdmissionBody;
      closure: ScopeClosureAdmission;
    }>;

export type CCallCompletionAdmission = Readonly<{
  kind: "c_call_completion_admission";
  schemaVersion: "5.0.0";
}> & CCallCompletionPayload;

export type CCallCompletionResult =
  | CCallCompletionAdmission
  | Exclude<RouteTransitionResult, RouteTransitionAdmission>
  | ScopeClosureAdmissionRefusal;

class CCallCompletionAbort extends Error {
  constructor(
    readonly result: Exclude<CCallCompletionResult, CCallCompletionAdmission>,
  ) {
    super(result.message);
  }
}

function completionAdmission(
  payload: CCallCompletionPayload,
): CCallCompletionAdmission {
  return deepFreeze({
    kind: "c_call_completion_admission" as const,
    schemaVersion: "5.0.0" as const,
    ...payload,
  }) as CCallCompletionAdmission;
}

function stageBasis(
  basis: RuntimeAdmissionBasis,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    ...basis,
    correlationId: `${basis.correlationId}/${stage}`,
  };
}

type StagedCCallOutcome =
  | Readonly<{
      disposition: "result";
      cCall: CCall;
      result: AdmittedCCallResult;
    }>
  | Readonly<{
      disposition: "retry";
      cCall: CCall;
      source: CCallRuntimeFailureSource;
      failureCandidate: JsonValue;
      failureValueKind: string;
    }>
  | Readonly<{
      disposition: "blocked";
      cCall: CCall;
      completion: RejectedCCallCompletion;
      diagnosticRef: string;
    }>;

type StagedCCallJudgmentOutcome =
  | Readonly<{
      disposition: "judged";
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: import("./c_call.js").AdmittedCCallJudgment;
    }>
  | Extract<StagedCCallOutcome, { disposition: "blocked" }>;

function outcomeProjectionFromTruth(
  truth: ActiveRuntimeTransactionProjection,
): Omit<CCallOutcomeReceiptBase, "successorPrefix"> {
  return deepFreeze({
    kind: "admitted_c_call_outcome" as const,
    schemaVersion: "5.0.0" as const,
    replayState: truth.replayState,
    runtimePrefix: truth.runtimePrefix,
  });
}

export type CCallOutcomeProjectionBasis =
  | Readonly<{
      disposition: "judged";
      admitted: RehydratedAdmittedCCallState;
    }>
  | Readonly<{
      disposition: "blocked";
      cCall: CCall;
      completion: RejectedCCallCompletion;
      diagnosticRef: string;
    }>;

function projectCCallOutcomeReceiptFromTruth(
  truth: ActiveRuntimeTransactionProjection,
  basis: CCallOutcomeProjectionBasis,
): JudgedCCallOutcomeReceiptBody | BlockedCCallOutcomeReceiptBody | null {
  const projection = outcomeProjectionFromTruth(truth);
  if (basis.disposition === "judged") {
    const admitted = projectAdmittedCCallStateAtPrefix(
      projection.runtimePrefix,
      basis.admitted.cCall as unknown as Readonly<Record<string, JsonValue>>,
      basis.admitted.result as unknown as Readonly<Record<string, JsonValue>>,
      basis.admitted.judgment as unknown as Readonly<Record<string, JsonValue>>,
    );
    return admitted === null
      ? null
      : deepFreeze({
          ...projection,
          disposition: "judged" as const,
          admitted,
        });
  }

  const phase = projectCCallCarrierPhaseAtPrefix(
    projection.runtimePrefix,
    basis.cCall,
  );
  const events = runtimeEventsFromValidatedPrefix(projection.runtimePrefix);
  const { completion } = basis;
  const result = events.find((event) =>
    event.eventId === completion.resultEventRef
  );
  const judgment = events.find((event) =>
    event.eventId === completion.judgmentEventRef
  );
  const evidence = completion.evidenceEventRef === null
    ? null
    : events.find((event) => event.eventId === completion.evidenceEventRef) ??
      null;
  const admittedResult = result?.kind === "c_call_result_admitted" &&
      isJsonRecord(result.payload)
    ? deepFreeze({
        kind: "admitted_c_call_result" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "admitted" as const,
        ...result.payload,
        admissionEventRef: result.eventId,
      }) as unknown as AdmittedCCallResult
    : null;
  if (
    phase?.phase !== "judged" ||
    phase.resultEventRef !== completion.resultEventRef ||
    phase.judgmentEventRef !== completion.judgmentEventRef ||
    completion.cCallRef !== basis.cCall.cCallRef ||
    result?.kind !== "c_call_result_admitted" ||
    judgment?.kind !== "c_call_judged" ||
    !isJsonRecord(result.payload) ||
    !isJsonRecord(judgment.payload) ||
    result.payload.resultRef !== completion.refusalResultRef ||
    admittedResult === null ||
    !isAdmittedCCallResult(admittedResult) ||
    admittedResult.cCallRef !== basis.cCall.cCallRef ||
    judgment.payload.judgmentRef !== completion.rejectionJudgmentRef ||
    judgment.payload.judgment !== "blocked" ||
    judgment.payload.reasonRef !== basis.diagnosticRef ||
    !judgment.causationEventRefs.includes(result.eventId) ||
    (completion.evidenceEventRef === null) !==
      (completion.rejectionEvidenceRef === null) ||
    (evidence !== null &&
      (evidence.kind !== "c_call_evidenced" ||
        !isJsonRecord(evidence.payload) ||
        evidence.payload.evidenceRef !== completion.rejectionEvidenceRef))
  ) return null;
  return deepFreeze({
    ...projection,
    disposition: "blocked" as const,
    cCall: basis.cCall,
    result: admittedResult,
    completion,
    diagnosticRef: basis.diagnosticRef,
  });
}

/**
 * Rehydrates a judged or blocked outcome from its exact durable successor.
 * Replay and runtime-prefix authority are always projected here, never
 * supplied by a caller.
 */
export function projectCCallOutcomeReceiptAtPrefix(
  successorPrefix: DurablePrefixCoordinate,
  basis: CCallOutcomeProjectionBasis,
): JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt | null {
  let truth: ActiveRuntimeTransactionProjection;
  try {
    truth = projectRuntimeTruthAtDurablePrefix(
      successorPrefix,
      basis.disposition === "judged"
        ? basis.admitted.cCall.runId
        : basis.cCall.runId,
    );
  } catch {
    return null;
  }
  const receipt = projectCCallOutcomeReceiptFromTruth(truth, basis);
  return receipt === null
    ? null
    : deepFreeze({ ...receipt, successorPrefix });
}

function completeOutcomeReceiptBody(
  staged: StagedCCallOutcome,
  truth: ActiveRuntimeTransactionProjection,
): ResultCCallOutcomeReceiptBody | RetryCCallOutcomeReceiptBody |
  BlockedCCallOutcomeReceiptBody {
  if (staged.disposition === "blocked") {
    const receipt = projectCCallOutcomeReceiptFromTruth(truth, {
      disposition: "blocked",
      cCall: staged.cCall,
      completion: staged.completion,
      diagnosticRef: staged.diagnosticRef,
    });
    if (receipt?.disposition !== "blocked") {
      throw new TypeError("blocked CCall outcome differs from its durable prefix");
    }
    return receipt;
  }
  const projection = outcomeProjectionFromTruth(truth);
  return deepFreeze({
    ...projection,
    ...staged,
  }) as ResultCCallOutcomeReceiptBody | RetryCCallOutcomeReceiptBody;
}

function stageBlockedOutcome(
  input: CCallAdmissionContext,
  prefix: ValidatedRuntimeEventPrefix,
  rejection: CCallAdmissionRejection,
): Extract<StagedCCallOutcome, { disposition: "blocked" }> {
  const completion = completeRejectedCCall(
    input.store,
    prefix,
    input.graph,
    input.graphFunction,
    input.cursor,
    input.cCall,
    rejection,
    stageBasis(input.basis, "rejected-call"),
  );
  return deepFreeze({
    disposition: "blocked" as const,
    cCall: input.cCall,
    completion,
    diagnosticRef: rejection.diagnosticRef,
  });
}

function stageCCallResult(
  input: AdmitCCallResultInput,
): StagedCCallOutcome {
  if (!isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError("CCall result admission requires one ABG transaction");
  }
  const leafInput = input.outcomeClass === "leaf" ? input : null;
  const leafCandidate = leafInput?.ownerReceipt.candidate ?? null;
  const resultDisposition = input.outcomeClass === "leaf"
    ? input.ownerReceipt.candidate.disposition
    : input.resultDisposition;
  const resultCandidate = input.outcomeClass === "leaf"
    ? input.ownerReceipt.candidate.resultCandidate
    : input.resultCandidate;
  const failureDiagnosticRef = resultDisposition === "failure"
    ? leafCandidate?.disposition === "failure"
      ? leafCandidate.diagnosticRef
      : input.outcomeClass === "workflow" && input.resultDisposition === "failure"
        ? input.failureDiagnosticRef
        : null
    : null;
  let authorityPrefix = selectValidatedRuntimeEventPrefix(
    input.store.readAll(),
  );
  const exchange = leafInput?.ownerReceipt.receipt?.computeRegime === "F_P"
    ? leafInput.ownerReceipt.receipt.actorProcessExchange
    : null;
  const request = exchange?.request ?? null;
  const observation = exchange?.observation ?? null;
  const probabilistic = leafInput?.regime === "F_P" &&
      request !== null && observation !== null
    ? admitProbabilisticResultCandidate({
        artifactTruth: leafInput.actorRuntimeBinding.artifactTruth,
        executionBasis: input.executionBasis,
        implementationSet: leafInput.implementationSet,
        leafPort: input.leafPort,
        occurrence: {
          cCallRef: input.cCall.cCallRef,
          runId: input.cCall.runId,
          graphCallId: input.cCall.graphCallId,
          frameId: input.cCall.frameId,
          programLocusRef: input.cCall.programLocusRef,
          taskOrdinal: input.cCall.taskOrdinal,
          attempt: input.cCall.attempt,
        },
        prefix: authorityPrefix,
        resolution: leafInput.resolution,
        input: input.input,
        request,
        observation,
      })
    : null;
  const evidenceCandidates: readonly CCallEvidenceCandidate[] =
    input.outcomeClass === "workflow"
      ? [deriveSubTraversalEvidence(
          input.cCall,
          input.foldback,
          input.inputDigest,
          sha256Canonical(resultCandidate),
        )]
      : input.regime === "F_D"
        ? leafCandidate!.evidenceCandidates
        : request === null || observation === null ||
            input.ownerReceipt.workerContracts === null
          ? []
          : [deriveProbabilisticTransportEvidence(
              input.cCall,
              request,
              observation,
              probabilistic?.kind ===
                  "contract_admitted_probabilistic_result_candidate"
                ? probabilistic
                : null,
              resultCandidate,
              input.ownerReceipt.workerContracts.instructionContractRef,
              input.ownerReceipt.workerContracts.resultContractRef,
            )];
  const workerContracts = leafInput?.ownerReceipt.workerContracts ?? null;
  const evidence: AdmittedCCallEvidence[] = [];
  for (const row of evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      authorityPrefix,
      input.graph,
      input.graphFunction,
      input.cursor,
      input.cCall,
      row,
      input.cCall.evidenceContractRef,
      input.inputDigest,
      stageBasis(input.basis, "evidence"),
      workerContracts?.instructionContractRef,
      workerContracts?.resultContractRef,
      request === null || observation === null
        ? null
        : {
            request,
            observation,
            admittedResultCarrier:
              probabilistic?.kind ===
                  "contract_admitted_probabilistic_result_candidate"
                ? probabilistic
                : null,
          },
    );
    if (admitted.kind === "c_call_admission_rejection") {
      return stageBlockedOutcome(input, authorityPrefix, admitted);
    }
    evidence.push(admitted);
    authorityPrefix = selectValidatedRuntimeEventPrefix(input.store.readAll());
  }
  const retrySource = evidence.length === 1 &&
      evidence[0]!.evidenceClass === "probabilistic_transport" &&
      evidence[0]!.transportDisposition === "failure"
    ? evidence[0]!
    : null;
  if (
    input.outcomeClass === "leaf" &&
    resultDisposition === "failure" &&
    input.cCall.retryPath.length > 0 &&
    retrySource !== null
  ) {
    return deepFreeze({
      disposition: "retry" as const,
      cCall: input.cCall,
      source: retrySource,
      failureCandidate: resultCandidate as JsonValue,
      failureValueKind: input.failureValueKind,
    });
  }
  const result = admitResult(
    input.store,
    authorityPrefix,
    input.graph,
    input.graphFunction,
    input.cursor,
    input.cCall,
    resultCandidate,
    resultDisposition,
    resultDisposition === "success"
      ? input.cCall.outputContractRef
      : input.cCall.failureContractRef,
    resultDisposition === "success"
      ? input.outputValueKind
      : input.failureValueKind,
    resultDisposition === "success"
      ? (value: unknown) =>
          input.outcomeClass === "workflow"
            ? input.leafPort.validateContractValue(
                input.cCall.outputContractRef,
                "output",
                value,
              )
            : (input.regime !== "F_P" ||
                probabilistic?.kind ===
                  "contract_admitted_probabilistic_result_candidate") &&
              input.leafPort.validateContractValue(
                input.cCall.outputContractRef,
                "output",
                value,
              ) &&
              input.leafPort.validateResultEvidenceLineage(
                input.cCall.outputContractRef,
                value as Readonly<Record<string, JsonValue>>,
                evidence.map((row) => deepFreeze({
                  cCallRef: input.cCall.cCallRef,
                  cCallAttempt: input.cCall.attempt,
                  evidenceRef: row.evidenceRef,
                  evidenceDigest: row.evidenceDigest,
                  evidenceClass: row.evidenceClass,
                  outputDigest: row.outputDigest,
                  transportDigest:
                    row.evidenceClass === "probabilistic_transport" &&
                      "transportDigest" in row
                      ? row.transportDigest
                      : null,
                })),
              )
      : (value: unknown) =>
          typeof value === "object" && value !== null &&
          !Array.isArray(value) &&
          (value as Readonly<Record<string, unknown>>).kind ===
            input.failureValueKind &&
          (value as Readonly<Record<string, unknown>>).schemaVersion ===
            "5.0.0" &&
          (input.outcomeClass === "workflow" ||
            (value as Readonly<Record<string, unknown>>).diagnosticRef ===
              failureDiagnosticRef),
    evidence,
    stageBasis(input.basis, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    return stageBlockedOutcome(input, authorityPrefix, result);
  }
  return deepFreeze({
    disposition: "result" as const,
    cCall: input.cCall,
    result,
  });
}

/**
 * Admits owner evidence and one result at the caller-selected predecessor.
 * HoG must separately propose the judgment from the returned exact receipt.
 */
export function admitCCallResult(
  input: AdmitCCallResultInput,
): ResultCCallOutcomeReceipt | RetryCCallOutcomeReceipt |
  BlockedCCallOutcomeReceipt {
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError("CCall result admission owns its ABG transaction");
  }
  const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    input.store,
    input.predecessorPrefix,
    () => {
      const staged = stageCCallResult(input);
      const truth = projectActiveRuntimeTransaction(
        input.store,
        input.predecessorPrefix,
        staged.cCall.runId,
      );
      return completeOutcomeReceiptBody(staged, truth);
    },
  );
  return deepFreeze({
    ...committed.value,
    successorPrefix: committed.successorPrefix,
  }) as ResultCCallOutcomeReceipt | RetryCCallOutcomeReceipt |
    BlockedCCallOutcomeReceipt;
}

/**
 * Admits only the judgment candidate already derived by HoG from the exact
 * admitted result receipt and declared relation.
 */
export function admitCCallJudgment(
  input: Readonly<AdmitCCallJudgmentInput>,
): AdmitCCallJudgmentResult {
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError("CCall judgment admission owns its ABG transaction");
  }
  assertHeldEventStoreAtDurablePrefix(
    input.store,
    input.outcome.successorPrefix,
  );
  const events = readRuntimeEventsAtDurablePrefix(
    input.outcome.successorPrefix,
  );
  const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
  const runPrefix = selectValidatedRuntimeEventPrefix(events, {
    runId: input.outcome.cCall.runId,
  });
  const replayState = replayValidatedRuntimeEventPrefix(
    runPrefix,
    authorityPrefix,
  );
  if (
    sha256Canonical(runPrefix as unknown as JsonValue) !==
        sha256Canonical(input.outcome.runtimePrefix as unknown as JsonValue) ||
    replayState.replayDigest !== input.outcome.replayState.replayDigest
  ) {
    throw new TypeError("CCall result receipt differs from its durable prefix");
  }
  const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    input.store,
    input.outcome.successorPrefix,
    (): JudgedCCallOutcomeReceiptBody | BlockedCCallOutcomeReceiptBody => {
      const judgment = admitJudgment(
        input.store,
        authorityPrefix,
        input.graph,
        input.graphFunction,
        input.cursor,
        input.outcome.cCall,
        input.outcome.result,
        input.candidate,
        replayState,
        stageBasis(input.basis, "judgment"),
      );
      let staged: StagedCCallJudgmentOutcome;
      if (judgment.kind === "c_call_admission_rejection") {
        const rejectionPrefix = selectValidatedRuntimeEventPrefix(
          input.store.readAll(),
        );
        staged = stageBlockedOutcome({
          store: input.store,
          graph: input.graph,
          graphFunction: input.graphFunction,
          cursor: input.cursor,
          cCall: input.outcome.cCall,
          basis: input.basis,
        }, rejectionPrefix, judgment);
      } else {
        staged = deepFreeze({
          disposition: "judged" as const,
          cCall: input.outcome.cCall,
          result: input.outcome.result,
          judgment,
        });
      }
      const truth = projectActiveRuntimeTransaction(
        input.store,
        input.outcome.successorPrefix,
        input.outcome.cCall.runId,
      );
      const receipt = projectCCallOutcomeReceiptFromTruth(
        truth,
        staged.disposition === "blocked"
          ? staged
          : {
              disposition: "judged",
              admitted: {
                cCall: staged.cCall,
                result: staged.result,
                judgment: staged.judgment,
              },
            },
      );
      if (receipt?.disposition !== staged.disposition) {
        throw new TypeError(
          `CCall ${staged.disposition} differs from its staged prefix`,
        );
      }
      return receipt;
    },
  );
  return deepFreeze({
    ...committed.value,
    successorPrefix: committed.successorPrefix,
  });
}

/**
 * Admits one already-produced owner admission rejection at an exact durable
 * predecessor and returns only its rehydrated durable outcome.
 */
export function admitCCallRejection(
  input: Readonly<AdmitCCallRejectionInput>,
): BlockedCCallOutcomeReceipt {
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError("CCall rejection admission owns its ABG transaction");
  }
  assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  const events = readRuntimeEventsAtDurablePrefix(input.predecessorPrefix);
  const runPrefix = selectValidatedRuntimeEventPrefix(events, {
    runId: input.cCall.runId,
  });
  const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    input.store,
    input.predecessorPrefix,
    (): BlockedCCallOutcomeReceiptBody => {
      const completion = completeRejectedCCall(
        input.store,
        runPrefix,
        input.graph,
        input.graphFunction,
        input.cursor,
        input.cCall,
        input.rejection,
        stageBasis(input.basis, "rejected-call"),
      );
      const receipt = projectCCallOutcomeReceiptFromTruth(
        projectActiveRuntimeTransaction(
          input.store,
          input.predecessorPrefix,
          input.cCall.runId,
        ),
        {
          disposition: "blocked",
          cCall: input.cCall,
          completion,
          diagnosticRef: input.rejection.diagnosticRef,
        },
      );
      if (receipt?.disposition !== "blocked") {
        throw new TypeError("CCall rejection differs from its staged prefix");
      }
      return receipt;
    },
  );
  return deepFreeze({
    ...committed.value,
    successorPrefix: committed.successorPrefix,
  });
}

/**
 * Admits only the runtime transition selected after HoG/GTL derives a target.
 * ABG validates and admits that target; it never derives traversal topology.
 */
export function admitCCallCompletion(
  input: AdmitCCallCompletionInput,
): CCallCompletionResult {
  if (
    input.deferToApplication === true &&
    input.outcome.disposition === "judged" &&
    input.outcome.admitted.result.resultClass === "success" &&
    input.outcome.admitted.judgment.judgment === "advance"
  ) {
    if (input.target !== null || input.candidate !== null) {
      throw new TypeError(
        "application return consumes neither a topology target nor a route candidate",
      );
    }
    assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    const exactOutcome = projectCCallOutcomeReceiptAtPrefix(
      input.predecessorPrefix,
      { disposition: "judged", admitted: input.outcome.admitted },
    );
    if (exactOutcome?.disposition !== "judged") {
      throw new TypeError(
        "application return requires the exact durable judged outcome",
      );
    }
    return completionAdmission({
      disposition: "application_ready",
      outcome: exactOutcome,
      replayState: exactOutcome.replayState,
    });
  }
  if (input.candidate === null) {
    throw new TypeError("CCall completion requires HoG's exact transition candidate");
  }
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError("CCall completion owns its complete ABG transaction");
  }
  assertHeldEventStoreAtDurablePrefix(
    input.store,
    input.predecessorPrefix,
  );
  const predecessorEvents = readRuntimeEventsAtDurablePrefix(
    input.predecessorPrefix,
  );
  const exactOutcome = input.outcome.disposition === "judged"
    ? projectCCallOutcomeReceiptAtPrefix(input.predecessorPrefix, {
        disposition: "judged",
        admitted: input.outcome.admitted,
      })
    : projectCCallOutcomeReceiptAtPrefix(input.predecessorPrefix, {
        disposition: "blocked",
        cCall: input.outcome.cCall,
        completion: input.outcome.completion,
        diagnosticRef: input.outcome.diagnosticRef,
      });
  if (exactOutcome?.disposition !== input.outcome.disposition) {
    throw new TypeError("CCall completion outcome differs from its predecessor");
  }
  try {
    const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
      input.store,
      input.predecessorPrefix,
      (): StagedCCallCompletionPayload => {
        const staged = admitTraversalTransitionInActiveTransaction({
          durablePredecessorPrefix: input.predecessorPrefix,
          stagedPrefix: selectValidatedRuntimeEventPrefix(predecessorEvents),
          store: input.store,
          executionBasis: input.executionBasis,
          graph: input.graph,
          graphFunction: input.graphFunction,
          source: input.source,
          target: input.target,
          candidate: input.candidate!,
          basis: stageBasis(input.basis, "transition"),
        });
        if (staged.kind !== "staged_route_transition_admission") {
          throw new CCallCompletionAbort(staged);
        }
        const routeKind = staged.route.routeKind;
        if (
          ((routeKind === "advance" || routeKind === "re_enter") &&
            input.target === null) ||
          (["blocked", "failed", "terminal"].includes(routeKind) &&
            input.target !== null) ||
          !["advance", "re_enter", "blocked", "failed", "terminal"].includes(
            routeKind,
          )
        ) {
          throw new TypeError(
            `CCall completion received unsupported ${routeKind} transition`,
          );
        }
        let closure: ScopeClosureAdmission | null = null;
        if (routeKind === "terminal") {
          if (input.outcome.disposition !== "judged") {
            throw new TypeError("terminal CCall completion requires a judged outcome");
          }
          const { cCall, result, judgment } = input.outcome.admitted;
          const interactionResume = input.candidate!.evidence?.evidenceClass ===
              "interaction_resume"
            ? input.candidate!.evidence.resume
            : null;
          const closureBasis = stageBasis(input.basis, "closure");
          const admittedClosure = admitScopeClosure(
            input.store,
            input.predecessorPrefix,
            interactionResume !== null
              ? {
                  kind: "interaction",
                  scope: input.openedTraversalScope,
                  cCall,
                  pendingResult: result,
                  pendingJudgment: judgment,
                  resume: interactionResume,
                }
              : {
                  kind: "ordinary",
                  scope: input.openedTraversalScope,
                  cCall,
                  result,
                  judgment,
                },
            staged.route,
            input.closureContract,
            closureBasis,
          );
          if (admittedClosure.kind !== "scope_closure_admission") {
            throw new CCallCompletionAbort(admittedClosure);
          }
          closure = admittedClosure;
        }
        const truth = projectActiveRuntimeTransaction(
          input.store,
          input.predecessorPrefix,
          input.source.runId,
        );
        const transition = deepFreeze({
          kind: "route_transition_admission" as const,
          route: staged.route,
          retryAttempt: staged.retryAttempt,
          replayState: truth.replayState,
        });
        if (routeKind === "terminal") {
          if (input.outcome.disposition !== "judged" || closure === null) {
            throw new TypeError(
              "terminal route requires one judged outcome and admitted closure",
            );
          }
          return deepFreeze({
            disposition: "closed" as const,
            outcome: input.outcome,
            transition,
            closure,
          });
        }
        if (routeKind === "blocked") {
          return deepFreeze({
            disposition: "blocked" as const,
            outcome: input.outcome,
            transition,
          });
        }
        if (routeKind === "failed") {
          if (input.outcome.disposition !== "judged") {
            throw new TypeError("failed route requires one judged CCall outcome");
          }
          return deepFreeze({
            disposition: "failed" as const,
            outcome: input.outcome,
            transition,
          });
        }
        if (input.outcome.disposition !== "judged") {
          throw new TypeError("advancing route requires one judged CCall outcome");
        }
        return deepFreeze({
          disposition: "advanced" as const,
          outcome: input.outcome,
          transition,
        });
      },
    );
    const transition = deepFreeze({
      ...committed.value.transition,
      successorPrefix: committed.successorPrefix,
    });
    return completionAdmission({
      ...committed.value,
      transition,
    } as CCallCompletionPayload);
  } catch (error) {
    if (error instanceof CCallCompletionAbort) return error.result;
    throw error;
  }
}
