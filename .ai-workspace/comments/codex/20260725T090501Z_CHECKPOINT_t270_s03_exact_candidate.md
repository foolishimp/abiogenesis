# T-270 S03 Exact Candidate Checkpoint

**Recorded**: 2026-07-25
**Status**: exact candidate frozen; independent review and human acceptance pending
**Ticket**: T-270
**Product outcome**: ABG5-S03

## Exact Subject

- Candidate commit:
  `19f50c17526517145070ccb2ca3c282fce7de1f2`
- Parent:
  `ffcbefc05e0a00ccba4af416b8a4c7add8a870ae`
- Candidate tree:
  `ccbd9d2de236481be7a282af3780b5dd402393c9`
- Changed files: 20
- M05 design SHA-256:
  `f7de6d9f6cd0b1bb27c9ffd2461fcd132b81b4196af101a04d60604169fd81fa`
- Package SHA-256:
  `de1af9e727842a9e2764f954692f1a47bc6ecbd37e8664e924d5450edd2b2a6a`
- Product content digest:
  `sha256:87d35f3eb2164aff6e8bfd528fbdbc6a6ec15a1dd5cf52838fd3aa9d69f103fe`
- Product manifest digest:
  `sha256:999f862d4733d9fe3e58315fbdec3734e4fd81df3f96f972eac2290f7e5804e3`

The commit is the immutable implementation, design, test, and regenerated M4
proof subject. This checkpoint and the ticket status are evidence carriers;
they do not modify the packaged Product.

## Bounded Correction

T-270's four defects bounded the change:

1. Public continuation now requires the explicit durable carrier. Process-local
   state cannot authorize read, response, or continuation.
2. ABG projects the exact pending interaction basis to the installed Product.
   Product semantics evaluates the F_H response before ABG may admit it.
3. Direct and supervised public start now require `until = converged`.
   `first_traversal` refuses before a Run opens.
4. M05 Section 12 now contains the affected S03 Ontology, function and
   authority derivation, whole-family Prime contraction, IACS mapping, module
   visibility, three views, cross-view axioms, and module-owned proof.

No compiler, lowering carrier, Public controller, second runtime, new event
family, new ticket hierarchy, or later Product outcome entered the subject.

## Verification

Run serially against the candidate bytes:

| Gate | Result |
|---|---|
| `npm run test:m5:external` | 36/36 pass |
| `npm run test:m5` | 123/123 pass |
| `npm run test:m4` | 26/26 pass |
| exact-file Mermaid render | 7/7 pass |
| `git diff --check` | pass |

Two detached clean worktrees at candidate `19f50c17` each ran:

```text
npm ci --ignore-scripts
npm run build
npm pack --ignore-scripts --json
```

Both packages produced:

- SHA-256:
  `de1af9e727842a9e2764f954692f1a47bc6ecbd37e8664e924d5450edd2b2a6a`
- npm shasum: `3c612cafaf2fa8644825d7599c3680b36e96febf`
- npm integrity:
  `sha512-LYqTkuS5LIzm/qmGRaD2+OZZzI7+M2MoQnReGikbq1JMdxWVI6z2Aw4fvFZLq/xpVN11+kFi53kGxdhrgJNRjA==`
- package size: 257750 bytes
- tar entries: 172
- identical sorted tar inventory: yes
- identical per-member SHA-256 inventory: yes

## Review Boundary

The four defects bound what changed. Acceptance remains bounded by the full
causal S03 path, all seven GOALS conditions, T-270's review and non-closure
conditions, applicable requirements and accepted design, retained predecessor
claims, and every applicable STDO hard stop.

Accepted M03 and M05 Sections 1 through 11 remain the baseline. M05 Section 12
is the candidate under review. Completed T-272 evidence has no growth or
acceptance authority.

The Codex pen-holder cannot accept this subject. An independent reviewer must
review the exact candidate, after which direct human authority may accept or
reject it. Until then T-270 and S03 remain open, and S05/S06 remain held.
