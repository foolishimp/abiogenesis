// Implements: REQ-F-ODDSDLC-032

import {
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString
} from "../shared/validation.js";
import type { SdlcRuntimeLayout } from "./carriers.js";

export const ODD_SDLC_RUNTIME_ROOT_RELATIVE_PATH =
  ".ai-workspace/runtime/odd_sdlc" as const;
export const ODD_SDLC_TRANSFORM_ASSET_ROOT_RELATIVE_PATH =
  ".ai-workspace/runtime/odd_sdlc/assets" as const;
export const ODD_SDLC_OPERATOR_RUN_ROOT_RELATIVE_PATH =
  ".ai-workspace/runtime/odd_sdlc/operator-runs" as const;

function assertRelativeRuntimePath(value: string, label: string): void {
  if (value.startsWith("/") || value.includes("..")) {
    throw new TypeError(`${label}: expected workspace-relative runtime path`);
  }
  if (!value.startsWith(".ai-workspace/runtime/")) {
    throw new TypeError(`${label}: expected .ai-workspace/runtime/*`);
  }
}

export function standardSdlcRuntimeLayout(): SdlcRuntimeLayout {
  return Object.freeze({
    kind: "sdlc_runtime_layout",
    runtimeRoot: ODD_SDLC_RUNTIME_ROOT_RELATIVE_PATH,
    transformAssetRoot: ODD_SDLC_TRANSFORM_ASSET_ROOT_RELATIVE_PATH,
    operatorRunRoot: ODD_SDLC_OPERATOR_RUN_ROOT_RELATIVE_PATH,
    productMaterializationRootPolicy: "selected_output_root"
  });
}

export function admitSdlcRuntimeLayout(
  input: unknown,
  label = "SdlcRuntimeLayout"
): SdlcRuntimeLayout {
  const record = parseClosedRecord(input, label, [
    "kind",
    "runtimeRoot",
    "transformAssetRoot",
    "operatorRunRoot",
    "productMaterializationRootPolicy"
  ]);
  if (record["kind"] !== undefined) {
    parseKind(record["kind"], "sdlc_runtime_layout", `${label}.kind`);
  }
  const runtimeRoot = parseNonEmptyString(record["runtimeRoot"], `${label}.runtimeRoot`);
  const transformAssetRoot = parseNonEmptyString(
    record["transformAssetRoot"],
    `${label}.transformAssetRoot`
  );
  const operatorRunRoot = parseNonEmptyString(
    record["operatorRunRoot"],
    `${label}.operatorRunRoot`
  );
  assertRelativeRuntimePath(runtimeRoot, `${label}.runtimeRoot`);
  assertRelativeRuntimePath(transformAssetRoot, `${label}.transformAssetRoot`);
  assertRelativeRuntimePath(operatorRunRoot, `${label}.operatorRunRoot`);
  return Object.freeze({
    kind: "sdlc_runtime_layout",
    runtimeRoot,
    transformAssetRoot,
    operatorRunRoot,
    productMaterializationRootPolicy: parseEnumValue(
      record["productMaterializationRootPolicy"],
      `${label}.productMaterializationRootPolicy`,
      ["selected_output_root"]
    )
  });
}
