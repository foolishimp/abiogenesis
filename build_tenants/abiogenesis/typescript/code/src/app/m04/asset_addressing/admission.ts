// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  constructOperatorAssetQueryContract,
  constructOperatorAssetTarget,
  constructPublicAssetAddressingRequest
} from "./constructors.js";
import type {
  OperatorAssetQueryContract,
  PublicAssetAddressingRequest
} from "./carriers.js";

const DEFAULT_TIMEOUT_SECONDS = 5;

function parsePositiveTimeoutSeconds(input: unknown, label: string): number {
  if (input === undefined) {
    return DEFAULT_TIMEOUT_SECONDS;
  }
  if (typeof input !== "number" || !Number.isInteger(input) || input <= 0) {
    throw new TypeError(`${label}: expected a positive integer`);
  }
  return input;
}

export function admitPublicAssetAddressingRequest(
  input: unknown,
  label = "PublicAssetAddressingRequest"
): PublicAssetAddressingRequest {
  const requestObject = parsePlainObject(input, label);
  const targetObject = parsePlainObject(requestObject["target"], `${label}.target`);
  const kind = parseNonEmptyString(targetObject["kind"], `${label}.target.kind`);
  if (kind !== "asset") {
    throw new TypeError(
      `${label}.target.kind: expected "asset", got ${JSON.stringify(kind)}`
    );
  }
  return constructPublicAssetAddressingRequest({
    target: constructOperatorAssetTarget(
      parseNonEmptyString(targetObject["handle"], `${label}.target.handle`)
    )
  });
}

export function admitOperatorAssetQueryContract(
  input: unknown,
  label = "OperatorAssetQueryContract"
): OperatorAssetQueryContract {
  const contractObject = parsePlainObject(input, label);
  return constructOperatorAssetQueryContract({
    command: parseStringArray(contractObject["command"], `${label}.command`),
    assetsKey: parseNonEmptyString(
      parseOptionalField(contractObject, "assets_key") ?? "assets",
      `${label}.assets_key`
    ),
    handleKey: parseNonEmptyString(
      parseOptionalField(contractObject, "handle_key") ?? "asset_id",
      `${label}.handle_key`
    ),
    assetIdKey: parseNonEmptyString(
      parseOptionalField(contractObject, "asset_id_key") ?? "asset_id",
      `${label}.asset_id_key`
    ),
    uriKey: parseNonEmptyString(
      parseOptionalField(contractObject, "uri_key") ?? "uri",
      `${label}.uri_key`
    ),
    relativePathKey: parseNonEmptyString(
      parseOptionalField(contractObject, "relative_path_key") ??
        "metadata.relative_path",
      `${label}.relative_path_key`
    ),
    pathKindKey: parseNonEmptyString(
      parseOptionalField(contractObject, "path_kind_key") ?? "checkpoint.path_kind",
      `${label}.path_kind_key`
    ),
    existsKey: parseNonEmptyString(
      parseOptionalField(contractObject, "exists_key") ?? "checkpoint.exists",
      `${label}.exists_key`
    ),
    ownerKindKey: parseNonEmptyString(
      parseOptionalField(contractObject, "owner_kind_key") ?? "operator_target.kind",
      `${label}.owner_kind_key`
    ),
    ownerHandleKey: parseNonEmptyString(
      parseOptionalField(contractObject, "owner_handle_key") ??
        "operator_target.handle",
      `${label}.owner_handle_key`
    ),
    ownerTargetIdKey: parseNonEmptyString(
      parseOptionalField(contractObject, "owner_target_id_key") ??
        "operator_target.target_id",
      `${label}.owner_target_id_key`
    ),
    timeoutSeconds: parsePositiveTimeoutSeconds(
      parseOptionalField(contractObject, "timeout_seconds"),
      `${label}.timeout_seconds`
    ),
    bindingSource: parseNonEmptyString(
      parseOptionalField(contractObject, "binding_source") ??
        "runtime_config.operator_asset_contract",
      `${label}.binding_source`
    )
  });
}
