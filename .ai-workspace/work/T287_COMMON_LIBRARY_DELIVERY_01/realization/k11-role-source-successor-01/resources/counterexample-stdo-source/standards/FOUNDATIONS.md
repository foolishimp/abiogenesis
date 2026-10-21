# FOUNDATIONS

Tier 1. Owns the vocabulary of standing (§1); the ontology, with the frame,
authority, lineage and work-boundary objects, the three accounts of a
construction, and the rule for imports between members (§2); the commitments P0 to P6 with their standing, the
foundation-to-law format with the standing of its consequences, and the
index of material families (§3); the algebra of composition and
conservation, the core result algebra, the conjunction of results and the
demonstration a categorical claim requires (§4); and the hypotheses (§5).
Other members import these definitions
([Imports between members](#imports-between-members)) or refine them. A
refinement names its owner here and never redefines it; a refinement of
results maps each of its values into the core ([Results](#results)).

## 1. Vocabulary of standing

The standing of a foundational claim is what grounds it relative to the
other foundational claims: whether the method adopts it as a premise,
taking it without derivation, derives it from them or holds it for test
(P6). A foundational claim is a commitment (P0 to P6, §3) or a hypothesis
(§4 Formal fragment, §5). Each has exactly one of four standings:

- recovered: an adopted premise that states as one commitment what
  several rules of the method state in parts; those rules are named as its
  sources, not as its proof;
- independent: an adopted premise argued by non-entailment, that is, by a
  case in which the other commitments hold and this one fails;
- derived: a consequence of other commitments, with the premises it
  follows from named;
- hypothesis: a claim that no clause and no argument of this method
  establishes; it is not law and is carried for falsification (§5).

The recovered and independent commitments are the method's adopted
premises, and the derived ones are consequences of them. A premise is
never presented as derived, and a hypothesis never as law (P6). This
standing is distinct from the standing of a result, which is what the
result establishes about its predicate (§4 Results), and from the
disposition a successor gives a predecessor claim
([RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015))
(P1, P6). Every clause names the principle (P0 to P6, §3) that requires it.

Four uses of "join" in this corpus are distinct, and each is named where
it is used: a categorical join is a map between categories (§4 Formal
fragment); a composition boundary is the join between successive steps
([ACTIVATION §1 Composition boundaries](ACTIVATION.md#construction-relation));
the join of results is the combination of closed results under one
decision rule (§4 Conjunction of results); and a relation join is the
equality join of participants in an enclosing relation
([ACTIVATION §4](ACTIVATION.md#complete-enclosing-relation-admission)). An
unqualified "join" in a result context means the join of results (P1).

## 2. Ontology

| Term | Definition | Requires |
|---|---|---|
| Subject | the thing a claim, representation or transformation is about; exact, with inventory and bytes or semantic addresses | P3 |
| Representation | bytes, text, a model or a program standing for a subject; equal representations do not establish equal meaning | P1 |
| Interpretation | a declared contract from representation to meaning within a context; says which distinctions a consumer may rely on and which are residual | P1 |
| Context | the declared scope under which an interpretation holds: subject, definitions, basis, admissible observations | P1 |
| Outcome U | a selected, owner-defined, directly verifiable state with an acceptance interval; adequacy of a transformation is judged against it | P2 |
| Object O | a subject with scoped identity (authority, kind, value), a boundary, current state and declared material relations; identity survives admissible state and encoding change | P3 |
| Actor | whoever performs a step within a declared capability envelope (context, attention, time, capability); a role is a relation an actor occupies, not a kind of actor, and which roles exist is set by a configuration ([ACTIVATION §1 Configuration](ACTIVATION.md#configuration)), not by this definition | P0, P6 |
| Step | one bounded unit of work: intake, selected context, grant, execution, output | P0 |
| Step-produced fact | a judgment, residual, observation or authority decision produced by a step that cannot be re-acquired from declared sources; an observation reproducible from declared sources is re-acquirable and is not one | P0, P4b |
| Claim | an assertion with subject, property, basis, witness relation and falsifier | P6 |
| Evidence | the exact observations or artifacts admitted to evaluate a claim on a basis; each carries provenance, subject identity, basis and scope; evidence becomes neither semantic truth nor decision authority by being available inside a frame ([What creates no authority](#authority-kinds)) | P6 |
| Judgment | a recorded evaluation over an unchanged subject, with evaluator, decision, evidence, scope and revising observation | P6 |
| Authority | an identity-bearing permission to operate or to dispose acceptance within a scope; its kinds, and what creates none, are defined under Authority kinds below | P6 |
| Residual | a material uncertainty, omission, loss or unproven relation that remains until an authorised disposition | P4b |
| Basis | the exact state a step, claim, result or evaluation binds: every version, identity, time, topology, authority, configuration or evidence coordinate whose change can alter it; immutable, or moving with a declared way of detecting advancement and a declared condition for reevaluation; mixed bases need an explicit composite relation | P6, P3 |
| Material | of a relation: its lawful change can change an evaluation's result, invalidate its basis, change the admissible evidence, change who may perform a material operation, or change who may decide the evaluation or a material operation; of an uncertainty or closure: likewise; materiality is evaluation-relative, so a relation material in one frame may be irrelevant in another; the relation family of ACTIVATION §2 is the material relations of a step | P2, P6 |

### Frame objects

The reference frame and the objects it binds are first-class in this
corpus. Each is defined here once; [REFERENCE_FRAME](REFERENCE_FRAME.md)
states the laws over them and [ACTIVATION](ACTIVATION.md) the step that
activates one.

| Term | Definition | Requires |
|---|---|---|
| Evaluation | a declared question whose admissible result family, evidence basis, decision authority and, where it performs a material action, operation authority are known; it may ask for a judgment, prediction, construction, comparison, proof, refusal, classification or action recommendation | P6, P2 |
| Evaluation family | evaluations that need the same material-relation manifold, authority basis and result algebra; similar wording does not prove that two evaluations share a family | P1, P2 |
| Workspace | the bounded body of material reasoned over or acted upon, which may include constitutional sources, domain assets, designs, implementations, tools, runtime state, evidence, historical records, external dependencies and human decisions; broader than a repository, which is one possible carrier | P3 |
| Material-relation manifold | the finite, jointly interpretable set of variables, entities, identities, states, relations, invariants, authorities, observations and exclusions an evaluation family needs; a bounded relation space whose coordinate charts may overlap; no geometric mathematics or runtime abstraction is implied | P0, P2 |
| Coordinate | the complete local position from which a value, event, decision, observation or action is interpreted: the basis, identity, lineage, input, evidence and authority information the evaluation requires; equal names, values, shapes, locations or apparent topology positions do not establish coordinate equality, which follows a declared relation | P1, P3 |
| Topology | the relation structure among the material entities, capabilities, authorities, lifecycle state spaces, adjacencies and seams visible to a frame at one basis; a frame need not hold the workspace's complete topology; a state-value change preserves the frame topology only when it preserves every such entity, relation, lifecycle, authority, capability, adjacency and seam, and a transition that changes any of them is a topology mutation that may invalidate the frame's coordinates | P3 |
| Capability envelope | the competence, context capacity, tools, access, applicable evaluation- or assurance-independence conditions and configuration required to activate a frame and perform its evaluations; the same frame may be usable by one actor and unusable by another; actor capability may justify a different frame size or activation sequence and can neither waive an invariant nor widen authority | P0, P6 |
| Reference frame | a finite specification of the attention, coordinates, authority, evidence and result relations required to perform one declared evaluation family over a stated basis; its components are the frame tuple below | P0 |
| Activated frame | one frame declaration bound to an exact evaluation, workspace subject, basis, actor and evidence-acquisition boundary; a reusable declaration is not evidence that a particular activation was correct | P3, P6 |
| Frame set | the human-declared family of frames available for a governed outcome or workspace; it may intentionally hold overlaps, alternatives, specialist frames, broad exploratory frames and separately activated assurance frames; it is not required to be a partition, tree, stack or exhaustive ontology | P6 |
| Active frame configuration | the set of frame activations and declared result relations used for one evaluation or decision; one frame, or several disjoint, overlapping or composed frames; separately activated evaluations may be disjoint or overlapping | P4a |
| Lens | a reusable family of questions applied across a frame configuration; authority, capability and reuse, temporal behaviour, transport and proof are lenses when named abstractly; a lens becomes a frame only when instantiated with a bounded evaluation, basis, material manifold, evidence, authorities, result algebra and capability envelope | P2 |
| Role, persona, abstraction, component | a role allocates responsibility or authority, and the authority comes only from an admitted grant: naming a role or a frame grants none (Authority kinds below, What creates no authority); a persona alters an actor's approach or salience; an abstraction hides or contracts detail; a component is a structural part of a subject; each may help construct or activate a frame and none is a reference frame by identity alone; one component may appear in several frames and one frame may cross several components | P3, P6 |

### Authority kinds

Authority takes these kinds (P6): frame-set authority, the human authority
that declares or accepts a project frame set; semantic authority, the
owner of meaning for a material relation; evaluation authority, the role
permitted to perform an evaluation; operation authority, the owner-issued
grant to construct, transform, admit, publish or mutate a material subject
where an evaluation performs such an operation; decision authority, the
role permitted to accept, reject or otherwise dispose a result; and actor
identity, the human, agent, tool or process performing the work, which is
an identity and not an authority. These may coincide in a lawful case and
never collapse by default. A read-only evaluation declares no operation
authority; an effectful evaluation inherits the exact operation grant from
its existing owner, and the frame does not create that grant (P6, P3).

What creates no authority. Authority of any kind exists only by an
admitted grant or an explicit authority decision of its owner, with an
identifiable basis. None of the following mints, widens, transfers or
reconstructs semantic, evaluation, operation or decision authority (P6,
P3):

- actor identity, an actor's capability, its tools or its access;
- a name, label, display label, status label, role name, capability
  string, locator, file name or path;
- declaring, naming, selecting, activating or executing a frame, or
  occupying a role;
- implementation reachability, a reachable code path or an available
  operation;
- the shape of evidence or of a payload, or the availability of evidence
  inside a frame;
- a passing check, a successful step, a completed review or a count of
  any of them;
- copying, interpreting, encoding, evaluating, transporting, projecting,
  compressing, importing or acquiring material;
- drafting, admitting or retaining a work contract, beyond what its owner
  has admitted;
- composition, delegation, adapters, wrappers and registries, which may
  restrict admitted authority or carry it faithfully, and never widen its
  scope, add a role, increase its cardinality or change its kind.

Elevation, transfer, split, merge, proxy grant, revocation and retirement
each need an explicit authority decision with an identifiable basis. A
member that names an instance of this list for its own domain cites this
paragraph and adds only the instance.

Proxy limit. Human authority may act directly, or through an explicitly
admitted bounded proxy where the governing identity and authority law
permits it; proxy identity and human-authority identity stay distinct
(P6, P3). A proxy acts only inside its existing grant. It cannot change
the governing outcome's meaning, the requirements, the governing authority
or the accepted design; such a change re-enters at its owning relation.
Proxy authority does not make a constructor's self-review independent,
confers no unrelated runtime or domain authority, and does not replace
direct human acceptance where the governing product or release law
requires it. The contents of a proxy grant are
[IDENTITY §6](IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s,
and the decisions a proxy may take inside a step are
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)'s.

Purpose and material relation of the list and the proxy limit: each
member that names what cannot create authority decides the same question,
so one list keeps the answer the same in every member, and a capability,
a label or a passing check can never be read as a permission (P6).

### Disjointness and independence

Three relations stay distinct (P6, P1). Frame disjointness is structural:
two frames share no material variable, coordinate, evidence or result
dependency for the declared evaluations. Evaluation independence is
procedural: separately activated evaluations neither consume nor influence
one another's unclosed working results, although they may inspect the same
subject, overlap in their manifolds and later supply closed results to one
conjunction. Assurance independence is claim-relative: the governing
assurance law states the non-authorship, evidence-acquisition,
reference-exposure, actor and configuration separation a verdict needs to
count as independent assurance (EVALUATION §3). Disjoint frames need not
be independently evaluated; independently activated evaluations need not
be disjoint; and the unqualified word "independent" establishes none of
the three.

### The frame tuple

A reference frame F is the tuple ⟨Q, B, M, C, I, A, E, X, R, J, K, D⟩
(P0): Q the evaluation family; B the workspace and topology basis; M the
material-relation manifold; C the coordinate and equality law; I the
applicable invariant set; A the authority relation; E the admissible
evidence and provenance law; X the exclusion and prohibited-assumption set;
R the closed result algebra (§4 [Results](#results), or a refinement mapped
into it); J the invalidation and rechart
condition; K the actor capability envelope; and D the optional set of
declared dependencies, overlaps, inputs and outputs involving other frames.
The tuple specifies the relation; it is not a required schema or runtime
carrier (P2). Operationally a frame is an evaluation contract that defines
the finite attention scope one evaluation family requires. A prompt, a
context packet, a symbolic program or any other representation is a
projection of an activated frame, not the frame (P1). A frame is bound
when every material coordinate above resolves to an exact source, subject,
basis, authority, evidence route, actor envelope, result relation and
invalidation condition; the binding may be expressed entirely in
source-linked prose, and representation cannot create, widen or replace it
(P3, P6).

### Product lineage objects

Software is recursive and compositional: a released product may build the
next released version of itself, a dependent product, or downstream project
artifacts. Most taxonomy drift in recursive systems comes from collapsing
the roles below into one overloaded word such as "product". Each role is an
object with its own identity (P3). This member owns the bounded context
`urn:stdo:bounded-context:recursive-product-taxonomy` and the concept
identities below under the selected complete basis.

| Term | Definition | Requires |
|---|---|---|
| Substrate (`urn:stdo:concept:recursive-product-taxonomy:substrate`) | a lower product or runtime used to build other products | P3 |
| Development product (`urn:stdo:concept:recursive-product-taxonomy:development-product`) | the role of one exact install of a released product while that install acts as builder substrate for a source project; the role creates no new product identity and transfers no meaning or authority from the builder to the product being authored | P3, P6 |
| Source project (`urn:stdo:concept:recursive-product-taxonomy:source-project`) | the mutable workspace building the next release cut | P3 |
| Release cut (`urn:stdo:concept:recursive-product-taxonomy:release-cut`) | one immutable annotated release-candidate boundary over a published feature set | P3 |
| Product (`urn:stdo:concept:recursive-product-taxonomy:product`) | the released immutable thing resulting when that release cut is accepted | P3 |
| Install (`urn:stdo:concept:recursive-product-taxonomy:install`) | a stamped workspace instance of that released product | P3 |
| Artifact (`urn:stdo:concept:recursive-product-taxonomy:artifact`) | any published output built by a source project or by a configured installed product | P3 |
| Product definition (`urn:stdo:concept:recursive-product-taxonomy:product-definition`) | the present-tense source-project authority surface, conventionally carried by `PRODUCT.md`; it defines the current product WHAT for decomposition and is not the released product artifact | P3, P2 |

The governing rules: a mutable source workspace is not called a product;
when a released product acts as builder substrate, the exact install is
bound as a development product without confusing it with the product being
authored; an immutable release cut or installed product is not confused
with the mutable source project building the next cut; the product
definition is the surface of a source project, not the released product
artifact; products may depend on other products; installed products may
build the next version of themselves or other products. The compiler
analogy is the intended model: bootstrap source, release P0, install P0,
use P0 to build the source for P1, release P1. The taxonomy is load-bearing:
blurred, dependency and self-hosting errors compound quickly and are
expensive to unwind. SPEC_METHOD §6 applies these objects to lineage and
release.

Release objects. A release cut has three neighbours that release keeps
distinct from it and from each other (P3, P6).
A candidate source is the mutable source-project state constructing a
possible successor; it is non-operative for released consumers. A release
subject is the exact declared product member set or artifact that one
release cut binds, described by that cut's release-scoped claims; a
carrier that holds it does not thereby make co-located material a
member. A version-line selector is a mutable
alias naming the highest-ordinal published release cut on one version
line of one project; it is convenient discovery, not immutable identity,
and not sufficient as an exact basis ([RELEASE §1](RELEASE.md#1-context-and-position)
states which).
Equal version text does not collapse these objects. A selector or a
mutable carrier may move; a release cut never moves. RELEASE §2 realises
them, with the carriers that hold them, as refs of one release source.

### Work boundary

The method governs the boundary around a probabilistic, agentic or
delegated work unit; it does not absorb the worker's internal solution
strategy into the framework (P0, P6).
The declared boundary of such a unit is an object with six parts, which the
live specification and design should declare: the input and output contract; the
required context; the capability or role expectation; the admissible
evidence and evaluator regime; the provenance obligation; and the lawful
stop, hold, gap, continuation or completion states. The worker, tool, agent
or domain implementation owns the internal HOW inside that boundary unless
the product explicitly promotes part of that HOW into reusable declared
structure. The step of ACTIVATION §1 is this unit with its intake, context
and result algebra made exact.

### Accounts of a construction

A construction is the realisation of a selected outer contract through
steps, as P0 states it (§3). Three accounts of a construction stay
distinct (P1, P0):

- the algorithmic description: the steps;
- the informational interpretation: what the data means, given under an
  Interpretation (the ontology table above);
- the computational realisation: how people, machines or combinations of
  them carry it out in a declared execution environment; for a build
  tenant that environment is the one
  [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding) defines.

The distinction is kept for any construction and is independent of the
tiers of this corpus: a construction may need all three accounts, and no
account is a tier (P1). This section owns the distinction as an added
choice in the sense of §3 Foundation to law, not a commitment; it has none
of the standings of §1. Purpose and material relation: the steps, the
meaning of the data and the means of execution can each change while the others
hold, so a claim about one account is never taken for a claim about
another (P1, P6).

### Imports between members

A member that uses a concept another member defines imports it and does
not define it again (P1, P3). An import is
reference-only. Source and target meanings are identical owner-qualified
references, not new local definitions. Direction is from the named source
to the importing context; loss is none and no translation or ownership
transfer is asserted. An import provides no semantic, evaluation,
operation or decision authority (P6; Authority kinds, What creates no
authority). A use that changes, narrows or loses
the source meaning is not an import and is never declared as one.

An import declaration states, for each imported concept (P1, P3, P6):

- what is imported: the concept, under the name its owner gives it;
- its owner: the owning section of the member that defines it, which is a
  place in the text, not a semantic authority (Authority kinds above);
- the source context: the bounded context the owning member declares, or
  that member itself where it declares none;
- the target context and the member that owns it;
- the direction and the loss, which one sentence may state for all the
  concepts of one declaration.

An import takes one of two forms. A declaration states these contents
for each imported concept in one place; between members of this corpus,
it is the owner-authorised relation described here (P6). A reference at the
point of use that names the owning section is also an import: it states what is
imported and its owner; its source context is the one the list above
names, its target is the using member's context, and its direction, loss
and lack of authority are those stated above. A concept another member
defines enters a bounded context only by one of these forms, never by
proximity or equal spelling (P1, P3).

An activation binds each member's distinct coordinates in its selected
complete governing basis; equal cut selection does not mean equal member
coordinates. Adoption is a target's taking an imported concept into use
under the conditions its source states, which are its adoption premises.
Lifecycle and adoption remain source-owned. A changed member,
selected basis, source declaration or adoption premise requires fresh
applicability before use. An activation lacking the source meaning,
adoption or authority binding reports that unresolved relation before
dependent reliance rather than interpreting it from equal spelling (P3,
P5). For an evaluation that depends on the imported concept, a missing
source meaning, adoption or authority binding is an undeclared material
relation, the ground of `out_of_frame` ([Results](#results), Out of frame
or indeterminate); a changed member or basis whose applicability is not
yet re-established is the ground of `invalid_basis` (§4 Results).

Purpose and material relation of the declaration's contents, its two
forms, a member as source context and the two grounds above: a concept
used outside its owning section keeps one meaning and one owner, so two
members cannot answer one question two ways, and using a concept grants
no authority over it (P1, P6).

## 3. Commitments

Each commitment has exactly one standing, in the terms §1 defines; the
table states it, with a distinction the commitment retains. The adopted
premises, which §1 identifies as the recovered and independent
commitments, are commitments adopted for the domain this method governs,
not theorems derived from finite capacity alone, that is, from the bound
on an actor's envelope (P0). Particular method rules need these premises
plus their stated domain and policy choices, each with its owner
([Foundation to law](#foundation-to-law)). An argument from the premises
preserves that distinction; it does not create authority (P6). Purpose
and material relation of this paragraph and the standing column: each
commitment shows what grounds it, so no premise is presented as derived
and no consequence is taken for a premise (P6).

| Commitment | Standing | Distinction retained |
|---|---|---|
| P0 Bounded construction | recovered | the actor's internal path within a step is its own |
| P1 Interpretation | independent | structural success never establishes fidelity |
| P2 Purpose | independent | an obligation with no route to the outcome is unjustified |
| P3 Identity | independent | current state, historical observation and representation identity stay separate |
| P4a Typed composition | independent | composition retains both identities, intermediate results, judgments, evidence, authority, provenance and stop states |
| P4b Conservation of step-produced facts | derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable | sources a later step can re-acquire are governed by sufficiency, not conservation |
| P5 Totality | derived from P0 and P6, with P0's open-world premise | a step cannot report success on a condition outside its context |
| P6 Justification and authority | independent | neither evidence nor authority is minted by the other |

P0 Bounded construction. A finite actor realises a selected outer contract
through steps. Each step's selected context fits the actor's envelope.
Sources, named as sources and not as proof (§1): finite attention within a
declared envelope ([RF-002](REFERENCE_FRAME.md#rf-002-finite-attention)),
material sufficiency ([RF-003](REFERENCE_FRAME.md#rf-003-material-sufficiency)),
material closure ([AC-010](AXIOMATIC_CALCULUS.md#ac-010-material-closure)),
the [work boundary](#work-boundary), and the refinement of one outer
contract into inner steps
([ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement), Refinement).
Premises: a selected outcome (P2); the actor of one step need not be the
actor of the next and may re-acquire declared sources but not private
memory; step-produced facts are not re-acquirable; the world is open; a
step's output is a candidate until evaluated.

P0's boundary commitment (the work boundary of §2): deterministic checks
and validation are evidence surfaces; they may optimise or prove a
domain-local path where the domain can make part of the work precise, and
they do not authorise the method, a runtime or a framework to absorb domain
solution strategy as constitutional law. Any unconstrained part of a
probabilistic worker's reasoning remains hidden worker-internal activity
and is forced back through the declared contracts, evidence, provenance and
control truth of the boundary. A framework layer that prescribes domain
solution strategy beyond the declared work contract and control truth has
crossed its authority boundary (P6). A profile may bind the unit to its own
traversal unit, in which that traversal is the admissible external space;
PROFILES §2 keeps that binding.

P1 Interpretation. Subject, representation and interpretation are distinct;
meaning holds within a declared context through a declared contract.
Non-entailment: let two steps fit their envelopes under one selected
outcome, keep declared identities, compose because the first's declared
result type, a length, meets the second's declared domain, record their
step-produced facts, return closed results and keep evidence apart from
authority, while the second reads the value under a contract no one
declares, in metres where the first wrote feet; P0 and P2 to P6 hold, yet
one representation has two meanings and no declared contract, which P1
forbids. "Algorithmic" means
explicit and structurally checkable; a semantic decision is lawful only
under an exact decision contract.

P2 Purpose. A selected outcome defines adequacy; interfaces inherit
material obligations from the transformation they serve. Non-entailment:
let a finite actor realise a selected outer contract that names an
outcome, through steps that fit its envelope, read under declared
contracts, keep declared identities, compose by type, record their
step-produced facts, return closed results and keep evidence apart from
authority, while each interface's obligations are set by the capacity
available and not inherited from the transformation it serves; P0, P1 and
P3 to P6 hold, yet the same obligations count as adequate for opposite
outcomes and an obligation with no route to the outcome stands, which P2
forbids.

P3 Identity. An object's identity is declared (authority, kind, value) and
survives admissible change; a boundary is a claim with a proof obligation.
Non-entailment: let steps fit their envelopes under one selected outcome,
read under declared contracts, compose by type, record their
step-produced facts, return closed results and keep evidence apart from
authority, while each object's identity is taken from the place that
stores it and no authority, kind or value is declared, so an admissible
move makes one object two; P0 to P2 and P4a to P6 hold, yet identity is
neither declared nor kept across admissible change, which P3 forbids.

P4a Typed composition. Two steps compose only when the first's result type
and judgment satisfy the second's exact declared domain and preconditions.
Non-entailment: let a second step run on every output of the first, read it
under its own declared contract and return `invalid_basis` where the output
lies outside its declared domain, and let the composite keep only the
step-produced facts the outer contract needs. Each step fits its envelope and serves the selected
outcome, identities are declared and kept, the needed facts are recorded,
every result is closed and authority stays with its owners, so P0 to P3,
P4b, P5 and P6 hold. Yet the steps compose although the first's result type
need not meet the second's declared domain, and the first step's other
intermediate results and stop state are lost; P4a forbids both. The
retention has its own route to the outcome: when the composite is later
falsified or must be resumed, the kept intermediate results and stop state
locate the step to repair or restart, which a record of what the outer
contract needs does not supply (P2).

P4b Conservation of step-produced facts. Judgments, residuals, observations
and authority decisions the outer contract needs are recorded by the step
that produced them. The outer contract needs these facts (P2); the next
actor may re-acquire declared sources but not the producing step's private
result, because step-produced facts are not re-acquirable (P0); so only the
producing step can record them. Its typed instances include authority,
residuals, judgments, frame boundaries, transitions, successor claims and
evidence by reference; each consuming member binds the applicable instance
to its own scope.

P5 Totality. A step can meet a condition outside its context (P0's
open-world premise), and it cannot report success on one (P6). Its result
algebra therefore carries first-class outcomes other than success for such
a condition, and its control model names the next move. The three values
`indeterminate`, `out_of_frame` and `invalid_basis` are a declared choice
of [Results](#results), family F3.
[REFERENCE_FRAME §3](REFERENCE_FRAME.md#rf-012-closed-results) and
[AXIOMATIC_CALCULUS §4](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
apply the same core to their respective domains.

P6 Justification and authority. Definitions, assumptions, observations,
candidate judgments and accepted claims have distinct standing; evidence
supports a claim on a basis; authority permits or disposes within scope.
Non-entailment: a bounded actor satisfying all else can still take a green
label as acceptance.

### Construction synthesis

The commitments together govern movement from an observed current state
to an acceptable destination under finite resources. This is a synthesis
of their relations, stated once so that every consumer of the construction
relation, which [ACTIVATION §1](ACTIVATION.md#construction-relation), a
tier 1 foundations member of this corpus, owns, can see which commitment grounds each part. It is derived, not a further
commitment, and has the standing of a consequence under Foundation to law
below (P6).

| Commitment | Contribution to construction |
|---|---|
| P0 Bounded construction | the outer contract is realised through steps whose contexts fit the actors' envelopes, so acquisition and work are bounded; the actor's internal path within a step is its own |
| P1 Interpretation | the required conditions, the observed state and the predictions about an action's effects are different accounts; the meaning needed to compare them is preserved |
| P2 Purpose | Z is selected with the criteria by which a strategy and a realised outcome are adequate; work with no route to Z is unjustified |
| P3 Identity and state | the persistent subject, its current observations and its dependencies, from which work continues, stay distinct from any account of them |
| P4a Typed composition | outer obligations are carried through bounded steps, refinement and the composition boundaries between them |
| P4b Conservation of step-produced facts | what a step produced and cannot re-acquire is conserved through the loop of observation, correction and reuse |
| P5 Totality | resource tradeoffs, recursive progress, recovery and truthful stops are accounted for, and an undecided outcome is reported as undecided |
| P6 Justification and authority | what the results support, and who may change the model, act or accept delivery, are established and not minted |

The construction relation states the obligations this synthesis places on
construction. Finite capacity motivates bounded work; purpose, meaning,
identity, compatibility, evidence and authority retain their own
premises. Strategy selection and domain controls are added choices within
those obligations, each with its owner. Feedback, a useful model and
locally valid steps do not by themselves prove reachability, stability,
optimality or termination (P5, P6).

### Foundation to law

A family of deciding rules is a group of related rules that decide
outcomes; it is a material family when the outcomes it decides matter to
the method's selected outcome (P2). Each material family is traced in one
family table. The table sits in the member that owns the family, at the
section where an actor enters the family, so the actor meets the trace
where it applies the rules (P2, P6). A family table first states its
instance premises: the conditions of the situations the family governs,
which the commitments do not supply. They are labelled as instance
premises, never as commitments. The table then has one row per
consequence, in five columns:

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|

- Premises, with standing: the commitments the row rests on, each with its
  standing from the table of commitments above, and the instance premises
  it uses. A profile's table also names the families it imports, under
  [PROFILES §1](PROFILES.md#1-the-boundary).
- Consequence that follows: what those premises together require of the
  family.
- Rule in this member that states it: the owning section or clause,
  linked. Where a table accounts for a section of another member, this
  column names that section, linked and marked as outside this member, or
  a paragraph after the table names the sections of other members that
  apply its rows; the section keeps its owner.
- Added domain or policy choice, and its owner: what the rule decides that
  the premises leave open, with the member, profile, adopting Product (a
  Product that applies this method) or authority that owns it, or "none".
  A row never files the whole rule as the choice: the choice is only what
  the premises leave open.
- Pillar: the pillar contributions the row helps account for, by number.
  The ten contributions used in this trace are, in order: 1 specification
  and project structure; 2 world models, identity and Markov objects; 3
  algebraic calculus; 4 functional design; 5 outcome-driven development; 6
  information and interpretation; 7 reference frames; 8 computational
  calculus and execution binding; 9 evidence, correction and authority; 10
  axiomatic calculus. A Pillar cell is a trace, like the rest of the table:
  it is not a premise, adds no standing to the row, owns no choice, and does not
  claim that a pillar is an axiom or follows from finite capacity.

Consumers. After the table, a paragraph names, for each row, the sections
in this or other members that apply the rule where an actor enters it,
each linked to the consumer's own locus, or states that no separate
consumer applies and
the scope of that absence. A blank field or a generic referral establishes
neither coverage nor non-applicability. The paragraph is a trace like the
table: a consumer named in it applies the rule and decides nothing the
owning section does not (P2, P6).

A family table is a trace. Its consequence and choice columns state no
determination that the rule it names does not state, and the table owns
none of the rules or choices it lists (P1, P6).

Standing of the consequences. The consequences are arguments from the
stated premises, not proofs of every clause of the rules they name.
Concrete carrier layouts, the number of actors, numeric limits, adoption
of an optional profile, release procedures and the values of each
refinement are added choices. They are not inferred from the foundational
commitments. Each table leaves those choices at their owners and adds no
record that its rules do not require. Tables over some members are not a
derivation of every member: the index below accounts for every member, by
the table that traces it, by a row marked table pending, or by the reason
it has none. Each family table refers here for the standing of its
consequences and does not restate it (P6, P2).

Index of families. Each row names a family, the section that holds its
table, the members or sections the table accounts for, and the pillar
contributions its table's rows name, which are the union of its rows'
Pillar cells. A row marked table pending names the section that is to
hold its table; until that table is written, the row names its members
and traces none of their rules. A Pillar cell marked pending names no
pillar: the family's table does not yet carry the Pillar column, and the
cell is filled from that table's rows when it does. The index decides
nothing: each rule is in its owning section, and each trace is in its
table (P1, P6). Every family table in this corpus has its consumers paragraph.

| ID | Family | Table | Accounts for | Pillar |
|---|---|---|---|---|
| F1 | Frames and context | [REFERENCE_FRAME §1](REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit) | REFERENCE_FRAME; ACTIVATION §2; FOUNDATIONS §2 Frame objects, Authority kinds, Disjointness and independence, The frame tuple | 1–9 |
| F2 | Transitions, steps and configuration | [ACTIVATION §1](ACTIVATION.md#1-the-step) | ACTIVATION §1 including the construction relation, §4; SPEC_METHOD §8 except delivery priority | 1, 3, 4, 5, 6, 7, 8, 9 |
| F3 | Results and their combination | [FOUNDATIONS §4 Results](#results) | FOUNDATIONS §4, and the result grounds of §2 Imports between members; ACTIVATION §3; RF-012; AC-007; EVALUATION §4 | 3, 4, 6, 7, 9 |
| F4 | Work state, resumption and reuse | [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart) | ACTIVATION §5, §7 | 2, 4, 5, 6, 7, 9 |
| F5 | Proportionality and cost | [ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality) | ACTIVATION §6; SPEC_METHOD §8 delivery priority | 1, 4, 5, 6, 7, 8, 9 |
| F6 | Claims, evidence, assessment and acceptance | [EVALUATION §1](EVALUATION.md#1-claims) | EVALUATION §1 to §5 | 1, 2, 3, 6, 7, 8, 9 |
| F7 | Conformance, equivalence and qualification | [EVALUATION §6](EVALUATION.md#6-conformance-of-realisations) | EVALUATION §6, §7; CONFORMANCE | 1, 3, 4, 6, 7, 8, 9 |
| F8 | Identity | [IDENTITY §1](IDENTITY.md#1-position) | IDENTITY | 1, 2, 6, 7, 8, 9 |
| F9 | The a_c calculus | [AXIOMATIC_CALCULUS §1](AXIOMATIC_CALCULUS.md#1-position) | AXIOMATIC_CALCULUS | 1, 2, 3, 4, 6, 7, 8, 9, 10 |
| F10 | Constitutional chain, outcome and build-tenant binding | [SPEC_METHOD §2](SPEC_METHOD.md#2-the-chain) | SPEC_METHOD §1 to §3, §6, §9 to §11 | 1, 2, 3, 4, 5, 6, 8, 9 |
| F11 | Change management and ambiguity | [SPEC_METHOD §4](SPEC_METHOD.md#4-change-management) | SPEC_METHOD §4, §5, §7 | 1, 2, 3, 4, 5, 6, 7, 9 |
| F12 | Binding a project to the method | [PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) | PRODUCT_DEFINITION; FOUNDATIONS §2 Imports between members except its result grounds (F3) | 1, 2, 4, 6, 7, 8, 9 |
| F13 | Work carriers | [TICKETS §5](TICKETS.md#5-from-carrier-to-execution) | TICKETS; POSTING_GUIDE §2, §7, §9 | 1, 2, 3, 4, 6, 7, 8, 9 |
| F14 | Assurance and testing | [ASSURANCE §1](ASSURANCE.md#1-verification-layers) | ASSURANCE | 1, 3, 4, 5, 6, 7, 8, 9 |
| F15 | Release and successor conservation | [RELEASE §1](RELEASE.md#1-context-and-position) | RELEASE; FOUNDATIONS §2 Product lineage objects | 1, 2, 3, 6, 7, 8, 9 |
| F16 | Engagement baseline (operational profile) | [EXECUTIVE_BASELINE §3](EXECUTIVE_BASELINE.md#3-engagement-applicability) | EXECUTIVE_BASELINE | 1–9 |
| F17 | Software design | [DESIGN_MODULE §1](DESIGN_MODULE.md#1-purpose-and-position) | DESIGN_MODULE | 1, 2, 3, 4, 5, 6, 7, 9 |
| F18 | Outcome-driven development | [ODD §1](ODD.md#1-position) | ODD | 1–9 |
| F19 | Traversal occurrence | [TRAVERSAL_OCCURRENCE, Position](TRAVERSAL_OCCURRENCE.md#position) | TRAVERSAL_OCCURRENCE | 1, 2, 3, 4, 6, 7, 8, 9, 10 |
| F20 | UX | [UX §1](UX.md#1-position) | UX | 1–9 |
| F21 | World model | [WORLD_MODEL §1](WORLD_MODEL.md#1-position) | WORLD_MODEL | 1, 2, 3, 5, 6, 8, 9, 10 |
| F22 | Assurance relations | [FOUNDATIONS §4 Assurance relations](#assurance-relations) | FOUNDATIONS §4 Preservation through construction, Assertions and observation, Parallel derivation and mutual assurance, Quantified assurance, Change impact and evidence reuse, Formal representation | 2, 3, 4, 6, 7, 9, 10 |

Members and sections with no family table, each with its reason:

- FOUNDATIONS §1, the ontology table of §2, and §3: they state the
  vocabulary of standing, the objects the commitments are about, and the
  commitments themselves with this format, which every family table cites
  as its premises. §3 Construction synthesis relates the commitments to the
  construction relation that ACTIVATION §1 states and decides no outcome of
  its own. §2 Work boundary is the object that P0's boundary
  commitment states. §2 Accounts of a construction states a distinction
  and decides no outcome of its own; family F10 traces its use at
  SPEC_METHOD §11. FOUNDATIONS §5: its hypotheses are not law and decide
  no outcome.
- PROFILES: §1 owns the family-import rule, which families a profile imports and how a row cites them under the import rule of §2, that every profile table cites in its
  premise column; §2 to §6 index the profiles, whose own tables trace
  their bindings.
- POSTING_GUIDE and WRITING_GUIDE: their conventions are policy choices
  whose owner is the guide.
- GLOSSARY: a locator index; it decides nothing.
- The standards README and the other packaging (templates, schemas and
  plugin files): they own no determination.

Purpose and material relation of the family table and its format,
instance premises, the standing of the consequences and this index: for
every member, a reader can see which commitments its rules
rest on and which choices they add, with their owners, so no added choice
is presented as following from the foundations, no consequence is filed
as a choice, and no partial trace is presented as a derivation of the
whole method (P6, P2). The Pillar column binds each argument to the
contributions it helps account for, so a contribution that no row names
is visible as unaccounted (P2).

## 4. Algebra

Composition. For steps s₁: X → Y and s₂: Y → Z, s₂ ∘ s₁ exists only under P4a.
The composite's output carries both steps' step-produced facts; its result
is composed as [Conjunction of results](#conjunction-of-results) states.
[RF-010](REFERENCE_FRAME.md#rf-010-composition-on-demand) states once
when a composition law is required and when independently activated
evaluations may instead return closed results to one declared conjunction
or decision rule (P4a).

Conservation accounting. Every transformation records what it preserved,
introduced and removed, its external resolution witnesses and its residuals
(AC-013). How results, known failures and uncovered coverage combine is
[Conjunction of results](#conjunction-of-results).

Reference versus body. A reference conserves a relation when its owner,
exact selector, authenticity, availability and completeness support the same
consuming decision. An inaccessible or insufficient reference is a residual,
not success. A projection cannot trim a required member to fit a carrier or
budget
([AC-011](AXIOMATIC_CALCULUS.md#ac-011-projection)).

Latitude. Two values differ lawfully only through a declared latitude or
transformation relation; preference, probabilistic choice and human presence
are not implicit latitude
([AC-008](AXIOMATIC_CALCULUS.md#ac-008-explicit-latitude)).

Shared machinery. Computational similarity yields a commonisation candidate,
never an adjudication of identity or authority; one implementation may serve
many instances while each instance keeps its responsibility and binding
([UP-019](DESIGN_MODULE.md#computational-realisation-projection-up-019),
[UP-023](DESIGN_MODULE.md#capability-and-foundation-selection-up-023)).

Formal fragment (P6, P1). A categorical claim, about this method or about a
construction made with it, is established only with the demonstration it
requires, as far as each part applies to it:

- each category it claims states its objects, its arrows, when two arrows
  are equal, an identity arrow on each object, and a composition of arrows
  that is associative and has those identities as units;
- each map between categories is defined on objects and on arrows, and is
  called a functor only after its preservation of identities and
  composition is proved;
- its laws, records and maps are represented in a_c
  ([AXIOMATIC_CALCULUS](AXIOMATIC_CALCULUS.md)), keeping apart which
  statements are premises, which are consequences and which are declared
  choices; the separate identities of a_c, its interpretations and their
  carriers are
  [AC-020](AXIOMATIC_CALCULUS.md#ac-020-layer-and-release-separation)'s,
  and what a structural check of the representation establishes is
  [EVALUATION §2](EVALUATION.md#2-separation)'s;
- it names its supporting evidence and its scope, distinguishing mechanical
  checks, mathematical arguments and tests against independently specified
  oracles; what that evidence leaves unresolved is recorded separately, not
  as a fourth kind of support.

Whether a claim asserts conformance, an equivalence or a map's preservation
of structure, and how those claims differ, is the equivalence ladder of
[EVALUATION §6](EVALUATION.md#6-conformance-of-realisations). What a
refinement or rewrite step preserves, and the law that licenses it, are
[ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement), Refinement. A
categorical statement without the demonstration it requires is a
hypothesis: it is not law and is carried for falsification with §5. A model claiming functor laws defines its source and target categories
and proves identity and composition preservation. The definition alone
asserts no categorical functor. Purpose and material relation of
arrow equality, associativity, the representation in a_c and the supporting
evidence: a categorical statement is useful only where its constructions
preserve meaning, and these are what preservation must show (P1, P6).

Formal fragment, hypothesis H1, categorical structure: with 𝒜 the free category on typed primitives, ℐ the selected
carrier sets with total functions and 𝒞_H pairs of functions with additive
costs, S: 𝒜 → ℐ and R_H: 𝒜 → 𝒞_H would be
functors, S neither faithful nor an equivalence. It has no supporting
evidence and the whole claim is unresolved: no argument in this corpus establishes it,
S and R_H are not defined on arrows, and no preservation of identities or
composition is proved. Until its objects, arrows, arrow equality,
identities and composition are written and preservation is proved, the
diagram is notation; it is not law and is carried for falsification with
§5. H names an architecture, never a runtime.

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
one rule ([Conjunction of results](#conjunction-of-results)). Purpose and
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
  [closed result](ACTIVATION.md#7-closed-result-and-reuse), and it is never mapped
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
[REFERENCE_FRAME §3](REFERENCE_FRAME.md#rf-012-closed-results) states
RF-012 as a law over frames and
[AXIOMATIC_CALCULUS §4](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
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
[ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition); each other
member, profile and adopting Product states its mapping where it defines
its values.

Availability, assessment and acceptance are separate results, each with its
own predicate: that a step produced a candidate; that the candidate meets
its declared criteria; and that the
[decision owner](ACTIVATION.md#roles-and-delegation) accepts it at its
boundary. A step having produced a candidate never maps to the candidate's
fitness or acceptance, and acceptance is never inferred from a successful
step (P6; [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition),
[EVALUATION §4](EVALUATION.md#4-review-results) and
[§5](EVALUATION.md#5-acceptance)).

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
  ([ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement)). A term the claim depends on and the frame
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
  [construction availability](ACTIVATION.md#construction-availability), and
  its work state ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart))
  carries the unexercised capability as a residual (P6). In either case
  the unexercised part, B above, has no result: in every conjunction over
  it, it is a planned assessment without a closed result, and the known
  failure A survives with it ([Conjunction of results](#conjunction-of-results)).
  The evaluation's result and the step's stop state answer different
  questions, so the step's stop value never becomes the evaluation's
  result.

Foundation to law for results and their combination (family F3). The
table covers every rule of §4 and the result grounds of §2 Imports
between members, in the format of
[Foundation to law](#foundation-to-law), which states the standing of its
consequences. Purpose and material relation: a reader of §4 sees which
commitments each result rule rests on and which choices it adds, with their
owners (P6, P2). Instance premises, which the commitments do not supply:
(i) an evaluation declares its predicate, subject and basis; (ii) results
of several evaluations, steps or members are combined into one decision;
(iii) members, profiles and adopting Products need outcomes finer than the
core.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P5 (derived from P0 and P6), P6 (independent); (i), (ii) | every performed evaluation returns one closed value of one algebra shared by every member, with a value for a claim that holds, one that fails, one the evidence cannot decide, one that needs a relation or capability the frame lacks, and one whose basis cannot support it | [Results](#results), the value table | the value names, and the division of P5's outcomes other than success into `indeterminate`, `out_of_frame` and `invalid_basis`, conserved from RF-012; owner: this section | 3, 9 |
| P6 (independent), P5 (derived from P0 and P6) | a result claims no more than it establishes: only `satisfied` establishes the predicate, and no refinement or mapping raises a result's standing | [Results](#results), Standing, and the rule that nothing raises standing; for the choice, [Conjunction of results](#conjunction-of-results), Reported value | the order among the four other values within one combination; owner: the member or profile that applies the conjunction, in its declared rule | 9 |
| P1 (independent), P6 (independent); (iii) | a core value alone does not carry a refined value's domain meaning, so a result records its predicate and domain outcome, and the definer of a refined value keeps its meaning | [Results](#results), Recording | each refined value and its domain meaning; owner: the member, profile or adopting Product that defines it | 6, 3 |
| P6 (independent) | an evaluation that was not performed supports no claim, so it has no closed result and is never read as undecided | [Results](#results), Not performed, and the third item of the rule that nothing raises standing | recording non-performance as the absence of a closed result, not as a core value; owner: this section | 9 |
| P5 (derived from P0 and P6), P1 (independent); (ii), (iii) | results from different members combine only if every refined value reads as exactly one core value and `indeterminate`, `out_of_frame` and `invalid_basis` stay explicit | [Results](#results), Refinements | each refinement's question, predicate and values; owner: [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition) for admission, activation and steps, otherwise the member, profile, project or adopting Product that defines it | 3, 6 |
| P6 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated) | that a candidate exists, that it meets its criteria and that its owner accepts it are three claims with three predicates, and producing a candidate establishes neither of the others | [Results](#results), availability, assessment and acceptance | the acceptance boundary and who accepts there; owner: the decision authority that [EVALUATION §5](EVALUATION.md#5-acceptance) names | 9 |
| P5 (derived from P0 and P6), P0 (recovered), P6 (independent) | a claim that needs a relation or capability the frame does not declare cannot be decided in that frame; one the admissible evidence cannot decide is a different case; and a declared capability left unexercised leaves its part without a result, while a counterexample already found stands | [Results](#results), Out of frame or indeterminate | the stop state that carries an unexercised capability; owner: [ACTIVATION §3](ACTIVATION.md#construction-availability), construction availability | 7, 9 |
| P1 (independent), P3 (independent), P5 (derived from P0 and P6) | for an evaluation that depends on a concept imported from another member, a missing source meaning, adoption or authority binding is a relation the frame does not declare, and a changed member or basis whose applicability is not re-established cannot support the evaluation | [Imports between members](#imports-between-members), the grounds of `out_of_frame` and `invalid_basis` | none | 6 |
| P4b (derived from P0 and P2), P5 (derived from P0 and P6), P6 (independent); (ii) | a combination keeps failures, unperformed assessments and uncovered obligations apart and carries each through every join; agreement among contributors discards no counterexample | [Conjunction of results](#conjunction-of-results): its three inputs, Gaps, Survival, Predicates travel | none | 3, 9 |
| P3 (independent), P5 (derived from P0 and P6), P6 (independent); (i), (ii) | a result supports its predicate only on the basis it binds, so a component held only on another basis has, on the basis the composite requires, no performed evaluation and is a gap, while an evaluation performed on a basis that cannot support it decides its own predicate as `invalid_basis`; one component is never answered both ways | [Conjunction of results](#conjunction-of-results), Stale results | none | 3, 9 |
| P5 (derived from P0 and P6), P6 (independent); (ii) | a composite with a gap or a non-satisfied mandatory result is never `satisfied`; where every mandatory result is `satisfied`, its own value is `invalid_basis` if the declared basis relations disagree, and otherwise `indeterminate` while a gap remains; with every mandatory result `satisfied`, agreeing bases and no gap, a material counterexample to a mandatory constraint falsifies it whichever contributor found it, and without one its value is the one its declared rule gives over the mandatory results; a `falsified` result that is not mandatory stays in its record | [Conjunction of results](#conjunction-of-results), Reported value | which non-satisfied value is reported; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P6 (independent), P4a (independent); (ii) | a conjunction decides only under a declared rule and transfers no contributor's semantic authority | [Conjunction of results](#conjunction-of-results), The declared rule | the mandatory results, the handling of conflict and indeterminacy, the basis relations that must agree, the decision authority that owns the conjunction, how results that are not mandatory count, and any veto or deferral; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P4a (independent), P4b (derived from P0 and P2) | composed steps exist only under typed composition; the composite carries both steps' step-produced facts, and its result for the outer predicate is the conjunction over the outer contract's obligations | [§4](#4-algebra) Composition; [Conjunction of results](#conjunction-of-results), Composition of results; [RF-010](REFERENCE_FRAME.md#rf-010-composition-on-demand), outside this member | whether a composition law is needed, under the conditions RF-010 states; owner: the governing evaluation | 3, 4 |
| P4b (derived from P0 and P2), P3 (independent) | every transformation records what it preserved, introduced and removed, its external witnesses and its residuals, so no fact is lost unrecorded | [§4](#4-algebra) Conservation accounting | the record's fields; owner: [AC-013](AXIOMATIC_CALCULUS.md#ac-013-transformation) | 3 |
| P4b (derived from P0 and P2), P5 (derived from P0 and P6), P0 (recovered) | a reference stands for a body only where it supports the same consuming decision; otherwise the shortfall is a residual, never success, and no carrier or budget limit trims a required member | [§4](#4-algebra) Reference versus body | none | 6, 7 |
| P1 (independent), P6 (independent) | two values differ lawfully only through a declared relation; preference, probabilistic choice and human presence supply none | [§4](#4-algebra) Latitude | each latitude or transformation relation; owner: the owner of the contract that declares it | 3 |
| P3 (independent), P6 (independent) | similar computation proposes shared machinery and never decides identity or authority; each instance keeps its responsibility and binding | [§4](#4-algebra) Shared machinery | whether one implementation serves several instances; owner: the accepted design of the realisation that would share it, which [DESIGN_MODULE §5](DESIGN_MODULE.md#capability-and-foundation-selection-up-023) refines for software design where that profile is selected | 4 |
| P6 (independent), P1 (independent) | a categorical claim is established only with its demonstration, and without it is a hypothesis | [§4](#4-algebra) Formal fragment | which categorical claims are made; owner: the member, profile or adopting Product that makes the claim | 3 |

RF-012 in [REFERENCE_FRAME §3](REFERENCE_FRAME.md#rf-012-closed-results),
AC-007 in
[AXIOMATIC_CALCULUS §4](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
and [EVALUATION §4](EVALUATION.md#4-review-results) apply the first row's
algebra to frames, constraints and reviews and add no choice of their own
beyond any refinement they map under the fifth row;
[ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition) holds the
step's refinements of the fifth row and the stop state of the seventh.

Consumers of these rows, one list per row, each consumer linked to its own
locus:

- Row 1, the value table: [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition), where a step returns each performed evaluation's core value, and [§1 Applicability](ACTIVATION.md#applicability), whose applicability decision is a core value; [REFERENCE_FRAME §3 RF-012](REFERENCE_FRAME.md#rf-012-closed-results); [AXIOMATIC_CALCULUS §4 AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal) and [§9 Constraint surfaces](AXIOMATIC_CALCULUS.md#constraint-surfaces), required results; [EVALUATION §4](EVALUATION.md#4-review-results) and [Result and triage projection](EVALUATION.md#result-and-triage-projection), total over the core values; [RELEASE §1](RELEASE.md#1-context-and-position), Results, and [§9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015), where qualification records a core value for each disposition; [CONFORMANCE](CONFORMANCE.md#conformance), its preamble, where an assessment returns a core value for the case's predicate; [ASSURANCE §7 The set](ASSURANCE.md#the-set); [DESIGN_MODULE §10 Totality](DESIGN_MODULE.md#totality); [SPEC_METHOD §2 Requirement categories and classification](SPEC_METHOD.md#requirement-categories-and-classification) and [Operational lifecycle sufficiency](SPEC_METHOD.md#operational-lifecycle-sufficiency), [§4 Change classes](SPEC_METHOD.md#change-classes) and [Computed classification and treatment](SPEC_METHOD.md#computed-classification-and-treatment), and [TICKETS §4 Status](TICKETS.md#status) and [§7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity), where an evaluation that reads a declared state or classification returns its own core value; [EXECUTIVE_BASELINE §12 step 6](EXECUTIVE_BASELINE.md#6-reviewer-returns-to-executive), the Reviewer's core result; [UX §15](UX.md#15-results-of-this-profile) and [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile), where an evaluation returns a core value directly when none of the profile's values applies; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 50.
- Row 2, standing and the rule that nothing raises it: [ACTIVATION §3 Effects](ACTIVATION.md#effects), where success is never claimed for an effect that may still be acting; [ASSURANCE §13 Claim boundaries](ASSURANCE.md#claim-boundaries), where a claim with an unresolved condition is never `satisfied`; [EXECUTIVE_BASELINE §22 Closure](EXECUTIVE_BASELINE.md#22-closure), where `indeterminate` never maps to `satisfied`; [DESIGN_MODULE §10 Post-ticket design review](DESIGN_MODULE.md#post-ticket-design-review), where a falsified closure claim never becomes `satisfied`; [AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), whose stop values never map to `satisfied`; [UX §15](UX.md#15-results-of-this-profile) and [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile), where no mapping raises a result's standing; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 47; for the choice, the consumers of row 11.
- Row 3, recording: [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), where each value keeps its vocabulary, residual and re-entry law beside its core value; [ODD §11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop), where each closure decision keeps its vocabulary and refs beside its core value; [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), where the value travels with the predicate and the outcome's meaning stays there; [ACTIVATION §3 Ambiguity outcome](ACTIVATION.md#ambiguity-outcome), where each outcome keeps its domain outcome with the value; [DESIGN_MODULE §7 Cross-view axiom evaluation](DESIGN_MODULE.md#cross-view-axiom-evaluation), where a verdict recorded with its value keeps the distinction between not applying and meeting the axiom; [TICKETS §3 Close review](TICKETS.md#close-review), where the change class travels with the core value as the domain outcome; [ASSURANCE §7 The set](ASSURANCE.md#the-set), where a core result is recorded with the predicate the frame's claim states; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 47 and 48.
- Row 4, not performed: [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition), where an evaluation the step did not perform has no result, [§1 Roles and delegation](ACTIVATION.md#roles-and-delegation), where an actor cannot report an evaluation it did not perform, and [§5 The workspace and an actor's account](ACTIVATION.md#the-workspace-and-an-actors-account); [EVALUATION §4 Result and triage projection](EVALUATION.md#result-and-triage-projection), where a predicate not performed has no payload; [CONFORMANCE](CONFORMANCE.md#conformance), its preamble, and [§5](CONFORMANCE.md#5-discriminator-coverage), Coverage, where a case not run and assessed on this revision has no result, and discriminator 39; [RELEASE §8 External qualification dependencies](RELEASE.md#external-qualification-dependencies), where a clean skip is an evaluation not performed, and [§9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015), where an unresolved disposition has no result; [DESIGN_MODULE §7 Cross-view axiom evaluation](DESIGN_MODULE.md#cross-view-axiom-evaluation), where an applicable axiom the pack did not evaluate has no result; [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile), where an unrun verification has no closed result.
- Row 5, refinements: [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition), which owns the refinements for admission, activation and steps in [Admission and activation](ACTIVATION.md#admission-and-activation), [Construction availability](ACTIVATION.md#construction-availability), [Disposition](ACTIVATION.md#disposition), [Ambiguity outcome](ACTIVATION.md#ambiguity-outcome) and [Effects](ACTIVATION.md#effects); [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), the outcomes of `activate`, `conjoin` and `translate`, and [§8 Coverage ledger](REFERENCE_FRAME.md#coverage-ledger), the statuses; [AXIOMATIC_CALCULUS §4 AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal), a refinement the owning signature declares, and [§5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), the stop algebra; [ASSURANCE §12](ASSURANCE.md#12-counterexample-localisation), the four forms; [DESIGN_MODULE](DESIGN_MODULE.md#design_module), its lead, with [§7 Invariant reconstruction sufficiency](DESIGN_MODULE.md#invariant-reconstruction-sufficiency-up-018) and [Cross-view axiom evaluation](DESIGN_MODULE.md#cross-view-axiom-evaluation); [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds) and [Mutable-subject effect relation](TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation); [ODD §9](ODD.md#9-method-governance-and-audit) and [§11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop); [UX §15](UX.md#15-results-of-this-profile) and [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile); [TICKETS §3 Close review](TICKETS.md#close-review), whose classifications each take one core value; [SPEC_METHOD §8](SPEC_METHOD.md#8-bounded-execution-in-this-method) and [§11](SPEC_METHOD.md#11-build-tenant-binding), where each operation outcome maps to exactly one core value; [PRODUCT_DEFINITION §4 Explicit complete consumer update](PRODUCT_DEFINITION.md#explicit-complete-consumer-update); [EXECUTIVE_BASELINE §5 Work result](EXECUTIVE_BASELINE.md#work-result) and [§9](EXECUTIVE_BASELINE.md#9-derived-worker-frame), which carry the construction-availability refinement; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 5, 47 and 48.
- Row 6, availability, assessment and acceptance: [ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability), whose `satisfied` establishes availability only, [Disposition](ACTIVATION.md#disposition), which consumes the availability and assessment results and stays separate from both, and [§1 Roles and delegation](ACTIVATION.md#roles-and-delegation), where an assessment is no disposition at a boundary owned elsewhere; [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), where `decision(holds)` is not acceptance; [TICKETS §3 Close review](TICKETS.md#close-review) and [§7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity), where acceptance stays separate from assessment; [EXECUTIVE_BASELINE §5 Work result](EXECUTIVE_BASELINE.md#work-result) and [§12 step 7](EXECUTIVE_BASELINE.md#7-executive-disposes-and-checkpoints), where no work-result value is an assessment or an acceptance; [DESIGN_MODULE §7 Gate and retrospective work](DESIGN_MODULE.md#gate-and-retrospective-work), where neither a passing matrix nor a produced pack is the verdict; [ODD §11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop), where `close` and construction availability answer different predicates. The acceptance boundary and who accepts there are [EVALUATION §5](EVALUATION.md#5-acceptance)'s, as the choice column states.
- Row 7, out of frame or indeterminate: [Imports between members](#imports-between-members), whose result grounds the next row traces; [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), where a question owned by another member returns `out_of_frame` naming its owners, [§3 Construction availability](ACTIVATION.md#construction-availability), whose stop state carries an unexercised capability, as the choice column states, and [Ambiguity outcome](ACTIVATION.md#ambiguity-outcome), which names the halting condition and what would lift it; [PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution), where an evaluation on unresolved meaning returns `out_of_frame`, or `indeterminate` where the evidence also cannot decide, naming the ground; [EXECUTIVE_BASELINE §5 Technical triage, severity, priority and boundary effect](EXECUTIVE_BASELINE.md#technical-triage-severity-priority-and-boundary-effect), where the Reviewer returns `indeterminate` or `out_of_frame` pressure and invents no precision, [Drift locks](EXECUTIVE_BASELINE.md#drift-locks), missing material scope, and [§15](EXECUTIVE_BASELINE.md#15-missing-frame-and-re-entry-application), whose closed result names the missing relation; [ODD §9](ODD.md#9-method-governance-and-audit) and [§11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop), where `valid and worth incorporating` and `reprice` carry the reconfiguration pressure of `out_of_frame`; [UX §15](UX.md#15-results-of-this-profile) and [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile), where a review returns `out_of_frame` naming the term and its owner; [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), where stop `hold` is `indeterminate` naming the evidence that would decide; [DESIGN_MODULE §7 Invariant reconstruction sufficiency](DESIGN_MODULE.md#invariant-reconstruction-sufficiency-up-018), where an undecided reconstruction names what would decide; [REFERENCE_FRAME §13 Minimal evaluation result](REFERENCE_FRAME.md#minimal-evaluation-result), whose residual field carries what an `out_of_frame` result names.
- Row 8, the result grounds of imports: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), where a question owned by another member is decided from those members at their current digests or returns `out_of_frame`; [PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution), which refines the import rule between bounded contexts, and the [PRODUCT_DEFINITION family table](PRODUCT_DEFINITION.md#foundation-to-law-binding-a-project-to-the-method), whose sixth row applies the rule to an activation that reports a missing binding before relying on the concept.
- Row 9, the three inputs, gaps, survival and predicates travel: [ACTIVATION §1 Applicability](ACTIVATION.md#applicability), where a required result that is absent, stale or bound to another subject cannot satisfy a dependent conjunction and a `satisfied` for the declared disjunction counts toward no other predicate, and [§3](ACTIVATION.md#3-step-results-and-disposition); [EVALUATION §3](EVALUATION.md#3-independent-assessment), Protocol, where a result bound to another subject satisfies no planned assessment, and [§4](EVALUATION.md#4-review-results), which keeps findings apart from undecided predicates and uncovered coverage; [ASSURANCE §7 The set](ASSURANCE.md#the-set), [§10](ASSURANCE.md#10-testing-evidence-composition), where a missing result stays visible under aggregate green status, and [§13 Claim boundaries](ASSURANCE.md#claim-boundaries), where an unselected claim is uncovered coverage; [AXIOMATIC_CALCULUS §4 AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal), where a refusal keeps its predicate and `refusal(basis)` is a closed result, not a gap; [EXECUTIVE_BASELINE Drift locks](EXECUTIVE_BASELINE.md#drift-locks), coverage-and-return lock, and [§11 Refinement and conjunction](EXECUTIVE_BASELINE.md#refinement-and-conjunction), where a seam without a result is a gap; [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), where gaps are no outcome of `conjoin` and are recorded beside the reported value, [§6 Result conjunction](REFERENCE_FRAME.md#result-conjunction) and [§8 Coverage ledger](REFERENCE_FRAME.md#coverage-ledger), where an uncovered row is uncovered coverage, never a `falsified` component; [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015), where an unresolved disposition is a gap in the qualification of the affected claim; [SPEC_METHOD §4 Universal intake triage](SPEC_METHOD.md#universal-intake-triage), where a counterexample one frame finds survives the join, and [§11](SPEC_METHOD.md#11-build-tenant-binding), where tenant conformance is the conjunction of its assessments with the requirements calculus as required coverage; [TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse), where the closing condition is the conjunction with the declared obligations as required coverage; [ODD §11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop) and [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), where no value counts toward another predicate and a `partial_effect` residual survives every join; [UX §15](UX.md#15-results-of-this-profile) and [WORLD_MODEL §14](WORLD_MODEL.md#14-results-of-this-profile), with the [WORLD_MODEL family table](WORLD_MODEL.md#foundation-to-law), whose row for the Markov-object construct lets a failed run falsify that run's predicate only; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 23 and 24, and [§2](CONFORMANCE.md#2-construction-trials), trial T-04.
- Row 10, stale results: [EXECUTIVE_BASELINE Drift locks](EXECUTIVE_BASELINE.md#drift-locks), where a stale held result before disposition is a gap, never relabelled `invalid_basis`, and [§11 Refinement and conjunction](EXECUTIVE_BASELINE.md#refinement-and-conjunction); [ACTIVATION §1 Applicability](ACTIVATION.md#applicability), for a required result bound to another basis; [REFERENCE_FRAME §8 Coverage ledger](REFERENCE_FRAME.md#coverage-ledger), where a stale coverage tuple returns `invalid_basis` for the audit's own predicate; [EVALUATION §7 Method self-qualification](EVALUATION.md#method-self-qualification), the `conjoin` row of its population table; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 24.
- Row 11, reported value: [EXECUTIVE_BASELINE §11 Refinement and conjunction](EXECUTIVE_BASELINE.md#refinement-and-conjunction), where a composite claim takes the value its declared conjunction gives, and [§12 step 7](EXECUTIVE_BASELINE.md#7-executive-disposes-and-checkpoints), where the Executive applies the declared conjunction before disposing; [DESIGN_MODULE §7 Gate and retrospective work](DESIGN_MODULE.md#gate-and-retrospective-work), where a combination with a non-satisfied mandatory result or a gap is never `satisfied`; [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), where `conjoin` returns the outcome whose cause holds for the reported value, and [§6 Result conjunction](REFERENCE_FRAME.md#result-conjunction); [EVALUATION §7 Method self-qualification](EVALUATION.md#method-self-qualification), the `conjoin` row; [TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse), where a work claim is complete only when every applicable obligation is satisfied; [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), for a tenant's conformance; [ASSURANCE §13 Claim boundaries](ASSURANCE.md#claim-boundaries), where a usability claim needs all four results and their explicit conjunction; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 23 and check J55, where the decision owner applies the core result conjunction.
- Row 12, the declared rule: [EXECUTIVE_BASELINE §11 Refinement and conjunction](EXECUTIVE_BASELINE.md#refinement-and-conjunction), the profile's declared rule, and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for specialist frames leaves which non-satisfied value a composite reports to the adopting project's rule; [REFERENCE_FRAME §6 Result conjunction](REFERENCE_FRAME.md#result-conjunction), where a declared decision rule consumes the closed results of several frames; [ASSURANCE §10](ASSURANCE.md#10-testing-evidence-composition), where bound results combine only through declared relations; [TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse), whose declared obligations are the mandatory results.
- Row 13, composition of steps: [ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation), Composition boundaries, where steps compose through compatible preconditions, effects, results and authority and a composition is distinct from a categorical join; [DESIGN_MODULE §5 Atomic functions and higher-order composition](DESIGN_MODULE.md#atomic-functions-and-higher-order-composition), where a design states its composition laws rather than hiding them in controller flow; [SPEC_METHOD §4 Universal intake triage](SPEC_METHOD.md#universal-intake-triage), [ASSURANCE §7 The set](ASSURANCE.md#the-set) and [§10](ASSURANCE.md#10-testing-evidence-composition), where frames used together return closed results to one conjunction instead of composing; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 22, and [§2](CONFORMANCE.md#2-construction-trials), trial T-03. What each step preserves and the law that licenses it are [ACTIVATION §4 Refinement](ACTIVATION.md#refinement)'s, as Composition of results states.
- Row 14, conservation accounting: [DESIGN_MODULE §5 Recursive Prime and root conservation](DESIGN_MODULE.md#recursive-prime-and-root-conservation-up-003), where a contraction records the total mapping from every projection to its accepted atoms; otherwise no separate consumer applies: the record's fields are [AXIOMATIC_CALCULUS §4 AC-013](AXIOMATIC_CALCULUS.md#ac-013-transformation)'s, as the choice column states, and the sections that record a transformation apply AC-013 directly.
- Row 15, reference versus body: [AXIOMATIC_CALCULUS §4 AC-011](AXIOMATIC_CALCULUS.md#ac-011-projection), where a projection is a reference that trims no required member; [DESIGN_MODULE §5 Ontology projection](DESIGN_MODULE.md#ontology-projection), where an intentional omission or flattening declares its accepted loss and a failure condition.
- Row 16, latitude: [EVALUATION §6 Conformance of realisations](EVALUATION.md#6-conformance-of-realisations), which applies it where a specification declares its latitude or is repaired; otherwise no separate consumer applies: each latitude is declared in the contract that admits it, whose owner the choice column names.
- Row 17, shared machinery: [DESIGN_MODULE §5 Capability and foundation selection](DESIGN_MODULE.md#capability-and-foundation-selection-up-023), its selection procedure, and [§7 Computational realisation projection](DESIGN_MODULE.md#computational-realisation-projection-up-019), where a projection reveals repeated structure and decides no identity, ownership or authority; [ACTIVATION §1 Intake](ACTIVATION.md#intake), which binds which shared machinery serves the step and under what binding; the [DESIGN_MODULE family table](DESIGN_MODULE.md#foundation-to-law), whose row for recurrence extraction leaves whether one implementation serves several instances to this paragraph.
- Row 18, the formal fragment: [AXIOMATIC_CALCULUS §1](AXIOMATIC_CALCULUS.md#1-position), for category-theoretic status, and [§5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), where a model claiming functor laws carries the demonstration; [EVALUATION §6](EVALUATION.md#6-conformance-of-realisations), Equivalence ladder, where a categorical equivalence claim meets each applicable item; [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), rule 4, where a claim that a binding preserves categorical structure meets it; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 51.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

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
  basis; [RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)
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
premises hold ([ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement),
Refinement).

### Assurance relations

For a deciding rule, use [Preservation through construction](#preservation-through-construction),
[Assertions and observation](#assertions-and-observation),
[Parallel derivation and mutual assurance](#parallel-derivation-and-mutual-assurance),
[Quantified assurance](#quantified-assurance), or
[Change impact and evidence reuse](#change-impact-and-evidence-reuse).
The family table below explains those owners and adds no separate decision.

The relations below connect construction to the assertions, observations
and evidence that support claims about it. They are the shared owner for
the preservation, assertion, provenance, quantified-assurance, reuse and
formal-representation obligations in this corpus; ACTIVATION §1, §4, §5 and §7, EVALUATION §1 and §3,
ASSURANCE §3, §10, §11 and §14, RELEASE §8 and §9, SPEC_METHOD §4 and
any a_c interpretation apply them and state no second relation (P6).
A tenant chooses its representation and execution within these obligations. The notation
states proof obligations; writing an implication does not discharge it.

Foundation to law. This family, assurance relations, covers the six
subsections that follow. Its instance premises are: (a) a construction
with the governing basis bound at intake under ACTIVATION §1 and the
material assumptions, together written Γ here; (b) a declared domain Ω of cases, each with the inputs,
behaviour and environment material to an obligation; (c) a checker with
declared observations and an admitted evaluation relation. They are
conditions of the situations the family governs, not commitments.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P4a (independent), P1 (independent), P6 (independent); instance premise a | By P4a a composite exists only where each boundary is compatible, by P1 a relation written down is not thereby discharged, and by P6 a preservation claim is a claim on evidence, so each claimed step states its domains, relation and property, the implication is a proof obligation, and a relation covering completion alone says nothing about refusal, failure, interruption or unknown effects | [Preservation through construction](#preservation-through-construction) | the adequacy relation and bound of an approximate step: the owner of the step's law | 3, 4, 9 |
| P4a (independent), P2 (independent), P6 (independent); instance premise a | By P4a the composite's property follows only through compatible boundaries, by P2 the final property matters only through its connection to Z, and by P6 that connection is argued, not assumed, so an end-to-end argument establishes the initial condition, each step's premises, compatibility at each boundary and the connection to Z, and preservation is distinct from progress and termination | [Preservation through construction](#preservation-through-construction) | the composition law for concurrency, branches and external effects: the owner of the construction's design | 3, 4, 7 |
| P1 (independent), P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise); instance premises a, b | By P1 an assertion's predicate is distinct from the obligation it is derived from, by P6 passing a necessary condition establishes no more than that condition, and by P5 a conjunction's coverage is a claim of its own, so each assertion states whether its predicate is the obligation, a necessary condition or part of a sufficient conjunction, conditional on Γ and Ω | [Assertions and observation](#assertions-and-observation) | the declared domain Ω and the interpretation: the owner of the obligation and the assessor's activation | 6, 9 |
| P3 (independent), P1 (independent), P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); instance premises b, c | By P3 two admissible cases can differ while their observations agree, by P1 agreement of observations is not agreement of meaning, by P5 an undecidable case is `indeterminate` and never `satisfied`, and by P6 soundness covers every admitted conclusion, so a checker is sound only where its observation separates the cases, and otherwise acquires evidence, narrows its scope or returns `indeterminate` | [Assertions and observation](#assertions-and-observation), Observation sufficiency | the checker's admitted relation T and its observation π: the owner of the assessment frame | 6, 7, 9 |
| P6 (independent), P1 (independent), P4a (independent); instance premises a, c | By P6 an expected answer is justified by its derivation from the obligation and an execution by its record, by P1 a copied answer carries no independent interpretation, and by P4a shared dependencies compose into shared causes of error, so assertion provenance and execution provenance are both required, agreement among paths with shared causes is not independent evidence, and disagreement requires diagnosis | [Parallel derivation and mutual assurance](#parallel-derivation-and-mutual-assurance) | which paths are run and compared: the strategy's owner; the authorship of ported material: [EVALUATION §3](EVALUATION.md#3-independent-assessment) | 6, 9 |
| P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise), P1 (independent); instance premise c | By P6 a number is a claim on its model and evidence, by P5 an unsupported estimate stays unknown, and by P1 a probability over outcomes is distinct from the truth of the predicate, so a quantified assurance claim states its population, priors, likelihoods, shared causes and calibration limits, and no threshold is imposed by this member | [Quantified assurance](#quantified-assurance) | the risk policy and any threshold: the actor exercising the admitted work authority, under the adopting Product | 9 |
| P3 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); instance premise a | By P3 a changed dependency changes what an earlier observation applies to, by P4b retained evidence is conserved with its subject, by P5 unknown impact leaves the dependent assurance undecided, and by P6 retention is justified and not assumed, so validity dependencies are kept apart from justification links, affected checks are selected conservatively, and evidence is retained only under its validity conditions while mandatory gates stay applicable, which ACTIVATION §7 applies to closed results and handoffs | [Change impact and evidence reuse](#change-impact-and-evidence-reuse) | the representation of dependencies and the selection model: the realisation; mandatory gates: RELEASE §8 and the adopting Product | 2, 9 |
| P1 (independent), P6 (independent); instance premise a | By P1 a representation is distinct from the meaning it carries, and by P6 a label is not evidence, so the formal interpretation distinguishes a stated formula, a discharged argument, checked structure, an external predicate and execution evidence, and finite examples prove no universal implication | [Formal representation](#formal-representation) | the carrier, checker and projections: the tenant's a_c design under AXIOMATIC_CALCULUS | 6, 10 |

Consumers of these rows, one list per row, each consumer linked to its own
locus:

- Row 1, the step obligation: [ACTIVATION §1 Composition boundaries](ACTIVATION.md#construction-relation); [ACTIVATION §4 Refinement](ACTIVATION.md#refinement).
- Row 2, the end-to-end argument: [ACTIVATION §1 Composition boundaries](ACTIVATION.md#construction-relation) and [ACTIVATION §4 Refinement](ACTIVATION.md#refinement), as for row 1.
- Row 3, assertion directions: [EVALUATION §1](EVALUATION.md#1-claims); [ASSURANCE §3](ASSURANCE.md#3-test-authority); [ASSURANCE §10](ASSURANCE.md#10-testing-evidence-composition).
- Row 4, observation sufficiency: [ASSURANCE §1](ASSURANCE.md#1-verification-layers), where a failing scenario shows a disagreement of actual behaviour only where its observation binding is supported; [ASSURANCE §11](ASSURANCE.md#11-assurance-subject-acquisition-and-evaluation).
- Row 5, provenance and mutual assurance: [EVALUATION §1](EVALUATION.md#1-claims); [EVALUATION §3](EVALUATION.md#3-independent-assessment), including its authorship rule for a received contribution; [ASSURANCE §3](ASSURANCE.md#3-test-authority); [ASSURANCE §14](ASSURANCE.md#14-design-to-module-evidence-route).
- Row 6, quantified assurance: [EXECUTIVE_BASELINE Technical triage](EXECUTIVE_BASELINE.md#technical-triage-severity-priority-and-boundary-effect), whose causal assessment records a confidence; [SPEC_METHOD §8](SPEC_METHOD.md#8-bounded-execution-in-this-method), where a probability informs priority; [ASSURANCE §8](ASSURANCE.md#8-combinatorial-coverage-and-testing-value), where a project may define a testing-value scalar. At each, an unsupported numeric confidence remains unresolved.
- Row 7, change impact and reuse: [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse), through which [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart) and [EVALUATION §3](EVALUATION.md#3-independent-assessment) reach it; [RELEASE §8](RELEASE.md#8-acceptance) and [§9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015); [SPEC_METHOD §4 Universal intake triage](SPEC_METHOD.md#universal-intake-triage), whose determination of the surfaces and evidence to re-derive is the selection `S_Δ`.
- Row 8, formal representation: [AXIOMATIC_CALCULUS Constraint surfaces](AXIOMATIC_CALCULUS.md#constraint-surfaces), whose first condition of use keeps each element's kind of support; [CONFORMANCE §4](CONFORMANCE.md#4-cases-for-method-discriminators), cases AR-01 to AR-04, which carry the demonstration cases this owner requires. The interpretation that records the kinds is a derived view under AXIOMATIC_CALCULUS, not a consumer of the rule.

Each consumer applies the rule and decides nothing this section does not
(P2, P6).

### Preservation through construction

A construction binds its starting state A and required outcome Z under
[ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation);
the governing basis bound at its intake and the material assumptions are
together written Γ here. The
predicate for Z includes required effects and trace properties where
these matter.

For a sequence of transformations, let `X_i` be the state or trace domain
at boundary i, `F_i ⊆ X_i × X_(i+1)` the declared transition relation, and
`P_i` the property to retain or establish there. A claimed preservation
step has the form:

```text
For all x, x':  P_i(x) and F_i(x, x')  implies  P_(i+1)(x').
```

The relation accounts for the outcomes, effects and assumptions material
to the claim. A relation covering successful completion alone supplies no
claim about refusal, failure, interruption or unknown effects; those
cases follow Results above and the result, authority and recovery
contracts of ACTIVATION §3 and §5. The real execution's conformance to
the relation is a separate obligation (P4a, P1, P6).

An end-to-end argument establishes the initial condition, each step's
applicable premises, compatibility at each composition boundary, and the
connection from the final property to Z. The preceding postcondition
must establish the next precondition, or the missing condition must be
acquired and justified. Concurrency, alternative branches and external effects
require their applicable composition law; a sequential drawing does not
establish one. Local success alone establishes neither composition
compatibility nor Z. Preservation is distinct from progress, termination
and the availability of a suitable next step (P4a, P2, P6).

Exact transformations preserve the declared meaning. Approximate
transformations state their adequacy relation and an established bound
for the complete composition; local tolerances cannot be assumed to add or
to remain unchanged. [ACTIVATION §4 Refinement](ACTIVATION.md#refinement),
Exact and approximate steps, owns the per-step law and applies this
obligation to refinement steps. A
change to the governing outcome or meaning follows its owner and the
successor rules of SPEC_METHOD §4 and RELEASE §9 (P1, P6).

The algorithmic account states the required operation, the informational
account the meaning and distinctions retained, and the computational
binding how work and observations are realised
([§2 Accounts of a construction](#accounts-of-a-construction)). A claim
across these accounts identifies its maps and preservation obligations;
execution by a person, a machine or a mixed arrangement does not
discharge them by itself. A commuting diagram, functor or equivalence
claim requires the categorical demonstration above (P1, P6).

### Assertions and observation

For a selected source obligation r, let `Q_r = interpret(r, Γ, Ω)` be its
required predicate over the declared domain Ω of cases. The interpretation
retains the obligation's scope, conditions, exceptions and permitted
alternatives. A source identifier or digest authenticates the selected
text; it does not prove the interpretation faithful (P1, P3).

An assertion targets a predicate `q_t` and states whether that predicate
is the full obligation or a narrower claim. The directions differ:

```text
Q_r implies q_t                   : q_t is a necessary condition of Q_r.
q_t implies Q_r                   : establishing q_t is sufficient for Q_r.
(q_1 and ... and q_n) implies Q_r : the stated conjunction is sufficient.
```

These implications are conditional on Γ and Ω. Passing a check of a
necessary condition does not establish the full obligation. A conjunction
requires its own coverage and compatibility argument; a collection of
passing tests does not supply it by its count (P1, P6, P5).

Let `π: Ω → O` describe the observations available to a checker and
`T ⊆ O × R` its admitted evaluation relation, where R is the core result
algebra of Results above. A deterministic checker is a functional special
case. A human or probabilistic checker can admit different conclusions on
the same observations; a universal soundness claim covers all admitted
conclusions, not a favourable selected run. `indeterminate` is the core
judgment whose admissible evidence cannot decide the predicate (Results).
It is distinct from an evaluation that was not performed, and from work
or coverage that remains unresolved, which is a state of the work
([ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition),
[§5](ACTIVATION.md#5-work-state-and-restart)) and not a judgment value.
Writing `sat` and `fal` for the satisfied and falsified judgments about
`q_t`, not new execution states:

```text
For every s in Ω:
  (π(s), sat) in T  implies  q_t(s).
  (π(s), fal) in T  implies  not q_t(s).
```

The candidate identifies what supports each claimed direction and where
it is unresolved. A relation admitting both a sound satisfied judgment
and an indeterminate judgment need not always decide the case. A
restricted deterministic model retains its scope, and an actual checker
requires its own conformance account. An observed test pass remains an
observation while the oracle's fidelity is unestablished; it does not
become established satisfaction of the source obligation, and a reported
failure is treated the same way. The observation binding itself needs
support: an idealised π does not establish that the instrument, actor or
execution acquired the required facts correctly. A probabilistic claim
uses its declared distribution over outcomes under Quantified assurance
below; the relation alone supplies no probabilities (P6, P5, P1).

Observation sufficiency. A checker that always decides `q_t` correctly
from π alone requires:

```text
For all s, s' in Ω:
  π(s) = π(s')  implies  q_t(s) = q_t(s').
```

If two admissible cases have the same observation but opposite truth
values, that observation cannot support a sound complete decision between
them; further evidence, a justified narrower scope or an indeterminate
judgment is required. In a classical set model this condition permits a
predicate on the image of π; it establishes neither an executable decision
procedure nor its cost. Unknown effects and unavailable observations
retain their distinctions from falsehood and from an evaluation that was
not performed (Results) (P3, P1, P5, P6).

### Parallel derivation and mutual assurance

Construction and assurance can follow different paths from a common
obligation. For `requirement → refinement → realisation`, assertions
derived from the requirement check its applicable conditions in the
realisation; assertions derived from the refinement check its more
detailed obligations there. Acceptance tests and build-level tests can
instantiate these paths
([ASSURANCE §14](ASSURANCE.md#14-design-to-module-evidence-route)); the
roles identify the selected sources and subject in this example and
prescribe no stage names or test classes (P1, P6).

An expected result or acceptance predicate has assertion provenance: the
owning obligation, its interpretation, assumptions, derivation and shared
dependencies, which give it meaning. An execution has execution
provenance: the actual checker, exact subject, applicable environment,
inputs, observations and result. Both are needed for the claims they
support; execution records alone cannot establish that the expected
answer follows from the requirement. Authentication of a returned
assessment, which binds a result to its producer, subject, basis and
evidence ([EVALUATION §3](EVALUATION.md#3-independent-assessment)), is a
third thing and establishes neither provenance (P6, P3).

An implementation-derived test can be useful for regression or a stated
local property. Repeating the implementation's decision supplies no
independent justification of its fidelity to an upstream obligation. A
shorter assertion path can be easier to inspect and execute than
construction; that is a supported design claim for the selected path, not
a guarantee of correctness, coverage or independence. Valid distinct
implementations can produce different outputs within the same acceptable
relation; equality of outputs is not always the oracle (P1, P6).

Mutual assurance compares independently justified constructions or
assertions within their stated scope. Agreement is compatible with both
being correct and with a shared error; disagreement requires diagnosis
([ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation))
and does not identify the faulty party by itself. Assurance accounts for
shared specifications, interpretations, tools, fixtures, observations,
copied material and other material failure causes. Different actors,
model families or codebases do not establish statistical independence.
Porting retains authorship and common dependencies
([EVALUATION §3](EVALUATION.md#3-independent-assessment)). Repeating
evidence does not create a new independent observation. Agreement with
an incorrect common model cannot validate that model against the desired
real-world outcome; validation of the governing expectations uses its
declared purpose and external observations through their owners, and
proposed corrections preserve counterexamples and follow the applicable
change authority ([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management))
(P4a, P6, P1).

These relationships are recoverable from the existing sources, bindings
and evidence carriers. Shared derivations can be recorded once and applied
to a declared family. No new per-test document, parallel ledger, fixed
number of reviewers or prescribed provenance format is required (P6).

### Quantified assurance

Risk model. The actor exercising the admitted work authority selects the required
assurance for the stated risk, obligations and resource limits. That
selection identifies material failure consequences, coverage and
uncertainty, and the conditions for action or acceptance. Additional
evidence can strengthen a claim only within its applicability and
dependence account; neither a test count nor an assumed preference for more checks
substitutes for that account (P6, P5).

Where quantified assurance is claimed, its model states the population or
uncertainty being modelled, prior information, likelihoods, shared causes
and calibration limits. For a specified violation event V and evidence
event E:

```text
P(V | E, Γ) =
  P(E | V, Γ) P(V | Γ)
  / [P(E | V, Γ) P(V | Γ) + P(E | not V, Γ) P(not V | Γ)].
```

The denominator must be nonzero. E can include agreement, disagreement or other
observations; its likelihood under both faulty and non-faulty conditions
matters. The formula supplies no missing likelihood or prior, and a
numerical posterior is no stronger than its model and evidence.

Let `M_i` mean that check i misses V under the specified evaluation
conditions. The joint miss probability factors exactly by conditional
probabilities:

```text
P(M_1 and ... and M_n | V, Γ)
  = product over i of P(M_i | V, Γ, M_1, ..., M_(i-1)).
```

Conditional terms require defined conditioning events; zero-probability
prefixes are handled without inventing a conditional value. Replacing
those terms with `P(M_i | V, Γ)` requires conditional independence under
the declared model. One minus the joint miss probability is the chance of
at least one detection under those same conditions; it is not the
probability that the whole product is correct. Agreement does not
necessarily increase confidence when shared causes or new information
change the model (P6, P1).

Calibration from sampled cases or injected defects supports only its
justified relationship to operational failures. Unsupported numeric
confidence remains unresolved; qualitative evidence and stated limits
remain usable within the governing policy. No universal probability
threshold is imposed and no probability estimate is required for every
test. Required safety, authority and acceptance conditions cannot be
waived by a cheaper assurance plan (P5, P6).

### Change impact and evidence reuse

Assertion justification and evidence validity are related but distinct
dependency relations. The former explains why a check expresses an
obligation. The latter identifies what can affect the check's behaviour,
conclusion or applicability: implementation, shared libraries, data,
instruments, environments and governing assumptions. A
requirements-to-test link alone is not a complete impact model (P3, P6).

Let Δ be a change to material facts or dependencies, including a newly
discovered invalid assumption. Let `I(Δ)`, the impact cover, conservatively cover the changed
facts and their affected dependents. For each check t, let `D*(t)` cover
the transitive dependencies material to its assertion, execution and use
of evidence. A candidate selection is:

```text
S_Δ = { t : D*(t) intersects I(Δ) }.
```

The representation of these dependencies is the tenant's choice; no
exhaustive graph database is required. Excluding a check requires
supported coverage of its material dependencies and a reason the change
cannot invalidate the intended reused claim; an absent edge is not
evidence of non-influence. Unknown impact widens reassessment or leaves
the dependent assurance unresolved. New obligations or cases create
assessment work even when no existing check covers them. A mandatory
gate, an assessment that the governing policy requires irrespective of
selection ([RELEASE §8](RELEASE.md#8-acceptance)), remains applicable
(P5, P6).

For a new subject and basis, let `E_old` be the existing evidence records,
`E_reassessed` the evidence newly produced by reassessment, and `E_new`
the resulting account. Reassessment includes the checks selected in
`S_Δ`, the assessment of new obligations and the applicable mandatory
gates. Selection alone produces no execution evidence; failed and
indeterminate results retain their standing:

```text
E_new = retain_applicable(E_old, new_subject, new_basis) union E_reassessed.
```

Retention establishes the material validity conditions on the new
subject: the claim and its scope still apply, its assertion and
observation basis remain justified, and the affected dependencies are
unchanged or covered by an established preservation relation. The
original evidence keeps its original subject; a new applicability
relation permits its use. A changed hash alone establishes neither
invalidity nor equivalence. A corrected run is not an unchanged independent
test of the correction: the corrected subject carries its own evidence.
Known failures, unresolved coverage and their
citations remain visible until a supported repair, a reassessment or an
authorised change of obligation disposes of them (P3, P4b, P6).

If a governing requirement changes, dependent expectations may need
authorised revision as well as new execution. A correction in a
refinement revisits the affected obligations and their links to both the
requirement and the realisation. A correction in the realisation
reassesses the affected implementation and integration under the
still-applicable obligations. These are semantic dependency boundaries,
not file or directory boundaries. Recovery reacquires current reality and
invalidates affected claims; it need not erase valid work or rerun every
check ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)) (P3, P6).

The governing assurance can be established from applicable retained
evidence together with new evidence; the completeness of that account is
distinct from the freshness of every execution. Selection considers
impact-analysis, acquisition, execution and assessment costs together,
with anticipated costs distinguished from measurements
([ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality)). The
required assurance, risk policy and mandatory gates constrain that
optimisation; a cheap selection that leaves a required obligation
uncovered is insufficient. Broad or
uncertain impact, a change to the selection model, an applicable release
rule or evidence that selection missed a dependency can justify wider
testing; full-suite execution remains available and may itself have
coverage gaps. No universal full-suite cadence follows, and no
optimisation removes a separately required gate. Failures enter diagnosis
and an authorised response
([ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation));
the next selected action may acquire evidence before any repair is
justified. [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse)
applies this relation to closed results and handoffs; its three
invalidators are kinds of change Δ, and a closed result is affected when
its `D*(t)` meets `I(Δ)` (P5, P6).

### Formal representation

An a_c interpretation of these assurance relations represents their
material obligations and dependency relationships. Its fidelity and the
acquired views that project it follow
[AXIOMATIC_CALCULUS §6](AXIOMATIC_CALCULUS.md#6-interpretation-and-models)
and [Constraint surfaces](AXIOMATIC_CALCULUS.md#constraint-surfaces).
It distinguishes five kinds of support for a statement: a
stated formula, a discharged mathematical argument, mechanically checked
structure, an externally assessed predicate, and evidence from execution.
An external predicate retains the source, scope and evidence required to
establish it; an arbitrary truth label does not discharge the obligation.
No particular proof assistant, probability library or execution engine is
selected (P1, P6).

Assessment of these assurance relations demonstrates the applicable
positive, negative and unresolved cases in [CONFORMANCE](CONFORMANCE.md),
including weak assertions, insufficient observations, shared error, and change selection
that either retains valid evidence or invalidates affected evidence.
Mathematical proof, exhaustive checks of a finite model, sampled tests and
observed use retain their distinct scopes. Finite examples do not prove
the universal implications above. An unproved universal claim can remain
unresolved while bounded construction and assurance proceed where their
governing conditions permit them (P5, P6).

Assessment of these owners and their consumers follows
[EVALUATION §6](EVALUATION.md#6-conformance-of-realisations) and
[§7](EVALUATION.md#7-qualification-of-frames-and-of-the-method).
Source semantics, formal fidelity and actual use retain their separate
evidence within the applicable conformance and qualification criteria;
these obligations do not make each test a theorem-proving exercise (P6).

Purpose and material relation of the assurance relations: they connect
construction results to the obligations they support, expose shared
errors, and direct reassessment to affected claims while retaining
evidence whose applicability is established (P6, P2).

## 5. Hypotheses

Not law; carried for falsification: categorical equivalence of 𝒜 and ℐ under
some reformulation; universal algorithmic capture of meaning; the statistical
Markov boundary (candidate status under
[WORLD_MODEL §4](WORLD_MODEL.md#epistemic-status));
traversal composition laws of any runtime.
