# ABIogenesis 5.0 - Product

**Product ID**: PROD-001
**Version target**: 5.0.0
**Updated**: 2026-07-20
**Status**: Active - accepted by T-283 F_H closure
**Derives from**: INT-001 through INT-007
**Change authority**: T-283 `intent_reprice`
**Acceptance receipt**:
`.ai-workspace/comments/codex/20260720T021524Z_DECISION_fh_accept_t283_and_authorize_m2.md`

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

It is an LLM-first programming system in which:

1. developers and LLMs author exhaustive typed graph programs in
   `GTL.TypeScript`;
2. TypeScript and one GTL validator check local types, raw declarations, and
   whole-program semantic relations;
3. modules publish GTL programs, callable `GraphFunction` values, contracts,
   and implementation bindings into one admitted catalog;
4. the HoG executor traverses the admitted GTL program directly;
5. declared `F_D`, `F_P`, and `F_H` boundaries perform deterministic,
   probabilistic, and human work without exchanging authority;
6. ABG admits runtime facts and owns events, replay, lineage, continuation,
   correction, and closure; and
7. a thin SDK and CLI let a user inspect the catalog, call a published
   `GraphFunction`, start a published program, observe its state, respond to a
   human boundary, and continue the same run.

The product can be compressed to this path:

```text
GTL.TypeScript source
  -> TypeScript checking
  -> GTL validation
  -> module and catalog admission
  -> program start or GraphFunction call
  -> HoG traversal of the original admitted GTL value
  -> F_D | F_P | F_H implementation boundary
  -> ABG event admission and replay
  -> typed result | continuation | hold | gap | block
```

ABIogenesis 5.0 does not invent a second source language. It does not compile
GTL into a second executable program language or intermediate representation.

This is an explicit supersession of one 4.6 mechanism, not a reinterpretation
of 4.6 history. The 4.6 semantic compiler performed validation and diagnostics,
then lowered admitted C declarations into a normalized HoG program declaration
and compiled execution-declaration handoff. 5.0 conserves its type checking,
normalization, diagnostics, repair relations, pre-effect refusal, and complete
handoff obligations while retiring the lowered declaration as executable
program authority. The active 5.0 product term is **GTL validator** because HoG
traverses the admitted GTL value directly.

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

## 4.6 Traversal Conservation Contract

The 4.6 product did not define traversal as one flat list of commands. It
defined several orthogonal dimensions that may be combined. 5.0 must preserve
those dimensions rather than collapse them into one enum, one runner branch, or
one preferred happy path.

This section names the behavioral baseline. It does not require reuse of a 4.6
class, file, command spelling, or state machine.

### Compute Fibre

Every traversal stage selects one declared compute fibre:

| Fibre | Preserved behavior |
|---|---|
| `F_D` | Total deterministic work or evaluation executes with deterministic evidence and no probabilistic or human substitution. |
| `F_P` | Bounded probabilistic work executes through an admitted worker boundary and returns candidate output for admission. |
| `F_H` | Human work becomes a typed external hold or callout and resumes only after attributed response admission. |
| mixed | One program may compose all three fibres while preserving each stage's type, evidence, authority, and replay identity. |

Fibre substitution is shape-preserving. Replacing a declared `F_P` stage with
an equivalent `F_D` stage changes the selected interior and evidence class, not
the graph topology, C-call locus, event-spine shape, or continuation law. An
all-`F_D` program degenerates to a conventional workflow. An all-`F_H` program
degenerates to a human process. Both remain ordinary GTL traversals.

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

4.6 published nine allowed consequence traversal families. 5.0 preserves their
semantics as declared GTL and ABG behavior, not as nine special HoG runners.

| 4.6 family | 5.0 conserved meaning |
|---|---|
| `same_edge_retry` | Retry or repair the current declared call or edge under bounded attempt and evidence law. |
| `depth_traversal` | Enter a declared deeper GraphFunction, refinement, or zoom boundary and preserve parent/child identity and foldback. |
| `graph_span_reentry` | Re-enter an admitted graph span or vector target without fabricating closure for skipped work. |
| `public_start_reentry` | Start or continue a published program or GraphFunction through the public admission path. |
| `ticket_traversal` | Invoke product-declared ticket work through an owning GraphFunction or program; ABG does not own ticket storage or meaning. |
| `fh_input_required` | Stop at a typed human-input boundary and resume the same traversal after lawful response admission. |
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

5.0 may use different typed SDK and CLI spellings. It must preserve these
behaviors through program start, GraphFunction invocation, catalog resolution,
typed stop conditions, and policy. A published asset remains non-callable; its
owning program or GraphFunction is the executable target. Control mode remains
policy around traversal and never becomes another traversal controller.

### Conservation Proof

Before 5.0 can close, its exact installed candidate must provide a traversal
conservation matrix with one row for every compute fibre, structural form,
consequence route, runtime disposition, and public start/control behavior above.
The frozen no-silence inventory is:

| Axis | Required rows |
|---|---:|
| compute fibre | 4 |
| structural form | 8 |
| consequence route | 9 |
| runtime disposition | 13 |
| public start/control behavior | 6 |
| total | 40 |

The counts are proof inventory, not engine ontology. Adding, removing, merging,
or weakening a row requires product re-entry; implementation refactoring does
not. Shape-preserving fibre substitution is a separate mandatory differential
over the same rows.

Each row records:

```text
4.6 behavior identity and witness
5.0 declared GTL expression
5.0 HoG execution path
5.0 ABG event and replay evidence
publicly observable result or continuation
mutation that proves the nearest invalid substitute refuses
```

Equivalent successor behavior is sufficient; patch or carrier identity is not.
An unresolved row blocks the affected 5.0 feature and release claim. This matrix
is part of product proof, not the later classification of the current `X`
implementation.

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
  -> replay the current state
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
respond to a pending F_H boundary
continue the same admitted run
run conformance and installed-product proof
```

The public surface derives from one typed contract and catalog authority. Exact
operation names, schemas, and capability projections are frozen for the release,
but their count does not define the engine or create separate semantic owners.

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
continue the program; they do not implement its loop. A typed `F_H` hold and
response continue the same admitted run.

### Consensus

Consensus is a bounded standard-library GraphFunction expressed through
ordinary GTL composition. It demonstrates attributed parallel work, fan-out,
fan-in, disagreement, bounded retry or recursion, mechanical validation,
probabilistic evaluation, human escalation, typed results, and replay.

Consensus has no special runner, scheduler, CLI command, event family, ticket
mutation authority, or closure path.

### Observer And Tuner

The observer and tuner read ABG replay truth and produce attributed diagnostic
or change proposals. Their outputs remain drafts. Ratification or rejection
crosses the ordinary policy or `F_H` boundary; neither capability mutates
specification, configuration, or tickets directly.

### Recursive Programs

Recursive LLM work is an ordinary application of GTL recursion, child
GraphFunction calls, HoG child frames, admitted result foldback, parent
re-evaluation, and ABG continuation. It is not a separate runtime, controller,
or product feature family.

## Complete 5.0 Feature Set

These 17 families preserve the original 5.0 product scope. They are product
outcomes, not implementation modules, operation counts, or ticket counts.

| ID | Product outcome |
|---|---|
| `A5-F01` | **Exact product, install, workspace, and catalog.** A source-blind consumer resolves, verifies, installs, binds, and opens one exact product set and admitted catalog with typed conflict and dependency handling. |
| `A5-F02` | **Complete GTL authoring and validation.** Typed TypeScript APIs, raw admission, canonical serialization, whole-program validation, module publication, and malformed-program refusal cover the complete retained language. |
| `A5-F03` | **Complete graph, C, and traversal execution.** HoG traverses every retained graph relation, all seven C constructors, and the complete 4.6 traversal conservation matrix without lowering or feature-specific runners. Every C call preserves its locus, selected fibre, evidence, admitted result, judgment, parent/child relation, C-call conservation basis, and lawful runtime join. |
| `A5-F04` | **Probabilistic result integrity.** Every `F_P` call receives declared instructions and contracts; malformed, incomplete, contradictory, or unattributed output refuses before effect or closure. |
| `A5-F05` | **One public contract authority.** Catalog, SDK, CLI, schemas, capabilities, handlers, and documentation derive from one typed definition surface and agree exactly at release. |
| `A5-F06` | **Thin public SDK and CLI.** Native consumers inspect, validate, publish, invoke, start, read, respond, and continue without a public adapter becoming a controller. |
| `A5-F07` | **Complete One Surface loop.** The standard system program orders the four distinct semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction`; ABG separately owns intent admission, invocation, evidence admission, and continuation. Fresh evidence refreshes model, gap, next-action, and action-result truth before the next step. |
| `A5-F08` | **Consensus free construction.** HoG traverses the bounded Consensus GraphFunction through ordinary public GTL composition, while ABG admits its runtime facts through ordinary ABG atoms; no special engine path exists. |
| `A5-F09` | **Catalog semantics.** Consumers inspect and narrow catalog views, apply non-callable declarations, call only admitted GraphFunctions, and start only admitted programs. |
| `A5-F10` | **Event-sourced runtime truth.** Invocation, result, evidence, consequence, correction, retry, repair, recursive child traversal, re-entry, yield, human hold, escalation, continuation, typed failure, block, non-admission, closure, and every public projection form one causal ABG episode. One transition authority resolves competing pressure; replay, not caller memory, derives the result and next state. |
| `A5-F11` | **Self-conformance.** The exact 5.0 candidate evaluates its own applicable specification, design, contract, realization, proof, qualification, and release obligations without exemption or self-minted assurance. |
| `A5-F12` | **Replay-grounded observer and tuner.** Observation and tuning operate over admitted replay truth, preserve attribution, and cannot mutate authority without ratification. |
| `A5-F13` | **Native and bounded host projection.** The product works without a marketplace host; one Codex projection may delegate to the same public contract without copied semantics. |
| `A5-F14` | **Packed Hello World and live probabilistic proof.** A clean source-blind install executes a minimal deterministic path and one live `F_P` path with typed result, evidence, events, and replay. |
| `A5-F15` | **Exact-candidate qualification.** One content-addressed qualification family preserves distinct `pre_rc_candidate`, `installed_rc`, and `final_tap_candidate` subjects; binds the exact `QualificationLawBasis`, ordered owning-gate vector, prospective RC authorization, installed-RC authorization, typed `FinalTapDelta`, affected-gate reruns, and non-bypassed verdicts. |
| `A5-F16` | **Immutable RC and stable 5.0 release.** The qualified pre-RC subject authorizes one immutable RC; that exact installed RC is qualified; one governed final-only delta produces and qualifies the final-tap subject; the stable tag, package, manifest, checksums, and post-publication install identify the admitted final cut. |
| `A5-F17` | **Downstream portability sufficient for odd_glc.** A bounded independent flavored catalog fixture exercises the same contract class required by real odd_glc: it authors, publishes, applies, and invokes GTL through only installed public ABIogenesis contracts and owns no local runtime or controller. odd_glc release remains independent and does not gate 5.0. |

No separate atom count, public-operation count, capability count, ticket roster,
or implementation census may add to or subtract from these product outcomes.
Such counts are derived no-silence and conformance projections after product
closure.

## Required Product Scenarios

One exact installed `pre_rc_candidate` must pass `ABG5-S01` through `ABG5-S06`
and become eligible to authorize an RC. `ABG5-S07` then preserves the distinct
subjects of the release lifecycle. Every scenario uses the same public product
path; no scenario may introduce a feature-specific harness or alternate
authority.

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

### `ABG5-S03`: One Surface And Human Continuation

Admit one public invocation and prove that the GTL program orders
`synthesizeModel -> evalGap -> evaluateNext -> intent admission -> invoke or
continue -> evidence admission -> evaluateAction`. After admitted evidence it
must refresh model, gap, lawful next action, and action-result truth. Observe a
truthful stop, hold, or gap; inspect the replay-derived frontier; remove one
ambiguity through an agent edit or typed `F_H` act; and resume or start again to
convergence. The SDK, CLI, fixture, and worker must not select or order the
loop. Exercise every retained consequence route and runtime disposition,
including retry, depth traversal, graph-span re-entry, public re-entry, ticket
work, reprice, yield, gap/block, and non-admission.

### `ABG5-S04`: Reflection And Self-Conformance

Bind the exact `pre_rc_candidate` to its content-addressed qualification basis,
complete frozen inventory, and matching `QualificationLawBasis`. Run real-tree
and seeded-negative self-conformance through the owning qualification family.
Run the observer and tuner over replay truth and prove truthful halt, grounded
drafts, attribution, ratification, rejection, replay, and one injected negative
without product exemption or silent authority mutation.

### `ABG5-S05`: Consensus Free Construction

Invoke the packed candidate's SYSTEM-owned Consensus GraphFunction through the
ordinary catalog and CLI path over one real ticket and at least two differently
attributed reviewer profiles. Prove agreement closure, dispute recursion, and
round-limit or unresolved-dispute `F_H` escalation in existing, alternate, and
temporary workspace applications. Every result and continuation must be typed
and replay-derived, with no shell-owned orchestration or ticket mutation.

### `ABG5-S06`: Native And Downstream Portability

Complete one public-contract invocation through the native SDK and CLI without
a marketplace host, then complete the equivalent invocation through one
bounded Codex CLI or skill projection. Prove the adapter owns no copied runtime
behavior. Install one independent flavored catalog fixture sufficient for the
real odd_glc contract class and publish, apply, and invoke its GraphFunction
without source-tree or private-runtime knowledge.

### `ABG5-S07`: Exact Qualification And Release

Qualify one exact `pre_rc_candidate` basis through the sole qualification
reducer and use its green verdict to authorize one prospective immutable RC.
Materialize the RC and its output-only snapshot without rebuilding. Fresh-
install and qualify that exact RC as the distinct `installed_rc` subject. Bind
one exact `final_tap_candidate` to the installed-RC verdict and typed
`FinalTapDelta`, rerun every affected gate, and admit the final verdict before
cutting stable `5.0.0`. Finally, fresh-install the released Product and verify
its identity, lineage, package, manifest, checksums, and release records. The
post-publication install is a terminal read-model addendum; it cannot
retroactively authorize an earlier subject.

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

- a new GTL source language, parser, compiler pipeline, bytecode, or executable
  intermediate representation;
- a generated HoG program, compiled execution plan, or runtime-program catalog
  distinct from admitted GTL;
- hidden default programs, selectors, stages, instructions, or topology;
- controller authority in an SDK, CLI, installer, fixture, worker, plugin,
  Consensus, or One Surface surface;
- a second event stream, result ledger, retry loop, continuation model, or
  closure authority;
- a recursive-LLM-specific runtime or compute regime;
- self-hosting or ABIogenesis-builds-ABIogenesis as a 5.0 release gate;
- odd_glc or another GLC product as a 5.0 build or release dependency;
- automatic ticket mutation, automatic wake, or an ABG-owned scheduler;
- hosted registry, marketplace, billing, IAM, RBAC, multi-user service, or
  distributed orchestration;
- hostile-workstation resistance, publisher authenticity, remote attestation,
  or signing on the trusted-desktop boundary; or
- installed-product update, disable, unbind, uninstall, revocation, retirement,
  or supersession lifecycle beyond exact initial installation and binding.

Installed stable 5.0 may become the development product for 5.0.1. Self-use and
deeper GLC dogfooding begin there and cannot retroactively qualify 5.0.

## Governance And Release Boundary

There is one lawful STDO identity. ABIogenesis 5.0 self-conformance,
qualification, and release must bind the exact tapped and installed STDO
version `2.0.0` as their constitutional basis. Another STDO version cannot
substitute for that basis without lawful Product re-entry and an F_H
disposition. The current 2.0 amendment candidate is not an installed method
release and cannot be represented as one before its own qualification and tap.

This definition applies the intended STDO version 2.0 disciplines without
turning them into product features:

- one product definition rather than competing target surfaces;
- one immutable 4.6 origin baseline with semantic successor conservation;
- one executable root outcome throughout delivery;
- transactional replacement and retirement at hard breaks;
- proportional proof ordered by the declared trusted-desktop risk model;
- distinct authority, evidence, and projection bases; and
- direct or lawfully proxied F_H closure.

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
3. HoG directly traverses every retained graph relation and C constructor.
4. Every row of the 4.6 traversal conservation contract has a 5.0 declared
   expression, installed execution witness, replay evidence, public outcome,
   and real mutation-negative proof.
5. `F_D`, `F_P`, and `F_H` obey their declared type and authority boundaries.
6. The catalog publishes exact programs, callable GraphFunctions, contracts,
   implementations, compatibility, versions, and provenance.
7. The SDK and CLI are thin projections over that catalog and ABG runtime.
8. One ABG path owns admission, events, replay, correction, continuation, and
   closure around HoG traversal.
9. All 17 feature families are realized. `ABG5-S01` through `ABG5-S06` pass on
   one exact installed `pre_rc_candidate`; `ABG5-S07` preserves the distinct
   pre-RC, RC, installed-RC, final-tap, released-Product, and post-publication
   install subjects while using the same product contracts.
10. Malformed GTL, malformed probabilistic output, invalid authority, basis
   conflict, and rival-path mutations fail at their owning boundaries before
   prohibited effects.
11. No rival compiler, executable program representation, controller, registry,
    event stream, or closure path remains public or reachable.
12. Every qualification subject passes self-conformance and its owning gates
    under the exact tapped and installed STDO `2.0.0` basis with no mixed
    subject or substituted property.
13. Any delta between immutable RC and final-tap candidate is limited to the
    admitted `FinalTapDelta`; every affected gate is rerun before final
    authorization.
14. The final qualified cut is the stable `5.0.0` Git and package product and
    passes a fresh source-blind post-publication installation.

Component tests, type checks, schema counts, operation counts, published names,
event co-presence, generated manifests, or a feature-specific installed fixture
cannot substitute for this predicate.
