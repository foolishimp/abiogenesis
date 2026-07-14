// Implements: T-261; REQ-L-GTL3-C-ALGEBRA-008/-016;
// REQ-R-ABG3-CCALL-004/-008/-009; REQ-R-ABG3-RETRY-001..-009.
// Replay, one shared policy, and one C-call spine per attempt own retry truth.

import type {
  CCallEvidencedEvent,
  CCallFibreSelectedEvent,
  CCallJudgment,
  CCallJudgedEvent,
  CCallOpenedEvent,
  CCallResultAdmittedEvent,
  RuntimeEvent,
  RuntimeFailureClass
} from "../contracts/carriers.js";
import {
  RUNTIME_FAILURE_CLASS_VALUES
} from "../contracts/carriers.js";
import {
  detachRowSnapshot,
  isPlainRecord
} from "../contracts/admission_hygiene.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  assertCompiledCRetryBinding,
  assertCompiledCRetryPlan,
  compileCRetryBinding,
  compileCRetryPlan,
  type CompiledCRetryBinding,
  type CompiledCRetryPlan
} from "../contracts/c_retry.js";
import {
  deriveCRetryPolicyProjection,
  isRetryableRuntimeFailureClass
} from "../contracts/c_retry_policy.js";
import {
  compileCAlgebraToHog
} from "../contracts/c_algebra_hog_compiler.js";
import {
  compileGraphVectorCProgramSelection
} from "../contracts/graph_vector_c_program_compiler.js";
import {
  resolveAbgFnCompositionSelection
} from "../contracts/fn_composition.js";
import {
  isHogRetryProgram
} from "../contracts/hog_program.js";
import {
  admitCProgramSyntax
} from "../../../gtl/m01/algebra/c_algebra.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  buildCCallSpineCloseOrResume,
  buildCCallSpineOpenOrResume,
  nextCCallAttempt,
  projectResumableCCallSpine
} from "./c_call_spine.js";
import {
  resolveSelectedCatalogExecutionBinding
} from "./selected_catalog_execution.js";

export type CRetryAttemptDisposition =
  | "completed"
  | "held"
  | "semantic_blocked"
  | "runtime_failed";

export interface CRetryAttemptBasis {
  readonly attempt: number;
  readonly attemptRunRef: string;
  readonly cCallRef: string;
  readonly attemptManifestRef: string;
  readonly attemptStateRef: string;
}

export interface CRetryAttemptRequest extends CRetryAttemptBasis {
  readonly kind: "c_retry_attempt_request";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly programRef: string;
  readonly stageRole: string;
  readonly regime: "F_D" | "F_P" | "F_H";
  readonly armId: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly maxAttempts: number;
  readonly priorFailureClass: RuntimeFailureClass | null;
  readonly priorFailureSignalRef: string | null;
}

export interface CRetryAttemptOutcome extends CRetryAttemptBasis {
  readonly kind: "c_retry_attempt_outcome";
  readonly planRef: string;
  readonly disposition: CRetryAttemptDisposition;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly failureSignalRef: string | null;
  readonly reasonRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface CRetryAttemptRecord {
  readonly attempt: number;
  readonly cCallRef: string;
  readonly outcomeStatus: string | null;
  readonly judgment: CCallJudgment | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly failureSignalRef: string | null;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
}

export type CRetryStopReason =
  | "semantic_blocked"
  | "runtime_failure"
  | "non_retryable_failure"
  | "retry_budget_exhausted"
  | "stationary_failure";

export interface CRetryResolution {
  readonly kind: "c_retry_resolution";
  readonly status: "completed" | "pending" | "blocked";
  readonly stopReason: CRetryStopReason | null;
  readonly planRef: string;
  readonly bindingRef: string;
  readonly judgment: CCallJudgment;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly attempts: readonly CRetryAttemptRecord[];
  readonly emittedEvents: readonly RuntimeEvent[];
}

export interface CRetryInvocation {
  readonly kind: "c_retry_invocation";
  readonly binding: CompiledCRetryBinding;
  readonly plan: CompiledCRetryPlan;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly taskOrdinal: number | null;
  readonly inputPayloadRef: string;
  readonly inputStateRef: string;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly invokeAttempt: (
    request: CRetryAttemptRequest
  ) => Promise<CRetryAttemptOutcome>;
}

const ATTEMPT_OUTCOME_KEYS = Object.freeze([
  "kind",
  "planRef",
  "attempt",
  "attemptRunRef",
  "cCallRef",
  "attemptManifestRef",
  "attemptStateRef",
  "disposition",
  "outputCarrierRef",
  "outputPayloadRef",
  "responseContractRef",
  "failureClass",
  "failureSignalRef",
  "reasonRef",
  "evidenceRefs"
]);

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : nonEmpty(value, label);
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
  return value;
}

function runtimeFailureClass(value: unknown): RuntimeFailureClass {
  const admitted = RUNTIME_FAILURE_CLASS_VALUES.find(
    (candidate): boolean => candidate === value
  );
  if (admitted === undefined) {
    throw new TypeError("C.retry attempt failureClass is invalid");
  }
  return admitted;
}

function attemptDisposition(value: unknown): CRetryAttemptDisposition {
  if (
    value === "completed" ||
    value === "held" ||
    value === "semantic_blocked" ||
    value === "runtime_failed"
  ) {
    return value;
  }
  throw new TypeError("C.retry attempt disposition is invalid");
}

function admittedEvidenceRefs(value: unknown): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(
      (entry): entry is string => typeof entry === "string" && entry.length > 0
    )
  ) {
    throw new TypeError("C.retry attempt requires non-empty evidence refs");
  }
  return Object.freeze([...value]);
}

function selectedModuleAuthority(
  input: CRetryInvocation
): CatalogExecutionBinding {
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "C.retry"
  });
  if (
    selected.moduleName !== input.binding.moduleName ||
    selected.moduleDigest !== input.binding.moduleDigest ||
    selected.moduleDigest !== stableSha256Digest(selected.module)
  ) {
    throw new TypeError("C.retry selected catalog Module authority differs");
  }
  const functions = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.binding.graphFunctionRef
  );
  const graphFunction = functions[0];
  if (
    functions.length !== 1 ||
    graphFunction === undefined ||
    stableSha256Digest(graphFunction) !== input.binding.graphFunctionDigest ||
    graphFunction.template.kind !== "inline_graph"
  ) {
    throw new TypeError("C.retry selected GraphFunction authority differs");
  }
  const vectors = graphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.binding.graphVectorRef
  );
  const vector = vectors[0];
  if (vectors.length !== 1 || vector === undefined) {
    throw new TypeError("C.retry selected GraphVector authority differs");
  }
  const selection = compileGraphVectorCProgramSelection({
    graphFunction,
    graphVector: vector
  });
  const rawProgram = selection.selectedCandidates[0]?.candidate;
  if (
    selection.binding === null ||
    selection.selectedCandidates.length !== 1 ||
    rawProgram === undefined
  ) {
    throw new TypeError("C.retry selected program no longer resolves exactly");
  }
  const admission = admitCProgramSyntax(rawProgram);
  if (!admission.accepted || admission.program === null) {
    throw new TypeError("C.retry selected program no longer admits");
  }
  const lowered = compileCAlgebraToHog(admission.program);
  if (
    !lowered.accepted ||
    lowered.program === null ||
    !isHogRetryProgram(lowered.program)
  ) {
    throw new TypeError("C.retry selected program no longer lowers exactly");
  }
  const owners = selected.module.graphFunctions.filter(
    (candidate) =>
      candidate.id === input.binding.compositionOwnerGraphFunctionRef
  );
  const owner = owners[0];
  if (
    owners.length !== 1 ||
    owner === undefined ||
    stableSha256Digest(owner) !==
      input.binding.compositionOwnerGraphFunctionDigest ||
    owner.template.kind !== "inline_graph"
  ) {
    throw new TypeError("C.retry composition owner authority differs");
  }
  const ownerVectors = owner.template.graph.vectors.filter(
    (candidate) => candidate.id === vector.id
  );
  const ownerVector = ownerVectors[0];
  if (
    ownerVectors.length !== 1 ||
    ownerVector === undefined ||
    !stableJsonEquals(ownerVector, vector)
  ) {
    throw new TypeError("C.retry composition owner vector differs");
  }
  const composition = resolveAbgFnCompositionSelection({
    vector: ownerVector,
    graphFunction: owner
  });
  const rederivedBinding = compileCRetryBinding({
    module: selected.module,
    graphFunction,
    compositionOwnerGraphFunction: owner,
    graphVector: vector,
    programBinding: selection.binding,
    program: lowered.program,
    composition
  });
  if (!stableJsonEquals(rederivedBinding, input.binding)) {
    throw new TypeError("C.retry binding no longer rederives exactly");
  }
  const rederivedPlan = compileCRetryPlan({
    binding: rederivedBinding,
    selectedCatalogEntryRef: selected.entryRef
  });
  if (!stableJsonEquals(rederivedPlan, input.plan)) {
    throw new TypeError("C.retry plan no longer rederives exactly");
  }
  return selected;
}

function validateInvocation(input: CRetryInvocation): CatalogExecutionBinding {
  if (input.kind !== "c_retry_invocation") {
    throw new TypeError("C.retry invocation kind is invalid");
  }
  assertCompiledCRetryBinding(input.binding);
  assertCompiledCRetryPlan(input.plan);
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.edge, "edge");
  nonEmpty(input.inputPayloadRef, "inputPayloadRef");
  nonEmpty(input.inputStateRef, "inputStateRef");
  nonNegativeInteger(input.vectorIndex, "vectorIndex");
  if (
    input.parentGraphFunctionRef !== input.binding.graphFunctionRef ||
    (input.taskOrdinal !== null &&
      (!Number.isInteger(input.taskOrdinal) || input.taskOrdinal < 0)) ||
    input.plan.bindingRef !== input.binding.bindingRef ||
    input.plan.selectedCatalogEntryRef !== input.selectedCatalogEntryRef
  ) {
    throw new TypeError(
      "C.retry invocation selected entry, locus, or plan differs"
    );
  }
  return selectedModuleAuthority(input);
}

function locusMatches(input: CRetryInvocation, opened: CCallOpenedEvent): boolean {
  return (
    opened.basisId === input.parentBasisId &&
    opened.graphFunctionId === input.parentGraphFunctionRef &&
    opened.graphCallId === input.parentGraphCallId &&
    opened.frameId === input.parentFrameId &&
    opened.edge === input.edge &&
    opened.vectorIndex === input.vectorIndex &&
    opened.stageRole === input.plan.stageRole &&
    opened.taskOrdinal === input.taskOrdinal &&
    opened.batchRef === null
  );
}

function failureClassFromStatus(value: string): RuntimeFailureClass | null {
  return RUNTIME_FAILURE_CLASS_VALUES.find(
    (candidate): boolean => candidate === value
  ) ?? null;
}

function projectAttemptRecords(
  input: CRetryInvocation,
  events: readonly RuntimeEvent[]
): readonly CRetryAttemptRecord[] {
  const opened = events
    .filter(
      (event): event is CCallOpenedEvent =>
        event.kind === "c_call_opened" && locusMatches(input, event)
    )
    .sort((left, right) => left.attempt - right.attempt);
  const refs = new Set<string>();
  return Object.freeze(opened.map((row, index) => {
    if (row.attempt !== index + 1 || refs.has(row.cCallRef)) {
      throw new TypeError(
        "C.retry replay attempts must be unique contiguous positive ordinals"
      );
    }
    refs.add(row.cCallRef);
    const results = events.filter(
      (event): event is CCallResultAdmittedEvent =>
        event.kind === "c_call_result_admitted" &&
        event.cCallRef === row.cCallRef
    );
    const judgments = events.filter(
      (event): event is CCallJudgedEvent =>
        event.kind === "c_call_judged" && event.cCallRef === row.cCallRef
    );
    const selectedRows = events.filter(
      (event): event is CCallFibreSelectedEvent =>
        event.kind === "c_call_fibre_selected" &&
        event.cCallRef === row.cCallRef
    );
    const evidenceRows = events.filter(
      (event): event is CCallEvidencedEvent =>
        event.kind === "c_call_evidenced" && event.cCallRef === row.cCallRef
    );
    if (
      selectedRows.length > 1 ||
      evidenceRows.length > 1 ||
      results.length > 1 ||
      judgments.length > 1
    ) {
      throw new TypeError("C.retry replay contains duplicate close truth");
    }
    const selected = selectedRows[0] ?? null;
    if (
      selected !== null &&
      (selected.basisId !== input.parentBasisId ||
        selected.regime !== input.plan.regime ||
        selected.armId !== input.plan.armId ||
        selected.programRef !== input.plan.programRef ||
        selected.compositionRef !== input.plan.compositionRef)
    ) {
      throw new TypeError("C.retry replay selected fibre differs from its plan");
    }
    if (
      (results.length > 0 || judgments.length > 0) &&
      selected === null
    ) {
      throw new TypeError("C.retry replay close requires one selected fibre");
    }
    const evidence = evidenceRows[0] ?? null;
    if (
      evidence !== null &&
      (evidence.basisId !== input.parentBasisId ||
        evidence.evidenceClass !== "c_retry_attempt" ||
        !evidence.evidenceRefs.includes(
          `retry-policy:${input.plan.retryPolicyRef}`
        ) ||
        !evidence.evidenceRefs.includes(
          `retry-policy-digest:${input.plan.retryPolicyDigest}`
        ))
    ) {
      throw new TypeError("C.retry replay evidence differs from its plan");
    }
    if (results.length > 0 && evidence === null) {
      throw new TypeError("C.retry replay result requires attempt evidence");
    }
    if (judgments.length > 0 && results.length !== 1) {
      throw new TypeError("C.retry replay judgment requires one admitted result");
    }
    const result = results[0] ?? null;
    const judgment = judgments[0] ?? null;
    if (
      result !== null && result.basisId !== input.parentBasisId ||
      judgment !== null && judgment.basisId !== input.parentBasisId
    ) {
      throw new TypeError("C.retry replay close basis differs from its locus");
    }
    return Object.freeze({
      attempt: row.attempt,
      cCallRef: row.cCallRef,
      outcomeStatus: result?.outcomeStatus ?? null,
      judgment: judgment?.judgment ?? null,
      failureClass: result === null
        ? null
        : failureClassFromStatus(result.outcomeStatus),
      failureSignalRef: judgment?.reasonRef ?? null,
      outputPayloadRef: result?.payloadRef ?? null,
      responseContractRef: result?.responseContractRef ?? null
    });
  }));
}

function validateReplayTransitions(
  input: CRetryInvocation,
  records: readonly CRetryAttemptRecord[]
): void {
  for (const [index, record] of records.entries()) {
    const prior = index === 0 ? null : records[index - 1] ?? null;
    if (prior !== null && prior.judgment !== "retry") {
      throw new TypeError(
        "C.retry replay opens another attempt after a terminal judgment"
      );
    }
    if (record.judgment === null) {
      if (index !== records.length - 1) {
        throw new TypeError(
          "C.retry replay contains a later attempt after an incomplete spine"
        );
      }
      continue;
    }
    const noOutput =
      record.outputPayloadRef === null && record.responseContractRef === null;
    if (record.judgment === "advance") {
      if (
        record.outcomeStatus !== "completed" ||
        record.outputPayloadRef === null ||
        record.responseContractRef !== input.plan.outputCarrierRef ||
        record.failureSignalRef !== null
      ) {
        throw new TypeError("C.retry replayed advance result is invalid");
      }
      continue;
    }
    if (record.judgment === "pending") {
      if (
        record.outcomeStatus !== "held" ||
        !noOutput ||
        record.failureSignalRef === null
      ) {
        throw new TypeError("C.retry replayed pending result is invalid");
      }
      continue;
    }
    if (record.outcomeStatus === "semantic_blocked") {
      if (
        record.judgment !== "blocked" ||
        !noOutput ||
        record.failureSignalRef === null
      ) {
        throw new TypeError("C.retry replayed semantic stop is invalid");
      }
      continue;
    }
    if (
      record.failureClass === null ||
      record.failureSignalRef === null ||
      !noOutput
    ) {
      throw new TypeError("C.retry replayed runtime failure is invalid");
    }
    const retryable = isRetryableRuntimeFailureClass(record.failureClass);
    const stationary =
      prior?.failureClass === record.failureClass &&
      prior.failureSignalRef === record.failureSignalRef;
    if (record.judgment === "retry") {
      if (
        !retryable ||
        record.attempt >= input.plan.maxAttempts ||
        stationary
      ) {
        throw new TypeError("C.retry replay contains an ineligible retry judgment");
      }
      continue;
    }
    if (
      record.judgment !== "blocked" ||
      retryable &&
        record.attempt < input.plan.maxAttempts &&
        !stationary
    ) {
      throw new TypeError("C.retry replay contains an invalid failure stop");
    }
  }
}

function terminalProjection(input: {
  readonly invocation: CRetryInvocation;
  readonly records: readonly CRetryAttemptRecord[];
  readonly emittedEvents: readonly RuntimeEvent[];
}): CRetryResolution | null {
  const last = input.records.at(-1);
  if (last === undefined || last.judgment === null || last.judgment === "retry") {
    return null;
  }
  if (last.judgment === "advance") {
    if (
      last.outcomeStatus !== "completed" ||
      last.outputPayloadRef === null ||
      last.responseContractRef !== input.invocation.plan.outputCarrierRef
    ) {
      throw new TypeError("C.retry replayed advance lacks an exact result");
    }
    return Object.freeze({
      kind: "c_retry_resolution" as const,
      status: "completed" as const,
      stopReason: null,
      planRef: input.invocation.plan.planRef,
      bindingRef: input.invocation.binding.bindingRef,
      judgment: "advance" as const,
      outputCarrierRef: input.invocation.plan.outputCarrierRef,
      outputPayloadRef: last.outputPayloadRef,
      responseContractRef: last.responseContractRef,
      reasonRef: null,
      attempts: Object.freeze([...input.records]),
      emittedEvents: Object.freeze([...input.emittedEvents])
    });
  }
  if (last.judgment === "pending") {
    return Object.freeze({
      kind: "c_retry_resolution" as const,
      status: "pending" as const,
      stopReason: null,
      planRef: input.invocation.plan.planRef,
      bindingRef: input.invocation.binding.bindingRef,
      judgment: "pending" as const,
      outputCarrierRef: input.invocation.plan.outputCarrierRef,
      outputPayloadRef: null,
      responseContractRef: null,
      reasonRef: last.failureSignalRef,
      attempts: Object.freeze([...input.records]),
      emittedEvents: Object.freeze([...input.emittedEvents])
    });
  }
  const stopReason: CRetryStopReason = last.outcomeStatus === "semantic_blocked"
    ? "semantic_blocked"
    : last.failureClass === "runtime_failure"
      ? "runtime_failure"
      : last.failureClass !== null &&
          !isRetryableRuntimeFailureClass(last.failureClass)
        ? "non_retryable_failure"
        : last.attempt >= input.invocation.plan.maxAttempts
          ? "retry_budget_exhausted"
          : "stationary_failure";
  return Object.freeze({
    kind: "c_retry_resolution" as const,
    status: "blocked" as const,
    stopReason,
    planRef: input.invocation.plan.planRef,
    bindingRef: input.invocation.binding.bindingRef,
    judgment: "blocked" as const,
    outputCarrierRef: input.invocation.plan.outputCarrierRef,
    outputPayloadRef: null,
    responseContractRef: null,
    reasonRef: last.failureSignalRef,
    attempts: Object.freeze([...input.records]),
    emittedEvents: Object.freeze([...input.emittedEvents])
  });
}

function attemptBasis(input: {
  readonly invocation: CRetryInvocation;
  readonly attempt: number;
  readonly cCallRef: string;
}): CRetryAttemptBasis {
  const basis = Object.freeze({
    planRef: input.invocation.plan.planRef,
    parentBasisId: input.invocation.parentBasisId,
    parentGraphCallId: input.invocation.parentGraphCallId,
    parentFrameId: input.invocation.parentFrameId,
    edge: input.invocation.edge,
    vectorIndex: input.invocation.vectorIndex,
    taskOrdinal: input.invocation.taskOrdinal,
    attempt: input.attempt,
    cCallRef: input.cCallRef,
    inputPayloadRef: input.invocation.inputPayloadRef,
    attemptStateRef: input.invocation.inputStateRef
  });
  const digest = stableSha256Digest(basis);
  return Object.freeze({
    attempt: input.attempt,
    attemptRunRef: `abg://c-retry-attempt-run/${digest.slice("sha256:".length)}`,
    cCallRef: input.cCallRef,
    attemptManifestRef:
      `abg://c-retry-attempt-manifest/${digest.slice("sha256:".length)}`,
    attemptStateRef: input.invocation.inputStateRef
  });
}

function requestForAttempt(input: {
  readonly invocation: CRetryInvocation;
  readonly selected: CatalogExecutionBinding;
  readonly basis: CRetryAttemptBasis;
  readonly prior: CRetryAttemptRecord | null;
}): CRetryAttemptRequest {
  return Object.freeze({
    kind: "c_retry_attempt_request" as const,
    planRef: input.invocation.plan.planRef,
    bindingRef: input.invocation.binding.bindingRef,
    selectedCatalogEntryRef: input.selected.entryRef,
    moduleName: input.selected.moduleName,
    moduleDigest: input.invocation.binding.moduleDigest,
    graphFunctionRef: input.invocation.plan.graphFunctionRef,
    graphVectorRef: input.invocation.plan.graphVectorRef,
    programRef: input.invocation.plan.programRef,
    stageRole: input.invocation.plan.stageRole,
    regime: input.invocation.plan.regime,
    armId: input.invocation.plan.armId,
    inputCarrierRef: input.invocation.plan.inputCarrierRef,
    outputCarrierRef: input.invocation.plan.outputCarrierRef,
    inputPayloadRef: input.invocation.inputPayloadRef,
    maxAttempts: input.invocation.plan.maxAttempts,
    priorFailureClass: input.prior?.failureClass ?? null,
    priorFailureSignalRef: input.prior?.failureSignalRef ?? null,
    ...input.basis
  });
}

function admitAttemptOutcome(input: {
  readonly request: CRetryAttemptRequest;
  readonly raw: unknown;
}): CRetryAttemptOutcome {
  const detached = detachRowSnapshot(input.raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("C.retry attempt outcome must be detached plain data");
  }
  if (
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...ATTEMPT_OUTCOME_KEYS].sort()
    )
  ) {
    throw new TypeError("C.retry attempt outcome has a non-canonical key set");
  }
  if (detached["kind"] !== "c_retry_attempt_outcome") {
    throw new TypeError("C.retry attempt outcome kind is invalid");
  }
  const disposition = attemptDisposition(detached["disposition"]);
  const failureClass = detached["failureClass"] === null
    ? null
    : runtimeFailureClass(detached["failureClass"]);
  const outcome: CRetryAttemptOutcome = Object.freeze({
    kind: "c_retry_attempt_outcome" as const,
    planRef: nonEmpty(detached["planRef"], "planRef"),
    attempt: positiveInteger(detached["attempt"], "attempt"),
    attemptRunRef: nonEmpty(detached["attemptRunRef"], "attemptRunRef"),
    cCallRef: nonEmpty(detached["cCallRef"], "cCallRef"),
    attemptManifestRef: nonEmpty(
      detached["attemptManifestRef"],
      "attemptManifestRef"
    ),
    attemptStateRef: nonEmpty(detached["attemptStateRef"], "attemptStateRef"),
    disposition,
    outputCarrierRef: nonEmpty(detached["outputCarrierRef"], "outputCarrierRef"),
    outputPayloadRef: nullableString(detached["outputPayloadRef"], "outputPayloadRef"),
    responseContractRef: nullableString(
      detached["responseContractRef"],
      "responseContractRef"
    ),
    failureClass,
    failureSignalRef: nullableString(
      detached["failureSignalRef"],
      "failureSignalRef"
    ),
    reasonRef: nullableString(detached["reasonRef"], "reasonRef"),
    evidenceRefs: admittedEvidenceRefs(detached["evidenceRefs"])
  });
  if (
    outcome.planRef !== input.request.planRef ||
    outcome.attempt !== input.request.attempt ||
    outcome.attemptRunRef !== input.request.attemptRunRef ||
    outcome.cCallRef !== input.request.cCallRef ||
    outcome.attemptManifestRef !== input.request.attemptManifestRef ||
    outcome.attemptStateRef !== input.request.attemptStateRef ||
    outcome.outputCarrierRef !== input.request.outputCarrierRef
  ) {
    throw new TypeError("C.retry attempt outcome identity or contract differs");
  }
  if (disposition === "completed") {
    if (
      outcome.outputPayloadRef === null ||
      outcome.responseContractRef !== input.request.outputCarrierRef ||
      outcome.failureClass !== null ||
      outcome.failureSignalRef !== null ||
      outcome.reasonRef !== null
    ) {
      throw new TypeError("completed C.retry outcome is not exact");
    }
  } else if (disposition === "runtime_failed") {
    if (
      outcome.outputPayloadRef !== null ||
      outcome.responseContractRef !== null ||
      outcome.failureClass === null ||
      outcome.failureSignalRef === null ||
      outcome.reasonRef === null
    ) {
      throw new TypeError("runtime-failed C.retry outcome is not exact");
    }
  } else if (
    outcome.outputPayloadRef !== null ||
    outcome.responseContractRef !== null ||
    outcome.failureClass !== null ||
    outcome.failureSignalRef !== null ||
    outcome.reasonRef === null
  ) {
    throw new TypeError("non-runtime C.retry stop outcome is not exact");
  }
  return outcome;
}

function synthesizedFailure(input: {
  readonly request: CRetryAttemptRequest;
  readonly failureClass: RuntimeFailureClass;
  readonly error: unknown;
}): CRetryAttemptOutcome {
  const message = input.error instanceof Error
    ? input.error.message
    : String(input.error);
  const signal = stableSha256Digest({
    failureClass: input.failureClass,
    message
  });
  const reasonRef =
    `abg://c-retry-failure/${signal.slice("sha256:".length)}`;
  return Object.freeze({
    kind: "c_retry_attempt_outcome" as const,
    planRef: input.request.planRef,
    attempt: input.request.attempt,
    attemptRunRef: input.request.attemptRunRef,
    cCallRef: input.request.cCallRef,
    attemptManifestRef: input.request.attemptManifestRef,
    attemptStateRef: input.request.attemptStateRef,
    disposition: "runtime_failed" as const,
    outputCarrierRef: input.request.outputCarrierRef,
    outputPayloadRef: null,
    responseContractRef: null,
    failureClass: input.failureClass,
    failureSignalRef: reasonRef,
    reasonRef,
    evidenceRefs: Object.freeze([reasonRef])
  });
}

export interface CRetryAttemptDecision {
  readonly judgment: CCallJudgment;
  readonly stopReason: CRetryStopReason | null;
}

export function deriveCRetryAttemptDecision(input: {
  readonly disposition: CRetryAttemptDisposition;
  readonly failureClass: RuntimeFailureClass | null;
  readonly failureSignalRef: string | null;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly priorFailureClass: RuntimeFailureClass | null;
  readonly priorFailureSignalRef: string | null;
}): CRetryAttemptDecision {
  positiveInteger(input.attempt, "C.retry decision attempt");
  positiveInteger(input.maxAttempts, "C.retry decision maxAttempts");
  if (input.attempt > input.maxAttempts) {
    throw new TypeError("C.retry decision attempt exceeds its budget");
  }
  if (input.disposition === "completed") {
    return Object.freeze({ judgment: "advance" as const, stopReason: null });
  }
  if (input.disposition === "held") {
    return Object.freeze({ judgment: "pending" as const, stopReason: null });
  }
  if (input.disposition === "semantic_blocked") {
    return Object.freeze({
      judgment: "blocked" as const,
      stopReason: "semantic_blocked" as const
    });
  }
  if (input.failureClass === null || input.failureSignalRef === null) {
    throw new TypeError("runtime-failed C.retry decision lacks failure truth");
  }
  const retryable = isRetryableRuntimeFailureClass(input.failureClass);
  const remaining = input.attempt < input.maxAttempts;
  const currentSignal = stableSha256Digest({
    failureClass: input.failureClass,
    failureSignalRef: input.failureSignalRef
  });
  const priorSignal =
    input.priorFailureClass === null || input.priorFailureSignalRef === null
      ? null
      : stableSha256Digest({
          failureClass: input.priorFailureClass,
          failureSignalRef: input.priorFailureSignalRef
        });
  const stationary = priorSignal !== null && currentSignal === priorSignal;
  if (retryable && remaining && !stationary) {
    return Object.freeze({ judgment: "retry" as const, stopReason: null });
  }
  return Object.freeze({
    judgment: "blocked" as const,
    stopReason: !retryable
      ? input.failureClass === "runtime_failure"
        ? "runtime_failure" as const
        : "non_retryable_failure" as const
      : !remaining
        ? "retry_budget_exhausted" as const
        : "stationary_failure" as const
  });
}

function emitRows(input: {
  readonly invocation: CRetryInvocation;
  readonly runtimeEvents: RuntimeEvent[];
  readonly emittedEvents: RuntimeEvent[];
  readonly rows: readonly RuntimeEvent[];
}): void {
  if (input.rows.length === 0) return;
  input.runtimeEvents.push(...input.rows);
  input.emittedEvents.push(...input.rows);
  input.invocation.emit(input.rows);
}

export async function resolveCRetry(
  input: CRetryInvocation
): Promise<CRetryResolution> {
  const selected = validateInvocation(input);
  const runtimeEvents: RuntimeEvent[] = [...input.replayEvents];
  const emittedEvents: RuntimeEvent[] = [];
  const locus = Object.freeze({
    basisId: input.parentBasisId,
    graphCallId: input.parentGraphCallId,
    frameId: input.parentFrameId,
    vectorIndex: input.vectorIndex,
    stageRole: input.plan.stageRole,
    taskOrdinal: input.taskOrdinal
  });
  const policy = deriveCRetryPolicyProjection();

  for (;;) {
    const records = projectAttemptRecords(input, runtimeEvents);
    validateReplayTransitions(input, records);
    if (records.length > input.plan.maxAttempts) {
      throw new TypeError("C.retry replay exceeds its declared attempt budget");
    }
    const terminal = terminalProjection({
      invocation: input,
      records,
      emittedEvents
    });
    if (terminal !== null) return terminal;

    const prior = records.at(-1) ?? null;
    if (prior?.judgment === "retry") {
      if (
        prior.failureClass === null ||
        !isRetryableRuntimeFailureClass(prior.failureClass) ||
        prior.failureSignalRef === null ||
        prior.attempt >= input.plan.maxAttempts
      ) {
        throw new TypeError("C.retry replay contains an ineligible retry judgment");
      }
    }

    const resumable = projectResumableCCallSpine(runtimeEvents, locus);
    if (resumable === null && records.length >= input.plan.maxAttempts) {
      return Object.freeze({
        kind: "c_retry_resolution" as const,
        status: "blocked" as const,
        stopReason: "retry_budget_exhausted" as const,
        planRef: input.plan.planRef,
        bindingRef: input.binding.bindingRef,
        judgment: "blocked" as const,
        outputCarrierRef: input.plan.outputCarrierRef,
        outputPayloadRef: null,
        responseContractRef: null,
        reasonRef: prior?.failureSignalRef ?? null,
        attempts: Object.freeze([...records]),
        emittedEvents: Object.freeze([...emittedEvents])
      });
    }
    const attempt = resumable?.opened.attempt ?? nextCCallAttempt(
      runtimeEvents,
      locus
    );
    if (attempt > input.plan.maxAttempts) {
      throw new TypeError("C.retry next attempt exceeds declared budget");
    }
    const spine = buildCCallSpineOpenOrResume(runtimeEvents, {
      basisId: input.parentBasisId,
      graphFunctionId: input.parentGraphFunctionRef,
      graphCallId: input.parentGraphCallId,
      frameId: input.parentFrameId,
      edge: input.edge,
      vectorIndex: input.vectorIndex,
      stageRole: input.plan.stageRole,
      taskOrdinal: input.taskOrdinal,
      attempt,
      batchRef: null,
      regime: input.plan.regime,
      armId: input.plan.armId,
      programRef: input.plan.programRef,
      compositionRef: input.plan.compositionRef
    });
    emitRows({
      invocation: input,
      runtimeEvents,
      emittedEvents,
      rows: spine.events
    });
    const basis = attemptBasis({
      invocation: input,
      attempt,
      cCallRef: spine.cCallRef
    });
    const request = requestForAttempt({
      invocation: input,
      selected,
      basis,
      prior
    });

    let outcome: CRetryAttemptOutcome;
    try {
      const raw = await input.invokeAttempt(request);
      try {
        outcome = admitAttemptOutcome({ request, raw });
      } catch (error: unknown) {
        outcome = synthesizedFailure({
          request,
          failureClass: "contract_failure",
          error
        });
      }
    } catch (error: unknown) {
      outcome = synthesizedFailure({
        request,
        failureClass: "runtime_failure",
        error
      });
    }

    const decision = deriveCRetryAttemptDecision({
      disposition: outcome.disposition,
      failureClass: outcome.failureClass,
      failureSignalRef: outcome.failureSignalRef,
      attempt,
      maxAttempts: input.plan.maxAttempts,
      priorFailureClass: prior?.failureClass ?? null,
      priorFailureSignalRef: prior?.failureSignalRef ?? null
    });
    const judgment = decision.judgment;
    const stopReason = decision.stopReason;
    const reasonRef = outcome.disposition === "runtime_failed"
      ? outcome.failureSignalRef
      : outcome.reasonRef;
    const closeRows = buildCCallSpineCloseOrResume(runtimeEvents, {
      cCallRef: spine.cCallRef,
      basisId: input.parentBasisId,
      evidenceClass: "c_retry_attempt",
      evidenceRefs: Object.freeze([
        `attempt-run:${outcome.attemptRunRef}`,
        `attempt-manifest:${outcome.attemptManifestRef}`,
        `attempt-state:${outcome.attemptStateRef}`,
        `retry-policy:${policy.policyRef}`,
        `retry-policy-digest:${policy.policyDigest}`,
        ...outcome.evidenceRefs
      ]),
      outcomeStatus: outcome.failureClass ?? outcome.disposition,
      payloadRef: outcome.outputPayloadRef,
      responseContractRef: outcome.responseContractRef,
      judgment,
      reasonRef
    });
    emitRows({
      invocation: input,
      runtimeEvents,
      emittedEvents,
      rows: closeRows
    });
    if (judgment === "retry") continue;

    const finalRecords = projectAttemptRecords(input, runtimeEvents);
    const projected = terminalProjection({
      invocation: input,
      records: finalRecords,
      emittedEvents
    });
    if (projected === null) {
      throw new TypeError("C.retry terminal attempt did not project a resolution");
    }
    if (stopReason !== null && projected.stopReason !== stopReason) {
      throw new TypeError("C.retry terminal stop reason did not replay exactly");
    }
    return projected;
  }
}
