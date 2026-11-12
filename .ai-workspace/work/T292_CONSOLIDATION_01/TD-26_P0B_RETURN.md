# TD-26 P0b Return: design notes to history

**Status:** census committed; moves, cuts, restatements and indexes follow.

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
