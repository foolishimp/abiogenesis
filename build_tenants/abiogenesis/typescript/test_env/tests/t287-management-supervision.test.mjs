import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as Effect from "effect/Effect";
import test from "node:test";
import { createWorkerTransportOutputObserver, observeWorkerTransportOutput, runWorkerTransport } from "../../build/code/src/abg/worker_transport.js";
import { constructKnownWorkerTransportContract } from "../../build/code/src/abg/transport_contracts.js";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { nativePublications } from "../support/d2-frame-fixture.mjs";
import { prepareGenericJobIntakeProduct, constructGenericIntakeStart, ordinaryJob } from "../support/t287-generic-job-intake.mjs";
import { genericLifecyclePublicationData } from "../support/t287-generic-job-lifecycle.mjs";
import { readSupervisionThroughFreshPublic } from "../fixtures/t287-management-supervision/fresh-public-read.mjs";

const root = resolve(import.meta.dirname, "../..");
const fixtures = join(root, "test_env/fixtures/t287-management-supervision");
const row = value => JSON.stringify(value) + "\n";

test("six retained real CLI retry rows remain six retries and zero progress", async () => {
  // Exact original lines 2-7 of abi-testing-reuse-proof-45CHcb/workspace/archives/
  // fp-dc60f439ad939d62-stdout.log; provenance and digests are in supervision.md.
  const bytes = await readFile(join(fixtures, "retained-api-retry.jsonl"), "utf8");
  const observed = observeWorkerTransportOutput("claude_stream_json", bytes, true);
  assert.equal(observed.structuredEventCount, 6);
  assert.equal(observed.apiRetryCount, 6);
  assert.equal(observed.progressEventCount, 0);
  assert.equal(observed.finalOutput, "");
});

test("actual CLI retry row shape is counted without progress; partial tools await their complete message", () => {
  const text = [
    { type: "system", subtype: "init" },
    { type: "system", subtype: "api_retry", attempt: 1, max_retries: 6 },
    { type: "api_retry" },
    { type: "rate_limit_event", rate_limit_info: { status: "allowed" } },
    { type: "stream_event", event: { type: "content_block_start", content_block: { type: "tool_use", id: "toolu_one", name: "Bash", input: {} } } },
    { type: "stream_event", event: { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: '{"command":"true"}' } } },
    { type: "assistant", message: { content: [{ type: "tool_use", id: "toolu_one", name: "Bash", input: { command: "true" } }] } },
    { type: "result", subtype: "success", result: '{"message":"α"}' },
  ].map(row).join("");
  const expected = observeWorkerTransportOutput("claude_stream_json", text, true);
  assert.equal(expected.apiRetryCount, 2);
  assert.equal(expected.progressEventCount, 3);
  assert.equal(expected.toolCallCount, 1);
  assert.equal(expected.toolInvocations[0].toolUseRef, "toolu_one");
  for (const width of [1, 7, 103, text.length]) {
    const observer = createWorkerTransportOutputObserver(true);
    for (let index = 0; index < text.length; index += width) observer.observe(text.slice(index, index + width));
    assert.deepEqual(observer.finish(), expected);
  }
  assert.equal(observeWorkerTransportOutput("claude_stream_json", row({ type: "system", subtype: "thinking_tokens",
    estimated_tokens: 50, estimated_tokens_delta: 50 }), false).progressEventCount, 1,
  "an actual progress report remains observable, without treating silent generation as progress");
});

test("prompt and both stream archives survive supervisor SIGKILL before process completion", { timeout: 10000 }, async () => {
  const scratch = await mkdtemp(join(tmpdir(), "t287-archive-"));
  const child = spawn(process.execPath, [join(fixtures, "archive-supervisor.mjs"), scratch], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
  let actorPid;
  let stderr = "";
  child.stderr.setEncoding("utf8"); child.stderr.on("data", chunk => { stderr += chunk; });
  try {
    await new Promise((resolveReady, reject) => {
      const seen = new Set();
      child.on("message", message => {
        if (message.kind === "started") actorPid = message.pid;
        seen.add(message.kind);
        if (["started", "stdout", "stderr"].every(kind => seen.has(kind))) resolveReady();
      });
      child.once("exit", code => reject(new Error(`supervisor exited ${code}: ${stderr}`)));
    });
    assert.equal(await readFile(join(scratch, "interrupted-prompt.txt"), "utf8"), "retain this prompt");
    assert.equal(await readFile(join(scratch, "interrupted-stdout.log"), "utf8"), "retained output α\n");
    const exited = once(child, "exit"); child.kill("SIGKILL"); await exited;
    assert.equal(await readFile(join(scratch, "interrupted-stdout.log"), "utf8"), "retained output α\n");
    assert.equal(await readFile(join(scratch, "interrupted-stderr.log"), "utf8"), "retained diagnostic\n");
    await assert.rejects(readFile(join(scratch, "interrupted-transport.json")), { code: "ENOENT" });
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    if (actorPid !== undefined) { try { process.kill(process.platform === "win32" ? actorPid : -actorPid, "SIGKILL"); } catch {} }
  }
});

test("retry-only process rows remain archived without renewing the observer lease", { timeout: 10000 }, async () => {
  const scratch = await mkdtemp(join(tmpdir(), "t287-retry-"));
  const parser = createWorkerTransportOutputObserver(false);
  let prior = 0;
  const result = await runWorkerTransport({ contract: constructKnownWorkerTransportContract("claude", {
    command: process.execPath, prefixArgs: [join(fixtures, "process-worker.mjs")], environment: {},
  }), prompt: "no model", lane: "closed_prompt_proof", cwd: scratch, archiveRoot: scratch, label: "retry",
  timeoutMs: 180, absoluteTimeoutMs: 1200, terminationGraceMs: 50,
  environment: { T287_SUPERVISION_MODE: "retries" }, observer: { onStdoutObserved(chunk) {
    const observed = parser.observe(chunk); const progress = observed.progressEventCount > prior; prior = observed.progressEventCount; return progress;
  } } });
  assert.equal(result.timeoutClass, "inactivity");
  assert.ok(result.apiRetryCount > 0);
  assert.equal(result.progressEventCount, 0);
  assert.equal(result.failureClass, "transport_failure");
  assert.equal(await readFile(result.artifacts.stdout.path, "utf8"), result.stdout);
});

test("native unknown coverage preserves a silent actor until hard cap; blocked child reaches Public unchanged", { timeout: 600000 }, async () => {
  const environment = await setupInstalledRootCatalog({ after() {} }, root, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareGenericJobIntakeProduct({ ...basis, declarationFactory: genericLifecyclePublicationData })],
  });
  const { product, gtl, abg } = environment;
  const publication = environment.additionalPublications[0];
  environment.catalog = product.admitGraphFunctionCatalog({ workspaceBinding: environment.bindingCandidate, resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts, installedProducts: environment.installCandidates,
    publications: [...nativePublications(gtl, environment.verified), publication] });
  assert.equal(environment.catalog.kind, "graph_function_catalog");
  environment.catalogView = product.narrowGraphFunctionCatalog(environment.catalog, publication.programs[0].callableMembership);
  const publicApi = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  let closed = environment.store.projectReopenAuthorityAndClose();
  const command = join(environment.scratch, "semantic-worker.mjs");
  await writeFile(command, await readFile(join(fixtures, "semantic-worker.mjs")), { flag: "wx" }); await chmod(command, 0o755);
  for (const mode of ["blocked", "hard_cap"]) {
    const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: closed, handoffDigest: product.sha256Canonical(closed) };
    const input = ordinaryJob(product, gtl, "Build a program that prints Hello World and an independent verifier.");
    const { call } = await constructGenericIntakeStart({ environment, publicApi, eventResource, input, identity: "supervision-" + mode });
    await writeFile(join(environment.scratch, mode + "-call.json"), JSON.stringify(call, null, 2) + "\n", { flag: "wx" });
    const settings = { ABG_TS_CLAUDE_COMMAND: command, ABG_TS_FP_TIMEOUT_MS: "100", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: mode === "hard_cap" ? "600" : "5000",
      ABG_TS_FP_TERMINATION_GRACE_MS: "50", T287_SUPERVISION_MODE: mode };
    const prior = Object.fromEntries(Object.keys(settings).map(key => [key, process.env[key]]));
    Object.assign(process.env, settings);
    let outcome;
    try { outcome = await Effect.runPromise(product.RUN_DEFINITION_BINDINGS.invoke.start(call)); }
    finally { for (const [key, value] of Object.entries(prior)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
    await writeFile(join(environment.scratch, mode + "-outcome.json"), JSON.stringify(outcome, null, 2) + "\n", { flag: "wx" });
    assert.equal(outcome.ownerOutput.outcomeKind, "result", JSON.stringify(outcome));
    closed = outcome.resources.eventResource.closeHandoff;
    const events = abg.readRuntimeEventsAtDurablePrefix(closed.prefix).filter(event => event.runId === outcome.ownerOutput.value.run.ref);
    const probes = events.filter(event => event.kind === "runtime_activity_probe_observed");
    for (const source of ["structured_output", "tool_progress", "api_progress", "archive", "result_artifact"]) {
      assert.ok(probes.some(event => event.payload.probeContract.source === source && event.payload.observation.coverage === "unavailable"), `missing unavailable ${source}`);
    }
    const timeouts = events.filter(event => event.kind === "actor_process_timeout_observed");
    if (mode === "blocked") {
      assert.equal(timeouts.length, 0);
      assert.equal(events.filter(event => event.kind === "actor_invocation_closed").length, 2);
      assert.equal(events.filter(event => event.kind === "child_foldback_admitted" && event.payload.childDisposition === "blocked").length, 1);
      assert.equal(outcome.ownerOutput.value.disposition, "blocked", JSON.stringify(outcome.ownerOutput));
      assert.ok(events.some(event => event.kind === "run_stopped" && event.payload.disposition === "blocked"));
    } else {
      assert.equal(timeouts.length, 1);
      assert.equal(timeouts[0].payload.timeoutClass, "absolute");
      assert.ok(events.some(event => event.kind === "runtime_external_interruption_observed"));
      assert.ok(events.some(event => event.kind === "c_call_result_admitted" && event.payload.value?.failureClass === "transport_failure"));
      assert.equal(events.some(event => event.kind === "c_call_result_admitted" && event.payload.value?.failureClass === "transport_relation_mismatch"), false);
      assert.equal(probes.some(event => event.payload.probeContract.scope.actorInvocationRef !== null &&
        event.payload.observation.signal === "artifact_rejected"), false, "absent actor output is not a rejected artifact");
    }
    // Follow admitted causation from the Public stop, not event co-presence.
    const byId = new Map(events.map(event => [event.eventId, event]));
    const causes = new Set();
    const visit = ref => { if (causes.has(ref)) return; causes.add(ref); for (const cause of byId.get(ref)?.causationEventRefs ?? []) visit(cause); };
    visit(outcome.ownerOutput.value.stop.ref);
    if (mode === "blocked") {
      const judged = events.find(event => event.kind === "c_call_judged" && event.payload.judgment === "blocked");
      assert.ok(judged && causes.has(judged.eventId), "Public block must reach the original child judgment");
    } else assert.ok(causes.has(timeouts[0].eventId), "Public failure must reach its actual hard-cap observation");
    const reads = await readSupervisionThroughFreshPublic({ scratch: environment.scratch, installedRoot: environment.installedRoot,
      artifactPath: environment.artifactPath, call, outcome, mode });
    assert.equal(reads.run_status.status, mode === "blocked" ? "blocked" : "failed");
    assert.equal(reads.run_replay.status, reads.run_status.status);
    console.log(JSON.stringify({ mode, scratch: environment.scratch, events: events.length, disposition: outcome.ownerOutput.value.disposition, paidCalls: 0 }));
  }
});
