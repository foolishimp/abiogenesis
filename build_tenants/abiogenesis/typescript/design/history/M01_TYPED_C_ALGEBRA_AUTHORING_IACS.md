# M01 Typed C Algebra Authoring - IACS

**Ticket**: T-220
**Requirement**: `REQ-L-GTL3-C-ALGEBRA`
**Change class**: `requirement_reprice` flowing into design and realization
**Owning module**: M01 GTL core, with M03 semantic compilation and execution admission

## Intent

Make the TypeScript package's public GTL API an executable grammar for an
LLM-authored program. The API rejects local category errors; raw admission
applies the same rules to canonical data; the existing ABG semantic compiler
reports the remaining whole-program gaps. Runtime receives admitted meaning and
does not infer structure from observed execution.

## Axioms

The implementation shall preserve these non-coercions:

```text
GraphFunction != GraphVector
GraphFunction != GTL program/overlay
GTL program/overlay != workspace
TraversalUnit is a runtime projection, not authored topology
C stage role != fibre
fibre != implementation
implementation != traversal/controller authority
observation != declaration
raw != admitted != compiled != runtime
```

The only admissible relations are named constructors or compiler judgments.

## Interfaces

### `CExpression<A,B>`

Opaque typed expression with an exhaustive discriminant:

- `c_of`
- `c_identity`
- `c_compose`
- `c_edge`
- `c_workflow`
- `c_batch`
- `c_retry`

Public construction occurs through `C.of`, `C.id`, `C.compose`, `C.edge`,
`workflow.C`, `C.batch`, and `C.retry`. Callers do not construct admitted or
compiled variants by object literal. `C.edge` accepts exactly three direct
`C.of` leaves carrying the transform, evaluate, and consequence role literals;
wrappers and composition remain outside that named record.

`C.batch` accepts a non-empty ordered family whose tasks share input carrier,
output carrier, and per-task result cardinality. Stable list position is the
pairing identity for pointwise distribution over an equal-length compatible
family. The batch does not sum task judgments into aggregate `many`.

### `CStage<Role,Fibre,A,B>`

Carries role, fibre, arm identity, input/output contract identity,
result-bearing truth, and instruction-category refs. Role is open program data.
Fibre is the closed `{F_D,F_P,F_H}` set. Implementation selection matches both.

### Host-indexed declarations

The public types distinguish:

- `GraphFunctionDeclarations`
- `GraphVectorDeclarations`
- opaque extension configuration

Every reserved `abg.*` or `gtl.*` semantic key is registered with host and
value-kind law. The seven execution keys compiled by T-220 additionally publish
their precedence, composition, and interpretation owner in
`GTL_EXECUTION_DECLARATION_LAWS`. Extending that metadata to the wider legacy
registry is a separate language-registry change. Generic `SerializedAttrs`
remains a wire/config carrier and is not an executable semantic authoring API.

### Semantic compiler result

```text
unknown canonical data
  -> admitted typed declarations/C expression
  -> CompiledGtlProgram | GtlProgramConformanceIssue[]
```

A diagnostic carries stable identity, subject, expected/actual relation,
axiom/requirement refs, evidence, and admissible repair moves. A lawful but
unrealized constructor returns a typed gap; the compiler never substitutes a
different constructor.

This judgment is relative to one admitted submitted conformance root: its
module/catalog and graph-function rows plus expected coverage. The compiler can
reject a declaration missing from that bound root. Product/install binding
selects which admitted root is authoritative for the release.

### Execution basis

`ExecutionBasis` is built through the published constructor from an admitted
GraphFunction and materialized graph. Construction compiles the execution
declarations once before the runner consumes them. The current desktop product
trusts native in-process callers and does not attempt to make local objects
tamper-proof or turn a lawful stable `GraphFunction.id` into a content digest.

### Implementation matching

The enclosing C program supplies `programRef`; each atomic leaf supplies role,
fibre, arm, and domain input/output carrier refs. Handler bindings match the
selected program/role/fibre/arm. Domain carrier continuity is proved while
compiling the C program. Plugin and handler implementations separately satisfy
their published runtime seam carriers. The uniform `EnginePluginInput` and
outcome contracts are transport envelopes, not aliases for domain C carriers.

## Allocations

| Concern | Owner |
|---|---|
| C syntax, local type relations, canonical data shape | M01 GTL core |
| raw declaration/C admission | M01 GTL admission |
| submitted-root references, catalog membership, cardinality, precedence, constructor realization gaps | M03 GTL program conformance compiler |
| selected implementation completeness | M03 execution admission |
| implementation resolution among compiled declared terms | M03 interpreter |
| source/import escape prevention | tenant tooling guard |
| domain meaning and program choices | downstream product declarations |

## Constraints

- Do not close open stage roles to the bootstrap triple.
- Do not add a vector-local plugin route.
- Do not infer a fibre from handler behavior or downstream census.
- Do not let opaque configuration acquire reserved semantic meaning.
- Do not introduce a second compiler or downstream checker.
- Do not require a human to hand-author GTL for proof; the proving consumer is
  an LLM constrained to the public API and diagnostics.

## Scenarios

### Positive

An LLM selects typed catalog terms, constructs a compatible C expression,
serializes canonical data, receives a passing compiler result, and starts the
published GraphFunction through ABG.

### Local mismatch

An LLM attempts to compose `C<A,B>` with `C<X,Y>` where `B != X`. The native
API does not typecheck. The equivalent raw data receives the stable interface
mismatch diagnostic.

### Category mismatch

An LLM attaches `abg.plugin_selection` to a GraphVector. Native host typing
rejects it; raw admission reports declaration-host mismatch; no plugin or
runtime effect occurs.

### Genuine realization gap

An LLM authors a lawful `workflow.C` or another generator whose selected build
tenant interpreter is absent. Admission preserves the authored term and the
semantic compiler reports `semantic_not_realized` with a re-entry affordance.
An unresolved `GraphFunctionRef` instead reports `invalid_program`.

### Malformed F_P output

An F_P worker returns a response with a missing required field, unattested
assessment, or contradictory accepted/retry disposition. The existing ABG
result-admission boundary rejects it or projects a typed blocked/retry outcome;
worker text never becomes accepted replay truth by omission.

## Proof

- compile-time `@ts-expect-error` type corpus;
- canonical serialization and algebra-law tests;
- declaration host/value/duplicate differential tests;
- semantic diagnostic and repair snapshots;
- malformed and contradictory F_P result-admission differentials;
- source guard for unregistered reserved keys and runner-local raw parsing;
- full TypeScript tenant proof and installed package consumer proof.
