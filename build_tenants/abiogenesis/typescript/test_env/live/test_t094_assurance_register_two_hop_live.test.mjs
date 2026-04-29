// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-LINEAGE
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-P-QUAL
// Validates: T-094

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  constructAssuranceRegisterHop,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceClosureDecision,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  deriveAssuranceLifecycleRegister,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  derivePayloadLedgerProjection,
  deriveRuntimeAggregateProjection,
  emit
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  contractForKnownAgent
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t094_assurance_register_two_hop_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T094_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "60000", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60000;
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, "utf8");
}

function stringEnv() {
  const out = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function sanitizeEnvironment(contract) {
  const prefixes = contract.sanitizedEnvironmentPolicy.prefixes.filter(
    (prefix) => prefix.length > 0
  );
  const env = {};
  outer: for (const [key, value] of Object.entries(stringEnv())) {
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        continue outer;
      }
    }
    env[key] = value;
  }
  return env;
}

function renderArgs(template, replacements) {
  return template.map((arg) =>
    arg
      .replaceAll("{prompt}", replacements.prompt)
      .replaceAll("{output_path}", replacements.outputPath)
  );
}

function collectTransportText(run, outputPath) {
  if (existsSync(outputPath)) {
    const output = readFileSync(outputPath, "utf8");
    if (output.trim().length > 0) {
      return output;
    }
  }
  return run.stdout;
}

async function runTransport({
  contract,
  prompt,
  archiveRoot,
  label
}) {
  const outputPath = path.join(archiveRoot, `${label}-output.txt`);
  const args = renderArgs(contract.argsTemplate, {
    prompt,
    outputPath
  });
  await writeText(path.join(archiveRoot, `${label}-prompt.txt`), prompt);
  const run = spawnSync(contract.command, args, {
    cwd: archiveRoot,
    encoding: "utf8",
    env: sanitizeEnvironment(contract),
    timeout: transportTimeoutMs(),
    maxBuffer: 1024 * 1024 * 10
  });
  const result = {
    command: contract.command,
    args,
    outputPath,
    status: run.status,
    signal: run.signal,
    error: run.error === undefined ? null : String(run.error),
    stdout: run.stdout,
    stderr: run.stderr,
    text: collectTransportText(run, outputPath)
  };
  await writeJson(path.join(archiveRoot, `${label}-transport.json`), result);
  await writeText(path.join(archiveRoot, `${label}-stdout.log`), run.stdout ?? "");
  await writeText(path.join(archiveRoot, `${label}-stderr.log`), run.stderr ?? "");
  return result;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced === null ? trimmed : fenced[1].trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) {
      throw new TypeError("transport response did not contain a JSON object");
    }
    return JSON.parse(candidate.slice(first, last + 1));
  }
}

function hop1Prompt() {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live worker for ABG T-094 hop 1.",
    "Build a minimal UAT proof artifact from these authority refs:",
    "- REQ-R-ABG3-ASSURANCE-018: close only when rows are fulfilled or lawfully deferred.",
    "- REQ-R-ABG3-ASSURANCE-019: worker success, transport success, tests, reports, archives, prompt self-assessment, and absent closure-register rows do not imply closure.",
    "- REQ-R-ABG3-ASSURANCE-024: retry or input change requires a fresh projection.",
    "The JSON shape must be:",
    "{",
    '  "artifact_kind": "uat_proof",',
    '  "artifact_ref": "uat://t094/live-hop1",',
    '  "authority_refs": ["REQ-R-ABG3-ASSURANCE-018", "REQ-R-ABG3-ASSURANCE-019", "REQ-R-ABG3-ASSURANCE-024"],',
    '  "target_refs": ["uat://t094/live-hop1"],',
    '  "closure_claim": "hop1_uat_artifact_only",',
    '  "next_hop_required": true,',
    '  "non_closure_reason": "uat proof alone is not execution evidence"',
    "}"
  ].join("\n");
}

function hop2Prompt(hop1Artifact) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live worker for ABG T-094 hop 2.",
    "Inspect the prior UAT artifact and determine whether execution evidence was supplied.",
    `Prior artifact: ${JSON.stringify(hop1Artifact)}`,
    "No execution archive, test result, source trace index, or release evidence is supplied in this prompt.",
    "You must not infer closure from hop 1. Return a gap observation.",
    "The JSON shape must be:",
    "{",
    '  "artifact_kind": "execution_gap_observation",',
    '  "artifact_ref": "gap://t094/live-hop2",',
    '  "source_ref": "uat://t094/live-hop1",',
    '  "execution_evidence_present": false,',
    '  "assurance_status": "missing",',
    '  "closure_advice": "deepen",',
    '  "non_closure_reason": "second hop has no execution evidence"',
    "}"
  ].join("\n");
}

function baseScope() {
  const basis = buildThreeStageBasis();
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  return { basis, runtimeProjection, scope };
}

function projectionFor(input) {
  const sourceEvents = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: input.basis,
      vectorIndex: input.scope.vectorIndex,
      authoritySnapshotRef: `authority-snapshot://${input.authorityDigest}`,
      authorityRefs: input.authorityRefs,
      inputRefs: input.inputRefs ?? ["input://t094/live"],
      authorityDigest: input.authorityDigest,
      inputDigest: input.inputDigest,
      providerRefs: ["provider://t094/live-authority"],
      policyRefs: ["policy://t094/live-register"]
    })
  ];
  const observedRefs = [
    ...new Set([...(input.observedPayloadRefs ?? []), ...(input.evidenceRefs ?? [])])
  ];
  for (const payloadSourceRef of observedRefs) {
    const payloadRef = `payload://${payloadSourceRef}`;
    const digest = `digest://${payloadSourceRef}`;
    sourceEvents.push(
      constructPayloadObservedEvent({
        basis: input.basis,
        vectorIndex: input.scope.vectorIndex,
        payloadRef,
        payloadClass: "worker_artifact",
        contractRef: "contract://t094/live-worker-artifact",
        digest,
        producerRef: "worker://t094/live-claude",
        authorityRef: input.authorityRefs[0],
        inputDigest: input.inputDigest,
        policyRefs: ["policy://t094/live-register"]
      }),
      constructPayloadValidatedEvent({
        basis: input.basis,
        vectorIndex: input.scope.vectorIndex,
        payloadRef,
        contractRef: "contract://t094/live-worker-artifact",
        digest,
        validationRef: `validation://${payloadSourceRef}`,
        evidenceRef: (input.evidenceRefs ?? []).includes(payloadSourceRef)
          ? payloadSourceRef
          : null,
        policyRefs: ["policy://t094/live-register"]
      })
    );
    if ((input.evidenceRefs ?? []).includes(payloadSourceRef)) {
      sourceEvents.push(
        constructEvidenceAdmittedEvent({
          basis: input.basis,
          vectorIndex: input.scope.vectorIndex,
          evidenceRef: payloadSourceRef,
          payloadRef,
          authorityRef: input.authorityRefs[0],
          authorityDigest: input.authorityDigest,
          inputDigest: input.inputDigest,
          providerRefs: ["provider://t094/live-evidence"],
          policyRefs: ["policy://t094/live-register"]
        })
      );
    }
  }
  const emittedEvents = [];
  emit(sourceEvents, (event) => emittedEvents.push(event));
  const payloadLedger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: emittedEvents,
    vectorIndex: input.scope.vectorIndex
  });
  const authoritySnapshot = deriveAssuranceAuthoritySnapshotFromPayloadLedger({
    assuranceScope: input.scope,
    ledger: payloadLedger
  });
  const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
    assuranceScope: input.scope,
    ledger: payloadLedger
  });
  const projection = deriveAssuranceProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    authoritySnapshot,
    evidenceRows
  });
  return {
    emittedEvents,
    payloadLedger,
    projection,
    decision: deriveAssuranceClosureDecision(projection)
  };
}

test("T-094 live: two Claude hops build a register that requires deepening", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T094_LIVE=1 or CODEX_LIVE_FP=1 to run T-094 live proof");
    return;
  }

  const archiveRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(archiveRoot, { recursive: true });
  const agentKey = liveAgentKey();
  const contract = contractForKnownAgent("claude");
  await writeJson(path.join(archiveRoot, "live_config.json"), {
    agentKey,
    enforcedAgent: "claude",
    timeoutMs: transportTimeoutMs(),
    archiveRoot
  });

  try {
    assert.equal(agentKey, "claude", "T-094 live proof only permits Claude lanes");

    const hop1Transport = await runTransport({
      contract,
      prompt: hop1Prompt(),
      archiveRoot,
      label: "hop1"
    });
    assert.equal(
      hop1Transport.status,
      0,
      `hop1 Claude transport failed; archive: ${archiveRoot}`
    );
    const hop1Artifact = extractJsonObject(hop1Transport.text);
    await writeJson(path.join(archiveRoot, "hop1-artifact.json"), hop1Artifact);
    assert.equal(hop1Artifact.artifact_kind, "uat_proof");
    assert.equal(hop1Artifact.next_hop_required, true);

    const hop2Transport = await runTransport({
      contract,
      prompt: hop2Prompt(hop1Artifact),
      archiveRoot,
      label: "hop2"
    });
    assert.equal(
      hop2Transport.status,
      0,
      `hop2 Claude transport failed; archive: ${archiveRoot}`
    );
    const hop2Artifact = extractJsonObject(hop2Transport.text);
    await writeJson(path.join(archiveRoot, "hop2-artifact.json"), hop2Artifact);
    assert.equal(hop2Artifact.artifact_kind, "execution_gap_observation");
    assert.equal(hop2Artifact.execution_evidence_present, false);
    assert.equal(hop2Artifact.assurance_status, "missing");

    const base = baseScope();
    const first = projectionFor({
      ...base,
      authorityRefs: ["req://t094/requirements-to-uat"],
      authorityDigest: "authority-digest-t094-hop1-live",
      inputDigest: "input-digest-t094-hop1-live",
      evidenceRefs: [hop1Artifact.artifact_ref]
    });
    const second = projectionFor({
      ...base,
      authorityRefs: ["req://t094/uat-to-execution"],
      authorityDigest: "authority-digest-t094-hop2-live",
      inputDigest: "input-digest-t094-hop2-live",
      observedPayloadRefs: [hop2Artifact.artifact_ref],
      evidenceRefs: []
    });
    const hop1 = constructAssuranceRegisterHop({
      hopId: "hop://t094/live/requirements-to-uat",
      ordinal: 0,
      sourceRefs: ["req://t094/requirements-to-uat"],
      targetRefs: [hop1Artifact.artifact_ref],
      projection: first.projection,
      decision: first.decision,
      downstreamHopIds: ["hop://t094/live/uat-to-execution"]
    });
    const hop2 = constructAssuranceRegisterHop({
      hopId: "hop://t094/live/uat-to-execution",
      ordinal: 1,
      sourceRefs: [hop1Artifact.artifact_ref],
      targetRefs: [hop2Artifact.artifact_ref],
      projection: second.projection,
      decision: second.decision,
      upstreamHopIds: ["hop://t094/live/requirements-to-uat"]
    });
    const register = deriveAssuranceLifecycleRegister({
      registerId: "register://t094/live/two-hop",
      scope: base.scope,
      hops: [hop1, hop2]
    });
    await writeJson(path.join(archiveRoot, "hop1-assurance-projection.json"), first.projection);
    await writeJson(path.join(archiveRoot, "hop1-closure-decision.json"), first.decision);
    await writeJson(path.join(archiveRoot, "hop1-payload-ledger.json"), first.payloadLedger);
    await writeJson(path.join(archiveRoot, "hop2-assurance-projection.json"), second.projection);
    await writeJson(path.join(archiveRoot, "hop2-closure-decision.json"), second.decision);
    await writeJson(path.join(archiveRoot, "hop2-payload-ledger.json"), second.payloadLedger);
    await writeJson(
      path.join(archiveRoot, "event_log.json"),
      [...first.emittedEvents, ...second.emittedEvents]
    );
    await writeJson(path.join(archiveRoot, "assurance-register.json"), register);
    await writeText(
      path.join(archiveRoot, "postmortem.md"),
      [
        "# T-094 Live Two-Hop Register",
        "",
        `- archive: ${archiveRoot}`,
        `- agent: ${agentKey}`,
        `- hop1 decision: ${first.decision.decision}`,
        `- hop2 decision: ${second.decision.decision}`,
        `- register decision: ${register.decision}`,
        `- mayConverge: ${String(register.mayConverge)}`
      ].join("\n")
    );

    assert.equal(first.decision.decision, "close");
    assert.equal(second.decision.decision, "retry");
    assert.deepStrictEqual(hop2.rowStatuses, ["missing"]);
    assert.equal(register.decision, "deepen");
    assert.equal(register.mayConverge, false);
    assert.equal(register.deepeningRequired, true);
  } catch (error) {
    await writeJson(path.join(archiveRoot, "failure.json"), {
      message: error instanceof Error ? error.message : String(error),
      archiveRoot
    });
    assert.fail(
      `${error instanceof Error ? error.message : String(error)}\narchive: ${archiveRoot}`
    );
  }
});
