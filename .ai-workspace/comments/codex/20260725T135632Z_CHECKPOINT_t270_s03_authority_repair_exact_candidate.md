# T-270 S03 Authority Repair Exact Candidate

**Recorded**: 2026-07-25
**Status**: exact candidate frozen; independent review and human acceptance pending
**Ticket**: T-270
**Product outcome**: ABG5-S03

## Exact Subject

- Candidate commit:
  `5956d53343597aae8a1d33770cc23bb6468779b7`
- Parent:
  `1fd933d6699c20ec6dcbb9f5453ad958c1b96537`
- Candidate tree:
  `1173c98af11576ec32d8cdd81388c325e1e1c2c3`
- Changed files: 33
- M05 design SHA-256:
  `cff889b7196b620eb906ce8b1ccc0d0c391de4c42fd75e39bbf09157ea631c71`
- Package SHA-256:
  `2b71690d0e1db1a79543334c2ef7192df5adf064a56953fe911e80b78b5f1181`
- Product content digest:
  `sha256:3f602a21c5021f176608f0a684a23c27390557c7114169c29a9ef7927801b311`
- Canonical Product manifest digest:
  `sha256:4383b0d41901e46cd3acfbabe9c1de044c4f20a1cecf6f4530d669fc7f53940e`

The candidate commit is the immutable implementation, design, test, package
basis, and regenerated M4 proof subject. This checkpoint and the ticket freeze
fields are separate evidence carriers and do not modify that subject. The
pre-existing untracked Claude review of candidate `19f50c17` is excluded.

## Review Findings Disposition

The two reviews of candidate `48beb3f3` were aggregated and repaired inside
T-270:

1. F_H grants are derived from the exact admitted WorkspaceBinding, Program
   digest, compute fibres, and Program-declared interaction requirements.
   ABG independently verifies the complete closed grant set. Missing, surplus,
   reordered, wrong-actor, wrong-policy, and all-F_D surplus-F_H cases refuse.
2. `interaction.respond` rehydrates the admitted root invocation and admits the
   exact actor-operation grant before loading or executing installed Product
   semantics. Instrumented installed negatives prove wrong actor and capability
   execute the evaluator zero times.
3. Product input and F_H response semantics are loaded and invoked by
   `src/product`. ABIogenesis's concrete provider moved to
   `src/product/builtin_semantics.ts` and is not re-exported from the Product
   index. HoG binds only the F_D/F_P leaf port through a leaf-only
   contract/judgment adapter.
4. M05 Section 12 now reconciles the complete active S03 entity, lifecycle,
   authority-role, function, composition, whole-family Prime, IACS,
   three-view, axiom, and operational-lifecycle surfaces. Unselected
   supersede/abandon transitions remain explicit deferred gaps rather than
   realized claims.
5. The module-owned S03 lane directly falsifies Program/grant provenance,
   continuation operation lifecycle/grant resolution, exact HoG leaf-binding
   agreement, and Product-versus-HoG semantic ownership.
6. The durable duplicate negative retries one already appended but unresumed
   operation identity with the refreshed carrier in retained and fresh
   contexts. Exactly one `public_operation_admitted` event remains.

No compiler, lowering carrier, Public controller, second runtime, new event
family, new ticket hierarchy, or later Product-outcome implementation entered
the subject.

## Verification

Run serially against the candidate source state:

| Gate | Result |
|---|---|
| `npm run test:m5:s03-unit` | 4/4 pass |
| `npm run test:m5:external` | 36/36 pass |
| `npm run test:m5` | 127/127 pass |
| `npm run test:m4` | 26/26 pass |
| exact-file Mermaid render | 7/7 pass |
| `git diff --check 1fd933d6..5956d533` | pass |

Two serial clean builds followed by `npm pack --silent` produced byte-identical
archives:

- SHA-256:
  `2b71690d0e1db1a79543334c2ef7192df5adf064a56953fe911e80b78b5f1181`
- SHA-1:
  `b11a2d29babe9ffd41c45c8bb69ecf504828bace`
- archive size: 261212 bytes
- tar entries: 176
- Product payload locators: 175

## Review Boundary

T-270's four defects bound what changed. Acceptance remains bounded by the
full causal S03 path, all seven GOALS conditions, T-270's functional review
and non-closure conditions, applicable requirements and accepted design,
retained predecessor claims, and every applicable STDO hard stop.

Accepted M03 and M05 Sections 1 through 11 remain the baseline. M05 Section 12
is the reconciled candidate under review. Completed T-272 evidence has no
growth or acceptance authority.

The Codex pen-holder cannot accept this subject. Independent review must bind
candidate `5956d53343597aae8a1d33770cc23bb6468779b7`; direct human authority may
then accept or reject it. Until then T-270 and S03 remain open, and S05/S06
remain held.
