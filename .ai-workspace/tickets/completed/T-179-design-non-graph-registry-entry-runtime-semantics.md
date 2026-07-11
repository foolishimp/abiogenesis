# T-179 - Design Non-Callable Node-Type And Overlay Catalog Semantics

- id: T-179
- title: Design non-callable node-type and overlay catalog semantics
- type: feature
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_demand_driven_reentry
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- execution_state: queued_after_T225
- goal: abg-5-0-full-product-delivery
- phase: DS-2
- priority: high
- change_intent: >-
    Narrow the former all-non-graph registry inquiry to the two retained public
    ABG 5.0 catalog kinds: kind-specific node_type and overlay description plus
    ABG-owned non-callable application semantics needed by G5.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-06-30
- created_at: 2026-06-30
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M02 kind publication, M03 admission/application, and M04 kind-specific public description below generic catalog reads
- admission_condition: execute after T-225; activation records the accepted owner, not permission to skip the DS sequence
- dependencies:
  - T-223 generic catalog reads and state model
  - T-225 B5 feasibility gate
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - build_tenants/common/design/modules/M02-work-publication.yml
  - build_tenants/common/design/modules/M03-engine-kernel.yml
  - build_tenants/common/design/modules/M04-app-bootstrap.yml

## Reprice Ruling

The original ticket covered overlays, public starts, candidate families,
plugins, and GTL bindings as one registry problem. T-218 rejected that breadth.
ABG 5.0 publicly retains only `graph_function`, `node_type`, and `overlay`.
T-223 owns generic catalog row list/describe metadata for all three; only a
GraphFunction is callable. This ticket owns the additional kind-specific
meaning and application boundary for node types and overlays. Public starts,
candidate families, plugins, jobs, roles, and other stored registry kinds
remain internal or governed by their existing requirements and are not part of
this ticket.

## Target Truth

For each retained non-callable kind, design declares:

- the publisher-authored declaration and canonical identity;
- the kind-specific public description returned above the generic T-223 row;
- the exact ABG admission or startup consumer that may apply it;
- typed application input, output, provenance, and failure;
- readiness and compatibility requirements; and
- a mechanical prohibition on GraphFunction selection or product-local activation.

`node_type` application binds a declared node type to admitted node/program
truth. `overlay` application binds a declared program composition over admitted
GraphFunctions, vectors, node types, starts, roles, policies, proof obligations,
and contracts. Neither kind invokes a worker, opens a GraphCall, emits an event,
or controls traversal by itself.

## Required Work

1. Reuse-map existing node-type and overlay declaration/admission carriers.
2. Define kind-specific public description without duplicating the generic
   catalog identity/state/provenance projection owned by T-223.
3. Define the ABG-owned typed application boundary and consumer for each kind.
4. Define compatibility, readiness, duplicate, unresolved, malformed, and
   unauthorized typed outcomes.
5. Define exact native/schema/catalog rows and capability bindings for
   `abg.capability.catalog.apply-node-type@5` and
   `abg.capability.catalog.apply-overlay@5`, including kind-specific
   description/application contracts, versions, locators, and digests.
6. Define the inside-out handoff to T-228 and the installed publisher-neutral proof.
7. Publish the target map, IACS, carrier diagram, and negative-selection proof contract.

## Closure Law

Close when node types and overlays each have one declared source, kind-specific
description, ABG-owned application consumer, typed carrier/error contract, and
versioned public-contract-catalog row plus negative proof against invocation
and product-local activation; T-228 can
implement the design without importing odd_glc domain meaning or inventing a loader.

## Non-Closure Conditions

- A node type or overlay is treated as a GraphFunction invocation candidate.
- Catalog presence or generic description applies a declaration automatically.
- A downstream shell, product-local loader, scan, registry, or test harness applies it.
- Public-start, candidate-family, plugin, role, job, or other registry-kind
  semantics enter this narrowed ticket.
- odd_glc lifecycle vocabulary, policy, or acceptance interpretation becomes ABG law.
- Inputs, outputs, errors, owners, consumers, provenance, or installed proof remain implicit.

## Proof Surface

- `git diff --check`
- authority/design reuse map
- per-kind IACS and application-consumer review
- callable-selection and product-local-activation negative design
- phase-end independent review against T-218, PRODUCT, and ODD ownership law

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_demand_driven_reentry
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Narrowed node_type/overlay catalog-semantics design queued behind the dropped T-225 gate (phase DS-2, source T-218). No current program demands the kinds.
- Re-entry: Demand-driven: re-enters via gap event -> intent -> ticket when a GTL-5 program (or the G5 catalog line) declares node_type/overlay kinds. T-218's narrowing law (public kinds limited to graph_function/node_type/overlay) survives as the scoping constraint for any re-entry.
- No code, specification, design, or release surface changed by this closure.
