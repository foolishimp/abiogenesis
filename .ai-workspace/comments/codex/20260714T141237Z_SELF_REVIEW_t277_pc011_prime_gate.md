# Self-Review - T-277 PC-011 Prime Design Gate

**Timestamp**: 2026-07-14T14:12:37Z

**Implementation commit**: `be287765`

**Verdict**: implementation checkpoint passed; independent closure review pending

## Realized Boundary

- added one prospective Prime contraction gate over T-277-governed tickets
- embedded the closed review record in the accepted design rather than a
  sidecar authority
- made `npm run check:design` the aggregate Mermaid and Prime gate
- registered and rendered nested accepted ADR design refs
- updated the pre-code template with the exact review carrier

## Negative Proof

The focused lane rejects:

- missing IACS
- annotation-only `<<prime>>` claims
- unowned recurrence
- contraction dispositions with no measured reduction
- accepted `requirement_reprice`
- accepted design status without an acceptance record
- an accepted nested ADR omitted from the design register

## Self-Review Repairs

The first implementation omitted empty-list filtering in ticket metadata. The
focused test exposed the resulting blank candidate refs; the parser now filters
empty list headers before exact census validation.

The second pass found that an acceptance record did not require accepted status
inside the design and that nested ADR refs were outside the registered-design
census. Both were repaired and the nested omission has its own negative test.

## Verification

```text
test:prime-contraction: 7/7
test:design-mermaid: 8/8
check:prime-contraction: 7 tickets, 1 accepted, 6 pending, 8 row refs
check:design-mermaid: 23 files, 69 diagrams
git diff --check: clean
```

The gate is deterministic design evidence. It does not confer independent
review, F_H authority, product truth, or runtime closure.
