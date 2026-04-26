# B-016 Closure Review: TypeScript ABG IoC Hook Standardization

## Decision

`B-016` is closed for the current TypeScript ABG build tenant surface.

The reopen concern was valid: TypeScript had an ABG-owned runner after `T-072`,
but `publicStart(...)` still preserved a rival M04 path that derived
advancement and emitted traversal facts directly.

That rival path is now removed.

## What Changed

- `publicStart(...)` is now a compatibility adapter over `startFromRequest(...)`.
- Shared public-start context and sink admission moved to
  `app/m04/start_context.ts`.
- `public_start.ts` no longer imports or calls lower M03 execution-basis,
  transition, iteration-decision, event-construction, or `emit(...)` functions.
- Existing public-start callers now observe engine-owned convergence rather
  than the old one-transition `advanced` result when a graph function fully
  closes.
- Live-status, asset-addressing, and common-library tests were updated to treat
  public-start convergence as the lawful result.

## Hook Inventory

The TypeScript ABG plugin inventory is represented in
`abg/m03/contracts/plugins.ts` and covers the current declared hook families:

- runtime event sink
- F_D evaluator
- F_P dispatch
- F_H admission
- result assessment
- event ingress
- continuation repair
- policy provider
- runtime identity provider
- operator asset resolver
- context resolver
- projection consumer
- GTL hook reference

Each inventory entry declares:

- admitted contract
- authority family
- engine-owned law
- plugin-owned scope
- positive proof reference
- negative proof reference
- collapse family
- distinct-authority reason when the seam is not an effect plugin

## Design-Method Evidence

The design-method surface is present:

- `M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_PUBLIC_START_DERIVATION.md`
- `M04_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_CONTROL_LOOP_DERIVATION.md`

The public-start documents now state that `publicStart(...)` is only a
compatibility adapter and may not own one-transition runtime law.

## Proof

Passed:

```text
npm run test:b016
11 passed

npm run test:t072
12 passed

npm run test:t012
9 passed

npm run test:t013
10 passed

npm run test:semantic
233 passed

npm run lint:semantic
passed

CODEX_LIVE_FP=1 npm run test:live:uat
1 passed, 0 skipped, duration_ms 26102.398958

CODEX_LIVE_FP=1 npm run test:live
1 passed, 0 skipped, duration_ms 156791.36625
```

The specific B-016 regression proof is
`test_b016_ioc_hook_authority.test.mjs`.

It proves:

- `publicStart(...)` delegates to `startFromRequest(...)`.
- `public_start.ts` does not contain lower M03 authority calls such as
  `admitExecutionBasis`, `deriveAdvancementTransition`,
  `runtimeEventsForIterationDecision`, vector event constructors, or
  `emit(...)`.

## Residual Rule

This closure does not authorize future ad hoc hook shapes.

Any new TypeScript ABG extension seam must either:

- enter through the existing `EnginePluginContract` family, or
- open a narrow boundary ticket explaining why the seam has distinct authority.

No downstream tenant may own traversal selection, iteration, runtime event
authority, graph-function closure, retry policy, or continuation law.
