# ABIogenesis 5.0.0-rc.12 local development candidate

`5.0.0-rc.12` is a local, unqualified, unpublished development candidate. It is
cut from the commit on branch `claude/rc12-integration` that adds this text, by
the scripts in
`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/cut/`. Its
source is the RC12 integration line; `LEDGER.md` in that directory lists the
packages it contains. The cut record names the commit, tree, archive digest,
members and toolchain; the install record names the local install. RC11 remains
the pinned builder.

The archive is the built tree of that commit: the pinned TypeScript compiler,
the Product's manifest generator and `npm pack --ignore-scripts --offline` over
a dependency tree checked against the pinned dependency inventory. npm reads
each bundled dependency's own `files` list, so the archive omits the
`fast-check` and `pure-rand` changelogs that the RC11 archive carries. The
Product's own verifier accepts the archive and its own install owners install
it.

## What was run

Package X's Return (`X_RETURN.md` in the same directory) records these results.
Each test file ran alone; counts are tests/pass/fail/skip. They were observed at
the commits named, not at the cut commit. Within the tenant, the cut commit
differs from `eb87782fa` only in the version identity, the regenerated manifest
and capability graph, the candidate basis fixture and this file.

At `eb87782fa`:

- `npm run build` exits 0 and a second build leaves the tree clean;
  `lint:imports`, `lint:lifecycle` and `lint:calculus` pass; the recipe lint
  passes over 72 files; `lint:evidence` reports the five known offenders, all
  tracked `.ai-workspace` content outside the package.
- `t287-default-library-prerequisites` 7/7/0/0.
- `t287-default-library-recoverable-failure` 5/5/0/0.
- `t287-default-library-reviews` 10/10/0/0.
- `t287-recursive-failure-foldback` 8/8/0/0.
- `t287-amendment-witness` 13/12/0/1; the skip is the live provider case, which
  runs only on request.
- `t287-readable-stops` 5/5/0/0 and `t287-readable-stops-foldback` 5/5/0/0.

At `c174b2b44`:

- `m5-terminal-quiescence-owner` 7/7/0/0.
- `t287-runtime-activity-quiescence` 1/1/0/0.
- `m5-consensus-module` 17/17/0/0.
- `t287-liveness-heartbeat` 6/6/0/0.

The earlier package Returns in that directory record results at their own
heads; they are not results for this candidate. Results observed on the cut
commit itself are recorded in package X's Return. The whole suite is not run
for this claim; it is reported separately.

## What this candidate does not claim

- Qualification: no exact-candidate qualification, Hello or UAT,
  native-workflow, whole-suite or performance result.
- Publication: no release, tag, selector, pin, merge or push.
- Evidence from earlier candidates: no RC1–RC11 qualification, review, Hello or
  test result applies to this artifact.
- A live provider run: the live amendment witness has not run against this
  candidate.
- Any Consensus change: the Consensus sources are unchanged from the base
  `82ad6639b`.

Package: `@abiogenesis/typescript-tenant` `5.0.0-rc.12`, private.
Product: `product://abiogenesis/typescript-tenant@5.0.0-rc.12`.
