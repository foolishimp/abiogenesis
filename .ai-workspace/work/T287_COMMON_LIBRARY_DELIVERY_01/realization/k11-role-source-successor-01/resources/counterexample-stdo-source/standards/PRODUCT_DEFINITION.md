# PRODUCT_DEFINITION

Tier 2. Owns how one project binds to this method: the product definition
overlay and its independence from layout, the relations a definition
carries, what a constitutional set must make recoverable, the installed
release basis and the toolchain manager that realises it, bounded-context
semantic resolution, local constitutional binding, the project's collective
reference-frame basis, the WHAT, HOW and work-carrier bindings, recursive
discovery with explicit composition, the semantic-resolution conformance
cases, the one constitutional surface and version boundary
(STDO-SURFACE-001), and the bootstrap of a project. Consumes
[FOUNDATIONS](FOUNDATIONS.md) (object, authority and its kinds, basis,
residual, imports between members, results),
[REFERENCE_FRAME](REFERENCE_FRAME.md) (frame set, frame-set declaration,
activation packet), [ACTIVATION](ACTIVATION.md) (the step) and
[EVALUATION](EVALUATION.md) (claims, separation, conformance); adds no
definition to tier 1. The generic WHAT and HOW law is
[SPEC_METHOD §2](SPEC_METHOD.md#2-the-chain); the recursive product
taxonomy is
[FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects),
which SPEC_METHOD §6 applies; the relation
between a WHAT and the build tenants that realise it is
[SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding); release identities, cohorts and selectors are the
release law (the [RELEASE](RELEASE.md) member); assurance and testing law is
[ASSURANCE](ASSURANCE.md). The schemas, templates, filenames, manifest
fields and commands named here are this Product's own realisation shapes,
accepted as interoperability boundaries under §11; they are not profile
terms. Three bounded contexts are
owned here: product-definition-routing (§1 to §4, §9, §12),
semantic-resolution (§5, §6, §10) and build-tenancy (§8). Every clause
names the principle that requires it (P0 to P6, FOUNDATIONS §3); the
member's family table (F12) closes §1.

## 1. Overlay and layout independence

This member owns the product-definition-routing bounded context,
`urn:stdo:bounded-context:product-definition-routing`, under the selected
complete STDO basis, and defines that context's overlay, definition,
discovery, locator and composition concepts. The JSON schema named below
realises the accepted interoperability shape of the overlay and is not a
second semantic owner (P6).

Every product defined under this method publishes one JSON definition for
each distinct current product WHAT. Its conventional filename is
`stdo_<label>.json`; `stdo_default.json` is the default for a source
project with one product definition. A directory may hold more than one
definition when it hosts more than one distinct product WHAT, and only
then. Several build tenants realising the same WHAT are entries in one definition and
never add definition files (P3).

The suffix `<label>` is the Definition Label: a stable lowercase local
discovery label of ASCII letters, digits, hyphens or underscores, unique
only among the definitions in the same directory. It is not Product
identity. The `product.definition_id` URI inside the definition is the
Product-Definition Identity: the stable identity of the mutable
product-definition line, unique within the discovered workspace definition
set. It identifies one continuing WHAT definition, not one immutable
released Product (P3).

The definition identity may stay stable while that source line authors
successive Product releases. Every immutable Product or release produced
from the line keeps its own Product and release identity. A fork, a
replacement or an independently governed WHAT definition receives another
`product.definition_id`; changing a released Product does not repurpose
the definition identity as release identity (P3; SPEC_METHOD §6).

Product-definition, immutable Product, bounded-context and build-tenant
identity URIs are identity carriers, not self-authorising strings. They
stay subject to the identity law (the [IDENTITY](IDENTITY.md) member) and to the owning
Product, release or domain authority. A URI locator, filename, path or
display label cannot mint or widen identity authority (P6, P3).

The directory containing a definition is its definition root. Relative URI
references resolve against the definition file's retrieval URI. The
`product.source_project` reference identifies the source-project root and
may resolve to the definition root or elsewhere. File proximity creates no
authority (P6).

The normative schema is `schemas/product-definition.schema.json`; the
single fill-in form is `templates/PRODUCT_DEFINITION_TEMPLATE.json`. This
concrete JSON shape is an accepted interoperability boundary under
STDO-SURFACE-001 (§11). It standardises only identity, location, relation
and discovery fields and absorbs no meaning owned by a referenced
constitutional, Product, requirement, design, ticket or commentary surface
(P6, P2).

### Foundation to law: binding a project to the method

This family (F12 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides how one project binds to the method. Its instance premises, which
the commitments do not supply, are named in the rows as follows: own
authorities, a project has its own product WHAT under its own authorities
and adopts the method without becoming part of it; chosen layout, the
project's governing documents, realisations and work carriers already
live where the project placed them; shared workspace, several projects,
product definitions, tenants and actors share one workspace or machine;
recurring terms, one term occurs in several bounded contexts with
different meanings; released method, the method is published as
immutable released versions that a project selects, installs and later
replaces. The index also assigns to this family the rule of
[FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members);
the table traces that rule in its sixth row, whose rule column names that
section, and owns none of it. Each commitment's standing is written as the
table of commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent); P3 (independent); P2 (independent); P1 (independent); instance: own authorities, chosen layout | By P6 each surface keeps its own authority, and by P2 binding adds only what the outcome needs, so a project binds to the method through one definition for each distinct product WHAT, which locates the governing surfaces and records their relations without holding their content; adoption therefore needs no restructuring, and by P3 content repeated in the definition would be a second record of one fact, a rival authority. | [§1](#1-overlay-and-layout-independence); [§2](#2-required-definition-relations) | the JSON overlay, the filename convention and Definition Label, the schema and template, and the relation fields of §2: interoperability choices of this member, accepted under [§11](#11-one-constitutional-surface-and-version-boundary) | 1, 9 |
| P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P1 (independent); instance: own authorities, shared workspace | By P3 each identity binds its own exact basis, and by P1 a locator, filename, path or nesting carries no meaning, so each definition line, Product, release, tenant and project keeps its own identity, and location mints no identity, authority, inheritance or composition. By P5 an ambiguous selection is no selection, so discovery selects exactly one applicable definition for a scope or fails closed, and by P6 composition is explicit and verifies the identity it expects. | [§1](#1-overlay-and-layout-independence), the identity paragraphs; [§9](#9-recursive-discovery-and-explicit-composition) | the composition entry fields and the checks of a conforming discovered set: domain choices of this member | 1, 2 |
| P2 (independent); P1 (independent); P3 (independent); P6 (independent); instance: own authorities | By P2 the selected documents exist to let actors interpret the project, so together they make recoverable what those actors need, whatever their number. By P1 and P6 an entry point or a design ontology is a representation without Product authority, so a derived entry point neither narrows nor replaces the complete selected set, and a design ontology supplies no missing Product meaning. | [§3](#3-constitutional-set-sufficiency) | the five dimensions, axioms, ontology, epistemology, taxonomy and semantics: a domain choice of this member | 1, 6 |
| P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P2 (independent); P1 (independent); instance: released method, shared workspace | By P3 a project's law binds one exact basis, so one complete immutable release governs it, selected by exact identity and verified before use, and no mutable selector, cache, registry entry, alias or local copy replaces that selection. By P6 a change takes effect only through its owner's acceptance, so a change of release or a consumer update takes effect only on acceptance of the exact plan presented; by P5 and P4b a state that cannot be verified fails closed, with prior state kept or recovered. | [§4](#4-shared-installed-release-basis-and-toolchain-manager); [Explicit complete consumer update](#explicit-complete-consumer-update); [§12](#12-bootstrap), the authority split | the toolchain manager, its shared store, its commands and their boundaries, the canonical hashing rule, the marker-bounded bootstrap block and the discovery prune list: interoperability choices of this member under §11 | 1, 8, 9 |
| P1 (independent); P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance: recurring terms | By P1 spelling, location and proximity carry no meaning, and by P3 a term resolves under one context and basis, so a material term occurrence admits exactly one concept under an explicit bounded context, and by P5 zero or several candidates fail closed. By P6 meaning crosses contexts only by an explicit owner-authorised relation, so a local disambiguation names its owner, scope and candidates. | [§5](#5-bounded-context-semantic-resolution); [§6](#6-local-constitutional-binding); [§10](#10-semantic-resolution-conformance-cases) | the semantic address, the resolution order, the relation kinds other than import, the carrier coordinates and the minimum conformance cases: domain choices of this member; each local axiom, override and disambiguation: the authority its entry names | 2, 6 |
| P1 (independent); P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: shared workspace | By P1 and P3 a concept means what its owner defines on its basis, so a member that uses it outside the owning section refers to that owner, defines nothing again, loses nothing, and by P6 gains no authority over it. By P5 a missing binding leaves the use undecided, so an activation binds each member's coordinates, re-establishes applicability after a change, and reports a missing source meaning, adoption or authority binding before relying on the concept. | [FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members); its use between a project's bounded contexts: [§5](#5-bounded-context-semantic-resolution), Semantic Import | the contents of an import declaration and the two forms of an import: choices of FOUNDATIONS §2 | 2, 6, 9 |
| P0 (recovered); P6 (independent); P3 (independent); P2 (independent); P1 (independent); instance: own authorities | By P0 actors are finite and engage the Product only through what they acquire, and by P6 that engagement needs an admitted basis, so they engage through a frame basis the Product's authority admits. By P6 availability grants nothing, so profile availability, Product adoption and activation for one actor and subject are distinct relations, and by P3 frames, actors and lineage identities stay distinct; the definition locates the shared basis and records no activation, agent or temporary configuration. | [§7](#7-collective-reference-frame-basis) | who adopts an available profile or a project configuration, its frame set and every grant: the adopting Product's authority, which is the one adopter every profile refers to; the basis template: a starter of this member, not authority | 1, 7, 9 |
| P3 (independent); P2 (independent); P6 (independent); P1 (independent); instance: own authorities, chosen layout | By P6 each surface keeps its own authority, and by P3 each realisation is a separate subject, so the definition locates the constitutional WHAT, each independent realisation of it and each work carrier, and each keeps its own authority: one registry identifies the tenants, goals own the work wave, tickets own ticket state and comments stay commentary. | [§8](#8-what-how-and-work-carriers) | the `what`, `how` and `ticketing` fields and the registry companion as a projection: choices of this member; each tenant's binding of the WHAT: that tenant's design, under [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding) | 1, 4, 9 |
| P6 (independent); P3 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P1 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P2 (independent); instance: released method | By P6 and P3 one law has one owner on one released basis, so the method has one authority surface, each law has one owning member, and the members govern only together, as one released version. By P4b a derived surface depends on its sources, so it preserves the owning clauses' conditions, carries their digests and is stale when one changes; by P1 a matching digest establishes identity, not fidelity. | [§11](#11-one-constitutional-surface-and-version-boundary) | the generic staleness law, which the digest binding refines for the carriers of a cut or installation: [ACTIVATION §2 Staleness of derived surfaces](ACTIVATION.md#staleness-of-derived-surfaces); which concrete forms the method accepts as interoperability boundaries: this member (§1, §4); any widening of Product scope to an executable tool, runtime or realisation: separate explicit human authorisation; a policy of this member: the members govern only together, as one released version | 1, 6, 9 |
| P2 (independent); P3 (independent); P6 (independent); instance: chosen layout, released method | By P3 a project binds one exact release, and by P6 a local copy of the method would be a rival authority, so a project begins by copying the definition template from its selected release and binding its existing surfaces, and creates no competing local method root; by P2 its first requirement surface may come from any legitimate constitutional input. | [§12](#12-bootstrap) | the default scaffold, the folder shape and the order of the fourteen steps: template defaults of this member, not path law | 1 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §12 and for FOUNDATIONS §2 Imports between
members; the grounds of `out_of_frame` and `invalid_basis` stated there
are traced by family F3 at
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results).

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the definition overlay and its relations: [SPEC_METHOD §1 Process constitution](SPEC_METHOD.md#process-constitution), where the definition binds the actual authority locations of the chain's surfaces, and [§10 Design records](SPEC_METHOD.md#10-design-records), whose ADR convention records the tenant identity and locations the definition binds; [ODD §6](ODD.md#6-product-boundary), where the target project owns the surfaces the definition locates, and [§10](ODD.md#10-what-an-odd-product-is), where the definition binds the actual locations of an ODD product's topology; [TICKETS §1 Goals](TICKETS.md#goals), whose default file the definition binds, and [§2 Default layout](TICKETS.md#default-layout), where a conforming definition binds the ticket, comment and sprint roles to existing carriers without restructuring the project; [§12](#12-bootstrap), step 3, which copies the template to the definition root.
- Row 2, identity, discovery and composition: [§4](#4-shared-installed-release-basis-and-toolchain-manager), whose fleet discovery fails closed on ambiguous discovery and infers no composition or inheritance from directory nesting; [§7](#7-collective-reference-frame-basis), whose Product-role map records each composition edge with its roles, authority, contracts, lifecycle and invalidation; [§12](#12-bootstrap), steps 4 and 13 and its discovery paragraph; otherwise no separate consumer applies, because discovery and composition are checked by the tooling that resolves a definition under §9, and no section of another member names §9 or the identity paragraphs of §1.
- Row 3, constitutional-set sufficiency: [§12](#12-bootstrap), step 5, which confirms that the bound set defines the five dimensions, and [§9](#9-recursive-discovery-and-explicit-composition), whose conformance checks include constitutional sufficiency; otherwise no separate consumer applies: the design profile derives its Ontology from the constitutional WHAT under its own rule and names this section nowhere, and the standing of an entry point is decided here.
- Row 4, the installed release basis and consumer update: [RELEASE §4](RELEASE.md#4-selector-and-consumer-adoption), where a consumer's operative basis is the installed release basis and adoption uses the Adoption Plan, its hashing and the manager's commands defined here; [ODD §4](ODD.md#4-method-library-classes), where a definition addresses the installed distribution by exact release URI and manifest digest and a project-local copy is not the default; [SPEC_METHOD §6 Shared method adoption and propagation (STDO-UP-012)](SPEC_METHOD.md#shared-method-adoption-and-propagation-stdo-up-012), where a consumer selects one complete released version rather than mixing cuts; [TICKETS §2 Default layout](TICKETS.md#default-layout), which resolves POSTING_GUIDE and TICKETS from the exact installed basis; [§3](#3-constitutional-set-sufficiency), where the STDO basis identifies one complete immutable cut and its manifest; [§9](#9-recursive-discovery-and-explicit-composition), whose fail-closed discovery restates this section; [§12](#12-bootstrap), steps 1, 2 and 14.
- Row 5, bounded-context semantic resolution: [TICKETS §5 Bounded-context term binding](TICKETS.md#bounded-context-term-binding), where ticket and work-instruction terms resolve under this law; [EXECUTIVE_BASELINE §11](EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set), where the family labels do not become equal to same-spelled Product, authority or runtime concepts; [EVALUATION §6](EVALUATION.md#6-conformance-of-realisations), which keeps semantic equivalence of realisations apart from the equivalence of concepts across bounded contexts; [WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports) and [Builder Project specialisation](WORLD_MODEL.md#builder-project-specialisation), whose import and specialisation carry the coordinates this section requires; [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), Development of several tenants, where a project's mechanics for several tenants are bound as local axioms under §6; [GLOSSARY §1](GLOSSARY.md#1-index-contract), where resolution follows this section and the index supplies no fallback; [§8](#8-what-how-and-work-carriers), whose concepts owned in other members enter the build-tenancy context by an explicit owner relation; [§9](#9-recursive-discovery-and-explicit-composition), whose conforming set resolves every material cross-context seam through an explicit relation; [§12](#12-bootstrap), step 7.
- Row 6, imports between members and bounded contexts: [PROFILES §1](PROFILES.md#1-the-boundary), whose import rule has a profile import each concept it uses under that rule; [REFERENCE_FRAME §1 Imports into this context](REFERENCE_FRAME.md#imports-into-this-context), whose declaration states the direction, loss and target context the rule requires; [WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports), whose import of the lineage concepts is a Semantic Import under §5; [GLOSSARY §2](GLOSSARY.md#2-locator-law), where a concept defined outside every declared context has its member as source context and a context holds it only by its own import; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 3, 5, 9 and 46.
- Row 7, the collective reference-frame basis: [EXECUTIVE_BASELINE §1](EXECUTIVE_BASELINE.md#1-canonical-compression), [§2](EXECUTIVE_BASELINE.md#2-status-and-authority-boundary), [§5 Baseline-adoption projection](EXECUTIVE_BASELINE.md#baseline-adoption-projection), [§6 Product-chain basis](EXECUTIVE_BASELINE.md#product-chain-basis), [§12 step 1](EXECUTIVE_BASELINE.md#1-existing-authority-selects-the-basis), [§16 Existing authority selects the configuration](EXECUTIVE_BASELINE.md#existing-authority-selects-the-configuration) and [§19 Project-basis additions](EXECUTIVE_BASELINE.md#project-basis-additions), where inclusion in a cut makes the profile available, only Product authority adopts it and the Product-owned basis records the adoption and the Product-role map, and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for status and bindings applies that distinction; [DESIGN_MODULE §12 Adoption](DESIGN_MODULE.md#adoption) and the [DESIGN_MODULE family table](DESIGN_MODULE.md#foundation-to-law), whose row for adoption imports F12; [TRAVERSAL_OCCURRENCE Authority and adoption](TRAVERSAL_OCCURRENCE.md#authority-and-adoption); [UX §1 Authority](UX.md#authority); [ASSURANCE §7 The set](ASSURANCE.md#the-set), where the governing frame configuration selects testing frames; [ODD §10](ODD.md#10-what-an-odd-product-is), where the `reference_frame_bases` bindings carry the evaluation-frame meaning and a runtime Frame enters the collective frame set only by an explicit declaration, and the [ODD family table](ODD.md#foundation-to-law), whose row for the ownership split imports F12 for that; [§9](#9-recursive-discovery-and-explicit-composition), where every governed scope has a resolvable applicable basis; [§12](#12-bootstrap), step 8.
- Row 8, WHAT, HOW and work carriers: [SPEC_METHOD §1 Process constitution](SPEC_METHOD.md#process-constitution), where the conventional surface names are bound here, and [§11](SPEC_METHOD.md#11-build-tenant-binding), whose build tenant is named in this context and located by the tenant registry; [TICKETS §4 Multi-build-tenant independence](TICKETS.md#multi-build-tenant-independence), which consumes the build-tenancy context and identifies a tenant by its registry entry; [TICKETS §1 Goals](TICKETS.md#goals), [Sprints](TICKETS.md#sprints) and [Comments](TICKETS.md#comments), [§2 Bindings and projections](TICKETS.md#bindings-and-projections) and [Carrier substitution](TICKETS.md#carrier-substitution), [§4 Lanes](TICKETS.md#lanes) and [§5 Carrier selection](TICKETS.md#carrier-selection), which take their carriers from the `ticketing` bindings; [POSTING_GUIDE §3](POSTING_GUIDE.md#3-location), where posts live at the comments binding; [§12](#12-bootstrap), steps 11 and 12.
- Row 9, one constitutional surface and the version boundary: [GLOSSARY §2](GLOSSARY.md#2-locator-law), Index watch, where locator drift makes a surface that relies on the index stale under the staleness binding; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 19 and 46; [§1](#1-overlay-and-layout-independence), whose schema and template are accepted interoperability boundaries under this section.
- Row 10, bootstrap: [SPEC_METHOD §4 Procedures](SPEC_METHOD.md#procedures), where bootstrapping a project resolves the applicable definition, verifies its basis and loads the bootstrap entrypoint this section declares.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Required definition relations

Each definition contains (P3, P6):

- `product`: the stable product-definition identity, display name,
  source-project locator and an explicit bounded-context declaration or
  `null`;
- `constitution.stdo`: the STDO source repository, the mutable
  version-line discovery selector, and the exact installed release basis
  with its deterministic manifest digest;
- `constitution.additional_authorities`: every non-STDO constitutional
  set;
- `constitution.entrypoints`: basis-qualified useful reading routes;
- `constitution.agent_bootstrap`: the constitutional entrypoint and the
  marker-managed agent-instruction targets;
- `local_constitution`: local axioms, overrides and disambiguations with
  their owning authority, target, basis and scope, including
  context-qualified term resolution where applicable;
- `reference_frame_bases`: one or more accepted collective
  reference-frame basis declarations with their admitting authorities and
  governed scopes;
- `what`: the current Intent, Product and specification bindings;
- `how`: any shared realisation surfaces and one or more independent
  build tenants;
- `ticketing`: the Goals, ticket, comment and optional sprint carrier
  bindings;
- `composition`: explicit relations to other product definitions; and
- `$schema` and `kind`: the schema locator and the
  `stdo.product-definition` discriminator.

The overlay owns this locator and relation map; the referenced documents
own their content. Repeating source truth inside the JSON creates a rival
authority and is non-conformant (P6).

`product.bounded_context` identifies the enclosing bounded context of the
definition's own product WHAT, or is `null` when no separate enclosing
context is claimed. It is not an exhaustive registry and does not flatten
subordinate, peer, composed, tenant, user or runtime contexts into one
namespace. Those contexts stay defined by their owning authorities, and
every local disambiguation names the exact context in which its resolution
applies (P1, P3).

## 3. Constitutional-set sufficiency

A Constitutional Set is the complete set of governing documents selected
for a product, not a prescribed number of files. Collectively the selected
set makes five things recoverable for the governed scope (P2, P1):

- axioms: irreducible starting truths, invariants and refusal conditions;
- ontology: the kinds of things treated as real and their material
  identities, relations, boundaries and lifecycle;
- epistemology: how claims become knowable or acceptable, including
  admissible evidence, observation, uncertainty, falsification and
  decision authority;
- taxonomy: the classifications and kind distinctions that prevent
  category collapse; and
- semantics: the governed meaning of terms, relations, states, operations
  and outcomes.

These are sufficiency dimensions of the complete set, not filename classes,
required folders or a one-document-per-dimension partition. One document
may cover several dimensions and one dimension may be distributed across
several owning documents (P2).

`constitution.stdo.basis` locates the complete selected STDO constitutional
set; `constitution.additional_authorities` locates every additional
constitutional set or source. The STDO basis identifies one complete
immutable RC cut and its exact installed-release manifest, never a
hand-selected subset. Each `constitution.entrypoints[]` member names the
basis against which its URI resolves. Entry points are derived navigation
and can neither narrow nor replace a complete selected constitution (P3,
P6).

This rule promotes no concrete design ontology into constitutional WHAT.
Product-level ontology that fixes Product meaning belongs in, or is cited
by, the bound WHAT. An accepted design ontology of a realisation boundary
(the design profile's) stays semantic-design authority for that boundary,
derives from constitutional WHAT and the applicable domain methods, and
cannot invent missing Product meaning (P6, P2).

## 4. Shared installed release basis and toolchain manager

Within the product-definition-routing context an Installed Release Basis
is the pair (P3):

```text
(immutable stdo://releases/<cut>/ URI, installed-manifest SHA-256)
```

The URI identifies one immutable annotated RC cut. The digest identifies
the deterministic installed-release manifest, which binds the cut's tag
object, commit, repository tree, standards subtree, exact standards
inventory, member bytes and admitted auxiliary payloads. The manifest shape
is owned by `schemas/installed-release-manifest.schema.json`. The manifest
is transport and integrity evidence, not a replacement constitution (P6).

An Adoption Plan is the read-only, deterministic acceptance object that
binds one current Product Definition's identity and bytes to its current
basis and to one resolved immutable target's cut, annotated tag object,
commit, tree and installed-manifest digest. Its SHA-256 is the
operator-presentable acceptance token. Possession of the token alone grants
no authority; a mismatch proves that the presented subject is no longer the
subject being mutated (P6, P3). A Fleet Adoption Plan binds an authorised
fleet root and the complete ordered set of per-definition plan digests
under the same law.

Plan hashing covers the acceptance object only: local installation status
and machine-local install paths are excluded. The canonical bytes are UTF-8
JSON with recursively sorted object keys, two-space indentation, LF line
endings and one final LF. Fleet order is deterministic discovery-path
order. These rules make a presented digest independently reproducible
rather than an opaque session token (P3, P6).

The STDO Toolchain Manager is the bounded executable realisation that (P2,
P3):

- installs each immutable cut once in a shared, versioned release store;
- resolves logical `stdo://releases/...` URIs to verified installed bytes;
- inventories and verifies complete installed distributions;
- synchronises the exact basis already selected by a Product Definition;
- emits an exact digest-bound adoption plan from a mutable version-line
  selector and performs adoption only when that plan is explicitly
  accepted;
- manages the stable marker-bounded bootstrap in declared agent files; and
- applies those operations to an explicitly discovered fleet of Product
  Definitions.

The store may live at any machine-local path. Its registry maps logical
release URIs to installed paths and manifest digests and owns neither
Product selection nor method meaning. A consumer repository therefore needs
no project-local standards copy and no prescribed folder structure, and
several Product Definitions on one machine may select different installed
cuts concurrently (P3, P6). Every manager-owned component from the
configured store root downward is a physical directory or regular file of
its declared type; a symlink, junction, reparse point, device, socket or
other redirection or special entry fails closed. Verification inventories
every filesystem entry type, directories included, rejects any entry not
derived from the manifest's exact file paths, and never follows an
unmanifested alias (P5, P3).

`constitution.stdo.source.repository` identifies the transport source.
`constitution.stdo.selector` is a mutable `stdo://channels/<version>`
discovery selector whose alias semantics are owned by the release law (the
[RELEASE](RELEASE.md) member). Neither is operative authority.
`constitution.stdo.basis.uri` and `constitution.stdo.basis.manifest_sha256`
are the sole authored STDO selection for that Product Definition (P6, P3).

The manager observes these command boundaries (P6, P5):

- `install` admits one explicitly named immutable RC cut without changing
  any Product Definition;
- `sync` installs and verifies only the exact basis already selected by
  the Product Definition and never consults its mutable selector;
- `adopt --dry-run` resolves the annotated selector and immutable RC, and
  presents the target cut, tag object, commit, tree, manifest digest,
  current Product-Definition byte digest and a deterministic
  adoption-plan digest, without mutation;
- mutating `adopt` requires that exact prior plan digest as explicit
  acceptance, re-derives it before installation, installs only the bound
  target, rechecks the Product Definition bytes, and atomically changes
  only its basis and its basis-relative schema locator; any drift refuses
  mutation;
- `status`, `verify`, `list`, `manifest` and `resolve` are read-only with
  respect to Product Definitions; and
- fleet adoption emits, and requires explicit acceptance of, one aggregate
  plan digest over every per-definition plan; all fleet writes require
  explicit whole-selection authorisation and infer no composition or
  inheritance from directory nesting.

Missing cuts, moved immutable tags, tag-to-commit mismatch, manifest-digest
mismatch, missing, extra or changed installed members, ambiguous Product
Definition discovery, unaccepted or stale adoption plans, URI escape,
physical store redirection, undeclared filesystem entry types and malformed
bootstrap markers fail closed (P5). Every `stdo:` schema locator is parsed
before schema loading under URI scheme case-insensitivity and names the
same immutable cut as `constitution.stdo.basis`; spelling variation cannot
cross that basis. No cache, registry entry, source checkout, version alias,
schema or agent file may silently replace the basis selected in the
Product Definition (P6, P3).

`constitution.agent_bootstrap` embeds no other constitution. It names one
basis-qualified bootstrap entrypoint and the local instruction files (such
as `AGENTS.md` or `CLAUDE.md` targets) whose small discovery block the
manager owns between explicit markers. Each target is a portable relative
path resolved against `product.source_project`; absolute paths, parent
traversal, redirected path components and escape from that boundary fail
closed. A fleet additionally confines every resolved source project to its
explicitly authorised fleet root and preflights every target before the
first write. Exactly one correctly ordered marker span may be replaced;
the bytes before and after it, trailing whitespace included, stay
project-owned and byte-identical, and appending a new span preserves all
existing bytes as an exact prefix. The bootstrap routes agents to the
applicable Product Definition, the exact installed basis and the owning
sources; it can neither restate nor override them (P6, P3, P5).

Recursive fleet discovery prunes these exact directory names as
version-control, dependency, generated, cache or managed-store internals:
`.git`, `.hg`, `.svn`, `.bzr`, `.venv`, `venv`, `node_modules`, `vendor`,
`site-packages`, `build`, `dist`, `out`, `target`, `.gradle`, `.tox`,
`.nox`, `.cache`, `.ruff_cache`, `.mypy_cache`, `.pytest_cache`,
`__pycache__`, `.genesis` and `.stdo`. A discovered Product Definition may
not itself be a symlink. These exclusions are discovery law, not evidence
that an excluded tree lacks another independently governed Product (P5,
P6).

### Explicit complete consumer update

A Complete Consumer Update Plan binds one explicitly selected Product
Definition and the complete companion population of one exact upstream
release-matched cohort to the consumer bindings selected by the
invocation's owner. The Product Definition continues to own composition;
the upstream cohort and each Product's release record own release and
member identity. An invocation selection and its derived plan and result
are operation evidence, not another persistent dependency declaration,
registry or lock. The caller selects every native route and derived context
for the claimed update scope; directory proximity or an empty discovery
result cannot supply that selection, and an empty derived-context
population means the owner selected none, not that the manager established
the absence of semantic context (P6, P3).

The separate `cohort-update` operation presents the whole plan without
consumer effects. Unlike the basis-only Adoption Plan above, its acceptance
object also binds the physical effect destinations and binding preimages,
the exact selected cohort bytes, the companion annotated tags, commits,
subtrees and inventories, the replacement dependency locators, the native
routes and the declared derived-source observations. It uses the same
canonical JSON hashing rule. Already-installed status supplies no
additional authority and does not change the digest. Mutation requires
explicit acceptance of this exact plan and re-derives it; possession of its
digest alone grants no operation authority. The `adopt`, `sync` and fleet
contracts above keep their narrower boundaries (P6, P3).

The complete operation verifies the selected cohort's dependency closure
and each exact companion's definition, release record and admitted members
before relying on them. It stages absent immutable installs, verifies
existing installs without repairing them in place, and preflights every
consumer target. Only the selected basis and schema, the existing
composition locators and contracts, and the selected native and install
links may change; historical installs and unrelated consumer content stay
available and unchanged. It creates no consumer-local checker and changes
no Product meaning or local semantic map (P3, P6, P2).

For each selected derived context, missing, ambiguous, changed or
unavailable program, map or source evidence holds the complete update
before any consumer effect. The source owner performs any semantic re-entry
that is needed; the manager cannot mechanically relabel an older map as
current. Exact source freshness is integrity evidence, not semantic
conformance and not an independent semantic verdict (P1, P6). After
immutable staging the manager rechecks the consumer preimages and the
source evidence. It reports completion only after verifying every selected
resulting binding and companion. Refusal before consumer effects retains
the prior state; a caught application failure restores the affected
consumer preimages and does not report completion; newly staged immutable
installs may stay unused. The operation requires an exclusive consumer
write scope during application. It claims no crash-atomic transaction
across independent filesystem paths: abrupt process or host loss, or
unavailable rollback storage, requires recovery from the presented
preimages before the complete relation can be claimed (P5, P4b).

Outcomes as results. The outcomes of the manager's operations in §4,
its refusals, its reported completion and the recovery that
loss requires, are stated in the core result algebra of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results) through the refinements
of [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition), each
for its own predicate; the cause of an outcome selects its value, and the
mapping adds no core value (P5, P6):

- Effect. An operation that writes, such as `install`, `sync`, a mutating
  `adopt`, fleet adoption or the complete consumer update, has an
  intended external effect, recorded under
  [ACTIVATION §3 Effects](ACTIVATION.md#effects) for the predicate "the
  intended effect occurred". Reported completion is `completed`
  (`satisfied`) only where evidence about the subject establishes the
  effect in full, as the complete update's verification of every
  selected resulting binding and companion does. The cause selects the
  other values. A refusal before any effect, with the retained prior
  state as the evidence about the subject, is `not_effected`
  (`falsified`), and the effect has ended. A caught application failure
  is also `not_effected` (`falsified`): the failure observed on the
  subject establishes that the complete update is not attained, and the
  operation applies no later part of it, so no later completion of this
  effect can attain it. Whether its restored preimages are verified
  decides only whether the effect's end is established, never the value:
  verified, the effect has ended; a restoration not verified, or rollback
  storage unavailable after the failure, leaves the end not established,
  recorded beside the value as a residual naming the verification that
  would establish it. Newly staged immutable installs left unused are
  named with the value as the part that did occur. Abrupt process or
  host loss, where no caught failure establishes that the update fell
  short, is `completion_unknown` (`indeterminate`), never `completed` or
  `not_effected`. `completion_unknown`, and `not_effected` with its end
  not established, are effects of uncertain completion under
  [ACTIVATION §3 Effects](ACTIVATION.md#effects): recovery from the
  presented preimages reconciles them, as
  [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart) states, before
  any repetition or claim of the complete relation.
- Refusal. A refusal also answers whether the operation may apply its
  effect on the exact subject and basis it binds. Found before the
  operation begins, it is an outcome of
  [ACTIVATION §3 Admission and activation](ACTIVATION.md#admission-and-activation),
  for "the step is lawfully admitted and activated on the exact subject
  and basis"; found after it has begun, as by the recheck after immutable
  staging, it is a value of
  [construction availability](ACTIVATION.md#construction-availability),
  for "a candidate is available". A missing explicit acceptance of the
  exact plan, or missing whole-selection authorisation of a fleet write,
  is missing operation authority: `admission_refused(authority)`
  (`out_of_frame`), naming the acceptance or authorisation needed and
  its owner. Every other refusal has a basis cause: drift of the Product
  Definition bytes or of a consumer preimage; a stale plan; each other
  condition of the fail-closed list above, ambiguous discovery included
  because it leaves no exact subject; a path, locator or marker span that
  escapes or breaks its boundary; and missing, ambiguous, changed or
  unavailable derived-context evidence, which holds the complete update.
  It is `admission_refused(basis)` before the operation begins and
  `re_entry_requested(basis)` after, `invalid_basis` in both, and names
  the basis coordinate that fails and, for derived-context evidence, the
  source owner whose re-entry repairs it.
- Command without an intended effect. A command without an intended
  external effect, such as `verify` or `adopt --dry-run`, has no value
  under Effects, and its refusal maps by cause as above. A condition it
  reports about the subject it evaluates, such as a member that `verify`
  finds missing, extra or changed, is a counterexample to that command's
  own predicate, `falsified`, not a refusal.

Purpose and material relation: a consumer that combines the manager's
outcomes with other results cannot read a refused or failed operation as
completed, an operation whose value is `completion_unknown` as either
completed or not effected, a caught failure whose restoration is not
verified as undecided when the update is known to have fallen short, or
a refusal for missing acceptance as one for a defective basis (P5, P6).

## 5. Bounded-context semantic resolution

This member owns this law in the semantic-resolution bounded context,
`urn:stdo:bounded-context:semantic-resolution`, under the selected complete
STDO basis. A glossary may index this identity and does not participate in
its declaration (P1, P6).

A term is a lexical label used in an occurrence, not a context-free concept
identity. A bounded context is an explicitly identified semantic scope in
which a governed vocabulary, concept set and relation set are jointly
interpretable under named authority. A concept reference is an exact,
resolvable reference to a meaning owned by an authority under a selected
basis; the reference locates that meaning and mints neither the meaning nor
its authority (P1, P3, P6).

A bounded context exists only when an owning authority declares its stable
identity, owner, selected basis and governed semantic scope. A consuming
member may define a concept inside that context only through an explicit
owner relation. A filename, heading, index row, glossary section, schema
value or bare URI cannot constitute the context (P6).

Every material term occurrence resolves under this semantic address (P1):

```text
(term, bounded-context identity, owning authority, selected basis, governed scope)
```

Equal spelling, capitalisation, shape, file location, directory nesting,
actor or implementation does not establish equal meaning, concept identity,
equivalence, inheritance or authority; different spelling does not prove
different meaning. Those relations follow only from the applicable semantic
address or from an explicit authorised relation (P1, P3). This applies the
Representation row of [FOUNDATIONS §2](FOUNDATIONS.md#2-ontology) to
terms; the list names the representations a term takes in this member.

Resolution proceeds in this order (P1, P5):

1. identify the occurrence's governed scope and nearest explicit
   bounded-context declaration;
2. identify the exact selected basis and the authorities applicable to
   that context and scope;
3. collect the context-local definitions and the explicitly imported
   concept references admitted by those authorities and that basis;
4. apply every applicable owner-authorised override or disambiguation; and
5. admit the occurrence only when exactly one concept remains.

A document, section, schema field, operation or other owning surface may
declare a context for all subordinate occurrences, so uniquely resolved
prose need not repeat a qualifier on every term. A repository, directory,
filename, heading, glossary match, prompt, actor or nearby definition does
not declare a bounded context by accident (P1, P6).

Zero applicable concepts is unresolved meaning; more than one is ambiguous
meaning. Both fail closed at a material boundary: an agent, design, schema,
implementation, test, translation or reviewer must not select one by
familiarity, frequency, recency, nominal match or a context-free glossary
fallback (P5, P1). For an evaluation that depends on such an occurrence,
the definition, import or disambiguation that would select one concept is
a material relation its frame does not declare: the evaluation returns
`out_of_frame` and names that relation and its owner, or returns
`indeterminate` where the admissible evidence also cannot decide the
claim and so gives that ground too, and in either case names the ground,
as [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Out of frame or
indeterminate, states (P5, P1).

The glossary (the [GLOSSARY](GLOSSARY.md) member) is a non-deciding locator index. Each
record points to an exact source clause that declares the bounded context
and owns the indexed concept. The glossary defines neither and cannot
repair a missing declaration. An indexed concept applies only when the
semantic address selects its owning clause or the target context explicitly
imports it; appearance in the glossary creates no shared default (P6, P1).

A cross-context relation is explicit and owner-authorised. Its carrier
states (P1, P6, P4b):

- the exact source and target concept references and bounded-context
  identities;
- whether the relation imports unchanged meaning, disambiguates a use,
  translates directionally (a specialisation included) or establishes the
  stronger equivalence claim;
- its direction and any lawful inverse where material;
- the preserved meaning, changed meaning, loss and refusal conditions;
- the source and target semantic owners, without transferring either
  authority;
- the selected source and target bases, the governed scope and
  provenance; and
- its lifecycle and invalidation conditions.

The four relation kinds refine the rule of
[FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members),
which owns what an import is, its direction, its loss and its lack of
authority, and states that a use that changes, narrows or loses the source
meaning is not an import. That rule is stated for members. Here it
applies between any two bounded contexts, with the context an owning
authority declares as source or target. A carrier's concept references,
bounded-context identities, direction and loss are the contents of an
import declaration under that rule; its semantic owners are authorities,
distinct from the owning clause to which a concept reference resolves.
Each kind reads in the owner's terms once (P1, P6):

| Kind | In the terms of FOUNDATIONS §2 Imports between members |
|---|---|
| Semantic Import | an import, applied for its declared target scope; its unchanged meaning, direction, loss and lack of authority are those FOUNDATIONS §2 states |
| Semantic Translation | not an import, because it declares how meaning changes in one direction; its carrier states the coordinates an import declaration states (the concept, its owner, the source and target contexts and the direction) and declares the changed meaning and the loss. A specialisation (below) is a translation |
| Semantic Equivalence | not an import: each concept keeps its own owner and context, and neither adopts the other's meaning. It requires the governing authorities to establish the claimed equality; neither identical spelling nor two opposing translations proves it automatically |
| Semantic Disambiguation | not an import: it selects one meaning for one scope and does not make competing concepts equal. Where the selected concept is owned in another bounded context, it enters that scope only by the import, translation or equivalence its carrier declares (§6) |

No relation widens its source or target authority; for an import,
FOUNDATIONS §2 states this, and for the other three kinds this section
does (P1, P6). These four kinds are related to the typed relations that
AC-012, AXIOMATIC_CALCULUS §4, names. The reading of each kind in the
owner's terms is stated here. Purpose and material relation: an
import has one definition, so a translation, equivalence or
disambiguation cannot pass as an import that adopts meaning unchanged
(P1, P6).

A specialisation is a directional translation whose target preserves the
declared source meaning while narrowing its admissible instances or adding
target-context constraints. It identifies the exact target concept, the
preserved and narrowed meaning, the excluded source instances, and the
absence or law of any inverse. Calling a term a specialisation without
those coordinates establishes nothing (P1, P3).

## 6. Local constitutional binding

A local axiom, override or disambiguation gains no authority from its file
category or from being listed in the overlay. Every local entry names (P6):

- the URI carrying the local decision;
- the existing Product, requirement, accepted-design or other lawful
  authority that owns it;
- the clause or ambiguity it overrides or resolves, where applicable; and
- the exact scope to which it applies.

Each `local_constitution.disambiguations` binding additionally names (P1,
P3):

- `term`: the exact lexical label being resolved;
- `context`: the bounded-context identity in which the resolution applies;
- `disambiguates`: the complete material candidate concept or clause
  references;
- `resolves_to`: the exact selected concept reference, which is one member
  of `disambiguates`;
- `basis`: every selected semantic basis needed to interpret the
  candidates and the resolution; and
- `uri`, `authority` and `applies_to`: the owning resolution carrier, the
  lawful authority and the exact governed scope.

The referenced `uri` owns the resolution. When the candidates cross bounded
contexts, that carrier also declares the complete import, translation or
equivalence relation §5 requires. The overlay metadata makes the relation
discoverable and checkable; it neither restates the source-owned meanings
nor mints the decision (P6).

An empty local array explicitly declares that no local entry of that kind
is bound for the product. Omission is not an equivalent declaration (P6,
P4b).

## 7. Collective reference-frame basis

A Project Reference-Frame Basis is the Product-owned accepted declaration
of the shared frame set through which finite actors collectively engage one
governed Product scope or outcome (P0, P6). It binds:

```text
Project Reference-Frame Basis
  = exact reference-frame law and optional profile basis
  + admitting authorities and governed scopes
  + frame declarations and evaluation inventory
  + actor-binding rules and capability envelopes
  + semantic, evaluation, operation and decision grants
  + result, conjunction, translation and coverage relations
  + lifecycle activation triggers and invalidation law
```

[REFERENCE_FRAME](REFERENCE_FRAME.md) supplies frame principles only, and
its §4 the shape of a frame-set declaration; a profile member (the
Executive baseline, tier 3) supplies one optional profile only. Neither
selects, adopts or owns a Product binding. The adopting Product's existing
authority owns the concrete declaration and every grant it contains (P6).

`reference_frame_bases` is the non-empty locator set for the accepted
frame bases through which finite actors collectively engage the governed
Product and its work. Each entry names (P6, P3):

- the URI carrying one accepted frame-basis declaration;
- every existing Goals, Product, requirement, accepted-design or other
  lawful authority that admits the declaration; and
- the exact Product, bounded context, build tenant, outcome or other
  governed scope to which it applies.

The referenced declaration owns the selected frame set, the method or
profile basis, the governed outcome, the actor-binding rules, the
capability envelopes, the grant requirements, the triggers, the coverage,
the result relations and the invalidation law. It may adopt an available
profile or define a project configuration. The JSON entry locates that
declaration and its authority relation; it does not contain the binding,
adopt the profile, restate the frames or create frame-set authority (P6).

Profile availability, Product adoption and execution-scoped activation are
three distinct relations. Inclusion in a selected method cut makes a
profile available; only Product authority may adopt it; only an exact
authorised work instruction may activate one bound frame for an actor and
subject (P6, P3).

The collective basis and an actor activation are distinct. An Agent Frame
Activation is the execution-scoped binding of one agent to an applicable
frame declaration or active configuration, an exact evaluation, subject,
basis, evidence boundary and capability envelope; what the agent receives
is the activation packet of REFERENCE_FRAME §11, and the step it performs
is ACTIVATION §1. The Product Definition records the durable shared basis;
a ticket or other authorised work instruction carries the activation
packet. An Agent Frame Activation does not mutate the overlay, and the overlay
registers no agents, assigns no permanent frames and persists no temporary
active frame configuration (P3, P0).

Frames and actors keep separate identities. Several agents may activate
overlapping subsets of one frame set; one agent may activate different
frames over time. Neither an actor name nor a broad frame grants semantic,
operation, review, acceptance or disposition authority beyond the cited
owners and the exact activation (P6, P3).

The Project Reference-Frame Basis also records the Product-role map when
the governed outcome crosses a chain of Products. The map keeps mutable
source projects, Product Definitions, candidate checkpoints, release cuts,
released Products, installs, artifacts and dependent Products as distinct
identities (SPEC_METHOD §6), and records each development product as a
role binding over its exact underlying install identity. Every directed
Product-composition edge names its source and target roles, governing
authority and contracts, lifecycle, evidence boundary, refusal and
invalidation conditions. Common actors, repositories, files,
implementations, outputs or tool access create no composition or identity
relation (P3, P6).

An accepted Project Reference-Frame Basis may be expressed entirely as
source-linked prose. The starter at
`templates/PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md` projects this binding
law into one copyable shape. The template is not authority, and no schema,
axiomatic representation, prompt framework or runtime frame engine is
needed to use the method. An adopting Product replaces every placeholder
with its own exact identities, owners, scopes, sources, grants, results and
invalidation conditions, then admits that completed declaration under
existing authority (P2, P6).

A Product, domain or runtime carrier also named `Frame` is not included by
nominal match. It stays governed by its bound WHAT and HOW and may be the
subject or a coordinate of an evaluation frame. It enters the collective
frame set only through an explicit frame declaration with the required
evaluation and authority relations (P1, P3).

## 8. WHAT, HOW and work carriers

This member owns the build-tenancy bounded context,
`urn:stdo:bounded-context:build-tenancy`, under the selected complete STDO
basis. These concepts of the context are owned in other members, each by
an explicit owner relation (§5) (P1, P3):

- the build tenant, the relation by which one constitutional product WHAT
  is realised by one or more independent project-owned HOW tenants, and
  each tenant's build-tenant binding:
  [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), its terms and
  rule 1;
- the multi-build-tenant work-item relation:
  [TICKETS §4](TICKETS.md#multi-build-tenant-independence).

In this context build tenancy is that one-or-more relation; one tenant is
its singleton case, and multi-build-tenancy begins when the same WHAT has
more than one independent realisation (P3, P2).

`what.intent`, `what.product` and `what.specification` locate the current
constitutional WHAT. Intent and Product each have one canonical entrypoint;
specification may cite more than one requirement or specification surface
(P3).

The Tenant Registry is the canonical `how.build_tenants` collection for the
product's independent HOW realisations. Each entry has stable identity and
locates its root, design and implementation surfaces; the tenant's
binding, which those surfaces declare, is governed by SPEC_METHOD §11.
The Common Build-Tenant Surface is the realisation law bound by `how.common` and
explicitly adopted across more than one tenant. A separate
`TENANT_REGISTRY.md` may remain as a human-readable companion or generated
projection and cannot become a second tenant-identity or location
authority (P3, P6).

`ticketing.goals` locates the current work-wave carrier.
`ticketing.tickets` locates the durable ticket root and the minimum
backlog, active and completed lanes. `ticketing.comments` locates the
commentary root. `ticketing.sprints` optionally locates bounded
execution-batch manifests. These bindings may resolve to directories,
repository resources, tracker collections, API endpoints or product-scoped
queries. Goals own the bounded work wave, ticket state stays ticket
authority, and comments stay non-authoritative commentary (P6, P3). Which
carrier a given work item takes is SPEC_METHOD §4 and the [TICKETS](TICKETS.md) member;
this section binds where each carrier kind lives.

## 9. Recursive discovery and explicit composition

Tools discover `stdo_*.json` recursively within the selected workspace
boundary: definitions at the workspace root and definitions at arbitrarily
deep nested project roots (P3).

For a requested Product scope exactly one applicable definition is
selected; zero or several unresolved definitions fail closed, and a
symlinked definition is refused (P6, P5).

Directory nesting creates no implicit inheritance, ownership, composition
or constitutional override. Parent and child definitions stay independent
until `composition` explicitly relates them. Each composition entry records
(P6, P3):

- `product_definition`: the current locator for the target definition;
- `target_definition_id`: the stable identity expected from the target's
  `product.definition_id`;
- `relation`: the authority defining the directed composition kind, the
  source and target roles, owner, scope, lifecycle and invalidation
  conditions; and
- `contracts`: one or more exact interface, capability, identity,
  lifecycle, data, evidence or other governing contract references
  consumed by that relation.

Resolution verifies both the locator and the expected identity. Moving a
definition requires a locator update and does not change its identity.
Replacing the content at the same locator with another definition identity
fails closed. When an edge binds exact immutable Product or release
versions, the cited relation and contracts also carry and verify those
identities; the mutable definition identity cannot substitute for them
(P3, P5).

A conforming discovered set satisfies all of the following (P3, P6, P1):

- every definition validates against its selected released schema;
- every required URI and fragment resolves under the declared workspace
  and resolver boundary;
- every `product.definition_id` is unique;
- every build-tenant identity is unique within its overlay;
- every governed scope has a resolvable applicable reference-frame basis,
  and overlapping basis bindings are reconciled by their cited authority;
- every local disambiguation binds one exact term, target context,
  complete material candidate set, selected concept, authority, basis and
  scope; `resolves_to` is a member of `disambiguates`; and its referenced
  resolution carrier is congruent with those bindings;
- every material cross-context term seam resolves through an explicit
  import, disambiguation, translation or equivalence relation rather than
  nominal match;
- every composition target resolves to another product definition whose
  `product.definition_id` equals `target_definition_id`, and every
  relation and non-empty contract set resolves; and
- no two carriers claim authority for the same Product, tenant, ticket
  state or constitutional relation.

Portable Draft 2020-12 JSON Schema validation establishes structural shape.
The schema's `uri` and `uri-reference` formats are annotations unless the
declared validator implements format assertion. Conformance therefore
performs an explicit RFC 3986 URI and URI-reference syntax check with an
assertion-capable validator, followed separately by resolution, fragment
existence, selected-release identity, uniqueness across files,
constitutional sufficiency, semantic-resolution and cross-context-relation
completeness, and authority-congruence checks. The structural subset and
the semantic subset of these checks are distinct claims (EVALUATION §2;
P1, P6).

## 10. Semantic-resolution conformance cases

Conformance covers both uniquely resolved use and material collision. At
minimum it establishes these cases under an exact selected basis (P1, P6):

| Term | Candidate contexts | Required result without an explicit cross-context relation |
|---|---|---|
| `Frame` | the reference-frame-evaluation context (REFERENCE_FRAME §1) and a consumer-owned runtime carrier | remain distinct; nominal match cannot enrol the runtime carrier as an evaluation frame |
| `Owner` | a generic specialist evaluation family and a semantic or decision authority owner | remain distinct; the evaluation family acquires no owner authority |
| `Product` | an immutable released Product and a mutable Product Definition | remain distinct and select only through the occurrence's declared context |
| `Tenant` | an STDO build realisation and hosted, customer, account, runtime or data tenancy | remain distinct; build tenancy supplies no default for the other contexts |
| `User` | a Product role, human person, identity principal, account, actor, operator or data subject | unresolved until downstream authority defines or explicitly relates the applicable meanings |

A positive local case declares one context and resolves exactly one
concept. A positive cross-context case supplies the complete authorised
relation. Negative cases cover zero candidates, multiple candidates after
disambiguation, a selected concept outside the candidate set, a
context-free glossary fallback, incomplete relation coordinates, authority
or basis mismatch, undeclared loss and invalidated relations. Correct
downstream behaviour produced through a guessed meaning does not pass
semantic conformance (P6, P1). [CONFORMANCE](CONFORMANCE.md) may index
these cases; it does not redefine them.

## 11. One constitutional surface and version boundary

STDO-SURFACE-001. The shared methodology is modular in authorship and
singular in authority. Each law has one owning member; other members
consume it by reference. The members become operative only as one complete
released version of the method (P6, P3).

A released cut identifies its exact member set, member digests, review
basis, human acceptance and immutable identity. Compressions, templates,
comments, candidate work, installed copies and mutable source are derived,
evidential or authoring surfaces. They cannot become a selectable partial
constitution and cannot reinterpret the owning members (P3, P6).

Within their declared scope, derived instructions preserve the owning
clauses' applicability, obligations, permissions, exclusions, decision
owners and invalidators. A projected prohibition cannot lose its condition
or its lawful alternative, even when every source digest is correct. A
summary, bootstrap or index cannot require a stricter or weaker relation by
compression. Its references are resolvable within the declared actor's
access; otherwise the required meaning is supplied directly (P4b, P1;
FOUNDATIONS §4, reference versus body).

Staleness binding. What a derived surface is, when it is stale, and
what an actor uses in its place are
[ACTIVATION §2 Staleness of derived surfaces](ACTIVATION.md#staleness-of-derived-surfaces);
which questions a derived surface decides on its own is ACTIVATION §2,
Standalone scope. This member refines that law for the derived surfaces
a released cut or an installation carries, among them compressions,
templates, bootstraps, indexes and projected frames. Each carries the
path and digest of each deciding source it was derived from, and of each
index it watches (GLOSSARY §2). A change to any of those digests is the
source change that makes it stale under that law, and it must be
regenerated or explicitly re-accepted before an installation treats it
as current. What a matching digest establishes is stated above
(EVALUATION §7). The raw owning members of the same
selected cut remain the deciding authority: a question that a stale or
insufficient carrier cannot decide is decided from them, as ACTIVATION
§2 states (P3, P5, P6).

The method owns normative construction algebra, authority relations,
abstract state and transition laws, admissibility conditions, necessary
causal order and evidence invariants. Consumers own concrete Product
realisation: instantiated types and schemas, files, tools, runtime and
orchestration machinery, tests and executable conformance implementation.
A concrete form is method law only when the method explicitly accepts it
as an interoperability boundary, as §1 does for the definition schema and
template (P2, P6).

A shared-method amendment cannot create an executable tool, workflow
engine, runtime, assurance system or consumer realisation as STDO Product
scope without separate explicit human authorisation. An agent recording a
ruling cannot widen its subject, implication, authority or change class
(P6).

Only a released method version is publication authority. Mutable method
source may author a future cut; it must not silently govern a consumer
(P6, P3).

## 12. Bootstrap

Every product defined under this method begins from
`templates/PRODUCT_DEFINITION_TEMPLATE.json`, copied to the product's
definition root as `stdo_default.json` for a singleton default project or
as `stdo_<label>.json` for a named product definition. An existing project
fills the URI bindings over its current layout; adoption requires no
moving, renaming or duplicating of existing authority or realisation
surfaces (P2, P3).

The default scaffold binds:

- a shared versioned STDO store, addressed through the exact
  `constitution.stdo.basis`, as the installed distribution of the selected
  process constitution;
- `specification/GOALS.md` as current work-wave orientation;
- `specification/INTENT.md` as domain direction;
- `specification/PRODUCT.md` as the current product-definition surface;
- `specification/requirements/` as the live requirement surface;
- `build_tenants/` as the root for shared and tenant-local realisation
  surfaces; and
- `.ai-workspace/` as the sprint, ticket and comment carrier root.

These are template defaults, not universal path law; the definition's URI
bindings select the actual project carriers (P2).

The authority split is (P6, P3):

- mutable methodology authoring lives in the method's own source workspace
  (the standards of its source project) and governs only a future
  candidate cut;
- released methodology authority is the exact immutable STDO version
  selected by the consumer;
- installed methodology distribution lives in the toolchain manager's
  shared versioned store by default and matches the basis URI and manifest
  digest;
- project-owned constitutional surfaces live at the definition's `what`
  bindings; and
- project-owned realisation and work surfaces live at its `how` and
  `ticketing` bindings.

A project creates no competing local methodology root, such as a default
`specification/standards/`, and binds no mutable or partial method source
as if it were the selected immutable release (P6).

Method authority is singular: the selected immutable STDO release
authority, projected into the installed distribution located by the
overlay; and the project constitutional authority at the definition's
bound WHAT surfaces (P6). When editing or repricing methodology, the
mutable source path is authoring authority for the candidate being
constructed; it is not operative consumer law before release and explicit
selection (P3, P6). When operating inside a governed workspace, the
resolved installed basis is the operative distribution of the selected
immutable release until the consumer explicitly adopts another cut. A
project-local exact copy stays lawful when explicitly bound and verified;
it is not the default, and file proximity cannot select it (P6, P3).

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

This is a starter topology, not a conformance requirement. A monorepo may
place several `stdo_<label>.json` definitions at one root and bind each to
a different WHAT. A hierarchical repository may place one or more
definitions at any nested project root. Recursive discovery (§9) finds both
shapes; explicit composition, never directory nesting, relates their
products (P3, P2).

A project need not start with a complete `requirements/` tree on day zero.
Requirements may be sourced from any legitimate constitutional input
regardless of its path, including `GOALS.md`, `INTENT.md`, `PRODUCT.md`,
existing requirement documents, imported standards or policy material,
prior project versions, and migration or repricing source material. Most
projects begin by deriving `INTENT.md` from `GOALS.md`, then `PRODUCT.md`
from `INTENT.md`, then the first requirement surface from the product
definition; that is the usual starting point, not the only lawful source
(P2).

The bootstrap sequence is (P3, P6, P2):

1. Install the STDO toolchain manager once, resolve one version-line
   selector, and explicitly select one immutable RC cut.
2. Install that complete cut in the shared release store and retain its
   deterministic installed-manifest digest.
3. Copy `PRODUCT_DEFINITION_TEMPLATE.json` from that exact cut to the
   product definition root as `stdo_default.json` or `stdo_<label>.json`.
4. Assign the stable `product.definition_id` for the mutable WHAT
   definition line, its source-project locator and its bounded-context
   declaration; keep it distinct from every immutable Product and release
   identity.
5. Bind `constitution.stdo.source`, its non-operative selector, the exact
   basis URI and manifest digest, every additional constitutional
   authority and the relevant basis-qualified entrypoints; confirm that
   the set collectively defines axioms, ontology, epistemology, taxonomy
   and semantics for the governed scope (§3).
6. Bind the agent bootstrap entrypoint and portable targets relative to
   the resolved `product.source_project`, then let the manager preflight
   every target and install or refresh only their marker-bounded
   discovery blocks.
7. Bind, or explicitly empty, the local axiom, override and
   disambiguation collections (§6).
8. Bind at least one accepted collective reference-frame basis, its
   admitting authorities and its exact governed scope (§7).
9. Write or confirm the current Goals carrier, run the goals to intent to
   product steps, and bind the resulting Intent and Product entrypoints.
10. Gather, derive, classify and bind the live specification or
    requirement surfaces without creating a co-equal rival.
11. Bind at least one build tenant, including its root, design and
    implementation surfaces, and bind any shared realisation law (§8).
12. Bind the Goals carrier, the ticket lanes, the comments root and the
    optional sprint root.
13. Bind every known product-composition edge explicitly, including its
    target definition identity, relation authority and non-empty contract
    set (§9).
14. Validate the JSON shape, assert URI and URI-reference syntax,
    synchronise and verify the exact installed basis, then resolve every
    URI and perform the cross-definition identity, composition,
    constitutional-sufficiency and authority-congruence checks.

Once a bound requirement set is the live constitutional surface, no rival
monolithic requirements document should remain co-equal authority with it. This
keeps requirement truth structurally clear, derivable and non-monolithic
without prescribing its folder (P6, P2).
