// Source-blind packed proof for the T-268 tenant-conformance projection.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  prepareT223AbgCandidate
} from "../tools/t223_abg_candidate.mjs";

function extractJson(artifactPath, relativePath) {
  return JSON.parse(execFileSync(
    "tar",
    ["-xOf", artifactPath, `package/${relativePath}`],
    { encoding: "utf8" }
  ));
}

test("T-268 packed candidate carries one catalog-bound tenant manifest", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "abg-t268-pack-"));
  try {
    const candidate = await prepareT223AbgCandidate({ outputRoot });
    const packageManifest = extractJson(candidate.artifactPath, "package.json");
    const productManifest = extractJson(
      candidate.artifactPath,
      "product-toolchain-manifest.json"
    );
    const catalog = extractJson(
      candidate.artifactPath,
      "contracts/public-contract-catalog.json"
    );
    const tenantManifest = extractJson(
      candidate.artifactPath,
      "contracts/tenant-conformance-manifest.json"
    );

    assert.equal(productManifest.packageVersion, packageManifest.version);
    assert.equal(
      productManifest.productRelativeLocators.includes(
        "contracts/tenant-conformance-manifest.json"
      ),
      true
    );
    assert.deepEqual(tenantManifest.publicContractCatalog, {
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    });
    assert.equal(
      tenantManifest.publicContractClaims.every((claim) =>
        catalog.rows.some((row) =>
          row.contractId === claim.contractId &&
          row.version === claim.contractVersion &&
          row.digest === claim.contractDigest
        )
      ),
      true
    );
    assert.equal(
      tenantManifest.capabilityClaims.some((claim) =>
        claim.capabilityId === "abg.capability.fh.interact@5" ||
        claim.capabilityId === "abg.capability.graph-function.consensus@5"
      ),
      false
    );
    const packedBytes = await readFile(candidate.artifactPath);
    assert.equal(packedBytes.length > 0, true);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
