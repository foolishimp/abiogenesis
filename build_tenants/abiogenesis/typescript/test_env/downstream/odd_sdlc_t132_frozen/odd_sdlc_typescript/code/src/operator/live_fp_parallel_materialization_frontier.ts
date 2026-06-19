// Implements: T-174
// Implements: T-175

import {
  arrayOf,
  isNonNegativeFiniteNumber,
  isTrimmedNonEmptyString,
  nullable,
  oneOf,
  recordShape
} from "../admission/codecs.js";
import {
  SDLC_DEPENDENCY_TRAVERSAL_METHODS,
  type SdlcDependencyTraversalMethod
} from "../contracts/carrier_domain_catalog.js";
import type { SdlcFeatureDependencyDag } from "./carriers.js";

export interface SdlcLiveFpParallelMaterializationBranchRow {
  readonly branchRef: string;
  readonly branchKey: string;
  readonly nodeId: string;
  readonly laneKind: "dev" | "test";
  readonly workerProcessRef: string;
  readonly materializationTargetRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
}

export interface SdlcLiveFpParallelMaterializationFanInRow {
  readonly branchRef: string;
  readonly nodeId: string;
  readonly predecessorBranchRefs: readonly string[];
  readonly materializationTargetRefs: readonly string[];
  readonly payloadDigest: string;
}

export interface SdlcLiveFpParallelMaterializationFrontier {
  readonly kind: "sdlc_live_fp_parallel_materialization_frontier";
  readonly edgeName: string;
  readonly executionAuthority: "abg_evented_saga_frontier";
  readonly parallelismControl: "abg_branch_execution_policy";
  readonly graphTruthSource: "sdlc_feature_dependency_dag";
  readonly selectedMethod: SdlcDependencyTraversalMethod;
  readonly dependencyMapRef: string;
  readonly testDependencyMapRef: string | null;
  readonly uatTestDependencyMapRef: string | null;
  readonly dependencyMapRefs: readonly string[];
  readonly traversalSelectionRef: string;
  readonly testTraversalSelectionRef: string | null;
  readonly uatTestTraversalSelectionRef: string | null;
  readonly traversalSelectionRefs: readonly string[];
  readonly dagRef: string;
  readonly startNodes: readonly string[];
  readonly frontierRef: string;
  readonly policyRef: string;
  readonly laneCount: number;
  readonly devLaneCount: number;
  readonly componentTestLaneCount: number;
  readonly uatTestLaneCount: number;
  readonly testLaneCount: number;
  readonly fanInCount: number;
  readonly batchCount: number;
  readonly batchSizes: readonly number[];
  readonly maxActive: number;
  readonly readyBranchRefs: readonly string[];
  readonly compiledReadyBranchRefs: readonly string[];
  readonly completedBranchRefs: readonly string[];
  readonly failedBranchRefs: readonly string[];
  readonly writeTerritoryConflictRefs: readonly string[];
  readonly outputAllocationConflictRefs: readonly string[];
  readonly branchRows: readonly SdlcLiveFpParallelMaterializationBranchRow[];
  readonly fanInRows: readonly SdlcLiveFpParallelMaterializationFanInRow[];
  readonly emittedEventKinds: readonly string[];
  readonly emittedEventCount: number;
  readonly replayEventCount: number;
}

export type SdlcLiveFpParallelMaterializationFrontierInput =
  Omit<SdlcLiveFpParallelMaterializationFrontier, "kind">;

export interface SdlcLiveFpParallelMaterializationTargetInput {
  readonly targetRef: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
}

export interface SdlcLiveFpParallelMaterializationBranchOverrideInput {
  readonly edgeName: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
  readonly dag: SdlcFeatureDependencyDag;
}

export interface SdlcLiveFpParallelMaterializationBranchOverrides {
  readonly branchKeyByNodeRef: Readonly<Record<string, string>>;
  readonly branchRefByNodeRef: Readonly<Record<string, string>>;
}

export const SDLC_DEFAULT_LIVE_FP_PARALLEL_BATCH_SIZE = 4;

const STRING_LIST_GUARD = arrayOf(isTrimmedNonEmptyString);

const BRANCH_ROW_GUARD:
  (value: unknown) => value is SdlcLiveFpParallelMaterializationBranchRow =
  recordShape<SdlcLiveFpParallelMaterializationBranchRow>({
    fields: Object.freeze({
      branchRef: isTrimmedNonEmptyString,
      branchKey: isTrimmedNonEmptyString,
      nodeId: isTrimmedNonEmptyString,
      laneKind: oneOf(["dev", "test"] as const),
      workerProcessRef: isTrimmedNonEmptyString,
      materializationTargetRefs: STRING_LIST_GUARD,
      readRefs: STRING_LIST_GUARD,
      writeTerritoryRefs: STRING_LIST_GUARD,
      outputAllocationRefs: STRING_LIST_GUARD
    })
  });

const FAN_IN_ROW_GUARD:
  (value: unknown) => value is SdlcLiveFpParallelMaterializationFanInRow =
  recordShape<SdlcLiveFpParallelMaterializationFanInRow>({
    fields: Object.freeze({
      branchRef: isTrimmedNonEmptyString,
      nodeId: isTrimmedNonEmptyString,
      predecessorBranchRefs: STRING_LIST_GUARD,
      materializationTargetRefs: STRING_LIST_GUARD,
      payloadDigest: isTrimmedNonEmptyString
    })
  });

export const isSdlcLiveFpParallelMaterializationFrontier:
  (value: unknown) => value is SdlcLiveFpParallelMaterializationFrontier =
  recordShape<SdlcLiveFpParallelMaterializationFrontier>({
    kind: "sdlc_live_fp_parallel_materialization_frontier",
    fields: Object.freeze({
      edgeName: isTrimmedNonEmptyString,
      executionAuthority: oneOf(["abg_evented_saga_frontier"] as const),
      parallelismControl: oneOf(["abg_branch_execution_policy"] as const),
      graphTruthSource: oneOf(["sdlc_feature_dependency_dag"] as const),
      selectedMethod: oneOf(SDLC_DEPENDENCY_TRAVERSAL_METHODS),
      dependencyMapRef: isTrimmedNonEmptyString,
      testDependencyMapRef: nullable(isTrimmedNonEmptyString),
      uatTestDependencyMapRef: nullable(isTrimmedNonEmptyString),
      dependencyMapRefs: STRING_LIST_GUARD,
      traversalSelectionRef: isTrimmedNonEmptyString,
      testTraversalSelectionRef: nullable(isTrimmedNonEmptyString),
      uatTestTraversalSelectionRef: nullable(isTrimmedNonEmptyString),
      traversalSelectionRefs: STRING_LIST_GUARD,
      dagRef: isTrimmedNonEmptyString,
      startNodes: STRING_LIST_GUARD,
      frontierRef: isTrimmedNonEmptyString,
      policyRef: isTrimmedNonEmptyString,
      laneCount: isNonNegativeFiniteNumber,
      devLaneCount: isNonNegativeFiniteNumber,
      componentTestLaneCount: isNonNegativeFiniteNumber,
      uatTestLaneCount: isNonNegativeFiniteNumber,
      testLaneCount: isNonNegativeFiniteNumber,
      fanInCount: isNonNegativeFiniteNumber,
      batchCount: isNonNegativeFiniteNumber,
      batchSizes: arrayOf(isNonNegativeFiniteNumber),
      maxActive: isNonNegativeFiniteNumber,
      readyBranchRefs: STRING_LIST_GUARD,
      compiledReadyBranchRefs: STRING_LIST_GUARD,
      completedBranchRefs: STRING_LIST_GUARD,
      failedBranchRefs: STRING_LIST_GUARD,
      writeTerritoryConflictRefs: STRING_LIST_GUARD,
      outputAllocationConflictRefs: STRING_LIST_GUARD,
      branchRows: arrayOf(BRANCH_ROW_GUARD),
      fanInRows: arrayOf(FAN_IN_ROW_GUARD),
      emittedEventKinds: STRING_LIST_GUARD,
      emittedEventCount: isNonNegativeFiniteNumber,
      replayEventCount: isNonNegativeFiniteNumber
    })
  });

export function constructSdlcLiveFpParallelMaterializationFrontier(
  input: SdlcLiveFpParallelMaterializationFrontierInput
): SdlcLiveFpParallelMaterializationFrontier {
  return Object.freeze({
    kind: "sdlc_live_fp_parallel_materialization_frontier" as const,
    ...input
  });
}

function sdlcLiveSlug(input: string): string {
  return (
    input
      .trim()
      .replace(/[^A-Za-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .toLowerCase() || "unnamed"
  );
}

export function sdlcLiveParallelMaterializationTargetKey(targetRef: string): string {
  return normalizePathLikeRef(targetRef) || "target";
}

export function resolveSdlcLiveFpParallelBatchSize(input: {
  readonly laneCount: number;
  readonly requestedBatchSize?: number | null | undefined;
}): number {
  const rawBatchSize =
    input.requestedBatchSize ?? SDLC_DEFAULT_LIVE_FP_PARALLEL_BATCH_SIZE;
  const normalizedBatchSize = Number.isFinite(rawBatchSize)
    ? Math.floor(rawBatchSize)
    : SDLC_DEFAULT_LIVE_FP_PARALLEL_BATCH_SIZE;
  const positiveBatchSize = Math.max(1, normalizedBatchSize);
  return Math.max(1, Math.min(Math.max(1, input.laneCount), positiveBatchSize));
}

function normalizePathLikeRef(input: string): string {
  return input
    .trim()
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^file:\/\//u, "")
    .replace(/^\.\//u, "");
}

export function normalizeSdlcLiveFpParallelMaterializationTarget(
  input: SdlcLiveFpParallelMaterializationTargetInput
): string {
  let normalized = normalizePathLikeRef(input.targetRef);
  const prefixes = [input.selectedOutputRoot, input.tenantRoot]
    .map(normalizePathLikeRef)
    .filter((prefix) => prefix.length > 0)
    .sort((left, right) => right.length - left.length);
  for (const prefix of prefixes) {
    if (normalized === prefix) {
      normalized = "";
      break;
    }
    if (normalized.startsWith(`${prefix}/`)) {
      normalized = normalized.slice(prefix.length + 1);
      break;
    }
  }
  return normalized;
}

function targetRefsForDagNode(
  node: SdlcFeatureDependencyDag["nodes"][number]
): readonly string[] {
  return node.targetAssetRefs.length > 0
    ? node.targetAssetRefs
    : node.outputAllocationRefs.map((ref) => ref.replace(/^artifact:\/\//u, ""));
}

function branchKeyForDagNode(input: {
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
  readonly node: SdlcFeatureDependencyDag["nodes"][number];
}): string {
  if (input.node.nodeKind === "fan_in") {
    return "fan-in";
  }
  const laneKind =
    input.node.nodeKind === "test_materialization" ||
    input.node.nodeKind === "uat_test_materialization"
      ? "test"
      : "dev";
  const branchPrefix =
    input.node.nodeKind === "uat_test_materialization" ? "uat-test" : laneKind;
  const targetRef = targetRefsForDagNode(input.node)[0] ?? input.node.nodeRef;
  const normalizedTargetRef = normalizeSdlcLiveFpParallelMaterializationTarget({
    targetRef,
    selectedOutputRoot: input.selectedOutputRoot,
    tenantRoot: input.tenantRoot
  });
  return `${branchPrefix}-${sdlcLiveSlug(
    sdlcLiveParallelMaterializationTargetKey(normalizedTargetRef)
  )}`;
}

function uniqueBranchKey(input: {
  readonly baseBranchKey: string;
  readonly nodeRef: string;
  readonly usedBranchKeys: ReadonlySet<string>;
}): string {
  if (!input.usedBranchKeys.has(input.baseBranchKey)) {
    return input.baseBranchKey;
  }
  const nodeScoped = `${input.baseBranchKey}-${sdlcLiveSlug(input.nodeRef)}`;
  if (!input.usedBranchKeys.has(nodeScoped)) {
    return nodeScoped;
  }
  let index = 2;
  while (input.usedBranchKeys.has(`${nodeScoped}-${index}`)) {
    index += 1;
  }
  return `${nodeScoped}-${index}`;
}

function orderedLiveMaterializationNodes(
  dag: SdlcFeatureDependencyDag
): readonly SdlcFeatureDependencyDag["nodes"][number][] {
  const modules = dag.nodes.filter((node) => node.nodeKind === "module_implementation");
  const componentTests = dag.nodes.filter(
    (node) => node.nodeKind === "test_materialization"
  );
  const uatTests = dag.nodes.filter(
    (node) => node.nodeKind === "uat_test_materialization"
  );
  const ordered: SdlcFeatureDependencyDag["nodes"][number][] = [];
  const maxLength = Math.max(
    modules.length,
    componentTests.length,
    uatTests.length
  );
  for (let index = 0; index < maxLength; index += 1) {
    const moduleNode = modules[index];
    const componentTestNode = componentTests[index];
    const uatTestNode = uatTests[index];
    if (moduleNode !== undefined) {
      ordered.push(moduleNode);
    }
    if (componentTestNode !== undefined) {
      ordered.push(componentTestNode);
    }
    if (uatTestNode !== undefined) {
      ordered.push(uatTestNode);
    }
  }
  return Object.freeze([
    ...ordered,
    ...dag.nodes.filter((node) => node.nodeKind === "fan_in")
  ]);
}

export function deriveSdlcLiveFpParallelMaterializationBranchOverrides(
  input: SdlcLiveFpParallelMaterializationBranchOverrideInput
): SdlcLiveFpParallelMaterializationBranchOverrides {
  const branchKeyByNodeRef: Record<string, string> = {};
  const branchRefByNodeRef: Record<string, string> = {};
  const usedBranchKeys = new Set<string>();
  const liveEdgeSegment = sdlcLiveSlug(input.edgeName);
  const orderByNodeRef = new Map(
    orderedLiveMaterializationNodes(input.dag).map((node, index) => [
      node.nodeRef,
      index
    ])
  );
  for (const node of input.dag.nodes) {
    const baseBranchKey = branchKeyForDagNode({
      selectedOutputRoot: input.selectedOutputRoot,
      tenantRoot: input.tenantRoot,
      node
    });
    const orderIndex = orderByNodeRef.get(node.nodeRef) ?? 0;
    const branchKey = uniqueBranchKey({
      baseBranchKey: `b${String(orderIndex).padStart(3, "0")}-${baseBranchKey}`,
      nodeRef: node.nodeRef,
      usedBranchKeys
    });
    usedBranchKeys.add(branchKey);
    branchKeyByNodeRef[node.nodeRef] = branchKey;
    branchRefByNodeRef[node.nodeRef] =
      `branch://odd-sdlc/live/${liveEdgeSegment}/${branchKey}`;
  }
  return Object.freeze({
    branchKeyByNodeRef: Object.freeze(branchKeyByNodeRef),
    branchRefByNodeRef: Object.freeze(branchRefByNodeRef)
  });
}
