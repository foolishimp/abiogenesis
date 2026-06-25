// Implements: REQ-P-INSTALL

import { isAbsolute, join, resolve } from "node:path";
import {
  constructToolchainMutableStateRoots,
  constructToolchainProductBinding,
  constructToolchainWorkspaceBinding
} from "./constructors.js";
import type {
  ToolchainMutableStateRootInput,
  ToolchainMutableStateRoots,
  ToolchainProductBinding,
  ToolchainSelectionSource,
  ToolchainWorkspaceBinding
} from "./carriers.js";

export const ABG_TOOLCHAIN_ROOT_ENV = "ABG_TOOLCHAIN_ROOT";
export const ABIOGENESIS_HOME_ENV = "ABIOGENESIS_HOME";
export const ODD_SDLC_HOME_ENV = "ODD_SDLC_HOME";

export const TOOLCHAIN_BINDING_RELATIVE_PATH = join(
  ".abiogenesis",
  "toolchain-binding.json"
);

export function defaultToolchainMutableStateRoots(input: {
  readonly targetRoot: string;
  readonly mutableStateRoots?: ToolchainMutableStateRootInput | null;
}): ToolchainMutableStateRoots {
  const observedWorkspaceRoot =
    input.mutableStateRoots?.observedWorkspaceRoot ?? input.targetRoot;
  const observerStateRoot =
    input.mutableStateRoots?.observerStateRoot ??
    join(input.targetRoot, ".ai-workspace");
  const executorStateRoot =
    input.mutableStateRoots?.executorStateRoot ?? observerStateRoot;
  const eventRoot =
    input.mutableStateRoots?.eventRoot ?? join(observerStateRoot, "events");
  const eventLogPath =
    input.mutableStateRoots?.eventLogPath ?? join(eventRoot, "events.jsonl");
  const runtimeRoot =
    input.mutableStateRoots?.runtimeRoot ?? join(observerStateRoot, "runtime");
  const projectionRoot =
    input.mutableStateRoots?.projectionRoot ??
    join(observerStateRoot, "projections");
  const archiveRoot =
    input.mutableStateRoots?.archiveRoot ?? join(observerStateRoot, "archives");

  return constructToolchainMutableStateRoots({
    observedWorkspaceRoot,
    observerStateRoot,
    executorStateRoot,
    eventRoot,
    eventLogPath,
    runtimeRoot,
    projectionRoot,
    archiveRoot
  });
}

export function resolveToolchainRoot(input: {
  readonly targetRoot: string;
  readonly explicitToolchainRoot?: string | null;
  readonly environment?: Readonly<Record<string, string | undefined>>;
}): { readonly root: string; readonly source: ToolchainSelectionSource } {
  if (input.explicitToolchainRoot !== undefined && input.explicitToolchainRoot !== null) {
    return Object.freeze({
      root: resolve(input.explicitToolchainRoot),
      source: "explicit"
    });
  }

  const environment = input.environment ?? process.env;
  const envRoot =
    environment[ABG_TOOLCHAIN_ROOT_ENV] ?? environment[ABIOGENESIS_HOME_ENV];
  if (envRoot !== undefined && envRoot.trim().length > 0) {
    return Object.freeze({
      root: resolve(envRoot),
      source: "environment"
    });
  }

  return Object.freeze({
    root: input.targetRoot,
    source: "default"
  });
}

export function constructAbiogenesisProductToolchainBinding(input: {
  readonly packageVersion: string;
  readonly productRoot: string;
  readonly packageRoot: string;
  readonly binRoot: string;
  readonly libRoot: string;
  readonly docsRoot: string | null;
  readonly standardsRoot: string | null;
  readonly manifestPath: string | null;
  readonly commandPaths: readonly string[];
}): ToolchainProductBinding {
  return constructToolchainProductBinding({
    kind: "abg_toolchain_product_binding",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: input.packageVersion,
    productRoot: input.productRoot,
    packageRoot: input.packageRoot,
    binRoot: input.binRoot,
    libRoot: input.libRoot,
    docsRoot: input.docsRoot,
    standardsRoot: input.standardsRoot,
    manifestPath: input.manifestPath,
    commandPaths: input.commandPaths
  });
}

export function constructWorkspaceToolchainBinding(input: {
  readonly targetRoot: string;
  readonly toolchainRoot: string;
  readonly selectionSource: ToolchainSelectionSource;
  readonly bindingPath?: string | null;
  readonly products: readonly ToolchainProductBinding[];
  readonly mutableStateRoots?: ToolchainMutableStateRootInput | null;
}): ToolchainWorkspaceBinding {
  return constructToolchainWorkspaceBinding({
    targetRoot: input.targetRoot,
    toolchainRoot: input.toolchainRoot,
    selectionSource: input.selectionSource,
    bindingPath: input.bindingPath ?? join(input.targetRoot, TOOLCHAIN_BINDING_RELATIVE_PATH),
    products: input.products,
    mutableStateRoots: defaultToolchainMutableStateRoots({
      targetRoot: input.targetRoot,
      mutableStateRoots: input.mutableStateRoots ?? null
    })
  });
}

export function resolveWorkspaceToolchainPath(
  workspaceRoot: string,
  candidatePath: string
): string {
  if (candidatePath.startsWith("workspace://")) {
    return join(workspaceRoot, candidatePath.slice("workspace://".length));
  }
  return isAbsolute(candidatePath)
    ? candidatePath
    : resolve(workspaceRoot, candidatePath);
}
