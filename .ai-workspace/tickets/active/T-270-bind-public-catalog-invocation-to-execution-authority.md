# T-270 - Bind Public run.invoke To Admitted One Surface Execution Authority

- id: T-270
- title: Bind public run.invoke to admitted One Surface execution authority
- type: bug
- ticket_category: implementation_migration
- status: active
- phase_status: post_af14_root_carrier_constructability_design_accepted_runtime_authorized
- review_status: independent_review_accepted_fh_authority_accepted
- proof_status: accepted_design_sunny_day_runtime_integration_pending
- delivery_phase: DS-2 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Join one admitted PublicInvocation<run.invoke>, its exact InvocationAuthority,
    immutable WorkspaceBinding, admitted GtlProgram, narrowing CatalogView,
    program-owned GraphFunction, admitted NextActionProjection, and AF-14
    ConstructionIntent to the existing T-255/T-267/T-271 compiler chain; mint
    one subordinate non-effect start-admission witness and one sole
    effect-authorizing ExecutionBasis without selecting or ordering One Surface
    work.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design public invocation and compiled
    execution handoff boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-18
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-255
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    catalog_invocation.ts
- dependencies:
  - ratified T-278 Ontology digest f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8
  - accepted One Surface AF-11, AF-12, AF-13, AF-14, and AF-16 authority contracts
  - accepted 19-operation PublicFunctionDefinition family
  - completed T-255
  - completed T-267
  - completed T-271
- downstream_dependencies:
  - T-281 P1 consumes the neutral owner-native run.invoke contract family
  - accepted T-274B1 exact native-definition delivery is an AF-15/runtime-authority input
  - an independently reviewed AF-15/runtime-authority milestone unblocks T-272 and T-274B2 publication
  - T-272 continuation consumes held F_H truth
  - T-281 P2 atomically publishes the route and retires the legacy public identity
  - T-268 aggregates the final tenant capability manifest
  - T-276 owns installed existing, alternate, and temporary-workspace scenarios
- authority_refs:
  - specification/GOALS.md DS-2
  - specification/INTENT.md public invocation spine
  - specification/PRODUCT.md public operator contract and One Surface
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md 008..010
  - specification/requirements/product/REQ-P-POLICY.md 019..025, 053..054, 062..064
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md 001..010
  - specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md 003..005
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md 002, 009..013, 029..030
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md 015..018
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md 022..024, 026..027
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md
- pre_ontology_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T140354Z_DECISION_fh_authorize_t277_implementation.md
- prior_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T062747Z_DECISION_fh_accept_t270_reconciled_run_invoke_design.md
- accepted_ingress_order_design_ref: >-
    .ai-workspace/comments/codex/
    20260718T070154Z_DECISION_t270_ingress_order_design_acceptance.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260718T074352Z_DECISION_t270_post_af14_root_carrier_acceptance.md
- prior_design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260718T014552Z_SELF_REVIEW_t270_boundary_checkpoint_reconciliation.md
- constructability_design_status: bounded_post_af14_root_carrier_constructability_amendment_accepted
- constructability_design_digest: a489bf238a99f78ef350098d86ba079044948b7bf6a7b8a13efbdc275ee354cf
- accepted_constructability_design_digest: a489bf238a99f78ef350098d86ba079044948b7bf6a7b8a13efbdc275ee354cf
- constructability_review_and_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260718T074352Z_DECISION_t270_post_af14_root_carrier_acceptance.md
- accepted_ingress_order_constructability_review_ref: >-
    .ai-workspace/comments/codex/
    20260718T070154Z_DECISION_t270_ingress_order_design_acceptance.md
- runtime_schema_implementation_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260718T033507Z_SELF_REVIEW_t270_runtime_schema_topology_implementation.md

## Boundary

Delivery has two ordered milestones. The pre-P1 milestone publishes the exact
neutral owner-native request, result, refusal, and non-terminal contracts for
`run.invoke(invoke | start)`. It performs no public admission, selection,
handler call, event emission, or runtime effect and imports no M04 public
carrier. T-281 P1 composes those owner contracts into the private definition
family. Only then may the public runtime-integration milestone below resume.

Public ingress validates, admits, and transports one `run.invoke` request. Its
pre-AF-13 preparation is process-local only: it may admit bound product
manifests, a request-constrained candidate public input schema, and one
canonical admitted inline P1 invoke value without a source-Node mapping or
carrier set, but it cannot resolve a catalog execution binding,
project M04 schema capabilities, seal final execution ingress, mint a witness,
or authorize an effect. The admitted GTL program owns AF-11 through AF-16
ordering. `invoke` projects one exact admitted-member constraint into AF-13;
`start(graph_function)` narrows the admitted session catalog,
`start(asset)` requires the published operator-asset ownership projection or
returns its typed gap, and `start(next)` retains the exact admitted view. No
target string is catalog execution authority. Both variants still pass AF-13
selection and AF-14 intent admission.

T-270 execution-authority finalization begins only after AF-13 has admitted a
`NextActionProjection` and AF-14 has admitted a matching `ConstructionIntent`.
It derives exactly one ready callable session entry from the selected
GraphFunction within the admitted view, calls the existing selected-entry
catalog-binding resolver, and verifies the exact
program/function/view/binding/invocation-authority/intent join. Only then does
it project M04 schema capabilities and seal final admitted execution ingress.
The finalizer returns one identity-free process-local tuple containing that
ingress, the existing selected `CatalogExecutionBinding`, and the separate
`RuntimeSchemaAdmissionEngineInput`. It consumes the
immutable T-255 handoff, T-271 plan, T-256 execution contexts, and T-267 static
admission, then derives one subordinate T-270 start-admission witness and admits
one `ExecutionBasis`. T-267 and the witness remain no-effect truth;
`ExecutionBasis` is the sole effect authority.

Runtime evidence returns to program-owned AF-16. A held F_H result remains a
truthful nonterminal for T-272. T-270 does not select work, evaluate closure,
admit capability truth, or project a public terminal directly from a raw
runtime result.

Runtime implementation is authorized only within the accepted bounded
ingress-order amendment. The constructability design remains authoritative for
one immutable invocation-local
admitted runtime-value environment, one M04-installed public input schema set,
one dependency-safe neutral schema-admission capability family whose ordered
sealed bases alone enter admitted ingress, one separate identity-free
process-local AF-15 engine-input envelope carrying the callables,
one private runtime projection derived from the same T-267 compiler drafts,
compiler-conserved GraphVector Operators, one binding-primary/full-locus F_D
implementation resolver, one structure-derived router around the existing
complete-C and graph-level HOF/recurse runtimes, one closed wrapper over their
actual result types with a separate exhaustive fold, and one generic leaf
adapter over existing F_D/F_P/F_H interiors. At an exact F_H hold, the
amendment also derives one contracts-owned dependency-leaf
`FhHeldExecutionCheckpointBasis` after T-271 admits the held receipt. It has
the existing T-271 cursor ref/digest and input payload/lineage refs, remaining
primitive exact held coordinates, and ordered canonical I-JSON carrier rows,
but no identity or digest. The existing `FhInteractionOpenedEvent` carries that
one body, and its existing `interactionBasisDigest` is the sole seal over the
complete checkpoint content. Runner/T-270 adapters above contracts prove exact
conservation from `CProgramExecutionCursor` into `CProgramAtomReceipt` at
`invokeLeaf` and exact equality to the receipt and
`AdmittedInvocationCarrier`; contracts import neither owner. T-272 can
then verify and reconstruct the same environment at the same input coordinate
on `run.continue` without ref lookup, a store, controller, event family, or
public identity. The candidate changes only when selection-derived carriers
may exist; it changes no Prime count, public identity, runtime owner, or
accepted AF-15 capability shape. Implementation may resume only after this
bounded amendment receives explicit F_H acceptance.

Private async pre-AF-13 M04 preparation must load exact bound product manifests
through `BoundWorkspaceContext`. For `invoke`, it loads only the
request-constrained candidate public input schema asset, verifies its root and
digest, admits the inline P1 request value, and retains one immutable
`InstalledPublicSchemaAuthoritySet` plus the canonical admitted `IJsonValue`
process-locally without selecting or inferring a graph-private source Node;
`start` has no public root schema set or value. P2 `inputRef` resolution is
outside this seam. Preparation returns no carrier set, final ingress, selected
execution binding, schema-capability basis, engine input, witness, or effect
authority. Installed public assets do not own graph-private Node schemas.

After AF-13 and AF-14, the selected GraphFunction must derive exactly one ready
callable entry in the admitted `CatalogView`. T-270 uses the existing
selected-entry resolver to obtain the exact `CatalogExecutionBinding`; zero,
multiple, outside-view, noncallable, or AF-13/AF-14 mismatched entries refuse.
The selected binding's Module contributes one closed `Module.metadata`
JSON-blob whose rows map exact
`graphFunctionId + Node.id + Node.schema.ref` tuples to flat strict
`contractId + contractVersion` keys. Each row has exactly those five fields and
contains no full `PublicContractCoordinate`, projection digest, locator, witness,
or callable. Existing `moduleDigest` seals those rows; there is no typed Module
extension or separately authored row/callable digest. The T-252/M03 closed
schema-key/source family covers every reachable public or private Consensus
Node schema, including vector schemas.
M04 also receives existing opaque `NativeContractDefinition` carriers
process-locally. M04 alone verifies them with
`assertNativeContractDefinitionCarrier` and verifies the exact
source-definition relation: one resolved source row identified by
`symbolicSchemaRef + contractId + contractVersion` is the retained process-local
origin of that definition. A cloned, relabeled, or structurally equal row is
not the same relation. `projectM04RuntimeSchemaAdmission` admits one relation
for every distinct Module `symbolicSchemaRef + contractId + contractVersion`
key all-or-nothing before it projects the selected GraphFunction's bases and
engine input. Repeated rows may reuse one relation only when that complete key
is identical. Equal contract id/version coordinates under divergent symbolic
refs require distinct exact relations; current same-contract conservation
requires the same definition carrier, but coordinate reuse alone never admits
a relation. No source row, origin token, or membership registry is published
or serialized. M04 then projects the full coordinate/witness into ordered
dependency-safe `RuntimeSchemaAdmissionCapabilityBasis` values, is the
sole admitted call site for the neutral M03/shared capability constructor, and
seals the bases into final admitted ingress only after the selected binding
exists. Duplicate GraphFunction/Node/schema tuples refuse.
That constructor freezes and `WeakSet`-brands each
`RuntimeSchemaAdmissionCapability`. Each capability contains one digest-sealed
basis of primitive/I-JSON-compatible structural facts plus an undigested
`admit(IJsonValue) -> IJsonValue` function.
The one T-267
compiler core derives the unchanged compact family and a private runtime
projection from the same drafts. AF-15 separately receives the capabilities in
an identity-free, undigested process-local engine-input envelope outside
admitted ingress and every stable-hashed carrier. M03 asserts the neutral brand
and exact-matches every capability basis one-to-one to the admitted ingress
bases and every reachable symbolic schema before basis admission. Zero,
multiple, missing, extra, mismatched, or reforged rows refuse pre-effect. The
T-270 neutral path imports only the neutral shared interface, never
M04/native/public-coordinate/Valibot/witness types; unrelated lawful M03
Valibot imports are outside this negative gate. Output is admitted only through
the bounded function. The function and envelope are excluded from basis
digest, identity, persistence, replay, registry, and ambient lookup. For
`invoke`, pre-AF-13 M04 preparation calls
`admitCatalogGraphFunctionInput` and retains the same canonical admitted value
without a source mapping. Only after the post-AF-14 selected binding exists
does the finalizer derive its exact source interface and construct the
existing single-source `AdmittedInvocationCarrierSet`; zero source Nodes
refuse and multiple source Nodes without an explicit mapping retain
`gap://abg/t270/multi-source-root-input-mapping`. `start` carries no root
value. Raw input, M03
filesystem reads, and implicit multi-source decomposition are forbidden; a
multi-source contract without an explicit value mapping remains
`gap://abg/t270/multi-source-root-input-mapping`.

Every ordinary/workflow C locus must conserve exactly one same-regime
GraphVector Operator by ordinal and full digest; a structural HOF wrapper has
zero, carries a null runtime operator projection exactly, and its child
compiles separately. A null ordinary/workflow projection or non-null structural
projection is compiler-invalid. An ordinary F_D stage first resolves
`Operator.binding`, then exact-matches program, stage, fibre, arm, ordered
carrier, and schema truth to one immutable engine-delivery total I-JSON
implementation. A workflow atom never invokes its parent binding. F_P/F_H
retain Operator evidence without replacing their existing selectors. Handler
selection, plugin selection, and `fdEvaluator` are not F_D fallbacks. Every
F_D, F_P, or child body must pass the exact selected neutral capability basis
target Node/schema binding and result-authority admission before extending the
environment. Installed public schemas cannot service an internal target. F_H returns held
truth and no output carrier; T-271 admits the exact held receipt before AF-15
derives the neutral event checkpoint basis and opens the interaction. The
T-252/M03 closed schema-key/source family owns the canonical Module's complete
public/private/vector Consensus metadata rows. Before T-270, T-274B1 packages
that exact Module and derives/supplies its full opaque native definitions to
M04. After accepted T-270 runtime integration, T-274B2 publishes only T-274A's
nine existing public assets. T-275 owns only the motivating SYSTEM
stdlib/profile/result bindings. T-270 owns only the generic resolver,
environment, and non-Consensus Scenario-09 proof pair. Full native coordinates,
projection digests, locators, witnesses, and callables never enter Module
metadata or imply installed public publication.

The exact F_H hold path has one neutral actual-body carrier: its causative
opened event contains the complete admitted environment checkpoint basis, and
the event's `interactionBasisDigest` covers that content. T-272 may reconstruct
only after exact current-intent, continuation, invocation, basis, graph-call,
frame, plan, held-receipt, cursor ref/digest, input payload/lineage refs, locus,
ordered-row, and canonical-body verification.
Other replay or
non-checkpoint re-entry carriers retain refs and digests, not actual bodies,
and must stop at `gap://abg/t270/runtime-value-environment-rehydration`; no
archive, transcript, filesystem lookup, ambient map, or ref-to-body cast may
substitute.

## Prime Contraction Input

Consume the accepted `PublicFunctionDefinition`, `PublicInvocation`,
`InvocationAuthority`, `WorkspaceBinding`, `GtlProgram`, `CatalogView`,
`NextActionProjection`, `ConstructionIntent`, T-255/T-256/T-267/T-271 carriers,
`ExecutionBasis`, and AF-16 evidence truth. Derive one subordinate
`TraversalExecutionFamilyRuntimeProjection` from the same compiler drafts as
the compact T-267 family; do not promote it into a public/session/basis
authority or compile twice.

`AdmittedRuntimeValueEnvironmentProjection` remains immutable,
invocation-local subordinate payload keyed by exact node/carrier identities.
`FhHeldExecutionCheckpointBasis` remains contracts-owned subordinate content
inside the existing F_H-opened event, derived only from the current environment
and exact held receipt/locus. It has no checkpoint identity or digest; the
existing event's `interactionBasisDigest` is the sole seal. It adds no store,
event family, controller, public identity, selector, or authority source.
`PreparedRunInvokeExecution` and `FinalizedRunInvokeExecution` are private
process-local wrappers over existing authorities, not addressable carriers:
the former retains pre-AF-13 request truth, installed schema truth, and the
canonical admitted inline value without a source mapping; the latter derives
the exact source Node from the post-AF-14 selected binding, constructs the
existing carrier set, and returns final ingress, that selected binding, and
the identity-free AF-15 engine input. They add no semantic authority or IACS
member. `FdOperatorImplementationBinding` remains subordinate engine-delivery wiring
matched by admitted `Operator.binding` plus the full existing C implementation
contract. `InstalledPublicSchemaAuthoritySet`,
the M04 metadata projection, neutral schema capability/basis and identity-free
AF-15 engine-input envelope, Operator
projections, route outcomes, and
the AF-15 fold remain subordinate. Native contract families remain schema
authors through existing opaque `NativeContractDefinition`; the
selected-module relation conserves exact coordinates and projection witnesses,
while the process-local exact source-definition relation proves that the
definition originated from the resolved `symbolicSchemaRef + contractId +
contractVersion` row. Identical full keys may share that relation. Divergent
symbolic refs require distinct exact relations even when current same-contract
conservation requires the same definition carrier. No origin token or registry
is published. The
structure-derived router, resolver, environment extension, and atom callback
are realization
functions over existing compiler/runtime interfaces, not new authorities,
public registries, request families, result families, or C-call owners. The
IACS has 20 explicit carriers while the corrected authority-source count
remains 17 before and after; the prior 16 count omitted the existing native
contract authority. `InstalledPublicSchemaAuthoritySet` is subordinate, not an
IACS authority. Those counts are distinct under ADR-044.

Use a minimal admitted generic capability definition/grant/manifest fixture for
focused T-270 proof. T-268 final manifest aggregation is downstream and cannot
be a closure dependency of this generic authority join.

## Hard Break

- no `abg.operation.catalog.invoke` public authority;
- no GraphFunction-as-program or Module-as-program claim;
- no ingress-owned selection, orchestration, closure, or action evaluation;
- no final execution ingress, selected catalog binding, schema-capability
  projection, witness, or effect authority before AF-13 and AF-14;
- no pre-AF-13 source-Node inference or `AdmittedInvocationCarrierSet`;
- no current-P1 `readInputAsset`; P2 `inputRef` resolution remains outside this seam;
- no request-target string used as selected catalog execution authority;
- no caller-authored runtime authority;
- no mutation of the compact T-267 family or conversion of
  `effectsPermitted: false`; its private runtime sibling derives from the same
  compiler core;
- no payload-value store or caller-authored payload admission;
- no raw public input crossing M04/M03 or inferred multi-source input mapping;
- no installed public schema used as graph-private Node schema authority;
- no string-inferred, ambient, global-registry, or feature-specific runtime
  schema binding;
- no F_D handler/plugin/evaluator fallthrough; `Operator.binding` is the
  primary lookup key and program/stage/fibre/arm/carriers are mandatory
  post-lookup acceptance, while feature/product/profile/payload shape never
  participates;
- no output environment extension before exact wire/target-schema/result
  admission;
- no ref-to-body, archive, transcript, filesystem, or ambient-map rehydration;
  exact F_H continuation may use only the full checkpoint body already admitted
  inside its causative opened event and sealed by that event's
  `interactionBasisDigest`;
- no function-, feature-, profile-, product-, or payload-shape runtime route;
- no adapter-owned second C-call spine;
- no compatibility, fallback, or profile-free route;
- no Consensus-specific branch;
- no T-270-owned capability inference or final manifest;
- no F_H response or continuation; and
- no direct raw runtime-result to public-terminal shortcut.

## Migration Checklist

- [x] superseded public identity and authority path are named
- [x] accepted One Surface input and output boundaries are named
- [x] retained compiler/interpreter carriers are named
- [ ] neutral owner-native run.invoke request/result/refusal/non-terminal contracts are admitted without public or runtime output
- [x] reconciled three-view design received independent F_H acceptance
- [x] prior bounded AF-15 constructability amendment received F_H acceptance
- [x] bounded AF-13/AF-14 ingress-order amendment received independent F_H acceptance before runtime resumed
- [x] bounded post-AF-14 root-carrier constructability amendment received independent F_H acceptance before runtime resumed
- [ ] async pre-AF-13 M04 preparation retains the exact candidate installed public input schema and canonical admitted inline P1 invoke value process-locally without an M03 reader, `readInputAsset`, source-Node mapping, carrier set, final ingress, selected binding, capability projection, witness, or effect authority; P2 `inputRef` resolution remains outside this seam
- [ ] one AF-13 constraint projection covers `invoke` exact member, `start(graph_function)` admitted-session narrowing, `start(asset)` published owner projection or typed gap, and `start(next)` exact admitted view
- [ ] after AF-14, the selected GraphFunction derives exactly one ready callable session entry; the existing selected-entry resolver supplies the exact catalog binding; for `invoke`, exactly one selected-binding source Node constructs the existing carrier set from the prepared canonical value before final ingress, zero source Nodes refuse, and multiple source Nodes without a declared mapping retain the named gap; zero/multiple/outside-view/noncallable entries or AF-13/AF-14 mismatches refuse
- [ ] total `projectM04RuntimeSchemaAdmission({ selectedExecutionBinding, nativeDefinitionRelations })` admits one closed metadata JSON-blob whose rows have exactly graphFunctionId/nodeRef/symbolicSchemaRef/contractId/contractVersion, rejects embedded coordinate/digest/locator/witness/callable fields and duplicate or foreign GraphFunction/contained-Node/schema tuples, validates the exact-identity union of inputs, outputs, environment requires/provides/carries, and inline-graph nodes, admits every distinct Module `symbolicSchemaRef + contractId + contractVersion` relation key all-or-nothing before projecting selected-GraphFunction bases and engine input, rejects cloned or relabeled source rows, permits relation reuse only for identical full keys, requires distinct exact relations for divergent symbolic refs even when equal contract coordinates conserve the same definition carrier, projects ordered sealed full-coordinate/witness bases into final admitted ingress after AF-14, and alone calls the neutral M03/shared WeakSet-branded constructor; a separate identity-free AF-15 envelope carries callables outside every stable hash; the complete T-252/M03 public/private/vector schema-key/source family plus T-274B1 delivery and Scenario-09 use the same M04 call site and neutral constructor; T-274B2 publishes only T-274A's nine public assets
- [ ] the shared compiler core emits compact and private runtime projections once and conserves every locus Operator
- [ ] immutable runtime-value environment and exact F_D Operator resolver land through generic non-Consensus proof
- [ ] the closed four-runtime outcome union and separate exhaustive AF-15 fold land without an `EngineIterateResult` cast
- [ ] F_P target-value admission and F_H held/no-output behavior are proven
- [ ] `invokeLeaf` conserves the existing cursor digest through the T-271 request/receipt carrier without adding authority; exact F_H hold derives one dependency-leaf event-contained checkpoint basis with no identity/digest after held-receipt/cursor admission; the opened interaction basis digest covers cursor ref/digest, input payload/lineage refs, the remaining coordinates, and ordered bodies, and exact same-locus reconstruction is proven
- [ ] missing/mutated/cross-locus F_H checkpoint refuses; other re-entry requiring absent bodies returns the named general rehydration gap
- [ ] provisional runtime is reconciled to the accepted design
- [ ] old identity, fallback, and direct-selection paths are removed
- [ ] current operation family, schemas, SDK, CLI, and tests derive one truth
- [ ] implementation receives independent authority-path review

## Exit

The neutral contract milestone is complete when both variants have exact
owner-native request, result, refusal, and non-terminal schemas with stable
coordinates and malformed-input/output negatives, while M03 imports no M04
public-contract implementation. That milestone is a T-281 P1 input and does
not satisfy the runtime exits below.

The public-router/runtime-authority milestone is independently reviewable when
exits 1 through 5 pass on the accepted P1 and T-274B1 bases. That milestone may
unblock T-272 and T-274B2, but it publishes no partial public surface and does not close
this ticket. Exits 6 and 7 close only in the atomic P2 switch after all handler,
schema, SDK, CLI, and catalog contributions are ready.

1. Generic non-Consensus and unchanged Consensus programs use the same AF-14 /
   AF-15 authority join and T-255/T-267/T-271 execution path.
2. `invoke` and `start` share one `run.invoke` definition; neither bypasses
   AF-13 or AF-14. Pre-AF-13 preparation produces process-local candidate truth
   and one request constraint only. Final ingress, selected binding, M04
   capability bases, and engine input exist only after AF-14, when the selected
   GraphFunction derives one exact admitted session entry and the existing
   selected-entry resolver returns its binding. `start(asset)` remains a typed
   gap unless REQ-P-POLICY-010's owner projection is present.
3. Cross-program, nonmember, outside-view, noncallable, stale-program/view,
   zero/multiple selected-entry, stale-intent, stale-next-action, authority
   mutation, missing capability, compiler-chain drift, row/locus drift, and
   basis drift all refuse before an effect.
4. The exact T-267 value remains unchanged and no-effect. A subordinate T-270
   start-admission witness must match before the one `ExecutionBasis` is
   admitted; only that basis authorizes execution.
5. Completed, held, pending, blocked, and runtime-failed outcomes remain distinct;
   completed evidence reaches AF-16 and held truth reaches T-272 only with its
   exact held receipt/locus, cursor ref/digest, input payload/lineage refs, and
   event-contained environment checkpoint basis.
5a. A non-Consensus Scenario-09 program proves exact operator ordinal/digest
    conservation, binding-primary/full-locus resolution, total I-JSON
    execution, neutral bounded target-carrier admission, immutable
    value propagation, strict F_P body admission, and F_H held/no-output truth
    plus neutral checkpoint-basis construction after held-receipt/cursor admission without a
    motivating-feature runtime branch.
5b. Missing/duplicate/wrong-regime/wrong-locus/wrong-schema F_D implementations,
    missing/extra/duplicate/unmapped/stale/mismatched or reforged neutral
    schema-admission capabilities or admitted basis rows, malformed
    F_P wire or target bodies, and missing/stale/mutated/cross-locus F_H
    checkpoints refuse before continuation. Other missing re-entry bodies emit
    the exact general semantic gap before the affected locus. T-274B1
    Module/native-definition absence, incomplete Module relation-key family,
    exact source-definition-origin mismatch, a cloned or relabeled source row,
    relation reuse across divergent symbolic refs, divergent same-contract
    definition carriers, and T-275 stdlib/profile/result-binding
    absence cannot be hidden by a handler, evaluator, plugin, fixture, or
    ambient value.
6. A T-270 hard-break scan proves the old `catalog.invoke` operation,
   second-start and profile-free fallbacks, and their old schemas, SDK rows, and
   CLI rows are absent. T-272 owns the separate `run.resume` and `fh.*` scan.
7. Focused semantic, GTL, packed, publication, governance, Prime, and design
   gates are green from one tree.

Existing, alternate, and temporary-workspace installed scenarios are T-276
proof, not T-270 closure work.
