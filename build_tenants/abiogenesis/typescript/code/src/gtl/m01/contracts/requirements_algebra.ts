// Implements: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

export const GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY =
  "gtl.requirements_algebra" as const;

export interface GtlRequirementDeclaration {
  readonly kind: "gtl_requirement_declaration";
  readonly requirementId: string;
  readonly termKind: "atom" | "composition";
  readonly stableId: string;
  readonly sourceRef: string;
  readonly sourceDigest: string;
  readonly relationRefs: readonly string[];
  readonly spanRefs: readonly string[];
  readonly contextRefs: readonly string[];
  readonly evidencePolicyRefs: readonly string[];
}

export interface GtlRequirementRelationDeclaration {
  readonly kind: "gtl_requirement_relation_declaration";
  readonly relationId: string;
  readonly relationKind:
    | "refinement"
    | "dependency"
    | "conflict"
    | "obstruction"
    | "mitigation"
    | "assignment"
    | "operationalization"
    | "test"
    | "assurance"
    | "evidence"
    | "contribution"
    | "weakening"
    | "restoration"
    | "supersession";
  readonly fromRequirementId: string;
  readonly toRequirementId: string;
}

export interface GtlTraversalSpanDeclaration {
  readonly kind: "gtl_traversal_span_declaration";
  readonly spanId: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRefs: readonly string[];
  readonly vectorIndexes: readonly number[];
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
}

export interface GtlAuthorityContextFragmentDeclaration {
  readonly kind: "gtl_authority_context_fragment_declaration";
  readonly fragmentRef: string;
  readonly originStage:
    | "homeostatic_gap"
    | "problem"
    | "solution_space"
    | "intent"
    | "product"
    | "requirements"
    | "destination_topology"
    | "instruction_set"
    | "runtime"
    | "assurance";
  readonly constraintScope: string;
  readonly digest: string;
  readonly promotionPolicyRef: string;
  readonly appliesToRefs: readonly string[];
}

export interface GtlDestinationTopologyDeclaration {
  readonly kind: "gtl_destination_topology_declaration";
  readonly topologyRef: string;
  readonly frameworkRef: string;
  readonly constraintRefs: readonly string[];
  readonly appliesToRefs: readonly string[];
}

export interface GtlRequirementTestRelationDeclaration {
  readonly kind: "gtl_requirement_test_relation_declaration";
  readonly relationRef: string;
  readonly requirementId: string;
  readonly assetProjectionRef: string;
  readonly testSourceProjectionRef: string;
  readonly testExecutionProjectionRef: string;
  readonly interpretationProjectionRef: string;
  readonly componentTestRootRefs: readonly string[];
  readonly evidencePolicyRef: string;
}

export interface GtlRequirementsAlgebraDeclarationBundle {
  readonly kind: "gtl_requirements_algebra_declaration_bundle";
  readonly declarationKey: typeof GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY;
  readonly requirements: readonly GtlRequirementDeclaration[];
  readonly relations: readonly GtlRequirementRelationDeclaration[];
  readonly spans: readonly GtlTraversalSpanDeclaration[];
  readonly contextFragments: readonly GtlAuthorityContextFragmentDeclaration[];
  readonly destinationTopologies: readonly GtlDestinationTopologyDeclaration[];
  readonly testRelations: readonly GtlRequirementTestRelationDeclaration[];
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

function freezeStrings(values: readonly string[], label: string): readonly string[] {
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
  }
  return Object.freeze([...values]);
}

function freezeNumbers(values: readonly number[], label: string): readonly number[] {
  for (const [index, value] of values.entries()) {
    if (!Number.isInteger(value) || value < 0) {
      throw new TypeError(`${label}[${index}] must be a non-negative integer`);
    }
  }
  return Object.freeze([...values]);
}

export function constructGtlRequirementDeclaration(
  input: Omit<GtlRequirementDeclaration, "kind">
): GtlRequirementDeclaration {
  assertNonEmptyString(input.requirementId, "GtlRequirementDeclaration.requirementId");
  assertNonEmptyString(input.stableId, "GtlRequirementDeclaration.stableId");
  assertNonEmptyString(input.sourceRef, "GtlRequirementDeclaration.sourceRef");
  assertNonEmptyString(input.sourceDigest, "GtlRequirementDeclaration.sourceDigest");
  return Object.freeze({
    kind: "gtl_requirement_declaration",
    requirementId: input.requirementId,
    termKind: input.termKind,
    stableId: input.stableId,
    sourceRef: input.sourceRef,
    sourceDigest: input.sourceDigest,
    relationRefs: freezeStrings(input.relationRefs, "GtlRequirementDeclaration.relationRefs"),
    spanRefs: freezeStrings(input.spanRefs, "GtlRequirementDeclaration.spanRefs"),
    contextRefs: freezeStrings(input.contextRefs, "GtlRequirementDeclaration.contextRefs"),
    evidencePolicyRefs: freezeStrings(input.evidencePolicyRefs, "GtlRequirementDeclaration.evidencePolicyRefs")
  });
}

export function constructGtlTraversalSpanDeclaration(
  input: Omit<GtlTraversalSpanDeclaration, "kind">
): GtlTraversalSpanDeclaration {
  assertNonEmptyString(input.spanId, "GtlTraversalSpanDeclaration.spanId");
  assertNonEmptyString(input.graphFunctionRef, "GtlTraversalSpanDeclaration.graphFunctionRef");
  if (input.graphVectorRefs.length === 0 && input.vectorIndexes.length === 0) {
    throw new TypeError("GtlTraversalSpanDeclaration requires graph vector identity");
  }
  return Object.freeze({
    kind: "gtl_traversal_span_declaration",
    spanId: input.spanId,
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRefs: freezeStrings(input.graphVectorRefs, "GtlTraversalSpanDeclaration.graphVectorRefs"),
    vectorIndexes: freezeNumbers(input.vectorIndexes, "GtlTraversalSpanDeclaration.vectorIndexes"),
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef
  });
}

export function constructGtlRequirementsAlgebraDeclarationBundle(input: {
  readonly requirements: readonly GtlRequirementDeclaration[];
  readonly relations?: readonly GtlRequirementRelationDeclaration[] | undefined;
  readonly spans: readonly GtlTraversalSpanDeclaration[];
  readonly contextFragments?: readonly GtlAuthorityContextFragmentDeclaration[] | undefined;
  readonly destinationTopologies?: readonly GtlDestinationTopologyDeclaration[] | undefined;
  readonly testRelations?: readonly GtlRequirementTestRelationDeclaration[] | undefined;
}): GtlRequirementsAlgebraDeclarationBundle {
  return Object.freeze({
    kind: "gtl_requirements_algebra_declaration_bundle",
    declarationKey: GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY,
    requirements: Object.freeze([...input.requirements]),
    relations: Object.freeze([...(input.relations ?? [])]),
    spans: Object.freeze([...input.spans]),
    contextFragments: Object.freeze([...(input.contextFragments ?? [])]),
    destinationTopologies: Object.freeze([...(input.destinationTopologies ?? [])]),
    testRelations: Object.freeze([...(input.testRelations ?? [])])
  });
}

