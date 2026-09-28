# REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL - GTL Language Capability Model

**Status**: Active - accepted by T-283 F_H closure
**Category**: Capability / Vocabulary / Constraint
**Date**: 2026-06-30
**Derives from**: `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-CONTRACT-LAW-API`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-PROJECTION`, `REQ-R-ABG3-FN-COMPOSITION`
**Wave**: GOAL-019

---

## Purpose

Define the GTL language capability model: the complete language-level set of
things GTL can declare, constrain, publish, compose, validate, and expose for
direct HoG traversal and ABG runtime admission.

This family is the language-agnostic WHAT surface. It gives HOW design enough
signal to bind the language to concrete carriers, modules, APIs, events,
tests, and proof artifacts without letting implementation choices redefine
the language.

Catalog, registry, ledger, library, inventory, projection, overlay, and
selection terms are subordinate vocabulary inside this model. They clarify how
GTL capability surfaces relate to ABG runtime realization; they are not the
main subject.

## Scope

This family defines:

- GTL language capability groups;
- capability ownership and authority boundaries;
- capability publication and validation expectations;
- subordinate vocabulary for catalog, registry, ledger, library, inventory,
  projection, overlay, and selection surfaces;
- the minimum WHAT-to-HOW signal a capability requirement shall provide.

This family does not implement a live runtime lookup registry. Runtime lookup
and traversal-affecting candidate selection are successor ABG design work.

## GTL Language Capability Groups

**declaration syntax**: GTL shall provide a declarative surface for typed
program law. Concrete host syntax is a HOW binding; the language capability is
the declared contract, not a parser shape.

**typed attributes and context**: GTL shall declare inspectable attributes,
schema refs, hook refs, context refs, and authority context needed by graph
programs.

**graph topology**: GTL shall declare graphs, nodes, graph vectors,
interfaces, graph-function boundaries, and stable graph identity.

**graph algebra**: GTL shall declare algebraic graph construction and
composition capability including edge, identity, compose, substitute, recurse,
fan-out, fan-in, gate, promote, and same-object identity.

**graph functions**: GTL shall publish graph functions as reusable workflow
library functions and callable work contracts. A graph function shall expose an
outer interface and shall be materializable or referenceable without becoming a
whole program, graph overlay, workspace shell, or runtime controller.

**reusable node types**: GTL shall publish reusable node-type declarations for
node contract reuse, type refs, composed types, and type-sensitive graph
composition. Node types are language/conformance truth, not runtime work.

**publication and work surfaces**: GTL shall declare modules, jobs, roles,
contract refs, public starts, candidate families, refinement boundaries, and
library membership.

**selection and refinement surfaces**: GTL shall declare candidate and
refinement boundaries without selecting traversal by itself.

**asset and prompt surfaces**: GTL shall declare typed asset surfaces,
constructors, renderers, output contracts, authority slots, proof obligations,
and prompt construction surfaces.

**hook and plugin boundaries**: GTL shall declare hook, plugin, and result
interface boundaries while preserving ABG authority over admission, event
truth, ledgers, fold, transition, and replay.

**compute notation**: GTL shall declare selected compute composition,
including deterministic, probabilistic, and human regimes, without letting
probabilistic or human judgment own closure or runtime selection authority.

**requirement declarations**: GTL shall declare requirement terms, relations,
bundles, traversal spans, lifecycle compositions, and proof-role declarations
as authoring surfaces for ABG requirements algebra.

**program validation**: GTL shall be validated by the non-lowering GTL
validator before runtime admission. The validator shall report typed
conformance, traversal-unit shape, capability coverage, publication inventory,
and proof/readiness issues without producing an executable plan.

**mapping to runtime**: GTL shall provide enough language signal for HoG to
traverse admitted graph programs directly and for ABG to admit, project, and
replay the resulting runtime facts while preserving the GTL/HoG/ABG owner
split.

## Subordinate Vocabulary

**language capability catalog**: A qualified index of GTL language
capabilities and their requirement traces. It is a review and validation aid.
It is not a runtime lookup registry and not traversal selection truth.

**catalog**: A qualified index surface. The word catalog shall not stand alone
as authority. A catalog reference shall state whether it is a language
capability catalog, publication inventory, library index, conformance catalog,
consequence catalog, runtime registry query, or another named catalog family.

**publication inventory**: A static GTL declaration or admission inventory that
proves a module, program, or bundle publishes the surfaces it claims. A
publication inventory may support conformance checks. It is not a live lookup
registry and not traversal selection truth.

**runtime registry**: An ABG-owned admitted lookup concept over registered
runtime-eligible surfaces. A runtime registry may expose query results, but any
candidate choice that affects traversal shall become ABG-emitted selection
truth before it has runtime authority.

**library**: A reusable publication set of declared graph functions, overlays,
candidate families, public starts, policies, or companion surfaces. A graph
function in a library is a reusable workflow function, not the whole product
program. A library may be upstream/system-owned or downstream/product-owned. A
library is not a runtime registry until ABG admits and projects its entries
into registry truth.

**system library**: A GTL/ABG-owned library of generic graph functions and
related surfaces needed identically across multiple ODD domains. System
library entries shall be admitted through GTL/ABG authority and shall not be
reimplemented by downstream products as parallel system truth.

**product library**: A downstream-owned GTL library of specialized graph
functions, overlays, policies, or candidate families. Product library entries
are lawful only when declared through GTL, admitted by ABG, and kept subordinate
to ABG runtime authority.

**ledger**: An ABG-owned truth surface derived from emitted events, admitted
payloads, or replay-derived projection. A ledger shall not mean a product-local
mutable store, controller memory, or second authority over fold, residual,
admission, continuation, re-entry, or selection truth.

**event stream**: The append-only runtime truth path used by ABG to record
admitted runtime facts. Runtime truth that affects traversal, closure,
selection, continuation, or re-entry shall not be replaced by query-local
calculation or product-local memory.

**projection**: A replay-derived view over admitted truth. A projection may
join, render, classify, or summarize admitted facts. A projection shall not
invent runtime truth that was not admitted or emitted by its governing source
surface.

**read model**: A consumer-facing query or interpretation surface over admitted
truth or projections. A read model may label domain meaning. It shall not
admit evidence, emit events, fold assurance, select traversal, close, continue,
or re-enter.

**overlay row**: A GTL or conformance declaration row that declares or indexes
a program composition over graph functions, graph vectors, node types, starts,
roles, security, policy, proof obligations, plugin/result contracts, and
related metadata. An overlay row is not a traversal controller.

**overlay frame**: An ABG runtime observation, pressure, or foldback contract
scoped to admitted runtime state. An overlay frame belongs to ABG runtime law
and is distinct from an overlay row.

**selection event**: ABG-emitted truth recording a traversal-affecting
candidate choice. Selection may be preceded by queries, eligibility filters,
or ranking, but the runtime effect belongs to the emitted selection event.

**candidate family**: A GTL-declared family of graph-function candidates that
share an explicit outer contract. Candidate-family membership does not select
a candidate for traversal.

**public start**: A product-visible entry handle bound to a published graph
function. A public start is not a bare graph vector and does not own runtime
execution truth.

**runtime lookup**: A query over admitted registry truth that returns lawful or
rejected candidates for a named situation. Runtime lookup may inform selection.
It does not become selection authority until ABG emits selection truth.

**eligibility filter**: A deterministic ABG-owned filter over candidate
identity, interface, source and target contracts, context, authority, overlay,
namespace, version, provenance, readiness, proof, and policy constraints.

## Acceptance Criteria

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-001**: GTL shall publish one language
capability model that lets reviewers identify every language-level capability
without reading implementation source or downstream product conventions.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-002**: The language capability model
shall distinguish GTL declaration capability from ABG runtime realization.
GTL may declare, constrain, compose, publish, and validate program law; ABG
owns admission, event truth, runtime ledgers, projection, fold, continuation,
re-entry, and traversal-affecting selection.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-003**: Each GTL capability shall state
purpose, owner, authority boundary, source truth, admitted inputs, emitted
truth if any, projection outputs, query outputs, rejection taxonomy, readiness
gates, proof obligations, invariants, forbidden authority, and downstream
interpretation boundary.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-004**: HOW design shall treat carrier
names, module boundaries, API spellings, event names, data structures, tests,
and proof artifacts as implementation bindings to WHAT. HOW design shall not
change ownership, authority, invariants, or semantic boundaries declared by
WHAT.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-005**: A language capability catalog
shall be a qualified index of GTL capabilities and requirement traces. It
shall not be treated as a runtime registry, runtime lookup result, or
selection event.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-006**: A publication inventory shall
prove declared publication scope only. It shall not be treated as a runtime
registry, runtime lookup result, or selection event.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-007**: A runtime registry shall be an
ABG-owned admitted lookup concept. Runtime registry truth shall be derived from
declared and admitted entries, not from product-local lists, prompt prose,
manual scans, or controller memory.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-008**: A system library shall contain
generic GTL/ABG-owned graph functions or companion surfaces that multiple ODD
domains need identically. Downstream products shall not republish a system
library function as parallel authority.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-009**: A product library shall be
lawful when it declares product-specialized graph functions or companion
surfaces through GTL and ABG admits those entries. Product libraries shall not
bypass declaration, admission, provenance, proof, readiness, or ownership
checks.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-010**: A product library shall not
shadow, replace, or override a system library entry unless explicit
refinement, override, or specialization law is declared and ABG eligibility
proof accepts it.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-011**: A ledger shall be an ABG-owned
event or projection truth surface. A product-local mutable store shall not be
called a ledger when it would compete with ABG admission, event, fold,
residual, continuation, re-entry, registry, or selection truth.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-012**: An event stream shall remain
the append-only truth path for runtime facts. Query-local calculation,
side-array return values, product-local files, or controller memory shall not
replace the event stream for traversal-affecting truth.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-013**: A projection shall be
replay-derived from admitted source truth. A projection shall not create fold,
residual, registry, selection, continuation, or re-entry truth that its source
truth did not admit or emit.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-014**: A read model shall be
read-only. It may interpret or label admitted truth for a consumer, but it
shall not emit events, admit evidence, fold assurance, select traversal, close,
continue, or re-enter.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-015**: An overlay row shall be program
composition, catalog, publication, public-start, graph-function, graph-vector,
node-type, role, security, policy, proof-obligation, plugin/result-contract, or
related metadata. An overlay row shall not own runtime observation, pressure,
foldback, continuation, or selection authority.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-015A**: GTL shall distinguish the
library/program/workspace abstraction boundary. Graph functions are reusable
library functions or callable work contracts. Graph overlays or GTL program
compositions are the program surfaces that bind those functions. Workspaces are
mutable instance surfaces that supply bootstrap config, files, data, observed
state, generated artifacts, and run archives. HoG traversal is the execution
bind over admitted program and workspace truth; ABG admits its runtime facts.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-016**: An overlay frame shall be ABG
runtime contract truth over observed state, pressure, or foldback. An overlay
frame shall not be treated as a GTL publication inventory row or downstream
product controller.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-017**: A candidate family shall
preserve one explicit outer contract across its candidates. Candidate-family
membership shall not select a candidate for traversal.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-018**: A public start shall bind to a
published graph function. A public start shall not expose a bare graph vector
as product-visible runtime authority.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-019**: Runtime lookup shall return
candidates or rejection diagnostics over admitted registry truth. Runtime
lookup shall not become traversal authority. A declared GTL selector or
attributed external decision proposes the selected identity, ABG admits that
identity as runtime truth, and HoG follows the admitted program relation.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-020**: An eligibility filter shall
account for candidate identity, interface, source contracts, target contracts,
context, authority, overlay scope, namespace, version, provenance, readiness,
proof state, and policy refs before a candidate can be selected.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-021**: A selection event shall be
ABG-admitted truth whenever candidate choice affects traversal. `F_D`, `F_P`,
or `F_H` ranking may propose selection only through the declared GTL boundary;
ABG validates and admits the resulting identity and HoG applies it. Neither ABG
nor the proposing implementation owns a hidden selection policy.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-022**: Implementation-specific HOW
accounts, GTL-validator capability maps, and spec-vs-implementation gap
tables shall not be written into this requirement family. They are design or
commentary read models over the live requirement surface.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-023**: A runtime registry design shall
be non-conformant if it is built from static publication inventory alone,
product-local configuration, prompt-only context, manual discovery, or
query-local candidate selection without admitted registry truth.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-024**: Downstream domain semantics such
as software test, build, release, language toolchain, service protocol, or
product lifecycle policy shall not be promoted into GTL/ABG system-library
law. Such semantics belong in downstream product libraries, plugins, or read
models unless proven generic across ODD domains.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-025**: Gap analysis shall classify
differences between WHAT and implementation as terminology gaps,
requirement gaps, design gaps, implementation gaps, proof gaps,
documentation gaps, or deferred runtime-registry gaps. Gap analysis shall not
replace live requirement truth.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-026**: GTL shall provide one reusable
node-type capability for declaring named node contracts, binding nodes to
type refs, composing node types, checking type satisfaction, and composing
graph functions by endpoint type satisfaction.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-027**: A node type shall be published
through the GTL library path as a non-callable node-type declaration with its
own typed identity and the `node_type` registry kind. It shall not mint or use
a `GraphFunction` identity, and no parallel type publication path is lawful.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-028**: A `node_type` library entry may
be admitted, projected, imported, queried, and used by validator/conformance
surfaces. It shall not become runtime traversal work, public-start authority,
graph-call authority, or `graph_function_selected` truth.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-029**: Type conformance shall be pure,
deterministic, replayable, and fail-closed. Unknown type refs, digest drift,
weakened schema, markov, context, asset-surface, authority, proof, or output
obligations shall reject rather than infer compatibility.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-030**: Composed node types shall
preserve or strengthen every constituent node-type obligation. Composition
shall not weaken required schema, markov, asset-surface, authority, proof,
output, context, or provenance obligations.

**REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-031**: Type-sensitive graph-function
composition shall distinguish port identity from endpoint type contract. It
may connect differently named ports only when an explicit wiring or ratified
unambiguous auto-wiring proves the provided endpoint type satisfies the
required endpoint type.
