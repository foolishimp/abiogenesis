---
id: T-197-proof-strength-admission-full-carrier
type: feature
ticket_category: ordinary
status: completed (2026-07-09, riding the T-210 wave as rescheduled)
opened: 2026-07-06
source: T-195 review P1-8
change_intent: replace the REQ -035 interim strength projection with the full ProofStrengthAdmission carrier
change_class: design_reframe
re_entry_point: design_surface (abg/m03 payload ledger + carry-through)
triaged_at: 2026-07-09
updated_at: 2026-07-09
---

ProofStrengthAdmission carrier replaces the REQ-035 interim projection (payload_ledger.ts:1296)

## Intake Triage (2026-07-09)

1. UPWARD WALK: requirement EXISTS and is explicit (-035: strength
   becomes closure-bearing only through admitted ProofStrengthAdmission
   or equivalent admitted projection; -036: F_D-checkable or
   adversarially verified). Interim projection realized; the full
   carrier is deferred design => design_reframe, correct as ruled.
2. COUPLING DISCOVERED: T-210 (earned depth + adversarial admission)
   formalizes adversarialAttemptRefs/counterexampleRefs ledger
   resolution — the exact fields -035 says the full carrier preserves
   (adversarial attempt refs, counterexample refs, disposition, replay
   identity). Building T-210 against the interim projection and then
   migrating to the full carrier is two migrations where one suffices.
   RESCHEDULE: T-197 rides the T-210 wave (the carrier lands first or
   together, inside-out).
3. SPAN: payload ledger -> carry-through producer -> coverage projector
   strength issues -> depth gates.

## Closure (2026-07-09)

Realized as contracts/proof_strength_admission.ts — the full -035
carrier as an EQUIVALENT ADMITTED PROJECTION (a total derivation over
already-admitted replay truth: evidence ledger + admitted contract/
envelope + earned-depth (T-210 b2) + scoped adversarial truth (T-210
b4)). No new event kind: unlike the depth map, strength admission has
no open ingress of its own, so a derived carrier is the prime shape
(carrier-minimalism law).

- Field list preserved verbatim per -035: strengthRef, source
  requirement obligation refs, proof obligation refs, proof policy
  refs, expected evidence shape refs, depth class refs (EARNED classes
  when a map is admitted), verifier refs, adversarial attempt refs,
  counterexample refs, disposition, replay identity (+ content digest).
- Disposition lattice (-036, closed): counterexample present ->
  not_admitted (nothing outvotes it); ref admitted + fd criteria total
  over the ledger -> fd_checked; ref admitted + admitted adversarial
  verification -> adversarially_verified; otherwise not_admitted.
  Worker self-report and template list presence cannot become admitted
  strength by construction.
- Consumer swap, not fork: the carry-through producer derives the
  carriers and feeds ONLY closureBearingStrengthRefs into proof-depth
  truth; deriveAdmittedStrengthRefSet demoted to the admitted-evidence
  primitive with a do-not-consume-for-strength comment.
- Differentials: disposition lattice + -035 preservation + digest law
  (unit); the -036 adversarial disjunct end to end (engine run with
  UNRESOLVABLE fd criteria closes strength via admitted kill evidence
  -> eligible). Behavior-compatible swap: semantic 1167/1167, t188
  61/61, t205 22/22.
