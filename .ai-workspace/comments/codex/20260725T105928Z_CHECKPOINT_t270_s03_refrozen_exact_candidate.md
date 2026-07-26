# T-270 S03 Refrozen Exact Candidate Checkpoint

**Recorded**: 2026-07-25
**Status**: exact candidate frozen; independent review and human acceptance pending
**Ticket**: T-270
**Product outcome**: ABG5-S03

## Exact Subject

- Candidate commit:
  `48beb3f38341cc20e4e2d6a2b5a2c4fe0e2e33e2`
- Parent:
  `dea9700a4f1e451228d454fd3e26bff951e8aab1`
- Candidate tree:
  `b0a58f97739d7ee7f79fecb7ca2d2348f78218e4`
- Changed files: 18
- M05 design SHA-256:
  `bc570436e7cef6a5063cbf83350f599745812e579ff1517be0f23b0239ab1f8c`
- Package SHA-256:
  `86a9f68bd61583bb36222538dcd0feec236b7a7de944d2a2451362008b312daf`
- Product content digest:
  `sha256:d6f8920ccbee1fdf26644905de32f53ff72b3c8dfed8748cb1d48fd682d9ed88`
- Product manifest digest:
  `sha256:5eda771f294b76edd8de8ff033731fbdff5f191067b520578689353b087f880e`

The candidate commit is the immutable implementation, design, test, and
regenerated M4 proof subject. This checkpoint and the ticket freeze fields are
separate evidence carriers and do not modify that subject. The pre-existing
untracked Claude review of the rejected `19f50c17` candidate is excluded.

## Bounded Repair

The review findings were repaired inside T-270:

1. continuation reads are idempotent in retained and fresh contexts, while
   response and continue operation identities are admitted exactly once from
   durable event truth;
2. every post-append response or continue outcome returns authority refreshed
   against the resulting event prefix, including post-resume failure;
3. actor-operation `CapabilityGrant` values are admitted with the root
   invocation and later F_H operations must resolve the exact admitted grant;
4. Public no longer imports implementation code; Product semantic and leaf
   effects are bound through HoG's exact installed Product port;
5. M05 Section 12 now dispositions the complete changed atomic-function
   family, performs whole-family contraction against the eight accepted M3
   IACS families, and projects faithful domain, sequence, lifecycle, and axiom
   views; and
6. direct and supervised starts both refuse `until = first_traversal`, while a
   six-C-call direct start proves traversal to convergence.

Resolved continuation authority exhausts append, response, and continue
authority but retains immutable read authority. Superseded and abandoned
continuation transitions are explicit deferred gaps because no selected S03
Product operation authorizes them. They are not claimed as implemented proof.

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
| `git diff --check dea9700a..48beb3f3` | pass |

Two detached clean worktrees at candidate `48beb3f3` each ran:

```text
npm ci --ignore-scripts
npm run build
npm pack --ignore-scripts --json
```

Both produced byte-identical archives:

- SHA-256:
  `86a9f68bd61583bb36222538dcd0feec236b7a7de944d2a2451362008b312daf`
- npm shasum:
  `1d8c46198aea61e51eb127a2ffe010e98cb9536a`
- npm integrity:
  `sha512-aVtKlN347TjhTnf+FZ0quV2xyuk1mtpVOyW5IsIOMyZRIUA2dYC/FjQ2E+gXJimr4rV7YWrLNRaZeZPf7h4yNw==`
- package size: 258847 bytes
- unpacked size: 1830298 bytes
- tar entries: 174

## Review Boundary

T-270's four defects bound what changed. Acceptance remains bounded by the
full causal S03 path, all seven GOALS conditions, T-270's functional review and
non-closure conditions, applicable requirements and accepted design, retained
predecessor claims, and every applicable STDO hard stop.

Accepted M03 and M05 Sections 1 through 11 remain the baseline. M05 Section 12
is the reconciled candidate under review. Completed T-272 evidence has no
growth or acceptance authority.

The Codex pen-holder cannot accept this subject. An independent reviewer must
review exact candidate `48beb3f3`, after which direct human authority may
accept or reject it. Until then T-270 and S03 remain open, and S05/S06 remain
held.
