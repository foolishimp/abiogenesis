# Strategy: Requirements Algebra Over Traversal Edge Spans

Status: strategy commentary, not ratified specification.
Date: 2026-06-26
Author: codex
Scope: abiogenesis, GTL/ABG requirement pressure, edge assurance, downstream
ODD products such as odd_sdlc

## Claim

ABG needs an algebraic representation of requirements.

The current system already carries obligation refs, residual pressure refs,
target-carrier refs, materialization refs, staged-authority refs, and assurance
fold outcomes. The missing center is that these ledgers are not all projected
from one explicit requirements algebra. That gap lets downstream products
repair symptoms by adding separate obligation, materialization, execution, and
closure ledgers, then later struggle to join them consistently.

The inversion should be:

```text
requirements ledger
  -> obligation projection
  -> materialization target projection
  -> evidence binding projection
  -> closure fold projection
  -> residual/re-entry projection
```

Ledgers should fall out naturally from the functional requirements of a
requirements ledger. They should not be peer inventions.

## Existing ABG Direction

ABG already points toward this.

- `REQ-L-GTL3-COMPUTE-NOTATION-027` describes a traversal unit as
  `traverse<A, B>(intent_lineage, context, A) -> (B, obligation_delta)`.
- `REQ-R-ABG3-FN-COMP-023` requires bind/close to carry or account for admitted
  intent refs, lineage refs, carried obligation refs, target-carrier refs,
  materialization/output-allocation refs, residual pressure refs,
  staged-authority refs, admission-strength refs, and downstream terminal
  pressure.
- `specification/PRODUCT.md` already names ABG as owner of admission,
  interpretation, runtime events, payload ledgers, assurance fold, traversal
  transition, continuation, correction, and replay.

The missing step is to make "carried obligation refs" and "residual pressure
refs" be projections of explicit requirement terms with spans, rather than
mostly string ids that each product interprets locally.

## Layering

ODD, KAOS, GTL, and requirements algebra should not be collapsed into one
surface.

The intended layering is:

```text
ODD methodology
  governs product meaning, domain assets, proof surfaces, graph functions,
  release pressure, and lawful re-entry

KAOS-style requirements discipline
  supplies goal/refinement/assumption/obstacle/agent/operation semantics

GTL
  is the LLM-first algebraic authoring language and wrapper surface for
  graph-native product declarations; a human interacts with an agentic coder to
  define, refine, and admit GTL

ABG requirements algebra
  is the underlying implementation substrate for requirement identity,
  relations, spans, projections, evidence bindings, folds, residuals, replay,
  metrics, and query
```

Requirements algebra is therefore an extension of the GTL/ABG constructive
system, not a peer language beside GTL. GTL wrappers should expose the algebra
to human-agent authoring; the ABG substrate should manage the durable
requirement model, projection, fold, and replay mechanics.

## Product Composition

There are two product layers:

```text
WHAT
  product meaning, intent, requirements, domain assets, constraints,
  proof expectations, release pressure

HOW
  GTL graph functions, operations, runtime events, evidence, folds,
  residuals, continuations, release mechanics
```

The product is the composition:

```text
(WHAT).(HOW) = Product
P = W.H
```

The product is recursive because products can build, evaluate, release, and
install products, including later cuts of themselves:

```text
P = P(P)
```

The sharper ODD/GTL form is:

```text
P = W(W.H)
```

`W.H` is the constructive composition of product meaning and realization. `W`
then governs, interprets, and evaluates that composition as a product. This
keeps HOW from becoming an ungoverned implementation artifact and keeps WHAT
from becoming inert prose.

Spec method starts from `WHAT -> HOW`, but ABG needs a stronger decomposition
because the product artifact is not just produced code. The product artifact is
an asset/assurance pair:

```text
A_P = A(P.asset, P.assurance)
```

`P.asset` is the realized domain asset, source, build output, runtime behavior,
or released install. `P.assurance` is the admitted proof surface that the asset
realizes the WHAT under the governing method.

`A_P` cannot usually be instantiated by one compute. It must be decomposed into
requirement WHAT terms that preserve the product meaning while HOW realizes
each part:

```text
decompose_W(A_P) -> Req.what*

Req.what_i =
  <meaning_i, span_i, asset_projection_i, assurance_projection_i,
   evidence_policy_i>

H(Req.what_i) ->
  <P.asset_i, P.assurance_i, Fold_i, Residual_i>

fold_i(P.asset_i, P.assurance_i, Residual_i) -> A_P state
```

`Req.what` is the carrier that lets an uninstantiable product asset/assurance
pair become graph-function work without losing the WHAT. It is not merely a
line item in a requirements document. It is the typed decomposition term that
connects product meaning to asset construction, assurance construction, tests,
folds, and residuals.

### Requirements As Carrier / Functor

Requirements act as the carrier between product-meaning categories and
realization categories. When the mapping laws are explicit, they are
functor-like.

```text
C_W = WHAT category
  objects: gap, problem, intent, product meaning, domain assets, constraints,
           requirement claims
  morphisms: refinement, dependency, conflict, assumption, reprice,
             decomposition

C_H = HOW category
  objects: destination topology, instruction set, graph function, asset
           projection, materialization target, execution state
  morphisms: traversal, operationalization, materialization, execution,
             continuation

C_A = Assurance category
  objects: proof expectation, oracle, evidence, evaluator finding, fold,
           residual
  morphisms: bind, evaluate, fold, residualize, re-enter
```

The requirements carrier maps WHAT into HOW and assurance:

```text
Req : C_W -> (C_H x C_A)

Req(W_i) =
  <span_i, asset_projection_i, assurance_projection_i, evidence_policy_i>

Req(f : W_i -> W_j) =
  <projection_dependency_f, fold_dependency_f, residual_route_f>
```

The preservation laws are the reason this is more than traceability:

```text
identity:
  Req(id_W) = id_Req(W)

composition:
  Req(g o f) = Req(g) o Req(f)

decomposition:
  Req(decompose_W(A_P)) composes back to A(P.asset, P.assurance)

residual conservation:
  if Req cannot preserve a morphism, it must emit residual or re-entry pressure
  at the owning stage instead of silently dropping the signal
```

This is the theoretical role of requirements in multi-stage computation. They
carry the `A -> Z` signal through finite graph-function steps. A requirement is
lawful only when its mapping into HOW and assurance preserves, folds, or
explicitly residualizes the relevant WHAT relation.

## Context And Constraint Staging

Context is not one flat prompt. Constraints can enter at different stages and
must retain their origin because the correct response differs by stage.

The upstream framing chain is:

```text
{ Homeostatic Gap -> Problem -> Solution Space }
  -> WHAT({ Intent } -> { Product } -> { Requirements })
  => Requirements.decomposition
```

The HOW chain is:

```text
HOW({ Destination Topology }.InstructionSet)
```

`DestinationTopology` is the introduced constraint framework that the incoming
WHAT signal must conform into during HOW. It can be a technology stack, runtime
model, packaging model, work-surface topology, deployment topology, proof
topology, regulatory framework, tenant framework, or any other realization
frame. In this repo family, `build_tenants/` is the concrete representation for
technology-stack destination topology: tenant family, variant, shared tenant
law, roots, package/runtime framework, materialization policy, and release
posture. The general concept is not limited to build tenants.

Notation:

```text
G = HomeostaticGap
Pr = Problem(G, C_gap)
S = SolutionSpace(Pr, C_problem)

W = WHAT(Intent(S), Product(Intent), Requirements(Product))
Req.what* = decompose_W(A_P, C_gap, C_problem, C_solution,
                        C_intent, C_product, C_requirement)

DestinationTopology =
  ConstraintTopology(kind, framework, roots, policies, admissible_operations,
                     materialization_rules, proof_rules, release_posture)

H = DestinationTopology . InstructionSet
P = W.H
```

`DestinationTopology` declares the constraint framework in which HOW is allowed
to operate. It names the target topology and conformance law for the work
surface, source tree, runtime state, release cut, proof surface, deployment
shape, regulatory frame, tenant-local realization policy, or other introduced
HOW framework.
`InstructionSet` is the GTL graph-function program that moves the current state
toward that topology.

The stage matters:

| Stage | Constraint Meaning | Lawful Effect |
| --- | --- | --- |
| Homeostatic gap | Why equilibrium is broken or desired state is missing. | Reframe problem or preserve as framing context. |
| Problem | What problem is being solved. | Reprice solution space or problem statement. |
| Solution space | What kinds of solutions are admissible. | Narrow or expand candidate products and graph functions. |
| Intent | Why this product exists and what direction it serves. | Reprice product definition or requirements. |
| Product | What product shape, domain assets, and proof surfaces are in scope. | Reprice requirements and destination topology. |
| Requirements | What decomposed WHAT pressure must be carried. | Add, refine, split, or residualize `Req.what`. |
| Destination topology | Which introduced constraint framework HOW must conform into. | Reframe selected topology, framework roots or surface boundaries, graph-function target, and materialization/proof policy. |
| Instruction set | What operations are lawful for the traversal. | Change GTL graph functions, schedules, tools, or worker roles. |
| Runtime/evidence | What happened during realization. | Fold, residualize, retry, or route re-entry to the owning stage. |

New constraints should therefore enter as staged context first:

```text
admit(C_new, stage, source, span)
route(C_new) ->
  preserve_context
  | promote_to_Req.what
  | refine_existing_Req.what
  | reprice_problem
  | reprice_solution_space
  | reprice_product
  | reframe_destination_topology
  | reframe_instruction_set
  | fold_runtime_residual
```

A HOW-stage constraint may change the instruction set or destination topology.
It may not silently rewrite WHAT. If it changes product meaning, it must route
back to WHAT through reprice or re-entry. A runtime/evidence constraint may
create an obstacle or residual, but it must preserve the stage that owns the
repair.

## Graph Functions Replace SDLC Phase Flow

Traditional SDLC is largely a human-historical process model: requirements,
design, implementation, test, release, and maintenance are treated as phases,
meetings, documents, handoffs, and audit history.

In ODD/GTL/ABG, graph functions are the constructive lifecycle. The governing
unit is not a phase gate. It is a typed graph transformation with declared
inputs, domain assets, requirements, obligations, evidence expectations,
runtime events, folds, residuals, and replayable continuation.

The replacement is:

```text
historical SDLC phase flow
  -> graph-function traversal
  -> edge requirement environment
  -> projected obligations and evidence
  -> fold/residual/continuation
  -> read-model projections for human audit
```

SDLC artifacts can still exist as projections for human review, governance,
compliance, or downstream integration. They are not the primary constructive
carrier. The constructive carrier is the admitted GTL graph function and the
ABG event/fold truth produced by traversing it.

## KAOS Additive Rigor To Keep

KAOS should be stripped for rigor, not adopted as a product shape.

ODD already supplies product method. GTL already supplies the LLM-first
algebraic language and graph-function carrier that replaces traditional SDLC
phase flow. ABG already supplies graph runtime, event truth, replay, and fold
mechanics. KAOS adds rigor where it makes requirement pressure more typed,
checkable, and queryable.

The bounded import is:

| KAOS element | Added rigor | ABG/GTL form |
| --- | --- | --- |
| Goal type | Separates achieve, maintain, avoid, cease, and soft-goal pressure instead of treating every requirement as a flat sentence. | GTL requirement wrapper over `RequirementGoal.goalType`. |
| Goal refinement | Forces parent pressure to decompose through explicit AND/OR/case-split relations. | `RequirementRelation(kind: "refines")` plus coverage gates. |
| Assumption split | Distinguishes software requirements from environment assumptions. | `RequirementAssumption` with monitor or accepted residual risk. |
| Obstacle analysis | Represents plausible failure conditions before they appear as failed runs. | `RequirementObstacle`, mitigation/restoration relations, residual pressure. |
| Conflict analysis | Makes incompatible goals explicit rather than hiding conflict in evaluator prose. | `RequirementConflict` and reprice/resolution residuals. |
| Agent responsibility | Requires an accountable actor, tool, worker, or environment role. | `RequirementAgent` and assignment relations. |
| Operationalization | Connects goals to operations that can actually realize or monitor them. | `RequirementOperation` bound to GTL graph functions and spans. |
| Domain object reference | Grounds requirements in domain assets, events, states, and resources. | `RequirementDomainObject` references, not hidden prompt text. |
| Soft-goal contribution | Preserves quality pressure that cannot honestly be closed as binary. | qualitative or quantitative contribution fold state. |
| Completeness metrics | Turns missing refinement, assignment, obstacle handling, and operationalization into release-gate pressure. | deterministic model gates over admitted carriers. |

The non-import is equally important:

- do not import a GUI-first editor workflow as the center of GTL;
- do not create a second requirements language beside GTL;
- do not make DOT or diagrams authoritative;
- do not force every ODD context fragment into a KAOS requirement atom;
- do not make deterministic gates judge unknown product semantics;
- do not replace ABG fold/replay/residual law with a separate KAOS lifecycle.

## External Lessons To Incorporate

This strategy should reuse lessons from existing requirements, assurance, and
AI-evaluation practice without copying their full product shapes.

| Source | Lesson | ABG consequence |
| --- | --- | --- |
| KAOS / goal-oriented requirements engineering | Requirements are refined goals with assumptions, obstacles, conflicts, agents, operations, and operationalization. | Requirement terms need more than `Atom/And/Or`; they need relations for refinement, obstruction, mitigation, assignment, and operationalization. |
| ReqIF / DOORS / Jama / Polarion / Codebeamer | Real requirements systems survive through stable ids, relations, attributes, versioning, import/export, and round-trip preservation. | ABG requirement carriers need stable GUID-style ids, relation ids, source version/digest, and future import/export compatibility. |
| GSN / SACM / CAE assurance cases | Assurance separates claim, argument/strategy, evidence, and context; missing evidence appears as an undeveloped or unsupported claim. | ABG folds should project to an assurance-case view. Context fragments are not evidence; evidence bindings are not closure by themselves. |
| OpenAI process supervision | Checking each step improves credit assignment compared with final-outcome-only reward. | ABG should fold each traversal unit and residual transition, not merely final app/test success. |
| OpenAI deliberative alignment | Written specifications can be active reasoning inputs without being exploded into all possible atomic rules. | Context fragments should be first-class F_P inputs and cited in folds, while only promoted fragments become closeable requirements. |
| Anthropic Constitutional AI | Constitutional principles work as compressed constraints that guide critique and revision. | `AuthorityContextFragment` is a first-class category distinct from algebraic requirements. |
| Google DeepMind AlphaEvolve-style evaluator loops | Creative iteration works when generated candidates are scored by automated evaluators and retained attempt history. | ABG should retain attempt/fold/residual history and classify attenuation: unchanged, narrowed, transformed, moved, escalated, or cleared. |

The main warning from these systems is identity. If requirement identity and
relation semantics are weak, the system degenerates into traceability prose.
The first ABG slice should prioritize stable ids, typed relations, span
coverage, and fold semantics before rich UI, import/export, or product-specific
materialization policy.

## Reviewed KAOS And Goal-Model Implementations

The implementation lesson is not "build Objectiver inside ABG." The lesson is
to separate the semantic kernel from editors, imports, generated views, and
analysis projections.

### Objectiver / KAOS

Objectiver-backed KAOS practice is the strongest source for the semantic model.
The reusable pieces are:

- four related submodels: goal, object/domain, agent, and operation;
- goal types: Maintain, Avoid, Achieve, Cease, SoftGoal;
- goal categories: satisfaction, information, accuracy, security, safety,
  usability, and similar product-specific taxonomies;
- attributes: name, definition, priority, owner, criticality, plausibility;
- intra-model links: refinement, obstruction, conflict;
- inter-model links: reference, operationalization, responsibility;
- obstacle analysis by negating a goal and refining the negated condition until
  feasible, plausible, observable obstruction preconditions are found;
- resolution tactics: goal substitution, agent substitution, goal weakening,
  goal restoration, obstacle prevention, obstacle mitigation, and runtime
  monitoring;
- responsibility links from goals to agents, including alternative agent
  assignments;
- operations that operationalize assigned goals.

ABG should steal the model, not the graphical workflow. Objectiver is a
requirements modeling tool. ABG should be the graph-runtime semantics that can
admit, execute, fold, replay, and query the model.

Source refs:

- https://objectiver.com/fileadmin/download/documents/presentations/KaosCEE-AvL.pdf
- https://posomas.isse.de/Practices/aose.practice.req.goal_driven_requirements_elicitation.base/guidances/supportingmaterials/goal_driven_re_with_kaos_47BC83D3.html

### KAOS Modeling Editor

The KAOS Modeling Editor line shows a useful authoring pattern: generate an
initial goal model from natural-language requirements, let humans or agents edit
the graph, and expose a graph/DOT surface.

In ABG terms, this is ODD-method-governed GTL authoring. The natural-language
pass can propose a typed requirement graph, but ODD methodology decides how the
requirements relate to product intent, domain assets, graph functions, proof
surfaces, and release pressure. The admitted constructive carrier should be
GTL/ABG requirement terms and graph-function references. DOT is only a
projection of that carrier, not the model authority.

The difference from KAOS tooling is the primary interaction model. GTL is
LLM-first: the expected authoring loop is a human working with an agentic coder
to define and revise algebraic graph declarations, then admit the resulting
terms under ODD method. A visual editor can be useful, but it is not the center
of the product shape.

ABG consequence:

- natural-language extraction can create candidate requirement graphs;
- ODD methodology governs admission, product meaning, proof role, and release
  pressure;
- candidate graphs should compile or admit into GTL/ABG requirement carriers;
- human-agent GTL authoring is the primary interaction loop;
- generated candidates are not constitutional truth until admitted;
- DOT/diagram output is a read model;
- graph editing should preserve stable ids and relation ids.

Source ref:

- https://ceur-ws.org/Vol-3618/pd_paper_6.pdf

### OpenOME / i* / GRL / jUCMNav

OpenOME and GRL/jUCMNav are useful for actor-oriented rationale and evaluation.
OpenOME emphasizes a goal/agent-oriented model with knowledge-base-backed
analysis and links from requirements to specification and architecture.
GRL/jUCMNav adds strategies and qualitative/quantitative satisfaction
propagation over intentional elements.

ABG consequence:

- actor/agent dependency should be a first-class requirement relation, not only
  a worker assignment;
- soft goals and contribution links need evaluation semantics;
- a "strategy" is a projection/evaluation configuration, not product truth;
- qualitative satisfaction, quantitative score, conflict, weak satisfaction,
  and unknown can be ABG fold or assurance projection states.

Source refs:

- https://www.cs.toronto.edu/km/openome/
- https://ceur-ws.org/Vol-978/paper_26.pdf
- https://cairis.readthedocs.io/en/latest/grl.html

### KAOS Completeness Metrics

KAOS metrics work is directly useful as release-gate pressure. Useful metrics
include:

- leaf-goal agent assignment coverage;
- obstacle resolution coverage;
- goal-to-object association coverage;
- goal operationalization coverage;
- operation-to-agent assignment coverage;
- model complexity and completeness measures.

ABG consequence:

- requirement algebra must project deterministic completeness metrics;
- incompleteness is residual pressure, not prose debt;
- release gates can fail closed on missing assignment, unresolved obstacles, or
  unoperationalized requirements before any downstream source materialization.

Source ref:

- https://scispace.com/pdf/a-framework-to-evaluate-complexity-and-completeness-of-kaos-1c3thzg7q8.pdf

### Modern Obstacle Analysis

Recent obstacle-analysis work keeps the core KAOS argument:

```text
Requirements + Assumptions entail Goal
R, A |- G
```

The useful modern framing is that leaf refinements split into software
requirements and environment assumptions. Obstacles are not just failed tests;
they are conditions that can invalidate the argument from requirements and
assumptions to goal satisfaction.

ABG consequence:

- assumptions must be separate from requirements;
- environment assumptions can span edges and may require monitoring rather than
  construction;
- obstacle residuals should preserve whether pressure is on software
  requirement, environment assumption, runtime monitor, or product reprice.

Source ref:

- https://discovery.ucl.ac.uk/10204032/1/Obstacle-analysis-retrospective.pdf

## Two Categories Of Authority

There are two different categories that should not be forced into one shape.

### 1. Context Fragments

Context fragments are compressed textual authority. Examples:

- `PRODUCT.md`
- `SPEC_METHOD.md`
- GTL/ABG constitutional law
- ODD method law
- design method writing constraints
- local product policy surfaces

They are constraints and axioms. They are source authority, but we do not need
to itemize every sentence as a requirement before the system can use them.

They should be carried by reference, digest, source type, and span.

```ts
interface AuthorityContextFragment {
  readonly kind: "authority_context_fragment";
  readonly fragmentId: string;
  readonly fragmentKind: "axiom" | "constraint" | "policy" | "method";
  readonly originStage:
    | "homeostatic_gap"
    | "problem"
    | "solution_space"
    | "intent"
    | "product"
    | "requirements"
    | "destination_topology"
    | "instruction_set"
    | "runtime"
    | "assurance";
  readonly constraintScope:
    | "frames_problem"
    | "narrows_solution_space"
    | "defines_product_meaning"
    | "decomposes_requirement_pressure"
    | "selects_destination_topology"
    | "constrains_destination_topology"
    | "constrains_instruction_set"
    | "constrains_evidence"
    | "routes_reentry";
  readonly sourceRef: string;
  readonly digest: string;
  readonly compressionRef: string | null;
  readonly text: string;
  readonly span: TraversalSpan | null;
  readonly appliesToRefs: readonly string[];
  readonly promotionPolicy:
    | "context_only"
    | "candidate_req_what"
    | "must_promote_to_requirement"
    | "requires_reprice"
    | "requires_reentry";
  readonly routingOutcome:
    | "unrouted"
    | "preserve_context"
    | "promote_to_req_what"
    | "refine_existing_req_what"
    | "reprice_problem"
    | "reprice_solution_space"
    | "reprice_product"
    | "reframe_destination_topology"
    | "reframe_instruction_set"
    | "fold_runtime_residual";
  readonly interpretationRole:
    | "constrains_interpretation"
    | "defines_language_law"
    | "defines_product_boundary"
    | "defines_method";
}
```

Fragments constrain interpretation. They are not automatically closeable
obligations on every edge.

### 2. Algebraic Requirements

Requirements are explicit recursive product pressure.

They have identity, composition, and span. They can be projected into edge-local
obligations, bound to evidence, folded, deferred, residualized, repriced, or
closed.

```ts
type RequirementTerm =
  | RequirementAtom
  | RequirementAnd
  | RequirementOr
  | RequirementRefinement
  | RequirementDependency
  | RequirementAssumption
  | RequirementObstacle
  | RequirementConflict
  | RequirementMitigation
  | RequirementAgentAssignment
  | RequirementOperationalization
  | RequirementProjection
  | RequirementTestRelation
  | RequirementEvidenceBinding
  | RequirementFold
  | RequirementResidual;

interface RequirementAtom {
  readonly kind: "requirement_atom";
  readonly requirementId: string;
  readonly stableId: string;
  readonly versionRef: string;
  readonly statement: string;
  readonly sourceRefs: readonly string[];
  readonly span: TraversalSpan;
  readonly attributes: readonly RequirementAttribute[];
}
```

A requirement can span more than one edge.

Examples:

```text
spec.requirements requirement:
  span A -> X
  applies across a broad specification-to-release route

writing-test requirement:
  span F -> J
  applies across test design, test source materialization, test execution,
  and execution result interpretation
```

For a current edge `D -> E`, a requirement is active only if its span covers
that edge or a residual from that requirement has been explicitly carried into
that edge.

KAOS-style relations should be explicit terms rather than prose-only links:

```ts
interface RequirementRefinement {
  readonly kind: "requirement_refinement";
  readonly relationId: string;
  readonly parentRequirementId: string;
  readonly childRequirementIds: readonly string[];
  readonly refinementKind: "and" | "or" | "case_split" | "operational";
  readonly sourceRefs: readonly string[];
}

interface RequirementObstacle {
  readonly kind: "requirement_obstacle";
  readonly obstacleId: string;
  readonly obstructedRequirementId: string;
  readonly statement: string;
  readonly likelihood: "unknown" | "low" | "medium" | "high";
  readonly evidenceRefs: readonly string[];
}

interface RequirementMitigation {
  readonly kind: "requirement_mitigation";
  readonly mitigationId: string;
  readonly obstacleId: string;
  readonly mitigatingRequirementIds: readonly string[];
  readonly residualRiskRef: string | null;
}

interface RequirementAgentAssignment {
  readonly kind: "requirement_agent_assignment";
  readonly assignmentId: string;
  readonly requirementId: string;
  readonly agentRef: string;
  readonly responsibility:
    | "construct"
    | "evaluate"
    | "operate"
    | "admit"
    | "own_policy";
}

interface RequirementOperationalization {
  readonly kind: "requirement_operationalization";
  readonly operationalizationId: string;
  readonly requirementId: string;
  readonly operationRef: string;
  readonly graphFunctionRef: string;
  readonly edgeRefs: readonly string[];
  readonly evidenceKindRefs: readonly string[];
}
```

This lets ABG distinguish "the requirement is not met" from "the requirement
is obstructed by a known obstacle", "the requirement is assigned to a different
agent", or "the requirement has not yet been operationalized into graph
execution."

## Edge Requirement Environment

The right unit is not "the current edge has a flat obligation list."

The right unit is a requirement environment over a traversal edge:

```text
Gamma_stage_context + Sigma_prior + R_span |- edge(D, E) : Delta_edge
```

Where:

- `Gamma_stage_context` is compressed authority context partitioned by origin
  stage: gap, problem, solution space, intent, product, requirements,
  destination topology, instruction set, runtime, and assurance.
- `Sigma_prior` is cumulative admitted state from prior edges: folds,
  residuals, materialized facts, admitted evidence, replayable events.
- `R_span` is the set of requirement terms whose spans cover the edge.
- `Delta_edge` is the active edge-local obligation projection.

Carrier shape:

```ts
interface EdgeRequirementEnvironment {
  readonly kind: "edge_requirement_environment";
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly edgeRef: string;
  readonly edgeSpan: TraversalSpan;
  readonly contextFragments: readonly AuthorityContextFragment[];
  readonly activeRequirementTerms: readonly RequirementTerm[];
  readonly priorFolds: readonly RequirementFold[];
  readonly carriedResiduals: readonly RequirementResidual[];
  readonly edgeObligations: readonly EdgeRequirementObligation[];
}
```

This environment lets an edge carry immediate requirements, past cumulative
requirements, and overarching constraints without flattening all authority into
one current obligation list.

## Traversal Spans

Requirement spans need a canonical representation.

A span can be broad:

```text
A -> X
```

or narrow:

```text
F -> J
```

or recursive over a graph function:

```text
graph_function:build_product
  span: requirement_surface -> release_qualification_surface
```

Candidate type:

```ts
interface TraversalSpan {
  readonly kind: "traversal_span";
  readonly spanId: string;
  readonly graphFunctionRef: string;
  readonly startNodeRef: string;
  readonly endNodeRef: string;
  readonly includedVectorRefs: readonly string[];
  readonly spanPolicy:
    | "covers_all_edges"
    | "covers_selected_vectors"
    | "covers_until_folded"
    | "covers_residual_only";
}
```

The key operation is:

```ts
covers(span, edge) -> boolean
```

For recursion and zoom, the span must be stable across frame boundaries. The
same durable requirement may project into child frames and fold back into the
parent frame.

## Requirement Ledger Domain Model

The requirements ledger is the durable owner. Other ledgers are read models or
projections.

```ts
interface RequirementLedger {
  readonly kind: "requirement_ledger";
  readonly ledgerId: string;
  readonly ledgerVersion: string;
  readonly productRef: string;
  readonly graphFunctionRef: string;
  readonly importRefs: readonly RequirementImportRef[];
  readonly contextFragments: readonly AuthorityContextFragment[];
  readonly requirements: readonly RequirementTerm[];
  readonly relations: readonly RequirementRelation[];
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly folds: readonly RequirementFold[];
  readonly residuals: readonly RequirementResidual[];
}
```

Identity should be ReqIF-compatible in spirit even if ABG does not implement
ReqIF in the first slice:

```ts
interface RequirementAttribute {
  readonly key: string;
  readonly value: string;
  readonly valueType: "string" | "enum" | "number" | "boolean" | "xhtml" | "ref";
}

interface RequirementImportRef {
  readonly kind: "requirement_import_ref";
  readonly importId: string;
  readonly sourceSystem: string;
  readonly sourceRef: string;
  readonly sourceDigest: string;
  readonly importedAt: string;
}

interface RequirementRelation {
  readonly kind: "requirement_relation";
  readonly relationId: string;
  readonly relationKind:
    | "refines"
    | "depends_on"
    | "conflicts_with"
    | "obstructed_by"
    | "mitigated_by"
    | "assigned_to"
    | "operationalized_by"
    | "tested_by"
    | "assured_by"
    | "evidenced_by"
    | "supersedes";
  readonly sourceRequirementId: string;
  readonly targetRef: string;
  readonly sourceRefs: readonly string[];
}
```

The practical rule is that ABG must be able to round-trip requirement identity,
relations, and source provenance even when the originating product later
imports from or exports to a traditional requirements-management tool.

### Requirement Projection

Projection turns durable requirement pressure into edge-local work.

```ts
interface RequirementProjection {
  readonly kind: "requirement_projection";
  readonly projectionId: string;
  readonly requirementId: string;
  readonly edgeRef: string;
  readonly projectionRole:
    | "design"
    | "source"
    | "test_source"
    | "build_config"
    | "execution"
    | "release"
    | "evidence"
    | "policy";
  readonly obligationIds: readonly string[];
  readonly targetRefs: readonly string[];
  readonly dependsOnProjectionIds: readonly string[];
  readonly contextFragmentRefs: readonly string[];
}
```

### Edge Requirement Obligation

An obligation is edge-local. It is not the requirement itself.

```ts
interface EdgeRequirementObligation {
  readonly kind: "edge_requirement_obligation";
  readonly obligationId: string;
  readonly requirementId: string;
  readonly projectionId: string;
  readonly edgeRef: string;
  readonly obligationRole:
    | "construct"
    | "materialize"
    | "evaluate"
    | "execute"
    | "admit"
    | "preserve"
    | "defer";
  readonly expectedEvidenceKinds: readonly string[];
  readonly residualPolicyRef: string;
}
```

### Evidence Binding

Evidence binding says an artifact, event, report, target carrier, materialized
file, execution shard, or evaluator finding claims to satisfy an obligation
projection.

```ts
interface RequirementEvidenceBinding {
  readonly kind: "requirement_evidence_binding";
  readonly bindingId: string;
  readonly obligationId: string;
  readonly requirementId: string;
  readonly projectionId: string;
  readonly evidenceRef: string;
  readonly evidenceKind:
    | "target_carrier"
    | "materialized_file"
    | "execution_evidence"
    | "evaluation_finding"
    | "runtime_event"
    | "context_fragment"
    | "admitted_register";
  readonly admissionStatus: "admitted" | "rejected" | "non_closing";
  readonly authorityRefs: readonly string[];
}
```

Evidence binding should also be able to project into an assurance-case view:

```ts
interface RequirementAssuranceClaim {
  readonly kind: "requirement_assurance_claim";
  readonly claimId: string;
  readonly requirementId: string;
  readonly projectionId: string;
  readonly claimText: string;
  readonly contextFragmentRefs: readonly string[];
  readonly strategyRefs: readonly string[];
  readonly evidenceBindingRefs: readonly string[];
  readonly status:
    | "supported"
    | "partially_supported"
    | "undeveloped"
    | "unsupported"
    | "conflicted";
}
```

This mirrors GSN/SACM/CAE without making ABG an assurance-case editor. The
claim/evidence projection is a read model over requirement folds.

### Requirement Relationship To Test

Tests are not separate peer artifacts that close requirements by existing or by
passing. Tests are assurance operations over `Req.what` and product assets.

The algebra is:

```text
Req.what_i
  -> Project(i, asset)
  -> Project(i, assurance)

Project(i, assurance)
  -> Project(i, test_source)
  -> Project(i, test_execution)
  -> Project(i, test_interpretation)
  -> Fold(i)
```

The test relation witnesses a claim about the asset:

```text
Test_i : (Req.what_i, P.asset_i, oracle_i) -> Evidence_i
Bind(Evidence_i, Project(i, assurance)) -> Fold_i
```

`test_source` is itself an asset projection: source material that encodes the
intended observation. `test_execution` is runtime evidence. `test_interpretation`
is the semantic claim that the observed behavior supports `Req.what_i`.

This gives three distinct states that must not be collapsed:

```text
test source materialized
test execution admitted
requirement assurance folded
```

Materialized tests can satisfy the `test_source` projection while execution and
semantic assurance remain residual. Passing execution can satisfy an evidence
projection while F_P still rejects the semantic claim that the test proves the
requirement. This preserves the earlier T-204 rule: tests are a relationship
between requirement WHAT, realized asset behavior, and admitted assurance, not
path-derived closure by themselves.

Candidate carrier:

```ts
interface RequirementTestRelation {
  readonly kind: "requirement_test_relation";
  readonly relationId: string;
  readonly requirementId: string;
  readonly assetProjectionId: string;
  readonly testSourceProjectionId: string;
  readonly testExecutionProjectionId: string;
  readonly testInterpretationProjectionId: string;
  readonly oracleRef: string;
  readonly evidencePolicyRef: string;
  readonly sourceRefs: readonly string[];
}
```

### Fold

Fold is the actual requirement-state transition over admitted evidence.

```ts
interface RequirementFold {
  readonly kind: "requirement_fold";
  readonly foldId: string;
  readonly requirementId: string;
  readonly projectionId: string;
  readonly edgeRef: string;
  readonly foldStatus:
    | "satisfied"
    | "partial"
    | "blocked"
    | "deferred"
    | "repriced"
    | "no_close_preserved";
  readonly evidenceBindingRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly foldAuthority:
    | "F_D_admission"
    | "F_P_semantic_judgment"
    | "F_H_decision"
    | "ABG_assurance_fold";
  readonly attenuation: RequirementAttenuation;
}
```

Process supervision should be represented at the fold boundary:

```ts
type RequirementAttenuation =
  | "not_applicable"
  | "unchanged"
  | "narrowed"
  | "transformed"
  | "moved_to_prerequisite"
  | "escalated"
  | "cleared";
```

This prevents retry loops from hiding non-progress. Each attempt should show
whether residual pressure was reduced, changed, moved, escalated, or cleared.

### Residual

Residual is not an error string. It is still-open requirement pressure with a
remaining span.

```ts
interface RequirementResidual {
  readonly kind: "requirement_residual";
  readonly residualId: string;
  readonly requirementId: string;
  readonly sourceFoldRef: string;
  readonly remainingSpan: TraversalSpan;
  readonly pressureClass:
    | "missing_evidence"
    | "semantic_not_realized"
    | "blocked_prerequisite"
    | "ambiguous_authority"
    | "requires_reentry"
    | "requires_reprice";
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}
```

Residuals can project to assurance gaps:

```text
residual missing_evidence      -> undeveloped claim
residual semantic_not_realized -> unsupported claim
residual ambiguous_authority   -> conflicted context/claim
residual requires_reentry      -> claim assigned to another span
```

## Core Functions

The algebraic API should be small.

```ts
activeRequirements(ledger, edge) -> RequirementTerm[]
buildEdgeRequirementEnvironment(ledger, edge, priorEvents) -> EdgeRequirementEnvironment
projectRequirements(environment, edge) -> EdgeRequirementObligation[]
projectMaterializationTargets(environment, obligations) -> MaterializationTarget[]
bindRequirementEvidence(environment, evidence) -> RequirementEvidenceBinding[]
foldRequirementEvidence(environment, bindings) -> RequirementFold[]
residualizeRequirementFolds(environment, folds) -> RequirementResidual[]
classifyRequirementAttenuation(priorResiduals, folds, residuals) -> RequirementAttenuation[]
projectAssuranceCase(environment, folds, residuals) -> RequirementAssuranceClaim[]
projectRequirementLedgers(environment, folds, residuals) -> ReadModels
```

The important rule:

```text
Requirement = durable product pressure
Obligation = edge-local projected work
Evidence = admitted artifact/event/carrier
Fold = requirement-state transition over evidence
Residual = continuing pressure over the remaining span
```

## Cohesive ABG Requirements Capability Design

ABG should expose a requirements capability as a graph-function family over a
single algebraic requirement kernel.

The product shape:

```text
WHAT layer
  ODD methodology
  GTL requirement wrappers/declarations
  ABG requirement algebra carriers

HOW layer
  GTL graph functions
  edge requirement environment
  obligation/materialization/evidence/assurance projections
  ABG fold/replay/residual truth
  downstream product read models
```

This is not a separate runtime. It is an ABG graph over requirement terms,
spans, and admitted evidence.

Design guardrails:

- deterministic gates inspect admitted ABG requirement carriers, relations,
  spans, provenance, and replay facts;
- deterministic gates do not inspect unknown product syntax for semantic
  satisfaction;
- F_P maintains semantic pressure over design/source/test meaning;
- F_H may admit product-owner decisions, reprices, or explicit residual risk;
- ABG folds admitted envelope facts, F_P findings, and F_H decisions into
  replayable requirement state.

### Capability Modules

```text
abg.requirements.identity
  stable ids, aliases, imports, source digests, relation ids

abg.requirements.context
  staged authority fragments, constraint routing, promotion candidates,
  context coverage

abg.requirements.model
  goals, requirements, assumptions, soft goals, obstacles, conflicts,
  agents, operations, domain objects, relations

abg.requirements.span
  traversal spans, frame/zoom span mapping, coverage predicates

abg.requirements.projection
  edge environments, obligation projection, target/evidence projection

abg.requirements.fold
  evidence bindings, admitted envelope facts, F_P findings, F_H decisions,
  residual and attenuation projection

abg.requirements.assurance
  claim/strategy/evidence/context read model, GSN/SACM-compatible projection

abg.requirements.metrics
  completeness, complexity, coverage, conflict, obstacle, operationalization,
  attenuation metrics

abg.requirements.interop
  candidate ReqIF/GRL/GSN/SACM import/export adapters as read/write adapters,
  not native authority
```

### Core Domain Types

The KAOS-derived kernel should be explicit:

```ts
type RequirementModelElement =
  | RequirementGoal
  | RequirementAtom
  | RequirementAssumption
  | RequirementSoftGoal
  | RequirementObstacle
  | RequirementConflict
  | RequirementAgent
  | RequirementOperation
  | RequirementDomainObject
  | RequirementTestRelation
  | RequirementRelation;

interface RequirementGoal {
  readonly kind: "requirement_goal";
  readonly goalId: string;
  readonly stableId: string;
  readonly goalType: "maintain" | "avoid" | "achieve" | "cease" | "soft";
  readonly category: string;
  readonly statement: string;
  readonly priority: "low" | "medium" | "high" | "critical";
  readonly ownerRef: string | null;
  readonly span: TraversalSpan;
  readonly sourceRefs: readonly string[];
}

interface RequirementAssumption {
  readonly kind: "requirement_assumption";
  readonly assumptionId: string;
  readonly statement: string;
  readonly assumptionScope: "environment" | "operator" | "toolchain" | "runtime";
  readonly monitorRef: string | null;
  readonly span: TraversalSpan;
  readonly sourceRefs: readonly string[];
}

interface RequirementSoftGoal {
  readonly kind: "requirement_soft_goal";
  readonly softGoalId: string;
  readonly qualityRef: string;
  readonly contributionScale: "qualitative" | "quantitative";
  readonly targetSatisfaction: string;
  readonly span: TraversalSpan;
}

interface RequirementAgent {
  readonly kind: "requirement_agent";
  readonly agentId: string;
  readonly agentKind: "software" | "environment" | "human" | "tool" | "worker";
  readonly roleRefs: readonly string[];
  readonly monitors: readonly string[];
  readonly controls: readonly string[];
}

interface RequirementOperation {
  readonly kind: "requirement_operation";
  readonly operationId: string;
  readonly graphFunctionRef: string;
  readonly edgeRefs: readonly string[];
  readonly performedByAgentRefs: readonly string[];
  readonly operationalizesRequirementRefs: readonly string[];
}

interface RequirementDomainObject {
  readonly kind: "requirement_domain_object";
  readonly objectId: string;
  readonly objectKind: "asset" | "state" | "event" | "resource" | "data";
  readonly sourceRefs: readonly string[];
}

type RequirementRelationKind =
  | "refines"
  | "depends_on"
  | "conflicts_with"
  | "obstructs"
  | "mitigates"
  | "references"
  | "assigned_to"
  | "operationalized_by"
  | "performed_by"
  | "monitored_by"
  | "tested_by"
  | "assured_by"
  | "evidenced_by"
  | "contributes_to"
  | "weakens"
  | "restores"
  | "supersedes";

interface RequirementGraph {
  readonly kind: "requirement_graph";
  readonly graphId: string;
  readonly productRef: string;
  readonly elements: readonly RequirementModelElement[];
  readonly relations: readonly RequirementRelation[];
  readonly spans: readonly TraversalSpan[];
  readonly sourceRefs: readonly string[];
}

interface RequirementGraphState {
  readonly kind: "requirement_graph_state";
  readonly graphId: string;
  readonly edgeRef: string;
  readonly satisfiedRefs: readonly string[];
  readonly partialRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly obstacleRefs: readonly string[];
  readonly conflictRefs: readonly string[];
  readonly unknownRefs: readonly string[];
}
```

This model sits on top of GTL/ABG. `RequirementOperation.graphFunctionRef` binds
requirements to graph functions. `TraversalSpan` binds them to graph-vector
coverage. Runtime events and evidence bindings then fold requirement state.
`RequirementGraphState` is an edge-local projection. It is not a second
requirements ledger.

### Native Graph Functions

The requirements capability should be a catalog of graph functions:

```text
abg.requirements.ingest_context_fragments
  Input: source refs and compression policy
  Output: admitted AuthorityContextFragment rows

abg.requirements.promote_context_fragment
  Input: fragment, reason, target span
  Output: candidate RequirementGoal/RequirementAtom/Assumption

abg.requirements.route_context_constraint
  Input: staged AuthorityContextFragment, current product algebra state
  Output: preserve, promote, refine, reprice, reframe, re-enter, or residualize

abg.requirements.derive_requirement_graph
  Input: product/context fragments and existing requirements
  Output: candidate requirement model elements and relations

abg.requirements.refine_goal
  Input: parent goal, context, refinement policy
  Output: AND/OR/case-split refinement relation and child terms

abg.requirements.analyze_obstacles
  Input: leaf goal or assumption, domain context
  Output: obstacle graph plus prevention/mitigation/restoration candidates

abg.requirements.analyze_conflicts
  Input: active goal set and context
  Output: conflict rows, boundary conditions, resolution candidates

abg.requirements.assign_responsibility
  Input: requirement/goal, candidate agents, boundary policy
  Output: responsibility/assignment relations

abg.requirements.operationalize_requirement
  Input: requirement term, graph-function catalog, evidence policy
  Output: RequirementOperation and TraversalSpan bindings

abg.requirements.derive_test_relation
  Input: Req.what, asset projection, assurance projection, oracle policy
  Output: RequirementTestRelation and test-source/execution/interpretation
  projections

abg.requirements.compile_edge_environment
  Input: requirement ledger, edge, replay state
  Output: EdgeRequirementEnvironment

abg.requirements.project_edge_obligations
  Input: EdgeRequirementEnvironment
  Output: obligation, target, schedule, evidence expectations

abg.requirements.bind_evidence
  Input: environment, admitted artifacts/events/registers
  Output: RequirementEvidenceBinding rows

abg.requirements.fold_requirement_state
  Input: environment, evidence bindings, evaluator findings
  Output: RequirementFold and RequirementResidual rows

abg.requirements.project_assurance_case
  Input: folds and residuals
  Output: claim/strategy/evidence/context read model

abg.requirements.measure_model
  Input: requirement ledger
  Output: completeness, complexity, coverage, conflict, obstacle, and
  operationalization metrics
```

Each function should be independently replayable. Product-specific domain
meaning enters through context fragments, product requirement terms, and
plugins; ABG owns the carrier grammar, event truth, fold law, and projection.

### Capability Workflow

#### 1. Intake And Identity

1. Import or author raw requirement/context surfaces.
2. Stamp stable ids, source refs, digests, and aliases.
3. Classify each source item as compressed context, explicit requirement,
   assumption, or candidate promotion.
4. Preserve import source metadata for future ReqIF-style round trips.

#### 2. Goal Model Construction

1. Build or update a goal graph.
2. Refine goals through AND/OR/case-split relations.
3. Split leaves into software requirements and environment assumptions.
4. Carry soft goals as qualitative/quantitative evaluation pressure.
5. Preserve domain objects and resources as referenced terms, not as hidden
   prompt text.

#### 3. Analysis

1. Run obstacle analysis on leaf goals, requirements, and assumptions.
2. Run conflict analysis across active goals and constraints.
3. Produce resolution candidates: substitution, weakening, restoration,
   prevention, mitigation, monitoring, reprice.
4. Record unresolved obstacles/conflicts as residual pressure.

#### 4. Responsibility And Operationalization

1. Assign requirements or operations to agents.
2. Bind software requirements to graph functions and spans.
3. Bind environment assumptions to monitors or explicit no-monitor residuals.
4. Bind operations to GTL graph functions and evidence kinds.
5. Bind assurance requirements to test relations where the evidence policy
   requires test proof.
6. Fail closed when leaf goals have no agent, no operation, missing required
   test relation, or unresolved obstacle where the release gate requires
   completeness.

#### 5. Runtime Projection

1. For each traversal edge, compile the edge requirement environment.
2. Project active edge obligations.
3. Project materialization targets, schedule commands, and evidence
   expectations.
4. Provide F_P workers with context fragments and active obligations without
   flattening the whole product constitution into the edge.

#### 6. Evidence Binding And Fold

1. Admit artifacts, target carriers, materialized files, execution evidence,
   evaluator findings, and runtime events.
2. Bind evidence to projected obligations.
3. Fold each requirement projection.
4. Emit partial folds where one projection closes but another remains open.
5. Emit residuals with remaining spans and attenuation classification.

#### 7. Assurance And Query

1. Project claims, strategy, evidence, and context from folds and residuals.
2. Surface unresolved claims as residual pressure.
3. Query active requirements by edge, graph function, agent, obstacle,
   operation, or span.
4. Export later to ReqIF, GRL, GSN, or SACM as adapters, not authority.

### Completeness Gates

ABG should expose deterministic model gates before product code generation:

```text
goal_refinement_coverage
  every close-required parent goal has an admitted refinement or residual

leaf_assignment_coverage
  every close-required leaf requirement has an assigned responsible agent

assumption_monitoring_coverage
  every close-required environment assumption is monitored, deferred, or
  explicitly accepted as residual risk

obstacle_resolution_coverage
  every retained plausible obstacle is prevented, mitigated, restored,
  monitored, repriced, or residualized

conflict_resolution_coverage
  every admitted conflict has a resolution or explicit reprice pressure

operationalization_coverage
  every close-required software requirement binds to an operation and graph span

test_relation_coverage
  every close-required requirement with test-proof policy binds requirement
  WHAT, asset projection, test-source projection, execution projection,
  interpretation projection, oracle, and evidence policy

operation_agent_coverage
  every close-required operation has a performing agent/worker/tool binding

span_coverage
  every active requirement projection maps to at least one graph-vector span

evidence_policy_coverage
  every active obligation declares admitted evidence kinds

context_routing_coverage
  every admitted constraint fragment declares origin stage, scope, promotion
  policy, span, and routing outcome before it can affect a fold

destination_topology_coverage
  every HOW projection declares selected destination topology, framework,
  roots or surface boundaries, materialization/proof policy, release posture,
  and instruction set before materialization or execution targets can be
  admitted

fold_attenuation_coverage
  every retry attempt classifies residual transition
```

These gates are the practical answer to "do we have a concrete model of
requirements and obligations?" The model is concrete when these gates can run
without reading product prose by hand.

## Workflow 1: Author Requirement Pressure

1. Product or domain authority authors a requirement term.
2. The term receives a span.
3. Context fragments are attached as constraints but not exploded.
4. Each context fragment declares its origin stage, constraint scope, promotion
   policy, and routing outcome.
5. Refinement expands parent requirements into children when needed.
6. Dependencies are represented as requirement relations, not as hidden
   evaluator conventions.
7. Obstacles, conflicts, assumptions, agents, and operationalization are
   represented explicitly when they affect closure or routing.

Output:

```text
RequirementLedger.requirements[]
RequirementLedger.contextFragments[]
```

## Workflow 2: Build Edge Environment

For a traversal edge `D -> E`:

1. Load context fragments whose span covers the edge or graph function,
   partitioned by origin stage.
2. Load requirement terms whose spans cover `D -> E`.
3. Load prior folds from replay.
4. Load carried residuals whose remaining span covers `D -> E`.
5. Remove requirements whose relevant projection is already folded satisfied.
6. Preserve constraints even when they are not active obligations.

Output:

```text
EdgeRequirementEnvironment
```

## Workflow 3: Project Edge Obligations

1. For each active requirement term, select the projection role for the edge.
2. Expand recursive/refined requirements into edge-local obligations.
3. Preserve parent-child trace.
4. Attach expected evidence kinds.
5. Attach dependencies on prior projections where the requirement algebra
   explicitly declares them.

Output:

```text
obligation ledger projection
```

## Workflow 4: Project Materialization And Execution Targets

1. Materialization targets derive from active obligations, not from a separate
   target table.
2. Tenant stack, design registers, and product authority contribute authority
   refs and role policy.
3. Test roots and source roots become role projections only when bound to
   active requirements.
4. Execution schedule commands derive from execution obligations and admitted
   test-design schedule rows.

Output:

```text
materialization target projection
execution schedule projection
```

## Workflow 5: Bind Evidence

1. Admit evidence structurally.
2. Bind each evidence item to a projected obligation.
3. Reject evidence that is a byproduct, stale replay, wrong role, wrong policy,
   outside the span, or not admitted under the selected composition.
4. Do not let evidence close directly.
5. Preserve rejected evidence as a typed non-closing binding when it explains a
   residual or obstacle.

Output:

```text
evidence binding projection
```

## Workflow 6: Fold Requirement State

1. F_D admission checks envelope truth: schema, ids, paths, digests, role
   policy, event provenance, declared roots, replay ancestry.
2. F_P evaluates semantic realization where meaning remains ambiguous.
3. ABG assurance fold combines admitted evidence and evaluator findings.
4. The fold produces satisfied, partial, blocked, deferred, repriced, or
   no-close-preserved state.
5. Scalar edge success may not erase a vector of active requirements.
6. Each fold records attenuation against the prior residual set.

Output:

```text
closure fold projection
residual projection
continuation/re-entry projection
```

## Workflow 7: Replay, Retry, And Re-entry

1. Replay can reuse prior evidence only when it binds the same requirement
   projection and remains valid under current context.
2. A current valid evidence binding supersedes an empty or weaker prior attempt.
3. Residual pressure carries forward over the remaining span.
4. Retry is lawful when it preserves or attenuates residual pressure.
5. Re-entry is lawful when the residual identifies a different owning span or
   prerequisite.
6. Attempts that repeat the same residual without narrowing, transforming,
   moving, escalating, or clearing it are visible non-progress.

Output:

```text
next requirement environment
```

## T-204 Interpretation

The odd_sdlc T-204 failures are symptoms of missing requirement algebra joins.
They should not be fixed as six unrelated materialization special cases.

### Tenant-stack role policy overrides design targets

This is an authority projection issue.

If a requirement projection says a source file must be materialized and tenant
stack authority declares the same target path with a more specific role policy,
then the materialization target projection should carry the tenant-stack policy
as the active policy for that target.

This is not a Scala-specific rule. It is:

```text
same requirement projection + same target path + compatible role
  -> stronger active authority policy wins
```

### Current valid materialization supersedes empty predecessor replay

This is fold precedence.

An empty predecessor attempt is evidence of prior non-closure. It must not
block a later current attempt that binds admitted materialized files to the
same requirement projection.

Rule:

```text
current admitted evidence for projection P supersedes empty replay for P
```

### Post-transform observation ignores declared build byproducts

This is evidence admissibility.

Build byproducts can exist in the workspace but are not evidence for a
requirement projection unless the requirement projection or target contract
declares them as product evidence.

Rule:

```text
evidence kind not admitted for projection P -> non_closing
```

### `src/test/...` under declared test roots classifies as component-test

This is a role projection.

The role is not inferred from a generic path regex alone. The path matters
because a requirement projection plus tenant stack/test-design authority says
that test-root paths are evidence for `Project(R, test_source)`.

Rule:

```text
declared test root + active test-source projection -> role test
```

### Execution preparation carries admitted schedule commands

This is execution obligation projection.

The command comes from admitted test-design schedule rows when those rows bind
the active execution projection. The fallback tenant command is only a fallback
when there is no admitted schedule binding.

Rule:

```text
active execution projection + admitted schedule row -> schedule command wins
```

### Component-test postflight admits materialized tests before execution
discoverability proof

This is partial fold, not final closure.

A materialized test file can satisfy `Project(R, test_source)` even if
`Project(R, execution)` remains open. The fold must distinguish:

```text
test source satisfied
execution not yet satisfied
product release not yet closed
```

This prevents the false choice between blocking valid test materialization and
pretending test execution has completed.

## F_D / F_P Boundary

This strategy does not create a deterministic compiler over unknown syntax.

F_D owns deterministic algebra and envelope checks:

- requirement term shape
- span identity
- projection identity
- evidence binding shape
- context origin stage, constraint scope, promotion policy, and routing shape
- digest/path/root/provenance checks
- replay ancestry
- role-policy compatibility
- whether a current fold is allowed to supersede replay

F_P owns semantic judgment:

- whether produced design meaning satisfies the requirement
- whether source semantics realize the requirement
- whether tests genuinely prove the intended behavior
- whether residual ambiguity remains
- whether a compressed context fragment implies additional semantic pressure

ABG owns the assurance fold over admitted F_D and F_P outputs.

## Product Boundary

ABG should own:

- requirement algebra carriers
- traversal span identity
- edge requirement environment construction
- projection and fold APIs
- replay and residual conservation law
- event/provenance truth for folds and residuals
- typecheck support for GTL declarations that reference requirement spans

Downstream products should own:

- domain requirement terms
- domain context fragments
- domain-specific projection plugins where generic projection is insufficient
- interpretation of evidence meaning within F_P
- product read models over admitted ABG requirement/fold truth

Downstream products should not own separate local ledgers that close or retry
outside ABG requirement/fold truth.

## odd_glc Product Split

This framing is broad enough to justify a distinct downstream ODD framework:

```text
odd_glc = ODD General Life Cycle
```

`odd_glc` should not be the place where the core algebra lives. The core belongs
in GTL/ABG first.

ABG/GTL core should own:

- staged context carriers: gap, problem, solution space, intent, product,
  requirements, destination topology, instruction set, runtime, assurance;
- requirement algebra carriers and relation law;
- requirement-as-carrier/functor preservation laws;
- traversal spans, edge environments, projection, evidence binding, folds,
  residuals, replay, attenuation, and re-entry;
- destination-topology declarations as introduced HOW constraint frameworks;
- GTL wrappers and typecheck/admission support for those carriers.

`odd_glc` should then use those primitives as an ODD framework for general
life-cycle construction. It should own:

- life-cycle vocabulary and read models over the core carriers;
- graph functions for homeostatic gap, problem framing, solution-space
  selection, WHAT decomposition, HOW topology selection, instruction-set
  construction, assurance, release, and operational feedback;
- default F_P prompts and F_H decision surfaces for life-cycle interpretation;
- product-facing workflow policy, UI/operator affordances, and domain-specific
  plugins where generic ABG projection is insufficient.

The construction order is:

```text
extend GTL/ABG core algebra
  -> expose GTL wrappers and admission/typecheck gates
  -> build odd_glc over those primitives
  -> let domain products, including odd_sdlc-style products, specialize odd_glc
```

The boundary rule:

```text
ABG/GTL preserves and executes the algebra.
odd_glc interprets it as a general life-cycle framework.
Domain products specialize odd_glc for concrete product families.
```

Do not put `odd_glc` domain policy into ABG as core runtime law. Do not make
`odd_glc` reimplement GTL/ABG requirement folds with product-local ledgers.

## Gaps In Current Thinking

### 1. Span Identity

We need a canonical `TraversalSpan` identity that survives:

- graph-function publication
- graph-vector identity
- public starts such as `next`
- overlays
- zoomed child frames
- recursive graph functions
- downstream product graph aliases

Without this, requirement spans will drift back into local string conventions.

### 2. Fragment Compression Policy

We need rules for context fragments:

- how to digest compressed fragments
- when a fragment is only context
- when a fragment must be promoted into an explicit requirement term
- how conflicts between fragments are represented
- how stale fragments are invalidated

Do not itemize everything immediately. But the promotion rule needs to exist.

### 3. Requirement Identity And Versioning

We need stable ids across refinement and reprice:

- requirement atom id
- derived child id
- superseded id
- projection id
- residual id
- fold id

If ids are unstable, replay and attenuation become unreliable.

### 4. Refinement Semantics

`And`, `Or`, `Refine`, `DependsOn`, `Project`, `Defer`, and `Residual` need
precise fold semantics.

Open questions:

- Can an `Or` branch close by selecting one branch and residualizing the
  others?
- How does repricing rewrite spans?
- Does `Refine(parent, children)` close parent only when all children close, or
  can a parent be partially satisfied?
- How are downstream deferrals distinguished from weak closure?

### 5. Projection Ownership

Some projections are generic. Some are domain-specific.

Generic ABG can project:

- active spans over edges
- prior folds and residuals
- evidence binding shape
- envelope validity

Downstream plugins may need to project:

- product file targets
- technology-specific test roots
- domain evidence meaning
- product acceptance interpretation

The plugin API must be explicit so product-local code does not rebuild a rival
runtime.

### 6. Replay Precedence

Replay needs algebraic precedence rules:

- current evidence vs prior evidence
- empty prior attempt vs current admitted attempt
- stale evidence under changed context
- stronger authority policy vs weaker authority policy
- partial fold vs terminal fold

This is currently where many materialization bugs appear.

### 7. Residual Attenuation

Residual pressure should attenuate through iteration.

The system needs measurable residual transitions:

- unchanged residual
- narrowed residual
- transformed residual
- moved residual to prerequisite span
- escalated residual
- cleared residual

Retried attempts that merely regenerate the same residual without a typed
transition should be visible as non-progress.

### 8. Relationship To Existing Edge Assurance Contracts

Edge assurance contracts already carry residual pressure and closure
disposition. The new requirement algebra should not replace them abruptly.

Likely path:

1. Edge assurance contract references a requirement projection schema.
2. F_P findings bind to requirement projection ids.
3. Assurance fold emits requirement fold refs and residual refs.
4. Existing residual-pressure refs become projections from the requirement
   ledger.

### 9. Query Surface

We need query APIs for:

- active requirements for an edge
- requirement environment for a run frame
- obligation projection
- materialization target projection
- evidence bindings
- folds
- residuals by remaining span
- attenuation over attempts

Without query APIs, downstream products will keep parsing archives.

### 10. Migration Discipline

The migration must not require downstream products to rewrite everything at
once.

Initial bridge:

- keep existing obligation refs
- wrap them in `RequirementProjection` records
- derive materialization/evidence ledgers as projections
- make closure decisions name requirement fold refs
- gradually replace local ledger-specific rules with requirement algebra folds

### 11. Stable Identity And Round-Trip

Traditional requirements systems survive because requirement ids and relation
ids remain stable across tools, imports, exports, and document reshaping. ABG
needs the same discipline.

Open questions:

- What is the canonical ABG requirement GUID format?
- Can product-local ids be aliases over ABG ids?
- How are imported ReqIF-style ids preserved without making ReqIF the native
  authority format?
- How does a requirement reprice supersede an old id without losing replay?

### 12. Assurance-Case Projection

ABG folds should be queryable as a structured assurance case.

Open questions:

- What is the minimal claim/strategy/evidence/context projection?
- Which fold statuses become undeveloped claims?
- How do residuals become claim gaps without duplicating the residual ledger?
- Should SACM export be a later compatibility layer?

### 13. Obstacle And Conflict Analysis

Requirement non-closure is not always missing evidence. It may be a known
obstacle, conflict, invalid assumption, or missing operationalization.

Open questions:

- How does F_P propose an obstacle without closing it as truth?
- Which obstacles are deterministic envelope facts?
- How do conflicts between context fragments become typed pressure?
- When does obstacle pressure trigger reprice rather than retry?

### 14. Operationalization Boundary

KAOS separates goals/requirements from the operations and agents that realize
them. ABG needs an equivalent boundary.

Open questions:

- When is a requirement sufficiently operationalized into graph functions and
  spans?
- How does a missing graph operation differ from missing evidence?
- How does agent assignment interact with ABG worker/role binding?

## Minimal Implementation Slice

First slice should be small and ABG-owned.

1. Add `TraversalSpan`, `RequirementTerm`, `RequirementProjection`,
   `RequirementTestRelation`, `RequirementEvidenceBinding`, `RequirementFold`,
   and `RequirementResidual` carriers.
2. Add `RequirementRelation`, `RequirementAttribute`, and `RequirementImportRef`
   carriers for stable identity, source metadata, and typed relations.
3. Add staged `AuthorityContextFragment` fields for origin stage, constraint
   scope, promotion policy, applies-to refs, and routing outcome.
4. Add KAOS-inspired relation terms for refinement, obstacle, mitigation,
   conflict, assumption, agent assignment, and operationalization.
5. Add admission for those carriers.
6. Add `buildEdgeRequirementEnvironment(...)`.
7. Add deterministic `activeRequirements(...)`, `projectRequirements(...)`,
   and `routeContextConstraint(...)`.
8. Add a read model that can wrap current carried obligation refs and residual
   pressure refs as requirement projections without changing downstream
   behavior.
9. Add a minimal assurance-case projection over fold/residual truth.
10. Add tests proving:
   - broad `A -> X` requirement covers an interior edge;
   - narrow `F -> J` requirement does not cover earlier unrelated edges;
   - current evidence supersedes empty replay for the same projection;
   - partial fold can satisfy test-source projection while execution projection
     remains residual;
   - admitted execution evidence can still leave semantic test interpretation
     residual when F_P rejects the proof relationship to `Req.what`;
   - `A(P.asset, P.assurance)` decomposes into `Req.what` terms and folds back
     without scalar edge success erasing open assurance residuals;
   - a HOW instruction-set constraint can reframe instruction policy without
     silently changing WHAT;
   - a destination-topology constraint selects or reframes the introduced HOW
     constraint framework before materialization targets are projected;
   - a product-stage constraint that changes meaning routes to product reprice
     rather than local materialization compensation;
   - a runtime constraint routes to residual, obstacle, or owning-stage
     re-entry with the origin stage preserved;
   - compressed context fragments constrain the edge but are not all active
     obligations.
   - obstacle pressure blocks or redirects without pretending the requirement
     itself is semantically satisfied;
   - stable ids and relation ids survive a read/write round trip;
   - retry attenuation is classified as unchanged, narrowed, transformed,
     moved, escalated, or cleared.

Second slice:

1. Connect edge assurance findings to requirement projection ids.
2. Emit requirement fold refs from ABG assurance fold.
3. Project residual pressure from requirement residuals.

Third slice:

1. Move odd_sdlc materialization/postflight joins onto requirement projections.
2. Remove local peer-ledger closure rules that duplicate ABG fold authority.

Fourth slice:

1. Create `odd_glc` as a downstream ODD framework over the admitted GTL/ABG
   requirements algebra.
2. Add graph functions for gap/problem/solution-space framing, WHAT
   decomposition, destination-topology selection, instruction-set construction,
   assurance folding, and operational feedback.
3. Use `odd_glc` as the general life-cycle substrate before specializing
   domain frameworks such as odd_sdlc.

## Non-Goals

- Do not itemize all compressed textual fragments into atomic requirements.
- Do not make F_D judge semantic source/test/design content.
- Do not create a product-local requirement compiler inside odd_sdlc.
- Do not implement `odd_glc` core semantics before GTL/ABG owns the underlying
  carriers, folds, residuals, and admission gates.
- Do not treat materialized files, test success, or report shape as closure by
  themselves.
- Do not allow scalar edge close to erase a vector of active requirement
  pressure.

## Target State

For a traversal edge `D -> E`, ABG can answer:

```text
Which context fragments constrain this edge?
Which requirement terms span this edge?
Which prior folds and residuals enter this edge?
Which obligations are active on this edge?
Which evidence was admitted for those obligations?
Which requirements folded satisfied, partial, blocked, deferred, or residual?
Which residual pressure remains, and what span owns it next?
```

When ABG can answer those questions from admitted carriers and replay truth,
downstream ledgers become projections. That is the route out of repeated drift
into local materialization, closure, and retry rules.
