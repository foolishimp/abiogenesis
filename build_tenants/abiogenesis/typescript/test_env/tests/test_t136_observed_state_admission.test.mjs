// Validates: T-136
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitObservedStateRecord,
  assertConstructionSnapshotObservedStateCoverage,
  assertObservedStateAdmitted,
  assertRuntimeEvent,
  constructConstructionObservationSnapshot,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  constructObservedStateAdmittedEvent,
  constructObservedStateRecord,
  deriveConstructionSnapshotObservedStateCoverage,
  deriveObservedStateProjection,
  deriveRuntimeAggregateProjection,
  ObservedStateSnapshotCoverageRejectedError,
  runEngineIterate,
  observedStateRecordFromEvent
} from "../../build/semantic/code/src/abg/m03/index.js";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const basis = buildThreeStageBasis({
  defaultRegime: "F_D",
  runId: "run://t136",
  workKey: "work-key://t136"
});

function observedStateEvent(input = {}) {
  return constructObservedStateAdmittedEvent({
    basis,
    observedStateRef: input.observedStateRef ?? "observed-state://t136/register/1",
    sourceKind: input.sourceKind ?? "register_json",
    scopeRef: input.scopeRef ?? "scope://t136/construction",
    sourceRef: input.sourceRef ?? "register://construction/gap-snapshot",
    digest: input.digest ?? "sha256:gap-snapshot-v1",
    version: input.version ?? "version://gap-snapshot/1",
    eventWatermark: input.eventWatermark ?? 7,
    freshnessPolicyRef:
      input.freshnessPolicyRef ?? "freshness-policy://event-watermark/current",
    derivationBasisRef: input.derivationBasisRef ?? "basis://projection/t136",
    basisProjectionRef: input.basisProjectionRef ?? "runtime-projection://t136/7",
    derivedFromRefs: input.derivedFromRefs ?? [
      "runtime-event://gap-snapshot/materialized",
      "register://construction/gap-snapshot"
    ],
    causationEventRefs: input.causationEventRefs ?? ["runtime-event://root"],
    correlationId: input.correlationId ?? "correlation://t136/root"
  });
}

function constructionSnapshot(input = {}) {
  return constructConstructionObservationSnapshot({
    episodeId: input.episodeId ?? "construction-episode://t136",
    observationId: input.observationId ?? "construction-observation://t136/1",
    basisRef: input.basisRef ?? basis.id,
    currentProjectionRef:
      input.currentProjectionRef ?? "runtime-projection://t136/current",
    iterationOrdinal: input.iterationOrdinal ?? 0,
    basisProjectionRef: input.basisProjectionRef ?? "runtime-projection://t136/7",
    priorIntentId: input.priorIntentId ?? null,
    causationRef: input.causationRef ?? "runtime-event://root",
    correlationId: input.correlationId ?? "correlation://t136/root",
    observedStateRefs: input.observedStateRefs ?? [
      "observed-state://t136/register/1"
    ],
    actionCatalogRef: input.actionCatalogRef ?? "construction-catalog://t136",
    authorityDigest: input.authorityDigest ?? "sha256:authority",
    pressureRows: input.pressureRows ?? []
  });
}

test("T-136 observed-state event admits replayable record identity", () => {
  const event = observedStateEvent();

  assertRuntimeEvent(event);

  const record = observedStateRecordFromEvent(event);
  const projection = deriveObservedStateProjection([event]);
  const outcome = admitObservedStateRecord({
    record,
    expectation: {
      expectedDigest: "sha256:gap-snapshot-v1",
      expectedVersion: "version://gap-snapshot/1",
      minimumEventWatermark: 7,
      requiredSourceKind: "register_json"
    }
  });

  assertObservedStateAdmitted(outcome);
  assert.equal(record.source.kind, "register_json");
  assert.equal(record.derivationBasis.eventWatermark, 7);
  assert.equal(projection.latestEventWatermark, 7);
  assert.deepEqual(projection.observedStateRefs, [
    "observed-state://t136/register/1"
  ]);
});

test("T-136 construction observations require admitted observed-state coverage", () => {
  const projection = deriveObservedStateProjection([observedStateEvent()]);
  const snapshot = constructionSnapshot();

  assertConstructionSnapshotObservedStateCoverage({ snapshot, projection });
  const rejected = deriveConstructionSnapshotObservedStateCoverage({
    snapshot: constructionSnapshot({
      observedStateRefs: ["observed-state://t136/register/missing"]
    }),
    projection
  });
  assert.equal(rejected.status, "rejected");
  assert.deepEqual(rejected.diagnosticRefs, [
    "observed_state_snapshot_unadmitted_ref"
  ]);
  assert.deepEqual(rejected.missingObservedStateRefs, [
    "observed-state://t136/register/missing"
  ]);
  assert.throws(
    () =>
      assertConstructionSnapshotObservedStateCoverage({
        snapshot: constructionSnapshot({
          observedStateRefs: ["observed-state://t136/register/missing"]
        }),
        projection
      }),
    ObservedStateSnapshotCoverageRejectedError
  );
});

test("T-136 runtime aggregate projection composes observed-state truth", () => {
  const event = observedStateEvent();
  const projection = deriveRuntimeAggregateProjection(basis, [event]);

  assert.equal(projection.observedState.latestEventWatermark, 7);
  assert.deepEqual(projection.observedState.observedStateRefs, [
    "observed-state://t136/register/1"
  ]);
  assert.equal(projection.observedState.records[0].source.kind, "register_json");
});

test("T-136 engine runner exposes admitted observed state without refresh polling", () => {
  const event = observedStateEvent();
  const observedInputs = [];
  const fdEvaluator = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://test/t136/fd-evaluator",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    evaluate: (input) => {
      observedInputs.push({
        observedStateProjectionRef: input.observedStateProjectionRef,
        observedStateRefs: input.observedStateRefs
      });
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    runtimeEvents: canonicalRuntimeEvents([event]),
    eventSink: () => {},
    plugins: { fdEvaluator }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.ok(observedInputs.length > 0);
  assert.deepEqual(observedInputs[0].observedStateRefs, [
    "observed-state://t136/register/1"
  ]);
  assert.match(
    observedInputs[0].observedStateProjectionRef,
    /^observed_state_projection:/
  );
});

test("T-136 stale and mismatched observed-state records fail closed", () => {
  const record = constructObservedStateRecord({
    observedStateRef: "observed-state://t136/workspace/file",
    sourceKind: "workspace_file",
    scopeRef: "scope://t136/workspace",
    sourceRef: "workspace://requirements.md",
    digest: "sha256:requirements-v1",
    version: "mtime://1",
    freshnessPolicyRef: "freshness-policy://watermark",
    derivationBasisRef: "basis://projection/t136",
    basisProjectionRef: "runtime-projection://t136/3",
    eventWatermark: 3,
    derivedFromRefs: ["workspace://requirements.md"]
  });
  const outcome = admitObservedStateRecord({
    record,
    expectation: {
      expectedDigest: "sha256:requirements-v2",
      expectedVersion: "mtime://2",
      minimumEventWatermark: 4,
      requiredSourceKind: "register_json"
    }
  });

  assert.equal(outcome.status, "rejected");
  assert.deepEqual(outcome.diagnosticRefs, [
    "observed_state_digest_mismatch",
    "observed_state_version_mismatch",
    "observed_state_event_watermark_stale",
    "observed_state_source_kind_mismatch"
  ]);
  assert.throws(() => assertObservedStateAdmitted(outcome), /is rejected/);
});

test("T-136 all declared observed-state source kinds are admission-eligible", () => {
  for (const sourceKind of [
    "derived_projection",
    "event_spine_watermark",
    "policy_config"
  ]) {
    const event = observedStateEvent({
      observedStateRef: `observed-state://t136/${sourceKind}`,
      sourceKind,
      sourceRef: `${sourceKind}://t136/source`
    });
    const record = observedStateRecordFromEvent(event);
    const outcome = admitObservedStateRecord({
      record,
      expectation: {
        expectedDigest: "sha256:gap-snapshot-v1",
        expectedVersion: "version://gap-snapshot/1",
        minimumEventWatermark: 7,
        requiredSourceKind: sourceKind
      }
    });

    assertObservedStateAdmitted(outcome);
    assert.equal(record.source.kind, sourceKind);
  }
});

test("T-136 observed-state records require derivation basis refs", () => {
  assert.throws(
    () =>
      constructObservedStateRecord({
        observedStateRef: "observed-state://t136/missing-basis",
        sourceKind: "derived_projection",
        scopeRef: "scope://t136/projection",
        sourceRef: "projection://current",
        digest: "sha256:projection",
        version: null,
        freshnessPolicyRef: "freshness-policy://projection",
        derivationBasisRef: "basis://projection/t136",
        basisProjectionRef: "runtime-projection://t136/1",
        eventWatermark: 1,
        derivedFromRefs: []
      }),
    /requires derivation basis refs/
  );
});

test("T-136 current process state cannot bypass observed-state admission", () => {
  const event = observedStateEvent();

  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        sourceKind: "process_cwd"
      }),
    /ObservedStateAdmittedRuntimeEvent.sourceKind must be one of/
  );
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        digest: ""
      }),
    /ObservedStateAdmittedRuntimeEvent.digest must be a non-empty string/
  );
});
