# REVIEW: T-152 Runner Consumption of Consequence Traversal Bridge + Scope Update (STDO)

**Author**: grok
**Date**: 2026-06-12
**Addresses**:
  - abiogenesis/.ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md (updated checklist + design note)
  - odd_sdlc/.ai-workspace/tickets/active/T-165-define-optimising-overlay-for-landscape-conditioned-fd-specialization.md (scope record only)
  - abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts (consumeConsequenceTraversalAction + call sites)
  - abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consequence_traversal_action.ts (bridge, already reviewed)
  - abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts (traversalAction in outcome)
  - abiogenesis/build_tenants/abiogenesis/typescript/test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs (expanded with out-of-range proof)
  - abiogenesis/build_tenants/abiogenesis/typescript/design/M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md (updated separation of static vs runtime)
  - Commits described: c69806a (ABG runner), 7d8306d (SDLC ticket record)
**Status**: Commentary (follow-up review of runner consumption slice)
**Prior reviews**: T-197 (E6), T-152 bridge admission/projection (previous)

## STDO Context (re-confirmed)

**Entry surfaces** (re-read in order per rules for both repos):
- abiogenesis: README, AGENTS/CLAUDE, INTENT, PRODUCT, requirements (esp. REQ-R-ABG3-FP-CONSCIOUSNESS, INTERPRET, etc.), design (M03 IACS + reentry docs), build_tenants common design.
- odd_sdlc: README, AGENTS/CLAUDE, GOALS/INTENT/PRODUCT, requirements, design (staged-compute with T-197 partition).
- Shared STDO: SPEC_METHOD, TICKET_METHOD, DESIGN_MODULE_METHOD, ODD_METHOD (re-read key sections on ownership, carriers, re-entry, separation of static vs runtime authority).

**Governance for this slice**:
- T-152: requirement_reprice (gate + reentry inventory); this increment is realization (runner consumption) under the ticket.
- T-165: design_reframe (optimising overlay); this is pure status record ("ABG substrate done, SDLC consumption remains") — no code change in odd_sdlc, correct hygiene.
- Key principle (ODD + DESIGN): static conformance inventory/gate (T-152) is separate from runtime construction/continuation authority (ABG runner). ABG owns execution; downstream only selects via consequence.

## Ticket State (post-update)

**T-152 (abiogenesis)**:
- New checklist item [x]: "The engine runner consumes `ConsequenceProjectionOutcome.traversalAction` through the construction runner rather than requiring a caller or test harness to manually invoke the bridge."
- Other reentry items remain [x] from prior bridge work.
- Design surfaces updated to explicitly separate static conformance inventory (gate reports what is present) from runtime construction/continuation authority (runner applies re-entry via admitted intent, records replay-visible events like graph_reentry_planned/applied, construction_delta).
- Target truth alignment: "Consequence projection may carry an admitted traversal action selection, but ABG rejects authority-owning payloads and only executes the selection after it is projected into construction action/intent carriers."
- Still open: downstream consumer (e.g. odd_sdlc), clean live lane after gate, full T-153 feature coverage.

**T-165 (odd_sdlc)**:
- Updated note (2026-06-12): Records that ABG T-152 now has the substrate bridge + runner consumption (`engine_runner.ts` consumes, projects, invokes runConstructionIntentStep, produces replay-visible child provenance).
- Explicit scoping: "It does not by itself wire the SDLC optimizer/data-mapper lane to consume the bridge; that remains P2/P3 SDLC work below."
- No realization change in odd_sdlc here — correct (avoids drift).

## The Work (described commits + code inspection)

**ABG (c69806a - Implement consequence traversal runner consumption)**:
- Added import/use of bridge: `constructConstructionActionRowFromConsequenceTraversalAction`, `constructConstructionIntentCandidateFromConsequenceTraversalAction`, `ConsequenceTraversalAction`.
- New `consumeConsequenceTraversalAction(...)` in engine_runner.ts:
  - If `outcome.traversalAction` present, builds consequence traversal construction world (using prior bridge).
  - Handles blocked (returns terminal gap_stop with reason).
  - Projects to construction observation/action/binding/priority/admitted-intent.
  - Invokes `runConstructionIntentStep(...)` (the existing construction runner).
  - Returns the result (with updated events, projection, iteration count including child).
- Call sites in main iterate loops (after consequence projection if status projected and has traversalAction).
- Added replay-visible reentry proof paths: `graph_reentry_planned`, `graph_reentry_applied`, construction events, deltas.
- Fail-closed behaviors: out-of-range target (no throw, proper blocked reason), no admitted intent, no lawful binding, no priority row, rejection by intent admission, out-of-range reentry target in test.
- Test expanded (now 3 tests in the bridge file): admission rejection, main bridge, "T-152 engine blocks out-of-range consequence re-entry targets without throwing".

**Design update (M03 IACS)**:
- Documents the bridge: rejects engine-authority at consequence-action admission, requires absolute reentry targets for reenter_graph_span, preserves graphSpanRef as provenance, invokes through construction runner.
- Records replay-visible events before next projection.
- Emphasizes separation: the (static) gate may report inventory presence; it must not infer product is allowed private cursor moves, local retry loops, or product-owned re-entry events. Runtime authority is ABG-only.

**SDLC (7d8306d - Record ABG runner bridge consumption for optimizer)**:
- Pure ticket record in T-165 (no code change in odd_sdlc).
- Correctly moves the "ABG gap" to "SDLC consumption gap".
- References the exact test and the handoff: consequence selection -> admission -> construction action/intent -> graph re-entry -> replay-visible child provenance.

**Verification (executed in this review)**:
- `cd abiogenesis/build_tenants/abiogenesis/typescript && npm run build:semantic` → clean (tsc).
- `node --test test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs` → 3/3 pass (including new out-of-range fail-closed).

## STDO / ODD / Design Audit

**ODD_METHOD**:
- ABG owns the consumption: engine_runner (ABG runtime) consumes the outcome.traversalAction, projects using bridge, invokes construction runner, applies re-entry, emits replay-visible events (`graph_reentry_*`, construction deltas), derives next projection/continuation.
- Downstream (consequence plugin) only produces the selection in its outcome; does not control execution or re-entry.
- Preserves "ABG owns continuation and re-entry after each publish boundary".
- Static gate (conformance) separated from runtime (construction/continuation) — explicit in updated IACS and ticket. The gate is inventory proof; runtime re-entry is ABG event-sourced authority.
- No product-local loops or authority in the runner path.

**DESIGN_MODULE_METHOD**:
- Realization inside existing construction surfaces (uses runConstructionIntentStep, existing carriers for observation/action/intent/priority).
- New consumption is explicit function with clear inputs/outputs (typed world build, blocked vs success).
- Separation of static (gate IACS) vs runtime authority documented.
- Fail-closed for out-of-range (no throw, proper terminal with reason) — good boundary discipline.
- Trace to prior bridge (no duplication).

**TICKET_METHOD / SPEC_METHOD**:
- All work inside durable T-152 (checklist now includes the runner consumption item).
- T-165 update is correct status record (no premature closure or scope creep).
- Traceability to REQ-R-ABG3-FP-CONSCIOUSNESS / INTERPRET / CONVERGENCE (runner owns the construction consciousness loop application of consequence-selected reentry).
- Proof: expanded focused test + replay events + fail-closed.
- Supersession hygiene maintained: prior bridge work is substrate; this is consumption; downstream wiring remains open.

**Authority / no leakage / cross-repo**:
- Engine-authority already rejected at admission (prior); runner only sees admitted action.
- All provenance preserved (actionRef, consequenceRef, etc.) into construction surfaces and events.
- No SDLC code change — only ticket note scoping the optimizer consumption. Correct (per workspace rule: do not spread by drift).
- Matches T-197 E6 target: ABG provides the lawful upstream_reentry path; SDLC will consume it in optimizer (P2/P3).

## Code Review Notes (runner consumption)

**Strengths**:
- Consumption is centralized in `consumeConsequenceTraversalAction` + call sites in the main iterate logic — clean, not scattered in harness.
- Uses the prior bridge functions exactly (no reimplementation).
- Proper event append (prelude construction events, then construction outcome events).
- Iteration count and projection correctly include child work.
- Blocked path returns proper terminal gap_stop with reason (fail-closed, no crash).
- Out-of-range proof in test (and likely internal checks in build world or intent step) — matches description.
- Design IACS now explicitly calls out the separation and what the gate must *not* enable (private loops).

**No issues**:
- Code follows existing patterns in the runner (resolve plugins, event state, derive projection).
- Replay-visible: events are emitted via the request sink and included in replay.
- The "through the construction runner rather than caller/harness" is exactly what the new checklist item requires.

**Minor (non-blocking)**:
- Some build* functions for the world are in the same file or imported; as long as they are tracked and tested, fine (they are, per test).
- Test still focused on the bridge file (good for regression); full integration will come with downstream consumption.

## Assessment

This slice correctly advances T-152 by moving the bridge from "manual/test-only" to "engine runner owned" (ABG runtime authority).

The design/ticket update for separation of static conformance inventory from runtime construction/continuation is important and well-scoped — prevents the gate from being misused as runtime control.

T-165 update is the correct minimal cross-repo hygiene: records the ABG progress and keeps the remaining work (SDLC optimizer/data-mapper emitting the action and consuming the re-entry evidence) explicitly in SDLC scope.

Verification clean. No authority leakage, ownership respected, traceability strong.

**Persisted**: This review at abiogenesis/.ai-workspace/comments/grok/20260612T_review_T-152_runner_consumption_and_scope_update.md (commentary only; tickets, IACS, code, and tests are the governed surfaces).

Ready for the SDLC consumption phase in T-165 P2/P3. Good, disciplined progress under STDO.

(End of review.)