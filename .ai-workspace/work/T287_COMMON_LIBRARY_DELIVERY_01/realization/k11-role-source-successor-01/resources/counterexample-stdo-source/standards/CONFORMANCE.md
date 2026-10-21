# CONFORMANCE

Tier 2. Defines conformance cases for the method's shared owners and their
consumers. A discriminator is a situation whose expected distinction
separates a conforming application from a defective one. Each expectation
and its deciding local owner are stated here; this member imports the
method's rules and defines no competing result algebra.

A case names its subject, mechanism and expected distinction. An execution
record separately binds the exact tested subject, basis, acquired context,
observations, assessor and result. A run is not a pass; only an assessment
against the declared predicate establishes one. The presence of a case or
coverage map is no execution or qualification evidence (P6).

A case passes when the expected distinction is observed and no coerced
success appears anywhere in the result
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Not performed): the
assessment returns a core value for that predicate, and the case passes
only when the value is `satisfied`. A case that cannot be run with the
declared subject is a planned evaluation that was not performed: it has no
result ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Not performed),
and it is recorded as not run, never hidden.

Result values. The values `satisfied`, `falsified`, `indeterminate`,
`out_of_frame` and `invalid_basis` named in this member are core values of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). The values `re_enter`,
`re_entry_requested(authority)`, `not_effected` and `completion_unknown`
are refinements that
[ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition) defines and
maps into that core. This member defines no result value
(P5, P6).

## 1. Counterexample cases

These cases identify failure mechanisms and the local rules that must
distinguish them.

| Case | Subject | Mechanism | Expected distinction |
|---|---|---|---|
| C-01 No cost term | an activation whose governed question is capability fit, run without an allowance | ACTIVATION §6 | the activation refuses or records the missing allowance; the return reports spend or unavailability |
| C-02 Green over pending | a 40-row status all stamped proven, with literal PENDING fields under the labels | EVALUATION §2, §4 | the review reads the data under each label and returns falsified for the rows, not satisfied for the label |
| C-03 Restart carries the pattern | eight restarts of a construction, each from scratch, each repeating a method-stance defect | ACTIVATION §5 | a restart proposal states why repair of retained work is insufficient; the defect is located at its owning layer and repriced, not re-run |
| C-04 Duplicated runtime construction | a path that re-derives an unchanged basis on every handoff | ACTIVATION §7, FOUNDATIONS §4 | the review counts per-handoff reads and derivations; reuse under applicability replaces repetition |
| C-05 Whole manifest for a subset | a 504.8 MB manifest parsed to select 182 entries | ACTIVATION §2 | selective acquisition by exact identity is declared; transferred context is counted; a required member is never trimmed |
| C-06 Report volume as traffic | a 2.4 GB report presented as model spend | ACTIVATION §6 | report volume and model traffic are separated in the cost record |
| C-07 Operational variable missed at intake | a provider permission profile that changed before activation | ACTIVATION §1 | the intake names operational variables; a change returns invalid_basis before effects |
| C-08 Method as amplifier of a wrong vector | engine completeness delivered while the Product outcome regressed | SPEC_METHOD §3 | progress is judged only against the selected outcome; the evidence surface cannot enlarge it |
| C-09 Deterministic drift into probabilistic responsibility | a kernel component deciding what a worker must decide | ODD §5 Probabilistic compute, FOUNDATIONS §2 Work boundary | the boundary is declared and the misallocation returns re_enter at the owning relation |
| C-10 Scenario patched around a framework defect | a fixture simplified to dodge a kernel bug | SPEC_METHOD §4 | owner triage before repair; the framework is fixed, the fixture restored |
| C-11 Closure by approval | a work item closed on reviewer sign-off with its stated condition unmet | EVALUATION §5 | closure follows the stated condition; the reviewer result is input only |
| C-12 Carrier churn as findings | a review whose findings are all ticket, column and filename matters | ACTIVATION §6 | findings are judged by ambiguity removed; carrier findings are costed as churn |

## 2. Construction trials

| Case | Shared task | Expected distinction |
|---|---|---|
| T-01 Context cap and decomposition | required basis exceeds one actor's declared cap; repeat with tighter caps and a coupled case that cannot fit | refinement preserves the outer contract under independent assessment; the cannot-fit case returns out_of_frame or a lawful escalation, never omission |
| T-02 Intent to usable result | a small feature from a sufficient but ambiguous intent | the ambiguity is resolved or kept explicit; the result satisfies independently owned acceptance |
| T-03 Composition conservation | two valid bounded results under one outer contract | all inputs, constraints, judgments and evidence survive the join of the two results; an incompatible composition boundary between the producing steps is refused |
| T-04 Failure and missing assessment | one observed failure plus one required obligation with no assessment | both states survive; the composite cannot report success or erase the unassessed obligation |
| T-05 Compaction and actor change | pause, clear context, resume with a new actor | valid progress and basis recovered; unsupported completion claims and unnecessary restarts detected |
| T-06 Changed governing requirement | one requirement revised after partial construction | affected claims reopened; unaffected results reused with explicit dependencies |
| T-07 Defective acceptance oracle | a candidate passing structural checks but violating required behaviour | assessment detects the defect or reports its evidential limit; structural green is not acceptance |
| T-08 Broader process use | a sourced decision analysis with uncertainty and stale evidence | facts, assumptions, judgments and authority stay distinct; the result is independently assessable |

Trials declare a per-actor context cap, the fit of
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope),
and a total-work budget, a resource limit under
[ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits), before each
run, include a required basis larger than the cap, count transferred context
across every delegated actor, keep acceptance criteria independent of the
constructing actor, and repeat probabilistic trials with varied task order.

## 3. Recoverability

| Case | Subject | Expected distinction |
|---|---|---|
| R-01 Fresh-context activation | a fresh actor given only this corpus performs a bounded activation on a declared subject; a comparative claim also selects an exact comparable baseline and runs the same task under matched acquisition conditions | the governing relations are recovered with fidelity judged independently; reconstruction cost, task completion and material errors are recorded; a comparative improvement claim has supporting matched evidence and any adverse difference is explained |
| R-02 No private knowledge | the same with validator folklore, author memory and whole-corpus loading withheld | the activation still succeeds or returns out_of_frame truthfully |

## 4. Cases for method discriminators

Discriminators 32, 33, 38, 42 and 43 of §5, turn on what
actors do during real work: how a configuration they belong to is judged
and kept while they redistribute work, how a realisation is judged against
its kind of executor, and whether an actor trusts a retained account over
the workspace. Each needs actual use, a fresh constructor applying this
corpus to a declared subject with the result assessed, in addition to the
logical review of §5. The three cases below exercise them. A case here is
named CD (construction discriminator); the numbers in brackets are those of the
discriminators it exercises.

| Case | Subject | Mechanism | Expected distinction |
|---|---|---|---|
| CD-01 Configuration without a fixed role inventory (32, 33) | a task whose dependent operations are carried out by peer actors with no central coordinator, under responsibility names other than those of the executive configuration; during the work one actor hands another an operation whose external effect is of uncertain completion; an executive configuration installed to build a release is in use beside it | ACTIVATION §1 Configuration, §3 Effects, §5; EXECUTIVE_BASELINE §16 | the configuration is evaluated against the task, its dependencies, the actors' limits, the authority it applies and the required assurance, and its labels and topology neither accept nor reject it; the installed configuration keeps its own scope and is not the measure of the peer configuration; the handover keeps the outstanding obligations and the results that depend on them, resolves the effect's completion before the next dependent action, and keeps the admitted authority and the required independence; self-organisation exempts it from none of these |
| CD-02 One set of requirements, several executors (42, 43) | one set of requirements realised by a software stack and by a mixed process of people and software; for one of them, a proposed faster execution plan merges two required independent assessments and replaces a required human decision with an automated result | SPEC_METHOD §11 rules 1, 2 and 4; EVALUATION §3 | each realisation is judged by the obligations of the requirements, with its computational calculus, execution binding and conformance evidence, and the kind of executor neither accepts nor rejects it; the faster plan's conformance for each weakened obligation is falsified, and matching outputs, lower cost or a faster run do not discharge the lost independence or authority |
| CD-03 Stale summary against the current workspace (38) | a fresh actor with no private history resumes work from a retained summary that disagrees with the current workspace, including about whether an external effect occurred; resolving one disagreement needs an operation outside the actor's grant | ACTIVATION §5 The workspace and an actor's account, §3 Effects and Construction availability, §7 | the actor acquires the current subject and its authoritative inputs, corrects its account from current evidence, keeps the applicable work and continues within its grant, stopping with re_entry_requested(authority) for the disagreement outside it; the summary never overrules the workspace, discarding the prior context erases nothing in it, and a missing record of the effect leaves it completion_unknown, never absent |

Purpose and material relation: a reading of the text can show that the
corpus states these distinctions, but only use shows that an actor
applying the corpus keeps them while it works (P6, P0).

The assurance relations require the candidate to demonstrate here the
applicable positive, negative and unresolved cases of a weak assertion, an
insufficient observation, shared error, and change selection that retains
valid evidence or invalidates affected evidence
([FOUNDATIONS §4 Formal representation](FOUNDATIONS.md#formal-representation)).
The four cases below carry them; a case here is named AR (assurance
relation). Each applicable case requires its own exact execution and assessment
record; no run or result is asserted by this catalogue.

| Case | Subject | Mechanism | Expected distinction |
|---|---|---|---|
| AR-01 Weak assertion | in each expectation set of the actual-use trial, one item that states a necessary condition of the task's required outcome which a return making the wrong decision can still satisfy | [FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation), the three directions and the check of a necessary condition | a `satisfied` on the item establishes only the condition it checks and supports no claim that the frame was used correctly; the attribution of benefit excludes it; a `falsified` on it stays a failed condition of the run |
| AR-02 Insufficient observation | one item per set that observes a point at which two admissible returns, one correct and one not, read the same, both returns recorded with the item | [FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation), Observation sufficiency | the grade is `indeterminate` with the reason that the observation does not separate the admissible answers, never `satisfied` or `falsified`; a return that reads as neither recorded return is listed for diagnosis, because the item or the return, not the method, may be at fault |
| AR-03 Shared error | an expectation writer, task actors and a grader of one model family, the writer and the actors reading the same owning sections | [FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance) | agreement between a return and the expected answer is not counted as independent evidence; a disagreement is diagnosed among the four causes of [ACTIVATION §1](ACTIVATION.md#construction-relation), the expectation item itself among them; no statistical independence is assumed from the families or codebases involved; ported material is named with its donor and common dependencies |
| AR-04 Change selection | a change to two owning sections and the addition of nine, against the curated frames, the hashed expectation sets, the interpretation and the conservation readings that depend on them | [FOUNDATIONS §4 Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse), `S_Δ` and `retain_applicable`; [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse) | dependents whose validity dependencies meet the impact cover are reassessed (the frames regenerated, the tests rerun) or stand invalidated until rebuilt (the interpretation, uncovered for the added sections); an expectation set whose deciding sentences are unchanged is retained with its validity conditions stated; a changed hash alone decides nothing |

## 5. Discriminator coverage

A logical-review check is a reviewer's reasoned reading: the reviewer
constructs a discriminator's situation against the text and finds whether
the text yields the expected distinction, or finds a counterexample or a
contradiction, without running anything (P6). Its result is a review result
under [EVALUATION §4](EVALUATION.md#4-review-results), by a reviewer who
meets [EVALUATION §3](EVALUATION.md#3-independent-assessment). A
structural or mechanical check of the text does not establish it
([EVALUATION §2](EVALUATION.md#2-separation)), and it supplies no
actual-use evidence ([EVALUATION §7](EVALUATION.md#frame-qualification)).

Each row states the situation, expected distinction, local owning sections
and checks. L-n identifies a logical-review check. Each applicable row is
read against the material member and consumer scope; an actual-use case
adds observed evidence and does not replace that reading. Required frame
results carry the core result algebra or its mapped refinement. Cases
about an interpretation or optional profile apply when that surface or
claim is selected; availability alone creates no implementation obligation.

| No. | Discriminator | Expected distinction | Member sections | Exercised by |
|---|---|---|---|---|
| 1 | A derivation or independence argument is claimed | Each claimed derivation shows its premises. Claimed independence is argued, not assumed. | FOUNDATIONS §1, §3 Commitments and Foundation to law; EVALUATION §1 | L-1 premises shown |
| 2 | A family argument accounts for edited rules but omits inherited deciding rules | Coverage includes the material rules and actual consumers in the declared family, or a supported account that no separate consumer applies. A blank field, generic referral, coarser grouping or whole-member preamble cannot supply a missing relation. | FOUNDATIONS §3 Foundation to law (the table format, "accounts for" and the family index); every member's family table | L-2 |
| 3 | A new foundations introduction accompanies unchanged rival rules in the consumers | Correspondence alone does not establish reduction. The deciding consumers must use one shared determination or a justified refinement. | FOUNDATIONS §3 family index; the shared owners each consumer refers to (FOUNDATIONS §2 Authority kinds, ACTIVATION §1 to §7, EVALUATION §3 and §5); FOUNDATIONS §2 Imports between members | L-3 |
| 4 | A candidate is shorter but ordinary entry still requires the same independent reconciliations | Compare the actual deciding paths and acquisition against the exact declared comparable baseline when a comparative improvement is claimed. A smaller body alone is not a positive reduction witness. | FOUNDATIONS §3 family index; the README route; the shared owners of item 3 | L-4 |
| 5 | A candidate unifies a recurring rule and retains a necessary domain exception | Establish actual shared-law use, preserved outcomes and the exception's owner. Reduction can hold without a universal percentage or word-count decrease. | FOUNDATIONS §4 Results (Refinements); FOUNDATIONS §2 Imports between members; each member that refines a shared owner | L-5 |
| 6 | Outcome-driven development is presented only as a vocabulary for operations | Show how generic outcome-driven transition contracts govern construction, evaluation, continuation, recovery and termination, with independently specified cases and justified additional policies. These generic obligations do not require adoption of the optional typed-graph profile. | ACTIVATION §1 Transitions, §4 Refinement, §5; ODD §1 | L-6 |
| 7 | Several predecessor clauses are implemented by one shared successor law | Evaluate each material obligation and its consuming bindings. Shared ownership can conserve several claims without retaining their former document partitions; a bare link cannot supply omitted meaning. | RELEASE §9; the claim dispositions on the selected work carrier | L-7 |
| 8 | A candidate deletes an exception to make the core smaller | Size reduction cannot erase a material obligation. Give it a valid disposition and preserve its required behavior, or obtain the owning removal decision. | RELEASE §9; the claim dispositions on the selected work carrier | L-8 |
| 9 | A domain rule is replaced by a shared-law reference | Preserve its material trigger, modal force, adoption conditions and exceptions. The shared owner and domain binding must supply the determination without circular referral. | FOUNDATIONS §2 Imports between members; each member that refers to a shared owner | L-9 |
| 10 | A required generic rule is owned only by an optional profile | Generic use can obtain that determination without adopting the profile; profile-specific additions retain their selection boundary. | FOUNDATIONS §3 family index; PROFILES §1; IDENTITY §2 Boundaries and sufficiency claims; ACTIVATION §1 Admission | L-10 |
| 11 | A functional helper is promoted into a new public mechanism | Require the material distinction or independent boundary that needs it. Shared machinery and subordinate helpers do not create new semantic or authority owners by naming alone. | DESIGN_MODULE §4; ACTIVATION §6 | L-11 |
| 12 | A bounded object is declared a Markov object because its interface is small | An ordinary useful boundary supplies no proof of the stronger sufficiency or independence claim. State its assumptions and evidence; an unsupported claim stays unresolved. | IDENTITY §2 Boundaries and sufficiency claims; WORLD_MODEL §4; FOUNDATIONS §5 | L-12 |
| 13 | An a_c model omits a source condition but passes its schema check | The model fails fidelity for a decision affected by that condition. Mechanical validity cannot authorise the work that the owning source prohibits. | AXIOMATIC_CALCULUS §6, AC-017, AC-018; EVALUATION §2 | L-13 |
| 14 | A faithful a_c fragment is offered as the whole method's interpretation | Account for every material owned determination and required dependency. The fragment establishes only its covered scope; missing material coverage prevents a claim of complete interpretation. | AXIOMATIC_CALCULUS §6; EVALUATION §2 | L-14 |
| 15 | A frame uses an a_c projection rather than copying a clause verbatim | Assess fidelity and task sufficiency against the owning source. Different encoding alone is no defect; changed obligations or permissions are. | AXIOMATIC_CALCULUS §9 Constraint surfaces; ACTIVATION §2 Acquisition | L-15 |
| 16 | A compressed constraint surface treats an unresolved premise as unrestricted freedom | Preserve the unresolved dependency and apply the relevant stop, acquisition or refinement rule. Unknown permission is not a grant. | AXIOMATIC_CALCULUS §9 Constraint surfaces, AC-009; ACTIVATION §1 Applicability | L-16 |
| 17 | A task has several solutions inside the same constraint surface | Permit the alternatives that satisfy its contract. The method constrains admissibility without absorbing the worker's internal solution strategy. | AXIOMATIC_CALCULUS §9 Constraint surfaces, AC-008 | L-17 |
| 18 | A projection changes “not required” into “prohibited”, or preference into obligation | The changed permitted work is a fidelity defect unless an authorised successor relation establishes the change. Matching digests or valid schema do not repair it. | EVALUATION §7 Derived guidance; AXIOMATIC_CALCULUS AC-008, §9 | L-18 |
| 19 | Ordinary entry points to an earlier formal interpretation marked current | Bind the current source, signature, program, maps, instructions and evidence boundary; reproduce the offered route. Earlier artifacts retain historical standing. Refusing stale inputs contains the failure but does not establish a usable current publication or semantic coverage. | PRODUCT_DEFINITION §11; ACTIVATION §2 Staleness of derived surfaces; the README route | L-19 |
| 20 | Information and its representation differ | Agreement in structure cannot establish identical meaning or semantic fidelity. | EVALUATION §2, §6 Equivalence ladder; AXIOMATIC_CALCULUS AC-017, AC-018 | L-20 structure is not meaning |
| 21 | Identity is unchanged while content changes | The current state, and whether an earlier observation still applies, are considered separately. | FOUNDATIONS §2 (Object); IDENTITY §2 Stability; REFERENCE_FRAME RF-005; ACTIVATION §7 | L-21 identity is not content |
| 22 | Typed producers and consumers disagree | The incompatible domain or precondition is made explicit. Fields of the same shape do not make a valid join. | FOUNDATIONS §4 Composition; AXIOMATIC_CALCULUS AC-004, AC-016 | T-03; L-22 for the explicit incompatible domain or precondition and for same-shape fields |
| 23 | Assessment A failed and required coverage B is uncovered | A's authenticated failure and its citations survive, and B stays unresolved. Every planned assessment's returned judgement is authenticated against its producer, subject, basis and supporting evidence. B is required coverage outside those assessments, not an omitted planned judgement. | FOUNDATIONS §4 Conjunction of results | T-04; L-23 for the authentication of each planned judgement and for B as uncovered coverage |
| 24 | A genuinely planned assessment carries a judgement from a different subject | Plan membership does not authenticate the returned judgement. The misbound result cannot satisfy the assessment obligation. | FOUNDATIONS §4 Conjunction of results (second input); EVALUATION §2; REFERENCE_FRAME RF-005 | L-24 plan membership authenticates nothing |
| 25 | The context a task needs is interdependent and does not fit one actor | Narrowing the task lawfully, handing it to another capable actor, or a truthful stop keeps the material obligations. | ACTIVATION §2 step 3, §4 Refinement; REFERENCE_FRAME RF-014 | T-01 |
| 26 | A frame fits its byte limit but irrelevant material obscures a required dependency | Size alone does not establish adequacy. Keep the material dependency, exclude irrelevant material and evaluate actual use under the [frame requirement](ACTIVATION.md#2-context-construction-under-an-envelope). | ACTIVATION §2 steps 2 and 3; EVALUATION §7 Frame qualification; REFERENCE_FRAME RF-003, RF-004 | L-26 fit is not attention; the actual use it calls for is the frame qualification of EVALUATION §7 |
| 27 | A frame or task changes after its trial, or actor instructions supply the expected answer | Bind the actual tested packet and independently specified expectations. Report the narrower evidence; a rewritten trial or matching source pin does not establish current task sufficiency. | EVALUATION §7 Frame qualification (Adequate attention), §3 Protocol | L-27 |
| 28 | An author opens a fresh context to review its own candidate | A new context does not establish independent authorship or supply missing review authority. Ported contributions retain their authorship; the contributor's review cannot supply independent acceptance of them. Relevant common sources may still be shared by an independent reviewer. | EVALUATION §3, including authorship of a received contribution; ACTIVATION §1 Configuration (Reconfiguration) | L-28 a fresh context is not independence; a contributor's reading of its contribution is not independent acceptance |
| 29 | A coordination frame omits frontier items from its current attention | Excluded work remains open; a bounded view cannot silently dispose it. The next decision retains its material dependencies. | ACTIVATION §1 Transitions (Open work outside attention); REFERENCE_FRAME RF-015 | L-29 out of view stays open |
| 30 | A new observation exposes more obligations, or a destination is revised to make the current candidate pass | Discovery may increase the frontier while improving knowledge. Counts alone do not measure progress. A revised destination requires its owning decision and cannot establish that the original destination was reached. | ACTIVATION §1 Transitions (Discovery, Destination change, Completion, Progress), §5 (Progress) | L-30 discovery and destination change |
| 31 | One directly authorised task fits a sufficient frame | The generic method permits the direct activation, subject to any separately required assessment. It imposes no fixed role inventory or actor sequence. | ACTIVATION §1 Configuration (Allocation, Direct entry), Roles and delegation | L-31 direct entry |
| 32 | A peer configuration has no central Executive, or a task uses responsibilities outside the familiar three roles | Evaluate the configuration against the task, dependencies, actor limits, authority and required assurance. Different labels or topology neither reject nor accept it. Each separately adopted configuration retains its own scope. | ACTIVATION §1 Configuration (Allocation, Evaluation of a configuration, Example); EXECUTIVE_BASELINE §16 | CD-01 |
| 33 | Actors redistribute work during execution, including work with effects of uncertain completion | The permitted reconfiguration retains outstanding obligations and result dependencies, resolves material effect uncertainty before dependent action, and preserves authority and required independence. Self-organisation supplies no exemption from these conditions. | ACTIVATION §1 Configuration (Reconfiguration), §3 Effects, §5 | CD-01 |
| 34 | An arrangement is called optimal because it is familiar, persistent or self-organised | Adequacy and optimality remain separate claims. An optimality claim needs stated objectives, constraints and comparison scope with supporting evidence. Different models or objectives can favour different configurations. | ACTIVATION §1 Configuration (Optimality) | L-34 optimality is a separate claim |
| 35 | A coordinator receives a compact task result that omits a blocker material to delivery | Small size is insufficient. The coordinator retains the longer-term outcome and acquires the information needed for the next decision through its permitted frame inputs. Missing information cannot be assumed favourable. | ACTIVATION §1 Configuration (Coordination across tasks), §7 | L-35 a compact result hides no blocker |
| 36 | A material dependency changes or a new observation invalidates an earlier claim | Affected applicability and validity are checked before reuse, including when the candidate's bytes are unchanged. Demonstrably independent supported work is kept. | ACTIVATION §7, §1 Transitions (Discovery); EVALUATION §2; REFERENCE_FRAME §10 Revision actions | T-06; L-36 for unchanged bytes and for a frame revision that changes no declaration: harmless explanatory metadata leaves a closed result reusable after the consumer's exact applicability check; newly admitted evidence bearing on a closed result, or a recorded activation found outside its frame's family, reopens that result and the coverage claims that consumed it before reliance, while demonstrably independent results survive |
| 37 | A task packet contains relevant rules but lacks material context or authority | A rule packet alone is insufficient. The activated frame binds the contract, subject, evidence, capability and permitted effects required for the task. | REFERENCE_FRAME §11; ACTIVATION §1 Configuration (Distinct relations), §2 (Activation) | L-37 a rule packet is not an activation |
| 38 | A fresh actor has no private history, and a retained summary disagrees with the current workspace | Acquire the current subject and its authoritative inputs, correct the stale account, retain applicable work and continue within the grant. Discarding context does not erase the workspace or prove an uncertain external effect absent. | ACTIVATION §5 The workspace and an actor's account, §3 Effects | CD-03 |
| 39 | An interruption leaves work partly written | Recovery uses the current workspace and the applicable work state. It does not erase progress or invent a completed assessment. | ACTIVATION §5 (Resumption; The workspace and an actor's account); FOUNDATIONS §4 Results (Not performed) | T-05; L-39 for partly written work |
| 40 | A parse or map succeeds | The claim stays mechanical until independently sufficient semantic and practical evidence exists. | EVALUATION §2, §7 (Derived guidance); AXIOMATIC_CALCULUS AC-018, AC-019 | T-07; L-40 for practical evidence |
| 41 | A change to work carriers or process is proposed as new law | The claimed obligation is justified by its purpose and material relation, or identified as unsupported overhead. | ACTIVATION §6; SPEC_METHOD §4; TICKETS §5 Carrier selection | L-41 new law states its purpose |
| 42 | The same requirements are realised by software, a human team or a mixed process | Each tenant supplies its computational calculus, concrete execution binding and conformance evidence. The governing requirements decide fitness; the kind of executor alone neither rejects nor accepts the realisation. Generic procedures preserve those permitted choices, including an adequate human process using current records and direct observation without code or complete event-history replay ([binding requirement](SPEC_METHOD.md#11-build-tenant-binding)). | SPEC_METHOD §11 rules 1, 2 and 4 | CD-02 |
| 43 | A faster execution plan merges two required independent assessments or substitutes an automated result for a required human decision | Matching outputs or lower cost cannot discharge the lost independence or authority obligation. The binding fails conformance. | SPEC_METHOD §11 rules 2 and 4; EVALUATION §3 | CD-02 |
| 44 | Two environments use one computational calculus, or one actor performs different kinds of operation | Each binding must satisfy the calculus's laws. Different stacks do not force duplicate calculi; actor identity does not determine operation kind or grant authority. | SPEC_METHOD §11 rules 2 and 5 | L-44 one calculus, several environments |
| 45 | An a_c model of a human process passes structural validation | The representation neither selects an automated executor nor establishes that the human process meets its requirements. Execution conformance needs its own applicable evidence. | SPEC_METHOD §11 rule 6; AXIOMATIC_CALCULUS AC-018 | L-45 a model selects no executor |
| 46 | Two loci in one candidate decide the same question | One is the [owning locus](FOUNDATIONS.md#imports-between-members). The other refers to it, or refines it with a mapping back to it. A frame's copy names its owner. No rule of precedence between loci substitutes for an owner. | FOUNDATIONS §2 Imports between members; PRODUCT_DEFINITION §11 | L-46 one owner per question |
| 47 | A member or profile defines its own result values | Its owner maps each value, with its declared predicate and meaning-determining conditions, to exactly one core result. Failure, undecidability, non-performance and unknown effect completion never map to a higher standing. The predicate and domain outcome travel with the core value ([requirement](FOUNDATIONS.md#results)). | FOUNDATIONS §4 Results (Recording, Refinements, the rule that nothing raises standing); ACTIVATION §3; each member or profile that defines result values | L-47 refined values map once, including two effects: one whose declared outcome requires five updates by 12:00, where at 12:01 the evidence establishes three and not whether the effect has ended, is `not_effected` (`falsified`) with the two missing updates as counterexample and the unestablished end as a residual; one whose response was lost with no counterexample observed is `completion_unknown` (`indeterminate`); neither is repeated before reconciliation |
| 48 | A lifecycle label or classification is used to decide admission, compliance or closure | Recorded data and the evaluation or authorised decision remain distinct. The actual determination uses the core result contract; calling it data cannot exempt it, and a core referral cannot replace a missing domain map. | FOUNDATIONS §4 Results (Recording, Refinements); ACTIVATION §3 Disposition; TICKETS §3; SPEC_METHOD §2 Requirement categories and classification | L-48 |
| 49 | A conserved heading now carries a different obligation, or a superseded row names only the old section | Compare the required and permitted decisions on the same material case, including modal force, triggers, scope and exceptions, under the [disposition requirement](RELEASE.md#9-successor-baseline-conservation-stdo-up-015). An indicative rewrite is judged by its meaning, not its grammatical form. Each superseded claim identifies its replacement relation and owning loci; a proposed relation remains pending until accepted. | RELEASE §9, the comparison test on required and permitted decisions, modal force, triggers, scope and exceptions; the claim dispositions on the selected work carrier | L-49; an indicative rewrite is judged by its meaning |
| 50 | A frame's task returns a result | The frame carries the core result algebra or its profile's mapping into it. | each frame whose task returns a result; REFERENCE_FRAME RF-012, §11; ACTIVATION §2 (Standalone scope) | L-50 result-returning frames carry the algebra |
| 51 | A functor or categorical join is claimed | Before the claim, objects, arrows, arrow equality, identity and composition are given and the functor laws are shown. Otherwise the claim is a hypothesis ([standard](FOUNDATIONS.md#4-algebra)). | FOUNDATIONS §4 Formal fragment; EVALUATION §6 Equivalence ladder; AXIOMATIC_CALCULUS §5 | L-51 categorical claims carry their demonstration |
| 52 | A rewrite or refinement step is applied | The law that permits it is declared for the subject. An exact step preserves meaning. An approximate step states its adequacy relation and an end-to-end bound. | ACTIVATION §4 Refinement | L-52 steps are licensed |

Integrated assessment checks the complete declared member set and its
material composition. Local success cannot discharge a contradictory
shared determination, an unresolved owner decision or a required result
gap. Review and acceptance remain the distinct acts owned by EVALUATION.

| No. | Situation | Expected distinction |
|---|---|---|
| J53 | Each member passes its local checks while two members still decide the same shared question differently | An integrated conformance claim requires assessment of the shared owners and their composition. Separate satisfied member results cannot erase the cross-member contradiction. |
| J54 | A member reviewer agrees that a proposed replacement is clear, but no owner decision accepts its changed meaning | Review may support the proposal; dependent member acceptance waits for the exact replacement decision recorded on the selected work carrier. A construction grant does not supply that acceptance. |
| J55 | Some required member criteria are satisfied and another is missing, stale or falsified | The conjunction in FOUNDATIONS §4 withholds member acceptance and preserves all component results. A general favourable verdict cannot replace missing or adverse evidence. Supported inapplicability of a conditional obligation is recorded separately; it does not waive any applicable mandatory criterion. |
| J56 | A control actor answers correctly while the candidate's frame causes an incorrect answer | Preserve the applicable required task judgment under the applicable actual-use claim. Control success neither proves that the fixture supplied the answer nor removes the frame-use failure. Attribution of benefit is a separate claim; an applicability correction needs its own governing reason. |
| J57 | Separate members explain construction, triage and recovery but their consumers cannot carry one feature through the composition | Integrated assessment checks the shared owners and actual deciding path from the selected outcome through bounded work, observation, diagnosis and lawful continuation or closure. Actual-use evidence exercises the applicable path under independently specified expectations; prose alone does not establish use. Existing applicable evidence can support several cases; no separate run per table row is imposed. |
| J58 | Assertion provenance, formal interpretation and execution records exist separately but do not join on the claimed obligation | The affected demonstration follows the source obligation through its interpreted predicate and observed subject to the supported conclusion. It exposes a weak assertion, an insufficient observation and a shared-error case, retaining each claim's bounded standing. |
| J59 | A repair invalidates some claims while other evidence remains applicable | The affected actual-use demonstration selects reassessment from supported impact, preserves known failures and unknown coverage, and combines new results with justified reuse. It exercises both valid retention and a missed-dependency or changed-oracle case; complete fresh execution is not required where the governing assurance is already established. |

A coverage mapping states which cases can exercise a distinction. It is
not a claim that those cases ran or passed. A selected case without a
current assessment remains a planned evaluation without a closed result,
as FOUNDATIONS §4 requires.

### Universal-construction and assurance discriminators

The following nine construction cases and twelve assurance cases state
their complete expected distinctions. UC-n identifies a construction case;
AS-n identifies an assurance case. Each receives a logical-review check
under its local owner, and applicable actual-use evidence where the claim
requires it. A finite model can establish a property only within its
stated model and population; mechanical validity supplies no semantic
fidelity or whole-product conformance.

| No. | Discriminator | Expected distinction | Member sections | Exercised by |
|---|---|---|---|---|
| UC-1 | Internal tasks pass while a required end-to-end feature fails | Keep the outer failure and diagnose the affected join; local completion does not establish Z. | ACTIVATION §1 Composition boundaries; FOUNDATIONS §4 Preservation through construction; EVALUATION §1 | L-UC1 |
| UC-2 | Every selected operation is lawful but the result fails the chosen outcome constraints | Preserve the distinction between admissible construction and delivered outcome. The specification supplies Z; a calculus or lawful execution supplies no automatic satisfaction or acceptance. | ACTIVATION §1 Binding A and Z (lawfulness establishes neither delivery nor optimality); SPEC_METHOD §11 | L-UC2 |
| UC-3 | A report called a bug could concern implementation, requirements or missing observations | Apply one intake and causal diagnosis. Correct the supported affected relation, or acquire evidence and retain unresolved alternatives. The label supplies no repair class or permission. | ACTIVATION §1 Feedback and diagnosis; SPEC_METHOD §4 Universal intake triage | L-UC3 |
| UC-4 | A requirement is weakened until the current realisation passes | A change to Z needs its owning decision and downstream re-entry. It neither proves the former Z nor erases the original counterexample. | ACTIVATION §1 Transitions, Destination change, and Evaluation and completion; SPEC_METHOD §4 change classes; FOUNDATIONS §4 Parallel derivation and mutual assurance (corrections preserve counterexamples) | L-UC4 |
| UC-5 | A predictive model agrees with observations while the required outcome is absent, or predicts incorrectly while the outcome holds | Prediction accuracy and satisfaction of the normative specification are different claims. Diagnose each against its own predicate and support; neither conclusion determines the other. | ACTIVATION §1 Three accounts of the subject; Feedback and diagnosis | L-UC5 |
| UC-6 | A strategy is selected solely by its name, or a cheaper plan loses required assurance | Select within the outcome constraints, using material resource, risk and feedback tradeoffs. Cost savings supply no waiver. Preserve incomparable alternatives and unsupported estimates explicitly. | ACTIVATION §1 Strategy; FOUNDATIONS §4 Quantified assurance (no waiver by a cheaper plan); EXECUTIVE_BASELINE Steel-thread delivery | L-UC6 |
| UC-7 | Every recursive step preserves an invariant but the process does not deliver | Preservation alone proves no progress or termination. State the actual support for continuing or the unresolved stop; no generic termination proof is required merely to perform bounded work. | ACTIVATION §1 Preservation, progress and completion; FOUNDATIONS §3 Construction synthesis | L-UC7 |
| UC-8 | A limit is exhausted, an observation exposes more work, or an ongoing maintenance loop continues | Distinguish attempt termination, useful discovery, continuing maintenance and delivered outcome. Neither elapsed work nor a changed count supplies the conclusion by itself. | ACTIVATION §1 Preservation, progress and completion, and Transitions (Stops); ACTIVATION §6 | L-UC8 |
| UC-9 | A restart or later disturbance contradicts a cached successful result | Reacquire the bound current subject, reopen affected claims and preserve independently applicable work. Resolve uncertain effects sufficiently before a dependent action. | ACTIVATION §5 The workspace and an actor's account; ACTIVATION §7; case CD-03 | CD-03; L-UC9 |
| AS-1 | Every local check passes, but a postcondition does not establish the next precondition or the final property does not imply Z | The member requires the missing preservation or coverage argument and withholds the unsupported end-to-end conclusion. It retains supported local results. | FOUNDATIONS §4 Preservation through construction | L-AS1 |
| AS-2 | A histogram has the right keys but incorrect counts; a key-only test passes | The check establishes only its target predicate. Assertion provenance identifies whether that predicate is a necessary condition or is sufficient for the claimed requirement. A faithful count assertion detects the count defect within its scope. | FOUNDATIONS §4 Assertions and observation (a check of a necessary condition); case AR-01 | AR-01; L-AS2 |
| AS-3 | Two admissible states have identical acquired observations but opposite truth values for the asserted obligation | The checker cannot claim a sound complete decision from those observations. It acquires distinguishing evidence, justifies a narrower scope or returns an indeterminate judgment. Unavailable observation and not-performed evaluation retain their distinct meanings. | FOUNDATIONS §4 Assertions and observation, Observation sufficiency; case AR-02 | AR-02; L-AS3 |
| AS-4 | A test copies its expected answer from the implementation and cites the requirement's digest | Execution provenance and text identity do not establish assertion fidelity or an independent upstream derivation. A supported local regression claim remains usable. | FOUNDATIONS §4 Parallel derivation and mutual assurance (an implementation-derived decision supplies no independent justification) | L-AS4 |
| AS-5 | A human or probabilistic checker can soundly return satisfied or indeterminate on the same observations | The model admits both outcomes. A universal soundness claim covers every admitted conclusion; a selected deterministic model retains its scope, and a probability claim needs its own distribution and evidence. | FOUNDATIONS §4 Assertions and observation (a universal soundness claim covers all admitted conclusions) | L-AS5 |
| AS-6 | Two implementations or reviewers agree through the same wrong interpretation, fixture or received contribution | Agreement is not counted as independent evidence merely because actors differ. Shared causes and port authorship remain visible; validation of the common expectation uses its separate purpose and evidence. | FOUNDATIONS §4 Parallel derivation and mutual assurance; case AR-03 | AR-03; L-AS6 |
| AS-7 | Miss rates are multiplied without conditional independence, or an injected-defect score is reported as whole-product correctness probability | The numerical claim requires its model, justified dependence and calibration scope. Unsupported quantification stays unresolved while bounded observations retain their standing. | FOUNDATIONS §4 Quantified assurance | L-AS7 |
| AS-8 | Finite successful examples or a schema-valid formula are called a proof of a universal preservation law | The formal obligation, its discharged argument, structural checking and bounded execution evidence retain distinct scopes. Bounded work can proceed where its governing conditions permit it. | FOUNDATIONS §4 Formal representation; AXIOMATIC_CALCULUS §9 Constraint surfaces, condition 1 | L-AS8 |
| AS-9 | A governing requirement changes but expected answers and acceptance evidence are silently retained | Affected assertions and applicability are reassessed through the owning change authority. The original evidence and counterexample retain their subjects. | FOUNDATIONS §4 Change impact and evidence reuse; ACTIVATION §7; case AR-04 | AR-04; L-AS9 |
| AS-10 | An implementation or environment dependency changes but the only selection relation is requirement-to-test provenance | Impact includes material execution and validity dependencies. Missing influence information cannot justify exclusion; new uncovered obligations generate work and mandatory gates remain applicable. | FOUNDATIONS §4 Change impact and evidence reuse (a requirements-to-test link is no impact model) | L-AS10 |
| AS-11 | A local repair has supported isolation from an unchanged obligation and its evidence conditions | The applicable unchanged evidence may be retained alongside reassessment of affected claims. The method does not demand full re-execution solely because the subject has changed. | FOUNDATIONS §4 Change impact and evidence reuse (retention) | L-AS11 |
| AS-12 | Selection is cheap but omits a material obligation, or selection overhead exceeds the saved execution | The plan accounts for required assurance, residual uncertainty and total relevant cost. Broader execution is available; cheap selection or a fixed full-suite habit is not evidence of adequacy or efficiency. | FOUNDATIONS §4 Change impact and evidence reuse (cost); FOUNDATIONS §4 Quantified assurance | L-AS12 |

The listed cases are an assessment design. Their execution records bind
current subjects and evidence independently. A mapped case never becomes
a pass by its presence, and a mapping does not exempt a material owner or
consumer from review (P6, P2).
