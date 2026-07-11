# STRATEGY: Risk Completes Probability And Proportionality

**Author**: codex
**Date**: 2026-07-11T18:11:33Z
**Updated**: 2026-07-11T18:18:04Z
**Addresses**: ABIogenesis 5.0 execution-plan approval; the evolving
probabilistic compute model; T-242/T-244/T-249; F_H and Claude risk review in
session on 2026-07-12
**Status**: Open

## Summary

The 5.0 planning review exposed a missing evaluation relation.

ABIogenesis already has:

- probability and uncertainty in the epistemic/probabilistic work boundary;
- proportionality as declared work class reconciled against replay-observed
  cost; and
- risk labels, risk appetite, workspace-risk priority, and risk affect inputs.

What it does not yet state is how admitted facts, probability or uncertainty,
possible adverse consequence, reversibility, and evidence produce a risk
assessment that can lawfully inform proportional treatment, review, or F_H
escalation.

This is not a proposal for a new ABG primitive or proof framework. It is a
candidate missing evaluation relation. Risk management then selects and
maintains a hedge against a named exposure. A hedge at the wrong boundary, with
no current risk basis, or retained after its basis expires is technical debt.
The 5.0 execution risks are the first concrete use case.

## Current Reality

Risk is already present but incomplete:

- `SPEC_METHOD.md` makes ambiguity detection mandatory and makes handling or
  escalation depend on declared risk appetite. It also defines hard stops that
  arithmetic cannot waive: violated guarantees, absent authority, missing
  capabilities, undeclared irreversible effects, and explicit human gates
  (`SPEC_METHOD.md:13-24`, `:350-394`).
- `WORLD_MODEL_METHOD.md` places probability in epistemic overlays for
  uncertainty, ranking, anomaly, and alignment rather than published semantic
  identity (`WORLD_MODEL_METHOD.md:406-428`, `:1087-1098`).
- `PRODUCT.md` defines proportionality as a composable measure over C calls:
  declared class reconciles against replay-observed cost, with sustained
  divergence producing typed signal (`PRODUCT.md:1137-1151`).
- `REQ-R-ABG3-CCALL-017` already permits adaptive selection among declared
  programs using attempt history, prior judgments, capability evidence, and
  declared-versus-observed proportionality.
- `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-007` already suppresses unnecessary F_P
  dispatch when admitted F_D truth can discharge the work.
- `REQ-R-ABG3-FPC-005A/-005B` already names workspace-risk pressure and visible
  risk/confidence policy inputs. The TypeScript realization carries
  `workspace_risk` as a priority axis and `risk: low | medium | high` as a
  traversal affect (`construction_priority.ts:42-54`,
  `traversal_modulation.ts:132-137`).
- T-218's proportional-defense table already used directional likelihood,
  harm, reversibility, and bounded defensive spend as planning controls
  (`.ai-workspace/tickets/completed/T-218-abg-5-0-self-hosting-release-wave.md:212-241`).

These surfaces prove that risk is not a new idea. They also expose the gap:
`risk`, `workspace_risk`, and `risk appetite` are inputs or labels. There is no
declared, replay-citable relation that derives a risk assessment from evidence
and possible consequence before policy chooses treatment.

Pressure is unresolved obligation truth. Gain is expected progress or value.
Consequence is a possible or admitted outcome. Probability is uncertainty about
what will occur. Proportionality measures treatment shape and cost. Risk is the
missing relation between uncertain adverse consequence and the treatment that
is proportionate to the exposure.

## Concrete 5.0 Risk Register

Likelihood bands are planning judgments, not product truth. A reproduction or
new F_H ruling reprices them.

| ID | Failure mode | Likelihood | Consequence | Tripwire / bounded control |
|---|---|---:|---|---|
| `R-5.0-01` | The writer's formalization replaces F_H meaning again: phrases such as `feature-complete`, `stable 5.0`, or `Consensus` carry a different product than F_H intended. | High | Critical product substitution | F_H reads and approves the small load-bearing text set itself, not a summary. Approval binds exact text refs or digests. |
| `R-5.0-02` | T-244 becomes the retired 18-leaf DAG under a new name. Requirement rows justify their own retention; ruling fatigue becomes default-retain. | High | Critical scope expansion | Every row needs an explicit product/use-case verdict and F_H disposition. Existing requirements are evidence under reprice, not votes for their own retention. No implicit retain and no implicit exclude. |
| `R-5.0-03` | The stale campaign/self-host ladder remains reachable after stable-first is declared. | High until repaired | Critical wrong build and release mechanism | Persist stable-first before T-243/T-249; mechanically census T-243 through T-249 and odd_glc dependencies. No active 5.0 gate may require T-245/T-246, GLC 1.0, or dogfood proof. |
| `R-5.0-04` | Required product functionality moves to 5.0.1 with dogfood evidence. | Medium | Critical incomplete 5.0 | Only self-use evidence moves. Runtime, operator workflow, Consensus, conformance, compatibility, and release functionality remain in the 5.0 register unless F_H explicitly removes them. |
| `R-5.0-05` | Consensus arrives only at final-candidate qualification even though the use case is governing the build with Claude and Codex now. | High under the current single final gate | High loss of the requested capability during construction | Split delivery from final qualification: land the smallest invocable Consensus leaf early on the development line, use it during 5.0 work, then rerun the full packed-candidate gate at RC. Give the interim typed dual-review protocol an owner immediately. |
| `R-5.0-06` | Consensus becomes voting, generic Review-to-ticket automation, a scheduler, or automatic ticket mutation. | Medium | High product-boundary drift | Exact contract: attributed panel, governed rounds, typed consensus/dissent/escalation, ticket-ref/digest-bound result, caller/F_H-owned triage and mutation. |
| `R-5.0-07` | ABG/odd_glc ownership collapses again. | Medium | High rival-controller or wrong-product placement | ABG owns runtime, `abg.cli`, SYSTEM GraphFunctions, workspace/catalog invocation, events, continuation, result, and replay. odd_glc contributes profiles, bindings, policies, overlays, and catalog declarations only. |
| `R-5.0-08` | A trusted single-developer desktop is overbuilt for hostile-process, tamper, W2, per-reviewer isolation, signing, or distributed threats. | High given the T-217 review loop | High time loss, architectural distortion, and misplaced-hedge technical debt | Defend malformed GTL at native typing/admission/compiler boundaries and malformed F_P output at response admission. Every further defense must name its risk, placement, expected reduction, cost, and retirement trigger. |
| `R-5.0-09` | T-249 becomes one concentrated approval event that constitutionalizes interpretations by summary. | High without a read gate | Critical constitutional mismatch | Present a per-surface decision table and diff. F_H personally reads the new GOAL-035 closure paragraph; that paragraph is the operative definition of 5.0. |
| `R-5.0-10` | Qualification closes because owner tickets exist rather than because product gates pass. | Medium | Critical false release | T-248 depends on executed row gates and retained-claim successor closure, never ticket creation alone. |
| `R-5.0-11` | Shell, adapter, or test code becomes a second controller while proving the product. | Medium | High false public-product proof | Packed qualification drives public SDK/`abg.cli`; graph composition owns panel/workflow shape and ABG owns runtime truth. |
| `R-5.0-12` | A dependency plan serializes independent work, hides missing owners, or creates another mega-leaf. | Medium | High delivery delay and review opacity | Serialize only actual typed-interface dependencies. Each retained feature gets singular design/realization ownership and inherits its register gate verbatim. |
| `R-5.0-13` | Rulings are relayed second-hand, paraphrased, or accumulated into T-242 until it becomes a shadow constitution. | Medium | High authority drift | Persist rulings verbatim and same-day; freeze T-242 rev 3 except closure bookkeeping; place new constitutional drafting decisions in T-249. |
| `R-5.0-14` | The first dogfood campaign's n=1 or older rc.2 evidence is mistaken for generality. | Medium in 5.0.1 | Medium/High successor drift | Keep the first 5.0.1 dogfood wave small with an explicit go/no-go reading. Failure reprices the premise; momentum is not evidence. |

## The F_H Read Set

The prior failure was not merely that a plan was wrong. Its load-bearing meaning
lived in text that F_H did not have to approve directly.

For this correction, plan approval is not approval of a summary. It binds a
small read set:

1. the stable-first replacement for T-242's old R4 ladder;
2. T-242 rev 3, `Exact 5.0 feature`, for Consensus;
3. T-244 `A5-CONSENSUS-01`, especially its release gate; and
4. T-249's drafted GOAL-035 closure paragraph.

The old R4 paragraph remains history and must be read only to confirm exactly
what stable-first supersedes. The replacement paragraph, not the summary of it,
is what F_H approves.

A future typed approval basis may reuse existing authority/evidence identity
instead of creating new ontology:

```text
ApprovalBasis = {
  subject_refs,
  content_digests,
  approved_claim_refs,
  excluded_claim_refs,
  residual_ambiguity_refs,
  actor_ref,
  decision_ref
}
```

This is a candidate shape, not current law. Its purpose is to make "approved"
mean approval of identified claims rather than approval of nearby prose.

## Candidate Missing Relation

A useful intuition is expected adverse loss:

```text
risk ~= probability(failure | use_context, evidence)
        x consequence(failure | use_context)
```

That scalar is not sufficient as the constitutional carrier. Probability may
be ordinal or unknown; evidence confidence matters; irreversible harm and hard
authority failures override arithmetic; and the same expected value can hide
very different exposure.

The candidate relation should remain multidimensional:

```text
RiskAssessment := assess_risk(
  admitted_facts,
  subject_or_candidate,
  use_context,
  possible_adverse_consequence,
  likelihood_or_confidence,
  impact_scope,
  reversibility_or_recovery_cost,
  detectability,
  exposure_window,
  evidence_refs
)

TreatmentDecision := apply_declared_policy(
  RiskAssessment,
  expected_gain_or_delta,
  declared_vs_observed_proportionality,
  risk_appetite,
  lawful_action_catalog
)
  -> accept | mitigate | verify | split | escalate_fh | block
```

Candidate carrier fields are:

- risk and subject refs;
- use-context and failure-mode refs;
- probability/confidence band, including `unknown`;
- consequence and affected-scope refs;
- reversibility/recovery cost;
- detectability and exposure window;
- evidence and assumption refs;
- proposed controls and their cost;
- inherent and residual risk;
- policy, authority, and decision refs.

The relation completes the current sequence:

```text
probability / uncertainty
  + possible consequence
  + reversibility, detectability, exposure
  -> risk assessment

risk assessment
  + expected gain
  + declared-versus-observed cost
  + risk appetite
  -> proportional treatment
```

Applied to the homeostatic loop:

```text
Model(spec)
  -> transform(a,b)
  -> eval(transform(a,b), Model(spec))
  -> consequence candidates
  -> risk assessment
  -> proportional treatment
  -> continue | mitigate | verify | split | escalate_fh | intent -> ticket

admit ticket
  -> Consensus GraphFunction
  -> ticket.consensus
  -> triage
  -> etc.
```

Consensus reduces uncertainty and produces attributed evidence. It does not own
risk appetite, make an inadmissible action lawful, or bind product status.

## Risk Management Produces Hedges

A risk assessment does not manage risk by itself. Management either accepts the
exposure or selects a hedge: a deliberate cost, constraint, redundancy, check,
fallback, review, or proof obligation intended to reduce one named risk.

A lawful hedge must state:

- the risk and protected claim or use context;
- whether it reduces likelihood, consequence, exposure, detection time, or
  recovery cost;
- the boundary and owner that can produce that reduction;
- its one-time and recurring cost;
- any new risk or lost capability it introduces;
- the evidence expected to show that it works;
- the residual risk and its decision owner; and
- a review or retirement trigger.

The candidate treatment relation therefore needs one more explicit step:

```text
HedgeAssessment := select_hedge(
  RiskAssessment,
  lawful_control_catalog,
  protected_claim,
  boundary_authority,
  expected_risk_reduction,
  implementation_and_recurring_cost,
  introduced_risk_or_constraint,
  evidence_refs,
  review_or_retirement_trigger
)

HedgeDisposition :=
    proportionate
  | under_hedged
  | over_hedged
  | misplaced
  | duplicate
  | expired
```

This is not a universal numeric optimization. Likelihood, impact, reduction,
and cost can be ordinal or partially unknown. Hard authority and irreversible
effect gates still override arithmetic.

Placement is part of correctness. The hedge belongs at the earliest lawful
boundary that can actually prevent, detect, contain, or recover from the named
failure, under the owner that possesses the necessary semantics. Moving it
deeper does not make it stronger when the deeper layer cannot interpret the
risk. Moving it upward can create a second controller or duplicate a native
guarantee.

For the present product:

- malformed GTL is hedged first by native typed interfaces, constructors, the
  linter, and semantic compiler;
- malformed F_P output is hedged by strict declared-result admission and typed
  nonterminal outcomes;
- attributed Consensus results, a declared round limit, and F_H escalation are
  hedges at the Consensus GraphFunction contract; and
- hostile-process tamper resistance, per-reviewer sandboxes, signing, or
  distributed coordination are not justified hedges for the current trusted
  single-developer desktop unless concrete evidence changes the use context.

## Misplaced Hedging Is Technical Debt

A hedge is misplaced when any of these holds:

- it has no named, current risk or evidence basis;
- it sits at a boundary that cannot reduce the risk or does not own the meaning;
- it duplicates a stronger native or lower-level guarantee;
- it protects an out-of-scope or very unlikely threat while degrading the
  probable product path;
- its recurring complexity and maintenance cost are disproportionate to its
  current reduction in exposure;
- it permanently encodes a temporary uncertainty; or
- it lacks a review and retirement trigger.

Such a hedge is technical debt at introduction. A once-proportionate hedge also
becomes technical debt when its risk basis expires, the use context changes, a
native guarantee supersedes it, or replay shows that its cost exceeds its
benefit and it remains in place.

The debt is multidimensional rather than a single score:

```text
HedgeDebtAssessment :=
  recurring maintenance and cognitive cost
  + constrained product capability and delivery delay
  + risk introduced by the hedge itself
  - current evidence-backed risk reduction
```

The minus sign is intuition, not a scalar law. The important claim is that
defensive structure has to keep earning its place. Technical debt therefore
includes not only missing or expedient implementation, but defensive machinery
whose named risk basis is absent, misplaced, duplicated, or expired.

Replay closes the treatment loop:

```text
probability + consequence -> risk assessment
risk assessment + lawful controls -> hedge candidates
expected reduction + cost + authority -> proportional hedge
replay-observed failures, reduction, and cost
  -> retain | tune | move | remove | reprice
```

An observer or tuner may propose that disposition from admitted evidence. It
does not mutate the hedge, risk appetite, or product boundary by itself.

## Computational Placement

The preferred first interpretation is a free construction over existing atoms:

```text
GapPressureRow
  + candidate lawful action
  + admitted evidence
  + use-context/consequence policy
  -> product RiskAssessment GraphFunction
  -> visible risk projection
  -> evaluate_next / evaluate_action policy input
```

The risk projection may inform `PriorityProjection`, forced review, F_H input,
or escalation. It must not select an unpublished action, emit ABG truth, or
close work by itself.

Ownership remains:

| Boundary | Ownership |
|---|---|
| Method / product | Risk vocabulary, protected claims, tolerances, hard stops, and risk appetite |
| GTL / GraphFunction | Declared assessment composition, typed input/output contract, policy refs, and lawful reuse |
| ABG | Admission, execution, events, lineage, replay, continuation, projection, and enforcement that risk cannot widen authority |
| F_D | Mechanical facts and total predicates: identity, authority, blast/affected scope when declared, reversibility flags, threshold comparisons, and schema validity |
| F_P | Plausible failure modes, evidence-qualified likelihood, contextual consequence, and mitigation proposals |
| F_H | Risk appetite and decisions over definition-bearing, catastrophic, ambiguous, or high-residual exposure |
| Linter / semantic compiler | Reject malformed or missing declarations, unknown refs, illegal authority transitions, and unhandled result variants; never manufacture real-world likelihood or consequence judgment |

Hedge ownership follows the same split. The product or method owns the
protected claim, risk tolerance, and control semantics. GTL and GraphFunctions
compose assessment and treatment. ABG supplies admitted facts, execution,
lineage, replay, and enforcement; it does not invent hedges. F_D can prove
mechanical placement and effectiveness claims, F_P can propose or assess
contextual controls, and F_H accepts high residual risk or irreversible
treatment.

The existing `workspace_risk` axis and `risk` traversal affect remain useful
policy inputs. They are not substitutes for the assessment relation.

## Risks Of Adding Risk

Risk modeling can reproduce the same overreach it is intended to prevent.

- A universal numeric score would create false precision.
- A new ABG risk engine would absorb product/domain meaning.
- An assessment that selects actions directly would become a second controller.
- A mandatory risk artifact on every micro change would violate
  proportionality.
- A risk label without evidence would only rename intuition.
- A mitigation checklist could become unbounded defensive work.
- A hedge without a named basis, placement, measured reduction, and retirement
  trigger would institutionalize technical debt as assurance.

Therefore this post does not make risk a 5.0 engine feature. It identifies a
candidate method/product relation for intake. Promotion requires a concrete
change-class decision and proof that existing GraphFunction, typed carrier,
policy, and F_D/F_P/F_H atoms cannot already express the needed use cases.

## Recommended Action

1. Correct the stable-first ticket DAG before any constitutional or product
   implementation work.
2. Add `material risks`, `hedges/controls`, `placement and owner`, `one-time and
   recurring cost`, `expected reduction`, `residual/F_H disposition`, and
   `review/retirement trigger` to each T-244 register row. These fields guide
   approval; they do not authorize the row.
3. Make the F_H read set an explicit T-244/T-249 approval gate.
4. Split Consensus delivery from final qualification: make the smallest
   invocable function an early 5.0 leaf, use it during the build, and retain the
   full packed-candidate release gate.
5. Give the typed dual-review protocol an owner and use it on the next dual
   review as the pre-implementation fixture corpus.
6. Route the general risk relation to method/product intake separately. Do not
   silently make it a 5.0 blocker or an ABG primitive.
7. Stop after the complete T-244 register and F_H read-set review. T-249,
   feature design, implementation, and release remain unapproved until then.

## Closure Condition For This Discussion

The 5.0 plan becomes safe to execute only when every admitted feature row has:

- exact authority and approved meaning;
- verified built proof;
- explicit remaining gap and dependencies;
- singular owner;
- inherited release gate;
- material failure modes;
- bounded hedges proportional to likelihood and consequence, placed at the
  lawful boundary that can reduce the named risk;
- explicit cost, residual risk, and review or retirement trigger; and
- explicit F_H disposition where residual risk changes product scope.

This post remains commentary until a separate intake decision promotes any
part of the risk relation into methodology, product, requirements, or design.
