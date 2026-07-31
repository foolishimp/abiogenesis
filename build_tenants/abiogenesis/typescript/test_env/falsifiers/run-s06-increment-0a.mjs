#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
import {
  canonicalJson,
  EXPECTED_RELATION_IDS,
  normalizeRelation,
  sha256,
} from "./evidence.mjs";
import { runAuthorityLanes } from "./authority-lanes.mjs";
import { runContractLanes } from "./contract-lanes.mjs";
import { runRuntimeLanes } from "./runtime-lanes.mjs";

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "../..");
const repoRoot = resolve(packageRoot, "../../..");
const evidencePath = join(
  packageRoot,
  "test_env/evidence/abi5-s06-increment-0a-falsifier-baseline.json",
);
const development = process.argv.slice(2).join("\0") === "--development";

if (!development && process.argv.length !== 2) {
  throw new TypeError(
    "the frozen characterization command accepts no arguments",
  );
}
if (development && process.argv.length !== 3) {
  throw new TypeError("development mode accepts only --development");
}

async function git(...args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repoRoot,
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout.trim();
}

async function requireCleanTrackedTree(stage) {
  const status = await git("status", "--porcelain", "--untracked-files=no");
  assert.equal(status, "", `${stage}: tracked tree must be clean`);
}

async function gitObject(path) {
  return git("rev-parse", `HEAD:${path}`);
}

async function main() {
  if (!development) await rm(evidencePath, { force: true });
  if (!development) await requireCleanTrackedTree("before build");

  await execFileAsync("npm", ["run", "build"], {
    cwd: packageRoot,
    maxBuffer: 40 * 1024 * 1024,
  });
  if (!development) await requireCleanTrackedTree("after build");

  const head = await git("rev-parse", "HEAD");
  const tree = await git("rev-parse", "HEAD^{tree}");
  const productObjects = {
    codeTree: await gitObject(
      "build_tenants/abiogenesis/typescript/code",
    ),
    contractsTree: await gitObject(
      "build_tenants/abiogenesis/typescript/contracts",
    ),
    packageJsonBlob: await gitObject(
      "build_tenants/abiogenesis/typescript/package.json",
    ),
    generatedProductManifestSha256: sha256(
      await readFile(join(packageRoot, "product-toolchain-manifest.json"), "utf8"),
    ),
  };

  const cleanups = [];
  const context = {
    after(cleanup) {
      cleanups.push(cleanup);
    },
  };
  let records;
  try {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    records = [
      ...(await runAuthorityLanes({ harness, packageRoot })),
      ...(await runRuntimeLanes({ harness, packageRoot })),
      ...(await runContractLanes({ harness, packageRoot })),
    ].map(normalizeRelation);
  } finally {
    for (const cleanup of cleanups.reverse()) await cleanup();
  }

  records.sort((left, right) =>
    left.relationId < right.relationId
      ? -1
      : left.relationId > right.relationId
      ? 1
      : 0,
  );
  assert.deepEqual(
    records.map((record) => record.relationId),
    [...EXPECTED_RELATION_IDS].sort(),
    "the characterization must cover the exact frozen relation set",
  );
  const preserved = records.filter(
    (record) => record.disposition !== "confirmed_red",
  );
  assert.deepEqual(
    preserved.map((record) => record.relationId),
    ["AX-F05", "AX-F07", "AX-F10", "AX-F14"],
    "Increment 1 repairs only the three authorized relations and preserves AX-F07",
  );

  const evidence = {
    kind: "abi5_s06_increment_0a_falsifier_baseline",
    schemaVersion: "5.0.0",
    acceptedGate1: {
      commit: "3f80ba2393a9dbe31e8379a3dbbde00a961b8e23",
      tree: "04906b1c29c5d66163c62d1fffcb8bc069096244",
      censusBlob: "efe88cac85bd3bb071d4b5dd451dfadaec893c4f",
    },
    harness: {
      head,
      tree,
      command: "node test_env/falsifiers/run-s06-increment-0a.mjs",
      productObjects,
    },
    relations: records,
    aggregate: {
      exactRelationIds: records.map((record) => record.relationId),
      confirmedRedCount: records.filter(
        (record) => record.disposition === "confirmed_red",
      ).length,
      preservedGreenCount: preserved.length,
      fixtureFailureCount: 0,
      relationDigest: sha256(
        records.map((record) => ({
          relationId: record.relationId,
          relationDigest: record.relationDigest,
        })),
      ),
    },
  };

  if (development) {
    process.stdout.write(
      `${JSON.stringify({
        mode: "development",
        aggregate: evidence.aggregate,
      }, null, 2)}\n`,
    );
    return;
  }

  await requireCleanTrackedTree("before evidence promotion");
  await mkdir(dirname(evidencePath), { recursive: true });
  const bytes = `${canonicalJson(evidence)}\n`;
  await writeFile(evidencePath, bytes, "utf8");
  process.stdout.write(
    `${JSON.stringify({
      evidencePath: "test_env/evidence/abi5-s06-increment-0a-falsifier-baseline.json",
      evidenceSha256: sha256(bytes),
      aggregate: evidence.aggregate,
    }, null, 2)}\n`,
  );
}

main().catch(async (error) => {
  await rm(evidencePath, { force: true });
  process.stderr.write(`${error?.stack ?? String(error)}\n`);
  process.exitCode = 1;
});
