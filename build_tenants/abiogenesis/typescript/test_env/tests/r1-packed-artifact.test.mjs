import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "../support/candidate-basis.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R1 verifies exact packed bytes without a source import", async (context) => {
  const artifacts = join(root, "artifacts");
  await rm(artifacts, { force: true, recursive: true });
  await mkdir(artifacts, { recursive: true });

  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  assert.equal(typeof packResult.filename, "string");

  const artifactPath = join(artifacts, packResult.filename);
  const extractRoot = await mkdtemp(join(tmpdir(), "abi5-r1-"));
  context.after(async () => rm(extractRoot, { force: true, recursive: true }));
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", extractRoot]);

  const productRoot = join(extractRoot, "package");
  const packageJson = JSON.parse(await readFile(join(productRoot, "package.json"), "utf8"));
  const candidateBasis = await readCandidateBasis(root);
  const productModulePath = join(productRoot, "build/code/src/product/index.js");
  const product = await import(`${pathToFileURL(productModulePath).href}?artifact=${Date.now()}`);
  const gtl = await import(
    `${pathToFileURL(join(productRoot, "build/code/src/gtl/index.js")).href}?artifact=${Date.now()}`,
  );
  const rootBindingAssetPath = join(productRoot, product.ABI5_ROOT_BINDING_ASSET_PATH);
  const rootBindingAssetBytes = await readFile(rootBindingAssetPath, "utf8");
  assert.equal(rootBindingAssetBytes, product.abi5RootBindingAssetBytes);

  const request = {
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  };
  const requestForArtifact = async (candidateArtifactPath) => ({
    ...request,
    artifactPath: candidateArtifactPath,
    artifactRef: basename(candidateArtifactPath),
    expectedArtifactDigest: await product.sha256File(candidateArtifactPath),
  });
  const verified = await product.verifyProduct(request);
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  assert.equal(verified.kind, "verified_product_artifact");
  assert.equal(verified.checkedPayloadFiles > 0, true);

  await rm(rootBindingAssetPath);
  const missingAssetArtifactPath = join(
    artifacts,
    "missing-root-binding-abiogenesis-typescript-tenant.tgz",
  );
  await execFileAsync("tar", ["-czf", missingAssetArtifactPath, "-C", extractRoot, "package"]);
  const missingAssetRefusal = await product.verifyProduct(
    await requestForArtifact(missingAssetArtifactPath),
  );
  assert.equal(missingAssetRefusal.disposition, "refused");
  assert.notEqual(missingAssetRefusal.code, "artifact_digest_mismatch");

  await writeFile(rootBindingAssetPath, rootBindingAssetBytes, "utf8");
  await writeFile(rootBindingAssetPath, `${rootBindingAssetBytes} `, "utf8");
  const alteredAssetArtifactPath = join(
    artifacts,
    "altered-root-binding-abiogenesis-typescript-tenant.tgz",
  );
  await execFileAsync("tar", ["-czf", alteredAssetArtifactPath, "-C", extractRoot, "package"]);
  const alteredAssetRefusal = await product.verifyProduct(
    await requestForArtifact(alteredAssetArtifactPath),
  );
  assert.equal(alteredAssetRefusal.disposition, "refused");
  assert.notEqual(alteredAssetRefusal.code, "artifact_digest_mismatch");
  await writeFile(rootBindingAssetPath, rootBindingAssetBytes, "utf8");

  const publication = gtl.constructHelloWorldModulePublication({
    productId: verified.productId,
    artifactDigest: verified.artifactDigest,
    productContentDigest: verified.productContentDigest,
    productManifestDigest: verified.manifestDigest,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const rootProgram = publication.programs.find(
    ({ programRef }) => programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  const rootGraphFunction = publication.graphFunctions.find(
    ({ name }) => name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.ok(rootProgram);
  assert.ok(rootGraphFunction);
  const rootPublicationBinding = verified.contributionManifest.publicationBindings.find(
    ({ moduleRef }) => moduleRef === gtl.HELLO_WORLD_IDS.moduleRef,
  );
  assert.ok(rootPublicationBinding);
  const rootReceipt = product.resolveAbi5RootBinding(
    product.ABI5_ROOT_BINDING,
    rootPublicationBinding,
    publication,
  );
  assert.equal(rootReceipt.kind, "abi5_root_binding_receipt", JSON.stringify(rootReceipt));
  assert.equal(Object.isFrozen(rootReceipt), true);
  assert.deepEqual(rootReceipt.rootBinding, product.ABI5_ROOT_BINDING);
  assert.deepEqual(rootReceipt.publicationBinding, rootPublicationBinding);
  assert.deepEqual(rootReceipt.program, {
    programRef: gtl.HELLO_WORLD_IDS.programRef,
    programDigest: product.sha256Canonical(rootProgram),
    startRef: gtl.HELLO_WORLD_IDS.startRef,
  });
  assert.deepEqual(rootReceipt.graphFunction, {
    graphFunctionRef: gtl.HELLO_WORLD_IDS.graphFunctionRef,
    graphFunctionDigest: product.sha256Canonical(rootGraphFunction),
  });
  assert.deepEqual(rootReceipt.inputContract.contractRef, gtl.HELLO_WORLD_IDS.inputContractRef);
  assert.deepEqual(rootReceipt.outputContract.contractRef, gtl.HELLO_WORLD_IDS.outputContractRef);
  assert.deepEqual(rootReceipt.closureContract.closureContractRef, gtl.HELLO_WORLD_IDS.closureContractRef);
  assert.match(rootReceipt.programValidation.evidenceRef, /^evidence:\/\/abiogenesis\/conformance\/[0-9a-f]{64}$/u);
  assert.match(rootReceipt.programValidation.evidenceDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(rootReceipt.programValidation.validationRef, /^program-validation:\/\/abiogenesis\/[0-9a-f]{64}$/u);
  assert.match(rootReceipt.programValidation.validationDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(product.verifyAbi5RootBindingReceipt(
    rootReceipt,
    product.ABI5_ROOT_BINDING,
    rootPublicationBinding,
    publication,
  ), true);
  const retainedReceiptDigest = rootReceipt.receiptDigest;
  assert.throws(() => {
    rootReceipt.receiptDigest = "sha256:0000000000000000000000000000000000000000000000000000000000000000";
  }, TypeError);
  assert.equal(rootReceipt.receiptDigest, retainedReceiptDigest);
  const forgedReceiptBody = {
    ...rootReceipt,
    program: {
      ...rootReceipt.program,
      programDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    },
  };
  delete forgedReceiptBody.receiptRef;
  delete forgedReceiptBody.receiptDigest;
  const forgedReceiptDigest = product.sha256Canonical(forgedReceiptBody);
  const selfConsistentForgedReceipt = {
    ...forgedReceiptBody,
    receiptRef:
      `root-binding-receipt://abiogenesis/${forgedReceiptDigest.slice("sha256:".length)}`,
    receiptDigest: forgedReceiptDigest,
  };
  assert.equal(
    product.sha256Canonical(forgedReceiptBody),
    selfConsistentForgedReceipt.receiptDigest,
  );
  assert.equal(product.verifyAbi5RootBindingReceipt(
    selfConsistentForgedReceipt,
    product.ABI5_ROOT_BINDING,
    rootPublicationBinding,
    publication,
  ), false);

  const wrongBinding = product.resolveAbi5RootBinding(
    product.ABI5_ROOT_BINDING,
    {
      ...rootPublicationBinding,
      publicationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    },
    publication,
  );
  assert.equal(wrongBinding.kind, "abi5_root_binding_refusal");
  assert.equal(wrongBinding.code, "publication_mismatch");
  const presenceOnly = product.resolveAbi5RootBinding(
    { kind: product.ABI5_ROOT_BINDING.kind, bindingId: product.ABI5_ROOT_BINDING.bindingId },
    rootPublicationBinding,
    publication,
  );
  assert.equal(presenceOnly.kind, "abi5_root_binding_refusal");
  assert.equal(presenceOnly.code, "invalid_carrier");

  const extraGraphFunction = publication.graphFunctions.find(
    ({ name, declarations }) =>
      name !== gtl.HELLO_WORLD_IDS.graphFunctionRef &&
      declarations["abg.compute_regime"] === "F_D",
  );
  assert.ok(extraGraphFunction);
  const expandedPublication = structuredClone(publication);
  const expandedProgram = expandedPublication.programs.find(
    ({ programRef }) => programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.ok(expandedProgram);
  expandedProgram.callableMembership.push(extraGraphFunction.name);
  const extraLeaf = product.resolveAbi5RootBinding(
    product.ABI5_ROOT_BINDING,
    {
      moduleRef: expandedPublication.moduleRef,
      publicationDigest: product.modulePublicationSemanticDigest(expandedPublication),
    },
    expandedPublication,
  );
  assert.equal(extraLeaf.kind, "abi5_root_binding_refusal");
  assert.equal(extraLeaf.code, "selection_mismatch");

  const nonFdPublication = structuredClone(publication);
  const nonFdGraphFunction = nonFdPublication.graphFunctions.find(
    ({ name }) => name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.ok(nonFdGraphFunction);
  const nonFdProgram = nonFdPublication.programs.find(
    ({ programRef }) => programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.ok(nonFdProgram);
  nonFdGraphFunction.declarations["abg.compute_regime"] = "F_P";
  nonFdGraphFunction.template.nodes[0].term.fibre = "F_P";
  nonFdProgram.policies["abg.compute_regime"] = "F_P";
  const nonFd = product.resolveAbi5RootBinding(
    product.ABI5_ROOT_BINDING,
    {
      moduleRef: nonFdPublication.moduleRef,
      publicationDigest: product.modulePublicationSemanticDigest(nonFdPublication),
    },
    nonFdPublication,
  );
  assert.equal(nonFd.kind, "abi5_root_binding_refusal");
  assert.equal(nonFd.code, "selection_mismatch");

  const manifestPath = join(productRoot, "product-toolchain-manifest.json");
  await writeFile(rootBindingAssetPath, `${rootBindingAssetBytes} `, "utf8");
  const forgedManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const forgedInventory = [];
  for (const path of [...forgedManifest.productRelativeLocators].sort()) {
    forgedInventory.push({
      path,
      sha256: product.sha256Bytes(await readFile(join(productRoot, path))),
    });
  }
  forgedManifest.productContentDigest = product.payloadInventoryDigest(forgedInventory);
  await writeFile(manifestPath, `${product.canonicalJson(forgedManifest)}\n`, "utf8");
  const selfConsistentArtifactPath = join(
    artifacts,
    "self-consistent-substitution-abiogenesis-typescript-tenant.tgz",
  );
  await execFileAsync("tar", ["-czf", selfConsistentArtifactPath, "-C", extractRoot, "package"]);
  const selfConsistentRefusal = await product.verifyProduct(
    await requestForArtifact(selfConsistentArtifactPath),
  );
  assert.equal(selfConsistentRefusal.disposition, "refused");
  assert.notEqual(selfConsistentRefusal.code, "artifact_digest_mismatch");

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r1.json"),
    `${JSON.stringify(
      {
        kind: "abi5_root_obligation_evidence",
        schemaVersion: "5.0.0",
        bindingId: "ABI5-ROOT-001",
        obligation: "R1_exact_artifacts_verified",
        result: "satisfied",
        sourceImportUsed: false,
        package: {
          name: packageJson.name,
          version: packageJson.version,
          npmIntegrity: packResult.integrity,
          npmShasum: packResult.shasum,
        },
        verified,
        mutation: {
          changedPath: product.ABI5_ROOT_BINDING_ASSET_PATH,
          missingAssetRefusal: missingAssetRefusal.code,
          alteredAssetRefusal: alteredAssetRefusal.code,
          selfManifestRecomputed: true,
          expectedRefusal: "non_artifact_digest_refusal",
          observedRefusal: selfConsistentRefusal.code,
        },
        rootBinding: rootReceipt,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
