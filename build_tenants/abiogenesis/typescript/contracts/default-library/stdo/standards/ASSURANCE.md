# ASSURANCE

Tier 2. Owns the assurance and testing law of the method: the verification
layers of the chain, the testing strategy taxonomy with its two proof
authorities and its fixture and proof portability rule, test authority,
scenario bundles, installed dev proof, significant path coverage, the
product testing frame set, combinatorial coverage and testing value,
legitimate-path and technical-debt erasure, testing evidence composition,
assurance subject acquisition, counterexample localisation and the
end-to-end interface integration frame. Its family table (F14) is §1
Foundation to law.
Consumes [FOUNDATIONS](FOUNDATIONS.md) (§2 claim, evidence, judgment,
authority; §4 [Results](FOUNDATIONS.md#results), the core result algebra,
and [Conjunction of results](FOUNDATIONS.md#conjunction-of-results)),
[REFERENCE_FRAME](REFERENCE_FRAME.md) (the frame, its declaration shape,
frames in conjunction, translation and coverage),
[EVALUATION](EVALUATION.md) (claims, separation, independent
assessment, acceptance, conformance) and [ACTIVATION](ACTIVATION.md)
(§1 applicability and the execution relation, §6 proportionality, §7
reuse); adds no definition to tier 1. The particular
method's chain and change classes are [SPEC_METHOD](SPEC_METHOD.md); the
project's bindings are [PRODUCT_DEFINITION](PRODUCT_DEFINITION.md). The
design profile's module-derived unit-proof law (its 6A to 6C) is §14 to
§16, and the ticket law's test-case authority is
[TICKETS §7](TICKETS.md#test-case-authority); this text pre-empts neither. The testing frames and
interface-integration law are §7 to §13; the profile that maps engagement roles and specialist
families onto them is [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md), tier 3,
and nothing here depends on it. Every clause names the principle that
requires it (P0 to P6, FOUNDATIONS §3).

## 1. Verification layers

Each layer of the chain ([SPEC_METHOD §2 Constitutional chain](SPEC_METHOD.md#constitutional-chain)) preserves a distinct kind of truth
(P2, P6):

| Layer | What it preserves | Primary question answered |
|---|---|---|
| Requirements | invariant truth | what must be true? |
| Design | structural choice | how is that truth realised? |
| Scenarios | operational meaning | can the realised system actually do the claimed thing? |

Without scenarios a capability can appear covered because the words exist
in requirements and design. Scenarios force the sharper question: can the
product really do the thing? A requirement can name a reusable composable
unit and a design record can describe the types that realise it, but only
a scenario asks whether a user can build such a unit and apply it twice
(P6).

Scenarios are the product-owner layer: concrete, end-to-end use cases that
validate the chain from intent to realised behaviour. While no scenario
for a capability can be written, its operational meaning is unverified;
that alone does not show whether its governing claim is inadequate or the
means to state or observe its expected outcome is missing, and diagnosis
under [ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation)
locates the cause. When a scenario fails, its observed outcome disagrees
with the scenario's expected outcome, which no comparison of the
specification's words with its other words could show. That report is an
observation, so it shows that actual behaviour disagrees only where its
observation binding is supported
([FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation)).
The failure alone does not show whether the realisation, the governing
claim, the scenario's expected outcome or its observation is wrong;
[§12 Counterexample localisation](#12-counterexample-localisation) locates
the cause as far as the evidence supports (P2, P6).

Scenarios do not replace requirement categories. They primarily validate
capability claims and other behaviour with concrete operational meaning.
Constraints, governance rules and verification-infrastructure requirements
may require different evidence in addition to, or instead of, end-to-end
scenarios (P2).

### Foundation to law: assurance and testing

This family (F14 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides what evidence proves a claim about a realised product and how
that evidence is organised. Its instance premises, which the commitments
do not supply, are named in the rows as follows: runnable product, a
product's realisation can be executed or observed, in a source form and in
a deployed, installed or otherwise runnable form, to produce evidence;
composition, a product is composed of modules, interfaces and owners along
causal paths, so its claims range from one module's law to a user's
outcome; users, some claims are about outcomes a user obtains through the
product's supported surfaces; external boundaries, a product or its proof
may depend on workers, transports or fixtures outside its source boundary;
designed modules, a design profile may govern a realisation boundary and
declare module ownership. Each commitment's standing is written as the
table of commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P2 (independent); P6 (independent); instance: runnable product, users | By P6 each layer keeps its own authority, so requirements, design and scenarios preserve distinct truths. By P2 a capability matters as the use it serves, so while no concrete scenario for it can be written its operational meaning is unverified and diagnosis under [ACTIVATION §1](ACTIVATION.md#construction-relation) locates the cause, and a failing scenario is operational evidence that its observed outcome and the expected outcome disagree; by P6 that evidence shows a disagreement of actual behaviour only where its observation binding is supported, and [§12](#12-counterexample-localisation) locates its cause; scenarios do not replace the evidence other kinds of requirement need. | [§1](#1-verification-layers) | the three layers and scenarios as the product-owner layer: domain choices of this member; the layers of the chain: [SPEC_METHOD §2 Constitutional chain](SPEC_METHOD.md#constitutional-chain) (family F10); diagnosis: [ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation) (family F2); the observation binding: [FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation) (family F3) | 1, 5, 9 |
| P6 (independent); P2 (independent); P1 (independent); instance: runnable product | By P6 a proof has authority only through what authorises it, so every executable proof surface declares its authority source, and its expected results derive from that authority, never from current implementation behaviour. By P1 and P2 a name or breadth of execution carries no authority, so breadth of execution is not authority, and a project's lane names map back to one taxonomy before closure is claimed. | [§2](#2-testing-strategy-taxonomy) | the two primary authorities, design or module conformance and UAT, the product-assurance bounded context and the terminology list: domain choices of this member; each project's lane names: that project, mapped back here | 4, 9 |
| P6 (independent); P1 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: runnable product, users, external boundaries | By P6 acceptance needs evidence of the claim itself, and by P1 a substitute is not the thing substituted, so acceptance evidence comes only from the composed product form exercised through its declared surfaces, and a substituted external worker or transport proves only the relations exercised. By P5 a claim about the real boundary is undecided without evidence that crosses it, so narrower green lanes are necessary and not sufficient for it. | [§2](#2-testing-strategy-taxonomy), the sandbox paragraphs; [§7 User-acceptance frame](#user-acceptance-frame), last paragraph | the sandbox lane and its harnessed and live modes: domain choices of this member | 8, 9 |
| P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: external boundaries | By P3 a lane binds an exact source boundary, so a required closure lane is reproducible from it: an external dependency is checked in, declared with its acquisition rule, or the lane is classified outside required closure. By P5 a missing fixture means the evaluation was not performed, so it is reported as such, never as a product semantic failure. | [§2 Fixture and proof portability](#fixture-and-proof-portability) | the three admissible forms: domain choices of this member | 8, 9 |
| P6 (independent); P2 (independent); instance: composition | By P6 a proof needs written authority, so every live requirement's proof rests on written, traceable test-case authority. By P2 a behaviour claim is about use, so where a requirement claims meaningful behaviour the proving surface should be an ordered sequence through a coherent use; an undeclared path leaves coverage unjudgeable and an unexercised one leaves the behaviour unproved, so the significant paths are declared and exercised. | [§3](#3-test-authority); [§4](#4-scenario-bundle); [§6](#6-significant-path-coverage) | the scenario bundle and the five usual significant paths: domain choices of this member; the derivation of each test case from admitted work: [TICKETS §7](TICKETS.md#test-case-authority) (family F13) | 1, 5, 9 |
| P6 (independent); P3 (independent); instance: runnable product | By P3 a claim about an installable system binds its installed form, and by P6 a source-level check is evidence of another subject, so the decisive proof runs against an installed development form as an external target, and source-level checks do not replace it. | [§5](#5-installed-dev-proof) | the preference for a fresh sandbox, at "should": a policy choice of this member; the install and development-product roles: [FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects) (family F15) | 8, 9 |
| P0 (recovered); P6 (independent); P1 (independent); P4a (independent); instance: composition | By P0 a finite actor evaluates one bounded claim at a time, and by P4a results combine only through declared relations, so where testing frames are selected, testing is a claim-relative set of frames, each bound to one exact claim, subject, path, population, oracle and falsifier, and every result stays bound to its claim. By P1 and P6 a label, runner, count or coverage measure confers no assurance, so a broader frame cannot make a narrower law true, and narrower green results cannot establish an unevaluated broader claim. | [§7](#7-product-testing-frame-set), Terms and The set; [§10](#10-testing-evidence-composition) | the four ordinary frames and their declarations: domain choices of this member; selecting the set for a claim: the governing frame configuration ([PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)) or the admitted work authority; the mapping of engagement roles onto the frames: [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md) (family F16) | 3, 7, 9 |
| P6 (independent); P3 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: runnable product, composition | By P3 a path claim binds the exact path, and by P5 an absence is shown only by evidence, so a product path claim needs two-sided evidence: the required path witnessed through the supported ordinary path, and each forbidden path absent or refused, in the production graph and in the assurance graph. By P6 equal output is evidence of output, not of path, so equal output through a forbidden path falsifies the path claim. | [§7 Terms](#terms), authoritative Product path; [§9](#9-legitimate-path-and-technical-debt-erasure) | path-sensitive mutation where proportionate and safe: a policy choice of this member | 4, 9 |
| P2 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P4a (independent); instance: composition | By P2 a test's value is what it decides for the claim, so testing value is the material combinations a frame discriminates for its claim, not a count. By P5 an omitted interaction is undecided, so a reduced covering set is lawful only with a reason why the omitted interactions cannot change the claim, or with them kept as residuals; by P4a and P6 code coverage shows only what was visited. | [§7 Terms](#terms), material combinatorial complexity; [§8](#8-combinatorial-coverage-and-testing-value) | the eight index terms and the nine product factors: domain choices of this member; any scalar score: Product, requirement or accepted-design authority | 3, 9 |
| P6 (independent); P1 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: runnable product | By P6 the owner issues the subject, and by P1 a reconstruction is not the subject, so the assurance subject is the owner-issued subject, acquired through its owner surface, and an evaluator never builds a parallel owner state and evaluates it as the product. By P5 a missing owner projection leaves its claim undecided, so it stays a named gap. | [§11](#11-assurance-subject-acquisition-and-evaluation) | none | 6, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise); P1 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance: composition | By P5 a counterexample locates only as far as its evidence supports, and by P4b it persists until disposed, so it is returned to the earliest causal frontier the evidence supports. By P1 the four forms mean different things, so a unique locus, a joint set, unresolved alternatives and an unbounded frontier stay distinct, each read as one core value; localisation authorises no repair. | [§12](#12-counterexample-localisation) | the four localisation forms: domain choices of this member; any resulting change: the re-entry of [SPEC_METHOD §4](SPEC_METHOD.md#4-change-management) (family F11) | 3, 9 |
| P0 (recovered); P1 (independent); P4a (independent); P5 (derived from P0 and P6, with P0's open-world premise); P6 (independent); instance: composition, users | By P0 and P4a each seam is a separately declared relation, so across an interface chain contract sufficiency, boundary congruence, path realisation and user usability are distinct claims with distinct results, and a full usability claim needs all four and their conjunction. By P1 and P5 a seam is evaluated only on its own coordinates, so each seam binds its domains, available context, translation, current observation, actual path and diagnostic cause; by P6 diagnosis grants no repair, and a complete-path result is not replaced by local successes. | [§13](#13-end-to-end-interface-integration-frame), Claim boundaries, Obligations and Computational whole-path evaluation | the frame identity, its twelve elements, the four claims, the six obligations and the ten qualification cases: domain choices of this member; activation: the governing frame configuration or admitted work authority; the family names: [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md) (family F16); computational realisation and recurrence law: [DESIGN_MODULE](DESIGN_MODULE.md) (family F17) | 4, 7, 9 |
| P6 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P2 (independent); instance: designed modules | By P6 the accepted ontology, design and module boundary are the authority for a designed module, so where a design profile governs a boundary, implementation and unit tests derive from them, and evidence feeds back without selecting the semantic answer. By P4b and P2 module proof needs a record that traces to the module's ownership, so module-owned unit tests are authoritative for module proof and should trace to module ownership, not helper shape, and a module without that lane is not closure-ready. | [§14](#14-design-to-module-evidence-route); [§15](#15-module-derived-unit-tests) | the two evidence chains, the completeness requirements and the traceability sources: domain choices of this member; the binding of the written terms to the profile's objects: [DESIGN_MODULE](DESIGN_MODULE.md) (family F17) | 4, 9 |
| P2 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: designed modules | By P2 every lifecycle phase of a designed surface bears on its outcome, and by P5 an unanswered phase is undecided, so before closure each phase is answered, declared not applicable with a reason, or recorded as a named gap. By P6 implementation proves a lifecycle path only within its own authority, and a gap proceeds only when governed. | [§16](#16-module-lifecycle-confirmation) | the nine stated items: domain choices of this member; the lifecycle chain and its markers: [SPEC_METHOD §2 Operational lifecycle sufficiency](SPEC_METHOD.md#operational-lifecycle-sufficiency) (family F10) | 1, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §16.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the verification layers: no separate consumer applies. The layers are applied inside this member, by §2 to §6, which the rows below trace; [SPEC_METHOD §9](SPEC_METHOD.md#9-evidence) names §1 to §6 as the rules of realisation proof and applies none of them to a case, and EXECUTIVE_BASELINE §2 names this member as the owner of the taxonomy and states no application of §1.
- Row 2, the authority source of a proof surface and the lane mapping: [DESIGN_MODULE §6 Irreducible architectural carrier set](DESIGN_MODULE.md#irreducible-architectural-carrier-set), the carrier inventory to which design and module conformance tests bind; this member's [§15](#15-module-derived-unit-tests), which keeps module-derived unit proof within the product-assurance bounded context and leaves acceptance meaning with Product authority.
- Row 3, acceptance evidence from the composed product: this member's [§13 Obligations](#obligations), where a live claim needs live evidence under §2; otherwise no separate consumer applies: which lane a project runs is its assurance design, and the acceptance decision that consumes the evidence is EVALUATION §5's and RELEASE §8's, which apply the claim law of EVALUATION and name these paragraphs nowhere.
- Row 4, fixture and proof portability: no separate consumer applies. A lane's external dependencies are declared by the project's assurance design under this paragraph; a missing fixture is reported as an evaluation not performed, in the core value of FOUNDATIONS §4 Results that this paragraph applies; no section of another member names it.
- Row 5, test authority, scenario bundles and significant paths: [TICKETS §7 Test case authority](TICKETS.md#test-case-authority), the ticket-local rule of the general test authority law; [SPEC_METHOD §4 Consistency gate](SPEC_METHOD.md#consistency-gate), where implementation behaviour is evidence and not authority and the test authority rule is this member's.
- Row 6, installed dev proof: [ODD §13](ODD.md#13-installed-dev-rule), which binds the rule for its profile; the install and development-product roles are FOUNDATIONS §2 Product lineage objects', as the choice column states; which installed form a claim binds is the claim's own.
- Row 7, the testing frames and evidence composition: [EXECUTIVE_BASELINE §1](EXECUTIVE_BASELINE.md#1-canonical-compression), where the four frames are activated inside the engagement relation and no narrower green frame establishes an unevaluated composition; [§5 Terms owned by ASSURANCE](EXECUTIVE_BASELINE.md#terms-owned-by-assurance); [§8 Steel-thread delivery](EXECUTIVE_BASELINE.md#steel-thread-delivery), where unit evidence covers module-owned laws under the frames and the frames keep their distinct claims; [§11 Relation to the testing and interface frames](EXECUTIVE_BASELINE.md#relation-to-the-testing-and-interface-frames); [§12 step 2](EXECUTIVE_BASELINE.md#2-executive-activates-worker), whose activation names the testing claims, subjects, topology and populations, and [step 4](EXECUTIVE_BASELINE.md#4-executive-evaluates-the-work-result), where a missing or contradicted frame result is read under §10; [§14](EXECUTIVE_BASELINE.md#14-coverage-application), whose rows for the user outcome, the installed path, material interfaces and module-owned laws name the frames; [§16 Adopt this baseline](EXECUTIVE_BASELINE.md#adopt-this-baseline), whose inventory the adoption declares; [§18](EXECUTIVE_BASELINE.md#18-profile-qualification), obligations 12 to 15; this member's [§13](#13-end-to-end-interface-integration-frame), which relates its families to the frames of §7, and [§15](#15-module-derived-unit-tests), whose lane claims, and leaves unclosed, what the unit frame of §7 states.
- Row 8, path claims: [EXECUTIVE_BASELINE §5 Terms owned by ASSURANCE](EXECUTIVE_BASELINE.md#terms-owned-by-assurance), for the authoritative Product path; [§12 step 2](EXECUTIVE_BASELINE.md#2-executive-activates-worker) and [§16 Adopt this baseline](EXECUTIVE_BASELINE.md#adopt-this-baseline), whose activation and inventory carry the forbidden-path exclusions; [§14](EXECUTIVE_BASELINE.md#14-coverage-application), whose row for obsolete and rival paths names the production-closure and assurance-closure graphs; [§18](EXECUTIVE_BASELINE.md#18-profile-qualification), obligation 13, where an end-to-end frame falsifies an equal output obtained through a forbidden path.
- Row 9, testing value and combinatorial coverage: [EXECUTIVE_BASELINE §5 Terms owned by ASSURANCE](EXECUTIVE_BASELINE.md#terms-owned-by-assurance), for material combinatorial complexity; [§12 step 2](EXECUTIVE_BASELINE.md#2-executive-activates-worker) and [§16 Adopt this baseline](EXECUTIVE_BASELINE.md#adopt-this-baseline), whose activation and inventory carry the material combination populations; [§18](EXECUTIVE_BASELINE.md#18-profile-qualification), obligation 14, where omitted higher-order combinations stay residuals; [§20](EXECUTIVE_BASELINE.md#20-failure-classification), where one sunny path reported as combinatorial coverage is an undeclared interaction population.
- Row 10, the assurance subject: [EXECUTIVE_BASELINE §20](EXECUTIVE_BASELINE.md#20-failure-classification), where a harness that derives owner state from raw events beside an installed owner projection is an invalid assurance subject, and [§21](EXECUTIVE_BASELINE.md#21-anti-patterns), items 25 and 27; this member's [§13 Obligations](#obligations), whose evidence acquisition follows §11.
- Row 11, counterexample localisation: [SPEC_METHOD §4 Universal intake triage](SPEC_METHOD.md#universal-intake-triage), where localisation applies to a supported diagnosis where required; [EXECUTIVE_BASELINE §20](EXECUTIVE_BASELINE.md#20-failure-classification), where a symptom assigned to one owner without causal-frontier evidence is unsupported localisation, and [§21](EXECUTIVE_BASELINE.md#21-anti-patterns), item 26; this member's [§1](#1-verification-layers), where the cause of a failing scenario is located, and [§13 Obligations](#obligations), obligation 6, which applies §12 to preserve diagnostic cause.
- Row 12, the interface integration frame: [DESIGN_MODULE §7 Computational realisation projection](DESIGN_MODULE.md#computational-realisation-projection-up-019), where component-local success establishes no complete-path claim; [EXECUTIVE_BASELINE §11 Relation to the testing and interface frames](EXECUTIVE_BASELINE.md#relation-to-the-testing-and-interface-frames), which relates the frame's families to the Executive's generic specialist frames.
- Row 13, the design-to-module route and module-derived unit tests: [DESIGN_MODULE §9](DESIGN_MODULE.md#9-module-taxonomy), where a boundary's modules are proved under this assurance law; [§6 Irreducible architectural carrier set](DESIGN_MODULE.md#irreducible-architectural-carrier-set), the inventory to which unit proof binds; [§12 Adoption](DESIGN_MODULE.md#adoption), where a module-derived unit test lane is published before closure is claimed; [EXECUTIVE_BASELINE §18](EXECUTIVE_BASELINE.md#18-profile-qualification), obligation 15, where every coded module has a module-derived unit lane; [FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance), whose example instantiates the route's paths in acceptance and build-level tests.
- Row 14, module lifecycle confirmation: [DESIGN_MODULE §5 Entity and lifecycle completeness](DESIGN_MODULE.md#entity-and-lifecycle-completeness), which keeps the entity lifecycle apart from the operational lifecycle this section confirms; [§9](DESIGN_MODULE.md#9-module-taxonomy); [§12 Relationship to other members](DESIGN_MODULE.md#relationship-to-other-members), where the rule detects lifecycle signal and decides no release eligibility or acceptance.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Testing strategy taxonomy

This member owns the product-assurance bounded context,
`urn:stdo:bounded-context:product-assurance`, under the selected complete
STDO basis, and within it the Product-level test-authority taxonomy.
Module-derived unit-proof law stays owned by the design profile (the
DESIGN_MODULE member); the shared context does not merge the two authority
sources (P6).

Every executable proof surface declares its authority source (P6). For
ticketed work the immediate proof authority is the admitted ticket and its
triage path: tests derive from the ticket's lawful re-entry point
(SPEC_METHOD §4) and from the governing constitutional or realisation-law
surfaces it cites; they never derive expected results from current
implementation behaviour (P6, P2).

Authority source is not execution breadth. A test may be small or broad,
fast or slow, deterministic or live, and still derives from one of two
primary authorities (P6, P1):

1. design or module conformance tests; and
2. UAT, or acceptance, tests.

Design or module conformance tests derive from realisation authority: the
governing design, module ownership, the carrier inventory the design
declares (the design profile's irreducible architectural carrier set,
[DESIGN_MODULE §6](DESIGN_MODULE.md#irreducible-architectural-carrier-set),
or an equivalent), structural carrier diagrams where present, and boundary-local
fail-closed law. They answer one question: did the implementation realise
the module or design boundary correctly? Unit tests are design or module
conformance tests. Module integration tests, negative tests and
fail-closed tests may also be, when their proof target is a designed module
boundary rather than a user scenario (P6).

UAT or acceptance tests derive from constitutional user or product
authority: requirements, acceptance criteria, declared scenarios or use
cases, and product-level release or qualification claims. They answer one
question: does the composed product satisfy the claimed requirement or
scenario? (P6, P2)

Under this method only sandbox tests, or an explicitly equivalent isolated
composed-product proof lane, may be called UAT or acceptance tests. A
sandbox test exercises the deployed, installed or otherwise runnable
product form through declared application, public, runtime or control
surfaces, and is driven by a requirement-sourced scenario or acceptance
case. Direct source-level unit tests, helper tests and module integration
tests may be valuable proof; they are not UAT and cannot close user
acceptance by themselves (P6; EVALUATION §1, the weaker property never
substitutes for the claimed one).

Sandbox UAT has two lawful execution modes (P6, P1):

- harnessed sandbox UAT exercises the full composed product path with a
  deterministic, fake, recorded or injected worker or result surface; and
- live sandbox UAT exercises the full composed product path with a real
  configured worker, tool, agent, service or other external probabilistic
  transport where the product depends on that live boundary.

Harnessed sandbox UAT proves composition, orchestration, control,
projection, archive and scenario wiring without relying on live
probabilistic execution; it is the lane for deterministic reproducibility.
Live sandbox UAT proves that the same scenario can cross the real external
probabilistic boundary and return evidence through the declared result,
evaluation, provenance and projection surfaces. Where a product or release
claim depends on live probabilistic compute, semantic green, unit green,
module-integration green and harnessed-sandbox green are necessary and not
sufficient for live acceptance (P6, P5).

Terminology (P1):

- `unit` names module or design conformance scope, not user acceptance;
- `integration` names execution breadth, not authority source;
- `sandbox` names composed-product acceptance execution;
- `harnessed`, `fake`, `recorded` or `deterministic` name non-live sandbox
  execution; and
- `live` is reserved for real external worker or transport execution; a
  status projection named "live" is not live UAT unless it crosses that
  real boundary.

A project that uses other local filenames or runner labels still maps each
executable lane back to this taxonomy before claiming closure (P1, P6).

### Fixture and proof portability

Required closure lanes are reproducible from the declared source boundary
(P3, P6). A unit, semantic or
module-design conformance lane does not depend on an undeclared local path,
a sibling workspace, an operator home directory or a mutable external
fixture.

Where a proof needs external project evidence, one of these holds:

- a minimal fixture is checked into the source boundary;
- a fixture manifest declares the external source, version and
  acquisition or binding rule; or
- the test is classified as harnessed sandbox, live sandbox, reference
  comparison or optional local evidence rather than required semantic
  closure.

A missing external fixture fails with a governed diagnostic that names the
fixture authority and the lane; it never masquerades as a product semantic
failure (P5, P6).

## 3. Test authority

Every live requirement has written test-case authority (P6). That authority may include scenario bundles,
ordered test-case sequences, negative or control cases and other explicit
evidence cases appropriate to the kind of truth being proved; it exists in
written form and is traceable. Written authority includes the assertion
provenance of each expected result: the owning obligation, its
interpretation, assumptions, derivation and shared dependencies, and
whether the asserted predicate is the obligation, a necessary condition of
it or part of a sufficient conjunction
([FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation),
[Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance))
(P6). No live requirement is fully proved on
informal operator confidence, ambient habit or an unlabelled test corpus
(P6; EVALUATION §5, green labels are not acceptance). The derivation of
each test case from admitted work authority is
[TICKETS §7 Test case authority](TICKETS.md#test-case-authority).

## 4. Scenario bundle

Features are not proved by isolated assertions alone. Where a requirement
claims meaningful system behaviour, the proving surface should be a scenario
bundle or an equivalent ordered set of test cases that exercises that
behaviour through a coherent sequence rather than as disconnected
fragments (P2, P6).

A scenario bundle shows the feature or use-case boundary being exercised,
the test-case sequence that proves it, and the outcomes expected at each
significant step. It is the layer that makes operational meaning
inspectable (P6).

Declared scenarios and use cases are not downstream decoration. They put
pressure on feature intent and design decisions by forcing the project to
name the real operational boundary, sequence, actors, controls and
expected outcomes that matter. For that reason they are also the best
source for identifying the significant code and control paths the proving
surface must exercise (§6; P2).

## 5. Installed dev proof

Where a system has an installable or runnable development form, the
decisive proving lane runs against an installed development version as if
it were an independent project or an externalised target, not only against
the source tree in place (P6, P3). That
proof should prefer a fresh sandbox or equivalent isolated environment, an
installed or built development artifact, and execution through the same
declared entry, control and runtime surfaces the real product uses. Direct
source-level or unit-level checks may stay useful; they do not replace
installed-dev proof of the system under test (P6; SPEC_METHOD §6 for the
install and development-product roles).

## 6. Significant path coverage

The proving surface declares and exercises the significant paths for the
behaviour being claimed (P6, P2).
Exhaustive proof does not mean every possible branch in every file; it
means the project names the meaningful paths and proves them
intentionally. The significant paths usually include, where relevant:

- the intended success path;
- the fail-closed or rejection path;
- the boundary or control path;
- the integration, dispatch or transport path; and
- the recovery, retry or replay path.

If the significant paths are not declared, scenario coverage cannot be
judged. If they are declared and not exercised, the behaviour is not fully
proved (P6; EVALUATION §1, a claim's scope cannot exceed its evaluated
evidence).

## 7. Product testing frame set

### Terms

A testing frame is a frame (REFERENCE_FRAME §1) whose evaluation executes
or observes a declared subject to discriminate one exact claim through an
explicit oracle, evidence population, path boundary and falsification
condition. A test file, suite, runner, fixture, scenario label, coverage
percentage or actor does not become a testing frame by existing. A testing
frame's authority is bounded by the claim actually exercised; test count,
assertion count, source coverage, runtime duration and framework category
do not widen it (P6, P1).

An authoritative Product path is the declared ordinary causal composition
from a supported user or public entry, through the exact selected
interfaces, owners, state transitions, effects, persistence and recovery
boundaries, to the outcome projection the Product claim requires.
Producing an expected output through a bypass, an obsolete executor, a
test-only seam, an undeclared fallback or a competing authority falsifies
path conformance even when the output value is equal (P6, P3).

Material combinatorial complexity is the claim-relative population of
independent dimensions and interactions whose combinations can change an
outcome, violate an invariant, select another authority path or expose a
failure. At unit altitude it includes module-owned laws, behaviour at the
public module contract included, with their algebraic operators,
calculation regimes, states, transitions, boundary classes and failure
cases. Cross-participant interface, Product, persistence, configuration and
user-role combinations belong to the integration, end-to-end or
user-acceptance frames; they are not mocked away and counted as unit
evidence (P2, P6).

### The set

Where the governing frame configuration (PRODUCT_DEFINITION §7) or the
admitted work authority selects testing frames for a Product promotion,
closure or release-assurance claim, testing is configured as a
claim-relative set of testing frames. Placement in this member makes the
set, and the law of §8 to §13 that serves it, available; it adopts nothing,
and each activation is decided by ACTIVATION §1 (Applicability). The kind
of runner does not select the frame; the evaluated claim, subject, path,
population, oracle and falsification boundary do (P6, P2). Each frame's `invalidation` row,
here and in §13, lists named instances of the material input change or
the changed basis of
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse); it adds no
other kind of invalidator. The ordinary configuration holds four
distinct frames:

- user acceptance evaluates the Product outcome from the user's supported
  frame;
- end to end evaluates the complete runnable causal realisation of that
  outcome;
- integration evaluates one material composition boundary and its
  interaction population; and
- unit evaluates one module-owned law; internal combinatorial complexity
  decides the proportional size and strategy of that evidence, not whether
  the law is eligible for unit proof.

They add no role, stage, authority or testing hierarchy. Their ordinary
evidence topology assigns each claim to its congruent frame (P6, P4a):

```text
Product and accepted design
  |- user-outcome claims -> user-acceptance frames
  |- runnable causal-path claims -> end-to-end frames
  |- composition-boundary claims -> integration frames
  `- module-owned laws -> unit frames

bound results -> declared conjunction -> Product or release disposition
```

The fan-out assigns claims to evidence; it is neither an authority
hierarchy nor a claim that one frame decomposes into another. Evidence
may relate through declared conjunction
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)),
translation (REFERENCE_FRAME §6), falsification and re-entry (P4a). A
broader frame cannot make a module-owned
law true, and any number of narrower green frames cannot establish an
unevaluated Product composition or user outcome (EVALUATION §1, the weaker
property never substitutes for the claimed one).

The frames may overlap, and one execution may supply evidence to several of
them; every result stays bound to its own claim. A label such as `UAT`,
`E2E`, `integration` or `unit` has no assurance value without the
corresponding frame declaration (P1, P6). Each frame below is given in the
shape of a frame declaration (REFERENCE_FRAME §13); "core result", here
and in §13, is a value of the core result algebra of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results), recorded with the
predicate the frame's claim states.

### User-acceptance frame

(P6, P2)

| Frame element | User acceptance |
|---|---|
| evaluation family | Can a declared user, with the user's admitted capability and information, obtain the exact Product-defined outcome through the supported ordinary Product surface? |
| subject and basis | the exact deployed, installed or otherwise runnable Product form the claim names; current Product, requirement, UX, identity, policy and acceptance authority; the declared user role, environment, and harnessed or live sandbox mode (§2) |
| material manifold | user goal, supported entry surfaces, permissions, inputs, Product configuration, ordinary dependencies, any declared external-worker or transport substitution boundary, user-visible state and outputs, refusal and recovery behaviour, and the acceptance interval |
| coordinates | exact Product and artifact identity, install, user role, capability, configuration, dependency realisation, harnessed or live mode, data, workspace, invocation, time, outcome and scenario identity |
| governing invariants | the applicable Product and requirement outcomes; supported-interface, identity, UX, safety, persistence and release law; RF-001 to RF-017; EVALUATION §1, §2, §3, §6 and §7 (proof target, evidence separation, assurance-boundary congruence, freeze and post-exposure revision, comparison, method qualification) |
| authority | bounded evaluation only; the frame mints no Product meaning or acceptance authority, and an automated actor does not become the human or Product acceptance owner |
| evidence | actual supported-surface requests and responses, user-visible projections, durable side effects where claimed, refusals, recovery observations, scenario records, exact-subject identity, and the declared live or substituted dependency identity |
| capability envelope | ability to operate the Product as the declared user would, perceive the material outcome and refusal surfaces, and distinguish hidden setup or unsupported assistance |
| exclusions | source imports, private APIs, direct Product-state injection, test-only endpoints, hidden administrator capability, undeclared fixtures or substitutes, a test double at a boundary claimed as real or live, compatibility bypasses, and internal success substituted for the user outcome |
| result | one core result bound to the exact user-outcome claim, with witnessed paths, counterexamples, residual user populations and invalidation conditions |
| invalidation | a material change of Product, supported interface, user role, capability, configuration, dependency or substitution mode, data contract, runnable subject, acceptance meaning or ordinary path |

User acceptance is the primary Product-outcome evidence frame when the
claim is that a user can use the Product. It may be automated only when the
automation faithfully occupies the declared user frame and gains no path or
capability that user lacks. Automation can execute acceptance evidence; it
cannot assume acceptance authority (P6; EVALUATION §5).

Where harnessed sandbox UAT is admitted (§2), a deterministic, fake,
recorded or injected external worker or transport limits the result to the
composed Product relations actually exercised; it does not prove that the
live external boundary works. When a Product or release claim depends on
real external compute or transport, live sandbox UAT is mandatory for that
claim; unit, integration, semantic and end-to-end evidence that uses the
substitute, and harnessed UAT green, are not sufficient (P6, P5).

### End-to-end frame

(P6, P3)

| Frame element | End to end |
|---|---|
| evaluation family | Does the exact Product subject realise the claimed outcome through the complete authoritative Product path, including every material interface, owner, state transition, effect, persistence, continuation, recovery and projection boundary? |
| subject and basis | the exact deployed, installed or otherwise runnable Product form, the composition design, the supported entry, the selected owner and dependency set, the ordinary runtime configuration and the Product claim |
| material manifold | the complete causal producers and consumers from entry to outcome; interface contracts; authority transitions; state, event, persistence, process, continuation, retry, recovery and projection relations; competing paths |
| coordinates | artifact and installed-tree identity, entry, operation, selected definition and owner, path and edge identities, process, event prefix, state, configuration, dependency, result, replay and scenario identity |
| governing invariants | Product and accepted-design composition law; exact-subject and assurance congruence; path singularity where required; lifecycle, authority, persistence, replay, recovery and release law |
| authority | bounded evaluation only; observation may expose internal evidence but may not bypass, repair, replace or reinterpret the Product path |
| evidence | supported entry invocation, the observed semantic path and authority edges, owner receipts, durable events, state transitions, outputs, replay or reconstruction where claimed, installed artifact identity, and negative-path observations |
| capability envelope | ability to execute and observe the complete Product path without changing it, to tell the authoritative path from rival paths, and to reproduce material state and failure relations |
| exclusions | source-only substitutes for runnable-Product claims, direct invocation below the supported entry, test doubles at claimed real boundaries, test-only routing, hidden retries or repair, omitted persistence or fresh-process boundaries, and equal output without path evidence |
| result | one core result bound to the exact end-to-end claim, with the exercised composition edges, unexercised material paths, counterexamples and residual combinations |
| invalidation | a material change of artifact, install, dependency, configuration, interface, owner, path, lifecycle, persistence, recovery, projection, test semantics or evidence population |

The expected output is necessary and not sufficient. Reaching it through a
forbidden or obsolete path falsifies the end-to-end claim. A test is not end
to end because it starts and finishes in one process, crosses many lines or
carries an end-to-end label (P6, P1).

### Integration frame

(P6, P4a)

| Frame element | Integration |
|---|---|
| evaluation family | Do the actual participants at one declared material composition boundary satisfy their joint contract across the combinations of state, authority, configuration, timing, failure and recovery that can change the boundary result? |
| subject and basis | the exact interface or composition declaration, the actual participating implementations or exact substitutes the bounded claim admits, the governing Product, requirement and design law, and the interaction population |
| material manifold | both sides of the boundary, shared carriers, preconditions, postconditions, authority and ownership, ordering, state, configuration, failure, retry, recovery, translation and competing participants |
| coordinates | participant and version identities, interface and carrier revision, state, configuration, dependency, interaction case, input, output, failure and evidence identity |
| governing invariants | declared interface and composition law, complete participant admission, atomicity and reconstruction where applicable, and the exact assurance boundary (EVALUATION §1) |
| authority | bounded boundary evaluation only; no integration result establishes an unevaluated Product outcome or authorises a substitute participant |
| evidence | actual exchanges, admitted carriers, state transitions, contract verdicts, failures, retries, recovery observations, interaction combinations and participant identities |
| capability envelope | competence and access to exercise and observe the real composition seam, identify participant substitution and vary every material interaction dimension |
| exclusions | mocks or stubs that hide the claimed real contract, one-sided contract assertions, happy-path-only exchange, helper-call equivalence, flattened versions or states, and projection of a boundary result to the whole Product without a governing relation |
| result | one core result for the declared integration claim, with covered combinations, counterexamples, omitted interactions and invalidation conditions |
| invalidation | a material change of participant, interface, carrier, state, configuration, dependency, timing, failure, recovery or interaction population |

A substitute or test double may support a deliberately narrower claim only
when its equivalence boundary and exclusions are explicit. Its result
cannot be promoted to evidence that the real participant or Product
composition was exercised (P6, EVALUATION §1).

### Unit frame

(P6, P2)

| Frame element | Unit |
|---|---|
| evaluation family | Does one module-owned law hold across its material combinations of algebraic operator, calculation regime, state, transition, public or private boundary class, and failure case? |
| subject and basis | one exact module boundary, the accepted ontology and design, the active carrier inventory the design declares, module-owned requirements and public contracts, the implementation, and a module-bounded decidable oracle |
| material manifold | module-owned public contracts, algebras, calculations, parsers, reducers, state machines, transition functions, combinators, admission predicates, conservation laws, invariants, numerical boundaries and failures |
| coordinates | module and implementation revision, owned law, operator or function family, module state, input class, boundary class, expected relation, generated case, mutation and result identity |
| governing invariants | the design profile's module-ownership and unit-proof law (DESIGN_MODULE); the accepted ontology, carrier inventory, domain, sequence, state, algorithm and error relations material to the module |
| authority | bounded local evidence only; a unit result has no Product, installed, integration, user-acceptance, architecture, path-selection or release authority |
| evidence | law-derived examples, equivalence classes, finite exhaustive cases where available, property-based or generative cases, metamorphic relations, calculation or algebra oracles, boundary cases and killed internal mutations |
| capability envelope | competence to derive an oracle independently from the owned law, identify the module-bounded combination population, and tell an invariant violation from an implementation restatement |
| exclusions | Product outcomes, cross-module composition, supported user paths, packaging or installation, real external participants, orchestration topology, mocked-away interface behaviour, incidental branches, private helper layout, assertion count, and source coverage used as broader assurance |
| result | one core result limited to the exact module-owned law and the module-bounded population, with counterexamples, residual combinations and invalidation conditions |
| invalidation | a material change of ontology, carrier inventory, module boundary, owned law, algorithm, state space, numerical regime, implementation, oracle, generator or module-bounded population |

Unit testing is deliberately module-bounded. Every coded module requires
the module-derived unit lane the design profile owns; public module
contracts are valid unit-proof subjects. Internal combinatorial complexity
decides the proportional size and strategy of that evidence. Its highest
discriminating value is often in algebras, calculations, transformations,
parsers, reducers, state machines, decision tables, admission predicates,
conservation relations and bounded algorithms with strong independently
derived oracles. A unit test whose oracle repeats the implementation, or
whose cases follow incidental code branches, gives weak or circular
evidence (P6, P2).

Modules whose material complexity lies mainly in composition,
orchestration, configuration, persistence, ownership or user interaction
need integration, end-to-end or user-acceptance evidence at that actual
boundary. Mocking those relations into a unit test does not turn their
complexity into unit evidence (P6).

This frame does not waive the module-derived unit lane. It binds the lane
to module-owned law and the smallest congruent evidence population. Low
internal combinatorial complexity justifies a small lane, not omission and
not hundreds of implementation-shaped tests. Unit-test volume has no
independent closure value (P2).

No Product, user-outcome, installed-path, cross-module composition or
release claim may be closed from unit evidence, whatever the test count,
assertion count, source coverage, mutation score, runtime or historical
pass rate. Treating unit green as broader assurance is a frame error (P6,
EVALUATION §1).

## 8. Combinatorial coverage and testing value

Testing value is indexed first by the material combinations a frame can
discriminate for its exact claim, not by test, assertion, file, line,
branch, mock, snapshot or runner count (P2, P6). For one claim, the
testing-value index considers at least:

1. congruence between the claim and the evaluated subject;
2. the number and materiality of independent claim dimensions;
3. the interaction strength actually covered among those dimensions;
4. the exactness of the authoritative path;
5. oracle independence and precision;
6. sensitivity to realistic faults, rival paths and historical failures;
7. observability, reconstruction and reproducibility of the result; and
8. explicit residual combinations and invalidation conditions.

No universal scalar is required. A project may define one only through
Product, requirement or accepted-design authority, and keeps the
underlying coverage coordinates rather than flattening them into a score
(P1, P6). A project-defined scalar is a quantified claim under
[FOUNDATIONS §4 Quantified assurance](FOUNDATIONS.md#quantified-assurance)
and keeps its model and limits explicit (P6).

At unit altitude the relevant dimensions are module-bounded. Unit-testing
value normally rises with the internal combinatorial complexity of an
algebra, calculation, state machine, transition relation or other
module-owned closed domain, because local tests can cheaply discriminate
many meaningful combinations against a precise oracle (P2).

At integration, end-to-end and user-acceptance altitude, testing value can
be multiplicative rather than additive: each material interface composes
preconditions, postconditions, authority, state, configuration, failure and
recovery with every other traversed boundary. The value comes from the
interactions actually discriminated, not from touching many interfaces on
one sunny path (P4a, P2). Material Product factors commonly include:

- user role and capability;
- supported operation and Product composition;
- selected definition, owner, implementation and dependency;
- lifecycle and persisted state;
- configuration and version combination;
- process, continuation, retry, re-entry and recovery mode;
- success, refusal, malformed result, partial failure and competing-path
  case;
- fresh-process, replay, reconstruction and migration condition; and
- user-visible outcome and projection.

The activated frame declares the finite interaction population and why its
covering set is adequate. Pairwise or other covering-array reduction is
lawful only where the basis explains why the omitted higher-order
interactions cannot change the claim, or keeps them as residuals.
High-consequence authority, persistence, concurrency, recovery, migration
and historically failure-prone relations normally need explicit
higher-strength combinations (P5, P2; REFERENCE_FRAME §8, interaction and
failure coverage).

Source, line, branch and function coverage may diagnose whether code was
visited. They do not establish semantic combination coverage,
authoritative path selection, user-outcome coverage or the absence of a
rival path (P6, P1).

## 9. Legitimate path and technical-debt erasure

Every Product path claim needs two-sided evidence (P6, P3):

1. required-path reachability: each required authoritative composition has
   an exact witness in the deployed, installed or otherwise runnable
   Product form through the supported ordinary path; and
2. forbidden-path exclusion: each material superseded, duplicate,
   fallback, bypass or otherwise forbidden production path is absent,
   unreachable or refused at its declared boundary.

A successor passing does not prove the predecessor removed. Technical-debt
erasure evaluates two distinct, finite, subject-relative graphs (P3, P6):

1. production closure: the exact deployed, installed or otherwise runnable
   Product form and configuration, with its transitive imports, exports,
   package paths, configuration switches, registries, fallbacks, consumers,
   generated runtime artifacts, recovery paths and fresh-process
   reconstruction. No obsolete, bypass, fallback or rival production path
   may remain reachable inside this graph for the claimed scope; and
2. assurance/source closure: the source consumers, fixtures, proof
   scripts, generators, mutations and assurance tooling relied on for the
   claim. No obsolete assurance consumer may falsely supply closure
   evidence or reintroduce the removed production path into the Product
   graph.

A test-only seam is lawful when it is isolated from the Product
distribution, excluded from ordinary-path evidence and declared in the
assurance subject. Its presence outside the production graph is not a
production-path failure. A retained obsolete test or proof consumer stays
an assurance defect when it can falsely establish the claim or reintroduce
the removed path (P6).

Where proportionate and safe, assurance includes path-sensitive mutation or
sabotage (P5, P2):

- disabling the selected authoritative path prevents the Product scenario
  from succeeding;
- forcing or restoring a rival path causes refusal or a detected
  counterexample rather than silent success;
- corrupting a material interface or owner result is detected at the
  owning boundary; and
- removing an asserted obsolete path does not change the accepted Product
  outcome except through the declared deletion relation.

A Product outcome reached through a forbidden path is a falsified path
claim, not a passing Product test. A negative-path test that mutates the
exact subject without isolation, restoration and subject revalidation
invalidates its own assurance basis (P6, P3).

## 10. Testing evidence composition

One execution may provide several bound results. A supported user scenario
may supply user-acceptance evidence for the outcome, end-to-end evidence for
the runnable causal path, integration evidence for selected seams and unit
counterexamples for a module-owned algebra. Those claims stay distinct and
combine only through the declared relations of REFERENCE_FRAME §6, whose
result conjunction is
[FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)
(P4a, P6). Each bound result states which
predicate it establishes; a result over a necessary condition does not
establish the obligation, and the sufficiency of a conjunction is a claim
of its own ([FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation))
(P6).

The default proof responsibilities are (P6, P2):

- user acceptance proves the outcome from the user's supported frame;
- end to end proves the complete authoritative runnable Product path;
- integration proves material participant composition; and
- unit proves module-owned laws, with evidence size and strategy
  proportional to their internal combinatorial complexity.

User acceptance alone may leave internal path singularity unevaluated.
End-to-end success alone may leave unselected user populations or
combinations unevaluated. Integration and unit results cannot stand in for
either broader claim. When the Product claim requires all of them, a
conflict or a missing result stays visible to the decision owner's
disposition and cannot be hidden by aggregate green status (P5, P6;
FOUNDATIONS §4 Conjunction of results, Survival; REFERENCE_FRAME §8,
operational full coverage item 6).

## 11. Assurance subject acquisition and evaluation

Acquiring the assurance subject and evaluating it are distinct relations
(P6, P1). Where a
claim depends on owner-issued Product, runtime, lifecycle, admission,
replay or projection truth, the testing frame acquires that truth through
the exact runnable owner surface, validator, projection, receipt or
reconstruction relation. A harness, fixture, expected-value builder, proof
script, assurance evaluator or assessor does not reconstruct a parallel
owner state from raw payloads, events, logs, filenames, labels or
implementation fragments and then evaluate that self-authored state as if
it were the Product subject. Where the acquired observation cannot
separate two admissible subjects on which the assessed predicate takes
opposite truth values, the frame returns further evidence, a justified
narrower scope or `indeterminate`. The binding of the
observation itself needs support
([FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation),
Observation sufficiency) (P1, P6).

After lawful acquisition, an independently derived oracle may evaluate the
governing claim. Generic assurance mechanics may compute bytes, digests,
ordering, equality, set membership, completeness and conjunction over
owner-issued evidence. Those mechanics stay evidence evaluators: they
cannot mint owner carriers, choose the current history, select the
authoritative path, interpret domain lifecycle or admission meaning, or
become a runtime fallback (P6; EVALUATION §2).

The rule does not require an evaluator to trust the implementation under
test as its semantic oracle; the oracle derives from Product, requirement
and accepted-design law. It requires the assurance subject to be the actual
owner-issued subject rather than a second implementation of the owner's
runtime meaning. If the required owner projection or observable seam is
absent, the result keeps a named assurance or design gap; the proof harness
does not fill it with rival semantics (P6, P5).

## 12. Counterexample localisation

A testing counterexample is returned to its earliest supported causal
frontier on the declared path. The frontier holds the causally minimal
violated owner relations or seam coordinates the evidence establishes;
earliest means minimal under the declared causal relation, not first in log
or clock order (P5, P6).

The localisation result represents exactly one of (P5, P1):

- one unique violated locus;
- a jointly established set of incomparable earliest violated loci whose
  combined violation is necessary to the supported causal explanation;
- unresolved alternative frontiers, when the evidence supports several
  possible causal explanations but cannot establish which occurred; or
- `indeterminate`, when the evidence cannot support a bounded frontier.

The four forms are a refinement of the core under the rule of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results), for the predicate "the
evidence establishes the counterexample's earliest violated loci on the
declared path". One unique violated locus and a jointly established set
map to `satisfied`. Unresolved alternative frontiers map to
`indeterminate`, naming the alternatives that further evidence must
decide between. The fourth form is the core value `indeterminate` itself,
naming the evidence a bounded frontier needs. The form travels with the
value as the domain outcome, so a joint set stays distinct from a unique
locus and unresolved alternatives stay distinct from an unbounded
frontier. Purpose and material relation: a localisation combines with
other results in the one core, and an unresolved causal explanation is
never read as an established one (P5, P1, P6).

Localisation records the subject, basis, frontier form and members, causal
evidence, expected relations, the observed counterexample and the
downstream claims it invalidates. It does not collapse a jointly
established set into one arbitrary owner, and it does not report
unresolved alternatives as a joint cause (P5, P4b).

A localised frontier does not itself authorise broader test expansion,
compatibility repair, another controller or a reinterpretation of unchanged
upstream meaning. A resulting scope or design change follows the existing
re-entry relation (SPEC_METHOD §4; P6).

## 13. End-to-end interface integration frame

`urn:stdo:reference-frame:end-to-end-interface-integration:v1` is a
composite refinement whose identity resolves in
`urn:stdo:bounded-context:reference-frame-evaluation` (owned by
REFERENCE_FRAME) under the exact selected basis; its assurance law is
stated here. It relates the evaluation of public boundaries, design,
operators, owners and proof to the integration, end-to-end and
user-acceptance frames of §7. Like the set, it is available and is
activated only where the governing frame configuration or admitted work
authority selects it. It adds no fifth testing type, role or
universal activation gate (P2, P3).

| Frame element | End-to-end interface integration |
|---|---|
| evaluation family | Does one outcome stay constructable, understandable and correctly realised across its material interface chain, with sufficient participant context and conserved meaning, authority and cause? |
| subject and basis | one Product outcome and an independently stated oracle; the governing requirements and design basis, exact source or workspace checkpoint, contracts and finite case population; for design claims, the declared participant roles, functional path, dependencies, configuration and capabilities; for claims over their realisation, the actual participants, callable selection, supported entry and exit, and the exact runnable artifact or install |
| material manifold | the producers, consumers, transformations and effect owners, as declared for design claims or actually selected for realised claims; at each material seam, the functional preconditions and postconditions, value and reference domains, lifecycle and time, supplied context, mutable subject, refusals, observations and user-visible result |
| coordinates and equality | distinct Product, artifact or install, workspace, observation, invocation, candidate, admitted result and evidence identities; exact revisions, domain, units, cardinality, ordering, empty, null or default meaning and validity interval; equal shape or output implies no equal meaning, provenance or authority |
| governing invariants | the selected Product, requirement, design and interface law; REFERENCE_FRAME declaration and translation law; the conjunction of results of FOUNDATIONS §4; the claim boundaries and obligations below; the existing testing and assurance owners keep their laws |
| authority | existing owners keep semantic, operation, admission and reserved decision authority; the activation grants bounded evaluation, with construction only under its existing exact operation grant; the declared decision consumer disposes the closed result |
| evidence | source-linked contracts and both selected sides; for design claims, design relations and explicitly unresolved realisation facts; for claims over realised relations, the actual supplied request, context and response, callable and configuration identity, owner validation, effect and observation records and the ordinary caller's outcome; independently derived expected relations and disclosed substitution limits |
| capability envelope | competence in the outcome, functional composition, domain and lifecycle semantics, participant capabilities and causal diagnosis; sufficient access to the exact subject and evidence without altering a reviewed subject; required independence stays claim-relative |
| exclusions | hidden context or privilege, rival contract truth, inferred authority, undeclared substitutes, private or test-only paths for ordinary-path claims, candidate output treated as admission, fixture success treated as real user evidence, and unsupported whole-Product or all-future-case conclusions |
| result and relations | each activated claim returns a core result with its exact evidence, coverage, causal findings and residuals; shared evidence is referenced once; mandatory claims compose only through a declared same-basis or lawful-translation conjunction (FOUNDATIONS §4 Conjunction of results) to the named decision consumer |
| invalidation | a material change of contract, domain, participant, prompt or context, capability, callable path, configuration, translation, relevant workspace observation, lifecycle, oracle or evidence population invalidates the affected conclusions; unchanged valid evidence and owner rulings stay reusable |
| qualification | the representative sensitivity and refusal cases below, bound to actual subjects, actor envelopes and independently stated expected relations; mechanical source checks supply no semantic or live-user qualification |

### Claim boundaries

(P6, P1)

| Claim | Evaluation and evidence boundary |
|---|---|
| contract sufficiency | Can each participant determine and perform its responsibility from the declared interface and the available context? Source-grounded design evaluation may establish this claim without an implemented runtime; unresolved realisability or actor-context questions stay explicit. |
| boundary congruence | Do the actual selected producers, transformations and consumers preserve the declared domains, meanings, lifecycle and authority? An actual-composition claim acquires both sides and their exchanges; design correspondence alone proves no implementation behaviour. |
| path realisation | Does the exact runnable subject use the authoritative entry-to-outcome path through its material state, effect and observation boundaries? Matching output through another path is insufficient. |
| user usability | Can the ordinary human, LLM or software caller obtain the selected outcome using only its declared context, access and supported surface? Internal success or validator-aware fixtures cannot establish this claim. |

The activation selects claims from the work's applicability (ACTIVATION §1)
and states the scope reason for each unselected claim; an unselected claim
has no result. Design-only work
does not require unavailable runtime evidence and does not report runtime or
UAT satisfaction. An unknown material condition keeps its dependent claim
unresolved: the claim's result is never `satisfied` and names the
condition as what would decide it
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Standing); omission
cannot close it. A full end-to-end usability claim
needs all four distinct results and their explicit conjunction
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)),
in which an unselected claim is uncovered coverage. Transport,
parse, admission, semantic satisfaction, operation completion and user
success are not interchangeable (P5, P6).

### Obligations

Existing truth surfaces are reused. The working record adds only missing
cross-interface relations; schemas, prompts, adapters, indexes and tests do
not become another contract owner (P6, P2). For each material seam:

1. Bind the functional input domain, producer success postconditions,
   consumer preconditions, permitted effects, refusals and observable exit.
   Direct successful handoff requires the producer's guarantees to meet the
   consumer's preconditions. An interface may instead emit candidates:
   candidate output, later admission and semantic assessment stay distinct
   declared stages. A normal model refusal or an inadmissible candidate does
   not by itself falsify an adequately declared candidate interface; the
   exact promised outcome and refusal behaviour are evaluated (P4a, P5).
2. Make material actor obligations and domains available through the
   actual interface or context, or through an exact locator the actor can
   lawfully resolve. Bind the LLM role, instructions, supplied context,
   tools and model or transport configuration where material. Generic
   governance access does not replace the Product-specific contract or
   authorise inference of hidden validator rules. Existing deterministic
   owners compute the available facts and expose their owned relation to
   context and validation by reuse or a proven equivalent projection.
   Semantic actors judge meaning within that domain; reserved owner
   rulings, eligibility, authority and admission are not inferred from an
   actor response or a frame label (P0, P6, P1).
3. Preserve domain and temporal meaning through serialisation, parsing,
   normalisation and adaptation. A lawful translation binds source and
   target coordinates, preserved meaning, accepted loss, provenance,
   governing owner and refusal conditions. Distinguish proposed, admitted,
   assessed and completed states; active input from historical context;
   current validity from mere byte availability. Equal wire shape is no
   translation proof (P1, P3; REFERENCE_FRAME §6).
4. Observe the relevant current mutable workspace for each later
   operation, and bind that observation separately from immutable
   authority, artifacts, history and prior candidates. Changed support
   invalidates dependent conclusions; unaffected accepted work stays
   reusable. A snapshot does not replace the current subject, and a change
   of actor alone is no reason to repeat still-valid work (P3, P4b;
   ACTIVATION §7).
5. Follow the actual callable path and the existing effect owners through
   the selected exit and any required fresh observation. A hidden fallback,
   state injection, manually repaired output, private entry or undeclared
   retry cannot support an ordinary real-path claim. A pure function
   acquires no new event lifecycle because this frame evaluates it (P6,
   P3).
6. Preserve diagnostic cause through wrappers and projections. Apply §12:
   report the supported causal frontier, not merely the first log or clock
   occurrence. Keep the originating seam, bounded field or path, expected
   domain or basis, observed mismatch and evidence locator where available,
   with downstream symptoms, successful work and the declared continuation
   or block. Preserve joint causes, alternative frontiers and
   indeterminacy; do not invent a unique cause. Product redaction rules
   still govern sensitive content. Missing required diagnostic evidence
   stays a named gap. Return the smallest supported owner or re-entry;
   diagnosis grants no repair or retry (P5, P4b, P6).

Evidence acquisition follows §11: owner facts are acquired through existing
surfaces and evaluated with an independent contract-derived oracle.
Computed facts, contextual judgments and reserved owner rulings keep their
distinct owners and validity scopes (P6).

For an LLM-interface usability claim, clean-room LLM UAT is used, with the
ordinary supplied context and permitted tools and without private
implementation knowledge or fixture assistance. Expected outcomes are
recorded before responses are inspected. The sunny case and the ordinary
ambiguity and negative cases material to the claim are included.
Substitutes are disclosed; replayed or fabricated responses prove only
their stated narrower relation, not live-provider usability. Responses are
not edited, and nothing is silently retried until green. Live claims need
live evidence under §2, not a new universal live-provider requirement
during design (P6, P5; EVALUATION §3, expectations before exposure).

An early sunny thread can establish bounded evidence while the unexercised
claims stay open (the sequencing heuristic of SPEC_METHOD §8). This frame
adds no exhaustive-hardening prerequisite, scenario quota, controller,
runtime, generator, routine human approval, new ledger or automatic extra
agent. Existing authority selects proportionate assurance and any further
operation. The result returns, for each of the four claims, its core
result or the scope reason it was not selected, the exact
exercised subject and path, the supported mismatch, retained work,
substitutions, residuals and invalidators in the existing work carrier; it
is neither acceptance nor a grant of the next action (P2, P6; ACTIVATION
§6).

### Computational whole-path evaluation

For material computational composition or recurrence work, the selected
interface claims are composed with evaluations of the path's operators,
owners, reused foundations and proof, to evaluate one complete
producer-to-consumer path under the design profile's computational
realisation and recurrence law (DESIGN_MODULE). The evaluation binds fact
establishment, each consumer, validity and invalidation, effects, retained
alternatives and accumulated work. It evaluates equivalent computation
across different domain names without assuming semantic equivalence.
Qualification challenges the design's declared workload and operational
assumptions, and preserves the independent scope, freshness and effect
checks that serve distinct supported obligations (P4a, P1, P2).

An identifiable complete-path result and its evidence return to the
declared decision consumer; a collection of local successes cannot replace
that result. Design-only evidence establishes only the design claim; claims
about actual work need observations on the selected path. Valid unchanged
results are reused, and affected reassessment is activated on a material
change of path, basis or workload. This is a bounded composition of
existing frames, not a permanent actor, an extra frame family, a per-helper
review or a separate accounting ledger (P4b, P2).

### Qualification

These are representative source-contract discriminators: not an executed
trial, a universal test quota or whole-Product qualification. Each selected
case binds its own exact subject, oracle, evidence and claim scope (P6,
P5; EVALUATION §7).

| Case | Required discrimination |
|---|---|
| empty and non-empty eligible domains | Ordinary context makes both domains usable; a universal empty-value workaround cannot replace the governing domain. A hidden required rule defeats contract sufficiency even when the validator correctly refuses. |
| adequate candidate contract and rejected response | Legitimate refusal or admission filtering is told apart from an inadequate interface or a violated success guarantee; model variability alone is no frame failure. |
| same-response or historical-only reference | Eligibility and lifecycle come from the owning domain; available or equal-looking references are not automatically current admissible inputs. |
| individually valid but temporally mismatched carriers | Different observations or admission states can falsify boundary congruence despite matching shapes. |
| meaning-changing translation | Loss of units, default, identity or ordering is detected against the independent outcome oracle, even when both shapes validate. |
| fixture knows a hidden rule | Mechanical success leaves user usability unproved; it cannot hide missing ordinary actor context. |
| expected output through a forbidden path | Path realisation is falsified; equal output does not discharge the actual-path obligation. |
| changed workspace and reusable accepted work | Affected context and dependent evidence are refreshed while unaffected valid work is kept; history does not stand in for the current subject. |
| wrapped or ambiguous failure | The supported originating causal frontier and its uncertainty are kept, not replaced by a downstream symptom or an invented unique cause. |
| design-only sufficient contract | A bounded contract result can close while runtime and user claims stay unclaimed or unresolved according to their applicability; no runtime or UAT satisfaction is inferred. |

## 14. Design-to-module evidence route

For a new or materially changed realisation boundary governed by a design
profile (DESIGN_MODULE, tier 3, whose binding of the objects named here is
declared in that profile), the canonical evidence relation is (P6, P4b):

```text
constitutional WHAT and owning requirements
  -> accepted ontology, the carrier inventory the design declares,
     target design, and the design's domain, sequence and state evidence
  -> implementation and module-derived unit tests
  -> reconciliation and acceptance
  -> promotion and design-method closure

implementation and module-derived unit tests
  -> evidence, counterexample or falsification input
  -> affected ontology or design relation
```

The first chain is semantic derivation. The second is evidence feedback
and cannot select or accept the affected semantic answer (P6). The two
chains are this member's instance of parallel derivation: expected results
carry assertion provenance from the first chain and executions carry
execution provenance from the second; agreement between them is
compatible with a shared error, and disagreement requires diagnosis
([FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance))
(P6, P1). When the
design's co-evolution condition holds, the two chains may proceed together
without making implementation semantic authority; design still owns the
structural HOW. Where the design is not decision-complete, the relation is
design-gated at the smallest causally closed affected decision set and
retained implementation follows its acceptance. An unchanged
`realization_refactor` (SPEC_METHOD §4 Change classes) cites the accepted
relation and proves no material semantic-boundary delta; it does not
recreate the evidence (P2, P6).

Where construction is probabilistic or agentic, the execution relation of
ACTIVATION §1 governs the handoff from this accepted design basis into
bounded construction, assessment, disposition, checkpoint and
continuation. The design profile supplies the governing-frame,
transformation-admission, invariant-reconstruction,
computational-realisation and module evidence that relation consumes; it
does not define a second execution protocol (P0, P6).

Completeness requires (P6, P4b):

- the final implementation is traceable to the accepted ontology;
- the final implementation is traceable to design and module boundary
  assets;
- unit tests are traceable to module ownership, not only to helper
  layout;
- implementation-first discoveries are reconciled into the ontology and
  the design's domain, sequence and state evidence before promotion or
  closure; and
- implementation may not compensate for an unrealised declared
  constructor by introducing a hidden controller or alternative authority
  path.

Unit tests may be discovered from implementation behaviour, but the
closure proof is re-expressed against module ownership rather than code
helper shape. The module boundary is the intermediate reasoning surface
that lets implementation and unit tests be audited against the same
ownership cut; it does not outrank constitutional truth or ratified design
(P6).

The minimum complete evidence chain is (P6, P4b):

1. constitutional WHAT;
2. accepted ontology;
3. target design;
4. target module boundary assets and the ontology-derived carrier
   inventory;
5. accepted domain, sequence and state projections with axiom evaluation;
6. implementation; and
7. unit tests derived from the same ontology and module boundary.

Where a reference realisation exists, the complete evidence chain becomes
(P6, P4b):

1. constitutional WHAT;
2. reference design;
3. accepted target ontology and reference-to-ontology mapping;
4. target design mapping;
5. target module boundary assets and the ontology-derived carrier
   inventory;
6. accepted domain, sequence and state projections with axiom evaluation;
   and
7. implementation and unit tests derived from the same ontology.

If a change jumps from design or code straight to tests and never
reconstructs the module boundary, the proof surface is too weak (P6).

## 15. Module-derived unit tests

Within the product-assurance bounded context of §2, the two authority
sources stay distinct: the module-derived unit test and its proof relation
derive from realisation authority, which the design profile owns
(DESIGN_MODULE), and this section states that relation so both sources sit
in one member; that ownership does not extend to Product-level UAT or
acceptance meaning, which stays with Product authority under §2 (P6).

Unit tests under the design profile are module-owned proof lanes. They
derive from module ownership evidence, not from code shape alone. A unit
test should be traceable to (P6, P2):

- the accepted ontology and the applicable entity, lifecycle, authority,
  function, effect or projection law;
- the governing module design;
- the active carrier inventory the design declares, or an equivalent
  carrier inventory;
- the module-bounded domain, sequence and state projections; and
- the requirement families the module owns.

Unit tests are not authored primarily from helper function boundaries,
private method layout, incidental branch structure, temporary
implementation decomposition, or mock convenience that hides the real
module contract. The required question is not "what functions exist to
test?" but "what does this module own, and what proof does that ownership
require?" This does not prohibit helper-level tests; it prohibits
helper-level tests from becoming the canonical proof surface for a module
boundary (P6, P1).

Canonical rule (P6): module-owned unit tests are authoritative for module
proof; broader integration, scenario and sandbox lanes remain downstream
proof families; transitional slice-gating tests may exist, but they do not
replace module-derived unit proof. If a module has code but no
module-derived unit test lane, the module is not closure-ready under the
design profile. What such a lane claims, and what it never closes, is
the unit frame of §7.

## 16. Module lifecycle confirmation

Every designed module, function, application surface, runtime surface,
plugin surface, public interface, data surface, and published function or
module of a profile exists inside an operational lifecycle. Under the
design profile that lifecycle signal is confirmed at the realisation
boundary before design-method closure (P2, P6). The
canonical operational lifecycle chain is SPEC_METHOD §2 Operational
lifecycle sufficiency; this section consumes that chain and does not
redefine its phases. The checklist is not a release plan and does not
replace RELEASE; it is an ambiguity detector for ultimate intended use.

For each governed boundary, the design evidence states, or points to a
surface that states (P6, P5):

- the upstream intent and requirement authority;
- the build or realisation surface;
- the assurance and proof surface;
- the release or packaging posture;
- the deployment or install posture;
- the live usage or invocation posture;
- the observed telemetry, projection or monitoring posture;
- the retirement, revocation, supersession or decommission posture; and
- the owner, source truth and authority boundary for the lifecycle
  decisions.

Each lifecycle phase takes one of the three answers that
[SPEC_METHOD §2 Operational lifecycle sufficiency](SPEC_METHOD.md#operational-lifecycle-sufficiency)
owns, applied here to design evidence: answered by the active design,
requirement, release, deployment or telemetry surface; declared not
applicable with a reason; or recorded as a named `Gap:` or `Unanswered:`
item, which in design evidence also names its owning follow-up. A phase
list without answers, not-applicable reasons or named gaps is not
design-method evidence (P5, P6). The three are declared states of the
design evidence for a phase under that section, not result values; a
named gap is a residual
([FOUNDATIONS §2](FOUNDATIONS.md#2-ontology)) that remains until its
owning follow-up disposes it (P4b, P5).

Implementation proves the selected lifecycle path only within the
authority it owns. Code, tests, generated artifacts or runtime fixtures may
confirm that a lifecycle claim is real, but they may not invent lifecycle
authority that the product, requirements, design, release or operational
surface did not declare (P6). If the checklist exposes missing release,
deployment, live-use, telemetry or retirement truth, the module may still
proceed only when that gap is explicitly governed; it may not close by
relying on local convention, implementation precedent, mutable runtime
state, prompt prose or test-only fixture behaviour (P6, P5).
