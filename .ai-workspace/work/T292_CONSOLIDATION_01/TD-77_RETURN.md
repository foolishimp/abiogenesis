# TD-77 Return: a reader and a recorded Product lock

Writer: Claude Opus 5.5. Branch `claude/td77-recorded-lock-truth` from local
`main` at `c1f655735`, worktree `/private/tmp/abg-td77`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag, no merge.

**Status: not complete on R5, which needs a ruling; complete on R1 to R4 and
R6 to R8.** R5 is not realized: the fold's `release.snapshot` branch
establishes its proof's recorded lock and verified products through release
qualification, which R4 keeps as built and which the release door shares; it
asks the strict question there. Described in the design text; for ruling
(item 22.4).

- **R1, the stop removed.** The recorded question no longer recomputes the
  catalog digest. Everything the strict question accepts, the recorded
  question accepts (the table "Strict implies recorded" below; lane 23). The
  probe's forged lock, which stopped the earlier build, now answers both
  questions; the store `admitProductInstall` appends with it folds after a
  cold reopen on the final build as on base, with the same artifact-truth digest
  (`sha256:5817155d…`) and the same appended bytes.
- **What the recorded question does not detect:** identities altered among
  the rows of the carrier's own graph with every digest recomputed. A door
  refuses such a lock with the strict question (`admitProductInstall`:
  `scope_mismatch`, nothing appended); each read copy refuses it by its
  binding to recorded history (the run read `invalid_history`,
  `workspace_status` `not_ready`). Lanes 13, 17, 18, 19, 21 and 24.
- **Evidence at scale on the final build.** Under the simulated withdrawal
  and the real register edit, artifact truth projects on all 121 stores
  with the base digest, where base refuses all 121; 186 of 186 recorded
  locks answer the recorded question under both registers. The three lanes
  differ from the unchanged register on the four cases R3 expects
  (`r10-child-proof` 9; `t287-historical-source-resource` 1, 3, 4) and on
  no other.
- **Lanes.** The TD-77 lane file has 24 tests, 24 pass. Before and after,
  every case of the 63 files shared with base has the same outcome on the
  final build (section 17; the 64th file of the list is the TD-77 lane). Replay over the 23 logs is byte-identical. The
  catalog digest, the public contract catalog, the `.d.ts` output and the
  capability graph's rows apart from the content digest are unchanged.

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
| `2e549de27` | Return: the stop the door probe found, lints, status |
| `fef9288f8` | design: the recorded question binds identities by row membership; strict implies recorded; the release branch and the run-read capability |
| `af241b0f7` | code: the recorded question binds identities by row membership only; the read preparation has no default question |
| `dc1adf775` | lanes: the undetected alteration and its refusers; strict implies recorded; `r10-child-proof` states its question |
| `fed7b9f9d` | Return: the final rulings applied; R5 for ruling |
| `14e5779ab` | design: the run read's recorded question is stated on the internal overload |
| this commit | Return: lane references, the R4 evidence, the status line |

Lines changed under `code/src`, `design` and `test_env`: 1348 added, 73
removed (code 495/69, design 161/3, lanes 692/1); section 20.

Sections 1 to 8 are the trace, kept as written; their line numbers are at
`c1f655735`. Sections 9 to 23 are the build, brought to the final state
where the final rulings change them; their line numbers are at `dc1adf775`.
Section 9 records the build rulings C1 to C5; the final rulings R1 to R8
follow.

## Final rulings and how each is realized

| Ruling | Realized by | Shown by |
| --- | --- | --- |
| R1, the recorded question does not recompute the catalog digest | `recordedCapabilityIdentitiesHold` (`product/verify_product.ts:759`) is row membership only: every identity names a row of the carrier's own graph, so a carrier with an empty graph carries no identity. The recompute through `productPublicContractCatalogDigest` and its import are removed (`af241b0f7`). The lock guard asks it at `product/environment.ts:711`, the verified guard at `product/verify_product.ts:944`. The catalog relations the strict guard checks inside the carrier stay in the shared body: the row's catalog id and digest equal its contribution manifest's (`productLockHolds`); every flat owner coordinate carries the row's catalog (`lockRowGraphMatchesCatalog`, `product/environment.ts:800`); every owner coordinate of a verified artifact's graph is one of its own flat or slot coordinates, built with its catalog digest (`product/verify_product.ts:916-921`). No door changes. | design text, paragraph "The recorded graph binds owning contracts"; lanes 5 to 15, 22 |
| R1, what is not detected and where it is refused | The recorded question accepts identities altered among the graph's rows with every digest recomputed. A door refuses it with the strict question; a read copy by its binding (section 13). | lane 13 (recorded accepts, strict refuses, the catalog digest is the recorded one and does not recompute); lane 17 (`admitProductInstall`: `artifact_owner_refusal`, `scope_mismatch`, 0 appended); lane 18 (run door: `binding_lock_mismatch`, `incompatible_or_unproven`); lane 19 (`workspace_status`: `not_ready`); lane 21 (verified artifact: recorded accepts, strict refuses); lane 24 (run read, the altered D2 lock: `invalid_history`; a verified product altered among its rows with its lock row unchanged: re-admission under recorded `verified_product_mismatch`, read `invalid_history`) |
| R2, strict implies recorded | The two bodies differ only where strict reads the register; each such strict relation implies the recorded one in its place (table below). | design text, paragraph "Everything the strict question accepts"; lane 23 over every lock, verified artifact and graph the lanes construct (the strict-accepted set asserted exactly: four locks, two verified artifacts); lane 24 on the D2 store's lock and verified products; the probe rerun (section 16.5); 186 of 186 recorded locks and 144 of 144 graphs (16.4) |
| R3, conformance, the historical GraphCall source and the closed terminal stay strict | No code or test change. `r10-child-proof` 9 and `t287-historical-source-resource` 1, 3, 4 depend on the reader's register equalling the retained store's (residual 22.1). | section 16.3: those four cases pass on the unchanged register and refuse under both changes, and no other case of the three lanes differs |
| R4, release qualification as built | No change to release qualification: `abg/qualification_proof.ts` and `implementation/release_publication.ts` are unchanged from `c1f655735`. The owners they call, `reconstructHistoricalDeclarationCatalog` (`product/declaration_closure.ts`) and `admitGraphFunctionCatalog` (`product/catalog.ts`), gained only the `@internal` question overload; their exported path, which qualification calls, asks strict as today, and the strict retention in `readyCatalogs` is unchanged (a recorded admission is retained apart). One extra Catalog admission per proof (residual 22.2). | `git diff c1f655735` names neither qualification file; the 64-file comparison (section 17) |
| R5, the fold's `release.snapshot` branch | Not realized; described. The branch establishes the snapshot's environment through the fold itself (`admitCapabilityEnvironment`, then the `…InResolvedLock` forms, no guard asked again) and its qualification proof through release qualification, whose `deriveGraphOwner` reconstructs the proof Catalog with the exported, strict `reconstructHistoricalDeclarationCatalog`. That stack and its per-prefix `NativeProofDerivation` are shared with the release door. It also reads the reader's release operation contract: the `capability_grants` slot against that contract's `metadata.capabilityRefs`, and `admitExactDefinitionCall` against its definition. Asking recorded there means passing the question through the stack R4 keeps as built and keying its derivation by question; no store and no lane holds a `release.snapshot` row to show that the release door is unchanged (stop condition 3). Item 22.4. | design text, paragraph "The fold's `release.snapshot` branch"; the release code is unchanged from base; none of the 121 stores holds a release row (16.2) |
| R6, no default question | `prepareRead` (`abg/project_read_ports.ts:696`) takes `question` as a required parameter and throws a `TypeError` on any value other than `"recorded"` or `"strict"` (`:704`); each entry names it (`:625` strict; `:968`, `:1044`, `:1868` recorded). No other internal entry has a default (`RuntimeArtifactFacts.prepare`, `selectedCapabilityOwner`, `constructInvocationCapabilityGrant` require it). The overloaded owners (`admitGraphFunctionCatalog`, `product/catalog.ts:468`; `projectWorkspaceStatus`, `product/project_read_ports.ts:641`; the three guards) keep C2's form: the exported one-argument signature is today's entry and asks strict, and an internal caller passes the question to the `@internal` overload; any value other than `"recorded"` is strict. That is the published meaning of the exported signature, not a default an internal caller relies on; R6 leaves it. The exported `prepareRunReadAtDurablePrefix` asks recorded; the sentence saying so sits on its `@internal` overload (deviation 6). `r10-child-proof` called `prepareRead` through its harness without a question and now names `"recorded"`, the question the default gave it. | design text, the entry table; `r10-child-proof` 10/10 on the final build |
| R7, items 22.5 to 22.8 stand | Design sentence added: a run read needs the recorded graph to declare the capability that the reader's read operation names (`expectedRunReadAuthority`, `selectedCapabilityOwner`). | design text, paragraph "A run read needs the recorded graph" |
| R8, generated files | `contracts/`, `product-toolchain-manifest.json` and `test_env/fixtures/abi5-root-candidate-basis.json` are restored before each commit and not committed (item 22.9). | `git status` clean at this commit |

## Strict implies recorded

Each relation the strict question checks with the register, paired with the
relation the recorded question checks in its place. Every other relation is
in the shared body of the guard, which both questions run.

| Guard | Strict relation (reads the register) | Recorded relation in its place | Why the strict one implies it |
| --- | --- | --- | --- |
| graph (`capabilityDefinitionGraphHolds`, `shared/capability_contracts.ts:440`) | strict schema, `capabilityGraphRelationsHold`, then equality with `constructCapabilityDefinitionGraph` over the graph's own owner coordinates (`:450-459`) | strict schema and `capabilityGraphRelationsHold`, then accept (`:449`) | the strict question runs the recorded checks first and adds equality |
| lock row (`productLockHolds`, `product/environment.ts:703-711`) | each contract's `capabilityIdentities` equal `capabilityRefsForContract` | `recordedCapabilityIdentitiesHold`: every identity names a row of the row's graph | the row's graph passes the strict graph question, so it equals the register's construction; a non-empty construction has a row for every register capability, so every identity the register gives names a row; an empty graph is the next row |
| lock row (`lockRowGraphMatchesCatalog`, `product/environment.ts:800-807`) | an empty graph: no contract the register maps to a capability | an empty graph: accept (identities are then empty by the row above) | with no contract mapped, `capabilityRefsForContract` is empty for every contract, so the strict identity relation leaves no identity and the recorded membership holds vacuously |
| lock row, graph | the graph under the strict question | the graph under the recorded question | first row of this table |
| verified artifact (`verifiedProductArtifactHolds`, `product/verify_product.ts:923-943`) | the graph equals `constructCapabilityDefinitionGraph` over the carrier's own coordinates, and each contract's identities equal `capabilityRefsForContract` | `recordedCapabilityIdentitiesHold` | as for the lock row: the graph is the register's construction, which has a row for every capability it maps a contract to; if the construction is empty, no contract of the basis is mapped, so no identity |
| verified artifact, asset digest (`:947-949`) | `sha256Bytes(capabilityDefinitionGraphAssetBytes(graph))` | `sha256Bytes(serializeCapabilityDefinitionGraph(graph))` | `capabilityDefinitionGraphAssetBytes` (`shared/capability_contracts.ts:598`) returns `serializeCapabilityDefinitionGraph(graph)` after the strict graph guard |
| verified artifact, graph | the graph under the strict question | the graph under the recorded question | first row of this table |

Before R1 the recorded question also recomputed the catalog digest, which no
strict relation implies; that was the stop. Shown by:

| Evidence | Result |
| --- | --- |
| lane 23: every lock (18: recorded, resealed, the three register variants, the seven tampers, the undetected alteration, the toolchain row alone and its two empty-graph forms, a stale lock digest, the forged catalog digest), every verified artifact (16) and every graph the lanes construct | strict accepts four locks and two verified artifacts, asserted exactly; the recorded question accepts each |
| lane 24: the D2 store's lock, its two register variants and its verified products | strict-accepted ones are recorded-accepted |
| probe rerun (16.5): the forged catalog digest | strict and recorded both accept; the door admits it; the store folds after a cold reopen on the final build and on base, the same digest |
| the 186 recorded locks and 144 graphs (16.4) | both questions accept each under the unchanged register |

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

The build rulings C1 to C5, as the earlier build realized them. The final
rulings at the top supersede them where they differ: R1 removes C1's catalog
recompute, R6 removes the `prepareRead` default, and the stop in C4's row is
resolved by R1.

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
| `T/design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md` | "Recorded and strict Product truth" (new) | the two questions; the overloads (the one-argument form is today's guard) and the one body per guard; no default question (R6); the relations both questions check; the graph relations; the recorded identity relation, row membership with no catalog recompute, what it does not detect and where that is refused (R1); "Everything the strict question accepts, the recorded question accepts" with the four implications (R2); the entry and question table; the read-copy bindings and refusals; the retention of recorded Catalogs apart from `readyCatalogs`; release qualification's composition and its second Catalog admission (R4); the run read's capability (R7); the fold's `release.snapshot` branch (R5); "Reading is not running" |
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
| `isVerifiedProductArtifact` (`product/verify_product.ts:729`) | `(value, question)` `:735` | `verifiedProductArtifactHolds` `:777` | the carrier's keys and fields; contribution manifest and its digest; the graph under the same question; contract rows; definition coordinate map; checked payload files; native declaration evidence; every owner coordinate of the graph is one of the carrier's own flat contract or definition-slot coordinates; graph asset media type, schema version and digest; manifest graph coordinate; declared and public capability rosters equal the graph's ids; verification digest and ref | the graph equals the register's construction over the carrier's own coordinates; each contract's identities equal `capabilityRefsForContract`; the asset bytes through `capabilityDefinitionGraphAssetBytes` | `recordedCapabilityIdentitiesHold`; the asset bytes through `serializeCapabilityDefinitionGraph` |

`recordedCapabilityIdentitiesHold` (`product/verify_product.ts:759`) is the
one recorded identity relation for a lock row and a verified artifact: every
identity names a row of the carrier's own graph, so a carrier with an empty
graph carries no identity (R1). It does not recompute the catalog digest. The
catalog relations both questions check are the strict guard's: the row's
catalog id and digest equal its contribution manifest's, and every flat owner
coordinate carries the carrier's catalog id and digest. The lock digest, or
the verification digest, recomputes over the carrier. The recorded question
therefore does not detect identities altered among the rows of the carrier's
graph with every digest recomputed (lane 13); a door refuses such a value with
the strict question and a read copy by its binding (section 13).

Strict is today's guard. On the lock guard the graph relations and the
`InResolvedLock` forms after the lock check are implied by the strict checks;
on the verified guard the owner-coordinate membership is implied by equality
with the construction over those coordinates. Every strict relation implies
the recorded relation in its place (the table "Strict implies recorded" at
the top).

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
| the empty graph: no definition slot and no flat contract the register maps to a capability | `:247-265` | no: reads the register | yes against this reader's register (strict holds on 144 of 144), not kept | the strict question only, through equality with the construction (`:450-459`); `recordedCapabilityIdentitiesHold` gives an empty graph no identity, since an identity must name a row |

On every distinct recorded graph (144: 143 non-empty and the empty one,
in the 186 distinct recorded locks of the 414 logs of section 3.3, decoded
or not), both questions hold
(`/private/tmp/abg-td77-work/c1/check-r1.json`, section 16.4).

## 12. Who asks which question

Line numbers at the final commit, under `T/code/src`. "Exported" means the
call uses the exported signature, which asks the strict question.

| Entry | Call | Question | Why |
| --- | --- | --- | --- |
| the fold: `projectArtifactTruth` → `RuntimeArtifactFacts.advance` | `abg/artifact_truth.ts:315` `this.prepare(row, "recorded")`; the guard at `:412` | recorded | a recorded install admission's inline lock |
| the admission candidate: `prepareArtifactTruthCandidate` | `abg/artifact_truth.ts:723` `…, "strict", establishedLock)` | strict | the lock is about to be appended. The module-level `admitArtifact` reaches the candidate through `abg/environment_admission.ts:1090`, so it no longer appends a lock that fails the strict question: the candidate throws and the door returns `artifact_truth_conflict`, which `t289-install-event-bodies` asserts unchanged |
| the doors: `product.install`, `workspace.bind`, `catalog.admit`, `product.verify`, install request, installed verification | `install_definition_bindings.ts:142-143`, `environment_definition_bindings.ts:203`, `:533-538`, `catalog_definition_bindings.ts:289-296`, `verification_definition_bindings.ts:122`, `:301`, `environment.ts:445`, `:835`, `install_product.ts:156`, `:317`, `verify_product.ts:153`, `:2522` | strict (exported) | new values and the reader's own verification |
| Catalog admission for new work | `execution_resolution.ts:461` (run), `catalog_operations.ts:299`, `declaration_application.ts:136` | strict (exported `admitGraphFunctionCatalog`) | new work |
| `admitGraphFunctionCatalog` itself | `product/catalog.ts:450` (exported), `:460` (`@internal`, question), `:464`; lock `:490`, verified products `:501`; retention `:469`, `:729` | from its caller | C2 |
| `reconstructHistoricalDeclarationCatalog` | `product/declaration_closure.ts:46` (exported), `:58` (`@internal`), `:67`; passes the question to the Catalog at `:76-79` | from its caller | C2 |
| the read owner's run reads: `prepareRunRead`, `prepareRunReadAtDurablePrefix`, `projectRunTruthAtDurablePrefix`, `project` behind `GraphCallProjectionPort` and the other exported ports | `abg/project_read_ports.ts:968`, `:1044`, `:1868`; `prepareRead` (`:696`) has no default and throws on any other value (`:704`, R6) | recorded | the proof is bound to recorded history (section 13) |
| the read owner's terminal declaration | `abg/project_read_ports.ts:386-389` `reconstructHistoricalDeclarationCatalog(proof, {…}, prepared.question)` | the entry's | section 13 |
| historical GraphCall source (`projectHistoricalGraphCallSourceAtDurablePrefix`) | `abg/project_read_ports.ts:592-593` | strict | the source is input to a new run |
| closed GraphCall terminal (`projectClosedGraphCallTerminalAtDurablePrefix`) | `abg/project_read_ports.ts:623-625` | strict | its callers continue work: `worksite_command_forward`, `native_work_reacquisition` |
| worksite forward, governance coverage | `abg/worksite_command_forward.ts:103`; `abg/invocation_execution_truth.ts:126` (a historical C-call result used as the governed source of a new invocation) | strict (exported) | both feed new work |
| release qualification | `abg/qualification_proof.ts:214` | strict (exported) | qualification is admitted work. Its later `GraphCallProjectionPort` read asks recorded; since strict implies recorded, a proof it reconstructs also passes the read (R4, residual 22.2) |
| the fold's `release.snapshot` branch | `abg/artifact_truth.ts:496-504` → `isReleaseOperationArtifact` → release qualification → `abg/qualification_proof.ts:214` | strict (exported), through release qualification | R5 not realized (residual 22.4) |
| conformance evaluation | `validator/conformance_definition_bindings.ts:271` (`projectAdmittedWorkspaceBindingByInvocationRef`), `:294` (`reconstructDeclarationBasis`) | strict (exported) | conformance evaluation is admitted work |
| `project.read#workspace_status` | `product/project_read_definition_bindings.ts:719` `WorkspaceProjectionPort.status(packet, "recorded")` → `product/project_read_ports.ts:637`, lock at `:673` | recorded | section 13 |
| `project.read#ticket_consensus` | `product/project_read_definition_bindings.ts:264-269` `projectAdmittedWorkspaceBindingByInvocationRef(…, lock, "recorded")` → `abg/environment_admission.ts:396-413` | recorded | the lock is the recorded install lock of the same artifact truth |
| run-read authority | `abg/project_read_definition_bindings.ts:631-638` `constructCapabilityGrant(…, "recorded")`; `:822-829` `validateCapabilityGrantForProductBasis(…, "recorded")` → `product/invocation.ts:863-889`, `:1064-1088` → `selectedCapabilityOwner` `:736`, graph `:756` | recorded | the installs are the recorded installs of the source binding |
| run continuation, admission and invocation grants | `owner_bindings/run_invocation.ts:1537`, `:1603`, `:1694`, `:1813`; `product/run_invocation_operation.ts:358`; `abg/invocation_admission.ts:788`; `product/invocation.ts:943`, `:1118` | strict (exported or explicit) | new work |
| `product.verify`'s own graph and identity checks, `capabilityDefinitionGraphCoordinate`, `capabilityDefinitionGraphAssetBytes` | `verify_product.ts:2522`; `shared/capability_contracts.ts:588`, `:601` | strict (exported) | the reader's own construction |
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

Under R1 these bindings are what refuse a read copy whose identities are
altered among the rows of its graph with every digest recomputed, which the
recorded question accepts. Asserted: the run read refuses the altered D2 lock
(both with its catalog digest recomputed and with the recorded one) by
binding (1), `invalid_history`; a verified product altered among its rows
with its lock row unchanged is refused at the recorded re-admission
(`verified_product_mismatch`, the verified set no longer matches the lock
rows) and the read is `invalid_history` (lane 24); `workspace_status`
refuses the altered lock with `not_ready` (lane 19). At a door, the strict
question refuses it: `admitProductInstall` returns `scope_mismatch` and
appends nothing (lane 17); the run door `binding_lock_mismatch` (lane 18).

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
| contracts and identities | the contract rows and the verification digest over the carrier; `recordedCapabilityIdentitiesHold` (every identity names a row of the carrier's graph; no catalog recompute, R1) |
| definition coordinates | every owner coordinate of the graph is one of the carrier's own flat contract or definition-slot coordinates (`product/verify_product.ts`, both questions) |
| the carrier in a read | the Catalog's admitted verified set must match the lock rows (`admitGraphFunctionCatalog`); the Catalog's `basisDigest`, which covers the verified products, must equal the recorded root basis's `catalogBasisDigest` (section 13) |

The C3 stop does not hold: in a read the carrier is bound to recorded
history by its lock row and the root basis digest. Under R1 the recorded
question no longer recomputes the catalog digest, so a verified artifact
whose identities are altered among its graph's rows, with the verification
digest recomputed, answers the recorded question (lane 21); in a read the
Catalog re-admission refuses it with `verified_product_mismatch` when its
lock row is unchanged, and the read is `invalid_history` (lane 24). The lane `run read`
changes a verified product outside its lock row (`checkedPayloadFiles`),
reseals it, re-admits the Catalog under the recorded question and narrows
the View exactly; the read refuses with "historical Catalog/View differs from
the root basis" and `invalid_history`.

## 15. Lanes

`T/test_env/tests/t292-td77-recorded-product-truth.test.mjs`, 24 tests, 24
pass on the final build (51 s). The carrier is the first recorded install
lock of the tracked rc.10 fixture
`test_env/fixtures/t287-current-owner/native-assessment/events.jsonl.gz`
(one toolchain row and one consumer row with an empty graph). Every variant
and tamper reseals the changed parts with the owners' digest formulas, so
only the named relation can refuse it. Final run:
`/private/tmp/abg-td77-work/battery/final2/t292-td77-recorded-product-truth.tap`.

Under R1 the earlier tamper "identities changed with the catalog digest
stale" is no longer refused by the recorded question. It is restated as the
undetected alteration (lane 13) and carried through the door, the run door,
`workspace_status`, the verified carrier and the run read, each asserting
its refuser. The other seven tampers are refused by the recorded question as
before.

| # | Lane | Asserts |
| ---: | --- | --- |
| 1 | recorded lock | both questions accept the recorded lock and each graph; `recordedCapabilityIdentitiesHold` on each row; resealing an unchanged lock reproduces every recorded digest |
| 2-4 | variants (i), (ii), (iii) | (i) one identity added to a projected-only contract, (ii) one identity removed, (iii) one capability row removed with every identity and dependency naming it: the lock digest and catalog digest move; recorded accepts; strict refuses; a callback index refuses |
| 5-11 | 7 tampers | identities changed with the catalog recomputed and the graph coordinates stale; an identity naming no row; a graph row changed without its digest; a row digest without the graph digest; a dependency naming no row; a dependency cycle; a row dropped while a contract names it: both questions refuse |
| 12 | tamper relations | each tamper is refused by its named relation: the identity relation for two, the flat coordinates for one, the graph relations for four |
| 13 | R1, the undetected alteration | one identity added among the graph's rows, the catalog digest left as recorded and every digest that carries it consistent: the catalog digest is the recorded one and does not recompute from the altered contracts; the lock digest moves; recorded accepts; strict refuses |
| 14 | empty graph | the toolchain row alone is a lock (both questions); with its graph emptied and no identity, recorded accepts and strict refuses (the register maps its contracts to capabilities); with one identity, both refuse |
| 15 | stale lock digest | refused by recorded; resealed, accepted |
| 16 | fold | one recorded install event re-sealed with each lock (payload digest and event id recomputed): artifact truth projects each variant, the undetected alteration and the forged catalog digest; each tamper throws "Product install inline body requires one resolved lock and no body cause", as at base |
| 17 | door | `admitProductInstall` into a new empty store: the recorded lock and the forged catalog digest are admitted (`artifact_owner_result`), one event appended, and a cold fold of the appended bytes projects the lock; the undetected alteration and each variant are refused before append (`artifact_owner_refusal`, `scope_mismatch`, 0 appended) |
| 18 | run door | each variant and the undetected alteration: the Catalog stage returns `binding_lock_mismatch` and execution resolution `incompatible_or_unproven`; the recorded lock passes the lock check (`verified_product_mismatch` on the empty verified set) |
| 19 | workspace_status | the recorded lock projects the same status under both questions; each variant and the undetected alteration is `not_ready` under the recorded question |
| 20 | verified artifact, copy | the reader's own verification of this tenant, copied: both questions accept; resealing reproduces every digest |
| 21 | verified artifact, variants | each variant and the undetected alteration: recorded accepts, strict refuses; the forged catalog digest: both accept |
| 22 | verified artifact, tampers | each of the 7 tampers, an empty graph with an identity and a stale verification digest: recorded refuses; an empty graph with no identity: recorded accepts |
| 23 | strict implies recorded (R2) | over 18 locks (the recorded lock, the resealed lock, the toolchain row alone and its two empty-graph forms, a stale lock digest, the forged catalog digest, the three variants, the undetected alteration and the seven tampers) and 16 verified artifacts (the copy, the empty-graph forms, a stale verification digest, the forged catalog digest, the variants, the undetected alteration and the tampers), and every graph of each: whenever strict accepts, recorded accepts. The strict-accepted set is asserted exactly: four locks (the recorded lock, the resealed lock, the toolchain row alone, the forged catalog digest) and two verified artifacts (the copy, the forged catalog digest) |
| 24 | run read | the D2 store (evidence root): the recorded proof projects on the Public read and on the port; the D2 lock altered among its rows, with the catalog digest recomputed and with it as recorded (recorded accepts, strict refuses), is refused by binding (1) with `invalid_history`; a verified product altered among its rows with its lock row unchanged (recorded accepts, strict refuses) is refused at the recorded re-admission (`verified_product_mismatch`) and the read is `invalid_history`; strict implies recorded on the D2 lock and each verified product; a verified product changed outside its lock row is refused by binding (2) with `invalid_history` |

Run-door comparison on the base build and this build, the same three
variants with the same digests (`/private/tmp/abg-td77-work/lanes/run-door-compare.mjs`;
outputs `run-door-base-root.json` and `run-door-abg-td77.json`, byte-identical):
each variant `binding_lock_mismatch` at the Catalog stage,
`incompatible_or_unproven` at execution resolution, and `not_ready` from
`workspace_status` under the strict question. C4 holds on this door. That
comparison was taken at `939e3e74c`; R1 and R6 change no strict path, and
lane 18 on the final build asserts the same codes for the variants and for
the undetected alteration.

## 16. Evidence at scale

### 16.1 The two register changes

| Change | Form | Builds |
| --- | --- | --- |
| simulated withdrawal of `abg.operation.interaction.respond` | TD-25M's form: in the built `shared/capability_contracts.js`, `capabilityRefsForContract` returns `[]` for that contract when `globalThis.__TD25M_EXPERIMENT__` is set (preload `/private/tmp/abg-td25m-work/scripts/sim-preload.mjs` for the lanes; the probe sets the flag per mode) | `/private/tmp/abg-td77-work/sim-r1` (the final build) and `sim-base` (`c1f655735`) |
| real register edit | `shared/capability_contracts.ts:82`: `abg.schema.consensus-subject` removed from the `projectedPublicContractIds` of `abg.capability.catalog.invoke-graph-function@5`; the module loads (the roster is unchanged), and the build regenerates the reader's catalog (`catalogDigest` `sha256:4f8627d7…` instead of `sha256:8c5f262f…`) | `sim2-r1`, `sim2-base`, each rebuilt with `npm run build` |

`sim-r1` and `sim2-r1` are copies of the final tree: `diff -r` over
`code/src` and `test_env/tests` against the worktree is empty for `sim-r1`
and names only line 82 of `shared/capability_contracts.ts` for `sim2-r1`.
The base rows below are the earlier runs on `sim-base` and `sim2-base`; base
is unchanged.

### 16.2 Artifact truth over 121 stores

The 118 logs that project on base, the two tracked fixtures and the live
rc.12 store (`/private/tmp/abg-td77-work/logs121.txt`, 0.95 GB). Each probe
decodes each log afresh, selects the whole prefix and projects artifact truth
(`/private/tmp/abg-td77-work/scripts/scale-probe.mjs`; final outputs
`/private/tmp/abg-td77-work/scale-r1/*.jsonl`, the base outputs copied from
the earlier `scale/`; comparison `/private/tmp/abg-td77-work/scale-r1/compare.py`).
The digest is `sha256Canonical` of the projection.

| Build and register | Project | Digest equal to base, unchanged register | Refused |
| --- | ---: | ---: | --- |
| base, unchanged | 121 | 121 | 0 |
| final build, unchanged | 121 | 121 | 0 |
| final build, simulated withdrawal | 121 | 121 | 0 |
| base, simulated withdrawal | 0 | 0 | 121: 76 "Product install inline body requires one resolved lock and no body cause", 45 "Product install artifact truth requires one complete candidate and resolved lock" |
| final build, register edit | 121 | 121 | 0 |
| base, register edit | 0 | 0 | 121, the same two messages, 76 and 45 |

The second stop condition does not hold: every store that projects on base
projects on the final build with the unchanged register, with the same
digest.

None of the 121 stores holds a `release.snapshot` or `product.materialize`
artifact admission (only `product.install` and `workspace.bind`, 121 each),
so the fold branch of residual 22.4 is not reached.

### 16.3 The three lanes on the changed copies

Per case, `ok` or `not ok`. "Unchanged" is the final build's own run of the
lane with the unchanged register (section 17). The final-build columns ran on
`sim-r1` (withdrawal, preload on) and `sim2-r1` (register edit), one file at a
time (`/private/tmp/abg-td77-work/simlanes/run.sh`; outputs
`simlanes/sim-r1-on-*.tap`, `simlanes/sim2-r1-off-*.tap`; table by
`simlanes/table163.py`, output `simlanes/table163-r1.txt`). The base columns
are the earlier runs on `sim-base` and `sim2-base`.

| Lane, case | Unchanged | Final, withdrawal | Final, edit | Base, withdrawal | Base, edit |
| --- | --- | --- | --- | --- | --- |
| `r10-child-proof` 1: actual child selects a different output contract from the admitted root without root or View substit | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 2: missing, foreign, stale View and equal-URI changed declaration proofs refuse from a real positive ba | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 3: native root/child ancestry and basis coordinates cannot be supplied across an invocation | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 4: future environment admission refuses even if a supplied projection otherwise looks equal (explicit e | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 5: held-parent summary does not erase a genuinely closed child or close its Run (held status is an expl | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 6: same child remains authentic after actual root completion at prefix831; no current active-parent req | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 7: one exact contract selector refuses competing same-valued owners inside the resolved closure | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 8: fresh-process child projection reads only the retained log once proof is supplied; no current worksp | ok | ok | ok | file fails at load | file fails at load |
| `r10-child-proof` 9: conformance keeps the complete artifact-truth, inventory and Program joins around the shared verifie | ok | not ok | not ok | file fails at load | file fails at load |
| `r10-child-proof` 10: the retained native log and proof bytes remain unchanged | ok | ok | ok | file fails at load | file fails at load |
| `t287-historical-source-resource` 1: actual R10 ancestry, declaration and leaf proof owners return borrowed historical facts; same live r | ok | not ok | not ok | not ok | not ok |
| `t287-historical-source-resource` 2: Run resource schema admits the one declaration dependency and refuses extra authority before owner e | ok | ok | ok | ok | ok |
| `t287-historical-source-resource` 3: a later prefix of the same derivation generation lends the same retained historical source; the coun | ok | not ok | not ok | not ok | not ok |
| `t287-historical-source-resource` 4: an append rollback replaces the derivation generation and drops the retained historical source; the  | ok | not ok | not ok | not ok | not ok |
| `t287-cross-cut-public-read` 1: different-cut native Definition reads keep blocked absence and exact historical child result/replay | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 2: current catalog and historical source permission refuse independently | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 3: historical source digest and child declaration evidence remain necessary | ok | ok | ok | not ok | not ok |
| `t287-cross-cut-public-read` 4: Product metadata projection refuses incoherent catalog and missing or duplicate operation rows | ok | ok | ok | ok | ok |
| `t287-cross-cut-public-read` 5: late child proof preserves only the exact acquired prefix; copies and closed owners reconstruct, cha | ok | ok | ok | not ok | not ok |

On base, both changes refuse the reads themselves: `r10-child-proof` fails
at load ("historical environment is absent" from `terminalDeclaration`);
`t287-historical-source-resource` fails in its fixture, whose
`graph_call_result` read returns no value; `t287-cross-cut-public-read`
cases 1, 2, 3 and 5 fail where the exact-prefix workspace environment is
refused. On the final build every read projects. The final build differs
from the unchanged register on exactly the four cases R3 names, under both
changes, and on no other case: `r10-child-proof` case 9 (conformance
evaluation, "declaration Catalog differs from its exact admitted workspace,
installs or lock") and `t287-historical-source-resource` cases 1, 3 and 4
(`historicalGraphCallSource()`, the leaf invocation port's source for a
running C-call, returns null after the fixture's recorded read succeeded).
These depend on the reader's register equalling the retained store's
(residual 22.1). The outcomes are the same as on the earlier build.

### 16.4 C1 over every recorded lock

`/private/tmp/abg-td77-work/c1/check-locks.mjs` applies both questions to
the 186 distinct recorded locks (every inline lock of a `product.install`
admission in the 414 logs of section 3.3) and to each distinct graph.

| Build | Locks, recorded | Locks, strict | Graphs (144), recorded | Graphs, strict |
| --- | ---: | ---: | ---: | ---: |
| final build (`check-r1.json`) | 186 | 186 | 144 | 144 |
| final build with the register edit, `sim2-r1` (`check-r1-register-edit.json`) | 186 | 0 | 144 | 144 |

The register edit changes identities, not the graph, so every graph stays
strict and every lock with a toolchain row fails the strict identity check.
The recorded question accepts every recorded lock under both registers. On
the unchanged register no recorded lock is accepted by one question and
refused by the other. (The earlier build's `check-final2.json` and
`check-register-edit.json` gave the same counts with the catalog recompute:
every recorded lock's catalog digest recomputes.)

### 16.5 Probe: a door and the lock that stopped the earlier build

`/private/tmp/abg-td77-work/probe-forged/probe2.mjs` (scratch, not a lane;
`probe.mjs` with two outputs added: the artifact-truth digest of the cold
fold and the sha256 of the appended bytes). It takes the first recorded
install lock of the rc.10 native-assessment fixture, sets the toolchain row's
`catalogDigest` to another sha256, carries it into every owner coordinate of
the graph and the contribution manifest, and reseals the row digests, graph
digest, graph asset digest, contribution manifest digest and lock digest
(resealing the unchanged lock reproduces it). It then admits an install of
that lock through `admitProductInstall` (`abg/environment_admission.ts:1144`)
into a new empty store, folds the store in process, and folds it cold from
the appended bytes. Run on the final build (the worktree,
`final2.json`) and on base (`base-root`, `base2.json`); the two outputs are
byte-identical.

| | Final build | Base |
| --- | --- | --- |
| forged lock, strict | accepted | accepted |
| forged lock, recorded | accepted | base has one question (the probe's second argument is ignored; strict) |
| forged catalog digest recomputes from the row's contracts | no | no |
| `admitProductInstall` | `artifact_owner_result`, one event appended | the same |
| fold in process | projects, one artifact, the lock digest equal | the same |
| fold cold from the appended bytes | projects, one artifact | the same |
| cold artifact-truth digest | `sha256:5817155d5e1a558187951cc977e8ae28b2b946e03bfc9f437345ea54053bf80e` | the same |
| appended bytes | `sha256:a62e975a19608bd1473e7f90212ee6a21cd6b3af5988215c85480195fca6be75` | the same |
| control: the recorded lock, same steps | admitted; both folds project; cold digest `sha256:72d4a610eb2c2adb7b46d9e74bb618d5e6ab0dd0f41b394dcdf292f3f06df439`, bytes `sha256:3c95603cbdc72b7eb9415b7f2809b5747af4b0a7a6984ab70e2b81ea9834e38c` | the same |

On the earlier build (`probe.mjs`, `final.json`) the cold fold of the forged
store threw "Product install inline body requires one resolved lock and no
body cause"; that was the stop. Lane 17 asserts the same door outcome and
the cold fold for the forged lock. The Public `product.install` operation
path (`install_definition_bindings.ts`, `install_product.ts`) was not probed:
it also compares the lock with a verified artifact and an installed root.

## 17. Lanes before and after

Each file alone, in the foreground order of the batch lists
`/private/tmp/abg-td77-work/battery/lists/{b1..b8,td36r,long}.txt` (the 64
files of `/private/tmp/abg-td77-work/battery/lanes.txt`), with
`--test-concurrency=1` and `ABI5_EVIDENCE_ROOT` set, on the final build (the
worktree, code at `af241b0f7`, lanes at `dc1adf775`). Every file was rerun on
the final build; none is carried over from the earlier build. The base results
are the earlier runs on `/private/tmp/abg-td77-work/base-root` (`c1f655735`);
base is unchanged, so they stay valid. The list is the original brief's lanes,
the three td36r lanes and every test file under `test_env/tests` that names a
changed guard or entry. The td36r lanes ran on a scratch copy of the final tree
with `test_env/fixtures/abi5-root-candidate-basis.json` refreshed by
`scripts/refresh-candidate-basis.mjs` (`/private/tmp/abg-td77-work/td36r-r1`;
not committed); on the unrefreshed tree they refuse at the fixture
(`artifact_digest_mismatch`), because the content digest moved. Outputs:
`/private/tmp/abg-td77-work/battery/{base,final2,td36r-final2}/*.tap`;
comparison `/private/tmp/abg-td77-work/battery/compare.py` (rows by
`battery/table17.py`, output `battery/table17-final2.txt`).

Totals: base 63 files, 387 tests, 355 pass, 0 fail, 32 skipped; final build
64 files, 411 tests, 379 pass, 0 fail, 32 skipped (the 24 more are the TD-77
lanes). Every case of the 63 shared files has the same outcome on both
builds; pass to fail: none. The 32 skips are the same cases on both. No case
timed out.

| File | Base tests/pass/fail/skip | Final build | Cases that differ | Base s | Final s |
| --- | --- | --- | --- | ---: | ---: |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | same | 117 | 112 |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | same | 329 | 322 |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | same | 596 | 587 |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | same | 1 | 0 |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | same | 0 | 1 |
| `t287-st2a-g-capability-definition-graph` | 4/4/0/0 | 4/4/0/0 | same | 33 | 32 |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | same | 29 | 29 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | same | 54 | 53 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | same | 38 | 38 |
| `r4-catalog-admission` | 8/8/0/0 | 8/8/0/0 | same | 1 | 1 |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 | same | 275 | 266 |
| `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | same | 83 | 83 |
| `t287-wave2-installed-product-verification` | 2/2/0/0 | 2/2/0/0 | same | 76 | 79 |
| `m5-event-store-reopen` | 27/27/0/0 | 27/27/0/0 | same | 61 | 62 |
| `t292-td36r-admitted-binding-owner` | 1/1/0/0 | 1/1/0/0 (refreshed copy) | same | 31 | 33 |
| `t292-td36r-bind-door-strings` | 6/6/0/0 | 6/6/0/0 (refreshed copy) | same | 33 | 34 |
| `t292-td36r-remaining-owners` | 6/6/0/0 | 6/6/0/0 (refreshed copy) | same | 1 | 1 |
| `m5-s06-prime` | 51/51/0/0 | 51/51/0/0 | same | 37 | 37 |
| `t287-interrupted-event-resource-recovery` | 8/8/0/0 | 8/8/0/0 | same | 5 | 4 |
| `t287-pfc-f08a-product-verification-boundary` | 1/1/0/0 | 1/1/0/0 | same | 7 | 7 |
| `t287-w2-05-generator-package-reproducibility` | 2/2/0/0 | 2/2/0/0 | same | 117 | 119 |
| `t287-w2-05-static-binding-algebra` | 4/3/0/1 | 4/3/0/1 | same | 1 | 1 |
| `t289-install-event-bodies` | 4/4/0/0 | 4/4/0/0 | same | 59 | 59 |
| `t292-binding-row-owner-differential` | 5/5/0/0 | 5/5/0/0 | same | 1 | 0 |
| `integration-shared-seams` | 2/2/0/0 | 2/2/0/0 | same | 2 | 2 |
| `m5-fresh-process-reconstruction` | 1/1/0/0 | 1/1/0/0 | same | 43 | 42 |
| `r10-projection-contracts` | 11/11/0/0 | 11/11/0/0 | same | 3 | 2 |
| `r5-invocation-admission` | 2/2/0/0 | 2/2/0/0 | same | 49 | 50 |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | same | 310 | 297 |
| `t287-conformance-owner-reuse` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-generic-job-intake` | 1/1/0/0 | 1/1/0/0 | same | 52 | 50 |
| `t287-generic-job-revision` | 2/1/0/1 | 2/1/0/1 | same | 1 | 1 |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | same | 7 | 7 |
| `t287-installed-product-coordinate` | 11/11/0/0 | 11/11/0/0 | same | 2 | 2 |
| `t287-malformed-gtl-gate` | 6/6/0/0 | 6/6/0/0 | same | 1 | 1 |
| `t287-management-supervision` | 5/5/0/0 | 5/5/0/0 | same | 158 | 155 |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 | same | 1 | 0 |
| `t287-owned-native-proof` | 1/0/0/1 | 1/0/0/1 | same | 0 | 1 |
| `t287-native-worksite-execution` | 6/4/0/2 | 6/4/0/2 | same | 1 | 0 |
| `t287-public-terminal-projection` | 3/0/0/3 | 3/0/0/3 | same | 0 | 1 |
| `t287-st1-installed-cross-owner-hello` | 3/3/0/0 | 3/3/0/0 | same | 131 | 131 |
| `t287-selected-action` | 1/0/0/1 | 1/0/0/1 | same | 1 | 0 |
| `t287-worksite-command-execution` | 12/12/0/0 | 12/12/0/0 | same | 177 | 171 |
| `m5-s03-authority` | 4/4/0/0 | 4/4/0/0 | same | 47 | 47 |
| `steel-consumer-declaration` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-declared-testing-capability` | 5/3/0/2 | 5/3/0/2 | same | 41 | 40 |
| `t287-continuation-causation` | 1/1/0/0 | 1/1/0/0 | same | 1 | 0 |
| `t287-post-binding-worksite-write` | 2/2/0/0 | 2/2/0/0 | same | 59 | 56 |
| `t287-recursive-registered-selection` | 7/6/0/1 | 7/6/0/1 | same | 80 | 83 |
| `t287-required-operation-bindings` | 10/10/0/0 | 10/10/0/0 | same | 204 | 207 |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 | same | 0 | 0 |
| `t287-held-prefix` | 5/0/0/5 | 5/0/0/5 | same | 0 | 0 |
| `t287-ordered-reconstruction` | 4/4/0/0 | 4/4/0/0 | same | 1 | 1 |
| `t287-readable-stops-foldback` | 5/5/0/0 | 5/5/0/0 | same | 76 | 77 |
| `t287-recursive-failure-foldback` | 8/8/0/0 | 8/8/0/0 | same | 108 | 113 |
| `t287-owned-call-reference` | 1/1/0/0 | 1/1/0/0 | same | 46 | 47 |
| `t287-native-work-reacquisition` | 8/7/0/1 | 8/7/0/1 | same | 1 | 1 |
| `t287-native-owner-reuse` | 2/0/0/2 | 2/0/0/2 | same | 0 | 0 |
| `t287-retained-installed-consumer` | 1/0/0/1 | 1/0/0/1 | same | 0 | 0 |
| `t287-single-address-space-consolidation` | 17/17/0/0 | 17/17/0/0 | same | 515 | 505 |
| `t292-td77-recorded-product-truth` | absent | 24/24/0/0 | new lane | | 51 |
| `t287-wave2-owner-contract-source-set` | 15/15/0/0 | 15/15/0/0 | same | 0 | 0 |

Build and lints on the final tree, after every run above, and on base:

| Check | Final build | Base |
| --- | --- | --- |
| `npm run build` (`tsc` and the manifest generator) | passes (29 s); the generated manifest and graph are byte-identical to the build the battery ran on | passes |
| `lint:imports` | passes: 30 shared modules import only shared and packages; 3 forbidden owner pairs hold | passes |
| `lint:lifecycle` | passes: 292 modules, 7 allow-listed sites, no offender | passes |
| `lint:calculus` | passes: 6 calculus modules, no offender | passes |
| `lint` with `test_env/qualification/recipe/verification-recipe.json` | 71 of 72 files pass (`r10-child-proof.test.mjs` among them); `test_env/uat/continuation.test.mjs` is absent from the tree | the same |
| `lint:evidence` | fails: `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` is absent from the worktree | the same |
| `node --check` on the TD-77 lane file (not in the recipe) and on `r10-child-proof.test.mjs` | passes | |

Logs: `/private/tmp/abg-td77-work/final2-build.log`,
`final2-lint:imports.log`, `final2-lint:lifecycle.log`,
`final2-lint:calculus.log`, `final2-lint-recipe.log`,
`final2-lint-evidence.log`.

## 18. Replay comparison

`/private/tmp/abg-td25r-work/scripts/replay-log.mjs` over TD-25M's 23 replay
logs, with the live store replaced by its copy
(`/private/tmp/abg-td77-work/replay-logs.txt`): whole-log replay digest,
FH facts and continuations, and per Run the Run replay (14 Runs). The base
output `replay/base.jsonl` and the final build's `replay/final2.jsonl` are
byte-identical (17,845 bytes, 23 lines; the earlier build's `final.jsonl` was
too). Two Runs carry the same replay
error on both ("replay requires zero or one exact run_stopped event";
"replay run_stopped event and run_terminal HoldsAt truth disagree"), as
recorded by TD-25R.

## 19. Identity digests

`/private/tmp/abg-td77-work/scripts/identity.mjs`, base build against the
final build (the worktree at `dc1adf775`, built from `af241b0f7`'s code):

| Value | Base `c1f655735` | Final build |
| --- | --- | --- |
| `productContentDigest` | `sha256:3e8bcd0e40399a9be74fa8ef1dde04afcc443e1c2846f392b439b6f31dec411a` | `sha256:b9d668f4bdfa04889419f60bd85725c469c9bccf46a332fcc104232fdc12ef46` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | the same |
| capability graph `graphDigest` | `sha256:7079ed7b04d89ac089d1d03cf4b679b02c18d79c5d041c3ed5b4abd833341fbb` | `sha256:582aab295561d79850fc5be923c0d8dd789432425f018f905a3828cd5ba23d57` |
| graph rows (16) apart from the content digest each coordinate carries | | equal |
| `publicContractCatalog` | | equal |
| `.d.ts` output (497 files under `build/`) | | byte-identical |

The first R6 build changed the exported `prepareRunReadAtDurablePrefix` doc
comment; the catalog digest moved to `sha256:f2f92292…`, because the `.d.ts`
output feeds the native locators and contract digests. The sentence now sits
on the `@internal` overload (deviation 6) and the digest is as at base.

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
| `code/src/abg/project_read_ports.ts` | 38 | 10 |
| `code/src/product/catalog.ts` | 27 | 6 |
| `code/src/product/declaration_closure.ts` | 27 | 1 |
| `code/src/product/environment.ts` | 53 | 13 |
| `code/src/product/invocation.ts` | 46 | 6 |
| `code/src/product/project_read_definition_bindings.ts` | 5 | 1 |
| `code/src/product/project_read_ports.ts` | 22 | 5 |
| `code/src/product/verify_product.ts` | 84 | 16 |
| `code/src/shared/capability_contracts.ts` | 157 | 5 |
| `design/README.md` | 1 | 1 |
| `design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md` | 154 | 0 |
| `design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md` | 6 | 2 |
| `test_env/tests/r10-child-proof.test.mjs` | 1 | 1 |
| `test_env/tests/t292-td77-recorded-product-truth.test.mjs` | 691 | 0 |
| total: code 495/69, design 161/3, lanes 692/1 | 1348 | 73 |

The final rulings' share (`git diff --numstat 2e549de27`): code 26/34 in
`abg/project_read_ports.ts` and `product/verify_product.ts`, design 73/23,
lanes 221/36. Generated files (`contracts/`, `product-toolchain-manifest.json`,
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
2. **`prepareRead`'s default was `"recorded"`; R6 removed it.** The
   parameter is now required and any value other than the two literals
   throws (`abg/project_read_ports.ts:696-705`).
3. **The earlier experiment copies were built from `48ab252d7`.** The final
   evidence at scale ran on `sim-r1` and `sim2-r1`, copies of the final
   source (16.1).
4. **The C1 relation check runs once per graph.** Each graph is checked with
   the whole relation (`capabilityGraphRelationsHold`); the lane
   `tamper relations` shows that each relation refuses on its own.
5. **The base battery has no TD-77 lane file**; its row reads "absent".
6. **R6's sentence sits on the `@internal` overload of
   `prepareRunReadAtDurablePrefix`, not on the exported signature's doc
   comment.** R6 says the exported entry "says so in its doc comment". The
   exported signature's comment is published `.d.ts` text, which feeds the
   native typed locators and the contract digests and so the catalog digest:
   adding the sentence there moved `catalogDigest` to `sha256:f2f92292…`
   (about 22 contract digests moved), against R8 and the brief's
   "`catalogDigest` unchanged". The sentence ("Both signatures ask the
   recorded question …") is on the internal overload directly below the
   exported one, at `abg/project_read_ports.ts:1005-1015`, and states why it
   sits there. The exported comment is unchanged. The design entry table
   says the same (`14e5779ab`; the design text is not in the packed payload,
   and a rebuild after it leaves the manifest and graph byte-identical). This
   departs from R6's wording to keep `catalogDigest` unchanged; for the
   Executive's acceptance.
7. **`r10-child-proof` names its question.** Its harness calls the private
   `prepareRead` (`test_env/tests/r10-child-proof.test.mjs:54`) without a
   question; with R6 the file threw at load. It now passes `"recorded"`,
   what the removed default gave it. Its 10 cases pass on the final build.
   R3 says no test change for its item; this edit is R6's, one argument on
   the harness line 54, and no case body changes (case 9 included). For the
   Executive's acceptance.

## 22. Residuals and items for the Executive

1. **Four lane cases depend on the reader's register equalling the retained
   store's (R3).** Under a changed register (the simulated withdrawal and
   the real edit) the final build refuses `r10-child-proof` case 9
   (conformance evaluation: `reconstructDeclarationBasis` refuses with
   "declaration Catalog differs from its exact admitted workspace, installs
   or lock") and `t287-historical-source-resource` cases 1, 3 and 4 (the
   historical GraphCall source, input to a new run, returns null); on the
   unchanged register they pass (16.3, section 17). These paths admit a
   Catalog for new work or judge a Program under the reader's own contracts
   and stay strict. For the Executive to carry to the package that first
   changes the register.
2. **Release qualification pays one more Catalog admission per proof
   (R4).** `abg/qualification_proof.ts:214` reconstructs the proof Catalog
   under the strict question, then reads the terminal through
   `GraphCallProjectionPort`, which re-admits it under the recorded
   question; the recorded admission does not hit the strict cache. Since
   strict implies recorded, a proof it reconstructs also passes the read.
3. **What the recorded question does not detect (R1).** Identities altered
   among the rows of a carrier's own graph, with every digest recomputed
   and the catalog digest left as recorded or recomputed, answer the
   recorded question. The fold therefore projects such a lock if one is
   recorded. Each of the 186 recorded locks answers the strict question, so
   none carries identities other than the reader's register gives. A door refuses it (`admitProductInstall`, `scope_mismatch`;
   the run door, `binding_lock_mismatch`), and each read copy refuses it by
   its binding (section 13). The earlier stop is gone: the forged catalog
   digest answers both questions and its store folds cold (16.5).
4. **The fold's `release.snapshot` branch asks the strict question; R5 is
   not realized. For ruling.** Exactly what the branch establishes and
   reads (`abg/artifact_truth.ts:496-504`):
   - `isReleaseOperationArtifact` (`implementation/release_publication.ts:143`)
     admits the snapshot's bound environment with `admitCapabilityEnvironment`
     (`:154`), which projects artifact truth at the entry prefix (the fold,
     recorded) and the workspace environment with the `...InResolvedLock`
     forms, which ask no guard again. Nothing to change here.
   - It reads the reader's own release operation contract twice:
     `admitExactDefinitionCall` (`:146`) admits the recorded invocation
     against `RELEASE_OPERATION_CONTRACTS.snapshot[memberKey]`, and the
     `capability_grants` slot must equal that contract's
     `metadata.capabilityRefs` (`:164`), which the register projects at
     module load (`product/release_snapshot_operations.ts:84`,
     `capabilityRefsForDefinition`). These are register reads for something
     other than a split guard; under R5 they are described and left.
   - `projectReleaseQualification` (`implementation/release_publication.ts:129`)
     and `projectReleaseAcceptance` (`:206`) reach `projectQualificationVerdict`
     (`abg/qualification_proof.ts:1062`) → `producerForResult` (`:535`) →
     `nativeState` (`:523`) → `graphOwner` (`:159`) → `deriveGraphOwner`
     (`:177`), which reconstructs the proof Catalog with the exported,
     strict `reconstructHistoricalDeclarationCatalog` (`:214`). So the branch
     establishes the proof's recorded environment lock and its verified
     products through the split guards, under the strict question. A second
     route reaches the same `graphOwner` through
     `projectExactCandidateQualification` (`:1031`) → `qualificationConsumerOwner`
     (`:307`).
   - The derivation it fills (`NativeProofDerivation`, `nativeFacts(prefix)`,
     `:109-123`) is keyed by prefix and not by question, and the release door
     (R4: as built) uses the same stack and the same derivation.

   Realizing R5 means passing the question from the fold through
   `projectReleaseQualification` and `projectReleaseAcceptance` to
   `deriveGraphOwner`, and keying the derivation by question so that a
   recorded reconstruction is never handed to the door. That changes the
   release-qualification stack R4 keeps as built. No store of the 121 and no
   lane holds a `release.snapshot` row (the release lanes use premises), so
   nothing would show the release door unchanged; the brief's third stop
   condition names that case. Consequence of leaving it: under a changed
   register a store holding a `release.snapshot` admission can still refuse
   artifact truth, as on base, at the strict reconstruction or at the
   `capability_grants` comparison. The Executive rules whether to carry the
   question through release qualification in this package or a later one.
5. **The run-read grant looks up the reader's capability refs (stands,
   R7).** `expectedRunReadAuthority` constructs grants for the reader's
   `project.read` `metadata.capabilityRefs` and selects their owner in the
   recorded graphs. A recorded graph without exactly one owner of that
   capability refuses the read: grant construction throws inside the
   run-read kernel (`abg/project_read_definition_bindings.ts:794`). The
   design text now says so. Not exercised by a lane.
6. **The verified-artifact guard does not compare the contribution
   manifest's catalog id and digest with the carrier's,** as at base. The
   lock guard does (stands, R7).
7. **`catalog_list` and `catalog_describe` stay strict**: they admit a
   supplied Catalog through `CatalogOperationPort.admit`. Under a changed
   register they refuse (stands, R7).
8. **`prepareRunReadAtDurablePrefix` is exported and asks recorded**
   (stands, R7; R6 keeps it). It is the Public run read's preparation; a
   caller that uses its projection to start work would need the strict
   question. The sentence saying so is on its internal overload
   (deviation 6).
9. **`productContentDigest` moves with the code (R8).** The tracked fixture
   `test_env/fixtures/abi5-root-candidate-basis.json` must be refreshed and
   the identity regenerated when the branch merges; the td36r lanes ran on a
   scratch copy with it refreshed (`td36r-r1`, section 17).

## 23. What an independent reviewer should try to break

- A value that the strict question accepts and the recorded question
  refuses (R2): the table "Strict implies recorded" argues each pair; lane
  23 checks 18 locks and 16 verified artifacts. Look for a strict relation
  that reads the register and is not in that table, or a recorded relation
  in the shared body that the strict path skips.
- A lock or verified artifact that the recorded question accepts and that is
  not internally established, beyond the alteration R1 leaves undetected
  (identities moved among the graph's rows): change any recorded part,
  reseal only some of the digests, and show the recorded question accepts
  it. The lanes' reseal helpers (`resealCarrier`, `resealLock`,
  `resealVerified`) list the order.
- A read copy that accepts the undetected alteration: a supplied value whose
  identities are altered among its rows, every digest recomputed, that a
  read bound to recorded history projects instead of refusing (section 13;
  lanes 19 and 24 cover `workspace_status` and the run read).
- A constructor relation statable over the graph alone that
  `capabilityGraphRelationsHold` does not check (table 11.2).
- An entry that asks the wrong question: a path that starts or continues
  work and reaches a recorded question, or a read bound to recorded history
  that still asks strict. Table 12 lists each; `grep -n '"recorded"'` over
  `code/src` lists every recorded entry.
- A callback or spread call that passes a second argument equal to
  `"recorded"` by accident, and a call of `prepareRead` (or any other
  entry that takes the question) that relies on a default (R6: there is
  none; `prepareRead` throws).
- The module-level `admitArtifact` appending a lock that fails strict (the
  candidate at `abg/environment_admission.ts:1090` is strict).
- A door that appends a lock the fold then refuses on a cold reopen (16.5
  and lane 17 have the probe for the forged catalog digest).
- The fold's `release.snapshot` branch still asks the strict question at
  `abg/qualification_proof.ts:214` (residual 22.4): a store with a release
  row whose proof Catalog no longer reconstructs under the reader's
  register. Also whether `nativeFacts(prefix)` can hand a value derived
  under one question to an entry that asks the other.
- A read copy whose binding does not refuse a recorded-accepted value that is
  not the recorded one (section 13): for the run read, a supplied proof
  whose Catalog is re-admitted under recorded with a lock or verified set the
  store did not record.
- The recorded Catalog retention: a recorded admission entering
  `ownedCatalogs` or `readyCatalogs`, so a later strict admission reuses it
  (`product/catalog.ts:469`, `:729`).
- The evidence at scale with a third register change, for example a
  capability row removed from the register.
- Residual 22.1: a case beyond the four of R3 whose outcome depends on the
  reader's register equalling the retained store's.
- The exported `.d.ts` text: R6's sentence sits on the internal overload so
  that the catalog digest does not move (deviation 6); check that no other
  exported comment changed (497 `.d.ts` files byte-identical to base).
