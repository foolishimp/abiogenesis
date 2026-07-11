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
    programRef: "gtl://abg/hog/bootstrap-triple",
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
      programRef: "gtl://abg/hog/bootstrap-triple",
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
    { kind: "c_call_fibre_selected", cCallRef: o.cCallRef, basisId: locus.basisId, regime: "F_P", armId: "arm://x", programRef: "gtl://abg/hog/bootstrap-triple", compositionRef: null },
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
    const events = readFileSync(eventsPath, "utf8").trim().split("\n").flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
    if (!events.some((e) => e.kind === "terminal_reached")) return; // in-flight run
    const report = checkCCallEnclosure(events, { completed: true });
    assert.equal(report.accepted, true, JSON.stringify(report.issues.filter((i) => i.severity === "violation")));
    assert.equal(report.openedCount, report.judgedCount, "every opened spine judged on real replay");
  }
});

// ─── P3-F: the GTL authoring surface for programs ───

import {
  HOG_PROGRAM_DECLARATION_KEY,
  compileExecutionDeclarations,
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

// ─── P6: substitution shape at ENGINE level — F_P and F_D C calls leave identical spine skeletons ───

test("T-200 P6: engine-level fibre substitution preserves spine shape (-007)", async () => {
  const { readFileSync, readdirSync, existsSync } = await import("node:fs");
  const path = (await import("node:path")).default;
  const base = path.resolve("test_env/test_runs/t194_feature_matrix_live");
  if (!existsSync(base)) return;
  const run = readdirSync(base).sort().reverse()[0];
  const eventsPath = readdirSync(path.join(base, run)).flatMap((d) => {
    const p = path.join(base, run, d, ".ai-workspace", "events", "events.jsonl");
    return existsSync(p) ? [p] : [];
  })[0];
  if (eventsPath === undefined) return;
  const events = readFileSync(eventsPath, "utf8").trim().split("\n").flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
    if (!events.some((e) => e.kind === "terminal_reached")) return; // in-flight run
  const byRef = new Map();
  for (const event of events) {
    if (event.cCallRef === undefined) continue;
    const row = byRef.get(event.cCallRef) ?? { kinds: [], regime: null };
    row.kinds.push(event.kind);
    if (event.kind === "c_call_fibre_selected") row.regime = event.regime;
    byRef.set(event.cCallRef, row);
  }
  const shapes = { F_P: new Set(), F_D: new Set() };
  for (const row of byRef.values()) {
    if (row.regime === "F_P" || row.regime === "F_D") {
      shapes[row.regime].add(row.kinds.join(","));
    }
  }
  assert.ok(shapes.F_P.size > 0 && shapes.F_D.size > 0, "both fibres present on the gate run");
  assert.deepEqual([...shapes.F_P], [...shapes.F_D],
    "identical spine kind-sequence under fibre substitution — tags differ, shape never");
});

// ─── -016: labelled catalogs — HoG is never a singleton ───

import {
  compileHogProgramCatalog,
  selectHogProgram
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-200 -016: labelled program catalogs — coexisting configurations, per-ref selection, fail-closed duplicates", () => {
  const lean = {
    syntaxVersion: "hog-syntax/1",
    programRef: "gtl://odd_glc/hog/lean-doc",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://d/t", resultBearing: true,
        instructionCategoryRefs: ["instruction-category://plan-inline", "instruction-category://self-critique"] },
      { stageRole: "evaluate", defaultRegime: "F_P", armId: "arm://d/e", resultBearing: false }
    ],
    proportionalityClass: "P1"
  };
  const hardened = {
    syntaxVersion: "hog-syntax/1",
    programRef: "gtl://odd_glc/hog/code-hardened",
    stages: [
      { stageRole: "plan", defaultRegime: "F_P", armId: "arm://c/p", resultBearing: false },
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://c/t", resultBearing: true },
      { stageRole: "admit", defaultRegime: "F_D", armId: "arm://c/a", resultBearing: false },
      { stageRole: "critique", defaultRegime: "F_P", armId: "arm://c/c", resultBearing: false },
      { stageRole: "evaluate", defaultRegime: "F_P", armId: "arm://c/e", resultBearing: false },
      { stageRole: "consequence", defaultRegime: "F_D", armId: "arm://c/q", resultBearing: false }
    ],
    proportionalityClass: "P3"
  };
  const compiled = compileHogProgramCatalog([lean, hardened]);
  assert.equal(compiled.accepted, true, JSON.stringify(compiled.issues));
  assert.equal(compiled.catalog.programs.size, 2);
  // selection by label
  const picked = selectHogProgram(compiled.catalog, "gtl://odd_glc/hog/code-hardened");
  assert.equal(picked.stages.length, 6);
  assert.equal(selectHogProgram(compiled.catalog, "gtl://nope"), null);
  // the prompt-level surface rides the stage rows
  const leanPicked = selectHogProgram(compiled.catalog, "gtl://odd_glc/hog/lean-doc");
  assert.deepEqual(leanPicked.stages[0].instructionCategoryRefs,
    ["instruction-category://plan-inline", "instruction-category://self-critique"]);
  // NEGATIVE: duplicate labels fail closed
  const dup = compileHogProgramCatalog([lean, lean]);
  assert.equal(dup.accepted, false);
  assert.match(dup.issues[0], /duplicate programRef/);
});

// ─── T-205 B2: the ONE interpretation seam (HANDLERS-011/-012) ───

import {
  resolveHogProgram,
  assertHogProgramExecutable,
  HOG_PROGRAM_CATALOG_DECLARATION_KEY,
  HOG_PROGRAM_SELECTION_KEY
} from "../../build/semantic/code/src/abg/m03/index.js";

const TRIPLE_SYNTAX = (ref, armPrefix) => ({
  kind: "object",
  entries: [
    { key: "syntaxVersion", value: "hog-syntax/1" },
    { key: "programRef", value: ref },
    { key: "proportionalityClass", value: "P1" },
    { key: "stages", value: { kind: "array", items: [
      { kind: "object", entries: [
        { key: "stageRole", value: "transform" },
        { key: "defaultRegime", value: "F_P" },
        { key: "armId", value: `${armPrefix}/t` },
        { key: "resultBearing", value: true }
      ] },
      { kind: "object", entries: [
        { key: "stageRole", value: "evaluate" },
        { key: "defaultRegime", value: "F_P" },
        { key: "armId", value: `${armPrefix}/e` },
        { key: "resultBearing", value: false }
      ] },
      { kind: "object", entries: [
        { key: "stageRole", value: "consequence" },
        { key: "defaultRegime", value: "F_D" },
        { key: "armId", value: `${armPrefix}/c` },
        { key: "resultBearing", value: false }
      ] }
    ] } }
  ]
});
const gfWith = (entries) => ({
  id: "graph-function://t205/seam",
  name: "graph-function://t205/seam",
  declarations: { entries }
});
const resolveDeclaredProgram = (graphFunction, attempt = 1) =>
  resolveHogProgram(
    compileExecutionDeclarations(graphFunction).hogProgramPlan,
    attempt
  );

test("T-205 B2: resolution order — default, declared single, catalog+selection; fail-closed matrix", () => {
  // default
  const dflt = resolveDeclaredProgram(gfWith([]));
  assert.equal(dflt.source, "default");
  assert.equal(dflt.program.programRef, "gtl://abg/hog/bootstrap-triple");
  // declared single
  const single = resolveDeclaredProgram(gfWith([
    { key: "abg.hog_program", value: { kind: "json_blob", value: TRIPLE_SYNTAX("gtl://t205/custom", "arm://x") } }
  ]));
  assert.equal(single.source, "declared");
  assert.equal(single.program.programRef, "gtl://t205/custom");
  // catalog + selection
  const catalogEntries = [
    { key: HOG_PROGRAM_CATALOG_DECLARATION_KEY, value: { kind: "json_blob", value: {
      kind: "array", items: [TRIPLE_SYNTAX("gtl://t205/lean", "arm://l"), TRIPLE_SYNTAX("gtl://t205/hard", "arm://h")]
    } } },
    { key: HOG_PROGRAM_SELECTION_KEY, value: { kind: "scalar", value: "gtl://t205/hard" } }
  ];
  const picked = resolveDeclaredProgram(gfWith(catalogEntries));
  assert.equal(picked.source, "declared_catalog");
  assert.equal(picked.program.programRef, "gtl://t205/hard");
  assert.equal(picked.program.stages[0].armId, "arm://h/t");
  // FAIL-CLOSED: unknown selection ref
  assert.throws(() => resolveDeclaredProgram(gfWith([
    catalogEntries[0],
    { key: HOG_PROGRAM_SELECTION_KEY, value: { kind: "scalar", value: "gtl://t205/nope" } }
  ])), /does not name a program/);
  // FAIL-CLOSED: selection without catalog
  assert.throws(() => resolveDeclaredProgram(gfWith([
    { key: HOG_PROGRAM_SELECTION_KEY, value: { kind: "scalar", value: "gtl://t205/hard" } }
  ])), /requires a declared/);
  // FAIL-CLOSED: catalog without selection
  assert.throws(() => resolveDeclaredProgram(gfWith([catalogEntries[0]])), /requires abg\.hog_program_ref|requires/);
  // FAIL-CLOSED: admitted-but-unexecutable stage set (staged earn until B3)
  const critiqueStage = {
    kind: "object", entries: [
      { key: "stageRole", value: "critique" },
      { key: "defaultRegime", value: "F_P" },
      { key: "armId", value: "arm://d/k" },
      { key: "resultBearing", value: false }
    ]
  };
  const sixStage = TRIPLE_SYNTAX("gtl://t205/deep", "arm://d");
  // lawful position: between evaluate and consequence
  sixStage.entries.find((e) => e.key === "stages").value.items.splice(2, 0, critiqueStage);
  const deepResolved = resolveDeclaredProgram(gfWith([
    { key: "abg.hog_program", value: { kind: "json_blob", value: sixStage } }
  ]));
  // no registry: extra role fails closed
  assert.throws(() => assertHogProgramExecutable(deepResolved, null), /unsupported_stage_set/);
  // COMPLETE binding narrows the wall (program×stage×arm + regime + registered handler)
  const critiqueHandler = syncCCallHandler(() => ({ outcomeStatus: "executed", evidenceRefs: [], payloadRef: null, responseContractRef: null, failureReason: null }));
  const completeRegistry = (over) => ({
    bindings: [{ programRef: "gtl://t205/deep", stageRole: "critique", armId: "arm://d/k",
      regime: "F_P", handlerRef: "handler://t205/critique", ...over }],
    handlers: new Map([["handler://t205/critique", critiqueHandler]])
  });
  assertHogProgramExecutable(deepResolved, completeRegistry({}));
  // wrong arm: fails closed
  assert.throws(() => assertHogProgramExecutable(deepResolved, completeRegistry({ armId: "arm://other" })), /unsupported_stage_set/);
  // regime mismatch vs the stage's declared regime: fails closed (codex MEDIUM)
  assert.throws(() => assertHogProgramExecutable(deepResolved, completeRegistry({ regime: "F_D" })), /unsupported_stage_set/);
  // unregistered handlerRef: fails closed (codex MEDIUM)
  assert.throws(() => assertHogProgramExecutable(deepResolved, completeRegistry({ handlerRef: "handler://nope" })), /unsupported_stage_set/);
  // POSITION LAW: an extra stage after consequence has no lawful anchor
  const misplaced = TRIPLE_SYNTAX("gtl://t205/misplaced", "arm://m");
  misplaced.entries.find((e) => e.key === "stages").value.items.push(critiqueStage);
  assert.throws(
    () =>
      resolveDeclaredProgram(gfWith([
        { key: "abg.hog_program", value: { kind: "json_blob", value: misplaced } }
      ])),
    /outside the current lawful handler anchors/
  );
});

// ─── T-205 B3: the handler contract — census-bound, fail-closed, typed failure ───

import {
  admitHandlerRegistry,
  constructCCallHandler,
  resolveHandlerForSelection,
  executeHandler
} from "../../build/semantic/code/src/abg/m03/index.js";

function syncCCallHandler(execute) {
  return constructCCallHandler({ driverRequirement: "sync_compatible", execute });
}

test("T-205 B3: handler registry — admission, fail-closed resolution, regime mismatch, typed throw conversion (-001/-002/-006/-012)", () => {
  const okHandler = syncCCallHandler(() => Object.freeze({
    outcomeStatus: "accepted", evidenceRefs: ["exec://ok"], payloadRef: null,
    responseContractRef: null, failureReason: null
  }));
  const throwingHandler = syncCCallHandler(() => { throw new Error("spawn ENOENT"); });
  const handlers = new Map([
    ["handler://abg/fd/process-execution", okHandler],
    ["handler://t205/throwing", throwingHandler]
  ]);
  const binding = {
    programRef: "gtl://t205/custom", stageRole: "consequence", armId: "arm://x/c",
    regime: "F_D", handlerRef: "handler://abg/fd/process-execution",
    handlerClass: "pipeline", handlerConfigRef: null
  };
  // admission: duplicates + unknown refs fail
  assert.equal(admitHandlerRegistry({ bindings: [binding], handlers }).accepted, true);
  const missingDriverMetadata = admitHandlerRegistry({
    bindings: [binding],
    handlers: new Map([[binding.handlerRef, () => ({})]])
  });
  assert.equal(missingDriverMetadata.accepted, false);
  assert.match(
    missingDriverMetadata.issues.join("; "),
    /driverRequirement/u,
    "handler driver capability has no default"
  );
  const dup = admitHandlerRegistry({ bindings: [binding, binding], handlers });
  assert.equal(dup.accepted, false);
  assert.match(dup.issues[0], /duplicate binding/);
  const unknown = admitHandlerRegistry({
    bindings: [{ ...binding, handlerRef: "handler://nope" }], handlers
  });
  assert.equal(unknown.accepted, false);
  assert.match(unknown.issues[0], /no registered handler/);
  // codex probe pinned: empty/invalid fields must reject
  const probe = admitHandlerRegistry({
    bindings: [{ programRef: "", stageRole: "", armId: "", regime: "F_X",
      handlerRef: "", handlerClass: "pipeline", handlerConfigRef: 7 }],
    handlers
  });
  assert.equal(probe.accepted, false);
  assert.equal(probe.issues.length >= 5, true, JSON.stringify(probe.issues));
  // resolution: exact key; missing fails closed; regime must match the selection row
  const registry = { bindings: [binding], handlers };
  const hit = resolveHandlerForSelection(registry, {
    programRef: "gtl://t205/custom", stageRole: "consequence", armId: "arm://x/c", regime: "F_D"
  });
  assert.equal(hit.binding.handlerClass, "pipeline");
  assert.throws(() => resolveHandlerForSelection(registry, {
    programRef: "gtl://t205/custom", stageRole: "transform", armId: "arm://x/t", regime: "F_P"
  }), /handler_binding_missing/);
  assert.throws(() => resolveHandlerForSelection(registry, {
    programRef: "gtl://t205/custom", stageRole: "consequence", armId: "arm://x/c", regime: "F_P"
  }), /handler_regime_mismatch/);
  // executor: a throw becomes a typed blocked interior (-006), never a host escape
  const blocked = executeHandler(throwingHandler, {
    stage: { stageRole: "consequence", defaultRegime: "F_D", armId: "arm://x/c", resultBearing: false },
    binding: { ...binding, handlerRef: "handler://t205/throwing" },
    declaredConfig: null, workProjection: null
  });
  assert.equal(blocked.outcomeStatus, "blocked");
  assert.match(blocked.failureReason, /spawn ENOENT.*\(contract_failure\)/);
  assert.equal(blocked.evidenceRefs[0], "handler-error:handler://t205/throwing");
});

// ─── T-205 B3 (2/3): the standard F_D handlers — declared config, injected effects ───

import { readFileSync } from "node:fs";
import {
  standardProcessExecutionHandler,
  standardMaterializationHandler,
  STANDARD_HANDLER_REFS
} from "../../build/semantic/code/src/abg/m03/index.js";

test("T-205 B3: standard F_D handlers — tool emergence, evidence honesty, write-root confinement, typed failure", () => {
  const stageFd = { stageRole: "consequence", defaultRegime: "F_D", armId: "arm://x/c", resultBearing: false };
  const bindingFor = (ref) => ({
    programRef: "gtl://t205/custom", stageRole: "consequence", armId: "arm://x/c",
    regime: "F_D", handlerRef: ref, handlerClass: "pipeline", handlerConfigRef: "config://declared"
  });
  // -004 TOOL EMERGENCE: the handler module names no tools (source witness)
  const source = readFileSync(
    new URL("../../code/src/abg/m03/runner/standard_handlers.ts", import.meta.url), "utf8");
  for (const tool of ["sbt", "npm", "codex", "claude", "spawnSync", "child_process", "node:fs"]) {
    assert.equal(source.includes(tool), false, `tool name leaked: ${tool}`);
  }
  // process execution: success / nonzero / spawn-error — all typed (-003, bug #11/#12 class)
  const calls = [];
  const execHandler = standardProcessExecutionHandler({
    runProcess(input) {
      calls.push(input);
      if (input.command === "cmd://ok") return { status: 0, stdout: "ok", stderr: "", error: null };
      if (input.command === "cmd://fails") return { status: 7, stdout: "", stderr: "boom", error: null };
      return { status: null, stdout: "", stderr: "", error: "ENOENT cmd://missing" };
    }
  });
  const runWith = (command) => execHandler({
    stage: stageFd, binding: bindingFor(STANDARD_HANDLER_REFS.processExecution),
    declaredConfig: { command, args: ["a"], env: { PATH: "declared://path" }, cwd: "cwd://declared", timeoutMs: 1000 },
    workProjection: null
  });
  // STRICT F_D (HANDLERS-009 rider): mechanical outcomes ONLY — the
  // handler never pronounces on the work; exit codes are F_P evidence.
  assert.equal(runWith("cmd://ok").outcomeStatus, "executed");
  const nonzero = runWith("cmd://fails");
  assert.equal(nonzero.outcomeStatus, "executed", "nonzero exit is still EXECUTED mechanics");
  assert.equal(nonzero.failureReason, null, "no semantic pronouncement in F_D");
  assert.equal(nonzero.evidenceRefs.includes("exec-status:7"), true, "exit code is EVIDENCE for F_P");
  const enoent = runWith("cmd://missing");
  assert.equal(enoent.outcomeStatus, "blocked");
  assert.match(enoent.failureReason, /ENOENT.*contract_failure/);
  assert.equal(enoent.evidenceRefs.includes("exec-status:null"), true, "status null is EVIDENCE, not silence");
  assert.equal(calls.every((c) => c.env.PATH === "declared://path"), true, "-005: env comes from declared config only");
  // materialization: confined writes + escape blocked
  const written = [];
  const matHandler = standardMaterializationHandler({ writeFile: (p, _c) => written.push(p) });
  const matRun = (files) => matHandler({
    stage: stageFd, binding: bindingFor(STANDARD_HANDLER_REFS.materialization),
    declaredConfig: { writeRoot: "root://out", files }, workProjection: null
  });
  const okMat = matRun([{ path: "src/a.txt", content: "x" }]);
  assert.equal(okMat.outcomeStatus, "executed", "mechanical vocabulary for F_D success too");
  assert.deepEqual(written, ["root://out/src/a.txt"]);
  const escape = matRun([{ path: "../escape.txt", content: "x" }]);
  assert.equal(escape.outcomeStatus, "blocked");
  assert.match(escape.failureReason, /write_root_escape/);
  assert.equal(written.length, 1, "escape wrote NOTHING");
});

// ─── T-205 B3: the F_H gate handler — humans are never impersonated ───

import { standardFhGateHandler } from "../../build/semantic/code/src/abg/m03/index.js";

test("T-205 B3: F_H gate handler always escalates — a handler cannot approve on a human's behalf", () => {
  const gate = standardFhGateHandler();
  const out = gate({
    stage: { stageRole: "approve", defaultRegime: "F_H", armId: "arm://x/h", resultBearing: false },
    binding: { programRef: "gtl://p", stageRole: "approve", armId: "arm://x/h",
      regime: "F_H", handlerRef: "handler://abg/fh/gate", handlerClass: "pipeline", handlerConfigRef: null },
    declaredConfig: { approvalSubjectRef: "subject://release/4.5" },
    workProjection: null
  });
  assert.equal(out.outcomeStatus, "escalated");
  assert.equal(out.evidenceRefs[0], "approval-subject:subject://release/4.5");
  assert.equal(out.failureReason, null);
  // undeclared subject still escalates, evidence says so
  const bare = gate({ stage: { stageRole: "approve", defaultRegime: "F_H", armId: "a", resultBearing: false },
    binding: { programRef: "p", stageRole: "approve", armId: "a", regime: "F_H",
      handlerRef: "h", handlerClass: "pipeline", handlerConfigRef: null },
    declaredConfig: null, workProjection: null });
  assert.equal(bare.outcomeStatus, "escalated");
  assert.equal(bare.evidenceRefs[0], "approval-subject:undeclared");
});

// ─── T-205 B3: the F_P agent-transport handler — worker judges, handler maps ───

import { standardFpTransportHandler } from "../../build/semantic/code/src/abg/m03/index.js";

test("T-205 B3: F_P transport handler — declared prompt/contract, trio-classed transport failure, worker disposition mapped not invented", () => {
  const stageFp = { stageRole: "critique", defaultRegime: "F_P", armId: "arm://x/k", resultBearing: false };
  const binding = { programRef: "gtl://p", stageRole: "critique", armId: "arm://x/k",
    regime: "F_P", handlerRef: "handler://abg/fp/agent-transport", handlerClass: "pipeline", handlerConfigRef: "config://critique" };
  const prompts = [];
  const mkHandler = (reply) => standardFpTransportHandler({
    invokeAgent(input) { prompts.push(input.prompt); return reply; }
  });
  const run = (reply, config, workProjection = null) =>
    mkHandler(reply)({ stage: stageFp, binding, declaredConfig: config, workProjection });
  const dispositionConfig = {
    prompt: "critique the artifact", timeoutMs: 60000,
    responseContract: { kind: "disposition_json" }, includeWorkProjection: true
  };
  // transport failure -> blocked with the trio class; session evidenced when present
  const dead = run({ output: null, sessionRef: "session://1", error: "spawn timeout" }, dispositionConfig);
  assert.equal(dead.outcomeStatus, "blocked");
  assert.match(dead.failureReason, /transport_failure/);
  assert.equal(dead.evidenceRefs.includes("agent-session:session://1"), true);
  // worker PASS -> executed (the worker judged, the handler mapped)
  const pass = run({ output: JSON.stringify({ disposition: "pass" }), sessionRef: "session://2", error: null }, dispositionConfig);
  assert.equal(pass.outcomeStatus, "executed");
  assert.equal(pass.evidenceRefs.includes("worker-disposition:pass"), true);
  // worker BLOCK -> blocked carrying the WORKER's reasons
  const block = run({ output: JSON.stringify({ disposition: "block", reasons: ["missing tests"] }), sessionRef: null, error: null }, dispositionConfig);
  assert.equal(block.outcomeStatus, "blocked");
  assert.match(block.failureReason, /worker_blocked: missing tests/);
  // unparseable / unlawful disposition -> contract_failure, never a throw
  assert.match(run({ output: "not json", sessionRef: null, error: null }, dispositionConfig).failureReason, /contract_failure/);
  assert.match(run({ output: JSON.stringify({ disposition: "maybe" }), sessionRef: null, error: null }, dispositionConfig).failureReason, /unlawful_disposition: maybe/);
  // advisory_text: output is evidence, executed without judgment
  const advisory = run({ output: "plan: do x then y", sessionRef: "session://3", error: null },
    { prompt: "make a plan", timeoutMs: 60000, responseContract: { kind: "advisory_text" }, includeWorkProjection: false });
  assert.equal(advisory.outcomeStatus, "executed");
  assert.equal(advisory.evidenceRefs.includes("agent-output-chars:17"), true);
  // declared work projection splices into the prompt only when declared
  run({ output: "{}", sessionRef: null, error: null }, dispositionConfig, "result://prior");
  assert.equal(prompts.some((p) => p.includes("WORK PROJECTION:\nresult://prior")), true);
  assert.equal(prompts[prompts.length - 2].includes("WORK PROJECTION"), false, "advisory config declared includeWorkProjection:false");
});

// ─── User ruling: the default is a typed catalog citizen; config = system/env bindings only ───

import {
  effectiveHogProgramCatalog,
  HOG_BOOTSTRAP_PROGRAM_REF,
  compileHogProgramCatalog as compileCatalogForCitizenship
} from "../../build/semantic/code/src/abg/m03/index.js";

test("T-205: the bootstrap triple is a LABELLED catalog entry (default), visible to higher-order choosers; reserved ref unshadowable", () => {
  // bare: the effective catalog still carries the typed default entry
  const bare = effectiveHogProgramCatalog(null);
  assert.equal(bare.defaultProgramRef, HOG_BOOTSTRAP_PROGRAM_REF);
  const entry = bare.programs.get(HOG_BOOTSTRAP_PROGRAM_REF);
  assert.equal(entry.kind, "hog_program_declaration");
  assert.equal(entry.stages.length, 3);
  // declared catalog: entries COEXIST with the default in one choice set
  const declared = compileCatalogForCitizenship([{
    syntaxVersion: "hog-syntax/1",
    programRef: "gtl://p/lean",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://l/t", resultBearing: true },
      { stageRole: "evaluate", defaultRegime: "F_P", armId: "arm://l/e", resultBearing: false }
    ],
    proportionalityClass: "P1"
  }]);
  const merged = effectiveHogProgramCatalog(declared.catalog);
  assert.equal(merged.programs.size, 2, "default + declared in ONE choice set");
  assert.equal(merged.programs.has(HOG_BOOTSTRAP_PROGRAM_REF), true);
  assert.equal(merged.programs.has("gtl://p/lean"), true);
  // reserved ref: fail-closed
  const shadow = compileCatalogForCitizenship([{
    syntaxVersion: "hog-syntax/1",
    programRef: HOG_BOOTSTRAP_PROGRAM_REF,
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://x/t", resultBearing: true }
    ],
    proportionalityClass: null
  }]);
  assert.throws(() => effectiveHogProgramCatalog(shadow.catalog), /hog_program_catalog_reserved_ref/);
});

// ─── T-205 COVERAGE g1/g4: ladder admission negatives + runtime standard impls ───

import { compileHogProgramLadder, ladderRungForAttempt } from "../../build/semantic/code/src/abg/m03/index.js";
import { buildStandardHandlerImplementations } from "../../build/semantic/code/src/abg/m03/index.js";
import { mkdtempSync, readFileSync as readBack } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("T-205 COVERAGE g1: ladder admission — first rung at 1, strictly increasing, typed rows; rung selection law", () => {
  const ok = compileHogProgramLadder([
    { programRef: "gtl://a", fromAttempt: 1 },
    { programRef: "gtl://b", fromAttempt: 3 }
  ]);
  assert.equal(ok.accepted, true, JSON.stringify(ok.issues));
  assert.equal(ladderRungForAttempt(ok.rungs, 1).programRef, "gtl://a");
  assert.equal(ladderRungForAttempt(ok.rungs, 2).programRef, "gtl://a");
  assert.equal(ladderRungForAttempt(ok.rungs, 3).programRef, "gtl://b");
  assert.equal(ladderRungForAttempt(ok.rungs, 99).programRef, "gtl://b");
  // NEGATIVES
  assert.equal(compileHogProgramLadder([]).accepted, false);
  assert.match(compileHogProgramLadder([{ programRef: "gtl://a", fromAttempt: 2 }]).issues[0], /first rung must start at attempt 1/);
  assert.match(compileHogProgramLadder([
    { programRef: "gtl://a", fromAttempt: 1 },
    { programRef: "gtl://b", fromAttempt: 1 }
  ]).issues.join(";"), /strictly increase/);
  assert.match(compileHogProgramLadder([{ programRef: "", fromAttempt: 1 }]).issues[0], /rung must carry/);
  assert.match(compileHogProgramLadder([{ programRef: "gtl://a", fromAttempt: 0 }]).issues[0], /rung must carry/);
});

test("T-205 COVERAGE g4: runtime standard implementations — real materialization io; fh gate; process config fail-closed", async () => {
  const impls = buildStandardHandlerImplementations();
  assert.equal(impls.size, 3);
  const stage = (role, regime, arm) => ({ stageRole: role, defaultRegime: regime, armId: arm, resultBearing: false });
  const binding = (ref) => ({ programRef: "gtl://rt", stageRole: "admit", armId: "arm://rt/a",
    regime: "F_D", handlerRef: ref, handlerClass: "pipeline", handlerConfigRef: "config://rt" });
  // materialization writes REAL files under the declared root
  const root = mkdtempSync(join(tmpdir(), "t205-rt-"));
  const mat = impls.get("handler://abg/fd/materialization");
  const matOut = await mat({
    stage: stage("admit", "F_D", "arm://rt/a"),
    binding: binding("handler://abg/fd/materialization"),
    declaredConfig: { writeRoot: root, files: [{ path: "out/hello.txt", content: "materialized" }] },
    workProjection: null
  });
  assert.equal(matOut.outcomeStatus, "executed");
  assert.equal(readBack(join(root, "out/hello.txt"), "utf8"), "materialized");
  // fh gate escalates with the declared subject
  const fh = impls.get("handler://abg/fh/gate");
  const fhOut = await fh({
    stage: stage("approve", "F_H", "arm://rt/h"),
    binding: binding("handler://abg/fh/gate"),
    declaredConfig: { approvalSubjectRef: "subject://rt" },
    workProjection: null
  });
  assert.equal(fhOut.outcomeStatus, "escalated");
  // traced process impl: invalid declared config is a TYPED throw at the
  // config gate (the executor wrapper converts it) — no spawn attempted
  const exec = impls.get("handler://abg/fd/process-execution");
  await assert.rejects(
    () => Promise.resolve(exec({
      stage: stage("admit", "F_D", "arm://rt/a"),
      binding: binding("handler://abg/fd/process-execution"),
      declaredConfig: { command: "" },
      workProjection: null
    })),
    /process_execution_config_invalid|timeoutMs must be a positive safe integer/
  );
});

// ─── codex rc.1 round: admission is fail-closed on RAW fields and CLOSED keys ───

import { assembleHandlerRegistry as assembleForProbe } from "../../build/semantic/code/src/abg/m03/index.js";
import { admitHogProgram as admitProgramForProbe } from "../../build/semantic/code/src/abg/m03/index.js";
import { admitHogHandlerBindings as admitBindingsForProbe } from "../../build/semantic/code/src/abg/m03/contracts/hog_handler_bindings.js";

test("T-205 codex P1-a: handler binding assembly rejects coerced-shape fields AS AUTHORED — numeric programRef, boolean stageRole, numeric configRef, unknown siblings", () => {
  const impls = new Map([["handler://x", syncCCallHandler(() => ({ outcomeStatus: "executed", evidenceRefs: [], payloadRef: null, responseContractRef: null, failureReason: null }))]]);
  const base = {
    programRef: "gtl://p", stageRole: "admit", armId: "arm://a",
    regime: "F_D", handlerRef: "handler://x", handlerClass: "pipeline", handlerConfigRef: null
  };
  // lawful row assembles
  const admitted = admitBindingsForProbe([base], "t205-probe");
  const ok = assembleForProbe({ declaredBindings: admitted, handlers: impls });
  assert.equal(ok.bindings[0].programRef, "gtl://p");
  // the exact codex probes: NO stringified admission
  assert.throws(() => admitBindingsForProbe([{ ...base, programRef: 123 }], "t205-probe"),
    /programRef must be a non-empty string as authored/i);
  assert.throws(() => admitBindingsForProbe([{ ...base, stageRole: false }], "t205-probe"),
    /stageRole must be a non-empty string as authored/i);
  assert.throws(() => admitBindingsForProbe([{ ...base, handlerConfigRef: 7 }], "t205-probe"),
    /handlerConfigRef must be a non-empty string as authored/i);
  assert.throws(() => admitBindingsForProbe([{ ...base, shadow: "field" }], "t205-probe"),
    /unknown field "shadow"/);
});

test("T-205 codex P1-b: program admission is CLOSED-KEY on program and stage rows; admitted stages carry ONLY known keys", () => {
  const lawful = {
    kind: "hog_program_declaration",
    programRef: "gtl://p",
    stages: [
      { stageRole: "transform", defaultRegime: "F_P", armId: "arm://t", resultBearing: true }
    ],
    proportionalityClass: null
  };
  assert.equal(admitProgramForProbe(lawful).accepted, true);
  // unknown PROGRAM sibling rejected
  const programShadow = admitProgramForProbe({ ...lawful, shadowField: "x" });
  assert.equal(programShadow.accepted, false);
  assert.match(programShadow.issues.join(";"), /unknown program field "shadowField"/);
  // unknown STAGE sibling rejected (the exact codex probe)
  const stageShadow = admitProgramForProbe({
    ...lawful,
    stages: [{ ...lawful.stages[0], extraStage: "shadow" }]
  });
  assert.equal(stageShadow.accepted, false);
  assert.match(stageShadow.issues.join(";"), /unknown stage field "extraStage"/);
  // admitted stages carry ONLY known keys (no metadata bag survives)
  const admitted = admitProgramForProbe(lawful);
  assert.deepEqual(Object.keys(admitted.program.stages[0]).sort(),
    ["armId", "defaultRegime", "resultBearing", "stageRole"]);
});
