---
kind: claude_post
category: design_synthesis
governing_method: STDO + DESIGN_MODULE_METHOD
subject: applying anthropic's "demystifying evals for ai agents" to our F_P / F_D / ABG eval architecture
posted_by: claude
posted_at: 2026-05-02T05:30:00Z
scope: read-only design synthesis; no source modified
external_source: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
---

# Design synthesis: Anthropic's eval guidance applied to our ABG/odd_sdlc architecture

This post synthesizes the Anthropic engineering article *Demystifying Evals for AI Agents* against our existing ABG runtime, T-082 output allocation, T-100 zoom/foldback, the F_P/F_D boundary, and the just-built T-101 mini data-mapper-redux sandbox. The goal is to identify what we already get right, what the article surfaces as gaps, and a sequenced set of adoptions.

## Position

The article's framing is largely consistent with our architecture — but it provides three things we currently lack: (1) a clear vocabulary for task/transcript/outcome/grader decomposition, (2) probabilistic-success metrics (pass@k / pass^k) for characterizing F_P worker variance, and (3) a layered "Swiss cheese" eval strategy combining automated evals, production monitoring, A/B, and human review. Adopting these does not require new substrate carriers; it requires test-surface organization and operator practice. The architectural decisions we've already made (T-082 invocation-local allocation, T-100 ledger/foldback, F_P/F_D boundary discipline) are well-aligned with their best-practice recommendations and protect us from several common pitfalls they warn about.

## Vocabulary mapping

| Anthropic | Ours | Anchor |
| --- | --- | --- |
| Task | Graph-function edge (single) or full traversal (chain) | `graph/catalog.ts` entries; or A-to-B run definition |
| Input | A.ref (input asset binding) | `WorkspaceAssetBinding` per T-100 |
| Output | B.ref (materialized output) | T-082 allocation root + materialized files |
| Transcript / Trace | Event stream + lineage | `runtime/events/events.jsonl`, T-100 `ScheduledSliceAssessment` history |
| Outcome | Admitted ledger + materialized assets at terminal | `ZoomFoldbackEvaluation` + `runtime/runs/<id>/assets/...` |
| Grader (logic that scores) | F_P semantic evaluator + F_D mechanical envelope | `fp_evaluator.mjs` + `fd_envelope.mjs` (T-101 sandbox) |
| Capability eval | "Can our system reach test35-level closure on this domain?" | T-101 mini-sandbox (currently); future: harder traversals |
| Regression eval | "Does existing T-082/T-100 carrier contract still hold?" | `test:semantic` 318/318, `test:t082`, `test:t100` |
| Reference solution | Worked example proving the task is solvable | data_mapper test35 ledger fixtures |
| pass@k | "Did at least one F_P attempt close?" | Not yet measured |
| pass^k | "Do all F_P attempts close?" | Not yet measured |

## What our existing infrastructure already gets right

These are direct applications of Anthropic's best practices we already have:

1. **Robust isolated environments (Step 4).** T-082 mints invocation-local allocation roots under `runtime/runs/<run-guid>/assets/...`. Each trial starts clean by construction. No shared state correlates failures across trials. This is exactly Anthropic's recommendation.

2. **Outcome verification distinct from transcript verification.** T-100's `ZoomFoldbackEvaluation` is the outcome carrier; the event stream is the transcript. Anthropic explicitly calls out the trap of "agent claims success in transcript but no reservation exists in the database." Our foldback closure cannot fire from transcript alone — it requires admitted ledger fields.

3. **Grade outcomes, not paths.** The article warns: "Avoid grading very specific steps like a sequence of tool calls in the right order... agents regularly find valid approaches that eval designers didn't anticipate." Our F_P semantic evaluator at edge 3 of T-101 grades **what the implementation does** by executing it — not whether the worker followed a particular pattern. Edge 2 does AST-style structural recognition with multiple acceptance patterns (template literal OR `+` OR `join` for concatenation). This is the right shape.

4. **F_D / F_P split aligns with code/model grader split.** Anthropic distinguishes code-based graders (objective, deterministic, mechanical) from model-based graders (flexible, semantic, calibrated). Our F_D = mechanical envelope = code-based grader. Our F_P semantic evaluator can be either deterministic (parser-based) or LLM-based (future). The constitutional rule "F_D never reads content semantically" is a stricter version of Anthropic's guidance and protects us from the masking-by-accident failure mode.

5. **Build in partial credit.** The T-100 ledger has `fulfilledCount`, `partialCount`, `blockedCount`, `unfulfilledCount`, `missingCount`, `extraCount`. The Python source these mirror has the same shape. This is exactly Anthropic's "Build in partial credit" recommendation operationalized as carrier fields.

6. **Reference solutions exist (test35).** Anthropic recommends worked-example reference solutions to prove tasks are solvable. data_mapper test35's `fp_ledgers/*.json` fixtures are exactly this — they prove the SDLC chain CAN converge, even if our TS implementation hasn't yet reproduced it.

7. **Replayable evidence.** Per-run `test_runs/<test>/<timestamp>/...` evidence layout matches Anthropic's "robust environments" criterion: every run is independently inspectable and reproducible.

## Gaps the article surfaces

Things we don't have or don't have explicit:

### G1. Eval taxonomy not enforced
Our test surface (`test_env/test_surface_map.md`) lists tests but doesn't categorize them as **capability** (low pass rate expected, exercises hard domain) vs **regression** (~100% pass rate expected, protects existing contracts). Anthropic recommends explicit separation. The current `test:t100:five-rule` is conceptually a capability eval (currently 5/5 failing by design); the rest of `test:semantic` is regression. Mixing them creates confusion when CI fails — is the failure a regression or expected capability?

**Recommendation:** Split the surface map into capability/regression sections. Mark T-100 five-rule as expected-failing-until-algebra-fix.

### G2. No pass@k / pass^k characterization for F_P workers
Live F_P (claude CLI) is stochastic. The article specifically calls this out: "agents are inherently non-deterministic... pass@k for tools where one success matters, pass^k for agents where consistency is essential." We do not measure either. The T-101 sandbox runs each edge once. We have no characterization of how often a worker run reaches close on the first try vs after retry.

For our SDLC traversal — where we need consistency across **20+ edges** in a row — pass^k matters. If pass@1 per edge is 90% but pass^20 is 12%, the system is unreliable in aggregate even though individual edges look fine.

**Recommendation:** Add a `--repeat <N>` flag to T-101's `run.mjs` that runs each edge N times, captures pass@k and pass^k per edge, and folds these into a run-level reliability projection. This costs proportionally more credits with live workers but gives genuine reliability data.

### G3. No transcript review cadence
Anthropic's Step 6: "Read Transcripts Regularly. You won't know if your graders are working well unless you read the transcripts and grades from many trials." We have events.jsonl + ledger.json + assessments.jsonl per run, but no review process. The recurring lexical-F_D-bug class (B-003 → B-017) is fundamentally a transcript-not-read failure: graders were marking obligations fulfilled based on substring matches that weren't actually material.

**Recommendation:** Add a weekly transcript-review tick (or similar cadence) to the STDO process. Sample 5-10 recent failed (or recently-changed) runs, read the transcripts, verify the graders matched what an SME would say. This is process, not infrastructure.

### G4. No saturation tracking
The article warns: "As evals approach 100%, they lose signal for improvement... plan for harder tasks." Our `test:semantic` is at 318/318 passing. By Anthropic's reading, this is saturation territory — the suite no longer differentiates incremental improvements from regressions, and is a poor signal for capability progress.

**Recommendation:** When test:semantic is saturated, the closure work for new tickets should require **adding harder capability evals** alongside the regression evals. T-101's mini-data-mapper-redux is one such addition; T-100's five-rule live test is another. The pattern should generalize: each substantive feature ticket adds a capability eval that will initially fail, and the regression suite gates on no-degradation.

### G5. No layered eval strategy beyond automated evals
Anthropic's Swiss-cheese model lists six layers: automated evals, production monitoring, A/B testing, user feedback, manual transcript review, systematic human studies. We currently have one (automated). When the data_mapper live reproduction lane runs, we have no production monitoring telling us anything about distribution drift, no A/B for comparing algebra-A vs algebra-B closure rates, no user feedback channel.

**Recommendation:** Plan-only for now. We're not big enough to need all six. But identify which layers we'll add as the system matures, and don't accidentally collapse all eval responsibility onto automated evals (which the article explicitly warns against: "Evals can create false confidence if they don't match real usage patterns").

### G6. LLM-as-judge calibration discipline absent (forward-looking)
We don't yet have LLM-based F_P semantic evaluators. When we do (e.g., a downstream evaluator F_P plugin that uses a Sonnet to assess design materially-represents-requirement), we need calibration discipline:
- "Give the LLM a way out, like providing an instruction to return 'Unknown'" — prevents hallucinations
- Calibrate against human SME review with explicit inter-annotator agreement
- Re-calibrate when the underlying model version changes
- Don't use LLM grader for tasks where its biases match the model under test

**Recommendation:** When the first LLM-as-judge F_P evaluator lands, the closure gate must include a calibration artifact: N tasks scored by both LLM judge and human SME, agreement statistics, and a recorded threshold. No LLM judge ships without calibration.

### G7. Eval ownership not formalized
The STDO method has ticket ownership but no eval-suite ownership. Anthropic's Step 8: "Sustainable Ownership. Assign dedicated teams to core infrastructure; empower domain experts and product teams to contribute tasks."

**Recommendation:** When the eval surface grows past ~5 capability suites, formalize ownership. For now: T-082/T-100 carriers are owned by abiogenesis; T-101 sandbox is owned by the test harness team; the mini-data-mapper-redux belongs in test_env/sandbox where it lives. Clear enough, no action needed yet.

## Specific architectural adoptions, sequenced

**Small effort (do now):**

1. **Split surface map into capability/regression** (G1). Annotate `test_env/test_surface_map.md`. Mark `test:t100:five-rule` as expected-failing.
2. **Adopt the vocabulary** in tickets and design docs. Use *task / transcript / outcome / grader* instead of overloading our internal terms.
3. **Pin "grade what the agent produced, not the path" in CLAUDE.md** (already in spirit, make explicit). Same with "give graders a way out" for future LLM judges.

**Medium effort (next quarter or as part of next major work):**

4. **Add pass@k / pass^k reporting to T-101** (G2). Adds a `--repeat <N>` flag; aggregates per-edge and per-run statistics; emits to `summary.json`. Costs k× more credits per live run.
5. **Establish transcript review cadence** (G3). Add a recurring task: weekly review of N failed/changed traversals. Could be a /loop schedule.
6. **Saturation policy** (G4). When `test:semantic` passes 100%, new feature tickets require a capability eval delta or document why one isn't needed.

**Larger effort (when needed):**

7. **LLM-as-judge calibration framework** (G6). When the first model-based F_P evaluator lands. Calibration artifact + threshold + re-calibration trigger.
8. **Layered strategy expansion** (G5). Production monitoring when the live lane is real; A/B when we have multiple algebra candidates to compare.

## Specific risks the article highlights that we are or were vulnerable to

The article's pitfall list maps directly to bugs we've actually had:

| Article warning | Our exposure |
| --- | --- |
| "Over-specifying tool call sequences penalizes creative valid solutions" | Lexical F_D check was exactly this. F_P semantic evaluator with multiple acceptance patterns is the fix. |
| "Saturation masks progress" | `test:semantic` 318/318 — already at the threshold where regression tests provide little signal for capability work. |
| "Ambiguous task specs cause failures unrelated to agent capability" | T-109's five-rule design gaps were exactly ambiguous specs — implementation built a parallel algebra because the predicate wasn't pinned. |
| "Reading transcripts" | The lexical-F_D bug class is a transcript-not-read failure; graders said fulfilled, an SME reading the artifact would have said no. |
| "Eval scores at face value" | T-100 implementation passed 318/318 while five-rule algebra was structurally wrong. The score didn't reflect the parity gap. |
| "0% pass rate is most often a signal of a broken task, not an incapable agent" | Test65's vector-8 stop is a signal that the algebra is broken, not that the worker is incapable — exactly Anthropic's framing. |

These are not hypothetical risks; they're the structural failure modes we've already hit. The discipline the article articulates would have caught some of them earlier:
- Reading transcripts would have caught lexical-F_D.
- Saturation tracking would have flagged that 318/318 was no longer informative.
- Capability/regression separation would have made T-109's algebra defects visible as a not-yet-passing capability eval rather than masked under "everything green".

## Integration with the F_P/F_D constitutional rule

The article's distinction between code-based and model-based graders is **weaker** than our F_P/F_D rule. They allow either type to do either kind of judgment as long as it's calibrated. We have a stricter rule: F_D never reads content semantically; semantic judgment is F_P regardless of implementation type.

Our rule is tighter for a reason — the lexical-F_D bug class proved that conflating semantic checks into deterministic "F_D" slots produces silent quality drift. Anthropic's framing doesn't have this constraint because they're not constrained by our specific architectural commitments (PRODUCT.md product split, REQ-R-ABG3-PAYLOAD.md, etc.).

Net: we adopt Anthropic's grader taxonomy with a **strengthening note** in our docs:

> Our F_D corresponds to Anthropic's "code-based grader" only when the grader is mechanical (envelope check). Our F_P corresponds to "model-based" or "code-based semantic" graders — both are F_P because both involve semantic judgment of A.req_i → B.result_i.

This avoids the masking failure mode while adopting the broader vocabulary.

## Concrete artifacts to produce as next steps

1. **Update `test_env/test_surface_map.md`** with capability/regression sections. (~30 min)
2. **Add `pass@k`/`pass^k` to T-101 `run.mjs`** with `--repeat <N>` flag. Update `summary.json` schema. Update README. (half day)
3. **Add a `feedback_eval_discipline.md` memory entry** capturing the vocabulary, the saturation policy, and the no-eval-score-at-face-value rule. (~10 min)
4. **Add a /loop or recurring tick** for transcript review — operator decides cadence (weekly seems right per article).
5. **When the next algebra fix lands** (T-100 closure gate b), require pass@k / pass^k characterization for the live test as part of the closure gate, alongside the existing TDD assertions.

Items 1, 3 are low-effort and worth doing immediately. Item 2 is medium-effort and should land alongside the next live-worker test wave. Items 4, 5 are operator-decision rather than implementation.

## Closing

This post is commentary, not ratified specification or design. The article validates much of what we've built and illuminates a few specific places we should grow. The biggest mindset shift the article suggests is from "do the tests pass?" to "do the evals tell us anything we didn't already know?" — i.e., a mature eval suite produces information, not just green checks. Saturation, capability/regression separation, and pass^k metrics are the tools for keeping evals informative as the system improves.

The constitutional discipline (F_P/F_D split, ABG/GTL/plugin boundary, STDO change-class hygiene) keeps us protected from the masking failure modes the article warns about most strongly. Adopt the vocabulary and the metrics; keep the constitutional rules.
