# CHECKPOINT: T-284 Replacement Candidate Manifest

**Author**: codex
**Freeze time**: 2026-07-20T06:03:44Z
**Ticket**: T-284
**Status**: exact replacement candidate frozen for independent review; M2 open

## Candidate Identity

| Field | Exact value |
|---|---|
| accepted Product basis | `afb35def08b2259046830f87c18b45c95c84001c` |
| superseded T-284 candidate | `4ac6617c6450234cfb1c20112a89c286f4e6e7ce` |
| replacement candidate | `7f69aa83e295f0c391616a3a3a2acfafb8f20156` |
| candidate tree | `da12ce31f7ad5dce29d53d0d67750b011ab25f35` |
| constitutional subject files | 86 |
| constitutional aggregate SHA-256 | `5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69` |
| nine-family requirement amendment SHA-256 | `d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf` |
| correction-vector SHA-256 | `1aee805fa502ec233c71ca05b1e26c7c88efa070484942764504d7a59b75946c` |
| X-membership evidence SHA-256 | `71c9a8504cc403bd2c3f37f90b2ad942fd39cb385d2cc305b91ba20c411cda66` |
| review-disposition SHA-256 | `1eca13dbc857c07282ab232de7256242b70265ad228888d8960648494333987e` |
| T-284 review-workflow SHA-256 | `9a5708fe65ab2352a6afb4cd06a1953b90b9ab8551b43e0f6769cc03118a4699` |
| replacement self-review SHA-256 | `835b12cce2b947b0a85080c71e401f40ba8099b7975a3574c3b0e9589f123ef1` |
| final-integration freeze-manifest SHA-256 | `b3230550394ae7e1f35b821a8f4f3ce6d2e0422cc18a4b54146a6ac97ee1a2bb` |

## Subject Boundary

The constitutional review subject is the union of:

1. the original T-283 80-file constitutional subject; and
2. every additional constitutional path changed between accepted Product
   basis `afb35def` and replacement candidate `7f69aa83`.

The surface filter remains:

- `AGENTS.md`, `CLAUDE.md`, and `README.md`;
- `specification/**`;
- `build_tenants/common/design/**`; and
- `build_tenants/abiogenesis/typescript/design/**`.

| Surface | Files |
|---|---:|
| root bootstrap/read models | 3 |
| specification | 58 |
| common design retirement surfaces | 9 |
| TypeScript design retirement surfaces | 16 |
| total | 86 |

The six paths added beyond the original 80-file subject are:

```text
specification/requirements/abg/REQ-R-ABG3-BINDING.md
specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md
specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
specification/requirements/abg/REQ-R-ABG3-WORKER.md
specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md
```

`REQ-R-ABG3-PROJECTION.md` is the sole constitutional path added beyond the
superseded 85-file candidate. The other seven current edits amend paths already
inside that candidate's subject.

Comments and tickets remain outside the constitutional aggregate. Their exact
bytes are separately bound by digest. Ticket review/proof status and receipt
references may advance without changing the constitutional subject. A change
to ticket scope, change class, re-entry point, Product basis, selected migration
strategy, donor basis, implementation hold, required outputs, or closure
contract invalidates this candidate.

No runtime source, test, generated manifest, package, qualification artifact,
release artifact, or M3 design is part of the candidate change.

## Constitutional Aggregate Reproduction

```bash
base=1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
accepted=afb35def08b2259046830f87c18b45c95c84001c
candidate=7f69aa83e295f0c391616a3a3a2acfafb8f20156
filter='^(AGENTS\.md|CLAUDE\.md|README\.md|specification/|build_tenants/common/design/|build_tenants/abiogenesis/typescript/design/)'

subject=$(mktemp)
{
  git diff --name-only "$base..$accepted"
  git diff --name-only "$accepted..$candidate"
} | rg "$filter" | LC_ALL=C sort -u > "$subject"

while IFS= read -r file; do
  printf '%s  %s\n' \
    "$(git show "${candidate}:${file}" | shasum -a 256 | awk '{print $1}')" \
    "$file"
done < "$subject" | shasum -a 256

rm -f "$subject"
```

The result must be:

```text
5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69
```

## Requirement Aggregate Reproduction

Use the same per-file digest line and `LC_ALL=C` path ordering over:

```text
specification/requirements/abg/REQ-R-ABG3-BINDING.md
specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md
specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
specification/requirements/abg/REQ-R-ABG3-WORKER.md
specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md
specification/requirements/product/REQ-P-POLICY.md
```

The result must be:

```text
d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf
```

## Frozen-X Membership

The executable reproduction embedded in
`.ai-workspace/comments/codex/20260720T055423Z_EVIDENCE_t284_x_carrier_membership.md`
must report:

```text
total: 1935
families: 41
membership SHA-256: 614610e79c37983cb37aaa3fc105f320c1429065766f98a9c36083ff9ccabccd
```

`XC40` contains exactly the saga-frontier contract and runner. `XC41` contains
120 paths and remains an archive/refusal boundary.

## Gate Result

- candidate, tree, subject count, constitutional aggregate, requirement
  aggregate, and all separately bound digests reproduce locally;
- final-integration commit `d4db5a93` changes exactly three paths and has a
  dedicated semantic disposition;
- 26 baseline obligations, eight exclusions, 12 RC5 implementation families,
  41 X carrier families, and four final-integration dispositions are present;
- D1-D6 and every RC5 implementation row carry explicit admission order;
- 17 features, seven scenarios, R1-R10, all 40 traversal rows, and the separate
  fibre-substitution differential remain represented;
- requirement-definition duplicate scan is empty;
- direct `start` no longer requires One Surface; direct GraphFunction `invoke`
  remains independent of `root_mode`;
- requirement ownership agrees with Product's
  GTL/validator/HoG/implementation/ABG split;
- evaluator and transition outputs remain candidates until ABG admission;
- required T-284 fields and method vocabulary are admitted;
- Markdown table and `git diff --check` gates pass; and
- candidate `7f69aa83` changes no runtime, test, generated, package,
  qualification, release, or M3 design path.

This checkpoint does not accept the candidate or close T-284. Independent
exact-cut review remains required. M3 remains blocked.
