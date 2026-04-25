# abiogenesis 3.4.0-rc.1 RC Notes

This note records accepted RC behavior for the current `v3.4.0-rc.1` cut.

## Accepted Framework Behavior

### TypeScript Is A Package-First RC Carrier

The TypeScript tenant is released as a package-first realization. Public
consumers should treat the package exports and binary aliases as delivery
bindings over the same GTL/ABG product grammar, not as a separate product law.

Accepted public delivery bindings:

- package root: `@abiogenesis/typescript-tenant`
- public binary aliases:
  - `abiogenesis-ts`
  - `genesis-ts`
- supported command suffixes:
  - `start`
  - `gaps`
  - `assess-result`

### Public Gaps Is Replay-Derived Observation

`gaps` is now a supported TypeScript operator command.

Accepted behavior:

- loads the installed runtime binding
- reads replayed runtime events
- projects open, partial, and converged work from module/job/vector truth
- remains read-only
- does not start traversal
- does not append runtime events
- does not reintroduce downstream product labels such as `proof_hold` as
  TypeScript `M04` substrate taxonomy

### External-Live Qualification Is A Release Gate

The RC gate includes real F_P transport, not only deterministic source tests.

Accepted behavior:

- the RC live portfolio covers five Python live scenario families
- the RC live portfolio covers twelve external-live stages
- each stage opens public dispatch truth and ingests a live worker artifact
- skipped live portfolio readiness is not a valid RC closure result
- the retained single-edge live UAT lane remains runnable as a direct command

### Deferred M06 Has No RC Obligation

`M06` trigger law is explicitly deferred. This RC does not claim executable
trigger semantics.

## Current Verification Footer

The current RC proving footer is:

- `npm run test:semantic`: `202 passed`
- `npm run lint:semantic`: `passed`
- `CODEX_LIVE_FP=1 npm run test:live`: `1 passed`
- `CODEX_LIVE_FP=1 npm run test:live:uat`: `1 passed`, `0 skipped`
- `git diff --check`: `passed`
