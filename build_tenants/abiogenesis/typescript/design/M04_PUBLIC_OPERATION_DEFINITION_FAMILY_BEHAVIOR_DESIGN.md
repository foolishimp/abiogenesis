# M04 Public Operation Definition Family Behavior Design

**Status**: Accepted - Phase A only; P1 and P2 remain gated

**Date**: 2026-07-16

**Ticket**: `T-281`

**Change class**: `design_reframe`

**Delivery boundary**: GOAL-035 P1 before T-270; P2 handler and packed parity excluded

**Ontology authority**: `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md`
version `abg.public-control-plane.ontology/9`, accepted semantic candidate
`1ca39b2b5c536be6d16eecfb30d8310e798853232ae7c03f71ac655a7f97bf40`,
current file digest
`f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8`

**Ontology acceptance**:
`.ai-workspace/comments/codex/20260716T055554Z_DECISION_t278_ontology_ratified.md`

**Method authority**:
`specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`

**Prime authority**: [ADR-044](./adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md)

## Boundary

This design realizes the P1 definition prerequisite in `GOALS.md`. It replaces
the superseded operation contract map, metadata register, CLI roster, schema
algorithms, and publication roster with one operation-indexed
`PublicFunctionDefinition<K>` authoring family for the exact ratified 19 public
operations. It preserves `PublicInvocation<K>` and `PublicOutcome<K>` as the
common independently admitted ingress and egress carriers required by
`REQ-P-PUBLIC-CONTRACTS-010`.

The definition family owns only public contract meaning:

- operation identity and version;
- closed variant domain;
- exact request, result, refusal, and non-terminal result types;
- semantic authority reference and authority/effect class;
- actor and capability requirements;
- `workspaceBindingRequirement: forbidden | exactly_one` per variant;
- defaults and closed value domains;
- request/result/refusal/invocation/outcome schema coordinates;
- SDK member and CLI command coordinates; and
- adapter exit classification.

Catalog rows, schema assets, SDK declarations, CLI grammar, and parity
inventories are deterministic projections. Semantic functions, ABG
interpreters, event writers, filesystem effects, and operation-specific
handlers retain separate owners. A definition points to semantic authority; it
does not execute that authority.

Phase A is a private mechanism checkpoint. It proves one Valibot-native
contract definition/projector, the exact common authority/invocation/outcome
packets, and a schema-only non-Consensus fixture. It exports no product
contract, calls no handler, and claims neither the 19-row family nor the hard
break.

P1 then authors the exact 19-operation family and private candidate
projections. Frozen 4.6 code may remain only as migration input; it cannot be
imported by, validate, generate, or appear in any 5.0 candidate projection.
No P1 build may publish or identify itself as the 5.0 public surface. P2
atomically binds handlers, switches package exports, catalog, schemas, SDK and
CLI to the P1 family, deletes the frozen legacy roster and aliases, and proves
source/package/install absence. Only that P2 cutover earns the hard break.

### Requirements

- `REQ-P-PUBLIC-CONTRACTS-005`, `-008`, `-009`, and `-010`;
- `REQ-P-POLICY` operation-specific behavior clauses;
- `PRODUCT.md` Public Operator Contract and hard-break law;
- ratified T-278 public control-plane Ontology;
- accepted T-270 `run.invoke` authority design;
- accepted T-272 F_H response and continuation design; and
- accepted T-275 Consensus domain design's pure `ticket_consensus` read;
- ADR-044 plus census rows `PC-004` and `PC-005`.

### Explicit Exclusions

- implementation or ownership of operation-specific semantic behavior;
- a metadata-driven mega-handler or general service controller;
- P2 handler binding and full packed public parity;
- a temporary public `not_implemented` or handler-missing behavior;
- a second authored contract map, ID array, CLI switch, schema roster, schema
  language, schema compiler, or catalog operation roster;
- unchecked `as unknown as`, permissive index signatures, or untyped generic
  dispatch used to erase `K`;
- a permissive optional-field mega-schema across variants;
- Consensus-specific operation identity, request, router, or handler law;
- hostile-workstation signing or tamper resistance; and
- legacy aliases, facades, defaults, fallbacks, or parallel public registers;
- Phase A product exports, handler calls, filesystem effects, publication, or
  claims that the 19-row family is complete; and
- a custom contract-constructor DSL, open-ended or operation-specific callback
  validator, schema fragment, or operation-specific validation branch.

The supported environment is one trusted developer desktop. Proportional
defense targets likely malformed authored definitions, CLI/SDK input, and
worker/handler output. It does not add hostile in-process or filesystem
adversary machinery.

## Ontology Basis

The accepted Ontology contributes `PublicFunctionDefinition<K>`,
`PublicInvocation<K>`, `PublicOutcome<K>`, `InvocationAuthority<K>`,
`WorkspaceBinding`, `PublicContractCatalog`, the 27 atomic function families,
and the exact 19-operation projection. This design introduces no product
entity. It supplies native HOW relations and deterministic projectors for the
accepted public family.

Any change to the cited Ontology identity, accepted semantic candidate, file
digest, `REQ-P-PUBLIC-CONTRACTS-008..010`, or PRODUCT operation table makes this
design stale before implementation.

## Exact Public Definition Matrix

The variant strings below are the exact public and native discriminants.
CLI command spelling is an adapter coordinate and never rewrites those values.
Target paths, subjects, refs, and policies remain typed request fields.

| Operation identity | Closed native variant domain | Atomic/composed authority | Workspace binding | Actor | Effect class | CLI coordinate |
|---|---|---|---|---|---|---|
| `abg.operation.workspace.create` | `clean`, `imported` | `AF-01 constructWorkspace` | `forbidden` | required | workspace filesystem | `workspace create --policy <policy>` |
| `abg.operation.workspace.open` | `open` | `AF-02 openWorkspace` | `forbidden` | forbidden | read/admission | `workspace open` |
| `abg.operation.project.read` | closed `ProjectReadCase` source/projection relation below | `AF-03 project<S,K>` | per-case `forbidden` or `exactly_one` | forbidden | pure read | `project read <projection>` |
| `abg.operation.product.verify` | `verify` | `AF-04 verifyProductArtifact` | `forbidden` | forbidden | deterministic evaluation | `product verify` |
| `abg.operation.product.resolve` | `resolve` | `AF-05 resolveProductSet` | `forbidden` | forbidden | deterministic evaluation | `product resolve` |
| `abg.operation.product.install` | `install` | `AF-06 installProduct` | `forbidden` | required | immutable install filesystem | `product install` |
| `abg.operation.workspace.bind` | `bind` | `AF-07 bindWorkspace` | `forbidden` | required | binding persistence | `workspace bind` |
| `abg.operation.catalog.admit` | `admit` | `AF-08 admitCatalog` | `exactly_one` | required | catalog admission event | `catalog admit` |
| `abg.operation.catalog.view` | `allowlist` | `AF-09 deriveCatalogView` | `exactly_one` | required | deterministic narrowing | `catalog view` |
| `abg.operation.catalog.apply` | `node_type`, `overlay` | `AF-10 applyCatalogDeclaration` | `exactly_one` | required | declaration application admission | `catalog apply <kind>` |
| `abg.operation.run.invoke` | `invoke`, `start` | admitted One Surface program through `AF-11..AF-16`; T-270 owns AF-15 admission | `exactly_one` | required | ABG traversal | `run <variant>` |
| `abg.operation.run.continue` | `current_intent`, `selected_action` | T-272 `AF-17`; selected action returns through `AF-14/AF-15` | `exactly_one` | required | ABG continuation | `run continue --mode <mode>` |
| `abg.operation.interaction.respond` | `select`, `approve`, `reject`, `assess`, `answer_escalation` | `AF-18 admitHumanResponse` | `exactly_one` | required | F_H response admission event | `interaction respond <variant>` |
| `abg.operation.result.assess` | `assess` | `AF-19 admitResultAssessment` | `exactly_one` | required | result-assessment admission event | `result assess` |
| `abg.operation.witness.admit` | `reprice`, `attest`, `hygiene-stamp`, `intake`, `run-resumed`, `run-stopped` | `AF-20 admitWitnessedAct` | `exactly_one` | required | witnessed-act admission event | `witness admit <variant>` |
| `abg.operation.tuning.transition` | `propose`, `ratify`, `reject` | `AF-21 transitionTuningDraft` | `exactly_one` | required | tuning lifecycle event | `tuning transition <variant>` |
| `abg.operation.conformance.evaluate` | `gtl_program` | `AF-22 evaluateConformance` | `exactly_one` | required | deterministic evaluation/admission | `conformance evaluate gtl-program` |
| `abg.operation.product.materialize` | `context_bootstrap`, `configuration` | `AF-23 materializeProductAsset` | `exactly_one` | required | product filesystem | `product materialize <variant>` |
| `abg.operation.release.snapshot` | `published_rc`, `tapped_release` | `AF-25 materializeReleaseCut` | `exactly_one` | required | immutable release publication | `release snapshot <variant>` |

The six pre-binding atomic families named by Ontology invariant 3 are exactly
`AF-01`, `AF-02`, and `AF-04..AF-07`; their public variants forbid a binding.
The `project.read` relation closes binding cardinality per source/projection
case: workspace, catalog, runtime, interaction, continuation, assessment, and
witness cases require one binding; immutable install and release evidence cases
forbid it because their source identities carry their own admitted basis.
Every other current public variant is workspace- or execution-scoped and
requires one exact immutable binding. For `release.snapshot`, the invocation
binding must equal the binding named by the exact qualification basis; it is an
equality check, not a second release authority. Aggregate carrier syntax never
turns this sum into a freely optional binding.

`run.invoke(start)` additionally retains the closed `fh_mode` and `root_mode`
policy families from PRODUCT. They are request policy fields outside
`scope + target + until`, not operation variants or CLI-owned defaults.

## Closed Project Read Relation

`project.read` is one public identity over the closed relation below. It is not
one request with a free-form source and projection string. Every case has the
base request fields `sourceRef`, `sourceDigest`, `projectionBasisRef`, and
`projectionBasisDigest`. Replay cases additionally require an explicit cursor
or closed range. The catalog-description case additionally requires one
canonical handle. No read case admits an event or returns a non-terminal
outcome.

| Case key | Exact source carrier | Exact result carrier | Binding | Capability refs |
|---|---|---|---|---|
| `catalog_list` | `Catalog` | `CatalogListProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `catalog_describe` | `Catalog` plus canonical handle | `CatalogDescriptionProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `workspace_status` | `WorkspaceBinding` | `WorkspaceStatusProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `run_status` | `Run` | `RunStatusProjection` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `graph_call_status` | `GraphCall` | `GraphCallStatusProjection` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `run_result` | `Run` | `RunResultProjection` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `graph_call_result` | `GraphCall` | `GraphCallResultProjection` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `run_evidence` | `Run` | `EvidenceProjection<Run>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `graph_call_evidence` | `GraphCall` | `EvidenceProjection<GraphCall>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `result_evidence` | `RuntimeResult` | `EvidenceProjection<RuntimeResult>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `assessment_evidence` | `ResultAssessment` | `EvidenceProjection<ResultAssessment>` | `exactly_one` | `abg.capability.runtime.admit-fp-result@5` |
| `witness_evidence` | `WitnessedAct` | `EvidenceProjection<WitnessedAct>` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `install_evidence` | `InstalledProduct` plus `InstallManifest` | `EvidenceProjection<InstalledProduct>` | `forbidden` | `abg.capability.install.bind-products@5` |
| `release_evidence` | `ReleaseCut` plus `ReleaseSnapshotManifest` | `EvidenceProjection<ReleaseCut>` | `forbidden` | `abg.capability.operator.public-contract@5` |
| `workspace_replay` | `WorkspaceBinding` plus runtime event log | `ReplayProjection<WorkspaceBinding>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `run_replay` | `Run` | `ReplayProjection<Run>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `graph_call_replay` | `GraphCall` | `ReplayProjection<GraphCall>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `interaction_replay` | `FhInteraction` | `ReplayProjection<FhInteraction>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `continuation_replay` | `Continuation` | `ReplayProjection<Continuation>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `c_call_replay` | `CProgramAtomReceipt` plus C-call identity | `ReplayProjection<CProgramAtomReceipt>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `workspace_gaps` | `WorkspaceBinding` plus latest admitted gap basis | `GapProjection<WorkspaceBinding>` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `run_gaps` | `Run` | `GapProjection<Run>` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `run_lawful_actions` | `Run` plus current `NextActionProjection` | `LawfulActionProjection` | `exactly_one` | `abg.capability.runtime.replay-continuation@5` |
| `observer_report` | `WorkspaceBinding` plus admitted runtime/evidence basis | `ObserverReportProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `observer_drafts` | `WorkspaceBinding` plus tuning draft basis | `ObserverDraftProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `tuning_report` | `WorkspaceBinding` plus tuning draft basis | `TuningReportProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |
| `ticket_consensus` | admitted `ConsensusResult` plus exact ticket, output-authority, and replay basis | `TicketConsensusProjection` | `exactly_one` | `abg.capability.operator.public-contract@5` |

`ProjectReadRequest<C>` is a discriminated union indexed by this case key.
`sourceRef`, `sourceDigest`, and any handle/cursor/range fields use the source
and projection types fixed by `C`. `ProjectReadResult<C>` is exactly the result
carrier above. `ProjectReadRefusal<C>` is the closed union of
`unknown_source`, `source_kind_mismatch`, `source_digest_mismatch`,
`projection_basis_mismatch`, `projection_unsupported`, `not_found`,
`not_ready`, plus binding refusal derived from the case and
`cursor_invalid | range_invalid` only for replay cases. Defaults are empty.

## Closed Operation Contract Packet

The following packet closes P1 contract meaning. Types named here are accepted
Ontology, GTL, ABG, product, or public carrier refs. Braced shapes are closed
objects: extra fields refuse. `NonEmpty<T>` and `Unique<T>` are explicit array
cardinality constraints, and every `Ref<T>` paired with `Digest<T>` is verified
before effect.

Every operation also derives `AdmissionRefusalFor<K>` from its definition. The
base codes are `unknown_definition`, `unknown_variant`, `invalid_request`,
`contract_catalog_mismatch`, and `authority_mismatch`. Actor, capability,
catalog-view, and binding codes exist only when that definition requires those
inputs. The binding codes are exactly `binding_missing`, `binding_forbidden`,
and `binding_mismatch`. The semantic refusal column below is unioned with that
derived admission refusal; no operation receives an irrelevant optional field
to make a refusal possible.

| Operation and variant | Closed request fields | Exact result | Semantic refusal codes | Non-terminal and defaults |
|---|---|---|---|---|
| `workspace.create(clean)` | `targetRoot: AbsolutePath`, `createPolicy: clean` | workspace identity, creation manifest, provenance refs | `invalid_target`, `workspace_exists`, `workspace_identity_conflict`, `filesystem_failure` | none; no defaults |
| `workspace.create(imported)` | clean fields plus `importAuthorityRef`, `importAuthorityDigest` | workspace identity and creation manifest citing imported authority | clean refusals plus `import_authority_invalid` | none; no defaults |
| `workspace.open(open)` | `targetRoot`, expected workspace-authority ref/digest | workspace, exact authority basis, readiness `ready` or `unbound`, manifest, residuals | `invalid_target`, `workspace_missing`, `authority_basis_mismatch`, `manifest_invalid` | none; no defaults |
| `product.verify(verify)` | artifact ref/digest, descriptor ref/digest, contribution-manifest ref/digest, resolved-lock ref/digest, expected contract refs | verified artifact and all checked identities, disposition, residuals, provenance | `invalid_artifact`, `digest_mismatch`, `descriptor_mismatch`, `contribution_mismatch`, `lock_mismatch`, `incompatible` | none; no defaults |
| `product.resolve(resolve)` | `requirements: NonEmpty<Unique<ProductRequirement>>`, `candidates: NonEmpty<Unique<ProductCoordinate>>` | exact resolved lock, selected products, residuals, provenance | `invalid_requirement`, `unresolved`, `incompatible`, `ambiguous`, `cyclic` | none; no defaults |
| `product.install(install)` | verified-artifact ref/digest, product descriptor ref/digest, `targetRoot`, closed install policy | installed product, install manifest, installer manifest, provenance | `verification_failed`, `invalid_target`, `identity_conflict`, `filesystem_failure` | none; no defaults |
| `workspace.bind(bind)` | workspace-authority ref/digest, `installedSet: NonEmpty<Unique<InstalledProductRef>>`, resolved-lock ref/digest, `declaredRoots: NonEmpty<Unique<AbsolutePath>>` | immutable workspace binding and binding manifest | `workspace_not_ready`, `product_not_installed`, `lock_mismatch`, `root_invalid`, `binding_conflict`, `incompatible` | none; no defaults |
| `catalog.admit(admit)` | `descriptors: NonEmpty<Unique<ProductDescriptorRef>>`, `contributions: NonEmpty<Unique<ContributionManifestRef>>`, resolved-lock ref/digest | catalog ref/digest and typed admitted/rejected row dispositions | `descriptor_invalid`, `contribution_invalid`, `conflict`, `incompatible`, `unready`, `unresolved` | none; no defaults |
| `catalog.view(allowlist)` | `allowlist: Unique<CanonicalCatalogHandle>` | narrowing catalog-view ref/digest, effective handles, residuals | `unknown`, `duplicate`, `ambiguous`, `unauthorized`, `inadmissible`, `not_ready` | none; no defaults |
| `catalog.apply(K)` for `K = node_type, overlay` | declaration ref/digest, target ref, application-basis ref/digest | declaration-application ref, kind, target, evidence refs | `kind_mismatch`, `outside_view`, `not_ready`, `target_invalid`, `application_refused`, `callable_kind_forbidden` | none; no defaults |
| `run.invoke(invoke)` | program ref/digest, GraphFunction ref/digest, declared input-contract ref/digest, admitted input, catalog-view ref/digest, declared `allowlist: Unique<CanonicalCatalogHandle>` | run ref, GraphCall ref, completed result or typed stop, evidence refs, replay ref | `program_invalid`, `function_nonmember`, `outside_view`, `noncallable`, `next_action_mismatch`, `intent_missing`, `input_invalid`, `capability_missing`, `runtime_failed` | `held`, `gap_stop`; no defaults |
| `run.invoke(start)` | program ref/digest, `scope`, closed target, `until`, catalog-view ref/digest, declared `allowlist: Unique<CanonicalCatalogHandle>`, `fh_mode`, `root_mode` | run ref, present nullable GraphCall ref, completed result or typed stop, evidence refs, replay ref | invoke refusals plus `target_invalid`, `mode_invalid`, `until_invalid` | `held`, `gap_stop`; defaults `fh_mode=direct`, `root_mode=supervised` |
| `run.continue(current_intent)` | run ref, continuation ref/digest, current-intent ref/digest, admitted response-or-input ref/digest, expected execution-basis ref/digest | continued run state, successor receipt, evidence refs, replay ref | `continuation_missing`, `continuation_resolved`, `intent_mismatch`, `response_missing`, `stale_replay`, `basis_fork_detected`, `runtime_failed` | `held`, `gap_stop`; no defaults |
| `run.continue(selected_action)` | run ref, next-action projection ref/digest, selected-action ref/digest, closed `basis_relation` defined below | new construction-intent ref then run/GraphCall state, evidence refs, replay ref | `next_action_stale`, `action_mismatch`, `intent_admission_refused`, `covering_reprice_missing`, `basis_fork_detected`, `runtime_failed` | `held`, `gap_stop`; no defaults |
| `interaction.respond(K)` for five response kinds | interaction ref/digest, response-contract ref/digest, `choiceRef` or typed `value` as required by K, evidence refs, capability-provenance refs | responded-event ref and current interaction projection | `interaction_missing`, `interaction_resolved`, `response_kind_forbidden`, `response_contract_mismatch`, `choice_invalid`, `value_invalid`, `actor_capability_missing`, `basis_mismatch` | `responded` while run remains held; no defaults |
| `result.assess(assess)` | runtime-result ref/digest, assessment-contract ref/digest, typed assessment, evidence refs | assessment ref, admitted disposition, residuals, evidence refs | `result_missing`, `assessment_contract_mismatch`, `assessment_invalid`, `basis_mismatch` | `retry`, `blocked` when declared; no defaults |
| `witness.admit(K)` for six witnessed acts | subject ref/digest, act kind K, evidence refs, provenance refs | witnessed-act event ref and admitted evidence ref | `subject_missing`, `act_forbidden`, `evidence_invalid`, `basis_mismatch` | none; no defaults |
| `tuning.transition(propose)` | draft content contract ref/digest, typed draft content, subject basis ref/digest, evidence refs | proposed tuning-draft ref/version and event ref | `draft_invalid`, `subject_mismatch`, `basis_mismatch` | none; no defaults |
| `tuning.transition(K)` for `K = ratify, reject` | current tuning-draft ref/version/digest, decision evidence refs | transitioned draft projection and attributed event ref | `draft_missing`, `draft_stale`, `transition_forbidden`, `basis_mismatch` | none; no defaults |
| `conformance.evaluate(gtl_program)` | GTL program ref/digest, conformance-law ref/digest, closed `inventory_basis` defined below | conformance assessment, passed/failed disposition, stable diagnostics, law refs, evidence, repair affordances | `program_invalid`, `law_basis_mismatch`, `inventory_mismatch`, `assessment_blocked` | none; no defaults |
| `product.materialize(context_bootstrap)` | target-workspace ref, selected binding ref/digest, declared context inputs | content-addressed bootstrap asset and manifest with created/refreshed/preserved rows | `workspace_not_ready`, `binding_mismatch`, `input_invalid`, `authority_overwrite_forbidden`, `filesystem_failure` | none; no defaults |
| `product.materialize(configuration)` | configuration-contract ref/digest, selected binding ref/digest, declared typed inputs | configuration content ref/digest, validation disposition, provenance | `contract_invalid`, `binding_mismatch`, `input_invalid`, `mutable_default_forbidden`, `filesystem_failure` | none; no defaults |
| `release.snapshot(published_rc)` | pre-RC qualification-basis ref/digest, matching law-basis ref/digest, same-basis verdict ref/digest, requested RC identity/version | immutable RC cut, exact artifact refs/digests, snapshot manifest, provenance | `wrong_subject_kind`, `basis_mismatch`, `law_basis_mismatch`, `verdict_not_green`, `bypass_nonempty`, `identity_mismatch`, `bytes_mismatch`, `publication_failure` | none; no defaults |
| `release.snapshot(tapped_release)` | final-tap basis, matching law basis and verdict, requested final identity, accepted-RC ref/digest, installed-RC qualification refs/digests, complete FinalTapDelta ref/digest | immutable final cut, artifacts, snapshot manifest, provenance | published-RC refusals plus `accepted_rc_mismatch`, `installed_rc_authorization_missing`, `final_delta_incomplete`, `affected_gate_failed` | none; no defaults |

Grouped rows above share one packet only where their exact field structure is
identical. Their discriminant still changes the indexed contract key. In
particular, `ResponsePayloadByKind<K>` is closed as follows:

| Response kind | `choiceRef` | `value` |
|---|---|---|
| `select` | required exact member of the pending interaction's declared choice set | required canonical JSON admitted by the selected response contract |
| `approve`, `reject`, `assess`, `answer_escalation` | nullable; when present it must be an exact declared choice | required canonical JSON admitted by the selected response contract |

All five response packets also require the same interaction ref/digest,
response-contract ref/digest, evidence refs, and capability-provenance refs.
No response kind can make the value optional, substitute a free-form string,
or select a choice absent from the opened interaction. The two
`catalog.apply` variants, six `witness.admit` variants, and the
`tuning.transition(ratify|reject)` pair share their displayed closed fields;
only their discriminant, indexed capability or admitted act/transition kind
differs.

The remaining conditional inputs are closed discriminated objects, not absent
fields:

```text
basis_relation =
  { kind: "same_basis" }
  | { kind: "authority_changed",
      coveringRepriceRef: Ref<CoveringReprice>,
      coveringRepriceDigest: Digest<CoveringReprice> }

inventory_basis =
  { kind: "program_only" }
  | { kind: "declared_inventory",
      inventoryRefs: NonEmpty<Unique<InventoryRef>>,
      inventoryDigests: MatchingDigests<InventoryRef> }
```

The same-basis case cannot carry reprice fields. The authority-changed case
cannot omit them. The program-only case cannot carry inventory fields. The
declared-inventory case must bind every inventory ref to its exact digest.

The five response kinds are `select`, `approve`, `reject`, `assess`, and
`answer_escalation`. The six witnessed acts are `reprice`, `attest`,
`hygiene-stamp`, `intake`, `run-resumed`, and `run-stopped`. Those closed sets
are constructor inputs; no stringly extension is admitted.

### Definition Metadata And Coordinates

The remaining required fields are exact through this table and the deterministic
coordinate laws below.

| Operation | Capability refs | Event or manifest admission | Terminal dispositions | Non-terminal dispositions | Adapter profile |
|---|---|---|---|---|---|
| `workspace.create` | `abg.capability.operator.public-contract@5` | workspace manifest/provenance | `created` | none | `terminal_only` |
| `workspace.open` | `abg.capability.operator.public-contract@5` | none | `ready`, `unbound` | none | `terminal_only` |
| `project.read` | per closed read case | none | `projected` | none | `terminal_only` |
| `product.verify` | `abg.capability.install.bind-products@5` | verification provenance | `verified` | none | `terminal_only` |
| `product.resolve` | `abg.capability.install.bind-products@5` | resolved-lock admission | `resolved` | none | `terminal_only` |
| `product.install` | `abg.capability.install.bind-products@5` | install and installer manifests | `installed` | none | `terminal_only` |
| `workspace.bind` | `abg.capability.install.bind-products@5` | workspace-binding manifest | `bound` | none | `terminal_only` |
| `catalog.admit` | `abg.capability.catalog.contribute@5` | catalog admission events | `admitted` | none | `terminal_only` |
| `catalog.view` | `abg.capability.operator.public-contract@5` | catalog-view admission | `viewed` | none | `terminal_only` |
| `catalog.apply` | variant selects `abg.capability.catalog.apply-node-type@5` or `abg.capability.catalog.apply-overlay@5` | declaration-application admission | `applied` | none | `terminal_only` |
| `run.invoke` | `abg.capability.catalog.invoke-graph-function@5`, `abg.capability.runtime.execute-seven-term-c@5` | runtime execution events | `completed`, `blocked`, `runtime_failed` | `held`, `gap_stop` | `runtime_nonterminal` |
| `run.continue` | `abg.capability.runtime.replay-continuation@5` | continuation/runtime events | `completed`, `blocked`, `runtime_failed` | `held`, `gap_stop` | `runtime_nonterminal` |
| `interaction.respond` | `abg.capability.operator.public-contract@5`, `abg.capability.runtime.replay-continuation@5` | F_H response event | none | `responded`, `held` | `runtime_nonterminal` |
| `result.assess` | `abg.capability.runtime.admit-fp-result@5` | result-assessment event | `assessed` | `retry`, `blocked` | `runtime_nonterminal` |
| `witness.admit` | `abg.capability.operator.public-contract@5` | witnessed-act event | `admitted` | none | `terminal_only` |
| `tuning.transition` | `abg.capability.operator.public-contract@5` | tuning-draft event | `proposed`, `ratified`, `rejected` | none | `terminal_only` |
| `conformance.evaluate` | `abg.capability.gtl.typecheck@5` | conformance assessment | `passed`, `failed` | none | `terminal_only` |
| `product.materialize` | `abg.capability.install.bind-products@5` | product-asset manifest/provenance | `materialized` | none | `terminal_only` |
| `release.snapshot` | `abg.capability.operator.public-contract@5`, `abg.capability.qualification.self-conformance@5` | release cut and snapshot manifest | `materialized` | none | `terminal_only` |

Adapter profiles are closed constants:

- `terminal_only = { acceptedTerminal: 0, refused: 1,
  invalidInvocation: 2, acceptedNonTerminal: null, adapterFailure: 70 }`;
- `runtime_nonterminal = { acceptedTerminal: 0, refused: 1,
  invalidInvocation: 2, acceptedNonTerminal: 3, adapterFailure: 70 }`.

For operation suffix `S`, `Pascal(S)` splits only on dot, underscore, and
hyphen and capitalizes each non-empty segment. The admitted definition owns
`S` and its closed variants; the projector derives:

- native union symbols `Pascal(S)Request`, `Pascal(S)Result`, and
  `Pascal(S)Refusal`, each discriminated by the exact variant;
- schema ids `abg.schema.operation.S.request`, `.result`, and `.refusal`, at
  `contracts/schemas/operations/S/request.schema.json`,
  `result.schema.json`, and `refusal.schema.json`;
- the result asset as the closed union of admitted terminal results and any
  declared non-terminal values, while `PublicOutcome<K>` preserves their
  distinct outcome discriminants;
- SDK coordinate `sdk.S`, with the exact variant carried by its typed request;
  and
- the exact CLI coordinate in the 19-row matrix above.

Dots in `S` become path separators only for schema paths; they remain dots in
IDs and SDK coordinates. Multiple generated assets remain subordinate output
addressability and do not create multiple authoring sources. This preserves
the current file-level locator and digest law without adding fragment-aware
runtime resolution. The common descriptor rows are singular and exact:

- `abg.schema.public-operation-invocation` locates native
  `PublicInvocation`, `admitPublicInvocation`, and its generated schema;
- `abg.schema.public-operation-outcome` locates native `PublicOutcome`,
  `admitPublicOutcome`, and its generated schema.

These two common catalog rows and each operation row cite the same family
version and digest. Generated schemas may be separately addressable, but no
path, symbol, default, domain, capability, disposition, or exit mapping is
authored outside the admitted family.

## Definition Shape

For every operation/variant key `K`, the native definition closes this
relation without a weak index signature:

```text
PublicFunctionDefinition<K> = {
  functionId, version, variant,
  requestContract, resultContract, refusalContract,
  nonTerminalContract: NativeContractDefinition | null,
  semanticAuthorityRef, authorityClass, effectClass, eventAdmission,
  authoritySlotRequirements, capabilityRefs,
  workspaceBindingRequirement,
  defaults,
  schemaCoordinates,
  sdkCoordinate, cliCoordinate, adapterExitMap
}
```

Each contract field is one `NativeContractDefinition<S>` whose authoritative
value is a strict Valibot schema `S`. The native TypeScript type is
`v.InferOutput<S>`, runtime admission is `v.parse(S, raw)`, and canonical JSON
Schema is projected from the same `S` with pinned
`@valibot/to-json-schema@1.6.0`. A separately handwritten interface, validator
grammar, JSON Schema, or contract-constructor language for the same value is
forbidden. This is the native type lever that makes one source real rather than
a metadata claim.
Closed value-domain rows required by publication derive from these schemas;
the definition does not author a parallel domain roster.

The definition family is one strict object keyed by the exact 19 operation
identities; each value is a strict object keyed by that operation's closed
variants. The key union, operation/variant lookup type, and
`PublicInvocation<K>` / `PublicOutcome<K>` relations infer from that object.
There is no duplicate ID tuple. A broad `Record<string, ...>`, a permissive
index signature, or a cast that reconstructs correlation after lookup is not
an acceptable implementation.

`PublicOperationKey` is derived from the native operation/variant relation.
`PublicInvocation<K>` requires the request and authority relation indexed by
that exact key. `PublicOutcome<K>` is a closed sum of the indexed result,
refusal, and declared non-terminal variants. A caller cannot construct
internal worker, traversal, continuation, event, selection, evaluation, or
closure authority through either public carrier.

Schema IDs, locators, native symbols, SDK members, and CLI paths are projected
through one schema/adapter projector. Generated artifacts may remain separately
addressable. Their multiplicity is output addressability, not authored truth.

## Native Contract Definition And Projection

```text
NativeContractDefinition<S extends v.BaseSchema> = {
  nativeSymbol,
  schemaCoordinate,
  schema: S
}

NativeType<S>              = v.InferOutput<S>
admitNative<S>(S, raw)     = v.parse(S, raw)
projectJsonSchema<S>(S)    = pinned Valibot JSON-Schema projection
contractDigest<S>(S)       = sha256(canonical projected schema bytes)
```

Valibot strict objects, literals, picklists, tuples, arrays, nullables, and
unions own structure directly. Schemas use no value-changing transform,
callback-owned default, ambient input, open object, or operation-specific
validation branch. The projector runs with unsupported-schema handling set to
`throw`; it cannot silently erase a native constraint.

Phase A admits exactly this shared native-action set:

| Native action ID | Valibot form | Runtime meaning | Projector mapping |
|---|---|---|---|
| `type_brand` | `v.brand` after an admitting schema | type-only nominal identity; runtime value unchanged | project the inner schema and add deterministic `x-abg-native-brand` |
| `unicode_regex` | `v.regex` with the sole flag set `u` | exact shared lexical constraint | project `pattern` plus `x-abg-native-regex-flags: "u"` |
| `absolute_posix_path` | shared named `v.check` | absolute normalized POSIX path | project base string plus `x-abg-native-check` |
| `semantic_version` | shared named lexical check | accepted SemVer value | project its shared pattern plus `x-abg-native-check` |
| `safe_positive_integer` | shared integer/safe/minimum pipeline | integer in the safe positive domain | project integer and minimum plus `x-abg-native-check` where needed |
| `canonical_ijson` | shared named `v.check` | canonical I-JSON value | project structural JSON domain plus `x-abg-native-check` |
| `unique_by_identity` | shared named array `v.check` | no duplicate stable identity | project the item schema plus `x-abg-native-check` |

The mapping table is closed code, not a callback registry. Each mapping has the
stable action ID above, deterministic JSON-Schema output, and a focused native
admission/projected-disclosure parity test. `type_brand` is the sole permitted
Valibot transformation and cannot alter a value. The named checks are shared
irreducible admitters, never inline or operation-specific callbacks. Any other
action, flag set, transform, callback, or override throws and requires design
re-entry.

Scalar identity remains in the authoritative native schema. `ContractId<T>`,
`Ref<T>`, and `Sha256Digest<T>` use branded Valibot schemas with exact runtime
patterns. Absolute paths, canonical catalog handles, semantic versions,
positive/safe integers, and canonical I-JSON consume existing irreducible
admitters through shared Valibot schema values. A plain string cannot stand in
for one of those types, and the brand cannot exist only as an erased generic.

Defaults are definition-owned rows with the closed kinds `none | literal`.
Callbacks, named derivations, environment, clock, filesystem, and adapter
defaults are forbidden. No accepted 19-operation definition currently needs a
derived default, so adding that mechanism would be speculative. A literal
default must admit through the selected request-field schema before the
definition admits. Admission is ordered exactly:

```text
exact-key raw object admission
-> apply each declared default once
-> full strict Valibot admission
-> canonical request digest
```

Omission differs from `undefined`; output, refusal, and non-terminal schemas
have no defaults. The resulting canonical request type contains every applied
field.

Static schema composition reuses actual native Valibot schema objects and
explicit global definitions; there is no `contract_ref` schema constructor.
Runtime-selected contracts use one exact `PublicContractCoordinate`:

```text
{
  contractId, contractVersion, contractDigest,
  schemaId, schemaVersion, schemaDigest,
  nativeLocator: { packageName, packageExport, symbol }
}
```

The catalog basis is a distinct `PublicContractCatalogCoordinate`; it is not a
contract row and cannot be substituted by `PublicContractCoordinate`:

```text
{
  kind: "public_contract_catalog_coordinate",
  catalogId, catalogVersion, catalogDigest
}
```

Resolution occurs against that one exact admitted `PublicContractCatalog`
identity/version/digest.
The row must be unique and every contract, schema, native symbol, capability,
and digest coordinate must match. Unknown, duplicate, ambient-path, cyclic, or
digest-divergent references refuse. Recursive native schemas use explicit
Valibot lazy/global definitions only; cycles cannot appear through runtime
lookup.

## Exact Common Public Packets

`CapabilityGrantCoordinate` is exact and independently digest-bound:

```text
{
  kind: "capability_grant",
  grantRef, grantDigest,
  capabilityId, capabilityDefinitionRef, capabilityDefinitionDigest,
  actorRef, approvalRef, policyRef,
  scopeRef, scopeDigest,
  authorityBasisRef, authorityBasisDigest
}
```

`grantDigest` hashes the canonical row with `grantRef` and `grantDigest`
omitted; `grantRef` is `capability-grant:sha256:<grantDigest>`. Duplicate grant
refs, capabilities outside the selected definition, actor/basis mismatch, or
missing approval/policy/scope authority refuse. Availability and transport
steering never construct a grant.

Every authority slot is physically present and is a closed discriminated sum.
The exact admitted cases are:

| Slot | Forbidden case | Exact admitted case |
|---|---|---|
| actor | `{ state: "forbidden" }` | `{ state: "admitted_actor", actorRef, attributionRef, attributionDigest }` |
| workspace | `{ state: "forbidden" }` | `{ state: "admitted_workspace", bindingRef, bindingDigest }` |
| product set | `{ state: "forbidden" }` | `{ state: "admitted_product_set", productSetRef, productSetDigest }` |
| dependency lock | `{ state: "forbidden" }` | `{ state: "admitted_dependency_lock", lockRef, lockDigest }` |
| catalog scope | `{ state: "forbidden" }` | `{ state: "admitted_catalog_scope", viewRef, viewDigest, allowlistRef, allowlistDigest }` |
| execution program | `{ state: "forbidden" }` | `{ state: "admitted_execution_program", admittedGtlProgramRef, admittedGtlProgramDigest, graphFunctionRef, graphFunctionDigest, inputContract: PublicContractCoordinate, inputPayloadRef, inputPayloadDigest }` |
| invocation policy | `{ state: "forbidden" }` | `{ state: "admitted_invocation_policy", policyRef, policyDigest, sessionPolicyRef, sessionPolicyDigest }` |
| transport steering | `{ state: "forbidden" }` | `{ state: "declared_transport_steering", steeringRef, steeringDigest, provenanceRefs }` |

`InvocationAuthority<K>` is exactly:

```text
{
  kind: "invocation_authority",
  operationKey: K,
  authoritySetRef, authoritySetDigest,
  authorityBasisRef, authorityBasisDigest,
  definitionKey: K, definitionDigest,
  contractCatalog: PublicContractCatalogCoordinate,
  capabilityGrants: readonly CapabilityGrantCoordinate[],
  actor, workspace, productSet, dependencyLock,
  catalogScope, executionProgram, invocationPolicy, transportSteering
}
```

Grant rows are sorted by `grantRef` before admission and duplicates refuse.
`authoritySetDigest` hashes canonical I-JSON over the complete packet with only
`authoritySetRef` and `authoritySetDigest` omitted;
`authoritySetRef` is `invocation-authority:sha256:<authoritySetDigest>`.
Mutable observation, replay cursor, worker output, continuation state, and
adapter metadata are never part of the authority basis. The selected
definition fixes every slot state and required capability ID for `K`. A caller
cannot omit a slot, populate a forbidden slot, or provide an admitted slot or
grant not required by that definition.

`PublicInvocation<K>` is the strict object:

```text
{
  kind: "public_invocation",
  invocationRef, invocationDigest,
  definitionKey, definitionDigest,
  contractCatalog: PublicContractCatalogCoordinate,
  authority: InvocationAuthority<K>,
  requestContract: PublicContractCoordinate,
  requestRef, requestDigest, request: RequestOf<K>,
  expectedResultContract, expectedRefusalContract,
  expectedNonTerminalContract: PublicContractCoordinate | null,
  correlationRef, provenanceRefs
}
```

`invocationDigest` hashes canonical admitted fields with only itself omitted;
`requestDigest` hashes the canonical default-applied request. Every coordinate
must equal the selected definition. `PublicOutcome<K>` is the strict union:

```text
CommonOutcome<K> = {
  kind: "public_outcome",
  outcomeRef, outcomeDigest,
  invocationRef, invocationDigest,
  definitionKey: K, definitionDigest,
  payloadRef, payloadDigest,
  evidenceRefs, correlationRef, provenanceRefs
}

ResultOutcome<K> = CommonOutcome<K> & {
  outcomeKind: "result",
  payloadContract: ResultContractOf<K>,
  value: ResultOf<K>
}

RefusalOutcome<K> = CommonOutcome<K> & {
  outcomeKind: "refusal",
  payloadContract: RefusalContractOf<K>,
  value: RefusalOf<K>
}

NonTerminalOutcome<K> = CommonOutcome<K> & {
  outcomeKind: "nonterminal",
  payloadContract: NonTerminalContractOf<K>,
  value: NonTerminalOf<K>
}
```

`outcomeDigest` hashes canonical admitted fields with only itself omitted.
Every contract coordinate must equal the selected definition and outcome kind.
An operation with no declared non-terminal contract has no
`NonTerminalOutcome<K>` member. Malformed or cross-key owner output yields the
internal closed carrier
`{ kind: "outcome_admission_failure", failureClass, issuePaths,
invocationRef, definitionKey, candidateDigest }`; it never becomes a
`PublicOutcome` and carries no owner result truth. `failureClass` is exactly
`malformed | cross_operation | wrong_contract | digest_mismatch |
unexpected_nonterminal`.

`project.read` uses one closed `PROJECT_READ_CASE_FAMILY` whose 27 rows bind a
case key to its owner-supplied source and projection schemas, binding rule, and
capabilities. Shared wrapper factories derive three addressable operation
assets: request, result, and refusal, each a 27-case discriminated union. The
case map is metadata over owner schemas, not 27 independently authored public
schema families. `ticket_consensus` composes the existing native Consensus
schema object. A missing owner schema is an honest P1 gap and cannot be filled
from prose or a 4.6 interface.

## Irreducible Architectural Carrier Set

| Carrier | Authority | Lifecycle role |
|---|---|---|
| `PublicFunctionDefinition<K>` | accepted public contract family | Sole operation-specific authoring relation and projection basis. |
| `NativeContractDefinition<S>` | native contract meaning | One strict Valibot schema plus stable native/schema coordinates consumed by type inference, runtime admission, digest, and JSON-Schema projection. |
| `PublicInvocation<K>` | public ingress admission | One immutable typed proposal bound to one exact definition and authority. |
| `PublicOutcome<K>` | public egress admission | One immutable admitted result, refusal, or declared non-terminal outcome. |
| `InvocationAuthority<K>` | operation-indexed authority | Binds actor, grants, policy, view, steering, and stable authority required by the definition. |
| `CapabilityGrantCoordinate` | per-basis effect authority | Independently binds capability, actor, approval, policy, scope, and stable authority basis; availability and steering cannot substitute. |
| `WorkspaceBinding` | stable workspace/product authority | Present exactly when the selected definition variant requires it. |
| `PublicContractCatalog` | AF-24 product-definition publication | Publishes admitted definition and schema projections; does not author them. |

Subordinate payloads are operation ID arrays, variant arrays, native symbol
locators, schema definitions and paths, closed authority slots, public contract
coordinates, SDK member declarations, CLI grammar rows, adapter exit rows,
projection digests, parity inventories, and generated assets. The later
`PublicOperationHandlerBinding<K>` is a P2 relation between a
definition and its existing semantic handler; it is not a second definition
authority and is not implemented by T-281.

## Entity Lifecycle Matrix

| Entity | Identity | Authority owner | Declare/create | Read/project | Update/transition | Delete/retire |
|---|---|---|---|---|---|---|
| `PublicFunctionDefinition<K>` | function id, version, variant, digest | PRODUCT/requirements; AF-24 publishes | T-281 native definition admission | schema/catalog/SDK/CLI projectors | semantic change creates a new version | hard-break migration retires legacy definitions |
| `NativeContractDefinition<S>` | native symbol plus schema coordinate and projected schema digest | owning `PublicFunctionDefinition<K>` field | strict native schema admission then deterministic projection | type inference, `v.parse`, digest, and JSON-Schema projection | semantic schema change creates another contract version/digest | prior published contract remains version evidence |
| `PublicInvocation<K>` | invocation and request refs plus definition key | public ingress | common invocation admission | exact outcome/evidence projection | immutable | retained as admitted evidence |
| `PublicOutcome<K>` | invocation ref plus outcome kind/digest | owning semantic function plus outcome admission | admitted after indexed output validation | SDK/CLI/public projection | corrected evidence creates another outcome/version under owning law | retained as evidence |
| `InvocationAuthority<K>` | authority-set ref and basis digest | operation admission | assembled only from definition-required authority | runtime/public evidence projection | immutable; changed authority creates another identity | retained as evidence |
| `CapabilityGrantCoordinate` | digest-derived grant ref over capability/actor/approval/policy/scope/basis | capability admission | admitted before effect-bearing invocation | invocation/evidence projection | any constituent change creates another grant | expires with scope/basis; retained as evidence |
| `WorkspaceBinding` | binding ref/digest | AF-07 | separately admitted before scoped invocation | definition validates forbidden/exactly-one cardinality | immutable | no 5.0 destructive retirement |
| `PublicContractCatalog` | catalog id/version/digest | AF-24 | publishes admitted projected rows | package/install/qualification reads | changed definition basis creates another version | prior catalog retained |
| Generated projection | definition digest plus projection kind | deterministic projector | derived from one admitted definition set | build, pack, install, and parity gates | regenerated only from changed source | stale output replaced; owns no history |

## Authority Matrix

| Function or transition | Proposer | Evaluator | Verifier | Admitter | Executor | Projector | Retirement owner |
|---|---|---|---|---|---|---|---|
| define 19-operation family | product design | Prime and whole-family design review | definition admission and exact census | AF-24 publication admission | deterministic generator | contract/schema/SDK/CLI projector | product contract publisher |
| define native contract | definition author | Valibot schema plus shared projector | strict-schema, default, coordinate, projection, and digest verifier | definition admission | `v.parse` when input arrives | inferred native type and pinned JSON-Schema projection | owning definition version law |
| admit public invocation | caller/adapter | selected definition law | schema, variant, binding, actor, grants, and authority verifier | generic public ingress | owning semantic function after admission | generic public outcome transport | event/evidence retention owner |
| admit public outcome | owning semantic function/handler | indexed result/refusal law | output schema and causal basis verifier | owning result/event admission | not applicable | public egress projector | owning evidence law |
| bind semantic handler | P2 owner | exact key and behavior proof | handler parity/compiler | P2 build admission | existing operation-specific handler | packed SDK/CLI/catalog | handler owner |
| retire legacy public row | hard-break migration | exact accepted 19-row census | source/package/install negative scan | build/release gate | not applicable | absence proof | product contract publisher |

No metadata row proposes, evaluates, admits, or executes product behavior. The
definition records the semantic authority ref and effect classification; the
named owner performs the work.

## Function Derivation Matrix

| Discovered functionality | Atomic function/composition | Public projection | Effect | Definition disposition |
|---|---|---|---|---|
| workspace create/open | `AF-01`, `AF-02` | two workspace operations | filesystem; read/admission | retain distinct identities |
| catalog/runtime/evidence/replay/gap/action/observer/tuning reads | `AF-03 project` | one `project.read` family | pure read | contract variants under one relation |
| verify/resolve/install/bind | `AF-04..AF-07` | four distinct product/workspace operations | deterministic and filesystem/binding effects | retain distinct authority boundaries |
| catalog admit/view/apply | `AF-08..AF-10` | three catalog operations | admission, narrowing, non-callable application | retain callable/non-callable separation |
| invoke/start | One Surface `AF-11..AF-16` with T-270 at AF-15 | one `run.invoke` family | ABG traversal | contract only; no controller |
| continue current intent or selected action | T-272 AF-17 or AF-14/AF-15 path | one `run.continue` family | ABG continuation/traversal | contract only; no resume alias |
| human response | `AF-18` | one five-variant operation | attributed event admission | contract variants, not five operations |
| result assessment | `AF-19` | one operation | evidence/event admission | retain separate from F_H response |
| witnessed act | `AF-20` | one six-variant operation | attributed event admission | contract variants |
| tuning lifecycle | `AF-21` | one three-variant operation | attributed event admission | contract variants, draft remains separate entity |
| GTL program conformance | `AF-22` | one public variant | deterministic assessment | self-conformance stays qualification-only |
| context/config asset materialization | `AF-23` | one two-variant operation | product filesystem | contract variants |
| qualified RC/final cut materialization | `AF-25` | one two-variant operation | immutable release publication | installed-RC remains evidence, not a public variant |

`AF-11`, `AF-12`, `AF-13`, and `AF-16` remain distinct One Surface
authorities inside admitted GTL composition. Their absence from the public
operation roster is Prime contraction, not semantic collapse.

## Composition And Effects

1. **Identity**: definition projection followed by canonical admission returns
   the same operation/variant key and digest.
2. **Closed sum**: all invocation and outcome matches are exhaustive over the
   definition-derived key union; an unknown key is unrepresentable natively and
   refused by raw admission.
3. **Authority conservation**: projections may narrow representation but
   cannot add defaults, grants, binding, effect, or semantic authority.
4. **Effect separation**: definition and projection are deterministic and
   effect-free. Only the separately bound semantic function/handler performs
   the declared effect after public admission.
5. **Schema conservation**: native type, schema definition, catalog locator,
   SDK member, and CLI coordinate cite one definition key and digest.
6. **Variant closure**: no optional-field combination emulates another
   variant; each variant has one closed discriminated request and outcome.
7. **No partial publication**: release publication requires P2 handler parity
   for every P1 definition; P1 cannot expose missing-handler behavior.

For `run.invoke`, raw F_P transport output is not a `PublicOutcome<K>` and the
operation schema projector is not a worker-output parser. The T-256-selected
declared result contract, generic raw F_P envelope admission, contract decoder,
and owning relational admission must all succeed before admitted evidence can
reach AF-16 or propose an indexed public outcome. Malformed prose, missing
fields, a wrong contract ref, or a cross-operation payload therefore refuses
before write or closure.

## Prime Contraction Review

```json prime-contraction
{
  "schemaVersion": 1,
  "iacs": [
    "PublicFunctionDefinition<K>",
    "NativeContractDefinition<S>",
    "PublicInvocation<K>",
    "PublicOutcome<K>",
    "InvocationAuthority<K>",
    "CapabilityGrantCoordinate",
    "WorkspaceBinding",
    "PublicContractCatalog"
  ],
  "authoritativeCarriers": [
    "PublicFunctionDefinition<K>",
    "NativeContractDefinition<S>",
    "PublicInvocation<K>",
    "PublicOutcome<K>",
    "InvocationAuthority<K>",
    "CapabilityGrantCoordinate",
    "WorkspaceBinding",
    "PublicContractCatalog"
  ],
  "subordinatePayloads": [
    "operation and variant arrays",
    "native symbol locators",
    "schema definitions and asset paths",
    "SDK member declarations",
    "CLI grammar rows",
    "adapter exit rows",
    "closed default rows and projector overrides",
    "closed authority slots and public contract coordinates",
    "projection digests and parity inventories"
  ],
  "promotionTests": [
    {
      "candidate": "PublicFunctionDefinition<K>",
      "verdict": "promote",
      "reason": "Every schema, catalog, SDK, CLI, and admission consumer directly pattern-matches the operation-indexed public contract relation."
    },
    {
      "candidate": "NativeContractDefinition<S>",
      "verdict": "promote",
      "reason": "Native inference, v.parse admission, canonical projected-schema digest, and JSON-Schema publication independently consume the same strict Valibot schema and stable coordinates."
    },
    {
      "candidate": "PublicInvocation<K>",
      "verdict": "promote",
      "reason": "Each immutable public request is independently admitted under one exact function definition and authority basis."
    },
    {
      "candidate": "PublicOutcome<K>",
      "verdict": "promote",
      "reason": "Each immutable result, refusal, or non-terminal truth is independently validated and transported."
    },
    {
      "candidate": "InvocationAuthority<K>",
      "verdict": "promote",
      "reason": "Operation-indexed actor, grant, view, policy, steering, and basis truth is independently verified before effects."
    },
    {
      "candidate": "CapabilityGrantCoordinate",
      "verdict": "promote",
      "reason": "Each effect-bearing grant independently binds capability, actor, approval, policy, scope, and stable basis authority and is not inferable from availability or steering."
    },
    {
      "candidate": "WorkspaceBinding",
      "verdict": "promote",
      "reason": "Scoped operations independently pattern-match one immutable product, install, catalog, and root authority."
    },
    {
      "candidate": "PublicContractCatalog",
      "verdict": "promote",
      "reason": "Installed products and qualification independently pattern-match the published contract-set identity and digest."
    },
    {
      "candidate": "schema SDK CLI and catalog rows",
      "verdict": "remain_subordinate",
      "reason": "They deterministically project one definition key and own no operation meaning."
    }
  ],
  "recurrenceReview": {
    "status": "extend_existing",
    "ref": "build_tenants/abiogenesis/typescript/design/A5_PRIME_CONTRACTION_CENSUS.md#pc-004---public-operation-realization-rosters"
  },
  "authoritySourceCount": {
    "before": 8,
    "after": 8
  },
  "authoringSourceCount": {
    "before": 9,
    "after": 1
  },
  "disposition": "commonize_tenant",
  "ownerTicket": "T-281"
}
```

Prime preserves eight independently pattern-matched authorities while reducing
operation-specific authoring from repeated contract, metadata, CLI, workspace,
schema, SDK, and publication rosters to one family. Valibot is consumed as the
existing native contract language; T-281 adds no rival schema language or
compiler. Handler implementations are not counted as definition authors. They
retain distinct behavior owners.

## Domain Model

```mermaid
classDiagram
  direction LR
  class PublicFunctionDefinitionK {
    <<prime contract family>>
    +functionId
    +variant
    +workspaceBindingRequirement
    +nativeContractDefinitions
    +authorityAndEffect
    +schemaSdkCliCoordinates
  }
  class NativeContractDefinitionS {
    <<prime native contract meaning>>
    +nativeSymbol
    +schemaCoordinate
    +strictValibotSchema
  }
  class NativeTypeProjection {
    <<native inferred>>
    +InferOutput
  }
  class RawContractAdmission {
    <<native runtime admission>>
    +vParse
  }
  class SchemaProjection {
    <<pinned deterministic projection>>
    +toJsonSchema
    +canonicalDigest
  }
  class PublicInvocationK {
    <<prime ingress>>
    +invocationRef
    +invocationDigest
    +definitionKey
    +contractCatalog
    +requestContract
    +requestRef
    +requestDigest
  }
  class InvocationAuthorityK {
    <<prime authority>>
    +authoritySetRef
    +authoritySetDigest
    +authorityBasisRef
    +authorityBasisDigest
    +closedAuthoritySlots
    +capabilityGrants
  }
  class AuthoritySlot {
    <<closed subordinate sum>>
    +state_forbidden_or_typed_admitted
    +exactRefsAndDigests
  }
  class CapabilityGrantCoordinate {
    <<prime admitted grant>>
    +grantRef
    +grantDigest
    +capabilityDefinitionRef
    +actorApprovalPolicyScopeBasis
  }
  class WorkspaceBinding {
    <<prime stable binding>>
    +bindingRef
    +bindingDigest
  }
  class PublicOutcomeK {
    <<prime egress>>
    +outcomeKind_result_refusal_nonterminal
    +outcomeRef
    +outcomeDigest
    +invocationRef
    +payloadContract
    +payloadDigest
  }
  class PublicContractCatalogCoordinate {
    <<subordinate exact coordinate>>
    +catalogId
    +catalogVersion
    +catalogDigest
  }
  class PublicContractCoordinate {
    <<contract row coordinate>>
    +contractId
    +contractVersion
    +contractDigest
    +schemaAndNativeLocator
  }
  class PublicInvocationAdmission {
    <<ingress authority>>
    +admitExactPacket
  }
  class PublicOutcomeAdmission {
    <<egress admission authority>>
    +admitOwnerCandidate
  }
  class SchemaOnlyFixtureOwner {
    <<Phase A proof actor>>
    +constructCandidateOnly
  }
  class DefinitionFamilyAdmission {
    <<P1 authority>>
    +admitExactFamily
  }
  class PhaseBuildGate {
    <<build proof authority>>
    +phaseAParity
    +p1Parity
    +p2Absence
  }
  class AF24CatalogPublisher {
    <<separate publication authority>>
    +publishAdmittedProjection
  }
  class AdapterProjection {
    <<transport only>>
    +sdk
    +cli
  }
  class DefinitionProjectionSet {
    <<subordinate generated>>
    +schemaRows
    +catalogRows
    +sdkMembers
    +cliRows
  }
  class SemanticFunctionOwner {
    <<separate authority>>
    +atomicOrCompositionRef
  }
  class HandlerBindingK {
    <<P2 deferred relation>>
    +definitionKey
    +handlerRef
  }
  class PublicContractCatalog {
    <<prime published catalog>>
    +catalogId
    +catalogDigest
  }

  PublicFunctionDefinitionK "1" --> "0..*" PublicInvocationK : governs
  PublicFunctionDefinitionK "1" *-- "3..4" NativeContractDefinitionS : owns request result refusal and nullable nonterminal definition
  NativeContractDefinitionS "1" --> "1" NativeTypeProjection : infers
  NativeContractDefinitionS "1" --> "1" RawContractAdmission : parses
  NativeContractDefinitionS "1" --> "1" SchemaProjection : projects
  PublicInvocationK "1" *-- "1" InvocationAuthorityK : requires
  PublicInvocationK "1" --> "1" PublicContractCatalogCoordinate : binds exact catalog basis
  PublicInvocationK --> PublicContractCoordinate : binds request and expected outcomes
  InvocationAuthorityK "1" *-- "8" AuthoritySlot : exact physical slots
  InvocationAuthorityK "1" *-- "0..*" CapabilityGrantCoordinate : exact sorted grants
  PublicContractCatalogCoordinate ..> PublicContractCoordinate : resolves unique row against
  PublicInvocationK "1" --> "0..1" WorkspaceBinding : exact variant cardinality
  PublicOutcomeK "0..*" --> "1" PublicInvocationK : cites exact invocation
  NativeContractDefinitionS --> RawContractAdmission : parsed by
  PublicInvocationAdmission --> PublicInvocationK : admits only
  SchemaOnlyFixtureOwner --> PublicOutcomeAdmission : proposes private candidate
  PublicOutcomeAdmission --> PublicOutcomeK : admits only
  PublicFunctionDefinitionK "1" --> "1" SemanticFunctionOwner : cites
  DefinitionFamilyAdmission --> PublicFunctionDefinitionK : admits P1 family
  PublicFunctionDefinitionK "1" --> "1" DefinitionProjectionSet : derives
  SchemaProjection "1..*" --> "1" DefinitionProjectionSet : supplies exact schemas
  DefinitionProjectionSet "1..*" --> "1" AF24CatalogPublisher : supplies admitted rows
  AF24CatalogPublisher --> PublicContractCatalog : publishes
  PhaseBuildGate --> NativeContractDefinitionS : verifies Phase A
  PhaseBuildGate --> DefinitionProjectionSet : verifies P1 and P2
  PublicContractCatalog --> AdapterProjection : sole public source
  PublicFunctionDefinitionK "1" --> "0..1" HandlerBindingK : P2 binds
  SemanticFunctionOwner "1" --> "0..1" HandlerBindingK : implements through
```

The aggregate `0..1` association is a diagram projection of a closed sum.
Every concrete variant is either `forbidden` or `exactly_one` and public
admission rejects both an absent required binding and a supplied forbidden
binding.

## Execution Sequence

```mermaid
sequenceDiagram
  actor Builder
  actor Caller
  participant Family as Definition Family
  participant Native as Valibot Native Contract
  participant RawAdmission as RawContractAdmission
  participant Projector as Deterministic Projector
  participant FamilyAdmission as DefinitionFamilyAdmission
  participant Gate as PhaseBuildGate
  participant Ingress as PublicInvocationAdmission
  participant FixtureOwner as SchemaOnlyFixtureOwner
  participant Admission as PublicOutcomeAdmission
  participant AF24 as AF24CatalogPublisher
  participant Egress as AdapterProjection

  Builder->>Native: define strict private schema and exact common packets
  Native->>Native: infer TypeScript from schema value
  Native->>RawAdmission: supply same schema value to v.parse
  Native->>Projector: project canonical JSON Schema with throw-on-unsupported
  Projector->>Gate: Phase A schema type admission and digest parity
  alt transform unsupported override or divergent projection
    Gate-->>Builder: Phase A refusal and no product export
  else private mechanism admitted
    Gate-->>Builder: mechanism checkpoint only
  end

  Caller->>Ingress: source-only workspace.create clean fixture
  Ingress->>RawAdmission: admit exact authority invocation and request packets
  RawAdmission-->>Ingress: typed fixture request or refusal
  Ingress->>Ingress: validate authority actor and forbidden binding
  alt malformed input or supplied forbidden binding
    Ingress-->>Caller: internal fixture refusal with no effect
  else admitted schema-only fixture
    Ingress->>FixtureOwner: transport exact admitted fixture only
    FixtureOwner->>Admission: construct source-only result or refusal candidate
    Admission->>RawAdmission: admit selected fixture outcome schema
    RawAdmission-->>Admission: typed indexed output or contract refusal
    alt malformed or cross-operation output
      Admission-->>Caller: internal OutcomeAdmissionFailure
    else indexed output admitted
      Admission-->>Caller: private PublicOutcome proof only
    end
  end

  Builder->>Family: P1 author exact private 19-operation relation
  Family->>Native: bind request result refusal and nonterminal schemas
  Family->>FamilyAdmission: admit exact closed family and owner coordinates
  FamilyAdmission->>Projector: derive private candidate schemas catalog SDK CLI inventories
  Projector->>Gate: P1 definition parity
  alt missing owner schema extra divergent or legacy contribution
    Gate-->>Builder: P1 refusal and no 5.0 public surface
  else exact private family
    Gate-->>Builder: P1 candidate ready for atomic P2
  end

  Builder->>Gate: P2 exact handler bindings and cutover
  alt handler or source package install absence proof fails
    Gate-->>Builder: build refusal and frozen legacy remains non-public
  else atomic switch and hard-break proof pass
    Gate->>AF24: release exact admitted projection set for publication
    AF24->>Egress: publish sole catalog-derived SDK and CLI surface
  end
```

The fixture is deliberately non-Consensus and schema-only. It proves the
native type/admission/projection mechanism without disguising the current
`authorityMode` production handler as the target `createPolicy` contract,
performing a filesystem effect, or claiming P2 handler parity.

## Lifecycle State Machine

```mermaid
stateDiagram-v2
  [*] --> PhaseARawSchema
  PhaseARawSchema --> PhaseARefused: PhaseBuildGate rejects unsupported action or divergent projection
  PhaseARawSchema --> PhaseAMechanismAdmitted: PhaseBuildGate proves type parse schema digest parity
  PhaseAMechanismAdmitted --> CandidateFixtureProposed: source-only schema fixture
  CandidateFixtureProposed --> CandidateFixtureRefused: PublicInvocationAdmission rejects packet authority or binding
  CandidateFixtureProposed --> CandidateFixtureAdmitted: PublicInvocationAdmission admits exact typed fixture
  CandidateFixtureAdmitted --> CandidateOutcomeProposed: SchemaOnlyFixtureOwner constructs candidate without effect
  CandidateOutcomeProposed --> CandidateFixtureOutcomeRefused: PublicOutcomeAdmission rejects contract or key
  CandidateOutcomeProposed --> PhaseAReady: PublicOutcomeAdmission admits indexed private outcome
  PhaseAReady --> RawDefinitionFamily: exact owner schemas available
  RawDefinitionFamily --> DefinitionRefused: DefinitionFamilyAdmission rejects malformed duplicate incomplete prose-only or legacy input
  RawDefinitionFamily --> DefinitionAdmitted: DefinitionFamilyAdmission admits exact private family
  DefinitionAdmitted --> CandidateProjectionsDerived: DeterministicProjector derives private projection
  CandidateProjectionsDerived --> BuildRefused: PhaseBuildGate rejects P1 parity
  CandidateProjectionsDerived --> P1Ready: PhaseBuildGate proves exact private definition parity
  P1Ready --> BuildRefused: PhaseBuildGate rejects P2 handler cutover or legacy absence
  P1Ready --> PublicSurfaceReady: PhaseBuildGate authorizes atomic cutover and AF24 publishes admitted rows
  PublicSurfaceReady --> InvocationProposed: caller selects catalog-derived definition and variant
  InvocationProposed --> InvocationRefused: PublicInvocationAdmission rejects input authority or binding
  InvocationProposed --> InvocationAdmitted: PublicInvocationAdmission admits exact typed invocation
  InvocationAdmitted --> OutcomeProposed: owning semantic function constructs candidate outcome
  OutcomeProposed --> OutcomeRefused: PublicOutcomeAdmission rejects malformed or mismatched output
  OutcomeProposed --> OutcomeAdmitted: PublicOutcomeAdmission admits indexed result refusal or nonterminal truth
  PhaseARefused --> [*]
  DefinitionRefused --> [*]
  BuildRefused --> [*]
  CandidateFixtureRefused --> [*]
  CandidateFixtureOutcomeRefused --> [*]
  InvocationRefused --> [*]
  OutcomeRefused --> [*]
  OutcomeAdmitted --> [*]
```

`PhaseAReady` proves mechanism only. `P1Ready` is a source-build milestone, not
a public runtime state. Frozen 4.6 code can remain migration input at both
states but cannot validate, generate, or appear in their candidate truth.
Only `PublicSurfaceReady`, reached by the atomic P2 switch, legacy absence
proof, and AF-24 publication, may enter the packed 5.0 publication path.

## Cross-View Invariants

| Check | Evidence | Verdict |
|---|---|---|
| Every public operation derives from accepted Ontology functionality | exact matrix maps all 19 rows to AF-01..AF-25 or admitted One Surface composition | pass |
| One definition family owns all operation-specific contract meaning | domain ownership and definition shape; all output rows subordinate | pass |
| Native type, raw admission, digest, and schema derive from one value | strict Valibot schema plus inferred type, `v.parse`, and pinned projector | pass as Phase A design |
| Semantic behavior remains separately owned | domain `SemanticFunctionOwner`, sequence effect edge, P2 handler relation | pass |
| Binding cardinality is closed per variant | exact matrix and domain closed-sum note | pass |
| `project.read` is a closed source/projection relation | 27 exact cases bind source, result, capability, and binding cardinality | pass |
| Malformed input cannot reach an effect | sequence ingress refusal and state transition | pass |
| Malformed output cannot become public truth | sequence outcome admission and state refusal | pass |
| No partial public surface is published after P1 | sequence parity gate and P1/P2 states | pass |
| Hard break removes rival public truth | private P1 state plus atomic P2 switch and source/package/install negative scans | pass as target; P2 proof pending |
| Non-Consensus proof prevents consumer-shaped infrastructure | schema-only `workspace.create(clean)` fixture with no handler/effect | pass as Phase A design |

## Axiom Evaluation

| Axiom | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|
| GTL program is program; GraphFunction is callable member | PRODUCT, T-278, T-270 | run.invoke definition cites semantic owner only | ingress never invokes by metadata | no definition state is runtime state | exact run.invoke request types | T-270 program membership admission | pass | none |
| Prime contract authority | ADR-044 | one definition family; projections subordinate | single projector | no second authored state | `satisfies` and closed mapped types | Prime and parity gates | pass | none |
| Native/schema one-source law | REQ-P-PUBLIC-CONTRACTS-005 | one strict Valibot schema is directly consumed | infer parse project digest | unsupported schema or override refuses | `v.InferOutput<S>` | `v.parse` and pinned JSON-Schema projection share source | pass as Phase A design | T-281 Phase A proof |
| Operation-indexed type conservation | REQ-P-PUBLIC-CONTRACTS-009..010 | invocation/outcome keyed by K | exact input and output admission | cross-operation output refuses | nominal/discriminated types; no weak index | raw definition and invocation admission | pass | none |
| No metadata mega-handler | PRODUCT layer law | separate semantic owner and deferred handler binding | effect call crosses explicit owner | metadata has no running state | exhaustive typed handler map at P2 | source scan rejects generic unchecked dispatch | pass | P2 proof |
| Malformed likely inputs fail closed | trusted-desktop operating boundary | schema coordinates owned by definition | refuse before effect | explicit refusal states | native constructors and raw admitters | schema and projection parity | pass | none |
| Malformed likely outputs fail closed | F_P/output admission law | PublicOutcome is distinct prime | output admission before egress | malformed output refuses | indexed result/refusal types | runtime result/schema admission | pass | handler owners |
| Hard break | PRODUCT and requirement 008 | private P1 family then one atomic public P2 family | no fallback route | P1 cannot publish; P2 refuses until legacy absence | exact key union | source package install negative scans | pass as target | T-281/P2 proof |
| Proportional defense | GOAL-035 operating boundary | no signer lock service or adversary model | local validation only | bounded refusal states | ordinary strict TypeScript | deterministic local gates | pass | none |
| Honest incompleteness | SPEC_METHOD | Phase A mechanism, P1 family, and P2 handler/cutover are distinct | build refuses partial publication | PhaseAReady and P1Ready remain distinct from PublicSurfaceReady | no fake implementation member | missing owner schema or P2 parity remains a typed blocker | pass | T-281/P2 |

## Realization And Proof Plan

Phase A is independently closable and shall:

1. pin `@valibot/to-json-schema@1.6.0` beside Valibot `1.3.x` and expose one
   shared `NativeContractDefinition<S>` plus throw-on-unsupported projector;
2. define the exact `InvocationAuthority<K>`, `PublicInvocation<K>`,
   `PublicOutcome<K>`, `PublicContractCoordinate`, default, ref, digest, scalar,
   and internal `OutcomeAdmissionFailure` schemas;
3. prove inferred native types, strict raw admission, canonical schema bytes,
   and digests all derive from the same schema value;
4. prove `none | literal` default ordering and refusal without a callback,
   derivation, environment, time, filesystem, or adapter source, and prove the
   exact seven native-action projector mappings with every other action
   rejected;
5. prove a private schema-only `workspace.create(clean)` fixture plus one
   external public-contract-coordinate resolution fixture; and
6. prove source/package/publication scans contain no Phase A product export,
   operation row, SDK/CLI path, handler call, filesystem effect, custom schema
   algebra, or unchecked correlation cast.

Phase A stops after that mechanism proof. It does not author the 19-row family.

P1 then shall:

1. port each accepted operation request/result/refusal/non-terminal shape from
   its owning current authority to one strict native schema; stop where the
   authority does not close exact fields;
2. define one closed object keyed by the exact 19 operation identities, with
   each variant nested as a closed keyed relation and no duplicate ID array;
3. derive operation/variant key unions, common packets, three assets per
   operation, SDK/CLI coordinates, catalog rows, and inventories from that one
   family;
4. derive the three `project.read` assets from one closed 27-case relation that
   composes owner schemas, including the existing Consensus schema object;
5. reject missing, extra, cross-key, binding, coordinate, owner-schema,
   duplicate, legacy-contribution, and projection-digest mismatches; and
6. retain the resulting family and projections as private candidate truth for
   the P2 atomic switch.

P2 binds one explicit typed handler map, atomically switches exports,
publication, SDK, CLI, and catalog to the P1 family, deletes the frozen legacy
roster/assets/facades, and proves source/package/install parity. T-270 and
T-272 may develop against the private family but cannot close public
integration before P2. T-268 cannot claim
`abg.capability.operator.public-contract@5` until P2 is green.

### Negative Proof

- 18 or 20 definition identities refuse;
- any legacy identity or alias refuses;
- duplicate identity, operation/variant key, CLI path, SDK coordinate, schema
  locator, or public catalog row refuses;
- an unknown or omitted variant refuses;
- a value-changing transform, non-listed action, ad hoc callback, unsupported,
  ambient, cyclic, or digest-divergent native schema/projection refuses before
  a definition admits;
- any custom schema constructor algebra or handwritten schema equivalent fails
  the Phase A source scan;
- unknown, duplicate, or digest-divergent `PublicContractCoordinate` resolution
  refuses against the exact admitted catalog basis;
- an unsupported `project.read` source/projection pair or a source whose kind
  does not match its selected case refuses;
- a binding on a forbidden variant and no binding on an exactly-one variant
  both refuse;
- request, result, or refusal substitution across operation/variant keys
  refuses;
- raw F_P output cannot substitute for an admitted `run.invoke` result or
  bypass its declared result-contract admission chain;
- a permissive union whose optional fields emulate another variant refuses;
- any schema/SDK/CLI/catalog projector with independent defaults or IDs fails
  digest/parity proof;
- an unchecked generic cast or permissive operation index fails source review;
- a missing handler prevents P2/release publication rather than producing a
  public runtime fallback; and
- Phase A and P1 package/publication scans contain no candidate public surface;
  and
- after P2, source, packed tarball, and clean install contain no superseded
  public operation identities, schemas, SDK members, or parallel catalog rows.

## Stop Conditions

- stop if the exact 19-operation or variant domain requires a constitutional
  change rather than this design reframe;
- stop if one variant's workspace-binding classification cannot be derived
  from accepted entity lifecycle and authority law;
- stop if strict TypeScript cannot preserve operation/request/result/refusal
  correlation without an unchecked cast or permissive index;
- stop if the native projector silently drops a Valibot constraint or requires
  an open-ended override mechanism;
- stop if Phase A becomes a general schema language/compiler or grows beyond a
  bounded shared wrapper and projector;
- stop if the new family cannot delete more authored validation, schema,
  roster, and adapter truth than it adds;
- stop if a projector begins owning defaults, authority, effects, or behavior;
- stop if implementation requires a generic controller or moves semantic
  behavior into the definition register;
- stop if P1 must publish a partially bound public surface to unblock T-270;
- stop if a legacy alias or second register appears necessary; and
- stop and re-enter the owning design if malformed F_P or handler output can
  bypass indexed outcome admission.

## Verdict

`accepted_for_phase_a_only`

The exact 19-operation target and Prime one-family direction remain accepted.
This repaired candidate rejects the custom contract algebra, closes the native
Phase A mechanism and common packet laws, preserves a private P1 and atomic P2
hard break, and keeps missing operation-owner schemas as honest P1 gaps.
Independent review accepted the exact semantic candidate recorded by T-281.
Phase A implementation is authorized. The exact P1 family and P2 cutover
remain separately gated and release-blocking.
