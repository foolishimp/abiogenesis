# S6 live-04 installed launcher readiness

`T287_S6_LIVE04_PREPARE_01` is complete. This is one fresh qualification instance of the frozen producer-dependency correction, not recovery of live-03. No Run or provider was dispatched. Stop pending closed correction review and explicit Executive dispatch.

The installed preparation and launcher are frozen by `readiness-freeze.json` SHA256 `0a9a9d9bdcf9393ca1b657133d33abe66f16e555d250726905d8d00037117bca`. It binds installed `freeze.json` (`43af8c7aed06d99ff98b55ff92150f5e049a394713e2d3adbd2b222cf292c683`), launcher manifest (`37b311da8309041986aec31ed22d1b03a35d1ab966d0688e9a4c1fee954782cf`), launch readiness (`c6c4de18489b3f666e9d579512da3f15c9a0fc478f9bce7a5398d410123be195`) and 32-member proof manifest (`a4c250f57e9f890f224b48092f7ab9e4378a5e7343a05f462dc4d721fe3bece9`).

## Subject and unchanged case

- Core archive: `6311b520520efb19f6d042fb11c00bf7abe5ad335f0b274915726c482d7bdf07`, 10,337,313 bytes. Reused unchanged; no core build, pack or authority refresh. Local `core.tgz` links to the frozen archive.
- Consumer archive: `6cf3780dadeeddce756fdfe903e0c7da2ec8f894a4619a104650ab5128792e12`, 11,777 bytes. One consumer pack/install through the existing owners. Only dependency-bearing `package.json` and derived Product manifest differ from live-03; executable and schema bytes are identical.
- All 5,254 core and seven consumer regular archive members exactly match installation. Unpacked volumes are 67,629,734 and 53,625 bytes. `archive-installed-correspondence.json` retains the comparison; `archive-delta.json` separates the already-frozen correction from this consumer rebind.
- New scratch: `/private/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-root-env-GGDyGH`; worksite is its `workspace` directory. Exact installed roots, closed handoff and prepared Public start are frozen.

Input remains SHA256 `377bae203c2ac43bf0e0339a24ce979998aa4247807c68c2fe383d274a74ee87` (84,605 bytes), canonical digest `b99defdc9a3f82fd350b95400be1f3b45858860d4f87ec28d2de028b72c52c2d`. Case remains `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b`; assessment schema `5cef9b2bd43d576bc16043c397dd398a7b26912ca349cd6721381905369d8266`; fulfillment policy `f5cfa9df3369a46892745b1d9207448ba560402544541bb2460b39dcafc55a72`. Input, file inventory, schema and policy were byte-compared with original S6 and live-03 inputs. Six initial files total 11,862 bytes. Conformance, implementation design, test design and execution-plan assets remain absent; seven obligations remain initial/open. Public call is 17,683,329 bytes. No prior runtime Results/events were imported and no graph schedule was imposed.

## Launcher and controls

Launcher and readiness scripts are byte-identical to live-03. Readback changes only request identity `s6-live-03-` to `s6-live-04-`. All three scripts pass syntax checks. Provider/controls records are byte-identical; installed CLI/actor/transport/liveness owners and shared proof helper are unchanged. `checks.json` and `binding-delta.json` retain these checks.

Pinned executable: `/Users/jim/.local/share/claude/versions/2.1.280`, SHA256 `387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d`, explicit `--model claude-opus-5-5 --effort xhigh`. Unchanged controls: startup/inactivity 60 seconds, hard cap 3,600 seconds, actor termination grace one second; fixed commands 20 seconds/grace two seconds; recursion 12; context 128 files/131,072 bytes; selector prompt 131,072 bytes. No outer CLI timeout, native fallback, control override or automatic paid retry.

Only after explicit dispatch:

```sh
node .ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-producer-dependencies-01/installed-live-04/launch.mjs --dispatch-once
```

The accepted launcher retains raw evidence before assertions and performs both genuine cold Public reads with exact returned source coordinates, fresh installed CLI processes and empty reader environments. Expected baseline test failure remains an observation; HoG owns subsequent selection/correction. Complete outcome/effects/coverage/UAT/parent and Run closure remain unproved.

## Costs, preservation and limits

Core extraction took 0.892 seconds separately. Preparation took 19.617 seconds end-to-end (readiness snapshot at 19.579): verification 11.634, core installation 2.674, installed-content check 0.506, consumer installation 1.430, installed owner loading 0.217, environment/workspace admission 0.536, and publication/Program/catalog preparation 0.345 seconds. Bootstrap owner loading/consumer preparation took 0.425 seconds within that total. Verification processes the 67.6 MB/5,254-member core and consumer; this is setup volume, not runtime or native latency. Native, runtime and readback costs do not yet exist.

All 27 correction-proof, 113 live-03 run-proof and 32 live-03 readiness-proof members still match, as do the old readiness return/freeze. Prior Runs, assets and the attributed live-03 `/tmp/.x` scope deviation remain preserved; this fresh qualification neither erases that adverse fact nor claims recovery. `FRAMED-RECOVERY-01` stays open.

Bootstrap bodies are derived extraction copies, checked byte-for-byte against the pinned retained core archive. They contain no irreplaceable authority or proof. The archive, correspondence record and preparation scripts suffice to reproduce them; bootstrap directories and bootstrap-host links may remain disposable/untracked as before. No source/HOW/test/case/oracle/schema/policy/model/control/Git or release change occurred. Readiness is frozen; no dispatch under this grant.
