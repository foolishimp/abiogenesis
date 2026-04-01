Recursive runtime indexing update.

What changed:

- `genesis.events.EventStream` now caches the event log in-process and
  invalidates that cache when the underlying file changes externally.
- `genesis.frames` now maintains an incremental recursive frame/state index over
  authoritative events. Active/open frame discovery and current recursive state
  lookup no longer rebuild from full event replay on the normal hot path.
- `genesis.interpret` now maintains an incremental recursive execution index for
  certified child keys, completed frame steps, rebound frames, and closed
  frames. `advance_recursive_frames(...)` uses that index rather than scanning
  the whole event list to rediscover those control sets each pass.

Behavioral consequence:

- Recursive planning and frame advancement now read current continuation,
  frontier, active-frame, and execution-bookkeeping truth from incremental
  indexes backed by authoritative events.
- Full event replay remains the recovery/projection mechanism, but it is no
  longer the normal semantic hot path for recursive progression in the live
  interpreter loop.

Regression repaired during the cut:

- External `assess-result` writes could be hidden if the local process appended
  after a stale cached read. `EventStream.append(...)` now detects external file
  drift and invalidates the local cache before writing.

Verification:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `24 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_usecases_fake.py -q -k gsdlc_lite_design_review_reset_replays_edge`
  - `1 passed, 9 deselected`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `112 passed, 5 deselected`

Residual note:

- Recursive machine state is now explicit and incrementally indexed, but nested
  recursive descent is still represented as linked invocation frames keyed by
  lineage/work_key rather than one monolithic multi-frame in-memory stack
  object. The continuation/frontier control surface is materially closer to the
  approved tail-loop design, but that representational distinction still exists.
