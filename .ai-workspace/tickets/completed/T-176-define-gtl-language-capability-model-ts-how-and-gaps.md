---
id: T-176
title: Define GTL language capability model, current TypeScript HOW, and gaps
type: design
ticket_category: requirements_design_gap_analysis
status: completed
goal: >-
  Produce the language-agnostic WHAT definition for the GTL language
  capability model; document the current TypeScript HOW binding that is already
  implemented, including the semantic compiler and conformance capabilities;
  and identify gaps between the WHAT specification and the current
  implementation.
change_intent: >-
  Downstream review found that the prior ticket framing centered supporting
  terminology rather than the main purpose: defining GTL language capability.
  The terms are still required, but only as subordinate disambiguation inside
  the GTL language capability model.
  Before designing the live runtime registry, abiogenesis needs one
  language-agnostic WHAT surface that defines GTL capabilities, fixes
  supporting vocabulary, states ownership and authority boundaries, and gives
  HOW design complete signal. It also needs a concrete TypeScript HOW account
  so existing semantic compiler/conformance capability is not lost, overstated,
  or confused with the future live registry.
change_class: requirement_reprice
re_entry_point: requirements
owner: abiogenesis
priority: high
triaged_at: 2026-06-30
created_at: 2026-06-30
updated_at: 2026-06-30
completed_at: 2026-06-30
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Downstream ODD Consumers
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/README.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/mapping/REQ-M-GTL3-MAPPING.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - .ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/completed/T-155-define-first-class-gtl-graph-function-zoom-plan.md
  - .ai-workspace/tickets/completed/T-156-admit-consequence-allowed-traversal-catalog.md
  - .ai-workspace/tickets/completed/T-157-admit-runtime-start-traversal-strategy-selection.md
  - .ai-workspace/tickets/completed/T-158-admit-gtl-plugin-result-interface-contracts.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/comments/claude/20260630T093000Z_DESIGN_gtl_complete_language_catalog_verified.md
  - .ai-workspace/comments/codex/20260630T020009Z_DESIGN_gtl_complete_language_catalog.md
related_tickets:
  - .ai-workspace/tickets/backlog/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
affected_boundary:
  goals:
    - specification/GOALS.md
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
    - specification/requirements/gtl/README.md
  design:
    - build_tenants/abiogenesis/typescript/design/
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/
    - build_tenants/abiogenesis/typescript/code/src/abg/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/
target_truth: >-
  ABI has one language-agnostic GTL language capability model requirement
  surface that defines declaration syntax, typed attributes/context, graph
  topology, graph algebra, graph functions, publication/work surfaces,
  selection/refinement, asset/prompt surfaces, hooks/plugins, compute notation,
  requirement declarations, validation, and mapping to runtime. Supporting
  terms such as publication inventory, runtime registry, system library,
  product library, ledger, event stream, projection, read model, overlay row,
  overlay frame, and selection event are disambiguated inside that model. The
  TypeScript HOW surface documents the currently implemented carrier/API
  syntax, conformance gate, semantic compiler review capability, graph algebra,
  overlay/conformance rows, and proof surfaces as bindings to WHAT. The ticket
  records explicit gaps between desired WHAT and current HOW, including the
  future live runtime registry lookup deferred to T-177.
superseded_truth: >-
  A single "catalog" term can safely cover static publication lists, runtime
  lookup, reusable system libraries, downstream product libraries, and
  traversal-affecting selection; or the current TypeScript semantic compiler
  and conformance gate can be treated as complete runtime registry capability.
closure_law: >-
  Close only when the live requirement surface defines the GTL language
  capability model, subordinate vocabulary, and WHAT-to-HOW signal contract in
  present-tense language in one dedicated GTL requirement family; the current
  TypeScript HOW binding
  is documented outside the live requirement surface with source-grounded
  claims; the semantic compiler/conformance capabilities are itemized outside
  the live requirement surface; gaps between spec and implementation are
  recorded outside the live requirement surface; runtime lookup realization
  remains deferred to T-177; and commentary is updated or superseded so no
  reader treats `catalogGraphFunctionRefs` as a live runtime lookup catalog.
non_closure_conditions:
  - The ticket designs or implements the live runtime lookup registry.
  - The ticket leaves the requirement home undecided or scatters the language
    capability model and subordinate vocabulary across separate GTL, ABG, and
    mapping requirement families instead of one dedicated GTL language
    capability family.
  - The language-agnostic WHAT surface becomes technology-specific to
    TypeScript, package paths, source-file names, or current carrier names
    except where explicitly separated as current HOW evidence.
  - The TypeScript HOW account, semantic compiler capability map, or
    spec-vs-implementation gap table is written into the live requirement
    surface instead of a design or commentary surface.
  - The TypeScript HOW section omits the semantic compiler/conformance
    implementation that already exists.
  - Current TypeScript behavior is overstated as desired WHAT instead of being
    classified as implemented capability, partial capability, implementation
    choice, or gap.
  - Gaps between WHAT and implementation are not itemized with owner,
    affected surface, severity, and successor ticket or deferral.
  - The terms catalog, registry, ledger, library, inventory, projection, event
    stream, read model, overlay row, overlay frame, and selection event remain
    ambiguous or interchangeable.
  - Ledger is described as a mutable product-local store instead of an
    ABG-owned event/projection truth surface where applicable.
  - Registry is described as a static source-code list instead of an admitted
    runtime lookup concept.
  - Catalog is used without qualifying whether it means publication inventory,
    library index, conformance catalog, consequence catalog, or runtime
    registry query.
  - Product libraries are forbidden outright instead of being allowed through
    GTL declaration and ABG admission.
  - System libraries can be shadowed by product libraries without explicit
    refinement/override law and ABG eligibility proof.
  - The WHAT-to-HOW signal omits ownership, authority, invariants, acceptance
    criteria, negative conditions, proof obligations, and required traceability.
  - Runtime selection, F_P/F_H ranking, odd_glc, odd_sdlc, software test, build,
    release, JavaScript, Rust, HTTP, or service semantics leak into the WHAT
    definition as product-specific law.
required_work:
  - Create one dedicated GTL requirement family at
    `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`
    for the language-agnostic GTL language capability model and WHAT-to-HOW
    signal law.
  - Update `specification/requirements/gtl/README.md` so this family is
    discoverable as the GTL language capability home.
  - Define the GTL language capability groups: declaration syntax, typed
    attributes/context, graph topology, graph algebra, graph functions,
    publication/work surfaces, selection/refinement, asset/prompt surfaces,
    hooks/plugins, compute notation, requirement declarations, validation, and
    mapping to runtime.
  - Define each supporting term: language capability catalog, catalog,
    publication inventory, registry, library,
    system library, product library, ledger, event stream, projection, read
    model, overlay row, overlay frame, candidate family, public start, runtime
    lookup, eligibility filter, and selection event.
  - Define term ownership: GTL declaration, ABG runtime/admission/projection,
    system library, downstream product library, plugin, and downstream read
    model.
  - Define term authority: which surfaces may declare, admit, register, query,
    select, emit, fold, project, close, re-enter, or only interpret.
  - Define invariants and non-goals for each term, especially no product-local
    registries, ledgers, controllers, or shadow catalogs for ABG-owned truth.
  - Define the WHAT-to-HOW signal checklist required before design: purpose,
    owner, entry/exit conditions, source truth, admitted inputs, emitted truth,
    projected outputs, rejection taxonomy, proof/readiness gates, and forbidden
    authority.
  - Define how HOW design must preserve the WHAT without adding technology law:
    carrier choice, module shape, API spellings, event names, and tests are
    bindings to WHAT, not replacements for it.
  - After the WHAT family is authored, document the current TypeScript HOW
    binding outside the live requirement surface: carrier/API syntax, graph
    algebra, module/job publication, conformance inventory, semantic compiler
    review surface, compute notation, overlay/conformance rows, requirements
    declaration wrappers, and existing proof commands.
  - After the WHAT family is authored, produce a source-grounded semantic
    compiler capability map outside the live requirement surface that separates
    current behavior, intended WHAT, implementation-specific binding, and
    known gaps.
  - After the WHAT family is authored, produce a spec-vs-implementation gap
    table outside the live requirement surface with owner, affected surface,
    current state, target state, severity, and successor ticket or deferral.
  - Update or supersede the GTL complete language catalog commentary so it
    points to the GTL language capability model and treats the disambiguated
    terms as subordinate vocabulary, with live runtime lookup work in T-177.
  - Keep T-177 backlog-scoped until this WHAT ticket closes.
proof_commands:
  - git diff --check
  - test -f specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - for term in "declaration syntax" "typed attributes" "graph topology" "graph algebra" "graph functions" "publication" "selection" "asset" "hook" "compute notation" "requirement declarations" "program validation" "mapping to runtime"; do rg -n "$term" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
  - for term in "language capability catalog" "catalog" "publication inventory" "runtime registry" "system library" "product library" "ledger" "event stream" "projection" "read model" "overlay row" "overlay frame" "selection event"; do rg -n "$term" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
  - for signal in "purpose" "owner" "authority boundary" "source truth" "admitted inputs" "emitted truth" "projection outputs" "rejection taxonomy" "proof" "forbidden authority"; do rg -n "$signal" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
  - '! rg -n "TypeScript|build_tenants|code/src|catalogGraphFunctionRefs|\\.ts|\\.mjs" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md'
  - rg -n "catalogGraphFunctionRefs.*publication inventory|publication inventory.*catalogGraphFunctionRefs" build_tenants/abiogenesis/typescript/design .ai-workspace/comments
---

# T-176: GTL Language Capability Model, TypeScript HOW, And Gap Analysis

## STDO Triage

### First Missing Layer

Requirements.

The verified GTL language catalog is a good code-verified commentary artifact,
but it exposed a method problem: the main surface is GTL language capability,
while words such as catalog, registry, ledger, and library are subordinate
terms inside that model.

The immediate work is not the runtime lookup registry. The immediate work has
three ordered parts:

1. Define the language-agnostic GTL language capability WHAT.
2. Document the current TypeScript HOW binding as implemented, including the
   semantic compiler and conformance capabilities.
3. Record the gaps between the WHAT and the current implementation.

The TypeScript HOW documentation is allowed to name current carriers, modules,
APIs, source files, tests, and proof commands, but only as implementation
binding evidence. It must not back-propagate TypeScript choices into the
language-agnostic WHAT.

## Constitutional Home

The WHAT shall live in one dedicated GTL language capability requirement
family:

`specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`

Reason: the primary subject is GTL language capability. The subordinate
vocabulary crosses GTL declaration law and ABG runtime law, but it exists to
clarify the language capability model, not to replace it as the center of
gravity.

The TypeScript HOW account, semantic compiler capability map, and
spec-vs-implementation gap table shall not live in the requirement file. They
belong under `build_tenants/abiogenesis/typescript/design/` or in commentary as
derived/read-model material.

### Lawful Re-Entry

`requirement_reprice`.

The product direction remains stable. The live requirements need sharper
terminology and clearer WHAT-to-HOW trace expectations before any HOW ticket
can design the live registry.

## Required Capability Definition

At minimum, the WHAT surface must first define the GTL language capabilities:

- declaration syntax;
- typed attributes and context;
- graph topology;
- graph algebra;
- graph functions;
- publication and work surfaces;
- selection and refinement surfaces;
- asset and prompt surfaces;
- hook and plugin boundaries;
- compute notation;
- requirement declarations;
- program validation;
- mapping to runtime.

Only after those capability groups are defined, the WHAT surface shall
distinguish supporting terms that otherwise get overloaded:

- `language capability catalog`: qualified index of GTL capabilities and
  requirement traces.
- `catalog`: qualified term only; never used alone as authority.
- `publication inventory`: static GTL/module/conformance claim.
- `registry`: admitted runtime lookup concept.
- `system library`: upstream generic graph-function library.
- `product library`: downstream specialized graph-function library.
- `ledger`: ABG-owned emitted/projection truth, not product-local mutable state.
- `event stream`: append-only runtime truth path.
- `projection`: replay-derived view over admitted truth.
- `read model`: consumer-facing query/interpretation surface.
- `overlay row`: GTL conformance/catalog metadata.
- `overlay frame`: ABG runtime observation/foldback contract.
- `selection event`: ABG-emitted truth when candidate selection affects
  traversal.

## WHAT-To-HOW Signal Contract

A lawful WHAT requirement should give HOW design enough signal to derive the
implementation without guessing product intent. For each capability, the WHAT
surface should name:

- purpose;
- owner;
- authority boundary;
- source truth;
- admitted inputs;
- emitted truth, if any;
- replay/projection outputs;
- query/read-only outputs;
- rejection taxonomy;
- readiness/proof gates;
- invariants;
- forbidden authority;
- downstream interpretation boundary;
- minimum traceability to design, code, tests, and proof artifacts.

The HOW layer may choose carriers, module boundaries, APIs, event names, data
structures, and tests. It may not change ownership, authority, proof gates, or
semantic boundaries.

## Current TypeScript HOW Scope

After the WHAT family is authored, the T-176 HOW section must describe the
implementation that exists today, including:

- GTL carrier/API syntax;
- graph algebra functions;
- module, job, role, candidate-family, and refinement publication;
- `admitGtlProgramConformanceInput(...)`;
- `typecheckGtlProgram(...)`;
- semantic compiler F_P review graph-function capability;
- compute notation and F_D/F_P/F_H type constraints;
- plugin authority-denial types;
- overlay rows, public starts, overlay-frame distinction, and conformance
  checks;
- requirements algebra declaration wrappers;
- traversal-unit projection and conservation checks;
- proof commands and known test coverage.

This HOW account must classify each item as:

- implemented and aligned with WHAT;
- implemented but only a TypeScript binding choice;
- implemented but incomplete against WHAT;
- absent and required;
- absent and explicitly deferred.

## Gap Analysis

After the WHAT family is authored and the current HOW is documented, the gap
analysis must separate:

- terminology gaps;
- requirement/specification gaps;
- design gaps;
- implementation gaps;
- proof gaps;
- documentation/commentary gaps;
- future runtime registry gaps owned by T-177.

## Acceptance Checklist

- [x] Live requirement surface defines the GTL language capability groups.
- [x] Live requirement surface places supporting terminology under the
      capability model as subordinate vocabulary.
- [x] Live requirement surface states the WHAT-to-HOW signal contract.
- [x] The requirement home is the single GTL family
      `REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`.
- [x] TypeScript HOW and gap-analysis material is kept out of the live
      requirement surface.
- [x] Current TypeScript HOW binding is documented.
- [x] Semantic compiler/conformance capabilities are itemized.
- [x] Spec-vs-implementation gap table exists.
- [x] `catalogGraphFunctionRefs` is named as publication inventory only.
- [x] Runtime lookup/selection is explicitly deferred to T-177.
- [x] Commentary catalog is updated or superseded to point to the ratified GTL
      language capability model.
- [x] `git diff --check` passes.

## Closure Note

Closed on 2026-06-30.

T-176 produced the live constitutional WHAT surface:

- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`

It updated the GTL README so the new family is discoverable as the GTL
language capability home.

T-176 also produced the TypeScript HOW/gap read model outside the live
requirement surface:

- `build_tenants/abiogenesis/typescript/design/T176_GTL_LANGUAGE_CAPABILITY_TS_HOW_AND_GAP_ANALYSIS.md`

That design artifact documents the current TypeScript carrier/API,
conformance, semantic compiler, graph algebra, overlay/conformance, compute
notation, requirements-wrapper, traversal-unit, proof, subordinate vocabulary,
and gap surfaces. It records the future live runtime registry lookup as a
T-177 gap rather than treating static conformance inventory as runtime
discovery.

The verified GTL catalog commentary now points to the T-176 requirement and
HOW/gap document and states that `catalogGraphFunctionRefs` is publication
inventory only.

Proof checks run:

```bash
git diff --check
test -f specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
for term in "declaration syntax" "typed attributes" "graph topology" "graph algebra" "graph functions" "publication" "selection" "asset" "hook" "compute notation" "requirement declarations" "program validation" "mapping to runtime"; do rg -n "$term" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
for term in "language capability catalog" "catalog" "publication inventory" "runtime registry" "system library" "product library" "ledger" "event stream" "projection" "read model" "overlay row" "overlay frame" "selection event"; do rg -n "$term" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
for signal in "purpose" "owner" "authority boundary" "source truth" "admitted inputs" "emitted truth" "projection outputs" "rejection taxonomy" "proof" "forbidden authority"; do rg -n "$signal" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md >/dev/null || exit 1; done
if rg -n "TypeScript|build_tenants|code/src|catalogGraphFunctionRefs|\\.ts|\\.mjs" specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md; then exit 1; fi
rg -n "catalogGraphFunctionRefs.*publication inventory|publication inventory.*catalogGraphFunctionRefs" build_tenants/abiogenesis/typescript/design .ai-workspace/comments
```

All checks passed. T-177 remains backlog for live ABG runtime graph-function
registry lookup design.
