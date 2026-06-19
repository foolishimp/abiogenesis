import type {
  SdlcMaterializedProductFileRole
} from "../carriers.js";

export const MATERIALIZED_PRODUCT_FILE_ROLES = Object.freeze([
  "source",
  "test",
  "build_config",
  "design",
  "documentation",
  "other"
] as const satisfies readonly SdlcMaterializedProductFileRole[]);

export const TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS = Object.freeze({
  feature_decomp_surface: "design/feature_decomp_surface.md",
  design_surface: "design/adrs/ADR-001-design-surface.md",
  scenario_surface: "design/scenario_surface.md",
  implementation_design_surface:
    "design/adrs/ADR-002-implementation-design-surface.md",
  component_code_surface: "design/component_code_surface.md",
  component_realization_qualification_surface:
    "design/component_realization_qualification_surface.md",
  code_surface: "design/code_surface.md",
  test_design_surface: "design/adrs/ADR-003-test-design-surface.md",
  component_test_surface: "design/component_test_surface.md",
  uat_test_source_surface: "design/uat_test_source_surface.md",
  component_test_qualification_surface:
    "design/component_test_qualification_surface.md",
  component_repair_schedule_surface: "design/component_repair_schedule_surface.md",
  release_depth_parity_surface: "design/release_depth_parity_surface.md",
  release_surface: "design/release_surface.md",
  retrofit_design_surface: "design/adrs/ADR-004-retrofit-design-surface.md",
  retrofit_plan_surface: "design/retrofit_plan_surface.md",
  gap_observation_surface: "design/gap_observation_surface.md",
  gap_triage_surface: "design/gap_triage_surface.md",
  gap_route_surface: "design/gap_route_surface.md",
  repricing_proposal_surface: "design/repricing_proposal_surface.md",
  ticket_work_item_route_surface: "design/ticket_work_item_route_surface.md",
  gap_retirement_surface: "design/gap_retirement_surface.md"
} as const satisfies Record<string, string>);

export const WORKSPACE_LOCAL_SDLC_SURFACE_OUTPUT_PATHS = Object.freeze({
  intent_surface: "specification/INTENT.md",
  product_surface: "specification/PRODUCT.md",
  goal_surface: "specification/GOALS.md",
  requirement_surface: "specification/requirements/10-generated-bootstrap.md",
  uat_testcases_surface: "specification/scenarios/20-generated-uat-testcases.md",
  testcase_authority_surface:
    "specification/scenarios/30-generated-testcase-authority.md"
} as const satisfies Record<string, string>);

function normalizedSurfaceRelativePath(relativePath: string): string {
  return relativePath.split(/[\\/]+/u).join("/");
}

export function tenantLocalSdlcSurfaceRelativePath(
  targetAssetType: string
): string | null {
  for (const [assetType, relativePath] of Object.entries(
    TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS
  )) {
    if (assetType === targetAssetType) {
      return relativePath;
    }
  }
  return null;
}

export function workspaceLocalSdlcSurfaceRelativePath(
  targetAssetType: string
): string | null {
  for (const [assetType, relativePath] of Object.entries(
    WORKSPACE_LOCAL_SDLC_SURFACE_OUTPUT_PATHS
  )) {
    if (assetType === targetAssetType) {
      return relativePath;
    }
  }
  return null;
}

export function isTenantLocalSdlcSurfaceRelativePath(
  relativePath: string
): boolean {
  const normalized = normalizedSurfaceRelativePath(relativePath);
  const tenantLocalPaths: readonly string[] = Object.values(
    TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS
  );
  return tenantLocalPaths.includes(normalized);
}
