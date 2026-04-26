# REVIEW: T-071/T-073 ABG TypeScript Readiness Under STDO

**Author**: Codex
**Date**: 2026-04-26T11:41:25Z
**Status**: Review
**Scope**: T-071 original dependency chain, T-072/T-073 requalification chain,
B-031 blocker closure, and B-016 TypeScript hook-standardization slice.

## Review Basis

Strict STDO means:

- **S**: `SPEC_METHOD.md` authority chain and live ABG/GTL requirements.
- **T**: `TICKET_METHOD.md` closure law, proof surface, negative proof, and
  completed-ticket truth.
- **D**: `DESIGN_MODULE_METHOD.md` carrier ownership, authority seam closure,
  essential carrier consolidation, ingress collapse, and effect-edge law.
- **O**: `ODD_METHOD.md` graph functions as constructive carrier and ABG as
  traversal/runtime truth owner.

T-071 originally depended on T-060 and T-065 through T-070. Because T-071 was
later repriced by T-073 after the T-066 harness-loop false positive, this
review also includes B-031, T-072, T-073, and the current B-016 TypeScript
closure record.

## Findings

### 1. High: F_P preserved-result re-entry still redispatches the same vector

`REQ-R-ABG3-RUN-008` requires a fresh re-entry with a valid already-attested
`F_P` result to validate and ingest that attestation rather than redispatching
the same probabilistic turn:

- `specification/requirements/abg/REQ-R-ABG3-RUN.md:30`

T-072 also made this an explicit closure criterion and proof lane:

- `.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md:47`
- `.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md:62`

Current code does not close that path. `resultAssessment` emits `assessed`
events:

- `build_tenants/abiogenesis/typescript/code/src/app/m04/result_assessment/constructors.ts:150`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/result_assessment/constructors.ts:157`

Projection records assessed edges but does not use them to advance:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts:160`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts:181`

The engine F_P branch then dispatches again:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts:236`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts:262`

I reproduced the behavior in the current built tree:

```text
firstTransition: fp_dispatch
secondTransition after assessed event: fp_dispatch
second planned edge: input_set→requirements
assessedEdges: [input_set→requirements]
closedVectorIndexes: []
```

This is a real closure gap, not just missing polish. The current RC/readiness
claim is green for F_D engine-owned iteration, but not for preserved F_P
attestation re-entry.

### 2. High: B-016/T-072 plugin inventory overclaims governed seams

The inventory declares broad hook families:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts:576`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts:736`

But the runner only accepts three concrete plugin seams:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts:142`

Those are:

```text
fdEvaluator
fpDispatch
fhAdmission
```

The inventory also lists result assessment, event ingress, continuation repair,
policy provider, runtime identity provider, operator asset resolver, context
resolver, projection consumer, and hook ref. Those entries are useful design
inventory, but they are not all currently wired through the `EngineRunnerPluginSet`.

The proof does not close the gap. The inventory test checks one row per kind,
non-empty proof-reference strings, and authority flags:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_plugin_contract_inventory_unit.test.mjs:16`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_plugin_contract_inventory_unit.test.mjs:26`

The negative plugin test is generic over explicit authority flags:

- `build_tenants/abiogenesis/typescript/test_env/tests/t072-m03-plugin-contract-negative.test.mjs:103`

It does not prove each listed seam has a focused positive and negative runtime
consumer proof, despite T-072 requiring that:

- `.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md:55`
- `.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md:69`

This is a Ticket/Design closure defect. The inventory is valuable, but the
closure wording should distinguish:

```text
implemented runner plugin seams: F_D, F_P, F_H
classified but not fully migrated hook families: the remaining inventory rows
```

### 3. Medium: F_P dispatch plugin may perform effects before event truth exists

In the F_P branch, the runner invokes the dispatch plugin before emitting
`fp_dispatch_requested`:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts:245`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts:262`

If a real `FpDispatchPlugin.dispatch(...)` performs the external worker
dispatch as an effect, the side effect can happen before runtime event truth is
appended through `emit(...)`:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/emit.ts:22`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/emit.ts:27`

That is an effect-boundary risk under `DESIGN_MODULE_METHOD.md`. The safer law
is:

```text
ABG emits dispatch intent/event truth
-> effect adapter observes or consumes admitted dispatch truth
-> provider performs dispatch
-> provider result re-enters through admission
```

The current implementation can still be lawful if `FpDispatchPlugin.dispatch`
is interpreted as producing an inert dispatch outcome rather than performing
the effect. The contract does not enforce that interpretation.

### 4. Medium: B-016 closure state is inconsistent across records

The requalification comment says:

- `.ai-workspace/comments/codex/20260426T205435Z_REQUALIFICATION_typescript_abg_rc_after_engine_iterate_repair.md:97`

```text
B-016 remains open for the broader hook inventory.
```

But the B-016 ticket is in `completed` status:

- `.ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md:6`
- `.ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md:19`

And the B-016 closure comment says:

- `.ai-workspace/comments/codex/20260426T111002Z_CLOSURE_b016_typescript_ioc_hook_standardization.md:5`

```text
B-016 is closed for the current TypeScript ABG build tenant surface.
```

This is commentary/ticket drift. It does not break runtime code, but it weakens
the closure story for anyone reading the gate later.

### 5. Low: B-016 authority regression test is source-text based

The B-016 regression test reads `public_start.ts` as text and searches for
specific forbidden strings:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_b016_ioc_hook_authority.test.mjs:15`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_b016_ioc_hook_authority.test.mjs:26`

That is acceptable as a cheap guard, but it is not a strong semantic proof. It
would miss aliasing, indirect imports, or a different spelling of the same
authority path. It should stay supplemental to behavioral/structural proof,
not primary closure evidence.

## Positive Review Notes

The core repair direction is correct.

- `publicStart(...)` is now a compatibility adapter over `startFromRequest(...)`:
  `build_tenants/abiogenesis/typescript/code/src/app/m04/public_start.ts:19`
- `startFromRequest(...)` delegates to M03 `runEngineStart(...)`:
  `build_tenants/abiogenesis/typescript/code/src/app/m04/start.ts:59`
- `runEngineIterate(...)` is the single new repeated traversal owner for the
  TypeScript slice:
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts:125`
- `publicControlLoop(...)` calls `startFromRequest(...)` once and projects the
  public outcome rather than owning a traversal loop:
  `build_tenants/abiogenesis/typescript/code/src/app/m04/control/control_loop.ts:22`

The old M04 public-start lower-runtime path has been removed. That is the most
important ODD/STDO correction in this slice.

## Size And Shape

Measured against current `HEAD` plus untracked ticket assets in the worktree:

| Surface | New lines | Deleted lines | Notes |
| --- | ---: | ---: | --- |
| Production TypeScript | 1,412 | 352 | tracked source `+160/-352`; new source files 1,252 lines |
| Test source | 846 | 23 | tracked tests `+132/-23`; new test files 714 lines |
| Test metadata/package | 131 | 7 | `package.json` and `test_surface_map.md` |
| Tracked docs/spec/tickets | 574 | 351 | current worktree delta |
| New in-scope design/ticket/readiness/commentary | 2,297 | 0 | excludes unrelated timed-GTL strategy post |

New production TypeScript files:

- `abg/m03/contracts/plugins.ts`: 788 lines
- `abg/m03/runner/engine_runner.ts`: 336 lines
- `abg/m03/runner/index.ts`: 6 lines
- `app/m04/start.ts`: 91 lines
- `app/m04/start_context.ts`: 31 lines

Function/type count over the new production TypeScript files:

- 29 named function declarations
- 15 exported functions
- 14 private helper functions
- 20 exported type/interface declarations
- 5 exported constants

New focused ticket test files contain 19 `node:test` cases.

## Imperative Drift Review

There is not a broad return to Python-style imperative scaffold.

Observed imperative coordination in production touched source is narrow:

- one `while (true)` in `runEngineIterate(...)`
- one `for` loop over forbidden plugin-authority fields
- localized mutable arrays in the runner to collect emitted/replay events

The `while (true)` is acceptable only because:

- it lives in M03 engine runtime, not downstream product code
- it derives projection every turn
- next-vector selection comes from replay truth
- it is bounded by graph vector count as a guard, not used as vector-selection
  authority

The remaining drift risk is not the existence of a loop. The drift risk is
where side effects and re-entry behavior are still not fully carrier/event
owned:

- F_P preserved-result re-entry still redispatches
- F_P dispatch plugin effect timing is not event-first by contract
- plugin inventory has broader claims than wired runner seams

## Verification Run During Review

Ran from `build_tenants/abiogenesis/typescript`:

```text
npm run test:t072
tests 12
pass 12
fail 0

npm run test:b016
tests 11
pass 11
fail 0

npm run lint:semantic
pass

npm run test:semantic
tests 233
pass 233
fail 0

git diff --check
pass
```

I did not rerun the two live `CODEX_LIVE_FP=1` gates in this review pass.

## Verdict

T-072 fixes the central false-positive: ABG now has an engine-owned
`start -> iterate` path for F_D graph-function traversal, and M04 no longer
owns the lower runtime loop.

The T-071/T-073 readiness claim is not fully clean under strict STDO if it is
read to include preserved F_P result re-entry or full B-016 hook migration.

Recommended closure correction:

1. Open a bug for `F_P assessed-result re-entry closes or lawfully advances the
   active vector instead of redispatching`.
2. Reprice B-016 wording to separate implemented runner plugin seams from
   classified-but-not-migrated hook families.
3. Decide whether F_P dispatch plugins are inert outcome producers or effectful
   providers; if effectful, move dispatch effect behind admitted dispatch event
   truth.
4. Clean up the B-016 open/closed wording conflict between T-073 and the B-016
   closure record.

The direction is right. The remaining defects are not a return to imperative
SDLC scaffolding, but they are real authority-seam gaps.
