// T-217 Phase 2 S2.1 — operator-command-to-admitted-event conformance
// (the WITNESS-013 tail, for the reference adapter). One fixture
// workspace, one persisted event log, a full operator session through
// the grammar: the run halts on drift, the operator observes, triages
// intake, ratifies the reprice, marks lifecycle, and attests — every
// act a typed command, every command admitted events in the REAL log.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { runAbiogenesisCli } from "../../build/semantic/code/src/cli/command.js";
import { runEngineStart } from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";
import {
  t217Declaration,
  t217StartupConfig
} from "./support/t217-witness-fixtures.mjs";

function fixtureWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "t217-grammar-"));
  const stateRoot = path.join(root, ".ai-workspace");
  const eventLogPath = path.join(stateRoot, "events", "events.jsonl");
  mkdirSync(path.join(stateRoot, "events"), { recursive: true });
  mkdirSync(path.join(root, ".abiogenesis"), { recursive: true });
  const binding = {
    kind: "abg_toolchain_workspace_binding",
    schemaVersion: "2",
    targetRoot: root,
    toolchainRoot: path.join(root, ".toolchain"),
    selectionSource: "workspace_binding",
    bindingPath: path.join(root, ".abiogenesis", "toolchain-binding.json"),
    products: [],
    mutableStateRoots: {
      observedWorkspaceRoot: root,
      observerStateRoot: path.join(stateRoot, "observer"),
      executorStateRoot: path.join(stateRoot, "executor"),
      eventRoot: path.join(stateRoot, "events"),
      eventLogPath,
      runtimeRoot: path.join(stateRoot, "runtime"),
      projectionRoot: path.join(stateRoot, "projections"),
      archiveRoot: path.join(stateRoot, "archives")
    }
  };
  writeFileSync(
    binding.bindingPath,
    `${JSON.stringify(binding, null, 2)}\n`,
    "utf8"
  );
  return { root, eventLogPath };
}

function seedHaltedRun(eventLogPath) {
  const namespace = "t217/grammar";
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const startup = (marker) => ({
    systemDeclarations: [],
    productStartupConfig: t217StartupConfig({ namespace }),
    productDeclarations: [
      t217Declaration({
        namespace,
        contentMarker: marker,
        graphFunctionRef: executive.id
      })
    ],
    correlationId: `correlation://${namespace}/${marker}`
  });
  const events = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: startup("content-v1")
  });
  // a lawful resume on the unchanged substrate stamps segment 1, so the
  // observer's segment view has real rows
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...events],
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: startup("content-v1")
  });
  // the silent drift LAST: the S1 guard halts this resume — the decisive
  // terminal is the gap_stop the operator session below responds to
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...events],
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: startup("content-v2")
  });
  writeFileSync(
    eventLogPath,
    events.map((event) => JSON.stringify(event)).join("\n") + "\n",
    "utf8"
  );
  const admittedV1 = events.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  return { admittedV1 };
}

function cliIo(root) {
  const out = [];
  const err = [];
  return {
    io: {
      cwd: () => root,
      stdout: (text) => out.push(text),
      stderr: (text) => err.push(text)
    },
    lastJson: () => JSON.parse(out[out.length - 1]),
    err
  };
}

function logKinds(eventLogPath) {
  return readFileSync(eventLogPath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

test("T-217 S2.1: a full operator session through the grammar — every act a command, every command admitted events in the persisted log", async () => {
  const { root, eventLogPath } = fixtureWorkspace();
  const { admittedV1 } = seedHaltedRun(eventLogPath);
  const ws = ["--workspace", root];

  // observe report: the operator SEES the halt from the real log
  let ctx = cliIo(root);
  assert.equal(await runAbiogenesisCli(["observe", "report", ...ws], ctx.io), 0);
  const report = ctx.lastJson().report;
  assert.equal(report.halted, true);
  assert.match(report.halt_reason, /declaration_reprice_required/u);
  assert.equal(report.citability.citable, false);

  // intake: the halt is triaged through the grammar
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      [
        "witness", "intake", ...ws,
        "--owner", "specification/requirements + owning ticket",
        "--change-class", "requirement_reprice",
        "--re-entry", "requirements",
        "--summary", "resumed substrate drift without covering reprice",
        "--triaged-by", "operator://jim"
      ],
      ctx.io
    ),
    0
  );
  assert.match(ctx.lastJson().ref, /^defect-intake:/u);

  // reprice: the ratification, through the grammar — the operator reads
  // the halt's declaration and ratifies with digests from admitted truth
  // (v1) and the intended content (v2)
  const v2 = (await import(
    "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js"
  )).admitGtlLibraryEntryDeclaration({
    declaration: t217Declaration({
      namespace: "t217/grammar",
      contentMarker: "content-v2",
      graphFunctionRef: admittedV1.graphFunctionRef
    }),
    correlationId: "correlation://t217/grammar/expected-v2"
  });
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      [
        "witness", "reprice", ...ws,
        "--declaration-ref", admittedV1.declarationRef,
        "--before-digest", admittedV1.declarationDigest,
        "--after-digest", v2.declarationDigest,
        "--change-class", "requirement_reprice",
        "--ticket", "ticket://T-217",
        "--actor", "operator://jim",
        "--reason", "ratified declaration change through the grammar"
      ],
      ctx.io
    ),
    0
  );
  const repriceOut = ctx.lastJson();
  assert.match(repriceOut.ref, /^declaration-reprice:/u);
  assert.equal(repriceOut.frozen_law.frozenLaw, false);

  // lifecycle: resume marked through the grammar
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      [
        "witness", "run-resumed", ...ws,
        "--actor", "operator://jim",
        "--reason-kind", "reprice_reentry",
        "--reason", "continuing after ratified reprice"
      ],
      ctx.io
    ),
    0
  );

  // hygiene: an instrument measurement through the grammar (the observed
  // surface is untracked in this run — lawful, never taints)
  const observationsPath = path.join(root, "observations.json");
  writeFileSync(
    observationsPath,
    JSON.stringify([
      { artifactRef: "artifact://t217/grammar/report", observedDigest: "digest-x" }
    ]),
    "utf8"
  );
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      [
        "witness", "hygiene-stamp", ...ws,
        "--observed-by", "operator://jim/digest-instrument",
        "--observations", observationsPath
      ],
      ctx.io
    ),
    0
  );
  assert.match(ctx.lastJson().ref, /^workspace-hygiene:/u);

  // grammar rejections are typed commands too
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(["witness", "vibe-check", ...ws], ctx.io),
    1
  );
  assert.match(ctx.lastJson().reason, /witness requires an act/u);
  ctx = cliIo(root);
  assert.equal(await runAbiogenesisCli(["observe", "vibes", ...ws], ctx.io), 1);
  assert.match(ctx.lastJson().reason, /observe requires the report subcommand/u);

  // lifecycle: the operator marks the stop, through the grammar
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      [
        "witness", "run-stopped", ...ws,
        "--actor", "operator://jim",
        "--reason-kind", "operator_stop",
        "--reason", "session checkpoint after ratification"
      ],
      ctx.io
    ),
    0
  );

  // attest: the record is sealed, through the grammar
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(
      ["witness", "attest", ...ws, "--actor", "operator://jim/instrument"],
      ctx.io
    ),
    0
  );
  assert.match(ctx.lastJson().ref, /^replay-attestation:/u);

  // THE CONFORMANCE LAW: every operator act above is an ADMITTED,
  // actor-attributed event in the PERSISTED log — no unlogged act exists
  const persisted = logKinds(eventLogPath);
  const kinds = persisted.map((event) => event.kind);
  for (const kind of [
    "defect_intake_admitted",
    "declaration_reprice_admitted",
    "run_resumed",
    "workspace_hygiene_stamped",
    "run_stopped",
    "replay_log_attested"
  ]) {
    assert.ok(kinds.includes(kind), `${kind} must be in the persisted log`);
  }
  for (const event of persisted.filter((event) =>
    ["defect_intake_admitted", "declaration_reprice_admitted", "run_stopped", "replay_log_attested"].includes(event.kind)
  )) {
    assertRuntimeEvent(event);
    assert.ok(event.eventId, "operator acts are canonical replay truth");
  }

  // and the observer's view reflects the session: attestation verified
  ctx = cliIo(root);
  assert.equal(await runAbiogenesisCli(["observe", "report", ...ws], ctx.io), 0);
  const finalReport = ctx.lastJson().report;
  assert.equal(finalReport.attestations.length, 1);
  assert.equal(finalReport.attestations[0].verified, true);
  assert.ok(finalReport.segments.length >= 1, "segments render in the report");
});
