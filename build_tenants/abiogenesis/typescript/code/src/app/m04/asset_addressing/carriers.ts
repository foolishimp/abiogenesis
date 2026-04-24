// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type { Module } from "../../../gtl/m02/contracts/carriers.js";

export interface OperatorAssetTarget {
  readonly kind: "asset";
  readonly handle: string;
}

export interface PublicAssetAddressingRequest {
  readonly target: OperatorAssetTarget;
}

export interface OperatorAssetQueryContract {
  readonly command: readonly string[];
  readonly assetsKey: string;
  readonly handleKey: string;
  readonly assetIdKey: string;
  readonly uriKey: string;
  readonly relativePathKey: string;
  readonly pathKindKey: string;
  readonly existsKey: string;
  readonly ownerKindKey: string;
  readonly ownerHandleKey: string;
  readonly ownerTargetIdKey: string;
  readonly timeoutSeconds: number;
  readonly bindingSource: string;
}

export interface OperatorAssetRegistryEntry {
  readonly handle: string;
  readonly assetId: string;
  readonly uri: string;
  readonly relativePath: string | null;
  readonly pathKind: string | null;
  readonly exists: boolean | null;
  readonly ownerKind: "graph_function";
  readonly ownerHandle: string;
  readonly ownerTargetId: string;
  readonly bindingSource: string;
}

export interface ResolvedAssetTargetProjection {
  readonly publicRef: string;
  readonly assetHandle: string;
  readonly assetId: string;
  readonly assetUri: string;
  readonly assetRelativePath: string | null;
  readonly assetPathKind: string | null;
  readonly assetExists: boolean | null;
  readonly bindingSource: string;
  readonly ownerKind: "graph_function";
  readonly ownerHandle: string;
  readonly ownerTargetId: string;
}

export interface PublicAssetAddressingResolved {
  readonly kind: "resolved";
  readonly target: ResolvedAssetTargetProjection;
}

export interface PublicAssetAddressingRejected {
  readonly kind: "rejected";
  readonly reason: string;
}

export type PublicAssetAddressingOutcome =
  | PublicAssetAddressingResolved
  | PublicAssetAddressingRejected;

export interface PublicAssetAddressingContext {
  readonly module: Module;
  readonly workspaceRoot: string;
  readonly operatorAssetContract: OperatorAssetQueryContract | null;
}

export interface OperatorAssetQueryRunnerInput {
  readonly workspaceRoot: string;
  readonly contract: OperatorAssetQueryContract;
}

export type OperatorAssetQueryRunner = (
  input: OperatorAssetQueryRunnerInput
) => Promise<unknown>;
