import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { EPISODE_CAPTURE_ROOT_VARIABLE, createEpisodeCapture, runInstalledLanguageTest } from "../support/installed-language-test.mjs";
import { LANGUAGE_TEST_IDS, evaluateLanguageTestResult } from "../support/language-smoke-fixture.mjs";
const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

// The test's own fixed input and oracle, independent of any result inspection.
const EXPECTED_INPUT = Object.freeze({ kind: "hello_world_input", schemaVersion: "5.0.0", subject: "World" });
// Event kinds that make the episode a continuation, refusal, gap, hold, block
// or failure rather than the closed root path.
const NON_ROOT_EVENT_KIND = /refus|reject|_gap|continu|runtime_failure|_held|_blocked/u;

// Identity-only projection of the admitted episode, retained before assertion.
function projectRootEpisode(proof) {
  const events = proof?.events ?? [];
  const run = proof?.receipt?.resources?.run ?? null;
  const row = (event) => event === undefined ? null : ({ ordinal: events.indexOf(event), eventId: event.eventId,
    kind: event.kind, aggregateId: event.aggregateId, runId: event.runId ?? null, basisId: event.basisId ?? null,
    causationEventRefs: event.causationEventRefs });
  const runKinds = ["c_call_opened", "c_call_fibre_selected", "c_call_evidenced", "c_call_result_admitted", "c_call_judged",
    "terminal_reached", "frame_closed", "graph_call_closed", "run_closed"];
  const terminal = (value) => value?.terminalResult ?? value?.projection?.terminalResult ?? null;
  return {
    run,
    invocationAdmitted: events.filter((event) => event.kind === "invocation_admitted").map(row),
    rootBasisAdmitted: events.filter((event) => event.kind === "basis_admitted" && event.payload?.basisClass === "root").map(row),
    runEvents: Object.fromEntries(runKinds.map((kind) => [kind, events.filter((event) => event.kind === kind &&
      (run === null || event.runId === run.ref)).map(row)])),
    nonRootEventKinds: [...new Set(events.map((event) => event.kind).filter((kind) => NON_ROOT_EVENT_KIND.test(kind)))],
    materialization: proof?.materialization === null || proof?.materialization === undefined ? null : {
      graphRef: proof.materialization.graph?.materializationRef ?? null,
      graphDigest: proof.materialization.graph?.materializationDigest ?? null,
      graphValidationKind: proof.materialization.graphValidation?.kind ?? null,
      graphValidationRef: proof.materialization.graphValidation?.validationRef ?? null,
    },
    terminals: {
      cli: terminal(proof?.receipt?.ownerOutput?.value),
      ...Object.fromEntries((proof?.reads ?? []).map((read) => [read.memberKey, terminal(read.receipt?.ownerOutput?.value)])),
    },
  };
}

function only(rows, label) {
  assert.equal(rows.length, 1, `${label}: exactly one admitted event, got ${rows.length}`);
  return rows[0];
}

function coordinate(value) {
  return { ref: value?.ref, digest: value?.digest };
}

test("Hello World is an external minimal GTL program through installed Public execution and fresh reads", async context => {
  const capture = createEpisodeCapture();
  if (!capture.enabled) context.diagnostic(`${EPISODE_CAPTURE_ROOT_VARIABLE} unset: no S01 episode custody is retained`);
  let primary = null;
  try {
    const proof = await runInstalledLanguageTest(context, packageRoot, { rootWitness: true, capture });
    capture.record("root-episode-joins", projectRootEpisode(proof));
    await capture.flush();
    const { resolution, environment, events, reads, receipt, handoff, call, execution, materialization } = proof;
    const fixture = environment.additionalProducts[0];
    const ids = LANGUAGE_TEST_IDS;

    // Retained bounded assertions.
    assert.equal(resolution.resolution.programOwner.productId, fixture.basis.productId);
    assert.equal(resolution.declarationClosure.semanticsOwner.productId, fixture.basis.productId);
    assert.equal(resolution.implementationSetCandidate.rows[0].implementationOwnerProductId, fixture.basis.productId);
    assert.notEqual(fixture.basis.productId, environment.verified.productId);
    assert.equal(proof.receipt.exitCode, 0);
    assert.equal(proof.receipt.ownerOutput.outcomeKind, "result");
    const result = events.find(event => event.kind === "c_call_result_admitted");
    assert.ok(result, "native ABG admits an actual leaf result");
    assert.equal(result.payload.contractRef, LANGUAGE_TEST_IDS.outputContractRef);
    assert.equal(evaluateLanguageTestResult({ kind: "hello_world_input", subject: "World" }, result.payload.value), true);
    assert.equal(events.filter(event => event.kind === "run_closed").length, 1);
    assert.equal(events.filter(event => event.kind === "c_call_opened").length, 1);
    assert.deepEqual(reads.map(read => read.memberKey), ["run_result", "run_replay"]);
    assert.equal(reads.every(read => read.receipt.exitCode === 0), true);

    const byId = new Map(events.map((event) => [event.eventId, event]));
    const ordinal = (eventId) => events.findIndex((event) => event.eventId === eventId);
    const ancestors = (event) => {
      const seen = new Set();
      const pending = [...event.causationEventRefs];
      while (pending.length > 0) {
        const eventId = pending.pop();
        if (seen.has(eventId)) continue;
        seen.add(eventId);
        pending.push(...(byId.get(eventId)?.causationEventRefs ?? []));
      }
      return seen;
    };
    const product = environment.product;
    const run = receipt.resources.run;

    // R1: the exact tenant and fixture artifacts are verified; the candidate
    // carries no test-program code, contracts or publication.
    assert.equal(environment.verified.disposition, "verified");
    assert.equal(await product.sha256File(environment.artifactPath), environment.verified.artifactDigest);
    assert.equal(environment.verified.artifactDigest, environment.candidateBasis.artifactDigest);
    assert.equal(environment.verified.productId, environment.candidateBasis.productId);
    assert.equal(environment.verified.productContentDigest, environment.candidateBasis.productContentDigest);
    assert.equal(environment.additionalVerified[0].disposition, "verified");
    assert.equal(environment.additionalVerified[0].productId, fixture.basis.productId);
    assert.equal(environment.additionalVerified[0].artifactDigest, fixture.basis.artifactDigest);
    const tenantManifest = JSON.parse(await readFile(join(environment.installedRoot, "product-toolchain-manifest.json"), "utf8"));
    assert.equal(tenantManifest.productId, environment.verified.productId);
    assert.deepEqual(tenantManifest.productRelativeLocators.filter((path) => /language-smoke|test_env\//u.test(path)), [],
      "the candidate payload carries no test-program code");
    assert.deepEqual(environment.publications[0].programs.filter((program) => program.programRef.startsWith("program://abi5-tests/")), [],
      "the candidate publication carries no test Program");

    // R2: one clean install outside the source tree, reached only through
    // exported installed owners, the exported Public entry and the declared bin.
    assert.equal(environment.installCandidate.disposition, "materialized");
    const installedRelative = relative(packageRoot, environment.installedRoot);
    assert.equal(installedRelative.startsWith("..") || isAbsolute(installedRelative), true, "install is source-blind");
    assert.equal(environment.ownerSurface, "exported");
    assert.equal(environment.implementationLeafPort, undefined);
    assert.equal(environment.implementation, undefined);
    assert.deepEqual(environment.ownerModules.filter((row) => row.exported !== true || /\/implementation\//u.test(row.href)), []);
    assert.deepEqual(environment.ownerModules.filter((row) => row.root === "installed").map((row) => row.subpath),
      ["./product", "./abg", "./gtl", "./hog", "./validator"]);
    assert.equal(proof.publicSurface.public.exported, true);
    assert.equal(execution.cliPath, proof.publicSurface.cli.path);

    // R3: both installs and the workspace binding are admitted into this
    // episode's own log before the invocation.
    assert.equal(environment.admittedInstallResults.length, 2);
    assert.equal(environment.admittedInstallResults.every((admitted) => admitted.kind === "artifact_owner_result"), true);
    assert.equal(environment.workspaceBindingResult.kind, "artifact_owner_result");
    assert.equal(environment.workspaceBinding.bindingId, environment.bindingCandidate.bindingId);
    const invocationEvent = only(events.filter((event) => event.kind === "invocation_admitted"), "invocation");
    const invocation = invocationEvent.payload;
    for (const eventRef of [...environment.admittedInstalls.map((install) => install.admissionEventRef),
      environment.workspaceBinding.admissionEventRef]) {
      assert.notEqual(ordinal(eventRef), -1, `${eventRef} is admitted in this episode`);
      assert.ok(ordinal(eventRef) < ordinal(invocationEvent.eventId), `${eventRef} precedes the invocation`);
    }
    assert.equal(invocation.workspaceBindingId, environment.workspaceBinding.bindingId);
    assert.equal(invocation.workspaceBindingDigest, environment.workspaceBinding.bindingDigest);

    // R4: the supplied publication builds the Catalog and its narrowed view.
    assert.equal(environment.publication.moduleRef, ids.moduleRef);
    assert.equal(environment.publicationValidation.kind, "publication_validation");
    assert.equal(environment.catalog.kind, "graph_function_catalog");
    assert.equal(environment.catalogView.kind, "graph_function_catalog_view");
    assert.deepEqual(environment.catalogView.allowlist, [ids.graphFunctionRef]);
    assert.ok(product.lookupGraphFunction(environment.catalogView, ids.graphFunctionRef));
    assert.equal(invocation.catalogViewDigest, environment.catalogView.viewDigest);

    // R5: the test-owned Program is selected and admitted.
    assert.equal(environment.selectedProgramRef, ids.programRef);
    assert.equal(resolution.program.programRef, ids.programRef);
    assert.equal(resolution.programValidation.kind, "program_validation");
    assert.equal(invocation.programRef, ids.programRef);
    const basisEvent = only(events.filter((event) => event.kind === "basis_admitted" && event.payload.basisClass === "root"), "root basis");
    const basis = basisEvent.payload;
    assert.equal(basis.invocationAdmissionRef, invocation.invocationAdmissionRef);
    assert.equal(basis.programRef, ids.programRef);
    assert.equal(basis.programValidationRef, resolution.programValidation.validationRef);

    // R6: its GraphFunction, contracts and ordinary leaf binding resolve.
    assert.equal(resolution.graphFunction.name, ids.graphFunctionRef);
    assert.deepEqual(resolution.graphFunction.inputs, [ids.inputContractRef]);
    assert.deepEqual(resolution.graphFunction.outputs, [ids.outputContractRef]);
    const leafRow = only(resolution.implementationSetCandidate.rows, "leaf binding row");
    assert.equal(leafRow.graphFunctionRef, ids.graphFunctionRef);
    assert.equal(leafRow.nodeRef, ids.nodeRef);
    assert.equal(leafRow.implementationBindingRef, ids.implementationBindingRef);
    assert.equal(basis.graphFunctionRef, ids.graphFunctionRef);
    assert.equal(basis.graphFunctionDigest, product.sha256Canonical(resolution.graphFunction));
    assert.equal(basis.resultContractRef, ids.outputContractRef);
    assert.equal(basis.evidenceContractRef, ids.evidenceContractRef);
    assert.equal(basis.judgmentContractRef, ids.judgmentContractRef);
    assert.equal(basis.closureContractRef, ids.closureContractRef);
    assert.equal(basis.terminalPredicateRef, ids.judgmentPredicateRef);

    // R7: the exported GTL and validator owners reproduce exactly the
    // materialized graph and validation that ABG admitted for this basis.
    assert.deepEqual(basis.rawInputValue, EXPECTED_INPUT);
    assert.equal(materialization.basisEvents.length, 1);
    assert.equal(materialization.basisEvents[0].eventId, basisEvent.eventId);
    assert.equal(materialization.graph.materializationRef, basis.graphRef);
    assert.equal(materialization.graph.materializationDigest, basis.graphDigest);
    assert.equal(materialization.graph.graphFunctionDigest, basis.graphFunctionDigest);
    assert.equal(materialization.graph.invocationAdmissionRef, invocation.invocationAdmissionRef);
    assert.equal(materialization.graphValidation.kind, "graph_validation", JSON.stringify(materialization.graphValidation));
    assert.equal(materialization.graphValidation.validationRef, basis.graphValidationRef);
    assert.equal(materialization.graphValidation.graphRef, basis.graphRef);
    assert.equal(materialization.graphValidation.programValidationRef, basis.programValidationRef);
    assert.equal(materialization.graphValidation.invocationAdmissionRef, invocation.invocationAdmissionRef);

    // R8: HoG is entered through the installed CLI and the Public invocation.
    assert.equal(execution.exit.code, 0);
    assert.equal(execution.stderr, "");
    assert.equal(receipt.failure, null);
    assert.equal(receipt.invocationRef, call.invocation.invocationRef);
    assert.equal(receipt.definitionKey, call.invocation.definitionKey);
    const publicOperationEventRef = only(invocationEvent.causationEventRefs, "invocation cause");
    assert.ok(ordinal(publicOperationEventRef) !== -1 && ordinal(publicOperationEventRef) < ordinal(invocationEvent.eventId));
    const runEvent = (kind) => only(events.filter((event) => event.kind === kind && event.runId === run.ref), kind);
    const opened = runEvent("c_call_opened");
    assert.equal(opened.basisId, basis.basisRef);
    assert.equal(opened.graphFunctionRef, ids.graphFunctionRef);
    assert.equal(opened.materializationRef, basis.graphRef);
    assert.ok(ordinal(basisEvent.eventId) > ordinal(invocationEvent.eventId) && ordinal(opened.eventId) > ordinal(basisEvent.eventId));

    // R9: ABG admits the one causal C-call, evidence, result, judgment and
    // closure chain of this Run, joined by identity and causation.
    const cCallRef = opened.aggregateId;
    const fibre = runEvent("c_call_fibre_selected");
    const evidence = runEvent("c_call_evidenced");
    const admittedResult = runEvent("c_call_result_admitted");
    const judged = runEvent("c_call_judged");
    const terminalReached = runEvent("terminal_reached");
    const frameClosed = runEvent("frame_closed");
    const graphCallClosed = runEvent("graph_call_closed");
    const runClosed = runEvent("run_closed");
    const chain = [opened, fibre, evidence, admittedResult, judged, terminalReached, frameClosed, graphCallClosed, runClosed];
    assert.deepEqual(chain.map((event) => ordinal(event.eventId)), chain.map((event) => ordinal(event.eventId)).toSorted((a, b) => a - b));
    assert.equal(new Set(chain.map((event) => event.eventId)).size, chain.length);
    for (const event of chain) {
      assert.equal(event.basisId, basis.basisRef, `${event.kind} basis`);
      assert.deepEqual(event.causationEventRefs.filter((eventRef) => !byId.has(eventRef)), [], `${event.kind} causes are admitted`);
    }
    for (const event of [fibre, evidence, admittedResult, judged]) assert.equal(event.aggregateId, cCallRef, `${event.kind} C-call`);
    assert.equal(fibre.causationEventRefs.includes(opened.eventId), true);
    assert.equal(ancestors(evidence).has(opened.eventId), true);
    assert.equal(admittedResult.payload.evidenceRefs.includes(evidence.payload.evidenceRef), true);
    assert.equal(ancestors(admittedResult).has(evidence.eventId), true);
    assert.equal(admittedResult.payload.cCallRef, cCallRef);
    assert.equal(admittedResult.eventId, result.eventId);
    assert.equal(judged.causationEventRefs.includes(admittedResult.eventId), true);
    assert.equal(judged.payload.cCallRef, cCallRef);
    assert.equal(judged.payload.resultRef, admittedResult.payload.resultRef);
    assert.equal(judged.payload.resultDigest, admittedResult.payload.resultDigest);
    assert.equal(judged.payload.judgment, "advance");
    assert.equal(judged.payload.contractRef, ids.judgmentContractRef);
    assert.equal(judged.payload.predicateRef, ids.judgmentPredicateRef);
    assert.equal(terminalReached.payload.cCallRef, cCallRef);
    assert.equal(terminalReached.payload.resultRef, admittedResult.payload.resultRef);
    assert.equal(terminalReached.payload.judgmentRef, judged.payload.judgmentRef);
    assert.equal(terminalReached.payload.closureContractRef, ids.closureContractRef);
    assert.equal(ancestors(terminalReached).has(judged.eventId), true);
    assert.equal(frameClosed.payload.terminalReachedEventRef, terminalReached.eventId);
    assert.equal(frameClosed.causationEventRefs.includes(terminalReached.eventId), true);
    assert.equal(graphCallClosed.payload.frameClosedEventRef, frameClosed.eventId);
    assert.equal(graphCallClosed.causationEventRefs.includes(frameClosed.eventId), true);
    assert.equal(runClosed.payload.graphCallClosedEventRef, graphCallClosed.eventId);
    assert.equal(runClosed.causationEventRefs.includes(graphCallClosed.eventId), true);
    assert.equal(runClosed.aggregateId, run.ref);
    assert.equal(runClosed.payload.runId, run.ref);
    assert.deepEqual([...new Set(events.map((event) => event.kind).filter((kind) => NON_ROOT_EVENT_KIND.test(kind)))], [],
      "no refusal, gap, hold, block, continuation or failure is admitted");

    // R10: the initial CLI result and two fresh reads derive the same admitted
    // typed terminal Result of this Run, and replay is closed.
    const startValue = receipt.ownerOutput.value;
    const [resultRead, replayRead] = reads;
    const resultValue = resultRead.receipt.ownerOutput.value;
    const replayValue = replayRead.receipt.ownerOutput.value;
    assert.equal(startValue.disposition, "completed");
    assert.equal(startValue.stop ?? null, null);
    assert.equal(startValue.gap ?? null, null);
    assert.deepEqual(coordinate(startValue.run), coordinate(run));
    assert.equal(resultValue.projection.kind, "run_result_projection");
    assert.equal(replayValue.projection.kind, "run_replay_projection");
    assert.equal(replayValue.projection.status, "closed");
    assert.equal(replayValue.projection.fromOrdinal, 0);
    assert.equal(replayValue.projection.limit, 4096);
    const terminals = [["cli", startValue.terminalResult], ["run_result", resultValue.projection.terminalResult],
      ["run_replay", replayValue.projection.terminalResult]];
    for (const [label, terminal] of terminals) {
      assert.equal(terminal?.kind, "abg_typed_terminal_result", label);
      assert.equal(terminal.producer.runRef, run.ref, `${label} Run`);
      assert.equal(terminal.producer.graphCallRef, graphCallClosed.aggregateId, `${label} GraphCall`);
      assert.equal(terminal.producer.invocationAdmissionRef, invocation.invocationAdmissionRef, `${label} invocation`);
      assert.deepEqual(coordinate(terminal.producer.executionBasis), { ref: basis.basisRef, digest: basis.basisDigest }, `${label} basis`);
      assert.equal(terminal.producer.program.ref, ids.programRef, `${label} Program`);
      assert.equal(terminal.producer.graphFunction.ref, ids.graphFunctionRef, `${label} GraphFunction`);
      assert.equal(terminal.producer.cCallRef, cCallRef, `${label} C-call`);
      assert.equal(terminal.producer.resultAdmissionEventRef, admittedResult.eventId, `${label} result event`);
      assert.equal(terminal.producer.judgmentRef, judged.payload.judgmentRef, `${label} judgment`);
      assert.equal(terminal.producer.judgmentAdmissionEventRef, judged.eventId, `${label} judgment event`);
      assert.equal(terminal.producer.terminalRoute.ref, terminalReached.payload.routeRef, `${label} terminal route`);
      assert.deepEqual(coordinate(terminal.result), { ref: admittedResult.payload.resultRef, digest: admittedResult.payload.resultDigest },
        `${label} result`);
      assert.equal(terminal.contract.ref, ids.outputContractRef, `${label} contract`);
      assert.equal(terminal.valueKind, "hello_world_output", `${label} value kind`);
      assert.equal(terminal.valueDigest, admittedResult.payload.valueDigest, `${label} value digest`);
      assert.deepEqual(terminal.value, admittedResult.payload.value, `${label} admitted value`);
      assert.equal(evaluateLanguageTestResult(EXPECTED_INPUT, terminal.value), true, `${label} independent oracle`);
    }
    const terminalBody = ({ projectionBasis: _projectionBasis, ...body }) => product.canonicalJson(body);
    assert.equal(terminalBody(resultValue.projection.terminalResult), terminalBody(startValue.terminalResult));
    assert.equal(terminalBody(replayValue.projection.terminalResult), terminalBody(startValue.terminalResult));
    assert.deepEqual(coordinate(startValue.result), coordinate(startValue.terminalResult.result));
    assert.deepEqual(coordinate(resultValue.projection.result), coordinate(startValue.terminalResult.result));
    for (const read of reads) {
      const { projection } = read.receipt.ownerOutput.value;
      assert.deepEqual(coordinate(read.receipt.ownerOutput.value.source), coordinate(run), `${read.memberKey} source`);
      assert.deepEqual(coordinate(projection.subject), coordinate(run), `${read.memberKey} names the Run`);
      assert.deepEqual(coordinate(projection.terminalResult.projectionBasis),
        { ref: handoff.prefix.eventLogRef, digest: handoff.prefix.coordinateDigest }, `${read.memberKey} selected durable prefix`);
      assert.deepEqual(read.receipt.resources.eventResource.closeHandoff.prefix, handoff.prefix, `${read.memberKey} prefix preserved`);
      assert.equal(read.execution.stderr, "", `${read.memberKey} stderr`);
    }
  } catch (error) {
    primary = error;
  }
  const captureFailure = await capture.close(primary);
  if (primary !== null) {
    if (captureFailure !== null) context.diagnostic(`secondary episode capture failure: ${captureFailure.stack ?? captureFailure}`);
    throw primary;
  }
  if (captureFailure !== null) throw captureFailure;
});
