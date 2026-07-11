# T-221 - Resolve The ABG 4.6 Prior-Release Boundary

- id: T-221
- title: Resolve the ABG 4.6 prior-release boundary
- type: release
- ticket_category: release_qualification
- status: completed
- goal: GOAL-034 prior-release entry gate
- owner: abiogenesis
- priority: critical
- governance_scope: STDO Method, RELEASE_METHOD
- change_class: realization_refactor
- re_entry_point: release_candidate
- created_at: 2026-07-11
- updated_at: 2026-07-11
- closed_at: 2026-07-11
- terminal_disposition: abandoned_and_rebound
- decision_ref: DEC-5.0-PROP-001
- reprice_commit: 67388b45bb9c799bd47b191764eacef0447ceb81
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
    Published 4.6.0-rc.3 is the exact immutable predecessor product. No final
    4.6.0 identity exists. F_H abandoned the final 4.6 tap and T-218 rebound
    the 5.0 bootstrap prerequisite to exact rc.3 as P4 and its exact installed
    product identity as I4. The shared workspace currently selecting 4.5.1 is
    not claimed as an rc.3 workspace binding; DS-1F owns a fresh clean I4
    selection.
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

## Terminal Disposition

`DEC-5.0-PROP-001`, recorded by goal-reprice commit
`67388b45bb9c799bd47b191764eacef0447ceb81`, selects
`abandoned_and_rebound`:

- final `4.6.0` will not be tapped;
- historical `4.6.0-rc.3` branch, tag, snapshot, tarball, note, and install
  remain immutable RC identities;
- exact rc.3 is P4, the released predecessor product for the 5.0 bootstrap;
- the exact installed rc.3 product identity is I4; and
- DS-1F creates and preserves a fresh clean workspace selection of I4 before
  bootstrap feasibility is claimed.

Path A `released_4_6_0` is `not_selected`. Path B
`abandoned_and_rebound` is `selected_complete`.

### Exact P4 identity

| Surface | Exact identity |
|---|---|
| package | `@abiogenesis/typescript-tenant@4.6.0-rc.3` |
| source candidate | `5213301cdbfd35952badf19c27519caa9e7e6968` |
| publication / tag peel | `f4f081f66ef8d3ce0c737ddb9d7530176711279a` |
| RC branch | `origin/rc/4.6.0` at `f4f081f66ef8d3ce0c737ddb9d7530176711279a` |
| annotated tag object | `v4.6.0-rc.3` at `2f546972b69e14a023baac10ca59bfa05687b955` |
| snapshot manifest SHA-256 | `941d9a00198914120db7d7a1f466f4b3e2efe0fbd9659a71540267ca0f899bf4` |
| tarball SHA-256 | `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113` |
| release-note SHA-256 | `d2201ab5e537a224e702c2db76891777ad2a50abbc19c6bcd2dfaba56c3de29a` |
| deterministic qualification | build/lint green; semantic suite `1430/1430`; snapshot checksums green |

### Exact I4 identity

| Surface | Exact identity |
|---|---|
| runtime ref | `package:@abiogenesis/typescript-tenant@4.6.0-rc.3` |
| product root | `/Users/jim/src/apps/.abg-toolchains/abiogenesis-typescript-tenant/products/abiogenesis/4.6.0-rc.3` |
| package root | `/Users/jim/src/apps/.abg-toolchains/abiogenesis-typescript-tenant/products/abiogenesis/4.6.0-rc.3/lib/node_modules/@abiogenesis/typescript-tenant` |
| product manifest | `product-toolchain-manifest.json`, SHA-256 `92b3f94dd32bca9368a9511d823cc8b6e2eae75cd7168c9e901d3cbe8eadf07d` |
| stored tarball | release tarball SHA-256 `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113` |
| command paths | `bin/abiogenesis-ts`, `bin/genesis-ts`, `bin/abg.install` under the exact product root |

This table binds an installed-product identity. It does not claim that the
mutable shared toolchain workspace currently selects rc.3.

### Final-identity absence proof

At closure:

- no local or remote `v4.6.0` tag exists;
- no local or remote `release/4.6.0` branch exists;
- no `release_snapshots/abiogenesis-typescript-tenant/4.6.0/` cut exists;
- no package metadata names exact final `4.6.0`; and
- no live release note or status surface claims final 4.6.0 was released.

### Terminal claim ledger

| Claim | Disposition | Evidence or successor |
|---|---|---|
| rc.3 deterministic T-217/T-220 substrate | `qualified_on_cut` | rc.3 manifest, note, and `1430/1430` suite |
| packed install and command topology | `qualified_on_cut` | exact I4 manifest, product roots, three command paths, matching tarball digest |
| odd_glc 0.1 consumption and Hello World over rc.3 | `qualified_on_cut` | odd_glc 0.1 release plus run `20260711T042644380Z_pid39224` |
| older rc.2 full data-mapper evidence | `predecessor_evidence_only` | not exact rc.3 or final-cut proof |
| declarations-only G5 and fresh full data mapper | `excluded_with_successor` | odd_glc T-033 and T-218 DS-6 |
| `workflow.C`, declared result/materialization/F_D/consequence closure | `excluded_with_successor` | T-218 DS-2 |
| complete public operator product | `excluded_with_successor` | T-218 DS-3 |
| ABG self-conformance and current observer/tuner self-build proof | `excluded_with_successor` | T-218 DS-4 and DS-7 |
| T-217 C-2 monolith splitting and C-6 barrel pruning | `rejected` | Non-definition-bearing cleanup with no observed trusted-desktop defect; fresh evidence requires new intake. |
| sticky sessions | `excluded_with_successor` | backlog T-110; optional post-5.0 capability |
| new Review/Consensus/GF2 composition | `deferred` | T-218 A5-GF2 re-entry trigger |
| final 4.6 product identity | `abandoned` | P4/I4 rebound to rc.3; next release target is T-218 A5-R1/DS-8 |

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

### Path A - Release 4.6.0 (`not_selected`)

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

### Path B - Abandon And Rebind (`selected_complete`)

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
  sandbox run on that binding. At that checkpoint this selected an RC
  publication, not either terminal T-221 outcome; the final `4.6.0` tap was
  still open.
- 2026-07-11: rc.3 source candidate `5213301cdbfd35952badf19c27519caa9e7e6968`
  qualified clean on `rc/4.6.0`: semantic build and lint exited zero; the full
  suite passed `1430/1430`; snapshot manifest SHA-256 is
  `941d9a00198914120db7d7a1f466f4b3e2efe0fbd9659a71540267ca0f899bf4`;
  tarball SHA-256 is
  `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113`.
  An independent install from that exact tarball resolved runtime
  `package:@abiogenesis/typescript-tenant@4.6.0-rc.3`, wrote all three command
  bindings, and passed topology verification. Publication branch/tag evidence
  is recorded by the following release-assets commit and `v4.6.0-rc.3` tag.
- 2026-07-11: published RC commit `f4f081f66ef8d3ce0c737ddb9d7530176711279a`
  is the exact `origin/rc/4.6.0` and peeled `v4.6.0-rc.3` commit and remains an
  ancestor of current `origin/main`. odd_glc repinned to that RC at `c39c711` and corrected its
  three plugin driver declarations at `d055a15`; its deterministic suite then
  passed `83/83` with eight env-gated live cases skipped. The canonical
  snapshot-installed GLC Hello World live gate converged from clean source
  `f4f081f` in run `20260711T033113388Z_pid15724`: two real Codex dispatches,
  two response admissions, two closed vectors, causal carry present, and
  stdout `Hello, world!\n`. The release tarball digest remained
  `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113`;
  the live proof digest is
  `20cb9fd65e9277ad5e8da78bae445ec714fc16ba2309d08bbb2147cc05b28dca`.
  This is RC/live compatibility evidence only. It does not tap final 4.6.0 or
  close odd_glc T-033.
- 2026-07-11: F_H selected `abandoned_and_rebound`; goal-reprice commit
  `67388b45bb9c799bd47b191764eacef0447ceb81` binds exact rc.3 as P4/I4 and
  states that final 4.6.0 will not be tapped. Remote/local ref and filesystem
  checks found no final tag, branch, snapshot, package identity, or release
  claim. Exact rc.3 checksums and I4 manifest/package/command identities were
  revalidated without rebuilding or mutating the historical cut. Path A is
  not selected; Path B is selected complete; T-221 closes.
