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
  assert.match(outcome.resultRef, /^result:live_fp_dispatch:pin-v0$/u);
  assert.equal(outcome.attachedResultArtifact.ok, true);
  assert.equal(outcome.attachedResultArtifact.stage, "pin");
});

test("live fp dispatch: capability time budget is admitted (HANDLERS-008)", () => {
  assert.throws(
    () => standardLiveFpDispatchPlugin(capabilityWith("process.exit(0)", { timeoutMs: 0 })),
    /timeoutMs must be a positive safe integer/u
  );
});
