# TD-26 P6 preparation return

Status: read-only preparation returned to Root; no Writer activation, implementation, acceptance or independent semantic review. No repository/worktree/Git mutation, provider, build or test execution. This artifact is the only write and lies in the granted scratch territory.

## Exact intake and validity

- Consumer: Root Executive, `/root`; recipient: `/root/td26_p6`.
- Inspected main: `94e588ec9209c0fed89f967601e8f9071573a9cd`; production predecessor named by Root: `e709bd24f3db37991b892304f7fa369897bba315`.
- Exact Definition: `/Users/jim/src/apps/abiogenesis/stdo_abiogenesis.json`, `urn:stdo:product-definition:abiogenesis`, SHA-256 `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44`; composition `[]`.
- `read_basis.py check --stdo /Users/jim/.local/bin/stdo --store '/Users/jim/Library/Application Support/STDO' --definition ...` returned `checked`, `installed: true`, `valid: true`; basis `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`.
- Loaded exact native `plugins/spec/skills/stdo-work/SKILL.md`, `COORDINATED_HANDOFF.md`, `PRODUCT_BASIS.md`, root/apps AGENTS and repo CLAUDE. Bootstrap member resolved/read through the compact manager reader, member SHA `9fb337b2c8462e9d6788f52f11ca75199253a3a66a10774bc05a9798a772e502`.
- Frame: `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, GTL typed-interface specialization at `ABI5_REALIZATION_CONSTITUTION.md#53-six-frame-atlas` and Proof at `#531-local-realization-frames`. Purpose is mapping the language delta, supported entry paths and proportionate proof. Root owns conjunction and rulings.
- Source authority: Product identities GTL/HoG/ABG and Validation Contract; LANGUAGE-002/005/009; CONTRACT-LAW-API-003/009/010/011/013; PUBLIC-CONTRACTS-002A/004/005/007A. GTL owns schema/language; HoG traverses; ABG admits runtime truth; recorded history and new admission remain distinct.
- Current T292 amendment/resumption applies over the old brief/rules: final focused discriminators, one real execution and bounded kept history per package; full census/broad proof once at group close. T293 B07 belongs to P5; B08 to the post-P7 design pass; B22 to cut-time inventory/recipe regeneration.
- P0/P1/P2/P3/P4 Returns and TD-27 precedent were read by targeted sections. P5 is not integrated and has no closed main Return at this checkpoint. Its changing subject was not treated as accepted/frozen. Refresh this packet from the exact integrated P5 main before Writer activation.
- Same host and shared filesystem; no information-isolation or semantic-independence claim.

## Change map (T = build_tenants/abiogenesis/typescript)

| Surface at inspected main | P6 change / constraint |
|---|---|
| `code/src/gtl/serialization_contracts.ts:169-196` | Delete five ActionCatalog/construction schemas and the two optional GTL_PROGRAM_SCHEMA fields. The Program remains `v.strictObject`. Keep PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA and `publicAssetTargets`. |
| `code/src/gtl/contracts.ts:107-117`; `gtl/index.ts:141-146` | Delete six named types/re-exports listed below. `GtlProgram` narrows through its owner schema. |
| `code/src/gtl/canonicalization.ts:106-125` | Delete canonicalizeActionCatalog and its Program branch; preserve other Program canonicalization. |
| `code/src/validator/validation.ts:1497-1699` | Delete construction-composition and ActionCatalog whole-Program laws. Preserve non-callable contract-ref, node-type/overlay, callable membership and ordinary whole-Program checks. |
| `code/src/abg/execution_basis.ts:399-405,2141-2148` | Narrow six fields to null / readonly empty-tuple types; root constructor writes literal null/[] values. Child constructor at 2680-2685 carries the same constants. Keep all six serialized keys. |
| `code/src/abg/execution_basis.ts:1957-1958` | Two P4 clauses are candidates for deletion once the supported-entry discriminator below establishes redundancy. Other closure mismatch checks remain. |
| `code/src/product/semantics.ts:198,439-440` | Remove nested `validateInvocationBasis` input member; add `"actionCatalog" in value` to existing retired-provider-key loader policy, preserving its TypeError text and inherited-key treatment. |
| `code/src/product/run_invocation_operation.ts:717-719` | Remove the corresponding callback argument. This producer is required even though the old brief primarily names the interface. |
| `test_env/fixtures/developer-mini-product/src/index.ts` | Remove only One Surface graph/program/contribution, its action/composition declarations, dedicated contracts/closure/bindings/descriptors and orphaned semantic helpers. Retain greeting, ticket, span-reentry, identity and mixed-fibre Programs. Do not range-delete the old plan's stale line estimates. |
| `test_env/support/developer-mini-product.mjs:270-271` | Remove orphaned `constructObservationSnapshot` projection when its fixture export goes. |
| `test_env/fixtures/t287-s03-automatic-product/index.mjs`; `support/t287-s03-automatic.mjs`; `tests/t287-s03-automatic.test.mjs` | Retire after the kept graph-span assertions receive a retained home; see below. |
| `test_env/support/evidence-gates.json` | Remove only `s03-phase-b-release` and `s03-evidence-directory` with that test. |

Unchanged: capability register, corpus program/diagnostic IDs, 13 Consensus schema contracts, runtime event/calculus profile declarations, historical basis/profile keys, `constructionIntentRef: null`, `constructionDeltas: []`, `current_intent` selector and replay-derived pending execution. No B09 root policy, B21 host-path repair or generic cleanup.

## Supported door map — source trace, not executed final results

Use valid legacy payloads that the integrated P5 schema admits plus key-present null/empty variants; present null/[] must refuse after P6 too. The latter are controls and may already refuse on base. For the change discriminator, assert a well-formed pre-removal value admitted on base, refused on final.

| Door | Owner path | Expected final outcome, using existing code |
|---|---|---|
| Program/module admission and serialization | `gtl/serialization.ts:11`; `validator/raw_admission.ts:94,158-230` -> GTL_PROGRAM_SCHEMA nested in ModulePublication | `raw_admission_refusal / invalid_kind`; serialization throws existing TypeError. |
| Publication validation | `validator/validation.ts:613,710` requires this owner's raw-admitted publication | Refusal at preceding raw admission; do not report validatePublication itself as having parsed the raw Program. |
| `CatalogOperationPort.admit` | `product/catalog_operations.ts:266-303` raw-admits every readiness publication before validatePublication/admitGraphFunctionCatalog | `catalog_validation_refusal`, nested raw `invalid_kind`. |
| Program conformance | `validator/conformance_operation.ts:200-302` -> `admitGtlProgramConformanceInput` | `gtl_program_conformance_refusal / raw_admission_refused`, nested `invalid_kind`. |
| Product resolution | `product/catalog_operations.ts:129-169` admits selected Program then its entire publication; `product/execution_resolution.ts:759-771` | `product_execution_resolution_refusal / incompatible_or_unproven`, stage `declaration_closure`. |
| New start/invoke, raw caller Catalog | `owner_bindings/run_invocation.ts:277-278,556-579,659-684`; static binder resource gate | `resource_admission / invalid_resource_assertion` before owner. |
| New start/invoke, owner-established Catalog | Established-member bypass at run_invocation:1600-1618 -> preparation -> Product resolution above | `invalid_program` at `/program` (`run_invocation_operation.ts:283-292,658-670`), before basis admission. |
| Pending continuation, raw caller Catalog | Same resource schema/binder as start | `invalid_resource_assertion` before owner. |
| Pending continuation, established or historically reconstructed Catalog | `resolveContinuationBasis` -> ProductExecutionResolutionPort.resolve; `selectPendingExecutionAtPrefix` at run_invocation:1363-1404 | Resolution refusal becomes `basis_mismatch` at `/program`. No `admitExecutionBasis` call; an admitted root basis is reused only after current Product resolution. |
| Historical reconstruction only | `buildGraphFunctionCatalog` and `admitGraphFunctionCatalog`; `w2-steel-single-start-closure:27` | These typed builders do not raw-admit Program schemas. Keep their history reconstruction behavior; test their output at the new-work consumer. |

P4 guard assessment: the sole current production call to `admitExecutionBasis` is `run_invocation.ts:1043`, after preparation has resolved/raw-admitted the selected Program and its publication. Pending continuation separately re-resolves and does not call the function. This supports removal of the two clauses on supported Product entry paths, subject to post-P5 recheck and final proof. Per Root's explicit TD78 boundary, arbitrary manually forged kernel objects are not independent Product operations and are not a new guard requirement. Do not broaden P6 to police them.

## Bounded historical finding and actual admission/read distinction

A concrete retained basis carries both removed keys:

- `.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/implementation-01/evidence/borrowed-five-call-11.jsonl`, pinned by `steel03-retained-call` (19,478,678 bytes).
- `invocation.resources.declarationCatalog.catalog.readinessBasis.publications[2].programs[0]` is `program://abg/system/consensus-one-surface@5`, module `module://abg/consensus@5`; it has both keys. The packet's own Program is kept `program://order-summary.example/single-start@5`.
- The retained lane already reconstructs its exact Catalog/view with the typed builder and expects **new** `catalog.admit` to refuse its later publication[4] `gate` relation (TD27 ruling). It does not currently admit this historical basis for new work.
- P6 will probably make the first raw refusal occur at publication[2]'s Program key. Update the lane's exact cause assertion to the observed final refusal while keeping Catalog/view reconstruction equality. This adds `w2-steel-single-start-closure.test.mjs` to affected focused proof.
- The old brief's universal phrase “every Program in a recorded publication of the kept feature set carries neither key” is false under a literal reading. Root explicitly ruled after independently reading the lane that this inactive Consensus Program is not an admitted kept new-work basis: preserve the historical fixture and exact Catalog/view/borrowed-owner closure assertions; change only the new-admission first-refusal assertion after measurement. Stop if reconstruction changes. This is realization/proof re-entry under TD77 law, with no Product reprice.

Additional bounded static reads (not replay proof): the existing P4 rc12 copy is 14,506,732 bytes / 1,695 rows and contains one distinct nested Program (`program://default-library-witness/witness@5`) with neither key. The kept native-assessment gzip fixture is 779,443 compressed bytes / 79 rows and contains no nested gtl_program object. These observations do not establish all historical populations or prove replay.

## Fixture assertions that must survive

1. **Generic graph-span re-entry is kept and appears to lose its only executable assertion.** S03 `purePreflight` line 39 calls `deriveGraphSpanReentryCursor`, checks the target term path and attempt 2. `assertNativeDomain` lines 83-84 requires one admitted `re_enter` route and checks carried successor input. Targeted active tests/support searches found no other call or executable graph-span assertion; the retained serialization test only round-trips a `re_enter` declaration. Do not delete these claims with One Surface.
2. The retained developer-mini `spanProgram` (3998-4025), four F_D stages (2195-2352), application (1818-1837) and span semantics provide a small existing vehicle. Initialize -> target -> select/re-enter -> target -> select/continue -> finalize should yield targetVisits 2, reentryApplications 1 and `Welcome <name>.`. Root explicitly ruled that the unique generic span cursor/re-entry assertions must move to a kept owner lane and that this F_D-only mini Program is an acceptable candidate vehicle, subject to actual proof. Move the pure target/attempt assertion and one real installed re-entry/event/input/replay discriminator onto it. It needs no live provider and can serve the package's real execution proof. If this previously unexercised kept path fails, report the failure for Root triage; do not repair unrelated execution in P6.
3. `t287-st1-installed-cross-owner-hello:2304-2390` uses the One Surface fixture only to prove kept supervised/direct and graph_function START refusal with zero append. `t292-td26-ps-default-root-mode:232-248` already proves the same installed Public table on an ordinary supervised default-library consumer, including zero events/actor calls. Remove or re-point the duplicate block with explicit attribution, preserving its neighboring ticket success and asset-start assertions. The by-handle direct-resolution assertion is a distinct kept relation; re-point it to that ordinary supervised vehicle if no existing kept lane states it.
4. Preserve `greetingAssetRef/greetingAssetHandle` in the fixture IDs: despite their placement among old One Surface IDs, the kept greeting Program's `publicAssetTargets` uses them at 3741-3742 and ST1 tests the asset START. Preserve span/identity/mixed-fibre helpers and shared predicates; remove only orphaned declarations after tracing users.
5. The remaining S03 action/intent/delta, four-authority ordering, no_action/gap_stop and run_gaps assertions describe the retired capability. Do not port them as kept obligations. Root-basis/ordinary child-call and cold-read assertions should be accounted for against retained owner lanes during the bounded deletion review; this preparation is not a claim of exhaustive assertion sufficiency.

## Tests and pins newly exposed by current source

| File | Required adjustment |
|---|---|
| `t287-gtl-serialization-publication` | Remove construction-authority tuple case 94-117, replace with Program-key rejection parity. Static JSON traversal shows 23 tuple occurrences, of which exactly 5 are construction authority tuples nested through ModulePublication/conformance/corpus: expected final total 18. Recompute from final emitted schema; local closure tuple diagnostic changes 3 to 2. Keep all remaining closure arity/order predicates. |
| `a5-f02-canonical-gtl-identity` | Delete actionPublication/twoRowActionPublication helpers, action-catalog canonicalization case 448-565 and duplicate-action tail 885-909. Retain generic authored set canonicalization, duplicate refusal, ordered topology/C/argument/closure sequence cases. |
| `t292-td34a-run-invocation-schema-owner` | Replace/remove the now-impossible four-authority-positive/five-authority-negative case at 182-186; preserve closure-event tuples, compose/batch and stricter policy/declaration checks. |
| `t292-td26-p4-basis-door-refused` | First case can no longer install an ActionCatalog-bearing Product; replace its earlier-admission expectations with final schema doors. Preserve P5's current treatment of the separate observation-input/B07 case. |
| `t292-td26-p2-module-refused` or one P6 refusal file | Reuse loader harness; test actionCatalog key absent success and present object/null/undefined/inherited refusal with unchanged message. Current source has no provider implementation consuming the nested argument; the input is constructed once in run_invocation_operation. |
| `w2-steel-single-start-closure` | Keep historical Catalog/view equality and update earlier refusal cause as above. |
| evidence-gate catalogue | Inspected main has 66 rows. Removing the two S03 rows alone gives 64: opt_in_run 13->12; input_present_writes_under_root 1->0. The lane remains 3 test cases. P5 may also change the roster, so compute the actual integrated-P5 -> P6 counts. |

Six type names leave each of `./gtl`, `./gtl/m01`, `./gtl/m02`: `GtlActionCatalog`, `GtlActionCatalogRow`, `GtlConstructionAuthorityBinding`, `GtlConstructionComposition`, `GtlConstructionPolicy`, `GtlConstructionSemanticAuthority`. m01/m02 currently export all contract types; gtl/index lists them explicitly. There is no separate public callable removal for private canonicalizeActionCatalog.

Generated identity route: `scripts/generate-product-manifest.mjs:208-239,478-529,566ff`.
- `contracts/schemas/gtl-serialization.schema.json` changes, so all four shared-document contract digests move: gtl-graph-function, gtl-module, gtl-c-program, gtl-program-conformance-input. Their base asset digest is `sha256:16c99e90c6c8d69e67e0efed9d0cbdf6ab76e901eb1a7eb444dde3a4cdcc9388`.
- The corpus's schema.contentDigest is rewritten by the generator; its asset digest/contract pin moves even with program IDs and expected diagnostics unchanged. Base corpus digest is `sha256:afaeedf5d170f65701b6321b613a5a236d86a5abe383c633114c9ebb2a91c32f`.
- Native root-declaration/m01/m02 inventories change. Other native inventories may include the altered declaration closure; compare actual generated inventory tuples rather than guessing only three affected rows. Capture productContentDigest, catalogDigest, capability graph identity and contribution-manifest/publication pins from the final build. Capability/member/contract-ID sets stay unchanged.
- Current shipped constructor roster at generator 988-995 and manifest publicationBindings has eight modules: default library, worksite construction/command execution/native work, requirement handoff, semantic stage/revision and self-conformance. Run the shallow all-Program key check on exactly these final constructor outputs, then the selected kept fixture/publication/readiness inputs. Do not infer absence from source-name search.

Qualification recipe location: the three S03 member rows are `T/test_env/qualification/recipe/verification-recipe.json:3258,3582,4270`; the developer-mini fixture source/support rows also remain there. No mirrored specification recipe row naming these paths was found in the targeted specification scan. This is an actual qualification recipe file, not a specification mirror. Old common rules say leave recipe/inventory for cut; P6 scope says withdraw recipe rows; B22 now schedules regeneration at the cut. Root must specify whether P6 deletes these three manifest-local rows or reports them for cut-time regeneration. There is no demonstrated need for a specification-first mirror commit.

## Smallest proposed final proof and handoff

1. One final build and the three existing lints; no baseline rebuild unless a failure needs attribution. Verify narrowed types/removed exports and schema/native parity via the touched serialization and framework-handoff compile surfaces.
2. A focused P6 door file: raw Program/module + emitted schema, Catalog admit, conformance, resolution, raw and established Catalog start/continuation, provider-key refusal. Reuse a valid pre-removal Program shape and the existing TD34/P2/P4 harnesses; no fabricated runtime truth. Observe zero basis/opened-call append where entry refuses.
3. One provider-free installed span-reentry success using the kept developer-mini graph, with six basis constants and fresh replay; retain pending-execution continuation coverage from the integrated P5 lane. If Root requires a separate default-library start, use the smallest existing scripted-gap path rather than a broad provider campaign.
4. Run touched files named above, m5-c-algebra-validation for the surviving law boundary, evidence-gate catalogue, and the changed fixture's focused ST1 scope. Broad default-library/registered/recursive/pack/install matrix belongs to the composed group unless this exact changed relation makes a named lane necessary.
5. Bounded history: immutable copy of live rc12 plus kept native-assessment fixture, and the concrete retained Catalog above. Existing P4 scripts exist at `/private/tmp/abg-td26p4-work/scripts/replay-log.mjs` and `probe-artifact-truth.mjs`, and its replay/truth lists survive. Copy/adapt into granted P6 scratch; do not execute the full 23/25 population per package. P5's newly refused One Surface subjects are not kept-history failures.
6. For unchanged **recorded** basis digests, `abg/calculus/execution_basis_record.ts` recomputes the exact original body and preserves all six keys. A fresh basis includes invocation, workspace, Catalog and implementation identities (`execution_basis.ts:2127-2190`), which can differ across builds/installs. Root should bind the old brief's “default-library start base/final basis digest unchanged” to the same retained identity-bearing body (or explicitly require a controlled identical-input construction); do not normalize away changed identity and then call whole digests equal.

Stop/return for an actually admitted kept publication or readiness basis that becomes inadmissible, a kept history read regression, a required register/corpus-ID/Consensus-schema withdrawal, required retired behavior in kept code, or a material upstream/authority change. The observed already-refused historical steel03 readiness basis and normal generated pin changes need their recorded distinction, not automatic new policy. Next action is Root's exact P5 integration binding and separate P6 Writer activation; this recipient stops here.


## Commands for the later Writer only (not executed in preparation)

From the exact newly activated P6 tenant, after P5 integration and its Return are bound:

```sh
npm run build
npm run lint:imports
npm run lint:lifecycle
npm run lint:calculus
```

Run each selected test file in the foreground, one at a time, using the existing command shape:

```sh
TMPDIR=/private/tmp/abg-td26p6-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<selected-file>.test.mjs
```

Create that disposable TMPDIR in the Writer's own scratch grant first. Use Node's `--test-name-pattern` only where a named kept case bounds the touched file; record its actual selected/skipped cases. New files, exact installed discriminator and any narrowed commands are fixed by the implementation activation. The bounded history scripts' interfaces are `node replay-log.mjs <exact T> <immutable selected log>...` and `node probe-artifact-truth.mjs <exact T> <immutable selected log>...`; use only the selected kept subjects, not their full saved lists.

Root instructed closure of preparation after these localized findings; further census/live measurement waits for the exact post-P5 Writer subject. Recorded Root rulings above are not an implementation activation.
