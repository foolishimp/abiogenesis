# B-010 Induct ABG Source Development Under odd_sdlc Governance

- id: B-010
- title: Induct ABG source development under odd_sdlc governance (without boundary collapse)
- type: methodology
- status: deferred
- goal: abg-self-governance
- change_intent: Run ABG 2.0 source development under a released odd_sdlc product as the governing runtime, without collapsing the boundary between the mutable source project and the released product.
- change_class: intent_reprice
- re_entry_point: goals
- priority: low
- intake_source: data_mapper.test33 qualifying run; SPEC_METHOD.md conformance review 2026-04-17; codex T-014 review 2026-04-17
- affected_boundary: ABG development process, test qualification authority
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

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

- odd_sdlc 1.0 stable and released (data_mapper qualifying run passes cleanly — in progress).
- ABG 2.0 goals declared.

## Not in scope for 1.1

- ABG 1.1 is a patch/bug-fix release. Development process changes belong to 2.0.
