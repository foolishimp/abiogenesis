// Implements: REQ-P-INSTALL-049
// Implements: REQ-P-INSTALL-050

export interface ToolchainMutableStateRootInputV3 {
  readonly observedWorkspaceRoot?: string | null;
  readonly observerStateRoot?: string | null;
  readonly executorStateRoot?: string | null;
  readonly eventRoot?: string | null;
  readonly eventLogPath?: string | null;
  readonly runtimeRoot?: string | null;
  readonly projectionRoot?: string | null;
  readonly archiveRoot?: string | null;
}

export type ToolchainRootSelectionSourceV3 =
  | "explicit"
  | "workspace_binding"
  | "environment";

export interface ResolvedToolchainRootV3 {
  readonly root: string;
  readonly source: ToolchainRootSelectionSourceV3;
}

export interface CatalogBindAttribution {
  readonly actorRef: string;
  readonly provenanceRefs?: readonly string[];
}
