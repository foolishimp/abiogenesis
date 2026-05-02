// Validates: T-100-TS
// Validates: REQ-R-ABG3-FRAME
// Validates: REQ-R-ABG3-LINEAGE
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitScheduledSliceAssessment,
  admitWorkspaceAssetBinding,
  constructOutputPluginHandoffManifest,
  constructScheduledSliceAssessedEvent,
  constructScheduledSliceDispatchedEvent,
  constructScheduledSlicePluginHandoff,
  constructWorkspaceObligationLedgerAdmittedEvent,
  constructWorkspaceObligationScheduleDerivedEvent,
  constructZoomFoldbackEvaluatedEvent,
  constructZoomFrameOpenedEvent,
  deriveNextScheduledSlice,
  deriveObligationLedgerAsset,
  deriveObligationSchedule,
  deriveOuterTraversalEvaluation,
  deriveOutputInstanceAllocation,
  deriveScheduledSliceAssessmentsFromEvents,
  deriveWorkspaceSystemProjection,
  deriveWorkspaceZoomProjection,
  deriveZoomFoldbackEvaluationFromEvents,
  emit,
  foldScheduledSlices,
  openZoomFrame
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function ok(result) {
  assert.equal(result.ok, true);
  return result;
}

function buildScenario(rowCount = 2) {
  const basis = buildThreeStageBasis({ runId: "run://t100/workspace-zoom" });
  const inputBindingResult = admitWorkspaceAssetBinding({
    assetRef: "workspace://requirements_surface/current",
    assetType: "Workspace.requirements_surface",
    uri: `${basis.workspaceRoot}/requirements.md`,
    workspaceRoot: basis.workspaceRoot,
    bindingRole: "input",
    source: "caller"
  });
  const inputBinding = ok(inputBindingResult).binding;
  const outputAllocation = ok(
    deriveOutputInstanceAllocation({
      basis,
      outputName: "design_surface",
      outputAssetType: "Workspace.design_surface",
      relativePath: "design/design_surface.md"
    })
  ).allocation;
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    kind: "obligation_ledger_row",
    obligationId: `REQ-T100-${index + 1}`,
    authorityRef: `req://t100/${index + 1}`,
    description: `Requirement ${index + 1}`,
    status: "open",
    requiredOutputRefs: [outputAllocation.assetRef]
  }));
  const ledger = ok(
    deriveObligationLedgerAsset({
      basis,
      sourceAsset: inputBinding,
      authorityDigest: "authority-digest://t100",
      rows
    })
  ).ledger;
  const schedule = ok(deriveObligationSchedule(ledger)).schedule;
  const zoomFrame = openZoomFrame({
    basis,
    vectorIndex: 0,
    inputAsset: inputBinding,
    outputAllocation,
    ledger,
    schedule
  });
  const manifest = constructOutputPluginHandoffManifest({
    basis,
    manifestRef: "manifest://t100/plugin-handoff",
    admittedInputRefs: [inputBinding.assetRef],
    allocatedOutputs: [outputAllocation],
    proofObligationRefs: rows.map((row) => row.obligationId)
  });
  return { basis, inputBinding, outputAllocation, ledger, schedule, zoomFrame, manifest };
}

function assessmentFor(input) {
  return admitScheduledSliceAssessment({
    zoomFrame: input.zoomFrame,
    schedule: input.schedule,
    assessmentId: input.assessmentId,
    scheduleItemId: input.item.scheduleItemId,
    obligationId: input.item.obligationId,
    attemptIndex: input.attemptIndex,
    status: input.status,
    assessmentRegime: input.assessmentRegime,
    findingClass: input.findingClass,
    evidenceRefs: input.evidenceRefs ?? [`evidence://t100/${input.item.obligationId}`],
    outputRefs: input.outputRefs ?? [input.outputRef],
    runtimeFailureClass: input.runtimeFailureClass ?? null,
    detail: input.detail ?? null
  });
}

test("T-100 zoomed ledger and schedule fold to outer close from replayed slice truth", () => {
  const scenario = buildScenario();
  const dispatches = scenario.schedule.items.map((item, index) =>
    constructScheduledSlicePluginHandoff({
      manifest: scenario.manifest,
      zoomFrame: scenario.zoomFrame,
      item,
      pluginRef: "plugin://t100/fp-worker",
      attemptIndex: index
    })
  );
  const assessments = scenario.schedule.items.map((item, index) =>
    assessmentFor({
      ...scenario,
      item,
      assessmentId: `assessment://t100/${index + 1}`,
      attemptIndex: index,
      status: "fulfilled",
      outputRef: scenario.outputAllocation.assetRef
    })
  );
  const foldback = foldScheduledSlices({
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule,
    assessments
  });
  const outer = deriveOuterTraversalEvaluation({
    basis: scenario.basis,
    zoomFrame: scenario.zoomFrame,
    foldback
  });
  const events = [
    constructWorkspaceObligationLedgerAdmittedEvent({
      basis: scenario.basis,
      vectorIndex: 0,
      ledger: scenario.ledger
    }),
    constructWorkspaceObligationScheduleDerivedEvent({
      basis: scenario.basis,
      vectorIndex: 0,
      schedule: scenario.schedule
    }),
    constructZoomFrameOpenedEvent({
      basis: scenario.basis,
      zoomFrame: scenario.zoomFrame
    }),
    ...dispatches.map((dispatch) =>
      constructScheduledSliceDispatchedEvent({
        basis: scenario.basis,
        zoomFrame: scenario.zoomFrame,
        dispatch
      })
    ),
    ...assessments.map((assessment) =>
      constructScheduledSliceAssessedEvent({
        basis: scenario.basis,
        zoomFrame: scenario.zoomFrame,
        assessment
      })
    ),
    constructZoomFoldbackEvaluatedEvent({
      basis: scenario.basis,
      zoomFrame: scenario.zoomFrame,
      foldback
    })
  ];
  const emitted = [];
  emit(events, (event) => emitted.push(event));
  const projection = deriveWorkspaceZoomProjection({
    basis: scenario.basis,
    events: emitted,
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule
  });
  const replayedAssessments = deriveScheduledSliceAssessmentsFromEvents({
    basis: scenario.basis,
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule,
    events: emitted
  });
  const replayedFoldback = deriveZoomFoldbackEvaluationFromEvents({
    basis: scenario.basis,
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule,
    events: emitted
  });
  const system = deriveWorkspaceSystemProjection({
    workspaceRoot: scenario.basis.workspaceRoot,
    assetRefs: [scenario.ledger.ledgerRef, scenario.schedule.scheduleRef]
  });

  assert.equal(foldback.decision, "close");
  assert.equal(outer.closureAllowed, true);
  assert.equal(outer.nextAction, "close");
  assert.deepEqual(projection.ledgerRefs, [scenario.ledger.ledgerRef]);
  assert.deepEqual(projection.scheduleRefs, [scenario.schedule.scheduleRef]);
  assert.equal(projection.assessedSliceRefs.length, 2);
  assert.equal(projection.foldbackEvaluation.decision, "close");
  assert.equal(replayedAssessments.length, 2);
  assert.equal(replayedFoldback.decision, "close");
  assert.match(system.systemRoot, /\/\.ai-workspace$/);
});

test("T-100 fulfilled slice assessment requires evidence and required output refs", () => {
  const scenario = buildScenario(1);
  const item = scenario.schedule.items[0];
  assert.ok(item);

  assert.throws(
    () =>
      assessmentFor({
        ...scenario,
        item,
        assessmentId: "assessment://t100/missing-evidence",
        attemptIndex: 0,
        status: "fulfilled",
        evidenceRefs: [],
        outputRef: scenario.outputAllocation.assetRef
      }),
    /evidence refs/
  );
  assert.throws(
    () =>
      assessmentFor({
        ...scenario,
        item,
        assessmentId: "assessment://t100/missing-output",
        attemptIndex: 0,
        status: "fulfilled",
        outputRefs: [],
        outputRef: scenario.outputAllocation.assetRef
      }),
    /required output refs/
  );
  assert.throws(
    () =>
      foldScheduledSlices({
        zoomFrame: scenario.zoomFrame,
        schedule: scenario.schedule,
        assessments: [
          {
            kind: "scheduled_slice_assessment",
            zoomFrameId: scenario.zoomFrame.zoomFrameId,
            assessmentId: "assessment://t100/bypassed-admission",
            scheduleItemId: item.scheduleItemId,
            obligationId: item.obligationId,
            attemptIndex: 0,
            status: "fulfilled",
            evidenceRefs: ["evidence://t100/bypassed-admission"],
      outputRefs: [],
      assessmentRegime: "F_P",
      findingClass: "fulfilled",
      runtimeFailureClass: null,
      detail: null
          }
        ]
      }),
    /required output refs/
  );
});

test("T-100 replay-derived foldback rejects asserted foldback mismatch", () => {
  const scenario = buildScenario(1);
  const item = scenario.schedule.items[0];
  assert.ok(item);
  const assessment = assessmentFor({
    ...scenario,
    item,
    assessmentId: "assessment://t100/replay-close",
    attemptIndex: 0,
    status: "fulfilled",
    outputRef: scenario.outputAllocation.assetRef
  });
  const events = [
    constructZoomFrameOpenedEvent({
      basis: scenario.basis,
      zoomFrame: scenario.zoomFrame
    }),
    constructScheduledSliceAssessedEvent({
      basis: scenario.basis,
      zoomFrame: scenario.zoomFrame,
      assessment
    }),
    {
      kind: "zoom_foldback_evaluated",
      basisId: scenario.basis.id,
      graphCallId: `graph-call:${scenario.basis.id}`,
      frameId: `frame:${scenario.basis.id}:root`,
      vectorIndex: 0,
      edge: scenario.zoomFrame.edge,
      zoomFrameId: scenario.zoomFrame.zoomFrameId,
      foldbackRef: `${scenario.zoomFrame.zoomFrameId}:foldback:${scenario.schedule.scheduleRef}`,
      decision: "blocked",
      fulfilledCount: 0,
      openCount: 0,
      blockedCount: 1,
      runtimeFailureCount: 0,
      missingAssessmentCount: 0,
      conflictingCount: 0
    }
  ];

  assert.throws(
    () =>
      deriveWorkspaceZoomProjection({
        basis: scenario.basis,
        events,
        zoomFrame: scenario.zoomFrame,
        schedule: scenario.schedule
      }),
    /replay-derived foldback truth/
  );
});

test("T-100 zoom frame rejects mismatched basis lineage", () => {
  const scenario = buildScenario(1);

  assert.throws(
    () =>
      openZoomFrame({
        basis: scenario.basis,
        vectorIndex: 0,
        inputAsset: scenario.inputBinding,
        outputAllocation: {
          ...scenario.outputAllocation,
          basisId: "basis://other"
        },
        ledger: scenario.ledger,
        schedule: scenario.schedule
      }),
    /Output allocation must share the execution basis/
  );
  assert.throws(
    () =>
      openZoomFrame({
        basis: scenario.basis,
        vectorIndex: 0,
        inputAsset: {
          ...scenario.inputBinding,
          workspaceRoot: "/workspace/other"
        },
        outputAllocation: scenario.outputAllocation,
        ledger: scenario.ledger,
        schedule: scenario.schedule
      }),
    /execution workspace/
  );
});

test("T-100 scheduled handoff rejects manifest that lacks zoom output", () => {
  const scenario = buildScenario(1);
  const item = scenario.schedule.items[0];
  assert.ok(item);
  const otherOutput = ok(
    deriveOutputInstanceAllocation({
      basis: scenario.basis,
      outputName: "other_design_surface",
      outputAssetType: "Workspace.design_surface",
      relativePath: "design/other_design_surface.md"
    })
  ).allocation;
  const wrongManifest = constructOutputPluginHandoffManifest({
    basis: scenario.basis,
    manifestRef: "manifest://t100/wrong-output",
    admittedInputRefs: [scenario.inputBinding.assetRef],
    allocatedOutputs: [otherOutput],
    proofObligationRefs: [item.obligationId]
  });

  assert.throws(
    () =>
      constructScheduledSlicePluginHandoff({
        manifest: wrongManifest,
        zoomFrame: scenario.zoomFrame,
        item,
        pluginRef: "plugin://t100/fp-worker",
        attemptIndex: 0
      }),
    /zoom output asset/
  );
});

test("T-100 missing slice assessment creates same-edge retry pressure instead of closure", () => {
  const scenario = buildScenario();
  const firstItem = scenario.schedule.items[0];
  const secondItem = scenario.schedule.items[1];
  assert.ok(firstItem);
  assert.ok(secondItem);
  const assessments = [
    assessmentFor({
      ...scenario,
      item: firstItem,
      assessmentId: "assessment://t100/first",
      attemptIndex: 0,
      status: "fulfilled",
      outputRef: scenario.outputAllocation.assetRef
    })
  ];
  const foldback = foldScheduledSlices({
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule,
    assessments
  });
  const next = deriveNextScheduledSlice({
    schedule: scenario.schedule,
    assessments
  });
  const outer = deriveOuterTraversalEvaluation({
    basis: scenario.basis,
    zoomFrame: scenario.zoomFrame,
    foldback
  });

  assert.equal(foldback.decision, "retry_scheduled_slice");
  assert.equal(foldback.missingAssessmentCount, 1);
  assert.equal(next.kind, "dispatch_slice");
  assert.equal(next.item.scheduleItemId, secondItem.scheduleItemId);
  assert.equal(outer.nextAction, "retry_same_edge");
});

test("T-100 later runtime failure does not erase prior admitted fulfillment", () => {
  const scenario = buildScenario(1);
  const item = scenario.schedule.items[0];
  assert.ok(item);
  const assessments = [
    assessmentFor({
      ...scenario,
      item,
      assessmentId: "assessment://t100/fulfilled",
      attemptIndex: 0,
      status: "fulfilled",
      outputRef: scenario.outputAllocation.assetRef
    }),
    assessmentFor({
      ...scenario,
      item,
      assessmentId: "assessment://t100/runtime-failed-after-fulfilled",
      attemptIndex: 1,
      status: "runtime_failed",
      evidenceRefs: ["process://t100/silent-worker"],
      outputRefs: [],
      outputRef: scenario.outputAllocation.assetRef,
      runtimeFailureClass: "transport_failure",
      detail: "worker stopped after prior fulfillment"
    })
  ];

  const foldback = foldScheduledSlices({
    zoomFrame: scenario.zoomFrame,
    schedule: scenario.schedule,
    assessments
  });

  assert.equal(foldback.decision, "close");
  assert.equal(foldback.fulfilledCount, 1);
  assert.equal(foldback.runtimeFailureCount, 0);
});

test("T-100 runtime failure before fulfillment stays retryable and conflicting semantic evidence reprices", () => {
  const runtimeFailureScenario = buildScenario(1);
  const item = runtimeFailureScenario.schedule.items[0];
  assert.ok(item);
  const runtimeOnly = [
    assessmentFor({
      ...runtimeFailureScenario,
      item,
      assessmentId: "assessment://t100/runtime-only",
      attemptIndex: 0,
      status: "runtime_failed",
      evidenceRefs: ["process://t100/no-output"],
      outputRefs: [],
      outputRef: runtimeFailureScenario.outputAllocation.assetRef,
      runtimeFailureClass: "transport_failure",
      detail: "worker produced no output"
    })
  ];
  const runtimeFoldback = foldScheduledSlices({
    zoomFrame: runtimeFailureScenario.zoomFrame,
    schedule: runtimeFailureScenario.schedule,
    assessments: runtimeOnly
  });
  assert.equal(runtimeFoldback.decision, "retry_scheduled_slice");
  assert.equal(runtimeFoldback.runtimeFailureCount, 1);

  const conflictScenario = buildScenario(1);
  const conflictItem = conflictScenario.schedule.items[0];
  assert.ok(conflictItem);
  const conflicting = [
    assessmentFor({
      ...conflictScenario,
      item: conflictItem,
      assessmentId: "assessment://t100/conflict-fulfilled",
      attemptIndex: 0,
      status: "fulfilled",
      outputRef: conflictScenario.outputAllocation.assetRef
    }),
    assessmentFor({
      ...conflictScenario,
      item: conflictItem,
      assessmentId: "assessment://t100/conflict-blocked",
      attemptIndex: 0,
      status: "blocked",
      evidenceRefs: ["evidence://t100/conflict"],
      outputRefs: [],
      outputRef: conflictScenario.outputAllocation.assetRef,
      detail: "semantic contradiction"
    })
  ];
  const conflictFoldback = foldScheduledSlices({
    zoomFrame: conflictScenario.zoomFrame,
    schedule: conflictScenario.schedule,
    assessments: conflicting
  });
  assert.equal(conflictFoldback.decision, "reprice_required");
  assert.equal(conflictFoldback.conflictingCount, 1);

  const partialBlockedScenario = buildScenario(1);
  const partialBlockedItem = partialBlockedScenario.schedule.items[0];
  assert.ok(partialBlockedItem);
  const partialBlocked = [
    assessmentFor({
      ...partialBlockedScenario,
      item: partialBlockedItem,
      assessmentId: "assessment://t100/conflict-partial",
      attemptIndex: 0,
      status: "partial",
      evidenceRefs: ["evidence://t100/partial"],
      outputRefs: [],
      outputRef: partialBlockedScenario.outputAllocation.assetRef,
      detail: "partial evidence"
    }),
    assessmentFor({
      ...partialBlockedScenario,
      item: partialBlockedItem,
      assessmentId: "assessment://t100/conflict-blocked",
      attemptIndex: 0,
      status: "blocked",
      evidenceRefs: ["evidence://t100/blocked"],
      outputRefs: [],
      outputRef: partialBlockedScenario.outputAllocation.assetRef,
      detail: "blocked evidence"
    })
  ];
  const partialBlockedFoldback = foldScheduledSlices({
    zoomFrame: partialBlockedScenario.zoomFrame,
    schedule: partialBlockedScenario.schedule,
    assessments: partialBlocked
  });
  assert.equal(partialBlockedFoldback.decision, "reprice_required");
  assert.equal(partialBlockedFoldback.conflictingCount, 1);
});
