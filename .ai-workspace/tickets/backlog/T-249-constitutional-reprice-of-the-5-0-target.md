# T-249 - Constitutional Reprice Of The 5.0 Target

- id: T-249
- title: Constitutional reprice of the 5.0 target to the campaign model
- type: reprice
- ticket_category: constitutional_reprice
- status: backlog
- goal: GOAL-035 (this ticket rewrites it)
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD
- change_class: intent_reprice
- re_entry_point: specification/INTENT.md
- created_at: 2026-07-12
- source_ticket: T-242 (created under review amendment, codex finding 1)
- admission_condition: F_H records the R4 product-identity and scope decision; drafting starts only after that ruling
- dependencies:
  - T-242 disposition set (the ticket-layer state this reprice legalizes)
  - F_H R4 decision (product identity; EX + SP-product scope)
  - T-243 ruling (the predecessor-line dependency the goal text must name)

## Intake Triage

1. Substantive: yes — it changes ratified direction. INTENT item 12 currently
   mandates "builds the next installed ABG product through a two-stage
   self-hosting fixed point"; PRODUCT carries the "ABG Self-Hosting Fixed
   Point" section; GOAL-035's closure gate names the retired leaves and "R5 is
   self-hosted and immutable." The retarget replaces that with campaign-
   authored self-hosting (the installed stack authors its successor under the
   GLC/ODD discipline with admitted-evidence truth).
2. Boundary: constitutional text only — INTENT, PRODUCT, GOALS, and the named
   requirement surfaces. Realization re-enters through the successor tickets.
3. Upward walk: direction changes while goals-of-the-product stay (ship a
   consumable, self-hosting, spec-conformant substrate) ⇒ first affected
   layer INTENT ⇒ `intent_reprice` (singular class; T-242 holds the goal/
   ticket layer; this ticket holds the constitutional layer) ⇒ affected span
   below ⇒ release scope: none directly.

## Affected Span (each surface gets an explicit edit or a recorded no-change)

1. `specification/INTENT.md` — item 12 (two-stage fixed point → campaign-
   authored self-hosting); item 11 language reviewed against the T-247 claim
   dispositions; Python-carrier language per R2.
2. `specification/PRODUCT.md` — the "ABG Self-Hosting Fixed Point" section
   (P4/I4/B5/S5/C1/C2) replaced by the campaign-subject model + substrate/
   subject immutability rule (post §8.1) + the provenance-not-reproducibility
   trade (post §4) stated as ratified law; operator-contract claim per F_H's
   R4 scope decision.
3. `specification/GOALS.md` — GOAL-035 rewritten (or succeeded): closure gate
   currently names retired T-179/T-222–T-241 and is unsatisfiable as written;
   new gate binds the T-243..T-248 chain and the F_H-declared product
   identity.
4. `specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md` — reprice to the
   campaign definition of self-hosting.
5. `REQ-P-SELF-CONFORMANCE.md`, `REQ-P-QUAL.md` — retain / narrow / remove per
   F_H at this reprice (T-247 holds the claims meanwhile); update REQ-P-QUAL's
   witness-gate gap owner pointer (T-239 → T-247 or its successor).
6. R7: review T-241's completed I4-compatibility requirement text — stands or
   re-reprices.
7. R2: TENANT_REGISTRY.md and any remaining "Python paused" constitutional
   language → withdrawn.

## Method Law For This Reprice

- One change class per surface edit; if any edit turns out to be a different
  class (e.g. a pure requirement narrowing), it splits to its own ticket.
- SPEC_METHOD consistency gate is the exit criterion: after this ticket, no
  active surface mandates retired work, and T-242's closure condition 2 is
  satisfiable.
- History framing: a changed F_H decision reversing a reviewed adoption
  (2026-07-10 endorsement, T-218 promotion) — not error attribution to either
  agent. Release notes / design history may cite the packaging-fixed-point
  analysis (post §3) as the technical basis.

## Closure Condition

Every surface in the affected span carries its explicit edit or recorded
no-change decision; the consistency gate passes over the span (no active
surface requires retired work; no downstream artifact contradicts the new
upstream truth); F_H ratifies the resulting constitutional text.

## R4 Alignment (2026-07-12)

Admission condition SATISFIED: F_H recorded the R4 product-identity and scope
decision on 2026-07-12 (T-242 R4 Decision Record). Drafting starts on F_H's
word at the review pause. Drafting brief updates:

- GOAL-035 rewrite target: the R4 release ladder (feature-complete 5.0 RC ->
  GLC 1.0 over installed RC -> 5.0.0 final brought as an odd_glc 1.0 target
  project) with the T-243..T-248 chain as the closure gate.
- INTENT item 12 replacement: self-hosting defined operationally per
  ODD_METHOD SS7 (installed released builder distinct from in-development
  product; the released pair brings the next release as a target project) -
  replacing the two-stage packaging fixed point.
- PRODUCT fixed-point section replacement: the R4 ladder; the substrate/
  subject boundary is CITED from ODD_METHOD SS7, not ratified as new law
  (F_H: "these definitions are in the odd methodology").
- Feature scope law: the odd_glc-enablement test governs feature admission
  (T-244 register) and the T-247 claim dispositions.
