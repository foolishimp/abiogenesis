// T-217 Phase 1 S4 — REQ-R-ABG3-WITNESS-001/-002.
// Halt diagnosis as a replay-derived read model; defect intake as the
// admitted gap-to-intent seam; ticket DRAFTS derived FROM intake records
// with solutioning stopping at the draft.
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructDefectIntakeAdmittedEvent,
  constructRunSegmentOpenedEvent,
  deriveHaltDiagnosis,
  deriveTicketDraftsFromIntakes,
  reconstructRouteBasisFromReplay
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  admitDefectIntake,
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig,
  runEngineStart
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";
import {
  t217Declaration as sharedDeclaration,
  t217StartupConfig as sharedStartupConfig
} from "./support/t217-witness-fixtures.mjs";

const HALT_TERMINAL = Object.freeze({
  kind: "terminal_reached",
  basisId: "basis://t217/s4",
  terminalKind: "gap_stop",
  reason: "declaration_reprice_required: gtl-declaration://t217/s4/subject"
});

function haltReplay() {
  return [
    {
      kind: "retry_attempt_opened",
      basisId: "basis://t217/s4",
      graphCallId: "graph-call://t217/s4",
      frameId: "frame://t217/s4",
      vectorIndex: 1,
      edge: "requirements→design",
      retryRunId: "retry-run://t217/s4/1",
      retryCallId: "retry-call://t217/s4/1",
      manifestId: "manifest://t217/s4/1"
    },
    {
      kind: "retry_attempt_stopped",
      basisId: "basis://t217/s4",
      graphCallId: "graph-call://t217/s4",
      frameId: "frame://t217/s4",
      vectorIndex: 1,
      edge: "requirements→design",
      reason: "stationary_retry",
      observedAttemptCount: 3,
      maxAttempts: 3
    },
    {
      kind: "payload_rejected",
      basisId: "basis://t217/s4",
      graphCallId: "graph-call://t217/s4",
      frameId: "frame://t217/s4",
      vectorIndex: 1,
      edge: "requirements→design",
      payloadRef: "payload://t217/s4/design-attempt",
      rejectionClass: "schema_mismatch",
      schemaRef: "schema://t217/s4/design",
      contractRef: null,
      contractDigest: null,
      digest: null,
      reason: "design payload failed schema admission",
      policyRefs: []
    },
    {
      kind: "runtime_failure_observed",
      basisId: "basis://t217/s4",
      surface: "fp_dispatch",
      failureClass: "contract_failure",
      message: "worker returned malformed design artifact",
      stackExcerpt: null
    },
    HALT_TERMINAL
  ];
}

function intakeEvent(overrides = {}) {
  return constructDefectIntakeAdmittedEvent({
    basisId: "basis://t217/s4",
    runId: "run://t217/s4",
    workKey: "wk://t217/s4",
    haltDiagnosisRef: "halt-diagnosis:fixture",
    owner: "abg/m03 contracts admission",
    changeClass: "realization_refactor",
    reEntryPoint: "realization",
    summary: "design payload schema admission rejects lawful worker shape",
    evidenceRefs: ["payload://t217/s4/design-attempt"],
    triagedBy: "observer://t217/s4",
    ...overrides
  });
}

test("T-217 S4 f1: halt diagnosis is a replay fold — frontier, evidence, attempt history; a non-halted replay diagnoses nothing", () => {
  const diagnosis = deriveHaltDiagnosis(haltReplay());
  assert.equal(diagnosis.halted, true);
  assert.match(diagnosis.haltReason, /declaration_reprice_required/u);
  assert.deepEqual(diagnosis.implicatedEdges, ["requirements→design"]);
  assert.equal(diagnosis.attemptRows.length, 2);
  assert.equal(diagnosis.attemptRows[1].rowKind, "stopped");
  assert.equal(diagnosis.attemptRows[1].reason, "stationary_retry");
  assert.equal(diagnosis.attemptRows[1].observedAttemptCount, 3);
  assert.equal(diagnosis.failureRows.length, 1);
  assert.equal(diagnosis.failureRows[0].failureClass, "contract_failure");
  assert.equal(diagnosis.rejectionRows.length, 1);
  assert.deepEqual(diagnosis.rejectionEvidenceRefs, [
    "payload://t217/s4/design-attempt"
  ]);
  assert.match(diagnosis.diagnosisRef, /^halt-diagnosis:/u);

  // a converged replay is not a halt
  const healthy = deriveHaltDiagnosis([
    { ...HALT_TERMINAL, terminalKind: "converged", reason: null }
  ]);
  assert.equal(healthy.halted, false);
  assert.equal(healthy.haltReason, null);
  // and the ordinal-DECISIVE terminal decides: a halt superseded by
  // convergence is resolved — in EITHER array order (S4 review P1)
  const [haltCanonical] = emit({ ...HALT_TERMINAL }, () => {});
  const [convergedCanonical] = emit(
    { ...HALT_TERMINAL, terminalKind: "converged", reason: null },
    () => {}
  );
  const recovered = deriveHaltDiagnosis([haltCanonical, convergedCanonical]);
  assert.equal(recovered.halted, false);
  const recoveredShuffled = deriveHaltDiagnosis([
    convergedCanonical,
    haltCanonical
  ]);
  assert.equal(
    recoveredShuffled.halted,
    false,
    "caller array order must not resurrect a resolved halt"
  );
  // multiple unorderable terminals fail closed
  assert.throws(
    () =>
      deriveHaltDiagnosis([
        HALT_TERMINAL,
        { ...HALT_TERMINAL, terminalKind: "converged", reason: null }
      ]),
    /Halt diagnosis \(terminal_reached\) requires admission ordinals/u
  );
});

test("T-217 S4 g1 (review P1): intakeRef binds evidence and triage attribution — partial-identity retriage is inadmissible", () => {
  const valid = intakeEvent();
  assertRuntimeEvent(valid);
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...valid,
        evidenceRefs: ["payload://t217/s4/design-attempt", "payload://smuggled"]
      }),
    /intakeRef must be the content-derived identity/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, triagedBy: "observer://impostor" }),
    /intakeRef must be the content-derived identity/u
  );
  // different evidence lawfully re-minted yields a DIFFERENT draft identity
  const other = intakeEvent({ evidenceRefs: ["payload://t217/s4/other"] });
  assert.notEqual(valid.intakeRef, other.intakeRef);
  const drafts = deriveTicketDraftsFromIntakes([valid, other]);
  assert.notEqual(drafts[0].draftRef, drafts[1].draftRef);
});

test("T-217 S4 g2 (review P2): diagnosisRef is injective over the whole projection — segment tie and reentry plans included", () => {
  const base = haltReplay();
  const withoutSegment = deriveHaltDiagnosis(base);
  const [stamp] = emit(
    constructRunSegmentOpenedEvent({
      basisId: "basis://t217/s4",
      runId: "run://t217/s4",
      workKey: "wk://t217/s4",
      segmentIndex: 1,
      workerId: "worker://t217",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node",
      declarationSetDigest: "digest://declaration-set/v1",
      declarationCount: 1
    }),
    () => {}
  );
  const withSegment = deriveHaltDiagnosis([...base, stamp]);
  assert.equal(withSegment.latestSegmentRef, stamp.segmentRef);
  assert.notEqual(
    withSegment.diagnosisRef,
    withoutSegment.diagnosisRef,
    "the segment tie is identity-bearing"
  );
  const withReentry = deriveHaltDiagnosis([
    ...base,
    {
      kind: "graph_reentry_planned",
      basisId: "basis://t217/s4",
      graphCallId: "graph-call://t217/s4",
      frameId: "frame://t217/s4",
      frameLineageId: null,
      graphFunctionId: "graph-function://t217/s4",
      runId: "run://t217/s4",
      workKey: "wk://t217/s4",
      planRef: "reentry-plan://t217/s4/1",
      fromTerminalVectorIndex: 2,
      targetVectorIndex: 1,
      changeClass: null,
      reEntryPoint: null,
      routeContractRefs: [],
      causingFrontierRowRefs: [],
      shadowedVectorIndexes: [],
      causationEventRefs: [],
      correlationId: "correlation://t217/s4/g2/reentry",
      reason: "diagnosis identity probe",
      generation: 0
    }
  ]);
  assert.deepEqual(withReentry.reentryPlanRefs, ["reentry-plan://t217/s4/1"]);
  assert.notEqual(
    withReentry.diagnosisRef,
    withoutSegment.diagnosisRef,
    "reentry plans are identity-bearing"
  );
});

test("T-217 S4 f2: intake admission — TICKET_METHOD triage authority is closed vocabulary, intakeRef self-certified", () => {
  const valid = intakeEvent();
  assertRuntimeEvent(valid);
  assert.match(valid.intakeRef, /^defect-intake:/u);

  assert.throws(
    () => assertRuntimeEvent({ ...valid, changeClass: "hotfix" }),
    /changeClass/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, reEntryPoint: "wherever" }),
    /reEntryPoint/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, owner: "" }),
    /owner/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, triagedBy: "" }),
    /triagedBy/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, intakeRef: "defect-intake:forged" }),
    /intakeRef must be the content-derived identity/u
  );
  // identity binds triage content: retriaging without re-mint is inadmissible
  assert.throws(
    () => assertRuntimeEvent({ ...valid, changeClass: "requirement_reprice" }),
    /intakeRef must be the content-derived identity/u
  );
});

test("T-217 S4 f3: ticket drafts derive FROM admitted intake records and carry the triage verbatim", () => {
  const first = intakeEvent();
  const second = intakeEvent({
    summary: "second defect: retry budget stationary on design edge",
    changeClass: "design_reframe",
    reEntryPoint: "design_surface"
  });
  const drafts = deriveTicketDraftsFromIntakes([first, second]);
  assert.equal(drafts.length, 2);
  assert.equal(drafts[0].intakeRef, first.intakeRef);
  assert.equal(drafts[0].title, first.summary);
  assert.equal(drafts[0].owner, first.owner);
  assert.equal(drafts[0].changeClass, "realization_refactor");
  assert.equal(drafts[0].reEntryPoint, "realization");
  assert.deepEqual(drafts[0].evidenceRefs, first.evidenceRefs);
  assert.equal(drafts[1].changeClass, "design_reframe");
  assert.match(drafts[0].draftRef, /^ticket-draft:/u);
  assert.notEqual(drafts[0].draftRef, drafts[1].draftRef);
});

test("T-217 S4 f4: the intake route presupposes a halt — fail closed on a healthy replay; on a halted one it binds diagnosis, admits, and drafts", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  assert.throws(
    () =>
      admitDefectIntake({
        basis,
        runtimeEvents: [],
        eventSink: () => {},
        owner: "abg/m03",
        changeClass: "realization_refactor",
        reEntryPoint: "realization",
        summary: "no halt to triage",
        triagedBy: "observer://t217/s4"
      }),
    /requires a halted run/u
  );

  const halted = haltReplay().map((event) =>
    event.kind === "terminal_reached" || event.basisId === undefined
      ? { ...event, basisId: basis.id }
      : { ...event, basisId: basis.id }
  );
  const sunk = [];
  const result = admitDefectIntake({
    basis,
    runtimeEvents: halted,
    eventSink: (event) => sunk.push(event),
    owner: "abg/m03 contracts admission",
    changeClass: "realization_refactor",
    reEntryPoint: "realization",
    summary: "design payload schema admission rejects lawful worker shape",
    triagedBy: "observer://t217/s4"
  });
  assert.equal(result.kind, "defect_intake_admission_result");
  assert.equal(result.diagnosis.halted, true);
  assert.equal(
    result.intakeEvent.haltDiagnosisRef,
    result.diagnosis.diagnosisRef,
    "the intake is bound to the replay-derived diagnosis"
  );
  assert.deepEqual(
    result.intakeEvent.evidenceRefs,
    result.diagnosis.rejectionEvidenceRefs,
    "evidence defaults to the diagnosis rejection refs"
  );
  const admitted = sunk.find((event) => event.kind === "defect_intake_admitted");
  assert.ok(admitted?.eventId, "the triage record is canonical replay truth");
  assert.equal(result.ticketDraft.intakeRef, result.intakeRef);
  assert.equal(result.ticketDraft.title, result.intakeEvent.summary);
});

test("T-217 S4 f5: full loop — S1's reprice guard halts the run, S4 diagnoses and triages it into a draft", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const declaration = (marker) =>
    sharedDeclaration({
      namespace: "t217/s4",
      subject: "live-subject",
      contentMarker: marker,
      graphFunctionRef: executive.id
    });
  const startupConfig = () =>
    sharedStartupConfig({ namespace: "t217/s4", subject: "live-subject" });

  const runOneEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runOneEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: startupConfig(),
      productDeclarations: [declaration("content-v1")],
      correlationId: "correlation://t217/s4/run1"
    }
  });

  // silent substrate drift: the S1 guard halts the resume
  const runTwoEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [...runOneEvents],
    eventSink: (event) => runTwoEvents.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: startupConfig(),
      productDeclarations: [declaration("content-v2")],
      correlationId: "correlation://t217/s4/run2"
    }
  });

  const fullReplay = [...runOneEvents, ...runTwoEvents];
  const diagnosis = deriveHaltDiagnosis(fullReplay);
  assert.equal(diagnosis.halted, true);
  assert.match(diagnosis.haltReason, /declaration_reprice_required/u);

  const basisAdmitted = runOneEvents.find(
    (event) => event.kind === "basis_admitted"
  );
  // C-5 (S2.4): the route-invocable spine comes FROM REPLAY — the
  // kernel API replaces the fixture-spread reconstruction hack
  const routeBasis = reconstructRouteBasisFromReplay(fullReplay);
  const sunk = [];
  const result = admitDefectIntake({
    basis: routeBasis,
    runtimeEvents: fullReplay,
    eventSink: (event) => sunk.push(event),
    owner: "specification/requirements + owning ticket",
    changeClass: "requirement_reprice",
    reEntryPoint: "requirements",
    summary:
      "resumed substrate drift without covering reprice: declaration content changed between segments",
    triagedBy: "observer://t217/s4"
  });
  assert.equal(result.diagnosis.halted, true);
  assert.equal(result.ticketDraft.changeClass, "requirement_reprice");
  assert.equal(result.ticketDraft.reEntryPoint, "requirements");
  assert.ok(basisAdmitted);
});
