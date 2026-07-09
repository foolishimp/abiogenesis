// T-217 Phase 4 — the tuner's deterministic half (TUNER-013's named
// obligations): draft admission and state transitions, F_H versus
// declared auto-ratify, annealing rejection without an equivalence
// contract, promotion rejection without cited signals, judgment
// separation, post-ratification divergence obligations, mode signals,
// cost rows, and the verb surface through the grammar (report read-only).
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  ABG_TUNER_MODULE_DECLARATIONS,
  constructTunerDraftAdmittedEvent,
  deriveConfigurationCostRows,
  deriveTunerDivergenceObligations,
  deriveTunerDraftStates,
  deriveTunerModeSignals
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  admitTunerDraft,
  admitTunerDraftDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { runAbiogenesisCli } from "../../build/semantic/code/src/cli/command.js";

const CAL_DRAFT = Object.freeze({
  proposalKind: "calibration",
  proposer: "tuner://abg/default-loop",
  affectedDeclarationRefs: ["gtl-declaration://t217/stage-contract"],
  beforeDigest: "sha256:before",
  afterDigest: "sha256:after",
  summary: "raise evaluate-stage timeout where retries burn on slow toolchains",
  correlationId: "correlation://t217/tuner/cal"
});

test("T-217 P4 (TUNER-004/-005): drafts admit, states transition draft->ratified|rejected by replay, decisions on phantom/settled drafts fail closed", () => {
  const sunk = [];
  const proposed = admitTunerDraft({
    eventSink: (event) => sunk.push(event),
    ...CAL_DRAFT
  });
  assert.match(proposed.draftRef, /^tuner-draft:/u);
  assert.equal(proposed.states[0].state, "draft");

  // F_H ratification (the default seat)
  const ratified = admitTunerDraftDecision({
    runtimeEvents: [...sunk],
    eventSink: (event) => sunk.push(event),
    draftRef: proposed.draftRef,
    decision: "ratify",
    ratifiedBy: "operator://jim"
  });
  assert.equal(ratified.states[0].state, "ratified");
  assert.equal(ratified.states[0].decidedBy, "operator://jim");

  // re-deciding a settled draft fails closed
  assert.throws(
    () =>
      admitTunerDraftDecision({
        runtimeEvents: [...sunk],
        eventSink: () => {},
        draftRef: proposed.draftRef,
        decision: "reject",
        rejectedBy: "operator://jim",
        reason: "too late"
      }),
    /already ratified/u
  );
  // deciding a phantom fails closed
  assert.throws(
    () =>
      admitTunerDraftDecision({
        runtimeEvents: [...sunk],
        eventSink: () => {},
        draftRef: "tuner-draft:phantom",
        decision: "ratify",
        ratifiedBy: "operator://jim"
      }),
    /not in replay/u
  );
});

test("T-217 P4 (TUNER-005): declared auto-ratify policy is lawful; ratification by omission or double authority is not", () => {
  const sunk = [];
  const proposed = admitTunerDraft({
    eventSink: (event) => sunk.push(event),
    ...CAL_DRAFT,
    summary: "auto-ratify path fixture",
    correlationId: "correlation://t217/tuner/auto"
  });
  const auto = admitTunerDraftDecision({
    runtimeEvents: [...sunk],
    eventSink: (event) => sunk.push(event),
    draftRef: proposed.draftRef,
    decision: "ratify",
    ratificationPolicyRef: "policy://abg/tuner/auto-ratify-calibration"
  });
  assert.equal(auto.states[0].state, "ratified");
  assert.equal(
    auto.states[0].decidedBy,
    "policy://abg/tuner/auto-ratify-calibration"
  );
  // by omission: unlawful (admitter law)
  const secondDraft = admitTunerDraft({
    eventSink: () => {},
    ...CAL_DRAFT,
    summary: "omission fixture",
    correlationId: "correlation://t217/tuner/omit"
  });
  assert.throws(
    () =>
      admitTunerDraftDecision({
        runtimeEvents: [...secondDraft.emittedEvents],
        eventSink: () => {},
        draftRef: secondDraft.draftRef,
        decision: "ratify"
      }),
    /exactly one of ratifiedBy/u
  );
});

test("T-217 P4 (TUNER-006/-010/-004): annealing without an equivalence contract, promotion without cited signals, and triage output inside an optimisation judgment all fail typed", () => {
  assert.throws(
    () =>
      admitTunerDraft({
        eventSink: () => {},
        ...CAL_DRAFT,
        proposalKind: "annealing",
        summary: "anneal the evaluate stage to an F_D interior"
      }),
    /annealing proposals require an equivalence contract/u
  );
  // with the contract, it admits
  const lawful = admitTunerDraft({
    eventSink: () => {},
    ...CAL_DRAFT,
    proposalKind: "annealing",
    equivalenceContractRef: "equivalence://t217/evaluate-stage",
    summary: "anneal the evaluate stage under an admitted equivalence contract"
  });
  assert.equal(lawful.states[0].proposalKind, "annealing");

  assert.throws(
    () =>
      admitTunerDraft({
        eventSink: () => {},
        ...CAL_DRAFT,
        proposalKind: "promotion",
        summary: "promote the declared interior"
      }),
    /must cite admitted signal rows/u
  );
  // judgment separation: diagnosis vocabulary in a tuner write
  assert.throws(
    () =>
      admitTunerDraft({
        eventSink: () => {},
        ...CAL_DRAFT,
        summary: "triage this defect intake as change_class requirement_reprice"
      }),
    /optimisation judgments carry no triage output/u
  );
});

test("T-217 P4 (TUNER-007): post-ratification divergence owes demotion + intake — derived, never silently absorbed", () => {
  const sunk = [];
  const proposed = admitTunerDraft({
    eventSink: (event) => sunk.push(event),
    ...CAL_DRAFT,
    proposalKind: "annealing",
    equivalenceContractRef: "equivalence://t217/diverge",
    summary: "annealing that later diverges"
  });
  admitTunerDraftDecision({
    runtimeEvents: [...sunk],
    eventSink: (event) => sunk.push(event),
    draftRef: proposed.draftRef,
    decision: "ratify",
    ratifiedBy: "operator://jim"
  });
  const obligations = deriveTunerDivergenceObligations({
    events: [...sunk],
    divergenceRows: [
      {
        equivalenceContractRef: "equivalence://t217/diverge",
        evidenceRef: "evidence://t217/divergence-row"
      }
    ]
  });
  assert.equal(obligations.length, 1);
  assert.equal(obligations[0].draftRef, proposed.draftRef);
  assert.equal(obligations[0].demotionRequired, true);
  assert.equal(obligations[0].intakeRequired, true);
  // an unratified contract owes nothing
  assert.deepEqual(
    deriveTunerDivergenceObligations({
      events: [...sunk],
      divergenceRows: [
        {
          equivalenceContractRef: "equivalence://t217/other",
          evidenceRef: "evidence://x"
        }
      ]
    }),
    []
  );
});

test("T-217 P4 (TUNER-010 rail-break + TUNER-002 cost rows): signals and per-configuration costs derive from replay", () => {
  const events = emit(
    [
      {
        kind: "terminal_reached",
        basisId: "basis://t217/tuner/rail",
        terminalKind: "gap_stop",
        reason: "ambiguity: two lawful interpretations of the stage contract"
      }
    ],
    () => {}
  );
  const signals = deriveTunerModeSignals(events);
  const railBreak = signals.find((row) => row.signalKind === "rail_break");
  assert.ok(railBreak, "a declared path halting on ambiguity projects the mode signal");
  assert.equal(railBreak.subjectRef, "basis://t217/tuner/rail");

  // cost rows from invocation started/closed envelope times
  const scope = {
    basisId: "basis://t217/tuner/cost",
    graphFunctionId: "graph-function://t217/tuner",
    runId: null,
    workKey: null,
    graphCallId: "graph-call://t217/tuner",
    frameId: "frame://t217/tuner",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/tuner/1",
    workerId: "worker://codex",
    backendId: "backend://codex-cli",
    causationEventRefs: [],
    correlationId: "correlation://t217/tuner/cost"
  };
  const costEvents = emit(
    [
      {
        kind: "actor_invocation_started",
        ...scope,
        attemptIndex: 0,
        dispatchRef: "dispatch://t217/tuner",
        resultRef: "result://t217/tuner/1"
      },
      {
        kind: "actor_invocation_closed",
        ...scope,
        attemptIndex: 0,
        dispatchRef: "dispatch://t217/tuner",
        resultRef: "result://t217/tuner/1",
        closureStatus: "completed",
        closureFailureClass: null,
        detail: null
      }
    ],
    () => {}
  );
  const costRows = deriveConfigurationCostRows(costEvents);
  assert.equal(costRows.length, 1);
  assert.equal(costRows[0].configurationRef, "worker://codex|backend://codex-cli");
  assert.equal(costRows[0].invocationCount, 1);
  assert.ok(costRows[0].totalDurationMs >= 0);
});

test("T-217 P4 (TUNER-001/-003): the declared tuner module is a catalog citizen, and the verb surface runs through the grammar — report reads, propose/ratify admit", async () => {
  assert.equal(ABG_TUNER_MODULE_DECLARATIONS.length, 1);
  assert.equal(
    ABG_TUNER_MODULE_DECLARATIONS[0].entryRef,
    "gtl://abg/tuner/default-loop"
  );
  assert.equal(ABG_TUNER_MODULE_DECLARATIONS[0].libraryScope, "system");

  const root = mkdtempSync(path.join(tmpdir(), "t217-tuner-"));
  const stateRoot = path.join(root, ".ai-workspace");
  const eventLogPath = path.join(stateRoot, "events", "events.jsonl");
  mkdirSync(path.join(stateRoot, "events"), { recursive: true });
  mkdirSync(path.join(root, ".abiogenesis"), { recursive: true });
  writeFileSync(
    path.join(root, ".abiogenesis", "toolchain-binding.json"),
    `${JSON.stringify({
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
    }, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(eventLogPath, "", "utf8");
  const io = () => {
    const out = [];
    return {
      io: { cwd: () => root, stdout: (t) => out.push(t), stderr: () => {} },
      last: () => JSON.parse(out[out.length - 1])
    };
  };
  const ws = ["--workspace", root];

  // report over the empty log: read-only, appends nothing
  let ctx = io();
  assert.equal(await runAbiogenesisCli(["tune", "report", ...ws], ctx.io), 0);
  assert.deepEqual(ctx.last().report.drafts, []);
  assert.equal(readFileSync(eventLogPath, "utf8"), "", "report appends NOTHING");

  // propose through the grammar
  ctx = io();
  assert.equal(
    await runAbiogenesisCli(
      [
        "tune", "propose", ...ws,
        "--proposal-kind", "calibration",
        "--proposer", "tuner://abg/default-loop",
        "--affects", "gtl-declaration://t217/stage-contract",
        "--before-digest", "sha256:before",
        "--after-digest", "sha256:after",
        "--summary", "raise evaluate-stage timeout on slow toolchains",
        "--telemetry", "tuner-signal:retry_density:basis://t217/x"
      ],
      ctx.io
    ),
    0
  );
  const draftRef = ctx.last().ref;
  assert.match(draftRef, /^tuner-draft:/u);

  // ratify requires exactly one authority
  ctx = io();
  assert.equal(
    await runAbiogenesisCli(
      ["tune", "ratify", ...ws, "--draft-ref", draftRef],
      ctx.io
    ),
    1
  );
  assert.match(ctx.last().reason, /exactly one of --actor/u);

  // F_H ratification through the grammar; state lands in the persisted log
  ctx = io();
  assert.equal(
    await runAbiogenesisCli(
      ["tune", "ratify", ...ws, "--draft-ref", draftRef, "--actor", "operator://jim"],
      ctx.io
    ),
    0
  );
  assert.equal(ctx.last().state, "ratified");
  const persisted = readFileSync(eventLogPath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    persisted.map((event) => event.kind),
    ["tuner_draft_admitted", "tuner_draft_ratified"]
  );
  // and report renders the ratified state read-only
  ctx = io();
  assert.equal(await runAbiogenesisCli(["tune", "report", ...ws], ctx.io), 0);
  assert.equal(ctx.last().report.drafts[0].state, "ratified");
});

test("T-217 P4: the draftRef is self-certified — a forged ref is inadmissible", () => {
  const genuine = constructTunerDraftAdmittedEvent({
    proposalKind: "lay_rail",
    proposer: "tuner://abg/default-loop",
    telemetryBasisRefs: [],
    affectedDeclarationRefs: ["gtl-declaration://t217/overlay"],
    beforeDigest: "sha256:b",
    afterDigest: "sha256:a",
    summary: "publish overlay extension where entropy is near zero",
    correlationId: "correlation://t217/tuner/forge"
  });
  assert.throws(
    () => emit([{ ...genuine, draftRef: "tuner-draft:forged" }], () => {}),
    /content-derived identity/u
  );
  const states = deriveTunerDraftStates(emit([genuine], () => {}));
  assert.equal(states[0].proposalKind, "lay_rail");
});

test("T-217 P4: rejection through route and grammar; policy-ratify through the grammar; route-variance and retry-density signals", async () => {
  // route-level reject
  const sunk = [];
  const proposed = admitTunerDraft({
    eventSink: (event) => sunk.push(event),
    ...CAL_DRAFT,
    summary: "reject-path fixture",
    correlationId: "correlation://t217/tuner/reject"
  });
  const rejected = admitTunerDraftDecision({
    runtimeEvents: [...sunk],
    eventSink: (event) => sunk.push(event),
    draftRef: proposed.draftRef,
    decision: "reject",
    rejectedBy: "operator://jim",
    reason: "not worth the entropy"
  });
  assert.equal(rejected.states[0].state, "rejected");
  assert.equal(rejected.states[0].decidedBy, "operator://jim");

  // signals: route variance (two entries selected for one function) and
  // retry density (multiple invocations on one basis)
  const selection = (entryRef) => ({
    kind: "graph_function_selected",
    selectionRef: `selection://t217/${entryRef}`,
    selectedEntryRef: entryRef,
    selectedEntryKind: "graph_function",
    selectedGraphFunctionRef: "graph-function://t217/variant",
    lookupResultRef: "lookup://t217/variant",
    eligibilityDecisionRefs: [],
    adviceRefs: [],
    fhResponseRefs: [],
    rationaleRef: "rationale://t217/variant",
    runtimeBasisRef: "runtime-basis://t217/variant",
    causationEventRefs: [],
    correlationId: `correlation://t217/select/${entryRef}`
  });
  const invocation = (attempt) => ({
    kind: "actor_invocation_started",
    basisId: "basis://t217/tuner/retry",
    graphFunctionId: "graph-function://t217/variant",
    runId: null,
    workKey: null,
    graphCallId: "graph-call://t217/retry",
    frameId: "frame://t217/retry",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: `actor-invocation://t217/retry/${attempt}`,
    workerId: "worker://codex",
    backendId: "backend://codex-cli",
    causationEventRefs: [],
    correlationId: `correlation://t217/retry/${attempt}`,
    attemptIndex: attempt,
    dispatchRef: "dispatch://t217/retry",
    resultRef: `result://t217/retry/${attempt}`
  });
  const signalEvents = emit(
    [selection("entry://a"), selection("entry://b"), invocation(0), invocation(1)],
    () => {}
  );
  const signals = deriveTunerModeSignals(signalEvents);
  const variance = signals.find((row) => row.signalKind === "route_variance");
  assert.equal(variance.value, 2, "two entries selected for one function");
  const density = signals.find((row) => row.signalKind === "retry_density");
  assert.equal(density.value, 2, "two attempts on one basis");

  // grammar: reject verb + policy-ratify verb
  const root = mkdtempSync(path.join(tmpdir(), "t217-tuner-verbs-"));
  const stateRoot = path.join(root, ".ai-workspace");
  const eventLogPath = path.join(stateRoot, "events", "events.jsonl");
  mkdirSync(path.join(stateRoot, "events"), { recursive: true });
  mkdirSync(path.join(root, ".abiogenesis"), { recursive: true });
  writeFileSync(
    path.join(root, ".abiogenesis", "toolchain-binding.json"),
    `${JSON.stringify({
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
    }, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(eventLogPath, "", "utf8");
  const io = () => {
    const out = [];
    return {
      io: { cwd: () => root, stdout: (t) => out.push(t), stderr: () => {} },
      last: () => JSON.parse(out[out.length - 1])
    };
  };
  const ws = ["--workspace", root];
  let ctx = io();
  await runAbiogenesisCli(
    [
      "tune", "propose", ...ws,
      "--proposal-kind", "calibration",
      "--proposer", "tuner://abg/default-loop",
      "--affects", "gtl-declaration://t217/x",
      "--before-digest", "sha256:b",
      "--after-digest", "sha256:a",
      "--summary", "policy-ratified calibration"
    ],
    ctx.io
  );
  const draftA = ctx.last().ref;
  ctx = io();
  assert.equal(
    await runAbiogenesisCli(
      ["tune", "ratify", ...ws, "--draft-ref", draftA, "--policy", "policy://abg/tuner/auto-ratify-calibration"],
      ctx.io
    ),
    0
  );
  assert.equal(ctx.last().state, "ratified");

  ctx = io();
  await runAbiogenesisCli(
    [
      "tune", "propose", ...ws,
      "--proposal-kind", "pull_up",
      "--proposer", "tuner://abg/default-loop",
      "--affects", "gtl-declaration://t217/y",
      "--before-digest", "sha256:b2",
      "--after-digest", "sha256:a2",
      "--summary", "retire the non-discriminating edge"
    ],
    ctx.io
  );
  const draftB = ctx.last().ref;
  ctx = io();
  assert.equal(
    await runAbiogenesisCli(
      ["tune", "reject", ...ws, "--draft-ref", draftB, "--actor", "operator://jim", "--reason", "edge still discriminates"],
      ctx.io
    ),
    0
  );
  assert.equal(ctx.last().state, "rejected");

  // the tune grammar rejection is typed
  ctx = io();
  assert.equal(await runAbiogenesisCli(["tune", "vibes", ...ws], ctx.io), 1);
  assert.match(
    ctx.last().reason,
    /tune requires a subcommand: report \| propose \| ratify \| reject/u
  );
});

test("T-217 review R6: a duplicated close event is inert — one invocation counts once", () => {
  const scope = {
    basisId: "basis://t217/review/cost",
    graphFunctionId: "graph-function://t217/review",
    runId: null,
    workKey: null,
    graphCallId: "graph-call://t217/review/cost",
    frameId: "frame://t217/review/cost",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/review/cost",
    workerId: "worker://codex",
    backendId: "backend://codex-cli",
    causationEventRefs: [],
    correlationId: "correlation://t217/review/cost"
  };
  const started = {
    kind: "actor_invocation_started",
    ...scope,
    attemptIndex: 0,
    dispatchRef: "dispatch://t217/review",
    resultRef: "result://t217/review/cost"
  };
  const closed = {
    kind: "actor_invocation_closed",
    ...scope,
    attemptIndex: 0,
    dispatchRef: "dispatch://t217/review",
    resultRef: "result://t217/review/cost",
    closureStatus: "completed",
    closureFailureClass: null,
    detail: null
  };
  const [canonicalStarted, canonicalClosed] = emit([started, closed], () => {});
  // a hostile/duplicated replay carrying the SAME closed event twice
  const rows = deriveConfigurationCostRows([
    canonicalStarted,
    canonicalClosed,
    canonicalClosed
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].invocationCount, 1, "the duplicate close is inert");
});

test("T-217 codex P1: cited signal refs are replay-derived authority — phantom citations fail closed, derived citations admit", () => {
  // a replay that DERIVES a retry-density signal
  const scope = (attempt) => ({
    kind: "actor_invocation_started",
    basisId: "basis://t217/cite",
    graphFunctionId: "graph-function://t217/cite",
    runId: null,
    workKey: null,
    graphCallId: "graph-call://t217/cite",
    frameId: "frame://t217/cite",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: `actor-invocation://t217/cite/${attempt}`,
    workerId: "worker://codex",
    backendId: "backend://codex-cli",
    causationEventRefs: [],
    correlationId: `correlation://t217/cite/${attempt}`,
    attemptIndex: attempt,
    dispatchRef: "dispatch://t217/cite",
    resultRef: `result://t217/cite/${attempt}`
  });
  const replay = emit([scope(0), scope(1)], () => {});
  const derivedRef = deriveTunerModeSignals(replay)[0].signalRef;

  // phantom citation: fails closed at the route
  assert.throws(
    () =>
      admitTunerDraft({
        runtimeEvents: replay,
        eventSink: () => {},
        ...CAL_DRAFT,
        proposalKind: "promotion",
        citedSignalRefs: ["tuner-signal://does-not-exist"],
        summary: "promote citing a phantom signal"
      }),
    /cites signal rows the replay does not derive/u
  );
  // a citation the replay derives admits
  const lawful = admitTunerDraft({
    runtimeEvents: replay,
    eventSink: () => {},
    ...CAL_DRAFT,
    proposalKind: "promotion",
    citedSignalRefs: [derivedRef],
    summary: "promote citing the derived retry-density signal"
  });
  assert.equal(lawful.states[0].proposalKind, "promotion");
});
