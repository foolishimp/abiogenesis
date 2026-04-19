# B-025 Classify `gen-start` Control Modes Outside `StartIntent`

- id: B-025
- title: Classify supervision and proxy as orthogonal `gen-start` control modes outside `StartIntent`
- type: feature
- status: backlog
- goal: control-plane-mode-normalization
- change_intent: Publish one truth for `gen-start` control modes created by earlier supervision capabilities. Human proxy, root supervision, and similar execution-control modes shall be modeled as orthogonal product-policy surfaces around `gen-start`, not as members of `StartIntent` and not as rival command truth.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: high
- intake_source: ABG operator-model audit 2026-04-19 after review of completed T-004/T-005/T-006 and current CLI control surfaces
- dependencies: B-021, B-022
- affected_boundary: product policy requirements, `cli_adapter.py` control-mode flags, run/control-plane projections, operator docs
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- updated_at: 2026-04-19

## Context

Completed capability tickets already introduced real control-plane surfaces:

- supervised probabilistic dispatch
- root supervision for `start --auto`
- live run status projection

The current CLI now exposes flags such as:

- `--human-proxy`
- `--supervised-root`

Those are real capabilities, but they were not introduced as part of one
normalized operator request model.

That leaves an open ambiguity:

- what belongs to `StartIntent`
- what belongs to product-policy control mode
- what is merely one literal CLI binding of those modes

## Problem Statement

ABG does not yet publish one lawful classification for `gen-start`
control modes.

Without that classification:

- supervision or proxy flags can be mistaken for traversal-request fields
- control-mode semantics can drift independently across CLI, docs, and live
  status surfaces
- completed supervision capabilities remain structurally real but
  constitutionally under-described

## Required Direction

1. Publish one explicit taxonomy for `gen-start` control modes:
   - traversal request grammar belongs to `StartIntent`
   - supervision/proxy/recovery behavior belongs to product-policy control mode
2. Keep control modes outside `StartIntent`
3. Decide which control modes are:
   - public operator options
   - runtime-configured defaults
   - internal or diagnostic surfaces only
4. Keep literal CLI flags and spellings below that policy truth. Flags are
   bindings of control modes, not the source of truth for the modes
5. Make `gaps`, `gen-start`, and any retained live-status/control-plane
   surfaces consume the same control-mode taxonomy

## Acceptance

- `StartIntent` remains limited to traversal request truth
- supervision/proxy capabilities are classified as orthogonal control modes
- literal CLI flags are treated as bindings of those control modes rather than
  as constitutional truth
- no public or product-policy surface conflates traversal request grammar with
  supervision/proxy mode
- completed supervision capabilities from T-004/T-005/T-006 sit inside one
  explicit operator/control-plane taxonomy
