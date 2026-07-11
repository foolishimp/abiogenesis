# T-221 - Resolve The ABG 4.6 Prior-Release Boundary

- id: T-221
- title: Resolve the ABG 4.6 prior-release boundary
- type: release
- ticket_category: release_qualification
- status: active
- goal: GOAL-034 prior-release entry gate
- owner: abiogenesis
- priority: critical
- governance_scope: STDO Method, RELEASE_METHOD
- change_class: realization_refactor
- re_entry_point: release_candidate
- created_at: 2026-07-11
- updated_at: 2026-07-11
- release_scope: ABG TypeScript tenant 4.6.0 only
- implementation_authorization: >-
    Qualification, release-claim reconciliation, release-scoped asset updates,
    and release disposition only. No specification, design, runtime, GTL,
    compiler, traversal, plugin, handler, or downstream product work is
    authorized.
- dependencies:
  - completed T-217 capability evidence and successor map
  - completed T-220 at `014448f`
  - T-218 consumes this ticket's terminal disposition as A5-P0/A5-P1 evidence
- terminal_outcomes:
  - `released_4_6_0`
  - `abandoned_and_rebound`
- current_truth: >-
    T-217 and T-220 own completed capability and language-safety evidence. The
    source tree is beyond the 4.6.0-rc.2 snapshot, the package still names
    4.6.0-rc.2, and no final 4.6.0 cut exists. Prior RC runs and artifacts are
    predecessor evidence, not proof of a later final cut.
- target_truth: >-
    The 4.6 window has exactly one honest terminal disposition: either one
    immutable 4.6.0 cut is qualified, tapped, and recorded coherently, or F_H
    explicitly abandons the 4.6 final and the prior-release dependency is
    rebound by its goal-reprice owner without claiming 4.6.0 was released.

## Intake Triage

1. T-221 introduces no product capability. T-217 and T-220 own the delivered
   capability work.
2. The remaining boundary is release evaluation, naming, recording, and
   disposition under `RELEASE_METHOD.md`.
3. A qualification failure requiring code, specification, design, or harness
   changes opens a separately triaged ticket at its smallest lawful re-entry.
4. Abandoning 4.6 changes the work-wave dependency. T-218 or another named
   `goal_reprice` successor performs that rebind; T-221 records the release
   disposition and does not absorb the second change class.

## Boundary Ownership

| Surface | Owner |
|---|---|
| delivered capability and predecessor campaign evidence | completed T-217 |
| typed GTL/C algebra and malformed GTL/F_P defenses | completed T-220 |
| exact candidate identity, claim qualification, tap or abandonment | T-221 |
| 5.0 prior-release prerequisite rebind | T-218 or named goal-reprice successor |
| newly discovered product, requirement, design, or realization defect | new singular-class ticket |

## In Scope

- freeze the exact source commit considered for 4.6;
- reconcile every proposed 4.6 release-note claim to current-cut proof;
- classify inherited T-217 evidence as `qualified_on_cut`,
  `predecessor_evidence_only`, or `excluded_with_successor`;
- run existing build, lint, test, snapshot, install, and campaign gates required
  by retained claims;
- produce one terminal release disposition and update release-scoped assets;
- supply T-218 exact A5-P0/A5-P1 evidence or an accepted rebind.

## Out Of Scope

- new runtime behavior or hardening;
- new GTL/C algebra, semantic-compiler, plugin, handler, traversal, archive, or
  event design;
- new proof-harness architecture;
- C-2/C-6 or other hygiene refactors unless separately intake-triaged;
- new odd_glc behavior or ownership changes;
- treating a failed qualification gate as authorization to patch code here.

## Required Work

### Common Gate

1. Record the completed T-217 and T-220 commits and proof summaries.
2. Select an exact clean source commit. Because the tree moved after rc.2,
   publish a fresh RC identity or abandon the window; do not relabel rc.2.
3. Build a claim ledger covering every proposed final-note statement, including
   observer/tuner scope, installed operation, odd_glc campaign evidence, known
   residuals, and T-220 behavior.
4. Present the ledger and readiness result for F_H disposition.

### Path A - Release 4.6.0

1. Qualify one exact candidate with no source drift or mid-run law change.
2. Run `build:semantic`, `lint:semantic`, the full semantic suite, applicable
   focused proof, release snapshot, packed-install verification, and every
   existing campaign required by retained release claims.
3. Remove or narrow every release-note claim not proven on that exact
   candidate. Older campaign evidence may be lineage, not exact-cut proof.
4. Obtain the explicit F_H tap decision.
5. Set final identity, finalize the note, produce snapshot/checksums/manifest
   and install evidence, and commit the release cut.
6. Prove `release/4.6.0`, `v4.6.0`, package metadata, source commit, tarball,
   manifest, checksums, note, and installed carrier identify one cut.
7. Record `terminal_disposition: released_4_6_0` and bind T-218 A5-P0/A5-P1
   to that evidence.

### Path B - Abandon And Rebind

1. Record an explicit F_H decision that 4.6.0 will not be tapped.
2. Mark the RC window abandoned or superseded without mutating historical RC
   artifacts.
3. Prove no final 4.6.0 tag, branch, package, note, or status claim was created.
4. Route the work-wave and prior-release prerequisite change through T-218 or
   another named `goal_reprice` successor.
5. Give every still-required 4.6 claim an explicit rejection or a durable
   successor with owner, change class, re-entry point, and proof.
6. Update GOALS/T-218 so neither asserts a nonexistent 4.6 final.
7. Record `terminal_disposition: abandoned_and_rebound` with the F_H ruling,
   RC lineage, reprice commit, and successor map.

## Proof Contract

The released path requires an exact source/clean-tree record, a fully
dispositioned claim ledger, green retained gates, exact-cut campaign evidence
for every campaign claim, snapshot/tarball/checksum/install identity, a
proof-bounded final note, and one release commit/branch/tag identity.

The abandoned path requires a dated F_H ruling, exact immutable RC lineage,
proof that no final identity exists, an accepted GOALS/T-218 rebind, and a
complete successor or rejection map.

## Closure Law

Close only when exactly one terminal path is complete:

- `released_4_6_0`: one exact cut passed the retained qualification contract,
  was explicitly tapped by F_H, and every release identity and claim agrees;
- `abandoned_and_rebound`: F_H explicitly abandoned the final, no 4.6 release
  is claimed, and every prior-release dependency and retained claim has been
  lawfully rebound, rejected, or successor-owned.

Completed T-217/T-220 work alone does not constitute a 4.6 release.

## Non-Closure Conditions

- 4.6.0 is called released without an exact final commit, branch, and tag.
- rc.2 evidence is presented as proof of a later post-T-220 cut.
- A release-note claim lacks exact-cut evidence or explicit narrowing.
- Source, package, snapshot, checksums, note, branch, tag, or install identify
  different cuts.
- A qualification failure is repaired inside T-221 without new intake triage.
- Runtime, design, specification, or downstream feature work enters T-221.
- Abandonment exists only in chat/commentary while GOALS or T-218 still require
  a 4.6 final.
- A retained claim is dropped without rejection or a durable successor.
- Both terminal outcomes remain partly asserted.

## Execution Record

- 2026-07-11: opened by T-217's superseded-and-split close. No terminal path
  has been selected and no release action is authorized before the common gate
  and F_H disposition.
- 2026-07-11: F_H directed publication of a fresh `4.6.0-rc.3`, downstream
  odd_glc migration to its immutable tarball, and at least one live hello-world
  sandbox run on that binding. This selects an RC publication checkpoint, not
  either terminal T-221 outcome. The final `4.6.0` tap remains open.
