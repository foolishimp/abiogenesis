# ABIogenesis technical debt analysis

Date: 2026-10-23 Australia/Sydney (source acquisition 2026-10-22 UTC).

## Product Frame and authority

The fixed ABIogenesis 5.0 fifteen-family scope remains selected. This analysis concerns GOAL-035 / T-287's common computational library prerequisite and the debt it was meant to retire. The intended outcome is fewer independent implementations of the same computation, usable by production consumers, with explicit admission, failure and recovery obligations. GTL remains source authority, HoG traverses the selected graph, and ABG-admitted history plus Event Calculus owns runtime truth. This work introduces no runtime, controller, catalog, feature family or release gate.

The governing Product routes are [live state and recovery](../../../specification/PRODUCT.md#live-state-recovery-and-valid-reuse), [computational proportionality](../../../specification/PRODUCT.md#outcome-and-computational-proportionality), and the [common-library prerequisite](../../../specification/PRODUCT.md#common-computational-library-prerequisite). The [selected project frame](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md) and [library design](../../../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md) supply the realization basis. The Product Definition selects channel 3.0.0 with operative installed basis stdo://releases/v3.0.0-rc.1/; its selector is not substituted for that exact basis.

**Bounded Writer activation.** The user's request to analyse and register debt authorizes this post and [TECHNICAL_DEBT_REGISTER.md](../../TECHNICAL_DEBT_REGISTER.md). Codex transitions from analysis/review to Writer for those two documentation files only. No runtime, specification, ticket, plan, proof artifact or Git-history changes are granted. This is commentary and a backlog read model; T-287's Executive retains execution disposition and acceptance.

## Subject and evidence limits

The committed subject is 2f1393061e4525a55b813c5406ad3cdaed3620d6. Repair C is at 99b80d6f5; A is at a1349e50b. B has a moving working tree, and the [plan](../claude/20261021T162409Z_PLAN_library_consolidation_pen.md) now accepts D14 for repair D after B. At the 14:51 UTC acquisition there is a B activation but no B return or acceptance. Nothing here closes B or D.

Read-only analysis covered Product and requirements, the accepted design, the plan and step records, current production paths, test harnesses, existing debt and tracked evidence-tree sizes. Separate calculus, value/selection, and design/evidence assessments were conjoined. No build, test suite, runtime workload or benchmark was run for this documentation task. Test outcomes below are attributed to their existing records, not new independent passes.

Moving evidence sampled at acquisition:

| File | SHA-256 |
|---|---|
| abg/event_calculus.ts | 622af183d424b32dbc5acd5d2ee0ec1e59edec6137a971dae1f623ded6a1c6a7 |
| shared/admit/json.ts | 11ebc91803e2e3d66cfd316c498a2933814e0a4a07fae1fa5f82629383d88235 |
| step-8-run-postclose-attribution.md | 87ef3f73b8d0ee5e4260bc1ee2c7685bcd71606514183cd8bc913a816cba864a |

The [register](../../TECHNICAL_DEBT_REGISTER.md) carries source routes, the work packages, closure criteria and a crosswalk of all 73 rows in T-287's existing management-debt table. It is a bounded inventory, not a claim that every repository defect or cost has been found.

## Assessment

The consolidation should be retained. It has retired substantial duplicate computation. The largest remaining debt is repeated work around those shared computations, incomplete migration of consumers, and proof infrastructure that often fails before exercising its intended path. The remaining work needs deletion and narrower acquisition, not another layer of capability names.

Three distinctions matter:

1. **A shared meaning does not guarantee bounded work.** One fold producer can still scan or sort the entire held set for a point question. One authenticated causal relation can still be called inside repeated history scans.
2. **Baseline attribution does not repair the baseline.** It separates introduced failures from inherited failures. A test that never reaches its body supplies no positive or negative evidence about that body.
3. **A retained variant needs an explicit reason.** Persisted bytes, owner refusal channels, historical cuts and installed Product codecs are real distinctions. A second equivalent key-set body is not.

### What has actually been retired

The step records support substantial reductions: 43 of 44 equality bodies across 648 call sites, the NUL-joined key bodies, thirteen local exactly-one helpers, shared lifetime progression, and common causal/currentness decisions. Those historical counts describe the delivered census, not a fresh count of every present source form.

Current bounded inspection finds 18 literal production checkExactRecord calls across seven files, with eight contextual readers explicitly retained by step 5. Three manual persisted-record envelope writers, two private key-set algorithms and seven named local isJsonRecord guards remain. Those are concrete remaining sites, not grounds to negate the consolidation already achieved.

Repair C's census records 2,951 casts: 2,737 feed the selected equality/digest/admission atoms, classified as 2,347 removable by type, 202 narrowed behind ingress, 179 admitted at the site and nine stopped. Another 159 no-sink casts were removed; 55 remain outside that census. Method receivers, external callees and Map flows limit the tracer. A no-sink label is therefore not a proof of no atom use: raw_admission.ts:204–209 is a demonstrated tracing omission, although its input is already admitted and no unsafe value is established there.

### Remaining correctness and delivery obligations

The sparse forward-task regression remains a concrete open defect at the acquired head. The exported constructor compares a nested array by length and .every; holes skip validation. A malformed sparse input can produce a task its own guard rejects. The ordinary ABG builder supplies dense references, so this does not establish an admitted-history bypass. It does require an explicit repair disposition; the D12/D14 decision did not dispose of it.

B already owns the fold accumulator, helper failure handoff, four realm sites, four valueless-result lookups and final attribution. Keep these as one active repair obligation, not new competing tickets. D14 is accepted prospectively: encode each failure transition's own prefix selection as content, preserving earlier nested cuts. The existing replay-state digest already binds selected history. D14 repairs an empty-record representation; it neither recovers previously retained subjects nor establishes that the entire prior failure lacked a commitment.

A broader diagnostic remainder also survives. F_D's deterministic owner catches now retain stage and sanitized cause. F_P's post-dispatch completion catches still replace synchronous throws and Promise rejection reasons with generic implementation_exception. Register that precise remaining boundary rather than repeating the obsolete claim that every deterministic failure loses its cause.

### Where computation still grows unnecessarily

| Mechanism | Current evidence | Retirement target |
|---|---|---|
| Exact fluent clipping | Every clip copies/enumerates all held entries. Repeated stdout/probe pairs can produce quadratic visits as held stdout facts accumulate. | Exact-key lookup through the existing fold owner; retain wildcard matching where required. |
| One process-live query | The owner materializes and sorts the whole held set before selecting one identity. | Exact keyed current/historical reads; preserve A's at-prefix/before-event distinction. |
| Worksite causal support | Broad dependency acquisition and per-cause filters remain around the shared relation. | Reuse/index support within the existing prefix owner; preserve unknown affectedness and rollback. |
| C2 prefix correspondence | Materialization, full admission/comparison and durable slicing remain. | Reuse an authenticated correspondence where owned, with full checks for genuinely new/foreign inputs. |
| Full replay witnesses | The same-cut cache helps, but changed cuts still serialize full selected history for the complete witness. | First identify consumers that need only a cut or fact; preserve full witnesses where the contract requires them. |
| Worker output observation | Each chunk rebuilds accumulated tool-invocation projections; deduplication itself uses repeated linear find. | Maintain the same observer's incremental projection and emit complete immutable evidence at required cuts. |

These are source-supported cost mechanisms. They are not measurements of their share of elapsed time, and they do not attribute the historical P5 timeout. In particular, fixing B's repeated fold-state copy does not make the entire path linear while these costs remain.

### Fixtures and proof are a debt portfolio

B's unaccepted [attribution report](../../work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8-run-postclose-attribution.md) records 68 red lanes outside the earlier 44-file run: 67 have the same failure set at the built pre-plan baseline, and one is an introduced test seam. The seam extracts emitted JavaScript into new Function but omits the canonicalEquals binding introduced by step 4. It is outside B's grant and remains named for disposition.

Several inherited lanes fail at load on missing preimages, displaced historical directories, removed exports or machine-specific coordinates. The baseline historical-source lane needed 218 ignored files linked in before it could be compared. This is evidence-packaging and test-maintenance debt. It must not be hidden by counting all baseline-red tests as harmless.

The repair direction is to exercise current owners from finite, reproducible inputs. Retire obsolete API assertions and unlawful copied-prefix append fixtures. Preserve original historical artifacts as historical evidence; do not rewrite their identities or restore retired production APIs just to satisfy them.

### Evidence volume is measurable; disposability is not

A read-only tree census at 2f1393061 of only .ai-workspace/comments and .ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01 found:

| Measure | Value |
|---|---:|
| Tracked paths | 85,492 |
| Logical file bytes | 40,256,058,637 |
| Distinct Git-blob bytes | 36,689,352,631 |
| Additional identical-blob copies across paths | 3,566,706,006 |

For example, the same 16,367,505-byte abg-acquisition.json appears 25 times, and the same 14,144,747-byte workspace-create.request.jsonl appears 25 times. Together those extra copies represent 732,294,048 logical bytes. This is neither Git pack size nor a claim that 40 GB is disposable.

The first safe retirement is recursive copying into future proof cuts. Package only required immutable inputs and references. Historical relocation or deletion needs a reference inventory and recovery proof. Current runtime truth, accepted evidence, physical coordinates and digest-bound prefixes cannot be discarded because they are large.

### Debt in the work records

T-287 already contains 73 management-debt rows, plus later deferred-assurance capsules. New review findings have accumulated alongside closure narratives that describe different cuts. At acquisition, T-287 is about 576 KB, GOALS about 84 KB and the library design about 104 KB. These sizes do not prove model latency, but make stale status and repeated context acquisition credible maintenance problems.

The register preserves the old identities and separates confirmed source findings, active repairs, conditional retention and historical issues requiring refresh. Existing bounded closures stay closed. Unfinished release work such as T-247/T-248 is not relabelled technical debt merely because it remains unfinished.

## Recommended sequence

1. Finish the existing B/D acceptance path. Give the sparse constructor defect and extracted-JavaScript test seam explicit dispositions. Reconcile the closing records to the resulting exact cut.
2. Repair one representative current-owner proof path and its missing-input/obsolete-fixture family. This gives subsequent retirements trustworthy evidence.
3. Take the smallest computational contraction first: exact clip lookup and exact process-live reads. Then select one worksite/C2/stream path with a structural work counter and a lawful end-to-end example.
4. Finish common-reader and value-atom adoption. Remove private bodies, redundant digest work and unjustified casts; keep owner policy visible.
5. Stop evidence-copy amplification, consolidate current status, and select compatibility/recovery investigations when their owning paths are next touched.

Each work package closes when the named implementation or dependency is removed or given a concrete owner-domain retention reason, and the affected owner obligations still execute. A renamed wrapper, a new registry row, a passing type check or a baseline attribution alone does not close it.

Use the existing steel thread and affected lanes proportionately. A local data-mechanics change needs its counterexample and affected consumer evidence; a recorded contract or recovery change needs the corresponding cold/installed route. Repeated broad suites without a changed subject add little. This analysis and its register require documentation checks only.
