# T-255 Compiled Handoff Design Repair Review

**Superseded by**:
`.ai-workspace/comments/codex/20260713T052506Z_REVIEW_GATE_t255_round2_authority_correction.md`

## Verdict

`candidate_repaired_pending_explicit_fh`. The generic per-vector handoff is the
right incremental boundary, but the pre-acceptance prototype cannot be admitted.
Two defects violate the design's load-bearing contracts.

## Confirmed Findings

### P0 - Capability admission fails open

The prototype returns `accepted` for effect-bearing GraphFunctions while
recording `deferred_missing_exact_profile`. Every one of the 35 materialized
T-252 vectors belongs to an effect-bearing GraphFunction. Under
`REQ-M-GTL3-CAPABILITY-007`, missing exact profile truth must block before the
affected execution is admitted.

### P1 - Target rows do not satisfy the existing law

The prototype copies the resolved target binding into a conformance row. The
installed generic defaults predate the current row contract:

- `outputSurfaceRef` is not an `asset-type://.../<targetAssetType>` ref;
- mandatory `targetAssetType`, `edgeRef`, `contractRef`, and `contractDigest`
  fields are absent from required/fixed protocol declarations;
- exact target, edge, and contract literal domains are absent; and
- admission, payload-ledger, edge-assurance, handoff, construction,
  materialization, replay, and closure refs use URI families rejected by the
  current validator.

The current conformance projection and prototype also derive
`targetAssetType` from `Node.name`. That conflicts with
`REQ-R-ABG3-INTERPRET-022`, which forbids display names as target-carrier truth.
The bounded correction is to use the admitted target asset-surface kind while
continuing to key row identity by opaque graph-function, graph, and vector ids.

The focused test confirms the real `typecheckGtlProgram(...)` gate rejects the
rows. This is not a reason to weaken the gate.

### P1 - Projection ownership is duplicated in the test

The test strips one projection discriminator and manually assembles a reduced
edge row. That can drift from runtime projection. T-255 needs one canonical M03
target/edge row projector consumed by both the handoff compiler and conformance
proof.

### P1 - DS-4 profile publication had no durable owner

The design assigns profile publication to DS-4 but no ticket carried it. T-268
now owns that deferred product boundary. T-255 owns profile admission and
compatibility only.

## Bounded Repair

1. Keep the existing T-254 selector, T-265 lineage, composition resolver,
   target-binding resolver, and conformance validator.
2. Correct the installed generic defaults instance to satisfy the already-live
   target-row law.
3. Add one canonical target/edge row projector over exact opaque identities and
   the admitted binding. Do not add a second validator.
4. Make M04 admit the raw profile against its existing public catalog and
   produce one shared host-neutral admitted-profile carrier for M03.
5. Return typed capability blocks for missing or incompatible profiles.
6. Prove generic acceptance with a non-Consensus exact profile. Keep all 28
   flat T-252 candidates profile-blocked until T-268 publishes DS-4 truth.

## Proportional Limits

- no GTL atom or base-algebra change;
- no Consensus branch;
- no runtime controller or traversal-loop rewrite;
- no locally minted public catalog or capability profile;
- no M03 dependency on M04 application code or duplicated catalog carrier;
- no T-267 result-interface or bind-conservation work; and
- no attempt to make successor-owned workflow, batch, retry, HOF, or recurse
  semantics disappear.

## F_H Gate

Explicit review must accept or reprice:

1. the canonical target-row projection and bounded defaults-instance repair;
2. the exact profile carrier/admission contract;
3. the M04 producer -> shared admitted-profile carrier -> M03 consumer seam;
4. fail-closed capability outcomes;
5. T-268 as the DS-4 publication owner; and
6. the proof boundary in which T-255 closes generically while T-252 remains
   capability-blocked pending DS-4.

No implementation change is admitted by this review record.
