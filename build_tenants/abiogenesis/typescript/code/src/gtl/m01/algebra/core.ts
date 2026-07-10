// Implements: REQ-L-GTL3-COMPOSE
// Implements: REQ-L-GTL3-SUBSTITUTE
// Implements: REQ-L-GTL3-HOF
// Implements: REQ-L-GTL3-LAWS
// Implements: REQ-L-GTL3-IDENTITY
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY
// Implements: REQ-L-GTL3-SYNTHESIS

import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../contracts/constructors.js";
import {
  type Context,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type Node,
  type Operator,
  type Rule,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue
} from "../contracts/carriers.js";
import {
  GTL_NODE_TYPE_GRAPH_FUNCTION_TAG,
  interfaceContract,
  materializeGraphFunction,
  nodeContractKey
} from "../contracts/carriers.js";

export const GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY =
  "gtl.zoom.refinement_boundary_ref";
export const GRAPH_FUNCTION_ZOOM_CANDIDATE_FAMILY_DECLARATION_KEY =
  "gtl.zoom.candidate_family_ref";
export const GRAPH_FUNCTION_ZOOM_PUBLISHED_TRAVERSAL_TARGET_DECLARATION_KEY =
  "gtl.zoom.published_traversal_target_ref";

export type NodeTypeSatisfactionRejectionReason =
  | "unknown_type"
  | "node_type_not_identity_graph_function"
  | "node_type_ref_mismatch"
  | "schema_weakened"
  | "markov_weakened"
  | "asset_surface_weakened";

export interface NodeTypeSatisfactionResult {
  readonly kind: "node_type_satisfaction";
  readonly nodeRef: string;
  readonly typeRef: string;
  readonly satisfied: boolean;
  readonly rejectionReason: NodeTypeSatisfactionRejectionReason | null;
  readonly typeNode: Node | null;
}

export type NodeTypeCompositionRejectionReason =
  | NodeTypeSatisfactionRejectionReason
  | "empty_composition"
  | "schema_conflict"
  | "asset_surface_conflict";

export interface NodeTypeCompositionResult {
  readonly kind: "node_type_composition";
  readonly typeRef: string;
  readonly constituentTypeRefs: readonly string[];
  readonly satisfied: boolean;
  readonly rejectionReason: NodeTypeCompositionRejectionReason | null;
  readonly graphFunction: GraphFunction | null;
}

export interface GraphFunctionTypeWiring {
  readonly providedNodeName: string;
  readonly requiredNodeName: string;
  readonly typeRef: string;
}

export interface GraphFunctionZoomAuthority {
  readonly refinementBoundaryRef?: string | null | undefined;
  readonly candidateFamilyRef?: string | null | undefined;
  readonly publishedTraversalTargetRef?: string | null | undefined;
}

export interface GraphFunctionZoomPlan {
  readonly kind: "graph_function_zoom_plan";
  readonly planRef: string;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphRef: string;
  readonly targetGraphVectorRef: string;
  readonly targetGraphVectorName: string;
  readonly targetSourceNodeRefs: readonly string[];
  readonly targetNodeRef: string;
  readonly refinementGraphFunctionRef: string;
  readonly refinementGraphRef: string;
  readonly substitutedGraphRef: string;
  readonly refinementBoundaryRef: string | null;
  readonly candidateFamilyRef: string | null;
  readonly publishedTraversalTargetRef: string | null;
  readonly authorityRefs: readonly string[];
}

export interface GraphFunctionZoomPlanInput extends GraphFunctionZoomAuthority {
  readonly parent: GraphFunction;
  readonly refinement: GraphFunction;
  readonly planRef?: string | undefined;
}

export interface GraphFunctionZoomApplyInput {
  readonly parent: GraphFunction;
  readonly refinement: GraphFunction;
  readonly plan: GraphFunctionZoomPlan;
  readonly name?: string | undefined;
  readonly declarations?: SerializedAttrs | undefined;
  readonly tags?: readonly string[] | undefined;
}

export interface GraphFunctionZoomInput extends GraphFunctionZoomPlanInput {
  readonly name?: string | undefined;
  readonly declarations?: SerializedAttrs | undefined;
  readonly tags?: readonly string[] | undefined;
}

export interface GraphFunctionZoomResult {
  readonly kind: "graph_function_zoom_result";
  readonly plan: GraphFunctionZoomPlan;
  readonly graphFunction: GraphFunction;
}

function stableUnion(values: readonly (readonly string[])[]): readonly string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of values) {
    for (const value of group) {
      if (!seen.has(value)) {
        seen.add(value);
        merged.push(value);
      }
    }
  }
  return Object.freeze(merged);
}

function includesAll(
  actual: readonly string[],
  required: readonly string[]
): boolean {
  const actualSet = new Set(actual);
  return required.every((value) => actualSet.has(value));
}

function serializedAuthoritySlot(slot: Node["assetSurface"]["authoritySlots"][number]): string {
  return JSON.stringify({
    authorityKindRef: slot.authorityKindRef,
    disposition: slot.disposition,
    fallbackPreconditionRefs: [...slot.fallbackPreconditionRefs]
  });
}

function assetSurfacePreserves(local: Node, required: Node): boolean {
  const localSurface = local.assetSurface;
  const requiredSurface = required.assetSurface;
  if (localSurface.kind !== requiredSurface.kind) {
    return false;
  }
  if (!includesAll(localSurface.requiredContexts, requiredSurface.requiredContexts)) {
    return false;
  }
  if (!includesAll(localSurface.standardsRefs, requiredSurface.standardsRefs)) {
    return false;
  }
  if (!includesAll(localSurface.outputContractRefs, requiredSurface.outputContractRefs)) {
    return false;
  }
  if (!includesAll(localSurface.constructorRefs, requiredSurface.constructorRefs)) {
    return false;
  }
  if (
    !includesAll(
      localSurface.constructorInputAssetKinds,
      requiredSurface.constructorInputAssetKinds
    )
  ) {
    return false;
  }
  if (!includesAll(localSurface.rendererRefs, requiredSurface.rendererRefs)) {
    return false;
  }
  if (
    requiredSurface.renderedViewDigestPolicyRef !== null &&
    localSurface.renderedViewDigestPolicyRef !==
      requiredSurface.renderedViewDigestPolicyRef
  ) {
    return false;
  }
  if (!includesAll(localSurface.sectionKindRefs, requiredSurface.sectionKindRefs)) {
    return false;
  }
  if (!includesAll(localSurface.clauseKindRefs, requiredSurface.clauseKindRefs)) {
    return false;
  }
  const localAuthoritySlots = new Set(
    localSurface.authoritySlots.map(serializedAuthoritySlot)
  );
  for (const slot of requiredSurface.authoritySlots) {
    if (!localAuthoritySlots.has(serializedAuthoritySlot(slot))) {
      return false;
    }
  }
  return includesAll(
    localSurface.proofObligationRefs,
    requiredSurface.proofObligationRefs
  );
}

const MERGE_CONFLICT: unique symbol = Symbol("merge_conflict");

function mergeNullableRef(
  left: string | null,
  right: string | null
): string | null | typeof MERGE_CONFLICT {
  if (left === null) {
    return right;
  }
  if (right === null || left === right) {
    return left;
  }
  return "conflict";
}

function mergeAuthoritySlots(
  values: readonly Node["assetSurface"]["authoritySlots"][]
): readonly Node["assetSurface"]["authoritySlots"][number][] {
  const byKey = new Map<string, Node["assetSurface"]["authoritySlots"][number]>();
  for (const slots of values) {
    for (const slot of slots) {
      byKey.set(serializedAuthoritySlot(slot), slot);
    }
  }
  return Object.freeze([...byKey.values()]);
}

function mergeAssetSurfaces(
  nodes: readonly Node[]
): Node["assetSurface"] | "conflict" {
  const [first] = nodes;
  if (first === undefined) {
    return "conflict";
  }
  let renderedViewDigestPolicyRef = first.assetSurface.renderedViewDigestPolicyRef;
  for (const node of nodes.slice(1)) {
    if (node.assetSurface.kind !== first.assetSurface.kind) {
      return "conflict";
    }
    const mergedDigest = mergeNullableRef(
      renderedViewDigestPolicyRef,
      node.assetSurface.renderedViewDigestPolicyRef
    );
    if (mergedDigest === MERGE_CONFLICT) {
      return "conflict";
    }
    renderedViewDigestPolicyRef = mergedDigest;
  }
  return Object.freeze({
    kind: first.assetSurface.kind,
    requiredContexts: stableUnion(nodes.map((node) => node.assetSurface.requiredContexts)),
    standardsRefs: stableUnion(nodes.map((node) => node.assetSurface.standardsRefs)),
    outputContractRefs: stableUnion(
      nodes.map((node) => node.assetSurface.outputContractRefs)
    ),
    constructorRefs: stableUnion(nodes.map((node) => node.assetSurface.constructorRefs)),
    constructorInputAssetKinds: stableUnion(
      nodes.map((node) => node.assetSurface.constructorInputAssetKinds)
    ),
    rendererRefs: stableUnion(nodes.map((node) => node.assetSurface.rendererRefs)),
    renderedViewDigestPolicyRef,
    sectionKindRefs: stableUnion(nodes.map((node) => node.assetSurface.sectionKindRefs)),
    clauseKindRefs: stableUnion(nodes.map((node) => node.assetSurface.clauseKindRefs)),
    authoritySlots: mergeAuthoritySlots(
      nodes.map((node) => node.assetSurface.authoritySlots)
    ),
    proofObligationRefs: stableUnion(
      nodes.map((node) => node.assetSurface.proofObligationRefs)
    )
  });
}

function nodeTypeIdentityRejection(
  graphFunction: GraphFunction,
  typeRef: string
): NodeTypeSatisfactionRejectionReason | null {
  if (!graphFunction.tags.includes(GTL_NODE_TYPE_GRAPH_FUNCTION_TAG)) {
    return "node_type_not_identity_graph_function";
  }
  if (graphFunction.name !== typeRef) {
    return "unknown_type";
  }
  if (graphFunction.effects.length > 0) {
    return "node_type_not_identity_graph_function";
  }
  if (
    graphFunction.inputs.length !== 1 ||
    graphFunction.outputs.length !== 1 ||
    graphFunction.environment.requires.length !== 1 ||
    graphFunction.environment.provides.length !== 1 ||
    graphFunction.environment.carries.length !== 1
  ) {
    return "node_type_not_identity_graph_function";
  }
  const [inputNode] = graphFunction.inputs;
  const [outputNode] = graphFunction.outputs;
  const [requiredNode] = graphFunction.environment.requires;
  const [providedNode] = graphFunction.environment.provides;
  const [carriedNode] = graphFunction.environment.carries;
  if (
    inputNode === undefined ||
    outputNode === undefined ||
    requiredNode === undefined ||
    providedNode === undefined ||
    carriedNode === undefined
  ) {
    return "node_type_not_identity_graph_function";
  }
  const contract = nodeContractKey(inputNode);
  if (
    nodeContractKey(outputNode) !== contract ||
    nodeContractKey(requiredNode) !== contract ||
    nodeContractKey(providedNode) !== contract ||
    nodeContractKey(carriedNode) !== contract
  ) {
    return "node_type_not_identity_graph_function";
  }
  return null;
}

export function constructNodeTypeGraphFunction(
  node: Node,
  options?: {
    readonly typeRef?: string | undefined;
    readonly declarations?: SerializedAttrs | undefined;
    readonly tags?: readonly string[] | undefined;
  }
): GraphFunction {
  const typeRef = options?.typeRef ?? node.typeRef;
  if (typeRef === null || typeRef === undefined || typeRef.length === 0) {
    throw new TypeError("NodeType.typeRef: expected non-empty type ref");
  }
  const typedNode = node.typeRef === typeRef
    ? node
    : constructNode({
        name: node.name,
        schema: node.schema,
        typeRef,
        markov: node.markov,
        assetSurface: node.assetSurface,
        tags: node.tags
      });
  const identityOptions: {
    readonly name: string;
    readonly declarations?: SerializedAttrs;
    readonly tags: readonly string[];
  } = {
    name: typeRef,
    tags: stableUnion([
      [GTL_NODE_TYPE_GRAPH_FUNCTION_TAG],
      options?.tags ?? []
    ])
  };
  return identity(
    [typedNode],
    options?.declarations === undefined
      ? identityOptions
      : {
          ...identityOptions,
          declarations: options.declarations
        }
  );
}

export function materializeNodeType(input: {
  readonly typeRef: string;
  readonly graphFunctions: readonly GraphFunction[];
}): NodeTypeSatisfactionResult {
  const graphFunction = input.graphFunctions.find(
    (candidate) => candidate.name === input.typeRef
  );
  if (graphFunction === undefined) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: "",
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: "unknown_type",
      typeNode: null
    });
  }
  const identityRejection = nodeTypeIdentityRejection(graphFunction, input.typeRef);
  if (identityRejection !== null) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: "",
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: identityRejection,
      typeNode: null
    });
  }
  const [typeNode] = graphFunction.inputs;
  if (typeNode === undefined) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: "",
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: "node_type_not_identity_graph_function",
      typeNode: null
    });
  }
  return Object.freeze({
    kind: "node_type_satisfaction",
    nodeRef: typeNode.name,
    typeRef: input.typeRef,
    satisfied: true,
    rejectionReason: null,
    typeNode
  });
}

export function satisfiesNodeType(input: {
  readonly node: Node;
  readonly typeRef: string;
  readonly graphFunctions: readonly GraphFunction[];
}): NodeTypeSatisfactionResult {
  const materialized = materializeNodeType({
    typeRef: input.typeRef,
    graphFunctions: input.graphFunctions
  });
  if (!materialized.satisfied || materialized.typeNode === null) {
    return Object.freeze({
      ...materialized,
      nodeRef: input.node.name
    });
  }
  const typeNode = materialized.typeNode;
  if (input.node.typeRef !== input.typeRef) {
    if (input.node.typeRef === null) {
      return Object.freeze({
        kind: "node_type_satisfaction",
        nodeRef: input.node.name,
        typeRef: input.typeRef,
        satisfied: false,
        rejectionReason: "node_type_ref_mismatch",
        typeNode
      });
    }
    const declaredType = materializeNodeType({
      typeRef: input.node.typeRef,
      graphFunctions: input.graphFunctions
    });
    if (!declaredType.satisfied || declaredType.typeNode === null) {
      return Object.freeze({
        kind: "node_type_satisfaction",
        nodeRef: input.node.name,
        typeRef: input.typeRef,
        satisfied: false,
        rejectionReason: "node_type_ref_mismatch",
        typeNode
      });
    }
  }
  if (JSON.stringify(input.node.schema) !== JSON.stringify(typeNode.schema)) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: input.node.name,
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: "schema_weakened",
      typeNode
    });
  }
  if (!includesAll(input.node.markov, typeNode.markov)) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: input.node.name,
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: "markov_weakened",
      typeNode
    });
  }
  if (!assetSurfacePreserves(input.node, typeNode)) {
    return Object.freeze({
      kind: "node_type_satisfaction",
      nodeRef: input.node.name,
      typeRef: input.typeRef,
      satisfied: false,
      rejectionReason: "asset_surface_weakened",
      typeNode
    });
  }
  return Object.freeze({
    kind: "node_type_satisfaction",
    nodeRef: input.node.name,
    typeRef: input.typeRef,
    satisfied: true,
    rejectionReason: null,
    typeNode
  });
}

export function composeNodeTypes(input: {
  readonly typeRef: string;
  readonly constituentTypeRefs: readonly string[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly name?: string | undefined;
  readonly tags?: readonly string[] | undefined;
}): NodeTypeCompositionResult {
  if (input.constituentTypeRefs.length === 0) {
    return Object.freeze({
      kind: "node_type_composition",
      typeRef: input.typeRef,
      constituentTypeRefs: Object.freeze([]),
      satisfied: false,
      rejectionReason: "empty_composition",
      graphFunction: null
    });
  }

  const typeNodes: Node[] = [];
  for (const typeRef of input.constituentTypeRefs) {
    const materialized = materializeNodeType({
      typeRef,
      graphFunctions: input.graphFunctions
    });
    if (!materialized.satisfied || materialized.typeNode === null) {
      return Object.freeze({
        kind: "node_type_composition",
        typeRef: input.typeRef,
        constituentTypeRefs: Object.freeze([...input.constituentTypeRefs]),
        satisfied: false,
        rejectionReason: materialized.rejectionReason ?? "unknown_type",
        graphFunction: null
      });
    }
    typeNodes.push(materialized.typeNode);
  }

  const [first] = typeNodes;
  if (first === undefined) {
    return Object.freeze({
      kind: "node_type_composition",
      typeRef: input.typeRef,
      constituentTypeRefs: Object.freeze([...input.constituentTypeRefs]),
      satisfied: false,
      rejectionReason: "empty_composition",
      graphFunction: null
    });
  }
  for (const node of typeNodes.slice(1)) {
    if (JSON.stringify(node.schema) !== JSON.stringify(first.schema)) {
      return Object.freeze({
        kind: "node_type_composition",
        typeRef: input.typeRef,
        constituentTypeRefs: Object.freeze([...input.constituentTypeRefs]),
        satisfied: false,
        rejectionReason: "schema_conflict",
        graphFunction: null
      });
    }
  }

  const assetSurface = mergeAssetSurfaces(typeNodes);
  if (assetSurface === "conflict") {
    return Object.freeze({
      kind: "node_type_composition",
      typeRef: input.typeRef,
      constituentTypeRefs: Object.freeze([...input.constituentTypeRefs]),
      satisfied: false,
      rejectionReason: "asset_surface_conflict",
      graphFunction: null
    });
  }

  const node = constructNode({
    name: input.name ?? first.name,
    schema: first.schema,
    typeRef: input.typeRef,
    markov: stableUnion(typeNodes.map((typeNode) => typeNode.markov)),
    assetSurface,
    tags: stableUnion([
      ["gtl:composed_node_type"],
      input.tags ?? []
    ])
  });

  return Object.freeze({
    kind: "node_type_composition",
    typeRef: input.typeRef,
    constituentTypeRefs: Object.freeze([...input.constituentTypeRefs]),
    satisfied: true,
    rejectionReason: null,
    graphFunction: constructNodeTypeGraphFunction(node, {
      typeRef: input.typeRef,
      tags: stableUnion([
        ["gtl:composed_node_type"],
        input.tags ?? []
      ])
    })
  });
}

function entriesEqual(left: SerializedAttrEntry, right: SerializedAttrEntry): boolean {
  return (
    left.key === right.key &&
    JSON.stringify(left.value) === JSON.stringify(right.value)
  );
}

function mergeSerializedAttrs(values: readonly SerializedAttrs[]): SerializedAttrs {
  const merged: SerializedAttrEntry[] = [];

  for (const attrs of values) {
    for (const entry of attrs.entries) {
      const existing = merged.find((candidate) => candidate.key === entry.key);
      if (existing === undefined) {
        merged.push(entry);
        continue;
      }
      if (!entriesEqual(existing, entry)) {
        throw new TypeError(
          `Conflicting serialized declaration for key ${entry.key}`
        );
      }
    }
  }

  return Object.freeze({
    entries: Object.freeze(merged)
  });
}

function attrsFromEntries(entries: readonly SerializedAttrEntry[]): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze([...entries])
  });
}

function jsonObjectValue(
  entries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[]
): SerializedJsonValue {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      entries.map((entry) =>
        Object.freeze({
          key: entry.key,
          value: entry.value
        })
      )
    )
  });
}

function jsonArrayValue(values: readonly SerializedJsonValue[]): SerializedJsonValue {
  return Object.freeze({
    kind: "array",
    items: Object.freeze([...values])
  });
}

function serializedAttrValueToJson(value: SerializedAttrValue): SerializedJsonValue {
  if (value.kind === "scalar") {
    return value.value;
  }
  if (value.kind === "string_list") {
    return jsonArrayValue(value.value);
  }
  if (value.kind === "hook_ref") {
    return jsonObjectValue([
      { key: "ref", value: value.value.ref },
      {
        key: "config",
        value: serializedAttrsToJsonObject(value.value.config)
      }
    ]);
  }
  return value.value;
}

function serializedAttrsToJsonObject(attrs: SerializedAttrs): SerializedJsonValue {
  return jsonObjectValue(
    attrs.entries.map((entry) => ({
      key: entry.key,
      value: serializedAttrValueToJson(entry.value)
    }))
  );
}

function jsonBlobEntry(
  key: string,
  entries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[]
): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "json_blob",
      value: jsonObjectValue(entries)
    })
  });
}

function optionalNonEmptyString(
  value: string | null | undefined,
  label: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (value.length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return value;
}

function graphFunctionZoomAuthority(
  input: GraphFunctionZoomAuthority
): {
  readonly refinementBoundaryRef: string | null;
  readonly candidateFamilyRef: string | null;
  readonly publishedTraversalTargetRef: string | null;
  readonly authorityRefs: readonly string[];
} {
  const refinementBoundaryRef = optionalNonEmptyString(
    input.refinementBoundaryRef,
    "GraphFunctionZoomAuthority.refinementBoundaryRef"
  );
  const candidateFamilyRef = optionalNonEmptyString(
    input.candidateFamilyRef,
    "GraphFunctionZoomAuthority.candidateFamilyRef"
  );
  const publishedTraversalTargetRef = optionalNonEmptyString(
    input.publishedTraversalTargetRef,
    "GraphFunctionZoomAuthority.publishedTraversalTargetRef"
  );
  const authorityRefs = stableUnion([
    [
      ...[refinementBoundaryRef].filter((ref): ref is string => ref !== null),
      ...[candidateFamilyRef].filter((ref): ref is string => ref !== null),
      ...[publishedTraversalTargetRef].filter(
        (ref): ref is string => ref !== null
      )
    ]
  ]);
  if (authorityRefs.length === 0) {
    throw new TypeError(
      "GraphFunction zoom requires RefinementBoundary, CandidateFamily, or published traversal target authority"
    );
  }
  return Object.freeze({
    refinementBoundaryRef,
    candidateFamilyRef,
    publishedTraversalTargetRef,
    authorityRefs
  });
}

function attrStringValues(entry: SerializedAttrEntry | undefined): readonly string[] {
  if (entry === undefined) {
    return Object.freeze([]);
  }
  if (entry.value.kind === "scalar") {
    return typeof entry.value.value === "string"
      ? Object.freeze([entry.value.value])
      : Object.freeze([]);
  }
  if (entry.value.kind === "string_list") {
    return entry.value.value;
  }
  return Object.freeze([]);
}

function attrsContainString(
  attrs: SerializedAttrs,
  key: string,
  expected: string
): boolean {
  return attrStringValues(
    attrs.entries.find((entry) => entry.key === key)
  ).includes(expected);
}

function vectorMatchesZoomAuthority(input: {
  readonly vector: GraphVector;
  readonly authority: ReturnType<typeof graphFunctionZoomAuthority>;
}): boolean {
  const checks: readonly {
    readonly ref: string | null;
    readonly key: string;
  }[] = Object.freeze([
    Object.freeze({
      ref: input.authority.refinementBoundaryRef,
      key: GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY
    }),
    Object.freeze({
      ref: input.authority.candidateFamilyRef,
      key: GRAPH_FUNCTION_ZOOM_CANDIDATE_FAMILY_DECLARATION_KEY
    }),
    Object.freeze({
      ref: input.authority.publishedTraversalTargetRef,
      key: GRAPH_FUNCTION_ZOOM_PUBLISHED_TRAVERSAL_TARGET_DECLARATION_KEY
    })
  ]);

  return checks.every(
    (check) =>
      check.ref === null ||
      attrsContainString(input.vector.declarations, check.key, check.ref)
  );
}

function resolveGraphFunctionZoomTargetVector(input: {
  readonly graph: Graph;
  readonly authority: ReturnType<typeof graphFunctionZoomAuthority>;
}): GraphVector {
  const matches = input.graph.vectors.filter((vector) =>
    vectorMatchesZoomAuthority({ vector, authority: input.authority })
  );
  if (matches.length === 0) {
    throw new TypeError(
      `GraphFunction zoom target did not resolve in graph ${JSON.stringify(input.graph.name)} for authority refs ${JSON.stringify(input.authority.authorityRefs)}`
    );
  }
  if (matches.length > 1) {
    throw new TypeError(
      `GraphFunction zoom target is ambiguous in graph ${JSON.stringify(input.graph.name)} for authority refs ${JSON.stringify(input.authority.authorityRefs)}`
    );
  }
  const match = matches[0];
  if (match === undefined) {
    throw new TypeError("GraphFunction zoom target resolution lost match");
  }
  return match;
}

function defaultGraphFunctionZoomPlanRef(input: {
  readonly parent: GraphFunction;
  readonly targetVector: GraphVector;
  readonly refinement: GraphFunction;
  readonly authorityRefs: readonly string[];
}): string {
  return [
    "graph-function-zoom-plan",
    input.parent.name,
    input.targetVector.name,
    input.refinement.name,
    ...input.authorityRefs
  ].join(":");
}

function graphFunctionZoomDeclaration(plan: GraphFunctionZoomPlan): SerializedAttrs {
  return attrsFromEntries([
    jsonBlobEntry(`graph_function_zoom:${plan.planRef}`, [
      { key: "plan_ref", value: plan.planRef },
      { key: "parent_graph_function_ref", value: plan.parentGraphFunctionRef },
      { key: "parent_graph_ref", value: plan.parentGraphRef },
      { key: "target_graph_vector_ref", value: plan.targetGraphVectorRef },
      { key: "target_graph_vector_name", value: plan.targetGraphVectorName },
      {
        key: "target_source_node_refs",
        value: jsonArrayValue(plan.targetSourceNodeRefs)
      },
      { key: "target_node_ref", value: plan.targetNodeRef },
      {
        key: "refinement_graph_function_ref",
        value: plan.refinementGraphFunctionRef
      },
      { key: "refinement_graph_ref", value: plan.refinementGraphRef },
      { key: "substituted_graph_ref", value: plan.substitutedGraphRef },
      {
        key: "refinement_boundary_ref",
        value: plan.refinementBoundaryRef
      },
      { key: "candidate_family_ref", value: plan.candidateFamilyRef },
      {
        key: "published_traversal_target_ref",
        value: plan.publishedTraversalTargetRef
      },
      { key: "authority_refs", value: jsonArrayValue(plan.authorityRefs) },
      { key: "operation", value: "substitute" },
      { key: "preserves_outer_contract", value: true }
    ])
  ]);
}

function assertSameInterface(
  label: string,
  left: readonly Node[],
  right: readonly Node[]
): void {
  if (JSON.stringify(interfaceContract(left)) !== JSON.stringify(interfaceContract(right))) {
    throw new TypeError(`${label}: interface contract mismatch`);
  }
}

function stableNodes(values: readonly (readonly Node[])[]): readonly Node[] {
  const seen = new Set<string>();
  const merged: Node[] = [];

  for (const group of values) {
    for (const node of group) {
      const key = nodeContractKey(node);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(node);
      }
    }
  }

  return Object.freeze(merged);
}

function stableRules(values: readonly (readonly Rule[])[]): readonly Rule[] {
  const seen = new Set<string>();
  const merged: Rule[] = [];

  for (const group of values) {
    for (const rule of group) {
      if (!seen.has(rule.name)) {
        seen.add(rule.name);
        merged.push(rule);
      }
    }
  }

  return Object.freeze(merged);
}

function evaluatorDeclaration(evaluator: Evaluator): SerializedJsonValue {
  return jsonObjectValue([
    { key: "name", value: evaluator.name },
    { key: "regime", value: evaluator.regime },
    { key: "binding", value: evaluator.binding },
    { key: "description", value: evaluator.description }
  ]);
}

function ruleDeclaration(rule: Rule): SerializedJsonValue {
  return jsonObjectValue([
    { key: "name", value: rule.name },
    { key: "kind", value: rule.kind },
    { key: "config", value: serializedAttrsToJsonObject(rule.config) }
  ]);
}

function isVectorBoundary(node: Node): boolean {
  const ref = node.schema.ref.trim();
  return ref.startsWith("Vector[") && ref.endsWith("]");
}

function mergeContexts(values: readonly (readonly Context[])[]): readonly Context[] {
  const byName = new Map<string, Context>();

  for (const group of values) {
    for (const context of group) {
      const existing = byName.get(context.name);
      if (existing === undefined) {
        byName.set(context.name, context);
        continue;
      }
      if (
        existing.locator !== context.locator ||
        existing.digest !== context.digest
      ) {
        throw new TypeError(
          `Conflicting context declaration for ${context.name}`
        );
      }
    }
  }

  return Object.freeze([...byName.values()]);
}

function requireCompatibleContexts(
  left: readonly Context[],
  right: readonly Context[]
): void {
  void mergeContexts([left, right]);
}

function requireCompatibleNodes(
  label: string,
  available: readonly Node[],
  required: readonly Node[]
): void {
  const availableByName = new Map<string, string>();
  for (const node of available) {
    availableByName.set(node.name, nodeContractKey(node));
  }

  const missing: string[] = [];
  const mismatched: string[] = [];

  for (const node of required) {
    const contract = availableByName.get(node.name);
    if (contract === undefined) {
      missing.push(node.name);
      continue;
    }
    if (contract !== nodeContractKey(node)) {
      mismatched.push(node.name);
    }
  }

  if (missing.length > 0) {
    throw new TypeError(
      `${label}: required environment bindings are missing: ${missing.join(", ")}`
    );
  }
  if (mismatched.length > 0) {
    throw new TypeError(
      `${label}: required environment bindings are not structurally satisfied: ${mismatched.join(", ")}`
    );
  }
}

function rejectConflictingProvidedBindings(
  label: string,
  available: readonly Node[],
  required: readonly Node[],
  provided: readonly Node[]
): void {
  const requiredNames = new Set(required.map((node) => node.name));
  const availableByName = new Map<string, string>();
  for (const node of available) {
    availableByName.set(node.name, nodeContractKey(node));
  }

  const duplicates: string[] = [];
  for (const node of provided) {
    const existing = availableByName.get(node.name);
    if (existing !== undefined && !requiredNames.has(node.name)) {
      duplicates.push(node.name);
    }
  }

  if (duplicates.length > 0) {
    throw new TypeError(
      `${label}: duplicate output names in carried environment: ${duplicates.join(", ")}`
    );
  }
}

interface RequiredNodeReplacement {
  readonly requiredName: string;
  readonly requiredContract: string;
  readonly providedNode: Node;
}

function replaceRequiredNode(
  node: Node,
  replacements: readonly RequiredNodeReplacement[]
): Node {
  const contract = nodeContractKey(node);
  const replacement = replacements.find((candidate) =>
    candidate.requiredName === node.name &&
    candidate.requiredContract === contract
  );
  return replacement?.providedNode ?? node;
}

function replaceRequiredNodes(
  nodes: readonly Node[],
  replacements: readonly RequiredNodeReplacement[]
): readonly Node[] {
  return Object.freeze(
    nodes.map((node) => replaceRequiredNode(node, replacements))
  );
}

function adaptGraphFunctionRequiredNodes(
  graphFunction: GraphFunction,
  replacements: readonly RequiredNodeReplacement[]
): GraphFunction {
  const template = graphFunction.template.kind === "inline_graph"
    ? constructTemplateRef({
        kind: "inline_graph",
        ref: graphFunction.template.ref,
        version: null,
        graph: constructGraph({
          name: graphFunction.template.graph.name,
          inputs: replaceRequiredNodes(
            graphFunction.template.graph.inputs,
            replacements
          ),
          outputs: replaceRequiredNodes(
            graphFunction.template.graph.outputs,
            replacements
          ),
          nodes: stableNodes([
            replaceRequiredNodes(graphFunction.template.graph.nodes, replacements)
          ]),
          vectors: Object.freeze(
            graphFunction.template.graph.vectors.map((vector) =>
              constructGraphVector({
                id: vector.id,
                name: vector.name,
                source: replaceRequiredNodes(vector.source, replacements),
                target: replaceRequiredNode(vector.target, replacements),
                operators: vector.operators,
                evaluators: vector.evaluators,
                contexts: vector.contexts,
                rule: vector.rule,
                allowsSubwork: vector.allowsSubwork,
                declarations: vector.declarations,
                tags: vector.tags
              })
            )
          ),
          contexts: graphFunction.template.graph.contexts,
          rules: graphFunction.template.graph.rules,
          effects: graphFunction.template.graph.effects,
          tags: graphFunction.template.graph.tags,
          id: graphFunction.template.graph.id
        })
      })
    : graphFunction.template;

  return constructGraphFunction({
    name: graphFunction.name,
    environment: constructEnvRef({
      requires: replaceRequiredNodes(
        graphFunction.environment.requires,
        replacements
      ),
      provides: replaceRequiredNodes(
        graphFunction.environment.provides,
        replacements
      ),
      carries: replaceRequiredNodes(
        graphFunction.environment.carries,
        replacements
      )
    }),
    inputs: replaceRequiredNodes(graphFunction.inputs, replacements),
    outputs: replaceRequiredNodes(graphFunction.outputs, replacements),
    template,
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: graphFunction.tags
  });
}

function buildRequiredNodeReplacements(input: {
  readonly left: GraphFunction;
  readonly right: GraphFunction;
  readonly wiring: readonly GraphFunctionTypeWiring[];
  readonly nodeTypeGraphFunctions: readonly GraphFunction[];
}): readonly RequiredNodeReplacement[] {
  const replacements: RequiredNodeReplacement[] = [];
  for (const wiring of input.wiring) {
    const provided = input.left.environment.carries.find((node) =>
      node.name === wiring.providedNodeName
    );
    const required = input.right.environment.requires.find((node) =>
      node.name === wiring.requiredNodeName
    );
    if (provided === undefined) {
      throw new TypeError(
        `composeWithTypeWiring: provided node ${JSON.stringify(wiring.providedNodeName)} is absent from left carries`
      );
    }
    if (required === undefined) {
      throw new TypeError(
        `composeWithTypeWiring: required node ${JSON.stringify(wiring.requiredNodeName)} is absent from right requirements`
      );
    }
    const providedSatisfaction = satisfiesNodeType({
      node: provided,
      typeRef: wiring.typeRef,
      graphFunctions: input.nodeTypeGraphFunctions
    });
    if (!providedSatisfaction.satisfied) {
      throw new TypeError(
        `composeWithTypeWiring: provided node ${JSON.stringify(provided.name)} does not satisfy ${JSON.stringify(wiring.typeRef)}: ${providedSatisfaction.rejectionReason}`
      );
    }
    const requiredSatisfaction = satisfiesNodeType({
      node: required,
      typeRef: wiring.typeRef,
      graphFunctions: input.nodeTypeGraphFunctions
    });
    if (!requiredSatisfaction.satisfied) {
      throw new TypeError(
        `composeWithTypeWiring: required node ${JSON.stringify(required.name)} does not satisfy ${JSON.stringify(wiring.typeRef)}: ${requiredSatisfaction.rejectionReason}`
      );
    }
    replacements.push({
      requiredName: required.name,
      requiredContract: nodeContractKey(required),
      providedNode: provided
    });
  }
  return Object.freeze(replacements);
}

function materializeTemplateGraph(graphFunction: GraphFunction): Graph | null {
  if (graphFunction.template.kind === "inline_graph") {
    return materializeGraphFunction(graphFunction);
  }
  return null;
}

function mergeGraphTemplates(
  left: GraphFunction,
  right: GraphFunction
): GraphFunction["template"] {
  const leftGraph = materializeTemplateGraph(left);
  const rightGraph = materializeTemplateGraph(right);

  if (leftGraph === null || rightGraph === null) {
    return Object.freeze({
      kind: "symbolic",
      ref: `compose:${left.template.ref};${right.template.ref}`,
      graph: null,
      version: null
    });
  }

  const graph = constructGraph({
    name: `${left.name};${right.name}`,
    inputs: leftGraph.inputs,
    outputs: rightGraph.outputs,
    nodes: stableNodes([leftGraph.nodes, rightGraph.nodes]),
    vectors: Object.freeze([...leftGraph.vectors, ...rightGraph.vectors]),
    contexts: mergeContexts([leftGraph.contexts, rightGraph.contexts]),
    rules: stableRules([leftGraph.rules, rightGraph.rules]),
    effects: stableUnion([leftGraph.effects, rightGraph.effects]),
    tags: stableUnion([leftGraph.tags, rightGraph.tags])
  });

  return constructTemplateRef({
    kind: "inline_graph",
    ref: `compose:${left.name};${right.name}`,
    graph,
    version: null
  });
}

export function sameObject(
  left: { readonly id: string },
  right: { readonly id: string }
): boolean {
  return left.id === right.id;
}

export function edge(
  source: readonly Node[],
  target: Node,
  options?: {
    readonly name?: string;
    readonly operators?: readonly Operator[];
    readonly evaluators?: readonly Evaluator[];
    readonly contexts?: readonly Context[];
    readonly rule?: Rule | null;
    readonly allowsSubwork?: boolean;
    readonly declarations?: SerializedAttrs;
    readonly tags?: readonly string[];
    readonly id?: string;
  }
): Graph {
  const sourceNodes = Object.freeze([...source]);
  const vectorName =
    options?.name ??
    `${sourceNodes.map((node) => node.name).join("+")}→${target.name}`;

  const vector = constructGraphVector({
    id: options?.id,
    name: vectorName,
    source: sourceNodes,
    target,
    operators: options?.operators ?? [],
    evaluators: options?.evaluators ?? [],
    contexts: options?.contexts ?? [],
    rule: options?.rule ?? null,
    allowsSubwork: options?.allowsSubwork ?? false,
    declarations: options?.declarations ?? emptySerializedAttrs(),
    tags: options?.tags ?? []
  });

  return constructGraph({
    name: vectorName,
    inputs: sourceNodes,
    outputs: [target],
    nodes: stableNodes([sourceNodes, [target]]),
    vectors: [vector],
    contexts: options?.contexts ?? [],
    rules: options?.rule === undefined || options?.rule === null ? [] : [options.rule],
    effects: [],
    tags: options?.tags ?? []
  });
}

export function identity(
  inputs: readonly Node[],
  options?: {
    readonly name?: string;
    readonly tags?: readonly string[];
    readonly declarations?: SerializedAttrs;
  }
): GraphFunction {
  const name =
    options?.name ??
    `identity:${inputs.map((node) => node.name).join("+") || "empty"}`;

  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: inputs,
      provides: inputs,
      carries: inputs
    }),
    inputs,
    outputs: inputs,
    template: {
      kind: "inline_graph",
      ref: `inline:${name}`,
      version: null,
      graph: constructGraph({
        name,
        inputs,
        outputs: inputs,
        nodes: inputs,
        vectors: [],
        contexts: [],
        rules: [],
        effects: [],
        tags: options?.tags ?? []
      })
    },
    effects: [],
    declarations: options?.declarations ?? emptySerializedAttrs(),
    tags: options?.tags ?? []
  });
}

export function graphFunctionForVector(
  vector: GraphVector,
  options?: {
    readonly name?: string;
    readonly tags?: readonly string[];
    readonly declarations?: SerializedAttrs;
  }
): GraphFunction {
  const name = options?.name ?? vector.name;

  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: vector.source,
      provides: [vector.target],
      carries: stableNodes([vector.source, [vector.target]])
    }),
    inputs: vector.source,
    outputs: [vector.target],
    template: {
      kind: "inline_graph",
      ref: `inline:${name}`,
      version: null,
      graph: constructGraph({
        name: `${name}_workflow`,
        inputs: vector.source,
        outputs: [vector.target],
        nodes: stableNodes([vector.source, [vector.target]]),
        vectors: [vector],
        contexts: vector.contexts,
        rules: vector.rule === null ? [] : [vector.rule],
        effects: [],
        tags: options?.tags ?? []
      })
    },
    effects: [],
    declarations: mergeSerializedAttrs([
      vector.declarations,
      options?.declarations ?? emptySerializedAttrs()
    ]),
    tags: options?.tags ?? []
  });
}

export function substitute(
  outer: Graph,
  contractVectorId: string,
  inner: Graph
): Graph {
  const targetVector = outer.vectors.find((vector) => vector.id === contractVectorId);

  if (targetVector === undefined) {
    throw new TypeError(
      `substitute(): vector ${JSON.stringify(contractVectorId)} not found in graph ${JSON.stringify(outer.name)}`
    );
  }

  const innerInputContracts = new Set(
    inner.inputs.map((node) => nodeContractKey(node))
  );
  const vectorSourceContracts = new Set(
    targetVector.source.map((node) => nodeContractKey(node))
  );

  for (const contract of innerInputContracts) {
    if (!vectorSourceContracts.has(contract)) {
      throw new TypeError(
        `substitute(): inner.inputs ${JSON.stringify([...innerInputContracts].sort())} not subset of vector source ${JSON.stringify([...vectorSourceContracts].sort())}`
      );
    }
  }

  const innerOutputContracts = new Set(
    inner.outputs.map((node) => nodeContractKey(node))
  );
  const targetContract = nodeContractKey(targetVector.target);
  if (!innerOutputContracts.has(targetContract)) {
    throw new TypeError(
      `substitute(): vector target ${JSON.stringify(targetContract)} not in inner.outputs ${JSON.stringify([...innerOutputContracts].sort())}`
    );
  }

  const substitutedVectors: GraphVector[] = [];
  for (const vector of outer.vectors) {
    if (vector.id === targetVector.id) {
      substitutedVectors.push(...inner.vectors);
      continue;
    }
    substitutedVectors.push(vector);
  }

  return constructGraph({
    name: outer.name,
    inputs: outer.inputs,
    outputs: outer.outputs,
    nodes: stableNodes([outer.nodes, inner.nodes]),
    vectors: substitutedVectors,
    contexts: mergeContexts([outer.contexts, inner.contexts]),
    rules: outer.rules,
    effects: outer.effects,
    tags: stableUnion([outer.tags, [`substituted:${targetVector.name}`]])
  });
}

export function constructGraphFunctionZoomPlan(
  input: GraphFunctionZoomPlanInput
): GraphFunctionZoomPlan {
  const authority = graphFunctionZoomAuthority(input);
  const suppliedPlanRef = optionalNonEmptyString(
    input.planRef,
    "GraphFunctionZoomPlan.planRef"
  );
  const parentGraph = materializeGraphFunction(input.parent);
  const refinementGraph = materializeGraphFunction(input.refinement);
  const targetVector = resolveGraphFunctionZoomTargetVector({
    graph: parentGraph,
    authority
  });
  const substitutedGraph = substitute(
    parentGraph,
    targetVector.id,
    refinementGraph
  );
  assertSameInterface(
    "GraphFunction zoom parent inputs",
    substitutedGraph.inputs,
    input.parent.inputs
  );
  assertSameInterface(
    "GraphFunction zoom parent outputs",
    substitutedGraph.outputs,
    input.parent.outputs
  );

  return Object.freeze({
    kind: "graph_function_zoom_plan",
    planRef:
      suppliedPlanRef ??
      defaultGraphFunctionZoomPlanRef({
        parent: input.parent,
        targetVector,
        refinement: input.refinement,
        authorityRefs: authority.authorityRefs
      }),
    parentGraphFunctionRef: input.parent.id,
    parentGraphRef: parentGraph.id,
    targetGraphVectorRef: targetVector.id,
    targetGraphVectorName: targetVector.name,
    targetSourceNodeRefs: Object.freeze(
      targetVector.source.map((node) => node.id)
    ),
    targetNodeRef: targetVector.target.id,
    refinementGraphFunctionRef: input.refinement.id,
    refinementGraphRef: refinementGraph.id,
    substitutedGraphRef: substitutedGraph.id,
    refinementBoundaryRef: authority.refinementBoundaryRef,
    candidateFamilyRef: authority.candidateFamilyRef,
    publishedTraversalTargetRef: authority.publishedTraversalTargetRef,
    authorityRefs: authority.authorityRefs
  });
}

export function applyGraphFunctionZoomPlan(
  input: GraphFunctionZoomApplyInput
): GraphFunction {
  if (input.plan.kind !== "graph_function_zoom_plan") {
    throw new TypeError("GraphFunctionZoomPlan kind mismatch");
  }
  const planAuthority = graphFunctionZoomAuthority(input.plan);
  const parentGraph = materializeGraphFunction(input.parent);
  const refinementGraph = materializeGraphFunction(input.refinement);
  if (input.plan.parentGraphFunctionRef !== input.parent.id) {
    throw new TypeError("GraphFunctionZoomPlan parent graph function mismatch");
  }
  if (input.plan.parentGraphRef !== parentGraph.id) {
    throw new TypeError("GraphFunctionZoomPlan parent graph mismatch");
  }
  if (input.plan.refinementGraphFunctionRef !== input.refinement.id) {
    throw new TypeError("GraphFunctionZoomPlan refinement graph function mismatch");
  }
  if (input.plan.refinementGraphRef !== refinementGraph.id) {
    throw new TypeError("GraphFunctionZoomPlan refinement graph mismatch");
  }
  const targetVector = parentGraph.vectors.find(
    (vector) => vector.id === input.plan.targetGraphVectorRef
  );
  if (targetVector === undefined) {
    throw new TypeError("GraphFunctionZoomPlan target vector does not resolve");
  }
  const authoritativeTargetVector = resolveGraphFunctionZoomTargetVector({
    graph: parentGraph,
    authority: planAuthority
  });
  if (authoritativeTargetVector.id !== targetVector.id) {
    throw new TypeError("GraphFunctionZoomPlan target vector authority mismatch");
  }
  if (input.plan.targetGraphVectorName !== targetVector.name) {
    throw new TypeError("GraphFunctionZoomPlan target vector name mismatch");
  }
  if (
    JSON.stringify(input.plan.targetSourceNodeRefs) !==
    JSON.stringify(targetVector.source.map((node) => node.id))
  ) {
    throw new TypeError("GraphFunctionZoomPlan target source node refs mismatch");
  }
  if (input.plan.targetNodeRef !== targetVector.target.id) {
    throw new TypeError("GraphFunctionZoomPlan target node ref mismatch");
  }
  const substitutedGraph = substitute(
    parentGraph,
    input.plan.targetGraphVectorRef,
    refinementGraph
  );
  if (substitutedGraph.id !== input.plan.substitutedGraphRef) {
    throw new TypeError("GraphFunctionZoomPlan substituted graph mismatch");
  }

  return constructGraphFunction({
    name:
      input.name ??
      `zoom(${input.parent.name}:${targetVector.name}->${input.refinement.name})`,
    environment: input.parent.environment,
    inputs: input.parent.inputs,
    outputs: input.parent.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `zoom:${input.plan.planRef}`,
      graph: substitutedGraph,
      version: null
    }),
    effects: stableUnion([input.parent.effects, input.refinement.effects]),
    declarations: mergeSerializedAttrs([
      input.parent.declarations,
      input.declarations ?? emptySerializedAttrs(),
      graphFunctionZoomDeclaration(input.plan)
    ]),
    tags: stableUnion([
      input.parent.tags,
      input.refinement.tags,
      input.tags ?? [],
      ["zoom:graph-function", `zoom-target:${targetVector.name}`]
    ])
  });
}

export function zoomGraphFunction(
  input: GraphFunctionZoomInput
): GraphFunctionZoomResult {
  const plan = constructGraphFunctionZoomPlan(input);
  return Object.freeze({
    kind: "graph_function_zoom_result",
    plan,
    graphFunction: applyGraphFunctionZoomPlan({
      parent: input.parent,
      refinement: input.refinement,
      plan,
      name: input.name,
      declarations: input.declarations,
      tags: input.tags
    })
  });
}

export interface FoldbackDeclaration {
  readonly binding: string;
  readonly mode: "rebind";
  readonly requiresParentEvaluation: boolean;
  readonly additional?: SerializedAttrs;
}

export function recurse(
  graphFunction: GraphFunction,
  termination: Evaluator,
  foldback: FoldbackDeclaration
): GraphFunction {
  if (foldback.mode !== "rebind") {
    throw new TypeError("recurse(...): foldback.mode must be 'rebind'");
  }
  if (foldback.binding.length === 0) {
    throw new TypeError("recurse(...): foldback.binding is required");
  }
  if (foldback.requiresParentEvaluation !== true) {
    throw new TypeError(
      "recurse(...): foldback.requiresParentEvaluation must be true"
    );
  }

  const foldbackEntries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[] = [
    { key: "mode", value: "rebind" },
    { key: "binding", value: foldback.binding },
    { key: "requires_parent_evaluation", value: true },
    ...((foldback.additional?.entries ?? []).map((entry) => ({
      key: entry.key,
      value: serializedAttrValueToJson(entry.value)
    })))
  ];

  return constructGraphFunction({
    name: `recurse(${graphFunction.name})`,
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: mergeSerializedAttrs([
      graphFunction.declarations,
      attrsFromEntries([
        jsonBlobEntry("recursion", [
          { key: "termination", value: evaluatorDeclaration(termination) },
          { key: "foldback", value: jsonObjectValue(foldbackEntries) }
        ])
      ])
    ]),
    tags: stableUnion([
      graphFunction.tags,
      [`termination:${termination.name}`, `foldback:${foldback.binding}`]
    ])
  });
}

export function fan_out(
  graphFunction: GraphFunction,
  over: Node
): GraphFunction {
  if (!isVectorBoundary(over)) {
    throw new TypeError(
      `fan_out(${graphFunction.name}): over must declare an explicit Vector[...] boundary`
    );
  }

  return constructGraphFunction({
    name: `fan_out(${graphFunction.name})`,
    environment: constructEnvRef({
      requires: [over],
      provides: [over],
      carries: [over]
    }),
    inputs: [over],
    outputs: [over],
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: stableUnion([graphFunction.tags, [`over:${over.name}`]])
  });
}

export function fan_in(
  reducer: GraphFunction,
  over: Node
): GraphFunction {
  if (!isVectorBoundary(over)) {
    throw new TypeError(
      `fan_in(${reducer.name}): over must declare an explicit Vector[...] boundary`
    );
  }

  return constructGraphFunction({
    name: `fan_in(${reducer.name})`,
    environment: constructEnvRef({
      requires: [over],
      provides: reducer.environment.provides,
      carries: stableNodes([[over], reducer.environment.provides])
    }),
    inputs: [over],
    outputs: reducer.outputs,
    template: reducer.template,
    effects: reducer.effects,
    declarations: reducer.declarations,
    tags: stableUnion([reducer.tags, [`over:${over.name}`]])
  });
}

export function gate(
  target: GraphFunction,
  rule: Rule,
  evaluators: readonly Evaluator[]
): GraphFunction {
  if (evaluators.length === 0) {
    throw new TypeError("gate(): requires at least one evaluator");
  }

  return constructGraphFunction({
    name: `gate(${target.name})`,
    environment: target.environment,
    inputs: target.inputs,
    outputs: target.outputs,
    template: target.template,
    effects: target.effects,
    declarations: mergeSerializedAttrs([
      target.declarations,
      attrsFromEntries([
        jsonBlobEntry("gate", [
          { key: "target", value: target.name },
          { key: "target_kind", value: "GraphFunction" },
          { key: "rule", value: ruleDeclaration(rule) },
          {
            key: "evaluators",
            value: jsonArrayValue(evaluators.map(evaluatorDeclaration))
          }
        ])
      ])
    ]),
    tags: stableUnion([target.tags, [`rule:${rule.name}`]])
  });
}

export function promote(
  source: Node,
  to: Node
): GraphFunction {
  return constructGraphFunction({
    name: `promote(${source.name}->${to.name})`,
    environment: constructEnvRef({
      requires: [source],
      provides: [to],
      carries: [source, to]
    }),
    inputs: [source],
    outputs: [to],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: `promote:${source.name}->${to.name}`,
      graph: null,
      version: null
    }),
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: [`source:${source.name}`, `to:${to.name}`]
  });
}

function composePair(left: GraphFunction, right: GraphFunction): GraphFunction {
  requireCompatibleNodes(
    `compose(${left.name}, ${right.name})`,
    left.environment.carries,
    right.environment.requires
  );
  rejectConflictingProvidedBindings(
    `compose(${left.name}, ${right.name})`,
    left.environment.carries,
    right.environment.requires,
    right.environment.provides
  );
  requireCompatibleContexts(
    materializeTemplateGraph(left)?.contexts ?? [],
    materializeTemplateGraph(right)?.contexts ?? []
  );

  return constructGraphFunction({
    name: `${left.name};${right.name}`,
    environment: constructEnvRef({
      requires: left.environment.requires,
      provides: stableNodes([
        left.environment.provides,
        right.environment.provides
      ]),
      carries: stableNodes([
        left.environment.carries,
        right.environment.carries
      ])
    }),
    inputs: left.inputs,
    outputs: right.outputs,
    template: mergeGraphTemplates(left, right),
    effects: stableUnion([left.effects, right.effects]),
    declarations: mergeSerializedAttrs([left.declarations, right.declarations]),
    tags: stableUnion([left.tags, right.tags])
  });
}

export function compose(
  first: GraphFunction,
  second: GraphFunction,
  ...rest: readonly GraphFunction[]
): GraphFunction {
  let composed = composePair(first, second);
  for (const next of rest) {
    composed = composePair(composed, next);
  }
  return composed;
}

export function composeWithTypeWiring(
  left: GraphFunction,
  right: GraphFunction,
  options: {
    readonly wiring: readonly GraphFunctionTypeWiring[];
    readonly nodeTypeGraphFunctions: readonly GraphFunction[];
  }
): GraphFunction {
  if (options.wiring.length === 0) {
    throw new TypeError("composeWithTypeWiring: expected at least one typed wiring");
  }
  const replacements = buildRequiredNodeReplacements({
    left,
    right,
    wiring: options.wiring,
    nodeTypeGraphFunctions: options.nodeTypeGraphFunctions
  });
  return composePair(left, adaptGraphFunctionRequiredNodes(right, replacements));
}
