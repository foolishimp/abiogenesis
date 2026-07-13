# T-260 - Realize Typed HOF And C.batch Runtime

- id: T-260
- status: active
- phase_status: design_accepted_implementation_authorized
- delivery_phase: DS-3
- change_class: requirement_reprice
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-259
- re_entry_point: >-
    specification/requirements/gtl/REQ-L-GTL3-HOF.md
    HOF-009 through HOF-012
- requirement_reprice_status: accepted_under_delegated_fh
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md
- review_status: delegated_fh_accepted_after_bounded_self_review
- updated_at: 2026-07-13

## Boundary

Close one typed vector-HOF execution relation covering
`typed_fan_out_runtime`, `typed_fan_out_batch_projection`, and
`typed_fan_in_structure_and_runtime`: ordered input members become ordered
C.batch tasks/results and then an exact typed reduction.

## T-252 Census Gap Ownership

- gap_family: typed_fan_out_runtime
- gap_family: typed_fan_out_batch_projection
- gap_family: typed_fan_in_structure_and_runtime

## Entry And Exit

Accept a three-view generic design before code. Preserve member contract,
ordinal, attribution, cardinality, partial-failure blocking, and result order.
The unchanged T-252 body must lose the HOF gaps; Scenario 09 remains the required
non-Consensus proof and must exercise the same typed `fan_out`, ordered
vector-to-`C.batch` task/result projection, and typed `fan_in` reduction. The
fixture must prove each relation without Consensus vocabulary or fixed panel
cardinality.

## Non-Closure

Same-node facade, fixed reviewer cardinality, completion-order attribution,
name/tag semantics, or a Consensus panel loop.
