# REQ-L-GTL3-C-ALGEBRA - Typed Compute Algebra And LLM Authoring Boundary

**Status**: Active
**Category**: Capability / Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-LAWS.md](REQ-L-GTL3-LAWS.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-R-ABG3-CCALL.md](../abg/REQ-R-ABG3-CCALL.md), [REQ-R-ABG3-PLUGIN-SEAMS.md](../abg/REQ-R-ABG3-PLUGIN-SEAMS.md), [REQ-R-ABG3-PAYLOAD.md](../abg/REQ-R-ABG3-PAYLOAD.md)

---

## Purpose

Define the typed algebra carried by compute `C` and the compiler boundary used
to keep an LLM-authored GTL program inside the GTL/ABG structure.

GTL is LLM-first. A model is expected to author canonical declaration data
through published language APIs and then repair typed compiler gaps. Correctness
shall not depend on the model remembering prose distinctions between graph
functions, graph vectors, programs, C stages, fibres, plugins, handlers,
workspaces, traversal units, or runtime controllers.

## Sorts And Judgments

The constitutional sort chain is:

```text
Module/catalog |- GraphFunction<A,B>
GraphFunction<A,B> |- internal GraphVector<A,B>
(GraphFunction, GraphVector) |- declared C<A,B>
C<A,B> |- CStage<Role,Fibre,X,Y>
CStage<Role,Fibre,X,Y> |- admitted implementation<Role,Fibre,X,Y>
```

`GraphFunction`, `GraphVector`, GTL program/overlay, workspace, `C`, C stage,
fibre, implementation binding, `TraversalUnit`, and ABG runtime state are
distinct sorts. A conversion exists only where a named constructor declares
one. Structural similarity, observed behavior, execution count, or downstream
terminology never creates a coercion.

## Requirements

**REQ-L-GTL3-C-ALGEBRA-001 - Closed generator set.** The compute algebra
generator set is exactly `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`,
`C.batch`, and `C.retry`. A build tenant shall represent the set with an
exhaustively matchable typed carrier. The canonical transform/evaluate/
consequence edge is bootstrap data expressed by the algebra, not a closed stage
ontology.

**REQ-L-GTL3-C-ALGEBRA-002 - Unit.**
`C.of<A,B,Role,Fibre>(stage<A,B,Role,Fibre>) -> C<A,B>` introduces one atomic
C-call leaf. The enclosing `CProgramDeclaration.programRef` supplies program
identity; the leaf supplies role, fibre, arm, and input/output carrier refs.
Together they name one `(program, role, fibre, arm)` census member. The leaf
has one C-call spine and an implementation may realize only its interior.

**REQ-L-GTL3-C-ALGEBRA-003 - Identity.** `C.id<A> -> C<A,A>` is the left and
right identity of composition. It projects `no_declared_check` only where the
owning contract demands no check. It cannot satisfy a required gate and cannot
make an otherwise empty executable edge program complete.

**REQ-L-GTL3-C-ALGEBRA-004 - Composition.**
`C.compose<A,B,D>(C<A,B>, C<B,D>) -> C<A,D>` is closed and associative.
Composition is flat by default: nested syntax erases to the ordered `C.of`
leaves in one declared boundary. Input/output mismatch is a type error where
the host language can decide it and otherwise a typed semantic-compiler gap.

**REQ-L-GTL3-C-ALGEBRA-005 - Edge record.** `C.edge` is the named record form
of a composition containing transform, evaluate, and consequence roles. The
three fields are atomic direct `C.of` leaves with the corresponding stage-role
literal; wrapping or composition occurs outside the record. The roles remain
ordinary declared stages. Open programs may contain other non-empty roles and
shall name exactly one result-bearing role.

**REQ-L-GTL3-C-ALGEBRA-006 - Named workflow lift.**
`workflow.C(GraphFunctionRef<A,B>) -> C<A,B>` is the only constructor that
makes an admitted graph-function traversal one transparent C at its parent
level. The typed `GraphFunctionRef` binds the admitted graph function and the
declared C input/output carriers; the lift preserves that `A,B` pair. Raw
compilation proves that the named graph function resolves. Equality between
those carrier refs and a child's published wire contract requires an admitted
outer-contract identity and shall not be inferred when that identity is absent.
The lift yields `sub_traversal` evidence. Anonymous nesting never creates a
frame or monad boundary.

**REQ-L-GTL3-C-ALGEBRA-007 - Batch.** `C.batch(tasks, batchRef)` groups a
non-empty ordered task family whose members have the same input carrier,
output carrier, and per-task result cardinality. Stable list position pairs
tasks when applying a pointwise distributive law. The batch preserves one
C-call spine and one result-cardinality judgment per invoking task plus one
non-authoritative parent grouping ref; its program cardinality is that shared
per-task cardinality, not an aggregate `many`. Batch distributes over
composition only for equal-length compatible task families paired by stable
position. A batch never collapses task identity, evidence, or judgment into
one synthetic call.

**REQ-L-GTL3-C-ALGEBRA-008 - Retry.** `C.retry(C<A,B>, budget) -> C<A,B>`
preserves the input/output contract and closes attempts under the one declared
retryable-failure allowlist. The budget is a positive declared value. Retry
does not create a per-fibre error algebra or authorize undeclared repair.

**REQ-L-GTL3-C-ALGEBRA-009 - Role/fibre orthogonality.** Stage role is open
declared program data. Fibre is one of `F_D`, `F_P`, or `F_H`. Substituting a
lawful fibre changes the selected interior and evidence class only; it does not
change graph topology, program membership, spine kinds, spine order, or spine
count. The compiler and runtime preserve the declared fibre and never
reclassify semantic `F_P` work as `F_D` from observed behavior. Replacing a
prior `F_P` declaration with `F_D` is a declaration-version and annealing
decision governed by the tuner/equivalence requirements, not a local T-220
compiler inference.

**REQ-L-GTL3-C-ALGEBRA-010 - Implementation matching.** A plugin or handler
binding shall match the enclosing program identity and selected stage role,
fibre, and arm. C input/output carrier continuity is a program-compiler
judgment. Each implementation separately matches the published carrier
contract of its plugin or handler seam; a uniform engine-plugin transport
carrier is not falsely equated with the domain C carrier ref. Its public type
and admitted carrier shall not provide event emission, traversal selection,
continuation, ledger, or closure authority. ABG admits its result and owns all
resulting runtime truth.

**REQ-L-GTL3-C-ALGEBRA-011 - Host-indexed execution declarations.** Every
execution declaration compiled by this requirement family (`abg.hog_program`,
`abg.hog_program_catalog`, `abg.hog_program_ref`,
`abg.hog_program_ladder`, `abg.hog_handler_bindings`,
`abg.hog_handler_configs`, and `abg.plugin_selection`) shall have one
published value kind, allowed host set, precedence rule, composition rule, and
interpretation owner. Native authoring APIs shall expose host-indexed
declaration types. Serialized admission shall reject unknown reserved keys,
illegal hosts, wrong value kinds, duplicate keys, and contradictory execution
authorities. Opaque extension data shall not acquire runtime meaning by
convention. Completion of precedence, composition, and owner metadata for
other already-registered semantic keys is a separate language-registry change,
not implied by this requirement family.

**REQ-L-GTL3-C-ALGEBRA-012 - Native-language maximum.** Each conforming build
tenant shall use its native static type system and API patterns as far as they
can decide the law: discriminated unions, generic input/output relations,
nominal or opaque admitted states, exhaustive matching, constructor-only
creation, and role/fibre/host-indexed bindings. A semantic compiler shall not
be used as an excuse to erase locally decidable types into strings or bags.

**REQ-L-GTL3-C-ALGEBRA-013 - Canonical-data admission.** Authored GTL remains
canonical pure data. Untyped files, generated data, package input, and API
payloads enter through raw admission that applies the same sort and relation
judgments as the native typed API. Native callers use the published typed
constructors; serialized callers use raw admission. Authored, admitted,
compiled, and runtime values remain distinct language states.

**REQ-L-GTL3-C-ALGEBRA-014 - Semantic gap ownership.** The ABG-owned semantic
compiler and execution-admission boundary shall decide facts that a local host
type cannot: decoded input, references reachable from the submitted root,
program/catalog membership, execution-declaration precedence, carrier
continuity, result cardinality, constructor realization availability,
and selected handler/plugin binding completeness. An otherwise lawful term
whose interpreter is absent produces a typed
`semantic_not_realized` gap; an unresolved named reference is
`invalid_program`; neither is silently lowered into another term.

**REQ-L-GTL3-C-ALGEBRA-015 - LLM repair protocol.** C-algebra conformance
failures shall carry a stable diagnostic identity, subject path, governing
axiom and requirement refs, evidence, and admissible repair moves. Direct
execution-declaration admission shall carry a stable typed refusal prefix and
reason before effects. Rich C diagnostics name the expected and actual sort or
relation; generic declaration diagnostics may use their stable rule, message,
evidence, and repair fields. Repair moves identify lawful constructors,
declaration surfaces, reference corrections, or constitutional re-entry. They
do not select, perform, or authorize a repair.

**REQ-L-GTL3-C-ALGEBRA-016 - Compile before effects.** A program with a local
type failure, admission failure, or unresolved semantic gap shall stop before
worker/plugin invocation, archive writes, traversal, or successful assessment
or closure truth. Diagnostic fail-closed events may report the typed refusal
and terminal stop. Runtime may select among compiled declared terms. It shall
not parse authored program meaning, infer types from observed behavior, or
repair declarations.

**REQ-L-GTL3-C-ALGEBRA-017 - Conformance corpus.** The language conformance
corpus shall pair canonical positive and negative LLM-authored programs with
exact expected diagnostic identities. It shall cover sort coercion, interface
mismatch, role/fibre confusion, implementation mismatch, illegal declaration
host, duplicate authority, malformed serialized data, required declarations
named by declared references but absent from the submitted root, inferred
undeclared terms, every realized algebra law above, and stable
`semantic_not_realized` results for lawful unrealized constructors.

**REQ-L-GTL3-C-ALGEBRA-018 - F_P response admission.** The standard `F_P`
transform, runtime-failure, and live-evaluator responses used by this execution
surface are data until ABG admits their closed schemas, required identities and
evidence references, and cross-field invariants. Attached result artifacts
admit their base envelope and closed assessment rows while domain extension
sections remain governed by the selected declared artifact schema. Malformed
output produces a typed blocked or rejected result. Incomplete or contradictory
evaluation output produces retry or blocked truth, never accepted closure by
omission. Raw diagnostic evidence may be retained. This is model-output
validation, not hostile-process tamper protection.

## Operating Trust Boundary

The current product is a single-developer desktop tool. Native code running in
the process and values already returned by the published typed constructors are
trusted. This requirement does not require tamper-proofing against hostile
in-process code, reflected private fields, forged local objects, filesystem
attackers, or cryptographic artifact substitution.

Malformed authored GTL is expected and shall be rejected by native type
matching, raw admission, lint/source guards, or semantic compilation at the
earliest boundary capable of deciding the fault. `F_P` output is probabilistic
external data and remains subject to its published result-schema admission and
contradiction checks before ABG projects accepted assessment or closure truth.
Raw observed/diagnostic evidence and non-close retry truth may be retained.
This requirement owns the declaration and implementation match leading to that
seam; the applicable ABG plugin/result requirement owns the returned-output
schema.

## Conformance Root

A conformance report is scoped to one admitted submitted root identified by
`subjectRef`: its admitted module/catalog and graph-function rows, plus its
declared expected-coverage contract. The compiler checks every declaration
reachable from that root and reports required rows missing relative to that
bound coverage contract where the contract carries an applicable inventory
field. For T-220 execution declarations, the compiler proves declared-reference
completeness and internal membership; the current coverage carrier does not
express a total expected execution-declaration inventory. Product/install
binding selects the authoritative root and complete release manifest. Those
are separate release contracts.

## Algebra Laws

For all well-typed terms where the named boundaries and effects agree:

```text
C.compose(C.id, c) == c
C.compose(c, C.id) == c
C.compose(C.compose(a, b), c) == C.compose(a, C.compose(b, c))
workflow.C(GraphFunctionRef<A,B>) preserves the ref's declared A,B contract
C.retry(c, n) preserves the contract of c
C.batch distributes pointwise over C.compose for equal-length ordered task families
fibre substitution preserves C-call spine shape
```

Equality is canonical semantic equality under admitted identity and normalized
declaration data, not host object identity.

The `workflow.C` law does not synthesize a missing wire-level outer-contract
identity. A build may certify equality to the child GraphFunction contract only
when that relation is present as admitted language data.

## Non-Conformance

A toolchain is non-conforming when it relies on prose prompting to prevent a
category error that the native type system or semantic compiler could reject;
when a bound submitted root can omit a declaration required by its own module,
catalog, or expected-coverage truth; when a runner interprets an unregistered
declaration; or when an invalid program can produce effects before its
diagnostic is emitted.
