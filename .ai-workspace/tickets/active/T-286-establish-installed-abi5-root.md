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
- status: active
- phase_status: m4_clean_successor_boundary_in_progress
- review_status: implementation_review_pending
- proof_status: root_red_at_r1
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
- current_frontier: R1_exact_artifacts_verified
- implementation_branch: codex/t286-abi5-root
- implementation_worktree: /Users/jim/src/apps/abiogenesis-5-root-build

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
| `A1` | clean successor construction boundary | isolated branch/worktree; canonical donor implementation and tests absent before new source enters | `[-] in progress - worktree created; donor removal pending` |
| `B1` | `R1` exact artifacts verified | minimal package builds packed bytes; manifest and content digests verify without source imports | `[ ] pending` |
| `B2` | `R2` clean install complete | empty temporary consumer installs only the packed artifact | `[ ] pending` |
| `B3` | `R3-R4` workspace and catalog admitted | immutable ProductSet/WorkspaceBinding plus publication validation, per-row catalog dispositions, and narrowed root view | `[ ] pending` |
| `B4` | `R5-R7` exact GTL target admitted | raw admission, Program/Graph validation, GraphFunction materialization, implementation resolution, and ExecutionBasis all bind the same identities | `[ ] pending` |
| `B5` | `R8` direct HoG execution entered | installed public invocation opens Run/GraphCall/Frame and reaches the declared all-F_D C locus with no compiled plan or controller | `[ ] pending` |
| `B6` | `R9` causal result and closure admitted | uniform C-call spine plus `terminal_reached -> frame_closed -> graph_call_closed -> run_closed` in one ABG ledger | `[ ] pending` |
| `B7` | `R10` replay and CLI agree | two independent replay folds equal the thin installed CLI typed outcome | `[ ] pending` |
| `B8` | rival paths cannot satisfy the root | real-path mutations for compiled plan, hidden/default program, controller, private ExecutionBasis, event bypass, and fixture-authored result | `[ ] pending` |
| `B9` | M4 exact candidate accepted | clean full root rerun, focused code review, exact evidence receipt, and T-286 closure | `[ ] pending` |

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
- [ ] clean successor boundary makes donor authority absent by default
- [ ] admitted donor interiors carry target claim, destination, stripped authority, and proof
- [ ] old truth path is removed from installed execution
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] stale tests are removed, archived, or repriced against the new path
- [ ] recurring realization patterns are rechecked before local duplication
- [x] library usage and first-realization rationale are declared
- [ ] ticket, Product wording, design, implementation, and proof claims agree at closure

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
