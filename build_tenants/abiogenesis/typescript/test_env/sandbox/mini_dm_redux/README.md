# Mini Data-Mapper Redux Sandbox (T-101)

A dramatically reduced-scope reproduction of the `data_mapper` experiment as a
live ABG sandbox. Three edges, deep F_P semantic evaluation per obligation,
operator-runnable per edge with replayable ledger and event evidence.

## What this is for

Drive the chain interactively and watch the per-edge ledger evolve. Run one
edge, inspect the assessments, run the next. The F_P semantic evaluator does
real work — at edge 3 it actually executes the implementation produced at
edge 2 against canonical cases, so the chain is ungameable by lexical match.

## The three edges

```
raw_problem  --[derive_field_spec]-->  field_spec
field_spec   --[derive_implementation]-->  implementation (transform.ts)
implementation --[derive_validation]-->  validation_results.json
```

| Edge | Output | Obligations | F_P semantic depth |
| --- | --- | --- | --- |
| `derive_field_spec` | `design/field_spec.md` | `REQ-FIELD-DISPLAY-NAME`, `REQ-FIELD-EMAIL-DOMAIN`, `REQ-FIELD-AGE` | structural section parsing per obligation; rejects placeholder bodies |
| `derive_implementation` | `code/transform.ts` | the 3 field obligations + `REQ-IMPL-COMPILES` | AST-style structural pattern recognition per field; real `tsc --noEmit` for `REQ-IMPL-COMPILES` |
| `derive_validation` | `validation/results.json` | the 3 field obligations | EMPIRICAL — loads the prior `transform.ts`, transpiles it, imports `mapRecord`, executes it against canonical cases, compares per-field outputs |

## F_P / F_D split

| Concern | Owner | Where it lives |
| --- | --- | --- |
| Did `A.req_i -> B.result_i` for each i? | F_P semantic evaluator | `fp_evaluator.mjs` |
| Worker construction (live or fixture) | F_P worker | `fp_worker.mjs` |
| File exists, declared schema parses, digest matches, manifest envelope intact | F_D mechanical envelope | `fd_envelope.mjs` |

The F_P evaluator is a *separate* function from the worker. The worker writes
the artifact; the evaluator reads it from disk and judges fulfillment per
obligation. This keeps the architectural boundary clean and avoids the
B-003/B-013/B-014/B-016/B-017 bug class where an F_D check sneaks in to
replace an F_P semantic check.

## Running per edge

The harness is `run.mjs`. Each invocation advances exactly one edge (or
`--full` runs all three).

```bash
cd build_tenants/abiogenesis/typescript

# Build first so the sandbox can import build/semantic/...
npm run build:semantic

# Pick a workspace dir for this run
WORKSPACE=/tmp/t101_mini_dm_redux_$(date +%s)

# Edge 1
node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_field_spec --workspace "$WORKSPACE"

# Inspect what edge 1 wrote
cat "$WORKSPACE/.ai-workspace/runtime/zoom_foldback/derive_field_spec/ledger.json"
cat "$WORKSPACE/.ai-workspace/runtime/zoom_foldback/derive_field_spec/foldback.json"
cat "$WORKSPACE/.ai-workspace/runtime/zoom_foldback/derive_field_spec/assessments.jsonl"
cat "$WORKSPACE/.ai-workspace/runtime/events/events.jsonl"
cat "$WORKSPACE/code/transform.ts" 2>/dev/null  # not yet — edge 2 produces this

# Edge 2 (depends on edge 1's output as input)
node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_implementation --workspace "$WORKSPACE"

# Inspect the produced TS implementation
cat "$WORKSPACE/code/transform.ts"
cat "$WORKSPACE/.ai-workspace/runtime/zoom_foldback/derive_implementation/foldback.json"

# Edge 3 (executes the implementation)
node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_validation --workspace "$WORKSPACE"

# Inspect the validation results and the evaluator's execution traces
cat "$WORKSPACE/validation/results.json"
cat "$WORKSPACE/.ai-workspace/runtime/zoom_foldback/derive_validation/fp_evaluation.json"

# Or run all three in one shot
node test_env/sandbox/mini_dm_redux/run.mjs --full --workspace "$WORKSPACE"

# Gaps surface
node test_env/sandbox/mini_dm_redux/run.mjs --gaps --workspace "$WORKSPACE"
```

## Live mode (Codex CLI by default)

By default the F_P worker emits a deterministic fixture. To dispatch each
edge's prompt to a live agent CLI worker:

```bash
CODEX_LIVE_FP=1 node test_env/sandbox/mini_dm_redux/run.mjs --full --workspace "$WORKSPACE"
```

The default live agent is `codex`, and the shared transport contract pins it to
`gpt-5.3-codex`.

To run an explicit alternate live lane for comparison:

```bash
ABG_TS_LIVE_AGENT=claude CODEX_LIVE_FP=1 node test_env/sandbox/mini_dm_redux/run.mjs --full --workspace "$WORKSPACE"
```

Per-edge prompts and transport responses land under
`<workspace>/invocation_logs/edge_<N>_<edge_name>.*`.

## Where the evidence lands

```
<workspace>/
├── input/raw_problem.md                 # seed problem statement
├── design/field_spec.md                 # edge 1 artifact (T-082-allocated)
├── code/transform.ts                    # edge 2 artifact
├── validation/results.json              # edge 3 artifact
├── invocation_logs/                     # per-edge worker prompts/outputs and tsc logs
├── state.json                           # per-edge run summary (resume state)
├── manifest.json                        # top-level run manifest
├── gaps.md                              # written by --gaps
└── .ai-workspace/runtime/
    ├── events/events.jsonl              # appended every edge
    ├── allocations/<edge>.json          # T-082 OutputInstanceAllocation
    └── zoom_foldback/<edge>/
        ├── ledger.json                  # T-100 ObligationLedgerAsset
        ├── schedule.json                # ObligationScheduleAsset
        ├── frame.json                   # ZoomFrame
        ├── foldback.json                # ZoomFoldbackEvaluation
        ├── outer.json                   # OuterTraversalEvaluation (closureAllowed)
        ├── manifest.json                # OutputPluginHandoffManifest
        ├── fd_envelope.json             # F_D check rollup
        ├── fp_evaluation.json           # F_P evaluator per-obligation result
        └── assessments.jsonl            # admitted ScheduledSliceAssessments
```

## On the broken five-rule algebra

The five-rule algebra in `workspace_zoom_foldback.ts` has a known bug
(closure gate b open). The harness does not work around it. If foldback
reports a decision that disagrees with what the assessments imply, the
harness records that discrepancy verbatim — both `foldback.json` and
`outer.json` are written so the operator can compare the inputs to what
the algebra returned. Don't trust `outer.closureAllowed` blindly; cross-check
against the per-obligation assessments under `assessments.jsonl`.

## Walkthrough — what fixture mode produces

- **Edge 1** writes a markdown spec with three obligation sections; the F_P
  evaluator confirms each section names the right source fields, has a
  substantive (>=40 char) transformation paragraph, and an explicit edge
  case. All three obligations report `fulfilled` with `findingClass = fulfilled`.
- **Edge 2** writes a TypeScript module exporting `mapRecord(record): output`.
  The F_P evaluator runs three structural checks (concatenation of `first_name`
  and `last_name`; an `@`-split or regex against `email`; a year-minus-`birth_year`
  subtraction) and one real `tsc --noEmit` invocation for `REQ-IMPL-COMPILES`.
  All four obligations report `fulfilled`.
- **Edge 3** writes a JSON envelope of test cases. The F_P evaluator ignores
  the worker's self-report and instead transpiles the prior `transform.ts`,
  imports `mapRecord`, and executes it against three canonical cases
  (`happy_path`, `trim_whitespace`, `missing_email_domain`). Per-field
  comparisons drive the per-obligation assessment. With the fixture
  implementation, all three obligations report `fulfilled`.

If you swap in a broken implementation at edge 2 (e.g. concatenate without
the space, or skip the `@` split), the structural F_P checks at edge 2 catch
the missing space less reliably than the empirical execution at edge 3 — which
is exactly the point. Edge 3 is ungameable.
