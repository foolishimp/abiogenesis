# T-265 Canonical GraphFunction Applications Closure Self-Review

- timestamp_utc: 2026-07-12T17:55:25Z
- ticket: T-265
- change_class: design_reframe
- verdict: close
- design_verdict: implemented_as_accepted

## Boundary Reviewed

One generic M01/M02/M03 relation for:

```text
recurse(graph_function, termination, foldback)
fan_in(reducer, over)
gate(target, rule, evaluators)
```

The review held code against the accepted domain model, execution sequence,
state machine, GA-01..GA-16, PRODUCT atom criterion, and T-265 non-closure
conditions. Consensus remained demand only.

## Findings Found And Repaired

1. Copied composition declarations were reconsidered under every lineage owner,
   and one successful owner suppressed the same declaration's failed owner.
   Selection now derives declaration provenance by exact comparison with the
   immediate operand before host validation. Copied GraphFunction-local truth
   requires its explicit operand host; inherited vector-local truth resolves to
   its source owner.
2. An ordinary GraphFunction with a cross-host composition and no canonical
   application could bypass application compilation. Both GraphFunction-local
   and vector-local cross-host declarations now fail without an application
   path.
3. Native Rule, Evaluator, SerializedAttrs, and tagged wrapper property
   insertion order had become semantic. Native objects now require exact keys
   while semantic tagged-field order remains in `entries[]`.
4. A stale applied-host id escaped as a generic TypeError. M02 now emits the
   accepted `gtl-application-result-identity-mismatch` typed diagnostic.
5. `Vector[ ]` passed fan-in boundary admission. Native and compiler checks now
   require a canonical trimmed non-empty member ref.
6. Duplicate vector ids could make composition ownership ambiguous before the
   whole-program uniqueness diagnostic. Application compilation now refuses
   duplicate vector identity before publishing provisional bindings.
7. A result-local declaration option silently discarded a caller-supplied
   application row. The lower-level `L` boundary now refuses that second
   authority; operand carry-through still removes the prior immediate
   application as designed.

## Axiom Review

| Axioms | Result | Evidence |
|---|---|---|
| GA-01..GA-04 | pass | one closed discriminated declaration, opaque operand id, complete fields, derived application and host identities |
| GA-05..GA-07 | pass | same-kind and mixed nesting retain source objects; native/raw parity; M03-only lineage projection |
| GA-08..GA-10 | pass | provenance-derived local/inherited owner roles, provisional-only joins, existing composition resolver and precedence |
| GA-11..GA-13 | pass | ordinary lookalikes remain ordinary; cross-host-without-path refuses; Scenario 09 fixtures contain no Consensus vocabulary |
| GA-14..GA-16 | pass | no execution imports/effects, complete result equations, exact owner set with duplicate-vector refusal |

Direct and multi-hop authored application cycles are structurally
unrepresentable because `D(R)` covers the complete declaration containing the
operand ref. The visited-set is retained as bounded defense; no hostile-input
framework was added.

## Gate Evidence

- `npm run test:t265`: 21/21
- `npm run test:gtl-law`: included standing law total 75/75
- `npm run test:semantic:built`: 1552/1552
- `npm run lint:semantic`: green
- GTL authority guard: green, 25 registered keys, 21 runner files, seven C constructors
- generated public contracts: 63 verified
- generated product publication: 33 assets over 1014 immutable payload files
- packed candidate/publication differential: 13/13
- `npm pack --dry-run --json`: green, no proof tooling in product payload
- `git diff --check`: green
- atom code and proof grep for `consensus`: zero matches

Independent re-review reproduced the original defects, verified each repair,
and returned close with no remaining blocker, high, or medium finding.

## Sequenced Residuals

- T-255 owns final FN-COMP-003 and `owning_declaration_ref` joins.
- T-266 owns constructor-only seven-C-program lowering.
- T-252 re-authors the held pure-data body and persists the compiler census only
  after T-265 and T-266 close.

No residual above weakens a T-265 claim or permits runtime admission here.
