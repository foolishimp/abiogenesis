// Implements: T-260; REQ-L-GTL3-C-ALGEBRA-007;
// REQ-L-GTL3-HOF-009/-010/-012. This module owns admitted vector identity
// and the one digest-bound C.batch plan consumed by runtime.

import type { CatalogExecutionBinding } from "./runtime_catalog.js";
import {
  detachRowSnapshot,
  isPlainRecord
} from "./admission_hygiene.js";
import {
  compileCAlgebraToHog
} from "./c_algebra_hog_compiler.js";
import {
  compileGraphVectorCProgramSelection
} from "./graph_vector_c_program_compiler.js";
import {
  resolveAbgFnCompositionSelection
} from "./fn_composition.js";
import {
  isHogBatchProgram,
  type HogBatchProgramDeclaration
} from "./hog_program.js";
import {
  assertCompiledHofFanOutBinding,
  executionHandoffBindingView,
  type CompiledHofFanOutBinding,
  type ExecutionHandoffCarrier
} from "./hof_batch.js";
import {
  admitCProgramSyntax
} from "../../../gtl/m01/algebra/c_algebra.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type { RuntimeRegime } from "./carriers.js";

export interface HofVectorMember {
  readonly ordinal: number;
  readonly memberNodeRef: string;
  readonly memberContractKey: string;
  readonly payloadRef: string;
  readonly lineageRef: string;
}

export interface HofVectorAdmissionInput {
  readonly vectorRef: string;
  readonly basisRef: string;
  readonly vectorNodeRef: string;
  readonly vectorContractKey: string;
  readonly memberNodeRef: string;
  readonly memberContractKey: string;
  readonly producerRef: string;
  readonly members: readonly HofVectorMember[];
}

export interface AdmittedHofVector extends HofVectorBasis {
  readonly kind: "admitted_hof_vector";
  readonly vectorDigest: `sha256:${string}`;
}

export interface HofOutputVector extends HofVectorBasis {
  readonly kind: "hof_output_vector";
  readonly sourceBatchPlanRef: string;
  readonly vectorDigest: `sha256:${string}`;
}

export type HofVectorCarrier = AdmittedHofVector | HofOutputVector;

type HofVectorBasis = HofVectorAdmissionInput;

export interface DeclaredCBatchStageTask {
  readonly kind: "declared_c_batch_stage_task";
  readonly taskRef: string;
  readonly ordinal: number;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly resultBearing: boolean;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}

export interface HofCBatchTraversalTask {
  readonly kind: "hof_c_batch_traversal_task";
  readonly taskRef: string;
  readonly ordinal: number;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly resultBearing: true;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
}

export type CBatchTask = DeclaredCBatchStageTask | HofCBatchTraversalTask;

export interface CompiledCBatchPlan {
  readonly kind: "compiled_c_batch_plan";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly sourceKind: "declared_batch" | "hof_projection";
  readonly sourceBindingRef: string;
  readonly sourceBindingDigest: `sha256:${string}`;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionGraphFunctionRef: string;
  readonly batchRef: string;
  readonly programRef: string;
  readonly compositionRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputVectorRef: string | null;
  readonly inputVectorDigest: `sha256:${string}` | null;
  readonly tasks: readonly CBatchTask[];
}

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
  return value;
}

const HOF_VECTOR_BASIS_KEYS = Object.freeze([
  "vectorRef",
  "basisRef",
  "vectorNodeRef",
  "vectorContractKey",
  "memberNodeRef",
  "memberContractKey",
  "producerRef",
  "members"
]);
const HOF_VECTOR_MEMBER_KEYS = Object.freeze([
  "ordinal",
  "memberNodeRef",
  "memberContractKey",
  "payloadRef",
  "lineageRef"
]);

function assertExactKeys(input: {
  readonly row: Readonly<Record<string, unknown>>;
  readonly expected: readonly string[];
  readonly label: string;
}): void {
  if (!stableJsonEquals(Object.keys(input.row).sort(), [...input.expected].sort())) {
    throw new TypeError(`${input.label} has a non-canonical key set`);
  }
}

function detachedRecord(input: unknown, label: string): Readonly<Record<string, unknown>> {
  const detached = detachRowSnapshot(input);
  if (!isPlainRecord(detached)) {
    throw new TypeError(`${label} must be detached plain data`);
  }
  return detached;
}

function readVectorBasis(
  row: Readonly<Record<string, unknown>>
): HofVectorBasis {
  const membersRaw = row["members"];
  if (!Array.isArray(membersRaw)) {
    throw new TypeError("HOF vector members must be an array");
  }
  const members = membersRaw.map((memberRaw: unknown, index) => {
    const member = detachedRecord(memberRaw, `HOF vector members[${String(index)}]`);
    assertExactKeys({
      row: member,
      expected: HOF_VECTOR_MEMBER_KEYS,
      label: `HOF vector members[${String(index)}]`
    });
    const ordinal = nonNegativeInteger(
      member["ordinal"],
      "HOF vector member ordinal"
    );
    return Object.freeze({
      ordinal,
      memberNodeRef: nonEmpty(member["memberNodeRef"], "memberNodeRef"),
      memberContractKey: nonEmpty(
        member["memberContractKey"],
        "memberContractKey"
      ),
      payloadRef: nonEmpty(member["payloadRef"], "payloadRef"),
      lineageRef: nonEmpty(member["lineageRef"], "lineageRef")
    });
  });
  return Object.freeze({
    vectorRef: nonEmpty(row["vectorRef"], "vectorRef"),
    basisRef: nonEmpty(row["basisRef"], "basisRef"),
    vectorNodeRef: nonEmpty(row["vectorNodeRef"], "vectorNodeRef"),
    vectorContractKey: nonEmpty(row["vectorContractKey"], "vectorContractKey"),
    memberNodeRef: nonEmpty(row["memberNodeRef"], "memberNodeRef"),
    memberContractKey: nonEmpty(row["memberContractKey"], "memberContractKey"),
    producerRef: nonEmpty(row["producerRef"], "producerRef"),
    members: Object.freeze(members)
  });
}

function assertOrderedMembers(members: readonly HofVectorMember[]): void {
  if (!Array.isArray(members) || members.length === 0) {
    throw new TypeError("HOF vector members must be a non-empty array");
  }
  const payloadRefs = new Set<string>();
  const lineageRefs = new Set<string>();
  for (let ordinal = 0; ordinal < members.length; ordinal += 1) {
    const member = detachedRecord(
      members[ordinal],
      `HOF vector members[${String(ordinal)}]`
    );
    const memberOrdinal = nonNegativeInteger(
      member["ordinal"],
      "HOF vector member ordinal"
    );
    nonEmpty(member["memberNodeRef"], "memberNodeRef");
    nonEmpty(member["memberContractKey"], "memberContractKey");
    const payloadRef = nonEmpty(member["payloadRef"], "payloadRef");
    const lineageRef = nonEmpty(member["lineageRef"], "lineageRef");
    if (memberOrdinal !== ordinal) {
      throw new TypeError("HOF vector member ordinals must be contiguous and zero-based");
    }
    if (payloadRefs.has(payloadRef) || lineageRefs.has(lineageRef)) {
      throw new TypeError("HOF vector payload and lineage identities must be unique");
    }
    payloadRefs.add(payloadRef);
    lineageRefs.add(lineageRef);
  }
}

function vectorBasis(input: HofVectorBasis): HofVectorBasis {
  return Object.freeze({
    vectorRef: input.vectorRef,
    basisRef: input.basisRef,
    vectorNodeRef: input.vectorNodeRef,
    vectorContractKey: input.vectorContractKey,
    memberNodeRef: input.memberNodeRef,
    memberContractKey: input.memberContractKey,
    producerRef: input.producerRef,
    members: Object.freeze(input.members.map((member) => Object.freeze({ ...member })))
  });
}

export function admitHofVector(input: HofVectorAdmissionInput): AdmittedHofVector {
  const row = detachedRecord(input, "HOF vector admission input");
  assertExactKeys({
    row,
    expected: HOF_VECTOR_BASIS_KEYS,
    label: "HOF vector admission input"
  });
  const basis = readVectorBasis(row);
  assertOrderedMembers(basis.members);
  for (const member of basis.members) {
    if (
      member.memberNodeRef !== basis.memberNodeRef ||
      member.memberContractKey !== basis.memberContractKey
    ) {
      throw new TypeError("HOF vector member contract differs from its vector basis");
    }
  }
  const normalized = vectorBasis(basis);
  return Object.freeze({
    kind: "admitted_hof_vector" as const,
    ...normalized,
    vectorDigest: stableSha256Digest({
      kind: "admitted_hof_vector",
      ...normalized
    })
  });
}

export function admitHofVectorCarrier(input: unknown): HofVectorCarrier {
  const row = detachedRecord(input, "HOF vector carrier");
  const kind = row["kind"];
  const output = kind === "hof_output_vector";
  if (!output && kind !== "admitted_hof_vector") {
    throw new TypeError("HOF vector carrier kind is invalid");
  }
  assertExactKeys({
    row,
    expected: output
      ? [...HOF_VECTOR_BASIS_KEYS, "kind", "sourceBatchPlanRef", "vectorDigest"]
      : [...HOF_VECTOR_BASIS_KEYS, "kind", "vectorDigest"],
    label: "HOF vector carrier"
  });
  const basis = vectorBasis(readVectorBasis(row));
  assertOrderedMembers(basis.members);
  for (const member of basis.members) {
    if (
      member.memberNodeRef !== basis.memberNodeRef ||
      member.memberContractKey !== basis.memberContractKey
    ) {
      throw new TypeError("HOF vector member contract differs from its vector basis");
    }
  }
  const sourceBatchPlanRef = output
    ? nonEmpty(row["sourceBatchPlanRef"], "sourceBatchPlanRef")
    : null;
  const expected = output
    ? stableSha256Digest({
        kind,
        ...basis,
        sourceBatchPlanRef
      })
    : stableSha256Digest({ kind, ...basis });
  if (row["vectorDigest"] !== expected) {
    throw new TypeError("HOF vector identity is invalid");
  }
  if (output) {
    return Object.freeze({
      kind: "hof_output_vector" as const,
      ...basis,
      sourceBatchPlanRef: sourceBatchPlanRef!,
      vectorDigest: expected
    });
  }
  return Object.freeze({
    kind: "admitted_hof_vector" as const,
    ...basis,
    vectorDigest: expected
  });
}

export function assertHofVectorCarrier(vector: HofVectorCarrier): void {
  void admitHofVectorCarrier(vector);
}

function assertSelectedBinding(input: {
  readonly selected: CatalogExecutionBinding;
  readonly entryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionGraphFunctionRef: string;
}): void {
  const { selected } = input;
  if (
    selected.kind !== "catalog_execution_binding" ||
    selected.entryRef !== input.entryRef ||
    selected.moduleName !== input.moduleName ||
    selected.moduleDigest !== input.moduleDigest ||
    stableSha256Digest(selected.module) !== input.moduleDigest ||
    selected.graphFunction.id !== input.executionGraphFunctionRef ||
    selected.graphFunctionDigest !== stableSha256Digest(selected.graphFunction)
  ) {
    throw new TypeError("C.batch selected catalog authority is incoherent");
  }
  const matches = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.executionGraphFunctionRef
  );
  if (
    matches.length !== 1 ||
    !stableJsonEquals(matches[0], selected.graphFunction)
  ) {
    throw new TypeError("C.batch execution GraphFunction is not exact in selected Module");
  }
}

type CompiledCBatchPlanBasis = Omit<
  CompiledCBatchPlan,
  "planRef" | "planDigest"
>;

function planBasis(
  plan: Omit<CompiledCBatchPlan, "planRef" | "planDigest"> |
    CompiledCBatchPlan
): CompiledCBatchPlanBasis {
  return Object.freeze({
    kind: plan.kind,
    sourceKind: plan.sourceKind,
    sourceBindingRef: plan.sourceBindingRef,
    sourceBindingDigest: plan.sourceBindingDigest,
    selectedCatalogEntryRef: plan.selectedCatalogEntryRef,
    moduleName: plan.moduleName,
    moduleDigest: plan.moduleDigest,
    executionGraphFunctionRef: plan.executionGraphFunctionRef,
    batchRef: plan.batchRef,
    programRef: plan.programRef,
    compositionRef: plan.compositionRef,
    inputCarrierRef: plan.inputCarrierRef,
    outputCarrierRef: plan.outputCarrierRef,
    inputVectorRef: plan.inputVectorRef,
    inputVectorDigest: plan.inputVectorDigest,
    tasks: Object.freeze(plan.tasks.map((task) => Object.freeze({ ...task })))
  });
}

function sealPlan(
  plan: Omit<CompiledCBatchPlan, "planRef" | "planDigest">
): CompiledCBatchPlan {
  if (plan.tasks.length === 0) {
    throw new TypeError("C.batch plan requires at least one task");
  }
  const basis = planBasis(plan);
  const planDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    planRef: `abg://c-batch/plan/${planDigest.slice("sha256:".length)}`,
    planDigest
  });
}

export function assertCompiledCBatchPlan(plan: CompiledCBatchPlan): void {
  const expected = stableSha256Digest(planBasis(plan));
  if (
    plan.kind !== "compiled_c_batch_plan" ||
    plan.planDigest !== expected ||
    plan.planRef !== `abg://c-batch/plan/${expected.slice("sha256:".length)}` ||
    plan.tasks.length === 0
  ) {
    throw new TypeError("compiled C.batch plan identity is invalid");
  }
  for (const [ordinal, task] of plan.tasks.entries()) {
    if (task.ordinal !== ordinal || !Number.isInteger(task.ordinal)) {
      throw new TypeError("compiled C.batch task ordinals are invalid");
    }
    const taskBasis = taskIdentityBasis(task);
    const expectedTaskRef =
      `abg://c-batch/task/${stableSha256Digest({
        planSourceBindingRef: plan.sourceBindingRef,
        batchRef: plan.batchRef,
        ordinal,
        task: taskBasis
      }).slice("sha256:".length)}`;
    if (task.taskRef !== expectedTaskRef) {
      throw new TypeError("compiled C.batch task identity is invalid");
    }
  }
}

function taskIdentityBasis(task: CBatchTask): Omit<CBatchTask, "taskRef"> {
  const common = Object.freeze({
    ordinal: task.ordinal,
    stageRole: task.stageRole,
    regime: task.regime,
    armId: task.armId,
    resultBearing: task.resultBearing,
    inputCarrierRef: task.inputCarrierRef,
    outputCarrierRef: task.outputCarrierRef,
    inputPayloadRef: task.inputPayloadRef,
    inputLineageRef: task.inputLineageRef
  });
  if (task.kind === "declared_c_batch_stage_task") {
    return Object.freeze({
      kind: "declared_c_batch_stage_task" as const,
      ...common
    });
  }
  return Object.freeze({
    kind: "hof_c_batch_traversal_task" as const,
    ...common,
    resultBearing: true as const,
    childGraphFunctionRef: task.childGraphFunctionRef,
    childGraphFunctionDigest: task.childGraphFunctionDigest
  });
}

function taskRef(input: {
  readonly sourceBindingRef: string;
  readonly batchRef: string;
  readonly ordinal: number;
  readonly task: Omit<CBatchTask, "taskRef">;
}): string {
  return `abg://c-batch/task/${stableSha256Digest({
    planSourceBindingRef: input.sourceBindingRef,
    batchRef: input.batchRef,
    ordinal: input.ordinal,
    task: input.task
  }).slice("sha256:".length)}`;
}

export function compileHofCBatchPlan(input: {
  readonly binding: CompiledHofFanOutBinding;
  readonly selectedCatalogBinding: CatalogExecutionBinding;
  readonly inputVector: HofVectorCarrier;
}): CompiledCBatchPlan {
  assertCompiledHofFanOutBinding(input.binding);
  const inputVector = admitHofVectorCarrier(input.inputVector);
  assertSelectedBinding({
    selected: input.selectedCatalogBinding,
    entryRef: input.selectedCatalogBinding.entryRef,
    moduleName: input.binding.moduleName,
    moduleDigest: input.binding.moduleDigest,
    executionGraphFunctionRef: input.binding.hostGraphFunctionRef
  });
  if (
    inputVector.vectorNodeRef !== input.binding.inputVectorNodeRef ||
    inputVector.vectorContractKey !== input.binding.inputVectorContractKey ||
    inputVector.memberNodeRef !== input.binding.inputMemberNodeRef ||
    inputVector.memberContractKey !== input.binding.inputMemberContractKey
  ) {
    throw new TypeError("HOF input vector does not match the compiled fan-out binding");
  }
  const sourceBindingRef = input.binding.bindingRef;
  const batchRef = `abg://hof/c-batch/${stableSha256Digest({
    bindingRef: input.binding.bindingRef,
    vectorDigest: inputVector.vectorDigest
  }).slice("sha256:".length)}`;
  const tasks = inputVector.members.map((member) => {
    const taskWithoutRef: Omit<HofCBatchTraversalTask, "taskRef"> = Object.freeze({
      kind: "hof_c_batch_traversal_task" as const,
      ordinal: member.ordinal,
      stageRole: input.binding.stageRole,
      regime: input.binding.regime,
      armId: input.binding.armId,
      resultBearing: true,
      inputCarrierRef: input.binding.inputMemberContractKey,
      outputCarrierRef: input.binding.outputMemberContractKey,
      inputPayloadRef: member.payloadRef,
      inputLineageRef: member.lineageRef,
      childGraphFunctionRef: input.binding.childGraphFunctionRef,
      childGraphFunctionDigest: input.binding.childGraphFunctionDigest
    });
    return Object.freeze({
      ...taskWithoutRef,
      taskRef: taskRef({
        sourceBindingRef,
        batchRef,
        ordinal: member.ordinal,
        task: taskWithoutRef
      })
    });
  });
  return sealPlan({
    kind: "compiled_c_batch_plan",
    sourceKind: "hof_projection",
    sourceBindingRef,
    sourceBindingDigest: input.binding.bindingDigest,
    selectedCatalogEntryRef: input.selectedCatalogBinding.entryRef,
    moduleName: input.binding.moduleName,
    moduleDigest: input.binding.moduleDigest,
    executionGraphFunctionRef: input.binding.hostGraphFunctionRef,
    batchRef,
    programRef: input.binding.childProgramRef,
    compositionRef: input.binding.compositionRef,
    inputCarrierRef: input.binding.inputMemberContractKey,
    outputCarrierRef: input.binding.outputMemberContractKey,
    inputVectorRef: inputVector.vectorRef,
    inputVectorDigest: inputVector.vectorDigest,
    tasks: Object.freeze(tasks)
  });
}

function exactBatchProgram(input: {
  readonly selected: CatalogExecutionBinding;
  readonly handoff: ExecutionHandoffCarrier;
}): HogBatchProgramDeclaration {
  const view = executionHandoffBindingView(input.handoff);
  assertSelectedBinding({
    selected: input.selected,
    entryRef: input.selected.entryRef,
    moduleName: input.selected.moduleName,
    moduleDigest: stableSha256Digest(input.selected.module),
    executionGraphFunctionRef: view.executionSubjectGraphFunctionRef
  });
  const host = input.selected.graphFunction;
  if (host.template.kind !== "inline_graph") {
    throw new TypeError("declared C.batch host must contain an inline Graph");
  }
  const vectors = host.template.graph.vectors.filter(
    (candidate) => candidate.id === view.graphVectorRef
  );
  const vector = vectors[0];
  if (vectors.length !== 1 || vector === undefined) {
    throw new TypeError("declared C.batch GraphVector must resolve exactly");
  }
  const selection = compileGraphVectorCProgramSelection({
    graphFunction: host,
    graphVector: vector
  });
  const raw = selection.selectedCandidates[0]?.candidate;
  if (
    selection.binding === null ||
    selection.selectedCandidates.length !== 1 ||
    raw === undefined ||
    !stableJsonEquals(selection.binding, input.handoff.programBinding)
  ) {
    throw new TypeError("declared C.batch program must reselect exactly");
  }
  const syntax = admitCProgramSyntax(raw);
  if (!syntax.accepted || syntax.program === null) {
    throw new TypeError("declared C.batch program syntax no longer admits");
  }
  const lowered = compileCAlgebraToHog(syntax.program);
  if (
    !lowered.accepted ||
    lowered.program === null ||
    !isHogBatchProgram(lowered.program) ||
    !stableJsonEquals(lowered.program, view.normalizedProgram)
  ) {
    throw new TypeError("declared C.batch program no longer lowers exactly");
  }
  const ownerMatches = input.selected.module.graphFunctions.filter(
    (candidate) => candidate.id === view.declarationOwnerGraphFunctionRef
  );
  const owner = ownerMatches[0];
  if (
    ownerMatches.length !== 1 ||
    owner === undefined ||
    owner.template.kind !== "inline_graph"
  ) {
    throw new TypeError("declared C.batch composition owner is invalid");
  }
  const ownerVectorMatches = owner.template.graph.vectors.filter(
    (candidate) => candidate.id === view.graphVectorRef
  );
  const ownerVector = ownerVectorMatches[0];
  if (ownerVectorMatches.length !== 1 || ownerVector === undefined) {
    throw new TypeError("declared C.batch composition vector is invalid");
  }
  const composition = resolveAbgFnCompositionSelection({
    graphFunction: owner,
    vector: ownerVector
  });
  if (
    composition.selectionRef !== view.compositionSelectionRef ||
    composition.contract.contractRef !== view.compositionRef
  ) {
    throw new TypeError("declared C.batch composition selection drifted");
  }
  return lowered.program;
}

export function compileDeclaredCBatchPlan(input: {
  readonly executionHandoff: ExecutionHandoffCarrier;
  readonly selectedCatalogBinding: CatalogExecutionBinding;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
}): CompiledCBatchPlan {
  nonEmpty(input.inputPayloadRef, "inputPayloadRef");
  nonEmpty(input.inputLineageRef, "inputLineageRef");
  const view = executionHandoffBindingView(input.executionHandoff);
  const program = exactBatchProgram({
    selected: input.selectedCatalogBinding,
    handoff: input.executionHandoff
  });
  if (
    program.batch.inputCarrierRef !==
      input.executionHandoff.programBinding.programInputCarrierRef ||
    program.batch.outputCarrierRef !==
      input.executionHandoff.programBinding.programOutputCarrierRef
  ) {
    throw new TypeError("declared C.batch carrier pair differs from its handoff");
  }
  const sourceBindingRef = input.executionHandoff.programBinding.selectedProgramRef;
  const sourceBindingDigest = input.executionHandoff.programBinding.bindingDigest;
  const tasks = program.batch.tasks.map((task) => {
    const taskWithoutRef: Omit<DeclaredCBatchStageTask, "taskRef"> = Object.freeze({
      kind: "declared_c_batch_stage_task" as const,
      ordinal: task.ordinal,
      stageRole: task.stage.stageRole,
      regime: task.stage.defaultRegime,
      armId: task.stage.armId,
      resultBearing: task.stage.resultBearing,
      inputCarrierRef: program.batch.inputCarrierRef,
      outputCarrierRef: program.batch.outputCarrierRef,
      inputPayloadRef: input.inputPayloadRef,
      inputLineageRef: input.inputLineageRef
    });
    return Object.freeze({
      ...taskWithoutRef,
      taskRef: taskRef({
        sourceBindingRef,
        batchRef: program.batch.batchRef,
        ordinal: task.ordinal,
        task: taskWithoutRef
      })
    });
  });
  return sealPlan({
    kind: "compiled_c_batch_plan",
    sourceKind: "declared_batch",
    sourceBindingRef,
    sourceBindingDigest,
    selectedCatalogEntryRef: input.selectedCatalogBinding.entryRef,
    moduleName: input.selectedCatalogBinding.moduleName,
    moduleDigest: stableSha256Digest(input.selectedCatalogBinding.module),
    executionGraphFunctionRef: view.executionSubjectGraphFunctionRef,
    batchRef: program.batch.batchRef,
    programRef: program.programRef,
    compositionRef: view.compositionRef,
    inputCarrierRef: program.batch.inputCarrierRef,
    outputCarrierRef: program.batch.outputCarrierRef,
    inputVectorRef: null,
    inputVectorDigest: null,
    tasks: Object.freeze(tasks)
  });
}

export function constructHofOutputVector(input: {
  readonly plan: CompiledCBatchPlan;
  readonly inputVector: HofVectorCarrier;
  readonly outputVectorRef: string;
  readonly outputVectorNodeRef: string;
  readonly outputVectorContractKey: string;
  readonly outputMemberNodeRef: string;
  readonly outputMemberContractKey: string;
  readonly outputPayloadRefs: readonly string[];
}): HofOutputVector {
  assertCompiledCBatchPlan(input.plan);
  const inputVector = admitHofVectorCarrier(input.inputVector);
  if (
    input.plan.sourceKind !== "hof_projection" ||
    input.plan.inputVectorRef !== inputVector.vectorRef ||
    input.plan.inputVectorDigest !== inputVector.vectorDigest ||
    input.outputPayloadRefs.length !== inputVector.members.length
  ) {
    throw new TypeError("HOF output vector basis or cardinality is invalid");
  }
  const members = inputVector.members.map((member, ordinal) => {
    const payloadRef = input.outputPayloadRefs[ordinal];
    if (payloadRef === undefined) {
      throw new TypeError("HOF output vector payload cardinality is invalid");
    }
    return Object.freeze({
      ordinal,
      memberNodeRef: input.outputMemberNodeRef,
      memberContractKey: input.outputMemberContractKey,
      payloadRef,
      lineageRef: member.lineageRef
    });
  });
  assertOrderedMembers(members);
  const basis = vectorBasis({
    vectorRef: input.outputVectorRef,
    basisRef: inputVector.basisRef,
    vectorNodeRef: input.outputVectorNodeRef,
    vectorContractKey: input.outputVectorContractKey,
    memberNodeRef: input.outputMemberNodeRef,
    memberContractKey: input.outputMemberContractKey,
    producerRef: input.plan.planRef,
    members
  });
  return Object.freeze({
    kind: "hof_output_vector" as const,
    ...basis,
    sourceBatchPlanRef: input.plan.planRef,
    vectorDigest: stableSha256Digest({
      kind: "hof_output_vector",
      ...basis,
      sourceBatchPlanRef: input.plan.planRef
    })
  });
}
