# TD-77 Return: a reader and a recorded Product lock

Writer: Claude Opus 5.5. Branch `claude/td77-recorded-lock-truth` from local
`main` at `c1f655735`, worktree `/private/tmp/abg-td77`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag.

**Status: stopped at step 1 (trace). The stop condition of ruling 6 holds:
on every recorded cut that decodes today, the recorded capability graph
cannot establish the recorded capability identities. A graph row carries
only the contracts it owns. The relation that the contracts'
`capabilityIdentities` record is the register's projected-contract list,
and the graph does not record it. On every recorded toolchain lock row, from
`5.0.0-dev.286` to `5.0.0-rc.12`, 37 of the 54 contracts that carry
identities differ from what the graph gives. No design, code or test is
edited. The read copies of section 2.2 need a classification before the
split can be made, and what refuses new work on a store bound to other
Product bytes is not established (section 5).**

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `6b7db94f2` | the trace skeleton: recorded material (section 3) and the stop |
| `8b6bc8628` | the Return: guards, callers, specification read, ruling-5 read, ruling items |
| this commit | 2.2 item 1 corrected after tracing every caller of the generic admission: no Public door depends on the fold's guard |

Lines changed under `code/src`, `design` and `test_env`: none
(`git diff --numstat c1f655735` over the three is empty). `npm run build`
ran once in T at the start and left no tracked change.

## 1. Guards that judge a value by a current definition of the reader's Product

Line numbers at `c1f655735`, under `T/code/src`.

| Guard | File:line | Compares | Protects |
| --- | --- | --- | --- |
| register roster | `shared/capability_contracts.ts:94-105` | the register's capability ids with `MANDATORY_ABI5_CAPABILITY_IDS` | the register itself, at module load |
| `capabilityRefsForContract` | `shared/capability_contracts.ts:107` | a contract id with each register row's `projectedPublicContractIds` | the identities a contract of the reader's Product publishes |
| `capabilityRefsForDefinition` | `shared/capability_contracts.ts:116` | a definition key with each row's `projectedPublicDefinitionKeys` | the `capabilityRefs` of the reader's own operation contracts (built at module load by the twelve `*_operation_contracts.ts` owners and `release_snapshot_operations.ts:84`); not applied to recorded values |
| `constructCapabilityDefinitionGraph` | `shared/capability_contracts.ts:210-405` | owner coordinates with the register: every owning contract and definition slot present, dependencies known and acyclic, rows built from register data; empty-graph rule `:247-265` (no definition slot and no flat contract the register maps to a capability) | the graph of the reader's Product; used as a guard by the next two rows |
| `isCapabilityDefinitionGraph` | `shared/capability_contracts.ts:407-431` | strict schema (graph id and version literals `:17-19`, `:188-189`); equality with `constructCapabilityDefinitionGraph` over the recorded owners; each row digest; the graph digest | that a graph is the reader's construction |
| `capabilityDefinitionGraphCoordinate`, `capabilityDefinitionGraphAssetBytes` | `shared/capability_contracts.ts:433`, `:446` | throw unless `isCapabilityDefinitionGraph` | coordinate and asset bytes only of an established graph |
| `isResolvedProductLock` | `product/environment.ts:544-760` | the graph guard (`:608`); each contract's `capabilityIdentities` with `capabilityRefsForContract` (`:674-679`); `lockRowGraphMatchesCatalog` (`:764-789`), whose empty-graph branch reads the register (`:765-767`); all other relations are internal to the lock (section 3.1) | a resolved lock |
| `isVerifiedProductArtifact` | `product/verify_product.ts:727` | the graph guard (`:795`); the graph rebuilt from the artifact's definition coordinates with the register and compared (`:867-875`); identities with the register (`:895-902`); asset bytes through `capabilityDefinitionGraphAssetBytes` (`:879`) | a verified artifact carrier |
| `verifyProduct` graph and identity checks | `product/verify_product.ts:2454`, `:2510`, `:2522` | the packed artifact's graph asset and contracts with the register | the reader's verification of artifact bytes |
| installed graph read | `product/install_product.ts:156` | the installed root's graph asset with the graph guard and the expected graph | install and installed verification |
| `parseProductPublicContract` | `product/verify_product.ts:1281`, `contractLocatorLaw` `:1265` | contract kind against the reader's locator table; `contractVersion` literal `5.0.0` | contract row shape (used inside the lock guard `:649-653`) |
| literals in the lock guard | `product/environment.ts:638` (graph asset path), `:774` (catalog version `5.0.0`) | recorded values with the reader's constants | lock row shape |
| `ABI5_PRODUCT_ID`, `ABI5_PACKAGE_*` | `product/contracts.ts:10`; `product/execution_resolution.ts:796-801`, `:855-860`; `product/declaration_exports.ts:537` | an install's product id, package name and version with the reader's own | the ABI owner of retained worksite inputs; the executing toolchain's identity |
| executing toolchain identity | `product/declaration_exports.ts:2071-2080` (`linkNativeContractSet`), `product/admission_authority.ts:445-452` (`checkExecutingOwner`) | the lock's toolchain row or the owner artifact with the executing manifest | that native meaning and admission owners are the executing Product (section 5) |

Recorded values reach the register through `capabilityRefsForContract`
and `constructCapabilityDefinitionGraph` only; the TD-25M simulation patched
the first, so it reached every row above that reads it.

## 2. Callers

### 2.1 The measured guards

"Recorded" is a value read from the event log; "new" is a value a caller
supplies or the reader constructs, about to be admitted; "read copy" is a
caller-supplied value that a read binds to recorded history and does not
admit.

| Guard | Call site | Value | Failure becomes |
| --- | --- | --- | --- |
| `isResolvedProductLock` | `abg/artifact_truth.ts:409` (`RuntimeArtifactFacts.prepare`, inline lock) | both: recorded when `projectArtifactTruth` (`:618`) advances over history; new when admission prepares its candidate (`prepareArtifactTruthCandidate`, `:712`) without an established lock | throw (`:423`, `:466`); at admission the door returns `artifact_truth_conflict` (`abg/environment_admission.ts:1067-1075`) |
| | `product/environment.ts:795` (`verifiedArtifactMatchesResolvedLock`) | new: `install_product.ts:317` (install request); `verification_definition_bindings.ts:301` (installed `product.verify`, the reader's verification) | install refusal; verify output `lock_mismatch` |
| | `product/environment.ts:818` (`isProductInstallCandidate`) | new: `abg/environment_admission.ts:1128` (`admitProductInstall`, before the door); `:968` (the door, only when no lock is established, which only the module-level `admitArtifact` does; see 2.2); `environment.ts:920` (`isProductInstall`) | `scope_mismatch` before the door; at `:968` the door keeps the full body and the fold's prepare refuses (row 1); elsewhere false |
| | `product/environment.ts:920` (`isProductInstall`) | new: `environment_definition_bindings.ts:538` (`workspace.bind`), `catalog_definition_bindings.ts:296` (`catalog.admit`); the reader's verification: `verification_definition_bindings.ts:122` | fault `invalid_resource_assertion` or the binding's refusal |
| | `product/environment.ts:980`, `:1195` (`isProductSet`, `isWorkspaceBindingCandidate`) and `product/project_read_ports.ts:656` | read copy: `project.read#workspace_status`; the packet is caller-supplied and the binding checks its lock coordinate against the recorded binding (`product/project_read_definition_bindings.ts:701-708`) | refusal `not_ready` |
| | `product/catalog.ts:469` (`admitGraphFunctionCatalog`) | new: `execution_resolution.ts:461` (run), `catalog_operations.ts:299` (catalog admission), `declaration_application.ts:136`; read copy: `declaration_closure.ts:53` (`reconstructHistoricalDeclarationCatalog`, reached from `abg/project_read_ports.ts:378` for `graph_call_result` and the child reads), which then requires the caller's lock to equal the recorded environment's lock | refusal `binding_lock_mismatch`; in the historical read a throw |
| | `product/environment_definition_bindings.ts:533` | new: `workspace.bind` resources | fault |
| | `product/catalog_definition_bindings.ts:289` | new: `catalog.admit` resources | fault |
| | `product/install_definition_bindings.ts:143` | new: `product.install` resources | fault |
| `isCapabilityDefinitionGraph` | `product/environment.ts:608` | as the lock guard's callers | as above |
| | `product/verify_product.ts:795` (`isVerifiedProductArtifact`) | new: catalog readiness bases for new work, `resolveProductArtifacts` (`environment.ts:443`); read copy: the verified products inside a historical declaration proof's catalog (`catalog.ts:480` from `declaration_closure.ts:53`) | false |
| | `product/verify_product.ts:2454` | the reader's verification of packed bytes | refusal `catalog_mismatch` |
| | `product/install_product.ts:156` | the installed root during install and installed verification | false |
| | `product/invocation.ts:751` | the admitted installs of an invocation's environment (recorded through artifact truth, or the caller's readiness basis) | the capability owner is absent (`[]`) |
| `capabilityDefinitionGraphCoordinate` | `shared/capability_contracts.ts:433` | no internal caller; exported (`product/index.ts:91`) | throw |
| `capabilityDefinitionGraphAssetBytes` | `product/verify_product.ts:879` | as `isVerifiedProductArtifact` | false |
| `verifiedArtifactMatchesResolvedLock` | `install_product.ts:317`; `verification_definition_bindings.ts:301` | new; the reader's verification | as above |

`capabilityRefsForContract` is also called by the catalog constructors
`product/public_contract_publication.ts:221`, `:247` and
`validator/self_conformance_publication.ts:20`, `:26`: construction of the
reader's own catalog.

### 2.2 Call sites that need a ruling before the split

1. **`abg/artifact_truth.ts:409` receives both, and its body cannot tell
   which.** The fold and the admission candidate share
   `RuntimeArtifactFacts.prepare`; only the entry knows (`advance` from
   `projectArtifactTruth`, or `prepareArtifactTruthCandidate`). Every caller
   of the generic admission `admitArtifactFromOwner`
   (`abg/environment_admission.ts:855`):
   - `admitProductInstall` (`:1122`, on the `./abg` package surface) and
     `admitProductInstallInResolvedLock` (`:1133`, after the strict check at
     `product/install_definition_bindings.ts:143`) check the lock before the
     door (`:1175`) and pass it as established (`:1189`), so the door uses the
     no-lock-check candidate guard at `:968` and the fold's prepare reuses the
     established lock;
   - the module-level `admitArtifact` (`:844`) passes no established lock. Its
     source callers admit `release.snapshot`, `product.materialize` and
     `workspace.bind` only, so they never reach the install branch at
     `:966-976`. It is not on the `./abg` package surface;
     `t289-install-event-bodies` reaches it through the private owner harness
     with `product.install` bodies, and asserts `artifact_truth_conflict` for a
     malformed inline candidate (`:452-469`). On that entry the door does not
     refuse a lock its strict check rejects: it keeps the full body and the
     fold's prepare refuses.

   So no Public door depends on the fold's guard today. The split still has
   to keep the candidate entry strict (the entry carries the question, or
   `admitArtifact` refuses an install whose strict check fails at `:968`);
   otherwise the module-level entry would append a lock that only the
   recorded guard accepts. This is a constraint on the split, not a blocker.
2. **Read copies.** `project.read#workspace_status` (`project_read_ports.ts:656`)
   and the historical declaration proof (`declaration_closure.ts:53`, then
   `catalog.ts:469` and `isVerifiedProductArtifact` over the proof's verified
   products) receive caller-supplied values that a read binds to recorded
   history. Ruling 3 classifies by source ("a caller supplies … and that is
   about to be admitted"); these are supplied and not admitted. By reading,
   the second keeps `graph_call_result` refusing under a changed register
   through `isVerifiedProductArtifact` (`verify_product.ts:867`, `:895-902`)
   even if the lock guard is split: the verified-artifact guard is a guard of
   the same kind (ruling 4) and is in scope. Not run.

## 3. Recorded material

### 3.1 What a lock row carries and which digest binds each part

Read from `product/environment.ts` (`isResolvedProductLock`, `:544-760`;
`lockRowGraphMatchesCatalog`, `:764-789`), `shared/capability_contracts.ts`
and `product/public_contract_publication.ts`.

| Part | What binds it | Checked today by the lock guard |
| --- | --- | --- |
| lock | `lockDigest = sha256Canonical({rows, dependencyEdges, nativeContractClosureDigest})`; `lockId = product-lock://abiogenesis/<hex>` | recomputed (`:753-759`) |
| `nativeContractClosureDigest` | produced by `linkNativeContractSet` when the lock is constructed | shape only (`isSha256Digest`) |
| `dependencyEdges` | lock digest | re-derived from the rows' `declaredDependencies` (`:733-744`), acyclic |
| row identity fields (`artifactDigest`, `productContentDigest`, `manifestDigest`, `descriptorRef`, `provenanceRef`, `publisherNamespace`, `packageName`, `packageVersion`) | lock digest only | shape only; the contribution manifest must repeat `productId`, `packageVersion`, `descriptorRef`, `productContentDigest` |
| `contributionManifest` | `contributionManifestDigest = sha256Canonical(contributionManifest)` | recomputed (`:617`); it repeats the catalog id and digest and the graph coordinate (`:619-636`) |
| `capabilityDefinitionGraph` | each row's `capabilityDefinitionDigest = sha256Canonical(row without ref and digest)`, `capabilityDefinitionRef = capability-definition://abiogenesis/<hex>`; `graphDigest = sha256Canonical(graph without graphDigest)`; dependencies carry the dependency's ref and digest | `isCapabilityDefinitionGraph` (`capability_contracts.ts:407`): strict schema, row digests, graph digest, and equality with `constructCapabilityDefinitionGraph` over the reader's register |
| `capabilityDefinitionGraphAsset` | `contentDigest = sha256Bytes(canonicalJson(graph))`; fixed path and media type | recomputed (`:637-642`) |
| `publicContracts` | each `contractDigest` is the digest of an asset's bytes or of a native declaration inventory (`scripts/generate-product-manifest.mjs:528-933`); no contract digest covers `capabilityIdentities` | shape by `parseProductPublicContract`; `capabilityIdentities` compared with the reader's register (`:674-679`) |
| `publicContractRefs`, `publicCapabilityRefs`, `declaredCapabilityRefs` | lock digest | re-derived from the contracts and the graph (`:654-673`) |
| catalog (`catalogId`, `catalogDigest`) | `catalogDigest = sha256Canonical({schemaVersion, catalogId, catalogVersion, catalogSchemaPath, catalogSchemaDigest, rows})` (`public_contract_publication.ts:745-760`); the catalog body is not a field of the row | shape only; equal to the contribution manifest's; every flat owner coordinate in the graph carries it (`lockRowGraphMatchesCatalog`) |

### 3.2 Does the recorded graph alone determine every recorded contract's capability identities?

No, on every recorded toolchain row.

A graph row has exactly these keys on every one of the 142 distinct
non-empty recorded graphs: `boundedProofRefs`, `capabilityDefinitionDigest`,
`capabilityDefinitionRef`, `capabilityId`, `capabilityVersion`,
`dependentCapabilities`, `effectRefs`, `owningPublicContracts`. The only
contract relation is `owningPublicContracts`: flat coordinates for the
register's `owningPublicContractIds` and `operation_definition_slot`
coordinates (slots `request`, `result`, `refusal`, `non_terminal`) for its
`owningPublicDefinitionKeys`; every slot coordinate names an operation's
flat row. The register's `projectedPublicContractIds`, which
`capabilityRefsForContract` reads and which every recorded
`capabilityIdentities` was generated from
(`scripts/generate-product-manifest.mjs:988-996` asserts this at build),
is not recorded in the graph.

Two kinds of difference, the same on every graph:

1. **36 projected-only contracts.** They carry capability identities, and
   their `contractId` occurs nowhere in the recorded graph, nor in the row's
   contribution manifest (checked by string over one graph per distinct
   graph digest, 142 graphs, and on the rc.12 and rc.10 fixture graphs):
   the fifteen `abg.contract.*` roots (`abg.contract.abg.c-call-root`,
   `…environment-admission`, `…execution-basis-root`,
   `…invocation-root-admission`, `…open-call-root`, `…replay-root`,
   `abg.contract.gtl.materialization-root`, `…root-declaration`,
   `…validation-root`, `abg.contract.hog.graph-function-catalog`,
   `…judgment-transition-root`, `…traversal-root`,
   `abg.contract.product.implementation-resolution-root`,
   `…invocation-root`, `…verification`), eighteen `abg.schema.*` contracts
   (thirteen Consensus and review schemas, and `product-toolchain-manifest`,
   `public-contract-catalog`, `public-operation-contract`,
   `public-operation-invocation`, `public-operation-outcome`) and three
   `abg.vocabulary.*` contracts (`consensus-fh-decision`,
   `consensus-round-outcome`, `review-ruling-kind`).
2. **`abg.operation.run.invoke`.** The graph rows that own it are
   `catalog.invoke-graph-function@5`, `graph-function.consensus@5` and
   `runtime.execute-seven-term-c@5`; the recorded identities are the first
   and the third. The Consensus row owns the operation and does not project
   it (`capability_contracts.ts:91`). So the relation fails whether
   "project" is read as "own" or not; owning contracts are no stand-in.

### 3.3 Per cut

Every log under the evidence root that carries a `product.install` artifact
admission publishing `interaction.respond` (the finding's 411, 24.56 GB),
plus the two tracked fixtures and the live rc.12 store, read without
decoding (`/private/tmp/abg-td77-work/scripts/lock-graph-census2.py`, which
streams every log, the 14 over 300 MB included). The cut is the toolchain
row's `packageVersion`. "Project on base" and "refused at decode" are the
finding's base probe (`/private/tmp/abg-td25m-work/many-base.jsonl`); the
fixtures and the live store project on base.

| Cut (toolchain row `packageVersion`) | Logs | Project on base | Refused at decode on base | Over 300 MB, not probed | Distinct graphs | Contracts per row | With identities | Identities the graph cannot establish |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `5.0.0-dev.286` (D1, D2, D4 campaigns, W2 steel sequence) | 147 | 45 | 102 | 0 | 54 | 54/60 | 54 | 37 |
| `5.0.0-rc.1` | 169 | 0 | 168 | 1 | 67 | 60/61/75 | 54 | 37 |
| `5.0.0-rc.2` | 6 | 0 | 1 | 5 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.3` (rc4 native recovery) | 55 | 42 | 8 | 5 | 8 | 75 | 54 | 37 |
| `5.0.0-rc.4` | 2 | 1 | 0 | 1 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.5` | 3 | 2 | 0 | 1 | 3 | 75 | 54 | 37 |
| `5.0.0-rc.6` (rc6 release qualification) | 5 | 4 | 0 | 1 | 4 | 75 | 54 | 37 |
| `5.0.0-rc.7` | 1 | 1 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.8` | 2 | 2 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.9` (rc9 owner reuse, rc10 retention) | 3 | 3 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.10` (rc11 effect phases 1 and 2, rc11 qualification, both fixtures) | 20 | 20 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.12` (live default-library store) | 1 | 1 | 0 | 0 | 1 | 75 | 54 | 37 |
| total | 414 | 121 | 279 | 14 | 142 + 1 | | | |

No recorded lock names `5.0.0-rc.11`: the rc11 evidence areas record
`5.0.0-rc.10` locks, and a search of every `*.jsonl` under
`work/`, `comments/` and `evidence/` finds no `typescript-tenant@5.0.0-rc.11`
and no `typescript-tenant@5.0.0-rc.12` outside the live store. Non-toolchain
rows (21 distinct Products, among them `default-library-witness/consumer@5`,
`selected-action/product@5`, the D-campaign fixtures) have empty graphs and
no contract with identities; for them the question does not arise.

### 3.4 What else recorded commits to the identities

The lock digest commits to everything in the lock. Apart from it, one
recorded digest commits to the identities: the catalog digest. On every
distinct recorded toolchain catalog (94 catalog digests over the 12 cuts,
logs under 512 MB, `/private/tmp/abg-td77-work/scripts/catalog-digest-check2.mjs`),
`catalogDigest` recomputes from the row alone, with the catalog digest
formula over the row's own `publicContracts` and with `catalogSchemaPath`
and `catalogSchemaDigest` read from the row's own
`abg.schema.public-contract-catalog` contract (`assetLocator.path`,
`assetLocator.contentDigest`). The catalog schema path and digest are
recorded nowhere else in the lock or the store. The graph's flat owner
coordinates carry the same catalog digest, and their row digests and the
graph digest bind it. So the recorded graph binds the recorded identities
through the catalog digest, but does not determine them. Non-toolchain rows
have no catalog-schema contract, so their catalog digest does not recompute
from the row; they carry no identities.

## 4. Specification read

Searched `specification/**/*.md` for the capability graph, the register,
and resolved, recorded and historical locks. No sentence says how a reader
establishes a recorded lock or graph, and none says the reader uses its own
register or catalog for it; that stop does not hold. Three sentences bear on
the ruling below:

- `REQ-P-PUBLIC-CONTRACTS-011`: "The mandatory identities shall derive from
  one capability-definition graph whose rows bind the owning public contract
  identities and dependencies."
- `REQ-M-GTL3-CAPABILITY-014`: "The exact public contract and capability
  identities claimed by a tenant shall be projections of one accepted
  capability-definition graph and shall resolve through the installed
  product's `publicContractCatalog` governed by `REQ-P-PUBLIC-CONTRACTS`."
- `REQ-M-GTL3-CAPABILITY-002`: tenant-conformance manifests "shall cite exact
  published public contract and capability identities projected from one
  accepted capability-definition graph".

The realized graph rows bind owning contracts, as `-011` says. The
per-contract identities follow the register's projected lists, which the
graph does not record, so the first half of `-014` ("projections of one
accepted capability-definition graph") is not realized for the 36 contracts
of section 3.2. The second half ("resolve through the installed product's
`publicContractCatalog`") is what section 3.4 measures.

## 5. What refuses new work on a store bound to other Product bytes

Not established. By reading:

| Door | Owner and check | Refusal | Independent of the register |
| --- | --- | --- | --- |
| `product.resolve` | `constructResolvedProductLock` (`product/environment.ts:534-541`) links with `installedToolchainProductContentDigest()`; `linkNativeContractSet` (`product/declaration_exports.ts:2071-2080`) compares the lock's toolchain `productContentDigest` with the executing toolchain's | `incompatible_dependency`, "selected ABIogenesis Product does not match the installed compiler basis" | yes |
| `workspace.bind` | `resolveProductArtifacts` over the call's verified preimages with the executing toolchain (`product/environment_definition_bindings.ts:460-462`), the same link | `incompatible_dependency` | yes |
| admissions with an admission capability | `checkExecutingOwner` (`product/admission_authority.ts:445-452`): the owner artifact's manifest and content digests equal the executing manifest's | `owner_artifact_mismatch` | yes; by reading, nothing on this path requires the owner artifact to be a row of the store's bound lock |
| `run.invoke`, `run.continue` | the caller's catalog readiness basis passes `admitGraphFunctionCatalog` (strict lock and verified-artifact guards) and is matched with recorded artifact truth (`projectSetupTruth`, `owner_bindings/run_invocation.ts:704-731`); the ABI owner checks of retained worksite inputs compare `ABI5_PRODUCT_ID` and `ABI5_PACKAGE_VERSION` (`product/execution_resolution.ts:796-801`, `:855-860`, `wrong_owner`) | `basis_mismatch`, `admitted_setup_absent`, `wrong_owner` | not found for the general run path |

Whether the register comparison is the only refusal on the run path for a
store bound to another cut is open. It needs an experiment (a store bound to
an earlier cut, the current build, one `run.invoke`), which this stop makes
premature.

## 6. Not done

Design, code, lanes, the evidence at scale, the before and after lane
runs, the replay comparison and the identity digests: the package stopped at
the trace, so nothing they would measure changed. The constitution passages
that describe the guard are not listed. Scratch: the base copy
`/private/tmp/abg-td77-work/base-root`; the census scripts
`/private/tmp/abg-td77-work/scripts/lock-graph-census2.py` (outputs
`lock-graph-census-411.jsonl`, `graphs-411.json`,
`lock-graph-census-extra3.jsonl`, `graphs-extra3.json`) and
`catalog-digest-check2.mjs` (over `logs414.txt`); the copied live store
`live-rc12.events.jsonl` (sha256 `440994c0…`) and the decompressed fixtures,
all under `/private/tmp/abg-td77-work/`.

## 7. Items for the Executive's ruling

1. **Which recorded relation binds a contract's capability identities, given
   that the recorded graph does not.** The tamper cases are the brief's, each
   with the lock digest recomputed except the last.

   | Relation | identities changed, graph unchanged | graph row changed without its digest | row digest but not graph digest | dependency names no row | dependency cycle | row dropped, a contract still names it | lock digest stale |
   | --- | --- | --- | --- | --- | --- | --- | --- |
   | (a) catalog digest: `catalogDigest` recomputes from the row's own contracts with the schema path and digest of its own `abg.schema.public-contract-catalog` contract, and the graph's flat coordinates carry it (`lockRowGraphMatchesCatalog`, kept) | refused: either the catalog digest no longer recomputes, or the graph's coordinates carry the old one | graph check | graph check | graph check | graph check | not refused | refused |
   | (b) membership: every identity names a row of the row's own graph | refused only if an identity names no row | graph check | graph check | graph check | graph check | refused | refused |
   | (a) and (b) | refused | refused | refused | refused | refused | refused | refused |
   | (c) the lock digest alone | not refused | graph check | graph check | graph check | graph check | not refused | refused |

   "Graph check" is the recorded graph's internal relations (strict schema,
   row digests, graph digest, dependencies resolving within the graph without
   a cycle), which ruling 2 already selects and which section 3.2 does not
   affect. (a) rests on two reader constants that are not register content:
   the contract id `abg.schema.public-contract-catalog` naming the catalog
   schema, and the catalog digest formula (`productPublicContractCatalogDigest`,
   with `catalogVersion` `5.0.0`). All 94 distinct recorded toolchain catalogs read satisfy
   (a) (section 3.4); non-toolchain rows have no catalog-schema contract, no
   identities and empty graphs, so ruling 2's last sentence covers them.
   Excluded by the brief: recording the projection in the graph (stored bytes,
   a digest formula, and no recorded cut has it) and retained registers
   (ruling 6). A lock with every digest recomputed passes any recorded
   relation; only the strict guard refuses it. If `REQ-M-GTL3-CAPABILITY-014`
   is read as requiring identities to derive from the graph, the realization
   gap of section 4 is the owner's.
2. **The artifact-truth call site (2.2, item 1).** Not blocking: no Public
   door relies on the fold's guard. The split keeps the candidate entry
   strict, either by the entry carrying the question or by `admitArtifact`
   refusing at `abg/environment_admission.ts:968`; the Executive may choose
   or leave it to the Writer.
3. **Read copies (2.2, item 2).** Whether `workspace_status` and the
   historical declaration proof ask the recorded question; if they do, the
   verified-artifact guard (`product/verify_product.ts:727`) is treated in the
   same package, since by reading it refuses the historical read on its own.
4. **Ruling 5.** Whether the rerun starts with the experiment of section 5.

## 8. What an independent reviewer should try to break

- That no recorded carrier holds the projected relation: search a recorded
  graph and its contribution manifest for any of the 36 contract ids of
  section 3.2.
- The catalog recompute on the 12 logs over 512 MB, which
  `catalog-digest-check2.mjs` could not read whole (the Python census streamed
  them).
- The classification of `abg/artifact_truth.ts:409` and the door fallthrough
  at `abg/environment_admission.ts:966-976`.
- A specification sentence the search in section 4 missed.
