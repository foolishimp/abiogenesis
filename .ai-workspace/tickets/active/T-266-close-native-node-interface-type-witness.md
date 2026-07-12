# T-266 - Close Native Node And Interface Type Witnesses

- id: T-266
- status: active
- phase_status: realization_complete_closure_review_pending
- review_status: self_review_clean_user_review_pending
- implementation_admission: realized_as_designed
- proof_status: all_declared_gates_green
- delivery_phase: DS-1 prerequisite
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependencies:
  - completed T-220 typed C algebra authoring and semantic compiler
  - completed T-253 typed HOF vector relation
  - completed T-254 GraphVector-to-declared-C-program selection
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md
- authority_refs:
  - specification/PRODUCT.md typed GTL and atom criterion
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md clauses 001-002 and 013-015
  - specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md clauses 001-004
  - specification/requirements/gtl/REQ-L-GTL3-HOF.md clauses 001 and 005-006
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md clauses 004, 006, and 012-017
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md clauses 009-013
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md section 5E

## Intake Triage

1. **Demand**: native GTL authoring must infer Node-backed C and HOF relations
   from the actual Nodes used by a graph body. An LLM must not attach an
   unrelated caller-selected generic to an ordinary Node.
2. **Observed defect**: `cInterfaceCarrier<T>(nodes)`, `hofContract<T>(node)`,
   and body-local helpers such as `leafProgram<Input,Output>` accept phantom
   types selected independently of the supplied Node contracts.
3. **Existing authority**: C-ALGEBRA-012 requires the native-language maximum;
   NODE-013..015 preserve canonical Node type truth while leaving `typeRef`
   optional; INTERFACE and HOF require exact type preservation. No requirement
   reprice is needed.
4. **Smallest lawful re-entry**: one generic `design_reframe` across M01 native
   authoring, M02 canonical admission parity, and M03 semantic verification.
   `Node` and `GraphFunction` remain ordinary non-generic GTL data.
5. **Probability and proportionality**: malformed LLM-authored GTL is likely.
   One explicit trusted native decoder root, private constructor brands, exact
   Node/interface joins, raw re-admission, and compiler diagnostics are
   proportionate. Proving a TypeScript structural type from a symbolic schema,
   hosted schema resolution, hostile in-process forgery, and cryptographic
   hardening are not part of this desktop boundary.

## Corrected Singular Boundary

T-266 closes exactly this native authoring relation:

```text
trusted native decoder d : unknown -> T
ordinary admitted Node n -> exact full nodeContractKey(n)
TypedNode<T> := constructor-owned native projection of (d, n, key(n))
TypedInterface<Value, ExactNodes> := ordered TypedNode projection
NodeBackedCProgramTerm<A,B,InputNodes,OutputNodes> := branded C relation
-----------------------------------------------------------------------
Node-backed C/HOF constructors infer their types from those projections
```

The decoder is the one explicit trusted native assertion point. It is not a
published JSON Schema, canonical schema contract, raw-data admission proof, or
runtime payload validator. The constructor infers `T` from the decoder and
binds that native-only relation to the exact full ordinary Node contract key.
It does not claim that TypeScript proved a symbolic `SchemaRef` denotes `T`.

`TypedNode<T>`, `TypedInterface<T,Nodes>`, nominal `CInterfaceCarrier<T,Nodes>`,
`NodeBackedCProgramTerm`, and HOF boundaries carry module-private, non-exported
unique-symbol brands. Their constructors check the brands again after type
erasure. A public object literal or a public symbol cannot mint one.

Canonical GTL stays pure data. The decoder, `T`, private brands, and wrapper
names are never serialized. Native and raw routes must derive the same ordinary
Node contract keys and ordered interface refs from canonical GTL. They do not
claim to recover or compare TypeScript structural types after serialization.

`Node.typeRef` remains optional. When present, existing NODE-015 resolution and
strengthening law still apply independently at admission/conformance. When
absent, the Node carries exactly its inline canonical contract; the native
projection adds no serialized type authority.

## Accepted-Design Execution Sequence

Only after direct F_H acceptance:

1. Add a trusted native decoder input whose concrete return type is inferred.
   Type utilities reject `any`, `unknown`, and `never` return types. Do not add
   caller-supplied schema-contract refs/digests or claim decoder/schema
   equivalence before DS-4 publication.
2. Add invariant scalar `TypedNode<T>` and structured
   `TypedVectorNode<T> extends TypedNode<readonly T[]>` construction over
   ordinary admitted Nodes. Derive the exact full `nodeContractKey` and local
   digest. The vector constructor also binds its exact member witness and checks
   the existing closed `Vector[T]` schema relation.
3. Make all witness families constructor-only through module-private unique
   symbols, non-enumerable invariant members, and runtime own-brand checks.
4. Add a non-empty ordered `TypedInterface<Value,Nodes>` constructor whose
   second parameter preserves the exact readonly TypedNode tuple and cardinality.
   Infer a scalar for one Node and a readonly tuple product for multiple Nodes;
   preserve exact Node order, opaque refs, contract keys, and the existing
   interface ref. GraphVector source accepts any non-empty witnessed tuple;
   GraphVector target accepts only a singleton witnessed interface.
5. Add nominal `CInterfaceCarrier<Value,Nodes>` derived only from the exact
   `TypedInterface<Value,Nodes>`.
   Generic `CCarrier<T>` may remain for non-Node contract boundaries, but it
   shall not satisfy any Node-backed GraphFunction, GraphVector, C-program, or
   interface parameter. `cCarrier<T>(ref)` is never a fallback Node-interface
   constructor.
6. Add nominal `NodeBackedCProgramTerm` construction over the same seven
   serialized C generators. Node-backed `C.of`, `C.id`, `C.compose`, `C.edge`,
   `workflow.C`, `C.batch`, and `C.retry` accept and preserve exact branded input/
   output interfaces. `bindGraphVectorCProgram` accepts only a Node-backed term,
   never an ordinary `CProgramTerm`.
7. Make `cGraphFunctionRef` derive its input/output carriers from typed
   interfaces and verify exact ordered equality against the GraphFunction's
   input/output Node refs and contract keys. Make `hofUnaryRef` perform the same
   exact unary join through typed Node boundaries.
8. Retire the public and internal unsafe routes
   `cInterfaceCarrier<T>(readonly Node[])` and `hofContract<T>(Node)`. Make
   Node-backed C stages, graph-vector program-selection authoring, workflow
   lifts, fan-out, fan-in, and graph-body helpers consume nominal witnessed
   boundaries only.
9. Keep native brands and decoders non-enumerable and non-serialized. M02
   serialization/raw admission round-trips ordinary Node/GraphFunction/Module
   bytes only and never mints a native witness.
10. Extend M03 only where needed to recompute ordinary Node contract keys and
   ordered interface refs from the admitted root, then compare those identities
   with serialized C/HOF declarations. Emit stable `invalid_program`
   diagnostics for contradictions. Do not reconstruct TypeScript `T`.
11. Prove the atom with a non-Consensus Scenario 09 fixture using
    `LabObservation -> NormalizedObservation`, including vector Nodes and a
    three-source readonly tuple interface. Add compile-negative tests against
    actual Nodes and public APIs, not detached aliases. Include decoder returns
    of `any`, `unknown`, and `never`, source tuple reorder/cardinality errors,
    non-singleton GraphVector targets, and ordinary C-term fallback attempts.
12. Run focused native/raw/compiler tests, semantic, lint, public API,
    generated-publication, Mermaid, and diff gates, then self-review against
    PRODUCT and this ticket before checkpointing.

## Closure Conditions

1. F_H accepts the referenced domain, sequence, state, and axiom design before
   product code or tests change.
2. One concrete trusted native decoder return type introduces `T` at each native
   witness root. `any`, `unknown`, and `never` are statically refused. No later
   Node, interface, C, HOF, or graph-body call can rebind it.
3. Every native witness carries a module-private unique-symbol brand and rejects
   structural object-literal substitutes at compile time and at its erased
   constructor boundary.
4. `TypedNode<T>` binds the ordinary admitted Node's exact opaque ref, full
   `nodeContractKey`, and locally derived key digest. It makes no schema-publication
   or runtime payload-admission claim.
5. A non-empty ordered `TypedInterface<Value,Nodes>` preserves its exact
   invariant readonly TypedNode tuple and cardinality; it is not assignable to a
   widened `TypedInterface<Value,NonEmptyTypedNodeTuple>`. One Node yields its scalar value.
   Multiple Nodes yield the exact readonly tuple in GraphVector source order.
   GraphVector source accepts either; GraphVector target is exactly one typed
   Node and refuses a zero- or multi-Node interface.
6. `CInterfaceCarrier<Value,Nodes>` is nominal and constructor-derived. Generic
   `CCarrier<T>` and `cCarrier<T>(ref)` cannot satisfy a Node-backed API.
7. Every Node-backed C generator returns a nominal
   `NodeBackedCProgramTerm` retaining its exact branded input/output interfaces.
   Composition, workflow lift, edge, batch, and retry preserve that brand and
   boundary pair. `bindGraphVectorCProgram` rejects ordinary `CProgramTerm`.
8. `cGraphFunctionRef` checks exact ordered input/output Node refs and contract
   keys. `hofUnaryRef` checks the exact unary GraphFunction relation. Foreign,
   reordered, missing, or additional boundaries fail before serialization.
9. Compile-negative tests reject wrong C composition middles, wrong
   GraphFunction boundary witnesses, wrong fan-out member/vector pairs, wrong
   fan-in reducer boundaries, reordered multi-source tuples, ordinary Nodes
   passed directly to typed APIs, structural witness literals, and generic
   carrier or ordinary C-term fallback at a Node-backed boundary, decoder
   returns of `any`/`unknown`/`never`, an exact tuple widened through a carrier or
   GraphVector binding, wrong source cardinality/order, and a non-singleton
   GraphVector target.
10. Native serialization and M02 raw admission preserve identical ordinary GTL
   bytes. No decoder, TypeScript type, brand, predicate, wrapper, or duplicate
   contract declaration enters canonical GTL.
11. M03 recomputes ordinary Node/interface identity from admitted data.
    Contradictory serialized C/HOF refs are `invalid_program`; an absent runtime
    consumer remains a separately owned `semantic_not_realized` gap. M03 does
    not claim raw/native structural-type equivalence.
12. `Node.typeRef` stays optional and its existing strengthening law remains
    unchanged.
13. The non-Consensus Scenario 09 fixture proves scalar, vector, and
    multi-source tuple inference. Generic implementation entities contain no
    Consensus vocabulary.
14. Focused, semantic, lint, public API, generated-publication, diff, and
    Mermaid gates pass, followed by a drift review against PRODUCT and this
    ticket.

## Non-Closure Conditions

- `Node` or `GraphFunction` becomes globally generic.
- A free `<T>` on an ordinary Node, schema ref, contract ref, digest, or generic
  `CCarrier` can mint or substitute for a Node-backed typed boundary.
- A trusted decoder returning `any`, `unknown`, or `never` can mint a witness.
- An ordinary `CProgramTerm`, including one built from a matching generic
  carrier ref, can bind to a GraphVector as a Node-backed term.
- A public structural object can impersonate a constructor-owned witness.
- `as`, `unknown`, a sample value, display name, tag, schema spelling, or
  `typeRef` string substitutes for the trusted decoder root and exact Node join.
- A multi-source Node list is typed as an arbitrary named object instead of its
  exact ordered tuple product.
- A TypedInterface widens or erases its exact TypedNode tuple/cardinality, or a
  GraphVector target accepts anything other than a singleton typed interface.
- A native decoder/witness is serialized or later trusted as canonical GTL,
  public schema truth, or runtime payload admission.
- Native and raw routes derive different ordinary Node/interface identities, or
  the design claims that raw compilation reconstructs TypeScript `T`.
- This ticket invents a schema catalog, makes `typeRef` mandatory, or requires
  every ordinary Node to carry a native witness.
- The only positive fixture or any generic carrier/compiler symbol is
  Consensus-shaped.
- Implementation begins before F_H accepts the revised design.

## Explicit Non-Scope

- Consensus domain types, graph body, reducers, prompts, profiles, or runtime;
- JSON Schema publication, decoder certification, or the DS-4 public contract
  catalog;
- runtime validation of values presented to the trusted decoder;
- F_P result payload validation, plugin/handler binding, effects, C-call
  execution, fan-out/fan-in scheduling, retry, recursion, events, or replay;
- global Node/GraphFunction ontology redesign; and
- hostile-process, cryptographic, filesystem, or tamper-proofing controls.

## Design Disposition

Accepted by F_H on 2026-07-13 after independent review found no remaining
design defect. Realization is admitted against
`M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md`.

## Realization Disposition

`realization_complete` on 2026-07-13. The implementation closes the admitted
native witness and exact-join relation without adding serialized GTL or runtime
behavior. The accepted design's cross-view and axiom evaluations now pass.

Closure remains gated on the user's/independent review. The ticket stays in
`active/`; self-review does not substitute for that review.

## Realization Evidence

- `native_node_witness.ts` owns the private TypedNode, TypedVectorNode, and
  exact TypedInterface construction boundary and the single interface-ref
  derivation.
- `c_algebra.ts` owns nominal C interface carriers, exact GraphFunction refs,
  all-seven Node-backed term preservation, and native-only GraphVector binding.
- `hof.ts` derives scalar/vector HOF relations from witnesses and exposes only
  the witnessed public fan-in route.
- M03 rejects a symbolic fan-in reducer/input contradiction as
  `invalid_program` before the separately owned runtime gap.
- Scenario 09 compile/runtime proofs cover concrete decoder refusal, exact
  tuple law, all seven C constructors, HOF relations, raw parity, M02 Module
  replay, and malformed identity relations.
- The packed consumer proves private authority names cannot be imported or
  observed through the public M01 package export.
- Focused T-266 125/125; standing GTL law 82/82; full semantic 1559/1559;
  T-223 70/70; T-250 13/13; lint, publication, Mermaid, package dry-run,
  zero-Consensus, and diff checks pass.
- The commit-relative diff-execution witness classifies 698 changed executable
  lines as witnessed, 691 changed lines as non-executable, and reports zero
  violations.
- Self-review:
  `.ai-workspace/comments/codex/20260712T191224Z_SELF_REVIEW_t266_native_node_interface_witness.md`.
