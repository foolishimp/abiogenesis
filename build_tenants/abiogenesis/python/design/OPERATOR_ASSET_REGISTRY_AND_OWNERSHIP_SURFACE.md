# Operator Asset Registry And Ownership Surface

**Status**: Active
**Date**: 2026-04-19
**Implements**: `REQ-P-POLICY-010`
**Derives From**: `specification/PRODUCT.md`, `specification/requirements/product/REQ-P-POLICY.md`, `specification/requirements/abg/REQ-R-ABG3-BINDING.md`, `specification/requirements/mapping/REQ-M-GTL3-PROVENANCE.md`

## Position

`asset:<published_handle>` is an operator target family above the ABG runtime.

ABG does not infer asset ownership from local paths, bootstrap scans, or
bind-time `asset_binding_contract`.

Instead, one published operator asset registry resolves an operator-facing
asset handle to one governing traversal boundary. That registry is consumed
through `runtime_config.operator_asset_contract`.

The registry is separate from the existing bind-time asset query:

- `asset_binding_contract` resolves concrete workspace bindings for GTL
  node/asset production at bind time
- `operator_asset_contract` resolves public operator asset handles for
  `gen-start --target asset:<published_handle>`

Those are different surfaces and must not be collapsed.

## Contract

`runtime_config.operator_asset_contract` is a JSON object or mapping with:

- `command`: shell-like command tokens that emit the registry payload as JSON
- `assets_key`: JSON path to the list of registry entries
- `handle_key`: JSON path to the published operator asset handle
- `asset_id_key`: JSON path to the canonical asset id
- `uri_key`: JSON path to the canonical asset URI
- `relative_path_key`: optional JSON path to a relative filesystem location
- `path_kind_key`: optional JSON path to the projected path kind
- `exists_key`: optional JSON path to the projected existence bit
- `owner_kind_key`: JSON path to the governing boundary kind
- `owner_handle_key`: optional JSON path to the governing graph-function handle
- `owner_target_id_key`: optional JSON path to the governing graph-function
  carrier id

The command must emit one JSON payload containing a list of asset registry
entries.

Each entry must publish:

- one non-empty operator asset handle
- one non-empty canonical `asset_id`
- one non-empty canonical `uri`
- one governing boundary under `operator_target`

## Ownership Rule

In the current ABG cut, the only lawful ownership kind is:

- `graph_function`

That means each asset handle must resolve to one published graph-function
carrier boundary through either:

- `operator_target.handle`
- `operator_target.target_id`
- or both, so long as they resolve to the same callable carrier

The graph-function owner must already be public under the graph-function target
catalog. Operator asset addressing does not create new callable carriers.

## Failure Law

Resolution fails closed when:

- the operator asset contract is absent
- the registry command fails
- the registry payload is malformed
- the asset handle is unresolved
- ownership is missing
- ownership kind is unsupported
- ownership points to an unpublished or unknown graph-function carrier
- the same asset handle is published more than once with conflicting authority

## Runtime Projection

When `gen-start` resolves `asset:<published_handle>`, the normalized target
must preserve:

- public asset handle
- canonical `asset_id`
- canonical `uri`
- optional projected path metadata
- one canonical governing graph-function carrier id
- one canonical governing graph-function name

That projection is operator-facing metadata over the same traversal plan. It
must not create a second targeting authority beside the governing carrier.

## Downstream Responsibility

ABG owns the resolution law and fail-closed behavior.

Downstream domains own the registry contents:

- which asset handles exist
- which assets are operator-addressable
- which governing graph-function carrier owns each asset handle

ABG must consume that published truth. It must not invent asset ownership on
behalf of the domain.
