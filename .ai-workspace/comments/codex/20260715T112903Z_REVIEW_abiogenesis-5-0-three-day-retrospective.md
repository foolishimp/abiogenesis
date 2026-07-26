# REVIEW: ABIogenesis 5.0 Three-Day Retrospective

**Author**: Codex
**Date**: 2026-07-15T11:29:03Z
**Addresses**: ABIogenesis 5.0 work from 2026-07-12 through 2026-07-15
**Status**: Open

## Summary

ABIogenesis 5.0 has undergone four materially different corrections since
Sunday:

1. a strategic correction from packaging-fixed-point self-hosting to a
   stable-first 5.0 release;
2. an architectural correction from imperative Consensus orchestration behind
   a `GraphFunction` nameplate to a GTL-authored construction;
3. an assurance correction after independently traced runtime paths disproved
   several self-accepted closure claims; and
4. a product-model correction after Prime contraction exposed that the
   36-operation roster was discovered behavior promoted directly into public
   identity rather than a surface derived from product Ontology.

The common failure was not poor local implementation. It was allowing a
locally coherent realization or proof to become the answer before establishing
that it represented the intended product property, lawful constructive carrier,
complete authority path, and Prime product unit.

This post records lessons and recommended guidance. It is commentary, not
constitutional or design authority.

## Correction Sequence

| Correction | What was initially accepted | What forced re-entry | Result |
|---|---|---|---|
| 5.0 target | A deterministic packaging fixed point presented as self-hosting | The certified loop contained frozen, already-authored source and therefore proved packaging equivalence rather than governed successor authorship | Stable-first 5.0; self-use and campaign dogfood move to the 5.0.1 successor proof |
| Consensus carrier | A 5,293-line implementation with strong contracts, passing gates, and careful replay handling | The constructive body was imperative plugin code with no GTL graph, declared recursion, graph vectors, or lawful graph-owned evaluation surface | Revert the implementation; retain only lawful contracts and reduction insights; institute three-view design gates |
| DS-1 through DS-3 closure | Runtime atoms closed through implementer self-review under delegated F_H execution authority | Independent authority-path tracing found a live T-262 parent-rebind bypass, false census closure, whole-program loss, and disconnected public/runtime joins | Reopen only disproved boundaries; preserve sound atoms; require independent closure review for runtime and admission boundaries |
| Public operation surface | Thirty-six discovered behaviors treated as thirty-six peer public operation identities | Project-wide Prime reduced duplicate realization but did not prove that the public family itself followed product entities, lifecycle, authority, effects, and composition | T-278 bounded intent re-entry; the GTL-program/GraphFunction ambiguity is resolved first, discovered behaviors become no-silence inputs, and public identities become derived projections |

## Major Lessons

### 1. A rigorous proof can prove the wrong property

The abandoned fixed-point plan was internally sophisticated. Its defect was the
meaning assigned to `build`. It proved that predecessor and candidate runtimes
could package already-authored source equivalently. The intended property was
that the governed campaign authors the successor.

The product property must therefore be stated in domain language before its
formal witness is designed. A stronger proof of a substituted property is not
progress toward the original outcome.

Evidence:

- `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`
- completed T-249 stable-first constitutional reprice

### 2. Lawfulness and category precede code quality

The first Consensus implementation passed substantial behavioral review. It
was nevertheless the wrong category: a product-local plugin owned prompt
assembly, fan-out, recursion, and reduction behind a GTL-shaped public name.

The review order must be:

```text
intended product property
-> lawful owning layer
-> lawful constructive carrier
-> authority and effect boundaries
-> behavior and code quality
```

Code craftsmanship cannot cure a category error.

Evidence:

- `.ai-workspace/comments/claude/20260713T010000Z_REVIEW_945b5a2_consensus_graphfunction_expansive.md`
- commit `2c85a889`, reverting `945b5a27`

### 3. Diagrams are executable disambiguation pressure

The domain, sequence, and state views are not presentation artifacts. They
force the design to expose:

- who owns each entity;
- whether a `GraphFunction` contains graph structure or only a nameplate;
- who renders prompts and performs effects;
- whether admission occurs before consumption;
- whether state is replay-derived;
- who authorizes each transition; and
- whether recursion and closure are declared or hidden in code.

If the three views cannot agree, implementation is premature.

Evidence:

- `.ai-workspace/comments/claude/20260713T020000Z_REVIEW_GATE_design_diagram_axiom_evaluation_criteria.md`
- `build_tenants/abiogenesis/typescript/design/DESIGN_SLICE_PRE_CODE_GATE_TEMPLATE.md`

### 4. Discovered behavior is an Ontology input, not operation identity

The 36-operation roster arose by naming every required behavior and treating
each name as a public peer. That is a useful no-silence census, but it does not
derive identity, lifecycle, authority, effect class, composition, or public
promotion.

The required derivation order is:

```text
product entities and relationships
-> lifecycle and authority
-> atomic function candidates
-> higher-order and effect algebra
-> whole-family Prime
-> public operations and other projections
```

Operation count is a result of this derivation. It is not a constitutional
input or a delivery target by itself.

Evidence:

- `.ai-workspace/comments/codex/20260715T080316Z_DECISION_t278_ontology_first_reentry.md`
- active T-278

### 5. Prime must be early, whole-family, and downstream of Ontology

T-277 produced measurable maintenance gains:

- operation roster and branch authorship fell from seven surfaces to two;
- schema-definition algorithms fell from two to one;
- Consensus callable declaration sources fell from two to one; and
- 49 overloads, cases, and wrappers were removed.

Those gains are real. They do not prove that the contracted family was the
right product family. Prime applied after implementation reduces toil. Prime
applied before Ontology acceptance can efficiently optimize an accidental
model.

Prime therefore participates in two checks:

1. derive a logically complete candidate Ontology and contract its complete
   function/carrier family before proposing IACS, public operations, schemas,
   modules, or code; and
2. after F_H target-shape acceptance and constitutional propagation, recompute
   the Ontology basis and verify that the contraction remains valid before
   final design ratification or implementation.

Evidence:

- completed T-277
- `build_tenants/abiogenesis/typescript/design/adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md`

### 6. One Surface is an authority-chain property visible in carriers

Most serious defects were rival-authority defects rather than ordinary logic
errors. Examples included:

- a product-local Consensus traversal and prompt shell;
- a parallel execution-context request carrier;
- caller-authored batch projection truth;
- SDK reconstruction of operation admission metadata;
- manually forged blocked events in tests;
- legacy F_H lifecycle truth beside the current path; and
- manually maintained closure censuses outrunning runtime reality.

One Surface means every adapter, public operation, query, CLI path, and read
model can be traced to the one admitted GTL/ABG evaluation loop. Shared labels
or matching output are insufficient.

### 7. Green tests do not prove authority conservation

The T-262 test suite contained a blocked event, but the event was forged by the
test. The live parent-rebind path always admitted. An adversarial probe carried
an unrelated attacker-selected payload into the next recursion round and still
completed.

Other repairs exposed the same class of issue:

- T-267 selected one result-bearing stage and synthesized a canonical triple
  instead of conserving the complete authored program;
- T-271 erased result truth and accepted caller-owned batch projections; and
- T-256 accepted caller-authored relevance and runtime facts through a second
  carrier.

Tests must drive the real negative path, mutate authority-bearing inputs, and
prove rejection before effects. Presence of a negative vocabulary value in a
fixture is not evidence that production can derive it.

Evidence:

- `.ai-workspace/comments/claude/20260714T010000Z_REVIEW_holistic_ds1_ds3_span_audit.md`
- completed T-262, T-267, and T-271 repair records

### 8. Execution authority and verification authority are distinct

The direct instruction to continue granted execution authority. It did not
make implementer self-review independent assurance. Across approximately
twelve self-accepted runtime closures, independent review found two serious
misses. That is measured process evidence.

Runtime atoms, security-relevant admission, authority joins, closure folds,
and release gates require an independent reviewer to trace the supported path
before closure. Delegated F_H may authorize implementation; it must not be
used as proof that implementation is correct.

### 9. Re-entry must preserve useful evidence without preserving false truth

The successful repairs did not restart 5.0. They retained sound contracts,
atoms, tests, replay carriers, and prototypes while reopening only the false
boundary. This is the practical value of the smallest lawful re-entry point.

Current T-270/T-272 realization should be treated the same way: preserve it as
experimental evidence, do not checkpoint it as accepted 5.0 truth, and map it
onto the accepted Product Ontology and One Surface before closure.

### 10. Governance drift is a system defect

Recent examples include:

- completed T-244 remaining a mutable planning register;
- T-278 self-review counts no longer matching its candidate Ontology;
- ticket metadata lagging implementation state;
- generated publication inventories becoming stale after source changes; and
- two worktrees assigning `T-267` to different subjects.

Ticket uniqueness, source-basis digests, generated censuses, derived registers,
publication parity, and closure metadata require mechanical checks. Manual
agreement across many surfaces is not a reliable control.

## Interpretation Of The Backtracking

The reversals should not be grouped as one rewrite failure.

| Re-entry class | Example | Correct response |
|---|---|---|
| intent/product semantic correction | packaging fixed point versus governed authorship | reprice constitution and release sequence |
| architectural category correction | imperative Consensus plugin behind GTL name | remove unlawful carrier and redesign before code |
| realization/assurance correction | T-262, T-267, T-271 authority defects | bounded repair with live adversarial proof |
| design-family correction | duplicate authorship found by T-277 | whole-family Prime contraction |
| intent/product Ontology correction | `GraphFunction`/program ambiguity plus 36 behaviors promoted directly to operations | bounded `intent_reprice` through T-278 before further realization |

This classification matters because each class has a different lawful repair.
Treating all backtracking as implementation refactoring either under-reacts to
constitutional drift or over-reacts to a bounded defect.

## Immediate Application To ABIogenesis 5.0

The lessons require the following sequence:

1. resolve the INTENT ambiguity between `GraphFunction` as callable work
   contract and graph overlay or GTL composition as program;
2. repair T-278 so its Ontology explicitly maps the mandatory One Surface
   chain and the functions `synthesize_model`, `eval_gap`, `evaluate_next`, and
   `evaluate_action`;
3. regenerate every T-278 census from the current candidate rather than
   manually asserting counts;
4. obtain explicit F_H acceptance of the proposed product shape;
5. update PRODUCT in place as one present-tense source-project definition,
   removing superseded operation-roster truth rather than appending a parallel
   section;
6. propagate that truth through requirements, GOALS, T-244, and active ticket
   ownership;
7. recompute source digests and run whole-family Prime against the accepted
   constitutional basis;
8. ratify one IACS and one public definition/projection family; and
9. reconcile T-270/T-272 realization and continue the DS-4 dependency chain.

## Recommended Guidance And Ratification Routes

This post is the historical and analytical record. Its reusable lessons should
be adopted at the narrowest authoritative surfaces:

| Guidance | Correct authority surface |
|---|---|
| Complete candidate Ontology and whole-family Prime before IACS, operations, schemas, and code | upstream `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md` |
| One constructive control surface and four-function separation | upstream `ODD_METHOD.md` |
| Product is the present-tense source-project definition, not release or install | upstream `SPEC_METHOD.md` and project `PRODUCT.md` |
| Independent closure review for runtime/admission boundaries | upstream `TICKET_METHOD.md`, with a risk-scoped mechanical gate |
| Three-view design and cross-view consistency | `DESIGN_MODULE_METHOD.md`, projected into the tenant pre-code gate template |
| Tenant-specific Prime and public-control-plane decisions | ratified ABIogenesis ADRs and accepted T-278 design surfaces |
| Current delivery actions and dependencies | active tickets, not this post or an ADR |
| Enforcement | generated census, Mermaid, authority-path, ticket-identity, publication-parity, and source-removal checks |
| Agent bootstrap compression | `AGENTS.md` only after shared law is ratified; it must not become the originating authority |

## Recommended Action

1. Keep this post open through T-278 review and correct it if the evidence or
   interpretation changes.
2. Use T-278 itself, reclassified as the bounded `intent_reprice` carrier; do
   not create a second INTENT-reprice ticket.
3. Ratify only genuinely reusable law upstream in `specification_methodology`.
4. Add mechanical gates wherever this retrospective identifies repeated
   manual drift; prose guidance alone did not prevent recurrence.
