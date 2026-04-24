import type {
  OperatorAssetQueryContract,
  OperatorAssetRegistryEntry,
  OperatorAssetTarget,
  PublicAssetAddressingOutcome,
  PublicAssetAddressingRejected,
  PublicAssetAddressingRequest,
  PublicAssetAddressingResolved,
  ResolvedAssetTargetProjection
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructOperatorAssetTarget(handle: string): OperatorAssetTarget {
  return Object.freeze({
    kind: "asset",
    handle
  });
}

export function constructPublicAssetAddressingRequest(input: {
  readonly target: OperatorAssetTarget;
}): PublicAssetAddressingRequest {
  return Object.freeze({
    target: input.target
  });
}

export function constructOperatorAssetQueryContract(input: {
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
}): OperatorAssetQueryContract {
  if (input.command.length === 0) {
    throw new TypeError("OperatorAssetQueryContract.command must be non-empty");
  }
  if (!Number.isInteger(input.timeoutSeconds) || input.timeoutSeconds <= 0) {
    throw new TypeError(
      "OperatorAssetQueryContract.timeoutSeconds must be a positive integer"
    );
  }
  return Object.freeze({
    command: freezeStringArray(input.command),
    assetsKey: input.assetsKey,
    handleKey: input.handleKey,
    assetIdKey: input.assetIdKey,
    uriKey: input.uriKey,
    relativePathKey: input.relativePathKey,
    pathKindKey: input.pathKindKey,
    existsKey: input.existsKey,
    ownerKindKey: input.ownerKindKey,
    ownerHandleKey: input.ownerHandleKey,
    ownerTargetIdKey: input.ownerTargetIdKey,
    timeoutSeconds: input.timeoutSeconds,
    bindingSource: input.bindingSource
  });
}

export function constructOperatorAssetRegistryEntry(input: {
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
}): OperatorAssetRegistryEntry {
  return Object.freeze({
    handle: input.handle,
    assetId: input.assetId,
    uri: input.uri,
    relativePath: input.relativePath,
    pathKind: input.pathKind,
    exists: input.exists,
    ownerKind: input.ownerKind,
    ownerHandle: input.ownerHandle,
    ownerTargetId: input.ownerTargetId,
    bindingSource: input.bindingSource
  });
}

export function constructResolvedAssetTargetProjection(input: {
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
}): ResolvedAssetTargetProjection {
  return Object.freeze({
    publicRef: `asset:${input.assetHandle}`,
    assetHandle: input.assetHandle,
    assetId: input.assetId,
    assetUri: input.assetUri,
    assetRelativePath: input.assetRelativePath,
    assetPathKind: input.assetPathKind,
    assetExists: input.assetExists,
    bindingSource: input.bindingSource,
    ownerKind: input.ownerKind,
    ownerHandle: input.ownerHandle,
    ownerTargetId: input.ownerTargetId
  });
}

export function constructResolvedPublicAssetAddressingOutcome(input: {
  readonly target: ResolvedAssetTargetProjection;
}): PublicAssetAddressingResolved {
  return Object.freeze({
    kind: "resolved",
    target: input.target
  });
}

export function constructRejectedPublicAssetAddressingOutcome(
  reason: string
): PublicAssetAddressingRejected {
  return Object.freeze({
    kind: "rejected",
    reason
  });
}

export function constructPublicAssetAddressingOutcome(
  outcome: PublicAssetAddressingOutcome
): PublicAssetAddressingOutcome {
  return outcome;
}
