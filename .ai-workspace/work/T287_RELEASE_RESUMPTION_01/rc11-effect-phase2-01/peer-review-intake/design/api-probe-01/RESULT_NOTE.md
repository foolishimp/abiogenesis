# API feasibility result — one invocation

The proposed **local primary-Exit selection pattern is feasible on pinned Effect3.22.1 / Node24.7.0** for all five selected situations. One actual Node invocation exited0 in 0.087197s, with no cap/driver signal, empty stderr and all fixture/module postguards unchanged. Seven observation records comprise two discriminating baselines plus five selected-pattern cases; observations and full Cause/order/identity summaries were written before assertions. No retry or second execution occurred.

The unchanged naive Scope + catchAll case produced Sequential(Die(primary), Die(cleanup)); the narrow typed catch ran zero times. The separate mixed-Cause baseline confirmed squash chooses a secondary typed Fail over a primary Die, while a lone Fail(undefined) remains undefined.

The tested pattern is local to api-probe.mjs::selectedScope: enter uninterruptibleMask, restore the scoped body to interruptibility, capture its use Exit with onExit **inside** Scope, collect the closed-scope Exit, then choose original failed use Exit or otherwise closed Exit. Propagate that Cause with failCause before the narrow catch. One invocation-local Exit slot suffices; no new runner, exception wrapper or generalized runtime is involved.

Actual results:

- Worksite-like Error + cleanup Die: cleanup ran once; the identical primary reached the narrow catch once, after scope closure.
- Undefined and string primary + cleanup Error: both remained present failed outcomes with Object.is equality; neither became success or a wrapper.
- Successful use + cleanup Error: the identical cleanup Error propagated as a defect; it was not swallowed or sent to the typed catch.
- Live interruption: body readiness preceded the interrupt request; use Exit was retained, cleanup ran once, scope closed and selection occurred before interrupt handback. Final outcome remained interruption-only failure. The closed-scope trace retained its cleanup defect as well. The actual interruption Cause contains nested Sequential/Empty/Interrupt nodes; do not require a single Interrupt tag or parse that trace as an application policy.

This supports the B error-composition choice, not production source or semantic acceptance. It does not execute identity-preserving preflight/publication Promise lifts, the final JavaScript throw projection, D15 artifact/acknowledgment, child acquisition, finite OS cleanup or installed Product behavior. Those remain B's actual-owner obligations. The local first-failure preference concerns scoped cleanup; it must not become a global main-wide rule that masks a later publication/path/ack rejection. Root selects the eventual B construction after A closes.

Only files in this API-probe directory were created; the fixture imported Effect and Node standard APIs, not Product/shared source, and spawned no OS child or signal. Effect fibers here are in-process library computations. The outer Node process was reaped by the finite driver. Source/API and actual observations were conjoined by this resumed Design proof Worker; this is not independent implementation assurance.
