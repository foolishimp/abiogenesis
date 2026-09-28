# Closed core52 phase analysis

**The shared contraction materially reduced observed decoder allocation churn; installed acquisition, selected projection and close completed. Peak memory remains high, and the warm Run's OOM is not proved cured.** [Result](result.json) retains zero errors, 137,417 authenticated events, the unchanged 1,388,245,432-byte prefix `409a23df…` / genuine coordinate `67a75b13…`, and the selected Run's 254-event **active/nonterminal** view `6dfd0580…`. This is the existing installed owner projection discriminator, not a complete Public-read or new Run claim.

[Machine counts and exact input hashes](analysis-counts.json) separate actual phase timers from time-delta-weighted CPU samples and GC trace counters:

| Actual phase | Wall seconds | Canonical self seconds | Hash-update self seconds | GC pause seconds | Reported allocation GB |
|---|---:|---:|---:|---:|---:|
| Cold acquisition | 28.439 | 13.633 | 7.703 | 2.415 | 51.252 |
| Prefix selection | 1.550 | 0 | 0 | 0.067 | 5.480 |
| Selected Run projection | 9.790 | 5.115 | 2.777 | 0.803 | 16.022 |
| Close | 0.000589 | No sampled work | No sampled work | 0 | Not separately resolved |

CPU attribution follows owner call stacks. GC phase buckets use the first phase-owned samples aligned to trace time through seven matching major pauses (median offset 4.166 ms); their allocation intervals can straddle boundaries. They are approximate phase counters, not exact allocation ownership. Startup/imports contribute 0.014 s GC / 0.236 GB; an **exit** GC contributes 0.083 s / 0.092 GB, not close cost. Total process: **40.24 s real / 42.07 s user / 2.09 s system**, peak RSS **5.193 GB**. No second acquisition appears in this route.

The comparable decoder portion of the prior closed core50 recovery versus core52 acquisition is:

| Decoder observation | Core50 | Core52 |
|---|---:|---:|
| Inclusive sampled seconds | 28.453 | 25.312 |
| Canonical self seconds | 16.336 | 13.633 |
| Hash-update self seconds | 7.657 | 7.296 |
| GC-window reported allocation GB | 130.088 | 51.243 |
| GC pause seconds in that window | 2.262 | 2.414 |

Same frozen input and decoder show **60.6% less reported allocation churn** and **11.0% less sampled decoder time**. This supports the intended contraction; it does not promise a corresponding wall-time, pause or peak-memory reduction. The earlier outer operation also verified its owner artifact (8.388 sampled seconds) and had no selected projection. Whole-process totals are consequently not an equivalent before/after benchmark. Profiling, JIT and process lifetimes also differ.

Memory observations now distinguish the physical buffer from surviving objects. At acquisition end, heap used is **2.407 GB** and array buffers **1.388 GB**. By projection end, array buffers fall to **26.8 KB**, while heap used remains **2.395 GB**. Exit GC leaves **1.901 GB**; heap sampling estimates **1.878 GB** surviving allocations, including **1.605 GB** at `decodeHistoricalEvents`, 62.0 MB at slice sites, 49.4 MB at prefix structure advance, and 34.6 MB at event reconstruction. These are allocation sites, not retaining paths or proof every object is necessary. Core50's 77-MB exit sample followed a different caller lifetime and cannot serve as this history-retention baseline. Peak RSS changed little from 5.289 GB.

Remaining work is concrete. Cold ownership still authenticates the complete physical extent, parses bodies, checks envelopes/causes/stamps and establishes prefix facts; input size alone does not justify every allocation. The prior identified payload-versus-enclosing-event canonical traversal remains at event stamping; this contraction removed intermediate subtree strings, not those two required digest constructions. Selected projection spends **7.099 sampled seconds** under `runtimeEventPrefixDigest`, chiefly through liveness (**4.572 s canonical + 2.349 s hash self**). Prefix selection also traverses immutable values and builds indexes. The profile establishes these costs but not a duplicate invocation count or permission to omit their context/digest obligations. No new optimization or liveness redesign is selected here.

The exercised cold-plus-selected path now completes on core52 with conserved truth. It does not execute the failed warm successor traversal or native assessment; those memory conditions remain unmeasured. LIFE-01 and the >10-second cold phase remain open with improved attribution. Analysis used only closed profile/phase/result files and the earlier retained core50 profile; no history read, acquisition, test, source change, new profile, Run or provider action occurred. Stop for Executive disposition.
