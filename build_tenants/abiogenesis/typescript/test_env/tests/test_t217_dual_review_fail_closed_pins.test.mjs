// Dual review 2026-07-10 — fail-closed pins for the findings repaired
// in this round. Each test names the finding it pins; the refuted
// behavior is stated so a regression reads as a law violation, not a
// style choice.

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitHogProgram,
  constructPayloadRejectedEvent,
  executeHandler,
  runtimeEventsForBasis,
  sortReplayByAdmissionOrdinalFailClosed,
  standardProcessExecutionHandler
} from "../../build/semantic/code/src/abg/m03/index.js";

// ── REPLAY INGEST LAW (agent finding F1-F9 root: array order is not
//    admission order; the ingest chokepoints sort and fail closed) ──

test("ingest law: shuffled replay sorts by admission ordinal, not file order", () => {
  const events = [
    { kind: "b", eventAdmissionOrdinal: 5 },
    { kind: "a", eventAdmissionOrdinal: 2 },
    { kind: "c", eventAdmissionOrdinal: 9 }
  ];
  const sorted = sortReplayByAdmissionOrdinalFailClosed(events, "pin");
  assert.deepEqual(sorted.map((event) => event.kind), ["a", "b", "c"]);
});

test("ingest law: colliding admission ordinals are unorderable truth and fail closed", () => {
  assert.throws(
    () =>
      sortReplayByAdmissionOrdinalFailClosed(
        [
          { kind: "a", eventAdmissionOrdinal: 3 },
          { kind: "b", eventAdmissionOrdinal: 3 }
        ],
        "pin"
      ),
    /ordinal collision/u
  );
});

test("ingest law: a replay row without an admission ordinal fails closed", () => {
  assert.throws(
    () =>
      sortReplayByAdmissionOrdinalFailClosed(
        [{ kind: "a", eventAdmissionOrdinal: 1 }, { kind: "b" }],
        "pin"
      ),
    /requires an admission ordinal/u
  );
});

// ── EVENTS-026 (agent finding F10): a newly minted payload_rejected
//    must carry structured issue rows — emptiness spoofed the absence
//    law while truth rode the reason grammar ──

test("EVENTS-026: payload_rejected refuses to mint with zero structured issue rows", () => {
  assert.throws(
    () =>
      constructPayloadRejectedEvent({
        basis: { id: "basis://pin" },
        vectorIndex: 0,
        payloadRef: "payload://pin",
        rejectionClass: "contradictory",
        reason: "reason grammar only",
        issues: []
      }),
    /requires at least one structured issue row/u
  );
});

// ── EVENTS-025 (agent finding F11): scope-class membership must not
//    walk the prototype chain — an undeclared kind named like an
//    Object.prototype member bypassed the fail-closed throw ──

test("EVENTS-025: an undeclared no-scope kind named 'toString' fails closed at the basis filter", () => {
  assert.throws(
    () =>
      runtimeEventsForBasis({ id: "basis://pin" }, [{ kind: "toString" }]),
    /carries no basis scope and is not declared run-independent/u
  );
});

// ── hog admission (agent finding F3): proportionalityClass must be
//    PRESENT — explicitly null or a non-empty string; an absent key is
//    an undeclared surface, not an implicit null ──

const LAWFUL_HOG = Object.freeze({
  kind: "hog_program_declaration",
  programRef: "gtl://pin",
  stages: Object.freeze([
    { stageRole: "transform", defaultRegime: "F_P", armId: "arm://pin", resultBearing: true }
  ]),
  proportionalityClass: null
});

test("hog admission: absent proportionalityClass key rejects; explicit null admits", () => {
  const { proportionalityClass: _dropped, ...withoutKey } = LAWFUL_HOG;
  const rejected = admitHogProgram(withoutKey);
  assert.equal(rejected.accepted, false);
  assert.match(
    rejected.issues.join(";"),
    /proportionalityClass must be null or a non-empty string/u
  );
  assert.equal(admitHogProgram(LAWFUL_HOG).accepted, true);
});

// ── HANDLERS-008 budget + declared-config strictness (agent finding F5
//    + codex P2): declared config is typed AS DECLARED — numeric env
//    values and non-positive/fractional/NaN time budgets are typed
//    blocked interiors, never Node coercion or a misfiring timer ──

function neverRunsIo() {
  return {
    runProcess: () => {
      throw new Error("io must not be reached when config admission rejects");
    }
  };
}

function baseProcessConfig(overrides = {}) {
  return {
    command: "node",
    args: ["-e", "process.exit(0)"],
    env: { PORT: "8080" },
    cwd: ".",
    timeoutMs: 1000,
    ...overrides
  };
}

function runBlockedProbe(declaredConfig) {
  const handler = standardProcessExecutionHandler(neverRunsIo());
  const interior = executeHandler(handler, {
    stage: { stageRole: "execute", defaultRegime: "F_D", armId: "arm://pin", resultBearing: false },
    binding: {
      programRef: "gtl://pin",
      stageRole: "execute",
      armId: "arm://pin",
      regime: "F_D",
      handlerRef: "handler://pin",
      handlerClass: "pipeline",
      handlerConfigRef: null
    },
    declaredConfig,
    workProjection: null
  });
  return interior;
}

test("declared-config strictness: numeric env value is a typed blocked interior (acknowledged tightening)", () => {
  const interior = runBlockedProbe(baseProcessConfig({ env: { PORT: 8080 } }));
  assert.equal(interior.outcomeStatus, "blocked");
  assert.match(interior.failureReason, /contract_failure/u);
});

test("HANDLERS-008: zero, fractional, and NaN time budgets are typed blocked interiors", () => {
  for (const timeoutMs of [0, 1.5, Number.NaN, -100]) {
    const interior = runBlockedProbe(baseProcessConfig({ timeoutMs }));
    assert.equal(interior.outcomeStatus, "blocked", `timeoutMs ${timeoutMs} must block`);
    assert.match(interior.failureReason, /contract_failure/u);
  }
});

test("declared-config strictness: the lawful shape still executes", () => {
  const handler = standardProcessExecutionHandler({
    runProcess: () => ({ status: 0, stdout: "", stderr: "", error: null })
  });
  const interior = executeHandler(handler, {
    stage: { stageRole: "execute", defaultRegime: "F_D", armId: "arm://pin", resultBearing: false },
    binding: {
      programRef: "gtl://pin",
      stageRole: "execute",
      armId: "arm://pin",
      regime: "F_D",
      handlerRef: "handler://pin",
      handlerClass: "pipeline",
      handlerConfigRef: null
    },
    declaredConfig: baseProcessConfig(),
    workProjection: null
  });
  assert.equal(interior.outcomeStatus, "executed");
});
