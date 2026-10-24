# Review: T-290 Phase B, the registered debt wave, `46ed04895..91a2caa62`

Commentary, not law. Reviewer: Codex, run by the owner. Pasted by the owner on 2026-10-24 ("review feedback"); recorded here verbatim by the Executive (Claude Fable 5.1). The one finding, B-REVIEW-01 (S2, the prepared attribution helper), is disposed in `work/T290_DEBT_WAVE_01/packages.md` `## Phase B close`. The evidence paths are on the owner's host and are not copied.

---

The committed Phase B code passes this review with no S0–S2 findings. I found one S2 issue in the prepared close-attribution tooling that must be addressed before relying on its output for closure.

I reviewed 46ed04895..91a2caa62, covering all 45 changed source files, all twelve packages, their tests, generated artifacts, Returns and dispositions. The review used an isolated snapshot; the active checkout was preserved.

The Product frame remains ABIogenesis 5.0's fixed fifteen-family scope. These refactors must preserve GTL meaning, HoG traversal and ABG's exclusive event-admission authority. Indexes, projections, snapshots and reader buffers remain derived mechanisms.

Finding B-REVIEW-01 — S2: the prepared attribution helper can classify a different failure as unchanged.

In attribute_close.py:40 (/private/tmp/t290-phase-b-review-91a2caa62-hxiq931b/close-attribution-probe/attribute_close.py:40), same_reds compares failing line numbers. Although the parser collects test names and first errors, it does not compare them. Rows classified same then omit their error details from the report.

I reproduced this with unchanged counts and a failure at the same line, but a completely different error. The helper reported:

review-probe  1/0/1/0  1  1  same
1 lanes; 1 same; 0 differ or unexpected

This can conceal a regression at an already failing assertion or file-level test. It does not establish that such a regression exists in the current wave.

The bounded correction is to compare retained test identities and normalized first-error signatures, or separately inspect and record every red first error before making the close claim. This finding concerns the prepared script outside the pinned commit, not the runtime implementation. Reproduction output (/private/tmp/t290-phase-b-review-91a2caa62-hxiq931b/close-attribution-probe/result.txt).

Package-level code review

| Package | What I checked | Assessment |
|---|---|---|
| TD-06 — exact clipping | applyClip derives the same fluent key used by insertion. Exact, absent and wildcard cases retain transition ordering. Deleting the current entry while iterating the wildcard map neither skips nor repeats later entries. | No defect found. The exact lookup removes the population scan. |
| TD-07 — point reads | The thirty replacements retain their original prefixes, scopes and cuts. They use the existing historical fluent transitions rather than constructing and sorting the complete held set. | No defect found. The seven lifecycle-reader exceptions remain explicitly assigned to Phase C. |
| TD-17 — F_P completion causes | Both synchronous throws and Promise rejection reach the existing failure receipt. The diagnostic uses the actual compute regime; candidate and evidence digests remain consistent after adding the diagnostic reference. | No defect found. Cause admission and cold/Public diagnostic tests pass. |
| TD-13 — keys and guards | Shared key comparison preserves exact-key behavior. Record guards preserve outer-shape checks without claiming recursive JSON validation. I traced the affected typed values and retained null/refusal channels. | No defect found. |
| TD-14 — casts | Reviewed the removed casts and replacement guards, the Rule.config admission change, retained premises, and the nine discharges subsequently completed by TD-15/16. | No defect found. An independent AST census confirms 16 retained casts in the named forms. The stricter Rule-config domain is covered by the recorded ruling. |
| TD-04 + TD-05 — proof fixtures | Verified the packaged S01 hashes and reconstruction of physical coordinates through the real reopen owner. Examined both obsolete-import repairs and the assertions they now expose. | The bounded increment holds. Remaining historical-fixture problems are explicit; these packages do not make those families wholly green. |
| TD-11 — incremental tool tracking | First-seen order and ordinals, repeated IDs, conflicting evidence, incomplete evidence, retries, chunk boundaries and final drain. Previously returned arrays remain immutable. | No defect found. Lookup work becomes linear. Snapshot reference copies remain quadratic when every chunk introduces a new tool; the Return discloses this and the grant expressly accepts it. |
| TD-08 — worksite currentness | Traced every support-selector family into the unchanged C0/native owners. Checked duplicate ambiguity, ordinal filtering, caller-list ordering, failure-fibre support, unknown effects and absent-prefix refusal. | No defect found. The index remains local to the call and does not substitute a broader history for the caller's dependency list. |
| TD-15 + TD-16 — writers and admission | Canonical ordering, specialized prefix/replay streaming, emitted parts, digests and partial-sink failures; refusal preservation at the thirteen migrated admission sites. | No defect found. Keeping catches for cycles, deep inputs and proxy traps is necessary at this cut. The nine throw-contract callers legitimately retain the lift. |
| TD-23 — durable framing | Row boundaries, offsets, split UTF-8, partial-row copies, framing precedence, digest precedence and cessation after logical failure. Checked that the real consumer does not retain borrowed buffer views. | No defect found. Both readers retain their policies and rejection behavior. |
| TD-20 — status compaction | Independently compared the old and compacted ticket bodies. | Historical body lines remain in order; six declared frontmatter replacements and twelve heading retitles account for the changes. |
| TD-21 + TD-22 + TD-24 — triage | Reviewed classifications, source premises, qualification exclusions and subsequent dispositions. | The Return covers 31 rows, not 28. Its initial classifications are 10 closed, five open, five outside scope and eleven unverified. These are triage outcomes, not 31 completed runtime fixes. |

Independent verification

- Fresh build, both lints and TypeScript checking passed.
- All 1,231 tracked tenant files matched the pinned commit after building.
- Generated manifest and capability-graph differences are identity/digest changes; their structures are unchanged.
- Across 23 test files: 259 passed, ten inherited failures, nine skipped.
- All 11 installed-path tests passed, including Hello, large-log replay, failure-subject retention, acknowledgment rejection controls and both ENOEXEC cases.
- The fulfillment lane passed 7/7 after I restored a tracked fixture omitted from my initial archive.

For stronger failure attribution, I ran the three failing test files against Phase A's runtime, using Phase B's now-loadable test definitions and packaged fixture. All ten failures matched in test identity, error header and assertion values. They comprise seven consensus cases, two source-set cases and the already-ruled Run-read expectation. Comparison evidence (/private/tmp/t290-phase-b-review-91a2caa62-hxiq931b/review-baseline-comparison.json).

The broad close remains separate: I have not accepted its final attribution, closing restatements or close commit. Phase C and release qualification retain their recorded obligations.

Detailed review record and evidence index (/private/tmp/t290-phase-b-review-91a2caa62-hxiq931b/review-disposition.json). No repository files were changed and nothing was pushed.
