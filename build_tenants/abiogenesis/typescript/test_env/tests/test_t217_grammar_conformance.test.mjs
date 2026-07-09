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
import {
  applyDeclaredTransportSteering,
  narrowRegistryStartupToSessionAllowlist,
  runAbiogenesisCli
} from "../../build/semantic/code/src/cli/command.js";
import { contractForKnownAgent } from "../../build/semantic/code/src/shared/abg_library/transport_contracts.js";
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

// ---------------------------------------------------------------------------
// S2.1b — WITNESS-015: the session allowlist is a narrowing-only view
// restriction over the binding-declared catalog, supplied through the
// operator grammar.
// ---------------------------------------------------------------------------

function allowlistBinding({ enabledLibraryRefs, declarations }) {
  const namespace = "t217/allow";
  return {
    module: { moduleRef: "module://t217/allow" },
    runtimeIdentity: { resolvedRuntimeRef: "runtime://t217/allow" },
    resolvedPolicy: { resolvedPolicyBundleRef: "policy://t217/allow" },
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: {
        ...t217StartupConfig({ namespace }),
        enabledLibraryRefs
      },
      productDeclarations: declarations,
      correlationId: "correlation://t217/allow"
    }
  };
}

test("T-217 S2.1 (WITNESS-015): --allow narrows the declared catalog — by entry ref, declaration ref, and source ref; undefined leaves the binding untouched", () => {
  const namespace = "t217/allow";
  const alpha = t217Declaration({ namespace, subject: "alpha", contentMarker: "v1" });
  const beta = t217Declaration({ namespace, subject: "beta", contentMarker: "v1" });
  const binding = allowlistBinding({
    enabledLibraryRefs: [],
    declarations: [alpha, beta]
  });

  // undefined allow: the binding's own view governs — same object, no copy
  assert.equal(narrowRegistryStartupToSessionAllowlist(binding, undefined), binding);

  // narrow by entry ref: beta is OUT of the session's view
  const byEntry = narrowRegistryStartupToSessionAllowlist(binding, [alpha.entryRef]);
  assert.deepEqual(
    byEntry.runtimeRegistryStartup.productDeclarations.map((d) => d.entryRef),
    [alpha.entryRef]
  );
  // narrow by declaration ref
  const byDeclaration = narrowRegistryStartupToSessionAllowlist(binding, [
    beta.declarationRef
  ]);
  assert.deepEqual(
    byDeclaration.runtimeRegistryStartup.productDeclarations.map((d) => d.entryRef),
    [beta.entryRef]
  );
  // a shared declaration-source ref covers every declaration it sources
  const bySource = narrowRegistryStartupToSessionAllowlist(binding, [
    `gtl://module/${namespace}`
  ]);
  assert.equal(bySource.runtimeRegistryStartup.productDeclarations.length, 2);
});

test("T-217 S2.1 (WITNESS-015): violations fail closed as typed grammar rejections — widening, phantom refs, and a binding with no catalog", () => {
  const namespace = "t217/allow";
  const alpha = t217Declaration({ namespace, subject: "alpha", contentMarker: "v1" });
  const beta = t217Declaration({ namespace, subject: "beta", contentMarker: "v1" });

  // the binding already restricts the view to alpha; allowing beta WIDENS
  const restricted = allowlistBinding({
    enabledLibraryRefs: [alpha.entryRef],
    declarations: [alpha, beta]
  });
  assert.throws(
    () => narrowRegistryStartupToSessionAllowlist(restricted, [beta.entryRef]),
    /narrowing-only/u
  );

  // a ref matching nothing declared is a phantom, not a silent no-op
  const open = allowlistBinding({
    enabledLibraryRefs: [],
    declarations: [alpha, beta]
  });
  assert.throws(
    () =>
      narrowRegistryStartupToSessionAllowlist(open, [
        "registry-entry://t217/allow/phantom"
      ]),
    /match no declared catalog entry/u
  );

  // --allow with no binding-declared catalog: nothing to narrow
  assert.throws(
    () =>
      narrowRegistryStartupToSessionAllowlist(
        { module: {}, runtimeIdentity: {}, resolvedPolicy: {} },
        [alpha.entryRef]
      ),
    /no declared catalog to narrow/u
  );
});

test("T-217 S2.1 (WITNESS-015): the allow grammar itself is closed — empty and duplicate refs are typed command rejections", async () => {
  const { root } = fixtureWorkspace();
  const startArgs = (allow) => [
    "start", "--workspace", root,
    "--scope", "t217", "--target", "next", "--until", "converged",
    "--allow", allow
  ];
  let ctx = cliIo(root);
  assert.equal(await runAbiogenesisCli(startArgs(""), ctx.io), 1);
  assert.match(ctx.lastJson().reason, /non-empty refs/u);
  ctx = cliIo(root);
  assert.equal(
    await runAbiogenesisCli(startArgs("ref://a,ref://a"), ctx.io),
    1
  );
  assert.match(ctx.lastJson().reason, /must be unique/u);
});

test("T-217 S2.1 (WITNESS-015 + C-7 wiring): start carries --allow and --codex-model through the REAL command path — the loaded binding's catalog is what the allowlist narrows", async () => {
  const { root, eventLogPath } = fixtureWorkspace();
  seedHaltedRun(eventLogPath);
  // an app-owned runtime binding whose registry startup declares the
  // catalog (open view), importing the same support fixtures this test
  // uses so module/identity/policy shapes are the real ones
  const supportUrl = (name) =>
    new URL(`./support/${name}`, import.meta.url).href;
  writeFileSync(
    path.join(root, ".abiogenesis", "typescript-runtime.mjs"),
    [
      `import { buildThreeStageStartContext } from ${JSON.stringify(supportUrl("m03-iteration-fixtures.mjs"))};`,
      `import { t217Declaration, t217StartupConfig } from ${JSON.stringify(supportUrl("t217-witness-fixtures.mjs"))};`,
      `const { context, executive } = buildThreeStageStartContext({ defaultRegime: "F_P" });`,
      `export const runtimeBinding = {`,
      `  module: context.module,`,
      `  runtimeIdentity: context.runtimeIdentity,`,
      `  resolvedPolicy: context.resolvedPolicy,`,
      `  runtimeRegistryStartup: {`,
      `    systemDeclarations: [],`,
      `    productStartupConfig: { ...t217StartupConfig({ namespace: "t217/grammar" }), enabledLibraryRefs: [] },`,
      `    productDeclarations: [t217Declaration({ namespace: "t217/grammar", contentMarker: "content-v1", graphFunctionRef: executive.id })],`,
      `    correlationId: "correlation://t217/grammar/binding"`,
      `  }`,
      `};`,
      ``
    ].join("\n"),
    "utf8"
  );
  const savedModel = process.env.ABG_TS_CODEX_MODEL;
  try {
    const ctx = cliIo(root);
    const exitCode = await runAbiogenesisCli(
      [
        "start", "--workspace", root,
        "--scope", "t217", "--target", "next", "--until", "converged",
        "--allow", "registry-entry://t217/grammar/phantom",
        "--codex-model", "declared-model"
      ],
      ctx.io
    );
    // the phantom ref fails closed INSIDE the narrowing law, which proves
    // the parsed allow list met the LOADED binding's declared catalog
    assert.equal(exitCode, 1);
    assert.match(ctx.lastJson().reason, /match no declared catalog entry/u);
    // and the declared codex argument was applied by the same command path
    assert.equal(process.env.ABG_TS_CODEX_MODEL, "declared-model");
  } finally {
    if (savedModel === undefined) {
      delete process.env.ABG_TS_CODEX_MODEL;
    } else {
      process.env.ABG_TS_CODEX_MODEL = savedModel;
    }
  }
});

test("T-217 S2.1 (C-7): codex model/sandbox are declared start arguments — the declared value wins over ambient environment in the transport contract", () => {
  const savedModel = process.env.ABG_TS_CODEX_MODEL;
  const savedSandbox = process.env.ABG_TS_CODEX_SANDBOX;
  try {
    process.env.ABG_TS_CODEX_MODEL = "ambient-model";
    delete process.env.ABG_TS_CODEX_SANDBOX;

    // ambient only: env steers (rule 11 bootstrap ingress), sandbox defaults
    let args = contractForKnownAgent("codex").argsTemplate;
    assert.ok(args.includes("ambient-model"));
    assert.ok(args.includes("--full-auto"));

    // declared arguments overwrite the ambient binding for this run
    applyDeclaredTransportSteering({
      codexModel: "declared-model",
      codexSandbox: "workspace-write"
    });
    args = contractForKnownAgent("codex").argsTemplate;
    assert.ok(args.includes("declared-model"));
    assert.equal(args.includes("ambient-model"), false);
    const sandboxAt = args.indexOf("--sandbox");
    assert.notEqual(sandboxAt, -1);
    assert.equal(args[sandboxAt + 1], "workspace-write");
    assert.equal(args.includes("--full-auto"), false);

    // omitted declared arguments leave the standing binding untouched
    applyDeclaredTransportSteering({ codexModel: undefined, codexSandbox: undefined });
    args = contractForKnownAgent("codex").argsTemplate;
    assert.ok(args.includes("declared-model"));
  } finally {
    if (savedModel === undefined) {
      delete process.env.ABG_TS_CODEX_MODEL;
    } else {
      process.env.ABG_TS_CODEX_MODEL = savedModel;
    }
    if (savedSandbox === undefined) {
      delete process.env.ABG_TS_CODEX_SANDBOX;
    } else {
      process.env.ABG_TS_CODEX_SANDBOX = savedSandbox;
    }
  }
});
