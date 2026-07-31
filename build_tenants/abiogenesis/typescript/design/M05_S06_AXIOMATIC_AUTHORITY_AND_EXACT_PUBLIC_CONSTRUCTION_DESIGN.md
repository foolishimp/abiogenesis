# M05 S06 Axiomatic Authority And Exact Public Construction Design

**Status:** proposed Gate 1 subject; not operative realization authority until
direct F_H accepts the exact reviewed commit and tree

**Scope:** ABG5-S06 corrective authority, exact 18-operation/56-key
construction map, and hard-break realization boundary

**Re-entry:** targeted `requirement_reprice` for deterministic catalog
application plus bounded `design_reframe`

**Owner:** T-281 under T-270

**Method:** STDO 2.2.2

## 1. Decision Boundary

This design consumes the accepted census without changing it:

- path:
  `.ai-workspace/comments/codex/20260731T113200Z_CENSUS_abiogenesis_5_0_s06_exact_56_key_construction.md`;
- Git blob: `efe88cac85bd3bb071d4b5dd451dfadaec893c4f`;
- SHA-256:
  `0c0339689c21154c46148f033c7472b9d55a0fd771fc34a1c41d41c52d28a0c6`.

The exact 56 census rows, their current loci, evidence hashes, deletion
effects, projection graph, PFC-F08 oracle, sentinel, and `AX-F01..F14` plus
`AX-PFC-F08` falsifier records are incorporated by row identity. This design
supplies the previously absent target source paths, runtime value bindings,
dependency closures, and singular authority relations. It does not implement
them.

Product and Intent are unchanged. S03 and S05 Product and scenario outcomes
are unchanged. This design explicitly supersedes only the obsolete M03
CatalogView admission mechanism named in Section 3; it does not change the S03
narrowing or invocation meaning. S04, post-S06 Prime realization, complete M5
publication closure, M6, and M7 remain outside this subject. Donor adoption is
empty.

## 2. Constitutional Construction

The one Public algebra is:

```text
admit common envelope
  -> select exact operation-and-definition-key contract
  -> call the selected concrete owner-local port value
  -> project the exact indexed owner outcome
```

The implementation is admissible only while all of these axioms hold:

1. `PUBLIC_FUNCTION_DEFINITION_FAMILY` is exactly 18 operations and 56 keys.
2. Every definition references the actual callable Product, ABG, Validator,
   or release owner port value. A string, interface, locator without a value,
   or Public handler is not a port.
3. Owner-local packet values are the sole source of request, result, refusal,
   non-terminal, authority, effect, and capability meaning.
4. Public performs only common admission, exact selection, direct port
   invocation, and structural outcome projection. It contains no semantic
   operation switch.
5. Product owns static PFC-F08 publication and Product meaning. ABG alone owns
   admitted runtime catalog events and runtime truth.
6. ABG-admitted events plus declared Event Calculus laws derive runtime truth.
   Replay and reads invoke those projectors; neither interprets raw events as
   a second authority.
7. Every runtime-relevant prefix is explicit. Equal immutable inputs and equal
   admitted prefixes have equal meaning after restart and interleaving.
8. SDK, CLI, Codex, schemas, catalog rows, manifests, and documentation derive
   from the same exact family.
9. The legacy family is the only reachable Public family before the atomic
   swap. The exact family is the only reachable family afterward.
10. Release owner ports are real and callable in S06, but without the later
    qualification and release basis they return the exact applicable closed
    `ReleaseSnapshotPacket` owner refusal and cannot publish success.

The first counterexample stops the increment. Tests, compatibility, donor
behavior, and implementation convenience cannot trade against an axiom.

## 3. Requirement Trace And Supersession

| Authority | Binding in this design |
|---|---|
| `REQ-P-PUBLIC-CONTRACTS-005`, `-008..010` | one exact indexed family and one invocation/outcome family |
| `REQ-P-POLICY-041..046`, `-049..064` | pure reads, thin adapters, complete Product operations, exact public path |
| corrected `REQ-P-CATALOG-008`, `-030` | deterministic eventless CatalogApplication; ABG-only runtime catalog admission |
| `REQ-R-ABG3-EVENTS-001..002`, `-018`, `-024..032` | append-only admitted events, scoped Event Calculus, durable ingress, no process truth |
| `REQ-R-ABG3-PROJECTION` and `REQ-R-ABG3-RUN` | replay/read projections consume the same Event Calculus result |
| `REQ-L-GTL3-C-ALGEBRA-013..018` | one admitted normalized Program, validation before effects, no rival plan |
| `REQ-L-GTL3-LAWS-021..022` | one code-unit canonical data identity independent of caller order |
| T-281 `CL-01..CL-11` | hard break, explicit carriers, all-port packaging, frozen reviews |

Accepted predecessor files remain immutable. If this subject is accepted, it
supersedes only these realization relations:

| Predecessor relation | Superseding relation |
|---|---|
| `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` store-local branded application exception | deterministic reconstructable Product application in Section 6 |
| `M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md` application event and unkeyed artifact fluent | no application event; scoped artifact fluent only for genuinely effectful artifacts |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` `CatalogView` admitted-projection ontology, ABG-owned `narrowCatalogView`, view-admission event, catalog-view sequence admission, and ABI5-ROOT-001 R4 admission mapping | total deterministic eventless Product `CatalogOperationPort.constructView` over an ABG-admitted catalog projection plus exact allowlist; `run.invoke` revalidates the equal view against the explicit-prefix Event Calculus catalog and its invocation event records the view use |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` one-shot store/context application lifecycle | equal carrier reconstruction and invocation-time revalidation |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` branded source-result and remembered context coordinates | ABG-backed rehydration from explicit prefix |
| `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` root-context-held verification/resolution/install relations | complete serializable carriers and explicit preimages |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` hybrid application ownership, Public read-contract ambiguity, implicit prefix, and older common refusal shape | Sections 4 through 9 of this design |

The accepted predecessor's exact 18/56 source map, PFC-F01..F08 staging,
closed PFC-F08 attempt/refusal relation, and PFC-F08A exact owner-coordinate
join are retained unchanged except where the table above explicitly says
otherwise.

## 4. Concrete Port Law

An owner packet and port are owner-local. No owner module imports `src/public`.
Each named `*Port` below is an exported frozen runtime value whose selected
member is a function. Type-only interfaces may describe it but cannot satisfy
the definition family.

Conceptually, each selected function has this shape:

```text
OwnerPortMember(
  exact owner-local request,
  exact owner-local authority carrier,
  prebound installed owner dependencies
)
  -> exact owner result
   | exact owner refusal
   | exact owner non-terminal
```

The installed composition root binds dependencies once. Public neither builds
an owner context nor selects an owner dependency. The exact definition stores
the already bound function value. Indexed admission extracts only the exact
owner-local request and authority carrier named by the owner packet.

Each definition is one frozen runtime value containing both its canonical
serializable intrinsic fields and `ownerPort`, the actual bound function. Its
`definitionDigest` hashes only the declared intrinsic preimage, including the
exact owner-port coordinate; host function identity is never serialized or
hashed. Family construction resolves that coordinate once, proves that the
resolved export is the same callable stored in `ownerPort`, and then freezes
the definition. PFC-F07 projects only the intrinsic fields. This is one family
with one installed binding, not a serializable catalog plus a second dispatch
registry.

The common Public path is implemented in new structural modules:

| Target source | Sole responsibility |
|---|---|
| `src/public/envelope.ts` | raw/native common-envelope admission and the closed common refusal carrier |
| `src/public/definition_family.ts` | PFC-F01/F02 exact structural join over actual owner contract and port values |
| `src/public/invocation_admission.ts` | exact definition selection and indexed contract admission |
| `src/public/invoke.ts` | call `selection.definition.ownerPort` exactly once; no operation switch |
| `src/public/outcome_projection.ts` | structural tagged projection of the indexed owner outcome |
| `src/public/project_read_contracts.ts` | derived total join over owner-local read contract and port values; authors no field or schema |
| `src/public/schema_projection.ts` | later PFC-F07 schema projection from the closed family |
| `src/public/sdk.ts` | later typed SDK projection from the closed family |
| `src/public/index.ts` | package export of the selected family and projections only |

`src/public/operations.ts`, `src/public/contracts.ts`, and
`src/public/schema.ts` are legacy files, not destinations for semantic reuse.
They are deleted in the atomic swap defined by Section 10.

## 5. Explicit Carriers And Durable Ingress

### 5.1 Verification and resolution

`ProductVerificationPort.verify` is deterministic and eventless. It returns a
complete canonical `VerifiedProductCarrier` containing the selected target
member, all verified Product/descriptor/contribution/artifact identities and
digests, native-contract evidence, pending external selectors where lawful,
disposition, issues, and provenance. Canonical serialization and JSON
round-trip preserve its ref, digest, and value.

`ProductEnvironmentPort.resolve` accepts the complete verified carrier for
every candidate Product plus the exact declared dependency and compatibility
inputs. It re-reads or revalidates the identified Product bytes and returns a
complete canonical `ResolvedProductLock`. It never accepts a prior invocation
reference as a substitute and never looks up a verification result in memory.

These carriers prove internal content and deterministic evaluation, not ABG
runtime admission. Later effectful owners revalidate the complete carrier and
admit their own artifact/runtime truth where required.

### 5.2 Durable prefix

Every effectful owner request carries one closed `DurablePrefixCoordinate`:

```text
{
  eventLogRef,
  prefixLength,
  prefixDigest,
  storeIdentity
}
```

ABG verifies all four fields before use. The coordinate identifies an exact
append-only prefix; a retained context, latest log, environment variable,
module singleton, or remembered reopen authority cannot supply it. An owner
may append only through the store selected by that verified coordinate and
returns the successor coordinate explicitly.

Parsing a continuation, run projection, application, or source-result carrier
yields an unverified candidate. Only its owner can rehydrate an admitted basis
by joining it to the exact durable prefix and Event Calculus result. Public
constructors cannot mint admission or provenance.

### 5.3 Setup artifacts

Workspace creation/opening, installation, binding, catalog admission, and
materialization produce complete immutable artifacts. When an artifact will be
used as runtime prerequisite and has no more specific owning runtime event,
the owner admits exactly one `public_operation_artifact_admitted` event before
returning success. The event's fluent key is:

```text
(
  operationId,
  definitionKey,
  definitionDigest,
  authorityScopeRef,
  authorityScopeDigest
)
```

Different keys/scopes coexist. Reuse of the same scope reference with a
different scope digest, definition digest, artifact reference, or artifact
digest refuses before append. No Public layer emits this event.

## 6. Catalog Authority

Three non-substitutable relations exist:

1. PFC-F08 is Product-owned static publication. It binds the exact attempt to
   the extant `PublicContractCatalog`, replaces exactly the three common plus
   18 operation identities, preserves retained rows byte-for-byte, emits the
   exact 44-row diagnostic, and emits no runtime event.
2. `CatalogOperationPort.admit` is the sole runtime Product-catalog admission
   path. It asks ABG to admit catalog events; the Event Calculus projects the
   admitted runtime catalog.
3. `CatalogOperationPort.constructView` and `.apply` are total deterministic
   Product constructions. They emit no event and change no runtime truth.

The CatalogView equation is exact:

```text
constructCatalogView(
  admitted immutable runtime-catalog projection at an explicit prefix,
  exact allowlist
) -> canonical CatalogView
```

Anyone with equal inputs may reconstruct the equal view. No originating
object, context, constructor brand, capability, retained process, or view
admission event is part of validity. `RunInvocationPort` rehydrates the
runtime catalog at the explicit prefix and revalidates the complete equal view
before admitting invocation use. The invocation event records the exact view
ref and digest; it does not retroactively turn view construction into an
admission.

The CatalogApplication equation is exact:

```text
constructCatalogApplication(
  admitted immutable install,
  deterministic CatalogView,
  exact declaration,
  explicit DurablePrefixCoordinate
) -> canonical CatalogApplication
```

Anyone with equal inputs may reconstruct the equal carrier. No originating
object, store, context, brand, capability, actor, or prior constructor call is
part of validity. `RunInvocationPort` rehydrates the install and runtime
catalog at the explicit prefix, reconstructs and compares the view and
application, validates the declaration, and records the exact application ref
and digest in the owning invocation event. Application itself remains
eventless.

The retained PFC-F08 refusal classes are exactly:

```text
forbidden_operation_identity
duplicate_contract_identity
missing_projected_identity
unexpected_projected_identity
retained_row_changed
owning_product_mismatch
unresolved_locator
content_digest_mismatch
```

Each refusal contains the exact attempt, one class, unique non-empty JSON
pointer paths, no catalog, no diagnostic, and no event.

## 7. Event Calculus, Replay, Identity, And Retry

### 7.1 Singular runtime truth

For an exact verified prefix `P`:

```text
deriveRuntimeTruth(P.events, declared Event Calculus laws) -> RuntimeTruth(P)
replay(P) = projectReplay(RuntimeTruth(P))
project.read(P, key) = ownerProjector[key](RuntimeTruth(P))
```

Replay and reads do not fold raw events independently. Disposable indexes are
lawful only when their result is proven equal to the owning Event Calculus
projector and their deletion changes no answer.

Every current/latest query first filters by the exact declared scope and then
selects by store-assigned admission ordinal. An event for another run,
workspace, binding, graph call, continuation, or artifact scope cannot change
the result. Ordinal collisions or an unorderable applicable set fail closed.

### 7.2 Invocation identity

Effectful invocation uniqueness is a projection of admitted
`public_operation_admitted` or owning admission events over the exact store
and invocation ref/digest. The identity is not claimed until the owning event
append succeeds. Raw-parse, indexed-admission, prerequisite, target, and owner
refusals before admission do not consume it. A retry after restart receives the
same durable duplicate result as a retry in the originating process.

Definitions marked pure read are explicitly repeatable and emit no invocation
event. Repeatability is metadata in the owner packet, not a Set bypass.

### 7.3 Retry input

The existing retry event family is extended in place, not replaced. The event
that durably opens an executable retry attempt preserves the exact input
contract coordinate, canonical input ref and digest, and either canonical
input bytes or an exact durable content-addressed locator whose bytes are
verified before projection. One ABG Event Calculus projector yields
`ExecutableRetryInput` for the next attempt. HoG consumes only that projector.
No executor Map or retained object is required.

Continuation, source-result, closure, cursor, causation, and run projection
bases are rehydrated through the same scoped truth. Current
`PublicContinuationAuthority` and `PublicRunProjectionAuthority` constructor
semantics are replaced by unverified coordinate parsing plus ABG-backed basis
rehydration; a self-consistent caller value is never admitted merely because
its digest matches itself.

## 8. One Normalized Program Before Effects

Validator raw admission produces one canonical normalized Program. Validator
and HoG consume the same frozen value and digest. Neither rebuilds a node Map,
accepts caller GraphFunction order as identity, or selects a first duplicate.

The pre-effect topology predicate requires:

- unique node identity;
- a non-empty exact start set and non-empty exact terminal set;
- every start and terminal names a declared node;
- terminal nodes have outdegree zero;
- every non-terminal has exactly the outdegree required by its declared term;
- every edge endpoint is declared;
- every executable node and every terminal is reachable from a start;
- all finite terms satisfy declared boundedness; and
- a cycle exists only where a declared recursion constructor and its governed
  bound/foldback law authorize that exact cycle.

Failure produces the stable Validator diagnostic before a runtime event,
archive write, worker/plugin call, or leaf effect. HoG accepts only the
successful `AdmittedNormalizedProgram` and refuses a different digest.

Identity-bearing semantic sets use one explicit Unicode code-unit comparator.
Canonicalization sorts by canonical semantic identity and canonical member
bytes, preserves duplicates until duplicate rejection, and never uses
`localeCompare`, caller order, filesystem order, or object iteration order.
Permuting equal semantic membership preserves ProgramValidation,
GraphValidation, ExecutionBasis, invocation, and replay identities.

## 9. Common Refusal And Outcome Projection

The common admitted-envelope refusal code is exactly one of:

```text
duplicate_invocation
invalid_request
missing_prerequisite
owner_refusal
target_mismatch
```

The mapping is structural:

| Phase | Common code | Preserved detail |
|---|---|---|
| common envelope or selected owner request fails its closed schema/relation | `invalid_request` | exact issue identities and paths |
| operation/key/family/catalog coordinate or selected definition digest does not match | `target_mismatch` | exact expected and actual coordinates |
| a required admitted artifact, prefix, scope, or rehydrated basis is absent | `missing_prerequisite` | exact missing coordinate |
| the exact effectful invocation identity is already admitted | `duplicate_invocation` | exact prior event and invocation coordinates |
| selected owner port returns its typed refusal | `owner_refusal` | exact nested owner refusal value, type, code, and evidence |

Unreadable bytes and readable wrong-digest bytes therefore remain distinct
nested Product refusals under `owner_refusal`; they cannot collapse to prose.
Unknown extra common codes, free strings, `JsonValue`, and owner-refusal
flattening are invalid projections. SDK, CLI, Codex, schemas, and replay expose
the same outer code and nested value.

Outcome projection failure is a distinct structural adapter disposition. It
is not owner truth, cannot be nested under `owner_refusal`, and is not a sixth
common refusal code. `projectPublicOutcome` returns this exact indexed member
when the selected owner callable returns a value that cannot lawfully occupy
its indexed result, refusal, or non-terminal slot:

```text
OutcomeProjectionRefusal<K> = {
  outcomeKind: "projection_refusal"
  payloadContract: ProjectionRefusalContractCoordinate
  value: {
    failureClass:
      "malformed_owner_output"
      | "cross_definition"
      | "wrong_contract"
      | "digest_mismatch"
      | "unexpected_nonterminal"
      | "relation_mismatch"
    issuePaths: Unique<JsonPointer>
    candidateDigest
    evidenceRefs: Unique<Ref<Evidence>>
  }
}
```

This member appears in the common outcome native symbol and schema and in
every indexed operation row. Its adapter exit class is exactly
`adapterFailure = 70`. Result, common `owner_refusal`, and non-terminal exits
are `0`, `1`, and `3`; pre-index common-envelope, family-lookup, and indexed
admission refusals exit `2`. A projection refusal contains no owner result or
refusal truth and does not append a runtime event.

## 10. Exact Source And Dependency Construction Map

### 10.1 Installed coordinate

All definitions are loaded from package `@abiogenesis/typescript-tenant`,
export `./public`, runtime value `PUBLIC_FUNCTION_DEFINITION_FAMILY`, member
path `[operationId][definitionKey].ownerPort`. `PUBLIC_OPERATION_SCHEMAS` is
the later generated schema projection. No second package export or private
source import is required by a consumer or the all-port probe.

The package must include the compiled transitive closure of every row below,
even when the Gate 2 sentinel does not execute that row.

### 10.2 Closure ledger

| ID | Target source and runtime exports | Complete source dependency closure |
|---|---|---|
| `D00` | `public/definition_family.ts`: `PUBLIC_FUNCTION_DEFINITION_FAMILY`; `public/invoke.ts`: exact four-step invocation | `public/envelope.ts`, `public/invocation_admission.ts`, `public/outcome_projection.ts`, `public/project_read_contracts.ts`, and `D01..D15`; no legacy Public file |
| `D01` | `product/workspace_operations.ts`: `WORKSPACE_OPERATION_CONTRACTS`, `WorkspaceOperationPort` | new workspace filesystem construction, `product/exact_match.ts`, ABG environment/artifact admission, event store/calculus, shared canonical JSON/digests/references |
| `D02` | `product/project_read_ports.ts`: `PRODUCT_PROJECT_READ_CONTRACTS`, `CatalogProjectionPort`, `WorkspaceProjectionPort`, `InstallProjectionPort`, `ReleaseProjectionPort`, `ConsensusProjectionPort` | `product/catalog.ts`, `product/environment.ts`, `product/install_product.ts`, `product/publication.ts`, `product/semantics.ts`, `gtl/consensus.ts`, and shared canonical JSON/digests/references |
| `D03` | `abg/project_read_ports.ts`: `ABG_PROJECT_READ_CONTRACTS` and all ABG projection port values | `abg/event_calculus.ts`, `abg/replay.ts`, `abg/continuation.ts`, `abg/c_call.ts`, `abg/closure.ts`, `abg/traversal_cursor.ts`, and shared canonical JSON/digests/references; all run/graph-call/result/assessment/witness/workspace/interaction projector equations live in this target module rather than unnamed helpers |
| `D04` | `product/verification_operation.ts`: `PRODUCT_VERIFICATION_CONTRACTS`, `ProductVerificationPort` | `product/verify_product.ts`, `product/installed_module.ts`, `product/publication.ts`, native-contract verification, shared canonical JSON/digests/references |
| `D05` | `product/environment_operations.ts`: `PRODUCT_ENVIRONMENT_CONTRACTS`, `ProductEnvironmentPort` | `product/environment.ts`, `product/exact_match.ts`, `D04` carrier contracts, ABG environment/artifact admission, event store/calculus, shared canonical JSON/digests/references |
| `D06` | `product/install_operation.ts`: `PRODUCT_INSTALL_CONTRACTS`, `ProductInstallPort` | `product/install_product.ts`, `D04`, `D05`, ABG environment/artifact admission, event store/calculus, shared canonical JSON/digests/references |
| `D07` | `product/catalog_operations.ts`: `CATALOG_OPERATION_CONTRACTS`, `CatalogOperationPort` | `product/catalog.ts`, `D05`, `D06`, ABG catalog/artifact admission, event store/calculus, shared canonical JSON/digests/references |
| `D08` | `product/run_invocation_operation.ts`: `RUN_OPERATION_CONTRACTS.invoke`, `RunInvocationPort` | Product invocation/catalog/application, `D07`, `D13`, HoG direct execute, ABG invocation admission/event store/calculus/replay/`retry.ts::projectExecutableRetryInput`/closure, shared canonical JSON/digests/references |
| `D09` | `product/run_continuation_operation.ts`: `RUN_OPERATION_CONTRACTS.continue`, `RunContinuationPort` | Product continuation meaning, `D08`, ABG continuation/event store/calculus/replay/`retry.ts::projectExecutableRetryInput`/closure, HoG `execute.ts::resumeProjectedRetry` plus direct execute, shared canonical JSON/digests/references |
| `D10` | `product/interaction_response_operation.ts`: `INTERACTION_OPERATION_CONTRACTS`, `InteractionResponsePort` | Product response evaluation, ABG continuation/event admission/calculus/replay, shared canonical JSON/digests/references |
| `D11` | `product/result_assessment_operation.ts`: `RESULT_OPERATION_CONTRACTS`, `ResultAssessmentPort` | Product result/assessment contracts, ABG result/event admission/calculus/replay, shared canonical JSON/digests/references |
| `D12` | `abg/witness_admission_operation.ts`: `WITNESS_OPERATION_CONTRACTS`, `WitnessAdmissionPort` | ABG witness/event store/calculus/replay and shared canonical JSON/digests/references |
| `D13` | `validator/conformance_operation.ts`: `CONFORMANCE_OPERATION_CONTRACTS`, `ConformancePort` | Validator raw admission, validation, graph, C algebra, implementation resolution, GTL contract/declaration types, shared canonical JSON/digests/references |
| `D14` | `product/materialization_operations.ts`: `MATERIALIZATION_OPERATION_CONTRACTS`, `ProductMaterializationPort` | Product filesystem/configuration construction, ABG artifact admission/event store/calculus, shared canonical JSON/digests/references |
| `D15` | `product/release_snapshot_operations.ts`: `RELEASE_OPERATION_CONTRACTS`, `ReleaseSnapshotPort` | closed release request/refusal contracts and shared canonical JSON/digests/references; no M6/M7 success authority |
| `D16` | `product/publication.ts`: `PUBLIC_CATALOG_BINDING_CONTRACTS`, `bindS06PublicFunctionCatalog` | extant Product publication/catalog carriers and shared canonical JSON/digests/references; consumes an explicit PFC-F07 proposal input and never imports Public runtime modules |

This ledger is prospective package closure, not a claim that the files or
values already exist. Each `Dxx` closure is the complete transitive import
fixed point rooted at the exact files in its row. The package includes the
whole compiled `dist` graph and generated family assets; it has no
sentinel-specific file allowlist. Gate 2 records that fixed point and proves it
by loading every selected function from the packed `./public` export after
removing source-tree resolution.

### 10.3 Exact non-read definitions

Each row joins to the same-numbered accepted census rows for current
file/export/blob, slots, effect, and deletion impact.

| Census rows | Operation / exact keys | Owner contract -> callable value | Target / closure | Runtime disposition |
|---:|---|---|---|---|
| 1-2 | `workspace.create / clean, imported` | `WORKSPACE_OPERATION_CONTRACTS.create[key]` -> `WorkspaceOperationPort.create` | `product/workspace_operations.ts` / `D01` | filesystem plus owner-admitted artifact event |
| 3 | `workspace.open / open` | `WORKSPACE_OPERATION_CONTRACTS.open.open` -> `WorkspaceOperationPort.open` | `product/workspace_operations.ts` / `D01` | exact workspace rehydration; artifact admission only when producing a new admitted prerequisite |
| 28 | `product.verify / verify` | `PRODUCT_VERIFICATION_CONTRACTS.verify` -> `ProductVerificationPort.verify` | `product/verification_operation.ts` / `D04` | deterministic eventless complete carrier |
| 29 | `product.resolve / resolve` | `PRODUCT_ENVIRONMENT_CONTRACTS.resolve` -> `ProductEnvironmentPort.resolve` | `product/environment_operations.ts` / `D05` | deterministic eventless complete lock |
| 30 | `product.install / install` | `PRODUCT_INSTALL_CONTRACTS.install` -> `ProductInstallPort.install` | `product/install_operation.ts` / `D06` | filesystem plus admitted artifact truth |
| 31 | `workspace.bind / bind` | `PRODUCT_ENVIRONMENT_CONTRACTS.bind` -> `ProductEnvironmentPort.bindWorkspace` | `product/environment_operations.ts` / `D05` | immutable binding plus admitted artifact truth |
| 32 | `catalog.admit / admit` | `CATALOG_OPERATION_CONTRACTS.admit` -> `CatalogOperationPort.admit` | `product/catalog_operations.ts` / `D07` | ABG runtime catalog events and Event Calculus |
| 33 | `catalog.view / allowlist` | `CATALOG_OPERATION_CONTRACTS.view.allowlist` -> `CatalogOperationPort.constructView` | `product/catalog_operations.ts` / `D07` | deterministic eventless narrowing |
| 34-35 | `catalog.apply / node_type, overlay` | `CATALOG_OPERATION_CONTRACTS.apply[key]` -> `CatalogOperationPort.apply` | `product/catalog_operations.ts` / `D07` | deterministic eventless construction |
| 36-37 | `run.invoke / invoke, start` | `RUN_OPERATION_CONTRACTS.invoke[key]` -> `RunInvocationPort[key]` | `product/run_invocation_operation.ts` / `D08` | ABG invocation/traversal events; exact application use when present |
| 38-39 | `run.continue / current_intent, selected_action` | `RUN_OPERATION_CONTRACTS.continue[key]` -> `RunContinuationPort[key]` | `product/run_continuation_operation.ts` / `D09` | ABG continuation/traversal events |
| 40-44 | `interaction.respond / select, approve, reject, assess, answer_escalation` | `INTERACTION_OPERATION_CONTRACTS.respond[key]` -> `InteractionResponsePort.respond` | `product/interaction_response_operation.ts` / `D10` | actor-attributed response event |
| 45 | `result.assess / assess` | `RESULT_OPERATION_CONTRACTS.assess` -> `ResultAssessmentPort.assess` | `product/result_assessment_operation.ts` / `D11` | assessment event or exact non-close |
| 46-51 | `witness.admit / reprice, attest, hygiene-stamp, intake, run-resumed, run-stopped` | `WITNESS_OPERATION_CONTRACTS.admit[key]` -> `WitnessAdmissionPort.admit` | `abg/witness_admission_operation.ts` / `D12` | exact witnessed ABG event |
| 52 | `conformance.evaluate / gtl_program` | `CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program` -> `ConformancePort.evaluateGtlProgram` | `validator/conformance_operation.ts` / `D13` | deterministic eventless whole-Program evaluation |
| 53-54 | `product.materialize / context_bootstrap, configuration` | `MATERIALIZATION_OPERATION_CONTRACTS[key]` -> `ProductMaterializationPort[key]` | `product/materialization_operations.ts` / `D14` | filesystem plus admitted artifact truth |
| 55-56 | `release.snapshot / published_rc, tapped_release` | `RELEASE_OPERATION_CONTRACTS.snapshot[key]` -> `ReleaseSnapshotPort[key]` | `product/release_snapshot_operations.ts` / `D15` | callable exact owner refusal; no success/event before later authority |

### 10.4 Exact project.read definitions

`src/public/project_read_contracts.ts` exports the accepted
`PROJECT_READ_CONTRACTS` and `PROJECT_READ_OWNER_PORTS` names as frozen exact
joins. For every key, `PROJECT_READ_CONTRACTS[key]` is object-identical to the
listed owner-local contract member and `PROJECT_READ_OWNER_PORTS[key].project`
is object-identical to the listed owner callable. Public creates no schema,
result, default, wrapper callable, or semantic branch.

| Census row | Key | Exact owner-local contract member | Actual owner callable | Target / closure |
|---:|---|---|---|---|
| 4 | `catalog_list` | `PRODUCT_PROJECT_READ_CONTRACTS.catalog_list` | `Product.CatalogProjectionPort.list` | `product/project_read_ports.ts` / `D02` |
| 5 | `catalog_describe` | `PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe` | `Product.CatalogProjectionPort.describe` | `product/project_read_ports.ts` / `D02` |
| 6 | `workspace_status` | `PRODUCT_PROJECT_READ_CONTRACTS.workspace_status` | `Product.WorkspaceProjectionPort.status` | `product/project_read_ports.ts` / `D02` |
| 7 | `run_status` | `ABG_PROJECT_READ_CONTRACTS.run_status` | `ABG.RunProjectionPort.run_status` | `abg/project_read_ports.ts` / `D03` |
| 8 | `graph_call_status` | `ABG_PROJECT_READ_CONTRACTS.graph_call_status` | `ABG.GraphCallProjectionPort.graph_call_status` | `abg/project_read_ports.ts` / `D03` |
| 9 | `run_result` | `ABG_PROJECT_READ_CONTRACTS.run_result` | `ABG.RunProjectionPort.run_result` | `abg/project_read_ports.ts` / `D03` |
| 10 | `graph_call_result` | `ABG_PROJECT_READ_CONTRACTS.graph_call_result` | `ABG.GraphCallProjectionPort.graph_call_result` | `abg/project_read_ports.ts` / `D03` |
| 11 | `run_evidence` | `ABG_PROJECT_READ_CONTRACTS.run_evidence` | `ABG.RunProjectionPort.run_evidence` | `abg/project_read_ports.ts` / `D03` |
| 12 | `graph_call_evidence` | `ABG_PROJECT_READ_CONTRACTS.graph_call_evidence` | `ABG.GraphCallProjectionPort.graph_call_evidence` | `abg/project_read_ports.ts` / `D03` |
| 13 | `result_evidence` | `ABG_PROJECT_READ_CONTRACTS.result_evidence` | `ABG.ResultProjectionPort.evidence` | `abg/project_read_ports.ts` / `D03` |
| 14 | `assessment_evidence` | `ABG_PROJECT_READ_CONTRACTS.assessment_evidence` | `ABG.AssessmentProjectionPort.evidence` | `abg/project_read_ports.ts` / `D03` |
| 15 | `witness_evidence` | `ABG_PROJECT_READ_CONTRACTS.witness_evidence` | `ABG.WitnessProjectionPort.evidence` | `abg/project_read_ports.ts` / `D03` |
| 16 | `install_evidence` | `PRODUCT_PROJECT_READ_CONTRACTS.install_evidence` | `Product.InstallProjectionPort.evidence` | `product/project_read_ports.ts` / `D02` |
| 17 | `release_evidence` | `PRODUCT_PROJECT_READ_CONTRACTS.release_evidence` | `Product.ReleaseProjectionPort.evidence` | `product/project_read_ports.ts` / `D02` |
| 18 | `workspace_replay` | `ABG_PROJECT_READ_CONTRACTS.workspace_replay` | `ABG.WorkspaceProjectionPort.workspace_replay` | `abg/project_read_ports.ts` / `D03` |
| 19 | `run_replay` | `ABG_PROJECT_READ_CONTRACTS.run_replay` | `ABG.RunProjectionPort.run_replay` | `abg/project_read_ports.ts` / `D03` |
| 20 | `graph_call_replay` | `ABG_PROJECT_READ_CONTRACTS.graph_call_replay` | `ABG.GraphCallProjectionPort.graph_call_replay` | `abg/project_read_ports.ts` / `D03` |
| 21 | `interaction_replay` | `ABG_PROJECT_READ_CONTRACTS.interaction_replay` | `ABG.InteractionProjectionPort.replay` | `abg/project_read_ports.ts` / `D03` |
| 22 | `continuation_replay` | `ABG_PROJECT_READ_CONTRACTS.continuation_replay` | `ABG.ContinuationProjectionPort.replay` | `abg/project_read_ports.ts` / `D03` |
| 23 | `c_call_replay` | `ABG_PROJECT_READ_CONTRACTS.c_call_replay` | `ABG.CCallProjectionPort.replay` | `abg/project_read_ports.ts` / `D03` |
| 24 | `workspace_gaps` | `ABG_PROJECT_READ_CONTRACTS.workspace_gaps` | `ABG.WorkspaceProjectionPort.workspace_gaps` | `abg/project_read_ports.ts` / `D03` |
| 25 | `run_gaps` | `ABG_PROJECT_READ_CONTRACTS.run_gaps` | `ABG.RunProjectionPort.run_gaps` | `abg/project_read_ports.ts` / `D03` |
| 26 | `run_lawful_actions` | `ABG_PROJECT_READ_CONTRACTS.run_lawful_actions` | `ABG.RunProjectionPort.run_lawful_actions` | `abg/project_read_ports.ts` / `D03` |
| 27 | `ticket_consensus` | `PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus` | `Product.ConsensusProjectionPort.ticketConsensus` | `product/project_read_ports.ts` / `D02` |

All 24 are pure, explicitly repeatable, and eventless. ABG-owned rows consume
only `RuntimeTruth(P)` from the Event Calculus. Product-owned rows consume
complete immutable Product inputs or the same ABG projection where their
Product equation explicitly joins runtime truth.

## 11. Atomic Hard Break And Generated Projections

Construction happens behind an unreachable internal module. No package export,
SDK member, CLI grammar, Codex path, schema, catalog row, or manifest row may
name it before the swap.

The atomic swap in one Gate 2 cut:

1. makes `PUBLIC_FUNCTION_DEFINITION_FAMILY` the sole `./public` family;
2. rewires the SDK to the exact family;
3. derives CLI and Codex grammar from the SDK/family;
4. derives schemas and PFC-F07 proposals from the family;
5. uses Product PFC-F08 to bind the static manifest catalog;
6. deletes every file and test in the census deletion manifest; and
7. proves all forbidden names and new-to-old translations unreachable.

There is no adapter, alias, dual export, conversion, `legacyRequest`,
`indexedRequest ?? legacyRequest`, semantic fallback, or transitional schema.
The current legacy scenario meaning is rewritten against exact owner contracts;
tests whose only meaning is legacy carrier behavior are deleted.

The required projection graph is exactly the census Section "Required graph".
Generator idempotence and exact-set equality replace line review of generated
files.

## 12. Bounded Pre-S06 Recurrence Disposition

This gate selects no post-S06 Prime work. It disposes only the four recurrence
families S06 must exercise:

| Family | Disposition | Constraint |
|---|---|---|
| exact catalog coordinate lookup | consume `product/exact_match.ts::resolveExactMatch` | Product-local exact zero/one/many atom; no Public fallback or new identity family |
| verified installed-module loading | retain `product/installed_module.ts::loadVerifiedInstalledModule` | remains Product-local because it binds `ProductInstall`; no generic loader or ambient import |
| Product dependency topology | extend `product/environment.ts::constructResolvedProductLock` behind `ProductEnvironmentPort.resolve` | consumes explicit verified carriers; no resolver registry, global selection, or second lock type |
| GTL declaration/publication construction | consume `GTL_DECLARATION_CONSTRUCTORS` and existing Hello/Consensus/fan-out/recursion publication constructors | no new generic builder, compiler plan, discovery service, or Public construction meaning |

These dispositions are implementation constraints inside S06. The distinct
post-S06 Prime entropy-reduction milestone remains blocked.

## 13. Falsifiers And Gate 2 Sentinel

The accepted census's `AX-F01..F14` and `AX-PFC-F08` records are the immutable
base falsifier specifications for this design. This section binds their target
callables to Sections 10.2 through 10.4 and makes the `AX-F08` and `AX-F09`
records decision-complete. These completions do not change either mutation or
green oracle.

For `AX-F03` and `AX-PFC-F08`, absence of the target export is the expected
baseline red signature. Increment 0A may record that absence but may not build
a test-side reference implementation or change the final per-mutation oracle.
`AX-F07` remains a preservation probe unless its exact second-process consumer
demonstrates brand-only failure.

### 13.1 `AX-F08` decision completion

Each row is an independent paired fixture. The control store contains the
exact valid run-R prefix. The interleaved store contains the same prefix plus
one valid event for disjoint run S immediately before the target call. Before
the call, the fixture proves that `replay(store, { runId: R })` and every
run-R input ref, digest, scope, and admission basis equal the control. The S
event is the only mutation.

| Fixture | Exact current ingress | Frozen current baseline signature after S |
|---|---|---|
| initial cursor | `src/abg/traversal_cursor.ts::admitInitialTraversalCursor` | `traversal_cursor_admission_refusal`, code `scope_mismatch`, message `initial cursor must immediately extend the opened frame truth`; no R cursor event appended |
| continuation reconstruction | `src/abg/continuation.ts::rehydrateFhContinuation` | returns `null` because the admitted `run.continue` operation ordinal is not the global tail |
| F_H response | `src/abg/continuation.ts::admitFhInteractionResponse` | throws `TypeError("F_H response requires one exact open continuation and admitted response operation")`; no R response event appended |
| F_H resume | `src/abg/continuation.ts::admitFhInteractionResume` | throws `TypeError("F_H resume requires one exact responded continuation and successor cursor")`; no R resume event appended |
| normal closure | `src/abg/closure.ts::admitClosure` with otherwise valid R terminal route | throws `TypeError("runtime event causation cannot cross a run scope")` while attempting the erroneous refusal; no R closure or failure event appended |
| interaction closure | `src/abg/closure.ts::admitInteractionClosure` with otherwise valid R response/resume/terminal route | throws `TypeError("runtime event causation cannot cross a run scope")` while attempting the erroneous refusal; no R closure or failure event appended |
| child closure | `src/abg/closure.ts::admitChildClosure` with otherwise valid R child terminal route | `child_closure_admission_refusal`, code `replay_mismatch`, message `child closure basis is not current replay truth`; no R child-closure event appended |
| refusal causation | `src/abg/closure.ts::admitClosure` with one predeclared R-local `runtime_basis_mismatch` mutation in both paired stores | control returns `closure_admission_refusal` with one R-scoped failure event; interleaved call throws `TypeError("runtime event causation cannot cross a run scope")` and appends no failure event because `refuseClosure` selects S as cause |

The target oracle for every row is exact control/interleaved equality for the
run-R typed disposition, emitted run-R event bodies and refs, and run-R replay.
No returned or emitted causal reference may name S. A prerequisite failure,
invalid envelope, or unequal run-R replay is fixture failure and cannot count
as the baseline signature.

### 13.2 `AX-F09` decision completion

The current executable ingress is
`src/hog/graph_execute.ts::executeGraphTraversal`. The target owner-internal
callables are exactly:

- `src/abg/retry.ts::projectExecutableRetryInput`;
- `src/hog/execute.ts::resumeProjectedRetry`.

The installed exact-family ingress is package
`@abiogenesis/typescript-tenant`, export `./public`, callable
`PUBLIC_FUNCTION_DEFINITION_FAMILY["abg.operation.run.continue"]["current_intent"].ownerPort`.
That Product owner port rehydrates the explicit prefix, calls
`projectExecutableRetryInput`, and supplies only its admitted result to
`resumeProjectedRetry`; neither Public nor the owner port reconstructs retry
meaning.

The fixture source is the exact C.retry Program, contract-admitted input, and
first-attempt malformed-result worker from
`test_env/tests/m5-installed-retry.test.mjs`. Process P1 is terminated only
after its event-log writer acknowledges the exact `retry_progress_recorded`
frontier and the corresponding admitted attempt, input-contract coordinate,
input ref/digest, and verified input preimage are durable. Process P2 receives
only the serialized `DurablePrefixCoordinate` plus the exact indexed
`run.continue/current_intent` request; no JavaScript object or test-memory copy
of the input crosses the process boundary.

The frozen current baseline is that the durable log identifies the retry
frontier and digest, while the executable input exists only in
`executeGraphTraversal`'s process-local `Map<string, RetainedRetryInput>`.
After P1 termination there is no callable that can recover that value; a
current HoG completion without the retained entry reaches
`diagnostic://abiogenesis/hog/retry-input-basis-absent@5`. Increment 0A may use
a dynamic-import absence assertion for the two target exports, but it may not
implement a projector in the test.

The target oracle is one canonical `ExecutableRetryInput` with the same input
contract, ref, digest, canonical value, retry boundary, and next attempt
identity in P2, followed by one successful call through the installed owner
port. As an isolated masking check, the source test may call
`projectExecutableRetryInput` directly and then
`resumeProjectedRetry`; both results must equal the installed owner-port
result. A missing/invalid prefix, unavailable verified preimage, or failure
before the projector is fixture failure rather than evidence for `AX-F09`.

The Gate 2 sentinel remains ten invocations across nine operation identities:

```text
product.verify(verify)
  -> product.resolve(resolve)
  -> product.install(install)
  -> workspace.bind(bind)
  -> catalog.admit(admit)
  -> catalog.view(allowlist)
  -> catalog.apply(node_type)
  -> run.invoke(invoke)
  -> project.read(run_result)
  -> project.read(run_replay)
```

It crosses fresh processes using only serialized complete carriers and explicit
durable-prefix coordinates. The two reads agree because both consume the same
scoped Event Calculus result. The installed tarball must nevertheless contain
and mechanically load/resolve all 56 port closures.

## 14. Construction Order After Direct Gate 1 Acceptance

This section is sequencing only; it grants no current implementation authority.

1. Freeze the accepted falsifier baseline against unchanged production.
2. Construct the normalized Program and pre-effect topology boundary.
3. Construct scoped Event Calculus projections, explicit durable ingress,
   retry input reconstruction, and event-derived identity.
4. Construct complete verification/resolution carriers and owner-backed setup
   rehydration.
5. Construct deterministic catalog view/application and static PFC-F08.
6. Build every owner-local packet and actual port value in `D01..D15`, keeping
   `D00` unreachable.
7. Mechanically prove all 56 internal port values and dependency closures.
8. Perform the atomic family/export/deletion swap.
9. Pack the entire closure, probe all 56 ports, run the fresh-process sentinel,
   bind every falsifier baseline to its green result, and freeze Gate 2.

After each vertical operation, scan for the complete forbidden legacy set. A
compatibility facade, second authority path, Public semantic switch, rival
catalog, or process-local runtime dependency stops the cut rather than
creating a forward repair campaign.

## 15. Gate 1 Review Contract

The constructability reviewer attempts to disprove:

- exact 18/56 arithmetic and row joins;
- presence of a target source, actual runtime value, installed coordinate, and
  complete closure for every row;
- absence of owner-to-Public dependencies and package cycles;
- falsifier ingress/oracle/masking constructability; and
- all-56 package closure rather than sentinel-only packaging.

The authority reviewer attempts to find a Product, ticket, requirement,
accepted-design, or STDO counterexample to:

- singular Public and catalog authority;
- Event Calculus ownership of runtime truth;
- explicit carriers and prefix;
- deterministic CatalogApplication;
- normalized pre-effect Program law;
- exact common and PFC refusal relations;
- hard-break reachability; and
- milestone boundaries.

Both reviewers inspect the same frozen commit and tree. They do not edit this
subject or author replacement features. A cited counterexample rejects the
subject and returns it to direct F_H. Absence of a counterexample does not
itself authorize implementation; direct F_H acceptance of the exact reviewed
subject unlocks only Increment 0A.
