# B: exact error boundary through Effect 3.22.1

Construction guidance for Root selection under the retained Product/Design/Owner basis. Resumed context; no moving A source read, execution or implementation review. **Keep one canonical runner, preserve raw thrown/rejected values, and resolve command-primary versus cleanup failure before main's narrow D15 catch.** No generic error framework or new Public failure carrier is needed.

## Verified API facts

Pinned package is Effect3.22.1. `shared/effect_definition.ts:102–105` returns `Effect.runPromiseExit(program)`, not a rejected Promise of an automatically selected Error. `internal/runtime.ts:321–359` resolves the actual Exit. Keep this membrane unchanged; do not use runPromise, FiberFailure conversion or another runner in the helper.

A correction to the motivating suspicion: **Cause.squash does not itself wrap a lone primitive Fail**, including undefined, in this pinned version. `src/internal/core.ts:2193–2231` and matching `dist/esm/internal/core.js:1026–1055` return the first typed failure unchanged, otherwise the first defect unchanged, otherwise synthesize an InterruptedException. Its problem is category precedence, not primitive wrapping: `Sequential(Die(primary), Fail(secondary))` selects secondary. A generic failureOption-then-dieOption projection has the same problem. Parallel causes do not establish a unique chronological primary.

`Cause.failureOption` and `dieOption` preserve exact payload references (`src/internal/cause.ts:232–256`); use Option presence, never truthiness or `??`, because Some(undefined), null, false and zero are failures too. `Cause.failureOrCause` returns the first Fail if present; it is not a lossless split retaining all remaining failures.

More materially, `Effect.catchAll` delegates to `matchEffect` (`src/internal/core.ts:577–590,881–913`). If the cause contains **any defect**, it promotes failures to defects and propagates the cause instead of calling the typed-failure handler (`internal/cause.ts:324–332`). Consequently primary Fail(WorksiteHelperFailure) plus cleanup Die(error) can skip D15 entirely. Squashing at the host cannot restore the missed artifact/acknowledgment effects.

`Effect.scoped` uses scopeUse, which closes scope through onExit (`internal/fiberRuntime.ts:2863–2869,3335–3349`). `onExit` and acquireUseRelease combine body and cleanup causes sequentially, body first (`internal/core.ts:392–427,1105–1131`). acquireRelease registers release only after successful acquisition, and release's error type is never (`internal/fiberRuntime.ts:1681–1692`; public `Effect.ts:10302–10314`). Its uninterruptibility guarantees neither finite cleanup nor success.

## Minimal lifting rules

| Existing operation | B realization |
|---|---|
| Fallible async preflight, confinement, snapshots/inventories, HTTP Promise owner, create-only publication/path verification, stdout write-callback drain | `Effect.tryPromise({ try: () => operation(), catch: value => value })`, with error type unknown. This preserves both synchronous invocation throws and Promise rejections. Do not use the no-catch overload or return a raw Promise from andThen/tap: pinned implementation wraps those rejected values in UnknownException (`core-effect.ts:1659–1715`; `dist/esm/internal/core.js:413,589`). |
| Fallible synchronous spawn/setup or legacy operation whose thrown value belongs to the existing failure channel | `Effect.try({ try: () => operation(), catch: value => value })` (`core-effect.ts:82–111`). Keep spawn refusal's existing no-child mapping at the command owner. Do not wrap the error in new Error/TypeError merely to satisfy a type. |
| Known WorksiteHelperFailure selected by the command owner | Fail with that exact object explicitly, rather than throw it from Effect.sync and accidentally classify it as a defect. |
| Operations expected never to fail | Effect.sync / Effect.promise are suitable only under that contract. Their throws/rejections become Die of the raw value (`Effect.ts:5730–5772,5936–5965`; `core-effect.ts:1207–1225`). Lifetime completion is a resolve-only Promise of facts; facts.firstError is handled by its owner, not a rejection to reinterpret. |
| Fallible release action inside a finalizer | Preserve the raw thrown/rejected value. A finalizer cannot expose a typed E under acquireRelease; a narrow try/tryPromise followed by orDie, or the corresponding sync/promise defect path, preserves it as a defect. Do not swallow it or convert it into an invented helper refusal. |

No-catch try/tryPromise produces UnknownException even for undefined. Identity catch must be trivial/nonthrowing. `runExactDefinition`'s separate typed-fault/null projection is not a template for arbitrary unknown helper rejection; its contract is different.

## Preserve the use outcome before scope teardown

At the **command-owned scope boundary**, retain the actual use Exit before finalizers run, using onExit inside scoped (or the existing use/release Exit argument). Keep this in one invocation-local Option/Exit slot if needed; it is not a registry or semantic authority. Obtain the closed-scope Exit as well. After finite settlement and disposal:

1. If command use failed, propagate that original use Cause; cleanup cannot replace it.
2. If use succeeded and cleanup failed, propagate the cleanup Cause as failure.
3. If both succeeded, return the actual value.

Use Effect.exit/failCause and the library's masking/finalization facilities, not a JavaScript Promise finally or a handwritten runner. Ensure interruption cannot bypass outcome retention or disposal. Keep the combined closed-scope Cause available to the bounded diagnostic/test seam; selecting the primary for outward control must not be confused with proving that cleanup succeeded. No new serialized diagnostic field is selected.

Apply the narrow `value instanceof WorksiteHelperFailure` handler to the resulting command/operation failure at **the same loop region** as current main (`helper:1496–1525`). Re-fail every other unknown value unchanged; defects/interruptions do not become D15 merely because their message resembles one. Do not apply a global helper-wide “first failure wins” slot: after a WorksiteHelperFailure was retained, current after-observation, publication, identity verification or acknowledgment-write rejection escapes as that later exact rejection. The same WorksiteHelperFailure is rethrown only when those steps all succeed and the stdout callback drains (`helper:1526–1586`). Changing that precedence would be a separate owner decision.

At the sole host boundary, Success returns its value. For a selected single Fail, throw its `.error`; for a single Die, throw its `.defect`, preserving identity/undefined. For multiple release faults, keep the known sequential release order and the explicitly selected first failure; do not search for a preferred category across the combined Cause. If there is no original payload (for example interruption-only), propagate the actual Cause as non-success rather than fabricate success or claim an original Error identity. An unexpected Parallel/ambiguous cause stays a Cause unless Root selects another projection. A small private projection for this helper's actual Exit forms is sufficient; do not export a universal error policy.

The previous release-order guidance still applies: ownership before fallible post-spawn setup; request finite cleanup before waiting completion; completion before capture/listener disposal; no deadlock waiting a live process before anyone requests termination. Recording a use failure does not cancel those duties. Existing emergency process.exit remains outside ordinary finalizer guarantees.

## B counterexamples to require, not yet executed

- Reject/throw a particular Error, a plain object, a string, null, false and undefined through synchronous and Promise lifts and the actual host projection; assert Object.is on the observed value and a separate caught/rejected presence flag. Assert that default overload wrapping is absent.
- Preserve a raw defect identity too. A constructed mixed sequential Cause demonstrates why category-priority squashing is not a primary rule; label it an API counterexample, not observed production behavior.
- Command primary WorksiteHelperFailure plus a failing release: cleanup runs and its evidence remains, the identical primary reaches the narrow D15 arm, artifact/ack ordering remains actual, and the identical primary is rethrown after drain. This catches the catchAll-with-defect trap.
- Primary undefined or a non-Error defect plus cleanup Error preserves the primary; successful use plus cleanup-only Error fails with that Error. No truthy/null sentinel may erase failure. Interruption remains non-success and still settles the owned process.
- Preflight rejection causes no launch/D15 publication. A non-Worksite loop failure is not converted to a failure artifact. Publication/path/ack rejection after a retained WorksiteHelperFailure preserves that later rejection and does not claim the acknowledgment drained. When publication/drain succeed, acknowledgment precedes the same WorksiteHelperFailure rejection.

These are bounded additions to the existing private-owner/actual-helper proof, not a new harness or a broad failure campaign. Their implementation and exact proof selection remain with Root. Source/API reasoning only; no runtime sample is claimed.
