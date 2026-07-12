# REVIEW: Design-Stage Back-Fill (508de4c / b3e5e4a / 2c85a88)

**Type:** REVIEW (reviewer seat; first run of the three-view design gate — this
review also calibrates the gate criteria).
**Author:** claude · 2026-07-13
**Subject:** the A5 completed-code design-stage register (nine stages, 27
diagrams), the shared-method three-view gate (§5E), and the Consensus revert.

## Verdict

**Concur: the design phase is READY for F_H disposition.** Structure verified
across all nine stages by me; two stages deep-reviewed against the gate
criteria (the Consensus calibration case and the instruction-protocol design);
the revert and the no-implementation claim verified mechanically. The register
is honest — four `candidate`, four `blocked`, one `rejected`, zero
auto-accepts — and the retrospective found real, previously uncaught
violations in existing code, which is the gate doing exactly what it was
instituted to do.

## Verified vs attested

| Claim | Status |
|---|---|
| Nine stages, each with domain/sequence/state + axiom matrix + gap register | **Verified** — 9 × (1 classDiagram + 1 sequenceDiagram + 1 stateDiagram-v2) = 27 blocks; matrices and gap registers present in all nine |
| Register links + guardrails authority | **Verified** — all nine files exist under the exact register names; `TYPESCRIPT_REALIZATION_GUARDRAILS.md` present |
| Consensus reverted, nothing retained | **Verified** — `2c85a88` removes the implementation; both core files gone from the tree |
| No implementation resumed | **Verified** — `git diff 2c85a88..HEAD -- code/` is empty |
| Shared method gate (§5E) | **Verified faithful** — three mandatory views, cross-view checks, and the load-bearing sentence: "a private loop, service method, plugin, shell, or script may not silently replace a declared workflow transition" |
| 27/27 diagrams **render** | **Attested** — no render checker exists in the repo; my check is structural (block count + kind). Recommend committing the render check as a repo script so the claim is reproducible by any reviewer |

## What the deep samples showed

**The Consensus calibration case is exemplary.** Drawing the as-built code
makes the category error undeniable — `<<unlawful_semantic_center>>` and
`<<unlawful_truth_owner>>` as domain stereotypes; the reviewer loop, prompt
rendering, and plugin-owned closure visible as sequence arrows; rounds shown
as engine-retry re-entry instead of declared recursion. Its gap register
**recovers the demand evidence the plugin destroyed**: `workflow.C`,
`C.batch`, `C.retry`, engine-rendered instructions, governed F_H escalation,
reviewer subwork response-contract admission. One position corrected on my
side: the register rejects **all** salvage by presumption, stricter than my
earlier "salvage the contracts" recommendation — codex's stance is the more
disciplined default and I withdraw mine; salvage re-enters only through a
future design's proven need.

**The instruction-protocol design found new violations in existing code** —
the retrospective earning its cost: M03 synthesizes protocol text and asserted
refs that GTL must declare (a pre-existing prompt-shell-family violation
neither my expansive review nor prior reviews caught); `FpTransportConfig.prompt`
violates HANDLERS-015 in generic handler config; T-223's fixture pins
hard-coded protocol phrases as test authority. Each carries an owner and a
lawful re-entry condition. One routing defect surfaced: the HANDLERS-015 gap's
requirement text still names superseded T-227 as owner — a stale pointer of
exactly the class T-247 holds; add it to the T-249 span.

## The one blocking decision

The register itself states it: **the authority conflict (stable-5.0-first vs
the live self-host/GLC ladder in T-242/PRODUCT/GOALS) must be dispositioned
and persisted by F_H before any design is accepted or implementation
resumes.** Everything now queues behind that one-liner. My standing
recommendation: B-010's unblock collapses the conflict cleanly — builders come
under GLC governance now, making the 5.0 build itself the first dogfood and
5.0.1-as-project the full self-host proof.

## Consequences worth naming

1. **The Next-Code Boundary points the build exactly where the campaign model
   said to go.** Nothing depending on `workflow.C`/`C.batch`/`C.retry` may
   enter code; therefore the C-term realization — wave one as originally
   scoped — is the only lawful next code, now demanded by three independent
   sources: the original register, the Consensus gap register, and the frozen
   line itself.
2. The shared-method commit `b3e5e4a` needs an explicit F_H ratification
   record — it is upstream law now; faithful, but law-by-silence is the
   defect class this week keeps teaching.
3. Remaining seven designs: structurally verified, not yet deep-reviewed.
   Per the register's own evaluation order each gets its independent axiom
   review at its stage disposition — I recommend grinding them in disposition
   order rather than all at once, keeping the focus rule.

## Boundary

Reviewer output; changes nothing. Verification commands and results as stated;
render claim marked attested. The pen owns dispositions and the ratification
records.
