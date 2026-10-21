# IDENTITY

Tier 1. Owns identity law: scoped identity with its uniqueness, type and
stability laws; readable and opaque identity; the identity hierarchy; the
split between engine-owned and domain-owned identity; authority identity
and its conservation (STDO-UP-004); domain overrides of default identity
formats and their publication; parsing; the boundary between object
identity and release version; the minimum questions for an identity
surface; lawful and unlawful examples; and the consequence for
implementations. It consumes [FOUNDATIONS](FOUNDATIONS.md) §2, where
Object (a subject with scoped identity of authority, kind and value),
Authority with its kinds, and Basis are defined once, and adds no
definition to tier 1. [AC-002](AXIOMATIC_CALCULUS.md#ac-002-scoped-identity)
applies the scoped identity of §2 to every identity within the calculus,
with a map of its coordinates to authority, kind and value. The identity
of one calculus edition is
[AXIOMATIC_CALCULUS §8](AXIOMATIC_CALCULUS.md#8-calculus-identity), which
this member does not restate. Release identity, its names and its forms are
the release law of [RELEASE](RELEASE.md); this member states only the
boundary between it and object identity. Each clause names the principle
(P0 to P6) that requires it, as
[FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing) requires:
identity is P3's commitment and authority P6's.

## 1. Position

Identity is scoped, typed, unique, and stable enough for the governed
purpose. Identity is not a flat global string convention; it is made
unique by hierarchy and type (P3). That means:

- the same literal token may be lawful in different scopes when its
  authority and kind differ;
- one string format is not sufficient to define identity across all
  products and runtime surfaces; and
- a human-readable form may help recognition, but readability is
  secondary to uniqueness and stable governed meaning.

The engine should carry identity safely. The domain should define
semantic identity law for its own constitutional objects (P3, P6).

### Foundation to law

This member is material family F8, identity. The table below shows which
of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. Instance premises,
which the commitments do not supply:

- (i) a governed project holds objects of many kinds, some owned by a
  runtime or engine and some by the domain that defines them;
- (ii) identities are written in serialised or readable forms that people
  and parsers read;
- (iii) a project publishes releases, whose versions are coordinates of
  the release and not of each object.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent); (i) | By P3 an identity is declared as (authority, kind, value), and by (i) a project holds objects of many kinds and owners, so identity is always scoped and should be interpretable at minimum through authority, kind and value; it is unique within its lawful scope rather than as a naked global string, and, because kind is a coordinate, different kinds of thing should not be collapsed into one identity space | [Scoped identity](#scoped-identity), [Uniqueness](#uniqueness), [Type](#type) | the optional further coordinates and the identity kinds in use: the authority that owns the objects, under [§5](#5-authority-split) | 2 |
| P3 (independent), P4b (derived from P0 and P2) | By P3 identity survives admissible change, and by P4b a recorded identity is a fact later steps rely on, so identity should remain stable for the lifecycle it serves, and a changed identity should be related explicitly to the old one, never silently reused for a different object | [Stability](#stability) | none | 2, 9 |
| P3 (independent), P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise); (i) | By P3 a boundary is a claim with a proof obligation, and by P6 a claim holds only on its evidence, so a boundary claim names its object, evidence and basis and holds only as far as that evidence goes. By P5 a claim beyond the evidence is undecided, so a sufficiency claim is bounded by its task and is not completeness, and the stronger statistical Markov boundary stays a hypothesis that no work relies on as established | [Boundaries and sufficiency claims](#boundaries-and-sufficiency-claims) | the Markov-object construct and its epistemic status: [WORLD_MODEL §4](WORLD_MODEL.md#4-the-markov-object-construct), a refinement; material sufficiency: [RF-003](REFERENCE_FRAME.md#rf-003-material-sufficiency) | 2, 6, 9 |
| P3 (independent), P1 (independent); (ii) | By P1 a readable form carries no meaning of its own, and by P3 uniqueness is a property of the scope, so readability is a convenience for recognition: by (ii) people and parsers read the form, an opaque identity is lawful, a readable one is lawful only while it preserves uniqueness in scope, and no reader should infer that a readable form is safer or more authoritative | [§3](#3-readable-and-opaque-identity) | whether an identity is opaque, readable or hybrid: the authority that owns it, under §5 | 2, 6 |
| P3 (independent); (i), (ii) | By P3 kind is a coordinate of identity, and by (i) and (ii) different kinds and owners serialise alike, so identity should be made unique by hierarchy where appropriate, and a family and its members, or a runtime identity and a domain identity, stay distinct kinds even where both serialise as strings | [§4](#4-identity-hierarchy) | the general model `authority / kind / value / revision`: this member; which segments a serialisation shows: the authority that owns the identity | 2 |
| P3 (independent), P6 (independent); (i) | By P6 an authority decides only what it owns, and by (i) a runtime and a domain own different objects, so a runtime may give its own objects opaque identities under its own generation rules and should not impose domain grammar on domain objects; the domain owns the semantic identity grammar of its constitutional objects, which the runtime may transport but should not silently invent their meaning | [§5](#5-authority-split) | the generation rules of runtime identities: the runtime; the domain's identity kinds, distinctions, uniqueness and parsing: the domain | 2, 9 |
| P6 (independent), P3 (independent), P4b (derived from P0 and P2) | P6 makes authority a permission that capability, labels and reachability never create, and P3 scopes every identity by authority and kind, so authority is an identity-bearing relation whose owner, kind, subject, scope and basis must survive every carrier: composition, delegation and projection restrict it or carry it faithfully and never widen it. P4b makes an authority decision a step-produced fact that cannot be re-acquired, so elevation, transfer, split, merge, proxy grant, revocation and retirement need an explicit authority decision with an identifiable basis, and a recorded ruling keeps its coordinates and cannot be widened by recording. Proxy identity and human-authority identity stay distinct for the same reason as any two kinds under P3 | [§6](#6-authority-identity-and-conservation-stdo-up-004) | what creates no authority and what a proxy can never decide: [FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), with this section's instances; the nine grant fields: this section; each authority decision and proxy grant: the authority that issues it; the term under which a profile projects the human-authority relation: that profile | 2, 7, 9 |
| P3 (independent), P6 (independent) | By P3 an identity's grammar belongs to its owner, and by P6 a default is not that owner's decision, so a default identity format that a runtime realisation publishes is lawful only while derived domains may override it; an override must keep what P3 requires (scoped uniqueness, kind distinction, deterministic parsing or reading, non-aliasing between family and member identities and stable downstream traceability), and by P6 it is published in domain authority, not only as regex assumptions hidden in implementation code | [§7](#7-default-formats-and-overrides) | the defaults: the bound runtime realisation ([DESIGN_MODULE §12](DESIGN_MODULE.md#identity-defaults-from-a-bound-runtime-realisation)); each override and its publication surface: the domain | 2, 8 |
| P3 (independent), P1 (independent); (ii) | By P1 a pattern over prose is not the identity it matches, and by P3 kinds stay distinct, so regex over prose is at most a provisional extractor, and a parser distinguishes concrete identity kinds from grouping labels, and subordinate identities from the identity their readable form derives from | [§8](#8-parsing) | whether the domain needs family identities: the domain | 2, 6 |
| P3 (independent), P6 (independent); (iii) | By P3 an object's identity and a release's identity are different coordinates, and by (iii) versions belong to releases, so release version is not object identity, and object identity, release identity, publication or revision coordinates and mutable discovery selectors may relate and are not interchangeable; by P6 none grants the other's authority | [§9](#9-release-version-boundary) | release identity, its names and its forms: [RELEASE](RELEASE.md) | 1, 2 |
| P3 (independent), P6 (independent) | By P3 and P6 an identity surface must let a reader recover owner, kind, scope and relations, so an identity surface that cannot answer the minimum questions is under-defined | [§10](#10-minimum-questions) | the seven questions: this member | 2 |
| P3 (independent), P1 (independent), P0 (recovered) | By P3 and P1 identity is read through its published law, not mined from text, so implementations should prefer typed identity readers and published identity law over regex mining; by P0 a repair is bounded to the step at hand, so the first lawful repair contains the immediate bug, and the enduring repair publishes identity law and moves implementations onto it | [§12](#12-consequence-for-implementations) | a policy of this member: the enduring repair publishes identity law and moves implementations onto it | 2, 8 |

§11 applies these rows to examples and decides nothing beyond them. The
table is stated here. Purpose and material relation: an actor
started on this member sees which identity rules follow from the
foundations and which are choices, with the owner of each choice, so no
choice is presented as derived (P6, P3).

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, scoped, unique and typed identity: [AXIOMATIC_CALCULUS §4 AC-002](AXIOMATIC_CALCULUS.md#ac-002-scoped-identity), which applies the scoped identity to every identity in the calculus with a map of its coordinates; [WORLD_MODEL §5](WORLD_MODEL.md#5-core-claims), where fully qualified naming applies it, and the [WORLD_MODEL family table](WORLD_MODEL.md#foundation-to-law), whose row for the entity cut imports F8; [PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence), where a definition, Product, context or tenant URI is an identity carrier under this law and not a self-authorising string; [§3](#3-readable-and-opaque-identity), where a readable identity is lawful only while it preserves uniqueness in scope; [§7 Derived domain overrides](#derived-domain-overrides), whose override keeps scoped uniqueness and kind distinction; [§10](#10-minimum-questions), questions 1 to 3.
- Row 2, stability: [§7 Derived domain overrides](#derived-domain-overrides), whose override keeps stable downstream traceability; [§10](#10-minimum-questions), question 4; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 21.
- Row 3, boundaries and sufficiency claims: [WORLD_MODEL §4](WORLD_MODEL.md#4-the-markov-object-construct), which refines it and states the epistemic status of its construct; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 10 and 12.
- Row 4, readable and opaque identity: [§10](#10-minimum-questions), question 5, which asks whether the readable form is over-trusted; otherwise no separate consumer applies, because whether an identity is opaque, readable or hybrid is the owning authority's choice under §5, and no section of another member names this rule.
- Row 5, identity hierarchy: [§7 Derived domain overrides](#derived-domain-overrides), whose override keeps family and member identities from aliasing; [§8](#8-parsing), where a family identity is published as its own kind and not read from string shape; [§10](#10-minimum-questions), question 6; [§12](#12-consequence-for-implementations), which avoids silent coercion between family and concrete identities.
- Row 6, the authority split: [§7 Derived domain overrides](#derived-domain-overrides) and [Override publication surface](#override-publication-surface), where a domain overrides a runtime's defaults for its own kinds and publishes the override in domain authority; [§10](#10-minimum-questions), question 7; [§12](#12-consequence-for-implementations), which avoids leaking engine identity grammar into domain semantics.
- Row 7, authority identity and conservation: [FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), whose proxy limit takes the contents of a proxy grant from this section; [EVALUATION §5](EVALUATION.md#5-acceptance), which applies the proxy sentences to acceptance; [DESIGN_MODULE §5 Authority model](DESIGN_MODULE.md#authority-model), where delegation, elevation, transfer and retirement carry an explicit authority decision, [Capability and foundation selection (UP-023)](DESIGN_MODULE.md#capability-and-foundation-selection-up-023), where reuse transfers no authority, and [§7 Computational realisation projection (UP-019)](DESIGN_MODULE.md#computational-realisation-projection-up-019), where a component's roles preserve the authority relation under this section.
- Row 8, default formats and overrides: [DESIGN_MODULE §12 Identity defaults from a bound runtime realisation](DESIGN_MODULE.md#identity-defaults-from-a-bound-runtime-realisation), whose published defaults take their standing and override law from here, and the [DESIGN_MODULE family table](DESIGN_MODULE.md#foundation-to-law), whose row for identity defaults imports F8 for the owner's override; [§12](#12-consequence-for-implementations), whose enduring repair publishes explicit identity law.
- Row 9, parsing: [§7 Derived domain overrides](#derived-domain-overrides), whose override keeps deterministic parsing or reading; [§10](#10-minimum-questions), question 6; [§12](#12-consequence-for-implementations), which prefers typed identity readers over regex mining.
- Row 10, the release version boundary: [§10](#10-minimum-questions), question 7, which asks whether an identity is a release identity; otherwise no separate consumer applies: release identity, its names and its forms are RELEASE's, as the choice column states, which imports this member at its lead and applies no rule of this section, and SPEC_METHOD §6 states the boundary from the lineage side and names this section nowhere.
- Row 11, the minimum questions: no separate consumer applies. The questions are asked by whoever defines or audits an identity surface, each applying a rule traced above; the seven questions are this member's choice, and no section of another member names them.
- Row 12, the consequence for implementations: no separate consumer applies. The preference for typed readers and the two-step repair are a policy of this member for implementations; a project that repairs an implementation applies them under its own design authority, and no section of another member names this section.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Core law

### Scoped identity

Identity is always scoped. At minimum, identity should be interpretable
through authority, kind and value. So the minimum semantic model is:

```text
identity = authority + kind + value
```

This is the scoped identity of an Object (FOUNDATIONS §2). Optional
additional coordinates may include parent scope, revision, publication
version and temporal coordinates (P3).

### Uniqueness

Identity is unique within its lawful scope. The requirement is not that
every identity looks globally unique as a naked string. The requirement is
(P3):

- no two live objects of the same kind may share the same identity within
  the same authority scope;
- aliasing across scopes remains explicit; and
- serialisation preserves enough hierarchy to prevent accidental
  collision.

### Type

Identity is typed. Different kinds of thing should not be collapsed into
one undifferentiated identity space. Examples of distinct identity kinds
include goal, intent, requirement, requirement_family,
acceptance_criterion, scenario, design_decision, published_function,
carrier_surface, release, install, run, function_call, continuation and
event. The method does not treat a family identity as if it were a
concrete requirement identity, or a release version as if it were object
identity (P3).

### Stability

Identity should remain stable for the governed lifecycle it serves. This
does not mean every identity is immutable forever. It means identity is
stable enough to support traceability, comparison, replay, publication
and supersession. If an identity changes, the method should make the
relationship explicit rather than silently reusing the old identity for a
different object (P3, P4b).

### Boundaries and sufficiency claims

An object's boundary, what belongs to the object and what its identity
does not depend on, is a claim with a proof obligation
([FOUNDATIONS §3](FOUNDATIONS.md#3-commitments), P3), not a property that
its storage, schema or name establishes. A boundary claim names its
object, the evidence that supports it and the basis it holds on, and it
holds only as far as that evidence goes (P3, P6). A claim that an
object's observed boundary state is sufficient for a task is a material
sufficiency claim of
[RF-003](REFERENCE_FRAME.md#rf-003-material-sufficiency), bounded by
that task: it is not completeness, and it does not establish that the
boundary screens the object's interior from everything outside it. That
stronger claim, a statistical Markov boundary, is a hypothesis
([FOUNDATIONS §5](FOUNDATIONS.md#5-hypotheses)); no work relies on it as
established, and a profile that uses such a construct states its
epistemic status (P5). Purpose and material relation: this law was
decided only in the optional world-model profile, so a Product that does
not adopt that profile had no rule for boundary claims, and the common
single ownership requirement, item 8, requires generic law to be
available without an optional profile; [WORLD_MODEL §4](WORLD_MODEL.md#4-the-markov-object-construct)
refines it.

## 3. Readable and opaque identity

Identity may be opaque, such as a GUID or UUID; human-readable, such as
`REQ-F-CAPABILITY-001`; or hybrid, where one component is readable and
another is opaque. The governing rule is that readability is a
convenience for recognition, and uniqueness and scoped meaning are the
actual law (P3, P1). Therefore:

- a GUID is lawful even when it carries no human meaning;
- a readable identity is lawful only if it still preserves uniqueness in
  scope; and
- no reader should infer that a readable identity is safer or more
  authoritative than an opaque one merely because it looks meaningful.

## 4. Identity hierarchy

Identity should be made unique by hierarchy where appropriate. One useful
general model is:

```text
authority / kind / value / revision
```

Not every serialisation needs all four visible segments, but the semantic
model should be available (P3). Examples:

- `(<product-authority>, requirement, REQ-F-CAPABILITY-001)`
- `(<product-authority>, requirement_family, REQ-F-CAPABILITY)`
- `(<runtime-authority>, run, 550e8400-e29b-41d4-a716-446655440000)`
- `(<release-authority>, release, 1.0.0-rc.1)`

The important point is that `REQ-F-CAPABILITY` and `REQ-F-CAPABILITY-001`
are not the same kind of identity, and that a runtime `run_id` and a
domain requirement identity do not belong to the same semantic category
even if both serialise as strings (P3).

## 5. Authority split

### Engine-owned identity

The substrate or runtime may define default identities for runtime-owned
objects, such as runs, function calls, jobs, execution frames,
continuations and events. For these, the engine may use opaque identities and engine-local
generation rules. Those rules should optimise for uniqueness, replay
safety and event-stream integrity. The engine should not impose
domain-specific semantic grammar on domain-owned objects (P3, P6).

### Domain-owned identity

Derived domains own the semantic identity grammar for their own
constitutional objects, such as requirements, requirement families,
acceptance criteria, scenarios, ADRs or design decisions, and published
domain assets. The domain defines which identity kinds exist, how they
are distinguished, what makes them unique, and how they are parsed or
read. The runtime may transport those identities, but it should not
silently invent their meaning (P3, P6).

## 6. Authority identity and conservation (STDO-UP-004)

Authority is an identity-bearing semantic relation, not a display label,
capability string, actor identity or reachable code path. Its identity
preserves owner, kind, governed subject, scope and governing basis (P6,
P3; the Authority
object and its kinds are FOUNDATIONS §2).

What composition, delegation, adapters, wrappers and registries may do
with admitted authority, what creates none, and which changes need an
explicit authority decision are stated once at
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), What
creates no authority. Its instances for an identity-bearing relation are
these: a projection is such a carrier, and actor identity, payload shape
and available capability create no authority (P6, P4b).

Human authority may act directly or through an explicitly admitted
bounded proxy. Proxy actor identity and human-authority identity remain
distinct; a profile's own surfaces may project the human-authority
relation under that profile's term (PROFILES). A proxy grant names its
grantor, actor, subject, scope, permitted and excluded decisions,
validity, delegation rights, revocation and provenance (P6, P3).

A direct or proxied decision preserves its source, subject and basis,
acting identity and mode, scope, change class, disposition and
supersession. Recording a ruling cannot widen it. What a proxy can never
decide is stated at
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds); for
authority identity its instances are that proxy authority does not make
implementer self-review independent
([EVALUATION §3](EVALUATION.md#3-independent-assessment)) and confers no
unrelated runtime or domain authority (P6, P4b). EVALUATION §5 applies
this law to acceptance.

## 7. Default formats and overrides

### Derived domain overrides

Default identity formats that a bound runtime realisation publishes are
starter conventions and convenience contracts, not universal doctrine;
they are lawful only so long as derived domains may override them (P3,
P6). What such a realisation publishes, and for which surfaces, is
realisation law outside this member
([DESIGN_MODULE §12](DESIGN_MODULE.md#identity-defaults-from-a-bound-runtime-realisation)).

Derived domains may override identity format and structure for their own
kinds. An override is lawful only if it preserves (P3):

- scoped uniqueness;
- explicit kind distinction;
- deterministic parsing or reading;
- non-aliasing between family and member identities; and
- stable downstream traceability.

Overrides are published in domain authority. They do not exist only as
ad hoc regex assumptions hidden in implementation code (P6, P3).

### Override publication surface

When a domain overrides defaults published by its bound runtime
realisation, the override is published in a lawful domain authority
surface rather than inferred only from implementation code (P6, P3).

At minimum, the domain should publish (P3, P6):

- the identity kinds in scope;
- the serialisation or readable form used for those kinds;
- the scope or hierarchy that makes them unique; and
- the distinction between grouping identities and concrete executable or
  traceable identities.

Suitable publication surfaces include (P6, P3):

- the product definition (conventionally `PRODUCT.md`) for the active
  identity kinds and their governed role;
- requirement surfaces for obligations around identity stability or
  uniqueness;
- design or ADR surfaces for parsing, serialisation or normalisation
  rules; and
- a dedicated identity registry surface, such as a project's own
  `IDENTITY.md`, when the domain has enough complexity to justify one.

The important rule is that identity overrides are visible in domain
authority, auditable, and recoverable without reverse-engineering regexes
from implementation code (P6, P3).

## 8. Parsing

Regex extraction from prose is not a complete identity model. At most,
regex may be a provisional extractor over a surface whose identity law is
already defined elsewhere (P3, P1). Therefore:

- a parser distinguishes concrete identity kinds from grouping labels;
- family markers, display aliases and prose headings are not promoted
  into executable or traceable object identities unless the governing
  identity law says they are first-class identities of their own kind;
  and
- acceptance criteria, test cases and similar subordinate identities are
  not collapsed into requirement identity merely because their readable
  form is derived from a requirement token.

If a domain needs family identities, it should publish them explicitly as
`requirement_family` identities rather than rely on string-shape
accidents (P3).

## 9. Release version boundary

Release version is not the same thing as object identity (P3). Under the release law
([RELEASE §1 and §2](RELEASE.md#2-release-identities), with
[SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release)):

- an immutable release cut is the only exact operative release
  identifier;
- the mutable version-line selector only names the highest-ordinal
  published immutable cut on its line (FOUNDATIONS §2);
- release version is a release-process fact; and
- release version is not the live constitutional identity of every
  object in the project.

So the method distinguishes object identity, release identity,
publication or revision coordinates, and mutable discovery selectors.
These may relate, but they are not interchangeable (P3, P6).

## 10. Minimum questions

When defining or auditing an identity surface, ask (P3, P6):

1. What authority owns this identity?
2. What kind of thing does this identity denote?
3. What scope makes it unique?
4. Is the identity stable enough for the governed lifecycle?
5. Is the readable form only convenience, or is it being over-trusted?
6. Can a parser distinguish families, members, aliases and revisions
   without ambiguity?
7. Is this an engine or runtime identity, a domain semantic identity, or
   a release identity?

If those questions cannot be answered, the identity surface is
under-defined (P3).

## 11. Examples

### Lawful

Lawful (P3):

- runtime event identities generated as UUIDs by a consumer-bound runtime
  realisation;
- requirement identities such as `REQ-F-CAPABILITY-001` when the domain
  defines them as concrete `requirement` identities;
- family identities such as `REQ-F-CAPABILITY` when the domain defines
  them separately as `requirement_family`; and
- acceptance-criterion identities such as `REQ-F-CAPABILITY-001-AC-01`
  when the domain defines them as a separate `acceptance_criterion`
  identity kind.

### Unlawful

Unlawful (P3):

- treating `REQ-F-CAPABILITY-*` or `REQ-F-CAPABILITY` as a concrete
  requirement merely because a broad regex matched it;
- using release version as the identity of every live source object; and
- assuming a readable string is globally unique without its authority
  and kind.

## 12. Consequence for implementations

Implementations should prefer typed identity readers, explicit
identity-kind distinctions, and source-of-authority parsing contracts.
They should avoid broad regex mining as the real identity model, silent
coercion between family identities and concrete identities, and leaking
engine identity grammar into domain semantics (P3, P1).

If a project currently relies on those patterns, the first lawful repair
is to contain the immediate bug. The enduring repair is to publish
explicit identity law and move implementations onto it (P3, P0).
