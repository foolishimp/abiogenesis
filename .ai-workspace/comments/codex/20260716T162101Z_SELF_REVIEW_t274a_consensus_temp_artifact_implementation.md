# T-274A Consensus Temp Artifact Implementation Self-Review

- ticket: T-274
- phase: T-274A
- verdict: implementation and executable proof complete; independent review pending
- reviewed_at: 2026-07-16T16:21:01Z

## Findings Repaired

1. The delivered projector foundation did not satisfy the phase exit. It
   derived schemas in memory but omitted physical temp materialization, both
   vocabulary assets, exact byte replay, and the complete substitution matrix.
2. Allowed Valibot schema/action types were not bound to exact constructor
   references. Forged lookalikes could reach projection. Projector 1.1.0 now
   rejects them and binds that policy into its basis digest.
3. The first private artifact helper leaked declaration types through the
   package generator. Its test hooks are now `@internal`; no package export or
   public contract row was added.
4. The new private declaration changed the package payload identity. Existing
   generated publication metadata was regenerated and source-blind packed
   tests were rerun.
5. The original helper paired a raw schema with an authored locator. The
   integrated implementation derives recursively frozen source rows from the
   M03-owned Consensus family and resolves them through the accepted opaque
   semantic-build resolver before projection.

## Verified Outcome

- nine schema candidates and two vocabularies derive from one native family;
- 11 paths and identities are unique and deterministic;
- byte digests equal projection and coordinate digests;
- both vocabularies equal their native value rosters;
- all 72 invalid schema substitutions fail in native and JSON admission;
- artifacts materialize only under a temporary test root;
- no Consensus candidate asset exists under `contracts/`;
- no package export exposes the private helper;
- `git diff --check` is clean.

## Executable Evidence

- `npm run test:t274a`: 82 GTL-law + 11 T-274A tests passed.
- `npm run test:t281:phase-a`: 8 passed.
- `npm run test:t277:consensus`: 6 passed.
- repaired packed-publication set: 13 passed.
- `npm run test:semantic`: 1771 passed, 0 failed.

T-274A is ready for independent review. This self-review does not satisfy that
separate gate. T-274B remains fenced behind P1 and installed publication.
