// Implements: REQ-P-INSTALL

import { isAbsolute } from "node:path";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  constructToolchainMutableStateRoots,
  constructToolchainProductBinding,
  constructToolchainWorkspaceBinding
} from "./constructors.js";
import type {
  ToolchainMutableStateRoots,
  ToolchainProductBinding,
  ToolchainSelectionSource,
  ToolchainWorkspaceBinding
} from "./carriers.js";

function admitAbsolutePath(input: unknown, label: string): string {
  const path = parseNonEmptyString(input, label);
  if (!isAbsolute(path)) {
    throw new TypeError(`${label}: expected an absolute path`);
  }
  return path;
}

function admitSelectionSource(
  input: unknown,
  label: string
): ToolchainSelectionSource {
  const value = parseNonEmptyString(input, label);
  if (
    value === "explicit" ||
    value === "environment" ||
    value === "workspace_binding"
  ) {
    return value;
  }
  throw new TypeError(
    `${label}: expected explicit, environment, or workspace_binding`
  );
}

export function admitToolchainMutableStateRoots(
  input: unknown,
  label = "toolchainMutableStateRoots"
): ToolchainMutableStateRoots {
  const roots = parsePlainObject(input, label);
  return constructToolchainMutableStateRoots({
    observedWorkspaceRoot: admitAbsolutePath(
      roots["observedWorkspaceRoot"],
      `${label}.observedWorkspaceRoot`
    ),
    observerStateRoot: admitAbsolutePath(
      roots["observerStateRoot"],
      `${label}.observerStateRoot`
    ),
    executorStateRoot: admitAbsolutePath(
      roots["executorStateRoot"],
      `${label}.executorStateRoot`
    ),
    eventRoot: admitAbsolutePath(roots["eventRoot"], `${label}.eventRoot`),
    eventLogPath: admitAbsolutePath(
      roots["eventLogPath"],
      `${label}.eventLogPath`
    ),
    runtimeRoot: admitAbsolutePath(roots["runtimeRoot"], `${label}.runtimeRoot`),
    projectionRoot: admitAbsolutePath(
      roots["projectionRoot"],
      `${label}.projectionRoot`
    ),
    archiveRoot: admitAbsolutePath(roots["archiveRoot"], `${label}.archiveRoot`)
  });
}

export function admitToolchainProductBinding(
  input: unknown,
  label = "toolchainProductBinding"
): ToolchainProductBinding {
  const product = parsePlainObject(input, label);
  const kind = parseNonEmptyString(product["kind"], `${label}.kind`);
  if (kind !== "abg_toolchain_product_binding") {
    throw new TypeError(`${label}.kind: expected abg_toolchain_product_binding`);
  }
  return constructToolchainProductBinding({
    kind: "abg_toolchain_product_binding",
    productId: parseNonEmptyString(product["productId"], `${label}.productId`),
    packageName: parseNonEmptyString(
      product["packageName"],
      `${label}.packageName`
    ),
    packageVersion: parseNonEmptyString(
      product["packageVersion"],
      `${label}.packageVersion`
    ),
    productRoot: admitAbsolutePath(product["productRoot"], `${label}.productRoot`),
    packageRoot: admitAbsolutePath(product["packageRoot"], `${label}.packageRoot`),
    binRoot: admitAbsolutePath(product["binRoot"], `${label}.binRoot`),
    libRoot: admitAbsolutePath(product["libRoot"], `${label}.libRoot`),
    docsRoot: admitAbsolutePath(product["docsRoot"], `${label}.docsRoot`),
    standardsRoot: admitAbsolutePath(
      product["standardsRoot"],
      `${label}.standardsRoot`
    ),
    manifestPath: admitAbsolutePath(
      product["manifestPath"],
      `${label}.manifestPath`
    ),
    manifestDigest: parseNonEmptyString(
      product["manifestDigest"],
      `${label}.manifestDigest`
    ),
    commandPaths: parseStringArray(product["commandPaths"], `${label}.commandPaths`)
  });
}

export function admitToolchainWorkspaceBinding(
  input: unknown,
  label = "toolchainWorkspaceBinding"
): ToolchainWorkspaceBinding {
  const binding = parsePlainObject(input, label);
  const kind = parseNonEmptyString(binding["kind"], `${label}.kind`);
  if (kind !== "abg_toolchain_workspace_binding") {
    throw new TypeError(`${label}.kind: expected abg_toolchain_workspace_binding`);
  }
  const schemaVersion = parseNonEmptyString(
    binding["schemaVersion"],
    `${label}.schemaVersion`
  );
  if (schemaVersion !== "2") {
    throw new TypeError(`${label}.schemaVersion: expected 2`);
  }
  const productsInput = parseOptionalField(binding, "products");
  if (!Array.isArray(productsInput)) {
    throw new TypeError(`${label}.products: expected array`);
  }
  return constructToolchainWorkspaceBinding({
    targetRoot: admitAbsolutePath(binding["targetRoot"], `${label}.targetRoot`),
    toolchainRoot: admitAbsolutePath(
      binding["toolchainRoot"],
      `${label}.toolchainRoot`
    ),
    selectionSource: admitSelectionSource(
      binding["selectionSource"],
      `${label}.selectionSource`
    ),
    bindingPath:
      binding["bindingPath"] === null
        ? null
        : admitAbsolutePath(binding["bindingPath"], `${label}.bindingPath`),
    products: productsInput.map((entry, index) =>
      admitToolchainProductBinding(entry, `${label}.products[${index}]`)
    ),
    mutableStateRoots: admitToolchainMutableStateRoots(
      binding["mutableStateRoots"],
      `${label}.mutableStateRoots`
    )
  });
}
