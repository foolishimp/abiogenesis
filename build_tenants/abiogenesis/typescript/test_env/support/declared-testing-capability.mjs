import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, realpath } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
export const checkerRef = letter => "command://declared-testing.example/check-" + letter;
// The live command is the one the runtime reads, ABG_TS_CLAUDE_COMMAND; the
// model and effort are this capability's own.
export const LIVE_TESTING_TRANSPORT = Object.freeze({
  command: process.env.ABG_TS_CLAUDE_COMMAND || null, model: "claude-fable-5-1", effort: "xhigh",
});
export const liveTransportSkip = LIVE_TESTING_TRANSPORT.command === null && "ABG_TS_CLAUDE_COMMAND unset; requires the live claude command";
export function testingExecutionConfig(environment = process.env) {
  const mode = environment.ABI5_TESTING_MODE ?? "mechanical";
  assert.ok(["mechanical", "live"].includes(mode), "testing mode must be mechanical or live");
  const live = mode === "live";
  if (live) assert.equal(environment.ABI5_TESTING_ALLOW_LIVE, "1", "live mode requires explicit separate runtime activation");
  if (live) assert.ok(LIVE_TESTING_TRANSPORT.command, "live mode requires ABG_TS_CLAUDE_COMMAND");
  const requestedBudget = environment.ABI5_TESTING_NATIVE_BUDGET_MS;
  const nativeBudgetMs = requestedBudget === undefined ? (live ? 2_400_000 : 1_200_000) : Number(requestedBudget);
  if (requestedBudget !== undefined) {
    assert.ok(live, "extended caller observation requires separately activated live mode");
    assert.ok(Number.isSafeInteger(nativeBudgetMs) && nativeBudgetMs >= 2_400_000 && nativeBudgetMs <= 7_200_000,
      "live caller observation must be between 40 and 120 minutes");
  }
  const requestedActorAbsolute = environment.ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS;
  const liveActorAbsoluteMs = requestedActorAbsolute === undefined ? 240_000 : Number(requestedActorAbsolute);
  if (requestedActorAbsolute !== undefined) {
    assert.ok(live, "actor allowance requires separately activated live mode");
    assert.ok(Number.isSafeInteger(liveActorAbsoluteMs) && liveActorAbsoluteMs >= 240_000 && liveActorAbsoluteMs <= 600_000,
      "live actor absolute allowance must be between 240000 and 600000 milliseconds");
  }
  return Object.freeze({ mode, live, nativeBudgetMs,
    outerBudgetMs: requestedBudget === undefined ? 3_300_000 : Math.max(3_300_000, nativeBudgetMs + 1_200_000),
    freshReadbackBudgetMs: requestedBudget === undefined ? 45_000 : 300_000,
    readbackReserveMs: 300_000, cleanupReserveMs: 300_000,
    environment: live ? Object.freeze({ ABG_TS_CLAUDE_COMMAND: LIVE_TESTING_TRANSPORT.command,
      ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", LIVE_TESTING_TRANSPORT.model]),
      CLAUDE_CODE_EFFORT_LEVEL: LIVE_TESTING_TRANSPORT.effort,
      // Existing process policy is invocation-wide, not specific to an Evidence actor.
      ABG_TS_FP_TIMEOUT_MS: "120000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: String(liveActorAbsoluteMs), ABG_TS_FP_TERMINATION_GRACE_MS: "1000" })
      : Object.freeze({ ABG_TS_FP_TIMEOUT_MS: "60000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: "120000", ABG_TS_FP_TERMINATION_GRACE_MS: "1000" }) });
}

// Prospective domain criteria, not candidate responses or expected dispositions.
export const TESTING_CHECKER_SUCCESS_CRITERION = "The selected declared checker must execute at least one meaningful passing test: the verifier imports the actual application and checks answer() against the source-defined expected value. Read the recorded TAP summary and exit status together: require at least one passed test, exit status zero, no failed tests and no timeout. Zero discovered tests is not success. This is a prospective success criterion, not an observed result or an instruction to report success.";
export const TESTING_ROLE_POLICY = "Apply only the supplied role and exact native task. Consider declared checking operations and bounded proof scope; preserve missing support. The retrieved Executive projection is supporting corpus, not role or effect authority. " + TESTING_CHECKER_SUCCESS_CRITERION + " Assess construction readiness before execution, and assess actual evidence only when supplied. Empty report declarations or process outcome predicates do not remove this semantic proof obligation. Do not invent observations or acceptance.";

// Current setup facts travel as ordinary declared taskData, never as an ABG
// observation or a substituted checker result. A future invocation re-observes.
export async function observeTestingToolchain(product) {
  const executable = process.execPath, canonicalExecutable = await realpath(executable);
  const executableDigest = await product.sha256File(canonicalExecutable);
  const testModule = await import("node:test");
  assert.equal(typeof testModule.test, "function");
  const version = await exec(executable, ["--version"], { timeout: 5_000, maxBuffer: 16_384 });
  assert.equal(version.stdout.trim(), process.version, "declared checker executable is the current preparation runtime");
  assert.equal(await product.sha256File(canonicalExecutable), executableDigest, "toolchain bytes remained stable during setup observation");
  return { kind: "consumer_toolchain_availability_fact", executable, canonicalExecutable, executableDigest,
    runtimeVersion: process.version, platform: process.platform, architecture: process.arch,
    observedPreparationFeatures: ["This .mjs ES module loaded in the current runtime.", "node:assert/strict imported successfully.", "node:test imported successfully and exports a test function."],
    observedCommand: { executable, args: ["--version"], exitStatus: 0, stdout: version.stdout, stderr: version.stderr },
    availabilityPremise: "Both declared checkers use this same executable. It is the Node runtime executing this preparation; its version command succeeded with the recorded bytes. This warrants attempting the declared Node checker, not a claim that the not-yet-constructed application or verifier runs or passes. Command execution must supply that evidence; changed or inadequate prerequisites remain unresolved." };
}

export function testingStageMeaning(stage) {
  if (stage === "design") return {
    assetKind: "declared_testing_design",
    purpose: "Select one permitted checker and pair implementation and verifier targets for the original source requirement; preserve unresolved dependencies.",
    requiredContent: ["Identify the granted implementation and verifier targets and their paired source obligation.",
      "Select exactly one available command that executes the verifier against the application; explain its relevance and any missing support."],
    rubric: [{ criterionRef: "criterion://declared-testing.example/design/source-and-targets@5",
      instruction: "Assess whether the Design preserves the original answer() requirement and pairs the granted implementation and verifier targets with the source obligation, without widening writes or inventing dependencies." },
    { criterionRef: "criterion://declared-testing.example/design/checker-selection@5",
      instruction: "Assess whether exactly one selected command is declared and can execute a verifier that imports the actual application and checks answer() against the source requirement. " + TESTING_CHECKER_SUCCESS_CRITERION + " Missing support or uncertain dependencies must remain explicit; a Design is not execution evidence." }],
  };
  assert.equal(stage, "evidence");
  return {
    assetKind: "declared_testing_evidence_assessment",
    purpose: "Assess the supplied same-invocation construction and actual checker evidence against the original requirement and declared proof obligation.",
    requiredContent: ["Explain what the actual implementation, verifier and selected-command observation establish, citing supplied source and predecessor statements.",
      "Distinguish observed test outcomes from unsupported claims and retain all non-closing application gaps. Do not select new worksite changes."],
    rubric: [{ criterionRef: "criterion://declared-testing.example/evidence/application-and-verifier@5",
      instruction: "Inspect the supplied implementation and verifier artifacts: the application must implement answer() = 42, and the verifier must import and exercise that application and assert the required value rather than hardcode a passing outcome. Compare against evaluationData when supplied; absent or inadequate artifacts do not satisfy this criterion." },
    { criterionRef: "criterion://declared-testing.example/evidence/actual-execution@5",
      instruction: "Assess the actual supplied C2 command identity, argv, streams, exit status and timeout together with the admitted Design. " + TESTING_CHECKER_SUCCESS_CRITERION + " An actor assertion or well-formed carrier alone is not proof." },
    { criterionRef: "criterion://declared-testing.example/evidence/scope@5",
      instruction: "Keep this bounded requirement witness distinct from whole-Product qualification. Preserve unresolved pressure and non-closing gaps; do not infer unsupported capability or acceptance from structural validity." }],
  };
}

export function isTestingCommandExecutionSchema(schema) {
  return schema?.properties?.kind?.const === "worksite_command_execution_worker_result";
}

export async function testingWorksite({ product, environment, grants, selected }) {
  const { workspaceAuthorityBasis, workspaceBinding } = environment, rows = [];
  assert.equal(workspaceAuthorityBasis?.kind, "workspace_authority_basis", "worksite requires the admitted authority basis");
  assert.ok(selected === null || ["A", "B"].includes(selected), "selection is either unselected live input or a declared mechanical alternative");
  for (const [relativePath, role] of [["proof/app.mjs", "implementation"], ["proof/verifier.test.mjs", "verifier"]]) {
    const path = join(workspaceAuthorityBasis.canonicalRoot, relativePath); await mkdir(dirname(path), { recursive: true });
    const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, subjectUri: pathToFileURL(path).href, relativePath });
    assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
    const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis, workspaceBinding, territoryUri: pathToFileURL(dirname(path)).href, relativeRoot: dirname(relativePath) });
    assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
    const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
    const bytes = predecessorObservation.state === "absent" ? Buffer.alloc(0) : await readFile(path);
    if (predecessorObservation.state === "file") {
      assert.equal(product.sha256Bytes(bytes), predecessorObservation.fileDigest, "observed worksite bytes must remain current");
      assert.equal(bytes.length, predecessorObservation.byteLength);
    }
    rows.push({ subject, territory, predecessorObservation, bytes, role });
  }
  const basis = { workspaceAuthorityBasis, workspaceBinding, capabilityGrant: grants[0] };
  const task = product.constructWorksiteConstructionTask({ ...basis, prompt: "Prospectively selected bounded checker witness.", targets: rows });
  const worksite = { ...basis, targets: rows.map((row, i) => ({ target: task.targets[i], base64: row.bytes.toString("base64"), role: row.role })),
    commands: ["A", "B"].map(letter => ({ commandId: checkerRef(letter), executable: process.execPath,
      args: ["--test", "--test-reporter=tap", "proof/verifier.test.mjs"], relativeCwd: ".", environment: { DECLARED_CHECKER: letter },
      timeoutMs: 5_000, terminationGraceMs: 1_000, expectedReports: [] })),
    outcomePredicates: selected === null ? [] : [{ predicateId: "predicate://declared-testing.example/selected-checker-exit", predicateKind: "process_exit",
      declaration: { validationCommandId: checkerRef(selected), equals: 0 } }],
    allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "proof/checker-output" }] };
  // Validate the same selected command configuration before any native setup
  // can consume it. This is only owner construction, never execution evidence.
  product.constructWorksiteCommandPreparationInput({ constructionTask: task,
    commands: selected === null ? worksite.commands : worksite.commands.filter(command => command.commandId === checkerRef(selected)),
    outcomePredicates: worksite.outcomePredicates, allowedWriteTerritories: worksite.allowedWriteTerritories });
  return worksite;
}
