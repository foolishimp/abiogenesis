# T-287 - Deliver ABIogenesis 5.0 Feature Waves

- id: T-287
- title: Deliver ABIogenesis 5.0 as five installed feature waves
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_feature_wave_recovery
- library_usage: none
- library_rationale: >-
    ABIogenesis 5.0 is a single TypeScript build-tenant Product realization;
    immutable 4.6, accepted 5.0 commits, and rejected branches are selective
    donor evidence rather than a separate governing library
- status: active
- phase_status: w1_1a_design_reentry_pending
- review_status: wave_1_not_frozen
- proof_status: increment_0a_accepted_wave_1_green_evidence_pending
- goal: GOAL-035
- priority: critical
- change_intent: >-
    deliver the fixed 16-feature ABIogenesis 5.0 Product scope through five
    ordered installed steel-thread waves, beginning with the event-authoritative
    runtime kernel and ending with exact-candidate qualification and immutable
    release
- change_class: goal_reprice
- downstream_change_classes: realization_refactor,implementation_migration
- re_entry_point: specification/GOALS.md Wave 1 and accepted realization design
- triaged_at: 2026-08-01
- created_at: 2026-08-01
- updated_at: 2026-08-01
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- predecessor_tickets:
  - T-270
  - T-281
- dependencies:
  - T-286
- selected_method: STDO v2.2.2
- selected_method_commit: 0519129d63de10822ae6353fa0c5ce05d56f13e9
- selected_method_member_set_digest: 4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21
- selected_feature_families: A5-F01..A5-F11,A5-F13..A5-F17
- selected_product_outcome: A5-F10
- selected_product_slice: W1.1a_scoped_artifact_truth
- selected_slice_cycle_stage: design
- selected_slice_acceptance_interval: >-
    artifact event admission through installed fresh-process Event Calculus
    projection for one exact artifact authority scope
- selected_slice_exhaustion: >-
    acceptance, rejection, withdrawal, supersession, or falsification of the
    four W1.1a proof cases exhausts this slice basis; acceptance does not close
    A5-F10, W1, or the enclosing migration
- deferred_feature_family: A5-F12
- deferred_scenario: ABG5-S04
- accepted_increment_0a_commit: 1242df2a26922cc59b817a9fa253191e49a18f52
- accepted_increment_0a_tree: 7a52912d186343a342838636dfafd95911b94821
- accepted_gate_1_candidate: 3f80ba2393a9dbe31e8379a3dbbde00a961b8e23
- accepted_gate_1_tree: 04906b1c29c5d66163c62d1fffcb8bc069096244
- accepted_56_key_census_blob: efe88cac85bd3bb071d4b5dd451dfadaec893c4f
- rejected_increment_1_candidate: 4dfb6766d0ce2d97728ec615d29250ce01f78018
- rejected_18_56_donor: 935b11dd
- proof_bindings:
  - ABI5-ROOT-001
  - ABI5-M5-EXT-001

## Purpose

Replace scenario-first and gate-first work selection with direct delivery of
the 16 fixed Product feature families. The Product, requirements, and accepted
design already define WHAT and HOW. This ticket orders implementation,
selective recovery, installed proof, qualification, and release without
creating a second Product definition.

The five waves are one ticket with closure-bearing milestones. Acceptance of a
wave proves only that wave. Ticket closure requires all five waves.

## Authority

Read in this order:

1. `specification/GOALS.md`;
2. `specification/INTENT.md`;
3. `specification/PRODUCT.md`;
4. applicable requirements under `specification/requirements/`;
5. accepted M03 and M05 design surfaces;
6. this ticket; and
7. exact implementation, event, projection, scenario, and release evidence.

T-270 and T-281 are superseded historical records. They retain useful
reasoning and content-addressed evidence but no longer select S06, Increment
0A, a semantic hold, Gate 2, or Gate 3 as the current work boundary.

## Target Truth

One source-independent installed ABIogenesis 5.0 Product provides:

```text
developer-authored GTL.TypeScript
  -> raw admission
  -> complete non-lowering validation
  -> one canonical admitted Program identity
  -> exact Product, install, workspace, lock, catalog, and implementation basis
  -> direct HoG traversal
  -> F_D | F_P | F_H implementation seam
  -> ABG-admitted events and Event Calculus
  -> deterministic replay and projection
  -> one exact 18-operation/56-key Public family
  -> thin installed SDK, CLI, and bounded host projection
  -> typed outcome and independent downstream use
  -> exact qualification and immutable stable release
```

## Superseded Truth

- S06 gates are the primary delivery sequence;
- Increment 0A remains pending;
- semantic implementation and donor recovery remain held after Increment 0A;
- a review, candidate, or test count is Product progress;
- the rejected dual-Public realization may be resumed as one branch; or
- later feature delivery waits for repeated design authorization where Product,
  requirements, and accepted design already determine the outcome.

## Migration Declaration

- old_truth_path: >-
    feature delivery is selected indirectly through S03/S05/S06 scenario gates,
    repeated frozen review subjects, a legacy 11/19 Public family, and rejected
    integration candidates containing rival process-local authority
- new_truth_path: >-
    five ordered feature waves deliver one installed vertical path from the
    canonical Program through HoG, ABG events and Event Calculus, Public
    projection, downstream use, qualification, and release
- retained_compatibility: none
- producers_old: >-
    post-admission normalization helpers, process-local stores and object
    brands, global-tail currentness, dual Public dispatchers, compatibility
    facades, and feature-specific execution paths
- producers_new: >-
    raw admission and whole-Program validation, one canonical Program admission,
    Product owners, HoG structural traversal, ABG event admission and Event
    Calculus, exact owner-local Public ports, and release-law owners
- consumers_new: >-
    installed Product/catalog, HoG, replay projections, exact Public SDK and
    CLI, bounded Codex transport, independent flavored Product, qualification,
    and release proof
- derived_surfaces:
  - canonical admitted Program and validation
  - runtime events and Event Calculus projections
  - replay, continuation, retry, correction, and closure read models
  - installed Product, lock, workspace, catalog, and implementation basis
  - exact 18/56 Public family, schemas, SDK, CLI, and manifest
  - scenario, conservation, qualification, and release evidence
- closure_law: >-
    all five wave milestones are accepted on exact installed subjects; all 16
    Product feature families, selected scenarios, 4.6 conservation rows,
    qualification subjects, immutable RC, stable package, and post-publication
    install satisfy PRODUCT.md without a rival authority or compatibility path

## Fixed Delivery Order

| Wave | Feature families | Milestone state |
|---:|---|---|
| `W1` | `A5-F10`, `A5-F02`, `A5-F03`, `A5-F04` | active |
| `W2` | `A5-F01`, `A5-F09`, `A5-F05`, `A5-F06` | pending W1 |
| `W3` | `A5-F14`, `A5-F07`, `A5-F08` | pending W2 |
| `W4` | `A5-F13`, `A5-F17`, `A5-F11` | pending W3 |
| `W5` | `A5-F15`, `A5-F16` | pending W4 |

## Delivery Unit

The implementation unit is one installed vertical slice, not one entire wave,
feature family, design document, or falsifier suite.

Each slice contains only:

1. the already accepted design relation it realizes;
2. the minimum production code needed to make that relation true through its
   real installed path; and
3. the minimum positive and negative tests needed to prove the changed
   behavior and its nearest authority failure.

Design work is zero when accepted design is already decision-complete. Tests
remain proportional to the code and risk of the slice. A slice does not build
future-wave fixtures, exhaustive assurance infrastructure, or unrelated
characterization before delivering production behavior.

Every slice ends with one working installed behavior. Feature-family closure
is the accumulation of its accepted slices, not a prerequisite for accepting
the first useful behavior.

## Slice Delivery Cycle

Every slice follows this exact cycle:

```text
design
  -> donor review
  -> coding plan
  -> approval
  -> build
  -> code review
  -> test
  -> next slice
```

### 1. Design

Identify the exact Product outcome, requirements, accepted design relations,
acceptance interval, affected authority path, and prohibited substitutes. This
stage normally confirms existing design. It creates or changes design only when
the first missing constitutional layer is genuinely design.

### 2. Donor Review

Inspect the current implementation, accepted commits, rejected candidates, and
named donor branches. Classify reusable code by exact relation:

- retain unchanged;
- transplant with bounded correction;
- rewrite because authority wiring is invalid; or
- exclude.

The donor review names producers, consumers, dependencies, tests, and forbidden
authority that must not cross. It makes no production edit.

### 3. Coding Plan

Produce one file- and relation-addressed implementation plan containing:

- exact retained and changed production paths;
- complete affected producer/consumer closure;
- deletion or retirement work;
- proportional positive, negative, fresh-process, and regression proof;
- expected package or manifest effects; and
- explicit non-goals.

### W1.1a Donor-Review Receipt

Donor review completed read-only against baseline `50e8a5c7`, immutable
`v4.6.0-rc.3`, accepted Increment 0A `1242df2a`, rejected donor `935b11dd`,
and rejected donor-only subject `96b131c1`.

Disposition:

- no donor contains a promotable W1.1a implementation;
- retain the baseline event envelope, effectful owner boundaries, append-only
  store, durable reopen verification, replay fold, and indirect consumer call
  sites;
- transplant only the typed composite-fluent and ordered Event Calculus
  projection pattern from 4.6, corrected to the accepted 5.0 coordinates;
- preserve AX-F04 relation, mutation, oracle, and masking controls unchanged;
- exclude `96b131c1` raw-event folding, mutable-store projection, generic
  metadata, catalog view/application expansion, weakened proof, and refreshed
  candidate values; and
- exclude `935b11dd` dual-Public and compatibility authority.

The collision domain is the stable `authorityScopeRef`. Reuse of that scope
reference with another authority-scope digest, definition digest, artifact
reference, or artifact digest refuses before append. Operation or definition
partitioning cannot mask the conflict. Distinct stable scope references may
coexist.

The accepted `DurablePrefixCoordinate` is decision-complete for the coding
plan: `eventLogRef`, `prefixLength`, `prefixDigest`, and `storeIdentity` name
one immutable append-only prefix and ABG verifies all four before projection.
The plan must map these fields explicitly onto the existing durable reopen
authority and reopened context, project only that verified prefix through
Event Calculus, and never query mutable live-store truth.

This receipt authorizes the coding-plan stage only. It authorizes no production
edit, test edit, test execution, candidate refresh, or implementation commit.

### W1.1a Coding-Plan Rejection And Design Re-Entry

The first coding plan was rejected before implementation. A replacement plan
could not lawfully close three missing realization relations:

1. `hasAdmittedProductInstall` has 18 mutable-store callers. Accepted design
   does not yet name the immutable projection carrier threaded through every
   HoG, Public, continuation, catalog, support, and falsifier caller.
2. Current catalog admission reuses the workspace-binding scope, which
   conflicts with global stable-scope collision law. `candidateId` is already
   the artifact reference; no accepted surface selects it or another identity
   as the distinct catalog authority scope.
3. Accepted design does not yet freeze one typed Event Calculus artifact
   transition shared by owner admission, replay, and historical validation.
   Without it, a coding plan can recreate independent raw-history folds.

The bounded `design_reframe` may decide only:

- the immutable exact-prefix artifact projection carrier and its atomic
  migration across all 18 callers;
- the distinct catalog-admission authority-scope ref, digest preimage, owner,
  artifact relationship, causation, collision, and reconstruction law; and
- one store-free typed artifact transition over Event Calculus-held state,
  including inputs, outputs, refusal fields, and dependency direction for
  admission, replay, and historical validation.

All donor exclusions, W1.1a proof obligations, Product scope, requirements,
event-kind census, Public family, and non-goals remain frozen. This re-entry
authorizes design construction only. Production, test, package, fixture,
candidate-basis, and semantic tracking edits remain prohibited.

### 4. Approval

Product control accepts, rejects, or narrows the coding plan. Approval admits
only that slice and exhausts when the slice is accepted, rejected, withdrawn,
superseded, or falsified. No production edit begins before approval.

### 5. Build

The worker implements the approved plan as one coherent production slice,
performs mechanical checks, and freezes one exact candidate. It does not issue
its own semantic acceptance verdict.

### 6. Code Review

Assurance reviews the frozen diff from function level through module and global
authority closure. It checks design conformance, donor leakage, complete
producer/consumer migration, prohibited paths, and whether the code delivers
the approved behavior. A rejection may authorize at most one consolidated
local repair; a different construction returns to coding-plan approval.

### 7. Test

After code review passes, execute the approved proportional tests against the
exact reviewed candidate. Tests prove the installed behavior and nearest
invalid substitutes; they do not author semantics or compensate for failed
code review. Deterministic tests reproduce on the exact subject.

### 8. Next Slice

Record the accepted slice identity and evidence, keep the enclosing feature and
migration open unless their own closure laws are satisfied, then select the
next unresolved Product slice through the same cycle.

Exploratory code produced before coding-plan approval is unapproved donor
material. It may inform donor review but cannot be promoted, committed, or
treated as the selected implementation.

## W1 - Runtime Kernel

### W1 Outcome

Deliver one installed kernel with one canonical admitted Program, direct HoG
execution, ABG-only event admission, Event Calculus runtime truth,
fresh-process reconstruction, deterministic replay, and fail-closed
probabilistic result admission.

### W1 Baseline

- build the replacement from accepted Increment 0A `1242df2a`;
- preserve rejected `4dfb6766` as evidence, not a repair base;
- retain immutable 4.6 event, Event Calculus, replay, and installed runtime law;
- recover later accepted 5.0 behavior and rejected donor code only by exact
  conforming relation;
- preserve all 15 Increment 0A relation identities, mutations, oracles, masking
  controls, and AX-F07 preservation meaning; and
- do not merge or cherry-pick a complete rejected realization.

### W1.1 - A5-F10 Event-Sourced Runtime Truth

Retain event admission, Event Calculus, replay, invocation/frame/C-call/result/
judgment lineage, correction, retry, recursive child traversal, gap re-entry,
human continuation, typed refusal, closure, persistence, and projection.

Repair only the remaining rival-authority relations:

1. scope every Event Calculus fluent by complete authority coordinates;
2. select the latest applicable event within the explicit durable prefix and
   run scope instead of consulting the global store tail;
3. persist the verified executable preimage required for retry reconstruction;
4. derive invocation and retry uniqueness from admitted event history;
5. remove required process-local `WeakMap`, `WeakSet`, mutable pending state,
   and object-brand authority; and
6. retain continuation and run projections strictly as reconstructive read
   models.

Required proof:

- cross-scope coexistence and same-scope collision refusal;
- unrelated-run interleaving invariance;
- fresh-process outcome, continuation, and retry reconstruction;
- two failures, restart, and exact attempt-three input;
- duplicate invocation equivalence before and after restart; and
- preservation of correction, recursion, continuation, refusal, replay, and
  closure behavior.

Exit: deleting process memory cannot change an admitted runtime decision or
projected outcome.

#### W1.1a - Scoped Artifact Truth

This is the first selected delivery slice.

Accepted relation:

```text
explicit durable prefix
  + artifact authority scope
  + artifact digest
  + ABG artifact events
  + Event Calculus
  -> one reconstructed artifact truth
```

Production change:

- key the artifact fluent by its complete authority scope and artifact digest;
- allow distinct scopes to retain independent admitted artifact truth;
- refuse conflicting truth within the same scope;
- make the installed consumer read the Event Calculus projection from the
  explicit durable prefix; and
- introduce no new event family, Public operation, process-local registry, or
  downstream normalization helper.

Affected-path migration:

- change the authoritative artifact fluent relation first;
- audit every event producer, Event Calculus consumer, resolver, projection,
  fallback, cache, and proof surface that can admit, interpret, or close
  artifact truth within this scope;
- migrate that complete affected path to the scoped relation;
- prohibit the former unscoped fluent from remaining authoritative anywhere
  on the W1.1a acceptance path; and
- keep unrelated, deterministically routed Product scopes outside W1.1a
  unchanged.

Proportional proof:

- one positive installed case for two distinct scopes;
- one negative installed case for a same-scope digest collision;
- one unrelated-run interleaving case; and
- one fresh-process reconstruction of the same projection.

The slice closes when those four cases pass through production admission,
events, Event Calculus, and installed projection while the relevant existing
artifact/install/catalog regressions remain green. No other A5-F10 repair is
required for W1.1a acceptance. W1.1a acceptance is bounded Product-slice
promotion only: T-287 remains active, the A5-F10 milestone remains open, and
complete migration closure remains pending.

### W1.2 - A5-F02 Complete GTL Authoring And Validation

Construct one identity boundary:

```text
raw carrier
  -> raw structural admission
  -> complete semantic validation
  -> canonical normalization
  -> one immutable admitted Program
  -> one admitted Program identity
```

Validate unique nodes; exact starts and non-empty terminals; edge endpoints;
term-specific outdegree; start and terminal reachability; bounded declared
re-entry; exact callable, contract, closure-contract, and implementation
membership; duplicate semantic identity refusal; and explicit Unicode
code-unit ordering for semantic sets.

Validator, Product, ABG, and HoG consume or verify the admitted identity. They
must not independently normalize or re-digest the publication after admission.

Required proof:

- transport-order permutations produce one identity;
- invalid topology and duplicates refuse before events or effects;
- raw and admitted identities remain distinct;
- fresh-process load preserves the admitted identity; and
- lawful composition, batch, workflow, gate, retry, recursion, substitution,
  and fan-out remain valid.

Exit: every valid semantic permutation admits one identity and every invalid
whole-Program topology refuses before runtime admission.

### W1.3 - A5-F03 Complete Graph, C, And Traversal Execution

Retain all seven C constructors, graph materialization, direct HoG traversal,
gate selection, fan-out/fan-in, retry, recursive child traversal,
continuation/foldback, and `F_D | F_P | F_H` separation.

Every execution follows:

```text
admitted Program
  -> selected GraphFunction
  -> materialized graph and execution basis
  -> HoG structural step
  -> selected leaf implementation
  -> ABG-admitted result
  -> Event Calculus transition
  -> replay-derived continuation or closure
```

Execute the retained traversal-conservation implementation matrix and preserve
each C call's locus, fibre, contracts, evidence, result, judgment, lineage,
retry/recursion basis, and projected outcome. No compiled plan, generated
executable Program, feature runner, or test-only executor may substitute.

Exit: every retained row executes through one installed HoG/ABG path and two
independent replays agree.

### W1.4 - A5-F04 Probabilistic Result Integrity

Before dispatch, bind instructions, roles, input/output/refusal contracts,
evidence and attribution requirements, admitted model/tool authority, retry
classification, locus, C-call identity, and causation basis.

After dispatch, raw-admit and validate shape, fields, contract identity,
evidence, attribution, contradictions, result identity, and failure class.
Malformed output cannot become result, judgment, continuation, retry,
correction, or closure truth.

Required proof refuses malformed, incomplete, wrong-contract, unattributed,
contradictory, forged, stale, and undeclared-retry output before consequential
effects. A valid live or governed result must survive fresh-process replay
without redispatch, and retry must use the verified persisted preimage.

Exit: valid probabilistic results join the causal episode and invalid results
cannot alter runtime state.

### W1 Installed Proof

Freeze one clean commit, tree, package, and manifest after W1.1 through W1.4
integrate. From two separate clean installations run:

- build and type checks;
- exact Increment 0A relations;
- fresh-process, interleaving, collision, and retry-reconstruction lanes;
- whole-Program topology and identity validation;
- complete traversal-conservation implementation coverage;
- probabilistic integrity positives and negatives;
- packed deterministic Hello World and one live or governed probabilistic path;
- replay and projection agreement; and
- `ABI5-ROOT-001` and `ABI5-M5-EXT-001` regression bindings.

W1 closes only when the installed subject proves one canonical Program, one
HoG path, one ABG event authority, one Event Calculus state, deterministic
fresh-process replay, and fail-closed probabilistic admission.

## W2 - Installed Product And Public Boundary

W2 contains:

1. `A5-F01` exact Product/install/workspace/catalog;
2. `A5-F09` catalog semantics;
3. `A5-F05` one Public contract authority and the atomic exact 18/56 swap; and
4. `A5-F06` thin SDK and CLI.

The exact accepted census remains 18 operations, 32 non-read keys, 24
`project.read` keys, and 56 total definition keys. One operation-indexed source
must project native types, parser, JSON Schema, SDK, CLI, runtime, publication,
catalog, replay, and owner bindings. Every installed key resolves one concrete
owner-local port and all required owner modules and direct dependencies ship.

The legacy Public family is disconnected and deleted in the same cut that
makes the exact replacement reachable. No dual family, compatibility facade,
semantic switch, `RootOperationState`, Public controller, rival catalog, or
process-local runtime authority may remain.

Lawful contracts, schemas, owner ports, projections, fixtures, and installed
tests may be recovered selectively from donor `935b11dd`. Its authority wiring
does not cross.

## W3 - Product Behavior

W3 contains:

1. `A5-F14` packed Hello World and live probabilistic proof;
2. `A5-F07` complete One Surface loop; and
3. `A5-F08` Consensus through ordinary GTL, HoG, and ABG composition.

All three use the same installed W2 Public path. No scenario-specific runtime,
controller, copied semantics, or fixture-authored truth may enter.

## W4 - External Confidence

W4 contains:

1. `A5-F13` native and bounded host projection;
2. `A5-F17` independent downstream portability sufficient for the `odd_glc`
   contract class; and
3. `A5-F11` self-conformance against the exact installed candidate.

The Codex projection is process transport over the installed Public contract.
The independent flavored Product owns its namespace, declarations, semantics,
and implementations; it imports installed public exports only and owns no
runtime or controller.

## W5 - Qualification And Release

W5 contains:

1. `A5-F15` exact-candidate qualification across distinct pre-RC, installed-RC,
   and final-tap subjects; and
2. `A5-F16` immutable RC, governed final-only delta, stable tag/package,
   checksums, and fresh post-publication install.

W5 also closes selected-method binding, five pre-RC scenarios, self-conformance,
and the complete immutable 4.6 conservation reconciliation.

## Evaluation Criteria

- the active feature works through one installed vertical path;
- its invalid substitutes fail through the production boundary before
  unauthorized effects;
- fresh-process or reconstructed-carrier proof covers every durable authority
  claim;
- retained behavior remains green;
- donor code is admitted by exact relation with no donor authority leakage;
- deterministic evidence reproduces on the exact candidate; and
- accepted milestone evidence names its commit, tree, package, manifest, and
  relevant relation digests.

## Non-Closure Conditions

This ticket does not close if:

- any Product feature family is missing or silently deferred;
- a feature is represented only by design, red characterization, local tests,
  or donor code;
- process memory, object identity, global store position, a caller, SDK, CLI,
  fixture, worker, or plugin is required to author runtime truth;
- normalization or re-digestion after admission creates a rival identity;
- HoG executes a lowered or feature-specific program;
- the legacy and replacement Public families are both reachable;
- any of the 56 definition keys lacks its installed owner closure;
- an independent consumer requires source-tree or private-runtime knowledge;
- qualification or release conflates candidate, RC, final-tap, or published
  subjects; or
- A5-F12/ABG5-S04 enters the 5.0 cut.

## Required Break Order

1. Preserve rejected implementation as recoverable evidence.
2. Deliver W1 inside-out from admitted runtime truth through validation,
   traversal, and probabilistic admission.
3. Deliver W2 from Product/catalog owners through the atomic Public swap and
   projections.
4. Deliver W3 behavior through the installed W2 path.
5. Deliver W4 external and self-conformance proof against the same candidate.
6. Deliver W5 qualification and immutable release without reopening feature
   semantics.

## Work And Review Rule

The worker owns local HOW already bounded by Product, requirements, accepted
design, and the selected wave. It implements one coherent increment, runs
mechanical readiness checks, freezes one exact subject, and stops.

Assurance checks the frozen subject for counterexamples, scope drift, rival
authority, donor leakage, and proof validity. It does not author a replacement
implementation during review. At most one consolidated local repair follows a
rejected subject. Product, requirement, 18/56-family, or materially different
authority changes require lawful re-entry; local callable names, carrier
shapes, helper placement, and algorithms do not.

## Closure Checklist

- [x] Product scope fixed at 16 selected feature families.
- [x] Feature-wave order selected in GOAL-035.
- [x] Increment 0A accepted at `1242df2a`.
- [x] Rejected Increment 1 and dual-Public donor preserved as evidence.
- [ ] W1 runtime kernel accepted on one installed subject.
- [ ] W2 installed Product/catalog and atomic 18/56 Public boundary accepted.
- [ ] W3 packed minimal, One Surface, and Consensus behavior accepted.
- [ ] W4 bounded host, downstream portability, and self-conformance accepted.
- [ ] W5 exact qualification and immutable stable release accepted.
