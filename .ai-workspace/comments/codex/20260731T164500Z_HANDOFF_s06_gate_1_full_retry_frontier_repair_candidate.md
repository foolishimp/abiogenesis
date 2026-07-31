# Handoff — S06 Gate 1 Full-Retry-Frontier Repair Candidate

Date: 2026-07-31T16:45:00Z

Owner: T-281 under T-270

Subject class: one bounded Gate 1 repair; delta review only

Acceptance state: not accepted; semantic implementation remains held

## Reviewed Parent

Complete Gate 1 candidate:

- commit: `2a60c2b704ce431804f26238ea0dd0718a4c456a`;
- tree: `fc19ebdf0766050e53b6bc673a4c761ff6ad77c4`.

The independent constructability review passed. The independent authority
review found one local counterexample: `ExecutableRetryInput` selected one
current retry attempt but did not preserve the complete prior-attempt frontier
required by `REQ-R-ABG3-PROJECTION-009..010` and T-281 `CL-05`.

The exact review evidence is:

- `.ai-workspace/comments/codex/
  20260731T162500Z_REVIEW_s06_gate_1_constructability_2a60c2b7.md`; and
- `.ai-workspace/comments/codex/
  20260731T162700Z_REVIEW_s06_gate_1_authority_2a60c2b7.md`.

## One Bounded Repair

The repair preserves the accepted architecture:

```text
explicit verified ABG durable prefix
  + scoped Event Calculus current retry fluent
  + complete admitted prior-attempt event relations
  + verified executable-input preimage
  -> installed ./abg projectExecutableRetryInput
  -> installed ./hog resumeProjectedRetry
  -> ordinary direct HoG completion
```

It changes only these relations:

1. `RetryAttemptFrontier` now contains every attempt row from `1` through the
   selected progress attempt, with exact identities, reason classes, owner
   surfaces, source event kinds/refs/digests/ordinals, and attempt coverage.
2. `assertFullRetryAttemptFrontier` rederives row identity, source-slot law,
   reason coverage, ordinal coverage, summaries, and frontier identity.
3. `ExecutableRetryInput` contains that asserted frontier and selects its final
   row. A latest-only dossier is a refusal, not executable input.
4. `D17` includes the full-frontier carrier, assertion, and complete event
   rehydration closure under the existing installed `./abg` boundary.
5. AX-F09 now stops P1 after two distinct admitted failures under budget three,
   then requires P2 to reconstruct rows `[1, 2]` before resuming attempt three.

No Product meaning, requirement text, Public operation, definition key, owner
allocation, catalog, controller, runtime, package boundary, or milestone
changes. The exact 18/56 map, PFC-F08, D00..D16, D18, all other falsifiers, and
all other accepted candidate relations are unchanged. The one repair allowance
is consumed.

## Subject Inventory

The non-self-referential repair aggregate is SHA-256 over lines of
`path<TAB>git-blob`, sorted by path with `LC_ALL=C`. This handoff is excluded to
avoid self-reference; the final Git tree content-addresses it with the repair.

Aggregate:

`7c81d740c9d3e39ef9138b3d0e2516f97688876a77abe7e2acec3af337af4559`

| Path | Git blob |
|---|---|
| `.ai-workspace/comments/codex/20260731T162500Z_REVIEW_s06_gate_1_constructability_2a60c2b7.md` | `39b66c4cbdce80fe89a0bb9cc77610a9ec842526` |
| `.ai-workspace/comments/codex/20260731T162700Z_REVIEW_s06_gate_1_authority_2a60c2b7.md` | `7dc53e68d65a17a1a30814c7e92ce07171d6aa4b` |
| `.ai-workspace/comments/codex/20260731T163300Z_DECISION_apply_s06_gate_1_full_retry_frontier_repair.md` | `e1eb1d123c4ae3772cb056fb02943bd6ab8b2c04` |
| `.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md` | `98b6665491899d6fa3a51de6b7af491fff2b762d` |
| `.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md` | `34ba002f70c96beb7dbfc01b67b755a8bf5b917d` |
| `AGENTS.md` | `cb97e86db1f050d3ad4db438b152267c9d7d623f` |
| `CLAUDE.md` | `87b96f11dd0c2c029b22fb1411608fabb69f0ff1` |
| `README.md` | `b1f77fa619bc7a84ab624526fbe7276c658e3b7a` |
| `build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | `5787de886bb8d3527439f8d3e5a72a254252da00` |
| `build_tenants/abiogenesis/typescript/design/README.md` | `d96769e2e8c8f2828293bf11601944ab992e5197` |
| `specification/GOALS.md` | `ccec8a301e1ded232946dbb05907e478e4ecca43` |

Base commit before repair:
`2a60c2b704ce431804f26238ea0dd0718a4c456a`.

## Mechanical Freeze Contract

- accepted census blob and SHA remain unchanged;
- the family remains exactly 18 operations and 56 definition keys;
- closure remains `D00..D18`, with only D17's declared internals extended;
- no production, requirement, schema, generator, package, falsifier, semantic
  test, donor, deletion, Gate 2, or later-milestone file changes;
- the prior complete-candidate tree remains immutable review evidence;
- changed current routing surfaces point to this repair handoff rather than a
  rejected predecessor;
- `git diff --check` and scope scans are green; and
- the original eight untracked commentary posts remain unchanged.

## Delta Constructability Review

Inspect the exact repair commit and tree supplied with this handoff. Review
only Section 7.3's full-frontier carrier/projection, D17's amended closure,
AX-F09's three-attempt fixture/oracle, and their tracking.

Seek one concrete counterexample to:

- reconstructing every prior attempt row from admitted events under one exact
  boundary;
- deterministic row/frontier identities and exact source-slot joins;
- authentic P1 construction of two distinct progress rows before clean exit;
- P2 possession only of prefix plus selector;
- exact control/restart equality before attempt three; and
- no Public, local Map, raw-event fixture, test hook, or copied input.

## Delta Authority Review

Review the same exact delta. Seek one concrete counterexample to
`REQ-R-ABG3-PROJECTION-009..010`, T-281 `CL-05`, ABG Event Calculus authority,
HoG-only execution, or the fixed Product/ticket boundary. Confirm that the
repair preserves full prior-attempt identities, reason classes, owner surfaces,
source event kinds, and attempt coverage without creating a second retry
authority or changing Public.

No reviewer edits the subject or proposes broader work. A hard counterexample
now returns once to direct F_H because the repair allowance is exhausted. With
both delta reviews green, this exact candidate returns to direct F_H only for
the complete Gate 1 accept-or-reject decision.
