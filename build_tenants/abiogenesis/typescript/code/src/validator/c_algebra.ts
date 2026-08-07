import {
  COMPUTE_REGIME_VALUES,
  C_TERM_KIND_VALUES,
  cTermResultCardinality,
  type COfNode,
  type CProgramNode,
  type ExecutableLeafRequirement,
  type InteractionLeafRequirement,
} from "../gtl/c_algebra.js";
import type {
  GraphFunction,
  ImplementationBinding,
} from "../gtl/contracts.js";
import type { StaticDiagnostic } from "./validation.js";

export interface CProgramValidationContext {
  readonly path: string;
  readonly availableGraphFunctionRefs: ReadonlySet<string>;
  readonly callableGraphFunctionRefs: ReadonlySet<string>;
  readonly graphFunctionByRef: ReadonlyMap<string, Readonly<GraphFunction>>;
  readonly contractRefs: ReadonlySet<string>;
  readonly bindingByRef: ReadonlyMap<string, Readonly<ImplementationBinding>>;
  readonly expectedRootResultCardinality?: "one" | "zero";
}

export interface CProgramTermInspection {
  readonly term: CProgramNode | null;
  readonly diagnostics: readonly StaticDiagnostic[];
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function diagnostic(
  code: StaticDiagnostic["code"],
  path: string,
  message: string,
): StaticDiagnostic {
  return { code, path, message };
}

function hasOnlyKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  path: string,
  diagnostics: StaticDiagnostic[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      diagnostics.push(diagnostic(
        "invalid_constructor",
        `${path}.${key}`,
        `C declaration carries unknown field ${key}`,
      ));
    }
  }
}

function nonEmptyString(
  value: unknown,
  path: string,
  diagnostics: StaticDiagnostic[],
): value is string {
  if (typeof value === "string" && value.length !== 0) return true;
  diagnostics.push(diagnostic("invalid_reference", path, "expected one non-empty reference"));
  return false;
}

function carrierPair(
  value: Readonly<Record<string, unknown>>,
  path: string,
  diagnostics: StaticDiagnostic[],
): value is Readonly<Record<string, unknown>> & {
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
} {
  return nonEmptyString(value.inputCarrierRef, `${path}.inputCarrierRef`, diagnostics) &&
    nonEmptyString(value.outputCarrierRef, `${path}.outputCarrierRef`, diagnostics);
}

function inspectExecutableRequirement(
  value: unknown,
  path: string,
  fibre: "F_D" | "F_P",
  context: CProgramValidationContext,
  diagnostics: StaticDiagnostic[],
): value is ExecutableLeafRequirement {
  if (!isRecord(value) || value.kind !== "executable_leaf_requirement") {
    diagnostics.push(diagnostic(
      "invalid_leaf_requirement",
      path,
      `${fibre} requires one executable leaf requirement`,
    ));
    return false;
  }
  const keys = [
    "kind",
    "implementationBindingRef",
    "inputContractRef",
    "outputContractRef",
    "evidenceContractRef",
    "failureContractRef",
    "refusalContractRef",
    "judgmentContractRef",
  ] as const;
  hasOnlyKeys(value, keys, path, diagnostics);
  let valid = true;
  for (const key of keys.slice(1)) {
    if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics)) valid = false;
  }
  if (!valid) return false;
  const requirement = value as unknown as ExecutableLeafRequirement;
  const binding = context.bindingByRef.get(requirement.implementationBindingRef);
  if (binding === undefined) {
    diagnostics.push(diagnostic(
      "missing_binding",
      `${path}.implementationBindingRef`,
      `missing implementation binding ${requirement.implementationBindingRef}`,
    ));
  } else if (
    binding.computeRegime !== fibre ||
    binding.inputContractRef !== requirement.inputContractRef ||
    binding.outputContractRef !== requirement.outputContractRef ||
    binding.failureContractRef !== requirement.failureContractRef ||
    binding.refusalContractRef !== requirement.refusalContractRef
  ) {
    diagnostics.push(diagnostic(
      "invalid_leaf_requirement",
      path,
      "executable requirement and implementation binding disagree",
    ));
  }
  for (const contractRef of [
    requirement.inputContractRef,
    requirement.outputContractRef,
    requirement.evidenceContractRef,
    requirement.failureContractRef,
    requirement.refusalContractRef,
    requirement.judgmentContractRef,
  ]) {
    if (!context.contractRefs.has(contractRef)) {
      diagnostics.push(diagnostic(
        "missing_contract",
        path,
        `missing executable leaf contract ${contractRef}`,
      ));
    }
  }
  return true;
}

function inspectInteractionRequirement(
  value: unknown,
  path: string,
  context: CProgramValidationContext,
  diagnostics: StaticDiagnostic[],
): value is InteractionLeafRequirement {
  if (!isRecord(value) || value.kind !== "interaction_leaf_requirement") {
    diagnostics.push(diagnostic(
      "invalid_leaf_requirement",
      path,
      "F_H requires one interaction leaf requirement and no implementation binding",
    ));
    return false;
  }
  const keys = [
    "kind",
    "interactionKind",
    "actorCapabilityRef",
    "requestContractRef",
    "responseContractRef",
    "continuationContractRef",
  ] as const;
  hasOnlyKeys(value, keys, path, diagnostics);
  let valid = true;
  for (const key of keys.slice(1)) {
    if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics)) valid = false;
  }
  if (!valid) return false;
  const requirement = value as unknown as InteractionLeafRequirement;
  for (const contractRef of [
    requirement.requestContractRef,
    requirement.responseContractRef,
    requirement.continuationContractRef,
  ]) {
    if (!context.contractRefs.has(contractRef)) {
      diagnostics.push(diagnostic(
        "missing_contract",
        path,
        `missing interaction leaf contract ${contractRef}`,
      ));
    }
  }
  return true;
}

function inspectLeaf(
  value: Readonly<Record<string, unknown>>,
  path: string,
  context: CProgramValidationContext,
  diagnostics: StaticDiagnostic[],
): COfNode | null {
  hasOnlyKeys(value, [
    "kind",
    "inputCarrierRef",
    "outputCarrierRef",
    "programLocusRef",
    "stageRole",
    "fibre",
    "armId",
    "compositionRef",
    "vectorIndex",
    "judgmentPredicateRef",
    "resultBearing",
    "requirement",
  ], path, diagnostics);
  let valid = carrierPair(value, path, diagnostics);
  for (const key of ["programLocusRef", "stageRole", "armId", "judgmentPredicateRef"] as const) {
    if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics)) valid = false;
  }
  if (value.compositionRef !== null &&
    !nonEmptyString(value.compositionRef, `${path}.compositionRef`, diagnostics)) {
    valid = false;
  }
  if (!Number.isSafeInteger(value.vectorIndex) || (value.vectorIndex as number) < 0) {
    diagnostics.push(diagnostic(
      "invalid_reference",
      `${path}.vectorIndex`,
      "C.of vectorIndex must be a non-negative safe integer",
    ));
    valid = false;
  }
  if (typeof value.resultBearing !== "boolean") {
    diagnostics.push(diagnostic(
      "invalid_result_cardinality",
      `${path}.resultBearing`,
      "C.of resultBearing must be boolean",
    ));
    valid = false;
  }
  if (!COMPUTE_REGIME_VALUES.some((candidate) => candidate === value.fibre)) {
    diagnostics.push(diagnostic(
      "invalid_fibre",
      `${path}.fibre`,
      "C.of fibre must be F_D, F_P, or F_H",
    ));
    return null;
  }
  const fibre = value.fibre as "F_D" | "F_P" | "F_H";
  const requirementValid = fibre === "F_H"
    ? inspectInteractionRequirement(value.requirement, `${path}.requirement`, context, diagnostics)
    : inspectExecutableRequirement(value.requirement, `${path}.requirement`, fibre, context, diagnostics);
  return valid && requirementValid ? value as unknown as COfNode : null;
}

function inspectTerm(
  value: unknown,
  path: string,
  context: CProgramValidationContext,
  diagnostics: StaticDiagnostic[],
): CProgramNode | null {
  if (!isRecord(value) || !C_TERM_KIND_VALUES.some((kind) => kind === value.kind)) {
    diagnostics.push(diagnostic(
      "invalid_constructor",
      `${path}.kind`,
      "expected one of the seven C constructor discriminants",
    ));
    return null;
  }
  switch (value.kind) {
    case "c_of":
      return inspectLeaf(value, path, context, diagnostics);
    case "c_identity": {
      hasOnlyKeys(value, ["kind", "inputCarrierRef", "outputCarrierRef"], path, diagnostics);
      if (!carrierPair(value, path, diagnostics)) return null;
      if (value.inputCarrierRef !== value.outputCarrierRef) {
        diagnostics.push(diagnostic(
          "carrier_mismatch",
          path,
          "C.id input and output carriers differ",
        ));
        return null;
      }
      return value as unknown as CProgramNode;
    }
    case "c_compose": {
      hasOnlyKeys(value, ["kind", "inputCarrierRef", "outputCarrierRef", "terms"], path, diagnostics);
      if (!carrierPair(value, path, diagnostics)) return null;
      if (!Array.isArray(value.terms) || value.terms.length < 2) {
        diagnostics.push(diagnostic(
          "invalid_constructor",
          `${path}.terms`,
          "canonical C.compose requires at least two non-identity flat terms",
        ));
        return null;
      }
      const terms = value.terms.map((term, index) =>
        inspectTerm(term, `${path}.terms[${index}]`, context, diagnostics));
      if (terms.some((term) => term === null)) return null;
      const admittedTerms = terms as readonly CProgramNode[];
      if (admittedTerms.some((term) => term.kind === "c_compose" || term.kind === "c_identity")) {
        diagnostics.push(diagnostic(
          "invalid_constructor",
          `${path}.terms`,
          "C.compose must be canonically flat and contain no explicit identity term",
        ));
      }
      if (
        value.inputCarrierRef !== admittedTerms[0]?.inputCarrierRef ||
        value.outputCarrierRef !== admittedTerms.at(-1)?.outputCarrierRef ||
        admittedTerms.slice(1).some((term, index) =>
          admittedTerms[index]?.outputCarrierRef !== term.inputCarrierRef)
      ) {
        diagnostics.push(diagnostic(
          "carrier_mismatch",
          path,
          "C.compose terms do not form one continuous carrier chain",
        ));
      }
      return value as unknown as CProgramNode;
    }
    case "c_edge": {
      hasOnlyKeys(value, [
        "kind",
        "inputCarrierRef",
        "outputCarrierRef",
        "transform",
        "evaluate",
        "consequence",
      ], path, diagnostics);
      if (!carrierPair(value, path, diagnostics)) return null;
      const roleTerms = (["transform", "evaluate", "consequence"] as const).map((role) => [
        role,
        inspectTerm(value[role], `${path}.${role}`, context, diagnostics),
      ] as const);
      if (roleTerms.some(([, term]) => term === null)) return null;
      for (const [role, term] of roleTerms) {
        if (term?.kind !== "c_of" || term.stageRole !== role) {
          diagnostics.push(diagnostic(
            "invalid_constructor",
            `${path}.${role}`,
            `C.edge ${role} must be a direct C.of leaf with the same role`,
          ));
        }
      }
      const [transform, evaluate, consequence] = roleTerms.map(([, term]) => term as COfNode);
      if (
        value.inputCarrierRef !== transform?.inputCarrierRef ||
        transform?.outputCarrierRef !== evaluate?.inputCarrierRef ||
        evaluate?.outputCarrierRef !== consequence?.inputCarrierRef ||
        value.outputCarrierRef !== consequence?.outputCarrierRef
      ) {
        diagnostics.push(diagnostic(
          "carrier_mismatch",
          path,
          "C.edge carriers do not form transform -> evaluate -> consequence",
        ));
      }
      return value as unknown as CProgramNode;
    }
    case "c_workflow": {
      hasOnlyKeys(value, [
        "kind",
        "inputCarrierRef",
        "outputCarrierRef",
        "graphFunctionRef",
      ], path, diagnostics);
      const validCarrierPair = carrierPair(value, path, diagnostics);
      const validGraphFunctionRef = nonEmptyString(
        value.graphFunctionRef,
        `${path}.graphFunctionRef`,
        diagnostics,
      );
      if (!validCarrierPair || !validGraphFunctionRef) return null;
      const graphFunctionRef = value.graphFunctionRef as string;
      if (
        !context.availableGraphFunctionRefs.has(graphFunctionRef) ||
        !context.callableGraphFunctionRefs.has(graphFunctionRef)
      ) {
        diagnostics.push(diagnostic(
          "invalid_reference",
          `${path}.graphFunctionRef`,
          `workflow.C GraphFunction ${graphFunctionRef} is not in the admitted Program root`,
        ));
      } else {
        const child = context.graphFunctionByRef.get(graphFunctionRef);
        if (
          child === undefined ||
          child.inputs.length !== 1 ||
          child.outputs.length !== 1 ||
          value.inputCarrierRef !== child.inputs[0] ||
          value.outputCarrierRef !== child.outputs[0]
        ) {
          diagnostics.push(diagnostic(
            "workflow_interface_mismatch",
            path,
            "workflow.C carriers must equal the selected child GraphFunction interface",
          ));
        }
      }
      return value as unknown as CProgramNode;
    }
    case "c_batch": {
      hasOnlyKeys(value, [
        "kind",
        "inputCarrierRef",
        "outputCarrierRef",
        "taskInputCarrierRef",
        "taskOutputCarrierRef",
        "batchRef",
        "tasks",
      ], path, diagnostics);
      const valid = carrierPair(value, path, diagnostics) &&
        nonEmptyString(
          value.taskInputCarrierRef,
          `${path}.taskInputCarrierRef`,
          diagnostics,
        ) &&
        nonEmptyString(
          value.taskOutputCarrierRef,
          `${path}.taskOutputCarrierRef`,
          diagnostics,
        ) &&
        nonEmptyString(value.batchRef, `${path}.batchRef`, diagnostics);
      if (!Array.isArray(value.tasks) || value.tasks.length === 0) {
        diagnostics.push(diagnostic(
          "invalid_result_cardinality",
          `${path}.tasks`,
          "C.batch requires one non-empty ordered task family",
        ));
        return null;
      }
      const tasks = value.tasks.map((task, index) =>
        inspectTerm(task, `${path}.tasks[${index}]`, context, diagnostics));
      if (!valid || tasks.some((task) => task === null)) return null;
      const admittedTasks = tasks as readonly CProgramNode[];
      const head = admittedTasks[0]!;
      if (admittedTasks.some((task) =>
        task.inputCarrierRef !== value.taskInputCarrierRef ||
        task.outputCarrierRef !== value.taskOutputCarrierRef ||
        cTermResultCardinality(task) !== cTermResultCardinality(head))) {
        diagnostics.push(diagnostic(
          "invalid_result_cardinality",
          path,
          "C.batch tasks must preserve the declared member carrier pair and equal per-task result cardinality",
        ));
      }
      return value as unknown as CProgramNode;
    }
    case "c_retry": {
      hasOnlyKeys(value, [
        "kind",
        "inputCarrierRef",
        "outputCarrierRef",
        "budget",
        "term",
      ], path, diagnostics);
      const valid = carrierPair(value, path, diagnostics);
      if (!Number.isSafeInteger(value.budget) || (value.budget as number) < 1) {
        diagnostics.push(diagnostic(
          "invalid_constructor",
          `${path}.budget`,
          "C.retry budget must be a positive safe integer",
        ));
      }
      const term = inspectTerm(value.term, `${path}.term`, context, diagnostics);
      if (!valid || term === null) return null;
      if (
        value.inputCarrierRef !== term.inputCarrierRef ||
        value.outputCarrierRef !== term.outputCarrierRef
      ) {
        diagnostics.push(diagnostic(
          "carrier_mismatch",
          path,
          "C.retry must preserve the wrapped term carrier pair",
        ));
      }
      return value as unknown as CProgramNode;
    }
  }
  return null;
}

export function inspectCProgramTerm(
  value: unknown,
  context: CProgramValidationContext,
): CProgramTermInspection {
  const diagnostics: StaticDiagnostic[] = [];
  const term = inspectTerm(value, context.path, context, diagnostics);
  const expectedCardinality = context.expectedRootResultCardinality ?? "one";
  if (term !== null && cTermResultCardinality(term) !== expectedCardinality) {
    diagnostics.push(diagnostic(
      "invalid_result_cardinality",
      context.path,
      expectedCardinality === "one"
        ? "terminal compute-locus C term requires exactly one result-bearing path"
        : "non-terminal compute-locus C term must not declare a result-bearing path",
    ));
  }
  return { term, diagnostics };
}
