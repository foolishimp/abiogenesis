// Implements: T-271; REQ-L-GTL3-C-ALGEBRA-001..-017;
// REQ-R-ABG3-CCALL-001..-017. This is a structural fold over a sealed plan,
// not a graph traversal loop. Effectful leaves remain owned by runtime atoms.

import {
  detachRowSnapshot,
  isPlainRecord
} from "../contracts/admission_hygiene.js";
import {
  assertCompiledCProgramPlan,
  type CompiledCCompleteBatch,
  type CompiledCCompleteRetry,
  type CompiledCPlanNode,
  type CompiledCProgramPlan,
  type CompiledCStageLeaf,
  type CompiledCWorkflowLift
} from "../contracts/complete_c_program.js";
import {
  resolveAbgFnCompositionSelection
} from "../contracts/fn_composition.js";
import { deriveCRetryPolicyProjection } from "../contracts/c_retry_policy.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  assertRuntimeEvent,
} from "../contracts/event_admission.js";
import {
  RUNTIME_FAILURE_CLASS_VALUES,
  type CCallJudgment,
  type RuntimeEvent,
  type RuntimeFailureClass
} from "../contracts/carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  resolveSelectedCatalogExecutionBinding
} from "./selected_catalog_execution.js";
import {
  coordinateCBatchTaskFamily,
  type CBatchCoordinationStep
} from "./c_batch_runtime.js";
import {
  coordinateCRetryAttempt,
  type CRetryCoordinatedAttempt
} from "./c_retry_runtime.js";
import {
  buildCCallSpineClose,
  buildCCallSpineOpen
} from "./c_call_spine.js";

export type CProgramAtomStatus =
  | "completed"
  | "held"
  | "blocked"
  | "runtime_failed";

interface CProgramAtomRequestBasis {
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly nodeRef: string;
  readonly nodeDigest: `sha256:${string}`;
  readonly cursorRef: string;
  readonly cCallRef: string;
  readonly sourcePath: string;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionGraphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly compositionSelectionRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly vectorIndex: number;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}

export interface CProgramStageAtomRequest extends CProgramAtomRequestBasis {
  readonly kind: "c_program_stage_atom_request";
  readonly domainStageRole: string;
  readonly compositionStageRole: string;
  readonly fibre: "F_D" | "F_P" | "F_H";
  readonly armId: string;
  readonly resultBearing: boolean;
  readonly instructionCategoryRefs: readonly string[];
}

export interface CProgramWorkflowAtomRequest extends CProgramAtomRequestBasis {
  readonly kind: "c_program_workflow_atom_request";
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly compositionStageRole: string;
  readonly fibre: "F_D" | "F_P" | "F_H";
  readonly armId: string;
  readonly resultBearing: boolean;
  readonly evidenceClass: "sub_traversal";
}

export type CProgramAtomRequest =
  | CProgramStageAtomRequest
  | CProgramWorkflowAtomRequest;

export interface CProgramAtomResult {
  readonly kind: "c_program_atom_result";
  readonly planRef: string;
  readonly nodeRef: string;
  readonly cursorRef: string;
  readonly status: CProgramAtomStatus;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly outputLineageRef: string | null;
  readonly reasonRef: string | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly evidenceRefs: readonly string[];
  readonly cCallRef: string;
  readonly sourceEventRefs: readonly string[];
}

export interface CProgramAtomReceipt
  extends Omit<CProgramAtomResult, "kind"> {
  readonly kind: "c_program_atom_receipt";
  readonly receiptRef: string;
  readonly receiptDigest: `sha256:${string}`;
  readonly planDigest: `sha256:${string}`;
  readonly nodeDigest: `sha256:${string}`;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly judgment: CCallJudgment;
  readonly retryPolicyRef: string | null;
  readonly retryPolicyDigest: `sha256:${string}` | null;
  readonly retryOwnerNodeRef: string | null;
  readonly runtimeEvents: readonly RuntimeEvent[];
}

export interface CProgramExecutionCursor {
  readonly kind: "c_program_execution_cursor";
  readonly cursorRef: string;
  readonly cursorDigest: `sha256:${string}`;
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly nodeRef: string;
  readonly nodeDigest: `sha256:${string}`;
  readonly sourcePath: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly replayBasisDigest: `sha256:${string}`;
}

export interface CProgramBatchProjectionRequest {
  readonly kind: "c_program_batch_projection_request";
  readonly planRef: string;
  readonly nodeRef: string;
  readonly batchRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly completedTasks: readonly {
    readonly taskRef: string;
    readonly ordinal: number;
    readonly taskOrdinal: number;
    readonly outputPayloadRef: string;
    readonly outputLineageRef: string;
    readonly resultCarrierRef: string;
    readonly resultPayloadRef: string;
    readonly evidenceRefs: readonly string[];
  }[];
}

export interface CProgramBatchProjectionResult {
  readonly kind: "c_program_batch_projection_result";
  readonly planRef: string;
  readonly nodeRef: string;
  readonly batchRef: string;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string;
  readonly outputLineageRef: string;
  readonly resultCarrierRef: string;
  readonly resultPayloadRef: string;
  readonly evidenceRefs: readonly string[];
}

export interface CProgramBatchProjectionReceipt
  extends Omit<CProgramBatchProjectionResult, "kind"> {
  readonly kind: "c_program_batch_projection_receipt";
  readonly receiptRef: string;
  readonly receiptDigest: `sha256:${string}`;
  readonly requestDigest: `sha256:${string}`;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}

export type CProgramReplayReceipt =
  | CProgramAtomReceipt
  | CProgramBatchProjectionReceipt;

export interface CProgramInterpreterInvocation {
  readonly kind: "c_program_interpreter_invocation";
  readonly plan: CompiledCProgramPlan;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly vectorIndex: number;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly replayReceipts: readonly CProgramReplayReceipt[];
  readonly invokeAdmittedAtom: (
    request: CProgramAtomRequest
  ) => Promise<CProgramAtomResult>;
}

interface CProgramExecutionOutcomeBasis {
  readonly kind: "c_program_execution_outcome";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly status: CProgramAtomStatus;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly outputLineageRef: string | null;
  readonly resultCarrierRef: string | null;
  readonly resultPayloadRef: string | null;
  readonly reasonRef: string | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly evidenceRefs: readonly string[];
  readonly replayReceipts: readonly CProgramReplayReceipt[];
  readonly runtimeEvents: readonly RuntimeEvent[];
}

export interface CProgramExecutionCompleted
  extends CProgramExecutionOutcomeBasis {
  readonly status: "completed";
  readonly outputPayloadRef: string;
  readonly outputLineageRef: string;
  readonly resultCarrierRef: string;
  readonly resultPayloadRef: string;
  readonly reasonRef: null;
  readonly failureClass: null;
}

export interface CProgramExecutionStopped extends CProgramExecutionOutcomeBasis {
  readonly status: "held" | "blocked" | "runtime_failed";
  readonly outputPayloadRef: null;
  readonly outputLineageRef: null;
  readonly resultCarrierRef: null;
  readonly resultPayloadRef: null;
  readonly reasonRef: string;
}

export type CProgramExecutionOutcome =
  | CProgramExecutionCompleted
  | CProgramExecutionStopped;

interface NodeResolution {
  readonly status: CProgramAtomStatus;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly outputLineageRef: string | null;
  readonly resultCarrierRef: string | null;
  readonly resultPayloadRef: string | null;
  readonly reasonRef: string | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly evidenceRefs: readonly string[];
  readonly retryJudgment: CCallJudgment | null;
  readonly retryOwnerNodeRef: string | null;
  readonly pendingFailure: PendingAtomFailure | null;
}

interface PendingAtomFailure {
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly request: CProgramAtomRequest;
  readonly result: CProgramAtomResult;
  readonly openEvents: readonly RuntimeEvent[];
  readonly coordinated: CRetryCoordinatedAttempt | null;
  readonly retryOwnerNodeRef: string | null;
}

interface ExecutionContext {
  readonly invocation: CProgramInterpreterInvocation;
  readonly selected: CatalogExecutionBinding;
  readonly replay: readonly CProgramReplayReceipt[];
  readonly admitted: CProgramReplayReceipt[];
  readonly consumedReplayRefs: Set<string>;
}

const ATOM_RESULT_KEYS = Object.freeze([
  "kind",
  "planRef",
  "nodeRef",
  "cursorRef",
  "status",
  "outputCarrierRef",
  "outputPayloadRef",
  "responseContractRef",
  "outputLineageRef",
  "reasonRef",
  "failureClass",
  "evidenceRefs",
  "cCallRef",
  "sourceEventRefs"
]);

const ATOM_RECEIPT_KEYS = Object.freeze([
  ...ATOM_RESULT_KEYS.filter((key) => key !== "kind"),
  "kind",
  "receiptRef",
  "receiptDigest",
  "planDigest",
  "nodeDigest",
  "inputPayloadRef",
  "inputLineageRef",
  "taskOrdinal",
  "retryAttempt",
  "retryPath",
  "judgment",
  "retryPolicyRef",
  "retryPolicyDigest",
  "retryOwnerNodeRef",
  "runtimeEvents"
]);

const BATCH_PROJECTION_RECEIPT_KEYS = Object.freeze([
  "kind",
  "planRef",
  "nodeRef",
  "batchRef",
  "outputCarrierRef",
  "outputPayloadRef",
  "outputLineageRef",
  "resultCarrierRef",
  "resultPayloadRef",
  "evidenceRefs",
  "receiptRef",
  "receiptDigest",
  "requestDigest",
  "inputPayloadRef",
  "inputLineageRef"
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

function stringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string array`);
  }
  return Object.freeze(
    value.map((row) => nonEmpty(row, `${label}[]`))
  );
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function nonNegativeIntegerOrNull(value: unknown, label: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer or null`);
  }
  return value;
}

function retryPath(value: unknown): readonly number[] {
  if (!isUnknownArray(value)) {
    throw new TypeError("retryPath must contain positive integer coordinates");
  }
  const coordinates: number[] = [];
  for (const row of value) {
    if (typeof row !== "number" || !Number.isInteger(row) || row < 1) {
      throw new TypeError(
        "retryPath must contain positive integer coordinates"
      );
    }
    coordinates.push(row);
  }
  return Object.freeze(coordinates);
}

function atomStatus(value: unknown): CProgramAtomStatus {
  if (
    value === "completed" ||
    value === "held" ||
    value === "blocked" ||
    value === "runtime_failed"
  ) {
    return value;
  }
  throw new TypeError("C-program atom status is invalid");
}

function cCallJudgment(value: unknown): CCallJudgment {
  if (
    value === "advance" ||
    value === "retry" ||
    value === "pending" ||
    value === "blocked" ||
    value === "escalated" ||
    value === "no_declared_check"
  ) {
    return value;
  }
  throw new TypeError("C-program receipt judgment is invalid");
}

function failureClass(value: unknown): RuntimeFailureClass | null {
  if (value === null) return null;
  const selected = RUNTIME_FAILURE_CLASS_VALUES.find((row) => row === value);
  if (selected === undefined) {
    throw new TypeError("C-program atom failure class is invalid");
  }
  return selected;
}

function cursor(input: {
  readonly plan: CompiledCProgramPlan;
  readonly node: CompiledCPlanNode;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly replay: readonly CProgramReplayReceipt[];
}): CProgramExecutionCursor {
  const replayBasisDigest = stableSha256Digest(
    input.replay.map((row) => row.receiptDigest)
  );
  const basis = Object.freeze({
    kind: "c_program_execution_cursor" as const,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    nodeRef: input.node.nodeRef,
    nodeDigest: input.node.nodeDigest,
    sourcePath: input.node.sourcePath,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    taskOrdinal: input.taskOrdinal,
    retryAttempt: input.retryAttempt,
    retryPath: Object.freeze([...input.retryPath]),
    replayBasisDigest
  });
  const cursorDigest = stableSha256Digest(basis);
  const cursorIdentityDigest = stableSha256Digest({
    planRef: input.plan.planRef,
    nodeRef: input.node.nodeRef,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    taskOrdinal: input.taskOrdinal,
    retryAttempt: input.retryAttempt,
    retryPath: input.retryPath
  });
  return Object.freeze({
    ...basis,
    cursorRef:
      `abg://c-program-cursor/${cursorIdentityDigest.slice("sha256:".length)}`,
    cursorDigest
  });
}

function assertReceiptSeal(receipt: CProgramAtomReceipt): void {
  if (
    !isPlainRecord(receipt) ||
    !stableJsonEquals(
      Object.keys(receipt).sort(),
      [...ATOM_RECEIPT_KEYS].sort()
    )
  ) {
    throw new TypeError("C-program replay receipt shape differs");
  }
  nonEmpty(receipt.planRef, "receipt.planRef");
  nonEmpty(receipt.planDigest, "receipt.planDigest");
  nonEmpty(receipt.nodeRef, "receipt.nodeRef");
  nonEmpty(receipt.nodeDigest, "receipt.nodeDigest");
  nonEmpty(receipt.cursorRef, "receipt.cursorRef");
  nonEmpty(receipt.outputCarrierRef, "receipt.outputCarrierRef");
  nonEmpty(receipt.inputPayloadRef, "receipt.inputPayloadRef");
  nonEmpty(receipt.inputLineageRef, "receipt.inputLineageRef");
  nonEmpty(receipt.cCallRef, "receipt.cCallRef");
  stringArray(receipt.evidenceRefs, "receipt.evidenceRefs");
  stringArray(receipt.sourceEventRefs, "receipt.sourceEventRefs");
  nonNegativeIntegerOrNull(receipt.taskOrdinal, "receipt.taskOrdinal");
  if (!Number.isInteger(receipt.retryAttempt) || receipt.retryAttempt < 1) {
    throw new TypeError("receipt.retryAttempt must be a positive integer");
  }
  const coordinates = retryPath(receipt.retryPath);
  const expectedAttempt = coordinates.at(-1) ?? 1;
  if (receipt.retryAttempt !== expectedAttempt) {
    throw new TypeError("receipt retry attempt differs from retry path");
  }
  const status = atomStatus(receipt.status);
  const admittedFailureClass = failureClass(receipt.failureClass);
  const judgment = cCallJudgment(receipt.judgment);
  const admittedPolicyRef = nullableString(
    receipt.retryPolicyRef,
    "receipt.retryPolicyRef"
  );
  const admittedPolicyDigest = nullableString(
    receipt.retryPolicyDigest,
    "receipt.retryPolicyDigest"
  );
  const admittedRetryOwner = nullableString(
    receipt.retryOwnerNodeRef,
    "receipt.retryOwnerNodeRef"
  );
  if ((admittedPolicyRef === null) !== (admittedPolicyDigest === null)) {
    throw new TypeError("C-program retry policy receipt fields differ");
  }
  if ((admittedPolicyRef === null) !== (admittedRetryOwner === null)) {
    throw new TypeError("C-program retry owner differs from policy evidence");
  }
  if (judgment === "retry" && admittedPolicyRef === null) {
    throw new TypeError("C-program retry judgment lacks shared-policy evidence");
  }
  if (admittedPolicyRef !== null) {
    const sharedPolicy = deriveCRetryPolicyProjection();
    if (
      admittedPolicyRef !== sharedPolicy.policyRef ||
      admittedPolicyDigest !== sharedPolicy.policyDigest
    ) {
      throw new TypeError("C-program retry receipt differs from shared policy");
    }
  }
  if (status === "completed") {
    if (
      receipt.outputPayloadRef === null ||
      receipt.responseContractRef !== receipt.outputCarrierRef ||
      receipt.outputLineageRef === null ||
      receipt.reasonRef !== null ||
      admittedFailureClass !== null ||
      judgment !== "advance"
    ) {
      throw new TypeError("completed C-program replay receipt is not exact");
    }
  } else if (
    receipt.outputPayloadRef !== null ||
    receipt.responseContractRef !== null ||
    receipt.outputLineageRef !== null ||
    receipt.reasonRef === null ||
    (status === "runtime_failed") !== (admittedFailureClass !== null) ||
    status === "held" && judgment !== "pending" ||
    status === "blocked" && judgment !== "blocked" ||
    status === "runtime_failed" &&
      judgment !== "retry" &&
      judgment !== "blocked"
  ) {
    throw new TypeError("non-completed C-program replay receipt is not exact");
  }
  const admittedRuntimeEvents: unknown = receipt.runtimeEvents;
  if (!Array.isArray(admittedRuntimeEvents)) {
    throw new TypeError("C-program replay receipt runtime events are invalid");
  }
  const runtimeEvents: RuntimeEvent[] = admittedRuntimeEvents.map(
    (event: unknown): RuntimeEvent => {
      assertRuntimeEvent(event);
      return event;
    }
  );
  const opened = runtimeEvents.filter(
    (event) => event.kind === "c_call_opened"
  );
  const selected = runtimeEvents.filter(
    (event) => event.kind === "c_call_fibre_selected"
  );
  const evidenced = runtimeEvents.filter(
    (event) => event.kind === "c_call_evidenced"
  );
  const results = runtimeEvents.filter(
    (event) => event.kind === "c_call_result_admitted"
  );
  const judged = runtimeEvents.filter(
    (event) => event.kind === "c_call_judged"
  );
  if (
    opened.length !== 1 ||
    selected.length !== 1 ||
    evidenced.length !== 1 ||
    results.length !== 1 ||
    judged.length !== 1 ||
    runtimeEvents.some(
      (event) =>
        "cCallRef" in event && event.cCallRef !== receipt.cCallRef
    ) ||
    opened[0]!.programLocusRef !== receipt.nodeRef ||
    !stableJsonEquals(opened[0]!.retryPath, receipt.retryPath) ||
    opened[0]!.attempt !== receipt.retryAttempt ||
    judged[0]!.judgment !== judgment ||
    judged[0]!.reasonRef !== receipt.reasonRef ||
    results[0]!.outcomeStatus !==
      (receipt.failureClass ?? receipt.status) ||
    results[0]!.payloadRef !== receipt.outputPayloadRef ||
    results[0]!.responseContractRef !== receipt.responseContractRef
  ) {
    throw new TypeError("C-program replay receipt C-call spine differs");
  }
  if (
    admittedPolicyRef !== null &&
    !evidenced.some(
      (event) =>
        event.evidenceRefs.includes(`retry-policy:${admittedPolicyRef}`) &&
        event.evidenceRefs.includes(
          `retry-policy-digest:${admittedPolicyDigest!}`
        )
    )
  ) {
    throw new TypeError("C-program retry receipt lacks shared-policy evidence");
  }
  const { receiptRef, receiptDigest, ...basis } = receipt;
  const expected = stableSha256Digest(basis);
  if (
    receipt.kind !== "c_program_atom_receipt" ||
    receiptDigest !== expected ||
    receiptRef !== `abg://c-program-receipt/${expected.slice("sha256:".length)}`
  ) {
    throw new TypeError("C-program replay receipt seal differs");
  }
}

function assertBatchProjectionReceiptSeal(
  receipt: CProgramBatchProjectionReceipt
): void {
  if (
    !isPlainRecord(receipt) ||
    !stableJsonEquals(
      Object.keys(receipt).sort(),
      [...BATCH_PROJECTION_RECEIPT_KEYS].sort()
    )
  ) {
    throw new TypeError("C-program batch projection receipt shape differs");
  }
  nonEmpty(receipt.planRef, "batchReceipt.planRef");
  nonEmpty(receipt.nodeRef, "batchReceipt.nodeRef");
  nonEmpty(receipt.batchRef, "batchReceipt.batchRef");
  nonEmpty(receipt.outputCarrierRef, "batchReceipt.outputCarrierRef");
  nonEmpty(receipt.outputPayloadRef, "batchReceipt.outputPayloadRef");
  nonEmpty(receipt.outputLineageRef, "batchReceipt.outputLineageRef");
  nonEmpty(receipt.resultCarrierRef, "batchReceipt.resultCarrierRef");
  nonEmpty(receipt.resultPayloadRef, "batchReceipt.resultPayloadRef");
  nonEmpty(receipt.requestDigest, "batchReceipt.requestDigest");
  nonEmpty(receipt.inputPayloadRef, "batchReceipt.inputPayloadRef");
  nonEmpty(receipt.inputLineageRef, "batchReceipt.inputLineageRef");
  stringArray(receipt.evidenceRefs, "batchReceipt.evidenceRefs");
  const { receiptRef, receiptDigest, ...basis } = receipt;
  const expected = stableSha256Digest(basis);
  if (
    receipt.kind !== "c_program_batch_projection_receipt" ||
    receiptDigest !== expected ||
    receiptRef !==
      `abg://c-program-batch-projection-receipt/${expected.slice("sha256:".length)}`
  ) {
    throw new TypeError("C-program batch projection receipt seal differs");
  }
}

function planNodes(node: CompiledCPlanNode): readonly CompiledCPlanNode[] {
  switch (node.kind) {
    case "compiled_c_sequence":
      return Object.freeze([
        node,
        ...node.children.flatMap((child) => planNodes(child))
      ]);
    case "compiled_c_complete_batch":
      return Object.freeze([
        node,
        ...node.tasks.flatMap((task) => planNodes(task.child))
      ]);
    case "compiled_c_complete_retry":
      return Object.freeze([node, ...planNodes(node.child)]);
    case "compiled_c_stage_leaf":
    case "compiled_c_identity":
    case "compiled_c_workflow_lift":
      return Object.freeze([node]);
  }
}

interface ReplayNodeAuthority {
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly retryBudgets: readonly number[];
}

function replayNodeAuthorities(
  node: CompiledCPlanNode,
  retryBudgets: readonly number[] = [],
  target: Map<string, ReplayNodeAuthority> = new Map()
): ReadonlyMap<string, ReplayNodeAuthority> {
  switch (node.kind) {
    case "compiled_c_stage_leaf":
    case "compiled_c_workflow_lift":
      target.set(node.nodeRef, Object.freeze({ node, retryBudgets }));
      break;
    case "compiled_c_identity":
      break;
    case "compiled_c_sequence":
      node.children.forEach((child) =>
        replayNodeAuthorities(child, retryBudgets, target)
      );
      break;
    case "compiled_c_complete_batch":
      node.tasks.forEach((task) =>
        replayNodeAuthorities(task.child, retryBudgets, target)
      );
      break;
    case "compiled_c_complete_retry":
      replayNodeAuthorities(
        node.child,
        Object.freeze([...retryBudgets, node.maxAttempts]),
        target
      );
      break;
  }
  return target;
}

function validateInvocation(
  input: CProgramInterpreterInvocation
): CatalogExecutionBinding {
  if (input.kind !== "c_program_interpreter_invocation") {
    throw new TypeError("C-program interpreter invocation kind is invalid");
  }
  assertCompiledCProgramPlan(input.plan);
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.inputPayloadRef, "inputPayloadRef");
  nonEmpty(input.inputLineageRef, "inputLineageRef");
  if (!Number.isInteger(input.vectorIndex) || input.vectorIndex < 0) {
    throw new TypeError("C-program vectorIndex must be non-negative");
  }
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "complete C program"
  });
  if (
    selected.moduleName !== input.plan.moduleName ||
    selected.moduleDigest !== input.plan.moduleDigest ||
    selected.graphFunction.id !== input.plan.executionGraphFunctionRef ||
    stableSha256Digest(selected.graphFunction) !==
      input.plan.executionGraphFunctionDigest
  ) {
    throw new TypeError(
      "C-program invocation does not preserve selected catalog authority"
    );
  }
  const compositionOwners = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.plan.compositionOwnerGraphFunctionRef
  );
  const compositionOwner = compositionOwners[0];
  if (
    compositionOwners.length !== 1 ||
    compositionOwner === undefined ||
    stableSha256Digest(compositionOwner) !==
      input.plan.compositionOwnerGraphFunctionDigest ||
    compositionOwner.template.kind !== "inline_graph"
  ) {
    throw new TypeError(
      "C-program invocation does not preserve composition-owner authority"
    );
  }
  const vectors = compositionOwner.template.graph.vectors.filter(
    (candidate) => candidate.id === input.plan.graphVectorRef
  );
  const vector = vectors[0];
  if (
    vectors.length !== 1 ||
    vector === undefined ||
    stableSha256Digest(vector) !== input.plan.graphVectorDigest
  ) {
    throw new TypeError(
      "C-program invocation does not preserve selected GraphVector authority"
    );
  }
  const composition = resolveAbgFnCompositionSelection({
    vector,
    graphFunction: compositionOwner
  });
  if (
    composition.selectionRef !== input.plan.compositionSelectionRef ||
    composition.contract.contractRef !== input.plan.compositionRef ||
    composition.contract.contractDigest !== input.plan.compositionDigest
  ) {
    throw new TypeError(
      "C-program invocation does not preserve selected composition authority"
    );
  }
  const replayAuthorities = replayNodeAuthorities(input.plan.root);
  const nodeAuthorities = new Map(
    planNodes(input.plan.root).map((node) => [node.nodeRef, node] as const)
  );
  const receiptIdentities = new Set<string>();
  for (const receipt of input.replayReceipts) {
    let identity: string;
    if (receipt.kind === "c_program_atom_receipt") {
      assertReceiptSeal(receipt);
      const authority = replayAuthorities.get(receipt.nodeRef);
      if (
        receipt.planRef !== input.plan.planRef ||
        receipt.planDigest !== input.plan.planDigest ||
        authority === undefined ||
        receipt.nodeDigest !== authority.node.nodeDigest ||
        receipt.taskOrdinal !== authority.node.taskOrdinal ||
        receipt.retryPath.length !== authority.retryBudgets.length ||
        receipt.retryPath.some(
          (coordinate, index) => coordinate > authority.retryBudgets[index]!
        )
      ) {
        throw new TypeError(
          "C-program replay receipt belongs to a stale plan, node, task, or retry path"
        );
      }
      identity = stableSha256Digest({
        kind: receipt.kind,
        nodeRef: receipt.nodeRef,
        inputPayloadRef: receipt.inputPayloadRef,
        inputLineageRef: receipt.inputLineageRef,
        taskOrdinal: receipt.taskOrdinal,
        retryPath: receipt.retryPath
      });
    } else {
      assertBatchProjectionReceiptSeal(receipt);
      const authority = nodeAuthorities.get(receipt.nodeRef);
      if (
        receipt.planRef !== input.plan.planRef ||
        authority?.kind !== "compiled_c_complete_batch" ||
        authority.batchRef !== receipt.batchRef ||
        authority.outputCarrierRef !== receipt.outputCarrierRef ||
        authority.outputCarrierRef !== receipt.resultCarrierRef
      ) {
        throw new TypeError(
          "C-program batch projection receipt belongs to stale plan authority"
        );
      }
      identity = stableSha256Digest({
        kind: receipt.kind,
        nodeRef: receipt.nodeRef,
        inputPayloadRef: receipt.inputPayloadRef,
        inputLineageRef: receipt.inputLineageRef,
        requestDigest: receipt.requestDigest
      });
    }
    if (receiptIdentities.has(identity)) {
      throw new TypeError("C-program replay contains a duplicate receipt locus");
    }
    receiptIdentities.add(identity);
  }
  return selected;
}

function requestBasis(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly cursor: CProgramExecutionCursor;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly cCallRef: string;
}): CProgramAtomRequestBasis {
  const plan = input.context.invocation.plan;
  return Object.freeze({
    planRef: plan.planRef,
    planDigest: plan.planDigest,
    nodeRef: input.node.nodeRef,
    nodeDigest: input.node.nodeDigest,
    cursorRef: input.cursor.cursorRef,
    cCallRef: input.cCallRef,
    sourcePath: input.node.sourcePath,
    selectedCatalogEntryRef: input.context.selected.entryRef,
    moduleName: plan.moduleName,
    moduleDigest: plan.moduleDigest,
    executionGraphFunctionRef: plan.executionGraphFunctionRef,
    graphVectorRef: plan.graphVectorRef,
    compositionSelectionRef: plan.compositionSelectionRef,
    parentBasisId: input.context.invocation.parentBasisId,
    parentGraphCallId: input.context.invocation.parentGraphCallId,
    parentFrameId: input.context.invocation.parentFrameId,
    vectorIndex: input.context.invocation.vectorIndex,
    taskOrdinal: input.taskOrdinal,
    retryAttempt: input.retryAttempt,
    retryPath: Object.freeze([...input.retryPath]),
    inputCarrierRef: input.node.inputCarrierRef,
    outputCarrierRef: input.node.outputCarrierRef,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef
  });
}

function atomRequest(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly cursor: CProgramExecutionCursor;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
  readonly cCallRef: string;
}): CProgramAtomRequest {
  const basis = requestBasis(input);
  if (input.node.kind === "compiled_c_stage_leaf") {
    return Object.freeze({
      kind: "c_program_stage_atom_request" as const,
      ...basis,
      domainStageRole: input.node.domainStageRole,
      compositionStageRole:
        input.node.compositionBinding.compositionStageRole,
      fibre: input.node.fibre,
      armId: input.node.armId,
      resultBearing: input.node.resultBearing,
      instructionCategoryRefs: input.node.instructionCategoryRefs
    });
  }
  return Object.freeze({
    kind: "c_program_workflow_atom_request" as const,
    ...basis,
    childGraphFunctionRef: input.node.childGraphFunctionRef,
    childGraphFunctionDigest: input.node.childGraphFunctionDigest,
    compositionStageRole:
      input.node.compositionBinding.compositionStageRole,
    fibre: input.node.compositionBinding.regime,
    armId: input.node.compositionBinding.armId,
    resultBearing: input.node.resultCardinality === "one",
    evidenceClass: "sub_traversal" as const
  });
}

function admitAtomResult(input: {
  readonly request: CProgramAtomRequest;
  readonly raw: unknown;
}): CProgramAtomResult {
  const detached = detachRowSnapshot(input.raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("C-program atom result must be detached plain data");
  }
  if (
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...ATOM_RESULT_KEYS].sort()
    )
  ) {
    throw new TypeError("C-program atom result has a non-canonical key set");
  }
  if (detached["kind"] !== "c_program_atom_result") {
    throw new TypeError("C-program atom result kind is invalid");
  }
  const status = atomStatus(detached["status"]);
  const admittedFailureClass = failureClass(detached["failureClass"]);
  const result: CProgramAtomResult = Object.freeze({
    kind: "c_program_atom_result" as const,
    planRef: nonEmpty(detached["planRef"], "planRef"),
    nodeRef: nonEmpty(detached["nodeRef"], "nodeRef"),
    cursorRef: nonEmpty(detached["cursorRef"], "cursorRef"),
    status,
    outputCarrierRef: nonEmpty(
      detached["outputCarrierRef"],
      "outputCarrierRef"
    ),
    outputPayloadRef: nullableString(
      detached["outputPayloadRef"],
      "outputPayloadRef"
    ),
    responseContractRef: nullableString(
      detached["responseContractRef"],
      "responseContractRef"
    ),
    outputLineageRef: nullableString(
      detached["outputLineageRef"],
      "outputLineageRef"
    ),
    reasonRef: nullableString(detached["reasonRef"], "reasonRef"),
    failureClass: admittedFailureClass,
    evidenceRefs: stringArray(detached["evidenceRefs"], "evidenceRefs"),
    cCallRef: nonEmpty(detached["cCallRef"], "cCallRef"),
    sourceEventRefs: stringArray(
      detached["sourceEventRefs"],
      "sourceEventRefs"
    )
  });
  if (
    result.planRef !== input.request.planRef ||
    result.nodeRef !== input.request.nodeRef ||
    result.cursorRef !== input.request.cursorRef ||
    result.cCallRef !== input.request.cCallRef ||
    result.outputCarrierRef !== input.request.outputCarrierRef
  ) {
    throw new TypeError("C-program atom result identity or carrier differs");
  }
  if (status === "completed") {
    if (
      result.outputPayloadRef === null ||
      result.responseContractRef !== input.request.outputCarrierRef ||
      result.outputLineageRef === null ||
      result.reasonRef !== null ||
      result.failureClass !== null
    ) {
      throw new TypeError("completed C-program atom result is not exact");
    }
  } else if (
    result.outputPayloadRef !== null ||
    result.responseContractRef !== null ||
    result.outputLineageRef !== null ||
    result.reasonRef === null ||
    (status === "runtime_failed") !== (result.failureClass !== null)
  ) {
    throw new TypeError("non-completed C-program atom result is not exact");
  }
  return result;
}

function synthesizedAtomFailure(input: {
  readonly request: CProgramAtomRequest;
  readonly error: unknown;
}): CProgramAtomResult {
  const reasonRef =
    `abg://c-program/atom-failure/${stableSha256Digest({
      nodeRef: input.request.nodeRef,
      cursorRef: input.request.cursorRef,
      error: input.error instanceof Error
        ? input.error.message
        : String(input.error)
    }).slice("sha256:".length)}`;
  return Object.freeze({
    kind: "c_program_atom_result" as const,
    planRef: input.request.planRef,
    nodeRef: input.request.nodeRef,
    cursorRef: input.request.cursorRef,
    status: "runtime_failed" as const,
    outputCarrierRef: input.request.outputCarrierRef,
    outputPayloadRef: null,
    responseContractRef: null,
    outputLineageRef: null,
    reasonRef,
    failureClass: "contract_failure" as const,
    evidenceRefs: Object.freeze([reasonRef]),
    cCallRef: input.request.cCallRef,
    sourceEventRefs: Object.freeze([reasonRef])
  });
}

function sealAtomReceipt(input: {
  readonly context: ExecutionContext;
  readonly request: CProgramAtomRequest;
  readonly result: CProgramAtomResult;
  readonly judgment: CCallJudgment;
  readonly retryPolicyRef: string | null;
  readonly retryPolicyDigest: `sha256:${string}` | null;
  readonly retryOwnerNodeRef: string | null;
  readonly runtimeEvents: readonly RuntimeEvent[];
}): CProgramAtomReceipt {
  input.runtimeEvents.forEach(assertRuntimeEvent);
  const basis = Object.freeze({
    ...input.result,
    kind: "c_program_atom_receipt" as const,
    planDigest: input.request.planDigest,
    nodeDigest: input.request.nodeDigest,
    inputPayloadRef: input.request.inputPayloadRef,
    inputLineageRef: input.request.inputLineageRef,
    taskOrdinal: input.request.taskOrdinal,
    retryAttempt: input.request.retryAttempt,
    retryPath: input.request.retryPath,
    judgment: input.judgment,
    retryPolicyRef: input.retryPolicyRef,
    retryPolicyDigest: input.retryPolicyDigest,
    retryOwnerNodeRef: input.retryOwnerNodeRef,
    runtimeEvents: Object.freeze([...input.runtimeEvents])
  });
  const receiptDigest = stableSha256Digest(basis);
  const receipt = Object.freeze({
    ...basis,
    receiptRef: `abg://c-program-receipt/${receiptDigest.slice("sha256:".length)}`,
    receiptDigest
  });
  assertReceiptSeal(receipt);
  input.context.admitted.push(receipt);
  return receipt;
}

function replayReceipt(input: {
  readonly context: ExecutionContext;
  readonly request: CProgramAtomRequest;
}): CProgramAtomReceipt | null {
  const locusRows = input.context.replay.filter(
    (row): row is CProgramAtomReceipt =>
      row.kind === "c_program_atom_receipt" &&
      row.nodeRef === input.request.nodeRef &&
      row.taskOrdinal === input.request.taskOrdinal &&
      stableJsonEquals(row.retryPath, input.request.retryPath)
  );
  const matches = locusRows.filter(
    (row) =>
      row.inputPayloadRef === input.request.inputPayloadRef &&
      row.inputLineageRef === input.request.inputLineageRef
  );
  const selected = matches[0];
  if (matches.length > 1) {
    throw new TypeError("C-program replay has an ambiguous atom receipt");
  }
  if (selected === undefined && locusRows.length > 0) {
    throw new TypeError(
      "C-program replay receipt differs from current predecessor payload or lineage"
    );
  }
  if (selected === undefined) return null;
  if (
    selected.cursorRef !== input.request.cursorRef ||
    selected.cCallRef !== input.request.cCallRef ||
    selected.outputCarrierRef !== input.request.outputCarrierRef
  ) {
    throw new TypeError("C-program replay receipt differs from current cursor");
  }
  input.context.consumedReplayRefs.add(selected.receiptRef);
  return selected;
}

function resolutionFromReceipt(input: {
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly receipt: CProgramAtomReceipt;
}): NodeResolution {
  const completed = input.receipt.status === "completed";
  return Object.freeze({
    status: input.receipt.status,
    outputCarrierRef: input.node.outputCarrierRef,
    outputPayloadRef: input.receipt.outputPayloadRef,
    outputLineageRef: input.receipt.outputLineageRef,
    resultCarrierRef:
      completed && input.node.resultCardinality === "one"
        ? input.node.outputCarrierRef
        : null,
    resultPayloadRef:
      completed && input.node.resultCardinality === "one"
        ? input.receipt.outputPayloadRef
        : null,
    reasonRef: input.receipt.reasonRef,
    failureClass: input.receipt.failureClass,
    evidenceRefs: input.receipt.evidenceRefs,
    retryJudgment: input.receipt.judgment,
    retryOwnerNodeRef: input.receipt.retryOwnerNodeRef,
    pendingFailure: null
  });
}

function leafSpine(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
}) {
  const stageRole = input.node.kind === "compiled_c_stage_leaf"
    ? input.node.domainStageRole
    : input.node.compositionBinding.compositionStageRole;
  const regime = input.node.kind === "compiled_c_stage_leaf"
    ? input.node.fibre
    : input.node.compositionBinding.regime;
  const armId = input.node.kind === "compiled_c_stage_leaf"
    ? input.node.armId
    : input.node.compositionBinding.armId;
  const plan = input.context.invocation.plan;
  return buildCCallSpineOpen({
    basisId: input.context.invocation.parentBasisId,
    graphFunctionId: plan.executionGraphFunctionRef,
    graphCallId: input.context.invocation.parentGraphCallId,
    frameId: input.context.invocation.parentFrameId,
    edge: input.node.sourcePath,
    vectorIndex: input.context.invocation.vectorIndex,
    stageRole,
    taskOrdinal: input.taskOrdinal,
    attempt: input.retryAttempt,
    batchRef: input.taskOrdinal === null
      ? null
      : `abg://compiled-c-batch/${plan.planRef}`,
    programLocusRef: input.node.nodeRef,
    retryPath: input.retryPath,
    regime,
    armId,
    programRef: plan.programRef,
    compositionRef: plan.compositionRef
  });
}

function closeLeaf(input: {
  readonly request: CProgramAtomRequest;
  readonly result: CProgramAtomResult;
  readonly judgment: CCallJudgment;
}): readonly RuntimeEvent[] {
  return buildCCallSpineClose({
    cCallRef: input.request.cCallRef,
    basisId: input.request.parentBasisId,
    evidenceClass: input.request.kind === "c_program_workflow_atom_request"
      ? "sub_traversal"
      : "c_program_atom",
    evidenceRefs: Object.freeze([
      ...input.result.evidenceRefs,
      ...input.result.sourceEventRefs
    ]),
    outcomeStatus: input.result.failureClass ?? input.result.status,
    payloadRef: input.result.outputPayloadRef,
    responseContractRef: input.result.responseContractRef,
    judgment: input.judgment,
    reasonRef: input.result.reasonRef
  });
}

function finalizePendingFailure(input: {
  readonly context: ExecutionContext;
  readonly pending: PendingAtomFailure;
}): NodeResolution {
  const coordinated = input.pending.coordinated;
  const judgment = coordinated?.judgment ?? "blocked";
  const closeEvents = coordinated?.closeEvents ?? closeLeaf({
    request: input.pending.request,
    result: input.pending.result,
    judgment
  });
  const receipt = sealAtomReceipt({
    context: input.context,
    request: input.pending.request,
    result: input.pending.result,
    judgment,
    retryPolicyRef: coordinated?.policyRef ?? null,
    retryPolicyDigest: coordinated?.policyDigest ?? null,
    retryOwnerNodeRef: input.pending.retryOwnerNodeRef,
    runtimeEvents: Object.freeze([
      ...input.pending.openEvents,
      ...closeEvents
    ])
  });
  return resolutionFromReceipt({
    node: input.pending.node,
    receipt
  });
}

async function invokeLeaf(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
}): Promise<NodeResolution> {
  const currentCursor = cursor({
    plan: input.context.invocation.plan,
    node: input.node,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    taskOrdinal: input.taskOrdinal,
    retryAttempt: input.retryAttempt,
    retryPath: input.retryPath,
    replay: input.context.replay
  });
  const spine = leafSpine(input);
  const request = atomRequest({
    ...input,
    cursor: currentCursor,
    cCallRef: spine.cCallRef
  });
  const replayed = replayReceipt({ context: input.context, request });
  if (replayed !== null) {
    return resolutionFromReceipt({ node: input.node, receipt: replayed });
  }
  if (
    input.context.replay.some(
      (receipt) => !input.context.consumedReplayRefs.has(receipt.receiptRef)
    )
  ) {
    throw new TypeError(
      "C-program replay is not a contiguous execution prefix"
    );
  }
  let result: CProgramAtomResult;
  try {
    result = admitAtomResult({
      request,
      raw: await input.context.invocation.invokeAdmittedAtom(request)
    });
  } catch (error: unknown) {
    result = synthesizedAtomFailure({ request, error });
  }
  if (result.status === "runtime_failed") {
    return Object.freeze({
      status: result.status,
      outputCarrierRef: input.node.outputCarrierRef,
      outputPayloadRef: null,
      outputLineageRef: null,
      resultCarrierRef: null,
      resultPayloadRef: null,
      reasonRef: result.reasonRef,
      failureClass: result.failureClass,
      evidenceRefs: result.evidenceRefs,
      retryJudgment: null,
      retryOwnerNodeRef: null,
      pendingFailure: Object.freeze({
        node: input.node,
        request,
        result,
        openEvents: spine.events,
        coordinated: null,
        retryOwnerNodeRef: null
      })
    });
  }
  const judgment: CCallJudgment = result.status === "completed"
    ? "advance"
    : result.status === "held"
      ? "pending"
      : "blocked";
  const receipt = sealAtomReceipt({
    context: input.context,
    request,
    result,
    judgment,
    retryPolicyRef: null,
    retryPolicyDigest: null,
    retryOwnerNodeRef: null,
    runtimeEvents: Object.freeze([
      ...spine.events,
      ...closeLeaf({ request, result, judgment })
    ])
  });
  return resolutionFromReceipt({ node: input.node, receipt });
}

function stopped(input: {
  readonly node: CompiledCPlanNode;
  readonly status: Exclude<CProgramAtomStatus, "completed">;
  readonly reasonRef: string;
  readonly failureClass?: RuntimeFailureClass | null;
  readonly evidenceRefs?: readonly string[];
}): NodeResolution {
  return Object.freeze({
    status: input.status,
    outputCarrierRef: input.node.outputCarrierRef,
    outputPayloadRef: null,
    outputLineageRef: null,
    resultCarrierRef: null,
    resultPayloadRef: null,
    reasonRef: input.reasonRef,
    failureClass: input.failureClass ?? null,
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
    retryJudgment: null,
    retryOwnerNodeRef: null,
    pendingFailure: null
  });
}

function batchProjectionRequestDigest(
  request: CProgramBatchProjectionRequest
): `sha256:${string}` {
  return stableSha256Digest(request);
}

function deriveBatchProjection(
  request: CProgramBatchProjectionRequest
): CProgramBatchProjectionResult {
  const requestDigest = batchProjectionRequestDigest(request);
  const outputDigest = stableSha256Digest({
    planRef: request.planRef,
    nodeRef: request.nodeRef,
    batchRef: request.batchRef,
    outputCarrierRef: request.outputCarrierRef,
    inputPayloadRef: request.inputPayloadRef,
    inputLineageRef: request.inputLineageRef,
    tasks: request.completedTasks.map((task) => ({
      taskRef: task.taskRef,
      ordinal: task.ordinal,
      taskOrdinal: task.taskOrdinal,
      outputPayloadRef: task.outputPayloadRef,
      outputLineageRef: task.outputLineageRef
    }))
  });
  const resultDigest = stableSha256Digest({
    planRef: request.planRef,
    nodeRef: request.nodeRef,
    batchRef: request.batchRef,
    tasks: request.completedTasks.map((task) => ({
      taskRef: task.taskRef,
      ordinal: task.ordinal,
      taskOrdinal: task.taskOrdinal,
      resultCarrierRef: task.resultCarrierRef,
      resultPayloadRef: task.resultPayloadRef
    }))
  });
  return Object.freeze({
    kind: "c_program_batch_projection_result" as const,
    planRef: request.planRef,
    nodeRef: request.nodeRef,
    batchRef: request.batchRef,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef:
      `abg://c-program-batch-output/${outputDigest.slice("sha256:".length)}`,
    outputLineageRef:
      `abg://c-program-batch-lineage/${outputDigest.slice("sha256:".length)}`,
    resultCarrierRef: request.outputCarrierRef,
    resultPayloadRef:
      `abg://c-program-batch-result/${resultDigest.slice("sha256:".length)}`,
    evidenceRefs: Object.freeze([
      `batch-projection-basis:${requestDigest}`,
      `batch-output-basis:${outputDigest}`,
      `batch-result-basis:${resultDigest}`,
      ...request.completedTasks.flatMap((task) => task.evidenceRefs)
    ])
  });
}

function sealBatchProjectionReceipt(input: {
  readonly context: ExecutionContext;
  readonly request: CProgramBatchProjectionRequest;
  readonly result: CProgramBatchProjectionResult;
}): CProgramBatchProjectionReceipt {
  const basis = Object.freeze({
    ...input.result,
    kind: "c_program_batch_projection_receipt" as const,
    requestDigest: batchProjectionRequestDigest(input.request),
    inputPayloadRef: input.request.inputPayloadRef,
    inputLineageRef: input.request.inputLineageRef
  });
  const receiptDigest = stableSha256Digest(basis);
  const receipt = Object.freeze({
    ...basis,
    receiptRef:
      `abg://c-program-batch-projection-receipt/${receiptDigest.slice("sha256:".length)}`,
    receiptDigest
  });
  assertBatchProjectionReceiptSeal(receipt);
  input.context.admitted.push(receipt);
  return receipt;
}

function replayBatchProjection(input: {
  readonly context: ExecutionContext;
  readonly request: CProgramBatchProjectionRequest;
}): CProgramBatchProjectionReceipt | null {
  const expectedDigest = batchProjectionRequestDigest(input.request);
  const locusRows = input.context.replay.filter(
    (receipt): receipt is CProgramBatchProjectionReceipt =>
      receipt.kind === "c_program_batch_projection_receipt" &&
      receipt.nodeRef === input.request.nodeRef &&
      receipt.batchRef === input.request.batchRef
  );
  const matches = locusRows.filter(
    (receipt) =>
      receipt.requestDigest === expectedDigest &&
      receipt.inputPayloadRef === input.request.inputPayloadRef &&
      receipt.inputLineageRef === input.request.inputLineageRef
  );
  const selected = matches[0];
  if (matches.length > 1) {
    throw new TypeError("C-program replay has an ambiguous batch projection");
  }
  if (selected === undefined && locusRows.length > 0) {
    throw new TypeError(
      "C-program batch projection differs from current task truth"
    );
  }
  if (selected === undefined) return null;
  const expected = deriveBatchProjection(input.request);
  const admittedProjection: CProgramBatchProjectionResult = Object.freeze({
    kind: "c_program_batch_projection_result" as const,
    planRef: selected.planRef,
    nodeRef: selected.nodeRef,
    batchRef: selected.batchRef,
    outputCarrierRef: selected.outputCarrierRef,
    outputPayloadRef: selected.outputPayloadRef,
    outputLineageRef: selected.outputLineageRef,
    resultCarrierRef: selected.resultCarrierRef,
    resultPayloadRef: selected.resultPayloadRef,
    evidenceRefs: selected.evidenceRefs
  });
  if (!stableJsonEquals(admittedProjection, expected)) {
    throw new TypeError(
      "C-program batch projection receipt differs from deterministic task truth"
    );
  }
  input.context.consumedReplayRefs.add(selected.receiptRef);
  return selected;
}

async function executeBatch(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCCompleteBatch;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
}): Promise<NodeResolution> {
  const coordination = await coordinateCBatchTaskFamily({
    tasks: input.node.tasks,
    execute: async (task): Promise<CBatchCoordinationStep<NodeResolution>> => {
      const outcome = await executeNode({
        context: input.context,
        node: task.child,
        inputPayloadRef: input.inputPayloadRef,
        inputLineageRef: input.inputLineageRef,
        taskOrdinal: task.taskOrdinal,
        retryAttempt: input.retryAttempt,
        retryPath: input.retryPath
      });
      return Object.freeze({
        disposition: outcome.status,
        value: outcome,
        reasonRef: outcome.reasonRef
      });
    }
  });
  if (coordination.status !== "completed") {
    const stoppedOutcome = coordination.stoppingValue;
    if (stoppedOutcome === null) {
      throw new TypeError("stopped complete C.batch lacks its child outcome");
    }
    return stoppedOutcome;
  }
  const completed: CProgramBatchProjectionRequest["completedTasks"][number][] =
    coordination.completed.map(({ task, value }) => {
      if (value.outputPayloadRef === null || value.outputLineageRef === null) {
        throw new TypeError("completed complete C.batch task lacks output truth");
      }
      if (value.resultCarrierRef === null || value.resultPayloadRef === null) {
        throw new TypeError("completed complete C.batch task lacks result truth");
      }
      return Object.freeze({
        taskRef: task.taskRef,
        ordinal: task.ordinal,
        taskOrdinal: task.taskOrdinal,
        outputPayloadRef: value.outputPayloadRef,
        outputLineageRef: value.outputLineageRef,
        resultCarrierRef: value.resultCarrierRef,
        resultPayloadRef: value.resultPayloadRef,
        evidenceRefs: value.evidenceRefs
      });
    });
  const request: CProgramBatchProjectionRequest = Object.freeze({
    kind: "c_program_batch_projection_request" as const,
    planRef: input.context.invocation.plan.planRef,
    nodeRef: input.node.nodeRef,
    batchRef: input.node.batchRef,
    outputCarrierRef: input.node.outputCarrierRef,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    completedTasks: Object.freeze(completed)
  });
  const replayed = replayBatchProjection({ context: input.context, request });
  if (
    replayed === null &&
    input.context.replay.some(
      (receipt) => !input.context.consumedReplayRefs.has(receipt.receiptRef)
    )
  ) {
    throw new TypeError(
      "C-program replay is not a contiguous execution prefix"
    );
  }
  const projection = replayed ?? sealBatchProjectionReceipt({
    context: input.context,
    request,
    result: deriveBatchProjection(request)
  });
  return Object.freeze({
    status: "completed" as const,
    outputCarrierRef: input.node.outputCarrierRef,
    outputPayloadRef: projection.outputPayloadRef,
    outputLineageRef: projection.outputLineageRef,
    resultCarrierRef:
      input.node.resultCardinality === "one"
        ? input.node.outputCarrierRef
        : null,
    resultPayloadRef:
      input.node.resultCardinality === "one"
        ? projection.resultPayloadRef
        : null,
    reasonRef: null,
    failureClass: null,
    evidenceRefs: projection.evidenceRefs,
    retryJudgment: null,
    retryOwnerNodeRef: null,
    pendingFailure: null
  });
}

function subtreeReceipts(input: {
  readonly node: CompiledCPlanNode;
  readonly receipts: readonly CProgramReplayReceipt[];
  readonly retryPath: readonly number[];
}): readonly CProgramAtomReceipt[] {
  const refs = new Set(planNodes(input.node).map((node) => node.nodeRef));
  return Object.freeze(
    input.receipts.filter(
      (receipt): receipt is CProgramAtomReceipt =>
        receipt.kind === "c_program_atom_receipt" &&
        refs.has(receipt.nodeRef) &&
        receipt.retryPath.length >= input.retryPath.length &&
        input.retryPath.every(
          (coordinate, index) => receipt.retryPath[index] === coordinate
        )
    )
  );
}

async function executeRetry(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCCompleteRetry;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryPath: readonly number[];
}): Promise<NodeResolution> {
  let priorFailureClass: RuntimeFailureClass | null = null;
  let priorFailureSignalRef: string | null = null;
  for (let attempt = 1; attempt <= input.node.maxAttempts; attempt += 1) {
    const currentRetryPath = Object.freeze([...input.retryPath, attempt]);
    const before = subtreeReceipts({
      node: input.node.child,
      receipts: input.context.replay,
      retryPath: currentRetryPath
    });
    const outcome = await executeNode({
      context: input.context,
      node: input.node.child,
      inputPayloadRef: input.inputPayloadRef,
      inputLineageRef: input.inputLineageRef,
      taskOrdinal: input.taskOrdinal,
      retryAttempt: attempt,
      retryPath: currentRetryPath
    });
    if (outcome.status !== "runtime_failed") return outcome;
    if (outcome.pendingFailure === null) {
      if (
        outcome.retryJudgment === "retry" &&
        outcome.retryOwnerNodeRef === input.node.nodeRef
      ) {
        priorFailureClass = outcome.failureClass;
        priorFailureSignalRef = outcome.reasonRef;
        continue;
      }
      return outcome;
    }
    if (outcome.failureClass === null || outcome.reasonRef === null) {
      throw new TypeError("C.retry pending failure lacks runtime truth");
    }
    const coordinated = coordinateCRetryAttempt({
      replayEvents: outcome.pendingFailure.openEvents,
      cCallRef: outcome.pendingFailure.request.cCallRef,
      basisId: outcome.pendingFailure.request.parentBasisId,
      disposition: "runtime_failed",
      failureClass: outcome.failureClass,
      failureSignalRef: outcome.reasonRef,
      attempt,
      maxAttempts: input.node.maxAttempts,
      priorFailureClass,
      priorFailureSignalRef,
      outcomeStatus: outcome.failureClass,
      payloadRef: null,
      responseContractRef: null,
      reasonRef: outcome.reasonRef,
      evidenceRefs: Object.freeze([
        ...outcome.pendingFailure.result.evidenceRefs,
        ...outcome.pendingFailure.result.sourceEventRefs
      ])
    });
    const coordinatedOutcome: NodeResolution = Object.freeze({
      ...outcome,
      retryJudgment: coordinated.judgment,
      pendingFailure: Object.freeze({
        ...outcome.pendingFailure,
        coordinated,
        retryOwnerNodeRef: input.node.nodeRef
      })
    });
    if (coordinated.judgment !== "retry") return coordinatedOutcome;
    const finalized = finalizePendingFailure({
      context: input.context,
      pending: coordinatedOutcome.pendingFailure!
    });
    if (
      finalized.retryJudgment !== "retry" ||
      finalized.failureClass === null ||
      finalized.reasonRef === null
    ) {
      throw new TypeError("C.retry coordinator failed to record retry truth");
    }
    if (before.length > 0 && before.every((row) => row.status === "completed")) {
      throw new TypeError("C.retry replay contradicts its failed attempt outcome");
    }
    priorFailureClass = finalized.failureClass;
    priorFailureSignalRef = finalized.reasonRef;
  }
  return stopped({
    node: input.node,
    status: "blocked",
    reasonRef: "abg://c-program/retry-budget-exhausted"
  });
}

async function executeSequence(input: {
  readonly context: ExecutionContext;
  readonly children: readonly CompiledCPlanNode[];
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
}): Promise<NodeResolution> {
  let payloadRef = input.inputPayloadRef;
  let lineageRef = input.inputLineageRef;
  let resultCarrierRef: string | null = null;
  let resultPayloadRef: string | null = null;
  const evidenceRefs: string[] = [];
  let outputCarrierRef = input.children[0]?.inputCarrierRef ?? "";
  for (const child of input.children) {
    const outcome = await executeNode({
      context: input.context,
      node: child,
      inputPayloadRef: payloadRef,
      inputLineageRef: lineageRef,
      taskOrdinal: input.taskOrdinal,
      retryAttempt: input.retryAttempt,
      retryPath: input.retryPath
    });
    if (
      outcome.status !== "completed" ||
      outcome.outputPayloadRef === null ||
      outcome.outputLineageRef === null
    ) {
      return outcome;
    }
    payloadRef = outcome.outputPayloadRef;
    lineageRef = outcome.outputLineageRef;
    outputCarrierRef = outcome.outputCarrierRef;
    evidenceRefs.push(...outcome.evidenceRefs);
    if (outcome.resultPayloadRef !== null) {
      if (resultPayloadRef !== null) {
        throw new TypeError("compiled C sequence produced more than one result");
      }
      resultPayloadRef = outcome.resultPayloadRef;
      resultCarrierRef = outcome.resultCarrierRef;
    }
  }
  return Object.freeze({
    status: "completed" as const,
    outputCarrierRef,
    outputPayloadRef: payloadRef,
    outputLineageRef: lineageRef,
    resultCarrierRef,
    resultPayloadRef,
    reasonRef: null,
    failureClass: null,
    evidenceRefs: Object.freeze(evidenceRefs),
    retryJudgment: null,
    retryOwnerNodeRef: null,
    pendingFailure: null
  });
}

async function executeNode(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCPlanNode;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly taskOrdinal: number | null;
  readonly retryAttempt: number;
  readonly retryPath: readonly number[];
}): Promise<NodeResolution> {
  switch (input.node.kind) {
    case "compiled_c_identity":
      return Object.freeze({
        status: "completed" as const,
        outputCarrierRef: input.node.outputCarrierRef,
        outputPayloadRef: input.inputPayloadRef,
        outputLineageRef: input.inputLineageRef,
        resultCarrierRef: null,
        resultPayloadRef: null,
        reasonRef: null,
        failureClass: null,
        evidenceRefs: Object.freeze([]),
        retryJudgment: null,
        retryOwnerNodeRef: null,
        pendingFailure: null
      });
    case "compiled_c_stage_leaf":
    case "compiled_c_workflow_lift":
      return invokeLeaf({ ...input, node: input.node });
    case "compiled_c_sequence":
      return executeSequence({ ...input, children: input.node.children });
    case "compiled_c_complete_batch":
      return executeBatch({ ...input, node: input.node });
    case "compiled_c_complete_retry":
      return executeRetry({ ...input, node: input.node });
  }
}

export async function interpretCompleteCProgram(
  input: CProgramInterpreterInvocation
): Promise<CProgramExecutionOutcome> {
  const selected = validateInvocation(input);
  const admitted: CProgramReplayReceipt[] = [];
  const context: ExecutionContext = Object.freeze({
    invocation: input,
    selected,
    replay: Object.freeze([...input.replayReceipts]),
    admitted,
    consumedReplayRefs: new Set<string>()
  });
  let resolution = await executeNode({
    context,
    node: input.plan.root,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    taskOrdinal: null,
    retryAttempt: 1,
    retryPath: Object.freeze([])
  });
  if (resolution.pendingFailure !== null) {
    resolution = finalizePendingFailure({
      context,
      pending: resolution.pendingFailure
    });
  }
  const unconsumedReplayRefs = input.replayReceipts
    .filter((receipt) => !context.consumedReplayRefs.has(receipt.receiptRef))
    .map((receipt) => receipt.receiptRef);
  if (unconsumedReplayRefs.length > 0) {
    throw new TypeError(
      `C-program replay contains receipts outside the current execution path: ${JSON.stringify(unconsumedReplayRefs)}`
    );
  }
  const receipts = Object.freeze([...input.replayReceipts, ...admitted]);
  const runtimeEvents = Object.freeze(
    receipts.flatMap((receipt) =>
      receipt.kind === "c_program_atom_receipt"
        ? receipt.runtimeEvents
        : []
    )
  );
  if (resolution.status === "completed") {
    if (
      resolution.outputPayloadRef === null ||
      resolution.outputLineageRef === null ||
      resolution.resultCarrierRef === null ||
      resolution.resultPayloadRef === null
    ) {
      throw new TypeError(
        "completed C program lacks its exact output and result projection"
      );
    }
    return Object.freeze({
      kind: "c_program_execution_outcome" as const,
      planRef: input.plan.planRef,
      planDigest: input.plan.planDigest,
      status: "completed" as const,
      outputCarrierRef: input.plan.outputCarrierRef,
      outputPayloadRef: resolution.outputPayloadRef,
      outputLineageRef: resolution.outputLineageRef,
      resultCarrierRef: resolution.resultCarrierRef,
      resultPayloadRef: resolution.resultPayloadRef,
      reasonRef: null,
      failureClass: null,
      evidenceRefs: resolution.evidenceRefs,
      replayReceipts: receipts,
      runtimeEvents
    });
  }
  return Object.freeze({
    kind: "c_program_execution_outcome" as const,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    status: resolution.status,
    outputCarrierRef: input.plan.outputCarrierRef,
    outputPayloadRef: null,
    outputLineageRef: null,
    resultCarrierRef: null,
    resultPayloadRef: null,
    reasonRef: resolution.reasonRef ?? "abg://c-program/unspecified-stop",
    failureClass: resolution.failureClass,
    evidenceRefs: resolution.evidenceRefs,
    replayReceipts: receipts,
    runtimeEvents
  });
}
