import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function pathIsAbsent(locator) {
  try {
    await access(locator);
    return false;
  } catch (error) {
    return error?.code === "ENOENT";
  }
}

test("W2-05 workspace creation reports exact partial-effect compensation evidence", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-physical-workspace-"));
  const targetRoot = join(scratch, "workspace");
  context.after(async () => {
    await chmod(targetRoot, 0o700).catch(() => undefined);
    await rm(scratch, { force: true, recursive: true });
  });
  const workspace = await import(
    `${pathToFileURL(join(root, "build/code/src/product/workspace_operations.js")).href}?physical=${Date.now()}`
  );
  const physical = await import(
    `${pathToFileURL(join(root, "build/code/src/product/physical_artifact_effect.js")).href}?physical=${Date.now()}`
  );
  const digests = await import(
    `${pathToFileURL(join(root, "build/code/src/shared/digests.js")).href}?physical=${Date.now()}`
  );

  const priorUmask = process.umask(0o777);
  let result;
  try {
    result = await workspace.createWorkspace({
      kind: "workspace_create_packet",
      schemaVersion: "5.0.0",
      memberKey: "clean",
      targetRoot,
      scaffoldPolicy: "none",
    });
  } finally {
    process.umask(priorUmask);
  }

  assert.equal(result.kind, "workspace_operation_refusal", JSON.stringify(result));
  assert.equal(result.code, "workspace_io_refusal");
  assert.ok(result.physicalEffect);
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(result.physicalEffect),
    true,
  );
  assert.equal(result.physicalEffect.owner, "workspace_create");
  assert.equal(result.physicalEffect.targetBefore.disposition, "absent");
  assert.notEqual(result.physicalEffect.targetAtFailure.disposition, "absent");
  assert.equal(result.physicalEffect.compensation.disposition, "residue_preserved");
  assert.notEqual(result.physicalEffect.targetAfter.disposition, "absent");
  assert.equal(await pathIsAbsent(targetRoot), false);

  const effect = result.physicalEffect;
  const reissue = (overrides = {}) => physical.physicalArtifactEffectEvidence(
    effect.owner,
    effect.targetRoot,
    overrides.stagingRoot ?? effect.stagingRoot,
    effect.targetBefore,
    overrides.targetAtFailure ?? effect.targetAtFailure,
    overrides.stagingAtFailure ?? effect.stagingAtFailure,
    overrides.compensation ?? effect.compensation,
    effect.targetAfter,
    overrides.stagingAfter ?? effect.stagingAfter,
  );
  const wrongTargetRoot = join(scratch, "wrong-target-observation");
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(reissue({
      targetAtFailure: {
        ...effect.targetAtFailure,
        rootLocator: wrongTargetRoot,
      },
    })),
    false,
    "a re-digested observation outside the selected target is refused",
  );
  const outsideStage = join(scratch, ".abiogenesis-workspace_create-stage-outside");
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(reissue({
      stagingRoot: outsideStage,
      stagingAtFailure: {
        ...effect.targetAtFailure,
        rootLocator: outsideStage,
      },
      stagingAfter: {
        ...effect.targetAfter,
        rootLocator: outsideStage,
      },
      compensation: {
        ...effect.compensation,
        attemptedLocators: [
          ...effect.compensation.attemptedLocators,
          outsideStage,
        ],
      },
    })),
    false,
    "a re-digested staging root outside its owner target is refused",
  );
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(reissue({
      compensation: {
        ...effect.compensation,
        attemptedLocators: [join(scratch, "unowned-residue")],
      },
    })),
    false,
    "a re-digested compensation outside its owner target is refused",
  );
  const malformedInventory = effect.targetAtFailure.inventory.map((entry, index) =>
    index === 0 ? { ...entry, byteLength: 1 } : entry
  );
  assert.equal(
    physical.validatePhysicalArtifactObservation({
      ...effect.targetAtFailure,
      inventory: malformedInventory,
      inventoryDigest: digests.sha256Canonical(malformedInventory),
    }),
    false,
    "a re-digested directory carrying file evidence is structurally refused",
  );
  assert.equal(Object.hasOwn(effect, "commitDisposition"), false);
  assert.equal(
    effect.compensation.attemptedLocators.includes(effect.targetRoot),
    false,
    "compensation never claims authority to delete the selected target root",
  );

  const missingAncestor = join(scratch, "missing-parent");
  const nestedTarget = join(missingAncestor, "workspace");
  const nested = await workspace.createWorkspace({
    kind: "workspace_create_packet",
    schemaVersion: "5.0.0",
    memberKey: "clean",
    targetRoot: nestedTarget,
    scaffoldPolicy: "none",
  });
  assert.equal(nested.kind, "workspace_operation_refusal", JSON.stringify(nested));
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(nested.physicalEffect),
    true,
  );
  assert.equal(nested.physicalEffect.targetBefore.disposition, "absent");
  assert.equal(nested.physicalEffect.targetAfter.disposition, "absent");
  assert.equal(await pathIsAbsent(missingAncestor), true);

  const importedRoot = join(scratch, "imported-workspace");
  await mkdir(importedRoot);
  const preservedPath = join(importedRoot, "existing-project.txt");
  await writeFile(preservedPath, "preserved-project-truth\n", "utf8");
  const importedUmask = process.umask(0o777);
  let imported;
  try {
    imported = await workspace.createWorkspace({
      kind: "workspace_create_packet",
      schemaVersion: "5.0.0",
      memberKey: "imported",
      targetRoot: importedRoot,
      importAuthority: {
        authorityRef: "workspace-import://abiogenesis/unit-a",
        authorityDigest: `sha256:${"1".repeat(64)}`,
      },
      preservationPolicy: "preserve_existing_project_truth",
    });
  } finally {
    process.umask(importedUmask);
  }
  assert.equal(imported.kind, "workspace_operation_refusal", JSON.stringify(imported));
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(imported.physicalEffect),
    true,
    JSON.stringify(imported.physicalEffect),
  );
  assert.equal(imported.physicalEffect.targetBefore.disposition, "observed");
  assert.equal(imported.physicalEffect.compensation.disposition, "residue_preserved");
  assert.notEqual(
    imported.physicalEffect.targetAfter.inventoryDigest,
    imported.physicalEffect.targetBefore.inventoryDigest,
    "guarded cleanup reports inaccessible staging residue without erasing it",
  );
  assert.equal(
    await readFile(preservedPath, "utf8"),
    "preserved-project-truth\n",
  );
  const foreignPath = join(importedRoot, "foreign-after-compensation.txt");
  await writeFile(foreignPath, "foreign\n", "utf8");
  const foreignAfter = await physical.observePhysicalArtifact(importedRoot);
  const foreignResidueEvidence = physical.physicalArtifactEffectEvidence(
    imported.physicalEffect.owner,
    imported.physicalEffect.targetRoot,
    imported.physicalEffect.stagingRoot,
    imported.physicalEffect.targetBefore,
    imported.physicalEffect.targetAtFailure,
    imported.physicalEffect.stagingAtFailure,
    imported.physicalEffect.compensation,
    foreignAfter,
    imported.physicalEffect.stagingAfter,
  );
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(foreignResidueEvidence),
    true,
  );
  assert.equal(
    foreignResidueEvidence.compensation.disposition,
    "residue_preserved",
    "a foreign final target change cannot be reported as cleared",
  );
  await rm(foreignPath);

  const orderedRoot = join(scratch, "ordered-observation");
  await mkdir(join(orderedRoot, "a"), { recursive: true });
  await writeFile(join(orderedRoot, "a", "x"), "nested\n", "utf8");
  await writeFile(join(orderedRoot, "a-"), "sibling\n", "utf8");
  await writeFile(join(orderedRoot, "literal\\name"), "backslash\n", "utf8");
  const orderedObservation = await physical.observePhysicalArtifact(orderedRoot);
  assert.deepEqual(
    orderedObservation.inventory.map((entry) => entry.relativeLocator),
    [".", "a", "a-", "a/x", "literal\\name"],
  );
  assert.equal(
    physical.validatePhysicalArtifactObservation(orderedObservation),
    true,
  );
  const missingAncestorInventory = orderedObservation.inventory.filter(
    (entry) => entry.relativeLocator !== "a",
  );
  assert.equal(
    physical.validatePhysicalArtifactObservation({
      ...orderedObservation,
      inventory: missingAncestorInventory,
      inventoryDigest: digests.sha256Canonical(missingAncestorInventory),
    }),
    false,
    "erased observations require every non-root entry's directory ancestors",
  );

  const unreadableRoot = join(scratch, "unreadable-import");
  await mkdir(unreadableRoot);
  const unreadablePath = join(unreadableRoot, "unreadable.txt");
  await writeFile(unreadablePath, "unreadable\n", "utf8");
  await chmod(unreadablePath, 0o000);
  const refusedObservation = await physical.observePhysicalArtifact(unreadableRoot);
  assert.equal(refusedObservation.disposition, "observation_refused");
  const unobservedImport = await workspace.createWorkspace({
    kind: "workspace_create_packet",
    schemaVersion: "5.0.0",
    memberKey: "imported",
    targetRoot: unreadableRoot,
    importAuthority: {
      authorityRef: "workspace-import://abiogenesis/unobserved",
      authorityDigest: `sha256:${"2".repeat(64)}`,
    },
    preservationPolicy: "preserve_existing_project_truth",
  });
  await chmod(unreadablePath, 0o600);
  assert.equal(unobservedImport.kind, "workspace_operation_refusal");
  assert.equal(unobservedImport.code, "workspace_io_refusal");
  assert.equal(unobservedImport.physicalEffect, null);
  assert.equal(await pathIsAbsent(join(unreadableRoot, ".abiogenesis")), true);

});

test("W2-05 compensation does not launder interleaved foreign residue into ownership", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-guarded-cleanup-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const physical = await import(
    `${pathToFileURL(join(root, "build/code/src/product/physical_artifact_effect.js")).href}?guarded=${Date.now()}`
  );
  const targetRoot = join(scratch, "workspace");
  await mkdir(targetRoot);
  const targetBefore = await physical.observePhysicalArtifact(targetRoot);
  const stagingRoot = await physical.createPhysicalArtifactStagingRoot(
    targetRoot,
    "workspace_create",
  );
  const ownedPath = join(stagingRoot, "owned-residue.txt");
  await writeFile(ownedPath, "owner-residue\n", "utf8");
  const foreignPath = join(stagingRoot, "foreign-interleaved.txt");
  await writeFile(foreignPath, "foreign-current-content\n", "utf8");
  const targetAtFailure = await physical.observePhysicalArtifact(targetRoot);
  const stagingAtFailure = await physical.observePhysicalArtifact(stagingRoot);
  const compensation = await physical.preserveOwnedPhysicalResidue({
    owner: "workspace_create",
    targetRoot,
    stagingRoot,
    targetBefore,
    targetAtFailure,
    stagingAtFailure,
    ownedLocators: [stagingRoot],
  });

  assert.equal(compensation.disposition, "residue_preserved");
  assert.deepEqual(compensation.attemptedLocators, [stagingRoot]);
  assert.match(compensation.refusal, /without pre-effect deletion authority/u);
  assert.equal(await readFile(ownedPath, "utf8"), "owner-residue\n");
  assert.equal(
    await readFile(foreignPath, "utf8"),
    "foreign-current-content\n",
    "a failure snapshot must not convert interleaved foreign bytes into owner bytes",
  );
});

test("W2-05 install stages npm residue and reports its exact compensation", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-physical-install-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const unpacked = join(scratch, "unpacked");
  await mkdir(unpacked);
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", unpacked]);
  const product = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?physical=${Date.now()}`
  );
  const physical = await import(
    `${pathToFileURL(join(root, "build/code/src/product/physical_artifact_effect.js")).href}?install=${Date.now()}`
  );
  const candidateManifest = JSON.parse(
    await readFile(join(unpacked, "package", "product-toolchain-manifest.json"), "utf8"),
  );
  const verified = await product.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedArtifactDigest: product.sha256Bytes(await readFile(artifactPath)),
    expectedProductContentDigest: candidateManifest.productContentDigest,
    expectedManifestDigest: product.sha256Canonical(candidateManifest),
    expectedProductId: candidateManifest.productId,
    expectedPackageName: candidateManifest.packageName,
    expectedPackageVersion: candidateManifest.packageVersion,
  });
  assert.equal(verified.kind, "verified_product_artifact", JSON.stringify(verified));
  const resolvedLock = product.constructResolvedProductLock([verified]);
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));

  const fakeBin = join(scratch, "fake-bin");
  await mkdir(fakeBin);
  const fakeNpm = join(fakeBin, "npm");
  await writeFile(
    fakeNpm,
    [
      "#!/bin/sh",
      "mkdir -p node_modules/partial",
      "printf 'partial-lock\\n' > package-lock.json",
      "printf 'partial-payload\\n' > node_modules/partial/residue.txt",
      "exit 29",
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(fakeNpm, 0o755);
  const targetRoot = join(scratch, "consumer");
  const priorPath = process.env.PATH;
  let result;
  try {
    process.env.PATH = `${fakeBin}:${priorPath ?? ""}`;
    result = await product.installProduct({
      artifactPath,
      targetRoot,
      verifiedArtifact: verified,
      resolvedLock,
    });
  } finally {
    if (priorPath === undefined) delete process.env.PATH;
    else process.env.PATH = priorPath;
  }

  assert.equal(result.kind, "product_install_refusal", JSON.stringify(result));
  assert.equal(result.code, "install_failed");
  assert.ok(result.physicalEffect);
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(result.physicalEffect),
    true,
  );
  assert.equal(result.physicalEffect.owner, "product_install");
  assert.equal(result.physicalEffect.targetBefore.disposition, "absent");
  assert.equal(result.physicalEffect.targetAtFailure.disposition, "observed");
  assert.equal(result.physicalEffect.stagingAtFailure.disposition, "observed");
  assert.deepEqual(
    result.physicalEffect.stagingAtFailure.inventory.map((entry) =>
      entry.relativeLocator
    ),
    [
      ".",
      "node_modules",
      "node_modules/partial",
      "node_modules/partial/residue.txt",
      "package-lock.json",
      "package.json",
    ],
  );
  assert.equal(result.physicalEffect.compensation.disposition, "residue_preserved");
  assert.equal(result.physicalEffect.targetAfter.disposition, "observed");
  assert.equal(result.physicalEffect.stagingAfter.disposition, "observed");
  assert.deepEqual(
    result.physicalEffect.stagingAfter,
    result.physicalEffect.stagingAtFailure,
    "failure residue is observed and preserved rather than recursively deleted",
  );
  assert.equal(await pathIsAbsent(targetRoot), false);
  const installEffect = result.physicalEffect;
  const mismatchedStageInventory = installEffect.stagingAtFailure.inventory
    .slice(0, -1);
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(
      physical.physicalArtifactEffectEvidence(
        installEffect.owner,
        installEffect.targetRoot,
        installEffect.stagingRoot,
        installEffect.targetBefore,
        installEffect.targetAtFailure,
        {
          ...installEffect.stagingAtFailure,
          inventory: mismatchedStageInventory,
          inventoryDigest: product.sha256Canonical(mismatchedStageInventory),
        },
        installEffect.compensation,
        installEffect.targetAfter,
        installEffect.stagingAfter,
      ),
    ),
    false,
    "staging evidence must equal the same subtree in the target observation",
  );
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(
      physical.physicalArtifactEffectEvidence(
        installEffect.owner,
        installEffect.targetRoot,
        installEffect.stagingRoot,
        installEffect.targetBefore,
        installEffect.targetBefore,
        installEffect.stagingAtFailure,
        installEffect.compensation,
        installEffect.targetAfter,
        installEffect.stagingAfter,
      ),
    ),
    false,
    "an exact absent target cannot contain an observed staging subtree",
  );
  assert.equal(
    physical.validatePhysicalArtifactEffectEvidence(
      physical.physicalArtifactEffectEvidence(
        installEffect.owner,
        installEffect.targetRoot,
        installEffect.stagingRoot,
        installEffect.targetBefore,
        installEffect.targetAtFailure,
        installEffect.stagingAtFailure,
        {
          ...installEffect.compensation,
          attemptedLocators: [
            ...installEffect.compensation.attemptedLocators,
            join(installEffect.targetRoot, "foreign-preexisting-child"),
          ],
        },
        installEffect.targetAfter,
        installEffect.stagingAfter,
      ),
    ),
    false,
    "compensation cannot claim a non-stage child absent from failure evidence",
  );
});
