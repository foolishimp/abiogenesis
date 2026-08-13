import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from
  "../support/root-installed-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("M5 exact catalog basis and retained runtime truth reconstruct equally in two fresh processes", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, packageRoot);
  const {
    abg,
    product,
    executionBasis,
    installedRoot,
    store,
    verified,
    installCandidate,
    lock,
    bindingCandidate,
    publication,
  } = environment;
  const opened = abg.openCall(store, executionBasis, {
    eventTime: "2026-08-05T00:00:00.000Z",
    correlationId: "correlation://t287/fresh-process/open",
    causationEventRefs: [],
  });
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const readinessBasis = {
    workspaceBinding: bindingCandidate,
    resolvedLock: lock,
    verifiedProducts: [verified],
    installedProducts: [installCandidate],
    publications: [publication],
  };
  const retainedCatalog = product.admitGraphFunctionCatalog(readinessBasis);
  assert.equal(
    retainedCatalog.kind,
    "graph_function_catalog",
    JSON.stringify({ retainedCatalog, bindingCandidate, lock }),
  );
  const crossWorkspace = structuredClone(readinessBasis);
  crossWorkspace.workspaceBinding.workspaceId =
    "workspace://t287/substituted-workspace";
  const crossWorkspaceRefusal = product.admitGraphFunctionCatalog(crossWorkspace);
  assert.equal(crossWorkspaceRefusal.kind, "catalog_construction_refusal");
  assert.equal(crossWorkspaceRefusal.code, "binding_lock_mismatch");
  const requests = [
    {
      rowId: "runtime_replay",
      exportName: "replay",
      args: [{ runId: opened.scope.runId }],
    },
    {
      rowId: "run_quiescence",
      exportName: "projectRunQuiescence",
      input: "validated_run_prefix",
      prefixScope: { runId: opened.scope.runId },
    },
    {
      rowId: "actor_process_lifecycle_absence",
      exportName: "projectActorProcessLifecycle",
      input: "validated_run_prefix",
      prefixScope: { runId: opened.scope.runId },
      args: ["actor-invocation://t287/fresh-process/absent"],
    },
    {
      rowId: "artifact_projection",
      exportName: "projectExactPrefixArtifactTruth",
      input: "durable_prefix",
    },
    {
      rowId: "catalog_reconstruction",
      owner: "product",
      exportName: "admitGraphFunctionCatalog",
      args: [readinessBasis],
    },
  ];
  const proof = await proveFreshProcessRuntimeProjectionEquality({
    abg,
    product,
    installedPackageRoot: installedRoot,
    requests,
    store,
  });
  assert.equal(proof.retainedRows.every((row) => row.disposition === "green"), true);
  assert.equal(
    proof.retainedRows[4].projection.kind,
    "graph_function_catalog",
    JSON.stringify(proof.retainedRows[4].projection),
  );
  assert.equal(
    proof.retainedRows[4].projection.workspaceBindingId,
    bindingCandidate.bindingId,
  );
});
