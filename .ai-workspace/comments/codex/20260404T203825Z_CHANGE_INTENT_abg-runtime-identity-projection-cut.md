# CHANGE INTENT — ABG Runtime Identity Projection Cut

**Date**: 2026-04-04
**Change class**: requirements_design_reprice
**Authority stack**:
- `workspace://specification/requirements/abg/REQ-R-ABG2-WORKER.md`
- `workspace://specification/requirements/abg/REQ-R-ABG2-PROVENANCE.md`
- `workspace://build_tenants/abiogenesis/python/design/adrs/ADR-031-runtime-identity-and-configured-worker.md`
- `workspace://build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
- `workspace://build_tenants/abiogenesis/python/design/README.md`

This slice reprices requirements and design under the existing intent. It does
not change `INTENT.md`.

## Problem

The repo now teaches that runtime identity is structured and that `build` is a
reporting projection only, but the live code still synthesizes `build` from
`worker_id` or `engine_id` through `legacy_build_id()`. That keeps one stale
fallback center alive in `Scope`, `TraversalRuntime`, event payloads, and scope
reporting.

## Chosen doctrine

- Canonical runtime identity is preserved in structured fields:
  - `engine_id`
  - `worker_id`
  - `backend_id`
  - `authority_ref`
  - `assignment_source`
  - `resolved_runtime_ref`
- `build_id` is optional declared reporting metadata.
- `build` is a projection of explicit `build_id` only.
- ABG shall not synthesize `build` from `worker_id` or `engine_id`.
- Worker derivation may default from canonical execution identity when no
  worker input is supplied, but that default shall not backfill `build`.
- Runtime-contract identity input is the canonical `runtime_*` field family,
  not the legacy flat aliases.
- Runtime summaries and emitted reporting fields may include `build` only when
  `build_id` was explicitly declared by the control plane or caller.

## Re-entry point

1. reprice worker/provenance/design truth surfaces
2. refactor `identity.py`, `services.py`, `interpret.py`, and CLI/runtime loaders
3. update runtime-identity tests and scope/reporting expectations
4. verify and sweep residual `legacy_build_id` / fallback synthesis drift
