# MAP: T-287 Wave 2 C0 Owner, Dependency, And Deletion Join

**Frozen:** 2026-08-12 13:48 AEST
**Classification:** read-only construction evidence; not Product, requirement, design, or implementation authority
**Repository:** `abiogenesis-5-root-build`
**Branch / HEAD:** `codex/t287-wave1` / `dd935a1cd14a85c0a4871281def8af5e4d074019`

## Product Frame

Wave 2 realizes `A5-F01`, `A5-F09`, `A5-F05`, and `A5-F06` as:

```text
admit common envelope
  -> select exact { operationId, memberKey } definition
  -> call its actual concrete owner port once
  -> structurally project its indexed outcome
```

Product owns deterministic Product relations. Validator owns whole-Program
judgment. ABG owns admitted runtime truth and Event Calculus reconstruction.
Public owns no semantic switch, owner context, catalog, event interpretation,
or run/read truth.

## Frozen Inputs

- accepted census blob: `efe88cac85bd3bb071d4b5dd451dfadaec893c4f`;
- accepted Gate 1 commit/tree: `3f80ba2393a9dbe31e8379a3dbbde00a961b8e23` / `04906b1c29c5d66163c62d1fffcb8bc069096244`;
- accepted Wave 1 artifact: `sha256:ab6dd512678b873d1ef4f4a07c8286ff3621ea86b39627e6061652110238c878`;
- accepted Wave 1 interface receipt: `/private/tmp/abi5-wave1-freeze.yIRMJu/wave1-interface-receipt-v2.json`;
- Wave 1 receipt semantic digest: `sha256:c8c26047d36b930a820559d276daa17a51c4589605767463a51be2eb2eba0d7d`;
- exact family set digest: `sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f`.

The Wave 1 receipt freezes only `./gtl`, `./product`, `./hog`, and `./abg`.
It explicitly excludes `./public`, the legacy 11/19 carrier,
`definitionKey === operationId`, the synthetic definition digest, and the
incomplete continuation/response allowlist.

## Join Legend

Every row below has one intrinsic identity:

```text
K = { operationId, memberKey }
definitionDigest = sha256(RFC8785(IntrinsicDefinitionDigestProjection<K>))
```

The intrinsic preimage comes only from its owner packet: definition version,
four slot-contract coordinates, actual owner-port coordinate, semantic
authority identity/digest, authority/effect/event classes, actor and workspace
requirements, capability refs, defaults, closed domains, schema/SDK/CLI
coordinates, and exit map. Host function identity is excluded. The live
`hash({operationId,schemaVersion})` formula is not an input.

Abbreviations:

- `P`, `A`, `G`, `H`: accepted Wave 1 `./product`, `./abg`, `./gtl`, and
  `./hog` interfaces respectively.
- `S01..S15`: strict owner request/result/refusal/non-terminal schemas inferred
  from the named owner packet in the corresponding D01..D15 target module.
  Runtime admission later uses pinned `valibot@1.4.2`; JSON Schema generation
  later uses build-only `@valibot/to-json-schema@1.7.1`; Ajv is proof-only.
- `G56`: projection to the one intrinsic family, common indexed invocation and
  outcome, JSON Schema, SDK, CLI grammar, Codex sibling grammar, PFC-F07,
  Product PFC-F08, manifest/catalog rows, and documentation. No projection may
  own a roster.
- `X-A`: no selected legacy row exists; add only behind the atomic swap.
- `X-R`: delete a differently named legacy row/handler.
- `X-L`: replace a same-spelling legacy variant without alias or fallback.
- `X-P`: delete the generic Public read branches and replace them with the
  exact owner projector.
- `MISSING`: the exact owner packet/port implementation is absent; the Product
  meaning and owner are already fixed.

## Exact 56-Row Join

### D01 - Product workspace

| # | Exact K | Concrete owner port and live callable basis | W1 / carrier / dependency closure | Projection / deletion |
|---:|---|---|---|---|
| 1 | `workspace.create/clean` | Product `WorkspaceOperationPort.create`; `MISSING`; exact clean-target filesystem function is absent | `P`; `S01 WorkspaceCreatePacket<clean>` in new `product/workspace_operations.ts`; `node:fs` mechanics plus shared canonical/digest/reference helpers | `G56`; `X-A` |
| 2 | `workspace.create/imported` | Product `WorkspaceOperationPort.create`; `MISSING`; exact imported-target preservation function is absent | `P`; `S01 WorkspaceCreatePacket<imported>`; same D01 closure | `G56`; `X-A` |
| 3 | `workspace.open/open` | Product `WorkspaceOperationPort.open`; `MISSING`; reuse `constructWorkspaceAuthorityBasis` and workspace/binding validators, but exact open/readiness function is absent | `P`; `S01 WorkspaceOpenPacket`; filesystem read plus `product/environment.ts` and exact-match/shared helpers; eventless | `G56`; `X-A` |

### D02/D03 - exact Product and ABG reads

All 24 ports are absent as exact callables. Product ports consume immutable
Product values. ABG ports consume one explicit validated prefix and one Event
Calculus/replay result; they never refold raw events independently.

| # | Exact K | Concrete owner port and live callable basis | W1 / carrier / dependency closure | Projection / deletion |
|---:|---|---|---|---|
| 4 | `project.read/catalog_list` | Product `CatalogProjectionPort.list`; `MISSING`; reuse `graphFunctionCatalogCanonicalSnapshot` | `P`; `S02 ProjectReadPacket<catalog_list>` in new `product/project_read_ports.ts`; `product/catalog.ts` | `G56`; `X-P` |
| 5 | `project.read/catalog_describe` | Product `CatalogProjectionPort.describe`; `MISSING`; reuse typed `lookupGraphFunction` / `lookupGraphFunctionDefinition` exact/absent/ambiguous result | `P`; `S02 ProjectReadPacket<catalog_describe>`; `product/catalog.ts`, `product/exact_match.ts` | `G56`; `X-P` |
| 6 | `project.read/workspace_status` | Product `WorkspaceProjectionPort.status`; `MISSING`; reuse workspace authority/binding validators and ABG-projected admitted binding when required | `P+A`; `S02 ProjectReadPacket<workspace_status>`; `product/environment.ts`, `abg/environment_admission.ts` | `G56`; `X-P` |
| 7 | `project.read/run_status` | ABG `RunProjectionPort.run_status`; `MISSING`; reuse `deriveRuntimeEventCalculusProjection`, `holdsAt`, `projectRunQuiescence` | `A`; `S03 ProjectReadPacket<run_status>` in new `abg/project_read_ports.ts`; event prefix/calculus/replay | `G56`; `X-P` |
| 8 | `project.read/graph_call_status` | ABG `GraphCallProjectionPort.graph_call_status`; `MISSING`; reuse scoped `replayValidatedRuntimeEventPrefix` state | `A`; `S03 ProjectReadPacket<graph_call_status>`; event prefix/calculus/replay | `G56`; `X-P` |
| 9 | `project.read/run_result` | ABG `RunProjectionPort.run_result`; `MISSING`; reuse replay closure/result plus Product `projectInstalledPublicResult` only for Product-owned result projection | `A+P`; `S03 ProjectReadPacket<run_result>`; replay, C-call result, Product semantics | `G56`; `X-P` |
| 10 | `project.read/graph_call_result` | ABG `GraphCallProjectionPort.graph_call_result`; `MISSING`; reuse `projectAdmittedCCallOutcomeAtPrefix` / `projectAdmittedCCallResultAtPrefix` | `A`; `S03 ProjectReadPacket<graph_call_result>`; C-call and replay | `G56`; `X-P` |
| 11 | `project.read/run_evidence` | ABG `RunProjectionPort.run_evidence`; `MISSING`; reuse scoped replay/event causal projections | `A`; `S03 ProjectReadPacket<run_evidence>`; calculus/replay | `G56`; `X-P` |
| 12 | `project.read/graph_call_evidence` | ABG `GraphCallProjectionPort.graph_call_evidence`; `MISSING`; reuse scoped replay and C-call evidence rows | `A`; `S03 ProjectReadPacket<graph_call_evidence>`; C-call/calculus/replay | `G56`; `X-P` |
| 13 | `project.read/result_evidence` | ABG `ResultProjectionPort.evidence`; `MISSING`; reuse admitted C-call result/evidence projection | `A`; `S03 ProjectReadPacket<result_evidence>`; C-call/calculus/replay | `G56`; `X-P` |
| 14 | `project.read/assessment_evidence` | ABG `AssessmentProjectionPort.evidence`; `MISSING`; consumes future D11 admitted assessment plus replay | `A`; `S03 ProjectReadPacket<assessment_evidence>`; D11 and calculus/replay | `G56`; `X-P` |
| 15 | `project.read/witness_evidence` | ABG `WitnessProjectionPort.evidence`; `MISSING`; consumes future D12 admitted witness plus replay | `A`; `S03 ProjectReadPacket<witness_evidence>`; D12 and calculus/replay | `G56`; `X-P` |
| 16 | `project.read/install_evidence` | Product `InstallProjectionPort.evidence`; `MISSING`; reuse `projectExactPrefixArtifactTruth` and admitted ProductInstall projectors | `P+A`; `S02 ProjectReadPacket<install_evidence>`; Product install plus artifact truth | `G56`; `X-P` |
| 17 | `project.read/release_evidence` | release/Product `ReleaseProjectionPort.evidence`; `MISSING`; consumes D15 refusal/result carrier; no release success exists in Wave 2 | `P`; `S02 ProjectReadPacket<release_evidence>`; D15 only | `G56`; `X-P` |
| 18 | `project.read/workspace_replay` | ABG `WorkspaceProjectionPort.workspace_replay`; `MISSING`; reuse validated-prefix replay scoped to workspace | `A`; `S03 ProjectReadPacket<workspace_replay>`; prefix/calculus/replay | `G56`; `X-P` |
| 19 | `project.read/run_replay` | ABG `RunProjectionPort.run_replay`; `MISSING`; reuse `projectRunSemanticReplayProjection` | `A`; `S03 ProjectReadPacket<run_replay>`; prefix/calculus/replay | `G56`; `X-P` |
| 20 | `project.read/graph_call_replay` | ABG `GraphCallProjectionPort.graph_call_replay`; `MISSING`; reuse scoped replay GraphCall/CCall states | `A`; `S03 ProjectReadPacket<graph_call_replay>`; prefix/calculus/replay | `G56`; `X-P` |
| 21 | `project.read/interaction_replay` | ABG `InteractionProjectionPort.replay`; `MISSING`; reuse `projectFhContinuations` and scoped replay | `A`; `S03 ProjectReadPacket<interaction_replay>`; continuation/calculus/replay | `G56`; `X-P` |
| 22 | `project.read/continuation_replay` | ABG `ContinuationProjectionPort.replay`; `MISSING`; reuse `rehydrateFhContinuationAtPrefix` / `projectFhContinuations` | `A`; `S03 ProjectReadPacket<continuation_replay>`; continuation/calculus/replay | `G56`; `X-P` |
| 23 | `project.read/c_call_replay` | ABG `CCallProjectionPort.replay`; `MISSING`; reuse `projectAdmittedCCallOutcomeAtPrefix` and replay CCall state | `A`; `S03 ProjectReadPacket<c_call_replay>`; C-call/calculus/replay | `G56`; `X-P` |
| 24 | `project.read/workspace_gaps` | ABG `WorkspaceProjectionPort.workspace_gaps`; `MISSING`; derive only from admitted gap/next-action truth in scoped replay | `A`; `S03 ProjectReadPacket<workspace_gaps>`; calculus/replay/route truth | `G56`; `X-P` |
| 25 | `project.read/run_gaps` | ABG `RunProjectionPort.run_gaps`; `MISSING`; derive only from admitted gap/next-action truth in scoped replay | `A`; `S03 ProjectReadPacket<run_gaps>`; calculus/replay/route truth | `G56`; `X-P` |
| 26 | `project.read/run_lawful_actions` | ABG `RunProjectionPort.run_lawful_actions`; `MISSING`; project admitted `NextActionProjection`, never call `evaluateNext` | `A`; `S03 ProjectReadPacket<run_lawful_actions>`; traversal-route/calculus/replay | `G56`; `X-P` |
| 27 | `project.read/ticket_consensus` | Product `ConsensusProjectionPort.ticketConsensus`; `MISSING`; reuse GTL `projectTicketConsensus` through Product-owned semantics | `G+P`; `S02 ProjectReadPacket<ticket_consensus>`; `gtl/consensus.ts`, Product semantics | `G56`; `X-P` |

### D04-D07 - Product verification, environment, installation, and catalog

| # | Exact K | Concrete owner port and live callable basis | W1 / carrier / dependency closure | Projection / deletion |
|---:|---|---|---|---|
| 28 | `product.verify/verify` | Product `ProductVerificationPort.verify`; wrapper `MISSING`; reuse `verifyProduct` and complete `VerifiedProductArtifact` | `P`; `S04 ProductVerifyPacket` in new `product/verification_operation.ts`; verify/native declaration/publication/shared | `G56`; delete legacy `artifact` handler (`X-R`) |
| 29 | `product.resolve/resolve` | Product `ProductEnvironmentPort.resolve`; wrapper `MISSING`; reuse `verifyProduct`, `isVerifiedProductArtifact`, `constructResolvedProductLock` | `P`; `S05 ProductResolvePacket` in new `product/environment_operations.ts`; verify/environment/exact-match/shared | `G56`; delete `verified_product_set` handler (`X-R`) |
| 30 | `product.install/install` | Product `ProductInstallPort.install`; wrapper `MISSING`; reuse `installProduct` then ABG `admitProductInstall` at expected prefix | `P+A`; `S06 ProductInstallPacket` in new `product/install_operation.ts`; D04/D05, install, artifact truth, store/calculus | `G56`; delete `verified_artifact` handler (`X-R`); replace legacy definition predicates |
| 31 | `workspace.bind/bind` | Product `ProductEnvironmentPort.bindWorkspace`; wrapper `MISSING`; reuse admitted install projection, `constructProductSet`, `constructWorkspaceAuthorityBasis`, `constructWorkspaceBinding`, `admitWorkspaceBinding` | `P+A`; `S05 WorkspaceBindPacket`; environment/artifact truth/store/calculus | `G56`; delete `exact_product_set` handler (`X-R`); replace legacy definition predicates |
| 32 | `catalog.admit/admit` | Product `CatalogOperationPort.admit`; wrapper `MISSING`; reuse Validator publication/Program validation and `admitGraphFunctionCatalog`; current law is pure/eventless | `P+G`; `S07 CatalogAdmitPacket` in new `product/catalog_operations.ts`; D05/D06, catalog, Validator, exact match/shared | `G56`; delete `module_publication` handler (`X-R`); delete all catalog events/fluents/brands |
| 33 | `catalog.view/allowlist` | Product `CatalogOperationPort.constructView`; wrapper `MISSING`; reuse `narrowGraphFunctionCatalog` | `P`; `S07 CatalogViewPacket`; catalog/exact-match/shared; eventless | `G56`; replace legacy branch (`X-L`); delete view admission/event lifecycle |
| 34 | `catalog.apply/node_type` | Product `CatalogOperationPort.apply`; wrapper `MISSING`; reuse `applyCatalogDeclaration` after exact definition lookup | `P`; `S07 CatalogApplyPacket<node_type>`; catalog/publication/shared; eventless, invocation revalidates use | `G56`; replace legacy branch (`X-L`); delete application brands/events |
| 35 | `catalog.apply/overlay` | Product `CatalogOperationPort.apply`; wrapper `MISSING`; reuse `applyCatalogDeclaration` after exact definition lookup | `P`; `S07 CatalogApplyPacket<overlay>`; catalog/publication/shared; eventless, invocation revalidates use | `G56`; replace legacy branch (`X-L`); delete application brands/events |

### D08-D12 - invocation, continuation, interaction, assessment, and witness

| # | Exact K | Concrete owner port and live callable basis | W1 / carrier / dependency closure | Projection / deletion |
|---:|---|---|---|---|
| 36 | `run.invoke/invoke` | Product/ABG `RunInvocationPort.invoke`; wrapper `MISSING`; reuse exact catalog lookup, `constructDirectInvocation`, `admitInvocation`, implementation-set resolution, GTL materialization/validation, `executeGraphTraversal` | `P+A+G+H`; `S08 RunInvokePacket<invoke>` in new `product/run_invocation_operation.ts`; D07, Validator, HoG, ABG store/calculus/replay/closure | `G56`; delete legacy `direct` handler (`X-R`); replace identity in `invocation_execution_truth.ts` |
| 37 | `run.invoke/start` | Product/ABG `RunInvocationPort.start`; wrapper `MISSING`; reuse `resolveProgramStart`, `constructStartInvocation`, then the same admitted execution chain | `P+A+G+H`; `S08 RunInvokePacket<start>`; same D08 closure | `G56`; replace legacy branch (`X-L`); replace identity in `invocation_execution_truth.ts` |
| 38 | `run.continue/current_intent` | Product/ABG `RunContinuationPort.current_intent`; wrapper `MISSING`; reuse exact-prefix continuation rehydration, prepare/commit response-resume relations, HoG continuation | `P+A+G+H`; `S09 RunContinuePacket<current_intent>` in new `product/run_continuation_operation.ts`; continuation/store/calculus/replay/HoG | `G56`; replace legacy branch (`X-L`); replace allowlist/identity in `continuation.ts` and `fh_continuation_projection.ts` |
| 39 | `run.continue/selected_action` | Product/ABG `RunContinuationPort.selected_action`; exact port `MISSING`; existing ABG `ConstructionIntent` rehydration is reusable, but this path must consume `evaluateNext -> admitConstructionIntent -> invokeGraphFunction`, not current-intent resume | `P+A+G+H`; `S09 RunContinuePacket<selected_action>`; next-action/intent/traversal-route plus D08 | `G56`; `X-A`; expand, do not conflate, ABG continuation gates |
| 40 | `interaction.respond/select` | Product/ABG `InteractionResponsePort.respond`; exact variant `MISSING`; reuse pending-interaction semantic basis plus Product response evaluation and ABG expected-prefix response admission | `P+A`; `S10 InteractionRespondPacket<select>` in new `product/interaction_response_operation.ts`; continuation/Product semantics/store/calculus | `G56`; `X-A`; expand ABG response allowlist |
| 41 | `interaction.respond/approve` | Product/ABG `InteractionResponsePort.respond`; wrapper `MISSING`; reuse `evaluateInstalledInteractionResponse`, `prepareFhInteractionResponse`, `commitFhInteractionResponseAtExpectedPrefix` | `P+A`; `S10 InteractionRespondPacket<approve>`; continuation/Product semantics/store/calculus | `G56`; replace legacy branch (`X-L`); replace allowlist/identity predicates |
| 42 | `interaction.respond/reject` | Product/ABG `InteractionResponsePort.respond`; exact variant `MISSING`; same pending-interaction owner chain, with declared reject contract | `P+A`; `S10 InteractionRespondPacket<reject>`; continuation/Product semantics/store/calculus | `G56`; `X-A`; expand ABG response allowlist |
| 43 | `interaction.respond/assess` | Product/ABG `InteractionResponsePort.respond`; exact variant `MISSING`; same pending-interaction owner chain, with declared assessment response contract | `P+A`; `S10 InteractionRespondPacket<assess>`; continuation/Product semantics/store/calculus | `G56`; `X-A`; expand ABG response allowlist |
| 44 | `interaction.respond/answer_escalation` | Product/ABG `InteractionResponsePort.respond`; wrapper `MISSING`; reuse installed Product response evaluation and ABG expected-prefix response admission | `P+A`; `S10 InteractionRespondPacket<answer_escalation>`; continuation/Product semantics/store/calculus | `G56`; replace legacy branch (`X-L`); replace allowlist/identity predicates |
| 45 | `result.assess/assess` | Product/ABG `ResultAssessmentPort.assess`; `MISSING`; consume accepted HoG contract-admitted F_P candidate, exact result/evidence basis, Product assessment contract, then ABG result/judgment admission | `H+P+A`; `S11 ResultAssessPacket` in new `product/result_assessment_operation.ts`; F04 carrier, C-call result/judgment/store/calculus/replay | `G56`; `X-A` |
| 46 | `witness.admit/reprice` | ABG `WitnessAdmissionPort.admit`; `MISSING`; exact actor/subject/reason/evidence admission over expected prefix | `A`; `S12 WitnessAdmitPacket<reprice>` in new `abg/witness_admission_operation.ts`; store/calculus/replay | `G56`; `X-A` |
| 47 | `witness.admit/attest` | ABG `WitnessAdmissionPort.admit`; `MISSING`; same owner with `attest` contract | `A`; `S12 WitnessAdmitPacket<attest>`; store/calculus/replay | `G56`; `X-A` |
| 48 | `witness.admit/hygiene-stamp` | ABG `WitnessAdmissionPort.admit`; `MISSING`; same owner with `hygiene-stamp` contract | `A`; `S12 WitnessAdmitPacket<hygiene-stamp>`; store/calculus/replay | `G56`; `X-A` |
| 49 | `witness.admit/intake` | ABG `WitnessAdmissionPort.admit`; `MISSING`; same owner with `intake` contract | `A`; `S12 WitnessAdmitPacket<intake>`; store/calculus/replay | `G56`; `X-A` |
| 50 | `witness.admit/run-resumed` | ABG `WitnessAdmissionPort.admit`; `MISSING`; attest existing admitted run-resume truth, never manufacture lifecycle | `A`; `S12 WitnessAdmitPacket<run-resumed>`; store/calculus/replay | `G56`; `X-A` |
| 51 | `witness.admit/run-stopped` | ABG `WitnessAdmissionPort.admit`; `MISSING`; attest existing admitted run-stop truth, never manufacture lifecycle | `A`; `S12 WitnessAdmitPacket<run-stopped>`; store/calculus/replay | `G56`; `X-A` |

### D13-D15 - Validator, Product materialization, and release

| # | Exact K | Concrete owner port and live callable basis | W1 / carrier / dependency closure | Projection / deletion |
|---:|---|---|---|---|
| 52 | `conformance.evaluate/gtl_program` | Validator `ConformancePort.evaluateGtlProgram`; wrapper `MISSING`; reuse `rawAdmitValue`, `validateProgram`, graph/C/implementation validation; no execution or repair | `G`; `S13 ConformanceEvaluatePacket` in new `validator/conformance_operation.ts`; Validator/GTL/shared | `G56`; `X-A` |
| 53 | `product.materialize/context_bootstrap` | Product `ProductMaterializationPort.context_bootstrap`; `MISSING`; exact filesystem/bootstrap manifest function absent | `P+A`; `S14 ProductMaterializePacket<context_bootstrap>` in new `product/materialization_operations.ts`; workspace/binding, filesystem, artifact/provenance admission where required | `G56`; `X-A` |
| 54 | `product.materialize/configuration` | Product `ProductMaterializationPort.configuration`; `MISSING`; exact configuration validation/materialization function absent | `P+A`; `S14 ProductMaterializePacket<configuration>`; workspace/binding, filesystem, artifact/provenance admission where required | `G56`; `X-A` |
| 55 | `release.snapshot/published_rc` | release owner `ReleaseSnapshotPort.published_rc`; `MISSING`; Wave 2 implementation must be callable and return exact qualification/basis refusal only | no W1 mutation; `S15 ReleaseSnapshotPacket<published_rc>` in new `product/release_snapshot_operations.ts`; closed qualification/refusal/shared helpers only | `G56`; `X-A`; no success/event before Wave 5 |
| 56 | `release.snapshot/tapped_release` | release owner `ReleaseSnapshotPort.tapped_release`; `MISSING`; Wave 2 implementation must be callable and return exact qualification/basis refusal only | no W1 mutation; `S15 ReleaseSnapshotPacket<tapped_release>`; closed qualification/refusal/shared helpers only | `G56`; `X-A`; no success/event before Wave 5 |

## Durable Definition Reconciliation

The current event-store/prefix/envelope mechanics remain frozen. The following
predicate/carrier loci are Wave 2 replacement surfaces because they enforce the
legacy identity or incomplete variant set:

| Locus | Current contradiction | C1-C4 replacement obligation |
|---|---|---|
| `abg/environment_admission.ts` | computes `hash({operationId,schemaVersion})` and requires `definitionKey === operationId` | accept and preserve exact `{operationId,memberKey,definitionDigest}` from the selected intrinsic definition |
| `abg/artifact_truth.ts` | rechecks the same synthetic identity while projecting artifact truth | project and collision-check the exact structured definition coordinate without reminting it |
| `abg/invocation_execution_truth.ts` | treats operation identity as definition key/digest preimage | match the exact admitted definition coordinate and intrinsic digest |
| `abg/fh_continuation_projection.ts` | hard-codes only `approve`, `answer_escalation`, `current_intent` and synthetic identity | consume the selected D09/D10 coordinate and complete closed variant domain |
| `abg/continuation.ts` | hard-codes the same three variants | distinguish `current_intent` resume from `selected_action` intent/invocation and admit the exact coordinate |

`current_intent` resumes the admitted current intent. `selected_action` consumes
one already admitted `NextActionProjection` and `ConstructionIntent` on the
fixed chain `evaluateNext -> admitConstructionIntent -> invokeGraphFunction`.
Caller and Public select neither action nor topology.

## Global Atomic Deletion/Projection Join

The row-level `X-*` entries close only when the same atomic cut:

- deletes or wholesale replaces `public/contracts.ts`,
  `public/operations.ts`, `public/schema.ts`, `public/outcome.ts`, and
  `public/child_traversal_port.ts`;
- deletes `contracts/schemas/public-operation.schema.json` and regenerates the
  exact family schemas;
- rewrites `public/index.ts`, `public/cli.ts`, and `public/codex_cli.ts` as
  projections of the one family;
- rewrites `scripts/generate-product-manifest.mjs` to consume PFC-F07/PFC-F08
  rather than author a roster;
- removes legacy R10 transcript/outcome/event/governor projections and
  regenerates scenario evidence against the exact family;
- rewrites the directly coupled support/tests named in the accepted census;
  and
- leaves zero reachable `RootPublicInvocation`,
  `ROOT_PUBLIC_OPERATION_DEFINITIONS`, `legacyRequest`,
  `indexedRequest ?? legacyRequest`, alias, fallback, or Public semantic
  switch.

The deleted `product/root_operation_state.ts` remains deleted. No replacement
registry, WeakMap, remembered prefix, duplicate-invocation Set, or process-local
read/run authority is permitted.

## Exact-Set And Meaning Disposition

Mechanical reconstruction of the canonical newline-terminated, code-unit
sorted `operationId#memberKey` set produced:

```text
operation count: 18
definition count: 56
distinct composite keys: 56
SHA-256: 61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f
accepted digest equality: PASS
```

Missing constitutional owner meaning: **none**. All 56 definitions have fixed
Product/requirement meaning and one concrete Product, ABG, Validator, or
release owner. Missing implementation is explicit above and does not authorize
Public or a fixture to invent meaning. C0 disposition: **constructable**.

## First C1 Vertical Chain

The first unexported owner chain uses current lower callables directly:

```text
WorkspaceOperationPort.create/open
  -> ProductVerificationPort.verify -> verifyProduct
  -> ProductEnvironmentPort.resolve -> constructResolvedProductLock
  -> ProductInstallPort.install -> installProduct
       -> admitProductInstall(expected prefix)
  -> ProductEnvironmentPort.bindWorkspace
       -> project admitted installs
       -> constructProductSet
       -> constructWorkspaceAuthorityBasis
       -> constructWorkspaceBinding
       -> admitWorkspaceBinding(expected prefix)
  -> CatalogOperationPort.admit
       -> raw admission + validatePublication + validateProgram
       -> admitGraphFunctionCatalog
  -> CatalogOperationPort.constructView -> narrowGraphFunctionCatalog
  -> CatalogOperationPort.apply -> applyCatalogDeclaration
  -> RunInvocationPort.invoke
       -> exact catalog definition lookup
       -> constructDirectInvocation
       -> admitInvocation
       -> resolve/validate complete implementation set
       -> materializeGraph + validateGraph
       -> executeGraphTraversal
  -> RunProjectionPort.run_result/run_replay
       -> validated prefix -> Event Calculus -> replay/projector
```

No step calls `applyRootPublicInvocation`, imports `src/public`, or changes the
accepted Wave 1 four-export interface meanings.

### Proposed exact C1 file allowlist

New production owner modules:

```text
build_tenants/abiogenesis/typescript/code/src/product/workspace_operations.ts
build_tenants/abiogenesis/typescript/code/src/product/verification_operation.ts
build_tenants/abiogenesis/typescript/code/src/product/environment_operations.ts
build_tenants/abiogenesis/typescript/code/src/product/install_operation.ts
build_tenants/abiogenesis/typescript/code/src/product/catalog_operations.ts
build_tenants/abiogenesis/typescript/code/src/product/run_invocation_operation.ts
build_tenants/abiogenesis/typescript/code/src/product/project_read_ports.ts
build_tenants/abiogenesis/typescript/code/src/abg/project_read_ports.ts
```

Existing export-only joins:

```text
build_tenants/abiogenesis/typescript/code/src/product/index.ts
build_tenants/abiogenesis/typescript/code/src/abg/index.ts
```

Proof only:

```text
build_tenants/abiogenesis/typescript/test_env/support/t287-wave2-owner-chain-worker.mjs
build_tenants/abiogenesis/typescript/test_env/tests/t287-wave2-owner-chain.test.mjs
```

No `public/*`, tracked schema, generator, manifest, package dependency, donor,
legacy deletion, or other owner packet enters C1. A required additional file is
a stop for Executive allowlist adjudication, not ambient scope.

## Freeze Receipt

- production/test/schema/generator/package delta authored by C0: none;
- commentary delta: this file only;
- build/test/package execution: none;
- tracked `git diff --check`: PASS;
- commentary whitespace check: PASS;
- freeze status-set SHA-256: `4fd1f9978cb2d490fd20dfcc7104c3605b0de6f69e6a5476418ad232320c2968`;
- file content SHA rule: SHA-256 of the UTF-8 file bytes through the line
  immediately before the final `Content SHA-256` line, including its trailing
  newline.

Content SHA-256: 3685af9e82abe7621a764e985af4d1752f38e53a68531355993c2b731c436f95
