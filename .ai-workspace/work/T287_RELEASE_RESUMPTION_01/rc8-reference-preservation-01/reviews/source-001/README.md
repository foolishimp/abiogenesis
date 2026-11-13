# Product Frame

ABIogenesis 5.0 retains **F01–F07, F09–F11 and F13–F17**, under GOAL-035/T-287. This review covers the prospective RC8 REF-01 realization: established request, Catalog, view and admitted input identity from construction through native transport and static binding to the real Product/run owner, with no repeated whole-object work after setup and unchanged raw admission, currentness, semantics and effects.

Owner-local identity bookkeeping is **deterministic construction / a derived tool**. It creates no ABG runtime authority or lifecycle. Product/requirements own WHAT; the TypeScript design owns HOW; ABG alone owns runtime admission/events. SDK/CLI stay thin. No universal trust registry, store, language, second runtime, twelve-cold-read migration or S7 deletion is selected.

Applicable requirements are **REQ-P-PUBLIC-CONTRACTS-009/010** (declared defaults, exact invocation/input identity, owning semantics) and **REQ-P-CATALOG-014/017/029/030** (coherent exact readiness, idempotence, eventless construction and separate runtime authority). Product “Live State, Recovery And Valid Reuse” and “Definition, Tool, And Runtime Authority” govern HOW admission/O-SCHEMA and §§10.9/10.11. The exact T-287 anchors and TASK.002 select this bounded refactor, not whole-5.0 qualification.

## Result and exact subject

**Falsified: two S2 findings.** This is a source review returned to `/root`; no priority, acceptance, release or repair activation is assigned.

- Frozen source: `/private/tmp/abg-r8-uozznezy/proof-003/stage-02/source`.
- Source digest: `95522fb5aea199812c23c220542266247a0e08d4b1fb98dc15a7e834bcf61dbd`, independently recomputed from the manifest rows.
- [Source manifest](/private/tmp/abg-r8-uozznezy/proof-003/stage-02/source-freeze.json): 293,771 bytes; SHA-256 `0b387280632b2bb43220a867c6d8563b9153f43a1783e510f5721f989523e022`.
- All **1,338 selected files** independently match. Exact Git-blob comparison against RC7 `27c08ce597b71c383eb3d032b25fa0791646c6c6` confirms **13 changed tracked files plus 2 new files**, with no other selected-source delta.
- `stdo status --definition .../stdo_abiogenesis.json --verify` returned installed/valid true and no failures for **STDO 3.0.4**, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`. Definition, Product and project-frame hashes match the Executive packet. Full pins are in [REVIEW.json](REVIEW.json).

The reviewer did not author or repair the subject. The declared author is native Claude Opus 5.5 xhigh; this is a separate OpenAI Codex reviewer. Supplied hypotheses and later Executive notifications were visible; they are not substituted for this source assessment. No enforced host information-isolation claim is made.

## RC8-SOURCE-001 — S2: first-use full-tree work remains after setup

On the first run-binder sight of the setup Catalog/view, [admitResources](/private/tmp/abg-r8-uozznezy/proof-003/stage-02/source/build_tenants/abiogenesis/typescript/code/src/public/binding/static_definition_bindings.ts:79) has no retained member fact. At lines 86–99 it passes the full objects to `admitContract`, then walks them with `isDeeplyFrozen`. The canonical gate at `shared/admit/contract.ts:21–27` first constructs an I-JSON tree and then applies the full Valibot schemas. The run owner’s Catalog/view schemas at `owner_bindings/run_invocation.ts:981–1040` reconstruct their trees. These outputs are discarded when the raw member is frozen.

Thus the existing Catalog owner cache may hit while full Catalog/view copying, schema reconstruction and a frozen walk still occur. The `catalog.fullAdmissions` counter counts only `readyCatalogs` misses. The new test’s zero list at lines 35–37/61 does not observe these binder tree operations. Passing it cannot establish the selected zero-repeat-after-setup bound. HOW §10.11’s “first binder sight” allowance weakens that bound.

The trigger is certain on first use under that member schema. The harm is repeated computation and incomplete proof; no measured latency/RSS magnitude is inferred. Canonical admission, Product currentness and effects remain fail-closed. Repair is bounded to the existing construction/binder and Catalog/view owners. A custom owner predicate inside Valibot alone does **not** remove the preceding unconditional `admitJson` gate.

The closure discriminator is the **first real post-setup call**, then warm successors, with actual copy/walk/admission observations as well as receiving-owner identity. It must detect a full tree pass even when the Catalog-owner counter is zero.

## RC8-SOURCE-002 — S2: frozen raw input replaces the schema’s output

The new establishment helper and generic member cache treat immutability as if it established normalization/output equivalence. It does not.

1. **Existing defaulted-start witness.** `t287-w2-05-static-binding-algebra.test.mjs:302–339` constructs a valid start call with raw `fhMode` absent but identity over the schema-defaulted request. Canonical admission returns `fhMode: "direct"`. `establishExactDefinitionCall` at `definition_binding_mechanics.ts:199–205` checks only non-null admission, discards the admitted invocation and records the raw invocation. Reuse at lines 431–435 returns that raw request, with the default absent and body different from its declared digest. Ordinary population explicitly supplies the defaults, so this does not assert failure of the passing ordinary start fixture.
2. **Resource output/default preservation.** At `static_definition_bindings.ts:94–101`, a frozen resource member is returned and cached even if its schema returns a different value. A same-type member transform from frozen `{n:1}` to `{n:2}` is enough to distinguish it from canonical admission. Rebuilding the output only from the input member list also drops schema-created default keys. No transforming production member was established in the selected run schema; this is a counterexample to the generic binder contract introduced by the delta.
3. **Raw I-JSON refusal.** The binder checks data descriptors but omits `enumerable === true`, then uses `Object.fromEntries` before admission. A required, non-enumerable resource property becomes enumerable and acceptable. Canonical `admitJson` explicitly refuses that original descriptor (`shared/admit/json.ts:249–258`). CLI JSON cannot express it, but native/in-process raw input can.

These are source-derived counterexamples, **not executed reproductions**. Their trigger is conditional; ordinary generated calls need not hit them. Existing currentness/effect checks remain and no corrupt ABG event or runtime authority bypass is demonstrated. Nevertheless, those checks do not restore the canonical request, output or refusal.

The generic per-member cache cannot legally infer that every schema is identity-preserving or input-only from a frozen object and schema identity. Keep the correction within existing owners: retain canonical normalized results, preserve the canonical raw route, and reuse explicit established owner facts. Do not add another general Valibot interpreter/cache or widen into a library purity project. Focused falsifiers are the existing defaulted-start witness, a same-type member transform/default, and the non-enumerable raw assertion.

## Retained support and limits

The normal explicit-default construction path has a coherent reference-preserving source trace, and the new test observes the real Product preparation owner. Existing `readyCatalogs`/view ownership, current event-selection checks, Product semantic guards, mutable worker-plan copying, and the twelve cold-read exclusions remain. This source review does not replace runtime proof of those claims.

Two narrower observations remain:

- `isEstablishedDefinitionCall` keys the invocation, not the full call. A **frozen** spread/rebox retaining the invocation and frozen resources passes; the new test covers only an unfrozen spread. Exact component reuse may be lawful, but “every copied/foreign call detaches” is not the implemented rule. Reconcile this within X1/X3/X4; no whole-call trust registry is implied.
- `definitionTransportWork.relinks` counts verifier reattachment after a clone. It does not measure physical native module/declaration linking. Zero work of that latter kind remains unproved.

The exact retained stage result reports compilation, generation and import/lifecycle/calculus passes. The Executive later reported **48 passes, 2 historical skips, no failures** across six focused lanes, unchanged frozen source and conserved fresh result/replay/close. The reviewer did not run those tests or independently reacquire the final lane/readback artifacts. The reported passes do not cover the counterexamples above.

No dynamic reproductions, matched RC8 performance/profile assessment, physical linking measurement, broad close, package/install acceptance or whole-5.0 qualification were performed here. Retain those claims at their existing owners. The smallest recommended re-entry is HOW §10.11 plus the existing construction, binder and Catalog/view owners, preserving this exact partial and unaffected evidence. Executive alone selects disposition.

Material source/input/evidence changes, a changed Product/method/frame basis, or an exact observation refuting the stated paths invalidates the affected judgment. Full triage, evidence pins and falsifiers are in [REVIEW.json](REVIEW.json).
