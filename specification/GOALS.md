<!-- T292-SCOPE-CUT-AND-F07-REPRICE-001 -->
**Current T-287 / GOAL035 status — the owner cut the 5.0.0 scope; `A5-F07` is repriced to the Executive; the retirements are in progress.** On 2026-11-12 the owner decided the open retirements of the [technical debt register](../.ai-workspace/TECHNICAL_DEBT_REGISTER.md): "retire everything you've maked as retire, everything else is out of scope for 5.0.0 and can backlogged, anything that can be implemented functionally equivalently with the current feature set can be retired also". Under that decision the specification now states the default library's Executive as the standard system program (`A5-F07`, merged at `fb86eb3c9`); the One Surface loop, selected-action admission, the frontier reads, gap re-entry and the Consensus read leave the specification, and Consensus stays the planned 5.1 outcome `A5-F08`. The code reaches that state through the packages of the [retirement plan](../.ai-workspace/work/T292_CONSOLIDATION_01/TD-26_RETIREMENT_PLAN.md); its last package changes the capability register and waits for the reader of recorded install locks to stop judging them by its own register (register TD-77). Retired so far in source: the human-response and resume chain, the STDO-only run-environment shape, the `gate` relation, governed context with its Python adapter, the `abg.codex` CLI and the published adapter exit maps. Capabilities the default library does not use and that the current feature set does not replace (contained construction, branch construction, the semantic job and stage family, result assessment, the witness acts) are backlog and stay in source. Everything is local: nothing is pushed, cut or published. The ledger is in [T-292](../.ai-workspace/tickets/active/T-292-consolidate-and-clean-the-code-base.md).

<!-- T292-CONSOLIDATION-WAVE-SELECTED-001 -->
**Current T-287 / GOAL035 status — consolidation and clean-up wave selected and authorised; technical debt register second edition delivered; first package in flight.** On 2026-11-12 the owner selected consolidation and clean-up of the code base ahead of any new feature ("our next major effort before adding new features to consolidate and clean the code base of tech debt, failed and redundant features, and performance improvements") and authorised the work. [T-292](../.ai-workspace/tickets/active/T-292-consolidate-and-clean-the-code-base.md) carries the wave. Its work list is the second edition of the [technical debt register](../.ai-workspace/TECHNICAL_DEBT_REGISTER.md), entries TD-25 to TD-74 and TD-19, built from a full walk-through of the source, tests, scripts, design notes, specification and repository. Entries the register marks Decision change the Product or the Public contract and wait for the owner's word; the Executive rules the rest from recorded rules. The first package, TD-69, makes the product's identity independent of npm's private state. `5.0.0-rc.12` stays the local, unqualified, unpublished candidate, and RC11 stays the pinned builder. No new feature work, push, publication or qualification is selected.

<!-- RC12-LOCAL-MAIN-INTEGRATION-001 -->
**Current T-287 / GOAL035 status — RC12 built directly by the Executive and integrated into local main; local, unqualified, unpublished; next steps await owner evaluation.** On 2026-11-11 the owner directed Claude (Fable 5.2) to make the RC12 build directly as Executive, and ruled that every worktree is short-lived, merged back to main and deleted. The wait recorded in the next block ended with that direction. The RC12 line `claude/rc12-integration` at `34aafb2c6` is on main through ordinary two-parent merge `99e6085b0` over preservation commit `89ee06e15`: every entry outside the work records equals the RC12 head, and main's records are retained exactly. The merge also brings the RC10 retention, RC11 qualification and RC11 foundation-correction lines. Candidate `5.0.0-rc.12`: cut commit `95da94e725c709b8307b125f20f350861fc1e8a3`, archive `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca`, installed under `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12`. It completed one live Run on the sunny path. Standalone Consensus is unchanged in it. RC11 remains the pinned builder; no pin is selected for RC12. The [ledger](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/LEDGER.md) and the [closing brief, section 15](../.ai-workspace/comments/claude/20261110T232000Z_PLAN_RC12_FEATURES_AND_PLAN_FOR_REVIEW/README.md) record the packages, reviews, open findings and owner decisions. GOAL-035 and T-287 remain Active. No push, publication, qualification or next round is selected.

<!-- RC11-PIN-RC12-WAIT-001 -->
**Current T-287 / GOAL035 status — RC11 operational builder pinned; RC12 WAITING_FOR_OWNER_RESUME.** At the owner's instruction, [exact installed RC11](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-operational-pin-01/BUILDER_PIN.json) is selected to build prospective RC12, remaining local/unqualified/unpublished; RC10's pin remains historical RC11 construction provenance. [RC12 intent](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-operational-pin-01/RC12_INTENT.md) is the role-governed Executive within HoG selecting registered GraphFunctions and framed reviewers, with Consequence as its next-step judgment, ABG admission and evidence/foldback. Consensus as separate workflow governance is superseded; legacy Product/F08/S05 reconciliation is future owning work. Phase3/4 refactors are not the chosen MVP and remain unactivated; deferred 5.1 mechanisms are not collectively selected. Later accepted source `b7cf409fc74eca639525fccbea52e666be7743d4` is preserved for continuation and is not inside RC11; its proof does not transfer to the builder. No implementation/runtime/provider/build/test/release is activated. Prior bodies and qualification/human limits remain; GOAL035/T287 stay Active.

<!-- PHASE2-AB-FINAL-ACCEPTANCE-01 -->
**Current T-287 / GOAL035 status — bounded Phase2 A+B accepted; local checkpoint `b7cf409fc74eca639525fccbea52e666be7743d4` complete.** Root's [final conjunction](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b02/proof-01/ROOT_FINAL_ACCEPTANCE.json) accepts tested source `71b97e13…` and the selected proof. The [closed original unit](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b02/proof-01/EXECUTION_RETURN.json) has 96 passes/six named historical skips, including all 39 M5 cases, 34 evidence IDs and six group rows. Native-b02's HTTP-normal fixture repair preserves native-b01 production; [conservation](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b02/proof-01/PRODUCTION_PROOF_CONSERVATION.json) retains the original accepted lifetime34/helper2/B6/configured-C2 and fresh-replay evidence without summing populations or changing old receipt statuses. Earlier failures, native/Operator deviations and both deferred capsules remain preserved; no net-deletion, performance, general reliability or full qualification claim. GOAL035/T287 remain Active; phases3–4/GC03 are planned and unactivated. Main HEAD/index, installed RC11 and RC10 operational pin remain unchanged; no release/publication is selected. Prior text follows verbatim.

<!-- PHASE2-B-SOURCE-ACCEPTANCE-01 -->
**Current Phase2 B status — bounded source relation accepted; external proof held.** Root conjoined independent source assurance and the retained first-red adapter triage for frozen `97e05ec3`. The original 29/1 red remains; the captured-owner exposure correction preserves owner and assertion semantics. Normal build, helper/B/installed C2/lifetime proof and the original unit once (including all 39 M5 cases) remain pending. No full Phase2, installed, performance or qualification claim; both deferred capsules remain open. See `rc11-effect-phase2-01/native-b01/proof-01/ROOT_SOURCE_ACCEPTANCE.json` under the T287 work root.

<!-- PHASE2-B-PROOF-PREP-01 -->
**Current T-287 / GOAL035 status — Phase2 B source frozen; proof preparation only.** The single native B call closed successfully; its 1,345-row postimage is `97e05ec3` (native-b01/source-freeze.json), pending independent source assurance and external proof. Root selected one fresh normal build, two helper cases, six B cases, one current-archive configured installed C2 positive, whole lifetime, and the original nine-file unit once. That unit must carry all 39 M5 cases and 34 evidence IDs; no standalone M5 repetition. Campaign execution remains held. Accepted A and prior bounded closures stand; both deferred capsules, qualification and publication remain open. RC10 remains the operational builder. Evidence: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b01/proof-01/ROOT_SCOPE.json`.

Current selection: **RC11_EFFECT_PHASE2_A_ACCEPTED_B_PREPARING.** Root [PHASE2-B-PREP-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b01/ROOT_SCOPE.json) selects scoped command/main construction on accepted A `e134103a` / tree `3be03625`, source `1b8bb6c4…`. A remains accepted only for construction/physical-contract preservation: exact R1/R2 probes and28/28 lifetime cases pass; original signal-before comparison stays red. B preparation binds one prospective Opus5.5 xhigh1800s/180s/100-turn author; setup/provider/source effects await exact admission. Joint Phase2 normal-build/helper/configured-C2/lifetime/m5/unit proof remains external and unexecuted for B. Both deferred capsules (RC11-OWNER-FACT-REUSE-PROOF-001 and RC11-LIFETIME-REENTRANT-BOUND-001), historical failures and qualification limits remain open. RC10 stays pinned; delivered RC11 stays unchanged/local/unqualified/unpublished. GOAL035/T287 remain active; no release, installation or later HTTP/worker/GC03 activation. Prior bodies are preserved verbatim.

Current milestone: **RC11_EFFECT_PHASE2_A_ACCEPTED_LOCAL_CHECKPOINT; B UNACTIVATED.** Root [PHASE2-A-FINAL-ACCEPTANCE-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/proof-01/ROOT_FINAL_ACCEPTANCE.json) accepts A construction/physical-contract preservation on tested source `cbc3e527…`: repaired R1/R2 probes pass, whole lifetime28/28 with zero skips; baseline signal-before remains an explicit assertion red. The source/Proof [conjunction](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/source-review/FINAL_CONJUNCTION.md) and [receipts](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/proof-01/OPERATOR_RETURN.json) are exact bounded evidence, not installed/fullPhase2/5.0/S7 qualification or performance/reliability/net-deletion claims. B remains unactivated; RC10 stays pinned and installed RC11 unchanged/local/unqualified/unpublished. GOAL035/T287 remain Active. Earlier failures, six unit skips, synthetic pending-owner limit and RC11-OWNER-FACT-REUSE-PROOF-001 remain open as previously disposed.

**RC11-LIFETIME-REENTRANT-BOUND-001 — DEFERRED_UNEXECUTED_SOURCE_HYPOTHESIS.** Owner: Root. Frames: Owner/Effect/Proof. Evidence: [native04 report](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/WORKER_REPORT.json) and exact pre-A lifetime251–257/current state151–156 routes in [Root disposition](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/proof-01/DEFERRED_ROOT_DISPOSITION.json). The inherited bound reset is unchanged by R2; the ordinary node host uses process.kill(-pid,0) without owner callback, so this is not a blocker to current relational preservation. This is not a waiver of universal bound qualification. Trigger: before adopting a reentrant probe binding or claiming original-request bounds over arbitrary injected hosts. Closure: a controlled advancing-clock reentry case retains original cleanup start and never extends deadlines (immediate may tighten), while counts/currentness/stale-result/seal laws hold. No such experiment ran. Carry into eventual A/B qualification limits. Prior bodies follow unchanged.

Current selection: **RC11_EFFECT_PHASE2_A_R2_PREPARING_AFTER_IMMEDIATE_INTENT_COUNTEREXAMPLE.** Root [PHASE2-A-R2-PREP-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/ROOT_SCOPE.json) selects the narrow four-path successor on frozen native03 `9ef03c33…`. R1 is source-satisfied; separate R2 is confirmed: first-probe exit reentry preserves immediate KILL/200ms in pre-A but native03 defers KILL with300ms. Actual paired observations and all earlier failures remain immutable. Preparation only: setup/provider and A reproof await exact admission; B remains held and joint Phase2 acceptance open. RC10 stays pinned; delivered RC11 is unchanged/local/unqualified/unpublished. Phase1/oracle exact closures stand; deferred owner-fact coverage and other qualification obligations stay open. Prior bodies are preserved verbatim.

Current selection: **RC11_EFFECT_PHASE2_A_R1_PREPARING_AFTER_EXECUTED_PROBE_COUNTEREXAMPLE.** Root [PHASE2-A-R1-PREP-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-03/ROOT_SCOPE.json) selects a narrow realization repair on frozen A `cddcc3bc…`. The successful bounded native A call and 13 controlled passes did not close R1: actual candidate reentry undercounts before sealing and accepts a stale result; baseline first-seal count was correct but its stale continuation performs invalid post-seal work. Both red runs and closed Design/Proof conjunction remain preserved. Four-path repair preparation is active; setup/provider, whole lifetime and B remain held for exact admissions. Full Phase2 acceptance is still joint and open. `RC11-OWNER-FACT-REUSE-PROOF-001` remains deferred coverage before complete retained-fact/currentness qualification under the [peer disposition](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/peer-review-intake/ROOT_DISPOSITION.json); it does not expand A. Phase1/oracle exact closures stand; installed RC11 stays unchanged/local/unqualified/unpublished and RC10 remains pinned. Prior bodies are preserved verbatim.

Current selection: **RC11_EFFECT_PHASE2_A_PREPARING_AFTER_NATIVE01_TIMEOUT.** Root [PHASE2-A-PREP-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-02/ROOT_SCOPE.json) preserves native01’s absolute900s failure and sole prospective plan delta; no implementation or check completed. Closed Design/Proof triage selects A: shared immutable physical transition with synchronous API/snapshot preservation, then B: scoped command/main. Full Phase2 acceptance remains joint and unproved. RC10 remains pinned; Phase1/oracle exact closures remain; old installed RC11 is unchanged, local, unqualified and unpublished. A setup/provider and all new proof remain held for exact Root bindings. GOAL035/T287 and wider qualification obligations remain active/open. Prior records and failed output are retained.

Current selection, 2026-11-10T00:01:04.659485+00:00: **RC11_EFFECT_PHASE2_SELECTED_NATIVE_PREPARING.** User “continue” and [Root PHASE2-SCOPE-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-01/ROOT_SCOPE.json) select the shared physical lifetime and runCommand production refactor on `ed17ab148` / tree `3bc9e2e3`. The accepted Design/Proof intake binds immutable state and pure transition, a synchronous Node bridge and scoped Effect command ownership with the canonical host runner; HTTP/worker owners receive compatibility proof. Exact native source scope and cheap controlled checks are selected; setup and provider remain held for Root’s concrete bindings. Phase1 and FOUNDATION-ORACLE-001 stay closed for their accepted subjects/proofs. Candidate source has not changed. Later HTTP/worker refactors and GC03 remain unactivated; GOAL035/T287, six skipped claims, synthetic pending-owner and wider qualification obligations remain open. Old installed RC11 remains unchanged/local/unqualified/unpublished; RC10 remains pinned. Prior bodies and all failed evidence are preserved.

Current disposition, 2026-11-09T19:20:31.779885+00:00: **FOUNDATION-ORACLE-001 CLOSED FOR THE EXACT SUCCESSOR; PHASE1 CLOSURE RETAINED.** [Root FOUNDATION-ORACLE-FINAL-ACCEPTANCE-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/foundation-oracle-proof-01/ROOT_FINAL_ACCEPTANCE.json) accepts source `002e481a…` and the [independently conjoined installed W2-05 proof](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/foundation-oracle-followup/review/FINAL_CONJUNCTION_NATIVE04.md): all three cases passed, zero skips/failures, on archive `fdbf93de…`. The constructor/name gate is removed; legacy-seam checks and complete installed behavioral assertions remain. Phase1 debts `RC11-LIFETIME-OBS-LATE-001` and `RC11-M5-TRANSPORT-PROOF-001` stay closed only for their exact successor and selected proof (original nine-file unit: 96 passes, six declared skips). Six tested source files remain byte-identical; plan/tracking changes are documentary. Historical reds, native02 timeout and installed-01 comparator failure remain preserved. GOAL035/T287 and wider qualification/full5.0/S7 obligations remain open, including the synthetic pending-owner limit. Phases 2–4 and GC03 are planned and unactivated. Installed old RC11 remains unchanged/local/unqualified/unpublished; RC10 stays pinned. No main merge, release or installation is selected. This current entry supersedes prior status entries while preserving their bodies verbatim.

Current disposition, 2026-11-09T18:42:12.067696+00:00: **RC11_EFFECT_PHASE1_ACCEPTED_LOCAL_CHECKPOINT; FOUNDATION-ORACLE-001 ACTIVE.** [Root PHASE1-FINAL-ACCEPTANCE-01](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/proof-01/ROOT_FINAL_ACCEPTANCE.json) accepts tested successor `c4a8c7cc…` and the [independently reviewed six-stage proof](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/review-01/PROOF_FINAL_CONJUNCTION.md): lint/build passed; deterministic 29/29, lifetime 18/18, m5 39/39; original nine-file unit 102 cases, 96 passed, six declared skips, zero failures. These overlapping populations are not additive coverage. `RC11-LIFETIME-OBS-LATE-001` and `RC11-M5-TRANSPORT-PROOF-001` are CLOSED only for this exact successor source and selected proof. Historical red runs and native02 timeout remain failures; native03 succeeded only as its bounded call. The tested four code/test files remain exact; three post-proof status documents are recorded separately. Main is not merged, installed RC11 remains unchanged/local/unqualified/unpublished, and RC10 remains pinned builder. GOAL035/T287, six skipped claims, the synthetic pending-owner limit, full5.0/S7 and other qualification obligations remain open. No later production refactor, release or installation is activated. Prior bodies remain verbatim.

Active oracle correction is scoped by [FOUNDATION-ORACLE-001](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/foundation-oracle-followup/ASSESSMENT.md); its source task/setup/provider remain held for exact Root binding.

**Current T-287 / GOAL035 — RC11_EFFECT_PHASE1_SOURCE_FROZEN_NATIVE_TIMEOUT.** The admitted RC10-native source pass closed at its 900 s absolute ceiling without a final report; its exact four-path postimage is frozen under `rc11-effect-phase1-01/native-02` (source digest `5eb4b82b…`). Four syntax checks and 8 observer cases passed; full m5/lifetime/unit proof is unexecuted. Root selected a narrow m5 successor for the completion-partition oracle and retained failure traces; preparation is active, with no new provider dispatch. Both bug debts and qualification remain open. Main/source commits, accepted RC11 installation and RC10 operational pin are unchanged.

Current milestone, 2026-11-09T17:48:26.365931+00:00: **RC11_EFFECT_PHASE1_NATIVE_AUTHOR_RUNNING**. Root PHASE1-NATIVE-01 admits the genuine pinned-RC10 source call on invocation `84f2946b`, actual Run `ef77f993`, through the same held caller. Claude Opus5.5 xhigh has a 900s absolute / 180s inactivity / 100-turn ceiling and exactly four test-owned paths plus scratch. Cheap controlled checks only; complete affected m5/lifetime and original unit proof remain external after the actual source freeze. Both debts and qualification remain open; no production, dependency, release, installation or global pin change is selected. Earlier setup-shape failure, close and all prior bodies remain preserved.

Current execution selection, 2026-11-09T17:41:08.781791+00:00: **RC11_EFFECT_PHASE1_APPROVED_NATIVE_PREPARATION_ACTIVE**. The owner says “approved go”. Root PHASE1-IMPLEMENTATION-01 selects observer and m5 Proof-owner repair under committed plan `db9cf974` / tree `e7c09987`, using pinned installed RC10. Exact native territory is the two existing lifetime/m5 tests plus one small observer support and one focused test; production behavior/dependencies remain unchanged. Fresh genuine Public setup and held-call preparation are admitted; paid dispatch waits for Root's exact prepared-call binding. Cheap author selfchecks precede separate frozen-source focused/whole affected/unit proof. Both debts and qualification remain open; original failures are retained. No release, installation, global pin, main merge or push is selected. Prior bodies remain verbatim.

Current disposition, 2026-11-09T17:33:06.463450+00:00: **RC11_EFFECT_PRINCIPLE_CORRECTION_ACCEPTED_PLAN_RECORDED_IMPLEMENTATION_UNSTARTED**. Root accepts the bounded Product realization-profile correction and coherent Design/bootstrap/requirement wording; independent review and targeted recheck close FND-CLARITY-001. Core Effect remains `3.22.1` and semantic ownership is conserved. The [ordered plan](/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md) separates proved observer/m5 Proof repairs from later lifetime/command, HTTP, worker capture and GC03 candidates. Compiler/generation passed; qualification-law recorded 7 passes and 4 explicit fixture skips, zero failures. Root authorizes a local sixteen-path checkpoint on `codex/rc11-foundation-correction`; no implementation, runtime or next phase is authorized. Both bug debts and qualification remain open; prior red tests/native failures and all other backlog are preserved. RC11 remains local/unqualified/unpublished; RC10 remains pinned builder. Main and delivered source are not merged or changed beyond these tracking prefixes. Prior bodies remain verbatim.

Current plan, 2026-11-09T17:27:47.828986+00:00: **RC11_EFFECT_FUNCTIONAL_PLAN_RECORDED_IMPLEMENTATION_HELD**. Root FOUNDATION-PLAN-01 adopts the [ordered repair/refactor plan](/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md): authority closure; proved observer and m5 test defects; shared pure physical state and Effect lifetime through command; HTTP resources; worker capture/archive last; future GC03 child/socket reuse. Core Effect remains `3.22.1`; application semantic ownership, exact deadline/capture/durability and physical-absence laws remain. The five authority documents are frozen for independent review. This plan activates no implementation, runtime, new tests or checkpoint. Historical causation remains unproved, both qualification debts and other backlog remain open; RC11 is local/unqualified/unpublished and RC10 remains pinned builder. All prior bodies are preserved verbatim.

Current selection, 2026-11-09T17:11:13.738813+00:00: **RC11_FOUNDATION_PROFILE_CORRECTION_IN_PROGRESS**. The owner clarifies that ABG is the application on the best implementation foundation. Root FOUNDATION-BASIS-01 admits Product realization-profile reconciliation and coherent design/bootstrap clarification on isolated `codex/rc11-foundation-correction`, based on accepted RC11 `e2ba05da`. Core Effect `3.22.1` mechanisms may realize declared contracts without acquiring semantic authority; fixed fifteen outcomes, behavioral requirements and serialized Public contracts remain unchanged. [Current repair plan](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator/REPAIR_PLAN.md) links the preserved diagnosis and selects a prospective test-owned observer pilot; production/test source dispatch is held until Root consumes the amendment. No wholesale transport rewrite, dependency upgrade or automatic concurrency/retry is selected. RC11 stays locally installed, unqualified and unpublished; RC10 pin `05a9280f` remains builder. Both qualification debts, red runs, other backlog and native-workflow/full5.0/S7 obligations remain open. Prior bodies are preserved verbatim.

# ABIogenesis Goals

Current milestone, 2026-11-09T10:40:30.509764+00:00: **RC11_LOCAL_DELIVERED_UNQUALIFIED**. [Root final acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_FINAL_DISPOSITION.json) closes `RC8-NATIVE-ASSESSMENT-PROFILE`, `RC8-SELECTED-ACTION-PROFILE` and `RC8-PHYSICAL-LIFETIME-013` only at bounded RC11 source/component-proof/local-delivery scope. Source `e2ba05da` / tree `1aabb064`; exact tested/reproduced/installed archive `f0f5717e` (11,045,484 bytes), 5,327 members. [Installed-owner proof](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/install-01/RETURN.json) passed four module imports, 56 Public definitions and empty read/actual close. Selected focused/affected proof: **27 pass, 1 optional physical skip**. Original unit remains **95/84 pass/5 fail/6 skip**; unchanged m5 remains **32/29 pass/3 fail**; diagnostic is not replacement proof and native Runs remain failed. Both [registered debts](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_DEBT_REGISTRATION.json) remain **OPEN**, including the m5 qualification blocker. GOAL-035/T-287 remain **Active**; five prior capsules, retained-basis gaps, O3, cold/S7/full5.0/human obligations remain open. RC10 operational pin `05a9280f` remains selected; main `dd6938dd` is not merged. Metadata-bound reproduction, first S2 failure, 132 unshipped source-carrier extras, zero copied contract seeds and F_D/F_P/static-composite limits remain explicit in the [handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/HANDOFF.md). No publication, qualification or selector change; earlier bodies remain verbatim history.

Current status, 2026-11-09T09:57:58.622251+00:00: **RC11_SOURCE_FROZEN_TARGETED_PROOF_RETURNED_DEBT_REGISTERED**. Source `cfd7ead1` (1,340 files; 14 selected paths, six new) is frozen; installed RC10 pin `05a9280f` remains builder. [Closed proof return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/proof-01/reentry-05/RETURN.json): native assessment 4 pass; selected action 2 pass/1 optional physical skip; lifetime 18 pass, including the unchanged 12 controlled combinations; R6 1 pass and F04A 2 pass. Build and ten-file syntax/JSON lint passed. The original unit remains **95 tests: 84 pass, 5 fail, 6 skips**; the separate unchanged m5 run is 32/29/3/0 and diagnostic is 3/2/1/0. These later samples do not replace unit red or establish its cause. Root [registers two open debts](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_DEBT_REGISTRATION.json): `RC11-LIFETIME-OBS-LATE-001` and qualification blocker `RC11-M5-TRANSPORT-PROOF-001`. Source acceptance, cut and install await Root's final conjunction; candidate packing alone is not acceptance. Native02 timed out with useful partial source, and its failure/read-scope residual remains preserved. No qualification/public claim, main merge or selector change; earlier bodies remain verbatim history.


Current milestone, 2026-11-09T08:12:03.156116+00:00: **RC11_NATIVE02_SOURCE_AUTHOR_RUNNING**. [Root admitted one bounded source author](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/native-02/ROOT_NATIVE_ADMISSION.json) through operational RC10 pin `05a9280f`. The banked selected-action 216-row and native-assessment 79-row inputs have clear bounded input reviews; four exact data files are staged, and all 1,334 original source files were conserved before dispatch. Actual data now precedes the smaller consumer/loader/physical-test/metadata task and two exact fixture-construction fixes. All three selected capsules remain **OPEN** until source and proof are accepted. No RC11 cut, installation, qualification or public claim; earlier failures and all prior tracking bodies remain preserved.

Current status, 2026-11-09T06:50:35.257629+00:00: **RC11_AUTHOR01_CLOSED_NO_SOURCE_CHANGE_CURRENT_EVIDENCE_PREPARING**. The first native author reached its 900-second absolute limit with no report or source changes; actual physical close and fresh failed replay are retained in `70ec4ba7`. Fresh guards confirm all 1,334 baseline source files and prospective fixture paths unchanged. [Root RC11-REPRICE-01](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_REPRICE_01.json) selects genuine model-free current evidence first through installed RC10 owners, then separately admitted staging of four actual fixture files, then a smaller native consumer/loader/README, physical-test and RC11-metadata task. A checked-in full generator is unnecessary. External controls are preparing; no new runtime or paid author is admitted. Original failure/read deviation and prior bodies remain preserved. All three residuals, other capsules, retained-basis gaps, O3, full 5.0 and human gates stay open; no final RC11 freeze or acceptance.

Current scope, 2026-11-09T06:25:32.967828+00:00: **RC11_THREE_PROOF_OWNERS_CONJOINED_SETUP_ADMITTED**. [Root RC11-SCOPE-01](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_SCOPE.json) selects the native-assessment and selected-action current-evidence consumers/generator plus finite physical-lifetime readiness controls, with exact prospective RC11 identity metadata. Production behavior, HOW and controlled-clock laws remain unchanged. Genuine model-free evidence generation and staging follow separately; no evidence placeholder or restamp is admitted. Installed RC10 pin `05a9280f` remains builder. One fresh imported Public setup is authorized; native provider dispatch awaits its actual PREPARED handoff. External proof, retained-basis gaps, O3, other capsules, full 5.0 and human gates remain open; no qualification/public claim.

Current selection, 2026-11-09T06:17:58.484327+00:00: **RC11_THREE_RESIDUALS_SELECTED_RC10_BUILDER_PINNED**. The owner says “ok pin RC10 - and work on RC11, lets go with the 3 you suggested”. [Root selects](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_SELECTION.json) current-owner native-assessment evidence (`RC8-NATIVE-ASSESSMENT-PROFILE`), selected-action evidence (`RC8-SELECTED-ACTION-PROFILE`), and lifetime/physical closure (`RC8-PHYSICAL-LIFETIME-013`, with retained RC10 lifetime gaps under triage). Installed RC10 remains the operational builder: pin `05a9280f`, source `93a0de75` / tree `27489cb8`, archive `1354b327`. Fresh RC11 worktree `/private/tmp/abg-rc11-qualification-20261109` is prepared from exact RC10; two separate triages are active. Source changes, native work and proof have not started, pending exact scope conjunction. O3, other capsules, full 5.0 and human gates remain open; no qualified or public claim. RC9 remains RC10 construction provenance; main remains `dd6938dd`.

Current selection, 2026-11-09T05:41:53.390186+00:00: **RC10_OPERATIONAL_BUILDER_PINNED_UNQUALIFIED**. The owner asks to continue RC10 and inspect the backlog; Root selects the [delivered installed RC10 operational builder](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-operational-pin-01/BUILDER_PIN.json) for subsequent admitted work. Version `5.0.0-rc.10`, source `93a0de75` / tree `27489cb8`, archive `1354b327` (11,028,443 bytes), and installed content `beaaae0e` are pinned. Fresh read-only verification matched all 5,325 regular archive members (71,764,126 payload bytes) to the installed files with duplicate, unsafe-path and symlink refusal, consuming the exact accepted delivery/owner receipts. The installed root is `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.10/node_modules/@abiogenesis/typescript-tenant`. RC9 pin `cf78adcc` remains unchanged as RC10 build provenance; RC10 did not build itself. Main remains `dd6938dd`, with RC10 on its candidate branch and no main merge or machine-global selector change. This operational selection launches no runtime, backlog implementation, next cut or qualification campaign. GOAL-035/T-287 and retained residual/full5.0/human gates remain open; local RC10 delivery stays unqualified and unpublished. All earlier bodies remain verbatim history.

Current selection, 2026-11-09T05:11:35.949326+00:00: **RC10_LOCAL_DELIVERED_UNQUALIFIED**. [Root final bounded delivery acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-local-cut-01/ROOT_FINAL_DISPOSITION.json) closes the selected local RC10 delivery on candidate commit `93a0de75a16c9e4cd29ec561d159b12add4bb3fd` / tree `27489cb8e62e765cb1aee4b0521fc98cc72a04db`, source `f242bd4d` and archive `1354b327` (11,028,443 bytes). Lifetime/identity and proof-description fixes are complete within the selected scope; separately, 23 dead helpers were removed across 17 source files. Focused: 1 pass/1 skip; unit: 89 pass/6 skips; affected6: 56 pass/2 skips; all report zero failures. The separate 50 large-input calls (25 each at 1MiB/4MiB) passed positive active reuse, zero post-call retention, bounded historical/readback and physical-close checks. Clean reproduction matched all 5,325 members; independent packaging was satisfied. [Actual immutable RC10 installation](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-local-cut-01/actual-001/FINAL_INSTALL_VERIFICATION.json) verified all 5,325 members, content, 56 exports and fresh empty-owner read/close. RC9 remains the operational pin; no main merge, tag, push or selector change. GOAL-035/T-287 remain Active. Eight capsules, O3, twelve cold residuals, remaining S7, full5.0/human gates and stated continuation/overlap/rollback/exceptional/duplicate/foreign proof gaps remain open. No whole201-file RC10 broad, whole-heap or speedup claim. Delivery is unqualified and unpublished; all prior bodies remain verbatim history.

Current selection, 2026-11-09T04:26:01.474654+00:00: **RC10_ADMITTED_IDENTITY_REPAIR_CLOSED_FROZEN_EXTERNAL_BUILD_ACTIVE**. [Actual native return/custody](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-repair-02/RETURN.json) binds successor `f242bd4d` / freeze `ddb7604d`: exactly three source changes, all other 1,331 rows conserved, actual SDK completed/exit0, physical close and matching fresh result/replay. The native author performed source/readback/syntax checks only; strict integrated1row/1digest and fifty-call reuse remain unproved. Root admits one external proof-02 build on the exact frozen successor, with a single focused LIFE-01 run only if all build commands pass and source identity is conserved. The corrected external witness now reads the actual admitted-event body for Public-to-admitted identity; prior invalid observer controls and actual failures remain preserved. No source acceptance, artifact reuse, qualification or release is claimed; old residuals stay open. Earlier tracking bodies remain verbatim history.

Current selection, 2026-11-09T04:12:26.990662+00:00: **RC10_ADMITTED_IDENTITY_REPAIR_PREPARED_EXECUTION_HELD**. Root RC10-INTEGRATION-REPAIR-02 conjoins actual installed counterexample `60e3f4ff` and the closed independent source addendum: Public request `c29a45ac` maps to admitted execution/basis `e97a8b94`, while the current start owner held the Public identity. Active reuse is falsified despite correct semantic return; the prior source-lifetime satisfaction is withdrawn and the 23-helper deletion verdict retained. One bounded native successor will repair the start hold after actual admission, clarify the owning HOW and rollback proof limit, and add a genuine fixture-specific integrated one-row/one-digest assertion in exactly three files. [Concrete controls](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-repair-02/READY.json) preserve all 1,334 preimages and both failures. The separate HOW attempt started no actor because equal transport timeouts were refused; the corrected 900s/180s contract is deterministically checked. Setup and dispatch remain held for exact admission; external successor build/focused/unit and corrected 50-call 1–4MiB witness follow separately. Existing unit evidence remains banked for its old subject; old artifact/testing/cut operations are stopped. Main Product, RC9 builder, all original evidence and earlier tracking bodies remain unchanged; acceptance, full qualification and retained residuals remain open.

Current selection, 2026-11-09T03:24:14.590045+00:00: **RC10_NATIVE_CLOSED_FROZEN_SOURCE_AWAITING_REVIEW_AND_MEASUREMENT**. The admitted installed-RC9 native author returned and physically closed; [exact handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-01/NATIVE_FINAL_HANDOFF.json) binds sourceDigest `86e9de76`, 1,334 frozen files and 27 changed paths for lifetime repair plus 23 selected helper removals. Native after-observation and live source match the frozen candidate; fresh result/replay preserve the same terminal. The frozen build passed and one fast lifetime case passed; workload50 was explicitly skipped. Its small-input workload is not the requested 1–4MiB measurement: a separate external installed-candidate adapter is preparation only. Source acceptance, affected regression proof, requested 50-call retention/heap observations and full qualification remain pending. Main Product and immutable RC9 builder are conserved; no commit, merge, push, installation or publication is selected. Earlier records remain verbatim history; all retained residual/human gates stay open.

Current selection, 2026-11-09T02:59:46.545617+00:00: **RC10_LIFETIME_AND_23_HELPER_REMOVALS_READY_FOR_SETUP**. Root's final RC10-DEAD-02 joins the selected lifetime repair with23 exact helper declarations across17 source files and one owning HOW Update/Transition cell. The final disposition consumes frozen reports `6856fd5a`/`1ecf1f1d`; the two dynamically named semantic-revision leaves remain live and preserved. Public constructor/parser/type and runtime semantics remain; no whole-file removal, O3 or optional four-population work is selected. Genuine new lifetime consumers reuse existing helpers and are reported. [Final successor controls](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-01/READY.r04.json) preserve the original/r02 packets, required lifetime test, immutable in-scope inputs, exact sparse source and one author/freeze. Installed RC9 remains the immutable builder. Setup/native dispatch are still unallocated pending their exact admissions; source/build/test/provider effects have not occurred. Earlier selections below remain verbatim history; full5.0 qualification and retained residual/human gates stay open.

Current selection, 2026-11-09T02:54:18.550846+00:00: **RC10_MEMORY_LIFETIME_AND_EIGHT_HELPER_REMOVALS_PREPARED**. The owner selects RC10 using immutable pinned RC9, and adds “i want to remove dead code.” Root conjoins the closed lifetime triage with RC10-DEAD-01: release both execution-basis retaining owners at the existing operation lifetime, correct §10.12 proof wording, and remove eight source-verified unused helper declarations in five files (65 declaration lines/3,049 bytes measured before edits). Preserve underlying owners, current reads and public contracts; a real consumer disproves deadness, and a helper naturally needed by the lifetime repair is reused and reported. [The successor native preparation](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-01/READY.r02.json) binds one sparse candidate/author/freeze and exact scratch/input territory. New lifetime test is required; whole-file deletion, the other17 candidates, four optional proof populations and O3 remain unselected. Fresh setup and native dispatch are still unallocated/held for exact admission; no Product edits/build/tests/provider work occurred. All earlier dated selections below are preserved verbatim as history; RC9 remains local, unqualified/unpublished and full5.0/residual/human gates stay open.

Current selection, 2026-11-09T02:28:40.397541+00:00: **RC10_RETENTION_PREPARATION_HELD_FOR_SOURCE_DESIGN_CONJUNCTION**. The owner's “ok use RC9 for these fixes on RC10” selects preparation for invocation-bounded retained basis rows with 50-call row/payload accounting and separate heap observations, the unsupported design §10.12 duplicate-proof claim correction, and reliable native proof handoff with preserved per-file timeouts. [RC10 preparation](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/PREPARATION.md) records the exact separate Writer grant, verified immutable RC9 builder `cf78adcc`/archive `c01e6cfe` and source `dd6938dd`. Source/design conjunction and exact runtime/proof admission remain held; no Product edit, build/test, runtime or provider call has occurred. O3 verification reuse and backlog additions remain unselected pending their owners. RC9 stays local, unqualified and unpublished; GOAL-035/T-287 and all retained qualification/residual obligations remain open. Earlier dated selections below are preserved verbatim as history.

Current selection, 2026-11-09T00:51:09.916Z: **RC9_LOCAL_MAIN_INTEGRATED_UNQUALIFIED**. The owner's authorized integration makes RC9 authoritative on local `main` through ordinary two-parent merge `3e050ecf24819bb5d5d9f067b8f2b88dcefb76f7`, retaining original main `1344547c9` and RC9 `e30ac16b4` ancestry. [Preservation checkpoint](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-main-integration-01/CHECKPOINT.json) `e1bcb6ee27` retains all12 tracked dirty preimages and the explicit compact record selection; raw untracked evidence stays in place. [Integration result](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-main-integration-01/RESULT.json) binds all1,842 non-record Git entries and physical bytes/modes exactly to RC9, with current record bodies retained and39 donor-only records added. The [RC9 operational builder pin](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-operational-pin-01/BUILDER_PIN.json) remains `cf78adcc`; immutable installs/releases and RC8 build provenance are unchanged. RC9 local delivery is complete, unqualified and unpublished. GOAL-035/T-287 remain Active; full5.0 and all retained residual/qualification gates remain OPEN. No push, remote update, next release, runtime or qualification work is selected.

Historical RC9 operational builder selection, 2026-11-09T00:18:12.581Z: **RC9_OPERATIONAL_BUILDER_PINNED_UNQUALIFIED**. The owner's instruction to pin RC9 selects the [delivered RC9 operational builder](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-operational-pin-01/BUILDER_PIN.json): version5.0.0-rc.9, source commit `e30ac16b4`/tree `ff9a852c`, archive `c01e6cfe`/11,029,525 bytes and installed content `b3a3df1f`. Fresh read-only archive/package/manifest and retained-owner-receipt checks passed; all 5,325 archive members match the installed files. Installed root: `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.9/node_modules/@abiogenesis/typescript-tenant`. The [RC8 builder pin](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/BUILDER_PIN.json) remains byte-for-byte unchanged as RC9-build provenance; RC9 did not build itself. [Local RC9 delivery](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-local-cut-01/ROOT_FINAL_DISPOSITION.json) remains complete, unqualified and unpublished. This is a project/work operational selection with no machine-global selector or installed-byte change. GOAL-035/T-287 remain Active and full5.0/residuals remain OPEN. Future selected work must acquire genuine RC9 owners/resources through the installed Public route, without restamping RC8 Runs/catalogs/resources. No Runtime, next RC, S7 work, merge or push is selected.

Historical local RC9 delivery selection, 2026-11-08T21:57:08.000Z: **RC9_LOCAL_DELIVERED_UNQUALIFIED**. [Root final delivery acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-local-cut-01/ROOT_FINAL_DISPOSITION.json) closes the selected local RC9 delivery, supported by [actual final installation verification](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-local-cut-01/actual-001/FINAL_INSTALL_VERIFICATION.json). Local source commit `e30ac16b4a9406c43d054f45bad864746352dad6`, tree `ff9a852c6670884c35f67934e9f49443199b723f`, frozen source `25121e78`/1,340 rows and archive `c01e6cfe`/11,029,525 bytes are bound to all 5,325 matching payload members. Installed at `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.9/node_modules/@abiogenesis/typescript-tenant`; content `b3a3df1f`, 56 exports, empty owner read and actual close verified. Root accepts bounded201-whole-file coverage: 1,033 passes,230 skips, eight held; independent packaging review has zero findings. RC8 remains pinned; delivery is unqualified and unpublished, with no global selector change. GOAL-035/T-287 remain Active and full5.0 remains OPEN. Eight capsules, O3 performance follow-up, undelivered duplicate/foreign/rollback probes,12cold,S7/full15/human remain OPEN; all historical failures and proof limits are preserved. No general performance, reliability, real-provider or full native-workflow qualification is claimed. No next RC/S7 work or other execution is selected.

Historical broad008 active frontier, 2026-11-08T20:22:34.218Z: **RC9_BROAD008_ACTIVE_RETAINED62**. [Broad008 started](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/broad-002/EXECUTION_STARTED.json) at 2026-11-08T20:21:03.705Z (session65569), under [Root run admission](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/ROOT_BROAD_008_RUN_ADMISSION.json), config `ec04f94a` and inventory `b6011697`. The continuation retains 62 whole-file credits from the same RC9 source/archive (329 passes/82 skips), executes 139 whole files and holds eight; it grants no credit for partial063 or RC8 results. [Operational triage](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/triage-broad-007/OPERATIONAL_TRIAGE.json) and [independent review](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/reviews/broad-007-c0-timeout/REVIEW.json) identify lost prior proof limits, with no source/assertion defect established. All eight applicable limits are restored within the original remaining 11,695,489ms overall budget; checks are unchanged. Historical007 timeout/absent final resource, conservation and bounded ownership observations remain preserved; no universal physical-closure claim. Source/build/unit/reference/W2 remain accepted within their bounds. RC9 is not cut/final-installed; eight capsules, O3 performance reuse,12cold,S7/full15/human remain OPEN. Broad acceptance is pending; this tracking update launches nothing.

Historical broad007 stopped-triage frontier, 2026-11-08T20:10:58.368Z: **RC9_BROAD_STOPPED_C0_TIMEOUT_TRIAGE**. [Broad007 return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/BROAD_007_RETURN.json) and [summary](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/broad-001/SUMMARY.json) record an incomplete stop at file063 `t287-c0-post-publication-failure`: outer 600,000ms timeout/SIGTERM, 15 partial passing cases and no whole-file summary/end. Completed coverage is 62 whole files/329 passes/82 skips; file063 partial passes are excluded, 138 selected files are unattempted and eight remain held. Primary/dependency/external inputs were conserved. The final file-host resource receipt is absent; descendant closure is unknown pending a read-only operational probe. Root/source review/proof-operation triage is active. Preliminary 31 sequential cases at roughly 37s each indicate an allocation mismatch; no source or host cause is asserted. W2 successor closure and source/build/unit/reference acceptance remain preserved. Other eight historical capsules, O3 performance reuse,12cold,S7/full15/human remain OPEN, with all failed attempts retained. No broad acceptance, cut, retry or extension is selected; source/claim/cut templates remain held and RC9 is not cut/final-installed.

Historical broad-active W2 selection, 2026-11-08T19:26:25.376Z: **BROAD_ACTIVE_W2_ACCEPTED**. [Root W2/F4 acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/ROOT_W2_ACCEPTANCE_007.json) closes RC8-W2-05-TOKEN-ORACLE only for frozen RC9 source `25121e78` and exact archive `c01e6cfe`: both whole-file cases pass, no skips/failures/cancellations, complete dynamic/export assertions and W2_05_PROOF, unchanged catalog event count 2→2. The admitted [broad campaign](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/broad-001/EXECUTION_STARTED.json) started 19:21:14.812Z under config `a2ba7d6f`, inventory `e75c1671` and admission `051fcf4b`; broad acceptance is pending. Source/build/ordinary unit and [reference measurement](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/ROOT_REFERENCE_ACCEPTANCE_007.json) are accepted within their bounds. Historical RC8 failure and residual records remain unchanged; this is successor-specific closure, not retroactive RC8 qualification. The other eight historical capsules, O3 performance reuse, twelve cold residuals, S7/full15/human remain OPEN; earlier M5/OWN failures remain unresolved. RC9 is not cut or finally installed; pinned RC8 is unchanged. This bookkeeping launches no execution.

Historical source/build/unit selection, 2026-11-08T19:01:50.308Z: **SOURCE_BUILD_UNIT_ACCEPTED_ARTIFACT_PROOF_PREPARING**. [Root acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/ROOT_SOURCE_ACCEPTANCE_007.json) conjoins exact frozen source `25121e78`/1,340 rows, BUILT003 and [independently reviewed ordinary unit007](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/reviews/full-unit-007/REVIEW.json): 95 cases, 89 passes, six exact retained skips, nine successful files and complete OWN/REF diagnostics; M5 passes all 32 cases. This bounded source/build/unit acceptance selects artifact-proof preparation. RC9 is not cut or installed; the pinned RC8 builder is unchanged. The original failed/closed native03, M5 failures and OWN004 cancellation remain historical; timing cause is unresolved and no reliability claim or M5 deferral is inferred. Minimal bootstrap gate007 and existing archive/W2/measurement/broad work remain subject to their own bindings/admission; this recording launches nothing. O3 performance reuse and all nine RC8 capsules, twelve cold residuals, S7/full15/human gates remain OPEN. Exact-archive W2, artifact/broad/release and qualification acceptance remain outstanding.

Historical verification frontier, 2026-11-08T18:15:57.267Z: **RC9_SOURCE_REVIEWED_VERIFICATION_UNRESOLVED_HELD**. Frozen source `25121e78` has 1,340 rows; the one-test repair is [independently source-satisfied with no new finding](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/reviews/source-003/REVIEW.json), while the overall review remains indeterminate. The build passed. [Author03 failed-close](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-03/OPERATOR_RETURN.json) preserves its timeout and incomplete unit proof. The separate [M5 diagnostic](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/triage-003/DIAGNOSTIC_001_RETURN.json) reports 32 cases/26 passes/6 failures; its findings remain unadjudicated. [OWN004](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-proof-01/OWN_PROOF_004_RETURN.json) reached the inner 500s cancellation: 0 passes/0 failures/1 cancellation, command 528.428s, no final diagnostic, byte conservation and CHILD_CLOSED. Verification is unresolved; RC9 is not cut or installed, and the pinned RC8 builder is unchanged. No native call or runtime retry is active. Seven-file remainder execution and further diagnosis preparation are HELD; Root asked the owner about a quiet verification window without attributing failures to host load. Prior failures remain preserved. O3 performance reuse, all nine historical RC8 residuals, twelve cold residuals, S7 and full5.0/human gates remain OPEN; no M5 deferral or closure is assigned.

Historical author03 failed-close frontier, 2026-11-08T17:36:40.216Z: **RC9_AUTHOR03_TIMEOUT_CLOSED_PARTIAL_PROOF_HELD**. [Operator return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-03/OPERATOR_RETURN.json) binds source25121e78/1,340 rows/one-test delta, unchanged production/HOW/RC9 metadata/script, and a successful frozen build. The actual1800s native ceiling terminated the worker; four completed unit-file summaries report70 cases/62pass/5fail/3skip, with five failures in unchanged worker-transport tests. OWN-01 and later files have no completed result, and no final unit receipt exists. Host load is recorded without precise attribution. The resource actually closed; one fresh pair preserves absent-result refusal and failed replay at unchanged56,629,020B prefix23fc2553. No former proof process was found in scoped PID/group/cwd checks. Final CLI cost/turn totals are unavailable, not zero. Root owns the selected external diagnosis and remaining proof path; no native retry or source change is activated by this return. O3 reuse and all historical qualification residuals remain open.

Historical author03 native start, 2026-11-08T17:06:22.269Z: **RC9_AUTHOR03_SINGLE_TEST_NATIVE_ACTIVE**. Root RC9-NATIVE-03 admitted one native call through immutable RC8. [Actual start](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-03/NATIVE_STARTED.json): Opus5.5 xhigh/PID39526, host37812/session52841, Run `run://abiogenesis/dec8023c2046a90269b15f9d78a3a691c0020db028de6a3cfc2d9c7f0a0691b0`. Only OWN-01 and author03 progress are writable; production/HOW/metadata/unit script remain fixed. All1,340 baseline rows were conserved before dispatch. Functional preparation35.108s and dispatch-to-actor41.858s are separate observations. Final source/proof remains pending; both prior failed proofs, O3 performance reuse and all qualification residuals remain open.

Historical author03 preparation, 2026-11-08T17:00:19.346596+00:00: **RC9_AUTHOR03_SINGLE_TEST_CONTROLS_READY_HELD**. Current owner resumption and [Root RC9-REPAIR-03](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-03/ROOT_SCOPE.json) select one existing-file native repair to OWN-01: authentic nominal-prefix acquisition, command-only comparison, post-call counter interval, and explicit changed-row refusal evidence. Production/HOW/RC9 metadata and the nine-file unit script stay fixed. [Concrete controls](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-03/CONTROL_RETURN.json) bind all1,340 source41060a77 preimages and actual author02 closed prefix39,712,384B/406419ed; no setup replay, runtime allocation or provider dispatch has occurred. Both prior failed proofs and their unexecuted suffixes remain preserved. O3 verification reuse, all nine RC8 residuals, twelve cold residuals, S7 and full5.0/human qualification remain open.

Historical author02 close, 2026-11-08T07:17:22.988Z: **RC9_AUTHOR02_CLOSED_UNIT_FAILED_SOURCE_HELD**. [Operator return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-02/OPERATOR_RETURN.json) binds frozen source41060a77/1,340 rows/exact eight-path repair, RC9 identity agreement, exact RC8 restored consumer bytes, successful build and unit95tests/88pass/1fail/6skip. OWN-01 now completes three held Runs but fails at line102 because a durable prefix coordinate was supplied where a nominal validated event prefix is required; O1/O4/O3 suffix checks remain unexecuted. The native call actually returned/closed; fresh result/replay agree at unchanged39,712,384-byte prefix406419ed. All eight changed paths are present in native after-observation and match the physical freeze. Root disposition is pending; no retry is activated. O3 reuse remains OPEN as a separate performance follow-up; all nine RC8 residuals and wider qualification/human gates remain open.

Historical author02 native start, 2026-11-08T07:04:11.891Z: **RC9_AUTHOR02_NATIVE_REPAIR_METADATA_ACTIVE**. Root RC9-NATIVE-02 admitted the exact held call on immutable RC8. One Opus5.5 xhigh Worker is active, PID72321/host71304/session23154, Run `run://abiogenesis/fb1276451a54687192a1a6251bb9fa995d75a2e844cfa107cf6b4ac256e99e25` ([actual start](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-02/NATIVE_STARTED.json)). The eight-path repair restores prior physical install checks, corrects the regression and owning HOW, and sets RC9 identity metadata; O1/O2/O4 remain fixed. Closed-resource preparation took22.974s and dispatch-to-actor6.566s, separately measured. All1,340 source preimages were conserved before dispatch. Source acceptance/final proof remain pending; O3 reuse is OPEN as a separate performance follow-up, and all historical residuals/qualification gates remain open.

Historical author02 preparation, 2026-11-08T07:00:59.250993+00:00: **RC9_AUTHOR02_REPAIR_METADATA_CONTROLS_READY_HELD**. [Root RC9-REPAIR-02](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-02/ROOT_SCOPE.json) selects one eight-path native successor: restore physical install verification at every prior consumer/effect boundary, repair OWN-01 actual successor handling and its first-consumer mutation refusal proof, reconcile owning HOW, and set exact RC9 package/lock/contracts identity. O1/O2/O4 are preserved. [Concrete controls](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-02/STATIC_PREFLIGHT.json) bind all 1,340 author01 preimages and the genuine closed RC8 resource; no runtime/provider effect has begun. **O3 retained installed verification reuse remains OPEN as a separate T-287 performance follow-up**: its lawful reuse lifetime is unresolved, physical checks remain required, and zero/once-per-resolution or O3 speedup claims are withdrawn. Author01 failed proof and all nine RC8 residuals, twelve cold residuals, S7 and full5.0/human gates remain preserved.

Historical author01 close, 2026-11-08T06:48:33.096Z: **RC9_AUTHOR01_CLOSED_UNIT_FAILED_SOURCE_HELD**. The RC8-built native Run returned and physically closed (session6081 exit0); [operator return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-01/OPERATOR_RETURN.json) binds frozen source `6aacc0e5`/1,340 rows/12 paths, successful build, and failed unit95tests/88pass/1fail/6skip. The new owner-regression case stopped at acquisition_mismatch line86; later checks did not execute. Exact actual SDK result and fresh run_result/run_replay agree, with unchanged21,938,126-byte closed prefix. This is a closed runtime report, not source/proof acceptance. Root triages the test, same-resolution install concern, reporter-control mismatch and successor RC9 identity metadata. No new runtime/provider or repair is activated. All nine RC8 residuals, twelve cold residuals, S7 and whole5.0/human gates remain open.

Historical native start, 2026-11-08T06:28:06.686Z: **RC9_NATIVE_ACTIVE_RC8_BUILDER_PINNED**. Root admitted the exact held RC8-built native call under RC9-NATIVE-01. One Claude Opus5.5 xhigh author is actually running, PID47322/host45470/session6081, Run `run://abiogenesis/f7b6fac18ceb4d4fa52502680b99bb7b8799cbc1e94721243b52576b19b78a51` ([start evidence](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-01/NATIVE_STARTED.json); [admission](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/author-01/ROOT_ADMISSION.json)). Actual process arguments confirm Opus5.5/xhigh/200 turns; this is configuration observation, not provider telemetry assurance. Fresh setup took82.915s; dispatch-to-actor5.938s. All1,339 source preimages were conserved before dispatch; no final source/proof or RC9 performance result is yet accepted. Source scope remains RC9-SCOPE-01; all nine RC8 residuals and broader qualification/human gates remain open.

Historical preparation, 2026-11-08T06:18:53.376275+00:00: **RC9_SELECTED_RC8_PINNED_CONTROLS_PREPARING**. Owner instruction “use RC8, pin to RC8 and use it to build RC9” selects immutable installed RC8 archive `a178e960`/content `5dd1e816`; the [builder pin](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/BUILDER_PIN.json) verifies all 5,325 actual archive payloads against the install. [Isolated C9](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/CHECKOUT.json) is `codex/rc9-owner-reuse` at exact RC8 `2019d62e4bb5d28183cc720b904d7901f19dc44a`, tree `4c8a9240aba29eb2858ddfd719a92337a033128c`, with 1,339 materialized tracked files. [Root scope RC9-SCOPE-01](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc9-owner-reuse-01/ROOT_SCOPE.json) selects bounded owner-held row/environment facts, same-resolution physical-verification carriage, final native contract freezing and F3/F4/F6 corrections under unchanged Product/requirements. Cross-resolution install reuse remains an explicit residual. Native TASK/BINDING/host preparation is active; runtime allocation and provider dispatch have not occurred. RC8 remains local/unqualified; all nine capsules, twelve cold residuals, S7 and fixed15/full5.0/human gates remain open. No global selector, publication or speedup claim.

Historical selection, 2026-11-07T22:53:12.907Z: **RC8_LOCAL_INSTALLED_UNQUALIFIED**. Root accepts the selected RC7→RC8 local repair/proof/checkpoint/reproduction/review/install/smoke as complete. Source `2019d62e4bb5d28183cc720b904d7901f19dc44a` (tree `4c8a9240aba29eb2858ddfd719a92337a033128c`; digest60f8e595,1339 rows/27 selected paths) reproduces unchanged archive a178e960; all5325 installed payload members correspond. [Final verification](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01/actual-001/FINAL_INSTALL_VERIFICATION.json) a5c674c5 and [canonical install return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01/install-binding-001/OPERATOR_RETURN.json) 07ae6d2f bind the actual installed content/56 exports/empty-read/close smoke. [Root disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01/ROOT_FINAL_DISPOSITION.json) and [handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01/HANDOFF.md) retain source/proof/packaging/install receipts and separate timings. Broad025 retains192 whole credits/986 passes/227 historical skips;16 separate populations comprise4 accepted whole,3 casewise and9 OPEN residuals. Configured C2 positive is separately accepted; five installed negatives remain OPEN. T-287/GOAL-035 remain active: all9 capsules,12 cold residuals,S7,fixed15/full5.0/human gates remain open. Local delivery is unqualified and unpublished; no global selector change or further native/qualification work is selected.

Historical selection, 2026-11-07T22:14:08.167995Z: **RC8_A11_ACCEPTED_BROAD025_COMPLETE_C2_POSITIVE_ACCEPTED_A12_PREPARING_NINE_RESIDUALS_OPEN_CUT8_HELD**. [Broad025 return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-close-proof-01/OPERATOR_RETURN_025.json) 78fae0e8 and [custody correction](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-close-proof-01/OPERATOR_RETURN_025_CUSTODY.json) d4ad589a retain 192 whole-file credits/986 passes/227 historical skips over 208 inventoried files, with 16 separately handled file populations. Broad024's witness-reprice file retains 14 passes/1 fixture failure; broad025 completed the four remaining independent files. [Configured C2 positive acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/c2-configured-positive-001/ROOT_PROOF_ACCEPTANCE.json) 39720ed8 is bounded to one case; five installed C2 negative variants and all nine durable residuals remain OPEN. [A11 source acceptance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/author-11/ROOT_SOURCE_ACCEPTANCE.json) f6438805 retains source 95d3d1d0/26 selected paths and archive a178e960. The [closed witness-reprice review](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/reviews/witness-reprice-024/REVIEW.json) d9ebd6d2 identifies a two-reference fixture mismatch, with no demonstrated Product regression. Root selects A12's exact test-only correction through installed RC7 and one existing filtered case; controls are PREPARING, with no SDK allocation, provider dispatch or source effect at this observation. CUT8 remains held until the source/proof conjunction and concrete bindings, then the existing local checkpoint, byte-equal reproduction, packaging review, install and smoke. No all-green, whole-C2, whole-qualification, push/tag/merge/publication or global-selector claim.

Resumption and agent policy: [record](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-resumption-20261108/RESUMPTION.json). Latest user instruction “ok continue on” authorizes continued selected work; it is not blanket evidence acceptance. Stopped proxy thread `01a1a034-5c16-7200-a3a8-fc3c5844c096` is succeeded by Root thread `01a1b734-f631-7990-9791-534d6a13d5fe`. Required policy: human-proxy Executive gpt-6-astra max; Codex operators/writers/bounded reviewers gpt-6-astra xhigh; native workers claude-opus-5-5 xhigh. Global settings are unchanged. Documentation activation `/root/rc8_delivery_record` records Root's direction and established evidence only.

Historical selection, 2026-11-07T15:07:35Z: **RC8_A11_ACCEPTED_BROAD023_CLOSED_C2_POSITIVE_PREPARING_NINE_RESIDUALS_OPEN_CUT8_HELD**. [Broad023 return](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-close-proof-01/OPERATOR_RETURN_023.json) 9191ae63 retains 178 whole files/919 passes/211 historical skips; six actual C2 component passes remain partial, two 180s timeouts and scoped Root TERM remain separate, with no aggregate/whole credit. The [ninth residual](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#rc8-c2-installed-negative-proof-budget) covers five installed negative variants only. Configured C2 positive and broad024 are preparing, neither launched: 15 other files/15 deferrals = four accepted whole proofs, two case-wise proofs and nine OPEN residual populations; positive proof remains pending separately. A11 source 95d3d1d0/26 paths/archive a178e960/performance remain accepted; coding Workers=0, CUT8 held. No negative reproof/source/timer repair selected.

Earlier author03 timing snapshot (historical), retained in [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md): full A1-close→A2-dispatch 1,501.982s and A2-close→A3-dispatch 546.066s; A3 setup 22.500s (acquisition 0.770s at 54.572MB), prepared-to-dispatch subinterval 56.413s, actor launch 8.965s and dispatch-to-SDK-return 685.392s. A3 closed log: 79.112MB. No full-workflow speedup or release qualification is inferred.

Historical selection, 2026-11-07: **RC8_AUTHOR02_NATIVE_ACTIVE_STAGE02_WITHHELD**. First native Run0526a286 is closed; stage-02’s1,338-file partial source and48 focused passes/2 historical skips are retained, with acceptance withheld after [two S2 source findings](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/reviews/source-001/README.md). [Author-02’s18-path correction](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/author-02/ROOT_SCOPE.json) is actually active on immutable RC7: Opus5.5 xhigh, Run3907bdd8/PID74039,03:56:12.577Z ([evidence](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/author-02/NATIVE_STARTED.json)). [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#rc8-reference-preservation-plan) separates20.891s functional setup,7.963s launch and coordination time. RC7-before family002 is closed; RC8-after/profile, broad close, source acceptance and cut/install remain pending. STDO3.0.4 and RC7’s unqualified standing remain unchanged.

Prior activity snapshot, 2026-11-07 (03:14): **RC8_NATIVE_ACTIVE_RC7_BUILDER_BOUND**. Installed RC7 is bound as the RC8 builder; bounded functional preparation and actual launch are complete. One Opus5.5 xhigh Worker is active, Run `0526a286827851182b39b6bc2df9007e588ec2b972854d6248e924f84b8afd77`, PID39752, started03:04:41.867Z ([evidence](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/NATIVE_STARTED_002.json)). C8 base27c08ce597/STDO3.0.4 remain unchanged. Root’s03:14 snapshot has HOW/native analysis active and no native Product delta/frozen stage observed. [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#rc8-reference-preservation-plan) records accepted RC7-before measurement, pending RC8-after proof and remaining close/cut gates. RC7 remains unqualified; no RC8 speedup, coding-productivity or completion claim.

Prior selection, 2026-11-07: **RC8_SELECTED_RC7_BUILDER_PREPARING**. Owner instruction “ok move to rc7 build rc8” selects immutable installed RC7 (source27c08ce597/archive2e086133) to build RC8 under STDO3.0.4. Operator `/root/rc8_operator` is preparing an isolated successor source, new campaign and fresh W runtime through maintained SDK owners; native coding Workers=0, with no dispatch, completed pin or runtime allocation at this selection capture. [T-287’s selected plan](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#rc8-reference-preservation-plan) orders preparation, owning HOW/native correction, affected proof/profile/broad close and reproducible RC8 cut/install. RC7 remains locally installed/unqualified; closed RC6, previous RC7 evidence, global selector and broader 5.0/human qualification gates are preserved.

Historical progress, 2026-11-07T00:28:38.120004+00:00: **RC7_LOCAL_INSTALLED_UNQUALIFIED**. The selected held-session/stdout refactor is bounded accepted and locally installed as5.0.0-rc.7, source27c08ce597b71c383eb3d032b25fa0791646c6c6, archive2e086133, all5325payloads equal. Build and clean reproduction are byte-identical; independent source/packaging reviews and installed-owner check passed. Latest source proof33pass/0fail/0skip; installed1MiB/4MiB contexts retain2617-byte Results, zero warm history decode/reopen and zero held-read history/body work, with completeP2warm/cold agreement. ConditionalS6notactivated. Full native-workflow performance and exact5.0 qualification remain open; no provider-speedup or stable-release claim. Current [handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-local-cut-01/HANDOFF.md) and [Root disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-local-cut-01/ROOT_FINAL_DISPOSITION.json) bind resumption. No active native Worker, push, merge, tag, publication or global selector change. Earlier dated states and original failures/procedure limits remain historical evidence.

Current progress, 2026-11-06T07:24:50.607422+00:00: **RC7_B_EXACT_BRIDGE_NATIVE_RUNNING**. Immutable RC6 is executing one native Claude Opus5.5 xhigh Worker, PID70761, Run `run://abiogenesis/4dbcf7d8368c7bfa449c68be5bd443ab224e710b1496116a8b541939007f9ab2`, started2026-11-06T07:23:11.045Z. Root hostsession7283/PID68788 uses one retained preparation/dispatch context. Parent preparation90.565s and dispatch-to-native88.162s are measured separately; no matched speedup or complete RC7 performance claim. The first N launch failed before a child because the wrapper was0644; exact EACCES/failure/unchanged466files/3absences and actual close0936b54d are preserved. Root corrected executable mode only, added X_OK preflight and reentered from that actual successor under admission976489f9/manifest330c4308. The four source paths and7 unique proof cases remain unchanged. Original B frozen source31c092b1 and closed readbacks/reviews retain their standing. Handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-03/CURRENT_HANDOFF.md`. Current source/close/acceptance remain pending; no qualification/publication/selector claim. Earlier dated states are historical.

Current progress, 2026-11-06T07:05:34.402542+00:00: **RC7_B_EXACT_BRIDGE_DISPATCHED_AWAITING_NATIVE_START**. RC6 host session67322/PID57176 dispatched2026-11-06T07:04:30.387Z; native start is not yet observed. Four source paths,449 preserved source files,17 staged controls and3 absent handoffs are bound by admission225dd021 and host manifest a31fc65f. One-process preparation took88.102s from module entry, including83.592s caller refresh; setup reused, native launch and final performance remain unmeasured. B exact frozen source31c092b1, close07c9b3d9 and completed reviews remain preserved. Mandatory affected proof is7 unique cases in4 positive-filter lanes, within2stage/6lane ceilings. No source acceptance, qualification, release or selector claim. Handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-03/CURRENT_HANDOFF.md`. Earlier dated states remain historical.

Current progress, 2026-11-06T06:46:41.111127+00:00: **RC7_B_FROZEN_CLOSED_EXACT_BRIDGE_PREPARING**. Immutable RC6 completed native Run2e733578. Source31c092b1 is frozen,470 files+3 handoffs match actual native.after and fresh complete result/replay agree at close07c9b3d9. Two max reviews preserve the implemented carriage and original-byte correction; C2 generation is blocked by an excluded existing declaration pin, and R1-CONSUMER-001 requires migrating2 real cold test consumers. Final feedback:178 passes,9 failing invocations/7 unique missing-manifest cases,19 uncovered. Process budget overruns remain preserved. No native Worker active. Next preparation rc7-overhead-author-03 selects4 existing paths for exact dependency/test correction and shared-checker export, with one-process preparation and corrected finite test controls; no new runtime/library framework. Fixed Testing/UAT and remaining qualification follow. Current handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-02/HANDOFF.md`. No RC7 acceptance, publication or selector claim. Earlier dated progress is historical.

Current progress, 2026-11-06T05:24:21.875458+00:00: **RC7_CARRIAGE_COMPLETION_NATIVE_RUNNING**. Immutable installed RC6 is executing one native Claude Opus5.5 xhigh Worker to finish prospective RC7 Result.task removal, unchanged-body sharing and bounded review corrections. Actual Run `2e7335785eb3ea0a5f58da89a43828f5b8e6b267349e8cd28936fbdf4e30e2c9`, native PID73671, started2026-11-06T05:19:52.640Z. Preflight80.419s, host startup315.148s and dispatch-to-actor169.783s are recorded separately; startup cause and successor performance remain unproved. A frozen partial559b05be and actual closeac9a2e64 are preserved, with65 distinct consumer passes,32 harness passes and12 explicitly unexercised cases; historical failures remain. B source is active, unaccepted and has no current close. Next: actual return/source freeze, proportional independent max reviews alongside affected proof and full typed fresh reads; then fixed Testing/UAT route and remaining qualification. Current handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-02/HANDOFF.md`. No publication/global selector/stable claim. Earlier dated progress is historical.

Current progress, 2026-11-06T04:44:39.666787+00:00: **RC7_PARTIAL_PRESERVED_CARRIAGE_COMPLETION_PREPARING**. Immutable installed RC6 completed native Run aa4f3b6999da97e6a606176d600744d64808bddb3b6348c280901834164b4632 and closed with full typed terminal agreement in both fresh result/replay reads. Frozen subject559b05be preserves417 selected files plus3 handoffs. Two independent max component reviews support preserving the realized partial. Result.task removal and unchanged-after basis-holder sharing remain required RC7 work; bounded test/HOW/stream-custody findings join that continuation. No coding Worker is currently active. Corrected affected proof: build/generation/guard passed, harness32/32; consumers63pass/2missing-fixture failures/12skip, with only the two blocked cases selected for further resource correction. Prior failures and accepted evidence remain exact. Next native controls are preparing in rc7-overhead-author-02; fixed Testing/UAT route remains selected afterward. No qualification/publication/global selector claim. Current handoff: .ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-01/HANDOFF.md. Earlier dated progress below is historical.

Owner scope confirmation, 2026-11-06T02:04:29.127506+00:00: **RC7_OVERHEAD_REMOVAL_REMAINS_SELECTED**. Use immutable installed RC6 execution to discover bugs and redundant work, then repair their existing owners in RC7. Duplicate context/result/binding carriage, fresh-readback/cold-history and task-launch costs remain release work. Finish current D5 proof while preparing this consolidation; no new library/store/runtime or qualification repetition. Authority and measured owner links: .ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/ROOT_RC7_OVERHEAD_SELECTION.json.

## Authority

`GOALS.md` selects the current Product outcome. `PRODUCT.md` defines the
complete ABIogenesis 5.0 Product. Requirements decompose WHAT; accepted design
owns HOW; T-287 selects and orders realization.

```text
Goals -> Intent -> Product -> Requirements -> Design -> Code
  -> Events -> Projection -> Delta -> Scenarios -> Gap -> Reprice
```

## Current Goal

| Goal ID | Goal | Success signal | Status |
|---|---|---|---|
| `GOAL-035` | Deliver one usable installed GTL/HoG/ABG runtime that executes declared work, evaluation and consequence and supports native agents producing working, correctable software through outcomes in the workspace. | The selected installed lifecycle satisfies its independent outcome contract; all fifteen Product families, applicable scenarios, exact qualification and human release acceptance close on their declared subjects. | Active under STDO 3.0.4 (the source-development pin of 2026-11-03; the retained RC4 runtime default-library and qualification snapshot remains on 3.0.2). The common computational library precedes release work. The [operator-family library design](../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md) supersedes the [design conjunction’s](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/common-consolidation-conjunction-01/decision.md) bounded contracts and withdraws its cross-consumer handoff. The library is closed on `main` at `46ed04895` ([T-290](../.ai-workspace/tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md) Phase A, after the [eight-step plan](../.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md) and eight post-close repairs): every owner obligation O-RESOURCE to O-TYPE is closed with its sites and the design's proofs hold; the lifecycle law is realized as the rule `actor_process_lifecycle` in the one fold. The registered debt wave (T-290 Phase B, twelve packages, each accepted with its record and closed in the register) is closed at `a8937b837`. This is not a release: L5 delivery acceptance is recorded (the owner, 2026-10-24, on an independent review with no S0 to S2); the Phase C packages ruled by the log principle, the complete source conjunction, the combined candidate/P1/P5/P4, the fifteen-family lifecycle, F11/sole AF22, qualification and RC1 remain open. T288/T289 remain closed. Selected RC8 local delivery is complete and installed/unqualified under the [final disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01/ROOT_FINAL_DISPOSITION.json); this goal remains active with the remaining qualification and human gates open. |

## Current Selection

The current selection is recorded at the top of this file and in its linked T-287 plan. The following dated progress retains historical evidence.

Historical progress, 2026-11-06T02:33:48.293714+00:00: **D5_PROOF03_DISPATCH_HOST_RUNNING**. RC6 is building prospective RC7. The two-file legacy repair is frozen94c038bd, author37/37, bounded recheck satisfied, and actual native result/replay/close agree. Proof03 host session50170/PID50222 started02:31:42Z; actual C2/UAT and final close remain pending. Third preflight passed135.558s after two retained operator-control refusals: missing required support and excessive historical original-source carriage. Source projection now353991B, with all426 context/420 protected inputs and70 assessment assets unchanged. Overhead removal remains selected RC7 release work; concrete prefix-reuse, physical body and existing compact terminal-carrier owners are now identified. No second native task or reopen while proof runs. Handoff: .ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-proof-03/HANDOFF.md.

Current progress, 2026-11-05T20:43:28.961402+00:00: **Q23_SIX_PATH_NATIVE_REPAIR_RUNNING**. One ABG-native ClaudeOpus5.5 xhigh Worker (PID6220, hostsession35428/PID5633) is correcting Q1prompt-operand identity and Q4required-peer missingness in six existingpaths. Run `run://abiogenesis/29ddecc23f74d9fde7f26de4b94095b8c38dba24e5c9711ffaa4769d0083634f`. Preflight30.717s; dispatch-to-native32.195s; setupreused andnoselector. Priorproofclose-to-dispatch2432.024s includes Roottriage/review/controls, separatefromruntime launch. No sourceacceptance ornewC2/UAT isclaimed. The prior62passes andfailedRunsremainexact. Do not reopen the campaign or reuseits predecessorclose whilethisRunisactive. Actualevent/progressmetadata andcontrols are in q23-author-06; externalindependentreview awaitscredentialreplacement. Earlier datedstatesarehistorical.


Current progress, 2026-11-05T20:32:40.827176+00:00: **Q23_BOUNDED_COUNTEREXAMPLE_REPAIR_PREPARING**. Closed frozen-source review identifies two Q1/Q4 gaps: prompt-option data can establish a false configured model, and missing declared peer evidence can permit paid dispatch. Root has selected a six-path existing-owner HOW/code/test correction through one native xhigh Worker. No Worker has launched during packet preparation. Prior actual62-pass C2 retains its old-subject scope; returned correctedsource requires affected C2/UAT through the existing default consumer with unique readFirst paths. The malformed earlier UAT packet and failed Run remain preserved; no standalone assessment Program repair is selected. External different-family review still awaits credential replacement. D5, QR02/QR03, actual production eligibility and whole-release qualification remain open. Details: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-author-06/ROOT_REVIEW_DISPOSITION.json`. Earlier dated states are historical.


Current progress, 2026-11-05T20:16:14.506699+00:00: **C2_SATISFIED_UAT_CONSTRUCTION_FAILED_SOURCE_UNACCEPTED**. RC6 is building the prospective RC7. Q23 author completed; 13 changed files are frozen at subject `60da1eb6`. Actual native C2 passed all six commands and 62 tests, with 342 source/input matches and no protected-source delta. The subsequent Run failed constructing UAT at event77434 before an assessor launched. Three duplicate readFirst paths in the Root packet violate the existing task constructor; UAT-only recovery readiness is being closed without discarding or repeating C2. Fresh run_result is not_found and replay failed with null terminal, consistently; latest genuine resume is `q23-proof-01/execution/after-run-resume.json` (431855279 bytes / prefix SHA8603143a). No coding Worker or proof process remains active. External independent review returned no review because both credential routes failed; credential replacement is pending. A separate bounded Codex source review carries an explicit same-family-to-architect limit. D5 retirement remains open before RC7 profile acceptance, with a finite six-owner scope; QR02, production eligibility, whole qualification and release remain open. All earlier accepted evidence and failures are preserved. Earlier dated states below are historical.


Current progress, 2026-11-05T19:17:16.904114+00:00: **Q23_FRESH_AUTHOR_DISPATCH_STARTED**. RC6 is driving bounded Q23 completion for the prospective successor. The exact12-file partial and17-path grant are preserved; the fresh Claude Opus5.5 xhigh context includes the partial diff and prior feedback. Existing one-node NativeWork Program and owner-issued ABI binding are used. Preflight22.572s, setup reused. Q23-02 hit its1h deadline; Q23-author-03 refused before an actor; Q23-author-04 reached its actor in22.598s but performed zero model turns/tools because the selected CLI conversation was not persisted. All failures and actual closes are retained. New host dispatch has started; native actor start and final source/review/C2/UAT remain unclaimed. Strict same-family non-independence, QR02, qualification and release obligations remain open. Earlier dated states are historical.

Current progress, 2026-11-05T17:10:24.414951+00:00: **Q23_CONTINUATION_NATIVE_CONSTRUCTION_RUNNING**. One ABG-native Claude Opus5.5 xhigh Worker is completing the existing-owner identity/policy increment from the exact preserved partial. Q23-01 failed at its128-turn cap after129 turns; no C2/UAT or source acceptance followed. Q23-02 retains the same17 Product write paths, includes four missing fixture dependencies, reuses preserved baseline evidence and selects384 turns without changing time limits. Preflight25.126s; dispatch-to-selector15.719s; dispatch-to-coding120.346s. Setup was reused. Strict same-family non-independence remains; Q23 production eligibility, QR02, qualification and release remain open. [Current handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-identity-02/HANDOFF.md). Earlier dated states remain historical.

Current progress, 2026-11-05T15:33:48.148892+00:00: **Q23_IDENTITY_CONTROLS_PREPARING**. The owner instructed "go" after the remaining 5.0 task list. Root continues under STDO3.0.4 default same-family non-independence, with no exception. The next bounded native increment selects one actual configured identity at the existing transport binding and qualification-owner enforcement before dependent paid invocation. Historical contributor reconstruction remains the following QR02 increment; missing required correspondence stays unknown. N9 acceptance and immutable local/unqualified RC6 are preserved. No new coding Worker has launched. [Exact selection](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-identity-01/ROOT_SELECTION.json).

Current progress, 2026-11-05T09:35:33.447048+00:00: **N9_CLOSED_QUALIFICATION_POLICY_PENDING**. Accepted fixture successor source is locally preserved as `1f62c0095e6196b089071bb72e88217792edf6ff` (one test file; tracked clean, unrelated untracked work retained). Independent MAX source review, current installed C2 `5pass/0fail/2historical skips`, all4 commands, native UAT and equal fresh result/replay close N9-RETAINED-FIXTURE-01 only. The first failed Run and all prior failures remain unchanged. Q23 actual identity, contributor attribution/current qualification material, affected scenarios and S07 remain open. The governing reviewer-family policy question is pending; same-family non-independence remains the default. Immutable RC6 remains locally installed and unqualified. [Current handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/HANDOFF.md).

Current selection, 2026-11-05T07:35:02.243230+00:00: **RC6_BASED_5_0_QUALIFICATION_RESUMPTION**. The owner instructed "ok continue" after the remaining five feature-closure areas. Root selects a finite fifteen-family/current-evidence reconciliation, prerequisite blocker repair through one native coding Worker, installed scenario completion and existing F11/sole-AF22 qualification owners. Immutable RC6 source e7179b19b and its local installation are the baseline; publication, actual human acceptance and selector changes remain reserved. Exact control and subsequent results: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/ROOT_ACTIVATION.json`. RC6 native fixture task has returned: source review satisfied; all four test commands exited 0 and component tally is 5/0/2, but the Run failed on Root's omitted report-parent write territory before UAT. Frozen repair and failed history are preserved. Corrected proof-only recovery is being selected; Q23 identity/provenance readiness remains. Current details are in the campaign STATUS.json and fixture-01/ROOT_FAILURE_TRIAGE.json.

Current selection, 2026-11-05T02:16:33.790388+00:00: **LOCAL_RC6_CUT_INSTALL_COMPLETE_UNQUALIFIED**. Owner-selected RC6 is locally installed from source`e7179b19b50c3b2f918e59425667ed79239e4a68`/tree`68267aea291a2f8ae928d88e8956b0777726c1b5` on `codex/rc6-local-cut`. The source reproduces archive`sha256:e9ffe45c18f5a5e398ebd701d28c4e9239a9bcb1327e4ae6d8d7cec3c6f573c4` byte-for-byte; existing Product verification/lock/install, all5,325 payload correspondence, fresh installed-owner content check and independent MAX packaging review passed. The native-tested artifact differs in only six identity/generated members; substantive source and retained proof are conserved. Proof10 acceptance and actual09 failures/N9-RETAINED-FIXTURE-01 retain their exact standing. Full qualification and RC6 native-workflow performance remain open; no publication or global selector change. Handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/local-cut-rc6-01/HANDOFF.md`. No further activation selected.

Completed selection, 2026-11-05 AEDT: **TARGETED_INTERFACE_REFACTOR_ACCEPTED**. The selected IR-01 three historical cuts and IR-02 seven ordinary call expressions now use their existing shared owners; four obsolete wrappers and affected imports/fixtures are retired or migrated. No added functionality. Root accepts bounded T1-T5 on frozen source38933d61515b: actual12/0/0, all7 sandbox commands exit0,160 source/handoff matches,986 protected inputs unchanged, independent source/completion reviews and native UAT satisfied. The lifecycle completed; fresh result/replay agree and final source160 is unchanged. Native09 failures/skips and N9-RETAINED-FIXTURE-01 remain preserved with their coverage limits. Successor source remains uncommitted and uninstalled; immutable RC5 is unchanged. No next activation is selected. Wider R1-R7/C1-C5, full workflow performance of the new source, successor cut/install and qualification remain outside this completed activation. [Final handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/proof-10/HANDOFF.md); [Root conjunction](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/proof-10/ROOT_CONJUNCTION.json); [status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/STATUS.json).

Historical selection, 2026-11-04 AEDT: **SINGLE_ADDRESS_SPACE_CAUSAL_CONSOLIDATION**. The original owner outcome remains complete affected caller migration onto existing common-library owners, deletion of redundant paths/carriage, preservation of required work information and actual boundary checks, and measured proof for all R1–R7. Current stage **NATIVE04_COMPLETION_CONTINUATION_DISPATCHED**: native-03 exact frozen partial source is retained on independent max static review; no S0–S2 source regression was found. Actual native-03 build/pack and all91 source hashes passed, but C2 failed on an omitted output territory and report-path loss; no lane tally/UAT/terminal credit follows. [Selection04](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/ROOT_REENTRY_SELECTION_04.md) and [closed conjunction](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/native-03/ROOT_CONJUNCTION.json) select remaining callers, retirement of unconsumed wrappers, witness proof reconciliation and residual repeated-scan attribution. The [native-04 dispatch](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/native-04/execution/STARTED.json) uses the genuine prior close and corrected operator packet; one native coding Worker, xhigh. Reviews use frozen subjects at max. Full consolidation, actual C2/UAT and fresh closure remain open; all historical evidence and failures remain preserved. [Current status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/STATUS.json); [whole-path map](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/CONTEXT_AND_CAUSAL_MAP.md).

Completed RC5 delivery, 2026-11-04 AEDT: **BOUNDED_LOCAL_RC5_CUT_INSTALL_COMPLETE**. Source f49e7533ebedff0946383cb0c5380a6ecac7889d, archive4c098c827c9c2c1eb0022d8c205b09690c4c5a722e2b3881599f5602f06640a8; clean rebuild byte-equal and all5,325 installed payloads verified. Bounded37 current passes,18 retained method passes, independent source review, satisfied native UAT and fresh result/replay agreement retain their exact scope. STDO3.0.4 runtime inputs are staged. Local and unqualified; no push/tag/merge/selector/stable claim. Completed evidence and all failures remain preserved. [Handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/local-cut-rc5-01/HANDOFF.md).

Historical selections below retain their original wording and evidence. Their “current” labels refer to the recorded dates; the selection above, the current T-287 header and its linked status govern ongoing work.

Current selection, 2026-11-03: **RC5_APPROVED_PREPARING**. The owner approved the bounded [RC5 performance/reproducibility campaign](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/ROOT_SELECTION.md): runtime STDO3.0.4 migration, measured private retained-route carriage repair, reproducible inputs/evidence and separate actual RC4 setup/worker-launch/between-task timing. T-287 owns execution; installed RC4 remains immutable and unqualified. One ABG coding Worker at a time, with proportional independent max review. No stable release, publication, global selector change or repetition of completed qualification.

Completed source-pin selection, 2026-11-03 AEDT: **STDO_304_SOURCE_PIN_INSTALL_COMPLETE**. The owner selects STDO 3.0.4 for ABIogenesis source development before the RC4-to-RC5 campaign. The exact Definition pin and installed native skills are verified in the [adoption record](../.ai-workspace/comments/codex/20261103T073017Z_STDO_304_ADOPTION/README.md). RC4 source3c113133d and its installed local unqualified artifact retain their original STDO 3.0.2 basis and accepted evidence. Runtime default-library/qualification restaging and RC5 scope/campaign bindings remain separate work; no native coding activation is selected by this pin.

Completed RC4 delivery selection, 2026-11-03 AEDT: **BOUNDED_LOCAL_RC4_CUT_INSTALL_COMPLETE**. Root install79955/251333 exited0 on source3c113133d96d013743c1c1ec77d562abb0b2c05b/tree6ff1f9c51c6353abfaf01ced28a2f243a7a54d4d and archivef59. Actual LOCAL_CUT_RECORD1e93fb57, all11 SHA256SUMS entries and5,321 installed payload bytes verified; FINAL_INSTALL_VERIFICATION9402371f. Source tracked clean/index empty. Final handoff .ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/local-cut-rc4-01/HANDOFF.md retains accepted setup/source/C2/UAT/closure, prior bounded005/consolidation and one matched application pair. Local unqualified candidate only: publishedfalse/qualifiedfalse/selectorChangedfalse, no push/tag/merge or stable release; no further activation selected. Cold-history performance, ambient-env and whole qualification limits remain; prior019red/020failure preserved.

Historical selection, 2026-11-03 09:38 AEDT: **ATTEMPT017_CLOSED_BLOCKED_SELECTOR_GAP_SOURCE_HELD**. Native Result0dbcfc05/after2215e31c and all35 exact file snapshots remain held in subject001 ae9c9bea;7 MJS caller/proof changes, code/src unchanged. Subsequent selector stopped the Run at27349/22:34:18.546Z with default-library/gap@5; no C2 task/actor or UAT executed. Frozen workload has eight C2 selected native-recovery-16 input paths versus readRoots17 and stale Testing prose saying11 versus actual12 commands; exact selector output b1c10dcc retained. This is operator preparation evidence, not a Product failure or failed test. Actual outcome ended22:34:56.212Z exit0/blocked/terminalnull; fresh result not_found/replay blocked agree. Genuine after-run-resume10a2b22b binds427935724B/a148ba46 prefix. Attempt017 USD21.1508972/3F_P/196 reported turns; native40m49.447s, host50m04.046s, with11m46.354s recorded author-tool/operator search intervals, no causal runtime efficiency claim. Root delta review/disposition and exact next selection remain required; no source commit or retry selected. Provisional005 setup remains bounded accepted only; final candidate, C2/UAT, real paid witness, empirical/qualification/release obligations remain open.

Historical selection, 2026-11-03 08:35 AEDT: **ATTEMPT016_R1_OUTER_TIMEOUT_C3_PARTIAL_CUSTODY**. Wrapper/CLI timed out at21:28:05Z (10800084.571584ms), empty return/no final closeHandoff; Root graceful TERM of exact orphan C2 actor/helper groups completed quiescence21:29:43Z. C3 NativeResult2364a233/after7977d9d7 and all34 source files are held in SUBJECT0032262dcfe; only28 tracked changes were preserved as unaccepted custody commit0a8d330a32d5f577b424394c0424a1cd9abe519b/tree37256c94ccc68050275bfdd5e67f322911d48fc7, tracked clean. Physical third C2 package4589f5c5/all34 sandbox sources retained in C2_INTERRUPTED_CUSTODY187ff7ba; no final helper result/admitted third C2 verdict/UAT. Root accepts bounded C3 strict packed factory-chain closure (independent receipt11d5d973, zero diagnostics), and earlier002 caller corrections/all11 green C2 separately; whole HC2 remains partial. Existing owner resource-recovery packet is prepared for Root execution; no recovery yet claimed. External017 is limited to remaining UAT callers/harness, legacy patch removal and selected asset/child-history proof, inheriting reviewed C3. Prior014/015/first-C2 failures remain immutable. Fresh005, empirical proof, generated adoption, whole qualification/release remain open.

Current selection,2026-11-03 AEDT: **ATTEMPT015_R1_STOPPED_BLOCKED_BOUND_EXHAUSTED**. On source5331/operationalRC3/runtime002, first native Construction produced the held13-file HC1 subject; first C2 was red7/8 predicates because its schema-baseline fixture read the wrong environment key. The same Run lawfully selected and admitted a bounded repair: Result4bf2551f… at29420/17:35:15.338Z, after91155f34…, with only the proof test changed among the13 held files. Additive review-subject-002 preserves that exact return. Run stopped29501/17:37:14.594Z with recursion/bound-exhausted under unchanged bound4, before another Testing or UAT. Outcome ended17:38:08.175Z exit0/blocked/terminalnull; fresh result not_found and replay blocked agree. Six provider calls cost USD33.855755; cumulative native USD233.2309482/45F_P excludes practical004 USD0.8784886/3F_P. First C2 red and independent strict/schema proof retain their separate standing; no HC1 acceptance is inferred. Root disposition and source preservation precede HC2 canonical population/caller retirement, inherited bounded proof repairs and fresh005.015 preflight refusal/014 unmet evidence remain preserved; empirical, qualification, generated adoption and release obligations remain open.

Root disposition, 2026-11-02: **ATTEMPT011_CLOSED_COMPLETED / BOUNDED_R1–R5_CODE_AND_NATIVE_PROOF_ACCEPTED**, exact source4fda33bb60eaa3d5f105beebbbaea19d6fa7fe5e/tree d136d90f44921b2944579bf89fbac0075052920b. Root conjoins completed independent physical-source review with no blocker, all52 exact source-correspondence rows, actual9 C2 commands exit0/12 predicates (115pass/0fail/12skip focused,105/0/6 affected,2/0/0 artifact:222pass/0fail/18skip), admitted satisfied UAT with unresolvedCriteria[], and independently checked fresh run_result/run_replay/outcome terminal equality, equal replay coordinates and closed status. Session20849 exited0; native completion07:47:13.885Z. Acquisition had zero Product/generated changes. This accepts bounded code/native proof, not the distinct real-provider practical interruption witness, empirical comparison, S7 (unexecuted), whole qualification or release. Scripted installed integration retains its bounded standing;010 failed observation/null after and exact custody are unchanged. No new code/architecture/review cycle is selected. Practical real-provider witness packet is ready for Root setup/preflight review, with no setup/provider admission by Writer. Closed reported costs through011:USD126.2536854/25F_P (011USD16.8180892/6F_P); no practical-witness spend included. [Native outcome](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-011/execution/outcome-summary.json); [C2 correspondence](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-011/C2_OBSERVED_SUMMARY.json); [practical packet](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/practical-witness-001/HANDOFF.md).

Closed010 preservation, 2026-11-02: **ATTEMPT010_CLOSED_RUNTIME_FAILED / UNADMITTED_PHYSICAL_CANDIDATE_PRESERVED**. Successful provider report was followed by post-work observation failure symlink_forbidden (Result36055); after/changedPaths/lastObservation are null, Run runtime_failed at36087, no terminal or formal C2/UAT. Exact12receipt-matched Product changes are preserved at4fda33bb60eaa3d5f105beebbbaea19d6fa7fe5e/tree d136d90f44921b2944579bf89fbac0075052920b, parent7e914327. Root-selected cleanup removed only scratch10/repo and tmp contents after proof custody/quiescence; tmp inode678358047 remains empty. File-only projection1310entries/42,385,214B has no forbidden symlinks; this is feasibility, not native admission. This closed010 preservation preceded the now-dispatched011 acquisition; no native010 after-observation is inferred. Formal C2/UAT, R2/practical witness/empirical acceptance/qualification remain open. [Physical checkpoint](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-010/PARTIAL_CHECKPOINT.json); [cleanup/custody](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-010/physical-candidate-001/CLEANUP_RECEIPT.json).

Attempt005 closed, 2026-11-02: **PARTIAL_PRESERVED / ROOT_TRIAGE_REQUIRED**, source `365d2ed2b` (tree `d3d223915`). Native Construction succeeded; main Testing preparation failed at event25008, then host resource completion failed with a missing runtime lease and the wrapper exited1. No main native C2/UAT or fresh readbacks; `after-run-resume.json` retains stale attempt003 prefix208880619 and must not be used as a successor handoff. Root triages environment/preparation/re-entry; no next packet/runtime selected. Original R2/full campaign, practical witness and qualification remain open; 10:00–14:00 AEDT ETA is under review. [Exact checkpoint](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-005/PARTIAL_CHECKPOINT.json).

Current dispatch, 2026-11-01T16:40:51.168Z: attempt005 **DISPATCHED_AWAITING_NATIVE_PROGRESS**, Root session31474/pid19519, on partial `becc45851` with pinned RC3. [Exact handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-005/HANDOFF.md) and [monitor status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/STATUS.md) own current routing. Attempt004 refused during preparation with zero Run admissions/provider cost; operator overhead remains measured separately. No actor completion, original predecessor R2/full-campaign closure, practical-witness acceptance or qualification follows.

Root attempt003 dispatch, 2026-11-01T15:26:40.082Z (2026-11-02 02:26 AEDT): **DISPATCHED_AWAITING_NATIVE_PROGRESS**, session2245/pid63011, after installed RC3 preflight and exact generated-call review. [Latest handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-003/HANDOFF.md) and [monitor status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/STATUS.md) retain actual evidence. Partial preimage `6dffbc0ad`, failed attempts and frozen inputs remain preserved. Whole R1–R5/predecessor recovery/practical installed proof remain required; no native completion, qualification or efficiency claim follows from this dispatch.

Root attempt002 dispatch, 2026-11-01T13:40:26.808Z (2026-11-02 00:40 AEDT): **DISPATCHED_AWAITING_NATIVE_PROGRESS**, session39186/pid80968, after successful installed RC3 preflight and exact generated-call review. [STARTED](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-002/execution/STARTED.json) and [monitor status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/STATUS.md) own the subsequent observations. Source is still partial `5559656d3`; this snapshot claims no native Construction start/completion, recovery acceptance or qualification.

Current selection, 2026-11-02: RC4 attempt001 is closed `runtime_failed` after partial native Construction. Local PARTIAL checkpoint `5559656d3` preserves the eight changed files without acceptance. [The next concrete packet](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-002/HANDOFF.md) is **PREPARED_FOR_ROOT_REVIEW** for current-state completion using pinned installed RC3; no new runtime start. Editable HOW stays live, invariant sources are disjoint from writable scope, and the Worker chooses development/rollback methods within the same causal grant. R1–R5, C2/UAT, actual installed interruption recovery, efficiency and qualification remain open.

Root passive observation, 2026-11-01T12:29:16.728Z: **NATIVE_CONSTRUCTION_RUNNING**. Native Construction invocation/process starts are recorded at ordinals1190/1191 (process23031); Root session46412 is still running. [Status and exact Run](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/STATUS.md) supersede the awaiting-progress snapshot below. Source/task result, Testing/UAT and the real installed interruption witness remain pending; this is progress, not completion or qualification.

Root dispatch, 2026-11-01T12:27:38.511Z: the campaign is **DISPATCHED_AWAITING_NATIVE_PROGRESS**, using pinned installed RC3 toward RC4. Root launched the one-shot reviewed native call (session46412, pid21991); [current status and evidence](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/STATUS.md) supersede the PREPARING snapshot below. Native coding actor progress and output have not yet been observed in this snapshot. Actual measurements continue; no recovery completion, qualification or release is claimed.

Owner selection, 2026-11-01: the exact installed local RC3 (`bcb1faf63` / archive `70de04c3`) is pinned as the operational builder for the [RC4 native recovery campaign](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/ROOT_SELECTION.md). Begin point-one retained native-context recovery, consolidation and affected debt retirement; current stage **PREPARING**, awaiting exact preparation and Root admission before dispatch. Actual use measures wall time, provider use, tokens, event bytes and reuse, with like-workload comparisons only. RC3 remains local and unqualified; its immutable artifact, RC2 and historical evidence are preserved. This campaign selection changes no global selector, selects no publication, and closes no existing Product or efficiency obligation.

Root local-cut completion, 2026-11-01: source `bcb1faf63cfb39bd7ccf7e14b48b133d1163216b` / archive `70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd` is now a bounded LOCAL, unqualified RC3 development candidate with completed owner installation ([actual handoff](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/local-cut-01/HANDOFF.md)). Root session37197 exited0; verification/install/full 5,321-file payload equality and all retained checksums/identities agree, with zero provider calls. Narrow native N1–N4 and actual installed C→T→UAT/14-check oracle/fresh closure/source conservation/cold read retain their accepted exact-subject standing. F4 stays deferred P1 (`T287-P1-F4-ROUTE-CARRIAGE-01`); body-once overall, F5/965 scaling, native-context predecessor-member recovery and whole qualification remain open. The exact release directory is frozen. No external publication/tag/push, default-selector change or stable release was performed or selected. Earlier dated not-cut statements remain historical.

Owner budget direction, 2026-11-01: authorized R&D development may exceed the
previous dollar allocation and budget-only stop thresholds. Continue tracking
reported actual costs and unknown charges; budget enforcement applies once the
Product is stable. The [current operator guidance](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/NEXT_ACTIVATION_LIMITS.md)
supersedes earlier R&D monetary limits. This changes no work scope, authority,
qualification or release obligation and does not itself activate a provider.

Current P1 reprice, Root admission2026-11-01T05:18UTC: [P1-03 disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/ROOT_DISPOSITION.md) selects the prospective N1–N4 ten-owner narrow completion at source9c4a5c5e, superseding the undispatched53-path completion packets. Restore first renderer physical-facts relation/exact C2 pin, remove compensating carriage, execute the resolver fixture/refusals and declare the existing typed pre-P1 value-use boundary. No blanket coordinate/nativeidentity/crossRun holder rewrite. Original full P1/native-context continuation remains partial/open; generic exact-intent payload recovery is separate. Root alone dispatches after exact review; worker controls strategy within declared effects. Later one same-workload14/14 composition/resource observation is separate; no arbitrary10%B11 or release claim. Initial intake and prior proofs remain retained below.

Owner instruction and Root admission, 2026-11-01: fix the confirmed single-machine
context-carriage P1 through the existing admitted-body and owner-reference path.
The bounded [design and activation](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/DESIGN_AND_ACTIVATION.md),
[prospective amendment](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/AMENDMENT_01.md)
and [admitted native preparation grant](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/NATIVE_GRANT_ADMITTED.json)
select the exact97406077 checkpoint and isolated successor worktree. ABG native
Worker alone authors Product HOW/code/tests; Root alone selects the final reviewed
call and provider dispatch. Preserve the one log, saga, currentness, typed refusals
and cold recovery; retire redundant carriage/check paths without a new store,
service, controller, generic registry or legacy branch. This selects the actual
repair after bounded design admission, not a preview cut/release or a claim of
efficiency already achieved. All earlier accepted/failed/partial proofs,
witness003 gap and qualification obligations retain their original standing.


Owner selection, 2026-10-30: release and deploy explicitly unqualified
development `5.0.0-rc.1`, then use installed RC1 to build RC2 with one honestly
identified agent operator proxy. The proxy observes failures, logs bugs and
recovery, keeps remaining RC2 work progressing, and measures accepted output,
time, intervention and actual cost including its own contribution. This
supersedes the earlier pre-publication sequencing only for the selected
development preview. Final fifteen-family/native qualification and stable
5.0 acceptance remain open. T-287's `T287-RC1-PREVIEW-PREP-01` freezes the
reviewable artifact and local owner installation before Root dispatches exact
external publication; no automatic green verdict or native snapshot is implied.


Observed checkpoint, 2026-10-31: RC1 is published and deployed. Its bounded
single-proxy build trial produced local unqualified RC2 candidate `d1e4527db`,
with a passing build and twelve selected tests. Native UAT remains unmet and
the Run blocked; the Executive accepted only local candidate delivery after
reconciling existing artifact evidence against the original criteria. This is
not native qualification or RC2 publication. The [candidate receipt](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01/candidate-009.json)
and [disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01/executive-disposition-009.json)
retain those boundaries, the $35.6671188 reported provider cost, unknown proxy
cost and surviving obligations. No trial worker remains active.

Owner continuation, 2026-10-31: “review, fix, and continue on using rc2 being
used to build rc3”. The Executive interprets this as selecting the necessary
local development deployment of the RC2 candidate subject to its current review
and the reviewed GC-03 shared-context dependency, followed by a bounded
RC2-built RC3 effort.
Preparation, exact subjects and activation stops are retained in the
[RC3 operator carrier](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/PREPARATION.md).
Root remains the sole ABI operator proxy. This selection does not publish RC2,
qualify the whole Product, revise native Run 009's blocked result or unmet UAT,
or itself activate a provider or an ABI runtime. Preserve the original
acceptance criteria and surviving native and qualification obligations.

Observed continuation, 2026-11-01: RC2 was used to build a local RC3 artifact,
but the required real-owner governed-context test failed during test setup.
Five separate STDO tests failed because `stdo` was unavailable on the C2 PATH;
neither result establishes a Product regression. The RC3 worktree and artifact
remain unqualified and unreleased, and the native Run closed blocked. Root
stopped further paid coding and the installed witness; the earlier 03:30–04:30
AEDT release ETA is withdrawn. The [delivery status](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-008/DELIVERY_STATUS.md)
records the actual C2, costs, preserved RC2 verdict and remaining obligations.

Owner selection, 2026-11-01: prioritize a lawful installed sunny-day graph
that performs work, evaluation and consequence across at least two causally
joined iterations to an independently checked useful output and terminal
Result; then prove cold recovery and continuation from admitted event truth.
The [sunny-day plan](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/SUNNY_DAY_PLAN.md)
separates controlled graph mechanics from bounded live `F_P` evidence. This
changes sequencing, not Product law or the preceding failed-Run standing; it
does not activate a provider or waive remaining qualification and release work.

Bounded checkpoint, 2026-11-01: the selected basic-cli Run completed with an
actual terminal Result and independent oracle satisfied. Root accepted its
one-Run evaluation-directed traversal claim after independent review. The
[disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/sunny-day-001/SUNNY_DAY_DISPOSITION.md)
retains exact evidence and limitations. Cold recovery, repeatability, GC03 and
whole-Product qualification and release acceptance remain open.

Bounded recovery checkpoint, 2026-11-01: Root accepted controlled cold
continuation through explicit replacement-Run lineage after independent review;
the successor result/replay closed and a superseded request refused. The
[recovery disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/recovery-001/RECOVERY_DISPOSITION.md)
does not establish physical-crash recovery, correction, repeatability or
broader Product qualification.

B07 observation, 2026-11-01: the bounded GC03 mechanical Construction
ended `runtime_failed` at its provider turn limit without a terminal Result or
admitted C2; a named scratch test passed but is not native acceptance. The
[disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-009/B07_DISPOSITION.md)
retains the frozen source and independent-review context. The later B09
Testing → UAT Run did not carry a prior Construction Result.

B09 and witness observation, 2026-11-01: all nine native B09 C2 commands
passed, but native UAT was indeterminate and the Run blocked. A separate actual
fixed-client witness reached the lookup, then failed native Construction admission
on a StructuredOutput marker false positive; no Construction Result was admitted.
The [failure disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/witness-001-prep/observation-b09/failure-02/DISPOSITION.md)
retains the exact counterexample. Root accepted the bounded three-path B10 repair after native C2 and satisfied
UAT; its parent completed and fresh result/replay agree. The [B10 disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-012/B10_DISPOSITION.md)
retains the exact evidence and limits. Root selected its tested artifact for a
separate W1–W5 witness. Its Testing and Construction Results were admitted,
but the bounded parent blocked without a terminal. Root accepted bounded W1,
W2, W4 and W5; W3 cold authentication remains open because the endpoint is
only in an unadmitted sidecar and the admitted environment digest cannot be
reconstructed from retained inputs. Root accepted bounded B11 JSON-escaped endpoint-prompt repair after native C2,
satisfied UAT, completed parent and matching fresh reads; see the [B11 disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-013/B11_DISPOSITION.md).
Root selected its tested artifact solely for a fresh W1–W5 witness. Witness004
admitted Testing and Construction and produced a mechanical cold-correspondence
proof; Root accepted original bounded W1–W5 for that fresh Constructor
host-mediated Run after independent trace and cold-proof review. Its parent
blocked without a terminal, and the original witness003 cold join remains unproven; see the [witness disposition](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/witness-001-prep/observation-b10/WITNESS_003_DISPOSITION.md).
Foundation acceptances and broader qualification and release obligations
retain their stated bounds.

Owner selection, 2026-10-21: ABG's
[library of common computational capabilities](../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md)
is a prerequisite deliverable before returning to the 5.0 release. The
deliverable comprises accepted design, usable common implementations, actual
consumer adoption, removal or justified retention of duplicate computational
responsibilities, executed obligations and independent acceptance. Remaining
release integration, lifecycle, qualification and publication work waits for
that acceptance. Bounded integration and installed proof needed to deliver
the library belong to the library work package.

The [L1 design baseline](../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/disposition.md)
and [exact L2 design](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/disposition.md)
retain their historical acceptance. The [operator-family library design](../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md)
supersedes the bounded C1 to C5 contracts of Root’s [conjunction](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/common-consolidation-conjunction-01/decision.md).
The library is on `main` at the commit that
[post-close repair H](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md#post-close-repair-return-h)
records. O-RESOURCE, O-SHAPE, O-CODEC and O-KEY are closed with their sites.
O-SCHEMA is closed at the raw owner boundary. O-TYPE is closed at every census
site that feeds an equality, digest or admission atom (D11, D12, D13, D14;
[post-close repair C](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md#post-close-repair-return-c)).
The five lifecycle failure subjects carry the typed projection of their
transition, with each outcome's own durable coordinate and Run selection in
place of the owned prefix object. A plain record or array of any realm is
admitted by structure. No private structural equality introduced by the plan
remains. The post-close review's helper-route finding is repaired (D15,
post-close repairs D and E): the helper publishes a failure after launch as
its artifact's `failure` disposition, prints its acknowledgment of that
artifact and exits non-zero; the worker returns the acknowledgment unchanged;
the parent binds it to the artifact before it reads the disposition and
carries the admitted subject inline as the leaf failure's diagnostic
reference, with the Product failure value unchanged. An installed C1 to C2
case drives that route from the helper's exit, through a controlled worker
that relays the helper's stdout, to the admitted result and reads the subject
cold. The
streaming-fold finding is repaired: the derivation advances one owned working
state in place, with no per-call copy of the fold state. The C2 suite's
prompt-digest fixture and the reacquisition seam lane are repaired. The
[T-287 delivery close](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#library-delivery-close-2026-10-23)
records the evidence, the remainders migrated as touched and the items the
owner decides. This is not full migration, source-readiness acceptance or a
release. The coverage critique remains substantially upheld; real completed
contractions are retained.

The owner’s purpose remains **“the purpose of the calculus is to strip out old
fixtures, to remove massive tech debt”**. The conjunction’s finite scope (24
simple equality bodies, 13 local exactly-one helpers, three stream framers,
five shared plus 38 local shallow guards, five shared plus one private NUL key
body) and its five [source freezes](../.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/common-consolidation-reentry-01/decision.md#completed-bounded-source-and-design-cuts-retained)
are historical. The operator-family design disposed each row in its step
records, and their content is on `main` in the commit chain the
[T-287 delivery close](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#library-delivery-close-2026-10-23)
records. What the delivery left is in the
[technical debt register](../.ai-workspace/TECHNICAL_DEBT_REGISTER.md): seven
local record guards and two private key-set bodies (TD-13), the line framers
(TD-23) and 55 casts outside the census (TD-14).

The lifecycle law, the pre-event matching-Run Actor census and one
Run-initiated cleanup token until Actor consumption, is realized as the rule
`actor_process_lifecycle` in the one fold (design §4.4, which also records the
one term the realization omits as vacuous on admitted prefixes); its step 6
and 7 lanes and repair A’s liveness cut are green. The helper’s command and
HTTP final facts reach the parent as its artifact’s `processFacts` member
(D8 reads an older artifact as facts not recorded), and a failure after launch
reaches the admitted failure as its inline diagnostic subject (D15). The
conjunction’s cross-consumer handoff, with its `process-failure.json` and
stateless inspection, is withdrawn (D0).

Next, under [T-290](../.ai-workspace/tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md):
Phase B, the registered debt wave, is closed at `a8937b837` (twelve packages
in the ticket's order, each with its record, proof and register closure).
Phase C, the packages the owner agreed on 2026-10-24 under the log principle,
is closed at `acb5200a89e49e0336173d8841ff5cbc43b546a6` (24 packages with T-291's six interleaved; TD-04, TD-05
and TD-12 closed and O-3 closed by design; the F_D disposition ten of twelve
rows Eligible); L5 delivery acceptance is recorded (2026-10-24); release work
(Phase D) has started under T-287 with D0, the runtime default-library
successor, on the owner's order. L4 remains partial on older subjects, including P1 pass/P5
timeout; L5 delivery acceptance is recorded (2026-10-24). No new broad design-review campaign is
selected. Old failed cuts and main generated936 remain protected.

The owner's Executive correction applies [proportionality and steel-thread
controls](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#design-and-proof-controls):
reuse exact applicable evidence, repair and reprove only affected relations,
and widen the earliest real entry-to-outcome path by material uncertainty.
Review findings inform Executive priority and boundary decisions; they do not
activate a new review campaign. Product/authority and supported-path blockers,
the release-resumption gate is open after L5 (2026-10-24); release work runs under T-287 Phase D from the Phase C close (2026-10-27).

The intended asset is a reusable computational basis from which feature
behaviour is composed. The calculus identifies common structure, contracts
and lawful compositions so independent computational solutions do not
proliferate. Explicit obligations state what execution must establish;
execution and assessment determine actual outcomes and discharge.
[Product's prerequisite boundary](PRODUCT.md#common-computational-library-prerequisite)
selects this bounded deliverable while preserving the fifteen families,
semantic owners and release qualification. Optional compression outside the
deliverable retains its existing allocation.

Owner selection, 2026-10-21: apply STDO 3.0 thoroughly to ABIogenesis 5.0.
Reconcile the requirements calculus with the TypeScript tenant's declared
computational calculus and execution environment. Use the existing GTL, HoG,
ABG, Event Calculus and Effect relations; expose missing material decisions,
failure cases, effect boundaries and computational obligations through their
owning design. The [reconciliation](../.ai-workspace/comments/codex/20261021_STDO3_ABG5_RECONCILIATION.md)
records applicability, changes, evidence limits and the remaining work.

The [accepted reconciliation](../.ai-workspace/work/T287_STDO3_RECONCILIATION_01/disposition.md)
establishes the preceding Product/requirement binding, computational design
basis and delivery plan under the exact method. The library design refines
that basis and supersedes its next-work ordering.
Product re-entry removes the mandatory legacy companion-cohort assumption
from the STDO runtime template while preserving explicitly declared source,
access, context and admission obligations. This changes the current destination;
the bounded source increment is frozen while affected installed proof remains
open. Historical Runs keep their admitted method and dependencies.

After library acceptance, the release path resumes toward one complete
installed application lifecycle with consequential correction and preserved
work across restart. T-287 admits only its named, bounded prerequisites.
A design claim of exhaustive coverage
states its domain, legal compositions and independent evidence; a document,
matrix or test count cannot establish whole-Product completion. Existing
materially correct relations and applicable evidence are retained. Older
routing below preserves history and cannot reactivate a superseded attempt.

Owner selection, 2026-10-27: pin ABIogenesis source development to the published
STDO 3.0.2 line, exact immutable `v3.0.2` and manifest selected by
[`stdo_abiogenesis.json`](../stdo_abiogenesis.json). The
[adoption record](../.ai-workspace/comments/claude/20261027T224556Z_STDO_302_ADOPTION/README.md)
binds the digest-bound adoption, the verified install and the method routes
rebound to that cut. This method selection preserves the current Product
outcomes and the T-287 work. The runtime default-library snapshot and the
qualification authorities move to the same cut in T-287 Phase D's S1; retained Runs,
qualification evidence and derivation links keep their original exact bases.
The deterministic-kind (F_D) claims are unchanged under 3.0.2.

Owner selection, 2026-10-25: pin ABIogenesis source development to the published
STDO 3.0.1 line, exact immutable `v3.0.1-rc.1` and manifest selected by
[`stdo_abiogenesis.json`](../stdo_abiogenesis.json). The
[adoption record](../.ai-workspace/comments/claude/20261025T022614Z_STDO_301_ADOPTION/README.md)
binds the digest-bound adoption, the verified install and the method routes
rebound to that cut. This method selection preserves the current Product
outcomes and the T-290 work. The runtime default-library snapshot keeps its
exact `v3.0.0-rc.1` basis until T-287 Phase D's D0 moves it; retained Runs,
qualification evidence and derivation links keep their original exact bases.
The migration of deterministic-kind (F_D) claims under 3.0.1 is T-291 M-2.

Owner selection, 2026-10-21: pin ABIogenesis source development to the published
STDO 3.0.0 line, exact immutable `v3.0.0-rc.1` and manifest selected by
[`stdo_abiogenesis.json`](../stdo_abiogenesis.json). The
[adoption record](../.ai-workspace/comments/codex/20261021_STDO_300_RC1_ADOPTION/README.md)
binds the standalone method, V3 source routes and empty companion composition.
This method selection preserves the current Product outcomes and T-287 work;
prior Runs and qualification evidence retain their original exact bases.

Owner correction, 2026-10-06: Hello World is the minimal language test, never
an ABG Product or feature. T-287 removes its built-in code, contracts,
publication, admission/proof branches and the false live grants. F14 retains
installed language/runtime mechanics proof using an externally authored test
program. Existing S6 application-lifecycle evidence retains its original bounded
subject; it cannot qualify the changed package. Prove the affected generic and
installed joins on the exact successor. This correction selects no new feature
or Hello Product.

Owner selection, 2026-10-06: odd_glc, its T-043 campaign and Data Mapper work
are deselected from ABG delivery. T-287 owns the native runtime, default
library, lifecycle proof and RC1 candidate work. The fifteen Product families,
including the generic F17/S06 specification-driven lifecycle, remain selected.
Use the installed ABG default library and accepted external application witness
only within its original lifecycle evidence; prove affected joins on the exact
candidate after removing the built-in test code. Preserve
original paired-campaign sources, producers and evidence within their recorded
claims. New odd_glc implementation, qualification, publication, retirement or
Data Mapper execution is not a delivery dependency. This selection supersedes
older paired-campaign routing below; it does not declare that work completed.

Owner test selection, 2026-10-06: remove legacy tests with no current purpose
and establish an ABG-owned sandbox UAT harness for the six original Hello World
test workloads and full Data Mapper test workload. Acquire their original
inputs and independent acceptance oracles into ABG test territory, then use
clean deployment and current installed public ABG/default-library contracts.
Test preparation and execution shall have no dependency on odd_glc. Hello World
and Data Mapper remain test workloads, never built-in Product functionality;
this selection resumes no odd_glc or T-043 delivery. Preserve useful current
regression tests and original evidence. Every run archives its actual installed
identity, requests, observations, events and fresh readback before teardown.
Harness setup, actual live UAT success, qualification and release acceptance
remain distinct claims. [T-287 sandbox UAT plan](../.ai-workspace/work/T287_SANDBOX_UAT_01/plan.md)
owns this increment; it creates no additional seven-case RC1 prerequisite.

Historical setup acceptance, 2026-10-06: 20 obsolete test files and 21 exclusive helpers
are removed; seven original workloads and independent oracles resolve locally;
the ABG-owned harness and actual clean Public `basic-cli` preparation are
independently accepted. At that setup cut, live application UAT results were
0/7, unexecuted. T-287's current plan owns later execution status.
[Bounded setup acceptance](../.ai-workspace/work/T287_SANDBOX_UAT_01/acceptance.md)
records exact subjects, readiness, proof and limits. Qualification, RC1 and
human acceptance remain open.

The owner's added disk-recovery selection is completed for 313 older generated
dependency/cache trees: 14.589 GiB allocated removed, with 14.946 GiB more
filesystem space observed available during cleanup. Current accepted subjects,
work/evidence, UAT archives and original workloads/worksites are preserved;
retired historical dependency installations require reconstruction for reuse.
The acceptance record links the exact removal receipt. This cleanup creates no
automatic retention policy or new release gate.

### Recursive Executive and default graph library

Deliver composable governance in which reference frames determine the questions,
observations and criteria applied by ordinary graph work. GTL overlays compose
graphs; HoG executes their declared F_P/F_D evaluations; ABG admits the results
that govern subsequent work. The default Executive/lifecycle library selects
preregistered graphs by their declared functional purposes and contracts and
revises that choice as evidence changes, preserving the original outcome,
authority, valid results and unresolved obligations. Dynamic graph generation
is future graph-defined work outside this increment. Installed minimal scenarios expose the
actual framework path without embedding the scenario's solution in the runtime.

[Intent](INTENT.md#int-008---composable-reference-frame-governance),
[Product calculus](PRODUCT.md#graph-composition-and-reference-frames) and
[Product release allocation](PRODUCT.md#50-and-51-release-boundaries) own the
meaning and scope. [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#framed-governance-definition-re-entry)
owns the execution plan and acceptance. Deterministic registered selection,
exact child input, ordinary foldback and fresh Public reads are accepted. Three
real native choices/gap, the reviewed profile-scope correction and the installed
changed-choice/recursive-parent composition are accepted within their recorded
evidence limits. The owner's problem-to-selected-synthesis clarification is
accepted as one frame-bound library capability under the existing calculus and
Event Calculus. T-287 selects implementation of its typed result and declared
consumption, compact current judgment, admitted foldback provenance and truthful
supplied-work assessment. S5's reviewed installed pair is accepted: supplied work
passes Testing/UAT without an author; faulty input produces actual failing Testing,
revised Construction, passing Testing and independent UAT. Both parents/Runs close
and fresh Public result/replay agree. The event log preserves each framed mapping,
reason, explicit choice and actual consequence. Prior failed outcomes remain
preserved. S6's complete installed Hello lifecycle is now
[independently accepted](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#s6-complete-installed-lifecycle-acceptance):
a failing baseline leads to selected correction and passing retest; four lifecycle
assets are authored; actual independent assessment supports all seven obligations;
ordinary parent/Run closure agrees with fresh Public reads. This is a bounded
witness, not a general model-reliability claim. The [retained-work installed proof](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#retained-work-installed-acceptance)
is independently accepted: current F_P selection consumes the original admitted
producer through a fresh invocation, independent assessment and new parent/Run
closure. This is ordinary workspace progress. The separately selected
[exact ConstructionIntent continuation](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#exact-intent-bounded-acceptance-and-selected-action-how-disposition)
is independently accepted for the scalar same-authority pure-producer and
undispatched-consumer case, including parent/Run closure and cold reads. This is
installed deterministic fixture proof. The bounded installed
[selected-action continuation](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#executive-bounded-installed-selected-action-acceptance)
is independently accepted for its same-basis and covered-current occurrence
populations. Remaining scenario coverage and exact-candidate release
qualification remain open.
Security containment remains outside the owner's selected scope; observed
violations remain recorded without making contrary assessment claims true.
T-287 owns selected native default-library work. Earlier T-043 consumer-asset
and retirement records retain historical evidence only. The rejected planner and its
dedicated tests are removed; valid graph assets and native continuation remain.
The [execution record](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md)
owns exact grants and evidence. Partial proofs do not establish whole-Product
qualification or release readiness.

### Current delivery objective

First design the [common computational capability library](../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md),
using the [computational binding](../build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md)
for its laws, obligations and execution boundary. Common capabilities and
their compositions are the reusable asset; actual outcomes require execution
evidence under the owning obligations.
The current T-287 plan supersedes historical work ordering while retaining
still-applicable accepted semantics. Its design, implementation, controlled
integration, genuine lifecycle, qualification and release exits remain
distinct.

Deliver the fixed fifteen-family ABG5 runtime through the existing GTL/HoG/ABG
owners. Preserve the accepted execution/context calculus, generic core repairs,
original task/oracle and still-valid evidence. The withdrawn consumer extension
cannot serve as current implementation authority or release acceptance.

Preserve the accepted external Hello application test's bounded correction,
independent assessment and fresh Public readback as evidence for its original
candidate. It supplies no current built-in Product authority or successor
qualification. Preserve accepted retained-work source/use;
ordinary continued work does not require rebuilding a failed Run's parent stack.
Preserve the bounded accepted exact ConstructionIntent and installed
selected-action continuations. Complete applicable remaining scenario joins
and their exact-candidate proof, then qualify the final candidate before RC1 through existing
F11, sole AF22 and release owners. Each failed iteration receives a bounded
causal disposition before further execution; unaffected evidence is reused.
Publication, installed-RC qualification and actual owner acceptance remain distinct.

The [current library closure](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/rc1-library-closure-controls-01/return.md) accepts independently reviewed G1 finding/citation conservation, G3 canonical parent-alias Source/component evidence, G2 eight canonical-owner exports and the GTL serialization/API/schema/corpus core. The core's exact seventeen-path cut passes strict compilation, offline packaging, complete composed-schema checking and source-blind native/API/declaration/catalog/roundtrip/corpus proof: all twenty-three selected tuple occurrences are closed and all twelve tests pass. Its independent acceptance is Source/component/package only. Preserve the original stopped cuts and valid bounded evidence. Working files and retained proof use separate work/evidence storage; comments hold permanent explanation. C10 construction is accepted; its actual Setup10 completed fourteen Public calls, two admitted installs and four Program conformances and is in independent assurance. Current installed G1/G3 whole-path proof, four drift mappings and constitutional adjunct, remaining mandatory Public content, genuine F11, defect cases, exact qualification and release remain open. C10 is a bounded development witness.

The [bounded consumer reuse repair](../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/rc1-library-closure-controls-01/return.md#existing-evidence-consumer-repair-accepted-2026-10-05) is accepted after independent review. Native View results feed canonical selected-resource and scoped component preparation; a separate fresh consumer authenticates the original historical Result/J without replay or copied historical bodies. Consume the reusable caller/preparation helpers and original durable owners in subsequent work. Preserve complete required inventory, provenance and unresolved obligations. The enclosing manifest still requires a full cold read; current-candidate installed preparation, advancing-resource proof, current semantic qualification and the installed G1/G3 → F11 → sole AF22 → fresh-read chain remain open. No RC1 qualification follows from this bounded acceptance.

The [Public preparation bridge](../.ai-workspace/evidence/T287_PUBLIC_PREPARATION_PROOF_REPAIR_01/acceptance.json) is independently accepted for Source/component/package use. The qualification/m05 facade directly exports the existing resource/preparation owners and canonical types. Two distinct responsibility bindings and embedded/reference forms pass all seven source-blind checks; generated declaration/catalog/capability views preserve their owner relation. The exact successor archive is c54721805a8adb73c3fa74ee8c3c04126dc5bd7ad2da542967b9292c6a4943e5. Next prove an authentic controlled failure A plus required uncovered B through native F11, sole AF22 and fresh reads on a fresh installation/log, then obtain one genuine independent assessment. All declared slots remain authenticated; the bounded inventory declares incomplete coverage. No runtime or qualification closure follows from the bridge.

T-287 owns the selected native lifecycle, runtime and release work. No odd_glc,
T-043 or Data Mapper work is selected. The records below preserve earlier bounded
results and selections; they do not override the current selection, supply new
work authority or activate recovery of the retired planner. T-287's current
bounded grant owns execution.

Historical paired-campaign record: GOAL-035/T-287 and T-043 retain their recorded
fixed fifteen-family ABG5 outcome, original
job/S1–S5/oracle, five selected/four outside residuals and protected worksite.
That campaign used STDO 2.5.1 RC2 for ABG and RC4 for GLC. Earlier bounded acceptances remain
historical evidence. [Root disposition](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/continuation09-disposition/disposition.md) retains the predecessor conjunction.

Predecessor core04/consumer01/caller02 source readiness and compiled09/dev.5
[package/caller readiness](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/composite-review-01/package-readiness-return.md)
remain accepted (`f596f35e…` / `f3d85f69…`; archives `ddce524a…` / `f266d072…`).
Root now accepts [recovery02](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/held-continuation-recovery-02/recovery-return.md)
and the [ordinary original caller02 execution](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/held-continuation-launch-controls-02/return.md)
only through its actual first F_D/J/R10 compact-prior conjunction. Recovery,
final binding and preparation are complete. The full continuation failed in
native F_P preparation before actor dispatch or application effect; genuine
close is 1,241,896,147 B, fresh replay is failed and Result is not_found. All
35 selected files remain unchanged. The [older OOM Run](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/held-continuation-launch-controls-01/return.md)
remains historically nonterminal; its failure is neither erased nor retargeted.

Root accepts the seven [S02 continuation17](../.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-17/return.md) case outcomes in their exact
deterministic/native scopes. Mixed F_D/F_P succeeded before F_H admission failed;
the resource genuinely closed at 23,360,130 B and all 19 fresh reads are retained.
The seven passes and earlier nested-compose acceptance are preserved.

[F_H source repair](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/fh-hold-repair-01/return.md) (`96a89f0e…`) and
[native preparation/GLC declaration repair](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-preparation-repair-01/return.md)
(`96dfe183…`) are accepted by Root for source readiness after [max independent review](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/continuation-repair-review-01/return.md)
(`0ae3209b…`). [Combined compiled10/dev.6 package and caller readiness](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/composite-native-02/disposition.md)
is CLOSED: archives `7b6791d3…` / `4f96ba95…`, exact offline install verification,
original caller03 and mixed-only continuation18. Root accepts [original03](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/continuation10-native-verification-01/return.md) for repaired F_P/admission/foldback and its truthful construction-only `stage_revision_required` block; all 35 files remain unchanged and the genuine close is 1,285,520,237 B with fresh outcomes. [Mixed18](../.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-18/return.md) reached truthful human hold with accepted fresh-read scope; its result-only caller assertion defect remains retained. Seven prior S02 passes are preserved. [Accepted compiled13](../.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-13/return.md) and existing dev.7 completed the [Design-reentry attempt](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/held-design-reentry-launch-controls-01/return.md) (`51a0bd5a…`) with lawful independent Design-assessment refusal. All 35 original files are conserved; the rejected new Design remains preserved and was not promoted. No further Data Mapper attempt is selected. [Basic-cli's retained core13 execution](../../odd_glc/.ai-workspace/comments/codex/20260924_HELLO_PROJECT_BASELINE/core14-readback-03/return.md) used [two genuine Claude calls](../../odd_glc/.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-12/actor-evidence.json): 19.490 s construction and 29.555 s execution. All four authored predicates and five tests pass with fresh installed [compiled14](../.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-14/return.md) Public result/replay. This is narrow C1→C2 supporting proof; prior caller refusals and the repaired replay defect remain preserved. The five remaining reduced cases were not launched. The accepted complete Opus04 basic-cli outcome and closed remaining-five execution and bounded tenant/service acceptance are owned by [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-checkpoint-and-installed-continuation) and [T-043](../../odd_glc/.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md#current-bounded-selection). Native non-closing fields and prior failed attempts remain preserved. Suite, Data Mapper, fifteen-family delivery, qualification and RC1 remain open. Operator stop was admitted once on retained S02-19. Its preserving-obligation [source repair](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-03/review-01/return.md) is accepted; Root accepts [core18 installed readback](../.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-03/installed-readback-core18-01/root-disposition.md): status/replay are stopped, the original open obligation is conserved, and absent Result is Public `not_found`. The retained S02-19 readback conjunction is closed; broader S02 and qualification remain open. Q07 is prepared/incomplete and carries no qualification acceptance. Q07 completion, independent stop readback and this paired checkpoint are not launch prerequisites. Full S1–S5/oracle, qualification, QUAL056/F11/sole AF22 and RC1 remain open.
No first-J stop, new producer campaign, heap/timer/model increase or automatic
retry is selected by this tracking update.

Full S1–S5/oracle, complete qualification, QUAL056, independent F11 J, sole AF22,
RC1 and human acceptance stay open. The separate semantic-negative question maps
to actual governing/shared evidence and contrary evidence; unknown applicability
is not a waiver or a new automatic campaign. Recorded costs remain observed
complexity red flags, not isolated benchmarks, causal attribution or an OOM cure.

The [Product execution calculus](PRODUCT.md#execution-and-context-calculus)
owns incremental live state, reconstruction, current-input conservation and
role-specific context. T-287 tracks conformance; Goals selects the delivery
outcome without maintaining a separate behavioral rule.

Predecessor readiness ABI `2b9e540…` / GLC `8fd1de6…` and the paired successor10 selection remain historical. The earlier one-launch GLC steel thread was selected under [historical Root disposition](../.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-11/root-disposition.json); its closed Design-assessment refusal retains its historical scope. [Historical successor10 selection](../.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-10/root-disposition.json).

### Historical delivery and repair dispositions

The [historical method adoption](../.ai-workspace/comments/codex/20260921_STDO_251_RC1_ADOPTION/README.md)
updated this consumer's then-selected STDO basis and matched Development Products.
[T-287's owner re-entry](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-rc1-owner-re-entry)
records the trusted-desktop scope and next removal of unsupported repeated
event-log authentication before paid Design/Hello continuation. Method adoption
does not implement that correction or retarget historical Runs and evidence.

Executive accepts the [TRUST01 correction and installed composition](../.ai-workspace/comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/acceptance.md). Its three source files are applied; the existing installed mechanical Hello passes with zero historical reads during actor handoffs and fresh Public result/replay. Live LLM use, consequential correction and full release remain open. T-287 records the remaining supported cost opportunities without creating another optimization campaign.

[T-288 — Remove duplicated runtime construction](../.ai-workspace/tickets/completed/T-288-remove-duplicated-runtime-construction.md)
is complete. All eight selected completion items are accepted, implementation
files are canonically applied, and the demonstrated handoff-overhead P0 is
closed. Its [Executive disposition](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t288-completion.md)
binds the candidate, conjoined evidence and retained work by rule and extent.
The final Proxy exclusion correction reuses valid ordinary installed predecessor
evidence; no new native execution of the final archive or universal optimum is
claimed. Earlier accepted scopes and failed attempts retain their identities.

[T-287's management plan](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-prerequisite-plan)
owns the full ABG5 delivery
sequence. Its [Design diagnosis](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/design-timeout-diagnosis.md)
is complete; the Design outcome remains unsatisfied. LIVE04 stays closed-failed
at its unchanged absolute timeout, with its original read/lock failures preserved.
The ordinary installed cleanup witness demonstrates construction/execution and
fresh Public reads; it does not turn that failed live attempt into success.

[T-289](../.ai-workspace/tickets/completed/T-289-deduplicate-immutable-install-event-bodies.md)
is accepted/applied and complete: immutable event bodies are deduplicated, with
focused refusal/cold-reconstruction proof and one installed composition. Its
[disposition](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t289-completion.md)
preserves exact measurement subjects and final-correction evidence reuse.
T-288 remains closed. The owner re-entry above now precedes return to delivery.
[T287-DESIGN01](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/design-discriminator.md)
remains never launched; [DESIGN02](../.ai-workspace/comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/design02.json) bound the accepted repair and closed failed at the unchanged600s limit. [CONTEXT03](../.ai-workspace/comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/context03/design03-return-and-live06.md) is accepted/applied; its fixed-input Design probe also timed out. [LIVE06](../.ai-workspace/comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/live06-return.md) then refused before any Run or actor. [ENV01](../.ai-workspace/comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/env01-selection.md) selects the bounded Product-membership observation correction before the same Hello delivery objective. No timer, model,
context or budget increase, old-run recovery, selected-install/default migration
or release is granted by cleanup closure. GOAL-035 and all fifteen Product
families remain the delivery goal; full live Hello, broader qualification and
release acceptance remain open.

Release scope follows [Product Release Boundaries](PRODUCT.md#50-and-51-release-boundaries).
The owner selects the
[management-prerequisite plan](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-prerequisite-plan)
inside the existing D1-D6 steel-thread delivery plan. This is a `goal_reprice`
of execution order within the current fifteen-family Product, not a new feature
family or a change to release scope. T-287 owns milestone status, dependencies,
acceptance conditions and the single delivery schedule. The
[execution record](../.ai-workspace/comments/codex/20260913_ABG5_PLAN_EXECUTION/execution.md)
preserves exact subjects, closed reviews, accepted increments and failed attempts;
it does not supply a parallel schedule.

Executive `/root` owns continued ingress and constitutional-binding delivery
through separately bounded Workers. There is no external Jim handoff dependency.
T-287 records the context-delivery dependency under the
existing [STDO run-environment course correction](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#stdo-run-environment-course-correction).
Runtime use of a selected reference frame and axiomatic corpus requires native
evidence; source-development use supplies no such qualification.

The [management milestone register](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#management-milestones)
supersedes the earlier 1A-3C next-task order. Its baseline, supervision and
native-cost prerequisites precede dependent live context/correction campaigns.
Earlier accepted increments, task grants and unmet obligations retain their
exact scopes. The owner permits Executive continuation through separately
recorded dependency-ready activations after closed returns; this plan recording
itself starts no implementation, paid run, Git operation or release. Each
activation declares its finite work envelope before execution. LIVE04 is closed
within its two-hour work envelope including native supervision and readback;
earlier repair envelopes remain historical to their increments.
Runtime supervision envelopes retain their scopes. Larger live
allowances require exact scoped grants. None is a Product runtime performance SLA.
MGMT-00 separates immediate exact-evidence preservation from checkpoint/build
readiness. The paired reconstruction repair and focused QA are closed and accepted
within their exact scope; LIVE04 remains closed-failed. The current T-287
activation owns subsequent work; prior timeouts alone do not authorize retries.

The selected [first sunny-day increment](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#first-sunny-day-increment)
remains the full generic Hello lifecycle and live context discriminator.
Installed preparation and the bounded stream-history repair retain their narrow
acceptance. Earlier failed attempts retain their original dispositions.
Executive accepts LIVE03's factual terminal evidence and evaluates full Hello as
falsified for that attempt; it is not full lifecycle qualification. The one live
start and fresh-read grant are consumed. Full Hello, correction, the second job,
the selected application witness and release qualification remain open; T-287
owns activation status and the single schedule.

The [closed management disposition](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/execution.md#accepted-bounded-returns-and-independent-review)
accepts isolated composed readiness, bounded supervision/cause conservation,
the measured hash-reuse increment and one exact live adapter oracle. These do
not establish full Hello, integrated native supervision or lifecycle performance.
The owner's 2026-09-19 correction is: “no you misunderstood, you have full executive authority to continue, only stop if we start churning or going off steel thread delivery.”
MGMT03's accepted design and frozen ABI/odd_glc adoption passed
[installed Public preparation with native RC7 binding](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/installed-setup.md),
not full live qualification. [LIVE01](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/live-hello.md)
failed the Executive-selected CLI budget envelope.
[LIVE02](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/live-hello-02.md)
passed the Intent/Product author-assessor pairs, then failed at actor 5,
Requirements author, with `no_output` and truncated terminal JSON bytes,
without timeout. Both attempts are frozen; fresh replay passed, with no
completed result, construction, C2 verification or completed application.
The raw Requirements candidate remains unadmitted and confers no semantic claim.

[`T287-MGMT-04-LIVE03`](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/live-hello-03-execution.md#executive-disposition-t287-mgmt-04-live03-status-w02)
is closed-failed under Executive disposition; its factual evidence is accepted,
and promotion as full-Hello qualification is rejected.
Executive accepts STREAM-W02's held-store transaction-validation repair after
[independent R01 satisfied/no findings](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/live02-held-prefix-review.md)
and the [frozen repaired Public preparation](../.ai-workspace/comments/codex/20260919_MANAGEMENT_STEEL_THREAD/live-hello-03.md).
These acceptances remain bounded repair and preparation evidence, not full
ordinary Hello or broad performance qualification. LIVE03 returned native
`runtime_failed` after the Requirements author's absolute timeout, distinct
from LIVE02's no-timeout truncated output. No application was constructed.
Fresh Public `run_result` timed out and `run_replay` refused locked sink
acquisition; both remain unsatisfied and the saved SDK projection does not
substitute. The actor absolute timeout and failed readback remain distinct
unresolved residuals. The subsequent accepted independent read-only review
confirms QA-01 and QA-02 against the frozen predecessor; both are owner P0,
with exact CPU shares unmeasured. Their paired repair is now accepted under
MGMT02 for the demonstrated ordinary-source/native and reconstruction scope.
Failed LIVE03 logs, locks and evidence remain immutable; no repeated read,
recovery, timer/model/context/prompt change or live launch is granted here.
The single focused QA checkpoint is closed; LIVE04 exercised the accepted
repaired candidate with a new run and actual relevant current workspace. It is
now closed-failed; further paid runs are held for Executive intake.
Historical events cannot be transplanted.
Earlier narrow acceptances, three unchanged owner-suite fixture failures,
LIVE02's unknown original CLI drain deadline, deferred provenance-prompt debt,
Git/canonical readiness and wider lifecycle/release obligations retain their scopes.

[Declared testing-capability reuse](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#declared-testing-capability-reuse)
and its bounded evidence remain inputs to context delivery. T-287 retains the
P0–P2 repair boundary, key end-to-end reviews and unfixed-bug register; those
records do not supply a competing next-work schedule.

The bounded Run-closure correction has independent source
and installed qualification, including child foldback, typed parent closure and
fresh result/replay. The real-spec application witness, native semantic assessment,
consequential correction and integrated/release gates remain open. A conformance
Run is not application evidence, and a new candidate does not retarget a failed Run.

The owner's [proportionality clarification](../.ai-workspace/comments/codex/20260913_ABG5_PLAN_EXECUTION/execution.md#owner-clarifies-proportionality-and-continues-d1)
keeps sunny-day completion and proportionate handling of ordinary LLM output
variation in scope. Excessive resilience scenarios and broad hardening remain
frozen. Broad storage/locking work, interrupted-resource recovery and database
selection/migration remain unselected; the held-store validation repair above
is the exact selected exception. Existing code, logs, locks and evidence are
preserved. This sequencing neither waives Product constraints nor establishes
release readiness. Each effect requires its own current bounded grant; no automatic
retry, Git or release effect follows from source or test acceptance.

[T-287 Current Delivery Plan](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-delivery-plan)
owns the D1-D6 schedule, feature treatment, deferred assurance and next
dependency-ready work. [odd_glc T-043](../../odd_glc/.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md)
owns lifecycle declarations, selected-witness interpretation and the independent
full original Data Mapper upper-bound evaluation. That complex, ambiguous case
measures solutioning, design, iteration depth and progress; truthful bounded
failure may conclude the evaluation. Unmet application outcomes remain visible
without automatically selecting another attempt or claiming complete software.
The selected bounded keyed-accounting witness remains mandatory. The two-job
Public discriminator qualifies generic machinery and does not replace that
application oracle, qualify all fifteen families or close the release.
No new parallel roadmap is created in Goals.

The selected witness binds complete source, its contract, independent expected
outcomes, prerequisites and excluded downstream obligations. Its retained Run
remains bound to the earlier installed candidate. The separately installed-qualified
closure correction does not retroactively retarget or recover that Run.
The retained Data Mapper instance is reusable input.
The delivery sequence establishes one integrated public path,
material behavior, consequential correction and composition before broad
qualification. A reduced existing result cannot set the new acceptance oracle.

Focused structural checks and early installed integration/UAT establish usable
increments; broad applicable assurance follows at integrated qualification.
Single-runtime authority, local recursion/correction, automatic continuation,
truthful blocking, liveness, self-conformance and exact same-RC acceptance remain
required. T-287 retains the explicit 5.1 and downstream scope deferrals.

### Retained Implementation Checkpoint

The following checkpoint descriptions preserve their earlier exact scopes.
Current release allocation and execution selection are owned above and by
T-287; predecessor sixteen-family/full-Data-Mapper scheduling statements do not
restore a deferred gate or an exhausted activation.

Executive's retained implementation checkpoint is recorded in [Checkpoint12](../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_12/checkpoint.md), under GOAL-035/T287 D1–D6 and the current Product release allocation. Working solutions and accepted cuts that satisfy their design reference frames are preserved. The accepted [Integration02 canonical application](../.ai-workspace/comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_02/application-03/return.md) preserves complete Source20 plus Source42; Root53/56 accept bounded source/application, not native completion. All321 source/support and154 test/support members are preserved in the local WIP checkpoint scope. Root58 accepts corrected F11/D5 Source08/API03; Worker09 composes them with I02 only in isolated Integration03. Worker26 liveness/profile implementation remains isolated. D2 Execution37 is closed failed with no native recovery/retry grant.

[Native09](../.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/execution-01/manifest.json) retains initial22 C0/C1, truthful C2 exit1 and fresh-read evidence. [Execution37](../.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-witness-continuation-13/execution-01/return.md) closes after nine Public launches/eight receipts at913 events: first selection/fresh reads/repair conformance pass, but start15 times out. No repair actor/helper/C0/C1/C2/app effect or post-repair replay occurs. Root Review40 accepts the preserved failure only; processes are quiescent while the native Run remains active, with the abandoned lock and stale receipt13 handoff preserved. Neither repair is qualified. Source04 old46/48/795-null, Source06 inherited24/26 and Integration01 inherited29/34 remain historical. Original Data Mapper, D1–D6/S06 and same-subject qualification remain open.

Reference frames apply through LLM role/context selection and typed native projections, not a new authority or ledger. Released RC7 Representation/a_c is used; the local ABI map is stale and unused. Accepted [native profile compatibility](../build_tenants/abiogenesis/typescript/design/T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md) and [interrupted resource recovery](../build_tenants/abiogenesis/typescript/design/T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md) preserve genuine installed maintenance authority, exact handoff/prefix/lock ownership and existing witnessed stop under L before P. They grant no recovery or retry. EVENTS022/023 remains an active D4/F10 5.0 conservation gap, not F12 deferral; its accepted liveness HOW is applied and Worker26 composes the native kinds into one current profile. Corrected F11/D5 Source08/API03 is accepted bounded source readiness under [qualification HOW](../build_tenants/abiogenesis/typescript/design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md);53 unbound mappings receive no native credit. That checkpoint's fixed gate expansion is historical; the current qualification contraction preserves behavioral coverage through F11 and sole AF22. Root55 accepted D6 artifact-admission HOW07, not yet canonical or implemented. Applied RC6 one-cut law adds no second cut or derived release gate; native qualification and actual human acceptance remain open.

D1's [first full-source/paired-open-obligation checkpoint](../.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-acceptance/disposition.md), four assessed stages and earlier failures retain their scopes. [Recovery13](../.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/preserved-result-implementation-01/installed-run-preparation-04/execution-01/return.md) remains closed failed after22 C0,22-member C1 and prepared C2, with no C2 actor/command. Source20's [prospective composition proof](../.ai-workspace/comments/codex/20260911_D1_C2_FORWARD_COMPOSITION_PROOF_23/manifest.json) is accepted after Root48 and integrated as I02; final semantic consumption and native forward execution remain unqualified. D3 still owes full original-source obligations and application outcomes. D1–D4/M5, mandatory F17/S06, other scenarios,4.6 conservation and F12/S04 at5.1 remain unchanged; [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#readiness-and-next-re-entry) owns remaining work.

### Accepted Evidence

- Wave 1's functional substrate and [Wave 2's four threads/B06 closure](../.ai-workspace/comments/codex/20260908_W2_STEEL_SEQUENCE/thread-04-acceptance/disposition.md) remain accepted for their exact subjects.
- [C1 text output](../.ai-workspace/comments/codex/20260909_C1_TEXT_OUTPUT/acceptance/disposition.json) and [C2 compact acknowledgment](../.ai-workspace/comments/codex/20260909_C2_HELPER_ACK/acceptance/disposition.json) remain accepted; their completed grants and stated C0/C2 limits are unchanged.
- The [seven-scenario campaign](../../odd_glc/.ai-workspace/comments/codex/20260909_FULL_LIVE_SUITE/execution.md#executive-acceptance-of-the-seven-scenario-campaign) remains accepted construction/execution evidence: six Hello outcomes on artifact8a, Data Mapper construction on artifact9a and final repair/C2 on artifact4863, with 58 passes and nine predicates. It is not full original-specification Data Mapper, all-seven-on-one-artifact, repeatability or release qualification.
- The [current V3 method adoption](../.ai-workspace/comments/codex/20261021_STDO_300_RC1_ADOPTION/README.md) selects the Definition basis and standalone source routes. The [2.5.1 RC1 adoption](../.ai-workspace/comments/codex/20260921_STDO_251_RC1_ADOPTION/README.md) retains its historical cohort evidence. The [RC7 installation](../.ai-workspace/comments/codex/20260915_STDO_RC7_INSTALL/README.md) and [RC6 migration](../.ai-workspace/comments/codex/20260906T152118Z_STDO_RC6_MIGRATION/README.md) remain historical evidence; they do not select current development routes. No downstream Product migration is selected.
- [S01 Execution06/root Review06A](../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_08/root-reviews.md#s01-installed-review06a) is accepted for R1–R9 only on its exact cut. D2 Source05/Review20, HOW21/Review22, R10 HOW07/Review08 and HOW10/Review11, and D1 source/readiness/partial setup retain distinct bounded scopes in [Checkpoint08](../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_08/checkpoint.md); none closes native continuation, typed R10, an integrated candidate or release.

### Retained Baseline-Repair Planning

This section preserves predecessor planning. Current Selection and T-287 record completed Wave 2 work; earlier planning conditions confer no current activation.

The user accepted the baseline recommendation and directed that the review and
its tracking be saved. The smallest lawful re-entry is `goal_reprice`: select
bounded Wave 2 baseline-repair planning while conserving the fixed Product,
Intent, requirements, 16 feature families, scenarios, and release subjects.

`W2-BL-DOCS` is completed and Executive-accepted for accurate documentation
and tracking only. Its run-scoped write grant is exhausted; the separate C0
activation in [Current Selection](#current-selection) owns bounded B04 disposition. The completed documentation territory was this
GOALS file, [T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md),
and the [baseline review](../.ai-workspace/comments/codex/20260905T042941Z_REVIEW_abiogenesis_wave2_stdo_baseline.md).
T-287 records the exhausted grant, acceptance, and durable return surface. The
bounded baseline-planning selection
supersedes the former 19-path canonical-root I/E selection as current work
authority. Its frozen source, old review results, hashes, and prior scopes
remain predecessor evidence; none is a current mutation grant.

Wave 2 and the selected sequence are closed; their exact accepted evidence remains the basis for later work.
Current disposition and remaining streams are:

| T-287 workstream | Finding and priority | State and dependency |
|---|---|---|
| `W2-BL-PUBLIC` | B01-B03; P1 | Accepted on the exact STEEL-BASIC-CLI-01 subject: common-call admission, lawful installed routing and legacy Public retirement. Grants exhausted; no all-definition assurance claim. |
| `W2-BL-C0` | B04; P2 | Correction-01 completed and Executive-accepted after independent `satisfied`; [Current Selection](#current-selection) owns its bounded disposition. Historical evidence retains its exact scope. |
| `W2-BL-C2` | B05; P2 | Accepted on the exact STEEL-BASIC-CLI-01 subject: executable basis, exact semantic tool input, source join and admitted result/replay. Grants exhausted. |
| `W2-BL-PROOF` | B06; P2 | Basic-cli evidence remains accepted. Applicable fixture refresh and Public SDK/CLI/schema/owner agreement are accepted; T-287 binds the closed routes and exclusions. |
| `W2-BL-C1-P3` | B07; P3 | Executive-closed for accepted design/schema/raw-admission agreement at deterministic-fixture bounds; live text completion and Data Mapper remain with T-043. |

The historical recommendation acceptance selected work-wave direction. It did not accept
the review findings as repaired, a design amendment, candidate code, an
installed artifact, a release, or Product closure. Later repairs require
separately declared bounded Writer activations and independent review at the
applicable boundary. Ordinary existing authority may support that sequence
without an artificial extra approval turn.

The current review found Program-owner and unique-install checks in
`abg/execution_basis.ts` and `implementation/worksite_file_replace.ts`.
It did not reproduce the earlier owner-unity finding. That finding requires
explicit reassessment against current source; repair is not automatically the
next action, and full closure is not claimed. The earlier unaccepted C0
candidate is the preimage for the accepted B04 HOW; current implementation and
proof disposition remains in T-287. C1/C2 accepted
design identities remain unchanged. The design README and old handoffs retain
pre-baseline status context; these GOALS and T-287 own current selection.

## Pre-Baseline Worksite-Root Selection (Historical)

This section preserves the prior selection and its design context. It grants
no current work. The pre-baseline planned re-entry sequence was:

```text
goal_reprice: select the bounded W2-R3 worksite-root design question
  -> design_reframe: amend exact C0, C1, and C2 HOW
  -> two independent reviews: GO, P0/P1/P2 all zero, P3 one retained C2 nonclaim
  -> Executive acceptance of the exact frozen C0/C1/C2 HOW
  -> goal_reprice: select bounded canonical-root C0/C1/C2 I/E
  -> realization_refactor: nine production paths
  -> two independent source reviews: HOLD
  -> design_reframe: clarify C0 atomic namespace replacement and C0 P3
  -> independent design review
  -> previously planned owner-unity repair and independent Stage 1 source review
  -> previously planned eight support/evidence paths plus two generated outputs
  -> independent source/evidence review and package gate (not activated)
```

The Product outcome is conserved. Intent, Product, requirements, Public,
feature membership, scenarios, and release subjects do not change. No
artifact acceptance, package publication, qualification, odd_glc/live use, model call, version, RC,
tap, release, or Git effect is selected. The prior C2 five-path selection is
superseded as current authority and retained only as predecessor history.

The accepted design requires the existing `WorkspaceAuthorityBasis A` to
travel alongside `WorkspaceBinding W` in the C0 request, C1 task, and C2 task.
Every admission/effect owner authenticates the full pair against the
`ExactPrefixWorkspaceEnvironment` before dispatch or effect. Authored subjects,
territories, observations, cwd, and snapshot sources resolve under
`A.canonicalRoot`. The unique Program-owner Product identity remains
`W.roots.productRoot == ProductInstall.installedRoot`, and the installed payload
must have zero delta.

The frozen C0 clarification requires every target or parent substitution
visible at final pre-effect validation to refuse, followed by one same-directory
atomic namespace publication or replacement. Atomic means no partial successor
bytes become visible; it is not expected-inode compare-and-swap. An ungoverned
external or same-user target or parent mutation after final validation and
before the publication syscall is the explicit C0 atomic-window P3/nonclaim.
It is distinct from the retained C2 coherent task/launch/derived-sibling
substitution P3.

Owner unity means the Program/GraphFunction publication and selected
implementation binding resolve to one unique admitted Product installation at
`W.roots.productRoot`; their separately admitted publication digests need not be
equal. C2 retains its exact installed helper beneath `W.roots.toolchainRoot` and
its helper/package/locus joins; it does not rebase that helper beneath the
Program-owner product root.

Targets may not enter or alias Product, toolchain,
event-log, runtime-state, projection, or archive roots. Territories resolve
under the canonical worksite and may not themselves lie in a protected root;
every concrete target remains independently checked. C1 copies full `A`
byte-for-byte and derives each C0 request's W identity/digest only from its
task's full `W`. C2 re-observes replay-proven worksite
subjects under `A.canonicalRoot` before snapshot and after Worker return. C3's
existing branches remain exact C1 tasks; whole-aggregate admission refuses a
mixed-basis branch vector before dispatch. No odd-specific shim is permitted.

The exact design subjects are:

- `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`

C1 and C2 retain their exact historical acceptance identities in T-287 and the
design index. RC6 migration changes only C2's method header; its accepted HOW
is conserved, and its historical accepted hash is not a claim about those
successor metadata bytes. C0 and C1 bytes remain unchanged. Prior accepted C0 bytes had SHA-256
`427ced47826e95ef0262ca0d4797eaf144b07d14e30f8e4ace1de6b585864b84`.
The then-current C0 candidate had SHA-256
`7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240`
and remained frozen and unaccepted at that historical cut. The former exact
19-path I/E territory is preserved predecessor scope. Its
Stage 1 bytes remain frozen on `HOLD` and confer no current source or Stage 2
authority. The current baseline workstreams supersede that selection.

## Downstream Reacquisition Gate

[Current Selection](#current-selection) follows the sequence owned by T-287: basic-cli and `js-tenant-test` are accepted on the same exact artifact, and T-287 records all four accepted sequence threads, including serial aggregate success/failure and applicable inspection evidence.

For both runs the exact-prefix environment projects full `A` and `W`; the ABI
tasks admit that exact pair before dispatch; authored targets including
`package.json` resolve beneath `A.canonicalRoot`; and
`A.canonicalRoot != W.roots.productRoot == ProductInstall.installedRoot`. The
complete installed Product tree remains path-, topology-, and byte-exact. ABI
C2, through its `worker_executes` Worker/helper and ordinary ABG admission,
alone executes declared commands/probes and admits mechanical observations.
odd_glc may only interpret those admitted observations, obtain Reviewer
judgment, and request Executive disposition. A fixture root, odd-specific
shim, scenario-specific ABI branch, host command/probe execution, or
synthesized observation is prohibited. Historical `basic-cli` evidence earns
no `1/7` scenario credit.

## Retained C0-C3 Predecessor Record

The following coordinates record earlier accepted or diagnostic subjects. They
do not override [Current Selection](#current-selection), the accepted B04 HOW,
or accepted C1/C2 HOW. C3 remains unchanged except that its exact nested C1
tasks inherit full authority-basis propagation and mixed bases refuse.

Prior `W2-R3-C0-I` implements the bounded mutable-worksite causal atom required by
`A5-F10` and the existing binding, event, replay, and projection requirements.
Its accepted predecessor design bytes at
`repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md#w2-r3-c0-mutable-worksite-causality-design`
had SHA-256
`ccb19745eadca757db028cf0c5ded5d92d3507f65f0ba7189958984117ed475a`.
The later accepted root-reframe bytes had SHA-256
`427ced47826e95ef0262ca0d4797eaf144b07d14e30f8e4ace1de6b585864b84`;
the later atomic-window candidate is the preserved B04 preimage named above.

The increment starts from one admitted `WorkspaceBinding` and a closed
pre-basis file-replace request containing the exact `run.invoke` grant,
subject, territory, replacement bytes, and immutable predecessor observation
`O0`. Basis admission validates that request, produces `ExecutionBasis B`, and
makes `O0` current. HoG then carries the admitted Program,
GraphFunction/C-call, implementation, and grant coordinates as one closed
`LeafExecutionAuthority` to the owner. The owner performs or refuses one
atomic replacement, and specialized evidence plus the ordinary admitted
C-call result carries its receipt and `O1`. Event Calculus makes `O0` stale,
makes `O1` current, and fresh replay reconstructs `O1`. `WorkspaceBinding W`
and `ExecutionBasis B` do not change.

The physical commit and ABG append are distinct. If the physical replacement
succeeds but ABG admission fails, the result is visible
`unadmitted_physical_commit` residue. Runtime does not claim `O1`; the worksite
must be observed again before another effect.

`W2-R3-C0-E` is accepted on exact installed artifact SHA-256
`84ed06353e06795fcfaeb67fdc39c3b7cf98683ae8aed5fd348b88e18743de5f`.
It proves this atom and its bounded falsifiers only and grants no broader Wave
2 or Product credit.

Prior `W2-R3-C1-D` at SHA-256
`7db51dc50720bc36e729f4b17968c2e9c01d1f88ba673b10a2e165a3a31f98e1`
is the accepted bounded construction predecessor. It composes one
existing direct Public invocation, one governed raw live-worker result, one
deterministic Product-wrapped `F_P` candidate and authority join, and one
zero-binding `workflow.C` vector-application child whose raw input is the exact
admitted join result and whose fan-out enters the exact C0 and reducer
children. ABI C2 separately owns any declared command/probe execution and
mechanical-observation admission. After replay, odd_glc owns only
interpretation of admitted observations, Reviewer return, Executive
disposition, and any new corrective invocation.
Those predecessor bytes occupied
`repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md#w2-r3-c1-live-llm-worksite-construction-design`;
the live path now contains the accepted root-reframe design.
The C1 Product/Worker boundary remains unchanged: its Worker uses
`closed_prompt_proof`, makes no tool calls, and delegates all mutation to C0.
Accepted C3 I/E additionally makes C1's root declare and publish one
graph-call child-closure contract for nested use; that bounded declaration
changes the C1 GraphFunction and containing-publication digests and requires
direct C1 regression plus nested C3 proof without changing C1 meaning.

The prior accepted `W2-R3-C2-D` sibling closes the downstream
execution-observation seam that C1 intentionally excludes. It consumes the
exact admitted C1-root or accepted C3-reducer result through the existing
owner-derived source-result basis, executes owner-authored commands and
mechanical probes inside an ABI evidence snapshot through a distinct
`worker_executes` actor, admits typed execution truth, and preserves that truth
and its helper-artifact join through closure and fresh replay. Its design is
`repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md#t-287-w2-r3-c2-worksite-command-execution-design`.
Its prior accepted design SHA-256 is
`7f69c4c0c5e027f4025c0f3885042c65a668b4089eb139d278c0cdbc78e4f570`.
A post-review live transport check found one duplicate-enum response-schema
defect in the prior package subject. The bounded C2 semantic/carrier predecessor
is independently accepted at artifact SHA-256
`7272967ec7bed96612768b3ae7fe5e34382eca1127ce69a3e69a6fba9c119df1`,
manifest-file SHA-256
`c1dca319e995733db0debc68c7fe176433e7747ebbb6c11d9d3396d0d23fbdbd`,
Product-content digest
`a0236266e8c9d8c6654d33b8767ac4c21b1192c42f45b9bda17d6ae58afa3076`,
and C2-publication digest
`f7cb3acd366932f80881c24f6628f9462f0bf127ee726c2c0fedd7490506493b`.
Independent final review returned `GO`, P0/P1/P2 all zero for that bounded
subject. Later live evidence exposed a P1 in its transport relay. The
relay-repaired predecessor is independently accepted at artifact SHA-256
`d5278229916565777e4fd3e0c61d6000825ca944998f765dbf112584f36b3726`,
manifest-file SHA-256
`7f3be93f8a9c05ab60219637dcc2e9d7be073ad558dae2278f4a78410eb7c680`,
Product-content digest
`4c7c8509cb98f04a017ae79d2fe1b5500a9fc61bf8bd8c4883557a4a347bdc61`,
and C2-publication digest
`24336ffee58eedc639df04f8a95d6c5fffbf9207737a9026b0e46dc4d8c494bd`.
Independent review returned `GO`, P0/P1/P2 all zero on that exact subject. It
supersedes the transport-relay use of the prior semantic/carrier artifact
without changing accepted C2 meaning.

The fifth retained odd_glc basic-cli run over qualified historical artifact
SHA-256 `e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449`
showed a narrower helper-locus defect: the Worker preserved the exact `--task`
path but moved `--artifact` and `--sandbox`; the permissive helper then executed
both declared commands and wrote those caller-selected paths before Product
returned `transport_identity_mismatch` and the run stopped. Accepted amended
design SHA-256
`f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`
narrowed the Worker command but conflated the public bare Product-task manifest
coordinate with its occurrence-bound private launch envelope.

The previously accepted two-manifest `W2-R3-C2-D` preserves the exact public 12-key helper plan and
defines two canonical files under one attempt root. Public `task.json` is the
sole authoritative Product-task carrier; its digest and byte length describe
the exact canonical task bytes followed by one LF. Private `launch.json` is the
occurrence-bound readiness envelope and appears only in the
implementation-private launch plan. The sole Worker command is
`node <installed ABI helper> --task <attemptRoot/launch.json>`; `--task` is a
compatibility flag. Host, helper, and completion independently derive and
revalidate both distinct canonical single-link manifests, `result.json`, and
`sandbox`, without parsing the command. The host publishes `task.json` first and
`launch.json` last; partial publication fails closed without dispatch or retry.
The helper requires exact task/envelope/occurrence/attempt/helper/package/locus
joins and absent result/sandbox before protected-O1 observation or any helper
execution effect. Final result cleanup is not swallowed and success requires a
single-link canonical `result.json`. Fully recomputed coherent same-user
substitution remains a trusted-desktop P3/nonclaim.

The private carrier admits only the exact eight-key authority-free
`LeafExecutionOccurrence`: fixed C2 `programLocusRef`
`node://abiogenesis/worksite/command-execution/fp@5`, `executionAuthority: null`,
the retained non-empty identity and safe-integer constraints, and no extra key.
Host and helper independently recompute `occurrenceDigest`, exact `attemptRef`
from `sha256Canonical({cCallRef,runId,graphCallId,frameId,taskOrdinal,attempt})`,
and `attemptDigest = sha256Canonical({ attemptRef })`; crossed state refuses
before effect. Current Product construction, observation admission, completion,
and `exactExchange` refuse a fully rehashed current observation carrying the
immediately preceding 12-key one-argument `--task <task.json>` plan. Historical
validity remains only in its exact immutable predecessor Product/artifact.

That predecessor two-manifest design was accepted at exact SHA-256
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`
after two independent `GO` verdicts with P0/P1/P2 all zero and P3=1 as the
explicit trusted-desktop nonclaim. It remains retained HOW for the two-manifest
relation, but its `productRoot` source-worksite interpretation is reopened by
the accepted three-child design. Its former five-path I/E selection and frozen
source/evidence subject are historical only. The later pre-baseline 19-path I/E selection superseded it and is now itself
predecessor scope; artifact acceptance, package publication, qualification, odd_glc/live-model use,
version, RC, tap, or release remains unselected.

`W2-R3-C3-D` is the independently accepted bounded aggregate design and exact
HOW authority for completed and qualified `W2-R3-C3-I/E`. It validates one caller-authored ordered branch DAG whose
members are exact existing C1 tasks, derives one disjoint target allocation,
and uses direct HoG traversal of `C.batch([workflow.C(C1)])`. Every entered C1
branch admits independently; existing fan-out partial-stop truth preserves a
failed prefix; and deterministic fan-in alone yields one flat existing
`WorksiteConstructionResult` for an explicit C3-reducer source join into C2.
Its accepted design is
`repo://abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md#w2-r3-c3-branch-construction-aggregate-design`.
Its exact design SHA-256 is
`6da224353368e1ba9e2fc5651640ece743f6b528e98bbd9ccb58b8624a96e2a8`.
Independent design review accepted those exact bytes with P0/P1/P2 all zero.
The completed source/evidence subject has final evidence-test SHA-256
`5c04ad0bc0dc7b8caff32f5242d49040c7c2a5fd9acea88ce643265849a657c9`,
manifest digest `b7749e6d20a6c278ce5a42b4be728b86e15b5efbe56e732820cb92836f481140`,
Product-content digest `a0ff7fd2298698868d340146c7a739599ceda16a87ae07108112cf7493f30126`,
Catalog digest `d036a63e7e163246f750e94b0923305412be66f2848e4c5272f55040a8926b36`,
and C1/C3-publication digest
`72a5e998592913bd3142e7a6d3064190f3799d0eb58c94343f39a10cd2c6d8fe`.
Independent source/evidence and exact-artifact reviews returned `GO`,
P0/P1/P2 all zero. This preserves accepted C3 truth but does not close the
Product goal without downstream odd consumption.

## Selection Boundary

[Current Selection](#current-selection) is the sole continuing selection
projection; T-287's W2-BL-C0 entry owns exact corrective disposition and retained
prior dispositions. W2-BL-DOCS and the RC6 migration are completed with exhausted
grants. Their retained planning and the historical territory below do not
create another activation. The accepted Wave 2 closure is preserved; the revised delivery selection is owned by Current Selection.

### Pre-Baseline Nineteen-Path Territory (No Current Grant)

The pre-baseline selection recorded:

- frozen C0 atomic-window review candidate plus Executive-accepted C1/C2
  worksite-root HOW at exact SHA-256 identities
  `7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240`,
  `61589c4428c6d26f7e8063d40c9d6e653897df8a5bbfaf8d0fb048ce8cce3c61`,
  and `8dbe22c8bcc2bcedc0e77a5f03a2fde1805d408e555e83bde342b9bb1d2a2301`;
- bounded `goal_reprice` choosing its canonical-root C0/C1/C2 I/E as
  `realization_refactor`;
- full `WorkspaceAuthorityBasis` propagation/admission, canonical-root worksite
  resolution, installed Program-owner Product conservation, protected-root
  refusal, C2 worksite re-observation, and unchanged C3 inheritance; and
- staged mutation and evidence over exactly these 19 existing paths, now
  preserved as predecessor scope.

The former Stage 1 territory contains exactly nine production paths. Its frozen
historical subject remains on `HOLD` and grants no source mutation. The completed
B04 overlap is recorded by [Current Selection](#current-selection). The old
sequence proposed owner-unity repair after C0 acceptance. The baseline now
requires explicit reassessment because current checks exist; neither automatic
repair nor closure follows from the older reviews. The retained paths are:

1. `build_tenants/abiogenesis/typescript/code/src/product/worksite_effect.ts`
2. `build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts`
3. `build_tenants/abiogenesis/typescript/code/src/product/worksite_construction.ts`
4. `build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts`
5. `build_tenants/abiogenesis/typescript/code/src/product/worksite_branch_construction.ts`
6. `build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts`
7. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_file_replace.ts`
8. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts`
9. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts`

The former Stage 2 territory contained these eight support/evidence paths and
two generated outputs. That whole territory remains unactivated; the completed
B04 support-fixture overlap is recorded separately in T-287:

1. `build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs`
2. `build_tenants/abiogenesis/typescript/test_env/support/root-cli-environment.mjs`
3. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-file-replace-owner.test.mjs`
4. `build_tenants/abiogenesis/typescript/test_env/tests/t287-post-binding-worksite-write.test.mjs`
5. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-construction.test.mjs`
6. `build_tenants/abiogenesis/typescript/test_env/tests/t287-live-worksite-construction.test.mjs`
7. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs`
8. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-branch-construction.test.mjs`
9. `build_tenants/abiogenesis/typescript/product-toolchain-manifest.json`
10. `build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json`

That predecessor plan required independent source/evidence review and the
ordinary package gate. It no longer selects mutation or evidence work.

The pre-baseline exclusions were:

- after this frozen four-document design-reframe candidate, any realization or
  evidence mutation outside the exact 19 paths selected above;
- any Product, requirement, Public, event-kind, GTL, C3-topology,
  `package.json`, index, generator-source, further design, or unspecified-path
  change;
- `W2-R2`, the remainder of `W2-R3` outside the selected worksite-root I/E,
  or broad `W2-R4`;
- downstream odd_glc mutation or an odd-specific root shim;
- Product/requirement/Public/frame/constitution or C3 semantic change, or
  Product-goal closure before downstream consumption evidence;
- pre-binding authority, Product verify/resolve/install, workspace creation or
  binding, Catalog/View admission, declaration application, URI typing,
  overlay hierarchy, or a complete lifecycle traversal;
- any new Public operation, event kind, controller, registry, capability-grant
  system, workspace binding, or ABI reference-frame entity;
- the S1/P0 proof-HOW prerequisite, S2-S4, E00, qualification, RC, tap, or
  release;
- live/model runs, artifact construction or acceptance, version allocation,
  and every Git add/commit/tag/push effect; or
- allocation or burning of `5.0.0-dev.288`.

The predecessor C0 candidate and Stage 1 source retain their historical
unaccepted/HOLD dispositions; they do not determine the status of the separately
accepted B04 HOW or its current implementation. [Current Selection](#current-selection)
and T-287 own that status. C1/C2 accepted HOW remains unchanged. Every activated
increment returns its own frozen subject to Executive for applicable independent
review; a Reviewer performs no repair.

## Fixed Basis

- Intent direction, the fifteen selected feature-family identities and exact
  release subjects are conserved. Product Release Boundaries owns Consensus,
  human-response and whole-run oversight applicability; this is not a claim
  that every earlier requirement or public-operation roster remains selected.
- [`stdo_abiogenesis.json`](../stdo_abiogenesis.json),
  `constitution.stdo.basis`, is the sole exact operative STDO selection. The
  direct owner ruling adopts the immutable standalone V3 cut for resumed
  source work; its install and route evidence is retained by the linked V3
  adoption record.
- The Definition's composition is empty. Source development uses the native
  installed method. Older companion installs and maps retain their original
  evidence scope. A supplemental map requires explicit selection and exact
  source verification before use. Maps and prompts grant no ABI authority.
- The project extension
  `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#abiogenesis-project-reference-frame-basis`
  is adopted for T-287 context only. It creates no runtime entity or executor.
- Immutable `v4.6.0-rc.5` remains the semantic conservation reference.
- Effect `3.22.1` remains exact-pinned inside its accepted composition
  boundary.
- `A5-F08`/`ABG5-S05` (standalone Consensus) and `A5-F12`/`ABG5-S04`
  (whole-run oversight) remain planned 5.1 work.

The selected 5.0 family scope is `A5-F01` through `A5-F07`, `A5-F09` through
`A5-F11`, and `A5-F13` through `A5-F17`; `ABG5-S01`, `ABG5-S02`, `ABG5-S03`, `ABG5-S06`, and
`ABG5-S07`; semantic conservation of retained 4.6 traversal behavior; and the
shape-preserving fibre-substitution differential. Product owns the required
behavioral coverage and retained/deferred boundaries. The current contraction
removes fixed proof-row execution granularity; it does not restore 5.1
Consensus, response or executive-oversight obligations or waive retained outcomes.

## Feature-Wave Status

Waves 1 and 2 retain their accepted, subject-bound evidence. The former Waves
3-5 are historical scheduling groups, superseded by [T-287's delivery plan](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-delivery-plan).
Its feature assessment distinguishes implemented mechanisms, missing
capabilities and outstanding qualification; wave acceptance is not complete
5.0 feature or exact-candidate qualification.

## Work And Milestones

T-287 owns generic ABG delivery, the native runtime, the default library,
the lifecycle proof and the RC1 candidate work; odd_glc and its T-043
campaign are deselected from ABG delivery (owner selection, 2026-10-06, above). Reuse the retained
instance and accepted evidence; reopen only materially affected relations.

| Milestone | Exit | State |
|---|---|---|
| `M5` | T-287 D1-D4 place the required lifecycle witness, complete pre-qualification features, applicable negatives and conservation evidence on one integrated candidate. | Open; accepted source ancestry is integrated and canonically applied, not jointly qualified. The common computational library and its debt wave are closed (T-290 Phases A and B, `46ed04895` and `a8937b837`); the lifecycle witness on one integrated candidate, native F11/D5 work and the D2 continuation remain open. Full D1-D4 and original mandatory application outcomes are required; accepted Waves 1/2 remain banked. |
| `M6` | D5 qualifies that exact pre-RC candidate through self-conformance, the complete required scenario/gate set and the sole qualification reducer. | Acceptance waits for M5; prerequisite qualification-tooling implementation may proceed in parallel under its own sufficient authority. |
| `M7` | D6 publishes the immutable RC, qualifies its fresh install, records actual human acceptance of that same unchanged RC, and verifies it after publication. | Publication waits for the appropriate exact verdict; release-mechanics preparation need not wait for M6 closure. |

Progress reports name the active D increment, reached user outcome, remaining
requirements, first blocker and exact supporting evidence. Counts of files,
tests, reviews or commits do not establish Product completion.
