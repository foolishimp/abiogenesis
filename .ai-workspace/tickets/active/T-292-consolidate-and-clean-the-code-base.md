# T-292 - Consolidate and Clean the Code Base

- id: T-292
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-11-12
- current_activation: T292_CONSOLIDATION_01
- current_package: TD-25 residue, TD-34 first part and TD-37 second part (source), TD-69 remainder and the TD-60 triage (tests), TD-46 attribution, in flight
- change_class: realization_refactor
- derived_change_classes: design_reframe, requirement_reprice and product_reprice, each only for a register entry the owner decides
- re_entry_point: specification/GOALS.md, the selection block of 2026-11-12

## Scope

Owner, 2026-11-12: "our next major effort before adding new features to
consolidate and clean the code base of tech debt, failed and redundant
features, and performance improvements", and then: "i authorise the work".

This ticket carries that wave. Its work list is the second edition of the
[technical debt register](../../TECHNICAL_DEBT_REGISTER.md): entries TD-25 to
TD-74, and TD-19 from the first edition. The register came from a full
walk-through of the source, tests, scripts, design notes, specification and
repository; its method, limits and sources are in the register and under
[TECH_DEBT_REGISTER_02](../../work/TECH_DEBT_REGISTER_02/).

[T-287](T-287-deliver-abiogenesis-5-feature-waves.md) keeps the 5.0 delivery.
No new feature work starts there while this wave runs, unless the owner says
otherwise.

A package closes when the named implementation is removed, or consolidated
into the owner the register names, and the affected obligations still execute.
A renamed wrapper, a register row, a passing type check or a baseline
attribution alone does not close it.

## Rules

- The Executive (Claude Fable 5.2) decomposes, rules and reviews. It writes
  records, not source.
- One Writer (Claude Opus 5.5 at xhigh) per package, with a grant naming its
  entry, its stop conditions and its Return.
- Each package runs in a sparse worktree created from local `main`. At
  acceptance its branch is merged back to local `main` and the worktree is
  deleted (owner rule, 2026-11-11).
- Nothing is pushed. Pins are refreshed per package. A cut is made only at a
  checkpoint the owner selects.
- Source packages that touch disjoint files may run side by side (from
  2026-11-12, after TD-36). Their Writers commit authored changes only. At
  each merge the Executive rebuilds on `main` and commits the regenerated
  manifest, capability graph and contracts; these are outputs of the tenant's
  build, not authored source. Each package's new lanes are rerun on `main`
  after the merge that follows another package's.
- A register entry marked Decision waits for the owner's word. The Executive
  rules the rest from recorded rules and states the rule.
- A package stops and returns to the Executive if it would change the bytes of
  a recorded Run's replay, the Public contract, or the truth of a requirement.
- Independent review (Claude Opus 5.5 at max) at each group close, over every
  package of the group that touches replay digests or the Public contract
  (owner rule of 2026-10-22: reviews once at the close). The first group is
  the entries that carry defects, TD-34 to TD-37, with TD-31.
- One Return per package under
  [T292_CONSOLIDATION_01](../../work/T292_CONSOLIDATION_01/). One ledger line
  per package below.

## Sequence

1. Make the clean-up cheap: a deterministic product identity (TD-69), a suite
   that runs by one command with one install per test file (TD-57, TD-58), the
   coverage census as a tenant script (TD-46), the cut procedure in the tenant
   (TD-71).
2. Take the owner decisions in one sitting (the register's decisions table).
3. Remove what the decisions release, largest first.
4. One owner per rule, starting with the entries that carry defects or
   correctness risk (TD-34, TD-35, TD-36, TD-37).
5. Performance, measured costs first (TD-50 to TD-56).
6. Design, requirements and repository (TD-64, TD-65, TD-70, TD-72 to TD-74,
   TD-19).

## Ledger

| Package | Register entry | Subject | Disposition | Evidence | Carried forward |
|---|---|---|---|---|---|
| TD-69 | The product's identity depends on npm's private state | `claude/td69-payload-rule` `59fbaf8a0..6d4ff287c`, merged at `5e326fd41` | Accepted 2026-11-12 after Executive diff review and rerun | Build leaves no tracked change in both hidden-lockfile states and on `main`: 5,325 locators, `sha256:dcfbcf42…`, archive `sha256:db80a5da…`; new `t292-product-payload-rule` 1/1; Writer: `test:r1`, `test:r2`, the W2-05 generator test and six other pack consumers pass | The cut script outside the tenant must pack through `scripts/product-payload.mjs` (TD-71). `m5-s06-prime` and three pack consumers were not rerun. A sparse worktree needs `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/` for the default-library tests, which read their seed from there (TD-61) |
| TD-35 | Start law has two owners, and a `graph_function` start bypasses root mode | `claude/td35-start-law` `7928c58cc..d74f03044`, merged at `32e60ae65` | Accepted 2026-11-12 after Executive diff review and rerun | New lanes red on the old build and green after (`t287-st1-installed-cross-owner-hello` 3/3, `t287-c2-child-program` 4/4, Executive rerun); `r1` 1/1 on the refreshed basis; Writer: 18 files and the lints pass, `resolveProgramStart` unchanged over a 16,128-case grid | Every source change moves `productContentDigest` (here `dcfbcf42…` to `8dd660a1…`), the manifest, the capability graph and the candidate basis: each source package regenerates and commits them, so source packages run one at a time. `lint:evidence` cannot run in a sparse worktree |
| TD-36 | Workspace-binding identity and the admitted-row check are copied and have diverged | `claude/td36-binding-identity` `0f77e3976..cfec62082`, merged at `0269c244f` | Accepted 2026-11-12 as a first part. The Writer stopped at the size bound (729 changed source lines against about 500); ruling: accept as one package, since it is mostly deletion with lanes on both builds | Two new files 8/8, red on the old build for the extra-key lanes; 19 caller files 190 tests, 157 pass, 0 fail, 33 gated skips; `r1`, `r2` pass; three import lints pass. Executive rerun with `ABI5_EVIDENCE_ROOT` set: 12 of the 33 skipped lanes run against recorded inputs and pass (`d2-binding-transition` 10/10, `t287-native-semantic-revision` 7/7) | Follow-up package for the five copies the reviews had not named. 18 lanes stay gated by variables with no recorded value (TD-60). Evidence-gated lanes run from a sparse worktree with `ABI5_EVIDENCE_ROOT=<main checkout>/.ai-workspace` |
| TD-36, follow-up | Workspace-binding identity and the admitted-row check are copied and have diverged | `claude/td36-remaining-copies` `aaf02dcbb..b4696f429`, merged at `52afade26`; the three generated files conflicted with the TD-47 regeneration and were rebuilt on `main` in the merge | Accepted 2026-11-12 after Executive diff review and rerun. The Executive first ruled that the candidate string predicate stay unchanged, then, on the Writer's evidence that bind admitted what every consumer refused, ruled the door closed (TD-36 and TD-34 rules) | Source +32, -40 over five files. Lanes red on the old build at each tightened assertion: extra key through `hasAdmittedWorkspaceBinding`, unequal `workspaceId`, a `resume` grant, a symbol member and a lone surrogate in an implementation set, and three padded or NUL binds. Recorded history: 3,366 admitted bindings and 3,370 candidates, none refused by the new door. Writer: 34 caller files rerun, 0 failures outside two files that fail at the base for missing inputs (TD-59). Rerun on `main` after the merge, on the tree that also holds TD-47: the three new files 13/13, `t292-workspace-binding-extra-key` 3/3, `t292-binding-row-owner-differential` 5/5, `r1`, `r2`, `r3` and `t287-continuation-causation` pass; no tracked change | The helper-process copy goes with TD-37. This package narrows a Public admission, so it is in the first group's independent review. No lane was seen to reach the F_H hold's binding check (TD-46) |
| TD-64, second part | The design directory is mostly history | `claude/td64r-design-repair` `39d6cb975..914070c1a`, merged at `862c96082` | Accepted 2026-11-12 after the Executive read the rulings' outcomes and the rewritten typed-recurse sections, and checked that the diff is design files only | 28 sections cut verbatim from 18 notes (script-checked against the original ranges); five notes restated with rule-to-source tables; live design 36,144 lines. Link check: 475 links with 42 dangling to 491 with 39, none new | Third part: the constitution's superseded sections (1,912 lines) under its own amendment rule. TD-75: the terminal-quiescence note and the realized rule differ. The Event Calculus axioms have no named lane (TD-57). 23 kept files changed bytes; the inventory and recipe wait for TD-63 |
| TD-31 | The STDO-only environment evidence and the old run-environment shape | `claude/td31-stdo-environment-shape` `84d4f6d8c..5487a4c50`, merged at `73e6bdba1`; identity regenerated by the Executive at `72ac59366` | Accepted 2026-11-12 after Executive diff review, rebuild and rerun. The first Writer stopped at the Executive's check that no door admits the member; the Executive ruled that the check covers the publications resolution raw-admits and recorded the wider gap under TD-34; a second Writer finished | Source +31, -378; tests -1,806. Step 1 byte-identical in declarations and schemas. Door probe on the final build identical to the measured patch. The generated schema loses exactly three properties (checked by the Executive by JSON comparison). Writer after-runs: 126 tests, 107 pass, 0 fail, 19 skips, no lane from pass to fail. Rerun on `main`, on the tree that also holds TD-59: the new lane 3/3, `t287-gtl-serialization-publication` 9/9, `t287-management-context` 12 pass and 2 skips, `t287-stdo3-run-environment` 5/5, `m5-c-algebra-validation` 19 pass and 3 skips, `r1` to `r3` pass | In the first group's independent review (Public contract). `t287-stdo-run-environment-installed.mjs` is a tombstone-only file (TD-62). Six gated cases were edited or retired without a run, because their gates have no input |
| TD-59, first part | The fourteen failures at the release base, and the r1 to r3 basis | `claude/td59-failures-at-base` `4108746ba..55d7efc15`, merged at `03a845e69` | Accepted 2026-11-12 after the Executive read the changed assertions and reran. Two cases stay red by the Executive's ruling that a real defect is not hidden | 89 tests in the six files and r1 to r3: 14 failures before, 2 after; with the root set, 85 pass and 2 skip. Nothing outside `test_env` changed. Rerun on `main` in each mode: the same counts for every file except one case. `r1` to `r3` pass under both basis sources; `t287-calculus-fold` 25/25 with the root and 23 with 2 skips without; `t287-route-reconstruction` 11 with 2 skips and 10 with 3; `t287-framework-handoff-types` 6/6; the six retained single-address-space cases pass with the root. The exception: that file's "maintained SDK setup" case fails on `main` in both modes, and its summary case with it, because the test packs the tenant with `npm pack` itself (the TD-69 remainder, not this package) | `witness-reprice` waits for the profile-upgrade double read (TD-51). The GC03 lane gets a second skip condition with TD-60, and its finding is recorded under TD-28. The root harness still requires the committed basis file to exist. Two commit messages overstate (`54180fa4e`, `7366d6390`); the Return has the true figures |
| TD-64, third part | The design directory is mostly history | `claude/td64c-constitution-history` `675b5e90f..9d18e8f01`, merged at `e2761f572` | Accepted 2026-11-12 after the Executive read the pointers and record 16.16 and checked the diff is design files only. The first Writer stopped before cutting: section 5.6.3, classed historical by the section map, holds catalog rows that the common-library design and amendment record 16.14 use. The Executive ruled that 5.6.3 stays whole and the other five sections move; a second Writer cut | 1,265 lines moved verbatim; the constitution 4,456 to 3,251 lines; a script confirms the retired file holds exactly the original ranges and the constitution equals the original minus them plus five pointers and record 16.16; 932 anchor links into the constitution resolve; no new dangling link | The banner of 5.6.3 and line 681 are stale and are left for the next amendment. The constitution's digest in the inventory was stale before and after (TD-63) |
| TD-37, first part | Worksite filesystem and authority rules are written several times | `claude/td37a-path-confinement` `52afade26..36a6533e6`, merged at `6bda7c498`; identity regenerated by the Executive at `2a2c07894` | Accepted 2026-11-12 after Executive diff review, rebuild and rerun. Built twice. The Executive's first ruling ("the strictest rule wins", from the register's own text) made a worksite that merely holds a top-level `..x` entry unobservable; the first Writer reported that reach, the Executive read the ratified worksite design, which states descent as the law, withdrew the ruling and had a second Writer rework the package to the segment-exact rule | One owner, three classes, two predicates; 46 sites call it; source +118, -100 over 20 files; no `startsWith("..")` left in `code/src`. Sixteen sites change verdict on POSIX, only for a dotted first segment that does not escape: admitted at 13, flagged at 3. The six changed subject tests are red on the base build. All 32 existing lanes keep their counts (Writer). Recorded history: no path with a dotted first segment. Rerun on `main`, on the tree that also holds TD-31: the two new files 22/22, `t287-worksite-command-execution` 12/12, `t287-observed-worksite-command` 8/8, `t287-native-workspace-work` 43 with 1 skip, `t287-generic-job-worksite` 9/9, `t287-post-binding-worksite-write` 2/2, `t287-wave2-installed-product-verification` 2/2, `r1` to `r3`, and the TD-36 and TD-31 lanes pass | Second part: launch identity and the helper's binding copy. Third part: one tree walker and one leaf-authority gate. In the first group's independent review (worksite verdicts change). The win32 cells are by construction, not by run. No installed lane runs a subject under `..x/` end to end |
| TD-60, first slice | One gate catalogue for the 236 skips | `claude/td60-gate-catalogue` `72ac59366..34dc3b27c`, merged at `a356416eb` | Accepted 2026-11-12 after the Executive read the owner's two functions, the GC03 skip and the changed assertions, and ran the catalogue check on `main` | 137 rows; every skip of the base run and every gating variable has one. The check on `main` with the root set: 40 rows with inputs, 239 inputs, all present with their digests. Five files converted; nothing outside `test_env` changed; no case retired. Rerun on `main` with the root set: `t287-governed-context` 14 pass and the GC03 case skips with its reason; `t287-governance-covered-source-use` 6 pass and 3 skips; `t287-stdo-proof-entry` 3 pass and 2 skips; `t287-native-runtime-gate` 7/7; `t287-qualification-producer-acquisition-reuse` 3/3; `w2-steel-single-start-closure` 1 pass and 7 skips | Four class A cases fail whenever the root is set (triage package TD-60T; two may be Product defects). 19 class C rows fail with their input present and 74 rows have no usable input: their retirement is the next slice, after the packages that edit the same files merge. The catalogue's generator was a scratch script; the catalogue is maintained by hand from here, and the next slice adds a lane that checks rows against the gates in code |
| TD-58, slice A | One installed-setup owner, and one install per test file | `claude/td58-one-install-per-file` `7928c58cc..ea1212445`, merged at `e10f1a13d` | Accepted 2026-11-12. The Writer's run ended before its measurement chain; the Executive tabulated the finished chain, checked that the uncommitted conversions removed no assertion or test declaration, and committed them | Eight files: same titles and counts before, after and in reversed order; 3,546 s to 1,572 s under load; peak resident memory lower in each file read | About 70 installer files remain (slice B). Fixed shared output paths still block running files in parallel (TD-62). The support module and the converted tests are qualification inventory members and are now stale there (TD-63) |
| TD-47 | `construction_continuation.ts` is more than half pasted return types | `claude/td47-continuation-types` `b7e404499..1f3d8dd38`, merged at `d16e5edad`; identity regenerated by the Executive at `84d4f6d8c` | Accepted 2026-11-12 after Executive diff review, rebuild and rerun. First package under the side-by-side rule: the Writer committed authored changes only | 2,480 to 1,094 lines; 291 of 291 emitted `.js` byte-identical; one `.d.ts` differs; 775 compiler assertions of type identity pass, with the one intended difference. The rebuild on `main` gives the identity the Writer observed (`productContentDigest` `sha256:f2998d9e…`, catalog `sha256:44dc5b92…`). Rerun on `main`: `r1`, `r2`, `t287-continuation-causation`, `t287-exact-construction-intent` pass | Small spelled-out return types remain in two functions (TD-48). `owner_bindings/run_invocation.ts` can use the new names (TD-34) |
| TD-64, first part | The design directory is mostly history | `claude/td64-design-history` `ebeeaf5e0..2355506e0`, merged at `eedcb97db` | Accepted 2026-11-12 after the Executive read the classification overrules, the new index and the history README, and checked the diff: 277 renames at 100%, nothing under `code`, `contracts`, `specification`, `package.json` or the manifest | 50 current notes stay and are indexed by owner; 277 files move unchanged; five mixed notes are cut (1,285 lines, verbatim, checked by script). Build on `main` after the merge: exit 0, no tracked change. `t287-qualification-law` and `t287-rp2-material-selection` give the same counts before and after | Second part: authored repair of the kept notes. The constitution's historical sections need a section map and a ruling. 42 dangling links in kept notes predate the move. The inventory and recipe digests, order and new members wait for TD-63 |
| TD-58, slice B | One installed-setup owner, and one install per test file | `claude/td58b-one-install-per-file` `ebeeaf5e0..8a2970e14`, merged at `4108746ba` | Accepted 2026-11-12 after the Executive read the verdict table from the recorded runs, checked the diff (eleven test files, no assertion or test declaration added or removed, nothing outside `test_env/tests`) and reran three files on `main` | Eleven files: same titles and counts before, after and in reversed order, exit 0 on all 33 runs; 27 installs to 13; 1,482 s to 1,040 s under load. Rerun on `main`: `r5-invocation-admission`, `r9-causal-result-closure`, `runtime-scope-regressions` 2/2 each, no tracked change | Per-file sharing is exhausted: the rest install once per run or install different variants. Left: `t287-single-address-space-consolidation` (after TD-59), `rival-authority-mutations`, and sharing the pack and verified install across files. `r7-graph-validation-basis` has one case, so its independence rests on reading. Eight of the eleven are qualification inventory members (TD-63) |
