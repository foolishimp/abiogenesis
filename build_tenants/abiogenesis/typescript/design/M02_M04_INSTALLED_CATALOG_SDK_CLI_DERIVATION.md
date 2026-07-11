# M02-M04 Installed Catalog, SDK, And CLI Derivation

**Ticket**: T-222
**Status**: Completed
**Date**: 2026-07-11
**Change class**: `design_reframe`
**Re-entry**: `build_tenants/common/design/modules/M04-app-bootstrap.yml`

## Source Authority

This design derives from:

- `specification/PRODUCT.md`
- `specification/requirements/product/REQ-P-CATALOG.md`
- `specification/requirements/product/REQ-P-INSTALL.md`
- `specification/requirements/product/REQ-P-POLICY.md`
- `specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/gtl/REQ-L-GTL3-MODULE.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-IDENTITY.md`
- `specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md`
- `specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md`
- `build_tenants/common/design/modules/M02-work-publication.yml`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md`
- `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md`
- `M04_TYPESCRIPT_INSTALLER_DERIVATION.md`
- `M04_PUBLIC_START_DERIVATION.md`
- `M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md`

## Position And Bounded Scope

DS-1 adds one installed, source-blind route to existing runtime authority. It
does not add another loader, registry, event store, traversal loop, or worker
dispatcher.

The boundary is:

```text
detached product metadata + immutable artifact
  -> exact resolution and verification
  -> product-only installation
  -> explicit workspace binding
  -> M03 catalog admission and replay projection
  -> public list/describe and narrowing-only session view
  -> M03 GraphFunction selection and start/iterate
  -> public result and replay projections
```

M02 continues to own serialized `Module` and `GraphFunction` publication.
M03 continues to own catalog admission, readiness, eligibility, selection,
GraphCall, traversal, event, result, replay, continuation, retry, and closure
truth. M04 owns product intake, verification, installation, workspace identity
and binding, the public SDK envelope, and thin CLI effect adapters.

The supported environment is one trusted developer desktop. Digests establish
identity and coherence. This design does not add signing, hostile filesystem
defense, hosted discovery, update/uninstall lifecycle, or multi-user policy.

## Existing Surface Reuse Map

| Concern | Existing authority/carrier | Disposition |
| --- | --- | --- |
| GTL publication | `Module`, `admitModule`, `serializeModule`, `ModuleLookupAuthority`, `resolvePublishedGraphFunction` in M02 | Reuse. A contribution locates one canonical serialized Module. No second module format or raw callable file is admitted. |
| GraphFunction serialization | `GraphFunction`, `admitGraphFunction`, `serializeGraphFunction` in M01 | Reuse through the Module publication. Catalog handles bind opaque declaration identity, not display name. |
| Product library declaration | `GtlLibraryEntryDeclaration`, `ProductRegistryStartupConfig` in M02 | Reuse the row/config carriers. The singular startup wrapper is not the multi-product contract; `BoundCatalogAdmissionBatch` carries one config-scoped declaration batch per bound product. |
| Catalog admission | `admitGtlLibraryEntryDeclaration`, `projectRuntimeGraphFunctionRegistry`, and registry admission events in M03 | Reuse for GraphFunction-backed rows. `CatalogAdmissionDeclaration` is the closed union that keeps opaque catalog assets out of the GraphFunction registry; `admitBoundWorkspaceCatalog` threads one `RuntimeCatalogProjection` across system declarations and every ordered product batch and appends canonical events through `RuntimeEventLogSink`. |
| Catalog projection | `projectRuntimeGraphFunctionRegistry` | Reuse as the GraphFunction-backed subprojection. New M03 `RuntimeCatalogProjection` also carries admitted opaque catalog assets. The M04 public read model is a pure join over that replay projection and immutable product/binding facts. |
| Lookup and selection | `constructRegistryLookupRequest`, `lookupRuntimeGraphFunctionRegistry`, `selectGraphFunctionFromRegistry` | Reuse. Only M03 may turn an eligible GraphFunction into selection truth. |
| Runtime | `runEngineStartAsync` and the M03 start-to-iterate runner | Reuse the runner and public outcome meaning. `invokeAdmittedCatalogGraphFunction` assembles an admitted catalog invocation, performs lookup/selection, and delegates to that runner. M04 does not sequence selection, loop, or advance. |
| Event truth | canonical runtime event admission, ordinal ordering, and `RuntimeEventLogSink` | Reuse as the only mutable runtime truth. New M04 `WorkspaceRuntimeEventReader` resolves the bound file path, then delegates event admission and ordering to M03. CLI-local JSONL parsing is retired. |
| Product layout | versioned shared-toolchain product root and workspace binding | Extend and version. Product manifests become product-relative and contract-catalog-bearing; workspace binding becomes exact multi-product truth. |
| Installer effects | command/docs/standards delivery patterns and topology verification | Reuse bounded effect patterns only. Add a generic verified-product materializer plus an ABG npm-package adapter; the current source-root and adjacent-dependency extractor is not reusable catalog-product intake. |
| Session narrowing | current CLI `narrowRegistryStartupToSessionAllowlist` law | Move into the SDK/M03 catalog boundary. CLI only parses allowlist input. |
| CLI | parser and typed exit/render patterns in `runAbiogenesisCli` | Reuse delivery patterns. New `abg.cli` delegates every DS-1 operation to the SDK and does not load executable workspace runtime bindings. |

## DS-1 Public Operation Target Map

DS-1 publishes exactly these operation rows. Later rows remain absent until
their owning phase supplies an exact contract.

| Operation identity | Owner | Effect class | DS-1 result |
| --- | --- | --- | --- |
| `abg.operation.workspace.create` | M04 | workspace manifest write only | workspace identity and explicit authority/scaffold state |
| `abg.operation.workspace.open` | M04 | pure read | admitted workspace state and readiness/staleness disposition |
| `abg.operation.catalog.resolve` | M04 | pure | immutable resolved product lock |
| `abg.operation.catalog.verify` | M04 | artifact read and temporary extraction only | verified product artifact or typed refusal |
| `abg.operation.install.install` | M04 | immutable toolchain product and verification-record writes | installed product record and provenance |
| `abg.operation.catalog.bind` | M04 | workspace binding and bound mutable-root initialization | exact workspace binding identity |
| `abg.operation.catalog.admit` | M03 through M04 SDK | canonical registry-entry or catalog-asset admission events | catalog identity and row dispositions |
| `abg.operation.catalog.list` | M04 joined projection over M03 truth | pure read | generic public catalog rows |
| `abg.operation.catalog.describe` | M04 joined projection over M03 truth | pure read | one generic public catalog description |
| `abg.operation.catalog.allow` | M04 public view over M03 runtime-catalog view | pure derivation | narrowing-only public session catalog view |
| `abg.operation.catalog.invoke` | M03 through SDK | GraphFunction selection and ordinary runtime effects | GraphCall/run/result-or-stop/replay refs |
| `abg.operation.read.result` | M03 projection through M04 bound reader | pure read | typed result projection |
| `abg.operation.read.replay` | M03 projection through M04 bound reader | pure read | typed ordered replay projection |

`start`, `resume`, F_H, gaps/actions, witness, observer/tuner, conformance,
configuration, and release operations remain owned by their later phases. DS-1
does not claim `abg.capability.operator.public-contract@5`.

Every DS-1 operation row locates one exact request, result, refusal, and generic
`PublicOperationInvocationEnvelope` schema. `HostInvocationDescriptor` is the
strict specialization used only by `catalog.invoke` here and by `run.start`
later. This preserves the general per-operation invocation requirement without
mislabeling every product operation as a runtime host invocation.
The exact fields, defaults, actor rules, closed domains, schema ids/paths,
effects, dispositions, and adapter exit classes are fixed in
`M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md`.

## Identity And Digest Model

The design keeps three content identities separate:

1. `distributionArtifactDigest` hashes the exact supplied archive bytes.
2. `productContentDigest` hashes the installed immutable payload inventory,
   excluding `product-toolchain-manifest.json` and mutable state.
3. `productManifestDigest` hashes the final canonical manifest and is stored in
   install/workspace binding truth outside that manifest.

All serialized identity carriers use RFC 8785 JCS UTF-8 bytes and
`sha256:<64 lowercase hexadecimal characters>`. T-223 adds I-JSON admission
ahead of the existing exported `stableJson`/`stableSha256Digest` API and proves
that implementation against the RFC 8785 conformance vectors, including number
formatting, UTF-16 property ordering, invalid Unicode scalar values, non-finite
numbers, duplicate raw object names, and unsupported values. If the existing
implementation fails a vector, it is corrected behind that one API; no second
digest law is introduced. Each carrier that stores its own digest omits only
that field from its digest basis. Product versions are valid SemVer.
Compatibility constraints are canonical SemVer ranges admitted and evaluated
by the standard `semver` parser; prerelease compatibility must be explicit in
the range. A range never performs package discovery or selection outside the
supplied candidate set.

The publisher descriptor, contribution manifest, and resolver-created lock are
detached sidecars. They are supplied beside the artifact, verified before
installation, and copied to an immutable toolchain verification-record root
outside the product payload:

```text
<toolchainRoot>/records/<publisher>/<product>/<version>/<artifactDigest>/
  product-descriptor.json
  contribution-manifest.json
  resolved-product-lock.json
  verification-result.json
```

The installed product payload remains:

```text
<toolchainRoot>/products/<product>/<version>/
  product-toolchain-manifest.json
  ... immutable payload ...
```

This prevents descriptor/artifact and manifest/self-digest cycles. The
descriptor binds the distribution and product-content digests. The
contribution manifest binds the descriptor, artifact, Module assets, and
contribution rows. The resolved lock binds exact descriptors, contributions,
artifacts, compatibility results, and dependency edges. The final workspace
binding binds the lock, installed records, product manifests, and public
contract catalogs.

Product manifest asset locators are product-root-relative. Workspace binding
paths may be resolved absolute local paths because the binding identifies one
installed desktop instance; their referenced manifest locators remain
product-relative.

## Publication And Contribution Contract

`CatalogProductDescriptor` carries:

- schema version, publisher namespace, product and package identity/version;
- distribution artifact and product content digests;
- contribution-manifest identity/digest;
- dependency requirements and ABG compatibility predicate;
- declared contract/capability summary; and
- provenance reference.

The ABG product's `ProductToolchainManifest` also carries one
`AbgRuntimeSystemProfile`. It binds the exact runtime-identity input, resolved
policy identity, standard plugin refs, and profile digest used by public
catalog invocation. Verification and workspace binding preserve that profile
identity. A catalog product cannot publish or override it.

`CatalogContributionManifest` carries exact contribution rows. Each row carries:

- canonical opaque handle and public kind;
- owning descriptor and product identity;
- declaration identity and contract/interface identities;
- one canonical declaration locator, schema identity, and digest;
- readiness, proof, policy, capability, and provenance refs; and
- optional refinement/override refs.

The public kinds in DS-1 are `graph_function`, `node_type`, and `overlay`.
`node_type` may use a GraphFunction-shaped identity realization, but its catalog
kind remains non-callable. An overlay remains program composition truth. A
contribution cannot locate publisher executable source, a plugin factory, a
runtime binding module, a worker launcher, an event sink, or a controller.

The declaration locator is a closed union:

- `module_declaration` for `graph_function` and GraphFunction-shaped
  `node_type`, carrying one serialized Module asset and opaque declaration ref;
- `opaque_overlay_asset` for `overlay`, carrying one canonical
  `abg.schema.catalog-overlay-declaration` asset. DS-1 admits only identity,
  contract, provenance, and non-callability from this asset. T-179 owns later
  application meaning.

The existing M02/M03 internal registry vocabulary may retain its other kinds.
Product contribution admission exposes only the three public kinds above;
`candidate_family`, `public_start`, and `plugin` rows remain internal and cannot
enter the public catalog merely because the underlying runtime registry can
store them.

During catalog admission M02 admits Module-located declarations. A `node_type`
row additionally passes existing `materializeNodeType`: its GraphFunction has
no effects and its input/output/environment preserve one node contract through
identity materialization. Generic overlay metadata admission validates opaque
overlay rows without inventing GraphFunction/interface/source/target refs.

`CatalogAdmissionDeclaration` is therefore:

- `runtime_library_entry`, containing one `GtlLibraryEntryDeclaration`, only
  for `graph_function` or validated GraphFunction-shaped `node_type`; or
- `opaque_catalog_asset`, containing one admitted overlay declaration and no
  callable or GraphFunction fields.

`OpaqueCatalogAssetDeclaration` is a closed carrier with:

- `kind: "opaque_catalog_asset_declaration"`, `workspaceId`, `bindingId`,
  `catalogId`, canonical `entryRef`, `declarationRef`, and declaration digest;
- `libraryScope`, literal `assetKind: "overlay"`, namespace, owner, version,
  descriptor ref, contribution-manifest ref, and resolved-lock ref;
- product-relative asset path, exact schema id/version/digest, and asset digest;
- authority, provenance, readiness, proof, and policy refs; and
- nullable refinement/override refs plus causation/correlation identity.

Its exact event family is:

- `catalog_asset_admitted`, carrying the complete admitted declaration identity
  above plus `sourceEventRefs`; and
- `catalog_asset_rejected`, carrying the same workspace/catalog/product/source
  identity, rejection reason, and conflicting entry refs.

The closed rejection domain contains `malformed_asset`,
`unsupported_asset_kind`, `scope_mismatch`, `identity_conflict`,
`descriptor_mismatch`, `lock_mismatch`, `readiness_invalid`, and
`duplicate_handle`. Both kinds are workspace-scoped entries in `RuntimeEvent`,
`RUNTIME_EVENT_KIND_VALUES`, canonical event admission, runtime-support scope,
the published event-kind roster, and runtime-event schema.
`RuntimeCatalogProjection` folds admitted/rejected events in ordinal order into
`opaqueAssetEntries`, `rejectedOpaqueAssetEntries`, and `sourceEventRefs`; it
derives its projection ref from the full folded content. No static contribution
file or M04 cache substitutes for these events.

Only the first arm enters `admitGtlLibraryEntryDeclaration` and
`RuntimeRegistryProjection`. The second emits canonical M03 catalog-asset
admission/rejection truth and enters the opaque-asset arm of
`RuntimeCatalogProjection`. M03 derives one internal
`CatalogExecutionBinding` for an admitted `graph_function`. That binding joins
the exact workspace/catalog/product identities to the admitted Module and
GraphFunction needed by the existing execution-basis path. It is not public
catalog data and grants no authority until M03 selection admits the invocation.

`BoundCatalogAdmissionBatch` carries the exact binding/lock/catalog identity,
the ABG system declarations, and an ordered array of product batches. Each
product batch carries exactly one `ProductRegistryStartupConfig` plus only the
union declarations matching its namespace, owner, and version. The order is
the resolved-lock order. `admitBoundWorkspaceCatalog` threads one
`RuntimeCatalogProjection`, including its runtime-registry and opaque-asset
arms, across the system batch and every product batch so cross-product
identity/shadow conflicts cannot reset or disappear. It appends the canonical
admission/rejection events and produces
`AdmittedRuntimeCatalogBasis`. It does not invoke or select.

`AdmittedRuntimeCatalogBasis` binds catalog identity, runtime-catalog and
registry projection refs,
admission event refs, binding/lock/product refs, and internal execution
bindings. The engine request gains a mutually exclusive
`runtimeCatalogBasis` input beside legacy `runtimeRegistryStartup`. Selection
runs for either input. The basis path reconstructs and verifies the projection
from replay and never re-admits or re-emits declaration events. The DS-1 public
path uses only `runtimeCatalogBasis`.

`CatalogInvocationAssembly` is the source-independent bridge to the existing
runner. M03 derives it from one admitted catalog basis, registry session view,
execution binding, bound ABG runtime-system profile, composed operator
capabilities, and host descriptor. It carries the exact admitted Module,
selected handle, start intent with admitted input bindings, ABG-product runtime
identity, resolved policy, replay events, standard plugin refs,
`EnginePluginCapabilities`, capability-provenance refs, and the exact existing
`EngineStartRequest`. Runtime identity and policy derive from the bound ABG
product's `AbgRuntimeSystemProfile`. Plugin
implementations resolve only from the ABG standard catalog plus explicitly
admitted operator capability ingress; publisher source supplies none.

`invokeAdmittedCatalogGraphFunction` consumes that assembly, uses the existing
registry lookup and selection functions, emits selection through the canonical
event path, and passes the assembled request to `runEngineStartAsync`. That
runner's existing `admitExecutionBasis` path remains the sole constructor and
resolver of `GraphFunction`, `Job`, materialized graph, and `ExecutionBasis`.
The assembly proves the selected registry handle matches the Module/target; it
does not construct or carry a rival Job or basis. M04 SDK and CLI call the M03
ingress once and do not reproduce its steps. GraphFunction input is admitted
against the declared interface and bound into M03 materialization/context
before the basis opens; the old public-start request's lack of payload is not
filled by CLI-local state.

## Workspace Create And Open

`workspace.create` writes only
`.abiogenesis/workspace-manifest.json`. The manifest carries a minted stable
workspace identity, root, explicit `clean_no_project_authority` or `imported`
authority mode, explicit `none` scaffold state, schema version, and creation
provenance. It may create the `.abiogenesis/` directory. It does not install,
resolve, bind, admit, scaffold project authority, create an event log, or start
work.

`workspace.open` reads and admits that manifest and reports existing binding
and configuration refs plus one of `ready`, `unbound`, `missing`, `malformed`,
`stale`, or `incompatible`. It performs no writes and no implicit remediation.

## Product State And Authority Map

| State | Necessary derivation | Authority gained |
| --- | --- | --- |
| declared requirement | requested product and compatibility constraints | none |
| resolved | one immutable lock selects exact descriptors/artifacts and dependency edges | install input only |
| verified | archive, descriptor, contribution, lock, manifest, content, and compatibility identities agree | installation eligibility only |
| installed | exact verified payload and detached records exist under immutable toolchain identities | may be selected for binding |
| bound | one workspace binding names exact installed set and lock | candidate input to catalog admission |
| admitted | M03 admits or rejects every contribution row and emits canonical facts | row may become ready |
| ready | admitted row is coherent with compatibility and all declared prerequisites | may enter an effective view |
| session-visible | ready row is in the intersection of workspace catalog and allowlist | may be evaluated for request eligibility |
| eligible | session-visible row matches requested identity, interface, input, capability, proof, and policy constraints | may be selected if callable |
| callable | eligible row has kind `graph_function` and an admitted execution binding | M03 may select and open GraphCall |

No earlier state implies a later one. Presence, installation, binding, or an
allowlist never grants execution authority.

## Catalog Read And Session View

`WorkspaceCatalogProjection` is an M04-owned downstream joined read model over:

- exact workspace manifest and binding;
- exact resolved lock and verified detached records;
- bound product contract catalogs and contribution manifests; and
- replay-derived M03 runtime-catalog admission truth.

M03 has no dependency on this M04 carrier. It is not a second mutable registry.
Each `PublicCatalogRow` and
`PublicCatalogDescription` exposes the canonical handle, kind, owning product,
descriptor/contribution/artifact/lock identities, compatibility, readiness and
blockers, eligibility, callability, session visibility, contract/schema refs,
and provenance.

M03 derives `RegistrySessionView` as the immutable intersection of its admitted
runtime catalog projection and one duplicate-free allowlist. M04 wraps it as
`PublicSessionCatalogView` by joining exact workspace/product metadata. The
view identity derives from catalog identity plus the canonical allowlist.
Unknown, ambiguous, unauthorized, inadmissible, or unready handles return typed
residuals. An empty result is lawful and never means unrestricted.

`WorkspaceRuntimeEventReader` is the M04 filesystem effect boundary for result
and replay reads. It accepts an admitted workspace binding, resolves only its
event-log path, and returns subordinate `WorkspaceRuntimeEventBytes`. M03 alone
admits those bytes as canonical events, orders them, and owns the resulting
`AdmittedWorkspaceReplay`. M03 result/replay projections consume that carrier;
M04 does not interpret runtime meaning.

## SDK, Host Descriptor, And CLI

The TypeScript package exports one `AbiogenesisPublicSdk` contract from
`./app/m04`. Its operation map is discriminated by the exact
`abg.operation.*` identity. Each operation has a distinct request, accepted
result, and refusal union. A common `PublicOperationInvocationEnvelope<K>`
binds operation contract identity/version/digest, request identity and schema,
payload, provenance, actor rule, adapter identity, and correlation identity.

Every SDK call receives one non-serialized `PublicSdkExecutionContext` from this
closed union:

| Context tag | Operations | Required authority/effects |
| --- | --- | --- |
| `workspace_path` | workspace create/open | explicit absolute target root plus bounded workspace reader/writer; no admitted workspace required |
| `product_intake` | catalog resolve/verify and install | supplied-artifact/record reader, temporary verifier/materializer, `ABG_TOOLCHAIN_ROOT` selector, and optional admitted workspace-binding reader used only by install precedence |
| `workspace_binding` | catalog bind | admitted workspace manifest/root plus installed-record, lock, binding, and mutable-root effects; no prior product binding required |
| `bound_workspace` | catalog admit/list/describe/allow/invoke and result/replay | admitted workspace root/id, exact binding/record readers, event reader/sink, and ABG-standard capability factories |

Each handler admits the required tag and verifies its root/identity against its
request before effects. The context supplies effects and native
implementations, not semantic defaults or runtime truth. `abg.cli` constructs
it explicitly for each process; current working directory is never an implicit
workspace selector.

`HostInvocationDescriptor` specializes that envelope with contract-catalog
version/digest; workspace, product-set, binding, lock, catalog, and non-null
effective session-view identities; GraphFunction and interface; input identity,
schema identity, and payload/ref; expected result/refusal schema identities;
canonical allowlist; capability refs; actor/attribution; mode; and
transport-steering identities. It contains no
worker call, frame, frontier, continuation, event payload authority, retry
loop, or closure decision.

An outer `CatalogInvokeRequest` may omit `allowedHandles`, meaning the full
workspace catalog. The SDK always derives a concrete `RegistrySessionView` and
places its non-null identity and canonical allowlist in the admitted host
descriptor. An explicit empty allowlist remains empty. `catalog.allow` is the
pure preview/validation form of the same derivation; a later process can pass
the returned `allowedHandles` or view carrier, never an unrecoverable bare id.

`composeOperatorCapabilities(context, descriptor)` is the M04 capability
effect boundary. It admits steering and requested capability refs, invokes
only ABG-standard factories supplied by `PublicSdkExecutionContext`, and
returns the existing M04 `LiveCapabilityBinding`. M04 retains that wrapper and
its provenance projection; only its admitted M03-owned
`EnginePluginCapabilities` member plus capability-provenance refs cross into
`CatalogInvocationAssembly`.
Missing or inconsistent capability data refuses before GraphCall. Catalog
product data cannot provide a factory or executable capability.

`abg.cli` maps one-to-one to the SDK:

```text
abg.cli workspace create|open
abg.cli catalog resolve|verify|bind|admit|list|describe|allow|invoke
abg.cli install
abg.cli result
abg.cli replay
```

The CLI may parse paths and flags, call the SDK, render the exact typed outcome,
and map the contract's exit classification. It may not parse event JSONL,
construct runtime Modules from an executable workspace binding, create plugins,
emit events, run workers, select continuations, or retry traversal.

## Public Contract Catalog Profile

Contract-catalog structural validity and full 5.0 release completeness are
distinct. The DS-1 candidate publishes profile `abg-5-ds1`, a new catalog
version/digest, all nine current addressable native contract groups, the
baseline manifest/GTL/Module/descriptor/contribution/lock/workspace/install/
catalog/invocation/event/result/replay schemas, and the 13 DS-1 operation rows.

The final release profile `abg-5-release` is admitted only when the catalog has
the exact complete operation roster and all mandatory capability/schema rows.
Later phases extend by new version/digest; they do not mutate an already
identified DS-1 catalog. DS-1 claims only capabilities actually proven:

- `abg.capability.gtl.declare@5`
- `abg.capability.gtl.admit@5`
- `abg.capability.gtl.serialize@5`
- `abg.capability.module.publish@5`
- `abg.capability.catalog.contribute@5`
- `abg.capability.catalog.invoke-graph-function@5`
- `abg.capability.install.bind-products@5`

The exact capability-to-contract mapping and the explicit non-claim for
`abg.capability.runtime.replay-continuation@5` are in the public operation
register.

## Required Break Order

1. Publish the canonical schemas and TypeScript carrier/admission surface.
2. Add workspace create/open without calling the installer.
3. Add detached descriptor/contribution/lock resolution and verification.
4. Add the generic verified-product materializer and ABG npm-package adapter;
   refactor install to consume only `VerifiedProductArtifact` and stop writing
   workspace binding or catalog truth.
5. Version `ToolchainProductBinding` and `ToolchainWorkspaceBinding` to the
   exact multi-product contract; reject schema-v2 input on the DS-1 SDK path.
6. Add projection-threaded multi-product admission and freeze
   `AdmittedRuntimeCatalogBasis`.
7. Extend the runner with the mutually exclusive already-admitted catalog basis
   and prove invoke does not re-admit declarations.
8. Add `CatalogInvocationAssembly`, `AbgRuntimeSystemProfile`, M04 joined
   catalog projection, `RegistrySessionView`, `PublicSdkExecutionContext`,
   operator-capability composition, and `WorkspaceRuntimeEventReader`.
9. Add `AbiogenesisPublicSdk`, then map `abg.cli` to it.
10. Pack the declarations-only Hello World fixture and prove SDK before CLI,
   deterministic capability before live capability, and result before replay.
11. Remove the new path's dependency on `.abiogenesis/cli-runtime.mjs` and
    source-root installer inputs before T-223 closure.

## Mixed-State Constraints

- A schema-v2 binding cannot be opened as a DS-1 ready binding.
- A source-oriented installer result cannot be relabeled as a verified supplied
  artifact or v3 bound product.
- An installed-but-unbound product cannot contribute catalog rows.
- Bound product data cannot become catalog truth without M03 admission events.
- Static contribution inventory cannot substitute for replay-derived registry
  truth.
- `runtimeRegistryStartup` and `runtimeCatalogBasis` cannot coexist; the DS-1
  invoke path cannot re-admit an already-admitted catalog.
- A registry or public session view cannot outlive or mismatch its catalog identity.
- An old executable `cli-runtime.mjs` cannot supply Module, plugins, selection,
  or events to the new SDK/CLI path.
- Partial `abg-5-ds1` contract catalogs cannot claim full public-operator or
  release conformance.
- A later catalog version cannot be read under an earlier digest or binding.

The current 4.6 source installer and legacy binaries may remain temporarily as
predecessor implementation during inside-out migration, but they are not a
bridge. They cannot produce DS-1 proof or be selected by the new SDK. Before
T-223 closes, every public DS-1 operation uses the new exact path.

## T-223 Proof Handoff

The bound ABG product supplies one runtime-system profile and one SYSTEM
GraphFunction contribution used to
prove system/product conflict law. The fixture product contains detached
descriptor/contribution data, one serialized Module with the Hello World
GraphFunction and one GraphFunction-shaped node type, one opaque overlay asset,
and contribution rows for `graph_function`, `node_type`, and `overlay`, plus
declared input/result schemas and static assets. It contains no executable
publisher source. Deterministic
proof uses an ABG standard fake transport capability supplied through the
public capability input; live proof uses the standard live F_P capability after
typed preflight. Both use the same fixture and SDK path.

T-223 must prove:

1. clean create/open, exact resolve/verify/install/bind/admit, and generic reads;
2. SDK and CLI list/describe/allow/invoke/result/replay equivalence;
3. M03 emits selection before GraphCall and owns every runtime event;
4. retained node/overlay rows remain visible and non-callable;
5. incompatible identity/range/digest/interface, unresolved dependency or
   handle, duplicate/shadow, allowlist widening, malformed input, missing
   capability, and source/private import fail at their owning boundary; and
6. one packed-and-installed live Hello World preserves response, result, event,
   and replay evidence.

## Non-Goals

- kind-specific node-type or overlay application;
- complete start/resume/F_H/operator-loop delivery;
- product update, disable, unbind, uninstall, retirement, or revocation;
- hosted registry, package store, signing, RBAC, scheduler, or schema service;
- hostile local filesystem or in-process tamper hardening;
- a second event store, runtime binding module, controller, or proof framework.
