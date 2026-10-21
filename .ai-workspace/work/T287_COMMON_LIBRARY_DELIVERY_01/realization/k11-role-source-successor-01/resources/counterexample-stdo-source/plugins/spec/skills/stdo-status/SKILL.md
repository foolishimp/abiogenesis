---
name: stdo-status
description: Produce an evidence-backed read-only STDO project status and bounded triage candidates. Use when a user says stdo status or explicitly asks for progress, blockers, monitoring, or triage help in an STDO-governed project. Do not invoke for generic status.
---

# STDO Status

Report Product and work truth without changing it. The shell command `stdo
status` reports installed-basis integrity; this skill reports project delivery
state from Product-owned authority and evidence.

## Select The Product Basis

Read and apply
[`PRODUCT_BASIS.md`](../../references/PRODUCT_BASIS.md) before reporting status.
Continue only from its exactly-one verified selection. This skill remains
read-only.

## Procedure

1. From the verified definition, read Goals, bound work lanes, selected outcome,
   exact checkpoint/workspace,
   accepted design, proof, and exact review results. Comments and dashboards
   are projections. Acquire owning sections under the selected basis's
   `ACTIVATION.md` section 2, Acquisition; work state and resumption are its
   section 5.
   Resolve each reported ticket to its unique current authoritative carrier,
   including a referenced peer ticket. A historical link, predecessor section
   or another ticket's summary cannot establish its current lane or admission.
   If the carrier is unavailable, report that state as unverified or omit the
   adjacent claim. Distinguish the starting source commit from the later
   admission record and the candidate/evidence checkpoint; do not assign an
   uncommitted decision to the starting commit.
2. Compare with the user's baseline, last accepted checkpoint, or prior durable
   work state. Without one, report current state without inventing a delta.
   Obtain file/checkpoint identities, declared state and evidence freshness
   from their actual tools and carriers. Report explicit unknowns where those
   outputs are unavailable. Judge claim sufficiency separately; do not narrate
   missing computation as if it ran or infer work truth from basis integrity.
   Reuse supported judgments and owner rulings while their exact applicability
   holds. On resume, refresh changed inputs and affected results only; preserve
   unrelated valid progress and the original owner decision.
3. Separate accepted Product movement, active construction, prerequisite
   readiness, preservation/regression evidence, rejected or superseded churn,
   blockers, uncertainty, drift, and next authorized action.
4. Findings may propose triage and a smallest re-entry point. Do not create
   tickets, reprioritize, mutate status, or apply disposition without separate
   authorization.
5. Keep technical triage separate from Product-owned priority and boundary
   effect. When the Executive baseline profile is adopted, this is the Reviewer to
   Executive separation. Use only Product-bound scales, cutoff, and hard stops.
   Never infer percentage completion from prose, commits, test counts, or
   review counts.

For an interrupted or refused operation, report the requested outcome,
observed effect state and the effect owner's retry rule separately, as the
reconciliation of uncertain external effects in ACTIVATION §5 requires. No observed
effect alone does not mean the request is complete or that retry is needed.
Keep unknown effects unknown and withhold repetition until its rule permits it.
For completion, evaluate satisfied obligations, current evidence, required
judgments/rulings and active non-closure conditions. Report missing conditions
without making a fresh review an automatic gate.

## Return

Lead with Product outcome and current boundary. Report basis health, completed
since the comparison point, current work/evidence, blockers/findings, proposed
triage or decisions, and one next already-authorized action. State stale,
missing, or unverified evidence. Keep adjacent observations from becoming
automatic release blockers; when a finding blocks promotion is decided by
EVALUATION §5 When a finding blocks promotion.
