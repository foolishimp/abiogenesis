# CENSUS: ABIogenesis 5.0 S06 Exact 56-Key Construction

**Author**: Codex

**Date**: 2026-07-31T11:32:00Z

**Status**: Frozen read-only census; returned unchanged to direct F_H

**Addresses**: GOAL-035 -> T-270 -> T-281, before Gate 1 construction

## Decision Summary

The accepted 5.0 Public family is constructable as an authority allocation but
is not realized in the current code.

- The selected set is exactly 18 operation identities and 56 composite
  `(operationId, definitionKey)` identities: 32 non-read keys plus 24
  `project.read` keys.
- Product, accepted design, and T-281 allocate an exact semantic owner,
  owner-contract source, packet family, and concrete port coordinate to every
  key. No blank owner allocation or missing constitutional meaning was found.
- Current production exposes 11 operations and 19 legacy
  `(operationId, variant)` rows.
- Only seven selected composite spellings occur in that legacy set. This is
  lexical overlap, not exact-contract realization.
- None of the 56 selected definitions is represented by the required exact
  owner-local contract plus runtime-callable concrete port. Installed
  load/resolve coverage is therefore `0/56`.
- `PublicCatalogBindingAttempt`, `PublicCatalogBindingRefusal`,
  `PUBLIC_CATALOG_BINDING_CONTRACTS`, and the accepted PFC-F08 failure classes
  are absent from production, schema, generator, and executable tests.
- The current Public path still owns semantic orchestration, setup
  reachability, implicit durable-prefix selection, and volatile invocation
  identity.

The current checkpoint is therefore a construction stop, not a realization
starting point:

```text
admit exact envelope
  -> select exact definition
  -> call concrete owner port
  -> project exact outcome
```

cannot be installed from the present owner exports. Lower-level functions are
evidence only. They may not be relabelled, wrapped from Public, or joined by an
adapter.

This census makes no semantic change and grants no Gate 1 authority. Direct
F_H must accept or reject this exact content-addressed subject before any
corrective requirement/design/map construction.

## Frozen Subject And Method

| Field | Value |
|---|---|
| repository | `abiogenesis-5-root-build` |
| branch | `codex/t286-abi5-root` |
| construction origin | `08cd748515d3776bc6637412ceb2f99b27fc8a98` |
| STDO 2.2.2 authority baseline | `8a4630e8f7a05ec4f6783957c029a76eb593ee2f` |
| baseline tree | `0e5281c2c8da6501500b88a02a79d12e2aa5f365` |
| baseline receipt HEAD | `9cf00d00fb36fd088a0a93fbd5ef3167194be4ab` |
| receipt tree | `185f868350dde68edc0b6cc697bba72f8ff0ae8b` |
| selected method | STDO `2.2.2`, release commit `0519129d63de10822ae6353fa0c5ce05d56f13e9` |
| method member-set digest | `4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21` |
| donor | not inspected; adoption set empty |
| implementation/build/test changes | none |

Production code, schemas, generator, package, and semantic tests are byte
unchanged between construction origin `08cd7485` and receipt `9cf00d00`. The
six tracked changes after the authority baseline are authority/status surfaces
only: `README.md`, `AGENTS.md`, `CLAUDE.md`, `GOALS.md`, T-270, and T-281.

The census used only read operations, source and generated-file parsing,
source hashes, and a load-only probe of the already present ignored build. It
did not run a build, pack, artifact-writing test, donor inspection, deletion,
or semantic operation.

The original eight untracked commentary posts were preserved unchanged. This
post is the sole new census file.

## Constitutional Basis

The fixed basis is Product plus ticket boundary plus accepted design. The
following relations are not tradeable against compatibility, current tests,
implementation effort, or donor behavior:

1. one Public operation family;
2. hard replacement, with no compatibility objective;
3. Public performs only common admission, exact-definition selection,
   concrete owner-port invocation, and exact outcome projection;
4. one concrete semantic owner per definition;
5. one ABG-owned admitted runtime catalog;
6. ABG admitted events plus Event Calculus derive runtime truth; replay
   deterministically reconstructs that truth;
7. SDK, CLI, Codex, schemas, catalog rows, and manifests project the same
   intrinsic family;
8. PFC-F08 is the exact Product-owned static publication attempt/refusal
   relation and emits no runtime event;
9. deterministic catalog view and CatalogApplication are reconstructable
   values, not object- or context-local admissions;
10. S06 does not select S04, post-S06 Prime compression, M6, or M7.

At the first counterexample, work stops at the last satisfying cut. A green
test cannot cure an axiom violation.

## Exact-Set Evidence

The selected family is the following canonical set:

```text
canonical bytes = sort(code-unit, operationId + "#" + definitionKey)
                  joined with "\n" and one final "\n"
SHA-256 = 61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f
count = 18 operations / 56 definitions
```

The current legacy family, hashed by the same rule, is:

```text
SHA-256 = 6337899ad9066fa4b7fd216ddd858f66ec82a576f28f81ba1b8e30225a127cd2
count = 11 operations / 19 variants
```

Current legacy rows:

```text
product.verify/artifact
product.resolve/verified_product_set
product.install/verified_artifact
workspace.bind/exact_product_set
catalog.admit/module_publication
catalog.apply/node_type
catalog.apply/overlay
catalog.view/allowlist
project.read/gaps
project.read/lawful-actions
project.read/replay
project.read/result
project.read/status
project.read/ticket.consensus
interaction.respond/answer_escalation
interaction.respond/approve
run.continue/current_intent
run.invoke/direct
run.invoke/start
```

Seven selected spellings overlap lexically:

```text
catalog.view/allowlist
catalog.apply/node_type
catalog.apply/overlay
run.invoke/start
run.continue/current_intent
interaction.respond/approve
interaction.respond/answer_escalation
```

Even these seven remain legacy `variant` branches entering the Public semantic
switch. They are not `PublicFunctionDefinition<K>` values and do not call an
exact selected owner port. Forty-nine selected composite keys have no lexical
legacy row. Twelve legacy rows are outside the selected exact set.

Seven selected operation identities are wholly absent:

```text
workspace.create
workspace.open
result.assess
witness.admit
conformance.evaluate
product.materialize
release.snapshot
```

The selected composite identities are unique. There are 55 distinct bare key
spellings because `assess` lawfully occurs under both `interaction.respond`
and `result.assess`; identity is always the composite key.

## Row Grammar

Every selected row below carries the complete construction relation without
copying owner meaning into Public.

Slot notation:

- `R/O/F/N` means request, terminal outcome, semantic refusal, and
  non-terminal owner slots.
- `N=-` means no non-terminal slot.
- `O=never` means the definition has no terminal result.
- The named packet is the accepted owner-contract source for all slots and
  metadata. The join may not author fields or defaults.

Current-state notation:

- `A`: the selected operation is wholly absent.
- `K`: the operation exists but the selected key is absent.
- `K~x`: only legacy variant `x` might look predecessor-like; no equivalence
  is accepted.
- `L`: the spelling exists only as a legacy variant and Public handler.

Construction notation:

- Every row is `BUILD`: an exact owner-local contract value and concrete
  callable port must be constructed under a later accepted Gate 1 map.
- Every row is `DEP-UNRESOLVED`: because the exact port symbol is absent, no
  installed transitive closure can currently be loaded or proven.
- `X-A`: add behind the atomic swap; no current selected branch exists.
- `X-R`: delete a renamed legacy row and handler.
- `X-L`: replace a same-spelling legacy branch; retain no alias or handler.
- `X-P`: delete the six generic Public read variants and replace them with
  exact owner projectors.

Outcome law is uniform: the concrete owner returns its indexed owner result,
refusal, or non-terminal value; Public performs only structural
`PublicOutcome<K>` projection. No row permits Public semantic interpretation.

## Exact 56-Row Construction Census

The namespace prefix `abg.operation.` is omitted from the first column only.

| # | Exact operation / key | Accepted owner contract source -> concrete port | Slots and effect | Current production locus | Construction / deletion |
|---:|---|---|---|---|---|
| 1 | `workspace.create / clean` | Product.WorkspaceOperations `WORKSPACE_OPERATION_CONTRACTS.create.clean` -> `WorkspaceOperationPort.create` | `WorkspaceCreatePacket<clean>` R/O/F, N=-; workspace filesystem | `A`; no workspace-create module or Public row | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 2 | `workspace.create / imported` | Product.WorkspaceOperations `WORKSPACE_OPERATION_CONTRACTS.create.imported` -> `WorkspaceOperationPort.create` | `WorkspaceCreatePacket<imported>` R/O/F, N=-; workspace filesystem | `A`; no workspace-create module or Public row | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 3 | `workspace.open / open` | Product.WorkspaceOperations `WORKSPACE_OPERATION_CONTRACTS.open.open` -> `WorkspaceOperationPort.open` | `WorkspaceOpenPacket` R/O/F, N=-; read/admission | `A`; no workspace-open module or Public row | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 4 | `project.read / catalog_list` | `PROJECT_READ_CONTRACTS.catalog_list` -> `PROJECT_READ_OWNER_PORTS.catalog_list.project` -> Product.CatalogProjectionPort.list | `ProjectReadPacket<catalog_list>` R/O/F, N=-; pure eventless read | `K`; generic Public read switch only | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 5 | `project.read / catalog_describe` | `PROJECT_READ_CONTRACTS.catalog_describe` -> `PROJECT_READ_OWNER_PORTS.catalog_describe.project` -> Product.CatalogProjectionPort.describe | `ProjectReadPacket<catalog_describe>` R/O/F, N=-; pure eventless read | `K`; generic Public read switch only | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 6 | `project.read / workspace_status` | `PROJECT_READ_CONTRACTS.workspace_status` -> `PROJECT_READ_OWNER_PORTS.workspace_status.project` -> Product.WorkspaceProjectionPort.status | `ProjectReadPacket<workspace_status>` R/O/F, N=-; pure eventless read | `K~status`; legacy status is not workspace-specific | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 7 | `project.read / run_status` | `PROJECT_READ_CONTRACTS.run_status` -> `PROJECT_READ_OWNER_PORTS.run_status.project` -> ABG.RunProjectionPort.run_status | `ProjectReadPacket<run_status>` R/O/F, N=-; Event-Calculus projection | `K~status`; `applyRunProjectionRead` in Public | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 8 | `project.read / graph_call_status` | `PROJECT_READ_CONTRACTS.graph_call_status` -> `PROJECT_READ_OWNER_PORTS.graph_call_status.project` -> ABG.GraphCallProjectionPort.graph_call_status | `ProjectReadPacket<graph_call_status>` R/O/F, N=-; Event-Calculus projection | `K~status`; same overloaded legacy row | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 9 | `project.read / run_result` | `PROJECT_READ_CONTRACTS.run_result` -> `PROJECT_READ_OWNER_PORTS.run_result.project` -> ABG.RunProjectionPort.run_result | `ProjectReadPacket<run_result>` R/O/F, N=-; Event-Calculus projection | `K~result`; Public interprets replay | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 10 | `project.read / graph_call_result` | `PROJECT_READ_CONTRACTS.graph_call_result` -> `PROJECT_READ_OWNER_PORTS.graph_call_result.project` -> ABG.GraphCallProjectionPort.graph_call_result | `ProjectReadPacket<graph_call_result>` R/O/F, N=-; Event-Calculus projection | `K~result`; same overloaded legacy row | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 11 | `project.read / run_evidence` | `PROJECT_READ_CONTRACTS.run_evidence` -> `PROJECT_READ_OWNER_PORTS.run_evidence.project` -> ABG.RunProjectionPort.run_evidence | `ProjectReadPacket<run_evidence>` R/O/F, N=-; Event-Calculus projection | `K`; no legacy evidence row | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 12 | `project.read / graph_call_evidence` | `PROJECT_READ_CONTRACTS.graph_call_evidence` -> `PROJECT_READ_OWNER_PORTS.graph_call_evidence.project` -> ABG.GraphCallProjectionPort.graph_call_evidence | `ProjectReadPacket<graph_call_evidence>` R/O/F, N=-; Event-Calculus projection | `K`; no legacy evidence row | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 13 | `project.read / result_evidence` | `PROJECT_READ_CONTRACTS.result_evidence` -> `PROJECT_READ_OWNER_PORTS.result_evidence.project` -> ABG.ResultProjectionPort.evidence | `ProjectReadPacket<result_evidence>` R/O/F, N=-; Event-Calculus projection | `K`; no exact projector | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 14 | `project.read / assessment_evidence` | `PROJECT_READ_CONTRACTS.assessment_evidence` -> `PROJECT_READ_OWNER_PORTS.assessment_evidence.project` -> ABG.AssessmentProjectionPort.evidence | `ProjectReadPacket<assessment_evidence>` R/O/F, N=-; Event-Calculus projection | `K`; assessment owner absent | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 15 | `project.read / witness_evidence` | `PROJECT_READ_CONTRACTS.witness_evidence` -> `PROJECT_READ_OWNER_PORTS.witness_evidence.project` -> ABG.WitnessProjectionPort.evidence | `ProjectReadPacket<witness_evidence>` R/O/F, N=-; Event-Calculus projection | `K`; witness owner absent | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 16 | `project.read / install_evidence` | `PROJECT_READ_CONTRACTS.install_evidence` -> `PROJECT_READ_OWNER_PORTS.install_evidence.project` -> Product.InstallProjectionPort.evidence | `ProjectReadPacket<install_evidence>` R/O/F, N=-; immutable Product projection | `K`; install constructor exists, projector does not | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 17 | `project.read / release_evidence` | `PROJECT_READ_CONTRACTS.release_evidence` -> `PROJECT_READ_OWNER_PORTS.release_evidence.project` -> Product.ReleaseProjectionPort.evidence | `ProjectReadPacket<release_evidence>` R/O/F, N=-; immutable release projection | `K`; release module absent | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 18 | `project.read / workspace_replay` | `PROJECT_READ_CONTRACTS.workspace_replay` -> `PROJECT_READ_OWNER_PORTS.workspace_replay.project` -> ABG.WorkspaceProjectionPort.workspace_replay | `ProjectReadPacket<workspace_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; current replay has no workspace-specific port | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 19 | `project.read / run_replay` | `PROJECT_READ_CONTRACTS.run_replay` -> `PROJECT_READ_OWNER_PORTS.run_replay.project` -> ABG.RunProjectionPort.run_replay | `ProjectReadPacket<run_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; Public interprets raw replay | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 20 | `project.read / graph_call_replay` | `PROJECT_READ_CONTRACTS.graph_call_replay` -> `PROJECT_READ_OWNER_PORTS.graph_call_replay.project` -> ABG.GraphCallProjectionPort.graph_call_replay | `ProjectReadPacket<graph_call_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; no graph-call port | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 21 | `project.read / interaction_replay` | `PROJECT_READ_CONTRACTS.interaction_replay` -> `PROJECT_READ_OWNER_PORTS.interaction_replay.project` -> ABG.InteractionProjectionPort.replay | `ProjectReadPacket<interaction_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; continuation helper is not this port | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 22 | `project.read / continuation_replay` | `PROJECT_READ_CONTRACTS.continuation_replay` -> `PROJECT_READ_OWNER_PORTS.continuation_replay.project` -> ABG.ContinuationProjectionPort.replay | `ProjectReadPacket<continuation_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; no exact continuation projector | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 23 | `project.read / c_call_replay` | `PROJECT_READ_CONTRACTS.c_call_replay` -> `PROJECT_READ_OWNER_PORTS.c_call_replay.project` -> ABG.CCallProjectionPort.replay | `ProjectReadPacket<c_call_replay>` R/O/F, N=-; Event-Calculus replay | `K~replay`; raw replay exposes data, no exact port | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 24 | `project.read / workspace_gaps` | `PROJECT_READ_CONTRACTS.workspace_gaps` -> `PROJECT_READ_OWNER_PORTS.workspace_gaps.project` -> ABG.WorkspaceProjectionPort.workspace_gaps | `ProjectReadPacket<workspace_gaps>` R/O/F, N=-; scoped gap projection | `K~gaps`; legacy gap branch is run-derived | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 25 | `project.read / run_gaps` | `PROJECT_READ_CONTRACTS.run_gaps` -> `PROJECT_READ_OWNER_PORTS.run_gaps.project` -> ABG.RunProjectionPort.run_gaps | `ProjectReadPacket<run_gaps>` R/O/F, N=-; scoped gap projection | `K~gaps`; `applyGapRead` in Public | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 26 | `project.read / run_lawful_actions` | `PROJECT_READ_CONTRACTS.run_lawful_actions` -> `PROJECT_READ_OWNER_PORTS.run_lawful_actions.project` -> ABG.RunProjectionPort.run_lawful_actions | `ProjectReadPacket<run_lawful_actions>` R/O/F, N=-; scoped lawful-action projection | `K~lawful-actions`; Public branch | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 27 | `project.read / ticket_consensus` | `PROJECT_READ_CONTRACTS.ticket_consensus` -> `PROJECT_READ_OWNER_PORTS.ticket_consensus.project` -> Product.ConsensusProjectionPort.ticketConsensus | `ProjectReadPacket<ticket_consensus>` R/O/F, N=-; deterministic Product projection | `K~ticket.consensus`; lower `projectTicketConsensus` is reached through a string-kind switch | `BUILD`, `DEP-UNRESOLVED`, `X-P` |
| 28 | `product.verify / verify` | Product.Verification `PRODUCT_VERIFICATION_CONTRACTS.verify` -> `ProductVerificationPort.verify` | `ProductVerifyPacket` R/O/F, N=-; deterministic attestation | `K~artifact`; `applyVerify` plus `verifyProduct`, memory-only setup carrier | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 29 | `product.resolve / resolve` | Product.EnvironmentResolution `PRODUCT_ENVIRONMENT_CONTRACTS.resolve` -> `ProductEnvironmentPort.resolve` | `ProductResolvePacket` R/O/F, N=-; deterministic evaluation | `K~verified_product_set`; `applyResolve` plus `constructResolvedProductLock`, object/memory authority | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 30 | `product.install / install` | Product.Installation `PRODUCT_INSTALL_CONTRACTS.install` -> `ProductInstallPort.install` | `ProductInstallPacket` R/O/F, N=-; immutable filesystem and admitted artifact truth | `K~verified_artifact`; Public composes `installProduct` and ABG admission | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 31 | `workspace.bind / bind` | Product.EnvironmentResolution `PRODUCT_ENVIRONMENT_CONTRACTS.bind` -> `ProductEnvironmentPort.bindWorkspace` | `WorkspaceBindPacket` R/O/F, N=-; binding persistence and admitted truth | `K~exact_product_set`; Public composes Product constructors and ABG admission | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 32 | `catalog.admit / admit` | Product.CatalogAdmission `CATALOG_OPERATION_CONTRACTS.admit` -> `CatalogOperationPort.admit` | `CatalogAdmitPacket` R/O/F, N=-; ABG runtime-catalog event admission | `K~module_publication`; Public composes candidate, Validator, and ABG | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 33 | `catalog.view / allowlist` | Product.CatalogView `CATALOG_OPERATION_CONTRACTS.view.allowlist` -> `CatalogOperationPort.constructView` | `CatalogViewPacket` R/O/F, N=-; deterministic eventless narrowing | `L`; Public calls Product candidate then eventful ABG `narrowCatalogView` | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 34 | `catalog.apply / node_type` | Product.CatalogApplication `CATALOG_OPERATION_CONTRACTS.apply.node_type` -> `CatalogOperationPort.apply` | `CatalogApplyPacket<node_type>` R/O/F, N=-; deterministic eventless application | `L`; Product candidate plus store/object-branded ABG application | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 35 | `catalog.apply / overlay` | Product.CatalogApplication `CATALOG_OPERATION_CONTRACTS.apply.overlay` -> `CatalogOperationPort.apply` | `CatalogApplyPacket<overlay>` R/O/F, N=-; deterministic eventless application | `L`; same hybrid authority | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 36 | `run.invoke / invoke` | Product.RunInvocation `RUN_OPERATION_CONTRACTS.invoke.invoke` -> `RunInvocationPort.invoke` | `RunInvokePacket<invoke>` R/O/F; N=`held|gap_stop`; ABG traversal | `K~direct`; Public owns full orchestration over lower constructors/admission | `BUILD`, `DEP-UNRESOLVED`, `X-R` |
| 37 | `run.invoke / start` | Product.RunInvocation `RUN_OPERATION_CONTRACTS.invoke.start` -> `RunInvocationPort.start` | `RunInvokePacket<start>` R/O/F; N=`held|gap_stop`; ABG traversal | `L`; Public owns full orchestration | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 38 | `run.continue / current_intent` | Product.RunContinuation `RUN_OPERATION_CONTRACTS.continue.current_intent` -> `RunContinuationPort.current_intent` | `RunContinuePacket<current_intent>` R/O/F; N=`held|gap_stop`; ABG continuation | `L`; Public composes ABG/HoG continuation | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 39 | `run.continue / selected_action` | Product.RunContinuation `RUN_OPERATION_CONTRACTS.continue.selected_action` -> `RunContinuationPort.selected_action` | `RunContinuePacket<selected_action>` R/O/F; N=`held|gap_stop`; ABG continuation | `K`; selected branch absent | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 40 | `interaction.respond / select` | Product.InteractionResponse `INTERACTION_OPERATION_CONTRACTS.respond.select` -> `InteractionResponsePort.respond` | `InteractionRespondPacket<select>` R/F, O=never; N=`responded`; F_H response event | `K`; branch absent | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 41 | `interaction.respond / approve` | Product.InteractionResponse `INTERACTION_OPERATION_CONTRACTS.respond.approve` -> `InteractionResponsePort.respond` | `InteractionRespondPacket<approve>` R/F, O=never; N=`responded`; F_H response event | `L`; generic Product evaluator plus ABG admission in Public | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 42 | `interaction.respond / reject` | Product.InteractionResponse `INTERACTION_OPERATION_CONTRACTS.respond.reject` -> `InteractionResponsePort.respond` | `InteractionRespondPacket<reject>` R/F, O=never; N=`responded`; F_H response event | `K`; branch absent | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 43 | `interaction.respond / assess` | Product.InteractionResponse `INTERACTION_OPERATION_CONTRACTS.respond.assess` -> `InteractionResponsePort.respond` | `InteractionRespondPacket<assess>` R/F, O=never; N=`responded`; F_H response event | `K`; branch absent | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 44 | `interaction.respond / answer_escalation` | Product.InteractionResponse `INTERACTION_OPERATION_CONTRACTS.respond.answer_escalation` -> `InteractionResponsePort.respond` | `InteractionRespondPacket<answer_escalation>` R/F, O=never; N=`responded`; F_H response event | `L`; generic Product evaluator plus ABG admission in Public | `BUILD`, `DEP-UNRESOLVED`, `X-L` |
| 45 | `result.assess / assess` | Product.ResultAssessment `RESULT_OPERATION_CONTRACTS.assess` -> `ResultAssessmentPort.assess` | `ResultAssessPacket` R/O/F; N=`retry|blocked`; assessment event | `A`; no Product assessment module or Public row | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 46 | `witness.admit / reprice` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.reprice` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<reprice>` R/O/F, N=-; witnessed event | `A`; no witness public admission | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 47 | `witness.admit / attest` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.attest` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<attest>` R/O/F, N=-; witnessed event | `A` | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 48 | `witness.admit / hygiene-stamp` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.hygiene-stamp` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<hygiene-stamp>` R/O/F, N=-; witnessed event | `A` | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 49 | `witness.admit / intake` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.intake` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<intake>` R/O/F, N=-; witnessed event | `A` | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 50 | `witness.admit / run-resumed` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.run-resumed` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<run-resumed>` R/O/F, N=-; witnessed event | `A`; internal event spelling is not the owner port | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 51 | `witness.admit / run-stopped` | ABG.WitnessAdmission `WITNESS_OPERATION_CONTRACTS.admit.run-stopped` -> `WitnessAdmissionPort.admit` | `WitnessAdmitPacket<run-stopped>` R/O/F, N=-; witnessed event | `A`; internal event spelling is not the owner port | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 52 | `conformance.evaluate / gtl_program` | Validator.Conformance `CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program` -> `ConformancePort.evaluateGtlProgram` | `ConformanceEvaluatePacket` R/O/F, N=-; deterministic whole-Program assessment | `A`; lower `validateProgram` is not an exact public port | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 53 | `product.materialize / context_bootstrap` | Product.ProductMaterialization `MATERIALIZATION_OPERATION_CONTRACTS.context_bootstrap` -> `ProductMaterializationPort.context_bootstrap` | `ProductMaterializePacket<context_bootstrap>` R/O/F, N=-; Product filesystem | `A`; no Product materialization module | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 54 | `product.materialize / configuration` | Product.ProductMaterialization `MATERIALIZATION_OPERATION_CONTRACTS.configuration` -> `ProductMaterializationPort.configuration` | `ProductMaterializePacket<configuration>` R/O/F, N=-; Product filesystem | `A`; no Product materialization module | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 55 | `release.snapshot / published_rc` | Product.ReleaseSnapshot `RELEASE_OPERATION_CONTRACTS.snapshot.published_rc` -> `ReleaseSnapshotPort.published_rc` | `ReleaseSnapshotPacket<published_rc>` R/O/F, N=-; immutable RC publication | `A`; no release owner module | `BUILD`, `DEP-UNRESOLVED`, `X-A` |
| 56 | `release.snapshot / tapped_release` | Product.ReleaseSnapshot `RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release` -> `ReleaseSnapshotPort.tapped_release` | `ReleaseSnapshotPacket<tapped_release>` R/O/F, N=-; immutable stable publication | `A`; no release owner module | `BUILD`, `DEP-UNRESOLVED`, `X-A` |

## Concrete Port And Dependency Probe

Source search and a load-only import of the already present compiled package
both found these required symbols absent:

```text
WorkspaceOperationPort
PROJECT_READ_CONTRACTS
PROJECT_READ_OWNER_PORTS
ProductVerificationPort
ProductEnvironmentPort
ProductInstallPort
CatalogOperationPort
RunInvocationPort
RunContinuationPort
InteractionResponsePort
ResultAssessmentPort
WitnessAdmissionPort
ConformancePort
ProductMaterializationPort
ReleaseSnapshotPort
PUBLIC_FUNCTION_DEFINITION_FAMILY
PUBLIC_OPERATION_SCHEMAS
```

All named exact owner-contract collection exports are absent as well. A type
interface, string coordinate, donor symbol, or lower helper does not satisfy a
concrete callable port.

The following lower-level code is relevant evidence, but each relation is
split, generic, incomplete, or interpreted by Public:

| Selected area | Current lower evidence | Why it is not the selected port |
|---|---|---|
| verification | `product/verify_product.ts:581 verifyProduct` | downstream native evidence is object-local; Public retains the complete carrier in `RootOperationState` |
| resolution | `product/environment.ts:404 constructResolvedProductLock` | consumes hidden verification evidence; no exact `resolve` owner packet/port |
| install | `product/install_product.ts:149 installProduct`; `abg/environment_admission.ts:188 admitProductInstall` | Product/ABG pieces are orchestrated in Public |
| bind | Product environment constructors at `environment.ts:693,774,795`; `admitWorkspaceBinding` at `environment_admission.ts:220` | split construction/admission under Public control |
| catalog admit | `constructCatalogAdmissionCandidate` at `product/catalog.ts:285`; `admitCatalog` at `abg/catalog_admission.ts:175` | split Product/ABG/Validator path |
| catalog view | `constructCatalogViewCandidate` at `product/catalog.ts:480`; `narrowCatalogView` at `abg/catalog_admission.ts:261` | current view is eventful; selected view is deterministic/eventless |
| catalog application | `constructCatalogApplicationCandidate` at `product/semantics.ts:544`; `admitCatalogApplication` at `abg/catalog_admission.ts:308` | current truth is exact-object/store branded; selected value is independently reconstructable |
| run invoke | `constructDirectInvocation`/`constructStartInvocation` at `product/invocation.ts:504,529`; `admitInvocation` at `abg/invocation_admission.ts:601` | Public owns validation, resolution, HoG, ABG, and outcome orchestration |
| continuation/interaction | ABG continuation helpers; `evaluateInstalledInteractionResponse` at `product/semantics.ts:858` | incomplete variants and no exact Product owner ports |
| reads | `abg/replay.ts:475 replay`; `gtl/consensus.ts:3518 projectTicketConsensus` | raw/general projectors are selected by Public or string-kind switches |
| conformance | `validator/validation.ts:1596 validateProgram` | lower validator core, no exact request/result/refusal closure or public port |
| absent owner families | workspace create/open, result assessment, witness admission, Product materialization, release snapshot, most exact projectors | no current complete owner implementation |

Current package facts:

- package: `@abiogenesis/typescript-tenant@5.0.0-dev.286`;
- installed exports: root, Product, ABG, GTL, HoG, Public, Validator;
- bins: `abg.cli`, `abg.codex`;
- no runtime npm dependencies;
- package files broadly include `build/**`, `contracts/**`, and the manifest;
- current Public source closure reaches 81 modules, CLI 80, Codex one, and
  their union 83 modules;
- built-in runtime dependencies include `child_process`, `crypto`, `fs`,
  `module`, `os`, `path`, and `url`;
- the broad package inclusion proves neither an exact port export nor a
  callable closure.

Gate 2 must load/resolve all 56 exact ports and every declared transitive
runtime dependency from the clean tarball. The sentinel may execute only its
vertical path; package constructability may not be reduced to that path.

## Current Production Architecture

The current family is one legacy carrier plus one Public-owned workflow
controller:

```text
ROOT_PUBLIC_OPERATION_DEFINITIONS (11/19)
  -> RootPublicInvocation with `variant`
  -> parseRootPublicInvocation
  -> applyRootPublicInvocation
  -> switch(operationId)
  -> Public-owned applyVerify/applyResolve/.../applyRunContinue
  -> generic PublicOutcome or five-code outer refusal
```

Concrete loci:

- `public/contracts.ts:34-343`: handwritten legacy roster;
- `public/contracts.ts:409`: `RootPublicInvocation`;
- `public/contracts.ts:460-480`: generic outcome/refusal family;
- `public/contracts.ts:652-709`: legacy parser;
- `public/operations.ts:3960-4013`: dispatcher;
- `public/operations.ts:3984-4007`: semantic operation switch;
- `public/schema.ts:116-184`: handwritten schema synthesis;
- `public/index.ts:1-27`: legacy public export surface;
- `public/cli.ts:41-56`: decoded JSON enters the legacy dispatcher;
- `public/codex_cli.ts:59-63`: exact-sibling CLI transport delegation.

The current durable setup-artifact admission path writes
`definitionKey = invocation.operationId`, not the selected composite
definition key. The legacy `variant` never becomes durable definition
identity.

### Rival authority inventory

These are deletion requirements, not implementation suggestions:

| Finding | Current rival authority | Confirmed locus |
|---|---|---|
| F01/F13 | one `Set` plus seven setup/prerequisite `Map`s, hidden behind a context-keyed `WeakMap`; invocation claimed before admission | `product/root_operation_state.ts:61-137`; `public/operations.ts:64-80,3967-3972` |
| F12 | mutable implicit current-log pointer | `pendingReopenAuthority` at `operations.ts:59-62,144-167,3981-3983` |
| F02 | native verification evidence and resolved-lock legitimacy attached to exact objects | `product/verify_product.ts:73-80,962-1006`; `product/environment.ts:157,460-477,500,680-690` |
| F06 | CatalogApplication validity attached to exact open store and object membership | `abg/catalog_admission.ts:38-78,308-390,520-551`; Product candidate brand at `product/catalog.ts:218-219` |
| F07 | invocation source-result basis attached to an exact-object `WeakSet` | `abg/invocation_admission.ts:184-201,314,916` |
| F09 | executable retry input retained only in an executor-local `Map` | `hog/graph_execute.ts:174-219,388,804-821` |
| F04/F08 | unkeyed artifact fluent and raw/global-tail interpretations compete with scoped Event Calculus | `abg/event_calculus.ts`; currentness checks in cursor, continuation, and closure modules |

Verification and resolution currently have no complete public carrier that a
fresh process can consume through the legacy family. Removing
`RootOperationState` alone would make install and every later setup operation
unreachable. The accepted replacement law is already fixed: complete
canonical immutable carriers cross the boundary explicitly and are revalidated
against exact Product bytes and the identified admitted prefix wherever
admission is required. It is not permission to add a new registry or implicit
event path.

`PublicContinuationAuthority`, `PublicRunProjectionAuthority`, and the gap
coordinate carrier are not wholesale deletions. Parsing arbitrary values must
yield candidates; only ABG-backed rehydration can yield a usable basis. Their
digests prove coherence, not provenance.

## Legacy Deletion And Scenario-Rewrite Manifest

### Delete or wholesale-replace

1. `code/src/product/root_operation_state.ts` and its exports from
   `product/index.ts`.
2. `code/src/public/contracts.ts` as the legacy roster, carrier, parser,
   generic result family, and aliases.
3. `code/src/public/operations.ts` as the Public semantic controller,
   context/state registry, implicit prefix path, handlers, generic refusal
   collapse, and semantic switch.
4. `code/src/public/schema.ts` as synthesis from the old roster.
5. `code/src/public/child_traversal_port.ts` from Public; lawful composition
   belongs behind Product.RunInvocation, HoG, and ABG owner ports.
6. `code/src/public/outcome.ts` as generic replay interpretation; replace with
   exact indexed outcome projection only.
7. `contracts/schemas/public-operation.schema.json`; regenerate from owner
   schemas with no legacy definition.
8. All `rootOperationStates`, `pendingReopenAuthority`, prior-invocation
   lookup maps, volatile duplicate claims, semantic object brands,
   executor-local retry authority, and global-tail currentness checks wherever
   they occur.
9. Current R10 proof derived from the legacy family:
   `abi5-root-r10.transcript.json`, `abi5-root-r10.outcomes.json`,
   `abi5-root-r10.events.jsonl`, dependent `abi5-root-r10.json`, governor
   proof, and `test_env/evidence/abi5-root-r2.json`; regenerate from the exact
   family.

Path reuse may not preserve an old export, alias, parser, carrier, handler, or
semantic branch.

### Rewrite or re-home

- `public/index.ts`: exact family, indexed admission/outcomes, generated SDK
  projection only;
- `public/cli.ts`: same exact envelope/family/owner-port path as the SDK;
- `public/codex_cli.ts`: retain only exact-sibling process transport and adopt
  the exact CLI grammar;
- continuation/run-projection/gap carriers: candidate parse plus ABG-backed
  rehydration;
- `product/index.ts`: owner-local contract/port/publication exports, no root
  state;
- `product/publication.ts`: Product-owned PFC-F08 relation and sole static
  catalog merge;
- `scripts/generate-product-manifest.mjs`: consume generated family
  projections and PFC-F08 result, not a local catalog roster;
- catalog and manifest JSON Schemas: exact PFC-F08 and family binding;
- `package.json`: keep `./public`, `abg.cli`, and `abg.codex` coordinates but
  expose only the replacement family;
- verification/environment surfaces: complete carriers, nested owner slots,
  final catalog, explicit setup inputs.

### Directly coupled support and tests

Rewrite these coordinates against the exact family:

```text
test_env/support/root-cli-environment.mjs
test_env/support/root-installed-environment.mjs
test_env/support/root-governor.mjs
test_env/tests/m5-installed-portability.test.mjs
test_env/tests/m5-installed-external-product.test.mjs
test_env/tests/m5-installed-consensus.test.mjs
test_env/tests/m5-installed-fp.test.mjs
test_env/tests/rival-authority-mutations.test.mjs
test_env/tests/m5-consensus-module.test.mjs
test_env/tests/r10-installed-cli-outcome.test.mjs
test_env/tests/r5-invocation-admission.test.mjs
test_env/tests/m5-s03-authority.test.mjs
test_env/tests/m5-event-store-reopen.test.mjs
test_env/tests/r3-workspace-binding.test.mjs
test_env/tests/r4-catalog-admission.test.mjs
```

Delete assertions whose subject is the legacy carrier, parser, roster, schema,
three-row operation catalog, generic refusal collapse, old spelling, same
object/store application authority, or volatile duplicate behavior. Preserve
lawful installed, Consensus, F_P, external-Product, continuation, replay, and
rival-authority scenario meaning by rewriting it against exact
`K = {operationId, definitionKey}`. No lawful scenario test file is deleted
wholesale.

Transitive harness consumers must rerun after the replacement: fibre,
compose, fan-out, F_P, gate, graph-edge, recursion, retry, substitute,
workflow, live F_P, conservation, flavored catalog, runtime-scope, and root
governor.

## Generated Projection Census

### Current graph

```text
ROOT_PUBLIC_OPERATION_DEFINITIONS (hand-authored 11/19)
  + payload grammar in public/contracts.ts
  -> RootPublicInvocation / parser / generic PublicOutcome
  -> public/schema.ts
  -> tracked public-operation.schema.json
  -> public/index.ts legacy SDK exports
  -> public/cli.ts -> applyRootPublicInvocation
  -> public/codex_cli.ts -> exact-sibling CLI

generate-product-manifest.mjs
  -> independently hand-authored three Public rows
  -> locally aggregated flat PublicContractCatalog
  -> ignored product-toolchain-manifest.json
```

The current tracked schema has 11 operation identities and 19 invocation
branches. The current ignored generated manifest has:

- 36 catalog rows total;
- three generic Public rows only: schema,
  `RootPublicInvocation/parseRootPublicInvocation`, and
  `PublicOutcome/applyRootPublicInvocation`;
- no per-definition catalog rows;
- catalog digest
  `sha256:1911582c902e0c7b831d7b7286ad6292e899d10957218213f0d816aec47592d4`;
- file SHA-256
  `a52991c8728b4e5c8fd01e2a4c9c33e7ff1dde47f6b31a790d06e6efd2d85df0`.

Other independent operation spellings occur in ABG environment admission,
Product invocation, ABG invocation grant rows, catalog admission,
continuation, test governor, and transcript constructors. They must become
typed projections or owner-local domains, not another catalog.

### Required graph

```text
owner-local strict contracts and concrete ports
  -> one IntrinsicPublicFunctionDefinitionFamily (18/56)
  -> one common envelope admission and exact selector
  -> generated native SDK types and indexed parser
  -> generated JSON Schema
  -> generated CLI grammar
  -> Codex process transport of that CLI grammar
  -> PFC-F07 row proposals
  -> Product-owned PFC-F08 static binding
  -> Product manifest/catalog projections
  -> ABG runtime invocation/event admission
  -> Event Calculus truth
  -> replay and project.read projections
```

Exact-set equality and generator idempotence replace line review of generated
files. No SDK, CLI, schema, manifest, fixture, or test may own an independent
56-key roster.

## PFC-F08 Exact Oracle

PFC-F08 is static Product publication, not ABG runtime catalog admission:

```text
PublicCatalogBindingAttempt
  -> static PublicContractCatalog + exact 44-row S06 diagnostic
  | PublicCatalogBindingRefusal
```

It admits no runtime event.

Success requires:

1. one exact attempt binding extant catalog, intrinsic family, proposal set,
   Product identity, and Product-content digest;
2. no forbidden extant `abg.operation.*` identity;
3. exactly one proposal for each of the three common and 18 operation
   identities, and no other proposal;
4. every retained non-operation row preserved byte-for-byte;
5. every bound operation row owned by the exact containing Product;
6. every locator resolvable and every content digest exact;
7. canonical code-unit order by contract identity;
8. catalog digest over the resulting carrier;
9. exact `MandatorySchemaVocabularyCorpusGapSet` diagnostic;
10. no runtime event.

The closed refusal classes are:

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

Each refusal carries the exact attempt, exactly one failure class, unique
non-empty JSON-pointer issue paths, no output catalog, no diagnostic, and no
runtime event.

Current production contains none of this relation. `product/publication.ts`
only computes module-publication semantic digest. The generator manually
constructs three rows and a fresh catalog, so it cannot be grandfathered as
PFC-F08.

## Installed Sentinel And Smallest Sequence

The smallest current installed Hello World transcript is a seven-invocation
legacy path:

```text
verify -> resolve -> install -> bind -> catalog.admit
  -> catalog.view -> run.invoke(direct)
```

It depends on one stateful JavaScript context and is not the accepted
sentinel.

The frozen Gate 2 sentinel is ten invocations over nine operation identities:

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

It must use explicit carriers and durable-prefix ingress across fresh
processes. The two reads must derive the same scoped truth from ABG events plus
Event Calculus. Retaining a JavaScript object, hidden registry, implicit
prefix, or Public handler invalidates the sentinel.

The smallest authorized future sequence remains:

1. direct F_H accepts this unchanged census and authorizes bounded Gate 1
   authority construction;
2. Gate 1 freezes the corrective authority cut, 56-row construction map,
   decision-complete falsifiers, deletion manifest, projection graph,
   PFC-F08 oracle, and sentinel recipe;
3. one constructability and one authority reviewer inspect that frozen cut;
4. direct F_H accepts the unchanged Gate 1 subject;
5. Increment 0A freezes falsifier red/preservation evidence without semantic
   repair;
6. repair canonical identity and whole-Program pre-effect validation;
7. repair scoped ABG Event Calculus, explicit prefix, retry reconstruction,
   and event-derived invocation identity;
8. construct all owner-local contracts and concrete ports while keeping them
   uninstalled;
9. atomically install all 18/56 projections and delete the legacy family;
10. pack all 56 closures, run the all-port probe and sentinel, freeze Gate 2,
    then continue only after its cold review.

No intermediate step exposes two Public families or an adapter.

## Authority-Contradiction Register

The code review findings remain confirmed at the receipt cut:

| ID | Current contradiction | Required invariant |
|---|---|---|
| F01 | Public context state decides setup reachability | equal immutable carriers plus equal admitted prefix have equal meaning across processes |
| F02 | verification/resolution legitimacy depends on object identity | complete explicit carrier or exact admitted reference, revalidated from Product bytes |
| F03 | installed family is 11/19, not 18/56 | one exact intrinsic family through every projection |
| F04 | Event Calculus erases artifact scope and admits same-scope digest collision | scope-keyed fluent truth and typed collision refusal |
| F05 | Validator omits finite topology laws and HoG may execute before refusal | one normalized Program; complete validation before any event or leaf effect |
| F06 | CatalogApplication is eventless but store/object branded | total deterministic reconstruction from admitted immutable inputs; `run.invoke` revalidates use |
| F07 | source-result basis is object branded after derivation | reconstructible ABG-backed basis; preserve existing lawful derivation if probe passes |
| F08 | global store tail controls scoped cursor/continuation/closure | latest applicable event inside declared scope |
| F09 | retry executable value lives in a process-local Map | admitted retry input plus ABG projection reconstructs next execution input |
| F10 | caller order enters ProgramValidation identity | canonical semantic-set identity under permutation |
| F11 | typed owner refusals collapse to generic prose | exact nested owner refusal preserved under the five-code common envelope |
| F12 | retained context silently selects a remembered prefix | every effectful request identifies its consumed durable prefix |
| F13 | setup duplicates use volatile preclaim while continuation uses events | admitted event truth owns effectful identity; failed attempts do not consume it; declared reads repeat |
| F14 | identity hashing uses default `localeCompare` | explicit code-unit comparator for every identity-bearing order |

ABG event admission plus Event Calculus is the runtime-truth relation. Replay
reconstructs that result; replay is not a second authority.

## Decision-Complete Falsifier Records

These are specifications only. No falsifier was implemented or executed.
Each record fixes the ingress, boundary, fixture, mutation, oracle, expected
baseline signature, and masking control for later Gate 1 review.

| ID | Current ingress -> proposed ingress | Process boundary and fixture | Mutation | Immutable observable oracle | Expected current baseline signature | Masking control |
|---|---|---|---|---|---|---|
| `AX-F01` | legacy Public setup transcript -> exact verify/resolve/install/bind/admit/view ports | P1 creates a valid packed Product and durable prefix; P2 loads the installed package and receives only complete carriers plus explicit prefix | terminate P1 after each setup stage and reconstruct the next stage in P2 | every later carrier ref/digest/outcome equals retained-process result; reconstructed view adds no event | legacy path refuses `missing_prerequisite` or lacks prior invocation state in P2 | prove artifact, lock, install, binding, catalog, allowlist, and prefix independently valid before the stage under test; one stage per fixture |
| `AX-F02` | direct `verifyProduct` then `constructResolvedProductLock` -> `ProductVerificationPort.verify` then `ProductEnvironmentPort.resolve` | P1 serializes complete verification output; P2 reads the same Product bytes and carrier | JSON round-trip and process restart before resolve | same verified identity and resolved-lock ref/digest/value | lower resolver returns `lock_mismatch`, or legacy Public cannot find the verification invocation | call the lower resolver directly for baseline isolation; compare canonical bytes before resolve; no Public setup lookup may intercept |
| `AX-F03` | legacy roster/parser/schema -> intrinsic family admission and selector | static installed-package load; no semantic owner call | separate remove, add, duplicate, and wrong-slot fixture over one otherwise exact 18/56 projection | exact family succeeds; each mutation returns its exact family/lookup refusal before port resolution | selected family export is absent and live set is 11/19 | validate fixture cardinality/digest first; optional dynamic load records missing selected export as the target red signature, not a fixture error; final expected refusal remains distinct and immutable per row |
| `AX-F04` | direct ABG artifact admission plus replay -> scoped Event Calculus projector | one store containing two declared scopes and a second same-scope collision fixture | different scopes, then same scope/ref with a conflicting digest | distinct scoped fluents for different scopes; typed fail-closed refusal and zero event-count increase for collision | both collision events admit and replay exposes one unkeyed `public_operation_artifact_available` fluent | all event envelopes, refs, times, payloads, and non-mutated digests are valid; compare prefix before/after the isolated collision |
| `AX-F05` | `validateProgram` then HoG with counting leaf -> `ConformancePort.evaluateGtlProgram` then exact invoke | worker with capped/counting leaf and ABG event-count oracle | isolated duplicate node, empty terminal set, terminal edge, zero-outdegree non-terminal, multi-outdegree non-terminal, unreachable terminal, and undeclared/ungoverned cycle | Validator refuses each before leaf count or runtime-event count changes; Validator and HoG bind one Program digest | affected topologies validate; duplicate may be interpreted differently; effect may occur before late refusal | every leaf, contract, start, edge endpoint, and declaration outside the mutation is valid; cycle uses a counter/watchdog and proves boundary crossing, never timeout alone |
| `AX-F06` | direct Product candidate plus ABG application-brand probe -> `CatalogOperationPort.apply` then `RunInvocationPort.invoke` | P1 constructs canonical application; P2 reconstructs equal install/view/declaration/prefix inputs | serialize and independently reconstruct the equal CatalogApplication | canonical application equality and successful reach to invoke without origin object/store/context/brand | `hasAdmittedCatalogApplication` is false for reconstructed object | first call the exact brand predicate directly to bypass `RootOperationState`; independently prove install/view/prefix validity before the invoke assertion |
| `AX-F07` | ABG source-result derivation -> exact ABG-backed source-result projector and invoke basis | P1 closes a valid result prefix; P2 reopens it with reconstructed Product-semantics basis | discard the derived object and derive again in P2 | same basis ref, digest, and canonical value, accepted by its consumer | preservation expectation: derivation reconstructs the same basis; any brand-only consumer failure promotes the row to red without changing oracle | compare the complete reconstructed basis before consumer entry and avoid passing a caller-minted carrier |
| `AX-F08` | current cursor/continuation/closure functions -> scoped Event Calculus queries | paired stores share exact run R prefix; second adds one valid unrelated event for run S | append S event immediately before initial cursor, continuation reconstruction, F_H response/resume, normal/interaction/child closure, and refusal causation | R's scoped replay, admissibility, outcome, and causal event refs remain identical | one or more actions refuse or cite the unrelated global-tail event | prove R scoped replay identical before action; S has disjoint run/frame/aggregate identities and a valid event envelope; one target point per fixture |
| `AX-F09` | current HoG retry executor -> admitted retry-input projector plus HoG resume | P1 stops exactly after durable retry frontier; P2 reopens prefix | terminate executor and lose its local Map before selecting next retry input | P2 reconstructs canonical executable input and next attempt identity exactly | replay knows frontier/digest but executor cannot recover executable input | worker acknowledges durable frontier before termination; input is contract-admitted and its preimage is available through the selected admitted carrier, not test memory |
| `AX-F10` | `validateProgram` -> normalized Validator/HoG Program | same process plus installed-package repeat | permute identical GraphFunction semantic membership and requirement ordering | equal ProgramValidation, GraphValidation, ExecutionBasis, invocation, and replay identities | `sourceDigest` and `validationRef` differ under A/B versus B/A | members are unique and canonically equal; only sequence changes; compare code-unit ordered projections at every downstream identity boundary |
| `AX-F11` | installed legacy SDK and CLI `product.verify/artifact` -> exact `product.verify/verify` SDK and CLI | two clean installed invocations per transport, each with distinct invocation ref | unreadable artifact path versus readable artifact with wrong digest | same five-code outer envelope shape, distinct exact nested owner refusal codes `artifact_unreadable` and `artifact_digest_mismatch`, SDK/CLI equality | both collapse to outer `owner_refusal` plus prose | every other field/digest is exact; the unreadable fixture cannot reach digest comparison and the mismatch fixture proves readability first |
| `AX-F12` | retained `RootOperationContext` with remembered prefix -> explicit prefix slot on every effectful invocation | prefixes A and B; one retained process plus two fresh processes | alternate A -> B -> A using identical request carriers where lawful | result always derives from explicitly named prefix and is independent of context history | retained context silently reopens remembered log; fresh context observes no such authority | precompute and hash both valid prefixes; assert requested prefix at ingress and projected prefix at outcome; do not share setup Maps |
| `AX-F13` | volatile `claimInvocation` plus continuation exception -> event-derived identity and declared repeatable read | retained process and restarted process over the same prefix | three subfixtures: retry admitted effectful ref; retry parse-valid semantic refusal ref; repeat pure read ref | admitted effect retries yield the same durable duplicate refusal; non-admitted refusal repeats identically without consuming identity; pure read repeats with identical projection | admitted effect becomes reusable after restart; failed request is consumed only in retained process; setup/read behavior follows volatile Set | prove effect admission event presence/absence per subfixture; use parse-valid requests and distinct scopes; count events before/after each attempt |
| `AX-F14` | identity-bearing source scan and current comparator -> explicit code-unit comparator | static scan plus deterministic comparator unit corpus | replace locale-sensitive ordering with code-unit ordering and permute corpus | no identity-bearing `localeCompare`; one code-unit order and digest in every environment | static scan finds default `localeCompare` before identity hashing | test comparator directly over ASCII and non-ASCII corpus; do not depend on host locale divergence; record every permitted non-identity use separately |
| `AX-PFC-F08` | current manifest generator/local catalog aggregation -> Product `PUBLIC_CATALOG_BINDING_CONTRACTS` relation | isolated extant catalog/proposal fixtures; event-store digest/count captured before and after | one success fixture plus one fixture for each of eight failure classes | success preserves retained bytes, replaces exactly 3+18 identities, emits exact diagnostic/no event; refusals carry exact attempt/class/unique issue paths and no catalog/diagnostic/event | selected relation/export is absent; generator offers no attempt/refusal ingress | validate every fixture and locator first; each refusal changes one relation only; optional dynamic load treats missing export as the target red signature while retaining a distinct immutable final oracle for every class |

Two records need explicit Gate 1 reviewer attention. `AX-F03` and
`AX-PFC-F08` begin with absence of the selected executable ingress. That
absence is the confirmed target defect, not permission for a test-side
semantic implementation. Gate 1 must either accept the missing-export
signature while freezing each distinct final oracle, or reject falsifier
constructability. Increment 0A may not create a reference implementation or
change these oracles after production repair.

## Construction Complexity

This is high but finite system-boundary work, not a 56-case Public switch:

| Load-bearing area | Current size | Main construction risk | Mechanical interceptor |
|---|---:|---|---|
| exact owner family | 56/56 concrete ports absent | semantic orchestration drifts back into Public or string/interface placeholders | exact source/export/port load ledger |
| read projection split | 24 exact cases replace six generic variants | source kinds are conflated or raw replay becomes a second authority | exact `PROJECT_READ_OWNER_PORTS` set and scoped metamorphic tests |
| authority replacement | F01/F02/F04/F06/F07/F08/F09/F12/F13 | one hidden registry, brand, implicit prefix, or raw scan survives | forbidden-symbol scans plus second-process/interleaving lanes |
| whole-Program identity | F05/F10/F14 | Validator and HoG consume different Programs or effects precede refusal | permutation and counting-leaf proof |
| static publication | PFC-F08 absent | generator recreates a rival catalog or loses refusal fidelity | exact success/eight-refusal corpus and no-event check |
| hard break | 11/19 legacy family remains installed | dual family, adapter, or legacy semantic test survives | atomic exact-set swap and forbidden-reference audit |
| package closure | broad files list, no port ledger | source exists but unexercised owner dependency is absent from tarball | installed load/resolve probe for all 56 closures |
| lawful scenario rewrite | 15 directly coupled support/test files plus transitive consumers | green tests preserve legacy meaning | exact-family scenario rewrite and independent Product proof |

The smallest vertical implementation is blocked until direct F_H authorizes
Gate 1. Once authorized, the plan must build owner meaning only at its accepted
owner, keep the exact family unreachable until the atomic swap, and audit the
forbidden legacy symbols after each vertical operation.

## Evidence Hash Ledger

Git blob identities for tracked evidence:

| File | Git blob |
|---|---|
| `public/contracts.ts` | `833d2a8a503fa3cd49977b69e0926b19cb27fc6b` |
| `public/operations.ts` | `ddf30bbd1ceb0601e07bc002e1e71b1139e8aabb` |
| `public/schema.ts` | `3b5a4fd0c64cd498cd2b20ecba5ba59d0506e55d` |
| `public/index.ts` | `bb4e14698dfeb70fcd261bd2161a4f7114352612` |
| `public/cli.ts` | `ee622745d7547772faf5292d9e604faab9e1dc3a` |
| `public/codex_cli.ts` | `115e9b66b0ca8fcd0d27903f82d3912ceea4ae65` |
| `product/root_operation_state.ts` | `81354516b6a5ef0260fe45febee717c5907a4727` |
| `scripts/generate-product-manifest.mjs` | `964e432b29ccbf06c7e8e6974b35558d66f08c28` |
| tracked `public-operation.schema.json` | `53aa479d87f73156441d3ecbf9df0be079a00a1d` |
| `package.json` | `e7237e7acab9bae8d63943577477ff196cd92825` |

The ignored generated manifest is observation only, not authority. Its
SHA-256 is recorded above so a reviewer can identify the inspected projection.

## Ambiguities Dispositioned Without Design

1. The active T-281 filename retains historical text
   `19-operation-definition-family`; live ticket title/body, requirements,
   accepted map, and arithmetic select 18 operations. The filename is residue,
   not a competing count.
2. Product and requirements establish the operation behavior and ownership
   boundary; accepted design and T-281 supply the exact 56 key spellings and
   owner coordinates. This census found no unowned key.
3. Generic legacy `status`, `result`, `replay`, `gaps`, `lawful-actions`, and
   `ticket.consensus` cannot be assigned to target reads by inference. They are
   deleted and exact owner projectors are constructed.
4. `selected_action` is accepted by T-281 and has no current branch. The
   census does not infer it from `current_intent`.
5. `catalog.view` is currently eventful but the approved law is deterministic
   and eventless. Tests must be rewritten explicitly; current behavior is not
   precedent.
6. CatalogApplication's law is settled as deterministic construction, not
   “context-scoped admission.” An independently reconstructed equal value must
   be accepted after exact revalidation.
7. Verification and resolution use complete immutable carriers. No new setup
   event path is invented by this census.
8. No donor code was considered, so there is no donor dependency proof or
   adoption candidate in this subject.

## Direct F_H Return

The exact requested next decision is:

```text
accept this unchanged census subject
  -> authorize bounded Gate 1 authority/design/map construction only

or

reject it with one cited Product, ticket, accepted-design, or method
counterexample
```

Acceptance does not authorize falsifier implementation, semantic repair,
donor adoption, legacy deletion, Gate 2, a new ticket hierarchy, or any later
milestone. Those remain held at their recorded predecessor boundaries.

Until a direct F_H ruling identifies this exact frozen subject, stop.
