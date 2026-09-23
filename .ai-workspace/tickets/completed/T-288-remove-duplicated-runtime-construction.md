# T-288 — Remove duplicated runtime construction

- id: T-288
- title: Remove duplicated runtime construction
- type: bug
- ticket_category: ordinary
- status: completed
- goal: GOAL-035
- source_ticket: T-287
- priority: P0 for the demonstrated handoff-overhead defects; assess additional findings separately
- build_tenant: typescript
- change_intent: remove duplicated responsibilities and repeated derivation while preserving the installed Hello path
- change_class: realization_refactor; bounded design_reframe for held internal staging versus physical re-entry
- re_entry_point: accepted ABG realization and its existing owners
- triaged_at: 2026-09-20
- created_at: 2026-09-20
- updated_at: 2026-09-20
- closed_at: 2026-09-20
- executive: /root

## Outcome and ownership

Simplify the ABG execution path through successive, behavior-preserving debt
removals. This ticket owns the removal checklist; [T-287](../active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-prerequisite-plan)
owns the overall Hello/ABG 5.0 delivery order. Paid Hello remains held.
The separate Design actor timeout remains with T-287.

Owner direction: review broadly through a code-construction lens, then remove
one coherent duplication at a time. Review the complete affected producer →
consumer path: duplicate predicates, construction/validation, projections,
indexes, wrappers and obsolete alternate paths. Similar code is not sufficient
evidence of duplication; distinct authority and physical freshness checks remain.

Completion: all eight selected items are accepted within their stated scopes.
The final source/test/design candidate `T288-proxy-fix-cr8ipklh` is independently
assessed and its 81 registered files are canonically applied. [Executive
acceptance and work account](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md)
binds the candidate, cumulative changes, retained reads and evidence limits.
The demonstrated handoff-overhead P0 is closed; no universal optimum is claimed.
The owner rejects a fixed 10× target: each retained observation is justified by
its rule, input extent and authority boundary.

The final Proxy exclusion correction reuses the independently accepted ordinary
installed workflow/scope witness plus affected controls and exact package
comparison. No native run of the final archive is claimed. Earlier accepted
removals and failed attempts retain their identities. The separate Design
diagnosis is complete, but Design execution, live Hello and release remain open
under T-287. Paid runs remain held pending their own exact activation.

The following re-entry and checklist preserve this completed grant's boundaries.

### Selected physical-boundary re-entry

The exact owner-issued held predecessor can support pure internal staging
without a repeated entry hash, provided the existing full post-append check
establishes the real durable successor before publication/return. Raw/copied
entry, zero-append/error return and actual physical/dynamic callback boundaries
retain fresh authentication. No metadata-only authenticity, new runtime carrier,
caller-selected trust flag or terminal-only flush is admitted.

The storage Worker owns the candidate `event_store`, `event_prefix` and
`runtime_derivation` changes plus the exact fresh-entry assertions in
`actor_process::invokeActorProcessWithAssembly`,
`runtime_liveness::admitRuntimeActivityProbe` and
`continuation::admitFhInteractionHold`. The composition Worker owns the
corresponding `traversal_route::admitBlockedRetryTraversalTransition` seam.
A bounded candidate design delta belongs to the operative realization
constitution §5.6.2C, constrained by §5.6.1A and EVENTS-024. The superseded
§5.6.2B T7/T8/T9 topology table is not implementation authority.

Same-length external corruption can be detected at commit rather than before
pure staging; no corrupt successor/effect or unchecked no-append/error result
may escape. Independent assessment must evaluate the complete callback family,
real publication, refusal precedence and rollback. No requirement is weakened.

## Removal checklist

- [x] **D01 — Prefix-only access and repeated reconstruction:** accepted REPAIR-03 removes discarded full replay and reuses derived facts. [Acceptance](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/p0-reconstruction-review.md). Broader overhead was not closed.
- [x] **D02 — Historical liveness refolding:** accepted/applied READ02–04 preserves 6,887 validations while reducing visits from 3,645,877 to 6,945. [Acceptance/application](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#read04-executive-acceptance-and-canonical-application).
- [x] **D03 — Nested proof acquisition and immutable-payload revalidation:** READ05 reuses existing owner values and validates new suffix payloads; focused controls, installed composition and [independent assessment](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/read05-consolidation-review.md) pass. [Accepted and applied](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#read05-executive-acceptance-and-canonical-application).
- [x] **D04 — Paired held-store/read checks:** accepted/applied READ05 consolidates traversal, result/judgment/opening, retry, liveness, closure and child paths while preserving entry, append, effect and changed-child-basis boundaries. Corrected lineage controls and all eleven installed handoffs retain provenance; the failed intermediate remains rejected. [Combined acceptance/application](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#read05-executive-acceptance-and-canonical-application).
- [x] **D05 — Construction-wide recurrence review:** [closed independent review](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/construction-debt-review.md) inspected the affected construction family. Executive records its bounded findings and the evaluated [cross-code follow-up](../../comments/claude/20260920T032443Z_REVIEW_cross_code_compression_t288_d05_candidates.md) below. Source recurrence is not measured CPU attribution or a new correctness blocker.
- [x] **D10 — Remove repeated logical-prefix encoding and redundant digest ingress (C-01):** removes all 1,029 direct event-array encodes /10,070,340,140 bytes from the installed run; existing incremental encoding remains about 19.47 MB. Matching handoffs 122.842→87.762s; effects/Public reads pass. Scoped retry now hashes its existing nominal prefix; its control models semantic eligibility, not a live retry. Independently accepted and applied in the [combined successor](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#d10-d12-d15-accepted-correction-and-canonical-application).
- [x] **D11 — Evaluate transaction-shell recurrence (C-02):** current-source intake finds the three traversal wrappers already consume the staged replay after commit, as applied in READ05. Another discarded full replay is not demonstrated. Their remaining structural-prefix rebuilding belongs to D12; no always-replaying wrapper or further shell rewrite is selected.
- [x] **D12 — Remove repeated prefix structure projection (C-03 residual):** accepted/applied snapshot, seed, materialization and unscoped-scope contractions. Cold/scoped/copied/forked history and invalidation controls remain; the same private scope selection drops 2→1. [Closure](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D15 — Remove duplicate initial-cursor preflight:** the existing checked transaction supplies the predecessor for initial-cursor validation, removing twenty physical reads while preserving ingress/append checks, refusal order, lineage, stale/foreign coordinates, physical tamper and rollback. [Accepted and applied](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#d10-d12-d15-accepted-correction-and-canonical-application).
- [x] **D16 — Select a liveness producer by its indexed identity:** [independently accepted and applied](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#d16-executive-acceptance-and-canonical-application). Complete body equality and transaction/clock boundaries remain. Focused late-prefix comparisons fall 1,103/1,107→1/1; emitted bodies, copied-event acceptance, refusal and rollback results match. Twelve installed actors, effects/verifier and both Public reads pass with identical event-kind populations. Handoffs 88.027→60.275s; [closed return](</Users/jim/Library/Application Support/ABIogenesis/candidates/T288-D16-d86pmrby/worker-return.md>). No clock, lease, timeout or supervision change.
- [x] **D17 — Remove equivalent repeated resolved-lock validation:** initial and residual contractions accepted/applied. The final focused residual reduces complete lock checks 4→3 and binding checks 2→1 without weakening raw predicates. [Closure](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D13 — Review common proof mechanics (C-06):** assessment accepted and closed. Snapshot, scoped-prefix and durable-byte proofs carry different obligations; retain their distinct owners and introduce no generic proof framework. [Disposition](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D07 — Construct native assembly once:** [independently accepted/applied](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/public-read-repair.md#d07-executive-acceptance-and-canonical-application). Ten semantic leaves each build once for preparation and zero times at dispatch; ten historical result-authentication builds remain. Two worksite actors use the standalone path. Seven focused controls and the installed path pass; handoffs 88.021→88.027s establish no timing improvement. Eight production files +87/-24; [closed return](</Users/jim/Library/Application Support/ABIogenesis/candidates/T288-D07-17rvrkcr/worker-return.md>).
- [x] **D08 — Reuse the exact CCall joined outcome:** accepted/applied. Same-prefix phase/result/judgment construction is reused; the corrected global first-ID precedence preserves raw/historical duplicate behavior. [Closure](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D09 — Prepare Public read context once:** accepted/applied. Focused preparation 2→1 and replay-owner entry 4→1; standalone raw ports and fresh acquisition remain. [Closure](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D14 — Commonize equivalent admission helpers (C-11):** accepted/applied. 77 duplicate implementations removed; 93 helpers share 16 equivalent implementations and six distinct predicates remain. No P0 CPU saving is inferred from that count. [Closure](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).
- [x] **D06 — Conjoined repair evidence and rule-proportional physical reads:** accepted/applied; demonstrated overhead P0 closed. Close/child-successor/workflow repeats are removed; retained publication, callback, acquisition, scope, close/reopen work is accounted by rule and extent. Final qualification composes the unchanged ordinary installed witness with the independently assessed Proxy correction; no fresh final-archive run or universal minimum is claimed. [Executive condition assessment](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md).

Check an implementation item only after its removal, affected evidence and
required independent assessment are accepted and the selected source is applied.
Record the result link beside that item; do not duplicate a full run diary here.
New review candidates are not automatic delivery blockers or execution grants;
Executive selects each coherent removal under the parent steel-thread priority.

### Cross-code review disposition

The follow-up reviewed canonical READ02/04 bytes, before isolated READ05.
C-03/C-04a/C-05 therefore overlap D03/D04; READ05 already has a value-bound
native-basis derivation and suffix payload checks. Reassess remaining member-level
authentication using the new counters rather than copying old call counts.
Those static counts are not observed per-handoff work or CPU attribution.

C-01's claimed dead helper has a test caller at
`test_env/tests/m5-event-store-reopen.test.mjs:316`. Any erasure must migrate its
same-length-tamper negative to the retained production boundary. Physical-file
bytes, canonical event arrays and selected scopes are not interchangeable
identities. C-02's proposed unconditional replay return and one-read quota are
not adopted: consumers request only needed projections, and distinct ingress,
append and effect checks remain.

The focused follow-up found no exposed nondurable production store, but active
transactions can hold uncommitted suffixes. `expectedPrefixDigest` contributes to
plan identities, and retry compares complete plans. D04 already migrated the
three outer traversal guards; their existing staged result/commit successor is
reused. D10 preserves logical identities and stale-plan refusal
after unrelated-run appends, staged-suffix changes, same-length physical mutation
and failed-commit rollback; prefix-only consumers must not acquire full replay.

Historical post-D10 intake (superseded for the selected workflow pairs by the
CLOSED predecessor account retained in the completion evidence) separated retained entries from duplication. Child-basis,
scope-opening and foldback held reads establish their own admission entries;
construction-intent reads at opening/completion concern different cuts. A
same-cut completion reread exists in one conditional branch, but its invocation
is not established by these measurements. None of those populations is counted
as removable by D12/D15.

**Outside the current refactor grant:** C-04b requires its separate basis/carrier
design re-entry. C-07 retains both stage/job behaviors pending a Product-obligation
check; selecting a generic Hello does not retire another supported path. C-08
retains installed-Product conservation checks pending a proof of sufficient
replacement confinement. C-09 retains event-profile support pending an owning
contract decision. For C-10 the existing law already requires one ABG truth and
replay projection; current code must first be traced to establish any rival
derivation. No unverified deletion follows. The post's other historical pointers
remain review inputs, not admitted removal items.

## Review basis and iteration

Selected STDO basis: `stdo://releases/v2.5.0-rc.7/`, as bound by
[`stdo_abiogenesis.json`](../../../stdo_abiogenesis.json).
Use the `STDO_REFERENCE_FRAME_BASELINE.md#derived-reviewer-frame` across the
affected construction, supported by `DESIGN_MODULE_METHOD.md` whole-family
Prime contraction, invariant reconstruction, recurrence extraction (§11C) and
functional realization review (§14A). The existing project
[end-to-end and worksite frames](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md)
preserve behavior, ownership and current physical observations.

For each selected item: identify the duplicated responsibility and its surviving
owner; simplify/delete it; run the smallest affected checks and a steel-thread
check at the material composition boundary; record evidence and select the next
item. Reuse still-valid evidence. Required independent review applies at material
checkpoints, not automatically after every helper edit.

Count total work, including held-store reads, payload walks, whole-history
canonical encodes and basis-authentication entries versus actual derivations
per leaf/handoff. Observe existing computation without reserializing to measure.
READ03's retained
comparison is 218.878 s across eleven exit-to-invocation handoffs and 1,031
authenticated prefix reads / 9,512,399,110 bytes; that category excludes other
descriptor reads. Seconds and line counts are complexity diagnostics, not quotas.
Report removed responsibilities and additions/deletions honestly.

Preserve GTL/HoG/ABG ownership, admission, audit facts, current-worksite behavior,
refusals and supervision. No implicit Product redesign, paid retry, timer change,
failed-run rewrite, Git action or release follows from this ticket. A material
authority change returns to its owner; an ordinary realization simplification
continues under the selected bounded grant.
