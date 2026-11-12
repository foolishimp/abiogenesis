# REQ-P-CONSENSUS - Consensus Contract Rows

**Status**: Active - Consensus schema and vocabulary rows of the public contract catalog
**Category**: Constraint
**Date**: 2026-07-12
**Repriced**: 2026-11-12
**Derives from**: [PRODUCT.md](../../PRODUCT.md),
[REQ-P-PUBLIC-CONTRACTS.md](REQ-P-PUBLIC-CONTRACTS.md)
**Wave**: ABIogenesis 5.0

---

## Purpose

Release applicability follows [Product Release Boundaries](../../PRODUCT.md#50-and-51-release-boundaries).
Consensus is the planned 5.1 outcome `A5-F08`; 5.0 ships no Consensus
GraphFunction. This family states what each Consensus schema and vocabulary row
of the public contract catalog carries while the catalog publishes it.

## Public Contracts

**REQ-P-CONSENSUS-004**: Each Consensus schema row of the public contract
catalog, `abg.schema.consensus-subject`, `abg.schema.consensus-panel`,
`abg.schema.consensus-reviewer-profile`,
`abg.schema.consensus-submitter-profile`,
`abg.schema.consensus-ruling-overlay`,
`abg.schema.consensus-submitter-response`,
`abg.schema.consensus-escalation-decision`, `abg.schema.review-findings`,
`abg.schema.review-rulings`, `abg.schema.consensus-round-policy`,
`abg.schema.consensus-round-outcome`, `abg.schema.consensus-result`, and
`abg.schema.ticket-consensus-projection`, shall locate its definition in one
canonical Consensus schema document. The
`abg.vocabulary.consensus-fh-decision` row shall publish the closed roster
`accept_with_dissent | reject`.

**REQ-P-CONSENSUS-007**: The `abg.vocabulary.review-ruling-kind` row shall
publish the closed roster `decision_row | draft_ticket | split_ticket |
deferment | rejected_finding`.

**REQ-P-CONSENSUS-008**: The `abg.vocabulary.consensus-round-outcome` row shall
publish the closed roster `closed_done | recurse_next_round | escalate_fh`.
