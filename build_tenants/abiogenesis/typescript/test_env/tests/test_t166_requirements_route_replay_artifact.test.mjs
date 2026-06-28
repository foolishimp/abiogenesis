// Validates: T-166

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS,
  assertRequirementRouteReplayArtifact,
  sha256Text,
  stableJson,
  writeRequirementRouteReplayArtifact
} from "./support/requirements-route-replay-artifact.mjs";

const TEST_ENV_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t166_requirements_route_replay_artifact"
);

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function routeEvent(routePayloadKind, routePayloadRef, requirementPayload) {
  return Object.freeze({
    kind: "requirement_route_fact_projected",
    eventRef: `runtime-event://t166/${routePayloadKind}`,
    routePayloadKind,
    routePayloadRef,
    requirementPayload
  });
}

function fixtureReplayEvents() {
  const requirementId = "REQ-T166-REPLAY-ARTIFACT";
  const projectionRef = "requirement-projection://t166/replay";
  const bindingRef = "requirement-evidence-binding://t166/replay";
  const foldRef = "requirement-fold://t166/replay";
  const dispositionRef = "requirement-lifecycle-disposition://t166/replay";
  return Object.freeze([
    Object.freeze({
      kind: "runtime_started",
      eventRef: "runtime-event://t166/noise"
    }),
    routeEvent(
      "requirement_term_admitted",
      requirementId,
      Object.freeze({
        kind: "requirement_term_admitted",
        requirementId,
        sourceRef: "specification://t166/requirement",
        sourceDigest: "sha256:t166-requirement"
      })
    ),
    routeEvent(
      "requirement_projection_admitted",
      projectionRef,
      Object.freeze({
        kind: "requirement_projection_admitted",
        projection: Object.freeze({
          projectionRef,
          requirementId
        })
      })
    ),
    routeEvent(
      "requirement_evidence_bound",
      bindingRef,
      Object.freeze({
        kind: "requirement_evidence_bound",
        binding: Object.freeze({
          bindingRef,
          requirementProjectionRef: projectionRef,
          bindingStatus: "admitted"
        })
      })
    ),
    routeEvent(
      "requirement_fold_projected",
      foldRef,
      Object.freeze({
        kind: "requirement_fold_projected",
        fold: Object.freeze({
          foldRef,
          requirementProjectionRef: projectionRef,
          state: "satisfied",
          evidenceBindingRefs: [bindingRef],
          sourceAbgTruthRefs: ["assurance-closure-decision://t166/replay"]
        })
      })
    ),
    routeEvent(
      "requirement_lifecycle_disposition",
      dispositionRef,
      Object.freeze({
        kind: "requirement_lifecycle_disposition",
        dispositionRef,
        disposition: "closed",
        residualRefs: [],
        continuationRefs: ["runtime-continuation-transition://t166/closed"],
        reentryRefs: [],
        policyRefs: []
      })
    )
  ]);
}

test("T-166 writes a digest-pinned downstream route replay artifact", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const replayEvents = fixtureReplayEvents();
  const lifecycleState = Object.freeze({
    kind: "requirement_lifecycle_state_read_model",
    requirementQuery: Object.freeze({
      kind: "requirement_read_model",
      requirementIds: ["REQ-T166-REPLAY-ARTIFACT"]
    }),
    dispositionRefs: ["requirement-lifecycle-disposition://t166/replay"]
  });

  const written = await writeRequirementRouteReplayArtifact({
    runRoot,
    source: Object.freeze({
      proofTicket: "T-166",
      proofCommand: "npm run test:t166",
      sourceRunKind: "synthetic_contract_lock"
    }),
    replayEvents,
    emittedEvents: replayEvents.slice(1),
    sinkEvents: replayEvents.slice(1),
    lifecycleState
  });

  const artifact = JSON.parse(await readFile(written.artifactPath, "utf8"));
  const manifest = JSON.parse(await readFile(written.manifestPath, "utf8"));

  assertRequirementRouteReplayArtifact(artifact);
  assert.deepEqual(
    artifact.replay.routePayloadKinds,
    REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS
  );
  assert.equal(
    manifest.artifact.sha256,
    sha256Text(stableJson(artifact))
  );
  assert.equal(manifest.artifact.requiredPayloadKindsSatisfied, true);
  assert.equal(
    artifact.lifecycleState.dispositionRefs[0],
    "requirement-lifecycle-disposition://t166/replay"
  );
});

test("T-166 replay artifact writer rejects incomplete route truth", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await assert.rejects(
    writeRequirementRouteReplayArtifact({
      runRoot,
      source: Object.freeze({
        proofTicket: "T-166",
        sourceRunKind: "negative"
      }),
      replayEvents: fixtureReplayEvents().filter((event) =>
        event.routePayloadKind !== "requirement_lifecycle_disposition"
      ),
      emittedEvents: [],
      sinkEvents: [],
      lifecycleState: Object.freeze({
        kind: "requirement_lifecycle_state_read_model",
        dispositionRefs: []
      })
    }),
    /missing route payload kind requirement_lifecycle_disposition/u
  );
});
