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
- current_package: M-2 accepted at `e5791aa4e` (the F_D migration under 3.0.1); M-1 accepted at `72384fe07`; both await the owner's Codex pass; M-4, M-5 and M-6 scheduled after T-290 C-14, which runs after C-17 (the owner's rulings of 2026-10-25; the order corrected at C-13's acceptance to keep TD-12 last of the registered rows); D0 is T-287 Phase D's first package
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
| M-4 | Row 7, artifact verification in process (`realization_refactor`): `verifyProduct` reads the artifact once and decides over its bytes with the module's ustar reader, the two `tar` paths retired; the executing toolchain's identity passed in; the install-root walk declared an observation effect; the type-check's termination argument stated or left pending by name; row 7's cells restated | the verification lanes unchanged before and after; `provisioning_verify_artifact` measured before and after; no contract, payload key or failure class change; one commit |
| M-5 | Row 10b, the catalogs bound (`realization_refactor`): the coverage catalog read once at leaf admission as a digest-bound input from the verified install, the rule catalog the same way; a termination argument per Program-declared F_D leaf from code; no fuel bound; row 10b's cells restated | the qualification lanes unchanged before and after; no Program declaration, payload key or failure class change; one commit |
| M-6 | Rows 5, 8 and 10a (`realization_refactor`): the native time sample taken once per transaction and passed in as a declared input (34 sites, `native_event_time.ts` the one sampler; `eventTime` still recorded; a stop if any reader depends on distinct times within a transaction); Product capability admission split into observation (verification, the store extent) and a check over the admitted results returning the admit family's typed refusals; the `workflow.C` arm's F_D claim scoped to its opening and foldback checks with the child composed under AC-016, the recorded `regime` value unchanged; the three rows' cells restated | the ABG, admission and workflow lanes unchanged before and after; no payload key, failure class or Public export change; one commit |
| D0 (T-287) | The runtime default-library successor: the GTL default library's STDO source (basis, manifest; its two member documents are byte-identical between the cuts) and its tests move to `v3.0.1-rc.1`; regenerated digests | T-287's Phase D order, first package |

## Decisions

| Item | Decision | Ruling (owner, 2026-10-25) |
|---|---|---|
| Runtime default-library snapshot | Move with the pin, in Phase D, or not in this wave | Phase D's first package, D0, so the release candidate qualifies under 3.0.1 once; the source-development pin and migration run now |
| Carrier | A new ticket or T-290 packages | This ticket, T-291, with M-1 and M-2; T-290's order names the interleave; D0 is in T-287's Phase D order |
| Timing | | After C-11 returns, before C-12; Workers one at a time; nothing here touches C-11's grant |
| F_D in `specification/` (M-2 stop 1) | Four sentences place authority on a kind: `INTENT.md:54`, `PRODUCT.md:697`, FN-COMP-004, COMPUTE-NOTATION-010; the Worker's restatements (authority carried by contract and admitted grant; closure is ABG's admitted closure fold) | ruled 2026-10-25: the sentences stay. An F_D operation is created under an admission; its grant exists from its lineage; the kind label adds none. Read with lineage the four sentences are not contradictions (the closure predicate carries the closure grant in its lineage; F_P and F_H outputs are not fixed by lineage). No M-3; the twelve dependent design lines stay; the binding's import and reading sentences restated by the Executive to the lineage reading |
| Rows 7 and 10b (M-2 stops 2 and 3) | Artifact verification and the Program-declared F_D leaves are evaluation operations with undeclared dependencies and no termination argument | ruled 2026-10-25, "fix it through the refactor, as stated": M-4 (row 7) and M-5 (row 10b) after C-15, before the Phase C close run, realization only; no lock change (the artifact already declares the toolchain by digest and the linker compares it; the compiler is the toolchain's own); no fuel or deadline bound; the coverage catalog digest-bound from the verified install; the rule catalog's digest is already bound to the task scope |
| Pending rows 1, 5, 8, 9b, 10a and the qualification source copies | Lawful RELEASE §9 standings with named remediations; `contracts/qualification/sources/ODD_METHOD.md` carries pre-3.0.1 wording | ruled by the Executive under the owner's standing rules of 2026-10-25 ("resolve with my prior rules, evaluate based upon intent, prune tech debt, consolidate to existing library functions"): row 1 (the admit atoms, the library wave's own code of 2026-10-22) to T-290 C-15; rows 5, 8 and 10a to M-6 after M-5 (the time sample consolidated to one declared input per transaction through `native_event_time.ts`; Product capability admission split into observation and check with the admit family's typed refusals; the arm's claim scoped to its own checks under AC-016, the recorded regime unchanged); row 9b and the method copies to T-287 D0 (the same default-library files and the same snapshot class). Reversal: each is one commit |

## Ledger

| Date | Package | Commit | Executive check | Disposition |
|---|---|---|---|---|
| 2026-10-25 | M-1 | `72384fe07` | the commit's seventeen paths all in the grant, parent `b80da6d0c`, the Opus trailer, `repin.md` append-only, `code/`, `contracts/` and `test_env/` untouched; the definition read (`$schema`, selector `stdo://channels/3.0.1`, basis `v3.0.1-rc.1` with manifest `60356364…`, source unchanged); `stdo status --verify` installed, valid, no failures, manifest `60356364…`, 64 standards, release commit `fe4941f5…`, tag object `6e96ce1d…`, tree `3aa889d2…`; `v3.0.0-rc.1` remaining in `specification/` and the design directory at `GOALS.md:151` and `:156` only (the snapshot clause and the 2026-10-21 history); `AGENTS.md` and `CLAUDE.md` unchanged; the fifteen distinct routes of the territory resolved by the Executive's own heading resolver against the installed cut, none missing; the record directory's nine files, digests and blob ids only; `git diff --check` clean; `lint:evidence` 691 roots, no new copy; `t287-default-library` 20/17/0/3 and `t287-stdo3-run-environment` 5/5 unchanged (`exec_check_M1.log`) | accepted; closed: the pin, the digest-bound adoption applied and verified, the bootstrap markers current without an apply, 22 route occurrences and two manifest digests rebound and resolved, the record written; deviations 1 to 6 accepted; two out-of-grant cites (`PRODUCT.md:14-15`, `GOALS.md:18`) restated by the Executive; the binding's `:154` F_D sentence to M-2 |
| 2026-10-25 | M-2 | `e5791aa4e` | the commit's four paths all in the grant (the binding, the frame basis, the library design, `repin.md`), parent `d0b1b196b`, the Opus trailer, `repin.md` append-only, `code/`, `contracts/`, `test_env/` and `specification/` untouched; the 21 distinct routes of the three design files resolved by the Executive's resolver against the installed cut, none missing; the new subsection present at binding `:158` with twelve rows; the two remaining "F_D authority" and old-basis strings in the binding are the reading sentence (`:168`) and the migration record (`:189`), deliberate; `git diff --check` clean; `lint:evidence` 691 roots, no new copy; `t287-calculus-fold` 13/13 (`exec_check_M2.log`); row 2's totality, dependency and outcome cells checked against `shared/select/exact_match.ts` and found wrong (the predicate is the caller's argument, `resolveExactMatch(values, predicate)`, exception propagating; the cardinality names are `absent`, `one`, `many`), corrected by the Executive | accepted as delivered, not closed: the import, the twelve-row disposition (5 eligible, 7 pending, 0 unresolved), the three owners, the census (577 lines, 119 files) and the three restated sentences; deviations 1 to 7 accepted; row 2's three cells corrected by the Executive; the four `specification/` sentences ruled not contradictions (the owner, 2026-10-25: an F_D operation's grant exists from its lineage; no M-3); open: rows 7 and 10b are evaluation defects, their realization parts proposed as T-291 packages after C-15, their contract parts (lock-declared compiler and toolchain digests; catalog digest binding; a leaf fuel bound) the owner's; the five other pending rows proposed as one Phase D package after D0; the owner's Codex pass |
| 2026-10-26 | M-5 | | | activated (row 10b by realization: the coverage and rule catalogs read once at leaf admission as digest-bound inputs from the verified install, the module-relative file reads retired; a termination argument per Program-declared F_D leaf stated from code; no fuel bound) |
| 2026-10-26 | M-4 | `e9e74fb74` | grant clean (four product modules, the wave2 lane's additions, the record; `environment_definition_bindings.ts` is the named boundary caller; no test line deleted); `tsc`, the four lints and the build green; `M4` absent from source, build and tests; exit greps zero (`execFile`, `"tar"`, `node:child_process`, `TAR_MAX_BUFFER`, the three retired readers) and `installedToolchainProductContentDigest(` at the two boundaries and the two defaults; the refusal code set of `verify_product.ts` equal to the base; `admission_authority.ts`, `abg/`, `public/`, the designs and the fixtures untouched; the regenerated files' leaf sets equal (51,146 and 3,243; 190 and 551 digests moved); ten lanes and compose equal to the Return's after column (wave2 2/2; `t287-w2-05-static-binding-algebra` 5/3/0/2; the seven reds red at the base: `t287-installed-dependency-lock` 2/0/1/1, `t287-pfc-f08a-product-verification-boundary` `manifest_malformed`, r1 to r3 `artifact_digest_mismatch`, `m5-installed-portability` 8/5/3, `t287-release-acceptance` file-level, `t287-interrupted-event-resource-recovery` 8/6/2); compose `provisioning_verify_artifact` 20,406 ms; the tree clean by path | accepted; row 7 Eligible with two remainders named in the cell: the two parameter defaults for component tests (T-290 C-18 removes them, the tests pass the identity) and the verify-time compiler's identity unrecorded in the receipt (a Product contract question for the owner at the Phase C close report, with the now-unreachable `payload_unreadable` and `catalog_mismatch` arms); stop 1 ruled not a stop (the literal fired, the format dependency did not: every lane artifact walked, zero catch fallbacks); directory members and the retired 64 MiB bound accepted; three other module-relative manifest readers and four unused locals to C-18; the compose phase's 20 s is the type-checks, not decompression (the activation's error); `## M-4 disposition` |

Next: M-5 (row 10b; Worker running; M-4 accepted at `e9e74fb74`, row 7 Eligible); then M-6 (rows 5, 8, 10a) before the Phase C close run; the owner's Codex pass on M-1 (`72384fe07`) and M-2 (`e5791aa4e`); D0 opens T-287 Phase D with row 9b and the method copies; this ticket closes when M-6 is accepted and the owner's pass is recorded.
