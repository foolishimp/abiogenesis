# Reference frame dm-task-d

Task: For a refactor inside an accepted boundary and a new boundary, decide decision completeness, the sequencing mode and the affected set of the design gate, what the Ontology and three-view gate requires and lacks, whether each change may be promoted and what standing retained code has, whether the substrate selection is acceptable, and whether the Prime evidence establishes a globally Prime family and conserves root authority.

Purpose: The owning sections for ontology-first design, proportional design sequencing and decision completeness, native constructability, the authority model, Prime atoms with whole-family and recursive contraction and root conservation, the Ontology and three-view design gate with its axiom verdicts and the design verdict as a disposition, the change classes, and the core result algebra with its conjunction.

Binds:

- This task binds the construction relation: A is the exact subject and basis the activation binds, Z is the task's required outcome with the acceptance conditions the task states, and the actor's claims keep preservation, progress and outcome satisfaction distinct; a judgment its evidence cannot decide is `indeterminate`, and work it cannot finish is reported as unresolved work, not as a judgment ([../ACTIVATION.md#construction-relation](../ACTIVATION.md#construction-relation); member sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf; section sha256=6b6c2ce91c5a7e4be765af2f8009252fa8918719e1d885af6b5810ba4eb699da)
- An evaluation this task returns binds the assurance relations: the source obligation, the claimed predicate and its scope, the observation basis, the exact subject and its material dependencies; a pass is an observation until the oracle's fidelity is established ([../FOUNDATIONS.md#assurance-relations](../FOUNDATIONS.md#assurance-relations); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=a7d5fc5930338c3fb3959017f41935ce742fbb1bf189c2f527dde4e0ba12d064 spanning to #formal-representation)
- A reuse decision in this task acquires the change and the evidence-validity conditions that support applicability: the impact cover of the change, the dependencies of each retained result and its retention conditions ([../FOUNDATIONS.md#change-impact-and-evidence-reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=e989bf4b8c0dd996e5545f18db94f8ba275d14485697c0b046429746ed3bfbc6)

A `Binds:` item names an obligation the activation of this frame binds, with
a link to the owning section, the digest of its member and the digest of that
section, or of the span of sections it names, where it names one; the item
copies no section and owns no determination, and where no route of this frame
carries the section the item is a paraphrase of it.

Each excerpt below copies one owning section of a member of this method
byte for byte, except a `rows=k/n` excerpt (see below) and except that
each relative link destination is rebased
to resolve from this directory to the same target. Fenced code, inline
code and absolute and `stdo://` links are unchanged. The `Source:` line
before an excerpt names the member and the section's anchor, and gives
the SHA-256 of the whole owning member. The section digest recorded in
FRAME_INPUTS.json is over the owner's bytes, not over this copy. The
owning section decides; this frame owns no determination. An excerpt
whose `Source:` line says `rows=k/n` is a family table of which only
the k rows that cite a section this frame carries are copied, with the
table's preamble, header and every non-family table; the other rows
stay in the owning member and are not copied. The frame's
qualification, not this selection, decides whether the frame is
sufficient for its task.

Routes, in order:

1. [DESIGN_MODULE.md#5-ontology-first-design](../DESIGN_MODULE.md#5-ontology-first-design)
2. [DESIGN_MODULE.md#7-ontology-and-three-view-design-gate](../DESIGN_MODULE.md#7-ontology-and-three-view-design-gate)
3. [ACTIVATION.md#disposition](../ACTIVATION.md#disposition)
4. [SPEC_METHOD.md#change-classes](../SPEC_METHOD.md#change-classes)
5. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
6. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
7. [DESIGN_MODULE.md#foundation-to-law](../DESIGN_MODULE.md#foundation-to-law)
8. [SPEC_METHOD.md#foundation-to-law-change-management-and-ambiguity](../SPEC_METHOD.md#foundation-to-law-change-management-and-ambiguity)

Size of this frame: 100681 bytes.

Source: DESIGN_MODULE.md#5-ontology-first-design sha256=50e70c797c93718e85192aaf2de39596f62f53030507ca8242c1af7e8f0ebcbe

## 5. Ontology-first design

Every new or materially changed active semantic boundary derives its
semantic model from one accepted Ontology (P1, P6). Before a new or changed entity, function,
authority, effect, Prime-conformant carrier, module boundary, public
operation or schema is promoted, the affected boundary first produces a
candidate Ontology slice and carries it through the acceptance sequence
below.

The Ontology is the prior semantic-design authority for the boundary. It
is subordinate to the constitutional WHAT: it derives from intent,
product, requirements and the applicable graph or domain profile, and it
does not invent product meaning. Once accepted, it governs semantic
entities, relationships, invariants, lifecycle, authority, functions,
composition and effects (P6, P2). It does not replace target architecture
or module design: accepted design remains the structural HOW for topology,
interfaces, carrier placement, module boundaries, algorithms and local
realisation. Implementation and tests derive from requirements plus
accepted design and preserve the accepted Ontology; they are not direct
substitutes for either layer (P6; SPEC_METHOD §2 Constitutional chain).

Ontology acceptance identifies the constitutional sources it derives from
and the design authority that accepted it. It carries stable element and
relation identities plus a version or basis that makes source change,
staleness and the affected projection set decidable (P3; FOUNDATIONS §2,
Basis). A reprice of a governing source invalidates only the affected
Ontology relations and downstream projections until their impact is
re-evaluated; the reprice is an instance of the material input change of
[ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse), which owns the
invalidators. Code, tests, generated schemas or a single implementing
agent cannot self-ratify missing Ontology authority (P6). The Ontology
verdict may live in the same design pack and acceptance record as the
three-view verdict (§7); this rule does not require a second document,
ticket or approval ceremony.

Proportionality applies (ACTIVATION §6). A material semantic boundary is
one whose change affects identity, authority, lifecycle, public contract,
externally observable Product meaning, cross-module topology, or accepted
effect or closure law. A `realization_refactor` wholly inside an accepted
boundary may cite the existing Ontology and design basis and prove no
Ontology delta; it does not require re-authoring or re-accepting unchanged
evidence. A semantic or structural change publishes only the affected
Ontology and design delta and its projection impact set. Unaffected
maintenance and unrelated boundaries do not freeze merely because one
source digest changed (P2, P0).

For this profile (P1):

```text
Ontology =
  entities + identities + relationships + invariants + lifecycle
  + authority + atomic functions + higher-order composition
  + effects + projections
```

A class inventory, schema list, endpoint list, command list or carrier
census alone is not an Ontology (P1).

### Proportional design sequencing

For one governed boundary `B`, let `M(B)` be its complete material-relation
set (decision-complete symbolic design, below) and `U(B)` the unresolved
members of that set (P2, P0):

```text
U(B) = unresolved(M(B))
decision_complete(B) iff
  U(B) = empty
  and M(B) is jointly satisfiable
  and every network admitted by M(B) is semantically equivalent under the
      governing Product, requirements and accepted design relations
co_evolution_admissible(B) iff decision_complete(B)
design_gate(B) =
  the smallest causally closed affected set needed to establish
  decision_complete(B)
```

Design sequencing follows `decision_complete(B)`, not one global authoring
order (P2, P6). Co-evolution is lawful only when `decision_complete(B)` holds:
design still owns the structural HOW, but design, implementation and tests
may evolve together and reconcile before promotion or closure.
Design-gated sequencing is required when implementation would otherwise
establish an unresolved or contradictory relation, or choose between
materially non-equivalent networks, with durable consequences for future
change: the affected design decision is accepted before retained
implementation establishes it. A disposable spike may supply evidence
without becoming the selected design.

Neither mode is the global default; the same proportionality relation
selects between them. Proportionality decides which relations are material
and bounds the smallest affected gate; decision completeness is the
resulting admissibility test (ACTIVATION §6). Where a bounded symbolic
model can contract the material semantic alternatives within effective
reasoning capacity, the code, runtime-state, test, review and
reconciliation space it removes is counterfactual evidence of that
contraction, not an independent reason for a design gate. Where no
material alternative remains, a separate prior gate adds ceremony without
disambiguation (P2).

The bidirectional design-and-implementation relation is an evidence
relation, not bidirectional semantic authority. Implementation may provide
a counterexample, falsify a constraint or expose hidden ambiguity. It may
not select the missing semantic answer, rewrite upstream truth to legalise
itself, or ratify a material design decision after establishing it (P6).

The selected relation and its basis belong in the existing work or design
carrier; this rule requires no separate artifact. If implementation
exposes previously hidden architectural ambiguity, the boundary switches to
design-gated sequencing at the smallest causally closed affected decision
set rather than retroactively invalidating unrelated work. Serial
implementation repairs do not establish design acceptance. Repeated or
cross-cutting material surprises are evidence for diagnosis under
[ACTIVATION §1 Feedback and diagnosis](../ACTIVATION.md#construction-relation),
not a diagnosis. Where the diagnosis establishes that the affected design
cut is underconstrained, so that `decision_complete(B)` fails, one bounded
`design_reframe` follows (SPEC_METHOD §4 Change classes), and retained code
remains provisional evidence until that reframe is accepted. Where the
accepted design is decision-complete and the realisation alone deviates
from it, the repair is a `realization_refactor`, however often the surprise
recurs (P6, P2).

This applies the governing proportionality law: a prior design gate is
warranted when it removes material semantic ambiguity whose alternatives
would establish materially different durable architecture, and that
contraction justifies its reasoning load. It is disproportionate when
upstream truth leaves no materially divergent architecture to adjudicate
and a separate prior acceptance would add no disambiguation. Design still
records and owns the resulting HOW before promotion or closure (P2, P6).

### Decision-complete symbolic design

For one governed boundary `B`, the complete material-relation set is (P1,
P2):

```text
M(B) =
  entities + identities + relationships + cardinalities + invariants
  + authorities + authority transitions + functions
  + higher-order composition laws + topology
  + lifecycle states and transitions + public contracts
  + externally observable Product meaning
  + declared domains and admission conditions
  + failure and refusal routes + effect and closure laws
  + projections + module mappings + material algorithmic obligations
```

A design boundary is decision-complete when `U(B)` is empty, `M(B)` forms
one jointly satisfiable constraint network, and every network admitted by
`M(B)` is semantically equivalent under the governing Product,
requirements and accepted design relations. This is the design gate's
acceptance criterion: a boundary is ready for retained implementation
without a prior gate exactly when it is decision-complete, and a gate that
cannot reach decision completeness has not closed (P2, P6).

Ontology, Prime contraction, IACS, target design, the domain, sequence and
state views, public contracts, module boundaries, implementation and tests
are projections of that one network at different reasoning altitudes.
Their presence, section names, individual plausibility or mechanical
validity does not establish decision completeness (P1, EVALUATION §1).

The boundary is underconstrained whenever `decision_complete(B)` is false,
including when implementation has to introduce a new material semantic
decision, projections contradict one another, or two materially
non-equivalent networks remain admissible. Local algorithm and layout
choices may remain open only when every admitted choice is semantically
equivalent under the accepted network. Contradictory projections make the
design unsatisfiable and block promotion (P1, P5): an unsatisfiable design
fails the design gate's acceptance criterion, so this block is a
precondition of the gate (§7 Gate and retrospective work), not a decision
on a review finding. Decision completeness
does not require another document: the constraint network may be expressed
through the existing Ontology, algebra, module mapping and views when those
surfaces jointly carry the complete relation (P2).

### Bounded frame conservation (UP-017)

`M(B)` closes one governed boundary. A bounded local action is taken inside
a design frame that derives from other accepted frames, and its lawfulness
depends on relations the acting frame does not itself own (P4b, P0). Global and local are relative to
the selected frame. Each material design frame identifies:

- the governing frames and accepted relations from which it derives;
- the bounded affected relation set of the proposed action;
- the applicable inherited invariants;
- the authority and composition seams crossing that set; and
- the subordinate frames opened by unresolved material distinctions.

A frame may derive from more than one governing frame. A persistence
component belongs to an entity lifecycle boundary and an operational
consistency boundary; an admission function belongs to a domain transition
and a runtime-authority boundary; a shared callable may be consumed by
several sibling domains without becoming subordinate to one. A single
governing frame is lawful where the structure is genuinely hierarchical,
and is not required. Governing frames form a constraint network for the
same reason `M(B)` does (P4b, P6).

The seam rule is [ACTIVATION §1 Execution unit](../ACTIVATION.md#execution-unit)
and [§4](../ACTIVATION.md#4-totality-and-refinement). Applied to a design
frame, it makes the declared set testable against its own declared seams without a closure algorithm or
recursive expansion through irrelevant relations (P0).

The result is evaluated against every affected governing frame, preserves
each applicable accepted relation, and updates only affected subordinate
projections. A bounded local action conserves governing truth; it does not
rewrite it. A result that changes a governing relation re-enters at that
relation before acceptance (P4b; FOUNDATIONS §3 P4b, frame instance). A
subordinate frame opens only when a material distinction cannot be
resolved at the governing altitude; this rule does not require recursively
documenting irrelevant descendants (P2). The law is false if a change is
locally valid inside the selected frame but violates, duplicates or
silently reinterprets an invariant in any affected governing frame.

Discovered functionality is evidence about required behaviour, not yet an
architectural operation. A discovered verb, screen action, endpoint,
command, ticket phrase or use case is not promoted directly into a public
operation identity, peer carrier, module or implementation function; it is
first derived through the Ontology (P6, P2). The derivation order:

```text
constitutional functionality
  -> candidate Ontology
  -> logical completeness
  -> whole-family Prime contraction
  -> accepted Ontology basis
  -> Irreducible Architectural Carrier Set
  -> target design and domain, sequence and state projections
  -> public contract and adapter projections
  -> implementation and test projections
```

### Native constructability (UP-002)

A semantically coherent design is not acceptable when its selected
substrate cannot natively construct the required identities,
relationships, transitions, authority boundaries, effects, lifecycle,
composition, publication and retirement behaviour (P2, P5). A missing
substrate capability remains an explicit design gap or triggers lawful
re-entry (SPEC_METHOD §4); it is not hidden behind a reference bridge,
adapter, filesystem runner, test double or promised future feature (P6;
SPEC_METHOD §7 Bridge prohibition). This is a constructability obligation,
not a prescribed implementation; the consumer chooses the substrate and the
evidence mechanism (P0).

### Capability and foundation selection (UP-023)

Native constructability proves that the selected substrate can realise the
design; it does not prove that locally constructing another generic
mechanism is the best realisation. Before constructing a material generic
capability, common mechanic or algorithm, or selecting a material
dependency, the active design boundary performs a proportional
foundation-selection pass (P2, P6). Its governing law
is [FOUNDATIONS §4](../FOUNDATIONS.md#4-algebra) Shared machinery; this
section is its selection procedure.

The pass first states the required capability without Product, domain,
module, vendor, file or incumbent-implementation labels. It then
distinguishes each irreducible semantic or authority-bearing relation,
with its declared owner, role kind, subject, scope, basis and material
lifecycle and refusal invariants, from the generic mechanics and
foundation capabilities that may support those relations or realise an
explicitly assigned role. This factoring concerns declared relations and
roles, not source authorship (P6, P1).

The bounded candidate population draws applicable compositions from:
foundations already admitted in the current project; language, runtime,
platform or standard-library capabilities; accepted predecessor or
immutable-lineage realisations usable as evidence; maintained external
foundations where the Product permits a dependency; and a bounded local
implementation (P2).

Candidate discovery is bounded, reproducible and explicitly
non-exhaustive. For every candidate category the evidence record declares
the sources or collections searched, cutoff time and relevant version
basis, applicability and inclusion criteria, material exclusions,
predecessor or incumbent status, discovered candidates and residual
unknowns; a category not searched records `not_applicable` or a named gap
with its reason. Discovery closes only for that declared basis and cutoff.
A discovery gap that could materially alter the frontier prevents
selection; an immaterial residual records why it cannot change the current
decision. A later candidate that satisfies the applicability criteria and
could materially alter the lawful frontier invalidates the affected
selection evidence and re-enters this relation (P6, P5, P3); such a
candidate is newly acquired admissible evidence material to the selection,
an instance of the material input change of
[ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse).

This relation operates inside the Product boundary and, where applicable,
the migration strategy already admitted by their existing owners. It does
not choose bounded evolution versus fundamental re-adoption or override
the rebuttable strategy presumption of SPEC_METHOD §7 Constitutional
migration options. A working predecessor may therefore constrain the
admitted candidate set at migration altitude. Within that admitted
boundary and the generic-capability decision, discovery may begin with the
incumbent or an already installed dependency, but selection has no
source-order, familiarity, sunk-cost, local-code or dependency-count
preference. Candidate compositions are evaluated, not only individual
packages: a lawful result may use a foundation for generic mechanics and
may also use it to realise a semantic or authority-bearing role explicitly
assigned by accepted design. Neither case changes who owns the declared
relation (P6, P2).

For every material candidate admitted to the bounded population, one
evidence ledger or equivalent design record compares the dimensions that
can change the decision, including: functional and constructability fit;
semantic or operation-authority leakage; adapter, integration, migration,
deletion and future-code cost; licence, maintenance, security, upgrade and
supply-chain posture; package, runtime, startup, storage and operational
cost; determinism, concurrency, failure, recovery, reconstruction and
replay; proof and assurance burden; and exit, replacement and reversibility
cost (P2, P6).

A hard authority, Product-contract, safety, security, licensing or
native-constructability failure eliminates a candidate. Unknown evidence
remains unknown and cannot be converted into a favourable score. A
universal scalar is not required. Lawful candidates that remain materially
incomparable form an explicit undominated frontier (P6, P5).

One lawful candidate composition dominates another on the current basis
only when every material decision dimension is comparable or evidenced as
non-discriminating between them, it is no worse on every comparable
dimension, and it is strictly better on at least one. A material unknown
that could reverse the relation prevents dominance and remains a gap. A
dominated candidate cannot be selected unless new evidence or another
material dimension invalidates the dominance relation; therefore a local
rebuild of generic mechanics is inadmissible when an existing lawful
foundation composition dominates it. Unused feature breadth alone does not
establish dominance and may itself add lifecycle cost (P2, P6).

The existing trade-off owner may select an undominated lawful composition
only by applying priorities and risk tolerances declared for the exact
Product and basis and recording how they resolve the frontier. If those
priorities and tolerances do not resolve the frontier, the choice remains
an explicit design gap. The selected construction is not necessarily the
fewest dependencies, smallest immediate edit, lowest local line count or
richest feature set. A rejected material candidate records the decisive
evidence or falsifier. Unsupported preference is not design closure (P6).

Reuse does not automatically confer or transfer semantic, admission or
other operation authority (IDENTITY §6; an instance of
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
creates no authority). A selected foundation may realise
an explicitly assigned authority-bearing role when accepted design
preserves the declared relation's owner, role kind, subject, scope, basis
and material lifecycle and refusal invariants. Foundation capability,
provenance or source authorship cannot widen or remint that role.
Ownership belongs to the declared relation, not necessarily to locally
written code; an irreducible Product or domain relation retains its
declared owner whether local code, a reused foundation or their
composition realises it. Generic local code is lawful only when it wins
the same comparison; it is not the default (P6).

If construction exposes another material generic subproblem, that
subproblem recursively re-enters this selection relation before its
implementation is retained. This prior selection pass is distinct from
recurrence extraction (§10): recurrence review detects repeated
realisation after patterns exist, while this rule prevents avoidable
reproduction before construction (P2). Apply the pass proportionally. It
is mandatory for material algorithms, common mechanics, new dependencies
and locally rebuilt foundation capabilities. It does not require a package
survey or ledger for a trivial helper whose choice cannot materially affect
authority, Product behaviour, lifecycle cost or the accepted design network
(P2; ACTIVATION §6).

### Entity and lifecycle completeness

The Ontology enumerates the entities inside the active boundary, their
identities, relationships, cardinalities, invariants, lifecycle states and
authority owners (P3, P5). For
each entity, design evidence provides this logical-completeness matrix or
an equivalent closed representation:

| Entity | Identity | Authority owner | Declare/create | Read/project | Update/transition | Delete/retire |
|---|---|---|---|---|---|---|

The matrix applies to identity-bearing entities and independently governed
value families (P3, P2). A Subordinate Payload or value object inherits the
lifecycle and authority of its owning entity unless it passes the
Promotion Test (§6); it does not require a ceremonial peer lifecycle row.

The lifecycle columns are completeness questions, not a mandate for
mutable CRUD: create may be declaration, construction, admission or
materialisation; read should normally be a typed projection over
authoritative truth; update should normally be an admitted transition or
new version rather than in-place semantic mutation; delete should normally
be retirement, revocation, decommission or supersession where history or
identity has to remain true (P3). Every cell identifies a lawful function,
declares `not_applicable` with a reason, or names a `Gap:` or
`Unanswered:` item and owner. Silence is not logical-completeness evidence
(P5, P6).

This entity lifecycle is distinct from the operational module lifecycle of
ASSURANCE §16: the Ontology describes what states and transformations
exist for domain entities; ASSURANCE §16 confirms how the resulting
realisation is built, released, deployed, observed and retired (P1).

### Authority model

Authority is part of the Ontology, not metadata added to an operation
after its shape has been selected (P6). For every
Ontology function or lifecycle transition that crosses a semantic,
authority, admission, effect, persistence or public boundary, design
evidence provides this authority matrix or an equivalent closed
representation:

| Function or transition | Proposer | Evaluator | Verifier | Admitter | Executor | Projector | Retirement owner |
|---|---|---|---|---|---|---|---|

The model distinguishes actor identity from authority; available
capability from authority admitted for the current basis; proposal from
evaluation, verification, admission, execution, projection and retirement;
attribution from permission; and ownership of domain meaning from
ownership of runtime effects (P6; FOUNDATIONS §2 Authority kinds). One
owner may lawfully occupy more than one role only when the governing
authority explicitly says so; role coincidence is not inferred from
implementation convenience. Pure subordinate helpers inherit the authority
envelope of their owning Ontology function and do not require peer
authority rows unless they cross one of those boundaries.

What cannot create authority is stated once in
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
creates no authority. This paragraph applies its items on composition,
projection, labels, capability strings and payload shape to the Ontology's
functions and adds only these design instances (P6; IDENTITY §6).
Composition does not widen authority implicitly: a composed or
higher-order function has no more authority than the authority law
admitted for its inputs, constituent functions and current basis.
Delegation, elevation, transfer or retirement authority requires a named
typed transition and an owning admission boundary; these carry in the
design the explicit authority decision that FOUNDATIONS requires and do not
replace it. Projections cannot create authority, and downstream code
cannot reconstruct an authority witness from actor labels, capability
strings or payload shape.

### Transformation admission completeness (UP-016)

The authority matrix names who admits; it does not by itself establish the
relation that decides which candidate transformation becomes durable
entity truth. Two designs can complete the matrix plausibly and still leave
two materially different ways to admit the same transformation (P6, P4b).

For every consequential entity-transition domain, design evidence contains
the complete transformation-admission relation over entity identity,
predecessor basis, authority scope, candidate family, decision
cardinality, admission predicate, resulting durable fact and supersession
law, through the authority matrix or an equivalent closed representation
(P6, P4b):

| Entity transition domain | Predecessor basis | Candidate family | Admission relation | Durable result | Competing-path disposition |
|---|---|---|---|---|---|

For every material admission relation, accepted design declares, in one
compact relation or equivalent representation (P6, P4b, P3):

- each admission owner and supported admission boundary;
- the exact admission-valid basis identity, predecessor and currentness
  continuity through admission, and any equal or coherent composite
  multi-owner basis;
- the complete enclosing relation, participant identities and equality
  joins;
- refusal and effect boundaries;
- the complete semantic commit unit and its decomposability: every
  materially distinct post-validation commit or publication boundary
  capable of exposing a subset, or a design-declared dominance or
  equivalence proof that named representative observations cover the
  complete partial-failure surface;
- reconstruction and the supported direct, composite and nested forms; and
- competing-path disposition.

The declaration binds the admission and standing-test semantics of
ACTIVATION §4 (Complete enclosing-relation admission; Standing structural
qualification), which solely owns them. Qualification is instantiated per
owner and supported boundary. Unsupported composite or nested forms use
`not_applicable` only when accepted domain or design excludes the form and
the boundary has no weaker or competing admission path (P6, P4b). This
obligation is false if a field, owner or supported boundary is missing or
invented downstream; if basis continuity, partial-failure boundary
coverage or its dominance or equivalence proof, or reconstruction is left
to implementation inference; or if non-applicability is established only
by a parser, helper or manufactured refusal.

Singularity attaches to the complete decision relation, not to one actor,
callable or component. Several actors, stages or implementations are
lawful as constituents or disjoint instances of that relation. A relation
may lawfully require one actor, several signatures, a quorum, a human
step-up, delegated proxy authority or jurisdictional partitioning, provided
its cardinality and adjudication law are declared (P6).

Competing-path disposition does not imply deletion. An equivalent path may
be a lawful constituent, replica, replacement or deliberately independent
realisation, provided its relationship to the singular admission law is
explicit. A superseded responsibility remains subject to SPEC_METHOD §7
Core interface migration: retention requires a distinct supported purpose,
not merely a path label or an existing test (P6, P2). A projection may
produce a candidate transformation, but projection status does not confer
admission authority; any consequential result re-enters the governing
admission relation against its explicit predecessor basis, and a
reconstructed projection state is not self-authenticating admission
evidence (P6; projection is an item of
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
creates no authority).

This law is false if any of the following holds (P6, P4b): two materially
non-equivalent admission relations remain reachable for the same governed
transition domain on the same entity identity, authority scope and
predecessor basis (disjoint scopes or identities are not a
counterexample); a materially equivalent competing implementation remains
reachable without being identified as a constituent, replica, replacement
or deliberately independent realisation; or a projection-triggered
reaction uses its own reconstructive state as self-authenticating
admission evidence.

### Atomic functions and higher-order composition

The Ontology derives the smallest parameterised atomic function families
that make the entity lifecycles logically complete. Variation that changes
only an entity kind, projection kind, transition kind, policy or
subordinate payload should normally be a typed parameter or closed variant
of one function family, not another peer function (P4a, P3). The minimum
function-derivation evidence is:

| Discovered functionality | Entity | Atomic function or template | Higher-order composition | Effect class | Required authority | Disposition |
|---|---|---|---|---|---|---|

Every row is one of: derived through an admitted atomic function; derived
through a declared higher-order composition; deferred with an owner and
re-entry condition; excluded by current product authority; or unresolved
as a named gap (P5, P6).

Where the boundary has higher-order behaviour, the Ontology names the
governing composition and effect algebra. Typical categories include unit
or lift, sequential composition, parallel or applicative composition, fold
or evaluation, retry or recovery, recursion or fixed point, and
projection. The design states the applicable identity, closure,
associativity, cardinality, effect and authority-conservation laws rather
than hiding them in controller flow (P4a, P6; FOUNDATIONS §4 Composition).
This does not require monadic or category-theory vocabulary
(SPEC_METHOD §2 Realisation shape). A product under the graph-execution
profile may bind the requirement to GTL composition and ABG
interpretation; another product may use another explicit algebra.

Composition, effects and implementation may be discovered iteratively only
when `co_evolution_admissible(B)` holds. Otherwise only a disposable spike
may supply evidence across the affected unresolved, contradictory or
materially non-equivalent relation before its design is accepted. Every
retained result is reconciled into accepted design before promotion or
design-method closure. No private helper, loop, adapter or endpoint may
become an undeclared constructor (P6, P2).

### Prime semantic atoms and admitted domain

A Prime semantic atom is one irreducible design relation: an atomic
function family, identity, authority transition, lifecycle relation,
topology, effect, closure law or composition law that cannot be expressed
honestly by composing other accepted atoms while preserving the same
meaning (P3, P1).

Prime is decided at semantic-design altitude. A file, source function,
class, schema record, public operation, diagram, module or owner category
is not a Prime atom merely because it is small, typed, separately named or
independently testable. One atom may project into several realisation
units, and one realisation unit may implement several atoms, provided the
mapping is explicit and introduces no rival meaning or authority. An
atomic function is not proven Prime until the complete candidate family has
been contracted (whole-family Prime contraction, below; P1, P6).

Every accepted Prime atom declares the admitted domain over which its law
holds, and within that domain it governs every admitted instance. A later
use case composes or parameterises the atom; it does not fork, shadow,
specialise or reinterpret the atom locally. An out-of-domain case may
justify proposing another candidate atom for design admission. An
in-domain counterexample falsifies the shared atom and re-enters at that
atom's design boundary rather than authorising a feature-local replacement
(P3, P6). An atom without a declared admitted domain remains a candidate
atom; it cannot supply Prime acceptance or Prime-conformance to a
realisation projection.

### Whole-family Prime contraction

Prime review evaluates the complete candidate semantic-atom family and
every proposed realisation projection, not only functions, carriers or
each atom in isolation. The family includes every proposed identity,
authority transition, lifecycle relation, topology, function, composition
law, effect and closure law. A function-and-carrier-only pass does not
establish whole-family Prime (P3, P2). Before promotion, review asks:

- can several proposed operations be typed parameters of one atomic
  function?
- are several commands lifecycle transitions over one entity?
- are several reads projections over one source truth?
- are several implementations applications of one higher-order function?
- does the candidate introduce independent identity, authority, effect,
  lifecycle, reuse or public pattern-match semantics?
- has every candidate atom kind entered the same contraction?
- does every realisation unit map explicitly to its accepted atom or
  atoms?
- does any realisation projection introduce, duplicate or reinterpret
  meaning or authority?

A family of individually plausible functions is not Prime when one
parameterised template plus closed variants carries the same meaning and
authority. Recurrence is contracted during design when visible; the
post-implementation recurrence rule (§10) is not a substitute for this
prior pass (P2).

### Recursive Prime and root conservation (UP-003)

At a material semantic boundary, Prime contraction applies to each
candidate semantic atom and then to the complete family produced by those
contractions. A locally irreducible atom is not globally Prime when the
family duplicates identity, authority, function, lifecycle, topology,
effect or projection meaning. Local Prime-conformance of realisation units
does not prove the semantic family globally Prime (P3, P6).

Contraction preserves root authority and every retained semantic relation.
Reducing files, functions, operations or authoring surfaces cannot
compensate for introducing another authority source or truth path (P6,
P4b). Prime evidence states the complete candidate semantic-atom family;
each atom's stable identity, irreducible relation, admitted domain and
falsification condition; the whole-family contraction relation; retained
meaning and authority before and after contraction; accepted loss; and the
explicit total mapping from every proposed realisation projection to its
accepted atom or atoms (P4b, FOUNDATIONS §4 Conservation accounting). Work
inside an accepted boundary cites the existing Prime basis rather than
recreating it (P2).

### Ontology projection

The Ontology is one semantic truth (P1, P6).
These preserve it and do not become independent semantic authorities:
class or domain diagrams; sequence diagrams; state and lifecycle diagrams;
authority and effect matrices; the IACS; public APIs, operation registers,
SDK and CLI surfaces; schemas, codecs, manifests and generated catalogues;
target architecture and module design; implementation modules through
accepted target design; and test and proof inventories through
requirements and accepted design.

Each design projection identifies its Ontology source and the identity,
relationship, lifecycle, authority, function or effect law it preserves.
Any intentional omission or flattening declares accepted loss and a
failure condition (FOUNDATIONS §4 Reference versus body). Target design
may add structural HOW absent from the Ontology, but it may not originate
rival semantic meaning. Implementation and tests trace through that
accepted design rather than bypassing it (P1, P6).

If a public operation, sequence message, state transition, carrier or
effect cannot be traced through accepted design to the accepted Ontology,
it is ungrounded design and does not enter the active product line. An
implementation branch or test expectation traces to requirements plus
accepted design; it preserves, but need not be enumerated by, the
Ontology (P6; SPEC_METHOD §2 Trace closure and anti-drift).


Source: DESIGN_MODULE.md#7-ontology-and-three-view-design-gate sha256=50e70c797c93718e85192aaf2de39596f62f53030507ca8242c1af7e8f0ebcbe

## 7. Ontology and three-view design gate

Every new or materially changed semantic or typed module boundary carries
one accepted Ontology and one complete three-view Mermaid design asset
before the boundary is promoted or claims design-method closure (P6, P1). When
`co_evolution_admissible(B)` holds, design evidence, implementation and
tests may develop together before that gate; otherwise the affected
unresolved, contradictory or materially non-equivalent relation is
accepted before retained implementation establishes it. Unchanged
boundaries cite their accepted basis; local realisation work with no
material semantic-boundary delta does not recreate this gate (P2).

The asset contains all three views: a Mermaid `classDiagram` domain model;
a Mermaid `sequenceDiagram` execution model; and a Mermaid
`stateDiagram-v2` lifecycle model. A project may ratify another text-native
diagram format only when it preserves the same three distinct views and the
same cross-view checks. One broad flowchart does not substitute for the
three models. The three views may be sections of one existing design
surface and may share one acceptance decision; this rule does not require
three files, three tickets, three reviews or three approval ceremonies
(P2). The views are not decorative and are not peer truth surfaces: they
are fidelity-checked projections of the accepted Ontology, and together
the sign-off surface for domain identity, authority, behaviour, lifecycle
and axiom conformance (P1, P6).

### Ontology evidence

The design asset cites one accepted Ontology for the active boundary and
includes or references its (P6): entity and
relationship inventory; invariant and cardinality law; entity-lifecycle
completeness matrix; authority matrix; atomic-function and
higher-order-function derivation matrix; governing composition and effect
algebra where applicable; whole-family Prime contraction, including every
accepted atom's admitted domain and realisation-projection mapping; and
explicit deferred, excluded and unresolved functionality.

The Ontology may be a boundary-bounded slice of a wider accepted product
Ontology. The slice cites its parent and preserves parent identity,
relationship, lifecycle, authority and function law. Copying selected rows
into a new local model without that derivation creates another truth
surface (P6, P3).

### Invariant reconstruction sufficiency (UP-018)

The evidence above is not a documentation deliverable. It is the durable
reasoning state a bounded actor needs, because the actor selecting a local
action generally does not hold the reasoning that produced the governing
frames. Dialogue, commentary, prior-agent memory and implementation
folklore are not that state (P0, P4b). The general
reconstruction rule is [ACTIVATION §1 Intake](../ACTIVATION.md#intake); this
clause states what design evidence supplies to it.

Given an accepted material-frame basis, as determined by the material
semantic boundary definition (§5), and a proposed bounded action, the
selected method basis together with the accepted design is sufficient to
recover every governing relation in the action's causally closed affected
set, and to decide whether the action preserves, changes, duplicates or
violates each of those relations. The two inputs are distinct and neither
substitutes for the other: the selected method describes which relations
are required and how to reason about them; the accepted design supplies
the concrete invariant values. A design that restates method decision law
to satisfy this rule reproduces the local-method duplication this law
exists to remove (P1, P6).

| Decision | The action, against a governing relation | Core value |
|---|---|---|
| preserves | leaves the relation intact and operates inside it | `satisfied` |
| changes | alters the relation itself, and therefore re-enters at that relation before acceptance | `invalid_basis` |
| duplicates | establishes an equivalent path that is explicitly disposed as a constituent, replica, replacement or deliberately independent realisation | `satisfied` |
| violates | contradicts the relation, or establishes an equivalent path that is left undisposed | `falsified` |

The boundary between changes and violates is the locus of acceptance, not
the size of the delta: an otherwise lawful change accepted inside the
acting frame rather than at the relation it changes is a violation. The
boundary between duplicates and violates is disposition, not equivalence:
an equivalent path is lawful when disposed and a defect when not (P4b,
P6). Sufficiency is bound to a declared action and its affected set; it is
not a claim over an unbounded space of possible future changes, and the
performance of any particular reviewer is not evidence either way (P0).

The four decisions are a refinement of the core result algebra
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)). They answer what the
action does to one governing relation, and each maps to exactly one core
value for the predicate "the action is admissible in the acting frame on
the current governing basis"; the value travels with that predicate and
with the decision, whose meaning stays here (P5, P6). `preserves` and a
disposed `duplicates` leave the relation as accepted. For `changes`, the
relation itself must change at its own locus before the action can be
accepted, so the current governing basis cannot support accepting it in
the acting frame, as for the disposition `re_enter` of
[ACTIVATION §3](../ACTIVATION.md#disposition). For `violates`, the
contradiction or the undisposed equivalent path is the counterexample. An
evaluation that reaches none of the four decisions returns the core value
its cause selects, `indeterminate` where the admissible evidence cannot
decide, naming what would decide (FOUNDATIONS §4 Results); where the
cause is that the selected method basis and the accepted design do not
suffice, the case falsifies this law, as stated below. Purpose and material relation: a lawful change is
never read as a violation or as an action the acting frame may accept, and
a violation is never read as a re-entry (P4b, P6).

This obligation adds no artifact. It is satisfied through the Ontology
evidence, authority matrix, transformation-admission relation, frame
declaration, views and module mapping already required, and is a property
of that material rather than a separate package (P2). The law is false if,
for a declared bounded action, the accepted design does not expose a
governing relation in that action's causally closed affected set, or the
preserve, change, duplicate or violate decision cannot be reached from the
selected method basis and accepted design without conversation history,
commentary, prior-worker memory or implementation folklore. Where the
sufficiency of a boundary is tested, the test uses named cases with known
governing relations and expected decisions, evaluated with conversation
history, commentary, prior-worker memory and implementation folklore
withheld (P6; EVALUATION §3).

### Domain model

The `classDiagram` is the structural domain projection of the Ontology
(P1, P3). It shows, for the active boundary: domain
identities and cardinalities rather than helper-class decomposition;
entity ownership, invariants and lawful lifecycle relationships; atomic
function families and their entity inputs and outputs where they cross the
active boundary; higher-order composition relationships where they
determine boundary shape; IACS carriers and their Prime-atom projection
mappings; subordinate payloads; effect-edge-only payloads; downstream-only
projections; deferred families outside the active slice; authoritative
versus downstream role; public versus module-local visibility; and
composition, containment, association and real variant-family structure.

The standard stereotype vocabulary is `<<prime-conformant>>`,
`<<subordinate>>`, `<<effect-edge>>`, `<<deferred>>`, `<<authoritative>>`
and `<<downstream>>`. The standard visibility vocabulary is `+` public or
exported and `-` module-local or private. The standard relationship
expectations are composition for owned subordinate payloads, association
for downstream consumption, and inheritance only for real variant or
outcome families (P1).

### Sequence model

The `sequenceDiagram` is the behavioural projection of Ontology functions
and authority (P1, P6). It shows the supported
execution path from admitted input to result or truthful stop, and names
the owner and required authority of every decision, admission, execution,
projection and effect boundary. Where applicable it shows malformed input
or output, retry, recursion, fan-out and fan-in, nested workflow and human
escalation paths. Every participant exists in the domain model or is an
explicitly external actor. Every message binds to a declared carrier
transform, graph or computation constructor, interpreter action or
effect-handler call; a private loop, service method, plugin, shell or
script may not silently replace a declared workflow transition. Every
message also binds to an Ontology function and its admitted authority
role; actor identity or call reachability alone does not authorise a
message (P6).

### State model

The `stateDiagram-v2` is the lifecycle projection of Ontology entities
(P3, P5). It shows the complete admitted lifecycle for
the active boundary, including refusal, blocked, continuation, retry,
escalation and terminal states that the boundary can produce. Every
transition binds to an Ontology function and names its owning authority,
admission, compiler, interpreter, event, projection or external act.
Controller-local memory is not a lawful source of lifecycle truth when the
product declares replay, event, graph or carrier ownership (P6).

### Cross-view axiom evaluation

The design pack evaluates every applicable product, graph, language,
runtime, handler and module axiom with one of `pass`, `fail` or
`not_applicable` with a reason (P1, P6).
The minimum evaluation columns are:

| Axiom | Ontology evidence | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|---|

The cross-view evaluation proves that: every element in each view derives
from the accepted Ontology; every discovered functionality row has a
derived, deferred, excluded or gap disposition; every sequence participant
and lifecycle carrier exists in the domain model; every sequence message
has a declared semantic or effect boundary; every lifecycle transition is
derivable from admitted truth; every function and transition has an
explicit authority path and composition does not widen that authority
implicitly; every public operation is a projection of an Ontology function
rather than an independently authored semantic peer; raw probabilistic
output cannot transition directly to accepted or closed; handlers and
plugins own interiors only when the runtime owns admission, events,
continuation and closure; native types enforce locally decidable
relations; and admission or semantic compilation owns global references,
completeness and realisation gaps (P1, P6, P5).

For graph-native work, every batch, retry, recursion or nested workflow is
visible through the product's declared graph or compute algebra. A
relied-on `semantic_not_realized` constructor is a blocking gap; it may
not be replaced by imperative glue in a plugin, shell, service, script or
test harness (P6, P5).

Axiom verdicts. The three verdicts are a refinement of the core result
algebra ([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)). They answer
what the design pack concludes about one axiom for the active boundary,
and each maps to exactly one core value for the predicate "on the exact
Ontology and design basis, the boundary's design meets the axiom, or the
axiom does not apply to the boundary"; the value travels with that
predicate and with the verdict, whose meaning stays here (P5, P6). This
profile declares that predicate as a disjunction that includes
non-application, the case that
[ACTIVATION §1 Applicability](../ACTIVATION.md#applicability), Exclusion and
the core, permits and bounds. That paragraph decides what follows for the
verdicts: `not_applicable` rests on a false applicability premise, an
unresolved premise supports no `not_applicable`, and the `satisfied` of a
`not_applicable` verdict counts toward this disjunction only, never toward
the predicate that the design meets the axiom:

| Verdict | Ground | Core value |
|---|---|---|
| `pass` | the cited Ontology, view and enforcement evidence establishes that the design meets the axiom | `satisfied` |
| `not_applicable` | the axiom's applicability premise is false for the active boundary on basis-bound facts, and the reason names those facts and the authority whose scope declaration excludes the axiom ([ACTIVATION §1 Applicability](../ACTIVATION.md#applicability)) | `satisfied` |
| `fail` | the axiom applies, and the evidence names an element, message, transition, authority path or enforcement that violates it; that is the counterexample | `falsified` |

The verdict, recorded with its value, keeps the distinction between not
applying and meeting the axiom (FOUNDATIONS §4 Results, Recording). An evaluated axiom that reaches none of the three
verdicts records in the Verdict column the core value its cause selects,
with what would decide it: `indeterminate` where the admissible evidence
cannot decide the predicate, as where the applicability premise is
unresolved and the design does not meet the axiom; `out_of_frame` where
the evaluation needs a relation or evaluator capability that the activated
frame does not declare; `invalid_basis` where the Ontology or design basis
cannot support it. An applicable axiom that the pack did not evaluate has
no result (FOUNDATIONS §4 Results, Not performed). None of these is
`pass`. Purpose and material relation: a design gate that combines axiom verdicts
with other results reads them in the one core, so an excluded axiom is
never read as conforming or as failing, and an undecided or unevaluated
axiom is never read as a pass or a fail (P5, P6).

### Gate and retrospective work

For a new or semantically changed boundary, the Ontology and design
verdict are both `accepted` before the affected implementation, public
contract or semantic carrier is promoted or the work claims design-method
closure. Any failed applicable axiom, missing functionality disposition,
unresolved authority path or blocking realisation gap keeps the verdict
non-accepted (P6).

The Ontology verdict and the design verdict are each an acceptance
result: a decision that consumes the results of assessment, distinct from
them. The decision owner is the
design authority that accepts the Ontology (§5), and the verdict is its
disposition of the Ontology or of the design pack at the design gate,
under [ACTIVATION §3 Disposition](../ACTIVATION.md#disposition), which owns
the dispositions and their core values. `accepted` is the disposition
`accept`, which maps to `satisfied` for "the candidate is accepted at its
declared boundary", the candidate being the Ontology or the design pack
and the boundary the design gate. A verdict that is not `accepted` is one
of the other three dispositions, mapped there, or no disposition yet,
which is no acceptance result. The verdict consumes the pack's availability
and assessment results, among them the evaluation of decision
completeness, which is the design gate's acceptance criterion
([§5 Decision-complete symbolic design](../DESIGN_MODULE.md#decision-complete-symbolic-design)),
the axiom verdicts and the cross-view proofs, and stays separate from both
(FOUNDATIONS §4 Results, availability, assessment and acceptance): a matrix in which every applicable axiom is
`pass` is evidence for the design authority, never the verdict, and a
step that produced the pack establishes neither. An axiom whose result
is not `satisfied`, whether `fail` or a core value recorded directly, an
applicable axiom with no result, or an axiom with no result whose
applicability is not established false, keeps the verdict non-accepted
as a failed axiom does, because a combination with a non-satisfied
mandatory result or a gap is never `satisfied`
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results))
(P6, P5). Purpose and material relation: neither a passing matrix nor a produced design pack is
read as acceptance, and the design gate's acceptance combines with other
results in the one core (P6).

For an unchanged `realization_refactor`, the gate is proportional: cite
the accepted Ontology and design basis, identify the touched projection
set, and prove that entities, relationships, lifecycle, authority,
functions, effects and public semantics have no delta. That proof reuses
the existing verdict; it does not create a new Ontology or acceptance
ceremony (P2; ACTIVATION §7).

When `co_evolution_admissible(B)` holds, implementation may precede or
develop with design evidence and may be retained after reconciliation.
Until the design gate is accepted it is provisional evidence: it does not
author semantic truth, earn publication authority, or satisfy promotion or
closure. Otherwise only a disposable spike may cross the affected
unresolved, contradictory or materially non-equivalent relation before
design acceptance (P6, P2).

Existing implementation placed under retrospective review may continue to
inform the affected design. Co-evolution remains lawful only while
`co_evolution_admissible(B)` holds; newly discovered material ambiguity,
contradiction or a materially non-equivalent network makes
`decision_complete(B)` false and activates the design gate for that
decision. Promotion and design-method closure remain blocked until the
required Ontology, three-view asset and axiom evaluation are accepted. The
design evaluates the code against prior authority; it does not rewrite the
Ontology or diagrams merely to rationalise an unlawful implementation
shape (P6).

The asset stays boundary-bounded. It is a defect if it mixes an active
semantic boundary with unrelated bootstrap, test-harness, projection or
delivery shapes merely to look complete (P2). If the Ontology, any of the
three views, the cross-view evaluation or either accepted verdict is
absent, the boundary is not design-method complete. Work may continue as
provisional co-evolution only when `co_evolution_admissible(B)` holds, but
the affected boundary may not be promoted, published or closed (P6).

### Computational realisation projection (UP-019)

The three views project domain structure, execution and lifecycle. They
deliberately show domain identities, so they do not reveal that two
domain-distinct components rest on the same data structures and
algorithms. Repeated machinery is therefore invisible to a domain-only
reading, and each occurrence looks correctly owned and correctly named
within its own entity (P1).

Component role sets. Every material realisation component has an explicit
set of semantic and operational roles. Technology capability does not
confer authority (an instance of
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
creates no authority). A component's declared role set is design authority;
where a role carries authority, composition and use preserve the
applicable authority relation under IDENTITY §6, which is supporting law
here rather than the owner of the role model (P6). A component may
lawfully hold several roles. Three cases are distinguished: behaviour
already inside an abstract declared role is ordinary variation; a new
operational responsibility and a new semantic or authoritative role are
each design changes, and only those two require re-entry. Use of a
component outside its declared role set does not silently establish
identity, admission, lifecycle, ordering, closure or projection truth (P6,
P3).

The projection. At a material semantic boundary, the design projects the
domain design into its computational realisation: abstract data types,
identity and key structures, algorithms, algebraic laws, mutation and
effect boundaries, selected implementations, and domain-to-computational
mappings. The cross-view evaluation extends to prove that the domain views
and this projection describe one system (P1). For a material
producer-to-consumer path, the projection identifies fact establishment,
consuming operations, applicable basis and invalidators, effect
boundaries, retained alternatives and accumulated work, using the validity
and reuse relation of ACTIVATION §4 (Complete enclosing-relation
admission) and §7; method and assurance operations are included where
material. Component-local success cannot establish the complete-path
claim, and different names do not establish different computational
responsibilities (P4b, P6; ASSURANCE §13 Computational whole-path
evaluation).

Operational assumptions. Material algorithmic work declares the supported
input dimensions, workload and growth, and the operational assumptions
needed for the selected outcome; the separation of material startup, framework
processing, external computation, transport and assurance costs is
ACTIVATION §6. Bind
any acceptance limits and their owning authority before qualification;
limits and workloads are Product-owned, not universal method constants.
Challenge the assumptions on representative supported paths and material
growth. Observe work directly where elapsed time cannot locate it, without
repeating the operation merely to count it. Existing design and proof
surfaces carry these relations; no additional accounting system or fixed
algorithmic complexity is required (P2, P6).

The projection is subordinate. It reveals repeated implementation
structure; it cannot decide semantic identity, ownership or authority
(FOUNDATIONS §4 Shared machinery). The evaluation sequence (P1, P6):

```text
computational similarity
  -> commonisation candidate
  -> semantic and operational equivalence evaluation
  -> reuse, parameterised common relation, or justified separation
```

Two components may share a map or an append-only sequence while differing
in identity and key law, ownership, ordering, admissible mutation,
consistency and concurrency, retention, failure semantics, access policy,
lifecycle or authority over truth. A materially non-equivalent law among
those dimensions requires separation. Other differences justify separation
only when evaluation shows that parameterisation or adaptation would
weaken ownership, authority, lifecycle, failure or operational
constraints. The existence of a difference does not by itself discharge
Prime contraction or recurrence review (P3, P6).

Disposition is two-part. Each material algorithmic obligation in `M(B)`
carries a semantic disposition (existing accepted relation, extension, or
new candidate relation) and a realisation disposition (consume, implement
locally, optimise, adapt, or deliberately duplicate under stated
non-semantic constraints). Isolation, substrate, performance, security and
dependency ownership are each lawful grounds for an independent
implementation. The invariant is not that equivalent code is never
rebuilt; it is that a local realisation does not present an existing
accepted semantic or authoritative relation as newly owned local truth
(P6, P4b).

This law is false if any of the following holds (P6, P3): two domain-named
components implement materially equivalent abstract data types or
algorithms without a semantic disposition; a generic building block
becomes a new semantic authority; superficially similar operations are
commonised despite different identity, ordering, failure, ownership or
lifecycle law; or a local realisation presents an existing accepted
relation as newly owned local truth.


Source: ACTIVATION.md#disposition sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Disposition

The decision owner disposes an assessed candidate with one of four
semantic dispositions (§1, Roles and delegation; P6, P5). An assessor may recommend one; the
recommendation is evidence for the decision owner, never a disposition
([EVALUATION §4](../EVALUATION.md#4-review-results)). The disposition is the
acceptance result: it consumes the candidate's availability and assessment
results and stays separate from both (FOUNDATIONS §4 Results). Each maps
to the core for the predicate "the candidate is accepted at its declared
boundary":

| Disposition | Condition | Core value |
|---|---|---|
| `accept` | the candidate closes its declared cone and preserves every affected governing relation | satisfied |
| `local_repair` | implementation or proof is locally defective while the governing relation remains coherent | falsified |
| `re_enter` | the governing outcome, a requirement, an identity, a lifecycle, an authority, a public contract or the accepted design must change | invalid_basis |
| `reject` | the candidate violates a governing relation or leaves an undisposed competing truth path | falsified |

For `local_repair` the local defect, and for `reject` the violated relation
or the competing truth path, is the counterexample to accepting this
candidate; a repaired candidate is a new candidate with its own results.
For `re_enter` the governing basis the candidate was built and assessed on
must change, so that basis cannot support acceptance; the change re-enters
at its owning relation (§4). The core values place
acceptance in the one core, as FOUNDATIONS §4 Results requires, so that a
consumer combining results cannot take availability or assessment as
acceptance (P6).

Global correctness means conserving every global relation affected by the
bounded action; it does not require proving the whole product inside every
local action (P4b). Repeated rejection against one unchanged boundary
requires reassessment of the frame altitude, the causal cone, the common
components, the design-versus-code placement and the authority
sufficiency. The method sets no rejection-count threshold, mandatory
review-round count or review state machine; it prohibits repeating an
unchanged failed construction relation as if iteration alone could close
it (P2).


Source: SPEC_METHOD.md#change-classes sha256=c7b83b2b7e8c9a301d2e535fc3752c08f718d9fc679e32f8a91c15c285976e8e

### Change classes

The minimum lawful change classes, each with its re-entry point and the
layers its repricing flows through (P4b, P2):

| Class | Change | Re-enters at | Flows through |
|---|---|---|---|
| `goal_reprice` | current bounded work-wave focus changes | Goals | Intent, Product, Requirements, Design, Code and Evidence where that focus changes deeper constitutional truth |
| `intent_reprice` | directional or scope change | Intent | Product, Requirements, Design, Code, Evidence |
| `product_reprice` | current product realisation changes while directional intent stays stable | Product | Requirements, Design, Code, Evidence |
| `requirement_reprice` | constitutional truth changes while project direction stays stable | Requirements | Design, Code, Evidence |
| `design_reframe` | realisation structure changes while active intent and requirement truth stay stable | Design | Code, Evidence |
| `realization_refactor` | local code, configuration or attribute change with no intended constitutional or structural change | the realised surface only | nothing upstream; it must prove no upstream drift |

Smaller changes may re-enter below Goals only if they explicitly assert
that no upstream constitutional surface is changing. The absence of a
declared change class is process drift. A changed governing relation is
accepted only at its owner; accepting it inside the acting frame is a
violation whatever the size of the delta (ACTIVATION §1).
Triage records the change intent, the class, the re-entry point and when
triage occurred, wherever substantive work begins.
[TICKETS §4](../TICKETS.md#change-class) records the class on the carrier.

The change classes are declared states of a change that intake triage
records, not results, and map to no core value. An evaluation that reads
a declared class returns its own core value with its predicate under
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results). A close classification
of [TICKETS §3](../TICKETS.md#close-review) that names a layer, such as
`design_reframe`, is a result for its own predicate, mapped there, and
carries the class at which the work re-enters as its domain outcome.
Purpose and material relation: a declared class is never combined as an
evaluation result, so a change classed `realization_refactor` cannot stand
in for a `satisfied` result that no upstream drift occurred (P5, P1).


Source: FOUNDATIONS.md#results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545 rows=6/18 selected by the anchors this frame carries; the consumers paragraph of 18 items is omitted

### Results

Every performed evaluation returns one value of the core result algebra,
directly or as a refined value mapped into it (P5):

| Value | Meaning |
|---|---|
| `satisfied` | the declared predicate holds on the exact basis |
| `falsified` | a declared counterexample defeats it |
| `indeterminate` | the available admissible evidence cannot decide it |
| `out_of_frame` | the evaluation requires an undeclared material relation or capability |
| `invalid_basis` | the subject or basis cannot support the evaluation |

This core is the only one. Results of constraints, judgments, frame
evaluations, stops, work steps and effects are stated in it or in a
refinement mapped into it, so that results from any members combine under
one rule ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)). Purpose and
material relation: no combination can report success while a failure, an
undecided question, an unperformed evaluation or an uncertain effect
remains, and none of these can be mistaken for another (P5, P6).

Recording. A result records its core value together with the predicate
evaluated and the original domain outcome, which is the refined value
where a refinement produced it. A mapping into the core never owns domain
meaning: the member, profile or adopting Product that defines the refined
value keeps it, and a consumer that needs the domain distinction reads the
domain outcome, never the core value alone (P1, P6).

Standing. The standing of a result is what it establishes about its
predicate; it is distinct from the standing of a commitment (§1). Only
`satisfied` establishes the predicate. `falsified` establishes that the
predicate fails and names the counterexample. `indeterminate`,
`out_of_frame` and `invalid_basis` establish neither, and each names what
would decide: the evidence, the missing relation or capability with its
owner where the subject gives one, or the basis repair. By support for the
predicate, `satisfied` stands above each other value, and the other four
are not ordered among themselves.

No refinement or mapping raises a result's standing (P5, P6):

- a falsified or failed result never maps to a satisfied or successful one;
- a result that admissible evidence cannot decide never maps to
  `satisfied`;
- an evaluation that was not performed stays distinct from one whose
  evidence cannot decide: it has no
  [closed result](../ACTIVATION.md#7-closed-result-and-reuse), and it is never mapped
  to `indeterminate` or to any other core value;
- an effect whose completion is unknown never maps to no effect or to
  completed.

Not performed. An evaluation that is required or planned and was not
performed has no closed result; an actor cannot report an evaluation it
did not perform (P6). Nothing is coerced to success: a failed,
indeterminate, out-of-frame, out-of-scope or invalid-basis result follows
the declared result algebra and returns its own value under it, never
`satisfied`, and a missing result, being no result, enters every
conjunction over it as a gap: a planned assessment without a closed result
where an assessment was planned, and uncovered coverage where none was.
[REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results) states
RF-012 as a law over frames and
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
states AC-007 as a law over constraints; each uses this core and neither
defines it again.

Refinements. A member, profile or adopting Product that needs finer
outcomes defines a refinement. The refinement names the question it
answers and the predicate its mapping is for, and maps every refined value
to exactly one core value. No outcome exists outside the core; a
refinement adds no core value and keeps the pressure of `indeterminate`,
`out_of_frame` and `invalid_basis` explicit. Where a refined value would
map to one of two core values according to its cause, the cause is part of
the refined value and each resulting value maps once (P5, P1). A further
refinement, by a member, profile, project or adopting Product, may split a
refined value by cause. The parent-value rule governs every such split:
each child value names its parent value and its cause and keeps its
parent's core value; a child that needs a different core value needs a
different parent value, which only the owner of the parent declares; and
no child takes `satisfied` from a parent that is not `satisfied`. No
further refinement raises a result's standing (P5, P6, P1). Purpose and
material relation: a consumer that reads a parent value reads the same
core value from each of its children, so a split by cause adds a domain
distinction and never changes what the parent establishes (P5, P6). The
refinements for admission, activation and steps are
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition); each other
member, profile and adopting Product states its mapping where it defines
its values.

Availability, assessment and acceptance are separate results, each with its
own predicate: that a step produced a candidate; that the candidate meets
its declared criteria; and that the
[decision owner](../ACTIVATION.md#roles-and-delegation) accepts it at its
boundary. A step having produced a candidate never maps to the candidate's
fitness or acceptance, and acceptance is never inferred from a successful
step (P6; [ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition),
[EVALUATION §4](../EVALUATION.md#4-review-results) and
[§5](../EVALUATION.md#5-acceptance)).

Out of frame or indeterminate. The boundary between these values is drawn
on what the activated frame declares and on what the step did with it (P5,
finite capacity and graceful total handling; the material relation drawn
is the three-way out_of_frame boundary: capability not declared, capability
declared and exercised, capability declared and not exercised). Three cases; the first two name core values, and
the third names none:

- `out_of_frame` when the claim requires a material relation or an
  evaluator capability that the activated frame does not declare. The
  result names the missing relation or capability, its owner where the
  subject gives one, and the reconfiguration pressure it creates
  ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement)). A term the claim depends on and the frame
  leaves undefined is an undeclared material relation: its meaning can
  alter the result and it enters through no declared input (RF-003; P1). Whether the step exercised anything is
  irrelevant to this value; the ground is the missing declaration.
- `indeterminate` when the available admissible evidence cannot decide the
  claim. The result names the evidence that would decide, as
  its residual uncertainty. Where the
  claim also depends on an undeclared relation or capability,
  `out_of_frame` and `indeterminate` each have a lawful ground; the result
  names the value it returns and that ground, and this boundary excludes
  neither (P5).
- no value of its own when the step did not exercise a declared capability
  the evaluation requires. A result is returned wherever a sufficient
  evaluation or an applicable judgment exists without that capability,
  identifying its evidence, verdict and residual uncertainty like any
  closed result:
  a counterexample found by what was exercised, as when source inspection
  falsifies A in a claim of A and B, returns `falsified`, and common
  agreement cannot discard it. Where none
  exists because the capability was not exercised, the evaluation was not
  performed and has no result: the step's stop state carries it,
  `incomplete` under
  [construction availability](../ACTIVATION.md#construction-availability), and
  its work state ([ACTIVATION §5](../ACTIVATION.md#5-work-state-and-restart))
  carries the unexercised capability as a residual (P6). In either case
  the unexercised part, B above, has no result: in every conjunction over
  it, it is a planned assessment without a closed result, and the known
  failure A survives with it ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)).
  The evaluation's result and the step's stop state answer different
  questions, so the step's stop value never becomes the evaluation's
  result.

Foundation to law for results and their combination (family F3). The
table covers every rule of §4 and the result grounds of §2 Imports
between members, in the format of
[Foundation to law](../FOUNDATIONS.md#foundation-to-law), which states the standing of its
consequences. Purpose and material relation: a reader of §4 sees which
commitments each result rule rests on and which choices it adds, with their
owners (P6, P2). Instance premises, which the commitments do not supply:
(i) an evaluation declares its predicate, subject and basis; (ii) results
of several evaluations, steps or members are combined into one decision;
(iii) members, profiles and adopting Products need outcomes finer than the
core.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P5 (derived from P0 and P6) | a result claims no more than it establishes: only `satisfied` establishes the predicate, and no refinement or mapping raises a result's standing | [Results](../FOUNDATIONS.md#results), Standing, and the rule that nothing raises standing; for the choice, [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | the order among the four other values within one combination; owner: the member or profile that applies the conjunction, in its declared rule | 9 |
| P4b (derived from P0 and P2), P5 (derived from P0 and P6), P6 (independent); (ii) | a combination keeps failures, unperformed assessments and uncovered obligations apart and carries each through every join; agreement among contributors discards no counterexample | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results): its three inputs, Gaps, Survival, Predicates travel | none | 3, 9 |
| P3 (independent), P5 (derived from P0 and P6), P6 (independent); (i), (ii) | a result supports its predicate only on the basis it binds, so a component held only on another basis has, on the basis the composite requires, no performed evaluation and is a gap, while an evaluation performed on a basis that cannot support it decides its own predicate as `invalid_basis`; one component is never answered both ways | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Stale results | none | 3, 9 |
| P5 (derived from P0 and P6), P6 (independent); (ii) | a composite with a gap or a non-satisfied mandatory result is never `satisfied`; where every mandatory result is `satisfied`, its own value is `invalid_basis` if the declared basis relations disagree, and otherwise `indeterminate` while a gap remains; with every mandatory result `satisfied`, agreeing bases and no gap, a material counterexample to a mandatory constraint falsifies it whichever contributor found it, and without one its value is the one its declared rule gives over the mandatory results; a `falsified` result that is not mandatory stays in its record | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | which non-satisfied value is reported; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P6 (independent), P4a (independent); (ii) | a conjunction decides only under a declared rule and transfers no contributor's semantic authority | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), The declared rule | the mandatory results, the handling of conflict and indeterminacy, the basis relations that must agree, the decision authority that owns the conjunction, how results that are not mandatory count, and any veto or deferral; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P4a (independent), P4b (derived from P0 and P2) | composed steps exist only under typed composition; the composite carries both steps' step-produced facts, and its result for the outer predicate is the conjunction over the outer contract's obligations | [§4](../FOUNDATIONS.md#4-algebra) Composition; [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Composition of results; [RF-010](../REFERENCE_FRAME.md#rf-010-composition-on-demand), outside this member | whether a composition law is needed, under the conditions RF-010 states; owner: the governing evaluation | 3, 4 |

RF-012 in [REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results),
AC-007 in
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
and [EVALUATION §4](../EVALUATION.md#4-review-results) apply the first row's
algebra to frames, constraints and reviews and add no choice of their own
beyond any refinement they map under the fifth row;
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition) holds the
step's refinements of the fifth row and the stop state of the seventh.


Source: FOUNDATIONS.md#conjunction-of-results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545

### Conjunction of results

Conjunction combines results into one result for a composite predicate: a
claim made of component claims, a decision over several evaluations, or
the outer contract of composed steps. It is defined here once, over the
core. A member or profile that combines results applies this rule and
declares only the choices it leaves open (P4a, P4b, P5, P6). Purpose and
material relation: failure, undecidability, non-performance and uncertain
effects stay distinct after combination, so a composite can neither report
success nor hide which kind of gap it has while one of them remains in
what it requires.

A conjunction takes three inputs and keeps them apart:

1. the closed results returned, each a core value with its predicate and
   domain outcome;
2. the planned assessments that have no closed result applicable to the
   composite: evaluations the composite requires that were not performed,
   or whose result is absent, stale, bound to another subject or basis, or
   incapable of establishing its claim;
3. the required coverage that no planned assessment addresses: for a
   required obligation set R and the coverage C that the planned
   assessments admit, the uncovered coverage R minus C.

Gaps. A conjunction with any item in the second or third input is never
`satisfied`. Its record names which kind of gap it has, not performed,
uncovered or both, and each item. An uncovered obligation is never
reported as satisfied or as an omitted planned assessment; a planned
assessment without a closed result is never reported as uncovered or as an
`indeterminate` component.

Stale results. A held result is stale for a composite when the basis it
binds is not the basis the composite requires of that component, because
a later state has superseded or advanced it or because it binds another
subject or basis (§2, Basis). Two questions stay apart, so that one
composite has one reported value (P3, P5, P6):

- an evaluation performed on a subject or basis that is stale, advanced,
  ambiguous or mismatched against the one it must bind returns
  `invalid_basis` for its own predicate, or is reactivated on the current
  basis; [RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)
  states this law over frames, and a conjunction that receives that
  `invalid_basis` holds it as a returned result;
- a component whose only held result is stale has no closed result
  applicable to the composite: on the basis the composite requires, its
  evaluation was not performed. It is a planned assessment without a
  closed result, in the second input, and a gap. Its stale value is
  neither counted as a returned result nor relabelled `invalid_basis` for
  the composite, and it stays in the record with its own basis;
- the declared basis relations disagree (Reported value below) only among
  returned results, each bound to the basis the composite requires of it,
  whose bases the declared rule requires to agree or to join in a coherent
  composite basis, and which do not.

A stale `satisfied` never counts toward the composite. Purpose and
material relation: answering one stale component as a gap in one place and
as `invalid_basis` in another would give one composite two reported
values; keeping the evaluation's own value apart from the composite's gap
keeps the reported value unique and the stale result visible.

Survival. Every known failure (a `falsified` result with its
counterexample), every planned assessment without a closed result and
every uncovered obligation is carried with the composite and survives every
join: combining conjunctions takes the union of known failures and of
planned assessments without a closed result, and recomputes uncovered
coverage over the combined obligations. A known failure and a gap of
either kind survive every join. Common agreement among contributors
cannot discard a constraint or a material counterexample that only one
contributor found. A missing, wrong-subject, conflicted or indeterminate
mandatory result stays unresolved under the declared rule, and aggregate
satisfied status cannot replace it (P4b, P5).

Predicates travel. Each component keeps its predicate and domain outcome
through every join, so an uncertain effect stays distinct from a failure
and from an undecided claim, and a `satisfied` for one predicate never
counts toward another: a step's `satisfied` for "a candidate is available"
never counts toward the candidate's fitness or acceptance.

Reported value. The conjunction is `satisfied` only when every mandatory
result is `satisfied` with valid applicable evidence, the declared basis
relations agree, and the second and third inputs are empty. A composite
with a material counterexample to a mandatory constraint or an uncovered
required obligation cannot project success. Where a mandatory result is
not `satisfied`, the conjunction
reports a non-satisfied value chosen by its declared rule from those
returned; no universal order among the non-satisfied values exists, and
the member or profile that applies the conjunction declares its own in
its declared rule. Where every mandatory returned result is `satisfied`
and the declared basis relations disagree, the conjunction reports
`invalid_basis`, because no coherent composite basis supports the
composite predicate (§2, Basis); any gaps stay recorded by kind. Where
every mandatory returned result is `satisfied`, the declared basis
relations agree and a gap remains, the conjunction reports
`indeterminate`, because the results it holds cannot decide the composite
predicate; that value is the conjunction's own, and the gaps stay
recorded by kind. A `falsified` result that is not mandatory stays in the
conjunction's record with its predicate and is never discarded. Where
every mandatory result is `satisfied`, the declared basis relations agree
and no gap remains, a material counterexample to a mandatory constraint
falsifies the conjunction whichever contributor found it, and without one
the conjunction's value is the one its declared rule gives over the
mandatory results.

The declared rule. A conjunction declares which results are mandatory; how
conflict and indeterminacy are handled; which basis relations must agree,
results on different bases combining only under a declared coherent
composite basis (§2, Basis); which decision authority owns the
conjunction; how results that are not mandatory count; and whether any
result may veto or defer the decision.
Conjunction does not transfer the semantic authority of a contributing
evaluation (P6, P4a).

Composition of results. The result of composed steps for the outer
predicate is the conjunction of the steps' results, with the outer
contract's obligations as the required coverage. That each step returned
`satisfied` supports the outer predicate only where the refinement's
premises hold ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement),
Refinement).


Source: DESIGN_MODULE.md#foundation-to-law sha256=50e70c797c93718e85192aaf2de39596f62f53030507ca8242c1af7e8f0ebcbe rows=3/26 selected by the anchors this frame carries; the consumers paragraph of 26 items is omitted

### Foundation to law

This member is material family F17, software design. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. An actor enters the
family here, when it designs, implements or reviews a boundary that this
profile governs. The family imports these families under
[PROFILES §1](../PROFILES.md#1-the-boundary), and its rows cite them as
premises: F1, frames and context, for
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds); F2,
transitions, steps and configuration ([ACTIVATION §1](../ACTIVATION.md#1-the-step));
F3, results and their combination
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)); F4, work state,
resumption and reuse ([ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse));
F6, claims, evidence, assessment and acceptance
([EVALUATION §1](../EVALUATION.md#1-claims)); F8, identity
([IDENTITY §1](../IDENTITY.md#1-position)); F10, constitutional chain,
outcome and build-tenant binding ([SPEC_METHOD §2](../SPEC_METHOD.md#2-the-chain));
F12, binding a project to the method
([PRODUCT_DEFINITION §1](../PRODUCT_DEFINITION.md#1-overlay-and-layout-independence));
and F13, work carriers ([TICKETS §5](../TICKETS.md#5-from-carrier-to-execution)),
whose implementation-migration rule Recurrence extraction refines.
Standing of the commitments cited
([FOUNDATIONS §3](../FOUNDATIONS.md#3-commitments)): P0 recovered; P1, P2,
P3, P4a and P6 independent; P4b derived from P0 and P2, with P0's premise
that step-produced facts are not re-acquirable; P5 derived from P0 and P6,
with P0's open-world premise. Its instance premises hold where a project
adopts this profile for a boundary; they are adopted with it and do not
follow from the foundations (P1, P6):
It also imports F18, graph-native construction ([ODD §1](../ODD.md#1-position)), for the constructive-carrier law its first row defers to.

- I1: a Product has decided the outcomes and capabilities it builds, and
  adopts this profile for a named boundary of its realisation;
- I2: realisation code can hold one meaning in typed carriers and explicit
  transforms or in orchestration, helpers, open payloads and shared
  mutable state, and in more than one place;
- I3: bounded actors design, implement, test, review and later change the
  boundary, and an actor taking a later local action generally does not
  hold the reasoning that produced the design;
- I4: a mechanism the boundary needs can be built locally or taken from
  existing foundations, and similar computation recurs across boundaries
  and over time.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P1 (independent), P3 (independent), P6 (independent); F10 imported; I1 | the constitutional WHAT owns Product meaning (F10) and no realisation mints authority (P6), so a new or materially changed semantic boundary derives its semantic model from one accepted Ontology subordinate to that WHAT, and implementation cannot self-ratify missing Ontology authority; identities are declared and survive change (P3), so the Ontology carries stable identities and a basis that makes staleness decidable; a projection keeps meaning only through a declared contract (P1), so every design projection traces to the Ontology, an untraceable element is ungrounded, and a realisation derived from a reference line shows its derivation, not code comparison alone | [§5](../DESIGN_MODULE.md#5-ontology-first-design), its opening, [Ontology projection](../DESIGN_MODULE.md#ontology-projection); [§6 Reference-derived module design](../DESIGN_MODULE.md#reference-derived-module-design); [§7 Ontology evidence](../DESIGN_MODULE.md#ontology-evidence) | the ten terms of the Ontology, the definition of a material semantic boundary and the evidence items: this profile; who accepts the Ontology: the design authority ([§7 Gate and retrospective work](../DESIGN_MODULE.md#gate-and-retrospective-work)); proportionality: [ACTIVATION §6](../ACTIVATION.md#6-cost-and-proportionality); the invalidators, of which a reprice is an instance: [ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse) | 1, 2, 6 |
| P1 (independent), P5 (derived from P0 and P6), P6 (independent); F3 imported; I3 | a view is a representation, not the meaning (P1), so each of three distinct views is a fidelity-checked projection of the accepted Ontology, not a peer truth surface, and a later actor reads the behaviour from them, not from memory (I3); a gate cannot report success on an axiom it did not decide (P5) and needs evidence for each claim (P6), so before promotion or a design-method closure claim every applicable axiom is evaluated across the views, and each verdict maps to one core value of F3; an axiom that does not apply satisfies only the declared disjunction and never counts as met | [§7](../DESIGN_MODULE.md#7-ontology-and-three-view-design-gate); [Domain model](../DESIGN_MODULE.md#domain-model), [Sequence model](../DESIGN_MODULE.md#sequence-model), [State model](../DESIGN_MODULE.md#state-model); [Cross-view axiom evaluation](../DESIGN_MODULE.md#cross-view-axiom-evaluation) | the three Mermaid views, the stereotypes, the ten matrix columns, and the axiom verdicts with their disjunctive predicate: this profile; another text-native format: the project's ratification; applicability and exclusion: [ACTIVATION §1 Applicability](../ACTIVATION.md#applicability), Exclusion and the core | 6, 3, 9 |
| P6 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated); F3, F4, F6 imported | a produced design pack is a candidate until evaluated (P0), and acceptance is the owner's disposition, distinct from assessment (P6, F6), so the Ontology verdict and the design verdict are the design authority's dispositions at the design gate, and no assessment result or produced pack is the verdict; a combination with a non-satisfied mandatory result or a gap is never `satisfied` (F3), so without both verdicts `accepted` a new or semantically changed boundary is not promoted, published or closed, and implementation under co-evolution stays provisional evidence until the gate is accepted; an unchanged consumer reuses a closed result (F4), so an unchanged `realization_refactor` reuses its verdict on a proof of no delta | [Gate and retrospective work](../DESIGN_MODULE.md#gate-and-retrospective-work) | the design gate as the acceptance boundary of a semantic boundary: this profile; the decision owner: the design authority that accepts the Ontology (§5); the dispositions and their core values: [ACTIVATION §3](../ACTIVATION.md#disposition) | 9, 3 |

Consumers outside this member that apply these rows, each keeping its
owner: [ASSURANCE §14 to §16](../ASSURANCE.md#14-design-to-module-evidence-route)
apply the module-taxonomy row through the binding at the head;
[UX](../UX.md#1-position) refines the §4 and §10 rows for modules that
realise a UX surface ([PROFILES §4](../PROFILES.md#4-ux)); the recurrence row
refines the ticket rule of TICKETS §6;
[FOUNDATIONS §4](../FOUNDATIONS.md#4-algebra) Shared machinery is refined for
software design by the capability-selection row; and
[ACTIVATION §1 Intake](../ACTIVATION.md#intake) uses the design evidence of
the frame-conservation row when this profile governs the boundary.

The table accounts for this whole member: the head, §1 to §12 and the
binding the head declares. Its Pillar column follows FOUNDATIONS §3.
Purpose and material relation: a reader of this profile sees
which of its rules rest on the commitments and imported families and which
are choices this profile, the adopting Product or another owner makes, so
no profile choice is presented as following from the foundations (P6, P2).


Source: SPEC_METHOD.md#foundation-to-law-change-management-and-ambiguity sha256=c7b83b2b7e8c9a301d2e535fc3752c08f718d9fc679e32f8a91c15c285976e8e rows=1/10 selected by the anchors this frame carries; the consumers paragraph of 10 items is omitted

### Foundation to law: change management and ambiguity

This family (F11 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law))
decides how a change enters the chain, how its classification is computed
and reused, how ambiguity is governed and how a shared interface is
migrated. Its instance premises, which the commitments do not supply, are
named in the rows as follows: changing specification, the specification
changes while work proceeds; one front door, reports of every kind arrive
at one product; shared interfaces, a shared interface has several
producers and consumers; reserved decisions, a decision may be taken
under declared policy or be reserved to a human authority. Standing of
the commitments cited (FOUNDATIONS §3): P0 recovered; P1, P2, P3, P4a and
P6 independent; P4b derived from P0 and P2, with P0's premise that
step-produced facts are not re-acquirable; P5 derived from P0 and P6,
with P0's open-world premise.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 independent; P2 independent; instance: changing specification, one front door | By P6 a governing relation is accepted only by its owner, so a change re-enters at the layer that owns what it changes and is accepted there. By P2 the work follows what changes, not what the report is called, so the label a report arrives under does not select its process, and a change that re-enters below Goals asserts that nothing above it changes. | [§4](../SPEC_METHOD.md#4-change-management); [Universal intake triage](../SPEC_METHOD.md#universal-intake-triage), the six determinations; [Change classes](../SPEC_METHOD.md#change-classes); [Procedures](../SPEC_METHOD.md#procedures) | the six change classes with their names, re-entry points and flows, and the four procedures: domain choices of this member; where the class is recorded: [TICKETS §4](../TICKETS.md#change-class) | 1, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §4, §5 and §7.

