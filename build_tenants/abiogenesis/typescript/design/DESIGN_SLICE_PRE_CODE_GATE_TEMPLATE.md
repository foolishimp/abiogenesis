# Design Slice Pre-Code Gate Template

**Status**: Template
**Method authority**: `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md` section 5E
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

Use one copy per semantic boundary or durable delivery checkpoint. Do not use
one copy per source file. Delete all instructional placeholders before review.

## Boundary

- **Design verdict**: `candidate | accepted | rejected | blocked`
- **Owning module**:
- **Requirements**:
- **Ticket or intake**:
- **Code scope**:
- **Dependencies**:
- **Explicit exclusions**:
- **GTL/ABG executable design probe**: required when the constructive carrier is
  a GraphFunction
- **GTL admission, ABG semantic-compiler result, and typed gaps**:

Implementation is prohibited unless the verdict is `accepted` and the axiom
matrix contains no failed applicable axiom or relied-on realization gap.

## Prime Contraction Review

Delete this section only when ADR-044 is not applicable. For T-277-governed
work, replace every placeholder with exact evidence. This embedded block is
validated by `npm run check:prime-contraction`.

```json prime-contraction
{
  "schemaVersion": 1,
  "iacs": [
    "PrimeCarrier"
  ],
  "authoritativeCarriers": [
    "PrimeCarrier"
  ],
  "subordinatePayloads": [
    "SubordinatePayload"
  ],
  "promotionTests": [
    {
      "candidate": "PrimeCarrier",
      "verdict": "promote",
      "reason": "State the independent authority, admission, lifecycle, effect, or reuse boundary."
    }
  ],
  "recurrenceReview": {
    "status": "none_found",
    "ref": "ticket-or-census-evidence-ref"
  },
  "authoritySourceCount": {
    "before": 0,
    "after": 1
  },
  "authoringSourceCount": {
    "before": 0,
    "after": 1
  },
  "disposition": "retain_prime",
  "ownerTicket": "T-NNN"
}
```

Use `retain_prime`, `derive_projection`, `commonize_tenant`,
`consume_existing`, `retire_duplicate`, `migrate_authority`,
`requirement_reprice`, or `not_a_candidate`. A contraction disposition must
reduce at least one measured authority or authoring-source count. An accepted
`requirement_reprice` is invalid because implementation must stop upstream.

## Domain Model

```mermaid
classDiagram
  class PrimeCarrier {
    <<prime>>
    <<authoritative>>
    +identity
  }
  class SubordinatePayload {
    <<subordinate>>
    -detail
  }
  PrimeCarrier *-- SubordinatePayload : owns
```

The domain model must show identity, ownership, cardinality, authority,
visibility, effect-edge payloads, downstream projections, and deferred
families. It models product concepts, not helper classes.

## Execution Sequence

```mermaid
sequenceDiagram
  actor ExternalActor
  participant Admission
  participant SemanticKernel
  participant EffectHandler
  participant EventProjection

  ExternalActor->>Admission: submit foreign input
  Admission->>SemanticKernel: admitted carrier
  SemanticKernel->>EffectHandler: declared effect request
  EffectHandler-->>SemanticKernel: interior result
  SemanticKernel->>EventProjection: admitted transition
  EventProjection-->>ExternalActor: result or truthful stop
```

Show the supported path and applicable malformed, refusal, retry, recursion,
fan-out/fan-in, nested-workflow, and F_H paths. Every participant must exist in
the domain model or be explicitly external. Every message must have a declared
semantic or effect owner.

## Lifecycle State Machine

```mermaid
stateDiagram-v2
  [*] --> Raw
  Raw --> Admitted: admission accepts
  Raw --> Refused: admission rejects
  Admitted --> Running: interpreter starts declared work
  Running --> Blocked: typed failure
  Running --> Terminal: admitted closure
  Refused --> [*]
  Blocked --> [*]
  Terminal --> [*]
```

Every state and transition must derive from admitted carrier, compiler, event,
projection, or explicit external-act truth. Controller-local memory is not a
lifecycle authority.

## Cross-View Invariants

| Check | Evidence | Verdict |
|---|---|---|
| Every sequence participant exists in the domain model or is external | | |
| Every lifecycle carrier exists in the domain model | | |
| Every message names a typed transform, graph/C constructor, interpreter act, or effect boundary | | |
| Every transition names an admission, compiler, interpreter, event, projection, or external owner | | |
| Raw F_P output cannot transition directly to accepted or closed | | |
| Plugins and handlers own interiors only | | |
| Batch, retry, recursion, and nested workflow use declared algebra | | |

For GTL/ABG boundaries also evaluate: lawful layer ownership, GraphFunction
decomposition, atom sufficiency, declared policies/profiles/prompts/budgets,
engine-rendered instructions, traversal-owned fan-out/fan-in, admission before
consumption, ABG/F_H closure ownership, declared recursion/foldback, and
explicit F_H lifecycle exits.

When the constructive carrier is a GraphFunction, attach the exact GTL Module
or graph-body fixture, its GTL admission result, and the current ABG
semantic-compiler result. An absent body, rejected body, or relied-on
`semantic_not_realized` result makes the design `blocked`; diagrams alone
cannot substitute for the executable probe. A downstream GLC product may be a
consumer fixture, but it does not own GTL admission or semantic compilation.

## Axiom Evaluation

| Axiom | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

Mandatory baselines include applicable PRODUCT axioms, ODD and Design Module
law, GTL laws and C algebra, ABG C-call and handler law, and slice-specific
requirements. Use only `pass`, `fail`, or reasoned `not_applicable` verdicts.

## Gap And Exclusion Register

| Gap or exclusion | Why outside or blocking | Owner | Re-entry condition |
|---|---|---|---|
| | | | |

## Design Verdict

State `accepted`, `rejected`, or `blocked` and why. An `accepted` verdict must
name the proving review. A `blocked` verdict must name the exact axiom or
realization gap and may not authorize an implementation workaround.
