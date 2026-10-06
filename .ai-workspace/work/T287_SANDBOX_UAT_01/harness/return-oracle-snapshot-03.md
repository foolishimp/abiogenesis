# Oracle snapshot successor — frozen

`T287_UAT_ORACLE_SNAPSHOT_03` closes the reviewed acceptance-material drift.
Each new run retains the exact manifest bytes acquired by `loadScenarios` and
the authenticated selected asset bytes (source, obligations, rubric, request,
checker) under its own `oracle-inputs/` before dispatch. It records SHA-256,
size and relative asset references in `oracle-acquisition.json`. Acquisition
parses requests and sources from those same verified bytes, avoiding a second
ambient read after authentication. Other scenarios and build caches are not
copied; the exact manifest retains their declarations only.

Immediately before judgment, the runner authenticates the archived manifest
and selected asset inventory again, then imports the archived checker. The
checker's relative manifest/rubric/request reads resolve inside that snapshot.
Configuration also requires explicit nonempty `sourceCommit` metadata, while
the immutable package digest remains the candidate identity; no Git lookup or
checkout dependence is added.

`npm run test:uat:harness`: **4 passed, 0 failed**, provider-free. The new
focused discriminator changes an isolated ambient checker, rubric and manifest
after acquisition but before snapshot: the archived actual judgment still
equals the original. Fresh acquisition of altered ambient bytes refuses;
altered archived rubric fails the late acquisition check; absent/blank source
metadata refuses. Three changed executable modules pass syntax checks.

Only `scenarios.mjs`, `runner.mjs`, `harness.test.mjs` and harness README changed.
The package/scripts, consumer publisher, installed Public caller, original
fixture assets, previous freeze and all sealed pilot evidence retain their
pinned bytes. The accepted clean Public preparation join remains applicable;
it was not repeated. This is an identity repair in test machinery, with no
Product/runtime change, model dispatch, native Run or new UAT pass.

Subject: `freeze-oracle-snapshot-03.json`; checks and preimages are the matching
`oracle-snapshot-03-*.json` records. The original independent NO-GO and its
isolated drift reproducer remain preserved under `review/`. Worker stops
editing and returns the successor for independent review.
