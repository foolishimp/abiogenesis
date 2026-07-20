import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
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
});
