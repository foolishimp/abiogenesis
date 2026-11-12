# Package-Owned Bundled Native Declarations

## Boundary

ABIogenesis publishes exact, source-independent native contracts under one
immutable Product content identity. Product verification owns local admission;
Product resolution owns cross-Product linking and the resolved lock. The
compiler supplies TypeScript meaning, not Product or runtime authority.

This amendment refines NCC-F01/NCC-F02 under `EnvironmentBasis`. It changes the
inherited `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` section 2.1 rule that every
non-platform bare reference is external, and section 7.1's single-level export
restriction, only for declarations demonstrably bundled inside the same Product.
The successor `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`
names accepted parent `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` and retains its
other decisions. Public native locators, direct cross-Product contract binding,
compiler basis, exact identity and all other affected-owner boundaries remain.

## Complete existing-owner function

NCC-F01 consumes one immutable Product payload,
its content-bound package/bundle/export metadata and declaration sources,
exact public native proposals, and the existing pinned TypeScript basis. It
derives the package-owned declaration closure and checker-visible native
symbols, plus source-contract-indexed genuinely external pending selectors,
or the existing typed refusal. It neither constructs a lock nor installs or
executes anything.

Its shared `resolveNativeDeclarationClosures` derives the local closure and
checker symbols; existing contract-indexed analysis joins exact native
proposals to that result. These factors remain one Product-owned function,
not newly exposed operations or alternative analyzers.

The publisher supplies proposals from that payload. `verify_product`
independently reconstructs the same relation from verified archive bytes.
`linkNativeContractSet` consumes the resulting verified private evidence and
uses the same package-owned classification in its linked checker host. It
retains existing external occurrence/binding and lock construction. A lexical
change to `externalRelations` alone does not implement this function.

### Native applicability and exact metadata integrity

NCC-F02 determines native applicability for each original verified Product
before constructing its declaration package basis. The actual advertised
public native rows and the identity-matched private evidence form one input
relation. Sources, closures and contract evidence are arrays; each advertised
native row joins exactly one matching contract, declaration root, source body
and canonical inventory. Malformed, erased, mismatched, duplicate or surplus
evidence returns the existing typed refusal. An empty evidence array alone
does not establish an empty native domain.

A Product has empty native applicability only when it advertises no native
rows and its source, closure and contract arrays are all empty. Its current
package metadata remains mandatory exact payload evidence: each unique,
contained, normalized Product-relative `package.json` path binds a matching
digest and a valid UTF-8 JSON object. The root names the current package, has
a nonblank version and agrees with its module format. Bundle aliases agree;
bundle names are valid, unique and declared by the root dependencies. Missing
or damaged current root metadata and contradictory evidence refuse.

This metadata integrity relation precedes declaration target selection. An
empty native Product contributes no declaration roots, checker-visible
symbols, external native bindings or declaration package host entries. Its
inventoried nested package metadata is not selected or flattened into the
finite native declaration profile. It remains present at its original index
in the complete Product/dependency/lock relation. The original multi-Product
global-declaration boundary therefore still applies when an empty Product is
composed with a native Product.

For every native participant, the existing package-owned declaration profile,
source host, compiler basis, direct external occurrence targets, named-symbol
checks and refusals apply without relaxation. An empty native target cannot
satisfy a required native contract. The existing metadata-absent local native
helper domain remains unchanged; it does not authorize omitting the current
metadata of a verified empty Product. These factors remain private within the
existing owner and preserve its exported signatures and evidence carriers.

### Same-Product ownership

1. A bundled declaration is local only when the Product's inventoried root
   package metadata explicitly selects the bundle, directly or through its
   finite bundled dependency closure, and the selected package metadata and
   declaration files are members of that same immutable payload. A bare name,
   a `node_modules` path, installed presence or publisher assertion alone is
   insufficient. Actual package name/version/type and export metadata bind to
   exact Product-relative bytes and digests.
2. Resolution starts from the containing declaration's package scope, including
   its self-package identity and inventoried intervening module-format metadata.
   The Product root's name/type does not overwrite every bundled file's scope.
   All such packages retain the enclosing Product as semantic owner; they gain
   no Product identity, native public contract or capability of their own.
3. The existing closed TypeScript host resolves only inventoried declarations
   and the admitted compiler/platform basis. Selected paths are contained,
   ordinary declaration members; escape, symlink-dependent, absent, conflicting
   or ambiguous metadata/targets refuse. Claimed bundled ownership that fails
   these checks does not fall through to an ambient or external substitute.
4. Every reachable bundled declaration joins the existing canonical native
   declaration inventory exactly once. Package metadata remains exact-byte,
   content-bound subordinate input carried in verified private evidence for
   both checker stages. It creates no separate registry, admission entity or
   public contract. Changed metadata or declaration bytes invalidate affected
   prior evidence; existing Product/contract digest and supersession laws apply.

### Closed declaration-target profile

The selected bundle profile supports explicit root or exact-subpath exports
with one `types` target, and the existing `import`/`require` branches with one
`types` target in the branch selected by the pinned checker's use-site module
mode. A root `types`/`typings` target applies only when exports are absent and
the target is unique. Resolution never selects the first available file or
substitutes a runtime `default` JavaScript target for a declaration.

This includes the existing Valibot 1.4.2 metadata shape without a package-name
or alias whitelist. It also preserves inventoried package-format boundaries
such as an internal ESM directory. Inactive conditions remain metadata, not
enabled paths. Arbitrary deeper conditions, custom-condition activation,
wildcards, target arrays, `typesVersions`/path aliases, JavaScript type
inference and nested dependency-version shadowing are unsupported here;
selecting one refuses rather than inventing broader resolution semantics.

### Genuine external meaning

A reference with no proven same-Product bundle or existing self/platform
resolution remains external. NCC-F01 records its exact pending selector; it
does not infer its final meaning. NCC-F02 still requires the containing
Product's direct declared dependency and exactly matching required native
contract, with the existing namespace/alias/occurrence checks. A bundled
declaration's reference beyond its owning Product obeys that same law.
Transitive package presence does not create cross-Product authority. No host
filesystem search, ambient compiler/configuration, network or automatic type
acquisition completes a missing relation.

## Product payload membership

The Product payload is every regular file that a package's own `package.json`
selects, for the root package and for each package in the lockfile's
bundled-dependency closure. A package selects `package.json`, its top-level
README, LICENSE, LICENCE and COPYING files, the targets of `main`, `browser`
and `bin`, and every file under its `files` entries. A package without `files`
selects every file in its directory. Nested `node_modules`, version-control
directories and operating-system or editor residue (`.DS_Store`, `._*`,
`.*.swp`, `*.orig`, `npm-debug.log`, `.npmrc`) are never selected. A `files`
entry is a literal path, `dir/` or `dir/**`; any other entry refuses.

`productPayloadMembers` in `scripts/product-payload.mjs` owns this rule. The
manifest generator digests its list into `productContentDigest`. `packProduct`
copies exactly that list into a stage outside the source tree, packs the stage
with npm and refuses when the archive's members differ from the list. Every
tenant pack of the Product root uses it, and `node scripts/product-payload.mjs
pack <destination>` serves callers outside the tenant. npm's projection of the
source tree is not an input. When npm trusts `node_modules/.package-lock.json`
it reads dependency metadata without `files` and `main`, and lists files that
the dependency's own `package.json` excludes.

## Recorded and strict Product truth

A resolved lock, a verified artifact and a capability-definition graph answer
one of two questions. The entry that knows where the value comes from passes
the question (`ProductTruthQuestion`, `shared/capability_contracts.ts`); no
guard infers it.

- **Strict.** The value is exact for the reader's own Product, as its
  capability register constructs it. The graph equals
  `constructCapabilityDefinitionGraph` over the graph's own owner coordinates;
  each contract's `capabilityIdentities` equal `capabilityRefsForContract`;
  a lock row or artifact with an empty graph claims no contract the register
  maps to a capability.
- **Recorded.** The value is internally established by what is recorded with
  it and bound by its digests. The register is not read.

`isResolvedProductLock` (`product/environment.ts`), `isVerifiedProductArtifact`
(`product/verify_product.ts`) and `isCapabilityDefinitionGraph`
(`shared/capability_contracts.ts`) keep their exported signatures, which ask
the strict question: the one-argument form is today's guard, unchanged, and the
published declarations do not change. An internal overload takes the question
as a trailing argument; any value other than `"recorded"` (a callback index
included) asks the strict one. No internal entry has a default question: an
owner whose question is a parameter of a module function requires it at every
call (`prepareRead` in `abg/project_read_ports.ts`, which throws on any value
other than the two literals; `RuntimeArtifactFacts.prepare` in
`abg/artifact_truth.ts`; `selectedCapabilityOwner` and
`constructInvocationCapabilityGrant` in `product/invocation.ts`). Each guard has one private body for both questions
(`productLockHolds`, `verifiedProductArtifactHolds`,
`capabilityDefinitionGraphHolds`). The owners that pass a question on name it
the same way: `admitGraphFunctionCatalog` (`product/catalog.ts`),
`reconstructHistoricalDeclarationCatalog` (`product/declaration_closure.ts`),
`projectWorkspaceStatus` (`product/project_read_ports.ts`),
`projectAdmittedWorkspaceBindingByInvocationRef`
(`abg/environment_admission.ts`), `constructCapabilityGrant` and
`validateCapabilityGrantForProductBasis` (`product/invocation.ts`). Both questions check everything the lock
guard checks without the register: the lock and row shape and descriptor
fields; the contribution manifest, its digest and the product, version,
descriptor, content digest, catalog id and digest and graph coordinate it
repeats; the graph asset path, media type and digest; the contract rows and the
contract, capability and declared-capability rosters; the flat owner
coordinates carrying the row's catalog (`lockRowGraphMatchesCatalog`); the
dependency edges re-derived from the rows and acyclic; and the lock digest and
id. The verified artifact adds that every owner coordinate of its graph is one
of its own contract or definition coordinates, its manifest graph coordinate,
its capability rosters and its verification digest.

Both questions check the graph relations that `constructCapabilityDefinitionGraph`
guarantees and that are stated over the graph alone
(`capabilityGraphRelationsHold`): the strict schema; rows unique and strictly
ordered by capability id; each row's definition digest and reference; every
dependency names a row of the same graph with that row's reference and digest,
dependencies are ordered by capability id and have no cycle; owners, effect
references and bounded proof references are ordered; one flat coordinate per
contract id; each operation-definition slot coordinate carries its operation's
flat catalog coordinate and flat row, a definition reference ending in its
slot's identity field, one definition reference per definition key, distinct
slots and the request, result and refusal slots; a row that owns one slot of a
definition key owns every slot of it; only flat and slot selectors; and the
graph digest. The strict question adds equality with the register's
construction, which implies them. The roster, each row's owning set and the
empty-graph rule read the register and belong to the strict question only.

The recorded graph binds owning contracts, not each contract's
`capabilityIdentities`. The recorded question adds
`recordedCapabilityIdentitiesHold` (`product/verify_product.ts`) for a lock row
and a verified artifact alike: every identity names a row of the carrier's own
graph, and a carrier with an empty graph has no contract with an identity. It
does not recompute the catalog digest from the carrier's contracts: the strict
question does not check that relation, and the fold accepts every lock a door
admitted. The catalog-digest relations the strict guard checks inside the
carrier are in the shared body and both questions check them: a lock row's
catalog id and digest equal its contribution manifest's (`productLockHolds`),
and every flat owner coordinate of the graph carries the carrier's catalog id
and digest (`lockRowGraphMatchesCatalog` for a lock row; for a verified
artifact, the owner-coordinate membership in `verifiedProductArtifactHolds`,
whose flat coordinates are built with the carrier's catalog digest). What binds
a recorded contract's identities is therefore that each names a row of the
carrier's own graph and that the lock digest, or the verification digest,
recomputes over the carrier. The recorded question does not detect identities
altered among the rows of the carrier's graph with every digest recomputed. A
door refuses such a value with the strict question; a read copy refuses it by
its binding to recorded history (below).

Everything the strict question accepts, the recorded question accepts. The two
bodies differ only where the strict question reads the register, and each such
strict relation implies the recorded one in its place: equality with the
register's construction implies `capabilityGraphRelationsHold`, which both
questions run; identities equal to `capabilityRefsForContract` name rows of a
non-empty graph that equals the construction, because a non-empty construction
has a row for every register capability; the strict empty-graph rule leaves no
identity on an empty-graph carrier; and `capabilityDefinitionGraphAssetBytes`
returns `serializeCapabilityDefinitionGraph` of a graph the strict guard
accepts. So the fold reads every store whose locks a door admitted.

| Entry | Question | Where it is set |
| --- | --- | --- |
| the artifact-truth fold advancing over recorded rows (`RuntimeArtifactFacts.advance`, `abg/artifact_truth.ts`) | recorded | `prepare(row, "recorded")` |
| the admission candidate (`prepareArtifactTruthCandidate`) | strict | `prepare(…, "strict", establishedLock)` |
| every admission door and constructor, the reader's own verification and install, catalog admission, run execution resolution, declaration application, run and admission grants, conformance, release qualification (`abg/qualification_proof.ts`, which reconstructs its proof Catalog before it reads), worksite forward, governance coverage and native work reacquisition | strict | the exported signatures |
| the read owner of `abg/project_read_ports.ts`: the Public run read (`prepareRunRead`), the owner read ports (`project`, behind `RunProjectionPort`, `GraphCallProjectionPort` and `ABG_PROJECT_READ_OWNER_PORTS`) and `projectRunTruthAtDurablePrefix`; a supplied historical declaration proof and the verified products of its Catalog | recorded | `prepareRead(…, "recorded")` at each entry; `prepareRunReadAtDurablePrefix` is exported and says so; `terminalDeclaration` passes `prepared.question` to `reconstructHistoricalDeclarationCatalog` (`product/declaration_closure.ts`), which passes it to `admitGraphFunctionCatalog` (`product/catalog.ts`) |
| the read owner's entries whose result feeds new work: a historical source for a new run (`projectHistoricalGraphCallSourceAtDurablePrefix`) and a closed terminal for worksite forward and native work reacquisition (`projectClosedGraphCallTerminalAtDurablePrefix`) | strict | `question: "strict"` at the entry |
| the run-read authority (`expectedRunReadAuthority` and the run-read kernel, `abg/project_read_definition_bindings.ts`) | recorded | `constructCapabilityGrant(…, "recorded")`, `validateCapabilityGrantForProductBasis(…, "recorded")` (`product/invocation.ts`) |
| `project.read#workspace_status` (`product/project_read_definition_bindings.ts`) | recorded | `WorkspaceProjectionPort.status(packet, "recorded")` (`product/project_read_ports.ts`) |
| the admitted authority of `project.read#ticket_consensus` (`admittedAuthorityBinding`) | recorded | `projectAdmittedWorkspaceBindingByInvocationRef(…, "recorded")` (`abg/environment_admission.ts`) |

A read that asks the recorded question of a caller-supplied copy binds the copy
to recorded history. `workspace_status` requires the packet's binding to be a
recorded admission (`hasAdmittedWorkspaceBinding`) and the packet's lock to
reproduce the lock digest that binding names; another lock is `not_ready`. A
read of the read owner requires the proof Catalog's lock, binding and installs
to equal the recorded environment's (`reconstructHistoricalDeclarationCatalog`)
and its basis digest, which covers the verified products, to equal the recorded
root basis's `catalogBasisDigest` (`terminalDeclaration`); otherwise the read
is `invalid_history`. Release qualification reconstructs its proof Catalog
under the strict question before it reads the terminal through the owner read
port, so a proof it accepts also passes the read; the recorded admission is a
second full Catalog admission of the same basis. A Catalog admitted under the
recorded question is retained apart from `readyCatalogs` and never enters
`ownedCatalogs`, so the owner fact `isAdmittedReadyGraphFunctionCatalog`, which
run execution trusts, covers strict admissions only.

A run read needs the recorded graph to declare the capability that the
reader's read operation names: `expectedRunReadAuthority`
(`abg/project_read_definition_bindings.ts`) constructs one grant per
`capabilityRefs` entry of the reader's own `project.read` definition and
selects its owner among the recorded installs' graphs
(`selectedCapabilityOwner`, `product/invocation.ts`).

The fold's `release.snapshot` branch (`RuntimeArtifactFacts.prepare`,
`abg/artifact_truth.ts`) asks the strict question of the Product truth its
qualification proof carries, at the fold and at the candidate alike. It
establishes the snapshot's environment through the fold itself:
`isReleaseOperationArtifact` (`implementation/release_publication.ts`) admits
the bound environment with `admitCapabilityEnvironment`
(`product/admission_authority.ts`), which projects artifact truth at the entry
prefix and the workspace environment with the `…InResolvedLock` forms, which
ask no guard again. It establishes the qualification proof through release
qualification: `projectReleaseQualification` and `projectReleaseAcceptance`
reach `projectQualificationVerdict` (`abg/qualification_proof.ts`), whose
`deriveGraphOwner` reconstructs the proof Catalog with the exported
`reconstructHistoricalDeclarationCatalog`, so the recorded environment lock and
the proof's verified products answer the strict question. The release door
shares that stack and its per-prefix derivation (`NativeProofDerivation`,
keyed by prefix and not by question). The branch also reads the reader's own
release operation contract: the snapshot's `capability_grants` slot must name
that contract's `metadata.capabilityRefs`, which the register projects at
module load, and `admitExactDefinitionCall` admits the recorded invocation
against that contract's definition.

Reading is not running. Every path that starts or continues work asks the
strict question and refuses what it refused before; a recorded value with every
digest recomputed grants no work.

## Requirement, function and realization mapping

| Requirement | Function and existing owner |
| --- | --- |
| REQ-P-PUBLIC-CONTRACTS-002A | NCC-F01 derives complete native declaration inventories and exact identities from the immutable payload; generator proposes, verifier checks. |
| REQ-P-PUBLIC-CONTRACTS-003/-004 | Advertised contract ID, native locator and named symbol remain; type/schema and capability meaning stay unchanged. Existing digest/supersession law governs new bytes; no frozen identity is restamped, vocabulary downgrade or duplicate DTO/schema substitutes. |
| REQ-P-POLICY-049 | Product verification admits only locally decidable same-Product meaning and preserves genuine external pending evidence. |
| REQ-P-POLICY-050 | Product resolution admits linked meaning or returns its existing typed refusal; installation and binding remain subsequent owners. |

The production territory is `product/declaration_exports.ts`,
`product/verify_product.ts` and `scripts/generate-product-manifest.mjs` in the
TypeScript tenant. Direct interface propagation stays within their existing
`NativeDeclarationClosureRequest`, private `NativeProductDeclarationEvidence`,
metadata-source validation, packed `PackageJsonView` and shared caller inputs.
Both local and linked hosts, evidence reconstruction and subordinate declaration
helpers consume that one metadata relation. No new checker, public operation,
resolver service, engine, Valibot Product or qualification-contract rewrite is
part of this function. A necessary production change beyond this territory
returns its owner seam before implementation.

## Native discriminator and proof boundary

Native01 supplies frozen red evidence: installed Public verification exposes
the catalog's Valibot selector; Public resolution refuses `unresolved` with a
null lock. The sunny discriminator is a newly identified exact ABI archive
that retains `abg.asset.qualification.rule-catalog` and its native
`./validator/QualificationRuleCatalog` locator, passes ordinary installed
Public verify and resolves the singleton ABI Product to a real non-null lock.
That package-owned reference is locally checked, not silently dropped.

A genuinely missing or unbound external reference still refuses resolution;
missing or substituted claimed bundle bytes cannot become local truth.
Focused source/structural checks cover the changed ownership seam, followed
by this installed composition. Broad namespace, conditional-form and
conservation qualification remains at D5. Tests arrange inputs and observe
actual owners; neither assertions nor a constructed lock substitute for the
Public results. This discriminator does not establish D1 application/UAT,
runtime liveness, integrated qualification or release acceptance.
