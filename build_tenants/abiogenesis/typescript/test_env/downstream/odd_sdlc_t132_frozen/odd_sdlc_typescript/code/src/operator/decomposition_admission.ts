// Implements: T-172

import type {
  StartRuntimeTraversalStrategySelection
} from "@abiogenesis/typescript-tenant";
import type {
  SdlcDependencyTraversalMethod,
  SdlcDependencyTraversalSelection,
  SdlcDecompositionAdmissionDecision,
  SdlcDecompositionDownstreamKind,
  SdlcDecompositionSummary,
  SdlcDecompositionSummaryRow,
  SdlcDecompositionSummaryThresholds,
  SdlcDecompositionUpstreamKind,
  SdlcDesignDepthRegister,
  SdlcDependencyMapNode,
  SdlcModuleDependencyMap,
  SdlcTestDependencyMap,
  SdlcTestDesignRegister
} from "./carriers.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

export interface SdlcDecompositionSummaryCandidateRow {
  readonly downstreamId: string;
  readonly parentId?: string | null | undefined;
  readonly ownedUpstreamRefs: readonly string[];
  readonly publicBoundaryRefs?: readonly string[] | undefined;
  readonly substantiveResponsibilityRefs?: readonly string[] | undefined;
  readonly materializationTargetRefs?: readonly string[] | undefined;
  readonly residualRefs?: readonly string[] | undefined;
}

export interface SdlcDecompositionSummaryInput {
  readonly stageId: string;
  readonly upstreamKind: SdlcDecompositionUpstreamKind;
  readonly downstreamKind: SdlcDecompositionDownstreamKind;
  readonly thresholds: SdlcDecompositionSummaryThresholds;
  readonly stageUpstreamUniverseRefs?: readonly string[] | undefined;
  readonly rows: readonly SdlcDecompositionSummaryCandidateRow[];
  readonly requireTrivialDegenerateProduct?: boolean | undefined;
}

export type SdlcDependencyTraversalSelectionPolicy =
  | "steel_thread_first"
  | "parallel_when_partitioned";

export interface SdlcDependencyTraversalSelectionInput {
  readonly selectionRef: string;
  readonly dependencyMap: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly selectedMethodCarrier?:
    | SdlcDependencyTraversalSelectedMethodCarrier
    | undefined;
  readonly policy?: SdlcDependencyTraversalSelectionPolicy | undefined;
  readonly basisRefs?: readonly string[] | undefined;
}

export interface SdlcDependencyTraversalSelectedMethodCarrier {
  readonly kind: "sdlc_dependency_traversal_selected_method";
  readonly selectedMethod: SdlcDependencyTraversalMethod;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcStagedImplementationTopologyAuthority {
  readonly summary: SdlcDecompositionSummary;
  readonly dependencyMap: SdlcModuleDependencyMap;
}

export interface SdlcStagedTestTopologyAuthority {
  readonly summary: SdlcDecompositionSummary;
  readonly dependencyMap: SdlcTestDependencyMap;
}

export interface SdlcDerivedTestDependencyMapInput {
  readonly moduleDependencyMap: SdlcModuleDependencyMap;
  readonly mapRef?: string | undefined;
  readonly summaryRef?: string | undefined;
}

export interface SdlcRuntimeSteelThreadDependencyWindowInput {
  readonly selectionRef: string;
  readonly dependencyMaps: readonly (SdlcModuleDependencyMap | SdlcTestDependencyMap)[];
  readonly traversalSelections?: readonly SdlcDependencyTraversalSelection[] | undefined;
  readonly startingRequirementRefs?: readonly string[] | undefined;
  readonly startingNodeIds?: readonly string[] | undefined;
  readonly requirementRefNamespace?: string | undefined;
  readonly strategyOwnerRef?: string | undefined;
  readonly edgeRefs?: readonly string[] | undefined;
  readonly basisRefs?: readonly string[] | undefined;
  readonly maxItemCount?: number | undefined;
}

// The default 8:1 limits are the initial substantive-product guardrail. The
// aggregate compression, per-upstream explosion, and per-row density limits are
// independent profile levers even though the default policy gives them parity.
export const SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS =
  Object.freeze({
    kind: "sdlc_decomposition_summary_thresholds" as const,
    profileRef: "profile://odd-sdlc/decomposition/default",
    maxUpstreamPerDownstreamRatio: 8,
    maxDownstreamPerUpstream: 8,
    maxOwnedUpstreamPerDownstream: 8,
    maxOwnedUpstreamWithoutBoundary: 1
  } satisfies SdlcDecompositionSummaryThresholds);

function invalidReferenceFields(input: {
  readonly rows: readonly SdlcDecompositionSummaryCandidateRow[];
  readonly stageUpstreamUniverseRefs: readonly string[];
}): readonly string[] {
  const invalid: string[] = [];
  const inspectScalar = (
    owner: string,
    fieldName: string,
    value: string
  ): void => {
    if (value.trim().length === 0 || value.trim() !== value) {
      invalid.push(`${owner}.${fieldName}`);
    }
  };
  const inspect = (
    owner: string,
    fieldName: string,
    values: readonly string[]
  ): void => {
    values.forEach((value, index) => {
      if (value.trim().length === 0 || value.trim() !== value) {
        invalid.push(`${owner}.${fieldName}[${index}]`);
      }
    });
  };
  inspect("stage", "stageUpstreamUniverseRefs", input.stageUpstreamUniverseRefs);
  for (const row of input.rows) {
    const owner = row.downstreamId.trim().length > 0 ? row.downstreamId.trim() : "<blank>";
    inspectScalar(owner, "downstreamId", row.downstreamId);
    if (row.parentId !== null && row.parentId !== undefined) {
      inspectScalar(owner, "parentId", row.parentId);
    }
    inspect(owner, "ownedUpstreamRefs", row.ownedUpstreamRefs);
    inspect(owner, "publicBoundaryRefs", row.publicBoundaryRefs ?? []);
    inspect(
      owner,
      "substantiveResponsibilityRefs",
      row.substantiveResponsibilityRefs ?? []
    );
    inspect(owner, "materializationTargetRefs", row.materializationTargetRefs ?? []);
    inspect(owner, "residualRefs", row.residualRefs ?? []);
  }
  return uniqueSorted(invalid);
}

function normalizeRow(
  row: SdlcDecompositionSummaryCandidateRow
): SdlcDecompositionSummaryRow {
  const ownedUpstreamRefs = uniqueSorted(row.ownedUpstreamRefs);
  const publicBoundaryRefs = uniqueSorted(row.publicBoundaryRefs ?? []);
  const substantiveResponsibilityRefs = uniqueSorted(
    row.substantiveResponsibilityRefs ?? []
  );
  const materializationTargetRefs = uniqueSorted(row.materializationTargetRefs ?? []);
  const residualRefs = uniqueSorted(row.residualRefs ?? []);
  return Object.freeze({
    downstreamId: row.downstreamId,
    parentId: row.parentId ?? null,
    ownedUpstreamRefs,
    ownedUpstreamCount: ownedUpstreamRefs.length,
    publicBoundaryRefs,
    publicBoundaryCount: publicBoundaryRefs.length,
    substantiveResponsibilityRefs,
    substantiveResponsibilityCount: substantiveResponsibilityRefs.length,
    materializationTargetRefs,
    residualRefs
  });
}

function upstreamPerDownstreamRatio(input: {
  readonly upstreamCount: number;
  readonly downstreamCount: number;
}): number {
  if (input.upstreamCount === 0) {
    return 0;
  }
  if (input.downstreamCount === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return input.upstreamCount / input.downstreamCount;
}

function downstreamPerUpstreamRatio(input: {
  readonly upstreamCount: number;
  readonly downstreamCount: number;
}): number {
  if (input.downstreamCount === 0) {
    return 0;
  }
  if (input.upstreamCount === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return input.downstreamCount / input.upstreamCount;
}

function explosionUpstreamRefs(input: {
  readonly rows: readonly SdlcDecompositionSummaryRow[];
  readonly thresholds: SdlcDecompositionSummaryThresholds;
}): readonly string[] {
  const downstreamByUpstream = new Map<string, Set<string>>();
  for (const row of input.rows) {
    for (const upstreamRef of row.ownedUpstreamRefs) {
      const downstreamIds = downstreamByUpstream.get(upstreamRef) ?? new Set<string>();
      downstreamIds.add(row.downstreamId);
      downstreamByUpstream.set(upstreamRef, downstreamIds);
    }
  }
  const exploded: string[] = [];
  for (const [upstreamRef, downstreamIds] of downstreamByUpstream.entries()) {
    if (downstreamIds.size > input.thresholds.maxDownstreamPerUpstream) {
      exploded.push(upstreamRef);
    }
  }
  return uniqueSorted(exploded);
}

function isFacadeRow(input: {
  readonly row: SdlcDecompositionSummaryRow;
  readonly thresholds: SdlcDecompositionSummaryThresholds;
}): boolean {
  if (
    input.row.ownedUpstreamCount >
      input.thresholds.maxOwnedUpstreamWithoutBoundary &&
    input.row.publicBoundaryCount === 0
  ) {
    return true;
  }
  return (
    input.row.ownedUpstreamCount > 0 &&
    input.row.substantiveResponsibilityCount === 0
  );
}

function underDecomposedParentIds(input: {
  readonly rows: readonly SdlcDecompositionSummaryRow[];
  readonly facadeDownstreamIds: readonly string[];
  readonly thresholds: SdlcDecompositionSummaryThresholds;
}): readonly string[] {
  const facadeIds = new Set(input.facadeDownstreamIds);
  const parentRows = new Map<string, SdlcDecompositionSummaryRow[]>();
  for (const row of input.rows) {
    if (row.parentId === null) {
      continue;
    }
    const current = parentRows.get(row.parentId) ?? [];
    current.push(row);
    parentRows.set(row.parentId, current);
  }
  const rejectedParents: string[] = [];
  for (const [parentId, rows] of parentRows.entries()) {
    const ownedCount = uniqueSorted(rows.flatMap((row) => row.ownedUpstreamRefs)).length;
    const allChildrenFacade = rows.every((row) => facadeIds.has(row.downstreamId));
    if (
      ownedCount > input.thresholds.maxOwnedUpstreamPerDownstream &&
      allChildrenFacade
    ) {
      rejectedParents.push(parentId);
    }
  }
  return uniqueSorted(rejectedParents);
}

function parallelGroupRefs(
  dependencyMap: SdlcModuleDependencyMap | SdlcTestDependencyMap
): readonly string[] {
  return dependencyMap.kind === "sdlc_module_dependency_map"
    ? dependencyMap.parallelPartitionRefs
    : dependencyMap.parallelShardRefs;
}

export function admitSdlcDependencyTraversalSelectedMethodCarrier(input: {
  readonly selectedMethod: SdlcDependencyTraversalMethod;
  readonly evidenceRefs: readonly string[];
}): SdlcDependencyTraversalSelectedMethodCarrier {
  const evidenceRefs = uniqueSorted(input.evidenceRefs);
  if (evidenceRefs.length === 0) {
    throw new TypeError(
      "sdlc_dependency_traversal_selected_method requires evidence refs"
    );
  }
  return Object.freeze({
    kind: "sdlc_dependency_traversal_selected_method" as const,
    selectedMethod: input.selectedMethod,
    evidenceRefs
  });
}

function inferredDependencyTraversalMethod(input: {
  readonly dependencyMap: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly policy: SdlcDependencyTraversalSelectionPolicy;
}): SdlcDependencyTraversalMethod {
  if (input.dependencyMap.cycleRefs.length > 0) {
    return "blocked";
  }
  const parallelRefs = parallelGroupRefs(input.dependencyMap);
  if (
    input.policy === "parallel_when_partitioned" &&
    parallelRefs.length > 0
  ) {
    return "parallel";
  }
  if (input.dependencyMap.steelThreadCandidateNodeIds.length > 0) {
    return "steel_thread";
  }
  if (parallelRefs.length > 0) {
    return "parallel";
  }
  return "serial";
}

function invalidSelectedTraversalMethodReasons(input: {
  readonly dependencyMap: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly selectedMethod: SdlcDependencyTraversalMethod;
}): readonly string[] {
  const parallelRefs = parallelGroupRefs(input.dependencyMap);
  return uniqueSorted([
    ...(input.selectedMethod !== "blocked" &&
    input.dependencyMap.cycleRefs.length > 0
      ? input.dependencyMap.cycleRefs.map(
          (cycleRef) => `dependency_cycle:${cycleRef}`
        )
      : []),
    ...(input.selectedMethod === "parallel" && parallelRefs.length === 0
      ? ["selected_parallel_without_parallel_groups"]
      : []),
    ...(input.selectedMethod === "steel_thread" &&
    input.dependencyMap.steelThreadCandidateNodeIds.length === 0
      ? ["selected_steel_thread_without_candidates"]
      : []),
    ...(input.selectedMethod === "serial" && input.dependencyMap.nodes.length === 0
      ? ["selected_serial_without_nodes"]
      : [])
  ]);
}

function selectedNodeIds(input: {
  readonly dependencyMap: SdlcModuleDependencyMap | SdlcTestDependencyMap;
  readonly method: SdlcDependencyTraversalMethod;
}): readonly string[] {
  switch (input.method) {
    case "steel_thread":
      return uniqueSorted(input.dependencyMap.steelThreadCandidateNodeIds);
    case "parallel":
    case "serial":
      return uniqueSorted(input.dependencyMap.nodes.map((node) => node.nodeId));
    case "blocked":
      return Object.freeze([]);
    default: {
      const exhaustive: never = input.method;
      throw new TypeError(`Unsupported dependency traversal method ${exhaustive}`);
    }
  }
}

function normalizeRequirementRef(input: {
  readonly value: string;
  readonly namespace: string;
}): string {
  const trimmed = input.value.trim();
  if (trimmed.startsWith("requirement://")) {
    return trimmed;
  }
  if (trimmed.startsWith("requirement:")) {
    return `requirement://${input.namespace}/${trimmed.slice("requirement:".length)}`;
  }
  return `requirement://${input.namespace}/${trimmed}`;
}

function requirementRefsMatch(left: string, right: string): boolean {
  const normalizedLeft = left.toLowerCase();
  const normalizedRight = right.toLowerCase();
  if (normalizedLeft === normalizedRight) {
    return true;
  }
  const leftTail = normalizedLeft.split("/").filter(Boolean).at(-1) ?? normalizedLeft;
  const rightTail = normalizedRight.split("/").filter(Boolean).at(-1) ?? normalizedRight;
  return leftTail === rightTail;
}

function nodesById(
  dependencyMaps: readonly (SdlcModuleDependencyMap | SdlcTestDependencyMap)[]
): ReadonlyMap<string, SdlcDependencyMapNode> {
  const nodes = new Map<string, SdlcDependencyMapNode>();
  for (const dependencyMap of dependencyMaps) {
    for (const node of dependencyMap.nodes) {
      nodes.set(node.nodeId, node);
    }
  }
  return nodes;
}

function selectedSeedNodeIds(input: {
  readonly dependencyMaps: readonly (SdlcModuleDependencyMap | SdlcTestDependencyMap)[];
  readonly traversalSelections: readonly SdlcDependencyTraversalSelection[];
  readonly startingRequirementRefs: readonly string[];
  readonly startingNodeIds: readonly string[];
  readonly requirementRefNamespace: string;
}): readonly string[] {
  const requestedRequirementRefs = input.startingRequirementRefs.map((ref) =>
    normalizeRequirementRef({
      value: ref,
      namespace: input.requirementRefNamespace
    })
  );
  const seeds = new Set<string>(input.startingNodeIds);
  if (requestedRequirementRefs.length > 0) {
    for (const dependencyMap of input.dependencyMaps) {
      for (const node of dependencyMap.nodes) {
        const ownedRequirementRefs = node.ownedRequirementRefs.map((ref) =>
          normalizeRequirementRef({
            value: ref,
            namespace: input.requirementRefNamespace
          })
        );
        if (
          requestedRequirementRefs.some((requestedRef) =>
            ownedRequirementRefs.some((ownedRef) =>
              requirementRefsMatch(requestedRef, ownedRef)
            )
          )
        ) {
          seeds.add(node.nodeId);
        }
      }
    }
  }
  if (seeds.size === 0) {
    for (const selection of input.traversalSelections) {
      if (selection.selectedMethod === "steel_thread") {
        for (const nodeId of selection.selectedNodeIds) {
          seeds.add(nodeId);
        }
      }
    }
  }
  if (seeds.size === 0) {
    for (const dependencyMap of input.dependencyMaps) {
      for (const nodeId of dependencyMap.steelThreadCandidateNodeIds) {
        seeds.add(nodeId);
      }
    }
  }
  return uniqueSorted([...seeds]);
}

function predecessorClosedNodeIds(input: {
  readonly seeds: readonly string[];
  readonly nodes: ReadonlyMap<string, SdlcDependencyMapNode>;
}): readonly string[] {
  const visited = new Set<string>();
  const ordered: string[] = [];
  const visit = (nodeId: string): void => {
    if (visited.has(nodeId)) {
      return;
    }
    const node = input.nodes.get(nodeId);
    if (node === undefined) {
      return;
    }
    visited.add(nodeId);
    for (const predecessorNodeId of node.predecessorNodeIds) {
      visit(predecessorNodeId);
    }
    ordered.push(nodeId);
  };
  for (const seed of input.seeds) {
    visit(seed);
  }
  return Object.freeze(ordered);
}

export function constructRuntimeSteelThreadSelectionFromDependencyWindow(
  input: SdlcRuntimeSteelThreadDependencyWindowInput
): StartRuntimeTraversalStrategySelection {
  const dependencyMaps = Object.freeze([...input.dependencyMaps]);
  if (dependencyMaps.length === 0) {
    throw new TypeError("runtime steel-thread dependency window requires dependency maps");
  }
  const requirementRefNamespace = input.requirementRefNamespace ?? "odd-sdlc";
  const nodeMap = nodesById(dependencyMaps);
  const seeds = selectedSeedNodeIds({
    dependencyMaps,
    traversalSelections: input.traversalSelections ?? Object.freeze([]),
    startingRequirementRefs: input.startingRequirementRefs ?? Object.freeze([]),
    startingNodeIds: input.startingNodeIds ?? Object.freeze([]),
    requirementRefNamespace
  });
  const selectedNodeIds = predecessorClosedNodeIds({ seeds, nodes: nodeMap });
  if (selectedNodeIds.length === 0) {
    throw new TypeError("runtime steel-thread dependency window resolved no nodes");
  }
  const selectedNodes = selectedNodeIds.flatMap((nodeId) => {
    const node = nodeMap.get(nodeId);
    return node === undefined ? [] : [node];
  });
  const selectedRequirementRefs = uniqueSorted(
    selectedNodes.flatMap((node) =>
      node.ownedRequirementRefs.map((ref) =>
        normalizeRequirementRef({
          value: ref,
          namespace: requirementRefNamespace
        })
      )
    )
  );
  if (selectedRequirementRefs.length === 0) {
    throw new TypeError(
      "runtime steel-thread dependency window requires requirement refs"
    );
  }
  const selectedScheduleItemRefs = uniqueSorted([
    ...selectedNodeIds,
    ...selectedRequirementRefs
  ]);
  const requiredProgressArtifactRefs = uniqueSorted(
    selectedNodes.flatMap((node) => node.materializationTargetRefs)
  );
  const dependencyMapRefs = uniqueSorted(dependencyMaps.map((map) => map.mapRef));
  return Object.freeze({
    kind: "start_runtime_traversal_strategy_selection" as const,
    selectionRef: input.selectionRef,
    strategyOwnerRef:
      input.strategyOwnerRef ?? "policy://odd-sdlc/runtime/steel-thread",
    strategyLabel: "steel_thread",
    enforcementPrimitives: Object.freeze([
      "dependency_predecessor_closure",
      "bounded_batch",
      "ordered_schedule_prefix"
    ]),
    selectedScheduleItemRefs,
    requiredProgressArtifactRefs,
    orderingConstraintRefs: uniqueSorted(
      selectedNodes.flatMap((node) =>
        node.predecessorNodeIds.map(
          (predecessorNodeId) =>
            `dependency-order://${encodeURIComponent(predecessorNodeId)}/${encodeURIComponent(node.nodeId)}`
        )
      )
    ),
    phaseGateRefs: dependencyMapRefs,
    basisRefs: uniqueSorted([
      ...dependencyMapRefs,
      ...(input.traversalSelections ?? Object.freeze([])).map(
        (selection) => selection.selectionRef
      ),
      ...(input.startingRequirementRefs ?? Object.freeze([])),
      ...(input.startingNodeIds ?? Object.freeze([])),
      ...(input.basisRefs ?? Object.freeze([]))
    ]),
    ...(input.edgeRefs === undefined
      ? {}
      : { edgeRefs: uniqueSorted(input.edgeRefs) }),
    batch: Object.freeze({
      targetItemCount: selectedScheduleItemRefs.length,
      maxItemCount: Math.max(
        selectedScheduleItemRefs.length,
        Math.floor(input.maxItemCount ?? selectedScheduleItemRefs.length)
      )
    }),
    continuation: Object.freeze({
      sameEdgeUntil: "foldback_closed" as const,
      maxAttemptsWithoutNewSignal: 10,
      maxTotalAttempts: 64
    })
  });
}

function blockingReasons(input: {
  readonly upstreamPerDownstreamRatio: number;
  readonly thresholds: SdlcDecompositionSummaryThresholds;
  readonly overloadedDownstreamIds: readonly string[];
  readonly explosionUpstreamRefs: readonly string[];
  readonly unownedDownstreamIds: readonly string[];
  readonly facadeDownstreamIds: readonly string[];
  readonly underDecomposedParentIds: readonly string[];
  readonly residualOutsideSubsurfaceRefs: readonly string[];
  readonly invalidReferenceFields: readonly string[];
  readonly requireTrivialDegenerateProduct: boolean;
  readonly upstreamCount: number;
  readonly downstreamCount: number;
  readonly rows: readonly SdlcDecompositionSummaryRow[];
}): readonly string[] {
  const reasons: string[] = [];
  if (
    input.upstreamPerDownstreamRatio >
    input.thresholds.maxUpstreamPerDownstreamRatio
  ) {
    reasons.push("decomposition_compression_ratio_exceeds_threshold");
  }
  if (input.overloadedDownstreamIds.length > 0) {
    reasons.push("decomposition_high_density_downstream_rows");
  }
  if (input.explosionUpstreamRefs.length > 0) {
    reasons.push("decomposition_explosion_downstream_rows");
  }
  if (input.unownedDownstreamIds.length > 0) {
    reasons.push("decomposition_downstream_rows_without_upstream_basis");
  }
  if (input.facadeDownstreamIds.length > 0) {
    reasons.push("decomposition_facade_downstream_rows");
  }
  if (input.underDecomposedParentIds.length > 0) {
    reasons.push("decomposition_under_decomposed_parent_rows");
  }
  if (input.residualOutsideSubsurfaceRefs.length > 0) {
    reasons.push("decomposition_residual_outside_subsurface");
  }
  if (input.invalidReferenceFields.length > 0) {
    reasons.push("decomposition_invalid_reference_values");
  }
  if (input.upstreamCount > 0 && input.downstreamCount === 0) {
    reasons.push("decomposition_downstream_rows_missing");
  }
  if (input.requireTrivialDegenerateProduct) {
    const row = input.rows[0];
    const hasExecutableBoundary =
      row !== undefined &&
      (row.publicBoundaryCount > 0 || row.materializationTargetRefs.length > 0);
    if (
      input.downstreamCount !== 1 ||
      !hasExecutableBoundary
    ) {
      reasons.push("decomposition_trivial_product_not_single_component");
    }
  }
  return uniqueSorted(reasons);
}

export function deriveSdlcDecompositionSummary(
  input: SdlcDecompositionSummaryInput
): SdlcDecompositionSummary {
  const rows = Object.freeze(input.rows.map((row) => normalizeRow(row)));
  const ownedUpstreamRefs = uniqueSorted(rows.flatMap((row) => row.ownedUpstreamRefs));
  const stageUpstreamUniverseRefs = uniqueSorted(
    input.stageUpstreamUniverseRefs ?? ownedUpstreamRefs
  );
  const invalidRefs = invalidReferenceFields({
    rows: input.rows,
    stageUpstreamUniverseRefs: input.stageUpstreamUniverseRefs ?? []
  });
  const residualRefs = uniqueSorted(rows.flatMap((row) => row.residualRefs));
  const stageUpstreamUniverseSet = new Set(stageUpstreamUniverseRefs);
  const residualOutsideSubsurfaceRefs = uniqueSorted(
    residualRefs.filter((ref) => !stageUpstreamUniverseSet.has(ref))
  );
  const upstreamCount = stageUpstreamUniverseRefs.length;
  const downstreamCount = rows.length;
  const compressionRatio = upstreamPerDownstreamRatio({
    upstreamCount,
    downstreamCount
  });
  const expansionRatio = downstreamPerUpstreamRatio({
    upstreamCount,
    downstreamCount
  });
  const overloadedDownstreamIds = uniqueSorted(
    rows
      .filter(
        (row) =>
          row.ownedUpstreamCount >
          input.thresholds.maxOwnedUpstreamPerDownstream
      )
      .map((row) => row.downstreamId)
  );
  const explodedUpstreamRefs = explosionUpstreamRefs({
    rows,
    thresholds: input.thresholds
  });
  const unownedDownstreamIds = uniqueSorted(
    rows
      .filter((row) => row.ownedUpstreamCount === 0)
      .map((row) => row.downstreamId)
  );
  const facadeDownstreamIds = uniqueSorted(
    rows
      .filter((row) => isFacadeRow({ row, thresholds: input.thresholds }))
      .map((row) => row.downstreamId)
  );
  const underDecomposed = underDecomposedParentIds({
    rows,
    facadeDownstreamIds,
    thresholds: input.thresholds
  });
  const reasons = blockingReasons({
    upstreamPerDownstreamRatio: compressionRatio,
    thresholds: input.thresholds,
    overloadedDownstreamIds,
    explosionUpstreamRefs: explodedUpstreamRefs,
    unownedDownstreamIds,
    facadeDownstreamIds,
    underDecomposedParentIds: underDecomposed,
    residualOutsideSubsurfaceRefs,
    invalidReferenceFields: invalidRefs,
    requireTrivialDegenerateProduct:
      input.requireTrivialDegenerateProduct ?? false,
    upstreamCount,
    downstreamCount,
    rows
  });
  const admissionDecision: SdlcDecompositionAdmissionDecision =
    reasons.length === 0 ? "admit" : "reject";
  return Object.freeze({
    kind: "sdlc_decomposition_summary" as const,
    stageId: input.stageId,
    upstreamKind: input.upstreamKind,
    downstreamKind: input.downstreamKind,
    thresholdProfileRef: input.thresholds.profileRef,
    stageUpstreamUniverseRefs,
    upstreamCount,
    downstreamCount,
    upstreamPerDownstreamRatio: compressionRatio,
    downstreamPerUpstreamRatio: expansionRatio,
    maxUpstreamPerDownstreamRatio:
      input.thresholds.maxUpstreamPerDownstreamRatio,
    maxDownstreamPerUpstream: input.thresholds.maxDownstreamPerUpstream,
    maxOwnedUpstreamPerDownstream:
      input.thresholds.maxOwnedUpstreamPerDownstream,
    maxOwnedUpstreamWithoutBoundary:
      input.thresholds.maxOwnedUpstreamWithoutBoundary,
    rows,
    overloadedDownstreamIds,
    explosionUpstreamRefs: explodedUpstreamRefs,
    unownedDownstreamIds,
    facadeDownstreamIds,
    underDecomposedParentIds: underDecomposed,
    residualRefs,
    residualOutsideSubsurfaceRefs,
    invalidReferenceFields: invalidRefs,
    blockingReasons: reasons,
    admissionDecision
  });
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

function normalizedTargetPath(targetRef: string): string {
  return targetRef
    .trim()
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^file:\/\//u, "")
    .replace(/^\.\//u, "");
}

function isTestMaterializationTarget(targetRef: string): boolean {
  const normalized = normalizedTargetPath(targetRef);
  return (
    /(?:^|\/)test\//u.test(normalized) &&
    /\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(normalized)
  );
}

const JVM_SOURCE_LANGUAGE_DIR = ["sc", "ala"].join("");
const JVM_SOURCE_EXTENSION = `.${JVM_SOURCE_LANGUAGE_DIR}`;
const SCRIPT_SOURCE_EXTENSIONS = Object.freeze([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx"
]);

function sourceFileExtension(targetRef: string): string | null {
  const normalized = normalizedTargetPath(targetRef);
  const match = /(\.[A-Za-z0-9]+)$/u.exec(normalized);
  if (match?.[1] === JVM_SOURCE_EXTENSION) {
    return JVM_SOURCE_EXTENSION;
  }
  return SCRIPT_SOURCE_EXTENSIONS.find((extension) =>
    normalized.endsWith(extension)
  ) ?? null;
}

function pascalRefPart(input: string): string {
  const parts = input
    .trim()
    .replace(/^[A-Za-z][A-Za-z0-9+.-]*:\/\//u, "")
    .split(/[^A-Za-z0-9]+/u)
    .filter((part) => part.length > 0);
  const value = parts
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("");
  return value.length > 0 ? value : "Generated";
}

function materializationTargetBaseName(targetRef: string): string {
  const normalized = normalizedTargetPath(targetRef);
  const basename =
    normalized.split("/").filter((part) => part.length > 0).at(-1) ??
    normalized;
  return basename
    .replace(/\.(test|spec)\.[cm]?[jt]sx?$/u, "")
    .replace(/\.[cm]?[jt]sx?$/u, "")
    .replace(new RegExp(`${JVM_SOURCE_EXTENSION}$`, "u"), "");
}

function unitTestMaterializationTarget(input: {
  readonly sourceTargetRef: string;
  readonly nodeId: string;
}): string | null {
  const normalized = normalizedTargetPath(input.sourceTargetRef);
  if (normalized.length === 0 || isTestMaterializationTarget(normalized)) {
    return null;
  }
  const jvmMainSourceMarker = `/src/main/${JVM_SOURCE_LANGUAGE_DIR}`;
  const jvmMainSourceIndex = normalized.indexOf(jvmMainSourceMarker);
  if (jvmMainSourceIndex >= 0) {
    const root = normalized.slice(0, jvmMainSourceIndex);
    return [
      root,
      "src",
      "test",
      JVM_SOURCE_LANGUAGE_DIR,
      `${pascalRefPart(input.nodeId)}Spec${JVM_SOURCE_EXTENSION}`
    ]
      .filter((part) => part.length > 0)
      .join("/");
  }
  const extension = sourceFileExtension(normalized);
  if (extension === null) {
    return null;
  }
  const parts = normalized.split("/").filter((part) => part.length > 0);
  const sourceIndex = parts.findIndex((part) => part === "src");
  const basename = materializationTargetBaseName(normalized);
  const filename =
    extension === JVM_SOURCE_EXTENSION
      ? `${basename}Spec${extension}`
      : `${basename}.test${extension}`;
  if (sourceIndex >= 0) {
    return [...parts.slice(0, sourceIndex), "test", filename].join("/");
  }
  return ["test", filename].join("/");
}

function implementationSummaryRows(
  register: SdlcDesignDepthRegister
): readonly SdlcDecompositionSummaryCandidateRow[] {
  return Object.freeze(
    register.componentTopologyRows.map((row) =>
      Object.freeze({
        downstreamId: `component://${slugRefPart(row.componentId)}`,
        parentId: `module://${slugRefPart(row.moduleName)}`,
        ownedUpstreamRefs: row.requirementIds,
        publicBoundaryRefs:
          row.relativePath.length > 0 ? [row.relativePath] : [],
        substantiveResponsibilityRefs: [
          `concern-role://${row.concernRole}`,
          ...row.sourceAssetRefs
        ],
        materializationTargetRefs:
          row.relativePath.length > 0 ? [row.relativePath] : [],
        residualRefs: []
      } satisfies SdlcDecompositionSummaryCandidateRow)
    )
  );
}

function moduleDependencyMapFromDesign(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly summary: SdlcDecompositionSummary;
}): SdlcModuleDependencyMap {
  const componentModuleById = new Map<string, string>();
  for (const row of input.register.componentTopologyRows) {
    componentModuleById.set(row.componentId, row.moduleName);
  }
  for (const row of input.register.componentRealizationRows) {
    componentModuleById.set(row.componentId, row.moduleName);
  }
  const modules = uniqueSorted([
    ...input.register.implementationModuleRows.map((row) => row.moduleName),
    ...input.register.componentTopologyRows.map((row) => row.moduleName),
    ...input.register.componentRealizationRows.map((row) => row.moduleName)
  ]);
  const predecessorByModule = new Map<string, Set<string>>();
  for (const moduleName of modules) {
    predecessorByModule.set(moduleName, new Set());
  }
  for (const row of input.register.componentRealizationRows) {
    const predecessors = predecessorByModule.get(row.moduleName) ?? new Set<string>();
    for (const upstreamComponentId of row.upstreamComponentIds) {
      const upstreamModuleName = componentModuleById.get(upstreamComponentId);
      if (
        upstreamModuleName !== undefined &&
        upstreamModuleName !== row.moduleName
      ) {
        predecessors.add(upstreamModuleName);
      }
    }
    predecessorByModule.set(row.moduleName, predecessors);
  }
  const successorByModule = new Map<string, Set<string>>();
  for (const moduleName of modules) {
    successorByModule.set(moduleName, new Set());
  }
  for (const [moduleName, predecessorNames] of predecessorByModule.entries()) {
    for (const predecessorName of predecessorNames) {
      const successors = successorByModule.get(predecessorName) ?? new Set<string>();
      successors.add(moduleName);
      successorByModule.set(predecessorName, successors);
    }
  }
  const cycleRefs = dependencyCycleRefs(
    new Map(
      modules.map((moduleName) => [
        moduleName,
        uniqueSorted([...(predecessorByModule.get(moduleName) ?? new Set())])
      ])
    ),
    "module"
  );
  return Object.freeze({
    kind: "sdlc_module_dependency_map" as const,
    mapRef: "dependency-map://odd-sdlc/implementation/modules",
    summaryRef: `decomposition-summary://odd-sdlc/${input.summary.stageId}`,
    nodes: Object.freeze(
      modules.map((moduleName) =>
        Object.freeze({
          nodeId: `module://${slugRefPart(moduleName)}`,
          predecessorNodeIds: uniqueSorted(
            [...(predecessorByModule.get(moduleName) ?? new Set())].map(
              (predecessor) => `module://${slugRefPart(predecessor)}`
            )
          ),
          successorNodeIds: uniqueSorted(
            [...(successorByModule.get(moduleName) ?? new Set())].map(
              (successor) => `module://${slugRefPart(successor)}`
            )
          ),
          ownedRequirementRefs: uniqueSorted([
            ...input.register.componentTopologyRows
              .filter((row) => row.moduleName === moduleName)
              .flatMap((row) => row.requirementIds),
            ...input.register.componentRealizationRows
              .filter((row) => row.moduleName === moduleName)
              .flatMap((row) => row.requirementIds)
          ]),
          materializationTargetRefs: uniqueSorted([
            ...input.register.componentTopologyRows
              .filter((row) => row.moduleName === moduleName)
              .map((row) => row.relativePath),
            ...input.register.componentRealizationRows
              .filter((row) => row.moduleName === moduleName)
              .map((row) => row.relativePath)
          ])
        })
      )
    ),
    steelThreadCandidateNodeIds: uniqueSorted(
      modules
        .filter((moduleName) => (predecessorByModule.get(moduleName)?.size ?? 0) === 0)
        .slice(0, 1)
        .map((moduleName) => `module://${slugRefPart(moduleName)}`)
    ),
    parallelPartitionRefs: uniqueSorted(
      modules.map((moduleName) => `partition://module/${slugRefPart(moduleName)}`)
    ),
    cycleRefs
  });
}

function dependencyCycleRefs(
  predecessorByNode: ReadonlyMap<string, readonly string[]>,
  scheme: string
): readonly string[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles = new Set<string>();
  const visit = (nodeId: string, path: readonly string[]): void => {
    if (visiting.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      const cyclePath = (cycleStart >= 0 ? path.slice(cycleStart) : path).concat(
        nodeId
      );
      cycles.add(
        `cycle://${scheme}/${cyclePath.map((part) => slugRefPart(part)).join("-")}`
      );
      return;
    }
    if (visited.has(nodeId)) {
      return;
    }
    visiting.add(nodeId);
    for (const predecessor of predecessorByNode.get(nodeId) ?? []) {
      visit(predecessor, [...path, nodeId]);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  for (const nodeId of predecessorByNode.keys()) {
    visit(nodeId, []);
  }
  return uniqueSorted([...cycles]);
}

export function deriveSdlcStagedImplementationTopologyAuthority(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly thresholds?: SdlcDecompositionSummaryThresholds | undefined;
  readonly requireTrivialDegenerateProduct?: boolean | undefined;
}): SdlcStagedImplementationTopologyAuthority {
  const summary = deriveSdlcDecompositionSummary({
    stageId: "implementation_design_to_component_topology",
    upstreamKind: "requirement",
    downstreamKind: "component",
    thresholds: input.thresholds ?? SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    rows: implementationSummaryRows(input.register),
    requireTrivialDegenerateProduct: input.requireTrivialDegenerateProduct
  });
  return Object.freeze({
    summary,
    dependencyMap: moduleDependencyMapFromDesign({
      register: input.register,
      summary
    })
  });
}

function testSummaryRows(input: {
  readonly register: SdlcTestDesignRegister;
  readonly requireTrivialDegenerateProduct: boolean;
}): readonly SdlcDecompositionSummaryCandidateRow[] {
  return Object.freeze(
    input.register.testComponentTopologyRows.map((row) =>
      Object.freeze({
        downstreamId: `test-class://${slugRefPart(row.testClassId)}`,
        parentId:
          row.shardId === null ? null : `test-shard://${slugRefPart(row.shardId)}`,
        ownedUpstreamRefs: input.requireTrivialDegenerateProduct
          ? row.requirementIds
          : row.testcaseIds.length > 0
            ? row.testcaseIds
            : row.requirementIds,
        publicBoundaryRefs:
          row.relativePath.length > 0 ? [row.relativePath] : [],
        substantiveResponsibilityRefs: uniqueSorted([
          ...row.componentIds.map(
            (componentId) => `component://${slugRefPart(componentId)}`
          ),
          ...row.requirementIds
        ]),
        materializationTargetRefs:
          row.relativePath.length > 0 ? [row.relativePath] : [],
        residualRefs: []
      } satisfies SdlcDecompositionSummaryCandidateRow)
    )
  );
}

function testDependencyMapFromDesign(input: {
  readonly register: SdlcTestDesignRegister;
  readonly summary: SdlcDecompositionSummary;
}): SdlcTestDependencyMap {
  const nodes = input.register.testComponentTopologyRows.map((row) => row.testClassId);
  return Object.freeze({
    kind: "sdlc_test_dependency_map" as const,
    mapRef: "dependency-map://odd-sdlc/test/classes",
    summaryRef: `decomposition-summary://odd-sdlc/${input.summary.stageId}`,
    nodes: Object.freeze(
      nodes.map((testClassId) => {
        const topologyRows = input.register.testComponentTopologyRows.filter(
          (row) => row.testClassId === testClassId
        );
        return Object.freeze({
          nodeId: `test-class://${slugRefPart(testClassId)}`,
          predecessorNodeIds: Object.freeze([]),
          successorNodeIds: Object.freeze([]),
          ownedRequirementRefs: uniqueSorted(
            topologyRows.flatMap((row) => row.requirementIds)
          ),
          materializationTargetRefs: uniqueSorted(
            topologyRows.map((row) => row.relativePath)
          )
        });
      })
    ),
    steelThreadCandidateNodeIds: uniqueSorted(
      nodes.slice(0, 1).map((testClassId) => `test-class://${slugRefPart(testClassId)}`)
    ),
    parallelShardRefs: uniqueSorted(
      input.register.testComponentTopologyRows.map((row) =>
        row.shardId === null
          ? `shard://test-class/${slugRefPart(row.testClassId)}`
          : `shard://${slugRefPart(row.shardId)}`
      )
    ),
    cycleRefs: Object.freeze([])
  });
}

export function deriveSdlcTestDependencyMapFromImplementationDependencyMap(
  input: SdlcDerivedTestDependencyMapInput
): SdlcTestDependencyMap | null {
  const explicitTestNodes = input.moduleDependencyMap.nodes.flatMap((node) =>
    node.materializationTargetRefs
      .filter(isTestMaterializationTarget)
      .map((targetRef) =>
        Object.freeze({
          nodeId: `test-class://${slugRefPart(materializationTargetBaseName(targetRef))}`,
          predecessorNodeIds: Object.freeze([]),
          successorNodeIds: Object.freeze([]),
          ownedRequirementRefs: node.ownedRequirementRefs,
          materializationTargetRefs: Object.freeze([targetRef])
        })
      )
  );
  const testNodes =
    explicitTestNodes.length > 0
      ? explicitTestNodes
      : input.moduleDependencyMap.nodes.flatMap((node) => {
          const targetRefs = uniqueSorted(
            node.materializationTargetRefs.flatMap((sourceTargetRef) => {
              const targetRef = unitTestMaterializationTarget({
                sourceTargetRef,
                nodeId: node.nodeId
              });
              return targetRef === null ? [] : [targetRef];
            })
          );
          return targetRefs.map((targetRef) =>
            Object.freeze({
              nodeId: `test-class://${slugRefPart(`${node.nodeId}:${targetRef}`)}`,
              predecessorNodeIds: Object.freeze([]),
              successorNodeIds: Object.freeze([]),
              ownedRequirementRefs: node.ownedRequirementRefs,
              materializationTargetRefs: Object.freeze([targetRef])
            })
          );
        });
  if (testNodes.length === 0) {
    return null;
  }
  const firstTestNode = testNodes[0];
  return Object.freeze({
    kind: "sdlc_test_dependency_map" as const,
    mapRef:
      input.mapRef ??
      "dependency-map://odd-sdlc/test/classes-derived-from-implementation",
    summaryRef: input.summaryRef ?? input.moduleDependencyMap.summaryRef,
    nodes: Object.freeze(testNodes),
    steelThreadCandidateNodeIds:
      firstTestNode === undefined
        ? Object.freeze([])
        : Object.freeze([firstTestNode.nodeId]),
    parallelShardRefs: uniqueSorted(
      testNodes.map(
        (node) => `shard://test-class/${slugRefPart(node.nodeId)}`
      )
    ),
    cycleRefs: Object.freeze([])
  });
}

function uatTestMaterializationTarget(targetRef: string): string {
  const normalized = normalizedTargetPath(targetRef);
  const parts = normalized.split("/").filter((part) => part.length > 0);
  const basename = materializationTargetBaseName(normalized);
  const filename = normalized.endsWith(JVM_SOURCE_EXTENSION)
    ? `${basename}UatSpec${JVM_SOURCE_EXTENSION}`
    : normalized.endsWith(".js") || normalized.endsWith(".jsx")
      ? `${basename}.uat.test.js`
      : normalized.endsWith(".mjs")
        ? `${basename}.uat.test.mjs`
        : normalized.endsWith(".cjs")
        ? `${basename}.uat.test.cjs`
        : normalized.endsWith(".tsx")
          ? `${basename}.uat.test.tsx`
          : `${basename}.uat.test.ts`;
  const jvmTestMarker = `/src/test/${JVM_SOURCE_LANGUAGE_DIR}/`;
  const jvmTestIndex = normalized.indexOf(jvmTestMarker);
  if (jvmTestIndex >= 0) {
    const root = normalized.slice(0, jvmTestIndex);
    return [
      root,
      "src",
      "test",
      JVM_SOURCE_LANGUAGE_DIR,
      "uat",
      filename
    ]
      .filter((part) => part.length > 0)
      .join("/");
  }
  const testIndex = parts.findIndex((part) => part === "test" || part === "tests");
  if (testIndex >= 0) {
    return [...parts.slice(0, testIndex + 1), "uat", filename].join("/");
  }
  const srcIndex = parts.findIndex((part) => part === "src");
  if (srcIndex >= 0) {
    return [...parts.slice(0, srcIndex), "test", "uat", filename].join("/");
  }
  return ["test", "uat", filename].join("/");
}

export function deriveSdlcUatTestDependencyMapFromTestDependencyMap(input: {
  readonly testDependencyMap: SdlcTestDependencyMap;
  readonly mapRef?: string | undefined;
  readonly summaryRef?: string | undefined;
}): SdlcTestDependencyMap | null {
  const nodes = input.testDependencyMap.nodes.map((node) =>
    Object.freeze({
      nodeId: `uat-test://${slugRefPart(node.nodeId)}`,
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze([]),
      ownedRequirementRefs: node.ownedRequirementRefs,
      materializationTargetRefs: uniqueSorted(
        node.materializationTargetRefs.map(uatTestMaterializationTarget)
      )
    })
  );
  if (nodes.length === 0) {
    return null;
  }
  const firstNode = nodes[0];
  return Object.freeze({
    kind: "sdlc_test_dependency_map" as const,
    mapRef:
      input.mapRef ??
      "dependency-map://odd-sdlc/uat-test/source-from-test-authority",
    summaryRef: input.summaryRef ?? input.testDependencyMap.summaryRef,
    nodes: Object.freeze(nodes),
    steelThreadCandidateNodeIds:
      firstNode === undefined
        ? Object.freeze([])
        : Object.freeze([firstNode.nodeId]),
    parallelShardRefs: uniqueSorted(
      nodes.map((node) => `shard://uat-test/${slugRefPart(node.nodeId)}`)
    ),
    cycleRefs: Object.freeze([])
  });
}

export function deriveSdlcStagedTestTopologyAuthority(input: {
  readonly register: SdlcTestDesignRegister;
  readonly thresholds?: SdlcDecompositionSummaryThresholds | undefined;
  readonly requireTrivialDegenerateProduct?: boolean | undefined;
}): SdlcStagedTestTopologyAuthority {
  const requireTrivialDegenerateProduct =
    input.requireTrivialDegenerateProduct ?? false;
  const summary = deriveSdlcDecompositionSummary({
    stageId: "test_design_to_test_component_topology",
    upstreamKind: requireTrivialDegenerateProduct ? "requirement" : "testcase",
    downstreamKind: "test_class",
    thresholds: input.thresholds ?? SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    rows: testSummaryRows({
      register: input.register,
      requireTrivialDegenerateProduct
    }),
    requireTrivialDegenerateProduct
  });
  return Object.freeze({
    summary,
    dependencyMap: testDependencyMapFromDesign({
      register: input.register,
      summary
    })
  });
}

export function selectSdlcDependencyMapTraversal(
  input: SdlcDependencyTraversalSelectionInput
): SdlcDependencyTraversalSelection {
  const policy = input.policy ?? "steel_thread_first";
  const carrier = input.selectedMethodCarrier;
  const requestedMethod =
    carrier?.selectedMethod ??
    inferredDependencyTraversalMethod({
      dependencyMap: input.dependencyMap,
      policy
    });
  const invalidSelectionReasons = invalidSelectedTraversalMethodReasons({
    dependencyMap: input.dependencyMap,
    selectedMethod: requestedMethod
  });
  const selectedMethod =
    invalidSelectionReasons.length > 0 ? "blocked" : requestedMethod;
  const parallelRefs = parallelGroupRefs(input.dependencyMap);
  const cycleBlockingReasons = input.dependencyMap.cycleRefs.map(
    (cycleRef) => `dependency_cycle:${cycleRef}`
  );
  return Object.freeze({
    kind: "sdlc_dependency_traversal_selection" as const,
    selectionRef: input.selectionRef,
    dependencyMapRef: input.dependencyMap.mapRef,
    dependencyMapKind: input.dependencyMap.kind,
    selectedMethod,
    selectedNodeIds: selectedNodeIds({
      dependencyMap: input.dependencyMap,
      method: selectedMethod
    }),
    parallelGroupRefs:
      selectedMethod === "parallel" ? uniqueSorted(parallelRefs) : Object.freeze([]),
    blockingReasons:
      selectedMethod === "blocked"
        ? uniqueSorted([...cycleBlockingReasons, ...invalidSelectionReasons])
        : Object.freeze([]),
    basisRefs: uniqueSorted([
      input.dependencyMap.mapRef,
      input.dependencyMap.summaryRef,
      ...(carrier?.evidenceRefs ?? []),
      ...(input.basisRefs ?? [])
    ])
  });
}
