# T-267 Whole-Program Conservation Design Self-Review

Date: 2026-07-14
Reviewer: Codex
Boundary: reframed T-267 three-view design only

## Authority Checked

- `REQ-L-GTL3-C-ALGEBRA-016`
- `REQ-R-ABG3-CCALL-002/-004/-014`
- `REQ-R-ABG3-FN-COMP-015/-021..024`
- `REQ-L-GTL3-COMPUTE-NOTATION-024..028`
- completed T-269 open-program and bind-stage law
- accepted T-271 complete-program compiler/interpreter design and carriers
- external review finding that the prior T-267 selected one result stage,
  synthesized a canonical triple, and lost outer recurse identity

## Findings And Repairs

| Finding | Repair | Disposition |
|---|---|---|
| The prior design read `normalizedProgram`, projected one aggregate result stage, and synthesized transform/evaluate/consequence rows. | The source is now the exact T-271 plan. Every authored node is conserved, every invoking locus receives one authored-stage row, and no missing category is synthesized. | repaired |
| The prior conformance law itself required all three canonical stage categories, so changing only the T-267 compiler would leave the contradiction active. | The design explicitly reprices the existing conformance rows and checks to pin one open plan, accept only its authored loci, and require its exact result frontier rather than a fixed category triple. | repaired |
| Treating one result-bearing locus as universal would reject lawful `C.batch`, whose task-local result loci fold into one outer result. | The source and conservation row carry a non-empty plan-derived result frontier; scalar multiplicity still fails while lawful batch multiplicity remains exact. | repaired |
| Repeated roles and carrier types could collide under the existing result-interface selector. | Runtime-selector identity now includes exact `programLocusRef` and task position; equal-looking loci remain distinct. | repaired |
| The prior design set `effectsPermitted: true` after static and capability admission even though T-270 still owns the public start join. | T-267 now leaves `effectsPermitted: false`; its strongest outcome is only an exact T-270 input. | repaired |
| The prior source could conflate the selected C plan with fan-out, fan-in, or recurse application identity. | The source carries plan identity and outer application relation as orthogonal axes, including separate boundary and plan execution GraphFunction refs. | repaired |
| Recurse relation identity differs lawfully from C-plan identity. | Termination, foldback, parent-rebind, operand, application, relation, and lineage refs are conserved without translating recurse into a C node. | repaired |
| Interpreter call-preparation, result-admission, and materialization binds could again be smuggled into stage cardinality. | No interpreter-bind row is emitted as an authored stage; bind truth remains in the conservation row and deferred runtime. | repaired |

## Cross-View Review

- The domain model distinguishes upstream T-255 truth, the prime T-271 plan,
  plan loci, result-interface authority, compiled rows, the conformance judge,
  downstream admission, deferred capability, and deferred runtime truth.
- Every sequence decision is owned by T-267 source projection, T-271 plan
  assertion, locus admission, T-267 compilation, the existing conformance
  judge, T-267 admission, or deferred T-268/T-270 authority.
- Every lifecycle transition names its admission, compiler, projection, or
  deferred runtime owner.
- No sequence message permits effects, admits raw output, writes events,
  closes obligations, or invokes a public runtime.
- Structural C nodes remain in the plan inventory without becoming fake
  runtime calls.

## Proportionality

The reframe changes the existing T-267 projection and the conformance rows it
already owns. It does not change the C algebra, add a constructor, duplicate
the T-271 interpreter, move application relations into C syntax, create a
second conformance engine, or enter the T-270/T-268 boundaries.

The required conformance extension is load-bearing rather than optional: the
current mandatory three-stage checks directly contradict the active
FN-COMP-015/-021 law. Removing only those checks without pinning plan and
locus identity would be under-specified, while redesigning the base C algebra
would be disproportionate.

## Gates

- Mermaid CLI 11.3.0: 22 files, 66 diagrams, pass.
- DS governance gate: 19 tickets, 64 comment refs, pass.
- `git diff --check`: pass.
- No implementation file changed during this design review.

## Verdict

The reframed design is eligible for delegated F_H design acceptance and
bounded T-267 implementation. Implementation must stop if it requires a new C
constructor, a new topology carrier, an effect-permitting T-267 outcome, a
Consensus branch, or a second conformance judge.

T-267 closure remains unavailable without the independently reviewed
authority-path evidence required by the consolidated DS-1 through DS-3
adjudication. Delegated acceptance may authorize implementation; it does not
self-certify final closure.
