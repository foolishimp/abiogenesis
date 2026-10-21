# Public independent effects-review return

This is Root's transcription of the public return from
`/root/stdo3_l5_effects_review`, recorded by the coordination Writer on
2026-10-21. The reviewer made no file writes, tests, runtime or Git effects.
The recording Writer did not independently repeat this review. Reviewer
technical findings and Root's priority/disposition remain distinct. This
record preserves the bounded qualification; it grants no L5, qualification or
release acceptance.

## Product frame, subject and independence boundary

The reviewer reconstructed the fixed fifteen-family ABIogenesis 5.0 Product:
sole GTL Program, direct HoG traversal, sole ABG admission and Event Calculus
truth. Physical effects, immutable definitions and derived projections remain
distinct. The common library must be used by production consumers; packages
and tests are not delivery. The selected worksite-causality frame covers E03,
U1/C0, K08/K09/C2 and E04. Complete installed-tree conjunction belongs to the
separate integration review.

The exact reviewed source is under the stage of
[`c2-source-prefix-candidate-01`](../c2-source-prefix-candidate-01/freeze.json),
freeze `96b9ce2062ab04f1a456ba28d3122160e1093d8b6ecdfb88ae1cd8b6f0338ee8`.
Package: `fadd07e06799be957087419527c683ce18650ecf0abfe669c0f28e034d84aef6`.
Manifest: `51de2eb3af366ce1089f074d56258312620266f67759344acc549966447c6a84`.
Content: `349c24b4c4cc15431d92a5d6f46f48420367f56a8d25dc1fb2cbb97f44a3e5d3`.
The reviewer independently verified 23 selected source pins, accepted design
`cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b`, L2
`65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1`, and exact
STDO manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`
with empty composition.

## E03-L5-01: raw exit can be mistaken for final process-scope absence

**Reviewer severity: S2. Root priority: P1. Current boundary: mandatory library
delivery blocker.** This is a source-established counterexample, not a measured
frequency or a new runtime reproduction. No forged event or store failure is
needed.

The reviewed trace, with line numbers belonging to the exact staged source:

1. `shared/owned_process_lifetime.ts:280–284` records raw direct-child exit and
   invokes `onExit` before process-group cleanup is established.
2. `abg/worker_transport.ts:387–390` cuts capture and calls the actor observer.
   `abg/actor_process.ts:1232–1254` admits `actor_process_exited` and sets
   `processTerminalConfirmed = true` while the POSIX group may still be present
   or its absence unknown.
3. An observed stream error before completion becomes `firstError` at shared
   lifetime lines267–270. Shared observation lines215–224 suppress
   `onUnconfirmed` once an error exists. Worker transport lines450–455 throw the
   error before returning the final scope facts.
4. The actor's normal overwrite at1262 is skipped. Its catch at1386–1405 can
   admit `actor_invocation_failed` / `transport_exception` while retaining the
   stale confirmation value.
5. Replay at2444–2448 derives confirmed termination from exit plus absence of
   an unconfirmed marker. Actor lifecycle at645–651 can then report cleanup
   complete without a final physical absence fact.

The retained N1 exclusion for early close **without an observed error** does not
cover this error trace. Preserve the existing positive case in which the group
is already absent before the channel conflict: it proves that ordering, not
the counterexample above.

There is also an intermediate variant: immediately after the raw exit admission,
replay reports confirmation before final scope/artifact/actor terminal closure.
At that point actor lifecycle629–651 still correctly reports cleanup pending,
**not cleanup complete**. `runtime_liveness.ts:811–815` reports `processLive =
false`. The retained-work gate in `invocation_admission.ts:512` also requires
the actor not be active, limiting that consequence. These narrower facts must
not be inflated into a broader demonstrated admission failure.

| Reviewed source | SHA-256 |
|---|---|
| `shared/owned_process_lifetime.ts` | `77feebf69af3c6df487d0d2954544fd6588f84a7c68fb00b03eda60b425756cd` |
| `abg/worker_transport.ts` | `8f04a97ee6bf99fbdd18a4bd6a9816048dfa08c83c9a2d0704e86f3fb683e51e` |
| `abg/actor_process.ts` | `d7b779a0cbb86059135682ecc63b36ae3f5bd6fdba748bec43d258d8fcd44126` |
| `abg/replay.ts` | `adb5cfb380f2ab38d7e0a77fd70ae96cd227c9b2680458083359849655769099` |

The owning `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN` incorporates
two relevant design statements: subject
`d3dabca896de207185ff9e3641df3d52f76afc126b140deb93a59957f648a7da`, lines107–110,
requires physical absence for `confirmedProcess`; subject
`49ca598c60a815b532f02503c6c1a409bdd58d9f4dbd2247574f90206d410b64`, lines29–39,
treats preterminal exit/spawn failure as already confirmed and avoids a second
terminal. Reconcile this explicitly with L2 §4's direct-exit versus group-scope
distinction. An implicit reinterpretation is insufficient. The affected truth
requirements are HANDLERS003 and PROJECTION007/008.

The normal positive artifact at actor_process1297–1298 already carries
`exitObserved` and `terminationConfirmed` after awaiting the worker. Terminal
handling1323–1347 consumes that exact artifact. The exceptional terminal without
that artifact needs an actual final physical-fact prerequisite. Event-store
lines684–702 support the diagnostic variant. The smallest repair is the owning
HOW, final-fact error handoff, actor confirmation and affected projection path,
preserving first-error identity and bounded cleanup. No new event or carrier is
inherently required. The separately prepared
[lifetime HOW](../e03-final-facts-repair-01/HOW-proposal.md) is a proposal; it is not repaired
source or accepted delivery.

Focused closure must cover exit-before-error with absent/present/unknown scope,
error-before-exit, first-error identity, bounds, exactly-once admission,
intermediate and terminal full/indexed/cold/fresh projections, and the affected
installed route. These are required affected relations, not a completed test list.

## Other bounded review predicates

The reviewer reported no counterexample in the following selected predicates,
subject to the explicit exclusions. This does not establish all possible
interactions or whole-Product completion.

- C2 `execution_basis.ts:788–816` materializes ordered logical events and
  authenticates the physical prefix; C1/C3 guards match HOW198–205. Event-prefix
  lines61–90 and runtime-history348–372,589–641 keep nominal generation and cold
  validation distinct.
- U1 joins the actual cause with actor/process/call/fibre/basis/grant and scoped
  currentness. The review does not establish nested-root coverage, later
  mutation or indeterminate-cause authentication.
- C0 conservatively withdraws potential-effect authority; only authenticated
  successors re-establish it. Failed admission or observation does not restore
  authority.
- E04 inventory, persistence, publication, guarded replacement, snapshot and
  archive policies remain distinct. The reviewed bodies match their bounded
  proof; this supplies no independent release gate.

The reviewer reacquired and matched selected logs/receipts: lifetime
`8668dfa9…` (27 cases), ENOENT `ca36254c…` (three no-PID cases), C0 `80c749e3…`
(four installed and eight fresh cases), finite `305ee8fa…` / `04c6e9db…` /
`6d6aff5c…` / `14712630…`, and E04 `3c47dfc7…` (ten cases / thirteen steps).
These short identifiers reproduce the review's supplied locators; exact finite
freezes are bound in [the current plan](plan.md) and underlying evidence records.
Earlier failed cuts remain failed. Windows cases are controlled evidence, not
live Windows qualification. The physical native conflicting-output case proves
absence before error and does not exercise E03-L5-01's ordering.

Residual `74314596…` historical assembly, nested roots, later C0 mutation and
indeterminate authentication were not triggered by the selected proof. N1 is
limited to its observed-error qualification. N2 awaits actual installed PID
equality. N3's nine legacy helper paths are unqualified; Root's new retirement
selection opens that work and does not close it by declaration.

P5 successor08 proves new-source root admission/opening, but has no C2 actor,
helper/HTTP acknowledgement, result admission, fresh N2 equality, negative-case
campaign or terminal result. The timeout is not itself a proven source defect.
P4 native remains pending. The review closed with one S2 finding, preserving
these exclusions and the separation from complete installed-tree conjunction.
Hash equality and finite passes cannot be upgraded to semantic closure.
