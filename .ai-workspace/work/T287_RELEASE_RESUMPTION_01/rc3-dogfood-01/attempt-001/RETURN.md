# A01 prepared call and Root-only dispatch

Root selected the exact [Increment A workload](../increment-a-01/RETURN.md),
Root-derived A1–A5 criteria and nine Construction write paths under Jim's
separately quoted continuation. [ACTIVATE_A01.json](ACTIVATE_A01.json) binds
that selection, the original source, Product, method, scope and budget. Its
SHA-256 is `a5a042f87a3e1d94a46d7fcf89033b1206dba2b8045584b016a25b750b02ba87`.
This is manual work authority and model-free call preparation; ABG has not yet
admitted or executed a Run. The copied verified STDO instructions are readable
under the declared paths; the native Claude lane does not expose Skill, and no
Skill-tool invocation is claimed.

The exact fresh RC2 Product constructed the immutable prepared call without
changing its event log. [PREPARED_CALL.json](PREPARED_CALL.json) binds:

- Invocation `invocation://abiogenesis/199c1a0fca90d502db76442b2efb079102c4bcab2f393805b2f5f45d0ef13658`.
- Call canonical digest `sha256:1fbcea69e2c747c858853c44a353ad48ea66dedbe9324732a39e2a903ecccc01`; retained raw `prepared-call.json` SHA-256 `10331d7dd94ff6b9510e2aa1943fbfcaf4db79982f711cdf04eeafc035492c36`.
- Input canonical digest `sha256:987e881693eb6248fc7fb4c6806f9aaa1ccdd3bc9f01b0a656d75fc9279de1e5`; raw `input.json` SHA-256 `1475f2f6026c918530ec9f287bf7eabaccb6fe94c1862d974da2b0ef5b487431`.
- Workload SHA-256 `5b27f6ed16f82e2f3f8016f5cbd4609b3ec61168111c3ff907934edc45a59164` and initial event-log SHA-256 `297e1dd25ab2626403357e567e1140e03eb0b6bd4a6cb4c2ad120c74c3ac8b8c`.

The exact raw call is 29 MB and remains in this local attempt directory;
[PREPARATION_MANIFEST.json](PREPARATION_MANIFEST.json) hashes it and all
controls. The command script does not regenerate or substitute that call. It
checks the pinned call, input, activation, method, source, toolchain, setup,
provider binary and current event prefix; reruns the no-write preflight; and
uses an exclusive `STARTED.json` marker before its one `invokeLifecycle` call.
After a refusal, interruption or partial attempt, preserve the evidence and
return for Root triage rather than rerunning automatically.

The one-shot script is [dispatch.mjs](dispatch.mjs), SHA-256
`2617e300c37863d78ed5db4104e96e74f11be3aa88a13e268894d5628f753b5a`. Root
alone may run and monitor the selected attempt:

```sh
NODE_OPTIONS=--max-old-space-size=8192 /opt/homebrew/bin/node /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-001/dispatch.mjs
```

The fixed provider is `/Users/jim/.local/bin/claude` version 2.1.306,
`claude-opus-5-5`, effort `xhigh`, 60 turns, `$5` maximum per process and
1,800,000/2,100,000 ms inactivity/absolute limits. The existing
`CLAUDE_CODE_OAUTH_TOKEN` environment **name** is inherited; its value is not
recorded. Actual resolved model and cost remain observations until returned.
Root monitors the existing `$100` allocation, `$90` aggregate stop,
`$35.6671188` historical reported native usage, `$15` initial A target and
stops for triage at `$10` known incremental usage, retaining `$5` reserve.
Unknown proxy and host charges remain unknown. The per-process flag is not a
hard aggregate cap.

Actual native progress is retained under
`../setup-001/resources/archives/fp-*-stdout.log` and `fp-*-stderr.log`, with
ABG events in `../setup-001/resources/events/runtime.events.jsonl`. The
attempt's `STARTED.json` records the Root process PID; Public command, result,
post-run state and readbacks are written in this attempt only when actually
produced. Raw streams can contain work content; inspect them under the normal
local custody boundary. The following manual projection writes
`budget-latest.json` without printing source or token values:

```sh
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-001/monitor-budget.py --write
```

Its SHA-256 is `8ee36b8428cadc405036b50f9548ad506997173cbae934f2783e84d650f78203`.
It sums only unambiguous terminal `total_cost_usd` reports and labels running,
missing and duplicate-result streams unknown; it does not enforce a stop or
establish billed cost. Its focused synthetic test covers unknown, ambiguous and
$10 stop cases. No dispatch, provider call, or actual RC3 output is asserted by
this return.
