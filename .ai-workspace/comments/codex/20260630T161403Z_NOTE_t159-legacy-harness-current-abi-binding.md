# T-159 Legacy Harness Current ABI Binding Note

## Status

This note scopes the `test_t159_odd_sdlc_t132_frozen_live.test.mjs` update as
legacy proof-harness maintenance, not as part of T-180 closure.

## Change Class

`realization_refactor`

## Scope

The T-159 frozen `odd_sdlc` live harness now patches the frozen downstream
workspace so its installed ABI command probe and initial-state command checks
bind to the current package-backed ABI TypeScript install model.

The change preserves T-159 as a legacy traversal-unit and consequence-bind
regression check. It does not add node-type law, runtime registry law,
type-composition law, or T-180 readiness authority.

## Boundary

- T-159 remains closed as the traversal-unit/consequence-bind formalization
  ticket.
- T-180 remains the governing ticket for reusable GTL node types and type
  composition.
- The legacy harness update may be included in the source release line as test
  maintenance, but it must not be cited as T-180 acceptance evidence.

## Proof

The current full semantic test suite includes the T-159 guard path and passes
after this harness update.
