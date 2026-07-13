// Implements: T-259; REQ-L-GTL3-C-ALGEBRA-006/-014/-016;
// REQ-R-ABG3-CCALL-013. This compiler binds one direct workflow.C program to
// one exact module-contained child. It does not authorize traversal.

import {
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
import type {
  AbgFnCompositionSelection,
  AbgFnComputeStageRole
} from "./fn_composition.js";
import type { CompiledGraphVectorCProgramBinding } from "./graph_vector_c_program_compiler.js";
import {
  isHogWorkflowProgram,
  type HogWorkflowProgramDeclaration
} from "./hog_program.js";
import type { RuntimeRegime } from "./carriers.js";

export interface CompiledWorkflowLiftBinding {
  readonly kind: "compiled_workflow_lift_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly programBindingDigest: `sha256:${string}`;
  readonly programRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphFunctionDigest: `sha256:${string}`;
  readonly compositionOwnerGraphFunctionRef: string;
  readonly compositionOwnerGraphFunctionDigest: `sha256:${string}`;
  readonly parentGraphVectorRef: string;
  readonly childAuthoredRef: string;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly childOuterContractRef: null;
  readonly childWireContractCertified: false;
  readonly stageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly compositionRef: string;
  readonly compositionSelectionRef: string;
  readonly armId: string;
  readonly resultBearing: true;
}

export interface CompileWorkflowLiftBindingInput {
  readonly module: Module;
  readonly parentGraphFunction: GraphFunction;
  readonly compositionOwnerGraphFunction: GraphFunction;
  readonly parentGraphVector: GraphVector;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly program: HogWorkflowProgramDeclaration;
  readonly composition: AbgFnCompositionSelection;
}

function workflowBindingBasis(binding: Omit<
  CompiledWorkflowLiftBinding,
  "bindingRef" | "bindingDigest"
>) {
  return Object.freeze({
    kind: binding.kind,
    programBindingDigest: binding.programBindingDigest,
    programRef: binding.programRef,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    parentGraphFunctionRef: binding.parentGraphFunctionRef,
    parentGraphFunctionDigest: binding.parentGraphFunctionDigest,
    compositionOwnerGraphFunctionRef:
      binding.compositionOwnerGraphFunctionRef,
    compositionOwnerGraphFunctionDigest:
      binding.compositionOwnerGraphFunctionDigest,
    parentGraphVectorRef: binding.parentGraphVectorRef,
    childAuthoredRef: binding.childAuthoredRef,
    childGraphFunctionRef: binding.childGraphFunctionRef,
    childGraphFunctionDigest: binding.childGraphFunctionDigest,
    inputCarrierRef: binding.inputCarrierRef,
    outputCarrierRef: binding.outputCarrierRef,
    childOuterContractRef: binding.childOuterContractRef,
    childWireContractCertified: binding.childWireContractCertified,
    stageRole: binding.stageRole,
    regime: binding.regime,
    compositionRef: binding.compositionRef,
    compositionSelectionRef: binding.compositionSelectionRef,
    armId: binding.armId,
    resultBearing: binding.resultBearing
  });
}

export function assertCompiledWorkflowLiftBinding(
  binding: CompiledWorkflowLiftBinding
): void {
  const digest = stableSha256Digest(workflowBindingBasis(binding));
  if (
    binding.kind !== "compiled_workflow_lift_binding" ||
    binding.bindingDigest !== digest ||
    binding.bindingRef !==
      `abg://workflow-c-binding/${digest.slice("sha256:".length)}` ||
    binding.childOuterContractRef !== null ||
    binding.childWireContractCertified !== false ||
    binding.resultBearing !== true ||
    binding.armId !== binding.childGraphFunctionRef
  ) {
    throw new TypeError("compiled workflow.C binding identity is invalid");
  }
}

function exactContainedGraphFunction(input: {
  readonly module: Module;
  readonly ref: string;
}): GraphFunction {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.ref || candidate.name === input.ref
  );
  const child = matches[0];
  if (matches.length !== 1 || child === undefined) {
    throw new TypeError(
      `workflow.C child ${JSON.stringify(input.ref)} must resolve exactly once ` +
        `inside Module ${JSON.stringify(input.module.name)}; got ${String(matches.length)}`
    );
  }
  return child;
}

function assertExactParent(input: CompileWorkflowLiftBindingInput): void {
  const parentMatches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.parentGraphFunction.id
  );
  if (
    parentMatches.length !== 1 ||
    !stableJsonEquals(parentMatches[0], input.parentGraphFunction)
  ) {
    throw new TypeError(
      "workflow.C parent GraphFunction must occur exactly once and byte-equivalent in the selected Module"
    );
  }
  if (input.parentGraphFunction.template.kind !== "inline_graph") {
    throw new TypeError("workflow.C parent GraphFunction must contain an inline Graph");
  }
  const vectorMatches = input.parentGraphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.parentGraphVector.id
  );
  if (
    vectorMatches.length !== 1 ||
    !stableJsonEquals(vectorMatches[0], input.parentGraphVector)
  ) {
    throw new TypeError(
      "workflow.C parent GraphVector must occur exactly once and byte-equivalent in its parent GraphFunction"
    );
  }
}

function assertExactCompositionOwner(
  input: CompileWorkflowLiftBindingInput
): void {
  const ownerMatches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.compositionOwnerGraphFunction.id
  );
  if (
    ownerMatches.length !== 1 ||
    !stableJsonEquals(ownerMatches[0], input.compositionOwnerGraphFunction)
  ) {
    throw new TypeError(
      "workflow.C composition owner must occur exactly once and byte-equivalent in the selected Module"
    );
  }
  if (input.compositionOwnerGraphFunction.template.kind !== "inline_graph") {
    throw new TypeError(
      "workflow.C composition owner must contain an inline Graph"
    );
  }
  const vectorMatches =
    input.compositionOwnerGraphFunction.template.graph.vectors.filter(
      (candidate) => candidate.id === input.parentGraphVector.id
    );
  if (
    vectorMatches.length !== 1 ||
    !stableJsonEquals(vectorMatches[0], input.parentGraphVector)
  ) {
    throw new TypeError(
      "workflow.C parent GraphVector must remain byte-equivalent at its composition owner"
    );
  }
}

function assertProgramBinding(input: CompileWorkflowLiftBindingInput): void {
  if (
    input.programBinding.hostGraphFunctionRef !== input.parentGraphFunction.id ||
    input.programBinding.graphVectorRef !== input.parentGraphVector.id ||
    input.programBinding.selectedProgramRef !== input.program.programRef ||
    input.programBinding.programInputCarrierRef !==
      input.program.workflow.inputCarrierRef ||
    input.programBinding.programOutputCarrierRef !==
      input.program.workflow.outputCarrierRef
  ) {
    throw new TypeError(
      "workflow.C normalized program must equal the exact selected parent vector/program binding"
    );
  }
}

function exactCompositionRegime(input: CompileWorkflowLiftBindingInput) {
  const host = input.composition.contract.host;
  if (
    host.graphFunctionRef !== input.compositionOwnerGraphFunction.id ||
    host.graphVectorRef !== input.parentGraphVector.id ||
    !stableJsonEquals(
      host.sourceNodeRefs,
      input.parentGraphVector.source.map((node) => node.id)
    ) ||
    host.targetNodeRef !== input.parentGraphVector.target.id
  ) {
    throw new TypeError(
      "workflow.C composition selection must bind the exact parent GraphFunction and GraphVector"
    );
  }
  const regimes = input.composition.contract.regimes;
  const regime = regimes[0];
  if (regimes.length !== 1 || regime === undefined) {
    throw new TypeError(
      `workflow.C direct program requires one declared composition regime; got ${String(regimes.length)}`
    );
  }
  if (
    !stableJsonEquals(
      regime.inputCarrierRefs,
      input.parentGraphVector.source.map((node) => node.id)
    ) ||
    !stableJsonEquals(regime.outputCarrierRefs, [input.parentGraphVector.target.id])
  ) {
    throw new TypeError(
      "workflow.C composition regime carriers must equal the exact parent vector boundary"
    );
  }
  return regime;
}

export function compileWorkflowLiftBinding(
  input: CompileWorkflowLiftBindingInput
): CompiledWorkflowLiftBinding {
  if (!isHogWorkflowProgram(input.program)) {
    throw new TypeError("workflow.C binding compiler requires a workflow program");
  }
  assertExactParent(input);
  assertExactCompositionOwner(input);
  assertProgramBinding(input);

  const child = exactContainedGraphFunction({
    module: input.module,
    ref: input.program.workflow.graphFunctionRef
  });
  if (child.id === input.parentGraphFunction.id) {
    throw new TypeError(
      "workflow.C direct child must differ from its parent; recursion requires its own admitted runtime"
    );
  }
  const uncoveredChildEffects = child.effects.filter(
    (effectRef) => !input.parentGraphFunction.effects.includes(effectRef)
  );
  if (uncoveredChildEffects.length > 0) {
    throw new TypeError(
      `workflow.C child effects must be declared by the public parent: ${JSON.stringify(uncoveredChildEffects)}`
    );
  }
  const parentInputCarrierRef = cInterfaceContractRef(
    input.parentGraphVector.source
  );
  const parentOutputCarrierRef = cInterfaceContractRef([
    input.parentGraphVector.target
  ]);
  if (
    parentInputCarrierRef !== input.program.workflow.inputCarrierRef ||
    parentOutputCarrierRef !== input.program.workflow.outputCarrierRef
  ) {
    throw new TypeError(
      "workflow.C carrier pair must equal the exact parent GraphVector boundary"
    );
  }
  if (
    cInterfaceContractRef(child.inputs) !== input.program.workflow.inputCarrierRef ||
    cInterfaceContractRef(child.outputs) !== input.program.workflow.outputCarrierRef
  ) {
    throw new TypeError(
      "workflow.C child internal Node interfaces must preserve the authored carrier pair"
    );
  }
  const regime = exactCompositionRegime(input);
  const moduleDigest = stableSha256Digest(input.module);
  const bindingBasis = workflowBindingBasis(Object.freeze({
    kind: "compiled_workflow_lift_binding" as const,
    programBindingDigest: input.programBinding.bindingDigest,
    programRef: input.program.programRef,
    moduleName: input.module.name,
    moduleDigest,
    parentGraphFunctionRef: input.parentGraphFunction.id,
    parentGraphFunctionDigest: stableSha256Digest(input.parentGraphFunction),
    compositionOwnerGraphFunctionRef:
      input.compositionOwnerGraphFunction.id,
    compositionOwnerGraphFunctionDigest:
      stableSha256Digest(input.compositionOwnerGraphFunction),
    parentGraphVectorRef: input.parentGraphVector.id,
    childAuthoredRef: input.program.workflow.graphFunctionRef,
    childGraphFunctionRef: child.id,
    childGraphFunctionDigest: stableSha256Digest(child),
    inputCarrierRef: input.program.workflow.inputCarrierRef,
    outputCarrierRef: input.program.workflow.outputCarrierRef,
    childOuterContractRef: null,
    childWireContractCertified: false as const,
    stageRole: regime.stageRole,
    regime: regime.regime,
    compositionRef: input.composition.contract.contractRef,
    compositionSelectionRef: input.composition.selectionRef,
    armId: child.id,
    resultBearing: true as const
  }));
  const bindingDigest = stableSha256Digest(bindingBasis);
  return Object.freeze({
    ...bindingBasis,
    bindingRef: `abg://workflow-c-binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}
