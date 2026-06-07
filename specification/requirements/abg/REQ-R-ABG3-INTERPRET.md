# REQ-R-ABG3-INTERPRET — Graph-Function Runtime Interpretation

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define ABG 3 interpretation as graph-function-first runtime execution over
event-authoritative aggregates.

## Acceptance Criteria

**REQ-R-ABG3-INTERPRET-001**: ABG shall load GTL 3 declarations without collapsing them into stale or flatter language shapes.

**REQ-R-ABG3-INTERPRET-002**: Public execution shall enter through published `GraphFunction` carriers bound by GTL `Job` contracts.

**REQ-R-ABG3-INTERPRET-003**: ABG shall materialize graph functions through explicit, replayable materialization requests over declared graph-function identity, profiles, and structural parameters.

**REQ-R-ABG3-INTERPRET-004**: `GraphVector` shall remain internal invariant-boundary truth for local traversal, evaluation, proof, closure, and dispatch facts. It shall not be the public execution carrier.

**REQ-R-ABG3-INTERPRET-005**: Recursive interpretation shall operate through explicit `GraphCall` and `Frame` truth rather than ad hoc command logic or hidden controller memory.

**REQ-R-ABG3-INTERPRET-006**: Post-dispatch runtime truth, including readiness, worker turn invocation, failure classification, proof re-entry, closure re-entry, and continuation opening, shall be engine-owned.

**REQ-R-ABG3-INTERPRET-007**: ABG shall fail closed on undeclared graph-function identity, undeclared profile, undeclared structural parameter, materialization output that violates the published outer contract, or unresolved runtime law.

**REQ-R-ABG3-INTERPRET-008**: Post-dispatch observer truth that is non-blocking but unresolved shall yield to the next lawful observer or routing layer rather than immediately redispatching the same constructive lane by default.

**REQ-R-ABG3-INTERPRET-009**: Public start/resume entry shall act as a safe ignition boundary over published `GraphFunction` work. It shall locate, admit, or resume the lawful graph-function execution boundary, but shall not replace the ABG internal iteration engine.

**REQ-R-ABG3-INTERPRET-010**: ABG shall execute a published `GraphFunction` by repeatedly planning and advancing lawful internal `GraphVector` traversals from replay-derived runtime truth until convergence, failure, hold, continuation, yielded handoff, human gate, or another lawful public stop condition is reached.

**REQ-R-ABG3-INTERPRET-011**: Next-edge selection shall be derived from graph-call, frame, vector-local traversal, evaluation, proof, and closure event truth. It shall not be inferred from private controller memory, package-local loop counters, or a fixed first-vector shortcut.

**REQ-R-ABG3-INTERPRET-012**: A realization shall not claim graph-function execution parity when it only materializes a composed graph function or dispatches one selected vector without proving replay-derived progression across the callable graph boundary.

**REQ-R-ABG3-INTERPRET-013**: ABG shall name an admitted graph-function execution request with no declared runtime compute basis as `no_compute_basis`. It shall not treat an uninitialized traversal as a no-op, identity traversal, deterministic fallback, probabilistic fallback, or human fallback.

**REQ-R-ABG3-INTERPRET-014**: Every ABG-known runtime system or runtime asset surface participating in a graph-function invocation shall expose a declared runtime activity probe surface when it can affect liveness. Probe facts observe activity and evidence only; they shall not select retry, traversal movement, stop state, or closure.

**REQ-R-ABG3-INTERPRET-015**: ABG shall derive invocation liveness through one runtime liveness observer projection over admitted probe and interruption events. Caller-local timers, harness state, CLI adapters, and product summaries shall not own rival liveness truth for ABG-owned graph-function work.

**REQ-R-ABG3-INTERPRET-016**: ABG watchdog and evaluator dispositions shall consume the runtime liveness observer projection before deciding continue-waiting, controlled inactivity termination, external interruption block, hard safety-cap block, retry-budget exhaustion, or artifact-salvage admission.

**REQ-R-ABG3-INTERPRET-017**: If no watchdog/evaluator disposition selects an alternate lawful action, graph-function execution shall continue following replay-derived graph progression. The default is graph progress, not caller-local timeout policy.

**REQ-R-ABG3-INTERPRET-018**: Overlay-like runtime attention frames shall be ABG frame contracts bound to GTL graph-function, graph-vector, graph-span, job, module, or rule anchors. They shall not introduce a rival GTL topology type or a product-local controller loop. Fire, terminate, fold-back, re-entry, and pressure decisions shall derive from admitted runtime events and admitted observed-state refs.

**REQ-R-ABG3-INTERPRET-019**: ABG shall provide a deterministic static GTL program conformance function that downstream products can call before runtime execution. The function shall admit raw program inventory input, return typed issue rows for malformed or non-conforming input, and expose any CLI entry as a wrapper over the same programmatic function.

**REQ-R-ABG3-INTERPRET-020**: Static GTL program conformance shall fail closed for empty, partial, or caller-selected coverage that omits required current graph functions, graph vectors, target-carrier rows, edge-closure rows, prompt invocation assets, plugin contracts, overlays, public starts, or active source identity rows.

**REQ-R-ABG3-INTERPRET-021**: Static GTL program conformance shall check graph-function interface law by deriving graph outputs from declared graph inputs through graph-vector source and target contracts. It shall reject undeclared source or target nodes, unsatisfied graph-vector dependencies, unreachable vectors, non-derivable declared outputs, and ambiguous duplicate graph-vector identities.

**REQ-R-ABG3-INTERPRET-022**: Static GTL program conformance shall key graph-vector evidence by opaque graph-function, graph, and graph-vector identity. Display names are presentation metadata and shall not be used as target-carrier, edge-closure, or composition truth.

**REQ-R-ABG3-INTERPRET-023**: Static GTL program conformance shall require exactly one target-carrier row and exactly one edge-closure row for each materialized graph-vector identity in the admitted inventory.

**REQ-R-ABG3-INTERPRET-024**: When a supplied inventory row declares a prompt invocation asset, static GTL program conformance shall require row-local rendered-view, constructor, digest policy, output-contract, authority-slot, proof-obligation, node, and current fold evidence sufficient to prove the prompt row is a typed `AssetSurface` view rather than caller-owned prompt truth.

**REQ-R-ABG3-INTERPRET-025**: Static GTL program conformance shall admit plugin contracts and GTL fulfillment bindings through the same ABG/GTL constructors and admitters used by runtime. Engine-authority flags shall be single-sourced by a shared vocabulary and rejected rather than silently stripped.

**REQ-R-ABG3-INTERPRET-026**: Static GTL program conformance report identity shall be evidence-bound to the normalized audited inventory, including graph functions, modules, vectors, target-carrier rows, closure rows, overlays, prompt invocation assets, plugin contracts, public starts, and source identity digests.
