# T-270 - Reconcile And Reclose S03

- id: T-270
- title: Reconcile and reclose S03 through the installed external Product path
- type: correction
- ticket_category: design_and_realization_correction
- status: active
- phase_status: m5_s03_reconciliation
- review_status: pending_bounded_design_reconciliation
- proof_status: pending_s03_reclosure
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Preserve the working direct-GTL realization while correcting the exact S03
    continuation, F_H response, direct-control, and design-method defects that
    invalidate its current closure claim.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 12 and its realized
    module boundaries
- triaged_at: 2026-07-25
- created_at: 2026-07-14
- updated_at: 2026-07-25
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- implementation_hold: released_for_s03_only
- implementation_hold_effect: >-
    S03 design reconciliation and the exact owned realization repairs may
    proceed; S05, S06, observer/tuner, conservation qualification,
    qualification, and release remain held
- current_product_outcome: ABG5-S03
- retained_behavioral_stock: bcd8769a8163a222e2e59400c904994b3de161fd
- regression_bindings:
  - ABI5-ROOT-001
  - ABI5-M5-EXT-001
- selected_method_release: STDO v2.0.0
- selected_method_commit: 94ccf4faa1c0a10b002273b1e9a9e7bf4a34753a
- selected_method_member_set_digest: 284efbb31affd6772fe8e523bdd157f7f2ebe4d4d8dee7b5c9ddfd0482da93a0

## Purpose

T-270 is the sole active M5 execution contract. It owns one selected Product
outcome:

```text
reconcile and reclose ABG5-S03
  -> through the independently packed external Product
  -> while preserving direct GTL -> validator -> HoG -> ABG authority
```

The implementation at `bcd8769a` is retained behavior, not accepted closure.
Completed tickets, decisions, reviews, test counts, and donor branches are
history or evidence. They do not enlarge this ticket.

## Governing Authority

Read this ticket through:

1. `specification/GOALS.md`;
2. `specification/PRODUCT.md` `ABG5-S03`;
3. `specification/requirements/product/REQ-P-SCENARIOS.md`;
4. `specification/requirements/product/REQ-P-POLICY.md`;
5. applicable ABG continuation, projection, and construction requirements;
6. accepted M03 direct-GTL design; and
7. M05 Sections 1 through 11 plus the provisional Section 12 realization.

If this ticket conflicts with Product or requirements, the higher authority
governs. Commentary and the implementation cannot silently reprice them.

## Exact Defects

This correction owns four defects:

1. public continuation accepts a process-local lookup when the explicit
   durable authority is omitted;
2. an F_H response that differs from the Product-owned pending choice can be
   recorded as succeeded before later continuation refuses to close;
3. direct public control requires `until = first_traversal` in design and code
   while the live requirement requires `until = converged`; and
4. the active S03 boundary closed without reconciled Ontology, atomic-function
   derivation, whole-family Prime contraction, IACS, module ownership, three
   views, axiom evaluation, and module-owned proof.

No other refactor is selected by this ticket.

## Design Reconciliation

Design and code may co-evolve. Before S03 reclosure, one boundary-bounded S03
design cut shall:

- identify the active entities, relationships, cardinalities, lifecycle, and
  authority;
- derive or disposition the S03 atomic and composed function families;
- perform whole-family Prime contraction without presuming that fewer
  functions, types, or files is correct;
- identify authoritative, subordinate, effect-edge, and downstream carriers;
- classify public versus module-local visibility;
- reconcile domain, sequence, and lifecycle views;
- evaluate applicable axioms; and
- map the retained implementation and module-owned proof to the accepted cut.

The design pass may retain the current module and function shape. It
authorizes refactoring only where it proves duplicate, ambiguous, or rival
authority.

## Realization Contract

The corrected installed path shall preserve:

```text
public start or invoke
  -> Product-owned One Surface semantics
  -> ABG-admitted hold, gap, correction, re-entry, or terminal truth
  -> explicit durable public authority
  -> fresh-context read | interaction.respond | run.continue
  -> append-only event truth and replay-derived public outcome
```

Required realization changes:

- make process-local continuation state cache-only or remove it;
- require the explicit durable public continuation carrier whenever public
  truth is reopened;
- reject a response that does not match the pending interaction, Product-owned
  choice, actor capability, response contract, and current basis;
- resolve the `root_mode` and `until` contradiction at requirement authority
  before code and design converge on one law; and
- add module-owned proof for the corrected boundary.

## Functional Review Criteria

Review must answer:

1. Can omitting the durable continuation carrier change admissibility?
2. Can process-local state authorize a read, response, continue, or re-entry?
3. Does a mismatched F_H response refuse before satisfying the pending
   interaction?
4. Is the direct-control law identical in requirement, design, validator,
   runtime, SDK, CLI, and installed tests?
5. Does the accepted S03 design derive every changed authority-bearing
   function and carrier?
6. Did any correction introduce another controller, runtime, event writer, or
   semantic authority?
7. Do the existing installed external Product and root regression paths remain
   green?

## Acceptance

S03 closes only when:

- the four exact defects are repaired;
- the boundary-bounded design reconciliation is accepted;
- targeted fresh-context and negative tests pass;
- `npm run test:m5:external` passes serially;
- `npm run test:m5` passes serially;
- `npm run test:m4` passes serially;
- package construction remains source-independent and reproducible;
- no compiler, lowering carrier, Public controller, second runtime, or rival
  event authority is introduced; and
- the exact implementation and evidence subject receives the required review
  and acceptance disposition.

## Non-Closure Conditions

S03 remains open if:

- a WeakMap, registry, process lifetime, or ambient workspace file can change
  public continuation authority;
- invalid F_H input is recorded as a successful response;
- direct-control semantics remain contradictory;
- design evidence merely renames broad authority categories as Prime or IACS;
- installed tests bypass the public path they claim to prove;
- test success is substituted for missing design or module proof; or
- work from S05, S06, observer/tuner, qualification, or release enters the
  promoted subject.

## Exclusions

This ticket does not authorize:

- S05 Consensus repair;
- S06 portability repair;
- observer or tuner implementation;
- complete RC5 conservation reconciliation;
- qualification or release;
- a Product rewrite;
- a new ticket hierarchy;
- a whole-engine Prime census;
- restoration of X or another rebuild; or
- speculative refactoring without a proved S03 authority defect.
