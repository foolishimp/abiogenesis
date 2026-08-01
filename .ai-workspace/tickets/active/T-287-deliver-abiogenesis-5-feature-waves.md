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
- phase_status: w1_1a_axiom_review_failed_design_reentry_pending
- review_status: w1_1a_design_rejected_axiom_matrix_required
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

### W1.1a Design Re-Entry Receipt

The bounded design candidate at `f5d5c0c0a18b631115a0a38c6462ee02c206654a`,
tree `2d0c5f4a86794ca9aabed5fdfda61e10f38f3889`, is accepted for W1.1a
planning authority.

It closes exactly:

- `ExactPrefixArtifactTruthProjection` and immutable threading across all 18
  current `hasAdmittedProductInstall` callers;
- explicit predecessor/successor-prefix threading for the three current
  artifact owners and pre-append use of the same artifact transition;
- a distinct catalog-admission authority scope with closed minimal evidence;
  and
- one store-free `ArtifactTruthTransition` shared by owner admission, Event
  Calculus projection, replay, and historical validation.

Existing synchronous single-event append ownership remains the append
mechanism. Batch framing, append leases, indeterminate reconciliation, runtime
catalog projection, full candidate embedding, catalog view/application
migration, new event kinds, and unrelated producer/result redesign remain
excluded.

The next stage is a targeted donor-delta review against this accepted design.
It authorizes no coding plan, production edit, test edit, test execution,
package change, or candidate refresh.

### W1.1a Donor-Delta Receipt

The targeted donor-delta review against accepted design `f5d5c0c0` passes.

Retain the baseline Event Store envelope validation, exclusive durable lock,
non-closing sink verification, synchronous append, reopen authority, history
validation, replay order, and Event Calculus dispatch. Transplant only the
typed fluent and held-map reducer patterns from 4.6. Rewrite rejected donor
shapes only into the accepted global-scope transition and exact-prefix
projection.

The exact constructability seam is a non-closing helper over the currently
owned Event Store. It verifies the supplied predecessor against path,
device/inode, byte length, digest, event contract, and the frozen current event
prefix while retaining exclusive append ownership. `projectReopenAuthorityAndClose`
and `reopenEventStore` cannot be used between transition and append because
they release or attempt to reacquire that ownership.

No excluded mutable-store projection, raw-history fold, Event Store collision
policy, generic metadata, operation-partitioned scope, lease, batch framing,
reconciliation, runtime-catalog projection, or catalog view/application
migration is required.

This receipt authorizes one replacement coding plan only. Production, tests,
packages, fixtures, candidate basis, and implementation commits remain held.

### W1.1a Coding-Plan Approval Receipt

The replacement coding plan at authority baseline `75f81f27` is accepted with
the constraints below.

Approved production surface:

- add narrow store-free `abg/artifact_truth.ts` transition types and reducer;
- add `abg/artifact_projection.ts` as the sole exact-prefix Event Calculus
  artifact fold and projection;
- add only generic non-closing current-prefix verification and coordinate
  mechanics to `abg/event_store.ts`;
- replace the unscoped artifact effect and extend the existing replay loop
  without a second raw-event pass;
- thread predecessor, successor, typed result, and projection through the
  three current artifact owners;
- add only the closed catalog-operation scope-evidence payload variant;
- migrate all 18 named `hasAdmittedProductInstall` readers atomically; and
- export only accepted carriers and projection functions through `./abg`.

Approved proof surface:

- AX-F04 adapter wiring only, with its relation identity, mutation, oracle,
  two-scope topology, conflicting values, and masking controls preserved
  exactly;
- one focused installed proof for two-scope coexistence, pre-append refusal,
  paired unrelated-run equality, fresh-process canonical equality,
  replay idempotence/duplicate refusal, and catalog scope reconstruction; and
- proportional existing reopen, workspace, catalog, portability, installed,
  HoG, continuation, invocation, M4/M5, and Increment 0A regression lanes.

Approval constraints:

1. The catalog owner returns a successor prefix projected after its complete
   preserved artifact-first and registry-row sequence, not the intermediate
   artifact-event prefix.
2. AX-F04 semantic evidence is exact; “where practicable” does not permit any
   oracle, mutation, mask, relation, or scenario change.
3. BUILD performs implementation plus mechanical build, syntax, diff, export,
   and package-shape checks only. Semantic, installed, falsifier, and regression
   tests remain held until the frozen candidate passes CODE REVIEW.
4. Candidate-basis values refresh exactly once after stable production and
   package bytes exist; they carry no semantic precedent.

Raw-event or mutable-store projection, Event Store artifact policy, duplicate
folds, operation-partitioned collision, metadata bags, leases, batch/framing
redesign, reconciliation, runtime-catalog projection, catalog view/application
migration, new event kinds, compatibility paths, and unrelated semantics remain
prohibited.

This approval admits one coherent BUILD candidate. It does not authorize test
execution or semantic acceptance.

### W1.1a BUILD Block And Prefix-Bootstrap Re-Entry

BUILD stopped before edits at `3b0c7181`. Live code creates an in-memory
`AbgEventStore` in `createRootOperationContext`; product install, workspace
binding, and catalog admission execute before `applyRunInvoke` first configures
a durable log. No exact durable predecessor therefore exists for the first
artifact owner, and retrospective persistence cannot prove its pre-admission
prefix.

The bounded design re-entry may decide only the missing bootstrap relation:

```text
explicit caller-supplied event-log path
  -> ABG owner-internal empty durable-store initialization
  -> verified empty DurablePrefixCoordinate
  -> first effectful owner request
```

The initializer admits no event and mints no runtime, artifact, Product, or
Public truth. It must fail closed on an existing, aliased, non-file,
unavailable, or non-exclusive target and return one closed typed result. The
caller, not `RootOperationContext`, an environment default, temporary path, or
install target, owns path selection. No new Public operation is added. The
already accepted explicit-prefix field enters the first effectful operation
and successor coordinates thread through later owners.

This re-entry does not authorize production, tests, packages, fixtures,
candidate basis, a hidden path policy, context-owned durable truth, lifecycle
repricing, or any previously excluded relation.

### W1.1a Durable-Prefix Bootstrap Design Receipt

The bounded bootstrap design at
`f6a64b51f8effc48337fb22e6c0d7a90e56e4e13`, tree
`c48149222bd2dc51326ea49fb3a9677dbb7797ee`, is accepted.

It selects one installed `./abg` owner-internal callable that exclusively
creates a caller-selected canonical absolute event-log path and returns the
existing nonserializable append owner plus one verified empty
`DurablePrefixCoordinate`. It admits no event or runtime truth. The installed
CLI requires `--event-log`; programmatic callers invoke the same bootstrap and
inject its closed result into `createRootOperationContext`. The zero-argument
context constructor is deleted with no compatibility fallback.

The first artifact owner consumes the empty prefix and each successor threads
to the next owner. Root context, environment, current directory, install root,
workspace root, temporary naming, PID, clock, and implicit conventions cannot
select or derive the path.

The next stage is a targeted donor and call-site audit covering the Event Store
creation primitive, CLI transport, context constructor, all current constructor
callers, and successor threading. It authorizes no coding plan, implementation,
tests, package changes, fixtures, or candidate refresh.

### W1.1a STDO 2.2.2 Axiom Review Reset

The prior W1.1a design PASS receipts are invalid for promotion. They remain
historical evidence only. They were issued without the accepted boundary
Ontology, entity-lifecycle completeness matrix, distinct domain/sequence/state
views, and cross-view axiom evaluation required by selected STDO v2.2.2.
The exhausted coding-plan and BUILD approvals do not revive.

The current design is rejected by this candidate-specific matrix:

| Axiom | Ontology evidence | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|---|
| `AX-W1A-01 Event Calculus sole runtime truth` | ABG event/prefix/truth entities named | ABG | artifact truth row and prefix projection named | event -> EC -> projection named | admitted/projected states partial | typed transition proposed | replay fold proposed | `fail` | W1.1a cross-view design |
| `AX-W1A-02 exact durable-prefix conservation` | predecessor/successor identities named | ABG Event Store | durable coordinate named | verify -> transition -> append named | new-prefix path only | coordinate mapping named | prefix verification named | `fail` | W1.1a design |
| `AX-W1A-03 complete episode lifecycle` | episode entity absent | unassigned for re-entry | create carrier only | new bootstrap only | create exists; reopen/use/close/re-enter incomplete | none complete | none complete | `fail` | W1.1a design |
| `AX-W1A-04 new versus existing-prefix disjointness` | lifecycle variants absent | bootstrap owner only | no closed create/reopen sum | every context routed through create | fresh-process read/response/continue/retry have no lawful reopen transition | none | none | `fail` | W1.1a design |
| `AX-W1A-05 owner continuity and replacement prohibition` | effect owner named, handoff incomplete | ABG | process owner plus prefix named | owner replacement remains implicit | replacement/leak/close states incomplete | existing lock only | no lifecycle admission | `fail` | W1.1a design |
| `AX-W1A-06 stable catalog collision identity` | catalog scope named | Product owner + ABG | ref preimage includes content-derived `bindingId` and `lockId` | derive/check sequence named | changed binding/lock lifecycle unresolved | canonical digest only | collision transition cannot prove stable domain | `fail` | W1.1a design |
| `AX-W1A-07 refusal before artifact append` | conflict transition named | ABG owner | candidate/held rows named | predecessor -> transition -> append named | refusal state named but no accepted cross-view mapping | typed refusal proposed | pre-append transition proposed | `fail` | W1.1a cross-view design |
| `AX-W1A-08 fresh-process reconstruction equality` | projection carrier named | ABG | exact-prefix projection named | reopen sequence incomplete | fresh-process equality state unreachable for current design | digest/ref fields named | no complete re-entry path | `fail` | W1.1a design |
| `AX-W1A-09 producer/consumer lifecycle closure` | three producers and 18 readers named | mixed owners | call-site census exists | create-only injection reaches wrong lifecycle branches | read/response/continue/retry branches incomplete | signatures proposed | no total lifecycle routing | `fail` | W1.1a design |
| `AX-W1A-10 alternate creation/reopen bypass closure` | Event Store creation surfaces discovered | ABG | bootstrap and `configureDurableLog` coexist | alternate creation remains reachable | bypass state remains | existing public method | no singular ingress | `fail` | W1.1a design |
| `AX-W1A-11 scope and feature conservation` | W1.1a boundary named | Product/ABG | exclusions named | no new Public operation/event | enclosing migration remains open but cross-view evidence is absent | n/a | n/a | `fail` | W1.1a cross-view design |

No row may move to `pass` from prose assertion alone. Evidence must bind the
same accepted Ontology to all three views and the exact realization projection.

The required entity-lifecycle completeness surface covers exactly:

```text
declare/select path
  -> create new empty episode | reopen existing exact prefix
  -> acquire one effect owner
  -> admit or project
  -> return successor or unchanged prefix
  -> same-process use | fresh-process handoff
  -> response | continuation | retry | read projection
  -> close owner
  -> retirement or supersession
```

The replacement design must contain distinct Mermaid domain, sequence, and
state-machine views. The sequence view must show both new-episode and
existing-prefix paths. The state view must cover creation, reopen, use,
handoff, continuation, retry, read, refusal, close, and owner-loss prevention.
Every participant, message, state, authority, and carrier must derive from the
same boundary Ontology.

Catalog identity review must classify every scope-ref preimage member as
stable, content-derived, observation-derived, or episode-local. A
content-derived member cannot silently define the stable collision domain.
The design must state whether changed immutable binding or lock content is a
new lawful scope, a same-scope collision, or an explicitly governed
supersession transition.

Promotion requires every applicable row above to be `pass`, or a reasoned
`not_applicable` compatible with Product and requirement authority. Any
`fail`, unnamed lifecycle phase, unresolved authority, or missing cross-view
mapping holds donor review, coding plan, BUILD, and tests.

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
