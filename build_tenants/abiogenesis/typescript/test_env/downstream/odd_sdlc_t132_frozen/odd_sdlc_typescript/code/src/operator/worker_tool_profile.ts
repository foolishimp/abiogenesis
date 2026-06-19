// Implements: T-188

const SDLC_SHELL_TOOL_TARGET_ASSET_TYPES = Object.freeze([
  "component_code_surface",
  "component_test_surface",
  "test_execution_surface",
  "runtime_execution_surface",
  "execution_result_surface"
] as const);

export function sdlcWorkerTargetUsesShellToolProfile(input: {
  readonly targetAssetType: string;
}): boolean {
  return SDLC_SHELL_TOOL_TARGET_ASSET_TYPES.some(
    (targetAssetType) => targetAssetType === input.targetAssetType
  );
}
