# Current matched measurement handoff

Use control family **002** for the pending RC8-after binding. Root accepted the RC7-before pair in `EXECUTION_RETURN_002.json`; RC8-after is unbound and unexecuted. The successful fixture uses direct target `{kind: "next"}`. Root's wrong predecessor selection and its failed baseline remain preserved in the historical files; they are not the current entrypoint.

| Current file | Bytes | SHA-256 |
|---|---:|---|
| [run-measurement-002.mjs](run-measurement-002.mjs) | 7192 | `d8aacc1ee82a3c8914171e19a4ae8fdab5a922ef65dc35328106105c8695aa03` |
| [measurement-002.test.mjs](measurement-002.test.mjs) | 23072 | `4e1f72c4df690c242fc4775dd74ec5157e18e4851f8ad210dfd98a597124f9b7` |
| [PREPARATION_MANIFEST_002.json](PREPARATION_MANIFEST_002.json) | 4548 | `cc942f112405aa577c0e87896fdce2feaab84422b817925b69a4daa0821ea279` |
| [RC7_BEFORE_002.bindings.json](RC7_BEFORE_002.bindings.json) | 4862 | `5d1176b2e91655eba2fcafb3414e6f4f079c1600aa83bf7b01b99d295c3c4e18` |
| [ROOT_ADMISSION_002.json](ROOT_ADMISSION_002.json) | 4151 | `698a2506a448996c915c4e1798d8c59a8856334c9446106bdf598616d3aa30df` |
| [EXECUTION_RETURN_002.json](EXECUTION_RETURN_002.json) | 17344 | `489886e9485fc40013f2810866e6a5ebe4bc0d172036edc1b3bf757ecfd55aae` |
| [RC8_AFTER.bindings.template.json](RC8_AFTER.bindings.template.json) | 2964 | `a888cb81f6f4775c6fb5e19ab13a6bfa600813f9f692887cad2c98e4b4f2200e` |
| [OWNER_REFERENCES.json](OWNER_REFERENCES.json) | 2465 | `f3099fbc32b8d6b83c6dcd909ca31f2d230d623af80dc15985843762a7c24e0f` |

Create a new exact after bindings file from `RC8_AFTER.bindings.template.json`, supplying the selected RC8 source/archive/install/receipt pins and any admitted owner counter sources. Keep the successful family 002 wrapper and fixture unchanged. Root's exact after admission must bind that new config and `PREPARATION_MANIFEST_002.json`.

Pending command, only after Root admits the exact after binding:

```sh
/opt/homebrew/bin/node run-measurement-002.mjs RC8_AFTER.bindings.json <after-config-sha256> ROOT_AFTER_ADMISSION.json <after-admission-sha256>
```

The 1 MiB and 4 MiB after cases remain unprofiled for the matched before/after comparison. The third, separately labeled `4MiB-profile` call uses a fresh request/invocation in the same held session and completes before actual close. Its timing/counters remain outside the matched pair. Preserve full outcomes, scoped warm/cold parity, raw failures, actual close and all budget limits. No speedup, clone-allocation or release qualification claim is established by the before result.
