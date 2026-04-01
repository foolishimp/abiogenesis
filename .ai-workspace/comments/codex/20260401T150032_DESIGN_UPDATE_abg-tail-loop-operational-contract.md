# ABG Tail-Loop Operational Contract

Date: 2026-04-01

## Intent

Make the ABG recursive realization explicit at the design layer so alternate
ABG implementations preserve the same recursive semantics, operational
characteristics, and observable artifacts.

## Changes

- Tightened `REQ-R-ABG2-INTERPRET-011` to say recursive interpretation in ABG
  progresses as tail-loop recursion over explicit continuation and
  child-frontier state.
- Updated `GTL_2_INTERFACE_CONTRACTS.md` to say the canonical ABG realization of
  `recurse(...)` is tail-loop recursion over continuation/frontier state rather
  than ambient call-stack state.
- Added a dedicated `Recursive Operational Contract` section to
  `GTL_2_MODULE_DESIGN.md` covering:
  - operational characteristics
  - canonical recursive artifacts
  - portability rule for alternate ABG implementations, including AWS-native
    realizations

## Canonical Artifacts

- Structural runtime artifacts:
  `InvocationFrame`, `FrameStep`, `RecursiveContinuation`, `ChildFrontier`,
  `RecursiveInterpreterState`
- Recursive lifecycle events:
  `frame_opened`, `frame_step_started`, `frame_step_completed`,
  `frame_foldback`, `frame_rebound`, `frame_closed`
- Resumability artifacts:
  continuation/frontier checkpoints or equivalent resumable records, provided
  they remain derived from authoritative causal truth

## Review Focus

- `specification/requirements/abg/REQ-R-ABG2-INTERPRET.md`
- `build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md`
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
