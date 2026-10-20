import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as Effect from "effect/Effect";
import test from "node:test";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { nativePublications } from "../support/d2-frame-fixture.mjs";
import { prepareGenericJobIntakeProduct, constructGenericIntakeStart, ordinaryJob, verifyRetainedGenericIntakes } from "../support/t287-generic-job-intake.mjs";

const packageRoot = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
test("one installed generic declaration admits two ordinary jobs through actual native child intake", { timeout: 300000 }, async () => {
  // Keep the exact isolated log, including a first failure. No retained run is reopened.
  const environment = await setupInstalledRootCatalog({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareGenericJobIntakeProduct(basis)],
  });
  console.log(JSON.stringify({ phase: "generic_intake_setup", scratch: environment.scratch }));
  const { product, abg, gtl } = environment;
  const publication = environment.additionalPublications[0], graphFunctions = publication.graphFunctions;
  environment.catalog = product.admitGraphFunctionCatalog({ workspaceBinding: environment.bindingCandidate, resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts, installedProducts: environment.installCandidates,
    publications: [...nativePublications(gtl, environment.verified), publication] });
  assert.equal(environment.catalog.kind, "graph_function_catalog", JSON.stringify(environment.catalog));
  environment.catalogView = product.narrowGraphFunctionCatalog(environment.catalog, graphFunctions.map(g => g.name).sort());
  assert.equal(environment.catalogView.kind, "graph_function_catalog_view");
  const publicApi = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const original = await readFile(join(environment.installedRoots[1], "build/publication.json"));
  let closeHandoff = environment.store.projectReopenAuthorityAndClose();
  const completed = [];
  for (const [name, text] of [["hello", "Build a command-line program that prints Hello World and exits successfully."],
    ["addition", "Build a command-line program that accepts two integer arguments and prints their sum. Invalid input must fail clearly."]]) {
    const input = ordinaryJob(product, gtl, text);
    assert.equal(Object.hasOwn(input, "requirements"), false);
    assert.equal(Object.hasOwn(input, "design"), false);
    const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff,
      handoffDigest: product.sha256Canonical(closeHandoff) };
    const { call, resolution } = await constructGenericIntakeStart({ environment, publicApi, eventResource, input, identity: name });
    await writeFile(join(environment.scratch, name + "-call.json"), JSON.stringify(call, null, 2) + "\n", { flag: "wx" });
    const outcome = await Effect.runPromise(product.RUN_DEFINITION_BINDINGS.invoke.start(call));
    await writeFile(join(environment.scratch, name + "-outcome.json"), JSON.stringify(outcome, null, 2) + "\n", { flag: "wx" });
    assert.equal(outcome.ownerOutput.outcomeKind, "result", JSON.stringify(outcome));
    assert.equal(outcome.ownerOutput.value.disposition, "completed", JSON.stringify(outcome));
    closeHandoff = outcome.resources.eventResource.closeHandoff;
    const events = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const results = events.filter(e => e.kind === "c_call_result_admitted" && product.isSemanticJobEnvelope(e.payload.value) &&
      e.payload.value.job.members[0].base64 === input.members[0].base64);
    const intake = results.find(e => e.payload.value.basis.intakeCCallRef === e.aggregateId);
    assert.ok(intake, "the native intake leaf, not a caller envelope, produced the job");
    const value = intake.payload.value;
    const prefix = abg.selectValidatedRuntimeEventPrefix(events);
    const child = abg.rehydrateExecutionBasisAtPrefix(prefix, value.basis.intakeExecutionBasisRef);
    const root = abg.rehydrateExecutionBasisAtPrefix(prefix, value.basis.rootExecutionBasisRef);
    assert.notEqual(child.basisRef, root.basisRef);
    assert.equal(child.parentExecutionBasisRef, root.basisRef);
    assert.equal(child.invocationAdmissionRef, root.invocationAdmissionRef);
    assert.deepEqual(child.rawInputValue, input);
    assert.deepEqual(root.rawInputValue, input);
    assert.equal(value.assets.length, 0);
    assert.equal(value.bindingVersions.length, 0);
    assert.equal(events.filter(e => e.kind === "actor_transport_binding_admitted").length, 0);
    assert.deepEqual(await readFile(join(environment.installedRoots[1], "build/publication.json")), original);
    completed.push({ name, input, intake, child, root, resolution: resolution.resolution, closeHandoff });
  }
  assert.notEqual(completed[0].intake.payload.value.basis.jobRef, completed[1].intake.payload.value.basis.jobRef);
  assert.notEqual(completed[0].root.rawInputDigest, completed[1].root.rawInputDigest);
  const result = { kind: "generic_job_native_intake_proof", scope: "installed native root/child intake only; no stage or effect success",
    scratch: environment.scratch, product: environment.additionalProducts[0].basis, completed,
    declarationDigest: product.sha256Canonical(publication), paidCalls: 0, closeHandoff };
  await writeFile(join(environment.scratch, "generic-intake-proof.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
  if (process.env.ABI5_GENERIC_JOB_EVIDENCE_ROOT) {
    await mkdir(process.env.ABI5_GENERIC_JOB_EVIDENCE_ROOT, { recursive: true });
    await writeFile(join(process.env.ABI5_GENERIC_JOB_EVIDENCE_ROOT, "intake-result.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
  }
  console.log(JSON.stringify({ kind: result.kind, scratch: environment.scratch, jobs: completed.map(r => ({ name: r.name,
    jobRef: r.intake.payload.value.basis.jobRef, rootBasis: r.root.basisRef, childBasis: r.child.basisRef })), paidCalls: 0 }));
});

test("retained two-job native intake rejects crossed job values and scopes", { skip: !process.env.ABI5_GENERIC_JOB_RETAINED_PROOF }, async () => {
  const proof = JSON.parse(await readFile(process.env.ABI5_GENERIC_JOB_RETAINED_PROOF, "utf8"));
  console.log(JSON.stringify(await verifyRetainedGenericIntakes(proof)));
});
