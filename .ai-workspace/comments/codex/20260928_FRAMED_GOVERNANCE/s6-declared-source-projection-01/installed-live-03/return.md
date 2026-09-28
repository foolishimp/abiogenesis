# S6 live-03 installed launcher readiness

`T287_S6_LIVE03_PREPARE_01` is complete. This is the separately selected fresh qualification instance of the declared-source correction, not recovery of live-02. No Run or provider was dispatched. Explicit Executive dispatch remains required.

The exact installed preparation and launcher are frozen by `readiness-freeze.json` SHA256 `ec4372708d7ccf23e16c8c97dd45f263931addd2702f7ad26fbe411a9bd680d2`, which binds installed `freeze.json` (`37450316a9f4d020cf3c1cf5d9f0aebd377025308c10d33367915a6e5d9a7d59`), launcher manifest (`381fa2024e3fb9d3a247e7c2d549d4cdd6b01755b818cff2a00415ccd19dd79d`), launch readiness (`f4ac25eddadb12c5591d412487a15b779a021e9a9863daf242d19faec908645c`) and 32-member proof manifest (`26549de174974f26299f7a5aa5161ab85a94b39dea719e0d50505ac8cd5d3aff`).

## Exact subject and installation

- Reused core archive: `08d95ee6fc816e413f8f6deaf43c1f106d1c202c942eead9af47bb962cd30110`, 10,337,143 bytes. No core build, pack or authority refresh occurred. The local `core.tgz` is a link to that frozen archive.
- Consumer archive: `5b27fb85a2c2153819b1c273c5f2a8816974af3d9eca3865f3519cec4f1e7a99`, 11,776 bytes. One consumer pack and one installation through the established preparation owners. Only `package.json` and the derived Product manifest differ from live-02; executable and schema bytes are identical.
- All 5,254 core and seven consumer regular archive members exactly match their installed files. The core contains 67,629,396 unpacked bytes; the consumer 53,630. `archive-installed-correspondence.json` retains the complete comparison; `archive-delta.json` distinguishes the already-frozen core correction from this preparation's consumer dependency change.
- New scratch: `/private/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-root-env-sg2xZg`; worksite is its `workspace` directory. Core and consumer installed roots are bound in `launch-readiness.json`.

The input file remains `377bae203c2ac43bf0e0339a24ce979998aa4247807c68c2fe383d274a74ee87` (84,605 bytes); canonical input digest is `b99defdc9a3f82fd350b95400be1f3b45858860d4f87ec28d2de028b72c52c2d`. Root's case remains `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b`; schema `5cef9b2bd43d576bc16043c397dd398a7b26912ca349cd6721381905369d8266`; policy `f5cfa9df3369a46892745b1d9207448ba560402544541bb2460b39dcafc55a72`. Input, file inventory, schema and policy were byte-compared against the original S6 and live-02 inputs. Six initial files contain 11,862 bytes. The conformance document, implementation design, test design and execution plan remain absent. Seven obligations remain initial/open. Prepared Public call size is 17,683,334 bytes.

## Controls, checks and dispatch boundary

The existing launcher, capture, assertions and cold-read logic are reused; only base/evidence coordinates and read request identity change. All three launcher/readiness/readback scripts pass syntax checks. `checks.json` and `binding-delta.json` record the exact delta. Installed CLI, actor, transport and liveness owners plus the shared proof helper are unchanged.

The pinned executable remains `/Users/jim/.local/share/claude/versions/2.1.280`, SHA256 `387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d`, with explicit `--model claude-opus-5-5 --effort xhigh`. Provider and controls records are byte-identical to live-02: startup/inactivity 60 seconds, hard cap 3,600 seconds, termination grace one second, fixed command timeout 20 seconds/grace two seconds, recursion bound 12, context 128 files/131,072 bytes and selector prompt 131,072 bytes. No outer CLI timeout, fallback, override or automatic paid retry was introduced.

After explicit dispatch only:

```sh
node .ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-declared-source-projection-01/installed-live-03/launch.mjs --dispatch-once
```

That launcher retains raw evidence before assertions and performs both genuine cold Public reads using exact returned source coordinates, a fresh installed CLI process and empty reader environment. The prepared handoff/request are frozen; no runtime Results were imported. Expected baseline application failure remains observation, and HoG owns subsequent selection and correction.

## Setup cost and limits

Archive extraction took 0.534 seconds separately. Established preparation took 19.769 seconds: artifact verification 11.930, core installation 2.513, installed-content check 0.480, consumer installation 1.424, owner loading 0.230, environment/workspace admission 0.539, and publication/Program/catalog preparation 0.355 seconds. Bootstrap owner loading and consumer preparation took 0.485 seconds within that total. The verification interval accounts for the 67.6 MB/5,254-member core plus consumer, not native/runtime execution. Native, runtime and readback timings do not yet exist.

`preservation.json` confirms all 28 prior correction-proof and 109 live-02 run-proof members, the old return, and unchanged case/input identities. Live-02's authored assets/history remain preserved. `FRAMED-RECOVERY-01` remains open; this fresh instance neither resumes nor proves cross-authority recovery. Complete S6 outcome, effects, fulfillment and closure remain unproved until the selected installed attempt. Source/HOW/case/oracle/model/bounds and Git were unchanged. Readiness is closed; stop pending Executive dispatch.
