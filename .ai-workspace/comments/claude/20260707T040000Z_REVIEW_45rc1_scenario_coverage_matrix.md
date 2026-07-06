# Review: 4.5.0-rc.1 Scenario-Coverage Matrix

**Status**: review commentary
**Date**: 2026-07-07
**Scope**: every code path the rc.1 candidate is expected to run,
mapped to its proof or its named gap. Four gaps found during the
review were closed with differentials in the same pass (t205 16/16,
suite 1132/1132); the remaining named gaps are honestly listed with
their phase owners.

## A. Program resolution (the one seam)

| Scenario | Path | Proof |
| --- | --- | --- |
| No declarations → bootstrap (typed catalog citizen) | resolution default via effectiveHogProgramCatalog | B2 matrix + citizenship test |
| Single declared program | abg.hog_program | B2 matrix + engine-run (declared ref+arms in replay) |
| Catalog + static selection | _catalog + _ref | B2 matrix |
| Catalog + ladder, attempt N | _ladder outranks _ref | -017 ESCALATION (across resume) + g1 rung-selection law |
| Ladder admission negatives | first-rung/strict-increase/typed rows | g1 (closed this review) |
| Unknown selection / selection-without-catalog / catalog-without-selection / rung-not-in-catalog / ladder-without-catalog | typed throws at the seam | B2 matrix + resolution guards (rung/ladder variants exercised via g1 + entry conversion) |
| Reserved-ref shadow | effectiveHogProgramCatalog | citizenship test |
| Unexecutable stage set / stage position | entry gate, registry-aware | B2 matrix + position negative + codex-HIGH engine probe |
| ANY resolution failure at run entry | runtime_failure_observed + gap_stop, tag-first | codex-HIGH differential |

## B. Handler surface

| Scenario | Proof |
| --- | --- |
| Registry admission (fields, duplicates, classes, unknown refs) | B3 registry + codex-probe differential |
| Fail-closed resolution (missing binding, regime mismatch, unregistered impl) | B3 registry + binding-complete gate negatives |
| DECLARED bindings assemble the registry; declared config reaches the handler | g2 (closed this review) |
| Handler throw → typed blocked | B3 registry (sync) + executeHandlerAsync (same conversion) |
| Async impl on sync driver → typed refusal, judged blocked | g2/g3 (closed this review) |
| Same async impl on async driver → advance | g2/g3 (closed this review) |
| F_D process execution: executed/blocked, exit codes as F_P evidence | strict-F_D differential |
| F_D materialization: write-root confinement | strict-F_D differential + g4 real-io smoke |
| F_H gate: always escalates | B3 + g4 |
| F_P transport: trio failures, pass/block/unlawful/unparseable dispositions, advisory mode, projection splice | B3 transport differential |
| Runtime impls (traced_process route, real fs) | g4 smoke (config gate; real materialization) |
| Tool emergence (no tool names in handler code) | source-witness grep-in-test |
| RAW-field admission (no coercion; numeric/boolean fields reject as authored) | codex P1-a differential |
| CLOSED-KEY program + stage admission (unknown siblings reject; admitted stages carry only known keys; syntax layer uniform) | codex P1-b differential |

## C. Execution anchors & programs

| Scenario | Proof |
| --- | --- |
| 4-stage program executes; order transform<admit<evaluate | B3 KEYSTONE |
| Blocked extra stage → gap_stop(hog_stage_blocked) + spine judged blocked | KEYSTONE negative |
| All three fibres at the anchors; F_H stops with hog_stage_escalated | B3 TRIAD |
| Governing-attempt coherence (evaluate carries the producing rung) | -017 differential (found + fixed by it) |
| F_D lane mechanical-transform spine | B4 + ten sequence lanes |
| Batch/rule/sub_traversal spine identity | t084/t128/t072-family sequence lanes |

## D. Iteration heights

| Scenario | Proof |
| --- | --- |
| Retry within run (worker-runtime, process evidence) | legacy t084/t109 lanes |
| Exhaustion → lawful stop | B-prep run 1 |
| Resume: frontier holds, fresh window, converges | B-prep |
| Attempt identity replay-global across resume (-004) | B-prep fix differential |
| Ladder escalation ACROSS resume | -017 differential |
| Consequence re-entry: upstream landing, monotone spines, fold-back | B5-prep (t152 lane) |

## E. Live composition (B5 lane)

| Scenario | Proof |
| --- | --- |
| Declared catalog+ladder govern a REAL worker run | t194 lane: per-config {lean:6}, declared arms, parity 2==2, converged |
| releaseGrade classification | sourceClean=true artifact on the run |
| Worker-side failure (model 400) → typed truth, lawful stop | observed live (campaign #13 class); substrate behaved by design |

## Named gaps remaining (owned, not silent)

1. **FpTransportConfig.prompt** violates HANDLERS-015 (config boundary)
   — named transitional gap in the family; re-homes to instruction
   categories when extra F_P stages bind the manifest pipeline.
   Owner: T-205 follow-through, non-closing for the cut per the family.
2. **F_H escalated stop → approval-consumption resume** for EXTRA
   stages: baked fh_admission has legacy coverage; the extra-stage
   escalate→approve→resume loop has no t205 differential. Owner:
   Phase C (the data-mapper's F_H usage will exercise it) or a
   follow-through differential if C does not reach it.
3. **Live traced-process execution** (real spawn through the standard
   handler): g4 smokes the config gate and real fs io; a real spawn
   through runTracedProcess inside a handler awaits the first declared
   F_D execution stage in a lane (Phase C's sbt gate is exactly this).
   Owner: Phase C.
4. **Declared bindings in the LIVE lane**: the B5 lane declares
   catalog+ladder (triple-shaped, no extra stages → no bindings
   needed). Extra-stage bindings live at engine level (g2). A live
   declared-bindings row rides Phase C's scenario surgery.

## Post-review round (codex, rc.1 candidate)

Two P1 admission findings (coerced binding fields; open-key program
admission) — both verified by probe, both closed with the probes
pinned as differentials; syntax layer made closed-key for uniformity.
The release-state and evidence-scope notes were accurate as stated:
readiness (not a cut), and the live gate was re-run at the final
candidate HEAD so the citable artifact installs the 4.5.0-rc.1
package.

## Verdict

Every code path the candidate ships is either differentially proven
(A–E above) or a named gap with a phase owner (1–4). No silent
coverage claims found. The four gaps discovered BY this review were
closed IN it — the write surface (declared bindings) was the serious
one: built for the scope ruling, proven end-to-end only now.
