# M03 Runtime Graph Function Registry Derivation

**Ticket**: T-177
**Status**: Active design
**Date**: 2026-06-30
**Change class**: design_reframe

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`
- `specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `.ai-workspace/tickets/active/T-177-design-live-abg-runtime-graph-function-registry-lookup.md`

## Problem

The current TypeScript line has static publication inventories and several
qualified catalogs. Those prove that a program or module declares surfaces. They
do not provide a live, replay-derived registry that ABG can query during
runtime to find lawful graph-function candidates for an edge, consequence, or
other traversal situation.

Downstream products also need a lawful way to publish specialized graph
functions and plugins. That does not weaken ABG ownership. It means product
libraries must enter GTL/ABG through declaration, admission, registry
projection, deterministic eligibility, and emitted selection truth.

## Decision

The runtime graph-function registry is an ABG M03 runtime capability over GTL
declarations.

It has four layers:

1. **GTL publication**: system libraries and product libraries declare graph
   functions, overlays, candidate families, public starts, plugin result
   interfaces, and optional refinement or override law.
2. **ABG admission**: ABG admits or rejects the declared entries and emits
   registry admission truth.
3. **ABG projection and lookup**: ABG replays registry admission truth into a
   registry projection and exposes read-only lookup results.
4. **ABG selection and invocation**: when a candidate affects traversal, ABG
   emits selection truth before invoking the selected graph function.

The registry is not `catalogGraphFunctionRefs`. That field remains a static
publication inventory inside conformance. It may be source evidence for
admission, but it is not registry truth and not traversal selection truth.

## WHAT-To-HOW Signal Application

| Signal | T-177 design value |
| --- | --- |
| purpose | Find lawful runtime graph-function, overlay, public-start, candidate-family, and library entries for a situation. |
| owner | ABG owns registry admission, projection, lookup, selection truth, and invocation. GTL owns declarations. Product libraries own specialized declaration content only. |
| authority boundary | Lookup is read-only. Traversal-affecting selection is ABG-emitted runtime truth. Plugins provide proposed advice only. |
| source truth | Admitted GTL system-library and product-library declarations, registry admission events, and current ABG traversal projection. |
| admitted inputs | Library declarations, candidate-family declarations, plugin result-interface contracts, policy refs, override/refinement claims, provenance, proof-readiness evidence. |
| emitted truth | Registry entry admission/rejection, plugin advice admission/rejection, and graph-function selection events. |
| projection outputs | Registry projection, candidate eligibility rows, lookup result, selection audit rows. |
| query outputs | Read-only candidate list, rejection/exclusion diagnostics, registry entry status. |
| rejection taxonomy | unknown entry, stale entry, wrong interface, wrong source/target, missing context, authority mismatch, proof not ready, unlawful shadow, plugin advice invalid, no eligible candidate. |
| readiness gates | T-176 capability model accepted; DMM IACS accepted; product-plugin advice cannot select; emitted selection proof exists before realization closure. |
| proof obligations | Negative public-surface proof, shadow-prevention proof, plugin-advice authority proof, event-sourced selection proof, lookup-vs-selection proof. |
| invariants | One registry truth projection; no product-local registry; no query-created selection; no unadmitted plugin advice. |
| forbidden authority | Product plugins shall not emit, select, invoke, mutate registry truth, close, continue, re-enter, or bypass eligibility. |
| downstream interpretation boundary | Downstream products may interpret lookup and selection facts but cannot make them authoritative. |

## System And Product Libraries

System libraries contain generic graph functions and companion surfaces that
multiple ODD products need identically. They are GTL/ABG-owned.

Product libraries contain downstream-specialized graph functions, overlays,
policies, candidate families, public starts, and plugins. A product library is
lawful only when declared through GTL and admitted by ABG. Product-library
entries may refine or specialize system-library entries only through explicit
refinement or override law plus ABG eligibility proof. Otherwise the admission
rejects them as unlawful shadow entries.

## Existing Static Surface Classification

| Existing surface | Classification | Registry relationship |
| --- | --- | --- |
| `GraphFunction` | GTL declaration surface | May be cited by a library entry; not registry truth by itself. |
| `Module` | GTL publication container | Carries declarations and publication inventory; not runtime selection truth. |
| overlays | GTL declaration / runtime overlay-frame input | May constrain eligibility after admission; not a mutable registry. |
| public starts | GTL declaration / M04 start binding | May be declared as registry-eligible starts; ABG admission decides runtime registry truth. |
| plugin result interfaces | GTL contract declaration | Define admitted advice payload shape; do not confer selection authority. |
| candidate families | GTL grouping declaration | Registry input only after ABG admission. |
| `catalogGraphFunctionRefs` | static publication inventory | Publication inventory only; it may support admission but cannot become registry projection or selection truth. |

## Helper Authority Classification

| Helper | Authority classification | Placement |
| --- | --- | --- |
| `constructGtlLibraryEntryDeclaration` | GTL declaration constructor | Public GTL library surface; no ABG runtime import. |
| `constructProductPluginSelectionAdvice` | product proposal/advice constructor | Public GTL/product proposal surface; ABG later admits or rejects it. |
| `constructRegistryLookupRequest` | runtime query input constructor | ABG-owned or neutral query input; not a GTL declaration. |

`RuntimeEvent` shall not appear in the public GTL library declaration or
product proposal fields. Runtime event admission, emission, registry
projection, selection, and invocation remain ABG-owned.

## Startup Admission Shape

Startup admission is ABG-driven. It mirrors and extends the existing ABG
public-start path:

```text
M04 public start
  -> runEngineStart
  -> ABG admits execution basis
  -> ABG consumes registry startup inputs
  -> ABG emits registry admission events
  -> ABG replays registry projection
  -> start -> iterate runner uses registry lookup/selection before traversal effects
  -> ABG emits graph_function_selected before graph_call_opened
```

The downstream product may author two inputs:

1. product startup config, such as enabled product libraries, product
   namespace/owner/version pins, overlay refs, plugin refs, proof/readiness
   refs, and policy refs;
2. GTL product-library declarations, such as graph functions, overlays, public
   starts, candidate families, plugin result interfaces, and
   refinement/override claims.

Those inputs are inert until ABG consumes them. ABG typechecks/conforms the GTL
definitions, admits or rejects registry entries, emits
`registry_entry_admitted` or `registry_entry_rejected`, replays the registry
projection, and exposes lookup/selection to the runner. Public GTL library
declarations and product startup config are source inputs; ABG-emitted
selection truth is the only traversal-affecting output.

## Downstream Usage Shape

An odd_glc install can declare an overlay graph plus four custom bootstrap and
deployment graph functions as GTL product-library entries. ABG admits those
entries, filters them against generic system-library entries, may invoke a
consequence plugin over an immutable candidate view, admits the plugin advice
only as advice, emits selection truth, and invokes the selected graph function
itself. odd_glc may also create product startup config that identifies which
product library, overlays, plugins, proof/readiness refs, and policy refs ABG
should consider. odd_glc supplies product vocabulary, product config, GTL
declaration content, and policy declarations; it does not own conformance,
admission, lookup, registry mutation, selection, runner activation, or
invocation.

## Canonical Downstream Pickup Path

The canonical pickup path for downstream product graph functions, overlays,
plugin contracts, public starts, candidate families, and GTL bindings is:

```text
downstream product source
  -> GTL product-library declarations
  -> product registry startup config
  -> M04 public start / runEngineStart
  -> ABG conformance and registry startup admission
  -> registry_entry_admitted / registry_entry_rejected
  -> replay-derived RuntimeRegistryProjection
  -> ABG lookup / selection / invocation
```

No downstream product may replace this path with a startup shell, file scanner,
product-local registry loader, event appender, local replay projection, or
selected-function dispatcher. Such a shell would create duplicate parallel
truth beside ABG startup. If odd_glc needs four bootstrap/deployment graph
functions and an overlay graph picked up, it publishes the GTL declarations and
startup config; ABG consumes, admits, projects, selects, and invokes.

## Product-Plugin-Assisted Selection

Product-plugin-assisted selection is a first-class registry use case.

The plugin is product-specialized, but selection is ABG-owned:

```text
ABG observes traversal situation
  -> ABG projects registry state
  -> ABG filters eligible candidates with F_D rules
  -> ABG invokes plugin.consequence.C when policy calls for product advice
  -> plugin returns advice, ranking, constraints, or rationale
  -> ABG admits or rejects the plugin output
  -> ABG validates admitted advice against eligible candidates
  -> ABG emits graph_function_selected when traversal is affected
  -> ABG invokes the selected graph function
```

A consequence plugin built for odd_glc may advise ABG about lifecycle-stage
fit, residual pressure, or specialization policy. It shall not call the next
graph function. It shall not mutate registry truth, bypass eligibility,
create continuation or re-entry truth, or select traversal by itself.

## Registry Selection Modes

| Mode | Description | Selection authority |
| --- | --- | --- |
| deterministic single candidate | F_D filters to one eligible candidate and no policy asks for ranking | ABG emits selection |
| deterministic rejection | F_D filters to zero candidates or all candidates fail constraints | ABG emits rejection/block or preserves pressure |
| plugin-assisted advice | ABG invokes a declared product or system plugin over an immutable candidate view | ABG admits advice, validates, emits selection |
| F_H policy choice | ABG projects candidate set to a human-callout boundary | ABG admits response, validates, emits selection |
| query-only lookup | Consumer asks what is eligible without traversal effect | No selection event |

## Non-Goals

- Do not implement T-177 in this design pass.
- Do not turn static publication inventory into registry truth.
- Do not make odd_glc, odd_sdlc, JavaScript, Rust, HTTP, service, test, build,
  or release semantics part of ABG system-library law.
- Do not give product plugins invocation authority.
- Do not expose registry emitters through downstream-public facades.

## First Realization Slice

The first realization slice should prove:

1. ABG admits one system-library graph-function entry.
2. ABG admits one product-library graph-function entry.
3. ABG rejects an unlawful product shadow of a system entry.
4. ABG projects a replay-derived registry.
5. A public query returns eligible candidates without creating selection truth.
6. ABG invokes a product consequence plugin for advice over an immutable
   candidate view.
7. ABG rejects advice that names an ineligible candidate.
8. ABG emits selection truth before invoking the selected graph function.
