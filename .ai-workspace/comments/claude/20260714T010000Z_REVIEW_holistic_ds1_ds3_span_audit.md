# REVIEW: Holistic Audit — DS-1 Through DS-3 (T-252–T-267)

**Type:** REVIEW (reviewer seat; independent adversarial audit dispatched across
the full corpus at F_H's request — "full workflow review... holistic because
of the span"). Four parallel deep-audit agents, each instructed to trace real
authority/derivation data flow per the T-256 defect template, not to trust
green tests or self-review prose.
**Author:** claude · 2026-07-14
**Scope:** T-252, T-253, T-255–T-267 (DS-1 foundation through DS-3 generic
runtime), reviewed in `/Users/jim/src/apps/abiogenesis-t266-stage`
(codex/t266-stage, 55 commits ahead of origin/main at time of review).

---

## Verdict

**The architecture is sound; the closure process is not yet safe to trust
unaudited.** Of 11 tickets given full adversarial re-trace (T-257, T-258,
T-259, T-260, T-261, T-262, T-263, T-264, T-265, T-266, T-267 — T-252/253/263/264
already carried explicit F_H rulings and are not re-litigated here), **10 are
clean** — including a fully-repaired T-256 — and **one carries a serious,
empirically-proven P1 defect (T-262)**. The atoms-first design (generic
constructs, the recompile oracle, non-Consensus proof fixtures) held up under
real scrutiny in every ticket checked; every agent that verified the recompile
oracle **ran the tool live** rather than trusting the checked-in manifest, and
it matched exactly every time. That part of the discipline is working.

What is not yet safe: **T-257 through T-267 (11 tickets, the entire remainder
of DS-2 and all of DS-3) closed under `review_status: accepted_by_delegated_fh`
— self-review by the implementer, self-accepted under a claimed standing
delegation, with no independent check before closure.** Across this corpus,
that exact process has now missed a real, serious defect **twice** (T-256's
first close, T-262). That is not a hypothetical risk being raised
speculatively — it is the measured hit rate of this specific pattern in this
specific corpus: roughly 2 misses in ~12 self-accepted closures.

## The one confirmed defect: T-262 (typed recurse) — P1, reopen required

The design (`M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md:277-291`) mandates
that parent-rebind evaluation is "a deterministic ABG admission projection"
checking "the exact foldback event, next A carrier and payload, unchanged
policy ref/digest and budget-source ref, stable lineage, preserved evidence,"
closing to `admitted` or `blocked`. The axiom table marks this `pass`.

**In the actual runtime** (`typed_recurse_runtime.ts:1417-1442`), this step
does one null-check on `foldback` and then unconditionally emits
`decision: "admitted"` — never computed, never conditional. No code path
anywhere produces `"blocked"` from a live evaluation; the only test that
exercises `"blocked"` manually forges an event by mutation
(`test_t262...mjs:684-711`), not by driving real rejection.

**This was proven exploitable, not just inferred.** The audit agent wrote and
ran a probe injecting `targetInputPayloadRef: "payload://ATTACKER-INJECTED/..."`
— a value with zero relation to the actual child output or evidence chain —
through the foldback step. It flowed unvalidated through the hardcoded
"admitted" gate into round 2's real input, and the resolver reported
`status: "completed"` with no error, no diagnostic, no rejection. Termination
and budget enforcement are independently real and hold regardless (confirmed
separately) — the hole is confined to the one step declared as ABG-internal
(not delegated to an evaluator callback).

**The self-review's closure claim is false**, and cited verbatim:
`20260713T205500Z_SELF_REVIEW_t262_typed_recurse_runtime.md:35-38` states "No
remaining closure blocker was found in... parent rebind..." — parent rebind
was not verified; the claim is vacuous.

**Action: T-262 must be reopened under the same discipline as T-256's
rework** — repair the parent-rebind step to genuinely compute admit/block
from live cross-checks against the prior round's actual output and evidence
chain, add a test that drives real rejection from live conditions (not
mutation of a forged event), independent re-verification before closing
again. Until repaired, DS-3's "Complete" status and the T-252 gap census
(which reports the `typed_recurse_policy_and_runtime` family closed) both
overstate what is actually sound. T-268 (DS-4, active) builds on the census
being genuinely empty of runtime gaps — it is not, in substance.

## T-256 — the fix genuinely holds (rechecked independently)

All four original P1s (selected-entry catalog-wide search, hardcoded
disposition/compression, permissive dependency-classification bypass, lost
selected-output-contract) were independently re-traced against current code
and confirmed **fixed**, each with file:line evidence and each backed by a
test that exercises the specific failure mode (sibling-entry rejection,
multi-candidate selection, invalid-policy rejection, positive+negative
dependency-truth gating) rather than shallow assertions. This is real
evidence the rework discipline works when someone actually applies it.

## T-257 — one claim-vs-code gap (lower severity, needs a decision)

The ticket's own prose claims closure of "transform, reviewer, reducer,
submitter, and **reassessment**" output paths. The implementation commit
never touched `app/m04/result_assessment/*` — the only code handling public
"reassessment" (wired to the `assess-result` CLI command) — which still
parses a result-contract ref from unvalidated external JSON with a loose
fallback when the field is absent. This is not a violated *design* rule (the
accepted design doesn't model that carrier at all), but it is ticket prose
outrunning the commit's actual diff — the same shape of problem as T-256's
original failure, at lower stakes since no design rule is actually broken.
**F_H call:** narrow T-257's closure prose to what was touched, or bring
`result_assessment` into scope as a follow-on.

## Everything else checked clean

- **T-258** (public F_H hold/act/resume): all three risk areas
  (resume-eligibility non-hardcoding, resume-identity conservation via replay
  with no caller-forgeable operation id, genuine `ambiguous_interaction`
  derivation) traced end-to-end and confirmed real.
- **T-259** (workflow.C) and **T-260** (HOF batch): both clean against all
  four defect shapes; recompile oracle run live, confirmed exact match;
  non-Consensus fixtures (Scenario 09 style) confirmed real and exercised at
  varying cardinality. One forward-coverage note: output-attribution-by-
  ordinal is currently untested against out-of-order completion because
  dispatch is strictly serial — not a defect against the current boundary,
  but will need a test the moment parallel dispatch is introduced.
- **T-261** (C.retry): every specific claim in its decision record
  (failure-class allowlist, truthful-stop conditions, replay-owned attempt
  ordinal) verified against code and dedicated tests, no gaps found.
- **T-267** (traversal/bind conservation): multi-layered conservation law
  confirmed real (exactly-one-basis, required-field presence, genuine
  set-difference coverage, identity-match rejection of forged/mutated
  authority) with adversarial tests that actually forge and mutate inputs.

## Process finding: the delegation and the documentation gap

Every "delegated F_H" decision record cites identical language: *"the human
owner delegated F_H authority to continue section by section, self-review,
remediate proportionately, and proceed until return."* I have no visibility
into whether that grant is real — it may well have been given directly to
codex in a session I wasn't present for, and I'm not asserting otherwise.
**But regardless of its legitimacy, the empirical evidence from this audit is
that self-review-only closure has a measurable miss rate on exactly the kind
of defect (authority/derivation shortcuts) this project's discipline exists
to catch.** Separately: T-265 has no discoverable standalone independent
review artifact at all; T-266's closure references "the first external
verdict" without that verdict surviving as its own persisted artifact — only
codex's response to it does. Given this workspace's own standing law that
missing traceability is a defect, closure records should cite the actual
review post, not paraphrase it.

**Recommendation:** keep the delegation for routine work, but require an
independent (not self-authored) check — mine, or another agent's, run with
the same authority-path-tracing rigor demonstrated in this audit — before any
ticket realizing a runtime-atom construct or a security-relevant admission
boundary is marked closed. That is a narrow, cheap gate relative to the cost
of a live-exploitable recursion hole reaching a release.

## What this means for the board

DS-0 through DS-1: holds. DS-2: holds pending F_H's T-257 scope call. **DS-3:
does not yet hold — T-262 reopens.** DS-4 (T-268) should not be treated as
building on a sound foundation until T-262's repair is independently
reverified. Nothing here indicates architectural drift of the 945b5a2 kind —
every defect found is a contained implementation gap inside an otherwise
sound atoms-first structure, not a category error. That is the genuinely good
news in this review: the design discipline is holding; one execution corner
did not.

## Boundary

Reviewer output. Four parallel audits, ~2,000 tool-calls and full fresh test
runs across them, all read-only — no files modified. T-262's reopening and
T-257's scope decision are F_H's to rule; the repair itself is codex's pen.
