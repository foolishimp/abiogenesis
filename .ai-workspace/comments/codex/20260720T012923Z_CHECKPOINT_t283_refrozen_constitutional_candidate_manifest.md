# CHECKPOINT: T-283 Refrozen Constitutional Candidate

**Author**: codex
**Freeze time**: 2026-07-20T01:29:23Z
**Ticket**: T-283
**Status**: exact replacement candidate frozen for independent review; F_H closure pending

## Candidate Identity

| Field | Exact value |
|---|---|
| construction base | `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8` |
| rejected predecessor candidate | `f1256b6c9e11f9f0ac345e4e59a97cd482afcb86` |
| replacement candidate | `afb35def08b2259046830f87c18b45c95c84001c` |
| semantic-basis SHA-256 | `a97c070bfef704c1e7666271aad40393587269fb2e34097457b2ddd2417c0fcd` |
| constitutional subject files | 80 |
| constitutional aggregate SHA-256 | `c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260` |
| T-283 workflow-basis SHA-256 | `0af581e7cea09a152beb3ebf7f5fa503b017333b061b87cf24830dc96f7f1b91` |
| bounded-amendment decision SHA-256 | `c93c01c07b9a16c5d0dce37ce5c93925c7d07fe3985de507a2523eb9d18b5418` |

## Subject Boundary

The constitutional subject is the sorted changed-file set between the
construction base and replacement candidate limited to:

- `AGENTS.md`, `CLAUDE.md`, and `README.md`;
- `specification/**`;
- `build_tenants/common/design/**`; and
- `build_tenants/abiogenesis/typescript/design/**`.

The 80 files comprise:

| Surface | Files |
|---|---:|
| root read models | 3 |
| specification | 52 |
| common design retirement surfaces | 9 |
| TypeScript design retirement surfaces | 16 |

Tickets are mutable workflow carriers. Comments are immutable evidence and
decision receipts. Both are excluded from the constitutional aggregate.
T-283's exact workflow blob is bound separately above. Any post-freeze change
to its scope, authority, hold, re-entry class, completion contract, or subject
definition invalidates this candidate; review/proof/decision state and receipt
references do not.

No runtime source, contract, test, generated manifest, package, or release
artifact is part of the subject.

## Aggregate Reproduction

```bash
base=1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
candidate=afb35def08b2259046830f87c18b45c95c84001c

git diff --name-only "$base..$candidate" +  | rg '^(AGENTS\.md|CLAUDE\.md|README\.md|specification/|build_tenants/common/design/|build_tenants/abiogenesis/typescript/design/)' +  | LC_ALL=C sort +  | while IFS= read -r file; do
      printf '%s  %s\n' +        "$(git show "$candidate:$file" | shasum -a 256 | awk '{print $1}')" +        "$file"
    done +  | shasum -a 256
```

The first field must equal:

```text
c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260
```

Review receipts may be added outside this aggregate. Any amendment to a
constitutional subject file creates a new candidate and requires fresh review.

