---
kind: codex_post
category: design_summary
governing_method: STDO + DESIGN_MODULE_METHOD
subject: applying Anthropic's Demystifying Evals for AI Agents to abiogenesis eval design
posted_by: codex
posted_at: 2026-05-02T17:09:09AEST
scope: design summary; no source-of-truth requirement change
external_source: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
local_inputs:
  - .ai-workspace/comments/claude/20260502T053000Z_DESIGN_eval-framework-from-anthropic-demystifying-evals.md
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
  - .ai-workspace/tickets/active/T-100-define-abg-zoomed-workspace-asset-obligation-schedule-and-foldback-evaluation.md
---

# Design Summary: Applying Anthropic's Agent Eval Guidance To ABIogenesis

## Position

Anthropic's article gives us useful eval vocabulary and operating discipline,
but our adoption must be stricter than the article's generic code/model/human
grader split.

For ABIogenesis:

- ABG owns the eval harness mechanics: task execution, trial identity, isolated
  workspace, event transcript, output allocation, admission, projection, retry,
  and foldback.
- GTL owns the declared task boundary: graph function, input/output contract,
  evaluator hooks, and policy-visible declarations.
- Downstream products own semantic judgment: what counts as a good transform
  from `A.req_i` to `B.result_i`.
- F_D may validate deterministic mechanics only: schema, path containment,
  digest, compilation, unit test execution, known objective predicates.
- F_P owns requirement-by-requirement semantic quality assessment, even when
  the implementation of that assessment is deterministic code.
- F_H calibrates or resolves contested semantic judgment.

That last rule is the critical strengthening. Anthropic distinguishes
code-based and model-based graders. In our method, "code-based" does not imply
F_D. If the grader judges content meaning, material representation, adequacy,
coverage, or design quality, it is F_P-domain assessment.

## Mapping Anthropic Terms To Our Surfaces

| Anthropic term | ABIogenesis surface |
| --- | --- |
| Task | One graph-function task, edge, slice, or full traversal scenario |
| Trial | One isolated run attempt over a task |
| Transcript / trace | ABG event stream plus worker/process transcript refs |
| Outcome | Materialized output assets plus admitted foldback/projection truth |
| Evaluation harness | ABG test/run harness plus T-082/T-100 carriers |
| Agent harness | The selected F_P worker transport and tool surface |
| Grader | F_D mechanical checker, F_P semantic assessor, or F_H reviewer |
| Eval suite | Named set of tasks with common goal, difficulty, and owner |
| Capability eval | Low/medium pass-rate suite that measures what the system can learn to do |
| Regression eval | High pass-rate suite that protects behavior already won |

This vocabulary should be adopted in tickets and test map prose because it
separates capability measurement from regression protection. The current
`test:semantic` lane is mostly regression. T-100 five-rule and mini data-mapper
lanes are capability/parity evals.

## Proposed Evaluation Architecture

The local eval architecture should be explicit and carrier-shaped:

```text
EvalSuiteSpec
  -> EvalTask[]
  -> EvalTrial[]
  -> EvalTranscript
  -> EvalOutcome
  -> EvalGradeVector
  -> EvalAggregateProjection
```

Minimum carriers:

- `EvalSuiteSpec`
  - suite id, goal, capability/regression class, owner, source ticket/design,
    task refs, pass thresholds, saturation policy.
- `EvalTask`
  - graph function or edge, input workspace seed, declared outputs,
    reference solution refs, success criteria, grader refs.
- `EvalTrial`
  - run id, attempt index, model/worker binding, policy, allocated output root,
    event stream ref, transcript refs.
- `EvalOutcome`
  - materialized output refs, projection refs, foldback ref, terminal decision,
    admitted evidence refs.
- `EvalGradeVector`
  - F_D mechanical rows, F_P semantic rows, F_H calibration rows when present.
- `EvalAggregateProjection`
  - per-task pass@k, pass^k, costs, latency, failure classes, saturation status,
    and regression/capability verdict.

ABG should persist these as projections over event/admission truth, not as a
second controller state.

## Evaluation Rules

1. Grade outcomes first.

Transcript and tool-call history are diagnostic evidence. Closure comes from
admitted output, evidence, projection, and foldback truth.

2. Keep trials isolated.

Every trial gets a clean workspace and ABG-owned output allocation through
T-082. No shared mutable state, cached artifacts, or caller-authored output
paths should affect trial independence.

3. Require reference solutions for capability evals.

A capability eval with no known passing reference is suspect. For SDLC parity,
test35 ledgers and artifacts are the reference-solution family. For new
ABIogenesis tasks, each task should include a minimal known-good fixture or
human-approved artifact.

4. Separate capability from regression.

Capability evals are allowed to start low. Regression evals should be near
100%. A saturated capability eval graduates into regression, and a harder
capability eval should be added.

5. Measure nondeterminism explicitly.

For live F_P workers, a single green run is not enough. Store:

- `pass@k`: at least one successful trial in k attempts.
- `pass^k`: all k trials successful.

For long SDLC chains, pass^k matters more than pass@k. A 90% per-edge success
rate over 20 edges is not reliable product behavior.

6. Use balanced tasks.

For each behavior, include positive and negative cases. Example: not only
"agent should search/use tool/write artifact", but also "agent should not search
or should not write outside root when the requirement does not justify it."

7. Read transcripts as process law.

A passing score is not accepted at face value until transcripts and grades are
sampled. This is how we catch lexical-match false positives, hidden harness
constraints, grader bugs, and valid solutions rejected by brittle tasks.

8. Calibrate model judges.

No LLM-as-judge F_P evaluator ships as authority without a calibration artifact:
human/SME comparison set, agreement statistics, rubric version, model version,
and an "Unknown / insufficient evidence" option.

## Direct Impact On Current ABIogenesis Work

### T-100 / test35 parity

The current T-100 shape is aligned with this design:

- T-082 gives isolated output allocation.
- T-100 gives schedule, slice assessment, foldback, and event replay.
- `test:t100:test35-parity` now exercises the five load-bearing rules:
  five-term closure predicate, latest-assessed-per-slice projection, retry
  allowlist, artifact salvage, and behavioral finding-class split.

The next improvement is not more F_D checks. It is an eval aggregate layer that
runs the same task multiple times and reports pass@k/pass^k per slice and per
whole traversal.

### Mini data-mapper eval

The mini data-mapper sandbox should become the first concrete eval suite:

- `EvalSuiteSpec`: `mini_data_mapper_eval`
- class: capability until stable, then regression
- tasks: requirements-to-design first, then implementation/test/archive slices
- trial setup: T-082 allocation, clean workspace, fixed seed option
- transcript: events.jsonl + worker transcript/process refs
- outcome: materialized outputs + T-100 foldback
- grade vector:
  - F_D mechanical envelope: file exists, path within root, schema/digest,
    compile/test commands where objective.
  - F_P semantic rows: `A.req_i -> B.result_i` material quality, one row per
    requirement.
  - F_H calibration rows: sampled or disputed assessments.

### Test surface map

`test_env/test_surface_map.md` should have an explicit eval taxonomy:

- Regression suites:
  - `test:semantic`
  - `test:t082`
  - `test:t100:unit`
- Capability/parity suites:
  - `test:t100:sandbox`
  - `test:t100:five-rule`
  - `test:t100:test35-parity`
- Future live reliability suites:
  - repeated F_P worker runs with pass@k/pass^k aggregate projection.

## Near-Term Implementation Plan

1. Add eval-suite metadata to the T-100 sandbox outputs.

Write `eval_suite.json`, `eval_task.json`, `eval_trials.jsonl`, and
`eval_aggregate_projection.json` under the sandbox `test_runs` directory.

2. Add repeat support.

Add `--repeat <N>` or equivalent env var to the mini data-mapper eval runner.
For each task, run N independent trials with fresh output allocation roots and
record pass@k/pass^k.

3. Add a capability/regression section to `test_surface_map.md`.

Keep existing test listings, but mark each suite's class and expected pass
behavior. This prevents capability eval failures from being confused with
regressions, and prevents saturated regression suites from being mistaken for
capability proof.

4. Add transcript-review artifacts.

For each eval run, emit a small `review_sample.md` listing:

- failed trials,
- surprising passes,
- sample transcript refs,
- grader-vs-human review notes,
- recommended task/grader changes.

5. Add LLM-judge calibration only when needed.

Do not build a general LLM judge framework until we have a real domain
evaluator that needs it. When we do, make calibration mandatory.

## Non-Goals

- Do not put domain semantic rubrics inside ABG core.
- Do not let F_D become a semantic evaluator because the implementation is
  deterministic code.
- Do not grade hidden chain-of-thought or private worker reasoning.
- Do not make transcript order the closure criterion when outcome truth is
  sufficient.
- Do not replace STDO closure with a dashboard score.

## Bottom Line

Anthropic's article validates the direction we already moved toward with
T-082/T-100: isolated trials, outcome verification, replayable transcripts, and
explicit graders. The useful adoption is to formalize eval suites as first-class
test/projection artifacts and measure F_P reliability with pass@k/pass^k.

The rule we must preserve is stricter than Anthropic's generic taxonomy:
semantic judgment of `A.req_i -> B.result_i` is F_P/domain assessment, even
when implemented with deterministic code. F_D validates mechanics. ABG owns
the harness and projection. Products own meaning.
