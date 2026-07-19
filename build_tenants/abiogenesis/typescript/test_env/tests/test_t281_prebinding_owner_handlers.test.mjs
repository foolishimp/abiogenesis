import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { join } from "node:path";
import test from "node:test";

import {
  admitPrivatePublicOperationEvent
} from "../../build/semantic/code/src/abg/m03/runner/public_operation_admission.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  bindPrivateProductInstallHandler,
  bindPrivateProductResolveHandler,
  bindPrivateProductVerifyHandler
} from "../../build/semantic/code/src/app/m04/product_intake/prebinding_public_operation_handlers.js";
import {
  descriptorDigest
} from "../../build/semantic/code/src/app/m04/product_intake/resolve.js";
import {
  bindPrivateWorkspaceCreateHandler,
  bindPrivateWorkspaceOpenHandler
} from "../../build/semantic/code/src/app/m04/workspace/prebinding_public_operation_handlers.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  admitT281PrivateP1Packet
} from "./support/t281-private-ingress-fixture.mjs";

const D = `sha256:${"d".repeat(64)}`;

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function exactFamily() {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted", JSON.stringify(admitted));
  return admitted.family;
}

function artifactAdmission(packet, events) {
  return {
    admission: admitPrivatePublicOperationEvent({
      witness: packet.witness,
      priorEvents: [],
      eventSink(event) {
        events.push(event);
      }
    })
  };
}

function workspaceHarness(targetRoot) {
  const records = new Map();
  const writes = [];
  return {
    records,
    writes,
    context: {
      kind: "workspace_path",
      targetRoot,
      publicContractCatalog: {},
      effects: {
        async readBytes(absolutePath) {
          return records.get(absolutePath) ?? null;
        },
        async writeBytes(absolutePath, bytes) {
          writes.push(absolutePath);
          records.set(absolutePath, bytes);
        },
        async makeDirectory() {}
      }
    }
  };
}

function decodedManifest(harness) {
  const [manifestPath] = harness.writes;
  assert.notEqual(manifestPath, undefined);
  return JSON.parse(new TextDecoder().decode(harness.records.get(manifestPath)));
}

test("T-281 pre-binding workspace clean creates one artifact, emits Rule-B truth, and opens it", async () => {
  const family = await exactFamily();
  const targetRoot = "/tmp/abg-t281-prebinding-clean";
  const harness = workspaceHarness(targetRoot);
  const events = [];
  const definition = family["abg.operation.workspace.create"].clean;
  const request = {
    targetRoot,
    createPolicy: "clean",
    scaffoldPolicy: "no_scaffold"
  };
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request,
    actorRef: "actor://t281/workspace"
  });
  const created = await bindPrivateWorkspaceCreateHandler(
    family,
    "clean"
  ).execute({
    packet,
    context: harness.context,
    attribution: { actorRef: "actor://t281/workspace" },
    artifactBoundary: artifactAdmission(
      packet,
      events
    )
  });
  assert.equal(created.kind, "owner_handler_result", JSON.stringify(created));
  assert.equal(created.value.authorityMode, "clean_no_project_authority");
  assert.equal(harness.writes.length, 1);
  assert.deepEqual(events.map((event) => event.kind), [
    "public_operation_admitted",
    "public_operation_artifact_admitted"
  ]);
  assert.deepEqual(
    events[1].causationEventRefs,
    [events[0].eventId],
    "Rule-B truth must be caused by the exact public admission event"
  );

  const manifest = decodedManifest(harness);
  const openDefinition = family["abg.operation.workspace.open"].open;
  const openRequest = {
    targetRoot,
    expectedWorkspaceAuthorityRef: manifest.workspaceId,
    expectedWorkspaceAuthorityDigest: stableSha256Digest(manifest)
  };
  const opened = await bindPrivateWorkspaceOpenHandler(family).execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition: openDefinition,
      request: openRequest
    }),
    context: harness.context
  });
  assert.equal(opened.kind, "owner_handler_result", JSON.stringify(opened));
  assert.equal(opened.value.readiness, "unbound");
  assert.deepEqual(opened.emittedEvents, []);
});

test("T-281 imported workspace verifies its authority bytes and never rewrites project roots", async () => {
  const family = await exactFamily();
  const targetRoot = "/tmp/abg-t281-prebinding-imported";
  const harness = workspaceHarness(targetRoot);
  const authorityBytes = new TextEncoder().encode("admitted-project-authority");
  const request = {
    targetRoot,
    createPolicy: "imported",
    importAuthorityRef: "artifact://project/authority",
    importAuthorityDigest: sha256Bytes(authorityBytes),
    preservationPolicy: "preserve_project_owned_roots"
  };
  const events = [];
  const handler = bindPrivateWorkspaceCreateHandler(family, "imported");
  const definition = family["abg.operation.workspace.create"].imported;
  const refusedPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request,
    actorRef: "actor://t281/importer"
  });
  const refused = await handler.execute({
    packet: refusedPacket,
    context: harness.context,
    attribution: { actorRef: "actor://t281/importer" },
    artifactBoundary: artifactAdmission(
      refusedPacket,
      events
    ),
    importAuthorityBytes: new TextEncoder().encode("wrong-authority")
  });
  assert.equal(refused.kind, "owner_handler_refusal");
  assert.equal(refused.value.code, "import_authority_invalid");
  assert.equal(harness.writes.length, 0);
  assert.equal(events.length, 1, "refusal emits admission truth but no artifact truth");

  const acceptedEvents = [];
  const acceptedPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request,
    actorRef: "actor://t281/importer"
  });
  const accepted = await handler.execute({
    packet: acceptedPacket,
    context: harness.context,
    attribution: { actorRef: "actor://t281/importer" },
    artifactBoundary: artifactAdmission(
      acceptedPacket,
      acceptedEvents
    ),
    importAuthorityBytes: authorityBytes
  });
  assert.equal(accepted.kind, "owner_handler_result", JSON.stringify(accepted));
  assert.equal(accepted.value.preservationState.projectOwnedRoots, "preserved");
  assert.equal(harness.writes.length, 1);
  assert.match(harness.writes[0], /\.abiogenesis\/workspace-manifest\.json$/u);
  assert.equal(acceptedEvents.length, 2);
});

test("T-281 owner effects reject forged packets and cross-invocation receipts before writes", async () => {
  const family = await exactFamily();
  const definition = family["abg.operation.workspace.create"].clean;
  const actorRef = "actor://t281/request-seal";
  const firstRequest = {
    targetRoot: "/tmp/abg-t281-request-seal-a",
    createPolicy: "clean",
    scaffoldPolicy: "no_scaffold"
  };
  const secondRequest = {
    ...firstRequest,
    targetRoot: "/tmp/abg-t281-request-seal-b"
  };
  const firstPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request: firstRequest,
    actorRef
  });
  const secondPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request: secondRequest,
    actorRef
  });
  const events = [];
  const firstBoundary = artifactAdmission(firstPacket, events);
  const harness = workspaceHarness(secondRequest.targetRoot);
  const handler = bindPrivateWorkspaceCreateHandler(family, "clean");

  await assert.rejects(
    handler.execute({
      packet: secondPacket,
      context: harness.context,
      attribution: { actorRef },
      artifactBoundary: firstBoundary
    }),
    /event admission differs from its admitted P1 packet/u
  );
  assert.equal(harness.writes.length, 0);

  await assert.rejects(
    handler.execute({
      packet: { ...secondPacket },
      context: harness.context,
      attribution: { actorRef },
      artifactBoundary: firstBoundary
    }),
    /requires an ingress-admitted packet/u
  );
  assert.equal(harness.writes.length, 0);

  const alternateFamily = await exactFamily();
  assert.notEqual(
    alternateFamily["abg.operation.workspace.create"].clean,
    definition
  );
  const secondEvents = [];
  const secondBoundary = artifactAdmission(secondPacket, secondEvents);
  await assert.rejects(
    bindPrivateWorkspaceCreateHandler(alternateFamily, "clean").execute({
      packet: secondPacket,
      context: harness.context,
      attribution: { actorRef },
      artifactBoundary: secondBoundary
    }),
    /differs from its exact definition or request seal/u
  );
  assert.equal(harness.writes.length, 0);
  assert.deepEqual(events, [firstBoundary.admission.event]);
  assert.deepEqual(secondEvents, [secondBoundary.admission.event]);
});

function descriptorWithDigest(input) {
  const provisional = { ...input, descriptorDigest: D };
  return Object.freeze({
    ...provisional,
    descriptorDigest: descriptorDigest(provisional)
  });
}

function productContext() {
  return {
    kind: "product_intake",
    publicContractCatalog: {},
    effects: {}
  };
}

test("T-281 product.resolve delegates to the existing exact resolver and refuses fact drift", async () => {
  const family = await exactFamily();
  const descriptor = descriptorWithDigest({
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor://abiogenesis/5.0.0",
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: "5.0.0",
    distributionArtifactDigest: D,
    productContentDigest: D,
    contributionManifestId: "contribution://abiogenesis/5.0.0",
    contributionManifestDigest: D,
    dependencies: [],
    abgCompatibility: ">=5.0.0 <6.0.0",
    contractRefs: ["abg.contract.gtl.m01"],
    capabilityRefs: ["abg.capability.gtl.declare@5"],
    provenanceRefs: ["proof://t281/descriptor"]
  });
  const requirement = {
    productId: "abiogenesis",
    versionConstraint: "5.0.0",
    requiredContractRefs: ["abg.contract.gtl.m01"],
    requiredCapabilityRefs: ["abg.capability.gtl.declare@5"]
  };
  const candidate = {
    productId: descriptor.productId,
    version: descriptor.version,
    contractRefs: descriptor.contractRefs,
    capabilityRefs: descriptor.capabilityRefs
  };
  const ownerRequest = {
    requirements: [requirement],
    candidateDescriptors: [descriptor]
  };
  const handler = bindPrivateProductResolveHandler(family);
  const definition = family["abg.operation.product.resolve"].resolve;
  const resolved = handler.execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition,
      request: { requirements: [requirement], candidates: [candidate] }
    }),
    ownerRequest,
    context: productContext()
  });
  assert.equal(resolved.kind, "owner_handler_result", JSON.stringify(resolved));
  assert.equal(resolved.value.selectedProducts.length, 1);
  assert.equal(resolved.value.selectedProducts[0].productIdentity, "abiogenesis");
  assert.deepEqual(resolved.emittedEvents, []);

  const drifted = handler.execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition,
      request: {
        requirements: [requirement],
        candidates: [{ ...candidate, contractRefs: [] }]
      }
    }),
    ownerRequest,
    context: productContext()
  });
  assert.equal(drifted.kind, "owner_handler_refusal");
  assert.equal(drifted.value.code, "invalid_requirement");
});

test("T-281 product verify/install reject mismatched owner facts before effects or Rule-B truth", async () => {
  const family = await exactFamily();
  const verifyRequest = {
    artifactRef: "/tmp/product.tgz",
    artifactDigest: D,
    productContentDigest: D,
    descriptorRef: "descriptor://product/1",
    descriptorDigest: D,
    contributionManifestRef: "contribution://product/1",
    contributionManifestDigest: D,
    resolvedLockRef: "lock://product/1",
    resolvedLockDigest: D,
    expectedContractRefs: []
  };
  const verify = await bindPrivateProductVerifyHandler(family).execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition: family["abg.operation.product.verify"].verify,
      request: { ...verifyRequest, descriptorRef: "descriptor://wrong" },
      dependencyLock: {
        ref: verifyRequest.resolvedLockRef,
        digest: verifyRequest.resolvedLockDigest
      }
    }),
    ownerRequest: {
      artifact: {
        artifactPath: verifyRequest.artifactRef,
        expectedArtifactDigest: D,
        expectedProductContentDigest: D
      },
      descriptor: {
        descriptorId: verifyRequest.descriptorRef,
        descriptorDigest: D,
        contractRefs: []
      },
      contributionManifest: {
        contributionId: verifyRequest.contributionManifestRef,
        contributionDigest: D
      },
      resolvedLock: {
        lockId: verifyRequest.resolvedLockRef,
        lockDigest: D
      }
    },
    context: productContext()
  });
  assert.equal(verify.kind, "owner_handler_refusal");
  assert.equal(verify.value.code, "identity_mismatch");

  const verifiedArtifact = {
    artifact: {
      artifactPath: "/tmp/product.tgz",
      expectedProductContentDigest: D
    },
    descriptor: {
      productId: "product",
      version: "1.0.0",
      descriptorId: "descriptor://product/1",
      descriptorDigest: D
    },
    contributionManifest: {
      contributionId: "contribution://product/1",
      contributionDigest: D
    },
    resolvedLock: {
      lockId: "lock://product/1",
      lockDigest: D,
      dependencyEdges: []
    }
  };
  const installEvents = [];
  const installDefinition = family["abg.operation.product.install"].install;
  const installRequest = {
    verifiedArtifactRef: verifiedArtifact.artifact.artifactPath,
    verifiedArtifactDigest: D,
    productContentDigest: D,
    productDescriptorRef: verifiedArtifact.descriptor.descriptorId,
    productDescriptorDigest: D,
    contributionManifestRef:
      verifiedArtifact.contributionManifest.contributionId,
    contributionManifestDigest: D,
    resolvedLockRef: verifiedArtifact.resolvedLock.lockId,
    resolvedLockDigest: D,
    targetRoot: "/tmp/toolchain/products/product/1.0.0",
    installPolicy: "immutable_idempotent"
  };
  const installPacket = admitT281PrivateP1Packet({
    family,
    definition: installDefinition,
    request: installRequest,
    actorRef: "actor://t281/installer",
    dependencyLock: {
      ref: installRequest.resolvedLockRef,
      digest: installRequest.resolvedLockDigest
    }
  });
  const install = await bindPrivateProductInstallHandler(family).execute({
    packet: installPacket,
    ownerRequest: {
      verifiedArtifact,
      toolchainRoot: "/tmp/toolchain",
      workspaceBindingRef: null
    },
    context: productContext(),
    attribution: { actorRef: "actor://t281/installer" },
    artifactBoundary: artifactAdmission(
      installPacket,
      installEvents
    )
  });
  assert.equal(install.kind, "owner_handler_refusal");
  assert.equal(install.value.code, "verification_failed");
  assert.deepEqual(installEvents.map((event) => event.kind), [
    "public_operation_admitted"
  ]);
});
