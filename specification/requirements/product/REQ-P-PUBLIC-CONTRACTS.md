# REQ-P-PUBLIC-CONTRACTS - Addressable Public Contract Catalog

**Status**: Candidate - T-283 constitutional transaction; not operative until F_H closure
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

**REQ-P-PUBLIC-CONTRACTS-001**: Each product root that claims conformance to the
ABIogenesis 5.0-or-later public-contract family shall contain
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

The complete public function surface shall derive from one closed
`PublicFunctionDefinition<K>` family. That family owns each function identity,
closed variant domain, request/result/refusal contracts, authority and effect
class, operation-indexed workspace-binding requirement, capability refs, and
adapter coordinates. Package exports, operation catalog rows, schemas, SDK
methods, and CLI paths are projections of that family; they shall not author
parallel function meaning.

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
- `abg.schema.public-operation-invocation`
- `abg.schema.public-operation-outcome`
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
- `abg.schema.exact-candidate-qualification`
- `abg.schema.consensus-subject`
- `abg.schema.consensus-panel`
- `abg.schema.consensus-reviewer-profile`
- `abg.schema.review-findings`
- `abg.schema.review-rulings`
- `abg.schema.consensus-round-policy`
- `abg.schema.consensus-round-outcome`
- `abg.schema.consensus-result`
- `abg.schema.ticket-consensus-projection`
- `abg.schema.release-snapshot`
- `abg.schema.a5-r1-release-manifest`
- `abg.vocabulary.runtime-event-kind`
- `abg.vocabulary.gtl-program-diagnostic-id`
- `abg.vocabulary.gtl-program-repair-edit-class`
- `abg.vocabulary.review-ruling-kind`
- `abg.vocabulary.consensus-round-outcome`
- `abg.asset.gtl.language-conformance-corpus`

Canonical schema documents and addressable schema projections shall derive
from one schema-definition source. Independent authoring of equivalent native,
serialized, operation, and catalog schemas is not lawful merely because each
projection retains a distinct public identity.

`abg.schema.exact-candidate-qualification` shall locate one authoritative
schema document with addressable definitions for
`ExactCandidateQualification<basis>`,
`ExactCandidateQualification<verdict>`, `QualificationLawBasis`,
`QualificationGateResultVector<K>`, and `FinalTapDelta`. The basis and verdict
are addressable projections of the Prime qualification family;
`QualificationLawBasis`, the result vector, and `FinalTapDelta` remain
subordinate definitions and shall not become independently authored schema
identities.

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

**REQ-P-PUBLIC-CONTRACTS-008**: The public operation catalog shall derive the
following tenant-invariant 5.0 operation identities from the same
`PublicFunctionDefinition<K>` family. Their stable identities and semantics
decompose Product behavior; their count is a derived no-silence projection and
shall not define Product scope or substitute for an outcome scenario:

| Operation identity | Closed variation |
|---|---|
| `abg.operation.workspace.create` | target plus explicit `clean` or `imported` creation policy |
| `abg.operation.workspace.open` | expected stable workspace-authority basis plus readiness projection |
| `abg.operation.project.read` | closed source/projection relation for catalog, runtime, evidence, replay, gaps, lawful actions, observer, and tuning reads |
| `abg.operation.product.verify` | artifact format and contract |
| `abg.operation.product.resolve` | product requirements |
| `abg.operation.product.install` | install target policy |
| `abg.operation.workspace.bind` | exact product set, dependency lock, and roots |
| `abg.operation.catalog.admit` | admitted contribution family |
| `abg.operation.catalog.view` | narrowing allowlist |
| `abg.operation.catalog.apply` | `node_type` or `overlay`; both non-callable |
| `abg.operation.run.invoke` | `invoke` or `start` |
| `abg.operation.run.continue` | current-intent continuation or a newly admitted selected action |
| `abg.operation.interaction.respond` | `select`, `approve`, `reject`, `assess`, or `answer_escalation` |
| `abg.operation.result.assess` | declared result-assessment contract |
| `abg.operation.witness.admit` | `reprice`, `attest`, `hygiene-stamp`, `intake`, `run-resumed`, or `run-stopped` |
| `abg.operation.tuning.transition` | `propose`, `ratify`, or `reject` |
| `abg.operation.conformance.evaluate` | public `gtl_program`; self-conformance remains qualification-bound |
| `abg.operation.product.materialize` | `context_bootstrap` or `configuration` |
| `abg.operation.release.snapshot` | `published_rc` or `tapped_release` |

This is a hard break. Every non-derived legacy operation identity, facade,
parallel register, default, or fallback shall be retired. CLI command paths may
retain ergonomic spellings only when they bind one definition above and supply
no independent semantics.

**REQ-P-PUBLIC-CONTRACTS-009**: Every operation row shall locate exact request,
result, error/refusal, and invocation-descriptor schemas and native symbols. It
shall declare defaults, closed value domains, actor requirements, read/write or
attestation class, event-admission behavior, terminal/non-terminal disposition,
adapter exit classification, and the operation-and-variant-indexed
`workspaceBindingRequirement` value `forbidden | exactly_one`. No concrete
variant shall carry a freely optional workspace binding. Prose spelling, CLI
parsing, prior examples, or adapter convention shall not supply a missing field.

**REQ-P-PUBLIC-CONTRACTS-010**: One common host-neutral
`PublicInvocation<K>` descriptor family and one corresponding
`PublicOutcome<K>` result/refusal/non-terminal family shall themselves be
catalog rows and schemas, shall serve every public operation, and shall remain
governed by the selected `PublicFunctionDefinition<K>` and owning semantic
function. The invocation shall bind the exact public
function definition and variant, contract-catalog version, operation identity,
operation-indexed invocation authority, required workspace/product/lock/
catalog-view identities, selected admitted GTL program and GraphFunction where
execution-scoped, input identity, allowlist, capability grants, steering inputs,
actor attribution when required, and expected result/error schema identities.
Pre-binding variants shall forbid workspace binding; workspace- and
execution-scoped variants shall require exactly one immutable binding. The
descriptor shall contain no worker, continuation, event, traversal, retry,
selection, evaluation, or closure authority. The owning semantic function shall
construct the outcome; public ingress may validate, admit, and transport the
invocation and transport its outcome, but shall not construct either operation
semantics or outcome truth.

## Capability Catalog

**REQ-P-PUBLIC-CONTRACTS-011**: Each public contract row shall publish its
capability identities as stable strings of the form
`abg.capability.<domain>.<name>@<major>`. At minimum, the catalog shall include
capabilities for GTL declaration/admission/serialization, Module publication,
catalog contribution and GraphFunction invocation, node-type and overlay
application, seven-term C execution, F_P result admission/materialization,
runtime events/replay/continuation, the complete public operator contract,
installed-product binding, qualification-bound self-conformance, and the
published SYSTEM-owned Consensus GraphFunction.

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
- `abg.capability.graph-function.consensus@5`

The mandatory identities shall derive from one capability-definition graph
whose rows bind the owning public contract identities and dependencies.
Tenant-conformance manifests publish realized claims over that graph; they do
not author another capability vocabulary or infer support from package presence.

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
5. derive the complete SDK, CLI, schema, and catalog operation projections from the
   same `PublicFunctionDefinition<K>` family;
6. implement a native typed adapter or canonical serialized adapter without
   consulting ABIogenesis source, tickets, design history, or test fixtures; and
7. run conformance and qualification against the same identities.

Failure of any locator, digest, schema, vocabulary, operation row, capability
row, or corpus row shall refuse conformance; it shall not fall back to code
inspection or prose inference.

## Bounded Scope

**REQ-P-PUBLIC-CONTRACTS-014**: The public contract catalog is an immutable
manifest section plus static package exports and schema/corpus assets. ABIogenesis
5.0 does not require a hosted schema registry, runtime schema download service,
signing authority, multi-language code generator, or hostile-local tamper system.
