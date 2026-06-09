---
id: T-154
title: Expose runtime authorship routes for downstream resume, span reentry, and transition refs
type: feature
ticket_category: ordinary
status: active
proof_status: release_snapshot_cut_downstream_consumption_pending
goal: let downstream ODD products remove local runtime-event construction and fake transition refs by consuming ABG-owned routes for explicit graph-vector resume, graph-span reentry application, and replay-visible traversal transition identity
change_class: design_reframe
change_intent: Close the consumer gap found by odd_sdlc T-197 W-105/W-110: SDLC has ABG primitives and constructors, but still assembles selected runtime lifecycle and graph-span/reentry events locally before emit, and its consequence projection has no first-class ABG traversal-transition ref to consume. ABG should expose consumer-safe runtime authorship functions or runner entries so downstream products supply product candidates and ABG emits/adopts the runtime facts and returns replay-visible transition identity.
re_entry_point: design
created_at: 2026-06-09
updated_at: 2026-06-10
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
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/runtime_authoring_routes.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
target_truth: ABG remains the sole runtime fact author for graph-vector lifecycle, explicit graph-vector resume, graph-span foldback, graph reentry plan/apply, continuation, traversal transition facts, and replay-visible traversal transition identity. Downstream products may supply admitted product candidates, graph-span assessment rows, target resume intent, or domain consequence candidates, but they consume ABG-owned runtime authorship routes and transition refs instead of calling event constructors, appending those events themselves, or substituting local projection refs as traversal transition refs.
superseded_truth: Downstream products call ABG event constructors directly for lifecycle cursor catch-up, graph-span schedule/assessment/foldback events, and graph reentry plan/apply events, then append those facts through an ABG emit sink while still owning event assembly.
closure_law: This ticket closes only when ABG exposes and proves consumer-safe API routes for explicit graph-vector resume/cursor, graph-span reentry application, and replay-visible traversal transition identity, or explicitly proves existing runner routes cover those consumers without downstream event assembly or local transition-ref substitution. The proof must include a downstream-shaped fixture showing a consumer can remove synthetic cursor events and graph-span/reentry event construction while preserving replay, continuation, graph-span foldback behavior, and consequence projection binding to ABG transition identity. The exported route must be present in an immutable TypeScript tenant release snapshot before downstream consumers may claim this as a released dependency.
non_closure_conditions:
  - downstream products must still construct vector lifecycle, graph-span foldback, or graph reentry runtime events before calling emit
  - explicit graph-vector resume is represented by downstream synthetic closure of earlier vectors
  - graph-span assessment candidates can select reentry or emit plan/apply events without ABG admission/fold/projection
  - downstream consequence projections must use a local next-action/read-model ref as the traversal transition ref because ABG exposes no stable transition identity
  - API shape requires downstream products to copy ABG event-construction policy or event kind ordering
  - proof is limited to unit helpers and does not cover a downstream-shaped resume/reentry consumer
  - the route exists only in source or a local build and is absent from the immutable TypeScript tenant release snapshot consumed downstream
review_gate: odd_sdlc T-197 W-105 and W-110 must consume the resulting route or explicitly defer affected rows on this ticket
activation_reason: odd_sdlc T-197 identified ABG-blocked vertical authority work; execution is moved upstream rather than allowing an SDLC-local workaround
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

## Blocked SDLC Transfer Map

The following odd_sdlc T-197 rows are upstream-owned by this ticket. SDLC may
keep read-model/projection code and product-domain candidate construction, but
it must not close these rows by reassembling ABG runtime facts locally.

| T-197 row | Blocked SDLC surface | ABG/GTL target route | T-154 disposition |
| --- | --- | --- | --- |
| `A1` | synthetic vector lifecycle cursor events in `replayEventsWithGraphContinuationCursor(...)` | explicit graph-vector resume/cursor route that admits target resume intent and returns replay-visible lifecycle/transition truth | active work |
| `A4` vector lifecycle subset | downstream construct-before-emit of vector lifecycle runtime events | ABG-owned runtime authorship function or runner entry for vector lifecycle catch-up/resume | active work |
| `A4` graph-span/reentry subset | downstream construct-before-emit of graph-span foldback and graph reentry plan/apply events | graph-span assessment candidate admission plus ABG foldback/reentry projection and event authorship | active work |
| `A5` | downstream consequence projection lacks first-class ABG traversal transition/ref identity | replay-visible traversal transition projection/ref returned by ABG and consumable by consequence projections | active work |
| `A2` | installed re-entry loop classification depends on the A5 transition boundary | evaluate after ABG transition/ref route exists; no standalone SDLC controller rewrite before this ticket | dependent |

If an audit proves an existing ABG route already satisfies a row, the closure
artifact is the consumer recipe plus a downstream-shaped proof. If no route
exists, the implementation belongs here.

## Required Work

1. **Done 2026-06-10** — Audit existing T-103/T-148 runner and contract
   surfaces for explicit graph-vector resume and graph-span reentry
   application.
2. **Done 2026-06-10** — Existing graph-span carriers were sufficient, but no
   consumer-safe route existed. Explicit graph-vector resume/cursor was
   insufficient because replay projection had no native target cursor event
   that could advance without closing earlier vectors.
3. **Done 2026-06-10** — Added API functions or runner entries
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
4. **Done 2026-06-10** — Export the route from the TypeScript tenant package.
5. **Done 2026-06-10** — Add focused tests and a downstream-shaped consumer
   fixture.
6. **Done 2026-06-10** — Cut an immutable TypeScript tenant release snapshot
   containing the route exports and made the release manifest/checksum the
   dependency proof for downstream consumption.

## Audit Result - 2026-06-10

| Surface | Existing route? | Result |
| --- | --- | --- |
| ordinary vector advancement | yes | `runEngineIterateAsync(...)` already owns vector evaluate/close and transition event emission |
| graph-span schedule/assessment/foldback carriers | partial | T-103 carriers and constructors existed, but consumers still had to assemble events directly |
| graph reentry plan/apply | partial | T-103 frontier and plan/apply constructors existed, but no consumer-safe route wrapped event authorship |
| explicit graph-vector resume/cursor | no | replay projection only advanced from closed vector truth; downstream had to fake earlier vector closure |
| replay-visible transition/ref identity | partial | transition projections had stable refs, but consumer routes did not return ABG-owned refs for cursor/span routes |

## Implementation Evidence - 2026-06-10

- Added `GraphVectorResumeCursorAppliedEvent` and admission/projection support.
  Replay uses this event to start next-vector search at the target vector
  without adding `vector_evaluated` or `vector_closed` facts for earlier
  vectors.
- Added `applyExplicitGraphVectorResumeCursor(...)` in
  `runtime_authoring_routes.ts`. The route emits through ABG `emit(...)` and
  returns the replay projection plus a stable resume-cursor `transitionRef`.
- Added `applyGraphSpanReentryRoute(...)` in
  `runtime_authoring_routes.ts`. The route derives an assessment-span schedule
  for downstream product candidates, emits graph-span
  schedule/assessment/foldback events, derives frontier, emits graph reentry
  plan/apply events when needed, and returns an ABG-owned `transitionRef`.
  Endpoint-closed scheduling remains available when callers supply
  `closedVectorIndexes` explicitly.
- Exported both routes from the M03 runner package surface.
- Added `test:t154` with a downstream-shaped proof that route consumers do not
  call graph-span or graph-reentry event constructors.
- Added the SDLC-discovered regression proof: open downstream assessment spans
  with no closed replay facts still flow through ABG-authored graph-span and
  graph-reentry events instead of forcing downstream products to fake closure
  indexes.

## Verification - 2026-06-10

| Command | Result |
| --- | --- |
| `npm run test:t154` | passed 4/4 |
| `npm run test:t103` | passed 24/24 |
| `npm run test:t148` | passed 5/5 |
| `npm run lint:semantic` | passed |
| `npm run test:semantic` | passed 769/769 |

## Release Snapshot Evidence - 2026-06-10

| Field | Value |
| --- | --- |
| release identity | `4.0.0-rc.6` |
| source commit | `8a82be76d9c957dc2b427ca15aa850d4ef46f1b9` |
| source dirty | `false` |
| tarball | `release_snapshots/abiogenesis-typescript-tenant/4.0.0-rc.6/abiogenesis-typescript-tenant-4.0.0-rc.6.tgz` |
| tarball sha256 | `6e67842357671d6fa86686279b6cd123a70904c301f0ec8aa5124971aa551fb7` |
| manifest sha256 | `0b089888099ca9ed1e02316dfbf8d346b3bb27ae0204f248ea273161922c1682` |
| latest pointer | `release_snapshots/abiogenesis-typescript-tenant/latest -> 4.0.0-rc.6` |

Downstream consumption remains owned by odd_sdlc T-197. This ABI slice removes
the requirement for downstream products to construct cursor/span/reentry events
locally; it does not claim the old odd_sdlc call sites have already been
deleted. It also does not claim downstream release consumption until odd_sdlc
updates its ABG pin and proves the T-197 call sites against this immutable
snapshot.

## Execution Plan

1. Promote this ticket to the active ABG workstream and keep SDLC T-197 as the
   downstream consumer ledger.
2. Publish the audit result for existing runtime, continuation, transition, and
   graph-span reentry carriers.
3. Add the smallest ABG-owned consumer API that closes the missing route without
   exposing event-construction policy to downstream products.
4. Add focused unit tests for admission, ordering, transition identity, and
   fail-closed malformed candidate behavior.
5. Add a downstream-shaped fixture that demonstrates the consumer pattern can
   consume the route without direct vector lifecycle, graph-span, or reentry
   event construction.
6. Cut an immutable release snapshot carrying the exported routes.
7. Update this ticket with evidence and leave downstream consumption to
   odd_sdlc T-197 unless explicitly folded into the same release pass.

## Downstream Constraint

odd_sdlc T-197 must not replace these gaps with SDLC-local runtime-event
assembly. If this ticket is not implemented, the affected T-197 A1/A4/A5 rows
remain blocked or deferred on this dependency.
