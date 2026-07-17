// Validates: T-270; current replay observation is derived, scoped, and sealed.

import assert from "node:assert/strict";
import test from "node:test";

import {
  constructConstructionObservationSnapshot,
  RUNTIME_EVENT_KIND_VALUES
} from "../../build/semantic/code/src/index.js";
import * as publicApi from "../../build/semantic/code/src/index.js";
import {
  deriveCurrentObservationBasisProjection
} from "../../build/semantic/code/src/abg/m03/contracts/current_observation.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  materializedObservationEvent
} from "./support/t270-current-observation-fixtures.mjs";

const PROGRAM = Object.freeze({
  ref: "gtl-program://t270/current-observation",
  digest: stableSha256Digest({ program: "t270-current-observation" })
});
const WORKSPACE = Object.freeze({
  ref: "workspace-binding://t270/current-observation",
  digest: stableSha256Digest({ workspace: "t270-current-observation" })
});

function observation({
  observationId = "observation://t270/current-observation",
  iterationOrdinal = 0,
  observedStateRefs = ["state://t270/one"],
  workspace = WORKSPACE
} = {}) {
  return constructConstructionObservationSnapshot({
    episodeId: "episode://t270/current-observation",
    observationId,
    basisRef: workspace.ref,
    currentProjectionRef: `projection://t270/runtime/${String(iterationOrdinal)}`,
    iterationOrdinal,
    basisProjectionRef: `replay://t270/${String(iterationOrdinal)}`,
    priorIntentId: null,
    causationRef: `causation://t270/${String(iterationOrdinal)}`,
    correlationId: "correlation://t270/current-observation",
    observedStateRefs,
    actionCatalogRef: "catalog://t270/current-observation",
    authorityDigest: stableSha256Digest({ authority: iterationOrdinal }),
    pressureRows: []
  });
}

function derive(observed, replayEvents, workspace = WORKSPACE) {
  return deriveCurrentObservationBasisProjection({
    episodeId: observed.episodeId,
    admittedProgram: PROGRAM,
    workspaceBinding: workspace,
    observation: observed,
    replayEvents
  });
}

test("T-270 observation digest covers full normalized content under one identity", () => {
  const first = observation();
  const changed = observation({ observedStateRefs: ["state://t270/two"] });

  assert.equal(first.observationId, changed.observationId);
  assert.notEqual(first.snapshotDigest, changed.snapshotDigest);
  assert.throws(
    () => derive(changed, [materializedObservationEvent({
      observation: first,
      program: PROGRAM,
      workspaceBinding: WORKSPACE,
      ordinal: 1
    })]),
    /snapshot differs from the decisive replay event/u
  );
});

test("T-270 chooses the latest in-scope observation by admission ordinal", () => {
  const first = observation();
  const second = observation({
    observationId: "observation://t270/current-observation/second",
    iterationOrdinal: 1,
    observedStateRefs: ["state://t270/two"]
  });
  const firstEvent = materializedObservationEvent({
    observation: first,
    program: PROGRAM,
    workspaceBinding: WORKSPACE,
    ordinal: 2
  });
  const secondEvent = materializedObservationEvent({
    observation: second,
    program: PROGRAM,
    workspaceBinding: WORKSPACE,
    ordinal: 10,
    causationEventRefs: Object.freeze([
      "event://t270/additional-cause",
      second.causationRef
    ])
  });

  const projection = derive(second, [secondEvent, firstEvent]);
  assert.equal(projection.observationId, second.observationId);
  assert.equal(projection.materializedEventAdmissionOrdinal, 10);
  assert.equal(projection.workspaceBindingRef, WORKSPACE.ref);
  assert.throws(
    () => derive(first, [firstEvent, secondEvent]),
    /snapshot differs from the decisive replay event/u
  );
});

test("T-270 unrelated later scope does not stale the current observation or fork its basis", () => {
  const current = observation();
  const otherWorkspace = Object.freeze({
    ref: "workspace-binding://t270/unrelated",
    digest: stableSha256Digest({ workspace: "t270-unrelated" })
  });
  const unrelated = observation({
    observationId: "observation://t270/unrelated",
    iterationOrdinal: 3,
    workspace: otherWorkspace
  });
  const currentEvent = materializedObservationEvent({
    observation: current,
    program: PROGRAM,
    workspaceBinding: WORKSPACE,
    ordinal: 4
  });
  const unrelatedEvent = materializedObservationEvent({
    observation: unrelated,
    program: PROGRAM,
    workspaceBinding: otherWorkspace,
    ordinal: 40
  });

  const projection = derive(current, [unrelatedEvent, currentEvent]);
  assert.equal(projection.observationId, current.observationId);
  assert.equal(projection.workspaceBindingRef, WORKSPACE.ref);
  assert.doesNotMatch(projection.projectionRef, /basis[_-]fork/u);
});

test("T-270 refuses event mismatch and missing or colliding replay ordinals", () => {
  const current = observation();
  const event = materializedObservationEvent({
    observation: current,
    program: PROGRAM,
    workspaceBinding: WORKSPACE,
    ordinal: 7
  });
  assert.throws(
    () => derive(current, [{ ...event, snapshotDigest: "sha256:mismatch" }]),
    /snapshot differs from the decisive replay event/u
  );
  assert.throws(
    () => derive(current, [{
      ...event,
      currentProjectionRef: "projection://t270/malformed-replay"
    }]),
    /snapshot differs from the decisive replay event/u
  );
  assert.throws(
    () => derive(current, [{
      ...event,
      observedStateRefs: Object.freeze(["state://t270/malformed-replay"])
    }]),
    /snapshot differs from the decisive replay event/u
  );
  assert.throws(
    () => derive(current, [{
      ...event,
      graphFunctionId: "gtl-program://t270/malformed-replay"
    }]),
    /snapshot differs from the decisive replay event/u
  );
  const {
    eventAdmissionOrdinal: ignoredOrdinal,
    ...missingOrdinal
  } = event;
  void ignoredOrdinal;
  assert.throws(
    () => derive(current, [missingOrdinal]),
    /eventAdmissionOrdinal/u
  );
  const collision = Object.freeze({
    ...event,
    eventId: "event://t270/observation/collision",
    constructionEventRef: "construction-event://t270/observation/collision"
  });
  assert.throws(
    () => derive(current, [event, collision]),
    /ordinal collision/u
  );
});

test("T-270 current-observation machinery remains internal and reuses the event family", () => {
  assert.equal(
    Object.hasOwn(publicApi, "deriveCurrentObservationBasisProjection"),
    false
  );
  assert.equal(
    Object.hasOwn(publicApi, "constructCurrentObservationMaterializedEvent"),
    false
  );
  assert.equal(
    RUNTIME_EVENT_KIND_VALUES.filter(
      (kind) => kind === "construction_observation_snapshot_materialized"
    ).length,
    1
  );
  assert.equal(
    RUNTIME_EVENT_KIND_VALUES.some((kind) => kind.includes("current_observation")),
    false
  );
});
