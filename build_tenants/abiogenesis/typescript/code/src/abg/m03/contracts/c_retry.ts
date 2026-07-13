// Implements: T-261; REQ-L-GTL3-C-ALGEBRA-008/-016;
// REQ-R-ABG3-CCALL-009. This module binds one direct root C.retry program to
// one exact selected-Module locus and projects the immutable runtime plan.

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
  RuntimeFailureClass,
  RuntimeRegime
} from "./carriers.js";
import {
  assertCRetryPolicyProjection,
  deriveCRetryPolicyProjection,
  type CRetryPolicyProjection
} from "./c_retry_policy.js";
import type {
  AbgFnCompositionSelection,
  AbgFnComputeStageRole
} from "./fn_composition.js";
import type { CompiledGraphVectorCProgramBinding } from "./graph_vector_c_program_compiler.js";
import {
  isHogRetryProgram,
  type HogRetryProgramDeclaration
} from "./hog_program.js";

export interface CompiledCRetryBinding {
  readonly kind: "compiled_c_retry_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly programBindingDigest: `sha256:${string}`;
  readonly programRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly compositionOwnerGraphFunctionRef: string;
  readonly compositionOwnerGraphFunctionDigest: `sha256:${string}`;
  readonly graphVectorRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly compositionStageRole: AbgFnComputeStageRole;
  readonly compositionRef: string;
  readonly compositionSelectionRef: string;
  readonly armId: string;
  readonly resultBearing: true;
  readonly instructionCategoryRefs: readonly string[];
  readonly maxAttempts: number;
  readonly retryPolicyRef: string;
  readonly retryPolicyDigest: `sha256:${string}`;
}

export interface CompileCRetryBindingInput {
  readonly module: Module;
  readonly graphFunction: GraphFunction;
  readonly compositionOwnerGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly program: HogRetryProgramDeclaration;
  readonly composition: AbgFnCompositionSelection;
}

export interface CompiledCRetryPlan {
  readonly kind: "compiled_c_retry_plan";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly programRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly stageRole: string;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly resultBearing: true;
  readonly instructionCategoryRefs: readonly string[];
  readonly compositionRef: string;
  readonly maxAttempts: number;
  readonly retryPolicyRef: string;
  readonly retryPolicyDigest: `sha256:${string}`;
  readonly retryableFailureClasses: readonly RuntimeFailureClass[];
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return value;
}

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function bindingBasis(binding: Omit<
  CompiledCRetryBinding,
  "bindingRef" | "bindingDigest"
>) {
  return Object.freeze({
    kind: binding.kind,
    programBindingDigest: binding.programBindingDigest,
    programRef: binding.programRef,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    graphFunctionRef: binding.graphFunctionRef,
    graphFunctionDigest: binding.graphFunctionDigest,
    compositionOwnerGraphFunctionRef:
      binding.compositionOwnerGraphFunctionRef,
    compositionOwnerGraphFunctionDigest:
      binding.compositionOwnerGraphFunctionDigest,
    graphVectorRef: binding.graphVectorRef,
    inputCarrierRef: binding.inputCarrierRef,
    outputCarrierRef: binding.outputCarrierRef,
    stageRole: binding.stageRole,
    regime: binding.regime,
    compositionStageRole: binding.compositionStageRole,
    compositionRef: binding.compositionRef,
    compositionSelectionRef: binding.compositionSelectionRef,
    armId: binding.armId,
    resultBearing: binding.resultBearing,
    instructionCategoryRefs: Object.freeze([
      ...binding.instructionCategoryRefs
    ]),
    maxAttempts: binding.maxAttempts,
    retryPolicyRef: binding.retryPolicyRef,
    retryPolicyDigest: binding.retryPolicyDigest
  });
}

export function assertCompiledCRetryBinding(
  binding: CompiledCRetryBinding
): void {
  const digest = stableSha256Digest(bindingBasis(binding));
  const policy = deriveCRetryPolicyProjection();
  if (
    binding.kind !== "compiled_c_retry_binding" ||
    binding.bindingDigest !== digest ||
    binding.bindingRef !==
      `abg://c-retry-binding/${digest.slice("sha256:".length)}` ||
    binding.resultBearing !== true ||
    binding.retryPolicyRef !== policy.policyRef ||
    binding.retryPolicyDigest !== policy.policyDigest
  ) {
    throw new TypeError("compiled C.retry binding identity is invalid");
  }
  positiveInteger(binding.maxAttempts, "C.retry maxAttempts");
}

function exactGraphFunction(input: {
  readonly module: Module;
  readonly graphFunction: GraphFunction;
  readonly label: string;
}): void {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.graphFunction.id
  );
  if (
    matches.length !== 1 ||
    !stableJsonEquals(matches[0], input.graphFunction)
  ) {
    throw new TypeError(
      `${input.label} must occur exactly once and byte-equivalent in the selected Module`
    );
  }
}

function exactVector(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly label: string;
}): void {
  if (input.graphFunction.template.kind !== "inline_graph") {
    throw new TypeError(`${input.label} must contain an inline Graph`);
  }
  const matches = input.graphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.graphVector.id
  );
  if (
    matches.length !== 1 ||
    !stableJsonEquals(matches[0], input.graphVector)
  ) {
    throw new TypeError(
      `${input.label} must retain one exact bound GraphVector`
    );
  }
}

function exactCompositionRegime(input: CompileCRetryBindingInput) {
  const host = input.composition.contract.host;
  if (
    host.graphFunctionRef !== input.compositionOwnerGraphFunction.id ||
    host.graphVectorRef !== input.graphVector.id ||
    !stableJsonEquals(
      host.sourceNodeRefs,
      input.graphVector.source.map((node) => node.id)
    ) ||
    host.targetNodeRef !== input.graphVector.target.id
  ) {
    throw new TypeError(
      "C.retry composition selection must bind the exact owner and GraphVector"
    );
  }
  const regimes = input.composition.contract.regimes;
  const regime = regimes[0];
  if (regimes.length !== 1 || regime === undefined) {
    throw new TypeError(
      `direct C.retry requires one composition regime; got ${String(regimes.length)}`
    );
  }
  if (
    regime.regime !== input.program.retry.stage.defaultRegime ||
    !stableJsonEquals(
      regime.inputCarrierRefs,
      input.graphVector.source.map((node) => node.id)
    ) ||
    !stableJsonEquals(regime.outputCarrierRefs, [input.graphVector.target.id])
  ) {
    throw new TypeError(
      "C.retry composition regime must preserve the authored fibre and vector boundary"
    );
  }
  return regime;
}

export function compileCRetryBinding(
  input: CompileCRetryBindingInput
): CompiledCRetryBinding {
  if (!isHogRetryProgram(input.program)) {
    throw new TypeError("C.retry binding compiler requires a retry program");
  }
  exactGraphFunction({
    module: input.module,
    graphFunction: input.graphFunction,
    label: "C.retry GraphFunction"
  });
  exactVector({
    graphFunction: input.graphFunction,
    graphVector: input.graphVector,
    label: "C.retry GraphFunction"
  });
  exactGraphFunction({
    module: input.module,
    graphFunction: input.compositionOwnerGraphFunction,
    label: "C.retry composition owner"
  });
  exactVector({
    graphFunction: input.compositionOwnerGraphFunction,
    graphVector: input.graphVector,
    label: "C.retry composition owner"
  });

  const retry = input.program.retry;
  const policy: CRetryPolicyProjection = deriveCRetryPolicyProjection();
  assertCRetryPolicyProjection(policy);
  if (
    retry.retryPolicyRef !== policy.policyRef ||
    retry.retryPolicyDigest !== policy.policyDigest
  ) {
    throw new TypeError("C.retry normalized policy differs from shared authority");
  }
  if (
    input.programBinding.hostGraphFunctionRef !== input.graphFunction.id ||
    input.programBinding.graphVectorRef !== input.graphVector.id ||
    input.programBinding.selectedProgramRef !== input.program.programRef ||
    input.programBinding.programInputCarrierRef !== retry.inputCarrierRef ||
    input.programBinding.programOutputCarrierRef !== retry.outputCarrierRef
  ) {
    throw new TypeError(
      "C.retry normalized program must equal the selected vector/program binding"
    );
  }
  const expectedInput = cInterfaceContractRef(input.graphVector.source);
  const expectedOutput = cInterfaceContractRef([input.graphVector.target]);
  if (
    retry.inputCarrierRef !== expectedInput ||
    retry.outputCarrierRef !== expectedOutput ||
    retry.stage.resultBearing !== true
  ) {
    throw new TypeError(
      "C.retry stage and carrier pair must equal the exact GraphVector boundary"
    );
  }
  const regime = exactCompositionRegime(input);
  const basis = bindingBasis(Object.freeze({
    kind: "compiled_c_retry_binding" as const,
    programBindingDigest: input.programBinding.bindingDigest,
    programRef: input.program.programRef,
    moduleName: input.module.name,
    moduleDigest: stableSha256Digest(input.module),
    graphFunctionRef: input.graphFunction.id,
    graphFunctionDigest: stableSha256Digest(input.graphFunction),
    compositionOwnerGraphFunctionRef:
      input.compositionOwnerGraphFunction.id,
    compositionOwnerGraphFunctionDigest:
      stableSha256Digest(input.compositionOwnerGraphFunction),
    graphVectorRef: input.graphVector.id,
    inputCarrierRef: retry.inputCarrierRef,
    outputCarrierRef: retry.outputCarrierRef,
    stageRole: retry.stage.stageRole,
    regime: retry.stage.defaultRegime,
    compositionStageRole: regime.stageRole,
    compositionRef: input.composition.contract.contractRef,
    compositionSelectionRef: input.composition.selectionRef,
    armId: retry.stage.armId,
    resultBearing: true as const,
    instructionCategoryRefs: Object.freeze([
      ...(retry.stage.instructionCategoryRefs ?? [])
    ]),
    maxAttempts: positiveInteger(retry.maxAttempts, "C.retry maxAttempts"),
    retryPolicyRef: policy.policyRef,
    retryPolicyDigest: policy.policyDigest
  }));
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bindingRef: `abg://c-retry-binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}

function planBasis(plan: Omit<CompiledCRetryPlan, "planRef" | "planDigest">) {
  return Object.freeze({
    kind: plan.kind,
    bindingRef: plan.bindingRef,
    bindingDigest: plan.bindingDigest,
    selectedCatalogEntryRef: plan.selectedCatalogEntryRef,
    moduleName: plan.moduleName,
    moduleDigest: plan.moduleDigest,
    graphFunctionRef: plan.graphFunctionRef,
    graphVectorRef: plan.graphVectorRef,
    programRef: plan.programRef,
    inputCarrierRef: plan.inputCarrierRef,
    outputCarrierRef: plan.outputCarrierRef,
    stageRole: plan.stageRole,
    regime: plan.regime,
    armId: plan.armId,
    resultBearing: plan.resultBearing,
    instructionCategoryRefs: Object.freeze([...plan.instructionCategoryRefs]),
    compositionRef: plan.compositionRef,
    maxAttempts: plan.maxAttempts,
    retryPolicyRef: plan.retryPolicyRef,
    retryPolicyDigest: plan.retryPolicyDigest,
    retryableFailureClasses: Object.freeze([...plan.retryableFailureClasses])
  });
}

export function compileCRetryPlan(input: {
  readonly binding: CompiledCRetryBinding;
  readonly selectedCatalogEntryRef: string;
}): CompiledCRetryPlan {
  assertCompiledCRetryBinding(input.binding);
  const selectedCatalogEntryRef = nonEmpty(
    input.selectedCatalogEntryRef,
    "selectedCatalogEntryRef"
  );
  const policy = deriveCRetryPolicyProjection();
  const basis = planBasis(Object.freeze({
    kind: "compiled_c_retry_plan" as const,
    bindingRef: input.binding.bindingRef,
    bindingDigest: input.binding.bindingDigest,
    selectedCatalogEntryRef,
    moduleName: input.binding.moduleName,
    moduleDigest: input.binding.moduleDigest,
    graphFunctionRef: input.binding.graphFunctionRef,
    graphVectorRef: input.binding.graphVectorRef,
    programRef: input.binding.programRef,
    inputCarrierRef: input.binding.inputCarrierRef,
    outputCarrierRef: input.binding.outputCarrierRef,
    stageRole: input.binding.stageRole,
    regime: input.binding.regime,
    armId: input.binding.armId,
    resultBearing: true as const,
    instructionCategoryRefs: Object.freeze([
      ...input.binding.instructionCategoryRefs
    ]),
    compositionRef: input.binding.compositionRef,
    maxAttempts: input.binding.maxAttempts,
    retryPolicyRef: policy.policyRef,
    retryPolicyDigest: policy.policyDigest,
    retryableFailureClasses: Object.freeze([
      ...policy.retryableFailureClasses
    ])
  }));
  const planDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    planRef: `abg://c-retry-plan/${planDigest.slice("sha256:".length)}`,
    planDigest
  });
}

export function assertCompiledCRetryPlan(plan: CompiledCRetryPlan): void {
  const digest = stableSha256Digest(planBasis(plan));
  const policy = deriveCRetryPolicyProjection();
  if (
    plan.kind !== "compiled_c_retry_plan" ||
    plan.planDigest !== digest ||
    plan.planRef !== `abg://c-retry-plan/${digest.slice("sha256:".length)}` ||
    plan.resultBearing !== true ||
    plan.retryPolicyRef !== policy.policyRef ||
    plan.retryPolicyDigest !== policy.policyDigest ||
    !stableJsonEquals(
      plan.retryableFailureClasses,
      policy.retryableFailureClasses
    )
  ) {
    throw new TypeError("compiled C.retry plan identity is invalid");
  }
  positiveInteger(plan.maxAttempts, "C.retry maxAttempts");
}
