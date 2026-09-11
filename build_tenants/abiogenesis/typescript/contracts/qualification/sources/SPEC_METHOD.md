# Spec-Driven Homeostatic Methodology

## Canonical Compression

Spec-driven development treats specification as constitutional source, not
commentary on code. Methodology defines the process constitution. Intent,
product definition, and requirements define the project constitution.
Specification defines `WHAT`. Design and realization define `HOW`. Every
STDO-defined product publishes a layout-neutral `stdo_<label>.json` definition
that locates its governing constitution, local constitutional decisions,
collective reference-frame bases, `WHAT`, independent build-tenant `HOW`
realizations, work surfaces, and explicit product composition. The definition
is a routing overlay, not a rival truth surface. A material term resolves only
under its bounded-context identity, owning authority, selected basis, and
governed scope. Equal spelling creates no cross-context meaning or authority;
explicit imports, translations, equivalences, and disambiguations govern those
seams, and zero or multiple applicable meanings fail closed. Requirements define
the full constitutional what: capabilities, guarantees, governance, and
verification obligations. Design defines the structural how, and ADRs are one
durable form of that design record. The SDLC is a governed disambiguation
pipeline: each major boundary reduces the space of lawful interpretations and
must surface major ambiguity explicitly. Ambiguity detection is mandatory;
blocking or escalation is policy-driven by declared risk appetite, except for
hard-stop prerequisite failures. Products, applications, modules, graph
functions, build tenants, and runtime surfaces are implementations of the
constitutional documents, not substitutes for them. Scenarios verify
operational meaning where capability claims need end-to-end proof. Code
realizes decisions. Design must
be derivable from requirements, which are themselves derivable from goals,
intent, and product definition; code must be derivable from requirements and
design. Iteration is cumulative repricing, not waterfall.
Events, projection, and delta reveal drift. Every live requirement family must
have design ownership, explicit classification, and downstream closure or
explicit deferment. Every design record must ground itself in requirements.
Shipping behavior must trace back to constitutional authority. Live
constitutional surfaces are versioned history and must change by supersession
or withdrawal, not silent in-place mutation. New intent emerges from real use
cases hitting the current model through explicit gap analysis, not ad hoc
pressure. Sprints are execution-control batches for pricing proof cost and
forcing close review; they are not authority layers and cannot hide drift.

---

## Position

Spec-driven development treats specification as constitutional source, not as
commentary on code after the fact.

The point is to make software re-derivable, auditable, and correctable under
explicit authority.

Its overriding bias is declarative rather than imperative.

In the age of LLMs, the system should primarily declare truths, structures,
interfaces, constraints, and evidence surfaces, then let lawful processing
derive and realize work from that declared surface.

Imperative procedure still exists, but it is subordinate to declared authority.

---

## STDO Method Identity

`SPEC_METHOD.md` owns the method-identity bounded context
`urn:stdo:bounded-context:method-identity` under the selected complete STDO
basis.

Within that context, **STDO** is the shorthand for the method's four key
pillars:

- **S** — Specification, owned by `SPEC_METHOD.md`;
- **T** — Ticketing, owned by `TICKET_METHOD.md`;
- **D** — Design, owned by `DESIGN_MODULE_METHOD.md`; and
- **O** — Outcome-Driven Development, owned by `ODD_METHOD.md`.

The `O` names the complete Outcome-Driven Development pillar. `ODD_METHOD.md`
owns the `ODD` identity and graph-native meaning. This expansion does not make
the four named files independently selectable or reduce the STDO Product to
four members. Consumer authority remains one complete immutable released STDO
cut with its exact member inventory.

---

## Probabilistic Work Boundary

Spec-driven development exists to govern the boundary around work, not to absorb
the worker's internal solution strategy into the framework.

For any probabilistic, agentic, or delegated work unit, the live specification
and design should declare:

- the input and output contract
- the required context
- the capability or role expectation
- the admissible evidence and evaluator regime
- the provenance obligation
- the lawful stop, hold, gap, continuation, or completion states

The worker, tool, agent, or domain implementation owns the internal HOW inside
that declared boundary unless the product explicitly promotes part of that HOW
into reusable declared structure.

Deterministic checks and validation are evidence surfaces. They may optimize or
prove a domain-local path where the domain can make part of the work precise.
They do not authorize the methodology, runtime, or framework to absorb domain
solution strategy as constitutional law.

In graph-native refinements such as `ODD_METHOD.md`, this boundary is usually
one vector or edge traversal. The traversal is the admissible external space.
Any unconstrained part of a probabilistic worker's reasoning remains hidden
worker-internal traversal and must be forced back through declared contracts,
evidence, provenance, and control truth.

If a framework layer begins prescribing domain solution strategy beyond the
declared work contract and control truth, it has crossed its authority boundary.

---

## Recursive Product Taxonomy

`SPEC_METHOD.md` owns this taxonomy in the recursive-product bounded context
`urn:stdo:bounded-context:recursive-product-taxonomy` under the selected
complete STDO basis.

Software is recursive and compositional.

A released product may be used to build:

- the next released version of itself
- a dependent product
- downstream project artifacts

Most taxonomy drift in recursive software systems comes from collapsing these
roles into one overloaded word such as `product`.

This methodology therefore distinguishes:

- **Substrate** (`urn:stdo:concept:recursive-product-taxonomy:substrate`): a
  lower product or runtime used to build other products;
- **Development Product**
  (`urn:stdo:concept:recursive-product-taxonomy:development-product`): the
  role of one exact Install of a released Product while that Install acts as
  builder substrate for a Source Project. The role creates no new Product
  identity and transfers no meaning or authority from the builder to the
  Product being authored;
- **Source Project**
  (`urn:stdo:concept:recursive-product-taxonomy:source-project`): the mutable
  workspace building the next release cut;
- **Release Cut**
  (`urn:stdo:concept:recursive-product-taxonomy:release-cut`): one immutable
  annotated RC boundary over a published feature set;
- **Product** (`urn:stdo:concept:recursive-product-taxonomy:product`): the
  released immutable thing resulting when that release cut is accepted;
- **Install** (`urn:stdo:concept:recursive-product-taxonomy:install`): a
  stamped workspace instance of that released product;
- **Artifact** (`urn:stdo:concept:recursive-product-taxonomy:artifact`): any
  published output built by a source project or by a configured installed
  product; and
- **Product Definition**
  (`urn:stdo:concept:recursive-product-taxonomy:product-definition`): the
  present-tense source-project authority surface conventionally carried by
  `PRODUCT.md`; it defines the current product `WHAT` for decomposition and is
  not the released Product artifact.

The governing rules are:

- do not call a mutable source workspace a product
- when a released Product acts as builder substrate, bind the exact Install as
  a Development Product without confusing it with the Product being authored
- do not confuse an immutable RC release cut or installed product with the mutable source
  project building the next cut
- `PRODUCT.md` is the product-definition surface of a source project, not the
  released product artifact itself
- products may depend on other products
- installed products may build the next version of themselves or other products

The compiler analogy is the intended model:

`bootstrap source -> release P0 -> install P0 -> use P0 to build source for P1 -> release P1`

This taxonomy is load-bearing.

If it is blurred, dependency and self-hosting errors compound quickly and are
expensive to unwind.

---

## Manifesto

We define the current **goals** for the active body of work before repricing deeper constitutional layers.

We work from **intent** before implementation.

We define the current **product definition** in explicit present-tense terms before decomposing it into detailed requirements.

We define the full constitutional **what** in **requirements**, not merely a feature list.

We prefer declaring desired truth and lawful boundaries over prescribing step-by-step imperative procedure.

We make **design** the explicit structural bridge between requirements and code.

We require **code** to be derivable from requirements and design, not defended as accidental precedent.

We treat spec-driven development as a **disambiguation pipeline**: each major gate reduces the space of lawful interpretations before downstream realization proceeds.

We demand **evidence** for claims through scenarios, tests, events, projection, and delta.

We treat **repricing** as part of correctness: when reality exposes a constitutional gap, the specification must change.

We keep **authority directional** even while iterating: goals govern intent, intent governs product definition, product definition governs requirements, requirements govern design, and requirements plus design govern code.

We keep the **live operative surface** in the present tense only: once a new current reality is established, transitional paths are erased from the live product unless explicitly retained as compatibility features.

We treat **derived artifacts** — indexes, trace matrices, reports, automation, generated views — as helpful read models, never as constitutional truth.

If these claims do not hold, the work is not genuinely spec-driven.

---

## Spec-Drivenness Litmus

The work is not genuinely spec-driven if any of these fail:

1. Given goals, a competent team cannot derive a conformant intent surface.
2. Given intent, a competent team cannot derive a conformant product-definition surface.
3. Given product definition, a competent team cannot derive conformant requirements.
4. Given requirements, a competent team cannot derive a conformant design.
5. Given requirements and design, a competent team cannot derive conformant code.
6. A live requirement has no explicit status, category, or owning design decision.
7. A live requirement has no downstream realization or explicit deferment surface.
8. Code behavior exists without requirement and design authority.
9. A live domain artifact is rewritten in place after becoming part of the live constitutional surface.
10. A capability claim has no operational evidence.
11. Drift is discovered, but the constitutional source is not repriced.
12. A major ambiguity at a constitutional or realization boundary is neither recorded nor explicitly governed.
13. A material product, module, function, application, runtime surface, or
    capability has no declared operational lifecycle signal and no recorded
    gap for unanswered release, deployment, live-use, telemetry, or retirement
    questions.

---

## Process Constitution

This methodology is not only a local operating note for one implementation. It is the process constitution for building projects by spec-driven development.

Its role is meta-constitutional:

- it defines how goals, intent, product, requirements, design, code, evidence, and repricing relate
- it defines what counts as specification sufficiency
- it defines what kinds of requirement truth exist
- it defines how authority flows during iterative delivery

Therefore, if a project's implementation disappears, this methodology should still be sufficient to bootstrap a new spec-driven project process from scratch.

The important boundary is:

- `SPEC_METHOD.md` defines the process constitution
- `GOALS.md` conventionally names the current overriding concerns for the active body of work
- `INTENT.md` conventionally names domain direction
- `PRODUCT.md` conventionally names the current product-definition surface of the mutable source project
- `specification/requirements/` is the conventional live requirement surface derived from product definition
- a shared design surface plus any tenant-local design surfaces choose the concrete mechanism
- the product's `stdo_<label>.json` definition binds the actual authority
  locations; these conventional names do not require an existing project to
  move or duplicate its files
- the definition's `how.build_tenants` entries locate the project-owned
  realizations beneath one shared specification

The authoritative split is strict:

- the surfaces bound by `what` define `WHAT`
- design and realization surfaces define `HOW`
- no build-tenant, design, code, definition overlay, or derived surface may
  become co-equal constitutional authority with the bound `WHAT`

In the default scaffold, `requirements/` is a folder under `specification/`.
Requirements may instead be stored at any URI bound by the product definition,
as individual files or grouped into requirement families. The purpose of the
default shape is to avoid collapsing the constitutional surface into one
monolithic requirements document, not to make folder placement constitutional.

This is one expression of the broader declarative bias: we prefer declaring requirement structure and family boundaries over maintaining one imperative catch-all document.

So if project-specific design and code disappeared, recovery would proceed through this methodology plus the surviving domain specification. Methodology alone can bootstrap the process; methodology plus domain specification can reconstruct the project.

---

## STDO Product Definition Overlay And Layout Independence

`SPEC_METHOD.md` owns the product-definition-routing bounded context
`urn:stdo:bounded-context:product-definition-routing` under the selected
complete STDO basis. This section defines that context's overlay, definition,
discovery, locator, and composition concepts. The JSON schema realizes its
accepted interoperability shape but does not become a second semantic owner.

Every STDO-defined product publishes one JSON definition for each distinct
current product `WHAT`. Its conventional filename is:

```text
stdo_<label>.json
```

`stdo_default.json` is the default filename for a source project with one
product definition. A directory may contain more than one definition when it
hosts more than one distinct product `WHAT`. Multiple build tenants realizing
the same `WHAT` remain entries in one definition and do not create additional
definition files.

The suffix `<label>` is the **Definition Label**: a stable lowercase local
discovery label made from ASCII letters, digits, hyphens, or underscores. It is
unique only among definitions in the same directory. It is not Product
identity. The `product.definition_id` URI inside the definition is the
**Product-Definition Identity**: the stable identity of the mutable
product-definition line, unique within the discovered workspace definition
set. It identifies one continuing `WHAT` definition, not one immutable released
Product.

The definition identity may remain stable while that source line authors
successive Product releases. Every immutable Product or release produced from
the line retains its own Product- and Release-Method identity. A fork,
replacement, or independently governed `WHAT` definition receives another
`product.definition_id`; changing a released Product does not repurpose the
definition identity as release identity.

Product-definition, immutable Product, bounded-context, and build-tenant
identity URIs are identity carriers, not self-authorizing strings. They remain
subject to `IDENTITY_METHOD.md` and the owning Product, release, or domain
authority. A URI locator, filename, path, or display label cannot mint or widen
identity authority.

The directory containing a definition is its **definition root**. Relative URI
references resolve against the definition file's retrieval URI. The
`product.source_project` reference identifies the source-project root and may
resolve to the definition root or elsewhere. File proximity does not create
authority.

The normative schema is
`schemas/product-definition.schema.json`. The single fill-in form is
`templates/PRODUCT_DEFINITION_TEMPLATE.json`. This concrete JSON shape is an
accepted interoperability boundary under `STDO-SURFACE-001`. It standardizes
only identity, location, relation, and discovery fields. It does not absorb the
meaning owned by any referenced constitutional, Product, requirement, design,
ticket, or commentary surface.

### Required Definition Relations

Each definition contains:

- `product` — stable product-definition identity, display name, source-project
  locator, and an explicit bounded-context declaration or `null`;
- `constitution.stdo` — the STDO source repository, mutable version-line
  discovery selector, and exact installed release basis with its deterministic
  manifest digest;
- `constitution.additional_authorities` — every non-STDO constitutional set;
- `constitution.entrypoints` — basis-qualified useful reading routes; and
- `constitution.agent_bootstrap` — the constitutional entrypoint and
  marker-managed agent-instruction targets;
- `local_constitution` — local axioms, overrides, and disambiguations with
  their owning authority, target, basis, and scope, including context-qualified
  term resolution where applicable;
- `reference_frame_bases` — one or more accepted collective reference-frame
  basis declarations with their admitting authorities and governed scopes;
- `what` — the current Intent, Product, and specification bindings;
- `how` — any shared realization surfaces and one or more independent build
  tenants;
- `ticketing` — Goals, ticket, comment, and optional sprint carrier bindings;
- `composition` — explicit relations to other STDO product definitions; and
- `$schema` and `kind` — the schema locator and
  `stdo.product-definition` discriminator.

The overlay owns this locator and relation map. Referenced documents own their
content. Repeating source truth inside the JSON creates a rival authority and
is non-conformant.

`product.bounded_context` identifies the enclosing bounded context of the
definition's own product `WHAT`, or is `null` when no separate enclosing context
is claimed. It is not an exhaustive registry and does not flatten subordinate,
peer, composed, tenant, user, or runtime contexts into one namespace. Those
contexts remain defined by their owning authorities; every local
disambiguation names the exact context in which its resolution applies.

### Constitutional-Set Sufficiency

A **Constitutional Set** is the complete set of governing documents selected
for a product, not five prescribed files. Collectively, the selected set must
make the following recoverable for the governed scope:

- **axioms** — irreducible starting truths, invariants, and refusal conditions;
- **ontology** — the kinds of things treated as real and their material
  identities, relations, boundaries, and lifecycle;
- **epistemology** — how claims become knowable or acceptable, including
  admissible evidence, observation, uncertainty, falsification, and decision
  authority;
- **taxonomy** — the classifications and kind distinctions used to prevent
  category collapse; and
- **semantics** — the governed meaning of terms, relations, states, operations,
  and outcomes.

These are sufficiency dimensions of the complete set. They are not filename
classes, required folders, or a one-document-per-dimension partition. One
document may cover several dimensions, and one dimension may be distributed
across several owning documents.

`constitution.stdo.basis` locates the complete selected STDO constitutional
set. `constitution.additional_authorities` locates every additional
constitutional set or source. The STDO basis identifies one complete immutable
RC cut and its exact installed-release manifest, not a hand-selected subset.
Each `constitution.entrypoints[]` member names the basis against which its URI
resolves. Entry points are derived navigation and cannot narrow or replace a
complete selected constitution.

This rule does not promote every concrete design Ontology into constitutional
`WHAT`. Product-level ontology that fixes Product meaning belongs in or is
cited by the bound `WHAT`. The accepted Design Module Method Ontology remains
semantic-design authority for a realization boundary, derives from
constitutional `WHAT` and applicable domain methods, and cannot invent
missing Product meaning.

### Shared Installed Release Basis And Toolchain Manager

Within the product-definition-routing bounded context, an **Installed Release
Basis** is the pair:

```text
(immutable stdo://releases/<cut>/ URI, installed-manifest SHA-256)
```

The URI identifies one immutable annotated RC cut. The digest identifies the
deterministic installed-release manifest that binds its tag object, commit,
repository tree, standards subtree, exact standards inventory, member bytes,
and admitted auxiliary payloads. The manifest shape is owned by
`schemas/installed-release-manifest.schema.json`. It is transport and integrity
evidence, not a replacement constitution.

An **Adoption Plan** is the read-only, deterministic acceptance object binding
one current Product Definition's identity and bytes to its current basis and
one resolved immutable target's cut, annotated tag object, commit, tree, and
installed-manifest digest. Its SHA-256 is the operator-presentable acceptance
token; possession alone does not grant authority, while a mismatch proves that
the presented subject is no longer the subject being mutated. A **Fleet
Adoption Plan** binds an authorized fleet root and the complete ordered set of
per-definition plan digests under the same law.

Plan hashing uses the acceptance object only: local installation status and
machine-local install paths are excluded. Its canonical bytes are UTF-8 JSON
with recursively sorted object keys, two-space indentation, LF line endings,
and one final LF. Fleet order is deterministic discovery-path order. These
rules make a presented digest independently reproducible rather than an opaque
session token.

The **STDO Toolchain Manager** is the bounded executable realization that:

- installs each immutable cut once in a shared, versioned release store;
- resolves logical `stdo://releases/...` URIs to verified installed bytes;
- inventories and verifies complete installed distributions;
- synchronizes the exact basis already selected by a Product Definition;
- emits an exact digest-bound adoption plan from a mutable version-line
  selector and performs adoption only when that plan is explicitly accepted;
- manages the stable marker-bounded bootstrap in declared agent files; and
- applies those operations to an explicitly discovered fleet of Product
  Definitions.

The store may live at any machine-local path. Its registry maps logical release
URIs to installed paths and manifest digests, but owns neither Product
selection nor method meaning. A consumer repository therefore does not need a
project-local standards copy or a prescribed folder structure. Several Product
Definitions on one machine may select different installed cuts concurrently.
Every manager-owned component from the configured store root downward must be
a physical directory or regular file of its declared type. A symlink, junction,
reparse point, device, socket, or other redirection or special entry fails
closed. Verification inventories every filesystem entry type, including
directories, and rejects any entry not derived from the manifest's exact file
paths. It never follows an unmanifested alias.

`constitution.stdo.source.repository` identifies the transport source.
`constitution.stdo.selector` is a mutable `stdo://channels/<version>` discovery
selector whose Git alias semantics are owned by `RELEASE_METHOD.md`. Neither is
operative authority. `constitution.stdo.basis.uri` and
`constitution.stdo.basis.manifest_sha256` are the sole authored STDO selection
for that Product Definition.

The manager observes these command boundaries:

- `install` admits one explicitly named immutable RC cut without changing any
  Product Definition;
- `sync` installs and verifies only the exact basis already selected by the
  Product Definition and never consults its mutable selector;
- `adopt --dry-run` resolves the annotated selector and immutable RC, presents
  the target cut, tag object, commit, tree, manifest digest, current Product-
  Definition byte digest, and a deterministic adoption-plan digest without
  mutation;
- mutating `adopt` requires that exact prior plan digest as explicit
  acceptance, re-derives it before installation, installs only the bound target,
  rechecks the Product Definition bytes, and atomically changes only its basis
  and basis-relative schema locator; any drift refuses mutation;
- `status`, `verify`, `list`, `manifest`, and `resolve` are read-only with
  respect to Product Definitions; and
- fleet adoption emits and requires explicit acceptance of one aggregate plan
  digest over every per-definition plan; all fleet writes require explicit
  whole-selection authorization and do not infer composition or inheritance
  from directory nesting.

Missing cuts, moved immutable tags, tag-to-commit mismatch, manifest-digest
mismatch, missing, extra, or changed installed members, ambiguous Product
Definition discovery, unaccepted or stale adoption plans, URI escape, physical
store redirection, undeclared filesystem entry types, and malformed bootstrap
markers fail closed. Every `stdo:` schema locator is parsed before schema
loading under URI scheme case-insensitivity and must name the same immutable
cut as `constitution.stdo.basis`; spelling variation cannot cross that basis.
No cache, registry entry, source checkout, version alias, schema, or agent file
may silently replace the basis selected in the Product Definition.

`constitution.agent_bootstrap` does not embed another constitution. It names
one basis-qualified bootstrap entrypoint and the local instruction files whose
small discovery block the manager owns between explicit markers. Each target
is a portable relative path resolved against `product.source_project`; absolute
paths, parent traversal, redirected path components, and escape from that
boundary fail closed. A fleet additionally confines every resolved source
project to its explicitly authorized fleet root and preflights every target
before the first write. Exactly one correctly ordered marker span may be
replaced. Bytes before and after it, including trailing whitespace, remain
project-owned and byte-identical; appending a new span preserves all existing
bytes as an exact prefix. The bootstrap routes agents to the applicable Product
Definition, exact installed basis, and owning sources; it cannot restate or
override them.

Recursive fleet discovery prunes these exact directory names as VCS,
dependency, generated, cache, or managed-store internals:
`.git`, `.hg`, `.svn`, `.bzr`, `.venv`, `venv`, `node_modules`, `vendor`,
`site-packages`, `build`, `dist`, `out`, `target`, `.gradle`, `.tox`, `.nox`,
`.cache`, `.ruff_cache`, `.mypy_cache`, `.pytest_cache`, `__pycache__`,
`.genesis`, and `.stdo`. Discovered Product Definitions may not themselves be
symlinks. These exclusions are discovery law, not evidence that an excluded
tree lacks another independently governed Product.

#### Explicit Complete Consumer Update

A **Complete Consumer Update Plan** binds one explicitly selected Product
Definition and the complete companion population of one exact upstream
release-matched cohort to the consumer bindings selected by the invocation's
owner. The Product Definition continues to own composition; the upstream
cohort and each Product's release record own release and member identity.
An invocation selection and its derived plan/result are operation evidence,
not another persistent dependency declaration, registry or lock. The caller
must select every native route and derived context for the claimed update
scope; directory proximity or an empty discovery result cannot supply that
selection. An empty derived-context population means the owner selected none,
not that the manager established the absence of semantic context.

The separate `cohort-update` operation presents the whole plan without consumer
effects. Unlike the basis-only Adoption Plan above, its acceptance object also
binds physical effect destinations and binding preimages, exact selected
cohort bytes, companion annotated tags/commits/subtrees and inventories,
replacement dependency locators, native routes, and declared derived-source
observations. It uses the same canonical JSON hashing rule. Already-installed
status supplies no additional authority and does not change the digest.
Mutation requires explicit acceptance of this exact plan and rederives it;
possession of its digest alone grants no operation authority. Existing
`adopt`, `sync` and fleet contracts retain their narrower boundaries.

The complete operation verifies the selected cohort's dependency closure and
each exact companion's definition, release record and admitted members before
reliance. It stages absent immutable installs, verifies existing installs
without repairing them in place, and preflights every consumer target. Only
the selected basis/schema, existing composition locators/contracts and selected
native/install links may change. Historical installs and unrelated consumer
content remain available and unchanged. It creates no consumer-local checker
and changes no Product meaning or local semantic map.

For each selected derived context, missing, ambiguous, changed or unavailable
program/map/source evidence holds the complete update before consumer effects.
Its source owner must perform any necessary semantic re-entry; the manager
cannot mechanically relabel an older map as current. Exact source freshness is
integrity evidence, not semantic conformance or an independent semantic verdict.
After immutable staging the manager rechecks the consumer preimages and source
evidence. It reports completion only after verifying every selected resulting
binding and companion. Refusal before consumer effects retains prior state;
a caught application failure restores the affected consumer preimages and
does not report completion. Newly staged immutable installs may remain unused.
The operation requires an exclusive consumer write scope during application.
It does not claim a crash-atomic transaction across independent filesystem
paths: abrupt process/host loss or unavailable rollback storage requires
recovery from the presented preimages before claiming the complete relation.

### Bounded-Context Semantic Resolution

`SPEC_METHOD.md` owns this law in the semantic-resolution bounded context
`urn:stdo:bounded-context:semantic-resolution` under the selected complete STDO
basis. The glossary may index this identity but does not participate in its
declaration.

A **term** is a lexical label used in an occurrence, not a context-free concept
identity. A **bounded context** is an explicitly identified semantic scope in
which a governed vocabulary, concept set, and relation set are jointly
interpretable under named authority. A **concept reference** is an exact,
resolvable reference to a meaning owned by an authority under a selected basis;
the reference locates that meaning but does not mint it or its authority.

A bounded context exists only when an owning authority declares its stable
identity, owner, selected basis, and governed semantic scope. A consuming
standard may define a concept inside that context only through an explicit
owner relation. A filename, heading, index row, glossary section, schema value,
or bare URI cannot constitute the context.

Every material term occurrence resolves under this **semantic address**:

```text
(term, bounded-context identity, owning authority, selected basis, governed scope)
```

Equal spelling, capitalization, shape, file location, directory nesting, actor,
or implementation does not establish equal meaning, concept identity,
equivalence, inheritance, or authority. Different spelling also does not prove
different meaning. Those relations follow only from the applicable semantic
address or an explicit authorized relation.

Resolution proceeds in this order:

1. identify the occurrence's governed scope and nearest explicit bounded-
   context declaration;
2. identify the exact selected basis and the authorities applicable to that
   context and scope;
3. collect context-local definitions and explicitly imported concept
   references admitted by those authorities and that basis;
4. apply every applicable owner-authorized override or disambiguation; and
5. admit the occurrence only when exactly one concept remains.

A document, section, schema field, operation, or other owning surface may
declare a context for all subordinate occurrences, so uniquely resolved prose
does not need to repeat a qualifier on every term. A repository, directory,
filename, heading, glossary match, prompt, actor, or nearby definition does not
declare a bounded context by accident.

Zero applicable concepts is unresolved meaning. More than one is ambiguous
meaning. Both fail closed at a material boundary: an agent, design, schema,
implementation, test, translation, or reviewer must not select one by
familiarity, frequency, recency, nominal match, or a context-free glossary
fallback.

`GLOSSARY_GUIDE.md` is a non-deciding locator index. Each record points to an
exact source clause that declares the bounded context and owns the indexed
concept. The glossary defines neither and cannot repair a missing declaration.
An indexed concept is applicable only when the semantic address selects its
owning clause or the target context explicitly imports it; appearance in the
glossary creates no shared default.

A cross-context relation is explicit and owner-authorized. Its carrier states:

- exact source and target concept references and bounded-context identities;
- whether the relation imports unchanged meaning, disambiguates a use,
  translates directionally, including a specialization, or establishes the
  stronger equivalence claim;
- direction and any lawful inverse where material;
- preserved meaning, changed meaning, loss, and refusal conditions;
- source and target semantic owners without transferring either authority;
- selected source and target bases, governed scope, and provenance; and
- lifecycle and invalidation conditions.

A **Semantic Import** adopts the cited meaning unchanged for its declared target
scope. A **Semantic Translation** declares how meaning changes in one direction.
**Semantic Equivalence** requires the governing authorities to establish the
claimed equality; neither identical spelling nor two opposing translations
proves it automatically. A **Semantic Disambiguation** selects one meaning for
one scope and does not make competing concepts equal. No relation widens its
source or target authority.

A specialization is a directional translation whose target preserves the
declared source meaning while narrowing its admissible instances or adding
target-context constraints. It identifies the exact target concept, preserved
and narrowed meaning, excluded source instances, and absence or law of any
inverse. Calling a term a specialization without those coordinates establishes
nothing.

### Local Constitutional Binding

A local axiom, override, or disambiguation does not gain authority from its file
category or from being listed in the overlay. Every local entry names:

- the URI carrying the local decision;
- the existing Product, requirement, accepted-design, or other lawful authority
  that owns it;
- the clause or ambiguity it overrides or resolves where applicable; and
- the exact scope to which it applies.

Each `local_constitution.disambiguations` binding additionally names:

- `term` — the exact lexical label being resolved;
- `context` — the bounded-context identity in which the resolution applies;
- `disambiguates` — the complete material candidate concept or clause
  references;
- `resolves_to` — the exact selected concept reference, which is one member of
  `disambiguates`;
- `basis` — every selected semantic basis needed to interpret the candidates
  and resolution; and
- `uri`, `authority`, and `applies_to` — the owning resolution carrier, lawful
  authority, and exact governed scope.

The referenced `uri` owns the resolution. When candidates cross bounded
contexts, that carrier also declares the complete import, translation, or
equivalence relation required above. The overlay metadata makes the relation
discoverable and checkable; it does not restate the source-owned meanings or
mint the decision.

An empty local array explicitly declares that no local entry of that kind is
bound for the product. Omission is not an equivalent declaration.

### Collective Reference-Frame Basis

A **Project Reference-Frame Basis** is the Product-owned accepted declaration
of the shared frame set through which finite actors collectively engage one
governed Product scope or outcome. It binds:

```text
Project Reference-Frame Basis
  = exact Reference Frame Method and optional profile basis
  + admitting authorities and governed scopes
  + frame declarations and evaluation inventory
  + actor-binding rules and capability envelopes
  + semantic, evaluation, operation, and decision grants
  + result, conjunction, translation, and coverage relations
  + lifecycle activation triggers and invalidation law
```

`REFERENCE_FRAME_METHOD.md` supplies frame principles only.
`STDO_REFERENCE_FRAME_BASELINE.md` supplies one optional profile only. Neither
surface selects, adopts, or owns a Product binding. The adopting Product's
existing authority owns the concrete declaration and every grant it contains.

`reference_frame_bases` is the non-empty locator set for the accepted frame
bases through which finite actors collectively engage the governed Product and
its work. Each entry names:

- the URI carrying one accepted frame-basis declaration;
- every existing Goals, Product, requirement, accepted-design, or other lawful
  authority that admits the declaration; and
- the exact Product, bounded context, build tenant, outcome, or other governed
  scope to which it applies.

The referenced declaration owns the selected frame set, method or profile
basis, governed outcome, actor-binding rules, capability envelopes, grant
requirements, triggers, coverage, result relations, and invalidation law. It
may adopt an available profile or define a project configuration. The JSON
entry locates that declaration and its authority relation; it does not contain
the binding, adopt the profile, restate the frames, or create frame-set
authority.

Profile availability, Product adoption, and execution-scoped activation are
three distinct relations. Inclusion in a selected method cut makes a profile
available. Only Product authority may adopt it. Only an exact authorized work
instruction may activate one bound frame for an actor and subject.

The collective basis and an actor activation are distinct. An **Agent Frame Activation**
is the execution-scoped binding of one agent to an applicable
frame declaration or active configuration, exact evaluation, subject, basis,
evidence boundary, and capability envelope. The Product definition records the
durable shared basis. A ticket or other authorized work instruction carries the
activation packet. That execution binding does not mutate the Product Definition
Overlay. The overlay does not register agents, assign permanent frames, or
persist temporary active frame configurations.

Frames and actors remain separate identities. Several agents may activate
overlapping subsets of one frame set; one agent may activate different frames
over time. Neither an actor name nor a broad frame grants semantic, operation,
review, acceptance, or disposition authority beyond the cited owners and the
exact activation.

The Project Reference-Frame Basis also records the Product-role map when the
governed outcome crosses a chain of Products. The map keeps mutable Source
Projects, Product Definitions, candidate checkpoints, Release Cuts, released
Products, Installs, Artifacts, and dependent Products as distinct identities,
and records each Development Product as a role binding over its exact
underlying Install identity. Every directed Product-composition edge names its
source and target roles, governing authority and contracts, lifecycle,
evidence boundary, refusal, and invalidation conditions. Common actors,
repositories, files, implementations, outputs, or tool access create no
composition or identity relation.

An accepted Project Reference-Frame Basis may be expressed entirely as
source-linked prose. The starter at
`templates/PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md` projects this binding
law into one copyable shape. The template is not authority and no schema,
axiomatic representation, prompt framework, or runtime frame engine is needed
to use the method. An adopting Product replaces every placeholder with its own
exact identities, owners, scopes, sources, grants, results, and invalidation
conditions, then admits that completed declaration under existing authority.

A Product, domain, or runtime carrier also named `Frame` is not included by
nominal match. It remains governed by its bound `WHAT` and `HOW` and may be the
subject or coordinate of an evaluation frame. It enters the collective frame
set only through an explicit frame declaration with the required evaluation
and authority relations.

### WHAT, HOW, And Work Carriers

`SPEC_METHOD.md` owns the build-tenancy bounded context
`urn:stdo:bounded-context:build-tenancy` under the selected complete STDO basis.
It governs the realization relation defined here: one constitutional product
`WHAT` is realized by one or more independent project-owned `HOW` tenants. A
**build tenant** is one such realization. **Build tenancy** is the one-or-more
relation; one tenant is its singleton case and multi-build-tenancy begins when
the same `WHAT` has more than one independent realization.

`what.intent`, `what.product`, and `what.specification` locate the current
constitutional `WHAT`. Intent and Product each have one canonical entrypoint;
specification may cite more than one requirement or specification surface.

The **Tenant Registry** is the canonical `how.build_tenants` collection for the
product's independent `HOW` realizations. Each entry has stable identity and
locates its root, design, and implementation surfaces. The **Common Build-Tenant Surface**
is the realization law bound by `how.common` and
explicitly adopted across more than one tenant. A separate
`TENANT_REGISTRY.md` may remain as a human-readable companion or generated
projection, but it cannot become a second tenant-identity or location
authority.

`ticketing.goals` locates the current work-wave carrier.
`ticketing.tickets` locates the durable ticket root and the minimum backlog,
active, and completed lanes. `ticketing.comments` locates the commentary
root. `ticketing.sprints` optionally locates bounded execution-batch
manifests. These bindings may resolve to directories, repository resources,
tracker collections, API endpoints, or product-scoped queries. Goals own the
bounded work wave, ticket state remains ticket authority, and comments remain
non-authoritative commentary.

### Recursive Discovery And Explicit Composition

Tools discover `stdo_*.json` recursively within the selected workspace
boundary. Discovery includes definitions at the workspace root and definitions
at arbitrarily deep nested project roots.

Directory nesting creates no implicit inheritance, ownership, composition, or
constitutional override. Parent and child definitions remain independent until
`composition` explicitly relates them. Each composition entry records:

- `product_definition` — the current locator for the target definition;
- `target_definition_id` — the stable identity expected from the target's
  `product.definition_id`;
- `relation` — the authority defining the directed composition kind, source
  and target roles, owner, scope, lifecycle, and invalidation conditions; and
- `contracts` — one or more exact interface, capability, identity, lifecycle,
  data, evidence, or other governing contract references consumed by that
  relation.

Resolution verifies both locator and expected identity. Moving a definition
requires a locator update but does not change its identity. Replacing content
at the same locator with another definition identity fails closed. When an edge
binds exact immutable Product or release versions, the cited relation and
contracts also carry and verify those identities; the mutable definition
identity cannot substitute for them.

A conforming discovered set satisfies all of the following:

- every definition validates against its selected released schema;
- every required URI and fragment resolves under the declared workspace and
  resolver boundary;
- every `product.definition_id` is unique;
- every build-tenant identity is unique within its Product Definition Overlay;
- every governed scope has a resolvable applicable reference-frame basis, and
  overlapping basis bindings are reconciled by their cited authority;
- every local disambiguation binds one exact term, target context, complete
  material candidate set, selected concept, authority, basis, and scope, and
  `resolves_to` is a member of `disambiguates` and its referenced resolution
  carrier is congruent with those bindings;
- every material cross-context term seam resolves through an explicit import,
  disambiguation, translation, or equivalence relation rather than nominal
  match;
- every composition target resolves to another product definition whose
  `product.definition_id` equals `target_definition_id`, and every relation and
  non-empty contract set resolves; and
- no two carriers claim authority for the same Product, tenant, ticket state,
  or constitutional relation.

Portable Draft 2020-12 JSON Schema validation establishes structural shape.
The schema's `uri` and `uri-reference` formats are annotations unless the
declared validator implements format assertion. Conformance therefore performs
an explicit RFC 3986 URI and URI-reference syntax check with an
assertion-capable validator, followed separately by resolution, fragment
existence, selected-release identity, uniqueness across files, constitutional
sufficiency, semantic-resolution and cross-context-relation completeness, and
authority congruence checks.

### Semantic-Resolution Conformance Cases

Conformance covers both uniquely resolved use and material collision. At
minimum, it establishes these cases under an exact selected basis:

| Term | Candidate contexts | Required result without an explicit cross-context relation |
|---|---|---|
| `Frame` | Reference Frame Method evaluation context and a consumer-owned runtime carrier | remain distinct; nominal match cannot enroll the runtime carrier as an evaluation frame |
| `Owner` | generic specialist evaluation family and a semantic or decision authority owner | remain distinct; the evaluation family acquires no owner authority |
| `Product` | immutable released Product and mutable Product Definition | remain distinct and select only through the occurrence's declared context |
| `Tenant` | STDO build realization and hosted, customer, account, runtime, or data tenancy | remain distinct; Build Tenancy supplies no default for the other contexts |
| `User` | Product role, human person, identity principal, account, actor, operator, or data subject | unresolved until downstream authority defines or explicitly relates the applicable meanings |

A positive local case declares one context and resolves exactly one concept. A
positive cross-context case supplies the complete authorized relation. Negative
cases cover zero candidates, multiple candidates after disambiguation,
selected concept outside the candidate set, context-free glossary fallback,
incomplete relation coordinates, authority or basis mismatch, undeclared loss,
and invalidated relations. Correct downstream behavior produced through a
guessed meaning does not pass semantic conformance.

---

## One Constitutional Surface And Version Boundary (`STDO-SURFACE-001`)

The shared methodology is modular in authorship and singular in authority.
Each law has one owning standard; other standards consume it by reference. The
standards become operative only as one complete released STDO version.

A released cut identifies its exact member set, member digests, review basis,
human acceptance, and immutable identity. Compressions, templates, comments,
candidate work, installed copies, and mutable source are derived, evidential, or
authoring surfaces. They cannot become a selectable partial constitution or
reinterpret the owning standards.

STDO owns normative construction algebra, authority relations, abstract state
and transition laws, admissibility conditions, necessary causal order, and
evidence invariants. Consumers own concrete Product realization: instantiated
types and schemas, files, tools, runtime and orchestration machinery, tests,
and executable conformance implementation. A concrete form is method law only
when the method explicitly accepts it as an interoperability boundary.

A shared-method amendment cannot create an executable tool, workflow engine,
runtime, assurance system, or consumer realization as STDO Product scope
without separate explicit human authorization. An agent recording a ruling
cannot widen its subject, implication, authority, or change class.

Only a released method version is publication authority. Mutable method source
may author a future cut; it must not silently govern a consumer.

---

## Constitutional Chain

```
Goals → Intent → Product Definition → Requirements → Design → Code → Events → Projection → Delta
                                                                                       ↓
                                                                                  Scenarios
                                                                                       ↓
                                                                                Gap Analysis
                                                                                       ↓
                                                                    Repricing / New Goals / Intent
```

- **Goals** define the current overriding concerns for the active body of work.
- **Intent** defines purpose and direction.
- **Product Definition** defines the current product realization of the mutable source project, its key terms, and end-state shape in terms that can be decomposed into requirements.
- **Requirements** define invariant truths the system must satisfy.
- **Design** defines the structural decisions, interfaces, carrier surfaces, and delivery topology that make those truths achievable.
- **ADRs** are one durable form of design record, not a second constitutional layer above design.
- **Code** realizes those decisions.
- **Events** record what actually happened.
- **Projection** reconstructs current truth from the event stream.
- **Delta** reveals drift between intended truth and realized state.
- **Scenarios** test operational meaning — can the system actually do the thing the words describe?
- **Gap analysis** identifies where real use cases hit the current model and reveal insufficiency.
- **Repricing** updates goals, intent, product, requirements, design, or code when the system no longer harmonizes. When gap analysis reveals constitutional insufficiency, it generates new **Goals** and/or **Intent**.

This is the homeostatic loop. Every link in the chain is load-bearing. A break at any link — goals with no downstream repricing path, an unowned requirement, an ungrounded design record, code without a design decision — creates accidental law.

`GOALS.md` is the bounded work-wave surface. It captures the current overriding concerns for the next body of work, keeps temporary focus out of deeper constitutional layers until it is intentionally repriced there, and is more immediate than intent while remaining higher-level than product definition and requirements.

`PRODUCT.md` is the bridge between direction and obligation. It states the current product-definition surface of the mutable source project in present-tense terms, names the product terms and boundaries that downstream layers rely on, and provides the surface that requirements decompose.

`PRODUCT.md` is not the immutable RC release artifact and not the installed product.

Those belong to the recursive product taxonomy above.

Requirements are the constitutional **what** of the project. They are not limited to user-visible product features. The live requirement surface may include capabilities, invariants, constraints, governance, and verification obligations. What matters is that each requirement states something the project must make true.

Design is the structural **how**. It chooses the concrete realization that satisfies requirement truth: interfaces, topology, file placement, carrier documents, entry/control surfaces, runtime wiring, and lawful tenant boundaries. Requirements may require such surfaces to exist and be delivered; design chooses where and how they are realized unless the path itself is constitutional.

For an STDO-defined product, the split remains exact regardless of physical
layout:

- the definition's `what` bindings locate the shared constitutional `WHAT`
- the definition's `how.build_tenants` bindings locate one or more independent
  `HOW` realizations of that shared `WHAT`
- tenant-local realization is derivative unless and until the governing truth is ratified in specification

---

## Sprint Execution Boundary

A sprint is a bounded execution-control surface.

It is not a new layer in the constitutional chain.

A sprint may batch work, coordinate tickets or iteration entries, price proof
cost, and force close review under existing Goals, Intent, Product Definition,
Requirements, and Design authority. It must not create, supersede, weaken, or
override that authority.

A lawful sprint states at least:

- the goal or work-wave it serves
- the upstream authority surfaces it depends on
- the scope it admits
- the product, requirement, design, runtime, data-contract, or governance
  boundaries it excludes
- the change classes it expects to contain
- the local proof or compliance debt, if any, that may be deferred during the
  sprint
- the closure trigger and closure law
- the paydown or repricing path for debt discovered at close

Sprints exist because proof cost is not uniform. For some work, especially
projection-surface and UX iteration, proving every micro-change before the next
change can cost more than making the bounded change visible and correcting it
at close. That optimization is lawful only when the deferred cost remains local,
visible, bounded, and repayable.

Deferred compliance inside a sprint is escrow, not acceptance. It cannot satisfy
method, release, or product closure until it is paid down, explicitly accepted
under the governing method, or repriced into the appropriate upstream surface.

A sprint may be recommended for close when any of these become true:

- its timebox expires
- the intended scope has been reached
- accumulated changed surface area makes continued iteration more expensive
  than review
- review uncertainty makes more work unsafe without reconciliation
- discovered gaps suggest the sprint boundary is no longer the right container

Sprint close is a forensic reconciliation event, not automatic approval. Close
review compares the accumulated work and evidence against the governing
authority, classifies each gap, accepts compliant work, opens paydown work for
local debt, and escalates any authority drift through the lawful change class.

If a sprint discovers a goal, intent, product, requirement, design, runtime,
data-contract, governance, or other product-truth change, the sprint manifest
does not authorize landing that change. The work must be split, escalated,
repriced, or carried as explicit paydown according to the governing method.

`TICKET_METHOD.md` defines the sprint and ticket mechanics. Domain refinements,
such as `UX_METHOD.md`, may define when sprint compliance escrow is an
appropriate cost optimization for that domain.

---

## Ambiguity Governance Rule

`SPEC_METHOD.md` owns the substrate-neutral ambiguity-governance bounded
context `urn:stdo:bounded-context:ambiguity-governance` under the selected
complete STDO basis. Graph/runtime shorthands such as `F_D`, `F_P`, and `F_H`
remain in the graph-native ODD context unless an explicit relation imports or
translates them.

Spec-driven development is not only a derivation pipeline. It is a governed
disambiguation pipeline.

The point of the upstream chain is to progressively reduce ambiguity:

- goals narrow active priority and work-wave focus
- intent narrows direction and scope
- product narrows current realization shape and terms
- requirements narrow constitutional obligation
- build-tenant or stack choice narrows executable realization class
- design narrows structural interpretation
- implementation narrows local realization detail

This narrowing is not uniform. The methodology distinguishes between:

- **major ambiguity**: ambiguity that materially changes architecture, stack,
  product boundary, execution/deployment admissibility, public contract shape,
  or other downstream realization law
- **micro ambiguity**: local implementation choice that remains inside an
  already-governed design boundary

Major ambiguity must always be surfaced and governed. It may not remain hidden
inside informal operator judgment, ambient precedent, or silent model choice.

Therefore, at each major boundary the process must:

- detect and record the major ambiguity that remains or is newly introduced
- identify the affected invariant, asset, or decision boundary
- record the decision taken if work proceeds
- record whether the ambiguity was resolved, carried forward, escalated, or
  blocked

Ambiguity detection is mandatory. Blocking is policy.

**Lawful Probabilistic Processing**
(`urn:stdo:concept:ambiguity-governance:lawful-probabilistic-processing`) is
bounded non-human processing permitted by declared policy to carry or resolve
declared ambiguity. **Human Adjudication**
(`urn:stdo:concept:ambiguity-governance:human-adjudication`) is explicit human
judgment admitted by authority to resolve declared ambiguity where policy or
risk appetite requires it.

The default governance model is:

- ambiguity may be carried or decided by lawful probabilistic processing when
  project policy allows it
- ambiguity may be escalated to explicit human adjudication when project policy
  requires it
- the threshold between those actions is determined by declared risk appetite,
  not by silent convenience

Projects may therefore choose different ambiguity-handling policies. A lower
risk appetite escalates more major ambiguity to explicit human judgment. A
higher risk appetite permits more bounded probabilistic decision-making. In either
case, the ambiguity and the decision must be recorded.

Some conditions are not optional ambiguity decisions and therefore remain hard
stops regardless of risk appetite. Typical hard-stop classes include:

- violated invariant or guarantee
- absent required authority surface
- missing declared capability for an executional or operational stage
- undeclared irreversible side effect
- explicit policy gate requiring human approval

The methodology is therefore not "eliminate all ambiguity before work." It is
"make ambiguity visible, govern it explicitly, and reduce it progressively until
downstream realization is sufficiently constrained."

---

## Operational Lifecycle Sufficiency Rule

Constitutional specification must treat a designed thing as more than its build
shape.

Any material product, application, module, graph function, runtime surface,
plugin surface, public interface, data surface, or capability has an operational
lifecycle. The canonical operational lifecycle chain is:

```text
intent
  -> requirement
  -> build
  -> assurance
  -> release
  -> deployment
  -> live usage
  -> observed telemetry
  -> retirement
```

`PRODUCT.md` and the requirement surface do not need to prescribe the detailed
implementation mechanism for every phase. They do need to provide enough
constitutional signal for downstream design to derive the intended lifecycle,
or explicitly record the unresolved ambiguity.

For product definition, this means naming the current product boundary, intended
use context, release/install posture, live-use posture, observability posture,
and retirement or supersession posture where those materially affect the
product's meaning.

For requirements, this means stating any invariant obligation that governs
build, assurance, release, deployment, live usage, telemetry, retirement,
ownership, source truth, authority boundary, or downstream interpretation. A
requirement may defer a phase only by naming the deferment and the surface that
will own its later resolution.

This rule is an ambiguity detector, not a demand that every requirement become
a release plan. If a phase is not applicable, say why. If the phase is unknown,
record a named gap such as `Gap:` or `Unanswered:`. Silent absence is not a
valid lifecycle answer.

When the lifecycle signal is missing, downstream design may not fill the gap by
local convention, implementation precedent, prompt prose, or test fixture. It
must reprice the appropriate constitutional surface or carry the ambiguity as
explicit, governed debt.

---

## Change Management Rule

Every substantive change begins with intake triage, an explicit declared change
intent, and a lawful re-entry point into the constitutional chain.

### Universal Intake Triage

There is one front door for substantive change.

The intake label does not determine the process class.

That means a reported:

- bug
- feature request
- issue
- regression
- operator finding
- release blocker
- scenario failure

all enter through the same intake-triage process.

Intake triage must determine:

- whether the report represents a substantive change at all
- the affected product boundary and intended scope
- the lawful change class
- the lawful re-entry point into the constitutional chain
- the downstream surfaces and evidence that must be repriced, re-derived, or
  re-proved
- whether the work remains within the currently declared release scope or
  requires repricing of that release plan

No bug, feature, issue, or other intake may bypass this triage by going
straight to code, tests, or release handling.

The purpose of triage is not to create a separate tracking bureaucracy. It is
to classify impact correctly so the change enters the method at the right
constitutional boundary.

The minimum lawful change classes are:

- `goal_reprice`: current bounded work-wave focus changes; re-enters at Goals and may flow through Intent, Product, Requirements, Design, Code, and Evidence where that focus changes deeper constitutional truth
- `intent_reprice`: directional or scope change; re-enters at Intent and flows through Product, Requirements, Design, Code, and Evidence
- `product_reprice`: current product realization changes while directional intent remains stable; re-enters at Product and flows through Requirements, Design, Code, and Evidence
- `requirement_reprice`: constitutional truth changes while project direction remains stable; re-enters at Requirements and flows through Design, Code, and Evidence
- `design_reframe`: realization structure changes while active intent and requirement truth remain stable; re-enters at Design and flows through Code and Evidence
- `realization_refactor`: local code, configuration, or attribute change with no intended constitutional or structural change; re-enters at the realized surface only and must prove no upstream drift

Smaller changes may re-enter below Goals only if they explicitly assert that no
upstream constitutional surface is changing.

The absence of a declared change class is process drift.

### Computed Classification And Treatment

Intake supplies one reusable classification result rather than requiring each
role to reconstruct the same facts. `C` denotes reproducible facts and declared
rule application; `J` denotes residual semantic or materiality judgment; `O`
denotes a ruling reserved to its actual owner. These annotations grant no
authority and introduce no calculus kind, runtime, classifier interface, or
mandatory document.

The explicitly selected source, worksite, or qualification capability produces
C over the exact request and desired outcome, known targets and effects,
operation grant and work lifetime, Product Definition and governing basis,
baseline and available candidate, declared relations, accepted design and
trace bindings, evidence, and applicable rules. Its output identifies the
producer and procedure revision, inputs, result, scope, source routes,
reproduction relation, unknowns and invalidators. Missing candidate or evidence
is an input state, not a claim that nothing changed.

The computed result must expose:

1. **Authority traversal.** Follow explicit source, ownership, dependency,
   composition and projection declarations from the affected targets and
   effects. Identify each reached layer and owner, its exact basis and
   changed/unchanged/unknown relation, the traversed edges, and the unresolved
   frontier. Include root, authority and grant changes even when Public bytes
   are equal. An absent edge does not prove irrelevance; undeclared or
   semantically uncertain materiality remains J.
2. **Public delta.** Enumerate the complete relevant serialized member universe
   under its owning declaration and applicable projection, including helper and
   generated dependencies. Report added and removed identities and every
   retained member with changed typed value or bytes, with exact before/after
   values. A rename is removal plus addition unless its owner supplies an
   identity-preserving relation. Missing candidate, incomplete enumeration,
   ambiguous identity or unavailable projection leaves the affected delta
   unknown; membership equality alone proves no value equality.
3. **Accepted-design coverage.** Join changed bytes and relations to explicit
   accepted scope, traces and acceptance evidence. Distinguish covered,
   missing, stale, ambiguous and outside-scope evidence. A filename, listed
   artifact or digest alone establishes no accepted coverage. Current trace
   coverage is a computed fact; residual semantic sufficiency remains J.
4. **Rule-determined treatment.** Apply only declared rules with sufficient
   input facts, recording their owners, matched predicates and consequences.
   Expose the smallest lawful re-entry, next action, applicable evidence or
   assessment, reserved ruling and carrier lifetime, with any conflict or
   missing premise still unresolved. A label or filename cannot select the
   route. When rules settle the question, invent no residual judgment.

A Public delta or other nonconformance does not itself require changing the
governing contract. If that contract remains sufficient for the authorized
outcome, reject or locally repair the candidate within its grant. Re-enter
the actual governing owner when the explicitly selected desired outcome
requires changed meaning or an applicable assessment establishes governing
insufficiency. C determines that consequence only from sufficient declared
premises; unresolved intended meaning or necessity is J and any reserved
decision remains O. Candidate behavior cannot author its own target law.

Unknown treatment withholds dependent reliance or promotion, not unrelated
authorized work. An existing bounded construction or evidence grant may permit
the cheapest useful discriminator, including obtaining the first candidate,
without asserting that the candidate is conformant. It carries its own exact subject,
territory, operations and stop conditions. Update the affected C result before
dependent effects or promotion rely on newly available evidence. Correct a
mistaken route at its smallest affected owner; preserve the original cause,
attempted subject, observed effect state and valid progress. Retry requires
the applicable outcome, authority and safe-recovery conditions; an unknown
effect state cannot be silently treated as no effect.

A new role, conversation or resumption reuses valid C after checking exact
applicability. Changed request, candidate, basis, owner/root relation,
projection, design trace/acceptance, rule, configuration or material evidence
invalidates its affected claims before reliance. Preserve predecessor and
successor identities, changed inputs, surviving facts and affected J
dependencies; recompute the wider frontier where independence is unproved.
`TICKET_METHOD.md` owns the existing carrier and recorded-J/O continuity rules.

---

## Consistency Gate Rule

No gate may close while the affected active surfaces are internally inconsistent.

For the declared change span, the framework must prove:

- the upstream surface remains sufficient for the downstream surface
- downstream artifacts do not contradict active upstream truth
- tests and qualification prove the active intended behavior rather than stale precedent

If that proof is missing, the change remains open even if one local artifact already looks correct.

Closure requires every applicable declared obligation satisfied by valid,
applicable evidence and every required judgment or ruling, with no active
non-closure condition. `TICKET_METHOD.md` owns work-state recording and reuse.
A review event, passing aggregate, completed artifact or status change cannot
substitute for that conjunction.

When a code/test mismatch appears during ticketed work, implementation behavior
is evidence but not authority. The mismatch is reconciled through the admitted
ticket, its intake triage, its lawful re-entry point, and the governing
requirement, design, module, graph, carrier, or closure surface. `TICKET_METHOD.md`
defines the ticket-local test-case authority rule.

---

## Product Outcome Conservation (`STDO-UP-013`)

Every Product-outcome-bearing work wave identifies one explicitly selected,
unresolved, directly verifiable Product-defined outcome and declares the
acceptance interval for that instance. Product-progress claims and promotion
onto the supported Product path are judged against that same outcome.

Evidence distinguishes material advance, prerequisite readiness, preservation,
and regression. Only material advance projects Product progress. Prerequisite
work names the Product obligation it enables and remains bounded. Preservation
is useful evidence but is not progress.

The exact bound outcome instance stops selecting later Product-progress work
when the owning authority accepts it. Its witnesses remain regression and
preservation evidence. Acceptance exhausts only that instance and its declared
acceptance interval. It does not discharge an enduring guarantee, recurring
obligation, or broader Product family beyond the accepted instance. Further
work against the accepted instance is preservation, a named bounded
prerequisite for another admitted outcome, or a new change requiring lawful
repricing; it is not additional progress against the accepted instance.

Selecting the next unresolved outcome already defined by Product is a Goals and
work-sequencing decision. Changing an outcome's meaning or scope, or introducing
a new Product outcome, requires lawful re-entry at Product.

Evidence evaluates and constrains its bound Product claim. Completion of a
proof surface, matrix, coverage ledger, inventory, design-method artifact, test
suite, or other evidence surface cannot by itself select, enlarge, or replace
the Product outcome. If an assurance capability is explicitly defined as
Product behavior, delivery of that capability is judged as Product progress;
its evidence still does not author the claim. The same artifact may be Product
output for one claim and evidence for another only when those roles are
declared separately.

Within a Product-outcome-bearing work wave, material realization growth derives
authority from the selected unresolved Product outcome, an admitted named
bounded prerequisite to it, or an admitted named bounded experiment whose
stated observation discriminates a stated decision for it. A prerequisite or
experiment authorizes only its declared provisional bound. It does not select
or enlarge the Product outcome, authorize downstream work, confer promotion or
closure, or waive applicable Prime, design, safety, authority, or release law.

Admission or renewal of a prerequisite or experiment belongs to the authority
owning the selected work wave, or its explicitly bounded proxy, and is recorded
in the existing durable Goals or ticket authority. The admitted basis states
its provisional bound and exhaustion or falsification condition. Satisfaction
of an experiment's stated decision-discriminating observation exhausts that
experiment. Drafting or validating a ticket or execution contract, retaining
active status, or holding a prior admission cannot create, extend, or renew the
basis.

Acceptance of the selected outcome, discharge of an admitted prerequisite, or
resolution of an admitted experiment's stated decision exhausts that basis. A
basis or bound also ends when another admitted terminal condition is reached or
it is rejected, withdrawn, superseded, repriced away, or falsified by evidence.
Ended authority cannot be renewed by repair, continuation, evidence, active
ticket or run state, or prior admission; further material work requires a new
admission by the owning authority or its explicitly bounded proxy.

Retention as supported Product behavior, required evidence, regression
protection, or bounded donor material does not confer further growth authority.
Consumers own deletion, archival, quarantine, and salvage mechanics. Salvage
carries only the explicitly re-adopted semantics; it does not inherit the
enclosing work's authority, dependencies, completion claim, or power to select
further work.

A regression or unresolved gap blocks further promotion on the affected path
until repaired, repriced, or accepted by the owning authority. It does not
globally serialize independent work. Parallel work may proceed under its own
admitted basis but cannot be laundered into the governed outcome's progress
claim.

Outcome success is necessary delivery evidence, not complete Product or release
closure.

## Proportional Method And Delivery (`STDO-UP-014`)

Proportionality is the relation between semantic ambiguity removed and
effective reasoning complexity introduced. A method obligation is proportional
when its contraction of the admissible interpretation space justifies the
additional concepts, relations, projections, and evidence that an agent must
hold together to reach a correct decision.

Effective reasoning complexity includes independent concepts and authority
surfaces, cross-document joins, exceptions and branching, states and
transitions, duplicated representations requiring reconciliation, and the
detail required to decide the governed question. It is not raw line count,
artifact count, or context-window size. Detailed algebra, Ontology, IACS,
Prime, or semantic views may be highly proportional when they eliminate rival
interpretations. A short additional ticket, receipt, or summary may be
disproportionate when it creates another truth surface without reducing
uncertainty.

A proportional method deliberately constrains the admissible reasoning and
realization space. Each constraint must identify the semantic ambiguity it
removes and must contract enough of the admissible interpretation space to
justify the reasoning complexity it introduces. Rival authority, uncertainty
over failure classification, and evidence uncertainty count only where they
leave materially distinct admissible semantic, authority, outcome, or
acceptance interpretations. They measure or evidence the same interpretation
space removed; they are not independent proportional benefits.

The method does not prescribe an internal decomposition, search,
collaboration, tool, or synthesis procedure when variation in that procedure
cannot affect a governed semantic, authority, evidence, safety, or release
property. Increased agent capability may enlarge the bounded relation an agent
can resolve; it does not grant authority, weaken an invariant, or waive
acceptance.

The owning law may justify one coherent constraint family once. This does not
require a rationale field, receipt, or repeated audit for every clause or
consumer application.

For symbolic design, materially divergent implementation paths, runtime states,
tests, reviews, and reconciliation joins are counterfactual evidence of the
semantic alternatives that the design contracts. They are not an independent
numerator. When one bounded symbolic model can resolve those material
alternatives within effective reasoning capacity, resolving it at design
altitude is proportional even when the model is detailed. A prior design
surface that removes no material semantic alternative remains
disproportionate.

A method addition is disproportionate when it duplicates truth, increases
reconciliation paths, or expands the bounded reasoning surface without
materially reducing ambiguity. Existing obligations should absorb new detail
where they can do so without weakening ownership or meaning.

Delivery priority applies the same relation to the current Product outcome,
likelihood, impact, reversibility, dependency, and cost of delayed Product
feedback. Probability informs lawful priority; it does not waive authority,
integrity, safety, retained release claims, or another hard stop.

The default priority is work that exposes or advances the smallest supported
Product path and its highest-value likely failures. Defensive or prerequisite
work that displaces that path identifies the affected claim, evidence basis,
bounded effort, return condition, and expected Product consequence. This is a
priority relation, not a fixed global execution sequence or scheduling runtime.

---

## Agentic Construction Execution (`STDO-UP-020`)

When construction is delegated to a probabilistic or agentic worker, the
method governs the execution relation without prescribing the worker's model,
prompt, tools, internal search, process topology, repository layout, or
orchestration runtime.

The normative relation is:

```text
accepted governing basis
  -> bounded affected relation set
  -> selected computational relations
  -> delegated execution and decision authority
  -> construction and self-review
  -> independent live-surface assessment where required
  -> accept | local repair | re-enter | reject
  -> exact accepted checkpoint
  -> next already-authorized bounded action
```

### Sufficient Execution Intake

A bounded action begins from an authority basis sufficient to reconstruct its
governing relations without conversation history, commentary, prior-worker
memory, or implementation folklore. The intake identifies:

- the selected Product outcome, prerequisite, or admitted experiment;
- the bounded affected relation set and applicable governing invariants;
- accepted transformation-admission relations;
- selected computational or common-library dispositions;
- construction and assessment authority; and
- the conditions that require upstream re-entry.

Where `DESIGN_MODULE_METHOD.md` applies, `STDO-UP-017` bounded-frame
conservation, `STDO-UP-016` transformation-admission completeness,
`STDO-UP-018` invariant-reconstruction sufficiency, and `STDO-UP-019`
computational-realization projection supply these design inputs. This section
consumes those laws; it does not create a second design package.

### Bounded Causal Construction

The execution unit is the smallest coherent causal dependency cone capable of
delivering working behavior while preserving every affected governing
relation. It need not coincide with one function, file, module, ticket field,
or design document.

A seam whose far side can causally affect, or be affected by, the action is
inside the cone unless the basis establishes that it cannot participate.
Unrelated incompleteness outside the cone is recorded as repricing input and
does not block the bounded claim.

### Construction, Assessment, And Delegation

The constructor owns bounded implementation and self-review. Where independent
assessment supports promotion, the assessor evaluates the exact live code,
authority paths, proof, and installed subject rather than treating the
constructor's summary as sufficient evidence. This preserves the independent-
review relation; it does not prescribe an actor count. One actor may occupy
different roles across different claims when independence for the assessed
claim is preserved.

The governing authority relation declares whether a bounded proxy may accept
and advance routine actions. A proxy may accept preservation, require local
repair, reject a violating candidate, and advance to the next already-
authorized action. It cannot change Product meaning, requirements, governing
authority, or accepted design. Such a change re-enters at its owning relation.

Human ceremony is not required at every transition when the governing basis,
affected cone, decision envelope, and re-entry conditions are already
accepted. This delegation does not weaken direct-human acceptance where
Product or release law requires it.

When one capable context has sufficient existing work authority, exact intake
and operation grant, it may enter directly as constructor or Writer. No
Executive activation is required solely to appoint that Writer. The applicable
frame configuration selects coordination when material contexts, authority,
capability or required independence need it; a role or frame name alone does
not create that need. Direct entry preserves execution-contract admission,
the smallest lawful carrier, required assessment and reserved decisions. It
permits bounded work and condition-based result recording, not self-acceptance
at a boundary owned elsewhere.

### Proportional Disposition

Assessment returns one of these semantic dispositions:

| Disposition | Condition |
|---|---|
| `accept` | the candidate closes its declared cone and preserves every affected governing relation |
| `local_repair` | implementation or proof is locally defective while the governing relation remains coherent |
| `re_enter` | Product, requirement, identity, lifecycle, authority, public contract, or accepted design must change |
| `reject` | the candidate violates a governing relation or leaves an undisposed competing truth path |

Global correctness means conserving every global relation affected by the
bounded action. It does not require proving the whole Product inside every
local action.

Repeated rejection against one unchanged boundary requires reassessment of the
frame altitude, causal cone, common components, design-versus-code placement,
and authority sufficiency. The method sets no rejection-count threshold,
mandatory review-round count, or review state machine; it prohibits repeating
an unchanged failed construction relation as if iteration alone could close it.

### Transition Evidence And Proof Cadence

A reviewable transition identifies the exact candidate, affected relations,
changed realization paths, authority paths added or removed, retained and open
seams, focused proof, any required integration proof, explicit non-changes, and
the assessor disposition. Consumers choose the representation. Transition
evidence is a read model and does not become specification, design, or
admission authority.

Construction uses the cheapest focused proof capable of falsifying the active
relation. Expensive whole-candidate qualification occurs at a declared
candidate boundary rather than after every local edit, unless the affected
risk makes whole-candidate proof necessary.

A durable or reconstructable authority claim is not established solely by a
same-process proof when loss of incidental process state is a material
counterexample. Proof must destroy or exclude the incidental authority and
compare reconstructed semantic outcomes.

### Checkpoint, Continuation, Progress, And Churn

Acceptance binds one exact checkpoint. The next already-authorized bounded
action may begin without renewed human approval; acceptance does not widen the
Product outcome or affected relation set.

Accepted material Product movement is progress. Prerequisite work names the
Product obligation it enables. Preservation and repeated proof are evidence,
not new progress. Rejected or superseded construction is churn. Discovery of
previously hidden distance revises the forecast but is not itself negative
implementation progress. Paperwork, code volume, test count, commit count, and
review count are not Product progress by themselves.

These are semantic categories, not a numeric progress algorithm. Consumers may
derive their own progress and churn projections from them.

This protocol is false if execution proceeds from unreconstructable context,
if a constructor's report substitutes for required independent live evidence,
if a bounded proxy changes a governing relation outside its delegation, if
unrelated incompleteness blocks a closed causal cone, if a same-process test is
used to prove materially cross-process authority, or if rejected activity is
reported as accepted Product progress.

---

## Complete Enclosing-Relation Admission (`STDO-UP-021`)

For a material transition, each admission owner independently derives the
complete enclosing relation from authoritative inputs. The relation contains
every participant and equality join whose identity, validity, authority,
currentness, or transition can affect or be affected by admission; each
crossing seam includes its relevant far side or authoritatively establishes
that the far side cannot participate. Caller or owner assertions of
completeness, validity, prior admission, or authority do not establish truth.

Derivation and validation bind one exact admission-valid authoritative basis
identity through admission. If validity or currentness can advance after
preflight, admission remains conditional on the declared predecessor and
currentness law for that basis or re-enters derivation and validation without
effect. Participating owners bind an equal basis or a design-declared coherent
composite basis; independently valid mixed-basis judgments cannot combine.

Every participant and join is validated before any transition effect. Internal
evaluation order is implementation-owned, but no participant subset or nested
constituent becomes admitted truth. Admission is one semantic commit of the
complete transition, bound to its exact basis identity; failure or interruption
admits the complete transition or none, never a subset. No realization
mechanism or participant count is prescribed.

Direct and every supported composite or nested boundary preserve this law. A
partial result cannot substitute for an owner's derivation and validation, and
a competing same-scope path cannot establish the transition outside the
governing admission relation. Fresh reconstruction and replay over the same
basis reproduce the enclosing relation, basis identity, and complete outcome
or refusal exactly at semantic altitude.

This law is false if completeness is asserted rather than derived; a relevant
participant, join, or seam is omitted; validation and admission use an
unidentified, stale, or incoherently mixed basis; currentness can advance
without a commit condition or effect-free re-entry; any effect precedes
complete validation; failure or interruption exposes a subset; fresh
reconstruction differs; or competing same-scope authority remains.

### Standing Structural Qualification

Qualification is instantiated for every admission owner and supported boundary
declared by accepted design:

| Form | Required observation |
|---|---|
| direct | the complete direct relation is derived, validated, and admitted once |
| supported composite / nested | every supported constituent and owning boundary satisfies the same law; unsupported forms have a design-grounded `not_applicable` disposition and no weaker or competing path |
| forged | forged identity, membership, equality, or authority is refused without effect |
| ambiguous enclosing relation | unresolved participant, join, seam, or relation identity ambiguity is refused without effect |
| stale / advanced basis | stale input is refused, and basis advancement between preflight and admission causes effect-free re-entry rather than mixed-basis admission |
| incoherent multi-owner basis | owner judgments on bases that are neither equal nor joined by a design-declared coherent composite basis cannot combine and are refused without effect |
| competing same-scope admission authority | an undisposed competing same-scope path cannot establish the transition |
| reconstructed / fresh-process | the same basis reconstructs the same relation, basis identity, and outcome or refusal |
| exact replay equality | replay over the same basis reproduces exactly the enclosing relation, basis identity, and complete outcome or refusal |
| atomic publication failure | after validation succeeds, failure or interruption is observed at every materially distinct commit or publication boundary capable of exposing a subset and followed by fresh reconstruction showing the complete transition or none; named representative observations suffice only under a design-declared dominance/equivalence proof covering the complete partial-failure surface |

For an indivisible commit unit, the atomic test establishes that boundary and
observes failure immediately on both sides. Final-participant validation
failure does not substitute for post-validation atomic-failure evidence. A
standing claim is false if an owner or supported boundary is omitted, a
materially distinct partial-failure boundary lacks an observation or declared
coverage proof, a case uses a weaker helper or manufactured refusal, or fresh
reconstruction does not compare the complete semantic result.

---

## Core Interface Migration Rule

Core interface changes are not ordinary local patches.

Where a change alters a load-bearing contract, carrier, resolver, provider,
projection law, closure law, or other shared interface that multiple surfaces
depend on, the work must be handled as a constitutional migration rather than
as incremental patching.

The governing rule is:

- change the authoritative core contract first
- ban bridge code for that contract family as an authoritative surface
- audit every producer and every consumer of the impacted interface
- migrate each producer and consumer to the new contract
- chase every downstream effect until no superseded closure law remains
- run complete migration-closure proof only after the migration wave is
  complete; bounded Product-slice proof remains governed by the path-relative
  promotion rule below

This rule exists because partial interface migration creates recurring drift:

- one producer writes the new contract while another still writes the old one
- runtime reads one carrier while reporting or topology reads another
- compatibility aliases silently remain authoritative
- projections become a second truth surface
- tests go green while architecture remains split

Spec-driven development forbids declaring such a state complete.

### Constitutional Migration Options

Core interface and major implementation replacement work has two lawful
constitutional strategies:

- **Inside-Out Hard-Break Migration**: use this when the project remains on the
  same implementation line and the authoritative source truth is being replaced
  in place. The work proceeds from source carrier outward through a sequence of
  deliberate breaks and repairs.
- **Fundamental Re-Adoption Migration**: use this when the rewrite is major and
  the project is intentionally re-deriving itself on a materially different
  implementation basis, such as a new runtime model, carrier model, type
  system, execution substrate, or realization tree. The prior implementation is
  moved sideways and treated as reference material, not live authority.

Where bounded evolution and fundamental re-adoption are both lawful and
feasible, and a working predecessor can reach the admitted Product outcome
without retaining competing or ambiguous authority, evolution on the supported
Product path is the rebuttable selection presumption. This does not require
continuing an unsafe or constitutionally inadmissible predecessor path. It
conserves accepted predecessor semantics and Product feedback; it does not
require preserving an internal implementation or public mechanism that Product
authority explicitly supersedes.

When bounded evolution includes a core-interface migration, it uses the
Inside-Out Hard-Break strategy. Bounded evolution is a strategy-selection
presumption, not a third migration strategy.

Fundamental re-adoption requires explicit selection by the human authority
owning the affected Product boundary. The selection compares re-adoption with
bounded evolution across Product value, feedback latency, authority risk,
reversibility, total cost, and retained predecessor semantics. It also states a
bounded abort or re-entry condition. Implementation scale or architectural
preference alone does not select re-adoption.

Both strategies share these non-negotiable rules:

- no proxy interface partial implementation may stand in for the new contract in
  any acceptance path
- no bridge or fallback path may remain silently authoritative
- promotion of an affected Product outcome requires one unambiguous
  authoritative path for that outcome
- competing or ambiguous executable authority on the promoted acceptance path
  blocks that outcome
- residual material from the superseded interface family outside the promoted
  path may be deferred only when it is explicitly non-authoritative for the
  promoted outcome or governs an explicitly specified, disjoint Product or
  compatibility scope with deterministic routing, cannot falsify current or
  retained Product claims, and retains a bounded migration, qualification, or
  release disposition
- tests are leak detectors and proof surfaces, not the migration plan

For this rule, the affected acceptance path is the full causal closure of the
outcome: every admitted entrypoint, producer, consumer, resolver, fallback,
shared state surface, event, projection, and proof surface capable of changing,
interpreting, or closing the outcome. Singular authority means one governing
authority across that closure, not one selected successful trace. If the same
request, fact, identity, state, or projection is admissible to old and new
authority, authority is competing and promotion blocks.

Product-slice promotion and complete migration closure are distinct claims. An
intermediate Product outcome may be promoted while its enclosing migration
remains open only when the outcome's acceptance path has singular authority and
the residual implementation satisfies the deferment rule above. That promotion
does not close the migration or waive its final retirement criteria. The
slice's identity and acceptance criteria derive from Product plus every causally
applicable live requirement, accepted design relation, and retained predecessor
claim. Ticket or review wording cannot narrow that authority away.

Active migration status does not renew an accepted slice's exhausted growth
authority. Work that only discharges already admitted removal, demotion, and
migration-closure proof obligations may continue within that existing bound
without claiming further Product progress. Further material producer or
consumer growth requires another still-live basis admitted under
`STDO-UP-013`; ticket activity alone is not that basis.

### What Counts As A Core Interface

A core interface includes any shared contract or carrier that materially governs:

- runtime closure
- reporting or status truth
- topology or frame progression
- proof or qualification outcome
- event or projection semantics
- identity or binding resolution
- provider or resolver behavior

If changing the interface can alter how multiple surfaces decide "what is true
now," it is a core interface change.

### Required Migration Protocol

Every core interface migration must explicitly declare:

1. the exact affected migration scope
2. every explicitly excluded or disjoint Product or compatibility scope and its
   deterministic routing relation
3. the new authoritative contract
4. the superseded contract or surface
5. the authoritative closure law for the new contract
6. the full set of producers of the old and new contract
7. the full set of consumers of the old and new contract
8. every projection, report, status surface, and proof surface that derives from it

Every old path must then be classified as one of:

- `remove`
- `replace`
- `re-authorize`
- `temporary scaffolding`

Temporary scaffolding is lawful only if it is explicitly non-authoritative and
scheduled for removal before closure.

### Bridge Prohibition

For a core interface migration:

- no compatibility alias may remain authoritative
- no fallback identity law may remain as silent runtime behavior
- no bridge path may participate in acceptance as if it were the new contract
- no old reader or writer may remain authoritative for the promoted outcome
  once the new contract governs that outcome
- no proxy or partial implementation of the new interface may stand between old
  and new truth as if it were completion

The only lawful exception is an explicit compatibility feature retained as part
of the live product. In that case the compatibility path must be:

- intentionally specified
- explicitly bounded
- clearly identified as compatibility rather than current native truth

### Projection Discipline

Projections, reports, status views, and topology views may reflect the
authoritative carrier.

They must not become a second closure surface.

Therefore:

- if runtime, reporting, topology, and proof can disagree about closure because
  they consume different carriers or different closure laws, the migration is
  incomplete
- if a projection can independently close while the authoritative carrier is
  still open, the migration is incomplete
- if the authoritative carrier can close while a projection still depends on an
  older law, the migration is incomplete

### Inside-Out First Sequencing

Inside-out hard-break migrations must proceed from the new authoritative source
carrier outward.

Therefore:

- the full best-guess interface family must be discovered before proof is used
  as closure evidence, including producers, consumers, projections, prompts,
  reports, wrappers, replay paths, ingest paths, bootstrap paths, and proof
  surfaces
- authoritative producer and source-carrier work comes before downstream
  consumer, projection, prompt, dossier, report, or review-surface hardening
- downstream exploration may exist only as isolated non-authoritative work; it
  must not land in public runtime, projection, prompt, report, or proof entry
  points until the source carrier is published and admitted
- a downstream projection ticket must not close while the source-carrier ticket
  it depends on is still open
- dependency direction must reflect this order explicitly so the ticket set
  exposes the migration wave from source truth to downstream read models

### Hard-Break Discipline

Inside-out migration is a hard-break sequence over one interface family.

The migration wave is the ordered set of those breaks. It is not a separate mode
that permits competing or ambiguous dual truth over the same request, fact,
identity, state, or projection. Explicitly specified, deterministically routed,
non-overlapping Product or compatibility scopes may coexist while the enclosing
migration remains open.

For each break:

1. publish or admit the new deepest authoritative source carrier
2. deliberately sever one old authoritative seam
3. keep that seam broken
4. repair outward from source truth to consumers, then projections, then
   prompts/reports, then proof surfaces
5. run negative proof that the severed seam is rejected rather than merely
   unused

During this sequence:

- tests may discover missed interfaces, but they do not replace the required
  interface inventory
- newly discovered affected interfaces remain part of the same migration wave
  unless the work is explicitly repriced upward
- re-enabling the old seam through wrappers, fallbacks, projections, or prompt
  paths is a migration defect

### Proof-Last Rule For Core Interface Changes

Complete migration-closure proof is not valid while producers and consumers
are split across old and new contracts. Bounded Product-slice proof may establish
only the exact intermediate outcome permitted by the path-relative promotion
rule; it cannot establish migration closure.

Therefore:

- tests that pass only because bridge-state semantics remain alive do not count
  as closure proof
- green local tests do not overrule a split architecture
- migration-closure proof belongs after migration, not during a partially
  migrated state
- per-break proof must show the severed old seam is rejected or fails closed
  before downstream hardening can count as progress

### Closure Criterion

A core interface migration is complete across its declared affected scope only
when all of the following are true:

- every authoritative producer writes the new contract
- every authoritative consumer reads the new contract
- all superseded authoritative paths are removed or explicitly re-authorized
- projections are downstream of the same authoritative truth rather than acting
  as competing truth surfaces
- runtime, reporting, topology, and proof share one closure law
- no temporary scaffolding remains in the acceptance path

Until those conditions hold, the work remains an active migration wave rather
than a completed refactor.

An accepted intermediate Product slice within that wave must therefore name the
slice it closes and keep the enclosing migration visibly open. It must not
project slice acceptance as migration, qualification, or release closure.

---

## Release Version Boundary

The only exact operative release identifier is the immutable RC cut tag
`v<version>-rc.<n>`.

That cut is:

- a point-in-time release identity
- a boundary over the feature set accepted for that cut
- part of release metadata and release-process evaluation

It is not part of the live project specification.

The mutable `v<version>` tag is a version-line discovery selector to the
highest-ordinal published immutable RC. It is not an exact dependency,
evidence, or constitutional basis and cannot silently change a consumer
selection.

Active constitutional and shared realization surfaces should therefore describe
current truth by role, boundary, and status rather than by release-line version
labels.

Release criteria, immutable RC publication, selector advancement, and the
process for cutting a release belong to `RELEASE_METHOD.md`.

---

## Evidence Rules

The following rules govern how constitutional claims are proved in practice.

### Proof Target Identity And Adequacy (`STDO-UP-001`)

Every load-bearing proof identifies the exact subject, intended property,
governing basis, relation between witness and claim, nearest weaker excluded
property, and falsification condition before selecting its witness. Without
those relations, the result is evidence discovery rather than closure-grade
proof.

Packaging, syntax, compilation, file presence, invocation, or local behavior
must not substitute for semantic, authority-bearing, installed, release, or
end-to-end proof merely because the weaker property is easier to measure.

### Semantic, Evidence, And Projection Separation (`STDO-UP-008`)

The method distinguishes:

- **semantic basis**: constitutional and accepted-design relations defining
  what a claim means;
- **evidence basis**: exact artifacts, events, logs, tests, and observations
  used to evaluate it; and
- **state projection**: a current view derived from admitted semantic and
  evidence bases.

Evidence change may invalidate a verdict without changing law. Projection
change may invalidate a view without changing semantic truth. Semantic change
requires lawful re-entry and invalidates affected downstream acceptance. A
broad digest may conservatively invalidate review, but it does not prove that
every semantic relation changed.

### Assurance-Boundary Congruence And Method Qualification (`STDO-UP-022`)

A checker, validator, harness, reviewer, or other assurance surface supporting
promotion or closure binds the exact claimed subject and its authoritative
composition relation. Evidence over one file or carrier proves only that
boundary; it cannot establish a multi-file or carrier-set claim. Cross-carrier
satisfaction and conflict are decided at the declared composite boundary.

A claim of mechanical enforcement names an executable or reproducible predicate
and a witness reachable through the declared ordinary assurance path. A planned
or specification-only harness is planned evidence, not observed verification.
Until both the predicate and such a witness are observed, the claim remains
open or is explicitly downgraded to the planned property.

A claim's quantifier, population, and scope cannot exceed its evaluated
evidence. Generalizing a local defect requires a declared inference relation,
the relevant comparable population, explicit counterexample treatment, and
governing evidence. Later counterevidence invalidates every dependent verdict
until the claim-evidence relation is superseded, withdrawn, or requalified.

Qualification of generic method sufficiency consumes the Probabilistic Work
Boundary, the `STDO-UP-020` construction/assessment relation, and the
Reconstruction Litmus; it does not create a second process. A fresh competent
constructor operates inside a declared capability, context, and configuration
envelope using only the declared ordinary method and authority surfaces. An
independently authorized evaluator has a declared governing basis and comparison
predicate. Material expected or reference outcomes, source exemplars or
incumbent realizations, author memory, and ad hoc rescue are withheld from the
constructor until its construction result is frozen wherever earlier exposure
would compromise reconstructive independence.

After freeze, the evaluator compares the frozen result against the mandatory
governing semantic basis for semantic conformance or equivalence. Any separately
held material expected or reference outcome, if one exists and is applicable,
is optional evidence and explicitly non-authoritative. Semantic equivalence to
that reference is required only where the governing basis requires it. A lawful
alternative construction permitted by the basis passes. Subjective similarity
to the basis or reference is insufficient to establish semantic conformance or
equivalence. Byte or structural identity, unique derivation, determinism, and
incumbent equality are not generic comparison criteria. A construction outside
the declared competence or configuration envelope cannot indict generic method
sufficiency.

Any post-exposure revision is a declared intervention and is either a method
constituent with its qualification boundary or a new qualification subject. It
cannot retroactively make the original frozen construction pass. This law
prescribes no actor type or count, review-round count, engine, prompt, or
orchestration.

This law is false if:

- assurance observes a weaker or different subject, or per-carrier evidence is
  used to close an unevaluated composite claim;
- mechanical enforcement lacks its predicate or a witness reachable through the
  declared ordinary assurance path, or planned evidence is reported as observed
  verification;
- a verdict outruns its evaluated population or declared inference relation, or
  dependent verdicts survive material counterevidence without requalification;
- constructor competence or its capability, context, or configuration envelope,
  or evaluator authority, governing basis, or comparison predicate, is
  undeclared, or an out-of-envelope construction is used to indict the method;
- the constructor uses supplemental method or authority input that is not
  declared;
- a material expected or reference outcome, source exemplar or incumbent
  realization, author memory, or ad hoc rescue is exposed to the constructor
  before freeze where that exposure compromises reconstructive independence;
- comparison omits the mandatory governing semantic basis, proceeds under
  constructor authority instead of independently authorized evaluator authority,
  or is self-adjusted after seeing the result;
- a reference outcome is used as authority, reference equivalence is required
  where the governing basis does not require it, basis-required reference
  equivalence is omitted, subjective similarity is used as proof, or identity,
  unique derivation, determinism, or incumbent equality substitutes for semantic
  conformance or equivalence; or
- a post-exposure revision is unclassified or is used to make the original
  frozen construction pass retroactively.

## Verification Layers

Each layer in the chain preserves a distinct kind of truth:

| Layer | What it preserves | Primary question answered |
|-------|-------------------|---------------------------|
| **Requirements** | Invariant truth | "What must be true?" |
| **Design** | Structural choice | "How is that truth realized?" |
| **Scenarios** | Operational meaning | "Can the realized system actually do the claimed thing?" |

Without scenarios, important capabilities can appear "covered" because the words exist in requirements and design. Scenarios force the sharper question: can the product *really* do the thing? A requirement can say "compositional graphs" and a design ADR can describe Fragment types, but only a scenario asks "can I model a reusable discovery workflow and apply it twice?"

Scenarios are the product-owner layer. They are concrete, end-to-end use cases that validate the chain from intent to realized behavior. When a scenario cannot be written, the capability is not yet real. When a scenario fails, the gap is between the system's actual behavior and its claimed capability — not between the spec's words and the spec's other words.

Scenarios do not replace requirement categories. They primarily validate capability claims and other behavior with concrete operational meaning. Constraints, governance rules, and verification-infrastructure requirements may require different evidence in addition to, or instead of, end-to-end scenarios.

---

## Testing Strategy Taxonomy

`SPEC_METHOD.md` owns the product-assurance bounded context
`urn:stdo:bounded-context:product-assurance` under the selected complete STDO
basis. This section owns the Product-level test-authority taxonomy.
`DESIGN_MODULE_METHOD.md` retains ownership of module-derived unit-proof law;
the shared context does not merge those authority sources.

Every executable proof surface must declare its authority source.

For ticketed work, the immediate proof authority is the admitted ticket and its
triage path. Tests derive from the ticket's lawful re-entry point and the
governing constitutional or realization-law surfaces it cites; they do not
derive expected results from current implementation behavior.

Authority source is not the same thing as execution breadth. A test may be
small or broad, fast or slow, deterministic or live, but it still derives from
one of two primary authorities:

1. **Design/module conformance tests**
2. **UAT / acceptance tests**

Design/module conformance tests derive from realization authority:

- governing design
- module ownership
- IACS or equivalent carrier inventory
- structural carrier diagrams when present
- boundary-local fail-closed law

They answer:

- did the implementation realize the module or design boundary correctly?

Unit tests are design/module conformance tests. Module integration tests,
negative tests, and fail-closed tests may also be design/module conformance
tests when their proof target is a designed module boundary rather than a user
scenario.

UAT / acceptance tests derive from constitutional user or product authority:

- requirements
- acceptance criteria
- declared scenarios or use cases
- product-level release or qualification claims

They answer:

- does the composed product satisfy the claimed requirement or scenario?

Under this method, only sandbox tests or an explicitly equivalent isolated
composed-product proof lane may be called UAT / acceptance tests.

A sandbox test must exercise the deployed, installed, or otherwise runnable
product form through declared application, public, runtime, or control surfaces.
It must be driven by a requirement-sourced scenario or acceptance case. Direct
source-level unit tests, helper tests, and module integration tests may be
valuable proof, but they are not UAT and cannot close user acceptance by
themselves.

Sandbox UAT has two lawful execution modes:

- **Harnessed sandbox UAT**: exercises the full composed product path with a
  deterministic, fake, recorded, or injected worker/result surface.
- **Live sandbox UAT**: exercises the full composed product path with a real
  configured worker, tool, agent, service, or other external probabilistic
  transport where the product depends on that live boundary.

Harnessed sandbox UAT proves composition, orchestration, control, projection,
archive, and scenario wiring without relying on live probabilistic execution.
It is the right lane for deterministic reproducibility.

Live sandbox UAT proves that the same scenario can cross the real external
probabilistic boundary and return evidence through the declared result,
evaluation, provenance, and projection surfaces. Where a product or release
claim depends on live probabilistic compute, semantic green, unit green, module
integration green, and harnessed sandbox green are necessary but not sufficient
for live acceptance.

Terminology rules:

- `unit` names module/design conformance scope, not user acceptance.
- `integration` names execution breadth, not authority source.
- `sandbox` names composed-product acceptance execution.
- `harnessed`, `fake`, `recorded`, or `deterministic` name non-live sandbox
  execution.
- `live` is reserved for real external worker or transport execution. A status
  projection named "live" is not live UAT unless it crosses that real boundary.

If a project uses different local filenames or runner labels, the local test
surface must still map each executable lane back to this taxonomy before
claiming closure.

### Fixture And Proof Portability Rule

Required closure lanes must be reproducible from the declared source boundary.

A unit, semantic, or module-design conformance lane must not depend on an
undeclared local path, sibling workspace, operator home directory, or mutable
external fixture.

If a proof needs external project evidence, one of these must be true:

- a minimal fixture is checked into the source boundary
- a fixture manifest declares the external source, version, and acquisition or
  binding rule
- the test is classified as harnessed sandbox, live sandbox, reference
  comparison, or optional local evidence rather than required semantic closure

Missing external fixtures must fail with a governed diagnostic that names the
fixture authority and lane. They must not masquerade as product semantic failure.

---

## Test Authority Rule

Every live requirement must have written testcase authority.

That authority may include scenario bundles, ordered testcase sequences, negative
or control cases, and other explicit evidence cases as appropriate to the kind of
truth being proved, but it must exist in written form and be traceable.

No live requirement is considered fully proved if it relies only on informal
operator confidence, ambient habit, or an unlabeled test corpus.

---

## Scenario Bundle Rule

Features are not proved by isolated assertions alone.

Where a requirement claims meaningful system behavior, the proving surface should
be a scenario bundle or equivalent ordered set of testcases that exercises that
behavior through a coherent sequence rather than as disconnected fragments.

The purpose of the scenario bundle is to show:

- what feature or use-case boundary is being exercised
- which testcase sequence proves it
- what outcomes are expected at each significant step

This is the layer that makes operational meaning inspectable.

Declared scenarios and use cases are not downstream decoration. They put
pressure on feature intent and design decisions by forcing the project to name
the real operational boundary, sequence, actors, controls, and expected
outcomes that matter. For that reason, they are also the best source for
identifying the significant code and control paths that the proving surface must
exercise.

---

## Installed Dev Proof Rule

Where a system has an installable or runnable development form, the decisive
proving lane runs against an installed development version as if it were an
independent project or externalized target, not only against the source tree in
place.

That proof should prefer:

- fresh sandbox or equivalent isolated environment
- installed or built development artifact
- execution through the same declared entry/control/runtime surfaces the real
  product uses

Direct source-level or unit-level checks may remain useful, but they do not
replace installed-dev proof of the system under test.

---

## Significant Path Coverage Rule

The proving surface must declare and exercise the significant paths for the
behavior being claimed.

Exhaustive proof does not mean every possible branch in every file. It means the
project names the meaningful paths and proves them intentionally.

The significant paths usually include, where relevant:

- intended success path
- fail-closed or rejection path
- boundary or control path
- integration, dispatch, or transport path
- recovery, retry, or replay path

If the significant paths are not declared, scenario coverage cannot be judged.
If they are declared but not exercised, the behavior is not fully proved.

---

## Requirement Categories

Every live requirement family shall be categorized by what kind of truth it asserts. This prevents the common mistake of treating the entire requirement surface as if it were only a feature list.

| Category | Meaning | Typical question |
|----------|---------|------------------|
| **Capability** | A behavior, function, or surface the system must provide | "What can the system do?" |
| **Constraint / Guarantee** | An invariant, law, safety property, portability rule, or semantic guarantee that bounds how the system may behave | "What must always remain true?" |
| **Governance** | A policy or control rule over lifecycle, authority, visibility, release, or operator action | "What governs use and change?" |
| **Verification** | A requirement on tests, evidence, traceability, qualification, or forensic surfaces | "How do we know the claim is true?" |

Requirements remain part of the constitutional layer in all four cases. A category is not a priority label and not a claim that the requirement is user-facing. It is a statement of what kind of project truth the requirement owns.

The important distinction is:

- Requirements describe the full constitutional **what**.
- Design describes the structural **how**. ADRs are one durable design form.
- Scenarios validate the operational meaning of capability claims.

Therefore, not every requirement should be translated into a marketed "feature." Some requirements are better expressed as guarantees, constraints, governance rules, or verification obligations.

Requirements should also avoid freezing concrete realization choices prematurely. Unless a path, filename, or packaging rule is itself part of the constitutional truth, those choices belong to design rather than the requirement surface.

---

## Reconstruction Litmus

The methodology is specification-driven only if the layers are reconstructable in order:

1. Given **Goals**, a competent team should be able to derive a conformant **Intent** surface.
2. Given **Intent**, a competent team should be able to derive a conformant **Product** definition.
3. Given **Product**, a competent team should be able to derive conformant **Requirements**.
4. Given **Requirements**, a competent team should be able to derive a conformant **Design**.
5. Given **Requirements + Design**, a competent team should be able to derive conformant **Code**.

This does not mean the derivation is unique. Different designs may satisfy the same requirements, and different codebases may satisfy the same design. The test is sufficiency, not determinism.

Failures at any boundary indicate a specification defect:

- If intent cannot be derived from goals, the goals surface is unclear, contradictory, or not concrete enough to orient the next bounded wave of work.
- If product cannot be derived from intent, the intent surface is too vague, contradictory, or not concrete enough to guide realization.
- If requirements cannot be derived from product, the product surface is underspecified, contradictory, or not decomposable enough to govern implementation.
- If design cannot be derived from requirements, the requirement surface is underspecified, contradictory, or polluted with accidental implementation detail.
- If code cannot be derived from requirements plus design, the design surface is incomplete, ambiguous, or not operational enough.

The purpose of ADRs and design documents is therefore not decorative explanation. They are the load-bearing bridge between constitutional truth and executable realization.

Reconstruction sufficiency also depends on ambiguity governance. If a boundary
can be crossed only by hiding a major unresolved ambiguity, the upstream surface
is not yet sufficient even if some downstream artifact can be produced.

For an already accepted relation, reconstruction may reuse its exact current
basis and sufficient evidence after checking applicability and invalidation.
The claim determines the reconstruction span; a local selected function does
not require recreating the whole Product. New material counterexamples still
challenge the affected relation. `DESIGN_MODULE_METHOD.md` owns design-view
coverage, its material-change gate and unchanged-boundary reuse; this litmus
does not waive that gate or require recreating unchanged accepted views.

## Design Rule

Requirements state what control or delivery surfaces must exist.

Design decides the concrete mechanism that realizes them.

If a technology stack, carrier, or runtime is not already constrained by an
upstream constitutional surface, choosing it is part of design rather than a
separate upstream authority.

That boundary matters especially for agent-facing bootstrap and control surfaces:

- requirements may say that authoritative bootstrap or control surfaces must be present, carry bare axioms, and route to the canonical method
- design decides whether those surfaces are entry documents, embedded blocks, standalone compiled artifacts, or another lawful topology

If filenames and placement are hardcoded in requirements without constitutional necessity, the requirement surface has absorbed design detail and made re-derivation harder.

---

## Renewal Path

Intent is not only top-down. The full homeostatic cycle includes a reverse path where real use cases generate new intent:

```
Current spec → real-world use case → gap analysis → new goals / intent
```

This is how the system stays alive instead of becoming a frozen constitution. The generative rule:

1. A real use case (scenario, deployment, external review) hits the current model
2. Gap analysis identifies what the constitution cannot express
3. If the gap is constitutional (not just a missing implementation), new goals and/or intent are written
4. The repriced surface then flows forward through the chain: product → requirements → design → code

New intents emerge from repeated, real use-case pressure against the current model — not from abstract speculation. The gap must be concrete before it becomes intent. Ad hoc coding pressure does not generate intent; explicit gap analysis does.

This flow is not a one-pass waterfall computation. It is a cumulative iteration:

- requirements and design are refined over time
- code is repeatedly re-derived against the current constitutional surface
- gaps discovered during implementation, testing, replay, or scenario work feed back into repricing

What must remain stable is the full direction of authority: goals govern intent, intent governs product, product governs requirements, requirements govern design, and requirements plus design govern code, even when the project advances through many iterations.

---

## Trace Closure And Anti-Drift Rule

Spec-driven development requires constitutional trace closure.

### Ownership

- Every live requirement family must map to one or more owning design
  decisions.
- Every ADR or other design record must ground itself in requirements via an
  explicit `Implements:` line.

### Downstream Closure

- No live requirement may remain as a free-floating statement of intent. If it
  is live, it must either:
  - be realized through the downstream chain, or
  - be explicitly deferred with an honest surface that records the deferment.
- Every live requirement family must therefore have downstream closure:
  realized in design/code/tests, or explicitly deferred through an honest
  deferment surface.
- No shipping code or tests may exist as ungoverned behavior. If behavior
  exists, it must trace back out to live requirements and the design decisions
  that authorize it.
- No hidden product surface is allowed. Behavior without trace authority is
  accidental law even if it works.

### Drift Signals

- Unowned requirements, ungrounded design records, deferred requirements
  without explicit deferment, and code without trace authority are design
  drift.
- If an ADR or other design artifact has no requirement grounding, it is design
  without constitutional authority.
- If code behavior has no design owner, the design has already drifted.
- If shipping code or tests cannot trace back out to live requirement and
  design authority, they are ungoverned product surface.
- If tests validate implementation habit rather than requirement truth, they
  lock in drift.
- If events and projection reveal persistent delta, either code is wrong or the
  requirement/design stack is stale.
- If a capability has requirements and design but no scenario, its operational
  meaning is unverified.
- If a requirement is treated as a product feature when it is actually a
  guarantee, governance rule, or verification obligation, the requirement
  surface has been misclassified.
- If a live constitutional artifact is corrected by in-place mutation rather
  than supersession or withdrawal, constitutional history has been corrupted.
- If a real use case reveals a gap not expressible in current requirements, a
  new intent is needed, not a code hack.

Trace closure is stricter than documentation completeness. It is the rule that
closes the constitution over realized behavior.

---

## Live Surface Immutability

The project may accumulate multiple live domain surfaces over time. A live surface is versioned constitutional history, not scratch space.

- Engine code, design documents, tests, and tooling may be refactored aggressively while they remain mutable implementation surfaces.
- Live domain artifacts, once published as live constitutional surfaces, are immutable in place.
- If a live domain artifact is wrong, the valid actions are:
  - supersede it with a new version, or
  - withdraw/delete it from the live surface.
- Transitional implementation paths, migration scaffolds, and fallback behaviors have no permanent authority in the live surface. Once superseded, they are deleted unless explicitly retained as compatibility features.

The past is preserved by version control, operational event history where present, and superseded constitutional artifacts. Spec-driven development does not require shipping compatibility shims forever, but it also does not allow silent mutation of live constitutional history.

---

## Fundamental Migration Rule

A fundamental migration is a constitutional reset, not an in-place refactor.

This rule applies when a project intentionally abandons a prior constitutional shape and re-derives itself on a new branch, version line, or methodology basis.

In that case:

- inherited constitutional documents from the prior line become migration source material, not live authority in the new line
- it is lawful to zero inherited constitutional surfaces on the migration line and rebuild them from first principles
- nothing carries forward by default; every retained statement, requirement, design choice, or guide rule must be explicitly re-adopted
- every carry-forward is intentional and should land in the correct layer: goals, intent, product, requirements, design, guide, or template
- old design and code may be used as reference implementations, but they do not govern the new constitutional surface unless explicitly re-derived and re-adopted
- absence from the new constitutional surface means "not yet adopted" and carries no automatic authority from the prior line
- the prior implementation may be moved sideways as a reference line, but that
  sideways line has no live implementation authority in the new line
- every inherited module, interface, carrier, projection, and proof surface must
  be explicitly classified before reuse

The required implementation classifications are:

- `carry_across`: the module remains materially the same and is intentionally
  re-adopted into the new line
- `redundant`: the module is no longer needed in the new line
- `rewrite`: the module remains needed but must be rebuilt under the new
  requirements and design

Unclassified inherited implementation is a defect.

The purpose of this rule is to prevent accidental law from leaking through migration by mere inheritance. Fundamental migration is controlled adoption, not passive preservation.

When performing a fundamental migration:

1. Declare the migration line and treat the prior line as source material.
2. Establish fresh constitutional surfaces for method, goals, intent, product, requirements, and design.
3. Move the prior implementation sideways if needed so it cannot continue as ambient live authority.
4. Classify inherited constitutional material as adopted, superseded, deferred, or orphaned.
5. Classify inherited implementation material as `carry_across`, `redundant`, or `rewrite`.
6. Copy forward only what is intentionally retained.
7. Re-derive downstream design and code from the new constitutional surfaces, not from ambient precedent.

For a fundamental migration:

- `carry_across` does not mean automatic copy-forward; it means explicit
  re-adoption under the new line
- direct runtime, projection, prompt, proof, or review dependence on the
  sideways implementation line is bridge debt
- proxy interfaces that partially imitate the target line while still depending
  on the sideways line are not lawful closure

This is a lawful form of supersession, not a violation of live-surface immutability, because the new line is creating a new constitutional surface rather than silently mutating the old one.

---

## Transformation Wave Rule

Refactor and migration should be understood as a transformation wave over
mutable implementation surfaces.

While the wave is in flight:

- temporary mixed-state implementation may exist only below the current break
  boundary and only as explicitly non-authoritative plumbing
- transitional adapters or scaffolds may exist only when they are named,
  bounded, and outside the acceptance path
- refactor state may still carry traces of the prior operative model, but never
  as competing or ambiguous dual authority over the same request, fact,
  identity, state, or projection

Explicitly specified, deterministically routed, non-overlapping Product or
compatibility scopes are not competing authority under this rule. They may
coexist while the enclosing migration remains visibly open.

When the wave lands across its declared affected scope:

- only the new current operative surface remains live for that scope
- prior operative paths for that scope are erased from the live product
- the path taken to get there survives only in version control, event history, and superseded records
- mixed old/new operative models are not a stable end state

The only lawful exception is an explicit compatibility feature.

If compatibility is retained, it must be:

- named as current product behavior
- justified in the specification
- bounded in scope
- tested as an intentional feature

Otherwise the correct action is deletion, not passive preservation.

---

## Legacy Classification Rule

Every inherited or legacy requirement must be classified as one of:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **Deferred** | Retained in the live surface as an explicit not-yet-operative or not-yet-realized obligation | Keep with an honest deferment surface and do not present as current closure |
| **Superseded** | Ownership has moved to a newer constitutional surface or design decision | Add Implements/Supersedes to the governing design record |
| **Active** | Remains live constitutional law in the current surface | Must have an owning design decision — write or update one |
| **Orphaned** | No longer part of the intended system | Remove or explicitly supersede |

Nothing live may remain unclassified.

---

## Requirement Classification Rules

Every live requirement family must be classified on two independent axes:

1. **Lifecycle status**
   - Active
   - Deferred
   - Superseded
   - Orphaned
2. **Requirement category**
   - Capability
   - Constraint / Guarantee
   - Governance
   - Verification

These axes answer different questions. Lifecycle status says whether the requirement still belongs in the constitution and whether it is operative or explicitly deferred. Requirement category says what kind of project truth it asserts. A live requirement is incomplete if either axis is missing.

In project documents, this classification shall be explicit in requirement header metadata. `Status` carries lifecycle status. `Category` carries the requirement kind.

---

## Specification Surface Rule

The active specification layers have distinct constitutional roles:

- **Goals** orient the current bounded work wave. They shall not be used as a substitute requirement surface.
- **Intent** states why the system exists and what directional change is in or out of scope. It shall not carry optional realization detail unless that detail is itself constitutional.
- **Product** states the current concrete product definition and bridges intent to requirements. It is not a release note surface. It shall carry enough operational lifecycle signal for downstream requirements and design to understand intended use, release/install posture, live-use posture, observability posture, and retirement or supersession posture where those materially affect product meaning.
- **Requirements** state stable obligations that must be true. They shall carry explicit acceptance criteria and remain sufficient for downstream design derivation, including lifecycle obligations or named lifecycle ambiguity gaps where build, assurance, release, deployment, live usage, telemetry, or retirement materially affect the obligation.
- **Design** states how requirement truth is realized. It is downstream of requirements and may choose structure, interfaces, carriers, packaging, and tenant boundaries.
- **ADRs** are durable design memory. They are not a second requirement surface.

Constitutional specification is current-surface law and shall be written in present tense.

Dead law shall not remain in active constitutional artifacts for historical comfort. If something is no longer live, it shall be deleted, superseded, or moved to commentary. A migration wave does not justify preserving stale constitutional wording inside the live surface.

During a change wave, write the live constitutional surface in terms of the current truth and the declared affected boundary. Do not use version-line branding such as `2.0`, `3.0`, or similar labels merely to indicate recency. Reserve explicit version labels for immutable release facts, selector bindings, or clearly historical or superseded material.

Before treating a downstream specification artifact as complete, check the whole affected span:

1. Is the change class clear?
2. Is the re-entry point lawful for that class?
3. Can each downstream layer still be derived from the upstream layer?
4. Do the active intent, product, requirements, design, and qualification surfaces still say the same thing in the affected scope?

If not, the gate is not actually closed.

---

## Bootstrap Rule

Every STDO-defined product begins from
`templates/PRODUCT_DEFINITION_TEMPLATE.json`. Copy it to the product's
definition root as `stdo_default.json` for a singleton default project or as
`stdo_<label>.json` for a named product definition. An existing project fills
the URI bindings over its current layout; adoption does not require moving,
renaming, or duplicating existing authority or realization surfaces.

The default scaffold binds:

- a shared versioned STDO store, addressed through the exact
  `constitution.stdo.basis`, as the installed distribution of the selected
  process constitution;
- `specification/GOALS.md` as current work-wave orientation;
- `specification/INTENT.md` as domain direction;
- `specification/PRODUCT.md` as current product-definition surface;
- `specification/requirements/` as the live requirement surface;
- `build_tenants/` as the root for shared and tenant-local realization
  surfaces; and
- `.ai-workspace/` as the sprint, ticket, and comment carrier root.

These are template defaults, not universal path law. The definition's URI
bindings select the actual project carriers.

The authority split is:

- mutable methodology authoring lives in the source workspace under
  `specification_methodology/specification/standards/` and governs only a
  future candidate cut
- released methodology authority is the exact immutable STDO version selected
  by the consumer
- installed methodology distribution lives in the toolchain manager's shared
  versioned store by default and must match the basis URI and manifest digest
- project-owned constitutional surfaces live at the definition's `what`
  bindings
- project-owned realization and work surfaces live at its `how` and
  `ticketing` bindings

Projects shall not create a competing local methodology root such as the
default `specification/standards/`, nor bind mutable or partial method source
as if it were the selected immutable release.

Method authority is singular:

- selected immutable STDO release authority, projected into the installed
  distribution located by the Product Definition Overlay
- project constitutional authority at the definition's bound `WHAT` surfaces

When editing or repricing methodology, the mutable source path is authoring
authority for the candidate being constructed. It is not operative consumer
law before release and explicit selection.

When operating inside a governed workspace, the resolved installed basis is the
operative distribution of the selected immutable release until the consumer
explicitly adopts another cut. A project-local exact copy remains lawful when
explicitly bound and verified, but it is not the default and file proximity
cannot select it.

The corresponding default folder shape is:

```text
stdo_default.json

specification/
├── GOALS.md
├── INTENT.md
├── PRODUCT.md
└── requirements/
    └── *.md

build_tenants/
├── common/
└── default/

.ai-workspace/
├── sprints/
├── tickets/
│   ├── backlog/
│   ├── active/
│   └── completed/
└── comments/
```

This is a starter topology, not a conformance requirement. A monorepo may place
several `stdo_<label>.json` definitions at one root and bind each to a
different `WHAT`. A hierarchical repository may place one or more definitions
at any nested project root. Recursive discovery finds both shapes; explicit
composition, never directory nesting, relates their products.

Projects do not need to start with a complete `requirements/` tree on day zero.

Requirements may be sourced from any legitimate constitutional input,
regardless of its path, including:

- `GOALS.md`
- `INTENT.md`
- `PRODUCT.md`
- existing requirement documents
- imported standards or policy material
- prior project versions
- migration or repricing source material

Most projects begin by deriving `INTENT.md` from `GOALS.md`, then `PRODUCT.md` from `INTENT.md`, then the first requirement surface from the product definition, but that is the usual starting point, not the only lawful source.

The bootstrap sequence is:

1. Install the STDO toolchain manager once, resolve one version-line selector,
   and explicitly select one immutable RC cut.
2. Install that complete cut in the shared release store and retain its
   deterministic installed-manifest digest.
3. Copy `PRODUCT_DEFINITION_TEMPLATE.json` from that exact cut to the product definition root as
   `stdo_default.json` or `stdo_<label>.json`.
4. Assign the stable `product.definition_id` for the mutable `WHAT` definition
   line, its source-project locator, and bounded-context declaration; keep it
   distinct from every immutable Product and release identity.
5. Bind `constitution.stdo.source`, its non-operative selector, the exact basis
   URI and manifest digest, every additional constitutional authority, and the
   relevant basis-qualified entrypoints;
   confirm that the set collectively defines axioms, ontology, epistemology,
   taxonomy, and semantics for the governed scope.
6. Bind the agent bootstrap entrypoint and portable targets relative to the
   resolved `product.source_project`, then let the manager preflight every
   target and install or refresh only their marker-bounded discovery blocks.
7. Bind or explicitly empty the local axiom, override, and disambiguation
   collections.
8. Bind at least one accepted collective reference-frame basis, its admitting
   authorities, and its exact governed scope.
9. Write or confirm the current Goals carrier, then run the
   `goals → intent → product` steps and bind the resulting Intent and Product
   entrypoints.
10. Gather, derive, classify, and bind the live specification or requirement
   surfaces without creating a co-equal rival.
11. Bind at least one build tenant, including its root, design, and
   implementation surfaces, and bind any shared realization law.
12. Bind the Goals carrier, ticket lanes, comments root, and optional sprint
   root.
13. Bind every known product-composition edge explicitly, including its target
   definition identity, relation authority, and non-empty contract set.
14. Validate the JSON shape, assert URI and URI-reference syntax, synchronize
    and verify the exact installed basis, then resolve
    every URI and perform the cross-definition identity, composition,
    constitutional-sufficiency, and authority-congruence checks.

Once a bound requirement set is the live constitutional surface, no rival
monolithic requirements document should remain co-equal authority with it.
This rule keeps requirement truth structurally clear, derivable, and
non-monolithic without prescribing its folder.

---

## Method

When any substantive intake arrives:

1. Triage the intake and classify the change.
2. Determine the lawful re-entry point into the constitutional chain.
3. Identify the affected downstream span that must remain consistent.
4. Only then treat the work as implementation, repricing, or release-bound change.

When a feature is introduced or changed:

1. Update **Goals** if the current bounded work wave or overriding concerns have changed.
2. Update **Intent** if the purpose or scope has changed.
3. Update **Product** if the current product realization, terms, boundaries, or end-state shape have changed.
4. Update **Requirements** so the invariant truths are explicit as a decomposition of the product definition, including any lifecycle obligations or named lifecycle ambiguity gaps, and classify each new or changed requirement by category.
5. Establish or update **Design** so it owns the governing structural `HOW`.
   When `DESIGN_MODULE_METHOD.md` applies, use its decision-completeness rule:
   design, implementation, and tests may co-evolve only when
   `co_evolution_admissible(B)` holds. Otherwise accept the smallest causally
   closed affected design set before retained implementation establishes an
   unresolved, contradictory, or materially non-equivalent relation.

   When `DESIGN_MODULE_METHOD.md` does not apply, design, implementation, and
   tests may co-evolve when upstream truth leaves no unresolved material design
   decision. When such a decision remains, accept the affected design before
   retained implementation establishes it. ADRs are one valid design form.
6. Write **Scenarios** for capability claims that require operational proof, and define other evidence surfaces for non-capability requirements where appropriate.
7. Prefer declarative expression of the problem and acceptance surface before adding imperative mechanism.
8. Check the reconstruction boundary: can the current goals support the current intent, can the current intent support the current product, can the current product support the intended requirements, can the current requirements support the intended design, and can the current design support the intended implementation?
9. Record any major ambiguity discovered at the active boundary, and govern it according to declared risk appetite rather than silent convenience.
10. Develop **Code** under the selected design relation and reconcile design,
    implementation, and tests before promotion or closure.
11. Use **Events, Projection, and Delta** to verify whether reality still satisfies the requirements.

When bootstrapping a project or repricing a requirement surface:

1. Resolve the applicable Product Definition, verify its exact installed STDO
   basis, load its declared bootstrap entrypoint, and then load `GOALS.md` or
   the bound equivalent current epic carrier.
2. Perform the `goals → intent` step and write or confirm `INTENT.md`.
3. Perform the `intent → product` step and write or confirm `PRODUCT.md` as the current product-definition bridge.
4. Gather requirement source material from the relevant constitutional inputs.
5. Perform the `product → requirements` step and write the resulting live surface under `requirements/`.
6. Store requirements as individual files or grouped requirement families, whichever best preserves clarity and avoids monolithic sprawl.
7. Make `requirements/` the sole live requirement authority before proceeding to design and code.
8. Prefer declarative structure over procedural workaround while shaping the new requirement surface.
9. Record any major ambiguity that remains at the current boundary before downstream realization proceeds.
10. Only after that surface exists should downstream design and implementation be treated as constitutionally grounded.

When a real use case reveals a gap:

1. Run intake triage first and classify the report as a lawful change.
2. Then write the **Scenario** as the first substantive project artifact for the
   gap so the pressure becomes concrete and testable.
3. Run **Gap Analysis** — is this a missing implementation or a constitutional insufficiency?
4. If constitutional: reprice **Goals** when the current work wave changes, write a new **Intent**, then flow forward (product → requirements → design → code).
5. If implementation: write requirements/design as needed, then implement.

The intake source does not change this rule.

A bug report, feature request, failed testcase, release blocker, or operator
observation still enters through intake triage first, then follows the lawful
change class selected there.

---

## ADR Conventions

Each ADR shall explicitly include:

| Field | Purpose |
|-------|---------|
| `Status:` | `active`, `superseded`, or `retired` |
| `Implements:` | REQ-* IDs this ADR makes true |
| `Derives from:` | INT-* or strategy document that motivated the decision |
| `Supersedes:` | Prior ADR or doctrine this replaces |
| `Superseded by:` | Successor ADR when this ADR is `Status: superseded` |
| `Retained special case:` | When earlier behavior is intentionally retained as a special case of the current surface |

Write ADRs per decision boundary, not per requirement file. The question is: "what design choice makes these ACs true?" That is the ADR boundary.

If a requirement names an operational mechanism, the ADR must name that mechanism too. If a requirement expands the event taxonomy, the EC ADR must be repriced immediately — event semantics must not drift into a second constitution.

### ADR Folder Convention

ADRs are stored at the design surface that owns the decision. An `adrs/`
subdirectory is the default scaffold, not a mandatory repository location.

- tenant-local build-tenant ADRs: the applicable
  `how.build_tenants[].design` surface; default
  `build_tenants/<tenant-path>/design/adrs/`
- shared or cross-tenant ADRs: the applicable `how.common` surface; default
  `build_tenants/common/design/adrs/`
- non-tenanted or project-local ADRs: `<governing-design-surface>/adrs/`

In the default scaffold, `<tenant-path>` is one or more path segments beneath
`build_tenants/`. Both capability-oriented
`<product-family>/<realization-variant>` paths and single-label
`<realization-variant>` paths are lawful. In every layout, the product's
`how.build_tenants` binding records the tenant identity and locations used.
The recommended default scaffold is
`<product-family>/<realization-variant>`; existing or alternative layouts
remain conformant and do not require migration.

The governing design surface is the closest design surface whose authority owns the decision. ADRs must not be placed in comments, generated views, runtime archives, or requirement folders.

Filename convention is `ADR-<local-id>-short-slug.md`. The local ID is unique within the owning `adrs/` directory. Numeric IDs such as `ADR-001-...` are the default; namespace-prefixed IDs such as `ADR-GM-005-...` are allowed when the owning design surface already uses them.

A `REGISTRY.md` index alongside the ADR files is recommended for tooling and review but is not required. The constitutional source remains each ADR file; a registry is a read model that may drift unless tooling maintains it.
