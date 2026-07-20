# T-286 - Establish Installed ABI5-ROOT-001

- id: T-286
- title: Establish the installed direct-GTL ABI5-ROOT-001 steel thread
- type: feature
- ticket_category: implementation_migration
- migration_strategy: fundamental_re_adoption
- library_usage: none
- library_rationale: >-
    this is the first realization of the accepted direct-GTL boundary; RC5, X,
    and final-integration are sideways donors rather than reusable authority
- status: completed
- phase_status: m4_exact_root_complete_m5_held
- review_status: exact_subject_two_decorrelated_reviews_accepted
- proof_status: exact_candidate_root_satisfied_deterministic
- goal: GOAL-035 M4
- priority: critical
- change_intent: >-
    realize the accepted direct-GTL design as one source-independent installed
    root from packed bytes through replay-derived typed CLI outcome
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-21
- created_at: 2026-07-21
- updated_at: 2026-07-21
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- source_ticket: T-285
- predecessor: T-285
- dependencies:
  - T-285
- accepted_design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md
- accepted_design_sha256: 9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260720T141106Z_DECISION_fh_accept_t285_and_authorize_m4.md
- correction_vector_ref: >-
    .ai-workspace/comments/codex/
    20260720T023314Z_STRATEGY_t284_x_to_5_correction_vector.md
- root_binding: ABI5-ROOT-001
- root_governor: abg5.root.s01.hello_world@5
- current_frontier: root_satisfied
- implementation_branch: codex/t286-abi5-root
- implementation_worktree: /Users/jim/src/apps/abiogenesis-5-root-build
- clean_successor_commit: 9d442b4c8390c0c1e767c1bd46bd7bde282ebd99
- clean_successor_evidence: >-
    .ai-workspace/comments/codex/
    20260720T142531Z_CHECKPOINT_t286_clean_successor_boundary.md
- r1_implementation_commit: 95eef983dd58d98691488d6e06b75aa2307de1ec
- r1_evidence: >-
    .ai-workspace/comments/codex/
    20260720T144250Z_CHECKPOINT_t286_r1_exact_artifact_verified.md
- r2_implementation_commit: 6bc4fb118be4a67009c6c9eddb610e2d2d9dd17b
- r2_evidence: >-
    .ai-workspace/comments/codex/
    20260720T144908Z_CHECKPOINT_t286_r2_clean_install_complete.md
- r3_implementation_commit: e7908cdea438c0c315ab08c129e41550228e8a96
- r3_evidence: >-
    .ai-workspace/comments/codex/
    20260720T150139Z_CHECKPOINT_t286_r3_workspace_binding_complete.md
- r4_implementation_commit: abcdca7027983fd16a802ee6cd9cb2fbf0eee155
- r4_evidence: >-
    .ai-workspace/comments/codex/
    20260720T152346Z_CHECKPOINT_t286_r4_catalog_admission_complete.md
- r5_implementation_commit: 3d5ee71631379ccb45f72e61637b62d505cc42d6
- r5_evidence: >-
    .ai-workspace/comments/codex/
    20260720T153754Z_CHECKPOINT_t286_r5_invocation_admission_complete.md
- r6_implementation_commit: 2cf9201577af000f034431cda415aafaf234a63b
- r6_evidence: >-
    .ai-workspace/comments/codex/
    20260720T154533Z_CHECKPOINT_t286_r6_implementation_resolution_complete.md
- r7_implementation_commit: 9a5b1fbff70df2859568af8ea13ea750bdf2473d
- r7_evidence: >-
    .ai-workspace/comments/codex/
    20260720T155820Z_CHECKPOINT_t286_r7_execution_basis_complete.md
- r8_implementation_commit: 68aa3b10af3e1662cb3ea3706efce35bfdccd203
- r8_evidence: >-
    .ai-workspace/comments/codex/
    20260720T161155Z_CHECKPOINT_t286_r8_direct_hog_entry_complete.md
- r9_implementation_commit: 79f0e00b02992afe920bb65ac324d8b4f26e222e
- r9_evidence: >-
    .ai-workspace/comments/codex/
    20260720T164705Z_CHECKPOINT_t286_r9_causal_result_and_closure_complete.md
- r10_implementation_commit: 39a0b6bc5acccae25b091a5c167c1ac4891591db
- r10_evidence: >-
    .ai-workspace/comments/codex/
    20260720T171241Z_CHECKPOINT_t286_r10_installed_cli_root_green.md
- b8_implementation_commit: 16bca623008b76f0e0e7d619e15ff6991db3ed7e
- b8_evidence: >-
    .ai-workspace/comments/codex/
    20260720T172611Z_CHECKPOINT_t286_b8_rival_authority_refusal_complete.md
- superseded_exact_candidate_review: >-
    .ai-workspace/comments/codex/
    20260720T174114Z_REVIEW_t286_exact_candidate_changes_requested.md
- exact_candidate_implementation_commit: ffba4e71456cf19168fa2bbf2981b463e018a0cf
- exact_candidate_implementation_tree: 5c0b9ea7e4e93dbdaf79a7cf9527c4aafcda7aa3
- exact_candidate_manifest_ref: >-
    .ai-workspace/comments/codex/
    20260720T204540Z_CHECKPOINT_t286_review_repaired_exact_candidate_manifest.md
- exact_candidate_review_ref: >-
    .ai-workspace/comments/codex/
    20260720T205201Z_REVIEW_t286_review_repaired_exact_candidate_accepted.md
- closure_ref: >-
    .ai-workspace/comments/codex/
    20260720T205201Z_CLOSURE_t286_m4_installed_root_complete.md
- successor_state: m5_ready_not_opened

## Purpose

Build one installed, source-independent ABIogenesis 5.0 steel thread before any
horizontal feature work. This ticket advances the finite Product frontier
`R1 -> R10`; it does not implement the remaining 5.0 scenarios.

## Accepted Execution Relation

```text
packed Product bytes
  -> clean install and workspace/catalog binding
  -> raw-admitted and non-lowering-validated GTL.TypeScript
  -> ABG invocation and implementation admission
  -> direct HoG traversal of the admitted GraphFunction graph
  -> one declared all-F_D leaf implementation
  -> ABG C-call, evidence, result, judgment, transition, and closure events
  -> replay twice
  -> thin abg.cli typed PublicOutcome
```

## Migration Declaration

- old_truth_path: >-
    the physically present X implementation contains compiled plans, generated
    or default runtime programs, installer/CLI-authored execution basis,
    feature controllers, and parallel runtime-truth paths; none is 5.0 authority
- new_truth_path: >-
    accepted GTL declaration -> non-lowering validator -> ABG admission ->
    direct HoG traversal -> admitted leaf seam -> ABG events/replay -> thin CLI
- sideways_reference_lines:
  - `v4.6.0-rc.5` at `8d43dc8968e3df16029e6201680a0301eda035f1`
  - `origin/archive/t284-x-freeze-20260720T022230Z`
  - `origin/archive/t284-final-integration-freeze-20260720T032908Z`
  - `origin/archive/t284-final-integration-stash-rejected-t270-20260720T032908Z`
- producers_old: >-
    semantic/compiler helpers, engine and feature runners, runtime registries,
    installer/CLI bootstrap runtimes, plugin controllers, private event/result
    writers, and fixtures that authored expected state
- producers_new: >-
    src/gtl, src/validator, src/product, src/implementation, src/abg, src/hog,
    and src/public under the accepted design
- consumers_old: >-
    old package exports, SDK/CLI, generated manifests/catalogs, tests, probes,
    and feature-specific runners
- consumers_new: >-
    one installed abg.cli path, root governor, replay projection, and focused
    module tests derived from ABI5-ROOT-001
- derived_surfaces:
  - packed Product artifact and manifests
  - clean ProductInstall and WorkspaceBinding
  - AdmittedCatalog and CatalogView
  - ABG RuntimeEvent ledger and ReplayState
  - typed PublicOutcome and root-governor result
- closure_law: >-
    T-286 closes only when one exact packed candidate satisfies R1 through R10,
    replay agrees twice with the installed CLI outcome, and real-path mutations
    prove the compiled-plan, controller, private-basis, and rival-event paths
    cannot satisfy the root
- retained_compatibility: none

## Selective Donor Admission

| Cut | Admitted claims | Candidate donors | Rule |
|---|---|---|---|
| `D1` package and environment | `R1-R4` | RC5 package identity plus T-284 `RCI-04/06/07/08/11` and `XC04/14/30/34/36/38/45/46/47/48` | rewrite into `src/product` and minimal package/proof surfaces; no installer runtime crosses |
| `D2` GTL and validation | `R5-R7` declarations and static law | `RCI-02/06/08` and `XC01/02/03/05/06/38/42/46/47` | admit typed constructors and total predicates only; no compiled output type or lowering import crosses |
| `D3` direct root runtime | `R8-R10` | `RCI-03/04/06/07/08` and `XC11/13/15/16/29/30/38/41/42/43/45/46/47` | re-adopt event/replay and C interiors behind direct HoG; old runner, CLI basis, and controller entrypoints remain absent |

No donor file crosses wholesale. Every admitted interior must name its target
claim, owner, stripped authority, and focused proof in the implementing commit.
No final-integration `Y` row enters this all-F_D root.

## Check-Off Plan

| ID | Product result | Required evidence | Status |
|---|---|---|---|
| `A0` | M3 design accepted and M4 authorized | exact F_H receipt binds design SHA-256 `9faeb41d...92f0` | `[x] complete` |
| `A1` | clean successor construction boundary | isolated branch/worktree; canonical donor implementation and tests absent before new source enters | `[x] complete at 9d442b4c - 1,657 inherited product files removed before new source` |
| `B1` | `R1` exact artifacts verified | minimal package builds packed bytes; manifest and content digests verify without source imports | `[x] complete at 95eef983 - deterministic packed bytes and real payload mutation refusal` |
| `B2` | `R2` clean install complete | empty temporary consumer installs only the packed artifact | `[x] complete at 6bc4fb11 - offline script-free install and installed export proof` |
| `B3` | `R3-R4` workspace and catalog admitted | immutable ProductSet/WorkspaceBinding plus publication validation, per-row catalog dispositions, and narrowed root view | `[x] complete - R3 at e7908cde; R4 at abcdca70` |
| `B4` | `R5-R7` exact GTL target admitted | raw admission, Program/Graph validation, GraphFunction materialization, implementation resolution, and ExecutionBasis all bind the same identities | `[x] complete - R5 at 3d5ee716; R6 at 2cf92015; R7 at 9a5b1fbf` |
| `B5` | `R8` direct HoG execution entered | installed public invocation opens Run/GraphCall/Frame and reaches the declared all-F_D C locus with no compiled plan or controller | `[x] complete at 68aa3b10 - explicit scope and direct C-locus entry` |
| `B6` | `R9` causal result and closure admitted | uniform C-call spine plus `terminal_reached -> frame_closed -> graph_call_closed -> run_closed` in one ABG ledger | `[x] complete at 79f0e00b - Event Calculus, replay-derived judgment, admitted transition, exact closure, and same-spine rejection` |
| `B7` | `R10` replay and CLI agree | two independent replay folds equal the thin installed CLI typed outcome | `[x] complete at 39a0b6bc - installed abg.cli, caller-authored operation order, durable ABG log, two equal replay folds, typed Hello World outcome` |
| `B8` | rival paths cannot satisfy the root | real-path mutations for compiled plan, hidden/default program, controller, private ExecutionBasis, event bypass, and fixture-authored result | `[x] complete at ffba4e71 - twelve installed mutations exercise ingress, executor, basis, judgment, leaf, replay, and projection boundaries` |
| `B9` | M4 exact candidate accepted | clean full root rerun, focused code review, exact evidence receipt, and T-286 closure | `[x] complete - 25/25 twice, deterministic proof, two decorrelated exact-subject reviews, and closure receipt` |

Only strict advancement of the current typed frontier changes Product progress.
Prerequisite work may be reported as local readiness but does not check off the
next root row.

## Required Break Order

1. Create the isolated successor branch and worktree from the accepted authority
   checkpoint.
2. Remove canonical donor implementation, runtime tests, generated runtime
   products, and package exports from the successor construction boundary while
   preserving specification, accepted design, tickets, and donor archive refs.
3. Establish the minimal package and Product/environment source carrier.
4. Advance `R1-R4`; run the root governor after every accepted checkpoint.
5. Add GTL declarations and validator judgments; advance `R5-R7`.
6. Add direct HoG, one F_D implementation, and ABG admission/replay; advance
   `R8-R9`.
7. Add only the thin installed CLI projection; advance `R10`.
8. Run real-path rival-authority mutations, review the exact candidate, and
   close M4 before opening any horizontal Product feature.

No second break is promoted while the current frontier is regressed or
unresolved.

## Break-To-Closure Map

| Retired seam | Replacement | Closure evidence |
|---|---|---|
| compiled plan, compiled execution declaration, generated HoG program | original admitted GTL graph traversed by HoG | stale-plan and disabled-HoG mutations fail `R8-R10` |
| runtime-program catalog, hidden/default target | Product publication plus ABG-admitted exact CatalogView and InvocationAdmission | omitted or conflicting membership refuses before effects |
| installer/CLI-authored ExecutionBasis | ABG `admitExecutionBasis` over exact validation and implementation refs | installed shell cannot construct or inject a basis |
| engine, feature, SDK, CLI, plugin, or worker controller | GTL topology plus HoG traversal and fixed stateless operation application | renamed controller with matching output lacks causal spine and fails root |
| private events, result ledgers, or fixture-authored terminal state | one ABG event store plus replay-only outcome | bypass or fixture mutation cannot produce `R9` or `R10` |

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] clean successor boundary makes donor authority absent by default
- [x] admitted donor interiors carry target claim, destination, stripped authority, and proof
- [x] old truth path is removed from installed execution
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] stale tests are removed, archived, or repriced against the new path
- [x] recurring realization patterns are rechecked before local duplication
- [x] library usage and first-realization rationale are declared
- [x] ticket, Product wording, design, implementation, and proof claims agree at closure

## Closure

T-286 closes over exact implementation commit
`ffba4e71456cf19168fa2bbf2981b463e018a0cf`. The exact installed root satisfies
`R1` through `R10`; its retained evidence is deterministic; twelve real-path
mutations fail closed; and two decorrelated re-reviews report no implementation
or proof findings.

M5 remains outside this ticket and is ready but unopened.

## Non-Closure Conditions

T-286 remains open if any of the following holds:

- the root passes through a compiled plan, generated program, default target,
  feature runner, controller, or implementation-only callable;
- the installed test imports source paths or invokes a development-only shell;
- a fixture writes the success, refusal, closure, or replay state it later
  asserts;
- a CCall is missing any mandatory spine event;
- CLI output is not derived from the same replayed event ledger;
- old and new paths are both green and treated as equivalent authority;
- a donor carrier enters without a T-284 disposition and owning proof; or
- Consensus, F_P, F_H continuation, full operation migration, qualification,
  or release work expands before `ABI5-ROOT-001` is green.
