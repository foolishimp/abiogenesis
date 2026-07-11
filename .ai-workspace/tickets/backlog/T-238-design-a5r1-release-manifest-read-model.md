# T-238 - Design The A5-R1 Release Manifest Read Model

- id: T-238
- title: Design the A5-R1 candidate verdict and release addendum read model
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: GOAL-035
- phase: DS-7
- priority: high
- change_intent: >-
    Define the one versioned A5-R1 manifest family that records an immutable
    pre-RC exact-source-candidate verdict and a later immutable released-pair
    addendum without creating a second checker or mutating prior truth.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M05 exact-candidate qualification manifest, release addendum, and citable read model
- dependencies:
  - T-232 self-conformance and observer/tuner proof contract
  - T-234 immutable R5 identity and self-host evidence
  - T-239 complete qualification-enforcement evidence
  - odd_glc T-038 immutable G5 identity and campaign evidence
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
  - specification/requirements/product/REQ-P-SELF-CONFORMANCE.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - build_tenants/common/design/modules/M05-qualification-scenarios.yml

## Target Truth

A5-R1 is one versioned manifest/read-model family with two ordered immutable
records:

1. `candidate_verdict`: produced by T-235 before RC publication over exact frozen
   R5/G5 bytes. It contains exact input identities, required gate rows, owning
   evidence refs/digests, typed dispositions, residuals, bypass state, and one
   RC-trigger-eligible or refused verdict for ABG5-S01 through S07.
2. `released_pair_addendum`: produced by T-237 only after T-240/T-236 and
   odd_glc T-039/T-037 publish. It binds the candidate-verdict digest, accepted
   RC qualification refs, verified remote
   branches/tags/artifacts, released descriptors/manifests/lock/install proof,
   and the terminal ABG5-S08 result.

The public A5-R1 read model composes those exact records. The addendum cannot
rewrite, reinterpret, or make green the candidate verdict. Absence of the
addendum means not-yet-published, not a failed pre-release candidate gate.

## Required Work

1. Define schema, identity, version, digest, subject, and ordering rules for the
   manifest family and both record kinds.
2. Define the complete candidate gate-row census from T-223/T-227/T-228/T-230/T-232,
   T-234, T-239, odd_glc T-038, CAPABILITY-010..013, native/Codex, and exact identities.
3. Define required evidence-ref/digest, command, input, result, stale/red/missing,
   and diagnostic-bypass semantics without reproducing owning checks.
4. Define the pre-release verdict transition and mechanical red/absent/bypassed refusal.
5. Define the post-publication addendum over T-240/T-236, odd_glc T-039/T-037,
   and T-237 RC-lineage, remote, and released-install evidence.
6. Define the citable read projection and explicit pre-release versus terminal
   delivery status without mutable truth or a rival release checker.
7. Publish target map, IACS, carrier diagram, serialization contract, and
   positive/negative proof obligations for T-235 and T-237.

## Closure Law

Close when T-235 can implement the immutable candidate verdict and T-237 can
append the immutable released-pair record from the same versioned contract;
every owning proof has one exact row; missing/red/stale/bypassed evidence
refuses the relevant verdict; and no release-local semantic checker, mutable
verdict, or candidate/post-release dependency cycle remains.

## Non-Closure Conditions

- Released-pair evidence is required to make the pre-release candidate verdict green.
- The post-release addendum changes candidate bytes, gate rows, or disposition.
- A5-R1 reimplements semantic, runtime, campaign, self-host, or conformance checks.
- Evidence text without exact owner/ref/digest satisfies a mandatory row.
- A second manifest/checker/read model becomes co-authoritative.
- Inputs, outputs, errors, owners, consumers, ordering, or serialization remain implicit.

## Proof Surface

- `git diff --check`
- complete owning-gate census review
- carrier/IACS and candidate/addendum state-machine review
- red/missing/stale/bypass negative design
- dependency-cycle and immutability review
- phase-end authority-first design review against T-218, PRODUCT, QUAL, SCENARIOS, and M05
