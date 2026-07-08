# B-010 Induct ABG Source Development Under odd_sdlc Governance

- id: B-010
- title: Induct ABG source development under odd_sdlc governance (without boundary collapse)
- type: methodology
- status: blocked
- goal: abg-self-governance
- change_intent: Run ABG 2.0 source development under a released odd_sdlc product as the governing runtime, without collapsing the boundary between the mutable source project and the released product.
- change_class: intent_reprice
- re_entry_point: goals
- priority: low
- intake_source: data_mapper.test33 qualifying run; SPEC_METHOD.md conformance review 2026-04-17; codex T-014 review 2026-04-17
- affected_boundary: ABG development process, test qualification authority
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-26
- reopened_at: 2026-04-26
- blocked_at: 2026-04-26
- blocking_dependency: stable released ODD SDLC product selected as governing
  source-development substrate
- blocked_reason: ABG source induction cannot be actioned until an ODD SDLC
  release candidate is stable enough to govern ABG source development without
  reintroducing root `.genesis` residue or collapsing source/install/product
  boundaries.

## Correction from prior version

Earlier framing assumed ABG lacks a constitutional chain. That is wrong.
ABG already has:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/` (with `abg/`, `gtl/`, `mapping/`, `product/` subtrees)
- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md`, `GTL_3_CONSTITUTIONAL_DESIGN.md`
- `specification/scenarios/`

The real induction question is not "build a constitutional chain from scratch." It is:
**"run ABG 2.0 development under a released odd_sdlc product as governed process, without
collapsing the mutable source project into the released product."**

This is the same boundary discipline codex named in T-014 for odd_sdlc itself:
- the source project is mutable
- the released product is immutable
- governance runs from the released product over the source development
- any local pattern proved in ABG development that becomes shared ODD law must be repriced
  upward into ODD_METHOD.md, not kept as ABG-local doctrine

## Context

```
ABG 1.0 (bootstrap) → builds odd_sdlc 1.0 → released odd_sdlc governs ABG 2.0 development
```

ABG 1.0 / 1.1 (current RC) is released as-is. No ABG 2.0 plan exists yet.
Induction is **low value until a 2.0 plan exists**.

## What induction actually requires

1. Declare ABG 2.0 goals and install a released odd_sdlc product as the governing runtime.
2. Run the ABG source workspace through odd_sdlc's traversal edges — the existing constitutional
   chain (INTENT, PRODUCT, requirements) is the input, not something to rebuild.
3. Ground the live test suite in the existing requirement surface — check scripts and prompts
   must derive from `specification/requirements/`, not from implementation habit.
4. Write or update ADRs for major structural decisions (transport, F_P dispatch, progress lease,
   writeback observer, supervisor) with `Implements: REQ-*` lines traceable to the existing
   requirements tree.
5. Adopt SPEC_METHOD/ODD_METHOD intake triage and change-class governance alongside the current
   ticket system, rather than replacing it wholesale.
6. Any governance pattern that proves out in ABG's self-hosted development and should become
   shared ODD law must be repriced into ODD_METHOD.md — not silently kept as ABG-local policy.

## Preconditions

- odd_sdlc stable and released, with an explicit release candidate selected as
  the governing source-development substrate.
- ABG 2.0 goals declared.

## Not in scope for 1.1

- ABG 1.1 is a patch/bug-fix release. Development process changes belong to 2.0.

## Reopen Correction 2026-04-26

This ticket is reopened. The prior deferred-precondition closure is not accepted
as a completed induction record.

Correction basis:

- ABG must not be treated as inducted under an SDLC runtime until a concrete SDLC
  candidate product exists and is selected as governing substrate.
- A root-level `.genesis` install in the ABG source workspace is not lawful
  source truth for this induction. It is local generated residue unless and until
  a governed SDLC candidate, installation boundary, and product/source boundary
  are explicitly ratified.
- The ticket may remain deferred, but it must not sit in `completed/` because it
  can be misread as an executed governance induction.

Current closure bar:

- declare an explicit ABG governance wave or ABG 2.x source-development wave
- identify the released SDLC product that governs the source line
- state the install/source boundary without creating root runtime authority in
  the mutable ABG source project
- remove or quarantine local root `.genesis` residue before claiming induction
  closure
- open replacement implementation tickets only after the SDLC candidate exists

## Blocked State 2026-04-26

This ticket is deliberately blocked, not actionable backlog.

It must remain blocked until:

- a stable ODD SDLC release candidate exists
- that candidate is selected as the governing product for an ABG source wave
- the ABG source/install/product boundary is stated before any runtime residue
  is created in the ABG source root

No `.genesis` root induction, install bootstrap, or source-development runtime
claim is authorized under this ticket before those preconditions hold.

## Superseded Completion Record

This ticket closes as an explicit deferred-precondition record, not as an
executed induction wave.

Closure basis:

- `specification/GOALS.md` contains no active `ABG 2.0` induction goal
- this repo's current waves are closed under the existing constitutional and
  design surfaces
- the smallest lawful future re-entry remains `goals`, not local realization

Future re-entry trigger:

1. declare an explicit `ABG 2.0` goals wave,
2. identify the released `odd_sdlc` product that will govern that source line,
   and
3. open a new ticket that supersedes this precondition record

Until then, this ticket is no longer actionable backlog.


## Intake Triage confirmation (2026-07-09)

Walk re-run: intent_reprice at goals re-entry stands; blocked state is
lawful (blocking dependency named: a stable released ODD SDLC governing
substrate). One update: the self-hosting maturity evidence has grown —
the odd_glc line now closes typed-requirement lifecycles end to end
(T-031) — but the blocking dependency is unchanged. No action.
