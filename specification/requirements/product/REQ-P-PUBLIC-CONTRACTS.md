# REQ-P-PUBLIC-CONTRACTS - Addressable Public Contract Catalog

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-07-11
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [REQ-P-INSTALL.md](REQ-P-INSTALL.md), [REQ-P-POLICY.md](REQ-P-POLICY.md), [REQ-M-GTL3-CAPABILITY.md](../mapping/REQ-M-GTL3-CAPABILITY.md)
**Wave**: ABG 5.0

---

## Purpose

Make every normative released contract addressable without source, ticket,
design-history, or implementation inference. The public contract catalog is a
versioned section of the installed product manifest. It is the bootstrap
locator for native typed exports, canonical serialization schemas, closed
vocabularies, conformance corpora, public operations, and capability identities.

It is a static product artifact, not a hosted schema service or second checker.

## Bootstrap Location And Identity

**REQ-P-PUBLIC-CONTRACTS-001**: Each released product root shall contain
`product-toolchain-manifest.json`. Its bootstrap fields shall include `kind`
equal to `abg_product_toolchain_manifest`, `schemaVersion`, `productId`,
`packageName`, `packageVersion`, `productContentDigest`, and one
`publicContractCatalog` object. A missing, malformed, duplicate, or
digest-incoherent bootstrap field shall fail product verification.

**REQ-P-PUBLIC-CONTRACTS-002**: `publicContractCatalog` shall carry
`schemaVersion`, `catalogId`, `catalogVersion`, `catalogDigest`,
`catalogSchemaPath`, `catalogSchemaDigest`, and `rows`. Paths shall be relative
to the product root containing `product-toolchain-manifest.json` and shall not
contain an absolute path, `..`, or symlink-dependent source locator.

**REQ-P-PUBLIC-CONTRACTS-002A**: Every digest in this family shall use
`sha256:<64 lowercase hexadecimal characters>`. JSON identity shall use RFC
8785 JSON Canonicalization Scheme UTF-8 bytes. `productContentDigest` shall hash
the lexicographically sorted `(product-relative path, file sha256)` inventory
of immutable product payload files, excluding `product-toolchain-manifest.json`
itself and mutable install/runtime state. `catalogDigest` shall hash the
canonical `publicContractCatalog` object with only its `catalogDigest` field
omitted. `catalogSchemaDigest` and each asset digest shall hash exact file
bytes. A serialized/schema/vocabulary/corpus row's `contractDigest` shall equal
the digest of its canonical located asset. A native typed group row's
`contractDigest` shall hash a published canonical inventory of
`(package export path, declaration-file relative path, declaration-file
sha256)` tuples; it shall not depend on loader order or source paths. The
complete manifest digest is computed over the final canonical
manifest and is stored by the workspace binding/install record, not inside the
manifest it digests. No digest includes its own field.

**REQ-P-PUBLIC-CONTRACTS-003**: Each catalog row shall carry one stable
`contractId`, contract version, contract digest, contract kind, owning product,
requirement authority refs, capability identities, and exactly one or both of:

- a native typed locator: package name, package export path, and named symbol;
- a canonical asset locator: product-root-relative path, media/schema kind, schema
  version, and content digest.

Every serialized public request, result, event, manifest, descriptor,
contribution, lock, replay record, or conformance record shall have a canonical
asset/schema locator. Native type exports may additionally carry stronger
host-language constraints; they shall not contradict canonical serialization.

**REQ-P-PUBLIC-CONTRACTS-004**: Contract and capability identities are exact
versioned product truth. The same identity shall not resolve to different
schema, symbol, semantics, or digest. Removal or semantic change requires a new
version or explicit supersession; ambient package resolution and source paths
shall not select a contract.

## Required Contract Groups

**REQ-P-PUBLIC-CONTRACTS-005**: The ABG 5.0 TypeScript product shall publish
these contract-group identities and package export locators. The root export
`.` may aggregate them but shall not replace their addressable identities.

| Contract group identity | TypeScript package export | Required content |
|---|---|---|
| `abg.contract.gtl.m01` | `@abiogenesis/typescript-tenant/gtl/m01` | GTL graph, declaration, admission, canonical serialization, algebra, C, refinement, diagnostic carrier contracts |
| `abg.contract.gtl.m02` | `@abiogenesis/typescript-tenant/gtl/m02` | Module, publication, lookup, descriptor-facing declaration contracts |
| `abg.contract.gtl.requirements` | `@abiogenesis/typescript-tenant/gtl/requirements` | GTL requirement declaration and relation contracts |
| `abg.contract.abg.requirements` | `@abiogenesis/typescript-tenant/abg/requirements` | ABG requirement and proof-carry contracts |
| `abg.contract.abg.executive` | `@abiogenesis/typescript-tenant/abg/executive` | observer/tuner and executive projection contracts |
| `abg.contract.abg.m03` | `@abiogenesis/typescript-tenant/abg/m03` | runtime event, admission, catalog, traversal, result, replay, continuation, and conformance contracts |
| `abg.contract.abg.transport` | `@abiogenesis/typescript-tenant/abg/m03/transport` | replaceable transport input/result contracts; no runtime authority |
| `abg.contract.app.m04` | `@abiogenesis/typescript-tenant/app/m04` | installed public SDK operation, workspace, catalog, invocation, result, replay, F_H, and installer contracts |
| `abg.contract.qualification.m05` | `@abiogenesis/typescript-tenant/qualification/m05` | qualification, release-snapshot, manifest, and evidence contracts |
| `abg.asset.gtl.language-conformance-corpus` | product-manifest asset locator | canonical GTL programs paired with exact expected diagnostic identities |

**REQ-P-PUBLIC-CONTRACTS-006**: The `abg.contract.abg.m03` roster shall locate
the named symbols `RuntimeEvent`, `CanonicalRuntimeEvent`, and
`RUNTIME_EVENT_KIND_VALUES`; `GtlProgramDiagnosticId` and
`GTL_PROGRAM_DIAGNOSTIC_ID_VALUES`; `GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES` and
`GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS`; and
`admitGtlProgramConformanceInput` and `typecheckGtlProgram`. The value arrays are
the machine-readable closed rosters for their type unions.

**REQ-P-PUBLIC-CONTRACTS-006A**: The public contract catalog shall contain
these mandatory schema, vocabulary, and corpus row identities. A row may share
one export group or schema document with other rows, but it shall retain its own
identity, version, digest, authority refs, and locator:

- `abg.schema.product-toolchain-manifest`
- `abg.schema.public-contract-catalog`
- `abg.schema.public-operation-contract`
- `abg.schema.native-contract-inventory`
- `abg.schema.capability-contract`
- `abg.schema.closed-vocabulary`
- `abg.schema.gtl-graph-function`
- `abg.schema.gtl-module`
- `abg.schema.gtl-c-program`
- `abg.schema.gtl-program-conformance-input`
- `abg.schema.catalog-product-descriptor`
- `abg.schema.catalog-contribution-manifest`
- `abg.schema.resolved-product-lock`
- `abg.schema.workspace-binding`
- `abg.schema.install-manifest`
- `abg.schema.installer-manifest`
- `abg.schema.catalog-admission`
- `abg.schema.host-invocation`
- `abg.schema.runtime-event`
- `abg.schema.runtime-result`
- `abg.schema.runtime-replay`
- `abg.schema.fh-interaction`
- `abg.schema.tenant-conformance-manifest`
- `abg.schema.self-conformance-result`
- `abg.schema.self-build-program-manifest`
- `abg.schema.release-snapshot`
- `abg.schema.a5-r1-release-manifest`
- `abg.vocabulary.runtime-event-kind`
- `abg.vocabulary.gtl-program-diagnostic-id`
- `abg.vocabulary.gtl-program-repair-edit-class`
- `abg.asset.gtl.language-conformance-corpus`

**REQ-P-PUBLIC-CONTRACTS-007**: The language conformance corpus shall be one
canonical content-addressed JSON product asset. Its catalog row shall locate
the asset and schema, bind its digest, and name the diagnostic-vocabulary
contract it expects. Test-only location is not publication.

**REQ-P-PUBLIC-CONTRACTS-007A**: The GTL serialization rows shall locate the
native symbol pairs `admitGraphFunction`/`serializeGraphFunction`,
`admitModule`/`serializeModule`, and
`admitCProgramSyntax`/`serializeCProgramCanonical`, plus
`GtlProgramConformanceInput`/`admitGtlProgramConformanceInput`. The installer
rows shall locate `AbgTypescriptInstallerManifest` and the exact canonical
install-manifest schema. Equivalent later symbols require a versioned catalog
row and supersession; broad M01/M02/M04 group membership alone is not a schema locator.

## Public Operation Identities

**REQ-P-PUBLIC-CONTRACTS-008**: The public operation catalog shall contain
exactly these tenant-invariant 5.0 operation identities unless an ordinary
requirement reprice versions or supersedes the catalog:

- `abg.operation.workspace.create`
- `abg.operation.workspace.open`
- `abg.operation.catalog.resolve`
- `abg.operation.catalog.verify`
- `abg.operation.catalog.bind`
- `abg.operation.catalog.admit`
- `abg.operation.catalog.list`
- `abg.operation.catalog.describe`
- `abg.operation.catalog.allow`
- `abg.operation.catalog.invoke`
- `abg.operation.run.start`
- `abg.operation.run.resume`
- `abg.operation.read.status`
- `abg.operation.read.result`
- `abg.operation.read.evidence`
- `abg.operation.read.replay`
- `abg.operation.read.gaps`
- `abg.operation.read.lawful-actions`
- `abg.operation.fh.select`
- `abg.operation.fh.approve`
- `abg.operation.fh.reject`
- `abg.operation.fh.assess`
- `abg.operation.fh.answer-escalation`
- `abg.operation.result.assess`
- `abg.operation.witness.admit`
- `abg.operation.observe.report`
- `abg.operation.observe.drafts`
- `abg.operation.tune.report`
- `abg.operation.tune.propose`
- `abg.operation.tune.ratify`
- `abg.operation.tune.reject`
- `abg.operation.conformance.typecheck-gtl-program`
- `abg.operation.install.context-bootstrap`
- `abg.operation.install.install`
- `abg.operation.install.gen-config`
- `abg.operation.release.snapshot`

**REQ-P-PUBLIC-CONTRACTS-009**: Every operation row shall locate exact request,
result, error/refusal, and invocation-descriptor schemas and native symbols. It
shall declare defaults, closed value domains, actor requirements, read/write or
attestation class, event-admission behavior, terminal/non-terminal disposition,
and adapter exit classification. Prose spelling, CLI parsing, prior examples,
or adapter convention shall not supply a missing field.

**REQ-P-PUBLIC-CONTRACTS-010**: The common host-neutral invocation descriptor
shall itself be a catalog row and schema. It shall bind contract-catalog
version, operation identity, workspace/product/lock/catalog-view identities,
the selected GraphFunction or operation request schema, input identity,
allowlist/capability/steering inputs, actor attribution when required, and
expected result/error schema identities. It shall contain no worker,
continuation, event, traversal, retry, or closure authority.

## Capability Catalog

**REQ-P-PUBLIC-CONTRACTS-011**: Each public contract row shall publish its
capability identities as stable strings of the form
`abg.capability.<domain>.<name>@<major>`. At minimum, the catalog shall include
capabilities for GTL declaration/admission/serialization, Module publication,
catalog contribution and GraphFunction invocation, node-type and overlay
application, seven-term C execution, F_P result admission/materialization,
runtime events/replay/continuation, the complete public operator contract,
installed-product binding, qualification, self-conformance, and self-hosting.

The mandatory ABIogenesis 5.0 capability identities are:

- `abg.capability.gtl.declare@5`
- `abg.capability.gtl.admit@5`
- `abg.capability.gtl.serialize@5`
- `abg.capability.gtl.typecheck@5`
- `abg.capability.module.publish@5`
- `abg.capability.catalog.contribute@5`
- `abg.capability.catalog.invoke-graph-function@5`
- `abg.capability.catalog.apply-node-type@5`
- `abg.capability.catalog.apply-overlay@5`
- `abg.capability.runtime.execute-seven-term-c@5`
- `abg.capability.runtime.admit-fp-result@5`
- `abg.capability.runtime.replay-continuation@5`
- `abg.capability.operator.public-contract@5`
- `abg.capability.install.bind-products@5`
- `abg.capability.qualification.self-conformance@5`
- `abg.capability.qualification.self-host@5`

**REQ-P-PUBLIC-CONTRACTS-012**: The tenant-conformance manifest shall reference
only contract and capability identities present in the exact product's public
contract catalog and shall bind the catalog identity/version/digest. Unknown,
duplicate, incompatible, unlocated, or digest-mismatched identities shall be
typed conformance gaps.

## Builder Walkthrough Contract

**REQ-P-PUBLIC-CONTRACTS-013**: A source-blind tenant builder shall be able to:

1. verify `product-toolchain-manifest.json` and its public contract catalog;
2. locate canonical GTL, Module, product, install, catalog, operation, event,
   result, replay, F_H, conformance, and qualification schemas;
3. locate the exact event-kind and diagnostic vocabularies and language corpus;
4. construct a tenant-conformance manifest from catalog identities;
5. implement a native typed adapter or canonical serialized adapter without
   consulting ABIogenesis source, tickets, design history, or test fixtures; and
6. run conformance and qualification against the same identities.

Failure of any locator, digest, schema, vocabulary, operation row, capability
row, or corpus row shall refuse conformance; it shall not fall back to code
inspection or prose inference.

## Bounded Scope

**REQ-P-PUBLIC-CONTRACTS-014**: The public contract catalog is an immutable
manifest section plus static package exports and schema/corpus assets. ABIogenesis
5.0 does not require a hosted schema registry, runtime schema download service,
signing authority, multi-language code generator, or hostile-local tamper system.
