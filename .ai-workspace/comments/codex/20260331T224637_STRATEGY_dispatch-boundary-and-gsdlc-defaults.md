# STRATEGY: Dispatch Boundary And Gsdlc Defaults

**Author**: codex
**Date**: 2026-03-31T22:46:37+11:00
**Addresses**: GTL/ABG dispatch formalization; `gsdlc` default operator and evaluator policies
**Status**: Draft

## Summary

Formalize dispatch now as a first-class GTL/ABG boundary.

The core design is:

- GTL/ABG own the dispatch contract
- dispatch policy itself may remain plugin/domain-owned
- dispatch decisions must be explicit and replayable
- `gsdlc` declares the default dispatch policies that preserve current behavior

Those default `gsdlc` policies should be:

- operator dispatch default: choose `F_P`
- evaluator dispatch default: cascade `F_D -> F_P -> F_H`

This keeps the current system behavior intact while adding the correct hooks for override through GTL/module/domain configuration.

This post describes target direction, not current ratified law.

## Analysis

### 1. Why dispatch must become explicit

Current runtime behavior already contains dispatch semantics, but they are not formalized as a first-class boundary.

Today:

- vectors declare `operators` and `evaluators`
- jobs make vectors dispatchable work
- runtime traversal performs selection, binding, run lifecycle, and dispatch-like behavior
- evaluator handling has an implicit default cascade
- operator handling has an implicit default `F_P` realization seam

That is enough to run, but not enough to reason about safely as the system grows.

If dispatch remains implicit:

- defaults become confused with language truth
- domain behavior leaks into engine code
- provenance becomes incomplete
- overrides become ad hoc
- it becomes harder to add deterministic or human operators cleanly

Dispatch therefore needs its own explicit boundary, just like selection needed an explicit boundary.

### 2. What GTL/ABG should own

GTL/ABG should own the dispatch boundary, not domain heuristics.

That means GTL/ABG define the shapes and lifecycle:

- `DispatchContext`
- `DispatchDecision`
- `OperatorOutcome`
- `EvaluatorOutcome`
- regime-aware execution hooks
- event/provenance surfaces around those decisions

But GTL/ABG should not own domain-specific policy logic such as:

- when a domain prefers Spark over agent construction
- when a domain prefers immediate human action
- when a domain skips probabilistic assessment for regulated workflows

That policy logic should remain pluggable and domain-owned.

So the architectural rule is:

- black-box policy
- white-box contract

### 3. The dispatch contract

The minimal dispatch boundary should include:

#### `DispatchContext`

Inputs to dispatch resolution, for example:

- vector identity and outer contract
- declared operators and evaluators
- bound worker and role identity
- work key / run id
- current projected asset state
- relevant contexts
- prior evaluator outcomes
- prior operator outcomes or run history
- runtime profile / policy overrides

#### `DispatchDecision`

Replayable dispatch result, for example:

- `kind`: `operator` or `evaluator`
- selected declaration identity
- selected regime
- policy id / policy version
- selected by
- rationale or evidence ref
- key policy inputs used

#### `OperatorOutcome`

Structured result of operator execution, for example:

- selected operator identity
- regime
- execution status
- artifacts produced
- contexts emitted
- execution metadata

#### `EvaluatorOutcome`

This already exists conceptually and should remain the post-operation convergence surface.

### 4. Separation of concerns

Once dispatch is explicit, traversal becomes cleaner:

1. bind the work boundary
2. resolve dispatch decision
3. execute the selected operator
4. run evaluators against the post-operation state
5. reduce to convergence / gap result

That keeps the semantics clean:

- operator performs work
- evaluator judges convergence
- dispatch decides which lane to use
- convergence decides what to do next

These should not be collapsed into one hidden cascade.

### 5. Defaults belong to `gsdlc`, not to GTL/ABG

This is the key policy boundary.

GTL/ABG should not say:

- "operator means `F_P`"
- "evaluator always cascades `F_D -> F_P -> F_H`"

Those are not universal language truths. They are domain defaults.

They should instead be declared by `gsdlc` as the current default methodology policy.

That means:

- GTL law stays general
- ABG runtime stays domain-blind
- `gsdlc` states the practical defaults it wants for its workflow

This preserves the current system while making the assumptions explicit and overridable.

### 6. Proposed default `gsdlc` policies

For compatibility, `gsdlc` should declare:

#### Operator default

If a vector does not override operator dispatch policy, dispatch the `F_P` operator lane.

This mirrors current behavior:

- construction/transformation work is usually treated as probabilistic agent work
- existing `on_fp_dispatch` remains the effective default execution seam

#### Evaluator default

If a vector does not override evaluator dispatch policy, use the current cascade:

1. run `F_D`
2. if unresolved, run `F_P`
3. if still unresolved, escalate to `F_H`

This mirrors current evaluator behavior and preserves existing convergence expectations.

### 7. Why this is better than hard-coding more branches

This design gives the system what it needs without embedding domain logic in ABG:

- `F_D` operators become lawful for known deterministic transforms
  - for example `spark-submit ...`
- `F_P` operators remain the default creative/synthesis lane
- `F_H` operators become lawful for external/manual actions that must happen outside the system
- evaluator behavior can still preserve the current cascade by default
- domains can override dispatch cleanly where needed

This is strictly better than adding more special-case `if regime == ...` logic directly into `iterate()` without a formal boundary.

### 8. Provenance requirements

If dispatch becomes first-class, the following should become explicit runtime facts:

- which operator was selected
- why it was selected
- which policy selected it
- what regime was used
- what artifacts or state changes resulted

Likewise for evaluator dispatch if policy begins to vary.

Without this, dispatch becomes hidden behavior and ABG loses replay clarity.

### 9. Compatibility stance

This strategy should preserve current behavior first, then open the extension points.

That means the implementation sequence should be:

1. formalize dispatch contract
2. implement defaults that reproduce current behavior
3. emit explicit dispatch decisions and outcomes
4. only then introduce richer operator/evaluator override policies

That minimizes behavioral breakage while cleaning up the architecture.

## Recommended Action

Adopt the following direction:

1. Add a first-class dispatch contract to GTL/ABG.
2. Keep dispatch policy pluggable and domain-owned.
3. Require dispatch decisions to be explicit and replayable.
4. Declare `gsdlc` defaults as:
   - operator default: `F_P`
   - evaluator default: `F_D -> F_P -> F_H`
5. Refactor traversal so these defaults are resolved through the new dispatch boundary rather than through hidden engine branching.

This gives the system a lawful dispatch architecture now, while preserving the current `gsdlc` operating model until explicit overrides are introduced.
