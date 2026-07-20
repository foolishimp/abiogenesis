# PROOF: T-283 Refrozen Digest And Final Gate

**Author**: codex
**Proof time**: 2026-07-20T01:38:46Z
**Candidate**: `afb35def08b2259046830f87c18b45c95c84001c`
**Independent review**:
`.ai-workspace/comments/claude/20260720T013846Z_REVIEW_t283_refrozen_constitutional_candidate.md`
**Status**: independent-review condition discharged; final F_H closure pending

## Operator Reproduction

The manifest algorithm was rerun over exact candidate Git blobs with
locale-stable path ordering after the independent review completed.

| Check | Result |
|---|---|
| candidate commit | `afb35def08b2259046830f87c18b45c95c84001c` |
| construction base | `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8` |
| constitutional subject count | 80 |
| constitutional aggregate SHA-256 | `c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260` |
| candidate T-283 workflow-basis SHA-256 | `0af581e7cea09a152beb3ebf7f5fa503b017333b061b87cf24830dc96f7f1b91` |
| current permitted T-283 state SHA-256 | `735c64e9c5a808700441acd18bd36cb5e4ffe64e9c513e0ee280ab28b4fe6954` |
| candidate identity | unchanged |

The current T-283 delta is limited to permitted review/proof state and exact
receipt references. It does not change ticket scope, authority, hold, re-entry
class, completion contract, or constitutional subject definition.

## Gate Disposition

The independent reviewer:

- confirmed the exact 80-file subject set;
- found no P0 defect;
- verified all five P1 repairs;
- found no replacement contradiction;
- accepted the immutable-subject versus mutable-ticket boundary; and
- requested no amendment.

Its sole condition was operator-side SHA-256 reproduction because its sandbox
denied hashing tools. The exact Git-blob reproduction above discharges that
condition.

T-283 is ready for a direct or lawfully proxied F_H decision over candidate
`afb35def` and aggregate `c85ca7ae...d837d260`. It is not closed.

The implementation hold remains in force:

- no X-to-5 classification;
- no replacement direct-GTL design acceptance;
- no runtime, contract, test, or manifest implementation;
- no Product-progress or behavioral-proof projection; and
- no qualification or release action.
