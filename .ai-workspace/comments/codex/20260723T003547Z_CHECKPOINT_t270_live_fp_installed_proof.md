# T-270 Live F_P Installed Proof Checkpoint

## Subject

- branch: `codex/t286-abi5-root`
- implementation commit: `8970130652f914b0603914d8720ed1d54dff970f`
- accepted design: `d6da426947e1b7e18e7ed5bd1c0f945dcde9c73f`
- ticket owner: `T-270`
- scenario: `ABG5-S02`, still open

## Installed Outcome

The exact packed candidate executes one genuinely live F_P leaf through:

```text
product.verify -> product.install -> workspace.bind
-> catalog.admit -> catalog.view -> run.invoke
-> direct GTL -> HoG -> ABG actor/process boundary
-> evidence admission -> result admission -> judgment
-> terminal closure -> replay -> CLI outcome
```

The operator supplied `/Users/jim/.local/bin/claude` as the exact transport
command. The admitted stream identifies `claude-fable-5`. It returned the exact
declared `fp_hello_output`, and ABG admitted `41` events ending in `run_closed`.
The replay result and public outcome agree.

## Defect Found And Repaired

The first live run was lawfully blocked at evidence admission. Claude Code
realizes `--json-schema` through an internal `StructuredOutput` tool event. The
transport parser counted that protocol event as a capability tool, causing a
closed-prompt contract failure even though the model called no external tool.

The repair excludes exactly `StructuredOutput` from capability-tool counts only
when a response schema is present. Focused negatives prove:

- `Write` remains a closed-prompt contract failure;
- `StructuredOutput` without a declared response schema remains a contract
  failure; and
- declared `StructuredOutput` carries no capability-tool count, after which
  ordinary output, evidence, and judgment admission still decide success.

This is a transport classification correction, not a new runtime path or a
relaxation of result admission.

## Exact Evidence

- live proof:
  `build_tenants/abiogenesis/typescript/test_env/proof/abi5-m5-live-fp.json`
- package artifact SHA-256:
  `3cb1385602532965c0a6f8f88006c0eb98cdff41f11c3594364b1e346c87bad4`
- Product content digest:
  `sha256:870f547a926acf6fb42d16cc93f3bcf034a1325d1d4cc2ccab0be1c2324698f3`
- Product manifest digest:
  `sha256:4a8ef6b2979e8b20a0176066b78d1509cae974d9ab8cf251faf851b50da04c6b`
- live event-log digest:
  `sha256:2482d604a4928437ca0eb9002423ae10fd4413005e9ad7bcaf1d2cd4303bc37d`
- live public-outcome digest:
  `sha256:9e96999c08304653a24ca5c5dcccb4e94ba8f2d0079e2e488bad0b7147208154`
- live replay digest:
  `sha256:54d5bc59da5d14c08102d9ae741798f54c47e9c05e81a5806a25d04faa3ae804`

## Verification

- `npm run test:m5:live-fp`: `1/1`
- `npm run test:m5`: `37/37`
- `npm run test:m4`: `26/26`
- `git diff --check`: green before commit

No parser for GTL, lowering stage, compiled carrier, public traversal
controller, or second event path was introduced.

## Residual Frontier

The live F_P obligation is proven. `ABG5-S02` remains open because the Product's
forty-row conservation inventory still has uncovered graph-application and
later F_H/control rows. The next T-270 code boundary is the declared runtime
graph relations, starting with recursion and its exact child/foldback lineage,
then fan-out/fan-in and gate behavior with their mutation refusals. T-272 still
owns durable F_H response and continuation.
