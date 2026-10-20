# Harness² algorithms and the features they serve

Derived commentary, 21 October 2026. Exact source: /Users/jim/src/apps/harness2 at **1cfe254e8d25b15f37048c3730134686abe60335**, clean at the Writer's observations.

These **19 scoped comparison groups** describe language-independent procedures. Their present Python/substrate bindings are evidence about realization, not definitions of algorithmic identity. The H identifiers are local references only. They are neither an exhaustive inventory nor a feature/novelty score. See [the overview](README.md), [ABG counterparts](abg-algorithms.md), [candidate loans](transfer-analysis.md) and [exact source pins](SOURCES.json).

The three accounts remain separate: steps; meaning of inputs/outputs; actual executor/environment. “Closed deterministic” names closed bookkeeping/validation rules, while “mixed” preserves F_P judgments and external effects. Neither label creates authority. Propose–Probe–Compose can already be expressed through ABG composition/zoom; the detailed policy and its efficacy remain separate claims.

**Evidence legend:** S means source inspected in the closed Harness frontier. E means prior reported local installation evidence, reused without rerunning or independently reacquiring its execution artifacts in this Writer activation: Python 3.12, two deterministic demo tasks completed in both modes without failure, and all five upstream workflow tests passed. Those tests use deterministic editors/doubles and real Python executions. They do not prove live-model quality, safety, efficiency or ABG conformance.

Source paths are relative to /Users/jim/src/apps/harness2. Hyperlinked source routes can later move; SOURCES.json records the exact material bytes used here.

## Algorithms

<a id="h01"></a>

### H01 — Construct an experiment identity and reproducible task stream

**Feature / kind.** Repeatable experiment partitioning; closed deterministic ordering and identity comparison.

**Algorithm.** (1) Obtain task identifiers and their domains from the adapter. (2) Validate requested domains/tasks and positive per-domain cap. (3) Start from sorted task/domain sets; use the reference domain order or a seeded domain/task permutation. (4) Filter and cap each domain. (5) Form a namespace from benchmark, substrate, mode, k, optional seed/tag. (6) Save or compare the executor/improver/judge, endpoints and selected task identity; reject incompatible reuse.

**Information.** Input task identifiers describe work, not expected answers. Domain is a transfer/grouping boundary. Seed fixes stream order, not model sampling. Output namespace identifies one experiment cell; it is not an immutable Product or execution authority.

**Controls / effects.** Unknown selections, invalid mode/tag, empty substrate and mismatched saved identity refuse. max_tasks caps each domain, not total work. Writes are experiment configuration/directories only; known dataset revision is separate from this configuration.

**Binding / evidence.** harness2/core/schedule.py:85-163,736-777; harness2/cli/run_sweep.py:209-235. S; E covers stable scheduling/resume indirectly, not arbitrary partition equivalence.

<a id="h02"></a>

### H02 — Project execution evidence into a role-specific context tree

**Feature / kind.** Evidence-grounded improvement and composition; closed projection with adapter-dependent extraction.

**Algorithm.** (1) Write the original task and copy allowed source materials. (2) Project rollout trajectories and deliverables into labelled files; include candidate trees/diffs and earlier decisions when requested. (3) Copy the selected harness and earlier library. (4) reject declared answer-key paths and known grader-output markers. (5) Emit an inventory of what actually landed and a short mission that points to files; refuse if every required trajectory failed to render.

**Information.** Task, source, actor trajectory, delivered artifact, harness definition, decision and prior lesson retain different meanings. A rendered view is a projection, not the artifact itself. Some profiles deliberately expose names rather than artifact contents.

**Controls / effects.** Whole trajectories are not reduced to one prompt budget, but per-observation truncation remains. Marker scans are tripwires, not proof of non-contamination. Creates/replaces owned context trees; does not admit runtime truth.

**Binding / evidence.** harness2/core/context.py:15-26,105-216,219-290,399-518; harness2/benchmarks/workbuddy.py:653-668. S; E tests the evidence layout, excluded answer path and earlier-library prefix (tests/test_workflow.py:108-146).

<a id="h03"></a>

### H03 — Construct and validate an editable harness tree

**Feature / kind.** Constrained scaffold edit surface; closed deterministic construction/validation.

**Algorithm.** (1) Read only allowed relative paths and collect off-surface paths. (2) Materialise the selected tree, replacing editable entries while preserving outside files. (3) Add a declared trigger line for skills absent from always-on text when the character cap permits. (4) Check caps, skill/subagent declarations, referenced helper presence, Python syntax and supported hook schema. (5) Return a census or actionable errors.

**Information.** Tree is relative path to text. Surface is substrate configuration, not Product authority. A trigger-name occurrence is a syntactic proxy for reachability, not proof a model will load the skill. Valid Python syntax is not safety or semantic correctness.

**Controls / effects.** Reject path escapes, malformed names/declarations, unsupported hooks, unavailable subagents, missing referenced helpers and oversized always-on content. Current caps differ by substrate. Tree writes are owned temporary/experiment harness materialisation.

**Binding / evidence.** harness2/core/tree.py:41-110,127-264,267-390; harness2/substrate/codex.py:39-103; harness2/substrate/opencode.py:42-88. S; E covers one invalid-script repair, not arbitrary generated-code behavior.

<a id="h04"></a>

### H04 — Propose an edit with validation-feedback repair

**Feature / kind.** Automatic candidate generation with bounded repair; mixed F_P proposal and closed validation.

**Algorithm.** (1) Build context from task, execution evidence, current harness and prior experience. (2) Ask the improver to edit the harness tree under a selected invariant/domain/composition mission. (3) Harvest the tree. (4) Apply H03 plus adapter invariants and contamination tripwires. (5) If invalid, return concrete errors and retry once. (6) Accept the valid candidate; otherwise return the original fallback tree with failure/cost evidence.

**Information.** Proposal is a candidate definition; notes explain edits but are not proof. “kept_base” means no surface difference. “fell_back” records invalid/unavailable proposal recovery. Neither means semantic acceptance.

**Controls / effects.** Two stage attempts; each transport has its own bounded retry policy. Context-construction failure also falls back. Cost includes observed failed attempts. Effects are model invocation, scratch context, audit/harvest and candidate-tree writes; no source-repository mutation is inherently authorised.

**Binding / evidence.** harness2/core/recursion.py:108-251; harness2/core/prompts.py:824-1009. S; E directly exercises invalid syntax, feedback, retry and accumulated cost (tests/test_workflow.py:148-185).

<a id="h05"></a>

### H05 — Probe baseline and candidate harnesses on the same task

**Feature / kind.** Behavioral comparison population; mixed closed dispatch and externally realised work.

**Algorithm.** (1) Derive k baseline run identifiers for one task. (2) Dispatch baseline runs, batching where the adapter permits. (3) Materialise each candidate harness and execute the same task under a distinct run identifier. (4) Record run directory, completion/deliverable status and failure; retain failed runs rather than fabricating outputs. (5) Execute independent probes concurrently within the configured width, then record results in stable input order.

**Information.** A baseline is an execution of the inherited harness, not an oracle. RunView.ok can mean the returned directory exists. delivered is adapter-defined. These flags do not mean the output is correct. Same task supplies a useful comparison basis but not a controlled model draw.

**Controls / effects.** Failed execution becomes a dead RunView; no successful baseline stops the task. Adapter timeouts and idempotence govern real executions. External calls, tools and artifact writes occur at adapter/substrate boundaries.

**Binding / evidence.** harness2/core/schedule.py:430-477,619-633; harness2/core/recursion.py:260-340. S; E proves the deterministic demo's bounded execution counts, not live-model causal gains.

<a id="h06"></a>

### H06 — Explore a parallel population and compose independent finals

**Feature / kind.** Width-first task refinement policy; mixed search/composition.

**Algorithm.** (1) Share k baseline executions and a fixed base harness. (2) Independently propose k invariant-scoped and k domain-scoped harnesses. (3) Probe all 2k candidates. (4) Give the full candidate/evidence/decision pool to k independent composers. (5) Probe each composition and retain all k finals; compute descriptive line-set diversity.

**Information.** Invariant/domain are prompt lenses for general versus task/domain-specific changes, not different semantic authority categories. A composition may choose, combine or reject edits through F_P judgment. A line-set similarity is text diversity, not semantic diversity or quality.

**Controls / effects.** Positive k, phase worker caps and H04 fallback apply. Logical allocation is k base + 2k candidates + k finals; failed/fallback stages remain visible. No monotonic-improvement guarantee. Effects are the bounded set of H04/H05 invocations and experiment files.

**Binding / evidence.** harness2/core/recursion.py:343-449; harness2/core/tree.py:393-427. S; E exercises k=1 and k=2 bookkeeping with deterministic editors. This is an expressible zoom policy, not a new calculus.

<a id="h07"></a>

### H07 — Refine sequentially with accumulated evidence

**Feature / kind.** Depth-first task refinement policy; mixed iterative search/composition.

**Algorithm.** (1) Initialise current harness to the base and history to empty. (2) For each of k rounds, propose invariant/domain variants of the current harness using original baselines plus accumulated history. (3) Probe both variants. (4) Compose a new harness using old and current candidates/decisions. (5) Probe it, append its evidence, and use that composition as the next current harness. (6) Retain every round's composition as a possible final.

**Information.** Current harness is the latest composition, not a proven best-so-far version. History retains alternatives, observations and edit reasoning. Later rounds can revise earlier strategy. Selection among all round finals occurs later.

**Controls / effects.** k bounds rounds; H04/H05 control failures and effects. Refinement can regress because no quality oracle gates current_harness assignment. History grows with rounds; representative model/context growth was not measured.

**Binding / evidence.** harness2/core/recursion.py:452-565; harness2/core/prompts.py:964-1009. S; E verifies round-history presence and deterministic final answers, not open-world convergence.

<a id="h08"></a>

### H08 — Anonymise candidates by a reproducible permutation

**Feature / kind.** Reduce label/order cues for selection; closed deterministic relabelling.

**Algorithm.** (1) Canonically sort candidate labels. (2) Derive a pseudo-random seed from task, k and mode. (3) Shuffle that label sequence reproducibly. (4) Assign alphabetic anonymous identifiers. (5) Write each candidate's complete rendered text and explicitly selected assets under its anonymous identifier; retain the reverse mapping for audit/reflection.

**Information.** Anonymous identifier is a presentation coordinate. It changes no artifact identity or quality. The retained map is essential to connect selection reasoning to the actual run. Anonymity does not hide clues within artifact content or guarantee unbiased judgment.

**Controls / effects.** Only adapter-named assets are copied, to avoid dragging whole grader directories into context. Rendering and file I/O can fail independently. Writes are the selector evidence view, not a mutation of the underlying deliverable.

**Binding / evidence.** harness2/core/selection.py:71-86,183-219,294-305. S; E traverses this path in k=2 demo selection but does not establish removal of model preference bias.

<a id="h09"></a>

### H09 — Construct the finals-only eligibility pool

**Feature / kind.** Define which existing outputs may be adopted; closed selection-domain construction.

**Algorithm.** (1) Select exactly agg1..aggk for parallel mode or c1..ck for sequential mode. (2) Exclude baselines and candidate probes. (3) Drop runs that failed, produced no deliverable, failed rendering or rendered empty content. (4) If the profile allows state-only work and no file answer survives, use available nonempty trajectories as evidence. (5) Record exclusions and the evidence kind.

**Information.** Eligibility means a usable representation of a completed candidate exists. It does not establish correctness. The published pool deliberately has no baseline or abstention option; state trajectory is a different evidence basis from a delivered file.

**Controls / effects.** An empty pool is a failed adoption. No repairs or synthetic answers are created. Algorithm reads selected output/evidence and updates selection bookkeeping only.

**Binding / evidence.** harness2/core/selection.py:93-153; harness2/core/schedule.py:513-528. S; E exercises basic pool use. Do not borrow its finals-only policy as an implicit ABG acceptance rule.

<a id="h10"></a>

### H10 — Choose a final, or record a failed selection fallback

**Feature / kind.** Adoption decision; mixed F_P comparison with closed parsing/fallback.

**Algorithm.** (1) For one final at k=1, deliver that eligible final directly without a selector session. (2) Otherwise present H08's anonymous pool, original task/source and declared comparison instructions. (3) Ask for exactly one identifier and reason; parse and check membership. (4) On valid choice set ok. (5) On selector/parse failure record a base if present, otherwise the first lexically sorted final as diagnostic fallback; keep selection unsuccessful. (6) Persist chosen run relation and failure status.

**Information.** Adoption is choosing an existing run, not generating another answer or proving it superior. No numerical tie ranking exists: the model must choose one. Failure fallback is not successful selection and is excluded from judging.

**Controls / effects.** Empty pool refuses. k=1 offers no comparative selection assurance. Persistence failure also clears success. Writes selection metadata; invokes an F_P selector only when needed.

**Binding / evidence.** harness2/core/selection.py:237-399; harness2/core/judge.py:99-113. S; E covers k=1 no selector and failed selector never judged (tests/test_workflow.py:88-94,208-225).

<a id="h11"></a>

### H11 — Reflect on adoption and extract a transferable lesson

**Feature / kind.** Improve future harnessing context; mixed F_P reflection and closed parsing.

**Algorithm.** (1) Require successful adoption and its chosen run. (2) Build context containing base/adopted/candidate harnesses, trajectories, decisions, artifacts and anonymous-ID mapping. (3) Ask the reflector to describe what the edits did and a reusable cue, lesson, supporting evidence and confidence. (4) Parse recognised fields; reject missing cue/lesson/evidence. (5) Refuse known grader-output markers; persist the reflected experience on the selection record.

**Information.** Cue supports later retrieval; lesson is a proposed generalisation; evidence is the reflector's cited execution contrast; confidence is an optional declared assessment. These are not verified causal explanations or truth established by the formatter.

**Controls / effects.** Reflection can fail or return no entry while adoption remains successful. No entry is not converted to a fabricated lesson. Reflector uses a fixed instruction template; retained lessons do not rewrite the optimiser algorithm. Invokes a model and writes reflection metadata.

**Binding / evidence.** harness2/core/selection.py:402-505; harness2/core/prompts.py:1105-1163. S; E covers no-entry and failed reflection surviving resume without a library entry (tests/test_workflow.py:187-206).

<a id="h12"></a>

### H12 — Store an eligible lesson with its complete adopted harness

**Feature / kind.** Durable, inspectable experience library; closed eligibility/persistence.

**Algorithm.** (1) Require nonempty string cue, lesson and evidence. (2) Scan the harness and reflected text for known grader verdict markers. (3) Replace that task's stored harness with its complete editable tree. (4) Write adoption label/run, component census, reason, edit effects and transferable fields. (5) Rebuild the domain index from stored entries.

**Information.** Library stores full definitions, not only prose summaries. An entry means adopted and reflected, not externally graded or owner accepted. Evidence linkage is recorded as text/run identifiers; the library is mutable filesystem storage, not an immutable admitted event history.

**Controls / effects.** Invalid/no experience means no entry. Rebuild cannot establish the meaning or freshness of a lesson by formatting it. Writes only the configured experience root. No automatic cross-domain generalisation is performed.

**Binding / evidence.** harness2/core/library.py:43-47,106-203. S; E covers eligibility, retained complete trees and missing-experience exclusion. Semantic validity of learned generalisations is unqualified.

<a id="h13"></a>

### H13 — Enforce earlier-task-only, domain-local library reuse

**Feature / kind.** Continual improvement without future-task/mode leakage; closed prefix control plus later F_P retrieval.

**Algorithm.** (1) Create separate libraries for each domain and recursion mode under the run/budget/seed root. (2) Before task i, retain only entries for tasks preceding i in the selected stream. (3) Supply the resulting domain library if it contains experience. (4) Run/adopt/reflect the current task. (5) Append its eligible entry for later tasks; process other domains concurrently without sharing their domain library.

**Information.** Temporal prefix is relative to the selected experiment stream, not universal chronology. Same-domain membership supplies a retrieval population, not semantic applicability. The improver chooses what to read/use.

**Controls / effects.** Multi-mode runs reject one shared mutable library. retain may delete out-of-prefix entries under its own library root; callers must select that territory correctly. No automatic cross-domain/global memory. Per-domain task order is sequential.

**Binding / evidence.** harness2/core/schedule.py:331-347,669-715; harness2/core/library.py:15-24,79-104,215-222. S; E verifies only the earlier task is present for the next task (tests/test_workflow.py:126-129).

<a id="h14"></a>

### H14 — Reuse an improvement call by content-addressed context

**Feature / kind.** Avoid repeated improver work with the same request; closed cache-key construction/retrieval.

**Algorithm.** (1) Hash label, mission, system text, resolved context path and sorted context-file paths/bytes. (2) Derive response/audit/harvest paths from label and digest. (3) Reuse a nonempty saved response if any required harvested workspace also exists. (4) Otherwise perform the session and write response, mission/system, metadata and optional harvested tree.

**Information.** Resolved path is included so byte-identical k=1 mode contexts can still be independent draws. Cached zero cost means no new call spend, not zero historic spend. A cache hit is a reuse decision; it does not validate the response's meaning.

**Controls / effects.** Missing required workspace prevents reuse. The key is a truncated SHA-256 convenience digest; model/task compatibility also relies on H01's experiment configuration discipline. Cache artifacts are mutable local files, not adversarially sealed custody.

**Binding / evidence.** harness2/core/proposer.py:126-147,313-387,507-534. S; E covers stream resume avoiding further calls, not cache collision resistance or arbitrary manual audit mutation.

<a id="h15"></a>

### H15 — Run a bounded isolated improvement session with transport retries

**Feature / kind.** Execute the improver/selector through the selected channel; mixed external session with closed supervision.

**Algorithm.** (1) After a cache miss, create a fresh scratch directory and copy context into it. (2) Acquire the optional shared concurrency semaphore. (3) Invoke the configured channel with mission/system and timeout; extract response/cost/error. (4) On empty/failed transport, retry up to the configured bound with backoff. (5) Harvest the requested tree before cleanup. (6) Audit success/failure, accumulate observed spend and remove scratch in finally.

**Information.** Transport success means a usable nonempty reply, not semantic validity. Scratch session/state separation reduces accidental prior-session context. It is not an operating-system security boundary.

**Controls / effects.** Timeouts, attempt bounds, concurrency and step settings limit calls; timeout may leave cost incompletely observed. Claude path skips permissions; OpenCode uses a workspace external-directory fence and fresh state directories. Executed commands and network need their own environmental containment.

**Binding / evidence.** harness2/core/proposer.py:126-208,210-311. S; E tests fresh OpenCode session state using a subprocess double (tests/test_workflow.py:130-146), not process-tree containment.

<a id="h16"></a>

### H16 — Mark execution completion and resume current adopted work

**Feature / kind.** Reuse completed experiments and reconstruct their library relation; closed currentness bookkeeping with adapter assumptions.

**Algorithm.** (1) On normal runner return, atomically write a versioned completion marker with run ID, time, harness fingerprint and adapter extras. (2) Reuse individual runs only when marker/configuration and required output fingerprints match. (3) For task-level resume require successful mode/selection records, existing renderable adopted output, available harness and its saved fingerprint. (4) Call adapter artifact-integrity checks where supplied. (5) Restore eligible chosen harness/experience into the library; otherwise rerun.

**Information.** Completion is distinguished from output presence. Harness digest identifies selected source-tree bytes; a baseline sentinel means inherited base, not a complete environment digest. Resume status skipped means reuse, not fresh evaluation.

**Controls / effects.** JobBench/LAB check output fingerprints; WorkBuddy lacks the optional integrity hook, so still-renderable changed artifacts can evade summary-level currentness detection. Saved identity, markers and artifacts are mutable. Writes markers/summary/library, not authoritative replay events.

**Binding / evidence.** harness2/core/runmark.py:15-19,41-102; harness2/core/schedule.py:201-236,350-421; harness2/benchmarks/jobbench.py:759-773; harness2/benchmarks/lab.py:745-754; harness2/benchmarks/workbuddy.py:738-758,859-861. S; E covers changed harness and deleted adopted output, not the WorkBuddy static counterexample.

<a id="h17"></a>

### H17 — Account for logical search budget, attempts and observed spend

**Feature / kind.** Make refinement scale legible; closed ledger and arithmetic.

**Algorithm.** (1) Record stable unique rollout and improvement-stage labels. (2) For each mode assert R=4k (k base, 2k candidate, k final) and P=3k (k invariant, k domain, k composition). (3) Count stage retry attempts separately and sum observed improvement costs. (4) Record selection/reflection costs outside that ledger. (5) Report stage fallbacks, graded/ungraded coverage and improver spend.

**Information.** Logical allocation is not dollar-budget enforcement or a performance gain. Baselines are shared in the nominal job structure: the two modes together allocate k+3k+3k=7k rollout jobs rather than 8k independent jobs. This is not a measured physical request count: resume, caches, early failures and retries change actual executor requests. Selection, reflection and external grading add further work.

**Controls / effects.** Duplicate labels or wrong counts raise BudgetError. Current rollout recording does not populate total solver spend; CLI spend is explicitly improver-only. No hard aggregate monetary stop is implemented by this ledger. Writes arithmetic records/reports only.

**Binding / evidence.** harness2/core/ledger.py:15-33,58-132; harness2/core/recursion.py:254-340; harness2/cli/report.py:37-55,104-109. S; E asserts counts and repair-attempt costs. No local cost-efficiency qualification.

<a id="h18"></a>

### H18 — Materialise a harness into an execution substrate and invoke it

**Feature / kind.** Separate search policy from execution environment; mixed construction/dispatch, not a Protocol counted as an algorithm.

**Algorithm.** (1) Select an adapter's explicit install mode and substrate surface. (2) Validate the source tree is suitable. (3) Stage source entries as the substrate's native files; for the relevant OpenCode mode compose always-on text, skill/subagent indexes and helper locations into a task template. (4) Carry source fingerprint and material context to the benchmark-owned launcher. (5) Invoke it with task reference, run IDs and timeout; return one location per execution. (6) Read its native trace through the declared renderer.

**Information.** A materialised Install is an execution binding of the selected tree. Task/benchmark domain, method policy and substrate remain separate axes. A TypeScript implementation could realise the same steps without adopting a new semantic calculus.

**Controls / effects.** Incompatible install modes/missing launchers refuse. Codex runs bypass approvals, sandbox and hook trust; real launchers own the actual environment. Network is unrestricted by this release. Staging and external-tool effects need an independently suitable grant/environment.

**Binding / evidence.** harness2/substrate/opencode.py:140-298; harness2/substrate/codex.py:120-198; harness2/core/spec.py:15-20,219-250. S; E covers demo execution binding only. No live substrate/provider qualification was performed.

<a id="h19"></a>

### H19 — Grade after adoption and report comparable results

**Feature / kind.** Keep optimisation independent of external benchmark feedback; mixed external evaluation and closed aggregation.

**Algorithm.** (1) Freeze selection before calling the adapter's scorer. (2) Refuse to grade unsuccessful selection. (3) Capture passed/total criteria and raw metric, or retain a failed judge as ungraded rather than zero. (4) Group by mode/k; report mean graded fraction, complete pass, ungraded count, choice provenance, fallback and observed improver cost. (5) Warn about mixed units and explain that differences between the equivalent k=1 procedures provide a noise floor.

**Information.** Benchmark score measures its declared criteria, not universal semantic truth. Excluding ungraded rows changes the denominator; coverage must accompany score. No optimiser import of the judge is intended. Baseline scoring is a separate comparison operation.

**Controls / effects.** Keep task/model/executor/judge/network settings fixed; public rubrics can leak through unrestricted network, a documented upstream occurrence. Grader failure cannot establish zero quality. Effects are external grading calls and evaluation/report artifacts, not owner acceptance.

**Binding / evidence.** harness2/core/judge.py:15-18,61-143; harness2/core/report.py:80-165; docs/EXPERIMENTS.md:64-109. S; E verifies failed selection never invokes scoring. No professional benchmark or ABG head-to-head results were generated.


## Boundaries

The library improves future improver context by retaining adopted full harnesses and reflected lessons. It does not rewrite the fixed scheduler/decision algorithm or model weights. Completed, delivered, selected, externally graded and semantically accepted retain different meanings.

No new tests, benchmarks, model calls or operational effects were performed. Cost advantage, convergence, learned-lesson causality, supported scale and a Harness-over-ABG implementation remain unqualified.

