# ABIogenesis technical debt register

Snapshot: 2026-10-23 Australia/Sydney; committed head 2f1393061e4525a55b813c5406ad3cdaed3620d6, with Worker B's unaccepted working tree present.

Read the [analysis](comments/codex/20261022T145146Z_ANALYSIS_technical_debt.md) for the Product Frame, evidence limits and rationale. The fixed 5.0 scope, GTL/HoG/ABG authority split and common-library prerequisite remain unchanged. This is a work-through index over the existing debt, not another execution plan. The [owning T-287 register](tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-debt), its decisions and accepted work grants retain authority. New entries are analysis proposals; registration does not activate a repair or decide release disposition.

Writer grant: the user's request authorizes this file and the linked analysis only. No runtime, ticket, GOALS, design or proof files are changed by this delivery. Functional owners below name the boundary responsible for a repair, not a newly assigned person.

## How to work through it

Select a dependency-ready package with the Executive; reacquire its current source; record the exact grant in T-287; delete the named debt; prove its affected obligations; then link the accepted return here. Preserve original evidence and prior accepted cuts. A trigger below means return for selection, not automatic implementation.

Statuses:

- **Open:** concrete current mechanism, defect or evidence debt; implementation is not activated by this register.
- **In flight:** already assigned in the current repair wave; await its frozen return and acceptance.
- **Conditional:** a known retained form has a compatibility or owner-contract reason; change when the stated trigger applies.
- **Investigate:** the unresolved question is real, but a defect or redundant implementation has not been established.
- **Revalidate:** historical evidence survives; present applicability must be checked before a repair is selected.
- **Closed:** accepted at an exact commit after this snapshot; see the Completion record.

Scope estimates: **S** is one bounded owner/site; **M** spans a mechanism and its consumers/proofs; **L** needs a design/contract decision or several owners. These are relative sizes, not elapsed-time estimates.

All proposed repairs use realization_refactor unless the entry names design_reframe or a contract re-entry. No entry authorizes deleting admitted history, forging fixture authority, changing historical digests, increasing resource limits or adding a parallel runtime.

## Work queue

| ID | Status | Retirement / decision | Size | Dependency or selection trigger |
|---|---|---|---|---|
| [TD-01](#td-01) | Closed | Sparse forward constructor accepts an invalid shape | S | Closed at `0eacd4668`; see the Completion record |
| [TD-02](#td-02) | Closed | Complete B/D and reconcile their claims | M | Closed at `0eacd4668`, accepted `b5b8d0e24`; see the Completion record |
| [TD-03](#td-03) | Closed | Stale binding in extracted-JavaScript test | S | Closed at `0eacd4668`; see the Completion record |
| [TD-04](#td-04) | Open (R10 increment closed) | Missing/machine-bound proof inputs | M | The R10 projection family runs from a clean checkout at `bf117cf92` (S01 inputs packaged, 2.8 MB; see the Completion record). Remaining increments: the D2 store and S01 `call-9.jsonl` (38 MB, above the packaging stop; the owner's evidence-root decision, T-290 Phase C); `m5-consensus-module:2252`; `d1-preserved-result-harness.mjs:20`; `t288-composition-conservation:12` and the two `w2-steel-*-installed` lanes (variables unset); support machine paths in `d2-bounded-harness:9,11`, `declared-testing-capability:18`, `stdo-environment-pilot:153-155`, `d2-evidence-owner-harness:9-10` |
| [TD-05](#td-05) | Open (R10 increment closed) | Obsolete API, copied-prefix and loader fixtures | M | Two obsolete-import lanes and the R10 private name retired at `bf117cf92` (`m5-consensus-module:26`, `t287-wave2-owner-contract-source-set:47`, `outputFor`); `r10-private-owner-harness` kept, no equivalent loader. Remaining increments: `m5-consensus-module` `:385` ×5 (`invalid_actor_process_observation`), `:1572` (reopen payload variant), `:2252` (deleted `public/operations.ts`); wave2 `:611` (deep-freeze reach over schema functions), `:798` (D15 request schema); `t287-native-assessment-evidence:548` |
| [TD-06](#td-06) | Closed | Full held-set scan for an exact clip | S | Closed at `94ca67abf`; see the Completion record |
| [TD-07](#td-07) | Conditional | Full held-set sort for one process-live fact | M | 30 point queries routed at `ea18189e3`; the seven lifecycle sites wait on the owner's reader decision (T-290 Phase C); see the Completion record |
| [TD-08](#td-08) | Open | Repeated causal-support history scans | M | One worksite currentness path selected |
| [TD-09](#td-09) | Open | Repeated C2 full-prefix correspondence work | M | Genuine C1/C2 proof inputs; owner reuse design |
| [TD-10](#td-10) | Conditional | Full replay witnesses built for narrower needs | M/L | Consumer requirement census first |
| [TD-11](#td-11) | Open | Rebuild/deduplicate tool projection every chunk | M | Next worker observation change |
| [TD-12](#td-12) | Open | Eight contextual record readers and repeated hashes | L | Accepted contextual reader design |
| [TD-13](#td-13) | Closed | Remaining key/shape algorithms and overclaimed guards | M | Closed at `50301d557`; see the Completion record |
| [TD-14](#td-14) | Closed | Unresolved JSON-provenance coverage | M | Closed at `8387f70b3` for 47 of 56 casts; the nine (T) held at `shared/` and at the C2 context pin are carried by TD-15 + TD-16; see the Completion record |
| [TD-15](#td-15) | Conditional | Three private persisted-record envelopes | M | Writer change or explicit byte-compatibility task |
| [TD-16](#td-16) | Conditional | Throwing I-JSON compatibility lift | S per caller | Caller refusal channel proved |
| [TD-17](#td-17) | Closed | F_P completion loses the original failure cause | M | Closed at `4bc5a945a`; see the Completion record |
| [TD-18](#td-18) | Investigate | Held-return cold recovery contract | M/L | Selected suspension/resumption proof |
| [TD-19](#td-19) | Open | Recursive proof/evidence copying | M/L | Next proof packaging; historical cleanup separately |
| [TD-20](#td-20) | Open | Conflicting current-status narratives | S/M | Status reconciled 2026-10-23 (Completion record); compaction of T-287 remains |
| [TD-21](#td-21) | Revalidate | Historical reporting/observation gaps | S/M | Next affected caller/report path |
| [TD-22](#td-22) | Revalidate | Caller/install/capacity cost observations | M | Controlled present-day attribution |
| [TD-23](#td-23) | Investigate | Repeated line-boundary mechanics | M | Start with the two event-store loops |
| [TD-24](#td-24) | Revalidate | Remaining inherited assurance/contract questions | S to triage | Exact owning scenario selected |

There are 24 packages: at the snapshot 15 open, one in flight, three conditional, two investigations and three historical revalidation packages; at `b5b8d0e24` three are closed (TD-01, TD-02, TD-03) and 13 open. This is not a count of defects. The 73-row crosswalk below preserves inherited items without counting each historical observation as a new task.

Recommended first sequence: TD-02 plus dispositions for TD-01/03; TD-04/05 for one reliable proof family; TD-06/07; then select one of TD-08/09/11. TD-20 belongs at the same closing checkpoint. The remaining rows are selectable by dependency and benefit, not a mandatory serial program before release.

## Entry details

<a id="td-01"></a>
### TD-01 — Restore the forward constructor's return invariant

- **Evidence / impact:** [worksite_command_forward.ts](../build_tenants/abiogenesis/typescript/code/src/product/worksite_command_forward.ts):134–135 compares nested bindingCoverEventRefs with length and .every, which skips holes. Prior constructor probing found a sparse mutation returns a task rejected by its own guard; current source is unchanged. This is a confirmed S2 contract defect introduced by C. No ordinary dense-input failure or admitted-history bypass was established.
- **Retire:** the partial array comparison. Use complete element admission or admitted canonical comparison, keeping the owner's TypeError channel.
- **Owner / frame:** Product forward-task owner; constructor/admission frame. Existing review finding, not assigned by D12/D14. Trigger: explicit current-wave disposition.
- **Closure:** valid dense input succeeds; the same fixture with sparse nested references throws; every returned task passes its own guard, including after JSON round trip. Test the exported constructor.
- **Disposition boundary:** current repair decision required. This register does not decide whether the normal dense path permits deferral.

<a id="td-02"></a>
### TD-02 — Finish the existing B/D repair and evidence handoff

- **Evidence:** [step-8.md](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md), B activation at line 1702, and [plan D12–D14](comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md). At acquisition B is dirty with no returned/accepted cut. D14 is accepted for D after B.
- **Retire through B:** per-advance fold-state copying; loss of final helper lifetime facts/cause across the helper/parent/failure boundary; the four realm and four valueless-result cases; inaccurate O-SCHEMA/helper documentation and incomplete pre-plan attribution. Preserve branch/fork isolation and A's correct time cuts.
- **Retire through D:** the live prefix instance encoded as an empty record in five lifecycle failure subjects. Carry the outcome's own durable coordinate, Run selector and selected digest/count/ordinal; retain an earlier nested outcome cut. This is a prospective representation change. Existing replay-state fields already bind history; D adds no subject retention.
- **Owner / re-entry:** the already assigned B Worker and Executive; then D's lifecycle owners under the accepted contract decision. No second implementation lane is activated here.
- **Closure:** accepted exact B return, affected owner/installed/cold-path evidence, final red-lane disposition; then all five D projections through recursion and workflow admission, two Run selections over one physical prefix, and preserved earlier cut. Historical event bytes/digests remain unchanged.
- **Boundary:** the existing library prerequisite governs these selected obligations. Neither a green local lane nor this register closes them. TD-03 remains separately stopped outside B's grant.

<a id="td-03"></a>
### TD-03 — Repair the new extracted-code test seam

- **Evidence:** [t287-reacquisition-root-contract.test.mjs](../build_tenants/abiogenesis/typescript/test_env/tests/t287-reacquisition-root-contract.test.mjs):16–24 extracts emitted JavaScript into new Function with hand-bound dependencies. Step 4 added canonicalEquals to the extracted implementation; the test does not bind it. B's [attribution](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8-run-postclose-attribution.md) reports this as the one introduced seam among 68 extra red lanes, with a scratch correction recovering the baseline's one pass/one skip.
- **Retire:** the missing binding immediately; avoid making extracted implementation text the continuing owner contract. The broader copied-loader family is TD-05.
- **Owner / frame / trigger:** test owner, proof-validity frame; explicit small test-file grant because B stopped outside its territory. Related existing ID: NW-REACQUISITION-ROOT-01 / CW-P02.
- **Closure:** the actual lane reaches its assertions under current built source and retains justified skips/refusals. Source semantics and installed behavior are not inferred from the scratch probe alone.
- **Boundary:** this is a refactor-introduced test regression, not a baseline-red exemption or demonstrated production semantic regression.

<a id="td-04"></a>
### TD-04 — Make selected proof inputs reproducible

- **Evidence:** [d1-preserved-result-harness.mjs](../build_tenants/abiogenesis/typescript/test_env/support/d1-preserved-result-harness.mjs):19 loads a missing preimage; [d2-evidence-owner-harness.mjs](../build_tenants/abiogenesis/typescript/test_env/support/d2-evidence-owner-harness.mjs):9 retains displaced historical paths; [r10-projection-contracts.test.mjs](../build_tenants/abiogenesis/typescript/test_env/tests/r10-projection-contracts.test.mjs):22 uses an absolute machine path and physical coordinate. B's attribution required 218 ignored historical fixture files to reproduce one baseline lane.
- **Retire:** accidental dependencies on another checkout, ignored scratch trees and historical directory layout in active tests. Package a finite input manifest through existing fixture/collection owners. Preserve original physical identities in historical evidence; obtain truthful new coordinates for new executions.
- **Owner / frame:** proof and evidence-packaging owners; existing CW-P01 / stale proof-suite basis. Trigger: before relying on the selected family. One family per increment.
- **Closure:** a clean checkout with declared dependencies reaches the intended positive and negative owner branches; no ad hoc copied workspace or hardcoded developer path is needed. List exactly which formerly load-failing assertions now execute.
- **Boundary:** baseline attribution establishes provenance of failure, not coverage. This is a blocker for a claim relying on those unexecuted assertions, not automatically for every unrelated accepted path.

<a id="td-05"></a>
### TD-05 — Retire obsolete fixture contracts and copied loaders

- **Evidence:** [m5-consensus-module.test.mjs](../build_tenants/abiogenesis/typescript/test_env/tests/m5-consensus-module.test.mjs):26 imports retired ROOT_PUBLIC_OPERATION_IDS; [t287-wave2-owner-contract-source-set.test.mjs](../build_tenants/abiogenesis/typescript/test_env/tests/t287-wave2-owner-contract-source-set.test.mjs):47 expects removed ReleaseSnapshotPort. The [step-8 record](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md):1053–1075 records stale inventory and load failures. [r10-private-owner-harness.mjs](../build_tenants/abiogenesis/typescript/test_env/support/r10-private-owner-harness.mjs) and historical-source test support retain separate VM-loading assumptions.
- **Retire:** obsolete API/count assertions, copied loader mechanics where equivalent, and cloned-prefix append fixtures that violate current nominal append authority. Do not restore retired production APIs or weaken authority to keep old tests green.
- **Existing IDs:** TEST-PUBLIC-LEGACY-01, TEST-EC-LEGACY-ASSERTIONS-01, TEST-GRAPH-ASSERTIONS-01, TEST-DESCRIPTOR-LOADER-01, NW-C0-FIXTURE-APPEND-01, CW-P02, TR-C1-BINDING-COUNT.
- **Owner / trigger:** the selected current DefinitionCall, event-prefix or test-loader owner. Re-entry is realization_refactor of proof construction; a materially different proof claim must be restated.
- **Closure:** genuine positive setup reaches the current owner; negative mutations fail at the intended boundary; obsolete bodies disappear; current inventory comes from its owner rather than a replacement magic number. Disclose controlled component tests separately from admitted-history execution.
- **Boundary:** do not claim complete C0/cold-path coverage while relevant tests fail before their target branch. TD-04 is a dependency where input acquisition fails.

<a id="td-06"></a>
### TD-06 — Stop scanning all held fluents for an exact clip

- **Evidence:** [calculus/fold.ts](../build_tenants/abiogenesis/typescript/code/src/abg/calculus/fold.ts):222–229 copies/enumerates holds for every clip. [axioms.ts](../build_tenants/abiogenesis/typescript/code/src/abg/calculus/axioms.ts):814/854 creates distinct stdout fluents and exact inactivity clips. N accumulating stdout/probe pairs can cause quadratic held-entry visits. This is structural analysis, not timeout attribution.
- **Retire:** whole-map enumeration for an exact fluent identity. Use the existing map/owner; preserve enumeration for actual wildcard patterns.
- **Owner / frame:** fold mechanics and Event Calculus; related CALCULUS-BASIS-01 / LIFE-01. Trigger: after B's accepted accumulator cut; scope S.
- **Closure:** same transitions and clipped order at cold/warm/fork cuts, same absent/present refusals, and an exact-clip visit counter independent of unrelated held-population size. No new global mutable store.
- **Boundary:** semantics-preserving contraction proposed; no new timing threshold or release gate.

<a id="td-07"></a>
### TD-07 — Answer exact liveness queries without materializing all held state

- **Evidence:** [runtime_liveness.ts](../build_tenants/abiogenesis/typescript/code/src/abg/runtime_liveness.ts):840 asks for one actor_process_live fact through deriveRuntimeHeldFluentProjection; [event_calculus.ts](../build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts):280–284 copies and sorts the full held collection before filtering.
- **Retire:** full projection/sort at point-query consumers. Expose the exact current/historical read from the existing fold owner, retaining complete projections for callers that actually request them.
- **Owner / re-entry:** Event Calculus and liveness owners; design_reframe if the accepted owner API must change. Existing CALCULUS-BASIS-01 / LIFE-01. Depends on B; keep A's at_prefix versus before_event distinction and nested-read invariant.
- **Closure:** current, historical and prospective queries match the existing semantics; one exact query does not allocate/sort unrelated fluents; full projection order remains unchanged.
- **Boundary:** no deletion of genuine historical cuts or isolated forks. This is a cost finding, not a claim that A's temporal repair failed.

<a id="td-08"></a>
### TD-08 — Acquire worksite causal support once at its owning cut

- **Evidence:** [event_calculus.ts](../build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts):100 acquires broad worksite-observation-dependency support; [axioms.ts](../build_tenants/abiogenesis/typescript/code/src/abg/calculus/axioms.ts):543 filters prior events per cause; [native_work_effect.ts](../build_tenants/abiogenesis/typescript/code/src/abg/native_work_effect.ts) centralizes authentication but does not remove every surrounding scan.
- **Retire:** repeated per-cause support filtering and reacquisition in the chosen worksite path. Index or reuse support inside the existing immutable-prefix/calculus owner, preserving causal relation semantics.
- **Owner / frame:** Event Calculus and worksite/currentness owners; CALCULUS-BASIS-01, Causal lookup scans, NW-CURRENTNESS-01. Trigger: select one currentness path; M initial contraction, not all history readers.
- **Closure:** cross-Run/path isolation, unknown affectedness, withdrawal, later re-establishment and rollback remain correct; counted support work grows with relevant additions instead of cause-count times the entire dependency list.
- **Boundary:** no cache treating old history as fresh physical truth. The earlier shared native-work relation is retained as an improvement.

<a id="td-09"></a>
### TD-09 — Reuse authenticated C2 prefix correspondence

- **Evidence:** [execution_basis.ts](../build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts):797–805 materializes/admit-compares full selected and durable event arrays; [event_store.ts](../build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts):1850 finds/slices the durable prefix. The C2 materialize correction repaired representation, not this cost.
- **Retire:** repeated complete-prefix reconstruction/comparison when an authentic owned correspondence is already established.
- **Owner / re-entry:** execution-basis and event-prefix owners; CALCULUS-PREFIX-01, CALCULUS-APPEND-01, LIFE-01. Select an owner reuse design; copied, foreign, stale and profile-mismatched inputs still need appropriate checks.
- **Closure:** genuine C1/C2 positive reach plus refusal cases; repeated reads of the same authenticated cut avoid full copies/comparisons; digest/count alone never grant append or prefix authority.
- **Boundary:** no claim that this caused the P5 timeout. TD-04/05 may be needed to obtain trustworthy fixture reach.

<a id="td-10"></a>
### TD-10 — Avoid requesting full replay witnesses where a narrower owner result suffices

- **Evidence:** [replay.ts](../build_tenants/abiogenesis/typescript/code/src/abg/replay.ts):955 already caches a same-cut result; changed cuts still stream selected history at :1431 and serialize the complete body at :2312. The [design](../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md) §4.4 defines the full witness. Production CCall consumes it.
- **Retire only if proved:** construction at consumers whose actual obligation is a fact or selected cut. First inventory those consumers; do not change complete-witness digest semantics to make it cheaper.
- **Owner / re-entry:** replay/CCall owners; CALLER-DURABLE-CONTEXT-01 / LIFE-01. M for consumer contraction; a persisted-contract change would be L and requires its own authority.
- **Closure:** each migrated caller has the same owner result/refusal without constructing unneeded full witnesses; persisted witness consumers retain byte/digest and cold-recovery compatibility.
- **Retention rationale:** full-witness cost is required where that witness is the contract. Its removal is conditional, not a universal optimization obligation.

<a id="td-11"></a>
### TD-11 — Maintain tool-output projection incrementally

- **Evidence:** [worker_transport.ts](../build_tenants/abiogenesis/typescript/code/src/abg/worker_transport.ts):263–346 accumulates rawToolInvocations, reconstructs snapshot arrays and deduplicates with repeated find; observe calls snapshot for every chunk. [actor_process.ts](../build_tenants/abiogenesis/typescript/code/src/abg/actor_process.ts):1252 consumes progress/result observations.
- **Retire:** repeated full projection and pairwise deduplication of old tools on every new chunk. Maintain unique/conflict state in the same observer and form immutable complete evidence at required cuts.
- **Owner / frame:** transport observation owner; Native stream-observation volume / CW-R02. Trigger: next selected observer contraction.
- **Closure:** arbitrary chunk splits, retries/duplicate IDs, disagreements, StructuredOutput exclusion, partial lines and final drain retain behavior; counted old-tool visits no longer repeat for every chunk.
- **Boundary:** do not drop admitted progress/events or alter liveness policy. No elapsed-time share is established. Line framing is separately investigated in TD-23.

<a id="td-12"></a>
### TD-12 — Complete contextual admitted-record acquisition consolidation

- **Evidence:** [exact_record.ts](../build_tenants/abiogenesis/typescript/code/src/shared/select/exact_record.ts):12–18 has static digest/project callbacks without typed runtime context. [step-5.md](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-5.md):244–252/349–359 deliberately retains eight contextual readers. [invocation_execution_truth.ts](../build_tenants/abiogenesis/typescript/code/src/abg/invocation_execution_truth.ts):261–350 and [c_call_outcome.ts](../build_tenants/abiogenesis/typescript/code/src/abg/c_call_outcome.ts):367–402 illustrate the repeated acquisition. Current bounded adoption is 18 literal calls in seven files.
- **Retire:** the eight repeated select/filter/exactly-one/validate/authenticate/project sequences through an accepted contextual composition. Also eliminate demonstrated second hashes after checked acquisition in execution_basis.ts:1353–1367 and :1393–1407.
- **Owner / re-entry:** shared selection plus affected ABG fact owners; design_reframe. Existing CALCULUS-BASIS-01 / causal-lookup debt; L because policy ownership must remain explicit.
- **Closure:** zero/multiple/malformed/wrong-digest/context-mismatch cases preserve their owner channels; source bodies and redundant hashes are deleted. Arbitrary callbacks must not hide a rival admission policy.
- **Boundary:** eight is the documented retained set, not a claim every reader is already censused. The earlier 212-site survey was heuristic discovery, not 212 defects.

<a id="td-13"></a>
### TD-13 — Remove remaining key/shape duplication and trace overclaimed guards

- **Evidence:** [traversal_transition.ts](../build_tenants/abiogenesis/typescript/code/src/abg/traversal_transition.ts):86–94 repeats the shared sorted-key algorithm. [artifact_truth.ts](../build_tenants/abiogenesis/typescript/code/src/abg/artifact_truth.ts):169–170 differs: object {a:1,b:2} with expected keys ["a","a"] passes its private version but fails the shared atom. No live duplicate-key caller was established.
- **Further evidence:** seven local named isJsonRecord guards remain. Five refine typed JSON. [recursion_lifecycle.ts](../build_tenants/abiogenesis/typescript/code/src/hog/recursion_lifecycle.ts):139–143 and [workflow_lifecycle.ts](../build_tenants/abiogenesis/typescript/code/src/hog/workflow_lifecycle.ts):135–139 claim recursive JSON from unknown after only an outer-shape check.
- **Retire:** identical private bodies; for a differing body, name its owner-domain distinction or migrate. Trace the two unknown ingresses, then narrow their input type or admit at the actual boundary.
- **Owner / trigger:** traversal/artifact/lifecycle owners and shared admission; O-SHAPE / O-KEY. Next selected owner contraction, after D where source overlaps.
- **Closure:** key-counterexample behavior is explicitly decided, ingress premises are source-linked, null/throw channels survive, private equivalent bodies disappear.
- **Boundary:** unsound predicates in isolation do not prove an unsafe live path. D10's intentionally shallow default-library schema is not reopened.

<a id="td-14"></a>
### TD-14 — Finish JSON provenance coverage beyond the selected census

- **Evidence:** [C census](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/post-close-repair-c-census.tsv) and [C return](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md):1310/1667 record 2,951 casts, 2,737 selected sink feeds, nine stops and 55 retained outside-census casts. Method receivers, external callees and Maps are known tracing gaps.
- **Counterexample to coverage wording:** [raw_admission.ts](../build_tenants/abiogenesis/typescript/code/src/validator/raw_admission.ts):204 produces a cast result hashed at :209 despite a no-sink tracer classification. Input admission at :184 prevents this example from establishing an unsafe value.
- **Retire:** unexplained producer-to-consumer paths and overly broad completeness claims, not all casts by fiat. Classify remaining sites by type, ingress, site admission or explicit retained owner premise.
- **Owner / frame:** shared admission and each producer owner; O-TYPE assurance. Trigger after B/D resolves its nine designated rows.
- **Closure:** source-linked handling of the 55 sites and known tracer gaps, with malformed-input checks only for changed owner boundaries. Report exactly which universe is covered.
- **Boundary:** 55 casts are not 55 defects. An executed census does not by itself establish whole-repository behavioral conservation.

<a id="td-15"></a>
### TD-15 — Replace three manual canonical envelopes without changing bytes

- **Evidence:** [retry.ts](../build_tenants/abiogenesis/typescript/code/src/abg/retry.ts):6657–6668, [c_call.ts](../build_tenants/abiogenesis/typescript/code/src/abg/c_call.ts):7349–7362 and [replay.ts](../build_tenants/abiogenesis/typescript/code/src/abg/replay.ts):2317–2328 repeat record sorting/delimiters/member writing already owned by [shared/value/record.ts](../build_tenants/abiogenesis/typescript/code/src/shared/value/record.ts):22–38.
- **Retire:** the envelope mechanics through writeCanonicalRecord; retain owner-specific streaming of prefix/replay members.
- **Owner / trigger:** retry, CCall and replay owners; next writer change or selected byte-compatibility task. Design §4.3 explicitly retains these for persisted digest stability.
- **Closure:** exact byte/digest equivalence for finite, prefix and replay records, existing persisted inputs reopen, and laziness plus partial-sink failure behavior survive.
- **Retention rationale:** no current digest mismatch is established. This is maintenance consolidation, not a promised runtime speedup.

<a id="td-16"></a>
### TD-16 — Migrate throwing I-JSON lifts by the caller's failure contract

- **Evidence:** [shared/i_json.ts](../build_tenants/abiogenesis/typescript/code/src/shared/i_json.ts):63–67 delegates to common admission. D4 in the [plan](comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md) / step-8 record retains the compatibility bridge at 22 recorded sites. This is a recorded census, not a fresh promise of an unchanged total.
- **Retire:** each throw lift only where the existing caller can consume the shared refusal/result directly without changing its observable channel.
- **Owner / re-entry:** individual caller and admission owners; S per selected caller. A changed throw/false/null/result contract requires explicit contract treatment.
- **Closure:** malformed-value behavior and original caller outcome are conserved; the caller's compatibility use is deleted; remaining uses retain named reasons.
- **Retention rationale:** the bridge is already one implementation, not a duplicated validator. Installed Product codec comparisons and legitimate one/null adapters are not included as debt.

<a id="td-17"></a>
### TD-17 — Preserve F_P completion causes across the owner boundary

- **Evidence:** [leaf_invocation_port.ts](../build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts):766 catches without the original error; :801 drops the Promise rejection reason. Both totalize to generic implementation_exception after dispatch. The F_D deterministicFailure path at :559–589 already retains stage and sanitized cause.
- **Retire:** loss of the original completion cause at those two F_P paths, using the existing failure/diagnostic route with correct invocation binding.
- **Owner / frame:** leaf invocation owner and failure admission; LEAF-FAILURE-DIAGNOSTIC-01 / NW-DEBT-ADMISSION-DIAGNOSTIC-01. Select after TD-02 to reuse its accepted boundary conventions.
- **Closure:** sync throw and async rejection produce an admitted result whose cold diagnostic identifies the same cause and invocation; sanitize on the existing policy; do not invent new physical process facts.
- **Boundary:** this narrows inherited diagnostic debt. It does not reopen repaired F_D handling or equate diagnostic omission with a demonstrated incorrect success outcome.

<a id="td-18"></a>
### TD-18 — Establish the held-return recovery dependency contract

- **Evidence:** [traversal_completion.ts](../build_tenants/abiogenesis/typescript/code/src/hog/traversal_completion.ts):29 retains graphs/contracts/calls/apps/cursors/input; [parent_rehydration.ts](../build_tenants/abiogenesis/typescript/code/src/hog/parent_rehydration.ts):109/178/326 revalidates/reconstructs and reads the durable prefix; [graph_execute.ts](../build_tenants/abiogenesis/typescript/code/src/hog/graph_execute.ts):1015 resumes. Library design §9.4 leaves the recovery question explicit.
- **Decide before deleting:** for every retained field, identify admitted recoverable content, immutable definition input, or warm owned state. Process-local state required for cold recovery has not been proved by this analysis.
- **Owner / re-entry:** HoG continuation and ABG recovery owners; CALCULUS-BASIS-01 / FRAMED-RECOVERY-01. M for the trace, L only if an actual missing durable contract requires repair.
- **Closure:** nested workflow/recursion warm and cold paths preserve inputs, completed work, remaining obligations and failure cuts; redundant state can be deleted without reconstructing a second runtime.
- **Boundary:** retained state is not debt merely because it is state-shaped. D14's subject representation change does not close this recovery question.

<a id="td-19"></a>
### TD-19 — Stop recursive evidence copying; inventory historical retention

- **Evidence:** tree census at 2f1393061, restricted to .ai-workspace/comments and work/T287_COMMON_LIBRARY_DELIVERY_01: 85,492 paths, 40,256,058,637 logical bytes, 36,689,352,631 distinct-blob bytes, 3,566,706,006 bytes of additional identical-blob copies. See the [analysis](comments/codex/20261022T145146Z_ANALYSIS_technical_debt.md#evidence-volume-is-measurable-disposability-is-not).
- **Retire first:** recursive copying of prior proof/build trees into new cuts. Retain finite required inputs through immutable manifests/references and existing collectors. Historical relocation/deletion is a separate L task after reference inventory.
- **Owner / frame:** evidence packaging and proof owners; CALLER-EVIDENCE-VOLUME-01 / LIFE-01. Trigger: next proof package, with TD-04's reproducibility requirement.
- **Closure:** one exact package opens and reruns with declared finite inputs; repeated packaging does not copy unrelated predecessor trees; references, digests and needed recovery evidence remain resolvable. Inventory before any deletion.
- **Boundary:** logical tree bytes are not pack size, runtime elapsed time or disposable bytes. No historical cleanup is authorized by this register.

<a id="td-20"></a>
### TD-20 — Make current disposition compact and consistent

- **Evidence:** GOALS, T-287, the plan and step-8 records contain closure statements for different cuts. C's return acknowledges overstated O-TYPE scope; D14 moved from awaiting Jim to accepted, while B's closing text is still in motion. At acquisition T-287 is about 576 KB, GOALS 84 KB and library design 104 KB.
- **Retire:** repeated competing current-status narratives and repeated intake of completed execution detail. Maintain one compact current disposition in the owning ticket, link it from GOALS/read models, retain historical returns under exact-cut headings.
- **Owner / frame:** T-287 Executive and separately activated documentation Writer; Execution-ticket context growth. Trigger: B/D acceptance checkpoint; dependency TD-02.
- **Closure:** status, cut, remaining obligations, test limits and next selected work agree across current surfaces; history is preserved and accessible; this register links accepted closures instead of becoming a second authority.
- **Boundary:** do not edit old evidence into a successful outcome. The size figures are maintenance evidence, not measured model latency.

<a id="td-21"></a>
### TD-21 — Revalidate historical reporting and observation debt

- **Existing items:** NW-DEBT-REPORT-COUNT-01, CALLER-PUBLIC-DIAGNOSTIC-01, NW-PREPARATION-OBSERVABILITY-01, NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01, READBACK-ABSENCE helper false failure, GJ-D2-UNDISPATCHED-CURSOR-REPORTING and D2-UNDISPATCHED-REFUSAL-01. Source: [T-287](tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md), management rows and named later capsules.
- **Known current limit:** [worksite_command_helper.ts](../build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts):865–898 intentionally derives accepted testcase counts rather than trusting aggregate XML attributes. An old aborted-suite report cannot justify blindly accepting those aggregate counts.
- **First action / retirement:** reproduce one present owner path, classify its supported report/diagnostic contract, then remove the surviving ambiguity or record the accepted closure. Check whether current undispatched diagnostics already satisfy the older capsule before changing them.
- **Owner / trigger:** report, caller projection or leaf-failure owner as applicable; next selected affected path. Reporting-contract changes require owner design/contract re-entry.
- **Closure:** actual reported input and admitted output agree under the current contract, including supported aborted-suite/absence/cause cases; cold consumers can interpret the result. Link closures for rows no longer applicable.
- **Boundary:** these are retained obligations needing refresh, not seven newly verified production defects.

<a id="td-22"></a>
### TD-22 — Attribute present caller, installation and capacity costs

- **Existing items:** INSTALL-VERIFY-COMPUTE-01, CALCULUS-SETUP-VOLUME-01, CALLER-DURABLE-CONTEXT-01/LIFE-01, CALLER-EVIDENCE-VOLUME-01, NW-CALLER-PREPARATION-LIFETIME-01, NW-DEBT-CONFORMANCE-COST-01, NW-DEBT-INVOKE-COST-01, Design execution cost, Mechanical context repetition and Fresh sandbox setup cost.
- **Evidence limit:** T-287 has substantial historical byte/time/RSS observations, but earlier accepted reuse repairs and this consolidation changed relevant paths. They establish past cost, not current causation. Current source mechanisms have their own TD-06–11 entries.
- **First action / retirement:** select one meaningful installed scenario, separate initialization/native work/selection/admission/persistence/recovery, count repeated acquisition by owner and identify a duplicate relation before selecting a contraction.
- **Owner / frame:** owning caller/install/replay boundary and Executive; trigger is a present costly selected path. Retain existing finite positive proofs and accepted reuse closures.
- **Closure:** the exact repeated work is removed, owner results/refusals remain, and the same bounded scenario shows the contraction. Record conditions where a new acquisition remains required.
- **Boundary:** no heap/timeout increase, arbitrary universal quota, speculative redesign or blanket performance claim follows from old observations.

<a id="td-23"></a>
### TD-23 — Decide whether shared line-boundary mechanics retire real code

- **Evidence:** worker string framing at [worker_transport.ts](../build_tenants/abiogenesis/typescript/code/src/abg/worker_transport.ts):338–349; whole-history and chunked byte framing at [event_store.ts](../build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts):3313–3327/3564–3598; recovery framing at [worksite_construction_recovery.ts](../build_tenants/abiogenesis/typescript/code/src/abg/worksite_construction_recovery.ts):159–173.
- **Retention distinctions:** worker observes a trailing partial line, durable history refuses it, and recovery ignores incomplete failure evidence. History also preserves physical/logical error precedence.
- **First action / retirement:** test a pure boundary/offset mechanism on the two event-store loops first. Extend only if it deletes another implementation while policies remain with their owners.
- **Owner / re-entry:** event-store owner, then transport/recovery if justified; bounded design_reframe. Related CW-R02, distinct from TD-11's reprojection cost.
- **Closure:** chunk-partition invariance, exact raw offsets/bytes and identical CR/blank-line/UTF-8/tail/first-error behavior, with source deletion; otherwise record a concrete retention reason.
- **Boundary:** four loops are not four proved-equivalent parsers. No parser-merging obligation is established yet.

<a id="td-24"></a>
### TD-24 — Refresh the remaining inherited assurance questions at their trigger

- **Evidence:** the legacy crosswalk below preserves unresolved items that do not yet support a new current repair. These include NATIVE-EVIDENCE-RECOVERY-01, CALCULUS-PROOF-01, DESIGN-REFERENCE-DR01, NW-CATALOG-ORDER-01, C2 coordinate maintenance, canonical development dependencies and TR-ASSESSOR-ROLE-VIEW-INTERPRETATION.
- **Conditional design opportunities:** C2 fixed-command LLM relay and Preconstruction correction/reuse require an actual owner-domain argument. Their presence alone does not establish duplication or authority to remove the worker.
- **First action:** for one selected owning scenario, reacquire its source and exact old evidence, then classify closed, still open, out of scope, or a bounded new counterexample. Route current facts into the appropriate existing package; avoid a general rewrite.
- **Owner / re-entry / trigger:** the original ticket/capsule owner; the old activation trigger or next use of the affected path. Migrate owner-contract decisions through the named frame, not just realization edits.
- **Closure:** every selected row gets a supported disposition and evidence link. Unselected rows remain visible rather than silently dropped.
- **Boundary:** this is triage work. Ordinary unfinished feature qualification, downstream-domain work and explicitly excluded sandbox/security scope are not imported as ABG library debt.

## Inherited register crosswalk

Source: [T-287 Current Management Debt](tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-debt), rows at lines 2006–2078 in the acquired tree. Row names below are preserved verbatim. “Bounded closed” means preserve the ticket's specific accepted correction; it does not assert universal closure. “Refresh” is not a new finding. Source links and historical evidence remain in T-287.

| Existing row / ID | Route or preserved disposition |
|---|---|
| FRAMED-CONTEXT-SOURCE-01 | Bounded closed; do not reopen its demonstrated selector fix. |
| FRAMED-UAT-DEPENDENCIES-01 | Bounded closed; preserve installed producer-dependency evidence. |
| FRAMED-RAW-CONTRACT-01 | Bounded closed for demonstrated supported-row path. |
| FRAMED-NATIVE-SCOPE-01 | Preserve scope note; no new security/sandbox program selected. |
| FRAMED-RECOVERY-01 | TD-18 / TD-24; remaining installed recovery scope requires exact trace. |
| TEST-PUBLIC-LEGACY-01 | TD-05. |
| INSTALL-VERIFY-COMPUTE-01 | TD-22; redundancy not proved by historical cost alone. |
| CALCULUS-SETUP-VOLUME-01 | TD-22; preserve existing phase accounting. |
| CALCULUS-RUN-WORDING-01 | Bounded closed. |
| CALCULUS-BATCH-01 / CALCULUS-INPUT-01 | Bounded closed; do not recreate removed carriers. |
| CALCULUS-BASIS-01 | TD-06/07/08/12/18; distinct remaining mechanisms. |
| CALCULUS-ASSEMBLY-01 | Bounded closed. |
| CALCULUS-BODY-01 | Exact cold-body reuse closed; partial-envelope opportunity remains conditional under TD-22. |
| CALLER-DURABLE-CONTEXT-01 / LIFE-01 | TD-06–11 / TD-19 / TD-22; preserve exact historical observations. |
| LEAF-FAILURE-DIAGNOSTIC-01 | TD-17; F_D cause capture now present, precise F_P remainder open. |
| CALCULUS-PROOF-01 | TD-24; narrowed claim preserved, actual native-intake proof not inferred. |
| D2-ACQUISITION-PROVENANCE-01 | Bounded closed. |
| NATIVE-D2-RESULT-ENVELOPE-01 | Bounded closed. |
| NATIVE-D2-ASSESSOR-PREPARATION-01 | Bounded closed. |
| NATIVE-D2-ANCESTRY-01 | Bounded closed. |
| NATIVE-EVIDENCE-CONTEXT-01 | Bounded prompt/refusal correction closed. |
| NATIVE-EVIDENCE-RECOVERY-01 | TD-24; refresh the historical Evidence-only recovery case. |
| RUN-SCOPE-REFUSAL-01 | Bounded closed. |
| CALLER-PUBLIC-DIAGNOSTIC-01 | TD-21; refresh current caller decoding. |
| NW-F11-SCOPE-COST-01 | Preserve bounded proof/context scope; TD-22 only if new cost selected. |
| S02-RECURSION-RESTORATION-01 | Bounded accepted. |
| S02-RETRY-RUN-PREFIX-01 | Bounded accepted. |
| NW-C0-FIXTURE-APPEND-01 | TD-05; held copied-prefix negative fixtures. |
| INSTALL-LOCK-REUSE-01 | Accepted correction preserved. |
| EC-RECOVERY-COST-03 | Accepted cold-replay reuse preserved. |
| CALLER-EVIDENCE-VOLUME-01 | TD-19/22; current tree census is separate from historical caller traffic. |
| TEST-EC-LEGACY-ASSERTIONS-01 | TD-05. |
| DESIGN-REFERENCE-DR01 | TD-24; refresh selected HOW/materializer relation. |
| TEST-GRAPH-ASSERTIONS-01 | TD-05. |
| TEST-DESCRIPTOR-LOADER-01 | TD-04/05. |
| F11-PRODUCER-CONTEXT-01 | Bounded acquisition-reuse correction closed. |
| F11-APPLICATION-DOMAIN-01 | Preserve qualification scope; unfinished release evidence is not automatically new debt. |
| NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 | TD-22; historical costs are not current attribution. |
| C2 context coordinate maintenance | TD-04/24; preserve exact packaged identity, never rewrite old coordinates. |
| NW-OPERATOR-STOP-BINDING-01 | Accepted source/installed correction preserved. |
| NW-PRODUCT-VERIFICATION-REUSE-01 | Bounded reuse accepted; broader capacity under TD-22. |
| NW-QUALIFICATION-CONTRACTION-01 | Closed removal; do not restore roster/adapters/wrappers. |
| ODD-DOM-01 / NW-RETENTION-01 | Downstream T-043 ownership retained; no ABG domain repair activated. |
| NW-CODEWIDE-REVIEW-01 | Audit closed, findings routed; not another codewide gate. |
| NW-REACQUISITION-ROOT-01 | Preserve prior root correction; new proof seam is TD-03. |
| NW-CATALOG-ORDER-01 | TD-24; refresh old ordering question. |
| NW-CURRENTNESS-01 | Preserve accepted semantics; remaining acquisition cost TD-08. |
| NW-DEBT-AJV-01 | Selected schema correction closed. |
| NW-DEBT-CONFORMANCE-COST-01 | TD-22; finite positive proof retained, original capacity question not generalized. |
| NW-DEBT-ADMISSION-DIAGNOSTIC-01 | TD-17/21; distinguish repaired deterministic and remaining paths. |
| NW-DEBT-INVOKE-COST-01 | TD-22; refresh historical heap/cost evidence. |
| NW-C2-CONTEXT-CONFORMANCE-01 | Bounded producer-selector correction accepted. |
| NW-PREPARATION-OBSERVABILITY-01 | TD-21; refresh source-ready/independence status. |
| NW-DEBT-CHILD-READ-COST-01 | Demonstrated duplicate boundary closed. |
| NW-DEBT-REPORT-COUNT-01 | TD-21; owner report contract before count changes. |
| NW-DEBT-QUAL-COST-01 | Preserve bounded AF22 acceptance; F11 is a separate qualification scope. |
| Design execution cost | TD-22; historical timeout is not current causal evidence. |
| Mechanical context repetition | Accepted output contraction preserved; input opportunity conditional TD-22. |
| Native output/budget continuation | Preserve observation and CLI ownership; not proof of a billing cap or ABG defect. |
| Causal lookup scans | TD-08/12; earlier loops require revalidation before re-reporting. |
| Snapshot copies/ancestor walks / CALCULUS-PREFIX-01 / CALCULUS-APPEND-01 | TD-09; isolated forks remain legitimate unless redundant copying is shown. |
| Stale rival-authority / proof-suite basis | TD-04/05; existing CW-P01/CW-P02 identities retained. |
| C2 fixed-command LLM relay | Conditional TD-24; current worker-executes ownership is not automatically duplicate computation. |
| Canonical development dependencies | TD-24; current install issue unverified, do not replay old missing-dependency claims as current. |
| Public read provenance (TRUST01-R1, S3) | Accepted source / OWNER-REUSE-01 relation preserved. |
| Fresh sandbox setup cost | TD-22; historical observation needs attribution. |
| Native assembly retained-input resolution | Bounded source/installed correction accepted. |
| NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01 | TD-21; refresh missing path/digest join claim. |
| Product versus install inventory (ENV01) | Closed. |
| Native stream-observation volume | TD-11 / CW-R02; current per-chunk reprojection mechanism confirmed. |
| READBACK-ABSENCE helper false failure | TD-21; refresh affected caller. |
| Preconstruction correction/reuse | Conditional TD-24; unselected composition opportunity. |
| Execution-ticket context growth | TD-20; current source supports maintenance concern. |

Later capsules outside that table remain visible:

| Existing capsule | Route |
|---|---|
| TR-ASSESSOR-ROLE-VIEW-INTERPRETATION | TD-24; old role-local null interpretation, no current outcome-loss claim. |
| TR-C1-BINDING-COUNT | TD-05; derive the actual current contract inventory. |
| TR-DOC-RC6-LINK | Requirements README now routes through the selected Product Definition. Preserve that correction; any remaining old ticket-navigation links belong to TD-20. |
| GJ-D2-UNDISPATCHED-CURSOR-REPORTING | TD-21; refresh exact reporting boundary. |
| D2-UNDISPATCHED-REFUSAL-01 | TD-21; inspect current cause handling before reactivating old finding. |

## Closures and intentional retention that must not become new debt

- Retain the shared process lifetime, causal/currentness and selected-occurrence gates; their existence is real consolidation.
- A's explicit liveness cuts, three raw-dispatch ingress admissions and consensus reference-array admission are repaired at its accepted cut. Future regressions need new evidence.
- C's type/ingress/site classifications are substantial evidence within the declared census; do not recast all removed casts as unresolved.
- The thirteen local exactly-one algorithms are retired. Owner null/throw adapters are not another selection algorithm.
- The installed Product's two equality comparisons use its selected codec deliberately. Single-argument digest aliases are not canonical envelope writers.
- Fork isolation, complete recorded witnesses and digest-bound prefix projections have owner meanings. Delete only demonstrated redundant work around them.
- Existing bounded test/reuse/diagnostic closures in the crosswalk remain closed. T-247/T-248 and other ordinary remaining release work are tracked in their owning tickets.

## Completion record

At this snapshot no implementation entry is closed by this document. For each subsequently accepted package, add: exact commit/subject, retired bodies or dependencies, affected proof return, retained exception and Executive acceptance link. Update only the changed package and current summary; preserve this acquisition's evidence and historical crosswalk.

### Reconciliation at `b5b8d0e24` (Executive, 2026-10-23)

Repairs B (`d8cf6b5d9`, accepted at `3dbd3cd2f`) and D (`0eacd4668`, accepted at `b5b8d0e24`) landed after this snapshot. The library is closed again at `b5b8d0e24`. The acceptance record is the plan post Ledger and the restated [closing post](comments/claude/20261022T060245Z_CLOSE_library_consolidation.md); the step record is [step-8.md](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md). Nothing is pushed.

| Package | Closed at | Retired | Proof return | Acceptance |
|---|---|---|---|---|
| TD-01 | `0eacd4668` | the length-and-`.every` comparison in `worksite_command_forward.ts`; the candidate is admitted through `admitJson` and compared with `canonicalEquals`; the TypeError channel is kept | `forward-command-contracts.test.mjs` sparse negative beside the constructor cases (9/9); census of every `canonicalEquals` call repair C changed, 867 rows, one structural, this one ([tsv](work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/post-close-repair-d-comparison-census.tsv)) | step-8.md `## Disposition of repair D` |
| TD-02 | `d8cf6b5d9`, `0eacd4668` | B: the per-advance fold-state copy; the four realm sites (D12 as realized); the four valueless-result lookups (D13); the O-SCHEMA and `presentMember` records; pre-plan attribution of the 67 lanes. D: the five lifecycle failure subjects carry the outcome's own coordinate, Run selector and selected digest, count and ordinal (D14; no retention claimed); the helper's post-launch failure reaches the admitted leaf failure inline as its `data:` diagnostic reference through actual parent completion (D15, decided after this snapshot; the Product failure value is unchanged) | B: `t287-calculus-fold` streaming case. D: `t287-runtime-failure-diagnostic` 12/12 (five shapes, both admission routes, two Run selections over one prefix, nested cut kept); `t287-worksite-command-execution` whole-path case, 5/5. Final run 48 files, 345 tests, 270 pass, 54 fail, 2 cancelled, 19 skipped; no new red against the previous run | step-8.md `## Disposition of repair B`, `## Disposition of repair D`; plan post Ledger rows post-close B and D |
| TD-03 | `0eacd4668` | the missing `canonicalEquals` binding in the extracted-code seam | `t287-reacquisition-root-contract` 1 pass, 1 skip, the baseline's shape | step-8.md `## Disposition of repair D` |
| TD-06 | `94ca67abf` | the per-pattern copy and scan of every held fluent in `applyStep`; an exact pattern reads its one key (`applyClip`, `fold.ts:188`; `ownedExactRuntimeFluentPatternRef`, `axioms.ts:1600`), a wildcard enumerates the live map | `t287-calculus-fold` 10/10: exact clip 1 visit at N = 8 and 2048 (9 and 2049 before), wildcard 9 and 2049, absent target unchanged; same transitions and clipped order | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-06 disposition`; the never-initiated `runtime_inactivity_asserted` clip is a law question for the owner (T-290 Phase C) |
| TD-07 | `ea18189e3` (partial) | 30 exact point queries at 14 sites in 10 files read `fluentAt` through `runtimeFluentHoldsAtPrefix` instead of materializing and sorting every held fluent; list readers and the full projection unchanged; the seven §4.4 lifecycle sites (`runtime_liveness.ts:840` among them) stay on `holdsAt` because the design and `lint:lifecycle` admit no other lifecycle reader | `t287-calculus-fold` 12/12: equivalence of the exact read and the point query over 15660 reads at every cut, both fluent and pattern forms; a mutant at the previous ordinal fails | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-07 disposition`; the lifecycle reader is the owner's decision with the Executive's recommendation to admit it |
| TD-17 | `4bc5a945a` | the cause-dropping F_P completion catch and rejection handler; both now call the one producer `deterministicFailure` with stage `implementation_completion` and reason `thrown` or `rejected`, the regime taken from the resolution, so the F_D sites are unchanged | `t287-runtime-failure-diagnostic` 14/14: a throwing and a rejecting completion reach the admitted failure whose cold subject carries regime `F_P`, stage, reason, the sanitized cause with its message, `implementationRef` and `inputDigest`; at head both read `not_retained` | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-17 disposition`; retained exception: the `finalize` catch's `malformed_return` keeps the class reference only |
| TD-13 | `50301d557` | the two private key-set bodies (`traversal_transition.ts`, `artifact_truth.ts`; twelve callers on the shared `hasExactKeys`); the seven local `isJsonRecord` guards (266 call sites on the shared `isRecord`); the three `unknown` ingresses traced to typed producers and narrowed (`recursion_lifecycle`, `workflow_lifecycle`, `execution_basis`); the unread held derivation at `worksite_input_provenance.ts:517` and the unused `holdsAt` imports in four files | `t287-common-computational-library` 9/9 with the duplicate-key refusal asserted; the touched owners' lanes identical at head and after (32 failing tests, the same identities); each ingress's function-member negative is a `tsc` error after the change | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-13 disposition`; retained: `execution_basis.ts` reads `value.capabilityGrant` under a `try/catch` whose `false` channel is the contract |
| TD-14 | `8387f70b3` (47 of 56; nine carried) | the 55 casts repair C kept and the one outside its textual matcher (`effectful_invocation_truth.ts:209`), classified (T) 39, (I) 2, (A) 0, (P) 15; 31 removed; the tracer gaps (method receivers, callees outside `code/src`, `Map`, `Set`) traced by hand; `Rule.config` admitted at its parse (`gtl/declarations.ts:50`); the universe stated in the O-TYPE row and joined in `td-14-census.tsv` (2,952 rows) | `m5-c-algebra-validation` 22/19/0/3 with the unsafe-integer and lone-surrogate refusals; 102 lanes identical at head and after (52 red, the same identities, each attributed) | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-14 disposition`; carried by TD-15 + TD-16: `shared/public_function_contracts.ts:753`, `:773`, `:799` (`!isRecord` guard) and `product/worksite_command_execution.ts:166`, `:170` ×2, `:1129`, `:1461`, `:1502` with the C2 pin refresh; kept: the 15 (P) and the helper's `:1329` (I), whose admission is the parent's at `:1786` |
| TD-04 + TD-05 | `bf117cf92` (R10 increment) | the absolute machine path and device-bound coordinate in `r10-projection-contracts` (two S01 files packaged byte for byte, 2,807,078 bytes; the coordinate re-derived by the store owner over the copy, digest, length and profile equal to the historical values); the displaced path in `r10-retained-hello-projection`; the retired imports `ROOT_PUBLIC_OPERATION_IDS` and `ReleaseSnapshotPort` and the private `outputFor` (current owner exports read instead; the D15 callable test's obsolete body deleted) | `r10-projection-contracts` 10/9/1/0 from 1/0/1/0, identical in a clean worktree after `npm ci` and `npm run build`; `m5-consensus-module` 18/11/7/0 and `t287-wave2-owner-contract-source-set` 15/13/2/0 from load failures; the remaining reds are the next increments and two Phase C rulings | [packages.md](work/T290_DEBT_WAVE_01/packages.md) `## TD-04 + TD-05 disposition`; stopped: `r10-child-proof` (38 MB of historical stores; Phase C), `m5-consensus-module:2252` (next increment) |

Triggers now met: TD-06 and TD-07 (B's accumulator is accepted); TD-14 (the nine stopped rows are resolved, four by D12 at B and five by D14 at D; the 55 outside-census casts and the tracer gaps remain); TD-20 (the B/D checkpoint: the closing post is restated in place, and GOALS, T-287, the plan Ledger and step-8 agree at head; the compaction of T-287 remains open). TD-17's "existing failure/diagnostic route" has a realized precedent in D15: `constructRuntimeFailureDiagnosticRef` carries an admitted subject inline and the cold projection reads it. TD-21's helper coordinates (`worksite_command_helper.ts:865–898`) shifted under repair D; the count derivation is `nodeTestPassCount`. The claims in TD-06, TD-07, TD-12 (18 literal calls in seven files), TD-13, TD-14, TD-15 and TD-17 were re-read at head and hold as written. No other package is selected by this reconciliation.

The Reviewer (Codex, 2026-10-23) confirmed the reconciliation, the freeze of `b5b8d0e24` for the independent review and the order TD-06, TD-07, TD-17, TD-13, TD-14, and named one correction: GOALS still described the lifecycle law and the helper’s retention as unimplemented. Discharged the same day (TD-20, status part): GOALS Current Selection and T-287’s Current Delivery Plan (intro, L3 and L5 rows, Current operation boundary) now state the realized rule `actor_process_lifecycle`, the helper’s `processFacts` and D15 route, the withdrawn handoff (D0) and the local commit chain. The compaction of T-287 remains open under TD-20.

Reviewer recommendations on the packages reserved for the owner, recorded for the owner’s decision, not adopted here:

| Package | Reviewer recommendation |
|---|---|
| TD-12 | A bounded design reframe after the review: establish the shared contextual-reader contract from two materially different readers, name the bodies it deletes, then migrate the rest; admission policy stays with its owners. |
| TD-10 | The consumer census first: which callers need only a fact or a cut; complete replay-witness semantics preserved wherever the witness is the contract; no persisted-contract change yet. |
| TD-18 | The recovery trace: for each held field, recoverable from admitted history or legitimately warm; a demonstrated cold-recovery gap is resolved before the recovery path is claimed. |
| TD-19 | Stop recursive copying into future proof packages now; historical deletion waits for an exact retention/deletion manifest of references, required evidence and recoverability. |

The work-through is `tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md` (2026-10-24): its Phase B carries the realization packages in order, its Phase C the packages reserved for the owner, and its Ledger the grants and acceptances; this register keeps the evidence and the crosswalk.
