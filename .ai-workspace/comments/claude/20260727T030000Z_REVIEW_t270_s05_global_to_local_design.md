# Independent Design Review: T-270 S05 Global-To-Local Design

- reviewer: claude (independent, heterogeneous)
- date: 2026-07-27T03:00Z
- subject aggregate: `6a809f94d011962d9888cfa8fa2f59dfd63c1163404db851d9c2eb6880ca2be1`
  — **reproduced exactly**, all three member digests match
- accepted basis: S03 candidate `8865ccff`; M03 and M05 §§1–12
- reviewed from requirements to design atoms; current code not used as
  validity evidence

## Verdict

**The global-to-local frame is the right correction and the twelve decisions
are strong work. But the cut is not yet acceptable: it is not design-method
complete under the installed standard, and it leaves at least one materially
different semantic system lawful.**

Recommend one bounded repair pass, per the handoff's own stop condition.

## Answers To The Four Questions

### Q1 — Does every global decision have one visible local projection and falsification condition?

**Yes.** All 12 decisions carry both a `Local:` projection and a
`Falsified by:` clause; I checked each mechanically. The falsification clauses
are specific and testable (e.g. "retrying `workflow.C`, sibling retry
children, inferred closure, incomplete parent suffix, or duplicate foldback"),
not decorative. This is the strongest part of the cut.

### Q2 — Do the semantic functions and composition satisfy the complete Consensus requirement?

**No — four requirement clauses have no visible local projection.**

| Requirement | Projected? |
|---|---|
| **REQ-P-CONSENSUS-013** — one workspace contract with **three applications** (existing, alternate, temporary), "not three runtime modes" | **absent** — `temporary` appears 0 times; workspace appears only inside replay authority and invocation construction |
| **REQ-P-CONSENSUS-003** — downstream products contribute profiles, subject bindings, policies, overlays **through declared catalog surfaces** | **absent** — `downstream` and `overlay` appear 0 times |
| **REQ-P-CONSENSUS-006** — "the product shall not hard-code one panel cardinality" | **absent** — `cardinality` appears 0 times |
| **REQ-P-CONSENSUS-007** — reduction emits **only** the closed ruling roster | **thin** — `ruling` appears once, and only in decision 12's negative clause |

REQ-013 is the material one. See Q4.

I found no rival global mechanism: the design adds no controller, scheduler,
event family, result store, continuation family, or second runtime, and
`ProjectSourceResult` / `FinalizeSupport` keep the F_H support episode
strictly downstream of admitted source truth.

### Q3 — Can any local path lose or contradict identity, authority, lineage, event, replay, failure, closure, persistence, or public-read law?

**Mostly no, with one real hole.** The partial-stop treatment is genuinely
tight — `AssembleFindingsVector` has no partial-stop output and ABG owns the
disjoint completed/stopping/unstarted partition, so no local path can
manufacture a vector from incomplete fan-out. Retry, foldback, and F_H-support
paths each have explicit falsification conditions.

The hole is REQ-013. Because the design never projects "three applications of
one contract," nothing in it falsifies a local path that binds a temporary
workspace through a *different* relation than an existing one — losing the
single-contract identity law the requirement asserts.

### Q4 — Does the design leave two materially different semantic systems lawful?

**Yes — one, and it is the REQ-013 workspace relation.**

An implementer reading only this design may lawfully build either (a) one
workspace contract with three bindings, or (b) three workspace modes sharing a
name. Both satisfy every stated local projection and falsify none of the
twelve conditions. REQ-013 says (b) is wrong. That is precisely a Product and
topology decision left for code to make, which the ADR's own consequence
clause forbids: "A global decision that cannot be located at local scope is a
design defect."

The panel-cardinality clause (REQ-006) is a second, smaller instance: nothing
in the design prevents a fixed-arity reducer.

## F1 (P1) — The Cut Is Not Design-Method Complete

`DESIGN_MODULE_METHOD.md` (installed projection, operative under STDO
`v2.2.0`) states at :1064:

> If the Ontology, any of the three views, the cross-view evaluation, or
> either accepted verdict is absent, the boundary is not design-method
> complete.

Measured against the subject:

| Element | Present? |
|---|---|
| Ontology | **absent** (`Ontology` appears 0 times) |
| Whole-family Prime contraction | **absent** (`Prime`, `contraction` — 0) |
| Cross-view axiom evaluation | **absent** (`axiom`, `cross-view` — 0) |
| IACS derivation | one negative sentence only ("No new IACS family is introduced") |
| Three views | present **as bullets**, not the required Mermaid triple |

On the views: DMM:892 permits another format "only when it preserves the same
three distinct views **and the same cross-view checks**." The three distinct
views exist in kind; the cross-view checks do not exist at all. And the only
file in the repository containing the phrase `text-native` is this design
itself — the project has ratified no such format, so the design self-authorizes
its own exception.

**Why this is substantive, not paperwork.** The design states: "S05 introduces
these irreducible Product relations," then lists **twelve**. "Irreducible
semantic relation" is the definition of a Prime atom. A cut cannot
simultaneously declare twelve irreducible relations and claim nothing new
requires whole-family Prime contraction. The contraction is exactly the check
that asks whether those twelve are twelve, or whether several
(`ConstructReviewerTask`/`ConstructSubmitterTask`,
`EvaluateReviewer`/`EvaluateSubmitter`) are parameterizations of one atom over
a role variant. Given that S05's churn was caused by unclosed semantic
relations, skipping that check reintroduces the failure mode the cut exists to
end.

Note also that **M05 §13 — the prior S05 treatment — had all ten elements**
(13.1 Boundary Ontology, 13.5 Whole-family Prime contraction, 13.6 IACS,
13.7 three Mermaid views, 13.8 cross-view axioms with the full column set).
The accepted basis for this cut is §§1–12, which excludes §13. So this
document replaces a design-method-complete treatment with a thinner one.

**On the acceptance predicate.** The design closes by limiting independent
review to its four questions. Under operative STDO 2.2 `TICKET_METHOD`,
"ticket or review wording cannot exclude causally applicable Product,
requirement, design, or retained-predecessor authority." DMM is causally
applicable to a design boundary. The predicate cannot scope it out — so I have
answered the four questions *and* the standard.

## F2 (P2) — Two S05 Design Surfaces Now Stand With No Supersession Relation

M05 §13 still exists in the working tree — **1,006 lines** of S05 design —
while this new standalone document also designs S05. Neither the design nor
the handoff states any supersession, retirement, or precedence relation
between them; I grepped both for `Section 13` and found nothing.

That is competing or ambiguous authority over one Product outcome, which is
independently blocking under both the accepted migration law and STDO 2.2's
promotion rule. Whichever way it resolves — §13 superseded by this cut, or
this cut folded into §13 — the relation must be stated, not inferred.

## F3 (P2) — REQ-P-CONSENSUS-015A's Human-Affirmation Gate Is Not Surfaced

REQ-015A (new, and a correct escalation of the carve-out I raised at the S05
candidate) states that S05 closure "requires direct human affirmation that
this support-only exception preserves one public entry," and that "prior
implementation, tests, review, or delegated acceptance shall not silently
supply that affirmation."

The design's decision 10 projects the support mechanics well, but neither it
nor the acceptance predicate records that this decision carries a standing
F_H-affirmation obligation. `affirmation` and `human` appear zero times in the
design. A reviewer or implementer working from the design alone would not know
that clean answers to the four questions still leave S05 closure gated on a
human act.

This is not a contradiction — 015A gates closure, not code derivation — but it
is exactly the kind of obligation that gets lost between artifacts, and the
design is where it should be visible.

## What Is Genuinely Right Here

Worth stating plainly, because the findings above are repairs rather than a
rejection of the approach:

- The global-to-local frame correctly diagnoses the S05 churn: local decisions
  were re-deciding global relations. ADR-045's rule — state the invariant,
  owning authority, module projection, local obligation, and falsification
  condition — is the right shape.
- Decision 7 (ABG events authoritative; diagnostics observations only) and
  decision 8 (retry/child-closure/foldback as shared runtime laws) close two
  seams that produced real defects earlier in this milestone.
- The worker issuing **no** semantic verdict and stopping at mechanical checks
  is the correct separation, and directly answers the role-collapse the
  handoff identifies.
- REQ-015A escalating the F_H support exception to a direct-human gate, with
  delegated acceptance explicitly barred, is a model disposition of a prior
  review finding.

## Recommended Bounded Repair

Consolidated, per the handoff's one-pass rule:

1. Add whole-family Prime contraction over the twelve declared irreducible
   relations, the Ontology delta, and a cross-view axiom evaluation — or state
   explicitly why the accepted §§1–12 Ontology and IACS already discharge them
   for this boundary, which would then need to be a ratified position rather
   than an omission.
2. Either produce the three Mermaid views for this boundary, or ratify the
   text-native format properly — including the cross-view checks DMM:892
   conditions it on.
3. Project REQ-013 (three applications of one workspace contract), REQ-003
   (downstream contribution surfaces), REQ-006 (no hard-coded panel
   cardinality), and REQ-007 (closed ruling roster) as local obligations with
   falsification conditions.
4. State the §13 supersession relation explicitly.
5. Surface REQ-015A's human-affirmation obligation in the design.

Items 3–5 are small. Item 1 is the real work, and it is the item that decides
whether this cut ends the churn or defers it.
