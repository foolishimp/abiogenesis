# TD-26 P2 Return: the Consensus and One Surface module

**Status:** complete; no stop condition holds. The Consensus and One Surface
module, the system semantics and the three Consensus vocabularies are removed.
The 13 Consensus schema contracts and the register stay (ruling 1). The shipped
publications go from 9 to 8, the corpus ids from 44 to 42 and the Public
contract rows from 75 to 72. The 23 replays and artifact truth over 25 stores
are identical on base and final. No kept lane goes from pass to fail.

Commits on `claude/td26-p2-consensus-module`, in order:
- `27187078e`: census and recorded history;
- `691a226f2`: specification;
- `d2279ea17`: code;
- `87de4a2e5`: tests;
- this Return.

Generated files are not committed.

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

## Specification edits

Commit `691a226f2`, before any code.

| File | Change |
|---|---|
| `specification/requirements/product/REQ-P-CONSENSUS.md` | `REQ-P-CONSENSUS-007` (the `abg.vocabulary.review-ruling-kind` roster) and `REQ-P-CONSENSUS-008` (the `abg.vocabulary.consensus-round-outcome` roster) deleted. From `-004`, the sentence "The `abg.vocabulary.consensus-fh-decision` row shall publish the closed roster `accept_with_dissent \| reject`." deleted; `-004` keeps the 13 schema rows. Status line: "Consensus schema and vocabulary rows" becomes "Consensus schema rows". Purpose: "each Consensus schema and vocabulary row" becomes "each Consensus schema row". |
| `specification/requirements/product/README.md:13` | "Consensus schema and vocabulary contract rows" becomes "Consensus schema contract rows". `:29` names the file only and stays. |

No other identifier changes. The remaining requirement identifiers of the
family (`-001` to `-006`) keep their numbers.

## Design sentences listed (not edited)

The census table "Kept design notes" lists them. The whole-word search at head
(below) finds these kept-design hits, all listed there:
`ABI5_REALIZATION_CONSTITUTION.md:1502`, `:1566`, `:1672` (the
`projectTicketConsensus`, `ConsensusResult` and `TicketConsensusProjection`
names of the `ticket_consensus` read), `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1341`
and `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2178`
(`D02` depends on `gtl/consensus.ts`). After this package these sentences cite a
file and symbols that do not exist at head: `G/consensus.ts::projectTicketConsensus`
(`:1502`, `:1566`) and `gtl/consensus.ts` (`D02`). The design package of the
retirement owns them.

## Source lines removed by file

Commit `d2279ea17`. `git diff --numstat fc818876c d2279ea17`, added/deleted:

| File | + | - |
|---|---|---|
| `code/src/gtl/consensus.ts` | 0 | 5,267 (deleted) |
| `code/src/implementation/consensus.ts` | 0 | 819 (deleted) |
| `code/src/product/builtin_semantics.ts` | 0 | 349 |
| `code/src/gtl/consensus_schema.ts` | 0 | 153 |
| `code/src/gtl/index.ts` | 1 | 127 |
| `code/src/implementation/index.ts` | 0 | 35 |
| `code/src/product/semantics.ts` | 2 | 20 |
| `code/src/product/public_contract_publication.ts` | 1 | 3 |
| `code/src/product/index.ts` | 0 | 1 |
| `scripts/generate-product-manifest.mjs` | 1 | 82 |
| `package.json` | 1 | 2 |
| root `.gitignore` | 0 | 3 |
| **Source (`code/src`)** | **4** | **6,774** |
| **Scripts, package, ignore** | **2** | **87** |

What each kept file keeps or gains:

- `gtl/consensus_schema.ts` (1,839 to 1,686 lines) keeps `CONSENSUS_PUBLIC_SCHEMA`,
  `CONSENSUS_SCHEMA_ASSET_BINDINGS`, the imports `JsonValue` and `deepFreeze`,
  and the three private response-schema constants `consensusReviewerResponseSchema`,
  `consensusSubmitterResponseSchema` and `consensusSubmitterResponseRecordSchema`.
  The schema literal embeds those three under `$defs`, so they stay for the
  byte identity of `consensus.schema.json` (ruling 1). The plan estimated about
  330 lines here; 153 go because the literal needs the three constants.
- `gtl/index.ts` re-exports only `CONSENSUS_PUBLIC_SCHEMA` and
  `CONSENSUS_SCHEMA_ASSET_BINDINGS` from `./consensus_schema.js`.
- `product/builtin_semantics.ts` (1,007 to 658 lines) loses the
  `../gtl/consensus.js` import and `hasExactConsensusCatalogApplications`,
  `admitSystemInput`, `validateSystemContractValue`,
  `resolveSystemCatalogApplicationValue`, `validateSystemResultEvidenceLineage`
  and `ABI5_SYSTEM_PRODUCT_SEMANTICS`. Every other provider stays.
- `product/semantics.ts` loses `ProductPublicResultProjection` and the
  `projectPublicResult?` field. The loader's existing refusal condition gains
  one clause per retired key (ruling 7):

  ```ts
      "publicResultProjectionKinds" in value ||
      "projectPublicResult" in value
    ) {
      throw new TypeError("installed Product semantics provider differs from its published binding");
  ```

  `in` refuses an inherited key as well as an own key. No message or code is
  new, and no exact-key check is added for other names. The `actionCatalog`
  input field stays (P6).
- `product/public_contract_publication.ts` drops
  `abg.vocabulary.review-ruling-kind` and `abg.vocabulary.consensus-round-outcome`
  from `MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS`; the count check moves from 44
  to 42. (`abg.vocabulary.consensus-fh-decision` was never a corpus id.)
- The generator drops the three vocabulary value imports, the
  `constructConsensusModulePublication` import and call, the vocabulary paths,
  writes, digests, `consensusVocabularyRows` and its spread. It keeps the schema
  path, write, digest and `consensusContractRows`. The `contracts/vocabularies`
  mkdir is re-keyed to `join(root, "contracts/vocabularies")` because the GTL
  diagnostic vocabulary still writes there.
- `package.json` drops `test:m5:consensus-unit` and `m5-consensus-module` from
  `test:m5`. Root `.gitignore` drops the three vocabulary files and keeps
  `consensus.schema.json`.

`shared/capability_contracts.ts` is untouched (ruling 1).

### Kept importers (ruling 5)

| Kept importer | What it needed | Where it is now |
|---|---|---|
| `scripts/generate-product-manifest.mjs` | `CONSENSUS_PUBLIC_SCHEMA`, `CONSENSUS_SCHEMA_ASSET_BINDINGS` | unchanged import from `gtl/consensus_schema.js` |
| `gtl/index.ts` barrel | the same two constants | re-exported from `./consensus_schema.js` (P7 removes them with the schema) |
| `product/index.ts` | `ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS` from `builtin_semantics` | unchanged; `ABI5_SYSTEM_PRODUCT_SEMANTICS` was never re-exported |
| `implementation/index.js` importers (`tests/t287-post-binding-worksite-write`, `support/root-installed-environment.mjs:356`) | non-Consensus descriptors | unchanged; neither named Consensus |
| `gtl/graph_applications.ts`, `gtl/declarations.ts`, `gtl/c_algebra.ts` and the other helpers the module called | nothing from the module | they keep their other callers; nothing moved |

No item moved and no stub or re-export shell remains. `tsc --noEmit` is clean,
and `tsc --noEmit --noUnusedLocals` reports the same 12 findings on base and
head (none in a file this package touched).

## Door table

Probe `/private/tmp/abg-td26p2-work/scripts/door-p2.mjs`, run against the base
build (`/private/tmp/abg-td26p2-work/base-root`, `fc818876c`) and the final
build. Outputs: `/private/tmp/abg-td26p2-work/door/door-base.txt` and
`door-final.txt`. The refusal lane `tests/t292-td26-p2-module-refused.test.mjs`
asserts every final-column refusal, except the Catalog admission row, which
`t287-w2-05-install-catalog-owner-chain` asserts.

| Door | Value | Base | Final |
|---|---|---|---|
| Shipped module publications (generator, `gtl` exports) | the Consensus publication | 9 constructors; `constructConsensusModulePublication` exported | 8; no `gtl` export matches `/Consensus/` except `CONSENSUS_PUBLIC_SCHEMA` |
| Catalog admission (`CatalogOperationPort.admit`, tenant lock row) | a publication whose `moduleRef` is `module://abg/consensus@5` | the real publication is bound by the tenant lock row | each row `rejected`, reason `publication_identity_mismatch`; not bound; the Catalog is still built with the same entries |
| Catalog built from the shipped publications | | 40 entries, 7 declaration entries | 32 entries, 0 declaration entries |
| `project.read#catalog_list` (`projectCatalogList`, workspace visibility) | the same Catalog | `product_project_read_result`, 47 rows, 15 of them Consensus handles | `product_project_read_result`, 32 rows, none |
| `project.read#catalog_describe` (`projectCatalogDescription`) | `gtl://abg/consensus/submitter-reviewer-rounds`, `catalog://abg/consensus/subject`, `catalog://abg/consensus/overlay/ruling` | `product_project_read_result`, projected (`graph_function`, `node_type`, `overlay`) | `product_project_read_refusal`, `unknown_handle` |
| `lookupGraphFunction` | `gtl://abg/consensus/submitter-reviewer-rounds`, `graph-function://abg/consensus/one-surface@5` | catalog entry | `null` |
| `narrowGraphFunctionCatalog` (`catalog.view`) | each of the gtl handle, the One Surface function, `catalog://abg/consensus/subject`, `catalog://abg/consensus/overlay/ruling` | `graph_function_catalog_view` | `catalog_construction_refusal`, `unknown_allowlist_entry` |
| `resolveExecutionDeclarationClosure` | `program://abg/system/consensus-one-surface@5` with the One Surface function | passes the Program and function lookup (the probe's unready Catalog then throws) | `execution_declaration_closure_refusal`, `absent` |
| `applyCatalogDeclaration` (`catalog.apply`) | `node_type` `catalog://abg/consensus/subject`, `overlay` `catalog://abg/consensus/overlay/ruling` | `declaration_application` | `declaration_application_refusal`, `outside_view` |
| Run start or invocation (`resolveProductExecution`, `product/execution_resolution.ts:456`) | the One Surface Program | read, not run: resolves | read, not run: `resolveProgramDeclarationClosure` (`:541-548`) gives the `absent` closure refusal above, which `closureRefusal` (`:421`) returns as `product_execution_resolution_refusal`, code `absent`, stage `declaration_closure` |
| Product semantics loader (`productSemanticsFromModules`) | binding `product-semantics://abiogenesis/system@5`, symbol `ABI5_SYSTEM_PRODUCT_SEMANTICS` over `build/code/src/product/builtin_semantics.js` | loads; `projectPublicResult` is a function | `TypeError` "installed Product semantics provider differs from its published binding" (the symbol is absent) |
| Product semantics loader | a provider with `publicResultProjectionKinds: []` | loads | same `TypeError` |
| Product semantics loader | `publicResultProjectionKinds: ["result"]` | loads | same `TypeError` |
| Product semantics loader | `projectPublicResult` a function | loads | same `TypeError` |
| Product semantics loader | `projectPublicResult: undefined` | loads | same `TypeError` |
| Product semantics loader | `projectPublicResult: null` | `TypeError` (non-function hook) | same `TypeError` |
| Product semantics loader | `projectPublicResult` inherited from the prototype | (not probed) | same `TypeError` |
| Product semantics loader | a provider with neither key | loads | loads |
| Public contract catalog | the three Consensus vocabulary ids | published rows | absent; `contracts/vocabularies/<id>.json` absent (`ENOENT`) |

The two `project.read` rows come from a second probe,
`/private/tmp/abg-td26p2-work/scripts/door-read.mjs` (outputs
`door/door-read-base.txt`, `door/door-read-final.txt`), which calls the owner
functions over the same Catalog. A caller of a kept Public read observes the
Catalog of eight publications instead of nine: the rows of the retired module
are absent from `catalog_list`, and describing one is refused `unknown_handle`.
Nothing else a kept read returns changes (lanes, replay and artifact truth
below).

No refusal code or message is new. The vocabulary ids have no door of their
own: a caller reaches them only as published contract rows, which are gone.

Providers carrying a retired key at base: only `ABI5_SYSTEM_PRODUCT_SEMANTICS`
carried `projectPublicResult`; none carried `publicResultProjectionKinds`. The
search covered the tenant source, `T/test_env/fixtures`, `T/test_env/uat`,
`T/test_env/sandbox-uat` and the main checkout's `T/test_env/downstream`. At
head, none carries either key; the only source hits are the two refusal
clauses in `product/semantics.ts:439-440`.

## Tests and fixtures

Commit `87de4a2e5`.

| File | Change | Reason |
|---|---|---|
| `tests/m5-consensus-module.test.mjs` (2,072 lines, 16 cases) | deleted | Its subject is the module. The law case moved first (below). The case "S05 serialized Consensus schema is one exact projection" asserted that the file equals the constant; the generator writes the file from the constant, `consensus.schema.json` is byte-identical on base and final, and the generator reproducibility lane rebuilds it. The kept half of "S05 generic Public and ABG invocation basis contain no Consensus branch" (generic C-call result admission invokes the Product evidence-lineage relation with the admitted evidence) is shown by behaviour in `t287-result-evidence-lineage-projection`, which calls `admitOwnedCCallResult` and records the evidence the relation receives; its source scan for the word Consensus is the whole-word search below. |
| `tests/t287-consensus-ref-shape.test.mjs` (114 lines, 2 cases) | deleted | Its subject is the reference arrays and evaluation basis of `gtl/consensus.ts`. |
| `tests/m5-c-algebra-validation.test.mjs` | +36: the law case | Ruling 3, below. |
| `tests/t292-td26-p2-module-refused.test.mjs` | new, 106 lines, 4 cases | The refusal lane (door table). |
| `tests/a5-f02-canonical-gtl-identity.test.mjs` | `consensusPublication()` becomes `actionPublication()`: the structural Program `gtl.FAN_OUT_IDS.programRef` with a hand-authored one-row action catalog (`catalogDigest = sha256Canonical(body)`, `catalogRef = action-catalog://product/<hex>`), as in `fb86974e3`; three sites re-pointed | The Consensus Program was the vehicle for action-catalog identity; the claims (canonical identity, digest law) stay on a kept Program. |
| `tests/r4-catalog-admission.test.mjs` | the structural publication with an inline `node_type` row (`node-type://abiogenesis/catalog-proof/subject@5`) replaces the Consensus `node_type`; `STRUCTURAL_IDS.programRef` replaces the One Surface Program (4 sites); added `assert.equal(declaration.handle, NODE_TYPE_HANDLE)` | Vehicle. Admission of a declaration row and its application stay asserted. |
| `tests/t292-td34a-run-invocation-schema-owner.test.mjs` | `consensus()` becomes `vehicle()` (worksite construction) with `fourAuthorityComposition()`; the five-authority case sets a 4-authority composition on `programs[0]`, asserts the schema admits it, then adds a fifth | Vehicle. The bound on construction authorities stays asserted, now with a positive control. |
| `tests/t292-td76-record-schema-keys.test.mjs` | `consensus()` becomes `vehicle()` (default governance library, which carries rules); 6 sites | Vehicle. |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs` | publication list 9 to 8; the `catalog.view` allowlist re-pointed from the Consensus `node_type` and `overlay` rows to the default library's `executive@5` and `executive-step@5` rows, with `assert.equal(catalog.declarationEntries.length, 0)`; conformance vehicle `publications[1]` (Consensus) becomes `publications[0]` (default library Program); a Catalog admission block added (a publication named `module://abg/consensus@5` is rejected `publication_identity_mismatch` and not bound); a stale RETIRED comment deleted | The core Catalog has no declaration rows after P2. `steel-consumer-declaration` keeps the view and apply claims over a consumer's `node_type` and `overlay` rows. |
| `tests/steel-basic-cli-public.test.mjs` | Consensus constructor removed; comment "eight core publications"; stale RETIRED comment deleted; the first `catalog.view` allowlist re-pointed from the Consensus `node_type` and `overlay` rows to the default library's `executive@5` and `executive-step@5` rows, with `assert.equal(catalog.declarationEntries.length, 0)` | Publication list; and, as in `w2-05`, the core Catalog has no declaration rows after P2. The census listed this file as a publication list only; its first final run failed at `assert.ok(nodeRow)` (`:731`) and showed the second use. |
| `tests/steel-consumer-declaration.test.mjs`, `tests/t287-c2-child-program.test.mjs`, `tests/t292-td28d-command-forward-refused.test.mjs` (`:75` and `SHIPPED`), `tests/w2-steel-serial-branch-installed.test.mjs`, `tests/w2-steel-single-start-installed.test.mjs` | Consensus constructor removed | publication lists |
| `tests/t287-result-evidence-lineage-projection.test.mjs:250` | comment "native-work consumer coordinates" | It named the system semantics. |
| `support/d2-frame-fixture.mjs` (`nativePublications`), `support/installed-qualification-conservation.mjs` (two lists), `uat/public-setup.mjs` | Consensus constructor removed | publication lists |

No support module or fixture is left without an importer, so none is deleted.
No fixture under `T/test_env/fixtures` changes.

Coverage of declaration rows after the re-points. At base, `steel-basic-cli-public`
and `t287-w2-05-install-catalog-owner-chain` ran the installed Public
`catalog.view` over the core Consensus `node_type` and `overlay` rows. The core
Product now publishes no declaration row, so both view callable rows. The
installed Public view and apply over declaration rows remain in
`steel-consumer-declaration` (a consumer's rows), which is gated by
`ABI5_STEEL02_EVIDENCE_PATH` and `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` and skips
here on base and final. The owner functions that the Public binding calls
(`narrowGraphFunctionCatalog`, `applyCatalogDeclaration`) keep ungated
coverage over `node_type` and `overlay` rows in `m5-installed-portability` and
over a `node_type` row in `r4-catalog-admission`.

### Where the law case went (ruling 3)

`m5-consensus-module.test.mjs:628-664` at base, "S05 every non-callable catalog
row references one published contract", states the validator law in
`gtl/validation.ts`: a non-callable contribution's `declarationOrContractRef`
names one contract of its publication. It now lives in
`tests/m5-c-algebra-validation.test.mjs`, under the same name, before the
"Retired (T-292 TD-60)" comments. It runs on the structural publication with
one added `node_type` contribution (`node-type://m5/non-callable/subject@5`)
and its contract (`contract://m5/non-callable/subject@5`). Both original
assertions are kept (`static_validation_refusal`; an `invalid_reference`
diagnostic whose path includes the row's handle), and it adds a positive
control: with the contract present, validation returns `publication_validation`.

## Generated contracts and identity digests

Final build at `d2279ea17` with the tests of this package. Not committed; the
Executive regenerates the identity at merge. A second final build gives a
byte-identical manifest and `contracts/` tree.

| Digest | Base (`fc818876c`) | Final |
|---|---|---|
| `productContentDigest` | `sha256:00078e2affbecd0862175ed2c6cef201a271dcf9d37120dcc313b95d565e33bf` | `sha256:5d734e3ab4fa90dea76d845ea18a38e84844b16da1dacd5d974cb58637c6b6d4` |
| `contributionManifestDigest` | `sha256:bb085c63f07951f96de93f48aec92da94e557249e7653654d661b3d0277d353b` | `sha256:cce830d881786e354ff8c4203010a3fe0cdaa107070e6057f39c3a65401c57de` |
| `publicContractCatalog.catalogDigest` | `sha256:0c8b4739120a3a4e6779fd1036a51a9b8ea5c0c8ac9d78b05cc02ee2cd52157c` | `sha256:64ce2e34010d30a7c55820694c6340a66f9a98b2b648d0cade8e1ea9865fb26e` |
| capability `graphDigest` | `sha256:a1abef81b9ff556545d49dc024d47107421e83777b0510e31d1dbfabab12c99f` | `sha256:11dd7220a0b1ac393909180d823558f1a114ca802cc598c4c77f226a6088b854` |

Content changes by file under `T/contracts`:

- `vocabularies/review-ruling-kind.json`, `vocabularies/consensus-round-outcome.json`,
  `vocabularies/consensus-fh-decision.json`: no longer generated. They are
  tracked, so the working tree shows them deleted; the Executive's
  regeneration at merge removes them.
- `capabilities/capability-definition-graph.json`: 16 rows on base and final.
  Capability ids, owning and projected contract ids and definition-key lists
  are identical (`capgraph-cmp.py`: no non-identity difference). Only identity
  fields change.
- `schemas/consensus.schema.json`: byte-identical.
- Every other file under `contracts/`: byte-identical.

`product-toolchain-manifest.json` (comparison scripts `manifest-cmp.mjs` and
`inventory-cmp.mjs`; outputs `/private/tmp/abg-td26p2-work/manifest-cmp.json`,
`inventory-cmp.json`):

| Part | Base | Final | Change |
|---|---|---|---|
| `publicContractCatalog.rows` | 75 | 72 | the three vocabulary rows removed |
| `contributionManifest.publicationBindings` | 9 | 8 | `module://abg/consensus@5` removed |
| `contributionManifest.rows` | 47 | 32 | 15 removed: 7 `catalog://abg/consensus/...` declaration rows, 7 `graph-function://abg/consensus/...` rows, `gtl://abg/consensus/submitter-reviewer-rounds` |
| declaration inventories (`nativeTypedLocator.declarationInventory`, 50 rows) | | | in 47 rows `build/code/src/gtl/consensus.d.ts` is removed and six declaration digests change (`gtl/consensus_schema`, `gtl/index`, `product/builtin_semantics`, `product/index`, `product/public_contract_publication`, `product/semantics` `.d.ts`); no other difference beyond identity values |
| `productRelativeLocators` | 5,306 | 5,299 | `build/code/src/gtl/consensus.{js,d.ts}`, `build/code/src/implementation/consensus.{js,d.ts}` and the three vocabulary JSONs removed |
| `MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS` | 44 | 42 | `abg.vocabulary.review-ruling-kind`, `abg.vocabulary.consensus-round-outcome` |

Nothing else changes in the generated contracts.

### What reads a projected id without a published contract (ruling 2)

Register row `shared/capability_contracts.ts:82`
(`abg.capability.catalog.invoke-graph-function@5`) keeps the three vocabulary
ids among its projected contract ids. `projectedPublicContractIds` is read only
by `capabilityRefsForContract` and by the register's empty-graph check.
`capabilityRefsForContract` is called by the generator,
`product/public_contract_publication.ts`, `self_conformance`,
`product/environment.ts:678` and `:767`, and `verify_product`, each time for a
contract that is published or recorded; none starts from a register id and
looks for its contract. A projected id with no published row is therefore not
read at head. Recorded locks still pass the identity check (lock probe below),
and artifact truth over recorded stores is unchanged (next sections).

## Lanes before and after

Each file was run alone with `node --experimental-vm-modules --test
--test-concurrency=1 --test-reporter=tap`, TMPDIR `/private/tmp/abg-td26p2-tmp`,
`ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`. TAP output
is in `/private/tmp/abg-td26p2-work/lanes-{base,final,refreshed}/`.

- **Base:** `/private/tmp/abg-td26p2-work/base-root` (`fc818876c`, built).
- **Final:** the worktree at `d2279ea17` with the tests of `87de4a2e5`, built,
  with the generated files present while the lanes ran and restored
  afterwards.
- **Refreshed:** `/private/tmp/abg-td26p2-work/final-root`, the tree of
  `87de4a2e5` built, with the candidate-basis fixture refreshed by
  `node scripts/refresh-candidate-basis.mjs`. It equals `git archive 87de4a2e5`
  apart from the generated files.
- **"Edited file on base":** the final version of a vehicle-swapped test, run
  on the base build as a temporary copy (since removed).

| Lane | Base pass/fail/skip | Final pass/fail/skip |
|---|---|---|
| `t292-td26-p2-module-refused` (new) | 0/4/0 | 4/0/0 |
| `m5-consensus-module` | 16/0/0 | deleted |
| `t287-consensus-ref-shape` | 2/0/0 | deleted |
| `a5-f02-canonical-gtl-identity` | 7/0/0; edited file on base 7/0/0 | 7/0/0 |
| `r4-catalog-admission` | 8/0/0; edited file on base 8/0/0 | 8/0/0 |
| `m5-c-algebra-validation` | 18/0/0; edited file on base 19/0/0 | 19/0/0 (the moved law case) |
| `t292-td34a-run-invocation-schema-owner` | 4/0/0; edited file on base 4/0/0 | 4/0/0 |
| `t292-td76-record-schema-keys` | 9/0/0; edited file on base 9/0/0 | 9/0/0 |
| `t292-td28d-command-forward-refused` | 6/0/0 | 6/0/0 |
| `steel-basic-cli-public` | 1/0/0; edited file on base 0/1/0 (publication-list pin: the base manifest binds nine) | 1/0/0 (first final run 0/1/0 before its re-point) |
| `t287-w2-05-install-catalog-owner-chain` | 3/0/0; edited file on base 2/1/0 (same pin) | 3/0/0 |
| `steel-consumer-declaration` | 0/0/1 | 0/0/1 |
| `t287-c2-child-program` | 4/0/0 | 4/0/0 |
| `t287-result-evidence-lineage-projection` | 1/0/0 | 1/0/0 |
| `w2-steel-serial-branch-installed` | 0/0/2 | 0/0/2 |
| `w2-steel-single-start-installed` | 0/0/1 | 0/0/1 |
| `w2-steel-single-start` | 7/0/0 | 7/0/0 |
| `w2-steel-single-start-closure` | 1/0/1 | 1/0/1 |
| `t287-framework-handoff-types` | 6/0/0 | 6/0/0 |
| `t287-wave2-owner-contract-source-set` | 15/0/0 | 15/0/0 |
| `t287-pfc-f08a-product-verification-boundary` | 1/0/0 | 1/0/0 |
| `t287-st2a-g-capability-definition-graph` | 4/0/0 | 4/0/0 |
| `t287-w2-05-generator-package-reproducibility` | 2/0/0 | 2/0/0 |
| `r10-projection-contracts` | 11/0/0 | 11/0/0 |
| `t287-default-library` | 34/0/1 | 34/0/1 |
| `t287-default-library-fulfillment` | 7/0/0 (see below) | 7/0/0 |
| `t287-default-library-prerequisites` | 7/0/0 | 7/0/0 |
| `t287-default-library-recoverable-failure` | 5/0/0 | 5/0/0 |
| `t287-default-library-reviews` | 10/0/0 | 10/0/0 |
| `t287-registered-graph-selection` | 1/0/0 | 1/0/0 |
| `t287-recursive-registered-selection` | 7/0/0 | 7/0/0 |
| `t287-recursive-failure-foldback` | 8/0/0 | 8/0/0 |
| `t287-native-workspace-work` | 43/0/0 | 43/0/0 |
| `t287-native-assessment-evidence` | 4/0/0 | 4/0/0 |
| `t287-gtl-serialization-publication` | 9/0/0 | 9/0/0 |
| `t292-td60b-evidence-gate-catalogue` | 3/0/0 | 3/0/0 |
| `t292-td26-ps-default-root-mode` | 4/0/0 | 4/0/0 |
| `r1-packed-artifact` | 1/0/0 | 1/0/0 |
| `r2-clean-install` | 1/0/0 | 1/0/0 |
| `r3-workspace-binding` | 1/0/0 | 1/0/0 |
| `t287-historical-source-resource` | 4/0/0 | 4/0/0 |
| `r10-child-proof` | 10/0/0 | 10/0/0 |
| `t287-cross-cut-public-read` | 5/0/0 | 5/0/0 |
| `t287-selected-action-authority` | 2/0/1 | 2/0/1 |
| `t287-common-computational-library` | 16/0/0 | 16/0/0 |
| `t287-generic-job-revision` | 1/0/1 | 1/0/1 |
| `t287-generic-job-intake` | 1/0/0 | 1/0/0 |
| `t287-generic-job-lifecycle` | 0/0/1 | 0/0/1 |
| `t287-management-supervision` | 5/0/0 | 5/0/0 |
| `t287-management-context` | 12/0/1 | 12/0/1 |
| `d2-bounded-repair` | 10/0/0 | 10/0/0 |
| `t287-c0-post-publication-failure` | 16/0/0 | 16/0/0 |
| `t287-c0-post-publication-failure-owner-admission-close` | 15/0/0 | 15/0/0 |
| `t287-installed-qualification-conservation` | 0/0/1 | 0/0/1 |
| `m5-installed-portability` | 9/0/0 | 9/0/0 |
| `uat/harness` | 33/0/0 | 33/0/0 |
| `t292-td36r-admitted-binding-owner` | 1/0/0 | worktree 0/1/0 (`artifact_digest_mismatch` against the committed fixture); refreshed 1/0/0 |
| `t292-td36r-bind-door-strings` | 6/0/0 | worktree 0/1/0 (same); refreshed 6/0/0 |
| `t292-td36r-remaining-owners` | 6/0/0 | 6/0/0; refreshed 6/0/0 |
| `t292-td36s-bind-string-rule` | 7/0/0 | 7/0/0; refreshed 7/0/0 |

No lane on kept behaviour goes from pass to fail. Neither known red of `main`
showed in these runs: `t287-cross-cut-public-read` passed 5/0/0 on both builds,
and `witness-reprice-definition-binding` was not in the set.

On base the refusal lane is red for the reasons ruling 7 and the door table
give:
- case 1 fails at "an empty roster", which loads on base;
- case 2 fails because `ABI5_SYSTEM_PRODUCT_SEMANTICS` is exported;
- case 3 fails because the Consensus constructor is exported;
- case 4 fails because the bindings include `module://abg/consensus@5`.

The first base run of `t287-default-library-fulfillment` was 0/7/0 with
`ENOENT` for `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-witness-contract.md`,
because `base-root` held no `.ai-workspace`. I copied into `base-root` the base
commit's versions of the 1,062 `.ai-workspace` files that the worktree's sparse
checkout holds; they are unchanged between `fc818876c` and the head. The rerun
gave 7/0/0, and the two other lanes that read those records and ran before the
copy (`t287-common-computational-library`, `t287-default-library-prerequisites`)
gave the same counts again.

**Skipped, the same on base and final.** Each skipped case is gated by an
opt-in variable or by retained evidence that this environment does not set. No
model call was made.

| Lane and case | Gate |
|---|---|
| `steel-consumer-declaration` | `ABI5_STEEL02_*`, frozen artifact |
| `w2-steel-serial-branch-installed`, 2 cases | `ABI5_STEEL04_*`, frozen artifact |
| `w2-steel-single-start-installed` | `ABI5_STEEL03_*`, frozen artifact |
| `w2-steel-single-start-closure`, case 2 | `ABI5_STEEL03_RETAINED_START_CALL_PATH` |
| `t287-default-library`, case 31 | `ABI5_DEFAULT_LIBRARY_LIVE` |
| `t287-selected-action-authority`, case 3 | `ABI5_SELECTED_ACTION_OWNER_SUBJECT` |
| `t287-generic-job-revision` | `ABI5_GENERIC_JOB_CORRECTION_NATIVE` |
| `t287-generic-job-lifecycle` | `ABI5_GENERIC_JOB_FULL_NATIVE` |
| `t287-management-context`, case 13 | `ABI5_CONTEXT_PUBLIC_PROOF` |
| `t287-installed-qualification-conservation` | `ABI5_INSTALLED_CONSERVATION_*` |

`npm run build` passes, and so do `lint:imports` (30 modules, 3 forbidden pairs
hold), `lint:lifecycle` (281 modules, 7 allow-listed) and `lint:calculus`
(6 modules). `tsc --noEmit` is clean.

## Replay comparison

Script `/private/tmp/abg-td26p2-work/scripts/replay-log.mjs` over the plan's 23
logs (list `/private/tmp/abg-td26p2-work/replay/replay-logs.txt`), base build
then final build; outputs `replay/replay-base.jsonl` and
`replay/replay-final.jsonl`. The two files are byte-identical (23 lines). For
each log the script records the prefix digest, the whole-log replay digest or
refusal, the F_H continuations and facts, and each Run's owner facts.

| Outcome (base = final) | Logs |
|---|---|
| replayed to a digest | 5: the rc.12 store copy, `blocked-testing-diagnostic-001`, rc11 `native-assessment`, rc11 `selected-action` (One Surface subject), rc11 `native-02` |
| replay refused, same message | 2: `registered-selection-whole-001` ("replay run_stopped event and run_terminal HoldsAt truth disagree"), `hc2-current-intent` (One Surface subject; "replay requires zero or one exact run_stopped event") |
| decode refused, same message | 16: the r10 proof fixture and the 15 RC1 `s02-*` logs |

Both One Surface subjects read exactly as before (ruling 6).

## Artifact truth over recorded stores

On the base and final builds:

- **Lanes.** `t287-historical-source-resource`, `r10-child-proof`,
  `t287-cross-cut-public-read`, `t287-selected-action-authority` and
  `t287-native-assessment-evidence`: see the lane table; same counts on base
  and final.
- **Projection.** `/private/tmp/abg-td26p2-work/scripts/probe-artifact-truth.mjs`
  runs `projectArtifactTruth` over 25 stores: a copy of the live rc.12 store
  (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
  copied to `truth/rc12-events.jsonl`), the 22 other replay logs and the two
  tracked fixture logs of `t287-native-assessment-evidence` and
  `t287-selected-action-authority`. Outputs `truth/truth-base.jsonl` and
  `truth/truth-final.jsonl` are byte-identical: 9 stores give
  `artifact_truth_projection` with the same digest, 16 refuse at decode with
  the same message. rc.12: `artifact_truth_projection`,
  `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`,
  on both.
- **Locks.** `probe-lock.mjs` re-validates the three inline `product.install`
  locks (rc.12, and the two fixtures): `isResolvedProductLock` is true and the
  capability identity check finds no mismatch, on both builds (outputs
  `truth/lock-base.jsonl`, `truth/lock-final.jsonl`, byte-identical).
- **Capability graph rows.** Identical apart from identity fields (above).

No case goes from pass to fail, no projection is refused that was not refused
before, no digest changes and no graph row changes.

## Whole-word search

Script `/private/tmp/abg-td26p2-work/scripts/residue.sh` over
`specification/`, `T/design` (without `history/`), `T/code/src`, `T/scripts`,
`T/test_env` (without `test_runs`, `downstream`, `evidence`, `fixtures`,
`proof`, `qualification`) and `T/package.json`. It searches 169 identifiers
whole-word (every export of the two deleted files, the removed exports of
`consensus_schema.ts`, the system-semantics functions, `ABI5_SYSTEM_PRODUCT_SEMANTICS`,
`ProductPublicResultProjection`, `projectPublicResult`,
`publicResultProjectionKinds`, `consensusVocabularyRows`, `REQ-P-CONSENSUS-007`,
`-008`) and 18 literals (the module, Program, handle and function refs, the
`catalog://abg/consensus/` prefix, the three vocabulary ids and file paths,
`implementation/consensus`, `gtl/consensus.{ts,js,d.ts}`, the two deleted test
names, `consensus-unit`). Output `/private/tmp/abg-td26p2-work/residue-final.txt`.

| Where | Hits | Why they stay |
|---|---|---|
| `tests/t292-td26-p2-module-refused.test.mjs` | 17 | the refusal lane |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs:793` | 1 (`module://abg/consensus@5`) | the Catalog admission refusal block |
| `code/src/product/semantics.ts:439-440` | 2 | the two refusal clauses of ruling 7 |
| `code/src/gtl/consensus_schema.ts` | 85 | `$defs` names, `$ref`s and `const` values inside `CONSENSUS_PUBLIC_SCHEMA` (two of them are the One Surface Program ref and a `graph-function://abg/consensus/` ref), and the 13 name pairs of `CONSENSUS_SCHEMA_ASSET_BINDINGS`; kept by ruling 1, byte identity |
| `code/src/shared/capability_contracts.ts:82` | 3 (the vocabulary ids) | register row kept by ruling 1 |
| kept design notes | 10 hits on 5 lines | listed above |

Recorded data and mirrors, listed and not edited: `T/test_env/proof`,
`T/test_env/fixtures` and `T/test_env/qualification` name the literals in 1 to
3 files each (the r10 proof log; `inventory.json`, `recipe/verification-recipe.json`,
`recipe/expected-output-inventory.json`, `tenant-manifest.json`).

## Size

`git diff --numstat fc818876c 87de4a2e5`:

| Path | Files | + | - |
|---|---|---|---|
| `T/code/src` | 9 | 4 | 6,774 |
| `T/test_env` | 19 | 322 | 2,294 |
| `specification` | 2 | 5 | 14 |
| `T/design` | 0 | 0 | 0 |
| `T/scripts`, `T/package.json`, root `.gitignore` | 3 | 2 | 87 |

Of the test lines, 2,186 are the two deleted files; the new refusal lane is
106. The plan estimated about 7,000 deleted lines in all; source, scripts and
package delete 6,861.

## Qualification members (listed, not edited)

- `test_env/qualification/inventory.json` and
  `recipe/verification-recipe.json`: members `code/src/gtl/consensus.ts` and
  `code/src/implementation/consensus.ts` (deleted);
  `code/src/gtl/consensus_schema.ts`, `code/src/gtl/index.ts`,
  `code/src/implementation/index.ts`, `code/src/product/builtin_semantics.ts`,
  `code/src/product/semantics.ts`, `code/src/product/index.ts`,
  `code/src/product/public_contract_publication.ts`,
  `scripts/generate-product-manifest.mjs`, `package.json` (changed); the
  `REQ-P-CONSENSUS.md` mirror (`recipe/verification-recipe.json:1390`); the
  deleted tests `m5-consensus-module` and `t287-consensus-ref-shape`, the new
  lane and the changed tests listed above.
- `recipe/expected-output-inventory.json` (`:204`, `:206`, `:309-310`,
  `:355-356`, `:906`): the deleted source and test files and the three
  vocabulary files.
- `tenant-manifest.json`: the three vocabulary ids.
- `declared-commands.json`: `test:m5:consensus-unit` and the `test:m5` member.
- Generated `contracts/qualification/rule-catalog.json`: its citations of
  `REQ-P-CONSENSUS-007` and `-008`.

## Deviations

- **Commit trailers.** The brief names `Co-Authored-By: Claude Fable 5.2`. A
  later attribution notice in this session replaced it with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and a
  `Claude-Session` line; every commit of this branch carries those.
- **Lane runs in the background.** The tool moves a command longer than 180 s
  to the background, so each lane sequence ran as one background shell command
  (`/private/tmp/abg-td26p2-work/scripts/lane.sh`) that runs one test file at a
  time and waits for it. No two test files ran at the same time. The
  `final-root` build and fixture refresh ran while a final lane was running
  (CPU only; separate tree). P1 recorded the same.
- **`gtl/consensus_schema.ts` keeps three private constants** beyond the two
  exports the brief names, because the schema literal embeds them (section
  "Source lines removed by file").
- **The schema case is deleted, not moved.** "S05 serialized Consensus schema
  is one exact projection" compared the written file with the constant. The
  generator writes the file from the constant, the file is byte-identical on
  base and final, and the reproducibility lane rebuilds it.
- **`w2-05` conformance vehicle.** The reference commit `fb86974e3` used the
  requirement-handoff Program; this branch uses `publications[0]`, the default
  library Program, which the lane already admits and views.
- **`w2-05` Catalog admission block.** The refusal of a Consensus-named
  publication at Catalog admission is asserted in `w2-05`, not in the new lane,
  because it needs the installed harness's lock and readiness basis.
- **`base-root` evidence files.** `base-root` was first built without
  `.ai-workspace`; the base commit's copies of the worktree's 1,062 sparse
  `.ai-workspace` files were added during the base runs (section "Lanes before
  and after").
- **Census miss.** The census listed `steel-basic-cli-public` as a publication
  list only. It also viewed the core Consensus declaration rows; the first
  final run failed on that, and the file is re-pointed like `w2-05`.

## Residuals

- **Identity regeneration at merge (the Executive's).** The generated
  contracts (the three vocabulary files leave; the capability graph's identity
  fields), `product-toolchain-manifest.json`, the candidate-basis fixture and
  the qualification mirrors, including the `REQ-P-CONSENSUS.md` mirror and the
  generated `contracts/qualification/rule-catalog.json` citations of `-007` and
  `-008`, plus the qualification members listed above. Until then
  `t292-td36r-admitted-binding-owner` and `t292-td36r-bind-door-strings` fail
  in the worktree against the committed fixture and pass with it refreshed.
- **Design sentences** that cite `gtl/consensus.ts` and
  `G/consensus.ts::projectTicketConsensus` (section "Design sentences listed")
  belong to the retirement's design package.
- **Installed Public view over declaration rows** is now exercised only by the
  gated `steel-consumer-declaration` (section "Tests and fixtures").
- **P6:** the `actionCatalog` field of the semantics input
  (`product/semantics.ts:198`) and `constructionComposition` stay.
- **P7:** `CONSENSUS_PUBLIC_SCHEMA`, `CONSENSUS_SCHEMA_ASSET_BINDINGS` and their
  `gtl/index.ts` re-export; the generator's schema path, write, digest and rows;
  `scripts/clean.mjs:10`; root `.gitignore:45`; register row
  `shared/capability_contracts.ts:82` with its projected vocabulary ids; the
  `ticket_consensus` read contracts; the Consensus capability rows read by
  `t287-pfc-f08a` and `t287-st2a-g`.
- **Open point 1** of the plan (the default root mode) is untouched by this
  package.
