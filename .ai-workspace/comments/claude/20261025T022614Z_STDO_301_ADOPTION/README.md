# ABIogenesis STDO 3.0.1 adoption

Owner instruction, 2026-10-25: “stdo 3.0.1 has been released and i want to
repin to 3.0.1 and migrate to it for abiogenesis”.

This is a direct Product-owner method selection and a bounded
`product_reprice`, classed as the
[3.0.0 adoption](../../codex/20261021_STDO_300_RC1_ADOPTION/README.md) was.
The published 3.0.1 line resolves to immutable `v3.0.1-rc.1`; the selector
`stdo://channels/3.0.1` is its mutable discovery route, not a separate cut. The
owner's rulings of the same date carry the pin and the migration in
[T-291](../../../tickets/active/T-291-repin-abiogenesis-to-stdo-3-0-1-and-migrate.md)
and move the runtime default-library snapshot in T-287 Phase D's first package,
D0. This record is T-291 package M-1, the source-development pin. The migration
of deterministic-kind (F_D) claims under 3.0.1 is package M-2.

## Activation

The Executive's M-1 activation in
[repin.md](../../../work/T291_STDO_301_REPIN_01/repin.md) binds one Worker as a
direct Writer at base `b80da6d0c6f44f83e20fe69ed163826bf9b1eb1b`. The
predecessor Worker route is
`stdo://releases/v3.0.0-rc.1/standards/EXECUTIVE_BASELINE.md#9-derived-worker-frame`;
the adopted route is
`stdo://releases/v3.0.1-rc.1/standards/EXECUTIVE_BASELINE.md#9-derived-worker-frame`.
The operation grant is the owner's instruction above, bounded by the
activation's grant.

Outcome: ABIogenesis source development selects the immutable 3.0.1 cut through
the manager's digest-bound adoption plan; the install is verified; the agent
bootstrap markers are current; the public release is checked against the
installed cut; every current method route in the territory is rebound and
resolved in the installed cut.

Territory: `stdo_abiogenesis.json`; `AGENTS.md` and `CLAUDE.md` inside their
bootstrap markers, by the manager only; `specification/PRODUCT.md` lines 663,
1596 and 1597; the 2026-10-25 owner-selection paragraph of
`specification/GOALS.md`; the adoption-record sentence of
`specification/requirements/README.md`; the method cites of the TypeScript
design files `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`,
`ABI5_STDO3_COMPUTATIONAL_BINDING.md` and
`ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; this record
directory.

Outside the territory and unchanged: the runtime default-library snapshot
(`code/src/gtl/default_library.ts`, `contracts/default-library/stdo/`,
`test_env/support/stdo3-run-environment.mjs`,
`test_env/fixtures/registered-selection-product/native.mjs` and the two T-287
default-library and run-environment tests) stays on `v3.0.0-rc.1` until D0;
historical GOALS paragraphs and records under `.ai-workspace/` keep their
subjects; tickets and the register are restated by the Executive.

`preimages.json` holds each territory file's SHA-256 and Git blob id at the
base. No file copies are kept (TD-19). `unrelated-preimages.json` holds the
starting `git status --short`: the two untracked Codex strategy posts and no
tracked modification.

## Exact selection

- Basis: `stdo://releases/v3.0.1-rc.1/`; selector `stdo://channels/3.0.1`.
- Installed-manifest SHA-256:
  `60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8`;
  83 payload files: 64 standards, 17 plugin files, the licence and the release
  note.
- Annotated tag: `specification_methodology/v3.0.1-rc.1`,
  object `6e96ce1d2422508e5620bd12afceda890c556fd6`.
- Commit: `fe4941f56a52ed3697a2b516d8d68948b0ea65d9`;
  tree `3aa889d2749e05f5c9c1d1375fb27391a8159e99`.
- [Published release](https://github.com/foolishimp/specification_methodology/releases/tag/specification_methodology/v3.0.1-rc.1),
  2026-10-24T14:11:07Z, draft false, prerelease false.
- Manager: `stdo` 0.1.5, default store
  `/Users/jim/Library/Application Support/STDO`.

## Result

Adopted and verified.

- `adoption-plan.json`: the dry-run plan goes from
  `stdo://releases/v3.0.0-rc.1/`, manifest
  `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, to the
  exact selection above, install status `already_installed_verified`, plan
  `c929db0aac6032a826b5e93b2e68ee593496f3538e28a384e656847875608d50`.
- `adoption-result.json`: the manager applied that unchanged plan. The
  Definition changes in `$schema`, `constitution.stdo.selector` (the one hand
  edit) and `constitution.stdo.basis` only. Its seven entrypoint paths, empty
  `composition`, `reference_frame_bases`, `what`, `how` and `ticketing` are
  unchanged by parsed comparison with the base.
- `stdo-status.json`: installed, valid, no failures, the manifest above,
  64 standards with member set
  `8b33f4463da10a52cadb64de6053e2bfee53064677c737f5c99f00403d5194c7`. The
  installed manifest lists 17 plugin members.
- `bootstrap-plan.json`: both agent targets are `unchanged`; no apply was run
  and `AGENTS.md` and `CLAUDE.md` are byte-unchanged.
- `publication.json`: the public release's tag and `targetCommitish` equal the
  selection; draft and prerelease are false. The manifest asset and its
  `.sha256` sidecar were downloaded to session scratch, the sidecar verifies,
  the asset bytes equal the installed `manifest.json` and its canonical SHA-256
  equals the installed manifest's. The manager's resolution of the public tag
  gave the tag object and commit above.
- `verification.json`: 22 route occurrences rebound (Product 3, project frame
  basis 8, computational binding 7, library design 4) and two manifest digests
  replaced. Each route resolves to a manifest-bound member of the installed
  cut; each anchor is present with its heading unchanged from 3.0.0; the two
  heading-text cites of the frame basis are present; the seven Definition
  entrypoints resolve to manifest-bound members; the fourteen headings named
  by the activation are present; post-edit digests of every territory file
  are recorded.

## Limits

No runtime, default-library or qualification snapshot is rebuilt; D0 moves the
runtime default-library snapshot. Retained Runs, qualification evidence and
derivation links keep their original exact bases. No semantic qualification of
the Product under 3.0.1 is claimed: route resolution establishes that each cited
member and heading exists in the exact cut, not that the citing text conforms to
3.0.1's changed meaning. The F_D migration (3.0.1's common deterministic kind
and RELEASE §9 deterministic-kind migration) is pending in M-2.

The manager committed nothing. Its adoption read the public repository by
`git ls-remote --tags` and fetched the one tag ref into its own temporary bare
object store; no workspace repository was fetched, pulled or pushed, and
nothing is published.
