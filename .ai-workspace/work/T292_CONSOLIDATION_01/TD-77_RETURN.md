# TD-77 Return: a reader and a recorded Product lock

Writer: Claude Opus 5.5. Branch `claude/td77-recorded-lock-truth` from local
`main` at `c1f655735`, worktree `/private/tmp/abg-td77`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag, no merge.

**Status: built, then stopped on the brief's last stop condition, found by a
probe after the build; and the evidence at scale misses the brief's
expectation on four lane cases.**

1. **Stop.** A lock whose catalog digest does not recompute from its own
   contracts passes the strict question and fails the recorded one. The
   `./abg` door `admitProductInstall` asks strict and appends it, on base and
   on this build alike. A cold reopen of that store then folds on base and
   throws on this build ("Product install inline body requires one resolved
   lock and no body cause"), so every path that reads that store's artifact
   truth after a reopen now refuses where it read before. C1 (the catalog
   recompute) and C2 (the fold asks recorded) produce it together; removing
   it needs either a check at the door, which C4 forbids, or a change to C1.
   I did not design around it (16.5, 22.3). No recorded lock is such a lock
   (186 of 186 recompute).
2. **Evidence at scale.** Under a changed register (the simulated withdrawal
   of `interaction.respond` and a real register edit) artifact truth projects
   on all 121 stores with the base digest, where base refuses all 121; every
   read in the three named lanes projects. Four cases of those lanes still
   refuse, where the brief expected the unchanged outcome: they are work
   paths that C4 keeps strict (conformance evaluation; the historical
   GraphCall source of a running C-call). Ruling item 22.1.

What holds: the lock, verified-artifact and capability-graph guards each have
one body with two questions, strict (today's guard, unchanged) and recorded
(every relation within the carrier, the catalog digest recomputed from the
carrier's own contracts, identities naming rows of its own graph, the graph's
own relations; no register read). The fold and every read copy bound to
recorded history ask recorded; the candidate, every door, constructor,
verification, install and every path that starts or continues work ask
strict. The 22 TD-77 lanes pass. Before and after, 64 test files (387 tests on
base) have the same outcome per case on this build; no pass to fail. Replay
is byte-identical; the catalog digest and the `.d.ts` output are unchanged.

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `6b7db94f2` | trace: recorded lock material and the stop on the recorded graph |
| `8b6bc8628` | Return: stopped at the trace |
| `ba87d6e89` | Return: trace every caller of the generic admission |
| `f206e0744` | design: the recorded and strict questions of Product truth |
| `3dab16298` | code: one guard body per Product truth carrier, the question passed by the entry |
| `d25f0a319` | code: the read preparation takes its question last |
| `f552a6ea0` | lanes: recorded and strict Product truth |
| `3628bf696` | design: overloaded entries and every read of the read owner recorded |
| `48ab252d7` | code: keep each owner's name, the question as an internal overload |
| `2ea2c0214` | lanes: ask through the overloaded names; a callback index is strict |
| `939e3e74c` | code: artifact truth imports the lock guard from the Product index, as at base |
| `bb07c9db4` | Return: the build, before the door probe |
| this commit | Return: the stop the door probe found, lints, status |

Lines changed under `code/src`, `design` and `test_env`: 1117 added, 69
removed (code 500/66, design 111/3, lanes 506/0); section 20.

Sections 1 to 8 are the trace, kept as written; their line numbers are at
`c1f655735`. Sections 9 to 23 are the build; their line numbers are at
`939e3e74c`.

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

## 6. Trace scratch

Scratch: the base copy
`/private/tmp/abg-td77-work/base-root`; the census scripts
`/private/tmp/abg-td77-work/scripts/lock-graph-census2.py` (outputs
`lock-graph-census-411.jsonl`, `graphs-411.json`,
`lock-graph-census-extra3.jsonl`, `graphs-extra3.json`) and
`catalog-digest-check2.mjs` (over `logs414.txt`); the copied live store
`live-rc12.events.jsonl` (sha256 `440994c0…`) and the decompressed fixtures,
all under `/private/tmp/abg-td77-work/`.

## 7. Items for the Executive's ruling (the trace)

Answered by C1 to C5; section 9 says how each is realized.

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

## 8. What an independent reviewer should try to break (the trace)

- That no recorded carrier holds the projected relation: search a recorded
  graph and its contribution manifest for any of the 36 contract ids of
  section 3.2.
- The catalog recompute on the 12 logs over 512 MB, which
  `catalog-digest-check2.mjs` could not read whole (the Python census streamed
  them).
- The classification of `abg/artifact_truth.ts:409` and the door fallthrough
  at `abg/environment_admission.ts:966-976`.
- A specification sentence the search in section 4 missed.

## 9. Executive rulings and how each is realized

| Ruling | Realized by |
| --- | --- |
| C1, the recorded question | The lock guard's recorded question keeps every check of today's guard except the three register reads (identities against `capabilityRefsForContract`, the empty-graph branch of `lockRowGraphMatchesCatalog`, and graph equality with `constructCapabilityDefinitionGraph`), and adds `recordedCapabilityIdentitiesHold` (catalog digest recomputed by `productPublicContractCatalogDigest` from the row's own contracts with its own catalog-schema locator; every identity names a row of the row's graph; an empty graph carries no identity) and the graph relations `capabilityGraphRelationsHold` (table 11.2). The strict question is today's guard: its register checks are unchanged and the graph relations it adds are implied by its equality with the register's construction. The shared checks are one body per guard. |
| C2, who asks which question | The question is a trailing argument of an `@internal` overload; the exported signatures ask the strict question and any value other than `"recorded"` is strict. Table 12 lists every entry and where it sets the question. The fold asks recorded; the candidate asks strict, so the module-level `admitArtifact` refuses before append a lock that fails strict (`artifact_truth_conflict`; `t289-install-event-bodies` unchanged). `admitGraphFunctionCatalog` and `reconstructHistoricalDeclarationCatalog` take the question from their callers. The read copies are bound as section 13 shows. `product/invocation.ts:751` (now `:756`, `selectedCapabilityOwner`) has two callers: the admission grant (`:942`, strict) and grant construction (`constructInvocationCapabilityGrant`, `:968`), reached from `constructCapabilityGrant` and `validateCapabilityGrantForProductBasis`. Of their callers only the run-read authority (`abg/project_read_definition_bindings.ts:631`, `:822`) reads history and asks recorded; the run continuation, admission and invocation callers are new work and stay strict. No caller does both. |
| C3, the verified-artifact guard | Section 14: the carrier, the digests that bind each part, and the recorded relation (the same `recordedCapabilityIdentitiesHold` and graph relations, plus the artifact's own owner-coordinate, roster and verification-digest relations). The C3 stop does not hold: the catalog digest commits to a verified artifact's identities as to a lock row's, and a verified artifact in a read is bound by lock-row equality and the recorded root basis digest. |
| C4, reading is not running | Every path that starts or continues work keeps the strict question (table 12). The run-door lane refuses each register variant with `binding_lock_mismatch` at the Catalog stage and `incompatible_or_unproven` at execution resolution, on the base build and on this build, and `workspace_status` under the strict question refuses each with `not_ready` on both (section 15). The four lane cases that still refuse under a changed register are work paths (residual 22.1). One stop: a door appends a lock that only strict accepts, and this build's fold refuses that store on a cold read (16.5, 22.3). |
| C5 | No specification sentence is edited. The constitution passages that describe the guard are listed in section 10 and not edited. |

## 10. Design text

| File | Section | Content |
| --- | --- | --- |
| `T/design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md` | "Recorded and strict Product truth" (new) | the two questions; the overloads and the one body per guard; the relations both questions check; the graph relations; the recorded identity relation; the entry and question table; the read-copy bindings and refusals; the retention of recorded Catalogs apart from `readyCatalogs`; release qualification's composition; "Reading is not running" |
| `T/design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md` | install event bodies, reader paragraph | "the unchanged Product raw predicate" becomes "the Product candidate predicate"; an inline lock answers the recorded question in the fold and the strict question at admission |
| `T/design/README.md` | design index | the T287 entry names the new section and its realizing files |

Constitution passages that describe the guard, listed and not edited
(`T/design/ABI5_REALIZATION_CONSTITUTION.md`):

- `:991`, "Product capability-definition graph and one capability-grant carrier";
- `:1058-1070`: graph construction refusals, and "The public-contract catalog's `capabilityIdentities` and each `PublicFunctionDefinition.capabilityRefs` are projections checked against this graph". The recorded question checks a recorded carrier's identities against its own recorded graph (membership) and its catalog digest; the strict question checks them against the reader's register, as before;
- `:1072-1083`: one register and one graph constructor/validator, "There is no second register". The recorded question reads no register; no retained register is added;
- `:1085-1100`: verification reproduces the graph, and install, lock and artifact truth preserve it. Unchanged: the reader's own verification and install ask the strict question;
- `:3119-3125` (section 16.10, carrier and prefix decisions): the run-read owner compares supplied environment slots and Product-issued grants with the exact-prefix projection. The run-read grant now selects its capability owner among the recorded installs under the recorded question;
- `:1514` (`L21`, `constructResolvedProductLock`): unchanged; it constructs new locks, which ask the strict question.

## 11. The guards and the shared body

Line numbers at the final commit, under `T/code/src`.

### 11.1 Guards

| Guard (exported, strict) | Internal overload | One body | Both questions | Strict adds | Recorded adds |
| --- | --- | --- | --- | --- | --- |
| `isCapabilityDefinitionGraph` (`shared/capability_contracts.ts:407`) | `(value, question)` `:413` | `capabilityDefinitionGraphHolds` `:440` | strict schema; `capabilityGraphRelationsHold` (`:478`, table 11.2) | equality with `constructCapabilityDefinitionGraph` over the graph's own owner coordinates (roster, owning sets, dependency sets, versions, effect and proof refs from the register; empty-graph rule) | nothing |
| `isResolvedProductLock` (`product/environment.ts:546`) | `(value, question)` `:552` | `productLockHolds` `:572` | lock shape, kind, schema version, ids and digests; each row's keys and descriptor fields; contribution manifest, its digest and the product, version, descriptor, content digest, catalog id and digest and graph coordinate it repeats; the graph under the same question; graph asset path, media type and digest (`serializeCapabilityDefinitionGraph`); contract rows (`parseProductPublicContract`); contract, capability and declared-capability rosters; flat owner coordinates carrying the row's catalog (`lockRowGraphMatchesCatalog` `:800`); unique product ids; dependency edges re-derived and acyclic; lock digest and id | each contract's identities equal `capabilityRefsForContract`; an empty graph claims no contract the register maps to a capability | `recordedCapabilityIdentitiesHold` |
| `isVerifiedProductArtifact` (`product/verify_product.ts:730`) | `(value, question)` `:736` | `verifiedProductArtifactHolds` `:793` | the carrier's keys and fields; contribution manifest and its digest; the graph under the same question; contract rows; definition coordinate map; checked payload files; native declaration evidence; every owner coordinate of the graph is one of the carrier's own flat contract or definition-slot coordinates; graph asset media type, schema version and digest; manifest graph coordinate; declared and public capability rosters equal the graph's ids; verification digest and ref | the graph equals the register's construction over the carrier's own coordinates; each contract's identities equal `capabilityRefsForContract`; the asset bytes through `capabilityDefinitionGraphAssetBytes` | `recordedCapabilityIdentitiesHold`; the asset bytes through `serializeCapabilityDefinitionGraph` |

`recordedCapabilityIdentitiesHold` (`product/verify_product.ts:758`) is the
one recorded identity relation for a lock row and a verified artifact: an empty
graph means no contract carries an identity; otherwise every identity names a
row of the carrier's own graph, and `catalogDigest` equals
`productPublicContractCatalogDigest` over the carrier's own `publicContracts`,
with `catalogSchemaPath` and `catalogSchemaDigest` from its own
`abg.schema.public-contract-catalog` contract's `assetLocator`. The flat owner
coordinates carry the catalog digest, so the row digests, the graph digest, the
graph asset digest, the contribution manifest digest and the lock or
verification digest move with any identity.

Strict is today's guard. On the lock guard the graph relations and the
`InResolvedLock` forms after the lock check are implied by the strict checks;
on the verified guard the owner-coordinate membership is implied by equality
with the construction over those coordinates. The strict question does not
recompute the catalog digest, so strict does not imply recorded on a carrier
whose catalog digest does not recompute from its own contracts (no recorded
lock is one; section 22, item 3).

### 11.2 The constructor's relations and where each is checked

`constructCapabilityDefinitionGraph` (`shared/capability_contracts.ts:210-405`)
guarantees the relations below for any register content. Both questions run
`capabilityGraphRelationsHold` (`:478-583`, called at `:448`), which checks
every relation stated over the graph alone. The strict question then
requires equality with the construction over the graph's own owner
coordinates (`:450-459`), which covers the relations that read the
register.

| Constructor relation | Constructor lines | Over the graph alone | Holds on the 143 recorded non-empty graphs | Checked by |
| --- | --- | --- | --- | --- |
| strict schema (graph id and version literals, row keys) | `:401` | yes | yes | both questions, `:444` |
| rows sorted by `capabilityId`, one row per id | `:389` | yes | yes | both questions, `:482-487` |
| `capabilityDefinitionDigest` is the digest of the row body; `capabilityDefinitionRef` names it | `:378-384` | yes | yes | both questions, `:481`, `:488-490` |
| `dependentCapabilities`, `owningPublicContracts`, `effectRefs`, `boundedProofRefs` each sorted | `:337-339`, `:366-369`, `:375-376` | yes | yes | both questions, `:491-494` |
| every dependency names a row of the graph and carries its ref and digest | `:320-335` | yes | yes | both questions, `:498-507` |
| dependencies acyclic | `:324-326` | yes | yes | both questions, `:508-520` |
| one flat coordinate per contract id (a flat coordinate may be owned by several rows; it is the same coordinate) | `:229-234` | yes | yes | both questions, `:525-528` |
| an owner coordinate is `flat_contract` or `operation_definition_slot` | `:229-245` | yes | yes | both questions, `:534-536` |
| each definition slot's operation has a flat coordinate with the same catalog and flat row | `:266-283` | yes | yes | both questions, `:538-551` |
| a slot's `definitionRef` ends in `/<slot>Contract/identity`; one definition ref per key; no slot twice; `request`, `result`, `refusal` present | `:284-309` | yes | yes | both questions, `:545-564` |
| a row owning a definition key owns every slot coordinate of that key | `:354-362` | yes | yes | both questions, `:566-581` |
| `graphDigest` is the digest of the graph body | `:397-400` | yes | yes | both questions, `:582` |
| the rows are the register's rows (roster) | `:311`, `:389` | no: reads the register | yes against this reader's register (strict holds on 144 of 144), not kept | the strict question only, through equality with the construction (`:450-459`) |
| each row's owning contract ids and definition keys, dependency ids, version, effect and proof refs are the register's | `:328-377` | no: reads the register | yes against this reader's register (strict holds on 144 of 144), not kept | the strict question only, through equality with the construction (`:450-459`) |
| the empty graph: no definition slot and no flat contract the register maps to a capability | `:247-265` | no: reads the register | yes against this reader's register (strict holds on 144 of 144), not kept | the strict question only, through equality with the construction (`:450-459`); `recordedCapabilityIdentitiesHold` requires that an empty graph carries no identity |

On every distinct recorded graph (144: 143 non-empty and the empty one,
in the 186 distinct recorded locks of the 414 logs of section 3.3, decoded
or not), both questions hold
(`/private/tmp/abg-td77-work/c1/check-final2.json`, section 16.4).

## 12. Who asks which question

Line numbers at the final commit, under `T/code/src`. "Exported" means the
call uses the exported signature, which asks the strict question.

| Entry | Call | Question | Why |
| --- | --- | --- | --- |
| the fold: `projectArtifactTruth` → `RuntimeArtifactFacts.advance` | `abg/artifact_truth.ts:315` `this.prepare(row, "recorded")`; the guard at `:412` | recorded | a recorded install admission's inline lock |
| the admission candidate: `prepareArtifactTruthCandidate` | `abg/artifact_truth.ts:723` `…, "strict", establishedLock)` | strict | the lock is about to be appended. The module-level `admitArtifact` reaches the candidate through `abg/environment_admission.ts:1090`, so it no longer appends a lock that fails the strict question: the candidate throws and the door returns `artifact_truth_conflict`, which `t289-install-event-bodies` asserts unchanged |
| the doors: `product.install`, `workspace.bind`, `catalog.admit`, `product.verify`, install request, installed verification | `install_definition_bindings.ts:142-143`, `environment_definition_bindings.ts:203`, `:533-538`, `catalog_definition_bindings.ts:289-296`, `verification_definition_bindings.ts:122`, `:301`, `environment.ts:445`, `:835`, `install_product.ts:156`, `:317`, `verify_product.ts:154`, `:2538` | strict (exported) | new values and the reader's own verification |
| Catalog admission for new work | `execution_resolution.ts:461` (run), `catalog_operations.ts:299`, `declaration_application.ts:136` | strict (exported `admitGraphFunctionCatalog`) | new work |
| `admitGraphFunctionCatalog` itself | `product/catalog.ts:450` (exported), `:460` (`@internal`, question), `:464`; lock `:490`, verified products `:501`; retention `:469`, `:729` | from its caller | C2 |
| `reconstructHistoricalDeclarationCatalog` | `product/declaration_closure.ts:46` (exported), `:58` (`@internal`), `:67`; passes the question to the Catalog at `:76-79` | from its caller | C2 |
| the read owner's run reads: `prepareRunRead`, `prepareRunReadAtDurablePrefix`, `projectRunTruthAtDurablePrefix`, `project` behind `GraphCallProjectionPort` and the other exported ports | `abg/project_read_ports.ts:968`, `:1036`, `:1860`; `prepareRead` default `:704` | recorded | the proof is bound to recorded history (section 13) |
| the read owner's terminal declaration | `abg/project_read_ports.ts:386-389` `reconstructHistoricalDeclarationCatalog(proof, {…}, prepared.question)` | the entry's | section 13 |
| historical GraphCall source (`projectHistoricalGraphCallSourceAtDurablePrefix`) | `abg/project_read_ports.ts:592-593` | strict | the source is input to a new run |
| closed GraphCall terminal (`projectClosedGraphCallTerminalAtDurablePrefix`) | `abg/project_read_ports.ts:623-625` | strict | its callers continue work: `worksite_command_forward`, `native_work_reacquisition` |
| worksite forward, governance coverage | `abg/worksite_command_forward.ts:103`; `abg/invocation_execution_truth.ts:126` (a historical C-call result used as the governed source of a new invocation) | strict (exported) | both feed new work |
| release qualification | `abg/qualification_proof.ts:214` | strict (exported) | qualification is admitted work. Its later `GraphCallProjectionPort` read asks recorded, so it accepts what both accept (section 22) |
| conformance evaluation | `validator/conformance_definition_bindings.ts:271` (`projectAdmittedWorkspaceBindingByInvocationRef`), `:294` (`reconstructDeclarationBasis`) | strict (exported) | conformance evaluation is admitted work |
| `project.read#workspace_status` | `product/project_read_definition_bindings.ts:719` `WorkspaceProjectionPort.status(packet, "recorded")` → `product/project_read_ports.ts:637`, lock at `:673` | recorded | section 13 |
| `project.read#ticket_consensus` | `product/project_read_definition_bindings.ts:264-269` `projectAdmittedWorkspaceBindingByInvocationRef(…, lock, "recorded")` → `abg/environment_admission.ts:396-413` | recorded | the lock is the recorded install lock of the same artifact truth |
| run-read authority | `abg/project_read_definition_bindings.ts:631-638` `constructCapabilityGrant(…, "recorded")`; `:822-829` `validateCapabilityGrantForProductBasis(…, "recorded")` → `product/invocation.ts:863-889`, `:1064-1088` → `selectedCapabilityOwner` `:736`, graph `:756` | recorded | the installs are the recorded installs of the source binding |
| run continuation, admission and invocation grants | `owner_bindings/run_invocation.ts:1537`, `:1603`, `:1694`, `:1813`; `product/run_invocation_operation.ts:358`; `abg/invocation_admission.ts:788`; `product/invocation.ts:943`, `:1118` | strict (exported or explicit) | new work |
| `product.verify`'s own graph and identity checks, `capabilityDefinitionGraphCoordinate`, `capabilityDefinitionGraphAssetBytes` | `verify_product.ts:2538`; `shared/capability_contracts.ts:588`, `:601` | strict (exported) | the reader's own construction |
| `catalog_list`, `catalog_describe` | `product/project_read_definition_bindings.ts` `reconstructCatalogSelection` → `CatalogOperationPort.admit` | strict | unchanged; section 22 |

The exported signatures are unchanged, and the `.d.ts` files of the build are
byte-identical to the base build's (`stripInternal`), so the published
catalog digest is unchanged (section 19). A callback index such as
`[lock].every(isResolvedProductLock)` is not `"recorded"`, so it asks the
strict question; the lanes assert it.

## 13. Read copies and their bindings

| Read copy | Bound to recorded history by | Refusal when the binding fails |
| --- | --- | --- |
| the run read's historical declaration proof (`graph_call_result`, the child reads, `prepareRunReadAtDurablePrefix(…).project`) | (1) the re-admitted Catalog's `workspaceBinding`, `resolvedLock` and `installedProducts` equal the environment that the recorded artifact truth projects for the root basis's binding (`product/declaration_closure.ts:80-89`, with the environment from `abg/project_read_ports.ts:371-385`); (2) the Catalog's `basisDigest` and ref and the View's digest and id equal the recorded root execution basis (`abg/project_read_ports.ts:390-393`) | (1) "declaration Catalog differs from its exact admitted workspace, installs or lock"; (2) "historical Catalog/View differs from the root basis"; both `invalid_history` on the Public read (lane `run read`) |
| `project.read#workspace_status` | the binding owner first requires the packet's binding to be the recorded admission (`product/project_read_definition_bindings.ts` before `:719`: source, admission row, authority basis, actor, and `bindingAuthorityMatches` over the binding, installs and lock coordinates); the projection then requires the lock to hold the ProductSet and the binding candidate (`product/project_read_ports.ts:673-679`), and the binding names its lock by id and digest | `not_ready` (lane `workspace_status`); a packet that differs from the recorded binding is `resource_relation_mismatch` as at base |
| `project.read#ticket_consensus` authority | the lock is the recorded install lock of the binding row's installs in the same artifact truth, and it equals the `dependency_lock` slot (`product/project_read_definition_bindings.ts:251-262`) | `null`, as at base |
| run-read grants | the installs are the recorded installs of the source binding (`expectedRunReadAuthority`); supplied slots and grants are compared with them | `projection_basis_mismatch`, as at base |

Read copies that stay strict, reported as C2 asks: the historical GraphCall
source, the closed GraphCall terminal, worksite forward, governance coverage
(`invocation_execution_truth`), release qualification, conformance evaluation,
`catalog_list` and `catalog_describe` (table 12). Each feeds new work or
admits a supplied Catalog as today.

## 14. The verified-artifact carrier

A verified artifact is not in any log. It reaches a read inside a supplied
historical declaration proof's `catalog.readinessBasis.verifiedProducts`.
What binds it:

| Part | Bound by |
| --- | --- |
| the carrier | `verificationDigest` over the carrier and `verificationRef` naming it (recomputed by both questions) |
| contribution manifest | `contributionManifestDigest` |
| graph | row digests and graph digest (11.2); the graph asset digest |
| contracts and identities | `recordedCapabilityIdentitiesHold` (catalog digest recomputed from the carrier's own contracts and catalog-schema contract; membership) |
| definition coordinates | every owner coordinate of the graph is one of the carrier's own flat contract or definition-slot coordinates (`product/verify_product.ts`, both questions) |
| the carrier in a read | the Catalog's admitted verified set must match the lock rows (`admitGraphFunctionCatalog`); the Catalog's `basisDigest`, which covers the verified products, must equal the recorded root basis's `catalogBasisDigest` (section 13) |

The C3 stop does not hold: the catalog digest commits to a verified
artifact's identities as it does to a lock row's, and in a read the carrier
is bound to recorded history by the root basis digest. The lane `run read`
changes a verified product outside its lock row (`checkedPayloadFiles`),
reseals it, re-admits the Catalog under the recorded question and narrows
the View exactly; the read refuses with "historical Catalog/View differs from
the root basis" and `invalid_history`.

## 15. Lanes

`T/test_env/tests/t292-td77-recorded-product-truth.test.mjs`, 22 tests. The
carrier is the first recorded install lock of the tracked rc.10 fixture
`test_env/fixtures/t287-current-owner/native-assessment/events.jsonl.gz`
(one toolchain row and one consumer row with an empty graph). Every variant
and tamper reseals the changed parts with the owners' digest formulas, so
only the named relation can refuse it. Final run:
`/private/tmp/abg-td77-work/battery/final/t292-td77-recorded-product-truth.tap`.

| Lane | Asserts |
| --- | --- |
| recorded lock | both questions accept the recorded lock and each graph; `recordedCapabilityIdentitiesHold` on each row; resealing an unchanged lock reproduces every recorded digest |
| variants (i), (ii), (iii) | (i) one identity added to a projected-only contract, (ii) one identity removed, (iii) one capability row removed with every identity and dependency naming it: the lock digest and catalog digest move; recorded accepts; strict refuses; a callback index refuses |
| 8 tampers | identities changed with the catalog digest stale; identities changed with the catalog recomputed and the graph coordinates stale; an identity naming no row; a graph row changed without its digest; a row digest without the graph digest; a dependency naming no row; a dependency cycle; a row dropped while a contract names it: both questions refuse |
| tamper relations | each tamper is refused by its named relation: the identity relation for three, the flat coordinates for one, the graph relations for four |
| empty graph | the toolchain row alone is a lock; with its graph emptied and no identity, recorded accepts and strict refuses (the register maps its contracts to capabilities); with one identity, both refuse |
| stale lock digest | refused by recorded; resealed, accepted |
| fold | one recorded install event re-sealed with each variant (payload digest and event id recomputed): artifact truth projects the variant's lock; each tamper throws "Product install inline body requires one resolved lock and no body cause", as at base |
| run door | each variant: the Catalog stage returns `binding_lock_mismatch` and execution resolution `incompatible_or_unproven`; the recorded lock passes the lock check (`verified_product_mismatch` on the empty verified set) |
| workspace_status | the recorded lock projects the same status under both questions; each variant is `not_ready` under the recorded question |
| verified artifact ×3 | the reader's own verification of this tenant, copied: both questions accept; each variant recorded-accepted and strict-refused; each tamper, an empty graph with an identity and a stale verification digest refused; an empty graph with no identity accepted by recorded |
| run read | the D2 store (evidence root): the recorded proof projects on the Public read and on the port; a lock variant (recorded-accepted, strict-refused) is refused by binding (1) with `invalid_history`; a verified product changed outside its lock row is refused by binding (2) with `invalid_history` |

Run-door comparison on the base build and this build, the same three
variants with the same digests (`/private/tmp/abg-td77-work/lanes/run-door-compare.mjs`;
outputs `run-door-base-root.json` and `run-door-abg-td77.json`, byte-identical):
each variant `binding_lock_mismatch` at the Catalog stage,
`incompatible_or_unproven` at execution resolution, and `not_ready` from
`workspace_status` under the strict question. C4 holds on this door.

## 16. Evidence at scale

### 16.1 The two register changes

| Change | Form | Builds |
| --- | --- | --- |
| simulated withdrawal of `abg.operation.interaction.respond` | TD-25M's form: in the built `shared/capability_contracts.js`, `capabilityRefsForContract` returns `[]` for that contract when `globalThis.__TD25M_EXPERIMENT__` is set (preload `/private/tmp/abg-td25m-work/scripts/sim-preload.mjs` for the lanes; the probe sets the flag per mode) | `/private/tmp/abg-td77-work/sim-final` (this build) and `sim-base` (`c1f655735`) |
| real register edit | `shared/capability_contracts.ts:82`: `abg.schema.consensus-subject` removed from the `projectedPublicContractIds` of `abg.capability.catalog.invoke-graph-function@5`; the module loads (the roster is unchanged), and the build regenerates the reader's catalog (`catalogDigest` `sha256:4f8627d7…` instead of `sha256:8c5f262f…`) | `sim2-final`, `sim2-base`, each rebuilt with `npm run build` |

### 16.2 Artifact truth over 121 stores

The 118 logs that project on base, the two tracked fixtures and the live
rc.12 store (`/private/tmp/abg-td77-work/logs121.txt`, 0.95 GB). Each probe
decodes each log afresh, selects the whole prefix and projects artifact truth
(`/private/tmp/abg-td77-work/scripts/scale-probe.mjs`; outputs
`/private/tmp/abg-td77-work/scale/*.jsonl`; comparison
`/private/tmp/abg-td77-work/scale/compare.py`). The digest is
`sha256Canonical` of the projection.

| Build and register | Project | Digest equal to base, unchanged register | Refused |
| --- | ---: | ---: | --- |
| base, unchanged | 121 | 121 | 0 |
| this build, unchanged | 121 | 121 | 0 |
| this build, simulated withdrawal | 121 | 121 | 0 |
| base, simulated withdrawal | 0 | 0 | 121: 76 "Product install inline body requires one resolved lock and no body cause", 45 "Product install artifact truth requires one complete candidate and resolved lock" |
| this build, register edit | 121 | 121 | 0 |
| base, register edit | 0 | 0 | 121, the same two messages, 76 and 45 |

None of the 121 stores holds a `release.snapshot` or `product.materialize`
artifact admission (only `product.install` and `workspace.bind`, 121 each),
so the fold branch of residual 22.4 is not reached.

### 16.3 The three lanes on the changed copies

Per case, `ok` or `not ok`. "Unchanged" is this build's own final run of the
lane (section 17).

| Lane, case | Unchanged | This build, withdrawal | This build, edit | Base, withdrawal | Base, edit |
| --- | --- | --- | --- | --- | --- |
| `r10-child-proof` 1: actual child selects a different output contract from the admitted root without root or Vi | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 2: missing, foreign, stale View and equal-URI changed declaration proofs refuse from a real p | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 3: native root/child ancestry and basis coordinates cannot be supplied across an invocation | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 4: future environment admission refuses even if a supplied projection otherwise looks equal ( | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 5: held-parent summary does not erase a genuinely closed child or close its Run (held status  | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 6: same child remains authentic after actual root completion at prefix831; no current active- | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 7: one exact contract selector refuses competing same-valued owners inside the resolved closu | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 8: fresh-process child projection reads only the retained log once proof is supplied; no curr | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 9: conformance keeps the complete artifact-truth, inventory and Program joins around the shar | ok | not ok | not ok | file fails at load | file fails at load |
| `r10-child-proof` 10: the retained native log and proof bytes remain unchanged | ok | ok | ok | file fails at load | file fails at load |
| `t287-historical-source-resource` 1: actual R10 ancestry, declaration and leaf proof owners return borrowed historical facts; s | ok | not ok | not ok | not ok | not ok |
| `t287-historical-source-resource` 2: Run resource schema admits the one declaration dependency and refuses extra authority befo | ok | ok | ok | ok | ok |
| `t287-historical-source-resource` 3: a later prefix of the same derivation generation lends the same retained historical source | ok | not ok | not ok | not ok | not ok |
| `t287-historical-source-resource` 4: an append rollback replaces the derivation generation and drops the retained historical so | ok | not ok | not ok | not ok | not ok |
| `t287-cross-cut-public-read` 1: different-cut native Definition reads keep blocked absence and exact historical child resu | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 2: current catalog and historical source permission refuse independently | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 3: historical source digest and child declaration evidence remain necessary | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 4: Product metadata projection refuses incoherent catalog and missing or duplicate operation  | ok | ok | ok | ok | ok |
| `t287-cross-cut-public-read` 5: late child proof preserves only the exact acquired prefix; copies and closed owners recons | ok | ok | ok | not ok | not ok |

On base, both changes refuse the reads themselves: `r10-child-proof` fails
at load ("historical environment is absent" from `terminalDeclaration`);
`t287-historical-source-resource` fails in its fixture, whose
`graph_call_result` read returns no value; `t287-cross-cut-public-read`
cases 1, 2, 3 and 5 fail where the exact-prefix workspace environment is
refused. On this build every read projects. The four cases that still fail
are the work paths of residual 22.1: `r10-child-proof` case 9 (conformance
evaluation, "declaration Catalog differs from its exact admitted workspace,
installs or lock") and `t287-historical-source-resource` cases 1, 3 and 4
(`historicalGraphCallSource()`, the leaf invocation port's source for a
running C-call, returns null after the fixture's recorded read succeeded).

### 16.4 C1 over every recorded lock

`/private/tmp/abg-td77-work/c1/check-locks.mjs` applies both questions to
the 186 distinct recorded locks (every inline lock of a `product.install`
admission in the 414 logs of section 3.3) and to each distinct graph.

| Build | Locks, recorded | Locks, strict | Graphs (144), recorded | Graphs, strict |
| --- | ---: | ---: | ---: | ---: |
| this build (`check-final2.json`) | 186 | 186 | 144 | 144 |
| this build with the register edit (`check-register-edit.json`) | 186 | 0 | 144 | 144 |

The register edit changes identities, not the graph, so every graph stays
strict and every lock with a toolchain row fails the strict identity check.
The recorded question accepts every recorded lock under both registers.

### 16.5 Probe: a door and a lock that only the strict question accepts

`/private/tmp/abg-td77-work/probe-forged/probe.mjs` (scratch, not a lane;
outputs `final.json` and `base.json` beside it). It takes the first recorded
install lock of the rc.10 native-assessment fixture, sets the toolchain row's
`catalogDigest` to another sha256, carries it into every owner coordinate of
the graph and the contribution manifest, and reseals the row digests, graph
digest, graph asset digest, contribution manifest digest and lock digest
(resealing the unchanged lock reproduces it). It then admits an install of
that lock through `admitProductInstall` (`abg/environment_admission.ts:1144`)
into a new empty store, folds the store in process, and folds it cold from
the appended bytes. Final run on a copy of this build with its generated files
(`/private/tmp/abg-td77-work/td36r-final`), base run on `base-root`:

| | This build | Base |
| --- | --- | --- |
| forged lock, strict | accepted | accepted |
| forged lock, recorded | refused (catalog digest does not recompute) | base has one question |
| `admitProductInstall` | `artifact_owner_result`, one event appended | the same |
| fold in process (the store's owned derivation) | projects | projects |
| fold cold from the appended bytes | throws "Product install inline body requires one resolved lock and no body cause" | projects |
| control: the recorded lock, same steps | admitted; both folds project | the same |

The door's own outcome is unchanged; what changes is every later read of that
store from its bytes. The Public `product.install` operation path
(`install_definition_bindings.ts`, `install_product.ts`) was not probed: it
also compares the lock with a verified artifact and an installed root.

## 17. Lanes before and after

Each file alone, in the foreground order of `/private/tmp/abg-td77-work/battery/lanes.txt`, with
`--test-concurrency=1` and `ABI5_EVIDENCE_ROOT` set: on the base build
(`/private/tmp/abg-td77-work/base-root`, `c1f655735`) and on this build
(`939e3e74c`). The list is the original brief's lanes, the three td36r
lanes and every test file under `test_env/tests` that names a changed guard
or entry (52 files by `grep`; `t287-wave2-owner-contract-source-set` was
found missing after the first pass and run alone on both builds). The td36r
lanes on this build ran on a scratch copy of the final tree with
`test_env/fixtures/abi5-root-candidate-basis.json` refreshed by
`scripts/refresh-candidate-basis.mjs` (`/private/tmp/abg-td77-work/td36r-final`; not
committed); on the unrefreshed tree they refuse at the fixture
(`artifact_digest_mismatch`), because the content digest moved.
Outputs: `/private/tmp/abg-td77-work/battery/{base,final,td36r-final}/*.tap`;
comparison `/private/tmp/abg-td77-work/battery/compare.py` → `compare.txt`.

Totals: base 64 files, 387 tests, 355 pass, 0 fail, 32 skipped; this build
65 files, 409 tests, 377 pass, 0 fail, 32 skipped (the 22 more are the TD-77
lanes). Every case of the 64 shared files has the same outcome on both
builds; pass to fail: none. The 32 skips are the same cases on both.

| File | Base tests/pass/fail/skip | This build | Cases that differ | Base s | This build s |
| --- | --- | --- | --- | ---: | ---: |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | same | 117 | 113 |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | same | 329 | 322 |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | same | 596 | 605 |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | same | 1 | 1 |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | same | 0 | 1 |
| `t287-st2a-g-capability-definition-graph` | 4/4/0/0 | 4/4/0/0 | same | 33 | 35 |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | same | 29 | 30 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | same | 54 | 54 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | same | 38 | 40 |
| `r4-catalog-admission` | 8/8/0/0 | 8/8/0/0 | same | 1 | 1 |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 | same | 275 | 291 |
| `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | same | 83 | 104 |
| `t287-wave2-installed-product-verification` | 2/2/0/0 | 2/2/0/0 | same | 76 | 103 |
| `m5-event-store-reopen` | 27/27/0/0 | 27/27/0/0 | same | 61 | 64 |
| `t292-td36r-admitted-binding-owner` | 1/1/0/0 | 1/1/0/0 (refreshed copy) | same | 31 |  |
| `t292-td36r-bind-door-strings` | 6/6/0/0 | 6/6/0/0 (refreshed copy) | same | 33 |  |
| `t292-td36r-remaining-owners` | 6/6/0/0 | 6/6/0/0 (refreshed copy) | same | 1 |  |
| `m5-s06-prime` | 51/51/0/0 | 51/51/0/0 | same | 37 | 40 |
| `t287-interrupted-event-resource-recovery` | 8/8/0/0 | 8/8/0/0 | same | 5 | 4 |
| `t287-pfc-f08a-product-verification-boundary` | 1/1/0/0 | 1/1/0/0 | same | 7 | 7 |
| `t287-w2-05-generator-package-reproducibility` | 2/2/0/0 | 2/2/0/0 | same | 117 | 125 |
| `t287-w2-05-static-binding-algebra` | 4/3/0/1 | 4/3/0/1 | same | 1 | 0 |
| `t289-install-event-bodies` | 4/4/0/0 | 4/4/0/0 | same | 59 | 73 |
| `t292-binding-row-owner-differential` | 5/5/0/0 | 5/5/0/0 | same | 1 | 1 |
| `integration-shared-seams` | 2/2/0/0 | 2/2/0/0 | same | 2 | 3 |
| `m5-fresh-process-reconstruction` | 1/1/0/0 | 1/1/0/0 | same | 43 | 60 |
| `r10-projection-contracts` | 11/11/0/0 | 11/11/0/0 | same | 3 | 3 |
| `r5-invocation-admission` | 2/2/0/0 | 2/2/0/0 | same | 49 | 66 |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | same | 310 | 322 |
| `t287-conformance-owner-reuse` | 1/0/0/1 | 1/0/0/1 | same | 0 | 1 |
| `t287-generic-job-intake` | 1/1/0/0 | 1/1/0/0 | same | 52 | 51 |
| `t287-generic-job-revision` | 2/1/0/1 | 2/1/0/1 | same | 1 | 1 |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | same | 7 | 7 |
| `t287-installed-product-coordinate` | 11/11/0/0 | 11/11/0/0 | same | 2 | 2 |
| `t287-malformed-gtl-gate` | 6/6/0/0 | 6/6/0/0 | same | 1 | 1 |
| `t287-management-supervision` | 5/5/0/0 | 5/5/0/0 | same | 158 | 158 |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 | same | 1 | 0 |
| `t287-owned-native-proof` | 1/0/0/1 | 1/0/0/1 | same | 0 | 1 |
| `t287-native-worksite-execution` | 6/4/0/2 | 6/4/0/2 | same | 1 | 0 |
| `t287-public-terminal-projection` | 3/0/0/3 | 3/0/0/3 | same | 0 | 1 |
| `t287-st1-installed-cross-owner-hello` | 3/3/0/0 | 3/3/0/0 | same | 131 | 130 |
| `t287-selected-action` | 1/0/0/1 | 1/0/0/1 | same | 1 | 0 |
| `t287-worksite-command-execution` | 12/12/0/0 | 12/12/0/0 | same | 177 | 179 |
| `m5-s03-authority` | 4/4/0/0 | 4/4/0/0 | same | 47 | 45 |
| `steel-consumer-declaration` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-declared-testing-capability` | 5/3/0/2 | 5/3/0/2 | same | 41 | 39 |
| `t287-continuation-causation` | 1/1/0/0 | 1/1/0/0 | same | 1 | 0 |
| `t287-post-binding-worksite-write` | 2/2/0/0 | 2/2/0/0 | same | 59 | 60 |
| `t287-recursive-registered-selection` | 7/6/0/1 | 7/6/0/1 | same | 80 | 83 |
| `t287-required-operation-bindings` | 10/10/0/0 | 10/10/0/0 | same | 204 | 207 |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 | same | 0 | 1 |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 | same | 0 | 0 |
| `t287-held-prefix` | 5/0/0/5 | 5/0/0/5 | same | 0 | 0 |
| `t287-ordered-reconstruction` | 4/4/0/0 | 4/4/0/0 | same | 1 | 0 |
| `t287-readable-stops-foldback` | 5/5/0/0 | 5/5/0/0 | same | 76 | 77 |
| `t287-recursive-failure-foldback` | 8/8/0/0 | 8/8/0/0 | same | 108 | 110 |
| `t287-owned-call-reference` | 1/1/0/0 | 1/1/0/0 | same | 46 | 48 |
| `t287-native-work-reacquisition` | 8/7/0/1 | 8/7/0/1 | same | 1 | 1 |
| `t287-native-owner-reuse` | 2/0/0/2 | 2/0/0/2 | same | 0 | 0 |
| `t287-retained-installed-consumer` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-single-address-space-consolidation` | 17/17/0/0 | 17/17/0/0 | same | 515 | 544 |
| `t292-td77-recorded-product-truth` | absent | 22/22/0/0 | same |  | 41 |
| `t287-wave2-owner-contract-source-set` | 15/15/0/0 | 15/15/0/0 | same | 0 | 1 |

Build and lints on this build (`939e3e74c`) and on base:

| Check | This build | Base |
| --- | --- | --- |
| `npm run build` (`tsc` and the manifest generator) | passes | passes |
| `lint:imports`, `lint:lifecycle`, `lint:calculus` | pass | pass |
| `lint` with `test_env/qualification/recipe/verification-recipe.json` | 71 of 72 files pass; `test_env/uat/continuation.test.mjs` is absent from the tree | the same |
| `lint:evidence` | fails: `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` is absent from the worktree | the same |
| `node --check` on the TD-77 lane file (not in the recipe) | passes | |

## 18. Replay comparison

`/private/tmp/abg-td25r-work/scripts/replay-log.mjs` over TD-25M's 23 replay
logs, with the live store replaced by its copy
(`/private/tmp/abg-td77-work/replay-logs.txt`): whole-log replay digest,
FH facts and continuations, and per Run the Run replay (14 Runs). The base
output `replay/base.jsonl` and this build's `replay/final.jsonl` are
byte-identical (17,845 bytes, 23 lines). Two Runs carry the same replay
error on both ("replay requires zero or one exact run_stopped event";
"replay run_stopped event and run_terminal HoldsAt truth disagree"), as
recorded by TD-25R.

## 19. Identity digests

`/private/tmp/abg-td77-work/scripts/identity.mjs`, base build against this
build:

| Value | Base `c1f655735` | This build `939e3e74c` |
| --- | --- | --- |
| `productContentDigest` | `sha256:3e8bcd0e40399a9be74fa8ef1dde04afcc443e1c2846f392b439b6f31dec411a` | `sha256:9fdbf3e34df09a60b512ca8c03f22bfdbd567580f93258676e1b2c6f724f82f1` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | the same |
| capability graph `graphDigest` | `sha256:7079ed7b04d89ac089d1d03cf4b679b02c18d79c5d041c3ed5b4abd833341fbb` | `sha256:6b2d75f91de09bc6a61f3d7de99dc5fce569958e7100f3553c5159a53cfca6b7` |
| graph rows (16) apart from the content digest each coordinate carries | | equal |
| `publicContractCatalog` | | equal |
| `.d.ts` output | | byte-identical |

The content digest moves because the code moved; the graph digest moves only
through the content digest its owner coordinates carry. The catalog digest,
the public contracts and the declaration output are unchanged.

## 20. Lines changed

`git diff --numstat c1f655735` over `T/code/src`, `T/design` and `T/test_env`:

| File | Added | Removed |
| --- | ---: | ---: |
| `code/src/abg/artifact_truth.ts` | 8 | 5 |
| `code/src/abg/environment_admission.ts` | 24 | 1 |
| `code/src/abg/project_read_definition_bindings.ts` | 4 | 0 |
| `code/src/abg/project_read_ports.ts` | 27 | 7 |
| `code/src/product/catalog.ts` | 27 | 6 |
| `code/src/product/declaration_closure.ts` | 27 | 1 |
| `code/src/product/environment.ts` | 53 | 13 |
| `code/src/product/invocation.ts` | 46 | 6 |
| `code/src/product/project_read_definition_bindings.ts` | 5 | 1 |
| `code/src/product/project_read_ports.ts` | 22 | 5 |
| `code/src/product/verify_product.ts` | 100 | 16 |
| `code/src/shared/capability_contracts.ts` | 157 | 5 |
| `design/README.md` | 1 | 1 |
| `design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md` | 104 | 0 |
| `design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md` | 6 | 2 |
| `test_env/tests/t292-td77-recorded-product-truth.test.mjs` | 506 | 0 |
| total: code 500/66, design 111/3, lanes 506/0 | 1117 | 69 |

Generated files (`contracts/`, `product-toolchain-manifest.json`,
`test_env/fixtures/abi5-root-candidate-basis.json`) are restored and not
committed.

## 21. Deviations

1. **Overloads, not new names.** The first code commit (`3dab16298`) gave
   each owner a second exported entry carrying the question. That bypassed
   test-harness overrides keyed on the owners' names (for example
   `t287-historical-source-resource` counts its reconstructions through such
   an override: it saw 0 reconstructions where it expects 1 and failed 3 of 4).
   `48ab252d7` replaced them with one name per owner: the exported signature
   (strict) and an `@internal` overload with a trailing question. The `.d.ts`
   output is byte-identical to the base build's, so the published catalog
   digest is unchanged.
2. **`prepareRead`'s default is `"recorded"`.** Every entry in
   `abg/project_read_ports.ts` names its question; the default is the read
   owner's own (`project`), so a read entry added later asks the read
   question unless it names another. The two work entries name `"strict"`.
3. **The experiment copies were built from `48ab252d7`.** `939e3e74c`, the
   last code commit, moves one import in `abg/artifact_truth.ts` back to
   `../product/index.js`, as at base. The index re-exports the same function
   from `./environment.js`, so the copies run the final behaviour; their
   sources differ from the final tree in that one import only
   (`diff -r` over `code/src`).
4. **The C1 relation check runs once per graph.** Each graph is checked with
   the whole relation (`capabilityGraphRelationsHold`); the lane
   `tamper relations` shows that each relation refuses on its own.
5. **The base battery has no TD-77 lane file**; its row reads "absent".

## 22. Residuals and items for the Executive

1. **Evidence at scale and C4 disagree on four cases.** With the register
   changed (both the simulated withdrawal and the real edit), this build
   refuses on four cases that the original brief expected to keep their
   outcome: `r10-child-proof` case 9 (conformance evaluation:
   `reconstructDeclarationBasis` refuses with "declaration Catalog differs
   from its exact admitted workspace, installs or lock") and
   `t287-historical-source-resource` cases 1, 3 and 4 (the historical
   GraphCall source, input to a new run, returns null). Both are work paths
   that C4 keeps strict; the reads in the same lanes project. I did not flip
   either question. The Executive rules whether conformance evaluation and
   the historical source are reads (recorded) or work (strict).
2. **Release qualification asks both.** `abg/qualification_proof.ts:214`
   reconstructs strict, then reads through `GraphCallProjectionPort`
   (recorded). It accepts what both questions accept; they differ only on
   the carrier of item 3. The recorded admission does not hit the strict
   cache, so qualification pays one more full Catalog admission per proof.
3. **The stop: strict does not imply recorded on one kind of lock, and a
   door appends it.** The strict question never recomputed the catalog
   digest, so a lock whose `catalogDigest` is consistent across its
   contribution manifest and graph coordinates but does not recompute from its
   own contracts passes strict and fails recorded. `admitProductInstall` checks strict and appends
   it, on base and on this build; a cold fold of that store throws on this
   build and projects on base (16.5). That alters what the paths that read
   that store refuse, which is the brief's last stop condition. It follows
   from C1's catalog recompute and C2's fold question; the remedies are a
   recorded check at the door (a new check on a work path, against C4) or
   dropping the recompute from C1. Not designed around. No recorded lock is
   such a lock (186 of 186 recompute, section 16.4). For the Executive's
   ruling.
4. **The fold's `release.snapshot` branch reads the register.**
   `isReleaseOperationArtifact` (`implementation/release_publication.ts:143`)
   admits the snapshot's bound environment and compares its capability
   grants with the reader's packet `capabilityRefs`. No store of the 121 has
   a `release.snapshot` event. Not changed; C2 names no question for it.
5. **The run-read grant looks up the reader's capability refs.**
   `expectedRunReadAuthority` constructs grants for the reader's packet
   `metadata.capabilityRefs` and selects their owner in the recorded graphs.
   A recorded graph without exactly one owner of the reader's capability for
   that read refuses the read: grant construction throws inside the run-read
   kernel (`abg/project_read_definition_bindings.ts:794`). Not exercised by a
   lane.
6. **The verified-artifact guard does not compare the contribution
   manifest's catalog id and digest with the carrier's,** as at base. The
   lock guard does.
7. **`catalog_list` and `catalog_describe` stay strict**: they admit a
   supplied Catalog through `CatalogOperationPort.admit`. Under a changed
   register they refuse.
8. **`prepareRunReadAtDurablePrefix` is exported and asks recorded.** It is
   the Public run read's preparation; a caller that uses its projection to
   start work would need the strict question.
9. **`productContentDigest` moves with the code.** The tracked fixture
   `test_env/fixtures/abi5-root-candidate-basis.json` must be refreshed when
   the branch merges (the td36r lanes ran on a scratch copy with it
   refreshed, section 17).

## 23. What an independent reviewer should try to break

- A lock or verified artifact that the recorded question accepts and that is
  not internally established: change any recorded part, reseal only some of
  the digests, and show the recorded question accepts it. The lanes' reseal
  helpers (`resealCarrier`, `resealLock`, `resealVerified`) list the order.
- A constructor relation statable over the graph alone that
  `capabilityGraphRelationsHold` does not check (table 11.2).
- An entry that asks the wrong question: a path that starts or continues
  work and reaches a recorded question, or a read bound to recorded history
  that still asks strict. Table 12 lists each; `grep -n '"recorded"'` over
  `code/src` lists every recorded entry.
- A callback or spread call that passes a second argument equal to
  `"recorded"` by accident.
- The module-level `admitArtifact` appending a lock that fails strict (the
  candidate at `abg/environment_admission.ts:1090` is strict).
- Another lock that strict accepts and recorded refuses, beyond the catalog
  digest of 22.3, and a door that appends it (16.5 has the probe).
- A read copy whose binding does not refuse a recorded-accepted value that is
  not the recorded one (section 13): for the run read, a supplied proof
  whose Catalog is re-admitted under recorded with a lock or verified set the
  store did not record.
- The recorded Catalog retention: a recorded admission entering
  `ownedCatalogs` or `readyCatalogs`, so a later strict admission reuses it
  (`product/catalog.ts:469`, `:729`).
- The evidence at scale with a third register change, for example a
  capability row removed from the register.
- Residual 22.1: whether conformance evaluation or the historical GraphCall
  source is a read.
