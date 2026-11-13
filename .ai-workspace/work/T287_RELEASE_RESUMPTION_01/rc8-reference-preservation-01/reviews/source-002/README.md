# Product Frame

ABIogenesis 5.0 retains **F01–F07, F09–F11 and F13–F17**, under GOAL-035/T-287. This is the bounded RC8 REF-01 correction: preserve canonical schema outputs/defaults/refusals and established request, Catalog/view and Product-input identity through the real run consumer. Existing owner facts are deterministic construction/derived-tool facts. ABG remains the sole runtime admission/event authority; SDK/CLI stay thin.

Applicable relations are Product “Live State, Recovery And Valid Reuse” and “Definition, Tool, And Runtime Authority”; **REQ-P-PUBLIC-CONTRACTS-009/010** and **REQ-P-CATALOG-014/017/029/030**; owning HOW §10.11 X1–X6; and author-02 ROOT_SCOPE/TASK. No generic schema/trust cache, admission primitive redesign, fourth binder, twelve-cold-read migration or S7 deletion is selected.

## Verdict and subject

**Falsified — one S2 finding, RC8-SOURCE-003.** The first real call still copies the Product input after construction. The ordinary operation returned a result; this is a demonstrated identity/work-bound failure, with full admission still protecting correctness.

- Frozen source: `/private/tmp/abg-r8-uozznezy/author-02-proof/stage-03/source`.
- Source digest: `b884ca1fe49d31b1fd2d3b6f8ade9c64fba911b83dc37fee069d74453cd4ff81`, independently recomputed.
- [Manifest](/private/tmp/abg-r8-uozznezy/author-02-proof/stage-03/source-freeze.json): **293,777 bytes**, SHA-256 `5805c757c7baca31e4b81b7775c5210d84a87c5a11238360e50f6587f7aebf6a`.
- All **1,338 files** match; **12** changed from reviewed stage-02 `95522fb5…`; **18** differ from immutable RC7 `27c08ce597b71c383eb3d032b25fa0791646c6c6` (16 tracked plus 2 new). Every changed path is granted.
- Product Definition, Product, both owning requirement files and project frame independently rehash unchanged. STDO 3.0.4 verification again returns installed/valid true and no failures, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`, empty composition.

Full source/basis/control pins and line evidence are in [REVIEW.json](REVIEW.json). This reviewer authored source-001 findings, but authored or repaired no Product source or HOW artifact. The successor source and retained proof were independently reacquired. No tests were run by this reviewer.

## RC8-SOURCE-003 — S2: normalized payload loses its Product admission identity

The exact producer-to-consumer path is:

1. `populateProductRunInvocation` admits the caller value through the Product input owner, then places the returned detached object in the request and `input_contract` slot (`product/run_invocation_operation.ts:965–1053`). `product/semantics.ts:512–523` records that exact output in `admittedProductInputs`.
2. Canonical invocation admission applies the request/invocation schemas (`definition_binding_mechanics.ts:454–468`). `contractBoundValueSchema.value` uses recursive `jsonValueSchema`, whose Valibot array/record branches reconstruct payload containers (`shared/public_function_contracts.ts:173–181,237–242,687–695`).
3. Establishment now correctly retains the **canonical admitted invocation** (`definition_binding_mechanics.ts:214–222`). Its rebuilt payload is outside the Product input owner’s identity set.
4. Real preparation reads `request.input.value` and calls Product admission (`product/run_invocation_operation.ts:676–698`). The identity check misses, so `semantics.ts:517–522` performs another I-JSON copy. The original canonical request keeps its unregistered payload; registering the new Product output does not itself give that retained payload a later hit.

The retained [owned-call output](/private/tmp/abg-r8-uozznezy/author-02-proof/lane-01/commands/test.stdout) is **2,031 bytes**, SHA-256 `e44728b0c890897e0831761e7fdc23e395a229e894b08112f0417e18be0389c0`. On `rc8-ref01-0` it records:

| Work after construction | Actual |
| --- | ---: |
| Product input copies | **1**, expected **0** |
| Product input reuses | 0 |
| Transport detaches / verifier reattachments | 0 / 0 |
| Catalog admissions / view constructions | 0 / 0 |
| Full Catalog/view comparisons | 0 / 0 |
| Binder owner-member reuses | 2 |

The test stops at line 69, **0 pass / 1 fail**. Before that assertion, the helper had obtained the actual result and borrowed-resource completion. This confirms a normal selected-path failure; an exotic schema or malformed input is unnecessary. Product still fully admits the unknown object and runs its semantic guard, so no authority bypass, corrupt event or stale-prefix acceptance is demonstrated. Large-input latency and allocation cost remain unmeasured here.

The smallest lawful re-entry is **HOW X1/X2 and the existing run construction, canonical invocation and Product input owners**. Preserve canonical defaults and body/digest agreement. Do not restore raw invocation retention, promote an equal digest/frozen object into an owner fact, or redesign shared admission primitives. The missing relation is the established Product payload across canonical construction into its actual consumer. Root selects the concrete correction and any narrowly justified path extension.

Meaningful reproof uses the same first-call and warm discriminator, checking the nested payload/owner relation as well as outer request identity and zero additional input copies. It must retain the defaulted-start, resource transform/default/non-enumerable refusal, copied/foreign input and mutable-prepared-plan falsifiers. This finding grants no implementation or retry loop.

## What the correction preserves

The earlier Catalog/view first-binder defect is corrected in this source slice. The binder asks explicit existing Catalog/view owner predicates **before** the full-tree gate, excludes accepted objects from that gate, and performs no binder frozen walk over them. The first-call counters corroborate zero additional Catalog/view work and two owner-member reuses.

The generic member-schema/frozen-input inference and its caches are removed. A binder without owner facts uses canonical `admitContract`; other members retain its outputs/defaults. Non-enumerable, symbol, accessor and unknown shell properties take the original whole-object gate. Establishment retains the normalized invocation. These source changes address the prior counterexamples, while the integration failure above remains.

The new Catalog/view predicates remain owner-local construction facts. The prefix binder change only forwards their table. `shared/effect_definition.ts` changes only a type declaration. Existing currentness, installed-content, Product semantic and effect checks remain. Worker transport adds a first-sight walk counter; its mutable-copy behavior is otherwise unchanged.

Frozen reboxing is now explicitly component-based in HOW and tests: the established invocation can survive a new frozen shell, while new/fake resources must earn their own owner facts or take canonical admission. No new runtime registry is needed.

## Proof limits and return

The exact stage result reports compilation, generation and import/lifecycle/calculus passes. The first owned-call failure stops the later receiving-owner equality assertions, warm calls, copied/defaulted/reboxed resource cases, transform/default/refusal cases and worker-plan probes. Their source is present; they have **no execution credit** on stage-03. Prior stage-02 passes retain their old subject only.

The test snapshots begin after setup. **Zero additional Catalog admissions is not proof of exactly one setup admission**; setup owner membership alone does not count its work. `verifierReattachments` now correctly names reference reattachment after a clone. It supplies no measurement of physical native module/declaration linking. Matched performance/profile work, remaining focused lanes and broader qualification stay with their existing owners.

Return this exact partial and failure to `/root`. Preserve the corrected canonical semantics and Catalog/view path, and confine any next work to the identified handoff. No priority, acceptance, release or repair activation is assigned. Material source/input/proof changes, changed governing basis, or an exact revising observation invalidate the affected judgment.
