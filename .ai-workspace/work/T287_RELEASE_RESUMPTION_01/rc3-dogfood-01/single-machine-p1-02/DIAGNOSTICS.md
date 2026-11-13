# Exact historical first-C2 diagnostics

Source: helper /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/result.json, SHA256 078bb40d9c59b8f20e31bb59d93c6fc2f8ab8386a941d3e7511ba11aef73e1e6; actual admitted Testing Result result://abiogenesis/83036136644178d564bedff0c0e5a67c2e6286b624a3bb961632326bdc79f892, event event://abiogenesis/6519245d63348e96f840a6cd550f25ada3f79e5c35e7c4b656316145f77d6793/ordinal7391. These tested FIRST21 partial source; second20 source has no later C2. Missing prerequisite cases remain unproved after repair.

Build stderr, complete 1069B, SHA256 c00b32e75c2cbc4a933c73f3b84217f321a0c662eff5be6f7a42dee37548d941:

```text
file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/scripts/generate-product-manifest.mjs:102
    throw new Error("C2 declared context member differs from its packaged Product source: " + member.path);
          ^

Error: C2 declared context member differs from its packaged Product source: build/code/src/product/worksite_command_execution.js
    at file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/scripts/generate-product-manifest.mjs:102:11

Node.js v24.7.0
```

Focused stdout byte range [52652,55402) of 81570B/SHA256 a26cd9d5db6f8ab0df562beaf3edd076e616c908affa17d664cb2bb2d67a87a9 (the complete declared FOCUSED_C2_STDOUT.txt is available):

```text
NOENT',
    syscall: 'open',
    path: '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/test_env/fixtures/abi5-root-candidate-basis.json'
  }

test at test_env/tests/t287-event-body-encoding.test.mjs:561:1
✖ native context bodies are born inline once, referenced by unchanged handoffs and refused unless exactly held (80.095ms)
  TypeError [Error]: runtime event-prefix selection requires one explicit immutable snapshot
      at selectValidatedRuntimeEventPrefix (file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/build/code/src/abg/event_prefix.js:373:19)
      at TestContext.<anonymous> (file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/test_env/tests/t287-event-body-encoding.test.mjs:603:49)
      at async Test.run (node:internal/test_runner/test:1113:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:788:7)

test at test_env/tests/t287-governed-context.test.mjs:699:1
✖ GC03 real owner allowed denied cold tamper (4047.610667ms)
  Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/test_env/fixtures/abi5-root-candidate-basis.json'
      at async open (node:internal/fs/promises:642:25)
      at async readFile (node:internal/fs/promises:1279:14)
      at async readCandidateBasis (file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6f
```

Exact owner fixture correction: validatedRuntimeEventPrefixBeforeEvent(actualPrefix, changed.event.eventId) uses a STRING event ID and an owned immutable earlier cut; retain the pending/tamper/foreign/currentness refusals. No mutable slice or implicit-tail fallback.

GTL gtl/worksite_command_execution.ts36–39/60–61 owns full emitted ProductJS digest/length AND span/inventory/context/policy identity. Only if the CURRENT emitted member mismatches, reconcile actual output; preserve generator95–108; no generator edit or bypass. Second author restored Product worksite_command_execution to its preimage and moved input carriage into native_work_reacquisition; review the current complete relation rather than mechanically reapply the old patch. Whole original P1 remains required.
