# B-023 Publish Lawful Public Graph-Function Handle Addressability For `gen-start`

- id: B-023
- title: Publish lawful public graph-function handle addressability for `gen-start` without collapsing callable carriers into candidate-family selection
- type: feature
- status: completed
- goal: public-graph-function-targeting
- change_intent: Realize the already-ratified public graph-function target family for `gen-start` while preserving GTL identity and selection law. Operator-facing handles shall resolve through a published target catalog whose canonical referent is one published callable carrier `target_id`. Raw declaration labels shall not become target authority, and graph-function targeting must not become a hidden-choice escape hatch.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- intake_source: operator UX direction 2026-04-19 after ABG B-018 review
- dependencies: B-021, B-022
- affected_boundary: product/operator target-addressing model, published graph-function target catalog, callable-carrier publication, identity-preserving resolution, traversal planning
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-19
- authoritative_contract: `graph_function:<published_handle>` resolves through a published target catalog to one job-bound callable-carrier `target_id`
- superseded_surface: raw declaration-name targeting, publication of unbound helper graph functions, and any hidden candidate-family choice through graph-function addressing
- closure_law: only published handles bound to public callable carriers resolve; ambiguity and unpublished helpers fail closed; graph-function targeting does not collapse into candidate-family selection
- producer_set: published `GraphFunction` operator handles, GTL semantic jobs/contracts, `services.published_graph_function_target_catalog(...)`
- consumer_set: `resolve_start_target(...)`, `gen_start(...)`, operator asset ownership resolution, CLI target binding
- derived_projections: `gen-start` target metadata, CLI help/examples, target-resolution tests
- old_path_classification: raw declaration labels as target authority=`replace`; unbound helper publication=`remove`

## Context

Operators want to be able to say:

- `gen-start --target graph_function:<published_handle>`

That is lawful only if ABG preserves the existing GTL distinction between:

- a published `GraphFunction` bound by a semantic `Job`, which is a public
  callable carrier
- a `CandidateFamily`, which is a selection boundary over lawful alternatives

Those are not the same structural surface.

## Problem Statement

ABG product truth now ratifies public graph-function targeting, but the live
design/realization cut still has to enforce that target law exactly.

Without that contract:

- graph-function targeting risks leaking internal realization labels
- targeting could accidentally collapse public callable carriers into hidden
  candidate-family choice
- operators could gain a misleading sense that a declaration `.name` is a
  lawful targeting authority even though GTL targeting is identity-backed
- multiple semantic jobs could bind the same callable carrier and force hidden
  runtime choice unless handle resolution fails closed on ambiguity

## Required Direction

`gen-start --target graph_function:<handle>` should target only published public
callable graph functions through a published operator handle surface.

That means:

- `<handle>` must resolve through a published target catalog
- the catalog entry must carry one canonical callable-carrier identity, i.e.
  the published `GraphFunction.id` / semantic `ContractRef.target_id`
- `<handle>` must resolve to one published public callable carrier identity in
  the selected scope
- not to an unpublished helper graph function
- not to a raw graph vector
- not to an implicit candidate-family alternative
- not to a bare declaration `.name` with no published operator handle authority
- not to multiple lawful semantic work bindings without an explicit higher
  addressing surface to disambiguate them

Module-scoped names may be published as operator aliases only if the published
catalog still resolves them to one canonical target id. Module-scoped names
alone are not the source of truth.

If explicit operator-facing candidate-family selection is ever required, that
should be modeled as a separate target family with its own publication law,
not smuggled into `graph_function:<handle>`.

## Acceptance

- `graph_function:<handle>` works only through published operator handles that
  resolve to published public callable carriers
- the source of truth for resolution is a published target catalog whose
  canonical referent is one callable-carrier target id
- internal or unpublished graph functions are rejected
- raw declaration labels are not treated as target authority without an
  explicit published handle
- ambiguous handle resolution fails closed rather than silently choosing among
  multiple semantic work bindings
- target resolution does not collapse callable carriers into candidate-family
  selection
- the resulting traversal plan stays aligned with existing GTL callable-carrier
  and selection-boundary law
