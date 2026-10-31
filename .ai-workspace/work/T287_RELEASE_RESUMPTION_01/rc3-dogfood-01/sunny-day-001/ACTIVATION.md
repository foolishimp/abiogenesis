# Sunny-day basic-cli: prepared operator configuration

The owner removed the previous spending limit and authorized approximately seven hours of overnight continuation from 17:30 UTC on 2026-10-31. Root interprets this as authority to pursue the selected sunny-day and recovery work, with Root as sole ABG Public/runtime operator. This record prepares that work; no Public operation, model call, release or qualification has occurred in its preparation.

The selected unqualified RC3 development artifact is the actual B06 C2 snapshot artifact with SHA-256 `9b6440795b600ce822b54ec35c468d35af6fdd07a251f5c0bdb6c1d3ccfc253d`, size 10,936,399, Product content digest `sha256:434a317b1bd4c4c348ca74a9685d10609b6d3b3de45252544da4c245d9fcd08b` and manifest digest `sha256:fbb50339c5cc59e4a6225323feb1ac1f555cbc2d94f65a7c94b4bc5728fd9c65`. Its admitted C2 producer and retained helper are bound in `INPUT_CUSTODY.json`. Historical B06 blocked standing and all GC03/release obligations remain unchanged.

The exact original `basic-cli` scenario manifest and five selected pinned assets are copied under `fixtures/` with byte identities in `INPUT_CUSTODY.json`. The existing external `test_env/uat/consumer.mjs`, public setup, runner, scenario loader and wrapper are used; no controller, Product code or runner is introduced. The existing independent oracle and the full original request and obligations govern. Preparation and the actual run each use new separate sandbox archives; a prepare is not a Run or a UAT pass.

`config.json` SHA-256 `c3a3731ded920673d47112112cda1d495205141507f11eedd0fafb0cfddaa327` selects recursion bound 12. The existing owner begins at attempt 1 and checks the bound before each further child: at most 11 children can be selected in this Run. The bound is not a provider-call, cost or success guarantee. A minimal actual Construction → Testing → UAT sequence normally means three selector and three leaf F_P processes, including the paid Testing launcher; one necessary correction plus retest can add two selectors and two leaf calls. The owner may choose other declared paths, stop early or refuse; observe actual calls and any retries rather than assuming a fixed count. Do not inject a failure to produce a correction.

The existing runner config has one global provider profile, not per-role effort: Claude `claude-opus-5-5`, `--effort xhigh`, max 160 turns per process, 30-minute inactivity and 90-minute absolute actor threshold. An independent UAT must be a separate native role with its own actual result; the existing config cannot set that role alone to `max`. No per-call dollar cap is selected after the owner removed the spending limit. The outer command timeout is seven hours from launch; Root separately monitors the approximately 00:30 UTC 2026-11-01 overnight target from the owner's stated 17:30 start. Actor thresholds are configured supervision limits, not a demonstrated wall-clock containment guarantee. The retained prior ledger is $86.7544958 reported plus an $8 reserve for unknown B03 cost; other charges are unknown and the former $100 stop is superseded. Record all later calls, known charges and uncertainty.

From `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`, Root can first check the local selected bytes and version-only preflight:

```sh
python3 /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/sunny-day-001/verify-inputs.py
/opt/homebrew/bin/node scripts/sandbox-uat.mjs preflight --config /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/sunny-day-001/config.json --case basic-cli
```

The second command creates a local preflight archive and checks Node/npm/Claude versions but makes no ABG Public call and does not dispatch a provider. The existing runner's run command makes a fresh sandbox, carries out Public setup and may incur provider charges:

```sh
/opt/homebrew/bin/node scripts/sandbox-uat.mjs run --config /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/sunny-day-001/config.json --case basic-cli
```

Retain actual source and package identity, child choices, parent evaluations and prior Results, real assessment and independent useful-output oracle, terminal Result and fresh readbacks, elapsed time, interventions and cost. A real native test failure or refusal returns exact evidence for owner triage. Work-once, repeatability, correction, recovery and whole-Product qualification remain separate claims. After sunny-day completion, select and verify a nonterminal interruption and cold continuation using the existing log owner, not a new store or a reopened terminal Run.
