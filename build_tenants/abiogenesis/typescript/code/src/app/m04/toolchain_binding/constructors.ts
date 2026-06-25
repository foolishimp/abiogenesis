// Implements: REQ-P-INSTALL

import type {
  ToolchainMutableStateRoots,
  ToolchainProductBinding,
  ToolchainSelectionSource,
  ToolchainWorkspaceBinding
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeProductBinding(
  value: ToolchainProductBinding
): ToolchainProductBinding {
  return Object.freeze({
    kind: "abg_toolchain_product_binding",
    productId: value.productId,
    packageName: value.packageName,
    packageVersion: value.packageVersion,
    productRoot: value.productRoot,
    packageRoot: value.packageRoot,
    binRoot: value.binRoot,
    libRoot: value.libRoot,
    docsRoot: value.docsRoot,
    standardsRoot: value.standardsRoot,
    manifestPath: value.manifestPath,
    commandPaths: freezeStringArray(value.commandPaths)
  });
}

export function constructToolchainMutableStateRoots(
  input: ToolchainMutableStateRoots
): ToolchainMutableStateRoots {
  return Object.freeze({
    observedWorkspaceRoot: input.observedWorkspaceRoot,
    observerStateRoot: input.observerStateRoot,
    executorStateRoot: input.executorStateRoot,
    eventRoot: input.eventRoot,
    eventLogPath: input.eventLogPath,
    runtimeRoot: input.runtimeRoot,
    projectionRoot: input.projectionRoot,
    archiveRoot: input.archiveRoot
  });
}

export function constructToolchainProductBinding(
  input: ToolchainProductBinding
): ToolchainProductBinding {
  return freezeProductBinding(input);
}

export function constructToolchainWorkspaceBinding(input: {
  readonly targetRoot: string;
  readonly toolchainRoot: string;
  readonly selectionSource: ToolchainSelectionSource;
  readonly bindingPath: string | null;
  readonly products: readonly ToolchainProductBinding[];
  readonly mutableStateRoots: ToolchainMutableStateRoots;
}): ToolchainWorkspaceBinding {
  return Object.freeze({
    kind: "abg_toolchain_workspace_binding",
    schemaVersion: "1",
    targetRoot: input.targetRoot,
    toolchainRoot: input.toolchainRoot,
    selectionSource: input.selectionSource,
    bindingPath: input.bindingPath,
    products: Object.freeze(input.products.map(freezeProductBinding)),
    mutableStateRoots: constructToolchainMutableStateRoots(input.mutableStateRoots)
  });
}
