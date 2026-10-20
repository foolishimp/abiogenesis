---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/spec-method/v1
source_ref: ../SPEC_METHOD.md
source_digest: 00b802d5c0ead9bef4d95b1143797b806022ffd5884c4a89b37b29ad321e11de
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-06-30
stale_if_source_digest_changes: true
---

# SPEC_METHOD Compressed Authority

## Governing Claim

Specification defines product truth. Downstream surfaces implement, prove, or
project that truth; they do not replace it.

Products, applications, modules, graph functions, build tenants, and runtime
surfaces are implementations of constitutional documents, not substitutes for
them.

## Prompt-Relevant Rules

- Start with the highest live authority surface needed for the question.
- Do not use README, bootstrap, comments, tickets, or run history as product
  truth when Product, requirements, or design already decide the matter.
- If a prompt needs upstream ambiguity, name the unresolved authority gap before
  reading fallback context.
- Active specification should stay present-tense; historical comparisons belong
  in comments, design history, tickets, or release notes.
- Missing requirement, design, proof, or traceability is pressure, not success.
- Product and requirement surfaces must provide enough operational lifecycle
  signal for downstream design, or record a named gap. The canonical lifecycle
  chain is: intent -> requirement -> build -> assurance -> release ->
  deployment -> live usage -> observed telemetry -> retirement.
- Downstream design must not fill missing lifecycle truth from implementation
  precedent, prompt prose, local convention, or test fixtures.

## Compression Use

Use this asset to orient a worker to source precedence, lawful re-entry, and
traceability. Do not use it to decide product-specific behavior; product
behavior must come from the current product authority packet.
