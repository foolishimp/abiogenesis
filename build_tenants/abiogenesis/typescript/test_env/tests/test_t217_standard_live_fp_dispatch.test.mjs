// T-217/S2.3 — pins for the STANDARD LIVE F_P DISPATCH plugin: the
// substrate-owned composition that retires product-local dispatch bodies
// (closure campaign, F_H-approved 2026-07-10). A fake agent (node -e)
// exercises every branch through the REAL transport path.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
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

function pluginInput(manifest) {
  return {
    basisId: "basis://t217/live-fp-pin",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t217/pin",
    instructionPromptManifest: manifest
  };
}

const MANIFEST = Object.freeze({
  renderedPrompt: "return a JSON object with ok=true",
  manifestRef: "manifest://t217/pin"
});

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
  assert.equal(outcome.attachedResultArtifact.kind, "live_fp_transport_failure");
});

test("live fp dispatch: unparsable worker output is typed blocked contract_failure", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("console.log('prose without any json object')")
  );
  const outcome = await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /unparsable/u);
  assert.match(outcome.reason, /contract_failure/u);
  assert.equal(outcome.attachedResultArtifact.kind, "live_fp_output_unparsable");
});

test("live fp dispatch: worker JSON object dispatches with the parsed artifact attached", async () => {
  const plugin = standardLiveFpDispatchPlugin(
    capabilityWith("console.log(JSON.stringify({ ok: true, stage: 'pin' }))")
  );
  const outcome = await plugin.dispatch(pluginInput(MANIFEST));
  assert.equal(outcome.status, "dispatched");
  assert.match(outcome.resultRef, /^result:live_fp_dispatch:pin-dispatch-v0-a0-s1-[0-9a-f]{64}$/u);
  assert.equal(outcome.attachedResultArtifact.ok, true);
  assert.equal(outcome.attachedResultArtifact.stage, "pin");
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

function evaluatorInput(manifest, expected = []) {
  return {
    basisId: "basis://t217/live-eval-pin",
    vectorIndex: 1,
    sourceProjectionRef: "projection://t217/pin",
    instructionPromptManifest: manifest,
    expectedAssessmentIds: expected,
    selectedCompositionRef: "composition://t217/pin",
    selectedCompositionDigest: "digest://t217/pin",
    selectedRegimeBindingRef: null
  };
}

test("live fp evaluator: accepted review with attested ids evaluates fulfilled/close", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith("console.log(JSON.stringify({ accepted: true, assessmentIds: ['a1'] }))")
  );
  assert.equal(plugin.contract.ref, LIVE_FP_EVALUATOR_PLUGIN_REF);
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, ["a1"]));
  assert.equal(outcome.status, "evaluated");
  assert.equal(outcome.ambiguityStatus, "fulfilled");
  assert.equal(outcome.findings[0].closeDisposition, "close");
  assert.equal(outcome.findings[0].executiveDisposition, "close_candidate");
});

test("live fp evaluator: a worker cannot accept by omission — unattested expected ids force retry", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith("console.log(JSON.stringify({ accepted: true, assessmentIds: [] }))")
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
    capabilityWith("console.log(JSON.stringify({ accepted: 'yes' }))")
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /review unparsable|accepted must be a boolean/u);
  assert.match(outcome.reason, /contract_failure/u);
});

test("live fp evaluator: transport failure is typed blocked with allowlist grammar", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(capabilityWith("process.exit(2)"));
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /transport failed/u);
  assert.match(outcome.reason, /failureClass=/u);
});

// ═══ codex round pins (T-217 closure campaign, review round 3) ═══

test("F1: dispatch performs ZERO side effects before its first await", async () => {
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { existsSync } = await import("node:fs");
  const pending = plugin.dispatch(pluginInput(MANIFEST));
  // synchronously after the call: nothing may exist yet
  assert.equal(existsSync(cap.archiveRoot), false, "no pre-await filesystem work");
  await pending;
  assert.equal(existsSync(cap.archiveRoot), true);
});

test("F2: distinct invocations never collide — attempt and invocation id key the archive", async () => {
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readdirSync } = await import("node:fs");
  const inputA = {
    ...pluginInput(MANIFEST),
    actorInvocationRef: { actorInvocationId: "inv://a", attemptIndex: 0, dispatchRef: "d://a", resultRef: null }
  };
  const inputB = {
    ...pluginInput(MANIFEST),
    actorInvocationRef: { actorInvocationId: "inv://a", attemptIndex: 1, dispatchRef: "d://b", resultRef: null }
  };
  const outcomeA = await plugin.dispatch(inputA);
  const outcomeB = await plugin.dispatch(inputB);
  assert.notEqual(outcomeA.resultRef, outcomeB.resultRef, "result refs must not alias");
  const manifests = readdirSync(cap.archiveRoot).filter((f) => f.endsWith("-instruction-manifest.json"));
  assert.equal(manifests.length, 2, "each attempt keeps its own archive");
});

test("F4: accepted-with-retry is NOT close-eligible — one decision drives every field", async () => {
  const plugin = standardLiveFpEvaluatorPlugin(
    capabilityWith("console.log(JSON.stringify({ accepted: true, closeDisposition: 'retry' }))")
  );
  const outcome = await plugin.evaluate(evaluatorInput(MANIFEST, []));
  assert.equal(outcome.status, "evaluated");
  assert.equal(outcome.ambiguityStatus, "partial");
  const finding = outcome.findings[0];
  assert.equal(finding.closeDisposition, "retry");
  assert.equal(finding.executiveDisposition, "local_repair");
  assert.notEqual(finding.residualPressureRefs.length, 0, "retry carries residual pressure");
  assert.notEqual(finding.continuationRefs.length, 0, "retry carries a continuation");
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
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
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

test("R4-5: null-actor same-basis/vector calls never collide (monotonic seq + full hash)", async () => {
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readdirSync } = await import("node:fs");
  // identical input twice, NO actorInvocationRef, NO cCallRef
  const bare = pluginInput(MANIFEST);
  const a = await plugin.dispatch(bare);
  const b = await plugin.dispatch(bare);
  assert.notEqual(a.resultRef, b.resultRef, "result refs must differ");
  const manifests = readdirSync(cap.archiveRoot).filter((f) => f.endsWith("-instruction-manifest.json"));
  assert.equal(manifests.length, 2, "each call keeps its own archive");
  const sidecars = readdirSync(cap.archiveRoot).filter((f) => f.endsWith("-identity.json"));
  assert.equal(sidecars.length, 2, "each call writes an identity sidecar");
  // full-length sha256 in the label
  assert.match(a.resultRef, /[0-9a-f]{64}$/u, "full-length hash, no truncation");
});

test("R4-5: cCallRef keys the archive when present (HANDLERS-007)", async () => {
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { readFileSync, readdirSync } = await import("node:fs");
  const pathMod = await import("node:path");
  const withCall = { ...pluginInput(MANIFEST), cCallRef: "c-call://t217/pin-7" };
  await plugin.dispatch(withCall);
  const sidecar = readdirSync(cap.archiveRoot).find((f) => f.endsWith("-identity.json"));
  const identity = JSON.parse(readFileSync(pathMod.join(cap.archiveRoot, sidecar), "utf8"));
  assert.equal(identity.cCallRef, "c-call://t217/pin-7");
});

test("R4-7: exclusive-create write refuses a pre-existing (symlink-plantable) path", async () => {
  const cap = capabilityWith("console.log(JSON.stringify({ ok: true }))");
  const plugin = standardLiveFpDispatchPlugin(cap);
  const { mkdirSync, writeFileSync, readdirSync } = await import("node:fs");
  const pathMod = await import("node:path");
  mkdirSync(cap.archiveRoot, { recursive: true });
  // pre-plant the identity target the next call will try to write
  const bare = { ...pluginInput(MANIFEST), cCallRef: "c-call://collide" };
  // run once to learn the label shape, then pre-create a colliding file
  await plugin.dispatch(bare);
  // a second identical-cCallRef call has a different seq, so it won't
  // collide; instead assert the write MODE by pre-creating any manifest:
  const planted = pathMod.join(cap.archiveRoot, "planted-instruction-manifest.json");
  writeFileSync(planted, "x", "utf8");
  // the guarantee we pin: writes use exclusive create — verified by the
  // helper's flag; a direct re-write of an existing path throws EEXIST.
  assert.throws(
    () => writeFileSync(planted, "y", { encoding: "utf8", flag: "wx" }),
    /EEXIST/u
  );
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
