# T-252 Re-Entry And T-254 Vector Program Design Self-Review

**Surface**: T-252 post-T-253 design reconciliation and the candidate T-254
M01/M03 GraphVector-to-declared-C-program relation only.

**Verdict**: `design_complete_pending_fh_review`. No implementation is
authorized.

## Finding

T-253 closed the exact typed fan-out authoring relation. Re-entering the
accepted Consensus topology then exposed a separate constitutional relation
that the current language cannot express: each C-program-executing transition
GraphVector must select its own declared C program from the containing
GraphFunction catalog. A GraphFunction-global selector would erase the accepted
topology. T-252 therefore stops before canonical body bytes and routes the
generic language relation to T-254.

## Design Boundary

- The vector uses the existing `abg.hog_program_ref`; no second selector exists.
- Program and catalog definitions remain GraphFunction-owned.
- `cInterfaceCarrier` derives one invariant C carrier identity from an ordered
  Node interface; M03 recomputes the same identity from the admitted vector.
- Native authoring creates canonical carriers and the scalar selector. M01 raw
  admission preserves them. M03 alone judges containment, catalog membership,
  selected-program admission, and boundary equality.
- The one selector metadata row carries a combined cross-host precedence law,
  preserving GraphFunction fixed-versus-ladder exclusivity while adding
  GraphVector local-exact/else-GraphFunction-plan behavior.
- Raw catalog candidates retain declaration key and catalog index. An invalid
  outer vector/program relation suppresses nested semantic gaps for that
  candidate; a lawful binding releases nested diagnostics exactly once.
- A lawful binding ends at the typed vector-selection
  `semantic_not_realized` result. T-254 adds no runtime handoff.
- The non-Consensus Scenario 09 proof is two sequential vectors selecting two
  different programs from one catalog. The combined negative requires a
  mismatched selected unrealized `C.batch` to yield one catalog-indexed
  `invalid_program` and no semantic gap.

## Review Repairs

Independent review found and the design corrected four load-bearing defects:

1. the original selector lifecycle made the no-local-selector path unreachable;
2. one scalar precedence row could not carry separate implicit host rules;
3. T-252 initially placed exact membership/boundary binding before raw
   admission rather than in M03; and
4. the current eager C-algebra pass could lose catalog origin and emit inner
   unrealized truth alongside an outer invalid relation.

The domain model, sequence, state machine, IACS, failure law, ticket closure,
and negative fixture now encode the corrected order. Three independent final
reviews report no remaining findings and accept the design for F_H review.

## Verification

- direct T-254 render: 1 file, 3 diagrams, digest
  `sha256:87e822e974402fe31181ea67305ed9f66811a512e43e807bdded7d393eda326c`;
- direct reconciled T-252 render: 1 file, 3 diagrams, digest
  `sha256:b138263f741811d3eef6b8a40abf411e80e4f6232cc5aa430cd9e205f816fd70`;
- standing completed-design gate: 9 files, 27 diagrams, green; and
- `git diff --check`: green.

Implementation must not start until direct F_H acceptance of T-254. T-252 then
resumes only after the generic relation closes and its exact canonical body can
be submitted to the no-effects compiler census.
