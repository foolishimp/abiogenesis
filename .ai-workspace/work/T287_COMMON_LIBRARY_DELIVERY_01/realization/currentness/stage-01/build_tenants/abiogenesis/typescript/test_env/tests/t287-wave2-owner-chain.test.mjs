import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  jsonRoundTrip,
  runWave2OwnerCandidateChain,
} from "../support/t287-wave2-owner-chain-worker.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("W2-C1 composes owner-produced workspace, verification, lock, and install candidate carriers", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "abi5-wave2-c1-"));
  try {
    const chain = await runWave2OwnerCandidateChain({ root, temporaryRoot });
    const { product, packetReceipts, ownerResults } = chain;

    assert.equal(ownerResults.created.kind, "workspace_create_result");
    assert.equal(ownerResults.created.disposition, "created");
    assert.equal(ownerResults.created.manifest.authorityMode, "clean");
    assert.equal(ownerResults.created.manifest.scaffoldPolicy, "none");
    assert.equal(
      ownerResults.created.manifest.scaffoldState,
      "no_project_authority",
    );
    assert.equal(
      ownerResults.created.manifestPath.endsWith(
        "/.abiogenesis/workspace-manifest.json",
      ),
      true,
    );
    assert.deepEqual(
      await readdir(
        join(ownerResults.created.manifest.canonicalRoot, ".abiogenesis"),
      ),
      ["workspace-manifest.json"],
    );
    assert.deepEqual(ownerResults.created.provenance, [{
      provenanceRef: ownerResults.created.creationManifestRef,
      provenanceDigest: ownerResults.created.creationManifestDigest,
    }]);
    assert.equal(ownerResults.opened.kind, "workspace_open_projection");
    assert.equal(ownerResults.opened.disposition, "unbound");
    assert.equal(ownerResults.opened.bindingRef, null);
    assert.equal(ownerResults.opened.configurationRef, null);
    assert.deepEqual(ownerResults.opened.residuals, [{
      code: "binding_absent",
      message: "workspace has no selected Product binding",
    }]);
    assert.equal(
      ownerResults.opened.workspaceAuthorityRef,
      ownerResults.created.workspaceAuthorityRef,
    );
    assert.equal(
      ownerResults.opened.workspaceAuthorityDigest,
      ownerResults.created.workspaceAuthorityDigest,
    );
    assert.deepEqual(
      ownerResults.opened.manifest,
      ownerResults.created.manifest,
    );
    assert.equal(
      ownerResults.manifestBytesAfterOpen,
      ownerResults.manifestBytesBeforeOpen,
    );
    assert.equal(
      ownerResults.verificationSuccess.kind,
      "product_verification_success",
    );
    assert.equal(ownerResults.verificationSuccess.disposition, "verified");
    assert.deepEqual(
      ownerResults.verificationSuccess.verifiedArtifact,
      ownerResults.verified,
    );
    assert.equal(ownerResults.verified.kind, "verified_product_artifact");
    assert.equal(ownerResults.resolved.kind, "resolved_product_lock");
    assert.equal(ownerResults.installCandidate.kind, "product_install_candidate");
    assert.equal(ownerResults.installCandidate.disposition, "materialized");

    assert.equal(
      ownerResults.installCandidate.productId,
      ownerResults.verified.productId,
    );
    assert.equal(
      ownerResults.installCandidate.resolvedLockId,
      ownerResults.resolved.lockId,
    );
    assert.equal(
      ownerResults.installCandidate.resolvedLockDigest,
      ownerResults.resolved.lockDigest,
    );

    for (const packet of Object.values(packetReceipts)) {
      assert.deepEqual(jsonRoundTrip(packet), packet);
      assert.equal(typeof packet.memberKey, "string");
    }

    assert.strictEqual(
      product.WORKSPACE_OPERATION_CONTRACTS.create.clean,
      product.WorkspaceOperationPort.create,
    );
    assert.strictEqual(
      product.PRODUCT_VERIFICATION_CONTRACTS.verify,
      product.ProductVerificationPort.verify,
    );
    assert.strictEqual(
      product.PRODUCT_ENVIRONMENT_CONTRACTS.resolve,
      product.ProductEnvironmentPort.resolve,
    );
    assert.strictEqual(
      product.PRODUCT_INSTALL_CONTRACTS.install,
      product.ProductInstallPort.install,
    );
    assert.equal(typeof product.CatalogOperationPort.admit, "function");
    assert.equal(typeof product.CatalogOperationPort.constructView, "function");
    assert.equal(typeof product.CatalogOperationPort.apply, "function");
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});

test("W2-C1 authors no legacy definition coordinate or Public bridge", async () => {
  const authored = [
    "workspace_operations.ts",
    "verification_operation.ts",
    "environment_operations.ts",
    "install_operation.ts",
    "catalog_operations.ts",
  ];
  for (const file of authored) {
    const source = await readFile(join(root, "code/src/product", file), "utf8");
    assert.equal(source.includes("definitionKey"), false, file);
    assert.equal(source.includes("../public/"), false, file);
    assert.equal(source.includes("RootPublicInvocation"), false, file);
    assert.equal(source.includes("ROOT_PUBLIC_OPERATION_DEFINITIONS"), false, file);
    assert.equal(source.includes("legacyRequest"), false, file);
  }
});
