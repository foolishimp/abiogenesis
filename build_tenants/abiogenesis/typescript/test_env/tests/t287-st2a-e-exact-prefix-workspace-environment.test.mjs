import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { prepareOddGlcDataProduct } from
  "../support/developer-mini-product.mjs";
import {
  publicOperationBasis,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const packageRoot = new URL("../..", import.meta.url).pathname;

function deepFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function crossedPrefix(abg, events, mutateBindingEvent) {
  const crossed = structuredClone(events);
  const bindingEvent = crossed.find((event) =>
    event.kind === "public_operation_artifact_admitted" &&
    event.payload.operationId === "abg.operation.workspace.bind"
  );
  assert.ok(bindingEvent, "falsifier requires one admitted binding event");
  mutateBindingEvent(bindingEvent);
  return abg.selectValidatedRuntimeEventPrefix(deepFreeze(crossed));
}

function bindingCoordinate(binding) {
  return Object.freeze({
    ref: binding.bindingId,
    digest: binding.bindingDigest,
  });
}

test("ST-2A-E projects one exact immutable workspace environment without append", async (context) => {
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    prepareAdditionalProducts: async (input) => [
      await prepareOddGlcDataProduct(input),
    ],
    workspaceProductIndex: 1,
  });
  const {
    abg,
    product,
    store,
    durablePrefix,
    admittedInstalls,
    lock,
    productSet,
    workspaceAuthority,
    bindingCandidate,
    workspaceBinding,
    scratch,
  } = environment;
  const durablePath = fileURLToPath(durablePrefix.eventLogRef);
  const bytesBeforeProjection = await readFile(durablePath);
  const events = abg.readRuntimeEventsAtDurablePrefix(durablePrefix);
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);

  const coordinate = bindingCoordinate(workspaceBinding);
  const projected = abg.projectExactPrefixWorkspaceEnvironment(
    prefix,
    coordinate,
  );
  assert.equal(projected.kind, "exact_prefix_workspace_environment");
  assert.strictEqual(projected.prefix, prefix);
  assert.equal(projected.artifactTruth.kind, "artifact_truth_projection");
  assert.deepEqual(projected.workspaceAuthorityBasis, workspaceAuthority);
  assert.deepEqual(projected.workspaceBindingCandidate, bindingCandidate);
  assert.deepEqual(projected.workspaceBinding, workspaceBinding);
  assert.deepEqual(projected.productInstalls, admittedInstalls);
  assert.deepEqual(projected.resolvedProductLock, lock);
  assert.deepEqual(projected.productSet, productSet);
  assert.equal(Object.isFrozen(projected), true);
  assert.equal(Object.isFrozen(projected.productInstalls), true);
  assert.equal(Object.isFrozen(projected.productSet), true);
  assert.deepEqual(await readFile(durablePath), bytesBeforeProjection);

  const bindingIndex = events.findIndex((event) =>
    event.kind === "public_operation_artifact_admitted" &&
    event.payload.operationId === "abg.operation.workspace.bind"
  );
  assert.ok(bindingIndex > 1, "two causal installs precede the binding");
  const wrongPrefix = abg.selectValidatedRuntimeEventPrefix(
    Object.freeze(events.slice(0, bindingIndex)),
  );
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(wrongPrefix, coordinate).code,
    "workspace_binding_missing",
  );
  const partialHistory = abg.selectValidatedRuntimeEventPrefix(
    Object.freeze(events.slice(0, 1)),
  );
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(partialHistory, coordinate).code,
    "workspace_binding_missing",
  );

  const crossedInstall = crossedPrefix(abg, events, (event) => {
    event.causationEventRefs.reverse();
    event.payload.causationEventRefs.reverse();
  });
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(crossedInstall, coordinate).code,
    "artifact_truth_invalid",
  );
  const crossedLock = crossedPrefix(abg, events, (event) => {
    event.payload.artifact.lockId = "product-lock://abiogenesis/crossed";
  });
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(crossedLock, coordinate).code,
    "artifact_truth_invalid",
  );
  const crossedProductSet = crossedPrefix(abg, events, (event) => {
    event.payload.artifact.productSetId = "product-set://abiogenesis/crossed";
  });
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(crossedProductSet, coordinate).code,
    "artifact_truth_invalid",
  );
  const causallyPartial = crossedPrefix(abg, events, (event) => {
    event.causationEventRefs = event.causationEventRefs.slice(0, 1);
    event.payload.causationEventRefs = event.payload.causationEventRefs.slice(0, 1);
  });
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(causallyPartial, coordinate).code,
    "artifact_truth_invalid",
  );
  assert.deepEqual(await readFile(durablePath), bytesBeforeProjection);

  const siblingManifest = {
    workspaceId: "workspace://t287/st2a-e/sibling",
    canonicalRoot: join(scratch, "workspace-sibling"),
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://t287/st2a-e/sibling",
  };
  const siblingAuthority = product.constructWorkspaceAuthorityBasis({
    ...siblingManifest,
    authorityManifestRef: "manifest://t287/st2a-e/sibling",
    authorityManifestDigest: product.sha256Canonical(siblingManifest),
  });
  assert.equal(siblingAuthority.kind, "workspace_authority_basis");
  const siblingBinding = product.constructWorkspaceBinding(
    siblingAuthority,
    productSet,
    lock,
    Object.fromEntries(Object.entries(bindingCandidate.roots).map(
      ([key, root]) => [key, join(root, "sibling")],
    )),
  );
  assert.equal(siblingBinding.kind, "workspace_binding_candidate");
  const siblingAdmission = abg.admitWorkspaceBinding(
    store,
    siblingBinding,
    {
      ...publicOperationBasis(
        product,
        "abg.operation.workspace.bind",
        siblingBinding.bindingId,
        siblingBinding.bindingDigest,
        "invocation://t287/st2a-e/sibling-bind",
        admittedInstalls.map((install) => install.admissionEventRef),
      ),
      predecessorPrefix: durablePrefix,
    },
    siblingAuthority,
  );
  assert.equal(siblingAdmission.kind, "artifact_owner_result");

  const historical = abg.projectExactPrefixWorkspaceEnvironment(
    prefix,
    coordinate,
  );
  assert.equal(historical.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(historical.workspaceBinding, workspaceBinding);
  const siblingEvents = abg.readRuntimeEventsAtDurablePrefix(
    siblingAdmission.successorPrefix,
  );
  const siblingPrefix = abg.selectValidatedRuntimeEventPrefix(siblingEvents);
  const bytesAfterSiblingAdmission = await readFile(durablePath);
  const oldAtSuccessor = abg.projectExactPrefixWorkspaceEnvironment(
    siblingPrefix,
    coordinate,
  );
  assert.equal(oldAtSuccessor.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(oldAtSuccessor.workspaceBinding, workspaceBinding);
  const siblingCoordinate = bindingCoordinate(siblingAdmission.value);
  const siblingProjection = abg.projectExactPrefixWorkspaceEnvironment(
    siblingPrefix,
    siblingCoordinate,
  );
  assert.equal(siblingProjection.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(siblingProjection.workspaceBinding, siblingAdmission.value);
  assert.deepEqual(siblingProjection.workspaceAuthorityBasis, siblingAuthority);
  assert.deepEqual(siblingProjection.productInstalls, admittedInstalls);
  assert.deepEqual(siblingProjection.resolvedProductLock, lock);
  assert.deepEqual(siblingProjection.productSet, productSet);
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      siblingPrefix,
      Object.freeze({
        ref: coordinate.ref,
        digest: siblingCoordinate.digest,
      }),
    ).code,
    "workspace_binding_mismatch",
  );
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      siblingPrefix,
      Object.freeze({
        ref: "workspace-binding://abiogenesis/unknown",
        digest: coordinate.digest,
      }),
    ).code,
    "workspace_binding_missing",
  );
  assert.deepEqual(await readFile(durablePath), bytesAfterSiblingAdmission);
});
