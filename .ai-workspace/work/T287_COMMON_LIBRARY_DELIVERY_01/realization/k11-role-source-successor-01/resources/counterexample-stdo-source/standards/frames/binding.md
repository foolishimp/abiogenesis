# Reference frame binding

Task: State the build-tenant binding of a software tenant and a human-process tenant of one requirement set, keep author, actor and operation kind distinct, say what a zero-diagnostic structural check of a process model establishes, and give the result value of a conformance predicate for a faster plan that merges independent assessments and automates a required human decision.

Purpose: The owning sections for build-tenant binding, ambiguity governance with the admission that makes an operation human adjudication, the ontology with actor, authority, representation and interpretation, separation of semantic and evidence bases with structural conformance, independent assessment, structural and semantic separation and the valid model of a_c, effects, and the core result algebra with its conjunction.

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

1. [SPEC_METHOD.md#11-build-tenant-binding](../SPEC_METHOD.md#11-build-tenant-binding)
2. [SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle](../SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle)
3. [FOUNDATIONS.md#2-ontology](../FOUNDATIONS.md#2-ontology)
4. [EVALUATION.md#2-separation](../EVALUATION.md#2-separation)
5. [EVALUATION.md#3-independent-assessment](../EVALUATION.md#3-independent-assessment)
6. [AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation](../AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)
7. [AXIOMATIC_CALCULUS.md#ac-019-valid-model](../AXIOMATIC_CALCULUS.md#ac-019-valid-model)
8. [ACTIVATION.md#effects](../ACTIVATION.md#effects)
9. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
10. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
11. [AXIOMATIC_CALCULUS.md#foundation-to-law](../AXIOMATIC_CALCULUS.md#foundation-to-law)
12. [EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance](../EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance)
13. [EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification](../EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification)
14. [SPEC_METHOD.md#foundation-to-law-chain-outcome-and-build-tenant-binding](../SPEC_METHOD.md#foundation-to-law-chain-outcome-and-build-tenant-binding)
15. [SPEC_METHOD.md#foundation-to-law-change-management-and-ambiguity](../SPEC_METHOD.md#foundation-to-law-change-management-and-ambiguity)

Size of this frame: 95974 bytes.

Source: SPEC_METHOD.md#11-build-tenant-binding sha256=c7b83b2b7e8c9a301d2e535fc3752c08f718d9fc679e32f8a91c15c285976e8e

## 11. Build-tenant binding

This section owns the relation between a product's WHAT and the build
tenants that realise it: what a tenant binds, what stays fixed while it
chooses, and what its evidence shows. It applies to every product built
with this method (P2, P1, P6).

Terms used in this section:

- A build tenant is one independent, project-owned HOW realisation of a
  product's WHAT. The build-tenancy context of
  [PRODUCT_DEFINITION §8](../PRODUCT_DEFINITION.md#8-what-how-and-work-carriers)
  names it, and the product definition's tenant registry locates each one.
- The requirements calculus of a product is the set of obligations its
  WHAT states, the outcomes it permits, and its rules for refining and
  composing the work that realises it.
- A computational calculus is a declared set of executable operations,
  with the laws by which they compose, the transformations they permit,
  and their effects and resource behaviour, as far as these are material
  to the obligations.
- An execution environment is the concrete means that performs those
  operations: a technology stack; a human process, made of people, roles,
  documents, communication channels and decision procedures; or a
  combination of the two.
- A tenant's build-tenant binding has two parts: its calculus binding,
  from the requirements calculus to its computational calculus, and its
  execution binding, from that computational calculus to its execution
  environment. A tenant's registry entry locates the tenant; it is not the
  binding.
- A generic procedure is a method procedure whose scope is independent of
  the selected execution environment. It and its projections preserve the
  bindings Rule 2 permits: code, an event stream or reconstruction from a
  complete history is required only where the governing obligations or
  the selected execution binding require it, and an adequate human
  process using current records and direct observation is a permitted
  execution binding of a generic procedure that requires none of them
  (P1, P6).
- Author identity and actor identity are as
  [EVALUATION §3](../EVALUATION.md#3-independent-assessment) defines them:
  authorship is one condition of an assessment's independence there, and
  an actor's identity is not an authority.
  Operation kind is what an operation does, such as construct, assess,
  relay, record, measure or decide, together with the authority that kind
  of operation requires.

Rules:

1. Realisations of one WHAT. One WHAT is realised by one or more
   independent build tenants, whatever the physical layout. The WHAT is
   constitutional and each tenant's realisation is HOW; a tenant-local
   realisation stays derivative until its governing truth is ratified in
   specification (§2). Each tenant binds the product's requirements
   calculus to a declared computational calculus and binds that calculus
   to a concrete execution environment. Both bindings are that tenant's
   design and realisation: they are declared in its existing design and
   realisation surfaces, chosen under the Design rule (§2) and recorded as
   design decisions (§10), and the method requires no further carrier. The
   tenant owns its binding, its realisation and their evidence; the WHAT
   keeps its meaning (P2, P6).
2. Selection. The execution environment may be a technology stack, a
   human process or a combination. Its selection stays within the
   requirements calculus, including every human decision that calculus
   requires: no choice of environment removes a required human decision or
   a required independent assessment. Author identity, actor identity and
   operation kind stay distinct, and none determines another. Who authored
   a tenant does not select its environment; one actor may perform
   operations of several kinds, each under its own grant; and an actor's
   identity neither decides the kind of an operation nor grants authority
   for it. A person performing an operation does not by that make it human
   adjudication: §5 states the admission that makes an operation human
   adjudication and how a person who decides under policy without it is
   governed. The same holds for every decision the requirements reserve to
   a human: the person the governing authority admits for it takes it, and
   a person's part elsewhere in the process does not (P6, P1).
3. Material content. For the obligations it serves, the binding
   identifies:
   - the operations, each with its inputs, outputs, effects and outcome
     values; each outcome value maps to exactly one core value under
     [FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), and an intended
     external effect, one of uncertain completion included, is recorded as
     [ACTIVATION §3 Effects](../ACTIVATION.md#effects) states;
   - the composition laws, and the transformations the calculus permits;
   - the resource measures;
   - the operational assumptions on which conformance depends, among them
     those about actors, tools, availability and failure.

   Human effort, elapsed time, communication and machine resources are
   measured where a selected obligation needs them. Each measure states its
   unit and its boundary: what is counted, and where measurement starts and
   stops. A resource claim without its unit or its boundary supports no
   conformance claim. The size of a selected context is measured as
   [ACTIVATION §2](../ACTIVATION.md#2-context-construction-under-an-envelope)
   step 3 measures it, against the capacity the binding declares for the
   actor. The law for declaring, measuring and honouring resource limits
   is [ACTIVATION §6 Resource limits](../ACTIVATION.md#resource-limits), and
   this rule binds it: the values of a step's time, spend and other
   resource limits, and the units and boundaries the environment can
   measure, are those of the execution binding, stated before the
   activation they limit. Where a configuration states its resource limits
   and its assumptions about failure
   ([ACTIVATION §1 Configuration](../ACTIVATION.md#configuration)), it takes
   them from this binding (P0, P2, P5).
4. Conformance evidence. The obligations of the requirements calculus
   decide fitness; the kind of executor alone neither accepts nor rejects a
   realisation. Evidence establishes how the bound realisation satisfies
   the required meaning and constraints, including the applicable
   authority, independence, failure and recovery conditions. Conformance is
   judged under
   [EVALUATION §6](../EVALUATION.md#6-conformance-of-realisations), and two
   conforming tenants need not behave identically outside the contract.
   Each assessment returns a core value for its predicate, and the tenant's
   conformance is their
   [conjunction](../FOUNDATIONS.md#conjunction-of-results), with the
   obligations of the requirements calculus as its required coverage. A
   convenient stack never weakens an obligation. An execution plan that
   merges two required independent assessments, or substitutes an
   automated result for a required human decision, is a counterexample to
   the obligation it weakens, so the binding's conformance for that
   obligation is `falsified`; in any run under such a plan the lost
   assessment or decision has no applicable closed result. Matching
   outputs, lower cost or a faster run do not discharge the lost
   independence or authority. A claim that a binding preserves categorical
   structure is a further claim: it meets the Formal fragment of
   [FOUNDATIONS §4](../FOUNDATIONS.md#4-algebra) and stays distinct from
   conformance on the equivalence ladder of EVALUATION §6 (P6, P1, P4b).
5. Reuse. A computational calculus may be reused across tenants and
   execution environments wherever each binding satisfies its laws, and
   each binding shows that it does. A different language, tool, team or
   person does not by itself require a different calculus: replacing the
   executor of an operation while the calculus's laws hold changes the
   execution binding, not the calculus (P1, P4a).
6. Representation. A representation of the requirements calculus or of a
   binding in a_c, the axiomatic calculus of
   [AXIOMATIC_CALCULUS](../AXIOMATIC_CALCULUS.md), prescribes no executor and
   does not establish execution conformance by structural validation alone
   ([AC-018](../AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)).
   An a_c model of a human process that passes structural validation
   neither selects an automated executor nor shows that the process meets
   its requirements; execution conformance needs its own evidence under
   rule 4 (P1, P6).
7. Three accounts. The algorithmic, informational and computational
   accounts of a construction, which
   [FOUNDATIONS §2 Accounts of a construction](../FOUNDATIONS.md#accounts-of-a-construction)
   defines, apply across the binding, from the requirements calculus
   through the computational calculus to the execution environment. The
   binding keeps the three accounts apart. A mapping from one account to
   another is a transformation: what it preserves, the law that licenses
   it, and whether it is exact or approximate with its adequacy relation
   and end-to-end bound, are stated and discharged under
   [ACTIVATION §4 Refinement](../ACTIVATION.md#refinement), and where it is
   recorded in a_c its record is
   [AC-013](../AXIOMATIC_CALCULUS.md#ac-013-transformation). The binding adds
   only which accounts the mapping joins and the evidence, in its
   execution environment, that discharges the preservation (P1, P0, P4a,
   P6).

Application in this method. The relation governs realisation at four
points. The Design rule (§2) places the choice of stack, human process or
combination in design, and that choice is the execution binding.
Ambiguity governance (§5) treats the choice as the step that narrows the
executable realisation class, so a major ambiguity about stack or
execution admissibility is recorded and governed there. A change to a
binding enters through intake triage and takes its change class (§4); a
change that needs a weaker obligation is a change to the WHAT at its
owning layer, never a tenant's choice. The steps of construction (§8) are
carried out under the binding of the tenant doing the work (P2, P6).

Development of several tenants. How a source project keeps its tenants'
work apart and merges it, including branches, working copies, territories,
review points and the merge rule, is that project's own law, bound in its
product definition as local axioms
([PRODUCT_DEFINITION §6](../PRODUCT_DEFINITION.md#6-local-constitutional-binding))
or chosen in a tenant's design. This method prescribes none of these
mechanics. What it does prescribe for several tenants, the independence
of each tenant's ticket lifecycle and the review of each tenant's
tickets, is
[TICKETS §4](../TICKETS.md#multi-build-tenant-independence) and
[§6 Multi-build-tenant review](../TICKETS.md#multi-build-tenant-review)
(P6, P0).

Purpose and material relation: the same obligations can be realised by
different means, software, people or both. The tenant owns its choice of
means and the evidence for it while the WHAT keeps its meaning, so a
particular stack never becomes method machinery and a human or mixed
process needs no parallel method. The material relation is whether the
kind of executor, a person's participation, a tool's convenience or a
structural validation can change what satisfies an obligation, or grant
authority (P2, P1, P6). The constitutional chain requires one WHAT
realised by one or more independent tenants whatever the layout, with
tenant-local realisation derivative until ratified (rule 1). Rule 4 applies
[EVALUATION §6](../EVALUATION.md#6-conformance-of-realisations): conforming
tenants need not behave identically outside the contract.


Source: SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle sha256=c7b83b2b7e8c9a301d2e535fc3752c08f718d9fc679e32f8a91c15c285976e8e

## 5. Ambiguity governance and lifecycle

This member owns the substrate-neutral ambiguity-governance bounded context
`urn:stdo:bounded-context:ambiguity-governance` under the selected complete
basis; a profile's runtime shorthands for its own frames stay in that
profile's context unless an explicit relation imports or translates them
(P3, P1).

Spec-driven development is not only a derivation pipeline; it is a governed
disambiguation pipeline. The upstream chain progressively reduces
ambiguity: goals narrow active priority and work-wave focus; intent narrows
direction and scope; product narrows current realisation shape and terms;
requirements narrow constitutional obligation; build-tenant or stack
choice, a tenant's binding under §11, narrows the executable realisation
class; design narrows structural
interpretation; implementation narrows local realisation detail (P2).

The narrowing is not uniform. Major ambiguity materially changes
architecture, stack, product boundary, execution or deployment
admissibility, public contract shape or other downstream realisation law;
micro ambiguity is a local implementation choice inside an already-governed
design boundary. Major ambiguity is always surfaced and governed; it may
not remain hidden inside informal operator judgment, ambient precedent or
silent model choice. At each major boundary the process detects and
records the major ambiguity that remains or is newly introduced; identifies
the affected invariant, asset or decision boundary; records the decision
taken if work proceeds; and records whether the ambiguity was resolved,
carried forward, escalated or blocked. Those outcomes are `resolved`,
`carried`, `escalated` and `blocked` of
[ACTIVATION §3 Ambiguity outcome](../ACTIVATION.md#ambiguity-outcome), which
gives each its core value for the predicate "the declared ambiguity is
resolved on the exact basis". Only `resolved` is `satisfied`, so a later
boundary rests no dependent claim on an ambiguity that is carried,
escalated or blocked as if it were resolved. Ambiguity detection is
mandatory; blocking is policy (P6, P5).

Lawful probabilistic processing
(`urn:stdo:concept:ambiguity-governance:lawful-probabilistic-processing`)
is bounded non-human processing permitted by declared policy to carry or
resolve declared ambiguity. Human adjudication
(`urn:stdo:concept:ambiguity-governance:human-adjudication`) is explicit
human judgment admitted by authority to resolve declared ambiguity where
policy or risk appetite requires it. That admission makes an operation
human adjudication. A person who relays, records or carries out a step
does not adjudicate by doing so, and a person who carries or decides a
declared ambiguity where policy permits it, without that admission, acts
under the policy and recording that govern lawful probabilistic
processing; who performs an operation does not decide its kind (§11, rule
2). The default governance model: ambiguity
may be carried or decided by lawful probabilistic processing when project
policy allows it; it may be escalated to explicit human adjudication when
project policy requires it; the threshold between those actions is
determined by declared risk appetite, not by silent convenience. Projects
may therefore choose different ambiguity-handling policies: a lower risk
appetite escalates more major ambiguity to explicit human judgment; a
higher one permits more bounded probabilistic decision-making. In either
case the ambiguity and the decision are recorded.

The hard stops of [ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement)
hold regardless of risk appetite. The method is therefore not "eliminate
all ambiguity before work"; it is "make ambiguity visible, govern it
explicitly, and reduce it progressively until downstream realisation is
sufficiently constrained".

The operational lifecycle sufficiency rule (§2) is this governance applied
to lifecycle phases: an unanswered phase is a recorded gap, never a silent
absence.


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


Source: EVALUATION.md#2-separation sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6

## 2. Separation

Three bases stay distinct (P6, P1): the semantic basis, the constitutional
and accepted-design relations that define what a claim means; the evidence
basis, the exact artifacts, events, logs, tests and observations used to
evaluate it; and the state projection, a current view derived from admitted
semantic and evidence bases. Semantic law defines what an evaluation means;
evidence supplies observations; the evaluator applies the declared
relation; decision authority disposes. One actor may lawfully perform
several; the record keeps them distinguishable. This section owns these
separations. [RF-007](../REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation)
binds them to a frame declaration and
[AC-018](../AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)
to an a_c model; each adds only its domain binding.

An evidence change can invalidate a verdict without any change of law.
Whether a given change does so is decided by the reuse rule of
[ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse), and where it
does, the invalidation is mandatory and takes effect before reliance. A
projection change can invalidate a view without changing semantic truth;
when a derived view is stale is decided by
[ACTIVATION §2, Staleness of derived surfaces](../ACTIVATION.md#staleness-of-derived-surfaces).
A semantic change requires lawful re-entry and invalidates affected
downstream acceptance. A broad digest may conservatively
invalidate a review; it does not prove that every semantic relation
changed (P1, P6).

Structural conformance decides closed syntax, types, identities, references,
bases and mechanically decidable predicates. Semantic fidelity decides
meaning and materiality. Structural success is evidence for semantic
review, not a substitute for it. A checker decides the structural subset; it claims a
semantic or authority subset only under an exact lawful decision contract
supplied by the model. For a_c models,
[AC-018](../AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)
and [AC-019](../AXIOMATIC_CALCULUS.md#ac-019-valid-model) bind this rule to
the model's records and validity conditions (P1, P6).
A valid parse, a valid map, a green test and a historical judgment each
establish exactly their own claim. Evidence bound to a basis other than
the evaluated one is excluded by basis; it is not admitted with a narrower
scope (P3;
[RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)).


Source: EVALUATION.md#3-independent-assessment sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6

## 3. Independent assessment

A constructor's self-review is construction output, not assessment. Where
promotion needs independent assessment, the assessor evaluates the exact
live subject, authority paths, proof and installed state, not the
constructor's summary (P6, and P0 with its premise that a step's output is
a candidate until evaluated; instance premise (c) of §1 Foundation to law).
This section decides what counts as independent assessment. Which
boundaries require it is a policy choice of the Spec Method, owned by
[TICKETS §7 Execution and verification authority separation](../TICKETS.md#execution-and-verification-authority-separation-up-007);
a governing basis may add boundaries.

Protocol: where method qualification applies
([§7 Method self-qualification](../EVALUATION.md#method-self-qualification)), the subject is
frozen by identity before material reference exposure; elsewhere it is
stabilised by an immutable identity or an equivalent exact-subject relation
sufficient for the claimed assessment. The assessor records its
expectations from the governing source before opening the candidate; it
reads the subject at that identity or relation, never a mutable working
tree; it makes no repair; it does not assess its
own authorship. Reusing the constructor's judgment does not satisfy
independence; shared mechanical evidence may be reused, judgment may not
(ACTIVATION §7). Binding a returned assessment to its producer, subject,
basis and evidence authenticates the result; it establishes neither the
assertion provenance of its expected answer nor the execution provenance
of its run, which
[FOUNDATIONS §4 Parallel derivation and mutual assurance](../FOUNDATIONS.md#parallel-derivation-and-mutual-assurance)
requires separately (P6, P3). Membership in a plan authenticates nothing,
an unauthenticated result satisfies no required assessment, and a result
bound to another subject satisfies no planned assessment
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results));
no cryptographic or transport protocol is prescribed for the binding (P6). Any post-exposure revision is a declared intervention: it
is either a method constituent with its own qualification boundary or a new
qualification subject, and it cannot retroactively make the original
frozen construction pass. This law prescribes no actor type or count,
review-round count, engine, prompt or orchestration (P6).

Author identity is the party responsible for the content of a realised
subject. It is distinct from actor identity, whoever performs one
operation, which is an identity and not an authority
([FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds)).
Authorship is one of the conditions on
which the independence of an assessment rests; the evidence conditions are
the other (P6, P3).

Reporting a defect, supplying a counterexample or identifying behaviour
already required by governing law does not by itself author the realised
subject. Contributing wording, design or policy that is adopted into the
subject, including through directions for a particular repair, is authorship
of that contribution. A
reporter may assess a later repair only when the existing assessment grant,
authorship relation and evidence-independence conditions permit it; a
reporter gains no review authority from having found the defect. A person
who authored an adopted repair cannot supply its required independent
assessment by calling that authorship a finding (P6, P3).

Independence rests on authorship and on the evidence conditions above, not
on a new context. The assessor may read the same governing sources as the
constructor. A fresh context alone establishes no independence, and it
supplies no review authority the author lacks: an author that opens a
fresh context to review its own candidate is still its author, and its
review is self-review, which stays construction output and cannot be
relabelled as independent assessment (P6;
[TICKETS UP-007](../TICKETS.md#execution-and-verification-authority-separation-up-007)). A contribution received from another author stays that
author's wherever it is carried, and that author's reading of it supplies
no independent acceptance of it (P6).

Independence across actor families is declared, not assumed. Whether two
activations of one model family are independent for a semantic judgment is a
policy the governing basis states for the claim; the default where it is not
stated is that they are not independent.


Source: AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-018 Structural and semantic separation

The separation of structural conformance from semantic fidelity, and the
rule that structural success is evidence for semantic review and no
substitute for it, are [EVALUATION §2](../EVALUATION.md#2-separation)'s,
which owns them for every review. This law binds them to `a_c`: the
structural conformance of a model covers its closed syntax, types,
identities, references, bases and mechanically decidable predicates, and
the semantic fidelity of an interpretation covers its meaning and
materiality (P1, P6).


Source: AXIOMATIC_CALCULUS.md#ac-019-valid-model sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-019 Valid model

A model `M_b` is a valid model of `a_c` under signature `Sigma`, written
`M_b satisfies a_c[Sigma]`, only when (P6, P1):

1. `Sigma` and the exact `a_c` basis resolve;
2. every record satisfies AC-001 through AC-009;
3. every claimed closure, projection, overlay, transformation, judgment
   and composition satisfies its applicable law;
4. interpretation fidelity and residual dispositions bind the exact
   subject;
5. structural evaluation and semantic acceptance remain distinct and both
   required where claimed; and
6. all evidence, provenance, invalidation and re-entry coordinates
   resolve.

A checker may decide the structural subset. No generic checker may claim
the semantic or authority subset unless the model supplies an exact lawful
decision contract for it (P6, P1).


Source: ACTIVATION.md#effects sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Effects

An effectful step's intended external effect has one of three values,
mapped for the predicate "the intended effect occurred", that is, the
declared outcome of the effect is attained. The value turns on what the
admitted evidence establishes about that outcome (P5 with the open-world
premise, P6):

| Value | Core value | Ground |
|---|---|---|
| `completed` | satisfied | evidence about the subject establishes that the intended effect occurred in full and that the effect has ended |
| `not_effected` | falsified | evidence about the subject establishes that the declared outcome is not attained and that no later completion of the effect can attain it, for example where no effect began, the effect ended short, an interval that the declared outcome bounds has closed with part of it not done, or the part already done has itself made the declared outcome unattainable, as when it destroyed what the outcome needed; any part that did occur is named with the value |
| `completion_unknown` | indeterminate | neither of the other values is established: the evidence cannot decide whether the intended effect has occurred or will occur, as for a request whose response was lost with no counterexample observed; or the evidence shows the intended effect in full while the effect may still be acting, and the outcome stays undecided until what the effect leaves on the subject is settled; its residual names the observation that would decide |

`not_effected` requires evidence about the subject. A lost response, an
absent record, or an actor's context that holds no trace of the effect is
not that evidence, and the value stays `completion_unknown`.
`completion_unknown` never maps to `completed` or to `not_effected`.

Whether the effect has ended is a second question beside the predicate
above, and it enters the value only as a conjunct of `completed`. An
effect has ended where evidence about the subject establishes
that it no longer acts on the subject or that it never began. Where an
effect began and the evidence does not establish its end, the end is not
established, and that is recorded beside the value as a residual naming
the observation that would establish it. The end never decides a
`not_effected` value and is never folded into one: when an interval that
the declared outcome bounds has closed with part not done, the value is
`not_effected` while the effect may still be acting. The residual does
not weaken the counterexample, and the counterexample does not resolve
the residual. `completed` alone requires the end established, so a
counterexample stands without proof that the effect has ended, while
success is never claimed for an effect that may still be acting
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Standing).

An effect of uncertain completion is one whose value is
`completion_unknown`, or whose value is `not_effected` with its end not
established. §5 reconciles it, sufficiently for the next dependent
action, before any repetition or dependent action. A `not_effected`
value licenses neither treating the effect as absent nor repeating it
while its end is not established.

The refinement's material relation is whether an action whose
external effect may have occurred is repeated or relied on; §4 names a
lost post-effect response as a case that no added core value solves, and
this refinement records it in the existing core. Keeping the end of the
effect beside the value keeps two facts that one value would merge: a
counterexample already established for the declared outcome, and an
effect that may still be acting.


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


Source: AXIOMATIC_CALCULUS.md#foundation-to-law sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf rows=1/19 selected by the anchors this frame carries; the consumers paragraph of 19 items is omitted

### Foundation to law

This member is material family F9, the `a_c` calculus. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. Instance premises,
which the commitments do not supply:

- (i) a governed symbolic system is represented by a finite model whose
  records stand for its objects, relations, constraints, residuals,
  traversals, transformations and judgments;
- (ii) a model is interpreted from an exact subject and may be encoded in
  a carrier, and subject, model and carrier are separately identified;
- (iii) some predicates over a model are decided mechanically, and others
  need bounded probabilistic construction or explicit human adjudication.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P1 (independent), P6 (independent), P4b (derived from P0 and P2); (ii), (iii) | By P1 an interpretation is a proposal about meaning, by P6 its acceptance is separate, by P4b its provenance persists, and by (ii) and (iii) models are interpreted from exact subjects and partly checked mechanically, so an interpretation proposes a model that its construction does not accept; every admitted record has exact provenance or is identified as model-local, every evaluated subject declaration has a disposition, structural success is evidence for semantic review and never a substitute, and a valid model satisfies every applicable law | [§6](../AXIOMATIC_CALCULUS.md#6-interpretation-and-models), [AC-017](../AXIOMATIC_CALCULUS.md#ac-017-interpretation-fidelity), [AC-018](../AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation), [AC-019](../AXIOMATIC_CALCULUS.md#ac-019-valid-model) | the interpretation contract and the semantic selection and acceptance authority: the downstream authority of the subject; a decision contract for a semantic subset: the model that supplies it | 6, 10 |

Purpose and material relation: an actor
started on this member sees which rules of the calculus follow from the
foundations and which are choices, with the owner of each choice, so no
choice is presented as derived (P6, P1).


Source: EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=6/17 selected by the anchors this frame carries; the consumers paragraph of 17 items is omitted

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
| P1 (independent), P6 (independent), P3 (independent) | Structural conformance decides closed syntax, types, identities, references, bases and mechanically decidable predicates; semantic fidelity decides meaning and materiality. A checker decides the structural subset and claims a semantic or authority subset only under an exact lawful decision contract. A valid parse, a valid map, a green test and a historical judgment each establish exactly their own claim, and evidence bound to another basis is excluded, not admitted with a narrower scope | [§2](../EVALUATION.md#2-separation), second paragraph | each decision contract under which a checker decides a semantic subset: the model that supplies it ([AXIOMATIC_CALCULUS §6](../AXIOMATIC_CALCULUS.md#6-interpretation-and-models)) | 6, 8, 9 |
| P6 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated); instance premise c | By P6 assessment is a separate authority from construction, and by P0 and (c) a step's output is a fallible candidate until evaluated, so a constructor's self-review is construction output, not assessment; where promotion needs independent assessment, the assessor evaluates the exact live subject, authority paths, proof and installed state, not the constructor's summary | [§3](../EVALUATION.md#3-independent-assessment), first paragraph | the boundaries at which this method requires independent assessment: the Spec Method policy at [TICKETS, UP-007](../TICKETS.md#execution-and-verification-authority-separation-up-007); further boundaries: the governing basis of each promotion | 7, 9 |
| P6 (independent), P3 (independent); instance premise c | By P3 a judgment binds the exact subject it read, and by P6 and (c) the assessor's judgment must be its own, so assessment binds an exact subject: frozen by identity before material reference exposure where method qualification applies, and otherwise stabilised by an immutable identity or an equivalent exact-subject relation sufficient for the claim, never a mutable working tree; the assessor makes no repair and does not assess its own authorship. Shared mechanical evidence may be reused; the constructor's judgment may not. A revision after exposure is a declared intervention or a new qualification subject, and cannot make the original frozen construction pass retroactively | [§3](../EVALUATION.md#3-independent-assessment), Protocol | recording the assessor's expectations from the governing source before it opens the candidate: a policy choice of this section; actor type and count, review rounds, engine, prompt and orchestration: the governing authority, through the configuration of [ACTIVATION §1](../ACTIVATION.md#configuration); policies of this section: the assessor makes no repair, and a revision after exposure is a declared intervention or a new qualification subject; where the freeze applies: method qualification (§7) | 2, 7, 9 |
| P6 (independent); instance premise c | By P6 independence is a relation between the author and the assessor, and by (c) an author's judgment is fallible in a way that persists across its contexts, so independence rests on authorship and the evidence conditions, not on a new context, and the assessor may read the constructor's governing sources. An author that opens a fresh context to review its own candidate is still its author; its review stays self-review and cannot be relabelled as independent assessment. Independence across actor families is declared, not assumed | [§3](../EVALUATION.md#3-independent-assessment), the last two paragraphs | whether two activations of one model family are independent for a semantic judgment: the governing basis of the claim; the default where it is silent, that they are not: this section | 7, 9 |
| P6 (independent), P3 (independent); instance premise c | Self-review is construction output (P6), and identities are scoped by kind (P3), so the party whose self-review is excluded must be identified apart from whoever performs an operation: author identity, the party responsible for the content of a realised subject, is distinct from actor identity, and independence is judged against the author | [§3](../EVALUATION.md#3-independent-assessment), the author-identity paragraph | none | 2, 9 |

The core result a review returns for each evaluated predicate, the rule
that a planned predicate not evaluated has no result, and the projection of
the triage payload over the core values (§4) apply the core result algebra;
they are traced in family F3 at
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), and the rows above trace
what §4 decides about the review record, triage and returns.


Source: EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=0/13 selected by the anchors this frame carries; the consumers paragraph of 13 items is omitted

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

CONFORMANCE §1 to §4 list the cases, which are the choices named in the
last two rows; its §5 maps the method discriminators to cases and
logical-review checks.


Source: SPEC_METHOD.md#foundation-to-law-chain-outcome-and-build-tenant-binding sha256=c7b83b2b7e8c9a301d2e535fc3752c08f718d9fc679e32f8a91c15c285976e8e rows=3/13 selected by the anchors this frame carries; the consumers paragraph of 13 items is omitted

### Foundation to law: chain, outcome and build-tenant binding

This family (F10 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law))
decides how a product's specification governs its realisations. Its
instance premises, which the commitments do not supply, are named in the
rows as follows: owned layers, a product has a selected outcome and an
owning authority for each layer of its specification; layered surfaces,
its specification is written as layered surfaces that actors interpret;
several realisations, one specification may have several realisations,
which change over time; immutable releases, a release is an immutable
identity. Standing of the commitments cited (FOUNDATIONS §3): P0
recovered; P1, P2, P3, P4a and P6 independent; P4b derived from P0 and
P2, with P0's premise that step-produced facts are not re-acquirable; P5
derived from P0 and P6, with P0's open-world premise.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P2 independent; P1 independent; P6 independent; instance: several realisations | By P2 obligations follow the outcome, not the means, so the same obligations may be realised by different means, and the obligations decide fitness. By P6 executing an operation is not adjudicating it, so the kind of executor alone neither accepts nor rejects a realisation, a person performing an operation does not thereby adjudicate, and a convenient stack weakens no obligation; by P1 a representation that validates structurally is not thereby executed correctly. Only an obligation's owner can weaken it (P6), so a change that needs a weaker obligation is a change to the WHAT at its owning layer. | [§11](../SPEC_METHOD.md#11-build-tenant-binding), rules 1, 2, 4 and 6, and Application in this method | the division of a binding into requirements calculus, computational calculus and execution environment: a domain choice of this member; each tenant's calculus and environment: that tenant's design | 4, 8 |
| P0 recovered; P1 independent; P2 independent; P4a independent; P6 independent; P5 derived; instance: several realisations | By P0 and P5 a binding's results must be evaluable by a finite actor, so a binding identifies its operations, their outcome values mapped into the core, and resource measures with units and boundaries. By P4a a calculus composes by its declared laws, so it may serve wherever its laws hold, whoever executes it. By P6 a project's mechanics for developing several tenants are that project's own law. | [§11](../SPEC_METHOD.md#11-build-tenant-binding), rules 3 and 5, and Development of several tenants | which resources are measured, the limits on them, and their units and boundaries: each tenant's binding, as its obligations require, under the resource-limit law of [ACTIVATION §6 Resource limits](../ACTIVATION.md#resource-limits); the development mechanics: the project's product definition or the tenant's design | 3, 8 |
| P1 independent; P0 recovered; P4a independent; P6 independent; instance: several realisations | By P1 and P4a the steps of a construction, what its data means and how it is carried out are separately declared, so they stay three separate accounts across the binding. A mapping from one account to another is a transformation, so it states and discharges its preservation under the law of [ACTIVATION §4 Refinement](../ACTIVATION.md#refinement) and, where it is recorded in a_c, of [AC-013](../AXIOMATIC_CALCULUS.md#ac-013-transformation). | [§11](../SPEC_METHOD.md#11-build-tenant-binding), rule 7 | which accounts a mapping joins, and the evidence that discharges its preservation in the environment: each tenant's binding; the three accounts of a construction: an added choice owned by [FOUNDATIONS §2 Accounts of a construction](../FOUNDATIONS.md#accounts-of-a-construction) | 6, 8 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §3, §6 and §9 to §11. §1 Canonical statement
decides nothing of its own: each clause names its owning section. §8
binds the step of ACTIVATION to this method's terms; its delivery
priority is accounted for by family F5 at ACTIVATION §6, and the rest of
it by family F2 at ACTIVATION §1, whose paragraph after its table names
the rows §8 applies and the families that trace its statement of the
step's results and its use of the tenant's binding.


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
| P5 derived; P6 independent; P2 independent; instance: reserved decisions | By P5 an ambiguity left unrecorded would be read as resolved, so major ambiguity at a boundary is detected and recorded with its outcome, and no dependent claim rests on an ambiguity that is carried, escalated or blocked as if it were resolved. By P2 whether it blocks depends on the risk the outcome bears, so it is policy, and by P6 a hard stop holds whatever the policy. | [§5](../SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle); [Spec-drivenness litmus](../SPEC_METHOD.md#spec-drivenness-litmus) item 12 | the risk appetite, which sets the threshold between probabilistic decision and human adjudication: the project's declared policy; the order of narrowing, the major and micro split and the two concept identities: domain choices of this member; the hard-stop classes: [ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement) | 6, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §4, §5 and §7.

