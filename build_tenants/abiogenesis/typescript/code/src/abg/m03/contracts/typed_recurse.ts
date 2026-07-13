// Implements: T-262; REQ-L-GTL3-RECURSE-001..008;
// REQ-R-ABG3-FRAME-001..006. This module joins one direct recurse
// declaration, one selected-Module locus, and one admitted positive policy.

import {
  cInterfaceContractRef
} from "../../../gtl/m01/algebra/c_algebra.js";
import type {
  GraphFunction
} from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  detachRowSnapshot,
  isPlainRecord
} from "./admission_hygiene.js";
import {
  compileGraphFunctionApplication,
  type CompiledRecurseApplicationRelation
} from "./graph_function_application_compiler.js";

export interface AdmittedTypedRecursePolicy {
  readonly kind: "admitted_typed_recurse_policy";
  readonly policyRef: string;
  readonly policyVersion: string;
  readonly sourceInputCarrierRef: string;
  readonly sourceInputPayloadRef: string;
  readonly budgetSourceFieldRef: string;
  readonly maxApplications: number;
  readonly evidenceRefs: readonly string[];
  readonly policyDigest: `sha256:${string}`;
}

export interface CompiledTypedRecurseBinding {
  readonly kind: "compiled_typed_recurse_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly wrapperGraphFunctionRef: string;
  readonly wrapperGraphFunctionDigest: `sha256:${string}`;
  readonly operandGraphFunctionRef: string;
  readonly operandGraphFunctionDigest: `sha256:${string}`;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly applicationRef: string;
  readonly applicationRelationRef: string;
  readonly applicationRelationDigest: `sha256:${string}`;
  readonly applicationLineageRef: string;
  readonly applicationLineageDigest: `sha256:${string}`;
  readonly terminationEvaluatorBinding: string;
  readonly terminationEvaluatorDigest: `sha256:${string}`;
  readonly terminationConsumedFieldRefs: readonly string[];
  readonly foldbackMode: "rebind";
  readonly foldbackBinding: string;
  readonly foldbackRequiresParentEvaluation: true;
  readonly foldbackAdditionalDigest: `sha256:${string}`;
}

export interface CompiledTypedRecursePlan {
  readonly kind: "compiled_typed_recurse_plan";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly wrapperGraphFunctionRef: string;
  readonly operandGraphFunctionRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly applicationRef: string;
  readonly applicationRelationRef: string;
  readonly applicationLineageRef: string;
  readonly terminationEvaluatorBinding: string;
  readonly terminationEvaluatorDigest: `sha256:${string}`;
  readonly terminationConsumedFieldRefs: readonly string[];
  readonly foldbackMode: "rebind";
  readonly foldbackBinding: string;
  readonly foldbackRequiresParentEvaluation: true;
  readonly foldbackAdditionalDigest: `sha256:${string}`;
  readonly policyRef: string;
  readonly policyVersion: string;
  readonly policyDigest: `sha256:${string}`;
  readonly sourceInputPayloadRef: string;
  readonly budgetSourceFieldRef: string;
  readonly maxApplications: number;
  readonly policyEvidenceRefs: readonly string[];
}

const POLICY_KEYS = Object.freeze([
  "kind",
  "policyRef",
  "policyVersion",
  "sourceInputCarrierRef",
  "sourceInputPayloadRef",
  "budgetSourceFieldRef",
  "maxApplications",
  "evidenceRefs"
]);

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return value;
}

function admittedStrings(value: unknown, label: string): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(
      (entry): entry is string =>
        typeof entry === "string" && entry.length > 0
    ) ||
    new Set(value).size !== value.length
  ) {
    throw new TypeError(`${label} must contain unique non-empty strings`);
  }
  return Object.freeze([...value]);
}

function exactCarrierKeys(
  value: object,
  expected: readonly string[],
  label: string
): void {
  const actual = Object.keys(value).sort();
  if (!stableJsonEquals(actual, [...expected].sort())) {
    throw new TypeError(
      `${label} has a non-canonical key set: ${JSON.stringify(actual)}`
    );
  }
}

function policyBasis(
  policy: Omit<AdmittedTypedRecursePolicy, "policyDigest">
) {
  return Object.freeze({
    kind: policy.kind,
    policyRef: policy.policyRef,
    policyVersion: policy.policyVersion,
    sourceInputCarrierRef: policy.sourceInputCarrierRef,
    sourceInputPayloadRef: policy.sourceInputPayloadRef,
    budgetSourceFieldRef: policy.budgetSourceFieldRef,
    maxApplications: policy.maxApplications,
    evidenceRefs: Object.freeze([...policy.evidenceRefs])
  });
}

export function admitTypedRecursePolicy(
  raw: unknown
): AdmittedTypedRecursePolicy {
  const detached = detachRowSnapshot(raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("typed recurse policy must be detached plain data");
  }
  const actualKeys = Object.keys(detached).sort();
  const expectedKeys = [...POLICY_KEYS].sort();
  if (!stableJsonEquals(actualKeys, expectedKeys)) {
    throw new TypeError(
      `typed recurse policy has a non-canonical key set: ${JSON.stringify(actualKeys)}`
    );
  }
  if (detached["kind"] !== "typed_recurse_policy") {
    throw new TypeError("typed recurse policy kind is invalid");
  }
  const basis = policyBasis(Object.freeze({
    kind: "admitted_typed_recurse_policy" as const,
    policyRef: nonEmpty(detached["policyRef"], "policyRef"),
    policyVersion: nonEmpty(detached["policyVersion"], "policyVersion"),
    sourceInputCarrierRef: nonEmpty(
      detached["sourceInputCarrierRef"],
      "sourceInputCarrierRef"
    ),
    sourceInputPayloadRef: nonEmpty(
      detached["sourceInputPayloadRef"],
      "sourceInputPayloadRef"
    ),
    budgetSourceFieldRef: nonEmpty(
      detached["budgetSourceFieldRef"],
      "budgetSourceFieldRef"
    ),
    maxApplications: positiveInteger(
      detached["maxApplications"],
      "maxApplications"
    ),
    evidenceRefs: admittedStrings(detached["evidenceRefs"], "evidenceRefs")
  }));
  return Object.freeze({
    ...basis,
    policyDigest: stableSha256Digest(basis)
  });
}

export function assertAdmittedTypedRecursePolicy(
  policy: AdmittedTypedRecursePolicy
): void {
  const basis = policyBasis(policy);
  exactCarrierKeys(
    policy,
    [...Object.keys(basis), "policyDigest"],
    "admitted typed recurse policy"
  );
  if (
    policy.kind !== "admitted_typed_recurse_policy" ||
    policy.policyDigest !== stableSha256Digest(basis)
  ) {
    throw new TypeError("admitted typed recurse policy identity is invalid");
  }
  nonEmpty(policy.policyRef, "policyRef");
  nonEmpty(policy.policyVersion, "policyVersion");
  nonEmpty(policy.sourceInputCarrierRef, "sourceInputCarrierRef");
  nonEmpty(policy.sourceInputPayloadRef, "sourceInputPayloadRef");
  nonEmpty(policy.budgetSourceFieldRef, "budgetSourceFieldRef");
  positiveInteger(policy.maxApplications, "maxApplications");
  admittedStrings(policy.evidenceRefs, "evidenceRefs");
}

function exactGraphFunction(input: {
  readonly module: Module;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly label: string;
}): GraphFunction {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.graphFunctionRef
  );
  const graphFunction = matches[0];
  if (
    matches.length !== 1 ||
    graphFunction === undefined ||
    stableSha256Digest(graphFunction) !== input.graphFunctionDigest
  ) {
    throw new TypeError(`${input.label} differs in the selected Module`);
  }
  return graphFunction;
}

function bindingBasis(
  binding: Omit<
    CompiledTypedRecurseBinding,
    "bindingRef" | "bindingDigest"
  >
) {
  return Object.freeze({
    kind: binding.kind,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    wrapperGraphFunctionRef: binding.wrapperGraphFunctionRef,
    wrapperGraphFunctionDigest: binding.wrapperGraphFunctionDigest,
    operandGraphFunctionRef: binding.operandGraphFunctionRef,
    operandGraphFunctionDigest: binding.operandGraphFunctionDigest,
    inputCarrierRef: binding.inputCarrierRef,
    outputCarrierRef: binding.outputCarrierRef,
    applicationRef: binding.applicationRef,
    applicationRelationRef: binding.applicationRelationRef,
    applicationRelationDigest: binding.applicationRelationDigest,
    applicationLineageRef: binding.applicationLineageRef,
    applicationLineageDigest: binding.applicationLineageDigest,
    terminationEvaluatorBinding: binding.terminationEvaluatorBinding,
    terminationEvaluatorDigest: binding.terminationEvaluatorDigest,
    terminationConsumedFieldRefs: Object.freeze([
      ...binding.terminationConsumedFieldRefs
    ]),
    foldbackMode: binding.foldbackMode,
    foldbackBinding: binding.foldbackBinding,
    foldbackRequiresParentEvaluation:
      binding.foldbackRequiresParentEvaluation,
    foldbackAdditionalDigest: binding.foldbackAdditionalDigest
  });
}

export function compileTypedRecurseBinding(input: {
  readonly module: Module;
  readonly graphFunction: GraphFunction;
  readonly relation: CompiledRecurseApplicationRelation;
}): CompiledTypedRecurseBinding {
  const wrapper = exactGraphFunction({
    module: input.module,
    graphFunctionRef: input.relation.executionSubjectGraphFunctionRef,
    graphFunctionDigest:
      input.relation.executionSubjectGraphFunctionDigest,
    label: "typed recurse wrapper"
  });
  if (!stableJsonEquals(wrapper, input.graphFunction)) {
    throw new TypeError(
      "typed recurse wrapper must be byte-equivalent to selected Module truth"
    );
  }
  exactGraphFunction({
    module: input.module,
    graphFunctionRef: input.relation.operandGraphFunctionRef,
    graphFunctionDigest: input.relation.operandGraphFunctionDigest,
    label: "typed recurse operand"
  });
  const recompiled = compileGraphFunctionApplication({
    graphFunction: wrapper,
    graphFunctions: input.module.graphFunctions
  });
  if (
    !recompiled.accepted ||
    recompiled.recurseRelation === null ||
    !stableJsonEquals(recompiled.recurseRelation, input.relation)
  ) {
    throw new TypeError(
      "typed recurse relation must recompile exactly inside the selected Module"
    );
  }
  const basis = bindingBasis(Object.freeze({
    kind: "compiled_typed_recurse_binding" as const,
    moduleName: input.module.name,
    moduleDigest: stableSha256Digest(input.module),
    wrapperGraphFunctionRef: wrapper.id,
    wrapperGraphFunctionDigest: stableSha256Digest(wrapper),
    operandGraphFunctionRef: input.relation.operandGraphFunctionRef,
    operandGraphFunctionDigest: input.relation.operandGraphFunctionDigest,
    inputCarrierRef: cInterfaceContractRef(wrapper.inputs),
    outputCarrierRef: cInterfaceContractRef(wrapper.outputs),
    applicationRef: input.relation.applicationRef,
    applicationRelationRef: input.relation.relationRef,
    applicationRelationDigest: input.relation.relationDigest,
    applicationLineageRef: input.relation.applicationLineageRef,
    applicationLineageDigest: input.relation.applicationLineageDigest,
    terminationEvaluatorBinding:
      input.relation.terminationEvaluatorBinding,
    terminationEvaluatorDigest:
      input.relation.terminationEvaluatorDigest,
    terminationConsumedFieldRefs: Object.freeze([
      ...input.relation.terminationConsumedFieldRefs
    ]),
    foldbackMode: input.relation.foldbackMode,
    foldbackBinding: input.relation.foldbackBinding,
    foldbackRequiresParentEvaluation:
      input.relation.foldbackRequiresParentEvaluation,
    foldbackAdditionalDigest:
      input.relation.foldbackAdditionalDigest
  }));
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bindingRef:
      `abg://typed-recurse/binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}

export function assertCompiledTypedRecurseBinding(
  binding: CompiledTypedRecurseBinding
): void {
  const basis = bindingBasis(binding);
  exactCarrierKeys(
    binding,
    [...Object.keys(basis), "bindingRef", "bindingDigest"],
    "compiled typed recurse binding"
  );
  const digest = stableSha256Digest(basis);
  if (
    binding.kind !== "compiled_typed_recurse_binding" ||
    binding.bindingDigest !== digest ||
    binding.bindingRef !==
      `abg://typed-recurse/binding/${digest.slice("sha256:".length)}` ||
    binding.foldbackMode !== "rebind" ||
    binding.foldbackRequiresParentEvaluation !== true
  ) {
    throw new TypeError("compiled typed recurse binding identity is invalid");
  }
}

function planBasis(
  plan: Omit<CompiledTypedRecursePlan, "planRef" | "planDigest">
) {
  return Object.freeze({
    kind: plan.kind,
    bindingRef: plan.bindingRef,
    bindingDigest: plan.bindingDigest,
    selectedCatalogEntryRef: plan.selectedCatalogEntryRef,
    moduleName: plan.moduleName,
    moduleDigest: plan.moduleDigest,
    wrapperGraphFunctionRef: plan.wrapperGraphFunctionRef,
    operandGraphFunctionRef: plan.operandGraphFunctionRef,
    inputCarrierRef: plan.inputCarrierRef,
    outputCarrierRef: plan.outputCarrierRef,
    applicationRef: plan.applicationRef,
    applicationRelationRef: plan.applicationRelationRef,
    applicationLineageRef: plan.applicationLineageRef,
    terminationEvaluatorBinding: plan.terminationEvaluatorBinding,
    terminationEvaluatorDigest: plan.terminationEvaluatorDigest,
    terminationConsumedFieldRefs: Object.freeze([
      ...plan.terminationConsumedFieldRefs
    ]),
    foldbackMode: plan.foldbackMode,
    foldbackBinding: plan.foldbackBinding,
    foldbackRequiresParentEvaluation:
      plan.foldbackRequiresParentEvaluation,
    foldbackAdditionalDigest: plan.foldbackAdditionalDigest,
    policyRef: plan.policyRef,
    policyVersion: plan.policyVersion,
    policyDigest: plan.policyDigest,
    sourceInputPayloadRef: plan.sourceInputPayloadRef,
    budgetSourceFieldRef: plan.budgetSourceFieldRef,
    maxApplications: plan.maxApplications,
    policyEvidenceRefs: Object.freeze([...plan.policyEvidenceRefs])
  });
}

export function compileTypedRecursePlan(input: {
  readonly binding: CompiledTypedRecurseBinding;
  readonly policy: AdmittedTypedRecursePolicy;
  readonly selectedCatalogEntryRef: string;
}): CompiledTypedRecursePlan {
  assertCompiledTypedRecurseBinding(input.binding);
  assertAdmittedTypedRecursePolicy(input.policy);
  const selectedCatalogEntryRef = nonEmpty(
    input.selectedCatalogEntryRef,
    "selectedCatalogEntryRef"
  );
  if (
    input.policy.sourceInputCarrierRef !== input.binding.inputCarrierRef
  ) {
    throw new TypeError(
      "typed recurse policy must bind the exact recursive input carrier"
    );
  }
  const basis = planBasis(Object.freeze({
    kind: "compiled_typed_recurse_plan" as const,
    bindingRef: input.binding.bindingRef,
    bindingDigest: input.binding.bindingDigest,
    selectedCatalogEntryRef,
    moduleName: input.binding.moduleName,
    moduleDigest: input.binding.moduleDigest,
    wrapperGraphFunctionRef: input.binding.wrapperGraphFunctionRef,
    operandGraphFunctionRef: input.binding.operandGraphFunctionRef,
    inputCarrierRef: input.binding.inputCarrierRef,
    outputCarrierRef: input.binding.outputCarrierRef,
    applicationRef: input.binding.applicationRef,
    applicationRelationRef: input.binding.applicationRelationRef,
    applicationLineageRef: input.binding.applicationLineageRef,
    terminationEvaluatorBinding:
      input.binding.terminationEvaluatorBinding,
    terminationEvaluatorDigest:
      input.binding.terminationEvaluatorDigest,
    terminationConsumedFieldRefs: Object.freeze([
      ...input.binding.terminationConsumedFieldRefs
    ]),
    foldbackMode: input.binding.foldbackMode,
    foldbackBinding: input.binding.foldbackBinding,
    foldbackRequiresParentEvaluation:
      input.binding.foldbackRequiresParentEvaluation,
    foldbackAdditionalDigest:
      input.binding.foldbackAdditionalDigest,
    policyRef: input.policy.policyRef,
    policyVersion: input.policy.policyVersion,
    policyDigest: input.policy.policyDigest,
    sourceInputPayloadRef: input.policy.sourceInputPayloadRef,
    budgetSourceFieldRef: input.policy.budgetSourceFieldRef,
    maxApplications: input.policy.maxApplications,
    policyEvidenceRefs: Object.freeze([...input.policy.evidenceRefs])
  }));
  const planDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    planRef:
      `abg://typed-recurse/plan/${planDigest.slice("sha256:".length)}`,
    planDigest
  });
}

export function assertCompiledTypedRecursePlan(
  plan: CompiledTypedRecursePlan
): void {
  const basis = planBasis(plan);
  exactCarrierKeys(
    plan,
    [...Object.keys(basis), "planRef", "planDigest"],
    "compiled typed recurse plan"
  );
  const digest = stableSha256Digest(basis);
  if (
    plan.kind !== "compiled_typed_recurse_plan" ||
    plan.planDigest !== digest ||
    plan.planRef !==
      `abg://typed-recurse/plan/${digest.slice("sha256:".length)}` ||
    plan.foldbackMode !== "rebind" ||
    plan.foldbackRequiresParentEvaluation !== true
  ) {
    throw new TypeError("compiled typed recurse plan identity is invalid");
  }
  positiveInteger(plan.maxApplications, "maxApplications");
  admittedStrings(plan.policyEvidenceRefs, "policyEvidenceRefs");
}
