# ABIogenesis 5.0 - Product

**Product ID**: PROD-001
**Version target**: 5.0.0
**Updated**: 2026-09-26
**Status**: Active - accepted by T-283 F_H closure
**Derives from**: INT-001 through INT-007
**Change authority**: T-283 `intent_reprice`; T-287 D1-AUTH-ABG lifecycle, owner-directed 5.0/5.1 boundary, STDO run-environment, [execution-calculus Product re-entry](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#execution-calculus-product-re-entry) and [program-construction definition](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#program-construction-calculus-definition)
**Acceptance receipt**:
`.ai-workspace/comments/codex/20260720T021524Z_DECISION_fh_accept_t283_and_authorize_m2.md`
**Method adoption authority**: direct Product-owner `F_H` ruling and bounded
`product_reprice` recorded in
[STDO method adoption](../.ai-workspace/comments/codex/20260921_STDO_251_RC1_ADOPTION/README.md).
**Release-scope ruling**: [2026-09-13 boundary amendment](../.ai-workspace/comments/codex/20260913_ABG5_ARCHITECTURE_FIXES/release-boundaries.md).
**Delivery-allocation ruling**: [2026-09-13 steel-thread selection](../.ai-workspace/comments/codex/20260913_ABG5_STEEL_THREAD_DELIVERY_PLAN/decision.md).
**Run-environment ruling**: [2026-09-15 owner course correction](../.ai-workspace/comments/codex/20260915_ABG5_STDO_ENVIRONMENT_COURSE_CORRECTION.md#owner-direction).

---

## Purpose

This document is the sole complete ABIogenesis 5.0 Product-definition surface.
It defines the Product identity, lineage, language and runtime boundaries,
retained traversal behavior, feature families, cumulative scenarios, root
outcome, exclusions, qualification subjects, release boundary, and completion
predicate.

Intent owns direction. Requirements and scenarios provide traceable, testable
decomposition. Goals select the current work wave and root. Design and code
realize this Product. None of those surfaces may redefine it through local
terminology, implementation shape, operation counts, or historical precedent.

The current implementation is evidence to be evaluated after this
constitutional definition closes. It is not an input that can weaken or expand
the Product destination.

---

## Product Statement

ABIogenesis 5.0 is the feature-complete, source-independent successor to the
practical ABIogenesis 4.6 product.

ABIogenesis is a direct reference-frame evaluator and realization system. This
is the joined Product function, not a new named component. It directly
evaluates and realizes admitted recursive reference-frame declarations and
material relations through GTL, HoG, exact owners, ABG admission, and
Event-Calculus/replay projections. GTL remains the sole admitted semantic
source and topology carrier.

For this release, feature-complete means complete against the 15 selected 5.0
outcome families and their explicit baseline dispositions below. It does not
claim the capabilities reserved for 5.1 in [Release Boundaries](#50-and-51-release-boundaries).

It is an LLM-first programming system in which:

1. developers and LLMs author exhaustive typed graph programs in
   `GTL.TypeScript`;
2. Product and Validator owners admit and validate local types, raw
   declarations, and whole-program semantic relations;
3. modules publish GTL programs, callable `GraphFunction` values, contracts,
   and implementation bindings into one admitted catalog;
4. HoG evaluates the admitted GTL program directly through a small algebraic
   fold;
5. exact-pinned Effect `3.22.1` supplies only the internal typed composition,
   suspension, failure/Cause, stateless-capability, and physical-resource-scope
   calculus for that fold and installed owner bindings;
6. exact Product, GTL, HoG, ABG, Validator, and implementation owners supply
   meaning, including declared `F_D`, `F_P`, and `F_H` work, without
   exchanging authority;
7. ABG admits runtime facts and owns events, replay, lineage, continuation,
   correction, and closure; and
8. a thin Public family, SDK and CLI let a user inspect the
   same exact contracts, call a published
   `GraphFunction`, start a published program, observe its state, and follow
   automatic admitted progression or a truthful blocked handoff. Native human
   response and response-driven same-run resumption are reserved for 5.1.

The product can be compressed to this path:

```text
GTL.TypeScript source
  -> TypeScript checking
  -> GTL validation
  -> module and catalog admission
  -> program start or GraphFunction call
  -> one Effect composition of the HoG algebra and exact owner ports
  -> direct traversal of the original admitted GTL value
  -> exact F_D | F_P | F_H implementation boundary
  -> ABG event admission and replay
  -> typed result | continuation | hold | gap | block
```

ABIogenesis 5.0 does not invent a second source language. It does not lower GTL
into a second executable program language or intermediate representation.

This is an explicit supersession of one 4.6 mechanism, not a reinterpretation
of 4.6 history. The 4.6 semantic compiler performed validation and diagnostics,
then lowered admitted C declarations into a normalized HoG program declaration
and compiled execution-declaration handoff. 5.0 conserves its type checking,
normalization, diagnostics, repair relations, pre-effect refusal, and complete
handoff obligations while retiring the lowered declaration as executable
program authority. The active 5.0 product term is **GTL validator** because HoG
traverses the admitted GTL value directly. The joined reference-frame-evaluator
function does not change that component name or restore retired lowering.

## Product Lineage

The semantic origin baseline is the immutable ABIogenesis 4.6 RC5 product cut:

| Coordinate | Exact origin identity |
|---|---|
| release identity | `4.6.0-rc.5` |
| Git tag | `v4.6.0-rc.5` |
| published tag commit | `8d43dc8968e3df16029e6201680a0301eda035f1` |
| clean source commit recorded by the release manifest | `bab609ab353304324b939a4528371603eef0a05d` |
| package | `@abiogenesis/typescript-tenant@4.6.0-rc.5` |
| tarball SHA-256 | `d9c99382f2c5b787ebe48ce72c320616baeac9187863078332df18c0036853ea` |
| release-snapshot manifest SHA-256 | `39fd4bd30fc8647b66fe20af4e0e78e3d2327a7d519cad15e3f589eba0acb913` |
| release-note SHA-256 | `2e07d2436193851dc349a51a227cc8f4a3db36e9624da1721346d43e2411a7eb` |

The release-snapshot manifest, release note, exact package, and their recorded
proof are part of this origin baseline. The origin is a semantic and released-
artifact baseline. It does not assert that the current 5.0 implementation branch
descends from RC5; Git ancestry is separate evidence assessed during the later
correction vector.

4.6 already established the product's core identity:

- GTL declares graph structure and lawful work;
- the traversal monad composes work across deterministic, probabilistic, and
  human boundaries;
- ABG owns admitted runtime truth rather than a caller, worker, fixture, or log;
- events and replay preserve causal state;
- results may be terminal or may expose typed unresolved pressure; and
- a real worker invocation, result, continuation, and replay path is product
  behavior rather than test scaffolding.

5.0 completes and externalizes that product. It adds complete GTL authoring and
validation, direct HoG execution of the full retained algebra, source-independent
installation, one admitted catalog, a public SDK and CLI shell, standard GTL
constructions, self-conformance, downstream portability, and an exact release
lifecycle.

5.0 must account for every semantic behavior and explicit exclusion in the
exact origin baseline. The ledger begins complete and unfiltered; it does not
preselect only behavior already believed to be retained. This includes the RC5
B-001 transport correction: capability-lane propagation through the real
dispatch path, closed-prompt versus `worker_executes` tool posture, bounded
downstream argv extension, declared external-sandbox posture, and fail-closed
protocol-owned flags. It also includes the RC4 substrate that RC5 explicitly
retained.

Each origin-baseline row must end as `conserved`, `superseded`,
`intentionally_removed`, or `not_applicable`, with behavioral evidence. A
successor-native implementation may replace a 4.6 mechanism, but no baseline
claim or repair may disappear silently.

The mutable implementation produced during the attempted 5.0 build is not a
product-lineage authority and does not define this Product. It is evaluated
separately against this Product through an admitted current-state correction
vector after constitutional Product closure.

## Product Identities

The following identities are distinct and exhaustive at the architecture
boundary.

### ABIogenesis

ABIogenesis is the released product. It packages GTL, the validator, HoG, ABG,
the catalog and public contracts, the standard library, the SDK and CLI, product
management, conformance, proof, and release assets.

### GTL.TypeScript

GTL.TypeScript is the embedded typed graph programming language. A GTL value is
ordinary TypeScript data created through typed constructors and checked through
TypeScript plus GTL semantic validation.

GTL owns program meaning:

- graphs, nodes, vectors, contexts, interfaces, and attributes;
- graph functions, modules, roles, jobs, operators, evaluators, and rules;
- composition, substitution, recursion, fan-out, fan-in, gates, and promotion;
- compute composition and regime declarations;
- program starts, callable membership, policy, effects, results, closure, and
  proof obligations; and
- publication and compatibility declarations.

### GTL Program

A GTL program is an admitted graph composition. It owns topology, starts,
callable membership, compute composition, policies, result contracts, and proof
obligations.

A program is executable through a declared start. It is not a callable library
function and is not a runtime plan.

### GraphFunction

`GraphFunction` is the sole named callable work contract. It declares a typed
input/output boundary and a replayable GTL template that materializes a graph.
Every callable GraphFunction therefore has GTL structure for HoG to traverse.

An admitted implementation binding may realize a declared leaf seam inside
that constructive body. It cannot replace the template, materialized graph, or
published GraphFunction contract with an implementation-only callable.

A GraphFunction may be called from another GTL program or directly through a
public invocation when it belongs to the selected admitted program and catalog
view.

### HoG

HoG is the graph executor. It traverses the original admitted GTL program and
its GraphFunctions. It does not author, lower, select, or publish a rival
program.

HoG's target realization is small carrier and sum types, primitive algebra and
laws, derived combinators, one Effect fold/interpreter, and exact owner ports.
Pure case-specific traversal, route, retry, workflow, recursion, fan-out,
consensus, or continuation coordination is not irreducible merely because it
is pure. A retained imperative coordinator wrapped by Effect is not this
evaluator.

HoG may derive invocation-local execution state such as frames, cursors, work
queues, resolved bindings, and caches. Such state remains subordinate to one
program and invocation, cannot alter program meaning, and cannot be published or
resumed as an independent program.

### ABG

ABG is the runtime-truth substrate around HoG execution. ABG owns admission,
graph-call and frame identity, attempts, events, replay, lineage, evidence,
correction, continuation, and closure.

HoG advances the admitted GTL traversal. ABG admits execution facts and derives
the next admitted runtime state from those facts and the declared program.
There is one runtime path, not an HoG path and a competing ABG path.

### Module, Catalog, And Implementation

A module publishes programs, GraphFunctions, types, contracts, and compatible
implementation bindings. The catalog is the admitted, discoverable projection
of those publications.

An implementation, worker, tool, or plugin realizes only its declared seam. It
does not own program topology, traversal, event truth, continuation, or closure.

## GTL Language Contract

### Graph Algebra

The retained graph algebra includes:

```text
edge
compose
substitute
recurse
fan_out
fan_in
gate
promote
identity
same_object
```

These are language relations, not service methods or feature-specific runners.

### Compute Algebra

The complete retained C algebra is:

```text
C.of
C.id
C.compose
C.edge
workflow.C
C.batch
C.retry
```

`C.compose` is associative Kleisli sequencing. `workflow.C` crosses a published
GraphFunction or workflow boundary. `C.batch` preserves a declared collection
of pointwise child computations and their identities. `C.retry` repeats one
bounded C interior under one declared retry policy and attempt lineage.

Graph recursion and `C.retry` are not substitutes. Recursion reapplies a
GraphFunction under declared termination, foldback, parent re-evaluation, and
lineage. Retry repeats an attempt without changing the declared graph relation.

### Traversal Monad

The bounded runtime unit is `TraversalUnit<A, B>`. HoG executes each unit under
the selected GTL program. ABG bind admits its outcome and joins it to exactly
one lawful continuation:

```text
next unit
same-unit retry
declared recursive call
parent foldback
re-entry or reprice
typed human hold
yield or block
terminal projection
```

One traversal law covers deterministic workflows, LLM work, human work,
recursion, and mixed programs. Feature-specific controllers are unnecessary.
Retry, workflow, recursion, fan-out, consensus, and continuation are derived
frame-transition patterns over this same algebra, not independent imperative
engines.

## 4.6 Traversal Conservation Contract

The 4.6 product did not define traversal as one flat list of commands. It
defined several orthogonal dimensions that may be combined. 5.0 accounts for
those dimensions under its explicit release boundaries rather than collapsing
them into one enum, one runner branch, or one preferred happy path.

This section names the behavioral baseline. It does not require reuse of a 4.6
class, file, command spelling, or state machine.

### Compute Fibre

Every traversal stage selects one declared compute fibre:

| Fibre | Preserved behavior |
|---|---|
| `F_D` | Total deterministic work or evaluation executes with deterministic evidence and no probabilistic or human substitution. |
| `F_P` | Bounded probabilistic work executes through an admitted worker boundary and returns candidate output for admission. |
| `F_H` | Human-required work exposes a typed hold or blocked handoff with its unmet obligation. Native response admission and response-driven resumption are reserved for 5.1; attributed human authority is not impersonated or waived. |
| mixed | A program preserves each declared fibre's type, evidence, authority and replay identity. 5.0 progresses through F_D/F_P work and truthfully hands off at a required F_H response boundary; native response/resume composition is reserved for 5.1. |

Fibre substitution is shape-preserving. Replacing a declared `F_P` stage with
an equivalent `F_D` stage changes the selected interior and evidence class, not
the graph topology, C-call locus, event-spine shape, or continuation law. An
all-`F_D` program degenerates to a conventional workflow. An all-`F_H` program
declares a human process; its complete native response/resume traversal is a
5.1 capability. Neither requires a different graph algebra or engine.

### Structural Form

The same traversal monad supports these structural forms:

| Form | Preserved behavior |
|---|---|
| atomic call | One `C.of` leaf executes inside one declared C-call boundary and returns admitted evidence and result. |
| flat composition | `C.compose` sequences typed calls associatively; anonymous nesting erases and does not create a hidden frame. |
| edge program | `C.edge` expresses the canonical transform/evaluate/consequence program while allowing other declared open programs. |
| adaptive declared selection | GTL gates or policy select among named admitted compositions from replay-observed facts; the selected identity becomes replay truth and no HoG-local program catalog or ladder owns the choice. |
| batch | `C.batch` preserves every task's identity, result cardinality, evidence, and judgment under one non-authoritative grouping identity. |
| transparent child traversal | `workflow.C` invokes a named GraphFunction as a child traversal with child graph-call, frame, basis, run, and `sub_traversal` evidence. |
| graph recursion | A GraphFunction may reapply itself or another GraphFunction under declared termination, foldback, parent re-evaluation, and lineage. |
| retry | `C.retry` repeats the same bounded call under one retry policy and fresh attempt identity without pretending to be graph recursion. |

An atomic worker session and a transparent child traversal are both lawful
monad-boundary placements. The placement is declared. A child traversal uses
the same GTL/HoG/ABG law at the next level; it is not hidden orchestration.

### Consequence Route

4.6 published nine allowed consequence traversal families. 5.0 accounts for
each family as declared GTL and ABG behavior with the release allocation below,
not as nine special HoG runners.

| 4.6 family | 5.0 conserved meaning |
|---|---|
| `same_edge_retry` | Retry or repair the current declared call or edge under bounded attempt and evidence law. |
| `depth_traversal` | Enter a declared deeper GraphFunction, refinement, or zoom boundary and preserve parent/child identity and foldback. |
| `graph_span_reentry` | Re-enter a declared span or vector target within the current admitted traversal without fabricating closure for skipped work. Autonomous upstream/out-of-traversal A.0 routing is reserved for 5.1. |
| `public_start_reentry` | Start or continue a published program or GraphFunction through the public admission path. |
| `ticket_traversal` | Invoke product-declared ticket work through an owning GraphFunction or program; ABG does not own ticket storage or meaning. |
| `fh_input_required` | Stop with typed unmet human-input pressure and a human-readable handoff. Native response admission and same-run response-driven resumption are reserved for 5.1. |
| `escalation_or_reprice` | Escalate unresolved authority or propose reprice through declared policy and `F_H`; a worker cannot apply it directly. |
| `gap_stop` | Publish unresolved pressure as a typed gap or block without false completion or automatic retry. |
| `non_admit` | Refuse the proposed route before effects because declaration, authority, basis, or contract admission failed. |

GTL declares which routes are available at the current boundary. A consequence
implementation may propose one. ABG admits or rejects the transition and owns
its event, continuation, cursor-fact, and replay truth. HoG applies only that
admitted transition to direct GTL traversal. Missing route declaration is
negative authority, not permission for an SDK or product controller to
improvise.

### Runtime Disposition

The observable outcome of a traversal step remains typed. The conserved
semantic outcomes are:

```text
advance_vector
close
retry_same_edge
repair
re_enter
yield_continuation
inspect_runtime_archive
reprice
human_assurance_required
escalate
gap_stop
block
non_admit
```

These outcomes may project into more specific contract variants, but none may
be erased into a generic success/failure flag. A lower-priority retry fallback
cannot override a typed block, reprice, human hold, yield, or re-entry fact.
Closure requires admitted assurance on the current basis; worker completion or
asset presence is insufficient.

### Public Start And Control Semantics

4.6 exposed `start -> iterate` over the semantic request dimensions `scope`,
`target`, and `until`. It supported:

- advancing the next lawful work under the current program;
- targeting a published GraphFunction;
- targeting a published asset through its owning program or GraphFunction;
- bounded traversal until one requested stop or convergence condition;
- direct or lawfully proxied `F_H` control; and
- direct or supervised root control.

5.0 may use different typed SDK and CLI spellings. It accounts for these
behaviors through program start, GraphFunction invocation, catalog resolution,
typed stop conditions, and policy. A published asset remains non-callable; its
owning program or GraphFunction is the executable target. Control mode remains
policy around traversal and never becomes another traversal controller. Native
human response/proxy-resume and whole-run semantic executive supervision are
reserved for 5.1; ordinary declared system policy and runtime liveness remain
5.0 behavior.

### Conservation Proof

Before 5.0 can close, its exact installed candidate must establish source-grounded
coverage of every retained compute fibre, structural form, consequence route,
runtime disposition and public start/control behavior above. Shape-preserving
fibre substitution remains a mandatory differential over retained behavior.

Coverage is semantic, not a fixed execution partition or one-Result-per-row
mandate. One actual execution may support several claims; independent judgment
must establish each claim's applicability, exercised outcome, nearest-invalid
boundary and sufficiency. Missing or inadequate coverage remains blocked.
Coverage grouping may change without dropping or weakening retained behavior;
changing a Product outcome still requires Product re-entry.

Coverage retains:

```text
4.6 behavior identity and witness
5.0 declared GTL expression
5.0 HoG execution path
5.0 ABG event and replay evidence
publicly observable result or continuation
mutation that proves the nearest invalid substitute refuses
explicit release applicability and scoped disposition for any deferred portion
```

Equivalent successor behavior is sufficient; patch or carrier identity is not.
An unresolved retained 5.0 portion blocks its affected feature and release
claim. All retained behaviors remain explicitly covered. A portion explicitly reserved for
5.1 has a scoped `intentionally_removed` 5.0 disposition with its owner ruling,
future work route and evidence of the retained 5.0 boundary; it is not marked
`conserved` or counted as an executed response/oversight capability. This
matrix is part of Product proof, not an implementation inventory.

## Validation Contract

GTL has three validation depths.

1. Native TypeScript checking decides local type, generic, interface,
   discriminated-union, and constructor law.
2. Raw admission checks serialized or package-originated values after
   TypeScript types have been erased.
3. The GTL validator checks whole-program relations that local types cannot
   decide.

The GTL validator checks at least:

- identity, version, digest, and reference coherence;
- uniqueness and reference resolution;
- module, program, catalog, and GraphFunction membership;
- source and target interface compatibility;
- graph and C-algebra well-formedness;
- exhaustive starts and callable publication;
- role, capability, implementation, and compute-regime compatibility;
- recursion, termination, foldback, and boundedness declarations;
- input, output, effect, evidence, refusal, and closure completeness;
- required runtime-binding declarations; and
- absence of conflicting selectors, hidden defaults, and parallel authorities.

The validator returns typed diagnostics and may return an identity-bearing
validated view of the same GTL value. It does not return an executable plan,
instruction program, HoG program, controller, or runtime topology.

Runtime admission resolves environmental facts such as workspace, installed
product, catalog, worker, tool, capability, context snapshot, and execution
basis. Static validation cannot manufacture those facts.

Canonical serialization supports package transport, identity, digests, replay,
and source-independent consumption. It must round-trip the same GTL value. It is
not a second language.

## Compute And Authority

Every executable boundary declares one compute regime.

| Regime | Product meaning | Boundary |
|---|---|---|
| `F_D` | Interface and envelope validation, total mechanical predicates, and explicitly declared total deterministic functions over a closed domain. | Deterministic implementation alone is insufficient. Open-world judgment, semantic inference, and hidden defaults are not `F_D`. |
| `F_P` | Semantic construction, interpretation, diagnosis, synthesis, ranking, repair, and evaluation that is not a total function. | Output is candidate material until admitted. It cannot emit ABG truth, choose continuation, or certify closure. |
| `F_H` | Attributed human approval, rejection, policy choice, ambiguity resolution, escalation, and reprice authority. | Input crosses typed admission and cannot override deterministic invalidity or write runtime truth directly. |

`F_P` is the default for non-total machine work. `F_D` is not a quality label.
`F_H` may be exercised directly or by a lawfully admitted proxy, but proxy actor
identity does not become the underlying authority identity.

## Exhaustive LLM-First Contract

LLM-first means the LLM receives an explicit construction space rather than an
unbounded prompt surface.

Every executable program and GraphFunction boundary declares, directly or by
exact reference:

- input, output, and context interfaces;
- immutable basis inputs;
- compute regime and implementation role;
- worker, tool, or capability requirements;
- allowed effects and write territory;
- result, refusal, malformed-output, and contradiction shapes;
- evidence, attribution, and provenance requirements;
- retry, recursion, continuation, escalation, and termination law;
- closure predicate or authority;
- program and callable membership;
- version, compatibility, and invalidation identity; and
- event, replay, and projection obligations.

Prompt or instruction text is a stateless projection of those contracts and
the admitted runtime context. It is not program source, a compiled plan, or a
source of semantic authority.

## HoG And ABG Runtime Contract

For each invocation, the product follows one causal path:

```text
admit invocation and exact basis
  -> open graph call and frame
  -> traverse the selected GTL term through HoG
  -> invoke the declared F_D | F_P | F_H seam
  -> admit result and evidence
  -> emit canonical ABG events
  -> incrementally derive current state from the admitted events
  -> evaluate the declared boundary
  -> bind continuation or terminal truth
```

The runtime must preserve:

- invocation, graph-call, frame, and attempt identity;
- parent/child and source/result causality;
- selected program, GraphFunction, catalog, and implementation basis;
- inputs, outputs, effects, evidence, and actor attribution;
- retries, recursive calls, foldback, corrections, and re-entry;
- typed stop, hold, gap, block, and terminal states; and
- deterministic replay of every published projection.

A command, log entry, file, worker response, or fixture assertion is not an ABG
event merely because it exists. Runtime truth begins only at the owning
admission boundary. Replay derives state from admitted events; callers and
fixtures do not author the result they later claim to observe.

## Program Construction Boundary

A task can be realized through different lawful GTL compositions. Its original
meaning, constraints and completion condition govern their selection. Program
construction takes the task, applicable authority, relevant workspace
observations, valid evidence and available GraphFunction contracts and produces
a candidate ordinary GTL Program, the obligations it attempts and the residuals
it leaves. A candidate is a proposal for work, not evidence of its success.

The [program-construction calculus](requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md#program-construction-calculus)
defines that relation, its semantic conservation, contract matching, context
requirements and discriminating cases. It is the detailed owning requirement;
the [execution calculus](#execution-and-context-calculus) owns the subsequent
admitted traversal. Construction may be performed by a human, an agent or an
explicitly selected construction Product above the interpreter. GTL validation,
catalog/publication, HoG traversal and ABG runtime truth retain their existing
owners. A construction result supplies none of their admissions by itself.

Changing the graph preserves the task contract unless its owner changes that
contract. Existing artifacts, execution evidence, assessments and historical
construction relations are distinct inputs; the remaining obligation determines
whether to construct, execute, evaluate, investigate or seek an owner ruling.
Completion reports the declared condition over admitted evidence. An omitted
graph stage or a successful Run cannot waive an unresolved obligation.

This boundary constrains program authorship without adding a general automatic
preprocessor, global optimizer or whole-run adaptive executive to the fifteen
5.0 families. A Product selecting those capabilities owns their realization
and qualification. Current odd_glc declarations remain governed by that
Product's own scope. These relations are independent of deployment topology;
they prescribe no additional controller, runtime carrier or writable ledger.

## Execution And Context Calculus

This section governs the behavioral relations shared by traversal, context,
admission, recovery and proof. Its symbols describe existing Product subjects;
they introduce no carrier schema, task aggregate, controller, store or executor.
Downstream Products declare their lifecycle and domain completion conditions.
ABG preserves their admitted relationships without imposing a particular SDLC.

These semantic relations are independent of technology and deployment topology.
Build-tenant design owns their technological realization and operational-risk
mechanisms within the supported Product scope.

### Task, Basis And Progressing State

| Symbol | Subject |
|---|---|
| `T` | Selected task: supplied input, requested outcome, permitted scope and completion condition. |
| `P` | Admitted GTL Program: topology, computations, contracts, policies and transition rules. |
| `B` | Exact execution basis, including the graph-entry input and selected invocation authority. |
| `S` | Derived runtime state: active/pending traversal positions, their current input refs, admitted assets/evidence and observation dispositions. |
| `W` | Mutable physical workspace; an observation of it is a separate immutable subject. |
| `L` | Committed ABG event history, interpreted against its exact declarations and referenced evidence. |

One task may require several declared computations. Sequential handoffs and
role or stage boundaries within the same invocation preserve its basis unless
the declared re-entry changes it. A declared child traversal has its own graph
call, frame, basis and entry input, with its associated Run, causal parent and foldback
relations. Such decomposition does not itself create another user task, new
intent or workspace authority. `B` remains fixed for the identity it names;
changed authority follows binding/re-entry law and preserves the prior identity
and cause. For a linear path, write `S_k = (k, x_k, A_k, O_k)`; a branched or
recursive traversal retains each position, current value and parent relations.

```text
B.entryInput = x_0
first(B, x_0) -> admitted result x_1
second(B, x_1) -> admitted result x_2
```

At a composed handoff, the consumer's actual input is the producer's admitted
output through the declared transfer or transformation. Authentication uses
the current traversal input and its causal producer, not the unchanged graph
entry. Equal bytes alone do not establish producer identity or permission.
Nested calls preserve their declared entry and foldback relations; they do not
turn every sequential handoff into a child call.

### Execution, Admission And Advancement

```text
call_k                 = prepare(P, B, S_k)
context_k              = contextFor(call_k, S_k)
(raw_k, W_next, facts_k) = execute(call_k, context_k, W_k)
outcome_k              = admit(call_k, raw_k, facts_k)
S_next                 = advance(P, S_k, outcome_k)
```

These are semantic relations, not a mandated procedure or event census.
Preparation establishes the exact current input, contracts and permitted
effects. HoG traverses the declared computation; the declared owner performs
its effects; ABG admits results and evidence and owns runtime continuation.
`F_D`, `F_P` and `F_H` retain their distinct authorities. Refusal, failure,
hold and unresolved outcomes follow their declared routes. Probabilistic or
human responses remain candidate material until admitted.

Execution failure does not imply `W_next = W_k`. Performed effects and their
observations remain attributable even when result admission or later work
fails. An unavailable post-effect observation withdraws dependent currentness
over the potentially affected scope, preserves unaffected facts, and records
unknown state; it fabricates neither rollback nor a successor observation.

### Role-Specific Context

For an already selected computation, `F` denotes its declared evaluation/work
frame: role, question, criteria, scope, required inputs and response contract.
It is distinct from an ABG runtime `Frame` aggregate. Reference-frame meaning
remains with its owning declaration and evaluator; these equations do not
introduce a deterministic interpreter of open-world frame meaning.

```text
selected_k = select(F_k, currentInput_k, admittedAssets_k,
                    applicableObservations_k, governingMaterial_k)
context_k  = render(F_k, selected_k)
resolve(render(selected_k)) = selected_k       [for exact shared presentation]
```

Selection and validation compute declared dependencies, domains, identities,
ordering, permissions, freshness and bounds. Unknown required material produces
a typed gap. Whether the declared material and criteria are semantically
sufficient remains a separately warranted judgment; schema validity, hashes
and prompt-size compliance cannot establish it.

Instructions and response contracts agree on the selected role. Where a
Program separates construction from independent assessment, its assessor
evaluates the exact candidate without being assigned replacement authorship.
Selected material preserves its source, qualifications, uncertainty, version,
accepted/rejected disposition and supporting dependencies. Bodies may be shared
through exact references resolvable within the actor's admitted context/access;
an inaccessible locator does not supply required content. Repeated whole bodies
require a declared presentation need. Historical runtime carriers enter the
prompt only through the selected material relation, never merely because they
enclose that material. Context is a projection, not execution authority.

### Live State, Recovery And Valid Reuse

```text
L_next = L ++ newlyCommittedEvents
S_next = foldStep(S, newlyCommittedEvents)
recover(P, L, referencedEvidence) == committedRuntimeState(S)
```

The owning live runtime maintains this incremental projection. Ordinary internal
handoffs use its established state; they do not reconstruct or reauthenticate
the accumulated history merely
because control crosses a function or role boundary. Cold acquisition,
recovery, requested historical reads and actual invalidation retain their
necessary reconstruction. Derived state is discardable and reproducible from
the one admitted history; it is never an independent authority. Recovery does
not establish that historical observations still describe the current `W`.

Recovery restores the actual continuation position, current inputs, admitted
completed work and unresolved obligations. If a producer succeeds and its
consumer cannot start, the result remains available at the consumer boundary
with its existing assessment status. Recovery neither reruns valid completed
work solely to recreate that boundary nor invents the missing assessment.
Replacement Runs preserve causal linkage without transplanting Run identity,
continuation aggregates, actor provenance or historical execution facts.

```text
reusable(a) = admitted(a)
              AND dependenciesRemainValid(a)
              AND applicableToCurrentUse(a)
```

Owners consume established facts with their exact subject, basis, scope,
provenance and invalidation conditions. Reuse preserves each owner's complete
admission responsibility and any independently required judgment. Changed
dependencies invalidate the affected relations; unknown affectedness remains
explicit. Changed subjects, authority or evidence bases require their applicable
checks before reliance or effect. Internal call boundaries alone create no new
semantic proof obligation.

### Outcome And Computational Proportionality

```text
complete(T, S) = declaredCompletionCondition_T(admittedEvidence(S))
validResponse != satisfiedStage != completedTask
cost(T) = initialization + sum(selection + rendering + execution
          + admission + persistence) + recovery
```

Completion requires the selected outcome and its declared evidence and
judgments. A terminal transport response, successful parse or local fixture
does not substitute for that condition. The framework governs the worker's
input, output, effects and evidence boundary; its internal solution strategy
does not acquire a framework lifecycle.

Framework work is attributable to the rules, relevant data extent and effects
being processed. Ordinary handoff cost does not grow with unrelated history
without a named governing dependency. A necessary whole-history operation
identifies that dependency and its extent. No universal time limit, read
multiplier, token quota or per-operation benchmark is introduced by this law.

Qualification follows the actual declared composition: progressing values
differ from graph entry, producer results survive consumer-preparation failure,
live and cold projections agree at the same committed boundary, role/context
qualifications survive sharing, and unknown physical state stays unknown.
Fixtures preserve these relations; a newly invented basis or substituted
producer cannot qualify the real handoff. These are obligations within the
existing S02/S03/S06 and qualification scopes, not a new feature family or a
claim that current realization has passed.

The detailed acceptance owners are
[C-call](requirements/abg/REQ-R-ABG3-CCALL.md),
[instruction assembly](requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md),
[projection](requirements/abg/REQ-R-ABG3-PROJECTION.md) and
[continuation](requirements/abg/REQ-R-ABG3-CONTINUATION.md).

## Installed Product And Catalog

ABIogenesis 5.0 is an immutable, source-independent product for a trusted
developer desktop. A consumer can install and use it from exact release
artifacts without importing the mutable source tree.

The installed product includes:

- GTL.TypeScript types and constructors;
- raw admission and GTL validation;
- HoG and ABG runtime libraries;
- the standard module and catalog;
- public contracts and schemas;
- a typed SDK and thin CLI;
- conformance and installed-product scenarios;
- product identity, dependency, compatibility, and provenance manifests; and
- qualification and release evidence for the exact bytes.

The catalog publishes exact modules, programs, GraphFunctions, non-callable
types and overlays, implementation bindings, schemas, versions, compatibility,
and provenance. Catalog presence grants discoverability, not execution
authority. Invocation binds one installed product set, workspace, admitted
program, catalog view, callable or start, input, context, implementation,
capability set, and ABG execution basis.

Only GraphFunction is a named callable library function. A program may be
started at a declared entry. Types, nodes, vectors, and overlays may be
inspected and composed but are not callable.

## STDO-Governed Run Environment

ABIogenesis publishes a reusable STDO environment template as GTL-declared
environment and Context data. An STDO-governed Program explicitly adopts the
template; its Run binds the exact released STDO basis, matching axiomatic
program and index, released Axiom Indexer (`a_c`) implementation and permitted
corpus-access capability, and role-specific frame and instruction-policy refs.
Release identities are immutable and content-bound. An ambient installation,
mutable version selector or prompt-only instruction supplies no Run binding.

Source development and STDO-governed ABI runs consume the same external released
STDO Product and its released companions. In development, the LLM applies the
framework and directs the work. In the ABI Product, the framework governs LLM
execution. Development's use of STDO or `a_c` does not establish the Product's
runtime capability, and ABI does not redefine or implement a competing STDO.

GTL owns the environment declaration and required corpus-access relations.
ABG validates and admits the exact bindings and required access/context evidence
through existing owners before dependent work. `a_c` supplies access to the
axiomatic corpus and its indexed relationships; it does not apply axioms,
choose work, confer authority or accept results. LLM interpretation and
evaluation remain distinct from mechanical binding and evidence checks.
A successful retrieval proves access, not correct application of its contents.
Valid access evidence is reusable within its declared basis and scope.

HoG retains its existing linear Worker -> Evaluator -> Consequence workflow.
Each step consumes its declared frame, policy and relevant current workspace
observations through the same instruction-assembly and admission path. The
template adds no role hierarchy, frame interpreter, controller or execution
loop. The Run's governing basis remains explicit while ordinary worksite edits
produce successor observations. A material environment change requires its
declared re-entry; it does not silently upgrade a running basis.

Role instructions and context policy are tunable as declared, identified data.
Each invocation preserves the policy and supplied context that produced its
result. Tuning does not change authority, requirements or acceptance conditions
implicitly. Current observations and affectedness govern reuse: authored work
awaiting assessment remains available without being represented as accepted,
and only invalidated support loses its prior claim. Local Consequence selects
declared progress, correction, re-entry or truthful block without requiring
unaffected work to be recreated.

This template realizes existing F02/F04/F07/F10/F17 obligations. General GTL and
ABG remain independent of STDO-specific interpretation. Whole-run Executive
oversight, autonomous upstream re-entry and native human-response resumption
retain their 5.1 boundaries.

## SDK And CLI

The SDK is the typed programmatic projection of the installed catalog and ABG
runtime. The CLI is a thin invocation shell over that same projection, analogous
to a Python shell or Scala REPL over a loaded environment.

The user can:

```text
inspect installed products, modules, programs, functions, and contracts
validate a GTL program
publish or admit a lawful module
call a published GraphFunction
start a published GTL program
read state, result, evidence, gaps, and replay
inspect a typed human-required block and its handoff
continue admitted work under existing specification, constraints and authority
run conformance and installed-product proof
```

The public surface derives from one typed contract and catalog authority. Exact
operation names, schemas, and capability projections are frozen for the release,
but their count does not define the engine or create separate semantic owners.
Operation and exact-definition inventories are release-scoped projections of
this joined evaluator. Reserved human-response definitions do not become 5.0
capabilities merely because a schema or historical binding exists.

The SDK and CLI may parse, type, transport, ignite, and render. They may not:

- compile or lower GTL;
- choose hidden topology, vectors, C stages, or defaults;
- resolve implementations outside admitted catalog authority;
- invoke workers directly;
- construct execution bases, events, retries, or continuations;
- order One Surface; or
- decide closure.

One bounded Codex projection may delegate to the same public contract. It owns
no copied program, traversal, event, continuation, or product behavior. Native
operation must not depend on Codex, Claude, or another marketplace host.

## Standard GTL Product Constructions

5.0 publishes product capabilities that prove the general engine by using the
same public GTL, catalog, HoG, and ABG path as downstream consumers.

### System And One Surface

The standard system program composes exactly four semantic authorities:

```text
synthesizeModel -> evalGap -> evaluateNext -> evaluateAction
```

Intent admission, GraphFunction invocation, evidence admission, and
continuation are distinct ABG boundaries between and around those authorities;
they are not additional semantic authorities. The public SDK and CLI start or
continue the program; they do not implement its loop. In 5.0, a required human
response yields a truthful blocked handoff; native response/resume is 5.1.

### Consensus

Dedicated Consensus qualification is reserved for 5.1. Existing ordinary
GraphFunctions remain reusable; their presence does not claim S05 acceptance.

Consensus is a bounded standard-library GraphFunction expressed through
ordinary GTL composition. It demonstrates attributed parallel work, fan-out,
fan-in, disagreement, bounded retry or recursion, mechanical validation,
probabilistic evaluation, human escalation, typed results, and replay.

Consensus has no special runner, scheduler, CLI command, event family, ticket
mutation authority, or closure path.

### Planned 5.1 Observer And Tuner

The observer and tuner read ABG replay truth and produce attributed diagnostic
or change proposals. Their outputs remain drafts. Ratification or rejection
crosses the ordinary policy or `F_H` boundary; neither capability mutates
specification, configuration, or tickets directly.

Whole-run executive oversight is the wider-scope Consequence capability
defined in [Release Boundaries](#50-and-51-release-boundaries). Observer
findings, Consequence proposals and tuner declaration drafts retain separate
judgment and admission boundaries; tuning does not become runtime control.

This higher-order Product is reserved for ABIogenesis 5.1. It is not part of
the 5.0 feature, scenario, qualification, or release predicate. ABIogenesis
5.0 supplies the immutable execution, event, replay, catalog, and public
substrate over which the later 5.1 Product may be designed and qualified.

### Recursive Programs

Recursive LLM work is an ordinary application of GTL recursion, child
GraphFunction calls, HoG child frames, admitted result foldback, parent
re-evaluation, and ABG continuation. It is not a separate runtime, controller,
or product feature family.

## 5.0 And 5.1 Release Boundaries

This section owns release applicability for the feature, scenario, requirement,
design and qualification surfaces. Fifteen feature families are selected for
5.0. F08 and F12 retain their identities as reserved 5.1 outcomes; the selected
families exclude the reserved portions below.
Historical or lower-level text does not restore a deferred release obligation.

| Capability boundary | 5.0 | Reserved 5.1 capability |
|---|---|---|
| Local Consequence | Evaluation supplies evidence; Consequence proposes advance, bounded retry/repair, declared local re-entry, or truthful block. ABG admits the transition; HoG executes it. | Autonomous upstream/out-of-traversal A.0 routing. |
| Graph recursion | Declared child GraphFunctions use the same HoG, explicit bounds, admitted foldback and parent re-evaluation. Child completion does not establish parent completion. | Whole-run executive policy that inspects and coordinates across branches. |
| Human boundary | Required human input produces typed block/hold and a human-readable handoff; external entry outside the current admitted traversal requires F_H authority. | Native response admission and response-driven same-run resumption, including evaluation of changed basis and lawful re-entry. |
| Observation | Progress, timeout, interruption, causal events and replay-derived liveness/disposition remain required runtime truth. | Whole-run semantic executive oversight, reflection and tuning under A5-F12/S04. |
| Consensus | Ordinary composition, recursion, attribution, admission and replay remain generic runtime obligations. Existing Consensus code and exact evidence are preserved without a dedicated release-complete claim. | Standalone F08/S05 qualification, including agreement/dispute and multi-workspace campaigns. |
| Host projection | Native SDK/CLI independence and the single Public authority are required. Any retained host adapter is a thin projection with truthful supported claims. Native worker transport remains required. | Additional host-adapter work and mandatory Codex/native parity qualification. |

The full original Data Mapper is an independently owned upper-bound capability
evaluation over complex software with deliberate ambiguities. It is not an ABI
5.0 release prerequisite or an ABI 5.1 feature assignment. Its evaluation probes
problem interpretation, solutioning, design quality, iteration depth and useful
progress under declared authority and limits. The original ambiguity remains
part of the test; a convenient weaker contract cannot replace it after execution.

That evaluation may conclude with a truthful bounded failure or block. Its
record distinguishes assumptions and chosen interpretations, unresolved
obligations, realized behavior, attempted revisions and depth, and the actual
stop cause. Evaluation completion does not establish application completion;
unmet application outcomes remain recorded without automatically requiring
another attempt. A separately selected complete-application delivery claim still
requires all of its mandatory outcomes. Generic structural, authority,
admission or runtime-truth violations remain Product defects, even when exposed
by this demanding case. The successful bounded F17/S06 witness remains required.

The F17/S06 witness selection binds the complete original source, the exact
selected input contract, every selected obligation, any prerequisite or
dependency, an independent expected-outcome oracle, and every excluded source
obligation with its downstream owner. Selection precedes construction and
result inspection for that successor witness. Existing work and evidence are
reused only within their original supported claims; observed weaker results
cannot set the successor oracle. A proper subset is explicit; it is not relabeled as the
whole original specification. Unresolved selected obligations prevent witness
completion. Excluded work remains open downstream and cannot supply a missing
prerequisite or conceal a generic 5.0 defect. A weaker result or test suite
does not revise the selected contract. The retained Data Mapper instance is
reusable subject material, not evidence that either contract is complete.

Routine work, including Data Mapper construction and correction, uses established
specification, constraints and admitted authority without a routine human
approval stage. Where unresolved work does not invalidate the next step's
prerequisites, authority or hard constraints, Consequence may propose useful
declared progression for steel-thread discovery while carrying the unmet
obligations explicitly. When no lawful continuation exists within the declared
limits, the result is a typed block and handoff. Progress never marks a gap
satisfied, fabricates a prerequisite, or waives final closure conditions.

The 5.1 executive applies Consequence recursively at a wider observation scope;
it is declared GTL work through the same GraphFunctions, HoG and ABG, not another
orchestration engine. At both scopes, Worker, Evaluator and Consequence use a reference
frame defining visible context, contract, constraints, permitted proposals and
return/escalation boundary. These are role/context declarations, not a new
frame runtime or a transfer of authority.

Full-tree visibility means access to indexed, replay-derived projections and
exact references, with bounded child investigation and admitted foldback; it
does not require the full tree in every prompt. Observation supplies facts,
evaluation supplies judgment, Consequence proposes, ABG admits, and HoG
executes. Wider visibility alone grants no permission to mutate, reprice,
re-enter or close. Reserved owner rulings remain with their owner.

5.0 retains automatic current-intent continuation, newly selected action
admission, local recursion, declared local correction and fresh replay. Native
human response deferral does not defer these relations, the complete selected
F17/S06 witness, self-conformance, or actual human acceptance of the same
qualified RC. Future runtime response and release acceptance are distinct.

## Complete 5.0 Feature Set

## Definition, Tool, And Runtime Authority

ABIogenesis preserves this fixed separation:

| Subject | Role | Source of truth | Runtime lifecycle |
|---|---|---|---|
| GTL Program and GraphFunction definitions | executable meaning | exact published GTL | none; immutable Product definitions |
| GraphFunction catalog | verified readiness boundary plus HoG discovery, lookup, dynamic refresh, and optimization tool | deterministic validation/index over one exact workspace binding, resolved lock, installed/verified Product set, and supplied GTL publications | none; discardable and reconstructible |
| catalog view and declaration application | pure narrowing and deterministic Product construction | catalog snapshot plus exact immutable inputs | none; neither authors runtime truth nor emits a runtime event |
| HoG execution selection | traversal, fibre, and plan selection | exact GTL definition plus catalog query | the owning invocation records the selected basis |
| ABG events | execution, observation, evidence, and workspace-transformation history | typed owner admission | durable causal runtime truth |
| Event Calculus and replay | execution currentness and explanation of workspace change | fold and projection over ABG events | derived; they do not author definitions or tool state |

Only execution, observation, evidence, and workspace-transformation facts enter
ABG runtime authority. A definition, dictionary, index, registry, cache, view,
or deterministic construction does not acquire an event lifecycle because
execution consumes it. Every workspace mutation must trace through an admitted
effect to its owning invocation and exact GTL definition.

`abg.operation.catalog.admit` remains the single public readiness operation. It
validates the exact workspace binding, resolved lock, installed artifacts,
verified descriptors and contribution manifests, dependency edges,
compatibility, provenance, and supplied GTL publications before returning one
immutable catalog snapshot and a typed disposition for every submitted row.
Here `admitted` means validated for that exact construction basis; it does not
create a catalog runtime event, Event Calculus fluent, replay lifecycle, or
persistent registry. A different workspace or basis must be validated again.

### 5.0 Compression Boundary

ABIogenesis 5.0 shall not contain more reachable semantic authorities,
registries, ledgers, stores, runtimes, controllers, or materially equivalent
algorithm realizations than the conserved 4.6 foundation. A new 5.0 path that
duplicates an existing authority is deleted before release. An inherited or
new redundancy that changes admission, identity, currentness, replay, or
fresh-process behavior is a 5.0 correctness defect and cannot be deferred.

After those correctness and authority conditions hold, further contraction of
semantically equivalent pure helpers, internal validator placement, test
harness mechanics, cache implementations, module layout, or other non-
authoritative structure may proceed as a 5.1 realization compression. That
successor compression does not gate delivery of the fixed 5.0 capabilities and
does not authorize a 5.0 compatibility path or rival truth source.

These 15 selected families define the repriced 5.0 product scope. They are
product outcomes, not implementation modules, operation counts, or ticket
counts.

| ID | Product outcome |
|---|---|
| `A5-F01` | **Exact product, install, workspace, and catalog.** A source-blind consumer resolves, verifies, installs, binds, and deterministically builds one exact GraphFunction catalog from the supplied published GTL set with typed conflict and dependency handling. |
| `A5-F02` | **Complete GTL authoring and validation.** Typed TypeScript APIs, raw admission, canonical serialization, whole-program validation, module publication, and malformed-program refusal cover the complete retained language. |
| `A5-F03` | **Complete graph, C, and traversal execution.** HoG traverses every retained graph relation, all seven C constructors, and the complete 4.6 traversal conservation matrix without lowering or feature-specific runners. Every C call preserves its locus, selected fibre, evidence, admitted result, judgment, parent/child relation, C-call conservation basis, and lawful runtime join. |
| `A5-F04` | **Probabilistic result integrity.** Every `F_P` call receives declared instructions and contracts; malformed, incomplete, contradictory, or unattributed output refuses before effect or closure. |
| `A5-F05` | **One public contract authority.** Catalog, SDK, CLI, schemas, capabilities, handlers, and documentation derive from one typed definition surface and agree exactly at release. |
| `A5-F06` | **Thin public SDK and CLI.** Native consumers inspect, validate, publish, invoke, start, read, continue admitted automatic work and inspect truthful blocked handoffs without a public adapter becoming a controller. Native human response/resume is reserved for 5.1. |
| `A5-F07` | **Complete One Surface loop.** The standard system program orders the four distinct semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction`; ABG separately owns intent admission, invocation, evidence admission, and continuation. Fresh evidence refreshes model, gap, next-action, and action-result truth before the next step. |
| `A5-F09` | **Catalog semantics.** Consumers inspect and purely narrow the one reconstructible GraphFunction catalog, apply non-callable declarations deterministically, call only exact published GraphFunctions, and start only exact published programs. |
| `A5-F10` | **Event-sourced runtime truth.** Invocation, result, evidence, consequence, correction, retry, recursive child traversal, yield, human hold, escalation, continuation, typed failure, block, non-admission, closure, workspace transformation, and their runtime projections form one causal ABG episode. One transition authority resolves competing execution pressure; replay, not caller memory, derives the result, next execution state, and explanation of workspace change. |
| `A5-F11` | **Self-conformance.** The exact 5.0 candidate evaluates its own applicable specification, design, contract, realization, proof, qualification, and release obligations without exemption or self-minted assurance. |
| `A5-F13` | **Native independence.** The product works through native SDK/CLI without a marketplace host. Any retained host projection delegates to the same public contract without copied semantics; additional host work and mandatory parity qualification are 5.1 scope. |
| `A5-F14` | **Packed Hello World and live probabilistic proof.** A clean source-blind install executes a minimal deterministic path and one live `F_P` path with typed result, evidence, events, and replay. |
| `A5-F15` | **Exact-candidate qualification.** One content-addressed qualification family preserves distinct `pre_rc_candidate` and `installed_rc` subjects; binds the exact `QualificationLawBasis`, authenticated self-conformance assessment and complete behavioral coverage, prospective RC authorization, exact installed-RC qualification and non-bypassed verdicts. A changed qualifying subject requires a higher RC and its applicable gates; acceptance creates no additional qualification subject. |
| `A5-F16` | **Immutable RC and accepted 5.0 release.** The qualified pre-RC subject authorizes one immutable RC; that exact installed RC is qualified; actual human Product authority accepts or withholds that same unchanged RC. The immutable RC tag, package, manifest, checksums and post-publication install identify the accepted Product. The version-line selector advances to the highest published RC independently of acceptance or consumer adoption; acceptance creates no second cut, final-version rename or replacement package. |
| `A5-F17` | **Specification-driven downstream lifecycle.** A prospectively selected real specification progresses through Intent/Product, Requirements, Design, working application behavior, admitted evidence and targeted revision through only installed public ABIogenesis contracts. The witness preserves original source, selected and excluded obligations, newly discovered obligations and residuals; satisfies every mandatory outcome of the selected contract; and owns no local runtime or controller. S06 owns qualification of this contract class. Full original Data Mapper upper-bound evaluation and any complete downstream application-delivery claim retain their distinct independently owned outcomes. |

`A5-F08`, standalone Consensus free-construction qualification, and
`A5-F12`, replay-grounded whole-run executive oversight, observer and tuner,
retain their stable identities as planned ABIogenesis 5.1 outcomes. They are excluded from required 5.0 realization,
qualification, and release rather than silently weakened or renumbered.
The human-response portions of F03/F06/F07/F10 and their public contracts are
also reserved for 5.1 under [Release Boundaries](#50-and-51-release-boundaries).

No separate atom count, public-operation count, capability count, ticket roster,
or implementation census may add to or subtract from these product outcomes.
Such counts are derived no-silence and conformance projections after product
closure.

## Required Product Scenarios

One exact installed `pre_rc_candidate` must pass the four selected pre-RC
scenarios `ABG5-S01`, `ABG5-S02`, `ABG5-S03`, and `ABG5-S06` and
become eligible to authorize an RC. `ABG5-S07` then preserves the distinct
subjects of the release lifecycle. `ABG5-S04` and `ABG5-S05` retain their identities
as planned 5.1 scenarios and are not 5.0 gates. Every selected scenario uses the
same public product path; no scenario may introduce a feature-specific harness
or alternate authority.

### `ABG5-S01`: Clean Install And Minimal Invocation

Pack the exact candidate, install it in a clean temporary location, verify and
bind the product, admit its catalog, resolve
`program://abiogenesis/conformance/hello-world@5` and
`graph-function://abiogenesis/conformance/hello-world@5`, invoke the function
through the public CLI, and read its typed result and replay without source
imports or private paths.

### `ABG5-S02`: Complete GTL And Live F_P

Author, serialize, admit, validate, publish, and execute representative nested
forms of the complete graph and C algebra through HoG. Execute one live `F_P`
boundary. Exercise the compute-fibre and structural-form rows of the 4.6
traversal conservation contract, including shape-preserving fibre substitution
and a transparent child traversal. Prove malformed GTL and malformed
probabilistic output refuse before effect, event admission, foldback, or
closure.

### `ABG5-S03`: One Surface, Local Correction And Truthful Blocking

Admit one public invocation and prove that the GTL program orders
`synthesizeModel -> evalGap -> evaluateNext -> intent admission -> invoke or
continue -> evidence admission -> evaluateAction`. After admitted evidence it
must refresh model, gap, lawful next action, and action-result truth. Observe a
truthful stop, hold, or gap and inspect the replay-derived frontier. Prove one
lawful bounded correction under established specification and authority, with
automatic progression, evidence refresh and preserved unaffected work, reaching
the declared completion condition. Also
prove that absence of a lawful next step produces a typed block and
human-readable handoff, without fabricated completion. Native human
response/resume and whole-run executive intervention are not S03 gates. The
SDK, CLI, fixture and worker do not select or order the loop. Exercise the
retained 5.0 portions of the consequence routes and runtime dispositions,
including local graph-span re-entry, and explicitly account for deferred
portions in the conservation matrix under
[Release Boundaries](#50-and-51-release-boundaries).

### `ABG5-S04`: Planned 5.1 Reflection And Tuning

This scenario is reserved for ABIogenesis 5.1. Its scope includes whole-run
executive Consequence over replay truth, bounded recursive investigation and
parent re-evaluation, plus observer/tuner drafts, attribution, ratification,
rejection and replay. Negative proof includes rejecting authority expansion
from visibility or a child result alone. Its frozen design is non-operative
input requiring reconciliation with the release boundaries before realization.

ABIogenesis 5.0 self-conformance remains mandatory under `A5-F11` and the
qualification family. Deferring this scenario does not defer, weaken, or merge
self-conformance.

### `ABG5-S05`: Consensus Free Construction

This dedicated scenario is reserved for 5.1. Preserved code or a cheap smoke
result supplies no claim of complete Consensus qualification.

Invoke the packed candidate's SYSTEM-owned Consensus GraphFunction through the
ordinary catalog and CLI path over one real ticket and at least two differently
attributed reviewer profiles. Prove agreement closure, dispute recursion, and
round-limit or unresolved-dispute typed block/handoff to `F_H` in existing, alternate, and
temporary workspace applications. Every result and continuation must be typed
and replay-derived, with no shell-owned orchestration or ticket mutation.
Native response admission and resumption after that handoff are 5.1 proof.

### `ABG5-S06`: Native And Downstream Portability

Complete one public-contract invocation through the native SDK and CLI without
a marketplace host. Codex/native parity is a reserved 5.1 qualification claim;
any retained adapter still owns no copied runtime behavior.

An independent downstream catalog supplies a real specification-driven
lifecycle witness of the contract class required by odd_glc. The complete
original user-authored specification and the prospectively selected witness
contract are bound by exact source identity and content under
[Release Boundaries](#50-and-51-release-boundaries). Declared GTL progression
carries the selected contract through Intent/Product,
Requirements, Design, working application behavior, admitted executable and
semantic evidence, and one consequential targeted revision. Publication,
declaration application and GraphFunction invocation use only installed public
ABIogenesis contracts, without source-tree or private-runtime knowledge.

Each stage preserves source and predecessor identities, all applicable
obligations, newly discovered obligations, evidence roles and explicit
residuals. Admitted semantic assessments establish meaning and adequacy under
their declared authority; total deterministic checks establish identity,
role compatibility, freshness, coverage and closure eligibility over those
admitted inputs. Reserved owner rulings retain their authority. Code and
tests agreeing on a weaker contract leave the stronger obligation open.

A failed verification or changed requirement creates replay-visible pressure
and invalidates affected evidence. Re-entry uses a declared stage within the
admitted traversal; entry outside that scope requires F_H authority, not an
autonomous upstream executive route. Native human response/resume is not a
prerequisite for this witness.
Targeted repair and persisted continuation preserve unaffected work and
remaining obligations. A bounded first behavior and its correction prove only
their exercised relation. Full witness acceptance requires every mandatory
selected application outcome, applicable independent semantic assessment and
admitted executable evidence; residual listing or construction/test counts
alone cannot satisfy it. This complete selected witness is an S06 pre-RC gate.
Full original Data Mapper evaluation remains independently owned by T-043.
It may legitimately terminate without completing the application under
[Release Boundaries](#50-and-51-release-boundaries). Unmet original outcomes and
any separate complete-application claim remain explicit. That evaluation and
downstream Product publication/maturation remain independent of ABIogenesis
qualification and release. Selected-witness acceptance does not close those
claims or erase newly discovered obligations.

### `ABG5-S07`: Exact Qualification And Release

Qualify one exact `pre_rc_candidate` basis through the sole qualification
reducer and use its green verdict to authorize one prospective immutable RC.
Materialize the RC and its output-only snapshot without rebuilding. Fresh-
install and qualify that exact RC as the distinct `installed_rc` subject.
Actual human Product authority accepts or withholds that same unchanged RC
after its required qualification and reviews. Acceptance and subsequent
evidence are addenda outside the immutable Product and release-claim bytes;
they create no second cut. Finally, fresh-install that released Product and
verify its identity, lineage, package, manifest, checksums and release records.
The post-publication install is a terminal read-model addendum; it cannot
retroactively authorize an earlier subject. Any change to qualifying Product
or release-claim bytes requires a higher RC and the applicable gates.

The assigned Project Release Namespace is `abiogenesis`. This one-project
source uses the selected STDO unqualified release profile: immutable annotated
`v5.0.0-rc.<n>` cuts and mutable `v5.0.0` latest-RC selector, with Project
Subtree `.` at the owning repository root. The assignment is prospective;
publication revalidates the exact namespace, profile, ordinal and local/remote
ref identities. Existing Product identity and historical cuts remain intact.
Publication advances the selector to the greatest published RC ordinal;
acceptance and consumer adoption neither create nor move it.

## Root Product Outcome

The continuous delivery governor is one stable root binding, not a choice among
nearby paths.

| Binding field | Exact value |
|---|---|
| binding identity | `ABI5-ROOT-001` |
| governor identity | `abg5.root.s01.hello_world@5` |
| product boundary | one exact packed ABIogenesis `pre_rc_candidate`, including its destination-owned all-`F_D` conformance module |
| scenario | `ABG5-S01` |
| runnable form | clean source-blind installation on the trusted developer desktop through the installed native `abg.cli` |
| module | `module://abiogenesis/conformance/hello-world@5` |
| program binding | `program://abiogenesis/conformance/hello-world@5`, containing one all-`F_D` traversal and exactly one callable membership |
| entry | `graph-function://abiogenesis/conformance/hello-world@5` |
| input contract | `contract://abiogenesis/conformance/hello-input@5` |
| output contract | `contract://abiogenesis/conformance/hello-output@5` |
| expected outcome | one admitted terminal Hello World result plus one causally complete replay projection |
| nearest weaker excluded property | package, schema, symbol, catalog row, component test, event co-presence, or fixture-authored result without the complete installed causal path |

The supported public path is:

```text
pack exact pre_rc_candidate with conformance module
  -> clean source-blind install
  -> verify and bind product
  -> admit catalog and narrow the view
  -> resolve program://abiogenesis/conformance/hello-world@5
  -> resolve graph-function://abiogenesis/conformance/hello-world@5
  -> materialize and validate its GTL graph
  -> invoke it through installed abg.cli
  -> HoG traverses the admitted GTL directly
  -> the declared deterministic Hello World implementation executes
  -> ABG admits the invocation, C-call, evidence, result, judgment, and close
  -> replay derives the same terminal result and closed state
  -> abg.cli returns the typed contract://abiogenesis/conformance/hello-output@5 result
```

The root obligation graph is finite and acyclic:

| Obligation | Depends on | Remaining rank after satisfaction |
|---|---|---:|
| `R1 exact artifacts verified` | none | 9 |
| `R2 clean install complete` | `R1` | 8 |
| `R3 workspace bound to exact product set` | `R2` | 7 |
| `R4 catalog admitted and narrowed` | `R3` | 6 |
| `R5 exact target program selected and admitted` | `R4` | 5 |
| `R6 exact GraphFunction and contracts resolved` | `R5` | 4 |
| `R7 materialized GTL graph validated` | `R6` | 3 |
| `R8 HoG execution entered through public invocation` | `R7` | 2 |
| `R9 ABG admitted causal result and closure events` | `R8` | 1 |
| `R10 replay and CLI agree on typed terminal outcome` | `R9` | 0 |

The terminal predicate is true only when all ten obligations are satisfied on
the same binding and replay derives the admitted result and closed state twice
identically. A transport error, typed continuation, hold, gap, block,
non-admission, missing event, source import, private path, wrong contract, or
fixture-authored result leaves the root red. Continuation is product behavior
proved by `ABG5-S03`; it is not accepted as the sunny root outcome.

Changing the product boundary, scenario, entry, contracts, runnable form,
outcome, terminal predicate, obligation graph, or governor identity requires
lawful product/goal re-entry and an F_H disposition. A ticket or subwave cannot
choose a weaker root.

Root green is required throughout delivery but is not complete product or
release closure. The remaining scenarios, negative boundaries, conformance,
qualification, and release gates remain independently required.

## Explicit Non-Features

ABIogenesis 5.0 does not include:

- native human response admission or response-driven same-run resumption;
- whole-run semantic executive oversight or autonomous upstream/out-of-traversal
  A.0 routing, as distinct from retained local recursion and correction;
- standalone Consensus qualification or mandatory host-adapter parity;
- full original Data Mapper completion as an ABIogenesis release prerequisite;
- a new GTL source language, parser, compiler pipeline, bytecode, or executable
  intermediate representation;
- a reference-frame subsystem, alternate evaluator, or second realization
  path distinct from the joined Product function;
- a generated HoG program, compiled execution plan, or runtime-program catalog
  distinct from admitted GTL;
- hidden default programs, selectors, stages, instructions, or topology;
- controller authority in an SDK, CLI, installer, fixture, worker, plugin,
  Consensus, or One Surface surface;
- a second event stream, result ledger, retry loop, continuation model, or
  closure authority;
- a recursive-LLM-specific runtime or compute regime;
- self-hosting or ABIogenesis-builds-ABIogenesis as a 5.0 release gate;
- publication or maturation of odd_glc or another GLC Product as a 5.0 build
  or release dependency;
- automatic ticket mutation, automatic wake, or an ABG-owned scheduler;
- hosted registry, marketplace, billing, IAM, RBAC, multi-user service, or
  distributed orchestration;
- hostile-workstation resistance, publisher authenticity, remote attestation,
  or signing on the trusted-desktop boundary; or
- installed-product update, disable, unbind, uninstall, revocation, retirement,
  or supersession lifecycle beyond exact initial installation and binding.

Installed stable 5.0 may become the development product for 5.0.1. Self-use and
downstream Product maturation begin there and cannot retroactively qualify
5.0. The required F17/S06 lifecycle witness qualifies the installed 5.0
candidate before RC authorization.

## Governance And Release Boundary

There is one lawful STDO identity. ABIogenesis 5.0 development is governed by
the immutable installed release selected by
[`stdo_abiogenesis.json`](../stdo_abiogenesis.json),
`constitution.stdo.basis`. That Definition is the sole exact method selection;
its composition selects the release-matched Development Products. The direct
Product-owner ruling selects the complete published cohort recorded in the
linked adoption evidence for resumed work. Its exact identity is owned by the
Definition, not independently selected by this document.
Self-conformance, qualification, and release must bind that same exact basis.
Another STDO version cannot substitute without lawful Product re-entry and an
F_H disposition. Mutable methodology source and candidate work are authoring
inputs for a future release, not operative ABIogenesis law.

Source development consumes the exact Axiom Indexer and STDO Representation
companions selected by the Definition's composition and verified against the
same release-matched cohort. Older companion installs and their maps are
historical evidence only, not current development routes. A source-linked
`a_c` map may route attention only when its represented cut and selected source
bytes verify fresh through those released tools. A map or native skill does not
by its existence become ABI behavior, constitutional authority, GTL, an ABG
event, runtime truth or qualification evidence. The
[STDO-Governed Run Environment](#stdo-governed-run-environment) explicitly declares
runtime consumption of those released Products; their installation for source
development does not supply that Run binding.

For the exact T-287 increment selected by Goals, Product adopts the optional
STDO Reference Frame Baseline through the Project-owned
`repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#abiogenesis-project-reference-frame-basis`.
That basis governs only the named T-287 activation. It adds one local
mutable-worksite-causality evaluation frame, imports the existing ABI frame
atlas, and grants no implementation, mutation, admission, or release
authority.

Source development applies the released STDO 2.5 disciplines:

- one product definition rather than competing target surfaces;
- one immutable 4.6 origin baseline with semantic successor conservation;
- one executable root outcome throughout delivery;
- transactional replacement and retirement at hard breaks;
- proportional proof ordered by the declared trusted-desktop risk model;
- distinct authority, evidence, and projection bases; and
- direct or lawfully proxied F_H closure.

The selected method owns direct Writer entry when sufficient, coordination and
independent review by applicability, explicit Executive-to-Writer mutation
separation, valid evidence and ruling reuse, condition-based closure, and
steel-thread evidence ordering. The local frame basis instantiates those
rules; it is not a competing local candidate method. Release applicability is
owned by this Product; method adoption supplies no feature or implementation
acceptance. Exact historical evidence retains its original scope and identity.

Product-definition closure does not accept the current implementation, approve
a migration, or claim release readiness. It fixes the destination against which
those later decisions are made.

## Product Completion Predicate

ABIogenesis 5.0 is complete only when one exact acyclic release lineage
satisfies all of the following:

1. Every semantic claim, repair, and explicit exclusion in the exact 4.6 origin
   baseline has a terminal `conserved`, `superseded`,
   `intentionally_removed`, or `not_applicable` disposition with behavioral
   evidence.
2. GTL programs are authored as TypeScript values and validated without
   translation into a rival source language or executable program.
3. One small HoG algebra and Effect fold directly evaluate every retained graph
   relation and C constructor through exact owner ports; no superseded
   imperative coordinator or prototype wrapper remains reachable.
4. Every row of the 4.6 traversal conservation contract has explicit release
   applicability. Its retained 5.0 behavior has a declared expression, installed
   execution witness, replay evidence, public outcome and real mutation-negative
   proof. Reserved portions have the scoped disposition and truthful boundary
   evidence defined in [Conservation Proof](#conservation-proof), not a pass
   for unimplemented 5.1 behavior.
5. `F_D`, `F_P`, and `F_H` obey their declared type and authority boundaries.
6. The catalog publishes exact programs, callable GraphFunctions, contracts,
   implementations, compatibility, versions, and provenance.
7. The SDK and CLI are thin projections over that catalog and ABG runtime.
8. One ABG path owns admission, events, replay, correction, continuation, and
   closure around HoG traversal.
9. All 15 selected 5.0 feature families are realized. `ABG5-S01`,
   `ABG5-S02`, `ABG5-S03`, and `ABG5-S06` pass on one exact
   installed `pre_rc_candidate`; `ABG5-S07` preserves the distinct pre-RC, RC,
   installed-RC, same-RC acceptance and post-publication evidence boundaries
   while using the same product contracts. `A5-F08`/`ABG5-S05`, `A5-F12`/`ABG5-S04`
   and the host and human-response portions named in [Release Boundaries](#50-and-51-release-boundaries)
   remain excluded planned 5.1 work.
10. Malformed GTL, malformed probabilistic output, invalid authority, basis
   conflict, and rival-path mutations fail at their owning boundaries before
   prohibited effects.
11. No rival compiler, executable program representation, controller, registry,
    event stream, or closure path remains public or reachable.
12. Every qualification subject passes self-conformance and its owning gates
    under the exact selected and installed STDO basis in the Product Definition
    with no mixed subject or substituted property.
13. The published RC's Product and release-claim bytes remain immutable.
    Any change requires a higher RC with its applicable qualification gates;
    acceptance and evidence addenda cannot amend or retroauthorize the cut.
14. Actual human Product authority accepts the exact qualified, unchanged
    installed RC, and that Product passes a fresh source-blind post-publication
    installation. No second final cut, retag or package-version rename occurs;
    `v5.0.0` remains the publication-driven latest-RC selector.

Component tests, type checks, schema counts, operation counts, published names,
event co-presence, generated manifests, or a feature-specific installed fixture
cannot substitute for this predicate.
