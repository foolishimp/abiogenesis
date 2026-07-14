// Implements: T-260; REQ-L-GTL3-C-ALGEBRA-007;
// REQ-L-GTL3-HOF-009/-010/-012. One serial resolver owns direct and
// HOF-projected C.batch task truth; adapters return evidence only.

import type {
  CCallJudgment,
  RuntimeEvent
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
  assertCompiledCBatchPlan,
  compileDeclaredCBatchPlan,
  compileHofCBatchPlan,
  constructHofOutputVector,
  type CompiledCBatchPlan,
  type CBatchTask,
  type HofOutputVector,
  type HofVectorCarrier
} from "../contracts/c_batch.js";
import {
  compileHofFanOutBinding,
  type CompiledHofFanOutBinding,
  type ExecutionHandoffCarrier
} from "../contracts/hof_batch.js";
import type {
  CompiledHofFanOutRelation
} from "../contracts/hof_relation_compiler.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  buildCCallSpineClose,
  buildCCallSpineOpen
} from "./c_call_spine.js";
import {
  resolveSelectedCatalogExecutionBinding
} from "./selected_catalog_execution.js";

export type CBatchTaskDisposition = "completed" | "blocked" | "held";

interface CBatchTaskRequestBasis {
  readonly planRef: string;
  readonly batchRef: string;
  readonly taskRef: string;
  readonly cCallRef: string;
  readonly ordinal: number;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionGraphFunctionRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly stageRole: string;
  readonly resultBearing: boolean;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}

export interface CBatchStageExecutionRequest extends CBatchTaskRequestBasis {
  readonly kind: "c_batch_stage_execution_request";
}

export interface CBatchChildTraversalRequest extends CBatchTaskRequestBasis {
  readonly kind: "c_batch_child_traversal_request";
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
}

export type CBatchTaskExecutionRequest =
  | CBatchStageExecutionRequest
  | CBatchChildTraversalRequest;

interface CBatchTaskOutcomeBasis {
  readonly planRef: string;
  readonly taskRef: string;
  readonly cCallRef: string;
  readonly ordinal: number;
  readonly disposition: CBatchTaskDisposition;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly terminalRef: string;
  readonly reasonRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface CBatchStageExecutionOutcome extends CBatchTaskOutcomeBasis {
  readonly kind: "c_batch_stage_execution_outcome";
}

export interface CBatchChildTraversalOutcome extends CBatchTaskOutcomeBasis {
  readonly kind: "c_batch_child_traversal_outcome";
  readonly childGraphFunctionRef: string;
  readonly childBasisId: string;
  readonly childRunRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
}

export type CBatchTaskExecutionOutcome =
  | CBatchStageExecutionOutcome
  | CBatchChildTraversalOutcome;

export interface DeclaredCBatchSourceAuthority {
  readonly kind: "declared_batch_source_authority";
  readonly executionHandoff: ExecutionHandoffCarrier;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}

export interface HofCBatchSourceAuthority {
  readonly kind: "hof_projection_source_authority";
  readonly relation: CompiledHofFanOutRelation;
  readonly binding: CompiledHofFanOutBinding;
  readonly childExecutionHandoff: ExecutionHandoffCarrier;
  readonly inputVector: HofVectorCarrier;
}

export type CBatchSourceAuthority =
  | DeclaredCBatchSourceAuthority
  | HofCBatchSourceAuthority;

export interface CBatchInvocation {
  readonly kind: "c_batch_invocation";
  readonly plan: CompiledCBatchPlan;
  readonly sourceAuthority: CBatchSourceAuthority;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly attempt: number;
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly executeTask: (
    request: CBatchTaskExecutionRequest
  ) => Promise<CBatchTaskExecutionOutcome>;
}

interface CBatchResolutionBasis {
  readonly planRef: string;
  readonly batchRef: string;
  readonly completedTasks: readonly CBatchTaskExecutionOutcome[];
  readonly emittedEvents: readonly RuntimeEvent[];
}

export interface CBatchCompletedResolution extends CBatchResolutionBasis {
  readonly kind: "c_batch_completed_resolution";
  readonly status: "completed";
  readonly sourceKind: "declared_batch";
}

export interface HofCBatchCompletedResolution extends CBatchResolutionBasis {
  readonly kind: "hof_c_batch_completed_resolution";
  readonly status: "completed";
  readonly sourceKind: "hof_projection";
  readonly outputVector: HofOutputVector;
}

export interface CBatchBlockedResolution extends CBatchResolutionBasis {
  readonly kind: "c_batch_blocked_resolution";
  readonly status: "blocked" | "pending" | "runtime_failed";
  readonly sourceKind: "declared_batch" | "hof_projection";
  readonly stoppingOrdinal: number;
  readonly stoppingTaskRef: string;
  readonly stoppingOutcome: CBatchTaskExecutionOutcome | null;
  readonly reasonRef: string;
  readonly unstartedTaskRefs: readonly string[];
  readonly inputVectorRef: string | null;
  readonly inputVectorDigest: `sha256:${string}` | null;
}

export type CBatchResolution =
  | CBatchCompletedResolution
  | HofCBatchCompletedResolution
  | CBatchBlockedResolution;

export type CBatchCoordinationDisposition =
  | "completed"
  | "blocked"
  | "held"
  | "runtime_failed";

export interface CBatchCoordinationItem {
  readonly taskRef: string;
  readonly ordinal: number;
}

export interface CBatchCoordinationStep<Value> {
  readonly disposition: CBatchCoordinationDisposition;
  readonly value: Value | null;
  readonly reasonRef: string | null;
}

export interface CBatchCoordinationResult<Task, Value> {
  readonly status: CBatchCoordinationDisposition;
  readonly completed: readonly {
    readonly task: Task;
    readonly value: Value;
  }[];
  readonly stoppingTask: Task | null;
  readonly stoppingValue: Value | null;
  readonly reasonRef: string | null;
}

export async function coordinateCBatchTaskFamily<
  Task extends CBatchCoordinationItem,
  Value
>(input: {
  readonly tasks: readonly Task[];
  readonly execute: (task: Task) => Promise<CBatchCoordinationStep<Value>>;
}): Promise<CBatchCoordinationResult<Task, Value>> {
  if (input.tasks.length === 0) {
    throw new TypeError("C.batch coordinator requires a non-empty task family");
  }
  const refs = new Set<string>();
  const completed: { task: Task; value: Value }[] = [];
  for (const [ordinal, task] of input.tasks.entries()) {
    if (task.ordinal !== ordinal || refs.has(task.taskRef)) {
      throw new TypeError(
        "C.batch coordinator requires stable ordinals and unique task refs"
      );
    }
    refs.add(task.taskRef);
    const step = await input.execute(task);
    if (step.disposition === "completed") {
      if (step.value === null || step.reasonRef !== null) {
        throw new TypeError("completed C.batch coordination step is not exact");
      }
      completed.push({ task, value: step.value });
      continue;
    }
    if (step.reasonRef === null) {
      throw new TypeError("stopped C.batch coordination step requires a reason");
    }
    return Object.freeze({
      status: step.disposition,
      completed: Object.freeze([...completed]),
      stoppingTask: task,
      stoppingValue: step.value,
      reasonRef: step.reasonRef
    });
  }
  return Object.freeze({
    status: "completed" as const,
    completed: Object.freeze([...completed]),
    stoppingTask: null,
    stoppingValue: null,
    reasonRef: null
  });
}

const STAGE_OUTCOME_KEYS = Object.freeze([
  "kind",
  "planRef",
  "taskRef",
  "cCallRef",
  "ordinal",
  "disposition",
  "outputCarrierRef",
  "outputPayloadRef",
  "responseContractRef",
  "terminalRef",
  "reasonRef",
  "evidenceRefs"
]);

const CHILD_OUTCOME_KEYS = Object.freeze([
  ...STAGE_OUTCOME_KEYS,
  "childGraphFunctionRef",
  "childBasisId",
  "childRunRef",
  "childGraphCallId",
  "childFrameId"
]);

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return nonEmpty(value, label);
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
  return value;
}

function disposition(value: unknown): CBatchTaskDisposition {
  if (value === "completed" || value === "blocked" || value === "held") {
    return value;
  }
  throw new TypeError("C.batch task disposition is invalid");
}

function evidenceRefs(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError("C.batch task outcome requires non-empty evidence refs");
  }
  return Object.freeze(
    value.map((entry: unknown) => nonEmpty(entry, "evidenceRefs[]"))
  );
}

function outcomeBasis(
  row: Readonly<Record<string, unknown>>
): CBatchTaskOutcomeBasis {
  const ordinal = nonNegativeInteger(
    row["ordinal"],
    "C.batch task outcome ordinal"
  );
  return Object.freeze({
    planRef: nonEmpty(row["planRef"], "planRef"),
    taskRef: nonEmpty(row["taskRef"], "taskRef"),
    cCallRef: nonEmpty(row["cCallRef"], "cCallRef"),
    ordinal,
    disposition: disposition(row["disposition"]),
    outputCarrierRef: nonEmpty(row["outputCarrierRef"], "outputCarrierRef"),
    outputPayloadRef: nullableString(row["outputPayloadRef"], "outputPayloadRef"),
    responseContractRef: nullableString(
      row["responseContractRef"],
      "responseContractRef"
    ),
    terminalRef: nonEmpty(row["terminalRef"], "terminalRef"),
    reasonRef: nullableString(row["reasonRef"], "reasonRef"),
    evidenceRefs: evidenceRefs(row["evidenceRefs"])
  });
}

function assertOutcomeSemantics(input: {
  readonly request: CBatchTaskExecutionRequest;
  readonly outcome: CBatchTaskExecutionOutcome;
}): void {
  const { request, outcome } = input;
  if (
    outcome.planRef !== request.planRef ||
    outcome.taskRef !== request.taskRef ||
    outcome.cCallRef !== request.cCallRef ||
    outcome.ordinal !== request.ordinal ||
    outcome.outputCarrierRef !== request.outputCarrierRef
  ) {
    throw new TypeError("C.batch task outcome identity or carrier differs");
  }
  if (request.kind === "c_batch_stage_execution_request") {
    if (outcome.kind !== "c_batch_stage_execution_outcome") {
      throw new TypeError("C.batch stage request requires a stage outcome");
    }
  } else {
    if (
      outcome.kind !== "c_batch_child_traversal_outcome" ||
      outcome.childGraphFunctionRef !== request.childGraphFunctionRef ||
      outcome.childGraphCallId === request.parentGraphCallId ||
      outcome.childFrameId === request.parentFrameId
    ) {
      throw new TypeError("C.batch child traversal outcome identity is invalid");
    }
  }
  if (outcome.disposition === "completed") {
    const resultTruthExact = request.resultBearing
      ? outcome.outputPayloadRef !== null &&
        outcome.responseContractRef === request.outputCarrierRef
      : outcome.outputPayloadRef === null &&
        outcome.responseContractRef === null;
    if (!resultTruthExact || outcome.reasonRef !== null) {
      throw new TypeError(
        "completed C.batch task must preserve its declared result cardinality"
      );
    }
  } else if (
    outcome.outputPayloadRef !== null ||
    outcome.responseContractRef !== null ||
    outcome.reasonRef === null
  ) {
    throw new TypeError(
      "non-completed C.batch task requires a reason and no result carrier"
    );
  }
}

function admitTaskOutcome(input: {
  readonly request: CBatchTaskExecutionRequest;
  readonly raw: unknown;
}): CBatchTaskExecutionOutcome {
  const detached = detachRowSnapshot(input.raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("C.batch task outcome must be detached plain data");
  }
  const expectedKeys = input.request.kind === "c_batch_stage_execution_request"
    ? STAGE_OUTCOME_KEYS
    : CHILD_OUTCOME_KEYS;
  if (!stableJsonEquals(Object.keys(detached).sort(), [...expectedKeys].sort())) {
    throw new TypeError("C.batch task outcome has a non-canonical key set");
  }
  const basis = outcomeBasis(detached);
  let outcome: CBatchTaskExecutionOutcome;
  if (input.request.kind === "c_batch_stage_execution_request") {
    if (detached["kind"] !== "c_batch_stage_execution_outcome") {
      throw new TypeError("C.batch stage outcome kind is invalid");
    }
    outcome = Object.freeze({
      kind: "c_batch_stage_execution_outcome" as const,
      ...basis
    });
  } else {
    if (detached["kind"] !== "c_batch_child_traversal_outcome") {
      throw new TypeError("C.batch child outcome kind is invalid");
    }
    outcome = Object.freeze({
      kind: "c_batch_child_traversal_outcome" as const,
      ...basis,
      childGraphFunctionRef: nonEmpty(
        detached["childGraphFunctionRef"],
        "childGraphFunctionRef"
      ),
      childBasisId: nonEmpty(detached["childBasisId"], "childBasisId"),
      childRunRef: nonEmpty(detached["childRunRef"], "childRunRef"),
      childGraphCallId: nonEmpty(
        detached["childGraphCallId"],
        "childGraphCallId"
      ),
      childFrameId: nonEmpty(detached["childFrameId"], "childFrameId")
    });
  }
  assertOutcomeSemantics({ request: input.request, outcome });
  return outcome;
}

function selectedAuthority(input: CBatchInvocation): CatalogExecutionBinding {
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "C.batch"
  });
  if (
    selected.entryRef !== input.plan.selectedCatalogEntryRef ||
    selected.moduleName !== input.plan.moduleName ||
    selected.moduleDigest !== input.plan.moduleDigest ||
    selected.graphFunction.id !== input.plan.executionGraphFunctionRef
  ) {
    throw new TypeError("C.batch invocation does not preserve its compiled catalog authority");
  }
  return selected;
}

function rederivePlan(input: {
  readonly invocation: CBatchInvocation;
  readonly selected: CatalogExecutionBinding;
}): void {
  const { invocation, selected } = input;
  let expected: CompiledCBatchPlan;
  if (invocation.sourceAuthority.kind === "hof_projection_source_authority") {
    const source = invocation.sourceAuthority;
    const binding = compileHofFanOutBinding({
      module: selected.module,
      relation: source.relation,
      childExecutionHandoff: source.childExecutionHandoff
    });
    if (!stableJsonEquals(binding, source.binding)) {
      throw new TypeError("C.batch HOF source binding no longer rederives exactly");
    }
    expected = compileHofCBatchPlan({
      binding,
      selectedCatalogBinding: selected,
      inputVector: source.inputVector
    });
  } else {
    const source = invocation.sourceAuthority;
    expected = compileDeclaredCBatchPlan({
      executionHandoff: source.executionHandoff,
      selectedCatalogBinding: selected,
      inputPayloadRef: source.inputPayloadRef,
      inputLineageRef: source.inputLineageRef
    });
  }
  if (!stableJsonEquals(expected, invocation.plan)) {
    throw new TypeError("C.batch plan differs from current source authority");
  }
}

function validateInvocation(input: CBatchInvocation): CatalogExecutionBinding {
  if (input.kind !== "c_batch_invocation") {
    throw new TypeError("C.batch invocation kind is invalid");
  }
  assertCompiledCBatchPlan(input.plan);
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.edge, "edge");
  if (
    input.parentGraphFunctionRef !== input.plan.executionGraphFunctionRef ||
    !Number.isInteger(input.vectorIndex) ||
    input.vectorIndex < 0 ||
    !Number.isInteger(input.attempt) ||
    input.attempt < 1
  ) {
    throw new TypeError("C.batch invocation locus is invalid");
  }
  if (
    (input.plan.sourceKind === "hof_projection") !==
      (input.sourceAuthority.kind === "hof_projection_source_authority")
  ) {
    throw new TypeError("C.batch source authority variant is invalid");
  }
  const selected = selectedAuthority(input);
  rederivePlan({ invocation: input, selected });
  return selected;
}

function requestForTask(input: {
  readonly invocation: CBatchInvocation;
  readonly selected: CatalogExecutionBinding;
  readonly task: CBatchTask;
  readonly cCallRef: string;
}): CBatchTaskExecutionRequest {
  const basis: CBatchTaskRequestBasis = Object.freeze({
    planRef: input.invocation.plan.planRef,
    batchRef: input.invocation.plan.batchRef,
    taskRef: input.task.taskRef,
    cCallRef: input.cCallRef,
    ordinal: input.task.ordinal,
    selectedCatalogEntryRef: input.selected.entryRef,
    moduleName: input.selected.moduleName,
    moduleDigest: input.invocation.plan.moduleDigest,
    executionGraphFunctionRef: input.invocation.plan.executionGraphFunctionRef,
    parentBasisId: input.invocation.parentBasisId,
    parentGraphCallId: input.invocation.parentGraphCallId,
    parentFrameId: input.invocation.parentFrameId,
    stageRole: input.task.stageRole,
    resultBearing: input.task.resultBearing,
    inputCarrierRef: input.task.inputCarrierRef,
    outputCarrierRef: input.task.outputCarrierRef,
    inputPayloadRef: input.task.inputPayloadRef,
    inputLineageRef: input.task.inputLineageRef
  });
  if (input.task.kind === "declared_c_batch_stage_task") {
    return Object.freeze({
      kind: "c_batch_stage_execution_request" as const,
      ...basis
    });
  }
  return Object.freeze({
    kind: "c_batch_child_traversal_request" as const,
    ...basis,
    childGraphFunctionRef: input.task.childGraphFunctionRef,
    childGraphFunctionDigest: input.task.childGraphFunctionDigest
  });
}

function runtimeFailureReason(input: {
  readonly planRef: string;
  readonly taskRef: string;
  readonly error: unknown;
}): string {
  return `abg://c-batch/runtime-failure/${stableSha256Digest({
    planRef: input.planRef,
    taskRef: input.taskRef,
    message: input.error instanceof Error ? input.error.message : String(input.error)
  }).slice("sha256:".length)}`;
}

function blockedResolution(input: {
  readonly invocation: CBatchInvocation;
  readonly completedTasks: readonly CBatchTaskExecutionOutcome[];
  readonly stoppingTask: CBatchTask;
  readonly stoppingOutcome: CBatchTaskExecutionOutcome | null;
  readonly status: "blocked" | "pending" | "runtime_failed";
  readonly reasonRef: string;
  readonly emittedEvents: readonly RuntimeEvent[];
}): CBatchBlockedResolution {
  return Object.freeze({
    kind: "c_batch_blocked_resolution" as const,
    status: input.status,
    sourceKind: input.invocation.plan.sourceKind,
    planRef: input.invocation.plan.planRef,
    batchRef: input.invocation.plan.batchRef,
    completedTasks: Object.freeze([...input.completedTasks]),
    stoppingOrdinal: input.stoppingTask.ordinal,
    stoppingTaskRef: input.stoppingTask.taskRef,
    stoppingOutcome: input.stoppingOutcome,
    reasonRef: input.reasonRef,
    unstartedTaskRefs: Object.freeze(
      input.invocation.plan.tasks
        .slice(input.stoppingTask.ordinal + 1)
        .map((task) => task.taskRef)
    ),
    inputVectorRef: input.invocation.plan.inputVectorRef,
    inputVectorDigest: input.invocation.plan.inputVectorDigest,
    emittedEvents: Object.freeze([...input.emittedEvents])
  });
}

export async function resolveCBatch(
  input: CBatchInvocation
): Promise<CBatchResolution> {
  const selected = validateInvocation(input);
  const emittedEvents: RuntimeEvent[] = [];
  const outputPayloadRefs = new Set<string>();
  const coordination = await coordinateCBatchTaskFamily({
    tasks: input.plan.tasks,
    execute: async (task): Promise<CBatchCoordinationStep<CBatchTaskExecutionOutcome>> => {
      const spine = buildCCallSpineOpen({
        basisId: input.parentBasisId,
        graphFunctionId: input.parentGraphFunctionRef,
        graphCallId: input.parentGraphCallId,
        frameId: input.parentFrameId,
        edge: input.edge,
        vectorIndex: input.vectorIndex,
        stageRole: task.stageRole,
        taskOrdinal: task.ordinal,
        attempt: input.attempt,
        batchRef: input.plan.batchRef,
        regime: task.regime,
        armId: task.armId,
        programRef: input.plan.programRef,
        compositionRef: input.plan.compositionRef
      });
      emittedEvents.push(...spine.events);
      input.emit(spine.events);
      const request = requestForTask({
        invocation: input,
        selected,
        task,
        cCallRef: spine.cCallRef
      });
      let outcome: CBatchTaskExecutionOutcome;
      try {
        outcome = admitTaskOutcome({
          request,
          raw: await input.executeTask(request)
        });
        if (
          input.plan.sourceKind === "hof_projection" &&
          outcome.disposition === "completed" &&
          outcome.outputPayloadRef !== null &&
          outputPayloadRefs.has(outcome.outputPayloadRef)
        ) {
          throw new TypeError(
            "C.batch completed task payload identities must be unique"
          );
        }
      } catch (error: unknown) {
        const reasonRef = runtimeFailureReason({
          planRef: input.plan.planRef,
          taskRef: task.taskRef,
          error
        });
        const tail = buildCCallSpineClose({
          cCallRef: spine.cCallRef,
          basisId: input.parentBasisId,
          evidenceClass: "fibre_failure",
          evidenceRefs: Object.freeze([reasonRef]),
          outcomeStatus: "runtime_failed",
          payloadRef: null,
          responseContractRef: null,
          judgment: "blocked",
          reasonRef
        });
        emittedEvents.push(...tail);
        input.emit(tail);
        return Object.freeze({
          disposition: "runtime_failed" as const,
          value: null,
          reasonRef
        });
      }

      const judgment: CCallJudgment = outcome.disposition === "completed"
        ? "advance"
        : outcome.disposition === "held"
          ? "pending"
          : "blocked";
      const tail = buildCCallSpineClose({
        cCallRef: spine.cCallRef,
        basisId: input.parentBasisId,
        evidenceClass: task.kind === "hof_c_batch_traversal_task"
          ? "sub_traversal"
          : "batch_task",
        evidenceRefs: Object.freeze([
          `task:${task.taskRef}`,
          `terminal:${outcome.terminalRef}`,
          `input-lineage:${task.inputLineageRef}`,
          ...outcome.evidenceRefs
        ]),
        outcomeStatus: outcome.disposition,
        payloadRef: outcome.outputPayloadRef,
        responseContractRef: outcome.responseContractRef,
        judgment,
        reasonRef: outcome.reasonRef
      });
      emittedEvents.push(...tail);
      input.emit(tail);
      if (
        outcome.disposition === "completed" &&
        input.plan.sourceKind === "hof_projection"
      ) {
        outputPayloadRefs.add(outcome.outputPayloadRef!);
      }
      return Object.freeze({
        disposition: outcome.disposition,
        value: outcome,
        reasonRef: outcome.reasonRef
      });
    }
  });
  const completedTasks = coordination.completed.map((row) => row.value);
  if (coordination.status !== "completed") {
    const stoppingTask = coordination.stoppingTask;
    if (stoppingTask === null || coordination.reasonRef === null) {
      throw new TypeError("stopped C.batch coordination lacks its exact locus");
    }
    return blockedResolution({
      invocation: input,
      completedTasks,
      stoppingTask,
      stoppingOutcome: coordination.stoppingValue,
      status: coordination.status === "held"
        ? "pending"
        : coordination.status === "runtime_failed"
          ? "runtime_failed"
          : "blocked",
      reasonRef: coordination.reasonRef,
      emittedEvents
    });
  }

  if (input.sourceAuthority.kind === "hof_projection_source_authority") {
    const source = input.sourceAuthority;
    const outputVector = constructHofOutputVector({
      plan: input.plan,
      inputVector: source.inputVector,
      outputVectorRef:
        `abg://hof/output-vector/${input.plan.planDigest.slice("sha256:".length)}`,
      outputVectorNodeRef: source.binding.outputVectorNodeRef,
      outputVectorContractKey: source.binding.outputVectorContractKey,
      outputMemberNodeRef: source.binding.outputMemberNodeRef,
      outputMemberContractKey: source.binding.outputMemberContractKey,
      outputPayloadRefs: completedTasks.map((outcome) => outcome.outputPayloadRef!)
    });
    return Object.freeze({
      kind: "hof_c_batch_completed_resolution" as const,
      status: "completed" as const,
      sourceKind: "hof_projection" as const,
      planRef: input.plan.planRef,
      batchRef: input.plan.batchRef,
      completedTasks: Object.freeze([...completedTasks]),
      outputVector,
      emittedEvents: Object.freeze([...emittedEvents])
    });
  }
  return Object.freeze({
    kind: "c_batch_completed_resolution" as const,
    status: "completed" as const,
    sourceKind: "declared_batch" as const,
    planRef: input.plan.planRef,
    batchRef: input.plan.batchRef,
    completedTasks: Object.freeze([...completedTasks]),
    emittedEvents: Object.freeze([...emittedEvents])
  });
}
