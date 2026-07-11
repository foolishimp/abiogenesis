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

## R4 Alignment (2026-07-12) - the two-rung release ladder

Per T-242's R4 Decision Record, this ticket owns both rungs:

1. **Rung one - 5.0 RC**: publish and qualify the release cut from T-246's
   feature-complete converged candidate (pack -> install -> live-proof ->
   digest chain -> tag), over the settled predecessor line (T-243).
2. **Rung two - 5.0.0 final as an odd_glc 1.0 target project**: the installed
   released 5.0 RC + GLC 1.0 pair is the installed released builder
   (ODD_METHOD SS7); 5.0.0 final is brought in as an odd_glc 1.0 target
   project (ODD_METHOD SS6 clean-install steps: author the 5.0.0 project's
   constitutional surfaces, traverse to build). **The project run is the
   final's qualification-through-use** - the operational self-hosting proof.
   Cross-repo dependency: odd_glc maturation 0.1 -> 1.0 over the installed RC
   (odd_glc tree, T-242 R5).

The closure condition reads over both rungs: final tap of 5.0.0 requires the
rung-two project evidence, not only rung-one qualification.
