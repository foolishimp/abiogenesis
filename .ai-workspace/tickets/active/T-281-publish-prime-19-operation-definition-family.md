# T-281 - Publish Prime 19-Operation Definition Family

- id: T-281
- title: Publish the Prime ABIogenesis 5.0 public-operation definition family
- type: feature
- ticket_category: implementation_migration
- status: active
- phase_status: phase_a_closed_p1_authority_truth_repair_candidate_complete
- review_status: phase_a_accepted_p1_truth_repaired_pending_independent_review
- proof_status: phase_a_accepted_p1_truth_repaired_candidate_design_mermaid_prime_and_governance_checks_passed_owner_schema_gaps_explicit_p2_fenced
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-2 public-operation prerequisite P1
- change_intent: >-
    Replace the superseded public-operation rosters with one closed
    PublicFunctionDefinition<K> family for the exact ratified 19 ABIogenesis
    5.0 operations and variants, deriving typed contract, schema, catalog,
    SDK, and CLI projections while preserving operation-specific semantic
    handler ownership for the later P2 binding milestone.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design public contract and operation
    projection boundary
- triaged_at: 2026-07-16
- created_at: 2026-07-16
- updated_at: 2026-07-17
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-278
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: replace
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/app/m04/public_contracts/
    operations.ts
- dependencies:
  - ratified T-278 Ontology projection digest bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615; rebind from accepted-design basis 039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1 changes only the GOALS source-digest row and carries no semantic-target delta
  - accepted GOAL-035 P1 public-operation prerequisite
  - REQ-P-PUBLIC-CONTRACTS-008 through 010
  - completed T-277 Prime contraction law
- downstream_dependencies:
  - T-274A must prove the Phase-A-compatible neutral ticket_consensus result coordinate; T-281 owns the generic project.read request/refusal wrapper and absent nonterminal truth
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
- p1_design_basis_reconciliation_ref: >-
    .ai-workspace/comments/codex/
    20260717T000500Z_RECONCILIATION_t281_p1_exact_design_basis.md
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
6. T-274A proves whether the existing native `ticket_consensus` result schema
   can yield a neutral coordinate through Phase A's closed projector. T-281
   owns the generic `project.read` request/refusal wrapper and explicit absent
   non-terminal truth. The case remains a typed gap until both relations land.
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
tests, `7/7` T-274A projector tests, and `9/9` neutral owner-contract tests.
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
DefinitionKey =
  { operationId: NonProjectReadOperationIdentity,
    memberKind: "variant", variant: ClosedVariantOf<operationId> }
  | { operationId: "abg.operation.project.read",
      memberKind: "project_read_case", caseKey: ProjectReadCase }

P1ContractSlotResolution<K, S> =
  owner_contract_slot_resolved<K, S, ownerAuthorityRef, ownerAuthorityDigest>
  | semantic_not_realized<K, slot, ownerAuthorityOrNull, ownerTicketOrNull,
      ownerDesignOrNull, evidenceRefs>

P1OwnerContractResolution<K> =
  owner_contract_resolved<K, ReqSlot, ResSlot, RefSlot, NonterminalSlotOrAbsent>
  | definition_contract_gap<K, NonEmptyUnique<MissingSlotRow>>
```

The closed constructor census is 19 public operation identities, 35
non-`project.read` variant keys, 27 `project.read` case keys, and 62 total
`DefinitionKey` members. Each of those 62 keys owns a separate Req/Res/Ref/N
resolution row. Grouping by `operationId` must still yield exactly 19 public
identities.

Each slot preserves its own semantic owner authority and evidence. A
`project.read` wrapper and its case-specific result rows therefore need not
pretend to share one owner. The missing member is typed build evidence and
terminates the current pass. It cannot become a definition, public refusal,
compatibility row, or prose-backed field. The private family admits only after
every exact operation/variant key resolves its request, result, refusal, and
explicit nullable non-terminal slot.

The constructability review found these named blocking owner relations:

- `p1_contract_workspace_not_realized`;
- `p1_contract_project_read_not_realized`, including the generic wrapper and
  every case-specific result; T-274A supplies only the compatible
  `ticket_consensus` result coordinate;
- `p1_contract_product_intake_not_realized` and
  `p1_contract_workspace_bind_not_realized`;
- `p1_contract_catalog_not_realized`;
- `p1_contract_run_invoke_not_realized`;
- `p1_contract_run_continue_not_realized` and
  `p1_contract_interaction_respond_not_realized`;
- `p1_contract_result_assess_not_realized`, `p1_contract_witness_not_realized`,
  `p1_contract_tuning_not_realized`, and
  `p1_contract_conformance_not_realized`;
- `p1_contract_materialize_not_realized`; and
- `p1_contract_release_not_realized`.

GOALS, T-270, and T-272 now record the required same-basis milestone split.
Their neutral owner-native contract milestones are P1 inputs, while their
public runtime integration remains downstream of P1. The satisfied ordering is:

```text
T-274A compatible Consensus coordinate plus T-270/T-272 neutral owner-native contract milestones
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
neutral admitted projections instead.

The P1 candidate remains pending independent review. Its owner-schema gaps are
implementation blockers and must close before the all-or-nothing private
family can admit; the already-recorded milestone split is not a blocker. P2
remains fenced behind completed P1, T-274B, T-275, and the remaining handler
owners.
