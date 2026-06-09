---
id: T-154
title: Expose runtime authorship routes for downstream resume, span reentry, and transition refs
type: feature
ticket_category: ordinary
status: backlog
proof_status: pending
goal: let downstream ODD products remove local runtime-event construction and fake transition refs by consuming ABG-owned routes for explicit graph-vector resume, graph-span reentry application, and replay-visible traversal transition identity
change_class: design_reframe
change_intent: Close the consumer gap found by odd_sdlc T-197 W-105/W-110: SDLC has ABG primitives and constructors, but still assembles selected runtime lifecycle and graph-span/reentry events locally before emit, and its consequence projection has no first-class ABG traversal-transition ref to consume. ABG should expose consumer-safe runtime authorship functions or runner entries so downstream products supply product candidates and ABG emits/adopts the runtime facts and returns replay-visible transition identity.
re_entry_point: design
created_at: 2026-06-09
updated_at: 2026-06-09
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - .ai-workspace/tickets/completed/T-103-define-abg-graph-span-foldback-and-reentry-frontier.md
  - .ai-workspace/tickets/completed/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - .ai-workspace/tickets/completed/T-148-realize-runtime-continuation-transition-projection.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-197-reconcile-product-boundary-and-remove-authority-leakage.md
related_tickets:
  - T-103
  - T-106
  - T-148
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-197-reconcile-product-boundary-and-remove-authority-leakage.md
affected_boundary:
  requirements:
    - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts
target_truth: ABG remains the sole runtime fact author for graph-vector lifecycle, explicit graph-vector resume, graph-span foldback, graph reentry plan/apply, continuation, traversal transition facts, and replay-visible traversal transition identity. Downstream products may supply admitted product candidates, graph-span assessment rows, target resume intent, or domain consequence candidates, but they consume ABG-owned runtime authorship routes and transition refs instead of calling event constructors, appending those events themselves, or substituting local projection refs as traversal transition refs.
superseded_truth: Downstream products call ABG event constructors directly for lifecycle cursor catch-up, graph-span schedule/assessment/foldback events, and graph reentry plan/apply events, then append those facts through an ABG emit sink while still owning event assembly.
closure_law: This ticket closes only when ABG exposes and proves consumer-safe API routes for explicit graph-vector resume/cursor, graph-span reentry application, and replay-visible traversal transition identity, or explicitly proves existing runner routes cover those consumers without downstream event assembly or local transition-ref substitution. The proof must include a downstream-shaped fixture showing odd_sdlc can remove synthetic cursor events and graph-span/reentry event construction while preserving replay, continuation, graph-span foldback behavior, and consequence projection binding to ABG transition identity.
non_closure_conditions:
  - downstream products must still construct vector lifecycle, graph-span foldback, or graph reentry runtime events before calling emit
  - explicit graph-vector resume is represented by downstream synthetic closure of earlier vectors
  - graph-span assessment candidates can select reentry or emit plan/apply events without ABG admission/fold/projection
  - downstream consequence projections must use a local next-action/read-model ref as the traversal transition ref because ABG exposes no stable transition identity
  - API shape requires downstream products to copy ABG event-construction policy or event kind ordering
  - proof is limited to unit helpers and does not cover a downstream-shaped resume/reentry consumer
review_gate: odd_sdlc T-197 W-105 and W-110 must consume the resulting route or explicitly defer affected rows on this ticket
---

# T-154: Runtime Authorship Routes For Downstream Resume, Span Reentry, And Transition Refs

## Intake Triage

Smallest lawful re-entry point: `design_reframe`.

ABG already owns the relevant runtime law:

- T-103 defines graph-span foldback and reentry frontier.
- T-106 defines typed traversal non-progress continuation.
- T-148 defines runtime continuation transition projection.
- `runEngineIterateAsync(...)` emits ordinary transition events through an
  ABG runner-owned `eventSink`.

The gap found by odd_sdlc T-197 is a consumer API gap, not a request for SDLC
to create another runtime law. SDLC still has sites where it calls ABG event
constructors and assembles runtime events locally before append:

- explicit graph-vector resume/cursor catch-up for direct target starts
- graph-span schedule/assessment/foldback events for repair/post-action reentry
- graph reentry planned/applied events after product consequence pressure
- consequence projection transition refs, where the downstream product has
  domain next-action/read-model refs but needs a stable ABG-owned traversal
  transition identity

ABG needs a consumer-safe route for those cases so downstream products provide
typed candidate input and ABG authors or admits the runtime facts.

## Required Work

1. Audit existing T-103/T-148 runner and contract surfaces for explicit
   graph-vector resume and graph-span reentry application.
2. If existing routes are sufficient, publish the consumer recipe and add a
   downstream-shaped test proving no direct event construction is required.
3. If existing routes are insufficient, add API functions or runner entries
   that:
   - admit explicit graph-vector resume intent without synthetic closure of
     earlier vectors;
   - admit product graph-span assessment candidates and emit/fold graph-span
     runtime truth under ABG;
   - derive graph reentry plan/apply events from ABG frontier projection;
   - return or project a replay-visible traversal transition identity/ref that
     downstream consequence projections can cite instead of substituting a
     product next-action projection ref;
   - return replay-visible runtime events through the same ordering/admission
     law as `runEngineIterateAsync(...)`.
4. Export the route from the TypeScript tenant package.
5. Add focused tests and a downstream-shaped odd_sdlc fixture.

## Downstream Constraint

odd_sdlc T-197 must not replace these gaps with SDLC-local runtime-event
assembly. If this ticket is not implemented, the affected T-197 A1/A4/A5 rows
remain blocked or deferred on this dependency.
