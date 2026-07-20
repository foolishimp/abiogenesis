import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  canonicalJson,
  sha256Canonical,
} from "../../build/code/src/product/index.js";
import { readCandidateBasis } from "../support/candidate-basis.mjs";
import {
  ABI5_ROOT_GOVERNOR,
  evaluateAbi5Root,
} from "../support/root-governor.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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
  const { kind, schemaVersion, outcomeDigest, ...mismatchedSetupBody } =
    mismatchedSetupOutcomes[1];
  mismatchedSetupBody.result.admissionEventRef = "event://abiogenesis/not-the-install-event";
  mismatchedSetupOutcomes[1] = {
    kind,
    schemaVersion,
    outcomeDigest: sha256Canonical(mismatchedSetupBody),
    ...mismatchedSetupBody,
  };
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
