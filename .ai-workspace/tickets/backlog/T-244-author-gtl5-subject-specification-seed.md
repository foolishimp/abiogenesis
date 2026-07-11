# T-244 - Author The GTL-5 Subject Specification Seed

- id: T-244
- title: Author the GTL-5 subject specification seed (wave one: workflow.C)
- type: specification
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery (campaign model, per T-242)
- owner: abiogenesis
- priority: high
- governance_scope: SPEC_METHOD, ODD_METHOD, GLC discipline
- change_class: requirement_reprice
- re_entry_point: specification/requirements (GTL 5.* additions enter by normal SPEC_METHOD admission)
- created_at: 2026-07-12
- source_ticket: T-242
- admission_condition: blocked on T-242 ratification at the review pause
- dependencies:
  - T-242 course-correction ratification
  - T-220 typed GTL/C algebra (the authoring grammar and gap mechanism)

## Intake Triage

1. Substantive: yes — this is the first of the two real delivery gaps (post
   rev 3 §2 row 6): the build subject does not exist.
2. Boundary: specification authoring only. No runtime, design, or release
   surfaces change under this ticket; realization belongs to campaign waves.
3. Upward walk: the campaign model needs a subject spec before any wave can
   run ⇒ first missing layer is requirements for GTL 5.* ⇒
   `requirement_reprice` ⇒ affected span: new GTL 5.* requirement surfaces
   only ⇒ release scope: none until waves converge.

## Deliverable

The GTL-5 subject specification **seed**: the scoped statement of what GTL 5.*
adds over the frozen 4.6 line, authored under the installed GLC/ODD
discipline, sized so wave one is small (post §8.3 — the first wave is also the
engine-generality test on a framework-shaped subject).

- **Wave one: `workflow.C` realization as subject content** — the honest
  `semantic_not_realized` constructors (`gtl-c-unrealized-workflow-lift` /
  `-batch` / `-retry`) define the exact gap the wave closes; T-226's retired
  design is reference input, not authority.
- The seed defines: subject boundaries (what is in/out of GTL 5.*), the proof
  surface (conformance obligations a wave must satisfy, discovered per the
  earned-depth law — not statically enumerated), and wave-one's closure
  condition in the data-mapper pattern (requirements delivered as code, proven
  by typed exhaustive evidence, converged).
- Later-wave candidates come only from T-242's demand register or admitted gap
  events — the seed must not re-enumerate the retired DAG.

## Closure Condition

The seed specification is admitted through SPEC_METHOD and is scenario-
declarable: T-245's scaffold can bind it as campaign subject input without
interpretation gaps. Wave execution is explicitly out of scope.

## R4 Alignment (2026-07-12)

Per T-242's R4 Decision Record: the subject specification seed is the
**ABIogenesis 5.0 feature-complete register**, not a minimal GTL increment.
Source: the original F1-F27 vision, each feature admitted or excluded by the
**odd_glc-enablement test** (ODD_METHOD SS6: does the method assign this
surface to the installed product, and does odd_glc 1.0 - shipping domain
declarations only per the three-layer ownership law - or the
5.0.0-as-project run require it?). GTL 5.* language features are part of this
register, not a separate product. Wave one remains `workflow.C`. The register
also prices each T-247-held claim (self-conformance, qualification, operator
surface) through the same test, feeding the T-249 dispositions.

## Mandatory Feature Register Input - `A5-CONSENSUS-01`

| Feature | Authority status | Use-case and built evidence | Remaining 5.0 work | Owner | Release gate |
|---|---|---|---|---|---|
| Agent-invocable governed Consensus GraphFunction through `abg.cli` | Mandatory ticket target by the T-242 CR-H decision and its 2026-07-12 review supplement. Generic GraphFunction, composition, recursion, public invocation, and replay law already applies. Exact Consensus product/requirement authority is pending T-249. | Use case: `20260710T180000Z_ANALYSIS_homeostatic_intent_loop_mechanism_inventory.md` and `20260712T210000Z_STRATEGY_consensus_panel_realizes_the_homeostatic_loop_middle.md`. Built atoms: T-217 declared-only ABG SYSTEM entries and closed vocabularies; T-223 packed workspace/catalog/invoke/result/replay path; T-104 cross-workspace allocation law. | Narrow the constitutional exclusion; author the design; publish one executable Consensus graph body and strict input/output schemas; bind an attributed heterogeneous reviewer panel; admit malformed F_P output as typed failure; realize convergence, governed verification rounds, dissent, budget exhaustion, and F_H escalation; project an ordinary typed Consensus result bound to the input ticket ref/digest without status authority; expose a typed ruling/next action usable by normal TICKET_METHOD triage without automatic invocation or mutation; prove installed invocation and replay. Split design and realization into singular ABIogenesis-owned leaves before execution. | ABIogenesis owns the reusable ABG SYSTEM function and runtime truth. Catalog products/hosts own only reviewer profiles, subject bindings, policies, and overlays. odd_sdlc T-166/T-167 are mined evidence, not delivery owners. | From a packed 5.0 candidate, a calling agent uses `abg.cli` to invoke the published function over a real ticket with at least two differently attributed admitted worker profiles; one fixture converges, one recurses after a disputed finding, and one reaches the declared round limit or F_H escalation. Typed decision, dissent, worker identity, evidence, lineage, result, replay, and triage-ready next action are readable. The same public path is proved against an existing bound workspace, another independently bound explicit workspace root, and a caller-created temporary workspace. No shell-owned panel orchestration, automatic scheduler, or ticket mutation supplies closure. |

The two cited posts are demand and gap evidence, not constitutional authority.
`A5-CONSENSUS-01` cannot be marked constitutionally admitted until T-249 lands,
and it cannot be marked realized until the installed release gate passes.
Existing generic authority is `specification/INTENT.md` (GraphFunction and
higher-order composition), `REQ-L-GTL3-GRAPHFUNCTION.md`,
`REQ-R-ABG3-FRAME.md`, `specification/PRODUCT.md` (public SDK/`abg.cli`), and
`REQ-P-PUBLIC-CONTRACTS.md` (`catalog.invoke`, result, and replay). T-249 must
add the exact Consensus product/requirement authority; these generic laws do
not override the current explicit exclusion.
Current/alternate/caller-created temporary invocation roots use the same public
workspace contract. A distinct W2 output root or a different temporary root per
reviewer is not claimed; it enters the design leaf only if the feature's exact
output or isolation contract requires it.
