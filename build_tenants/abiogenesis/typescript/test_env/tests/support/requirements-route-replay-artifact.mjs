import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const REQUIREMENT_ROUTE_REPLAY_ARTIFACT_KIND =
  "abg_requirements_route_replay_artifact";
export const REQUIREMENT_ROUTE_REPLAY_MANIFEST_KIND =
  "abg_requirements_route_replay_artifact_manifest";
export const REQUIREMENT_ROUTE_REPLAY_ARTIFACT_VERSION = 1;

export const REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS = Object.freeze([
  "requirement_term_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_lifecycle_disposition"
]);

export const REQUIRED_NON_CLOSED_REQUIREMENT_ROUTE_PAYLOAD_KINDS = Object.freeze([
  "requirement_term_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_residual_projected",
  "requirement_lifecycle_disposition"
]);

export const REQUIRED_REFINEMENT_REQUIREMENT_ROUTE_PAYLOAD_KINDS = Object.freeze([
  "requirement_term_admitted",
  "requirement_relation_admitted",
  "traversal_span_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_residual_projected",
  "requirement_lifecycle_disposition"
]);

export function sha256Text(value) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortJson(item));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJson(value[key])])
    );
  }
  return value;
}

export function stableJson(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

export function requirementRouteEvents(runtimeEvents) {
  return runtimeEvents.filter((event) =>
    event.kind === "requirement_route_fact_projected"
  );
}

function routePayloadKinds(routeEvents, requiredPayloadKinds) {
  const kinds = new Set(routeEvents.map((event) => event.routePayloadKind));
  const requiredKinds = requiredPayloadKinds.filter((kind) =>
    kinds.has(kind)
  );
  const additionalKinds = [...kinds]
    .filter((kind) => !requiredPayloadKinds.includes(kind))
    .sort();
  return [...requiredKinds, ...additionalKinds];
}

function routePayloadRefs(routeEvents) {
  return routeEvents
    .map((event) => event.routePayloadRef)
    .filter((ref) => typeof ref === "string")
    .sort();
}

function assertRequiredRoutePayloadKinds(
  routeEvents,
  requiredPayloadKinds = REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS
) {
  const kinds = new Set(routeEvents.map((event) => event.routePayloadKind));
  for (const kind of requiredPayloadKinds) {
    assert.equal(
      kinds.has(kind),
      true,
      `missing route payload kind ${kind}`
    );
  }
}

export function assertRequirementRouteReplayArtifact(
  artifact,
  options = {}
) {
  const requiredPayloadKinds =
    options.requiredPayloadKinds ?? REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS;
  assert.equal(artifact.kind, REQUIREMENT_ROUTE_REPLAY_ARTIFACT_KIND);
  assert.equal(artifact.artifactVersion, REQUIREMENT_ROUTE_REPLAY_ARTIFACT_VERSION);
  assert.equal(Array.isArray(artifact.replayEvents), true);
  assert.equal(Array.isArray(artifact.emittedEvents), true);
  assert.equal(Array.isArray(artifact.sinkEvents), true);
  assert.equal(Array.isArray(artifact.routeEvents), true);
  assert.equal(typeof artifact.lifecycleState, "object");
  assert.equal(artifact.replay.routeEventCount, artifact.routeEvents.length);
  assertRequiredRoutePayloadKinds(artifact.routeEvents, requiredPayloadKinds);
}

export async function writeRequirementRouteReplayArtifact(input) {
  await mkdir(input.runRoot, { recursive: true });

  const replayEvents = Array.from(input.replayEvents ?? []);
  const emittedEvents = Array.from(input.emittedEvents ?? []);
  const sinkEvents = Array.from(input.sinkEvents ?? []);
  const routeEvents = requirementRouteEvents(replayEvents);
  const requiredPayloadKinds =
    input.requiredPayloadKinds ?? REQUIRED_REQUIREMENT_ROUTE_PAYLOAD_KINDS;
  assertRequiredRoutePayloadKinds(routeEvents, requiredPayloadKinds);
  const ticket = input.ticket ?? "T-166";

  const artifact = Object.freeze({
    kind: REQUIREMENT_ROUTE_REPLAY_ARTIFACT_KIND,
    artifactVersion: REQUIREMENT_ROUTE_REPLAY_ARTIFACT_VERSION,
    ticket,
    createdAt: input.createdAt ?? new Date().toISOString(),
    source: Object.freeze(input.source ?? {}),
    replay: Object.freeze({
      runtimeEventCount: replayEvents.length,
      emittedEventCount: emittedEvents.length,
      sinkEventCount: sinkEvents.length,
      routeEventCount: routeEvents.length,
      routePayloadKinds: routePayloadKinds(routeEvents, requiredPayloadKinds),
      routePayloadRefs: routePayloadRefs(routeEvents)
    }),
    replayEvents,
    emittedEvents,
    sinkEvents,
    routeEvents,
    lifecycleState: input.lifecycleState
  });
  assertRequirementRouteReplayArtifact(artifact, { requiredPayloadKinds });

  const artifactPath = path.join(
    input.runRoot,
    input.artifactFileName ?? "requirements-route-replay-artifact.json"
  );
  const manifestPath = path.join(
    input.runRoot,
    input.manifestFileName ?? "requirements-route-replay-manifest.json"
  );
  const artifactText = stableJson(artifact);
  const artifactDigest = sha256Text(artifactText);
  await writeFile(artifactPath, artifactText, "utf8");

  const manifest = Object.freeze({
    kind: REQUIREMENT_ROUTE_REPLAY_MANIFEST_KIND,
    artifactVersion: REQUIREMENT_ROUTE_REPLAY_ARTIFACT_VERSION,
    ticket,
    source: artifact.source,
    artifact: Object.freeze({
      path: artifactPath,
      sha256: artifactDigest,
      requiredPayloadKinds,
      requiredPayloadKindsSatisfied: true,
      routeEventCount: routeEvents.length,
      routePayloadKinds: artifact.replay.routePayloadKinds,
      routePayloadRefs: artifact.replay.routePayloadRefs
    })
  });
  await writeFile(manifestPath, stableJson(manifest), "utf8");

  return Object.freeze({
    artifact,
    manifest,
    artifactPath,
    manifestPath
  });
}

export async function readRequirementRouteReplayArtifact(artifactPath) {
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  assertRequirementRouteReplayArtifact(artifact);
  return artifact;
}
