// T-217 — USER RULING (2026-07-10): ALL live proof runs on
// sandbox-style installs. A live test provisions a packed-and-installed
// substrate (the m05-installed-fixtures family or the real installer)
// and drives the INSTALLED surface; it does not run live agents against
// the repo's build tree.
//
// Enforcement follows the odd_glc execution-authority precedent: the
// files below are the PINNED LEGACY LIST — live tests that predate the
// ruling and still run in-repo. The list SHRINKS BY MIGRATION ONLY:
// migrating a file removes its entry (a stale entry fails this pin);
// any NEW live test must be conformant from birth. The conformant
// exemplar is test_t217_witness_sandbox_installed.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TESTS_DIR, "..");

// Dual review 2026-07-10 (F4/F5 hardening):
// — DISCOVERY is content-based over EVERY lane, not a filename glob
//   over two lanes: a live test is any test in live/, any legacy-listed
//   test, or any test that flips the live agent gates — wherever it
//   lives and whatever it is named. New lanes are scanned automatically.
// — CONFORMANCE is call-shaped: the file must CALL an install fixture;
//   a marker in a comment or string no longer classifies.
const CONFORMANCE_SELF = "tests/test_t217_live_sandbox_install_conformance.test.mjs";
const LIVE_GATE_PATTERN = /CODEX_LIVE_FP|ABG_TS_LIVE_AGENT/u;
const INSTALL_CALL_PATTERN =
  /\b(?:provisionInstalledRoot|installPackedTenantPackage|installAbiogenesisTypescript)\s*\(/u;
const NON_LANE_DIRS = new Set(["test_runs"]);

// the legacy list, pinned at ruling time. SHRINK ONLY.
const LEGACY_IN_REPO_LIVE = Object.freeze([
  "live/test_t094_assurance_register_two_hop_live.test.mjs",
  "live/test_t100_five_rule_algebra_live.test.mjs",
  "live/test_t113_live_pty_claude_actor_worker.test.mjs",
  "live/test_t119_temporal_gtl_live.test.mjs",
  "live/test_t125_temporal_and_non_temporal_gtl_live.test.mjs",
  "live/test_t127_fp_consciousness_scenarios_live.test.mjs",
  "live/test_t141_saga_frontier_live.test.mjs",
  "live/test_t150_gtl_prompt_asset_surface_live.test.mjs",
  "live/test_t151_segment_scoped_evaluation_redispatch_live.test.mjs",
  "live/test_t155_graph_function_zoom_plan_live.test.mjs",
  "live/test_t159_odd_sdlc_t132_frozen_live.test.mjs",
  "live/test_t160_recursive_executive_observer_live.test.mjs",
  "live/test_t162_requirements_algebra_live.test.mjs",
  "live/test_t165_hello_world_requirements_route_live.test.mjs",
  "live/test_t168_requirement_graph_refinement_live.test.mjs",
  "live/test_t169_requirement_span_identity_recursion_live.test.mjs",
  "live/test_t171_non_js_toolchain_execution_live.test.mjs",
  "live/test_t172_service_process_request_live.test.mjs",
  "live/test_t173_generic_proof_evidence_live.test.mjs",
  "live/test_t174_parallel_hello_world_live.test.mjs",
  "live/test_t175_live_non_closed_requirements_route.test.mjs",
  "live/test_t180_gtl_node_types_live.test.mjs",
  "live/test_t188_requirement_proof_carry_through_live.test.mjs",
  "sandbox/test_t101_mini_dm_redux_live.test.mjs",
  "sandbox/test_t107_mini_dm_traversal_schemes_live.test.mjs",
  "sandbox/test_m05_data_mapper_real_ingress.test.mjs"
]);

function contentOf(relativePath) {
  return readFileSync(path.join(TEST_ENV_ROOT, relativePath), "utf8");
}

function liveTestFiles() {
  const legacy = new Set(LEGACY_IN_REPO_LIVE);
  const files = [];
  const lanes = readdirSync(TEST_ENV_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !NON_LANE_DIRS.has(entry.name))
    .map((entry) => entry.name);
  for (const lane of lanes) {
    for (const entry of readdirSync(path.join(TEST_ENV_ROOT, lane))) {
      if (!entry.endsWith(".test.mjs")) {
        continue;
      }
      const file = `${lane}/${entry}`;
      if (file === CONFORMANCE_SELF) {
        continue;
      }
      const isLive =
        lane === "live" ||
        legacy.has(file) ||
        LIVE_GATE_PATTERN.test(contentOf(file));
      if (isLive) {
        files.push(file);
      }
    }
  }
  return files.sort();
}

function usesInstalledSubstrate(relativePath) {
  return INSTALL_CALL_PATTERN.test(contentOf(relativePath));
}

test("T-217 live-install law: every live proof surface uses a sandbox-style install, except the pinned shrinking legacy list", () => {
  const legacy = new Set(LEGACY_IN_REPO_LIVE);
  const violations = [];
  const staleLegacyEntries = [];
  const seen = new Set();
  for (const file of liveTestFiles()) {
    seen.add(file);
    const conformant = usesInstalledSubstrate(file);
    if (conformant && legacy.has(file)) {
      staleLegacyEntries.push(file);
    }
    if (!conformant && !legacy.has(file)) {
      violations.push(file);
    }
  }
  const vanished = LEGACY_IN_REPO_LIVE.filter((file) => !seen.has(file));
  assert.deepEqual(
    violations,
    [],
    "new live tests must provision a sandbox-style install (see test_t217_witness_sandbox_installed.test.mjs); the legacy list shrinks by migration, never grows"
  );
  assert.deepEqual(
    staleLegacyEntries,
    [],
    "these files became conformant: remove them from the legacy list (shrink-only)"
  );
  assert.deepEqual(
    vanished,
    [],
    "legacy entries must track real files: deleted/renamed tests leave the list"
  );
});
