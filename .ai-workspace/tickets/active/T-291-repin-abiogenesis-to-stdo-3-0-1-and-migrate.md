# T-291 - Repin ABIogenesis to STDO 3.0.1 and Migrate

- id: T-291
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-10-25
- current_method_basis: stdo://releases/v3.0.0-rc.1/ (until M-1 lands; then stdo://releases/v3.0.1-rc.1/)
- current_method_manifest_sha256: 069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232 (until M-1 lands; then 60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8)
- current_activation: T291_STDO_301_REPIN_01
- current_package: M-1 (activated 2026-10-25; the pin and the routes; its Worker starts when T-290 C-11 returns)
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
| 2026-10-25 | M-1 | | | activated (the pin and the routes; the Worker starts when C-11 returns) |

Next: M-1 (activated; its Worker starts when T-290 C-11 returns); then M-2 (activation written at M-1's acceptance); then T-290 resumes at C-12; D0 opens T-287 Phase D.
