# ANALYSIS: The Homeostatic Intent Loop — Mechanism Inventory

**Type:** ANALYSIS (commentary, not law; the scope ruling at the end is F_H's)
**Author:** claude · 2026-07-10
**Subject:** F_H's formal signature for intent creation, mapped arrow-by-arrow onto
the substrate at 4.6.0-rc.2 (post dual-review round 2), with the open seams and
one coverage hole named.
**Related:** T-218 (adopted 5.0 target, A5-SH4 supervisor package), T-217 Phase 5,
odd_sdlc T-166/T-167, `20260710T170000Z_REVIEW_codex_5_0_alternate_target_verdict.md`.

## The signature

```
Model(spec) -> transform(a,b) -> eval(transform(a,b), Model(spec))
            -> consequence() -> ( continue | intent -> ticket )

admit ticket -> graph function Consensus -> ticket.consensus -> triage -> etc.
```

The first line is the sense/compare/classify half of the homeostatic loop; the
second is the intent-refinement half. Verdict up front: **the first line is
built end to end; the second line's ends are built and its middle is declared
contract whose realization is parked in the odd_sdlc backlog with no active
carrier anywhere.**

## Line 1 — built, with exact names

### Model(spec) — the admitted model

- Declared law: admitted GTL declarations (registry entries, graph functions,
  scenarios, proof obligations, temporal rules, policy bundles), all replay-
  derived; `deriveGoverningDeclarationSet` yields the governing set per segment.
- Requirement model: requirement route facts + `requirementPressureRefs` on
  instruction manifests + the lineage canary (REQ keys traced code→tests).
- The constitution as data: LAWS-028 — constitutional surfaces witnessed as
  (surface ref, content digest, version line, cited tickets); drift is a typed
  conformance diagnostic with a ratified identity. The model can detect
  corruption of its own reference signal.
- Delta: prose spec semantics are F_P-evaluated, not modeled — by design.
  A5-SP1 (conformance corpus) and A5-SH0 (self-audit) deepen this layer.

### transform(a,b) — the typed transition

Every transform is an event-sourced edge act: `ExecutionBasis` +
`AdvancementTransition` carry it; the c_call spine (opened → fibre_selected →
evidenced → result_admitted → judged) encloses the F_P interior. `a` and `b`
are both replay frontiers — eval always has the pair.

### eval(transform, Model) — the comparator

The evaluator regimes ARE this function: F_D checks the mechanical envelope
against declared config; F_P judges `A.req_i -> B.result_i` against the
requirement model; convergence is the conjunction (runtime truth rule 15).
Above the edge: temporal verdicts (declared rules vs replay), earned depth
(depth-proof maps + mutation outcomes vs declared CDME requirements), the
witness family, and the drift gates evaluating the model itself.

### consequence() — the branch classifier

Terminal close triggers graph-span foldback: `GraphSpanAssessment ->
GraphSpanFoldbackEvaluation -> GraphReentryFrontierProjection ->
GraphReentryPlan`, with severity typed exactly as the signature demands —
`"retry" | "constitutional_reentry" | "reprice" | "block"`
(`graph_span_reentry.ts:139`). Local deviation routes to the earliest
implicated vector; constitutional deviation routes via
`reenter_constitutional_route` carrying a typed `change_class`. The
consequence-projection plugin seam (`ConsequenceProjectionOutcome`,
`admitConsequenceTraversalActionForAllowedCatalog`) constrains the action
space to the declared catalog, and its actions construct intent candidates —
`constructConstructionIntentCandidateFromConsequenceTraversalAction` is the
literal function.

### ( continue | intent -> ticket ) — the fork

- continue: `IterationAdvanceDecision` + applied reentry plan
  (`graph_reentry_planned/applied`).
- intent -> ticket: `deriveObserverTicketDrafts` (`observer_tier.ts:357`)
  performs the intake-triage upward walk deterministically — typed halts map to
  (owner, change_class, re-entry); TICKET_METHOD-shaped, non-constructive
  (read model, never events; the observer tier has zero emit paths — verified
  in dual-review round 2). T-032 ground truth: 12/12, zero misclassifications.
  Ratification is the S4 operator-grammar intake; the tuner branch carries
  parameter-class intents behind the F_H-xor-policy admission law
  (`event_admission.ts` TUNER-005 XOR).

### Line 1 open seams (both named in the adopted T-218)

1. **intent -> ticket crosses a human seam**: draft → S4 intake is an operator
   act; the auto-ratify policy surface is transitional (admission-checked, not
   yet verified against a declared surface). Until it lands the arrow is
   `intent -> draft -> F_H -> ticket`.
2. **Nothing invokes the pipeline**: no trigger/cadence machinery (mined
   A14 Trigger/Window/KPI and A15 RecurrenceProfile, both deferred). The loop
   runs when a traversal runs.

## Line 2 — ends built, middle declared-only

| Arrow | Mechanism | Status |
|---|---|---|
| admit ticket | `admitDefectIntake` route → `DefectIntakeAdmittedEvent` + `intakeRef`; `deriveTicketDraftFromIntake` → `TicketDraftProjection` | **Built, but defect-scoped and halt-gated** ("an intake presupposes a halt... requires a gap_stop terminal to triage"). General ticket admission — feature/plan tickets as runtime carriers — does not exist; tickets otherwise live as .md files outside replay truth |
| graph function Consensus | `gtl://abg/consensus/submitter-reviewer-rounds` (round carriers; `CONSENSUS_ROUND_OUTCOME_VALUES` done/recurse) and `gtl://abg/review/multi-reviewer-assessment` + `findings-to-rulings` (`REVIEW_RULING_KIND_VALUES`: accepted/rejected/deferred/split/needs_consensus/blocked) in `review_consensus_modules.ts` | **Declared only** — the outer contracts subsumed from odd_sdlc 2026-07-09 (T-217 Phase 3); design+realization are odd_sdlc backlog T-166/T-167 (both `status: backlog`, `owner: odd_sdlc`, `change_class: design_reframe`); host bindings stay odd_sdlc-side per the supersession record |
| ticket.consensus | Binding a consensus verdict to a ticket ref as replay truth | **Not realized** — T-167's change_intent names the routing ("findings into decision rows, draft tickets, split tickets... under TICKET_METHOD authority") but no runtime carrier binds a consensus outcome to a ticket |
| triage | `deriveObserverTicketDrafts` upward walk | **Built for halt-derived drafts; not wired to consensus rulings** — a ruling row has no path into the triage derivation |
| etc. | Engine + campaign execution | Built |

## The coverage hole (the actionable finding)

The middle segment — general ticket admission → consensus rounds →
verdict-on-ticket → triage-from-rulings — currently has **no active carrier in
any repo**:

- T-166/T-167: odd_sdlc backlog, unstarted;
- T-217's remaining tail covers only the odd_glc REVIEW host-binding proof
  (P3.5), not the consensus family realization;
- the adopted T-218/5.0 target dispositions F6/F13/F22 but never dispositions
  T-166/T-167 — the consensus family does not appear in any A5 package.

Yet the homeostatic loop's intent-refinement stage runs through this segment,
and A5-SH4's supervisor proof is stronger if observer drafts pass
review/consensus before reaching the F_H seat rather than arriving raw.

## Options for F_H (scope ruling)

- **(a) Name it in 5.0** — a supporting package (or an A5-SH4 rider):
  "consensus/review family realization + general ticket admission +
  ruling→triage wiring". Rationale: the loop being built IS the release's own
  supervisor; consensus is its refinement organ. (My lean.)
- **(b) Activate T-166/T-167 odd_sdlc-side** with abiogenesis consuming per
  three-layer ownership — honors repo-local ownership; slower coupling into
  the 5.0 proof.
- **(c) Defer with a trigger** — accept that the loop's intake seam stays
  raw-draft→F_H through 5.0; name the trigger (e.g., first supervisor
  campaign where draft volume exceeds the F_H seat's review capacity).

Whichever ruling: the disposition belongs in T-218's target-decision queue so
the family stops being the un-dispositioned row.
