// Validates: T-104-TS
// Validates: T-101-TS
// Validates: REQ-R-ABG3-BINDING-015
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-R-ABG3-EVENTS
//
// Cross-workspace mini data-mapper forensic proof.
//
// This is intentionally deeper than the unit carrier tests. It runs the
// three-edge mini data-mapper graph twice, each time with a separate input
// workspace and a separate explicit output/review workspace. Then it compares
// the runtime ledger/evaluation assets edge-by-edge to prove that the W1/W2
// allocation law preserves semantic equivalence while keeping output streams
// materially isolated.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { EDGE_DEFS } from "./mini_dm_redux/module.mjs";
import {
  loadOrInitState,
  runEdge,
  workspaceLayout
} from "./mini_dm_redux/run.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t104_cross_workspace_mini_dm_forensics"
);

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

function isUnderRoot(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative.length === 0 || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonl(filePath) {
  const raw = await readFile(filePath, "utf8");
  const trimmed = raw.trim();
  return trimmed.length === 0
    ? []
    : trimmed.split("\n").map((line) => JSON.parse(line));
}

async function writeText(filePath, text) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function edgeInputWorkspaceFor(edgeName, inputWorkspaceRoot, outputWorkspaceRoot) {
  return edgeName === "derive_field_spec" ? inputWorkspaceRoot : outputWorkspaceRoot;
}

function assessmentFingerprint(assessments) {
  return assessments
    .map((entry) => ({
      obligationId: entry.obligationId,
      status: entry.status,
      findingClass: entry.findingClass,
      outputRefCount: entry.outputRefs.length,
      evidenceRefCount: entry.evidenceRefs.length
    }))
    .sort((left, right) => left.obligationId.localeCompare(right.obligationId));
}

function fpEvaluationFingerprint(fpEvaluation) {
  return fpEvaluation.assessments
    .map((entry) => ({
      obligationId: entry.obligationId,
      status: entry.status,
      findingClass: entry.findingClass
    }))
    .sort((left, right) => left.obligationId.localeCompare(right.obligationId));
}

function outputEventKindsForAllocation(events, allocationId) {
  return events
    .filter((event) => event.allocationId === allocationId)
    .map((event) => event.kind)
    .sort();
}

async function collectEdgeForensics(input) {
  const {
    edgeDef,
    events,
    inputWorkspaceRoot,
    outputWorkspaceRoot,
    layout,
    streamId
  } = input;
  const edgeZoomDir = path.join(layout.zoomRoot, edgeDef.name);
  const allocation = await readJson(
    path.join(layout.allocationsRoot, `${edgeDef.name}.json`)
  );
  const manifest = await readJson(path.join(edgeZoomDir, "manifest.json"));
  const foldback = await readJson(path.join(edgeZoomDir, "foldback.json"));
  const outer = await readJson(path.join(edgeZoomDir, "outer.json"));
  const fdEnvelope = await readJson(path.join(edgeZoomDir, "fd_envelope.json"));
  const fpEvaluation = await readJson(path.join(edgeZoomDir, "fp_evaluation.json"));
  const assessments = await readJsonl(path.join(edgeZoomDir, "assessments.jsonl"));
  const artifactBody = await readFile(allocation.materializationUri, "utf8");
  const expectedInputWorkspaceRoot = edgeInputWorkspaceFor(
    edgeDef.name,
    inputWorkspaceRoot,
    outputWorkspaceRoot
  );
  const outputEventKinds = outputEventKindsForAllocation(
    events,
    allocation.allocationId
  );

  assert.equal(
    allocation.inputWorkspaceRoot,
    expectedInputWorkspaceRoot,
    `${streamId}/${edgeDef.name} allocation must name the source workspace`
  );
  assert.equal(
    allocation.outputWorkspaceRoot,
    outputWorkspaceRoot,
    `${streamId}/${edgeDef.name} allocation must materialize under W2`
  );
  assert.ok(
    isUnderRoot(allocation.materializationUri, outputWorkspaceRoot),
    `${streamId}/${edgeDef.name} materialization must be under W2`
  );
  assert.equal(
    isUnderRoot(allocation.materializationUri, inputWorkspaceRoot),
    false,
    `${streamId}/${edgeDef.name} must not leak output into W1`
  );
  assert.deepEqual(manifest.inputWorkspaceRoots, [expectedInputWorkspaceRoot]);
  assert.deepEqual(manifest.outputWorkspaceRoots, [outputWorkspaceRoot]);
  assert.ok(
    manifest.allowedWriteRoots.every((root) => isUnderRoot(root, outputWorkspaceRoot)),
    `${streamId}/${edgeDef.name} manifest write roots must stay under W2`
  );
  assert.deepEqual(outputEventKinds, [
    "output_binding_admitted",
    "output_instance_allocated",
    "output_materialization_observed"
  ]);
  assert.equal(fdEnvelope.ok, true);
  assert.ok(
    assessments.every((entry) => entry.status === "fulfilled"),
    `${streamId}/${edgeDef.name} must fulfill every carried obligation`
  );
  assert.equal(foldback.fulfilledCount, assessments.length);
  assert.equal(foldback.openCount, 0);
  assert.equal(foldback.blockedCount, 0);

  return {
    edgeName: edgeDef.name,
    lineage: {
      inputWorkspaceRoot: allocation.inputWorkspaceRoot,
      outputWorkspaceRef: allocation.outputWorkspaceRef,
      outputWorkspaceRoot: allocation.outputWorkspaceRoot,
      materializationUri: allocation.materializationUri,
      assetRef: allocation.assetRef,
      manifestInputWorkspaceRoots: manifest.inputWorkspaceRoots,
      manifestOutputWorkspaceRoots: manifest.outputWorkspaceRoots,
      manifestAllowedWriteRoots: manifest.allowedWriteRoots,
      outputEventKinds
    },
    semanticFingerprint: {
      edgeName: edgeDef.name,
      relativePath: edgeDef.relativePath,
      outputName: allocation.outputName,
      assetType: allocation.assetType,
      artifactDigest: sha256Text(artifactBody),
      fdEnvelopeOk: fdEnvelope.ok,
      foldbackDecision: foldback.decision,
      fulfilledCount: foldback.fulfilledCount,
      openCount: foldback.openCount,
      blockedCount: foldback.blockedCount,
      outerClosureAllowed: outer.closureAllowed,
      assessments: assessmentFingerprint(assessments),
      fpEvaluation: fpEvaluationFingerprint(fpEvaluation),
      proofObligationRefs: manifest.proofObligationRefs
    }
  };
}

async function runStream(suiteRoot, streamId) {
  const inputWorkspaceRoot = path.join(suiteRoot, streamId, "input_workspace");
  const outputWorkspaceRoot = path.join(suiteRoot, streamId, "review_workspace");
  await mkdir(inputWorkspaceRoot, { recursive: true });
  await mkdir(outputWorkspaceRoot, { recursive: true });
  const layout = workspaceLayout(inputWorkspaceRoot, {
    outputWorkspace: outputWorkspaceRoot,
    outputWorkspaceRef: `workspace://t104-mini-dm-redux/${streamId}/review`,
    outputWorkspaceAuthorityRef:
      `authority://t104-mini-dm-redux/${streamId}/review`
  });
  const state = await loadOrInitState(layout, {
    runId: `t104-mini-dm-redux/${streamId}/deterministic`
  });

  for (const edgeDef of EDGE_DEFS) {
    await runEdge(edgeDef.name, layout, state);
  }

  const events = await readJsonl(layout.eventsLogPath);
  const edges = [];
  for (const edgeDef of EDGE_DEFS) {
    edges.push(
      await collectEdgeForensics({
        edgeDef,
        events,
        inputWorkspaceRoot,
        outputWorkspaceRoot,
        layout,
        streamId
      })
    );
  }

  return {
    streamId,
    inputWorkspaceRoot,
    outputWorkspaceRoot,
    eventCount: events.length,
    state: await readJson(layout.statePath),
    edges
  };
}

function renderForensicMarkdown(suiteRoot, streams) {
  const lines = [
    "# T-104 Cross-Workspace Mini Data-Mapper Forensics",
    "",
    `Suite root: ${suiteRoot}`,
    "",
    "## Streams",
    "",
    "| Stream | Input workspace | Output workspace | Events |",
    "| --- | --- | --- | --- |"
  ];
  for (const stream of streams) {
    lines.push(
      `| ${stream.streamId} | ${stream.inputWorkspaceRoot} | ` +
        `${stream.outputWorkspaceRoot} | ${stream.eventCount} |`
    );
  }
  lines.push("", "## Edge Traversals", "");
  for (const stream of streams) {
    lines.push(`### ${stream.streamId}`, "");
    lines.push(
      "| Edge | Input workspace root | Output workspace root | " +
        "Artifact digest | Fulfilled | Decision |"
    );
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const edge of stream.edges) {
      lines.push(
        `| ${edge.edgeName} | ${edge.lineage.inputWorkspaceRoot} | ` +
          `${edge.lineage.outputWorkspaceRoot} | ` +
          `${edge.semanticFingerprint.artifactDigest} | ` +
          `${edge.semanticFingerprint.fulfilledCount} | ` +
          `${edge.semanticFingerprint.foldbackDecision} |`
      );
    }
    lines.push("");
  }
  lines.push("## Cross-Stream Comparison", "");
  const first = streams[0].edges.map((edge) => edge.semanticFingerprint);
  for (const stream of streams.slice(1)) {
    assert.deepEqual(
      stream.edges.map((edge) => edge.semanticFingerprint),
      first
    );
    lines.push(
      `- ${streams[0].streamId} and ${stream.streamId}: semantic fingerprints match`
    );
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

test("T-104 mini data-mapper forensics compare deterministic W1/W2 streams", async () => {
  const suiteRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const streams = [
    await runStream(suiteRoot, "stream-a"),
    await runStream(suiteRoot, "stream-b")
  ];

  const streamAEdges = streams[0].edges;
  const streamBEdges = streams[1].edges;
  for (let idx = 0; idx < streamAEdges.length; idx += 1) {
    assert.notEqual(
      streamAEdges[idx].lineage.assetRef,
      streamBEdges[idx].lineage.assetRef,
      "stream-specific W2 asset refs must remain distinct"
    );
    assert.notEqual(
      streamAEdges[idx].lineage.materializationUri,
      streamBEdges[idx].lineage.materializationUri,
      "stream-specific W2 materialization URIs must remain distinct"
    );
  }

  const analysis = {
    kind: "t104_cross_workspace_mini_dm_forensic_analysis",
    suiteRoot,
    streamCount: streams.length,
    edgesPerStream: EDGE_DEFS.length,
    streams,
    semanticFingerprints: streams.map((stream) => ({
      streamId: stream.streamId,
      fingerprints: stream.edges.map((edge) => edge.semanticFingerprint)
    }))
  };
  await writeText(
    path.join(suiteRoot, "forensic_analysis.json"),
    `${JSON.stringify(analysis, null, 2)}\n`
  );
  await writeText(
    path.join(suiteRoot, "forensic_analysis.md"),
    renderForensicMarkdown(suiteRoot, streams)
  );

  assert.deepEqual(
    streams[0].edges.map((edge) => edge.semanticFingerprint),
    streams[1].edges.map((edge) => edge.semanticFingerprint)
  );
});
