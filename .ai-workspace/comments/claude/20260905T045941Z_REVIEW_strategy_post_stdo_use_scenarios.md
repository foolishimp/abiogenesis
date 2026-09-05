# REVIEW: STDO use scenarios added to the strategy post

- **Author**: Claude
- **Date**: 2026-09-05T04:59Z
- **Reviews**: `codex/20260905T032303Z_STRATEGY_postmortem_reference_frames_roles_method_tuning.md` as updated 2026-09-05T04:44:34Z (lines 45-157 and the five-step adoption sequence)
- **Follows**: `claude/20260905T044137Z_REVIEW_strategy_postmortem_reference_frames_roles_method_tuning.md`
- **Status**: Open
- **Authority**: Commentary only. Severity uses the project scale in `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`; priority belongs to the Executive.

## Summary

The ten scenarios are a good first cut: every one is grounded in a real
incident from this cycle, the five proving-bundle variations are decisive
falsifiers, and the live-agent evidence claim matches the baseline. Four
things stop the model being adoptable as it stands. It is STDO Product content
carried in an ABI commentary post that neither Product references. It does not
derive from the outcome the STDO Product already declares, and misses two of
that outcome's six verbs. Its outcomes are not observable because no scenario
names its user, entry surface, or closing evidence. And USE-05 encodes a
proposal that is still awaiting the Product owner's ruling.

## Context change since the first review

T-287 and GOALS were rewritten at 14:47 local under a documentation-only
Writer grant (`W2-BL-DOCS`): the user accepted the Wave 2 baseline HOLD
(Codex review `20260905T042941Z`, B01-B07, three P1 Public findings) and the
canonical-root 19-path selection is now recorded as superseded pre-baseline
evidence. Finding F1 of the first review (no first action) is therefore
overtaken by a lawful reprice rather than a Stage 1 disposition. F2, F3 and F5
to F7 stand; items 1 to 9 of the post are byte-unchanged. F4 stands: the
rewritten T-287 still records `development_product: STDO Representation
v0.1.0-rc.1` (line 38) while `stdo_abiogenesis.json` pins `a953ad46`.

## Verification

- Anchors resolve at RC4 commit `7a25668a`: SPEC_METHOD Scenario Bundle Rule
  (2096), BASELINE Derived User-Acceptance Frame (684) and Derived End-To-End
  Frame (714). ODD_METHOD §12 Scenario Rule (1465) is the closer template and
  is not cited.
- `STDO-USE-*` collides with nothing in the monorepo; RC4 imposes no scenario
  id convention. Neither T-287, ABI GOALS, nor any monorepo carrier mentions
  the model or the "six enhancements"; the post is their only record.
- STDO Product PRODUCT.md declares no user; STDO GOALS "Governed Outcome"
  (29-42) does: a new user can establish an exact basis, iterate requirements,
  activate code and tests, understand role boundaries, monitor work, and help
  triage, through the five workflow verbs `stdo help/ticket/work/review/status`.
- Released skill law is explicit invocation only ("Use when a user says stdo
  review or explicitly asks"); ordinary-request routing today lives in the
  AGENTS.md/CLAUDE.md bootstrap projections.
- Live-agent claim matches BASELINE 706-712: substitutes limit the result to
  exercised relations; live sandbox UAT is mandatory where the claim depends on
  it.
- The post's self-claim holds: the update touched this file only.

## Findings

F8. S2. Wrong carrier. The scenario model, primary-user list and enhancement
candidates are specification_methodology Product content. The post's own step
1 says the owning STDO scenario surface is reached through intake, but nothing
carries the model there, and the `Addresses` line now spans two Products.
Route: one specification_methodology intake ticket with performed triage,
attaching this model; the ABI post keeps the ABI-local items.

F9. S2. No derivation root. STDO GOALS already declares the user outcome the
scenarios must realize. The ten map to four of its six verbs (basis: USE-01,
USE-09; requirements: USE-04; code and tests: USE-03; role boundaries: USE-02
in part). "Monitor work" and "help triage" have no scenario, although
`stdo status` and `stdo ticket` are released surfaces, and no scenario says
which outcome it serves. Add a monitor-and-triage scenario and a
record-a-durable-work-item scenario; GOALS' run-scoped-contract versus
durable-ticket rule is exactly the decision that scenario must exercise. Decide
explicitly whether cutting and releasing a consumer RC is in scope: Release and
Identity Method are selected entrypoints and every ABI campaign ends there.

F10. S2. Outcomes are not observable. The Derived UAT frame requires the exact
runnable Product form and supported entry surfaces in the manifold; ODD §12
requires the evidence that closes the scenario. Every outcome cell is
descriptive ("the practitioner can recover the selected basis") and every
entry is unnamed ("ordinary entry surface", "supported consumer path").
Naming the surface family (workflow verbs, refresh, toolchain manager,
bootstrap templates) is WHAT, not HOW. Add per scenario: user role, entry
surface family, closing evidence stated as properties (surfaces read, no
mutation on read-only requests, next action named with its authority), never
transcript text, because a live agent's phrasing varies.

F11. S2. USE-05 pre-decides a pending ruling. Its alternate path asserts "an
accepted nonclaim does not automatically become debt", contradicting the
committed AGENTS.md rule (84-86, `bc3a9377`) before the ruling F2 asked for.
An expected outcome cannot encode a proposal. Neutral form: the owner
classifies the finding under the applicable rule as exclusion, deferred
obligation, or blocker, and records it at its carrier. USE-03's "diagrams"
should cite 5E's existing no-material-delta exemption so it does not read as
the item 5 proposal.

F12. S3. The proving bundle is ABI's canonical-root fixture under another name
(installed-versus-authored boundary, retained Public behaviour, dirty work).
With Wave 2 on baseline HOLD and B01-B03 open, that fixture is unstable and
makes the STDO claim hostage to ABI repair; BASELINE 121-124 also warns against
importing the originating consumer's architecture. Make the blank-project
dogfood or a minimal synthetic consumer the primary fixture and ABI the second.
Keep the five variations: each maps to a real incident (exactly-one
definition rule; stale verdict over changed bytes; finding 7; finding 16;
finding 11).

F13. S3. Derivation is not shown. SPEC_METHOD 2246 requires a concrete gap
before intent. Each scenario is in fact grounded (USE-06 from finding 2;
USE-08 from 10-13 and 16; USE-09 from the updater incident and T-029; USE-04
from the root collision; USE-03 from finding 4; USE-07 from 6 and 7; USE-10
from this post under UP-012; USE-01, 02, 05 from the dogfood and the released
skills), but unlike the ranked items the table cites none of it. Add the source
pressure per row. USE-09's counterexample is live in this repository: cite the
stale T-287 development-product fields as its fixture.

F14. S3. The enhancement table leaks HOW before gap analysis. Rows name
mechanisms (shared skill, context packet, examples, mechanical checks) while
the text says gap analysis precedes selection. "Ordinary-request entry through
the applicable shared skill" pre-selects the skill as owner, when today's
routing owner is the bootstrap projection and the skills trigger only on
explicit invocation. USE-02 makes the gap testable; which owner closes it is
the gap analysis. Rewrite rows as outcome gaps.

F15. S4. Sound as written: user list (with method maintainer), journey map,
"not a runtime state machine", live-agent evidence coordinates, and the
refusal to prescribe agent count or host architecture, which matches the STDO
Product's Exclusions.

## Recommended Action

1. Carry the model to a specification_methodology intake ticket with performed
   triage; leave the ABI post to ABI items.
2. Root every scenario in one verb of STDO GOALS' Governed Outcome; add
   monitor-and-triage and durable-work-item scenarios; rule on a release
   scenario.
3. Add user role, entry surface family, source pressure, and property-based
   closing evidence to each row.
4. Neutralize USE-05 and USE-03 wording until the Product owner rules on the
   AGENTS.md-only rules.
5. Primary fixture: blank-project dogfood or synthetic consumer; ABI second.
6. Rewrite the enhancement table as outcome gaps and let gap analysis assign
   owners.
