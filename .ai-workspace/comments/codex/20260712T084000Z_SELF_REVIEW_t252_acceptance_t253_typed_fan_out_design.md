# Self-Review: T-252 Acceptance And T-253 Typed Fan-Out Design

- timestamp_utc: 2026-07-12T08:40:00Z
- reviewed_base: 4d60514
- change_class: requirement_reprice design package; no constitutional or code edit
- scope: T-252 target-architecture disposition plus the singular T-253 candidate
- verdict: ready_for_fh_design_review

## Reviewed Outcome

1. T-252 now records the direct F_H acceptance of its target architecture and
   the 3a routing decision. Its executable Consensus body remains blocked.
2. T-253 owns one prerequisite only: the exact
   `fan_out(A -> B, Vector<A>, Vector<B>) -> Vector<A> -> Vector<B>` relation.
3. The T-253 design contains the mandatory domain, sequence, and state views,
   an explicit IACS, authority joins, cross-view axioms, operational lifecycle,
   and gap/exclusion register.
4. No specification, TypeScript product code, test, package, runtime, or
   Consensus body changed in this phase.

## Findings Caught Before Code

| Finding | Correction in the candidate design |
|---|---|
| The current two-argument `fan_out` is a same-node facade | `over` and `into` are distinct exact typed inputs |
| Returning a plain GraphFunction would erase the native relation | return is `HofUnaryRef<readonly A[], readonly B[]>` containing the ordinary GraphFunction |
| The same HOF ref was modeled as child-specific although it also returns a derived function | `HofUnaryRef` binds one reused `ExactGraphFunction` role and exact generic boundaries |
| Multiple constructors could create rival declaration authority | the M01 builder alone constructs `gtl.hof_application` |
| Prefix checks would treat `Vector[...]` spelling as type truth | one closed structured parser joins the vector schema to an explicit member witness |
| A structural `Node` was incorrectly assumed to have an admission brand | reuse `admitNode`, normalize, derive ref/key, then mint only the private HOF witness |
| Name or tag evidence had been given negative semantic authority | cosmetic names/tags remain ordinary and unobserved; existing feature-coverage conformance separately owns contradictory explicit claims |
| The compiler was incorrectly described as a runtime gate | M03 reports `semantic_not_realized`; T-253 itself does not publish or invoke |
| Canonical serializer output was incorrectly allowed to become malformed raw input | canonical admission and independent foreign/mutated raw ingress are distinct paths and states |
| The generic fixture bypassed the returned-ref caller path | Builder returns to the fixture, which invokes the same serializer/admission/compiler path |
| A ticket-only proof record entered the semantic lifecycle | it was removed; M03 diagnostic is terminal truth and assurance remains test/self-review evidence |
| Diagram helper shapes risked becoming public peer types | IACS is exactly `HofVector`, `HofUnaryRef`, and `HofApplicationDeclaration`; existing GTL primes are reused |
| Native, raw, and compiler refusals were conflated | typecheck, native admission, raw admission, and M03 diagnostics have separate owners and lifecycle states |
| Consensus alone could hide a feature-specific atom | Scenario 09 supplies an independent `A -> B` fan-out consumer |

## Drift Review

- `fan_in`, `workflow.C`, `C.batch`, retry, recursion, scheduling, worker
  dispatch, events, replay, CLI, and Consensus realization remain outside
  T-253.
- Runtime interpretation remains a named later gap. No interpreter or
  execution-basis change is implied by the compiler diagnostic.
- `Node` and `GraphFunction` remain non-generic; no global Node brand is added.
- The design targets malformed or ambiguous GTL with native typing, closed
  admission, and compiler diagnostics. It adds no hostile-workstation or
  tamper-proofing work.
- The four unrelated M02/M04 self-build drafts retained their pre-review
  digests and the unrelated Python workspace edit was not touched.

## Verification

- focused T-253 Mermaid gate: `passed`, renderer `11.3.0`, `1` file, `3`
  diagrams, digest
  `sha256:977cf4dcb03cd4b3230dffd777c42ea17bd87321504db27af51081212b2f3cb9`
- registered design gate: `passed`, `9` files, `27` diagrams, digest
  `sha256:c31f6eb6a8efbee41aa6272b951aa3e83612963a4daead62d92d4048238b031a`
- T-251 design-gate tests: `5/5` passed
- `git diff --check`: passed
- independent native-model audit: passed
- independent requirement/design-authority audit: passed
- independent DESIGN_MODULE_METHOD 5E cross-view audit: passed

## Disposition

The T-253 package is design-complete but remains `candidate_pending_fh`. It
authorizes no requirement or implementation change until F_H accepts the exact
candidate law and three-view design. After acceptance, execution is limited to
the requirement reprice, native typed relation and canonical declaration, raw
admission, M03 classification, and the generic Scenario 09 proof. T-252 then
re-enters design review before any Consensus body is authored.
