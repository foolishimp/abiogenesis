import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FIXTURE_DIR = dirname(fileURLToPath(import.meta.url));
export const INTERNAL_DATA_MAPPER_FIXTURE_ROOT = resolve(
  FIXTURE_DIR,
  "data_mapper_induction"
);

export const INTERNAL_DATA_MAPPER_SOURCE_FILES = Object.freeze([
  "README.md",
  ".ai-workspace/context/project_constraints.yml",
  "specification/INTENT.md",
  "specification/REQUIREMENTS.md",
  "specification/requirements/00-imported-sources.md",
  "specification/mapper_requirements.md",
  "specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md"
]);

export function assertInternalDataMapperFixture() {
  for (const relativePath of INTERNAL_DATA_MAPPER_SOURCE_FILES) {
    const absolutePath = path.join(INTERNAL_DATA_MAPPER_FIXTURE_ROOT, relativePath);
    if (!existsSync(absolutePath)) {
      throw new Error(`internal data_mapper induction fixture missing ${relativePath}`);
    }
  }
}

export function copyInternalDataMapperFixture(targetRoot) {
  assertInternalDataMapperFixture();
  mkdirSync(targetRoot, { recursive: true });
  cpSync(INTERNAL_DATA_MAPPER_FIXTURE_ROOT, targetRoot, { recursive: true });
  return targetRoot;
}

export function internalDataMapperSourceSnapshot(relativePath) {
  const absolutePath = path.join(INTERNAL_DATA_MAPPER_FIXTURE_ROOT, relativePath);
  return {
    uri: pathToFileURL(absolutePath).href,
    relativePath,
    content: readFileSync(absolutePath, "utf8")
  };
}
