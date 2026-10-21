# PROFILES

Tier 3. Owns the boundary between the core and the profiles, the
declared-binding rule and the import rule that every profile applies
(§1), and indexes the profiles (§2 to §6). A profile is a domain or
operational specialisation of the method; the members of tiers 1 and 2
are the core.

## 1. The boundary

The core names no runtime, no carrier and no executor. Terms owned outside
the core, by a profile or a realisation, never enter tier 1 or 2: graph, edge, vector, ledger, event
log, worksite, HoG, Markov overlay, screen, entity cut, and the design
profile's IACS and Prime. The traversal record and the functor kinds F_D,
F_P and F_H are tier-1 calculus terms owned by AXIOMATIC_CALCULUS §5, and
"module" is a generic term under [ASSURANCE](ASSURANCE.md); neither is
restricted here. A profile may bind a core mechanism to one of these;
the binding is declared in the profile with its direction, preserved
meaning, narrowed scope and invalidation. In this member "binding" means
that declared binding of a core mechanism; a Product's adoption binding is
[PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)'s,
and a carrier binding to a typed contract is [UX §7](UX.md#7-carrier-binding)'s;
the three are not interchanged (P0 boundary, P1). A concrete application
of the declared-binding rule is ODD's specialisation of F_P and F_H, which
[ODD §5 Probabilistic compute](ODD.md#probabilistic-compute) owns in the
graph-native context.

Import rule. A profile imports the generic families of tiers 1 and 2 that
its rules rest on, and owns only its own bindings: the terms and choices
it adds for its domain or operation, among them the declared bindings
above (P1, P6). It imports each concept it uses from a member of tiers 1
and 2 under
[FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members),
which states what an import is, and restates none of that member's rules.
Its family table, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
names each imported family by its ID and the section that holds its table,
in the premise column; the profile's rules rest on that family's
consequences, with the standing FOUNDATIONS §3 gives them, and the
family's rules and choices keep their owners. A profile that refines
another profile declares the refinement in its lead; the refined profile
keeps its rules, and the refining profile owns only what it adds (P1, P6).
Purpose and material relation:
each profile table cites the families it rests on without restating them,
so no generic rule gains a second owner in a profile and no choice a
profile adds is presented as following from the foundations (P6, P1).

A worked application, a hello world or a data mapper is an external test
subject; its particulars cannot become generic method functionality by
precedent.

## 2. Graph execution

Graph execution is two tier-3 members, indexed here; each states its
law in full and declares its bindings under §1 (P0 boundary, P1):

| Member | Binds or adds |
|---|---|
| [ODD](ODD.md) | the bounded step of FOUNDATIONS P0 to one vector or edge traversal and the graph-native F_P, F_D and F_H shorthands, with F_P and F_H as declared specialisations of SPEC_METHOD §5 ([§5 Probabilistic compute](ODD.md#probabilistic-compute)); the refinement of ACTIVATION §4 to graph functions, with the cumulative environment law of §11.8 declared as its specialised contract for carrying earlier outputs ([§5 Graph functions](ODD.md#graph-functions), [§11.8](ODD.md#118-cumulative-environment-law-is-mandatory)) |
| [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md) | an optional closed model-family signature over one exact `a_c` basis of AXIOMATIC_CALCULUS for immutable occurrence histories over a mutable subject, with OP-001 to OP-007 |

The ownership split of graph execution (runtime, product, service layers)
is [ODD §10](ODD.md#10-what-an-odd-product-is); the worker's internal
solution strategy stays outside the framework under
[ODD §5](ODD.md#probabilistic-compute). Where another member says that
this section keeps the ODD binding, the binding is the one ODD states and
this section indexes (P0, P1).

## 3. Software design

[DESIGN_MODULE](DESIGN_MODULE.md) is the software-design profile. It
imports the core and binds: ontology-first derivation of operation
identities from discovered functionality through logical completeness,
Prime contraction, the irreducible architectural carrier set and its
projections; proportional design sequencing with the decision-complete
design gate; bounded frame conservation; native constructability;
capability and foundation selection; transformation admission
completeness; invariant reconstruction sufficiency; computational
realisation projection; the module taxonomy and realisation rules; and
the design review questions and checklist. Its design-to-module evidence
route, module-derived unit tests and module lifecycle confirmation are
ASSURANCE §14 to §16, and its core rule and non-goals SPEC_METHOD §2
Realisation shape. The per-boundary cost of the derivation chain is
decided there (DESIGN_MODULE §5 Proportional design sequencing, §7 Gate
and retrospective work) (P2, P0).

## 4. UX

[UX](UX.md) is the UX profile. It refines DESIGN_MODULE for modules that
realise a UX surface, imports the core, and binds: the Elm process model
with typed State, Msg, Update, View, Cmd and Sub; the boundary between UX
messages and admitted product carriers; the state transition law; the
effect membrane; binding to AssetSurface or an equivalent typed contract;
view continuation and the Msg-replay proof; view shape; type sharing with
runtime validation at untrusted seams; the accessibility minimum;
realisation discretion; adoption with the scaffold and exemption law and
UX sprint compliance escrow; the failure patterns and review questions;
and its refinements of the core result algebra, each value mapped to one
core value (UX §15). Its binding of TICKETS §3's generalised escrow terms
is declared in its lead (P6, P2).

## 5. World model

[WORLD_MODEL](WORLD_MODEL.md) is the world-model profile. It imports the
core and binds: the imported product-lineage concepts and the Builder
Project specialisation; the Markov-object construct at candidate status
with its effective blanket, working refinements, epistemic status and
promotion gate; the core claims and units; entity recovery and the entity
cut as the published identity-bearing unit, with its admissibility,
discrimination and publication law; the attribute ledger; the
representation, materialisation and publication laws; Markov-object
overlay construction; saturation; composition of local artifacts;
projection; the control and data planes; the proof law and
world-model-driven development; and its refinements of the core result
algebra, each value mapped to one core value (WORLD_MODEL §14). Its
binding of FOUNDATIONS §2 Object
and P3's boundary claim to the entity cut is declared in its lead.
Nothing in the core depends on the construct being established (P3, P6).

## 6. Engagement baseline

[EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md) is the optional
engagement-baseline profile. It imports the core and describes the
executive configuration, one configuration in the sense of
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration), with three
engagement frames (Executive, Worker, Reviewer) and a catalogue of
specialist frames, mapped onto the law of tiers 1 and 2. Its frame names
bind the responsibilities that configuration allocates under
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation),
not roles imported by spelling, as its lead declares (P1, P6).
