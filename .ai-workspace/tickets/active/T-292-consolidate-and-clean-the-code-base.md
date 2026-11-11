# T-292 - Consolidate and Clean the Code Base

- id: T-292
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-11-12
- current_activation: T292_CONSOLIDATION_01
- current_package: TD-36 follow-up (source), TD-59 (the fourteen failures at the base), TD-64 (design history), in flight
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
| TD-58, slice A | One installed-setup owner, and one install per test file | `claude/td58-one-install-per-file` `7928c58cc..ea1212445`, merged at `e10f1a13d` | Accepted 2026-11-12. The Writer's run ended before its measurement chain; the Executive tabulated the finished chain, checked that the uncommitted conversions removed no assertion or test declaration, and committed them | Eight files: same titles and counts before, after and in reversed order; 3,546 s to 1,572 s under load; peak resident memory lower in each file read | About 70 installer files remain (slice B). Fixed shared output paths still block running files in parallel (TD-62). The support module and the converted tests are qualification inventory members and are now stale there (TD-63) |
| TD-47 | `construction_continuation.ts` is more than half pasted return types | `claude/td47-continuation-types` `b7e404499..1f3d8dd38`, merged at `d16e5edad`; identity regenerated by the Executive at `84d4f6d8c` | Accepted 2026-11-12 after Executive diff review, rebuild and rerun. First package under the side-by-side rule: the Writer committed authored changes only | 2,480 to 1,094 lines; 291 of 291 emitted `.js` byte-identical; one `.d.ts` differs; 775 compiler assertions of type identity pass, with the one intended difference. The rebuild on `main` gives the identity the Writer observed (`productContentDigest` `sha256:f2998d9e…`, catalog `sha256:44dc5b92…`). Rerun on `main`: `r1`, `r2`, `t287-continuation-causation`, `t287-exact-construction-intent` pass | Small spelled-out return types remain in two functions (TD-48). `owner_bindings/run_invocation.ts` can use the new names (TD-34) |
| TD-58, slice B | One installed-setup owner, and one install per test file | `claude/td58b-one-install-per-file` `ebeeaf5e0..8a2970e14`, merged at `4108746ba` | Accepted 2026-11-12 after the Executive read the verdict table from the recorded runs, checked the diff (eleven test files, no assertion or test declaration added or removed, nothing outside `test_env/tests`) and reran three files on `main` | Eleven files: same titles and counts before, after and in reversed order, exit 0 on all 33 runs; 27 installs to 13; 1,482 s to 1,040 s under load. Rerun on `main`: `r5-invocation-admission`, `r9-causal-result-closure`, `runtime-scope-regressions` 2/2 each, no tracked change | Per-file sharing is exhausted: the rest install once per run or install different variants. Left: `t287-single-address-space-consolidation` (after TD-59), `rival-authority-mutations`, and sharing the pack and verified install across files. `r7-graph-validation-basis` has one case, so its independence rests on reading. Eight of the eleven are qualification inventory members (TD-63) |
