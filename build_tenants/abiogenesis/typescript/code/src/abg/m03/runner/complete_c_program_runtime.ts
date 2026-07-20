// Implements: T-271; REQ-L-GTL3-C-ALGEBRA-001..-017;
// REQ-R-ABG3-CCALL-001..-017. This is a structural fold over a sealed plan,
// not a graph traversal loop. T-271 owns each invoking-locus C-call enclosure;
// callbacks own only their bounded effect interior.

import {
  detachRowSnapshot,
  isPlainRecord
} from "../contracts/admission_hygiene.js";
import {
  assertCompiledCProgramPlan,
  compiledCInvokingLociInDeclaredOrder,
  compiledCPlanNodesInDeclaredOrder,
  compiledCSubtreeNodesInDeclaredOrder,
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
  assertRuntimeEvent
} from "../contracts/event_admission.js";
import {
  constructAdmittedInvocationCarrier,
  type AdmittedInvocationCarrier
} from "../contracts/declared_execution_context.js";
import {
  isCProgramAtomInteriorEvent,
  type CProgramAtomInteriorEventKind
} from "../contracts/c_call_enclosure.js";
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
  readonly cursorDigest: `sha256:${string}`;
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
  readonly cursorDigest: `sha256:${string}`;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly targetCarrierContentDigest: string | null;
  readonly targetPayloadIdentityDigest: string | null;
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

export type CProgramAtomEvidenceEvent = Extract<RuntimeEvent, {
  readonly kind:
    | "authority_snapshot_admitted"
    | "payload_observed"
    | "payload_validated"
    | "evidence_admitted";
}>;

export type CProgramAtomInteriorEvent = Extract<RuntimeEvent, {
  readonly kind: CProgramAtomInteriorEventKind;
}>;

export interface CProgramAtomCloseBasis {
  readonly kind: "c_program_atom_close_basis";
  readonly evidenceClass: string;
  readonly evidenceRefs: readonly string[];
  readonly resultContractRef: string;
}

export interface CProgramAtomInvocationSubmission {
  readonly kind: "c_program_atom_invocation_submission";
  readonly result: CProgramAtomResult;
  readonly admittedTargetCarrier: AdmittedInvocationCarrier | null;
  readonly interiorEvents: readonly CProgramAtomInteriorEvent[];
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
  readonly closeBasis: CProgramAtomCloseBasis | null;
}

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
  ) => Promise<CProgramAtomInvocationSubmission>;
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
  readonly interiorEvents: readonly CProgramAtomInteriorEvent[];
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
  readonly closeBasis: CProgramAtomCloseBasis | null;
  readonly coordinated: CRetryCoordinatedAttempt | null;
  readonly retryOwnerNodeRef: string | null;
}

interface ExecutionContext {
  readonly invocation: CProgramInterpreterInvocation;
  readonly selected: CatalogExecutionBinding;
  readonly graphEdge: string;
  readonly replay: readonly CProgramReplayReceipt[];
  readonly admitted: CProgramReplayReceipt[];
  readonly consumedReplayRefs: Set<string>;
}

interface CausalRetryScope {
  readonly depth: number;
  readonly nodeRefs: ReadonlySet<string>;
}

interface CausalPlanProjection {
  readonly predecessorNodeRefs: ReadonlySet<string>;
  readonly retryScopes: readonly CausalRetryScope[];
}

function subtreeNodeRefs(node: CompiledCPlanNode): ReadonlySet<string> {
  return new Set(
    compiledCSubtreeNodesInDeclaredOrder(node).map((row) => row.node.nodeRef)
  );
}

// Sequence siblings are ordered; batch siblings are independent; earlier retry
// coordinates remain causal. The sealed plan owns all three relations.
function projectCausalPlan(input: {
  readonly node: CompiledCPlanNode;
  readonly currentNodeRef: string;
  readonly retryDepth: number;
}): CausalPlanProjection | null {
  if (input.node.nodeRef === input.currentNodeRef) {
    return Object.freeze({
      predecessorNodeRefs: new Set<string>(),
      retryScopes: Object.freeze([])
    });
  }
  switch (input.node.kind) {
    case "compiled_c_sequence": {
      const predecessors = new Set<string>();
      for (const child of input.node.children) {
        const selected = projectCausalPlan({
          node: child,
          currentNodeRef: input.currentNodeRef,
          retryDepth: input.retryDepth
        });
        if (selected !== null) {
          selected.predecessorNodeRefs.forEach((ref) => predecessors.add(ref));
          return Object.freeze({
            predecessorNodeRefs: predecessors,
            retryScopes: selected.retryScopes
          });
        }
        subtreeNodeRefs(child).forEach((ref) => predecessors.add(ref));
      }
      return null;
    }
    case "compiled_c_complete_batch":
      for (const task of input.node.tasks) {
        const selected = projectCausalPlan({
          node: task.child,
          currentNodeRef: input.currentNodeRef,
          retryDepth: input.retryDepth
        });
        if (selected !== null) return selected;
      }
      return null;
    case "compiled_c_complete_retry": {
      const selected = projectCausalPlan({
        node: input.node.child,
        currentNodeRef: input.currentNodeRef,
        retryDepth: input.retryDepth + 1
      });
      if (selected === null) return null;
      return Object.freeze({
        predecessorNodeRefs: selected.predecessorNodeRefs,
        retryScopes: Object.freeze([
          ...selected.retryScopes,
          Object.freeze({
            depth: input.retryDepth,
            nodeRefs: subtreeNodeRefs(input.node.child)
          })
        ])
      });
    }
    case "compiled_c_stage_leaf":
    case "compiled_c_identity":
    case "compiled_c_workflow_lift":
      return null;
  }
}

function receiptPrecedesRetryCoordinate(input: {
  readonly receipt: CProgramReplayReceipt;
  readonly retryPath: readonly number[];
  readonly scope: CausalRetryScope;
}): boolean {
  if (
    input.receipt.kind !== "c_program_atom_receipt" ||
    !input.scope.nodeRefs.has(input.receipt.nodeRef) ||
    input.receipt.retryPath.length <= input.scope.depth ||
    input.retryPath.length <= input.scope.depth
  ) {
    return false;
  }
  for (let index = 0; index < input.scope.depth; index += 1) {
    if (input.receipt.retryPath[index] !== input.retryPath[index]) return false;
  }
  return input.receipt.retryPath[input.scope.depth]! <
    input.retryPath[input.scope.depth]!;
}

function causalReplayBasis(input: {
  readonly context: ExecutionContext;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly retryPath: readonly number[];
}): readonly CProgramReplayReceipt[] {
  const projection = projectCausalPlan({
    node: input.context.invocation.plan.root,
    currentNodeRef: input.node.nodeRef,
    retryDepth: 0
  });
  if (projection === null) {
    throw new TypeError("current C-program node is absent from its sealed plan");
  }
  const available = [
    ...input.context.replay.filter((receipt) =>
      input.context.consumedReplayRefs.has(receipt.receiptRef)
    ),
    ...input.context.admitted
  ];
  const causal = available.filter((receipt) =>
    projection.predecessorNodeRefs.has(receipt.nodeRef) ||
    projection.retryScopes.some((scope) =>
      receiptPrecedesRetryCoordinate({
        receipt,
        retryPath: input.retryPath,
        scope
      })
    )
  );
  causal.sort((left, right) =>
    left.receiptDigest.localeCompare(right.receiptDigest)
  );
  return Object.freeze(causal);
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

const ATOM_SUBMISSION_KEYS = Object.freeze([
  "kind",
  "result",
  "admittedTargetCarrier",
  "interiorEvents",
  "evidenceEvents",
  "closeBasis"
]);

const ADMITTED_TARGET_CARRIER_KEYS = Object.freeze([
  "kind",
  "sourceNodeRef",
  "schemaRef",
  "carrierRef",
  "carrierDigest",
  "admissionRef",
  "value"
]);

const ATOM_CLOSE_BASIS_KEYS = Object.freeze([
  "kind",
  "evidenceClass",
  "evidenceRefs",
  "resultContractRef"
]);

const ATOM_RECEIPT_KEYS = Object.freeze([
  ...ATOM_RESULT_KEYS.filter((key) => key !== "kind"),
  "kind",
  "receiptRef",
  "receiptDigest",
  "planDigest",
  "nodeDigest",
  "cursorDigest",
  "inputPayloadRef",
  "inputLineageRef",
  "targetCarrierContentDigest",
  "targetPayloadIdentityDigest",
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
  nonEmpty(receipt.cursorDigest, "receipt.cursorDigest");
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
  const targetCarrierContentDigest = nullableString(
    receipt.targetCarrierContentDigest,
    "receipt.targetCarrierContentDigest"
  );
  const targetPayloadIdentityDigest = nullableString(
    receipt.targetPayloadIdentityDigest,
    "receipt.targetPayloadIdentityDigest"
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
      targetCarrierContentDigest === null ||
      targetPayloadIdentityDigest === null ||
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
    targetCarrierContentDigest !== null ||
    targetPayloadIdentityDigest !== null ||
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
  const observedPayloads = runtimeEvents.filter(
    (event) => event.kind === "payload_observed"
  );
  const validatedPayloads = runtimeEvents.filter(
    (event) => event.kind === "payload_validated"
  );
  const evidenceResultContractRef =
    opened.length === 1 &&
    observedPayloads.length === 1 &&
    validatedPayloads.length === 1 &&
    observedPayloads[0]!.basisId === opened[0]!.basisId &&
    observedPayloads[0]!.graphCallId === opened[0]!.graphCallId &&
    observedPayloads[0]!.frameId === opened[0]!.frameId &&
    observedPayloads[0]!.vectorIndex === opened[0]!.vectorIndex &&
    observedPayloads[0]!.edge === opened[0]!.edge &&
    observedPayloads[0]!.sourceEventRef === receipt.cCallRef &&
    validatedPayloads[0]!.basisId === opened[0]!.basisId &&
    validatedPayloads[0]!.graphCallId === opened[0]!.graphCallId &&
    validatedPayloads[0]!.frameId === opened[0]!.frameId &&
    validatedPayloads[0]!.vectorIndex === opened[0]!.vectorIndex &&
    validatedPayloads[0]!.edge === opened[0]!.edge &&
    observedPayloads[0]!.payloadRef === receipt.outputPayloadRef &&
    validatedPayloads[0]!.payloadRef === receipt.outputPayloadRef &&
    observedPayloads[0]!.digest === validatedPayloads[0]!.digest &&
    observedPayloads[0]!.contractRef !== null &&
    observedPayloads[0]!.contractRef === validatedPayloads[0]!.contractRef &&
    observedPayloads[0]!.digest === targetPayloadIdentityDigest
      ? observedPayloads[0]!.contractRef
      : null;
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
    selected[0]!.basisId !== opened[0]!.basisId ||
    evidenced[0]!.basisId !== opened[0]!.basisId ||
    results[0]!.basisId !== opened[0]!.basisId ||
    judged[0]!.basisId !== opened[0]!.basisId ||
    opened[0]!.programLocusRef !== receipt.nodeRef ||
    !stableJsonEquals(opened[0]!.retryPath, receipt.retryPath) ||
    opened[0]!.attempt !== receipt.retryAttempt ||
    judged[0]!.judgment !== judgment ||
    judged[0]!.reasonRef !== receipt.reasonRef ||
    results[0]!.outcomeStatus !==
      (receipt.failureClass ?? receipt.status) ||
    results[0]!.payloadRef !== receipt.outputPayloadRef ||
    (results[0]!.responseContractRef !== receipt.responseContractRef &&
      results[0]!.responseContractRef !== evidenceResultContractRef)
  ) {
    throw new TypeError("C-program replay receipt C-call spine differs");
  }
  const openIndex = runtimeEvents.indexOf(opened[0]!);
  const selectedIndex = runtimeEvents.indexOf(selected[0]!);
  const evidencedIndex = runtimeEvents.indexOf(evidenced[0]!);
  const resultIndex = runtimeEvents.indexOf(results[0]!);
  const judgedIndex = runtimeEvents.indexOf(judged[0]!);
  if (
    openIndex !== 0 ||
    selectedIndex !== 1 ||
    evidencedIndex !== runtimeEvents.length - 3 ||
    resultIndex !== runtimeEvents.length - 2 ||
    judgedIndex !== runtimeEvents.length - 1
  ) {
    throw new TypeError("C-program replay receipt enclosure order differs");
  }
  const scope: CProgramAtomEventScope = Object.freeze({
    basisId: opened[0]!.basisId,
    graphFunctionId: opened[0]!.graphFunctionId,
    graphCallId: opened[0]!.graphCallId,
    frameId: opened[0]!.frameId,
    vectorIndex: opened[0]!.vectorIndex,
    edge: opened[0]!.edge
  });
  const interiorEvents: CProgramAtomInteriorEvent[] = [];
  const evidenceEvents: CProgramAtomEvidenceEvent[] = [];
  let evidenceStarted = false;
  for (const event of runtimeEvents.slice(2, -3)) {
    assertAtomEventScope(event, scope);
    if (isCProgramAtomInteriorEvent(event)) {
      if (evidenceStarted) {
        throw new TypeError(
          "C-program replay receipt interior follows evidence"
        );
      }
      interiorEvents.push(event);
      continue;
    }
    if (isCProgramAtomEvidenceEvent(event)) {
      evidenceStarted = true;
      if (
        event.kind === "payload_observed" &&
        event.sourceEventRef !== receipt.cCallRef
      ) {
        throw new TypeError(
          "C-program replay payload observation differs from its C-call"
        );
      }
      evidenceEvents.push(event);
      continue;
    }
    throw new TypeError(
      "C-program replay receipt contains a non-enclosed runtime event"
    );
  }
  assertAtomInteriorCausality({
    events: interiorEvents,
    requireFpLifecycle:
      status === "completed" &&
      selected[0]!.regime === "F_P" &&
      evidenced[0]!.evidenceClass !== "sub_traversal"
  });
  assertAtomEvidenceOrder(evidenceEvents);
  if (status === "completed") {
    assertCompletedEvidenceChain({
      label: "completed C-program replay receipt",
      payloadRef: receipt.outputPayloadRef!,
      schemaRef: null,
      resultContractRef: evidenceResultContractRef,
      closeEvidenceRefs: evidenced[0]!.evidenceRefs,
      supplementaryCloseRefs: Object.freeze([
        ...receipt.evidenceRefs,
        ...receipt.sourceEventRefs
      ]),
      evidenceEvents
    });
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

function assertCompletedEvidenceChain(input: {
  readonly label: string;
  readonly payloadRef: string;
  readonly schemaRef: string | null;
  readonly resultContractRef: string | null;
  readonly closeEvidenceRefs: readonly string[];
  readonly supplementaryCloseRefs: readonly string[];
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
}): void {
  const authorities = input.evidenceEvents.filter(
    (event) => event.kind === "authority_snapshot_admitted"
  );
  const observed = input.evidenceEvents.filter(
    (event) => event.kind === "payload_observed"
  );
  const validated = input.evidenceEvents.filter(
    (event) => event.kind === "payload_validated"
  );
  const evidence = input.evidenceEvents.filter(
    (event) => event.kind === "evidence_admitted"
  );
  const authority = authorities[0];
  const observation = observed[0];
  const validation = validated[0];
  const admittedAuthorityRefs = new Set(
    authority === undefined
      ? []
      : [authority.authoritySnapshotRef, ...authority.authorityRefs]
  );
  const evidenceAuthorityRef = observation?.authorityRef ?? null;
  if (
    authorities.length !== 1 ||
    observed.length !== 1 ||
    validated.length !== 1 ||
    evidence.length === 0 ||
    authority === undefined ||
    observation === undefined ||
    validation === undefined ||
    observation.payloadRef !== input.payloadRef ||
    validation.payloadRef !== input.payloadRef ||
    observation.schemaRef === null ||
    observation.schemaRef !== validation.schemaRef ||
    (input.schemaRef !== null && observation.schemaRef !== input.schemaRef) ||
    observation.contractRef === null ||
    observation.contractRef !== validation.contractRef ||
    observation.contractRef !== input.resultContractRef ||
    observation.digest !== validation.digest ||
    evidenceAuthorityRef === null ||
    !admittedAuthorityRefs.has(evidenceAuthorityRef) ||
    observation.inputDigest !== authority.inputDigest ||
    validation.evidenceRef === null ||
    !evidence.some((event) => event.evidenceRef === validation.evidenceRef) ||
    authority.closureCapable !== true ||
    authority.contradictoryAuthority !== false ||
    authority.deferredAuthorityRefs.length !== 0 ||
    evidence.some(
      (event) =>
        event.payloadRef !== input.payloadRef ||
        event.authorityRef !== evidenceAuthorityRef ||
        event.authorityDigest !== authority.authorityDigest ||
        event.inputDigest !== authority.inputDigest ||
        event.complete !== true ||
        event.shallow !== false ||
        event.contradictsAuthority !== false ||
        event.deferred !== false
    )
  ) {
    throw new TypeError(
      `${input.label} lacks its exact admitted evidence chain`
    );
  }
  const allowedCloseRefs = new Set([
    authority.authoritySnapshotRef,
    validation.validationRef,
    validation.evidenceRef,
    ...evidence.map((event) => event.evidenceRef),
    ...input.supplementaryCloseRefs
  ]);
  if (
    !input.closeEvidenceRefs.includes(authority.authoritySnapshotRef) ||
    !input.closeEvidenceRefs.includes(validation.validationRef) ||
    evidence.some(
      (event) => !input.closeEvidenceRefs.includes(event.evidenceRef)
    ) ||
    input.closeEvidenceRefs.some((ref) => !allowedCloseRefs.has(ref))
  ) {
    throw new TypeError(
      `${input.label} close evidence differs from its enclosed chain`
    );
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

function validateInvocation(
  input: CProgramInterpreterInvocation
): Readonly<{
  selected: CatalogExecutionBinding;
  graphEdge: string;
}> {
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
  const replayAuthorities = new Map(
    compiledCInvokingLociInDeclaredOrder(input.plan).map((row) =>
      [row.node.nodeRef, row] as const
    )
  );
  const nodeAuthorities = new Map(
    compiledCPlanNodesInDeclaredOrder(input.plan).map((row) =>
      [row.node.nodeRef, row.node] as const
    )
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
  return Object.freeze({
    selected,
    graphEdge: vector.name
  });
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
    cursorDigest: input.cursor.cursorDigest,
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

interface CProgramAtomEventScope {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
}

function requestEventScope(
  request: CProgramAtomRequest,
  graphEdge: string
): CProgramAtomEventScope {
  return Object.freeze({
    basisId: request.parentBasisId,
    graphFunctionId: request.executionGraphFunctionRef,
    graphCallId: request.parentGraphCallId,
    frameId: request.parentFrameId,
    vectorIndex: request.vectorIndex,
    edge: graphEdge
  });
}

function assertAtomEventScope(
  event: RuntimeEvent,
  scope: CProgramAtomEventScope
): void {
  const row: Readonly<Record<string, unknown>> = { ...event };
  const exact = (key: keyof CProgramAtomEventScope): void => {
    if (key in row && row[key] !== scope[key]) {
      throw new TypeError(
        `C-program atom event ${String(key)} differs from its call locus`
      );
    }
  };
  exact("basisId");
  exact("graphFunctionId");
  exact("graphCallId");
  exact("frameId");
  exact("vectorIndex");
  exact("edge");
}

function admitTargetCarrier(raw: unknown): AdmittedInvocationCarrier | null {
  if (raw === null) return null;
  const detached = detachRowSnapshot(raw);
  if (
    !isPlainRecord(detached) ||
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...ADMITTED_TARGET_CARRIER_KEYS].sort()
    ) ||
    detached["kind"] !== "admitted_invocation_carrier"
  ) {
    throw new TypeError(
      "C-program atom target must be one canonical admitted invocation carrier"
    );
  }
  const admitted = constructAdmittedInvocationCarrier({
    sourceNodeRef: nonEmpty(detached["sourceNodeRef"], "sourceNodeRef"),
    schemaRef: nonEmpty(detached["schemaRef"], "schemaRef"),
    carrierRef: nonEmpty(detached["carrierRef"], "carrierRef"),
    admissionRef: nonEmpty(detached["admissionRef"], "admissionRef"),
    value: detached["value"]
  });
  if (admitted.carrierDigest !== detached["carrierDigest"]) {
    throw new TypeError("C-program atom target carrier digest differs");
  }
  return admitted;
}

function admitAtomCloseBasis(raw: unknown): CProgramAtomCloseBasis | null {
  if (raw === null) return null;
  const detached = detachRowSnapshot(raw);
  if (
    !isPlainRecord(detached) ||
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...ATOM_CLOSE_BASIS_KEYS].sort()
    ) ||
    detached["kind"] !== "c_program_atom_close_basis"
  ) {
    throw new TypeError("C-program atom close basis is not canonical");
  }
  const evidenceRefs = stringArray(
    detached["evidenceRefs"],
    "closeBasis.evidenceRefs"
  );
  if (new Set(evidenceRefs).size !== evidenceRefs.length) {
    throw new TypeError("C-program atom close basis evidence is duplicated");
  }
  return Object.freeze({
    kind: "c_program_atom_close_basis" as const,
    evidenceClass: nonEmpty(
      detached["evidenceClass"],
      "closeBasis.evidenceClass"
    ),
    evidenceRefs,
    resultContractRef: nonEmpty(
      detached["resultContractRef"],
      "closeBasis.resultContractRef"
    )
  });
}

function assertAtomInteriorCausality(input: {
  readonly events: readonly CProgramAtomInteriorEvent[];
  readonly requireFpLifecycle: boolean;
}): void {
  const indices = (kind: CProgramAtomInteriorEvent["kind"]): number[] =>
    input.events.flatMap(
      (event, index) => event.kind === kind ? [index] : []
    );
  const dispatch = indices("fp_dispatch_requested");
  const started = indices("actor_invocation_started");
  const closed = indices("actor_invocation_closed");
  if (dispatch.length > 1 || started.length > 1 || closed.length > 1) {
    throw new TypeError("C-program atom interior lifecycle is duplicated");
  }
  if ((started.length === 0) !== (closed.length === 0)) {
    throw new TypeError("C-program atom actor lifecycle is incomplete");
  }
  if (
    started[0] !== undefined &&
    (closed[0]! <= started[0] ||
      dispatch[0] !== undefined && dispatch[0] >= started[0])
  ) {
    throw new TypeError("C-program atom actor lifecycle is out of order");
  }
  if (
    input.requireFpLifecycle &&
    (dispatch.length !== 1 || started.length !== 1 || closed.length !== 1)
  ) {
    throw new TypeError(
      "C-program F_P stage requires one dispatch, actor start, and actor close"
    );
  }
  const actorIds = new Set(
    input.events.flatMap((event) => {
      const actorInvocationId = (
        { ...event } as Readonly<Record<string, unknown>>
      )["actorInvocationId"];
      return typeof actorInvocationId === "string" ? [actorInvocationId] : [];
    })
  );
  if (actorIds.size > 1) {
    throw new TypeError("C-program atom interior actor identity differs");
  }
  if (dispatch[0] !== undefined && started[0] !== undefined) {
    const dispatchEvent = input.events[dispatch[0]];
    const startedEvent = input.events[started[0]];
    if (
      dispatchEvent?.kind !== "fp_dispatch_requested" ||
      startedEvent?.kind !== "actor_invocation_started" ||
      dispatchEvent.dispatchRef !== startedEvent.dispatchRef
    ) {
      throw new TypeError("C-program atom dispatch identity differs");
    }
  }
  if (started[0] !== undefined && closed[0] !== undefined) {
    const actorWindowKinds = new Set<CProgramAtomInteriorEvent["kind"]>([
      "actor_process_started",
      "actor_process_start_failed",
      "actor_process_stream_observed",
      "actor_process_heartbeat",
      "actor_process_timeout",
      "actor_process_signal_sent",
      "actor_process_exited",
      "actor_result_artifact_observed",
      "instruction_response_contract_admitted"
    ]);
    input.events.forEach((event, index) => {
      if (
        actorWindowKinds.has(event.kind) &&
        (index <= started[0]! || index >= closed[0]!)
      ) {
        throw new TypeError(
          "C-program atom process or result event is outside the actor window"
        );
      }
    });
  }
}

function admitAtomInteriorEvents(input: {
  readonly raw: unknown;
  readonly request: CProgramAtomRequest;
  readonly graphEdge: string;
}): readonly CProgramAtomInteriorEvent[] {
  if (!Array.isArray(input.raw)) {
    throw new TypeError("C-program atom interior events must be an array");
  }
  const events = input.raw.map((raw): CProgramAtomInteriorEvent => {
    const event = detachRowSnapshot(raw);
    assertRuntimeEvent(event);
    if (!isCProgramAtomInteriorEvent(event)) {
      throw new TypeError("C-program atom interior event kind is not admitted");
    }
    assertAtomEventScope(
      event,
      requestEventScope(input.request, input.graphEdge)
    );
    return event;
  });
  assertAtomInteriorCausality({
    events,
    requireFpLifecycle: false
  });
  return Object.freeze(events);
}

function isCProgramAtomEvidenceEvent(
  event: RuntimeEvent
): event is CProgramAtomEvidenceEvent {
  return event.kind === "authority_snapshot_admitted" ||
    event.kind === "payload_observed" ||
    event.kind === "payload_validated" ||
    event.kind === "evidence_admitted";
}

function assertAtomEvidenceOrder(
  events: readonly CProgramAtomEvidenceEvent[]
): void {
  const indices = (kind: CProgramAtomEvidenceEvent["kind"]): number[] =>
    events.flatMap((event, index) => event.kind === kind ? [index] : []);
  const authority = indices("authority_snapshot_admitted");
  const observed = indices("payload_observed");
  const validated = indices("payload_validated");
  const evidence = indices("evidence_admitted");
  if (authority.length > 1 || observed.length > 1 || validated.length > 1) {
    throw new TypeError("C-program atom evidence authority is duplicated");
  }
  const evidenceRefs = events.flatMap((event) =>
    event.kind === "evidence_admitted" ? [event.evidenceRef] : []
  );
  if (new Set(evidenceRefs).size !== evidenceRefs.length) {
    throw new TypeError("C-program atom admitted evidence is duplicated");
  }
  if ((observed.length === 0) !== (validated.length === 0)) {
    throw new TypeError("C-program atom payload evidence is incomplete");
  }
  if (
    observed[0] !== undefined &&
    (observed[0] >= validated[0]! ||
      authority[0] !== undefined && authority[0] >= observed[0] ||
      evidence.some((index) => index <= validated[0]!))
  ) {
    throw new TypeError("C-program atom evidence is out of order");
  }
}

function admitAtomEvidenceEvents(input: {
  readonly raw: unknown;
  readonly request: CProgramAtomRequest;
  readonly graphEdge: string;
}): readonly CProgramAtomEvidenceEvent[] {
  if (!Array.isArray(input.raw)) {
    throw new TypeError("C-program atom evidence events must be an array");
  }
  const events = input.raw.map((raw): CProgramAtomEvidenceEvent => {
    const event = detachRowSnapshot(raw);
    assertRuntimeEvent(event);
    if (!isCProgramAtomEvidenceEvent(event)) {
      throw new TypeError("C-program atom evidence event kind is not admitted");
    }
    assertAtomEventScope(
      event,
      requestEventScope(input.request, input.graphEdge)
    );
    if (
      event.kind === "payload_observed" &&
      event.sourceEventRef !== input.request.cCallRef
    ) {
      throw new TypeError(
        "C-program atom payload observation differs from its C-call"
      );
    }
    return event;
  });
  assertAtomEvidenceOrder(events);
  return Object.freeze(events);
}

function assertSubmissionEvidence(input: {
  readonly request: CProgramAtomRequest;
  readonly result: CProgramAtomResult;
  readonly target: AdmittedInvocationCarrier | null;
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
  readonly closeBasis: CProgramAtomCloseBasis | null;
}): void {
  const observed = input.evidenceEvents.filter(
    (event) => event.kind === "payload_observed"
  );
  const validated = input.evidenceEvents.filter(
    (event) => event.kind === "payload_validated"
  );
  if (input.result.status === "completed") {
    if (input.target === null || input.closeBasis === null) {
      throw new TypeError(
        "completed C-program atom requires one target and close basis"
      );
    }
    assertCompletedEvidenceChain({
      label: "completed C-program atom",
      payloadRef: input.target.carrierRef,
      schemaRef: input.target.schemaRef,
      resultContractRef: input.closeBasis.resultContractRef,
      closeEvidenceRefs: input.closeBasis.evidenceRefs,
      supplementaryCloseRefs: Object.freeze([
        ...input.result.evidenceRefs,
        ...input.result.sourceEventRefs
      ]),
      evidenceEvents: input.evidenceEvents
    });
    return;
  }
  if (observed.length > 0 || validated.length > 0) {
    throw new TypeError(
      "non-completed C-program atom cannot carry target evidence"
    );
  }
  if (input.closeBasis !== null) {
    throw new TypeError(
      "non-completed C-program atom cannot carry a target close basis"
    );
  }
}

function admitAtomSubmission(input: {
  readonly request: CProgramAtomRequest;
  readonly graphEdge: string;
  readonly raw: unknown;
}): CProgramAtomInvocationSubmission {
  const detached = detachRowSnapshot(input.raw);
  if (
    !isPlainRecord(detached) ||
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...ATOM_SUBMISSION_KEYS].sort()
    ) ||
    detached["kind"] !== "c_program_atom_invocation_submission"
  ) {
    throw new TypeError("C-program atom submission is not canonical");
  }
  const result = admitAtomResult({
    request: input.request,
    raw: detached["result"]
  });
  const admittedTargetCarrier = admitTargetCarrier(
    detached["admittedTargetCarrier"]
  );
  const interiorEvents = admitAtomInteriorEvents({
    request: input.request,
    graphEdge: input.graphEdge,
    raw: detached["interiorEvents"]
  });
  const evidenceEvents = admitAtomEvidenceEvents({
    request: input.request,
    graphEdge: input.graphEdge,
    raw: detached["evidenceEvents"]
  });
  const closeBasis = admitAtomCloseBasis(detached["closeBasis"]);
  assertAtomInteriorCausality({
    events: interiorEvents,
    requireFpLifecycle:
      result.status === "completed" &&
      input.request.kind === "c_program_stage_atom_request" &&
      input.request.fibre === "F_P"
  });
  if (result.status === "completed") {
    if (
      admittedTargetCarrier === null ||
      closeBasis === null ||
      admittedTargetCarrier.carrierRef !== result.outputPayloadRef ||
      admittedTargetCarrier.admissionRef !== result.outputLineageRef
    ) {
      throw new TypeError(
        "completed C-program atom submission lacks its exact target carrier"
      );
    }
  } else if (admittedTargetCarrier !== null) {
    throw new TypeError(
      "non-completed C-program atom submission cannot carry a target"
    );
  }
  assertSubmissionEvidence({
    request: input.request,
    result,
    target: admittedTargetCarrier,
    evidenceEvents,
    closeBasis
  });
  return Object.freeze({
    kind: "c_program_atom_invocation_submission" as const,
    result,
    admittedTargetCarrier,
    interiorEvents,
    evidenceEvents,
    closeBasis
  });
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
  readonly targetCarrierContentDigest: string | null;
  readonly judgment: CCallJudgment;
  readonly retryPolicyRef: string | null;
  readonly retryPolicyDigest: `sha256:${string}` | null;
  readonly retryOwnerNodeRef: string | null;
  readonly runtimeEvents: readonly RuntimeEvent[];
}): CProgramAtomReceipt {
  input.runtimeEvents.forEach(assertRuntimeEvent);
  const observedTargetIdentityDigests = input.runtimeEvents.flatMap((event) =>
    event.kind === "payload_observed" ? [event.digest] : []
  );
  const targetPayloadIdentityDigest = input.result.status === "completed" &&
      observedTargetIdentityDigests.length === 1
    ? observedTargetIdentityDigests[0]!
    : null;
  const basis = Object.freeze({
    ...input.result,
    kind: "c_program_atom_receipt" as const,
    planDigest: input.request.planDigest,
    nodeDigest: input.request.nodeDigest,
    cursorDigest: input.request.cursorDigest,
    inputPayloadRef: input.request.inputPayloadRef,
    inputLineageRef: input.request.inputLineageRef,
    targetCarrierContentDigest: input.targetCarrierContentDigest,
    targetPayloadIdentityDigest,
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
    selected.cursorDigest !== input.request.cursorDigest ||
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
    edge: input.context.graphEdge,
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
  readonly closeBasis: CProgramAtomCloseBasis | null;
}): readonly RuntimeEvent[] {
  const closeBasis = input.closeBasis;
  if (
    closeBasis !== null &&
    (closeBasis.kind !== "c_program_atom_close_basis" ||
      closeBasis.evidenceClass.length === 0 ||
      closeBasis.evidenceRefs.length === 0 ||
      closeBasis.evidenceRefs.some((ref) => ref.length === 0) ||
      new Set(closeBasis.evidenceRefs).size !== closeBasis.evidenceRefs.length ||
      closeBasis.resultContractRef.length === 0)
  ) {
    throw new TypeError("C-program atom close basis differs from admitted result");
  }
  return buildCCallSpineClose({
    cCallRef: input.request.cCallRef,
    basisId: input.request.parentBasisId,
    evidenceClass: closeBasis?.evidenceClass ?? (
      input.request.kind === "c_program_workflow_atom_request"
        ? "sub_traversal"
        : "c_program_atom"
    ),
    evidenceRefs: closeBasis?.evidenceRefs ?? Object.freeze([
        ...input.result.evidenceRefs,
        ...input.result.sourceEventRefs
      ]),
    outcomeStatus: input.result.failureClass ?? input.result.status,
    payloadRef: input.result.outputPayloadRef,
    responseContractRef:
      closeBasis?.resultContractRef ?? input.result.responseContractRef,
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
    judgment,
    closeBasis: input.pending.closeBasis
  });
  const receipt = sealAtomReceipt({
    context: input.context,
    request: input.pending.request,
    result: input.pending.result,
    targetCarrierContentDigest: null,
    judgment,
    retryPolicyRef: coordinated?.policyRef ?? null,
    retryPolicyDigest: coordinated?.policyDigest ?? null,
    retryOwnerNodeRef: input.pending.retryOwnerNodeRef,
    runtimeEvents: Object.freeze([
      ...input.pending.openEvents,
      ...input.pending.interiorEvents,
      ...input.pending.evidenceEvents,
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
    replay: causalReplayBasis({
      context: input.context,
      node: input.node,
      retryPath: input.retryPath
    })
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
  let submission: CProgramAtomInvocationSubmission;
  try {
    submission = admitAtomSubmission({
      request,
      graphEdge: input.context.graphEdge,
      raw: await input.context.invocation.invokeAdmittedAtom(request)
    });
    } catch (error: unknown) {
    submission = Object.freeze({
      kind: "c_program_atom_invocation_submission" as const,
      result: synthesizedAtomFailure({ request, error }),
      admittedTargetCarrier: null,
      interiorEvents: Object.freeze([]),
      evidenceEvents: Object.freeze([]),
      closeBasis: null
    });
  }
  const result = submission.result;
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
        interiorEvents: submission.interiorEvents,
        evidenceEvents: submission.evidenceEvents,
        closeBasis: submission.closeBasis,
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
  const closeEvents = closeLeaf({
    request,
    result,
    judgment,
    closeBasis: submission.closeBasis
  });
  const receipt = sealAtomReceipt({
    context: input.context,
    request,
    result,
    targetCarrierContentDigest:
      submission.admittedTargetCarrier?.carrierDigest ?? null,
    judgment,
    retryPolicyRef: null,
    retryPolicyDigest: null,
    retryOwnerNodeRef: null,
    runtimeEvents: Object.freeze([
      ...spine.events,
      ...submission.interiorEvents,
      ...submission.evidenceEvents,
      ...closeEvents
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
  const refs = new Set(
    compiledCSubtreeNodesInDeclaredOrder(input.node).map(
      (row) => row.node.nodeRef
    )
  );
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
  const validated = validateInvocation(input);
  const admitted: CProgramReplayReceipt[] = [];
  const context: ExecutionContext = Object.freeze({
    invocation: input,
    selected: validated.selected,
    graphEdge: validated.graphEdge,
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
