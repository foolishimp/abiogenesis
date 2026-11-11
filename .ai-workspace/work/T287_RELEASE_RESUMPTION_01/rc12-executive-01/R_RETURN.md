# RC12 package R Return — readable stops

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-witness-20261111`, branch
`claude/rc12-readback`, base `62fd17271`. Commits: `d1b579c48` (text), `1bd2658bf` (code and
test), then this Return. T = `build_tenants/abiogenesis/typescript`. Requirements: REQ-P-POLICY-065,
-066, -067, -068 (new section `## Stopped Run Readback`).

## What a stopped Run reads back now

`project.read run_status` carries one optional `projection.stop` (`abg_run_stop_reading`) when
the Run has a stop event. Values below are actual reads (new read owner over the B1 trace logs):

- Worker exit (B1 a): `runtime_failure_observed`, `failed`, `reasonRef diagnostic://…/native-work/transport_failure@5`,
  `stage route`; `origin {failure, failureClass transport_failure, native-work@5, result://…/862082df…, timeout
  {observed, null}}`, passing over the two lifted `child_traversal_failed` Results; `evaluation {admitted_result,
  governance_work_state result://…/7025f3a2…}`, value carries `unresolvedSupportRefs [support://default-library-witness/complete-source-outcome@5]`.
- Absolute ceiling (E2): same shape with `timeout {observed, absolute}`.
- Bound 2 (B1 q3): `run_stopped`, `blocked`, `reason://abiogenesis/recursion/bound-exhausted@5`, `stage null`; `origin
  {result, governance_work_state result://…/35e4d08e…, executive@5}`; `evaluation` is that Result with its value
  (`terminal false`, `unresolvedSupportRefs [complete-source-outcome]`), uninterpreted.
- Selection gap (B1 gap): `run_stopped`, `blocked`, `reason://abiogenesis/default-library/gap@5`; `origin {gap,
  registered_graph_choice result://…/4f7b5c7c…, executive-step@5, missingSupportRefs [complete-source-outcome], reason "Scripted ordered policy."}`.
- `statement` (exit): "The Run stopped as failed and did not complete. Reason: diagnostic://…/transport_failure@5
  at stage route. Originating failure: class transport_failure in result://… from graph-function://abiogenesis/worksite/native-work@5;
  timeout class none. Unresolved obligations are those recorded by the last admitted evaluation governance_work_state result://…."
- Unchanged: `run_result` refuses `not_found`; `run_replay` `failed`/`blocked` with `terminalResult
  null`; `run_gaps` empty; start owner value `runtime_failed`/`blocked`.

## Public contract delta (T4)

- `abg.operation.project.read#run_status` result: `run_status_projection` gains optional
  `stop: ABG_RUN_STOP_READING_SCHEMA` (strict: `kind, schemaVersion, stop{ref,digest}, eventKind
  run_stopped|runtime_failure_observed, disposition, reasonRef|null, stage|null, origin` variant
  `failure|gap|result|not_admitted`, `evaluation` variant `admitted_result|not_admitted`,
  `statement`). Absent for Runs without a stop event. No new operation, member key, event kind,
  failure class or stop-event change. Definition digest `8633abe7…cae00` → `53ab071c…24262`.
- Same operation, no schema change, digest moves with the edited owner modules: `run_result`
  `f151da56…`→`77aefc7d…`, `run_replay` `6c97714e…`→`d4eeb5b9…`, `run_gaps` `b084e5bf…`→`563b1b32…`,
  `run_evidence` `9be13999…`→`81dc4a18…`, `run_lawful_actions` `bff9469c…`→`2dda7ffa…`.
- Family `33b41c70…`→`c29c076a…`; catalog `4cbd2ded…`→`14c14d4f…`. The R10 note records the
  `run_status` change as explicit supersession (REQ-P-PUBLIC-CONTRACTS-004); the rest follow from it.

## Changes (line deltas)

| File | +/- |
|---|---|
| `specification/PRODUCT.md` (P1, SDK And CLI) | +5 −0 |
| `specification/requirements/product/REQ-P-POLICY.md` (P2: 065–068, Updated date) | +39 −1 |
| `T/design/T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md` (P3, `## 2026-11-11 readable stops`) | +42 −0 |
| `T/code/src/abg/project_read_ports.ts` (fold in `projectRunStatus`) | +184 −1 |
| `T/code/src/abg/project_read_operation_contracts.ts` (schema, run_status member) | +65 −0 |
| `T/code/src/abg/project_read_definition_bindings.ts` (`runStopFields`) | +8 −1 |
| `T/test_env/tests/t287-readable-stops.test.mjs` (new) | +197 |

## Trace obligations

| # | Obligation | Result |
|---|---|---|
| T1 | Consumers of `run_status_projection` | Code: only `statusProjection` in the binding (threads and validates `stop`); SDK `constructInstalledRunReadCall` builds calls only; CLI transports the one JSONL line unchanged; `capability_contracts.ts` lists keys only. Tests: E3 list below; `framework-handoff.compile.ts` compiles (optional member) |
| T2 | Generated contracts | `npm run build` regenerates 23 tracked files: 18 `T/contracts/public-operations/**/operation-contract.json` (family/row digests; `project/read` definitions), `contracts/schemas/operations/project/read/result.schema.json` (`$defs.run_status` only), `contracts/schemas/public-operation.schema.json`, `contracts/public-functions/adapter-projection.json`, `contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`. Left uncommitted per grant |
| T3 | Old instances | Pre-change logs (B1 ok/a/q3/gap) read by the post-change owner+binding vs pre-change installed CLI reads, canonical bytes: completed `run_status/run_result/run_gaps/run_replay` identical; failed and blocked identical except the added `stop`; `run_result`/`run_gaps`/`run_replay` identical |
| T4 | Public delta | Above |
| T5 | Test files | New `t287-readable-stops.test.mjs` 4/4 pass. No existing test edited |

## Evidence (in T, `TMPDIR=/private/tmp/abg-readback-tmp`)

- E1: `npm run build` exit 0 (33 s). `npm run lint:imports`: "29 modules under code/src/shared/
  import only code/src/shared/ and packages", "3 forbidden owner pair(s) hold" (same as base).
- E2: `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-readable-stops.test.mjs`
  → `ℹ tests 4 ℹ pass 4 ℹ fail 0` (240 s). Public start and every read are fresh installed CLI
  processes over the closed resource; R1–R3 fields checked against the admitted events, R6 on four reads, R7 in the CLI line.
- E3 (same command per file, base build `62fd17271` then after; pass/skip/fail, all equal base →
  after, no new failure or skip): `t287-cross-cut-public-read` 1/4/0, `t287-installed-product-coordinate`
  11/0/0, `t287-management-supervision` 5/0/0, `t287-st1-installed-cross-owner-hello` 3/0/0,
  `t287-st2a-g-capability-definition-graph` 4/0/0, `t287-wave2-owner-contract-source-set` 15/0/0,
  `w2-steel-serial-branch-installed` 0/2/0, `witness-run-stopped-definition-binding` 7/0/0,
  `t287-s03-automatic` 0/2/0, `t287-registered-graph-selection` 1/0/0, `t287-default-library-reviews`
  7/0/0, `t287-public-groups` 3/0/0, `t287-framework-handoff-types` 5/0/1 (pre-existing, below),
  `t287-recursive-registered-selection` 6/1/0, `t287-public-terminal-projection` 0/4/0,
  `t287-w2-05-generator-package-reproducibility` 2/0/0, `r10-projection-contracts` 1/10/0,
  `t287-exact-construction-intent` 1/0/0, `t287-generic-job-revision` 1/3/0,
  `t287-native-assembly-retained-input` 1/1/0, `t287-rp2-correction-carriers` 1/0/0. Skips are
  the files' environment gates (`ABI5_EVIDENCE_ROOT`, `ABI5_S02_PROJECTION_FIXTURE` unset; the
  r10 evidence is not in the worktree), so the r10 projection lanes were not exercised.
- T3 command: scratch `node t3.mjs` (outside the repo) over the B1 logs kept in TMPDIR.
- E4: T3 above: the completed B1 `ok` Run's four reads are canonically byte-equal before and
  after. `t287-st1-installed-cross-owner-hello` (closed Run `run_status` via owner, CLI and SDK)
  passes; `t287-management-supervision` (fresh Public reads of blocked and failed Runs) passes
  with the added member.

## Deviations

1. R3 premise: a registered-selection gap is judged `blocked` (reason `default-library/gap@5`), so
   the Run is `blocked`, not `gap_stopped`, and `run_gaps` stays empty. The reading reports the
   gap from the gap choice Result (`origin.kind gap`). HoG `gap_stop` Runs keep their `run_gaps`
   frontier; their reading should give `origin.kind result` (no-action projection); not exercised.
2. R7: the CLI keeps exactly one JSONL output line (test helpers require it); the plain words are
   the `statement` member of that line. For failure and bound stops the statement names the
   evaluation Result that records the obligations; it does not list them, because the evaluation
   value is Product-owned (`GovernanceWorkState`) and R2 forbids generic interpretation. The value
   itself carries `unresolvedSupportRefs`. Gap stops list the missing support references.
3. R8 is outside the write grant (stop, nothing written). Proposed sentence for
   `specification/requirements/gtl/REQ-L-GTL3-RECURSE.md` after REQ-L-GTL3-RECURSE-007, or
   `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` "Selected execution relation" (line 469,
   "finite recursion bound"): "A recursion bound of N counts parent evaluations: it admits N
   parent evaluations and at most N−1 child steps; a non-terminal Nth evaluation stops the Run as
   blocked with reason `recursion/bound-exhausted`." E2 bound 2 shows 2 evaluations, 1 step.

## Stops and pre-existing reds

- R8 territory stop (above). No R5 stop: an existing Public result value gained one optional member.
- `t287-framework-handoff-types` "per-slot owner schemas equal the exact014 baseline archive" fails
  at base and after (`ABI5_HC1_BASELINE_PACKAGE_PATH` unset); not repaired. With the archive it
  compares per-slot schemas, so the `run_status` result slot is expected to differ.

## Decisions for Executive

1. Commit or keep uncommitted the 23 regenerated contract files (T2) for this delta.
2. Accept the R3 reading and R7 `statement` form, or require itemized obligations (needs a Product-owned rendering).
3. Route the R8 sentence to its owner.

## Residual risks

- Operator `run_stopped` reads `disposition` = reason kind, `origin not_admitted`; not in E2.
- A failure not caused by one failed route, or several failed/blocked foldbacks under one C-call
  (fan-out), reads `origin not_admitted` by design.
- `evaluation` is the last success Result of the root GraphCall; in a non-recursive Program it need
  not be an evaluation. `statement` is a plain string inside the strict value, not a grammar.
