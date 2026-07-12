# T-253 - Close The Typed Fan-Out Vector Relation

- id: T-253
- title: Close the explicit typed fan-out input/output vector relation
- type: requirements_realization
- ticket_category: gtl_higher_order_type_law
- status: active
- phase_status: phase_b_native_realization
- phase_a_status: complete
- phase_a_evidence: >-
    REQ-L-GTL3-HOF-001 exact relation ratified; contract-law API index verified;
    GTL authority guard and 35-law suite green; phase self-review posted.
- review_status: fh_design_accepted
- design_disposition: accepted_by_fh
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-1 prerequisite
- priority: critical
- owner: abiogenesis
- build_tenant: typescript
- change_intent: >-
    Reprice the GTL higher-order law so fan_out declares and preserves the
    exact f:A->B plus over:Vector<A> plus into:Vector<B> relation, then realize
    only its native typed carrier, canonical raw admission, and semantic-
    compiler judgment before returning to the Consensus body probe.
- change_class: requirement_reprice
- re_entry_point: >-
    specification/requirements/gtl/REQ-L-GTL3-HOF.md HOF-001 and HOF-005
- affected_boundary: >-
    M01 typed HOF authoring refs, the canonical fan-out relation declaration,
    GraphFunction serialization and raw admission, and M03 semantic-compiler
    invalid_program versus semantic_not_realized judgment
- triaged_at: 2026-07-12
- created_at: 2026-07-12
- updated_at: 2026-07-12
- source_ticket: T-252
- dependencies:
  - completed T-220 typed C-algebra authoring and semantic compiler
  - accepted T-252 target architecture, with executable body still blocked
- authority_refs:
  - specification/PRODUCT.md atom criterion
  - specification/requirements/gtl/REQ-L-GTL3-HOF.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-IDENTITY.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/scenarios/09-research-product-lab-scenario-catalog.md
  - build_tenants/abiogenesis/typescript/design/M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
- design_refs:
  - build_tenants/abiogenesis/typescript/design/M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md
- admission_condition: >-
    Satisfied 2026-07-12 by direct F_H acceptance after the independent review
    at comments/claude/20260713T210000Z_REVIEW_typed_hof_design_e279e1a.md.
    Realization remains bounded by the accepted design and this ticket.

## Intake Triage

1. **Demand**: a lawful generic `fan_out` must map a declared element function
   over one explicit input vector and expose the distinct typed result vector.
   Consensus needs `ReviewerAssignmentVector -> AttributedFindingsVector`, but
   the language atom must be independent of that consumer.
2. **Observed defect**: the current native
   `fan_out(graphFunction, over)` constructor uses `over` for its requires,
   provides, inputs, outputs, and carries surfaces. It can express only a
   same-node facade and cannot type `Vector<A> -> Vector<B>` when `A != B`.
3. **Authority gap**: HOF-001 requires application over explicit `Vector[T]`
   and HOF-005 requires interface/type truth, but neither states the output
   vector relation precisely enough to prevent the current facade.
4. **Smallest lawful re-entry**: one `requirement_reprice` at the HOF family,
   followed after F_H acceptance by its M01/M03 language realization. A
   Consensus workaround, a `promote`, a tag convention, or a runtime scheduler
   would preserve the language defect.
5. **Probability and proportionality**: the probable defect is malformed or
   structurally ambiguous GTL, not hostile in-process tampering. Native
   invariant refs, closed raw admission, and one compiler judgment are the
   proportionate controls. Runtime scheduling and tamper resistance are not.

## Singular Boundary

T-253 owns exactly one relation:

```text
f : A -> B
over : Vector<A>
into : Vector<B>
--------------------------------
fan_out(f, over, into) : Vector<A> -> Vector<B>
```

The relation is explicit authored GTL data. On a wholly successful vector
relation it preserves one result slot per input ordinal, output ordinal `i`
corresponds to input ordinal `i`, and completion order cannot alter vector order
or cardinality. Blocked-task lineage and partial-failure behavior remain wholly
outside this ticket. The relation is not
inferred from a GraphFunction name, display label, tag, `Vector[...]` spelling,
or reuse of one node as both boundaries.

`fan_in` is the contrast, not part of this reprice: its existing shape is
`r:Vector<A>->B`, `over:Vector<A>`, therefore
`fan_in(r, over):Vector<A>->B`. This ticket neither redesigns nor realizes
fan-in execution.

## Candidate Requirement Law

The accepted requirement reprice amends `REQ-L-GTL3-HOF.md` with one explicit
criterion:

> `fan_out(f, *, over, into)` shall accept an element GraphFunction relation
> `f:A->B`, an explicit input-vector relation `over:Vector<A>`, and an explicit
> output-vector relation `into:Vector<B>`, and shall produce a GraphFunction
> relation `Vector<A>->Vector<B>`. The admitted relation shall preserve input
> cardinality and stable input ordinal, pairing output member `i` only with
> input member `i`. Native authoring, canonical serialization, raw admission,
> and semantic compilation shall preserve the same first-class relation and
> shall not infer it from a function name, label, tag, or shared node identity.

This wording is the accepted Phase A target. It becomes live constitutional
law when the requirement edit lands in the same checkpoint.

## Proposed T-252 Disposition Reference

T-253 records the following proposed wording only so the dependency cannot be
misread. T-252 remains its own authority carrier and is not edited here:

> `fh_target_accepted`: the Consensus target architecture is accepted. T-253
> closes the generic typed HOF prerequisite first; the executable Consensus
> body remains blocked and T-252 re-enters design review after T-253 closes.

## Accepted-Design Execution Order

Only after F_H accepts the T-253 design:

1. Ratify the single candidate HOF law without repricing fan-in, graph
   recursion, C algebra, or runtime execution.
2. Add native opaque invariant `HofBoundary<T>`, `HofVector<T>`, and
   `HofUnaryRef<I,O>` refs analogous to `CCarrier` and `CGraphFunctionRef`.
   Keep `Node` and `GraphFunction` non-generic.
   Parse `Vector[T]` through one closed structured vector-schema parser and
   require the parsed member schema to equal the explicit member witness;
   prefix/suffix string tests are not type admission.
3. Replace the same-node `fan_out` facade with an exact typed constructor over
   `f`, `over`, and `into`. Remove the untyped two-argument route; migrate its
   lawful identity uses to an explicit same input/output relation.
4. Publish one closed canonical `gtl.hof_application` declaration whose
   serialized fields bind the element function, element carriers, vector
   nodes/carriers, stable ordinal policy, and cardinality policy by opaque ref.
5. Make native serialization and raw admission converge on one canonical
   declaration and digest. Raw JSON receives no weaker route than native data.
6. Extend the existing semantic compiler to resolve that declaration by exact
   refs. Malformed, missing, duplicate, unresolvable, or type-incoherent
   relation data yields `invalid_program`. A lawful admitted relation without
   a generic execution realization yields `semantic_not_realized`.
7. Delete fan-out recognition by GraphFunction name prefix or tag from the
   relied-on compiler/conformance judgment. Names and tags remain display and
   discovery metadata only.
8. Pin one non-Consensus Scenario 09 Fan-Out Transform fixture:
   `normalize:LabObservation->NormalizedObservation` over
   `Vector<LabObservation>` into `Vector<NormalizedObservation>`. Prove native
   type refusal, native/raw equivalence, stable relation data, mutation
   rejection, and exact compiler classification.
9. Run focused type/admission/compiler tests and the semantic regression suite,
   then self-review the diff against the accepted design before checkpointing.

## Closure Conditions

1. F_H accepts the referenced domain, sequence, and state design before any
   specification or implementation edit.
2. The exact candidate requirement law is ratified in the HOF requirement
   family and indexed where the contract-law API enumerates higher-order law.
3. Native TypeScript rejects mismatched `f`, `over`, and `into` element types
   without a cast, loose object, name check, tag check, or global generic
   parameter on `Node` or `GraphFunction`.
   Native constructor admission re-admits and normalizes each structural
   `Node` through the existing M01 node admitter, then rechecks the exact node
   contract keys and structured vector-schema/member join after TypeScript
   erasure. It does not add a global Node admission brand.
4. The constructor produces an admitted ordinary GraphFunction plus an opaque
   typed ref proving `Vector<A> -> Vector<B>` and a first-class canonical
   relation declaration carrying exact stable refs.
5. Native serialization followed by raw admission produces the same relation
   fields, GraphFunction identity, and canonical digest. Independently authored
   raw data with the same lawful fields admits equivalently.
6. Missing, extra, duplicate, forged, mismatched, or unresolvable relation data
   fails closed as `invalid_program`; it cannot acquire a native opaque witness.
7. The M03 compiler resolves the canonical relation rather than a name/tag.
   A valid relation produces the exact `semantic_not_realized` HOF execution
   diagnostic until a separately designed generic runtime atom exists.
   T-253 does not publish or invoke that relation and does not claim the
   compiler is an integrated runtime gate.
8. Stable cardinality and ordinal policy are explicit declaration values:
   output cardinality equals admitted input cardinality and output ordinal `i`
   is bound to input ordinal `i`, independent of completion order.
9. A non-Consensus Scenario 09 fixture proves the atom is generic. Consensus
   may consume the closed atom later but is not the only proof.
10. The full semantic suite remains green, and a phase self-review finds no
    scheduler, runtime, C.batch, fan-in, or Consensus realization drift.

## Non-Closure Conditions

- Specification or product code changes before F_H accepts this design.
- `Node` or `GraphFunction` becomes globally generic to make one HOF relation
  compile.
- A cast, `unknown`, structural object, display name, tag, schema-ref string,
  or `promote` manufactures the missing relation.
- The current two-argument same-node facade remains as a weaker fallback.
- `into` is optional or silently defaults to `over` when element output differs.
- Raw admission accepts a relation that the native invariant API cannot mint,
  or native and raw canonical identities differ.
- The compiler treats a well-formed but unrealized relation as valid executable
  runtime behavior, or treats malformed relation data as merely unrealized.
- Worker completion order determines output vector order or cardinality.
- The only positive fixture is Consensus-shaped.
- This ticket adds a scheduler, interpreter loop, runtime fan-out, C.batch
  mapping, Consensus code, plugin, worker dispatch, archive, event, or replay
  behavior.
- This ticket changes `fan_in`, recursion, `workflow.C`, `C.retry`, or another
  graph-algebra operator.

## Explicit Non-Scope

- generic runtime execution of fan-out or fan-in;
- mapping fan-out to `C.batch`, task allocation, concurrency, scheduling,
  cancellation, retry, events, replay, or lineage projection;
- the Consensus GTL body, compiler probe, schemas, CLI invocation, profiles,
  F_P/F_H behavior, or workspace applications;
- fan-in type-law reprice or execution realization;
- GraphFunction/Node ontology redesign; and
- hostile-workstation, cryptographic, symlink, process-isolation, or
  tamper-proofing controls.

## Candidate Design Verdict

`accepted_for_t253_realization`. Direct F_H acceptance on 2026-07-12 admits the
requirement reprice and the bounded M01/M03 realization described above. The
implementation must stop at typed authoring plus `semantic_not_realized`;
runtime execution belongs to a separately reviewed leaf driven by the later
T-252 compiler census.
