// Implements: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

export const GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY =
  "gtl.requirements_algebra" as const;

export const GTL_REQUIREMENT_RELATION_KIND_VALUES = Object.freeze([
  "refinement",
  "dependency",
  "conflict",
  "obstruction",
  "mitigation",
  "assignment",
  "operationalization",
  "test",
  "assurance",
  "evidence",
  "contribution",
  "weakening",
  "restoration",
  "supersession"
] as const);

export type GtlRequirementRelationKind =
  (typeof GTL_REQUIREMENT_RELATION_KIND_VALUES)[number];

const GTL_REQUIREMENT_RELATION_KIND_SET: ReadonlySet<string> =
  new Set(GTL_REQUIREMENT_RELATION_KIND_VALUES);

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
  readonly relationKind: GtlRequirementRelationKind;
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
  readonly frameRefs: readonly string[];
  readonly zoomRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly aliasRefs: readonly string[];
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

export interface PublishedRequirementRouteRef {
  readonly namespace: "abg.requirements";
  readonly routeName: string;
  readonly routeVersion: string;
  readonly contractRef: string;
}

export interface GtlRequirementsLifecycleComposition {
  readonly kind: "gtl_requirements_lifecycle_composition";
  readonly compositionRef: string;
  readonly routeRefs: readonly PublishedRequirementRouteRef[];
  readonly sourceDigest: string;
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

function assertKnownRelationKind(
  value: string,
  label: string
): asserts value is GtlRequirementRelationKind {
  if (!GTL_REQUIREMENT_RELATION_KIND_SET.has(value)) {
    throw new TypeError(`${label} must be a known GTL requirement relation kind`);
  }
}

function assertUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate ref ${value}`);
    }
    seen.add(value);
  }
}

function assertRefsKnown(input: {
  readonly refs: readonly string[];
  readonly knownRefs: ReadonlySet<string>;
  readonly label: string;
}): void {
  for (const ref of input.refs) {
    if (!input.knownRefs.has(ref)) {
      throw new TypeError(`${input.label} contains dangling ref ${ref}`);
    }
  }
}

function freezePublishedRouteRefs(
  values: readonly PublishedRequirementRouteRef[],
  label: string
): readonly PublishedRequirementRouteRef[] {
  return Object.freeze(
    values.map((value, index) => {
      if (value.namespace !== "abg.requirements") {
        throw new TypeError(`${label}[${index}].namespace must be abg.requirements`);
      }
      assertNonEmptyString(value.routeName, `${label}[${index}].routeName`);
      assertNonEmptyString(value.routeVersion, `${label}[${index}].routeVersion`);
      assertNonEmptyString(value.contractRef, `${label}[${index}].contractRef`);
      return Object.freeze({
        namespace: value.namespace,
        routeName: value.routeName,
        routeVersion: value.routeVersion,
        contractRef: value.contractRef
      });
    })
  );
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

export function constructGtlRequirementRelationDeclaration(
  input: Omit<GtlRequirementRelationDeclaration, "kind">
): GtlRequirementRelationDeclaration {
  assertNonEmptyString(input.relationId, "GtlRequirementRelationDeclaration.relationId");
  assertKnownRelationKind(input.relationKind, "GtlRequirementRelationDeclaration.relationKind");
  assertNonEmptyString(input.fromRequirementId, "GtlRequirementRelationDeclaration.fromRequirementId");
  assertNonEmptyString(input.toRequirementId, "GtlRequirementRelationDeclaration.toRequirementId");
  return Object.freeze({
    kind: "gtl_requirement_relation_declaration",
    relationId: input.relationId,
    relationKind: input.relationKind,
    fromRequirementId: input.fromRequirementId,
    toRequirementId: input.toRequirementId
  });
}

export function constructGtlTraversalSpanDeclaration(input: {
  readonly spanId: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRefs: readonly string[];
  readonly vectorIndexes: readonly number[];
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly frameRefs?: readonly string[] | undefined;
  readonly zoomRefs?: readonly string[] | undefined;
  readonly foldbackRefs?: readonly string[] | undefined;
  readonly aliasRefs?: readonly string[] | undefined;
}): GtlTraversalSpanDeclaration {
  assertNonEmptyString(input.spanId, "GtlTraversalSpanDeclaration.spanId");
  assertNonEmptyString(input.graphFunctionRef, "GtlTraversalSpanDeclaration.graphFunctionRef");
  assertNonEmptyString(input.sourceNodeRef, "GtlTraversalSpanDeclaration.sourceNodeRef");
  assertNonEmptyString(input.targetNodeRef, "GtlTraversalSpanDeclaration.targetNodeRef");
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
    targetNodeRef: input.targetNodeRef,
    frameRefs: freezeStrings(input.frameRefs ?? [], "GtlTraversalSpanDeclaration.frameRefs"),
    zoomRefs: freezeStrings(input.zoomRefs ?? [], "GtlTraversalSpanDeclaration.zoomRefs"),
    foldbackRefs: freezeStrings(input.foldbackRefs ?? [], "GtlTraversalSpanDeclaration.foldbackRefs"),
    aliasRefs: freezeStrings(input.aliasRefs ?? [], "GtlTraversalSpanDeclaration.aliasRefs")
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
  const requirements = Object.freeze([...input.requirements]);
  const relations = Object.freeze(
    [...(input.relations ?? [])].map((relation) =>
      constructGtlRequirementRelationDeclaration({
        relationId: relation.relationId,
        relationKind: relation.relationKind,
        fromRequirementId: relation.fromRequirementId,
        toRequirementId: relation.toRequirementId
      })
    )
  );
  const spans = Object.freeze([...input.spans]);
  const testRelations = Object.freeze([...(input.testRelations ?? [])]);
  const requirementIds = new Set(requirements.map((requirement) => requirement.requirementId));
  const relationIds = new Set(relations.map((relation) => relation.relationId));
  const spanIds = new Set(spans.map((span) => span.spanId));
  assertUnique(requirements.map((requirement) => requirement.requirementId), "GtlRequirementsAlgebraDeclarationBundle.requirements.requirementId");
  assertUnique(requirements.map((requirement) => requirement.stableId), "GtlRequirementsAlgebraDeclarationBundle.requirements.stableId");
  assertUnique(relations.map((relation) => relation.relationId), "GtlRequirementsAlgebraDeclarationBundle.relations.relationId");
  assertUnique(spans.map((span) => span.spanId), "GtlRequirementsAlgebraDeclarationBundle.spans.spanId");
  assertUnique(testRelations.map((relation) => relation.relationRef), "GtlRequirementsAlgebraDeclarationBundle.testRelations.relationRef");
  for (const requirement of requirements) {
    assertRefsKnown({
      refs: requirement.relationRefs,
      knownRefs: relationIds,
      label: `GtlRequirementDeclaration(${requirement.requirementId}).relationRefs`
    });
    assertRefsKnown({
      refs: requirement.spanRefs,
      knownRefs: spanIds,
      label: `GtlRequirementDeclaration(${requirement.requirementId}).spanRefs`
    });
  }
  for (const relation of relations) {
    assertRefsKnown({
      refs: [relation.fromRequirementId, relation.toRequirementId],
      knownRefs: requirementIds,
      label: `GtlRequirementRelationDeclaration(${relation.relationId}).endpoints`
    });
  }
  for (const relation of testRelations) {
    assertRefsKnown({
      refs: [relation.requirementId],
      knownRefs: requirementIds,
      label: `GtlRequirementTestRelationDeclaration(${relation.relationRef}).requirementId`
    });
  }
  return Object.freeze({
    kind: "gtl_requirements_algebra_declaration_bundle",
    declarationKey: GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY,
    requirements,
    relations,
    spans,
    contextFragments: Object.freeze([...(input.contextFragments ?? [])]),
    destinationTopologies: Object.freeze([...(input.destinationTopologies ?? [])]),
    testRelations
  });
}

export function constructGtlRequirementsLifecycleComposition(
  input: Omit<GtlRequirementsLifecycleComposition, "kind">
): GtlRequirementsLifecycleComposition {
  assertNonEmptyString(input.compositionRef, "GtlRequirementsLifecycleComposition.compositionRef");
  assertNonEmptyString(input.sourceDigest, "GtlRequirementsLifecycleComposition.sourceDigest");
  if (input.routeRefs.length === 0) {
    throw new TypeError("GtlRequirementsLifecycleComposition.routeRefs must be non-empty");
  }
  return Object.freeze({
    kind: "gtl_requirements_lifecycle_composition",
    compositionRef: input.compositionRef,
    routeRefs: freezePublishedRouteRefs(input.routeRefs, "GtlRequirementsLifecycleComposition.routeRefs"),
    sourceDigest: input.sourceDigest
  });
}
