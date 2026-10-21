# M05 Attached F_P Local Live Sandbox Derivation

**Status**: Active
**Date**: 2026-04-27
**Purpose**: Derive a local live installed-sandbox proof for the T-084
attached F_P worker loop.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/product/REQ-P-QUAL.md`
- `specification/requirements/product/REQ-P-SCENARIOS.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md`
- `M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_SANDBOX_DERIVATION.md`
- [T-085](../../../../.ai-workspace/tickets/backlog/T-085-prove-attached-fp-loop-through-local-live-installed-sandbox.md)

## Position

T-084 proves the attached F_P loop at the engine/package semantic test layer.
The local live sandbox proves the same capability through an installed target
workspace and package import surface.

This proof is live in the local installed-runtime sense:

- it provisions an install-shaped target workspace
- it installs the TypeScript package into that target
- it runs a Node process from the target root
- it imports `@abiogenesis/typescript-tenant` from the target package binding
- it writes sandbox artifacts and archive evidence

It is not a real external LLM live lane and must not be cited as data_mapper
qualification evidence.

## Required Behavior

The sandbox constructs one composed three-stage graph function and runs it under
F_P policy through `publicStart(...)` with an attached worker plugin.

The first edge deliberately blocks on the first attempt. The second attempt
must prove it received replay-fed retry attempt and retry progress refs before
it may return a fulfilled result. The remaining edges return fulfilled results.

The run passes only when ABG-owned event truth shows retry/continuation/progress
facts, assessed closure, and terminal convergence without a caller-owned loop
around public start.

