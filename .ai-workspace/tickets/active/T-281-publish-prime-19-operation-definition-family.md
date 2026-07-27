# T-281 - Publish The Product-Neutral Installed Public Path

> **Current disposition (2026-07-28):** The bounded Prime gate and S06
> product-neutral installed shell are frozen at `fd6a3f16` for independent
> review. Do not edit the subject, add functionality, or begin S04. The
> retained 19-operation and X-era material is historical donor evidence.

- id: T-281
- title: Publish the product-neutral installed public path
- type: feature
- ticket_category: implementation_migration
- status: active
- implementation_hold: exact_s06_review_handoff
- implementation_hold_ref: GOAL-035 current S06 outcome under T-270
- implementation_hold_effect: >-
    prohibit further realization after the exact S06 candidate freeze; permit
    only mechanical evidence and review handoff while S04, qualification,
    release, alternate functionality, and broad runtime refactoring remain held
- phase_status: m5_s06_candidate_frozen
- review_status: pending_independent_exact_cut_review
- proof_status: mechanical_green_m5_165_m4_26_external_36_prime_4_portability_4
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: M5_after_s03_and_s05
- change_intent: >-
    Preserve the Product-neutral installed public seam while proving one native
    SDK and CLI invocation, one bounded Codex projection over the same public
    contract, and one independently flavored downstream catalog Product with
    no copied runtime or core product-specific branch.
- change_class: requirement_reprice
- re_entry_point: >-
    specification/requirements/product/REQ-P-SCENARIOS.md
    REQ-P-SCENARIOS-009 and REQ-P-SCENARIOS-013
- triaged_at: 2026-07-24
- created_at: 2026-07-16
- updated_at: 2026-07-28
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-278
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: replace
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/product and
    build_tenants/abiogenesis/typescript/code/src/public
- accepted_s06_design_commit: 6aaedf8d826f846a11291676413bd35f93df0ef4
- accepted_s06_design_sha256: fb9e71bccf3e98972179df81a7c22ee7dbc266175d6cda1ae8bc5dff875429b3
- current_s06_candidate: fd6a3f1670687fcf5e50765161a72fd769d6271b
- current_s06_candidate_tree: 8d3aeccf8a3e9966df31c68382ed03f6807baac8
- current_s06_package_digest: d747cf0f99eeac442baf2a8c068bb605943040fb7780a4c7c6b0fcfa41d62cdd
- current_s06_package_inventory_digest: 8ee18e0de2439672c7da88bb413408e684f5b37843463124afcbaf709bbb71dc
- current_s06_handoff: >-
    .ai-workspace/comments/codex/
    20260727T183833Z_HANDOFF_t281_s06_portability_candidate.md

## Current M5 Reprice

T-281 is subordinate to T-270 and owns one bounded public-product seam:

```text
empty consumer directory
  -> install packed ABIogenesis
  -> install separately packed developer GTL Product
  -> resolve non-empty Product dependency lock
  -> bind workspace
  -> admit caller-supplied Module publication
  -> narrow catalog
  -> invoke selected GraphFunction through installed SDK and CLI
  -> direct HoG traversal
  -> ABG events and replay-derived typed result
```

The developer Product owns its namespace, Module, Program, GraphFunction,
input/output contracts, judgment relation, and implementation binding.
ABIogenesis owns generic raw admission, validation, environment binding,
catalog admission, invocation, traversal, runtime truth, and public projection.

Closure requires:

- no developer-Product identifier, contract switch, validator, judgment, or
  implementation import in ABIogenesis core;
- caller-supplied publication rather than construction of a built-in
  publication by `catalog.admit`;
- a non-empty lock edge from the mini-product to its ABIogenesis dependency;
- exact installed implementation resolution from the admitted Product set;
- the same typed result from CLI output and ABG replay; and
- substitution negatives for undeclared dependency, contract, publication,
  implementation bytes, and product-specific core branching.

This checkpoint does not define a fixed operation roster, complete S06,
authorize host projection, or resume any historical X implementation. After it
is green, T-281 remains the existing owner for later S06 public and downstream
portability work.

## Current S06 Reprice

S06 resumes this ticket at its accepted public extension boundary:

```text
same installed public contract
  -> native SDK invocation
  -> native CLI invocation
  -> bounded Codex CLI or skill delegation
  -> independent flavored catalog Product
  -> publish -> apply -> invoke
  -> one HoG and ABG runtime path
  -> replay-derived typed outcome
```

The Codex projection may translate transport and presentation only. It shall
not copy a Program, select traversal, invoke a worker directly, emit an ABG
event, construct a continuation, or decide closure. The flavored fixture owns
its namespace, Module, Program, GraphFunction, contracts, judgment, declaration
application, and implementation; ABIogenesis core shall require no fixture
identifier or source-tree knowledge.

Closure is the installed `ABG5-S06` scenario in `PRODUCT.md` and
`REQ-P-SCENARIOS-013`, not a resurrected operation count or X-era publication
plan. Observer/tuner realization remains T-268's sibling boundary.

Before portability promotion, consume, extend, or explicitly refuse the four
bounded recurrence families named by GOALS and T-270:

1. exact zero/one/many catalog coordinate lookup;
2. Product-local verified installed-module loading;
3. Product dependency topology; and
4. GTL declaration/publication construction.

The gate preserves owner and admission authority. It does not authorize broad
ABG or HoG refactoring.

### Prime Gate Projection

The accepted contraction is recorded in M05 Section 14.0:

| Family | Disposition |
|---|---|
| exact catalog coordinate lookup | consume one Product-local `ResolveExactMatch` zero/one/many relation |
| verified installed-module loading | consume one Product-local content, confinement, and import relation; callers retain semantic validation |
| Product dependency topology | consume one cycle predicate in lock construction and validation |
| GTL declaration/publication construction | extend GTL mechanical constructors; retain Product-owned identities, topology, meaning, and complete publication assembly |

The module-owned `test:m5:s06-prime` lane must remain mutation-sensitive for
all four dispositions. This is a bounded refactor, not a new public operation
or runtime capability.

## S06 Realization

The realization consumes the installed package's declared `./gtl`,
`./product`, and `./public` exports. The independently packed flavored Product
type-checks its declarations against those public contracts, owns its complete
Product meaning, and carries no ABIogenesis deep-runtime import. Native SDK,
native CLI, and `abg.codex` execute the same serialized public transcript;
`abg.codex` only validates two absolute file paths, spawns the exact installed
CLI, and forwards process bytes and status.

The existing catalog admits and applies the Product's exact URI-coordinate
`node_type` and `overlay` rows. No catalog, Program, traversal, worker,
continuation, event, or closure alternative is introduced. Candidate
`fd6a3f16`, tree `8d3aeccf`, and package `d747cf0f...62cdd` are the sole S06
review subject.

## Independent Product Checkpoint

Commit `bc9ca26a` proves this bounded seam through the installed SDK and CLI.
The independently packed mini-product owns its namespace, Module, Program,
GraphFunction, contracts, judgment, semantics provider, and implementation.
ABIogenesis core owns only generic verification, installation, dependency
locking, publication validation, catalog admission, invocation, HoG traversal,
ABG truth, replay, and public projection.

Fresh serialized gates are M5 `71/71` and retained M4 `26/26`. Missing
installed Product semantics and an undeclared judgment predicate fail closed,
and ABIogenesis core contains no mini-product identifier or dispatch branch.
This closes `ABI5-M5-EXT-001`, not S06. T-281 is held until its existing S06
role becomes current.

## Historical X Evidence

Everything below this heading is retained source material from the prior X
trajectory. It has no current implementation or closure authority unless the
current reprice explicitly cites a bounded claim.
- dependencies:
  - ratified T-278 Ontology projection digest bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615; rebind from accepted-design basis 039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1 changes only the GOALS source-digest row and carries no semantic-target delta
  - accepted GOAL-035 P1 public-operation prerequisite
  - REQ-P-PUBLIC-CONTRACTS-008 through 010
  - completed T-277 Prime contraction law
- downstream_dependencies:
  - independently accepted T-274A supplies the Phase-A-compatible neutral ticket_consensus projection source; T-281 still owns the generic project.read request/refusal/result wrapper, projection-basis seal, and absent nonterminal truth
  - T-270 neutral owner-native run.invoke contract milestone precedes P1; its public runtime integration follows P1
  - T-272 neutral owner-native run.continue and interaction.respond contract milestone precedes P1; its continuation integration follows P1
  - T-274B consumes the admitted P1 contract coordinates for public publication
  - T-275 follows completed P1 and T-274B, then supplies later ticket_consensus handler and projection semantics
  - P2 follows T-275 and the remaining semantic owners, then proves packed catalog SDK and CLI parity
  - T-268 publishes capability claims only after P2 closes
- authority_refs:
  - specification/GOALS.md GOAL-035 DS-2/DS-4 and P1/P2 sequence
  - specification/INTENT.md public operator direction
  - specification/PRODUCT.md Public Operator Contract
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md 005, 008..010
  - specification/requirements/product/REQ-P-POLICY.md public operation behaviors
  - specification/requirements/product/REQ-P-INSTALL.md 043..060
  - specification/requirements/product/REQ-P-CATALOG.md 023..030
  - specification/requirements/abg/REQ-R-ABG3-TUNER.md 003..005
  - build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
  - build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md
- prime_contraction_refs:
  - PC-004
  - PC-005
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260717T112900Z_DECISION_fh_accept_t281_p1_central_join.md
- pre_implementation_audit_design_digest: >-
    2b5153aedb06dc5c814bf356de45b1ec5bc3b91a766d107002d0f2b3176e6f6e
- independently_reviewed_candidate_digest: >-
    6021994ae88bcd8d83909d6e50f94805db4b624a5ff124835295ce9ddd7b0e1a
- independent_design_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T081520Z_REVIEW_t281_public_operation_definition_family.md
- superseded_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T081520Z_DECISION_fh_accept_t281_public_operation_definition_family.md
- implementation_readiness_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T084853Z_REVIEW_t281_implementation_readiness.md
- phase_a_source_resolution_rejection_ref: >-
    .ai-workspace/comments/codex/
    20260716T162446Z_REVIEW_t281_phase_a_source_resolution_rejection.md
- phase_a_source_resolution_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T165012Z_SELF_REVIEW_t281_phase_a_source_resolution_repair.md
- phase_a_source_resolution_candidate_design_digest: >-
    3a7bcc08f69fe7e52b4f11b149bf219ab060ef1d2966fc1084baeeff65c4fc8b
- rejected_phase_a_candidate_digest: >-
    ba6bef8f3505590534c92a63ca79d1f813b7a5487ce8dfe970ad17fe009022ed
- accepted_phase_a_semantic_candidate_digest: >-
    0d099c7bf949b421ec3dfcf656a5aebcdb8bfe82d1d6b251e57787c417f8ee11
- phase_a_independent_design_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T101307Z_REVIEW_t281_native_phase_a_design.md
- phase_a_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T101307Z_DECISION_fh_accept_t281_phase_a.md
- accepted_phase_a_gate_complete_design_digest: >-
    5a30b2094abd25df85c6beb9124039b80665841f32412bde745e52e0487ccefb
- superseded_accepted_p1_constructor_design_digest: >-
    1bbf4bcb5fbe53f97e150ae743b798fb4c1fe0c5ea4d6fb4753bdc31f3b22d7a
- repaired_p1_owner_composition_candidate_digest: >-
    77d413ec253958d61c15a32c23bd66a235aed5ab4115cb460ca30f9f81cb711c
- owner_authority_split_candidate_digest: >-
    b221dbff6345e524044ad7febb80d3515f92f1cfb12b8b409293c91a5cd0b7d5
- prime_owner_source_candidate_digest: >-
    b4824c806971367c6408181d7c8c87567dbdffc98303ec0ebb0733efd6a19dd4
- exact_catalog_and_release_contract_candidate_digest: >-
    9ab76163499e0831a3ff87f3dc1b5adba02c19d690b6a953651888f6fe9915b7
- complete_owner_contract_row_repair_candidate_digest: >-
    d612a4f7fd3d8aaa17f2228f62a5df818f7743e971631ce4a8806ae4319805b7
- bounded_rereview_repair_candidate_digest: >-
    fe46f330313f26a87ff0dc2c487bcba21276a39d8a2d46652cae94609ca154e7
- truth_only_terminal_repair_candidate_digest: >-
    0448091e17fe14261507ae4eb183f508774dc2602d97c01f4da6d43281073579
- p1_exact_candidate_digest: >-
    f4228920cbf91152be569604e9fa7586903feb7b92ef81b456457a3ea2252c8b
- p1_exact_candidate_disposition: rejected_native_definition_key_constructability
- p1_native_key_repair_candidate_digest: >-
    3cf2bfb274c27d553d9863353af2e8b3c4d177311042b7e9dd324b9f51e45d18
- p1_native_key_repair_candidate_disposition: rejected_native_authority_and_type_correlation
- p1_native_key_repair_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T002627Z_SELF_REVIEW_t281_native_definition_key_repair.md
- p1_native_authority_and_type_correlation_repair_candidate_digest: >-
    83de4ec5419c279ec09bd6e08bf3c67ef04a8b382b252947dccbe6b626e02a04
- p1_native_authority_and_type_correlation_repair_candidate_disposition: rejected_structural_definition_key_packet_correlation
- p1_native_authority_and_type_correlation_repair_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T011752Z_SELF_REVIEW_t281_native_authority_type_correlation_repair.md
- p1_structural_definition_key_repair_candidate_digest: >-
    01022386a2a89e523f11b0ffb363573299d35985240840dc6adac2bfb4d16838
- p1_structural_definition_key_repair_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T020951Z_SELF_REVIEW_t281_structural_definition_key_repair.md
- p1_structural_definition_key_independent_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T024331Z_REVIEW_t281_structural_definition_key_acceptance.md
- accepted_p1_structural_definition_key_design_digest: >-
    01022386a2a89e523f11b0ffb363573299d35985240840dc6adac2bfb4d16838
- p1_implementation_authority: delegated_fh_accepted_private_all_or_nothing_constructor_boundary
- p1_non_read_owner_input_commit: d80cef8f4aa9f04f7fad678918f89031f37295cb
- p1_non_read_owner_input_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T033834Z_SELF_REVIEW_t281_non_read_owner_input_checkpoint.md
- p1_project_read_owner_design_candidate_digest: >-
    6f7a6d9a40d593d0ff687b8dc94af1cbca12213266ccd5715e7163595ad58019
- p1_project_read_owner_design_independent_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T042304Z_DECISION_fh_accept_t281_project_read_owner_design.md
- accepted_p1_project_read_owner_design_digest: >-
    6f7a6d9a40d593d0ff687b8dc94af1cbca12213266ccd5715e7163595ad58019
- p1_structural_owner_source_commit: d4ce8abf
- p1_structural_owner_source_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T043356Z_SELF_REVIEW_t281_structural_owner_source.md
- p1_project_read_request_refusal_commit: 6e280bb8
- accepted_p1_owner_schema_registry_design_digest: >-
    4a43048c7173d60a36de2eb912b7caa86d4f5ad681641db4974f9a9492391bb7
- p1_owner_schema_registry_design_commit: f6ee8180
- p1_project_read_and_registry_checkpoint_ref: >-
    .ai-workspace/comments/codex/
    20260717T052142Z_CHECKPOINT_t281_project_read_wrappers_and_registry_design.md
- p1_owner_schema_registry_implementation_commit: 296ba699
- p1_installed_governor_checkpoint_ref: >-
    .ai-workspace/comments/codex/
    20260717T061159Z_CHECKPOINT_t276_governor_t281_registry_link.md
- p1_project_read_projection_source_commit: 86193832
- accepted_p1_deeper_constructability_repair_candidate_digest: >-
    18d9bcc559d973daac355ad768b1cf5eb8ffb7f9dcd3cd6d2c60c95e5bea1801
- superseded_direction_fence_candidate_digest: >-
    2cfb00aea1e34b442bae28478dc238951b1ee15383be99aa376ef64ce478809d
- superseded_p1_central_join_design_digest: >-
    20d46eabe1168e5ad4ca48374218188dba1c9218dea8de5e5b90b5e992ab4f2f
- p1_central_join_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260717T112900Z_DECISION_fh_accept_t281_p1_central_join.md
- p1_design_basis_reconciliation_ref: >-
    .ai-workspace/comments/codex/
    20260717T000500Z_RECONCILIATION_t281_p1_exact_design_basis.md
- p1_implementation_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T135410Z_SELF_REVIEW_t281_p1_private_family_checkpoint.md
- repaired_p1_owner_composition_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T164206Z_SELF_REVIEW_t281_owner_contract_composition_repair.md
- complete_owner_contract_row_repair_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T175243Z_SELF_REVIEW_t281_complete_owner_contract_row_repair.md
- historical_input_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md

## Boundary

T-281 is the P1 definition milestone required before T-270/T-272 public runtime
integration and after their neutral owner-contract milestones. It resolves every
operation and variant request/result/refusal/non-terminal slot against an exact
owner-native schema before it can author one closed
`PublicFunctionDefinition<K>` family over the exact 19 operation identities.
Missing, ambiguous, prose-only, legacy-only, or digest-divergent owner truth
produces a typed non-empty P1 gap set and stops the pass. No partial family
admits.

Each admitted definition owns its operation and variant identity and binds the
exact owner-native request/result/refusal relation. It also owns the public
authority/effect classification, actor and capability requirements,
workspace-binding cardinality, schema coordinates, SDK coordinate, CLI
coordinate, and adapter exit mapping. The semantic owner retains payload
meaning and behavior.

`PublicInvocation<K>` and `PublicOutcome<K>` remain common operation-indexed
carrier families. Operation catalog rows, schemas, SDK declarations, CLI
grammar, and parity inventories derive from the definition family. They do not
author another roster or semantic default.

Semantic functions and effect handlers retain their existing owners. T-281
does not implement a generic operation controller, move behavior into
metadata, bind every handler, or claim the final packed public surface. The P2
milestone binds every operation to its owning handler and proves full packed
catalog, SDK, CLI, and capability parity.

P1 adds exactly one private operation-indexed authoring source: the
19-operation family. Existing owner-native payload schema authorities remain
distinct and are composed, not re-authored. All private schema, catalog,
SDK/CLI-coordinate, and parity projections derive from those owner schemas and
the one family. T-281 adds no semantic handler, owner-payload schema, public
schema, catalog publication, SDK/CLI implementation, package export, or public
authority.

The accepted owner-registry implementation makes schema-local relational
admission part of the same owner module and source digest as its schema. The 27
`project.read` projection sources are partitioned among their existing semantic
owners. Because schema-local checks cannot observe the admitted request, each
owner also supplies one same-module typed request-to-projection relation through
ten Prime family constructors. Central T-281 composes the generic result wrapper
and sole contract-shape basis. No leaf can admit or publish a partial P1 family.

## Hard Break

- Retire the legacy exact-36 identity roster and every non-derived legacy
  operation, alias, facade, fallback, schema row, SDK member, and CLI semantic
  register.
- Retain ergonomic command spelling only as a coordinate of one current
  definition and variant.
- Do not publish a partial or compatibility catalog between P1 and P2.
- Missing handler binding is a build-time P2 parity defect, not a public
  `not_implemented` behavior.
- Do not retain `catalog.invoke`, `run.resume`, independent `fh.*`, independent
  `read.*`, or equivalent legacy public identities as parallel truth.

## Delivery

1. Accept the repaired three-view native-schema design.
2. Phase A proves one private Valibot-native contract/projector mechanism, the
   exact common authority/invocation/outcome packets, and a schema-only
   non-Consensus fixture. It exports and invokes nothing.
3. P1 resolves exact owner-native schemas into a closed build-only sum. A
   non-empty typed gap set stops construction without public output.
4. Only when every slot resolves, admit one private operation-indexed
   definition family and derive temporary request/result/refusal schemas,
   candidate catalog rows, SDK/CLI coordinate inventories, and parity evidence.
5. Fail definition and projection generation on duplicate, missing, extra,
   malformed, unsupported, prose-only, or legacy-contributed rows.
6. Consume the independently accepted T-274A neutral `ticket_consensus`
   projection coordinate through Phase A's closed projector. T-281 owns the
   generic `project.read` request/refusal/result wrapper, projection-basis seal,
   and explicit absent non-terminal truth. The case remains a typed gap until
   its same-owner request-to-projection relation and central wrapped result land.
   It does not wait for T-275 handler truth.
7. Split the existing T-270/T-272 milestones: their neutral owner-native
   contract schemas precede P1; their public runtime integration follows P1
   and consumes neutral admitted projections rather than importing M04.
8. T-275 and the remaining semantic owners follow P1; P2 then atomically binds
   handlers, switches the public surface,
   deletes legacy truth, and hands the sole family to T-268 and T-276.

## Exit

1. Exactly 19 operation identities, 35 non-read variant keys, 27
   `project.read` case keys, and 62 total `DefinitionKey` members admit.
2. Every concrete variant fixes `workspaceBindingRequirement` to `forbidden`
   or `exactly_one`; no optional binding carrier exists.
3. Request, result, refusal, authority, effect, schema, SDK, CLI, and adapter
   coordinates are complete and uniquely derived from one definition family.
   Every definition and the nested family have canonical digest projections;
   raw schema objects and relation functions are never hashed directly.
4. Malformed definitions and malformed invocations fail before semantic work;
   malformed handler output fails before public outcome admission.
5. A non-Consensus `workspace.create(clean)` fixture proves the generic family.
6. No metadata-driven mega-handler, unchecked cast, second operation roster,
   or legacy compatibility surface exists.
7. P1 proof does not claim P2 handler or packed-release parity.

Phase A implementation was authorized by the independent review and F_H
decision recorded above. It is now implemented and independently accepted
at integration commits `df8c2956`, `5c0d22f0`, and `55bfeb10`. P1 and P2
implementation remain prohibited.

## Phase A Closure

The private native mechanism closes without publishing a definition, schema,
catalog row, SDK member, CLI coordinate, handler, or package export. One native
Valibot source owns TypeScript inference, strict admission, canonical schema
projection, and digest truth. Malformed outcome coordinates return typed
failure. Canonical I-JSON rejects normalized or hidden host state without
invoking accessors, and admitted nested state is recursively immutable even
under an already-frozen root.

The integration-tree proof is `8/8` focused tests plus strict host build and
type proof. The emitted declaration is `export {};`, the package subpath is not
exported, all 82 existing public schemas remain exact, and the legacy
publication manifest is deliberately unchanged. The known T-223 `59/63`
result consists only of the four derivative checks that require that forbidden
publication refresh. This closes Phase A only; P1 still requires an accepted
constructor-ready definition-family design and P2 still requires every
semantic owner plus atomic hard-break publication.

## Phase A Source-Resolution Reopen

The review at
`.ai-workspace/comments/codex/20260716T162446Z_REVIEW_t281_phase_a_source_resolution_rejection.md`
rejects the committed Phase A closure claim without rejecting its native
packet or projector mechanics. `defineNativeContract` accepted a caller schema
beside an independently authored locator, and named-check implementation
changes could retain witness truth when projected JSON Schema stayed equal.

The bounded repair replaces that pair with one opaque typed carrier minted by
the fixed-root `semantic_build` resolver. The resolver accepts a recursively
frozen typed owner-source row, walks own data properties, requires the compiled
member to be the exact same schema object, hashes the compiled owner module,
and binds the module/source basis into the witness without erasing `S`. Neutral M03
owner locators now terminate at their `schema` member, while authority and
identity remain sibling metadata. T-274A's nine-schema exit is unchanged; its
two Consensus read coordinates compose a T-281-owned generic wrapper and do
not close P1 by themselves. Phase A remained reopened until independent
re-review accepted this exact repair basis.

The repaired checkpoint proves `1767/1767` full semantic tests, `82/82` GTL
law tests, `70/70` T-223 source-blind publication tests, `8/8` focused Phase A
tests, `11/11` T-274A projector tests, and `9/9` neutral owner-contract tests.
Strict host/type builds, all 82 public schemas, all 40 publication assets, the
1143-file package census, 32 registered design files with 96 Mermaid diagrams,
the Prime gate, governance, and `git diff --check` pass. The package still
exports no Phase A public subpath. Independent re-review accepted the exact
`eeb286bcd74f5a38aa43317ce9065eaf9baf0366..c129ec385ad8bbda6d4d08c7505113c394050337`
repair span with no P0/P1 findings. The wording-only payload-count correction
is recorded in the self-review. Phase A is restored; P1 remains bounded by its
owner-contract and independent-review gates.

## Implementation-Readiness Repair

The accepted target shape remains one exact 19-operation definition family.
The prior design acceptance is superseded for implementation because its P1
contract was not native-authority ready:

1. `InvocationAuthority<K>`, `PublicInvocation<K>`, and `PublicOutcome<K>` do
   not yet have exact closed packets.
2. The proposed custom constructor algebra duplicated native typing,
   admission, schema projection, and reference logic. It is rejected in favor
   of one strict Valibot schema consumed by TypeScript inference, `v.parse`,
   and a pinned JSON-Schema projector.
3. Branded scalar/ref identity, default admission and canonical-digest
   semantics, and exact public contract-coordinate resolution must remain in
   that one native path.
4. Several result and `project.read` rows remain semantic prose rather than
   constructor-ready field graphs or stable contract refs.
5. P1's private candidate coexistence with frozen 4.6 migration input is not
   distinguished from P2's atomic public hard break.

The proportional repair is bounded: Phase A closes those native relations and
proves one non-exported schema-only `workspace.create(clean)` fixture before
P1 authors the exact family. T-274A may prove its case-specific result
coordinate in parallel, but it does not own the generic `project.read`
operation wrapper and therefore cannot close that definition by itself. No runtime or public
projection may proceed against the superseded implementation authorization.
The accepted repair closes only the private Phase A mechanism and common
packets.

## P1 Constructor Design Candidate

The current design defines P1 as an all-or-nothing private constructor pass:

```text
OperationMemberKey<I> =
  I extends "abg.operation.project.read"
    ? ProjectReadCase
    : ClosedVariantOf<I>

DefinitionKeyFor<I, M> =
  I extends "abg.operation.project.read"
    ? { operationId: I, memberKind: "project_read_case", caseKey: M }
    : { operationId: I, memberKind: "variant", variant: M }

PublicFunctionDefinitionFamily = {
  [I in PublicOperationIdentity]: {
    [M in OperationMemberKey<I>]:
      PublicFunctionDefinition<DefinitionKeyFor<I, M>>
  }
}

DefinitionKey = distributive values of the nested family relation

RequestSchemaOf<K> = exact owner-native request schema indexed by K
ResultSchemaOf<K> = exact owner-native result schema for non-read K;
  generic T-281 wrapper over the exact owner projection schema for project.read K
RefusalSchemaOf<K> = exact owner-native refusal schema indexed by K
NonterminalSchemaOf<K> = exact owner-native non-terminal schema indexed by K | null

RequestOf<K> = InferOutput<RequestSchemaOf<K>>
ResultOf<K> = InferOutput<ResultSchemaOf<K>>
RefusalOf<K> = InferOutput<RefusalSchemaOf<K>>
NonterminalOf<K> =
  NonterminalSchemaOf<K> extends infer S extends GenericSchema
    ? InferOutput<S>
    : never

P1ContractSlotCoordinate<K, Slot> = { definitionKey: K, slot: Slot }

P1ResolvedContractSlot<K, Slot, S extends GenericSchema> =
  owner_contract_slot_resolved<K, Slot, S,
    ownerAuthorityRef, ownerAuthorityDigest,
    acceptedContractShapeBasisRef, acceptedContractShapeBasisDigest>

P1MissingContractSlot<K, Slot> =
  semantic_not_realized<K, Slot, ownerAuthorityOrNull, ownerTicketOrNull,
    ownerDesignOrNull, evidenceRefs>

P1OwnerContractResolution<K> =
  owner_contract_resolved<K, ReqSlot, ResSlot, RefSlot, NonterminalSlotOrAbsent>
  | definition_family_input_gap<K, NonEmptyUnique<MissingSlotOrMetadataRow>>

P1ResolvedOwnerContractRow<K = DefinitionKey> =
  K distributes to owner_contract_resolved<K, ...>

P1DefinitionGapRow<K = DefinitionKey> =
  K distributes to definition_contract_gap<K, ...>
```

Every resolved definition also carries exact closed metadata for all eight
invocation-authority slots. The structural key, four contract-slot projections,
metadata, owner/relation witnesses, and explicit non-terminal absence form the
canonical definition-digest projection. The nested operation/member map of
definition digests forms the sole family-digest projection.

The closed constructor census is 19 public operation identities, 35
non-`project.read` variant keys, 27 `project.read` case keys, and 62 total
`DefinitionKey` members. Each of those 62 keys owns a separate Req/Res/Ref/N
resolution row. Grouping by `operationId` must still yield exactly 19 public
identities.

The nested operation-to-own-member family is the sole authoring source. The
flat `DefinitionKey` and resolved/gap row unions derive distributively from it;
they are readonly discriminated collections admitted by exact structural set
equality. No object-valued mapped key, flattened selector string, lookup
registry, or second roster is allowed. This preserves the operation/member and
outer-row/slot correlation in native TypeScript before the semantic exact-set
gate proves 35/27/62 coverage.

Each neutral owner source carries only its semantic-owner identity/basis,
locator, and exact schema. M03 and M05 do not receive, define, duplicate, or
import the M04 contract-shape basis. After exact source resolution, the M04 P1
join alone composes the independently accepted T-281 basis into a slot whose
literal request/result/refusal/non-terminal coordinate is preserved by its
type. For `project.read`, the owner supplies a projection schema and same-module
typed request-to-projection relation; central P1 constructs the generic result
wrapper and preserves both wrapper and projection-owner authority. The missing
member is typed build evidence and
terminates the current pass. It cannot become a definition, public refusal,
compatibility row, or prose-backed field. The private family admits only after
every exact operation/variant key resolves its request, result, refusal, and
explicit nullable non-terminal slot.

The constructability review found these named blocking owner relations:

- `p1_contract_workspace_not_realized`;
- `p1_contract_project_read_not_realized`, including the generic result wrapper,
  same-owner request-to-projection relation witnesses, and central composition;
  T-274A supplies one projection source, not the final wrapped result contract;
- `p1_contract_product_intake_not_realized` and
  `p1_contract_workspace_bind_not_realized`;
- `p1_contract_catalog_not_realized`;
- `p1_contract_run_invoke_not_realized`;
- `p1_contract_run_continue_not_realized` and
  `p1_contract_interaction_respond_not_realized`;
- `p1_contract_one_surface_owner_projection_not_realized`: the existing
  T-270/T-272 local neutral carrier is semantic schema evidence, but its
  bespoke envelope and `lawBasis` are not admitted as a second permanent
  owner-source constructor; the accepted neutral owner projection must
  conserve the same semantic basis, locator, and schema through the shared
  carrier before these slots resolve;
- `p1_contract_result_assess_not_realized`, `p1_contract_witness_not_realized`,
  `p1_contract_tuning_not_realized`, and
  `p1_contract_conformance_not_realized`;
- `p1_contract_materialize_not_realized`; and
- `p1_contract_release_not_realized`.

GOALS, T-270, and T-272 now record the required same-basis milestone split.
Their neutral owner-native contract milestones are P1 inputs, while their
public runtime integration remains downstream of P1. The satisfied ordering is:

```text
independently accepted T-274A compatible Consensus coordinate plus T-270/T-272 neutral owner-native contract milestones
  -> T-281 P1 exact private family
  -> T-270/T-272 public runtime integration milestones
```

The recorded pre-P1 neutral milestones do not depend on P1. This prerequisite
is satisfied without adding tickets, moving semantic ownership, or authorizing
runtime integration.

P1 introduces one private authoritative operation-definition source. Owner
payload schema authorities remain distinct; T-281 composes them and authors
none. T-281 adds no new semantic, public, handler, catalog, SDK, or CLI
authority. All P1 projections are temporary derived outputs. M03 is prohibited
from importing the private M04 family or projection path; T-270/T-272 consume
neutral admitted projections instead. This bounded design repair records the
One Surface owner-projection gap and does not migrate T-270/T-272 runtime code.

The `83de4ec5419c279ec09bd6e08bf3c67ef04a8b382b252947dccbe6b626e02a04`
native-authority-and-type-correlation-repaired P1 candidate is rejected. Its
Phase A packet generics still required a string key, carried duplicate
`operationKey` and `definitionKey` authority, and did not prove actual packet
APIs for both structural key branches.

The current structural-definition-key-repaired candidate uses one strict
`variant | project_read_case` structural schema, derives each exact literal key
schema/value witness from a nested-family value, and carries that exact value
through actual `InvocationAuthority`, `PublicInvocation`, `PublicOutcome`, and
typed failure admission. The general structural schema cannot instantiate a
packet generic, and a different exact schema/value pair fails at the type
boundary. `definitionKey` is the only packet key; `operationId` derives from
`definitionKey.operationId`. Admission parses the structural and exact schemas
and requires canonical structural equality with the schema's carried value.
The private string fixture is rejected at compile time and runtime; no
compatibility path remains. Actual workspace-create and
`project.read(ticket_consensus)` packet witnesses cover both success and exact
typed failure branches.

The earlier exact-basis review accepts only the structural-definition-key
candidate digest recorded above and authorized work within that boundary. It
does not accept the current central-join candidate. Executable project-read
relations and wrapped results, exact metadata, family admission, and the current
independent-review gate remain blockers. P2 remains fenced behind completed P1,
T-274B, T-275, and the remaining handler owners.

## P1 Non-Read Owner Input Checkpoint

Commit `d80cef8f` closes the exact 35 non-`project.read` definition keys and
all 115 of their schema-bearing slots. The owner-source census contains no
missing, extra, duplicate, or `semantic_not_realized` row. Ten lawful
nonterminal schemas remain distinct from the 25 non-read keys whose
nonterminal coordinate is explicitly absent at central-family admission.

The checkpoint does not admit the private P1 family. The remaining owner-input
boundary is the 27-case `project.read` relation: 54 structural request/refusal
sources plus 27 owner projection sources and their same-owner relations, with
T-274A supplying only the `ticket_consensus` projection source.
Central admission then must prove 196 exact schema slots plus 52 explicit
nonterminal absences across 62 structural definition keys. No public operation,
schema, catalog row, SDK member, CLI coordinate, handler, or compatibility
surface was added. The regenerated product toolchain manifest records changed
packaged private bytes; the 82 public schemas and 40 publication assets remain
exact.

## P1 Project Read Owner Design Acceptance

The exact design digest
`6f7a6d9a40d593d0ff687b8dc94af1cbca12213266ccd5715e7163595ad58019`
is independently reviewed and F_H accepted under the delegated release
authority. It closes the 27-case projection field graphs over ten Prime result
families while preserving concrete M03/M04/M05 semantic ownership and the
unchanged T-274A `ticket_consensus` projection schema. The later central-join
review supersedes only its assumption that a projection schema alone is the
final public result contract.

The accepted replay request has one `fromOrdinal + limit` grammar, replay rows
admit the existing `CanonicalRuntimeEvent`, observer drafts derive from
`ObserverObservables`, and catalog refusals remain case-indexed. The design
adds no handler, event, runtime path, public schema, operation, or requirement.

Implementation remains gated by the neutral structural owner-source helper.
Both native constructor entry points must reject a fake `project.read`
variant at compile time, while their runtime guards continue to reject
untyped or cast inputs. This code prerequisite does not reopen the accepted
project-read design and does not authorize the central P1 family before all
54 structural sources, 27 projection sources, 27 relation witnesses, 27 wrapped
result contracts, exact metadata rows, and canonical digests resolve.

## P1 Structural Owner Source Checkpoint

Commit `d4ce8abf` closes the neutral structural owner-source prerequisite. One
generic constructor preserves exact variant or `project_read_case` identity
through authority, contract/schema identity, locator, slot, and native schema.
The existing variant adapter remains a derived path and propagates the same
non-project-read type exclusion through its only open generic M03 wrapper.

Literal fake `project.read` variants fail TypeScript compilation through both
entry points. Broad, untyped, and cast inputs remain runtime fail-closed.
Mixed variant/case keys and locator case/slot mismatches also refuse before a
source carrier exists. No roster, brand, cast, M04 dependency, public output,
or runtime behavior was added.

This checkpoint authorizes implementation of the structural owner sources.
It does not admit the central private P1 family or cross the P2 hard break.

## P1 Project Read Request/Refusal And Registry Design Checkpoint

Commit `6e280bb8` closes the 27 project-read request/refusal pairs as 54 exact
owner sources. The canonical T-281 gate now includes their native negative
type fixture and runtime admission tests. Empty selectors are nominal,
replay selectors use `fromOrdinal + limit`, and the public inventory remains
82 schemas and 40 assets.

Independent review also accepts design digest
`4a43048c7173d60a36de2eb912b7caa86d4f5ad681641db4974f9a9492391bb7`
at commit `f6ee8180`. Schema families with relational checks must supply an
explicit same-module registry coordinate. One resolver-minted opaque carrier
binds schema and registry to the same module/digest basis; callers cannot
select a registry when defining a contract.

The next project-read boundary was 27 projection owner sources. Central P1
admission remained blocked until those sources, their same-owner relations, and
the final wrapped result contracts were exact.
No runtime integration or P2 publication is authorized by this checkpoint.

## P1 Project Read Projection-Source Checkpoint

Commit `86193832` closes all 27 raw semantic-owner projection sources. It does
not close 27 public result contracts. The implementation checkpoint stores each
raw owner projection at the result coordinate while the actual admitted value
is the T-281 wrapper
`{ kind, caseKey, projectionBasis, projection }`. A raw projection schema admits
the nested `projection` field but cannot admit the wrapper and cannot prove its
relation to the admitted request. The checkpoint is therefore retained as
useful owner input, not relabeled as P1 result-slot closure.

## P1 Central Join Design Repair Candidate

The repaired M04 design closes the smallest boundary exposed by the projection
checkpoint:

1. `ResultContractBindingOf<K>` is schema-only for ordinary results and retains
   a mandatory opaque same-owner relation for `project.read`. Indexed outcome
   admission receives the full admitted invocation and executes that relation
   before result truth.
2. The relation witness hashes its identity, structural key, owner basis,
   module/export/member coordinate, module digest, and member identity. It does
   not hash a function or substitute a digest for relation execution.
3. One exact 19-row private metadata basis supplies full semantic-authority
   refs and accepted source digests plus closed authority/effect/event literals
   through `K.operationId`.
   The already-designed eight authority-slot requirements remain separately
   exact and selector-indexed where required.
4. Central M04 alone adds the result wrapper, projection-basis seal, accepted
   contract-shape basis, and canonical definition/family digests. The exact
   census remains 19 operations, 62 keys, 196 final schemas, and 52 explicit
   non-terminal absences; P2 remains fenced.

The amendment changes design and ticket truth only. It adds no runtime path,
handler, public asset, package export, operation identity, compatibility
surface, or P2 work. Two independent constructability reviews accepted the
exact semantic candidate digest recorded above. P1 implementation is
authorized; partial-family admission and P2 remain fenced.
