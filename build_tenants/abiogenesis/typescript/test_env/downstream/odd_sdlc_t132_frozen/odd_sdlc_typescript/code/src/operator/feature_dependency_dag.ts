// Implements: T-174

import {
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchIdempotencyKey,
  deriveDependencyFrontierProjection,
  deriveWriteTerritoryConflictProjection
} from "@abiogenesis/typescript-tenant/abg/m03";
import type {
  BranchRef,
  DependencyFrontierDeclaration
} from "@abiogenesis/typescript-tenant/abg/m03";
import type {
  SdlcAbgFrontierCompilation,
  SdlcDependencyMapNode,
  SdlcFeatureDependencyDag,
  SdlcFeatureDependencyDagEdge,
  SdlcFeatureDependencyDagNode,
  SdlcFeatureDependencyDagNodeKind,
  SdlcModuleDependencyMap,
  SdlcTestDependencyMap
} from "./carriers.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

const EMPTY_STRING_ARRAY: readonly string[] = Object.freeze([]);
const EMPTY_DAG_NODE_ARRAY: readonly SdlcFeatureDependencyDagNode[] =
  Object.freeze([]);

export interface SdlcFeatureDependencyDagInput {
  readonly dagRef: string;
  readonly graphFunctionName: string;
  readonly traversalSelectionRef?: string | null | undefined;
  readonly sourceDependencyMapRefs?: readonly string[] | undefined;
  readonly nodes: readonly SdlcFeatureDependencyDagNode[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface SdlcFeatureDependencyDagFromMapsInput {
  readonly dagRef: string;
  readonly graphFunctionName: string;
  readonly moduleDependencyMap: SdlcModuleDependencyMap;
  readonly testDependencyMap?: SdlcTestDependencyMap | undefined;
  readonly uatTestDependencyMap?: SdlcTestDependencyMap | undefined;
  readonly traversalSelectionRef?: string | null | undefined;
  readonly includeFanIn?: boolean | undefined;
  readonly fanInNodeRef?: string | undefined;
  readonly fanInTargetRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface SdlcAbgFrontierCompilationInput {
  readonly dag: SdlcFeatureDependencyDag;
  readonly frontierRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly fanInScopeRef?: string | undefined;
  readonly basisId?: string | null | undefined;
  readonly graphFunctionId?: string | null | undefined;
  readonly frameLineageId?: string | null | undefined;
  readonly frameAttemptId?: string | null | undefined;
  readonly commandKind?: string | undefined;
  readonly workKeyPrefix?: string | undefined;
  readonly basisRefs?: readonly string[] | undefined;
  readonly branchKeyByNodeRef?: Readonly<Record<string, string>> | undefined;
  readonly branchRefByNodeRef?: Readonly<Record<string, string>> | undefined;
}

function slugRefPart(input: string): string {
  return encodeURIComponent(
    input
      .trim()
      .replace(/[^A-Za-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .toLowerCase() || "unnamed"
  );
}

function firstOrNull(values: readonly string[]): string | null {
  return values.length === 0 ? null : values[0] ?? null;
}

function overrideString(
  values: Readonly<Record<string, string>> | undefined,
  key: string
): string | undefined {
  const value = values?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function sourceNodeRef(input: {
  readonly nodeKind: "module" | "test" | "uat-test";
  readonly nodeId: string;
}): string {
  return `sdlc-dag-node://${input.nodeKind}/${slugRefPart(input.nodeId)}`;
}

function unknownSourceNodeRef(input: {
  readonly nodeKind: "module" | "test" | "uat-test";
  readonly nodeId: string;
}): string {
  return `unknown-sdlc-dag-node://${input.nodeKind}/${slugRefPart(input.nodeId)}`;
}

function normalizedTargetPath(targetRef: string): string {
  return targetRef.trim().replace(/^\.\//u, "");
}

function workspaceRefForTarget(targetRef: string): string {
  const target = normalizedTargetPath(targetRef);
  return target.includes("://") ? target : `workspace://${target}`;
}

function artifactRefForTarget(targetRef: string): string {
  const target = normalizedTargetPath(targetRef);
  return target.includes("://") ? target : `artifact://${target}`;
}

function authorityReadRefs(input: {
  readonly refs: readonly string[];
  readonly nodeKind: SdlcFeatureDependencyDagNodeKind;
}): readonly string[] {
  return uniqueSorted(
    input.refs.map((ref) => {
      if (ref.includes("://")) {
        return ref;
      }
      if (
        input.nodeKind === "test_materialization" ||
        input.nodeKind === "uat_test_materialization" ||
        ref.startsWith("TESTCASE-")
      ) {
        return `testcase://${ref}`;
      }
      return `requirement://${ref}`;
    })
  );
}

function defaultEdgeAccountingRef(edgeName: string): string {
  return `edge-accounting://odd-sdlc/${edgeName}`;
}

function normalizedNode(
  node: SdlcFeatureDependencyDagNode
): SdlcFeatureDependencyDagNode {
  return Object.freeze({
    kind: "sdlc_feature_dependency_dag_node" as const,
    nodeRef: node.nodeRef,
    nodeKind: node.nodeKind,
    edgeName: node.edgeName,
    ledgerRefs: uniqueSorted(node.ledgerRefs),
    predecessorNodeRefs: uniqueSorted(node.predecessorNodeRefs),
    successorNodeRefs: uniqueSorted(node.successorNodeRefs),
    sourceAssetRefs: uniqueSorted(node.sourceAssetRefs),
    targetAssetRefs: uniqueSorted(node.targetAssetRefs),
    readRefs: uniqueSorted(node.readRefs),
    writeTerritoryRefs: uniqueSorted(node.writeTerritoryRefs),
    outputAllocationRefs: uniqueSorted(node.outputAllocationRefs),
    fanInRefs: uniqueSorted(node.fanInRefs),
    edgeAccountingRefs: uniqueSorted(
      node.edgeAccountingRefs.length === 0
        ? [defaultEdgeAccountingRef(node.edgeName)]
        : node.edgeAccountingRefs
    ),
    ownedRequirementRefs: uniqueSorted(node.ownedRequirementRefs),
    declaredPriority: node.declaredPriority,
    criticalPathCost: node.criticalPathCost
  } satisfies SdlcFeatureDependencyDagNode);
}

function topologicalOrder(input: {
  readonly nodeRefs: readonly string[];
  readonly predecessorByNode: ReadonlyMap<string, ReadonlySet<string>>;
  readonly successorByNode: ReadonlyMap<string, ReadonlySet<string>>;
}): readonly string[] {
  const inDegree = new Map<string, number>();
  for (const nodeRef of input.nodeRefs) {
    inDegree.set(nodeRef, input.predecessorByNode.get(nodeRef)?.size ?? 0);
  }
  const ready = [...input.nodeRefs]
    .filter((nodeRef) => (inDegree.get(nodeRef) ?? 0) === 0)
    .sort();
  const ordered: string[] = [];
  while (ready.length > 0) {
    const nodeRef = ready.shift();
    if (nodeRef === undefined) {
      continue;
    }
    ordered.push(nodeRef);
    for (const successorRef of [...(input.successorByNode.get(nodeRef) ?? new Set<string>())].sort()) {
      const nextDegree = (inDegree.get(successorRef) ?? 0) - 1;
      inDegree.set(successorRef, nextDegree);
      if (nextDegree === 0) {
        ready.push(successorRef);
        ready.sort();
      }
    }
  }
  return Object.freeze(ordered);
}

function criticalPathCosts(input: {
  readonly topologicalOrder: readonly string[];
  readonly successorByNode: ReadonlyMap<string, ReadonlySet<string>>;
}): ReadonlyMap<string, number> {
  const costs = new Map<string, number>();
  for (const nodeRef of [...input.topologicalOrder].reverse()) {
    const successorCosts = [...(input.successorByNode.get(nodeRef) ?? new Set<string>())]
      .map((successorRef) => costs.get(successorRef) ?? 1);
    costs.set(
      nodeRef,
      successorCosts.length === 0 ? 1 : 1 + Math.max(...successorCosts)
    );
  }
  return costs;
}

function graphRelations(
  nodes: readonly SdlcFeatureDependencyDagNode[]
): {
  readonly nodeRefs: readonly string[];
  readonly predecessorByNode: ReadonlyMap<string, ReadonlySet<string>>;
  readonly successorByNode: ReadonlyMap<string, ReadonlySet<string>>;
  readonly blockingReasons: readonly string[];
} {
  const nodeRefs = uniqueSorted(nodes.map((node) => node.nodeRef));
  const knownNodeRefs = new Set(nodeRefs);
  const duplicateNodeRefs = uniqueSorted(
    nodes
      .map((node) => node.nodeRef)
      .filter((nodeRef, index, values) => values.indexOf(nodeRef) !== index)
  );
  const predecessorByNode = new Map<string, Set<string>>();
  const successorByNode = new Map<string, Set<string>>();
  for (const nodeRef of nodeRefs) {
    predecessorByNode.set(nodeRef, new Set<string>());
    successorByNode.set(nodeRef, new Set<string>());
  }
  const unknownRefs: string[] = [];
  for (const node of nodes) {
    for (const predecessorRef of node.predecessorNodeRefs) {
      if (knownNodeRefs.has(predecessorRef)) {
        predecessorByNode.get(node.nodeRef)?.add(predecessorRef);
        successorByNode.get(predecessorRef)?.add(node.nodeRef);
      } else {
        unknownRefs.push(`${node.nodeRef}<-${predecessorRef}`);
      }
    }
    for (const successorRef of node.successorNodeRefs) {
      if (knownNodeRefs.has(successorRef)) {
        successorByNode.get(node.nodeRef)?.add(successorRef);
        predecessorByNode.get(successorRef)?.add(node.nodeRef);
      } else {
        unknownRefs.push(`${node.nodeRef}->${successorRef}`);
      }
    }
  }
  return Object.freeze({
    nodeRefs,
    predecessorByNode,
    successorByNode,
    blockingReasons: uniqueSorted([
      ...duplicateNodeRefs.map((nodeRef) => `duplicate_dag_node_ref:${nodeRef}`),
      ...unknownRefs.map((ref) => `unknown_dag_node_ref:${ref}`)
    ])
  });
}

function dagEdges(input: {
  readonly nodeRefs: readonly string[];
  readonly successorByNode: ReadonlyMap<string, ReadonlySet<string>>;
}): readonly SdlcFeatureDependencyDagEdge[] {
  return Object.freeze(
    input.nodeRefs.flatMap((fromNodeRef) =>
      [...(input.successorByNode.get(fromNodeRef) ?? new Set<string>())]
        .sort()
        .map((toNodeRef) =>
          Object.freeze({
            kind: "sdlc_feature_dependency_dag_edge" as const,
            fromNodeRef,
            toNodeRef
          } satisfies SdlcFeatureDependencyDagEdge)
        )
    )
  );
}

export function deriveSdlcFeatureDependencyDag(
  input: SdlcFeatureDependencyDagInput
): SdlcFeatureDependencyDag {
  const rawNodes = Object.freeze(input.nodes.map((node) => normalizedNode(node)));
  const relations = graphRelations(rawNodes);
  const order = topologicalOrder({
    nodeRefs: relations.nodeRefs,
    predecessorByNode: relations.predecessorByNode,
    successorByNode: relations.successorByNode
  });
  const cycleReasons =
    order.length === relations.nodeRefs.length
      ? EMPTY_STRING_ARRAY
      : uniqueSorted(
          relations.nodeRefs
            .filter((nodeRef) => !order.includes(nodeRef))
            .map((nodeRef) => `dependency_cycle:${nodeRef}`)
        );
  const blockingReasons = uniqueSorted([
    ...relations.blockingReasons,
    ...cycleReasons
  ]);
  const costs = criticalPathCosts({
    topologicalOrder: order,
    successorByNode: relations.successorByNode
  });
  const nodesByRef = new Map(rawNodes.map((node) => [node.nodeRef, node]));
  const normalizedNodes = Object.freeze(
    relations.nodeRefs.map((nodeRef) => {
      const node = nodesByRef.get(nodeRef);
      if (node === undefined) {
        throw new TypeError(`DAG relation missing node ${nodeRef}`);
      }
      return Object.freeze({
        ...node,
        predecessorNodeRefs: uniqueSorted([
          ...(relations.predecessorByNode.get(nodeRef) ?? new Set<string>())
        ]),
        successorNodeRefs: uniqueSorted([
          ...(relations.successorByNode.get(nodeRef) ?? new Set<string>())
        ]),
        criticalPathCost: costs.get(nodeRef) ?? node.criticalPathCost
      } satisfies SdlcFeatureDependencyDagNode);
    })
  );
  const startNodes =
    blockingReasons.length > 0
      ? EMPTY_STRING_ARRAY
      : uniqueSorted(
          normalizedNodes
            .filter((node) => node.predecessorNodeRefs.length === 0)
            .map((node) => node.nodeRef)
        );
  return Object.freeze({
    kind: "sdlc_feature_dependency_dag" as const,
    dagRef: input.dagRef,
    graphFunctionName: input.graphFunctionName,
    traversalSelectionRef: input.traversalSelectionRef ?? null,
    sourceDependencyMapRefs: uniqueSorted(input.sourceDependencyMapRefs ?? []),
    nodeRefs: relations.nodeRefs,
    startNodes,
    fanInNodeRefs: uniqueSorted(
      normalizedNodes
        .filter((node) => node.nodeKind === "fan_in")
        .map((node) => node.nodeRef)
    ),
    topologicalOrder: order,
    nodes: normalizedNodes,
    edges: dagEdges({
      nodeRefs: relations.nodeRefs,
      successorByNode: relations.successorByNode
    }),
    blockingReasons,
    evidenceRefs: uniqueSorted(input.evidenceRefs ?? [])
  });
}

function nodeFromDependencyMap(input: {
  readonly map: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly sourceNodeRefById: ReadonlyMap<string, string>;
  readonly sourceNode: SdlcDependencyMapNode;
  readonly nodeKind:
    | "module_implementation"
    | "test_materialization"
    | "uat_test_materialization";
}): SdlcFeatureDependencyDagNode {
  const sourceKind =
    input.nodeKind === "module_implementation"
      ? "module"
      : input.nodeKind === "uat_test_materialization"
        ? "uat-test"
        : "test";
  const predecessorNodeRefs = input.sourceNode.predecessorNodeIds.map(
    (nodeId) =>
      input.sourceNodeRefById.get(nodeId) ??
      unknownSourceNodeRef({ nodeKind: sourceKind, nodeId })
  );
  const successorNodeRefs = input.sourceNode.successorNodeIds.map(
    (nodeId) =>
      input.sourceNodeRefById.get(nodeId) ??
      unknownSourceNodeRef({ nodeKind: sourceKind, nodeId })
  );
  const edgeName =
    input.nodeKind === "module_implementation"
      ? "derive_component_code_surface"
      : input.nodeKind === "uat_test_materialization"
        ? "derive_uat_test_source_surface"
        : "derive_component_test_surface";
  const nodeRef = input.sourceNodeRefById.get(input.sourceNode.nodeId);
  if (nodeRef === undefined) {
    throw new TypeError(`Dependency map node is missing a DAG ref: ${input.sourceNode.nodeId}`);
  }
  return Object.freeze({
    kind: "sdlc_feature_dependency_dag_node" as const,
    nodeRef,
    nodeKind: input.nodeKind,
    edgeName,
    ledgerRefs: uniqueSorted([
      input.map.mapRef,
      input.map.summaryRef,
      `${input.map.mapRef}#${slugRefPart(input.sourceNode.nodeId)}`
    ]),
    predecessorNodeRefs,
    successorNodeRefs,
    sourceAssetRefs: uniqueSorted([
      input.map.summaryRef,
      ...input.sourceNode.ownedRequirementRefs
    ]),
    targetAssetRefs: uniqueSorted(input.sourceNode.materializationTargetRefs),
    readRefs: authorityReadRefs({
      refs: input.sourceNode.ownedRequirementRefs,
      nodeKind: input.nodeKind
    }),
    writeTerritoryRefs: uniqueSorted(
      input.sourceNode.materializationTargetRefs.map((targetRef) =>
        workspaceRefForTarget(targetRef)
      )
    ),
    outputAllocationRefs: uniqueSorted(
      input.sourceNode.materializationTargetRefs.map((targetRef) =>
        artifactRefForTarget(targetRef)
      )
    ),
    fanInRefs: Object.freeze([]),
    edgeAccountingRefs: Object.freeze([defaultEdgeAccountingRef(edgeName)]),
    ownedRequirementRefs: uniqueSorted(input.sourceNode.ownedRequirementRefs),
    declaredPriority: input.sourceNode.predecessorNodeIds.length === 0 ? 2 : 1,
    criticalPathCost: 1
  } satisfies SdlcFeatureDependencyDagNode);
}

function dependencyMapNodes(input: {
  readonly map: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly nodeKind:
    | "module_implementation"
    | "test_materialization"
    | "uat_test_materialization";
}): readonly SdlcFeatureDependencyDagNode[] {
  const sourceKind =
    input.nodeKind === "module_implementation"
      ? "module"
      : input.nodeKind === "uat_test_materialization"
        ? "uat-test"
        : "test";
  const sourceNodeRefById = new Map(
    input.map.nodes.map((node) => [
      node.nodeId,
      sourceNodeRef({ nodeKind: sourceKind, nodeId: node.nodeId })
    ])
  );
  return Object.freeze(
    input.map.nodes.map((sourceNode) =>
      nodeFromDependencyMap({
        map: input.map,
        sourceNodeRefById,
        sourceNode,
        nodeKind: input.nodeKind
      })
    )
  );
}

function fanInScopeRefForDag(dagRef: string): string {
  return `fan-in://odd-sdlc/${slugRefPart(dagRef)}`;
}

function fanInNode(input: {
  readonly dagRef: string;
  readonly nodeRef: string;
  readonly predecessorNodes: readonly SdlcFeatureDependencyDagNode[];
  readonly targetRefs: readonly string[];
}): SdlcFeatureDependencyDagNode {
  const edgeName = "derive_test_execution_result_surface";
  const outputRefs = uniqueSorted(
    input.predecessorNodes.flatMap((node) => node.outputAllocationRefs)
  );
  return Object.freeze({
    kind: "sdlc_feature_dependency_dag_node" as const,
    nodeRef: input.nodeRef,
    nodeKind: "fan_in",
    edgeName,
    ledgerRefs: Object.freeze([`${input.dagRef}#fan-in`]),
    predecessorNodeRefs: uniqueSorted(
      input.predecessorNodes.map((node) => node.nodeRef)
    ),
    successorNodeRefs: Object.freeze([]),
    sourceAssetRefs: outputRefs,
    targetAssetRefs: uniqueSorted(input.targetRefs),
    readRefs: outputRefs,
    writeTerritoryRefs: uniqueSorted(
      input.targetRefs.map((targetRef) => workspaceRefForTarget(targetRef))
    ),
    outputAllocationRefs: uniqueSorted(
      input.targetRefs.map((targetRef) => artifactRefForTarget(targetRef))
    ),
    fanInRefs: Object.freeze([fanInScopeRefForDag(input.dagRef)]),
    edgeAccountingRefs: Object.freeze([defaultEdgeAccountingRef(edgeName)]),
    ownedRequirementRefs: Object.freeze([]),
    declaredPriority: 0,
    criticalPathCost: 1
  } satisfies SdlcFeatureDependencyDagNode);
}

function interleaveBranchNodes(
  groups: readonly (readonly SdlcFeatureDependencyDagNode[])[]
): readonly SdlcFeatureDependencyDagNode[] {
  const nodes: SdlcFeatureDependencyDagNode[] = [];
  const maxLength = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < maxLength; index += 1) {
    for (const group of groups) {
      const node = group[index];
      if (node !== undefined) {
        nodes.push(node);
      }
    }
  }
  return Object.freeze(nodes);
}

export function deriveSdlcFeatureDependencyDagFromMaps(
  input: SdlcFeatureDependencyDagFromMapsInput
): SdlcFeatureDependencyDag {
  const moduleNodes = dependencyMapNodes({
    map: input.moduleDependencyMap,
    nodeKind: "module_implementation"
  });
  const testNodes =
    input.testDependencyMap === undefined
      ? EMPTY_DAG_NODE_ARRAY
      : dependencyMapNodes({
          map: input.testDependencyMap,
          nodeKind: "test_materialization"
        });
  const uatTestNodes =
    input.uatTestDependencyMap === undefined
      ? EMPTY_DAG_NODE_ARRAY
      : dependencyMapNodes({
          map: input.uatTestDependencyMap,
          nodeKind: "uat_test_materialization"
        });
  const branchNodes = interleaveBranchNodes([
    moduleNodes,
    testNodes,
    uatTestNodes
  ]);
  const targetRefs = uniqueSorted(
    input.fanInTargetRefs ?? ["reports/t174-frontier-fan-in.json"]
  );
  const nodes =
    input.includeFanIn ?? true
      ? Object.freeze([
          ...branchNodes,
          fanInNode({
            dagRef: input.dagRef,
            nodeRef:
              input.fanInNodeRef ??
              `sdlc-dag-node://fan-in/${slugRefPart(input.dagRef)}`,
            predecessorNodes: branchNodes,
            targetRefs
          })
        ])
      : branchNodes;
  return deriveSdlcFeatureDependencyDag({
    dagRef: input.dagRef,
    graphFunctionName: input.graphFunctionName,
    traversalSelectionRef: input.traversalSelectionRef,
    sourceDependencyMapRefs: uniqueSorted([
      input.moduleDependencyMap.mapRef,
      ...(input.testDependencyMap === undefined ? [] : [input.testDependencyMap.mapRef]),
      ...(input.uatTestDependencyMap === undefined
        ? []
        : [input.uatTestDependencyMap.mapRef])
    ]),
    nodes,
    evidenceRefs: input.evidenceRefs
  });
}

function branchRefForNode(input: {
  readonly frontierRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly fanInScopeRef: string;
  readonly node: SdlcFeatureDependencyDagNode;
  readonly vectorIndex: number;
  readonly branchKey?: string | undefined;
  readonly branchRef?: string | undefined;
  readonly basisId: string | null | undefined;
  readonly graphFunctionId: string | null | undefined;
  readonly frameLineageId: string | null | undefined;
  readonly frameAttemptId: string | null | undefined;
  readonly workKeyPrefix: string | undefined;
}): BranchRef {
  const nodeSlug = input.branchKey ?? slugRefPart(input.node.nodeRef);
  return constructBranchRef({
    branchRef:
      input.branchRef ??
      `branch://odd-sdlc/${slugRefPart(input.frontierRef)}/${nodeSlug}`,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    branchKey: nodeSlug,
    fanInScopeRef: firstOrNull(input.node.fanInRefs) ?? input.fanInScopeRef,
    workKey:
      input.workKeyPrefix === undefined
        ? `work://odd-sdlc/${nodeSlug}`
        : `${input.workKeyPrefix}/${nodeSlug}`,
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    frameLineageId: input.frameLineageId,
    frameAttemptId: input.frameAttemptId,
    frontierRef: input.frontierRef
  });
}

function declarationForNode(input: {
  readonly commandKind: string;
  readonly node: SdlcFeatureDependencyDagNode;
  readonly branchRef: BranchRef;
  readonly parentBranchRefs: readonly string[];
}): DependencyFrontierDeclaration {
  const observedStateRefs = uniqueSorted(
    input.node.ledgerRefs.length === 0 ? [input.node.nodeRef] : input.node.ledgerRefs
  );
  const idempotencyKey = deriveBranchIdempotencyKey({
    commandKind: `${input.commandKind}:${input.node.edgeName}`,
    branchRef: input.branchRef,
    observedStateRefs,
    outputAllocationRefs: input.node.outputAllocationRefs,
    writeTerritoryRefs: input.node.writeTerritoryRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef: input.branchRef,
    parentBranchRefs: input.parentBranchRefs,
    observedStateRefs,
    readRefs: input.node.readRefs,
    writeTerritoryRefs: input.node.writeTerritoryRefs,
    outputAllocationRefs: input.node.outputAllocationRefs,
    fanInScopeRef: firstOrNull(input.node.fanInRefs) ?? input.branchRef.fanInScopeRef,
    idempotencyKey,
    declaredPriority: input.node.declaredPriority,
    criticalPathCost: input.node.criticalPathCost
  });
}

function branchLookup(input: {
  readonly dag: SdlcFeatureDependencyDag;
  readonly frontierRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly fanInScopeRef: string;
  readonly basisId: string | null | undefined;
  readonly graphFunctionId: string | null | undefined;
  readonly frameLineageId: string | null | undefined;
  readonly frameAttemptId: string | null | undefined;
  readonly workKeyPrefix: string | undefined;
  readonly branchKeyByNodeRef?: Readonly<Record<string, string>> | undefined;
  readonly branchRefByNodeRef?: Readonly<Record<string, string>> | undefined;
}): ReadonlyMap<string, BranchRef> {
  return new Map(
    input.dag.nodes.map((node, index) => [
      node.nodeRef,
      branchRefForNode({
        frontierRef: input.frontierRef,
        graphCallId: input.graphCallId,
        frameId: input.frameId,
        fanInScopeRef: input.fanInScopeRef,
        node,
        vectorIndex: index,
        branchKey: overrideString(input.branchKeyByNodeRef, node.nodeRef),
        branchRef: overrideString(input.branchRefByNodeRef, node.nodeRef),
        basisId: input.basisId,
        graphFunctionId: input.graphFunctionId,
        frameLineageId: input.frameLineageId,
        frameAttemptId: input.frameAttemptId,
        workKeyPrefix: input.workKeyPrefix
      })
    ])
  );
}

function declarationsForDag(input: {
  readonly dag: SdlcFeatureDependencyDag;
  readonly branchByNodeRef: ReadonlyMap<string, BranchRef>;
  readonly commandKind: string;
}): readonly DependencyFrontierDeclaration[] {
  const orderedNodeRefs =
    input.dag.topologicalOrder.length === input.dag.nodes.length
      ? input.dag.topologicalOrder
      : input.dag.nodeRefs;
  const nodeByRef = new Map(input.dag.nodes.map((node) => [node.nodeRef, node]));
  return Object.freeze(
    orderedNodeRefs.map((nodeRef) => {
      const node = nodeByRef.get(nodeRef);
      const branchRef = input.branchByNodeRef.get(nodeRef);
      if (node === undefined || branchRef === undefined) {
        throw new TypeError(`DAG declaration is missing node or branch: ${nodeRef}`);
      }
      const parentBranchRefs = uniqueSorted(
        node.predecessorNodeRefs.flatMap((predecessorRef) => {
          const predecessorBranch = input.branchByNodeRef.get(predecessorRef);
          return predecessorBranch === undefined
            ? []
            : [predecessorBranch.branchRef];
        })
      );
      return declarationForNode({
        commandKind: input.commandKind,
        node,
        branchRef,
        parentBranchRefs
      });
    })
  );
}

function stripConflictPrefix(input: {
  readonly conflictRefs: readonly string[];
  readonly prefix: "write:" | "output:";
}): readonly string[] {
  return uniqueSorted(
    input.conflictRefs
      .filter((conflictRef) => conflictRef.startsWith(input.prefix))
      .map((conflictRef) => conflictRef.slice(input.prefix.length))
  );
}

export function compileSdlcFeatureDependencyDagToAbgFrontier(
  input: SdlcAbgFrontierCompilationInput
): SdlcAbgFrontierCompilation {
  const fanInScopeRef = input.fanInScopeRef ?? fanInScopeRefForDag(input.dag.dagRef);
  const branchByNodeRef = branchLookup({
    dag: input.dag,
    frontierRef: input.frontierRef,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    fanInScopeRef,
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    frameLineageId: input.frameLineageId,
    frameAttemptId: input.frameAttemptId,
    workKeyPrefix: input.workKeyPrefix,
    branchKeyByNodeRef: input.branchKeyByNodeRef,
    branchRefByNodeRef: input.branchRefByNodeRef
  });
  const declarations = declarationsForDag({
    dag: input.dag,
    branchByNodeRef,
    commandKind: input.commandKind ?? "materialize_sdlc_feature_dependency_dag_node"
  });
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: input.frontierRef,
    declarations
  });
  const conflicts = deriveWriteTerritoryConflictProjection({
    projectionRef: `${input.frontierRef}:conflicts`,
    frontier
  });
  const staticConflictRefs = uniqueSorted(
    conflicts.staticConflicts.flatMap((row) => row.writeTerritoryRefs)
  );
  return Object.freeze({
    kind: "sdlc_abg_frontier_compilation" as const,
    dagRef: input.dag.dagRef,
    frontierRef: input.frontierRef,
    startNodes: input.dag.startNodes,
    branchRefs: Object.freeze([...branchByNodeRef.values()]),
    readyBranchRefs: frontier.readyBranchRefs,
    fanInBranchRefs: uniqueSorted(
      input.dag.fanInNodeRefs.flatMap((nodeRef) => {
        const branch = branchByNodeRef.get(nodeRef);
        return branch === undefined ? [] : [branch.branchRef];
      })
    ),
    declarations,
    writeTerritoryConflictRefs: stripConflictPrefix({
      conflictRefs: staticConflictRefs,
      prefix: "write:"
    }),
    outputAllocationConflictRefs: stripConflictPrefix({
      conflictRefs: staticConflictRefs,
      prefix: "output:"
    }),
    conflictingBranchRefs: conflicts.conflictingBranchRefs,
    basisRefs: uniqueSorted([
      ...(input.basisRefs ?? []),
      input.dag.dagRef,
      input.frontierRef,
      ...input.dag.sourceDependencyMapRefs
    ])
  });
}
