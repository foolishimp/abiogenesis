# T-293 - QA Findings of the Consolidation Wave

- id: T-293
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-292
- updated_at: 2026-11-13
- change_class: realization_refactor
- derived_change_classes: design_reframe or requirement_reprice only for a row that says so
- re_entry_point: `.ai-workspace/tickets/active/T-292-consolidate-and-clean-the-code-base.md`, the amendment of 2026-11-13

## Purpose

One list of the defects found by the reviews, traces and packages of the T-292 wave. The owner's instruction of 2026-11-13: reviews do not pause the work; they are QA. Each finding is triaged here with a severity and a priority and then scheduled. A new finding is appended as a new row; nothing is merged late because a review is running.

## Scales

| Severity | Meaning |
|---|---|
| S1 | Loses or corrupts recorded data, or admits work it must refuse, in ordinary use |
| S2 | The same under specific but ordinary conditions: two processes, an upgrade, a volume that ignores letter case |
| S3 | A wrong or misleading result, or a missing check, on an unusual path; no loss of data shown |
| S4 | A text, test or diagnostic defect |

| Priority | Meaning |
|---|---|
| P1 | Fixed in this wave, before the cut |
| P2 | Scheduled after the cut |
| P3 | Backlog |

## Findings

`TD-nn` names the register entry (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md`) that holds the evidence.

| ID | Finding | Source | Sev | Pri | Schedule and status |
|---|---|---|---|---|---|
| B-01 | Six exported entries that admit or continue Run work take a binding, an install or an environment from recorded history without the strict answer (TD-77) | `REVIEW_TD77_RECHECK.md` N1 | S2 | P1 | In the closing round of TD-77, in flight |
| B-02 | The materialization branch of the strict candidate has no case and an untrue error text; one new text is thrown where no lock is in question; three design sentences (TD-77) | `REVIEW_TD77_RECHECK.md` N2 to N4 | S4 | P1 | Same round as B-01 |
| B-03 | A build of one cut runs work on a store that another cut installed and bound; nothing compares the executing Product with the binding the operation selects (TD-78) | `TD-78_TRACE.md`; evaluation of 2026-11-13 | S2 | P1 | Fix after TD-77 merges (same files) |
| B-04 | Two processes with different `TMPDIR` values both hold one event log; both append the same ordinal; an acknowledged append cannot be reopened (TD-82) | `TD-80_TRACE.md`; reproduced after TD-80 by the evaluation | S2 | P1 | Technical repair closed at `a3c03d90c`; 27 merged focused passes; separate QA has no technical finding. Assurance/platform limits in `REVIEW_TD82_CODEX_INTEGRITY.md` |
| B-05 | A worksite subject in another letter case creates a protected directory that does not exist yet, or links a file into it before the refusal (TD-85, narrow part) | `TD-85_TRACE.md`; reproduced by the evaluation | S2 | P1 | Fix launched 2026-11-13 |
| B-06 | Synchronous canonical-path checks keep the spelling they are given; the command parent writes its manifests into the event-log directory through an alias of an existing root (TD-85, first part) | `TD-85_TRACE.md` | S3 | P1 | Built on branch `claude/td85a-stored-spelling-checks`; merged after TD-77 if it still merges cleanly |
| B-07 | The value kinds `observation_snapshot` (as input) and `next_action_projection` with `no_action` (as a leaf result) are admitted as ordinary values since the route package; they were refused before | `TD-26_P4_RETURN.md`, ruling item 1 | S3 | P1 | In TD-26 P5, in flight |
| B-08 | Kept design sentences still describe removed code: 12 passages after the doors package, 5 after the module, 3 after the route package, and constitution rows | Returns of TD-26 P1, P2, P4 | S4 | P1 | One design pass after TD-26 P7 |
| B-09 | `workspace.bind` admits roots that overlap, are absent or are spelled differently from the stored name; with two roots declared equal, materialization writes into the event-log directory | `TD-85_TRACE.md` | S3 | P2 | A change of `REQ-R-ABG3-BINDING-016`: the owner's decision before any build |
| B-10 | The file-parents realizer omits the graph-function digest comparison that the file-replace realizer makes (TD-83) | `TD-37D_RETURN.md` | S3 | P2 | After the cut |
| B-11 | The native workspace realizer checks no currentness before it dispatches, which the accepted design asks of realization (TD-83) | `TD-37D_RETURN.md` | S3 | P2 | After the cut |
| B-12 | A request nested about 1,900 levels deep overflows the stack in call admission; an owner receipt can carry text that is not I-JSON (TD-84) | `TD-79_RETURN.md` | S3 | P2 | After the cut, with TD-76's second part |
| B-13 | Three more sentences of the design note `M05_S06…` say close works from verified bytes; the note's status line says it is proposed and not operative | `TD-80_RETURN.md`, closing round | S4 | P2 | Design pass after the cut |
| B-14 | When the in-memory commit throws after `fsync`, the store's history keeps a row its file no longer has, and inside a transaction the original cause is lost (TD-86) | `REVIEW_TD80.md` F3 | S3 | P3 | Backlog; needs an internal fault to occur |
| B-15 | A checked artifact append inside a transaction returns `sink_unavailable` while the outer transaction commits the row; recovery identifies the log with `lstat` where the other entries follow a symbolic link | `REVIEW_TD80.md`, pre-existing observations | S4 | P3 | Backlog; not reachable by the reviewer's reading |
| B-16 | Two sorts that follow the process locale feed a recorded or digested value (`release_publication.ts` predecessor references; the manifest generator's contribution rows) | `TD-81_RETURN.md` | S4 | P3 | Backlog; present values order the same under every locale tried |
| B-17 | The present reader refuses 86 recorded helper artifacts of `5.0.0-rc.1` to `rc.3`, because the context identity rule changed after they were recorded | `TD-81_RETURN.md` | S4 | P3 | Backlog; no kept flow reads them |
| B-18 | The gated lane `steel-consumer-declaration` would fail if its gate were set | `TD-26_P2T_RETURN.md` | S4 | P3 | Backlog; its route has an ungated lane since `44a9533da` |
| B-19 | With a five-hour timeout override on a scenario's test command, the command form's budget exceeds the actor limit and the task is refused | `TD-67_RETURN.md` | S4 | P3 | Backlog; no configuration sets such an override |
| B-20 | On the CLI's exit-70 path the written line still has kind `public_transport_refusal` and disposition `refused` | `TD-79_RETURN.md` | S4 | P3 | Backlog; the status and the code carry the classification |
| B-21 | A firmlink spelling of a path passes as the stored spelling | `TD-85A_RETURN.md` | S4 | P3 | Backlog |
| B-22 | The qualification inventory and recipe hold digests and member paths of files the wave changed or deleted | Returns of TD-26 P1, P2, P4, TD-67, TD-79 | S4 | P2 | Regenerated at the cut |
| B-23 | TD-77's strict default reaches a pure historical replay through shared source-provenance/revision helpers, making a kept child unreadable at later prefixes after a register change | `REVIEW_TD77_CODEX_TRIAGE.md`; frozen `91aec88b8`, saved changed-register failures and Writer first-refusal probe | S2 | P1 | Repair selected within TD-77 during Codex resumption; preserve strict work callers, repair read setup, and re-prove the actual historical read |

## Schedule

| When | Items |
|---|---|
| In flight | B-01, B-02, B-23 (TD-77 integration); B-05 (TD-85 narrow pre-effect repair) |
| Preserved for continuation | B-05 (TD-85 narrow); B-07 (TD-26 P5) |
| When TD-77 merges | B-03; B-06 |
| After TD-26 P7 | B-08 |
| At the cut | B-22 |
| After the cut | B-09 (after the owner decides), B-10, B-11, B-12, B-13 |
| Backlog | B-14 to B-21 |

## Rules

- A review, a trace or a Writer that finds a defect adds a row here; the Executive assigns severity and priority and a slot in the schedule.
- No merge waits for a review. A review of merged work is QA; its findings are rows.
- P1 rows are closed before the cut. A row is closed with the merge commit that fixes it.
