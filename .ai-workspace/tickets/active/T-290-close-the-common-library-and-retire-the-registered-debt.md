# T-290 - Close the Common Library and Retire the Registered Debt

- id: T-290
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-10-24
- current_method_basis: stdo://releases/v3.0.0-rc.1/
- current_method_manifest_sha256: 069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232
- current_activation: T287_COMMON_LIBRARY_DELIVERY_01 post-close repairs, then the technical debt register
- current_phase: A, close the library
- current_package: F (activated 2026-10-24); E accepted at `280f5777f`
- current_release_resumption_gate: CLOSED_until_L5_library_delivery_acceptance
- change_class: realization_refactor
- derived_change_classes: design_reframe, only for a Phase C package the owner selects
- re_entry_point: specification/GOALS.md#current-selection

## Scope

This ticket carries the work after the common computational library's close
under the [plan post](../../comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md):
the review-driven post-close repairs until L5 delivery acceptance, then the
retirement of the packages in the [technical debt register](../../TECHNICAL_DEBT_REGISTER.md).
[T-287](T-287-deliver-abiogenesis-5-feature-waves.md) owns the 5.0 delivery and
its release sequence (Phase D); this ticket owns the packages below and their
grants. The step records stay in
[stdo3-library](../../work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/);
a debt package's record is a new file there, `td-<nn>.md`, in the step record's
shape (activation, Return, disposition).

The owner's purpose stands: the calculus exists to strip out old fixtures and
remove tech debt. A package closes when the named implementation or
dependency is removed or given a concrete owner-domain retention reason, and
the affected owner obligations still execute. A renamed wrapper, a register
row, a passing type check or a baseline attribution alone does not close it.

## Rules

- One package at a time. One fresh Opus 5.5 Worker at xhigh per package,
  with a Writer grant naming its files, its stop rules and its Return
  contract. One commit per package on local `main`. Nothing is pushed in this
  repository or in `specification_methodology` until the owner says so.
- The Executive (Claude Fable 5.1) writes the activation, reads every source
  diff of the Return, runs the Executive check on the head (type check, the
  two lints, the touched lanes) and accepts or stops. A Return is verified
  against the obligation's whole path, from the entry the Product's real
  caller uses, not at the first owned function.
- Steel thread per package: the touched owner's lanes, with a negative that
  the repair discriminates. Broad suites run once at a phase close, attributed
  file by file against the previous log.
- Reviews once per phase close, not per package. Reviewers are the owner's
  Codex passes, pasted; a Fable reviewer is same-family with the Executive and
  is disclosed as such. A review's findings get a severity from the Reviewer
  and a priority and disposition from the Executive, recorded in the package
  record before any repair starts.
- A Product contract change, an event contract or payload key change, a
  failure class set change, or a design reframe is a stop; it goes to the
  owner with the Executive's recommendation and a reversal path.
- Sizes are the register's: S one owner or site, M a mechanism with its
  consumers and proofs, L needs a decision. They are not elapsed time.

## Phase A: close the library

Ends with L5 delivery acceptance, the owner's record on the delivered exact
subject after an independent review with no open S0 to S2.

| Package | Source | What lands | Size | State |
|---|---|---|---|---|
| E | fifth review S2 | The helper prints its acknowledgment for every disposition before its non-zero exit; the worker instruction treats that exit as an observation; the parent binds the acknowledgment to the artifact before it reads the disposition; the controlled worker relays the helper's stdout; final run attributed against D's log | M | accepted at `280f5777f` (step-8.md, `## Disposition of repair E`) |
| F | sixth review S2, S3 | The forward request and task constructors admit their three array inputs at ingress and validate, compare and carry the admitted values; the failure artifact's subject is bound to the next undone command, or to the next `http_response_exact` predicate once the commands are complete | M | activated 2026-10-24 (step-8.md, `## Post-close repair activation F`) |
| G | closing post, items for the owner | The three helper failure classes without a lane, `command_failed`, `http_probe_failed` and `http_cleanup_unresolved`, each driven through the installed helper into a failure artifact and an admitted failure, on E's route | M | after F |
| Restatement | sixth review S4; D15 | The closing post, the plan post's D15 row and the Ledger restated to the realized route; the reacquisition seam classified as a lane the plan broke at step 4, not baseline-red | S | Executive, with each acceptance |
| Review pass | | The owner's independent pass on G's commit, disposed as the five before it; repairs only for S0 to S2, as further lettered packages | | the owner runs it |
| L5 | T-287 dependency order | Delivery acceptance recorded by the owner; the release-resumption gate opens | | the owner |

## Phase B: the debt wave

Realization refactors that need no decision, after L5, in this order. The
first five are the order the Reviewer confirmed on 2026-10-23. Each package
record names its counterexample and its affected consumers.

| Order | Package | Retires | Proof | Size |
|---|---|---|---|---|
| 1 | TD-06 | The per-clip copy and scan of every held fluent (`abg/calculus/fold.ts:222`) | Same transitions and clipped order at cold, warm and fork cuts; an exact-clip visit counter independent of the unrelated held population | S |
| 2 | TD-07 | The full held-set copy and sort for one liveness fact (`abg/event_calculus.ts:280`, `abg/runtime_liveness.ts:840`) | The exact read matches the projection; A's at-prefix and before-event cuts and the nested-read invariant kept; a design reframe only if the owner API changes | M |
| 3 | TD-17 | The two F_P completion catches that replace the thrown error and the rejection reason with `implementation_exception` (`implementation/leaf_invocation_port.ts:766`, `:801`) | Both reach an admitted failure whose cold diagnostic names the cause and the invocation, through E's inline route | M |
| 4 | TD-13 | Two private key-set bodies (`abg/traversal_transition.ts:86`, `abg/artifact_truth.ts:169`); seven local record guards; the two `unknown` ingresses in `hog/recursion_lifecycle.ts:140` and `hog/workflow_lifecycle.ts:136` | The duplicate-key counterexample decided; the ingress premises source-linked; null and throw channels kept | M |
| 5 | TD-14 | The 55 casts outside repair C's census and the tracer gaps; the class F names, a typed array guarded by `.every`, `.some` or a `Set` over caller input | Each site typed upstream or admitted at its ingress; the universe covered stated exactly | M |
| 6 | TD-04 + TD-05 | One proof family's missing inputs, machine-bound coordinates, obsolete API assertions and copied loaders | A clean checkout reaches the family's positive and negative branches; the formerly load-failing assertions listed | M |
| 7 | TD-11 | The tool projection rebuilt and deduplicated on every worker chunk (`abg/worker_transport.ts:263`) | Chunk-split invariance, retries, disagreements and the final drain kept; old-tool visits no longer repeat | M |
| 8 | TD-08 or TD-09 | One worksite currentness path's repeated causal-support scans, or the C2 full-prefix correspondence rebuilt per read | Counted work grows with relevant additions only; isolation, withdrawal and rollback kept | M |
| 9 | TD-15, TD-16 | The three manual canonical envelopes (`abg/retry.ts:6657`, `abg/c_call.ts:7349`, `abg/replay.ts:2317`); the throwing I-JSON lifts, per caller | Byte and digest equivalence on existing persisted inputs; each caller's channel conserved | S each |
| 10 | TD-23 | The line-boundary loops, the two event-store loops first | Partition invariance and identical edge behavior with source deletion, or a concrete retention reason | M |
| 11 | TD-20 | The ticket's current surfaces compacted to one current disposition with history under exact-cut headings | GOALS, T-287, T-290 and the register agree | S |
| 12 | TD-21, TD-22, TD-24 | The inherited rows revalidated at their triggers | Each selected row closed, still open or out of scope, with its evidence link | triage |

Phase B closes with one broad run attributed against Phase A's last log and
one review pass.

## Phase C: the owner's decisions

Nothing here moves without the owner. The Reviewer's recommendations on the
first four are recorded in the register's reconciliation section.

| Item | Decision needed | Size |
|---|---|---|
| TD-12 | Contextual admitted-record acquisition: a bounded design reframe establishing the shared contract from two materially different readers | L |
| TD-10 | Full replay witnesses: the consumer census first; no persisted-contract change without its own authority | M, L if the contract changes |
| TD-18 | Held-return cold recovery: the recovery trace first; a demonstrated gap resolved before the path is claimed | M, L if a durable contract is missing |
| TD-19 | Evidence copying: stop recursive copying into new proof packages now (S); historical deletion only after a retention and deletion manifest (L) | S then L |
| D12 to D15 | Executive rulings taken without the owner, each with its reversal path in the plan post | |
| E item 2 | The one sentence added to the worker instruction (a non-zero helper exit after its acknowledgment is an observation); reversal: delete it and refresh the C2 pin | |
| F item 2 | A `predicate` member on the two HTTP failure subjects, if the Worker needs it to bind the predicate; reversal: bind through the declared request instead | |
| `sameQualificationValue` | Restore it to the `validator` barrel (one line) or drop it from the package entries | S |
| 40 tracked `build/` files | Keep tracking the regenerated outputs or untrack them | S |
| O-SCHEMA | `admitJson` inside the schema, if refusal there is wanted beyond the raw owner boundary (D10) | S |
| The calculus to liveness function cycle (F2) | Which owner holds the function | design_reframe |
| Module-test fork from a middle cut | One bounded Worker trace of the difference from the warm projection, then the owner's call | M then decision |
| 1263 untracked uat harness files | Delete or ignore | housekeeping |
| Push | Both repositories | the owner |

## Phase D: release resumption

After L5, under T-287's dependency order: the D1 and D4 comparison of the
closed source to the accepted design and Source44; D2 and D3 lifecycle work;
D5 qualification; D6 publication. This ticket does not schedule them.

## Ledger

| Date | Package | Commit | Executive check | State |
|---|---|---|---|---|
| 2026-10-24 | E | `280f5777f` | `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-worksite-command-execution` 5/5; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-calculus-fold` 7/7; `t287-common-computational-library` 9/9; tree clean | accepted |
| 2026-10-24 | F | | | activated |

Next: repair F (Worker running); then G; then the review pass on G's commit.
