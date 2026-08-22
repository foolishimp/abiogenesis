import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
} from "../../build/code/src/shared/public_function_family.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
} from "../../build/code/src/shared/public_function_projections.js";
import { projectPublicOutcome } from "../../build/code/src/public/indexed_outcome.js";
import {
  admitSuccessfulPackedVerificationEvidence,
  constructProductVerificationEvidence,
  sha256Bytes,
  sha256Canonical,
  verifyProduct,
} from "../../build/code/src/product/index.js";
import { productVerificationCoordinates } from
  "../../build/code/src/product/verify_product.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const key = {
  operationId: "abg.operation.product.verify",
  memberKey: "verify",
};

function reference(prefix, digest) {
  return `${prefix}://abiogenesis/${digest.slice("sha256:".length)}`;
}

function verifyInvocation(artifact, coordinates) {
  const definition = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
    (value) => value.definitionKey.operationId === key.operationId &&
      value.definitionKey.memberKey === key.memberKey,
  );
  const projection = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (value) => value.operationId === key.operationId,
  );
  const asset = PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (value) => value.operationId === key.operationId,
  );
  assert.ok(definition);
  assert.ok(projection);
  assert.ok(asset);
  const member = projection.definitions.find(
    (value) => value.definitionKey.operationId === key.operationId &&
      value.definitionKey.memberKey === key.memberKey,
  );
  assert.ok(member);

  const catalog = {
    catalogId: artifact.catalogId,
    catalogVersion: "5.0.0",
    catalogDigest: artifact.catalogDigest,
    productId: artifact.productId,
    productContentDigest: artifact.productContentDigest,
  };
  const contract = (slot, definitionRef) => ({
    contractCatalog: catalog,
    flatRow: {
      contractId: key.operationId,
      contractVersion: "5.0.0",
      contractDigest: asset.contentDigest,
    },
    nestedSelector: {
      selectorKind: "operation_definition_slot",
      definitionKey: key,
      slot,
      definitionRef,
    },
  });
  const request = {
    targetKind: "packed_artifact",
    artifact: { ref: artifact.artifactRef, digest: artifact.artifactDigest },
    productContent: {
      ref: `product-content://${artifact.productId}`,
      digest: artifact.productContentDigest,
    },
    descriptor: coordinates.descriptor,
    contributionManifest: {
      ref: artifact.contributionManifestRef,
      digest: artifact.contributionManifestDigest,
    },
    declaredDependencies: artifact.declaredDependencies,
    compatibilityInputs: artifact.compatibilityRefs.map((compatibilityRef) => ({
      compatibilityRef,
      subjectRef: `product-content://${artifact.productId}`,
    })),
  };
  const slots = {
    workspace_binding: null,
    product_set: null,
    dependency_lock: null,
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: {
      requiredCapabilityRefs: definition.capabilityRefs,
      grants: [{ ref: "grant://s2-test", digest: sha256Canonical({ grant: "s2" }) }],
    },
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
  };
  const invocationAuthority = {
    kind: "invocation_authority",
    definitionKey: key,
    slots,
  };
  invocationAuthority.authorityDigest = sha256Canonical(invocationAuthority);
  const requestDigest = sha256Canonical(request);
  const body = {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    invocationContract: {
      contractCatalog: catalog,
      flatRow: {
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: "5.0.0",
        contractDigest: PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
      },
      nestedSelector: {
        selectorKind: "schema_definition",
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      },
    },
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0",
    definitionDigest: definition.definitionDigest,
    definitionKey: key,
    contractCatalog: catalog,
    invocationAuthority,
    requestContract: contract("request", member.requestContract.definitionRef),
    requestRef: reference("request", requestDigest),
    requestDigest,
    request,
    expectedResultContract: contract("result", member.resultContract.definitionRef),
    expectedRefusalContract: contract("refusal", member.refusalContract.definitionRef),
    expectedNonTerminalContract: null,
    correlationRef: "correlation://s2/verification-evidence",
    eventTime: "2026-08-22T00:00:00.000Z",
    provenanceRefs: [],
  };
  const invocationDigest = sha256Canonical(body);
  return {
    ...body,
    invocationRef: reference("invocation", invocationDigest),
    invocationDigest,
  };
}

test("S2 Product verification evidence preserves one exact invocation-outcome-artifact bijection", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-s2-evidence-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", scratch],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packed] = JSON.parse(stdout);
  const artifactPath = join(scratch, packed.filename);
  const unpacked = join(scratch, "unpacked");
  await mkdir(unpacked);
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", unpacked]);
  const manifestBytes = await readFile(
    join(unpacked, "package", "product-toolchain-manifest.json"),
  );
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const artifact = await verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedArtifactDigest: await sha256Bytes(await readFile(artifactPath)),
    expectedProductContentDigest: manifest.productContentDigest,
    expectedManifestDigest: sha256Canonical(manifest),
    expectedProductId: manifest.productId,
    expectedPackageName: manifest.packageName,
    expectedPackageVersion: manifest.packageVersion,
  });
  assert.equal(artifact.kind, "verified_product_artifact", JSON.stringify(artifact));
  const coordinates = productVerificationCoordinates(artifact);
  const verification = {
    kind: "product_verification_success",
    schemaVersion: "5.0.0",
    disposition: "verified",
    verifiedArtifact: artifact,
    coordinates,
    pendingExternalSelectors: [],
    definitionContractCoordinates: artifact.definitionContractCoordinates,
  };
  const disposition = {
    kind: "product_verification_resource_disposition",
    schemaVersion: "5.0.0",
    targetKind: "packed_artifact",
    disposition: "read_only_unchanged",
    packedArtifact: { ref: artifact.artifactRef, digest: artifact.artifactDigest },
  };
  const invocation = verifyInvocation(artifact, coordinates);
  const ownerOutput = {
    outcomeKind: "result",
    value: {
      targetKind: "packed_artifact",
      disposition: "locally_verified",
      verifiedArtifact: coordinates.verifiedArtifact,
      localNativeEvidence: coordinates.localNativeEvidence,
      pendingExternalSelectors: verification.pendingExternalSelectors,
      definitionContractCoordinates: verification.definitionContractCoordinates,
      residuals: [],
      provenance: [coordinates.provenance],
    },
  };
  const outcome = projectPublicOutcome(invocation, ownerOutput);
  assert.equal(outcome.outcomeKind, "result", JSON.stringify(outcome));
  const evidence = constructProductVerificationEvidence(verification, disposition);
  const admitted = admitSuccessfulPackedVerificationEvidence(
    invocation,
    ownerOutput,
    outcome,
    evidence,
  );
  assert.notEqual(admitted, null);
  assert.deepEqual(admitted.reference, {
    invocation: { ref: invocation.invocationRef, digest: invocation.invocationDigest },
    outcome: { ref: outcome.outcomeRef, digest: outcome.outcomeDigest },
  });

  const cases = [
    ["crossed verify invocation", { invocation: { ...invocation, invocationRef: "invocation://s2/crossed" } }],
    ["crossed indexed outcome", { outcome: { ...outcome, outcomeRef: "public-outcome://s2/crossed" } }],
    ["full verified artifact mismatch", {
      evidence: {
        ...evidence,
        verification: { ...verification, verifiedArtifact: { ...artifact, productId: "product://s2/crossed" } },
      },
    }],
    ["packed/verified cross", {
      evidence: { ...evidence, targetKind: "installed_artifact" },
    }],
  ];
  for (const [label, mutation] of cases) {
    const candidate = {
      invocation,
      ownerOutput,
      outcome,
      evidence,
      ...mutation,
    };
    assert.equal(
      admitSuccessfulPackedVerificationEvidence(
        candidate.invocation,
        candidate.ownerOutput,
        candidate.outcome,
        candidate.evidence,
      ),
      null,
      label,
    );
  }
});
