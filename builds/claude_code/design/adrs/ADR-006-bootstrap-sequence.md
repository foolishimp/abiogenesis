# ADR-006: Bootstrap Sequence — Six Phases

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T070000_STRATEGY_abiogenesis-approved-execution-plan.md (Execution Sequence)

## Decision

The build follows six phases. V2+ features are gated behind Phase 5 completion.

| Phase | Goal | Exit condition |
|-------|------|---------------|
| 0 | Ratify the cut | V1_DOCTRINE.md + spec loadable |
| 1 | Constitutional surface | `python spec/packages/genesis_core.py` succeeds |
| 2 | Substrate | emit, project, EventStream, ContextResolver, workspace_bootstrap — tested |
| 3 | Linker | bind_fd → PrecomputedManifest → bind_fp → BoundJob — tested |
| 4 | Asset-producing loop | delta, iterate, schedule; gen-start, gen-iterate, gen-gaps — sandbox E2E passes |
| 5 | Self-hosting | abiogenesis runs its own `code ↔ unit_tests` loop |
| 6+ | V2 features | After Phase 5 only |

V2 features are BLOCKED until Phase 5:
- Multi-tenant scheduling
- Tournament arbitration / consensus engine
- Release workflow (`/gen-release`)
- Spawn/fold-back lifecycle
- Observer/sensory stack

The `.genesis/` bootstrap compiler (genesis_sdlc) manages project state
during Phases 0→4. At Phase 5, it is replaced by the abiogenesis genesis engine itself.

## Consequences

- "But the old system already had X" is not a reason to add X in V1
- eval_six_modules enforces the module count: exactly `core, bind, schedule, manifest, commands, __main__`
- Phase 4 acceptance bar: code assets exist, tests pass, sandbox E2E creates assets, event log truthful
- self_host pytest marker gates Phase 5 tests — they must fail until Phase 5 is complete
