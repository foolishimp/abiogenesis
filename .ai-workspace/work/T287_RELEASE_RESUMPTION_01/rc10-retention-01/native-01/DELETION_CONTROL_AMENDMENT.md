# RC10 deletion-control preparation

Draft only; exact deletion list and Root scope conjunction are pending. Reviewed core READY and in-scope immutable inputs remain unchanged. No Product file was deleted.

`frozen-proof.deletion-preparation.mjs` adapts only the source-freeze loop and absent-only seed guard. A future exact binding must supply `allowedDeletedPaths`, matching `deletedSourcePreimages` (path/bytes/sha256 equal to the selected SOURCE_INVENTORY rows), and `requiredNewSourceFiles`. Every deleted path must also be in source write territory, exist in the baseline, have a matching preimage and be physically absent. All other baseline rows are still mandatory and conserved unless their existing edit grant applies. No generic missing-file permission exists.

Frozen receipts retain deleted preimages and actual absence. RC9 absent-only contract seeding skips exactly deleted owned contract paths; every build command is followed by an absence check so generation cannot silently revive one. Required new lifetime test remains mandatory; the next TASK will say this explicitly and the next binding will use `requiredNewSourceFiles` rather than the misleading optional name.

At exact scope binding, add each deleted source path to the native read roots so the original bytes and final absence are commissioned observations. After return, compare the native after-observation with the frozen source at the affected paths, including absence for every deletion and exact digest/byte identity for changed/new files. Missing after-observation or a missing frozen stage is incomplete proof, never correspondence. Unchanged files outside commissioned R remain supported by source conservation, not claimed native observation coverage.

Apply this amendment additively only after the finite deletion list is admitted; preserve the reviewed core controls and old evidence hashes. No runtime, provider, build or Product test is selected by this draft.
