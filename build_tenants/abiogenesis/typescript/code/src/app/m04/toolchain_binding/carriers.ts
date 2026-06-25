// Implements: REQ-P-INSTALL

export type ToolchainSelectionSource =
  | "explicit"
  | "environment"
  | "workspace_binding"
  | "default";

export interface ToolchainMutableStateRoots {
  readonly observedWorkspaceRoot: string;
  readonly observerStateRoot: string;
  readonly executorStateRoot: string;
  readonly eventRoot: string;
  readonly eventLogPath: string;
  readonly runtimeRoot: string;
  readonly projectionRoot: string;
  readonly archiveRoot: string;
}

export interface ToolchainProductBinding {
  readonly kind: "abg_toolchain_product_binding";
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly productRoot: string;
  readonly packageRoot: string;
  readonly binRoot: string;
  readonly libRoot: string;
  readonly docsRoot: string | null;
  readonly standardsRoot: string | null;
  readonly manifestPath: string | null;
  readonly commandPaths: readonly string[];
}

export interface ToolchainWorkspaceBinding {
  readonly kind: "abg_toolchain_workspace_binding";
  readonly schemaVersion: "1";
  readonly targetRoot: string;
  readonly toolchainRoot: string;
  readonly selectionSource: ToolchainSelectionSource;
  readonly bindingPath: string | null;
  readonly products: readonly ToolchainProductBinding[];
  readonly mutableStateRoots: ToolchainMutableStateRoots;
}

export interface ToolchainMutableStateRootInput {
  readonly observedWorkspaceRoot?: string | null;
  readonly observerStateRoot?: string | null;
  readonly executorStateRoot?: string | null;
  readonly eventRoot?: string | null;
  readonly eventLogPath?: string | null;
  readonly runtimeRoot?: string | null;
  readonly projectionRoot?: string | null;
  readonly archiveRoot?: string | null;
}
