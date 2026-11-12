# TD-26 P0b Return: design notes to history

**Status:** complete. One note moved, 1,635 lines cut, 804 lines restated as
265 lines across 22 kept notes, indexes updated; no stop condition met.

Branch `claude/td26-p0b-design-history` in `/private/tmp/abg-td26p0b`, cut from
local `main` at `5c9df5056`. `T` is `build_tenants/abiogenesis/typescript`.
Change class: `design_reframe` of the tenant design notes under the P0
product_reprice of `A5-F07` (`fb86eb3c9`). No code, test, contract,
specification or constitution file changes.

## 1. Census

Search: whole kept-note set `T/design/*.md` (not `history/`), regex files
`/private/tmp/abg-td26p0b-work/terms.txt` and `terms2.txt` (Consensus, One
Surface, the four authorities, construction intent/delta/continuation/
composition, selected action, gap stop, re-entry basis, gap re-entry, lawful
actions, the frontier reads, `ticket_consensus`, `NextActionBasis`,
`ActionEvaluationBasis`, `EdgeFulfillmentLedger`, `EdgeClosureDecision`,
`currentIntent`, `constructionResume`, `reprice_required`, `stageRole`,
`ObservationSnapshot`, `A5-F08`, `ABG5-S05`, `S05`, `REQ-P-CONSENSUS`), plus
`/private/tmp/abg-td26p0b-work/reqids.py`, which expands every requirement
range in the notes and reports any that reaches an identifier P0 deleted
(POLICY-029/-030, CONTINUATION-012/-013, EVENTS-021/-030, FN-COMP-024/-026,
PROJECTION-022/-024, HOOKS-012/-013) or moved (QUAL-061, SCENARIOS-012,
CONSENSUS except -004/-007/-008, every FPC id).

Classes: **R** a section whose subject is retired; **M** a section that mixes
retired and live design; **N** a mention inside live design; **D** a passage
that lists what the code still declares (rule 7), kept and listed; **J** kept
with a stated reason; **L** left for another package (rule 8); **F** a false
positive. Line numbers are at `5c9df5056`.

| Note (hits) | Lines | Class | Action |
|---|---|---|---|
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` (121) | whole note | R | `git mv` to `history/`; README line 15 leaves; history row added |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN` (396) | 3-9, 20-24 header | N | restate: drop the S05 acceptance and `A5-F08`/`ABG5-S05` boundary; Section 12 date |
| | 85-86, 92 boundary table | N | row 85 restated to the Executive and Section 6 hold; row 86 and line 92 cut |
| | 100 (`CONTINUATION-001..014`) | N | split to `-001..011`, `-014` |
| | 238 Continuation lifecycle cell | N | restate `run.continue` to `current_intent` continuing a replay-derived pending execution |
| | 754-760 mermaid `DeferredM5DomainPrograms` | N | drop `+OneSurface`, `+Consensus` |
| | 1152-1157 implementation step 10 | N | drop the One Surface clause |
| | 1190-1722 §12 heading, intro, §12.0 | M | restate the live design (root policy and grant, Product semantics provider and leaf projection) under a new §12 with head citations |
| | 1723-1763 §12.1, 1843-2014 §12.3-12.5, 2015-2048 §12.6, 2049-2092 §12.7, 2184-2255 §12.10 | R | cut verbatim |
| | 1764-1842 §12.2 | M | runtime-failure diagnostic paragraph kept unchanged under the new §12; rest replaced |
| | 2093-2141 §12.8 | J | live (`re_enter`); kept unchanged, renumbered |
| | 2142-2183 §12.9 | M | two sentences (One Surface overlay; gap re-entry) restated from `gtl/public_start.ts`; renumbered |
| | 2256-3260 §13 (S05 Ordinary-Path Consensus) | R | cut verbatim |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN` (56) | 9 (`CONTINUATION-011/-012/-013/`) | N | drop -012/-013 |
| | 29-32 Governing Distinction | N | restate without One Surface and `ConstructionComposition` |
| | 325-412 Exact ConstructionIntent Continuation | R | cut |
| | 413-443 Scope, Contraction And Evidence | M | "exact current_intent" restated to the pending-execution arm; last sentence (about the cut section) replaced |
| | 444-495 Selected Action At An Unconsumed Durable Boundary | R | cut |
| | 500-506, 516, 590-598, 679, 711-721, 731-732, 748, 753, 822-826, 839-852, 852-859 | N | restate to the pending-execution arm (`runPendingExecutionOwner`, `projectPendingExecutionContinuations`, `admitPendingExecutionContinuationOperation`); selected-action and construction-intent clauses go |
| | 882-982, 1021-1027 Selected Installed Proof Composition | M | selected-action witness paragraphs and carrier table cut; generic fsync, recovery, receipt, planner and Source paragraphs kept under a restated heading |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` (37) | 32, 109 (`POLICY-022..064`, `-023..040`) | N | split around -029/-030 |
| | 35, 112 (`REQ-P-CONSENSUS-012..015`) | N | cut line and row |
| | 40 ("accepted S05 Consensus and S06 native-contract designs") | N | restate to the S06 native-contract design |
| | 3354 ("retained S03/S05 invocation, continuation, Consensus, and reads") | N | restate without S05 and Consensus |
| | 296, 639, 1338-1341, 1349, 1356, 1360, 1397-1404, 1654-1692, 1809-1812, 1857, 2271, 2282-2284 | D | the 18/56 family rows and grammar for the five members, `current_intent`/`selected_action` and the `gap_stop` non-terminal; kept, listed for the Executive |
| `ABI5_STDO3_COMPUTATIONAL_BINDING` (6) | 37 | J | states the Product's 5.1 reservation of standalone Consensus |
| | 170 Closure owner | N | restate to `admitOwnedScopeClosure` (`abg/closure.ts`) |
| | 182 row 5 | N | drop `constructionDeltaForAdvance`, `actionEvaluationProjection`, `edgeClosureDecision` and the `evaluate_action` sentence |
| | 462 `A5-F07 One Surface` row | N | restate to the Executive system program |
| `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION` (9) | 71 | N | restate the "Existing law" cell |
| | 74-80 | N | restate without the One Surface relation |
| | 200-211 exact-intent paragraph | R | cut (links the cut T287_PENDING section) |
| | 213-215 | N | restate "without a ConstructionIntent" |
| | 231 "F_D semantic next-action controller" | J | a prohibition that names no carrier |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN` (7+2) | 651 callers cell | N | drop the construction-intent and selected-action callers |
| | 665 P-FH-PAIR | N | drop "with no construction intent" |
| | 710, 758 (`EVENTS-002/003/030`) | N | drop -030 |
| | 796-800 held/cold read lists | N | drop `run_gaps`, `workspace_gaps`, `run_lawful_actions` and the counts |
| | 1069 run owners | N | drop `runCurrentIntentOwner`, `runSelectedActionOwner` |
| | 1304 A5-F07 row | N | restate to the Executive |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN` (11) | 25-32 | N | restate without One Surface phases and `constructionComposition` |
| | 42 row | N | cut (ConstructionComposition fixtures) |
| | 145, 151-152, 207, 210-211, 222-224, 229 | N | drop the ConstructionIntent path, ConstructionComposition, One Surface prerequisites and the consensus tests |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN` (9) | 209, 214 (`gap_stopped`) | N | drop the gap-stopped status |
| | 608, 627-628 (`nextActions`, `run_lawful_actions`) | N | drop |
| | 646-647 (`run_gaps`, `gap_stopped`) | N | restate to the `blocked` gap stop |
| | 652-662 contract-identity paragraph | D | lists declared schema and definition digests; kept, listed |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN` (7) | 358 row | N | restate to `admitExactInvocation` only |
| | 513-516, 619-621 | N | drop the gap-stop re-entry and `evaluateNext -> admitConstructionIntent` clauses |
| | 863, 930 ("new-action/child-basis admission") | N | restate to child-basis admission |
| `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` (5) | 27 | N | drop "a Consensus controller" |
| | 130-134 Consensus round `terminal` | N | restate to the Executive's `terminationFieldRef` (`gtl/default_library.ts`) |
| | 230 | N | status and replay reads only |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` (5) | 110-111 deferral rows | N | cut both rows |
| | 687 `-One Surface and Consensus` | N | drop |
| | 845 `+stageRole` | F | generic C-call stage role (`validator/validation.ts`) |
| | 1274 | N | drop "Consensus" |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN` (8) | 47 | J | scope statement: this design changes neither S03 nor the planned 5.1 S05 |
| | 130 (`M05_S05_...md` predecessor) | N | re-point to `history/` |
| | 2178 D02, 2222, 2261-2264 | D | member rows and their binding module; kept, listed |
| `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN` (3) | 725 | N | drop the S05 gate and its mutation |
| | 747 | J | names the planned 5.1 scenario with no semantic delta |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN` (2) | 320 "F07 complete One Surface" | N | restate to the Executive system program |
| | 444 `EdgeFulfillmentLedgerRow` sentence | N | cut sentence |
| `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN` (1) | 233 | N | status and replay projections only |
| `T287_F11_CARRIER_RESOURCE_DESIGN` (1) | 407 | N | drop "and Consensus" |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` (1) | 70 | N | drop the current-intent and selected-action continuation variants |
| `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` (1) | 113-115 | N | "gaps" leaves the surface list; heading `One Surface Rule` (a single liveness surface) restated to `Single Liveness Surface Rule` |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN` (1) | 657 | N | drop "ConstructionComposition or" |
| | 645-656 root mode and start | L | rule 8 |
| `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN` (1) | 286 | J | states the Product's 5.1 reservation |
| `T287_D6_RC6_RELEASE_IDENTITY_DESIGN` (1) | 516 | J | states the Product's 5.1 reservation |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS` (2) | 107, 322 | F | generic observation in a reference frame |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN` (1) | 283 | F | prohibition of an observation-snapshot authority carrier |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN` (2+1) | 417, 450 | F | generic `stageRole` |
| | 125 (`FN-COMP-001..024`) | N | to `-001..023` |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` (2) | 26, 299 (`EVENTS-029..032`) | N | to `-029`, `-031`, `-032` |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN` (1) | 169 (`FN-COMP-001..024`) | N | to `-001..023` |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN` (1) | 26 (`FN-COMP-015/021..024`) | N | to `-015/021..023` |
| `T287_C2_FORWARD_REENTRY_DESIGN` (3+1) | 40, 47-48, 75 | L | rule 8 |
| `ABI5_REALIZATION_CONSTITUTION` (28+1) | all | L | rule 8 |
| `README.md` (2) | 15, 20 | N | line 15 leaves; line 20 restated |

The census rows give line numbers at `5c9df5056` and name sections by their
headings. Section 2 gives the ranges as carried out, at the commit each
retired-file block names; those ranges are authoritative.

## 2. Census as carried out

Totals: **1 note moved** (810 lines), **1,635 lines cut** from 6 notes,
**804 lines restated as 265 lines** in 22 notes. Every cut or replaced line is
in `T/design/history/<NOTE>__RETIRED_SECTIONS.md` under a block whose first
line is ``Cut from `<path>` at commit `<commit>`, lines <ranges>, verbatim.``
Blocks at `8477fbc47` are whole-section cuts (rule 3); blocks at `70320c3f0`
hold the text that a restatement replaced (rule 4). Where the file already
existed, the block follows a `---` separator between blank lines; no existing
block changed.

| Note | Moved | Cut (rule 3) | Restated (rule 4): old lines -> new lines |
|---|---|---|---|
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` | 810 | - | - |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN` | - | 1,370 | 617 -> 106 |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN` | - | 247 | 87 -> 61 |
| `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION` | - | 13 | 11 -> 14 |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` | - | 2 | 5 -> 5 |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` | - | 2 | 2 -> 1 |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN` | - | 1 | 21 -> 18 |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN` | - | - | 14 -> 13 |
| `ABI5_STDO3_COMPUTATIONAL_BINDING` | - | - | 4 -> 4 |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN` | - | - | 8 -> 7 |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN` | - | - | 11 -> 12 |
| `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` | - | - | 7 -> 8 |
| `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN` | - | - | 1 -> 1 |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN` | - | - | 3 -> 2 |
| `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN` | - | - | 1 -> 1 |
| `T287_F11_CARRIER_RESOURCE_DESIGN` | - | - | 1 -> 1 |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` | - | - | 1 -> 1 |
| `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` | - | - | 3 -> 3 |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN` | - | - | 2 -> 2 |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` | - | - | 2 -> 2 |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN` | - | - | 1 -> 1 |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN` | - | - | 1 -> 1 |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN` | - | - | 1 -> 1 |
| **Total** | **810** | **1,635** | **804 -> 265** |

`T287_D1`, `T287_PUBLIC_DEFINITION_CALL` and `T287_R10` had no retired-sections
file; each gained one and one pointer line after its title (two lines each, not
counted above). `T287_PENDING` gained its file and pointer with the cuts.

Scripts: `/private/tmp/abg-td26p0b-work/apply.py` applies an edit list
(`spec_cuts.py`, `spec_restate.py`) and writes the retired blocks;
`apply.py --verify <spec> <commit>` re-applies the list to the parent, compares
note and retired file in both directions, and reads each block's header ranges
back against the parent. Both lists verify `ALL OK` at `70320c3f0` and
`91afb9cee`.

## 3. Notes moved

| Note | Commit | Lines | Why whole |
|---|---|---|---|
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | `8477fbc47` (`git mv`, 100% rename) | 810 | its subject is standalone Consensus as a GTL library; the 5.0 Product ships no Consensus GraphFunction (`PRODUCT.md` line 1078, `A5-F08` planned 5.1) |

No other kept note has a wholly retired subject. `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md`
was already in `history/` (TD-28b); `T287_C2_FORWARD_REENTRY_DESIGN.md` leaves
in its own package (rule 8).

## 4. Sections cut (rule 3), at `8477fbc47`

| Note | Lines | Section |
|---|---|---|
| `M05_DIRECT` | 86, 92 | boundary rows for the S05 Consensus slice and its deferred proof |
| `M05_DIRECT` | 1722-1762 | §12.1 Product And Static Authority (One Surface authorities) |
| `M05_DIRECT` | 1842-2091 | §12.3 Evidence Fold And Closure, §12.4 Prohibitions And Evidence, §12.5 Typed Gap Stop And Public Re-entry, §12.6 Resolved Run Projection, §12.7 Typed Reprice-Required Stop |
| `M05_DIRECT` | 2183-3259 | §12.10 Governed Correction And Escalation; §13 S05 Ordinary-Path Consensus (13.1-13.10) |
| `T287_PENDING` | 324-411 | Exact ConstructionIntent Continuation |
| `T287_PENDING` | 442-493 | Selected Action At An Unconsumed Durable Boundary |
| `T287_PENDING` | 884-982, 1020-1027 | selected-action installed-proof paragraphs and carrier table |
| `ABG_EVENT_CALCULUS_RUNTIME_LAW` | 199-211 | exact construction-intent continuation paragraph |
| `M05_S06_PUBLIC` | 35, 112 | `REQ-P-CONSENSUS-012..015` line and row |
| `M03_DIRECT` | 110-111 | One Surface and Consensus deferral rows |
| `T287_REGISTERED_GRAPH_SELECTION` | 42 | ConstructionComposition fixture row |

Section numbering of `M05_DIRECT` keeps the gap at §13, as TD-64R left gaps;
`M05_S06_NATIVE_CONTRACT_CLOSURE` line 751 cites "M05 Section 14" by number.

## 5. Sentences restated (rule 4), at `70320c3f0`

Before-text is verbatim in each note's retired file under the `70320c3f0`
block. The after-text cites the realizing file and symbol.

| Note: lines | Before (quoted) | After (quoted) |
|---|---|---|
| `M05_DIRECT`: 3-9 | "Section 12 is accepted at exact candidate `8865ccff`; the replacement S05 design and realization are accepted at `283325aa` and `1ddc802d`." | "Section 12 states the root invocation authority, installed Product semantics and public starts as the code realizes them." Date line `2026-11-12`. |
| `M05_DIRECT`: 20-24 | "`A5-F08`, `A5-F09`, ..."; "accepted `ABG5-S02`, `ABG5-S03`, and `ABG5-S05`" | "`A5-F09`, `A5-F10`, and `A5-F14`"; "accepted `ABG5-S02` and `ABG5-S03`" |
| `M05_DIRECT`: 85 | "One Surface semantic program and F_H interaction policy \| accepted S03 basis under T-270; completed T-272 is retained evidence" | "standard system program and F_H interaction policy \| the default library's Executive (`executive`, `gtl/default_library.ts`; `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`); the F_H hold in Section 6" |
| `M05_DIRECT`: 98 | "`REQ-R-ABG3-CONTINUATION-001..014`" | "`REQ-R-ABG3-CONTINUATION-001..011`, `-014`" |
| `M05_DIRECT`: 236 | "`run.continue` has the members `current_intent` and `selected_action`, which continue construction continuations" | "`run.continue` `current_intent` continues a replay-derived pending execution (`projectPendingExecutionContinuations`, `abg/construction_continuation.ts`; `runPendingExecutionOwner`, `owner_bindings/run_invocation.ts`)" |
| `M05_DIRECT`: 754-755 | mermaid "+OneSurface", "+Consensus" | removed |
| `M05_DIRECT`: 1150-1152 | "as retained T-272 evidence for T-270's accepted S03 reconciliation, without moving One Surface authority into traversal infrastructure" | "without moving semantic selection into traversal infrastructure" |
| `M05_DIRECT`: 1188-1770 | "## 12. S03 One Surface Governed Evidence Fold", its intro, §12.0 Boundary Reconciliation and §12.2 Canonical Intent And Continuation up to the diagnostic paragraph | "## 12. Root Invocation Authority, Installed Product Semantics And Public Starts" with intro; "### 12.1 Root Invocation Policy And Grant" (`constructRootInvocationPolicy`, `InvocationPolicyBasis`, `constructCapabilityGrant`, `DIRECT_INVOKE_CAPABILITY`, `product/invocation.ts`; `validateInvocationCapabilityBasis`, `admitInvocationWithRequest`, `admitInvocation`, `admitExactInvocation`, `abg/invocation_admission.ts`; `RUN_OPERATION_CONTRACTS`, `product/run_operation_contracts.ts`; refusal `capability_mismatch`); "### 12.2 Installed Product Semantics And Leaf Projection" (`loadInstalledProductSemantics`, `admitInstalledProductInput`, `ProductSemanticsProvider`, `projectInstalledLeafSemantics`, `mintInstalledLeafSemanticsProjection`, `inspectProductLeafSemanticsProjection`, `verifyInstalledContent`, `product/semantics.ts`; `product/builtin_semantics.ts`; `constructAdmittedLeafInvocationPort`, `implementation/leaf_invocation_port.ts`; `LeafInvocationPort`, `implementation/contracts.ts`); "### 12.3 Runtime-Failure Diagnostic" heading over the kept diagnostic paragraph |
| `M05_DIRECT`: 1794-1798 | "`superseded` and `abandoned` remain requirement-level lifecycle variants ... explicitly deferred and are not included in the S03 proof claim." | removed (the F_H continuation sentence before it stays) |
| `M05_DIRECT`: 1800, 1849 | "### 12.8 ...", "### 12.9 ..." | "### 12.4 ...", "### 12.5 ..." (bodies unchanged) |
| `M05_DIRECT`: 1871-1877 | "Direct convergence does not add the One Surface overlay, ..."; "The supervised `until = converged` start and durable gap re-entry remain unchanged. A direct request cannot carry gap re-entry authority, ..." | "Direct convergence does not install an SDK loop, ..."; "A direct start requires a Program whose `abg.root_mode` policy is `direct` and no caller-selected start. A supervised start requires a caller-selected `startRef` equal to the target and a Program whose policy is `supervised`, and resolves exactly one declared start. Both require `until = converged`, and any other combination refuses `unsupported_control` (`resolveProgramStart`, `directStartRefusal`, `gtl/public_start.ts`)." |
| `T287_PENDING`: 11 | "CONTINUATION-011/-012/-013/" | "CONTINUATION-011/" |
| `T287_PENDING`: 31-35 | "foundation and optional composition. One Surface's model/gap/next-action/action authorities and the default library's framed synthesis/registered selection both run on HoG. No feature aggregate, universal ConstructionComposition, ..." | "foundation. The default library's framed synthesis and registered selection run on HoG (`executive`, `gtl/default_library.ts`). No feature aggregate, exhaustive workspace model, ..." |
| `T287_PENDING`: 344-346, 355 | "If Executive instead selects exact current_intent, ..."; "Exact execution resumption is selected for the bounded realization above; it remains unqualified ..." | "If Executive instead selects the exact `current_intent` pending-execution continuation (`runPendingExecutionOwner`, `owner_bindings/run_invocation.ts`), ..."; second sentence removed |
| `T287_PENDING`: 360-368 | "The default library has no `constructionComposition`. Its executive root ... The construction-intent and selected-action variants keep their meanings. No intent, construction composition, One Surface substitute or fresh ..." | "The default library's `executive` root recurses over `executive-step`, ... work -> fold) (`gtl/default_library.ts`). No fresh retained-work invocation stands in for this alternative." |
| `T287_PENDING`: 377-380 | "The construction-intent arm, its owner and its result are unchanged. The owner selects by arm: ... enters the pending-execution owner." | "The owner selects by arm: ... enters the pending-execution owner (`runPendingExecutionOwner`, `owner_bindings/run_invocation.ts`)." |
| `T287_PENDING`: 452-460 | "Replacement-Run continuation remains the existing `construction_intent` relation (CONTINUATION-003/-004/-015): ... Neither arm reads a context body ..." | "This arm reads no context body held in another Run; ... No event family is added for it." |
| `T287_PENDING`: 541-542 | "No replacement control Run, `constructionContinuationUse` or `current_intent` widening" | "No replacement control Run or `current_intent` widening" |
| `T287_PENDING`: 573-585 | "Survivors: the construction-intent arm ... and `selected_action`. ... only the current-execution member's closed domain gains `pending_execution`. The pending-Testing discriminator keeps its own interrupting host because its stop predicate ... differs from the selected-action host's." | "The current-execution member's closed domain includes `pending_execution` (`CURRENT_EXECUTION_KINDS`, `product/run_operation_contracts.ts`). The pending-Testing discriminator has its own interrupting host, whose stop predicate is the first entered Testing wrapper cursor. It uses the native fsync observation and `recoverInterruptedEventStore` recovery (`abg/event_store.ts`)." |
| `T287_PENDING`: 593-595 | "Callers: construction-intent preparation (root and child), selected-action preparation, pending-execution preparation, the pending input join, and HoG child-level restoration (`pendingExecutionState`)." | "Pending-execution callers: preparation (`preparePendingExecutionContinuation`), the pending input join (`projectPendingExecutionInputAtPrefix`), and HoG child-level restoration (`pendingExecutionState`, `hog/graph_execute.ts`)." |
| `T287_PENDING`: 609-615 | "(`evaluateTraversalProgram`) for ordinary, `constructionResume` and `pendingExecutionResume` entry. The preparation tokens (`preparedRelations`, `preparedOperations`, `selectedPreparations`, `pendingExecutionUses`) are read at admission. ... The construction-intent arm and `selected_action` remain separate variants." | "(`evaluateTraversalProgram`, `hog/graph_execute.ts`) for ordinary and `pendingExecutionResume` entry. The preparation token `pendingExecutionUses` is read at admission (`admitPendingExecutionContinuationOperation`, `abg/construction_continuation.ts`). It authenticates the exact prepared value and is not a write-only registry." |
| `T287_PENDING`: 700-703 | "The recursive, exact-intent and default-library pending tests pass over it. The selected-action installed tests read witness inputs outside ..." | "The recursive and default-library pending tests pass over it." |
| `T287_PENDING`: 720-741 | "All continuation variants use the construction-continuation owner's shared workspace operation envelope. Its causes are the admitted workspace invocation and any separately admitted workspace operation basis ... This corrects the selected-action recurrence ..." and the selected-action owner paragraph | "The pending-execution continuation uses the construction-continuation owner's shared workspace operation envelope (`constructionContinuationOperationCandidate`, `abg/construction_continuation.ts`). Its causes are the invocation's admission event and the causes of its public-operation basis. ... share this envelope correspondence (`continuationOperationWorkspaceCorresponds`) while retaining the pending/use checks." |
| `T287_PENDING`: 744-747 | "## Selected Installed Proof Composition"; "Physical storage rows and logical runtime events are another representation" | "## Event Observation, Recovery And Receipts"; "... are a representation" |
| `ABG_EVENT_CALCULUS`: 71 | "\| New graph work toward the same outcome \| CONTINUATION-012/-013, Product framed evaluation, One Surface or the actually selected library composition" | "\| ... \| Product framed evaluation and the actually selected library composition, such as the Executive's registered selection (`projectGovernanceChoice`, `abg/default_library.ts`)" |
| `ABG_EVENT_CALCULUS`: 74-80 | "`evaluateNext -> admitConstructionIntent -> invokeGraphFunction` is the existing One Surface relation. Its construction-specific carriers apply where that composition is selected; they are not silently imposed on the default library or every GTL Program. The latter use ... under Product." | "The default library and every GTL Program use their admitted evaluation, registered-choice and call owners under Product: the Executive's `select` F_P chooses one registered graph (`selectGovernanceWork`, `implementation/default_library.ts`), its `project-choice` F_D projects that choice (`projectGovernanceChoice`, `abg/default_library.ts`), HoG proposes the selected route (`proposeJudgedRoute`, `hog/route_proposal.ts`), and ABG admits it after resolving the same selection again (`admitRoute`, `registeredSelectionContinuationMatches`, `abg/traversal_route.ts`)." (wording as corrected in `b9bdba6f6`) |
| `ABG_EVENT_CALCULUS`: 200-202 | "The registered-selection pending-execution alternative ... applies the same law without a ConstructionIntent." | "The registered-selection pending-execution continuation ... applies this law (`projectPendingExecutionContinuations`, `abg/construction_continuation.ts`)." |
| `M05_S06_PUBLIC`: 32, 108 | "`REQ-P-POLICY-022..064`", "`REQ-P-POLICY-023..040`" | "`REQ-P-POLICY-022..028`, `-031..064`", "`REQ-P-POLICY-023..028`, `-031..040`" |
| `M05_S06_PUBLIC`: 39 | "accepted S05 Consensus and S06 native-contract designs." | "the accepted S06 native-contract design." |
| `M05_S06_PUBLIC`: 3352-3353 | "retained S03/S05 invocation, continuation, Consensus, and reads remain indexed members of the family;" | "retained invocation, continuation and read members remain indexed members of the family (`shared/capability_contracts.ts`);" |
| `M03_DIRECT`: 685, 1272 | mermaid "-One Surface and Consensus"; "Live F_P workers, Consensus, and" | removed; "Live F_P workers and" |
| `T287_REGISTERED_GRAPH_SELECTION`: 25-32 | "The original proposal was rejected because it made One Surface's model, gap, action-evaluation and refresh phases prerequisites for generic selection. ... Those phases are an optional library pattern. `GtlProgram.constructionComposition` and its singular semantics remain unchanged. ..." | "A registered selection needs no model, gap, action-evaluation or refresh phase before it: its source is one ordinary graph computation whose result the application resolves to one declared target (`resolveRegisteredSelection`, `gtl/registered_selection.ts`). The first proposal for this design is preserved in `registered-selection-design-v1.md` ..." |
| `T287_REGISTERED_GRAPH_SELECTION`: 143-144 | "Add neither `construction_intent_selected` nor a selection ledger" | "Add no other event and no selection ledger" |
| `T287_REGISTERED_GRAPH_SELECTION`: 150-153 | "Keep the existing ConstructionIntent path and guard unchanged; the generic route supplies ... the same child preparation seam. Both use ordinary child materialization" | "The generic route supplies ... the child preparation seam (`prepareWorkflowChildExecutionBasis`, `abg/execution_basis.ts`) and uses ordinary child materialization" |
| `T287_REGISTERED_GRAPH_SELECTION`: 206, 209, 210, 221-223, 228 | "ConstructionComposition and C terms retain meaning; ... one more application arm"; "Preserve construction-specific semantics."; "No One Surface prerequisites."; "Its root has no ConstructionComposition, action catalogue, ..."; "installed external Product/consensus tests" | "C terms retain meaning; ... one application arm of `validateProgramSubject`"; removed; removed; removed; "installed external Product tests" |
| `ABI5_COMMON`: 651 | "the per-successor construction-intent continuation, its re-entry and the selected-action and pending-execution operations; ... The construction-intent continuation reads the Run-open envelope before any Run body." | "the pending-execution operation (`admitPendingExecutionContinuationOperation`, `abg/construction_continuation.ts`); ..." (last sentence removed) |
| `ABI5_COMMON`: 665 | "in that order, with no construction intent." | "in that order." |
| `ABI5_COMMON`: 710, 758 | "EVENTS-002/003/030" | "EVENTS-002/003" |
| `ABI5_COMMON`: 795-800 | "R-B holds six reads: `run_status`, `run_result`, `run_replay`, `run_gaps`, ... Twelve reads ... `workspace_gaps` and `run_lawful_actions`." | "R-B holds `run_status`, `run_result`, `run_replay`, `graph_call_result` and `graph_call_replay` (`prepareRunReadAtDurablePrefix`, `abg/project_read_ports.ts`). These reads ... `continuation_replay` and `c_call_replay`." |
| `ABI5_COMMON`: 1068-1070 | "`runCurrentIntentOwner`, `runSelectedActionOwner`," | "`owner_bindings/run_invocation.ts` (`runInvocationOwner`, `runPendingExecutionOwner`) acquires its event resource ..." |
| `ABI5_COMMON`: 1304 | "\| Distinct One Surface authorities, fresh evidence and admitted consequence. \|" | "\| Executive steps (`executive-step`, `gtl/default_library.ts`): one `F_P` registered selection over a prepared basis, admitted consequence and folded evidence. \|" |
| `ABI5_STDO3`: 170 | "- Closure: `constructionDeltaForAdvance` in traversal_route.ts. Under the construction authority that `selectAdmittedConstructionAuthority(…, "evaluateAction")` selects ..., it admits the Product `evaluateAction` result ..." | "- Closure: `admitOwnedScopeClosure` in closure.ts. From the source C-call's admitted Result and Judgment ..., it admits `terminal_reached`, `frame_closed` and `graph_call_closed`, and also `run_closed` for the root scope. It refuses `replay_mismatch` ..." |
| `ABI5_STDO3`: 182 | "and the closure fold"; "`admitRoute`, `constructionDeltaForAdvance`, `actionEvaluationProjection`, `edgeClosureDecision`;"; "Closure admits the `evaluateAction` result as the route's `actionEvaluationAdmission` member, ..." | "and scope closure"; "`admitRoute`;"; "Closure (`admitOwnedScopeClosure`) admits the terminal, frame, GraphCall and, at the root, Run closure events from the admitted source Result and Judgment." |
| `ABI5_STDO3`: 189 | "(requirement handoff, ..., worksite, Consensus, default library)"; "Consensus' role recursion runs submitter to reviewer once;" | "(requirement handoff, ..., worksite, default library)"; clause removed |
| `ABI5_STDO3`: 462 | "\| A5-F07 One Surface \| ..., [M05 §12](...#12-s03-one-surface-governed-evidence-fold) \| S03 retains four separate semantic authorities, ..." | "\| A5-F07 Executive system program \| ..., [default library](T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md), [registered selection](T287_REGISTERED_GRAPH_SELECTION_DESIGN.md) \| S03: each Executive step (`executive-step`, `gtl/default_library.ts`) prepares a selection basis, selects one registered graph through one `F_P` selection, applies it as a registered selection and folds the admitted evidence; a stop or gap reads back through its stop reading, and an F_H hold through its open continuation (`projectFhContinuations`, `abg/fh_continuation_projection.ts`). \|" (wording as corrected in `b9bdba6f6`) |
| `T287_R10`: 209, 214 | "held/gap_stopped to nonterminal"; "active/held/gap-stopped subject truth" | "held to nonterminal"; "active/held subject truth" |
| `T287_R10`: 608, 627-629 | "-> nextActions: run_lawful_actions over the same context"; "Its next lawful actions are the Run's `run_lawful_actions`; the native `run-resumed` act has no Public definition binding, so the reading names none." | both removed |
| `T287_R10`: 646-647 | "`run_gaps` keeps the HoG gap frontier. A registered-selection gap is a `blocked` stop with reason `default-library/gap@5`, not `gap_stopped`." | "A registered-selection gap is a `blocked` stop with reason `default-library/gap@5` (`governanceRef("reason", "gap")`, `product/default_library_identity.ts`; `resolveJudgmentRelation`, `product/builtin_semantics.ts`)." |
| `T287_D2`: 358 | "`abg/traversal_route.ts::rehydrateConstructionIntentForCursorAtPrefix`; ... Existing action/intent and invocation joins retain selected obligation/assets and exact authority. Durable gap-start re-entry additionally requires ..." | "`abg/invocation_admission.ts::admitExactInvocation` \| The invocation join retains exact authority (`validateInvocationCapabilityBasis`) ..." |
| `T287_D2`: 513-516 | "Actual F_H holds and gap-stops use their existing exact continuation/re-entry paths only when their conditions are present. Fresh next work retains `evaluateNext -> admitConstructionIntent -> invokeGraphFunction` where required by the selected composition;" | "An actual F_H hold opens its existing continuation only when its conditions are present (`holdOwnedInteraction`, `hog/interaction_lifecycle.ts`). The selected composition chooses fresh next work;" |
| `T287_D2`: 620-621 | "Keep `evaluateNext -> admitConstructionIntent -> invokeGraphFunction` wherever the selected action requires it." | removed |
| `T287_D2`: 862-864, 930 | "new-action/child-basis admission owner checks the cover for the exact declared D2 entry;" | "invocation and child-basis admission owners check the cover for the exact declared D2 entry (`worksiteRevisionEntryBindingDisposition`, `abg/worksite_revision.ts`, applied in `admitInvocationWithRequest`, `abg/invocation_admission.ts`);"; line 930 likewise |
| `M03_TYPED_RECURSE`: 27 | "a Consensus controller, round service," | "a round service," |
| `M03_TYPED_RECURSE`: 130-134 | "In Consensus the round state's `terminal` field is the declared termination field (`terminationFieldRef: "$.terminal"`, `constructConsensusModulePublication`, `gtl/consensus.ts`): `closed_done` terminates, and only `recurse_next_round` continues the recursion (`reduceConsensusRound`, `gtl/consensus.ts`)." | "In the Executive the governance state's `terminal` field is the declared termination field (`terminationFieldRef: "$.terminal"`, `recurseApplication` in `gtl/default_library.ts`). The parent evaluation `projectGovernanceParent` (`abg/default_library.ts`) computes it from the step's admitted record: `true` terminates the recursion and `false` continues it." |
| `M03_TYPED_RECURSE`: 230 | "the status, replay, gaps and lawful-actions reads carry" | "the status and replay reads carry" |
| `M05_S06_NATIVE`: 725 | "\| accepted behavior conserved \| S03, S05, S06, M4, external, package gates \| retained S05 authority mutation stays sensitive \|" | "\| accepted behavior conserved \| S03, S06, M4, external, package gates \| a retained gate fails \|" |
| `T287_D1`: 320 | "F07 complete One Surface," | "F07 the Executive system program," |
| `T287_D1`: 444-445 | "No `EdgeFulfillmentLedgerRow` for those application requirements may be manufactured from the transfer judgment." | removed |
| `T287_NATIVE_LIVENESS`: 233 | "status, replay, gaps and lawful-action projections" | "status and replay projections" |
| `T287_F11_CARRIER`: 407 | "Existing native-work and Consensus consumers" | "Existing native-work consumers" |
| `T287_PUBLIC_DEFINITION_CALL`: 70 | "and current-intent, pending-execution and selected-action continuation variants." | "and the pending-execution continuation variant (`constructInstalledPendingCall`, `public/installed_public_definition_call.ts`)." |
| `M03_SYSTEM_PROBE`: 113-115 | "## One Surface Rule"; "Public start, gaps, live status, ..." | "## Single Liveness Surface Rule"; "Public start, live status, ..." |
| `T287_DEFAULT_GOVERNANCE_LIBRARY`: 657 | "No ConstructionComposition or mandatory stage sequence is introduced." | "No mandatory stage sequence is introduced." (line 656 carried unchanged inside the range) |
| `T287_W2_R3_C0`: 26, 299 | "EVENTS-029..032" | "EVENTS-029/031/032"; "`REQ-R-ABG3-EVENTS-029`, `-031`, `-032`" |
| `T287_W2_R3_C1`: 169; `C3`: 125 | "`REQ-R-ABG3-FN-COMP-001..024`" | "`REQ-R-ABG3-FN-COMP-001..023`" |
| `T287_W2_R3_SINGLE_START`: 26 | "`REQ-R-ABG3-FN-COMP-015/021..024`" | "`REQ-R-ABG3-FN-COMP-015/021..023`" |

### Citations verified at head

Every file and symbol that the restatements cite for the first time, with the
site read at head (`T/code/src`):

| Cited | Site |
|---|---|
| `constructRootInvocationPolicy`, `constructCapabilityGrant`, `DIRECT_INVOKE_CAPABILITY`, `InvocationPolicyBasis` (with `trusted_developer`, `after_invocation_admission`) | `product/invocation.ts:522`, `:840`, `:47`, `:75` (`:80`, `:92`) |
| `validateInvocationCapabilityBasis`, `admitInvocationWithRequest`, `admitInvocation`, `admitExactInvocation`, `capability_mismatch` | `abg/invocation_admission.ts:725`, `:863` (call at `:1537`), `:1742`, `:1760`, `:262` |
| `RUN_OPERATION_CONTRACTS`, `CURRENT_EXECUTION_KINDS` | `product/run_operation_contracts.ts:320`, `:192` |
| `loadInstalledProductSemantics`, `admitInstalledProductInput`, `ProductSemanticsProvider`, `projectInstalledLeafSemantics`, `mintInstalledLeafSemanticsProjection`, `inspectProductLeafSemanticsProjection`, `verifyInstalledContent` | `product/semantics.ts:381`, `:557`, `:146`, `:637`, `:312`, `:332`, `:259` |
| `constructAdmittedLeafInvocationPort`, `LeafInvocationPort` | `implementation/leaf_invocation_port.ts:935` (calls `verifyInstalledContent` at `:974`); `implementation/contracts.ts:355` |
| `projectInstalledLeafSemantics` call sites | `owner_bindings/run_invocation.ts:1171`, `:1559` |
| `resolveProgramStart`, `directStartRefusal`, `unsupported_control`, `abg.root_mode` | `gtl/public_start.ts:79`, `:56`, `:26`, `:62` and `:90` |
| `executive`, `executive-step`, `recurseApplication` with `terminationFieldRef: "$.terminal"` | `gtl/default_library.ts:63-86` (`recurseApplication` call at `:73-74`, defined `gtl/graph_applications.ts:126`) |
| `projectGovernanceChoice`, `projectGovernanceParent` | `abg/default_library.ts:256`, `:524`; read in full: `projectGovernanceParent` (the `evaluate-parent` implementation, `:578`) sets `terminal` true only when the acceptance verdict is satisfied over admitted assessment rows and the step's sources are current, and false otherwise |
| `selectGovernanceWork` | `implementation/default_library.ts:109` |
| `governanceRef("reason", "gap")`, `resolveJudgmentRelation` | `product/default_library_identity.ts:2`; `product/builtin_semantics.ts:245` (gap relation `:1030-1033`) |
| `resolveRegisteredSelection` | `gtl/registered_selection.ts:61` |
| `proposeJudgedRoute` (calls `resolveRegisteredSelection` at `:399`) | `hog/route_proposal.ts:380` |
| `admitRoute`, `registeredSelectionContinuationMatches` (called from `admitRoute` at `:4475`) | `abg/traversal_route.ts:4141`, `:3691` |
| `projectFhContinuations` | `abg/fh_continuation_projection.ts:245` |
| `prepareWorkflowChildExecutionBasis` | `abg/execution_basis.ts:2330` |
| `projectPendingExecutionContinuations`, `admitPendingExecutionContinuationOperation` (reads `pendingExecutionUses`), `preparePendingExecutionContinuation`, `projectPendingExecutionInputAtPrefix`, `constructionContinuationOperationCandidate`, `continuationOperationWorkspaceCorresponds` | `abg/construction_continuation.ts:323`, `:971`, `:1023`, `:1070`, `:478`, `:506` |
| `runPendingExecutionOwner`, `runInvocationOwner` | `owner_bindings/run_invocation.ts:1670`, `:818` |
| `pendingExecutionState`, `evaluateTraversalProgram` | `hog/graph_execute.ts:974`, `:568` |
| `recoverInterruptedEventStore` | `abg/event_store.ts:4102` |
| `admitOwnedScopeClosure`, `terminal_reached`, `frame_closed`, `graph_call_closed`, `run_closed`, `replay_mismatch` | `abg/closure.ts:324` |
| `prepareRunReadAtDurablePrefix` | `abg/project_read_ports.ts:981` |
| `worksiteRevisionEntryBindingDisposition` | `abg/worksite_revision.ts:491`, applied in `admitInvocationWithRequest` at `abg/invocation_admission.ts:1289` |
| `holdOwnedInteraction` | `hog/interaction_lifecycle.ts:62` |
| `constructInstalledPendingCall` | `public/installed_public_definition_call.ts:598` |
| `shared/capability_contracts.ts` | file exists; holds the indexed family |

A script extracted every backticked token from the restated lines and ran
`grep -rlw` over `T/code/src`: all 47 cited files exist and every identifier
resolves except five that the pre-existing text of `ABI5_COMMON` line 651
names as retired adapters (`authenticateSemanticStageBasis`,
`authenticateSemanticJobBasis`, `projectJobRevisionSubject`,
`projectRevisionSelectionSubject`, `runtimePrefixFromArtifactTruth`), the
ontology member name `Continuation`, and commit hashes.

## 6. Left for other packages (rule 8)

| Passage | Lines at branch head | Reason |
|---|---|---|
| `ABI5_REALIZATION_CONSTITUTION.md` | 28 census hits, including line 3075 (`REQ-R-ABG3-CONTINUATION-011..014`, which spans the deleted -012/-013) | amended once, after the retirements |
| `T287_C2_FORWARD_REENTRY_DESIGN.md` | 40 (`CONTINUATION-003/004/011/012/014`, -012 deleted), 47-48 (`evaluateNext -> admitConstructionIntent -> invokeGraphFunction`), 75 (`ActionCatalog`) | leaves whole in its own package |
| `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` | already in `history/` (TD-28b) | none here |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 645-656 "Selected execution relation", including "The optional recursive Executive performs parent evaluation → ..." and the Program's root mode and start sentences | another package restates them; line 657 here only lost "ConstructionComposition or" |

## 7. Left for the Executive

1. **Declared-member rows kept under rule 7.** These name members and grammar
   the code still declares; they leave with the code packages or the successor
   event profile:
   - `M05_S06_PUBLIC`: 294, 637 (`run.continue` `current_intent`,
     `selected_action`), 1336-1339, 1347, 1354, 1358, 1395-1402 (`workspace_gaps`,
     `run_gaps`, `run_lawful_actions`, `ticket_consensus`), 1652-1690
     (`RunContinueRequest<"selected_action">`, `ConstructionIntent`,
     `gap_stop`), 1807-1810, 1855, 2269, 2280-2282;
   - `M05_S06_AXIOMATIC`: 2178 (D02 `ConsensusProjectionPort`), 2222,
     2261-2264;
   - `T287_R10`: 652-662 (contract identity paragraph naming `selected_action`,
     `run_gaps`, `run_lawful_actions`).
2. **Qualification pins outside design.** `T/test_env/qualification/inventory.json`
   and `T/test_env/qualification/recipe/verification-recipe.json` name
   `design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` as a member (the recipe
   at lines 2662-2663) and pin the bytes of the kept notes changed here. Neither is
   edited (test_env is out of scope), as in TD-64R.
3. **RV4 F3 and F4**, which the plan's P0b scope names, sit outside `T/design`:
   F3 in `T/contracts/qualification/sources/INTENT.md` (line 175 names
   standalone Consensus qualification), F4 in the T-287 ticket rows now at
   `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:4107`
   and `:4147` ("Preserve existing ordinary Consensus GraphFunction"). This
   package edits design notes only, so both are unchanged.
4. **Falsifier wording.** `M05_S06_NATIVE` line 725 falsifier is mine: "a
   retained gate fails" replaces "retained S05 authority mutation stays
   sensitive".
5. **STDO3 ODD §11.5D.** After the row 462 restatement, `ABI5_STDO3` names no
   separate closure placement for the A5 One Surface proof; the row now cites
   the default library and registered selection notes.
6. **Root mode.** The specification says the default `supervised` root mode
   selects the Executive; the Program at head is `direct`
   (`gtl/default_library.ts:318`). P0 Return open point 1 owns this. The
   restated start law in `M05_DIRECT` §12.5 states only the generic law of
   `gtl/public_start.ts`, so it is not a stop for this package.
7. **Pre-existing duplicates.** `T287_REGISTERED_GRAPH_SELECTION` has two
   `Retired sections:` pointer lines (3 and 8) from earlier packages; neither
   is changed.

No live sentence was left unrestated for want of a reading of the code.

## 8. Residue search

Whole kept-note set after the change, with the census regexes
(`/private/tmp/abg-td26p0b-work/allterms.txt`): 106 hits. Outside the rule-8
notes (constitution 28, `T287_C2` 3):

| Note: lines | Hit | Why it stays |
|---|---|---|
| `M05_S06_PUBLIC`: 294, 637, 1336-1339, 1347, 1354, 1358, 1395-1402, 1652-1690, 1807-1810, 1855, 2269, 2280, 2282 | declared members and grammar | rule 7; Executive list 1 |
| `M05_S06_PUBLIC`: 32, 106, 108, 109 | `POLICY-...` ranges | regex false positive: the ranges skip -029/-030 |
| `M05_S06_AXIOMATIC`: 2178, 2222, 2261-2264 | declared members | rule 7; Executive list 1 |
| `M05_S06_AXIOMATIC`: 47 | "S03 and S05 Product and scenario outcomes" | states that this design changes neither S03 nor the planned 5.1 S05 |
| `M05_S06_AXIOMATIC`: 114; `M05_S06_NATIVE`: 26 | `POLICY-...` ranges | false positive: no deleted id in range |
| `M05_S06_NATIVE`: 747 | "S03, S05," | names the planned 5.1 scenario with no semantic delta |
| `T287_R10`: 655, 658 | `selected_action`, `run_gaps`, `run_lawful_actions` | rule 7; Executive list 1 |
| `T287_PENDING`: 11, 219 | `CONTINUATION-011/`, `-014/015/016` | false positive: kept ids |
| `T287_PENDING`: 455, 566, 578, 604, 618, 708-710 | `constructionContinuationOperationCandidate`, `isConstructionContinuationKind`, `construction_continuation.ts` | kept code that the pending-execution continuation uses; the module keeps its name |
| `M05_DIRECT`: 98, 1192 | `CONTINUATION-001..011`, `-014` | false positive: the range regex |
| `M05_DIRECT`: 236; `ABG_EVENT_CALCULUS`: 205; `ABI5_COMMON`: 651 | `abg/construction_continuation.ts`, "construction-continuation" | kept module name and its operation vocabulary |
| `ABG_EVENT_CALCULUS`: 72, 192 | `CONTINUATION-011/-015/-016` | kept ids |
| `ABG_EVENT_CALCULUS`: 221 | "not an F_D semantic next-action controller" | a prohibition naming no carrier |
| `ABI5_STDO3`: 37; `T287_F11_REUSABLE`: 286; `T287_D6`: 516 | standalone Consensus as reserved | states the Product's 5.1 reservation |
| `ABI5_STDO3`: 185 | `t287-selected-action` | test lane named as evidence in a verification cell; the lane leaves with the code |
| `ABI5_PROJECT_REFERENCE_FRAME`: 107, 322; `T287_W2_R3_C2`: 283 | `ObservationSnapshot` | generic observation in a reference frame; a prohibition |
| `M03_DIRECT`: 842; `T287_W2_R3_C3`: 417, 450 | `stageRole` | generic C-call stage role (`validator/validation.ts:475`) |
| `README.md`: none | - | indexes restated |

`reqids.py` over the kept notes: 27 hits at base, 2 now, both in rule-8 notes
(constitution 3075, `T287_C2` 40).

## 9. Link and index checks

Script: `/private/tmp/abg-td26p0b-work/linkcheck.py`, run on `5c9df5056` and on
the branch. Existence comes from `git ls-tree` (the worktree is sparse).
Forms: `rel` markdown links resolved from the file, `repo` root links, `bare`
backticked note names, `anchor` fragments into a design note (GitHub slugs of
its headings).

| Scope / form | Base (links / dangling) | Branch |
|---|---|---|
| design-live rel | 498 / 39 | 497 / 39 |
| design-live anchor | 116 / 0 | 114 / 0 |
| design-live bare | 105 / 22 | 103 / 20 |
| design-live self-anchor | 3 / 0 | 3 / 0 |
| design-hist rel | 922 / 188 | 951 / 205 |
| design-hist bare | 747 / 193 | 779 / 196 |
| design-hist repo | 10 / 10 | 10 / 10 |

- **Kept notes:** no new dangling link or anchor. The two fewer bare
  danglings are the moved note's `INTENT.md` and `PRODUCT.md`.
- **History:** the new danglings all sit in verbatim text: the moved note,
  whose links resolve against the pre-move layout as `history/README.md`
  states, and the retired blocks (relative `../code/src/...`, sibling-note and
  `#12-s03-one-surface-governed-evidence-fold` links written for the kept
  note's directory).
- **No kept note links to `M05_S05`** except `M05_S06_AXIOMATIC` line 130,
  now `history/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`. Outside `T/design`,
  only records and the qualification pins (Executive list 2) name it.
- **Other scopes:** 55 anchor links from `specification/`,
  `.ai-workspace/tickets/`, the T292 work files and the tenant's code, tests
  and contracts point into notes edited here; all 55 resolve at base and at
  the branch. No file outside `T/design/history` cites an `M05_DIRECT` §12
  subsection by number; three completed tickets (T-274, T-275, T-276) cite
  "M05 Section 13" as their historical hold, and that section is now in the
  retired file.
- **Index:** `T/design/README.md` lists exactly the 48 kept notes (no
  duplicates, every label equals its file); its 99 realizing modules exist.
  `history/README.md` has one row per history note (279 = 279) and lists all
  retired-sections files on disk.

## 10. Diff scope and build

`git diff --stat 5c9df5056` touches 48 files under `T/design` plus this Return;
nothing else. `npm run build` in `T` exits 0 in 28 s and leaves `git status`
empty. Design notes are not in the payload: `package.json` `files` is
`build/**`, `contracts/**` and `product-toolchain-manifest.json`, the manifest
generator reads no design path, and the manifest names no `design/` entry.

## 11. Deviations

- Restated passages go to the retired file under the same ``Cut from ...``
  header as whole-section cuts, in a separate block per commit, so each block
  reads back against its parent commit.
- `history/README.md`: besides the M05_S05 row, seven cells that named
  M05_S05 or `M05_DIRECT` §12 as the replacing design now say what replaces
  them at head (rows for `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY`,
  `M01_M03_CONSENSUS_...`, `M02_M04_CONSENSUS_...`, `M03_CONSENSUS_...`,
  `M03_FP_CONSCIOUSNESS_LOOP_...`, `M03_M04_ONE_SURFACE_...`,
  `M04_M05_INSTALLED_CONSENSUS_...`), and the retired-sections list gained the
  existing `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN__RETIRED_SECTIONS.md`
  (TD-32, `7c817ac64`), which it lacked.
- `M05_DIRECT` §12 is a new section whose subsections are numbered 12.1-12.5:
  the kept graph-span re-entry and public-target subsections move from 12.8
  and 12.9 to 12.4 and 12.5, and the kept diagnostic paragraph sits under
  12.3. TD-64R left gaps where it cut; here no kept note, specification file,
  ticket or code file cites 12.8 or 12.9 by number or anchor (Section 9), so
  the renumbering breaks no citation. The §13 gap stays.
- After the advisor review, `b9bdba6f6` corrects two sentences of this
  package's own restatement (route admission in `ABG_EVENT_CALCULUS`, the
  hold reading in `ABI5_STDO3` row 462). The replaced wording was this
  package's text, not ratified design, so it has no retired block.
- `ABI5_STDO3` line 189 (two Consensus clauses in the F_D leaf row) was found by
  the residue search after the census and restated with the other passages.

## 12. Commits

| Commit | Content |
|---|---|
| `ee2ecced1` | census, as this Return's skeleton |
| `8477fbc47` | `git mv` of `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` to `history/` |
| `70320c3f0` | whole-section cuts to retired files |
| `91afb9cee` | restatements, replaced text to retired files |
| `151520fcc` | `README.md`, `history/README.md`, `M05_S06_AXIOMATIC` line 130 |
| `557048a24` | the Return |
| `b9bdba6f6` | correction of two restated sentences |
| this commit | the Return, updated |
