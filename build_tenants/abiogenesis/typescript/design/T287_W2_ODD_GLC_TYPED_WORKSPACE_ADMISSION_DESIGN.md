# T-287 Wave 2 odd_glc Typed-Workspace Admission And Functional Traversal Design

**Roadmap status**: Accepted R0/R1 force rank and R2-R4 routing

**HOW status**: R2/R3 selected for design; proposed; unratified; non-executable

**Change class**: `goal_reprice` followed by bounded `design_reframe`

**Product basis**: ABIogenesis 5.0 Product and requirements remain unchanged

**Routing ticket**: `T-287`

## Decision

Wave 2 is repriced around the smallest generic ABIogenesis relation needed to
admit URI bindings into a typed workspace under a downstream Product's applied
overlay composition and execute one fully graph-declared lifecycle through one
ABG start. The real odd_glc Product later instantiates `A/B/C` for the same
generic contract class; ABI acceptance uses independent neutral instances.

The selected design question is not whether all 56 published definitions are
callable. It is whether every definition and internal owner relation required
by that exact downstream path is constructable, installed-public, source-blind,
and replay-visible. Definitions outside that path do not gain priority from a
family count.

This proposal does not add `ReferenceFrame`, `LifecycleFrame`, or another frame
entity to ABIogenesis. An odd_glc reference frame is a higher-order downstream
composition expressed through existing typed assets, named or hierarchical
overlays, GraphFunctions, Programs, policies, and query projections. ABI sees
only the existing generic carriers and relations.

This roadmap authorizes no implementation. Independent exact-object review of
proposal `3ab1ee6892bb22fc60206d38edbe8b970cca1d00`, tree
`9ae5438410d1528614cb887cff5caebb699b708d`, admitted only the goal reprice,
Product conservation, exact force ranking, and ordered design roadmap with
`A0/B0/C0/D0`. The typed-workspace admission network, URI/owner binding, overlay
hierarchy, functional traversal, and proof design remain R2/R3 work and require
a later decision-complete independent design verdict.

## Authority And Re-entry

`GOAL-035`, Intent, Product, and requirements remain fixed. The user-selected
change is a `goal_reprice` because the bounded Wave 2 focus changes from one
isolated root-carrier development gate to the generic installed relations that
the downstream Product actually consumes.

The design audit is a `design_reframe` because active Product and requirement
truth already require:

- immutable Product verification, resolution, installation, and workspace
  binding;
- typed catalog contribution, narrowing, and overlay application;
- admitted Program and GraphFunction membership;
- direct HoG traversal with no executable intermediate program;
- ABG-owned event, frame, continuation, result, closure, and replay truth; and
- downstream portability through one independent flavored catalog Product.

If the audit proves that a required Product meaning, public operation family,
schema, authority owner, or refusal partition is absent, work stops and enters
the owning higher re-entry. This design may not silently add that truth.

## Product Conservation

The proposal preserves these accepted boundaries:

- GTL is the sole graph language.
- A GTL graph composition is the Program.
- GraphFunction is the sole named callable catalog kind and is not the whole
  Program.
- HoG traverses the admitted graph directly.
- ABG admits runtime truth, frame lineage, continuation, result, closure, and
  replay.
- Product owns pure verification, dependency resolution, catalog construction,
  narrowing, and non-callable overlay application.
- A downstream Product owns its domain vocabulary, overlay content, policies,
  query surfaces, and proof interpretation.
- A downstream Product owns no alternate resolver, installer, registry,
  executor, event writer, continuation mechanism, or closure ledger.
- ABIogenesis owns no odd_glc or data-mapper domain semantics.

The fixed 18-operation/56-definition family remains constitutional structure.
Its count is a derived no-silence projection, not a wave outcome, callable
quota, or implementation order.

## External Use-case Evidence

The force-ranking discriminator is the proposed odd_glc full data-mapper steel
thread. It is external design evidence, not ABIogenesis authority and not an
ABIogenesis release dependency.

The evidence requires one independent zero-code odd_glc Product to publish a
typed Program, a named overlay composition, GraphFunctions, node types,
contracts, policies, and one start. One exact ABIogenesis Product must admit
that Product into a typed workspace and carry one start through traversal,
typed effects, evidence, continuation where actually reached, terminal result,
and fresh replay.

The concrete Scala/SBT data-mapper subject is a severe downstream falsifier for
the generic contract class. No Scala, SBT, data-mapper requirement, software
stage, mutation policy, or lifecycle-specific instruction may enter ABI Product
or runtime code.

ABIogenesis 5.0 acceptance continues to use the bounded independent flavored
fixture required by `A5-F17` and `ABG5-S06`. The real odd_glc campaign is a
separate downstream proof after an exact ABI Product cut is available.

## Typed Workspace Admission

“Bootstrap” is not the name of this boundary. ABIogenesis already uses
bootstrap for installed context and delivery assets. The selected relation is
**typed workspace admission**.

`TypedWorkspaceAdmission` is a design-frame label, not a new Product entity,
public schema, operation, or runtime aggregate.

Product installation and Catalog construction are the admission foundation:

```text
external trusted-developer and workspace authority
  -> WorkspaceAuthorityBasis from workspace.create or workspace.open
  -> verified immutable Product artifacts
  -> exact dependency resolution and ResolvedProductLock
  -> immutable ProductInstall values
  -> one WorkspaceBinding over ProductSet + lock + declared roots
  -> one admitted Catalog over bound contribution rows
  -> one narrowing CatalogView
```

That foundation makes node-type declarations, overlays, GraphFunctions,
contracts, policies, and implementations available to the workspace. It does
not itself type the workspace URI set.

The actual typed-workspace admission directly uses the existing URI-binding
admission layer. Its governing algebra is:

```text
U = finite Set<URI> whose domain types are not yet admitted

F = applied named or hierarchical overlay composition containing
      admissible type declarations
      edge relations
      conformance GraphFunctions
      policy and evidence contracts

AdmitURI_F(U)
  = edge traversal over U under F
  -> conformance GraphFunction results and evidence
  -> finite Set<TypeRef : URI> admitted through URI-binding law
```

`TypeRef : URI` is notation for the existing typed URI-binding relation, not a
proposal for another carrier. The design audit must name the exact current
Product/requirement/design/code carrier before acceptance and must not invent a
substitute when that layer already exists.

The admitted typed URI set becomes visible to subsequent overlay compositions
and GraphFunctions through the existing carried-binding/environment law. The
stable `WorkspaceBinding` remains the immutable Product/install/lock/root
authority and must not absorb mutable or newly derived type observations.

URI-binding admission is a reusable GraphFunction composition inside direct
HoG traversal. A lifecycle-specific runner must not repeat or specialize its
mechanics. Each traversal selects the applicable frame overlay, consumes the
unknown or previously admitted URI bindings, and either derives exact typed
bindings with evidence or returns typed residual/refusal pressure.

The applied frame therefore collapses many domain-specific admission designs
into one high-reuse capability:

```text
same URI-binding admission law
  + different admitted frame overlay
  = different typed workspace view
```

The output is replay-visible ABG truth or a replay-derived projection over that
truth. It is not a mutable map owned by a workspace helper, loader, fixture, or
odd_glc service.

### Existing URI-binding admission basis

The current ABI design and realization already contain the generic carrier
chain. No new `AdmittedBinding` schema is selected:

1. `CatalogContribution.handle` carries the canonical URI-shaped handle,
   contribution kind, declaration ref, owner, Program membership, readiness,
   and provenance in `code/src/gtl/contracts.ts`.
2. Catalog admission joins those rows to the exact lock, verified Products,
   installs, WorkspaceBinding, and publications in `code/src/product/catalog.ts`.
3. `narrowGraphFunctionCatalog` creates the exact handle allowlist and rejects
   duplicate or unknown handles.
4. `applyCatalogDeclaration` resolves a `node_type` or `overlay` handle and
   constructs one immutable `DeclarationApplication` over the exact
   declaration, target, applied-value ref, and digests.
5. Invocation admission reconstructs each application against the same
   CatalogView before accepting it.
6. Start resolution selects the Program start's GraphFunction, proves exact
   Program membership, and resolves the transitive declaration,
   Implementation, and semantic-owner closure.
7. GTL `cCompose` and `cEdge` conserve typed handoff compatibility while HoG
   traverses the admitted graph.

The design gap is not the absence of URI-shaped handles,
`DeclarationApplication`, or GraphFunction lookup. It is the exact lawful join
from conformance evidence and a zero-executable downstream Product to the
authority inputs that admit node-type/overlay applications and make those
bindings available to traversal.

### Binding-engine and type-authority split

| Relation | Owner | Constraint |
|---|---|---|
| URI identity, exact installed-owner resolution, binding admission mechanics, carried-binding transport, refusal, and replay | ABIogenesis Product and ABG runtime | Generic and type-parametric; no odd_glc vocabulary or domain branch |
| Edge traversal and invocation of admitted conformance GraphFunctions | HoG/ABG | Direct traversal of the admitted Program; no frame-specific controller |
| Type algebra, `TypeRef` identity, and node/edge/conformance declaration law | ABIogenesis Product's embedded GTL.TypeScript language authority | One generic type system; no odd_glc-local or parallel ABI type algebra |
| Neutral type instances and meanings used by ABI acceptance | Bounded independent flavored fixture Product | Exercises the same generic contract class without copying, naming, or becoming odd_glc |
| Lifecycle type instances and their domain meanings | odd_glc Product boundary | GTL-defined types instantiated at odd_glc as declarations such as `A`, `B`, and `C`; ABI may validate and cite but never instantiate or author their meaning |
| Reference-frame composition, admissible instantiated-type relations, and lifecycle interpretation | odd_glc Product overlays, policies, and query/proof surfaces | Higher-order composition over GTL/ABI carriers; no new ABI frame entity |
| Domain schemas, instructions, evaluators, and rubrics | exact downstream specialization Product | Must resolve as its own installed owner; never copied into ABI or generic odd_glc |

ABI is polymorphic over GTL-defined types instantiated at a downstream Product
boundary. Its claim is only that one exact URI conforms to one exact already-
published `TypeRef` under one exact applied frame and admitted evidence. The
ABI acceptance fixture instantiates its own neutral types. In the downstream
E1 proof, odd_glc alone instantiates lifecycle types `A`, `B`, and `C` and owns
their meanings. ABI never instantiates those types or publishes a domain-type
registry.

`abg.operation.run.invoke#start` is the transition from the admitted Product,
Catalog, overlay, and Program foundation into ABG runtime truth. URI-binding
admission is then traversed as declared graph work; it is not performed by the
start adapter before HoG.

Installation, workspace binding, catalog admission, catalog visibility,
overlay application, Program admission, GraphFunction selection, URI-binding
admission, and later lifecycle work remain distinct. No earlier relation
implies a later one.

## Pre-binding Admission Authority

The six pre-binding atomic operation families remain the existing workspace
create/open, Product verify/resolve/install, and workspace bind families. Their
concrete variants forbid a workspace binding because they construct or select
the relations from which one can exist.

The design audit must close how each of these public invocations obtains exact
trusted-developer authority and capability grants before a WorkspaceBinding,
Catalog, or execution basis exists. The authority must derive from existing
external authentication/authority input plus installed Product contract and
capability truth. It may not be self-minted by the caller, inferred from a
future binding, imported from source, or fabricated by a test harness.

This is a pre-binding admission-authority problem. It is not permission to add
a bootstrap controller or a second public invocation family. The accepted
design must identify one non-circular authority network for the first six
families and the exact transition to ordinary workspace- and execution-scoped
DefinitionCalls.

## Overlay And Reference-frame Law

An odd_glc reference frame is represented conceptually by an exact downstream
composition that parameterizes URI-binding admission:

```text
Reference frame meaning
  = named root overlay
  + ordered or hierarchical included overlays
  + typed asset and node identities
  + admitted GraphFunction membership
  + policy and contract refs
  + query/projection selection
```

ABIogenesis does not publish that equation as another runtime type. It must
instead prove that existing overlay and Program contracts can preserve:

- exact root overlay identity;
- exact transitive overlay membership and order where order is semantic;
- exact typed asset, GraphFunction, policy, and contract URI references;
- one deterministic application from admitted Catalog and CatalogView truth;
- one Program identity/digest resulting from the declared composition; and
- the exact URI-binding admission inputs, typed outputs, conformance evidence,
  application, Program, and selected callable in invocation and replay truth.

Named overlays may form a hierarchy. The hierarchy is declaration topology and
typing context, not a controller stack. HoG traverses the resulting admitted
Program and its conformance GraphFunctions; ABG frames remain runtime
invocation aggregates and must not be conflated with odd_glc reference-frame
meaning.

If existing overlay application cannot represent one exact hierarchical
composition without flattening away semantic identity or consulting ambient
state, the audit records a design gap. It does not create a `ReferenceFrame`
entity by default.

## URI And Owner Binding

Every downstream URI must resolve through one generic installed relation:

```text
declared URI
  -> one admitted Catalog row
  -> one owning immutable Product/content identity
  -> one exact public contract or declaration
  -> one exact Implementation and semantic owner where callable
  -> one invocation-local binding and replay-visible coordinate
```

Resolution must distinguish absent, ambiguous, incompatible, missing
dependency, wrong owner, unavailable installed binding, and acquisition
mismatch. A source path, ambient package, test helper, prior workspace, string
convention, or fallback registry cannot satisfy a URI.

GraphFunction resolution is not presumed missing. The installed odd_glc Hello
proof already resolved one downstream Program and one downstream GraphFunction.
The audit must classify each relation needed by a hierarchical overlay and
full traversal as:

- `existing_and_proved`;
- `existing_but_unproved_on_selected_path`;
- `declared_but_installed_binding_absent`;
- `design_gap`; or
- `Product_or_requirement_reentry_required`.

Only the last three classes create implementation or authority work.

## Fully Functional Traversal

The accepted success shape is declarative and functional:

```text
immutable Product/Catalog/overlay/Program admission foundation
  -> applied overlay composition
  -> one Public start
  -> URI-binding admission over unknown URI set under that frame
  -> admitted typed URI bindings carried to later graph boundaries
  -> HoG direct traversal of the admitted graph
  -> declared F_D, F_P, F_H, worker, or tool boundaries
  -> ABG-admitted events, evidence, fold, residual, and continuation truth
  -> terminal result and closure
  -> fresh replay projection
```

Lifecycle sequence belongs to graph topology. Transformations and URI
conformance belong to GraphFunctions. Context belongs to typed carried bindings
and the selected overlay composition. URI bindings enter only through their
admission law. ABI Product URIs resolve immutable owners. ABG owns execution
and event truth.

Imperative code that orders downstream lifecycle stages is a failure condition.
Prohibited examples include a data-mapper runner, stage array loop, per-vector
test driver, service/controller switch, direct GraphFunction call sequence,
fixture-authored continuation, or script-owned fold/closure. Generic finite
engine algorithms may realize accepted GTL/HoG/ABG law; they may not encode the
odd_glc topology or data-mapper stage names.

The proof must demonstrate that deleting or reordering a declared graph edge
changes or refuses traversal while changing an imperative fixture list has no
authority. One public start is the only external execution ignition.

## Force-ranking Law

Every one of the 56 published definition keys receives exactly one use-case
class:

1. `direct_required`: invoked or read on the admitted sunny path;
2. `transitive_required`: required to construct, validate, authorize, or prove
   a direct relation without becoming an extra lifecycle call;
3. `negative_only`: not used on the sunny path but required for a selected
   refusal or anti-bypass proof; or
4. `out_of_scope`: neither consumed nor needed by the selected Product outcome.

Each row must also record installed status:

- structural publication identity;
- installed callable locator status;
- selected semantic owner;
- exact use-case edge or negative; and
- implementation disposition.

No row may be promoted because another row exists, because an operation count
is aesthetically complete, or because a prior horizontal closure claimed all
definitions. Conversely, a direct or transitive requirement cannot be deferred
because the family has many rows.

The exact packed `v5.0.0-dev.286` Product used by T-041 has artifact digest
`sha256:4fc3130cef9fda3171bb28aafffa71775328745721e305172fce9d04c9fdfe41`.
Its installed public modules resolve 39 own-property callable locators and leave
17 locators absent across the structural 18/56 family. This is an installed-
locator census, not the older 37/56 banked-behavior ledger and not a claim of
5.6.2C conformance. The prior odd_glc Hello path consumed 12 callable
definitions. Those counts are evidence only. The exact force-ranked matrix
below must be independently reproduced from the immutable selected ABI Product
before implementation selection.

### Exact use-case matrix

`D` is direct-required, `T` transitive-required, `N` negative-only, and `O`
out-of-scope. `*` marks one of dev.286's exact 17 absent installed locators.

| Operation | `D` direct-required | `T` transitive-required | `N` negative-only | `O` out-of-scope |
|---|---|---|---|---|
| `workspace.create` | `clean` | — | `imported` | — |
| `workspace.open` | `open` | — | — | — |
| `project.read` | `catalog_list`, `catalog_describe`, `run_status`, `run_result`, `run_evidence`, `run_replay` | `graph_call_status`, `graph_call_result`, `graph_call_evidence`, `result_evidence`, `install_evidence`, `graph_call_replay`, `continuation_replay`, `c_call_replay` | `workspace_status`, `run_gaps`, `run_lawful_actions` | `assessment_evidence`, `witness_evidence`, `release_evidence*`, `workspace_replay`, `interaction_replay`, `workspace_gaps`, `ticket_consensus` |
| `product.verify` | `verify` | — | — | — |
| `product.resolve` | `resolve` | — | — | — |
| `product.install` | `install` | — | — | — |
| `workspace.bind` | `bind` | — | — | — |
| `catalog.admit` | `admit` | — | — | — |
| `catalog.view` | `allowlist` | — | — | — |
| `catalog.apply` | `node_type`, `overlay` | — | — | — |
| `run.invoke` | `start` | — | `invoke` | — |
| `run.continue` | — | — | `current_intent*`, `selected_action*` | — |
| `interaction.respond` | — | — | `select*`, `approve*`, `reject*`, `assess*`, `answer_escalation*` | — |
| `result.assess` | — | — | `assess*` | — |
| `witness.admit` | — | — | — | `reprice*`, `attest*`, `hygiene-stamp*`, `intake*`, `run-resumed*`, `run-stopped*` |
| `conformance.evaluate` | `gtl_program` | — | — | — |
| `product.materialize` | — | — | — | `context_bootstrap*`, `configuration*` |
| `release.snapshot` | — | — | `published_rc`, `tapped_release` | — |

The totals are exactly `D=18`, `T=8`, `N=15`, and `O=15`. The exact 17 absent
locators split into eight negative-only rows—five interaction responses, two
run continuations, and result assessment—and nine out-of-scope rows—six witness
acts, two Product materializations, and release evidence. None is direct or
transitive for the selected thread.

`run.invoke#invoke`, public continuation, nested workers, and internal
GraphFunctions never become harness calls. Internal correction may create ABG
continuation truth without authorizing an external `run.continue` call.

## Current Constructability Disposition

### Confirmed missing design relations

1. **Pre-binding admission authority**. The installed dev.286 grant constructor
   requires an existing `WorkspaceBinding` and admits only a subset of later
   operations. It therefore cannot lawfully authorize create/open/verify/
   resolve/install/bind and does not close Catalog application or conformance
   after binding. The accepted design must select one existing-authority-based,
   non-circular grant network.
2. **Generic declaration-application authority construction**. The current
   `CatalogApplicationResourceAssertion` expects an exact application basis,
   validation receipt, and contributor provenance, but the zero-executable
   downstream path has no accepted generic producer/join for those coordinates.
   A structural fixture manufacturing them is not admission. An owner-local
   executable Product-semantics provider is also unlawful for zero-executable
   odd_glc. The repair must be declaration/schema-driven and ABI-owned; it must
   reuse `DeclarationApplication` rather than create another binding entity.
3. **Candidate-bound whole-path proof**. No exact candidate proof currently
   covers typed workspace admission, applications, conformance, complete
   GraphFunction/owner closure, typed handoffs, one start, terminal result, and
   fresh replay on one immutable subject.

The exact odd_glc hierarchy is a downstream E1 proof input, not an ABI design
gap. odd_glc must freeze its general-lifecycle, domain, and data-mapper overlay
hierarchy, exact `A/B/C` instances, member relations, and application-value
contracts before E1. URI spelling does not imply hierarchy.

### Existing but unproved at selected scale

- canonical URI-shaped handles with exact owner and digest binding;
- Catalog admission/view and node-type/overlay `DeclarationApplication`;
- Program-aware GraphFunction lookup and transitive declaration closure;
- GTL higher-order composition and typed C handoff continuity;
- generic F_P result and evidence admission;
- ABG frame/span lineage, child foldback, continuation, and replay;
- one-start terminal execution, proved only by the small odd_glc Hello leaf;
- graph-call and C-call evidence/replay projections; and
- authentic missing, ambiguous, incompatible, and wrong-owner variants held by
  the T-041 resolution capsule.

### Not established as missing

- an ABI `ReferenceFrame` entity or evaluator;
- a data-mapper- or lifecycle-specific ABI runtime;
- a special ABI requirements-algebra runtime;
- GraphFunction resolution as a generic capability; or
- callable realization of all 17 absent locators.

The earlier hypothesis `GTL requirement -> EdgeRequirementEnvironment ->
replay` is not an admitted wave premise. The design first expresses lifecycle
meaning through GTL types instantiated by an independent Product, URI-binding
admission, overlays, GraphFunctions, applications, carried bindings, and ABG
replay. Only failure of that exact generic model may establish a further ABI
feature gap.

## Retargeted Wave Order

| Order | Task | Exact exit | Implementation authority |
|---:|---|---|---|
| `W2-R0` | Freeze downstream discriminator and Product conservation. | Exact odd_glc use-case evidence, ABI Product/requirement basis, nondependency boundary, and no-ReferenceFrame decision agree. | None |
| `W2-R1` | Force-rank 18/56 definitions. | Every definition has one class, installed status, owner, use-case edge, and disposition; no count-driven work remains. | None |
| `W2-R2` | Close typed workspace admission. | Decision-complete pre-binding authority, verify/resolve/install/bind, Catalog/View, overlay application, Program/GF admission, and URI/owner network. | None |
| `W2-R3` | Close functional traversal. | One-start graph topology, typed carried environments, effect boundaries, evidence/fold/residual/continuation, terminal result, and replay are decision-complete with imperative falsifiers. | None |
| `W2-R4` | Select the minimal implementation slice. | Independent review accepts an exact file/module/test map containing only direct/transitive/negative-required generic gaps. | Later `realization_refactor` only |
| `W2-P0` | Repair the S1 proof-enclosure representation. | Accepted bounded evidence-DAG design and independently reviewed implementation prove the exact large Product subject without multiplied inline bytes or hidden authority. | Separate proof-HOW prerequisite |
| `W2-I0` | Implement the typed-workspace admission foundation gaps. | Exact selected pre-binding authority and generic declaration-application rows work source-blind and stop before `run.invoke#start`; no URI-typing traversal or lifecycle claim. | Only after R0-R4 and P0 acceptance |
| `W2-I1` | Implement URI-binding admission and functional traversal gaps. | One bounded independent flavored fixture applies its own neutral GTL-defined type instances, traverses URI-binding admission and the selected graph through installed Public ABI contracts, and reaches terminal result plus fresh replay. | Only after I0 acceptance |
| `W2-E0` | Candidate qualification. | Exact ABI candidate passes affected scenarios and negatives; no odd_glc release dependency. | Normal candidate gate |
| `W2-E1` | Downstream validation. | An independent odd_glc Product runs the full data-mapper steel thread without ABI or odd_glc imperative lifecycle code. | Downstream proof, not ABI release authority |

`W2-P0` is required because real candidate size exposed an unconstructable S1
proof representation. It is proof infrastructure, not the new wave outcome.
Passing it proves that ABI can enclose and reproduce the candidate evidence; it
does not prove typed workspace admission or lifecycle execution.

## Current Audit Questions

Before R4, the design must answer with exact accepted relations rather than
feature prose:

1. Which existing public definitions form typed workspace admission?
2. What exact pre-binding authority admits their capability grants without a
   future WorkspaceBinding or execution basis?
3. What is the exact current URI-binding admission carrier and which owner
   admits `TypeRef : URI` truth after conformance traversal?
4. Does `catalog.apply#overlay` preserve hierarchical overlay identity and
   transitive membership, or only a flat projection?
5. Which installed public exports construct and admit the Program, resolve its
   GraphFunction, materialize its graph, and validate it without lowering?
6. Which typed carried environment conveys the admitted URI bindings,
   requirement, evidence,
   prior fold, residual, and context truth to a traversed C locus?
7. Which of those contracts exist only as declarations, which have installed
   owners, and which have been exercised through one Public start?
8. Does the selected sunny path require public `run.continue`,
   `interaction.respond`, `result.assess`, or `witness.admit`, or are those
   conditional/negative paths around an internally traversed graph?
9. Which `project.read` cases are necessary to prove result, evidence,
   continuation, gaps, lawful actions, and fresh replay without treating reads
   as execution?
10. What exact ABI Product-owned generic GraphFunctions are required, and which
   callable meanings remain downstream specialization?
11. What minimum negative set proves missing, ambiguous, incompatible, stale,
    wrong-owner, source-fallback, and imperative-bypass refusal?

An unanswered question blocks implementation selection. It does not authorize
an adapter.

## Proof Contract

The design proof has four distinct subjects:

1. immutable ABI Product and installed-public export evidence;
2. immutable independent flavored declaration Product;
3. the Product/install/binding/Catalog/overlay/Program admission foundation
   before execution; and
4. one runtime URI-binding-admission, lifecycle, and replay episode after one
   start.

Evidence must retain exact artifact, Product, lock, install, binding, Catalog,
CatalogView, overlay application, Program, GraphFunction, contract,
Implementation, semantic owner, run, graph-call, frame, result, closure, and
replay coordinates actually reached. Synthetic labels, source symbols, test
names, or expected stage arrays are not substitutes.

The proof harness may supply immutable inputs, make public admission calls,
make one start, and perform public reads. It may not author the Program after
publication, apply private overlays, invoke GraphFunctions or workers directly,
emit events, select continuation, fold results, interpret closure, or repair the
subject.

## Mandatory Falsifiers

The design or realization refuses if any of these is true:

- an ABI `ReferenceFrame` entity, subsystem, evaluator, registry, or runtime
  path is added;
- odd_glc or data-mapper semantic names enter ABI runtime code;
- the 56-definition count determines implementation scope or order;
- a required definition is excluded because its family is large;
- typed workspace admission is called bootstrap or conflated with context-
  bootstrap materialization;
- installation implies binding, binding implies Catalog admission, Catalog
  presence implies visibility/callability, or overlay application implies
  runtime admission;
- pre-binding capability authority depends on a future binding, Catalog,
  execution basis, or caller-minted grant;
- URI type truth is inferred by path, filename, extension, ambient loader,
  caller label, or overlay metadata without URI-binding admission;
- typed URI bindings are stored by mutating the stable WorkspaceBinding;
- a traversal bypasses the reusable URI-binding admission layer or implements
  frame-specific type admission;
- overlay hierarchy is flattened without preserving semantic identity;
- a URI resolves through source, ambient package state, a test helper, mutable
  path, prior workspace, or fallback registry;
- GraphFunction resolution is declared missing without testing existing public
  resolution, or declared complete from one Hello leaf;
- an imperative runner, stage loop, service, fixture, or direct vector call
  orders lifecycle work;
- runtime result, continuation, closure, or replay is authored outside ABG;
- S1 evidence-DAG success is reported as typed-workspace or traversal closure;
- the real odd_glc release becomes a condition of ABIogenesis 5.0 release; or
- proposal acceptance is treated as implementation selection.

## Roadmap Acceptance And Later Design Delivery

Exact proposal `3ab1ee6892bb22fc60206d38edbe8b970cca1d00`, tree
`9ae5438410d1528614cb887cff5caebb699b708d`, received independent
Product-frame `A0/B0/C0/D0` review and owning Executive/F_H acceptance of the
goal reprice, R0/R1 force rank, and R2-R4 roadmap. R2/R3 design work is now
selected. This document remains proposed and unratified as HOW while its
admission and traversal questions are open.

R2/R3 becomes HOW only after the exact relations are decision-complete, frozen,
and independently accepted in a later design child. Only that later verdict may
authorize R4 implementation selection. Neither verdict allocates a Product
version, runs E00, or changes a release subject. Any discovered change to
Product, requirements, operation-family meaning, schema, owner, or refusal
partition returns to the owning re-entry before code.
