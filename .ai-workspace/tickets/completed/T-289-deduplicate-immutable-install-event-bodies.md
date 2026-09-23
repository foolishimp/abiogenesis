# T-289 — Deduplicate immutable installation event bodies

- id: T-289
- status: completed
- type: bug
- goal: GOAL-035
- parent: T-287
- priority: P1 for the selected overhead repair
- change_class: design_reframe
- re_entry_point: ABG installation-event representation and cold reconstruction
- created_at: 2026-09-20
- closed_at: 2026-09-20
- executive: /root
- authority: owner instruction “do it” after the event-body feedback evaluation

## Outcome and boundary

Retain shared immutable installation content once while preserving distinct
installation admissions, exact scope/identity/digests, cold reconstruction,
historical embedded events, physical currentness and ordered refusal.
T-287 owns delivery order; T-288 remains completed. The prepared T287-DESIGN01
invocation has not launched and stays paused through this repair.

Owning WHAT: `specification/PRODUCT.md` (ABG admission and replay),
`REQ-R-ABG3-PAYLOAD-001..006`, and `REQ-R-ABG3-EVENTS` durable publication.
The project frame basis and immutable STDO RC7 govern construction and review.
Prefer reuse of existing admitted content; introduce no cache authority,
second catalog/runtime, weakened physical checks, or changed timeout policy.

## Evidence and acceptance

The retained `T288-workflow-scope-rm55auw0` witness contains 13,144,942 event
bytes, including 4,468,330 definite duplicate bytes: a second resolved lock
and first-install fields repeated from that lock. Under its retained read
schedule these represent 3,887,367,996 repeated bytes before replacement costs.
This is a counterfactual, not measured improvement or a numeric acceptance quota.

- [x] Accept one bounded producer/reference/reader design against existing law.
- [x] Implement in existing owners; preserve raw admission and historical reads.
- [x] Prove cold reconstruction, missing/wrong/forward-reference refusal and
      exact reconstructed candidate identity with focused regression.
- [x] Complete one deterministic installed Hello composition, including effects
      and fresh Public readback; count all affected I/O and retained event bytes.
- [x] Independently assess the frozen delta, apply guarded preimages, and return
      T-287 to its next delivery action with measured results and residuals.

No new paid UAT, release/default migration, Git operation, C2 dispatch reframe,
or general cleanup campaign is selected. The stale rival-authority test defect
remains recorded follow-up; do not rely on that suite without correcting it.

## Completion

[Executive disposition](../../comments/codex/20260919_MANAGEMENT_STEEL_THREAD/t289-completion.md)
binds final source/package, both independent assessments, the four guarded
canonical changes and evidence limits. The measured installed witness reduces
descriptor work 8.20 GB to 4.31 GB and event bytes 13.14 MB to 8.64 MB; elapsed
time is essentially unchanged. The final malformed-input refusal correction
passes the exact predecessor comparison and preserves identical valid output.
Its unchanged valid path reuses the installed witness; the final archive has
no new native execution claim. All acceptance conditions above are satisfied
within this bounded repair. Live Design/Hello and release remain with T-287.

## Accepted design selection

Executive accepts the worker's bounded reframe: retain the existing artifact
event and admission coordinates. Store installation-specific fields with a
disjoint lock-row candidate form; reconstruct the unchanged complete candidate
from its validated lock row and verify the existing canonical artifact digest.
The first occurrence embeds its resolved lock. Later occurrences may reference
that earlier physically embedded, admitted lock by source event identity/digest
and lock identity/digest, with that event as the exact causal source. No reference
chains, forward references, mixed forms, or ambient resolution. Historical full
embedded events remain readable. Projected rows remain complete derived values.
The existing `resolvedLock` payload field carries disjoint inline-lock or tagged
lock-reference values, preserving the immutable event-contract field table and
descriptor digest; a new top-level reference field is not selected.
Owning implementation design is retained with the candidate; this selection
grants implementation in that candidate and does not accept untested results.

## Activation

Tracking Writer `/root`: exact grant is this ticket, current-selection text in
GOALS and T-287, and the pause note in `design-discriminator.md`. The role change
is declared before mutation in the conversation; return is to Executive.

Implementation Worker: gpt-6-astra, xhigh; one isolated candidate under
`~/Library/Application Support/ABIogenesis/candidates/T289-event-bodies-*`.
Bound current canonical source by recorded preimages, preserving unrelated work.
First return a concise design proposal; implementation begins after Executive
acceptance. Write only the candidate's affected design/code/tests/build/evidence.
No canonical source application, paid actor, Git action or Reviewer activation.
Selected frame: RC7 `STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame`,
joined with the ABI project Design/ABG/Proof source routes. Return changed paths,
exact subject, self-checks and residuals to `/root`; stop on upstream semantic drift.

Reviewer: separately activated max against the frozen result; Product frame,
admission/reference integrity, reconstruction and measured-evidence scope only.
