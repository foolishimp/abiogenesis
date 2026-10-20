---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/design-module-method/v1
source_ref: ../DESIGN_MODULE_METHOD.md
source_digest: 84ecd60707dd26c0248e160336b9eb5d346d80197d441175aa48ca82b1dad409
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-06-30
stale_if_source_digest_changes: true
---

# DESIGN_MODULE_METHOD Compressed Authority

## Governing Claim

A design module is the current realization contract between requirements and
code. It owns structure, interfaces, coupling, state, effects, data flow, proof,
and module boundaries for the realization surface.

It confirms, but does not invent, the operational lifecycle signal supplied by
`SPEC_METHOD.md`, requirements, design, release, deployment, or operational
surfaces.

## Prime Rules

- One truth surface for each decision; no rival local centers.
- Prefer total functions, closed enums, explicit state, and deterministic folds.
- Separate pure decision logic from effect edges.
- Use typed carriers rather than ad hoc string parsing when structure exists.
- New carriers require ownership, admission, diagrams, and proof.
- Delete or subordinate old deciders during consolidation; do not leave
  compatibility wrappers as hidden rivals.
- Confirm each governed boundary against the canonical `SPEC_METHOD.md`
  operational lifecycle chain. Each phase must be answered, declared not
  applicable with a reason, or recorded as a named `Gap:` / `Unanswered:`
  item.
- Code, tests, generated artifacts, runtime fixtures, prompt prose, and local
  convention may prove lifecycle claims, but must not invent lifecycle
  authority.

## Prompt-Relevant Rules

- Prompts may reference design obligations and boundaries but must not become
  design authority.
- A worker may be told where to inspect and what contract to satisfy.
- A worker must not be given an F_D-authored semantic extraction recipe when the
  edge requires F_P judgment.
- Prompt clauses that exist to enforce design law need provenance and a proof
  that the clause still causes or prevents the intended behavior.
