# TD-26 P2 Return: the Consensus and One Surface module

**Status:** in progress. The census and the recorded-history count are
committed; the specification, code and test commits follow.

Base: local `main` at `fc818876c`. Branch `claude/td26-p2-consensus-module`,
worktree `/private/tmp/abg-td26p2`. T is
`build_tenants/abiogenesis/typescript`. Scratch is `/private/tmp/abg-td26p2-work/`.

## Census

Searched at base for: the module ref `module://abg/consensus@5`, the Program
ref `program://abg/system/consensus-one-surface@5`, the handle prefix
`gtl://abg/consensus/`, the function prefix `graph-function://abg/consensus/`,
the files `gtl/consensus.ts`, `implementation/consensus.ts` and
`gtl/consensus_schema.ts`, the symbol `ABI5_SYSTEM_PRODUCT_SEMANTICS`, the hook
`projectPublicResult` and its type `ProductPublicResultProjection`, the roster
key `publicResultProjectionKinds`, the three vocabulary ids
`abg.vocabulary.review-ruling-kind`, `abg.vocabulary.consensus-round-outcome`,
`abg.vocabulary.consensus-fh-decision`, their value constants, and
case-insensitive `consensus`. `ticket_consensus` (the `project.read` case kept
until P7) and the 13 Consensus schema rows (kept by ruling 1) are kept names,
not removed ones.

### Specification

| File | What names the removed thing | Action |
|---|---|---|
| `specification/requirements/product/REQ-P-CONSENSUS.md` | `-004` second sentence (the `consensus-fh-decision` row); `-007` (review-ruling-kind row); `-008` (round-outcome row); Status line and Purpose name "vocabulary rows" | ruling 2 edit |
| `specification/requirements/product/README.md:13` | scope entry "Consensus schema and vocabulary contract rows" | ruling 2 edit; `:29` names the file only and stays |
| `specification/PRODUCT.md:1450-1461` | `ABG5-S05` scenario, reserved for 5.1, names the SYSTEM-owned Consensus GraphFunction | kept: P0 kept it as a 5.1 reservation; it states no 5.0 obligation |
| `specification/PRODUCT.md:1076-1079`, `:1225`, `:1373`, `:1617`; `INTENT.md:175`, `:316`; `GOALS.md` | 5.0 ships no Consensus GraphFunction | kept; already true |

The only literal citations of `REQ-P-CONSENSUS-007` and `-008` outside
specification are `scripts/generate-product-manifest.mjs:525,531` (the
vocabulary rows, removed here) and the generated
`contracts/qualification/rule-catalog.json`.

### Kept design notes (listed, not edited)

| Note and line | Sentence names |
|---|---|
| `ABI5_REALIZATION_CONSTITUTION.md:1502` (`L09`) | `G/consensus.ts::projectTicketConsensus` (current) |
| `ABI5_REALIZATION_CONSTITUTION.md:1566` (`J08`) | source join to `G/consensus.ts::projectTicketConsensus` |
| `ABI5_REALIZATION_CONSTITUTION.md:1412` (`E21`), `:1503` (`L10`), `:1672` (`R21`), `:1820`, `:1952` | the `ticket_consensus` read and an admitted Consensus result |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2178` (`D02`) | depends on `gtl/consensus.ts` |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:130`, `:2264` | history link; `ticket_consensus` row |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1341`, `:1360`, `:1401-1404`, `:2282` | `ticket_consensus`, `ConsensusOutputAuthority` |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:1118` | `ticket_consensus` |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:37`, `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md:516`, `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md:286` | 5.1 reservation of standalone Consensus |

`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1237` says the tenant's own
provider is in `product/builtin_semantics.ts`; that stays true.

### Source (`T/code/src`)

| File | Declarations removed | Callers and kept importers |
|---|---|---|
| `gtl/consensus.ts` (5,267 lines) | whole file: `CONSENSUS_IDS`, `constructConsensusModulePublication`, the construct/is/evaluate/project functions, `consensusCatalogApplicationBindings`, `CONSENSUS_NATIVE_CONTRACT_DEFINITIONS`, `bindConsensusReplay`, `validateConsensusContractValue`, the system semantics binding `:5218-5219` and the implementation descriptor path `:4937` | `gtl/index.ts:170-294` (re-exports), `implementation/consensus.ts:43`, `product/builtin_semantics.ts:64-86`, the generator `:59`, `:1069` |
| `implementation/consensus.ts` (819 lines) | whole file: 17 implementation descriptors, 16 `realizeConsensus*` functions | `implementation/index.ts:61-95` (re-exports only); `implementation/index.js` is imported by `t287-post-binding-worksite-write` and `support/root-installed-environment.mjs:356`, neither of which names Consensus |
| `gtl/consensus_schema.ts` (1,839 lines) | the reviewer and submitter candidate types and response schemas (`:1-275`), the four value rosters and two response schemas (`:1767-1778`), `CONSENSUS_SCHEMA_REQUIRED_KEYS` (`:1796-1839`) and the imports they alone use | kept: `CONSENSUS_PUBLIC_SCHEMA` (`:276-1765`) and `CONSENSUS_SCHEMA_ASSET_BINDINGS` (`:1780-1794`), read by the generator `:54-55` |
| `gtl/index.ts` | the Consensus re-export block `:170-294` | it keeps re-exporting the two kept constants from `./consensus_schema.js` (their removal is P7's); the composition types `:123-165` are P6's |
| `implementation/index.ts` | `:61-95` | none |
| `product/builtin_semantics.ts` (1,007 lines) | the `../gtl/consensus.js` import `:64-86`; `hasExactConsensusCatalogApplications` `:386-436`; `admitSystemInput`; `validateSystemContractValue`; `resolveSystemCatalogApplicationValue`; `validateSystemResultEvidenceLineage`; `ABI5_SYSTEM_PRODUCT_SEMANTICS` `:587-709` | `ABI5_SYSTEM_PRODUCT_SEMANTICS` is named only by `gtl/consensus.ts:5219` (a module path and symbol string) and by `m5-consensus-module`; every other provider in the file stays |
| `product/semantics.ts` | `ProductPublicResultProjection` `:139-144`; the `projectPublicResult?` field `:214-222`; the loader clause that admitted a function-valued hook | ruling 7 adds the two refusal clauses in the existing condition |
| `product/index.ts:147` | the type re-export `ProductPublicResultProjection` | none |
| `product/public_contract_publication.ts:102-103`, `:120` | the two vocabulary corpus ids; the count check 44 | the 9 Consensus schema ids `:87-95` stay |
| `shared/capability_contracts.ts` | nothing (ruling 1) | row `:82` keeps 9 schema and 3 vocabulary ids as projected contracts |

`product/project_read_operation_contracts.ts` names `ticket_consensus` only;
it is kept until P7.

### Scripts and package metadata

| File | Removed | Kept |
|---|---|---|
| `scripts/generate-product-manifest.mjs` | the three vocabulary value imports `:51-57`; `constructConsensusModulePublication` import `:59` and call `:1069`; the vocabulary paths `:172-177`, writes `:311-334`, digests `:420-428`, rows `consensusVocabularyRows` `:520-552` and spread `:611` | the schema path `:158`, write `:297-299`, digest `:416`, `consensusContractRows` `:500-518`, spread `:610`; `closedVocabulary` (still used for the GTL diagnostic vocabulary); a mkdir for `contracts/vocabularies`, re-keyed off the removed path |
| `scripts/clean.mjs:10` | nothing | removes `consensus.schema.json` (P7) |
| `package.json` | `test:m5:consensus-unit` `:121`; `m5-consensus-module` in `test:m5` `:125` | |
| root `.gitignore:46-48` | the three vocabulary files | `:45` (`consensus.schema.json`) |

### Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| File | Use | Action |
|---|---|---|
| `tests/m5-consensus-module.test.mjs` (2,072 lines, 16 cases) | subject | delete; its law case `:628-664` moves first (ruling 3) |
| `tests/t287-consensus-ref-shape.test.mjs` (114 lines, 2 cases) | subject: reference arrays and the evaluation-basis digest of `gtl/consensus.ts` | delete |
| `support/d2-frame-fixture.mjs:39` | Consensus constructor in a shipped-publication list | edit |
| `support/installed-qualification-conservation.mjs:138`, `:350` | shipped-publication list | edit |
| `tests/a5-f02-canonical-gtl-identity.test.mjs` | the Consensus Program as the action-catalog vehicle | re-point to a structural Program with a hand-authored action catalog |
| `tests/r4-catalog-admission.test.mjs` | the Consensus `node_type` as the admission vehicle | re-point to the structural publication with an inline `node_type` |
| `tests/steel-basic-cli-public.test.mjs:626-629` | shipped-publication list | edit |
| `tests/steel-consumer-declaration.test.mjs:416` | shipped-publication list | edit |
| `tests/t287-c2-child-program.test.mjs:15` | shipped-publication list | edit |
| `tests/t287-result-evidence-lineage-projection.test.mjs:250` | comment | edit |
| `tests/t292-td28d-command-forward-refused.test.mjs:75`, `:112` | shipped-publication list | edit |
| `tests/t292-td34a-run-invocation-schema-owner.test.mjs:117` and uses | the Consensus Program as a composition vehicle | re-point to the worksite-construction Program |
| `tests/t292-td76-record-schema-keys.test.mjs` | Consensus record keys as a vehicle | edit |
| `tests/w2-steel-serial-branch-installed.test.mjs:418`, `tests/w2-steel-single-start-installed.test.mjs:416` | shipped-publication list | edit |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs:686-698`, `:1486` | shipped-publication list; Consensus as the conformance vehicle | edit; re-point |
| `uat/public-setup.mjs:7` | shipped-publication list | edit |
| `tests/t287-framework-handoff-types.test.mjs`, `types/framework-handoff.compile.ts` | `ticket_consensus` | unchanged |
| `tests/t287-wave2-owner-contract-source-set.test.mjs`, `t287-pfc-f08a-product-verification-boundary`, `t287-st2a-g-capability-definition-graph` | Consensus capability and schema rows | unchanged (ruling 8) |
| `qualification/tenant-manifest.json`, `inventory.json`, `recipe/*.json` | vocabulary ids, file members | not edited; members listed in the Return |

No fixture under `T/test_env/fixtures` names the module; no provider in the
tenant, its fixtures, `test_env/sandbox-uat`, `test_env/uat` or the main
checkout's `test_env/downstream` carries `publicResultProjectionKinds`, and
only `ABI5_SYSTEM_PRODUCT_SEMANTICS` carries `projectPublicResult`.

## Recorded history

Scanned with `rg -uu -l -F` over `/Users/jim/src/apps/abiogenesis/.ai-workspace`
and the main checkout's `T/test_env`, files `*.json`, `*.jsonl`, `*.ndjson`,
`*.txt`, `*.log`, no size cap; compressed archives (`*.gz`, `*.zst`) are not
scanned except the two tracked fixture logs, which are in the artifact-truth set
uncompressed. Files that name each value:

| Value | Files |
|---|---|
| `program://abg/system/consensus-one-surface@5` | 6,916 |
| `module://abg/consensus@5` | 7,100 |
| `build/code/src/implementation/consensus.js` | 4,585 |
| `ABI5_SYSTEM_PRODUCT_SEMANTICS` | 3,879 |
| `abg.vocabulary.review-ruling-kind` | 7,000 |
| `abg.vocabulary.consensus-round-outcome` | 7,000 |
| `abg.vocabulary.consensus-fh-decision` | 6,995 |
| `graph-function://abg/consensus/` | 7,314 |
| `gtl://abg/consensus/` | 6,985 |

These are recorded copies of an install: manifests, locks, Catalog views,
Public contract artifacts and setup identities. 452 of them are event logs
(23.7 GB). 377 hold a Run start (`invocation_admitted`); in none is the
admitted `programRef` the One Surface Program, and in none does an
`implementation_admitted` row carry the module path
`build/code/src/implementation/consensus.js`. The other 75 hold no Run start
and name the values only inside recorded install artifacts and locks. No
recorded Run executed the module this package removes.

The plan's two One Surface replay subjects select fixture Programs:
`rc11-qualification-01/evidence-generation-02/raw/selected-action/…/events.jsonl`
admits `program://selected-action/root@5` with implementation module
`build/index.js`, and `rc4-native-recovery-01/…/hc2-current-intent/continue-events.jsonl`
admits `program://exact-intent/root@5` with `build/index.js`. Neither loads the
system module, so deleting it should leave their replay unchanged; the replay
comparison below shows it.
