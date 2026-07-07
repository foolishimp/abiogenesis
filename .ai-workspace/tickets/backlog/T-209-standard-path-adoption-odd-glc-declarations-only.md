# T-209 Standard-Path Adoption: odd_glc Ships Declarations Only

- id: T-209
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: hog-iteration-2-standard-path
- change_intent: realize the T-205 acceptance clause that closure was
  narrowed away from — a product on the standard F_P path ships ZERO plugin
  code, and the odd_glc data-mapper runs on the substrate's standard worker
  plugin with its binding reduced to declarations
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-07-08
- created_at: 2026-07-08
- updated_at: 2026-07-08
- dependencies: T-205 (CLOSED — handler law, interpretation seam, internal
  gate, carry-through applicability all earned there; substrate 4.5.0-rc.7)
- links: T-208 (commonization escrow), REQ-R-ABG3-HANDLERS-001/-014,
  REQ-R-ABG3-CCALL-014/-017

## Scope

The successor to T-205's P4 phase, carried out on the 4.5.0-rc.7+ substrate:

1. odd_glc adoption: the generated binding's remaining worker-loop code
   (transport invocation, manifest consumption, response parsing,
   materialization, post-validation execution, evidence archiving,
   evaluator prompting) is replaced by declarations — catalog + selections
   + response contracts + materialization specs + calibration — consumed by
   the substrate's standard F_P pipeline handler. The plugin SEAM remains
   for exotic fibres; the standard path ships no code.
2. Campaign rerun as the proof: the odd_glc data-mapper runs on the
   standard worker plugin; -012 audit green on the result; per-
   configuration cost rows feed the offline tuner boundary (§13.1 holds).
3. Execution-authority audit (ODD 11.5B) on the adopted binding: no
   product-local worker supervision, retry, continuation, event append, or
   closure survives in odd_glc.

## Acceptance

- odd_glc standard-path binding contains declarations only; generated
  worker-loop code deleted, not wrapped (proxy prohibition applies)
- data-mapper campaign run converges on the standard worker plugin with
  -012 green and release-grade classification
- handler obligations O1-O8 hold at the adopted boundary (already law;
  proof rides the run)

## Non-closure

- a thinner generated binding that still implements any standard worker
  loop step downstream
- adoption proven only by harnessed lanes while the product claim cites the
  live campaign
