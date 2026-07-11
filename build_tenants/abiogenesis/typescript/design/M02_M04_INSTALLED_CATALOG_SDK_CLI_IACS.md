# M02-M04 Installed Catalog, SDK, And CLI IACS

**Ticket**: T-222
**Status**: Completed
**Date**: 2026-07-11
**Derived from**: `M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md`

## Purpose

Declare the irreducible carrier and authority boundary for the DS-1 installed
catalog steel thread. This IACS distinguishes publisher declaration, product
delivery, workspace selection, M03 runtime truth, public SDK projection, and
CLI binding so T-223 does not invent semantics in implementation.

## Boundary

Included:

- workspace create/open identity;
- detached product descriptor, contribution, artifact, and resolved lock;
- exact verification, installation, multi-product binding, and catalog admission;
- generic retained-kind list/describe and narrowing-only session view;
- GraphFunction invoke through M03;
- result/replay reads; and
- the 13-operation SDK plus `abg.cli` binding.

Excluded:

- node-type/overlay application;
- the complete operator loop and later public operations;
- lifecycle mutation, hosted services, signing, scheduling, and hostile-local
  defense; and
- any new runtime, event, continuation, or closure authority.

## Upstream Authoritative Carriers Consumed Unchanged

| Carrier | Owner | Use in DS-1 |
| --- | --- | --- |
| `GraphFunction` | M01 GTL | sole callable declaration identity |
| `Module` | M02 GTL | canonical serialized contribution payload |
| `ModuleLookupAuthority` | M02 GTL | resolves opaque GraphFunction declaration within Module |
| `GtlLibraryEntryDeclaration` | M02 GTL | declaration carrier consumed by M03 registry admission |
| `ProductRegistryStartupConfig` | M02/product declaration | one config per product batch; the singular startup wrapper is not reused as the multi-product boundary |
| `materializeNodeType` | M01 GTL | enforces effect-free identity materialization for GraphFunction-shaped node types |
| `RegistryAdmissionEvent` | M03 | accepted/rejected catalog row truth |
| `RuntimeRegistryProjection` | M03 | replay-derived registry truth |
| `RegistryLookupResult` | M03 | deterministic request eligibility |
| `GraphFunctionSelectedEvent` | M03 | traversal-affecting selection truth |
| `EngineStartRequest`, `ExecutionBasis`, `GraphCall`, runtime event/result carriers | M03 | existing input assembly target plus execution and closure truth |
| `EnginePluginCapabilities` | M03 | sole plugin-capability carrier crossing into the runner |
| `runEngineStartAsync` and public outcome carriers | M03 plus M04 projection | existing start-to-iterate execution and public outcome meaning after catalog invocation assembly |
| `RuntimeEventLogSink` | M03 events | sole event persistence boundary |
| `LiveCapabilityBinding` | M04 | existing operator capability/provenance wrapper; only its admitted M03 capability member crosses the boundary |

## Irreducible Architectural Carrier Set

### New prime carrier families

1. `WorkspaceManifest`
2. `ProductToolchainManifest`
3. `PublicContractCatalog`
4. `CatalogProductDescriptor`
5. `CatalogContributionManifest`
6. `ResolvedProductLock`
7. `VerifiedProductArtifact`
8. `InstalledProductRecord`
9. `ToolchainWorkspaceBindingV3`
10. `BoundCatalogAdmissionBatch`
11. `CatalogAdmissionResult`
12. `AdmittedRuntimeCatalogBasis`
13. `RuntimeCatalogProjection`
14. `CatalogAssetAdmissionEvent`
15. `RuntimeRegistryProjection` (existing subprojection)
16. `RegistrySessionView`
17. `WorkspaceCatalogProjection`
18. `PublicSessionCatalogView`
19. `CatalogInvocationAssembly`
20. `PublicOperationInvocationEnvelope`
21. `HostInvocationDescriptor`
22. `PublicOperationOutcome`
23. `PublicSdkExecutionContext`
24. `AdmittedWorkspaceReplay`
25. `PublicResultProjection`
26. `PublicReplayProjection`

`PublicContractRow`, its native/asset locators, `PublicCatalogRow`,
`PublicCatalogDescription`, per-row admission disposition,
compatibility result, and operation-specific request/refusal shapes remain
subordinate members of these families.

## Authority And Role Matrix

| Carrier | Owner | Producer / admission | Effects | Consumers / visibility |
| --- | --- | --- | --- | --- |
| `WorkspaceManifest` | M04 | `workspace.create`; admitted by `workspace.open` | one manifest write on create | public SDK/CLI, binding |
| `ProductToolchainManifest` | product publisher/release build, admitted by M04 | canonical product-root bootstrap inside supplied artifact | installed unchanged with product payload | verifier, installed record, workspace binding |
| `PublicContractCatalog` | product publisher/release build, admitted by M04 | digest-closed object inside product manifest | installed unchanged with manifest | verifier, SDK contract resolution, tenant conformance |
| `CatalogProductDescriptor` | publisher, admitted by M04 | canonical detached JSON admission | none | resolver, verifier, install record, catalog reads |
| `CatalogContributionManifest` | publisher, admitted by M04/M02 | detached JSON plus Module locator admission | none | verifier, M02 Module admission, M03 catalog admission |
| `ResolvedProductLock` | M04 resolver | pure exact dependency resolution | none | verify, install, bind, catalog projection |
| `VerifiedProductArtifact` | M04 verifier | archive and sidecar verification | temporary read/extract only | installer |
| `InstalledProductRecord` | M04 installer | exact verified artifact materialization | immutable product and record writes | workspace binding, verification reads |
| `ToolchainWorkspaceBindingV3` | M04 | explicit `catalog.bind` admission/write | binding plus bound mutable-root creation | catalog admission, all installed operations |
| `BoundCatalogAdmissionBatch` | M03 ingress, assembled from M04 exact facts | one system batch plus ordered config-scoped product batches | none by itself | `admitBoundWorkspaceCatalog` |
| `CatalogAdmissionResult` | M03 | projection-threaded union-row admission over the bound batch | canonical registry or opaque-asset catalog events only | admitted basis, diagnostics, M04 public projection |
| `CatalogAssetAdmissionEvent` | M03 | exact `catalog_asset_admitted | catalog_asset_rejected` family over an opaque asset declaration | canonical append through `RuntimeEventLogSink` | runtime-catalog projection, diagnostics, published event contract |
| `AdmittedRuntimeCatalogBasis` | M03 | successful required-row admission plus replay-verifiable projection identity | none | runner, registry session view, execution bindings |
| `RuntimeCatalogProjection` | M03 | replay over registry and opaque-asset catalog admission events | none | admitted basis, session view, M04 downstream projection |
| `RegistrySessionView` | M03 projection | pure narrowing over admitted runtime catalog projection | none | selection and M04 public view |
| `WorkspaceCatalogProjection` | M04 downstream projection | pure join over M04 binding/records/contributions and M03 runtime-catalog projection | none | list, describe, public allow view |
| `PublicSessionCatalogView` | M04 downstream projection | joins exact workspace/product refs onto `RegistrySessionView` | none | SDK/CLI/host descriptor |
| `CatalogExecutionBinding` | M03 | derived from admitted Module locator, selected handle, and exact catalog state | none | M03 invocation only, private; not a Job or basis constructor |
| `CatalogInvocationAssembly` | M03 | admits host descriptor/input and joins Module/target, bound ABG runtime-system profile, M03 plugin capabilities, replay, and the existing engine-start request | none by itself | `invokeAdmittedCatalogGraphFunction`; `runEngineStartAsync` remains sole Job/basis constructor and derives default instruction startup from the admitted catalog entry after that one basis admission |
| `PublicOperationInvocationEnvelope<K>` | M04 SDK | exact operation schema admission | none by itself | operation handler, CLI/host adapters |
| `HostInvocationDescriptor` | M04 SDK, admitted by M03 | internally derived specialization for invoke/start from an admitted generic envelope plus exact bound/session truth | none by itself | M03 invocation; never caller- or CLI-assembled authority |
| `PublicOperationOutcome<K>` | owning operation module | accepted or refused result constructor | reflects operation effects only | SDK/CLI/host adapters |
| `PublicSdkExecutionContext` | M04 effect boundary | native caller or CLI supplies one exact `workspace_path | product_intake | workspace_binding | bound_workspace` arm | only the arm-specific filesystem/transport effects invoked by an admitted operation | SDK handlers; never serialized product or runtime truth |
| `AdmittedWorkspaceReplay` | M03 | admits M04-supplied `WorkspaceRuntimeEventBytes`, canonicalizes events, and orders by ordinal | none; M04 owns the preceding filesystem read | M03 result/replay projections |
| `PublicResultProjection` | M03 projection | replay-derived result query | none | SDK/CLI/host adapters |
| `PublicReplayProjection` | M03 projection | canonical ordered event query | none | SDK/CLI/host adapters |

The two new M03 effect ingresses are fixed by design:

- `admitBoundWorkspaceCatalog(input, eventSink)` owns projection-threaded
  multi-product admission; it delegates only the `runtime_library_entry` arm to
  `admitGtlLibraryEntryDeclaration` and admits the `opaque_catalog_asset` arm
  through the exact catalog-asset event contract;
- `invokeAdmittedCatalogGraphFunction(assembly, eventSink)` consumes an already
  admitted catalog basis, emits lookup/selection, and enters the existing
  start-to-iterate runner without startup re-admission.

One M04 read effect is also fixed by design:

- `readWorkspaceRuntimeEvents(binding)` owns path resolution and filesystem
  reads and returns subordinate `WorkspaceRuntimeEventBytes`; M03 then admits
  and orders those bytes into `AdmittedWorkspaceReplay`.

The M04 capability edge is `composeOperatorCapabilities(context, descriptor)`.
It resolves only requested ABG-standard factories from
`PublicSdkExecutionContext`, admits steering, and produces the existing
`LiveCapabilityBinding` or a typed preflight refusal before GraphCall. M04 keeps
the wrapper/provenance; only the admitted `EnginePluginCapabilities` member and
provenance refs enter M03.

These are effect functions over the prime carriers above, not new truth stores
or controller carriers.

## Subordinate Payload Register

| Payload | Parent | Admission rule | Why subordinate |
| --- | --- | --- | --- |
| `WorkspaceIdentity` | `WorkspaceManifest` | minted once and persisted | no independent mutable truth |
| `PublicContractRow` | `PublicContractCatalog` | stable id/version/digest/authority/capability row | catalog member |
| `AbgRuntimeSystemProfile` | `ProductToolchainManifest` | exact runtime identity, resolved policy identity, standard plugin refs, and profile digest; ABG product only | bound invocation bootstrap, not independent runtime truth |
| `NativeContractLocator` | `PublicContractRow` | exact package export and named symbol | locator detail |
| `CanonicalAssetLocator` | `PublicContractRow` | product-relative path/schema/media/digest | locator detail |
| `ProductRequirement` | `ResolvedProductLock` | closed identity/range/capability input | request row only |
| `ResolvedDependencyEdge` | `ResolvedProductLock` | exact selected identities, no ambient fallback | lock member |
| `SuppliedProductArtifact` | verification request | absolute archive and sidecar refs plus expected digests | untrusted ingress, not verified truth |
| `ProductVerificationCheck` | `VerifiedProductArtifact` | one typed check per identity/digest/compatibility field | result detail |
| `ToolchainProductBindingV3` | `ToolchainWorkspaceBindingV3` | exact installed record and lock membership | bound product row |
| `CatalogContributionRow` | `CatalogContributionManifest` | exact closed declaration-locator union and public kind | publisher row, not runtime truth |
| `CatalogAdmissionDeclaration` | `BoundCatalogAdmissionBatch` | closed `runtime_library_entry | opaque_catalog_asset` union | admission input row; only first arm enters GraphFunction registry |
| `OpaqueCatalogAssetDeclaration` | `CatalogAdmissionDeclaration` | exact workspace/binding/catalog, handle/declaration, owner/version/product/lock, locator/schema/digest, readiness/policy/provenance and causation fields | complete opaque union arm, not just a locator |
| `ModuleDeclarationLocator` | `CatalogContributionRow` | Module asset plus opaque GraphFunction/node-type ref | publication locator |
| `OpaqueOverlayAssetLocator` | `CatalogContributionRow` | canonical generic overlay metadata only | identity/visibility locator; no application law or fabricated GraphFunction refs |
| `OpaqueCatalogAssetProjection` | `RuntimeCatalogProjection` | replay-derived admitted overlay identity/provenance/non-callability | catalog-only row outside runtime GraphFunction registry |
| `RejectedOpaqueCatalogAssetProjection` | `RuntimeCatalogProjection` | replay-derived source identity, closed rejection reason, conflicts, and source event refs | rejected catalog-only row |
| `WorkspaceRuntimeEventBytes` | workspace event-reader effect | bytes plus bound path and binding identity; no event interpretation | foreign ingress consumed by M03 admission |
| `CatalogRowDisposition` | `CatalogAdmissionResult` | M03 accepted/rejected/blocked classification | per-row result |
| `PublicCatalogRow` | `WorkspaceCatalogProjection` | joined downstream projection only | list row |
| `PublicCatalogDescription` | `WorkspaceCatalogProjection` | one exact handle from projection | describe result |
| `CatalogReadinessDecision` | `AdmittedRuntimeCatalogBasis` | admitted + coherent + compatible + prerequisites | M03-derived row consumed by the M04 public projection |
| `CatalogEligibilityDecision` | `RegistrySessionView`/lookup | visible + input/interface/capability/proof/policy match | request-local field |
| operation-specific request/result/refusal | `PublicOperationOutcome<K>` | exact catalog-located schema | discriminated family member |
| CLI parsed flags | `PublicOperationInvocationEnvelope<K>` | adapter resolves paths then SDK admission | adapter-local input only |

No subordinate payload may be promoted without independent persisted/public
authority, a second unchanged consumer boundary, and an update to this IACS.

## Product State Transition Matrix

| From | Operation | To | Required check | Forbidden shortcut |
| --- | --- | --- | --- | --- |
| requirements | `catalog.resolve` | resolved lock | exact candidate set, dependency, compatibility, cycle/ambiguity | ambient package or workspace selection |
| resolved | `catalog.verify` | verified artifact | distribution/payload/manifest/descriptor/contribution/lock coherence | install, bind, or admit on partial checks |
| verified | `install.install` | installed record | exact immutable destination and conflict check | workspace binding side effect |
| workspace + installed set | `catalog.bind` | binding v3 | exact lock membership and installed-record equality | implicit install or admission |
| bound | `catalog.admit` | catalog admission result | M02 declaration/asset admission then M03 union catalog admission | static inventory as catalog truth |
| admitted | runtime-catalog projection | ready row | compatibility and declared prerequisites satisfied | presence as readiness |
| ready | `catalog.allow` | registry and public session views | intersection only | widening or fallback to unrestricted |
| session-visible | M03 lookup | eligible row | identity/interface/input/capability/proof/policy match | adapter choice or display name |
| eligible GraphFunction | `catalog.invoke` | public-operation attribution, selected GraphFunction, and GraphCall | M03 `public_operation_admitted` then selection before GraphCall | non-GraphFunction call, caller-supplied host basis, or direct runner call |

## Public Operation Carrier Matrix

Every row uses `PublicOperationInvocationEnvelope<K>` and exact request,
accepted-result, refusal, and adapter-exit schemas.
The normative 13-operation register is
`M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md`; the summary
below does not replace its required fields, defaults, actors, domains, effects,
dispositions, schema paths, or exits.

| Operation | Prime request focus | Accepted result | Closed refusal family | Effect owner |
| --- | --- | --- | --- | --- |
| workspace.create | target, authority mode, no-scaffold declaration | `WorkspaceManifest` | invalid target, exists/conflict, filesystem failure | M04 |
| workspace.open | target and expected schema | admitted workspace state | missing, malformed, stale, incompatible | M04 read |
| catalog.resolve | product requirements and supplied candidate descriptors | `ResolvedProductLock` | unresolved, incompatible, ambiguous, cyclic | M04 pure |
| catalog.verify | artifact, descriptor, contribution, lock, expected identity | `VerifiedProductArtifact` | content, identity, descriptor, contribution, lock, compatibility, contract mismatch | M04 read/temp |
| install.install | verified artifact and toolchain root | `InstalledProductRecord` | unverified, identity conflict, materialization failure | M04 filesystem |
| catalog.bind | workspace, installed records, lock, mutable roots | binding v3 | unready workspace, missing install, lock mismatch, binding conflict | M04 filesystem |
| catalog.admit | binding, lock, bound sidecars | `CatalogAdmissionResult` | unbound, mismatch, malformed declaration plus row dispositions | M03 events |
| catalog.list | workspace catalog and optional view | public rows | catalog missing/stale/view mismatch | M04 read model |
| catalog.describe | exact handle and optional view | public description | unknown, ambiguous, hidden, stale | M04 read model |
| catalog.allow | catalog and allowlist | `PublicSessionCatalogView` | duplicate, unknown, unauthorized, inadmissible, unready | M03 runtime-catalog view plus M04 wrapper |
| catalog.invoke | generic envelope plus `CatalogInvokeRequest`; SDK derives and separately admits `HostInvocationDescriptor` | GraphCall/run/result-or-stop/replay refs | disallowed, non-callable, unready, interface/input/capability/preflight/runtime block | M03 runtime |
| read.result | result or GraphCall identity | `PublicResultProjection` | unknown, stale basis, malformed replay | M03 read |
| read.replay | workspace/run/GraphCall identity and explicit range | `PublicReplayProjection` | unknown, invalid range, corrupt/unorderable replay | M03 read |

## Contract Catalog Row And Locator Matrix

The `abg-5-ds1` profile publishes:

| Row class | Mandatory DS-1 content |
| --- | --- |
| native groups | all nine native `REQ-P-PUBLIC-CONTRACTS-005` group identities, exact package export/declaration inventories, and the inventory schema |
| manifest/catalog | product toolchain manifest and public contract catalog schemas |
| GTL publication | GraphFunction and Module schemas plus native admit/serialize symbol pairs |
| product intake | descriptor, contribution, resolved lock, workspace manifest/binding schemas |
| install | install and TypeScript installer manifest schemas/native symbols |
| catalog | catalog admission and public row/description/session-view schemas |
| invocation | public operation-definition, capability-definition, generic operation-envelope, and host invocation-descriptor schemas |
| runtime reads | canonical runtime event, result, replay, and closed-vocabulary schemas plus the event-kind vocabulary |
| operations | exact request/result/refusal/envelope rows for the 13 DS-1 identities |
| capabilities | only the seven DS-1 capabilities mapped in the public operation register |

Every asset locator is product-root-relative and digest-bound. Every native row
names package export and symbol. No test-only file is a published locator.

## Fail-Closed And Mixed-State Rules

1. Descriptor, contribution, lock, artifact, manifest, install, binding, and
   catalog identities are compared independently; no generic `digest` field
   substitutes for another.
2. Schema-v2 binding is stale/incompatible on the DS-1 SDK path.
3. Source paths and executable workspace runtime bindings are not product or
   contribution locators.
4. Missing or malformed product contract catalog blocks ABG product binding.
5. Installed is not bound; bound is not admitted; admitted is not ready;
   visible is not eligible; eligible non-GraphFunction is not callable.
6. Catalog read models derive from M03 admission events. Persisted read caches,
   contribution files, and CLI memory do not outrank replay.
7. Allowlists are duplicate-free intersections and never create readiness.
8. `GraphFunction.name` is display metadata. Canonical opaque identity and
   contribution handle own lookup.
9. CLI and SDK must return the same operation identity, defaults, typed
   disposition, result/refusal, and exit classification.
10. Deterministic product, binding, catalog, input, and capability failure is
    preflight/admission truth and consumes no F_P retry.
11. A partial DS-1 contract catalog cannot claim complete 5.0 operator or
    release capability.
12. Serialized identities use RFC 8785 JCS. T-223 admits I-JSON before the
    existing exported `stableJson`/`stableSha256Digest` API and pins that API to
    the RFC conformance vectors; a failed vector is corrected behind the same
    API. Versions/ranges use standard SemVer admission over the supplied
    candidate set only.
13. Only `graph_function`, `node_type`, and `overlay` enter the public catalog;
    internal registry kinds never leak through generic storage reuse.
14. `runtimeRegistryStartup` and `runtimeCatalogBasis` are mutually exclusive;
    the DS-1 invoke path consumes the admitted basis and emits no duplicate
    registry admissions.
15. M04 joined catalog/read projections consume M03 truth; M03 never imports or
    depends on M04 workspace/binding projection types.
16. Opaque overlay assets never populate `graphFunctionRef`, interface, or
    source/target contract fields; only GraphFunction-backed rows enter the
    runtime registry.
17. A node-type row passes `materializeNodeType`, has no effects, and preserves
    one node contract through identity materialization before admission.
18. Every host descriptor contains a non-null effective session-view identity;
    SDK calls reconstruct the view from a full carrier or canonical allowlist.
19. `catalog_asset_admitted` and `catalog_asset_rejected` are workspace-scoped
    members of `RuntimeEvent`, its value roster, admission table, published
    schema, and event-kind catalog row; their projection fold is ordinal and
    includes rejected rows.

## T-223 Proof Obligations

- Type-level exhaustiveness over operation/request/outcome maps and product states.
- Canonical raw admission and round-trip tests for every new schema.
- Non-circular digest and product-relative locator differentials.
- RFC 8785/I-JSON conformance vectors through the one exported digest API.
- Exact resolve/verify/install/bind/admit state-transition tests.
- Generic retained-kind list/describe with node/overlay non-callability.
- Narrowing-only allowlist, including empty view and widening refusal.
- M03 selection-event-before-GraphCall proof.
- Multi-product admission threads one projection across system and product
  batches; cross-product conflicts cannot reset between batches.
- Opaque overlay admission/rejection events pass the runtime-event census,
  workspace-scope, admission, ordinal-fold, and replay round trip.
- Already-admitted invocation emits no duplicate admission event.
- Catalog invocation assembly proves Module/selected-target, input,
  runtime-profile, policy, capability, replay, and existing engine-request
  completeness while `runEngineStartAsync` remains the sole
  GraphFunction/Job/ExecutionBasis constructor.
- SDK/CLI equivalent deterministic Hello World, result, and replay.
- Packed installed source-isolation proof with no `cli-runtime.mjs` or private import.
- Typed missing-capability preflight and malformed input refusal.
- One preflighted live F_P Hello World through the same public path.

## Promotion Rule

T-222 closes only when the design leaves every prime carrier with one owner,
producer, admission path, effect boundary, consumer, and negative proof. T-223
may change field spelling while implementing only if the same semantic carrier
and identity law remain intact and the design is updated before code claims
closure.
