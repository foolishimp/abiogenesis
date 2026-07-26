# T-267 Whole-Program Conservation Implementation Self-Review

Date: 2026-07-14
Reviewer: Codex
Checkpoint: `0ce492fa`
Boundary: T-267 realization and proof only

## Authority Checked

- accepted `M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md`
- `REQ-L-GTL3-C-ALGEBRA-016`
- `REQ-R-ABG3-CCALL-002/-004/-014`
- `REQ-R-ABG3-FN-COMP-015/-021..024`
- completed T-269 open-program and bind-stage law
- accepted T-271 complete-program compiler and runtime carriers
- T-255 selected handoff, T-256 declared execution context, and T-257/T-258
  result-authority boundaries

## Realized Path

1. The source projector recompiles the selected Module, GraphFunction,
   GraphVector, T-255 outcome, T-271 complete plan, and any outer fan-out,
   fan-in, or recurse relation.
2. Plan inventory preserves every authored node and emits one work locus for
   each exact invoking plan node. Sequence predecessors and parallel batch
   siblings derive from the sealed plan tree.
3. One static result authority is admitted per invoking locus. Static identity
   remains replay-stable; a separate witness seals current authority and
   evidence without folding volatile evidence into static identity.
4. The compiler emits exact plan-pinned composition, stage, result-interface,
   and bind-conservation rows. Missing transform, evaluate, or consequence
   categories are not synthesized.
5. The existing GTL conformance judge validates plan, locus, result-frontier,
   application, and conservation truth. Partial extension groups fail closed
   when any member appears without the complete carrier.
6. Admission reprojects, recompiles, and re-typechecks the complete submitted
   basis. Its strongest result is `runtime_addressable_not_closed` with
   `effectsPermitted: false`.
7. Runtime-start assertion validates the request and admission identities,
   then stops with the typed T-270 routing gap. T-267 performs no effects.

## Self-Review Findings And Repairs

| Finding | Repair | Evidence |
|---|---|---|
| Legacy tests and declaration checks still encoded the retired fixed transform/evaluate/consequence chain. | Removed compiler-owned category completion and repriced tests to exact open-program and typed startup-block law. | Open one-stage and repeated-role fixtures pass without synthetic stages. |
| Repeated roles became lawful declarations while the legacy runner remained role-indexed. | Added a narrow legacy-route fence; repeated roles must use the complete-program route and cannot collapse to the first role. | Admission positive plus legacy execution negative. |
| Optional complete-program groups were triggered only by their prime key, so another member could be silently dropped. | Every composition, stage, result-interface, and conservation extension now triggers on any member and requires the complete group. | Four partial-key negatives in the focused T-267 lane. |
| Current result-authority fields were mutable without a dedicated witness, but hashing them into static identity broke replay stability. | Added a separate current-authority witness digest while retaining stable static authority and bundle identity. | F_P replay-stability positive and current-authority mutation negative both pass. |
| Conservation projection could normalize duplicate or partial program inventory before judging it. | Added row-level complete-basis, digest, uniqueness, non-empty, and result-frontier membership checks. | Malformed conservation rows remain typed failures before admission. |
| The T-252 probe retained a dead fixed-anchor classifier. | Removed the stale branch and regenerated the canonical manifest. | One observed gap family remains, owned by T-268. |

## Design Alignment

- No C constructor, graph-recurse constructor, Consensus branch, controller,
  runtime loop, or second conformance engine was added.
- Authored stage identity is plan-locus identity, not role identity.
- Interpreter binds remain conservation truth and do not count as authored
  stages.
- The exact outer application relation remains separate from the selected C
  plan.
- Static result-interface authority does not admit runtime payload truth.
- Capability remains external T-268 authority.
- Public runtime routing remains external T-270 authority.

## Verification

- `npm run lint:semantic`: passed.
- `npm run test:semantic`: 1718/1718.
- `npm run test:t267`: 51/51; T-252 probe passed; packed API proof 1/1.
- T-252 body digest:
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`.
- T-252 manifest digest:
  `sha256:1899ba4d15cd734c2af504524a023566b25f8fa35d46badf15d98342289c1a38`.
- `npm run test:t223`: 70/70.
- `npm run test:t250`: 13/13.
- `npm run test:t273`: DS governance passed for 19 tickets and 67 comment
  refs; Mermaid inventory/render tests 7/7; governance negatives 5/5.
- `npm run check:abg-product-publication`: 82 schemas and 40 generated
  publication assets verified from 1118 immutable payload files.
- `npm pack --dry-run --json`: 1119 files; passed.
- `git diff --check`: passed before checkpoint.

## Residual Boundary

This is not ticket closure. The implementation requires an independent
authority-path review because it joins selected program, current result
authority, complete-plan topology, conformance, and runtime-start refusal.
T-270 must not begin from this checkpoint until that review accepts the path
or its findings are repaired. T-268 remains the single canonical census gap,
but capability publication does not replace the T-267 review gate.

The commit is local and unpushed. The pre-existing untracked `node_modules`
link remains untouched.

## Verdict

Implementation is complete and self-review evidence is green. T-267 remains
active at `independent_authority_path_review_required`; no closure decision is
issued here.
