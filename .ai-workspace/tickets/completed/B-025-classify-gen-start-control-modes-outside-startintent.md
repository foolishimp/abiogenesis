# B-025 Classify `gen-start` Control Modes Outside `StartIntent`

- id: B-025
- title: Classify supervision and proxy as orthogonal `gen-start` control modes outside `StartIntent`
- type: feature
- status: completed
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
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-24
- authoritative_contract: public `gen-start` control-mode taxonomy outside `StartIntent`; current control-mode families are `fh_mode` and `root_mode`, both default to `direct`, both are lawful only when `until = converged`
- superseded_surface: implicit adapter-owned control-mode law and historical public flag stories such as `--human-proxy` / `--supervised-root`
- closure_law: policy, product/docs, parser, and control-plane outputs consume the same control-mode families, defaults, legality, and binding status
- producer_set: `REQ-P-POLICY.md`, `PRODUCT.md`, `README.md`, `build_tenants/abiogenesis/python/README.md`, `cli_adapter.py`
- consumer_set: human operators, CLI start parsing, converged control loops, operator docs, CLI tests
- derived_projections: CLI help, examples, legality error payloads, convergence-loop outputs
- old_path_classification: `--human-proxy`=`remove` as public surface; `--supervised-root`=`remove` as public surface; `--fh-mode`=`re-authorize` as adapter binding; `--root-mode`=`re-authorize` as adapter binding; implicit adapter-only taxonomy=`replace`

## Context

Completed capability tickets already introduced real control-plane surfaces:

- supervised probabilistic dispatch
- root supervision over repeated `gen-start` advancement
- live run status projection

The current CLI now exposes control-mode bindings such as:

- `--fh-mode`
- `--root-mode`

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
3. In the current public cut, classify the control modes as:
   - public operator options:
     - `fh_mode = direct | human-proxy`
     - `root_mode = direct | supervised`
   - runtime-configured defaults:
     - `fh_mode = direct`
     - `root_mode = direct`
   - internal or diagnostic surfaces only:
     - historical public flags such as `--human-proxy`
     - historical public flags such as `--supervised-root`
4. Keep the legality rule explicit:
   - `fh_mode` is lawful only when `until = converged`
   - `root_mode` is lawful only when `until = converged`
5. Keep literal CLI flags and spellings below that policy truth. Flags are
   bindings of control modes, not the source of truth for the modes
6. Make `gaps`, `gen-start`, and any retained live-status/control-plane
   surfaces consume the same control-mode taxonomy

## Acceptance

- `StartIntent` remains limited to traversal request truth
- supervision/proxy capabilities are classified as orthogonal control modes
- the public control-mode families are `fh_mode` and `root_mode`
- `fh_mode` defaults to `direct` and currently allows `human-proxy` as its
  non-default public option
- `root_mode` defaults to `direct` and currently allows `supervised` as its
  non-default public option
- both public control-mode families are lawful only with `until = converged`
- literal CLI flags are treated as bindings of those control modes rather than
  as constitutional truth
- no public or product-policy surface conflates traversal request grammar with
  supervision/proxy mode
- completed supervision capabilities from T-004/T-005/T-006 sit inside one
  explicit operator/control-plane taxonomy

## Post-Closure Trace Note

On 2026-04-24, the primary operator loop was made explicit as interactive work
with an agentic coder CLI surface where the operator can remove ambiguity or a
roadblock and then restart the lawful `gen-start` / `gen-gaps` cycle.

This completed ticket is the closed source anchor for keeping that loop honest
about control ownership:

- `fh_mode` and `root_mode` stay outside `StartIntent`
- the operator loop may bind human-proxy and supervised control modes without
  turning them into rival request grammar
- the loop remains one `gen-start` story instead of a second hidden control
  surface beside it
