# RC10 local delivery — held preparation

Source subject: repaired freeze `f242bd4d6f97b99dc6d3fdaa49025bb461fbbaa957fc5ef09c789bff1f223806` (1,334 files). This is source custody, not Root acceptance. Candidate branch is `codex/rc10-retention` at `/private/tmp/abg-rc10-retention-20261109`, based on `dd6938dd84fac37a76128d14cf1b5f0fa8aec299`.

The replacement measured archive is **unbound**. Failed archive `bff1a5214f198f5f133c8643f653dc3cb55022622009c23070e779f0ec2dadec` is rejected by both drivers. No future proof, source acceptance, checkpoint or installation is asserted here.

1. Root conjoins the repaired source, limited source review, actual build/focused/unit disposition, corrected measurement and affected-file results. Bind exact receipt pins in a new actual build binding; leave this prepared binding frozen. `source.cumulativeSourceCoverageDisposition` must explicitly cover the original 27-path change plus the three-file repair and inherited exclusions. `source.nativeTestedArchiveSourceRelation` must expose this `sourceDigest` and the exact `archive` pin. Bind the measured stage's `BUILD_INPUTS.json`, manifest and stage root, not old failed-stage outputs.
2. Root separately admits the build/checkpoint phase. The driver verifies source bytes/modes, the precise 27-path selection, an empty candidate index, unchanged base/branch, exact tools, offline dependencies and RC9 contract seeds. It preserves main's head/index and tracked edited-file bytes, the immutable RC9 archive and seed files. It stages only the 27 selected paths, leaving proof scratch and raw evidence untracked. It checkpoints only the candidate branch; no main merge, tag or push.
3. Ship custody starts with the measured archive. Clean reproduction archives the checkpoint's frozen source territory, verifies every frozen file and mode, copies exact dependencies offline, and copies only absent RC9 contract seeds. Its seeded-file list must equal the measured build's list. Compile, generate and pack without identity edits; require archive size/SHA-256 equality, identical manifest bytes and every archive member. Reproduction bytes are never substituted for measured bytes. Any mismatch stops and preserves evidence.
4. Return actual checkpoint/reproduction/member receipts for Root's final cut review. The predecessor workflow's exact packaging-review field remains unbound; this preparation activates no reviewer. A separate Root install admission must bind the satisfied packaging review, bounded claim, residuals and Root authority.
5. Allocate fresh immutable `releases/5.0.0-rc.10` and `installs/5.0.0-rc.10` only after that admission and no-clobber checks. Use the selected candidate's existing Product verification, resolved-lock and install owners. Verify every installed payload member, release checksums, fresh installed content/exports and empty-resource read/close. The final receipt alone establishes local installation. Preserve installed RC9 as operational pin; no selector change.

Prepared commands (not executed):

```text
node run-local-cut.mjs build <ROOT_BUILD_BINDINGS.json> <exact binding SHA-256>
node run-local-cut.mjs install <ROOT_INSTALL_BINDINGS.json> <exact binding SHA-256>
```

Actual binding statuses must be `ROOT_SELECTED_LOCAL_RC10_BUILD_ONLY` / `ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY`, with `executionEnabled:true`, pinned Root activation and this preparation manifest. Prepared bindings deliberately fail these gates. Known source selection and modes come from pinned `SOURCE_SELECTION.json`.

Bounds retain the predecessor ceilings: Git/dependencies/pack/inventory 120s each; compile 240s; generator 600s; install 1,200s; installed-owner smoke 900s; 8GiB Node heap setting, 64MiB command output cap, 4GiB free-disk reserve. These are stop controls, not performance promises or a whole-workspace quota. No retry, overwrite, cleanup, provider/native run or network dependency acquisition is selected.

O3 and unselected full-5.0 obligations remain open. This is local unqualified delivery custody only; no qualification, publication or human acceptance.
