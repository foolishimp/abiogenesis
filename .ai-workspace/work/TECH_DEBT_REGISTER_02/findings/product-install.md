# Findings: product-install

Commentary, not law. Area reviewer, read-only, 2026-11-12. Repository `main` at
`002035b8a`. Nothing was run, built or measured here. Costs are marked as
measured (with the record cited) or structural (established by reading).

## Labels used here

- **T** is `build_tenants/abiogenesis/typescript`. **P** is `T/code/src/product`.
  Paths without a prefix are under P.
- An **owned guard** is a `WeakMap` or `WeakSet` that holds values a module
  produced itself, so its validator can skip the full check for those values.
  `ownedProductVerifications` (`verify_product.ts:124`) is the existing example.
- **F_D, F_P, F_H** are the deterministic, probabilistic and human-interaction
  compute regimes.
- **O3** is the RC9 install-verification reuse optimisation. RC9 author-02
  withdrew it because "no valid reuse lifetime is resolved" (review
  `comments/claude/20261109T011141Z_REVIEW_RC9_OWNER_HELD_FOLDS`).
- **The P5 ruling** is the register's closure of NW-PRODUCT-VERIFICATION-REUSE-01:
  "one verification per artifact; per-operation checks kept (P5 ruling)".
- **C-17** is the T-290 Phase C package `c2f1cfa3d`. It retired the
  carried-memory F_H resume chain.
- **Consensus One Surface** is the standalone Consensus system program. Today it
  realizes the One Surface feature (`A5-F07`, REQ-P-POLICY-023). Its Product
  semantics provider is `ABI5_SYSTEM_PRODUCT_SEMANTICS`.
- **S06** is the M5 step label carried in names such as
  `bindS06PublicFunctionCatalog`.
- **Qualification mirrors.** Any source edit under T changes the package
  inventory and requires a refresh of `T/test_env/qualification/inventory.json`
  and `recipe/verification-recipe.json`. That holds for every entry below, so no
  Risk line repeats it.
- **Generated native contract digests.** The manifest generator computes each
  native contract digest as `sha256Canonical(declarationInventory)` over the
  exported `.d.ts` closure (`T/scripts/generate-product-manifest.mjs:610-614`).
  An entry that changes an exported type, union or signature therefore changes
  those digests in the regenerated manifest of the next build. Examples are
  K-A, K-B, SO-D, the unused `<T>`, and deleting an exported declaration.
  "Risk: none" below means no change to Public contract shape or to recorded-Run
  replay, beyond that regeneration.

## Most valuable entries

1. **PERF-A.** Hash, parse and coordinate each fact once inside verification,
   and add an owned guard for the lock. Bytes do not change.
2. **SO-A.** The workspace-binding identity rule is computed in seven places.
   `environment.ts` should own it.
3. **ST-A.** The operation-family layer: five Port interfaces nothing types
   against, five export names that mean two different values, and a packet
   layer the resolve binding bypasses. Materialization's tables are the model.
4. **E2.** Consensus residue. The `run_result` read is hard-wired to the
   Consensus provider. The prepared retirement branch leaves the projection
   roster helpers behind. Blocked on a product_reprice.
5. **E1.** The STDO environment specialisation is superseded by the generic run
   environment, in product, abg and gtl.

---

## Check 7: Performance

### PERF-A: one owner per fact inside one verification and over owned values

- Category: performance
- Evidence (structural, read). Each verification reads, hashes or parses the
  same fact more than once.
  - Archive members are copied. `readArchiveMembers` (`verify_product.ts:1913`)
    copies every member out of the gunzipped archive with
    `Buffer.from(archive.subarray(...))`, so the archive and its copies are
    both live.
  - Payload files and assets are hashed more than once. `verifyProduct`
    (`verify_product.ts:2011`, 606 lines) hashes every payload file for the
    inventory (2134, 2173). It hashes contract assets again for each contract
    (2206, 2216), and `assetDefinitionExists` parses the asset's JSON once per
    contract (2216). `bindDefinitionContractCoordinates` (1493, 312 lines)
    hashes again at 1531 and 1658.
  - Each `.d.ts` source is decoded twice and hashed again in one verification.
    `resolveNativeDeclarationClosures` decodes it at `declaration_exports.ts:1507`.
    `verifyProduct` decodes it again at `verify_product.ts:2372`, and hashes it a
    second time at 2371 after the inventory hash. The decode at 2238 is of
    `package.json` metadata, not declarations.
  - `resolveNativeDeclarationClosures` (`declaration_exports.ts:1485`, 394 lines)
    repeats work per source and per root:
    - `ts.preProcessFile` runs per source at 1541 and 1695, and again per root
      at 1772.
    - Each source is parsed by `createSourceFile` (1713) and parsed again by
      the compiler host inside `createProgram` (1733).
    - Each root is hashed twice (1805, 1835).
  - At environment resolution, `linkNativeContractSet` (2068) builds a second
    full TypeScript program over the same sources (2530).
  - `sourceText` is re-hashed in two more places. `nativeProductApplicability`
    re-hashes every `sourceText` (2026). `isNativeDeclarationEvidence`
    (`verify_product.ts:331`, 396 lines) re-hashes every `sourceText` (437, 453)
    on every `isVerifiedProductArtifact` call that misses the owned guard.
  - `productVerificationCoordinates` (`verify_product.ts:229`) canonicalizes and
    hashes three bodies on every call.
    - One body embeds the whole `nativeDeclarationEvidence` (270). Its size is
      measured: 11 MB in M_RETURN, and 9.58 MB over 325 files in the RC6 review's
      finding F7.
    - Another body embeds `checkedPayloadFiles` (299).
    - It has seven call sites, and no result is kept:
      - `catalog_definition_bindings.ts:344, 435, 511, 546`;
      - `install_definition_bindings.ts:156`;
      - `verification_operation.ts:58`;
      - `environment_definition_bindings.ts:151`. This site keeps only
        `.verifiedArtifact`, which is `{verificationRef, verificationDigest}`
        and can be read straight off the artifact.
  - `isResolvedProductLock` (`environment.ts:543`, 217 lines) fully re-validates
    and re-hashes the lock on every call (7 call sites in P). It has no owned
    guard, unlike verified artifacts and catalogs.
- Retire. Consolidate each fact into one owner:
  - **File digests.** `verifyProduct` computes one digest map per file and
    passes it to the inventory, asset and contract-coordinate checks. Each asset
    is parsed once and each source decoded once.
  - **Sources.** `resolveNativeDeclarationClosures` pre-processes and parses
    each source once, and serves the parsed `SourceFile` objects to the compiler
    host.
  - **Coordinates.** The verifier computes `productVerificationCoordinates` when
    it mints the artifact and stores them beside the owned entry. Owned callers
    read the stored value; copied or foreign values recompute it.
    `environment_definition_bindings.ts:151` reads the two fields directly.
  - **Lock.** `environment.ts` gets an owned guard for locks it constructed.
  - **Owners.** `verify_product.ts` owns file digests and coordinates;
    `declaration_exports.ts` owns program construction.
  - **Second program (optional).** Removing it means keeping the first checker
    from verification until linking. That is a lifetime decision, because it
    raises retention.
- Size: M. Unifying the two programs makes it L.
- Risk: none. Memoizing and removing duplicate work give the same output
  bytes. Unifying the programs changes no bytes, but retention grows while a
  checker is held.
- Change class: realization_refactor
- Confidence: verified by reading for each repetition. It is inferred, not
  measured, what share of the measured setup peak (about 0.93 GB per case in the
  first ~20 s, M_RETURN) belongs to the archive copies and the two TypeScript
  programs. One heap snapshot at the peak of `B04-C01 close-only` would settle
  it. This entry is not the closed INSTALL-VERIFY-COMPUTE-01, which removed the
  per-export closure walk inside `exportedSymbolPhysicalRelationRefs` at
  `695a63e94`. The repetitions above are the remainder.

### PERF-B: installed content hashed three times per SDK call needs an owner ruling, not a repair

- Category: performance; design and specification
- Evidence (measured).
  - The RC9 review (finding F3) counted 3 content verifications and 15,969 file
    hashes per SDK call.
  - The work is in `installedProductContentMatches` (`install_product.ts:181`)
    and its `sha256File` loop in `installedPayloadMatchesGraphCarrier` (136).
  - It is called from `installed_module.ts:31` (module acquisition),
    `verification_operation.ts:40`, and `semantics.ts:714`
    (`verifyInstalledContent`, once per leaf port construction and authorization).
  - The register closed reuse under the P5 ruling, and RC9 withdrew O3.
- Retire: nothing until the owner rules what "installed verified" promises.
  - If it means unchanged since verified: hash once per process per `installId`,
    plus a stat walk (size, mtime, inode) at each boundary.
  - If it means byte identity at each boundary: at most, merge the three
    per-call walks into one.
- Size: L
- Risk: Public contract, because the ruling defines what `installed_verified`
  means. No replay bytes change.
- Change class: requirement_reprice if the promise changes; design_reframe if
  only the lifetime is resolved.
- Confidence: verified (measured). It stays blocked until the owner rules.

### PERF-C: declaration source text retained per loaded Product

- Category: performance
- Evidence (measured; M_RETURN).
  - About 11 MB of `.d.ts` text is retained per loaded Product graph, through
    `resolvedProductEnvironments` (`environment.ts:409-412`, `527-529`) →
    `nativeDeclarationEvidence.sources[].sourceText`. A further 7 MB is
    declaration inventories.
  - Read: the verified artifact carries the text (`verify_product.ts:2238`,
    `2372`).
  - `verificationDigest` is computed over the whole artifact body
    (`verificationBody`, 219). The local-native-evidence digest is computed over
    the evidence (262-274).
- Retire. Two options:
  - The design option: carry the evidence by digest and read the sources from
    the installed package on demand. Nothing in the current shape can be dropped
    without changing those two digests.
  - Without a design change, the only saving is PERF-A's: fewer re-hashes of the
    text, not less retention.
- Size: L
- Risk: replay digests of recorded Runs, and manifest or digest pins. The
  verification digest and the local-native-evidence coordinate appear in setup
  events and in Public verification results. A replay that re-derives them for
  a recorded artifact would differ.
- Change class: design_reframe
- Confidence: measured retention. That replay re-derives these coordinates is
  likely, not checked; tracing the replay readers of `localNativeEvidence` would
  settle it. M_RETURN states that the cost matters only to hosts that import
  many installed roots.

### PERF-D: catalog admission hashes inside a sort comparator and compares install rows quadratically

- Category: performance
- Evidence (structural, read).
  - **Sort comparator.** `admitGraphFunctionCatalog` sorts publications with
    `modulePublicationSemanticDigest` inside the comparator
    (`catalog.ts:461-466`). That function (`publication.ts:5`) canonicalizes the
    whole GTL carrier and hashes it, with no memo. The sort therefore repeats a
    full canonicalization O(log n) times per publication.
    `catalog_definition_bindings.ts:229` recomputes the same digest for each
    publication on every call.
  - **Quadratic compare.** `reconstructHistoricalDeclarationCatalog`
    (`declaration_closure.ts:53-61`) re-admits the catalog and compares the
    whole catalog with `canonicalEquals`. The RC6 review measured 22 MB for this
    catalog. It then runs `canonicalEquals` inside `some(filter(...))` over the
    install rows, which is quadratic in installs.
    - `canonicalEquals` (`shared/value/equality.ts:16`, outside the area) has no
      identity short-circuit. It serializes both sides even when they are the
      same object.
    - Callers: `validator/conformance_definition_bindings.ts:294`, and
      `abg/qualification_proof.ts:114`, which caches the result by `WeakMap`.
- Retire.
  - Compute publication digests once into keyed pairs before sorting.
  - Memoize `modulePublicationSemanticDigest` on frozen publications. The
    `canonicalPublications` `WeakMap` (`catalog.ts:402`) is the pattern.
  - Index install rows by canonical JSON once.
  - Add a `left === right` short-circuit to the shared `canonicalEquals` owner.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified by reading. The value is likely small per call: the
  number of publications and installs is small. The 22 MB whole-catalog compare
  is the part that scales.

## Check 4: Second owners

### SO-A: workspace-binding and lock identity computed in seven places; environment.ts should own it

- Category: second owner
- Evidence (read; clone census pairs `environment.ts:1270` with
  `worksite_construction.ts:248` and `worksite_command_execution.ts:854`).
  - The rule takes the binding body (workspace, authority, actor, ProductSet,
    lock, roots), computes `sha256Canonical`, and forms the identity
    `workspace-binding://abiogenesis/<hex>`.
  - The owner is `environment.ts`: the constructor at 1170-1174 and the
    validator at 1270-1287.
  - Copies in this area: `catalog.ts:~468-488` and `materialization_operations.ts`
    (`bindingBodyDigest` 177, check 229-234).
  - Copies outside the area: `worksite_effect.ts:478-486`,
    `worksite_construction.ts:248-263` and `worksite_command_execution.ts:854-869`.
  - The lock identity rule (`product-lock://abiogenesis`) is written at
    `environment.ts:520` and `758`.
  - Coordinate helpers are re-declared in each binding file:
    - `environment_definition_bindings.ts:148-182`: `resolvedLockCoordinate`,
      `workspaceBindingCoordinate`, `uniqueCoordinates`;
    - `catalog_definition_bindings.ts:171-227`: `workspaceCoordinate`,
      `lockCoordinate`, `canonicalCoordinates`, `sameCoordinateSet`;
    - `materialization_definition_bindings.ts:208`: `workspaceCoordinate`.
- Retire.
  - `environment.ts` exports `workspaceBindingDigest(body)`, `isWorkspaceBinding`,
    and binding and lock coordinate helpers. The six copies import them.
  - A sorted-unique coordinate-set helper moves to the shared definition-binding
    helpers.
- Size: M
- Risk: none. The output bytes match because the field lists are identical. I
  read four of the copies to confirm this; the `worksite_command_execution`
  copy was seen only by grep.
- Change class: realization_refactor
- Confidence: verified for the five copies I read; likely for the sixth.

### SO-B: the Public contract catalog digest rule has three definitions

- Category: second owner
- Evidence (read).
  - `verify_product.ts:1120` `catalogWithoutDigest`, used at 1135 and 2153.
  - `public_contract_publication.ts:415` `productPublicContractCatalogDigest`.
  - `T/scripts/generate-product-manifest.mjs:1068`, its own `catalogWithoutDigest`.
- Retire: one function in a runtime module that both `verify_product.ts` and
  the generator import, either `contracts.ts` or `verify_product.ts`.
  - This interacts with ST-B. If `public_contract_publication.ts` leaves the
    runtime barrel, the owner cannot live there.
- Size: S
- Risk: manifest or digest pins only if a copy has drifted; today the copies
  produce the same bytes.
- Change class: realization_refactor
- Confidence: verified

### SO-C: the native declaration relation shape has two schema copies and one hand validator

- Category: second owner
- Evidence (read; clone census:
  `environment_operation_contracts.ts:106` ↔ `shared/public_function_contracts.ts:258`,
  25 lines).
  - The relation shape is the external relation origin and selection.
  - **Native types**, independent of the schema library by intent:
    `declaration_exports.ts:40-71`. The comment at
    `declaration_application.ts:50-51` states that intent.
  - **Two identical valibot copies:** `environment_operation_contracts.ts:106-137`
    and `shared/public_function_contracts.ts:258-290`. The shared copy is used
    by `verification_operation_contracts.ts:70`.
  - **A hand validator** for the same shape inside `isNativeDeclarationEvidence`:
    `verify_product.ts:331-400`, origin and selection at 340-395.
  - **The compile-time agreement asserts are not dead.** These are
    `environment_operation_contracts.ts:77-80` and `346-371` (the `_*SchemaIsNative`
    types) and `declaration_application.ts:52-61`. They keep the native types and
    the schemas equal.
- Retire.
  - Export the shared schemas and delete the environment copy.
  - Replace the hand validator with the shared schemas. The digest re-checks
    stay in the validator.
  - Keep the native types and the asserts, but use one shared type-equality
    helper instead of the two (`environment_operation_contracts.ts:77-78` and
    `declaration_application.ts:52-58`).
- Size: M
- Risk: none. The schemas are identical, so the Public contract does not
  change.
- Change class: realization_refactor
- Confidence: verified for the two schema copies, read side by side. Likely for
  the hand validator: `strictObject` matches its exact-key checks. The existing
  negative cases of the evidence validator would settle it.

### SO-D: the Product identity row is declared four times

- Category: second owner
- Evidence (read; clone census `contracts.ts:139`↔`317`, 18 lines;
  `environment.ts:574`↔`836`, 12 lines; `implementation_resolution.ts:62`↔`110`,
  15 lines).
  - The same Product identity fields appear in four places:
    - the verified-artifact fields, `contracts.ts:136-158`;
    - the install-candidate fields, `contracts.ts:314-336`;
    - two `hasExactKeys` lists of those fields, `environment.ts:574-590` and
      `836-850`.
  - The implementation-descriptor fields are repeated in the same way at
    `implementation_resolution.ts:60-77` and `108-124`.
- Retire.
  - Declare one base interface, extended by the artifact, the install candidate
    and the lock row.
  - Derive the key lists from one constant array.
  - Do the same for the descriptor pair.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified

The default public-result projection rule is a further second owner, written at
`semantics.ts:657-664` and `builtin_semantics.ts:753-759`. It is part of E2.

## Check 6: Structure

### ST-A: the operation-family layer; one table-driven owner per family

- Category: structure; second owner
- Evidence (read: the five operations files in full, and the binding helper
  sections). Four families (verification, install, environment, catalog), plus
  materialization, each have a contracts file, an operations file and a
  definition-bindings file.
  - **One name, two meanings.** Each family exports its `*_CONTRACTS` name
    twice: as the contract declarations in the contracts file, and as an object
    of functions in the operations file.

    | Name | Declarations | Functions |
    |---|---|---|
    | `PRODUCT_INSTALL_CONTRACTS` | `install_operation_contracts.ts:81` | `install_operation.ts:27` |
    | `PRODUCT_ENVIRONMENT_CONTRACTS` | `environment_operation_contracts.ts:503` | `environment_operations.ts:61` |
    | `PRODUCT_VERIFICATION_CONTRACTS` | `verification_operation_contracts.ts:141` | `verification_operation.ts:73` |
    | `CATALOG_OPERATION_CONTRACTS` | `catalog_operation_contracts.ts:371` | `catalog_operations.ts:328` |
    | `MATERIALIZATION_OPERATION_CONTRACTS` | `materialization_operation_contracts.ts:132` | `materialization_operations.ts:637` |

    - `index.ts:530-533` re-exports the declarations as `*_SOURCE_DECLARATIONS`
      and the functions under the plain name.
    - Tests read both meanings under one name:
      - functions in `t287-wave2-owner-chain.test.mjs:106-114`;
      - declarations in `t291-m6-admission-refusal-surface.test.mjs:25`.
  - **Port interfaces with no implementor.** Five interfaces are implemented by
    no value typed against them:
    - `ProductVerificationPort` (`verification_operation_contracts.ts:143`);
    - `ProductEnvironmentPort` (`environment_operation_contracts.ts:505`);
    - `ProductInstallPort` (`install_operation_contracts.ts:83`);
    - `ProductMaterializationPort` (`materialization_operation_contracts.ts:137`);
    - `CatalogOperationPort` (`catalog_operation_contracts.ts:377`).

    The runtime uses the same-named constants in the operations files. Those
    constants are what the census counts as test hits for the interfaces. Two of
    the interfaces are package tier only because `app/m04.ts` (outside the area)
    re-exports their contracts files with `export *`.
  - **The packet layer is bypassed.**
    - The resolve binding calls `resolveProductArtifacts` directly
      (`environment_definition_bindings.ts:460`). Only a test constructs
      `ProductResolutionPacket` (`environment_operations.ts:16`):
      `steel-basic-cli-public.test.mjs:402`.
    - Both routes reach `resolveProductArtifacts` with the same toolchain digest
      (`environment.ts:533-541`), so the tests do not run a different path.
      Production simply does not use the layer for resolve.
  - **Per-file fault builders.** `verification_definition_bindings.ts:77` and
    `environment_definition_bindings.ts:127` build the fault object by hand. The
    shared `definitionFault` already builds it, and `catalog_definition_bindings.ts:162`
    uses that.
  - **The model.** `materialization_definition_bindings.ts` is already table
    driven:
    - the `DECLARED_REFUSAL` and `OWNER_REFUSAL_PATH` tables (126-160);
    - `ADMIT_REQUEST` and `OWNERS` keyed by member (225-279);
    - one generic `materializeOwner` (318-461).
- Retire. Each family becomes one module that holds:
  - its declarations;
  - a member table of `{admitRequest, owner, refusalMap, refusalPath, receipt}`;
  - one shared generic binding constructor, the same for every family.

  This removes the five Port interfaces, the operations-file `*_CONTRACTS`
  constants, and the packet adapters wherever the binding calls the owner
  directly. One exported name per meaning remains.
- Size: L. It spans five families, `public/binding/owner_contract_source_set.ts`
  (which imports the declarations), `app/m04.ts` and the tests.
- Risk: Public contract, and manifest or digest pins.
  - The declarations are the source of the generated Public contract set. If
    native locators name source modules, moving the declarations changes the
    manifest. That is inferred; regenerating the manifest and comparing it would
    settle it.
  - The `./product` and `./app/m04` barrels change their export names.
- Change class: design_reframe
- Confidence: verified for the repetition. The consolidated shape is inferred
  from the materialization model.

### ST-B: build-time publication code sits in the runtime Product barrel

- Category: structure
- Evidence (outline; lines 380-440 read; census tier `package`).
  - `public_contract_publication.ts` (771 lines) is imported only by
    `product/index.ts`.
  - Its consumers are the build generator (`generate-product-manifest.mjs:600`,
    `606`, through the barrel) and two tests:
    `t287-w2-05-generator-package-reproducibility` and
    `t287-pfc-f08a-product-verification-boundary`.
  - The generator already imports `constructSelfConformanceAssetRows` from this
    file by path (`generate-product-manifest.mjs:5`).
  - Every runtime import of `product/index.js` loads it. It computes
    `sha256Canonical` constants when the module loads (392-401).
  - Names carry the step label S06: `bindS06PublicFunctionCatalog` (570),
    `S06PublicCatalogBindingSuccess` (328), `S06_REPLACEMENT_CONTRACT_IDS` (112).
  - Refuted as dead: the build uses it.
- Retire.
  - Move it to a build-only entry that the generator imports by path, and drop
    it from `product/index.ts`.
  - Rename the S06 names to say what they do.
  - Keep the SO-B owner in a runtime module.
- Size: S
- Risk: Public contract only if package barrel names count as consumer contract.
  I found no consumer in `test_env/downstream`, `qualification`, `proof`,
  `types` or `T/contracts`. The file stays in the package.
- Change class: realization_refactor
- Confidence: verified

### ST-C: functions over 200 lines that block consolidation

- Category: structure
- Evidence (census line counts and my outlines).
  - `linkNativeContractSet` (`declaration_exports.ts:2068`, 1,304 lines) holds
    three jobs: its own program build (2530), selector resolution and
    cross-Product linking. PERF-A's second-program work needs it split.
  - These others are named by the entries that touch them:
    - `verifyProduct` (`verify_product.ts:2011`, 606 lines);
    - `isNativeDeclarationEvidence` (331, 396 lines), which SO-C absorbs;
    - `bindDefinitionContractCoordinates` (1493, 312 lines);
    - `resolveDeclarationClosure` (`declaration_closure.ts:418`, 557 lines);
    - `admitGraphFunctionCatalog` (`catalog.ts:446`, 286 lines);
    - `isResolvedProductLock` (`environment.ts:543`, 217 lines), a hand
      validator that a schema could replace.
- Retire: split `linkNativeContractSet` into program construction, selector
  resolution and link. Split the others only as their entries require.
- Size: M
- Risk: none
- Change class: realization_refactor
- Confidence: verified (outline and census)

## Check 5: Failed, unfinished or superseded features

### E1: the STDO environment specialisation, superseded by the generic run environment

- Category: failed or superseded feature
- Evidence.
  - **Product side** (`stdo_environment.ts`, read in full). Lines 24-197 are the
    STDO-specific observation, all in the census `none` tier:
    - `STDO_ENVIRONMENT_RESOURCES_SCHEMA` (29);
    - `StdoEnvironmentResources` (36) and `StdoEnvironmentObservation` (39);
    - `inventoryPaths` (55);
    - `verifyCompanion` (65);
    - `observeStdoEnvironment` (85, 113 lines).
  - **Generic replacement.** The runtime imports only the generic members:
    - `observeRunEnvironment` (314), used by `run_invocation_operation.ts:11`;
    - `RUN_ENVIRONMENT_RESOURCES_SCHEMA` (202), used by
      `owner_bindings/run_invocation.ts:130`;
    - `compareInstalledC2ContextMaterial` (245), used by `semantics.ts:19`;
    - the `index.ts:548` re-exports.
  - **Tests.** The only consumers of the specialisation are
    `t287-stdo-environment-citation.test.mjs` and `t287-stdo-run-environment.test.mjs`.
    Neither is in any npm script (census `tests-not-in-any-npm-script.json`).
  - **Same feature outside the area** (census only):
    - `abg/stdo_environment.ts`, in the `none` tier: `StdoEnvironmentEvidence`
      (37), `isStdoEnvironmentEvidence` (69, 75 lines),
      `stdoEvidenceMatchesInvocation` (144), `projectStdoRoleEvidence` (151);
    - `gtl/stdo_run_environment.ts`, in the `none` tier:
      `stdoEnvironmentForProgram` (80), `validStdoEnvironmentPublication` (86),
      `validStdoEnvironmentProgram` (91).
- Retire.
  - Delete product lines 24-197, the abg and gtl declarations above, and the two
    tests. Hand the abg and gtl parts to those areas' reviewers.
  - Optional: rename the three files to `run_environment`. That changes module
    paths.
- Size: M
- Risk: manifest or digest pins, but only for the next build's package
  inventory and native declaration evidence. Recorded Runs do not change.
- Change class: realization_refactor
- Confidence: verified for product, by reading and by grep across
  `code/src`, `test_env`, `scripts` and `contracts`. Likely for abg and gtl
  (census only).

### E2: Consensus residue in the Product semantics; blocked on the owner's One Surface decision

- Category: failed or superseded feature
- Evidence (read).
  - **Consensus-only code in `builtin_semantics.ts`.** Lines 66-89 and 430-785
    exist only for Consensus. The prepared retirement on branch
    `claude/rc12-consensus` at `9c086294b` shrinks the file from 1,084 to 703
    lines (`git show`).
  - **Hard-wired provider.** `project_read_definition_bindings.ts:934` (outside
    the area) projects every admitted Run result through
    `ABI5_SYSTEM_PRODUCT_SEMANTICS.projectPublicResult`. It does not use the
    loaded provider through `projectInstalledPublicResult`, whichever Product
    produced the result.
  - **The default projection is written twice:** `semantics.ts:657-664` and
    `builtin_semantics.ts:753-759`.
  - **The roster exists only for Consensus.** It is the provider member
    `publicResultProjectionKinds` (`semantics.ts:152`, validated 473-482), plus
    three helpers that only the package barrel exports:
    - `hasInstalledPublicResultProjection` (619);
    - `supportsInstalledPublicResultProjection` (632);
    - `projectInstalledPublicResult` (645).

    The roster's only non-default entry is `"ticket.consensus"`
    (`builtin_semantics.ts:637`). None of the three helpers has a caller in
    `code/src` or any test.
  - **The prepared branch leaves the roster.** It deletes the system semantics
    and the hard-wired call, but keeps `semantics.ts:619-665` and the roster
    member.
  - **Why it was backed out.** RC12 package CB reverted the retirement
    (`CB_RETURN.md`; `C_RETURN.md` "Standing after independent review"). It
    waits on the owner's Product decision on how One Surface (`A5-F07`,
    REQ-P-POLICY-023) is realized without Consensus.
- Retire, once the owner rules:
  - apply the prepared branch;
  - delete the roster member and the three helpers;
  - serve `run_result` through the loaded provider with the one default rule
    in `semantics.ts`.
- Size: L
- Risk:
  - Public contract: the `ticket_consensus` read member and the Consensus
    contracts.
  - Replay digests of recorded Runs, inferred: recorded Runs likely cite
    `product-semantics://abiogenesis/system@5`, through the implementation
    binding at `gtl/consensus.ts:5215-5219`. If they do, their replay needs
    that binding to stay resolvable, or an explicit history rule.
- Change class: product_reprice, recorded as not yet done
- Confidence: verified for the residue and the branch contents. The replay
  impact is likely; settling it means checking how replay resolves a recorded
  `bindingRef`.

### E3: F_H interaction response evaluation is required of every provider and called by nothing

- Category: failed or superseded feature
- Evidence (read).
  - **Required member.** `ProductSemanticsProvider.evaluateInteractionResponse`
    is required (`semantics.ts:157`) and checked at load (449).
  - **Wrapper with no runtime caller.** `evaluateInstalledInteractionResponse`
    (581) is package tier. Its only callers are
    `m5-s03-authority.test.mjs:236-257` and
    `t287-common-computational-library.test.mjs:363-369`.
    - Nothing in `abg/`, `hog/` or `public/` calls either the member or the
      wrapper.
    - abg's own F_H response path (`abg/continuation.ts:1469`
      `prepareFhInteractionResponse`) does not consult the Product.
  - **Implementations.** The only real one is the Consensus escalation decision
    (`builtin_semantics.ts:639-669`). The requirement-handoff provider returns
    `null` (794); the self-conformance provider also implements it
    (`validator/self_conformance_semantics.ts:118`).
  - **Related history.** The RC6 review found that `fh_interaction_responded`
    was never admitted in 17.9 h, and C-17 retired the carried F_H resume chain.
- Retire: either drop the member, the wrapper and the three implementations, or
  wire the evaluation into abg's response admission. The F_H design decides
  which.
- Size: M
- Risk: none for bytes. The member leaves the provider interface, and one name
  leaves the package barrel.
- Change class: design_reframe
- Confidence: likely. One check settles it: whether the F_H response admission
  is meant to call the Product's evaluation.

### Release snapshot: required, never run for a 5.x cut, tests outside every gate

- Category: failed or unfinished feature (record only; retire nothing)
- Evidence (read in full).
  - `release_snapshot_operations.ts`, `release_snapshot_definition_bindings.ts`
    and `release_acceptance.ts` realize REQ-P-QUAL-050 to 056 (`AF-25`
    `release.snapshot`).
  - The Public operation is `abg.operation.release.snapshot`
    (`REQ-P-PUBLIC-CONTRACTS.md:223`). It is required, so it is not debt.
  - No 5.x snapshot exists. The repository's `release_snapshots/` holds 4.x
    bundles only: the newest is `4.6.0-rc.3`, and `latest/` is `4.5.1`.
  - The 2026-10-30 preview clarification in REQ-P-QUAL says the RC1 preview is
    not an `AF-25` output.
  - Three tests are in no npm script: `t287-release-acceptance`,
    `t287-release-publication` and
    `t287-w2-05-release-snapshot-definition-bindings`.
- Retire: nothing. Add the three tests to a gate; the tests area owns that, and
  `findings/tests-scripts.md` does not mention them yet.
- Size: S (gating only)
- Risk: none
- Change class: realization_refactor (gating)
- Confidence: verified

`release_snapshots/` (361 tracked files, 55 MB) is intentional retention, not an
entry. `git grep` finds no code or script reference outside `.ai-workspace`, and
`rc12-executive-01/K_RETURN.md:17` already ruled those paths "history or fixture
data — stay". One fact for the owner: PRODUCT.md's origin baseline is
`4.6.0-rc.5` (PRODUCT.md:140-151), and that release is not in the directory. No
deletion is proposed.

Milestone-named surfaces:

- `app/m04.ts` (outside the area) re-exports five contracts files with `export *`.
- The S06 names are covered by ST-B.
- `m5-s06-prime.test.mjs` is the only consumer of `declarationExportSymbols` and
  `loadVerifiedInstalledModule`.

## Check 3: Kinds handled but never produced, and produced but never read

### K-A: catalog readiness refusal codes left over from refusal-shaped readiness

- Category: dead code
- Evidence (read, plus grep of `code/src`, `test_env/{tests,support,falsifiers,fixtures}`,
  `scripts` and `contracts`).
  - `publication_not_bound` and `unresolved_readiness_prerequisite` are in the
    `CatalogConstructionRefusal` code union (`catalog.ts:148-149`). Their switch
    arms are in `projectCatalogRefusal` (`catalog_definition_bindings.ts:396`,
    `405`). Nothing produces them.
  - Readiness is now reported per publication as a disposition:
    `publication_owner_unresolved` (`catalog.ts:585`),
    `readiness_declaration_mismatch` (688) and
    `missing_readiness_prerequisite:<ref>` (695). These are declared at
    `catalog_operation_contracts.ts:93-100`.
- Retire: both codes and their switch arms.
- Size: S
- Risk: none. These are owner-internal codes; the Public codes they map to have
  other producers.
- Change class: realization_refactor
- Confidence: verified

### K-B: `set_mismatch` in the implementation set refusal

- Category: dead code
- Evidence (read).
  - `set_mismatch` is in the union at `implementation_resolution.ts:145`, and
    `635` maps it to `invalid_program_validation`.
  - The 13 `setRefusal` sites (172-553) produce only `implementation_absent`,
    `selection_mismatch`, `ambiguous_implementation`, `contract_mismatch` and
    `invalid_program_validation`.
- Retire: the union member and the ternary at 635.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified

### K-C: materialization owner refusal codes; the Public `mutable_default` has no producer

- Category: dead code; design and specification
- Evidence (read).
  - **`workspace_not_ready`** (`materialization_operations.ts:72`) is never
    produced. Its Public code `workspace_mismatch` is produced by the binding
    itself at request admission (`materialization_definition_bindings.ts:233`).
    The owner code is therefore plain dead.
  - **`mutable_default_forbidden`** (77) is never produced either. Its Public
    code `mutable_default` (`materialization_operation_contracts.ts:40`) has no
    producer anywhere, in the owner or the binding.
    - The design declares the refusal at `T/design/ABI5_REALIZATION_CONSTITUTION.md:2802`
      (R37: "mutable implicit input -> `mutable_default`"). It is also listed in
      `T/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md:637`,
      whose row also says "no defaults".
    - The owner admits only declared, typed inputs and has no default
      mechanism, so the refusal looks unreachable by construction. That is
      inferred.
- Retire.
  - Remove `workspace_not_ready` from the owner union and from both tables
    (126-160). Size S, no risk.
  - For `mutable_default`, the design owner decides. If it is unreachable by
    construction, it leaves the design, the owner union, both tables and the
    Public refusal schema. Otherwise the missing check gets implemented.
- Size: S, plus a design decision
- Risk: Public contract and manifest pins, if `mutable_default` leaves the
  refusal schema, because the contract digest changes.
- Change class: realization_refactor for `workspace_not_ready`; design_reframe
  for `mutable_default`
- Confidence: verified that nothing produces either code. Reachability is
  inferred.

**External input, not debt.** These kinds are never produced in `code/src`
because something outside the source tree produces them:

- `abg_product_toolchain_manifest` (`verify_product.ts:86`) is read from the
  build's `product-toolchain-manifest.json`.
- The `*_resource_assertion` kinds (`install_definition_bindings.ts:71`,
  `catalog_definition_bindings.ts:98`, `124`,
  `environment_definition_bindings.ts:88`, `104`) are built by the Public
  caller. A grep of `abg/`, `public/` and `owner_bindings/` finds no
  construction; the tests build them, for example
  `w2-steel-single-start-installed.test.mjs:380`, `423`.
- `product_resolution_packet` is test-only (ST-A).

**Produced but never read: external output, not debt.** These are refusal and
reason codes returned to Public callers, in four groups:

- the admission-authority structural refusals (`admission_authority.ts:174-200`);
- the release-snapshot reasons (`release_snapshot_definition_bindings.ts:57-134`,
  `release_snapshot_operations.ts:77-81`);
- the catalog conservation and disposition reasons (`catalog.ts:632`, `677`;
  `catalog_operation_contracts.ts:79-85`);
- the publication-binding failure classes (`public_contract_publication.ts:45-53`).

No test asserts most of these literals (census `testFiles` 0). That belongs to
the tests area as a candidate; this file does not list it kind by kind.

## Check 2: Compiler-unused

### `ProductVerificationCoordinate<T>` declares a type parameter it never uses

- Category: dead code
- Evidence (census `compiler-unused.json`; read). At `contracts.ts:196`,
  `ProductVerificationCoordinate<T = unknown>` never reads `T`. The type is
  structurally identical for every `T`, so the parameter brands nothing.
- Retire: either make it a real brand (an optional phantom member) or delete the
  parameter and its type arguments at the use sites.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified

This is the area's only compiler-unused entry. The other two in P,
`result_assessment_operation.ts:34` and `worksite_operations.ts:17`, are outside
this area.

## Check 1: Dead declarations (`none` and `package` tier)

Confirmed dead or test-only, grouped by feature:

| Feature | Declarations | Disposition |
|---|---|---|
| STDO environment specialisation | `stdo_environment.ts:27-197` | E1 |
| Consensus public-result roster | `semantics.ts:619`, `632`, `645` (no caller anywhere) | E2 |
| F_H interaction response | `semantics.ts:581` (tests only) | E3 |
| Operation-family Ports and packets | the five Port interfaces; for resolve, `resolveProductEnvironment` and `ProductResolutionPacket` (`environment_operations.ts`, tests only). The `ProductEnvironmentPort` constant and `constructExactWorkspaceBinding` are live: the bind binding calls them (`environment_definition_bindings.ts:673`, `689`) | ST-A |
| Closure re-validation | `declaration_closure.ts:259` `validateResolvedExecutionDeclarationClosure`: no consumer in `code/src`, `test_env`, `scripts` or `contracts`. The program variant at 280 is live (`catalog_operations.ts:91`) | Delete, S, verified. Exported through `index.ts:350`, so it carries ST-B's package-barrel caveat |
| Catalog refresh alias | `catalog.ts:871` `refreshGraphFunctionCatalog` is a one-line alias of the exported `buildGraphFunctionCatalog` (733); only `r4-catalog-admission.test.mjs` uses it | Point the test at the builder and delete, S. Exported through the package barrel, so it carries ST-B's caveat |
| M5 S06 test reach | `declaration_exports.ts:3373` `declarationExportSymbols`, `installed_module.ts:41` `loadVerifiedInstalledModule`: only `m5-s06-prime.test.mjs` | Keep with that test, or delete with it if the tests area retires it |
| Descriptor loading | `implementation_resolution.ts:158` `loadInstalledImplementationDescriptors`: only `t287-native-semantic-revision.test.mjs` | Investigate: test-only, or a package consumer contract |

Refuted, with the use that refutes each:

- `implementation_resolution.ts:592` `resolveImplementation` is a pinned native
  contract locator (`abg.contract.product.implementation-resolution-root`,
  `generate-product-manifest.mjs:866`).
- `public_contract_publication.ts` is used by the build generator (ST-B).
- `semantics.ts:538` `establishCanonicalProductInput` has a runtime caller,
  `public/installed_public_definition_call.ts:582`.
- `admission_authority.ts:83` `admissionEnvironmentSelection` and
  `232` `constructAdmissionCapabilityData` are the installed-consumer surface
  that 16 and 5 test-side files use through the package barrel.
- `stdo_environment.ts:208` `constructRunEnvironmentResources` is used by tests
  and test support.
- The observation counters are documented measurement seams that the RC9
  acceptance criteria rely on. They are intentional retention. They are
  `catalog.ts:442` `observeCatalogWork`, `install_product.ts:102`
  `observeInstalledContentWork` and `semantics.ts:504` `observeProductInputWork`.
- The compile-time agreement types at `declaration_application.ts:52-61` and
  `environment_operation_contracts.ts:77-80`, `346-371` are guards (SO-C).
- `release_snapshot_operations.ts:20` `ReleaseIdentity` and
  `80` `ReleaseSnapshotOperationResult` belong to the required release-snapshot
  feature.

## What I did not check

- I ran no code, test, build or measurement. Every cost not cited to M_RETURN or
  the RC6 or RC9 reviews is structural.
- I did not trace whether replay re-derives `localNativeEvidence` or
  `verificationDigest` for recorded artifacts (PERF-C, E2).
- I read only part of `verify_product.ts:1000-1489`.
- I read `catalog.ts`, `declaration_closure.ts`, `implementation_resolution.ts`
  and `admission_authority.ts` by outline plus the ranges named in the table.
- For the `worksite_command_execution.ts` copy of SO-A I saw only its grep line.
- The abg and gtl parts of E1 are from the census only.
- I did not compare whether the hand validator in `isNativeDeclarationEvidence`
  rejects exactly what the shared schemas reject (SO-C).

## Check 8: Coverage

| File | Lines | How read | Findings |
|---|---|---|---|
| `declaration_exports.ts` | 3,388 | read 1-280, 490-730, 1485-2640, 3300-3388; outline of the rest | PERF-A, ST-C, SO-C; test-only `declarationExportSymbols` |
| `declaration_closure.ts` | 1,003 | outline; read 38-72, 255-300 | PERF-D; dead `validateResolvedExecutionDeclarationClosure` |
| `declaration_application.ts` | 288 | outline; read 40-70 | asserts refuted as dead; SO-C helper |
| `verify_product.ts` | 2,616 | read 1-1000, 1489-2616; 1000-1489 in part | PERF-A, PERF-C, SO-B, SO-C, ST-C |
| `verification_definition_bindings.ts` | 379 | outline; helpers 77-92 read | ST-A |
| `verification_operation_contracts.ts` | 145 | outline; read 55-80; census | ST-A |
| `verification_operation.ts` | 75 | full | ST-A, PERF-B |
| `install_product.ts` | 531 | full | PERF-B |
| `install_definition_bindings.ts` | 419 | full | ST-A |
| `install_operation_contracts.ts` | 85 | full | ST-A |
| `install_operation.ts` | 29 | full | ST-A |
| `installed_module.ts` | 81 | full | PERF-B; test-only `loadVerifiedInstalledModule` |
| `environment.ts` | 1,288 | read 395-955, 1262-1288; outline | PERF-A, PERF-C, SO-A, SO-D |
| `environment_definition_bindings.ts` | 816 | outline; read 127-200, 455-480 | ST-A, SO-A |
| `environment_operation_contracts.ts` | 508 | read 1-200, 330-508 | SO-C, ST-A |
| `environment_operations.ts` | 64 | full | ST-A |
| `materialization_operations.ts` | 640 | outline; read 55-95, 205-240, 325-350, 440-475; refusal-code grep | K-C, SO-A |
| `materialization_definition_bindings.ts` | 464 | outline; read 20-165; grep | K-C; the ST-A model |
| `materialization_operation_contracts.ts` | 140 | read 25-45; census | K-C, ST-A |
| `catalog.ts` | 1,028 | outline; read 120-175, 400-505, 865-880 | K-A, PERF-D, SO-A; alias `refreshGraphFunctionCatalog` |
| `catalog_definition_bindings.ts` | 959 | outline; read 162-270, 370-420 | K-A, ST-A, SO-A |
| `catalog_operation_contracts.ts` | 381 | census; grep of 79-100, 371-381 | ST-A |
| `catalog_operations.ts` | 335 | outline | ST-A |
| `public_contract_publication.ts` | 771 | outline; read 380-440 | ST-B, SO-B |
| `publication.ts` | 25 | full | PERF-D |
| `semantics.ts` | 721 | read 130-721; outline of 1-130 | E2, E3 |
| `builtin_semantics.ts` | 1,084 | outline; read 27-106, 170-270, 396-800 | E2 |
| `implementation_resolution.ts` | 689 | outline; read 60-160, 285-300, 630-640 | K-B, SO-D; `resolveImplementation` refuted |
| `admission_authority.ts` | 569 | outline; census | package names refuted |
| `contracts.ts` | 360 | read 136-200, 314-336; census | compiler-unused `T`; SO-D |
| `release_snapshot_definition_bindings.ts` | 157 | full | release-snapshot note |
| `release_snapshot_operations.ts` | 106 | full | release-snapshot note |
| `release_acceptance.ts` | 67 | full | release-snapshot note |
| `stdo_environment.ts` | 437 | full | E1 |
| `index.ts` | 603 | read 250-400; grep | ST-A (export names), ST-B |
