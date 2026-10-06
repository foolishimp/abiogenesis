# Installed identity successor — frozen

`T287_UAT_INSTALLED_IDENTITY_04` adds the missing physical installed-content
condition. The runner retains the exact two admitted install projections
returned by the unchanged Public setup. Immediately before native dispatch and
unconditionally after invocation, it calls the unchanged trusted-bootstrap
`caller.runtime.product.installedProductContentMatches(install)` on both.
The post-check runs before fresh installed CLI readers or importing installed
Product for the oracle owner. No installed package supplies its own checker.

Each phase archives a small record with selected install/admission identity,
root, artifact/content/manifest digests and the public owner's boolean result.
A false, missing or unavailable check refuses; no fresh reader or `uatPass`
can follow that refusal. Native invocation outputs and genuine closes remain
archived by the unchanged caller. No verifier, normalizer or Public API is
copied or added; this is an acceptance condition, not a containment claim.

Affected `npm run test:uat:harness`: **5 passed, 0 failed**. The new focused
caller discriminator confirms both roots are checked in each phase; either
root's false before-check blocks dispatch, either false after-check or missing
result blocks the fresh-reader effect, and the positive case preserves order.
Controlled checker outputs test the barrier; the independent actual seven-file
consumer baseline/mutation/restoration/extra-file probe remains separately
preserved under `review-installed-identity-04/`. It was not repeated. Both
changed executable modules pass syntax checks.

Only runner, harness tests and README changed. Previous frozen records/evidence,
the other source paths, original workloads, Product/library and sealed archives
remain unchanged.
The prior clean Public preparation and oracle snapshot evidence are reused;
there was no build, expensive reinstallation, model dispatch, native Run or
application UAT pass. Subject and checks are `freeze-installed-identity-04.json`
and `installed-identity-04-checks.json`. Worker stops editing and returns the
final successor for independent review.
