# Closed: exact prepare-only diagnostic seam unavailable

No caller was created or executed. The selected existing-export restriction prevents reproducing the actual pre-admission object lifetimes faithfully; a substitute would obscure the allocation question.

The exact input is GLC `20260928_DECLARATION_RESOURCE/pc05-11/start.jsonl`, **not** `execution/start.jsonl`: 44,650,516 bytes, SHA-256 `d3fe41dc4e258bc45ac6bab338f0c4dd2572919b587dfaf39450b36654a7d363` (closed prior measurement). Selected core52 artifact is `df47a7a2c9d7f25cb2b1c22e7097e027c68ec25d05179b5c6d8f15dbe0319944`. Future genuine handoff input is Root's `pc05-11/recovery-result.json`; it has not been acquired or consumed here.

**Missing relation.** In the installed transport, `detachDefinitionCall` is private (`public/installed_definition_call_transport.js:129`). This input has none of its special owned-verifier fields, so ordinary structured cloning could approximate that stage, but it would not call the actual helper. The decisive gap is `bindStaticOwner`: it invokes fixed-call admission, then `v.safeParse(resourceAssertionSchema, call.resources)` and retains `admittedResources.output` inside the frozen owner call (`shared/static_definition_bindings.js:68`). The Run resource schema is private (`owner_bindings/run_invocation.js:868`). Exported `isRunInvocationResourceAssertion` returns only a boolean and discards this parsed output. Reusing the original resources after that boolean check omits the actual parsed graph and changes the current/historical declaration lifetimes under investigation. Serialized transport also performs fixed-call admission before the bound callable repeats it; one admission would omit real work.

The acquisition, exact-prefix artifact truth, admitted-install/workspace projections and `ProductRunInvocationPort.prepare` are existing exported owners. However, the exported complete Run callable proceeds from preparation through `admitExactInvocation` (`owner_bindings/run_invocation.js:1011`); it has no stop hook. Its private preparation sequence cannot be invoked through an exported prepare-only closure. No cloned schema, reconstructed admission, patched installed module or new API was introduced to bypass this gap.

**Smallest causal alternative for Executive selection:** profile the unchanged actual installed CLI with standard incremental V8 CPU ticks and GC output, preserving its ordinary caller/environment and default heap. The already-known entry is:

```sh
node --prof --logfile=/ABS/SELECTED-EVIDENCE/v8.log --trace-gc-nvp   /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-11/products/core52/node_modules/@abiogenesis/typescript-tenant/build/code/src/public/cli.js   --jsonl /ABS/GENUINE-HANDOFF-BOUND-START.jsonl   > /ABS/SELECTED-EVIDENCE/graphExecution.stdout   2> /ABS/SELECTED-EVIDENCE/graphExecution.stderr
```

This is a proposed command template, not a prepared or authorized execution. Root must first complete existing-owner recovery and bind the actual input to its genuine handoff without changing declaration/runtime inputs or their required identities. V8 may prefix the log filename with its isolate identifier. The ordinary CLI has **no prepare-only stop** and can proceed into admitted execution/provider work; it must be selected with that effect scope and existing finite transport bounds. Ticks can identify allocating/canonical/hash stacks and GC timing even if the process aborts, but do not provide exact named-phase memory snapshots or heap retaining paths. No OOM cause or cure is established by this static finding.

Static source checks only; no syntax check applies because no script was authored. No journal read, acquisition, recovery, invocation, provider, test, build, production edit, heap override or Git action occurred. Close for Executive selection.

Installed emissions inspected (SHA-256):
- `public/installed_definition_call_transport.js`: `53e5a134be93be8b662595b07a228aeac1ff5e53fb25a231498d76686a336ba5`
- `shared/static_definition_bindings.js`: `90ca00b547b8e25dd92f723abfcfb2edc1d720e1040547c3426deaa212aae5bc`
- `owner_bindings/run_invocation.js`: `aa598f639bd0decfe93e1957b111de225d3d1c4ac8c2d3a9e520d47358340eec`
