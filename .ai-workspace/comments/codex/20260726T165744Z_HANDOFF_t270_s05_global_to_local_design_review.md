# Handoff - T-270 S05 Global-To-Local Design Review

## Why This Review Exists

S05 entered candidate churn because implementation and review repeatedly had
to decide semantic relations that design had not closed. Worker and reviewer
roles also collapsed: each worker self-review changed the subject and forced
another freeze.

This cut stops implementation and resolves S05 as a global-to-local constraint
network. Product-wide identity, authority, lineage, event truth, Event
Calculus, replay, refusal, retry, closure, persistence, and public projection
are designed once. S05 may bind local values and composition to those laws; it
may not redefine them.

## Exact Review Subject

Review these files in this order:

1. `specification/requirements/product/REQ-P-CONSENSUS.md`
   - SHA-256:
     `3dca76c38435ac8ea0b78e8636aeaf0023214eb22c298c77c3fa49178895178c`
2. `build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`
   - SHA-256:
     `6009602004101e722454cc863d09afa208d7ac3d4bf4018d77b41547f897b37e`
3. `build_tenants/abiogenesis/typescript/design/adrs/ADR-045-global-design-constraints-survive-local-projection.md`
   - SHA-256:
     `de6301adfa25185d5eace74124530a852d9cebe4ce784263dd638bba03896755`

Aggregate:
`6a809f94d011962d9888cfa8fa2f59dfd63c1163404db851d9c2eb6880ca2be1`.

The aggregate is SHA-256 over the three standard `shasum -a 256` output lines
above, including paths and newlines, in the stated order.

## Accepted And Excluded Basis

- Accepted Product basis: S03 candidate
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`.
- Accepted design basis: M03 and M05 Sections 1 through 12 at that candidate.
- Current implementation at `7c27f0aa642fb5922e7895bb14575f86e19464a4`
  is retained design-discovery evidence only.
- Current M03/M05 working-file changes, implementation, tests, S06,
  observer/tuner, qualification, and release are outside this design subject.

## Review Questions

1. Does every global S05 decision have one visible local projection and
   falsification condition?
2. Do the semantic functions and composition satisfy the complete Consensus
   requirement without adding a rival global mechanism?
3. Can any local path lose or contradict identity, authority, lineage, event,
   replay, failure, closure, persistence, or public-read law?
4. Does the design leave two materially different semantic systems lawful or
   require code to make a Product, authority, topology, lifecycle, failure, or
   closure decision?

Review from requirements to design atoms. Do not treat agreement with current
code as design validity.

## Mechanical Readiness

- `git diff --check`: pass.
- GFM parse through `pandoc`: pass for all changed authority and design files.
- All exact subject and accepted-basis paths: present.
- Stale discarded design and handoff references: absent.
- Mermaid rendering: not applicable; this delta adds no Mermaid and does not
  modify accepted diagrams.
- Runtime tests and package builds: not run because this is a design-only cut
  and implementation is held.

These checks are readiness evidence, not semantic acceptance.

## Role And Stop Condition

The worker issued no semantic verdict over this subject. Independent
heterogeneous reviewers now assess this exact cut. No authoring changes should
occur during review.

Consolidate all findings before one bounded repair pass. A further
architectural finding after that repair returns to design or direct human
direction; it does not authorize another autonomous patch-review loop.
