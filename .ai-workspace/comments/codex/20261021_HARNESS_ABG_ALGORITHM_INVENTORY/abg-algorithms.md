# ABG 5.0 algorithms and the features they serve

Derived commentary, 21 October 2026. Subject: current material source bytes in /Users/jim/src/apps/abiogenesis, based on **727f1dbcab3c198f7704735fdf91b994b7aac243** with **167 tracked changes** at the Writer's initial observation. This is not a clean/frozen release or an installed-package assessment. [SOURCES.json](SOURCES.json) pins each material file, including current authority and candidate design.

The **23 scoped comparison groups** combine two independently closed inventories: eleven definitions/context groups plus thirteen runtime groups, merging their duplicate materialization records into A06. Related stages retain distinct ownership: A11 selects/prepares a current assessment subject; A20 performs generic admitted historical-work reuse. A05 constructs/refines graph definitions; A13 executes admitted child work and causal foldback. Counts are not exhaustive completeness or feature scores. All A/AG/AR identifiers here are commentary only.

Current Product is ABIogenesis 5.0's fifteen selected outcome families. Goals/T-287 currently select STDO3 computational reconciliation and the remaining installed lifecycle/qualification work. The current computational binding is **candidate design reconciliation for independent assessment**, not accepted whole-Product conformance or installed proof. Existing bounded acceptances retain their exact prior subjects. Current-candidate installed lifecycle, F11/sole AF22, qualification and RC1 remain open.

The three accounts stay distinct: ordered steps; meaning and identities of data; concrete TypeScript/Effect/native realization. Closed F_D checks, F_P semantic judgments and F_H owner decisions retain their different authority. Source-defined behavior, expressibility, actual installed operation and improved outcomes are separate claims.

Source routes below are relative to /Users/jim/src/apps/abiogenesis. code/ means build_tenants/abiogenesis/typescript/code/src/. Bare hog/, gtl/, abg/ and implementation/ code routes use that same prefix. design/ means build_tenants/abiogenesis/typescript/design/. Runtime requirement names resolve under specification/requirements/abg/ unless otherwise stated. Source links/lines identify the pinned regions, not completeness of every affected relation.

Evidence statements below are carried from the two closed source inspections. No new tests, builds, native actors, resource recovery, physical effects or benchmarks ran in this Writer activation. They do not transfer historical evidence to the dirty current worktree. See [overview](README.md), [Harness procedures](harness-algorithms.md) and [candidate loan analysis](transfer-analysis.md).

<a id="a01"></a>

Provenance alias: AG01.

## A01 — Validate declarations at successively wider scopes

**Feature/purpose:** Establish whether supplied program declarations satisfy known local, serialized and whole-Program law before dependent execution.

**Algorithmic account:**

```text
check local authored types where that representation supports type checking
admit serialized values against their exact raw carrier schemas
check publication identities, memberships and exact contribution relation
resolve the complete Program definition set and whole-Program constraints
return valid-at-basis, typed invalid diagnostics, or unresolved pressure
```

**Informational account:** Input is a declared Program/publication and its exact GraphFunctions, contracts, implementations, evaluators and rules, not observations of successful work. Output describes declaration validity at that basis. It is neither execution authorization nor evidence that an open-world solution is good.

**Preconditions/invariants/effects/stops:** Erased/foreign inputs must have proper raw admission; identity, callable membership, graph joins, recursion and effect declarations must agree. Environmental support remains runtime admission. Pure checks may retain discardable immutable facts; invalid definitions fail before prohibited effects. No executable lowering or second program authority is created.

**Computational binding:** TypeScript local checking; raw admitted carriers; deterministic Validator loops/indexes and typed diagnostics in `code/validator/validation.ts:629–738,741–765,1945–1954`. Product law: `specification/PRODUCT.md:487–522`. These functions are ordinary pure TypeScript; Effect is not needed to make static validity a runtime effect.

**Evidence status:** Current implementation observed; no new test execution. Current computational reconciliation and exact installed conformance remain separate open claims. There is no basis here for claiming completeness over every retained Program form.

**Harness relation:** Candidate-harness schema/configuration validation could share algorithmic shape. It does not imply equal program meaning, authoritative membership or closure law.

<a id="a02"></a>

Provenance alias: AG02.

## A02 — Construct an exact readiness catalog

**Feature/purpose:** Make the exact installed/published capability set discoverable without inventing an independent runtime registry.

**Algorithmic account:**

```text
canonicalize the explicit immutable binding, lock, products and publications
cross-check binding/lock identity and verified/installed Product correspondence
for every contribution, validate owner, manifest, compatibility and prerequisites
retain each row's admitted/rejected/incompatible/unready disposition
build deterministic indexes over accepted contributions; bind basis digest
return one immutable catalog or typed construction refusal
```

**Informational account:** Input is an exact workspace binding, resolved Product lock, verified artifacts, installation facts and supplied publications. Output is readiness/discoverability for that supplied construction basis. An entry's existence does not say that it is applicable, necessary or permitted for a particular invocation.

**Preconditions/invariants/effects/stops:** Exact digest and dependency relations must hold; missing or mismatched basis refuses. Every submitted contribution receives its owning disposition. Construction is eventless; it does not append ABG events, maintain a lifecycle or confer effects. Immutable memoization is subordinate and discardable.

**Computational binding:** `code/product/catalog.ts:416–480,619–694,697–704`; canonical hashing, maps/indexes and immutable values. `specification/PRODUCT.md` sections Installed Product And Catalog and Definition, Tool, And Runtime Authority own the distinction from runtime admission. Candidate reconciliation routes this existing duty at `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md:184–194`.

**Evidence status:** Implemented algorithm observed. T-287 current-state lines63–86 preserve bounded definition/preparation/installed236 results and explicitly exclude later whole-path claims. No universal readiness or release qualification is inferred.

**Harness relation:** Capability/plugin discovery and configuration enumeration are possible algorithmic analogues; readiness construction must not be confused with a run-history store or a learned archive of successful harnesses.

<a id="a03"></a>

Provenance alias: AG03.

## A03 — Narrow and query a catalog without expanding authority

**Feature/purpose:** Present only an explicit capability subset and resolve exact definitions.

**Algorithmic account:**

```text
reject duplicate or unknown allowlist handles
sort the explicit allowlist and select exactly its callable/non-callable rows
derive a view identity from catalog basis and selected entry identities
look up handle directly, or match definition plus Program membership
return exact, absent or ambiguous resolution; never silently choose a duplicate
```

**Informational account:** The view means a pure narrowing of an already constructed catalog. Querying and knowing a capability are distinct from deciding to use it. An empty permitted set is not permission to import an ambient one.

**Preconditions/invariants/effects/stops:** The catalog basis remains fixed; no new members are introduced. Unknown names, duplicate allowlist entries and ambiguous definition resolution retain explicit outcomes. Pure view construction and queries emit no runtime events. Reusing a view may save work but does not acquire new authority.

**Computational binding:** Hash-index lookup, deterministic filtering and view digests in `code/product/catalog.ts:835–932`.

**Evidence status:** Current implementation observed; no new checks. Accepted catalog/definition evidence retains its original subject and current-context applicability.

**Harness relation:** Candidate-set filtering and tool-surface restriction may borrow these generic techniques. Equal filtering algorithms do not make capability visibility equal to tool permission or evaluator selection.

<a id="a04"></a>

Provenance alias: AG04.

## A04 — Bind a non-callable declaration to an explicit application

**Feature/purpose:** Preserve the identity relation between a selected declaration, target and applied value without treating a declaration as callable work.

**Algorithmic account:**

```text
resolve the declaration in the selected view
refuse if absent or its declared kind differs from requested application kind
combine catalog/view/declaration identities with target and applied-value identities
derive and return an immutable application record
```

**Informational account:** Input supplies the declaration and target/applied-value relation. Output is a deterministic record of that relation. This small function does not itself semantically execute an overlay or verify every caller-supplied value; the appropriate producer/consumer owners remain responsible for those meanings.

**Preconditions/invariants/effects/stops:** Exact view membership and kind must match. This is a construction over immutable values, not ABG event admission, workspace mutation or runtime closure. Out-of-view and kind mismatch are distinct refusals.

**Computational binding:** `code/product/catalog.ts:935–976`, canonical digest and immutable object construction.

**Evidence status:** Implemented and statically inspected; actual end-to-end application validity is outside this function's claim.

**Harness relation:** Artifact/configuration provenance can use equivalent content-binding mechanics. It must retain its own meaning; do not promote a checksum-linked application record into runtime success.

<a id="a05"></a>

Provenance alias: AG05.

## A05 — Compose and zoom through typed graph refinement

**Feature/purpose:** Realize a coarse contract through connected finer computations while preserving its caller-facing boundary.

**Algorithmic account:**

```text
choose lawful inner computations under declared authority (semantic judgment if needed)
for sequence, require the left output to equal the right input and required context
for refinement, identify exactly one outer edge and its actual endpoint contracts
require the inner graph's input/output to join those endpoint contracts
replace that edge with entry-to-inner and inner-to-exit connections
preserve outer input/output; combine declared effects/context and provenance
validate/publish/admit the resulting definition before its governed execution
```

**Informational account:** Input is declared GraphFunctions and a selected refinement locus. Output is another graph definition with finer internal structure and an explicit relation to its original boundary. Zoom concerns the level of construction; it is not intrinsically a special runtime, Python algorithm, language lowering or permission to mutate a live Program.

**Preconditions/invariants/effects/stops:** Unique identities and exact target, contract compatibility and cumulative environment must hold. Current constructors support one exact input/output on each operand and fail on missing target, duplicate graph identity or unavailable bindings. The resulting effect set can include inner effects and still requires lawful authority at admission. Pure construction does not perform those effects. Runtime graph publication/recomposition is outside selected 5.0 Executive governance, which is a release-scope limit rather than lack of algorithmic expressibility.

**Computational binding:** Current `code/gtl/graph_construction.ts:440–562` sequences GraphFunctions; `:565–708` substitutes a finer graph between exact outer edge endpoints. `code/gtl/graph_applications.ts:109–123` records composition/substitution relation. `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md:17–40` declares graph refinement, composition and stable outer contracts. The older `GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md` is historical routing: its old named API is not presumed present in current 5.0 code.

**Evidence status:** Expressed law and current generic composition/substitution implementation observed. No Harness-specific Propose→Probe→Compose ABG composition was constructed or run by this inventory. Expressibility, a packaged policy, actual installed execution and improved outcomes are four different claims.

**Harness relation:** Direct counterpart to structuring Propose→Probe→Compose between ABG nodes. A lawful realization can refine a coarse task/optimizer contract into those operations. What can be borrowed is the concrete proposal/probe/selection/composition strategy and empirical lessons, not the bare existence of recursion or graph nesting. This is an explanatory mapping, not selected implementation work.

<a id="a06"></a>

## A06 — Materialize declared structure and fan-out from exact invocation input

**Feature/purpose.** Obtain the concrete graph and ordered work instances that one already-declared GraphFunction template and admitted input denote. This merges frontier records AG06 and AR02; it is one comparison group.

**Language-independent steps.** (1) Validate the graph template's structure. (2) If no fan-out is declared, retain its declared topology. (3) Authenticate current input against its admitted digest. (4) Validate the declared nonempty ordered member vector, stable zero-based ordinals, member references and record values. (5) Locate exactly one declared batch per fan-out application; project its count/member bindings. (6) Bind definition, invocation and input coordinates and hash the complete materialized body. (7) Return the immutable concrete graph to its validation/traversal consumer.

**Informational account.** Members mean declared work instances, not newly discovered requirements. Definition digest, invocation/input identity and materialization digest name different subjects. Input-driven cardinality realizes a declared template; it does not author or publish an unconstrained new GraphFunction or solution scaffold.

**Conditions/effects/failures.** Wrong input digest, malformed ordering/value, absent/multiply matched batch or invalid graph shape refuses. Pure construction performs no workspace effect and grants no event admission. No hidden interpreter state supplies missing structure. Work grows with selected template/member material; no universal capacity/complexity bound is qualified.

**Computational binding.** TypeScript immutable templates, vector projection and canonical identity in code/gtl/materialize.ts:118–150,153–243,245–332; graph-validation consumer code/validator/graph.ts:69–111. These bindings implement the same construction described at different frontier granularity.

**Evidence/limits.** Both frontiers statically inspected the implementation; no new materialization run was performed. A candidate/probe population can be explicit data for declared fan-out. This supplies neither its search policy nor authority for runtime graph generation/recomposition/publication.

**Harness relation.** H05–H07 describe particular probe/search procedures; H18 describes materialization into an execution environment. Similar projection steps do not erase their different informational roles.

<a id="a07"></a>

Provenance alias: AG07.

## A07 — Select frame-bound current context

**Feature/purpose:** Supply each selected role with the material needed for its actual responsibility while preserving authority and source/currentness distinctions.

**Algorithmic account:**

```text
resolve the declared role/frame and exact invocation environment
select current traversal input, necessary source/context bodies and applicable evidence
establish declared identity, dependency, access and freshness predicates
retain source qualifications, unresolved obligations and assessment disposition
return selected material and its basis, or a typed missing/unknown/refused outcome
ask the declared judgment owner where semantic relevance/sufficiency is not total
```

**Informational account:** Current observations of mutable workspace, immutable source definitions, historical admitted work and candidate results are different data kinds. Context is a usable projection of their declared relations; it does not create execution authority or prove semantic adequacy.

**Preconditions/invariants/effects/stops:** Unknown required material remains a gap; inaccessible locators are not supplied content. Role/frame selection cannot widen a grant. Fresh observation can require a declared read effect; exact admitted role evidence is selected from its actual invocation prefix. Current Product removes an implicit companion-cohort requirement, while affected runtime implementation/proof remains open—source-method adoption is not runtime migration.

**Computational binding:** `code/abg/stdo_environment.ts:321–331` selects exact invocation role evidence; `code/abg/instruction_assembly.ts:307–352` authenticates bound synthesis input and projects permitted capability/context relations; `code/abg/default_library.ts:124–129` obtains current worksite context for selection. Context selector/schema domains are declared in `code/gtl/stdo_run_environment.ts:159–180`. Governing informational law: `specification/PRODUCT.md:710–733,929–983`.

**Evidence status:** Existing binding/context algorithms observed; current native STDO3 environment reconciliation is a selected destination, not a demonstrated migration of every old Run. T-287 lines48–59 explicitly withhold that inference.

**Harness relation:** Role/task context engineering and retained lessons are comparable at the algorithmic level. ABG requires source/currentness/permission/assessment meaning to survive any proposed selection/compression policy; a better selector remains a semantic hypothesis until evaluated.

<a id="a08"></a>

Provenance alias: AG08.

## A08 — Materialize a bounded, attributable worker instruction

**Feature/purpose:** Convert the selected input/context/contracts into the actual supplied prompt and response interface without creating another work selector.

**Algorithmic account:**

```text
authenticate the already-selected call/input/role basis and required contracts
project permitted capability purposes, conditions, effects and response domains
select exact task/source/evidence content under the declared context policy
share only exact repeated text that remains accessible in the same presentation
render sections in declared order; check the declared byte bound
bind plan, envelope, renderer, prompt/schema digests and actual request
return materialized request or typed refusal before dispatch
```

**Informational account:** The prompt is a projection of an admitted call. Exact deduplication preserves content meaning; inventory metadata proves presence/identity rather than semantic adequacy. Canonical response schema and provider carrier schema are separately bound; the latter is not falsely claimed equivalent in every schema feature.

**Preconditions/invariants/effects/stops:** Role/question/rubric/output contract must agree. Required sources and unresolved criteria cannot silently disappear. The assembler does not choose work, authorize tools, invent expected answers or certify success. Overflow, stale basis or missing support refuses. Native transport/provider enforcement occurs after this owned projection.

**Computational binding:** `code/abg/instruction_assembly.ts:233–304,354–393`; `code/product/default_library.ts:244–303` performs exact source containment, selected evidence projection and prior-judgment presentation. Deterministic TypeScript rendering and digesting; native worker requests carry the resulting schema/prompt. Effect/transport is a separate realization boundary.

**Evidence status:** Implemented algorithm observed. No measured prompt-size/cost or semantic-relevance advantage demonstrated here. The current synthesis branch keeps raw-binding checks distinct from its provider schema carrier.

**Harness relation:** Prompt/template mutation, memory selection and context packaging are direct strategy comparison points. A borrowed compression strategy needs its own exact/approximate adequacy relation; language conversion alone proves neither preservation nor savings.

<a id="a09"></a>

Provenance alias: AG09.

## A09 — Synthesize and validate an evidence-responsive registered choice

**Feature/purpose:** Map the original problem to useful permitted contributions, revising the next choice as observations change.

**Algorithmic account:**

```text
present conserved problem, actual observations, previous judgment and permitted domain
F_P judges interpretation, contribution usefulness, dependencies and remaining gaps
F_P explicitly selects one permitted next GraphFunction, or null with supported gaps
validate response keys, support/evidence domains, contribution/dependency relations
bind the unchanged input state, actual judgment and observed producer basis
project a registered choice and verify exact callee digest/input contract
return the candidate/admitted choice through existing admission; do not invent a route
```

**Informational account:** Contributions and dependencies are the current actor's semantic judgment, not an automatic schedule or a proven optimum. Listing a capability does not require its execution. Missing support/capability is meaningful unresolved work; changed evidence can justify changed choice without rewriting original goals or authority.

**Preconditions/invariants/effects/stops:** Only the declared outgoing fixed workflows define the choice domain. Exact observed input, definition digest and child input contract must match. No tool execution occurs in the closed selector call. Required semantic judgment remains F_P; structural validation does not prove suitability. Invalid binding refuses and null choice requires explicit gaps.

**Computational binding:** `code/product/default_library.ts:307–324` strictly binds raw judgment; `code/implementation/default_library.ts:72–85` binds actual native exchange; `code/abg/default_library.ts:89–122` projects actual admitted source; `code/gtl/registered_selection.ts:29–84` validates declared source and target relation. Governing law `specification/PRODUCT.md:735–800`.

**Evidence status:** Current mechanism observed; Goals records earlier accepted deterministic/native/changed-choice recursive witnesses within exact historical limits. Current dirty source and whole release are not qualified by those labels.

**Harness relation:** Closest current default-library counterpart to evidence-guided strategy selection. Harness candidate generation and composition may provide concrete search policies; ABG's registered choice is not automatically a best-of-k execution experiment or a learned optimizer.

<a id="a10"></a>

Provenance alias: AG10.

## A10 — Execute purpose-specific work through one conditional library composition

**Feature/purpose:** Let current evidence select the appropriate bounded contribution without a mandatory SDLC stage sequence.

**Algorithmic account:**

```text
publish/reuse explicitly permitted purpose wrappers and their fixed child contracts
prepare the selected purpose's bounded task with original outcomes and unresolved work
route authoring purposes to native work, Testing to declared command measurement,
and UAT to the exact independent assessment contract
return the truthful bounded report/measurement/assessment to ordinary parent evaluation
preserve original criteria and prior failed evidence through the handoff
```

**Informational account:** Induction, specification, design, construction, testing and UAT have different responsibilities and evidence meanings. Successful Testing can measure failing application behavior. A partial contribution is useful work rather than fabricated parent completion. A complete parent lifecycle need not execute every available wrapper.

**Preconditions/invariants/effects/stops:** Original task and grant remain binding; selected contribution cannot weaken full-original UAT. Testing requires its actual selected files and unchanged command/predicate plan, not a partial substitute. Only existing effect owners perform declared writes/commands. Missing inputs retain gaps; generic recursive traversal, event admission, foldback and parent closure are owned by the separate runtime inventory.

**Computational binding:** `code/gtl/default_library.ts:37–76` publishes wrappers, fixed workflow choices and bounded Executive recursion; `code/abg/default_library.ts:151–206` adapts selected meaning into actual native tasks. Accepted HOW `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:5–39,49–67` specifies the same conditional composition.

**Evidence status:** Current implementation and declared relation observed; historical supplied/faulty S5 and S6 lifecycle witnesses remain bounded evidence. Latest T-287 lines61–86 state that continuation17 stopped after physical installation on an install-scope admission refusal; the complete current red/repair/green/restart path did not run.

**Harness relation:** The architecture can express Propose, Probe and Compose as role-specific graph work and refine their internals further. A stock seven-purpose default library is not proof that Harness's precise policy has already been realized or benchmarked, but its absence as a stock named function is not lack of expressibility.

<a id="a11"></a>

Provenance alias: AG11.

## A11 — Select reusable subject evidence and prepare independent current assessment

**Feature/purpose:** Reuse valid producer work without rerunning its author, while preventing historical or measurement evidence from masquerading as current authorship/acceptance.

**Algorithmic account:**

```text
enumerate unique typed prior observations eligible for Testing or UAT
require the semantic selector to name the intended subject explicitly
authenticate its actual Result, producer, invocation/current-use and workspace relation
compare the producer's own dependency set with current workspace observations
reject invalidated, stale, crossed or ambiguously selected support without fallback
bind current source/candidate/rubric identities and a distinct read-only assessor task
preserve old evidence and unmet criteria; obtain a fresh judgment where required
```

**Informational account:** A command measurement is observation provenance, not authorship. Typed candidate eligibility is not suitability, permission, freshness or assessment. A new rubric may be current assessment input without retroactively becoming an old producer dependency. Historical assessment remains historical; new parent/current-use judgment is separate.

**Preconditions/invariants/effects/stops:** No fabricated producer or dummy author is required for supplied work. Selected missing/stale evidence refuses rather than silently switching to a different source. Actual current bytes and invalidating effects govern reuse. Sources/candidate/rubric must be accessible, and assessor context must preserve the full original criterion, independent role and no-write grant. The generic event/currentness/recovery mechanisms are outside this record's algorithmic ownership.

**Computational binding:** Typed domain `code/product/default_library.ts:143–156`; subject/provenance checks `code/abg/default_library.ts:131–149`; dependency/current-candidate and read-only assessment construction `:170–201`. Parent current-evidence check `:298–317` prevents a historical verdict alone from becoming current terminal truth. Accepted HOW `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:231–276` explains this distinction.

**Evidence status:** Implemented relation observed; earlier accepted retained-work/installed supplied-candidate proof retains its original scope. Current complete install/reuse/continuation relation is a named design/integration frontier, not closed by this inventory.

**Harness relation:** Execution trace reuse, retained harness artifacts and carried lessons can share selection/invalidation techniques. Different retention/admission/authority semantics prevent equating an optimization archive with admitted current evidence. This is a particularly useful loan-analysis boundary.

<a id="a12"></a>

Provenance alias: AR01.

## A12 — Direct algebraic traversal of the admitted program

**Feature/purpose.** Execute composition, evaluation and return through one traversal of the original admitted GTL/C structure rather than lowering it into another executable plan.

**Language-independent steps.** (1) Authenticate the execution basis, materialized graph, current cursor and current input. (2) Resolve the declared C term at that source position. (3) For a structural term, derive/admit its lawful transfer and reselect the actual progressed input. (4) For a leaf or workflow term, invoke its declared owner seam. (5) Consume an admitted outcome: advance, bounded retry, child request, hold, failure or completion. (6) Push a parent return obligation before entering a child; discharge it on return. (7) Repeat until a truthful terminal/held/failed result is reached.

**Informational account.** Inputs are Program/GraphFunction/materialized Graph, exact basis, cursor and causal current input; output is a traversal completion and successor admitted prefix. Graph-entry input remains distinct from progressed input. The machine stack represents remaining declared returns, not a new topology or independent runtime authority.

**Conditions/boundaries.** Invalid graph/cursor/source path or unavailable selected input refuses. Traversal does not manufacture policy, graph membership or effects. F_P suitability/evaluation occurs only at its selected leaf; HoG follows admitted results. Structural progression and leaf admission remain distinct, even when composed by one fold.

**Current realization.** `hog/graph_execute.ts:581–742` uses `Effect.iterate`, `suspend`, `flatMap` and an explicit evaluate/return/done machine; `1319–1385` exposes Effect and host entries. `hog/traversal.ts:223–245` resolves the exact source term. Effect 3.22.1 is the execution binding, not GTL semantic authority.

**Evidence/limits and comparison use.** Code inspected; retained bounded direct-traversal/composition proofs exist, but this inspection ran no tests and does not qualify current dirty source. A controlled Propose→Probe→Compose procedure can be expressed with these ordinary computations; its particular proposal/search/selection policies are separate algorithms, not supplied merely by possessing this fold.

<a id="a13"></a>

Provenance alias: AR03.

## A13 — Child zoom, bounded recursion and causal parent foldback

**Feature/purpose.** Evaluate a finer-grained declared computation between parent positions and return its result through the original parent contract.

**Steps.** (1) At a declared workflow/recursive boundary, verify parent basis/scope and permitted child membership. (2) Resolve the exact child and child closure contract. (3) Materialize/validate with the producer's admitted output as child input; admit child basis and open its scope. (4) Preserve parent cursor, entry/current inputs and remaining return obligation. (5) Execute the child through the same HoG. (6) On completion authenticate child Result/J/closure and foldback relation; preserve held or failed states truthfully. (7) Rebind the returned input and reevaluate the parent. (8) Terminate under the declared predicate or stop at the recursion bound.

**Meaning.** Child GraphCall, Frame, ExecutionBasis and input are distinct identities with explicit parent/return relations. Deeper work does not create broader authority, another user task or automatic parent satisfaction. Zoom here means the controlled change of computation granularity through those existing relations, not a second executor.

**Conditions/boundaries.** Missing callable/closure contract, wrong Program/basis, unsupported child validation, incomplete result/judgment coordinates, stale foldback or exhausted bound stops. A child success alone cannot close its parent; failed physical effects remain attributable. Parent reevaluation can require F_P judgment, not merely a boolean child-success check.

**Binding.** `hog/child_traversal.ts:133–245`; `hog/recursion_lifecycle.ts:609–727,782–862` and later ordinary foldback; `hog/traversal.ts:518–553`; `hog/graph_execute.ts:604–627,682–728`.

**Evidence/limits and loans.** Code inspected; historical installed recursion/foldback acceptances are bounded to their subjects. This is existing computational support for nested scaffold experimentation. Harness²'s concrete proposal/probe/composition strategy is not equivalent to the generic child/foldback primitive, but can be evaluated as an application over it.

<a id="a14"></a>

Provenance alias: AR04.

## A14 — Candidate result and judgment admission

**Feature/purpose.** Keep a worker/effect result, its structural validity, its evaluation and its admitted runtime standing distinct.

**Steps.** (1) Resolve the exact opened call, owner receipt and held predecessor. (2) Validate raw result framing and declared output/failure contract. (3) For F_P, authenticate actual actor transport/artifact/provenance against the call and assembly. (4) If malformed but retry-eligible, retain the rejection under declared retry law; if a physical native failure contains actual observations, retain those as failure rather than invent success. (5) Stage evidence and Result in one owned transaction and commit. (6) Derive/receive the declared judgment candidate from that exact Result. (7) Recheck the result-prefix/replay relation and admit judgment or typed rejection.

**Meaning.** Candidate ≠ admitted Result ≠ Judgment ≠ task completion. CCall/actor/input/output/Result/J digests preserve producer identity. F_P output remains attributed judgment/material; mechanical admission proves its contract/provenance relation, not semantic correctness.

**Conditions/boundaries.** Receipt/contract/basis/transport mismatch refuses. Result admission owns its transaction and rejects nesting. A refused report cannot erase already performed work or become an advancing successful result. Admission itself writes ABG facts; worker/implementation code returns candidates and cannot write its own authoritative success.

**Binding.** `abg/c_call_outcome.ts:1190–1286,1294–1348`; `implementation/native_workspace_work.ts:25–66`; declared leaf invocation owners in `implementation/leaf_invocation_port.ts:247–287,523+`.

**Evidence/limits and loans.** Code inspected, no new actor trial. Harness output parsers or experiment extractors might be adapted below this seam; they do not replace ABG evidence/result/judgment admission laws.

<a id="a15"></a>

Provenance alias: AR05.

## A15 — Expected-prefix event admission and durable transaction commit

**Feature/purpose.** Commit one causal runtime successor at the held owner's exact predecessor.

**Steps.** (1) Authenticate current owner/store, contract profile, event kind and candidate relation. (2) Verify expected causal prefix/physical identity and reject nested transactions. (3) Validate finite staged candidates against the preceding admitted/staged rows. (4) Encode complete logical events, compute physical row/prefix digests and write all bytes. (5) Flush with fsync before publishing the successor metadata/prefix. (6) On error restore the previous owned extent; if restoration fails, release/poison ownership and retain both failures. (7) Expose the committed successor, not tentative staging, to downstream effects.

**Meaning.** Logical runtime fact, physical encoded row, historical prefix and held current predecessor are distinct. Atomicity here is the Event Store transaction relation, not a distributed transaction covering arbitrary external workspace effects.

**Conditions/boundaries.** Copied/foreign store, stale expected prefix, unsupported dedicated-ingress event kind, nonempty transaction with no durable events or changed owned history refuses. Physical append effects are exclusively Event Store-owned. This supports exclusive held resource ownership, not arbitrary simultaneous external writers to the log.

**Binding.** `abg/event_store.ts:2257–2313,4010–4060,4152–4212,4222–4274,4342–4352`.

**Evidence/limits and loans.** Current source inspected. Prefix/commit law is an ABG runtime responsibility; copying Harness traces or serializing its messages cannot confer it. Codec/layout/index implementation may be independently optimized only with complete logical value and failure-boundary conservation.

<a id="a16"></a>

Provenance alias: AR06.

## A16 — Incremental Event Calculus fluent derivation

**Feature/purpose.** Derive temporal availability/currentness/lifecycle truth from admitted events and declared initiation/termination/clipping laws.

**Steps.** (1) Acquire an authenticated prefix and the existing derivation at its exact owned base. (2) Process only the unconsumed admitted suffix. (3) Resolve the event's declared effect and required dependency facts; check special liveness relations where applicable. (4) Apply initiation, termination, clip and de-clip to scoped fluents; preserve historical transitions. (5) Return current holds for ordinary use, or explicitly reconstruct complete source/effect rows for a complete historical request. (6) Derive the same state from cold authenticated history when no live derivation exists.

**Meaning.** Happens is an admitted event; HoldsAt is a derived relation. Runtime fluents name scoped facts, not model beliefs or globally true statements about the world. The live map is discardable derived state, never an independently writable source of truth.

**Conditions/boundaries.** Unknown effect/profile, foreign prefix, invalid native threshold source or invalid fluent identity refuses. EC does not choose work or repair policy. An external process observation changes admitted runtime truth only through the owning event ingress.

**Binding.** `abg/event_calculus.ts:73–114,143–386,1958–2025,2157–2194`; `design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md:9–49`.

**Evidence/limits and loans.** Code inspected; existing component/installed evidence is bounded. Suffix processing is explicit, but dependency extent and cold/full-output work remain material and cannot be assumed constant. A Harness lesson store is not equivalent to this fact calculus; both can use maps/sequences while retaining different semantics.

<a id="a17"></a>

Provenance alias: AR07.

## A17 — Cold replay, exact resource reacquisition and recoverable projections

**Feature/purpose.** Reconstruct runtime state and lawful pending work after process/resource boundaries without fabricating execution.

**Steps.** (1) Select a genuine close/reopen authority or supported interrupted-resource origin. (2) Establish quiescence/exclusive ownership and physical resource identity. (3) Verify exact byte extent, digest and event-contract profile, decode and validate history. (4) Reconstruct scoped event/EC/route/call/current-input projections under exact declarations. (5) Produce an owned replay guard for ordinary internal use. (6) Materialize a complete ReplayState only when its contract explicitly requests that full output. (7) Expose pending obligations/current positions for their owning continuation operation; do not automatically repeat effects.

**Meaning.** Recovery restores admitted history, not current physical-worksite truth. A replay digest, complete public output and private owner guard have different operational roles. Failed historical Runs remain failed even if later work succeeds.

**Conditions/boundaries.** Wrong inode/path/extent/digest/profile, live former owner, unsupported empty origin or resource change during read refuses. Recovery cannot infer successful dispatch from files or substitute a copied earlier state for original provenance.

**Binding.** `abg/event_store.ts:3828–3868,3943–4006`; `abg/replay.ts:181–232,864–911`; HoG resume reentry `hog/graph_execute.ts:1319–1353`.

**Evidence/limits and loans.** Code inspected; no new recovery operation. Cold/full reconstruction may process the selected history; this inventory claims no capacity or performance bound. Experiment resumption algorithms can borrow replay organization, but ordinary Harness trace continuation is not automatically equivalent to ABG exact recovery/authority.

<a id="a18"></a>

Provenance alias: AR08.

## A18 — Bounded retry eligibility, attempt identity and progress conservation

**Feature/purpose.** Permit a same-declared-boundary retry only when its failure class, progress and remaining allowance justify it.

**Steps.** (1) Resolve the enclosing declared retry context from the exact graph cursor. (2) Derive its admitted attempt/progress frontier. (3) Check complete attempt and prior-progress coverage and that this exact attempt is active. (4) Classify the failure against the shared retryable vocabulary. (5) Reject repeated stationary failure, unsupported failure, replay gap or exhausted budget. (6) For an eligible retry, derive/admit the next attempt manifest and continuation/progress relation using original scope/input/causation. (7) Continue through the normal HoG boundary, preserving already admitted evidence.

**Meaning.** Attempt number, retry boundary, Run/GraphCall/Frame, authority and failure-signal identity jointly define retry. Recursion depth, transport retry, semantic revision and a fresh selected action are different relations; available model calls alone authorize none of them.

**Conditions/boundaries.** Typed outcomes include not_in_retry, replay_gap, not_retryable, stationary, budget_exhausted and retry. Retry must not reset allowances, erase failed attempts or repeat a possibly active effect merely because a result is absent. Semantic repair selection can require F_P; eligibility over the admitted retry algebra remains mechanical.

**Binding.** `abg/retry.ts:868–891,4901–4924+,5097–5184,5230+,5859+`; scoped fluent identity `abg/event_calculus.ts:73–114`; HoG retry reentry `hog/graph_execute.ts:669–680`.

**Evidence/limits and loans.** Code inspected, no new retry trial. Harness sequential improvement rounds can supply a bounded search policy, but are not identical to ABG's execution retry operation. They should not be grafted onto this retry counter without a semantic equivalence evaluation.

<a id="a19"></a>

Provenance alias: AR09.

## A19 — Exact pending execution/selected-action continuation

**Feature/purpose.** Resume the still-open declared execution boundary with its progressed input and remaining returns rather than restarting the original task.

**Steps.** (1) Resolve the chosen open continuation and its exact admitted digest. (2) Reconstruct original/current basis, graph, cursor, Program validation and selected intent. (3) Authenticate the actual completed producer/Result/J/evidence and pending consumer phase. (4) Check supported topology, preserved allowances and same authority, or the explicit covering reprice/current-use relation. (5) Prepare only the still-pending occurrence and its parent-return chain. (6) Admit continuation use/reentry and execute through ordinary HoG. (7) Leave prior terminal identities and unfulfilled assessment obligations intact.

**Meaning.** Continuing the same selected execution is distinct from selecting new graph work toward the same outcome. A replacement Run receives causal linkage; it does not inherit the old Run/Continuation identity or claim an old actor execution as new work.

**Conditions/boundaries.** Missing producer/current input, wrong basis, unbound authority change, unsupported topology or already discharged continuation refuses. The inspected scalar pure-producer path explicitly excludes effects/composites and extra retry/task ordinals; broader selected-action paths have their own checks. This record claims no universal continuation over every legal graph shape. Native human response/resume is outside the 5.0 release allocation despite retained code/types.

**Binding.** `abg/construction_continuation.ts:770–840,1710–1786,1987–2013`; `hog/graph_execute.ts:1014–1071,1319–1353`; `design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md:74–112`.

**Evidence/limits and loans.** Source inspected; bounded historical exact-intent/selected-action acceptance is recorded in GOALS, not transplanted onto current dirty source. Harness restart convenience does not substitute for these phase, effect and authority checks.

<a id="a20"></a>

Provenance alias: AR10.

## A20 — Valid retained evidence reuse under current applicability

**Feature/purpose.** Consume still-valid completed producer work in a new/current call without redoing it or laundering its ownership.

**Steps.** (1) Resolve the historical source resource/declaration and authenticate its ancestry to the selected current prefix. (2) Reconstruct its actual producer Result/J/terminal scope and compare supplied value/provenance. (3) Resolve the current workspace/install/binding authority and any required covering relation. (4) Check the current invocation explicitly permits the selected historical source. (5) Check every relevant dependency/current observation and exact selected source/command contract. (6) Construct the current consumer task, retaining historical producer and assessment status. (7) Refuse stale/ambiguous/uncovered evidence rather than silently picking a replacement or repeating the producer.

**Meaning.** Reuse means admitted AND dependencies-still-valid AND applicable-to-this-use. Equal bytes are insufficient producer identity or authority. Current consumer provenance and original producer provenance remain distinct; independent assessment is not inherited from mere reuse.

**Conditions/boundaries.** Wrong source ancestry, source Result/J mismatch, unknown binding cover/currentness, unadmitted source-use, absent dependencies or changed exact command plan refuses. Mechanical preparation grants no new effect authority.

**Binding.** `abg/native_work_reacquisition.ts:61–108,130–198`; Product `PRODUCT.md:802–839`; exact operation-specific currentness joins continue in `abg/native_worksite_execution.ts`.

**Evidence/limits and loans.** Code inspected; bounded retained-work installed acceptances exist under their original subject. Cache selection, retrieval and key/index algorithms are potentially commonizable machinery. Their semantics must preserve the original source-use/currentness law; a retrieval score or remembered lesson cannot establish this admitted reuse relation.

<a id="a21"></a>

Provenance alias: AR11.

## A21 — Physical effect observation, residue and dependent currentness

**Feature/purpose.** Relate physical workspace changes to immutable observations and admitted evidence, including partial/failing operations.

**Steps.** (1) Establish current physical observation, selected roots/capability grant and owner task. (2) Recheck the before observation immediately before dispatch. (3) Perform only the declared effect owner invocation. (4) Observe after execution even on timeout, malformed result or transport failure. (5) Compute changed paths/scope violations and bind actual actor/report/receipt. (6) Return success/failure candidate with observed residue; if after-state is unavailable retain unknown. (7) On admission retire observations whose paths were changed, or whose declared writable scope may have changed when the after-state is unknown; establish successor currentness only from real covering observation/receipt.

**Meaning.** W is mutable physical state; an observation is immutable evidence about it. Physical success, returned report, admitted Result and semantically sufficient outcome are four different claims. Unknown is neither rollback nor success.

**Conditions/boundaries.** Stale before-state, wrong authority, scope violation, contract failure or assessment actor/producer collision refuses or returns typed failure. Native agent internal tool steps retain their own strategy; boundary observation is not a security containment guarantee. File-replace and broad native-work owners retain different receipt/currentness domains.

**Binding.** `implementation/native_workspace_work.ts:25–66`; `abg/event_calculus.ts:511–585,588–618,675–690`; native effect source/currentness in `abg/native_worksite_execution.ts`.

**Evidence/limits and loans.** Source inspected, no physical operation. Harness worktree/sandbox/patch probes are potentially useful realizations or effect owners, but their success does not bypass before/after identity, residue, source-currentness or ABG result admission.

<a id="a22"></a>

Provenance alias: AR12.

## A22 — Native proof acquisition, coverage and exact qualification reduction

**Feature/purpose.** Authenticate assessment evidence and reduce the declared qualification population without treating structural success or missing evidence as semantic acceptance.

**Steps.** (1) Bind an exact candidate, law basis, assessment plan/slots and required independence. (2) Resolve each evidence selection through its actual durable prefix, owner call, input, Result/J and declared slot. (3) Reconstruct construction authors and reject disallowed assessor overlap. (4) Preserve known findings/citations alongside unresolved coverage; require the exact native self-conformance owner where the verdict contract requires it. (5) Invoke the sole declared qualification reducer on those admitted inputs. (6) When consuming the verdict, reauthenticate exact subject/law basis, unique producer, ordinary terminal relation and actual native result. (7) Keep unproved/failed/uncovered outcomes non-green according to the owning semantics.

**Meaning.** Claim coverage, assessment applicability, evidence provenance, semantic judgment and eligibility for release are distinct. F_P supplies judgments over open semantic questions; F_D authenticates/reduces only the declared closed relations. Independent actor identity alone is insufficient without authorship/provenance constraints.

**Conditions/boundaries.** Missing/duplicate slot selections, forged/dangling refs, changed candidate/law, invalid native owner or insufficient independence refuses. A test pass or codec equality is bounded evidence, not whole-product qualification. Human Product acceptance remains a separate owner decision.

**Binding.** `abg/qualification_proof.ts:119–147,265–290,521–574,648–672,822–881,884–919`; requirements `REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md:70–132` preserve evidence/fold/residual authority separation.

**Evidence/limits and loans.** Current code inspected; bounded genuine assessment/conservation evidence exists historically. Current all-family qualification and same-RC acceptance remain open. Harness differential probes and selectors can become attributed evidence/experimental algorithms; they do not transport ABG proof/admission laws by being wrapped in a GraphFunction.

<a id="a23"></a>

Provenance alias: AR13.

## A23 — Exact scope/Run closure with quiescence and causal completion

**Feature/purpose.** Admit completion of the selected scope only when its actual result, judgment, route, contract and remaining runtime obligations permit closure.

**Steps.** (1) Acquire the exact held durable predecessor. (2) Rehydrate the admitted call/result/judgment and opened scope. (3) Authenticate their shared causal references and the declared terminal route/closure contract. (4) Check the scope class, required evidence and pre-closure quiescence/current runtime relation. (5) Stage terminal-reached, frame-closed and graph-call-closed events; include Run closure only for the root scope. (6) Append the causal batch atomically against the same predecessor. (7) Return closure coordinates and replay-derived state; on concurrent/stale predecessor refuse without fabricating closure.

**Meaning.** Child closure is not parent closure. A closed failed Run, completed child, parseable response and satisfied user outcome are distinct subjects/claims. The closure owner consumes admitted semantic evaluation; it does not create the missing evaluation or suppress residual obligations.

**Conditions/boundaries.** Stale prefix, missing exact CCall/scope, mismatched Result/J/route or nonterminal judgment refuses. Process resource cleanup and semantic completion remain separate; a process exit cannot be substituted for the selected closure predicate.

**Binding.** `abg/closure.ts:121–190,352–435,600–696`; parent return/reevaluation remains in A13/A12. The exact generic closure contract, not this inventory prose, defines the complete checks.

**Evidence/limits and loans.** Code inspected; accepted bounded ordinary parent/Run closures are historical witnesses, not blanket current release acceptance. Harness experiment completion/signals can be mapped as candidates, but do not establish ABG enclosing closure without this owner relation.
## Preserved Product limits

GTL remains the semantic Program source; HoG directly traverses admitted structure; ABG exclusively admits runtime events and derives Event Calculus/replay truth. SDK/CLI/native adapters stay declared invocation/effect seams. A compiler, generated execution plan, second controller/runtime, rival catalog or private event writer is not inferred by this inventory.

Propose–Probe–Compose was already intended to be expressible through composition/zoom and is supported by the current generic composition, materialization, traversal and child-return mechanisms. A particular stock policy, installed Harness-specific trial and quality/cost superiority remain unproved. Selected 5.0 preregistered-workflow governance does not admit autonomous runtime generation/recomposition/publication of arbitrary new GTL definitions; dedicated observer/tuner and native human response/resume remain outside the 5.0 allocation.

