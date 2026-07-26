# T-265 - Close Canonical GraphFunction Combinator Applications

- id: T-265
- title: Close canonical GraphFunction combinator applications
- type: feature
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_self_and_independent_review
- review_status: closure_review_clean
- implementation_admission: completed_as_designed
- closed_at: 2026-07-13
- delivery_phase: DS-1
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Preserve recurse, fan-in, and gate as canonical first-class application
    declarations across native authoring, raw admission, and compilation.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md
- triaged_at: 2026-07-14
- triage_provenance: retrospective_backfill_from_ticket_boundary_and_accepted_design
- created_at: 2026-07-13
- updated_at: 2026-07-14
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependencies:
  - completed T-253 typed HOF vector relation
  - completed T-254 GraphVector-to-declared-C-program selection
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md
- authority_refs:
  - specification/PRODUCT.md atom criterion
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-HOF.md
  - specification/requirements/gtl/REQ-L-GTL3-RECURSE.md
  - specification/requirements/gtl/REQ-L-GTL3-IDENTITY.md
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md

## Boundary

Close one canonical M01/M02/M03 application relation for the three current
GraphFunction combinators whose operands are not yet represented by complete
first-class declaration data:

```text
recurse(graph_function, termination, foldback)
fan_in(reducer, over)
gate(target, rule, evaluators)
```

Each derived GraphFunction owns exactly one immediate, discriminated
`gtl.graph_function_application` declaration. That declaration is the sole
authority for its exact operand GraphFunction opaque `.id` and every
operator-specific argument. It contains no derived-host ref: the derived
GraphFunction is supplied by declaration containment. A nested constructor
replaces copied application data on the new host; the immediate operand object
retains its own declaration in the admitted root, so same-kind and mixed-kind
application lineage remains complete without duplicate declaration keys.

M02 admits the closed operator variant when present and rejects incomplete,
mixed, legacy-parallel, name-targeted, or unknown claims. M03 recomputes the
applied host's canonical derived identity, validates the exact per-variant
environment, interface, template, effect, and non-application-declaration
equations, resolves the operand by opaque `.id`, and derives an acyclic
application-lineage projection. A selected composition owner may be the current
result itself or exactly one operand in that lineage. Either case yields only a
provisional derived-execution candidate in this ticket. T-255 owns all remaining
`REQ-R-ABG3-FN-COMP-003` host and `owning_declaration_ref` joins before runtime
admission.

This is an atom repair. Consensus supplies demand and fixtures only.

## T-252 Census Gap Ownership

- gap_family: graph_function_combinator_application_lineage

## Entry And Exit

Obtain F_H acceptance of the referenced domain, sequence, and state design
before code. Realization must:

1. publish one closed discriminated application contract with exact `recurse`,
   `fan_in`, and `gate` variants, following the accepted T-253 `fan_out`
   child-reference precedent;
2. make every native constructor derive the immediate operand `.id` from the
   supplied GraphFunction value, author every operator-specific argument in the
   same declaration, remove copied application authority from the new host, and
   emit no legacy parallel `recursion`, `gate`, reducer, or lineage authority;
3. make `gate` target the operand `.id`, never `.name`, and make `fan_in`
   declare its reducer `.id` plus exact vector-boundary contract;
4. make M02 raw admission apply the same closed variant judgments, reject
   malformed or conflicting operator claims, and never infer an application
   from a name, tag, template equality, or composition mismatch;
5. define and enforce exact `recurse`, `fan_in`, and `gate` equations for
   environment, inputs, outputs, template, effects, and non-application
   declarations; the convenience constructors add no effects and preserve a
   non-empty operand effect set exactly;
6. make native construction and M02/M03 raw admission derive and compare the
   same canonical applied-host identity, refusing any caller-supplied or raw id
   that differs from the identity derived from the complete result value;
7. make M03 resolve each immediate operand exactly once in the admitted root,
   validate the complete operator relation and per-variant equations, follow
   mixed- and same-kind source-object chains, and reject missing refs, ambiguity,
   cycles, or altered application semantics;
8. derive one application-lineage projection per admitted application and zero
   to many provisional composition candidates whose eligible declaration owner
   is exactly the current result or one operand-chain member; owner and execution
   subject may lawfully be equal for result-local composition and differ for an
   inherited source-local composition;
9. retain `semantic_not_realized` until T-255 completes every selected
   composition host and owning-declaration join and a later runtime owner
   consumes the compiled relation;
10. prove composition-free raw omission does not invent an operator, while a
   present invalid or legacy operator claim fails closed; and
11. prove the atom with T-252 demand plus non-Consensus same-kind, mixed-kind,
   vector-local, current-result-local, and inherited GraphFunction-local
   fixtures, including a non-empty declared effect set while observing zero
   execution effects.

T-252 may re-author and freeze its body only after this ticket and T-266 close.
Every pre-T-265 body digest, manifest digest, count, and diagnostic total remains
provisional non-closure evidence.

## Non-Closure

- a separate `gtl.graph_function_host_lineage` or other second operand carrier;
- copying an earlier immediate application declaration onto the new derived
  host, or retaining both canonical and legacy operator declarations;
- putting the derived GraphFunction ref inside its own application declaration;
- accepting an applied GraphFunction id that differs from the canonical identity
  derived from its complete environment, interface, template, effects,
  declarations, tags, and application value;
- targeting an operand by name, tag, prefix, path, object position, or caller
  override instead of the supplied GraphFunction opaque `.id`;
- a partial operator declaration whose missing semantics are reconstructed from
  constructor code, tags, prompt prose, or interpreter convention;
- flattening same-kind nesting, overwriting an operand's application semantics,
  or storing a whole lineage chain as authored data;
- excluding a current-result-local composition merely because its declaration
  owner equals its execution subject, or rewriting an inherited source-local
  composition host to make those identities equal;
- self-embedding the applied result id in a current-result-local composition
  instead of deriving local ownership from containment, or treating an inherited
  composition without its exact operand host ref as source-owned;
- selecting a composition owner outside the exact eligible set formed by the
  current result and its ordered operand chain, or using first/nearest/ultimate
  convention instead of exact identity;
- calling a composition binding admitted before all FN-COMP-003 and
  `owning_declaration_ref` joins close in T-255;
- changing composition precedence, C-program selection, vector identity,
  runtime topology, or closure semantics; or
- a Consensus-specific constructor, declaration, diagnostic, or compiler path.

## Explicit Non-Scope

- T-255 final execution handoff and composition admission;
- `workflow.C`, typed HOF runtime, `C.retry`, fan-in reduction, gate evaluation,
  recursion foldback execution, or recursion runtime;
- topology-changing `zoom`/substitution or symbolic-template `promote`;
- new public operation, CLI verb, plugin, scheduler, controller, event, replay,
  archive, or workspace mutation.

## Design Disposition

Accepted by F_H on 2026-07-13 after independent review found no remaining
design defect. Realization is admitted against
`M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md`.

## Closure Disposition

`closed_as_designed` on 2026-07-13. M01 publishes one closed canonical
`gtl.graph_function_application` family for `recurse`, `fan_in`, and `gate`;
M02 applies equivalent raw admission and canonical result identity; M03 derives
the exact application lineage and provisional composition-owner candidates,
then stops at `semantic_not_realized` pending T-255. No runtime consumer,
Consensus-specific path, scheduler, event, replay, archive, or workspace
mutation entered this ticket.

## Closure Evidence

- Native and raw positives cover all three variants, same-kind and mixed
  nesting, complete operator values, exact vector boundaries, non-empty
  declared effects, canonical host identity, and object-order-independent
  native carrier admission.
- Negative proofs cover missing, duplicate, mixed, stale, altered, blank, and
  legacy declaration truth; exact opaque operand lookup; complete result
  equations; cross-host composition without an application path; copied
  ownership without an explicit source host; outside and duplicate-vector
  ownership; and result-local second-application refusal.
- Current-result-local, inherited GraphFunction-local, and inherited
  vector-local composition candidates preserve declaration owner and execution
  subject as separate roles. `owning_declaration_ref` remains explicitly
  provisional with both T-255 pending joins.
- Canonical `D(R)` includes the complete application declaration, making direct
  and multi-hop authored application cycles structurally unrepresentable. The
  compiler visited-set remains a bounded defensive check.
- Focused T-265: 21/21. Standing GTL law: 75/75. Full semantic: 1552/1552.
  Lint, GTL authority guard, generated publication, packed-candidate checks,
  package dry-run, zero-Consensus scan, and `git diff --check` pass.
- Self-review:
  `.ai-workspace/comments/codex/20260712T175525Z_SELF_REVIEW_t265_canonical_graph_function_applications.md`.
- Independent closure review found no remaining blocker, high, or medium
  finding against the accepted design.
