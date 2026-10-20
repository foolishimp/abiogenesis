import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { projectAbi5RootOwnerEvidence } from
  "../support/root-owner-evidence.mjs";
import {
  ABI5_ROOT_DEFINITION_REF,
  ABI5_ROOT_GOVERNOR,
  ABI5_ROOT_PROGRAM_REF,
  evaluateAbi5Root,
} from "../support/root-governor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("ABI5-ROOT-001 governor reduces installed owner projections and raw CLI transport continuity", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "root-governor",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  const product = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `root-governor-product=${Date.now()}`,
  );
  const abg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `root-governor-abg=${Date.now()}`,
  );
  const ownerEvidence = projectAbi5RootOwnerEvidence({
    product,
    abg,
    run,
  });
  assert.equal(
    ownerEvidence.product.selectedCatalogEntry.handle,
    ownerEvidence.public.runRequest.payload.catalogHandle,
  );
  assert.equal(
    ownerEvidence.product.selectedCatalogEntry.definitionRef,
    ABI5_ROOT_DEFINITION_REF,
  );
  assert.equal(
    ownerEvidence.abg.executionBasis.programRef,
    ABI5_ROOT_PROGRAM_REF,
  );
  assert.equal(
    ownerEvidence.abg.executionBasis.graphFunctionDigest,
    ownerEvidence.product.selectedCatalogEntry.definitionDigest,
  );
  const governor = evaluateAbi5Root({ ownerEvidence });
  assert.equal(governor.governorId, ABI5_ROOT_GOVERNOR);
  assert.equal(governor.disposition, "root_satisfied", JSON.stringify(governor));
  assert.equal(governor.firstFrontier, null);
  assert.deepEqual(Object.values(governor.obligationResults), Array(10).fill(true));
  assert.equal(governor.ownerSemanticViewRef, ownerEvidence.abg.semanticReplay.viewRef);
  assert.equal(governor.ownerReplayRef, ownerEvidence.abg.replayFirst.replayRef);

  const mutations = [
    {
      label: "Product validator refusal",
      frontier: "R1",
      apply(candidate) {
        candidate.product.verifiedProductValid = false;
      },
    },
    {
      label: "missing admitted WorkspaceBinding projection",
      frontier: "R3",
      apply(candidate) {
        candidate.product.admittedWorkspace = null;
      },
    },
    {
      label: "missing rehydrated ExecutionBasis",
      frontier: "R6",
      apply(candidate) {
        candidate.abg.executionBasis = null;
      },
    },
    {
      label: "missing Product-projected selected catalog entry",
      frontier: "R7",
      apply(candidate) {
        candidate.product.selectedCatalogEntry = null;
      },
    },
    {
      label: "non-closing semantic lifecycle",
      frontier: "R9",
      apply(candidate) {
        candidate.abg.semanticReplay.lifecycle.runClosed = false;
      },
    },
    {
      label: "missing raw CLI transport result",
      frontier: "R10",
      apply(candidate) {
        candidate.transport.transportRuns.at(-1).transportResult = null;
      },
    },
    {
      label: "broken owner close-handoff continuity",
      frontier: "R10",
      apply(candidate) {
        candidate.transport.transportRuns[1].transportRequest.acquisition
          .closeHandoff = structuredClone(
            candidate.transport.transportRuns.at(-1).transportResult
              .closeHandoff,
          );
      },
    },
    {
      label: "second ABG replay fold absent",
      frontier: "R10",
      apply(candidate) {
        candidate.abg.replaySecond = null;
      },
    },
  ];
  for (const mutation of mutations) {
    const candidate = structuredClone(ownerEvidence);
    mutation.apply(candidate);
    const result = evaluateAbi5Root({ ownerEvidence: candidate });
    assert.equal(result.disposition, "root_red", mutation.label);
    assert.equal(result.firstFrontier, mutation.frontier, mutation.label);
  }
});
