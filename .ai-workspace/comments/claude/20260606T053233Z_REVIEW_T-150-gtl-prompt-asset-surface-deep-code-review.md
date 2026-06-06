# T-150 GTL prompt-asset-surface — deep STDO code review (evidence log)

- author: claude
- date: 2026-06-06
- scope: the GTL-side T-150 implementation — `AssetSurface` extension + `AssetSurfaceAuthoritySlot`, m01 constructors/admission/serialization, `REQ-L-GTL3-ASSET-SURFACE`, the two t150 test files, and the active T-150 ticket. Working tree vs `HEAD`, branch `main`.
- method: STDO. Adversarial multi-agent review — 19 subagents across 9 dimensions (find → adversarially refute → synthesize), ~1.37M subagent tokens, 335 tool calls, ~13.5 min. Claims were checked against the **actual artifact** (grep/read/build/test reproduction + mutation tests), not the implementer summary.
- governance: STDO. Findings anchor to the T-150 ticket `non_closure_conditions`, the GTL Bootloader (§2 topology primes, §4 GTL/ABG boundary + no-app-vocabulary, §7 fail-closed), `REQ-L-GTL3-ASSET-SURFACE`, and the cut-line set in the T-150 ticket review (GTL carries the SHAPE; odd_sdlc keeps the POLICY VALUES).
- status: **commentary / review evidence surface.** Verdict: **closure-ready for declared scope, yes-with-mechanical-fixes.** No blocking defect; two non-blocking concerns. The substrate is correct and the cut-line holds in code, spec, and tests.

---

## Verdict: YES-WITH-FIXES — the descent is clean; the guards and the frontmatter are not

The hard part went right. The GTL artifact has **no blocking substantive defect**: no SDLC value leak, no new topology object, no F_D/Markdown drift, admission is declaration-shape only, round-trip + legacy-compat intact, requirement-law well-formed, modulation correctly deferred, downstream P-050 honestly open. **7 of 9 dimensions came back clean at high confidence; the adversarial pass refuted none of the eight finder dispositions** (the six clean dimensions were each re-prosecuted against the design docs + the M02 Module struct and survived). Two concerns remain — both mechanical, neither gates the substrate.

Verified empirically: `test:semantic` 681/681, `test:t150` 6/6, `build:semantic` clean (reproduced independently).

## Clean (the load-bearing invariants)

- **SHAPE-not-VALUES cut held (the #1 risk).** `authorityKindRef` is a bare opaque `string` admitted via `parseNonEmptyString` with no allowlist (`m01/admission/carriers.ts:305-308`); dispositions `normal|bounded_fallback|forbidden_routine` are generic labels (`m01/contracts/carriers.ts:92-96`); grep for SDLC values (`bootstrap_provenance`/`intent_fallback`/`product_definition`/`sibling_workspace_history`/`runtime_forensics`/`odd_sdlc`/`data_mapper`) over all of `code/src/gtl` returned **none**. The cut is codified — `REQ-L-GTL3-ASSET-SURFACE-005` ("GTL owns the slot shape and disposition labels; downstream products own the specific authority-kind vocabulary and assignment policy") — and the derivation doc defends it as an explicit Non-Goal (`GTL_ASSET_SURFACE_PROMPT_INTERFACE_DERIVATION.md:65-70`).
- **No new topology object.** `AssetSurface` is a `readonly` field on `Node` (`carriers.ts:111`); `AssetSurfaceAuthoritySlot` is a nested record under it. Dispositive: the M02 `Module` interface (`m02/contracts/carriers.ts:64-78`) has no AssetSurface member and grep of all `gtl/m02` is zero refs.
- **No F_D semantic drift.** Zero `indexOf`/`split`/`match`/`slice`/`RegExp`/`parseMarkdown` over the five changed production files; the only value-conditional logic is the generic disposition↔precondition shape coupling (`constructors.ts:162-177`), which branches on the enum + field presence/count, never on rendered-text content. **The odd_sdlc `indexOf`-slice defect was not inherited.**
- **Admission is declaration-shape, not runtime enforcement.** `admitAssetSurface` validates disposition membership + `bounded_fallback` precondition presence + ref shape, keeps `authorityKindRef` opaque, preserves `forbidden_routine` without acting on it; no packet/permit/deny vocabulary; fail-closed. Runtime authority deferred to ABG per Boundary Rules + REQ-006/007/008.
- **Round-trip + legacy compat — strong, not vacuous.** `construct→serialize→JSON→admit` deepEquals field-by-field including all three slot dispositions; all new fields optional/defaulted, so minimal 4-field and bare `{kind}` callers still construct. Proven non-vacuous by mutation: **dropping `rendererRefs` from the serializer fails the strict build** (`TS2741`), so a serializer that silently drops a field cannot compile — materially better than the T-149 presence-only guard.
- **Requirement-law GOOD.** `REQ-L-GTL3-ASSET-SURFACE-001..-011`, present-tense "shall", load-bearing id, linked from README + `REQ-L-GTL3-NODE-012`; AC-005 cedes vocabulary downstream, AC-008 shape-only, AC-009/010 forbid F_D inference and demote rendered Markdown to a view.
- **Modulation correctly deferred.** Closed 12-field `AssetSurface` set — zero tone/verbosity/precision/presentation/interaction channel under any spelling — and the deferral is recorded as a Non-Goal (`derivation:69`). (This was a ticket-review concern; the implementer deferred it correctly.)

## 🟡 CONCERN / medium — test guards under-cover two named ticket proofs (T-149 failure-mode recurrence)

The shipped code honors the cut-line; the **guards that claim to protect it do not fully cover it**.

- **Anti-leak source-scan gives false assurance.** `test_t150_gtl_prompt_asset_surface.test.mjs:30,36` `readFileSync`s only `m01/contracts/carriers.ts` + `m01/admission/carriers.ts` — 2 of the 4 changed source files. It does **not** scan `constructors.ts` (the +145 file where all disposition/precondition enforcement lives) nor `serialization/carriers.ts`. The denylist (`test:312`) is 4 tokens, omitting `product_definition`/`odd_sdlc`/`data_mapper`. **Proven by mutation: injecting all five forbidden tokens into `constructors.ts` left the guard green.** The test name ("GTL source carries shape only") implies whole-GTL coverage it does not deliver.
- **No anti-topology guard exists at all.** The ticket's #1 declared risk (`:69`) and static proofs (`:149-150`) are unasserted. The module-publication test (`test:339-358`) reaches `assetSurface` via `graphFunctions[0].outputs[0].assetSurface` (a Node field) and would still pass green if a regression promoted `AssetSurface` to a direct `Module` member. Code is clean today; the invariant is unguarded against future regression — exactly the T-149 failure mode (a presence guard that wouldn't catch the regression it names).
- **`forbidden_routine` negative proof not pinned (weakest leg — do not inflate).** `disposition:"forbidden_routine"` appears only in the happy path (`test:88`), in none of the three `assert.throws`. But `forbidden_routine` is a *valid admitted* disposition by design, so a "fails admission" test for it would test the wrong thing — this is **ticket-wording drift, not a code gap**; the shared reject branch (`constructors.ts:170-177`) is already exercised via `disposition:"normal"` (`test:278`).

Calibration: **concern, not violation** — the artifact is correct today. But it correctly blocks crediting the ticket's static-proof (`:149-150`) and forbidden_routine-negative-proof as *met*. The verifier confirmed the hole is not mitigated elsewhere (no eslint `no-restricted-syntax` token ban; no other source-purity or non-membership test in the repo).

## 🟡 CONCERN / low — closure honest; two frontmatter enums invalid (paperwork only)

Closure **honesty is clean** (independently verified): `proof_status=focused_gtl_proof_passed_downstream_steel_thread_pending` (`:7`) encodes partial; `status: active`; `closure_law` keeps the downstream-consumer clause required-and-unmet; P-050 `pending` (`:144`) + "Remaining before closure: P-050" (`:179`). A recursive grep confirms **no typed downstream consumption exists** in odd_sdlc (`import.*AssetSurface` / `: AssetSurface` / `from gtl` → zero; only string conventions `gtlAssetSurfaceKind:string` at `prompt_assets.ts:123,273`) — so closure correctly stays open, not falsely satisfied.

Defect (validity): `type: requirement_reprice` (`:4`) and `ticket_category: requirement_reprice` (`:5`) are **invalid enum values** — TICKET_METHOD allows `type ∈ feature|bug|spike|chore` and `ticket_category ∈ ordinary|implementation_migration`; `requirement_reprice` is a `change_class` value. Required triage fields `change_intent` and `triaged_at` are absent (pre-existing project-wide drift — sibling T-149 is identically missing them — tolerated, not a T-150 regression). Severity low; must not gate the substrate.

## Self-correction (the adversarial pass corrected the reviewer)

My T-150 *ticket* review flagged `type: feature` vs `change_class: requirement_reprice` as a mismatch to "reconcile." That was wrong, and it produced the defect above: TICKET_METHOD §530 **sanctions** the orthogonal `type:feature` + `change_class:requirement_reprice` pairing — they are different axes. The implementer "reconciled" by collapsing three axes onto one value, yielding two invalid enums. The correct fix is the opposite of my original advice: **keep them orthogonal with valid values.**

## Fix set

- **GTL-correctness-now (substrate): NONE.** The artifact is correct and proven as-is; no code change is required for the GTL interface to be closure-ready for its declared scope.
- **Required-mechanical (do not gate the substrate; close before crediting the ticket's stated proofs / leaving active):**
  - **F1 — frontmatter (~3 one-line edits):** set `type: feature`; set `ticket_category: ordinary`; **keep** `change_class: requirement_reprice`; add `change_intent` and `triaged_at`.
  - **F2 — anti-topology guard:** assert `AssetSurface` is not a `Module`/`Graph` member and is reachable only as `Node.assetSurface`. Code already satisfies it; the assertion closes the unguarded invariant.
  - **F3 — widen the anti-leak source-scan:** also read `constructors.ts` and `serialization/carriers.ts`; extend the denylist to `product_definition`, `odd_sdlc`, `data_mapper`.
- **Optional-later / out of scope (correctly deferred):** `forbidden_routine` wording vs test; requirement precision nits (canonicalize Category to "Constraint / Guarantee"; add an AC for the converse fallback-precondition reject); **P-050 odd_sdlc downstream steel thread**; modulation/tone policy; ABG runtime authority enforcement against actual packets.

## Decision answers (one line each)

| Question | Answer |
| --- | --- |
| SHAPE-not-VALUES cut held? | **Yes** — opaque `authorityKindRef`, generic dispositions, zero SDLC vocab in `gtl/`, codified in REQ-005. |
| New topology object? | **No** — `AssetSurface` is a Node field; M02 Module has zero AssetSurface refs. |
| F_D semantic drift / Markdown parse? | **No** — no text parsing; only generic enum/presence shape logic. odd_sdlc defect not inherited. |
| Admission = declaration-shape (not runtime)? | **Yes** — shape + fail-closed; runtime authority deferred to ABG. |
| Round-trip + legacy compat intact? | **Yes** — deepEqual, mutation-proven non-vacuous, new fields optional. |
| Requirement-law quality? | **Good** — REQ-001..-011, present-tense, linked; two low precision nits. |
| Modulation deferred? | **Yes** — closed 12-field set, recorded Non-Goal. |
| Ticket-closure honest? | **Yes** on honesty; **no** on frontmatter enum validity. |

## Provenance

- Review workflow run: `wf_3805a67f-f33` (task `wl0vj0fcq`) — 19 agents, ~1.37M subagent tokens, 335 tool calls, ~13.5 min. All eight finder dispositions held on independent re-verification (refuted=false across the board).
- Raw per-agent forensics + full per-dimension evidence: `/private/tmp/claude-501/-Users-jim-src-apps/05048af6-bf92-4df7-9bc7-5915ef9f0f59/tasks/wl0vj0fcq.output` — transient; copy into the ticket proof if the seven-day window matters.
