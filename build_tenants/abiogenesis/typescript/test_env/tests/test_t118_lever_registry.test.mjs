// T-118 unified lever registry: completeness + behavior-preservation.
//
// The golden table below is the behavior-preservation proof: every registry
// value must equal the value the runtime used before the registry existed.
// For mirrored levers whose live constant is exported, we ALSO import the live
// constant and assert registry === live, so neither literal can drift.

import test from "node:test";
import assert from "node:assert/strict";

import {
  LEVER_REGISTRY,
  leverEntries,
  tunableKeys,
  isTunableLever,
  getLever
} from "../../build/semantic/code/src/shared/lever_registry/registry.js";

// Live constants (already/now exported) — the drift-guard anchors.
import {
  DEFAULT_TIMEOUT_MS,
  DEFAULT_TERMINATION_GRACE_MS,
  DEFAULT_HEARTBEAT_MS
} from "../../build/semantic/code/src/abg/m03/transport/process_actor.js";
import { DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS } from "../../build/semantic/code/src/abg/m03/runner/attached_fp_worker.js";
import {
  TERMINAL_LOST_GRACE_MS,
  PTY_AGENT_SUPERVISOR_DECISION_GRACE_MS
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import { TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS } from "../../build/semantic/code/src/abg/m03/contracts/traversal_modulation.js";

// Frozen golden table: dottedKey -> the value the runtime used before T-118.
const GOLDEN = {
  "abg.m04.until": "converged",
  "abg.m04.fh_mode": "direct",
  "abg.transport.actor.timeout_ms": 1_800_000,
  "abg.transport.actor.termination_grace_ms": 10_000,
  "abg.transport.actor.heartbeat_ms": 30_000,
  "abg.runner.retry.max_attempts": 3,
  "abg.transport.executor.profile": "local-spawn",
  "abg.transport.process.parser": "generic-text",
  "abg.transport.pty.terminal_lost_grace_ms": 5_000,
  "abg.transport.pty.supervisor_decision_grace_ms": 5_000,
  "abg.transport.pty.screen_command": "screen",
  "abg.transport.pty.term": "xterm-256color",
  "abg.traversal.modulation.same_edge_until": "foldback_closed",
  "abg.traversal.modulation.max_attempts_without_new_signal": 1,
  "abg.traversal.modulation.max_total_attempts": 3,
  "abg.traversal.modulation.no_progress_class": "runtime_non_progress",
  "abg.traversal.modulation.progress_artifact_required": false,
  "abg.traversal.strategy.default_attr_keys": ["abg.default_traversal_strategy"],
  "abg.graph.vector.index_seed": 0,
  "abg.graph.span.generation_seed": 0,
  "abg.construction.intent.value_score_seed": 0,
  "abg.construction.intent.priority_score_seed": 0,
  "abg.construction.priority.boost_weight_seed": 0,
  "abg.construction.priority.attenuation_weight_seed": 0,
  "abg.construction.observation.severity_seed": 1,
  "abg.saga.frontier.declared_priority_seed": 0,
  "abg.saga.frontier.critical_path_cost_seed": 0,
  "abg.saga.frontier.lease_start_ms": 0,
  "abg.saga.frontier.release_start_ms": 500,
  "abg.runner.regime.default": "F_D",
  "abg.asset_addressing.assets_key": "assets",
  "abg.asset_addressing.handle_key": "asset_id",
  "abg.asset_addressing.asset_id_key": "asset_id",
  "abg.asset_addressing.uri_key": "uri",
  "abg.asset_addressing.path_kind_key": "checkpoint.path_kind",
  "abg.asset_addressing.exists_key": "checkpoint.exists",
  "abg.asset_addressing.owner_kind_key": "operator_target.kind",
  "abg.transport.worker.ref_fallback": "contract.agentKey",
  "abg.transport.trace.root_suffix": ".trace",
  "abg.transport.env.sanitation_policy": "(contract-carried)",
  "abg.transport.parser.claude_stream_inference": "claude-stream-json",
  "abg.m04.root_mode.when_converged": "supervised",
  "abg.m04.root_mode.otherwise": "direct"
};

test("T-118 registry: completeness — every golden key present, no extras", () => {
  const registryKeys = new Set(LEVER_REGISTRY.keys());
  for (const key of Object.keys(GOLDEN)) {
    assert.ok(registryKeys.has(key), `registry missing lever ${key}`);
  }
  assert.equal(
    registryKeys.size,
    Object.keys(GOLDEN).length,
    "registry has levers not in the golden table (or vice versa)"
  );
});

test("T-118 registry: no duplicate keys; every entry classed + reasoned", () => {
  const seen = new Set();
  for (const entry of leverEntries()) {
    assert.ok(!seen.has(entry.dottedKey), `duplicate ${entry.dottedKey}`);
    seen.add(entry.dottedKey);
    assert.ok(
      entry.leverClass === "tunable" || entry.leverClass === "fixed",
      `${entry.dottedKey}: bad class`
    );
    assert.ok(entry.reason.length > 0, `${entry.dottedKey}: missing reason`);
    assert.ok(
      entry.consumedAt.length > 0,
      `${entry.dottedKey}: missing consumedAt`
    );
  }
});

test("T-118 registry: behavior-preservation — value equals prior constant", () => {
  for (const [key, expected] of Object.entries(GOLDEN)) {
    const entry = getLever(key);
    assert.deepEqual(
      entry.value,
      expected,
      `${key}: registry value drifted from golden`
    );
  }
});

test("T-118 registry: drift-guard — value equals the live exported constant", () => {
  assert.equal(
    getLever("abg.transport.actor.timeout_ms").value,
    DEFAULT_TIMEOUT_MS
  );
  assert.equal(
    getLever("abg.transport.actor.termination_grace_ms").value,
    DEFAULT_TERMINATION_GRACE_MS
  );
  assert.equal(
    getLever("abg.transport.actor.heartbeat_ms").value,
    DEFAULT_HEARTBEAT_MS
  );
  assert.equal(
    getLever("abg.runner.retry.max_attempts").value,
    DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
  );
  assert.equal(
    getLever("abg.transport.pty.terminal_lost_grace_ms").value,
    TERMINAL_LOST_GRACE_MS
  );
  assert.equal(
    getLever("abg.transport.pty.supervisor_decision_grace_ms").value,
    PTY_AGENT_SUPERVISOR_DECISION_GRACE_MS
  );
  assert.deepEqual(
    getLever("abg.traversal.strategy.default_attr_keys").value,
    TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS
  );
});

test("T-118 registry: tunable/fixed boundary", () => {
  // M04 levers are tunable; structural seeds are fixed.
  assert.ok(isTunableLever("abg.m04.until"));
  assert.ok(isTunableLever("abg.m04.fh_mode"));
  assert.ok(!isTunableLever("abg.graph.vector.index_seed"));
  assert.ok(!isTunableLever("abg.m04.root_mode.when_converged"));
  // every fixed lever is excluded from the override-able set
  const tunable = tunableKeys();
  for (const entry of leverEntries()) {
    assert.equal(
      tunable.has(entry.dottedKey),
      entry.leverClass === "tunable",
      `${entry.dottedKey}: tunableKeys disagrees with leverClass`
    );
  }
});
