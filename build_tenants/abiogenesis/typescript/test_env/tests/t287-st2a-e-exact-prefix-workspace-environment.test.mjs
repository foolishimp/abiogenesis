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
    admittedInstallResults,
    lock,
    productSet,
    workspaceAuthority,
    bindingCandidate,
    workspaceBinding,
    scratch,
  } = environment;
  const durablePath = fileURLToPath(durablePrefix.eventLogRef);
  const bytesBeforeProjection = await readFile(durablePath);

  const coordinate = bindingCoordinate(workspaceBinding);
  const projected = abg.projectExactPrefixWorkspaceEnvironment(
    durablePrefix,
    coordinate,
  );
  assert.equal(projected.kind, "exact_prefix_workspace_environment");
  assert.strictEqual(projected.prefix, durablePrefix);
  assert.equal(
    projected.artifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
  );
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

  assert.ok(admittedInstallResults.length > 1);
  const firstInstallPrefix = admittedInstallResults[0].successorPrefix;
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      firstInstallPrefix,
      coordinate,
    ).code,
    "workspace_binding_missing",
  );
  const installsOnlyPrefix = admittedInstallResults.at(-1).successorPrefix;
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      installsOnlyPrefix,
      coordinate,
    ).code,
    "workspace_binding_missing",
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
  const bytesAfterSiblingAdmission = await readFile(durablePath);

  const historical = abg.projectExactPrefixWorkspaceEnvironment(
    durablePrefix,
    coordinate,
  );
  assert.equal(historical.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(historical.workspaceBinding, workspaceBinding);
  const oldAtSuccessor = abg.projectExactPrefixWorkspaceEnvironment(
    siblingAdmission.successorPrefix,
    coordinate,
  );
  assert.equal(oldAtSuccessor.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(oldAtSuccessor.workspaceBinding, workspaceBinding);
  const siblingCoordinate = bindingCoordinate(siblingAdmission.value);
  const siblingProjection = abg.projectExactPrefixWorkspaceEnvironment(
    siblingAdmission.successorPrefix,
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
      siblingAdmission.successorPrefix,
      Object.freeze({
        ref: coordinate.ref,
        digest: siblingCoordinate.digest,
      }),
    ).code,
    "workspace_binding_mismatch",
  );
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      siblingAdmission.successorPrefix,
      Object.freeze({
        ref: siblingCoordinate.ref,
        digest: coordinate.digest,
      }),
    ).code,
    "workspace_binding_mismatch",
  );
  assert.equal(
    abg.projectExactPrefixWorkspaceEnvironment(
      siblingAdmission.successorPrefix,
      Object.freeze({
        ref: "workspace-binding://abiogenesis/unknown",
        digest: coordinate.digest,
      }),
    ).code,
    "workspace_binding_missing",
  );
  assert.deepEqual(await readFile(durablePath), bytesAfterSiblingAdmission);
});
