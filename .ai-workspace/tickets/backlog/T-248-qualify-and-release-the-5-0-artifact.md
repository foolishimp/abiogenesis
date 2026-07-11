# T-248 - Qualify And Release The 5.0 Artifact

- id: T-248
- title: Qualify and release the 5.0 artifact (release owner)
- type: release
- ticket_category: release_qualification
- status: backlog
- goal: GOAL-035 successor (campaign model; goal text rewritten by T-249)
- owner: abiogenesis
- priority: high
- governance_scope: RELEASE_METHOD, STDO Method
- change_class: realization_refactor
- re_entry_point: release_candidate
- created_at: 2026-07-12
- source_ticket: T-242 (created under review amendment, codex finding 6)
- admission_condition: T-246 hands over a converged source candidate; release identity fixed by F_H's R4 decision at/for T-249
- dependencies:
  - T-246 converged candidate
  - T-247 claim dispositions (a release may only claim what survived T-249)
  - T-243 settled predecessor line

## Purpose

Own RC publication, qualification, and the final tap for the retargeted 5.0
artifact — the ownership formerly spread across T-235/T-236/T-237/T-240,
which were coupled to the dropped R5/G5 fixed-point identities. Created
because review finding 6 confirmed nothing owned a release cut after the
retirements.

## Scope

- **Release identity comes from F_H's R4 decision** (ABIogenesis 5.0 full
  product, GTL 5 over a settled ABG 4.6 line, or another declared boundary).
  This ticket does not presume one.
- Uses the proven discipline: pack → install → live-proof → digest chain →
  tag, over the settled predecessor line (T-243).
- Release claims are exactly the claims that survived T-249/T-247 — no claim
  is asserted that was removed, and none deferred by silence (definition-
  bearing truth is not debt-eligible).
- Demand-register candidates at qualification time: the packaging-determinism
  gate (reusing the archived carrier equivalence/source-isolation contracts)
  and the self-certifying release snapshot (build/lint/test summaries embedded
  in the manifest — closing the gap found in the odd_glc 0.1 review).
- Released-pair verification with any odd_glc counterpart re-enters here per
  release, as done for rc.3 + odd_glc 0.1.

## Closure Condition

One exact immutable release of the F_H-declared 5.0 artifact: published RC
window passed, qualification evidence cited per surviving claims, final tap
recorded, fresh install verified without rebuild. Or an explicit F_H terminal
disposition of the release window (T-221's one-honest-disposition standard).
