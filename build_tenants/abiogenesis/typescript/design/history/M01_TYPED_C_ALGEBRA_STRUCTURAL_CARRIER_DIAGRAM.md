# M01 Typed C Algebra - Structural Carrier Diagram

> **T-283 authority disposition (2026-07-20):**
> `invalidated_for_5_0_implementation_by_upstream_intent_reprice`. This file is
> retained as historical and current-state evidence only. Prior acceptance
> records its former basis; it does not authorize design, code, proof, Product
> scope, or closure under the T-283 candidate. Reusable local contracts must be
> re-derived under the accepted direct-GTL replacement design after T-283
> closes.

```text
LLM objective + published catalog/API
                 |
                 v
        native typed authoring
  GraphFunctionRef<A,B>  GraphVector internal
  host-indexed declarations  CExpression<A,B>
                 |
                 | canonical serialization
                 v
          unknown authored data
                 |
                 v
       M01 raw admission/type matching
       - sort and constructor shape
       - host/value-kind/duplicate law
       - local C input/output relations
                 |
                 v
          admitted GTL program
                 |
                 v
      M03 semantic compiler/conformance
       - refs reachable from submitted root
       - catalog/program membership
       - C cardinality and realization
       - execution-declaration precedence
                 |
          +------+------+
          |             |
          v             v
 conformance pass     typed diagnostics
 compiled execution  + repair affordances
 declaration carrier
          |             |
          |             +--> LLM revises canonical data
          v
 public start / constructed ExecutionBasis
          |
          | compiled declaration selection
          v
 ABG interpreter selects compiled declared terms
          |
          v
 C-call spine -> implementation interior
          |
          +--> F_D typed result ------------------+
          |
          +--> F_P raw result -> result admission +--> admitted/retry replay truth
                                 malformed X
                                 close contradiction -> retry only
```

Forbidden shortcuts:

```text
SerializedAttrs --------------------------X--> runner meaning
GraphVector ------------------------------X--> public start
plugin/handler ---------------------------X--> traversal selection
observed deterministic behavior ----------X--> F_D declaration
downstream vector census -----------------X--> ABG carrier
declared execution reference --------------X--> unresolved target
malformed/contradictory F_P output --------X--> accepted assessment or closure truth
```

The compiler owns gaps. It does not author missing terms. The LLM repair loop
uses stable diagnostics to choose a lawful constructor, correct a reference, or
route a real requirement/design gap. Product/install binding owns selection of
the authoritative submitted root; the compiler proves only the root it admits.
