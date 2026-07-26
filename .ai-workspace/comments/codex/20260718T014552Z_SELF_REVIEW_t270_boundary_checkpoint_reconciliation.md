# T-270 Boundary And Checkpoint Reconciliation Self-Review

**Date**: 2026-07-18

**Ticket**: `T-270`

**Scope**: Design-only reconciliation of the M04/M03 callable boundary, the
minimum existing T-271 receipt/cursor facts needed for exact T-272 same-locus
continuation, and the cycle-free Consensus schema-key/native-definition
delivery boundary. Runtime remains frozen.

## Verdict

`candidate_pending_independent_fh_review`

The introduction and hard-break section now state the same carrier boundary as
the native sketch and all three diagrams:

- admitted M03 ingress contains ordered digestible
  `RuntimeSchemaAdmissionCapabilityBasis` rows, never a callable;
- the branded callables travel in a separate identity-free process-local AF-15
  engine-input envelope outside every stable hash;
- M04 alone admits Module metadata, asserts opaque native definitions, performs
  their exact flat-key join, and calls the neutral constructor; and
- M03 exact-matches compiler-derived Node/schema requirements to one admitted
  basis and one branded neutral capability without consuming M04 metadata or
  native-definition carriers.

The held checkpoint now preserves the exact existing continuation coordinate:

- `invokeLeaf` threads the existing `CProgramExecutionCursor.cursorDigest`
  through the existing T-271 request/receipt carrier beside `cursorRef`; this is
  conservation only, not a new cursor or authority;
- `inputPayloadRef` and `inputLineageRef` are existing
  `CProgramAtomReceipt` facts; and
- those three facts join the existing held receipt/locus and ordered canonical
  I-JSON rows inside the one event-contained
  `FhHeldExecutionCheckpointBasis`.

The checkpoint still has no identity or digest. The existing
`FhInteractionOpenedEvent.interactionBasisDigest` is the sole seal over its
complete content. No `runId`, invented per-row digest, lookup carrier, second
body, store, event family, public identity, selector, controller, or replay
authority was added.

The schema-delivery boundary is now dependency-safe and Prime:

- each strict Module metadata row has exactly
  `graphFunctionId`, `nodeRef`, `symbolicSchemaRef`, `contractId`, and
  `contractVersion`;
- metadata contains no full `PublicContractCoordinate`, projection digest,
  locator, witness, or callable;
- one T-252/M03 closed schema-key/source family covers every reachable public
  or private Consensus Node schema, including vector schemas;
- T-274B packages that exact Module, derives and supplies the full opaque native
  definitions to M04, and publishes only T-274A's existing nine public assets;
- M04 exact-joins each flat contract key to exactly one asserted definition and
  projects full coordinate/witness facts only into the neutral capability basis;
  zero, multiple, extra, or mismatched rows/definitions refuse; and
- T-275 owns only stdlib, profile, and result bindings.

This removes the T-270 -> T-274B -> T-275 -> T-270 ownership cycle without
making the pure T-252 Module depend on T-274A artifact digests or locators.

No runtime file, requirement, public operation, registry, persistence surface,
or owner module changed.

## Verification

- exact design digest:
  `0dd26ca542f66b113dd1febebdc510a3650da1316aeb675ecac51b9a30eb73fa`
- `git diff --check`: passed
- exact Mermaid views: 3/3 rendered with pinned Mermaid 11.3.0
- Prime JSON: 20 IACS, 20 authoritative, 22 subordinate, 35 promotion tests,
  authority 17 -> 17
- Prime gate and tests: passed, 9/9
- governance gate: passed, 19 tickets and 77 commentary references

Independent F_H review must bind the exact digest before runtime resumes.
