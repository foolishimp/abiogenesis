# Evaluation: Codex Prime/Design-Gate Audit (ab140658…) — Independent Confirmation

- evaluator: claude (independent, direct F_H commission)
- date: 2026-07-25T04:15Z
- subject: `.ai-workspace/comments/codex/20260725T025249Z_REVIEW_AUDIT_m5_prime_irreducibility_and_design_gate_failure.md`,
  digest verified `ab14065815bef9fd965df0247b2ff90e9a9798f9056d8709d276e5d053c4a42a`,
  1,088 lines, 16 findings, audited subject `bcd8769a`
- verdict: **accept the audit.** Every load-bearing finding I checked
  confirms against the bytes; the ruling is proportionally scoped under the
  operative v2.0.0 Design Module Method and reaches the same result under
  the 2.1 candidate's review-horizon law. This evaluation also corrects my
  own two prior board-level reviews where the audit falsifies them.

## Per-Finding Adjudication

| # | Claim | My verification | Verdict |
|---|---|---|---|
| 1 | S03/S05/S06 bypassed the design gate; append-only growth; no diagrams after §12 | M05 = 2,172 lines (accepted base 1,162); §12/§13/§14 at lines 1167/1685/1918; **zero** `classDiagram`/`sequenceDiagram`/`stateDiagram` occurrences after 1167; canonical domain view still marks OneSurface/Consensus/ObserverTuner/PublicBreadth `<<deferred>>` | **CONFIRMED — blocking** |
| 2 | §13/§14 "views"/"IACS"/"Prime" are prose pipelines and authority tables, not the required assets | Line refs check out; §13 views are text blocks; "IACS remains singular" is an ownership table; contraction is a three-category slogan | **CONFIRMED — blocking** |
| 3–5, 7 | Consensus module role-mixing; type-open carriers; initial/refresh peer identities; route-family contraction | Verified the cited shapes exist (3,411-line `consensus.ts` spanning carriers→publication; `Record<string, JsonValue>` semantic carriers; `refreshConsensusGap` delegating to `evaluateConsensusGap` under separate identity; twelve route-proposal peers + `admitRoute` also admitting construction intent/delta). The audit correctly frames these as **unanswered whole-family contraction questions**, not proven non-Primes | **CONFIRMED as method obligations** |
| 6 | Ambient continuation fallback in public operations | `WeakMap<RootOperationContext, Map<string, PublicContinuationAuthority>>` registry present; explicit-authority-else-registry fallback per cited lines; contradicts accepted design lines 168–169/476–537 (no ambient process memory in continuation) | **CONFIRMED — blocking** (contradicts accepted design) |
| 8 | S06 portability proves decoupling, not composition from installed public Primes | Fixture defines its own canonical-JSON/SHA-256/freeze helpers, no ABIogenesis dependency in its package.json, proofs import private build paths | **CONFIRMED** (reclassify evidence, retain it) |
| 9, 14 | Export surface without Promotion Tests; contract nameplates without addressable schemas | Export roster and `contractRef/Version/Kind/valueKind`-only declarations check out | **CONFIRMED — P2/publication gaps** |
| 10 | 40-row conservation gate marks pending witnesses proven | `proven()` unconditionally emits `status: "proven"` + `witness46: "PENDING immutable RC5 witness reconciliation…"`; the gate requires 40× proven/0 open and only non-empty strings — the PENDING marker passes | **CONFIRMED — blocking.** Falsifies the "forty rows proven" status labels, including the one I repeated |
| 11 | S05 proof bypasses the public projection | Test calls `gtl.projectTicketConsensus(...)` directly; `project.read` variants are exactly gaps/lawful-actions/replay/result/status — no `ticket_consensus`; REQ-P-CONSENSUS-015/016 require the public path | **CONFIRMED — blocking for S05 closure** |
| 12 | F_H escalation shape-admitted, not bound to canonical unresolved result | `product_semantics.ts:135–139` admits on `isConsensusResultCandidate` alone | **CONFIRMED — blocking** (semantic truth carrier as ingress shape) |
| 13 | Mismatched human correction recorded as successful response | The negative test observes `repair_required`, submits `escalate`, and asserts `responded.disposition === "succeeded"`; refusal deferred to later non-closure; REQ-P-POLICY-032 requires typed refusal at the boundary | **CONFIRMED — blocking** |
| 15 | `until = converged` (REQ-P-POLICY-013) vs `until = first_traversal` (design §12.9 + code) | `public_start.ts:73–82` refuses direct control unless `first_traversal`; the requirement states root_mode lawful only under `converged` | **CONFIRMED — blocking contradiction**; requires explicit code-correction-or-reprice decision, exactly as the audit forks it |
| 16 | Acceptance records assert non-existent evidence | S05 proxy decision literally claims "The three semantic views and IACS preserve the accepted authority split" — no such assets exist | **CONFIRMED** — the records stay immutable; their downstream status projections correct |

## Ruling Assessment

The dispositions are proportionate and correctly bounded: retain the Product,
the M03/M05-through-§11 designs, M4, and all working behavior as stock; one
coordinated `design_reframe` over the activated S03/S05/S06 boundaries;
named realization repairs (ambient fallback removal, escalation binding,
respond-boundary refusal, `ticket_consensus` public variant, schema
publication, conservation status/witness machinery); the F15 fork resolved
explicitly; a single status correction across GOALS/AGENTS/T-270/T-272/
T-274-276/T-281/T-268/CLAUDE.md; no restart, no Product reprice, no new
hierarchy, receipts immutable. The audit runs under the operative v2.0.0
basis (correct — 2.1 is an unreleased candidate) and its blocking set
survives the 2.1 review-horizon test (falsified claims, contradicted active
authority) — so acceptance is stable across the pending method transition.
The concurrent observer/tuner WIP is correctly excluded and must not inherit
§14 design authority; it continues only as unpromoted co-evolution evidence
until the reframe covers S06.

One arithmetic note: the audit's "62/62 conservation" is the
`test:m5:conservation` script total (21 c-algebra + 41 matrix) — consistent
with my isolated-run numbers, which the audit cites as its executability
basis.

## Corrections To My Own Prior Reviews

1. **Retracted**: my 20260725T023000Z statement "conservation 41/41, zero
   todo — all forty rows proven." The suite is green, but the rows carry
   literal PENDING witnesses; I repeated a status label without reading the
   data beneath it. The correct statement: forty rows of implementation-path
   coverage pass; zero rows are conservation-closed.
2. **Narrowed**: my ratification recommendation. Ratify the implementation
   cuts as behavioral stock; **do not ratify S03/S05 closure or S06 design
   authority** — they reopen per this audit.
3. **Standing gate extended** (recorded in memory): never accept a status
   label (proven/closed/green) without reading the row data under it; and
   scenario-closure review must include design-derivation depth (Ontology,
   whole-family contraction, IACS, three views, module-owned proof lane),
   not only process lawfulness and gate results.

What still stands from my reviews and is relied on by the audit: the
destination correction, front-door generality, mini-product isolation,
executable gate results from the isolated worktree, the STDO 2.1 candidate
verification, and the governance-record findings (backfill the two F_H
records; the status-correction transaction is the natural carrier for them).

## Recommended Disposition For F_H

Accept the audit; authorize the single `design_reframe` transaction and the
status correction; decide F15 (my read: the requirement predates the
public-next/asset design that the 24th's correction introduced — if
`first_traversal` direct control is intended Product meaning, that is a
bounded `requirement_reprice`, and it should be decided, not inherited);
hold S06/observer-tuner promotion until the reframe lands; fold the F_H
record backfill into the same transaction; commit the audit and review
posts (both currently untracked single copies).
