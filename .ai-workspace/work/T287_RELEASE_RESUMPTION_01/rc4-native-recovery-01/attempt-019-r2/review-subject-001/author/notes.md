# Native recovery 19: local RC4 identity construction notes

Writer return to the Executive. These notes are commentary. They are not
acceptance, and C2 and UAT have not run. The authoritative record is
`return.json`.

## Result

`candidate_ready`. The uncommitted worktree delta over HEAD
`1100bd8f2b84e03ad12479f9841b9bb53408f0db` changes 5 bytes in the three
granted paths. Each change is `3` to `4`, and file sizes are unchanged.

| Path | Field | Before sha256 | After sha256 |
|---|---|---|---|
| `package.json` (10003 B) | `.version` | `9efb911e…ff2de` | `c5e2d05d…bf3d0` |
| `package-lock.json` (8001 B) | `.version`, `packages[""].version` | `d7d6c706…22471` | `6dc35322…92fda` |
| `code/src/product/contracts.ts` (13080 B) | `ABI5_PRODUCT_ID`, `ABI5_PACKAGE_VERSION` | `ed665e03…347c7` | `d0dd137a…9f74c` |

All three files equalled HEAD before the edit. None already held rc.4.

## Conserved

- Every dependency and lock entry. The parsed lock equals HEAD except the two
  root versions.
- `"5.0.0"` schema and contract literals (16 of 16) and the `@5` reference.
- `ABI5_PACKAGE_NAME`.
- The STDO 3.0.2 basis.
- Behaviour. Consumers import the constants, and no other source literal
  carries rc.3.
- Historical RC1/RC2/RC3 identities elsewhere. No global replacement was made.

## Checks

- Pinned `tsc -p tsconfig.json --noEmit --incremental false` (TypeScript
  5.9.2) exited 0 with empty streams and emitted nothing. This shows that the
  source type-checks. It is not build or package evidence.
- A full worktree metadata inventory before and after found exactly three
  changed entries (the granted paths), none added, none removed, out of
  894,970. The operator dependency store behind the `node_modules` link was not
  censused.
- The operator `readiness.py` fails with `KeyError: 'bytes'`, an input schema
  mismatch. An adapted in-memory projection is recorded in `readiness.json`.

## Handoff to C2

- `scripts/generate-product-manifest.mjs` derives `productId` from
  `package.json` and guards it against the exported constants. Statically, that
  guard now agrees with the source.
- C2 still owns the build, the generator, the regenerated graph and manifest,
  pack with `--ignore-scripts`, `refresh-candidate-basis`, and
  `identity-and-smoke.mjs` prepare/smoke.
- `release-claim.md` is still the historical RC3 claim. It is unpacked and
  outside this grant.
