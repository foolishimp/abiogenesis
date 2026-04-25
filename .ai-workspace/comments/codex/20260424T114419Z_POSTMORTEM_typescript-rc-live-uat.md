# Postmortem: TypeScript RC Live UAT Run

**Run**: `2026-04-24T115931327Z`
**Tenant**: `build_tenants/abiogenesis/typescript`
**Command**: `CODEX_LIVE_FP=1 npm run test:live`
**Archive**:
`build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-24T115931327Z`
**Ticket**: `T-033`
**Verdict**: RC live gate passed for the defined `requirements_to_uat` live
sandbox UAT lane.

## 1. Executive Finding

The run proves that the TypeScript tenant can:

- build the semantic package surface
- materialize a packaged tenant into an isolated sandbox root
- derive a governed F_P dispatch request from a TypeScript graph-function edge
- invoke a real configured Codex backend through the TypeScript transport
  contract
- receive a real worker response
- admit that response as a result artifact
- assess the result through the TypeScript result-assessment boundary
- project final live status from admitted result truth
- capture the forensic evidence needed for review under the existing
  Python-sandbox-derived archive/postmortem convention

The run does not prove that Codex authored a rich UAT suite. The worker was
contracted to return a specific result-artifact JSON object satisfying the
`requirements_to_uat` fulfillment boundary. This is the right first RC live gate
for transport/result/projection proof, but it is not a broad content-quality UAT
benchmark.

## 2. Evidence Inventory

Archive files present:

- `run.json`
- `dispatch_projection.json`
- `dispatch_request.json`
- `prompt.txt`
- `readiness.json`
- `readiness-output.txt`
- `transport.json`
- `dispatch-output.txt`
- `raw_response.txt`
- `result_artifact.json`
- `assessment_projection.json`
- `dispatch-script.json`
- `assessment-script.json`

Total archived evidence size: `31,352` bytes.

Archive authority note:

- the durable archive framework originates in the Python sandbox
  `run_archive.py` and `test_run_archive.py` line
- TypeScript archive-finalization parity is owned by `T-030`
- this `T-033` run uses that lineage for durable RC live evidence capture; it
  does not create a separate archive framework

The run metadata records:

- package root:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-cdxj7A/node_modules/@abiogenesis/typescript-tenant`
- package tarball:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-cdxj7A/.abiogenesis/package-pack/pack-mrhZDB/abiogenesis-typescript-tenant-0.0.0-test.tgz`
- backend: `backend://codex`
- worker: `worker://rc-live-codex`
- command: `npm run test:live`

## 3. Runtime Path

The live lane executed this path:

1. `npm run build:semantic`
2. sandbox root provision
3. TypeScript package materialization from `npm pack`
4. installed package import from sandbox `node_modules`
5. graph-function construction for `requirements_to_uat`
6. public start over `requirements_to_uat`
7. F_P dispatch request derivation
8. Codex readiness probe
9. Codex dispatch invocation
10. result artifact normalization/admission
11. result assessment
12. live-status projection
13. durable RC live evidence capture

The dispatch request carried:

- target handle: `requirements_to_uat`
- expected edge: `requirements→uat_tests`
- expected assessment id: `uat_tests_complete`
- dispatch ref: `dispatch://codex`
- backend id: `backend://codex`
- worker id: `worker://rc-live-codex`

The archived graph-function carrier included:

- input node: `Requirements`
- output node: `UAT Tests`
- input authority: `REQ-P-SCENARIOS`
- output authority: `REQ-P-QUAL`
- evaluator: `uat_tests_complete`
- regime: `F_P`

## 4. Live Backend Evidence

Readiness passed:

- command: `codex exec --full-auto --skip-git-repo-check`
- status: `0`
- output token: `ABG_TS_READY`
- model reported by Codex: `gpt-5.5`
- workdir: installed sandbox temp root
- tokens used: `7,953`

Dispatch passed:

- command: `codex exec --full-auto --skip-git-repo-check`
- status: `0`
- output file: `dispatch-output.txt`
- raw response file: `raw_response.txt`
- response was valid JSON
- tokens used: `8,314`

The worker returned:

- edge: `requirements→uat_tests`
- actor: `codex`
- fulfillment id: `uat_tests_complete`
- fulfillment status: `fulfilled`
- selected worker: `worker://rc-live-codex`
- selected backend: `backend://codex`

## 5. Execution Timing

The test runner reported:

- live test body duration: `59,288.371083 ms`
- total node test duration: `59,339.164666 ms`

The archive timestamps are second-granularity but consistent with that timing:

- run started / dispatch request written: `21:59:31 +1000`
- readiness output written: `21:59:38 +1000`
- readiness record and prompt written: `21:59:39 +1000`
- dispatch output written: `22:00:29 +1000`
- transport, raw response, result artifact, and assessment projection written:
  `22:00:30 +1000`

Interpretation:

- approximately 7-8 seconds went to the readiness Codex invocation
- approximately 50-51 seconds went to the dispatch Codex invocation
- approximately 1 second went to package/sandbox setup, assessment, and
  archive writes after dispatch completion

This is fast for a live workflow because the worker task was intentionally
small. It was asked to satisfy a strict result-artifact contract, not to inspect
requirements and author a substantive UAT suite. The run therefore proves live
transport and result admission, not live SDLC work depth.

## 6. Assessment And Projection

The result artifact was admitted without identity issues:

- `identityIssues`: empty
- `transportFailure`: null

The result-assessment boundary accepted the artifact:

- assessment outcome: `accepted`
- assessed count: `1`
- emitted event kind: `assessed`

The live-status projection derived final state from admitted runtime/result
truth:

- projection kind: `ready`
- run status: `assessed`
- active edge: `requirements→uat_tests`
- result assessment status: `accepted`
- published ledger ref:
  `ledger://typescript-rc-live-requirements-to-uat`

## 7. Event Sequence

The asserted event sequence for the RC live lane was:

- expected: `["basis_admitted", "fp_dispatch_requested", "assessed"]`
- actual: `["basis_admitted", "fp_dispatch_requested", "assessed"]`

This came from `test_env/live/test_m05_rc_live_uat.test.mjs`, which now
persists and asserts both halves of the live chain:

- `dispatch_projection.json` recorded:
  `["basis_admitted", "fp_dispatch_requested"]`
- `assessment_projection.json` recorded:
  `["assessed"]`

The projection also carried the source trace:

- `start_request`
- `start_outcome:blocked`
- `result_assessment_request`
- `result_assessment_outcome:accepted`

Consequence: this RC live run now proves the full event sequence for the
defined live edge, not only the assessment tail.

## 8. What This Proves

This run proves the `T-033` RC live qualification claim:

- the TypeScript tenant has an explicit RC live command
- the command does not treat deterministic installed tests as live proof
- the live lane uses packaged TypeScript tenant materialization
- the live lane invokes a real external F_P worker
- the live response crosses the TypeScript transport/result boundary
- final status is projected from admitted result truth
- forensic artifacts are durable enough for post-run inspection

This also proves that the TypeScript port is no longer relying on Python for
the RC live execution gate. Python remains the lineage source for the archive
framework obligation, but this run was executed through the TypeScript
installed package surface.

## 9. What This Does Not Prove

This run does not prove:

- full live coverage for all five Python live scenario families
- live authoring quality of generated UAT test suites
- long-horizon agent traversal, because the dispatch prompt was a narrow
  structured artifact contract
- live behavior under malformed or adversarial worker output in this same run
- full live event coverage beyond the single
  `basis_admitted -> fp_dispatch_requested -> assessed` edge chain
- release artifact immutability, because the workspace changes are not yet
  committed/tagged
- network/provider stability beyond this one successful invocation

Those are separate release-hardening or portfolio-live gates, not failures of
this `T-033` gate.

## 10. Prior Failed Attempt

Before the passing run, the same command failed to reach live readiness inside
the default sandboxed tool environment:

- diagnostic archive:
  `2026-04-24T114318844Z`
- failure reason: Codex could not access
  `/Users/jim/.codex/sessions`
- classification: environment readiness failure, not TypeScript product
  failure

The passing run required executing the live command with access to the user's
Codex session files. That is a live-run environment precondition.

## 11. Residual Risk

The strongest residual risk is overclaiming. This run proves the live
transport/result/projection gate for one requirements-sourced edge. It should
not be described as proof that the product can complete every SDLC workflow
live.

The second residual risk is release discipline. The evidence is valid for the
current workspace state, but the repo has uncommitted changes. A release
candidate should be cut only after the current state is committed and, ideally,
the semantic and live commands are rerun against that commit/tag.

The third residual risk is content-depth. The current worker task is a strict
artifact contract. A later UAT-quality gate should ask the worker to produce a
real UAT artifact from real requirements and then assess that artifact against
`REQ-P-SCENARIOS` and `REQ-P-QUAL`.

## 12. Closure Judgment

`T-033` is closed correctly.

The TypeScript tenant is RC-qualified for the defined first live UAT gate:
packaged installed tenant, real Codex transport, admitted result artifact,
accepted assessment, ready/assessed projection, and durable evidence capture
under the Python-sandbox-derived archive convention.

The next lawful release step is not more proof for `T-033`; it is release-cut
discipline over the now-green workspace state.
