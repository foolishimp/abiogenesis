// Implements: T-260; REQ-L-GTL3-HOF-009/-011/-012. Structural HOF
// relations become runtime authority only after an exact selected-Module and
// T-255 execution-handoff join.

import {
  admitCProgramSyntax,
  cInterfaceContractRef
} from "../../../gtl/m01/algebra/c_algebra.js";
import type {
  GraphFunction,
  GraphVector
} from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  compileGraphFunctionApplication,
  type CompiledFanInApplicationRelation
} from "./graph_function_application_compiler.js";
import {
  compileCAlgebraToHog
} from "./c_algebra_hog_compiler.js";
import {
  compileGraphVectorCProgramSelection
} from "./graph_vector_c_program_compiler.js";
import {
  resolveAbgFnCompositionSelection
} from "./fn_composition.js";
import type {
  CompiledGraphVectorExecutionHandoff,
  GraphVectorExecutionHandoffCapabilityBlocked
} from "./graph_vector_execution_handoff.js";
import {
  compileHofRelation,
  type CompiledHofFanOutRelation
} from "./hof_relation_compiler.js";
import {
  isHogBatchProgram,
  isHogRetryProgram,
  isHogWorkflowProgram,
  type HogProgramDeclaration,
  type HogProgramStage
} from "./hog_program.js";
import type { RuntimeRegime } from "./carriers.js";

export type ExecutionHandoffCarrier =
  | CompiledGraphVectorExecutionHandoff
  | GraphVectorExecutionHandoffCapabilityBlocked;

export interface ExecutionHandoffBindingView {
  readonly executionSubjectGraphFunctionRef: string;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly programBindingDigest: `sha256:${string}`;
  readonly programRef: string;
  readonly normalizedProgram: HogProgramDeclaration;
  readonly compositionRef: string;
  readonly compositionSelectionRef: string;
  readonly applicationRelation: CompiledFanInApplicationRelation | null;
}

export interface CompiledHofFanOutBinding {
  readonly kind: "compiled_hof_fan_out_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly relationBindingRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly hostGraphFunctionRef: string;
  readonly hostGraphFunctionDigest: `sha256:${string}`;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly childGraphVectorRef: string;
  readonly childProgramBindingDigest: `sha256:${string}`;
  readonly childProgramRef: string;
  readonly inputMemberNodeRef: string;
  readonly inputMemberContractKey: string;
  readonly outputMemberNodeRef: string;
  readonly outputMemberContractKey: string;
  readonly inputVectorNodeRef: string;
  readonly inputVectorContractKey: string;
  readonly outputVectorNodeRef: string;
  readonly outputVectorContractKey: string;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly compositionRef: string;
  readonly compositionSelectionRef: string;
  readonly resultBearing: true;
}

export interface CompiledFanInReductionBinding {
  readonly kind: "compiled_fan_in_reduction_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly relationRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionSubjectGraphFunctionRef: string;
  readonly executionSubjectGraphFunctionDigest: `sha256:${string}`;
  readonly reducerGraphFunctionRef: string;
  readonly reducerGraphFunctionDigest: `sha256:${string}`;
  readonly reducerGraphVectorRef: string;
  readonly reducerProgramBindingDigest: `sha256:${string}`;
  readonly reducerProgramRef: string;
  readonly inputVectorNodeRef: string;
  readonly inputVectorContractKey: string;
  readonly outputNodeRef: string;
  readonly outputContractKey: string;
  readonly applicationLineageRef: string;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly compositionRef: string;
  readonly compositionSelectionRef: string;
  readonly resultBearing: true;
}

function exactGraphFunction(input: {
  readonly module: Module;
  readonly ref: string;
  readonly label: string;
}): GraphFunction {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.ref
  );
  const graphFunction = matches[0];
  if (matches.length !== 1 || graphFunction === undefined) {
    throw new TypeError(
      `${input.label} must resolve exactly once in Module ${JSON.stringify(input.module.name)}; got ${String(matches.length)}`
    );
  }
  return graphFunction;
}

function exactGraphVector(input: {
  readonly graphFunction: GraphFunction;
  readonly ref: string;
  readonly label: string;
}): GraphVector {
  if (input.graphFunction.template.kind !== "inline_graph") {
    throw new TypeError(`${input.label} owner must contain an inline Graph`);
  }
  const matches = input.graphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.ref
  );
  const vector = matches[0];
  if (matches.length !== 1 || vector === undefined) {
    throw new TypeError(
      `${input.label} must resolve exactly once; got ${String(matches.length)}`
    );
  }
  return vector;
}

export function executionHandoffBindingView(
  handoff: ExecutionHandoffCarrier
): ExecutionHandoffBindingView {
  const capabilityBlocked =
    handoff.kind === "graph_vector_execution_handoff_outcome";
  const declarationOwnerGraphFunctionRef = capabilityBlocked
    ? handoff.compositionSelection.contract.host.graphFunctionRef
    : handoff.declarationOwnerGraphFunctionRef;
  if (declarationOwnerGraphFunctionRef === null) {
    throw new TypeError(
      "execution handoff composition must identify its declaration owner"
    );
  }
  if (handoff.normalizedProgram === null) {
    throw new TypeError(
      "direct HOF projection requires a normalized compatibility program; complete C programs use the T-271 interpreter"
    );
  }
  return Object.freeze({
    executionSubjectGraphFunctionRef:
      capabilityBlocked
        ? handoff.boundary.hostGraphFunctionRef
        : handoff.executionSubjectGraphFunctionRef,
    declarationOwnerGraphFunctionRef:
      declarationOwnerGraphFunctionRef,
    graphVectorRef: capabilityBlocked
      ? handoff.targetCarrierProjection.graphVectorId
      : handoff.graphVectorRef,
    programBindingDigest: handoff.programBinding.bindingDigest,
    programRef: handoff.programBinding.selectedProgramRef,
    normalizedProgram: handoff.normalizedProgram,
    compositionRef: handoff.compositionSelection.contract.contractRef,
    compositionSelectionRef: handoff.compositionSelection.selectionRef,
    applicationRelation: handoff.fanInApplicationRelation
  });
}

function exactSingleStage(
  program: HogProgramDeclaration,
  label: string
): HogProgramStage {
  if (isHogRetryProgram(program)) {
    if (!program.retry.stage.resultBearing) {
      throw new TypeError(`${label} retry stage must be result-bearing`);
    }
    return program.retry.stage;
  }
  if (
    isHogWorkflowProgram(program) ||
    isHogBatchProgram(program) ||
    program.stages.length !== 1
  ) {
    throw new TypeError(`${label} must be one direct executable C stage`);
  }
  const stage = program.stages[0];
  if (stage === undefined || !stage.resultBearing) {
    throw new TypeError(`${label} stage must be result-bearing`);
  }
  return stage;
}

function exactExecutionHandoff(input: {
  readonly module: Module;
  readonly handoff: ExecutionHandoffCarrier;
  readonly label: string;
}): {
  readonly view: ExecutionHandoffBindingView;
  readonly graphFunction: GraphFunction;
  readonly vector: GraphVector;
  readonly stage: HogProgramStage;
} {
  const view = executionHandoffBindingView(input.handoff);
  const graphFunction = exactGraphFunction({
    module: input.module,
    ref: view.executionSubjectGraphFunctionRef,
    label: `${input.label} execution subject`
  });
  const vector = exactGraphVector({
    graphFunction,
    ref: view.graphVectorRef,
    label: `${input.label} GraphVector`
  });
  const selection = compileGraphVectorCProgramSelection({
    graphFunction,
    graphVector: vector
  });
  const raw = selection.selectedCandidates[0]?.candidate;
  if (
    selection.binding === null ||
    selection.selectedCandidates.length !== 1 ||
    raw === undefined ||
    !stableJsonEquals(selection.binding, input.handoff.programBinding)
  ) {
    throw new TypeError(
      `${input.label} program binding must rederive exactly from the selected Module`
    );
  }
  const syntax = admitCProgramSyntax(raw);
  if (!syntax.accepted || syntax.program === null) {
    throw new TypeError(`${input.label} selected C program no longer admits`);
  }
  const lowered = compileCAlgebraToHog(syntax.program);
  if (
    !lowered.accepted ||
    lowered.program === null ||
    !stableJsonEquals(lowered.program, view.normalizedProgram)
  ) {
    throw new TypeError(
      `${input.label} normalized program must rederive exactly from the selected Module`
    );
  }
  const owner = exactGraphFunction({
    module: input.module,
    ref: view.declarationOwnerGraphFunctionRef,
    label: `${input.label} composition owner`
  });
  const ownerVector = exactGraphVector({
    graphFunction: owner,
    ref: view.graphVectorRef,
    label: `${input.label} composition owner GraphVector`
  });
  if (!stableJsonEquals(ownerVector, vector)) {
    throw new TypeError(
      `${input.label} composition owner must retain the exact execution GraphVector`
    );
  }
  const composition = resolveAbgFnCompositionSelection({
    graphFunction: owner,
    vector: ownerVector
  });
  if (
    composition.selectionRef !== view.compositionSelectionRef ||
    composition.contract.contractRef !== view.compositionRef
  ) {
    throw new TypeError(
      `${input.label} composition must rederive exactly from the selected Module`
    );
  }
  return Object.freeze({
    view,
    graphFunction,
    vector,
    stage: exactSingleStage(lowered.program, `${input.label} program`)
  });
}

type HofFanOutBindingBasis = Omit<
  CompiledHofFanOutBinding,
  "bindingRef" | "bindingDigest"
>;

function hofBindingBasis(
  binding: Omit<CompiledHofFanOutBinding, "bindingRef" | "bindingDigest"> |
    CompiledHofFanOutBinding
): HofFanOutBindingBasis {
  return Object.freeze({
    kind: binding.kind,
    relationBindingRef: binding.relationBindingRef,
    relationDigest: binding.relationDigest,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    hostGraphFunctionRef: binding.hostGraphFunctionRef,
    hostGraphFunctionDigest: binding.hostGraphFunctionDigest,
    childGraphFunctionRef: binding.childGraphFunctionRef,
    childGraphFunctionDigest: binding.childGraphFunctionDigest,
    childGraphVectorRef: binding.childGraphVectorRef,
    childProgramBindingDigest: binding.childProgramBindingDigest,
    childProgramRef: binding.childProgramRef,
    inputMemberNodeRef: binding.inputMemberNodeRef,
    inputMemberContractKey: binding.inputMemberContractKey,
    outputMemberNodeRef: binding.outputMemberNodeRef,
    outputMemberContractKey: binding.outputMemberContractKey,
    inputVectorNodeRef: binding.inputVectorNodeRef,
    inputVectorContractKey: binding.inputVectorContractKey,
    outputVectorNodeRef: binding.outputVectorNodeRef,
    outputVectorContractKey: binding.outputVectorContractKey,
    stageRole: binding.stageRole,
    regime: binding.regime,
    armId: binding.armId,
    compositionRef: binding.compositionRef,
    compositionSelectionRef: binding.compositionSelectionRef,
    resultBearing: binding.resultBearing
  });
}

export function assertCompiledHofFanOutBinding(
  binding: CompiledHofFanOutBinding
): void {
  const digest = stableSha256Digest(hofBindingBasis(binding));
  if (
    binding.kind !== "compiled_hof_fan_out_binding" ||
    binding.bindingDigest !== digest ||
    binding.bindingRef !==
      `abg://hof/fan-out/binding/${digest.slice("sha256:".length)}` ||
    binding.resultBearing !== true
  ) {
    throw new TypeError("compiled HOF fan-out binding identity is invalid");
  }
}

export function compileHofFanOutBinding(input: {
  readonly module: Module;
  readonly relation: CompiledHofFanOutRelation;
  readonly childExecutionHandoff: ExecutionHandoffCarrier;
}): CompiledHofFanOutBinding {
  const host = exactGraphFunction({
    module: input.module,
    ref: input.relation.hostGraphFunctionRef,
    label: "HOF host GraphFunction"
  });
  const child = exactGraphFunction({
    module: input.module,
    ref: input.relation.childGraphFunctionRef,
    label: "HOF child GraphFunction"
  });
  const recompiled = compileHofRelation({
    graphFunction: host,
    graphFunctions: input.module.graphFunctions
  });
  if (
    !recompiled.accepted ||
    recompiled.relation === null ||
    !stableJsonEquals(recompiled.relation, input.relation)
  ) {
    throw new TypeError(
      "HOF structural relation must recompile exactly inside the selected Module"
    );
  }
  const childExecution = exactExecutionHandoff({
    module: input.module,
    handoff: input.childExecutionHandoff,
    label: "HOF child"
  });
  const handoff = childExecution.view;
  if (childExecution.graphFunction.id !== child.id) {
    throw new TypeError(
      "HOF child execution handoff must belong to the exact declared child"
    );
  }
  const vector = childExecution.vector;
  if (
    vector.source.length !== 1 ||
    vector.source[0]?.id !== input.relation.inputMemberNodeRef ||
    vector.target.id !== input.relation.outputMemberNodeRef ||
    cInterfaceContractRef(vector.source) !==
      input.childExecutionHandoff.programBinding.programInputCarrierRef ||
    cInterfaceContractRef([vector.target]) !==
      input.childExecutionHandoff.programBinding.programOutputCarrierRef
  ) {
    throw new TypeError(
      "HOF child execution handoff must preserve the exact member carrier pair"
    );
  }
  const stage = childExecution.stage;
  const basis = hofBindingBasis(Object.freeze({
    kind: "compiled_hof_fan_out_binding" as const,
    relationBindingRef: input.relation.relationBindingRef,
    relationDigest: input.relation.relationDigest,
    moduleName: input.module.name,
    moduleDigest: stableSha256Digest(input.module),
    hostGraphFunctionRef: host.id,
    hostGraphFunctionDigest: stableSha256Digest(host),
    childGraphFunctionRef: child.id,
    childGraphFunctionDigest: stableSha256Digest(child),
    childGraphVectorRef: vector.id,
    childProgramBindingDigest: handoff.programBindingDigest,
    childProgramRef: handoff.programRef,
    inputMemberNodeRef: input.relation.inputMemberNodeRef,
    inputMemberContractKey: input.relation.inputMemberContractKey,
    outputMemberNodeRef: input.relation.outputMemberNodeRef,
    outputMemberContractKey: input.relation.outputMemberContractKey,
    inputVectorNodeRef: input.relation.inputVectorNodeRef,
    inputVectorContractKey: input.relation.inputVectorContractKey,
    outputVectorNodeRef: input.relation.outputVectorNodeRef,
    outputVectorContractKey: input.relation.outputVectorContractKey,
    stageRole: stage.stageRole,
    regime: stage.defaultRegime,
    armId: stage.armId,
    compositionRef: handoff.compositionRef,
    compositionSelectionRef: handoff.compositionSelectionRef,
    resultBearing: true as const
  }));
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bindingRef:
      `abg://hof/fan-out/binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}

type FanInReductionBindingBasis = Omit<
  CompiledFanInReductionBinding,
  "bindingRef" | "bindingDigest"
>;

function fanInBindingBasis(
  binding: Omit<CompiledFanInReductionBinding, "bindingRef" | "bindingDigest"> |
    CompiledFanInReductionBinding
): FanInReductionBindingBasis {
  return Object.freeze({
    kind: binding.kind,
    relationRef: binding.relationRef,
    relationDigest: binding.relationDigest,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    executionSubjectGraphFunctionRef: binding.executionSubjectGraphFunctionRef,
    executionSubjectGraphFunctionDigest:
      binding.executionSubjectGraphFunctionDigest,
    reducerGraphFunctionRef: binding.reducerGraphFunctionRef,
    reducerGraphFunctionDigest: binding.reducerGraphFunctionDigest,
    reducerGraphVectorRef: binding.reducerGraphVectorRef,
    reducerProgramBindingDigest: binding.reducerProgramBindingDigest,
    reducerProgramRef: binding.reducerProgramRef,
    inputVectorNodeRef: binding.inputVectorNodeRef,
    inputVectorContractKey: binding.inputVectorContractKey,
    outputNodeRef: binding.outputNodeRef,
    outputContractKey: binding.outputContractKey,
    applicationLineageRef: binding.applicationLineageRef,
    stageRole: binding.stageRole,
    regime: binding.regime,
    armId: binding.armId,
    compositionRef: binding.compositionRef,
    compositionSelectionRef: binding.compositionSelectionRef,
    resultBearing: binding.resultBearing
  });
}

export function assertCompiledFanInReductionBinding(
  binding: CompiledFanInReductionBinding
): void {
  const digest = stableSha256Digest(fanInBindingBasis(binding));
  if (
    binding.kind !== "compiled_fan_in_reduction_binding" ||
    binding.bindingDigest !== digest ||
    binding.bindingRef !==
      `abg://hof/fan-in/binding/${digest.slice("sha256:".length)}` ||
    binding.resultBearing !== true
  ) {
    throw new TypeError("compiled HOF fan-in binding identity is invalid");
  }
}

export function compileFanInReductionBinding(input: {
  readonly module: Module;
  readonly relation: CompiledFanInApplicationRelation;
  readonly executionHandoff: ExecutionHandoffCarrier;
}): CompiledFanInReductionBinding {
  const executionSubject = exactGraphFunction({
    module: input.module,
    ref: input.relation.executionSubjectGraphFunctionRef,
    label: "fan-in execution subject"
  });
  const reducer = exactGraphFunction({
    module: input.module,
    ref: input.relation.reducerGraphFunctionRef,
    label: "fan-in reducer"
  });
  const recompiled = compileGraphFunctionApplication({
    graphFunction: executionSubject,
    graphFunctions: input.module.graphFunctions
  });
  if (
    !recompiled.accepted ||
    recompiled.fanInRelation === null ||
    !stableJsonEquals(recompiled.fanInRelation, input.relation)
  ) {
    throw new TypeError(
      "fan-in structural relation must recompile exactly inside the selected Module"
    );
  }
  const execution = exactExecutionHandoff({
    module: input.module,
    handoff: input.executionHandoff,
    label: "fan-in reducer"
  });
  const handoff = execution.view;
  if (
    handoff.executionSubjectGraphFunctionRef !== executionSubject.id ||
    handoff.applicationRelation === null ||
    !stableJsonEquals(handoff.applicationRelation, input.relation)
  ) {
    throw new TypeError(
      "fan-in execution handoff must preserve the exact application relation"
    );
  }
  const reducerVector = exactGraphVector({
    graphFunction: reducer,
    ref: handoff.graphVectorRef,
    label: "fan-in reducer GraphVector"
  });
  if (!stableJsonEquals(reducerVector, execution.vector)) {
    throw new TypeError(
      "fan-in reducer must retain the exact execution GraphVector"
    );
  }
  const stage = execution.stage;
  const basis = fanInBindingBasis(Object.freeze({
    kind: "compiled_fan_in_reduction_binding" as const,
    relationRef: input.relation.relationRef,
    relationDigest: input.relation.relationDigest,
    moduleName: input.module.name,
    moduleDigest: stableSha256Digest(input.module),
    executionSubjectGraphFunctionRef: executionSubject.id,
    executionSubjectGraphFunctionDigest: stableSha256Digest(executionSubject),
    reducerGraphFunctionRef: reducer.id,
    reducerGraphFunctionDigest: stableSha256Digest(reducer),
    reducerGraphVectorRef: reducerVector.id,
    reducerProgramBindingDigest: handoff.programBindingDigest,
    reducerProgramRef: handoff.programRef,
    inputVectorNodeRef: input.relation.inputVectorNodeRef,
    inputVectorContractKey: input.relation.inputVectorContractKey,
    outputNodeRef: input.relation.outputNodeRef,
    outputContractKey: input.relation.outputContractKey,
    applicationLineageRef: input.relation.applicationLineageRef,
    stageRole: stage.stageRole,
    regime: stage.defaultRegime,
    armId: stage.armId,
    compositionRef: handoff.compositionRef,
    compositionSelectionRef: handoff.compositionSelectionRef,
    resultBearing: true as const
  }));
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bindingRef:
      `abg://hof/fan-in/binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}
