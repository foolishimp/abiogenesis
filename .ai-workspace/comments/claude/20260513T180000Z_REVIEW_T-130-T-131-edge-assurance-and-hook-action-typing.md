# REVIEW: T-130 + T-131 — Hook-Action Typing and Edge Assurance Contract

**Author**: claude
**Date**: 2026-05-13T18:00:00Z
**Addresses**:
- `.ai-workspace/tickets/active/T-130-define-recorded-hook-action-typing-model-for-fp-evals.md`
- `.ai-workspace/tickets/active/T-131-declare-gtl-edge-assurance-contract-for-fp-gain-and-close.md`
**Status**: Open

## Summary

Design is on-target. `EdgeAssuranceContract` + `EdgeAssuranceAbsentiaResolution` + `HookActionRecord` + `HookFindingAdmission` + `FpEdgeAssuranceEvalFinding` together land the GTL-native edge contract and the ABG-owned admission boundary the Codex parity post pushed for. Carriers are immutable, parsing fails closed on shape violations, F_P cannot smuggle engine authority, and the F_H absentia path is the lawful default for missing contracts. Proof: `npm run test:t130:t131` passes 17/17 (build:semantic clean, 85ms).

Findings below are mostly code-quality and ticket-paperwork tightening, plus one acceptance-coverage cross-reference between T-130 and T-131.

## Verified by execution

- All 17 tests pass: 6 T-130 + 11 T-131 (precedence, absentia, malformed fail-closed, eval finding shape, edge projection, F_P-close cannot override assurance retry, rejected/unadmitted reject, plugin input resolution, transform-vs-eval hook class rejection).
- Spec alignment confirmed against `REQ-L-GTL3-GRAPHVECTOR-012`, `REQ-L-GTL3-HOOKS-014`, `REQ-L-GTL3-EVALUATOR-007`, `REQ-R-ABG3-ASSURANCE-028/029/030`, `REQ-R-ABG3-PAYLOAD-018`, and `PRODUCT.md` L88-115. Each cited requirement clause matches a corresponding carrier field or fail-closed rule.

## Code findings

### C1. `edge_assurance_contract.ts:447-453` — `selectionRef` should use `stableJson`

`JSON.stringify(input)` relies on insertion order. The same file already defines `stableJson` (L203-216) and uses it for `digestForValue`. Selection refs are replay-visible identity for `EdgeAssuranceContractSelection` and should not depend on engine-specific key ordering.

```ts
function selectionRef(input: {...}): string {
  return `edge-assurance-contract-selection:${JSON.stringify(input)}`;
}
```

Fix: `return \`edge-assurance-contract-selection:${stableJson(input)}\`;`. Currently safe in practice because the call site constructs the object with literal property order, but the convention should match the digest.

### C2. `plugins.ts:555-576` — synthetic `Module` construction is fragile

`constructEnginePluginInput` builds an empty `Module` with twelve empty frozen arrays just to thread `policyHooks` + `name` into `resolveEdgeAssuranceContract`:

```ts
module: Object.freeze({
  name: input.basis.moduleName,
  graphs: Object.freeze([]),
  graphFunctions: Object.freeze([]),
  refinementBoundaries: Object.freeze([]),
  // ... 9 more empty arrays
  policyHooks: input.basis.modulePolicyHooks,
  metadata: Object.freeze({ entries: Object.freeze([]) })
})
```

Any new field on `Module` adds a default here. Fix: have `resolveEdgeAssuranceContract` accept a narrow `{ moduleName, modulePolicyHooks }` (or a `ModulePolicySource` interface) instead of a full `Module`. The resolver only reads `module.policyHooks` and `module.name`, so the wide type is over-fetching.

### C3. `edge_assurance_contract.ts:887-933` — duplicates `assertHookFindingAdmissionMatchesAction`

When `admission` is non-null (L920-932), `assertFpEdgeAssuranceEvalFindingMatchesHookAction` re-checks `admission.hookActionRef` and `admission.findingRef`. Both are already validated by `assertHookFindingAdmissionMatchesAction` (`hook_actions.ts` L392-414). Fix: delegate to that function for the admission branch; keep the eval-specific checks (hookClass === "eval", evalFpContractRef match) inline.

### C4. `edge_assurance_contract.ts:351-353 + 362-401` — `contractFromHookRef` parses required list fields twice

`REQUIRED_LIST_FIELDS` (L180-184) is iterated upfront to call `configStringList`, then the contract-construction block calls `configStringList` again on the same three keys. Functionally fine; cost is small. Pick one: either drop the upfront loop, or use it to short-circuit shape failure cheaply before deeper scalar parsing.

### C5. `edge_assurance_contract.ts:485-491` — hard-coded F_H absentia action refs

```ts
requiredHumanActionRefs: freezeStringArray([
  "fh://edge-assurance/declare-close",
  "fh://edge-assurance/declare-continuation",
  "fh://edge-assurance/direct-worksite-transform"
])
```

These strings are inlined in `absentiaResolution`. Fix: export as `FH_ABSENTIA_HUMAN_ACTION_REFS` (frozen) or derive from a policy ref. Downstream consumers and future tests cannot reference the exact set today without re-typing the strings.

### C6. `edge_assurance_contract.ts:966-995` — `nextActionBasisRefs` branch asymmetry is unexplained

- `close` → `[compositionContributionRef]`
- `qualified_defer` → `[...continuations, ...residuals, composition]`
- default (retry / repair / re_enter / reprice / block / yield / fh_required) → `[...continuations, ...residuals, ...authorities]`

Why does `qualified_defer` include composition but the default not, and why does the default include authorities but `qualified_defer` not? Either add a one-line comment naming the intent (composition is the next contract input for downstream traversal; authorities are the basis for re-entry), or normalize so each disposition's basis ref list is derived from a small declared mapping rather than a free-form switch.

### C7. `edge_assurance_contract.ts:43-53` — `fh_required` disposition is overloaded

Both `EdgeAssuranceAbsentiaResolution.disposition` (no-contract path) and `FpEdgeAssuranceEvalFinding.closeDisposition` (contract present, F_P proposes F_H) land on the same `fh_required` symbol. Two distinct semantics share the enum value:

- absentia: *the system never knew how to close* → routing to F_H is structural.
- F_P-proposed: *the system has a contract; F_P escalates* → routing to F_H is a judgment under the contract.

Downstream consumers must already disambiguate by carrier kind, but the enum collapse will bite when a closure-router has to project both into one read model. Fix: rename one (`fp_proposes_fh` on the eval finding, or `fh_absentia` on the absentia resolution), or add a short prose note in `M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md` so the collapse is intentional and documented.

## Test coverage findings

### T1. `test_t131:503-537` — `nextActionBasisRefs` only tests the `close` branch

The `qualified_defer` branch in C6 has no exercising test. The default branch is exercised via `T-131 F_P proposed close cannot override an assurance retry fold` (L539-567), but `qualified_defer` semantics — *composition refs travel with the defer* — is asserted nowhere. Add one case.

### T2. No test for `configDigest` stability

`digestForValue` (`edge_assurance_contract.ts` L218-220) uses `stableJson`, so two identical contracts should produce equal digests. There is no test asserting that, nor a test asserting that two differing contracts yield different digests. Smoke test would catch a future regression to non-stable JSON ordering — particularly relevant if C1 lands and `stableJson` becomes the canonical identity primitive.

### T3. No test for duplicate-attr-key fail-closed

`attrValueForKey` (L222-231) throws on duplicate keys, but `T-131 negative: malformed or ambiguous declarations fail closed` does not exercise this path. Easy to add: an `attrs` with two entries keyed `abg.edge_assurance_contract`.

### T4. T-130 acceptance crosswalk with T-131

T-130 has two `[ ]` items:

- L112-114: *"F_P eval findings can be admitted into an owning ledger/register surface without the plugin writing that surface."*
- L121-123: *"Replay tests reconstruct hook action -> finding -> admission -> owning output from predecessor refs only. Current tests reconstruct hook action -> finding -> admission; owning output projection remains the next slice."*

T-131's `T-131 admitted F_P eval finding projects gain, close fold, residual, and next action` (test_t131 L503-537) drives an admitted hook finding through `deriveEdgeAssuranceEvaluationProjection` into an owning `EdgeAssuranceEvaluationProjection` and `EdgeAssuranceEvaluationReadModel`. That is "owning output projection from predecessor refs."

Either T-130's two unchecked items can be marked `[x]` with a cross-reference to T-131's test (acceptable since both close as one slice), or T-130's acceptance language should be tightened to specify "owning ledger/register projection *outside* `edge_assurance_evaluation_projection`" so the next slice is unambiguous. As written, T-130 reads as if it still needs work that T-131 has in fact delivered.

## Ticket-correctness findings

### M1. T-130 `related_downstream` path is stale

```yaml
related_downstream:
  - odd_sdlc/.ai-workspace/tickets/active/T-135-realize-evaluator-owned-runner-traversal-spine.md
```

That file does not exist at the `active/` path. It is at `odd_sdlc/.ai-workspace/tickets/completed/T-135-...`. Update the ref or drop it.

### M2. T-131 `closure_law` includes a downstream condition the ticket cannot satisfy alone

```yaml
closure_law: ... downstream products no longer need a private meta-contract
             to define edge gain and close.
```

The Implementation Evidence section accurately names this as residual: *"Downstream odd_sdlc carry-across remains a separate integration task."* But every acceptance row is `[x]` and `review_status: implementation_slice_done`. Pick one:

- Close T-131 on the ABG-side slice and split off a downstream-binding ticket (recommended; the slice is well-bounded).
- Keep T-131 open until odd_sdlc binds, in which case acceptance for the downstream condition needs explicit checkboxes.

As currently written, the closure law and the acceptance are inconsistent.

### M3. T-131 `affected_boundary` and Implementation Evidence diverge on touched files

`affected_boundary` lists `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/`, but Implementation Evidence enumerates only `contracts/edge_assurance_contract.ts` and `contracts/plugins.ts`. Either:

- name the runner file(s) actually touched and add them to Changed Surfaces; or
- drop `runner/` from `affected_boundary` if the runner integration is on a follow-up ticket.

### M4. T-131 Implementation Evidence omits `plugins.ts`

`plugins.ts` carries `EnginePluginInput.edgeAssuranceResolution` (L153) and the call to `resolveEdgeAssuranceContract` inside `constructEnginePluginInput` (L555-576). Two T-131 tests (`EnginePluginInput carries the resolved edge assurance disposition`, `EnginePluginInput sees module policy hooks and visible defaults`) prove that integration. The file belongs in the Changed Surfaces list.

## Concur — keep in revision

- F_H by absentia as the lawful default for missing contracts is the right reframe (PRODUCT.md L110-115, REQ-R-ABG3-ASSURANCE-029, code at `absentiaResolution` L477-492).
- The overlay-vs-materializer distinction in the ticket entry sections is the correct boundary statement: overlays govern interpretation; they are not the sole materializer of workspace state.
- `assertFpEdgeAssuranceEvalFindingMatchesHookAction` correctly enforces `hookClass === "eval"` (L893-896); a transform hook action cannot ferry an eval finding. Negative test at `test_t131` L755-786 proves it.
- `EnginePluginInput.edgeAssuranceResolution` is unconditional (`EdgeAssuranceResolution`, not optional). Plugins always see a typed resolution, never an undefined edge contract. Good for replay.
- F_P proposed close cannot override `AssuranceClosureDecision`: `proposedCloseDisposition` and `assuranceClosureDecision` are kept distinct on the projection (`test_t131` L539-567).

## Recommended Action

1. Land C1, C2, C3, C5, T2, T3, M1, M3, M4 as one small follow-up slice. They are localized and do not change semantics.
2. Decide on C7 (rename or document the `fh_required` collapse) before the next consumer of the disposition enum lands.
3. Resolve M2: either close T-131 on the ABG-side slice and open a downstream-binding ticket against odd_sdlc, or hold T-131 open with explicit acceptance for the downstream condition.
4. Decide on T4: either mark T-130's two `[ ]` items satisfied with a cross-reference to T-131's projection test, or tighten T-130's language to scope its next slice.
5. C4 and C6 are stylistic; defer unless a maintainer touches that code anyway.

Design is sound. The slice closes the gap the Codex test35-vs-TS parity post was pointing at: edge gain/close as a first-class GTL carrier with ABG-owned admission, not a product-local meta-runtime.
