// T-217 Phase 3 — the observer tier's deterministic half (FPC-018/-019
// + FPC-007). Observable assembly from the Phase 1 sense organs, the
// non-constructive catalog law, the MECHANICAL triage rules, and the
// T-032 campaign ledger as ground truth: the twelve known defects'
// kernel-visible signatures either triage EXACTLY (the schema/shape
// class) or ROUTE to the F_H seat — the observer never guesses a class
// it cannot prove (FPC-021: no authority from narrative).
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertObserverCatalogNonConstructive,
  deriveObserverObservables,
  deriveObserverTicketDrafts,
  OBSERVER_ACTION_CATALOG,
  constructWorkspaceHygieneStampedEvent,
  deriveWorkspaceHygieneRows
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { runEngineStart } from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";
import {
  t217Declaration,
  t217StartupConfig
} from "./support/t217-witness-fixtures.mjs";

function seedDriftHaltedRun() {
  const namespace = "t217/observer";
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
  const run = (marker) =>
    runEngineStart({
      startIntent: input,
      module: context.module,
      runtimeIdentity: context.runtimeIdentity,
      resolvedPolicy: context.resolvedPolicy,
      runtimeEvents: [...events],
      eventSink: (event) => events.push(event),
      runtimeRegistryStartup: startup(marker)
    });
  run("content-v1");
  run("content-v2"); // silent drift: the S1 guard halts this resume
  return events;
}

test("T-217 P3.1 (FPC-018): the observer observable set assembles the Phase 1 sense organs from one replay stream", () => {
  const events = seedDriftHaltedRun();
  const observables = deriveObserverObservables(events);
  assert.equal(observables.kind, "observer_observables");
  assert.equal(observables.haltDiagnosis.halted, true);
  assert.match(
    observables.haltDiagnosis.haltReason ?? "",
    /declaration_reprice_required/u
  );
  assert.equal(observables.citability.citable, false);
  // the drift fact is derived from the record itself: one declarationRef
  // admitted under two digests with no covering reprice
  assert.equal(observables.repriceObligationRefs.length, 1);
  assert.match(observables.repriceObligationRefs[0], /^gtl-declaration:/u);
  assert.equal(observables.frozenLaw.frozenLaw, true, "no reprice events admitted");
  assert.deepEqual(observables.costRowRefs, [], "the Phase 4 cost slot is declared and empty");
});

test("T-217 P3.2 (FPC-019): the observer catalog is non-constructive and optimisation-free; violations fail typed", () => {
  assertObserverCatalogNonConstructive(OBSERVER_ACTION_CATALOG);
  assert.equal(OBSERVER_ACTION_CATALOG.length, 6);
  assert.throws(
    () =>
      assertObserverCatalogNonConstructive([
        { actionKind: "invoke_graph_function", description: "construct" }
      ]),
    /rejects constructive\/unknown action kind/u
  );
  // observer and tuner are separate judgment programs
  assert.throws(
    () =>
      assertObserverCatalogNonConstructive([
        { actionKind: "fh_input", description: "propose annealing of F_P stage" }
      ]),
    /optimisation terms/u
  );
});

test("T-217 P3.3 (FPC-007): mechanical triage — drift drafts a reprice proposal with the intake-triage fields", () => {
  const events = seedDriftHaltedRun();
  const drafts = deriveObserverTicketDrafts(deriveObserverObservables(events));
  assert.equal(drafts.length, 1);
  const [reprice] = drafts;
  assert.equal(reprice.actionKind, "reprice_proposal");
  assert.equal(reprice.changeClass, "requirement_reprice");
  assert.equal(reprice.reEntryPoint, "requirements");
  assert.match(reprice.owner, /requirements/u);
  assert.match(reprice.summary, /drifted without a covering reprice/u);
  assert.match(reprice.triageReason, /upward walk/u);
  assert.match(reprice.draftRef, /^observer-draft:/u);
});

test("T-217 P3.3: hygiene taint drafts a realization-layer ticket; an unclassifiable halt routes to the F_H seat instead of guessing", () => {
  // taint: artifact admitted, foreign-write stamped (basis-scoped fixture)
  const artifact = {
    kind: "actor_result_artifact_observed",
    basisId: "basis://t217/observer",
    graphFunctionId: "graph-function://t217/observer",
    runId: "run://t217/observer",
    workKey: "wk://t217/observer",
    graphCallId: "graph-call://t217/observer",
    frameId: "frame://t217/observer",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/observer",
    workerId: "worker://t217",
    backendId: "backend://node",
    causationEventRefs: [],
    correlationId: "correlation://t217/observer/artifact",
    resultRef: "result://t217/observer/report",
    artifactRef: "artifact://t217/observer/report",
    artifactContentDigest: "sha256:admitted",
    artifactContentExcerpt: null
  };
  const events = [];
  events.push(...emit([artifact], () => {}));
  events.push(
    ...emit(
      [
        constructWorkspaceHygieneStampedEvent({
          basisId: "basis://t217/observer",
          runId: "run://t217/observer",
          workKey: "wk://t217/observer",
          segmentRef: null,
          observedBy: "kernel://workspace-digest-instrument",
          rows: deriveWorkspaceHygieneRows({
            observations: [
              {
                artifactRef: artifact.artifactRef,
                observedDigest: "sha256:hand-edited",
                copyOutRef: "copyout://t217/observer/1"
              }
            ],
            replayEvents: events
          })
        })
      ],
      () => {}
    )
  );
  const taintDrafts = deriveObserverTicketDrafts(
    deriveObserverObservables(events)
  );
  const taintDraft = taintDrafts.find(
    (row) => row.changeClass === "realization_refactor"
  );
  assert.ok(taintDraft, "taint drafts a realization-layer hygiene ticket");
  assert.equal(taintDraft.reEntryPoint, "realization");
  assert.match(taintDraft.summary, /foreign-written or missing/u);

  // an unclassifiable halt: gap_stop with a reason no mechanical rule
  // covers routes to the seat — never a guessed class
  const haltOnly = emit(
    [
      {
        kind: "terminal_reached",
        basisId: "basis://t217/observer/halt",
        terminalKind: "gap_stop",
        reason: "dispatch_required: no admitted worker for edge"
      }
    ],
    () => {}
  );
  const [fhDraft] = deriveObserverTicketDrafts(
    deriveObserverObservables(haltOnly)
  );
  assert.equal(fhDraft.actionKind, "fh_input");
  assert.equal(fhDraft.changeClass, null);
  assert.match(fhDraft.triageReason, /F_P judgment under the F_H seat/u);
});

// ── the T-032 campaign ledger as ground truth ────────────────────────
// Twelve known defects. The kernel-visible signature of each either
// triages EXACTLY (the T-213 schema/shape class: BUG #2/#5/#8 — worker
// output rejected against the declared boundary shape) or ROUTES to the
// F_H seat (contract contradictions, environmental bindings, authority
// gaps, substrate capability denials: semantic judgment the episode's
// F_P evaluator owns). ZERO tolerated misclassifications: a mechanical
// class must match the ledger's triage; everything else must be a
// question, never a wrong answer. Full 12/12 independent derivation is
// the live observer episode's exit (Phase 5), per FPC-021.
const T032_GROUND_TRUTH = Object.freeze([
  { bug: 1, signature: "contract_contradiction_refusal_loop", expected: "fh_input" },
  { bug: 2, signature: "schema_shape_rejection", expected: "design_reframe" },
  { bug: 3, signature: "environmental_provisioning_failure", expected: "fh_input" },
  { bug: 4, signature: "convergence_starvation", expected: "fh_input" },
  { bug: 5, signature: "schema_shape_rejection", expected: "design_reframe" },
  { bug: 6, signature: "substrate_capability_denial", expected: "fh_input" },
  { bug: 7, signature: "bookkeeping_over_demand", expected: "fh_input" },
  { bug: 8, signature: "schema_shape_rejection", expected: "design_reframe" },
  { bug: 9, signature: "declaration_flag_semantics", expected: "fh_input" },
  { bug: 10, signature: "kernel_admission_over_enforcement", expected: "fh_input" },
  { bug: 11, signature: "authority_gap_for_repair", expected: "fh_input" },
  { bug: 12, signature: "self_report_dressed_as_fd", expected: "fh_input" }
]);

function replayForSignature(signature, bug) {
  const basisId = `basis://t032/bug-${bug}`;
  if (signature === "schema_shape_rejection") {
    return emit(
      [
        {
          kind: "payload_rejected",
          issues: [
            { issueKind: "row_missing_field", path: "result.status" }
          ],
          basisId,
          graphCallId: `graph-call://t032/bug-${bug}`,
          frameId: `frame://t032/bug-${bug}`,
          vectorIndex: 0,
          edge: "input_set→requirements",
          payloadRef: `payload://t032/bug-${bug}`,
          rejectionClass: "schema_invalid",
          schemaRef: `schema://t032/bug-${bug}`,
          contractRef: null,
          contractDigest: null,
          digest: null,
          reason: "row_missing_field:result.status",
          policyRefs: []
        },
        {
          kind: "terminal_reached",
          basisId,
          terminalKind: "gap_stop",
          reason: "worker payload rejected against declared schema"
        }
      ],
      () => {}
    );
  }
  // every judgment-class signature: a halt whose reason the kernel
  // cannot mechanically classify
  return emit(
    [
      {
        kind: "terminal_reached",
        basisId,
        terminalKind: "gap_stop",
        reason: `${signature} (T-032 BUG #${bug})`
      }
    ],
    () => {}
  );
}

test("T-217 P3.4 (Phase 3 exit, deterministic half): the T-032 twelve — mechanical classes triage exactly, judgment classes route to the seat, zero misclassifications", () => {
  for (const entry of T032_GROUND_TRUTH) {
    const events = replayForSignature(entry.signature, entry.bug);
    const drafts = deriveObserverTicketDrafts(
      deriveObserverObservables(events)
    );
    assert.ok(drafts.length >= 1, `BUG #${entry.bug} produces a draft`);
    if (entry.expected === "design_reframe") {
      const classified = drafts.find(
        (row) => row.changeClass === "design_reframe"
      );
      assert.ok(
        classified,
        `BUG #${entry.bug}: the schema/shape signature triages design_reframe`
      );
      assert.equal(classified.reEntryPoint, "design_surface");
      assert.match(classified.triageReason, /T-213 law/u);
    } else {
      // judgment classes: EVERY draft is a question for the seat — no
      // mechanical rule fires, nothing guesses a change class
      for (const row of drafts) {
        assert.equal(
          row.actionKind,
          "fh_input",
          `BUG #${entry.bug}: judgment routes to F_H, never a guessed class`
        );
        assert.equal(row.changeClass, null);
      }
    }
  }
});

test("T-217 P3 (WITNESS-011): observe drafts renders the triaged drafts through the grammar; ratification is the intake verb", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const path = (await import("node:path")).default;
  const { runAbiogenesisCli } = await import(
    "../../build/semantic/code/src/cli/command.js"
  );
  const root = mkdtempSync(path.join(tmpdir(), "t217-observer-"));
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
  const events = seedDriftHaltedRun();
  writeFileSync(
    eventLogPath,
    events.map((event) => JSON.stringify(event)).join("\n") + "\n",
    "utf8"
  );
  const out = [];
  const io = { cwd: () => root, stdout: (t) => out.push(t), stderr: () => {} };
  assert.equal(
    await runAbiogenesisCli(["observe", "drafts", "--workspace", root], io),
    0
  );
  const payload = JSON.parse(out[out.length - 1]);
  assert.equal(payload.drafts.length, 1);
  assert.equal(payload.drafts[0].action_kind, "reprice_proposal");
  assert.equal(payload.drafts[0].change_class, "requirement_reprice");
  assert.equal(payload.drafts[0].re_entry_point, "requirements");

  // the grammar rejection stays typed
  const bad = [];
  const badIo = { cwd: () => root, stdout: (t) => bad.push(t), stderr: () => {} };
  assert.equal(await runAbiogenesisCli(["observe", "vibes", "--workspace", root], badIo), 1);
  assert.match(JSON.parse(bad[bad.length - 1]).reason, /report or drafts/u);
});

test("T-217 P3.3: a failed attestation verification routes to the F_H seat — the kernel proves divergence, never intent", async () => {
  const { admitReplayLogAttestation, runEngineStart: startRun } = await import(
    "../../build/semantic/code/src/index.js"
  );
  const { reconstructRouteBasisFromReplay } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const runEvents = [];
  startRun({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runEvents.push(event)
  });
  const attested = admitReplayLogAttestation({
    basis: reconstructRouteBasisFromReplay(runEvents),
    runtimeEvents: [...runEvents],
    eventSink: () => {},
    attestedBy: "observer://t217/instrument"
  });
  // tamper INSIDE the attested span: full-content hashing makes the
  // record tamper-EVIDENT between attestations
  const tampered = [
    { ...runEvents[0], correlationId: "correlation://forged" },
    ...runEvents.slice(1),
    ...attested.emittedEvents
  ];
  const observables = deriveObserverObservables(tampered);
  assert.equal(observables.attestationsVerified, false);
  const drafts = deriveObserverTicketDrafts(observables);
  const tamperDraft = drafts.find((row) =>
    /attestation verification FAILED/u.test(row.summary)
  );
  assert.ok(tamperDraft);
  assert.equal(tamperDraft.actionKind, "fh_input");
  assert.match(tamperDraft.triageReason, /proves divergence, never intent/u);
});

test("T-217 P3.3: a basis fork visible in the record drafts a design_reframe at the basis seam; a covering reprice retires it", async () => {
  const { mintExecutionBasisSpineRef } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/declaration_reprice.js"
  );
  const admission = (basisId) => ({
    kind: "basis_admitted",
    basisId,
    graphFunctionId: "graph-function://t217/fork",
    jobId: "job://t217/fork",
    resolvedRuntimeRef: "runtime://typescript/node",
    resolvedPolicyBundleRef: "policy://t217/fork",
    runId: "run://t217/fork",
    workKey: "wk://t217/fork"
  });
  const forked = emit(
    [
      admission("basis://t217/fork/one"),
      admission("basis://t217/fork/two"),
      {
        kind: "terminal_reached",
        basisId: "basis://t217/fork/two",
        terminalKind: "gap_stop",
        reason: "basis_fork_detected"
      }
    ],
    () => {}
  );
  const drafts = deriveObserverTicketDrafts(deriveObserverObservables(forked));
  const forkDraft = drafts.find((row) => /forked/u.test(row.summary));
  assert.ok(forkDraft, "the fork drafts a ticket");
  assert.equal(forkDraft.changeClass, "design_reframe");
  assert.equal(forkDraft.reEntryPoint, "design_surface");
  assert.match(forkDraft.triageReason, /basis seam/u);

  // a covering reprice on the spine ref retires the fork pressure
  const spineRef = mintExecutionBasisSpineRef({
    graphFunctionId: "graph-function://t217/fork",
    jobId: "job://t217/fork",
    runId: "run://t217/fork",
    workKey: "wk://t217/fork"
  });
  // self-certified refs: the constructor mints the content-derived
  // repriceRef the admitter recomputes
  const { constructDeclarationRepriceAdmittedEvent } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const covered = [
    ...forked,
    ...emit(
      [
        constructDeclarationRepriceAdmittedEvent({
          basisId: "basis://t217/fork/two",
          runId: "run://t217/fork",
          workKey: "wk://t217/fork",
          declarationRef: spineRef,
          beforeDigest: "basis://t217/fork/one",
          afterDigest: "basis://t217/fork/two",
          changeClass: "design_reframe",
          owningTicketRef: "ticket://T-217",
          operatorActorRef: "operator://jim",
          reason: "ratified basis migration"
        })
      ],
      () => {}
    )
  ];
  const coveredDrafts = deriveObserverTicketDrafts(
    deriveObserverObservables(covered)
  );
  assert.equal(
    coveredDrafts.find((row) => /forked/u.test(row.summary)),
    undefined,
    "covered forks draft nothing"
  );
});

test("T-217 P3.1: the two-digest admission channel also witnesses drift — a ref admitted under two digests drafts without any halt", () => {
  const entry = (digest) => ({
    kind: "registry_entry_admitted",
    entryRef: "registry-entry://t217/two-digest",
    declarationRef: "gtl-declaration://t217/two-digest",
    declarationDigest: digest,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.twodigest",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef: "graph-function://t217/two-digest",
    interfaceRef: "interface://t217/two-digest",
    sourceContractRef: "contract://t217/source",
    targetContractRef: "contract://t217/target",
    contextRefs: [],
    authorityRefs: [],
    overlayRefs: [],
    provenanceRefs: [],
    readinessRefs: [],
    proofRefs: [],
    policyRefs: [],
    refinementOfEntryRef: null,
    overrideOfEntryRef: null,
    declarationSourceRefs: [],
    causationEventRefs: [],
    correlationId: "correlation://t217/two-digest"
  });
  const events = emit([entry("sha256:v1"), entry("sha256:v2")], () => {});
  const observables = deriveObserverObservables(events);
  assert.deepEqual(observables.repriceObligationRefs, [
    "gtl-declaration://t217/two-digest"
  ]);
});

// ── P3.5: the subsumed review/consensus declared modules ─────────────

test("T-217 P3.5: the subsumed families are catalog citizens — system-scope declarations under reserved refs that products cannot shadow", async () => {
  const {
    ABG_SUBSUMED_MODULE_DECLARATIONS,
    ABG_REVIEW_MODULE_DECLARATIONS,
    ABG_CONSENSUS_MODULE_DECLARATIONS,
    REVIEW_RULING_KIND_VALUES,
    CONSENSUS_ROUND_OUTCOME_VALUES
  } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const {
    admitGtlLibraryEntryDeclaration,
    projectRuntimeGraphFunctionRegistry
  } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js"
  );

  // the declared families: review (assessment + ruling reduction) and
  // consensus (governed rounds), all system scope under gtl://abg/*
  assert.equal(ABG_SUBSUMED_MODULE_DECLARATIONS.length, 3);
  for (const declaration of ABG_SUBSUMED_MODULE_DECLARATIONS) {
    assert.equal(declaration.libraryScope, "system");
    assert.match(declaration.entryRef, /^gtl:\/\/abg\/(review|consensus)\//u);
  }
  // the decision vocabularies are closed data
  assert.deepEqual(REVIEW_RULING_KIND_VALUES, [
    "decision_row",
    "draft_ticket",
    "split_ticket",
    "deferment",
    "rejected_finding"
  ]);
  assert.deepEqual(CONSENSUS_ROUND_OUTCOME_VALUES, [
    "closed_done",
    "recurse_next_round",
    "escalate_fh"
  ]);
  // review output is never ticket status authority; consensus recursion
  // stops by declared law — both carried as declared policy refs
  assert.ok(
    ABG_REVIEW_MODULE_DECLARATIONS[1].policyRefs.some((ref) =>
      /review-never-owns-status/u.test(ref)
    )
  );
  assert.ok(
    ABG_CONSENSUS_MODULE_DECLARATIONS[0].policyRefs.some((ref) =>
      /recursion-stops-by-declared-law/u.test(ref)
    )
  );

  // admission: the system entries admit; a PRODUCT declaration shadowing
  // the reserved ref without override law is rejected unlawful_system_shadow
  const emitted = [];
  for (const declaration of ABG_SUBSUMED_MODULE_DECLARATIONS) {
    const event = admitGtlLibraryEntryDeclaration({
      declaration,
      correlationId: `correlation://t217/p35/${declaration.entryRef}`
    });
    assert.equal(event.kind, "registry_entry_admitted");
    emitted.push(...emit([event], () => {}));
  }
  const projection = projectRuntimeGraphFunctionRegistry(emitted);
  const shadow = admitGtlLibraryEntryDeclaration({
    declaration: {
      ...ABG_REVIEW_MODULE_DECLARATIONS[0],
      libraryScope: "product",
      declarationRef: "gtl-declaration://product/shadow-attempt",
      namespace: "product.shadow",
      ownerRef: "owner://product/shadow"
    },
    projection,
    correlationId: "correlation://t217/p35/shadow"
  });
  assert.equal(shadow.kind, "registry_entry_rejected");
  assert.equal(shadow.rejectionReason, "unlawful_system_shadow");
});

// ── review-round differentials (self-review 2026-07-10) ─────────────

test("T-217 review R1: pre-EVENTS-026 payload_rejected events (no issues field) stay admissible replay truth; malformed present rows still fail", async () => {
  const { assertRuntimeEvent } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const legacy = {
    kind: "payload_rejected",
    basisId: "basis://legacy",
    graphCallId: "graph-call://legacy",
    frameId: "frame://legacy",
    vectorIndex: 0,
    edge: "input_set→requirements",
    payloadRef: "payload://legacy",
    rejectionClass: "malformed",
    schemaRef: null,
    contractRef: "contract://x",
    contractDigest: null,
    digest: null,
    reason: "payload malformed",
    policyRefs: []
  };
  // absence = the pre-realization persisted shape (attested spans
  // cannot be rewritten) — admissible
  assertRuntimeEvent(legacy);
  // present but malformed still fails typed
  assert.throws(
    () => assertRuntimeEvent({ ...legacy, issues: "not-rows" }),
    /issues must be an array/u
  );
  // and the observer reads legacy events without throwing
  const observables = deriveObserverObservables(
    emit([{ ...legacy, rejectionClass: "schema_invalid" }], () => {})
  );
  assert.equal(observables.schemaRejections.length, 1);
  assert.deepEqual(observables.schemaRejections[0].issueKinds, []);
});

test("T-217 review R2: a multi-declaration drift reason drafts ONE reprice proposal PER declaration", () => {
  const events = emit(
    [
      {
        kind: "terminal_reached",
        basisId: "basis://t217/review/multi",
        terminalKind: "gap_stop",
        reason:
          "declaration_reprice_required: gtl-declaration://t217/a,gtl-declaration://t217/b"
      }
    ],
    () => {}
  );
  const observables = deriveObserverObservables(events);
  assert.deepEqual(observables.repriceObligationRefs, [
    "gtl-declaration://t217/a",
    "gtl-declaration://t217/b"
  ]);
  const drafts = deriveObserverTicketDrafts(observables);
  const proposals = drafts.filter((row) => row.actionKind === "reprice_proposal");
  assert.equal(proposals.length, 2, "one draft per drifted declaration");
});

test("T-217 review R3: an unaddressed halt raises the F_H question even when unrelated drafts exist; an addressed halt does not", () => {
  // taint draft PLUS an unexplained halt: the question must still fire
  const artifact = {
    kind: "actor_result_artifact_observed",
    basisId: "basis://t217/review/halt",
    graphFunctionId: "graph-function://t217/review",
    runId: "run://t217/review",
    workKey: "wk://t217/review",
    graphCallId: "graph-call://t217/review",
    frameId: "frame://t217/review",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/review",
    workerId: "worker://t217",
    backendId: "backend://node",
    causationEventRefs: [],
    correlationId: "correlation://t217/review/artifact",
    resultRef: "result://t217/review/report",
    artifactRef: "artifact://t217/review/report",
    artifactContentDigest: "sha256:admitted",
    artifactContentExcerpt: null
  };
  const events = [];
  events.push(...emit([artifact], () => {}));
  events.push(
    ...emit(
      [
        constructWorkspaceHygieneStampedEvent({
          basisId: "basis://t217/review/halt",
          runId: "run://t217/review",
          workKey: "wk://t217/review",
          segmentRef: null,
          observedBy: "kernel://workspace-digest-instrument",
          rows: deriveWorkspaceHygieneRows({
            observations: [
              {
                artifactRef: artifact.artifactRef,
                observedDigest: "sha256:edited",
                copyOutRef: "copyout://t217/review/1"
              }
            ],
            replayEvents: events
          })
        }),
        {
          kind: "terminal_reached",
          basisId: "basis://t217/review/halt",
          terminalKind: "gap_stop",
          reason: "dispatch_required: no admitted worker"
        }
      ],
      () => {}
    )
  );
  const drafts = deriveObserverTicketDrafts(deriveObserverObservables(events));
  assert.ok(
    drafts.some((row) => row.changeClass === "realization_refactor"),
    "the taint draft exists"
  );
  assert.ok(
    drafts.some((row) => row.actionKind === "fh_input"),
    "the unaddressed halt still raises the question"
  );

  // an ADDRESSED halt (reprice reason with a derived obligation) raises
  // no question
  const addressed = emit(
    [
      {
        kind: "terminal_reached",
        basisId: "basis://t217/review/addressed",
        terminalKind: "gap_stop",
        reason: "declaration_reprice_required: gtl-declaration://t217/x"
      }
    ],
    () => {}
  );
  const addressedDrafts = deriveObserverTicketDrafts(
    deriveObserverObservables(addressed)
  );
  assert.equal(
    addressedDrafts.find((row) => row.actionKind === "fh_input"),
    undefined
  );
});

test("T-217 review R5: repeated schema rejections of one payload dedupe to one draft", () => {
  const rejection = () => ({
    kind: "payload_rejected",
    issues: [{ issueKind: "row_missing_field", path: "result.status" }],
    basisId: "basis://t217/review/dup",
    graphCallId: "graph-call://t217/review/dup",
    frameId: "frame://t217/review/dup",
    vectorIndex: 0,
    edge: "input_set→requirements",
    payloadRef: "payload://t217/review/dup",
    rejectionClass: "schema_invalid",
    schemaRef: "schema://t217/review/dup",
    contractRef: null,
    contractDigest: null,
    digest: null,
    reason: "row_missing_field:result.status",
    policyRefs: []
  });
  const events = emit([rejection(), rejection()], () => {});
  const drafts = deriveObserverTicketDrafts(deriveObserverObservables(events));
  const schemaDrafts = drafts.filter((row) =>
    /rejected against/u.test(row.summary)
  );
  assert.equal(schemaDrafts.length, 1, "identical proposals dedupe by draftRef");
});

test("T-217 codex P2: two-digest drift retires ONLY under exact-pair reprice coverage; a wrong-pair reprice leaves the drift standing", async () => {
  const { constructDeclarationRepriceAdmittedEvent } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const entry = (digest) => ({
    kind: "registry_entry_admitted",
    entryRef: "registry-entry://t217/pair",
    declarationRef: "gtl-declaration://t217/pair",
    declarationDigest: digest,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.pair",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef: "graph-function://t217/pair",
    interfaceRef: "interface://t217/pair",
    sourceContractRef: "contract://t217/source",
    targetContractRef: "contract://t217/target",
    contextRefs: [],
    authorityRefs: [],
    overlayRefs: [],
    provenanceRefs: [],
    readinessRefs: [],
    proofRefs: [],
    policyRefs: [],
    refinementOfEntryRef: null,
    overrideOfEntryRef: null,
    declarationSourceRefs: [],
    causationEventRefs: [],
    correlationId: "correlation://t217/pair"
  });
  const reprice = (before, after) =>
    constructDeclarationRepriceAdmittedEvent({
      basisId: "basis://t217/pair",
      runId: null,
      workKey: null,
      declarationRef: "gtl-declaration://t217/pair",
      beforeDigest: before,
      afterDigest: after,
      changeClass: "requirement_reprice",
      owningTicketRef: "ticket://T-217",
      operatorActorRef: "operator://jim",
      reason: "pair-coverage differential"
    });
  // a reprice on the RIGHT ref but the WRONG digest pair does not retire
  const wrongPair = emit(
    [entry("sha256:v1"), entry("sha256:v2"), reprice("sha256:other", "sha256:v9")],
    () => {}
  );
  assert.deepEqual(
    deriveObserverObservables(wrongPair).repriceObligationRefs,
    ["gtl-declaration://t217/pair"],
    "wrong-pair coverage leaves the drift standing (S1 exact-pair law)"
  );
  // the exact observed pair retires it
  const exactPair = emit(
    [entry("sha256:v1"), entry("sha256:v2"), reprice("sha256:v1", "sha256:v2")],
    () => {}
  );
  assert.deepEqual(
    deriveObserverObservables(exactPair).repriceObligationRefs,
    []
  );
});
