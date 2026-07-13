// Implements: REQ-L-GTL3-GRAPHFUNCTION-004/-006/-007/-009/-011/-012.
// Implements: REQ-L-GTL3-RECURSE-001..008.
// Implements: REQ-R-ABG3-FN-COMPOSITION-001..014 (provisional joins only).

import {
  GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY,
  GraphFunctionApplicationAdmissionError,
  graphFunctionApplicationDeclarationFromDeclarations,
  type GraphFunctionApplicationDeclaration,
  type GraphFunctionApplicationOperatorKind
} from "../../../gtl/m01/contracts/graph_function_application.js";
import {
  isAdmittedGraphFunction,
  nodeContractKey,
  type GraphFunction,
  type GraphVector,
  type Node,
  type SerializedAttrEntry
} from "../../../gtl/m01/contracts/carriers.js";
import { constructGraphFunction } from "../../../gtl/m01/contracts/constructors.js";
import {
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  decodeAbgFnCompositionContract,
  resolveAbgFnCompositionSelection,
  type AbgFnCompositionSelection,
  type AbgFnCompositionSource
} from "./fn_composition.js";
import {
  stableJson,
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const GRAPH_FUNCTION_APPLICATION_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-application-missing-field",
  "gtl-application-unknown-field",
  "gtl-application-duplicate-authority",
  "gtl-application-invalid-operator",
  "gtl-application-identity-mismatch",
  "gtl-application-contract-mismatch",
  "gtl-application-result-identity-mismatch",
  "gtl-application-result-equation-mismatch",
  "gtl-application-unresolved-operand",
  "gtl-application-ambiguous-operand",
  "gtl-application-cycle",
  "gtl-application-composition-owner-mismatch",
  "gtl-application-runtime-not-realized"
] as const);

export type GraphFunctionApplicationDiagnosticId =
  (typeof GRAPH_FUNCTION_APPLICATION_DIAGNOSTIC_ID_VALUES)[number];

export type GraphFunctionApplicationRepairAffordance =
  | "add_missing_declaration"
  | "remove_duplicate_authority"
  | "correct_reference"
  | "correct_field_shape"
  | "correct_result_identity"
  | "correct_result_equation"
  | "break_application_cycle"
  | "correct_composition_owner"
  | "complete_t255_execution_join";

export interface GraphFunctionApplicationDiagnostic {
  readonly kind: "graph_function_application_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: GraphFunctionApplicationDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordance: GraphFunctionApplicationRepairAffordance;
}

export interface GraphFunctionApplicationLineageStep {
  readonly kind: "graph_function_application_lineage_step";
  readonly resultGraphFunctionRef: string;
  readonly applicationRef: string;
  readonly operatorKind: GraphFunctionApplicationOperatorKind;
  readonly operandGraphFunctionRef: string;
}

export interface GraphFunctionApplicationLineageProjection {
  readonly kind: "graph_function_application_lineage_projection";
  readonly executionSubjectGraphFunctionRef: string;
  readonly orderedSteps: readonly GraphFunctionApplicationLineageStep[];
  readonly orderedApplicationRefs: readonly string[];
  readonly orderedOperandGraphFunctionRefs: readonly string[];
  readonly ultimateBaseGraphFunctionRef: string;
  readonly eligibleCompositionOwnerGraphFunctionRefs: readonly string[];
  readonly lineageRef: string;
  readonly lineageDigest: `sha256:${string}`;
}

export interface ProvisionalDerivedCompositionBinding {
  readonly kind: "provisional_derived_composition_binding";
  readonly status: "provisional_pending_t255";
  readonly provisionalBindingRef: string;
  readonly executionSubjectGraphFunctionRef: string;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly declarationHostRef: string;
  readonly compositionSource: Extract<
    AbgFnCompositionSource,
    "graph_vector_declarations" | "graph_function_declarations"
  >;
  readonly compositionSelectionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly declaredOwningDeclarationRef: string | null;
  readonly applicationLineageRef: string;
  readonly pendingJoinRefs: readonly [
    "REQ-R-ABG3-FN-COMP-003",
    "owning_declaration_ref"
  ];
}

export interface GraphFunctionApplicationCompilation {
  readonly observed: boolean;
  readonly accepted: boolean;
  readonly declaration: GraphFunctionApplicationDeclaration | null;
  readonly lineage: GraphFunctionApplicationLineageProjection | null;
  readonly fanInRelation: CompiledFanInApplicationRelation | null;
  readonly recurseRelation: CompiledRecurseApplicationRelation | null;
  readonly provisionalBindings: readonly ProvisionalDerivedCompositionBinding[];
  readonly diagnostics: readonly GraphFunctionApplicationDiagnostic[];
}

export interface CompiledFanInApplicationRelation {
  readonly kind: "compiled_fan_in_application_relation";
  readonly relationRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly applicationRef: string;
  readonly executionSubjectGraphFunctionRef: string;
  readonly executionSubjectGraphFunctionDigest: `sha256:${string}`;
  readonly reducerGraphFunctionRef: string;
  readonly reducerGraphFunctionDigest: `sha256:${string}`;
  readonly inputVectorNodeRef: string;
  readonly inputVectorContractKey: string;
  readonly outputNodeRef: string;
  readonly outputContractKey: string;
  readonly applicationLineageRef: string;
  readonly applicationLineageDigest: `sha256:${string}`;
}

export interface CompiledRecurseApplicationRelation {
  readonly kind: "compiled_recurse_application_relation";
  readonly relationRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly applicationRef: string;
  readonly executionSubjectGraphFunctionRef: string;
  readonly executionSubjectGraphFunctionDigest: `sha256:${string}`;
  readonly operandGraphFunctionRef: string;
  readonly operandGraphFunctionDigest: `sha256:${string}`;
  readonly inputNodeContractKeys: readonly string[];
  readonly outputNodeContractKeys: readonly string[];
  readonly terminationEvaluatorBinding: string;
  readonly terminationEvaluatorDigest: `sha256:${string}`;
  readonly terminationConsumedFieldRefs: readonly string[];
  readonly foldbackMode: "rebind";
  readonly foldbackBinding: string;
  readonly foldbackRequiresParentEvaluation: true;
  readonly foldbackAdditionalDigest: `sha256:${string}`;
  readonly applicationLineageRef: string;
  readonly applicationLineageDigest: `sha256:${string}`;
}

interface DerivedLineage {
  readonly declaration: GraphFunctionApplicationDeclaration;
  readonly lineage: GraphFunctionApplicationLineageProjection;
  readonly orderedGraphFunctions: readonly GraphFunction[];
}

interface CompositionCompilation {
  readonly bindings: readonly ProvisionalDerivedCompositionBinding[];
  readonly diagnostic: GraphFunctionApplicationDiagnostic | null;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function described(value: unknown): string {
  try {
    return stableJson(value);
  } catch {
    try {
      const encoded = JSON.stringify(value);
      return encoded === undefined ? String(value) : encoded;
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
}

function declarationEntries(value: unknown): readonly unknown[] | null {
  if (!isRecord(value) || !isRecord(value["declarations"])) {
    return null;
  }
  const entries = value["declarations"]["entries"];
  return Array.isArray(entries)
    ? Object.freeze(entries.map((entry: unknown) => entry))
    : null;
}

export function graphFunctionHasApplicationDeclarationKey(
  graphFunction: unknown
): boolean {
  return (
    declarationEntries(graphFunction)?.some(
      (entry) =>
        isRecord(entry) &&
        entry["key"] === GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
    ) ?? false
  );
}

function evidenceRefs(input: {
  readonly graphFunctionRef: string;
  readonly applicationRef?: string | undefined;
}): readonly string[] {
  return Object.freeze([
    `graph-function:${input.graphFunctionRef}`,
    ...(input.applicationRef === undefined
      ? []
      : [`graph-function-application:${input.applicationRef}`]),
    "requirement:REQ-L-GTL3-GRAPHFUNCTION-011",
    "requirement:REQ-R-ABG3-FN-COMP-003"
  ]);
}

function repairAffordance(
  diagnosticId: GraphFunctionApplicationDiagnosticId
): GraphFunctionApplicationRepairAffordance {
  switch (diagnosticId) {
    case "gtl-application-missing-field":
      return "add_missing_declaration";
    case "gtl-application-duplicate-authority":
    case "gtl-application-ambiguous-operand":
      return "remove_duplicate_authority";
    case "gtl-application-identity-mismatch":
    case "gtl-application-unresolved-operand":
      return "correct_reference";
    case "gtl-application-result-identity-mismatch":
      return "correct_result_identity";
    case "gtl-application-result-equation-mismatch":
      return "correct_result_equation";
    case "gtl-application-cycle":
      return "break_application_cycle";
    case "gtl-application-composition-owner-mismatch":
      return "correct_composition_owner";
    case "gtl-application-runtime-not-realized":
      return "complete_t255_execution_join";
    case "gtl-application-unknown-field":
    case "gtl-application-invalid-operator":
    case "gtl-application-contract-mismatch":
      return "correct_field_shape";
  }
}

function diagnostic(input: {
  readonly classification?: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: GraphFunctionApplicationDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): GraphFunctionApplicationDiagnostic {
  return Object.freeze({
    kind: "graph_function_application_diagnostic" as const,
    classification: input.classification ?? "invalid_program",
    diagnosticId: input.diagnosticId,
    path: input.path,
    expectedRelation: input.expectedRelation,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    repairAffordance: repairAffordance(input.diagnosticId)
  });
}

function rejected(input: {
  readonly declaration: GraphFunctionApplicationDeclaration | null;
  readonly diagnostic: GraphFunctionApplicationDiagnostic;
  readonly lineage?: GraphFunctionApplicationLineageProjection | null | undefined;
  readonly provisionalBindings?: readonly ProvisionalDerivedCompositionBinding[] | undefined;
}): GraphFunctionApplicationCompilation {
  return Object.freeze({
    observed: true,
    accepted: false,
    declaration: input.declaration,
    lineage: input.lineage ?? null,
    fanInRelation: null,
    recurseRelation: null,
    provisionalBindings: Object.freeze([...(input.provisionalBindings ?? [])]),
    diagnostics: Object.freeze([input.diagnostic])
  });
}

function noApplication(): GraphFunctionApplicationCompilation {
  return Object.freeze({
    observed: false,
    accepted: true,
    declaration: null,
    lineage: null,
    fanInRelation: null,
    recurseRelation: null,
    provisionalBindings: Object.freeze([]),
    diagnostics: Object.freeze([])
  });
}

function compiledFanInRelation(input: {
  readonly executionSubject: GraphFunction;
  readonly reducer: GraphFunction;
  readonly declaration: Extract<
    GraphFunctionApplicationDeclaration,
    { readonly operatorKind: "fan_in" }
  >;
  readonly lineage: GraphFunctionApplicationLineageProjection;
}): CompiledFanInApplicationRelation {
  const output = input.executionSubject.outputs[0];
  if (input.executionSubject.outputs.length !== 1 || output === undefined) {
    throw new TypeError(
      "fan-in execution subject must expose exactly one synthesized output"
    );
  }
  const basis = Object.freeze({
    kind: "compiled_fan_in_application_relation" as const,
    applicationRef: input.declaration.applicationRef,
    executionSubjectGraphFunctionRef: input.executionSubject.id,
    executionSubjectGraphFunctionDigest: stableSha256Digest(
      input.executionSubject
    ),
    reducerGraphFunctionRef: input.reducer.id,
    reducerGraphFunctionDigest: stableSha256Digest(input.reducer),
    inputVectorNodeRef: input.declaration.overVectorNodeRef,
    inputVectorContractKey: input.declaration.overVectorContractKey,
    outputNodeRef: output.id,
    outputContractKey: nodeContractKey(output),
    applicationLineageRef: input.lineage.lineageRef,
    applicationLineageDigest: input.lineage.lineageDigest
  });
  const relationDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    relationRef:
      `abg://hof/fan-in/relation/${relationDigest.slice("sha256:".length)}`,
    relationDigest
  });
}

function compiledRecurseRelation(input: {
  readonly executionSubject: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: Extract<
    GraphFunctionApplicationDeclaration,
    { readonly operatorKind: "recurse" }
  >;
  readonly lineage: GraphFunctionApplicationLineageProjection;
}): CompiledRecurseApplicationRelation {
  const evaluator = input.declaration.terminationEvaluator;
  if (evaluator.binding.length === 0) {
    throw new TypeError("recurse termination evaluator binding is required");
  }
  if (
    evaluator.consumedFieldRefs.length === 0 ||
    evaluator.consumedFieldRefs.some((fieldRef) => fieldRef.length === 0) ||
    new Set(evaluator.consumedFieldRefs).size !==
      evaluator.consumedFieldRefs.length
  ) {
    throw new TypeError(
      "recurse termination evaluator requires unique non-empty consumed field refs"
    );
  }
  const foldback = input.declaration.foldback;
  if (
    foldback.mode !== "rebind" ||
    foldback.binding.length === 0 ||
    foldback.requiresParentEvaluation !== true
  ) {
    throw new TypeError(
      "recurse foldback requires one rebind binding and parent evaluation"
    );
  }
  const basis = Object.freeze({
    kind: "compiled_recurse_application_relation" as const,
    applicationRef: input.declaration.applicationRef,
    executionSubjectGraphFunctionRef: input.executionSubject.id,
    executionSubjectGraphFunctionDigest: stableSha256Digest(
      input.executionSubject
    ),
    operandGraphFunctionRef: input.operand.id,
    operandGraphFunctionDigest: stableSha256Digest(input.operand),
    inputNodeContractKeys: Object.freeze(
      input.executionSubject.inputs.map(nodeContractKey)
    ),
    outputNodeContractKeys: Object.freeze(
      input.executionSubject.outputs.map(nodeContractKey)
    ),
    terminationEvaluatorBinding: evaluator.binding,
    terminationEvaluatorDigest: stableSha256Digest(evaluator),
    terminationConsumedFieldRefs: Object.freeze([
      ...evaluator.consumedFieldRefs
    ]),
    foldbackMode: foldback.mode,
    foldbackBinding: foldback.binding,
    foldbackRequiresParentEvaluation:
      foldback.requiresParentEvaluation,
    foldbackAdditionalDigest: stableSha256Digest(foldback.additional),
    applicationLineageRef: input.lineage.lineageRef,
    applicationLineageDigest: input.lineage.lineageDigest
  });
  const relationDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    relationRef:
      `abg://graph-function/recurse/relation/${relationDigest.slice("sha256:".length)}`,
    relationDigest
  });
}

function exactNodes(left: readonly Node[], right: readonly Node[]): boolean {
  return stableJsonEquals(left, right);
}

function stableNodes(groups: readonly (readonly Node[])[]): readonly Node[] {
  const seen = new Set<string>();
  const nodes: Node[] = [];
  for (const group of groups) {
    for (const node of group) {
      const key = nodeContractKey(node);
      if (!seen.has(key)) {
        seen.add(key);
        nodes.push(node);
      }
    }
  }
  return Object.freeze(nodes);
}

function nonApplicationEntries(
  graphFunction: GraphFunction
): readonly SerializedAttrEntry[] {
  return Object.freeze(
    graphFunction.declarations.entries.filter(
      (entry) => entry.key !== GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
    )
  );
}

function inheritedDeclarationsMatch(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
}): boolean {
  const resultByKey = new Map(
    nonApplicationEntries(input.result).map((entry) => [entry.key, entry] as const)
  );
  for (const operandEntry of nonApplicationEntries(input.operand)) {
    const resultEntry = resultByKey.get(operandEntry.key);
    if (resultEntry === undefined || !stableJsonEquals(resultEntry, operandEntry)) {
      return false;
    }
  }
  return true;
}

function recomputeGraphFunctionId(graphFunction: GraphFunction): string {
  return constructGraphFunction({
    name: graphFunction.name,
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: graphFunction.tags
  }).id;
}

function resultIdentityDiagnostic(input: {
  readonly result: GraphFunction;
  readonly declaration: GraphFunctionApplicationDeclaration;
}): GraphFunctionApplicationDiagnostic | null {
  let derivedId: string;
  try {
    derivedId = recomputeGraphFunctionId(input.result);
  } catch (error: unknown) {
    return diagnostic({
      diagnosticId: "gtl-application-result-equation-mismatch",
      path: "$.graph_function",
      expectedRelation: "one canonically constructible applied GraphFunction value",
      actualRelation:
        error instanceof Error ? error.message : "canonical reconstruction failed",
      evidenceRefs: evidenceRefs({
        graphFunctionRef: input.result.id,
        applicationRef: input.declaration.applicationRef
      })
    });
  }
  return derivedId === input.result.id
    ? null
    : diagnostic({
        diagnosticId: "gtl-application-result-identity-mismatch",
        path: "$.graph_function.id",
        expectedRelation: derivedId,
        actualRelation: input.result.id,
        evidenceRefs: evidenceRefs({
          graphFunctionRef: input.result.id,
          applicationRef: input.declaration.applicationRef
        })
      });
}

function equationFailure(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: GraphFunctionApplicationDeclaration;
  readonly path: string;
  readonly expected: unknown;
  readonly actual: unknown;
}): GraphFunctionApplicationDiagnostic {
  return diagnostic({
    diagnosticId: "gtl-application-result-equation-mismatch",
    path: input.path,
    expectedRelation: described(input.expected),
    actualRelation: described(input.actual),
    evidenceRefs: evidenceRefs({
      graphFunctionRef: input.result.id,
      applicationRef: input.declaration.applicationRef
    })
  });
}

function commonEquationDiagnostic(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: GraphFunctionApplicationDeclaration;
}): GraphFunctionApplicationDiagnostic | null {
  const relations: readonly {
    readonly path: string;
    readonly expected: unknown;
    readonly actual: unknown;
  }[] = Object.freeze([
    {
      path: "$.graph_function.outputs",
      expected: input.operand.outputs,
      actual: input.result.outputs
    },
    {
      path: "$.graph_function.template",
      expected: input.operand.template,
      actual: input.result.template
    },
    {
      path: "$.graph_function.effects",
      expected: input.operand.effects,
      actual: input.result.effects
    }
  ]);
  for (const relation of relations) {
    if (!stableJsonEquals(relation.actual, relation.expected)) {
      return equationFailure({ ...input, ...relation });
    }
  }
  if (!inheritedDeclarationsMatch(input)) {
    return equationFailure({
      ...input,
      path: "$.graph_function.declarations",
      expected: nonApplicationEntries(input.operand),
      actual: nonApplicationEntries(input.result)
    });
  }
  return null;
}

function sameOuterEquationDiagnostic(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: GraphFunctionApplicationDeclaration;
}): GraphFunctionApplicationDiagnostic | null {
  const relations: readonly {
    readonly path: string;
    readonly expected: unknown;
    readonly actual: unknown;
  }[] = Object.freeze([
    {
      path: "$.graph_function.environment",
      expected: input.operand.environment,
      actual: input.result.environment
    },
    {
      path: "$.graph_function.inputs",
      expected: input.operand.inputs,
      actual: input.result.inputs
    }
  ]);
  for (const relation of relations) {
    if (!stableJsonEquals(relation.actual, relation.expected)) {
      return equationFailure({ ...input, ...relation });
    }
  }
  return commonEquationDiagnostic(input);
}

function fanInEquationDiagnostic(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: Extract<
    GraphFunctionApplicationDeclaration,
    { readonly operatorKind: "fan_in" }
  >;
}): GraphFunctionApplicationDiagnostic | null {
  const over = input.result.inputs[0];
  if (input.result.inputs.length !== 1 || over === undefined) {
    return equationFailure({
      ...input,
      path: "$.graph_function.inputs",
      expected: "exactly one declared Vector[...] boundary",
      actual: input.result.inputs
    });
  }
  const vectorMatch = /^Vector\[([^\[\]]+)\]$/u.exec(over.schema.ref);
  if (
    vectorMatch?.[1] === undefined ||
    vectorMatch[1] !== vectorMatch[1].trim() ||
    over.id !== input.declaration.overVectorNodeRef ||
    nodeContractKey(over) !== input.declaration.overVectorContractKey
  ) {
    return equationFailure({
      ...input,
      path: "$.graph_function.inputs[0]",
      expected: {
        schema: "Vector[member]",
        nodeRef: input.declaration.overVectorNodeRef,
        contractKey: input.declaration.overVectorContractKey
      },
      actual: {
        schema: over.schema.ref,
        nodeRef: over.id,
        contractKey: nodeContractKey(over)
      }
    });
  }
  if (!exactNodes(input.operand.inputs, [over])) {
    return equationFailure({
      ...input,
      path: "$.operand.inputs",
      expected: [over],
      actual: input.operand.inputs
    });
  }
  const relations: readonly {
    readonly path: string;
    readonly expected: unknown;
    readonly actual: unknown;
  }[] = Object.freeze([
    {
      path: "$.graph_function.environment.requires",
      expected: [over],
      actual: input.result.environment.requires
    },
    {
      path: "$.graph_function.environment.provides",
      expected: input.operand.environment.provides,
      actual: input.result.environment.provides
    },
    {
      path: "$.graph_function.environment.carries",
      expected: stableNodes([[over], input.operand.environment.provides]),
      actual: input.result.environment.carries
    }
  ]);
  for (const relation of relations) {
    if (!stableJsonEquals(relation.actual, relation.expected)) {
      return equationFailure({ ...input, ...relation });
    }
  }
  if (
    input.operand.template.kind === "inline_graph" &&
    !exactNodes(input.operand.template.graph.inputs, [over])
  ) {
    return equationFailure({
      ...input,
      path: "$.operand.template.graph.inputs",
      expected: [over],
      actual: input.operand.template.graph.inputs
    });
  }
  return commonEquationDiagnostic(input);
}

function resultEquationDiagnostic(input: {
  readonly result: GraphFunction;
  readonly operand: GraphFunction;
  readonly declaration: GraphFunctionApplicationDeclaration;
}): GraphFunctionApplicationDiagnostic | null {
  if (input.declaration.operatorKind === "fan_in") {
    return fanInEquationDiagnostic({
      result: input.result,
      operand: input.operand,
      declaration: input.declaration
    });
  }
  return sameOuterEquationDiagnostic(input);
}

function lineageProjection(input: {
  readonly executionSubjectGraphFunctionRef: string;
  readonly orderedSteps: readonly GraphFunctionApplicationLineageStep[];
  readonly ultimateBaseGraphFunctionRef: string;
}): GraphFunctionApplicationLineageProjection {
  const orderedApplicationRefs = Object.freeze(
    input.orderedSteps.map((step) => step.applicationRef)
  );
  const orderedOperandGraphFunctionRefs = Object.freeze(
    input.orderedSteps.map((step) => step.operandGraphFunctionRef)
  );
  const eligibleCompositionOwnerGraphFunctionRefs = Object.freeze([
    input.executionSubjectGraphFunctionRef,
    ...orderedOperandGraphFunctionRefs
  ]);
  const identity = Object.freeze({
    kind: "graph_function_application_lineage_projection" as const,
    executionSubjectGraphFunctionRef: input.executionSubjectGraphFunctionRef,
    orderedSteps: input.orderedSteps,
    orderedApplicationRefs,
    orderedOperandGraphFunctionRefs,
    ultimateBaseGraphFunctionRef: input.ultimateBaseGraphFunctionRef,
    eligibleCompositionOwnerGraphFunctionRefs
  });
  const lineageDigest = stableSha256Digest(identity);
  return Object.freeze({
    ...identity,
    lineageRef: `gtl://graph-function/application-lineage/${lineageDigest.slice("sha256:".length)}`,
    lineageDigest
  });
}

function deriveLineage(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
  readonly declaration: GraphFunctionApplicationDeclaration;
}):
  | { readonly derived: DerivedLineage; readonly diagnostic: null }
  | { readonly derived: null; readonly diagnostic: GraphFunctionApplicationDiagnostic } {
  const orderedSteps: GraphFunctionApplicationLineageStep[] = [];
  const orderedGraphFunctions: GraphFunction[] = [input.graphFunction];
  const visited = new Set<string>([input.graphFunction.id]);
  let result = input.graphFunction;
  let declaration = input.declaration;

  while (true) {
    const identityFailure = resultIdentityDiagnostic({ result, declaration });
    if (identityFailure !== null) {
      return Object.freeze({ derived: null, diagnostic: identityFailure });
    }

    if (visited.has(declaration.operandGraphFunctionRef)) {
      return Object.freeze({
        derived: null,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-cycle",
          path: "$.declarations.gtl.graph_function_application.operand_graph_function_ref",
          expectedRelation: "an acyclic operand GraphFunction id",
          actualRelation: declaration.operandGraphFunctionRef,
          evidenceRefs: evidenceRefs({
            graphFunctionRef: result.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }

    const matches = input.graphFunctions.filter(
      (candidate) => candidate.id === declaration.operandGraphFunctionRef
    );
    if (matches.length !== 1) {
      return Object.freeze({
        derived: null,
        diagnostic: diagnostic({
          diagnosticId:
            matches.length === 0
              ? "gtl-application-unresolved-operand"
              : "gtl-application-ambiguous-operand",
          path: "$.declarations.gtl.graph_function_application.operand_graph_function_ref",
          expectedRelation: "exactly one admitted operand GraphFunction id in the compilation root",
          actualRelation: `${String(matches.length)} matches for ${JSON.stringify(declaration.operandGraphFunctionRef)}`,
          evidenceRefs: evidenceRefs({
            graphFunctionRef: result.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }
    const operand = matches[0]!;
    if (!isAdmittedGraphFunction(operand)) {
      return Object.freeze({
        derived: null,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-identity-mismatch",
          path: "$.operand_graph_function",
          expectedRelation: "one constructor-admitted operand GraphFunction",
          actualRelation: operand.id,
          evidenceRefs: evidenceRefs({
            graphFunctionRef: result.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }

    const equationFailure = resultEquationDiagnostic({
      result,
      operand,
      declaration
    });
    if (equationFailure !== null) {
      return Object.freeze({ derived: null, diagnostic: equationFailure });
    }

    orderedSteps.push(
      Object.freeze({
        kind: "graph_function_application_lineage_step" as const,
        resultGraphFunctionRef: result.id,
        applicationRef: declaration.applicationRef,
        operatorKind: declaration.operatorKind,
        operandGraphFunctionRef: operand.id
      })
    );
    orderedGraphFunctions.push(operand);
    visited.add(operand.id);

    let operandDeclaration: GraphFunctionApplicationDeclaration | null;
    try {
      operandDeclaration = graphFunctionApplicationDeclarationFromDeclarations(
        operand.declarations,
        `GraphFunction(${JSON.stringify(operand.id)}).declarations`
      );
    } catch (error: unknown) {
      const applicationError =
        error instanceof GraphFunctionApplicationAdmissionError ? error : null;
      return Object.freeze({
        derived: null,
        diagnostic: diagnostic({
          diagnosticId:
            applicationError?.diagnosticId ?? "gtl-application-contract-mismatch",
          path: applicationError?.path ?? "$.operand_graph_function.declarations",
          expectedRelation: "one closed canonical operand application or no application",
          actualRelation:
            error instanceof Error ? error.message : "operand application admission failed",
          evidenceRefs: evidenceRefs({ graphFunctionRef: operand.id })
        })
      });
    }
    if (operandDeclaration === null) {
      const lineage = lineageProjection({
        executionSubjectGraphFunctionRef: input.graphFunction.id,
        orderedSteps: Object.freeze([...orderedSteps]),
        ultimateBaseGraphFunctionRef: operand.id
      });
      return Object.freeze({
        derived: Object.freeze({
          declaration: input.declaration,
          lineage,
          orderedGraphFunctions: Object.freeze([...orderedGraphFunctions])
        }),
        diagnostic: null
      });
    }
    result = operand;
    declaration = operandDeclaration;
  }
}

function hasCompositionDeclaration(
  declarations: { readonly entries: readonly SerializedAttrEntry[] }
): boolean {
  return declarations.entries.some(
    (entry) => entry.key === ABG_FN_COMPOSITION_DECLARATION_KEY
  );
}

function compositionDeclarationEntry(
  declarations: { readonly entries: readonly SerializedAttrEntry[] }
): SerializedAttrEntry | null {
  return (
    declarations.entries.find(
      (entry) => entry.key === ABG_FN_COMPOSITION_DECLARATION_KEY
    ) ?? null
  );
}

function inlineVectors(graphFunction: GraphFunction): readonly GraphVector[] {
  return graphFunction.template.kind === "inline_graph"
    ? graphFunction.template.graph.vectors
    : Object.freeze([]);
}

interface SelectedCompositionDeclaration {
  readonly source:
    | "graph_vector_declarations"
    | "graph_function_declarations";
  readonly entry: SerializedAttrEntry;
}

function selectedCompositionDeclaration(input: {
  readonly owner: GraphFunction;
  readonly vector: GraphVector;
}): SelectedCompositionDeclaration | null {
  const vectorEntry = compositionDeclarationEntry(input.vector.declarations);
  if (vectorEntry !== null) {
    return Object.freeze({
      source: "graph_vector_declarations" as const,
      entry: vectorEntry
    });
  }
  const graphFunctionEntry = compositionDeclarationEntry(
    input.owner.declarations
  );
  return graphFunctionEntry === null
    ? null
    : Object.freeze({
        source: "graph_function_declarations" as const,
        entry: graphFunctionEntry
      });
}

function selectionIsInheritedFromImmediateOperand(input: {
  readonly selected: SelectedCompositionDeclaration;
  readonly vector: GraphVector;
  readonly immediateOperand: GraphFunction | null;
}): boolean {
  if (input.immediateOperand === null) {
    return false;
  }
  if (input.selected.source === "graph_function_declarations") {
    const operandEntry = compositionDeclarationEntry(
      input.immediateOperand.declarations
    );
    return (
      operandEntry !== null &&
      stableJsonEquals(operandEntry, input.selected.entry)
    );
  }
  const operandVector = inlineVectors(input.immediateOperand).find(
    (candidate) => candidate.id === input.vector.id
  );
  const operandEntry =
    operandVector === undefined
      ? null
      : compositionDeclarationEntry(operandVector.declarations);
  return (
    operandEntry !== null && stableJsonEquals(operandEntry, input.selected.entry)
  );
}

function ordinaryCrossHostCompositionDiagnostic(
  graphFunction: GraphFunction
): GraphFunctionApplicationDiagnostic | null {
  const entry = compositionDeclarationEntry(graphFunction.declarations);
  if (entry !== null) {
    if (entry.value.kind !== "hook_ref") {
      return diagnostic({
        diagnosticId: "gtl-application-contract-mismatch",
        path: "$.graph_function.declarations.abg.fn_composition",
        expectedRelation: "one canonical hook_ref composition declaration",
        actualRelation: entry.value.kind,
        evidenceRefs: evidenceRefs({ graphFunctionRef: graphFunction.id })
      });
    }
    try {
      const contract = decodeAbgFnCompositionContract(entry.value.value);
      if (
        contract.host.graphFunctionRef !== null &&
        contract.host.graphFunctionRef !== graphFunction.id
      ) {
        return diagnostic({
          diagnosticId: "gtl-application-composition-owner-mismatch",
          path: "$.graph_function.declarations.abg.fn_composition.host_graph_function_ref",
          expectedRelation:
            "the containing ordinary GraphFunction id or one canonical application path",
          actualRelation: contract.host.graphFunctionRef,
          evidenceRefs: evidenceRefs({ graphFunctionRef: graphFunction.id })
        });
      }
    } catch (error: unknown) {
      return diagnostic({
        diagnosticId: "gtl-application-contract-mismatch",
        path: "$.graph_function.declarations.abg.fn_composition",
        expectedRelation: "one admitted ABG fn composition contract",
        actualRelation:
          error instanceof Error ? error.message : "composition admission failed",
        evidenceRefs: evidenceRefs({ graphFunctionRef: graphFunction.id })
      });
    }
  }

  for (const vector of inlineVectors(graphFunction)) {
    if (
      !hasCompositionDeclaration(vector.declarations) &&
      !hasCompositionDeclaration(graphFunction.declarations)
    ) {
      continue;
    }
    try {
      resolveAbgFnCompositionSelection({ vector, graphFunction });
    } catch (error: unknown) {
      return diagnostic({
        diagnosticId: "gtl-application-composition-owner-mismatch",
        path: "$.graph_function.template.graph.vectors.abg.fn_composition",
        expectedRelation:
          "a composition owned by the containing ordinary GraphFunction and exact vector",
        actualRelation:
          error instanceof Error
            ? error.message
            : "composition owner resolution failed",
        evidenceRefs: evidenceRefs({ graphFunctionRef: graphFunction.id })
      });
    }
  }
  return null;
}

function provisionalBinding(input: {
  readonly executionSubjectGraphFunctionRef: string;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly selection: AbgFnCompositionSelection;
  readonly lineageRef: string;
}): ProvisionalDerivedCompositionBinding {
  if (
    input.selection.source !== "graph_vector_declarations" &&
    input.selection.source !== "graph_function_declarations"
  ) {
    throw new TypeError("T-265 admits only vector-local or GraphFunction-local composition candidates");
  }
  const identity = Object.freeze({
    executionSubjectGraphFunctionRef: input.executionSubjectGraphFunctionRef,
    declarationOwnerGraphFunctionRef: input.declarationOwnerGraphFunctionRef,
    declarationHostRef: input.selection.sourceRef,
    compositionSource: input.selection.source,
    compositionSelectionRef: input.selection.selectionRef,
    compositionRef: input.selection.contract.contractRef,
    compositionDigest: input.selection.contract.contractDigest,
    declaredOwningDeclarationRef:
      input.selection.contract.host.owningDeclarationRef,
    applicationLineageRef: input.lineageRef
  });
  return Object.freeze({
    kind: "provisional_derived_composition_binding" as const,
    status: "provisional_pending_t255" as const,
    provisionalBindingRef: `abg://fn-composition/provisional-binding/${stableSha256Digest(identity).slice("sha256:".length)}`,
    ...identity,
    pendingJoinRefs: Object.freeze([
      "REQ-R-ABG3-FN-COMP-003",
      "owning_declaration_ref"
    ] as const)
  });
}

function compileProvisionalBindings(input: {
  readonly executionSubject: GraphFunction;
  readonly owners: readonly GraphFunction[];
  readonly lineage: GraphFunctionApplicationLineageProjection;
}): CompositionCompilation {
  const bindings = new Map<string, ProvisionalDerivedCompositionBinding>();

  for (const owner of input.owners) {
    const seenVectorRefs = new Set<string>();
    for (const vector of inlineVectors(owner)) {
      if (seenVectorRefs.has(vector.id)) {
        return Object.freeze({
          bindings: Object.freeze([]),
          diagnostic: diagnostic({
            diagnosticId: "gtl-application-composition-owner-mismatch",
            path: "$.graph_function.template.graph.vectors",
            expectedRelation:
              "unique GraphVector identity before composition-owner derivation",
            actualRelation: `duplicate GraphVector id ${JSON.stringify(vector.id)}`,
            evidenceRefs: evidenceRefs({
              graphFunctionRef: input.executionSubject.id
            })
          })
        });
      }
      seenVectorRefs.add(vector.id);
    }
  }

  for (const [ownerIndex, owner] of input.owners.entries()) {
    const immediateOperand = input.owners[ownerIndex + 1] ?? null;
    const graphFunctionDeclaresComposition = hasCompositionDeclaration(
      owner.declarations
    );
    for (const vector of inlineVectors(owner)) {
      const vectorDeclaresComposition = hasCompositionDeclaration(
        vector.declarations
      );
      if (!vectorDeclaresComposition && !graphFunctionDeclaresComposition) {
        continue;
      }
      const selected = selectedCompositionDeclaration({ owner, vector });
      if (
        selected === null ||
        selectionIsInheritedFromImmediateOperand({
          selected,
          vector,
          immediateOperand
        })
      ) {
        continue;
      }
      try {
        const selection = resolveAbgFnCompositionSelection({
          vector,
          graphFunction: owner
        });
        if (
          selection.source === "graph_function_declarations" &&
          owner.id === input.executionSubject.id &&
          selection.contract.host.graphFunctionRef !== null
        ) {
          throw new TypeError(
            "a current-result-local composition must derive ownership from containment and omit host_graph_function_ref"
          );
        }
        if (
          selection.source === "graph_function_declarations" &&
          owner.id !== input.executionSubject.id &&
          selection.contract.host.graphFunctionRef !== owner.id
        ) {
          throw new TypeError(
            "an inherited GraphFunction-local composition must retain its exact operand host_graph_function_ref"
          );
        }
        const binding = provisionalBinding({
          executionSubjectGraphFunctionRef: input.executionSubject.id,
          declarationOwnerGraphFunctionRef: owner.id,
          selection,
          lineageRef: input.lineage.lineageRef
        });
        bindings.set(binding.provisionalBindingRef, binding);
      } catch (error: unknown) {
        return Object.freeze({
          bindings: Object.freeze([...bindings.values()]),
          diagnostic: diagnostic({
            diagnosticId: "gtl-application-composition-owner-mismatch",
            path: "$.declarations.abg.fn_composition",
            expectedRelation:
              "one current-result or operand-lineage declaration owner under existing composition precedence",
            actualRelation:
              error instanceof Error
                ? error.message
                : "composition resolution failed",
            evidenceRefs: evidenceRefs({
              graphFunctionRef: input.executionSubject.id
            })
          })
        });
      }
    }
  }
  return Object.freeze({
    bindings: Object.freeze([...bindings.values()]),
    diagnostic: null
  });
}

export function compileGraphFunctionApplication(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
}): GraphFunctionApplicationCompilation {
  if (!graphFunctionHasApplicationDeclarationKey(input.graphFunction)) {
    const crossHost = ordinaryCrossHostCompositionDiagnostic(
      input.graphFunction
    );
    if (crossHost !== null) {
      return rejected({ declaration: null, diagnostic: crossHost });
    }
    return noApplication();
  }
  if (!isAdmittedGraphFunction(input.graphFunction)) {
    return rejected({
      declaration: null,
      diagnostic: diagnostic({
        diagnosticId: "gtl-application-identity-mismatch",
        path: "$.graph_function",
        expectedRelation: "one constructor-admitted applied GraphFunction",
        actualRelation: described(input.graphFunction),
        evidenceRefs: evidenceRefs({
          graphFunctionRef: input.graphFunction.id || "unknown"
        })
      })
    });
  }

  let declaration: GraphFunctionApplicationDeclaration;
  try {
    const admitted = graphFunctionApplicationDeclarationFromDeclarations(
      input.graphFunction.declarations
    );
    if (admitted === null) {
      return rejected({
        declaration: null,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-missing-field",
          path: "$.graph_function.declarations",
          expectedRelation: "one canonical gtl.graph_function_application declaration",
          actualRelation: "the key was observed but no declaration admitted",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id
          })
        })
      });
    }
    declaration = admitted;
  } catch (error: unknown) {
    const applicationError =
      error instanceof GraphFunctionApplicationAdmissionError ? error : null;
    return rejected({
      declaration: null,
      diagnostic: diagnostic({
        diagnosticId:
          applicationError?.diagnosticId ?? "gtl-application-contract-mismatch",
        path:
          applicationError?.path ??
          "$.graph_function.declarations.gtl.graph_function_application",
        expectedRelation: "one closed canonical graph-function application",
        actualRelation:
          error instanceof Error ? error.message : "application admission failed",
        evidenceRefs: evidenceRefs({
          graphFunctionRef: input.graphFunction.id
        })
      })
    });
  }

  const derived = deriveLineage({
    graphFunction: input.graphFunction,
    graphFunctions: input.graphFunctions,
    declaration
  });
  if (derived.diagnostic !== null || derived.derived === null) {
    return rejected({
      declaration,
      diagnostic:
        derived.diagnostic ??
        diagnostic({
          diagnosticId: "gtl-application-contract-mismatch",
          path: "$",
          expectedRelation: "one derived application lineage",
          actualRelation: "lineage derivation returned no value",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id,
            applicationRef: declaration.applicationRef
          })
        })
    });
  }

  const compositions = compileProvisionalBindings({
    executionSubject: input.graphFunction,
    owners: derived.derived.orderedGraphFunctions,
    lineage: derived.derived.lineage
  });
  if (compositions.diagnostic !== null) {
    return rejected({
      declaration,
      lineage: derived.derived.lineage,
      provisionalBindings: compositions.bindings,
      diagnostic: compositions.diagnostic
    });
  }

  if (
    declaration.operatorKind === "recurse" &&
    derived.derived.lineage.orderedSteps.length === 1
  ) {
    const operand = derived.derived.orderedGraphFunctions[1];
    if (operand === undefined) {
      return rejected({
        declaration,
        lineage: derived.derived.lineage,
        provisionalBindings: compositions.bindings,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-unresolved-operand",
          path: "$.operand_graph_function_ref",
          expectedRelation: "one exact recursive operand GraphFunction",
          actualRelation: "application lineage has no immediate operand",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }
    let recurseRelation: CompiledRecurseApplicationRelation;
    try {
      recurseRelation = compiledRecurseRelation({
        executionSubject: input.graphFunction,
        operand,
        declaration,
        lineage: derived.derived.lineage
      });
    } catch (error: unknown) {
      return rejected({
        declaration,
        lineage: derived.derived.lineage,
        provisionalBindings: compositions.bindings,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-contract-mismatch",
          path: "$",
          expectedRelation:
            "one direct recurse relation with exact termination and foldback law",
          actualRelation:
            error instanceof Error ? error.message : "recurse relation failed",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }
    return Object.freeze({
      observed: true,
      accepted: true,
      declaration,
      lineage: derived.derived.lineage,
      fanInRelation: null,
      recurseRelation,
      provisionalBindings: compositions.bindings,
      diagnostics: Object.freeze([])
    });
  }

  if (
    declaration.operatorKind === "fan_in" &&
    derived.derived.lineage.orderedSteps.length === 1
  ) {
    const reducer = derived.derived.orderedGraphFunctions[1];
    if (reducer === undefined) {
      return rejected({
        declaration,
        lineage: derived.derived.lineage,
        provisionalBindings: compositions.bindings,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-unresolved-operand",
          path: "$.operand_graph_function_ref",
          expectedRelation: "one exact fan-in reducer GraphFunction",
          actualRelation: "application lineage has no immediate reducer",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }
    let fanInRelation: CompiledFanInApplicationRelation;
    try {
      fanInRelation = compiledFanInRelation({
        executionSubject: input.graphFunction,
        reducer,
        declaration,
        lineage: derived.derived.lineage
      });
    } catch (error: unknown) {
      return rejected({
        declaration,
        lineage: derived.derived.lineage,
        provisionalBindings: compositions.bindings,
        diagnostic: diagnostic({
          diagnosticId: "gtl-application-contract-mismatch",
          path: "$",
          expectedRelation: "one exact vector-to-scalar fan-in relation",
          actualRelation:
            error instanceof Error ? error.message : "fan-in relation failed",
          evidenceRefs: evidenceRefs({
            graphFunctionRef: input.graphFunction.id,
            applicationRef: declaration.applicationRef
          })
        })
      });
    }
    return Object.freeze({
      observed: true,
      accepted: true,
      declaration,
      lineage: derived.derived.lineage,
      fanInRelation,
      recurseRelation: null,
      provisionalBindings: compositions.bindings,
      diagnostics: Object.freeze([])
    });
  }

  return rejected({
    declaration,
    lineage: derived.derived.lineage,
    provisionalBindings: compositions.bindings,
    diagnostic: diagnostic({
      classification: "semantic_not_realized",
      diagnosticId: "gtl-application-runtime-not-realized",
      path: "$",
      expectedRelation:
        "T-255 final execution binding with complete FN-COMP-003 and owning_declaration_ref joins",
      actualRelation:
        "application lineage and provisional composition joins compiled without runtime admission",
      evidenceRefs: evidenceRefs({
        graphFunctionRef: input.graphFunction.id,
        applicationRef: declaration.applicationRef
      })
    })
  });
}
