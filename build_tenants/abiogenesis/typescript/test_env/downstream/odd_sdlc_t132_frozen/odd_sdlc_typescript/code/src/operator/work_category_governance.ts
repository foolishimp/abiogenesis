import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  SDLC_FUNCTION_CATALOG,
  type SdlcWorkCategoryGovernanceCategory
} from "../graph/index.js";

export type { SdlcWorkCategoryGovernanceCategory };

export type SdlcWorkCategoryGovernanceSelectionSource =
  | "graph_function_catalog";

export interface SdlcWorkCategoryGovernanceSelection {
  readonly kind: "sdlc_work_category_governance_selection";
  readonly category: SdlcWorkCategoryGovernanceCategory;
  readonly configRef: string;
  readonly workerPath: string;
  readonly selectionSource: SdlcWorkCategoryGovernanceSelectionSource;
  readonly edgeName: string;
  readonly targetAssetType: string;
}

const SDLC_WORK_CATEGORY_GOVERNANCE_CATEGORIES = Object.freeze([
  "requirements_build",
  "design_build",
  "coding_build",
  "uat_test_case_build",
  "unit_test_build"
] as const satisfies readonly SdlcWorkCategoryGovernanceCategory[]);

export function sdlcWorkCategoryGovernanceCategories(): readonly SdlcWorkCategoryGovernanceCategory[] {
  return SDLC_WORK_CATEGORY_GOVERNANCE_CATEGORIES;
}

export function sdlcWorkCategoryGovernanceConfigRef(
  category: SdlcWorkCategoryGovernanceCategory
): string {
  return `config://odd-sdlc/work-category-governance/${category}/v1`;
}

export function sdlcWorkCategoryGovernanceConfigPath(
  category: SdlcWorkCategoryGovernanceCategory
): string {
  return join(
    resolve(dirname(fileURLToPath(import.meta.url)), "../../../../.."),
    "config",
    "work-category-governance",
    `${category}.md`
  );
}

export function sdlcWorkCategoryGovernanceWorkerPath(
  category: SdlcWorkCategoryGovernanceCategory
): string {
  return `node_modules/@odd-sdlc/typescript-tenant/config/work-category-governance/${category}.md`;
}

export function sdlcWorkCategoryGovernanceText(
  category: SdlcWorkCategoryGovernanceCategory
): string {
  return readFileSync(sdlcWorkCategoryGovernanceConfigPath(category), "utf8").trimEnd();
}

export function sdlcWorkCategoryForManifest(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
}): SdlcWorkCategoryGovernanceCategory {
  return selectSdlcWorkCategoryGovernance(input).category;
}

export function selectSdlcWorkCategoryGovernance(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
}): SdlcWorkCategoryGovernanceSelection {
  const catalogEntry =
    SDLC_FUNCTION_CATALOG.find((entry) => entry.name === input.edgeName) ?? null;
  if (catalogEntry !== null) {
    const category = catalogEntry.workCategoryGovernanceCategory;
    return Object.freeze({
      kind: "sdlc_work_category_governance_selection" as const,
      category,
      configRef: sdlcWorkCategoryGovernanceConfigRef(category),
      workerPath: sdlcWorkCategoryGovernanceWorkerPath(category),
      selectionSource: "graph_function_catalog" as const,
      edgeName: input.edgeName,
      targetAssetType: input.targetAssetType
    });
  }
  const reusableCategory =
    input.edgeName === FG_CONFORM_PROJECT_AUTHORITY
      ? "requirements_build"
      : input.edgeName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
        ? "coding_build"
        : null;
  if (reusableCategory === null) {
    throw new TypeError(
      `missing graph-function work-category governance for ${input.edgeName}`
    );
  }
  const category = reusableCategory;
  return Object.freeze({
    kind: "sdlc_work_category_governance_selection" as const,
    category,
    configRef: sdlcWorkCategoryGovernanceConfigRef(category),
    workerPath: sdlcWorkCategoryGovernanceWorkerPath(category),
    selectionSource: "graph_function_catalog" as const,
    edgeName: input.edgeName,
    targetAssetType: input.targetAssetType
  });
}
