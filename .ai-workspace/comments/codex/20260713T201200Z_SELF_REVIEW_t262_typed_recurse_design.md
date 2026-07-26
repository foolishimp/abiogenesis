# T-262 Typed Recurse Runtime Design Self-Review

**Date**: 2026-07-13
**Subject**: `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md`
**Disposition**: pass after bounded repair; recommend delegated F_H acceptance

## Authority Checked

- `REQ-L-GTL3-RECURSE-001..008`
- `REQ-L-GTL3-LAWS-009`
- `REQ-L-GTL3-CONTRACT-LAW-API-006`
- `REQ-R-ABG3-FRAME-001..006`
- `REQ-R-ABG3-LINEAGE-001..005`
- `REQ-R-ABG3-PROVENANCE-001..006`
- T-262 boundary, exit conditions, and non-closure
- Design Module three-view, transition-owner, and graph-native rules

## Findings And Repairs

| Finding | Severity | Repair |
|---|---:|---|
| the first draft described parent rebind evaluation as another callback, allowing caller-authored continuation truth | P1 | parent rebind is now deterministic ABG admission over the declared B-to-A foldback, unchanged policy, lineage, carriers, payload, and preserved evidence; the next operand call performs semantic re-evaluation |
| foldback originally preserved evidence but did not explicitly preserve policy identity and budget-source authority | P1 | foldback and parent admission now require exact policy ref/digest and budget-source ref continuity before another ordinal |
| a positive runtime bound is not a field of the unchanged GTL recurse declaration | P1 | the design keeps GTL syntax authoritative for evaluator/foldback and admits a separate positive domain-policy projection bound to the exact A payload; no compiler default or body edit is permitted |
| child completion could be misread as parent closure | P1 | admitted B must pass the declared termination evaluator; a foldback result must then pass deterministic parent rebind admission before another child call |
| adding a registered design retained the prior fixed gate count | P2 | register, gate, and mutation expectation move from 12/36 to 13/39 and the test title is exact |

## Canonical Consumer Check

The unchanged T-252 `round` body has one and only one
`recurse_next_round` route:

- vector `graph-vector://abg/consensus/recurse-post-submitter`;
- source includes `PostSubmitterSemanticAssessment` and round policy truth;
- stage role `route_post_recurse`;
- evaluator consumes post-assessment disposition and round policy budget; and
- the initial assessment can close, select submitter work, or select F_H, but
  cannot recurse.

The recurse wrapper still preserves the exact round input/output boundary and
declares one closed termination evaluator plus one `rebind` foldback requiring
parent evaluation.

## Cross-View Result

- exactly three ordered Mermaid views are present;
- every participant, lifecycle carrier, and transition has one owner;
- selected catalog authority narrows to one digest-bound Module and permits a
  private operand without helper publication;
- replay owns ordinal, dangling stage, current A, and lineage;
- child, termination, and foldback callbacks remain subordinate until ABG
  event admission;
- budget is checked before the next child or foldback effect;
- `C.retry` has no recurse transition; and
- T-267/T-268 remain explicit fences in all three views.

## Proportionality

The accepted slice is one direct tail-recursive GraphFunction application.
Nested and mutual recursion, parallel recursion, scheduling, graph rewrite,
and product-specific round control remain outside scope. The design does not
change the GTL recurse syntax or the T-252 body.

## Evidence

- Mermaid structural/render gate: 13 files, 39 diagrams, passed;
- Mermaid renderer: 11.3.0;
- Mermaid source-set digest:
  `sha256:c35106b2f7a582105301eef195de89907080a34e609c37091e67434049b8e3e9`;
- Mermaid mutation suite: 5/5 passed;
- `git diff --check`: passed.

## Verdict

`pass`. No blocking design finding remains. Implementation is authorized only
for the direct recurse relation and its replay-owned runtime contract.
