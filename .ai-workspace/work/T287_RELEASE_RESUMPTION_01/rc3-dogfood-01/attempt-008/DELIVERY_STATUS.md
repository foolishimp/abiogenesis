# RC2 to RC3 development: stopped with an unqualified candidate

The selected local RC2 candidate was used to build an RC3 development artifact, but the governed-context work did not pass its required real-owner integration test. Root stopped further paid coding and witness calls within the current allocation; the earlier 03:30–04:30 AEDT release ETA is withdrawn. The RC3 source in the isolated worktree is uncommitted and unqualified; the packaged artifact is unreleased, and there is no installed-RC3 lookup witness or whole-Product acceptance. RC2 Run 009's earlier blocked result and unmet native UAT remain unchanged. A's original native UAT remains indeterminate; neither the A source commit nor later partial B work changes that verdict.

B06 Run `run://abiogenesis/b41b6406020177970c820e2ce81830c209ee7dc2189604f0cc419b0ad926baf5` closed `blocked` with no terminal Result. Fresh `run_result` refused `not_found`; `run_replay` returned blocked with no terminal Result. The actual Testing command Result was admitted at event ordinal 3216 as `result://abiogenesis/f4c73b483e8416d8c2efa1a11f5ecc5660b1669930e25d3e67b8a6927de5a325`. Its nine commands returned, in order:

| Command | Exit | Actual observation |
| --- | ---: | --- |
| fixture-current-measurement | 0 | 4,616 bytes, SHA-256 `bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6` |
| source-correspondence | 0 | All 27 reported snapshot source hashes match the current worktree. |
| toolchain | 0 | Selected toolchain copied into the isolated C2 snapshot. |
| contract-seeds | 0 | Completed. |
| build | 0 | RC3 build completed. |
| package | 0 | Produced the exact RC3 artifact below. |
| focused-owner-chain | 1 | 12 passed, 1 failed: the named real-owner test stopped during setup with `Cannot read properties of undefined (reading 'kind')`. |
| affected-owner-tests | 1 | 97 passed, 5 failed, 6 skipped; the five failures report `spawnSync stdo ENOENT` in the selected C2 environment. |
| artifact-tests | 0 | 2 passed. |

The B06 Construction Return is candid that the required named test did not reach a real held-store Testing-to-Construction run. Independent source review also found that its test-local policy and activation template are placeholders, that it reads page `bytes` rather than `content`, and that its cold assertions use an invented transcript event, omit the owner, and expect the wrong success kind. These findings are about the partial test and do not establish a Product defect. No allowed/denied/cold native lookup proof exists. The independent controlled GC03 adapter diagnostic remains diagnostic only.

The C2-produced `product://abiogenesis/typescript-tenant@5.0.0-rc.3` archive has SHA-256 `9b6440795b600ce822b54ec35c468d35af6fdd07a251f5c0bdb6c1d3ccfc253d`, size 10,936,399 bytes, content digest `sha256:434a317b1bd4c4c348ca74a9685d10609b6d3b3de45252544da4c245d9fcd08b` and manifest digest `sha256:fbb50339c5cc59e4a6225323feb1ac1f555cbc2d94f65a7c94b4bc5728fd9c65`. Its retained C2 producer coordinates, path and observed command identities are in `B06_C2_CUSTODY.json`; the artifact is not a release or accepted candidate. The isolated worktree has 14 changed/new paths inside the 23-path grant, based on `927b8c0b84915ea2c926115902c2ceeef6df26a3`; only the governed-context test changed from B05. Source, Return and four exact scratch logs are indexed in `B06_PARTIAL_CUSTODY.json` and `B06_SCRATCH_CUSTODY.json`.

Four B06 provider streams actually ran: selector $1.861384, Construction $2.2424226, selector $1.94268 and the Testing command launcher $0.3676244, for $6.414111. The plan incorrectly assumed that Testing C2 needed no paid launcher and capped the planned count at three; the fourth process was real and is included in `B06_FOUR_STREAM_CUSTODY.json`. Across the work, $86.7544958 was reported. Adding the separate $8 reserve for B03's unknown cost yields $94.7544958 conservative, leaving $5.2455042 within the existing $100 allocation; the reserve is not an actual charge, and other charges remain unknown. Root monitored spending; there was no automatic aggregate cap.

Remaining work includes an authentic real-owner allowed/denied/cold/tamper integration test and any failure-specific fixes, successful complete C2 evidence, a separate installed-RC3 native witness, and the original acceptance and qualification obligations. No further activation is implied by this status.
