# Design Module Method

## 1. Purpose

This method exists for projects that want a stronger implementation discipline
than "write code that passes."

Its bias is toward:

- low coupling
- modular composition
- immutable typed carriers
- total or nearly-total semantic transforms
- explicit effect boundaries

The goal is not language ideology.

The goals are:

- reduce ambiguity
- reduce entropy
- eliminate avoidable tech debt
- increase refactorability
- reduce hidden authority, hidden mutation, and semantic drift in realization
  code
- preserve enough evidence that later reviewers can audit, refactor, and
  reconstruct why the realization took its current shape

This method is therefore about implementation shape.

It does not mandate one optimal authoring path for every agent, worker, or
runtime.

Agentic coders may sometimes move faster by deriving implementation and proof in
the same work pass. That is acceptable only if the boundary reaches eventual
completeness before any design-method closure claim.

One pillar of spec-driven development is bounded intermediate traversal over
the graph.

Specification gives the global `WHAT`. Every intermediate traversal should have
a finite, inspectable unit for reasoning, implementation, evaluation, proof, and
later refactor. A module boundary is one realization-level tool for creating
that unit; it is not the only possible bounded traversal. Without bounded units,
reviewers and agents must traverse too much context at once, and correctness
depends on memory rather than on preserved structure.

It does not replace constitutional authority from `SPEC_METHOD.md`.

It does not replace graph-native law from `ODD_METHOD.md`.

It governs how realization modules should be structured once the project has
already decided what it is building.

For an ODD-governed product, this method does not authorize replacing a graph
function, edge traversal, or GTL module with deterministic implementation
modules. It governs the deterministic realization shape inside or beneath those
ODD carriers.

These rules apply to:

- module boundaries
- schema and carrier families
- entity and record design
- interface contracts

They are not limited to one programming language or one runtime binding.

---

## 2. Position

The preferred realization shape is functionally biased.

That means:

- semantic meaning should live in typed carriers and explicit transforms
- imperative coordination should be subordinate to admitted truth
- side effects should be isolated to explicit boundary modules
- mutable shared state should be minimized and justified

This method does **not** require a functional programming language.

It does require a functional design discipline.

A Python, Scala, TypeScript, Kotlin, or Java implementation may all satisfy
this method if they keep semantic law in explicit carriers and transforms rather
than hidden orchestration.

---

## 3. Core Rule

The core rule is:

**semantic steps should read as transforms over admitted truth; effects should
be explicit and pushed to the edge**

If a reader must inspect orchestration code, mutable workspace state, service
methods, or fallback defaults to determine what the system means, the design is
too imperative and too coupled.

## 3A. ODD Alignment And Escalation Rule

When this method is used inside an ODD-governed product, reviewers must first
ask whether the boundary is an operative graph traversal.

If the boundary represents product movement from one typed asset state to
another, the governing shape is:

1. outcome traversal under `ODD_METHOD.md`
2. declarative GTL/ABG carrier structure
3. deterministic module realization under this method

This method may govern:

- `F_D` evaluators and proofs
- carrier constructors and admissions
- deterministic transforms inside an edge traversal
- effect shells that publish the traversal result
- projections over already-admitted carrier truth

This method must not be used to hide:

- graph functions inside service methods
- edge traversal semantics inside module orchestration
- continuation or re-entry decisions inside deterministic controllers
- semantic target movement inside constructors, materializers, or projections
- probabilistic worker boundaries inside imperative prompt or dispatch code

If a deterministic module appears to own "what work is next", "what target is
being moved to", "what closes the traversal", or "what graph function is being
performed", the boundary should be repriced against `ODD_METHOD.md` before
claiming design-method closure.

In ODD products, the module boundary is a realization cut inside the graph
program. It is not the program.

## 3B. Boundary Closure Evaluators

When this method governs a boundary, each design or implementation change
should be judged against three overriding evaluators.

These are not optional heuristics.

If a change improves local ergonomics, test output, or static-checker output
but fails one of these evaluators, it is not real progress under this method.

### 1. Authority Seam Closure

Each change must not increase the number of truth surfaces.

When duplicate or rival truth surfaces already exist, seam-closure work should
reduce them.

This means:

- one authoritative carrier or contract at each semantic boundary
- no controller-side reconstruction of already-admitted truth
- no downstream surface silently rebuilding source truth from raw artifacts
- no raw or open payload trusted past ingress

The test is:

- if the authoritative carrier were removed, would the system fail closed, or
  would another path silently reconstruct the same meaning?

If meaning survives by reconstruction, the seam is not closed.

For projection and query modules, seam closure also requires source coherence:

- the projection must name the admitted carrier, runtime, event, or source truth
  it derives from
- reconstructed catalog, ownership, route, status, or closure truth must be
  structurally compared against the admitted source carrier before publication
- same-name but different-shape carriers must fail closed unless an explicit
  migration design makes the divergence lawful
- negative tests must cover structural drift, not only missing source truth

### 2. Essential Carrier Consolidation

Each change should collapse the slice to the few real identity-bearing carrier
families.

This means:

- declare the Irreducible Architectural Carrier Set first
- keep Subordinate Payloads subordinate by default
- avoid fragment classes, interfaces, or result records created only to satisfy
  typing, serialization, or convenience extraction

Progress here is:

- fewer sharper carrier families
- less duplicate authority
- less boundary inflation

Not:

- one more wrapper layer
- one more branch-local peer type
- one more public record that only mirrors payload detail

### 3. Enforcement After Proof

Typing, schemas, validators, contracts, or codecs exist to lock in a seam that
has already been made real.

This means:

- parse, validate, or construct first
- admit and narrow the boundary explicitly
- then use types or schemas to enforce the proved shape

It does **not** mean:

- relabel an open payload and call it closed
- wrap loose data in a typed envelope while keeping the same authority path
- use casts, unchecked assertions, or dynamic mutation as fake closure

This evaluator is language-agnostic.

In one language it may be `mypy --strict`, in another a sealed ADT plus a
schema parser, in another a compiler-enforced sum type plus decoder. The rule
is the same: proof first, enforcement second.

## 3B. Ingress Collapse Rule

Foreign, dynamic, or weakly-typed input is lawful only at ingress.

Once admitted, it must collapse immediately into local carrier truth before
semantic transforms begin.

The required shape is:

1. receive foreign input
2. parse, validate, or normalize it once
3. construct local admitted carrier truth
4. consume only that local truth in semantic kernels

The following are not lawful seam closure:

- repeated parsing of the same loose payload in multiple modules
- `from_dict(...).to_dict()` or equivalent round-trip ceremony that preserves
  the same open authority
- loaders that merely relabel stored JSON or map data without validating it
- semantic kernels that continue to inspect open payload fragments directly

---

## 4. Functional Bias Without Language Mandate

Projects using this method must prefer:

- immutable data carriers over mutable shared objects
- closed typed carriers over open dict or string protocols
- parsing and admitting foreign data once at ingress
- explicit return values over hidden mutation
- explicit failure carriers over ambient exception-driven control flow where
  practical
- composition of small transforms over long controller procedures

Projects using this method must avoid:

- one giant mutable workspace object
- one orchestration method that owns semantic law
- hidden read/write coupling through globals, shared registries, or mutable
  service state
- typed envelopes over open payload truth
- dynamic payload mutation at the semantic center
- effectful helpers that both decide meaning and perform writes
- proxy interfaces that partially imitate a new design while preserving the old
  authority path

---

## 4A. Python Typing Rule

When this method governs a Python boundary, repo-authored Python must be fully
typed.

That means:

- every function, method, and callable surface has explicit parameter and return
  annotations
- semantic carriers are closed and typed
- repo-authored tests, scripts, and support code are typed too; they do not get
  a lower bar than production code

Under this method, the following do **not** count as typed semantic design:

- untyped `def`
- implicit `Any`
- semantic `dict[str, Any]`
- semantic `Mapping[str, Any]`
- semantic `object` payloads used as carrier truth
- unchecked JSON blobs passed through multiple layers and interpreted by
  `.get(...)` chains

For Python, `dict[str, Any]` at the semantic center is untyped design debt, not
an acceptable carrier.

The required shape is:

- use `dataclass`, `TypedDict`, `Protocol`, `Literal`, `Enum`, or other closed
  typed forms for local carriers
- parse and validate dynamic input at the boundary
- narrow untyped external data into local typed carriers before semantic
  transforms begin
- keep `Any` at foreign boundaries only, and collapse it immediately

`Any`, `cast(...)`, and `# type: ignore` are allowed only when all of the
following are true:

- the boundary is genuinely foreign or dynamically typed
- the local code cannot express the shape more precisely
- the use is narrow, explicit, and justified in place
- the imprecision does not cross into the semantic kernel as governing truth

Python boundaries using this method must be checked with a strict static typing
pass such as `mypy --strict` or an equivalent strict checker configuration.

If the checker cannot run cleanly on the adopted boundary, the boundary is not
yet implementation-conformant under this method.

---

## 5. Prime Law

New top-level realization units should be introduced only when they are
structurally prime.

This applies to:

- functions
- classes
- carrier types
- top-level schema records
- modules

Typed closure by itself is **not** sufficient reason to create a new top-level
type.

The hard vocabulary for this rule is:

- **Irreducible Architectural Carrier Set**: the smallest lawful top-level
  carrier family required for one boundary
- **Subordinate Payload**: payload detail that exists inside that boundary but
  is not top-level by default
- **Promotion Test**: the explicit test a subordinate payload must pass before
  it becomes a top-level type
- **Boundary Inflation**: the defect where subordinate payload detail is
  promoted into extra peer types without irreducible need

A realization unit is **prime** when it introduces one irreducible new semantic
or topological boundary that cannot be honestly expressed as composition of
existing functions.

Typical lawful reasons to introduce a new top-level realization unit are:

- a new feature topology or branch in the admitted work graph
- a new typed carrier transformation
- a new effect boundary
- a new validation or admission boundary
- a new projection boundary

A realization unit is **not** prime when it exists only to:

- shorten a call site without creating a new semantic boundary
- aggregate unrelated behavior for convenience
- preserve an old interface behind a new name
- shuttle data through one more wrapper layer
- hide mutation, fallback, or orchestration that should remain explicit
- name one more payload variation that does not carry independent authority
- turn internal record detail into public schema surface without an irreducible
  boundary
- mirror another top-level carrier with only small field variation
- respond to typing discomfort by multiplying peer classes instead of closing
  one governing carrier family

This is Occam's razor for design modules:

- prefer composition over convenience extraction
- prefer existing lawful functions over new wrappers
- prefer fewer sharper boundaries over many vague helper functions
- prefer fewer sharper carrier families over many payload-shaped peer types

The purpose of the Prime Law is not to minimize line count.

The purpose is to stop semantic fragmentation and helper sprawl from becoming
architecture.

## 5A. Irreducible Architectural Carrier Set Rule

When defining a schema, carrier family, or typed public boundary, start by
naming the **Irreducible Architectural Carrier Set**.

The Irreducible Architectural Carrier Set is the smallest set of carriers
required to carry the real functionality and authority flow of the boundary.

That set should be named before subordinate payload records, helper result
shapes, or internal branch detail.

Examples of architecturally prime carrier roles include:

- source truth carrier
- admission carrier
- execution carrier
- yielded or recovery carrier
- effect plan carrier
- public projection carrier

The following do **not** automatically justify a top-level carrier:

- one more branch-specific payload shape
- one more internal persistence detail
- one more read-model row shape
- one more field grouping extracted only to make typing easier

The required carrier-set evidence is:

1. declare the Irreducible Architectural Carrier Set
2. declare which carriers are authoritative and which are downstream
3. treat every other shape as a Subordinate Payload by default
4. keep subordinate payload detail private unless it passes the Promotion Test
5. reconcile the typed implementation to that carrier set before claiming
   design-method closure

If the Irreducible Architectural Carrier Set has not been declared, the schema
is not yet design-method complete under this method.

For planned implementation work, declaring the carrier set first is the preferred
route. If implementation runs ahead, the missing carrier-set evidence must be
reconstructed, checked against the implementation, and corrected before
design-method closure.

## 5B. Promotion Test

A top-level class, dataclass, TypedDict, enum, or named schema record must
justify its existence as an architectural boundary, not merely as payload
detail.

A Subordinate Payload may be promoted to a top-level type only when at least
one of the following is true:

- it is an authoritative source carrier
- it is a public or persisted contract boundary
- it is an explicit variant of a public outcome family that consumers
  pattern-match directly
- it is reused across multiple modules without semantic bleed
- it is versioned, published, or admitted independently

Promotion is not lawful when the candidate type is only:

- internal record detail of one larger carrier
- a field grouping used once inside one module
- a temporary typing shim around an open dict
- a private payload variation that never crosses a true interface boundary
- a mirror of another type with cosmetic or local field differences

Default rule:

- if a shape does not need independent authority, independent reuse, or direct
  pattern-match semantics, it remains a Subordinate Payload and stays nested,
  private, or local to the carrier family

The burden of proof is on promotion.

Designers and reviewers should assume a candidate type stays subordinate until
an irreducible boundary is shown.

## 5C. Boundary Inflation Prohibition

Schema work must declare:

- the Irreducible Architectural Carrier Set
- which types are authoritative
- which types are downstream projections
- which shapes are Subordinate Payloads
- which Subordinate Payloads are intentionally deferred from promotion

This rule exists to stop type proliferation from turning one migration into many
parallel schema migrations.

If a schema or ticket lists a wide family of types, it must distinguish:

- the Irreducible Architectural Carrier Set
- Subordinate Payloads

Failing to make that distinction is design drift.

Typed closure does not excuse Boundary Inflation.

Boundary Inflation exists when:

- payload detail is promoted into peer types because the code feels hard to type
- internal records are turned into public schema surface without a new
  authoritative boundary
- many near-identical top-level types appear for one boundary where one carrier
  family would suffice
- one migration ticket silently becomes several parallel schema migrations

Boundary Inflation is design debt, not progress.

## 5D. Reference-Derived Module Design Rule

When a realization is being derived from an existing design line, released
tenant, or reference implementation, design-method completion must not rest on
code comparison alone.

The required derivation evidence is:

1. constitutional `WHAT`
2. reference design
3. target design mapping
4. target module boundary assets
5. implementation

This rule exists to stop code-first ports from importing reference drift,
delivery quirks, helper sprawl, or accidental authority paths into the new
realization without a later audit trail.

The minimum lawful design assets for a reference-derived module boundary are:

- the named reference design surfaces being used as source material
- the target design surfaces that replace or bind those source surfaces
- an explicit mapping that says what is preserved, reshaped, deferred, or
  demoted to delivery binding in the target line
- the target module boundary assets required by this method, including the
  Irreducible Architectural Carrier Set and structural carrier diagram

The design question is not:

- "how do I port these files?"

It is:

- "what is the target module boundary, and how does the new realization derive
  it from the reference design without inheriting incidental implementation
  drift?"

If a target realization cannot show that derivation chain, it is not yet
design-method complete under this method.

## 5E. Structural Carrier Diagram Rule

Every active typed module boundary must carry one complete structural carrier
asset before it claims design-method closure.

That asset must include a Mermaid `classDiagram` view unless the project has
ratified another text-native diagram format explicitly.

The diagram is not decorative.

It is a sign-off surface for:

- Prime Law
- visibility
- carrier ownership
- subordinate payload discipline
- boundary inflation review

The diagram must show, for the active boundary:

- prime carriers
- subordinate payloads
- effect-edge-only payloads
- downstream-only projections
- deferred families outside the active slice
- authoritative versus downstream role
- public versus module-local visibility
- composition, containment, and variant-family structure

The standard stereotype vocabulary is:

- `<<prime>>`
- `<<subordinate>>`
- `<<effect-edge>>`
- `<<deferred>>`
- `<<authoritative>>`
- `<<downstream>>`

The standard visibility vocabulary is:

- `+` public or exported
- `-` module-local or private

The standard relationship expectations are:

- composition for owned subordinate payloads
- association for downstream consumption
- inheritance only for real variant or outcome families

The diagram must stay module-bounded.

It is a defect if the asset mixes one active module boundary with unrelated
bootstrap, test harness, projection, or delivery shapes simply to look
complete.

For planned implementation work, completing the structural carrier diagram before
implementation is the preferred route. If implementation runs ahead, the diagram
must be reconstructed from the actual boundary, checked against the IACS and
implementation, and corrected before design-method closure.

If a boundary has no complete structural carrier diagram, it is not yet
design-method complete under this method.

## 5F. Theoretical Framing For Boundary Law

This method is operational and stands on its own. It does not require a user to
adopt the world-model domain or accept any empirical ontology program before
using it.

The current world-model work does, however, provide a useful theoretical
framing for why these rules are shaped this way.

`WORLD_MODEL_METHOD.md` treats a Markov object as a candidate
identity-bearing cut: a stable self-bounding pattern whose effective blanket
separates what is load-bearing for identity from what is load-bearing for
context. Under that framing, the engineering problem is not "how do I name more
field groups?" but "what is the smallest lawful boundary that preserves the
thing's identity under variation?"

Read that framing into this method carefully:

- the **Irreducible Architectural Carrier Set** is the software-design analogue
  of the smallest identity-bearing cut
- the **Promotion Test** asks whether a subordinate payload has enough
  independent authority to count as its own boundary rather than as evidence
  carried inside another one
- **Boundary Inflation** is the software-design form of mistaking many sensed
  fragments, attributes, or payload groupings for many real peer objects
- strong typing at the semantic boundary prevents the identity-bearing cut from
  remaining fuzzy, reconstructive, or controller-owned

This is a theoretical justification, not an extra prerequisite.

The rules in this file remain engineering law even where the Markov-object
construct is irrelevant, unavailable, or still only candidate-class. The
theoretical framing sharpens the ask; it does not expand the scope of the
method.

## 6. Design Module Taxonomy

When this method governs a realization boundary, modules should be classified by
role.

Recommended roles are:

- **Carrier module**: defines typed immutable inputs, outputs, contracts,
  transitions, records, or envelopes
- **Semantic kernel module**: implements the main transforms over carriers
  without performing side effects
- **Effect shell module**: performs event emission, file publication, network
  calls, subprocess execution, persistence, or operator delivery
- **Projection module**: derives read models or reports from authoritative
  source truth
- **Binding or adapter module**: converts between external boundaries and the
  project's internal carriers without inventing semantic law
- **Constructor or materialization module**: writes generated or built artifacts
  from admitted carriers and explicit plans

The point of the taxonomy is not naming ceremony.

Modules are realization-level tools for bounding graph-traversal reasoning.

The point is to give reviewers, maintainers, and future refactor work a stable
cut for global reasoning without letting semantic law smear across mixed
authority surfaces.

A good module boundary improves the likelihood of correct traversal because the
computation and evaluation surface is better constrained. This is true for any
intermediate traversal of the graph under finite context, attention, and time.
Review can ask what the bounded unit owns, what it consumes, what it emits, and
what proof is sufficient without re-reading the whole system.

That same constrained surface makes later consolidation into reusable libraries
easier. Repeated module-local computations are visible as recurrence candidates
instead of disappearing into broad orchestration code.

## 6A. Design To Module To (Implementation, Unit Tests) Evidence Route

When this method governs an active realization boundary, the canonical evidence
route is:

1. design
2. module boundary asset
3. implementation and unit tests in parallel

This route is the preferred authoring path.

It is not a universal claim about the fastest possible agentic coding path.

What is mandatory is eventual completeness:

- the final implementation must be traceable to design and module boundary
  assets
- unit tests must be traceable to module ownership, not only to helper layout
- any implementation-first work must be reconciled back into the design/module
  evidence before design-method closure

Implementation may run ahead of full module evidence during exploration or
agentic construction.

It may not claim design-method closure from code alone.

Unit tests may be discovered from implementation behavior, but the closure proof
must be re-expressed against module ownership rather than code helper shape.

The module boundary is the intermediate reasoning surface that lets
implementation and unit tests be audited against the same ownership cut.

It does not outrank constitutional truth or ratified design.

The minimum complete evidence chain is:

1. constitutional `WHAT`
2. target design
3. target module boundary assets
4. implementation
5. unit tests derived from the same module boundary

Where a reference realization exists, the complete evidence chain becomes:

1. constitutional `WHAT`
2. reference design
3. target design mapping
4. target module boundary assets
5. implementation and unit tests

If a change jumps from design or code straight to tests and never reconstructs
the module boundary, the proof surface is too weak.

## 6B. Module-Derived Unit Test Rule

Unit tests under this method are module-owned proof lanes.

They must derive from module ownership evidence, not from code shape alone.

That means a unit test should be traceable to:

- the governing module design
- the active IACS or equivalent carrier inventory
- the module-bounded structural carrier diagram when one exists
- the requirement families the module owns

Unit tests must not be authored primarily from:

- helper function boundaries
- private method layout
- incidental branch structure
- temporary implementation decomposition
- mock convenience that hides the real module contract

The required question is not:

- "what functions exist to test?"

It is:

- "what does this module own, and what proof does that ownership require?"

This does not prohibit helper-level tests.

It does prohibit helper-level tests from becoming the canonical proof surface
for a module boundary.

Canonical rule:

- module-owned unit tests are authoritative for module proof
- broader integration, scenario, and sandbox lanes remain downstream proof
  families
- transitional slice-gating tests may exist, but they do not replace
  module-derived unit proof

If a module has code but no module-derived unit test lane, the module is not
closure-ready under this method.

---

## 6C. Module Lifecycle Confirmation Rule

Every designed module, function, application surface, runtime surface, plugin
surface, public interface, data surface, graph function, or GTL module exists
inside an operational lifecycle. This method must confirm that lifecycle signal
at the realization boundary before design-method closure.

The canonical operational lifecycle chain is defined by `SPEC_METHOD.md` under
the Operational Lifecycle Sufficiency Rule. This method consumes that canonical
chain; it does not redefine the phases.

This checklist is not a release plan and does not replace `RELEASE_METHOD.md`.
It is an ambiguity detector for ultimate intended use.

For each governed boundary, design-module-method evidence must state, or point
to a surface that states:

- the upstream intent and requirement authority
- the build or realization surface
- the assurance and proof surface
- the release or packaging posture
- the deployment or install posture
- the live usage or invocation posture
- the observed telemetry, projection, or monitoring posture
- the retirement, revocation, supersession, or decommission posture
- the owner, source truth, and authority boundary for the lifecycle decisions

Each lifecycle phase must be one of:

- answered by the active design, requirement, release, deployment, or telemetry
  surface
- declared not applicable with a reason
- recorded as a named `Gap:` or `Unanswered:` item with an owning follow-up

A phase list without answers, not-applicable reasons, or named gaps is not
design-method evidence.

Implementation proves the selected lifecycle path only within the authority it
owns. Code, tests, generated artifacts, or runtime fixtures may confirm that a
lifecycle claim is real, but they may not invent lifecycle authority that the
product, requirements, design, release, or operational surface did not declare.

If the lifecycle checklist exposes missing release, deployment, live-use,
telemetry, or retirement truth, the module may still proceed only when that gap
is explicitly governed. It may not close by relying on local convention,
implementation precedent, mutable runtime state, prompt prose, or test-only
fixture behavior.

---

## 7. Immutable Carrier Rule

Source truth should be carried in typed immutable values unless mutation is
materially necessary.

Preferred shape:

- constructor or parser produces a typed carrier
- transforms consume one carrier and return another carrier or a closed result
- projections read those carriers without mutating them

Mutable carrier state requires explicit justification when it is:

- performance-critical
- required by the host runtime or framework
- modeling a genuinely stateful boundary rather than semantic truth

Convenience is not sufficient justification.

---

## 8. Totality Rule

Semantic functions should be total or as close to total as the language and
problem allow.

Preferred shape:

- invalid input is rejected at the boundary
- semantic kernels consume admitted carriers only
- failure is returned in a typed and explicit form when practical

Projects using this method should prefer:

- `Result`-like or closed outcome carriers
- explicit validation stages
- explicit "unsupported" or "rejected" outcomes

Projects using this method should avoid:

- partial functions that assume hidden preconditions
- semantic `.get(...)` fallback chains
- controller code that reconstructs missing truth from defaults

---

## 9. Effect-Edge Rule

Effects should be explicit and isolated.

Typical effect edges include:

- file writes
- network calls
- subprocess execution
- event append
- manifest publication
- prompt delivery
- database mutation

Semantic kernels should not perform these effects while also deciding the law.

The preferred sequence is:

1. admit or parse the authoritative input
2. transform it into a typed plan or outcome
3. apply effects at the edge using that plan or outcome
4. publish resulting events or projections downstream

If a function both decides the semantic meaning and directly performs the write,
the design should be treated as suspect.

---

## 10. No Semantic Center Rule

No controller, manager, service method, runtime loop, or public wrapper should
be the hidden semantic center of the system.

That includes:

- deciding meaning procedurally in orchestration code
- rebuilding truth from payload fragments
- rehydrating current law from legacy files or fallbacks
- flattening typed meaning into ad hoc dict handling and `.get(...)` chains

A module is acting as an unlawful semantic center when reviewers must read it to
discover:

- what counts as closure
- what identity means
- what failure means
- what work is next
- what the current truth is

Those meanings should already exist in carriers, contracts, or explicit design
modules.

---

## 11. Coupling Rule

Coupling should be reduced by dependency shape, not only by file count.

Preferred dependency direction is:

`carriers -> semantic kernels -> effect shells -> projections`

Not:

`controllers -> service helpers -> mutable runtime state -> projections`

Design is too coupled when:

- many modules read and mutate the same object
- projections must inspect implementation state to infer truth
- a consumer can silently rebuild source truth from raw artifacts
- tests pass only because multiple modules still carry the same meaning

Reducing coupling means reducing the number of places where meaning can be
invented.

---

## 11A. Governance/Strategy Separation Rule

When a boundary governs, observes, routes, audits, or evaluates another actor,
executor, builder, or substrate, it must publish governance truth, not
imperative strategy law, unless strategy ownership is explicitly part of the
boundary's ratified responsibility.

Lawful governance publication includes:

- current state
- preserved structure
- unmet pressure or unresolved ids
- route eligibility
- lawful edit or proof frontier
- admitted policy identity
- prior-turn or prior-run continuity

Unlawful strategy drift includes:

- imperative instructions about how the downstream actor should repair or act
- framework-owned preference rules masquerading as observability
- budgets, scores, counters, or heuristic ratings that recreate the governed
  actor's own judgment unless that assessment boundary is explicitly owned
- prompt, report, or read-model surfaces that become hidden strategy doctrine

The required distinction is:

- governance surfaces describe the state, boundary, and admissible routes
- strategy surfaces prescribe how another actor should do the work

If a system is meant to remain governance/observability over another actor, it
must not drift into replacement decision-engine behavior through contexts,
projections, prompts, or route helpers.

---

## 11B. Opportunistic Optimization Rule

When a realization boundary is lawfully open for migration, refactor, or
bounded implementation work, the area should be left better than it was found.

This does not outrank constitutional truth, declared module ownership evidence,
or functional equivalence. It is subordinate to them.

Opportunistic optimization is lawful only when it is:

- boundary-local to the active design or module surface
- behavior-preserving at the declared semantic boundary
- authority-neutral, with no change to ownership of truth
- visibility-neutral, with no silent promotion of subordinate payloads
- effect-neutral, with no hidden expansion of runtime, persistence, or
  bootstrap doctrine

Examples of lawful opportunistic cleanup include:

- removing parser re-entry on locally assembled truth
- consolidating duplicated module-local route logic
- replacing a poor local algorithm or repeated scan inside the active boundary
  when semantic behavior stays the same
- simplifying proof fixtures or module-derived tests without changing their
  governing module claims

Examples that are not opportunistic cleanup and therefore require explicit
design re-entry include:

- repricing lookup, indexing, caching, or persistence strategy across module
  boundaries
- changing public carriers, visibility, or ownership of truth
- widening effect boundaries or runtime observability doctrine
- introducing performance behavior that changes product expectations rather
  than only improving local realization quality

When a cross-boundary opportunity is discovered during lawful cleanup, it must
not be silently absorbed into the active boundary. It must become a separate
follow-up work item at the smallest lawful re-entry point before follow-up
implementation is opened.

This method owns the scope-separation rule. It does not own the work-tracking
mechanism. For ticketed work, `TICKET_METHOD.md` governs how the follow-up is
recorded and how it affects ticket closure.

The test is simple:

- if the improvement stays inside the active boundary and preserves declared
  behavior, it is lawful cleanup
- if it changes authority, public meaning, or cross-boundary realization
  doctrine, it is a new design decision

Leaving an opened area better than it was found is good realization practice.
Using cleanup as cover for unauthorized redesign is not.

---

## 11C. Recurrence Extraction Rule

When the same realization pattern appears across more than one processed
boundary, review must treat that pattern as a commonization candidate rather
than as another purely local cleanup.

Module boundaries make this review possible. They constrain computation and
evaluation enough that repeated local shapes can be compared honestly and
consolidated into libraries without changing product truth.

A recurrence candidate is usually:

- not product truth
- authority-neutral
- reused across two or more tickets or module boundaries
- consumable through local adapters without changing semantic ownership

Typical candidates include:

- expectation derivation
- nested contract or policy carriers
- proof-helper or fixture shaping
- effect-edge request or plan shaping
- constructor or materialization helpers that do not own semantic law

The rule of two is:

- the second credible recurrence forces a library/commonization review
- the third local rebuild is not acceptable by default

A third local rebuild is not design-method conformant unless one of these is
true:

- the active boundary consumes an existing reusable library/commonization surface
- the active boundary extends that surface before the local implementation lands
- review records an explicit do-not-commonize decision and why the pattern is
  still boundary-specific

For ticketed implementation work, `TICKET_METHOD.md` owns the ticket-level
recording and enforcement of that decision through fields such as
`library_usage`, `governing_library`, and `library_rationale`. This section
defines the design-method review obligation, not a rival ticket lifecycle.

Preferred commonization order is:

1. boundary-local cleanup
2. tenant-local reusable library
3. shared/common propagation only through separate design re-entry

If a reusable pattern remains tenant-local and authority-neutral, it should be
extracted into a reusable library/common realization surface rather than being
recreated inside each module.

If commonization would change ownership, public carriers, module boundaries, or
shared/common law, it is no longer recurrence extraction. It is a separate
design decision and must be treated that way.

---

## 11D. Post-Ticket Design Review Rule

When a ticket adopts this method and claims its boundary has been processed, the
design-method closure claim should not rest on implementation status alone.

A design-module-method review must be run against the processed boundary before
the ticket claims closure under this method.

`TICKET_METHOD.md` remains the authority for ticket status, closure mechanics,
reopening, dependency handling, and follow-up ticket recording. This rule states
what the design-method review must cover when this method governs the ticketed
boundary.

That review must check:

- whether the boundary stayed lawful under the current design and module assets
- whether boundary-local cleanup opportunities were discovered and should be
  absorbed before the design-method closure claim
- whether repeated realization patterns were discovered and should be absorbed
  into an existing or new library/commonization surface before the design-method
  closure claim
- whether any cross-boundary opportunities were discovered and require separate
  follow-up work items

The required consequence is:

- boundary-local, behavior-preserving, authority-neutral cleanup should be
  absorbed into the active boundary before the design-method closure claim when
  feasible
- tenant-local reusable recurrence should be absorbed by consuming or extending
  the governing library/commonization surface before the design-method closure
  claim when feasible
- cross-boundary opportunities must not be folded into closure cleanup; they
  must become separate follow-up work items at the smallest lawful re-entry
  point
- the processed ticket should record the review outcome and resulting follow-up
  work items where `TICKET_METHOD.md` or the local ticket surface requires that
  record

This rule exists to force discovery while the boundary is still warm:

- local optimizations are easier to see and safer to absorb before a
  design-method closure claim
- cross-boundary opportunities are easier to see and safer to isolate before
  momentum is lost

No processed ticket that has adopted this method should claim design-method
closure until this review step is complete.

---

## 12. Interface Bleed Prohibition

No interface should bleed semantic authority into another interface family.

Interface bleed exists when:

- one interface reconstructs another interface's source truth
- projection logic becomes closure logic
- report or prompt logic becomes admission logic
- public wrappers decide kernel semantics
- adapters invent meaning instead of translating boundaries

The required shape is:

- each interface family has one authoritative source truth
- downstream interfaces consume that truth
- crossing an interface boundary does not create a new semantic center

Low coupling requires semantic non-bleed, not only small functions.

---

## 13. Proxy Interface Prohibition

Projects using this method must not use proxy or partial interface
implementation as a substitute for real migration or real design completion.

A proxy interface is a new-looking surface that:

- forwards to the old authority path
- reconstructs missing truth from the old path
- keeps the old path executable behind a new name
- allows proofs to stay green while the old law still governs

This is bridge debt, not progress.

If compatibility is intentionally retained, it must be treated as an explicit
feature with its own bounded authority and proof.

Otherwise the proxy path must be removed.

---

## 14. Design Review Questions

When reviewing code under this method, ask:

1. Does semantic law live in typed carriers or in orchestration code?
2. Are the main steps readable as transforms over admitted truth?
3. Are effects isolated to explicit edge modules?
4. Can projections or reports invent closure independently?
5. Does each projection/query module derive from an admitted source carrier, or
   can it reconstruct a same-name but structurally different truth surface?
6. Is mutation justified, bounded, and local?
7. Can consumers pattern-match the source carrier directly?
8. Is any proxy or compatibility surface still silently authoritative?
9. Would removing the authoritative carrier make the system fail closed rather
   than silently rebuilding truth?
10. Is each new function structurally prime, or is it convenience aggregation?
11. Does any interface bleed semantic authority into another interface family?
12. For Python, does any governed semantic surface still rely on `Any`, open
    dict payloads, or untyped defs?
13. Has the boundary declared its Irreducible Architectural Carrier Set?
14. Which shapes are Subordinate Payloads, and why are they not staying
    subordinate?
15. Does every promoted top-level type pass the Promotion Test?
16. Has typed closure caused Boundary Inflation by multiplying peer types or
    parallel schema migrations?
17. Does this change avoid increasing truth surfaces, and reduce duplicate truth
    where duplicate truth exists?
18. Is any foreign or open payload still trusted past ingress?
19. Did enforcement follow proof, or is the typing/schema work cosmetic?
20. If this boundary governs another actor, is it publishing state and
    admissible routes, or imperatively prescribing strategy?
21. If a reference realization exists, has the target boundary been derived
    explicitly from reference design to target design to target module assets
    rather than from code drift?
22. Does a module-bounded structural carrier diagram exist and accurately show
    prime carriers, subordinate payloads, visibility, ownership, and deferred
    families?
23. Do the unit tests derive from module ownership and module assets rather
    than from helper layout or incidental code shape?
24. If the change claims cleanup or optimization, does it stay boundary-local,
    behavior-preserving, and authority-neutral rather than becoming silent
    redesign?
25. If a cross-boundary opportunity was discovered, was it separated into a
    follow-up work item rather than folded into the current change?
26. If the same realization pattern has already appeared elsewhere, did review
    make an explicit library/commonization decision rather than allowing
    another silent local rebuild?
27. If this would be the third local rebuild of the same realization pattern,
    is the change design-method conformant because it consumes or extends the
    governing library or records an explicit do-not-commonize decision?
28. If the ticket is making a design-method closure claim, was a design-module-method
    review run against the processed boundary so local optimization and
    recurrence/commonization discovery were handled before that claim?
29. If the project is ODD-governed, is this module realizing a declared
    outcome traversal rather than substituting for the graph function?
30. Has review checked whether a deterministic module boundary is actually an
    operative edge traversal that should be declared under `ODD_METHOD.md`?
31. Do `F_D` evaluators, deterministic transforms, and effect shells remain
    subordinate to the GTL/ABG graph carrier rather than becoming the hidden
    program?
32. Does the boundary have a lifecycle confirmation against the canonical
    `SPEC_METHOD.md` operational lifecycle chain, or named `Gap:` /
    `Unanswered:` items for unresolved phases?
33. Are release, deployment, live usage, observed telemetry, and retirement
    questions answered by the proper authority surface rather than invented by
    implementation, prompt prose, local convention, or fixtures?
34. If a lifecycle phase is declared not applicable, is the reason explicit and
    compatible with the product and requirement authority?

If these questions cannot be answered cleanly, the realization is too coupled
or too imperative.

---

## 14A. Functional Realization Review Checklist

When a project claims functional bias, pure transforms, immutable carriers,
single-owner truth, or low-coupling realization, review must explicitly check:

- [ ] Does the change preserve the constitutional `WHAT` and keep realization work
      inside lawful `HOW` surfaces only?
- [ ] If a reference realization exists, is the new realization functionally
      equivalent at the semantic boundary without copying incidental
      implementation drift?
- [ ] If a reference realization exists, does the target design explicitly map
      reference design to target design to target module boundary before
      implementation?
- [ ] Do implementation and unit tests both derive from the same module
      boundary assets rather than from code-first decomposition?
- [ ] Does each semantic truth surface still have one clear authoritative owner?
- [ ] Does the change reduce duplicated truth, controller reconstruction, and
      rival local authority paths?
- [ ] Do semantic functions consume admitted carriers only?
- [ ] Are semantic functions pure for the same admitted inputs?
- [ ] Are time, randomness, UUID minting, environment reads, process state,
      filesystem, network, and global registries absent from the semantic
      center?
- [ ] If identity is introduced, is identity creation explicitly owned by a
      declared ingress or effect boundary rather than hidden inside semantic
      helpers?
- [ ] Are carriers immutable and returned as new values rather than mutated in
      place?
- [ ] Is shared mutable state absent from the semantic center?
- [ ] Do semantic transforms operate directly on local admitted carriers rather
      than re-entering parsers, validators, or loaders on locally assembled
      truth?
- [ ] Is invalid or incomplete truth rejected at ingress instead of being
      repaired procedurally inside semantic code?
- [ ] Are defaults explicit, ratified, and carrier-owned rather than
      helper-owned?
- [ ] Does each function have one clear owner and one clear responsibility
      rather than mixing admission, semantics, and effects?
- [ ] Is coupling low by dependency shape:
      semantic algebra depends on carrier contracts, not runtime shells;
      admission depends on validation, not semantic orchestration; effect code
      stays at the edge
- [ ] Does no function both decide semantic meaning and perform effects?
- [ ] Are effect boundaries explicit, typed, and unable to erase carrier truth
      into open objects?
- [ ] Do package, bootstrap, controller, adapter, and runtime-shell layers stay
      below the semantic center?
- [ ] Do governance and observability surfaces publish facts, eligibility, and
      provenance only without imperative builder or executor strategy?
- [ ] Does the active boundary have a complete structural carrier diagram that
      matches the current IACS, visibility, ownership, and deferred-family
      split?
- [ ] Do the unit tests for the active boundary derive from module ownership,
      IACS, and structural carrier assets rather than from helper layout?
- [ ] If the change includes cleanup or optimization, does it stay
      boundary-local, behavior-preserving, and authority-neutral?
- [ ] If the same realization pattern has appeared before, has the ticket made
      an explicit library/commonization decision rather than rebuilding it
      again silently?
- [ ] If a reusable library/commonization surface exists, does the ticket
      explicitly consume or extend it rather than duplicating the pattern
      locally?
- [ ] If no reusable library/commonization surface is used, is there an
      explicit rationale that the pattern is boundary-specific or not yet a
      lawful commonization candidate?
- [ ] If a cross-boundary opportunity was discovered, was it separated into a
      follow-up work item and triaged before follow-up implementation?
- [ ] If the ticket is making a design-method closure claim, was a
      design-module-method review run and were boundary-local optimizations,
      recurrence extraction, and cross-boundary opportunities handled lawfully?
- [ ] Is there a negative proof showing that an imperative bypass, open-payload
      bypass, or effect-edge erasure fails closed?
- [ ] If the project is ODD-governed, does the deterministic module sit inside
      a declared outcome traversal rather than replacing one?
- [ ] If the module appears to decide next work, traversal closure, semantic
      target movement, or graph-function identity, has the boundary been
      repriced under `ODD_METHOD.md`?
- [ ] Does the active boundary carry lifecycle confirmation against the
      canonical `SPEC_METHOD.md` operational lifecycle chain, with each phase
      answered, declared not applicable with a reason, or recorded as a named
      `Gap:` / `Unanswered:` item?
- [ ] Are release, deployment, live usage, telemetry, and retirement claims
      confirmed against product, requirement, design, release, or operational
      authority rather than derived from implementation convention or fixtures?

The compact hard-gate version of this checklist is:

- [ ] pure functions in the semantic center
- [ ] immutable carriers with no shared mutable semantic state
- [ ] one owner per truth surface
- [ ] low coupling between admission, algebra, and effect edges
- [ ] no hidden runtime authority in semantic code
- [ ] functional equivalence to specification and, when present, the reference
      realization at the semantic boundary
- [ ] lifecycle confirmation or named lifecycle gaps against the canonical
      `SPEC_METHOD.md` operational lifecycle chain
- [ ] negative proof for imperative or open bypass

This checklist is language-agnostic.
It governs module design, carrier design, data-entity design, and review of
realization work in any language.

---

## 15. Adoption Guidance

Projects may adopt this method by:

- citing it in ADRs or design surfaces
- naming it in `AGENTS.md` as the preferred realization discipline
- using it as review criteria for implementation-migration tickets
- classifying implementation modules by the taxonomy in this method

When a project adopts this method, it must apply it consistently across the
named boundary:

- design modules
- runtime or execution kernels
- prompt assembly and reporting paths
- constructors and materializers
- projection and query surfaces

For migrations involving carrier closure, schema closure, or governance
boundaries, projects should make the Boundary Closure Evaluators explicit in
the governing ADR or ticket rather than leaving them implicit.

When the adopted boundary includes schema or typed carrier work, the project
must declare and reconcile the Irreducible Architectural Carrier Set before
claiming design-method completion.

When the adopted boundary is derived from an existing realization, the project
must also publish the reference-to-target derivation asset and the
module-bounded structural carrier diagram before claiming design-method
completion for that boundary.

When the adopted boundary has active implementation, the project must also
publish a module-derived unit test lane before claiming closure for that
boundary.

Partial adoption is allowed, but the adopted boundary and adopted rule family
should be named explicitly.

Partial adoption may narrow scope.

It must not be used to claim design-method completion while skipping the evidence
needed to audit, refactor, or reconstruct the realized boundary.

---

## 16. Relationship To Other Method Surfaces

- `SPEC_METHOD.md` governs constitutional process, authority flow, repricing,
  and migration law
- `RELEASE_METHOD.md` governs release-cut, product, install, and tap-process
  evaluation
- `ODD_METHOD.md` governs graph-native constructive carrier law
- `DESIGN_MODULE_METHOD.md` governs preferred realization structure inside
  implementation and design modules
- `UX_METHOD.md` refines this method for UX surfaces with rendering,
  state-transition, and effect-membrane rules; load it only when the work
  realizes a UX surface

So:

- `SPEC_METHOD.md` answers what is lawful process
- `RELEASE_METHOD.md` answers what is a lawful release, product, install, and
  tap decision
- `ODD_METHOD.md` answers what is lawful graph-native product shape
- `DESIGN_MODULE_METHOD.md` answers what is the preferred implementation design
  discipline when you want low coupling, no interface bleed, and explicit effect
  management
- `UX_METHOD.md` answers the additional discipline that applies when a module
  realizes a UI surface

For ODD-governed products, `ODD_METHOD.md` decides whether the operative unit is
an outcome traversal, graph function, GTL module, or ABG runtime boundary.
`DESIGN_MODULE_METHOD.md` then governs the deterministic module structure that
realizes, evaluates, adapts, or projects inside that ODD boundary. When that
boundary includes a UX surface, `UX_METHOD.md` adds the render-purity,
reducer-purity, effect-membrane, and AssetSurface-binding rules required for
strong functional consistency between front-end and back-end.

The module lifecycle confirmation rule in this method detects whether the
realization has enough lifecycle signal to be safely built and reviewed. It
does not decide release eligibility, tap acceptance, install policy, or
operational rollout. Those decisions remain governed by `RELEASE_METHOD.md` and
project-owned release, deployment, or operational surfaces.

---

## 17. Non-Goals

This method does not require:

- one specific programming language
- elimination of all imperative code
- monadic or category-theory vocabulary
- replacing every exception with a custom algebraic type

It does require that the implementation shape remain readable, modular, and
honest about where meaning lives and where effects happen.
