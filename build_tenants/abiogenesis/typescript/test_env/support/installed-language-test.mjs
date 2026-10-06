import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { setupInstalledRootCatalog } from "./root-installed-environment.mjs";
import { prepareLanguageSmokeFixture, constructLanguageTestInput } from "./language-smoke-fixture.mjs";
import { constructInstalledStartCall, constructInstalledRunReadCall, runInstalledCliRequest } from "./registered-graph-selection.mjs";

// Current installed DefinitionCall route. Setup uses admitted installation and
// workspace owners; this helper does not claim legacy Public setup coverage.
export async function runInstalledLanguageTest(context, packageRoot, options = {}) {
  const prepareFixture = options.prepareFixture ?? prepareLanguageSmokeFixture;
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareFixture(basis)],
    ...(options.programRef === undefined ? {} : { programRef: options.programRef }),
    ...(options.catalogHandle === undefined ? {} : { graphFunctionRef: options.catalogHandle }),
  });
  if (options.allowlist !== undefined) {
    environment.catalogView = environment.product.narrowGraphFunctionCatalog(environment.catalog, options.allowlist);
    assert.equal(environment.catalogView.kind, "graph_function_catalog_view");
  }
  const { product, installedRoot, scratch } = environment;
  const publicApi = await import(pathToFileURL(join(installedRoot, "build/code/src/public/index.js")).href);
  const setupHandoff = environment.store.projectReopenAuthorityAndClose();
  const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: setupHandoff,
    handoffDigest: product.sha256Canonical(setupHandoff) };
  const input = options.input ?? constructLanguageTestInput(options.subject ?? "World");
  const { call, resolution } = await constructInstalledStartCall({ environment, publicApi, eventResource, input,
    identity: options.identity ?? "language-smoke", programRef: options.programRef, declaredStartRef: options.declaredStartRef });
  const execution = await runInstalledCliRequest({ scratch, installedRoot, identity: options.identity ?? "language-smoke",
    acquisition: { kind: "reopen", closeHandoff: setupHandoff }, call, expectedExitCode: options.expectedExitCode ?? 0,
    environment: options.workerEnvironment ?? {} });
  assert.equal(execution.output.kind, "installed_definition_call_transport_result", JSON.stringify(execution.output));
  const receipt = execution.output.receipt;
  assert.equal(receipt.kind, "definition_host_receipt");
  const handoff = receipt.resources.eventResource.closeHandoff;
  const events = environment.abg.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const projectionContracts = await import(pathToFileURL(join(installedRoot, "build/code/src/abg/project_read_operation_contracts.js")).href);
  const reads = [];
  if (options.readback !== false && receipt.resources.run) {
    for (const memberKey of ["run_result", "run_replay"]) {
      const source = receipt.resources.run;
      const { call: readCall } = constructInstalledRunReadCall({ environment, publicApi, projectReadContracts: projectionContracts,
        memberKey, selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 4096 } : { kind: "none" },
        source, eventResource: { ...eventResource, closeHandoff: handoff, handoffDigest: product.sha256Canonical(handoff) },
        identity: `${options.identity ?? "language-smoke"}-${memberKey}` });
      const before = await readFile(new URL(handoff.prefix.eventLogRef));
      const read = await runInstalledCliRequest({ scratch, installedRoot, identity: memberKey,
        acquisition: { kind: "reopen", closeHandoff: handoff }, call: readCall });
      assert.equal(read.output.receipt.ownerOutput.outcomeKind, "result", memberKey);
      assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix, handoff.prefix, memberKey);
      assert.deepEqual(await readFile(new URL(handoff.prefix.eventLogRef)), before, `${memberKey} appends no bytes`);
      reads.push({ memberKey, call: readCall, receipt: read.output.receipt });
    }
  }
  return { environment, call, resolution, execution, receipt, handoff, events, reads,
    fixtureInstalledRoot: environment.additionalInstallCandidates[0].installedRoot };
}
