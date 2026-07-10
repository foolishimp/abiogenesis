# T-217 Dual Review Round 2 — Consolidated Findings, Fixes, Residuals

**Type:** REVIEW (commentary; fixes landed as code+pins, residuals need F_H routing)
**Author:** claude · 2026-07-10
**Span:** the T-217 wave at 4.6.0-rc.2 (through `9ec4ffc`) + odd_glc campaign closure (`efc2428`)
**Method:** gates first (build + lint zero-warnings + full suite ran GREEN before review claims), then three adversarial lanes from my side (lint-repayment behavioral audit; D-ordinal + fail-closed laws; emitter contexts + RC gate) run in parallel with codex's independent review. Every finding verified against code before fixing. All fixes re-proven: **1296/1296 (13 new pins), lint 0, build green.**

## Headline

My rc.2 claim "lint repayment = zero behavioral change" is **REFUTED**. The behavioral audit live-executed five drifts, one a **shipped P0 in rc.2**. The gates were green the whole time — the suite gap is what shipped the bug, and each fix below lands with the missing pin.

## P0 — shipped in rc.2

**R1. GTL node-type composition no longer detected digest-policy conflicts** (`gtl/m01/algebra/core.ts`). The lint fix introduced the `MERGE_CONFLICT` unique symbol but left `mergeNullableRef` returning the STRING `"conflict"` — legal under the union (`string` absorbs it), so tsc was silent and the caller's `=== MERGE_CONFLICT` was always false. Two constituent types with disagreeing non-null `renderedViewDigestPolicyRef` composed **successfully**, minting the literal string `"conflict"` as the ref (consumed downstream by payload_ledger authority derivation and the conformance prompt-asset gate, which passes on non-null). **Fixed** (`return MERGE_CONFLICT`) **+ pinned** (t180: disagreeing refs ⇒ `asset_surface_conflict`). rc.2 ships this defect; it rides the next cut — no live campaign path exercises node-type digest-policy merge, which is why the campaign stayed clean.

## P1s found and fixed (with pins)

**R2. Replay ingest never enforced the D-ordinal law — systemically** (my agent's deepest finding). Neither `readReplayEvents` (CLI) nor `canonicalReplayEvents` (engine) sorted by admission ordinal or rejected collisions; the master projection fold, the runner (zero canonical-helper imports), payload_ledger's closure gates (`.at(-1)` family), the registry (last-write-wins), the reentry frontier, and temporal fluents all read **file order as truth** — while the codebase's own constitutional comments (run_segments, depth_proof_map) declare disordered replay lawful input. One systemic fix: `sortReplayByAdmissionOrdinalFailClosed` at both ingest chokepoints — array order now IS ordinal order for every downstream fold; colliding ordinals (two events claiming one ordinal) fail closed as unorderable truth. **The law immediately caught a real defect**: the m04 gaps fixture's appender script emitted without seeding, minting duplicate ordinal-0 rows the old folds silently mis-read. Pins: sort/collision/missing-ordinal unit trio + the repaired fixture.

**R3. The primary start path's plugin sink bypassed the C-4 forgery defense** (`cli/command.ts`). `witness`/`tune` adopt seeded live contexts, but the start command's plugin event sink forwarded plugin-supplied envelopes through the replay-tolerant default — a pre-stamped canonical envelope from a plugin was absorbed into the live log with its forged ordinal. **Fixed at the foreign-input boundary**: the sink rejects pre-stamped envelopes outright (a second context would have collided with the engine's shared counter — rejection is the correct minimal shape).

**R4. Unknown regime/handlerClass in declared handler bindings escaped as a host exception** — `assembleHandlerRegistry` runs at the engine entries OUTSIDE the machine's fail-closed try; a GTL-authored binding with `regime: "F_X"` threw straight out of the engine API (no terminal, no replay truth). **Fixed**: entry-level conversion to the same typed fail-closed startup result (`hog_program_unresolvable` + `runtime_failure_observed` + gap_stop terminal). *Residual pin:* an engine-level differential driving a real basis with an unknown-regime declaration (unit throw is pinned in t200; the conversion is code-reviewed but not yet engine-differentially pinned).

**R5. `payload_rejected` could mint with zero structured issue rows** (EVENTS-026 bypass): the factory's `issues ?? []` default let the live F_P-evaluation rejection path spoof the absence law by emptiness. **Fixed**: `issues` is required and non-empty at the factory (throw); the engine site now emits per-finding typed rows; three test fixtures updated to model lawful events. Pinned.

**R6. Installer rejected lawful null state-root rows** — my lint collapse broke the declared contract (`?: string | null`, null = "use default"). **Fixed** (null/undefined rows skip to defaults) **+ pinned** in the R-bootstrap block.

**R7. `admitHogProgram` silently widened**: an absent `proportionalityClass` key became admissible (pre: typed rejection). **Restored** fail-closed (key must be present — explicit null or non-empty string) **+ pinned**.

**R8. The live-install conformance pin had two bypasses** (my agent): (a) discovery was a filename glob over two lanes — a non-conformant live test in `tests/` or named without "live" evaded it entirely; (b) conformance was substring presence — a comment mentioning `provisionInstalledRoot` classified as conformant. **Fixed**: discovery is content-based over every lane (live gates pattern ∪ live/ lane ∪ legacy list; new lanes auto-scanned); conformance requires call-shaped markers. The strengthened gate passes with the unchanged 26-entry legacy list.

**R9. EVENTS-025 membership walked the prototype chain** — `kind in RUN_INDEPENDENT_EVENT_SCOPE_CLASSES` admitted an undeclared kind named `"toString"` past the fail-closed throw. **Fixed** (`Object.hasOwn`) **+ pinned**.

## codex findings — dispositions

| # | Finding | Disposition |
|---|---------|-------------|
| C1 | rc.2 committed proof carried the degenerate resume's 1885ms as campaign duration | **Fixed** in odd_glc: split `startInvocationDurationMs` / replay-derived `campaignDurationMs` (first event → first converged terminal by ordinal = 4,869,063ms); pinned exact in the new evidence test |
| C2 | Committed proof not independently verifiable (127MB log local-only; eventSequence reduced) | **Fixed**: committed `evidence-ledger.jsonl` (129 verbatim truth rows: 240 depth rows, 64/64 digest-verified kills, 28 vectors, retries, judgments) + byte-reproducible extraction rule + a default-suite test that re-derives every claim from the committed artifacts |
| C3 | Release snapshot manifest not self-certifying (build+pack only) | **Fixed**: the snapshot tool now runs lint + full suite itself, parses the node:test summary, embeds `lint`/`tests`/`testSummary` in the manifest, and REFUSES the snapshot on red or unparsable output (3 new t142 gates); `snapshot:release` simplified accordingly. rc.2's own manifest predates this (immutable; its evidence is the ticket ledger + both reviewers' independent gate runs) |
| C4 | `timeoutMs` accepted as any number into `setTimeout` (HANDLERS-008) | **Fixed**: `admitTimeoutBudgetMs` (positive safe integer) at all three config parsers, one home; pinned (0 / 1.5 / NaN / −100 ⇒ typed blocked) |
| C5 | Standard handler set split: constants declare 4, builder installs 3 | **Fixed**: `buildStandardHandlerImplementations({fpTransport?})` — the F_P transport injection seam is explicit in the API with the reason documented (operator-supplied capability); omitting it leaves the ref unbound and registry admission fails closed on any binding naming it |
| C6 | `isPlainRecord` re-declared ×9 | **Fixed**: one home in `admission_hygiene`, all nine sites import it |
| C7 | **Handler authority not fully Prime**: `CCallHandlerBinding` carries no authority class / equivalence-contract identity; executability checks only program/stage/arm/regime/registered — weaker than the PRODUCT.md:420 / TUNER-law requirement that F_D execution interiors enter through ratified annealing/equivalence | **RECORDED — needs F_H routing.** This is a `requirement_reprice`-class change (binding schema + resolution law), not a hot patch: the binding should carry or derive the authority proof. Proposed as a named 4.6/5.0 work item; pairs with the tuner auto-ratify policy-surface rider already in the release note |

## Acknowledged behavioral tightenings (kept, disclosed)

The behavioral audit also surfaced three drifts whose POST behavior is the lawful direction — kept deliberately, not silently: numeric env values in process configs now block instead of riding Node's implicit coercion (pinned); malformed `disposition_json.reasons` now yields the typed `worker_blocked` advisory instead of a handler-error host message (evidence-string drift only); empty-string `equivalenceContractRef` now rejects at carry-through startup (consistent with the annealed arm). Any of these is Jim's to overrule.

## Residuals (named, not silent)

1. **Engine-level pin for R4** (typed conversion differential over a real basis).
2. **Installed RC gate asserts ordinal monotonicity only** — it never drives a pre-stamped envelope at a live command cross-process; the C-4 rejection is unit-pinned only. Wants a witness-gate extension.
3. **EVENTS-025 scope classes are membership-only** — the workspace/run/perimeter class VALUES are never consumed; run-class F_H acts cross runs at the filter (null-runId `assessed` blends universally). Class semantics need a design ruling before implementing.
4. **D-ordinal library-caller exposure**: folds called directly with un-ingested arrays (tests, external consumers) bypass the chokepoints; `decisiveByAdmissionOrdinal` resolves equal-ordinal disagreement to first-in-array. Chokepoint enforcement covers all engine/CLI paths; the helper-level tie fail-closed is a candidate hardening.
5. **C-4 full adoption**: the engine's own emissions still ride the module default context (behaviorally identical for fresh events); store-scoped contexts everywhere is the named tail.
6. **codex C7** (handler authority Prime) — the one finding requiring constitutional change; see table.

## Gate record (gates-run-every-review law)

- build:semantic — green; lint:semantic `--max-warnings=0` — **0**; test:semantic — **1296/1296** (was 1283; +13 pins from this round)
- odd_glc: 82 pass / 8 skipped (live) / 0 fail, including the 3 new committed-evidence pins
- No suppressions introduced; `code/src` remains `eslint-disable`-free and `any`-free (verified by grep)
