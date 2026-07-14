# T-273 Governance Discovery Repair Self-Review

Date: 2026-07-14
Checkpoint: `b1d24cf5`

## Defects

1. The DS gate filtered on `delivery_phase` before validating that field, so
   T-270/T-271/T-272 disappeared.
2. Duplicate metadata silently overwrote earlier values.
3. The design gate inspected completed tickets only, allowing an active
   accepted design to escape the registered three-view inventory.

## Repair

- The DS gate discovers the delivery lineage from T-252 through
  `source_ticket` before evaluating phase metadata.
- Missing-phase descendants enter the checked set and fail on the missing
  field. T-270/T-271/T-272 now carry explicit DS-2/DS-3 integration phases.
- Both gates reject duplicate metadata.
- The Mermaid gate includes active DS-1..3 tickets once they carry a design
  reference and explicit design-acceptance decision.
- The stale duplicate `updated_at` in T-267 was removed.

## Verification

- governed DS-1..3 tickets: 19
- commentary refs checked: 59
- DS governance focused tests: 5/5
- registered designs: 21
- rendered diagrams: 63
- renderer: Mermaid 11.3.0
- active-accepted-design omission negative: passed
- `git diff --check`: passed

Verdict: the two reported discovery bypasses and duplicate-field ambiguity are
closed. T-271 still requires an accepted three-view design before code.
