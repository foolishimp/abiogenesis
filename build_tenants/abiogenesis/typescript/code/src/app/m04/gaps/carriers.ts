// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-016
// Implements: REQ-P-POLICY-017

import type {
  AffectPriorityPolicy,
  AbgFallbackBundle,
  ConstructionPriorityScheme,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalKind
} from "../../../abg/m03/contracts/index.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import type {
  PublicRuntimeIdentityProjection,
  PublicStartRequest
} from "../contracts/carriers.js";
import type { PublicStartContext } from "../public_start.js";

export type PublicGapsStatus =
  | "open"
  | "blocked"
  | "converged"
  | "nothing_to_do";

export type PublicGapsEntryStatus =
  | "open"
  | "dispatch_required"
  | "human_gate_required"
  | "converged"
  | "nothing_to_do";

export type PublicGapsNextStep =
  | "start"
  | "assess-result"
  | "human-decision"
  | "none";

export interface PublicGapsRequest {
  readonly scope: PublicStartRequest["startIntent"]["scope"];
}

export interface PublicGapsContext {
  readonly module: Module;
  readonly runtimeIdentity: PublicStartContext["runtimeIdentity"];
  readonly resolvedPolicy: PublicStartContext["resolvedPolicy"];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly abgFallbackBundle?: AbgFallbackBundle | null;
  readonly constructionPriorityScheme?: ConstructionPriorityScheme;
  readonly constructionAffectPolicies?: readonly AffectPriorityPolicy[];
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
}

export interface PublicGapsDeltaSummary {
  readonly vectorCount: number;
  readonly closedVectorCount: number;
  readonly openVectorCount: number;
  readonly plannedVectorIndexes: readonly number[];
  readonly evaluatedVectorIndexes: readonly number[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
}

export interface PublicTypedAssetGapProjectionRow {
  readonly gapRef: string;
  readonly observationId: string;
  readonly assetRef: string;
  readonly assetKind: string;
  readonly requiredByRef: string;
  readonly missingTruthRefs: readonly string[];
  readonly blockingReasonRefs: readonly string[];
  readonly eligibleActionRefs: readonly string[];
  readonly bestActionRef: string | null;
  readonly bestGraphFunctionRef: string | null;
  readonly bestGraphVectorRef: string | null;
  readonly terminalRouteRef: string | null;
  readonly admissionBlockerRefs: readonly string[];
  readonly priorityRank: number;
  readonly rankingReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly actionCatalogRef: string;
  readonly priorityProjectionRef: string;
}

export interface PublicGapsEntry {
  readonly graphFunctionId: string;
  readonly graphFunctionHandle: string;
  readonly jobId: string;
  readonly jobName: string;
  readonly edge: string | null;
  readonly vectorIndex: number | null;
  readonly vectorCount: number;
  readonly closedVectorCount: number;
  readonly openVectorCount: number;
  readonly delta: number;
  readonly failing: readonly string[];
  readonly passing: readonly string[];
  readonly deltaSummary: PublicGapsDeltaSummary;
  readonly environmentReady: boolean;
  readonly status: PublicGapsEntryStatus;
  readonly stopPredicate: "dispatch_required" | "human_gate_required" | null;
  readonly dispatchRef: string | null;
  readonly approvalSubjectRef: string | null;
  readonly terminalKind: TerminalKind | null;
  readonly nextStep: PublicGapsNextStep;
  readonly dispatchRequested: boolean;
  readonly typedAssetGaps: readonly PublicTypedAssetGapProjectionRow[];
  readonly projection: RuntimeAggregateProjection;
}

export interface PublicGapsReadOnlyEvaluatorProjection {
  readonly kind: "public_gaps_read_only_evaluator_projection";
  readonly evaluatorRef: string;
  readonly mutationAllowed: false;
  readonly bestGapRef: string | null;
  readonly bestAssetRef: string | null;
  readonly bestActionRef: string | null;
  readonly bestGraphFunctionRef: string | null;
  readonly bestGraphVectorRef: string | null;
  readonly admissionBlockerRefs: readonly string[];
  readonly rankingReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface PublicGapsScopeProjection {
  readonly package: string;
  readonly selector: {
    readonly kind: "workspace";
    readonly workKey: string | null;
  };
  readonly build: string | null;
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
}

export interface PublicGapsProjection {
  readonly kind: "public_gaps_projection";
  readonly status: PublicGapsStatus;
  readonly scope: PublicGapsScopeProjection;
  readonly jobsConsidered: number;
  readonly totalDelta: number;
  readonly openFrames: number;
  readonly converged: boolean;
  readonly eventCount: number;
  readonly readOnlyEvaluator: PublicGapsReadOnlyEvaluatorProjection;
  readonly gaps: readonly PublicGapsEntry[];
}
