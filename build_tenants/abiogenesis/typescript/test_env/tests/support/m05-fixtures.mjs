import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  constructFakeLaneQualificationRequest,
  constructMethodTraceQualificationRequest,
  constructQualificationDesignAssetRef,
  constructQualificationProofLaneRef,
  constructQualificationSourceAssetRef
} from "../../../build/semantic/code/src/qualification/m05/index.js";

const SUPPORT_DIR = path.dirname(fileURLToPath(import.meta.url));

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function locateRepoRoot() {
  let current = SUPPORT_DIR;
  while (current !== path.dirname(current)) {
    if (
      await pathExists(path.join(current, "specification")) &&
      await pathExists(path.join(current, "build_tenants"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error("unable to locate abiogenesis repo root from M05 support path");
}

async function readText(targetPath) {
  return readFile(targetPath, "utf8");
}

async function locateTicketPath(repoRoot, ticketStem) {
  const candidateRoots = [
    path.join(repoRoot, ".ai-workspace", "tickets", "active"),
    path.join(repoRoot, ".ai-workspace", "tickets", "completed"),
    path.join(repoRoot, ".ai-workspace", "tickets", "backlog")
  ];

  for (const root of candidateRoots) {
    const candidate = path.join(root, ticketStem);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  throw new Error(`unable to locate ticket ${ticketStem}`);
}

function validatesTags(text) {
  return text
    .split("\n")
    .filter((line) => line.startsWith("// Validates: "))
    .map((line) => line.replace("// Validates: ", "").trim());
}

function basename(relativePath) {
  return path.basename(relativePath);
}

export async function buildMethodTraceRequest() {
  const repoRoot = await locateRepoRoot();
  const tenantRoot = path.join(
    repoRoot,
    "build_tenants",
    "abiogenesis",
    "typescript"
  );
  const designReadmePath = path.join(tenantRoot, "design", "README.md");
  const surfaceMapPath = path.join(tenantRoot, "test_env", "test_surface_map.md");
  const derivationPath = path.join(
    tenantRoot,
    "design",
    "M05_QUALIFICATION_DERIVATION.md"
  );
  const ticketPath = await locateTicketPath(
    repoRoot,
    "T-021-realize-typescript-m05-qualification-foundation-under-module-derived-method-trace-and-fake-lane-law.md"
  );

  const [designReadme, surfaceMap, derivation, ticketText] = await Promise.all([
    readText(designReadmePath),
    readText(surfaceMapPath),
    readText(derivationPath),
    readText(ticketPath)
  ]);

  const designAssets = await Promise.all(
    [
      {
        path: path.join(tenantRoot, "design", "M05_QUALIFICATION_DERIVATION.md"),
        kind: "derivation"
      },
      {
        path: path.join(
          tenantRoot,
          "design",
          "M05_QUALIFICATION_FIRST_SLICE_IACS.md"
        ),
        kind: "iacs"
      },
      {
        path: path.join(
          tenantRoot,
          "design",
          "M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md"
        ),
        kind: "structural_carrier_diagram"
      },
      {
        path: surfaceMapPath,
        kind: "test_surface_map"
      }
    ].map(async (asset) =>
      constructQualificationDesignAssetRef({
        path: asset.path,
        kind: asset.kind,
        exists: await pathExists(asset.path),
        declared:
          designReadme.includes(basename(asset.path)) ||
          ticketText.includes(basename(asset.path))
      })
    )
  );

  const proofLanes = await Promise.all(
    [
      {
        path: path.join(
          tenantRoot,
          "test_env",
          "tests",
          "test_m05_method_trace_unit.test.mjs"
        ),
        kind: "unit"
      },
      {
        path: path.join(
          tenantRoot,
          "test_env",
          "tests",
          "test_m05_fake_lane_integration.test.mjs"
        ),
        kind: "integration"
      },
      {
        path: path.join(
          tenantRoot,
          "test_env",
          "tests",
          "t021-m05-qualification-negative.test.mjs"
        ),
        kind: "negative"
      }
    ].map(async (lane) => {
      const exists = await pathExists(lane.path);
      return constructQualificationProofLaneRef({
        path: lane.path,
        kind: lane.kind,
        exists,
        declared:
          ticketText.includes(basename(lane.path)) &&
          surfaceMap.includes(basename(lane.path)),
        validates: exists ? validatesTags(await readText(lane.path)) : []
      });
    })
  );

  const sourceAssets = await Promise.all(
    [
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "design",
          "GSDLC_LITE_QUALIFICATION_LADDER.md"
        ),
        kind: "python_design"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "design",
          "SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md"
        ),
        kind: "python_design"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "design",
          "SCENARIO_REQUIREMENTS_TO_UAT.md"
        ),
        kind: "python_design"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "design",
          "SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md"
        ),
        kind: "python_design"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "test_env",
          "test_surface_map.md"
        ),
        kind: "python_test_surface"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "test_env",
          "tests",
          "test_spec_method_trace.py"
        ),
        kind: "python_test"
      },
      {
        path: path.join(
          repoRoot,
          "build_tenants",
          "abiogenesis",
          "python",
          "test_env",
          "tests",
          "test_sandbox_usecases_fake.py"
        ),
        kind: "python_test"
      }
    ].map(async (asset) =>
      constructQualificationSourceAssetRef({
        path: asset.path,
        kind: asset.kind,
        exists: await pathExists(asset.path),
        declared:
          ticketText.includes(basename(asset.path)) &&
          derivation.includes(basename(asset.path))
      })
    )
  );

  return constructMethodTraceQualificationRequest({
    designAssets,
    proofLanes,
    sourceAssets
  });
}

export function buildFakeLaneQualificationRequest(input) {
  return constructFakeLaneQualificationRequest(input);
}
