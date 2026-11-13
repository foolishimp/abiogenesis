# Current RC8 broad preparation — corrected binding002

Use `close-proof.corrected-001.mjs`, `PREPARATION_MANIFEST_CORRECTED_001.json`, `STAGE04_CLOSE_BINDINGS_002.json` and `binding-002/BOUND_INVENTORY.json`. The original driver/manifest/binding001 remain historical and are superseded for execution: they skipped generated nested `node_modules` payload directories.

The correction excludes only the tenant-root dependency directory that is separately inventoried and copied. Generated nested payload dependencies remain in the exact stage copy. No test or Product source changes were made. Five whole-file credits retain 46 passes and 2 historical skips; the filtered held lane receives no whole-file credit. Both build-effect tests remain scheduled in their dedicated disposable copies.

Bind only now; Root must read the exact corrected inventory/config and separately admit the suite after the matched after measurement/profile/close. No broad test or test fixture allocation has occurred. Existing serial scheduling, failure custody, 4GiB reserve/owned limits and selected per-file/overall bounds remain unchanged.
