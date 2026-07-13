import {
  HOF_APPLICATION_DECLARATION_KEY,
  HofApplicationAdmissionError,
  admitHofApplicationDeclaration,
  admitHofVectorMemberSchema,
  constructHofApplicationDeclaration,
  hofApplicationDeclarationFromDeclarations,
  type HofApplicationDeclaration
} from "../../../gtl/m01/contracts/hof_application.js";
import {
  interfaceContract,
  nodeContractKey,
  type GraphFunction,
  type GraphVector,
  type Node
} from "../../../gtl/m01/contracts/carriers.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const HOF_RELATION_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-hof-missing-field",
  "gtl-hof-unknown-field",
  "gtl-hof-duplicate-field",
  "gtl-hof-invalid-operator-kind",
  "gtl-hof-unresolved-ref",
  "gtl-hof-contract-mismatch",
  "gtl-hof-wrapper-mismatch",
  "gtl-hof-unrealized-fan-out"
] as const);

export type HofRelationDiagnosticId =
  (typeof HOF_RELATION_DIAGNOSTIC_ID_VALUES)[number];

export type HofRelationRepairAffordance =
  | "add_missing_declaration"
  | "remove_duplicate_declaration"
  | "correct_reference"
  | "correct_field_shape"
  | "realize_declared_semantics";

export interface HofRelationDiagnostic {
  readonly kind: "hof_relation_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: HofRelationDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordance: HofRelationRepairAffordance;
}

export interface HofRelationCompilation {
  readonly observed: boolean;
  readonly accepted: boolean;
  readonly declaration: HofApplicationDeclaration | null;
  readonly relation: CompiledHofFanOutRelation | null;
  readonly diagnostics: readonly HofRelationDiagnostic[];
}

export interface CompiledHofFanOutRelation {
  readonly kind: "compiled_hof_fan_out_relation";
  readonly relationBindingRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly declarationRelationRef: string;
  readonly hostGraphFunctionRef: string;
  readonly hostGraphFunctionDigest: `sha256:${string}`;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly wrapperGraphVectorRef: string;
  readonly inputMemberNodeRef: string;
  readonly inputMemberContractKey: string;
  readonly outputMemberNodeRef: string;
  readonly outputMemberContractKey: string;
  readonly inputVectorNodeRef: string;
  readonly inputVectorContractKey: string;
  readonly outputVectorNodeRef: string;
  readonly outputVectorContractKey: string;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function described(value: unknown): string {
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? String(value) : encoded;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function graphFunctionId(value: unknown): string | null {
  return isRecord(value) ? stringField(value["id"]) : null;
}

function declarationEntries(graphFunction: unknown): readonly unknown[] | null {
  if (!isRecord(graphFunction)) {
    return null;
  }
  const declarations = graphFunction["declarations"];
  if (!isRecord(declarations)) {
    return null;
  }
  const entries = declarations["entries"];
  if (!Array.isArray(entries)) {
    return null;
  }
  return Object.freeze(entries.map((entry: unknown): unknown => entry));
}

export function graphFunctionHasHofApplicationDeclarationKey(
  graphFunction: unknown
): boolean {
  return (
    declarationEntries(graphFunction)?.some(
      (entry) =>
        isRecord(entry) && entry["key"] === HOF_APPLICATION_DECLARATION_KEY
    ) ?? false
  );
}

export function graphFunctionDeclaresHofApplication(
  graphFunction: unknown
): boolean {
  if (
    !isRecord(graphFunction) ||
    !graphFunctionHasHofApplicationDeclarationKey(graphFunction)
  ) {
    return false;
  }
  try {
    const matches = declarationEntries(graphFunction)?.filter(
      (entry) =>
        isRecord(entry) && entry["key"] === HOF_APPLICATION_DECLARATION_KEY
    );
    if (matches?.length !== 1) {
      return false;
    }
    const value = isRecord(matches[0]) ? matches[0]["value"] : null;
    if (!isRecord(value) || value["kind"] !== "json_blob") {
      return false;
    }
    admitHofApplicationDeclaration(value["value"]);
    return true;
  } catch {
    return false;
  }
}

function diagnostic(input: {
  readonly classification?: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: HofRelationDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): HofRelationDiagnostic {
  function repairAffordance(): HofRelationRepairAffordance {
    switch (input.diagnosticId) {
      case "gtl-hof-missing-field":
        return "add_missing_declaration";
      case "gtl-hof-duplicate-field":
        return "remove_duplicate_declaration";
      case "gtl-hof-unresolved-ref":
        return "correct_reference";
      case "gtl-hof-unrealized-fan-out":
        return "realize_declared_semantics";
      case "gtl-hof-unknown-field":
      case "gtl-hof-invalid-operator-kind":
      case "gtl-hof-contract-mismatch":
      case "gtl-hof-wrapper-mismatch":
        return "correct_field_shape";
    }
  }
  return Object.freeze({
    kind: "hof_relation_diagnostic" as const,
    classification: input.classification ?? "invalid_program",
    diagnosticId: input.diagnosticId,
    path: input.path,
    expectedRelation: input.expectedRelation,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    repairAffordance: repairAffordance()
  });
}

function rejected(
  declaration: HofApplicationDeclaration | null,
  row: HofRelationDiagnostic
): HofRelationCompilation {
  return Object.freeze({
    observed: true,
    accepted: false,
    declaration,
    relation: null,
    diagnostics: Object.freeze([row])
  });
}

function compiledRelation(input: {
  readonly host: GraphFunction;
  readonly child: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
}): CompiledHofFanOutRelation {
  const basis = Object.freeze({
    kind: "compiled_hof_fan_out_relation" as const,
    declarationRelationRef: input.declaration.relationRef,
    hostGraphFunctionRef: input.host.id,
    hostGraphFunctionDigest: stableSha256Digest(input.host),
    childGraphFunctionRef: input.child.id,
    childGraphFunctionDigest: stableSha256Digest(input.child),
    wrapperGraphVectorRef: input.declaration.wrapperGraphVectorRef,
    inputMemberNodeRef: input.declaration.inputMemberNodeRef,
    inputMemberContractKey: input.declaration.inputMemberContractKey,
    outputMemberNodeRef: input.declaration.outputMemberNodeRef,
    outputMemberContractKey: input.declaration.outputMemberContractKey,
    inputVectorNodeRef: input.declaration.inputVectorNodeRef,
    inputVectorContractKey: input.declaration.inputVectorContractKey,
    outputVectorNodeRef: input.declaration.outputVectorNodeRef,
    outputVectorContractKey: input.declaration.outputVectorContractKey
  });
  const relationDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    relationBindingRef:
      `abg://hof/fan-out/relation/${relationDigest.slice("sha256:".length)}`,
    relationDigest
  });
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function exactNodeKey(node: Node): string {
  return JSON.stringify([node.id, nodeContractKey(node)]);
}

function sameNode(left: Node, right: Node): boolean {
  return exactNodeKey(left) === exactNodeKey(right);
}

function exactNodeKeys(nodes: readonly Node[]): readonly string[] {
  return Object.freeze(nodes.map(exactNodeKey));
}

function sameNodes(left: readonly Node[], right: readonly Node[]): boolean {
  return sameStrings(exactNodeKeys(left), exactNodeKeys(right));
}

function isNodeLike(value: unknown): value is Node {
  if (!isRecord(value) || !isRecord(value["schema"])) {
    return false;
  }
  const schema = value["schema"];
  return (
    stringField(value["id"]) !== null &&
    stringField(value["name"]) !== null &&
    stringField(schema["kind"]) !== null &&
    stringField(schema["ref"]) !== null &&
    isRecord(value["assetSurface"])
  );
}

function nodeArray(value: unknown): readonly Node[] | null {
  if (!Array.isArray(value) || !value.every(isNodeLike)) {
    return null;
  }
  return Object.freeze(value.map((node: Node): Node => node));
}

function stringArray(value: unknown): readonly string[] | null {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value
    : null;
}

function nodeRefAndContract(node: Node): {
  readonly nodeRef: string;
  readonly contractKey: string;
} {
  return Object.freeze({
    nodeRef: node.id,
    contractKey: nodeContractKey(node)
  });
}

function stableNodes(
  groups: readonly (readonly Node[])[]
): readonly Node[] {
  const seen = new Set<string>();
  const nodes: Node[] = [];
  for (const group of groups) {
    for (const node of group) {
      const key = exactNodeKey(node);
      if (!seen.has(key)) {
        seen.add(key);
        nodes.push(node);
      }
    }
  }
  return Object.freeze(nodes);
}

function graphVectorDeclarationsAreEmpty(vector: GraphVector): boolean {
  return (
    isRecord(vector.declarations) &&
    Array.isArray(vector.declarations.entries) &&
    vector.declarations.entries.length === 0
  );
}

function isGraphVectorLike(value: unknown): value is GraphVector {
  return (
    isRecord(value) &&
    stringField(value["id"]) !== null &&
    Array.isArray(value["source"]) &&
    isRecord(value["target"]) &&
    Array.isArray(value["operators"]) &&
    Array.isArray(value["evaluators"]) &&
    Array.isArray(value["contexts"]) &&
    typeof value["allowsSubwork"] === "boolean" &&
    isRecord(value["declarations"])
  );
}

function graphVectorArray(value: unknown): readonly GraphVector[] | null {
  if (!Array.isArray(value) || !value.every(isGraphVectorLike)) {
    return null;
  }
  return Object.freeze(value.map((vector: GraphVector): GraphVector => vector));
}

function relationEvidence(input: {
  readonly host: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
}): readonly string[] {
  return Object.freeze([
    `graph-function:${graphFunctionId(input.host) ?? "unknown"}`,
    `hof-relation:${input.declaration.relationRef}`,
    "requirement:REQ-L-GTL3-HOF-001"
  ]);
}

function relationRefDiagnostic(input: {
  readonly host: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
}): HofRelationDiagnostic | null {
  const declaration = input.declaration;
  const canonical = constructHofApplicationDeclaration({
    wrapperGraphVectorRef: declaration.wrapperGraphVectorRef,
    childGraphFunctionRef: declaration.childGraphFunctionRef,
    inputMemberNodeRef: declaration.inputMemberNodeRef,
    inputMemberContractKey: declaration.inputMemberContractKey,
    outputMemberNodeRef: declaration.outputMemberNodeRef,
    outputMemberContractKey: declaration.outputMemberContractKey,
    inputVectorNodeRef: declaration.inputVectorNodeRef,
    inputVectorContractKey: declaration.inputVectorContractKey,
    outputVectorNodeRef: declaration.outputVectorNodeRef,
    outputVectorContractKey: declaration.outputVectorContractKey
  });
  if (canonical.relationRef === declaration.relationRef) {
    return null;
  }
  return diagnostic({
    diagnosticId: "gtl-hof-contract-mismatch",
    path: "$.relation_ref",
    expectedRelation: canonical.relationRef,
    actualRelation: declaration.relationRef,
    evidenceRefs: relationEvidence(input)
  });
}

function childRelationDiagnostic(input: {
  readonly host: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
  readonly graphFunctions: readonly GraphFunction[];
}): { readonly child: GraphFunction | null; readonly diagnostic: HofRelationDiagnostic | null } {
  const matches = input.graphFunctions.filter(
    (candidate) => graphFunctionId(candidate) === input.declaration.childGraphFunctionRef
  );
  if (matches.length !== 1) {
    return Object.freeze({
      child: null,
      diagnostic: diagnostic({
        diagnosticId: "gtl-hof-unresolved-ref",
        path: "$.child_graph_function_ref",
        expectedRelation: "exactly one child GraphFunction id in the compilation root",
        actualRelation: `${String(matches.length)} matches for ${JSON.stringify(input.declaration.childGraphFunctionRef)}`,
        evidenceRefs: relationEvidence(input)
      })
    });
  }
  return Object.freeze({ child: matches[0] ?? null, diagnostic: null });
}

function memberAndVectorDiagnostic(input: {
  readonly host: GraphFunction;
  readonly child: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
}): HofRelationDiagnostic | null {
  const childInputs = nodeArray(input.child.inputs);
  const childOutputs = nodeArray(input.child.outputs);
  const hostInputs = nodeArray(input.host.inputs);
  const hostOutputs = nodeArray(input.host.outputs);
  if (
    childInputs?.length !== 1 ||
    childOutputs?.length !== 1 ||
    hostInputs?.length !== 1 ||
    hostOutputs?.length !== 1
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-contract-mismatch",
      path: "$.relation",
      expectedRelation: "one child input/output and one host vector input/output",
      actualRelation: described({
        childInputs: childInputs?.length ?? null,
        childOutputs: childOutputs?.length ?? null,
        hostInputs: hostInputs?.length ?? null,
        hostOutputs: hostOutputs?.length ?? null
      }),
      evidenceRefs: relationEvidence(input)
    });
  }

  const childInput = nodeRefAndContract(childInputs[0]!);
  const childOutput = nodeRefAndContract(childOutputs[0]!);
  const hostInput = nodeRefAndContract(hostInputs[0]!);
  const hostOutput = nodeRefAndContract(hostOutputs[0]!);
  try {
    admitHofVectorMemberSchema(
      hostInputs[0]!,
      childInputs[0]!,
      "HofApplicationDeclaration.inputVector"
    );
    admitHofVectorMemberSchema(
      hostOutputs[0]!,
      childOutputs[0]!,
      "HofApplicationDeclaration.outputVector"
    );
  } catch (error: unknown) {
    return diagnostic({
      diagnosticId: "gtl-hof-contract-mismatch",
      path: "$.relation.vector_schema",
      expectedRelation:
        "closed Vector[member] schemas joined to the exact child member schemas",
      actualRelation:
        error instanceof Error ? error.message : "vector schema admission failed",
      evidenceRefs: relationEvidence(input)
    });
  }
  const actual = Object.freeze({
    inputMemberNodeRef: childInput.nodeRef,
    inputMemberContractKey: childInput.contractKey,
    outputMemberNodeRef: childOutput.nodeRef,
    outputMemberContractKey: childOutput.contractKey,
    inputVectorNodeRef: hostInput.nodeRef,
    inputVectorContractKey: hostInput.contractKey,
    outputVectorNodeRef: hostOutput.nodeRef,
    outputVectorContractKey: hostOutput.contractKey
  });
  const expected = Object.freeze({
    inputMemberNodeRef: input.declaration.inputMemberNodeRef,
    inputMemberContractKey: input.declaration.inputMemberContractKey,
    outputMemberNodeRef: input.declaration.outputMemberNodeRef,
    outputMemberContractKey: input.declaration.outputMemberContractKey,
    inputVectorNodeRef: input.declaration.inputVectorNodeRef,
    inputVectorContractKey: input.declaration.inputVectorContractKey,
    outputVectorNodeRef: input.declaration.outputVectorNodeRef,
    outputVectorContractKey: input.declaration.outputVectorContractKey
  });
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    return null;
  }
  return diagnostic({
    diagnosticId: "gtl-hof-contract-mismatch",
    path: "$.relation",
    expectedRelation: described(expected),
    actualRelation: described(actual),
    evidenceRefs: relationEvidence(input)
  });
}

function outerAndWrapperDiagnostic(input: {
  readonly host: GraphFunction;
  readonly child: GraphFunction;
  readonly declaration: HofApplicationDeclaration;
}): HofRelationDiagnostic | null {
  const hostInputs = nodeArray(input.host.inputs);
  const hostOutputs = nodeArray(input.host.outputs);
  const requires = nodeArray(input.host.environment?.requires);
  const provides = nodeArray(input.host.environment?.provides);
  const carries = nodeArray(input.host.environment?.carries);
  const hostEffects = stringArray(input.host.effects);
  const childEffects = stringArray(input.child.effects);
  if (
    hostInputs === null ||
    hostOutputs === null ||
    requires === null ||
    provides === null ||
    carries === null ||
    hostEffects === null ||
    childEffects === null
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host",
      expectedRelation: "closed GraphFunction outer interface and effect arrays",
      actualRelation: "one or more host fields are malformed",
      evidenceRefs: relationEvidence(input)
    });
  }
  if (
    !sameNodes(hostInputs, requires) ||
    !sameNodes(hostOutputs, provides) ||
    !sameNodes(carries, stableNodes([hostInputs, hostOutputs])) ||
    !sameStrings(hostEffects, childEffects)
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.environment",
      expectedRelation:
        "requires=over, provides=into, carries=stable(over,into), effects=child effects",
      actualRelation: described({
        requires: interfaceContract(requires),
        provides: interfaceContract(provides),
        carries: interfaceContract(carries),
        effects: hostEffects
      }),
      evidenceRefs: relationEvidence(input)
    });
  }

  const declarationEntriesValue = declarationEntries(input.host);
  if (
    declarationEntriesValue === null ||
    declarationEntriesValue.length !== 1
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.declarations",
      expectedRelation: "exactly one host-owned gtl.hof_application declaration",
      actualRelation: `${String(declarationEntriesValue?.length ?? "malformed")} declaration entries`,
      evidenceRefs: relationEvidence(input)
    });
  }

  const template = input.host.template;
  if (!isRecord(template) || template["kind"] !== "inline_graph") {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.template",
      expectedRelation: "one inline wrapper graph",
      actualRelation: described(template),
      evidenceRefs: relationEvidence(input)
    });
  }
  const graph = template["graph"];
  if (!isRecord(graph)) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.template.graph",
      expectedRelation: "inline wrapper graph object",
      actualRelation: described(graph),
      evidenceRefs: relationEvidence(input)
    });
  }
  const graphInputs = nodeArray(graph["inputs"]);
  const graphOutputs = nodeArray(graph["outputs"]);
  const graphNodes = nodeArray(graph["nodes"]);
  const graphEffects = stringArray(graph["effects"]);
  const graphContexts = Array.isArray(graph["contexts"])
    ? graph["contexts"]
    : null;
  const graphRules = Array.isArray(graph["rules"]) ? graph["rules"] : null;
  const vectors = graphVectorArray(graph["vectors"]);
  if (
    graphInputs === null ||
    graphOutputs === null ||
    graphNodes === null ||
    graphEffects === null ||
    graphContexts === null ||
    graphRules === null ||
    vectors?.length !== 1 ||
    !sameNodes(graphInputs, hostInputs) ||
    !sameNodes(graphOutputs, hostOutputs) ||
    !sameNodes(graphNodes, stableNodes([hostInputs, hostOutputs])) ||
    !sameStrings(graphEffects, childEffects) ||
    graphContexts.length !== 0 ||
    graphRules.length !== 0
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.template.graph",
      expectedRelation:
        "exact outer vectors, child effects, no contexts/rules, and one wrapper vector",
      actualRelation: described({
        inputs: graphInputs,
        outputs: graphOutputs,
        nodes: graphNodes,
        effects: graphEffects,
        contextCount: graphContexts?.length ?? null,
        ruleCount: graphRules?.length ?? null,
        vectorCount: vectors?.length ?? null
      }),
      evidenceRefs: relationEvidence(input)
    });
  }

  const vector = vectors[0]!;
  const vectorSource = nodeArray(vector.source);
  const vectorOperators = Array.isArray(vector.operators) ? vector.operators : null;
  const vectorEvaluators = Array.isArray(vector.evaluators) ? vector.evaluators : null;
  const vectorContexts = Array.isArray(vector.contexts) ? vector.contexts : null;
  if (
    graphFunctionId(vector) !== input.declaration.wrapperGraphVectorRef ||
    vectorSource === null ||
    !sameNodes(vectorSource, hostInputs) ||
    !sameNode(vector.target, hostOutputs[0]!) ||
    vectorOperators?.length !== 0 ||
    vectorEvaluators?.length !== 0 ||
    vectorContexts?.length !== 0 ||
    vector.rule !== null ||
    vector.allowsSubwork !== true ||
    !graphVectorDeclarationsAreEmpty(vector)
  ) {
    return diagnostic({
      diagnosticId: "gtl-hof-wrapper-mismatch",
      path: "$.host.template.graph.vectors[0]",
      expectedRelation:
        "declared over->into wrapper with no local operators/evaluators/contexts/rule/declarations",
      actualRelation: described(vector),
      evidenceRefs: relationEvidence(input)
    });
  }
  return null;
}

export function compileHofRelation(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
}): HofRelationCompilation {
  if (!graphFunctionHasHofApplicationDeclarationKey(input.graphFunction)) {
    return Object.freeze({
      observed: false,
      accepted: true,
      declaration: null,
      relation: null,
      diagnostics: Object.freeze([])
    });
  }

  let declaration: HofApplicationDeclaration;
  let child: GraphFunction | null = null;
  try {
    const admitted = hofApplicationDeclarationFromDeclarations(
      input.graphFunction.declarations
    );
    if (admitted === null) {
      return rejected(
        null,
        diagnostic({
          diagnosticId: "gtl-hof-missing-field",
          path: "$.declarations",
          expectedRelation: "one gtl.hof_application declaration",
          actualRelation: "declaration key was observed but no declaration admitted",
          evidenceRefs: Object.freeze([
            `graph-function:${graphFunctionId(input.graphFunction) ?? "unknown"}`,
            "requirement:REQ-L-GTL3-HOF-001"
          ])
        })
      );
    }
    declaration = admitted;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "HOF admission failed";
    return rejected(
      null,
      diagnostic({
        diagnosticId:
          error instanceof HofApplicationAdmissionError
            ? error.diagnosticId
            : "gtl-hof-contract-mismatch",
        path:
          error instanceof HofApplicationAdmissionError
            ? error.path
            : "$.declarations.gtl.hof_application",
        expectedRelation: "closed canonical fan-out relation declaration",
        actualRelation: message,
        evidenceRefs: Object.freeze([
          `graph-function:${graphFunctionId(input.graphFunction) ?? "unknown"}`,
          "requirement:REQ-L-GTL3-HOF-001"
        ])
      })
    );
  }

  try {
    const relationRefFailure = relationRefDiagnostic({
      host: input.graphFunction,
      declaration
    });
    if (relationRefFailure !== null) {
      return rejected(declaration, relationRefFailure);
    }
    const childResult = childRelationDiagnostic({
      host: input.graphFunction,
      declaration,
      graphFunctions: input.graphFunctions
    });
    if (childResult.diagnostic !== null || childResult.child === null) {
      return rejected(
        declaration,
        childResult.diagnostic ??
          diagnostic({
            diagnosticId: "gtl-hof-unresolved-ref",
            path: "$.child_graph_function_ref",
            expectedRelation: "one child GraphFunction",
            actualRelation: "child resolution returned no value",
            evidenceRefs: relationEvidence({ host: input.graphFunction, declaration })
          })
      );
    }
    child = childResult.child;
    const contractFailure = memberAndVectorDiagnostic({
      host: input.graphFunction,
      child: childResult.child,
      declaration
    });
    if (contractFailure !== null) {
      return rejected(declaration, contractFailure);
    }
    const wrapperFailure = outerAndWrapperDiagnostic({
      host: input.graphFunction,
      child: childResult.child,
      declaration
    });
    if (wrapperFailure !== null) {
      return rejected(declaration, wrapperFailure);
    }
  } catch (error: unknown) {
    return rejected(
      declaration,
      diagnostic({
        diagnosticId: "gtl-hof-contract-mismatch",
        path: "$",
        expectedRelation: "fully resolved canonical fan-out relation",
        actualRelation:
          error instanceof Error ? error.message : "relation validation failed",
        evidenceRefs: relationEvidence({ host: input.graphFunction, declaration })
      })
    );
  }

  if (child === null) {
    return rejected(
      declaration,
      diagnostic({
        diagnosticId: "gtl-hof-unresolved-ref",
        path: "$.child_graph_function_ref",
        expectedRelation: "one resolved child GraphFunction",
        actualRelation: "structural validation completed without a child",
        evidenceRefs: relationEvidence({ host: input.graphFunction, declaration })
      })
    );
  }
  return Object.freeze({
    observed: true,
    accepted: true,
    declaration,
    relation: compiledRelation({
      host: input.graphFunction,
      child,
      declaration
    }),
    diagnostics: Object.freeze([])
  });
}
