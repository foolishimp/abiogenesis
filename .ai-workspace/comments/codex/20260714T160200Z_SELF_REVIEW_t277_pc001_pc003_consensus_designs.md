# Self-Review: T-277 PC-001 Through PC-003 Consensus Designs

**Scope**: T-274 publication design and T-275 closed-domain-family design

**Closure claim**: none; implementation and independent review remain pending

## Review

1. The first register wiring incorrectly added owner designs to T-277's
   `design_refs`. The Prime gate correctly interpreted that as T-277 ownership
   and failed both owner checks. The duplicate references were removed; T-274
   and T-275 remain the sole design owners.
2. The initial publication authority count omitted the retained callable row.
   The count is corrected from `13 -> 11` to `13 -> 12`: nine schema rows, two
   vocabulary rows, and one callable row remain independently admitted.
3. The designs preserve identity/authorship separation. They do not collapse
   nine schemas into an optional-field mega-schema and do not publish private
   graph-locus variants.
4. The callable source migration is one-way: consumers move to a declaration
   derived from the admitted T-252 Module before the legacy maintained source
   is removed.
5. The designs do not claim T-274 or T-275 feature completion. This checkpoint
   authorizes only the Prime shape and bounded migration.

## Deterministic Evidence

- `git diff --check`: passed
- Prime contraction gate: passed, 7 governed tickets, 5 accepted designs
- Mermaid gate: passed, 28 files and 84 rendered diagrams

## Residual Review Questions

- T-274 must prove whether the current asset locator can carry embedded
  resource identity and distinct projection/asset digests. The design stops
  rather than silently changing locator semantics if it cannot.
- T-275 must preserve the canonical T-252 body topology and compiler census
  while replacing dynamic native admission.
