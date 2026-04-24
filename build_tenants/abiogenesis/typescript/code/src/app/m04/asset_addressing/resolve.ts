// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  constructModuleLookupAuthority,
  resolvePublishedGraphFunction
} from "../../../gtl/m02/contracts/lookup.js";
import { parseUnknownArray, parsePlainObject } from "../../../shared/validation/primitives.js";
import { admitPublicAssetAddressingRequest } from "./admission.js";
import {
  constructOperatorAssetRegistryEntry,
  constructPublicAssetAddressingOutcome,
  constructRejectedPublicAssetAddressingOutcome,
  constructResolvedAssetTargetProjection,
  constructResolvedPublicAssetAddressingOutcome
} from "./constructors.js";
import type {
  OperatorAssetQueryContract,
  OperatorAssetQueryRunner,
  OperatorAssetRegistryEntry,
  PublicAssetAddressingContext,
  PublicAssetAddressingOutcome,
  PublicAssetAddressingRequest
} from "./carriers.js";

function digPath(input: unknown, path: string): unknown {
  if (path.length === 0) {
    return input;
  }
  const segments = path.split(".");
  let current: unknown = input;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) {
      return undefined;
    }
    current = Reflect.get(current, segment);
  }
  return current;
}

function coerceOptionalString(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }
  const trimmed = input.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function coerceOptionalBoolean(input: unknown): boolean | null {
  if (typeof input === "boolean") {
    return input;
  }
  if (input === null || input === undefined) {
    return null;
  }
  if (input === "true") {
    return true;
  }
  if (input === "false") {
    return false;
  }
  return null;
}

function resolveOwnerTarget(
  context: PublicAssetAddressingContext,
  contract: OperatorAssetQueryContract,
  entry: unknown,
  assetHandle: string
): {
  readonly ownerHandle: string;
  readonly ownerTargetId: string;
} {
  const authority = constructModuleLookupAuthority(context.module);
  const ownerKind = digPath(entry, contract.ownerKindKey);
  if (ownerKind !== "graph_function") {
    throw new TypeError(
      `operator asset handle ${JSON.stringify(assetHandle)} must publish operator_target.kind="graph_function"`
    );
  }

  const ownerHandleValue = coerceOptionalString(
    digPath(entry, contract.ownerHandleKey)
  );
  const ownerTargetIdValue = coerceOptionalString(
    digPath(entry, contract.ownerTargetIdKey)
  );

  let graphFunctionName: string | null = null;
  let graphFunctionId: string | null = null;

  if (ownerHandleValue !== null) {
    const graphFunction = resolvePublishedGraphFunction(authority, ownerHandleValue);
    graphFunctionName = graphFunction.name;
    graphFunctionId = graphFunction.id;
  }

  if (ownerTargetIdValue !== null) {
    const graphFunction = context.module.graphFunctions.find(
      (candidate) => candidate.id === ownerTargetIdValue
    );
    if (graphFunction === undefined) {
      throw new TypeError(
        `operator asset handle ${JSON.stringify(assetHandle)} references unknown graph-function target_id ${JSON.stringify(ownerTargetIdValue)}`
      );
    }
    if (graphFunctionId !== null && graphFunctionId !== graphFunction.id) {
      throw new TypeError(
        `operator asset handle ${JSON.stringify(assetHandle)} publishes conflicting graph-function ownership`
      );
    }
    graphFunctionName = graphFunction.name;
    graphFunctionId = graphFunction.id;
  }

  if (graphFunctionId === null || graphFunctionName === null) {
    throw new TypeError(
      `operator asset handle ${JSON.stringify(assetHandle)} must publish operator_target.handle or operator_target.target_id`
    );
  }

  return Object.freeze({
    ownerHandle: graphFunctionName,
    ownerTargetId: graphFunctionId
  });
}

function constructRegistryCatalog(
  payload: unknown,
  context: PublicAssetAddressingContext,
  contract: OperatorAssetQueryContract
): ReadonlyMap<string, OperatorAssetRegistryEntry> {
  const assets = parseUnknownArray(digPath(payload, contract.assetsKey), "operatorAssetQuery.assets");
  const entries = new Map<string, OperatorAssetRegistryEntry>();

  for (const [index, entry] of assets.entries()) {
    const entryObject = parsePlainObject(entry, `operatorAssetQuery.assets[${index}]`);
    const handle = coerceOptionalString(digPath(entryObject, contract.handleKey));
    const assetId = coerceOptionalString(digPath(entryObject, contract.assetIdKey));
    const uri = coerceOptionalString(digPath(entryObject, contract.uriKey));

    if (handle === null) {
      throw new TypeError(
        `operator asset query entry ${index} must publish a non-empty handle`
      );
    }
    if (assetId === null) {
      throw new TypeError(
        `operator asset query entry ${index} must publish a non-empty asset_id`
      );
    }
    if (uri === null) {
      throw new TypeError(
        `operator asset query entry ${index} must publish a non-empty uri`
      );
    }

    const owner = resolveOwnerTarget(context, contract, entryObject, handle);
    const catalogEntry = constructOperatorAssetRegistryEntry({
      handle,
      assetId,
      uri,
      relativePath: coerceOptionalString(digPath(entryObject, contract.relativePathKey)),
      pathKind: coerceOptionalString(digPath(entryObject, contract.pathKindKey)),
      exists: coerceOptionalBoolean(digPath(entryObject, contract.existsKey)),
      ownerKind: "graph_function",
      ownerHandle: owner.ownerHandle,
      ownerTargetId: owner.ownerTargetId,
      bindingSource: contract.bindingSource
    });

    const existing = entries.get(handle);
    if (existing !== undefined) {
      if (JSON.stringify(existing) !== JSON.stringify(catalogEntry)) {
        throw new TypeError(
          `operator asset query publishes ambiguous asset handle ${JSON.stringify(handle)}`
        );
      }
      continue;
    }
    entries.set(handle, catalogEntry);
  }

  return entries;
}

function assertOperatorAssetQueryRunner(
  runner: OperatorAssetQueryRunner | undefined
): OperatorAssetQueryRunner {
  if (typeof runner !== "function") {
    throw new TypeError(
      "public asset resolution requires an explicit operator asset query runner"
    );
  }
  return runner;
}

export async function resolvePublicAssetTargetFromRequest(
  request: PublicAssetAddressingRequest,
  context: PublicAssetAddressingContext,
  runner: OperatorAssetQueryRunner
): Promise<PublicAssetAddressingOutcome> {
  const contract = context.operatorAssetContract;
  if (contract === null) {
    return constructPublicAssetAddressingOutcome(
      constructRejectedPublicAssetAddressingOutcome(
        "public asset resolution requires an explicit operator asset contract"
      )
    );
  }

  try {
    const payload = await assertOperatorAssetQueryRunner(runner)({
      workspaceRoot: context.workspaceRoot,
      contract
    });
    const catalog = constructRegistryCatalog(payload, context, contract);
    const resolved = catalog.get(request.target.handle);
    if (resolved === undefined) {
      return constructPublicAssetAddressingOutcome(
        constructRejectedPublicAssetAddressingOutcome(
          `unknown published asset handle ${JSON.stringify(request.target.handle)}`
        )
      );
    }
    return constructPublicAssetAddressingOutcome(
      constructResolvedPublicAssetAddressingOutcome({
        target: constructResolvedAssetTargetProjection({
          assetHandle: resolved.handle,
          assetId: resolved.assetId,
          assetUri: resolved.uri,
          assetRelativePath: resolved.relativePath,
          assetPathKind: resolved.pathKind,
          assetExists: resolved.exists,
          bindingSource: resolved.bindingSource,
          ownerKind: resolved.ownerKind,
          ownerHandle: resolved.ownerHandle,
          ownerTargetId: resolved.ownerTargetId
        })
      })
    );
  } catch (error: unknown) {
    const reason =
      error instanceof Error ? error.message : "operator asset resolution failed";
    return constructPublicAssetAddressingOutcome(
      constructRejectedPublicAssetAddressingOutcome(reason)
    );
  }
}

export async function resolvePublicAssetTarget(
  input: unknown,
  context: PublicAssetAddressingContext,
  runner: OperatorAssetQueryRunner
): Promise<PublicAssetAddressingOutcome> {
  const request = admitPublicAssetAddressingRequest(input);
  return resolvePublicAssetTargetFromRequest(request, context, runner);
}
