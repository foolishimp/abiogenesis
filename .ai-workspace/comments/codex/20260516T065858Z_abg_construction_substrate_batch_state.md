# ABG Construction Substrate Batch State

Date: 2026-05-16

## Status

The construction-substrate batch is substrate-clean but not consumer-complete.

Completed substrate tickets:

- T-134: ABG.Fn composition grammar requirements/design surface.
- T-128: installed construction runner over admitted construction intent.
- T-135: vector-local runtime regime resolution.
- T-136: observed-state admission and aggregate projection composition.
- T-137: generic overlay-frame contract and projection.
- T-138: F_D authority placement and severity routing.

Active substrate ticket:

- T-139: construction pressure package. The first slice is implemented and
  semantic proof is green, but closure is blocked until downstream deletion
  proof exists in `odd_sdlc`.

## Verification Snapshot

The latest substrate verification recorded in T-139:

- `npm run test:t128` passed.
- `npm run test:t137` passed.
- `npm run test:t139` passed.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed: 560 tests, 0 failures.

## Closure Gate

T-139 must not close on substrate-only proof. The remaining gate is a
downstream deletion proof naming one product-local controller-loop authority
replaced by the ABG substrate, initially the `odd_sdlc`
`installed_operator.ts` projection auto-advance loop or equivalent.

That consumer-side proof belongs under:

- `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-170-implement-authority-placement-strategy-and-repair-fd-overreach.md`

## Review Corrections

The current structural correction split T-139 and adjacent construction
surfaces out of the large `fp_consciousness.ts` module:

- `construction_observation.ts`
- `construction_event_causality.ts`
- `construction_pressure_package.ts`

`fp_consciousness.ts` remains the construction composition and compatibility
export surface, not the semantic center for those carriers.

Two later review points were stale against the live tree:

- T-136 already composes observed state into runtime aggregate projection and
  has a non-refresh runner proof.
- T-136 snapshot observed-state coverage already returns a typed outcome and
  throws `ObservedStateSnapshotCoverageRejectedError` from the assertion helper.

T-130 hook action typing landed in the same broader wave but is not a direct
load-bearing dependency of T-139's pressure package carrier.

The T-137 fixture now also proves the overlay projection lifecycle across
declared, waiting, active, and closed rows, plus pressure-free predicate
termination. That closes the medium coverage gap flagged during review without
changing the overlay-frame API.
