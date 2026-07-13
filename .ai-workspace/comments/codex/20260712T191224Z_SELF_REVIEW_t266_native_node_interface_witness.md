# SELF REVIEW: T-266 Native Node And Interface Type Witnesses

- ticket: T-266
- review_kind: implementation self-review
- reviewed_at: 2026-07-13 Australia/Sydney
- verdict: superseded_checkpoint_blocked
- closure_state: three confirmed external-review findings under repair
- accepted_design:
  `build_tenants/abiogenesis/typescript/design/M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md`

## Scope Judgment

The realization stays inside the accepted design reframe. It adds native
TypeScript witness and exact-join proof over ordinary GTL Nodes, interfaces, C
terms, GraphFunctions, GraphVectors, and HOF boundaries. It does not add a
canonical carrier, serialized selector, eighth C generator, schema catalog,
decoder certification, worker-payload validation, runtime interpreter, event,
replay, or Consensus-specific path.

Canonical GTL remains ordinary non-generic data. Decoder functions, native
types, invariant functions, private symbols, witness wrappers, and native
GraphVector bindings are non-enumerable or remain outside serialization.

## Realization Review

| Design obligation | Evidence | Verdict |
|---|---|---|
| One trusted concrete decoder root | `typedNode`; compile refusal for `any`, `unknown`, and `never` | pass |
| Full ordinary Node identity | opaque id, full `nodeContractKey`, and local key digest; same-key/different-id and same-id/different-key negatives | pass |
| Exact vector member relation | `typedVectorNode` joins scalar witness, exact readonly array decoder, and canonical `Vector[T]` schema | pass |
| Exact non-empty ordered interface | scalar singleton and readonly tuple product; widened, reordered, shortened, lengthened, and zero-node negatives | pass |
| Constructor-only native authority | module-private unique symbols, non-enumerable authority, erased runtime checks, structural-forgery negatives | pass |
| Node-backed C closure | `of`, `id`, `compose`, `edge`, `workflow.C`, `batch`, and `retry` preserve one nominal boundary pair | pass |
| No brand downgrade | ordinary overloads exclude private-branded carriers/terms; mixed native runtime paths fail closed | pass |
| Exact GraphFunction and GraphVector joins | ordered refs, full keys, cardinality, singleton target, and ordinary carrier refs are recomputed and compared | pass |
| Witnessed HOF relation | scalar/vector constructors infer from TypedNodes; public `fan_in` requires an exact vector reducer witness | pass |
| Symbolic fan-in contradiction | M03 compares symbolic reducer ordinary inputs with the declared vector and returns `invalid_program` before the runtime gap | pass |
| One serialized truth | native and ordinary C terms serialize identically; M01 GraphFunction and M02 Module round trips contain no witness fields | pass |
| Packed public containment | source-blind consumer can use typed Node/interface/C APIs; brand names and raw fan-in constructor are unimportable and absent at runtime | pass |
| Generic atom | Scenario 09 scalar, vector, and three-source tuple corpus; zero Consensus vocabulary in implementation/proof identities | pass |

## Adversarial Repairs During Review

1. Added an explicit `ExactTypedNodeTuple` gate. Constructor invariance already
   prevented ordinary widening, but a predeclared
   `TypedInterface<Value, NonEmptyTypedNodeTuple>` could otherwise enter
   `cInterfaceCarrier`; carrier and GraphVector binding now reject that type.
2. Collapsed duplicated interface-ref equations into
   `deriveNodeInterfaceContractRef`, used by both TypedInterface and the public C
   interface utility.
3. Added direct proofs for mixed branded/ordinary compose and batch, same-key
   foreign ids, same-id full-key drift, reordered GraphFunction inputs, wrong
   GraphVector target, and zero-node interface construction.
4. Separated the packed install proof from the full parallel wildcard after one
   full run exposed package-install contention. The proof remains mandatory in
   `test:t266`; the normal semantic wildcard remains deterministic.
5. Preserved the T-254 selector boundary: `bindGraphVectorCProgram` carries no
   program id and emits no serialized declaration.
6. The first commit-relative execution witness found 47 uncovered defensive
   branches despite a green broad suite. Added public-entry adversarial proofs
   for brand/identity drift, malformed private authority, same-contract foreign
   Nodes, non-admitted GraphVectors, target cardinality, and HOF witness drift;
   the rerun reports zero unwitnessed executable changes.

## Gate Evidence

- Focused T-266: 125/125.
- Standing GTL law inside the focused/full build: 82/82.
- Full semantic: 1559/1559.
- T-223 packed/publication differential: 70/70.
- T-250 version/documentation integrity: 13/13.
- Strict TypeScript build, semantic lint, and GTL authority guard: pass; guard
  retains 25 reserved declarations, 21 runner files, and seven C generators.
- Public schema/publication: 63 schemas and 33 generated assets verified from
  1017 immutable payload files.
- Mermaid: 5/5; all nine registered three-view designs render.
- Packed dry run: pass; 1018 package entries.
- Packed source-blind T-266 consumer: pass.
- Zero-Consensus implementation/proof scan: pass.
- Commit-relative diff execution witness: 698 changed executable lines
  witnessed, 691 changed non-executable lines, zero violations.
- `git diff --check`: pass.

## Residual Boundaries

- The trusted decoder is not invoked and is not certified against symbolic
  schema truth. DS-4 owns public schema and adapter contracts.
- Raw M02/M03 compilation does not reconstruct TypeScript types. It judges only
  ordinary refs, full keys, ordered interfaces, and existing serialized C/HOF
  relations.
- C/HOF runtime interpretation remains separately owned by successor tickets.
- Hostile in-process symbol discovery or tampering remains outside the trusted
  desktop threat model.
- Closure review remains pending. This record is self-review evidence and does
  not impersonate the user's or an independent review verdict.

## External Review Invalidation

The 2026-07-13 external review rejected this self-review. It confirmed that the
proof set missed three accepted-design violations: static widening of a
Node-backed term to `CProgramTerm` before reuse by a canonical constructor,
open variadic TypedNode tuples admitted by the fixed-tuple guard, and the raw
fan-in constructor remaining internally callable under a new name. The prior
green counts do not admit the checkpoint. A successor repair review must
replace this verdict.
