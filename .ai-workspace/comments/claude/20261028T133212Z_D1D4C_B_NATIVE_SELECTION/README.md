# D1/D4-c-b: P4 `stdo3-native-selection` on cut `fd38e8227`

This is the Worker record for T-287 Phase D package D1/D4-c-b. P4 was re-granted after the D1/D4-c disposition.

- **Base.** `0da2b1e7e359f768ad10f50a876f648e6f969d19`.
- **Stage.** The run used the D1/D4-c stage. Its archive is `550b48cc9a0d81af85ff89f61f89cfe28951c829c6d5d24a251768887b743df6`.
- **Prerequisites.** P1, P2, P3 and P5 are pinned as D1/D4-c's configuration cited them: the same paths and digests, re-verified before and after the run.
- **Record contents.** Digests, counts and paths only (TD-19).
- **Evidence.** The evidence roots stay in the Worker scratch `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/d14cb/`, retained and not cleaned.

| Lane | Exit | Elapsed s | Result |
|---|---:|---:|---|
| P4 `stdo3-native-selection` | 0 | 64.04 | **Satisfied** on one native call (`nativeCalls` 1, one `actor_invocation_started`). The oracle's choice is `graph-function://registered-selection/A@5`. The terminal value's `rendered` is the literal `{"service":"Atlas","status":"healthy"}`. The source mirror was then made unavailable. The fresh `run_result` and `run_replay` reads both returned results. A new invocation was refused (`invalid_capability`, issue path `/runEnvironment/cause/access_unavailable`). |

**The native call.**

| Measure | Value |
|---|---|
| Runner interval `one-native-positive` | 10,631.1 ms |
| Installed CLI request | 10,545.6 ms |
| Actor process, start to exit | 6,367.0 ms (13:31:06.576Z to 13:31:12.943Z) |
| Provider-reported duration (API) | 5,336 ms (5,042 ms) |
| Cost | 0.057788 USD |
| Turns | 2 |
| Model | `claude-opus-5-5` (stream `init` model, `modelUsage` and `provider-observation.json`) |

The process ran under `/usr/bin/time -l`:
- 64.04 s real, 66.54 s user and 11.26 s sys.
- Maximum RSS was 3,428,597,760 bytes.
- The 1-minute load average was 14.41 at start and 8.63 at end.

**The runner.** The second successor runner is `proof/run-installed-d14c-p4.mjs`.
- **Digest.** sha256 `b539d704710b13bab40ef7ab3821379d338d8eb562a19ea9535832858c9b5371`, 49,250 bytes.
- **Source.** It was copied from `proof/run-installed-d14c.mjs` (`a184966c2756f905858969be3f6202177e407cf67453569f3139695a48e42e9b`, verified first).
- **The one change.** At `:337`, the two tokens `'--tools',''` were removed from the runner-appended arguments. The arguments are now `['--model','claude-opus-5-5','--effort','xhigh']`.
- **Checks.** `runner-p4.diff` holds the one changed line, and `node --check` returned 0.
- **What the transport supplied.** On the closed-prompt lane, the Product supplied `--safe-mode --tools ""` itself. The admitted transport arguments show that pair, followed by the appended `--model claude-opus-5-5 --effort xhigh`.

**Credential.**
- `native-environment.json` records `[withheld]`.
- The wrapper's scan covered `l4/p4`, `l4/config`, `logs` and `tools`, and found 0 matching files.
- `HOME` was not scanned.

The files in this directory:
- `configuration-p4b.json` and `effect-grant-p4b.json`, byte-equal copies of the files as run;
- `runner-p4.diff`;
- `results.json`;
- `measurements.json`.
