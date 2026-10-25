# T-291 - Repin ABIogenesis to STDO 3.0.1 and Migrate

- id: T-291
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-10-25
- current_method_basis: stdo://releases/v3.0.1-rc.1/ (M-1, `72384fe07`)
- current_method_manifest_sha256: 60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8
- current_activation: T291_STDO_301_REPIN_01
- current_package: M-2 (activated 2026-10-25; the F_D migration under 3.0.1); M-1 accepted at `72384fe07`
- change_class: product_reprice (the owner's method selection, as the 3.0.0 adoption was classed)
- derived_change_classes: design_reframe (M-2, the F_D import, bounded to the binding and frame owners); realization_refactor (D0 in T-287, the runtime default-library successor)
- re_entry_point: specification/GOALS.md#current-selection

## Scope

The owner's instruction of 2026-10-25: "stdo 3.0.1 has been released and i want
to repin to 3.0.1 and migrate to it for abiogenesis". STDO 3.0.1 is published
as a release: immutable cut `specification_methodology/v3.0.1-rc.1`, commit
`fe4941f56a52ed3697a2b516d8d68948b0ea65d9`, annotated tag object
`6e96ce1d2422508e5620bd12afceda890c556fd6`, canonical manifest SHA-256
`60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8`, 83 payload
files, published 2026-10-24 (the publisher corrected the prerelease flag; each
published cut is a proper release). The cut is installed and verified in the
shared store. The selector becomes `stdo://channels/3.0.1`.

This ticket carries the source-development pin and the method migration; the
runtime default-library successor is T-287 Phase D's first package, D0, by the
owner's ruling below. [T-290](T-290-close-the-common-library-and-retire-the-registered-debt.md)
Phase C continues around it: M-1 and M-2 run after C-11 returns and before
C-12, one Worker at a time. The package records are in
[repin.md](../../work/T291_STDO_301_REPIN_01/repin.md) (activation, Return,
disposition, as T-290's packages). The precedent is the
[3.0.0 adoption record](../../comments/codex/20261021_STDO_300_RC1_ADOPTION/README.md).

What 3.0.1 changes for this Product (its [release note](https://github.com/foolishimp/specification_methodology/releases/tag/specification_methodology/v3.0.1-rc.1)):
F_D becomes the common total deterministic kind of AXIOMATIC_CALCULUS §5,
imported by ODD by exact edition; the former ODD kind-level F_D authority
shorthand ("F_P freedom, F_D authority") is superseded by explicit Product and
ABG admission and closure owners (the 3.0.1 ODD text names ABG's admitted
`evaluate_action` fold and `EdgeClosureDecision`); conformance's "F_D gate"
becomes a declared admission gate; each existing operation that claims F_D
takes the three-way migration relation of RELEASE §9 (eligible, remediation,
pending), and unknown eligibility stays pending. The release is not
automatically patch-compatible; immutable consumers keep their selected
meanings and permissions, and adoption is this consumer's decision.

## Rules

T-290's rules apply unchanged (one package at a time; one fresh Opus 5.5
Worker at xhigh; one commit per package on local `main`; nothing pushed in
either repository until the owner says so; the Executive writes the
activation, verifies the Return, runs the check and accepts or stops; the
owner's Codex pass is the review; a Product contract change, a payload key
change, a failure class change or a design reframe beyond the one named here
is a stop). The runtime default-library snapshot (`code/src/gtl/default_library.ts`,
`contracts/default-library/stdo/`, `test_env/support/stdo3-run-environment.mjs`,
`test_env/fixtures/registered-selection-product/native.mjs`,
`test_env/tests/t287-default-library.test.mjs`,
`test_env/tests/t287-stdo3-run-environment.test.mjs`) is outside this ticket:
it stays on `v3.0.0-rc.1` until D0. No proof package copies evidence (TD-19):
the record keeps digests and blob ids, not preimage copies.

## Packages

| Package | Scope | Exit |
|---|---|---|
| M-1 | The pin and the routes: the selector to the 3.0.1 channel; the manager's digest-bound adoption plan applied and verified; the bootstrap markers refreshed; the public release's tag, commit and manifest asset checked against the installed cut; every `stdo://releases/v3.0.0-rc.1/` route in the Product, GOALS, the requirements README and the three design owners rebound to `v3.0.1-rc.1` and its anchor resolved in the installed cut; the owner-selection paragraph; the adoption record | `stdo status --verify` valid with the exact manifest; every rebound route resolved; the record written; one commit |
| M-2 | The F_D migration, a bounded `design_reframe`: the census of F_D claims in live specification and design (119 files mention F_D; the owners are the computational binding, the project frame basis, the Product's governed-environment section and the design's conformance wording); the binding declares the exact-edition import of the common kind and, for each operation class that claims F_D, its migration disposition under RELEASE §9 with its evidence; "F_D gate" wording becomes the declared admission gate; ODD A5 as 3.0.1 states it; historical design untouched | every live F_D claim has an owner and a disposition (eligible, remediation or pending); no Product contract, payload key or failure class changes; the owner's Codex pass |
| D0 (T-287) | The runtime default-library successor: the GTL default library's STDO source (basis, manifest; its two member documents are byte-identical between the cuts) and its tests move to `v3.0.1-rc.1`; regenerated digests | T-287's Phase D order, first package |

## Decisions

| Item | Decision | Ruling (owner, 2026-10-25) |
|---|---|---|
| Runtime default-library snapshot | Move with the pin, in Phase D, or not in this wave | Phase D's first package, D0, so the release candidate qualifies under 3.0.1 once; the source-development pin and migration run now |
| Carrier | A new ticket or T-290 packages | This ticket, T-291, with M-1 and M-2; T-290's order names the interleave; D0 is in T-287's Phase D order |
| Timing | | After C-11 returns, before C-12; Workers one at a time; nothing here touches C-11's grant |

## Ledger

| Date | Package | Commit | Executive check | Disposition |
|---|---|---|---|---|
| 2026-10-25 | M-1 | `72384fe07` | the commit's seventeen paths all in the grant, parent `b80da6d0c`, the Opus trailer, `repin.md` append-only, `code/`, `contracts/` and `test_env/` untouched; the definition read (`$schema`, selector `stdo://channels/3.0.1`, basis `v3.0.1-rc.1` with manifest `60356364…`, source unchanged); `stdo status --verify` installed, valid, no failures, manifest `60356364…`, 64 standards, release commit `fe4941f5…`, tag object `6e96ce1d…`, tree `3aa889d2…`; `v3.0.0-rc.1` remaining in `specification/` and the design directory at `GOALS.md:151` and `:156` only (the snapshot clause and the 2026-10-21 history); `AGENTS.md` and `CLAUDE.md` unchanged; the fifteen distinct routes of the territory resolved by the Executive's own heading resolver against the installed cut, none missing; the record directory's nine files, digests and blob ids only; `git diff --check` clean; `lint:evidence` 691 roots, no new copy; `t287-default-library` 20/17/0/3 and `t287-stdo3-run-environment` 5/5 unchanged (`exec_check_M1.log`) | accepted; closed: the pin, the digest-bound adoption applied and verified, the bootstrap markers current without an apply, 22 route occurrences and two manifest digests rebound and resolved, the record written; deviations 1 to 6 accepted; two out-of-grant cites (`PRODUCT.md:14-15`, `GOALS.md:18`) restated by the Executive; the binding's `:154` F_D sentence to M-2 |
| 2026-10-25 | M-2 | | | activated (the F_D migration: the binding's deterministic-kind section with the per-class dispositions, the owners named, the frame basis restated; the Product and requirements checked) |

Next: M-2 (Worker running; the F_D migration under 3.0.1); then T-290 resumes at C-12; D0 opens T-287 Phase D; the owner's Codex pass on M-1 and M-2 when given.
