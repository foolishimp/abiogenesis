# B-010 Induct ABG Source Development Under Installed ODD Governance

- id: B-010
- title: Induct ABG source development under installed ODD governance (without boundary collapse)
- type: methodology
- status: blocked
- goal: future ABIogenesis 5.0.1 dogfood wave; not GOAL-035
- change_intent: Run ABIogenesis successor development under installed released ABIogenesis plus a released declarations-only ODD catalog product, without collapsing the mutable source project into either installed product.
- change_class: intent_reprice
- re_entry_point: goals
- priority: low
- intake_source: data_mapper.test33 qualifying run; SPEC_METHOD.md conformance review 2026-04-17; codex T-014 review 2026-04-17
- affected_boundary: ABG development process, test qualification authority
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-07-13 (stable-first 5.0.1 deferral)
- reopened_at: 2026-04-26
- blocked_at: 2026-04-26
- blocking_dependency: stable released ABIogenesis 5.0 plus independently
  released odd_glc 1.0 selected as the 5.0.1 development product
- blocked_reason: >-
    F_H ruled that ABIogenesis 5.0 is authored directly under STDO and accepted
    design gates, then released as the stable baseline before dogfooding begins.
    Full installed-product governance induction therefore re-enters only for
    the 5.0.1 successor wave after T-248 and odd_glc 1.0.

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

## Stable-First Deferral (2026-07-13)

F_H approved the stable-first 5.0 plan. The earlier odd_sdlc/ABG-2.0 framing
above remains historical intake; odd_sdlc is not a current delivery product or
governance dependency.

Current disposition:

1. ABIogenesis 5.0 is authored in the mutable source project under STDO,
   accepted three-view design, GTL admission, semantic compilation, focused
   proof, and phase self-review.
2. That manual governance is sufficient for the 5.0 construction wave. It is
   not represented as installed-product dogfood or completed B-010 induction.
3. T-248 releases the stable 5.0 product directly. B-010 is not a T-248 gate.
4. After stable 5.0 and odd_glc 1.0 exist, T-245/T-246 use those installed
   released products to govern the mutable 5.0.1 subject. That is B-010's next
   lawful re-entry.
5. The installed products, target workspace, mutable source, event/projection
   state, and generated artifacts remain distinct. No root `.genesis` or local
   residue becomes constitutional authority.

Re-entry requires all of:

- completed T-248 stable 5.0 release;
- independently released compatible odd_glc 1.0;
- an admitted ABIogenesis 5.0.1 goal and subject; and
- accepted T-245 campaign design preserving the product/install/source split.

The optional mechanical commit/push guard proposed as stable-plan amendment A5
remains pending F_H choice. Its absence does not authorize code-first work;
ticket reference, accepted design reference, and phase self-review remain
mandatory process gates.
