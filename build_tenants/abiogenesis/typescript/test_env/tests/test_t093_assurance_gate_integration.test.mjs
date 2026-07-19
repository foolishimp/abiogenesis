// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-RUN
// Validates: T-093-TS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructAuthoritySnapshotAdmittedEvent,
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  constructEvidenceAdmittedEvent,
  constructOutputMaterializationObservedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  deriveOutputInstanceAllocation,
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding,
  runEngineIterate,
  start
} from "../../build/semantic/code/src/index.js";
import {
  constructRunArchiveFinalizationRequest,
  constructRunArchiveMetadataRef,
  constructRunArchiveNoteRef,
  constructRunArchiveSummaryRef,
  finalizeRunArchive
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  constructWorkspaceHygieneStampedEvent,
  deriveWorkspaceHygieneRows
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";

function snapshotForScope(scope) {
  return constructAssuranceAuthoritySnapshot({
    authoritySnapshotRef:
      `authority-snapshot://assurance/${scope.vectorIndex}`,
    scope,
    authorityRefs: [`req://assurance/${scope.vectorIndex}`],
    inputRefs: ["input://current"],
    authorityDigest: `authority-digest-${scope.vectorIndex}`,
    inputDigest: "input-digest-current",
    providerRefs: ["provider://authority"],
    policyRefs: ["policy://assurance"]
  });
}

function fulfilledEvidence(scope, authoritySnapshot) {
  return constructAssuranceEvidenceRow({
    scope,
    evidenceRef: `evidence://assurance/${scope.vectorIndex}`,
    authorityRef: authoritySnapshot.authoritySnapshotRef,
    authorityDigest: authoritySnapshot.authorityDigest,
    inputDigest: authoritySnapshot.inputDigest,
    eventRefs: [`event://assurance/${scope.vectorIndex}`],
    providerRefs: ["provider://evidence"],
    policyRefs: ["policy://assurance"]
  });
}

function fulfilledAssuranceProvider() {
  return Object.freeze({
    authoritySnapshot: ({ scope }) => snapshotForScope(scope),
    evidenceRows: ({ scope, authoritySnapshot }) => [
      fulfilledEvidence(scope, authoritySnapshot)
    ]
  });
}

function missingEvidenceAssuranceProvider() {
  return Object.freeze({
    authoritySnapshot: ({ scope }) => snapshotForScope(scope),
    evidenceRows: () => []
  });
}

function ledgerOnlyAssuranceProvider() {
  return Object.freeze({
    authoritySnapshot: () => null
  });
}

function targetCarrierFulfillmentEvents(basis) {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const events = [];
  for (let vectorIndex = 0; vectorIndex < basis.graph.vectors.length; vectorIndex += 1) {
    const vector = basis.graph.vectors[vectorIndex];
    const binding = resolveTargetCarrierContractBinding({ vector, defaults });
    const payloadRef = `payload://assurance/${vectorIndex}/target-carrier`;
    const digest = `digest://assurance/${vectorIndex}/target-carrier`;
    events.push(
      constructPayloadObservedEvent({
        basis,
        vectorIndex,
        payloadRef,
        payloadClass: binding.outputCarrierKind,
        contractRef: binding.contractRef,
        digest,
        producerRef: "provider://target-carrier",
        authorityRef: `req://assurance/${vectorIndex}`,
        inputDigest: "input-digest-current",
        policyRefs: ["policy://assurance"]
      }),
      constructPayloadValidatedEvent({
        basis,
        vectorIndex,
        payloadRef,
        contractRef: binding.contractRef,
        contractDigest: binding.configDigest,
        digest,
        validationRef: `validation://assurance/${vectorIndex}/target-carrier`,
        policyRefs: ["policy://assurance"]
      })
    );
  }
  return canonicalRuntimeEvents(events);
}

function eventSourcedFulfillmentEvents(basis) {
  const events = [];
  for (let vectorIndex = 0; vectorIndex < basis.graph.vectors.length; vectorIndex += 1) {
    const authorityRef = `req://assurance/${vectorIndex}`;
    const authoritySnapshotRef =
      `authority-snapshot://assurance/${vectorIndex}`;
    const payloadRef = `payload://assurance/${vectorIndex}`;
    const evidenceRef = `evidence://assurance/${vectorIndex}`;
    const authorityDigest = `authority-digest-${vectorIndex}`;
    const inputDigest = "input-digest-current";
    events.push(
      constructAuthoritySnapshotAdmittedEvent({
        basis,
        vectorIndex,
        authoritySnapshotRef,
        authorityRefs: [authorityRef],
        inputRefs: ["input://current"],
        authorityDigest,
        inputDigest,
        providerRefs: ["provider://authority"],
        policyRefs: ["policy://assurance"]
      }),
      ...targetCarrierFulfillmentEvents(basis).filter(
        (event) => event.vectorIndex === vectorIndex
      ),
      constructPayloadObservedEvent({
        basis,
        vectorIndex,
        payloadRef,
        payloadClass: "evidence",
        contractRef: "contract://assurance/evidence",
        digest: `digest://assurance/${vectorIndex}`,
        producerRef: "provider://evidence",
        authorityRef: authoritySnapshotRef,
        inputDigest,
        policyRefs: ["policy://assurance"]
      }),
      constructPayloadValidatedEvent({
        basis,
        vectorIndex,
        payloadRef,
        contractRef: "contract://assurance/evidence",
        digest: `digest://assurance/${vectorIndex}`,
        validationRef: `validation://assurance/${vectorIndex}`,
        evidenceRef,
        policyRefs: ["policy://assurance"]
      }),
      constructEvidenceAdmittedEvent({
        basis,
        vectorIndex,
        evidenceRef,
        payloadRef,
        authorityRef: authoritySnapshotRef,
        authorityDigest,
        inputDigest,
        providerRefs: ["provider://evidence"],
        policyRefs: ["policy://assurance"]
      })
    );
  }
  return canonicalRuntimeEvents(events);
}

function memoryWriter() {
  const files = new Map();
  const directories = new Set();
  return Object.freeze({
    ensureDirectory: async (targetPath) => {
      directories.add(targetPath);
    },
    writeTextFile: async (targetPath, content) => {
      files.set(targetPath, content);
    },
    readTextFile: async (targetPath) => files.get(targetPath) ?? null,
    isDirectory: async (targetPath) => directories.has(targetPath),
    isFile: async (targetPath) => files.has(targetPath)
  });
}

test("T-093-TS runner records convergence without assurance capability as non-closure", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => {}
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.assuranceGate.kind, "not_assurance_capable");
  assert.deepStrictEqual(result.assuranceGate.projectionRefs, []);
});

test("T-093-TS provider-only assurance rows block as invalid ledger truth", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });

  const result = runEngineIterate({
    basis,
    runtimeEvents: targetCarrierFulfillmentEvents(basis),
    eventSink: () => {},
    assuranceProvider: missingEvidenceAssuranceProvider()
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /assurance closure blocked/);
  assert.equal(result.assuranceGate.kind, "assurance_blocked");
  assert.deepStrictEqual(result.assuranceGate.closureDecisions, ["block"]);
  assert.deepStrictEqual(result.assuranceGate.blockingStatuses, [
    "event_ledger_invalid"
  ]);
});

test("T-093-TS public start blocks provider-only assurance truth without owning closure", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });

  const outcome = start(
    input,
    {
      ...context,
      runtimeEvents: targetCarrierFulfillmentEvents(basis),
      assuranceProvider: missingEvidenceAssuranceProvider()
    },
    () => {}
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "gap_stop");
  assert.equal(outcome.trace.assurance.status, "assurance_blocked");
  assert.deepStrictEqual(outcome.trace.assurance.closureDecisions, ["block"]);
  assert.deepStrictEqual(outcome.trace.assurance.blockingStatuses, [
    "event_ledger_invalid"
  ]);
});

test("T-093-TS provider-only fulfilled assurance cannot close without ledger facts", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });

  const outcome = start(
    input,
    {
      ...context,
      runtimeEvents: targetCarrierFulfillmentEvents(basis),
      assuranceProvider: fulfilledAssuranceProvider()
    },
    () => {}
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.trace.assurance.status, "assurance_blocked");
  assert.deepStrictEqual(outcome.trace.assurance.closureDecisions, ["block"]);
  assert.deepStrictEqual(outcome.trace.assurance.blockingStatuses, [
    "event_ledger_invalid"
  ]);
});

test("T-093-TS event-sourced assurance facts permit convergence and public trace closure", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });

  const outcome = start(
    input,
    {
      ...context,
      runtimeEvents: eventSourcedFulfillmentEvents(basis),
      assuranceProvider: ledgerOnlyAssuranceProvider()
    },
    () => {}
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.trace.assurance.status, "assurance_closed");
  assert.deepStrictEqual(outcome.trace.assurance.closureDecisions, ["close"]);
  assert.deepStrictEqual(outcome.trace.assurance.blockingStatuses, []);
  assert.equal(outcome.trace.assurance.projectionRefs.length, 3);
});

test("T-093-TS archive summary renders assurance projection as read-model truth", async () => {
  const writer = memoryWriter();
  const request = constructRunArchiveFinalizationRequest({
    scenarioName: "assurance_gate",
    archiveRoot: "/archive/assurance_gate",
    metadata: constructRunArchiveMetadataRef({
      usecaseId: "assurance_gate",
      testName: "test_t093_assurance_gate",
      timestamp: "2026-04-29T08:30:00Z",
      testPassed: true,
      sourceCommit: "commit://typescript-dev",
      runtimeRef: "runtime://node-test",
      notes: [
        constructRunArchiveNoteRef({
          label: "assurance",
          timestamp: "2026-04-29T08:30:00Z",
          detail: "archive summary consumes assurance projection"
        })
      ]
    }),
    summary: constructRunArchiveSummaryRef({
      workspacePath: "/workspace/assurance_gate",
      totalEvents: 4,
      eventTypes: ["basis_admitted", "terminal_reached"],
      manifestFiles: [],
      resultFiles: [],
      converged: true,
      totalDelta: 0,
      assurance: {
        status: "assurance_blocked",
        reason: "partial_or_missing_evidence_requires_retry_or_repair",
        projectionRefs: ["assurance_projection://blocked"],
        closureDecisions: ["retry"],
        blockingStatuses: ["missing"]
      }
    }),
    stdoutLog: "",
    stderrLog: "",
    sourceFiles: []
  });

  const outcome = await finalizeRunArchive(request, writer);
  const summary = JSON.parse(
    await writer.readTextFile("/archive/assurance_gate/summary.json")
  );

  assert.equal(outcome.kind, "finalized");
  assert.equal(summary.converged, true);
  assert.deepStrictEqual(summary.assurance, {
    status: "assurance_blocked",
    reason: "partial_or_missing_evidence_requires_retry_or_repair",
    projection_refs: ["assurance_projection://blocked"],
    closure_decisions: ["retry"],
    blocking_statuses: ["missing"]
  });
});

// ---------------------------------------------------------------------------
// T-217 Phase 2 S2.2 — the WITNESS-007 enforcement half at the TERMINAL
// assurance gate: a run whose assurance facts fully close cannot close
// over this basis's foreign-written evidence; clean re-measurement
// restores closure. (The per-vector evaluation fold consumes the same
// shared gate law — applyClosureTaintGate — unit-covered in
// test_t217_closure_taint_gate.)
// ---------------------------------------------------------------------------

function t217TaintFixture() {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const allocated = deriveOutputInstanceAllocation({
    basis,
    outputName: "report",
    outputAssetType: "Workspace.report",
    relativePath: "report.md"
  });
  assert.equal(allocated.ok, true);
  const materialization = constructOutputMaterializationObservedEvent({
    basis,
    vectorIndex: 0,
    allocation: allocated.allocation,
    materializedRef: "materialized://t217/s22/report",
    materializedPath: `${allocated.allocation.materializationRoot}/report.md`,
    digest: "sha256:admitted-report",
    observerRef: "observer://t217/s22/gate",
    artifactRefs: []
  });
  const stampFor = (observedDigest, copyOutRef = null) =>
    constructWorkspaceHygieneStampedEvent({
      basisId: basis.id,
      runId: basis.runId,
      workKey: basis.workKey,
      segmentRef: null,
      observedBy: "kernel://workspace-digest-instrument",
      rows: deriveWorkspaceHygieneRows({
        observations: [
          {
            artifactRef: "materialized://t217/s22/report",
            observedDigest,
            copyOutRef
          }
        ],
        replayEvents: [materialization]
      })
    });
  return { basis, input, context, materialization, stampFor };
}

test("T-217 S2.2 (WITNESS-007): the terminal assurance gate cannot close over this basis's foreign-written evidence", () => {
  const { basis, input, context, materialization, stampFor } =
    t217TaintFixture();
  const emitted = [];
  const outcome = start(
    input,
    {
      ...context,
      runtimeEvents: [
        ...eventSourcedFulfillmentEvents(basis),
        ...canonicalRuntimeEvents([
          materialization,
          stampFor("sha256:hand-edited", "copyout://t217/s22/report/1")
        ])
      ],
      assuranceProvider: ledgerOnlyAssuranceProvider()
    },
    (event) => emitted.push(event)
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "gap_stop");
  assert.equal(outcome.trace.assurance.status, "assurance_blocked");
  assert.deepStrictEqual(outcome.trace.assurance.blockingStatuses, [
    "contradictory_evidence"
  ]);
  const terminal = emitted.findLast(
    (event) => event.kind === "terminal_reached"
  );
  assert.match(
    terminal.reason ?? "",
    /workspace_hygiene_taint/u,
    "the halt reason names the taint in replay truth"
  );
  assert.match(terminal.reason ?? "", /materialized:\/\/t217\/s22\/report/u);
});

test("T-217 S2.2 (WITNESS-007): clean re-measurement resolves the taint and the same run closes", () => {
  const { basis, input, context, materialization, stampFor } =
    t217TaintFixture();
  const outcome = start(
    input,
    {
      ...context,
      runtimeEvents: [
        ...eventSourcedFulfillmentEvents(basis),
        ...canonicalRuntimeEvents([
          materialization,
          stampFor("sha256:hand-edited", "copyout://t217/s22/report/1"),
          stampFor("sha256:admitted-report")
        ])
      ],
      assuranceProvider: ledgerOnlyAssuranceProvider()
    },
    () => {}
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.trace.assurance.status, "assurance_closed");
  assert.deepStrictEqual(outcome.trace.assurance.closureDecisions, ["close"]);
});
