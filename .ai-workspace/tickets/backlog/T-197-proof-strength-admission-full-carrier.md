---
id: T-197-proof-strength-admission-full-carrier
type: feature
ticket_category: ordinary
status: backlog (RULING 2026-07-06: not 4.5-blocking — typing hygiene; schedule post-4.5. RESCHEDULED 2026-07-09: rides the T-210 earned-depth wave, not the T-203b erase wave — see triage.)
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
