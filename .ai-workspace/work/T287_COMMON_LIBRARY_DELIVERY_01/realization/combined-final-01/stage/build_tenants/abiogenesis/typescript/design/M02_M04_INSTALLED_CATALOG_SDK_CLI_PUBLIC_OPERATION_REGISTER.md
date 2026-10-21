# M02-M04 Installed Catalog Public Operation Register

> **T-283 authority disposition (2026-07-20):**
> `invalidated_for_5_0_implementation_by_upstream_intent_reprice`. This exact
> operation register is retained as historical/current-state evidence only.
> The complete Product-derived public family must be re-derived after Product
> closure and accepted direct-GTL design; this register cannot authorize an
> operation count, runtime route, adapter, or closure claim.

**Ticket**: T-222
**Prior status**: Completed on the superseded DS-1 basis
**Date**: 2026-07-11
**Derived from**: `REQ-P-POLICY-019` through `REQ-P-POLICY-064`,
`REQ-P-PUBLIC-CONTRACTS-008` through `REQ-P-PUBLIC-CONTRACTS-010`,
`M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md`

## Purpose

Fix the DS-1 public operation contracts so T-223 implements typed carriers and
adapters without choosing defaults, actors, effects, dispositions, schema
identities, or exit behavior in code.

## Common Envelope And Schema Law

All DS-1 operation contract rows use contract version `1.0.0`. The common
invocation schema is:

- contract id: `abg.schema.public-operation-invocation`
- version: `1.0.0`
- path: `contracts/schemas/public-operation-invocation.schema.json`
- native symbol: `PublicOperationInvocationEnvelope`

The runtime invocation specialization is:

- contract id: `abg.schema.host-invocation`
- version: `1.0.0`
- path: `contracts/schemas/host-invocation.schema.json`
- native symbol: `HostInvocationDescriptor`

It is not a public-operation invocation alternative. All 13 public operation
rows, including `catalog.invoke`, bind the generic invocation schema. The SDK
admits that outer envelope and its `CatalogInvokeRequest`, derives the host
descriptor from the admitted invocation plus exact bound catalog/session truth,
and independently admits the derived carrier against the host-invocation schema
row. CLI and host adapters cannot supply session, runtime-catalog, or product
basis fields directly.

Each operation row also locates one canonical serialized operation definition:

- contract id: `abg.schema.public-operation-contract`
- version: `1.0.0`
- path: `contracts/operations/<slug>.json`
- media type: `application/json`

The serialized definition carries every field of the operation metadata except
`operationDigest`. Its exact bytes establish the row and operation digest; the
resolved catalog row supplies that digest alongside the admitted definition.
This omission breaks the otherwise recursive self-digest and follows the common
rule that no digest includes its own field.

`HostInvocationDescriptor` adds these required closed fields to the common
envelope:

| Field | Admission |
| --- | --- |
| `contractCatalogVersion` / `contractCatalogDigest` | exact bound ABG public-contract catalog |
| `workspaceId` / `workspaceManifestDigest` | exact admitted workspace |
| `productBindingRefs` / `productSetDigest` / `bindingId` / `resolvedLockId` | exact ordered bound product identities, product-set digest, binding, and lock |
| `catalogId` / `catalogVersion` / `catalogDigest` | exact admitted runtime catalog |
| `effectiveSessionViewId` / `allowedHandles` | required non-null derived M03 view identity and its canonical duplicate-free allowlist |
| `graphFunctionHandle` / `interfaceRef` | exact callable selected from that view |
| `inputId` / `inputSchemaId` / `inputSchemaVersion` / `inputSchemaDigest` | exact declared input identity and schema |
| `input` or `inputRef` | exactly one admitted payload form |
| `requiredCapabilityRefs` | required duplicate-free capability identities |
| `transportSteering` | nullable closed standard steering carrier |
| `mode` / `scope` / `target` / `until` | `invoke`, `graph_function`, canonical handle, and admitted until value |
| `actorRef` | required and identical to the common-envelope actor |

The common envelope's expected result/refusal triples are retained unchanged in
the specialization. No field may be inferred from current working directory,
display name, adapter defaults, or publisher executable source.

Every operation schema id is
`abg.schema.operation.<slug>.<request|result|refusal>`, version `1.0.0`, at
`contracts/schemas/operations/<slug>/<request|result|refusal>.schema.json`.
The slug register below is exact; no adapter-local alias creates another row.

`PublicOperationInvocationEnvelope<K>` is a closed object with:

| Field | Admission |
| --- | --- |
| `schemaVersion` | required literal `1` |
| `invocationId` | required non-empty opaque identity |
| `operationId` | required exact `abg.operation.*` identity |
| `operationContractVersion` | required literal `1.0.0` for DS-1 |
| `operationContractDigest` | required `sha256:` digest from the bound contract catalog |
| `requestId` | required non-empty opaque identity |
| `requestSchemaId` / `requestSchemaVersion` / `requestSchemaDigest` | required exact row identity, `1.0.0`, and bound digest |
| `resultSchemaId` / `resultSchemaVersion` / `resultSchemaDigest` | required exact expected accepted-result row identity, `1.0.0`, and bound digest |
| `refusalSchemaId` / `refusalSchemaVersion` / `refusalSchemaDigest` | required exact expected refusal row identity, `1.0.0`, and bound digest |
| `request` | required operation-specific closed object |
| `actorRef` | required, forbidden, or null exactly as the operation register states |
| `provenanceRefs` | optional, defaults to `[]`, duplicate-free |
| `adapter` | required `{ kind, ref }`; kind is `native_sdk`, `abg_cli`, or `host_adapter` |
| `correlationId` | optional, defaults to `invocationId` |

Operation payloads reject unknown keys. Paths admitted by the SDK are absolute;
CLI adapters may resolve operator-relative paths before constructing the
envelope. Reads admit no runtime event. Product writes produce manifest or
provenance truth. Only M03 catalog admission and invocation append runtime
events.

Adapter exit classifications are closed:

| Classification | Code | Meaning |
| --- | ---: | --- |
| `accepted_terminal` | 0 | operation completed with an accepted terminal result |
| `refused` | 1 | valid request returned a typed refusal or mandatory-row rejection |
| `invalid_invocation` | 2 | envelope or request failed admission before effects |
| `accepted_non_terminal` | 3 | invocation truthfully stopped, yielded, blocked, or awaits interaction without convergence |
| `adapter_failure` | 70 | unexpected adapter failure; never a substitute for a typed SDK outcome |

Admission resolves all three schema triples from the same bound operation row
before any effect. A mismatch is `invalid_invocation`; adapters may not accept
an outcome under a result or refusal contract different from the one bound by
the invocation.

## Exact Schema And Symbol Register

The package exports `Ds1PublicOperationContractMap`. Every key maps the exact
request, result, and refusal carrier symbols below; this map, the handler, and
the invocation carrier are all located by the native contract row.

| Operation id | Slug | Handler | Request / result / refusal carrier symbols | Invocation carrier |
| --- | --- | --- | --- | --- |
| `abg.operation.workspace.create` | `workspace.create` | `workspaceCreate` | `WorkspaceCreateRequest` / `WorkspaceCreateResult` / `WorkspaceCreateRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.workspace.open` | `workspace.open` | `workspaceOpen` | `WorkspaceOpenRequest` / `WorkspaceOpenResult` / `WorkspaceOpenRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.resolve` | `catalog.resolve` | `catalogResolve` | `CatalogResolveRequest` / `CatalogResolveResult` / `CatalogResolveRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.verify` | `catalog.verify` | `catalogVerify` | `CatalogVerifyRequest` / `CatalogVerifyResult` / `CatalogVerifyRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.install.install` | `install.install` | `installProduct` | `InstallProductRequest` / `InstallProductResult` / `InstallProductRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.bind` | `catalog.bind` | `catalogBind` | `CatalogBindRequest` / `CatalogBindResult` / `CatalogBindRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.admit` | `catalog.admit` | `catalogAdmit` | `CatalogAdmitRequest` / `CatalogAdmitResult` / `CatalogAdmitRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.list` | `catalog.list` | `catalogList` | `CatalogListRequest` / `CatalogListResult` / `CatalogListRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.describe` | `catalog.describe` | `catalogDescribe` | `CatalogDescribeRequest` / `CatalogDescribeResult` / `CatalogDescribeRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.allow` | `catalog.allow` | `catalogAllow` | `CatalogAllowRequest` / `CatalogAllowResult` / `CatalogAllowRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.catalog.invoke` | `catalog.invoke` | `catalogInvoke` | `CatalogInvokeRequest` / `CatalogInvokeResult` / `CatalogInvokeRefusal` | `PublicOperationInvocationEnvelope`; SDK derives `HostInvocationDescriptor` internally |
| `abg.operation.read.result` | `read.result` | `readResult` | `ReadResultRequest` / `ReadResultResult` / `ReadResultRefusal` | `PublicOperationInvocationEnvelope` |
| `abg.operation.read.replay` | `read.replay` | `readReplay` | `ReadReplayRequest` / `ReadReplayResult` / `ReadReplayRefusal` | `PublicOperationInvocationEnvelope` |

For example, `catalog.invoke` locates
`abg.schema.operation.catalog.invoke.request` at
`contracts/schemas/operations/catalog.invoke/request.schema.json`, with
parallel `result` and `refusal` rows. This expansion rule applies mechanically
to every exact slug above and admits no optional naming choice.

## Operation Contract Register

### Workspace Create

- request fields: `targetRoot`, `authorityMode`
- `targetRoot`: required absolute path
- `authorityMode`: required enum `clean_no_project_authority | imported`
- defaults: none; scaffold state is output literal `none`
- actor: required
- accepted result: `WorkspaceManifest` with disposition `created`
- refusals: `invalid_target | workspace_exists | workspace_identity_conflict | filesystem_failure`
- effects: create target and `.abiogenesis/workspace-manifest.json` only; no event
- terminality/exits: terminal `0`; refusal `1`; invalid envelope/request `2`

### Workspace Open

- request fields: `targetRoot`, `expectedWorkspaceSchemaVersion`
- `targetRoot`: required absolute path
- `expectedWorkspaceSchemaVersion`: optional, defaults to `1`, closed positive integer
- actor: forbidden/null
- accepted result disposition: `ready | unbound`
- refusals: `missing | malformed | stale | incompatible`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Resolve

- request fields: `requirements`, `candidateDescriptors`
- both fields are required non-empty duplicate-free arrays
- each requirement carries product identity plus exact version or canonical
  SemVer range and required contract/capability ids
- candidate selection is unique-match only; there is no highest/latest default
- actor: forbidden/null
- accepted result: exact `ResolvedProductLock`, disposition `resolved`
- refusals: `unresolved | incompatible | ambiguous | dependency_cycle | malformed_candidate`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Verify

- request fields: `artifact`, `descriptor`, `contributionManifest`, `resolvedLock`
- all are required; artifact format enum is `abg_product_tar_v1 | npm_package_tgz`
- no source root, package discovery, or mutable workspace input is admitted
- actor: forbidden/null
- accepted result: `VerifiedProductArtifact`, disposition `verified`
- refusals: `content_mismatch | identity_mismatch | descriptor_mismatch | contribution_mismatch | lock_mismatch | incompatible | unsupported_contract | unsafe_archive`
- effects: archive read and bounded temporary extraction only; no durable write or event
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Install Product

- request fields: `verifiedArtifact`, `toolchainRoot`, `workspaceBindingRef`
- verified artifact is required; `toolchainRoot` and `workspaceBindingRef` are
  optional/null; resolution order is explicit `toolchainRoot`, admitted
  workspace-binding toolchain root, then `ABG_TOOLCHAIN_ROOT`, otherwise typed
  refusal
- actor: required
- accepted result: `InstalledProductRecord`, disposition `installed | already_installed_exact`
- refusals: `unverified | toolchain_unresolved | installed_identity_conflict | materialization_failure`
- effects: immutable product payload and detached verification-record writes;
  no workspace binding, catalog event, or runtime event
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Bind

- request fields: `workspaceId`, `workspaceManifestDigest`, `resolvedLock`,
  `installedProductRecords`, `mutableStateRoots`
- all except `mutableStateRoots` are required; product order follows the lock
- mutable roots default below `<workspace>/.ai-workspace` for observer/executor,
  events, runtime, projections, and archives and are recorded as resolved paths
- actor: required
- accepted result: `ToolchainWorkspaceBindingV3`, disposition `bound | already_bound_exact`
- refusals: `workspace_not_ready | product_not_installed | lock_mismatch | binding_conflict | incompatible`
- effects: write binding/provenance and create only its declared mutable roots;
  no install, catalog admission, or traversal event
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Admit

- request fields: `workspaceId`, `bindingId`, `resolvedLockId`, `productSetDigest`
- all are required and resolve bound detached records; raw contribution rows
  cannot be injected in the request
- actor: required and recorded in one preceding `public_operation_admitted`
  event; the admission batch cites that event id as causation
- accepted result: `CatalogAdmissionResult`, disposition `admitted`
- any required row rejection returns disposition `refused` with every per-row
  disposition; DS-1 has no optional contribution rows
- refusals: `unbound | binding_mismatch | lock_mismatch | malformed_declaration | product_conflict | required_row_rejected`
- effects: M03 appends canonical `registry_entry_admitted` or
  `registry_entry_rejected` events for GraphFunction-backed rows and
  `catalog_asset_admitted` or `catalog_asset_rejected` events for opaque
  overlays; all four are
  workspace-scoped RuntimeEvent members; no invoke
- terminality/exits: admitted `0`; refused or required-row rejection `1`; invalid `2`

### Catalog List

- request fields: `workspaceId`, `catalogId`, `kinds`, `allowedHandles`, `sessionView`
- workspace/catalog are required
- `kinds` defaults to `[graph_function,node_type,overlay]`, duplicate-free
- `allowedHandles` and full `sessionView` are mutually exclusive and optional;
  omission means the full admitted workspace view; a supplied view must match
  its catalog and canonical allowlist
- actor: forbidden/null
- accepted result: ordered `PublicCatalogRow[]`, disposition `listed`
- refusals: `catalog_missing | catalog_stale | view_mismatch | unsupported_kind`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Describe

- request fields: `workspaceId`, `catalogId`, `handle`, `allowedHandles`, `sessionView`
- handle is required opaque canonical identity; display name is not accepted
- `allowedHandles` and full `sessionView` follow the same reconstructible
  mutually exclusive rule as `catalog.list`; omission means the full view
- actor: forbidden/null
- accepted result: `PublicCatalogDescription`, disposition `described`
- refusals: `catalog_missing | unknown_handle | ambiguous_handle | hidden_by_view | stale`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Allow

- request fields: `workspaceId`, `catalogId`, `handles`
- `handles` is required, duplicate-free, and may be explicitly empty
- omitted `handles` is invalid; `[]` means an empty view and never unrestricted
- actor: forbidden/null
- accepted result: `PublicSessionCatalogView` carrying both
  `effectiveSessionViewId` and canonical `allowedHandles`, disposition `allowed`
- refusals: `duplicate_handle | unknown_handle | unauthorized | inadmissible | unready`
- effects: none; view is immutable request/session data, not persisted authority
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Catalog Invoke

- request fields: `workspaceId`, `bindingId`, `resolvedLockId`, `catalogId`,
  `catalogVersion`, `catalogDigest`, `allowedHandles`, `sessionView`,
  `graphFunctionHandle`, `interfaceRef`, `inputId`, `inputSchemaId`,
  `inputSchemaVersion`, `inputSchemaDigest`, `input` or `inputRef`,
  `requiredCapabilityRefs`, `actorRef`, `transportSteering`
- workspace/binding/catalog/handle/input/capability array/actor are required
- `allowedHandles` and `sessionView` are mutually exclusive optional inputs;
  omission means the full admitted workspace view; explicit `[]` remains empty;
  a supplied view is admitted in full and must match the catalog and allowlist
- before M03 invocation the SDK always derives or admits a concrete
  `RegistrySessionView`; the resulting host descriptor carries its non-null
  `effectiveSessionViewId` and canonical `allowedHandles`
- the SDK derives the host descriptor only after admitting the generic outer
  envelope and request, and separately validates it against the published
  `abg.schema.host-invocation` row; adapters cannot submit this carrier
- `transportSteering` defaults to null; when present it uses the closed standard
  agent/model/profile/timeout carrier admitted by the ABG capability boundary
- mode is fixed `invoke`; scope is fixed `graph_function`; until defaults
  `converged`; target derives from the canonical handle
- actor: required in the request and generic envelope, must agree, and is copied
  into the derived host descriptor
- M03 appends `public_operation_admitted` before selection; the event owns the
  actor and admitted operation identity, while `graph_function_selected` cites
  only that event id in `causationEventRefs`
- accepted result dispositions: `converged | stopped | yielded | blocked | human_gate_required`
- refusals: `catalog_stale | view_mismatch | disallowed | non_callable | unready | interface_mismatch | input_invalid | missing_capability | preflight_failure | runtime_refused`
- effects: M03 public-operation attribution, registry selection, then ordinary
  GraphCall/start-to-iterate events; after the sole engine basis admission,
  absent explicit instruction startup is derived from the exact admitted
  catalog entry without `runtimeRegistryStartup` or catalog re-admission
- exits: converged `0`; typed refusal/preflight `1`; invalid `2`; lawful
  non-terminal stop/yield/block/human gate `3`

### Read Result

- request fields: `workspaceId`, `resultId` or `graphCallId` (exactly one)
- actor: forbidden/null
- accepted result: `PublicResultProjection`, disposition `projected`
- refusals: `unknown_identity | ambiguous_identity | stale_basis | malformed_replay`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

### Read Replay

- request fields: `workspaceId`, exactly one supported subject identity,
  `fromOrdinal`, `limit`
- subject is workspace, run, GraphCall, or supported subordinate identity
- `fromOrdinal` defaults to `0`; `limit` defaults to `1000`, closed range `1..10000`
- actor: forbidden/null
- accepted result: `PublicReplayProjection`, disposition `projected`, with
  explicit returned range and next cursor
- refusals: `unknown_identity | invalid_range | corrupt_event | ordinal_collision | stale_basis`
- effects: none
- terminality/exits: terminal `0`; refusal `1`; invalid `2`

## CLI Mapping

The CLI command spelling is the derivation's exact DS-1 grammar. It constructs
the same envelope, calls the exact exported native symbol, renders the same
accepted/refused carrier, and returns the register's exit classification. It
does not supply defaults not named here.

## Capability To Contract Map

DS-1 advertises only these qualified capability identities:

| Capability | Required contract rows |
| --- | --- |
| `abg.capability.gtl.declare@5` | `abg.contract.gtl.m01`, `abg.schema.gtl-graph-function` |
| `abg.capability.gtl.admit@5` | M01 native `admitGraphFunction`, GraphFunction schema |
| `abg.capability.gtl.serialize@5` | M01 native `serializeGraphFunction`, GraphFunction schema |
| `abg.capability.module.publish@5` | `abg.contract.gtl.m02`, `abg.schema.gtl-module`, `admitModule`, `serializeModule` |
| `abg.capability.catalog.contribute@5` | descriptor, contribution, catalog-admission schemas and catalog admit/list/describe rows |
| `abg.capability.catalog.invoke-graph-function@5` | catalog allow/invoke rows, host invocation schema, M03 registry/selection contracts |
| `abg.capability.install.bind-products@5` | resolve/verify/install/bind rows and resolved-lock/install/workspace-binding schemas |

`abg.capability.runtime.replay-continuation@5` and
`abg.capability.operator.public-contract@5` remain unclaimed until their owning
later phases prove the complete capability.
