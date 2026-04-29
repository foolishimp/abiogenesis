# REVIEW: TS-Primary RC Readiness — STDO Lens

**Author**: Claude
**Date**: 2026-04-30T02:00:00Z
**Subject**: Operator readiness assertion: TS technically RC-candidate ready (291/291 tests, T-095-TS accepted, T-094 live archive proven), but **not** RC-cut ready until external review accepts the TS-primary tranche.
**Posture**: External-agent review under STDO Method.
**Anchoring**: STDO scope letters S/T/D/O.

## Verdict

**The operator's framing is correct under STDO.** Test passage is technical readiness. RC tag/cut requires external review acceptance of the governance tranche. These are different gates; passing the first does not satisfy the second.

The lawful next step is to send the **complete TS-primary tranche** for external STDO review. RC tag/cut is unlawful until that review accepts the resolved blocker set and the TS-primary scope itself.

Two refinements to the operator's framing below; neither changes the conclusion.

## Verified Wave State

Confirmed against on-disk frontmatter at 2026-04-30T02:00Z:

| Ticket | status | review_status |
|---|---|---|
| T-086 | active | `awaiting_external_agent_review` |
| T-090 | active | `awaiting_external_agent_review` |
| T-091 | active | `external_review_blockers_resolved_pending_re_review` |
| T-092-TS | active | `external_review_blockers_resolved_pending_re_review` |
| T-093-TS | active | `external_review_blockers_resolved_pending_re_review` |
| T-094 | active | `external_review_blockers_resolved_pending_re_review` |
| T-095 | active | `external_review_blockers_resolved_pending_re_review` |
| T-095-TS | active | `external_review_accepted_closure_ready` |
| T-096 | active | `awaiting_external_agent_review` |
| T-092-PY | paused | `suspended_by_tenant_registry` |
| T-094-PY | (paused) | per T-096 disposition |
| T-095-PY | (paused) | per T-096 disposition |

The operator's listed states match disk for the named tickets. T-086 is not in the operator's summary but is upstream of T-090 and inside the same wave (see refinement R-1 below).

## STDO Lens On The Readiness Claim

### S [SPEC]

- **(positive)** T-096's `change_class: product_reprice` is correct. Under `SPEC_METHOD.md`'s constitutional chain (Goals → Intent → **Product Definition** → Requirements → Design → Code), declaring TypeScript the primary release and pausing Python is exactly a Product-Definition-layer reprice. `re_entry_point: product` is the smallest lawful re-entry.
- **(positive)** T-096 contains itself well. Its `non_closure_conditions` explicitly forbid:
  - "Python parity is silently assumed from TypeScript proof"
  - "Python evidence is deleted or rewritten as if the gap never existed"
  - "TypeScript RC readiness is claimed before another agent reviews the new tenant scope"
  
  These are the three traps a pause-without-claim could fall into. Forbidding them up front is the correct STDO posture.
- **(positive)** Authority refs are well-anchored: `TENANT_REGISTRY.md`, `specification/PRODUCT.md`, `specification/GOALS.md`, `qualification_surface_map.md`. The product reprice has a real authority surface to land in.
- **(positive)** Trace closure preserved: `proof_surface` includes the README cascade (`README.md`, `build_tenants/abiogenesis/README.md`, `build_tenants/abiogenesis/typescript/README.md`, `build_tenants/abiogenesis/typescript/design/README.md`). Surfaces describing Python as canonical must change in this set; the reviewer can trace each.

### T [TICKET]

- **(positive)** T-096's dependencies are explicit and accurate: T-091, T-092-TS, T-093-TS, T-094, T-095 in `external_review_blockers_resolved_pending_re_review`. The ticket names exactly the tickets that must be re-reviewed before T-096 can claim closure.
- **(positive)** Closure law is right-shaped: "Close only after another agent accepts that the tenant registry, product/readme surfaces, qualification map, and active tickets consistently state the TS-primary/Python-paused scope." Single coherent acceptance gate.
- **(positive)** Process rule honored: per `TICKET_METHOD.md`, ratification requires another agent's acceptance. Self-acceptance is not lawful closure. The operator's "not ready to tag/cut" reading is exactly this rule applied.
- **(positive)** Goal scope held: `goal: abg-total-assurance-calculus`, `goal_status: active`. The wave goal stays open until the tranche closes; RC tag/cut would be a goal-layer event that this wave currently does not authorize.

### D [DESIGN_MODULE]

- **(positive)** No design-surface change. The TypeScript implementation files (`assurance.ts`, `payload_ledger.ts`, `assurance_register.ts`, `assurance_gate.ts`, `engine_runner.ts`) do not change as part of T-096. The 291/291 test passage is therefore design-stable evidence: it certifies the realization unchanged from the wave's last review.
- **(positive)** Projection-source coherence preserved by the "paused Python evidence remains reference" clause. Paused tickets are not deleted; their event-projection role is retained as historical reference. This honors `DESIGN_MODULE_METHOD`'s rule that projections must derive from admitted truth — including admitted historical truth that has been demoted but not erased.

### O [ODD]

- **(positive)** The substrate (ABG/GTL) is unchanged. ODD §4 boundary holds: ABG owns runtime mechanics, products own domain meaning. T-096 changes only the product/release scope, not the substrate's authority.
- **(positive)** ODD §11 recursive product taxonomy preserved: `Source Project (abiogenesis) → tenants {typescript, python}`. One tenant is paused; the taxonomy is intact. T-096's ticket-disposition table makes the new tenant statuses explicit.
- **(positive)** ODD §7 truth rule 5: "Correction shadows stale truth; it does not erase history." T-096 honors this. Pausing Python tickets and surfaces shadows them as non-authoritative; deleting them would have violated the rule. The text "Python remains a paused released reference line whose historical tests, audits, and archives may inform review but do not block or close the TS-primary RC gate" is the right reading.

## Refinements To The Operator's Framing

### R-1 (low): T-086 belongs in the tranche even though T-096 does not cite it

T-096's dependencies list T-091, T-092-TS, T-093-TS, T-094, T-095. It does not name T-086 (the traversal-envelope topology spike) or T-090 (the assurance carriers/seams design). But:

- T-086 is upstream of T-090 (T-090's body cites T-086 as `awaiting_external_agent_review`).
- T-090 is the design-reframe ticket for the assurance carriers that T-091/T-092 implement.
- Both are part of the wave that produced the TypeScript proof the operator is citing.

Sending T-091/T-092-TS/T-093-TS/T-094/T-095/T-095-TS for re-review without their upstream T-086/T-090 acceptance leaves the substrate-design ratification underwater. An external reviewer is likely to ask "where is the topology + carrier-design acceptance for the proof I'm reviewing?"

**Recommendation**: include T-086 and T-090 in the tranche-for-review submission. The operator's framing already implies this ("T-090: awaiting_external_agent_review" listed), but T-086 should be added explicitly. The complete tranche is **nine tickets**: T-086, T-090, T-091, T-092-TS, T-093-TS, T-094, T-095, T-095-TS, T-096.

### R-2 (low): T-095-TS can close independently as a tenant slice; this does not advance RC

T-095-TS's review_status is `external_review_accepted_closure_ready` (per Huygens). It can be closed as a tenant slice today without waiting on the rest of the tranche. **But this does not advance RC readiness.** T-095 (the upstream design) is still in re-review, and T-095-TS's body explicitly states "this acceptance is tenant-local. It does not close upstream T-095."

Closing T-095-TS reduces the active-ticket count but does not change the RC gate. The gate is the **upstream** tickets accepting the wave, plus T-096 ratifying the TS-primary scope.

**Recommendation**: close T-095-TS at any time as cleanup, but do not let its closure suggest the wave has progressed toward RC. The wave progresses only when external review accepts the upstream tickets and T-096.

## RC Readiness Rule (Concrete Statement)

Under STDO, "RC tag/cut ready" requires all of:

1. **Substrate ratification**: T-086 (envelope topology) and T-090 (assurance carriers/seams) accepted by external review.
2. **Proof ratification**: T-091 (proof matrix), T-092-TS (TS implementation), T-093-TS (runner integration) re-reviewed and accepted.
3. **Live evidence ratification**: T-094 (UAT/live), T-095 (payload-ledger upstream), T-095-TS (TS payload-ledger impl) re-reviewed and accepted (T-095-TS already accepted; T-095 needs re-review).
4. **Product-scope ratification**: T-096 (TS-primary, Python-paused) accepted by external review.
5. **Surface consistency**: TENANT_REGISTRY, PRODUCT.md, README cascade, qualification map all reflect the TS-primary/Python-paused state.
6. **Goal closure**: `goal: abg-total-assurance-calculus` advances to a closed or partially-closed state.

Today, items 1, 2, 3, and 4 are pending external review. Item 5 is conditional on item 4. Item 6 is conditional on items 1–5.

**RC tag/cut is unlawful today.** The operator's read is correct.

The lawful next step is **single submission of all nine tickets** to external STDO review with T-096 as the central scope reprice and the rest as the supporting evidence chain.

## Mild Concern (Pre-Review Hygiene)

Before submitting, run a one-pass consistency check on:

- `build_tenants/TENANT_REGISTRY.md`: does it currently mark `abiogenesis/typescript` as `Primary Release` and `abiogenesis/python` as `Paused`? T-096's evaluation_criteria require this; if the registry hasn't been updated, the reviewer will reject scope on first read.
- `specification/PRODUCT.md`: does it still describe Python as the active canonical released line? If yes, T-096 hasn't landed its own implementation; reviewer will flag.
- `specification/GOALS.md`: does it carry the TS-primary/Python-paused work-wave language? Implicit in the goal status, but worth being explicit.
- `README.md` cascade: does it describe Python or TypeScript as the operative current line?

These are not tickets — they are surface artifacts T-096 must update for its own evaluation_criteria to be satisfiable. If any of them lag, T-096's own closure_law fails at first review.

The operator's claim "TS is technically RC-candidate ready" is on the **proof side**. The **scope side** (T-096's surface updates) needs the same treatment. If both are ready, the tranche submission is clean. If the surface updates are pending, the tranche should not be submitted yet — submit when both proof and scope sides are consistently asserted.

## Closing

The operator's read is correct. Test passage is technical readiness; STDO requires external acceptance for RC tag/cut. The complete TS-primary tranche (nine tickets) is ready to submit when the surface artifacts in T-096's `proof_surface` are confirmed to reflect the new scope. Python is no longer the blocker once T-096 is accepted; the blocker is the wave acceptance itself.

After acceptance: tag/cut is lawful, T-095-TS closes as tenant slice (or earlier if you prefer cleanup), and the wave goal advances. Until acceptance: hold the tag.
