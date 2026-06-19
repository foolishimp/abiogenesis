# ODD SDLC TypeScript Requirement Transform Boundary

Status: ratified implementation design for T-141.

## Purpose

The TypeScript runner separates induction edges from product materialization
edges.

```text
workspace source -> project/intent/product/goals/requirements
requirements + worksite -> declared product asset
```

`derive_requirement_surface` closes when it has produced the requirement
surface it owns. It does not stay open because downstream product files are
missing. Requirement rows may instead be carried as a downstream
transformation set.

## One Consequence Path

The only executable traversal consequence path is:

```text
ConstructionIntent
  -> WorksiteEvidence
  -> SdlcEdgeFulfillmentLedger
  -> SdlcEdgeClosureDecision
  -> SdlcNextActionProjection
```

The ledger records edge-local fulfillment, downstream transformation-set refs,
downstream pressure refs, and downstream target-binding refs. The closure
decision decides whether the current edge closes, yields, retries, repairs,
re-enters, reprices, or blocks. `evaluate_next` consumes that consequence and
selects the next action.

## Requirement Carry Rule

A requirement assessment may carry downstream pressure only when both are true:

- the current edge is an induction edge that is not required to materialize the
  declared product asset;
- the requirement row is recorded as transformation pressure for a later product
  edge.

Carried requirement rows are partitioned out of edge-local convergence. They are
not counted as missing product files on the requirement edge.

## Published Action Law

The runner must not manufacture a product-materialization action from local
constants. The candidate action is derived from the current GTL module:

- find published graph function `Fg_materialize_declared_product_asset`;
- derive its graph-function ref from the module graph function;
- derive its published action ref from the graph-function name;
- derive target-binding refs from the graph-function output asset types;
- admit a candidate only when carried downstream target-binding refs match those
  published output bindings.

If the graph function is unpublished, has no output asset, or does not match the
carried target binding, `evaluate_next` receives no product-materialization
candidate for that pressure. The lawful result is no action or a typed defect,
not fallback to `bootstrap_release_self_test`.

## Target Binding

T-137 owns target-obligation binding semantics. T-141 reuses the same ref shape:

```text
target-binding://odd-sdlc/<asset_type>
```

T-141 does not introduce a second target-binding ledger. It carries binding refs
derived from the published graph function outputs and lets the T-135/T-137
public/evaluator surfaces consume those refs.

## Prompt Boundary

The worker prompt for product materialization should receive:

- selected graph action;
- target asset binding;
- worksite root;
- requirement transformation set;
- expected product evidence.

It should not receive a broad SDLC lifecycle replay as a substitute for that
bounded transformation.
