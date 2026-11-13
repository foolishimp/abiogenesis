# TD-26 P6 Return: language retirement

Status: authored implementation frozen; dependency-ready for P7 and Root integration. This is a Writer Return, not independent acceptance, qualification or release. No background work remains.

| Binding | Exact subject |
|---|---|
| Writer / consumer | `T292-TD26-P6-CODEX-01` / Root Executive |
| Base | Integrated P5 `b4704323b06d938eb8c30f3a8591a3f30e4e6229` |
| Authored source/test commit | `9a39ded24c5986c693cde79f679039b8a4dfa754` |
| Worktree / branch | `/private/tmp/abg-td26p6` / `codex/td26-p6-language` |
| Product / basis | `stdo_abiogenesis.json`, `urn:stdo:product-definition:abiogenesis`; Definition SHA `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44`; `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`; composition `[]` |
| Receive / frame | Exact installed native stdo-work Receive and verified Product basis, current AGENTS; GTL typed interface specialization and Proof, preserving historical identity. Activation bound before effects in `S/ACTIVATION.json`. Shared filesystem; no isolation claim. |
| Routes / grant | Committed `preparation-20261113/P6_PREPARATION.md`, retirement plan §6 P6, T292 amendment/resumption/P6 rulings, integrated P5 Return; Product GTL/HoG/ABG split and validation law, LANGUAGE-002/005/009, CONTRACT-LAW-API-003/009/010/011/013, PUBLIC-CONTRACTS-002A/004/005/007A. Root owns conjunction and authority rulings. |

`T` below is `build_tenants/abiogenesis/typescript`; `S` is `/private/tmp/abg-td26p6-work/writer`. Exact commands/output and hashes are in `S/proof-receipts.json`, `authored-input-hashes.json`, `identity-pins.json`, `identity-proof.json`, and the named logs. Scratch is an execution receipt, not repository authority.

## Delivered scope

Removed optional `actionCatalog` / `constructionComposition` Program schema members, their five subsidiary schemas, six contract types and intended barrel exports, ActionCatalog canonicalization, and associated validator law. Removed the semantics `validateInvocationBasis` argument and producer; the existing provider-loader policy now refuses an `actionCatalog` key by name, including null, undefined and inherited presence.

All six ExecutionBasis keys remain serialized: `actionCatalogRef`, `actionCatalogDigest`, `actionCatalogRows`, `constructionCompositionRef`, `constructionCompositionDigest`, `constructionComposition`. Their new-work types/values narrow to null/null/readonly-empty-tuple/null/null/null. Child bases carry the same constants. Historical event/profile/calculus declarations and readers were not rewritten.

The P4 Program-key guard is removed from `admitExecutionBasis`: supported new entries first resolve through the strict Program and entire owning-publication raw schema; the sole production basis-admission caller is downstream. Pending execution re-resolves through `resolveContinuationBasis` / `selectPendingExecutionAtPrefix`; its `/program` branch is source-traced, while actual cross-build history encounters the earlier `/workspace` guard below. Arbitrary forged kernel objects do not create independently callable Product operations (TD78 ruling). No guard removal elsewhere.

Developer-mini keeps greeting/asset-start, ticket, span, identity and mixed-fibre Programs; only One Surface and its dedicated code/contracts/bindings are removed. The unique S03 generic cursor/route/input obligations now live in `t292-td26-p6-span-reentry`; supervised direct-by-handle versus START obligations moved to the existing ordinary supervised fixture in `t292-td26-ps-default-root-mode`. The RP2 allowlist drops only the deleted handle. S03 fixture/support/test were removed after the kept span executed successfully. `current_intent` and replay-derived pending execution remain.

| Authored size | Git delta |
|---|---|
| Runtime source | 8 files, +14 / −292 lines |
| Tests/support/fixtures | 18 files, +683 / −4258 lines |
| Total source/test commit | 26 files, +697 / −4550 lines; net −3853 |
| Developer-mini source | 5109 → 2080 lines; five kept Programs |
| Fully deleted S03 files | fixture 101 + support 183 + test 16 = 300 lines |
| Gate catalogue | 66 → 63 rows: two S03 rows and `s7-pending-consumer-intent` |

No Product/spec/design, capability register/member/corpus-ID/Consensus-schema withdrawal, provider runs, pins, release/install destinations, push/tags, B09/B21 or general cleanup. Installed tests use only their disposable test territories.

## Owner outcomes and Root rulings

| Supported door / subject | Measured final owner result |
|---|---|
| Published JSON schema; raw Program/module; m02 serialization | Both retired keys refuse by presence. Actual emitted Ajv schema refuses; raw/native `invalid_kind`; serialization throws existing TypeError. Complete former structural values, null and [] covered at raw admission. |
| Publication / new Catalog admission | Raw refusal precedes private publication validation; Catalog returns `catalog_validation_refusal`, validation `invalid_kind`. |
| Conformance | `gtl_program_conformance_refusal`, `raw_admission_refused`. |
| Provider module loader | Existing TypeError `installed Product semantics provider differs from its published binding`; absent-key positive control loads. |
| Raw Run caller-Catalog resource gate | Both keys reach `resource_admission:invalid_resource_assertion`; no append. Shared invocation owner/schema path measured in TD34. |
| Genuine old mixed publication, NEW work | Separate actual b470 installed fixtures for each key: an ordinary selected Program completed with an inactive retired sibling in its owning publication. Current Catalog/view reconstruction remains exact. New admission refuses `invalid_kind`; Product resolution refuses `incompatible_or_unproven` at `declaration_closure`; current supported start population returns `invalid_program`, `/program`, with zero appended bytes. This is a preparation-owner refusal, not a completed current installed execution. |
| Current pending execution, raw caller resources | Actual installed CLI refuses both retired-key resource mutations at `resource_admission:invalid_resource_assertion`, zero appended bytes; unchanged lawful pending then resumes once, 113 → 155 events, with cold result/replay. |
| Genuine old mixed-publication pending | Baseline's existing controlled-interruption owner harness with only an inactive ActionCatalog sibling added: old `installed_pending_call`, later old cold resume completed. Current supported pending population refuses earlier `basis_mismatch`, `/workspace`, zero append. Exact Catalog/view survive. This does **not** claim a measured `/program` continuation branch; TD78/current-workspace guard owns the earlier result. |
| steel03 historical read versus NEW admission | Exact recorded Catalog/view, five borrowed owners, selected closure and dependency negatives unchanged. New admission already refused the former gate application; its earlier refusal is now exactly `$/programs/0/actionCatalog: Invalid key: Expected never but received "actionCatalog"`. Only that refusal assertion/comment changed. |

Root accepted the mixed-publication outcome as the intended NEW-work consequence of the approved language retirement, citing MODULE-003/005, CATALOG-001/002/003 and CONTRACT-LAW-API-009/013. New work requires the publisher's current publication with its resulting exact identity; no stripping, grandfathering or rewrite of historical immutable publications. This is distinct from steel03's already-refused new-admission basis and is the counterexample to the old brief's overbroad census wording.

Root authorized removal of orphan `s7-pending-consumer-intent` (B25 S4/P1): its sole case was P5's deleted construction/selected-action continuation test, and no current consumer remains. Genuine pending execution keeps its actual cold Public proof. Historical evidence files remain. Initial gate failures were reported before that repair; final catalogue is 3/3.

## Focused proof

Selected production/fixture bytes were built normally with `npm run build`; three lints passed. Root corrected the initial provisioning grant: the node_modules symlink was replaced by an APFS clone of unchanged main dependencies, with 4576 file/link entries byte/target-equal (`dependency-clone.json`). The `--preserve-symlinks` build/run was diagnosis only; final build and installed proof use ordinary NODE_OPTIONS. Lints are reused over identical source, per Root's direction.

All test commands use `TMPDIR=/private/tmp/abg-td26p6-tmp`, `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace` where relevant, and `node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap`; patterns below select only the stated cases.

| Selected proof | Final receipt |
|---|---|
| Build; imports/lifecycle/calculus lints | `build-final.log`, `lint-{imports,lifecycle,calculus}.log`, exit 0 |
| Canonical GTL identity 6; C algebra 19; P2 loader/module 4; TD34 owner doors 4 | Passing cases in `pure-final.log`, unchanged thereafter |
| New language doors/shipped publications 2; steel03 closure 1 | `doors-steel-final.log`, 3 pass, 1 unrelated private-input steel resource case skipped |
| Existing evidence-gate catalogue | `gates-final.log`, 3/3 |
| Serialization/native types | `serialization-final.log`: 5/5, patterns `strict published|closed tuple|packed native types|local admission rejects|GraphFunction/module`; `published-keys-final.log`: 1/1, pattern `retired Program members`. Actual composed tuple census 23 → 18; kept closure tuples 2, six arity/order negatives/restorations. Six removed type names tested absent from gtl/m01/m02 (18 strict compiler negatives); six basis constant types compile. |
| Framework typing and packed runtime | `framework-final.log`, 3/3: source/normal no-emit compile/packed runtime inventory only |
| Provider-free installed span | `span-final.log`, 1/1; `installed-span.json`: completion, 1 re_enter, 6 leaf calls, target attempt 2, progressed input, six basis constants/hash, cold closed replay; 121 events |
| Kept supervised handle/START law | `root-mode-final.log`, 3/3; no actor dispatch |
| Narrow ST1 asset/graph_function plus P4 kept input refusal | `kept-start-final.log`, 2/2; patterns `ST-1 starts the developer mini|an observation-snapshot input` |
| Current pending request/installed cold continuation | `pending-final.log`, 2/2; patterns `run.continue current-execution request|interrupted recursive workflow resumes once through the cold Public`; two new raw resource refusals and lawful resume |
| Old supported mixed-publication discriminators | `old-mixed-{actionCatalog,constructionComposition,pending}.json`; scripts exit 0, actual b470 build reused, no baseline rebuild |
| Bounded history / artifact truth | `replay-{base,final}.jsonl`, `truth-{base,final}.jsonl` byte-identical for rc12 1695 rows and native-assessment 79 rows; 23 exact retained basis bodies retain canonical serialization/hash and all six fields (`identity-proof.json`) |

The initial new-test positive control was corrected from an intentionally nonvalid corpus publication to the existing valid structural fixture, then selected a Program with a start. Those test-premise failures are superseded by `doors-steel-final.log`. Scratch old-pending harness import-resolution issues were corrected without Product changes. Only ST1's diagnostic sentence was corrected after its successful run to attribute supervised proof to its new lane; executable assertions unchanged. The published-key schema case was subsequently added and separately passed. No production/fixture source changed after the selected normal build. No full-population/broad suite is claimed; the composed group proof remains once at close.

## Constants, generated identity, and next owner

Derived final counts are **18 operations / 56 definitions / 42 callable / 14 unavailable**. Owner and exact-owner key-set digest both remain `sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f`. All 16 DS1 register rows, 42 mandatory corpus IDs and 72 public contract IDs are unchanged; no new corpus IDs. Runtime/legacy event-contract, event-kind, payload-contract and calculus hashes remain exact (`identity-pins.json`). All eight shipped publication constructors omit the retired Program keys. Corpus bytes move only with their emitted schema digest; 28 contract digests move (23 transitive native declaration closures, four shared-schema rows, one corpus asset), listed exactly in `changed-contract-identities.json`.

| Generated proof output (restored before source freeze) | SHA-256 bytes |
|---|---|
| `contracts/schemas/gtl-serialization.schema.json` | `24c6d88505b7c3f3c3c33c252fd0d284798c5138f247ed108e415d96b60f3321` |
| `contracts/conformance/gtl-language-conformance-corpus.json` | `096c1980f5dcbdd467fcb37133001b536171a610ae9a48b51852e23283551a38` |
| `contracts/capabilities/capability-definition-graph.json` | `1f626979294f00152f98d35bff86ac5d3bec59920689a10c386ceaa352581e0d` |
| `product-toolchain-manifest.json` | `d4b89ef922f488c71904547d809f38beb458aa07add3aecf28a5a578c85bb0bf` |

Tested Product content digest `sha256:421b3db130a9ffa90fce1140054c59fef01beecdc340a14649d8005b2de2d2fb`; public Catalog digest `sha256:c60e165d0737e6733e993468b0be7c61b9f933677dbce8f2a15dc70633013991`. Fresh installed identities are not compared as if they were the same retained basis. All four generated outputs are restored and excluded from authored commits; Root regenerates at merge.

B22 receives `S/B22_INPUTS.json` and all authored input hashes. Remove the three exact recipe members `test_env/fixtures/t287-s03-automatic-product/index.mjs`, `test_env/support/t287-s03-automatic.mjs`, `test_env/tests/t287-s03-automatic.test.mjs` (verification-recipe member rows 3258/3582/4270), plus P5's already deleted `test_env/tests/t287-continuation-causation.test.mjs`; include changed/new test/source inputs and regenerate verification-recipe / expected-output-inventory once at group close. No mirrored spec recipe was found, so no spec-first recipe commit. No generated qualification metadata was edited here.

B08 attention: `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md:472` still asserts the mandatory S03 qualification join; lines 458/462 and the accepted S03 scenario references in `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` and `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` need the final owner applicability pass. Historical identities are not silently rewritten. No design mutation in P6.

P7 may proceed from Root's integrated source plus regenerated identity, retaining the 18/56/42/14 and register/corpus sets as its predecessor. The selected P6 work has no unresolved implementation failure; `/program` historical continuation branch remains explicitly source-traced behind the measured `/workspace` guard. Root owns final compatibility delivery, B08/B22 and the composed broad/full-census close.
