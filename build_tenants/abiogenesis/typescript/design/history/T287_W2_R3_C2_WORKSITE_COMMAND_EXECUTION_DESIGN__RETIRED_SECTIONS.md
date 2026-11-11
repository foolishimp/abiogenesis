Cut from `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` at commit `39d6cb975`, lines 978-1037, verbatim.


## 10. Retained Failure And Superseded Five-Path I/E Plan

The fifth retained live failure is diagnostic evidence for this amendment.
The odd_glc basic-cli run
`repo://odd-glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/`
used historical qualified ABI artifact SHA-256
`e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449`.
The Worker preserved the exact `--task` path but moved both `--artifact` and
`--sandbox` one directory above the planned attempt. The permissive helper
accepted those caller paths, executed both declared commands, and wrote the
caller-selected result and sandbox before Product completion returned
`transport_identity_mismatch` and ABG admitted `run_stopped` for
`run://abiogenesis/3ee1b3b114f8f6a5a7bb287fc7d26df69744c3afa71f089dce357251231d77b5`.
This run is retained failure evidence only. The artifact is historical C3
qualification evidence and is not an accepted artifact for this amended C2
design.

The previously accepted two-manifest design bounded a later I/E to exactly five
paths:

1. `code/src/product/worksite_command_execution.ts` for the unchanged public
   12-key helper-plan shape, exact bare-task-manifest identity, structurally
   derived one-argument `launch.json` command/input identity, current-only
   construction/admission/`exactExchange` validation, and prompt projection
   while retaining owner-private artifact and sandbox coordinates;
2. `code/src/implementation/worksite_command_execution.ts` to independently
   derive, publish, and reobserve exact canonical `task.json` first and private
   `launch.json` last before Worker entry, retain only private launch-envelope
   coordinates, and revalidate both manifests plus final result single-link
   currentness at completion;
3. `code/src/implementation/worksite_command_helper.ts` for exact argv, both
   manifest identities/bytes and canonical-locus validation, independent
   literal-sibling derivation, mandatory pre-effect result/sandbox absence, and
   non-swallowed create-only result cleanup plus final single-link validation;
4. `test_env/tests/t287-worksite-command-execution.test.mjs` for the direct
   installed-helper falsifiers, exact occurrence/attempt recomputation, the
   rehashed prior-plan current-admission refusal, and retained public
   C1/C3-to-C2 closure/replay;
   and
5. `test_env/tests/t287-worksite-branch-construction.test.mjs` only to remove
   its stale informational artifact-path prompt expectation and preserve its
   complete accepted public C3-to-C2 regression.

That five-path plan is retained historical HOW, not a current selection. The
worksite-root reframe crosses the shared C0/C1/C2 authority carriers and exact-
prefix admission seams, so no implementation territory may be inferred from
the old list. Independent acceptance must return these exact design bytes to an
Executive for a new proportional I/E selection. The private launch envelope
still changes no Product task/result/observation contract. The frozen five-path
source/evidence subject produced under the prior accepted amendment remains
unaccepted realization evidence only; it grants no implementation or artifact
acceptance for this reframed design.
No C3 semantic, requirement, Public, transport, package-export, or
product-toolchain manifest source changes are authorized.
`abg/worker_transport.ts`, `abg/transport_contracts.ts`,
`implementation/index.ts`, and `test_env/tests/m5-worker-transport.test.mjs`
remain predecessor regression inputs, not mutation authority. All I/E and
falsifiers above remain unselected until independent design review returns to
the Executive and the Executive selects a new exact realization subject.
