# D1/D4-c installed proof on cut `fd38e8227`

Worker record for T-287 Phase D package D1/D4-c, under the sixth amendment's grant (item 4). Base `3d33d558452a80ecf7a0055343f5322710fb8a23`. The proof ran on an isolated stage built from `git archive fd38e8227`. The tree changed only in the granted files. This record holds digests, counts and paths (TD-19). The evidence roots stay in the Worker scratch `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/d14c/`, retained and not cleaned.

| Step | Exit | Elapsed s | Result |
|---|---:|---:|---|
| Build | 0 | 34.9 | `npm ci --offline` 0.73 s (16 packages from the local cache); `tsc` 7.75 s; generator 22.65 s; `npm pack` 3.75 s. Archive sha256 `550b48cc9a0d81af85ff89f61f89cfe28951c829c6d5d24a251768887b743df6`, equal to the Executive's and byte-equal by `cmp`; 5,317 members. All 1,793 source rows are unchanged after the build. |
| P1 `public-preparation` | 0 | 289.85 | Satisfied. Ten Public calls; first and warm resolution; copied, mutated and crossed-lock cases; the external consumer's `tsc` with `skipLibCheck:false` passed. |
| P2 `partial-install` | 0 | 69.76 | Satisfied. `target_failure`, no second admission, original install preserved. The oracle observed prefix equality (3,196,095 bytes, `sha256:43860c70…f09a`). Both physical roots are present. |
| P3 `declared-execution` | 0 | 46.11 | Satisfied. Literal `Hello World`; fresh `run_result` and `run_replay` reads both returned results. |
| P5 (15 focused lanes) | 0 | 544.69 | Satisfied. 147 tests: 141 pass, 0 fail, 0 cancelled, 6 skipped (no credit; P5-U1 retained-root cases). Worksite command route witnessed by the rust-cli post-deploy run on this archive. HTTP route pending to D3. |
| P4 `stdo3-native-selection` | 1 | 48.63 | **Stopped before launch.** Every pre-native negative passed. The positive dispatch was refused by the installed actor-process boundary: `actor_process_invocation_refused`, "ABG_TS_CLAUDE_APPEND_ARGS must not override protocol-owned flag --tools". Zero actor starts, no provider call, no cost. |

**Drift rulings applied.**

1. **Support manifest.** `candidate-support-manifest-fd38e8227.json`, sha256 `cd04ea23ade646b904e5186ae785788411cbf8bd7fd781af6ffb94d9cfed4d9b`. It holds the same 13 paths, with digests and bytes read from the stage. The seven changed rows are exactly the activation's seven.
2. **STDO 3.0.2 basis.** The successor runner `proof/run-installed-d14c.mjs` has sha256 `a184966c2756f905858969be3f6202177e407cf67453569f3139695a48e42e9b` and 49,263 bytes. It was copied from the frozen runner (`fb20ffc2…7164`, verified first).
   - Its `:62` holds the constant `f7f3f824…4477`.
   - The configurations bind `stdo://releases/v3.0.2/`, the release path and its `manifest.json`.
   - The release's Executive spans equal the rc.1 spans the runner pins at `:390-391`.
3. **Credential.** The runner reads the credential once at load (`:20`) and adds it to `actorEnvironment` (`:336`) only. `native-environment.json` (`:340`) records `[withheld]`.
   - `runner.diff` is 33 lines with 3 hunks (sha256 `20a2567b…136c`).
   - `node --check` passed with rc 0.
   - The wrapper's credential scan found 0 matching files.
4. **External consumer.** It stays pinned, and its `tsc` passed in P1 and P4.

**Native cost.** None. No actor was launched.

Files: `configuration-p1.json`…`-p4.json` and `effect-grant-p1.json`…`-p4.json` (byte-equal copies of the files as run), `candidate-support-manifest-fd38e8227.json`, `runner.diff`, `inventories.json`, `results.json`, `p5.json`, `measurements.json`.
