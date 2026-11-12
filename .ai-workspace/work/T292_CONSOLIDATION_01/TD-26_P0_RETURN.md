# TD-26 P0 Return: the specification step of the One Surface and Consensus retirement

**Status: COMPLETE. The specification states the Executive as the standard system program and Consensus as the planned 5.1 outcome. A scratch restage and build accept it with no refusal, and both qualification lanes give the same per-test results as the base. Three items need a ruling (section 7).**

- Ticket: T-292, package TD-26 P0.
- Change class: product_reprice of `A5-F07`, with the requirement_reprice it carries.
- Branch: `claude/td26-p0-specification`, from local `main` at `fe01e37d8`. Nothing is pushed.
- Line numbers are at `fe01e37d8` unless a row says otherwise.

## 0. Commits and counts

| Commit | Group |
|---|---|
| `3b351324b` | Return skeleton: the census |
| `a4025d68d` | Product and Intent |
| `da50c6e9a` | Product requirements, the requirement READMEs and `scenarios/README.md` |
| `9103c93d4` | ABG, GTL and mapping requirements. Mapping had no census hit. |
| `ab7a494e0` | Moved files: `REQ-R-ABG3-FP-CONSCIOUSNESS.md` removed; `REQ-P-CONSENSUS.md` reduced to the requirements R5 keeps |
| `0993c5930` | Follow-up from the residue check: PRODUCT `:1022`, `REQ-P-CONSENSUS-004`, POLICY-054 |
| this commit | The Return |

The diff of `specification/` is 23 files, +166 and −614 lines. `GOALS.md` is untouched.

**Counts in the text.** The specification states no numeric count of operations, definitions, members or capabilities. The enumerations in the text are:

- **Operation table** (PUBLIC-CONTRACTS-008): 17 rows, plus the reserved `interaction.respond`, which makes 18 operation identities. This is unchanged.
- **Mandatory capability list** (PUBLIC-CONTRACTS-011): 15 identities. `abg.capability.graph-function.consensus@5` is no longer mentioned. The code keeps that capability mandatory, as a 16th identity, until P7.
- **Mandatory contract-row list** (PUBLIC-CONTRACTS-006A): no Consensus id. The 9 schema ids and the 2 vocabulary ids are removed. The code publishes 13 Consensus schema rows until P7 and 3 Consensus vocabularies until P2. They are kept live by R5 (section 2).
- **Definitions:** no definition count appears. The end state is 18 operations and 51 definitions (42 callable, 9 unavailable), and nothing in the text contradicts it. The five `interaction.respond` sentences are unchanged.

## 1. Census as carried out

The search is described in the census commit `3b351324b`, and the same terms drive the residue search in section 4.

The census left these out, and the edits do not touch them:

- generic graph-span, public, proof and constitutional re-entry;
- the saga and retry frontiers;
- the root governor's typed frontier;
- gap triage and gaps in general;
- actor supervision.

Each table gives the place, the text before and the text after. "Deleted" means the requirement stated only a retired thing. "Moved" means the text left the live specification (section 1.4).

### 1.1 Product and Intent

| # | Place | Before | After |
|---|---|---|---|
| I1 | `INTENT.md:174-176` | "native human response/resume, standalone Consensus qualification and mandatory host parity retain the release allocations owned by Product." | Kept. `A5-F08` is a planned 5.1 outcome, so the allocation stays with Product. `a61231c6a` is not re-applied. |
| I2 | `INTENT.md:313-314` | "controller authority in an SDK, CLI, installer, fixture, worker, plugin, Consensus surface, or One Surface projection;" | "controller authority in an SDK, CLI, installer, fixture, worker, or plugin;" |
| I3 | `INTENT.md:317` | "an RLM-specific, Consensus-specific, or recursive-agent-specific runtime;" | Kept: the exclusion constrains the planned `A5-F08`. |
| P1, P2 | `PRODUCT.md:256-259`, `:350-352` | "consensus" as a coordination pattern | Kept: the text names a pattern and claims no shipped code. |
| P3, P4 | `PRODUCT.md:416`, `:442`, `:449` | The 4.6 conservation rows `gap_stop` (consequence route and runtime disposition) | Kept. The row describes "Publish unresolved pressure as a typed gap or block without false completion or automatic retry". The Executive's typed `blocked` stop with gap origin conserves it. The qualification generator requires the literal `gap_stop` in `PRODUCT.md` (`TRAVERSAL_ROSTER`). See ruling 3. |
| P5 | `PRODUCT.md:462` | "advancing the next lawful work under the current program;" | Kept: 4.6 public-control conservation, and a generator roster string. |
| P6 | `PRODUCT.md:1022` | "read state, result, evidence, gaps, and replay" | "read state, result, evidence, and replay". The census marked this keep; the residue check changed it to match the `project.read` relation in PUBLIC-CONTRACTS-008. |
| P7 | `PRODUCT.md:1028-1032` | "…the Result the stop originated from with its failure class where a failure caused it, the last admitted Result of its root, which for an Executive records its unresolved obligations and review standing, and the next lawful action where the record establishes one." | "…the Result the stop originated from with its failure class where a failure caused it or its missing support where a gap caused it, and the last admitted Result of its root, which for an Executive records its unresolved obligations and review standing." |
| P8 | `PRODUCT.md:1051` | "- order One Surface; or" | "- order the Executive's steps; or" |
| P9 | `PRODUCT.md:1061-1073` | "### System And One Surface / The standard system program composes exactly four semantic authorities: `synthesizeModel -> evalGap -> evaluateNext -> evaluateAction` / Intent admission, GraphFunction invocation, evidence admission, and continuation are distinct ABG boundaries between and around those authorities; they are not additional semantic authorities. The public SDK and CLI start or continue the program; they do not implement its loop. In 5.0, a required human response yields a truthful blocked handoff; native response/resume is 5.1." | "### Standard System Program / The standard system program is the default library's Executive, and the default `supervised` root mode selects it. Each step prepares a selection basis, selects one registered graph through one `F_P` selection, applies it as a registered selection and folds the returned evidence before the next step. A step that finds no lawful selection stops the Run as a typed block whose reading reports the gap and its missing support, with a human-readable handoff. Invocation, selection admission, evidence admission and continuation are distinct ABG boundaries around each step; they are not additional semantic authorities. The public SDK and CLI start or continue the program; they do not implement its loop. In 5.0, a required human response yields a truthful blocked handoff; native response/resume is 5.1." |
| P10 | `PRODUCT.md:1075-1086` | "Dedicated Consensus qualification is reserved for 5.1. Existing ordinary GraphFunctions remain reusable; their presence does not claim S05 acceptance. / Consensus is a bounded standard-library GraphFunction expressed through ordinary GTL composition. It demonstrates attributed parallel work, … typed results, and replay. / Consensus has no special runner, scheduler, CLI command, event family, ticket mutation authority, or closure path." | "Consensus, a bounded GraphFunction over ordinary GTL composition, is the planned 5.1 outcome `A5-F08`. 5.0 ships no Consensus GraphFunction." |
| P11 | `PRODUCT.md:1118-1119` | "They are explicitly selected, replaceable compositions." | "They are explicitly selected, replaceable compositions: the Executive is the standard system program, and a start under the default `supervised` root mode selects it by naming its declared start." The supervised start law (`gtl/public_start.ts:85-106`) requires a caller `startRef` equal to the declared start. |
| P12 | `PRODUCT.md:1229` | Consensus row, 5.0 cell: "Ordinary composition, recursion, attribution, admission and replay remain generic runtime obligations. Existing Consensus code and exact evidence are preserved without a dedicated release-complete claim." | "Ordinary composition, recursion, attribution, admission and replay remain generic runtime obligations. 5.0 ships no Consensus GraphFunction." The 5.1 cell is unchanged. |
| P13 | `PRODUCT.md:1286-1287` | "5.0 retains automatic current-intent continuation, newly selected action admission, local recursion, declared local correction and fresh replay." | "5.0 retains same-Run continuation of a replay-derived pending execution, local recursion, declared local correction and fresh replay." |
| P14 | `PRODUCT.md:1367` | "`A5-F07` \| **Complete One Surface loop.** The standard system program orders the four distinct semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction`; ABG separately owns intent admission, invocation, evidence admission, and continuation. Fresh evidence refreshes model, gap, next-action, and action-result truth before the next step." | "`A5-F07` \| **Executive system program.** The standard system program is the default library's Executive. Each step selects one registered graph through one `F_P` selection over a prepared basis, applies it as a registered selection and folds the returned evidence into the next step's basis; ABG separately owns invocation, selection admission, evidence admission, and continuation. No lawful selection yields a typed block and human-readable handoff." |
| P15 | `PRODUCT.md:1171`, `:1377-1384`, `:1396-1397`, `:1621`, `:1752` | `A5-F08` and `ABG5-S05` as planned 5.1 identities; the "standalone Consensus qualification" non-feature | Kept (R4). |
| P16 | `PRODUCT.md:1422-1439` | "### `ABG5-S03`: One Surface, Local Correction And Truthful Blocking / Admit one public invocation and prove that the GTL program orders `synthesizeModel -> evalGap -> evaluateNext -> intent admission -> invoke or continue -> evidence admission -> evaluateAction`. After admitted evidence it must refresh model, gap, lawful next action, and action-result truth. Observe a truthful stop, hold, or gap and inspect the replay-derived frontier. … The SDK, CLI, fixture and worker do not select or order the loop." | "### `ABG5-S03`: Executive Steps, Local Correction And Truthful Blocking / Admit one public invocation of the standard system program and prove that each Executive step prepares a selection basis, selects one registered graph through one `F_P` selection, applies it as a registered selection and folds the admitted evidence into the next step's basis. Observe a truthful stop, hold, or gap and read its stop reading. … The SDK, CLI, fixture and worker do not select or order the Executive's steps." The rest of the paragraph is unchanged. |
| P17 | `PRODUCT.md:1456-1457` | "This dedicated scenario is reserved for 5.1. Preserved code or a cheap smoke result supplies no claim of complete Consensus qualification." | "This dedicated scenario is reserved for 5.1. A cheap smoke result supplies no claim of complete Consensus qualification." The rest of the S05 section is kept as planned 5.1 text (ruling 2). |
| P18 | `PRODUCT.md:1630-1631` | "controller authority in an SDK, CLI, installer, fixture, worker, plugin, Consensus, or One Surface surface;" | "controller authority in an SDK, CLI, installer, fixture, worker, or plugin surface;" |

### 1.2 Product requirements

| # | Place | Before | After |
|---|---|---|---|
| R1 | POLICY-008 `:43` | "`start`, `gaps`, and live run status may report hold" | "`start` and live run status may report hold" |
| R2 | POLICY-013 `:59-67` | "`supervised` is the default. It selects the admitted system program…" | Kept (R1). |
| R3 | POLICY-014 `:69-71` | "an interactive One Surface loop declared by an admitted GTL program, traversed by HoG, and admitted as runtime truth by ABG." | "an interactive loop over the standard system program, an admitted GTL program traversed by HoG and admitted as runtime truth by ABG." |
| R4 | POLICY-016 `:84-89` | "continue by restarting `start`, inspect with `gaps`, remove an ambiguity…" | "continue by restarting `start`, inspect the stop reading, remove an ambiguity…" |
| R5 | POLICY-021 `:140-141` | "status, result, evidence, replay, gap, and lawful-action reads through one typed projection function;" | "status, result, evidence, and replay reads through one typed projection function;" |
| R6 | POLICY-023 `:187-194` | "When `root_mode = direct`, `start` selects one admitted entry traversal without requiring One Surface, `evaluateNext`, or a `ConstructionIntent`. When `root_mode = supervised`, it selects the admitted standard system program and that program owns One Surface semantic ordering and action topology; Product-owned GraphFunctions own the four synthesis and evaluation contracts, and ABG separately admits selected-action and construction-intent truth. Neither the program nor HoG may mint runtime truth, and ABG shall not reorder semantic authorities, select traversal topology, or become a scheduler." | "When `root_mode = direct`, `start` selects one admitted entry traversal. When `root_mode = supervised`, it selects the admitted standard system program, the default library's Executive. Neither the program nor HoG may mint runtime truth, and ABG shall not reorder the program's steps, select traversal topology, or become a scheduler." |
| R7 | POLICY-024 `:199-201` | "…private frame, frontier, continuation, traversal, retry, intent, or action-selection state." | "…private frame, frontier, continuation, traversal, retry, or selection state." |
| R8 | POLICY `:229` | "## Gap, Action, And Human Interaction Operations" | "## Human Interaction Operations" |
| R9 | POLICY-029 `:231-236` | "The gaps variant of `abg.operation.project.read` shall be a read-only replay-derived projection. …" | Deleted (R2). |
| R10 | POLICY-030 `:238-243` | "The lawful-actions variant of `abg.operation.project.read` shall project the current replay-derived `NextActionProjection` …" | Deleted (R2). |
| R11 | POLICY-033 `:258-266` | "…and `project.read` exposes the admitted frontier. … Automatic current-intent continuation and new-action admission remain distinct; neither belongs to an adapter." | "…and `project.read` exposes the admitted status and stop reading. … Automatic continuation of a pending execution does not belong to an adapter." The run status read carries the stop reading (`abg/project_read_ports.ts:1085`). The response paragraph is unchanged. |
| R12 | POLICY-041 `:318-322` | "Every 5.0 catalog, runtime, evidence, replay, gap, and lawful-action variant of `abg.operation.project.read` … shall not change installed, bound, catalog, run, continuation, draft, assessment, intent, selection, or closure truth." | "Every 5.0 catalog, runtime, evidence, and replay variant of `abg.operation.project.read` … shall not change installed, bound, catalog, run, continuation, draft, assessment, selection, or closure truth." |
| R13 | POLICY-042 `:328-329` | "Admission shall not make ingress the owner of One Surface orchestration." | "Admission shall not make ingress the owner of program orchestration." |
| R14 | POLICY-054 `:438-448` | "…traversal grammar. That direct path does not require or synthesize `evaluateNext`, One Surface, or a `ConstructionIntent`. / When the invocation instead realizes an action selected by `evaluateNext` inside the admitted One Surface program, the exact function shall narrow the program-published `ActionCatalog` and bind the admitted selected construction intent. That governed path shall not bypass `evaluateNext`. Both paths shall return the call, run, result or stop, evidence, and replay references…" | "…traversal grammar. It shall return the call, run, result or stop, evidence, and replay references required by the GraphFunction contract, shall not treat the function as the whole program, and shall not invoke any non-GraphFunction catalog kind." The contracts cite 054, so it stays. |
| R15 | POLICY-065 `:549-551` | "…the originating Result of the stop; the last admitted success Result of the Run's root GraphCall by reference, contract and value kind; and the next lawful actions the admitted record establishes." | "…the originating Result of the stop; and the last admitted success Result of the Run's root GraphCall by reference, contract and value kind." |
| R16 | POLICY-068 `:587-591` | "…the last admitted Result of the root GraphCall by kind, reference and contract; and the next lawful action, or that none is admitted." | "…and the last admitted Result of the root GraphCall by kind, reference and contract." |
| R17 | POLICY acceptance `:616` | "- inspect gaps and lawful actions;" | "- read a blocked Run's stop reading, including a gap origin and its missing support;" |
| R18 | PUBLIC-CONTRACTS-006A `:150-158`, `:164-165` | 9 Consensus schema ids and the `review-ruling-kind` and `consensus-round-outcome` vocabulary ids | Deleted from the mandatory list. This is the end state; R5 keeps the published rows' citations live (section 2). |
| R19 | PUBLIC-CONTRACTS-008 `:209` | "closed source/projection relation for catalog, runtime, evidence, replay, gaps, and lawful actions" | "closed source/projection relation for catalog, runtime, evidence, and replay" |
| R20 | PUBLIC-CONTRACTS-008 `:218` | "automatic current-intent continuation or a newly admitted selected action; native human-response-driven resumption is reserved for 5.1" | "same-Run continuation of a replay-derived pending execution; native human-response-driven resumption is reserved for 5.1" |
| R21 | PUBLIC-CONTRACTS-008 `:231-232` | "…excluded from 5.0 qualification; automatic continuation and distinct new-action admission remain required." | "…excluded from 5.0 qualification; automatic pending-execution continuation remains required." Only the clause after the semicolon changes; the `interaction.respond` sentences stand. |
| R22 | PUBLIC-CONTRACTS-011 `:279-281`, `:301-303` | "Consensus capability publication is optional in 5.0 under [Product Release Boundaries]…; an actual published claim still binds its exact function and declared contract." / "`abg.capability.graph-function.consensus@5` retains its stable identity for an optional published Consensus claim and the dedicated 5.1 qualification. Its absence is not a 5.0 mandatory-capability gap." | Both deleted. This is the end state; P7 removes the capability. |
| R23 | QUAL `:19-20` | "Standalone Consensus, mandatory host parity, … are 5.1 qualification claims." | Kept (R4). |
| R24 | QUAL-059 `:286-298` | "…complete the primary public operator loop through one admitted GTL One Surface program traversed directly by HoG. That program shall own the order of the four semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction`. Intent admission, invocation or continuation, and evidence admission shall remain distinct ABG boundaries around those authorities; public ingress shall admit and transport the invocation only. The loop shall start, expose replay-derived frontier and lawful actions, exercise bounded correction and automatic progression under established authority, refresh model, gap and next-action truth after admitted evidence, and converge without a second controller or private import." | "…complete the primary public operator loop through the standard system program, the default library's Executive, traversed directly by HoG. Each Executive step shall prepare a selection basis, select one registered graph through one `F_P` selection, apply it as a registered selection and fold the admitted evidence into the next step's basis. Invocation, selection admission, evidence admission and continuation shall remain distinct ABG boundaries around each step; public ingress shall admit and transport the invocation only. The loop shall start, expose a typed stop reading, exercise bounded correction and automatic progression under established authority, and converge without a second controller or private import." The no-lawful-next-step and native response/resume sentences are unchanged. No evidence is claimed. |
| R25 | QUAL-061 `:314-323` | "Dedicated Consensus qualification is reserved for 5.1. It satisfies `REQ-P-CONSENSUS` by invoking …" | Moved (R4). |
| R26 | QUAL-064 `:357` | "One Surface; whole-subject F11;" | "the Executive system program; whole-subject F11;" |
| R27 | SCENARIOS Purpose `:13` | "Define the seven end-to-end scenarios…" | "Define the end-to-end scenarios…". SCENARIOS-012 leaves, so the file decomposes six identities. |
| R28 | SCENARIOS `:19-20` | "Standalone Consensus qualification, … are reserved for 5.1." | Kept (R4). |
| R29 | SCENARIOS-010 `:121-150` | "### `ABG5-S03` - One Surface, Local Correction And Truthful Blocking / `ABG5-S03` shall prove one admitted GTL program orders the four distinct semantic authorities: `synthesizeModel -> evalGap -> evaluateNext -> evaluateAction` / Intent admission, GraphFunction invocation, evidence admission, and continuation remain separate ABG boundaries around those authorities. After admitted evidence, the path shall refresh model, gap, lawful next action, and action-result truth. The scenario observes a truthful stop, hold or gap and the replay-derived frontier. … When the truthful stop is an admitted `gap_stop`, the scenario may instead lawfully re-enter that exact stopped Run into one successor Run under an admitted single-use re-entry basis. Re-entry shall preserve the exact selected ProductSet, resolved dependency lock, WorkspaceBinding, Program, and public start identity; it is not a Product reprice. … shall not select or order the loop." | "### `ABG5-S03` - Executive Steps, Local Correction And Truthful Blocking / `ABG5-S03` shall prove that each step of the standard system program, the default library's Executive, prepares a selection basis, selects one registered graph through one `F_P` selection, applies it as a registered selection and folds the admitted evidence into the next step's basis. Invocation, selection admission, evidence admission, and continuation remain separate ABG boundaries around each step. The scenario observes a truthful stop, hold or gap and its stop reading. … shall not select or order the Executive's steps." The two re-entry sentences are deleted (R2). The correction, blocking, consequence-route and control sentences are unchanged. |
| R30 | SCENARIOS-012 `:166-177` | "### `ABG5-S05` - Consensus Free Construction / `ABG5-S05` is reserved for 5.1 and is not a 5.0 gate. Its selected installed candidate invokes the SYSTEM-owned Consensus GraphFunction…" | Moved (R4), with its heading. |
| R31 | SCENARIOS-016 `:258` | "`ABG5-S04`, `ABG5-S05`, … is successor or derived evidence" | Kept, because the S05 identity stays. |
| R32 | CATALOG-009A `:93-98` | "…capabilities. The canonical Consensus function is such a row. Downstream products may bind declared reviewer profiles, subject contracts, policies, and overlays to that function, but shall not republish or shadow its canonical handle, graph body, outer contracts, or SYSTEM ownership." | "…capabilities. Downstream products may bind declared subject contracts, policies, and overlays to such a function, but shall not republish or shadow its canonical handle, graph body, outer contracts, or SYSTEM ownership." This is the wording of `f4aad7d5e`. |
| R33 | CATALOG-026 `:188` | "Catalog list, describe, lawful-action, invocation, and replay projections" | "Catalog list, describe, invocation, and replay projections" |
| R34 | `requirements/product/README.md:13` | "- the SYSTEM-owned agent-invocable Consensus GraphFunction" | "- Consensus schema and vocabulary contract rows" |
| R35 | `requirements/product/README.md:29` | "- `REQ-P-CONSENSUS.md`" | Kept: the file stays live under R5. |
| R36 | `requirements/README.md:52-53` | "`A5-F08`/`ABG5-S05` and `A5-F12`/`ABG5-S04` are planned ABIogenesis 5.1 identities. Their frozen design and requirement text are preserved as future input." | "`A5-F08`/`ABG5-S05` and `A5-F12`/`ABG5-S04` are planned ABIogenesis 5.1 identities. The frozen design and requirement text of `A5-F12`/`ABG5-S04` are preserved as future input." |
| R37 | `requirements/README.md:64-68` | "- dedicated `REQ-P-CONSENSUS` qualification, `REQ-P-SCENARIOS-012`, `REQ-P-QUAL-061` and `REQ-P-QUAL-066`, host parity in `REQ-P-SCENARIOS-013`/`REQ-P-QUAL-063`, and their former mandatory Consensus/host portions in `REQ-P-QUAL-064/067`; / - mandatory Consensus capability publication in `REQ-P-PUBLIC-CONTRACTS-011`;" | "- `REQ-P-QUAL-066`, host parity in `REQ-P-SCENARIOS-013`/`REQ-P-QUAL-063`, and their former mandatory host portions in `REQ-P-QUAL-064/067`;". This is the wording of `f4aad7d5e`. |
| R38 | `requirements/README.md:77` | "`REQ-R-ABG3-FPC-018`, `REQ-R-ABG3-FPC-019`," | Deleted: the family moves. |
| R39 | `requirements/README.md:86-87` | "Runtime liveness observation, ordinary replay/projection, One Surface evaluation, yielded handoff, …" | "Runtime liveness observation, ordinary replay/projection, yielded handoff, …" |
| R40 | `requirements/README.md:96-97` | "…deferred; automatic current-intent continuation and new-action admission remain 5.0 obligations." | "…deferred; same-Run continuation of a replay-derived pending execution remains a 5.0 obligation." |
| R41 | `requirements/README.md:99-101` | "…POLICY-014/016/021/033, CONTINUATION-011, …" | Kept: each cited requirement stays and is restated. |
| R42 | `scenarios/README.md:12-14` | "ABIogenesis 5.0 selects `ABG5-S01`, `ABG5-S02`, `ABG5-S03`, `ABG5-S05`, `ABG5-S06`, and release scenario `ABG5-S07`; `ABG5-S04` is reserved for planned 5.1 work." | "ABIogenesis 5.0 selects `ABG5-S01`, `ABG5-S02`, `ABG5-S03`, `ABG5-S06`, and release scenario `ABG5-S07`; `ABG5-S04` and `ABG5-S05` are reserved for planned 5.1 work." |

### 1.3 ABG, GTL and mapping requirements

| # | Place | Before | After |
|---|---|---|---|
| A1 | BINDING-004 `:25` | "…the admitted-program identity, exact selected action or current-intent basis, GraphFunction identity…" | "…the admitted-program identity, GraphFunction identity…" |
| A2 | BINDING-017 `:51` | "A newer observation may stale dependent model, gap, or next-action projections; it shall not mutate the workspace binding or constitute `basis_fork_detected`." | "A newer observation shall not mutate the workspace binding or constitute `basis_fork_detected`." |
| A3 | CONTINUATION Purpose `:13-15` | "Define `Continuation` as run-local runtime obligation truth derived from prior events, preserving the distinction between continuation of the current admitted intent and admission of a newly selected action." | "Define `Continuation` as run-local runtime obligation truth derived from prior events." |
| A4 | CONTINUATION preamble `:22-27` | "Only the native F_H response/resume portion of CONTINUATION-011 is deferred; automatic current-intent continuation, newly selected actions, local correction and CONTINUATION-009 runtime liveness remain 5.0." | "Only the native F_H response/resume portion of CONTINUATION-011 is deferred; same-Run continuation of a replay-derived pending execution, local correction and CONTINUATION-009 runtime liveness remain 5.0." |
| A5 | CONTINUATION-011 `:53` | "An admitted F_H response, post-yield input, or other lawful input for the current construction intent shall continue only that intent through `continueExecution` over the exact replay-derived continuation and execution basis. The response shall not create a next-action basis, select another GraphFunction, or admit a new construction intent." | "An admitted F_H response, post-yield input, or other lawful input for a pending execution shall continue only that execution over the exact replay-derived continuation and execution basis. It shall not select another GraphFunction or open new work." `continueExecution` does not exist in the code. |
| A6 | CONTINUATION-012 `:55` | "When fresh post-disposition truth selects a new action, the path shall be `evaluateNext -> admitConstructionIntent -> invokeGraphFunction`. …" | Deleted. |
| A7 | CONTINUATION-013 `:57` | "A newer `ObservationSnapshot` … may stale prior model, gap, target-binding, priority, or next-action projections and shall rerun the affected `synthesizeModel`, `evalGap`, and `evaluateNext` functions. Observation freshness alone shall not create a basis fork or require a new workspace binding." | Deleted. Its last sentence is held by BINDING-017. |
| A8 | EVENTS-021 `:56` | "The existing construction event family shall preserve the admitted One Surface authority boundaries without inventing another event roster. …" | Deleted (R7): it states One Surface event obligations only. |
| A9 | EVENTS-030 `:85` | "One Surface events shall preserve stable workspace authority separately from mutable observation. …" | Deleted. BINDING-016/017 and CONTINUATION-014 hold the binding law. |
| A10 | EVENTS-031 `:87` | "…as the owner of model synthesis, gap evaluation, next-action evaluation, action evaluation, program ordering, retry, continuation, or closure…" | "…as the owner of selection, evaluation, program ordering, retry, continuation, or closure…" |
| A11 | EVENTS census `:111` | "- construction: `construction_episode_started`, `construction_intent_selected`, `construction_delta_observed`" | "- construction: `construction_intent_selected`, `construction_delta_observed`, `construction_continuation_opened`". R7 applies: `construction_episode_started` is not a declared kind. The three listed kinds are declared at `abg/event_store.ts:99`, `:100` and `:117`, and they stay until TD-66's successor profile. |
| A12 | FN-COMP-022 `:102-107` | "…reprice, yielded continuation, block, gap stop, non-admit, or terminal projection." | "…reprice, yielded continuation, block, non-admit, or terminal projection." |
| A13 | FN-COMP-023 `:109` | "ABG shall conserve admitted-program identity, selected action or current-intent identity, immutable workspace-binding identity…" | "ABG shall conserve admitted-program identity, immutable workspace-binding identity…". "intent-lineage" and "admitted intent refs" are kept: they are the general traversal-unit lineage of COMPUTE-NOTATION-027/028, PAYLOAD-025 and CONTRACT-LAW-API. |
| A14 | FN-COMP-024 `:111` | "When a newly selected action requires traversal, product, or artifact materialization, ABG shall admit or validate one sufficient `ConstructionIntent` …" | Deleted. |
| A15 | FN-COMP-026 `:121-126` | "The GTL `C` algebra may compose the One Surface functions, but neither composition nor an executor or runtime helper may merge, substitute, or transfer authority among `synthesizeModel`, … Public ingress may ignite the admitted composition but shall not own its order, retry, recursion, selection, or closure." | Deleted. POLICY-042, EVENTS-031 and INTERPRET-011 hold the ingress sentence. |
| A16 | FN-COMP-027 `:128` | "A published inner refinement shall recurse through the same declared One Surface composition and preserve program, …" | "A published inner refinement shall preserve program, …" |
| A17 | INTERPRET-011 `:62-65` | "It shall not order One Surface, choose private traversal state, …" | "It shall not order the program's steps, choose private traversal state, …" |
| A18 | INTERPRET-030 `:147-151` | "The admitted GTL program shall own the One Surface order and every published recursive refinement. HoG shall traverse that order. ABG shall preserve the four semantic authorities and distinct intent, invocation, evidence, action-result, and continuation admission boundaries." | "The admitted GTL program shall own its step order and every published recursive refinement. HoG shall traverse that order. ABG shall preserve distinct selection, invocation, evidence, and continuation admission boundaries." The last sentence is unchanged. |
| A19 | PROJECTION-011 `:38` | "…shall render the same admitted continuation disposition and `NextActionProjection`. A carrier may record process facts and `evaluateNext` may emit a candidate selection projection, but only ABG admission may make selection or continuation runtime truth; a projector shall decide neither. There shall be one authoritative admitted action truth…" | "…shall render the same admitted continuation disposition. A carrier may record process facts, but only ABG admission may make selection or continuation runtime truth; a projector shall decide neither. There shall be one authoritative admitted selection truth…" |
| A20 | PROJECTION-014 `:44` | "…drift observations to `evalGap` and `evaluateNext`, but…" | "…drift observations as evaluation input, but…" |
| A21 | PROJECTION-021 `:62` | "This projection is an observation input to `evalGap` and the executive evaluator;" | "This projection is an observation input to the executive evaluator;" |
| A22 | PROJECTION-022 `:66` | "ABG shall project admitted `ProductAssetModel`, `ObservationSnapshot`, `GapPressureRow`, … `NextActionProjection` truth …" | Deleted. |
| A23 | PROJECTION-023 `:68` | "In ABIogenesis 5.0 it may render catalog list/describe, status, result, evidence, replay, gaps, and lawful actions only from their owning admitted truth. It shall not evaluate gaps, determine action eligibility, rank or select actions, admit intent or evidence, invoke or continue work, append events, or decide closure." | "In ABIogenesis 5.0 it may render catalog list/describe, status, result, evidence, and replay only from their owning admitted truth. It shall not evaluate or select work, admit evidence, invoke or continue work, append events, or decide closure." |
| A24 | PROJECTION-024 `:70` | "A newer `ObservationSnapshot` … may invalidate and recompute dependent model, gap, target-binding, priority, and next-action projections. …" | Deleted. BINDING-017 holds its second sentence. |
| A25, A26, A29 | SAGA-FRONTIER `:7`, SUPERVISOR-WITNESS `:6`, TUNER `:6` | "Derives from" link to `REQ-R-ABG3-FP-CONSCIOUSNESS.md` | Link removed. |
| A27 | WITNESS-001 `:22` | "for any halted or gap-stopped run:" | "for any halted run:" |
| A28 | WITNESS-015 `:50` | "(which remains declared module truth per FPC-004 — never harness-local configuration)" | "(which remains declared module truth — never harness-local configuration)" |
| A30 | TUNER-010 `:54` | "narrative labels carry no authority (FPC-021)." | "narrative labels carry no authority." |
| A31 | `requirements/abg/README.md:60` | "- `REQ-R-ABG3-FP-CONSCIOUSNESS.md`" | Deleted. |
| G1 | HOOKS-012 `:41`, HOOKS-013 `:43` | "A published GTL surface may declare `abg.fp_consciousness` hook/config truth for generic `F_P` construction evaluation. …"; "`abg.fp_consciousness` hook precedence shall be declared and replayable. The default precedence for a selected construction action is …" | Both deleted. No code declares the key. |
| G2 | HOOKS-019 `:61-62` | "Executive-observer tuning shall reuse existing `abg.fp_consciousness`, `abg.fn_composition`, `evaluate.C`, …" | "Executive-observer tuning shall reuse existing `abg.fn_composition`, `evaluate.C`, …" |
| M1 | `requirements/mapping/` | No census hit. | No change. |

### 1.4 Moved files

| # | Place | Before | After |
|---|---|---|---|
| X1 | `requirements/product/REQ-P-CONSENSUS.md` | 274 lines: "Agent-Invocable Consensus GraphFunction", requirements 001 to 019 with lettered members | 41 lines, "Consensus Contract Rows". The file keeps a header, a Purpose ("Consensus is the planned 5.1 outcome `A5-F08`; 5.0 ships no Consensus GraphFunction. This family states what each Consensus schema and vocabulary row of the public contract catalog carries while the catalog publishes it."), and the three requirements R5 keeps (section 2). Every other requirement moves. |
| X2 | `requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md` | 101 lines, FPC-001 to FPC-021 | Removed whole. |

**Where moved text goes.** Moved text leaves the tree, and git history is the record: the text is retrievable verbatim at `fe01e37d8`. This is what `f4aad7d5e` did with `REQ-P-CONSENSUS.md`, and what `8ff8b6113` did with the GTL2/ABG2 families. Neither commit added a file. `specification/` has no history location; only the tenant design trees have `design/history/`. The qualification generator stages every `.md` file under `specification/requirements/` as live authority, so a history copy placed there would stay live.

## 2. Requirement identifiers

**Deleted** (each stated only a retired thing), 12 in all:

- `REQ-P-POLICY-029`, `-030`;
- `REQ-R-ABG3-CONTINUATION-012`, `-013`;
- `REQ-R-ABG3-EVENTS-021`, `-030`;
- `REQ-R-ABG3-FN-COMP-024`, `-026`;
- `REQ-R-ABG3-PROJECTION-022`, `-024`;
- `REQ-L-GTL3-HOOKS-012`, `-013`.

**Moved out of the live specification** (R4), 59 in all:

- `REQ-P-QUAL-061`;
- `REQ-P-SCENARIOS-012`;
- 20 Consensus requirements: `REQ-P-CONSENSUS-001`, `-002`, `-003`, `-005`, `-006`, `-006A`, `-008A`, `-009`, `-010`, `-011`, `-011A`, `-012`, `-013`, `-014`, `-015`, `-015A`, `-016`, `-017`, `-018`, `-019`;
- the 37 FPC requirements: `REQ-R-ABG3-FPC-001`, `-002`, `-002A`, `-003`, `-004`, `-004A` to `-004E`, `-005`, `-005A` to `-005E`, `-006` to `-011`, `-011A` to `-011E`, and `-012` to `-021`.

**Kept under R5.** Each is reduced to a present-tense sentence that states only what the published contract needs. All three are listed for removal by the last package.

| Identifier | Cited by (`scripts/generate-product-manifest.mjs`) | Text now | Leaves |
|---|---|---|---|
| `REQ-P-CONSENSUS-004` | the 13 rows of `CONSENSUS_SCHEMA_ASSET_BINDINGS` (`:509`) and `abg.vocabulary.consensus-fh-decision` (`:538`), 14 rows | Each of the 13 Consensus schema rows, named, "shall locate its definition in one canonical Consensus schema document". The `consensus-fh-decision` row "shall publish the closed roster `accept_with_dissent \| reject`". | P7, which unpublishes the 13 schema rows. Its vocabulary sentence can leave in P2. |
| `REQ-P-CONSENSUS-007` | `abg.vocabulary.review-ruling-kind` (`:526`) | The row "shall publish the closed roster `decision_row \| draft_ticket \| split_ticket \| deferment \| rejected_finding`". | P2, which deletes the vocabulary. |
| `REQ-P-CONSENSUS-008` | `abg.vocabulary.consensus-round-outcome` (`:532`) | The row "shall publish the closed roster `closed_done \| recurse_next_round \| escalate_fh`". | P2. |

The rosters match `contracts/vocabularies/*.json`. When P7 runs, `REQ-P-CONSENSUS.md` leaves with `-004`, together with its two entries in `requirements/product/README.md` (`:13`, `:29`).

No other generated contract and no generator cites a deleted or moved identifier. The rule catalog does, and it is regenerated (section 3).

**Kept and restated:**

- POLICY-008, -014, -016, -021, -023, -024, -033, -041, -042, -054, -065, -068;
- PUBLIC-CONTRACTS-006A, -008, -011;
- QUAL-059, -064;
- SCENARIOS-010;
- CATALOG-009A, -026;
- BINDING-004, -017;
- CONTINUATION-011;
- EVENTS-031;
- FN-COMP-022, -023, -027;
- INTERPRET-011, -030;
- PROJECTION-011, -014, -021, -023;
- WITNESS-001, -015;
- TUNER-010;
- HOOKS-019.

**Census line under R7.** The EVENTS construction family line is set to the three declared kinds (A11).

## 3. Scratch restage and build

- **Base:** `/private/tmp/abg-td26p0-work/base`, the worktree with `specification/` at `fe01e37d8`.
- **Scratch:** `/private/tmp/abg-td26p0-work/scratch`, the worktree with `specification/` at `0993c5930`, which is the final tree.
- Neither copy is committed.

**Method.** The staging command imports `build/code/src/validator/qualification_contracts.js`, so a compiled tree must exist first. On the scratch copy the steps were:

1. `node scripts/clean.mjs && npx tsc -p tsconfig.json`;
2. `node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../.. "/Users/jim/Library/Application Support/STDO/releases/v3.0.4"`;
3. `npm run build`.

On the base, `npm run build` alone reproduces the committed generated files byte for byte.

**Refusals: none.**

- Staging exits 0. Its generation summary: sources 94, rules 2035, coverage claims 16, behavioral coverage 65, absent product mechanisms claimed 0.
- The build exits 0.
- Every `TRAVERSAL_ROSTER` string (39 in all, including `gap_stop`, `graph_span_reentry`, `public_start_reentry`, `re_enter`, "advancing the next lawful work" and "direct or supervised root control") is still present in `PRODUCT.md`.
- 16 public contract rows cite `REQ-P-CONSENSUS`: `-004` 14 times, `-007` once and `-008` once. Each cites a kept identifier, so R5 holds.

**Mirrors.**

- **Changed (21):**
  - INTENT and PRODUCT;
  - `REQ-L-GTL3-HOOKS`;
  - `REQ-P-CATALOG`, `-CONSENSUS`, `-POLICY`, `-PUBLIC-CONTRACTS`, `-QUAL`, `-SCENARIOS`;
  - `REQ-R-ABG3-BINDING`, `-CONTINUATION`, `-EVENTS`, `-FN-COMPOSITION`, `-INTERPRET`, `-PROJECTION`, `-SAGA-FRONTIER`, `-SUPERVISOR-WITNESS`, `-TUNER`;
  - the three README mirrors (`specification__requirements__README.md`, `…__abg__README.md`, `…__product__README.md`).
- **Orphaned (1):** `contracts/qualification/sources/REQ-R-ABG3-FP-CONSCIOUSNESS.md`. Staging does not delete old mirrors, so 95 files stay on disk while `authority-inputs.json` lists 94 sources. The commit that restages must `git rm` it.
- **Not staged:** `scenarios/README.md`, because it is outside `requirements/`.

**Other generated files that change:**

- `contracts/qualification/authority-inputs.json`, `rule-catalog.json`, `law-basis.json` and `coverage.json`;
- `contracts/capabilities/capability-definition-graph.json`, through its owner coordinates;
- `product-toolchain-manifest.json`.

The public contract catalog keeps 75 rows. One row changes: `abg.asset.qualification.rule-catalog`.

**Rule catalog: 2115 rows before, 2035 after.** 85 rows leave and 5 are added. The 5 added rows are the renamed headings.

| Rows that leave | Count |
|---|---|
| `REQ-R-ABG3-FP-CONSCIOUSNESS.md`: FPC-001 to -021 with lettered members (37), plus Purpose, Acceptance Criteria and the title | 40 |
| `REQ-P-CONSENSUS.md`: the 20 moved requirements, plus the title and the sections "Identity And Ownership", "Workspace And Public Invocation", "Constructive And Runtime Law", "Qualification" and "Bounded Scope" | 26 |
| POLICY-029, -030 and the heading "Gap, Action, And Human Interaction Operations" | 3 |
| SCENARIOS-012 and the S03 and S05 headings | 3 |
| PRODUCT headings "System And One Surface" and the old S03 heading | 2 |
| QUAL-061 | 1 |
| CONTINUATION-012, -013 | 2 |
| EVENTS-021, -030 | 2 |
| FN-COMP-024, -026 | 2 |
| PROJECTION-022, -024 | 2 |
| HOOKS-012, -013 | 2 |

The added rows are:

- PRODUCT "Standard System Program";
- the PRODUCT and SCENARIOS S03 headings "Executive Steps, Local Correction And Truthful Blocking";
- POLICY "Human Interaction Operations";
- the `REQ-P-CONSENSUS` title "Consensus Contract Rows".

**Identity digests (base → scratch):**

| Identity | Base | Scratch |
|---|---|---|
| `productContentDigest` | `sha256:251aea83d4408bd5e30a03df6141f9fb2a889eb1236d4f29e3b61b44f3fa9dde` | `sha256:7a5e388ebaeff1ec2705986d6c3d435807f260106774e313700cfedcb517b847` |
| `contributionManifestDigest` | `sha256:ff17fc8566b0eed13c095a879059c6edd9d2ee24e2df50e7c0afa4123f9236fc` | `sha256:02abc141e121bbcbd36ab72e2f4a38fa269de8a8ba892b2dde49ad9539e65706` |
| public contract `catalogDigest` | `sha256:533f14b12614d83b8c939d167439abbf24f1753931682397c1785b45f22ad705` | `sha256:1fcc3ab2dce3412a100266b7745cc2d0755f970505623bff349cfaef75f0eadb` |
| capability `graphDigest` | `sha256:0216dab461c004d1c656614e9308c8a1c9502b153f2cb3d200127471c56bd5bd` | `sha256:d5b1787830e37fd502e5c215374218279a36a32da40e47e1de820a80d3f662d1` |
| rule-catalog `contractDigest` | `sha256:cccba24d81a830df181c6391497bbe1d97043b34fd5b64457b1fd510ee0c6674` | `sha256:36ea74e6f0b4d1e7911540d8d003d2b0b636c79d75256c4b682aa4e7bc6d90b3` |
| `lawBasisRef` | `qualification-law://abiogenesis/9165390823d7c4bc4290b9e378cc9f4abdd71ccd1dc96fc1c849f468035bacf1` | `qualification-law://abiogenesis/33e0b289849591e3bb5c09a27f1c3a8c84989b559213ab8a42965d798f448526` |

**Lanes.** Each lane was run one file at a time with the brief's command.

| Lane | Base | Scratch |
|---|---|---|
| `t287-qualification-law` | 10 tests: 7 pass, 0 fail, 3 skipped (the three staging-fixture cases; their environment variables are unset) | the same; per-test results identical |
| `t287-qualification-scopes` | 24 tests: 24 pass | the same; per-test results identical |

**Qualification inventory.** These three files carry every mirror's path and digest, including `REQ-P-CONSENSUS.md` and the orphaned FP-CONSCIOUSNESS mirror:

- `test_env/qualification/inventory.json`;
- `recipe/verification-recipe.json` (`:1390`, `:1450`);
- `recipe/expected-output-inventory.json` (`:906`, `:921`).

No lane in `test_env/tests` reads them. They go stale with any restage and are refreshed when the subject is next qualified.

## 4. Residue search

**Command.** From `specification/`, with case-insensitive extended `grep -rn` over `*.md`, excluding `GOALS.md`. The terms are:

- Consensus; One Surface;
- `synthesizeModel`, `evalGap`, `evaluateNext`, `evaluateAction`, and the prose forms model synthesis, gap evaluation, next-action and action evaluation;
- construction intent, delta, composition, episode and continuation, in prose, `_` and `-` forms; `ConstructionIntent`;
- selected action, new action and newly selected;
- gap stop, `gap_stop` and gap-stopped; re-entry basis;
- lawful action(s), lawful-action(s) and next lawful action;
- `run_gaps`, `workspace_gaps`, `run_lawful_actions`, `ticket_consensus` and `ticket.consensus`;
- frontier; `NextActionProjection`, `ActionCatalog`, `ProductAssetModel`, `GapPressureRow`;
- `fp_consciousness`, `FP-CONSCIOUSNESS`, `FPC-`;
- current intent; gaps.

**Result.** 80 matching lines remain. None names a One Surface authority, the frontier reads, `ticket_consensus`, selected-action or current-intent admission, gap re-entry, `ConstructionIntent` or an FPC requirement.

| Hits | Where | Why it stays |
|---|---|---|
| 18 | `REQ-P-CONSENSUS.md` | R5: the live contract-row family (section 2) |
| 2 | `requirements/product/README.md:13`, `:29` | the scope line and family entry for that family |
| 13 | PRODUCT `:1075`, `:1077`, `:1078`, `:1223`, `:1371`, `:1448`, `:1451`, `:1453`, `:1615`; INTENT `:175`, `:316`; QUAL `:19`; SCENARIOS `:19` | Consensus as the planned 5.1 outcome `A5-F08` and the S05 identity (R4) |
| 2 | PRODUCT `:258`, `:350` | "consensus" as a coordination pattern |
| 2 | PRODUCT `:416`, `:442` | the 4.6 `gap_stop` conservation rows; the generator roster requires the literal (ruling 3) |
| 1 | EVENTS `:107` | the census line of declared construction kinds (R7) |
| 1 | POLICY-016 `:86` | "decide the next lawful action": the operator's own choice among continue, inspect the stop reading, remove an ambiguity, satisfy a capability and supply a decision; it is not the lawful-actions read |
| 19 | SAGA-FRONTIER (16 lines); INSTRUCTION-ASSEMBLY `:7` and `abg/README.md:17`, `:47` | the saga frontier and links to its file |
| 8 | POLICY-024 `:196-197` ("resolve the lawful frontier": continuation's own frontier), POLICY `:503`, HANDLERS `:105-107`, PROJECTION-009, WITNESS-001 ("implicated frontier"), `scenarios/README.md:37` | runtime, retry, halt and root-governor frontiers |
| 12 | PRODUCT `:1181`, PUBLIC-CONTRACTS `:296`, QUAL `:171`, M-PROVENANCE-001, PAYLOAD-016, INSTRUCTION-ASSEMBLY-016, REQUIREMENTS-ALGEBRA-032, LANGUAGE-CAPABILITY-MODEL `:333-335`, C-ALGEBRA `:16`, `scenarios/09`:94 | "gaps" in the general sense: attribution, conformance, capability, adapter, prerequisite, route, terminology and validation gaps |
| 1 | WITNESS-011 | the observe-report "gaps" of the planned 5.1 observer |
| 1 | REQUIREMENTS-ALGEBRA-038 | "shall not be … a next-action controller", a prohibition |

`grep -rw intent` also finds "intent-lineage" (FN-COMP-023, PAYLOAD-025, COMPUTE-NOTATION-027/028, CONTRACT-LAW-API). This is general traversal-unit lineage, not construction intent.

## 5. What each later package must make true

- **P0b (design notes).**
  - Move `design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` to `design/history/`.
  - Cut or restate the passages that cite moved or deleted identifiers, in `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` and `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`.
  - Change the "A5-F07 One Surface" row of `ABI5_STDO3_COMPUTATIONAL_BINDING.md:462`, so that no live design note states One Surface as current law beside the restated `A5-F07`.
- **P1 (Consensus doors).** `project.read#ticket_consensus` refuses `installed_binding_unavailable`. With that, PUBLIC-CONTRACTS-008's `project.read` relation (catalog, runtime, evidence, replay) holds for every callable member.
- **P2 (Consensus and One Surface module).**
  - "5.0 ships no Consensus GraphFunction" (PRODUCT `:1077-1078`, `:1223`; `REQ-P-CONSENSUS` Purpose) becomes true of the code.
  - The three Consensus vocabularies leave, so `REQ-P-CONSENSUS-007`, `-008` and `-004`'s vocabulary sentence lose their citing rows and can be removed then.
- **P3 (continuation write side).**
  - `run.continue#selected_action` is unavailable.
  - `current_intent` accepts only a replay-derived pending execution.
  - Together these make PUBLIC-CONTRACTS-008's `run.continue` row, CONTINUATION-011 and PRODUCT `:1286-1287` hold.
- **P4 (route owner and HoG).**
  - No gap-stop route is proposed or admitted.
  - No selected-action or construction-intent basis is written.
  - FN-COMP-022/023 and BINDING-004 then hold for new Runs.
- **P5 (readers and gap family).**
  - The stop reading drops `nextActions` (`abg/project_read_ports.ts:1358`), as POLICY-065/068 and PRODUCT `:1028-1032` state.
  - `run_gaps`, `workspace_gaps` and `run_lawful_actions` refuse `installed_binding_unavailable`.
  - Gap re-entry (`InvocationReentryBasis`) and `PublicGapAuthority` leave.
  - The Executive's gap stays a `blocked` stop whose reading reports origin `gap` and its missing support (`t287-readable-stops:216-222`).
- **P6 (language).** `GTL_PROGRAM_SCHEMA` refuses `actionCatalog` and `constructionComposition`, so no admitted Program carries a One Surface order (INTERPRET-030, PRODUCT "Standard System Program").
- **P7 (register, after TD-77).**
  - Withdraw the five members.
  - Remove `abg.capability.graph-function.consensus@5`, so that the code's mandatory capabilities equal PUBLIC-CONTRACTS-011's 15.
  - Unpublish the 13 Consensus schema rows, so that the published mandatory rows equal PUBLIC-CONTRACTS-006A.
  - Then remove `REQ-P-CONSENSUS.md` with `-004`, and its two README entries.
- **Unowned (ruling 1).**
  - The Executive's Program takes the `supervised` policy (`gtl/default_library.ts:318`), and a default start that names its declared start selects it. PRODUCT `:1061ff`, `:1118-1119`, `A5-F07`, POLICY-023 and QUAL-059 state this.
  - The lanes that start the Executive with `direct` and target `next` change: `t287-default-library.test.mjs:436`, `:458`, `:1436` and `:2606`; `support/registered-graph-selection.mjs:236` and `:263`; the O1 Q5 cascade.
- **Mirror commit (Executive).** Restage, `git rm contracts/qualification/sources/REQ-R-ABG3-FP-CONSCIOUSNESS.md`, regenerate the product identity, and refresh the qualification inventory when the subject is qualified.

## 6. Deviations

1. **Moved text leaves the tree.** It is retrievable at `fe01e37d8`, as with `f4aad7d5e`. There is no history copy inside `specification/` (section 1.4).
2. **No mirrors are committed.** The plan's P0 asks for the qualification mirrors to be regenerated in their own commit; the brief forbids generated files. The restage is reported, not committed.
3. **`GOALS.md` is untouched.** The plan's P0 lists it; the brief reserves it for the Executive.
4. **`REQ-P-CONSENSUS.md` stays, with `-004`, `-007` and `-008`.** R5 governs here, not the plan's whole-file move or `f4aad7d5e`.
5. **`REQ-P-CONSENSUS-004` changes in two ways.**
   - It names 13 schema rows, matching the 13 rows that cite it (`gtl/consensus_schema.ts` `CONSENSUS_SCHEMA_ASSET_BINDINGS`). The old text listed 12 and omitted `abg.schema.consensus-ruling-overlay`.
   - The sentence about native and serialized forms is dropped, because the native types leave in P2 while the schema rows stay.
6. **S05 stays in PRODUCT.**
   - The heading and the planned 5.1 text stay, with only the "Preserved code" sentence restated. `A5-F08` keeps its identity, and S05 pairs with it.
   - SCENARIOS-012 moves, `scenarios/README.md` lists S05 as reserved, and the SCENARIOS Purpose drops "seven".
   - `f4aad7d5e` removed S05 entirely. See ruling 2.
7. **FPC-020 and FPC-021 move with their family, although they are general laws.**
   - FPC-021's rule, that narrative labels carry no authority, remains stated in TUNER-010 itself.
   - FPC-004 was cited only as the source of "declared module truth" in WITNESS-015.
8. **Four deleted requirements also carried a general sentence that other requirements hold:**
   - EVENTS-030, CONTINUATION-013 and PROJECTION-024: BINDING-016/017 and CONTINUATION-014;
   - FN-COMP-026: POLICY-042, EVENTS-031 and INTERPRET-011.
9. **PRODUCT `:1022` changed**, although the census marked it keep (section 1.1, P6).
10. **TD-25's members.** Only the R3 clause after the semicolon changed, in PUBLIC-CONTRACTS-008 (R21) and in `requirements/README.md:96-97` (R40). Every sentence about the five `interaction.respond` members is unchanged.
11. **R1 wording.** The text says the default `supervised` root mode selects the Executive "by naming its declared start". That is what the supervised start law requires (`gtl/public_start.ts:85-106`) once the Program declares `supervised`.

## 7. Needs a ruling

1. **Which package changes the Executive's Program to `supervised`.**
   - R1 is written into the text, and the brief places its realization in a later code package. No package from P1 to P7 names the change.
   - At head the Program is `direct` (`gtl/default_library.ts:318`). After P2, a start under the default root mode starts nothing shipped (plan, open point 1).
   - Until a package owns this, PRODUCT's "the default `supervised` root mode selects it" holds in the text only. The lanes to change are listed in section 5.
2. **`ABG5-S05` in PRODUCT.** It is kept as a planned 5.1 scenario beside `A5-F08`. The alternative is removing the PRODUCT S05 section, as `f4aad7d5e` did, and leaving only the identity reserved.
3. **The `gap_stop` conservation rows.**
   - PRODUCT keeps the 4.6 rows named `gap_stop` (`:416`, `:442`). Their text describes the Executive's typed block with gap origin. The generator's `TRAVERSAL_ROSTER` requires the literal.
   - From P5, no code admits a `gap_stop` route or disposition.
   - Confirm that the row names stay as 4.6 conservation identities. A rename would change the generator roster and the coverage catalog in a code package.
