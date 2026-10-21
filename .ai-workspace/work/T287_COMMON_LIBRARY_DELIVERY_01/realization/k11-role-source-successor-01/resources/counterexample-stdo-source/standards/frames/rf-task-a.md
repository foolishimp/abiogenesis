# Reference frame rf-task-a

Task: Declare one reference frame for one evaluation, activate it on an exact subject and basis, return a minimal evaluation result, and say what that result does and does not settle about an owner's claim and who disposes the claim.

Purpose: The owning sections for the frame declaration, its activation on an exact subject and basis, the minimal evaluation result with one core result value, and the disposition of a claim that consumes the result.

Binds:

- This task binds the construction relation: A is the exact subject and basis the activation binds, Z is the task's required outcome with the acceptance conditions the task states, and the actor's claims keep preservation, progress and outcome satisfaction distinct; a judgment its evidence cannot decide is `indeterminate`, and work it cannot finish is reported as unresolved work, not as a judgment ([../ACTIVATION.md#construction-relation](../ACTIVATION.md#construction-relation); member sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf; section sha256=6b6c2ce91c5a7e4be765af2f8009252fa8918719e1d885af6b5810ba4eb699da)
- An evaluation this task returns binds the assurance relations: the source obligation, the claimed predicate and its scope, the observation basis, the exact subject and its material dependencies; a pass is an observation until the oracle's fidelity is established ([../FOUNDATIONS.md#assurance-relations](../FOUNDATIONS.md#assurance-relations); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=a7d5fc5930338c3fb3959017f41935ce742fbb1bf189c2f527dde4e0ba12d064 spanning to #formal-representation)

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

1. [FOUNDATIONS.md#2-ontology](../FOUNDATIONS.md#2-ontology)
2. [REFERENCE_FRAME.md#rf-001-evaluation-relativity](../REFERENCE_FRAME.md#rf-001-evaluation-relativity)
3. [REFERENCE_FRAME.md#rf-002-finite-attention](../REFERENCE_FRAME.md#rf-002-finite-attention)
4. [REFERENCE_FRAME.md#rf-003-material-sufficiency](../REFERENCE_FRAME.md#rf-003-material-sufficiency)
5. [REFERENCE_FRAME.md#rf-004-irrelevance-exclusion](../REFERENCE_FRAME.md#rf-004-irrelevance-exclusion)
6. [REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)
7. [REFERENCE_FRAME.md#rf-006-authority-conservation](../REFERENCE_FRAME.md#rf-006-authority-conservation)
8. [REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation](../REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation)
9. [REFERENCE_FRAME.md#rf-011-topology-mutation-and-recharting](../REFERENCE_FRAME.md#rf-011-topology-mutation-and-recharting)
10. [REFERENCE_FRAME.md#rf-012-closed-results](../REFERENCE_FRAME.md#rf-012-closed-results)
11. [REFERENCE_FRAME.md#rf-013-reconstructable-activation](../REFERENCE_FRAME.md#rf-013-reconstructable-activation)
12. [REFERENCE_FRAME.md#rf-014-capability-fit](../REFERENCE_FRAME.md#rf-014-capability-fit)
13. [REFERENCE_FRAME.md#rf-015-residual-uncertainty](../REFERENCE_FRAME.md#rf-015-residual-uncertainty)
14. [REFERENCE_FRAME.md#5-method-functions](../REFERENCE_FRAME.md#5-method-functions)
15. [REFERENCE_FRAME.md#7-frame-relations](../REFERENCE_FRAME.md#7-frame-relations)
16. [REFERENCE_FRAME.md#11-the-activation-packet](../REFERENCE_FRAME.md#11-the-activation-packet)
17. [REFERENCE_FRAME.md#minimal-frame-declaration](../REFERENCE_FRAME.md#minimal-frame-declaration)
18. [REFERENCE_FRAME.md#minimal-evaluation-result](../REFERENCE_FRAME.md#minimal-evaluation-result)
19. [EVALUATION.md#frame-qualification](../EVALUATION.md#frame-qualification)
20. [ACTIVATION.md#admission-and-activation](../ACTIVATION.md#admission-and-activation)
21. [ACTIVATION.md#disposition](../ACTIVATION.md#disposition)
22. [ACTIVATION.md#7-closed-result-and-reuse](../ACTIVATION.md#7-closed-result-and-reuse)
23. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
24. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
25. [EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance](../EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance)
26. [EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification](../EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification)
27. [REFERENCE_FRAME.md#foundation-to-law](../REFERENCE_FRAME.md#foundation-to-law)

Size of this frame: 111743 bytes.

Source: FOUNDATIONS.md#2-ontology sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545

## 2. Ontology

| Term | Definition | Requires |
|---|---|---|
| Subject | the thing a claim, representation or transformation is about; exact, with inventory and bytes or semantic addresses | P3 |
| Representation | bytes, text, a model or a program standing for a subject; equal representations do not establish equal meaning | P1 |
| Interpretation | a declared contract from representation to meaning within a context; says which distinctions a consumer may rely on and which are residual | P1 |
| Context | the declared scope under which an interpretation holds: subject, definitions, basis, admissible observations | P1 |
| Outcome U | a selected, owner-defined, directly verifiable state with an acceptance interval; adequacy of a transformation is judged against it | P2 |
| Object O | a subject with scoped identity (authority, kind, value), a boundary, current state and declared material relations; identity survives admissible state and encoding change | P3 |
| Actor | whoever performs a step within a declared capability envelope (context, attention, time, capability); a role is a relation an actor occupies, not a kind of actor, and which roles exist is set by a configuration ([ACTIVATION §1 Configuration](../ACTIVATION.md#configuration)), not by this definition | P0, P6 |
| Step | one bounded unit of work: intake, selected context, grant, execution, output | P0 |
| Step-produced fact | a judgment, residual, observation or authority decision produced by a step that cannot be re-acquired from declared sources; an observation reproducible from declared sources is re-acquirable and is not one | P0, P4b |
| Claim | an assertion with subject, property, basis, witness relation and falsifier | P6 |
| Evidence | the exact observations or artifacts admitted to evaluate a claim on a basis; each carries provenance, subject identity, basis and scope; evidence becomes neither semantic truth nor decision authority by being available inside a frame ([What creates no authority](../FOUNDATIONS.md#authority-kinds)) | P6 |
| Judgment | a recorded evaluation over an unchanged subject, with evaluator, decision, evidence, scope and revising observation | P6 |
| Authority | an identity-bearing permission to operate or to dispose acceptance within a scope; its kinds, and what creates none, are defined under Authority kinds below | P6 |
| Residual | a material uncertainty, omission, loss or unproven relation that remains until an authorised disposition | P4b |
| Basis | the exact state a step, claim, result or evaluation binds: every version, identity, time, topology, authority, configuration or evidence coordinate whose change can alter it; immutable, or moving with a declared way of detecting advancement and a declared condition for reevaluation; mixed bases need an explicit composite relation | P6, P3 |
| Material | of a relation: its lawful change can change an evaluation's result, invalidate its basis, change the admissible evidence, change who may perform a material operation, or change who may decide the evaluation or a material operation; of an uncertainty or closure: likewise; materiality is evaluation-relative, so a relation material in one frame may be irrelevant in another; the relation family of ACTIVATION §2 is the material relations of a step | P2, P6 |

### Frame objects

The reference frame and the objects it binds are first-class in this
corpus. Each is defined here once; [REFERENCE_FRAME](../REFERENCE_FRAME.md)
states the laws over them and [ACTIVATION](../ACTIVATION.md) the step that
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
[IDENTITY §6](../IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s,
and the decisions a proxy may take inside a step are
[ACTIVATION §1 Roles and delegation](../ACTIVATION.md#roles-and-delegation)'s.

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
R the closed result algebra (§4 [Results](../FOUNDATIONS.md#results), or a refinement mapped
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
and not sufficient as an exact basis ([RELEASE §1](../RELEASE.md#1-context-and-position)
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
  [SPEC_METHOD §11](../SPEC_METHOD.md#11-build-tenant-binding) defines.

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
relation, the ground of `out_of_frame` ([Results](../FOUNDATIONS.md#results), Out of frame
or indeterminate); a changed member or basis whose applicability is not
yet re-established is the ground of `invalid_basis` (§4 Results).

Purpose and material relation of the declaration's contents, its two
forms, a member as source context and the two grounds above: a concept
used outside its owning section keeps one meaning and one owner, so two
members cannot answer one question two ways, and using a concept grants
no authority over it (P1, P6).


Source: REFERENCE_FRAME.md#rf-001-evaluation-relativity sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-001 Evaluation relativity

Every frame declares the evaluation family it supports. A frame with no
declared evaluation family has no testable sufficiency boundary (P2).


Source: REFERENCE_FRAME.md#rf-002-finite-attention sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-002 Finite attention

An activated frame contains a finite attention surface that fits the
selected actor's declared capability envelope. A frame that needs
undeclared ambient memory, conversation history or an effectively global
workspace context is not reconstructable for that actor (P0). The fit is tested in
[ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope),
which owns the measurement of the context's size and when it applies.
Whether the actor attends adequately to a frame that fits is a separate
question, answered by actual-use evidence under
[EVALUATION §7](../EVALUATION.md#frame-qualification); a size measurement
does not answer it (P0, P6).


Source: REFERENCE_FRAME.md#rf-003-material-sufficiency sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-003 Material sufficiency

Every known relation whose lawful change can alter the evaluation result,
the validity of the basis, the sufficiency of evidence, operation authority
or decision authority appears in the frame or enters through a declared
authoritative input. Omitting a material relation makes the frame
insufficient. The law does not require proving that no undiscovered
material relation exists (P2; P0 with the open-world premise).


Source: REFERENCE_FRAME.md#rf-004-irrelevance-exclusion sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-004 Irrelevance exclusion

Relations that cannot affect the declared evaluation stay outside active
attention unless they are needed to establish that irrelevance. A frame
does not expand because adjacent workspace material exists (P2).


Source: REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-005 Exact basis and coordinates

Every result binds its exact subject, basis, coordinates and evidence
scope. An evaluation performed on a stale, advanced, ambiguous or mismatched
basis that cannot support its required claim returns `invalid_basis` or
requires reactivation. Apparent equality never substitutes for declared
coordinate equality (P3, P1).

Advancement does not rewrite a historical result. Reliance on the new
subject or basis requires an established applicability relation, and
reliance affected by the change is withdrawn until that relation is
established. [FOUNDATIONS Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse)
and [ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse) own that decision;
this law supplies no blanket prohibition on reusing applicable evidence.


Source: REFERENCE_FRAME.md#rf-006-authority-conservation sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-006 Authority conservation

A frame carries and applies admitted authority. It does not mint, widen,
transfer or reconstruct semantic, evaluation, operation or decision
authority from anything that creates none. That list is
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds)'; its
instances in a frame include actor identity, available capability,
evidence shape, implementation reachability and frame selection (P6).


Source: REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-007 Semantic, evidence and verdict separation

The separation of semantic law, evidence, the evaluator's application
and the disposing decision authority is
[EVALUATION §2](../EVALUATION.md#2-separation)'s. This law binds it to a
frame: a frame declaration keeps these roles distinguishable even when
one actor lawfully performs several of them, and where the evaluation
performs a material operation, the existing operation owner supplies the
exact grant as a further role the declaration keeps apart (P6).


Source: REFERENCE_FRAME.md#rf-011-topology-mutation-and-recharting sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-011 Topology mutation and recharting

An activated frame declares the topology changes capable of invalidating
its coordinates or its materiality judgment. A detected material topology
mutation causes reevaluation, frame revision or recharting before the
previous result is reused. Material revision of the frame itself
invalidates for reuse every result bound to the prior revision coordinate;
§10 Revision actions states that rule (P3, P4b).


Source: REFERENCE_FRAME.md#rf-012-closed-results sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-012 Closed results

Every performed evaluation of a frame returns one closed result in the
frame's declared result algebra: the core algebra of
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), or a refinement mapped
into it under that section. That section owns the five core values
(`satisfied`, `falsified`, `indeterminate`, `out_of_frame` and
`invalid_basis`), their meanings and the rules over them: that nothing is
coerced to success; that a refinement adds no core value, keeps
indeterminate, out-of-frame and invalid-basis pressure explicit and raises
no result's standing; and that an evaluation not performed has no result,
its stop state being
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition). This law
applies them to every frame and defines none of them (P5).


Source: REFERENCE_FRAME.md#rf-013-reconstructable-activation sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-013 Reconstructable activation

A fresh competent actor inside the declared capability envelope can
reconstruct the activated evaluation from the frame declaration, the exact
subject, the basis and the admissible inputs, without undocumented
conversational or historical context (P0 with the actor-change premise).


Source: REFERENCE_FRAME.md#rf-014-capability-fit sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-014 Capability fit

Frame adequacy includes actor usability. When the material manifold
exceeds an actor's capability envelope, the remedies are those of
[ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope)
step 3, which owns the list: among them selecting another actor, refining
the frame into steps, sequencing activations and a lawful compression
(RF-017). Choosing among them is human authority's, exercised directly or
in advance through the grant; ACTIVATION §2 says which of them a step
selects itself and which re-enter the grant's owner. The actor may not
silently omit material relations to fit its context (P0, P5).


Source: REFERENCE_FRAME.md#rf-015-residual-uncertainty sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### RF-015 Residual uncertainty

Coverage and evaluation results retain known uncertainty. Unresolved
relations, uncovered evaluations, contested evidence and unknown capability
stay explicit. Absence of a recorded counterexample is not evidence of
universal completeness (P4b, P6; open-world premise).


Source: REFERENCE_FRAME.md#5-method-functions sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

## 5. Method functions

The frame and the functions over it remain distinct. An application may
realise the following relations in any conforming form; the signatures
describe relations, not callable software interfaces (P2; RF-016):

```text
declare(human_authority, workspace, outcome, practices, capabilities)
  -> frame_set

activate(frame, evaluation, subject, basis, actor)
  -> activated_frame | activation_refusal

evaluate(activated_frame, admissible_evidence)
  -> result + evidence + residuals

conjoin(decision_rule, frame_results)
  -> decision | conflict | indeterminate

translate(source_frame, target_frame, value_or_evidence, mapping)
  -> translated_value | declared_loss | refusal

audit_coverage(workspace, outcome, evaluation_inventory, frame_set)
  -> coverage_ledger

revise(frame_set, new_evidence, failures, capability_change, topology_change)
  -> proposed_frame_set_delta
```

`declare` is §4; `activate` and `evaluate` are ACTIVATION §1 and §2;
`evaluate` returns its result under RF-012, and the closed result is
returned and reused under ACTIVATION §7; `conjoin` and `translate` are §6;
`audit_coverage` is §8, which maps the statuses of its ledger to the core;
`revise` is §10. EVALUATION §7 qualifies each.

The outcomes of `activate`, `conjoin` and `translate` form a refinement of
the core algebra, stated under the refinement rule of
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results): each outcome below maps
to exactly one core value for the predicate its function names, the value
travels with that predicate and with the outcome, whose meaning stays here,
and an outcome named in the signatures above that would map to more than
one core value according to its cause carries the cause in its name, as in
`activation_refusal(basis)` (P5, P6). Purpose and material relation: a consumer that combines these
outcomes with other results reads them in the one core, so a refusal, a
conflict or a loss outside the accepted loss is neither mistaken for
success nor merged with an evaluation that was not performed.

| Function and predicate | Outcome | Cause | Core value |
|---|---|---|---|
| `activate`: the frame is activated for this evaluation, subject, basis and actor | `activated_frame` | the frame declaration is bound to the exact evaluation, subject, basis and actor | `satisfied` |
| | `activation_refusal(capability)` | the frame declares a capability the evaluation needs, and the selected actor's declared envelope lacks it; the refusal names that capability and its owner where the subject gives one | `out_of_frame` |
| | `activation_refusal(authority)` | the activation needs semantic, evaluation, operation or decision authority that is not admitted to it; the refusal names that authority's owner | `out_of_frame` |
| | `activation_refusal(basis)` | the subject or basis is stale, advanced, ambiguous or mismatched (RF-005), a topology mismatch included: the subject's topology is not the topology basis the frame declares (RF-011) | `invalid_basis` |
| `conjoin`: the composite predicate holds under the declared decision rule | `decision(holds)` | the conjunction of FOUNDATIONS §4 reports `satisfied` | `satisfied` |
| | `decision(fails)` | the conjunction reports `falsified`, and no mandatory result for the same claim is `satisfied` | `falsified` |
| | `conflict` | the conjunction reports `falsified` while mandatory results for the same claim disagree, one `satisfied` and another `falsified`; the counterexample survives the join, and the disagreement stays unresolved for the decision authority | `falsified` |
| | `indeterminate` | the conjunction reports `indeterminate` | `indeterminate` |
| `translate`: the value or evidence enters the target frame as the declared translation states | `translated_value` | the value or evidence is carried into the target coordinates with its declared meaning | `satisfied` |
| | `declared_loss` | the value or evidence is carried with a loss inside the declared accepted loss; the loss travels with it as a residual (P4b) | `satisfied` |
| | `refusal(condition)` | a refusal condition the translation declares holds, a loss outside the accepted loss included; or the value or evidence fails identity or equality under the translation's declared equality law | `falsified` |
| | `refusal(authority)` | an authority mismatch the translation does not declare: the value or evidence carries semantic, evaluation, operation or decision authority whose relation to the target frame's authority the translation states neither as preserved nor as a refusal condition; the refusal names that authority's owner | `out_of_frame` |
| | `refusal(basis)` | the source value or evidence binds a stale, advanced, ambiguous or mismatched basis or coordinate (RF-005) | `invalid_basis` |

Where no frame the actor can use declares a material relation or
capability the evaluation needs, `activate` returns `out_of_frame` itself
([ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope),
Activation). Where the conjunction reports `out_of_frame` or
`invalid_basis`, `conjoin` returns that value; the signatures name no
outcome for either case, and a basis mismatch is this returned
`invalid_basis`, as EVALUATION §7 names it for `conjoin`. Under a
declared veto or deferral, `conjoin` returns the outcome above whose cause
holds for the value the conjunction reports
([FOUNDATIONS §4](../FOUNDATIONS.md#conjunction-of-results)), or that value
itself where it is `out_of_frame` or `invalid_basis`. A planned
assessment without a closed result, and required coverage that no planned
assessment addresses, are no outcome of `conjoin`:
[FOUNDATIONS §4](../FOUNDATIONS.md#conjunction-of-results) records them
beside the reported value, and they map to no core value. The outcomes of
`activate` answer whether a frame was activated, never the
evaluation's claim: a refused activation performs no evaluation.
`decision(holds)` assesses the composite predicate and is not its
acceptance, which is a separate result
([FOUNDATIONS §4](../FOUNDATIONS.md#results)).


Source: REFERENCE_FRAME.md#7-frame-relations sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

## 7. Frame relations

Frames may relate as:

- disjoint: no material variable, coordinate, evidence or result dependency
  is shared for the declared evaluations;
- overlapping: some material variables, evidence or entities are shared;
- complementary: distinct evaluations jointly inform one decision;
- alternative: different frames can evaluate the same claim under declared
  capability or evidence conditions;
- refinement: one frame resolves a material distinction left aggregated in
  another;
- restriction: one frame evaluates a lawful subset of another frame's
  domain;
- translated: values or evidence move through a declared coordinate map;
- temporally successive: a later frame evaluates a changed basis;
- composed: several frame relations form one governed evaluation or
  action; or
- governing and subordinate: one frame inherits declared constraints from
  another where a real authority or decomposition relation exists.

No relation is the default universal frame topology. A project declares
only the relations its evaluations and coverage claims need (P3, P2;
RF-009).


Source: REFERENCE_FRAME.md#11-the-activation-packet sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

## 11. The activation packet

An actor receives one activated frame or one declared active frame
configuration, never an implied demand to reconstruct the complete
workspace from ambient context (P0). The minimum
activation packet contains:

- frame identity and revision;
- the evaluation and its result algebra;
- the exact subject and basis;
- the material relations and applicable invariants;
- semantic, evaluation, operation where material, and decision authority;
- admissible evidence and tools;
- the capability and context envelope;
- exclusions and prohibited assumptions;
- declared frame dependencies or conjunction outputs; and
- invalidation, stop and reconfiguration conditions.

The actor may own its internal reasoning and search where the governing
method permits. It returns through the declared result relation. Hidden
internal reasoning is no substitute for required evidence, provenance or
authority (P6). Frame size is optimised for reliable evaluation, not for
maximum context loading: a more capable actor may activate a broader frame
and a less capable one may use a lawful refinement sequence, and both
preserve the same material invariants and authority relations (P0, P2;
RF-014).

### Minimal activation binding

The following carrier-neutral content is sufficient to bind one declared
frame for one evaluation. It may be written in Markdown, structured data, a
prompt or another consumer-selected carrier without changing the relation
(P0, RF-016).

```markdown
# Reference-Frame Activation: <stable activation identity>

## Frame
- declaration identity and revision:
- exact evaluation and closed result algebra:

## Subject And Basis
- exact subject or candidate identity:
- workspace, authority, dependency, configuration, and time basis:

## Attention Surface
- material relations and applicable invariants:
- exact source and semantic references:
- explicit exclusions and prohibited assumptions:

## Actor And Authority
- actor and capability envelope:
- semantic and evaluation authority:
- operation authority, subject, and territory where material:
- decision, acceptance, and publication authority:

## Evidence And Relations
- admissible evidence and acquisition route:
- dependency, overlap, input, conjunction, or translation relations used:
- expected result consumer and return relation:

## Stop And Change
- invalidation conditions:
- stop, residual, re-entry, and reconfiguration conditions:
```

Every field resolves through stable identities and source references.
Paths, line numbers, member counts, summaries and matching labels may aid
navigation or diagnostics; they do not substitute for the declared identity
and basis (P3).


Source: REFERENCE_FRAME.md#minimal-frame-declaration sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### Minimal frame declaration

```markdown
# Frame: <stable local identity>

## Evaluation Family
<questions, predicates, and closed result algebra>

## Subject And Basis
<workspace boundary, exact identity, version/time/topology coordinates>

## Material Manifold
<entities, variables, relations, states, and interactions>

## Coordinates And Equality
<how positions are distinguished and related>

## Invariants
<applicable governing laws>

## Authorities
<frame-set, semantic, evaluation, operation where material, and decision authority>

## Evidence
<admissible sources, provenance, and exclusions>

## Capability Envelope
<competence, context, access, tools, evaluation/assurance independence, configuration>

## Boundary And Exclusions
<irrelevant material, prohibited assumptions, and out-of-frame conditions>

## Optional Frame Relations
<inputs, outputs, overlaps, conjunctions, or translations actually used>

## Invalidation And Recharting
<changes that stale this frame or its results>

## Qualification
<representative cases, counterexamples, and known residuals>
```


Source: REFERENCE_FRAME.md#minimal-evaluation-result sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21

### Minimal evaluation result

```markdown
# Frame Evaluation Result

- frame identity and revision:
- activation identity:
- evaluation:
- subject and basis:
- actor and capability envelope:
- semantic, evaluation, operation where material, and decision authority:
- admissible evidence:
- result:
- inference relation:
- residual uncertainty:
- out_of_frame residual (missing relation or capability, owner, reconfiguration pressure):
- invalidation conditions:
- consuming decision or conjunction:
```

The out_of_frame residual field carries what
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results) requires an out_of_frame
result to name, and reads `none` for any other result (P5).


Source: EVALUATION.md#frame-qualification sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6

### Frame qualification

A candidate frame ([REFERENCE_FRAME](../REFERENCE_FRAME.md)) is qualified in
proportion to its claims (P6, P2).
The minimum evaluation asks:

1. Decision test: can a competent actor produce a result in the declared
   algebra for representative in-domain evaluations?
2. Reconstruction test: can a fresh competent actor activate the frame
   from the declared packet without hidden history (RF-013)?
3. Sensitivity test: do changes to declared material relations affect the
   result where expected?
4. Irrelevance test: do excluded unrelated changes leave the result stable
   where expected?
5. Basis test: does stale, mismatched or ambiguous basis information
   invalidate or refuse the evaluation?
6. Authority test: does frame selection preserve semantic and decision
   authority and the exact inherited operation authority for every
   material construction, transformation, admission, publication or
   mutation?
7. Counterexample test: does the frame detect the representative
   historical or constructed violations it claims to cover?
8. Capability test: can the declared actor class hold and operate the
   frame within its envelope?
9. Result-consumption test: can a declared consumer use the closed result
   without importing hidden frame context?

Qualification binds the exact frame revision, actor envelope, evaluation
family, basis class and evidence conditions evaluated. It does not
generalise to an unevaluated population by naming the frame generically
(§1, the quantifier rule).

Adequate attention. The capability test asks two questions, and they are
evaluated separately. Whether the declared actor class can hold the frame
is fit: for the context dimension, the size of the selected
representation, measured as ACTIVATION §2 step 3 measures it, against the
declared capacity; the envelope's other dimensions are fitted as RF-014
states. Whether the actor class
operates the frame adequately is adequate attention, and only actual-use
evidence establishes it: actors of the declared class apply the frame to
its declared tasks under its declared conditions, and the results are
judged against expectations recorded from the governing sources before the
results are opened, by an assessor under §3 where the claim needs
independent assessment. A size measurement, or any byte or token
threshold, establishes fit and nothing about attention; a frame that fits
is not thereby adequately attended. Actual-use evidence binds the frame
revision, actor class, tasks and conditions evaluated, like the
qualification above, and establishes no universal attention score (§1,
the quantifier rule). Time, spend and other resource limits are those of
the selected execution binding, under the resource-limit law of
[ACTIVATION §6](../ACTIVATION.md#6-cost-and-proportionality), not of this
test. Finite attention makes fit necessary
(RF-002), and only use shows that a frame that fits is applied, so a frame
is never qualified for attention because it fits (P0, P6).


Source: ACTIVATION.md#admission-and-activation sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Admission and activation

A step exists only after its contract is admitted (§1, Admission) and its
frame is activated on the exact subject and basis (§2). The outcomes of
admission and of context construction are owned here; each maps for the
predicate "the step is lawfully admitted and activated on the exact
subject and basis", and its cause selects its value (P5, P6; RF-005 for
the basis causes). The outcomes of frame activation are the `activate`
refinement of [REFERENCE_FRAME §5](../REFERENCE_FRAME.md#5-method-functions),
which owns their causes, their predicate and their core values. Because
this predicate requires activation, a refused activation decides it with
the value REFERENCE_FRAME §5 gives; the table names those outcomes and
maps none of them again:

| Outcome | Cause | Core value |
|---|---|---|
| `activated` | the contract is admitted with its admission evidence (§1), Z, R, the required-edge semantics, the basis and the scope are exact and the material closure is finite and unique (§2, step 1), its projection returns a selected context (§2, step 2), and activation returns `activated_frame` | satisfied |
| `admission_refused(authority)` | the work authority the step needs is not admitted: no admission mechanism or explicit human override admits the exact contract, or no durable result and evidence surface is authorised and available; the outcome names the missing authority or surface and its owner | out_of_frame |
| `admission_refused(basis)` | the contract's cited outcome, prerequisite or experiment basis, or the exact subject and basis it names, cannot support it; the outcome names that basis | invalid_basis |
| `closure_unresolved` | the seed set Z, the relation family R, the required-edge semantics, the basis or the scope is not exact, or the material closure is not finite and unique on the exact basis (§2, step 1; AC-010), or the projection of the closure returns a gap or refusal (§2, step 2; AC-011); the outcome names the condition that fails and the basis coordinates that leave it open | invalid_basis |
| `out_of_frame` | no available frame and actor pairing declares a material relation or capability the evaluation needs (§2, Activation), or no fit option of §2 step 3 fits the selected context to an actor's envelope | out_of_frame |
| `activation_refusal` with its cause | a cause REFERENCE_FRAME §5 states | the core value REFERENCE_FRAME §5 maps that cause to |

These outcomes are not values of construction availability and are not
results of a step. A refused admission or activation creates no step, no
activation of the step's frame and no work result, the closed output of a
constructing actor to its consumer; the outcome returns to the assigning
authority or the declared result carrier, and no consumer records it as a
step's stop state. [EXECUTIVE_BASELINE §5](../EXECUTIVE_BASELINE.md#work-result)
applies this rule to the Worker.
Purpose and material relation: a mismatch known before the step begins is
reported with its cause in the one core, so it is neither mistaken for a
step that stopped nor for one that ran.


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


Source: ACTIVATION.md#7-closed-result-and-reuse sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

## 7. Closed result and reuse

A closed result identifies the frame and its activation, the subject, the
basis, the evaluation, the actor, the evidence, the verdict, the residual
uncertainty and the invalidation conditions (the minimal shape is
REFERENCE_FRAME §13). The frame's internal working context need not be
transferred when the closed result and its provenance are sufficient for
the consuming decision; it may still be attached, for audit or otherwise,
without changing the result. Independent evaluations may share valid
mechanical evidence under the declared independence conditions of
[EVALUATION §3](../EVALUATION.md#3-independent-assessment), which owns that
permission (P4b, P0).

The selection of affected results after a change and the conditions for
retaining evidence on a new subject are
[FOUNDATIONS §4 Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse);
this section applies them to closed results and handoffs, and the three
invalidators below are kinds of change Δ, and a closed result is affected
when its dependencies `D*(t)` meet the impact cover `I(Δ)` (P3, P6).

A closed result is reused by an unchanged consumer that checks exact
applicability; a role, conversation or resumption change alone invalidates
nothing. An invalidator invalidates the affected result before reliance,
even where the subject's own bytes are unchanged, preserving its
predecessor/successor relation and any demonstrably independent surviving
results. Invalidation withdraws the result from direct reliance; whether
its evidence is retained on the new basis is decided by `retain_applicable`
of FOUNDATIONS §4 Change impact and evidence reuse, and the changed
coordinate alone establishes neither that the claim fails nor that it
holds. The invalidators are three:

- a material input change: a change to the result's subject or to an
  input it rests on, including the admissible evidence that bears on its
  predicate; newly acquired or changed admissible evidence is such a
  change when it is material to the result as
  [FOUNDATIONS §2](../FOUNDATIONS.md#2-ontology) defines material, that is,
  when it could change the result's value;
- a changed basis: a change to any coordinate of the basis the result
  binds (FOUNDATIONS §2, Basis);
- a declared revising observation: an observation that the result or
  judgment itself names as one that would revise it, once it occurs.

A changed source, task or actor condition is a changed basis where the
basis binds it, and otherwise a material input change; a role change that
alters a required actor condition is such a change, while a role,
conversation or resumption change that alters none of these invalidates
nothing (P3, P6).

Judgment continuity names the basis and the evidence; Return A Closed
Result names inputs and the observation. A member, profile or project
that names a trigger for its own domain, such as a changed projection,
rule or configuration, names it as an instance of one of these three and
states no parallel list (P3, P4b, P6). A reused judgment does not
satisfy a separately required independent judgment; the independent assessor
acquires its own evidence and supplies its own judgment. [TICKETS §7](../TICKETS.md#recorded-judgment-and-owner-ruling-continuity)
uses the same evidence invalidator. Naming these kinds once gives every
consumer the same triggers. The
material relation is whether a result is relied on after a change that
could alter it (P3, P6). Whether a revision of a frame needs a new
revision coordinate is
[REFERENCE_FRAME §10](../REFERENCE_FRAME.md#revision-actions)'s question;
whether a result it touches stays valid is this section's.

### Transition evidence

A reviewable transition identifies the exact candidate, the affected
relations, the changed realisation paths, the authority paths added or
removed, the retained and open seams, the focused proof, any required
integration proof, the explicit non-changes, and, where an assessor was
activated, the assessor's recommended disposition, with the decision
owner's disposition beside it once one is made (§3). Consumers
choose the representation. Transition evidence is a read
model; it does not become specification, design or admission authority
(P6, P4b).

Construction uses the cheapest focused proof capable of falsifying the
active relation. Expensive whole-candidate qualification occurs at a
declared candidate boundary rather than after every local edit, unless the
affected risk makes whole-candidate proof necessary (§6). A durable or
reconstructable authority claim is not established solely by a same-process
proof when loss of incidental process state is a material counterexample:
the proof destroys or excludes the incidental authority and compares the
reconstructed semantic outcomes (P5, P6).

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


Source: EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=1/17 selected by the anchors this frame carries; the consumers paragraph of 17 items is omitted

### Foundation to law: claims, evidence, assessment and acceptance

This family, claims, evidence, assessment and acceptance (F6 in the index
of [FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law)),
decides when a claim is supported, how it is assessed and who accepts it.
It covers §1 to §5 of this member. Its instance premises are: (a) claims
about exact subjects are relied on for promotion, closure or release; (b)
the evidence available is finite, and may observe a weaker or different
subject, or another basis, than the one claimed; (c) a constructing actor
may be probabilistic or otherwise fallible; (d) each boundary at which a
claim is relied on has a decision owner. They are conditions of the work
this family governs, not commitments, and do not follow from finite
capacity alone.
P0's premise that a step's output is a candidate until evaluated is cited
by name. The standing of the consequences below is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P1 (independent) | P1 keeps a representation apart from its meaning, and P6 makes a verdict a claim on evidence that a separate decision authority disposes. So the semantic basis, the evidence basis and the state projection stay distinct, as do semantic law, evidence, the evaluator's application and the disposition, and the record keeps them distinguishable where one actor performs several. It follows that an evidence change can invalidate a verdict without any change of law, a projection change can invalidate a view without changing semantic truth, and a semantic change invalidates affected downstream acceptance; a changed broad digest shows a changed representation, not that every semantic relation changed | [§2](../EVALUATION.md#2-separation), first two paragraphs | when an evidence change invalidates a verdict, with mandatory force where it does: [ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse) (family F4); when a derived view is stale: [ACTIVATION §2](../ACTIVATION.md#staleness-of-derived-surfaces); the re-entry a semantic change takes: [SPEC_METHOD §4](../SPEC_METHOD.md#4-change-management) (family F11); invalidating a review conservatively on a broad digest change: permitted by this section, required nowhere; the frame and a_c bindings of these separations: RF-007 and AC-018 | 6, 9 |

The core result a review returns for each evaluated predicate, the rule
that a planned predicate not evaluated has no result, and the projection of
the triage payload over the core values (§4) apply the core result algebra;
they are traced in family F3 at
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), and the rows above trace
what §4 decides about the review record, triage and returns.


Source: EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=3/13 selected by the anchors this frame carries; the consumers paragraph of 13 items is omitted

### Foundation to law: conformance, equivalence and qualification

This family, conformance, equivalence and qualification (F7 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law)),
decides when a realisation, a frame or the method itself is shown fit for
what it claims. It covers §6 and §7 of this member and the
[CONFORMANCE](../CONFORMANCE.md) member; a rule in CONFORMANCE is marked
"outside this member" in the third column. Its instance premises are: (a)
one specification may have several realisations; (b) realisations, frames
and the method are made by fallible constructors and relied on by actors
who did not make them; (c) qualification evidence comes from a finite set
of cases, run by actors inside declared envelopes. They are conditions of
the work this family governs, not commitments, and do not follow from
finite capacity alone. P0's actor-change premise, that the actor of one
step need not be the actor of the next and may re-acquire declared sources
but not private memory, is cited by name. The standing of the consequences
below is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P2 (independent); instance premises b, c | By P6 a frame's claims hold only on evidence, and by P2 the evidence needed follows the claims made, so a candidate frame is qualified in proportion to its claims, by at least the decision, reconstruction, sensitivity, irrelevance, basis, authority, counterexample, capability and result-consumption tests. Qualification binds the exact frame revision, actor envelope, evaluation family, basis class and evidence conditions evaluated, and does not generalise to an unevaluated population by naming the frame generically | [Frame qualification](../EVALUATION.md#frame-qualification), the tests and the paragraph after them | the nine minimum tests: this section; the representative cases for each claim: the qualification that evaluates it | 7, 9 |
| P0 (recovered), P6 (independent); instance premise c | By P0 fit is a property of the representation and the envelope, and by P6 attention is shown only by evidence of use, so fit and adequate attention are evaluated separately. Fit, for the context dimension, is the measured size of the selected representation against the declared capacity; adequate attention is established only by actual-use evidence, judged against expectations recorded from the governing sources before the results are opened. A size measurement or any byte or token threshold establishes fit and nothing about attention; actual-use evidence binds the frame revision, actor class, tasks and conditions evaluated and establishes no universal attention score | [Frame qualification](../EVALUATION.md#frame-qualification), Adequate attention | the tasks and conditions evaluated: the qualification; the size measurement: [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) step 3 (family F1); time, spend and other resource limits: the selected execution binding, under [ACTIVATION §6](../ACTIVATION.md#6-cost-and-proportionality) (family F5) | 7, 8, 9 |
| P6 (independent); instance premise c | By P6 each claimed relation is a separate claim that needs its own evidence, so the qualification population is every function and failure relation the method claims, each with its representative observations. One valid frame-set declaration and coverage result establishes only `declare` and the evaluated `audit_coverage`, and the other relations by no implication; each relation is exercised through positive, boundary and falsifying cases; every verdict states exactly what it evaluated, and an unevaluated function or branch stays open rather than inheriting a whole-method verdict. Prior exemplars are optional comparison evidence after freeze | [Method self-qualification](../EVALUATION.md#method-self-qualification), the population table and the paragraph after it | the relations: [REFERENCE_FRAME §5](../REFERENCE_FRAME.md#5-method-functions) (family F1); the representative observations listed: this section; staging: the governing authority | 3, 9 |

CONFORMANCE §1 to §4 list the cases, which are the choices named in the
last two rows; its §5 maps the method discriminators to cases and
logical-review checks.


Source: REFERENCE_FRAME.md#foundation-to-law sha256=8152838639950b09389f99181172792100e4470b4807b4e112870cd4e6f6ba21 rows=16/36 selected by the anchors this frame carries; the consumers paragraph of 36 items is omitted

### Foundation to law

This family, frames and context (F1 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law)),
decides how a finite actor engages a body of work through bounded reference
frames: how a frame is declared, sized, bound, activated, related to other
frames, used to audit coverage and revised. It covers this member; the
context construction of
[ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope);
and the frame objects, authority kinds, disjointness and independence and
frame tuple of [FOUNDATIONS §2](../FOUNDATIONS.md#frame-objects). A rule in
another member is marked "outside this member" in the third column; the
table owns none of the rules it names. Its instance premises are: (a) a
workspace holds more material than one actor's capability envelope (its
competence, context capacity, tools and access) can evaluate at once; (b)
the evaluations to be made are declared questions about a governed
outcome; (c) several frames and actors may bear on one workspace, and their
material may overlap; (d) the workspace, its topology and the actors'
capabilities change between activations; (e) an actor may read both owning
sources and surfaces derived from them by copying, projection or
compression. They are conditions of the work this family governs, not
commitments, and do not follow from finite capacity alone. Two of P0's
premises are cited by name: its actor-change premise, that the actor of one
step need not be the actor of the next and may re-acquire declared sources
but not private memory; and its open-world premise, that the world is open.
The standing of the consequences below is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P2 (independent), P1 (independent); instance premise b | By P2 a frame exists for an evaluation, and by P1 wording carries no meaning of its own, so a frame's sufficiency can be tested only against the evaluation family it declares, so every frame declares one; a module, file, service, role, persona, prompt or lens with no declared evaluation relation is not a frame. Similar wording does not show that two evaluations share a family: an evaluation is within a frame's family only when the question it decides is one that family states at the frame's declared coordinates, whatever the frame's name or its membership in the set | [RF-001](../REFERENCE_FRAME.md#rf-001-evaluation-relativity); [FOUNDATIONS §2 Frame objects](../FOUNDATIONS.md#frame-objects), Evaluation, Evaluation family and Role, persona, abstraction, component, outside this member; [Diagnostic order](../REFERENCE_FRAME.md#diagnostic-order), question 1; [§12](../REFERENCE_FRAME.md#12-violations) item 2 | each frame's evaluation family: the frame's declaration, made under the frame-set authority (§4) | 7 |
| P0 (recovered, with its actor-change premise), P2 (independent), P6 (independent); instance premise a | By P0 and its actor-change premise an attention surface must fit and be reconstructable by the actor that uses it, so an activated frame's attention surface is finite and fits the selected actor's declared envelope; a frame that needs undeclared ambient memory, conversation history or an effectively global workspace context is not reconstructable for that actor. Where the envelope declares a context capacity, the selected context's size is measured before the actor reads it, over a stated boundary, and recorded with the capacity and the comparison; context outside the boundary is recorded as not measured. The measurement applies there and only there, is no budget and no universal gate, and shows fit and nothing else | [RF-002](../REFERENCE_FRAME.md#rf-002-finite-attention); [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) step 3, the size measurement, outside this member; [§12](../REFERENCE_FRAME.md#12-violations) item 10 | the capacity and its unit, bytes or tokens: the actor's declared envelope; the measured boundary, and time, spend and other resource limits: the selected execution binding ([SPEC_METHOD §11](../SPEC_METHOD.md#11-build-tenant-binding)) | 7, 8 |
| P2 (independent), P0 (recovered, with its open-world premise), P5 (derived from P0 and P6, with P0's open-world premise); instance premise a | By P2 and P5 a result is sound only if every relation that can change it is present, and by P0's open-world premise relations not held are not thereby absent, so every known relation whose lawful change can alter the result, the validity of the basis, the sufficiency of evidence, operation authority or decision authority appears in the frame or enters through a declared authoritative input, and omitting one makes the frame insufficient; the law does not require proof that no undiscovered material relation exists. The context starts as the material closure of the intake's seed set (the subject, outcome and affected relations it names) under that relation family, and a closure that is not finite and unique on the exact basis stops the step and is not guessed | [RF-003](../REFERENCE_FRAME.md#rf-003-material-sufficiency); [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) step 1, outside this member | the closure law: [AC-010](../AXIOMATIC_CALCULUS.md#ac-010-material-closure); the stop's outcome, `closure_unresolved`: [ACTIVATION §3 Admission and activation](../ACTIVATION.md#admission-and-activation) | 6, 7 |
| P2 (independent) | By P2 attention is spent only on what bears on the evaluation, so relations that cannot affect the declared evaluation stay outside active attention unless they are needed to establish that irrelevance; adjacent material, or the presence of the corpus, is no reason to load or read it. The closure is projected to the selected context with its boundary recorded | [RF-004](../REFERENCE_FRAME.md#rf-004-irrelevance-exclusion); [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) step 2 and Acquisition, outside this member | the seams the boundary records (excluded, external, unresolved, translated, invalidation-sensitive): ACTIVATION §2 step 2, applying [AC-011](../AXIOMATIC_CALCULUS.md#ac-011-projection) | 7 |
| P3 (independent), P1 (independent) | By P3 a result binds its exact basis, and by P1 equal names or shapes do not establish equal meaning, so every result binds its exact subject, basis, coordinates and evidence scope. A stale, advanced, ambiguous or mismatched basis returns `invalid_basis` or requires reactivation; equal names, values, shapes, locations or apparent topology positions never substitute for declared coordinate equality | [RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates); [FOUNDATIONS §2 Frame objects](../FOUNDATIONS.md#frame-objects), Coordinate, outside this member; [§12](../REFERENCE_FRAME.md#12-violations) item 7 | each frame's coordinate and equality law: its declaration (C of the frame tuple) | 2, 7 |
| P6 (independent), P3 (independent); instance premise c | By P6 authority exists only through an admitted grant, and by P3 it binds its owner and scope, so a frame carries and applies admitted authority and never mints, widens, transfers or reconstructs it from actor identity, capability, evidence shape, implementation reachability or frame selection; declaring, selecting, activating or executing a frame, or naming a role, grants none. The kinds of authority may coincide in a lawful case and never collapse by default, and actor identity is not an authority. A read-only evaluation declares no operation authority; an effectful one inherits the exact operation grant from its existing owner. A proxy for human authority keeps its identity distinct from the human authority's | [RF-006](../REFERENCE_FRAME.md#rf-006-authority-conservation); [FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds) and [Frame objects](../FOUNDATIONS.md#frame-objects), Role, persona, abstraction, component, outside this member; [§2](../REFERENCE_FRAME.md#2-core-claims) claim 8; [§12](../REFERENCE_FRAME.md#12-violations) item 6 | the division into frame-set, semantic, evaluation, operation and decision authority, with actor identity apart, and frame-set authority as human authority: FOUNDATIONS §2 Authority kinds; when a bounded proxy may act: [IDENTITY §6](../IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004) | 7, 9 |
| P6 (independent) | By P6 meaning, evidence, application, operation and decision are separate authorities, so semantic law defines what the evaluation means, evidence supplies observations, the evaluator applies the declared relation, the existing operation owner supplies any operation grant, and decision authority disposes the result; a frame declaration keeps these roles distinguishable even when one actor performs several. The evaluator applies the frame's declared invariants, evidence rules and result algebra and records every assumption whose failure could change the result | [RF-007](../REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation); [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) Evaluation, outside this member | none; [EVALUATION §2](../EVALUATION.md#2-separation) applies this law to review (family F6) | 7, 9 |
| P3 (independent), P1 (independent), P6 (independent), P2 (independent); instance premise c | By P3 and P1 a relation holds only where it is declared, and by P6 and P2 each structure answers its own question, so parent and child relations among frames apply only where declared. Functional decomposition, communication, authority precedence, frame configuration, subject topology and evaluation dependency are distinct relation structures, which a consumer may align where the governed subject warrants it and never silently treats as one hierarchy; an exchange of information grants no authority and establishes neither a decomposition nor an evaluation dependency. No frame relation is the default topology, and a project declares only the relations its evaluations and coverage claims need | [RF-009](../REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy); [§7](../REFERENCE_FRAME.md#7-frame-relations); [§12](../REFERENCE_FRAME.md#12-violations) item 3 | the ten named frame relations: this member (§7); which relations a project declares, and where it aligns relation structures: that project, for its governed subject | 4, 7 |
| P4a (independent), P6 (independent), P2 (independent) | By P4a composition is needed only where parts combine through declared relations, and by P2 nothing is composed that the evaluation does not need, so using several frames does not require composing their internal manifolds. Composition law is required only when the evaluation combines their internal variables, transports evidence or values across them, or treats their operations as one material execution relation. Independently activated evaluations may instead return closed results to one declared conjunction or decision rule. A material composition is introduced only when the evaluation requires it, and declares its shared invariants, effect or decision order where material, closure, failure and the conservation of semantic, operation and decision authority | [RF-010](../REFERENCE_FRAME.md#rf-010-composition-on-demand); [§6](../REFERENCE_FRAME.md#6-frames-in-conjunction), Result conjunction and Material composition; [§12](../REFERENCE_FRAME.md#12-violations) items 4 and 5 | each material composition: the owning application; the conjunction: [FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results) (family F3); the choices its declared rule leaves open: the member or profile that applies the conjunction, in its declared rule | 3, 4, 7 |
| P1 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance premise c | By P1 a value carried across frames keeps its meaning only through a declared relation, and by P4b what is lost must travel with it, so where one frame supplies evidence or a value consumed inside another, the translation declares source and target coordinates, preserved meaning, accepted loss, provenance, equality law and refusal conditions; a loss inside the accepted loss travels with the value as a residual | [Evidence or coordinate translation](../REFERENCE_FRAME.md#evidence-or-coordinate-translation); [§5](../REFERENCE_FRAME.md#5-method-functions), the outcomes of `translate` | the accepted loss and the refusal conditions of each translation: its declarer | 3, 6, 7 |
| P3 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance premise d | By P3 a result binds coordinates that a topology change can alter, and by P4b a stale result persists until re-evaluated, so an activated frame declares the topology changes capable of invalidating its coordinates or its materiality judgment, and a detected material topology mutation causes reevaluation, frame revision or recharting before a previous result is reused. A material revision of a frame produces a new revision coordinate and states which prior activations, results and coverage claims need reevaluation; every result bound to the prior revision is reopened until a recorded re-check finds it independent of the change or it is re-evaluated, and silence keeps no result closed. A revision that changes no declaration of the frame needs no new coordinate, and an unchanged declaration is no ground for keeping a result closed: whether a closed result stays valid is decided by the reuse rule of ACTIVATION §7 | [RF-011](../REFERENCE_FRAME.md#rf-011-topology-mutation-and-recharting); [Revision actions](../REFERENCE_FRAME.md#revision-actions); [FOUNDATIONS §2 Frame objects](../FOUNDATIONS.md#frame-objects), Topology, outside this member; [ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse), the reuse rule, outside this member; [§12](../REFERENCE_FRAME.md#12-violations) item 11 | each frame's invalidation and rechart conditions: its declaration (J of the frame tuple); the revision actions listed: this member (§10) | 2, 7 |
| P0 (recovered, with its actor-change premise), P6 (independent), P2 (independent), P3 (independent) | By P0's actor-change premise a frame must work for a fresh actor, and by P6 and P3 that actor receives only declared, bound inputs, so a fresh competent actor inside the declared envelope can reconstruct the activated evaluation from the frame declaration, the exact subject, the basis and the admissible inputs, without undocumented conversational or historical context. An actor receives one activated frame or one declared active frame configuration, never an implied demand to reconstruct the workspace from ambient context; it may own its internal reasoning where the governing method permits, returns through the declared result relation, and hidden reasoning substitutes for no required evidence, provenance or authority. Every field of the binding resolves through stable identities and source references, for which paths, line numbers, counts, summaries and matching labels do not substitute | [RF-013](../REFERENCE_FRAME.md#rf-013-reconstructable-activation); [§11](../REFERENCE_FRAME.md#11-the-activation-packet); [Minimal activation binding](../REFERENCE_FRAME.md#minimal-activation-binding) | the packet's minimum contents and the binding's fields: this member; the carrier: its consumer (RF-016) | 7, 9 |
| P0 (recovered), P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); instance premise a | By P0 an actor's envelope is finite, and by P5 a step cannot report success on what it did not hold, so frame adequacy includes actor usability. When the material manifold exceeds an actor's envelope, the lawful responses are another actor, a refined frame or outer contract, sequenced activations, a lawful compression or `out_of_frame`; silently omitting material relations to fit is never one of them, and a frame never silently grows beyond the selected actor's envelope. Actor capability may justify a different frame size or activation sequence, and can neither waive an invariant nor widen authority | [RF-014](../REFERENCE_FRAME.md#rf-014-capability-fit); [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope) step 3, the responses when the context does not fit, outside this member; [FOUNDATIONS §2 Frame objects](../FOUNDATIONS.md#frame-objects), Capability envelope, outside this member; [§11](../REFERENCE_FRAME.md#11-the-activation-packet), frame size; [§12](../REFERENCE_FRAME.md#12-violations) item 10 | the selection among these responses: human authority, directly or in advance through the grant; which responses a step selects within its grant (refinement, sequencing, compression) and which re-enter the owner of the grant or envelope (another actor, a larger envelope): ACTIVATION §2 step 3 | 7, 8 |
| P0 (recovered, with its open-world premise), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P6 (independent) | By P0's open-world premise unknown relations exist, and by P4b and P6 an absence of a counterexample is not evidence, so coverage and evaluation results keep known uncertainty explicit: unresolved relations, uncovered evaluations, contested evidence and unknown capability. Absence of a recorded counterexample is not evidence of completeness. Without an independently established closed-domain completeness predicate, a finite frame set cannot establish, by inspecting its own inventory, that no material evaluation is undiscovered; coverage therefore stays falsifiable and states an explicit residual boundary | [RF-015](../REFERENCE_FRAME.md#rf-015-residual-uncertainty); [§9](../REFERENCE_FRAME.md#9-completeness-boundary) | a closed-domain completeness predicate, where one is used: the owner of that domain, who establishes it independently | 7, 9 |
| P2 (independent), P0 (recovered) | By P2 the method requires only what the outcome needs, and by P0 an actor needs the relations, not a carrier, so this member requires the declared relations and the observable outcomes, and no frame runtime, universal carrier, registry, controller, prompt format, repository layout, collaboration topology, worker count or software framework. A frame and the method functions may be realised in any conforming form, and the signatures describe relations, not callable interfaces; the minimal declarations are the least content that declares a frame, a frame set and an evaluation result, in any carrier | [RF-016](../REFERENCE_FRAME.md#rf-016-implementation-neutrality); [§1](../REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit), Substrate; [§5](../REFERENCE_FRAME.md#5-method-functions), the signatures; [§13](../REFERENCE_FRAME.md#13-minimal-declarations); [§12](../REFERENCE_FRAME.md#12-violations) item 14 | the carrier: its consumer; the fields of the three minimal declarations: this member, with the out_of_frame residual field carrying what [FOUNDATIONS §4 Results](../FOUNDATIONS.md#results) requires | 7, 8 |
| P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent) | By P5 each outcome answers its own predicate, and by P6 an outcome is not its acceptance, so the outcomes of `activate`, `conjoin` and `translate`, and the coverage statuses, each answer their own named predicate. A refused activation performs no evaluation; `decision(holds)` assesses the composite predicate and is not its acceptance; a coverage status is a result of the audit, never of the covered evaluation, and an excluded row is met by its cited exclusion, never covered or performed | [§5](../REFERENCE_FRAME.md#5-method-functions), the outcome table and the paragraph after it; [Coverage ledger](../REFERENCE_FRAME.md#coverage-ledger), the status table and the paragraph after it | the outcome and status names and their causes: this member; the mapping of each into one core value follows [FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Refinements (family F3) | 3, 7 |

RF-012, and the mapping of the outcomes of §5 and the coverage statuses of
§8 into the core, apply the core result algebra and its refinement rule;
they are traced in family F3 at
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), and the rows above trace
only what those rules decide about frames. Claim 9 of §2 and item 8 of §12
state RF-012 and go with it to F3. §2 states ten core claims that the rules
named in the rows, or RF-012, make precise; it adds no rule of its own. §12
lists violations, each of the rule it cites, and each is traced in that
rule's row or, for item 8, in F3. §14 states when a project operates under this member: when the
rules named in the rows hold for its frame set, with no frame machinery,
global context, universal completeness or domain authority inferred from
adopting the member.

