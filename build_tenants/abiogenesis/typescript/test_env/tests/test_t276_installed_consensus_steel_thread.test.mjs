// Validates: T-276 early source-blind installed Consensus delivery governor.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const TENANT_ROOT = path.resolve(import.meta.dirname, "../..");
const DRIVER_SOURCE = path.join(
  TENANT_ROOT,
  "test_env",
  "tools",
  "t276_installed_consensus_driver.mjs"
);
const ORACLE_SOURCE = path.join(
  TENANT_ROOT,
  "test_env",
  "fixtures",
  "t276_installed_consensus",
  "target-operation-family.json"
);
const ORACLE_DIGEST =
  "sha256:2ec08e37bf29940de3386890396e5198b52a395301b1d31c667eda5502af0fb5";
const REQUIREMENT_SOURCE = path.resolve(
  TENANT_ROOT,
  "../../../specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
);
const REQUIREMENT_SOURCE_DIGEST =
  "sha256:eed6bfd474d8e572a82d25a7e227f5e1e447f0f78f75933a32fdaf3ed7c43764";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalizeIJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeIJson).join(",")}]`;
  }
  return `{${Object.keys(value).sort(compareText).map(
    (key) => `${JSON.stringify(key)}:${canonicalizeIJson(value[key])}`
  ).join(",")}}`;
}

function digestCanonicalIJson(value) {
  return sha256(Buffer.from(canonicalizeIJson(value), "utf8"));
}

function run(command, args, options) {
  const outcome = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    outcome.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${outcome.stdout}\nstderr:\n${outcome.stderr}`
  );
  assert.equal(outcome.stderr, "", `${command} wrote stderr`);
  return outcome.stdout;
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function packCandidate(outputRoot) {
  await mkdir(outputRoot, { recursive: true });
  const report = JSON.parse(run(
    "npm",
    [
      "pack",
      ".",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      outputRoot
    ],
    { cwd: TENANT_ROOT }
  ));
  const filename = report[0]?.filename;
  if (typeof filename !== "string" || filename.length === 0) {
    throw new TypeError("npm pack did not report one candidate artifact");
  }
  const artifactPath = path.join(outputRoot, filename);
  return Object.freeze({
    artifactPath,
    expectedArtifactDigest: sha256(await readFile(artifactPath))
  });
}

async function writeInstalledPublication(
  packageRoot,
  originalCatalog,
  originalManifest,
  operationRows
) {
  const catalogBasis = {
    ...originalCatalog,
    rows: [
      ...originalCatalog.rows.filter((row) => row.contractKind !== "operation"),
      ...operationRows
    ]
  };
  delete catalogBasis.catalogDigest;
  const catalog = {
    ...catalogBasis,
    catalogDigest: digestCanonicalIJson(catalogBasis)
  };
  await writeFile(
    path.join(packageRoot, "contracts", "public-contract-catalog.json"),
    canonicalizeIJson(catalog),
    "utf8"
  );
  await writeFile(
    path.join(packageRoot, "product-toolchain-manifest.json"),
    canonicalizeIJson({
      ...originalManifest,
      publicContractCatalog: catalog,
      publicContractCatalogDigest: catalog.catalogDigest
    }),
    "utf8"
  );
}

test("T-276 packed temporary-workspace thread stops at the typed first missing 5.0 operation before invocation", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t276-consensus-thread-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const candidate = await packCandidate(path.join(root, "candidate"));
  const oracleBytes = await readFile(ORACLE_SOURCE);
  const oracle = JSON.parse(oracleBytes);
  const requirementBytes = await readFile(REQUIREMENT_SOURCE);
  const requirementSource = requirementBytes.toString("utf8");
  const requirementSection = requirementSource.match(
    /\*\*REQ-P-PUBLIC-CONTRACTS-008\*\*[\s\S]+?This is a hard break\./u
  )?.[0];
  assert.equal(sha256(oracleBytes), ORACLE_DIGEST);
  assert.equal(sha256(requirementBytes), REQUIREMENT_SOURCE_DIGEST);
  assert.equal(
    oracle.basis.targetRequirementSourceDigest,
    REQUIREMENT_SOURCE_DIGEST
  );
  assert.deepEqual(
    [...requirementSection.matchAll(/`(abg\.operation\.[^`]+)`/gu)]
      .map((match) => match[1]),
    oracle.targetOperationIds
  );
  const consumerRoot = path.join(root, "consumer");
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: "t276-installed-consumer", private: true })}\n`,
    "utf8"
  );
  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      candidate.artifactPath
    ],
    { cwd: consumerRoot }
  );

  const packageRoot = path.join(
    consumerRoot,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant"
  );
  const packageEntry = await lstat(packageRoot);
  assert.equal(packageEntry.isDirectory(), true);
  assert.equal(packageEntry.isSymbolicLink(), false);
  assert.equal(
    (await realpath(packageRoot)).startsWith(`${await realpath(consumerRoot)}${path.sep}`),
    true
  );

  const driverSource = await readFile(DRIVER_SOURCE, "utf8");
  assert.doesNotMatch(
    driverSource,
    /@abiogenesis|code\/src|build\/semantic|\.\.\/\.\./u
  );
  const installedDriverPath = path.join(consumerRoot, "t276-driver.mjs");
  await copyFile(DRIVER_SOURCE, installedDriverPath);
  const installedOraclePath = path.join(
    consumerRoot,
    "target-operation-family.json"
  );
  await copyFile(ORACLE_SOURCE, installedOraclePath);
  const workspaceRoot = path.join(root, "temporary-workspace");
  const configPath = path.join(consumerRoot, "t276-config.json");
  const config = {
    artifactPath: candidate.artifactPath,
    cliPath: path.join(consumerRoot, "node_modules", ".bin", "abg.cli"),
    expectedArtifactDigest: candidate.expectedArtifactDigest,
    packageRoot,
    qualificationOraclePath: installedOraclePath,
    workspaceRoot
  };
  await writeFile(configPath, JSON.stringify(config), "utf8");

  const report = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      kind: report.kind,
      phase: report.phase,
      coordinate: report.coordinate,
      reason: report.reason,
      targetOperationInvocationCount: report.targetOperationInvocationCount,
      workspaceOperationInvoked: report.workspace.workspaceOperationInvoked
    },
    {
      kind: "frontier_gap",
      phase: "p2_packed_operation_family",
      coordinate: {
        kind: "operation_identity",
        operationId: "abg.operation.project.read"
      },
      reason: "operation_family_mismatch",
      targetOperationInvocationCount: 0,
      workspaceOperationInvoked: false
    }
  );
  assert.equal(report.candidate.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(report.candidate.artifactDigest, candidate.expectedArtifactDigest);
  const installedCatalog = JSON.parse(
    await readFile(
      path.join(packageRoot, "contracts", "public-contract-catalog.json"),
      "utf8"
    )
  );
  const installedOperationIds = installedCatalog.rows
    .filter((row) => row.contractKind === "operation")
    .map((row) => row.contractId);
  const installedIdentitySet = new Set(installedOperationIds);
  const targetIdentitySet = new Set(oracle.targetOperationIds);
  assert.deepEqual(report.familyDelta, {
    missingTargetOperationIds: oracle.targetOperationIds.filter(
      (operationId) => !installedIdentitySet.has(operationId)
    ),
    duplicateTargetOperationIds: [],
    incompleteTargetOperationIds: [],
    retiredOperationIds: installedOperationIds
      .filter((operationId) => !targetIdentitySet.has(operationId))
      .sort()
  });
  assert.equal(report.familyDelta.missingTargetOperationIds.length, 16);
  assert.equal(report.familyDelta.retiredOperationIds.length, 16);
  assert.equal(report.qualificationOracle.digest, ORACLE_DIGEST);
  assert.equal(report.workspace.application, "temporary");
  assert.equal(report.workspace.requestedRoot, workspaceRoot);
  assert.equal(await pathExists(workspaceRoot), false);

  const workspaceCreateRow = installedCatalog.rows.find(
    (row) => row.contractId === "abg.operation.workspace.create"
  );
  const workspaceCreateAssetPath = path.join(
    packageRoot,
    workspaceCreateRow.assetLocator.relativePath
  );
  const workspaceCreateAssetBytes = await readFile(workspaceCreateAssetPath);
  await writeFile(
    workspaceCreateAssetPath,
    Buffer.concat([workspaceCreateAssetBytes, Buffer.from("\n", "utf8")])
  );
  const mixedDeltaReport = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      coordinate: mixedDeltaReport.coordinate,
      missingTargetOperationIds:
        mixedDeltaReport.familyDelta.missingTargetOperationIds,
      incompleteTargetOperationIds:
        mixedDeltaReport.familyDelta.incompleteTargetOperationIds,
      targetOperationInvocationCount:
        mixedDeltaReport.targetOperationInvocationCount
    },
    {
      coordinate: {
        kind: "operation_identity",
        operationId: "abg.operation.project.read"
      },
      missingTargetOperationIds:
        report.familyDelta.missingTargetOperationIds,
      incompleteTargetOperationIds: [
        "abg.operation.workspace.create"
      ],
      targetOperationInvocationCount: 0
    }
  );
  await writeFile(workspaceCreateAssetPath, workspaceCreateAssetBytes);

  const installedManifest = JSON.parse(
    await readFile(
      path.join(packageRoot, "product-toolchain-manifest.json"),
      "utf8"
    )
  );
  const operationTemplate = installedCatalog.rows.find(
    (row) => row.contractKind === "operation"
  );
  const callerOraclePath = path.join(consumerRoot, "caller-operation-family.json");
  const callerOperationIds = Array.from(
    { length: 19 },
    (_, index) => `abg.operation.caller.${String(index)}`
  );
  const callerOracleBytes = Buffer.from(JSON.stringify({
    ...oracle,
    targetOperationIds: callerOperationIds
  }));
  await writeFile(callerOraclePath, callerOracleBytes);
  await writeInstalledPublication(
    packageRoot,
    installedCatalog,
    installedManifest,
    callerOperationIds.map((operationId) => ({
      ...operationTemplate,
      contractId: operationId,
      operationContract: {
        ...operationTemplate.operationContract,
        operationId
      }
    }))
  );
  const callerConfigPath = path.join(consumerRoot, "caller-oracle-config.json");
  await writeFile(
    callerConfigPath,
    JSON.stringify({
      ...config,
      expectedQualificationOracleDigest: sha256(callerOracleBytes),
      qualificationOraclePath: callerOraclePath
    }),
    "utf8"
  );
  const callerOracleReport = JSON.parse(
    run(
      process.execPath,
      [installedDriverPath, "--config", callerConfigPath],
      { cwd: consumerRoot }
    )
  );
  assert.deepEqual(
    {
      kind: callerOracleReport.kind,
      coordinate: callerOracleReport.coordinate,
      reason: callerOracleReport.reason,
      targetOperationInvocationCount:
        callerOracleReport.targetOperationInvocationCount
    },
    {
      kind: "frontier_gap",
      coordinate: {
        kind: "qualification_oracle",
        asset: "public_operation_family"
      },
      reason: "qualification_oracle_digest_mismatch",
      targetOperationInvocationCount: 0
    }
  );

  const zeroDigest = `sha256:${"0".repeat(64)}`;
  const fakeOperationRows = oracle.targetOperationIds.map(
    (operationId, index) => {
      const rootPath = `contracts/nonexistent/${String(index)}`;
      return {
        ...operationTemplate,
        contractId: operationId,
        digest: zeroDigest,
        assetLocator: {
          ...operationTemplate.assetLocator,
          digest: zeroDigest,
          relativePath: `${rootPath}/operation.json`
        },
        operationContract: {
          ...operationTemplate.operationContract,
          operationId,
          operationDigest: zeroDigest,
          invocationSchemaDigest: zeroDigest,
          invocationSchemaPath: `${rootPath}/invocation.schema.json`,
          requestSchemaDigest: zeroDigest,
          requestSchemaPath: `${rootPath}/request.schema.json`,
          resultSchemaDigest: zeroDigest,
          resultSchemaPath: `${rootPath}/result.schema.json`,
          refusalSchemaDigest: zeroDigest,
          refusalSchemaPath: `${rootPath}/refusal.schema.json`
        }
      };
    }
  );
  await writeInstalledPublication(
    packageRoot,
    installedCatalog,
    installedManifest,
    fakeOperationRows
  );
  const fakeAssetReport = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      kind: fakeAssetReport.kind,
      coordinate: fakeAssetReport.coordinate,
      reason: fakeAssetReport.reason,
      incompleteTargetOperationIds:
        fakeAssetReport.familyDelta.incompleteTargetOperationIds,
      targetOperationInvocationCount:
        fakeAssetReport.targetOperationInvocationCount
    },
    {
      kind: "frontier_gap",
      coordinate: {
        kind: "operation_contract",
        operationId: "abg.operation.workspace.create"
      },
      reason: "operation_family_mismatch",
      incompleteTargetOperationIds: oracle.targetOperationIds,
      targetOperationInvocationCount: 0
    }
  );
});
