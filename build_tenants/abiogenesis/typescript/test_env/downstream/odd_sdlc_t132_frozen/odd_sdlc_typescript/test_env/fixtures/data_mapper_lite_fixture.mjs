import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURE_DIR = dirname(fileURLToPath(import.meta.url));

export const DATA_MAPPER_LITE_FIXTURE_ROOT = resolve(
  FIXTURE_DIR,
  "data_mapper_lite_lifecycle"
);

export const DATA_MAPPER_LITE_CANONICAL_REQUIREMENTS_PATH = resolve(
  FIXTURE_DIR,
  "data_mapper_reference/data_mapper.template/specification/REQUIREMENTS.md"
);

export const DATA_MAPPER_LITE_SELECTED_REQUIREMENT_IDS = Object.freeze([
  "REQ-LDM-01",
  "REQ-LDM-02",
  "REQ-LDM-03"
]);

export const DATA_MAPPER_LITE_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  "build_tenants/TENANT_REGISTRY.md",
  "build_tenants/data_mapper_lite_javascript/spec/TECH_STACK.json",
  "build_tenants/data_mapper_lite_javascript/spec/TESTING_TECH_STACK.json",
  "specification/INTENT.md",
  "specification/GOALS.md",
  "specification/PRODUCT.md",
  "specification/REQUIREMENTS.md",
  "specification/requirements/00-imported-sources.md",
  "specification/requirements/01-data-mapper-lite.md"
]);

export function assertDataMapperLiteFixtureTraceability() {
  if (!existsSync(DATA_MAPPER_LITE_CANONICAL_REQUIREMENTS_PATH)) {
    throw new Error(
      `canonical data_mapper requirements missing: ${DATA_MAPPER_LITE_CANONICAL_REQUIREMENTS_PATH}`
    );
  }
  const canonical = readFileSync(DATA_MAPPER_LITE_CANONICAL_REQUIREMENTS_PATH, "utf8");
  const fixtureRequirements = readFileSync(
    resolve(DATA_MAPPER_LITE_FIXTURE_ROOT, "specification/REQUIREMENTS.md"),
    "utf8"
  );
  for (const requirementId of DATA_MAPPER_LITE_SELECTED_REQUIREMENT_IDS) {
    if (!canonical.includes(requirementId)) {
      throw new Error(`selected requirement ${requirementId} missing from canonical data_mapper requirements`);
    }
    if (!fixtureRequirements.includes(requirementId)) {
      throw new Error(`selected requirement ${requirementId} missing from data_mapper-lite fixture`);
    }
  }
}
