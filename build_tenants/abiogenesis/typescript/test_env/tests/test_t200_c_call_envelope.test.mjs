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

// ─── P2a: the HoG program carrier + baked P0 triple ───

import {
  HOG_BOOTSTRAP_TRIPLE,
  admitHogProgram,
  hogProgramCensus
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 P2a: the baked triple is itself an admissible program (P0 self-lawfulness)", () => {
  const admission = admitHogProgram(HOG_BOOTSTRAP_TRIPLE);
  assert.equal(admission.accepted, true, JSON.stringify(admission.issues));
  assert.equal(admission.program.stages.length, 3);
  assert.equal(hogProgramCensus(admission.program).size, 3);
});

test("T-200 P2a: declared programs admit fail-closed (-014)", () => {
  const richer = admitHogProgram({
    kind: "hog_program_declaration",
    programRef: "gtl://abg/hog/campaign-hardened",
    stages: [
      { stageRole: "plan", defaultRegime: "F_P", armId: "arm://x/plan", resultBearing: false },
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://x/t", resultBearing: true },
      { stageRole: "admit", defaultRegime: "F_D", armId: "arm://x/a", resultBearing: false },
      { stageRole: "critique", defaultRegime: "F_P", armId: "arm://x/c", resultBearing: false },
      { stageRole: "evaluate", defaultRegime: "F_P", armId: "arm://x/e", resultBearing: false },
      { stageRole: "consequence", defaultRegime: "F_D", armId: "arm://x/q", resultBearing: false }
    ],
    proportionalityClass: "P2"
  });
  assert.equal(richer.accepted, true, JSON.stringify(richer.issues));
  // negatives: duplicate role, zero result-bearing, unlawful regime
  assert.equal(admitHogProgram({
    kind: "hog_program_declaration",
    programRef: "gtl://x",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://a", resultBearing: true },
      { stageRole: "transform", defaultRegime: "F_D", armId: "arm://b", resultBearing: false }
    ],
    proportionalityClass: null
  }).accepted, false);
  assert.equal(admitHogProgram({
    kind: "hog_program_declaration",
    programRef: "gtl://x",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://a", resultBearing: false }
    ],
    proportionalityClass: null
  }).accepted, false);
  assert.equal(admitHogProgram({
    kind: "hog_program_declaration",
    programRef: "gtl://x",
    stages: [
      { stageRole: "transform", defaultRegime: "F_X", armId: "arm://a", resultBearing: true }
    ],
    proportionalityClass: null
  }).accepted, false);
});

// ─── P2a.2: syntax isolation — authored syntax compiles, engine sees only normalized ───

import {
  compileHogProgramSyntax
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 P2a.2: hog-syntax/1 compiles to the normalized carrier", () => {
  const compiled = compileHogProgramSyntax({
    syntaxVersion: "hog-syntax/1",
    programRef: "gtl://abg/hog/from-syntax",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://s/t", resultBearing: true },
      { stageRole: "evaluate", defaultRegime: "F_P", armId: "arm://s/e", resultBearing: false }
    ],
    proportionalityClass: "P1"
  });
  assert.equal(compiled.accepted, true, JSON.stringify(compiled.issues));
  assert.equal(compiled.program.kind, "hog_program_declaration");
  assert.equal(compiled.program.programRef, "gtl://abg/hog/from-syntax");
});

test("T-200 P2a.2 NEGATIVE: unknown syntax versions fail closed (upgrade seam)", () => {
  const future = compileHogProgramSyntax({
    syntaxVersion: "hog-syntax/2",
    programRef: "gtl://abg/hog/composed",
    compose: ["a", "b"]
  });
  assert.equal(future.accepted, false);
  assert.match(future.issues[0], /unknown program syntaxVersion/);
});
