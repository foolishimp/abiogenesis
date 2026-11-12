# TD-26 P0 Return: the specification step of the One Surface and Consensus retirement

**Status: IN PROGRESS. Census committed; edits follow.**

T-292, package TD-26 P0. Change class: product_reprice of `A5-F07`, with the
requirement_reprice it carries. Branch `claude/td26-p0-specification` from
local `main` at `fe01e37d8`. Line numbers below are at `fe01e37d8`.

## 1. Census (plan before edits)

Search: `rg -U -i` over `specification/` without `GOALS.md`, with `\s+`
between the words of each term, for: Consensus; One Surface; `synthesizeModel`,
`evalGap`, `evaluateNext`, `evaluateAction` and their prose forms (model
synthesis, gap evaluation, next-action evaluation, action evaluation);
construction intent, delta, composition, episode and continuation;
`ConstructionIntent`; selected action, new action, newly selected; gap stop,
`gap_stopped`; re-entry basis; lawful action(s), next lawful action;
`run_gaps`, `workspace_gaps`, `run_lawful_actions`, `ticket_consensus`,
`ticket.consensus`; `gaps` as a read; replay-derived, admitted or lawful
frontier; `NextActionProjection`, `ActionCatalog`, `ProductAssetModel` and the
other One Surface carriers; `abg.fp_consciousness`, `FP-CONSCIOUSNESS`, `FPC-`;
current intent.

Not in the census: generic graph-span, public, proof and constitutional
re-entry (`graph_span_reentry`, `public_start_reentry`, ITERATION, TRANSPORT,
RUN, SELF-CONFORMANCE, LANGUAGE-CAPABILITY-MODEL, REQUIREMENTS-ALGEBRA), the
saga and retry frontiers (SAGA-FRONTIER-001..014 bodies, PROJECTION-009), the
root governor's "typed frontier" (`scenarios/README.md:37`), observer-report
"gaps" (WITNESS-011), gap triage and gap truth in general (POLICY-018,
POLICY-025/026, `scenarios/09`:94), and actor supervision ("supervised" in
EVENTS-009, CONTINUATION-009, ABG POLICY-006, TRANSPORT).

Actions: **restate** (sentence rewritten without the retired thing),
**delete** (requirement or clause states only a retired thing), **move**
(requirement text leaves the live specification), **keep** (with reason).

### 1.1 Product and Intent

| # | Place | Text (quoted) | Action |
|---|---|---|---|
| I1 | `INTENT.md:174-176` | "native human response/resume, standalone Consensus qualification and mandatory host parity retain the release allocations owned by Product." | keep: `A5-F08` stays a planned 5.1 outcome (R4), so the allocation is still Product's; `a61231c6a` is not re-applied |
| I2 | `INTENT.md:313-314` | "controller authority in an SDK, CLI, installer, fixture, worker, plugin, Consensus surface, or One Surface projection;" | restate: drop "Consensus surface, or One Surface projection" |
| I3 | `INTENT.md:317` | "an RLM-specific, Consensus-specific, or recursive-agent-specific runtime;" | keep: the exclusion constrains the planned `A5-F08` |
| P1 | `PRODUCT.md:256-259` | "…recursion, fan-out, consensus, or continuation coordination is not irreducible merely because it is pure." | keep: names a coordination pattern, claims no shipped code |
| P2 | `PRODUCT.md:350-352` | "Retry, workflow, recursion, fan-out, consensus, and continuation are derived frame-transition patterns…" | keep: same reason |
| P3 | `PRODUCT.md:416` | "`gap_stop` \| Publish unresolved pressure as a typed gap or block without false completion or automatic retry." | keep: the 4.6 family is conserved by the Executive's typed block with gap origin; the rule-catalog generator requires the literal `gap_stop` in `PRODUCT.md` |
| P4 | `PRODUCT.md:442`, `:449` | `gap_stop` in the conserved runtime dispositions; "The other dispositions retain their 5.0 applicability." | keep: same reason |
| P5 | `PRODUCT.md:462` | "advancing the next lawful work under the current program;" | keep: 4.6 public-control conservation and a generator roster string |
| P6 | `PRODUCT.md:1022` | "read state, result, evidence, gaps, and replay" | keep: the stop reading reports a gap origin and its missing support |
| P7 | `PRODUCT.md:1028-1032` | "…which for an Executive records its unresolved obligations and review standing, and the next lawful action where the record establishes one." | restate (R2): drop the next lawful action; state the gap origin and missing support |
| P8 | `PRODUCT.md:1051` | "- order One Surface; or" | restate: "order the Executive's steps" |
| P9 | `PRODUCT.md:1061-1073` | "### System And One Surface / The standard system program composes exactly four semantic authorities: synthesizeModel -> evalGap -> evaluateNext -> evaluateAction …" | restate: "Standard System Program", the Executive's step (plan 1.2, checked against code) |
| P10 | `PRODUCT.md:1075-1086` | "### Consensus / Dedicated Consensus qualification is reserved for 5.1. … Consensus has no special runner…" | restate (R4): planned 5.1 outcome `A5-F08`; 5.0 ships no Consensus GraphFunction |
| P11 | `PRODUCT.md:1118-1119` | "They are explicitly selected, replaceable compositions." | restate (R1): stays true beside the default `supervised` root mode selecting the Executive |
| P12 | `PRODUCT.md:1229` | Consensus row, 5.0 cell: "…Existing Consensus code and exact evidence are preserved without a dedicated release-complete claim." | restate (R4): 5.0 ships no Consensus GraphFunction; 5.1 cell kept |
| P13 | `PRODUCT.md:1286-1287` | "5.0 retains automatic current-intent continuation, newly selected action admission, local recursion…" | restate (R3) |
| P14 | `PRODUCT.md:1367` | `A5-F07` "**Complete One Surface loop.** …" | restate (product_reprice): "Executive system program" |
| P15 | `PRODUCT.md:1171`, `:1377-1384`, `:1396-1397`, `:1621`, `:1752` | `A5-F08` and `ABG5-S05` as planned 5.1 identities; "standalone Consensus qualification" non-feature | keep (R4) |
| P16 | `PRODUCT.md:1422-1439` | "### `ABG5-S03`: One Surface, Local Correction And Truthful Blocking …orders `synthesizeModel -> evalGap -> …` … inspect the replay-derived frontier…" | restate (R6) against the Executive's step |
| P17 | `PRODUCT.md:1456-1457` | "Preserved code or a cheap smoke result supplies no claim of complete Consensus qualification." | restate: no preserved code; rest of S05 kept as planned 5.1 text |
| P18 | `PRODUCT.md:1630-1631` | "controller authority in an SDK, CLI, installer, fixture, worker, plugin, Consensus, or One Surface surface;" | restate: drop "Consensus, or One Surface" |

### 1.2 Product requirements

| # | Place | Text (quoted) | Action |
|---|---|---|---|
| R1 | `REQ-P-POLICY.md:43` (008) | "`start`, `gaps`, and live run status may report hold" | restate (R2): drop `gaps` |
| R2 | `REQ-P-POLICY.md:59-67` (013) | "`supervised` is the default. It selects the admitted system program…" | keep (R1) |
| R3 | `REQ-P-POLICY.md:69-76` (014) | "an interactive One Surface loop declared by an admitted GTL program" | restate: loop over the standard system program |
| R4 | `REQ-P-POLICY.md:84-89` (016) | "inspect with `gaps`" | restate (R2): inspect the stop reading |
| R5 | `REQ-P-POLICY.md:140-141` (021) | "status, result, evidence, replay, gap, and lawful-action reads" | restate (R2) |
| R6 | `REQ-P-POLICY.md:187-194` (023) | "…without requiring One Surface, `evaluateNext`, or a `ConstructionIntent`. When `root_mode = supervised`, it selects the admitted standard system program and that program owns One Surface semantic ordering…" | restate (R1) |
| R7 | `REQ-P-POLICY.md:199-201` (024) | "…private frame, frontier, continuation, traversal, retry, intent, or action-selection state." | restate (R3) |
| R8 | `REQ-P-POLICY.md:229` | "## Gap, Action, And Human Interaction Operations" | restate heading |
| R9 | `REQ-P-POLICY.md:231-236` (029) | gaps variant of `project.read` | delete (R2) |
| R10 | `REQ-P-POLICY.md:238-243` (030) | lawful-actions variant of `project.read` | delete (R2) |
| R11 | `REQ-P-POLICY.md:258-266` (033) | "…`project.read` exposes the admitted frontier. … Automatic current-intent continuation and new-action admission remain distinct…" | restate (R2, R3); the response paragraph stays |
| R12 | `REQ-P-POLICY.md:318-322` (041) | "Every 5.0 catalog, runtime, evidence, replay, gap, and lawful-action variant … intent, selection, or closure truth." | restate (R2, R3) |
| R13 | `REQ-P-POLICY.md:328-329` (042) | "the owner of One Surface orchestration" | restate |
| R14 | `REQ-P-POLICY.md:438-448` (054) | "That direct path does not require or synthesize `evaluateNext`, One Surface, or a `ConstructionIntent`. / When the invocation instead realizes an action selected by `evaluateNext` … `ActionCatalog` … Both paths shall return…" | restate (R3); the contracts cite 054, it stays |
| R15 | `REQ-P-POLICY.md:549-551` (065) | "…and the next lawful actions the admitted record establishes." | restate (R2) |
| R16 | `REQ-P-POLICY.md:587-591` (068) | "…and the next lawful action, or that none is admitted." | restate (R2) |
| R17 | `REQ-P-POLICY.md:616` | "- inspect gaps and lawful actions;" | restate (R2): the stop reading's gap origin |
| R18 | `REQ-P-PUBLIC-CONTRACTS.md:150-158`, `:164-165` (006A) | 9 Consensus schema ids, 2 Consensus vocabulary ids | delete (end state; R5 keeps their citations live through CONSENSUS-004/007/008) |
| R19 | `REQ-P-PUBLIC-CONTRACTS.md:209` (008) | "catalog, runtime, evidence, replay, gaps, and lawful actions" | restate (R2) |
| R20 | `REQ-P-PUBLIC-CONTRACTS.md:218` (008) | "automatic current-intent continuation or a newly admitted selected action" | restate (R3) |
| R21 | `REQ-P-PUBLIC-CONTRACTS.md:231-232` (008) | "automatic continuation and distinct new-action admission remain required." | restate the clause after the semicolon only (R3); the `interaction.respond` part stays |
| R22 | `REQ-P-PUBLIC-CONTRACTS.md:279-281`, `:301-303` (011) | "Consensus capability publication is optional in 5.0…"; "`abg.capability.graph-function.consensus@5` retains its stable identity…" | delete (end state; P7 removes the capability) |
| R23 | `REQ-P-QUAL.md:19-20` | "Standalone Consensus, mandatory host parity, … are 5.1 qualification claims." | keep (R4) |
| R24 | `REQ-P-QUAL.md:286-298` (059) | "…through one admitted GTL One Surface program … expose replay-derived frontier and lawful actions…" | restate (R6); the coverage generator cites 059 |
| R25 | `REQ-P-QUAL.md:314-323` (061) | Dedicated Consensus qualification | move (R4) |
| R26 | `REQ-P-QUAL.md:357` (064) | "One Surface;" | restate |
| R27 | `REQ-P-SCENARIOS.md:13` | "Define the seven end-to-end scenarios" | restate: SCENARIOS-012 leaves |
| R28 | `REQ-P-SCENARIOS.md:19-20` | "Standalone Consensus qualification, … are reserved for 5.1." | keep (R4) |
| R29 | `REQ-P-SCENARIOS.md:121-150` (010) | S03 heading and body, including the `gap_stop` re-entry sentences `:140-144` | restate (R6); re-entry sentences delete (R2); the coverage generator cites 010 |
| R30 | `REQ-P-SCENARIOS.md:166-177` (012) | `ABG5-S05` heading and requirement | move (R4) |
| R31 | `REQ-P-SCENARIOS.md:258` (016) | "`ABG5-S04`, `ABG5-S05`, … is successor or derived evidence" | keep (S05 identity kept) |
| R32 | `REQ-P-CATALOG.md:93-98` (009A) | "The canonical Consensus function is such a row. Downstream products may bind declared reviewer profiles…" | restate as in `f4aad7d5e` |
| R33 | `REQ-P-CATALOG.md:188` (026) | "Catalog list, describe, lawful-action, invocation, and replay projections" | restate (R2) |
| R34 | `requirements/product/README.md:13` | "the SYSTEM-owned agent-invocable Consensus GraphFunction" | restate: the file keeps three contract-row requirements (R5) |
| R35 | `requirements/product/README.md:29` | `REQ-P-CONSENSUS.md` | keep: the file stays live under R5 |
| R36 | `requirements/README.md:52-53` | "`A5-F08`/`ABG5-S05` and `A5-F12`/`ABG5-S04` … Their frozen design and requirement text are preserved as future input." | restate: only F12/S04 keep frozen text |
| R37 | `requirements/README.md:64-68` | "dedicated `REQ-P-CONSENSUS` qualification, `REQ-P-SCENARIOS-012`, `REQ-P-QUAL-061` …; mandatory Consensus capability publication in `REQ-P-PUBLIC-CONTRACTS-011`;" | restate as in `f4aad7d5e` |
| R38 | `requirements/README.md:77` | "`REQ-R-ABG3-FPC-018`, `REQ-R-ABG3-FPC-019`," | delete the two ids (family moves) |
| R39 | `requirements/README.md:86-87` | "One Surface evaluation," | delete the item |
| R40 | `requirements/README.md:96-97` | "automatic current-intent continuation and new-action admission remain 5.0 obligations." | restate (R3) |
| R41 | `requirements/README.md:99-101` | "…POLICY-014/016/021/033, CONTINUATION-011, and every response/resume proof…" | keep: CONTINUATION-011 is restated, not deleted |
| R42 | `scenarios/README.md:12-14` | "ABIogenesis 5.0 selects `ABG5-S01`, `ABG5-S02`, `ABG5-S03`, `ABG5-S05`, `ABG5-S06`…; `ABG5-S04` is reserved…" | restate (R4): S05 is planned 5.1 |

### 1.3 ABG, GTL and mapping requirements

| # | Place | Text (quoted) | Action |
|---|---|---|---|
| A1 | `REQ-R-ABG3-BINDING.md:25` (004) | "exact selected action or current-intent basis" | restate (R3) |
| A2 | `REQ-R-ABG3-BINDING.md:51` (017) | "A newer observation may stale dependent model, gap, or next-action projections;" | restate: drop the One Surface projections |
| A3 | `REQ-R-ABG3-CONTINUATION.md:13-15` | "preserving the distinction between continuation of the current admitted intent and admission of a newly selected action." | restate (R3) |
| A4 | `REQ-R-ABG3-CONTINUATION.md:22-27` | "Only the native F_H response/resume portion of CONTINUATION-011 is deferred; automatic current-intent continuation, newly selected actions, local correction…" | restate (R3) |
| A5 | `REQ-R-ABG3-CONTINUATION.md:53` (011) | "…lawful input for the current construction intent shall continue only that intent through `continueExecution`…" | restate (R3): pending execution; README:99 keeps citing it |
| A6 | `REQ-R-ABG3-CONTINUATION.md:55` (012) | "`evaluateNext -> admitConstructionIntent -> invokeGraphFunction`" | delete |
| A7 | `REQ-R-ABG3-CONTINUATION.md:57` (013) | "…shall rerun the affected `synthesizeModel`, `evalGap`, and `evaluateNext` functions." | delete |
| A8 | `REQ-R-ABG3-EVENTS.md:56` (021) | "The existing construction event family shall preserve the admitted One Surface authority boundaries…" | delete (R7: states One Surface obligations only) |
| A9 | `REQ-R-ABG3-EVENTS.md:85` (030) | "One Surface events shall preserve stable workspace authority separately from mutable observation…" | delete: subject is One Surface events; the binding law is BINDING-016/017, POLICY-051, CONTINUATION-014 |
| A10 | `REQ-R-ABG3-EVENTS.md:87` (031) | "…owner of model synthesis, gap evaluation, next-action evaluation, action evaluation, program ordering…" | restate |
| A11 | `REQ-R-ABG3-EVENTS.md:111` | "construction: `construction_episode_started`, `construction_intent_selected`, `construction_delta_observed`" | restate (R7): census true to the declared kinds (`construction_episode_started` is not in `RUNTIME_EVENT_KIND_VALUES`); listed |
| A12 | `REQ-R-ABG3-FN-COMPOSITION.md:102-107` (022) | "…block, gap stop, non-admit, or terminal projection." | restate (R2) |
| A13 | `REQ-R-ABG3-FN-COMPOSITION.md:109` (023) | "selected action or current-intent identity" | restate (R3) |
| A14 | `REQ-R-ABG3-FN-COMPOSITION.md:111` (024) | "When a newly selected action requires … one sufficient `ConstructionIntent` from the admitted `NextActionProjection`…" | delete |
| A15 | `REQ-R-ABG3-FN-COMPOSITION.md:121-126` (026) | "The GTL `C` algebra may compose the One Surface functions…" | delete |
| A16 | `REQ-R-ABG3-FN-COMPOSITION.md:128` (027) | "A published inner refinement shall recurse through the same declared One Surface composition and preserve…" | restate |
| A17 | `REQ-R-ABG3-INTERPRET.md:62-65` (011) | "It shall not order One Surface, choose private traversal state…" | restate |
| A18 | `REQ-R-ABG3-INTERPRET.md:147-151` (030) | "The admitted GTL program shall own the One Surface order … ABG shall preserve the four semantic authorities…" | restate against the Executive |
| A19 | `REQ-R-ABG3-PROJECTION.md:38` (011) | "…the same admitted continuation disposition and `NextActionProjection`. … `evaluateNext` may emit a candidate selection projection…" | restate |
| A20 | `REQ-R-ABG3-PROJECTION.md:44` (014) | "…drift observations to `evalGap` and `evaluateNext`…" | restate |
| A21 | `REQ-R-ABG3-PROJECTION.md:62` (021) | "an observation input to `evalGap` and the executive evaluator" | restate |
| A22 | `REQ-R-ABG3-PROJECTION.md:66` (022) | "`ProductAssetModel`, `ObservationSnapshot`, `GapPressureRow`, … `NextActionProjection`…" | delete |
| A23 | `REQ-R-ABG3-PROJECTION.md:68` (023) | "…replay, gaps, and lawful actions … evaluate gaps, determine action eligibility, rank or select actions, admit intent…" | restate (R2, R3) |
| A24 | `REQ-R-ABG3-PROJECTION.md:70` (024) | "…recompute dependent model, gap, target-binding, priority, and next-action projections." | delete |
| A25 | `REQ-R-ABG3-SAGA-FRONTIER.md:7` | "Derives from" link to `REQ-R-ABG3-FP-CONSCIOUSNESS.md` | restate: drop the link |
| A26 | `REQ-R-ABG3-SUPERVISOR-WITNESS.md:6` | "Derives from" link to `REQ-R-ABG3-FP-CONSCIOUSNESS.md` | restate: drop the link |
| A27 | `REQ-R-ABG3-SUPERVISOR-WITNESS.md:22` (001) | "for any halted or gap-stopped run" | restate (R2) |
| A28 | `REQ-R-ABG3-SUPERVISOR-WITNESS.md:50` (015) | "(which remains declared module truth per FPC-004 — never harness-local configuration)" | restate: drop the FPC citation |
| A29 | `REQ-R-ABG3-TUNER.md:6` | "Derives from" link to `REQ-R-ABG3-FP-CONSCIOUSNESS.md` | restate: drop the link |
| A30 | `REQ-R-ABG3-TUNER.md:54` (010) | "narrative labels carry no authority (FPC-021)." | restate: drop the citation |
| A31 | `requirements/abg/README.md:60` | "`REQ-R-ABG3-FP-CONSCIOUSNESS.md`" | delete the entry |
| A32 | `REQ-R-ABG3-FP-CONSCIOUSNESS.md` (FPC-001..021) | whole family | move (R4) |
| G1 | `REQ-L-GTL3-HOOKS.md:41` (012), `:43` (013) | "`abg.fp_consciousness` hook/config truth for generic `F_P` construction evaluation…"; "…for a selected construction action…" | delete: One Surface hook only; no code declares the key |
| G2 | `REQ-L-GTL3-HOOKS.md:61-62` (019) | "reuse existing `abg.fp_consciousness`, `abg.fn_composition`, …" | restate: drop `abg.fp_consciousness` |
| M1 | `requirements/mapping/` | no census hit | none |

### 1.4 Moved files

| # | Place | Action |
|---|---|---|
| X1 | `requirements/product/REQ-P-CONSENSUS.md` | reduce to `-004`, `-007`, `-008` (R5: the 13 schema rows and `consensus-fh-decision` cite `-004`, `review-ruling-kind` cites `-007`, `consensus-round-outcome` cites `-008`, at this path); every other requirement moves |
| X2 | `requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md` | move whole |

Where moved text goes: `f4aad7d5e` added no file (`git show f4aad7d5e --name-status`
shows only `M` and `D`); it removed `REQ-P-CONSENSUS.md` from the tree, and git
history is the record. `specification/` has no history location, and anything
placed under `specification/requirements/` is staged as live authority by the
qualification generator. The moved text therefore leaves the tree the same
way, retrievable verbatim at `fe01e37d8`.
