# REQ-R-ABG3-INTERPRET — Graph-Function Runtime Interpretation

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define ABG 3 interpretation as execution of an admitted graph overlay or GTL
program composition through its published GraphFunction callables and event-
authoritative runtime aggregates.

## Acceptance Criteria

**REQ-R-ABG3-INTERPRET-001**: ABG shall load GTL 3 declarations without collapsing them into stale or flatter language shapes.

**REQ-R-ABG3-INTERPRET-002**: Public execution shall bind one admitted graph overlay or GTL program composition, one immutable workspace binding when required by the operation variant, and one `GraphFunction` callable published by that program, with a GTL `Job` contract when durable semantic job identity is declared. A GraphFunction is the callable library/work boundary inside the program, never the whole program or a substitute for program admission.

**REQ-R-ABG3-INTERPRET-003**: ABG shall materialize graph functions through explicit, replayable materialization requests over declared graph-function identity, profiles, and structural parameters.

**REQ-R-ABG3-INTERPRET-004**: `GraphVector` shall remain internal invariant-boundary truth for local traversal, evaluation, proof, closure, and dispatch facts. It shall not be the public execution carrier.

**REQ-R-ABG3-INTERPRET-005**: Recursive interpretation shall operate through explicit `GraphCall` and `Frame` truth rather than ad hoc command logic or hidden controller memory.

**REQ-R-ABG3-INTERPRET-006**: Post-dispatch runtime truth, including readiness, worker turn invocation, failure classification, proof re-entry, closure re-entry, and continuation opening, shall be engine-owned.

**REQ-R-ABG3-INTERPRET-007**: ABG shall fail closed on undeclared graph-function identity, undeclared profile, undeclared structural parameter, materialization output that violates the published outer contract, or unresolved runtime law.

**REQ-R-ABG3-INTERPRET-008**: Post-dispatch observer truth that is non-blocking but unresolved shall yield to the next lawful observer or routing layer rather than immediately redispatching the same constructive lane by default.

**REQ-R-ABG3-INTERPRET-009**: Public ingress shall validate and admit one typed `PublicInvocation` and its exact invocation authority, then ignite or continue the admitted GTL program. It shall not select or order model synthesis, gap evaluation, next-action evaluation, intent admission, graph-function invocation, action evaluation, retry, continuation, or closure, and shall not replace ABG interpretation with adapter control flow.

**REQ-R-ABG3-INTERPRET-010**: ABG shall interpret an admitted GTL program by applying its declared composition and invoking a selected published `GraphFunction` only after program membership and construction-intent admission. Each callable advances lawful internal `TraversalUnit<A, B>` instances over selected `GraphVector<A, B>` boundaries from replay-derived runtime truth until convergence, failure, hold, continuation, yielded handoff, human gate, or another lawful public stop condition is reached.

**REQ-R-ABG3-INTERPRET-011**: Internal next-edge selection shall be derived from the admitted program plus graph-call, frame, vector-local traversal, evaluation, proof, and closure event truth. It shall not be inferred from public-ingress fields, private controller memory, package-local loop counters, or a fixed first-vector shortcut.

**REQ-R-ABG3-INTERPRET-012**: A realization shall not claim admitted-program or graph-function execution parity when it only materializes a graph function, dispatches one selected vector, or invokes a callable without proving program membership, exact binding, admitted intent, and replay-derived progression across the callable graph boundary.

**REQ-R-ABG3-INTERPRET-013**: ABG shall name an admitted program/graph-function execution request with no declared runtime compute basis as `no_compute_basis`. It shall not treat an uninitialized traversal, missing admitted program, missing program membership, or absent composition as a no-op, identity traversal, deterministic fallback, probabilistic fallback, or human fallback.

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

**REQ-R-ABG3-INTERPRET-027**: Static GTL program conformance shall project traversal-unit law from admitted inventory. The report shall be able to name or reject public graph-function entry surfaces, internal graph-vector unit boundaries, start-to-entry-unit bindings, overlay policy/catalog rows, plugin-result output-admission rows, consequence traversal catalog availability, and catalog-bound bind options.

**REQ-R-ABG3-INTERPRET-028**: Static GTL program conformance shall fail closed when inventory attempts to use a bare graph vector as public authority, an overlay as an execution shortcut, runtime-start schedule selection as topology, plugin output files as result contract law, consequence traversal not present in the admitted catalog, product-local CLI/replay route selection as bind law, or ambiguous entry/bind candidates.

**REQ-R-ABG3-INTERPRET-029**: The admitted GTL program shall own the One Surface composition. ABG shall interpret that declaration while preserving `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction` as distinct semantic authorities and preserving intent admission, invocation, evidence admission, and continuation as their distinct ABG boundaries. Interpreter helper order or public ingress shall not become program authority.

**REQ-R-ABG3-INTERPRET-030**: When a program publishes an inner refinement boundary, recursive interpretation shall apply the same visible One Surface composition to that published refinement. Opaque worker-internal decomposition may remain inside one bounded action, but it shall not create or bypass another program, action selector, continuation controller, or closure path.
