# T-255 Round-Two And T-252 Authority Repair Proof

## Basis

Verification ran in clean detached worktree
`/tmp/abiogenesis-t255-round2` from commit `329edb2`, with only the regenerated
T-252 manifest and four Mermaid-safe punctuation corrections applied. The
uncommitted T-255 prototype and the source worktree's unrelated dirty files were
absent from the proof basis.

## T-252 Authority Repair

- generator authority:
  `.ai-workspace/tickets/completed/T-252-design-and-probe-consensus-gtl-free-construction.md`
- sealed fixture authority: same completed-ticket path
- body digest:
  `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`
- regenerated manifest digest:
  `sha256:d3abc30c985327851c958711afac85514c1db6283a9aca4a94a72b3b9e706439`

The authority-path correction is the only manifest payload change. The body
bytes and body digest remain unchanged.

## Clean Gates

| Gate | Result |
|---|---|
| `npm run generate:t252-consensus-probe` | written; body digest unchanged; new manifest digest sealed |
| `npm run test:t252` | GTL 82/82; T-252 11/11; manifest check passed; 16 observed gap families |
| `npm run test:design-mermaid` | 5/5; all nine registered three-view designs render, covering 27 diagrams |
| `npm run test:semantic` | 1588/1588; strict semantic TypeScript build and GTL law guard green |
| `git diff --check` | passed |

## Review Result

The four reported contradictions are repaired on the design/proof surfaces:

1. T-267 is a hard startup fence before traversal or effects.
2. `abg.schema.tenant-conformance-manifest` remains the only manifest authority.
3. M04 admits raw input before M03 receives the admitted carrier or absence.
4. T-252's sealed proof now cites its completed authority path.

No T-255 implementation is admitted by this proof. Explicit F_H acceptance of
the corrected design remains required.
