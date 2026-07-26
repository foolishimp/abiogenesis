# CHECKPOINT: T-284 Repaired Candidate Manifest

**Author**: codex
**Freeze time**: 2026-07-20T05:15:07Z
**Ticket**: T-284
**Status**: exact repaired candidate frozen for independent review; M2 open

## Candidate Identity

| Field | Exact value |
|---|---|
| accepted Product basis | `afb35def08b2259046830f87c18b45c95c84001c` |
| repaired candidate | `4ac6617c6450234cfb1c20112a89c286f4e6e7ce` |
| candidate tree | `8921125d947428066618b93f140eb306e286a62c` |
| constitutional subject files | 85 |
| constitutional aggregate SHA-256 | `bc7db5d0d8a172e2ddaf6469853336109b6960742d3cef30380e41a15c475b00` |
| seven-family requirement amendment SHA-256 | `e532304300acfcd127632304bc9373d3d64937428b3ae562e0f9b4ed19ab55a4` |
| correction-vector SHA-256 | `28b5987f014bf42bdaf3e6028f380545e16143b1679b5a723a1a5db33066fe8f` |
| T-284 review-workflow SHA-256 | `892b5383d6a38e5d9a66f814ba73345ec138290bed8948995c084929c10ba39f` |
| repaired self-review SHA-256 | `41d3a26b1d47d061148b3bb87171d60cedf67b3702b7e455e5dd5922b33b1b23` |
| final-integration freeze-manifest SHA-256 | `b3230550394ae7e1f35b821a8f4f3ce6d2e0422cc18a4b54146a6ac97ee1a2bb` |

## Subject Boundary

The constitutional review subject is the union of:

1. the original T-283 80-file constitutional subject; and
2. every additional constitutional path changed between accepted Product
   basis `afb35def` and repaired candidate `4ac6617c`.

The same surface filter applies:

- `AGENTS.md`, `CLAUDE.md`, and `README.md`;
- `specification/**`;
- `build_tenants/common/design/**`; and
- `build_tenants/abiogenesis/typescript/design/**`.

| Surface | Files |
|---|---:|
| root bootstrap/read models | 3 |
| specification | 57 |
| common design retirement surfaces | 9 |
| TypeScript design retirement surfaces | 16 |
| total | 85 |

The five paths added beyond the original subject are:

```text
specification/requirements/abg/REQ-R-ABG3-BINDING.md
specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md
specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
specification/requirements/abg/REQ-R-ABG3-WORKER.md
specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md
```

The full current bytes also reconcile the 39 original-subject paths changed by
the T-283 activation commit. In particular, `INTENT.md` and `PRODUCT.md` differ
from `afb35def` only by stable active status and the T-283 acceptance receipt;
their semantic clauses are not repriced by T-284.

Comments and tickets are excluded from the constitutional aggregate. The
correction vector and current T-284 workflow are bound separately by content
digest. Ticket review/proof status and receipt references may advance without
changing the constitutional subject. A change to ticket scope, change class,
re-entry point, Product basis, migration strategy, hold, required outputs, or
closure contract invalidates this review candidate.

Requirement files use stable `Active` identity. Candidate review state belongs
to this manifest, T-284, and later receipts; accepting the exact subject does
not require a status-only rewrite of requirement bytes.

No runtime source, test, generated manifest, package, qualification artifact,
release artifact, or M3 design is part of the candidate change.

## Aggregate Reproduction

```bash
base=1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
accepted=afb35def08b2259046830f87c18b45c95c84001c
candidate=4ac6617c6450234cfb1c20112a89c286f4e6e7ce
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
bc7db5d0d8a172e2ddaf6469853336109b6960742d3cef30380e41a15c475b00
```

The seven-family requirement amendment aggregate uses the same per-file line
format and sorted path order over:

```text
specification/requirements/abg/REQ-R-ABG3-BINDING.md
specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md
specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
specification/requirements/abg/REQ-R-ABG3-WORKER.md
specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md
specification/requirements/product/REQ-P-POLICY.md
```

Its result must be:

```text
e532304300acfcd127632304bc9373d3d64937428b3ae562e0f9b4ed19ab55a4
```

## Gate Result

- correction-vector digest agrees with T-284;
- donor refs resolve to the recorded local and remote archive commits;
- 26 baseline obligations, eight exclusions, 12 RC5 implementation families,
  40 X carrier families, and three final-integration dispositions are present;
- 17 features, seven scenarios, R1-R10, all 40 traversal rows, and the separate
  fibre-substitution differential remain represented;
- requirement-definition duplicate scan is empty;
- changed requirement ownership agrees with Product's GTL/HoG/host/ABG split;
- direct GraphFunction invocation is independent of `start`-only `root_mode`;
- Markdown table and `git diff --check` gates pass; and
- the candidate commit changes no runtime, test, generated, package,
  qualification, release, or M3 design file.

This checkpoint does not accept the candidate or close T-284. Independent
exact-cut review remains required. M3 remains blocked.
