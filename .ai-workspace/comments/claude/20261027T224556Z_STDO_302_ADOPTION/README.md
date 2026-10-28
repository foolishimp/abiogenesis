# ABIogenesis STDO 3.0.2 adoption

Owner decision, 2026-10-27: the incremental move of ABIogenesis to STDO 3.0.2
is worth it.

This is a direct Product-owner method selection and a bounded
`product_reprice`, in the class of the
[3.0.1 adoption](../20261025T022614Z_STDO_301_ADOPTION/README.md). The 3.0.2 line
is a stable cut: `stdo://releases/v3.0.2/`, profile `stable-v1`. Its selector
`stdo://channels/3.0.2` is the discovery route for that one exact cut, not a
separate cut. This record is T-287 Phase D package S1. S1 also moves the runtime
default-library snapshot and the frozen qualification authorities to the same
cut, and rebinds the method cites.

## Activation

The Executive's S1 activation in
[phase_d.md](../../../work/T287_RELEASE_RESUMPTION_01/phase_d.md) binds one Worker
at base `e5ab7f959d3ee5e377569b216f4a5df32067832b`. The tenant tree at the base
equals U1-b's commit `9ec6c22f1`. The adopted Worker route is
`stdo://releases/v3.0.2/standards/EXECUTIVE_BASELINE.md#9-derived-worker-frame`.

Before the activation, the Executive ran the manager's network steps. The
record of those steps is outside this repository:
- the manager upgraded from the verified wheel (`stdo` 0.1.6);
- `stdo install v3.0.2` with the manifest digest below;
- one hand edit to the selector, `stdo://channels/3.0.1` to
  `stdo://channels/3.0.2`;
- `stdo adopt --dry-run`, then `stdo adopt --accept-plan-sha256`;
- `stdo status --verify`.

The Worker used no network.

Outcome: ABIogenesis source development selects the stable 3.0.2 cut through
the manager's digest-bound adoption plan. The install is verified and the agent
bootstrap markers are current. Every current method route in the territory is
rebound and resolves in the installed cut. The runtime default library and the
qualification authorities are restaged on that cut.

Territory:
- `stdo_abiogenesis.json`, as the manager left it;
- `AGENTS.md` and `CLAUDE.md` inside their bootstrap markers, by the manager
  only;
- the method routes and "3.0.1" basis mentions in `specification/PRODUCT.md`,
  `specification/GOALS.md` and `specification/requirements/README.md`;
- the method cites in the TypeScript design files
  `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, `ABI5_STDO3_COMPUTATIONAL_BINDING.md`
  and `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`;
- the runtime default-library source declaration and its packaged copies, with
  their test pins;
- `contracts/qualification/`, through its owner command;
- this record directory.

Retained Runs, qualification evidence and derivation links keep their original
exact bases. Historical GOALS paragraphs and records under `.ai-workspace/`
keep their subjects.

`preimages.json` holds each territory file's SHA-256 and Git blob id at the
base. For `stdo_abiogenesis.json` it holds both the base and the manager's
uncommitted adoption. No file copies are kept (TD-19).

## Exact selection

- Basis: `stdo://releases/v3.0.2/`; selector `stdo://channels/3.0.2`; profile
  `stable-v1`.
- Installed-manifest SHA-256:
  `f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477`. It has
  86 payload files: 67 standards, 17 plugin files, the licence and the release
  note. The standards member set is
  `644e5f6a509e0d79a2077ece8f1c25fc72e6abb5f03a95075b6e5b6eb565eb9d`.
- Annotated tag: `specification_methodology/v3.0.2`,
  object `d03b00a7fdf8972dc236b52eb09f3eccba7f62cb`.
- Commit: `23ca9c0929d7be8570edafaf30542e3daeb8dc1f`;
  tree `c64345a9b2127df3cddc0e26f49bc9dac2a24bff`.
- Manager: `stdo` 0.1.6. Its wheel SHA-256 is
  `ef726f780220a4be93c8ce014e2838d140851ec0e3d47902ea2ddd36a26c3242`, equal to
  its sidecar. The default store is `/Users/jim/Library/Application Support/STDO`;
  `stdo list` shows `v3.0.2` beside `v3.0.1-rc.1`.

## Result

Adopted and verified.

- `adoption-plan.json`: the dry-run plan goes from
  `stdo://releases/v3.0.1-rc.1/`, manifest
  `60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8`, to the
  exact selection above. The install status is `already_installed_verified` and
  the plan is
  `cb944b3c42cde4217f4b751c07215c8060c0f74c461b036a3dd642a5bc6143e4`.
- `adoption-result.json`: the manager applied that plan unchanged. The
  Definition changes in four leaves only: `$schema`,
  `constitution.stdo.selector` (the one hand edit), and
  `constitution.stdo.basis.uri` and `.manifest_sha256`. By parsed comparison
  with the base, these are unchanged: the seven entrypoint paths, `composition`,
  `reference_frame_bases`, `what`, `how` and `ticketing`.
- `stdo-status.json`: installed, valid, no failures, with the manifest above and
  67 standards. The Worker's own run on the final tree is identical.
- `bootstrap-plan.json`: both agent targets are `unchanged`. No apply was run;
  `AGENTS.md` and `CLAUDE.md` are byte-unchanged.
- `verification.json`:
  - Rebound: 32 route occurrences (Product 3, project frame basis 8,
    computational binding 17, library design 4) and four manifest digests
    (binding 3, library design 1).
  - Each route resolves to a manifest-bound member of the installed cut.
  - Each of the 20 anchors is present, with its heading unchanged from 3.0.1.
  - The frame basis's two heading-text cites are present.
  - The seven Definition entrypoints resolve to manifest-bound members.
  - Every cited section is compared between the two cuts.
  - Post-edit digests of every territory file are recorded.

No cited section that a deterministic-kind (F_D) disposition row rests on
changed between the cuts:
- `AXIOMATIC_CALCULUS.md`, `ASSURANCE.md`, `DESIGN_MODULE.md` and
  `examples/DETERMINISTIC_CONTRACTS.md` are byte-identical.
- ODD §5 "Probabilistic compute", §11.5D, §11.7A and RELEASE "Deterministic-kind
  migration" are unchanged.
- RELEASE §9's opening sentence now names the predecessor "immutable cut" where
  it said "immutable RC".

## Limits

Route resolution establishes that each cited member and heading exists in the
exact cut. It does not establish that the citing text conforms to 3.0.2's
changed meaning beyond the cited sections compared in `verification.json`. The
Worker did not check the public release, its Latest marking, or the manifest
asset against GitHub: S1 uses no network. Publication rests on the Executive's
install from the digest-bound manifest.

The manager committed nothing in S1. Retained Runs and qualification evidence
keep their original exact bases; nothing is published.
