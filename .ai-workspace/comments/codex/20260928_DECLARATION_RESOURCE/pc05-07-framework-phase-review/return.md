PC05-07 framework phase review — closed, read-only

The **162.381s pre-prompt interval remains materially unattributed**. Existing evidence places it before host execution, but does not partition CPU, I/O, validation, deterministic work, allocation/GC or scheduling. It exceeds the investigation trigger; journal size is not a justification or acceptance. This review does not gate, interrupt or restart PC05-07. At the retained-file checks, no execution-complete receipt existed; no journal range was read.

Observed timing scopes

GLC root: `.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/`.

| Scope | Observed duration | Basis/limit |
| --- | ---: | --- |
| PC05-07 execution basis → prompt persistence | 162.380500s | `pc05-07/execution/execution-basis.json` started21:48:30.242Z; `invocation/archives/fp-fa29af369848375a-prompt.txt` mtime21:51:12.622500Z,466700B. Crosses wall-clock/file timestamps, not a CPU timer. |
| PC05-06 same boundary | 155.457994s | Started21:04:15.182Z; `fp-acf53f1bff5e640d-prompt.txt` mtime21:06:50.639994Z. |
| PC05-06 entire CLI Run | 442.532282s | Closed `pc05-06/execution/result.json`, monotonic caller measurement. |
| PC05-06 outside reported host duration | approximately173.079s | Whole Run minus Root's retained host duration269.453s; includes both pre-host and post-host work. |
| PC05-06 remainder after pre-prompt and host | approximately17.621s | Arithmetic across different timing scopes, not an isolated finish-phase measurement. Includes prompt-to-host gap and post-host admission/closure/return. |

PC05-07 setup is separate: package14.139s, install57.599s, other setup59.174s. `execute.mjs:15–54` validates frozen files/input/topology and prepares transport **before** recording execution-basis.startedAt; that caller preflight and all setup are excluded from162.381s. `:61–66` starts the CLI timer immediately after that record. Native `worker_transport.ts:683–694` writes the prompt before `runProcess`, so provider latency cannot explain the pre-prompt interval. Prompt mtime does not timestamp completion of every subsequent dispatch step.

Volume and boundary duties

The closed `pc05-07/start.jsonl` is44,650,516B. Its root input is4,720,589 compact JSON bytes: originalInput2,580,795; preserved constructionState1,801,246; currentContext328,015; compact sourceSelection1,134. Historical declaration resource17,667,993 and current catalog17,445,134 dominate transport volume. These are distinct historical/current bases; this review has not established that one can be dropped. Immutable declarations stay separate from admitted task/observation data. The entry journal is1,245,912,228B; prior06 appended71,325,743B. Neither physical file size nor JSON volume measures elapsed cost.

The exact installed core47 modules were compared byte-for-byte with the local compiled sources for event_store, run_invocation owner, actor_process and worker_transport. The current path is:

1. CLI transport/admission → `owner_bindings/run_invocation.ts:1225`: one event-resource acquisition. `abg/event_store.ts:3556–3647` opens the exact sink, reads/hashes physical bytes, checks extent/identity, decodes and authenticates history. It then supplies the held validated store; no second cold reopen is selected inside this ordinary Run owner path.
2. `run_invocation.ts:1243–1502`: setup truth, Product preparation, invocation admission, graph materialization/validation, execution basis and open. `:1548–1570` derives authority/runtime prefixes and the admitted leaf port before HoG traversal. Necessary facts include current installed declarations/capabilities and exact Run/input identity; current receipts do not time these separately.
3. Declared preserved-source authentication → native reacquisition/current binding cover → evaluation preparation/computation/join → assessment preparation. Original author/C2 are retained. The framework must establish ancestry, source/currentness and exact child input/output relations; these are not provider work. The recent retained-input component discriminator constructed the assessment task in6.605ms and completed its full synthetic/actual interpretation controls in0.441s, but it bypasses live historical admission and cannot price this installed segment.
4. `abg/actor_process.ts:790–847`: native instruction-basis authentication, assembly correspondence, invocation reconstruction and transport preparation; `worker_transport.ts:683` persists the prompt. No duration counters are retained for these steps.

The named `syncStage`/`asyncStage` wrappers (`run_invocation.ts:207–239`) only classify failures; they record no phase duration. The closed06 successful CLI receipt has no internal timing fields and empty stderr. Existing liveness probes have clock origin/elapsed observations, but their live suffix was not read. Thus **no measured current split** between cold validation and later deterministic traversal can responsibly be supplied.

Repeated work: evidence versus inference

The closed `20260927_FRAMEWORK_COST/runtime-repair-01/return.md` measured one repaired991,116,806B cold reopen24.433s and selected Public truth20.457s. Its profile attributed substantial time to canonical event/payload work, prefix/liveness digests and provenance checks; disk read was not dominant. This is historical mechanism evidence, not a current162s allocation or a linear size estimate. The already-accepted deletions—unused global calculus, redundant whole-event equality and duplicate retained raw admission—remain part of core47; this review does not reopen them.

One concrete small repeat remains visible at `actor_process.ts:805,814`: the same immutable request is canonically hashed for assembly correspondence and again for requestDigest. That duplicate establishes no additional request bytes, but its current cost is unmeasured and there is no evidence it accounts for a material fraction of162s. Source also exposes repeated prefix/provenance projection boundaries; their bases and caches differ, so call sites alone do not prove redundant computation. No new deletion or cache is selected here.

Smallest discriminator

After Root receives terminal/fresh truth, use the **one bounded appended suffix beginning1,245,912,228** to select existing event timestamps/probe clocks for first new admission, Run/root opening, each deterministic child boundary and native actor preparation. Compare those with the existing startedAt/prompt timestamps; do not equate differing clock origins. This can distinguish time before first durable admission from time across traversal without another Run or cold recovery. Treat the extraction as raw diagnostic evidence unless tied to the fresh admitted projection. If that still leaves the pre-first-event interval undivided, the next separately authorized discriminator is one scoped timing of the existing resource-acquisition versus product-prepare boundaries, not a general profiler campaign or runtime observer. Do not add an event, cache, controller or weaker cold check merely to obtain timing.

Closed result: pre-actor concentration is confirmed across06/07; detailed current attribution is unavailable, and the >10s framework residual remains open under CALLER-DURABLE-CONTEXT-01/LIFE-01. Only this return was written. No test, acquisition, provider, history/source/Git mutation or runtime interference occurred.
