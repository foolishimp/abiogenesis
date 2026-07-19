# CHECKPOINT: T-283 Constitutional Candidate Manifest

**Author**: codex
**Freeze time**: 2026-07-19T18:58:20Z
**Status**: exact candidate frozen for independent review; F_H closure pending
**Ticket**: T-283

## Candidate Identity

| Field | Exact value |
|---|---|
| construction base | `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8` |
| semantic-basis digest | `a97c070bfef704c1e7666271aad40393587269fb2e34097457b2ddd2417c0fcd` |
| Phase-1 F_H decision digest | `b5b1c87d81282f0e6bb11ab82bc152ea57b64be5228cc0262f005bb9c71cc7fe` |
| exact subject-file count | 90 |
| subject aggregate SHA-256 | `2ae31b6ebafba983a60a883ba8d26aec99970a6341f5db7b1122828ca6843589` |

The subject is every added, copied, modified, or renamed non-commentary file
between the construction base and the candidate commit, sorted by path. The
two T-283 checkpoint posts are evidence about the subject and are excluded
from the aggregate. The already-committed semantic basis and Phase-1 decision
are immutable construction inputs identified separately above.

The 90 subject files comprise:

- 52 constitutional, requirement, and scenario files;
- 10 active-ticket files;
- 25 common and TypeScript design-authority files; and
- 3 root read models.

There are no deleted files and no runtime source, contract, test, generated
manifest, package, or release artifact files in the subject.

## Reproduction

From the candidate commit:

```bash
base=1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
git diff --name-only --diff-filter=ACMR "$base"..HEAD \
  | rg -v '^\.ai-workspace/comments/' \
  | sort \
  | while IFS= read -r file; do
      printf '%s  %s\n' \
        "$(shasum -a 256 "$file" | awk '{print $1}')" \
        "$file"
    done \
  | shasum -a 256
```

The first field must equal:

```text
2ae31b6ebafba983a60a883ba8d26aec99970a6341f5db7b1122828ca6843589
```

Any subject amendment creates a new aggregate and invalidates review against
this candidate. Review commentary may be added without changing the subject,
but it cannot amend candidate truth.

## Open Gate

This manifest freezes a review subject. It does not accept the candidate. The
remaining gate is method-decorrelated independent review followed by a
separate direct or lawfully proxied F_H decision over the accepted exact
subject.
