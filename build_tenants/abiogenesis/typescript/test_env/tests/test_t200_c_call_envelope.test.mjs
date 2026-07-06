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
  // digest form: injective over the typed tuple by construction
  assert.match(base, /^c-call:sha256:[0-9a-f]{64}$/);
  assert.equal(base, mintCCallRef(locus), "deterministic");
  // ADVERSARIAL SPLIT (codex round 4): ":"-containing fields must not
  // collide across field boundaries.
  assert.notEqual(
    mintCCallRef({ ...locus, basisId: "x:y", graphCallId: "g" }),
    mintCCallRef({ ...locus, basisId: "x", graphCallId: "y:g" })
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

// ─── P2b: resolveCCall — the spine minted around any fibre interior ───

import { resolveCCall } from "../../build/semantic/code/src/abg/m03/runner/c_call_resolver.js";
import {
  HOG_BOOTSTRAP_TRIPLE as TRIPLE
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 P2b: resolveCCall mints the full spine in order around the interior", async () => {
  const emitted = [];
  const result = await resolveCCall({
    stage: TRIPLE.stages[0],
    locus: { ...locus },
    emit: (events) => emitted.push(...events),
    resolveFibre: async (selection) => {
      assert.equal(selection.stageRole, "transform");
      assert.equal(selection.regime, "F_P");
      assert.equal(selection.armId, "arm://abg/hog/transform");
      return {
        outcomeStatus: "dispatched",
        payloadRef: "payload:target_carrier:sha256:demo",
        responseContractRef: "response-contract://t200/demo",
        evidence: [
          { evidenceClass: "instruction_manifest", evidenceRefs: ["prompt-manifest://t200/p2b"] },
          { evidenceClass: "fp_dispatch", evidenceRefs: ["event://t200/dispatch/1"] }
        ],
        judgment: "advance",
        reasonRef: null
      };
    }
  });
  assert.equal(result.judgment, "advance");
  const kinds = emitted.map((event) => event.kind);
  assert.deepEqual(kinds, [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged"
  ]);
  // enclosure (-006): every interior row carries the spine identity
  for (const event of emitted) {
    assertRuntimeEvent(event);
    assert.equal(event.cCallRef, result.cCallRef);
  }
  // locus-only (-002): the opened event carries no fibre fields
  assert.equal("regime" in emitted[0], false);
  assert.equal("armId" in emitted[0], false);
  // fibre truth lives in the selection row (-003)
  assert.equal(emitted[1].regime, "F_P");
});

test("T-200 P2b: fibre substitution changes the selection row only (-007 seed)", async () => {
  const shapes = [];
  for (const regimeOverride of [undefined, "F_D"]) {
    const emitted = [];
    await resolveCCall({
      stage: TRIPLE.stages[2],
      locus: { ...locus, stageRole: undefined, vectorIndex: 3 },
      regimeOverride,
      emit: (events) => emitted.push(...events),
      resolveFibre: async () => ({
        outcomeStatus: "projected",
        payloadRef: null,
        responseContractRef: null,
        evidence: [{ evidenceClass: "default", evidenceRefs: ["consequence://identity"] }],
        judgment: "no_declared_check",
        reasonRef: null
      })
    });
    shapes.push(emitted.map((event) => event.kind).join(","));
  }
  assert.equal(shapes[0], shapes[1], "spine shape is identical under fibre substitution");
});


test("T-200 round-4: a throwing fibre closes its spine as blocked before propagating", async () => {
  const emitted = [];
  await assert.rejects(
    resolveCCall({
      stage: TRIPLE.stages[0],
      locus: { ...locus },
      emit: (events) => emitted.push(...events),
      resolveFibre: async () => {
        throw new Error("transport exploded");
      }
    }),
    /transport exploded/
  );
  const kinds = emitted.map((event) => event.kind);
  assert.deepEqual(kinds, [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged"
  ]);
  assert.equal(emitted[4].judgment, "blocked");
  assert.equal(emitted[2].evidenceClass, "fibre_failure");
});

test("T-200 round-4: ALL spine kinds are closed surfaces (-002)", () => {
  const o = opened();
  const riders = { unexpected: "x" };
  const bases = [
    { kind: "c_call_fibre_selected", cCallRef: o.cCallRef, basisId: locus.basisId, regime: "F_P", armId: "arm://x", compositionRef: null },
    { kind: "c_call_evidenced", cCallRef: o.cCallRef, basisId: locus.basisId, evidenceClass: "fp_interior", evidenceRefs: ["e://1"] },
    { kind: "c_call_result_admitted", cCallRef: o.cCallRef, basisId: locus.basisId, outcomeStatus: "dispatched", payloadRef: null, responseContractRef: null },
    { kind: "c_call_judged", cCallRef: o.cCallRef, basisId: locus.basisId, judgment: "advance", reasonRef: null }
  ];
  for (const base of bases) {
    assertRuntimeEvent(Object.freeze({ ...base }));
    assert.throws(
      () => assertRuntimeEvent(Object.freeze({ ...base, ...riders })),
      /closed surface|unexpected field/,
      base.kind
    );
  }
});

// ─── P3-B: the enclosure standing witness (-006) ───

import { checkCCallEnclosure } from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 P3-B: enclosure witness — lawful spine accepted; orphan/dangling/order violations caught", () => {
  const o = opened();
  const lawful = [
    o,
    { kind: "c_call_fibre_selected", cCallRef: o.cCallRef, basisId: locus.basisId, regime: "F_P", armId: "arm://x", compositionRef: null },
    { kind: "c_call_evidenced", cCallRef: o.cCallRef, basisId: locus.basisId, evidenceClass: "fp_interior", evidenceRefs: ["e://1"] },
    { kind: "c_call_result_admitted", cCallRef: o.cCallRef, basisId: locus.basisId, outcomeStatus: "dispatched", payloadRef: null, responseContractRef: null },
    { kind: "c_call_judged", cCallRef: o.cCallRef, basisId: locus.basisId, judgment: "advance", reasonRef: null }
  ];
  const ok = checkCCallEnclosure(lawful, { completed: true });
  assert.equal(ok.accepted, true, JSON.stringify(ok.issues));
  // NEGATIVE: orphan spine row (no opened)
  const orphan = checkCCallEnclosure([lawful[4]], { completed: true });
  assert.equal(orphan.accepted, false);
  assert.equal(orphan.issues[0].issueKind, "orphan_spine_row");
  // NEGATIVE: judged before admitted
  const misordered = checkCCallEnclosure([lawful[0], lawful[1], lawful[4]], { completed: false });
  assert.equal(misordered.accepted, false);
  assert.equal(misordered.issues.some((i) => i.issueKind === "judged_before_admitted"), true);
  // NEGATIVE: dangling open spine on completed replay
  const dangling = checkCCallEnclosure([lawful[0], lawful[1]], { completed: true });
  assert.equal(dangling.accepted, false);
  assert.equal(dangling.issues.some((i) => i.issueKind === "dangling_open_spine"), true);
  // TRANSITIONAL: free-floating F_P interior reports but does not fail
  const transitional = checkCCallEnclosure([{ kind: "fp_dispatch_requested", basisId: locus.basisId, dispatchRef: "d://1" }], { completed: true });
  assert.equal(transitional.accepted, true);
  assert.equal(transitional.issues[0]?.issueKind, "unenclosed_fibre_interior");
  assert.equal(transitional.issues[0]?.severity, "transitional");
});

test("T-200 P3-B: enclosure witness holds over the REAL gate replay", async () => {
  const { readFileSync, readdirSync, existsSync } = await import("node:fs");
  const path = (await import("node:path")).default;
  const base = path.resolve("test_env/test_runs/t194_feature_matrix_live");
  if (!existsSync(base)) return; // no local gate runs: witness runs in the gate lane itself
  const runs = readdirSync(base).sort().reverse();
  for (const run of runs.slice(0, 1)) {
    const eventsPath = readdirSync(path.join(base, run)).flatMap((d) => {
      const p = path.join(base, run, d, ".ai-workspace", "events", "events.jsonl");
      return existsSync(p) ? [p] : [];
    })[0];
    if (eventsPath === undefined) return;
    const events = readFileSync(eventsPath, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const report = checkCCallEnclosure(events, { completed: true });
    assert.equal(report.accepted, true, JSON.stringify(report.issues.filter((i) => i.severity === "violation")));
    assert.equal(report.openedCount, report.judgedCount, "every opened spine judged on real replay");
  }
});

// ─── P3-F: the GTL authoring surface for programs ───

import {
  HOG_PROGRAM_DECLARATION_KEY,
  hogProgramFromDeclarationAttrs
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 P3-F: programs author as tagged json_blob declarations (declarations-are-data)", () => {
  const tagged = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://abg/hog/declared-by-product" },
      { key: "proportionalityClass", value: "P2" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://p/t" },
          { key: "resultBearing", value: true }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "evaluate" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://p/e" },
          { key: "resultBearing", value: false }
        ] }
      ] } }
    ]
  };
  const attrs = { entries: [{ key: HOG_PROGRAM_DECLARATION_KEY, value: { kind: "json_blob", value: tagged } }] };
  const compiled = hogProgramFromDeclarationAttrs(attrs, "graph-function://p/demo");
  assert.notEqual(compiled, null);
  assert.equal(compiled.accepted, true, JSON.stringify(compiled.issues));
  assert.equal(compiled.program.programRef, "gtl://abg/hog/declared-by-product");
  // absent key -> null (baked default applies); non-blob -> fail closed
  assert.equal(hogProgramFromDeclarationAttrs({ entries: [] }, "x"), null);
  const bad = hogProgramFromDeclarationAttrs(
    { entries: [{ key: HOG_PROGRAM_DECLARATION_KEY, value: { kind: "scalar", value: "nope" } }] },
    "graph-function://p/demo"
  );
  assert.equal(bad.accepted, false);
});
