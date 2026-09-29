# S6 live-05 installed readiness

`T287_S6_LIVE05_PREPARE_01` is closed. One fresh original-case qualification is
prepared on the accepted raw-contract/scope-presentation core. **No Run or
provider dispatched.** This is not recovery or reuse of a prior Run's Results.
Stop pending explicit Executive dispatch.

Readiness freeze SHA256:
`7bd8902a6b0224a3cbefc6b83f54cf00417f95a0309528fc60412f4b5bb9263c`.
It binds installed freeze
`8279a1873820a06d97e5c8ee3dccb32edacb7692f92922de7eabb8826868ed96`,
launcher manifest
`617c4e0a87c68515c273eb0c31c9a85b18e9c33b4e323894c6b422fc9f148e21`,
and the 35-member proof manifest
`bfbada46d255c21162f8215f5dd411201ccad7029d496c139e99111240cfeca5`.

## Exact installed subject and binding delta

| Artifact | SHA256 | Bytes |
|---|---|---:|
| Frozen core | `1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d` | 10,338,146 |
| New consumer | `b6c67144ce8ceeb27943c69cce0befa2cd1d901653907e80586b04d4ef043c7a` | 11,952 |
| Assessment schema | `9403a74ef49e75f7f4fe15809345540271ac02927aa8a5390533748d5bcbf2cf` | 3,253 |
| Prepared input | `2821278c30b0528fc890a1de30534d1879a60a25bb084ee3467cb8f76fa3f930` | 85,461 |

All 5,254 core and seven consumer regular archive members match installation;
the unpacked volumes are 67,632,004 and 54,256 bytes. Core is reused unchanged
with no rebuild or repack. Exactly three consumer members differ from live04:
`contracts/assessment.schema.json`, dependency-bearing `package.json`, and derived
Product manifest. Executable and declaration source are unchanged.

The existing fixture calls the installed generic schema owner. Only
`properties.fulfillment.properties.obligations.items.properties.support.items`
changes: it now contains the accepted two closed `anyOf` role/field forms and
descriptions. All other schema fields are identical. Schema grows from 2,613 to
3,253 bytes; input grows from 84,605 to 85,461 bytes. **The input is changed**:
only `original.assessment.schemaAsset.bytesBase64` differs. Restoring that one
field produces exact prior input equality. Installed schema bytes equal the
input's decoded schema asset. Canonical new input digest is
`sha256:583da132f421828beb50c6c2a6239c8603560f2d269c130d2dbc335d5dc6117e`.
`schema-input-delta.json` retains exact before/after identities and forms.

Original task, case/oracle/source, commands, grants, policy, seven initial open
obligations and F_P selection freedom remain unchanged. Initial six files total
11,862 bytes. Conformance, implementation-design, test-design and execution-plan
assets remain absent. Policy remains
`f5cfa9df3369a46892745b1d9207448ba560402544541bb2460b39dcafc55a72`;
case remains `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b`.
Prepared Public call is 17,685,915 bytes. No schedule, author provenance or prior
runtime evidence was inserted.

Fresh scratch is
`/private/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-root-env-73tWaC`;
its `workspace` is the worksite. `setup.json` records both installed roots;
`handoff-before-start.json` and `start-prepared.json` bind the closed installation
and exact prospective Public start.

## Launcher and controls

Launcher and launcher-preparation logic are byte-identical to live04. Readback
changes only the request identity from `s6-live-04-` to `s6-live-05-`. Four scripts
pass syntax checks. Provider and controls records are byte-identical; installed
CLI/actor/transport/liveness owners and the shared proof helper match.

Pinned executable `/Users/jim/.local/share/claude/versions/2.1.280` remains
`387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d`,
with explicit `--model claude-opus-5-5 --effort xhigh`. Unchanged controls:
60-second startup/inactivity, 3,600-second hard cap, one-second actor termination
grace; fixed command 20-second bound/two-second grace; recursion 12; context
128 files/131,072 bytes; selector prompt 131,072 bytes. No outer CLI timeout,
control override, fallback or automatic paid retry.

Only after Executive dispatch selection:

```sh
node .ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-raw-contract-01/installed-live-05/launch.mjs --dispatch-once
```

The existing launcher retains raw data before assertions and makes both cold
Public reads using exact returned source coordinates, separate installed CLI
processes and empty reader environments. HoG owns all graph selection and the
expected baseline-failure/correction progression. Native grammar acceptance,
compliance, complete outcome/coverage/independence and closure remain unproved.

## Setup and preservation

Extraction: **0.477 s** separately. Preparation: **20.562 s** end-to-end
(readiness snapshot 20.419 s). Phases: bootstrap owner loading/consumer
preparation 0.565 s; artifact verification 11.958 s; core installation 2.804 s;
installed-content check 0.522 s; consumer installation 1.545 s; installed owner
loading 0.225 s; environment/workspace admission 0.559 s; publication/Program/
catalog preparation 0.364 s. Verification processes the 67.6 MB core and
consumer; this is setup volume, not native or deterministic runtime latency.
There is no execution/native/readback timing yet.

All 52 correction-proof, 120 live04 Run-proof and 32 live04 readiness-proof
members still match. Prior return, raw answer, scope violations, assets and
archives are preserved. Live04 remains disqualified independently on scope;
this new instance neither repairs its judgment nor claims recovery.
`FRAMED-RECOVERY-01` remains open.

Bootstrap bodies are derived extraction copies, verified against the retained
archive. They add no irreplaceable proof or authority and may remain disposable
with their host symlinks. Source/HOW, case/oracle/policy, model, controls, Git and
release state were not changed. Readiness is frozen; dispatch is not authorized
by this return.
