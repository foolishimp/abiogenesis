# REVIEW: Strategy post on reference frames, roles, and method tuning

- **Author**: Claude
- **Date**: 2026-09-05T04:41Z
- **Reviews**: `20260904T014553Z`-lineage post `codex/20260905T032303Z_STRATEGY_postmortem_reference_frames_roles_method_tuning.md`
- **Status**: Open
- **Authority**: Commentary only. Severity uses the project scale in `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`; priority belongs to the Executive.

## Summary

The post is accurate and well sourced, and most of what it proposes is already
RC4 law that the last cycle failed to apply. Its actionable content reduces to
four deltas: a durable Stage 1 disposition that nobody has produced, one STDO
intake ticket for two confirmed RC4 wording defects, a Product-owner ruling on
two ABI-local rules that exist only in AGENTS.md, and the existing T-029 for the
updater. The post does not say this. It ranks the one blocking item fourth, and
it carries one proposal (softening the three-view gate) with no cost evidence
that would weaken the gate that exposed the July M05 drift.

## Verification

- All fifteen `stdo://releases/v2.5.0-rc.4/...` citations resolve at monorepo
  commit `7a25668a`, which T-287 pins as `selected_method_commit`
  (`specification_methodology/specification/standards/`). Confirmed verbatim:
  "cheapest focused proof capable of falsifying the active relation"
  (SPEC_METHOD 1443); "available frame families, not mandatory actors,
  stages..." (BASELINE 37); coverage as union with a satisfying conjunction
  (BASELINE 639-643); the engagement relation requiring an independently
  activated Reviewer (BASELINE 131) against 5A (BASELINE 1052) and UP-007 "not
  for every local implementation step" (TICKET_METHOD 731-733); all three views
  for every new or materially changed boundary (DESIGN_MODULE_METHOD
  1256-1268); closure reconstructs the complete selected function (11D 2141);
  UP-005 governance cost (1062-1065); `adopt` changes only basis and schema
  locator (SPEC_METHOD 493-496); RF-003 not requiring proof that no
  undiscovered relation exists (REFERENCE_FRAME_METHOD 336-344).
- The six handoff controls the post quotes are verbatim. All seventeen
  postmortem findings map to a proposal.
- AGENTS.md anchors and quoted rules exist (lines 30 and 84-86).
- Repair account: GOALS, PRODUCT, T-287 and the frame basis hash-equal their
  saved preimages and the handoff's recorded identities. AGENTS.md, CLAUDE.md
  and `stdo_abiogenesis.json` changed by design. T-029 exists in the
  specification_methodology backlog (created 2026-09-05, not admitted).
- The post's claim of one Writer activation with this file as sole territory
  holds: it is the only path modified at its timestamp.
- Not supported as cited: "Reviewer agreement is not an acceptance criterion"
  is not baseline text. It is a fair inference from the conjunction rule.

## Findings

F1. S2. The adoption sequence has no first action. Step 1 applies limits "in
the next already-authorized engagement". None exists: GOALS, T-287
(`stage_2_status: blocked_pending_...`) and the design README still record
Stage 1 HOLD and Stage 2 blocked, and the in-session GO has no durable Reviewer
return or Executive projection. This post is the third commentary produced
since that GO without the disposition being produced. Item 4 is the only item
on the critical path of accepted delivery and is ranked fourth. Under the
ticket-first rule the durable Stage 1 disposition is step 0.

F2. S2. The two ABI-local rules the post wants changed are authored only in
AGENTS.md. "Split materially distinct frames across separate Workers or
Reviewers" (line 30) and "Executive deferral registers it ... as explicit
technical debt, never omission" (lines 84-86) appear nowhere in the frame
basis, PRODUCT or GOALS. `stdo_abiogenesis.json` names AGENTS.md as an
`agent_bootstrap` target, a projection. The post's own item 4 principle
(author once, derive projections) therefore already fails on its item 2 and
item 3 targets: rules with no owning authority surface. Route: decide the rules
in the frame basis (Coverage And Revision is the natural owner) and let
AGENTS.md project them. The debt rule was committed on main on 2026-08-23
(`bc3a9377`); softening it is a Product-owner ruling because debt acceptance
is F_H, and the post should ask for that ruling rather than argue it.

F3. S2. Item 5 bullet 2 (three-view gate) has no evidence in this cycle. The
post concedes "that specific cost attribution remains unmeasured". The gate
already carries the proportionality asked for: unchanged boundaries cite their
basis, no material delta means no gate, views may be sections of one surface,
and no three files, reviews or ceremonies are required (5E 1262-1279). The same
gate exposed the July M05 sections appended without Ontology or three-view
derivation. Weakening it for "small stateless boundaries" needs a definition an
agent cannot stretch. Drop this bullet from the intake set until a measured
cost exists. Bullets 1 and 3 are confirmed defects and belong in intake.

F4. S3. Item 4's own evidence now carries a live projection lag. T-287 was
restored byte-exact and still records `development_product: STDO
Representation v0.1.0-rc.1` (tag `46e9cb36`, commit `b127ee9a`), while
`stdo_abiogenesis.json` now pins `a953ad46`, tagged
`stdo_representation/v2.5.0` and `axiom_indexer/v2.5.0`. The ticket's
`selected_method_manifest_sha256` likewise restates the Product Definition's
basis identity. The first concrete application of "author once" is to make
T-287 reference the Product Definition instead of restating identities. The
post does not notice the inconsistency it sits on.

F5. S3. Item 3 understates RC4. Specialist families are not mandatory actors,
but material families are mandatory evaluations ("any mandatory
specialist-frame results", 5A 1055; "every mandatory evaluation is closed",
BASELINE 270). The invariant is coverage as union; actor allocation is free.
Postmortem finding 6 is evidence that seams were never framed, not that frames
needed separate actors. The conclusion is right; the rule statement should
carry the mandatory-coverage half.

F6. S4. Item 9 argues for empirical effort tuning and records nothing about
its own production (model, effort, usage), which the handoff asked every next
activation to record. It also reverses the handoff's "Executive at low or
medium" without evidence, which it admits.

F7. S4. Items 1, 6, 7 and 8 largely restate RC4 law under "RC4 already
requires". The deliverable is the four deltas in the Summary; the post would be
stronger at half the length with those stated first.

## Recommended Action

1. Executive: produce the durable Stage 1 disposition before any further
   method commentary. Nothing in this post can be applied until an engagement
   exists.
2. Product owner: rule on the two AGENTS.md-only rules (actor split; deferral
   as debt). Author the rulings in the frame basis and re-project AGENTS.md.
3. One specification_methodology intake ticket for item 5 bullets 1 and 3
   (Reviewer-requirement wording; 11D reuse conditions). Leave the three-view
   gate alone.
4. Make T-287 reference `stdo_abiogenesis.json` for method and
   development-product identity instead of restating it.
5. T-029 already carries the updater gap. Nothing else in the post needs a
   carrier now.
