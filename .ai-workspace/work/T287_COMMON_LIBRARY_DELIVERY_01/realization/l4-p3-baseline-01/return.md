L4-P3-BASELINE-01 stopped at the first setup seam: additional language Product installation returned `dependency_lock_mismatch` at `root-installed-environment.mjs:323`. The process exited 1. Bootstrap offline install and external declarations passed, but no Public start or result/replay read occurred.

The installed fixture package.json has no npm dependencies while its Product manifest requires ABI. All 13 actual Node ABI search candidates are absent, including all three inside the selected fixture target. The separately installed ABI sibling has the selected baseline manifest and is outside that target. All six fixture archive members match both producer and installed bytes; the fixture archive SHA-256 is `01a4059c50b0479e3c0922ac7fcb17a058f45db5cda1d6431352b628b30b4510`. Exact installed package/manifest copies, physical npm locks, archive members, Node search paths and source spans are retained in `failure-localization.json`.

The failure occurred before event-store acquisition at helper lines 357–363. Runtime/event paths are absent. There is no P3 event prefix, close handoff or reopen authority to preserve. The original in-memory Product resolved lock and request carriers were not persisted by the helper; no owner operation was replayed to manufacture them.

`execution.stderr` retains the original failure and raw time output: 33.59 seconds real, 40.72 user, 6.89 system. This is a failed setup interval, not completed P3 comparison evidence. `measurement-return.json` retains parent samples and logical/allocated footprints with unobserved internal counters explicit.

The closed failure cut inventories 11153 physical resource files. Post-verification matched baseline source 1,311, generated 936, dependency entries 4,576, immutable source 1,311, protected main 936 and all 18 prior baseline P1 records. The frozen archive, toolchain, support, runner, oracle and controlling authority pins are unchanged.

Root's triage selects a later exact archive handoff and fixture npm dependency repair. No repair, retry, cleanup, provider call, old P1 runtime acquisition or next lane was performed. P3 remains open. This return claims no L5 acceptance.
