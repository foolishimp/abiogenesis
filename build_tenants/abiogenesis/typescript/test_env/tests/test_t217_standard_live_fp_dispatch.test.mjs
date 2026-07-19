// T-217/S2.3 — pins for the STANDARD LIVE F_P DISPATCH plugin: the
// substrate-owned composition that retires product-local dispatch bodies
// (closure campaign, F_H-approved 2026-07-10). A fake agent (node -e)
// exercises every branch through the REAL transport path.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  standardLiveFpDispatchPlugin,
  LIVE_FP_DISPATCH_PLUGIN_REF
} from "../../build/semantic/code/src/abg/m03/index.js";

function fakeAgentContract(script) {
  return Object.freeze({
    agentKey: "generic",
    command: process.execPath,
    argsTemplate: Object.freeze(["-e", script]),
    sanitizedEnvironmentPolicy: Object.freeze({ prefixes: Object.freeze([]) })
  });
}

function capabilityWith(script, overrides = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "t217-live-fp-"));
  return {
    agentContract: fakeAgentContract(script),
    archiveRoot: path.join(root, "archive"),
    cwd: root,
    timeoutMs: 30000,
    labelPrefix: "pin",
    ...overrides
  };
}

function pluginInput(manifest, cCallRef = "c-call://t217/live-fp-pin/default") {
  const identity = cCallRef ?? "null-c-call";
  return {
    basisId: "basis://t217/live-fp-pin",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t217/pin",
    instructionPromptManifest: manifest,
    cCallRef,
    actorInvocationRef: {
      actorInvocationId: `actor-invocation:${identity}`,
      attemptIndex: 0,
      dispatchRef: `dispatch:${identity}`,
      resultRef: `result:${identity}`
    }
  };
}

const RESULT_CONTRACT_REF = "contract://t217/standard-result";

const MANIFEST = Object.freeze({
  renderedPrompt: "return a JSON object with ok=true",
  manifestRef: "manifest://t217/pin",
  selectedOutputContractRef: RESULT_CONTRACT_REF
});

function reviewScript(overrides = {}) {
  const review = {
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [],
    reasons: [],
    ...overrides
  };
  return `console.log(${JSON.stringify(JSON.stringify(review))})`;
}

function dispatchScript(prefix = "") {
  const artifact = {
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: "source->target",
    actor: "worker://t217",
    fulfillment_assessments: [
      {
        id: "assessment://t217",
        evaluator: "assessment://t217",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "standard live dispatch fixture",
        blocking_reasons: [],
        evidence_refs: ["evidence://t217/dispatch"]
      }
    ],
    target_value: { message: "live transform target" }
  };
  const emit = `console.log(${JSON.stringify(JSON.stringify(artifact))})`;
  return prefix.length === 0 ? emit : `${prefix};${emit}`;
}

function dispatchScriptWithoutTarget() {
  const artifact = {
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: "source->target",
    actor: "worker://t217",
    fulfillment_assessments: []
  };
  return `console.log(${JSON.stringify(JSON.stringify(artifact))})`;
}

test("live fp dispatch: contract ref is the catalog identity", () => {
  const plugin = standardLiveFpDispatchPlugin(capabilityWith("process.exit(0)"));
  assert.equal(plugin.contract.ref, LIVE_FP_DISPATCH_PLUGIN_REF);
  assert.equal(plugin.contract.pluginKind, "fp_dispatch");
});

test("live fp dispatch: missing instruction manifest is typed blocked, no spawn", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("throw new Error('must not spawn')")
  );
  const outcome = await plugin.dispatch(pluginInput(null));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /instruction prompt manifest/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("live fp dispatch: transport failure is typed blocked with the retry-allowlist grammar", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("process.exit(3)")
  );
  const outcome = await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /transport failed/u);
  assert.match(outcome.reason, /failureClass=/u);
  assert.equal(outcome.resultArtifactCandidate, null);
  assert.equal(outcome.targetValueCandidate, null);
});

test("live fp dispatch: unparsable worker output is typed blocked contract_failure", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("console.log('prose without any json object')")
  );
  const outcome = await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /unparsable/u);
  assert.match(outcome.reason, /contract_failure/u);
  assert.equal(outcome.resultArtifactCandidate, null);
  assert.equal(outcome.targetValueCandidate, null);
});

test("live fp dispatch: worker JSON object dispatches with the parsed artifact attached", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith(dispatchScript())
  );
  const outcome = await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "dispatched");
  assert.equal(outcome.resultRef, "result:c-call://t217/live-fp-pin/default");
  assert.equal(
    outcome.resultArtifactCandidate.result_contract_ref,
    RESULT_CONTRACT_REF
  );
  assert.equal(outcome.resultArtifactCandidate.edge, "source->target");
  assert.equal(
    outcome.targetValueCandidate.message,
    "live transform target"
  );
  assert.equal(
    Object.hasOwn(outcome.resultArtifactCandidate, "target_value"),
    false
  );
});

test("live fp dispatch: evidence without target B is a contract failure", async () => {
  const outcome = await standardLiveFpDispatchPlugin(
    capabilityWith(dispatchScriptWithoutTarget())
  ).dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /missing required fields: target_value/u);
  assert.match(outcome.reason, /contract_failure/u);
  assert.equal(outcome.resultArtifactCandidate, null);
  assert.equal(outcome.targetValueCandidate, null);
});

test("live fp dispatch: capability time budget is admitted (HANDLERS-008)", () => {
  assert.throws(
    () => standardLiveFpDispatchPlugin(capabilityWith("process.exit(0)", { timeoutMs: 0 })),
    /timeoutMs must be a positive safe integer/u
  );
});

// ── the standard live F_P EVALUATOR: same capability seam, standard
// review contract, mechanical corroboration of expected assessment ids ──

const { standardLiveFpEvaluatorPlugin, LIVE_FP_EVALUATOR_PLUGIN_REF } = await import(
  "../../build/semantic/code/src/abg/m03/index.js"
);

function evaluatorInput(
  manifest,
  expected = [],
  cCallRef = "c-call://t217/live-eval-pin/default"
) {
  return {
    basisId: "basis://t217/live-eval-pin",
    vectorIndex: 1,
    sourceProjectionRef: "projection://t217/pin",
    instructionPromptManifest: manifest,
    expectedAssessmentIds: expected,
    selectedCompositionRef: "composition://t217/pin",
    selectedCompositionDigest: "digest://t217/pin",
    selectedRegimeBindingRef: null,
    cCallRef
  };
}

test("live fp evaluator: accepted review with attested ids evaluates fulfilled/close", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith(reviewScript({ assessmentIds: ["a1"] }))
  );
  assert.equal(plugin.contract.ref, LIVE_FP_EVALUATOR_PLUGIN_REF);
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, ["a1"]));
  assert.equal(outcome.status, "evaluated");
  assert.equal(outcome.ambiguityStatus, "fulfilled");
  assert.equal(outcome.findings[0].closeDisposition, "close");
  assert.equal(outcome.findings[0].executiveDisposition, "close_candidate");
});

test("live fp evaluator: target_value is outside the review profile", async () => {
  const outcome = await standardLiveFpEvaluatorPlugin(
    capabilityWith(
      reviewScript({ target_value: { message: "wrong evaluator locus" } })
    )
  ).evaluate(evaluatorInput(MANIFEST));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /undeclared fields: target_value/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("live fp evaluator: a worker cannot accept by omission — unattested expected ids force retry", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith(reviewScript())
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, ["a1", "a2"]));
  assert.equal(outcome.status, "evaluated");
  assert.equal(outcome.ambiguityStatus, "partial");
  assert.equal(outcome.findings[0].closeDisposition, "retry");
  assert.equal(
    outcome.findings[0].residualPressureRefs.some((ref) => ref.includes("unattested/a1")),
    true
  );
});

test("live fp evaluator: malformed review is typed blocked contract_failure", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith(reviewScript({ accepted: "yes" }))
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /review unparsable|accepted must be a boolean/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("live fp evaluator: a misspelled response field is rejected, never defaulted to close", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith(
      reviewScript({ assessmentIds: ["a1"], closeDispostion: "retry" })
    )
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, ["a1"]));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /undeclared fields: closeDispostion/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("live fp evaluator: unexpected, duplicate, or empty assessment ids are malformed", async () => {
  const cases = [
    {
      script: reviewScript({ assessmentIds: ["a1", "bogus"] }),
      expectedReason: /unexpected ids: bogus/u
    },
    {
      script: reviewScript({ assessmentIds: ["a1", "a1"] }),
      expectedReason: /must not contain duplicates/u
    },
    {
      script: reviewScript({ assessmentIds: ["a1", ""] }),
      expectedReason: /array of non-empty strings/u
    }
  ];
  for (const row of cases) {
    const plugin = standardLiveFpEvaluatorPlugin(capabilityWith(row.script));
    const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, ["a1"]));
    assert.equal(outcome.status, "blocked");
    assert.match(outcome.reason, row.expectedReason);
    assert.match(outcome.reason, /contract_failure/u);
  }
});

test("live fp evaluator: transport failure is typed blocked with allowlist grammar", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(capabilityWith("process.exit(2)"));
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /transport failed/u);
  assert.match(outcome.reason, /failureClass=/u);
});

// ═══ codex round pins (T-217 closure campaign, review round 3) ═══

// codex round 5 §1: the microtask fence was never a real safety
// mechanism (an unawaited body still runs after the sync driver records
// blocked). The real guarantee is the ADMISSION BOUNDARY refusing the
// async plugin before invocation — pinned in test_t192 (R4-1) and
// asserted here at the contract level: the live plugin declares
// async_required, so no sync driver can ever board it.
test("F1: the live dispatch plugin declares async_required (admission refuses it on the sync driver)", () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("console.log(JSON.stringify({ ok: true }))")
  );
  assert.equal(plugin.contract.driverRequirement, "async_required");
});

test("F2: distinct invocations never collide — attempt and invocation id key the archive", async () => {
  const cap = capabilityWith(dispatchScript());
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readdirSync } = await import("node:fs");
  const inputA = {
    ...pluginInput(MANIFEST, "c-call://t217/f2/a"),
    actorInvocationRef: { actorInvocationId: "inv://a", attemptIndex: 0, dispatchRef: "d://a", resultRef: "result://a" }
  };
  const inputB = {
    ...pluginInput(MANIFEST, "c-call://t217/f2/b"),
    actorInvocationRef: { actorInvocationId: "inv://a", attemptIndex: 1, dispatchRef: "d://b", resultRef: "result://b" }
  };
  const outcomeA = await plugin.dispatch(inputA);
  const outcomeB = await plugin.dispatch(inputB);
  assert.notEqual(outcomeA.resultRef, outcomeB.resultRef, "result refs must not alias");
  const bundles = readdirSync(path.join(cap.archiveRoot, "by-c-call"));
  assert.equal(bundles.length, 2, "each canonical c-call keeps its own archive");
});

test("F4: contradictory accepted-with-retry output is typed blocked", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith(reviewScript({ closeDisposition: "retry" }))
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /contradictory/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("F6: failed transports reconcile to their session — archive refs ride the blocked outcome", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(capabilityWith("process.exit(2)"));
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.equal(
    outcome.evidenceRefs.some((ref) => ref.startsWith("agent-output:")),
    true,
    "the failed session's output archive must be citable from the outcome"
  );
});

test("F7: hostile labelPrefix fails typed; capability mutation cannot change execution", async () => {
  assert.throws(
    () => standardLiveFpDispatchPlugin(capabilityWith("process.exit(0)", { labelPrefix: "../escape" })),
    /path-safe label component/u
  );
  const cap = capabilityWith(dispatchScript());
  const originalRoot = cap.archiveRoot;
  const plugin = standardLiveFpDispatchPlugin(cap);
  cap.archiveRoot = "/tmp/hijacked-root-must-not-be-used";
  const { existsSync } = await import("node:fs");
  await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(existsSync(originalRoot), true, "the SNAPSHOTTED root is used");
  assert.equal(existsSync("/tmp/hijacked-root-must-not-be-used"), false);
});

test("F8: an alias catalog row fails closed on contract identity", async () => {
  const { resolveDeclaredPluginSelection, STANDARD_ENGINE_PLUGIN_CATALOG } = await import(
    "../../build/semantic/code/src/abg/m03/index.js"
  );
  const legit = STANDARD_ENGINE_PLUGIN_CATALOG["plugin://abg/fp-dispatch"];
  assert.throws(
    () =>
      resolveDeclaredPluginSelection({
        selection: { fpDispatch: "plugin://abg/aliased" },
        sourceRef: "gf://pin",
        catalog: { "plugin://abg/aliased": legit }
      }),
    /plugin_selection_identity_mismatch/u
  );
});

test("F5: duplicate selection declarations and duplicate seam keys fail closed", async () => {
  const { pluginSelectionFromDeclarationAttrs } = await import(
    "../../build/semantic/code/src/abg/m03/index.js"
  );
  const blob = { kind: "object", entries: [{ key: "fpDispatch", value: "plugin://abg/fp-dispatch" }] };
  assert.throws(
    () =>
      pluginSelectionFromDeclarationAttrs(
        { entries: [
          { key: "abg.plugin_selection", value: { kind: "json_blob", value: blob } },
          { key: "abg.plugin_selection", value: { kind: "json_blob", value: blob } }
        ] },
        "gf://pin"
      ),
    /duplicate selection authorities/u
  );
  assert.throws(
    () =>
      pluginSelectionFromDeclarationAttrs(
        { entries: [{ key: "abg.plugin_selection", value: { kind: "json_blob", value: {
          kind: "object", entries: [
            { key: "fpDispatch", value: "plugin://abg/fp-dispatch" },
            { key: "fpDispatch", value: "plugin://abg/fd-evaluator" }
          ]
        } } }] },
        "gf://pin"
      ),
    /declared twice/u
  );
});

test("F3: CLI capability admission is strict — no hints, no suffixes, no silent defaults", async () => {
  const { admitLiveAgentKey, admitExecutorProfile, admitLiveTimeoutMs } = await import(
    "../../build/semantic/code/src/cli/command.js"
  );
  assert.throws(() => admitLiveAgentKey("notclaude"), /live agent must be one of/u);
  assert.equal(admitLiveAgentKey("codex"), "codex");
  assert.throws(() => admitExecutorProfile("bogus"), /executor profile must be/u);
  assert.throws(() => admitLiveTimeoutMs("240000x"), /plain integer/u);
  assert.equal(admitLiveTimeoutMs("240000"), 240000);
});

// ═══ codex round 4 pins ═══

test("R5-3: identical c-call verifies and reuses its completed bundle without rerunning", async () => {
  const cap = capabilityWith(
    dispatchScript("require('fs').appendFileSync('worker-count','x')")
  );
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readFileSync, readdirSync } = await import("node:fs");
  const bare = pluginInput(MANIFEST);
  const a = await plugin.dispatch(bare);
  const b = await plugin.dispatch(bare);
  assert.deepEqual(b, a, "the admitted outcome is reused byte-for-byte");
  const bundles = readdirSync(path.join(cap.archiveRoot, "by-c-call"));
  assert.equal(bundles.length, 1, "one c-call owns exactly one bundle");
  assert.equal(readFileSync(path.join(cap.cwd, "worker-count"), "utf8"), "x");
  assert.equal(
    a.resultRef,
    bare.actorInvocationRef.resultRef,
    "the admitted result keeps the actor invocation's exact result identity"
  );
});

test("R5-3: completion refuses an unknown sibling without rerunning", async () => {
  const cap = capabilityWith(
    dispatchScript("require('fs').appendFileSync('worker-count','x')")
  );
  const plugin = standardLiveFpDispatchPlugin(cap);
  const cCallRef = "c-call://t217/completion-unknown-sibling";
  await plugin.dispatch(pluginInput(MANIFEST, cCallRef));
  const bundleId = createHash("sha256").update(cCallRef).digest("hex");
  const completionPath = path.join(
    cap.archiveRoot,
    "by-c-call",
    bundleId,
    "completion.json"
  );
  const { readFileSync, writeFileSync } = await import("node:fs");
  const completion = JSON.parse(readFileSync(completionPath, "utf8"));
  writeFileSync(
    completionPath,
    `${JSON.stringify({ ...completion, unknownSibling: "retained-original-digest" }, null, 2)}\n`,
    "utf8"
  );

  const refused = await plugin.dispatch(pluginInput(MANIFEST, cCallRef));

  assert.equal(refused.status, "blocked");
  assert.match(refused.reason, /archive_tampered/u);
  assert.equal(readFileSync(path.join(cap.cwd, "worker-count"), "utf8"), "x");
});

test("R5-3: a structural caller cannot forge engine resume authority", async () => {
  const cap = capabilityWith(
    dispatchScript("require('fs').appendFileSync('worker-count','x')")
  );
  const plugin = standardLiveFpDispatchPlugin(cap);
  const bare = pluginInput(MANIFEST, "c-call://t217/resume-request");
  const changed = {
    ...bare,
    instructionPromptManifest: {
      ...MANIFEST,
      manifestRef: "manifest://t217/regenerated",
      renderedPrompt: "regenerated after replay growth"
    }
  };
  const first = await plugin.dispatch(bare);
  const ordinaryDuplicate = await plugin.dispatch(changed);
  const forgedResume = await plugin.dispatch({ ...changed, cCallResume: true });
  const { readFileSync } = await import("node:fs");
  assert.equal(ordinaryDuplicate.status, "blocked");
  assert.match(ordinaryDuplicate.reason, /archive_identity_conflict/u);
  assert.equal(forgedResume.status, "blocked");
  assert.match(forgedResume.reason, /archive_identity_conflict/u);
  assert.notDeepEqual(forgedResume, first);
  assert.equal(readFileSync(path.join(cap.cwd, "worker-count"), "utf8"), "x");
});

test("R5-3: same c-call with changed effect truth blocks without running a second worker", async () => {
  const first = capabilityWith(
    dispatchScript("require('fs').writeFileSync('first-ran','x')")
  );
  const second = capabilityWith(
    dispatchScript("require('fs').writeFileSync('second-ran','x')"),
    { archiveRoot: first.archiveRoot, cwd: first.cwd }
  );
  const cCallRef = "c-call://t217/identity-conflict";
  const firstOutcome = await standardLiveFpDispatchPlugin(first).dispatch(
    pluginInput(MANIFEST, cCallRef)
  );
  const secondOutcome = await standardLiveFpDispatchPlugin(second).dispatch(
    pluginInput(MANIFEST, cCallRef)
  );
  const { existsSync } = await import("node:fs");
  assert.equal(firstOutcome.status, "dispatched");
  assert.equal(secondOutcome.status, "blocked");
  assert.match(secondOutcome.reason, /archive_identity_conflict/u);
  assert.equal(existsSync(path.join(first.cwd, "second-ran")), false);
});

test("R5-3: incomplete and tampered bundles block without repeating external work", async () => {
  const cap = capabilityWith(
    dispatchScript("require('fs').appendFileSync('worker-count','x')")
  );
  const plugin = standardLiveFpDispatchPlugin(cap);
  const cCallRef = "c-call://t217/incomplete";
  await plugin.dispatch(pluginInput(MANIFEST, cCallRef));
  const bundleId = createHash("sha256").update(cCallRef).digest("hex");
  const bundleRoot = path.join(cap.archiveRoot, "by-c-call", bundleId);
  const { readFileSync, rmSync } = await import("node:fs");
  rmSync(path.join(bundleRoot, "completion.json"));
  const incomplete = await plugin.dispatch(pluginInput(MANIFEST, cCallRef));
  assert.equal(incomplete.status, "blocked");
  assert.match(incomplete.reason, /archive_incomplete/u);
  assert.equal(
    incomplete.evidenceRefs.some((ref) => ref.endsWith("/output.txt")),
    true,
    "an incomplete bundle still reports its actual worker output"
  );
  assert.equal(
    incomplete.evidenceRefs.some((ref) => ref.endsWith("/trace/result.json")),
    true,
    "an incomplete bundle still reports its actual trace result"
  );
  assert.equal(readFileSync(path.join(cap.cwd, "worker-count"), "utf8"), "x");

  for (const name of (await import("node:fs")).readdirSync(bundleRoot)) {
    if (["request.json", "instruction-manifest.json", "launch.json"].includes(name)) {
      continue;
    }
    rmSync(path.join(bundleRoot, name), { recursive: true, force: true });
  }
  const launchOnly = await plugin.dispatch(pluginInput(MANIFEST, cCallRef));
  assert.equal(launchOnly.status, "blocked");
  assert.equal(
    launchOnly.evidenceRefs.some((ref) => ref.startsWith("agent-launch:")),
    true,
    "a launched/no-output attempt remains citable without inventing output evidence"
  );
  assert.equal(
    launchOnly.evidenceRefs.some(
      (ref) => ref.startsWith("agent-output:") || ref.startsWith("agent-trace:")
    ),
    false
  );

  const cap2 = capabilityWith(
    dispatchScript("require('fs').appendFileSync('worker-count','x')")
  );
  const plugin2 = standardLiveFpDispatchPlugin(cap2);
  const tamperRef = "c-call://t217/tamper";
  await plugin2.dispatch(pluginInput(MANIFEST, tamperRef));
  const tamperId = createHash("sha256").update(tamperRef).digest("hex");
  const tamperRoot = path.join(cap2.archiveRoot, "by-c-call", tamperId);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(path.join(tamperRoot, "output.txt"), "tampered", "utf8");
  const tampered = await plugin2.dispatch(pluginInput(MANIFEST, tamperRef));
  assert.equal(tampered.status, "blocked");
  assert.match(tampered.reason, /archive_tampered/u);
  assert.equal(readFileSync(path.join(cap2.cwd, "worker-count"), "utf8"), "x");
});

test("R5-2: null c-call refuses before archive or worker effects", async () => {
  const cap = capabilityWith(
    dispatchScript("require('fs').writeFileSync('worker-ran','x')")
  );
  const plugin = standardLiveFpDispatchPlugin(cap);
  const outcome = await plugin.dispatch(pluginInput(MANIFEST, null));
  const { existsSync } = await import("node:fs");
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /canonical cCallRef/u);
  assert.equal(existsSync(cap.archiveRoot), false);
  assert.equal(existsSync(path.join(cap.cwd, "worker-ran")), false);
});

test("R5-4: post-launch archive exception is contract_failure with existing evidence only", async () => {
  const cap = capabilityWith("process.exit(0)");
  cap.agentContract = fakeAgentContract(
    dispatchScript("require('fs').mkdirSync(process.argv[1])")
  );
  cap.agentContract = Object.freeze({
    ...cap.agentContract,
    argsTemplate: Object.freeze([
      "-e",
      dispatchScript("require('fs').mkdirSync(process.argv[1])"),
      "{output_path}"
    ])
  });
  const outcome = await standardLiveFpDispatchPlugin(cap).dispatch(
    pluginInput(MANIFEST, "c-call://t217/post-launch")
  );
  const { statSync } = await import("node:fs");
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /after launch/u);
  assert.match(outcome.reason, /contract_failure/u);
  assert.doesNotMatch(outcome.reason, /transport_failure/u);
  const archivedEvidence = outcome.evidenceRefs.filter((ref) => ref.startsWith("agent-"));
  assert.notEqual(archivedEvidence.length, 0);
  for (const ref of archivedEvidence) {
    const filePath = ref.slice(ref.indexOf(":") + 1);
    assert.equal(statSync(filePath).isFile(), true, `evidence must exist: ${filePath}`);
  }
  assert.equal(
    archivedEvidence.some((ref) => ref.endsWith("/trace/result.json")),
    true,
    "trace evidence names the transport's actual result path"
  );
});

test("R5-5: worker-created output symlink is rejected before archive read or write", async () => {
  const cap = capabilityWith("process.exit(0)");
  const outsidePath = path.join(cap.cwd, "outside.txt");
  const workerScript = [
    "const fs=require('fs')",
    `fs.writeFileSync(${JSON.stringify(outsidePath)},'outside')`,
    `fs.symlinkSync(${JSON.stringify(outsidePath)},process.argv[1])`,
    dispatchScript()
  ].join(";");
  cap.agentContract = Object.freeze({
    ...fakeAgentContract(workerScript),
    argsTemplate: Object.freeze(["-e", workerScript, "{output_path}"])
  });
  const outcome = await standardLiveFpDispatchPlugin(cap).dispatch(
    pluginInput(MANIFEST, "c-call://t217/output-symlink")
  );
  const { readFileSync } = await import("node:fs");
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /symbolic-link component/u);
  assert.match(outcome.reason, /contract_failure/u);
  assert.equal(readFileSync(outsidePath, "utf8"), "outside");
  assert.equal(
    outcome.evidenceRefs.some((ref) => ref.startsWith("agent-output:")),
    false,
    "a symlink is never promoted as output evidence"
  );
});

test("R5-2/R5-3: cCallRef alone keys the bundle and request identity", async () => {
  const cap = capabilityWith(dispatchScript());
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readFileSync } = await import("node:fs");
  const pathMod = await import("node:path");
  const cCallRef = "c-call://t217/pin-7";
  const withCall = pluginInput(MANIFEST, cCallRef);
  await plugin.dispatch(withCall);
  const bundleId = createHash("sha256").update(cCallRef).digest("hex");
  const request = JSON.parse(
    readFileSync(
      pathMod.join(cap.archiveRoot, "by-c-call", bundleId, "request.json"),
      "utf8"
    )
  );
  assert.equal(request.cCallRef, cCallRef);
});

test("R5-5: a pre-planted per-call symlink blocks before worker execution", async () => {
  const cap = capabilityWith(dispatchScript());
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { existsSync, mkdirSync, symlinkSync } = await import("node:fs");
  const pathMod = await import("node:path");
  const cCallRef = "c-call://t217/symlink-plant";
  const bundleId = createHash("sha256").update(cCallRef).digest("hex");
  const callsRoot = pathMod.join(cap.archiveRoot, "by-c-call");
  const outside = pathMod.join(pathMod.dirname(cap.archiveRoot), "outside");
  mkdirSync(callsRoot, { recursive: true });
  mkdirSync(outside, { recursive: true });
  symlinkSync(outside, pathMod.join(callsRoot, bundleId), "dir");
  const outcome = await plugin.dispatch(pluginInput(MANIFEST, cCallRef));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /archive_unconfined|symbolic/u);
  assert.equal(existsSync(pathMod.join(outside, "request.json")), false);
});

const { admitLiveTimeoutMs: admitTimeout } = await import(
  "../../build/semantic/code/src/cli/command.js"
);
test("R4-7: admitLiveTimeoutMs rejects zero (positive-budget law)", () => {
  assert.throws(() => admitTimeout("0"), /POSITIVE integer/u);
  assert.equal(admitTimeout("1"), 1);
});

const { resolveLiveCapabilityProvenance } = await import(
  "../../build/semantic/code/src/cli/command.js"
);
test("R4-3: capability provenance records value AND source per field", () => {
  const prov = resolveLiveCapabilityProvenance({
    liveAgent: "claude",
    liveTimeoutMs: "900000",
    executorProfile: "pty-terminal"
  });
  assert.equal(prov.agentKey, "claude");
  assert.equal(prov.agentKeySource, "flag");
  assert.equal(prov.executorProfile, "pty-terminal");
  assert.equal(prov.executorProfileSource, "flag");
  assert.equal(prov.timeoutMs, 900000);
  assert.equal(prov.timeoutMsSource, "flag");
  // no live steering at all → null
  assert.equal(
    resolveLiveCapabilityProvenance({ liveAgent: undefined, liveTimeoutMs: undefined, executorProfile: undefined }),
    null
  );
});

test("R4-6: a row whose contract pluginKind mismatches the seam fails closed", async () => {
  const { resolveDeclaredPluginSelection, STANDARD_ENGINE_PLUGIN_CATALOG } = await import(
    "../../build/semantic/code/src/abg/m03/index.js"
  );
  // put the fd-evaluator row under the fpDispatch key with a matching ref
  const evalRow = STANDARD_ENGINE_PLUGIN_CATALOG["plugin://abg/fd-evaluator"];
  assert.throws(
    () =>
      resolveDeclaredPluginSelection({
        selection: { fpDispatch: "plugin://abg/fd-evaluator" },
        sourceRef: "gf://pin",
        catalog: { "plugin://abg/fd-evaluator": evalRow }
      }),
    /plugin_selection_seam_mismatch|plugin_selection_kind_mismatch/u
  );
});
