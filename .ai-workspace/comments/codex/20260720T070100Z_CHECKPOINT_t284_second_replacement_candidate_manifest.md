# CHECKPOINT: T-284 Second Replacement Candidate Manifest

**Author**: codex
**Freeze time**: 2026-07-20T07:01:00Z
**Ticket**: T-284
**Status**: exact second replacement candidate frozen for independent review; M2 open

## Candidate Identity

| Field | Exact value |
|---|---|
| accepted Product basis | `afb35def08b2259046830f87c18b45c95c84001c` |
| rejected replacement candidate | `7f69aa83e295f0c391616a3a3a2acfafb8f20156` |
| rejected-candidate review | `.ai-workspace/comments/codex/20260720T065243Z_REVIEW_t284_replacement_candidate_independent_agent.md` |
| second replacement candidate | `c6ff2e37cd1b0aab27dbca16419b175e0161cf7b` |
| candidate tree | `862f58a204397bda2f709bfca1535fb60d38b8bb` |
| constitutional subject files | 86 |
| constitutional aggregate SHA-256 | `5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69` |
| nine-family requirement amendment SHA-256 | `d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf` |
| correction-vector SHA-256 | `26cf209f269b86ab7dda924af2dfedeb5edf36bd7fb74cac2b183f092b0ab8e9` |
| X-membership evidence SHA-256 | `bdb13c81868032ca55fae0d8d7ec4caa46a43aa66a8d95aaf38bb30d98ee7133` |
| X-membership rows SHA-256 | `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1` |
| rejected-candidate review SHA-256 | `2092238392ab30912d9f5b87ef5ee931206fc99249ebdef08807045a2241edc4` |
| T-284 review-workflow SHA-256 | `7aec681ec109865756cddcb3258aac5310b277d36bcfddbe08d6da699d694b6d` |
| second replacement self-review SHA-256 | `0faafd6f32c9d530f1b557f10d8b4bbf64c3926a790b4b3dbe4abecfe7aa4d7f` |

## Subject Boundary

The 86-file constitutional subject remains byte-identical to candidate
`7f69aa83`. Candidate `c6ff2e37` changes only:

```text
.ai-workspace/comments/codex/20260720T023314Z_STRATEGY_t284_x_to_5_correction_vector.md
.ai-workspace/comments/codex/20260720T055423Z_EVIDENCE_t284_x_carrier_membership.md
.ai-workspace/comments/codex/20260720T065243Z_REVIEW_t284_replacement_candidate_independent_agent.md
.ai-workspace/tickets/active/T-284-freeze-x-and-derive-5-correction-vector.md
```

Comments and tickets remain outside the constitutional aggregate but are bound
above by exact digest. The evidence commit may add this manifest, the self-review,
and mutable ticket review-state updates without changing candidate `c6ff2e37`.
Any change to vector semantics, membership predicates, ticket scope, change
class, re-entry point, Product basis, migration strategy, donor basis,
implementation hold, required outputs, or closure contract invalidates this
candidate.

No runtime source, test, generated manifest, package, qualification artifact,
release artifact, constitutional file, or M3 design is part of the candidate
change.

## Constitutional Aggregate Reproduction

```bash
base=1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
accepted=afb35def08b2259046830f87c18b45c95c84001c
candidate=c6ff2e37cd1b0aab27dbca16419b175e0161cf7b
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

The subject contains 86 files and produces:

```text
5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69
```

## Frozen-X Membership Reproduction

Feed the sorted frozen-X path list into the executable JavaScript block in
`.ai-workspace/comments/codex/20260720T055423Z_EVIDENCE_t284_x_carrier_membership.md`.
It must report:

```text
total: 1935
families: 49
membership SHA-256: 9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1
```

The 49 predicates are all inhabited and contain no fallback. `XC08` contains
the two lowering carriers. `XC41`-`XC49` explicitly classify the other 119
paths that candidate `7f69aa83` had hidden under its generic `XC41` row.

## Gate Result

- candidate and tree identities reproduce;
- constitutional and nine-requirement aggregates remain unchanged;
- correction-vector, membership-evidence, rejection-review, ticket, and
  self-review digests reproduce;
- all 1,935 frozen-X paths enter 49 explicit semantic/support/export/package/
  historical families; any unmatched path fails reproduction;
- each X family has class, action, destination, admission stage, and owning
  proof in the vector;
- `execution_declaration_compiler.ts` is explicitly classified with lowering
  retirement rather than a generic archive;
- RCI-09, A5-F17, ABG5-S06, D5, D6, GOALS M5/M6, and scenario authority agree:
  portability precedes the STDO 2.0 tap; self-conformance and release follow it;
- `git diff --check` passes; and
- candidate `c6ff2e37` changes no runtime, test, generated, package,
  qualification, release, constitutional, or M3 design path.

This checkpoint does not accept the candidate or close T-284. Fresh independent
exact-cut review remains required. M3 remains blocked.
