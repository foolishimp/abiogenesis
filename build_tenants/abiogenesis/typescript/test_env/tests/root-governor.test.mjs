import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import { readCandidateBasis } from "../support/candidate-basis.mjs";
import {
  ABI5_ROOT_GOVERNOR,
  evaluateAbi5Root,
} from "../support/root-governor.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Canonical(value) {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function withOutcomeDigest(outcome) {
  const { kind, schemaVersion, outcomeDigest: _outcomeDigest, ...body } = outcome;
  return {
    kind,
    schemaVersion,
    outcomeDigest: sha256Canonical(body),
    ...body,
  };
}

test("ABI5-ROOT-001 governor re-evaluates the retained installed subject", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-root-governor-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const proofRoot = join(root, "test_env/proof");
  const [candidateBasis, transcript, outcomes, retainedGovernor] = await Promise.all([
    readCandidateBasis(root),
    readFile(join(proofRoot, "abi5-root-r10.transcript.json"), "utf8").then(JSON.parse),
    readFile(join(proofRoot, "abi5-root-r10.outcomes.json"), "utf8").then(JSON.parse),
    readFile(join(proofRoot, "abi5-root-governor.json"), "utf8").then(JSON.parse),
  ]);
  const governor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes,
    eventLogPath: join(proofRoot, "abi5-root-r10.events.jsonl"),
  });
  assert.equal(governor.governorId, ABI5_ROOT_GOVERNOR);
  assert.equal(governor.disposition, "root_satisfied", JSON.stringify(governor));
  assert.equal(governor.firstFrontier, null);
  assert.deepEqual(Object.values(governor.obligationResults), Array(10).fill(true));
  assert.equal(governor.governorDigest, retainedGovernor.governorDigest);
  assert.equal(retainedGovernor.disposition, "root_satisfied");

  const retainedEventLogPath = join(proofRoot, "abi5-root-r10.events.jsonl");
  const retainedEvents = (await readFile(retainedEventLogPath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  const extraCandidate = {
    kind: "registry_entry_admitted",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "workspace",
    aggregateId: "catalog://abiogenesis/governor-mutation",
    parentAggregateId: null,
    causationEventRefs: [],
    correlationId: "correlation://t286/governor/extra-event",
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: "basis://abiogenesis/governor-mutation",
    payload: { operationId: "abg.operation.governor.mutation" },
  };
  const payloadDigest = sha256Canonical(extraCandidate.payload);
  const admissionOrdinal = retainedEvents.length + 1;
  const extraEvent = {
    ...extraCandidate,
    eventId: `event://abiogenesis/${sha256Canonical({
      ...extraCandidate,
      payloadDigest,
      admissionOrdinal,
    }).slice("sha256:".length)}`,
    admissionOrdinal,
    payloadDigest,
  };
  const extraEventLogPath = join(scratch, "extra-event.events.jsonl");
  await writeFile(
    extraEventLogPath,
    `${[...retainedEvents, extraEvent].map(canonicalJson).join("\n")}\n`,
    "utf8",
  );
  const extraEventGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes,
    eventLogPath: extraEventLogPath,
  });
  assert.equal(extraEventGovernor.disposition, "root_red");
  assert.equal(
    extraEventGovernor.failures.includes(
      "durable ledger contains a missing, duplicated, or unaccounted event",
    ),
    true,
  );

  const invalidSetupOutcomes = structuredClone(outcomes);
  invalidSetupOutcomes[0].outcomeDigest = `sha256:${"0".repeat(64)}`;
  const invalidSetupGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes: invalidSetupOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(invalidSetupGovernor.disposition, "root_red");
  assert.equal(
    invalidSetupGovernor.failures.includes("one or more public outcome identities are invalid"),
    true,
  );

  const mismatchedSetupOutcomes = structuredClone(outcomes);
  mismatchedSetupOutcomes[1].result.admissionEventRef =
    "event://abiogenesis/not-the-install-event";
  mismatchedSetupOutcomes[1] = withOutcomeDigest(mismatchedSetupOutcomes[1]);
  const mismatchedSetupGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes: mismatchedSetupOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(mismatchedSetupGovernor.disposition, "root_red");
  assert.equal(
    mismatchedSetupGovernor.failures.includes(
      "installed setup events differ from the exact admitted path",
    ),
    true,
  );

  const changedSetupPayloadTranscript = structuredClone(transcript);
  changedSetupPayloadTranscript[1].payload.targetRoot = join(scratch, "different-target");
  const changedSetupPayloadGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript: changedSetupPayloadTranscript,
    outcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(changedSetupPayloadGovernor.disposition, "root_red");
  assert.equal(
    changedSetupPayloadGovernor.failures.includes(
      "installed setup events differ from the exact admitted path",
    ),
    true,
  );

  const trailingBytesEventLogPath = join(scratch, "trailing-bytes.events.jsonl");
  await writeFile(
    trailingBytesEventLogPath,
    `${await readFile(retainedEventLogPath, "utf8")}\n`,
    "utf8",
  );
  const trailingBytesGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes,
    eventLogPath: trailingBytesEventLogPath,
  });
  assert.equal(trailingBytesGovernor.disposition, "root_red");
  assert.equal(
    trailingBytesGovernor.failures.includes(
      "final durable prefix does not cover the exact event log bytes",
    ),
    true,
  );

  const broadenedViewOutcomes = structuredClone(outcomes);
  broadenedViewOutcomes[4].result.allowlist.push(
    "graph-function://abiogenesis/not-the-root@5",
  );
  broadenedViewOutcomes[4] = withOutcomeDigest(broadenedViewOutcomes[4]);
  const broadenedViewGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes: broadenedViewOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(broadenedViewGovernor.disposition, "root_red");
  assert.equal(broadenedViewGovernor.obligationResults.R4, false);

  const swappedInvocationTranscript = structuredClone(transcript);
  [swappedInvocationTranscript.at(-2).invocationRef, swappedInvocationTranscript.at(-1).invocationRef] =
    [swappedInvocationTranscript.at(-1).invocationRef, swappedInvocationTranscript.at(-2).invocationRef];
  const swappedInvocationOutcomes = structuredClone(outcomes);
  [swappedInvocationOutcomes.at(-2).invocationRef, swappedInvocationOutcomes.at(-1).invocationRef] =
    [swappedInvocationOutcomes.at(-1).invocationRef, swappedInvocationOutcomes.at(-2).invocationRef];
  swappedInvocationOutcomes[swappedInvocationOutcomes.length - 2] =
    withOutcomeDigest(swappedInvocationOutcomes.at(-2));
  swappedInvocationOutcomes[swappedInvocationOutcomes.length - 1] =
    withOutcomeDigest(swappedInvocationOutcomes.at(-1));
  const swappedInvocationGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript: swappedInvocationTranscript,
    outcomes: swappedInvocationOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(swappedInvocationGovernor.disposition, "root_red");
  assert.equal(
    swappedInvocationGovernor.failures.some((failure) =>
      failure.includes("does not preserve its admitted invocation identity")),
    true,
  );

  const forgedPrefixOutcomes = structuredClone(outcomes);
  const forgedPrefixCount = retainedEvents.length - 1;
  const forgedPrefix = Buffer.from(
    `${retainedEvents.slice(0, forgedPrefixCount).map(canonicalJson).join("\n")}\n`,
    "utf8",
  );
  forgedPrefixOutcomes.at(-2).durableEventCount = forgedPrefixCount;
  forgedPrefixOutcomes.at(-2).eventLogByteLength = forgedPrefix.byteLength;
  forgedPrefixOutcomes.at(-2).eventLogDigest =
    `sha256:${createHash("sha256").update(forgedPrefix).digest("hex")}`;
  forgedPrefixOutcomes[forgedPrefixOutcomes.length - 2] =
    withOutcomeDigest(forgedPrefixOutcomes.at(-2));
  const forgedPrefixGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes: forgedPrefixOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(forgedPrefixGovernor.disposition, "root_red");
  assert.equal(forgedPrefixGovernor.obligationResults.R10, false);

  const duplicateRunOutcomes = structuredClone(outcomes);
  const duplicateBody = structuredClone(duplicateRunOutcomes.at(-2));
  delete duplicateBody.kind;
  delete duplicateBody.schemaVersion;
  delete duplicateBody.outcomeDigest;
  duplicateBody.invocationRef = transcript.at(-1).invocationRef;
  duplicateRunOutcomes[duplicateRunOutcomes.length - 1] = {
    kind: "public_outcome",
    schemaVersion: "5.0.0",
    outcomeDigest: sha256Canonical(duplicateBody),
    ...duplicateBody,
  };
  const duplicateRunGovernor = await evaluateAbi5Root({
    candidateBasis,
    artifactPath: join(artifacts, packResult.filename),
    transcript,
    outcomes: duplicateRunOutcomes,
    eventLogPath: retainedEventLogPath,
  });
  assert.equal(duplicateRunGovernor.disposition, "root_red");
  assert.equal(
    duplicateRunGovernor.failures.includes(
      "run request, runtime invocation, or Run identities are duplicated",
    ),
    true,
  );
});
