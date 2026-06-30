---
id: T-179
title: Design non-graph registry entry runtime semantics
type: design
ticket_category: runtime_registry_entry_kinds
status: backlog
goal: >-
  Define how registry entry kinds other than graph functions participate in
  ABG runtime startup, lookup, projection, and selection-adjacent behavior.
change_intent: >-
  T-177 admits and filters registry entries by kind, and proves graph-function
  selection/invocation. This ticket owns deeper semantics for overlays, public
  starts, candidate families, plugin contracts, and GTL bindings so the live
  registry does not overclaim graph-function selection as full registry
  behavior for every entry kind.
change_class: design_reframe
re_entry_point: design
owner: abiogenesis
priority: medium
triaged_at: 2026-06-30
created_at: 2026-06-30
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Registry
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/active/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
source_documents:
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md
  - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md
target_truth: >-
  Overlays, public starts, candidate families, plugin contracts, and GTL
  bindings have explicit registry semantics that preserve ABG authority:
  downstream products publish declarations and startup config; ABG admits,
  projects, resolves, and applies those entries through canonical runtime
  surfaces without product-local loaders or duplicate truth.
superseded_truth: >-
  Non-graph registry entry kinds can be discovered, activated, or applied by
  downstream startup shells, product-local scans, product-local registries, or
  graph-function selection rules not designed for their kind.
closure_law: >-
  Close only after each non-graph entry kind has a declared purpose, authority
  boundary, source truth, admitted inputs, projection output, runtime consumer,
  and negative proof against product-local activation.
non_closure_conditions:
  - Overlay, public-start, candidate-family, plugin-contract, or GTL-binding
    entries are treated as graph-function invocation candidates.
  - Any non-graph entry kind is activated by a downstream shell or product-local
    registry projection.
  - ABG runtime consumers for each entry kind are not identified.
  - Entry-kind semantics introduce odd_glc, odd_sdlc, JavaScript, Rust, HTTP,
    service, test, build, release, or product-domain policy as ABG-owned law.
required_work:
  - Define registry semantics for `overlay`.
  - Define registry semantics for `public_start`.
  - Define registry semantics for `candidate_family`.
  - Define registry semantics for `plugin`.
  - Define registry semantics for GTL binding/publication references consumed
    during startup.
  - Add negative proofs that each kind is not activated through product-local
    shells, scans, registries, or graph-function invocation.
proof_commands:
  - git diff --check
---

# T-179: Non-Graph Registry Entry Runtime Semantics

Backlog follow-on from T-177. T-177 proves the canonical pickup path and
graph-function selection. This ticket prevents that proof from being stretched
to non-graph entry kinds before their runtime semantics are designed.
