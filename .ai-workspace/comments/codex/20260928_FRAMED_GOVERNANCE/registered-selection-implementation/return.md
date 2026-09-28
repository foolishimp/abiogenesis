# T287_REGISTERED_SELECTION_IMPLEMENT_01 — closed Worker return

S2 implemented against Product base `e27f72bc2037130d3261694da40af0148269f142`, accepted S1 HOW, and the recorded S2 grant plus its exact `owner_bindings/run_invocation.ts` extension. Ready for independent review; this is not Executive acceptance or whole-Product closure.

## Result

One immutable external consumer Program and catalogue select A and B through the actual installed Public CLI DefinitionCall path. The root graph contains one F_D selector and two fixed `workflow.C(G)` terminal child loci. It declares no constructionComposition, action catalogue, model/gap/action-evaluation/refresh lifecycle. Both requests execute only their selected child, preserve the route-admitted raw input and exact definition digest, fold back once, and close the parent. Four fresh CLI processes read A/B result and replay; their terminal result and replay identities exactly equal the live receipts, with unchanged event prefixes.

Nonpermitted, stale-definition, wrong-contract and malformed child-input choices open no child and produce no foldback, parent closure or terminal result. Their current Public disposition is **runtime_failed**, through existing failure handling; these are fail-closed rejection cases, not Public `refused` result variants. Gap returns **blocked** without a fallback child or success. Ambiguous target/declaration rejection, singular selection, wrong result contract, and undeclared choice-shaped ordinary data are separate mechanical checks using the installed GTL/Validator owners; they are not claimed as additional Public consumer executions.

## Owner change

- GTL declares `registered_selection`, binding the selector locus, expected result contract, common child input contract, exact evaluator and rule. Existing outgoing edges and fixed workflow callees remain the candidate authority. Validator checks their unique permitted, published identities, common interface and existing purpose/conditions declarations. No new C operator.
- `gtl/registered_selection.ts` owns the shared declaration-first structural target/input resolution. HoG proposes from the admitted result; ABG checks the same relation before issuing the route.
- Product execution resolution projects exact permitted catalogue definition digests into the authenticated ExecutionBasis. This is an immutable projection of existing catalogue authority, not a purpose or target registry.
- Existing `route.boundInput` carries the exact raw child input. A minimal `registeredSelectionApplicationRef` binds that input to its admitted application. ABG rejects missing/crossed markers or bindings before route append.
- `abg/registered_selection_provenance.ts` projects the already-admitted binding from its exact source CCall/result/judgment and basis provenance. Replay does not select a target or load a graph. Existing traversal-input recovery consumes that same binding; ancestry recovery with a supplied original graph uses the shared structural relation. No graph snapshot, extra ledger or cache owner was introduced.
- Current event-contract and Public raw schema correspondences admit those fields. The immutable legacy event-contract profile remains byte-identical. Ordinary fixed-callee workflow materialization, child preparation, child execution, foldback and closure owners remain in use.

All 17 source file hashes and all 34 corresponding installed emitted JS/declaration hashes are retained. Source delta: **357 additions / 35 deletions, net +322**. Three new test/fixture files total **774 lines**, mostly adapted Product packaging/current Public DefinitionCall fixture construction.

## Checks and timings

`npm run build` passed for the final subject (`build-05.log`), including TypeScript and normal generators. `git diff --check -- build_tenants/abiogenesis/typescript/code/src` passed. Final `node --test test_env/tests/t287-registered-graph-selection.test.mjs` passed: one focused test, zero failures/skips, 32.71 seconds. Seven execution scenarios and four fresh-process readbacks are assertions within that test, not eleven separately counted tests.

| Case | Public disposition | CLI wall time | New events | Child graphs |
| --- | --- | ---: | ---: | --- |
| A | completed | 1.403 s | 75 | A only |
| B | completed | 1.444 s | 75 | B only |
| nonpermitted | runtime_failed | 1.368 s | 25 | none |
| stale | runtime_failed | 1.356 s | 25 | none |
| wrong-contract | runtime_failed | 1.360 s | 25 | none |
| wrong-input | runtime_failed | 1.380 s | 27 | none |
| gap | blocked | 1.368 s | 27 | none |

Fresh result/replay calls took 0.606–0.623 seconds each. Setup was separate: artifact verification 11.527 seconds; ABI installation 2.637 seconds; installed-content check 0.556 seconds; external Product installation 0.229 seconds; other measured setup phases are in `setup.json`. The >10-second setup verification handles 5,235 packed members / about 67 MB unpacked, including bundled dependencies, and authenticates the Product archive and its payload inventory. No execution or readback exceeded ten seconds. A/B each add about 254 KB of events; negative/gap cases add 96–103 KB. Full retained event log is 3,316,771 bytes, including real Product/workspace admission setup.

The final valid ABI build/archive was reused for `test-05` and strengthened `test-06`; no rebuild or repack intervened. Earlier source correspondence failures required three superseded ABI archives, retained separately. The failed build that attempted to edit the immutable legacy event profile produced no candidate archive; the correction uses the existing current-profile extension. Do not count those failures as accepted evidence. `test-01` also retains the initial fixture semantics-export omission. No timeout/heap changes, providers, native F_P, installs outside fixture setup, Git mutation or Product-law edits occurred.

## Frozen subjects

- ABI archive: `sha256:780f944ce5b6e271cff68f43b58c8f8dc01a7636b0169e2406c5e2354a2441ce`
- Product content: `sha256:749af79de6b4ac79f5dfca5645e8df9de46fab9671c75bc38db5c25b06224ae3`
- Manifest file: `sha256:af5ca3269672519b2e3777a54ba5e09b734673333eb663da00a49b26821c4e46`
- Source file-set digest: `sha256:dac3caf27f01511893e41c976b260fd8a25e3f14402733a1b732fa62360a60a4`
- Fixture file-set digest: `sha256:30f051e5493d84d2ced51d9b52e92d0b31253d9c5be38b3e63dbcaa5cb1f9dfc`
- Generated delta file-set digest: `sha256:25ec69c601efda13d01d51b951849f530d7b00ed003fb684d73e1b275aad2661`
- Subject manifest: `sha256:b65f92fa297fe8a7712fdb4ea052542851545cde47d2aa6a17741a53de5ff094`
- Event log: `sha256:05177bac1a4609685fa6bb84fbafd7642c7f21ed42279850ed543e51a4c7ff51`

File-set digests hash the compact, sorted-key JSON path-to-SHA256 maps in `subject.json`. `emitted-hashes.json` inventories the full emitted build. Normal tracked generated deltas are the emitted `abg/event_store.js`, emitted `product/execution_resolution.js`, capability-definition graph, native-runtime-observation schema, and Product manifest. Per-file identities are in `subject.json`. Final ABI and external Product archives, exact Public requests, receipts, event slices and full event log are copied here before cleanup; original scratch/install roots are also retained. `proof-hashes.json` inventories retained proof files.

## Reused / replaced / removed / still obsolete

Reused: existing graph edges, catalogue definitions, Product/Validator admission, `route.boundInput`, immutable route/event identities, and workflow child/foldback/closure owners. Historical worksite/retained-source projectors remain unchanged and are still called by replay/traversal-input recovery for their applicable declarations.

Replaced: the touched HoG/ABG ordinary-continuation-only branches now dispatch the explicitly declared registered-selection relation before ordinary continuation; absent declarations retain ordinary behavior. Replay's worksite-only bound-input dispatch now has an explicit admitted registered-selection marker branch. The 35 deleted lines are replaced owner logic, not retired features.

Removed: no previously accepted Product feature was declared redundant by this increment. Rejected mandatory ConstructionComposition coupling exists only in the preserved S1 v1 document and was never implemented. No full-graph snapshot implementation was added.

Still obsolete and outside this increment: `test_env/support/root-cli-environment.mjs`'s historical `buildRootCliScenario` uses retired Public invocation envelopes; historical `m5-installed-external-product.test.mjs`/related consumers remain reachable test callers. This new consumer uses current Public DefinitionCall helpers and does not restore those APIs. Existing optional ConstructionComposition is required supported behavior, not marked obsolete here.

S3 native F_P suitability/provider execution, recursive selection qualification and whole-Product release remain open. Compact selected/gap output accepts either declared F_D or F_P evaluator regime; this proof exercises only the explicit F_D rule.
