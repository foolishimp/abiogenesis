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
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  RUNTIME_FAILURE_CLASS_VALUES,
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
  deriveCRetryAttemptDecision
} from "./c_retry_runtime.js";

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
  readonly evidenceRefs: readonly string[];
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
  readonly replayReceipts: readonly CProgramAtomReceipt[];
  readonly invokeAdmittedAtom: (
    request: CProgramAtomRequest
  ) => Promise<CProgramAtomResult>;
  readonly projectBatch: (
    request: CProgramBatchProjectionRequest
  ) => Promise<CProgramBatchProjectionResult>;
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
  readonly replayReceipts: readonly CProgramAtomReceipt[];
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
}

interface ExecutionContext {
  readonly invocation: CProgramInterpreterInvocation;
  readonly selected: CatalogExecutionBinding;
  readonly replay: readonly CProgramAtomReceipt[];
  readonly admitted: CProgramAtomReceipt[];
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
  "retryPath"
]);

const BATCH_PROJECTION_KEYS = Object.freeze([
  "kind",
  "planRef",
  "nodeRef",
  "batchRef",
  "outputCarrierRef",
  "outputPayloadRef",
  "outputLineageRef",
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
  readonly replay: readonly CProgramAtomReceipt[];
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
  if (status === "completed") {
    if (
      receipt.outputPayloadRef === null ||
      receipt.responseContractRef !== receipt.outputCarrierRef ||
      receipt.outputLineageRef === null ||
      receipt.reasonRef !== null ||
      admittedFailureClass !== null
    ) {
      throw new TypeError("completed C-program replay receipt is not exact");
    }
  } else if (
    receipt.outputPayloadRef !== null ||
    receipt.responseContractRef !== null ||
    receipt.outputLineageRef !== null ||
    receipt.reasonRef === null ||
    (status === "runtime_failed") !== (admittedFailureClass !== null)
  ) {
    throw new TypeError("non-completed C-program replay receipt is not exact");
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
  const receiptIdentities = new Set<string>();
  for (const receipt of input.replayReceipts) {
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
    const identity = stableSha256Digest({
      nodeRef: receipt.nodeRef,
      inputPayloadRef: receipt.inputPayloadRef,
      inputLineageRef: receipt.inputLineageRef,
      taskOrdinal: receipt.taskOrdinal,
      retryPath: receipt.retryPath
    });
    if (receiptIdentities.has(identity)) {
      throw new TypeError("C-program replay contains a duplicate atom locus");
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
}): CProgramAtomRequestBasis {
  const plan = input.context.invocation.plan;
  return Object.freeze({
    planRef: plan.planRef,
    planDigest: plan.planDigest,
    nodeRef: input.node.nodeRef,
    nodeDigest: input.node.nodeDigest,
    cursorRef: input.cursor.cursorRef,
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
}): CProgramAtomReceipt {
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
  const basis = Object.freeze({
    ...result,
    kind: "c_program_atom_receipt" as const,
    planDigest: input.request.planDigest,
    nodeDigest: input.request.nodeDigest,
    inputPayloadRef: input.request.inputPayloadRef,
    inputLineageRef: input.request.inputLineageRef,
    taskOrdinal: input.request.taskOrdinal,
    retryAttempt: input.request.retryAttempt,
    retryPath: input.request.retryPath
  });
  const receiptDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    receiptRef: `abg://c-program-receipt/${receiptDigest.slice("sha256:".length)}`,
    receiptDigest
  });
}

function replayReceipt(input: {
  readonly context: ExecutionContext;
  readonly request: CProgramAtomRequest;
}): CProgramAtomReceipt | null {
  const locusRows = input.context.replay.filter(
    (row) =>
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
    evidenceRefs: input.receipt.evidenceRefs
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
  const request = atomRequest({
    ...input,
    cursor: currentCursor
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
  let receipt: CProgramAtomReceipt;
  try {
    receipt = admitAtomResult({
      request,
      raw: await input.context.invocation.invokeAdmittedAtom(request)
    });
  } catch (error: unknown) {
    return Object.freeze({
      status: "runtime_failed" as const,
      outputCarrierRef: input.node.outputCarrierRef,
      outputPayloadRef: null,
      outputLineageRef: null,
      resultCarrierRef: null,
      resultPayloadRef: null,
      reasonRef: `abg://c-program/atom-failure/${stableSha256Digest({
        nodeRef: input.node.nodeRef,
        cursorRef: currentCursor.cursorRef,
        error: error instanceof Error ? error.message : String(error)
      }).slice("sha256:".length)}`,
      failureClass: "contract_failure" as const,
      evidenceRefs: Object.freeze([])
    });
  }
  input.context.admitted.push(receipt);
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
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])])
  });
}

function admitBatchProjection(input: {
  readonly request: CProgramBatchProjectionRequest;
  readonly raw: unknown;
}): CProgramBatchProjectionResult {
  const detached = detachRowSnapshot(input.raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("C-program batch projection must be detached plain data");
  }
  if (
    !stableJsonEquals(
      Object.keys(detached).sort(),
      [...BATCH_PROJECTION_KEYS].sort()
    ) ||
    detached["kind"] !== "c_program_batch_projection_result"
  ) {
    throw new TypeError("C-program batch projection shape is invalid");
  }
  const result: CProgramBatchProjectionResult = Object.freeze({
    kind: "c_program_batch_projection_result" as const,
    planRef: nonEmpty(detached["planRef"], "planRef"),
    nodeRef: nonEmpty(detached["nodeRef"], "nodeRef"),
    batchRef: nonEmpty(detached["batchRef"], "batchRef"),
    outputCarrierRef: nonEmpty(
      detached["outputCarrierRef"],
      "outputCarrierRef"
    ),
    outputPayloadRef: nonEmpty(
      detached["outputPayloadRef"],
      "outputPayloadRef"
    ),
    outputLineageRef: nonEmpty(
      detached["outputLineageRef"],
      "outputLineageRef"
    ),
    evidenceRefs: stringArray(detached["evidenceRefs"], "evidenceRefs")
  });
  if (
    result.planRef !== input.request.planRef ||
    result.nodeRef !== input.request.nodeRef ||
    result.batchRef !== input.request.batchRef ||
    result.outputCarrierRef !== input.request.outputCarrierRef
  ) {
    throw new TypeError("C-program batch projection identity differs");
  }
  return result;
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
      return Object.freeze({
        taskRef: task.taskRef,
        ordinal: task.ordinal,
        taskOrdinal: task.taskOrdinal,
        outputPayloadRef: value.outputPayloadRef,
        outputLineageRef: value.outputLineageRef,
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
  try {
    const projection = admitBatchProjection({
      request,
      raw: await input.context.invocation.projectBatch(request)
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
          ? projection.outputPayloadRef
          : null,
      reasonRef: null,
      failureClass: null,
      evidenceRefs: projection.evidenceRefs
    });
  } catch (error: unknown) {
    return stopped({
      node: input.node,
      status: "runtime_failed",
      failureClass: "contract_failure",
      reasonRef: `abg://c-program/batch-projection-failure/${stableSha256Digest({
        nodeRef: input.node.nodeRef,
        error: error instanceof Error ? error.message : String(error)
      }).slice("sha256:".length)}`
    });
  }
}

function subtreeReceipts(input: {
  readonly node: CompiledCPlanNode;
  readonly receipts: readonly CProgramAtomReceipt[];
  readonly retryPath: readonly number[];
}): readonly CProgramAtomReceipt[] {
  const refs = new Set(planNodes(input.node).map((node) => node.nodeRef));
  return Object.freeze(
    input.receipts.filter(
      (receipt) =>
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
    const replayedAttempt = before.length > 0;
    const decision = deriveCRetryAttemptDecision({
      disposition: "runtime_failed",
      failureClass: outcome.failureClass,
      failureSignalRef: outcome.reasonRef,
      attempt,
      maxAttempts: input.node.maxAttempts,
      priorFailureClass,
      priorFailureSignalRef
    });
    if (decision.judgment !== "retry") return outcome;
    if (replayedAttempt && before.every((row) => row.status === "completed")) {
      throw new TypeError("C.retry replay contradicts its failed attempt outcome");
    }
    priorFailureClass = outcome.failureClass;
    priorFailureSignalRef = outcome.reasonRef;
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
    evidenceRefs: Object.freeze(evidenceRefs)
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
        evidenceRefs: Object.freeze([])
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
  const admitted: CProgramAtomReceipt[] = [];
  const context: ExecutionContext = Object.freeze({
    invocation: input,
    selected,
    replay: Object.freeze([...input.replayReceipts]),
    admitted,
    consumedReplayRefs: new Set<string>()
  });
  const resolution = await executeNode({
    context,
    node: input.plan.root,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    taskOrdinal: null,
    retryAttempt: 1,
    retryPath: Object.freeze([])
  });
  const unconsumedReplayRefs = input.replayReceipts
    .filter((receipt) => !context.consumedReplayRefs.has(receipt.receiptRef))
    .map((receipt) => receipt.receiptRef);
  if (unconsumedReplayRefs.length > 0) {
    throw new TypeError(
      `C-program replay contains receipts outside the current execution path: ${JSON.stringify(unconsumedReplayRefs)}`
    );
  }
  const receipts = Object.freeze([...input.replayReceipts, ...admitted]);
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
      replayReceipts: receipts
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
    replayReceipts: receipts
  });
}
