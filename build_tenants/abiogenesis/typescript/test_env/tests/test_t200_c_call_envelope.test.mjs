// Validates: REQ-R-ABG3-CCALL-001..-008, -014 (P1 differentials).
// The spine admission axes, the ONE cCallRef mint, the locus-only
// negative controls, the judgment vocabulary, and open roles.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  constructCCallEvidencedEvent,
  constructCCallFibreSelectedEvent,
  constructCCallJudgedEvent,
  constructCCallOpenedEvent,
  constructCCallResultAdmittedEvent,
  mintCCallRef
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { assertRuntimeEvent } from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";

const locus = Object.freeze({
  basisId: "execution_basis:t200",
  graphFunctionId: "graph-function://t200/demo",
  graphCallId: "graph-call:execution_basis:t200",
  frameId: "frame:execution_basis:t200:root",
  edge: "t200_demo_edge",
  vectorIndex: 0,
  stageRole: "transform",
  taskOrdinal: null,
  attempt: 1,
  batchRef: null
});

function opened(overrides = {}) {
  return constructCCallOpenedEvent({ ...locus, ...overrides });
}

test("T-200 P1: all five spine kinds construct and admit", () => {
  const o = opened();
  assertRuntimeEvent(o);
  const ref = o.cCallRef;
  assertRuntimeEvent(constructCCallFibreSelectedEvent({
    cCallRef: ref,
    basisId: locus.basisId,
    regime: "F_P",
    armId: "arm://t200/transform/f_p",
    compositionRef: null
  }));
  assertRuntimeEvent(constructCCallEvidencedEvent({
    cCallRef: ref,
    basisId: locus.basisId,
    evidenceClass: "instruction_manifest",
    evidenceRefs: ["prompt-manifest://t200/demo/0"]
  }));
  assertRuntimeEvent(constructCCallResultAdmittedEvent({
    cCallRef: ref,
    basisId: locus.basisId,
    outcomeStatus: "dispatched",
    payloadRef: null,
    responseContractRef: null
  }));
  assertRuntimeEvent(constructCCallJudgedEvent({
    cCallRef: ref,
    basisId: locus.basisId,
    judgment: "advance",
    reasonRef: null
  }));
});

test("T-200 P1: mintCCallRef carries full replay identity (-004)", () => {
  const base = mintCCallRef(locus);
  assert.equal(
    base,
    "c-call:execution_basis:t200:graph-call:execution_basis:t200:frame:execution_basis:t200:root:0:transform:-:1"
  );
  // recursive frames, repeated graph calls, composed tasks, attempts —
  // each identity axis produces a DISTINCT ref (collision differential)
  const variants = [
    mintCCallRef({ ...locus, frameId: "frame:execution_basis:t200:child" }),
    mintCCallRef({ ...locus, graphCallId: "graph-call:execution_basis:t200:2" }),
    mintCCallRef({ ...locus, taskOrdinal: 3 }),
    mintCCallRef({ ...locus, attempt: 2 }),
    mintCCallRef({ ...locus, stageRole: "evaluate" }),
    mintCCallRef({ ...locus, vectorIndex: 7 })
  ];
  const all = new Set([base, ...variants]);
  assert.equal(all.size, 7, "every identity axis must produce a distinct cCallRef");
});

test("T-200 P1 NEGATIVE: the spine is locus-only — fibre fields rejected (-002)", () => {
  for (const rider of [{ regime: "F_P" }, { armId: "arm://x" }]) {
    assert.throws(
      () => assertRuntimeEvent(Object.freeze({ ...opened(), ...rider })),
      /locus-only/
    );
  }
});

test("T-200 P1 NEGATIVE: unknown sibling fields rejected — closed key set (-002)", () => {
  for (const rider of [{ manifestRef: "prompt-manifest://x" }, { unexpected: true }]) {
    assert.throws(
      () => assertRuntimeEvent(Object.freeze({ ...opened(), ...rider })),
      /locus-only|unexpected field/
    );
  }
});

test("T-200 P1: judgment vocabulary is closed and includes no_declared_check (-008)", () => {
  assertRuntimeEvent(constructCCallJudgedEvent({
    cCallRef: opened().cCallRef,
    basisId: locus.basisId,
    judgment: "no_declared_check",
    reasonRef: null
  }));
  assert.throws(
    () => assertRuntimeEvent(Object.freeze({
      kind: "c_call_judged",
      cCallRef: "c-call:x",
      basisId: locus.basisId,
      judgment: "approved_by_vibes",
      reasonRef: null
    })),
    /judgment/
  );
});

test("T-200 P1: fibre regime vocabulary is closed (-003)", () => {
  assert.throws(
    () => assertRuntimeEvent(Object.freeze({
      kind: "c_call_fibre_selected",
      cCallRef: "c-call:x",
      basisId: locus.basisId,
      regime: "F_X",
      armId: "arm://x",
      compositionRef: null
    })),
    /regime/
  );
});

test("T-200 P1: stage roles are OPEN program data at admission (-014)", () => {
  const critique = opened({ stageRole: "critique" });
  assertRuntimeEvent(critique);
  assert.equal(critique.stageRole, "critique");
  // membership in the declared program is an enclosure/conformance
  // concern (P2), not a field-admission concern.
});
