# T-287 Wave 1 Worker, Assurance, And Adjudication Append Log

Status: open commentary append log. This post is evidence and dialogue, not
Product, requirement, design, ticket, implementation, or acceptance authority.

Opened: `2026-08-03T16:40:39Z`

Purpose: retain the separated delivery dialogue in one chronological surface:

```text
worker freezes candidate
  -> independent cold assurance reports findings
  -> F_H proxy adjudicates findings
  -> worker interprets and actions accepted outcomes
  -> independent cold assurance re-reviews the next frozen candidate
```

The worker does not review or accept its own candidate. The cold reviewer does
not edit or direct the worker. The F_H proxy does not implement the repair; it
adjudicates findings and passes accepted outcomes to the worker.

## Entry 001 - External Monitoring Review Received

Source: separate Claude monitoring session, supplied by F_H.

The monitor reported HEAD `a1fa19f6`, tree `f4ca6e73`, a clean tracked tree,
nine preserved untracked posts, and stale T-287 tracking at `1f6a860`. It
recommended stop/reset and alleged these regressions:

- `3ed1c5a` retained a C-call authority split and WeakSet poisoning;
- `ae4a2a9` could reconstruct consumed deferred work as current;
- `cccef1c4` could admit recursion routes from inactive/stopped cursors and
  exposed contradictory route predicates;
- `a1fa19f6` could reinterpret a generic workflow foldback as an
  application-specific carrier;
- earlier AX-F08, retry, continuation, private-fold, and process-local Public
  blockers remained.

The monitor classified the four post-`1f6a860` commits as zero accepted
movement because the sole active ticket had not advanced its accepted
checkpoint or checklist.

## Entry 002 - F_H Initial Adjudication And Hold

Source: Codex F_H proxy live-code review.

Forward expansion was stopped. The initial live-code adjudication found:

- T-287 tracking was stale. Later code existed, but the authoritative delivery
  surface still selected `1f6a860` and invocation re-entry. Prior reports of
  formal accepted movement were therefore withdrawn.
- The C-call WeakSets predated `3ed1c5a`; that commit did not create them, but
  it retained mixed nominal and event-authoritative paths.
- The `ae4a2a9` counterexample was confirmed: reconstruction cut a historical
  prefix at the judgment event and could reproduce `application_ready` after a
  later route had consumed that availability.
- The `cccef1c4` counterexample was confirmed: cursor admission was tested,
  but current `locus_active`, Run, and frame truth were not all required before
  recursion-route admission.
- The exact generic-foldback allegation was initially not reproduced because
  Event Calculus initiates `child_foldback_available` only when an
  `applicationRef` exists.

Disposition: local forward repair, not wholesale reset. The valid replay and
projection work remains recoverable. No Product, requirement, or accepted
design contradiction was identified.

## Entry 003 - Worker Correction Assignment

Source: Codex F_H proxy to implementation worker.

The worker received outcome-level findings, not implementation instructions:

1. A consumed deferred application must not reconstruct as current. Historical
   prefix may reconstruct identity; the complete current validated Run prefix
   must decide currentness.
2. An inactive source cursor, inactive frame, or terminal Run must not admit a
   recursion route. Post-route truth must consistently show source inactive,
   advance target active, or blocked Run terminal.
3. A generic `child_foldback_admitted` event without application meaning must
   not project as `ApplicationChildFoldbackAdmission`.
4. Add distinct-process negative and paired positive controls.
5. Do not expand to another feature cone, reset, or edit design/commentary.

The worker retained authority over callable shapes, placement, and algorithms.

## Entry 004 - Independent Cold Reviewer Bootstrap

Source: clean Codex assurance session.

The reviewer was bootstrapped without inherited dialogue and was granted
read-only authority. Its deciding inputs were the live repository surfaces:

- `AGENTS.md`;
- `specification/GOALS.md`, Intent, Product, and A5-F10 requirements;
- accepted design and `ABI5_REALIZATION_CONSTITUTION.md`;
- T-287;
- installed immutable STDO 2.2.2;
- live code and diffs from ticket checkpoint `1f6a860` through HEAD and the
  worker's unstaged correction.

The reviewer could not edit, commit, reset, update tracking, or direct the
worker.

## Entry 005 - Worker Interim Report

Source: implementation worker.

The worker reported the first bounded correction implemented:

- deferred-application identity reconstructed at the historical judgment cut,
  while exact judgment availability is decided from the complete current Run
  prefix through Event Calculus;
- recursion-route admission requires current `run_active`, `frame_active`, and
  `locus_active`;
- route projection/application requires source inactive after admission plus
  advance target active or blocked Run terminal;
- two fresh-process workers cover deferred application and recursion lifecycle;
- the generic foldback without `applicationRef` negative passes through the
  existing Event Calculus filter.

Focused evidence reported:

- build: pass;
- recursion: `2/2` pass;
- Event Calculus: `8/8` pass;
- `git diff --check`: pass.

The worker had not frozen or requested acceptance and remained inside the
bounded correction.

## Entry 006 - Cold Assurance Findings

Source: independent clean Codex reviewer.

Overall disposition: reject the current unfrozen subject for local forward
repair. No reset or design re-entry is warranted.

### F1 - High - C-call rehydration poisons nominal brands

Path: `code/src/abg/c_call.ts`, rehydration functions.

Counterexample: reconstruct a valid C-call/result/judgment after its judgment
availability has been consumed. Rehydration adds the reconstructed objects to
`cCalls`, `admittedResults`, and `admittedJudgments` before currentness fails
and the function returns `null`. The same objects can subsequently satisfy the
nominal predicates.

Violated relation: failed reconstruction must not mutate authenticity state;
process-local membership cannot overrule consumed Event Calculus truth.

Disposition: local repair before branding, preferably removing replay
authenticity dependence on nominal brands.

### F2 - High - Private latest-event folds author route currentness

Paths:

- `code/src/abg/closure.ts`;
- `code/src/abg/graph_application.ts`.

Counterexample: admit a valid target route `R1`, then an unrelated later
same-frame route `R2`. Closure uses `at(-1)` and child foldback uses
`reverse().find()`, so collection position can replace the target route without
a declared Event Calculus effect.

Violated relation: the exact replay-projected route availability for the locus
must decide closure/foldback currentness. Event Calculus over the explicit
validated prefix is the sole currentness relation.

Disposition: local forward repair, no design re-entry.

### F3 - Medium - Application-foldback projector schema is open

Path: `code/src/abg/graph_application.ts`.

The projector checked event kind, ref, digest, and fluent before casting the
payload to `ApplicationChildFoldbackAdmission`. The reviewer alleged that the
generic event family could therefore cross the owner boundary without the
closed application payload.

Violated relation: a generic child-completion event cannot acquire GTL
application recursion meaning through an owner projector.

Disposition: exact application schema/discriminator validation.

### Other cold-review dispositions

- The unstaged worker delta structurally repairs deferred resurrection and
  inactive-cursor route admission.
- AX-F08 is improved but cannot close proof while the confirmed negatives are
  absent.
- Terminal retry leakage was not reproduced as a distinct current defect.
- Caller-authored continuation currentness was not confirmed; broader
  continuation migration remains open.
- Process-local Public state is a confirmed pre-existing Wave 1 gap, not a
  regression caused by the reviewed commits.
- T-287 staleness is a tracking defect distinct from the semantic findings.

## Entry 007 - F_H Adjudication Returned To Worker

Source: Codex F_H proxy.

F1: accepted as High. Required outcome: stale/failed reconstruction performs
zero nominal-authenticity mutation. Add a same-object post-failure negative.

F2: accepted as High. Required outcome: closure and child-foldback select exact
route/current-route truth through scoped replay plus Event Calculus, never
collection tail position. Add `R1` target plus unrelated later `R2`
counterexample and paired control.

F3: partially accepted as Medium. The worker's executable generic event
negative rebutted the reviewer's exact no-`applicationRef` example. The broader
schema defect remains: a payload containing `applicationRef` but missing other
application-specific fields can reach the cast. Required outcome: validate the
complete closed application-foldback payload and add the incomplete-payload
negative while retaining the generic negative.

The worker was told to keep one bounded corrective candidate, run focused
proof before whole-suite proof, freeze once, and return it for independent
re-review. No next feature cone is authorized until this candidate is accepted.

## Append Protocol

Future entries append below this line. Each entry records:

- timestamp and speaker role;
- exact frozen subject when one exists;
- findings or implemented outcomes;
- F_H adjudication;
- evidence and disposition;
- next authorized transition.

## Entry 008 - Worker Implements Cold-Review Amendments

Timestamp: `2026-08-03T16:40:39Z` checkpoint window.

Source: implementation worker.

The worker reported all three adjudicated amendments implemented without
feature expansion:

- F1: ordinary C-call rehydration checks
  `c_call_judgment_available`, and pending F_H rehydration checks
  `interaction_pending`, before any nominal branding. A stale post-route
  same-object negative returns `null` and leaves all three nominal predicates
  false.
- F2: closure selects the supplied route by exact replay route, C-call,
  judgment, and source coordinates and requires terminal-route Event Calculus
  availability. Application child foldback selects the exact scoped replay
  route and requires the declared terminal or blocked lifecycle fluent. Paired
  controls add an unrelated later same-frame route and preserve exact `R1`.
- F3: the application-foldback projector validates the exact closed body key
  set and field types. The generic no-`applicationRef` negative remains, and a
  new incomplete payload carrying `applicationRef` also projects `null`.

Focused evidence reported:

- build: pass;
- Event Calculus: `9/9` pass;
- recursion: `3/3` pass;
- R9 exact-route control and later-route counterexample: pass;
- `git diff --check`: pass;
- candidate artifact basis:
  `sha256:909c2aed4ac8565c091712672c2a7eb366623366468a12cdb495bbb640749175`.

The candidate is not yet frozen. The worker proceeded to conservation,
R1-R10, and full M5 qualification. No commentary, design, or ticket surface
was edited by the worker.

## Entry 009 - Corrective Candidate Frozen

Source: implementation worker.

The bounded corrective candidate was frozen over base HEAD `a1fa19f6` with no
feature expansion.

Evidence:

- build: pass;
- Event Calculus: `9/9` pass;
- recursion: `3/3` pass;
- exact R9 route-selection counterexample: pass;
- 4.6 conservation: `62/62` pass;
- R1-R10: `13/13` pass;
- full M5: `190/190` pass;
- governor: `root_satisfied`, all R1-R10 true, no frontier or failures;
- `git diff --check`: pass.

Candidate identity:

```text
base HEAD: a1fa19f6
artifact: sha256:909c2aed4ac8565c091712672c2a7eb366623366468a12cdb495bbb640749175
product content: sha256:459f05be8546c06aabc5c49f7eba2ff14cf9fcc884cd65461faca3abca68a6d9
manifest: sha256:c8582bd6618fe221f7f2d806a36352e9da4f1afa40c887301ac8c107a994fb83
code, tests, and workers patch: 7b65fc92e008211ebb8354440b33b99695d1f59d246fec5f69128e041f35447c
```

The subject remains uncommitted. The worker stopped editing.

## Entry 010 - New Cold Re-review Started

Source: Codex F_H proxy.

A new clean read-only Codex reviewer was started rather than reusing the
reviewer that produced F1-F3. It received live constitutional/design/ticket
authority, base `a1fa19f6`, the complete frozen diff, and six counterexample
classes. It received no authority to edit, commit, reset, update tracking, or
message the worker.

Checkpointing remains held pending this independent verdict and F_H
adjudication.

## Entry 011 - External Monitor Follow-up Received

Source: separate monitoring session, supplied by F_H.

The follow-up was partly stale mechanically: full M5 had already completed at
`190/190` and the worker had frozen the candidate. Its semantic claims were
re-evaluated against the frozen live code.

The monitor alleged:

- stale T-287 invocation-only selection did not authorize the multi-module
  correction;
- terminal deferred execution could append truth before inactive-route
  rejection;
- an advance recursion route remained applicable after Run/frame termination;
- branded C-call carriers remained nominally admitted after availability was
  consumed;
- dynamic Event Calculus `run_stopped` omitted retry termination;
- continuation Public admission trusted caller-supplied lifecycle status before
  durable validation;
- foldback schema accepted empty semantic references.

## Entry 012 - Second Cold Review Verdict

Source: new clean read-only Codex reviewer.

Verdict: candidate not safe to checkpoint; one High local repair.

`hog/execute.ts` exported and owned
`projectCurrentDeferredApplicationCompletion`. It scanned raw store arrays,
selected a history cut by `findIndex`/`slice`, and minted an
`application_ready` currentness carrier. This made HoG a rival runtime-truth
projector. The fresh-process test reopened identical arrays and therefore did
not prove independence from that selector.

Required relation: ABG selects the validated Run prefix, derives the admitted
historical coordinate, and owns the typed Event Calculus/replay projection.
HoG consumes that projection only.

The reviewer found the previously requested six falsifications otherwise
structurally covered and reported focused tests and diff-check green.

## Entry 013 - F_H Consolidated Adjudication

Source: Codex F_H proxy live-code review.

Accepted:

- Cold High: move deferred currentness projection and prefix selection from HoG
  to ABG; add unrelated-event interleaving invariance.
- Terminal deferred paths must prove current Run, frame, source locus, and
  availability before any effect or refusal append.
- Advance recursion projection must require current Run and frame as well as
  active target locus; later termination makes it non-current.
- Dynamic `run_stopped` must terminate the retry fluents declared by the static
  Event Calculus law.
- Continuation Public admission must reconstruct durable lifecycle before
  admitting `public_operation_admitted`; caller status is only a candidate.
- Foldback semantic references must be non-empty as well as type- and
  key-correct.
- T-287 requires a minimal durable current-slice correction before this
  multi-relation semantic work can be accepted. The accepted checkpoint remains
  `1f6a860` until a reviewed candidate is accepted.

Qualified:

- Nominal C-call brands may represent historical admission and need not become
  false after consumption. They may not decide runtime currentness. Reachable
  runtime consumers must use store-aware ABG projections instead.

Disposition: reject the frozen candidate for one bounded forward repair. No
reset, Product reprice, requirement reprice, or design re-entry. The worker
received these outcome-level findings and retains implementation ownership.

## Entry 014 - Authority Tracking Corrected And Axiom Audit Added

Source: implementation worker and Codex F_H proxy.

The worker first corrected T-287 as required. Selected feature `A5-F10` and
accepted checkpoint `1f6a860` remain unchanged. The selected/current slice now
names the bounded runtime-truth review, repair, and freeze across C-call,
closure, recursion, foldback, route, continuation, and retry. No delivery
checkbox changed and no acceptance or closure was claimed. Semantic repair then
resumed.

The F_H proxy identified a review-orchestration defect: the second cold review
was independent but its falsification set was too tightly centred on the first
repair. It found the HoG-owned rival projector, but did not construct a complete
affected-relation census across retry, continuation, empty semantic values, and
all adjacent consumers.

A separate clean read-only axiomatic closure auditor was started. Its mandate
is function-to-global enumeration of every affected entity lifecycle,
producer, admission event, Event Calculus effect, projector, consumer,
consumption/supersession rule, and competing path. It must mutate empty values,
duplicates, interleaving, cross-scope substitution, pre-effect refusal,
terminal state, consumed reuse, restart, raw ordering, nominal brands, and
static/dynamic Event Calculus parity. Its results are inputs to the next frozen
candidate review; it cannot accept or edit the moving worker surface.

## Entry 015 - Offline Resume And Axiom-Audit Disposition

Source: implementation worker, independent axiom auditor, and Codex F_H proxy.

The worker froze a new bounded candidate over HEAD `a1fa19f6` after correcting
T-287 without advancing its accepted checkpoint or checkboxes. Reported
evidence was build green, Event Calculus/foldback `11/11`, recursion `3/3`,
conservation `62/62`, R1-R10 `13/13`, full M5 `192/192`, governor
`root_satisfied`, and `git diff --check` clean.

Reported identity:

```text
artifact: sha256:96d9bb4a453ede80dfba297f0a6c0d9f37b0ba7e2a666aef7c1544b3a9d6fa8d
product content: sha256:3bc321285996278f0b16c5d98694ec99f10e30d5a662f31d67f679edbc062e00
manifest: sha256:8c66aa3e51a3f137de2409518f3f78d4156e5dc58576d542d1a4cfe471246ef4
```

The independent axiom auditor had inspected an earlier moving snapshot and
reported two High findings. F_H rechecked both against the final frozen code;
both survived:

1. Blocked child route projection still required `frame_blocked`, but the
   immediately causal `run_stopped` terminates that fluent. The durable blocked
   child proof must use the exact blocked route plus its matching terminal Run
   lifecycle, not the transient frame state.
2. Contextual same-Run retry termination was added in the Event Calculus fold,
   but terminal events still left exact same-Run `locus_active` fluents held.
   A terminal Run therefore did not imply complete subordinate-locus closure.

Disposition: reject the `192/192` candidate for one bounded forward repair.
The worker received both outcome-level counterexamples with unrelated-Run
controls. The accepted checkpoint and checklist remain unchanged. No reset or
design re-entry was authorized.

## Entry 016 - Consensus Review Experiment Selected

Source: direct F_H decision and Codex execution protocol.

The next frozen candidate will receive two blind independent assurance
judgments over the identical candidate, governing basis, and falsification
contract:

```text
Reviewer A: Max reasoning
Reviewer B: XHigh reasoning
```

Neither reviewer may see or consume the other's findings before both freeze.
Both are read-only and may not edit, commit, reset, update tracking, or direct
the worker. The F_H proxy will preserve both evidence sets, adjudicate every
finding against live code, and record overlap, valid unique findings, false
positives, severity accuracy, and review duration.

This is Consensus evidence, not majority voting. A disagreement remains
evidence of reasoning-depth sensitivity, authority ambiguity, or incomplete
falsification coverage. Acceptance requires the adjudicated candidate to
conserve the governing relations; reviewer agreement alone is insufficient.

The worker was informed of the protocol but will not consume or anticipate the
review prompts. It remains limited to H1/H2 repair and freezes one exact subject
before either reviewer starts.

## Entry 017 - H1/H2 Candidate Frozen And Consensus Pair Started

Source: implementation worker and Codex F_H proxy.

The Max worker froze the H1/H2 candidate exactly once over base
`a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99`.

Qualification:

- Event Calculus: `12/12` pass;
- installed recursion: `3/3` pass;
- conservation: `62/62` pass;
- R1-R10: `13/13` pass;
- full M5: `193/193` pass;
- governor: `root_satisfied`, zero failures;
- `git diff --check`: clean.

Frozen identity:

```text
artifact: sha256:e66199168c33c29f3a4fcbfdcbb278924d22919ebe92762279f6e8b1e580cc3b
product content: sha256:55b7aba184379a299e9ea55c5248155d37d207e464eb1ede7a6a196f563b3a7f
manifest: sha256:947b504d2cbd9fc5af7b47336eebad176e3dd4494ed78f05ecdf986def2e4078
intended binary patch: sha256:abac6114b6bbf36879dc7b917437a79dc98f4331f789246f47118a6506bfe9c1
```

The worker stopped editing and did not start or consume reviews.

The F_H proxy then started two clean blind read-only reviewers simultaneously
over the identical frozen identity and identical review contract:

- Consensus Reviewer A: `gpt-5.6-sol`, Max reasoning;
- Consensus Reviewer B: `gpt-5.6-sol`, XHigh reasoning.

Both received the same authority bootstrap, affected-relation census,
mutation set, H1/H2 counterexamples, inspection scope, and reporting contract.
Neither can access the other's output. Checkpointing remains held until both
judgments freeze and F_H adjudicates their combined evidence.

## Entry 018 - Blind Consensus Judgments Frozen

Source: independent Consensus Reviewer A and Reviewer B.

Both reviewers reverified the identical base, patch, artifact, Product-content,
and manifest identities. Both returned `reject` and `safe checkpoint: no`.
Neither edited the repository or consumed the other review.

### Reviewer A - Max

Elapsed: `27m05s`.

Findings:

1. Critical: closure appends terminal/frame/graph-call/Run closure effects after
   an already failed Run. Executed counterexample appended four events.
2. Critical: `hasCurrentAdmittedCCallOutcome` represents historical replay
   identity, not Event Calculus currentness; failed Run could still admit a
   route and C-call evidence.
3. High: blocked-child foldback remains effectfully reachable after
   `run_stopped` terminalizes the shared Run.
4. High: deferred application exports contradictory `current` APIs; projection
   may return current while the separate authority predicate is false.
5. High: continuation remains open/Public-admissible after Run failure because
   terminal Run lifecycle does not abandon/supersede it.
6. High: retry cleanup covers `run_stopped` but not
   `runtime_failure_observed` or `run_closed`.

Reviewer A recommended local repair for bounded producer defects and re-entry
for the missing C-call/continuation lifecycle network.

### Reviewer B - XHigh

Elapsed: `16m35s`.

Findings:

1. Critical: the global terminal barrier is open across foldback, closure,
   retry, generic route, continuation, and interaction producers.
2. High: consumed historical C-call truth is named current and reused by
   producers; the candidate's own fresh-process assertions expose the
   contradiction.
3. High: static/dynamic Event Calculus parity is false for
   `c_call_judged -> retry_attempt_active`; an executed minimal prefix left the
   retry attempt held.

Reviewer B classified the authority as settled and recommended bounded local
repair rather than design/specification re-entry.

### Preliminary Comparison

- overlap: terminal barrier, closure, blocked foldback, C-call historical versus
  current truth, generic route/continuation/retry producer currentness;
- Max-only granularity: contradictory deferred-current API and retry leakage
  across failure/closed terminal kinds;
- XHigh-only explicit counterexample: `c_call_judged` static/dynamic retry
  termination divergence;
- XHigh completed about `38.8%` faster than Max;
- both found checkpoint-blocking defects, so this first sample does not select
  a future default.

The worker remains held. F_H adjudication must now determine which findings are
duplicates of one terminal-barrier defect, which are local producer repairs,
and whether the shared-Run blocked-child plus missing C-call/continuation entity
lifecycle requires bounded design re-entry.

## Entry 019 - Reasoning-Effort Operating Decision

Source: direct F_H decision.

The next clean construction worker will use XHigh reasoning. The next frozen
candidate will again receive one blind Max and one blind XHigh review under an
identical contract.

The first sample does not justify removing Max: XHigh was about `38.8%` faster
and found the major blockers, but Max supplied additional valid lifecycle
decomposition. XHigh also supplied a unique explicit parity counterexample.

After two or three comparable samples, routine Max review may be removed if
XHigh consistently matches it on valid High/Critical findings. Max remains the
default at feature, wave, release, and constitutional boundaries unless later
evidence reprices that decision.

## Entry 020 - Active Role Assignment Clarified

Source: direct Product-authority clarification and Codex F_H update.

The Consensus methodology previously defined role capabilities without
assigning this live session to a role. That was insufficient for recovery after
context loss and allowed a reader to infer authority from the post itself.

The active binding is now:

```text
Product authority: Jim
F_H proxy, executive adjudicator, status reporter, append-log maintainer,
and accepted-checkpoint administrator: /root
current XHigh implementation worker: /root/wave1_terminal_barrier_xhigh
completed Reviewer A: /root/consensus_max_review
completed Reviewer B: /root/consensus_xhigh_review
```

`/root` must not implement or repair candidate semantics. The worker must not
review or accept its own candidate. Reviewers are read-only, do not maintain
the log, do not direct the worker, and have no standing assignment beyond their
exact frozen subject. New reviewers require a new recorded binding.

## Entry 021 - XHigh Terminal-Barrier Design Candidate Frozen

Source: `/root/wave1_terminal_barrier_xhigh`.

The XHigh construction worker froze a design/coding-plan candidate only. It
made no production or test edit and ran no realization tests.

```text
subject: .ai-workspace/comments/codex/20260804T025847Z_STRATEGY_t287_terminal_run_barrier_design_reframe.md
base: a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99
SHA-256: 0ac92d829d315b8b0686e331b5486878779e5bde84a2ebd042a31857a2959895
Git blob: d1dd98d02350666fe5163e5e178e2b329164a8bf
accepted checkpoint retained: 1f6a860
```

The candidate chooses one shared parent/child Run, makes return-to-parent child
blocked/failed truth subordinate rather than Run-terminal, proposes one typed
historical/current transformation relation, completes C-call, continuation,
retry, closure, and deferred lifecycles, and supplies a producer/consumer
census, migration order, falsifiers, and proof gates. It remains unassessed and
grants no implementation authority.

## Entry 022 - Design Consensus Review Started

Source: Codex F_H proxy.

The frozen design candidate entered the selected blind Max/XHigh Consensus
method. Reviewer A (Max) started with the exact subject identity and a design-
level review contract covering Prime contraction, modular decomposition, owner
seams, constructability, proportionality, terminal lifecycle closure,
transaction feasibility, migration reachability, and risk of a cross-owner
controller or speculative framework.

Reviewer B (XHigh) is queued on the same identical blind contract because the
local agent concurrency limit was occupied. It will start after a slot opens
and will not receive Reviewer A's output. Implementation remains held.

## Entry 023 - Consensus Design Rejected And Review Configuration Repriced

Source: blind Max reviewer, blind XHigh reviewer, and Codex F_H proxy.

Both blind reviewers rejected the frozen design. They independently converged
on the cross-owner availability controller, incomplete cross-Run continuation
and retry relations, incomplete entity lifecycles, missing Run-quiescence law,
and insufficient Prime/realization evidence. The F_H proxy returned one
consolidated correction contract to the XHigh construction worker. Production
implementation remains held.

The active reasoning configuration is now:

```text
construction worker: XHigh
blocking independent reviewer: XHigh
parallel depth reviewer: Max, blind and non-blocking
F_H comparison and adjudication: /root
```

The candidate may advance after its blocking XHigh review and F_H disposition
without waiting for Max. A later valid material Max finding stops work at the
next safe boundary. Max remains read-only and supplies independent depth
evidence; it does not implement, direct the worker, or accept the candidate.

## Entry 024 - Independent Delivery Teams Activated

Source: Jim and Codex F_H proxy.

The execution model changed from one serial worker to independent teams joined
at frozen authority seams. The enduring team and restart rules are recorded in
`20260804T023036Z_METHOD_consensus_assurance_independent_reasoning_depth_review.md`.

Active allocation at this transition:

```text
runtime team: /root/wave1_terminal_barrier_xhigh
catalog and artifact preparation: /root/w1_1a_delivery
fresh-process proof preparation: /root/wave1_phase0_clean
blocking assurance: /root/replacement_design_xhigh
F_H and integration: /root
Max depth assurance: queued when capacity permits
```

The runtime design composition currently ends with the frozen overlay SHA-256
`49ca598c60a815b532f02503c6c1a409bdd58d9f4dbd2247574f90206d410b64`.
Its blocking XHigh review is active. Preparation teams are read-only until the
F_H proxy assigns exact disjoint implementation manifests.

## Entry 025 - Retry-Completion Production Relation Closed, Authentic Proof Held

Timestamp: `2026-08-06T22:14:00+10:00`

Source: independent Max reviewer `/root/wave1_retry_export_max_review`.

The reviewer examined the live retry-completion delta and classified the
production direction as closed but the candidate as narrowly rejected for
proof authenticity. It confirmed these relations in the moving tree:

- HoG traversal, ABG route construction, and retry completion consume the one
  common continuation-target derivation;
- completion requires a nominal materialized Graph and binds the exact basis
  graph reference and digest;
- the event schema closes retry-attempt, retry-progress, and completed-progress
  variants;
- retry projection recursively reconstructs the attempt, C-call, result,
  judgment, and predecessor chain from an explicit validated prefix;
- completion preflights all exited attempts and appends inner-to-outer progress
  atomically; and
- route admission selects the outermost completion as primary cause and
  consumes the complete progress set.

The remaining blocker was the positive nested-retry proof. Its prior form
authored runtime events and identities in the test, so it did not prove that a
real installed GTL definition produces and consumes the multi-depth relation.
The reviewer required an installed Public/CLI execution with no raw positive
event construction.

## Entry 026 - F_H Bounded Nested-Carrier Authorization

Timestamp: `2026-08-06T22:16:00+10:00`

Source: Codex F_H proxy adjudication.

The F_H proxy accepted the review finding and authorized one realization-only
change to the unreleased 5.0 source candidate:

```text
FP_RETRY_HELLO:
  C.retry(C.of(...), 2)
    -> C.retry(C.retry(C.of(...), 2), 2)
```

The graph-function handle and input/output contract remain unchanged. The
source change must produce new definition, materialization, and Product
digests through the ordinary build. It does not mutate a frozen installed
Product. The authorization excludes a new catalog entry, Public operation,
raw positive runtime event, or second retry family.

The required proof drives the existing installed Public/CLI path, observes
atomic inner-to-outer completion rows, binds exact identities and predecessor
causation, selects the outermost row as route cause, consumes all retry
authority, proves quiescence, and reproduces the same projection after durable
reopen. Existing direct HoG coverage retains flat-retry parity.

STDO `2.3.1` remains a separate unfinished upstream candidate in
`specification_methodology`. ABIogenesis continues under its currently
installed standard and local authority until `2.3.1` is independently
reviewed, released, and deliberately adopted.

## Entry 027 - F_H Moving-Surface Retry Contract Findings

Timestamp: `2026-08-06T22:23:00+10:00`

Source: Codex F_H proxy live-code review before freeze.

The moving implementation produced an authentic installed nested execution:
outer attempt `[1]`, inner attempts `[1,1]` and `[1,2]`, atomic completed
progress inner then outer, outer completion immediately caused by the inner
completion, and a terminal route that used the outer row as primary cause and
consumed both rows. Build and typecheck passed. This is evidence of real local
movement, not candidate acceptance.

The live review then found two local owner-contract defects before the
expensive qualification boundary:

1. `admitRetryProgress` could append caller-supplied basis causations after the
   exact attempt and judgment causes, while `projectRetryProgressAt` accepted
   exactly two causes. A non-empty basis could therefore produce an admitted
   row that its own projector rejected. `admitRetryAttempt` carried the same
   arbitrary-cause risk after its route cause.
2. The declared retry vocabulary contains `contract_failure`, `no_output`,
   and `transport_failure`, but the durable provenance predicate accepted only
   `contract_failure`. The other declared classes could not be reconstructed
   as valid progress despite `REQ-R-ABG3-RETRY-008` and the event contract.

The F_H proxy returned a bounded correction: make owner causation exact and
prove the non-empty-basis counterexample; reconstruct `no_output` and
`transport_failure` from the existing admitted actor/process observations and
terminal relations, or report an exact authority impossibility. No new event
family, controller, Product surface, catalog path, or design re-entry is
authorized. The Max worker accepted both findings and retained the freeze
hold.

## Entry 028 - Runtime-Failure CCall Scope Review And F_H Amendment

Timestamp: `2026-08-06T22:29:00+10:00`

Source: independent Max reviewer `/root/wave1_frozen_max_review`, followed by
Codex F_H proxy adjudication.

The worker proved that the transport-class gap originates upstream of retry:
the current CCall owner closes `no_output` and `transport_failure` as ordinary
admitted failures with blocked judgments, while `completeRejectedCCall` is
specifically an admission-refusal relation whose reason is a different
diagnostic identity. A retry projector cannot lawfully repair that split.

The independent reviewer found the correction already authorized by A5-F10,
bounded `C.retry`, and the accepted CCall/retry designs. It is a realization
correction, not a new Product outcome. The reviewer required this exact
boundary:

```text
validated immutable prefix
+ admitted probabilistic evidence
+ exact actor/process terminal projection
  -> CCall owner derives failure class and stable semantic failureSignalRef
  -> retry eligibility evaluates allowlist, budget, stationarity, and input
  -> one atomic suffix:
       retryable:
         c_call_result_admitted(failure)
           -> c_call_judged(retry, reasonRef = failureSignalRef)
           -> retry_progress_recorded
       stopped:
         c_call_result_admitted(failure)
           -> c_call_judged(blocked, reasonRef = failureSignalRef)
```

`completeRejectedCCall` is not reused for transport failure. A typed refusal
inside the event-store transaction must throw into rollback rather than return
and accidentally commit a partial suffix. The signal is content-derived from
stable admitted failure semantics and excludes event refs, timestamps,
ordinals, and run/call/attempt/process identities.

The deciding counterexample is stationary failure: identical `no_output` or
transport failures on attempts one and two must derive the same signal and
stop before attempt three; materially different failure semantics must derive
a different signal. The F_H proxy accepted these corrections and authorized
the minimal CCall-owner plus HoG realization. No new event kind, controller,
retry loop, Public operation, catalog surface, or design amendment entered the
scope.

## Entry 029 - Commonized Failure Projection And Remaining Attempt-Lifecycle Hold

Timestamp: `2026-08-06T22:57:00+10:00`

Source: Codex F_H proxy live-code review; targeted independent Max delta review
requested from `/root/wave1_frozen_max_review`.

The moving repair removed two rival realization seams before freeze. The
actor/process/evidence join is now one pure validated-prefix projector reused
by live evidence admission and durable runtime-failure reconstruction. Worker
transport classification is now one pure function beside the neutral
transport vocabulary and is consumed by both execution and replay. No plan
`WeakSet` or duplicate retry/CCall failure allowlist remains.

The CCall failure result now preserves the original diagnostic and candidate
digest while carrying a distinct stable `failureSignalRef` and
`failureSourceRef`. Replay re-derives the admitted source and checks the
pre-enrichment candidate digest rather than treating a diagnostic as the retry
signal. The retry owner now stages CCall evidence/result/judgment and retry
progress inside one exact-prefix event-store transaction and throws any
projection failure into rollback. This moving relation has not yet passed its
focused tests and is not frozen.

One remaining lifecycle contradiction holds the cut. The current stopped
branch for stationary or budget-exhausted failure writes a blocked CCall
judgment but no `retry_progress_recorded` row. Event Calculus therefore leaves
the exact `retry_attempt_active(attemptRef)` fluent live. This contradicts the
accepted retry lifecycle, where the judged attempt must be consumed before a
blocked route or terminal stop. The F_H proxy returned only this local repair:
use the existing admitted lifecycle, consume the exact attempt atomically,
and prove stationary and budget-exhausted cases leave no active retry and
never open attempt three. No new event kind, controller, or design re-entry is
authorized.

STDO `2.3.1` remains upstream and non-governing until independently reviewed,
released, and deliberately adopted by ABIogenesis. Its pending admission-owner
amendment is consistent review guidance but cannot silently change this
candidate's authority.

## Entry 030 - Durable Retry-Input Preimage Is A5-F10 Freeze-Critical

Timestamp: `2026-08-06T23:06:00+10:00`

Source: independent Max reviewer `/root/wave1_frozen_max_review`, followed by
Codex F_H proxy adjudication.

The targeted review confirmed that full automatic restart orchestration may be
scheduled later, but the durable executable-input preimage cannot be deferred
from the present retry-truth cut. Product A5-F10 requires replay rather than
caller memory to derive the next execution state. GOALS and T-287 require
runtime recovery, migrated retry truth, and deterministic fresh-process
equality. The accepted S06 Section 7.3 relation requires
`retry_attempt_opened` to preserve canonical `inputValue` inside the attempt
digest and prove `sha256Canonical(inputValue) = inputDigest`.

The moving implementation still exposes only `inputRef`, `inputDigest`, and
`inputContractRef` in `RetryInputBasis` and the retry-attempt event. HoG retains
the executable value in process-local state. A restarted process therefore
cannot reconstruct the retry input from the admitted prefix, so this cut
cannot freeze as migrated A5-F10 retry truth.

The F_H proxy authorized only the proportional existing-carrier closure:

```text
retry_attempt_opened
  + canonical inputValue
  + inputDigest = sha256Canonical(inputValue)
  + attemptDigest covers the complete preimage
  -> validated-prefix projection reconstructs RetainedRetryInput
```

No new event kind, content store, Map authority, controller, or broad restart
orchestration is authorized. Process-local retention may remain only as a
deletion-neutral cache proven equal to the durable projection. The worker may
continue focused CCall and stopped-progress testing while adding this exact
carrier relation; freeze remains held.

## Entry 031 - Cold Review Removes Two Remaining Competing Retry Seams

Timestamp: `2026-08-06T23:15:00+10:00`

Source: non-blocking independent Max reviewer
`/root/wave1_retry_export_max_review`, followed by Codex F_H proxy
adjudication.

The cold moving-tree review accepted the common classifier, exact
actor/process/artifact join, content-addressed prefix-bound failure plan,
basis/Graph/cursor/attempt validation, rollback transaction, post-append
projection, and closed retry/stopped schemas. It found two remaining competing
seams before freeze.

First, `progressClass = stopped` terminated the attempt, but HoG passed only
result, judgment, and reason to the blocked-route owner. The route therefore
consumed only the judgment. Root execution happened to receive later
`run_stopped` cleanup, but `terminalMode = return_to_parent` has no root stop,
so stopped retry-progress truth remained available after the child block. The
accepted local correction carries the exact stopped progress through blocked
evidence, makes it the route cause, consumes both judgment and progress, and
proves the root and child-return paths leave no stopped progress.

Second, the installed ABG index still exported the legacy standalone
`admitRetryProgress`. That callable preserves the old non-atomic
close-then-progress path beside the new complete transition owner and cannot
represent stopped progress. The F_H proxy selected the atomic relation as the
single reachable authority: remove the legacy export and standalone path,
migrate its falsifier/test consumers, and retain `completeRejectedCCall` only
for non-retry rejection. The minimal accepted-design wording that still names
the separately callable two-step suffix must be reconciled before freeze; no
broad design rewrite is authorized.

These are deletions and exact joins, not a new retry architecture. The worker
continues the already authorized durable-input and route-consumption repairs.

## Entry 032 - Retry Owner Delta Pass; Freeze Held For Executed Counterexamples

Timestamp: `2026-08-06T23:31:00+10:00`

Source: independent Max reviewer
`/root/wave1_retry_export_max_review`, followed by Codex F_H proxy
adjudication.

The independent read-only delta review found no remaining code counterexample
in the four repaired relations:

1. stopped retry progress is exact, mandatory when present, causal, and
   consumed by the common blocked-route path for root and child execution;
2. the standalone `admitRetryProgress` implementation and installed export are
   gone, leaving one atomic failure-result, judgment, and progress owner;
3. retry input is carried by `retry_attempt_opened`, covered by its digest, and
   reconstructed from the validated durable prefix; and
4. late validation failure inside the exact-prefix transaction rolls the
   complete result, judgment, and progress suffix back.

This is a moving-delta code PASS, not a freeze or acceptance. The F_H proxy
keeps the candidate held until execution proves the dedicated child
`return_to_parent` reopened-prefix case, an injected late-failure zero-suffix
case, and the complete contract-failure, no-output, and transport-failure
stationarity/budget matrix. The worker must then run the complete installed
retry file, TypeScript check, and build and stop before freeze for final live
code audit. Full M5 remains deferred until an exact candidate passes that
audit.

## Entry 033 - Focused Proof Closure And Exact Retry-Runtime Freeze

Timestamp: `2026-08-06T23:54:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, Codex F_H proxy
live-code audit, and exact Git verification.

The bounded retry-runtime repair completed its focused proof boundary:

- complete installed retry file: `4/4` passed in `118453.82975 ms`;
- five authentic failure rows covered stable and changed
  `contract_failure`, stable `no_output`, and stable and changed
  `transport_failure`;
- reopened nonterminal blocked-route proof passed without relying on
  `run_stopped` cleanup;
- existing durable transaction rollback proof: `1/1` passed;
- TypeScript check and build passed; and
- built artifact, Product-content, and manifest digests exactly matched the
  tracked candidate-basis fixture.

The F_H proxy rejected two invalid proof constructions before this green cut:
an unbound store method that selected an empty prefix and an unrehydrated plain
CCall that refused before the transaction. The invalid owner-specific rollback
fixture was removed rather than relabeled. Atomicity evidence for this cut is
the exact owner code path through the existing rollback-proven transaction,
the malformed nested-completion zero-suffix proof, and the independent code
review of every return and throw path.

The exact frozen candidate is:

```text
commit  3e26227c65d74e574f0395e8d21f7643026834ca
tree    e1279f8083da3ef399c081702ddbcb066bddd9fa
parent  77673b64c67423f96096e80b3a29efdd409fb509
scope   19 tenant paths, +3437/-1237
```

The commit excludes the pre-existing root `AGENTS.md` and bootstrap-handoff
edits and every untracked commentary post. No full M5 ran and no post-freeze
edit occurred. Identical read-only review contracts were issued independently
to one Max reviewer and one xhigh reviewer. Reviewer agreement remains advice;
the Codex F_H proxy retains disposition authority.

## Entry 034 - Frozen Retry-Runtime Candidate Rejected; Five-Relation Repair

Timestamp: `2026-08-07T00:08:00+10:00`

Source: independent Max reviewer `/root/wave1_frozen_max_review`, followed by
Codex F_H proxy live-code adjudication. The independent xhigh review remains
active against the unchanged exact candidate.

Candidate `3e26227c65d74e574f0395e8d21f7643026834ca`, tree
`e1279f8083da3ef399c081702ddbcb066bddd9fa`, is rejected as closed
retry-runtime truth. Its valid input-carrier, atomic transaction, root-stop,
nested-success, and GTL commonization work remains the repair base. Full M5
did not run.

Four review findings are accepted exactly:

1. A nonterminal nested blocked return consumes only the innermost stopped
   progress. With no `run_stopped` cleanup, an enclosing retry attempt remains
   active in the exited blocked frame. The focused child-prefix test did not
   assert this enclosing fluent.
2. Installed `completeRejectedCCall` still accepts caller-selected `retry` and
   can write a retry judgment without the atomic progress transition. No live
   production caller selects it, but the reachable installed rival relation is
   itself forbidden.
3. The new failure-transition planner depends on `cCalls`,
   `admittedEvidence`, and `admissionRejections` WeakSet membership. An exact
   event-backed carrier reconstructed in a fresh process therefore refuses
   despite matching durable truth.
4. Stationarity uses any historical matching signal. For the lawful sequence
   `A -> B -> A`, attempt three is incorrectly stopped even though the
   immediately preceding signal is `B`.

The fifth finding is accepted with a modular construction correction. The
candidate silently weakened accepted retry-attempt wording from preserving the
complete source cursor to binding it indirectly through a route, while
`projectRetryAttempt` still requires a caller-supplied cursor. The repair must
not duplicate an already-admitted cursor merely to create another truth copy.
It must close the prefix-only join:

```text
retry attempt -> cited admitted retry route -> admitted source cursor
```

The resulting projector reconstructs the complete attempt carrier from the
validated immutable prefix plus attempt identity. A caller cursor, if
accepted at all, is only a proposal checked against that projection. The S06
wording must state this exact composition rather than silently weaken the
carrier.

One bounded Max repair was authorized immediately against the rejected cut:
exact scoped stopped-progress closure, deletion of caller-selected retry from
`completeRejectedCCall`, event-derived failure provenance, immediately-prior
stationarity, and prefix-only attempt reconstruction. Red counterexamples
precede production changes. Catalog, Public family, methodology, unrelated
A5-F10, full M5, and freeze remain held. The independent xhigh review may add
relations to this repair but cannot accept the candidate.

## Entry 035 - Xhigh Consensus Adds Missing Retry Success Forms

Timestamp: `2026-08-07T00:14:00+10:00`

Source: independent xhigh reviewer `/root/wave1_frozen_xhigh_review`, Codex
F_H proxy adjudication, and targeted cross-review requests.

The xhigh reviewer independently rejected the exact frozen candidate and
matched the Max reviewer on two high-confidence blockers: the installed
`completeRejectedCCall(..., "retry")` rival and any-historical rather than
immediately-prior stationarity. This agreement raises both relations above a
test-interpretation dispute.

The xhigh pass added one current-delta relation missed by the first review.
`C.retry` lawfully accepts every `CProgramNode`, but the candidate closes retry
depth only on the leaf-success path. Successful `c_workflow` execution and the
deferred `application_ready` path reach judged-route admission without first
admitting and supplying the completed retry-progress rows required for every
exited retry depth. The child effect can therefore succeed before the route
refuses. The F_H proxy added this to the bounded repair with one construction:
all successful retry exits use the common completed-progress derivation and
atomic owner; no node-specific retry semantics are permitted.

The reviews differ on the nonterminal nested blocked prefix. Max reports an
outer active retry left in a blocked frame; xhigh initially called existing
nonterminal behavior a pass. The F_H proxy has not resolved that disagreement
from vote count. A targeted xhigh trace must decide whether the outer attempt
is a lawful live parent continuation or orphaned authority after the actual
production foldback. A targeted Max trace is independently checking the new
workflow/deferred-success finding. The worker may write the red cases and
common repairs, but must not freeze until both cross-checks are adjudicated.

## Entry 036 - Cross-Review Converges On Six Exact Repair Relations

Timestamp: `2026-08-07T00:20:00+10:00`

Source: targeted read-only cross-reviews by
`/root/wave1_frozen_max_review` and `/root/wave1_frozen_xhigh_review`, followed
by Codex F_H proxy adjudication.

The Max reviewer independently confirmed the xhigh-only success-exit finding.
`admitCompletedRetryProgress` has one production caller: ordinary leaf
success. A lawful retry-wrapped workflow can durably complete its child,
parent result, and judgment before route admission rejects the absent
completed-progress suffix. The deferred application terminal path has the
same defect. There is no later compensating owner. This is one common
retry-success exit defect, not two node-specific designs.

The xhigh reviewer independently confirmed all three Max-only relations:

- after a nonterminal nested child block, parent foldback terminates the child
  frame and graph-call fluents but not its enclosing retry attempt; that
  attempt is orphaned until an unrelated later run-wide stop hides it;
- a durable evidenced CCall prefix cannot resume the new atomic failure owner
  after process restart because the owner requires three process-local
  WeakSet brands; and
- the accepted complete-frontier request lawfully accepts immutable Program,
  GraphFunction, and Graph declarations, but does not accept a caller cursor.
  The owner must derive `sourceCursor` through the attempt's cited admitted
  route and event relations.

All six bounded repair relations now have independent support:

1. exact enclosing stopped-attempt closure for nonterminal block;
2. deletion of installed caller-selected retry closure;
3. event-derived CCall and failure-source provenance;
4. immediately-prior stationarity;
5. owner-derived retry cursor/frontier; and
6. one completed-progress exit relation for leaf, workflow, and deferred
   application success.

The F_H proxy keeps the architecture and broader wave closed. The worker is
authorized to turn these six counterexamples red, repair the common owners,
run focused proof only, and return a new candidate for live audit. Full M5 and
freeze remain held.

## Entry 037 - First Frozen Reds And Test-Subject Drift Rejected

Timestamp: `2026-08-07T00:37:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker` and Codex F_H
proxy live worktree audit.

The first red executed against the installed surface: the generated
`c_call.d.ts` and callable still exposed caller-selected retry disposition on
`completeRejectedCCall`. The moving repair deletes that disposition and fixes
the completion to `blocked`; no other production meaning entered that edit.

The worker initially tried to create the stationarity and alternate-success
proofs by wrapping the shipped Hello World workflow and recursion definitions
in `C.retry` and raising the shipped FP retry budget. The F_H proxy stopped and
rejected that construction before execution. A proof fixture may instantiate a
lawful Program through installed authoring APIs, but it may not mutate Product
semantics to manufacture its counterexample. Those uncommitted GTL edits were
removed exactly; their diffs are empty.

The corrected R4 falsifier ran in an isolated detached worktree at frozen
`3e26227c`. A dedicated test Product declared budget four and produced exact
contract-rejection signals `A -> B -> A`. Attempt three returned `blocked`
where the immediately-preceding law requires `retry`; the assertion reported
`'blocked' !== 'retry'`. This directly exercises the frozen `rows.some`
history defect without changing a shipped definition. The provisional moving
repair selects the immediately preceding failure in both eligibility and
progress projection; it remains unaccepted until the test is migrated and
green.

## Entry 038 - All Six Repair Relations Have Frozen Red Evidence

Timestamp: `2026-08-07T00:52:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, executing
test-only counterexamples against an isolated worktree at frozen
`3e26227c`. No frozen source file or shipped definition was modified.

The remaining frozen reds are exact:

- R1: in a nested stopped retry prefix before blocked routing or run stop, the
  inner stopped progress terminates its attempt but the enclosing attempt
  remains `retry_attempt_active`.
- R3: a structured clone of the exact admitted leaf CCall and probabilistic
  evidence refuses the atomic transition because module-local WeakSet brands
  are absent. A forged clone separately refuses with zero prefix effect.
- R5: `projectRetryAttempt(validatedPrefix, declaredGraph, attemptRef)` cannot
  run without a caller cursor; the frozen projector treats the attempt
  identity as a cursor and fails instead of joining through its cited route.
- R6 workflow: lawful `C.retry(workflow.C(...), 2)` completes the child and
  admits the parent advance judgment, then route admission returns
  `judgment_mismatch`; the outer attempt remains active and no parent terminal
  route exists.
- R6 deferred application: a production `recurseApplication` wrapped in
  `C.retry` reaches `application_ready`, admits leaf success and advance
  judgment, then fails identically at deferred terminal routing with the
  attempt still active.

Together with R2's installed signature red and R4's exact `A -> B -> A` red,
all six repair relations now fail on the rejected frozen subject before the
bounded production repair. The worker may now implement the common owners and
migrate the minimal durable tests. Full M5, freeze, and unrelated work remain
held.

## Entry 039 - Live Repair Review Catches Two Downstream Atomicity Seams

Timestamp: `2026-08-07T01:15:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, read-only Max
and xhigh sentinels, and Codex F_H proxy live code review of the moving repair
over rejected `3e26227c`.

The moving repair has implemented three relations directionally: caller-
selected `retry` is removed from `completeRejectedCCall`; retry stationarity
uses the immediately preceding failure for the boundary; and
`projectRetryAttempt` derives its cursor through the attempt's cited admitted
route. The complete inner-to-outer stopped-progress suffix and the common
success-exit path remain under construction. No focused replacement green or
new frozen candidate exists.

Live review caught two downstream seams before qualification:

1. The new leaf CCall projector reconstructs failure-close authority from the
   exact durable prefix, but blocked-route validation still reaches
   `hasOpenedCCall`. That relation requires the process-local `cCalls` WeakSet
   brand, so a fresh-process close may admit its atomic result, judgment, and
   stopped-progress suffix before route admission refuses. The correction is
   one common exact-prefix opened-CCall projection used by route evidence,
   composed from existing call-class reconstruction laws. No brand restoration,
   priming order, or parallel registry is permitted.
2. The common success helper now reaches leaf, workflow, and deferred
   application exits, but it commits completed-progress rows before route
   proposal and admission. Unless an installed owner can reconstruct and
   complete that intermediate durable prefix, a later route refusal leaves
   partial truth. R6 therefore requires either a proven deterministic re-entry
   from the intermediate prefix or, preferably, one prevalidated atomic
   completed-progress-plus-route transition.

The worker accepted both corrections. The first is being commonized at the
event-derived CCall projection seam. The second must be settled before R6 is
called complete. Full M5 and freeze remain held; the next proof is focused
typecheck plus the exact fresh-process close-to-route and success-exit
counterexamples.

## Entry 040 - Xhigh Sentinel Finds Raw Eligibility And Stale Oracle Drift

Timestamp: `2026-08-07T01:14:17+10:00`

Source: read-only xhigh sentinel `/root/wave1_frozen_xhigh_review`, followed by
Codex F_H proxy adjudication and immediate worker feedback.

The sentinel statically passed two moving relations. Retry-attempt projection
now derives its cursor through immutable attempt and causative route events,
and the stopped suffix is constructed deepest-to-outermost in one rollback-
capable transaction. Route evidence requires the exact ordered suffix,
predecessor chain, consumed refs, and causation; no omitted, substituted,
reordered, or additional suffix was found admissible.

Two defects remain before focused execution:

1. Eligibility still selects its predecessor from raw lifecycle rows, while
   the semantic progress projector selects the last successfully projected
   admitted progress. A structurally shaped but semantically invalid row can
   therefore alter eligibility, after which replay rejects the same row and
   the atomic transition rolls back. Both eligibility and replay must consume
   one projected admitted-progress sequence.
2. The migrated nested-route test passes one string to the plural
   `proposeBlockedRoute` argument and still supplies singular
   `stoppedProgress` evidence. The string is spread into characters as
   consumed refs, so the oracle cannot prove the new relation.

The F_H proxy returned both exact repairs to the active Max worker. No freeze
or full qualification is authorized until the semantic predecessor relation
and plural route oracle are corrected and executed.

## Entry 041 - Common Atomic Success Exit And Semantic Retry History Land

Timestamp: `2026-08-07T01:20:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, targeted Max
R6 review, and Codex F_H proxy adjudication.

The worker applied the two Entry 040 corrections. Eligibility now derives
prior progress, attempt coverage, the immediately preceding signal, and prior
refs through `projectAdmittedRetryProgress` and `projectRetryAttempt` rather
than raw lifecycle payloads. The nested-route oracle now passes the plural
progress-ref array and plural stopped-progress evidence.

The Max reviewer independently proved that separately committing completed
retry progress before route admission has no installed deterministic re-entry:
the progress rows terminate the active attempts, so rerunning normal completion
refuses before it can consume the available progress. This affects leaf,
workflow, and deferred application success equally.

The proportional correction is now one local HoG composition owner,
`admitSuccessfulRetryExitRoute`. It uses the existing event-store transaction
to append the complete completed-progress suffix, refresh replay, propose the
exact route, and admit that route. Any typed proposal or admission refusal
throws inside the transaction and rolls back the entire suffix. All three
success forms call this same owner. No event kind, semantic family, registry,
or new ABG abstraction was added.

The moving patch passes no-emit TypeScript checking. Focused runtime execution
is the next boundary; no green, freeze, or full-M5 claim exists yet.

## Entry 042 - Global Prefix Versus Run Slice Mismatch Caught Live

Timestamp: `2026-08-07T01:24:00+10:00`

Source: Codex F_H proxy live code review of the moving event-derived CCall
projector and its blocked-route consumer.

`projectOpenedCCallCarrier` currently requires its prefix event count and
digest to equal the entire store. `hasBlockedRouteEvidence`, however, passes a
prefix selected only for the source Run. If the same durable store contains an
unrelated Run, the run slice cannot equal the global store and the lawful
blocked retry route refuses. This is a local instance of the already-known
global-tail/interleaving defect class.

The correction returned to the worker is bounded: give the projector the
complete validated immutable prefix and select the exact Run and CCall inside
that prefix, or bind an equivalent explicit full-prefix coordinate. Prove the
same outcome in paired isolated and unrelated-run-interleaved stores.

The F_H proxy also challenged two newly added workflow and pending-interaction
branches in the projector. The current route consumer hardcodes the executable-
leaf branch. Those branches must either close a current affected relation or
be removed as speculative generic surface. No freeze or focused green may
precede this correction.

## Entry 043 - Writer Count Is Not Authority Duplication

Timestamp: `2026-08-07T01:28:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker` and Codex F_H
proxy semantic-owner audit before production alteration.

A focused build exposed a brittle assertion expecting three textual
`c_call_judged` writers. The current source contains four, but all four are
already present at rejected HEAD and own distinct relations:

- planned runtime-failure close under an active retry attempt;
- pending F_H interaction admission;
- ordinary judgment of an admitted result candidate; and
- blocked completion of an admission rejection.

They do not decide the same candidate under the same authority scope and
predecessor basis. Writer count alone is therefore not proof of competing
truth. The F_H proxy held deletion until this semantic classification was
complete. Production remains unchanged; the worker will replace the stale
count assertion with an explicit enumeration of the four admitted owner
variants.

## Entry 044 - Xhigh Closes The Remaining Success-Progress Bypass

Timestamp: `2026-08-07T01:28:28+10:00`

Source: read-only xhigh sentinel `/root/wave1_frozen_xhigh_review`, followed by
Codex F_H proxy adjudication and worker correction.

The sentinel passed the two newly corrected code relations. The opened
executable CCall projector binds the complete store prefix by count and digest,
selects the exact CCall rows, and derives Run, graph call, frame, basis, GTL
locus, implementation resolution, retry coordinates, and cursor cause from
events. Unrelated interleaved Run events remain in the validated prefix but
cannot enter those selected rows. The common HoG success-exit owner stages
completed progress, proposal, and route in one event-store transaction and all
leaf, workflow, and deferred application callers use it.

One rival ingress remained: `admitCompletedRetryProgress` was still exported
through the installed ABG barrel. An external caller could commit completed
progress without the consuming route, after which the atomic owner could not
resume because the attempts were already inactive. The F_H proxy directed the
worker to remove only that installed export, retain the internal primitive for
HoG composition, and add an installed-surface absence oracle.

## Entry 045 - Repair Freeze Is Not A5-F10 Acceptance

Timestamp: `2026-08-07T01:31:00+10:00`

Source: Codex F_H proxy scope adjudication accepted by the Max worker.

The failure close-plus-progress transaction intentionally leaves
`retry_progress_available` as durable intermediate truth. Unlike the success-
exit prefix fixed in Entry 041, this boundary has an accepted consumer in the
AX-F09/D17 design: the installed retry-frontier projector followed by HoG
resume. That owner is not completed or proven by the present six-relation
repair.

The current cut therefore must not expand into a new failure-route design, but
it also must not be represented as A5-F10 acceptance. It may freeze only as a
bounded repair after R1-R6 are tracked and green. A5-F10 remains open until the
accepted D17 owner consumes this durable frontier and passes exact fresh-
process reconstruction.

## Entry 046 - First Focused Runtime Green On R6

Timestamp: `2026-08-07T01:40:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker` focused execution
against an isolated install built from the current moving source.

The new tracked R6 fixture passed both required success forms:

- retry-wrapped workflow closed in 8.83 seconds; and
- retry-wrapped deferred application closed in 8.68 seconds.

Both histories contain a contiguous completed-progress suffix followed by its
single consuming route. The common atomic HoG owner therefore works through
both previously missing production paths.

R1 execution also produced the exact three-row failure sequence: retry,
boundary-terminal stopped, and propagated enclosing stopped. It reached the
structured-clone and forged-carrier checks. The sole assertion mismatch was
the expected refusal type: production returned the more precise
`traversal_route_admission_refusal` rather than the generic
`traversal_refusal`. The worker corrected the oracle and must rerun it.

R4 producer migration remains in progress. R3 still requires a real second-
process reopen plus paired unrelated-Run interleaving equality; a same-process
structured clone is necessary evidence against object identity but is not the
complete fresh-process proof.

## Entry 047 - AX-F09 Fixture Boundary And Proportional R4 Oracle

Timestamp: `2026-08-07T01:48:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker` and Codex F_H
proxy proportionality adjudication.

The legacy AX-F09 producer intentionally stops at the durable
`retry_progress_available` boundary so another process can inspect and resume
that frontier. Public HoG lawfully continues progress through route and the
next attempt, so it cannot manufacture that intermediate cut. The fixture may
import the installed owner-internal `abg/retry.js` primitive exactly as HoG
does. This uses production owner semantics to construct test state; it does
not restore the primitive to the public ABG barrel or create a test-side fold.

R4 ran twice and produced authentic attempts one through four, with retry
failure signals `A, B, A` and no stopped-progress row. It then encountered a
pre-existing `closure_contract_mismatch` after the accepted terminal route.
That closure relation is outside R4. The accepted proportional oracle proves
attempt four was reached, `A -> B -> A` did not stationarize, and no stationary
stop was admitted; it does not reopen terminal closure in this repair.

R1 reran through the reopened-prefix carrier case. Its only observed mismatch
was the already-corrected precise refusal-kind assertion. Focused green still
requires the final rerun plus the real child-process R3 and interleaving
controls.

## Entry 048 - R4 Green On The Exact A-B-A Relation

Timestamp: `2026-08-07T01:52:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, isolated
current-source installed execution.

The tracked R4 test passed `1/1` in 18.86 seconds. Its durable history proves:

- authentic retry attempts one through four;
- three contract-failure progress signals ordered `A, B, A`;
- attempt-four worker dispatch;
- attempt-four admitted success result;
- attempt-four terminal route; and
- zero stopped-progress rows.

The retry law therefore compares the immediately preceding admitted signal
rather than any matching historical signal. The unrelated existing terminal
closure mismatch is outside this oracle and did not mask the proved relation.

The legacy AX-F09 setup now imports the same installed owner-internal
`retry.js` primitive as HoG while both public-barrel absence oracles remain.
The final focused proof under construction is R3 in a real second process:
reopen the stopped prefix, admit an unrelated Run, compare the event-derived
CCall before and after interleaving, and admit the blocked route in PID 2.

## Entry 049 - R3 Must Bind The Installed Subject And Honest Mutation Class

Timestamp: `2026-08-07T01:54:00+10:00`

Source: Codex F_H proxy live review of the new PID-2 R3 fixture before its
first execution.

The initial handoff supplied the tenant source root as `packageRoot`, causing
the child to import source-tree `build/code` rather than the exact isolated
installed package. This would not prove installed portability. The worker must
pass `harness.installedPackageRoot` and keep the durable prefix carrier
independent of the source tree.

The proposed interleaving clones authentic basis and Run event bodies and
admits them through the internal raw event-contract primitive. That is a valid
event-contract mutation for testing global-prefix invariance, but it bypasses
the semantic `admitExecutionBasis -> openCall` owners. It therefore cannot be
described as proof of a lawfully owner-admitted unrelated Run. The worker must
prefer an already-admitted unrelated Run when the prefix contains one; if it
does not, the cloned pair remains explicitly a contract-valid mutation control
and the positive claim is limited to unchanged projection and route behavior.
No production ingress may be added to service this proof.

## Entry 050 - R1 And R3 Green In Installed PID-2 Replay

Timestamp: `2026-08-07T02:00:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker`, isolated
current-source installed execution.

R1 and R3 passed. The focused stationary nested-return case passed, followed
by the complete five-row installed matrix: two tests, zero failures, 78.902
seconds.

The PID-2 proof reopened the serialized durable prefix using
`harness.installedPackageRoot`. The event-derived CCall remained canonically
equal before and after the explicitly labelled event-contract-valid unrelated
basis/Run mutation. Blocked-route admission consumed the judgment and complete
inner-to-outer stopped suffix with exact causation. A shaped forged CCall
returned the typed route-admission refusal with zero append; the canonical
cloned CCall admitted.

The subsequent combined R2/R5 run passed its first test but exposed one red in
the pre-existing semantic-contradiction scenario: the oracle expected CLI
`blocked`, while production returned `failed` at
`m5-installed-retry.test.mjs:728`. The worker is determining whether that is a
stale oracle or a changed semantic relation. Freeze remains held.

## Entry 051 - Direct Rejection Is Not A Retry-Progress Stop

Timestamp: `2026-08-07T02:04:00+10:00`

Source: Max worker `/root/wave1_retry_completion_max_worker` diagnosis and
Codex F_H proxy disposition.

The semantic-contradiction red was a production regression, not a stale
oracle. `hasBlockedRouteEvidence` required the number of stopped-progress rows
to equal the number of enclosing retry contexts even when the blocked route
was caused by a direct non-retryable contract rejection. That lawful path has
no retry-progress suffix. The over-broad predicate rejected the route with
`judgment_mismatch`, causing the CLI to report `failed` instead of `blocked`.

The bounded correction applies enclosing-context cardinality only when a
stopped-progress suffix exists. Runtime-failure stops still require exact
observed-event completeness; direct contract rejection remains independently
grounded by its admitted blocked judgment and route. The exact installed
counterexample passed `1/1` in 16.927 seconds: one dispatch, no retry-progress
event, route sequence `retry, retry, blocked`, final outcome `blocked`.

All six rejected relations have now reached focused green individually. The
worker is running one serialized combined matrix, the legacy AX-F09 baseline,
no-emit TypeScript, and diff-check before any replacement freeze. Full M5 and
acceptance remain held.

## Entry 052 - Combined Matrix Green And AX-F09 Realm Defect

Timestamp: `2026-08-07T02:14:00+10:00`

Source: Max worker execution plus independent xhigh code review.

The serialized focused matrix passed: lifecycle authority `6/6`, R5 installed
single failure `1/1`, semantic contradiction `1/1`, R1/R3 installed PID-2
matrix `2/2`, R4 `1/1`, and R6 installed workflow/deferred success `2/2`.

The legacy AX-F09 producer initially refused before the failure transition.
The event tail contained no retry-progress or terminal event, its reconstructed
cursor equalled the cited retry-route target, and
`retry_attempt_active(attemptRef)` held. Independent review proved the fixture
had imported the private retry owner from installed package instance A while
its graph, store, and cursor came from separately installed instance B.
Instance A's module-local materialized-graph brand lawfully rejected B's
graph. The fixture now loads the owner-internal `retry.js` from B's exact
installed root. The public ABG barrel remains closed; no production semantics,
source-tree import, or second owner was added.

## Entry 053 - AX-F09 Baseline Must Record Repaired Truth Exactly

Timestamp: `2026-08-07T02:23:00+10:00`

Source: Codex F_H proxy authority comparison and independent xhigh review
against accepted design Sections 7.3 and 13.2.

After the install-realm repair, AX-F09 exposed that its Increment 0A baseline
still expected retry-attempt input preimages to be absent. Current code has
already reached the accepted target subrelation: attempts preserve canonical
`inputValue` in their identity and complete durable prefixes retain that
verified preimage. Retaining the old absence oracle would make a lawful repair
fail and manufacture red evidence.

The authorized migration changes only current-baseline observations. It proves
exact attempts `[1,2]`; record input preimages; canonical input digest, ref,
and contract equality; and attempt identity covering the preimage. It proves
source cursor authority through each attempt's exact cited retry route while
rejecting duplicate cursor fields. It treats numeric retry progress and the
absence of a stored frontier as lawful compact-event design. The remaining red
is only the absent installed D17 full-frontier types, structural assertion and
`ExecutableRetryInput` projector, followed by absent D18 resume. The target
oracle remains byte-identical.

Two review findings were corrected before execution. The first draft retained
stale cases and removed variable names. The second joined a C call directly to
the retry-attempt event even though both are caused by the retry route. The
corrected proof joins attempt -> cited retry route -> route-caused C call and
compares the exact cursor, attempt, and retry path.

## Entry 054 - AX-F09 Honest Confirmed-Red And Tenant Freeze Authorized

Timestamp: `2026-08-07T02:31:00+10:00`

Source: Max worker exact installed execution, independent xhigh delta review,
and Codex F_H proxy disposition.

AX-F09 passed all six current-baseline cases in 19.970 seconds with disposition
`confirmed_red`: authentic two-failure frontier, strict restart handoff, fresh-
process frontier selection, retained/restarted inspection equality, lawful
compact durable retry sources, and missing installed D17/D18 suffix. The
accepted target oracle is unchanged.

The complete focused set is green, no-emit TypeScript and syntax checks are
green, and `git diff --check` passes. One exact tenant-only replacement freeze
is authorized. It must exclude the two pre-existing administrative edits and
all commentary. Full M5, ticket promotion, A5-F10 acceptance, and D17/D18
implementation remain held until independent review of the frozen tree.

## Entry 055 - Exact Replacement Candidate Frozen

Timestamp: `2026-08-07T02:34:00+10:00`

Source: Max worker freeze plus Codex F_H proxy mechanical verification.

The exact replacement candidate is commit
`fadc654d27f85a5f78ff330ba73fde42aa2f634c`, tree
`3db4323a61369f1b2917010b93451822f5691076`. It contains exactly fifteen tenant
paths: seven production modules, five changed test/falsifier modules, and three
new focused proof modules. Its patch fingerprint is
`sha256:ea8d22e0c10689af711f25b375b943486a2a6ff45e6b954897ff558048e89fb0`;
the cut is `+2534/-518`.

The root `AGENTS.md`, the pre-existing modified bootstrap handoff, and every
commentary post are outside the commit. Post-freeze HEAD and tree reproduce;
both cached and uncached diff checks pass. Full M5 remains held. Independent
Max and xhigh reviewers are now reading this exact commit object without
editing or packaging.

## Entry 056 - Frozen Candidate Held On Two Proof Gaps

Timestamp: `2026-08-07T02:39:00+10:00`

Source: independent Max review of exact commit `fadc654d`, followed by Codex
F_H proxy disposition.

No new R1-R6 production-semantic counterexample was found. The candidate is
nevertheless held on two High assurance gaps.

First, the R3 child process receives graph definition, input value, C-call ref,
and stopped-progress event refs outside the prefix, then manually invokes
owner-internal projection and route primitives. It proves a narrower internal
reconstruction relation, not an installed production re-entry owner. The
replacement proof must derive input and the stopped suffix from the durable
prefix, retain only explicit immutable graph dependency plus selectors, and
name the result as owner-internal reconstruction. D17/D18 remains the absent
production re-entry relation.

Second, R6 proves only successful adjacency of completed-progress rows and the
consuming route. Separate immediate appends would also satisfy that oracle.
The replacement must force a proposal or route refusal after progress is
staged inside the transaction and prove zero completed-progress and route
residue in both memory and durable history. This must fail if the progress
writer is moved outside the transaction.

One test-only replacement repair is authorized. No production, design,
ticket, D17/D18, full-M5, or acceptance work may enter it. Exact candidate
`fadc654d` remains preserved as the reviewed subject.

## Entry 057 - Xhigh Finds Two Reachable Success-Exit Bypasses

Timestamp: `2026-08-07T02:46:00+10:00`

Source: independent xhigh frozen-tree review and Codex F_H proxy disposition.

Candidate `fadc654d` is rejected as the replacement cut on one production
counterexample family. Fan-out completion and F_H interaction resume each
admit their variant-specific route directly, bypassing the new atomic
completed-progress-plus-route owner. Both are reachable inside `C.retry`: a
fan-out can complete a retry-wrapped batch, and an F_H leaf can resume through
a retry wrapper. When either route advances out of retry depth, no completed
retry-progress event terminates `retry_attempt_active`, so a departed retry
attempt remains live.

The authorized correction remains within R6. It must map the two existing
variant evidence relations, derive every exited retry depth, stage completed
progress and the variant route in one existing event-store transaction, and
make the route consume the exact progress refs without replacing fan-out or
F_H authority. Positive nested controls and the already-required post-staging
rollback falsifier are mandatory. R3 proof-scope correction remains test-only.

The same review confirmed that AX-F09 is still an honest absence baseline:
D17 projector/frontier/type/assertion and D18 resume are not implemented.
This does not enlarge the present R6 repair, but it prevents A5-F10 acceptance
after the repair. D17/D18 remains the next bounded feature slice.

## Entry 058 - R6 Correction Held For Complete Route-Family Census

Timestamp: `2026-08-07T02:52:00+10:00`

Source: Max worker function/relation map and Codex F_H proxy code review.

The worker mapped the existing lawful composition as one private transaction:
derive and stage the complete exited-retry progress chain, replay that staged
prefix, propose the route consuming the exact progress refs, then admit the
route. It also mapped the two bypasses precisely. Fan-out complete-vector and
F_H interaction resume each preserve their existing variant authority but
currently call route admission directly.

The correction is directionally accepted but editing remains held for one
bounded completeness check. An independent reviewer is enumerating every
reachable route family whose target retry depth can be shorter than its source
retry depth. This prevents a third variant from being discovered only after
another freeze.

The approved shape cannot expose an arbitrary callback or generic evidence
bag. It must use a closed private typed variant or exact thin wrappers. F_H
completion must be a distinct hashed witness joining the active retry attempt,
pending judgment, held continuation lifecycle, exact admitted resume, and
successor cursor; the resume event is the inner completion cause. Nested outer
progress remains a predecessor chain. Fan-out completion and F_H resume may
remain durable precursor facts, while the newly owned retry-exit progress plus
route transition must commit atomically.

No implementation edit or test run occurred at this checkpoint. Candidate
`fadc654d` remains rejected and preserved; AX-F09 remains honestly red only on
the absent D17/D18 suffix.

## Entry 059 - Complete Retry-Exit Census And Bounded Repair Authorization

Timestamp: `2026-08-07T03:00:00+10:00`

Source: independent xhigh frozen-tree census, Max worker census, and Codex F_H
proxy direct code adjudication.

The complete reachable admission census identifies exactly three missing
successful retry-depth exit families: fan-out complete-vector, F_H interaction
resume, and structural `C.identity`. Ordinary judged leaf/workflow/deferred
terminal exits already use the atomic owner. Structural entry and retry do not
exit; recursion preserves retry depth; stop families terminate contextual
retry truth through `run_stopped`.

Graph-span re-entry is not a fourth admitted bypass. Program validation forbids
both re-entry loci below retry paths, and ABG independently passes re-entry
evidence through the judged-route completed-progress gate. The HoG call site
would therefore refuse an illicit nonempty retry source. It is excluded from
the repair.

One bounded implementation is authorized. A closed owner-internal HoG
composition may admit exactly the existing judged-success family plus the
three missing variants. It may not expose arbitrary callbacks, a Public port,
or generic evidence. Completed-progress payloads use closed hashed completion
classes and an exact witness event. F_H must prove the complete attempt,
pending judgment, hold/open/respond/resume, and successor-cursor chain.
Structural identity must use its own payload variant without fabricated CCall,
result, or judgment fields. Every variant route must independently reproject
and consume the complete exited-depth progress suffix.

Required evidence is three nested positive controls, the retained ordinary
controls, one shared post-staging forced-refusal rollback proof with zero
in-memory and reopened-durable residue, and the narrower R3 owner-internal
fresh-process proof. Only focused qualification may run before review. D17/D18,
graph-span, stop families, catalog, closure, Public API, tickets, designs, full
M5, and administrative files remain outside authority.

## Entry 060 - Live Provenance Review And Projection Compression

Timestamp: `2026-08-07T03:20:00+10:00`

Source: Codex F_H proxy live code review and Max worker bounded correction.

The first F_H retry-progress projector draft duplicated an incomplete
continuation fold. It checked local row shapes but did not prove the two Public
operation coordinates, capability grants, response and successor hashes, or
exact embedded pending CCall carrier. That draft was not allowed to propagate
into HoG or tests.

The correction commonized instead of copying. One cycle-neutral
`fh_continuation_projection.ts` now owns immutable-prefix F_H lifecycle
projection. `continuation.ts` delegates to it. A state-neutral exact pending
carrier projector is shared from `c_call.ts`; the existing rehydration entry
delegates rather than retaining a second implementation. `retry.ts` consumes
the common projection and its manual F_H lifecycle fold was deleted.

At the compression boundary, TypeScript no-emit passes. Exact production
movement, including the new module, is `+884/-397`, net `+487`, across seven
paths; the only HoG changes at this point adapt the existing judged-success
call signature. None of the three bypass call sites has yet migrated. The
shared HoG transaction and those exact call sites are the next authorized
step.

## Entry 061 - Three-Family Migration And Existing-R6 Preservation

Timestamp: `2026-08-07T03:30:00+10:00`

Source: Max worker focused execution and Codex F_H proxy live code review.

All three missing successful retry-depth exit families now pass through the
same closed owner-internal HoG transaction: fan-out complete-vector, F_H
interaction resume, and structural `C.identity`. The existing judged-success
family was migrated to the same composition. No Public port, callback seam,
generic evidence bag, new event kind, or second runtime owner was added.

The preserved R6 regression ran after a clean build and passed `2/2`: ordinary
workflow retry completion and deferred-application retry completion both
remain green. The candidate-basis fixture changed only because the repository's
standard refresh script rebound it to the newly built package and generated
manifest; this is mechanical proof-fixture maintenance, not a semantic
authority change.

Current production movement is `+1,222/-637`, net `+585`, across ten paths
including the two new private modules. The largest new surfaces are the shared
F_H lifecycle projector and the closed four-variant retry-exit composition.
TypeScript no-emit passed before the call-site migration; the focused R6 run
then rebuilt the migrated production successfully.

Freeze and full M5 remain held. The worker is authorized only to add the three
missing-family nested positive controls, one deliberate post-staging route
refusal proving zero durable and projected residue, and the corrected R3
owner-internal immutable-prefix reconstruction proof. D17/D18 remains absent
and outside this repair.

## Entry 062 - Complete F_H Projection Envelope Restored

Timestamp: `2026-08-07T03:39:00+10:00`

Source: Codex F_H proxy live code review and Max worker local correction.

Live review found that the newly common F_H continuation projector proved
lifecycle order and embedded carriers but did not recompute the continuation
identity or bind every lifecycle row to the opening run, graph call, and frame.
That allowed a forged aggregate identity or cross-scope response/resume row to
be interpreted as retry-completion provenance.

The shared projector now reconstructs the exact canonical continuation
identity, checks its digest and reference, joins the embedded pending CCall,
held cursor, traversal scope, hold route, execution basis, and event envelope,
and requires response, resume, and disposition rows to remain in the exact
continuation lifecycle scope. The structural identity cursor-witness projector
now also requires the progress run, graph call, frame, and materialization
envelope. No event, owner port, or API was added.

TypeScript no-emit is green. The preserved R6 workflow and deferred-application
suite remains green `2/2` after the correction. The worker is proceeding to
the bounded forged-scope negatives and the three missing-family positive
controls; freeze and full M5 remain held.

## Entry 063 - Focused R6 Execution Exposes Fan-Out Lifecycle Mismatch

Timestamp: `2026-08-07T04:00:02+10:00`

Source: Max worker focused execution, Codex F_H proxy live code review, and
targeted independent Max review in progress.

The first complete focused run after the three-family migration is green
`3/6`: the retained workflow and deferred-application controls pass, and the
nested structural `C.identity` exit passes. Nested fan-out, F_H resume, and the
rollback proof remain red. The rollback proof is downstream of fan-out and has
not yet reached its deliberate route-refusal point.

Fan-out has progressed beyond the prior input-basis mismatch after two exact
post-structural input refreshes in `hog/graph_execute.ts`; the unwrapped
installed fan-out control also passes `2/2`. The new nested failure is
`judgment-contract-mismatch`. The rejected parent CCall has retry path `[1,1]`,
but `exactRetryAttemptRef` returns null while the other CCall and rejection
authenticity guards hold. No semantic repair is authorized until the admitted
prefix proves one of two cases: either the matching retry attempt exists but
was terminated too early, or the exact-attempt selector cannot join its
coordinates and causal ancestry. Those cases have different owners and must
not be conflated.

F_H is currently a fixture realization defect rather than a production
authority defect. The cloned Consensus Program still carries donor-root values
in `publicAssetTargets`, `constructionComposition`, and `actionCatalog`. The
only authorized correction there is mechanical rebinding to the variant's
start and callable identities followed by whole-Program validation.

The temporary diagnostic expansion of the `completeRejectedCCall` exception is
not candidate code and must be removed before evidence. Freeze, commit, R3,
D17/D18, and full M5 remain held. The worker continues the bounded trace while
an independent Max reviewer performs the same fan-out ownership analysis.

## Entry 064 - Fan-Out Defect Located In Retry Ownership Selection

Timestamp: `2026-08-07T04:02:49+10:00`

Source: independent Max targeted review, Max worker admitted-prefix trace, and
Codex F_H proxy global-to-local adjudication.

Both independent traces prove the nested fan-out fixture is lawful and both
retry attempts remain active. `C.retry(C.retry(C.batch(...)))` opens its retry
attempts at the enclosing retry boundaries with `taskOrdinal: null`; the
subsequent structural `start_task` step lawfully creates a descendant CCall at
task ordinal `0`. The inner attempt is the exact causal ancestor of that
CCall's immediate route, shares run, graph call, frame, attempt number, and
retry path `[1,1]`, and is still held by Event Calculus. No completed progress
has consumed it.

`selectExactRetryAttemptEvent` nevertheless rejects the owner because it
equates the boundary's task ordinal with the descendant CCall's task ordinal.
That is the defect. Task ordinal is part of each carrier's identity but is not
the enclosing retry-ownership relation. A null-only wildcard would also be
incomplete: nested batches can replace one non-null inner task ordinal with
another while remaining under the same retry boundary.

The bounded correction is to select exactly one Event-Calculus-active attempt
with the exact retry path and causal owning retry-route ancestry in the same
run, graph call, and frame. It must fail closed on zero or multiple active
causal candidates. It must not open attempts per task, repair ownership after
rejection, or duplicate active-state folding outside Event Calculus. The CCall
retains its own task ordinal. F_H remains a separate mechanical fixture
rebinding. Focused qualification, freeze, and commit remain held until both
corrections are complete and the temporary diagnostics are removed.

## Entry 065 - Selector Repair And Atomic Rollback Reach Five Of Six

Timestamp: `2026-08-07T04:07:46+10:00`

Source: Max worker clean focused execution and Codex F_H proxy code review.

The post-repair focused R6 suite is green `5/6`. Existing workflow,
deferred-application, nested fan-out, nested structural identity, and the
deliberate post-staging rollback/reopen falsifier all pass. The selector now
uses the supplied Event Calculus projection, removes task ordinal only from
retry-boundary ownership, retains the exact run, graph-call, frame, retry-path,
and causal-route relation, and resolves exactly one active attempt. A direct
regression covers whole-batch null-ordinal ownership of a descendant task and
inactive-attempt refusal. Temporary CCall diagnostics are gone.

The rollback proof now reaches the intended refusal after staging two nested
completion rows and proves that neither row nor a consuming route remains in
memory or in the reopened durable log. This closes the earlier independent
atomicity finding rather than merely proving adjacent successful events.

Only the nested F_H fixture remains red. Its whole Program validation passes;
the failure is at Product invocation-policy construction because the test
passed raw validated interaction rows where the installed Public path maps
each row to `requirementKey`, `requirementKeyDigest`, and
`row.requirement.actorCapabilityRef`. The only authorized correction is to
mirror that existing installed mapping. Product, Validator, ABG, and HoG
semantics remain held. Full M5, freeze, commit, R3, and D17/D18 remain held.

## Entry 066 - F_H Red Is Two Local Progress-Projector Defects

Timestamp: `2026-08-07T04:18:22+10:00`

Source: Max worker row-level diagnostics, independent xhigh review, Codex F_H
proxy static review, and targeted Max review pending.

The F_H fixture now passes publication and whole-Program validation, Product
policy and grants, invocation admission, graph materialization, hold, response,
continue, successor-cursor derivation, and resume admission. Final HoG route
admission remains red only because `hasCompletedRetryProgressChain` cannot
reproject its two staged rows. Every surrounding F_H route predicate is true.

Two local production projector defects are proven. First,
`exactFhResumeCompletionWitness` reads `regime` from the `c_call_opened` locus
payload, where it is not declared. The exact F_H regime is carried by the
single causally adjacent `c_call_fibre_selected` event already named by the
common CCall phase projection. This makes even the inner row unprojectable.
Second, the same witness requires the pending judgment's innermost
`retryAttemptRef` to equal every completed row's attempt ref. The outer row has
a different lawful attempt and is owned by its immediately preceding inner
progress row.

The authorized correction stays inside the existing projector. Extend the
existing CCall phase event join to include and validate its exact fibre event;
read F_H regime there. Bind the pending judgment's attempt only on the first
row, where `predecessorProgressRef` is null. Preserve the outer row's exact
adjacent predecessor projection, depth decrement, identity, cursor, outcome,
and causation checks. No new event, fold, carrier, owner, API, or fixture-side
runtime authority is authorized. Diagnostics must be removed before F_H-only
and complete focused R6 execution.

## Entry 067 - Focused R6 Reaches Six Of Six

Timestamp: `2026-08-07T04:26:00+10:00`

Source: Max worker focused execution and Codex F_H proxy live source review.

The corrected F_H projector now resolves its regime through the exact
causally adjacent `c_call_fibre_selected` event and binds the pending
judgment's retry attempt only to the innermost progress row. Both nested
completed-progress refs are reprojected and consumed by the admitted F_H
advance route. The runtime relation passes.

The first resumed execution then exposed a fixture-only closure mismatch. The
test variant had copied the Consensus escalation graph's child
`graph_call`-scope finalization contract into a new root Program, while ABG
correctly requires a `run`-scope contract for root closure. The bounded
correction adds one distinct T-287 root contract with the same declared value
law, exact Run closure events, and `closureScope: run`; only the test root
graph and Program reference it. The existing finalization child contract is
unchanged.

The complete focused R6 file now passes `6/6`: workflow, deferred application,
nested fan-out, nested F_H, nested structural identity, and forced
post-staging rollback with durable reopen. No freeze, stage, commit, or full
M5 occurred. Independent Max and xhigh reviewers are reading the stable R6
production delta while the worker performs the previously authorized
test-only R3 proof-scope correction: PID-2 must reconstruct input and the
stopped suffix from the validated immutable prefix rather than receiving them
through its handoff. D17/D18 remains absent and out of scope for this cut.

## Entry 068 - R6 Held On Incomplete Fan-Out Witness Projection

Timestamp: `2026-08-07T04:30:53+10:00`

Source: independent Max pre-freeze code review and Codex F_H proxy source
verification.

The shared retry-exit owner, all six migrated success paths, transaction
rollback, F_H projection, and structural path pass static review. Freeze is
nevertheless held because `exactFanOutCompletionWitness` and the matching
admission check bind only the final fan-out task row. They do not independently
prove the completion identity and digest, output-vector identity, complete
ordered task census, or every row's CCall, foldback, result, and judgment
provenance. A contract-shaped witness with a changed non-final row can
therefore become reconstructive retry-progress truth.

The bounded correction is one cycle-safe pure fan-out completion projector,
factored from the existing owner/replay interpretation and consumed by replay,
retry admission, and retry reconstruction. It must not create a second event
fold. Required evidence is a contract-valid forged non-final-row refusal, a
stale-carrier/prefix refusal with zero suffix, and byte-equal successful
progress plus route projection after durable reopen. The worker may prepare
the construction map but production remains held pending F_H proxy approval.

## Entry 069 - R3 Owner-Internal PID-2 Reconstruction Passes

Timestamp: `2026-08-07T04:33:28+10:00`

Source: Max worker focused installed execution; independent review pending.

The R3 handoff no longer carries `inputValue` or
`stoppedProgressEventRefs`. PID-2 receives the installed package root, copied
immutable log path, explicit immutable GraphFunction dependency, CCall
selector, and admission time. It selects the exact retry attempt on the
judgment-bounded validated prefix, derives the executable input from that
attempt, reprojects the attempt and CCall, and discovers and reprojects the
complete stopped-progress chain from history before any mutation.

The source and PID-2 projection carriers compare equal. Forged and stale CCall
selectors refuse before route admission, and each copied durable prefix
remains byte-identical. The focused installed lane passes `2/2` in 88.1
seconds. The proof is explicitly named owner-internal reconstruction; it does
not claim the still-absent D17/D18 installed restart owner. No production,
authority, freeze, stage, commit, or full-M5 work occurred.

## Entry 070 - Terminal Structural Retry Exit Is A Missing Route Family

Timestamp: `2026-08-07T04:35:26+10:00`

Source: independent xhigh pre-freeze review and Codex F_H proxy code-path
verification.

A lawful terminal structural form is absent:
`C.compose(resultBearingTerm, C.retry(C.retry(C.id<B>(), 2), 2))`. The final
identity source cursor has retry path `[1, 1]`, while its exact declared
continuation is terminal and therefore has no target cursor. The current HoG
classifier and structural proposal require a non-null target; retry progress
projection rejects null structural targets; ABG terminal admission recognizes
only resumed or judged evidence.

The advancing structural fixture cannot falsify this case because it places a
second term after the nested identity. The required local correction must pass
the terminal identity through the same successful-retry-exit transaction,
admit progress for every exited depth, carry structural evidence without a
fabricated CCall/result/judgment, and enter the existing ABG terminal route and
normal Run closure. This is a missing local route variant, not authority to
add a new owner or lifecycle.

## Entry 071 - R3 Held On One Input-Basis Assertion

Timestamp: `2026-08-07T04:36:03+10:00`

Source: independent Max R3 review and Codex F_H proxy disposition.

The R3 correction correctly minimizes the PID-2 handoff and reconstructs the
CCall, retry attempt, and stopped suffix from durable truth. One false-green
condition remained: the worker supplied the retry-attempt input value while
claiming the execution basis's raw-input ref and digest, without proving the
value hashes to that digest. The fixture has no fan-out application, so graph
materialization does not otherwise inspect the value.

The authorized correction is test-only: assert that the attempt input value
hash equals the admitted raw-input digest before materialization, then assert
that the reconstructed graph ref and digest equal the selected CCall envelope
and basis graph coordinates. A failed equality must stop rather than relabel
the input.

## Entry 072 - R3 Exactness Correction Passes

Timestamp: `2026-08-07T04:38:08+10:00`

Source: Max worker focused installed execution following independent review.

The required value/digest equality holds for the real fixture. PID-2 now
checks it before materialization and proves the resulting graph ref and digest
equal both the selected CCall envelope and admitted execution basis. The same
focused installed lane passes `2/2` in 79.65 seconds, including the nested
return-to-parent path. R3 is review-clean owner-internal reconstruction proof;
it remains explicitly distinct from the absent D17/D18 installed restart
owner.

## Entry 073 - Proportional R6 Disposition And A5-F03 Re-Entry

Timestamp: `2026-08-07T04:51:50+10:00`

Source: Max worker construction map and Codex F_H proxy proportionality
adjudication.

Only the exact fan-out completion projector is authorized in the current R6
repair. Its construction must use one canonical task/provenance fold, bind
candidate derivation through append to one expected immutable-prefix digest,
and reproject the appended event inside the same transaction so a failed
postcondition leaves no event. Event-canonical and graph-bound projection
modes must be explicit; callers holding Graph, application, and materialization
authority must supply them. Replay may reconstruct event truth but may not
claim to re-prove an unavailable GTL asset. The unused process-local fan-out
WeakSet brand and barrel predicate are deleted rather than retained.

The terminal structural identity counterexample is genuine but is not
authorized for implementation inside R6. Closing it generally requires a
closed predecessor-result provenance union across judged, fan-out, and F_H
advance paths plus reuse of the existing closure owner. That is direct HoG
composition work owned by the already-scheduled A5-F03 feature, not a local
fan-out/retry repair. The exact first A5-F03 red is:

```text
C.compose(
  resultBearingTerm,
  C.retry(C.retry(C.id<B>(), 2), 2),
)
```

Its final identity has retry path `[1, 1]` and a lawful terminal null target.
Current code cannot atomically consume those attempts and admit the terminal
structural route. R6's acceptance claim is therefore narrowed to the six
implemented exit families; it must not claim complete structural-terminal
composition. This is a deliberate lawful re-entry, not a waiver or assertion
that the counterexample is solved.

## Entry 074 - Fan-Out Projector Direction Passes; Four Relations Held

Timestamp: `2026-08-07T05:04:12+10:00`

Source: Max worker moving construction, independent Max sentinel review, and
Codex F_H proxy live-tree adjudication.

The first common fan-out projector is directionally lawful: it is cycle-safe,
has explicit candidate, event-canonical, and graph-bound modes, derives and
appends against one expected immutable-prefix digest, reprojects before the
transaction commits, rolls back a failed postcondition, and removes the
obsolete process-local WeakSet authority. Replay migration has begun. This is
moving construction, not a candidate.

Freeze and consumer migration remain held on four exact projector defects:

1. Evidence, result, and judgment phase events are not all bound to the exact
   run, graph-call, frame, basis, and materialization envelope.
2. The task census includes every historical workflow CCall for a frame and
   batch. Lawful retry history can therefore produce duplicate ordinals rather
   than one causally current task frontier.
3. Foldback truth is content-hashed but does not reconstruct the named child
   result, judgment, route, terminal, and closure lifecycle or require its
   exact parent-fibre causation. A forged foldback can rehash assertions into a
   completion witness.
4. Graph-bound mode self-validates the CCall locus text but does not prove that
   it is the exact materialized `C.batch` member locus or bind workflow input
   and output contracts to that member.

All four findings were delivered to and accepted by the worker before compile
or focused execution. The bounded repair remains inside the one shared
projector and must add contract-valid forged, stale, superseded-retry, and
durable-reopen counterexamples. No full M5, freeze, stage, or commit is
authorized until the core and its consumers pass another independent delta
review.

## Entry 075 - Fan-Out Projector Core Passes Independent Delta Review

Timestamp: `2026-08-07T05:12:51+10:00`

Source: Max worker focused build and execution, independent Max core review,
and Codex F_H proxy adjudication.

The corrected common projector builds and passes the existing lawful nested
retry fan-out completion. Independent Max review passes the five bounded core
seams: schema-exact asymmetric envelopes, Event-Calculus-selected current
retry frontier, complete child foldback lifecycle and causation, exact
materialized `C.batch` locus and member contracts, and expected-prefix
transaction atomicity through graph-bound postprojection.

Consumer migration is now authorized only for the existing retry witness and
fan-out route evidence paths. The worker has replaced their raw replay/payload
interpretation with event-canonical or graph-bound projection as appropriate;
callers holding graph authority require graph-bound reprojection and complete
carrier equality. Compile, forged/stale/reopen falsifiers, and a consumer delta
review remain required before any freeze. No full M5, stage, or commit is
authorized.

## Entry 076 - Consumer Production Pass; Proof Strength Held

Timestamp: `2026-08-07T05:26:24+10:00`

Source: Max worker focused execution, independent Max and xhigh consumer
reviews, and Codex F_H proxy adjudication.

The production consumer migration passes independent review. Retry
reconstruction uses event-canonical projection at the exact historical prefix;
retry admission and fan-out route independently require graph-bound
reprojection and complete-carrier equality before effects. Raw completion
payload trust and the process-local fan-out brand are absent. Durable reopen
equality also passes.

The complete focused R6 file passes `9/9` in 80.9 seconds, but freeze remains
held because two proof claims are underpowered. The stale case invokes only a
pure projector, so it must drive an effectful admission seam and prove refusal
with identical in-memory state and durable bytes. The rehashed non-final-row
forgery does not mutate `programLocusRef`; a distinct CCall-identity cascade
forgery must prove graph-bound completion, retry admission, and route admission
all refuse the alien materialized locus with zero suffix. Max requires both
corrections; xhigh independently confirms the locus gap and finds no production
counterexample. These are test-only amendments. Production, full M5, freeze,
stage, and commit remain held.

## Entry 077 - Corrected Proofs Pass Consensus; Intermediate Freeze Authorized

Timestamp: `2026-08-07T05:49:00+10:00`

Source: Max worker execution, independent Max and xhigh final delta reviews,
and Codex F_H proxy adjudication.

The corrected focused R6 file passes `10/10` in the worker run and in an
independent Max run. Xhigh independently reruns the two corrected proofs at
`2/2`. Both reviewers return PASS with no counterexample.

The stale proof now constructs a real durable Prefix A ending immediately
before the completion in Prefix B, submits the exact later completion carrier
through production `admitCompletedRetryProgress`, and proves the event array,
store digest, and durable bytes remain identical across refusal. The alien
locus proof mutates a non-final task's `programLocusRef`, cascades the CCall,
value, event, foldback, evidence, result, judgment, route, completion, and
retry identities, proves event-canonical truth remains reconstructible while
graph-bound truth rejects, and proves the real retry and route owners refuse
without effects. No stack monkeypatch or test-side semantic projector remains.

The F_H proxy accepts the bounded R3/R6 relation for one tenant-only
intermediate freeze. This is not A5-F10 acceptance: AX-F09 D17-to-D18 installed
restart ownership remains absent and is the next relation after the frozen cut
passes exact review. The worker may stage and commit only tenant production,
tests, falsifier, generated candidate-basis, and the three new tenant modules.
Root `AGENTS.md`, bootstrap commentary, all other posts, full M5, and D17/D18
work remain excluded until the exact commit and tree return from review.

## Entry 078 - R3/R6 Exact Cut Accepted; D17/D18 Map Starts Clean

Timestamp: `2026-08-07T05:53:15+10:00`

Source: independent Max and xhigh frozen-object reviews and Codex F_H proxy
acceptance.

Both reviewers return exact-cut PASS for commit
`34624ffbe70e936d06d69903c2c47ea2987c2c3a`, tree
`950b9819a7f94a9ecf6c17197e4114069ec9f024`, parent `fadc654d`. The diff has
exactly 21 paths, all under the ABI TypeScript tenant. The reviewed projector,
retry and route consumers, R3 falsifier, and corrected T1/T2 blobs reproduce;
the live tenant tree has no post-freeze delta. No specification, design,
ticket, goal, root instruction, or commentary file entered the cut.

The F_H proxy accepts this commit as the banked intermediate R3/R6 checkpoint.
It does not accept A5-F10 as complete. The remaining selected blocker is the
installed AX-F09 D17-to-D18 relation: full prior-attempt frontier and executable
input projection from one verified durable prefix, followed by one HoG resume
path that atomically admits route and attempt before attempt-three effect.

A new clean-context Max worker is assigned to a read-only, code-grounded
construction map. It may not edit or accept work. The map must reconcile the
frozen R3/R6 implementation, identify exact reusable and missing relations,
bind installed exports and P1/P2 proof, and return any constructability
counterexample before an implementation plan is approved.

## Entry 079 - D17/D18 Prefix-Carrier Erratum Ratified

Timestamp: `2026-08-07T06:23:40+10:00`

Source: clean-context Max construction map, independent Max and xhigh
whole-design reviews, and Codex F_H proxy adjudication.

The D17/D18 construction map found one literal inconsistency inside accepted
Gate 1. Sections 7.3 and 13.2 named `ReopenedEventStoreContext` in both target
requests, which makes the ordinary retained path unconstructable without
closing and reopening its already-held sink. Gate 1 Sections 5.2 and 5.2.1
already define the governing, complete decomposition: immutable read authority
is `DurablePrefixCoordinate`; opaque write capability is
`EventStoreAppendSink`; both new-empty acquisition and exact reopen yield the
same `{sink, prefix}` pair.

Both reviewers reject adding a `VerifiedDurablePrefixContext` or any other
wrapper because it would duplicate those accepted primitives. No
counterexample remains to the following bounded erratum, which the F_H proxy
ratifies:

1. D17 `projectExecutableRetryInput` consumes only the exact
   `DurablePrefixCoordinate` plus its selector and immutable declarations. ABG
   verifies and reads exactly that durable prefix, produces the immutable
   validated event prefix, closes the read descriptor, and folds only that
   prefix. D17 receives no append sink or mutable store.
2. D18 `resumeProjectedRetry` consumes `predecessorPrefix`, the already-held
   `EventStoreAppendSink`, the D17 carrier, and the ordinary immutable runtime
   dependencies. It fresh-runs D17, compares the complete carrier, revalidates
   the sink against the predecessor inside one expected-prefix transaction,
   atomically admits route plus attempt, and returns a distinct successor
   coordinate before the next effect.
3. Ordinary execution threads the pair already returned by new-empty
   acquisition and prior successor-producing admissions. Restarted execution
   obtains the identical pair through exact reopen. Both lanes call the same
   D17-to-D18 functions. Sink object identity is outside fresh-process
   equality.

This is a correction of the later concrete signatures to the earlier
governing Gate 1 carrier algebra. It adds no authority relation, carrier,
lifecycle, event, Product or Public callable, close/reopen step in ordinary
execution, process-local semantic state, or second retry path. One exact
design-source correction is authorized before the D17/D18 coding plan; no
production implementation is yet authorized.

## Entry 080 - D17/D18 Design Erratum Reviewed And Banked

Timestamp: `2026-08-07T06:30:38+10:00`

Source: Max worker frozen design patch, independent xhigh blocking review,
independent Max non-blocking review, local correction, and Codex F_H proxy
acceptance.

The first frozen patch correctly separated coordinate read authority from sink
write capability, but xhigh found one exact constructability omission: AX-F09
P2 cannot call `reopenExactAppendSink` from a handoff containing only the
prefix and retry selector because exact reopen also requires the
`EventStoreReopenAuthority` minted by coordinate-verified close. Max had not
identified this omission.

The worker made only the local correction. P1 now calls
`projectReopenAuthorityAndClose(prefix)` and serializes the returned reopen
authority beside the prefix and retry selector. P2 consumes the authority and
equal prefix through `reopenExactAppendSink`. The authority is durable
write-reacquisition evidence, not semantic truth or a JavaScript capability.
The corrected frozen patch digest was
`7fec8f3193454527d3630423f6f84f2df4583199174acbfed5fed2d52f46e9e8`, one
design file at `+37/-22`; both independent reviewers returned PASS.

The F_H proxy accepted and banked the exact design cut as commit
`42e605ef2209067536b844cfaa0cab5e79e89e7b`, tree
`e5934f19f1dec8e7f8a7ae15ead714940c319ad1`, parent `34624ffb`. The commit
contains only
`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`.
Production and tests remain identical to the accepted R3/R6 checkpoint. The
next authorized transition is one exact D17/D18 coding plan against this clean
design base; implementation remains held until that plan passes independent
review and F_H proxy approval.

## Entry 081 - First D17/D18 Coding Plan Held; Prefix Scope Compressed

Timestamp: `2026-08-07T06:46:02+10:00`

Source: Max worker code-level plan, independent xhigh and Max constructability
probes, Product and requirement re-read, and Codex F_H proxy adjudication.

The first coding plan is held before implementation. It correctly maps D17,
D18, the full retry frontier, the route-plus-attempt transaction, and the
installed AX-F09 proof, but it contains one internal contradiction: it accepts
the retry-failure durable commit as the first coordinate while later requiring
P1 to acquire and thread a zero coordinate through every earlier event. It
also expands D18 into coordinate propagation through every post-retry ABG
owner because the design's Section 5.2 says every effectful owner request
carries a coordinate.

Product A5-F10 and `REQ-R-ABG3-EVENTS-001`, `-002`, `-024`, and `-027` require
one durable append-only event authority, durable acceptance before downstream
effects, ordered event identity, and replay-derived semantic truth. They do not
require every internal admission callable to expose a prefix coordinate.
`REQ-P-CATALOG-029` requires an explicit coordinate at the Public invocation
boundary. Both reviewers agree the design implementation law is over-broad for
the internal D17/D18 suffix.

The F_H proxy selects the proportional single-path correction:

1. Event Store may mechanically mint an immutable
   `DurablePrefixCoordinate` only from verified committed bytes while its
   descriptor and exclusive append ownership remain held. The coordinate
   states which bytes exist; it does not select their semantic meaning.
2. The existing retry-failure transaction is upgraded in place to return its
   committed successor coordinate. Its legacy pre-effect digest is not cast or
   represented as a coordinate, and this does not claim universal Section 5.2
   migration.
3. D17 derives retry meaning only through Event Calculus over that explicit
   immutable prefix.
4. D18 requires exact equality between its predecessor coordinate and sink at
   the route-plus-attempt transaction, atomically commits both events, and then
   continues ordinary traversal. Any intervening append before that
   transaction refuses; no two-prefix interleaving relaxation is added.
5. At D18 return, Event Store may project the exact committed physical
   coordinate synchronously under the held sink. D18 must reproject and verify
   its exact scoped completion from that returned prefix before returning it.
   Intermediate internal owners remain governed by durable-before-next-effect
   event acceptance and need not expose coordinates individually.

A general installed `projectCurrentPrefix`, sink-derived retry selector,
synthetic in-memory coordinate, optional checked/unchecked API, wrapper
context, ordinary close/reopen, or second retry path remains forbidden. The
next action is one design-source compression that removes the universal
per-internal-owner reading while preserving explicit coordinates at Public,
read, transaction, completion, and close/reopen boundaries. Production remains
held.

## Entry 082 - Product-Proportional Prefix Compression Banked

Timestamp: `2026-08-07T06:54:07+10:00`

Source: Max worker design compression, independent xhigh blocking review,
independent Max non-blocking review, and Codex F_H proxy acceptance.

The one-file design compression passed both independent reviews with no
finding. It preserves one durable ABG log, durable append before downstream
effects, Event Calculus as sole semantic-currentness authority, explicit
coordinates at the Public/artifact/read/reacquisition and named D17/D18
boundaries, exact stale-prefix refusal before D18 effects, atomic route-plus-
attempt admission, and scoped replay verification of the final D18 completion
coordinate.

It removes only the over-broad implementation reading that every internal ABG
admission callable must expose and thread a coordinate. Event Store may name
committed bytes at a checked transaction or named enclosing completion while
holding the exact descriptor and append lock; that mechanical coordinate does
not decide what those bytes mean. Any physical-prefix change between D17 and
the D18 route/attempt transaction still refuses. No generic installed current-
prefix projector, optional overload, wrapper, second write path, or
interleaving relaxation is authorized.

The accepted patch digest was
`1e82527fa5b3dae1687581967419c20b3f179e8fe2c0670c8535a2eaba9bbb35`.
It is banked as commit `62a6760bf019012592ac267b0d5655e29ebc27c2`,
tree `c677b0f9cc9f41bcaf0263e69304ac79f68ce52e`, parent `42e605ef`,
with exactly one changed design file at `+57/-26`. Production and tests remain
identical to checkpoint `34624ffb`. Coding Plan 1 remains rejected; one
compressed Coding Plan 2 is the next authorized transition.

## Entry 083 - Exact D17/D18 Retry-Reentry Design Banked

Timestamp: `2026-08-07T08:22:00+10:00`

Source: Max worker design construction, independent xhigh blocking reviews,
independent Max assurance reviews, live code-level F_H proxy checks, bounded
local repairs, and final dual-review PASS.

The design was not allowed to advance on reviewer agreement alone. Four frozen
cuts exposed distinct constructability defects before production work:

1. `f6ec72bb` changed the existing expected-prefix transaction to require the
   durable coordinate that the same commit was meant to create, contradicted
   empty-transaction results, described a retry Map that does not exist, and
   treated an already durable input preimage as absent.
2. `2d72e8cc` corrected those relations but required two installed-worker runs
   to produce byte-identical logs. Live actor-process admission records the
   real child PID, so independent runs cannot have equal full-prefix or D17
   identities. Its Event Store census also omitted the source-internal
   `compareAndAppendExpectedPrefix` ingress and five live call sites.
3. `6df75940` replaced that oracle with one unchanged durable prefix across
   P1/P2 and completed the append-ingress census, but left no exact callable
   from D18 success into ordinary HoG. Live `executeGraphTraversal` rejected a
   retry-path raw resume, so implementation would have had to invent a new
   authority seam.
4. `7a250a30` closed that seam on the existing installed
   `executeGraphTraversal` callable, but left “eventless rejection” ambiguous
   even though the live `fail()` path admits `runtime_failure` before throwing.

The final accepted relation is:

- the existing expected-prefix transaction keeps its mechanical
  `expectedPrefixDigest` input and adds only a rollback-protected durable
  successor result; empty or in-memory commits return `null`;
- historical pure reads accept a stable first-N prefix while append, close,
  and reopen require exact-tail equality;
- D17 projects the complete retry frontier and executable input from one
  explicit immutable prefix, uses the semantic byte digest rather than file
  identity in its projection identity, and receives no mutable store;
- AX-F09 uses one authentic durable file. P1 projects D17 over the two-failure
  frontier, atomically closes to `{prefix,reopenAuthority}`, and exits. P2
  reopens that same exact prefix, reproduces the D17 ref/digest, invokes D18,
  and executes attempt three;
- D18 atomically admits the retry route, applied cursor, and fresh attempt
  through the one existing transaction, using private thrown aborts for inner
  typed refusals, and returns the verified successor coordinate;
- existing installed `executeGraphTraversal` remains the sole ordinary HoG
  executor. Its closed projected-retry input variant accepts the D18 success
  carrier instead of raw cursor/input, exact-tail verifies and reprojects it,
  calls existing `traverseFromCursor`, and joins the existing loop immediately
  before leaf resolution with the full existing effect dependencies; and
- projected carrier, prefix, projection, and traversal mismatches reject the
  existing Promise with four exact `TypeError` diagnostics before `fail()`,
  admission, or effect. AX-F09 binds each diagnostic to a negative mutation
  and proves zero event, prefix, runtime-failure, and effect delta.

Both final reviewers returned PASS and the F_H proxy independently verified
the live call sites, current retry carrier, worker PID event, transaction
delegations, raw-resume rejection, Event Store transaction behavior, and
`traverseFromCursor` relation. The exact accepted design is commit
`75a1daf5e4e0410c8536ca98e74a2162294d93eb`, tree
`9b4c5590f425b2ca10d9b150ccba94c7fc491b1a`. It changes only
`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`.

Production and tests remain banked at checkpoint `34624ffb`; no implementation
work entered any rejected design cut. The next authorized transition is one
exact coding plan against `75a1daf5`. Implementation remains held until that
plan receives blocking xhigh review, non-blocking Max assurance, and F_H proxy
approval.

## Entry 084 - Coding Plan 3 Frozen For Independent Review

Timestamp: 2026-08-07T08:50:00+10:00

Source: Max implementation worker read-only live-code census against accepted
design commit 75a1daf5, Max pre-plan Public lifecycle seam probe, and Codex F_H
proxy scope adjudication.

Implementation remains held. The exact plan subject is the following 22-file
cone. It preserves the banked production checkpoint 34624ffb and admits no
catalog, Product-port, artifact, root-state, continuation-authority, package
map, ticket, or design change.

Semantic production:

1. code/src/abg/event_store.ts
2. code/src/abg/execution_basis.ts
3. code/src/abg/open_call.ts
4. code/src/abg/c_call.ts
5. code/src/abg/traversal_route.ts
6. code/src/abg/retry.ts
7. code/src/abg/fan_out.ts
8. code/src/abg/event_log.ts
9. code/src/hog/execute.ts
10. code/src/hog/graph_execute.ts
11. code/src/abg/index.ts
12. code/src/hog/index.ts
13. code/src/public/operations.ts

Mechanical signature migrations:

14. test_env/support/fresh-process-runtime-proof.mjs
15. test_env/tests/m5-event-store-reopen.test.mjs
16. test_env/tests/m5-event-calculus-runtime.test.mjs
17. test_env/falsifiers/installed-worker.mjs
18. test_env/falsifiers/runtime-f06-worker.mjs
19. test_env/tests/t287-r6-retry-success-exit.test.mjs

AX-F09 proof:

20. test_env/falsifiers/runtime-f09-worker.mjs
21. test_env/falsifiers/runtime-f09.mjs
22. new test_env/tests/t287-ax-f09-d17-d18.test.mjs

The Event Store change adds the closed DurablePrefixCoordinate, nominal exact
validator, pure stable first-N reader, exact-held-tail assertion, new-empty
append-sink acquisition, atomic close result, and genuine reopen prefix. One
private transaction runner returns value plus rollback-protected successor.
The generic transaction keeps T; the existing expected-prefix transaction
keeps expectedPrefixDigest and returns value plus nullable successor. Empty or
in-memory commits return null. Coordinate construction and validation remain
inside appendDurablyBatch's truncate/fsync rollback boundary.

The exact expected-prefix consumers are fan_out.ts::admitFanOutCompletion,
which selects value, and retry.ts::admitRetryRuntimeFailureTransition, which
retains value plus successor. The generic HoG execute and retry-exit
transactions and all five compareAndAppendExpectedPrefix consumers remain
unchanged.

Production creates its new episode through createNewEmptyAppendSink and
event_log.ts no longer configures a late sink. The two Public close helpers
select only reopenAuthority from the atomic close pair. The private Public
store-access adapter returns only a store, never a claimed reopened context or
prefix. Its same-held branch requires equal authority/path and an
admission-open store; otherwise it calls genuine reopen and strips the prefix
for legacy callers. No current Public consumer needs that prefix. D17 and
AX-F09 P2 bypass this adapter and consume genuine coordinates directly.

Source-internal prefix projectors are extracted in execution_basis.ts,
open_call.ts, c_call.ts, and traversal_route.ts. They reconstruct execution
basis, implementation set, opened scope, CCall/result/judgment, and retry route
from the explicit immutable prefix. Existing store APIs remain equality
wrappers. None of these helpers is installed.

D17 in abg/retry.ts validates the explicit prefix, scopes Event Calculus,
reconstructs every retry ordinal and causal row, preserves repeated reason
classes as distinct rows, structurally rederives the complete frontier, and
selects the existing admitted inputValue as the sole executable preimage.
durablePrefixDigest is prefix.prefixDigest. D17 emits no event, acquires no
store, and exposes only the accepted ten refusal codes.

D18 in hog/graph_execute.ts reprojects D17, validates the complete enclosing
relation, exact-tail checks the held sink, and atomically admits retry route,
applied cursor, and fresh attempt through the existing expected-prefix
transaction. Private thrown aborts roll back the whole transition before
mapping to the six typed refusals. Its success contains the verified successor.

The retained retry Map path and independent completion path are deleted from
hog/execute.ts. The existing executeGraphTraversal callable gains the accepted
closed XOR initial/raw versus projected-retry input. Its projected branch
validates carrier, exact successor tail, reconstructed route/cursor/attempt/
input/Event-Calculus truth, and traverseFromCursor before joining the existing
loop immediately before leaf resolution. The four mismatch classes reject
with the exact accepted TypeError diagnostics before fail(), admission, or
effects. No third retry callable or completion projector is added.

Installed abg and hog index modules expose only the accepted Event Store, D17,
D18, and XOR types/callables. No export-map change occurs.

All fourteen existing projectReopenAuthorityAndClose calls are migrated
explicitly. Non-AX-F09 callers preserve their authority-only outward shape.
AX-F09 alone consumes both prefix and reopenAuthority.

AX-F09 uses one authentic durable file. P1 admits failures one and two,
projects and structurally asserts D17, atomically closes, and hands exactly
prefix, reopenAuthority, selector, expectedExecutableRetryInputRef, and
expectedExecutableRetryInputDigest to P2. P2 genuinely reopens, proves equal
D17 identity, executes the four eventless negative mutations, invokes D18,
then passes its success through the existing executeGraphTraversal projected
branch. It proves attempts 1/2/3, progress 1/2, three effects, exact attempt-3
input, completion, Event Calculus, and replay. The existing ABA fixture adds
only the three-row repeated-reason structural assertion.

TDD is ordered: red missing exports/AX-F09; Event Store lifecycle and rollback;
D17 repeated-reason frontier; D18/XOR/AX-F09; banked retry/fan-out/Public
regressions and R10; then one full M5. Any newly discovered non-test in-memory
ordinary retry ingress that cannot supply a durable successor is a blocker,
not permission to retain a fallback path.

Freeze evidence must bind the accepted authority and banked behavior, exact
candidate/tree/diff, focused and full results, installed subpath resolution,
one-file P1/P2 identities, the five-key handoff, predecessor/close/reopen/
successor coordinates, D17 equality and full frontier, D18 identities, four
eventless diagnostics, final completion/EC/replay, and deletion census.
Generated evidence promotion, commit, push, and all release work remain
outside implementation authority.

This plan is now frozen for blocking xhigh and non-blocking Max review. It is
not yet accepted.

## Entry 085 - Coding Plan 3 Held Before Implementation

Timestamp: 2026-08-07T08:57:00+10:00

Source: independent xhigh blocking review, independent Max assurance review,
and Codex F_H proxy live-code adjudication of frozen Entry 084 at SHA-256
f92de2bae322bc1e31e734a71be1262b674b979834177750f6cd69db1dd12f46.

Disposition: HOLD. Accepted design 75a1daf5 remains closed and production
checkpoint 34624ffb remains untouched. The plan, not the design or code, has
six bounded defects:

1. hog/execute.ts admits retry failure and owns the durable successor, while
   hog/graph_execute.ts owns D17/D18. Deleting completeRetryTraversal without
   one closed private source-internal handoff strands ordinary retry or forces
   a callback/cycle/fallback. The replacement plan must name a non-installed,
   non-completion control result carrying the non-null successor and exact
   selector; graph_execute consumes it immediately through
   D17 -> D18 -> executeGraphTraversal(projectedRetryResume).
2. The 22-file cone omits live bare-constructor, configureDurableLog, installed
   AbgEventStore, and installed generic-transaction consumers. Accepted design
   requires those acquisition bypasses unreachable outside event_store.ts and
   bars a test-only authority path. The complete grep-derived migration census
   must enter the plan and each occurrence must be classified.
3. The pure projector seam must be exact:
   DurablePrefixCoordinate -> stable first-N read ->
   ValidatedRuntimeEventPrefix -> pure module projectors. Existing internal
   store wrappers may supply a validated immutable event prefix for legacy
   admission/equality mechanics; they may never fabricate or select a current
   DurablePrefixCoordinate.
4. The proposed Public store-only compatibility adapter is rejected. It would
   preserve context-store replacement and reopened-store semantic read
   authority while discarding the genuine prefix, contrary to the accepted
   hard break. Effectful reopen retains and verifies the genuine store/prefix
   pair; semantic reads use exact-prefix projectors; pure reads use a coordinate
   without acquiring a store.
5. AX-F09 P2 must run D18 first, then the four eventless negative projected
   calls, then the untouched successful projected call. All four mutations
   require D18 success and one requires its postcommit successor.
6. D17 declares eleven refusal codes, not ten. The replacement plan must bind
   the exact accepted list.

Both reviewers separately accepted the Event Store rollback boundary, the two
expected-prefix and five CAS consumer censuses, D17 full-frontier direction,
D18 private-abort atomicity, XOR branch, exact four eventless diagnostics, and
one-file fresh-process oracle. Coding Plan 4 is authorized only to close the
six defects above and return one complete replacement plan. Implementation
remains held.

## Entry 086 - Plan 4 Hard-Break Census And Acquisition Adjudication

Timestamp: 2026-08-07T09:10:00+10:00

Source: independent xhigh exhaustive live-code census, independent Max
root-context decomposition, and Codex F_H proxy adjudication.

The accepted hard break reaches 39 bare Event Store constructor occurrences
across 22 files, 15 configureDurableLog occurrences across 11 files, installed
AbgEventStore and generic-transaction exports/assertions, and one adjacent
manifest-generation dependency. The literal code/test_env acquisition and
export cone is 29 files; code/src/index.ts is the transitive root-export
verification surface and scripts/generate-product-manifest.mjs must stop
locating installed environment admission through the removed constructor.

The reviewers disagreed on whether a source-exported
createInMemoryEventStore factory would be lawful. Max viewed an uninstalled,
unconfigured factory as the implementation carrier of the design's explicit
in-memory transaction result. Xhigh showed that the frozen acquisition law
closes callable acquisition to new-empty or authority-only reopen and
explicitly removes test-only and absent-sink paths. The F_H proxy sustains the
stricter reading. No external in-memory factory is authorized. The constructor
may remain private inside event_store.ts; external test and falsifier
admissions migrate to authentic new-empty durable acquisition, while read-only
fixtures migrate to coordinate-based pure projection. The in-memory null
successor remains an internal behavior, not a third callable.

Public decomposition is also exact. Continuation, gap, and run-projection
authority carriers must retain the genuine DurablePrefixCoordinate beside
reopen authority. Project reads, gap reads, run projections, and source-result
derivation are coordinate-only and acquire no append sink. Interaction
response, run continuation, run re-entry, and root reopen are effectful and
consume authority-only reopen plus its equal coordinate. pendingReopenAuthority,
implicit remembered reopen, mixed pure/effectful reopen helpers, context store
replacement, and reopened-store semantic reads are deletion targets.

Coding Plan 4 is being organized as three dependency-ordered implementation
checkpoints within one accepted relation: Event Store/acquisition hard break;
Public carrier and pure/effectful exact-prefix migration; then D17/D18,
ordinary retry handoff, and AX-F09. Intermediate checkpoints may compile and
receive focused review but do not independently claim A5-F10 acceptance. No
compatibility seam is permitted between them; one final integrated candidate
must receive full qualification and independent review.

## Entry 087 - Corrected Coding Plan 4 Frozen For Review

Timestamp: 2026-08-07T09:27:00+10:00

Source: Max implementation worker complete replacement plan, xhigh acquisition
census, Max Public decomposition, Codex Product-to-code review, and the final
catalog/transaction/oracle correction.

Authority is accepted design commit 75a1daf5, tree 9b4c5590. Banked production
34624ffb is preserved. Implementation remains held. The plan contains three
dependency-ordered compile-closed checkpoints and one final integrated
candidate:

| Checkpoint | Relation | Files |
|---|---|---:|
| 4A | Event Store coordinate/acquisition hard break and complete caller/export migration | 36 |
| 4B | exact-prefix projector cores and Public pure/effectful authority hard break | 29 |
| 4C | D17, D18, ordinary retry handoff, and AX-F09 | 17 |
| union | exact implementation/proof cone | 61 |

The overlaps are 4A/4B nine files, 4A/4C seven, 4B/4C seven, and triple
overlap two. No checkpoint independently claims A5-F10 acceptance. No
compatibility factory, adapter, overload, callback, fallback, or temporary
installed seam is allowed.

### 4A

Event Store adds the exact closed DurablePrefixCoordinate, nominal validator,
stable first-N pure reader, exact held-tail assertion, new-empty acquisition,
genuine authority-only reopen prefix, atomic close pair, and rollback-protected
durable successor. The public generic transaction remains T. One private
runner and the existing expected-prefix helper return
{value, successorPrefix}; empty or internally unconfigured transactions
produce null. Fan-out selects value; retry retains value plus successor. The
five existing CAS consumers and the two direct source-internal generic
transaction consumers do not move.

Only createNewEmptyAppendSink and reopenEventStore may acquire a writable Event
Store. The concrete constructor and configuration mechanics remain private to
event_store.ts. There is no createInMemoryEventStore, optional prefix,
current-prefix projector, same-held fake reopen, or store-to-coordinate
conversion. The installed abg index removes runtime AbgEventStore construction
and the generic transaction while retaining the AbgEventStore type and
exporting the accepted acquisition/read surfaces.

All 39 constructor occurrences, 15 configure calls, installed export
assertions, root export, and manifest-generator dependency migrate in the same
checkpoint. Event-admitting fixtures use the real new-empty acquisition.
Read-only fixtures use coordinate projection or are deleted. One shared
test_env helper may allocate an absent temporary path, call the real
createNewEmptyAppendSink, register cleanup, and return its genuine store and
zero prefix. It may not create/restamp events, infer semantics, reopen, hide a
coordinate, or enter production.

4A files:

1. code/src/abg/event_log.ts
2. code/src/abg/event_store.ts
3. code/src/abg/fan_out.ts
4. code/src/abg/index.ts
5. code/src/abg/retry.ts
6. code/src/hog/execute.ts
7. code/src/hog/retry_exit.ts
8. code/src/public/operations.ts
9. code/src/index.ts
10. scripts/generate-product-manifest.mjs
11. test_env/falsifiers/contract-lanes.mjs
12. test_env/falsifiers/installed-worker.mjs
13. test_env/falsifiers/pfc-f08-lane.mjs
14. test_env/falsifiers/runtime-deferred-application-worker.mjs
15. test_env/falsifiers/runtime-f06-worker.mjs
16. test_env/falsifiers/runtime-f08.mjs
17. test_env/falsifiers/runtime-f09-worker.mjs
18. test_env/falsifiers/runtime-f10-worker.mjs
19. test_env/falsifiers/runtime-lanes.mjs
20. test_env/falsifiers/runtime-preparation-refusal-worker.mjs
21. test_env/falsifiers/runtime-recursion-lifecycle-worker.mjs
22. test_env/falsifiers/runtime-recursion-route-worker.mjs
23. test_env/falsifiers/runtime-stale-rehydrate-worker.mjs
24. test_env/support/fresh-process-runtime-proof.mjs
25. test_env/support/new-empty-append-sink.mjs
26. test_env/support/root-installed-environment.mjs
27. test_env/tests/m5-event-calculus-runtime.test.mjs
28. test_env/tests/m5-event-store-reopen.test.mjs
29. test_env/tests/m5-fresh-process-reconstruction.test.mjs
30. test_env/tests/m5-installed-recursion.test.mjs
31. test_env/tests/m5-retry-lifecycle-authority.test.mjs
32. test_env/tests/r3-workspace-binding.test.mjs
33. test_env/tests/r4-catalog-admission.test.mjs
34. test_env/tests/r9-causal-result-closure.test.mjs
35. test_env/tests/runtime-scope-regressions.test.mjs
36. test_env/tests/t287-r6-retry-success-exit.test.mjs

4A proves build, Event Store reopen/rollback, installed export absence,
workspace acquisition, and fresh-process reconstruction. Static search must
find every direct or namespaced new AbgEventStore only inside event_store.ts,
and zero configureDurableLog or createInMemoryEventStore outside its private
implementation.

### 4B

The shared semantic chain is:

DurablePrefixCoordinate -> stable first-N read ->
ValidatedRuntimeEventPrefix -> pure ABG projectors -> Public interpretation.

D17 and Public pure reads obtain the validated prefix from a genuine
coordinate. Existing source-internal store wrappers may call the same pure
cores with selectValidatedRuntimeEventPrefix(store.readAll()) only for their
existing admission/equality mechanics. No wrapper constructs, accepts, or
returns a DurablePrefixCoordinate.

The exact pure cores cover execution basis and sets, opened scope, cursor,
CCall/result/judgment, recursion/retry route, Product install/workspace
admission projection, invocation/source-result, continuation/resume, and
replayValidatedRuntimeEventPrefix.

PublicContinuationAuthority, PublicGapAuthority, and
PublicRunProjectionAuthority retain the genuine DurablePrefixCoordinate beside
the genuine reopen authority and bind both in their closed digest. Project
reads, gap reads, run projections, and source-result derivation consume only
the coordinate and never acquire an append sink. Interaction response, run
continuation, run re-entry, root re-entry, product install, and workspace bind
use genuine effect acquisition; reopen returns an equal coordinate, the held
store performs effects only, and close returns the atomic successor pair.
pendingReopenAuthority, implicit remembered reopen, mixed pure/effect helpers,
context store replacement, same-held fake reopen, and reopened-store semantic
reads are deleted.

Catalog authority follows the current Product and T287 graph-catalog
contraction, which supersede stale catalog-event material in the older M05
design. catalog.admit is pure exact-basis readiness/catalog construction;
catalog.view and catalog.apply are pure. None consumes a store, prefix, reopen
authority, artifact admission, runtime event, Event Calculus fluent, replay
lifecycle, registry row, RootOperationState, or successor prefix. Artifact
runtime admission in environment_admission.ts is structurally limited to
product.install and workspace.bind. Generic artifact admission cannot accept
catalog admit/view/apply. No checked catalog transaction, catalog artifact
projection, catalog registry event, or catalog lifecycle enters 4A/4B.
run.invoke records exact catalog use only as an execution fact.

4B files:

1. code/src/abg/event_log.ts
2. code/src/abg/event_store.ts
3. code/src/abg/index.ts
4. code/src/abg/execution_basis.ts
5. code/src/abg/open_call.ts
6. code/src/abg/traversal_cursor.ts
7. code/src/abg/c_call.ts
8. code/src/abg/traversal_route.ts
9. code/src/abg/environment_admission.ts
10. code/src/abg/invocation_admission.ts
11. code/src/abg/continuation.ts
12. code/src/public/operations.ts
13. code/src/public/continuation_authority.ts
14. code/src/public/gap_authority.ts
15. code/src/public/run_projection_authority.ts
16. code/src/public/cli.ts
17. code/src/public/index.ts
18. scripts/generate-product-manifest.mjs
19. test_env/falsifiers/contract-lanes.mjs
20. test_env/falsifiers/installed-worker.mjs
21. test_env/falsifiers/runtime-f08.mjs
22. test_env/support/fresh-process-runtime-proof.mjs
23. test_env/support/root-cli-environment.mjs
24. test_env/tests/m5-consensus-module.test.mjs
25. test_env/tests/m5-installed-consensus.test.mjs
26. test_env/tests/m5-installed-external-product.test.mjs
27. test_env/tests/m5-installed-fp.test.mjs
28. test_env/tests/m5-installed-portability.test.mjs
29. test_env/tests/rival-authority-mutations.test.mjs

4B proves build, installed portability/external/Consensus behavior, and rival
authority mutations. Static proof requires zero Public store.readAll,
late configuration, construction, pending reopen authority, implicit reopen,
or context.store replacement.

### 4C

D17 accepts one genuine coordinate, exact selector, and immutable Program,
GraphFunction, and Graph. It reconstructs every attempt row through the
selected progress ordinal from the validated immutable event prefix; preserves
repeated reason classes as distinct rows; produces code-unit-sorted unique
summaries; sets durablePrefixDigest to prefix.prefixDigest; structurally
rederives the complete frontier; emits no event; and acquires no store.

Its exact eleven refusal codes are prefix_mismatch, basis_mismatch,
frontier_absent, frontier_ambiguous, frontier_stale,
frontier_lineage_mismatch, retry_declaration_mismatch, preimage_absent,
preimage_digest_mismatch, preimage_contract_mismatch, and
retry_not_permitted.

D18 reprojects D17, exact-tail verifies the held store, preflights the complete
relation, and atomically admits route, applied cursor, and fresh attempt in the
existing expected-prefix transaction. Private thrown aborts roll back before
mapping to the exact six refusals: projection_mismatch, prefix_mismatch,
runtime_basis_mismatch, retry_step_refused, retry_route_refused, and
retry_attempt_refused.

hog/execute.ts returns one private non-installed RetryFrontierHandoff only on
an admitted retry transition. It carries the retry-disposition transition
with non-null successor and an exact selector derived solely from opened scope
and admitted progress. It is not ExecutableTraversalCompletion, identity,
runtime truth, or Public state. graph_execute.ts is its sole consumer and runs
D17 -> D18 -> the existing executeGraphTraversal projected branch. The former
selectRetryInput/store.readAll selection, RetainedRetryInput threading,
completeRetryTraversal, and retry-input-basis-absent path are deleted. There
is no Map, callback, cycle, side channel, or fallback.

executeGraphTraversal has the exact raw-versus-projected XOR. The projected
branch validates before fail(), admission, or effects in carrier, physical
prefix, semantic projection, and traverseFromCursor order, mapping only to the
four accepted exact TypeError diagnostics.

AX-F09 uses one durable file. P1 executes failures one and two, projects D17,
atomically closes, and hands exactly prefix, reopenAuthority, selector, and
expected D17 ref/digest to P2. P2 starts after P1 exits, genuinely reopens,
proves equal D17, runs successful D18, then the four eventless negative
executeGraphTraversal calls with exact event/byte/prefix/runtime-failure/effect
equality around each, then the untouched successful projected call. It proves
attempts 1/2/3, progress 1/2, three effects, hidden attempt-three input,
completion, Event Calculus, and replay. ABA separately proves repeated reason
rows do not collapse.

4C files:

1. code/src/abg/event_store.ts
2. code/src/abg/execution_basis.ts
3. code/src/abg/open_call.ts
4. code/src/abg/traversal_cursor.ts
5. code/src/abg/c_call.ts
6. code/src/abg/traversal_route.ts
7. code/src/abg/retry.ts
8. code/src/abg/index.ts
9. code/src/hog/execute.ts
10. code/src/hog/graph_execute.ts
11. code/src/hog/index.ts
12. test_env/falsifiers/runtime-f09-worker.mjs
13. test_env/falsifiers/runtime-f09.mjs
14. test_env/tests/m5-retry-lifecycle-authority.test.mjs
15. test_env/tests/t287-ax-f09-d17-d18.test.mjs
16. test_env/tests/t287-r4-aba-retry.test.mjs
17. test_env/tests/t287-r6-retry-success-exit.test.mjs

4C proves build, AX-F09, ABA, installed retry, and R6. Static proof requires
zero legacy retry selection/threading/completion symbols, one private handoff
producer/consumer, and projectedRetryResume only on the declared path.

### Final gate

After all focused checkpoint proofs, run git diff --check, build, R10, full M5,
pack dry-run, all three focused sets, installed export-negative proofs, and
one independent frozen-candidate review. The final candidate must prove only
sanctioned Event Store acquisition, genuine coordinate/reopen pairing,
exact-prefix pure reads, no Public store truth, pure eventless catalog,
eleven-code D17, six-code D18, ordinary and fresh-process retry through the
same D17/D18 path, four eventless negative diagnostics, EC/replay agreement,
and zero compatibility or alternate authority path.

Any file outside the 61-file union or any newly discovered non-test
in-memory/durable acquisition is a stop and re-adjudication condition.
Specification, design, ticket, Product/Public operation addition, new event
kind, package-map expansion, catalog lifecycle, compatibility export, release,
tag, push, and generated evidence promotion remain outside implementation
authority.

This corrected Plan 4 is frozen for independent xhigh blocking and Max
non-blocking review. It is not accepted.

## Entry 088 - Coding Plan 4 Review Hold And Bounded Correction

Timestamp: 2026-08-07T09:34:14+10:00

Source: independent xhigh blocking review, independent Max review, and Codex
F_H-proxy adjudication against the Product frame and live caller graph.

Disposition: HOLD Entry 087. Accepted design commit `75a1daf5`, banked
production checkpoint `34624ffb`, the 61-file dependency cone, and the Product
classification remain fixed. No production or test implementation is
authorized by this entry.

The reviewers independently proved that 4A is not a lawful compile-closed
checkpoint. It makes the reopened prefix mandatory while deferring deletion of
Public's fabricated reopened context, ambient reopen state, and context-store
replacement to 4B. No temporary optional prefix, compatibility adapter,
same-held reopen, or store-to-coordinate conversion is lawful. The smallest
correction is one compile-closed 4AB foundation checkpoint: 56 files, followed
by 4C at 17 files, with 12 overlapping files and 61 files in the union.

The reviewers also proved that artifact truth already has one lawful Event
Calculus projector, `projectArtifactTruth(ValidatedRuntimeEventPrefix)`.
Product-install and workspace-binding projections in
`environment_admission.ts` must consume and select from that existing
projector. They must not introduce an independent raw-event or direct-prefix
fold. Catalog admit/view/apply remain pure, eventless, and outside artifact
runtime admission.

The Max review additionally found that 4C does not make the retry handoff's
compile/export migration exact. Live `completeExecutableTraversal` is a
source-exported producer called by `graph_execute.ts` and directly by the R9
and rival-authority tests. The replacement plan must name one exact producer
signature and return shape, preserve the installed export-negative boundary,
and migrate every direct caller with no fallback. This is sustained as a
planning-precision correction; it does not reopen D17/D18 design.

The implementation worker has been directed to return one minimal replacement
Plan 4 containing only those three corrections. Implementation, tests, freeze,
and qualification remain held pending a new frozen dual review and F_H-proxy
acceptance.

## Entry 089 - Replacement Coding Plan 4 Frozen For Review

Timestamp: 2026-08-07T09:38:31+10:00

Source: Max implementation worker bounded plan correction answering Entry 088.

Disposition: This entry supersedes Entry 087 and answers Entry 088. It remains
plan-only commentary and grants no implementation authority. No production or
test edit is authorized.

# Coding Plan 4 — replacement for Entry 087

No production or test edits are authorized by this plan review.

## Frozen authority

- Accepted design commit: `75a1daf5e4e0410c8536ca98e74a2162294d93eb`
- Accepted design tree: `9b4c5590f425b2ca10d9b150ccba94c7fc491b1a`
- Preserved banked code: `34624ffbe70e936d06d69903c2c47ea2987c2c3a`
- Checkpoint order: `4AB -> 4C`
- Neither checkpoint independently claims A5-F10 acceptance.
- No compatibility adapter, temporary seam, optional-prefix overload, third Event Store factory, or fabricated authority is permitted.

## Checkpoint arithmetic

- `4AB`: 56 files
- `4C`: 17 files
- `4AB ∩ 4C`: 12 files
- Unique union: `56 + 17 - 12 = 61 files`

# 4AB — compile-closed Event Store, exact-prefix, and Public hard break

4AB atomically combines former 4A and 4B. Mandatory reopen coordinates and removal of Public fabricated reopen/store replacement must land together.

## Event Store and transaction law

- Only `createNewEmptyAppendSink` and genuine `reopenEventStore` may acquire a store.
- Every reopen returns a genuine durable prefix.
- Public continuation, gap, and run-projection authorities carry the atomic `{prefix, reopenAuthority}` pair.
- Remove Public same-held reopen, fabricated reopen authority, store replacement, store-only adapters, late durable-log configuration, and external `AbgEventStore` construction.
- Pure semantic reads use:

```text
DurablePrefixCoordinate
  -> exact first-N durable read
  -> ValidatedRuntimeEventPrefix
  -> prefix projector
```

- Public generic transaction helper remains `T`.
- Private transaction runner returns `{value, successorPrefix}`.
- Expected-prefix helper returns `{value, successorPrefix}`.
- Successor construction remains inside rollback protection.

## Artifact-truth binding

`environment_admission.ts` Product-install and workspace-binding projection must consume the existing canonical projector:

```ts
projectArtifactTruth(prefix: ValidatedRuntimeEventPrefix)
```

Required relation:

```text
ValidatedRuntimeEventPrefix
  -> artifact_truth.ts::projectArtifactTruth
  -> select Product install/workspace-binding truth
  -> environment admission projection
```

Forbidden:

- Independent direct-prefix folding in `environment_admission.ts`.
- Raw-event iteration or reconstruction there.
- A second artifact-truth projector.
- Product-install/workspace truth inferred outside `projectArtifactTruth`.
- Catalog kinds entering artifact admission.

Effectful artifact truth is closed to:

- `product.install`
- `workspace.bind`

Generic `admitArtifact` must structurally exclude catalog admit/view/apply kinds.

## Catalog closure

`catalog.admit`, `catalog.view`, and `catalog.apply` remain pure, eventless, and store-free exact-basis readiness/catalog construction.

They consume the accepted Product readiness/catalog basis and do not consume:

- Store
- Durable prefix
- Reopen authority
- Runtime event
- Event Calculus fluent
- Replay lifecycle
- Registry row
- `RootOperationState`
- Artifact admission
- Successor prefix

No checked catalog transaction, catalog artifact projection, catalog registry event, or catalog successor prefix enters 4AB.

Only `run.invoke` may indirectly relate catalog basis to runtime truth by recording exact catalog use as an execution fact.

## 4AB file set — 56

1. `code/src/abg/c_call.ts`
2. `code/src/abg/continuation.ts`
3. `code/src/abg/environment_admission.ts`
4. `code/src/abg/event_log.ts`
5. `code/src/abg/event_store.ts`
6. `code/src/abg/execution_basis.ts`
7. `code/src/abg/fan_out.ts`
8. `code/src/abg/index.ts`
9. `code/src/abg/invocation_admission.ts`
10. `code/src/abg/open_call.ts`
11. `code/src/abg/retry.ts`
12. `code/src/abg/traversal_cursor.ts`
13. `code/src/abg/traversal_route.ts`
14. `code/src/hog/execute.ts`
15. `code/src/hog/retry_exit.ts`
16. `code/src/public/cli.ts`
17. `code/src/public/continuation_authority.ts`
18. `code/src/public/gap_authority.ts`
19. `code/src/public/index.ts`
20. `code/src/public/operations.ts`
21. `code/src/public/run_projection_authority.ts`
22. `code/src/index.ts`
23. `scripts/generate-product-manifest.mjs`
24. `test_env/falsifiers/contract-lanes.mjs`
25. `test_env/falsifiers/installed-worker.mjs`
26. `test_env/falsifiers/pfc-f08-lane.mjs`
27. `test_env/falsifiers/runtime-deferred-application-worker.mjs`
28. `test_env/falsifiers/runtime-f06-worker.mjs`
29. `test_env/falsifiers/runtime-f08.mjs`
30. `test_env/falsifiers/runtime-f09-worker.mjs`
31. `test_env/falsifiers/runtime-f10-worker.mjs`
32. `test_env/falsifiers/runtime-lanes.mjs`
33. `test_env/falsifiers/runtime-preparation-refusal-worker.mjs`
34. `test_env/falsifiers/runtime-recursion-lifecycle-worker.mjs`
35. `test_env/falsifiers/runtime-recursion-route-worker.mjs`
36. `test_env/falsifiers/runtime-stale-rehydrate-worker.mjs`
37. `test_env/support/fresh-process-runtime-proof.mjs`
38. `test_env/support/new-empty-append-sink.mjs`
39. `test_env/support/root-cli-environment.mjs`
40. `test_env/support/root-installed-environment.mjs`
41. `test_env/tests/m5-consensus-module.test.mjs`
42. `test_env/tests/m5-event-calculus-runtime.test.mjs`
43. `test_env/tests/m5-event-store-reopen.test.mjs`
44. `test_env/tests/m5-fresh-process-reconstruction.test.mjs`
45. `test_env/tests/m5-installed-consensus.test.mjs`
46. `test_env/tests/m5-installed-external-product.test.mjs`
47. `test_env/tests/m5-installed-fp.test.mjs`
48. `test_env/tests/m5-installed-portability.test.mjs`
49. `test_env/tests/m5-installed-recursion.test.mjs`
50. `test_env/tests/m5-retry-lifecycle-authority.test.mjs`
51. `test_env/tests/r3-workspace-binding.test.mjs`
52. `test_env/tests/r4-catalog-admission.test.mjs`
53. `test_env/tests/r9-causal-result-closure.test.mjs`
54. `test_env/tests/rival-authority-mutations.test.mjs`
55. `test_env/tests/runtime-scope-regressions.test.mjs`
56. `test_env/tests/t287-r6-retry-success-exit.test.mjs`

## 4AB proof gate

```sh
git diff --check
npm run build
node --test --test-concurrency=1 \
  test_env/tests/m5-event-store-reopen.test.mjs \
  test_env/tests/m5-fresh-process-reconstruction.test.mjs \
  test_env/tests/m5-retry-lifecycle-authority.test.mjs \
  test_env/tests/r3-workspace-binding.test.mjs \
  test_env/tests/r4-catalog-admission.test.mjs \
  test_env/tests/m5-installed-fp.test.mjs \
  test_env/tests/m5-installed-consensus.test.mjs \
  test_env/tests/m5-installed-external-product.test.mjs \
  test_env/tests/m5-installed-portability.test.mjs \
  test_env/tests/r9-causal-result-closure.test.mjs \
  test_env/tests/rival-authority-mutations.test.mjs
```

Static constructor oracle:

```sh
rg -n --pcre2 \
  'new\s+(?:[A-Za-z_$][A-Za-z0-9_$]*\s*\.\s*)*AbgEventStore\b' \
  code/src test_env scripts
```

Expected: construction is confined to `code/src/abg/event_store.ts`.

Artifact/catalog oracle:

- Every Product-install/workspace prefix projection reaches `projectArtifactTruth`.
- `environment_admission.ts` contains no independent raw-event/prefix fold.
- Catalog admit/view/apply reach no Event Store, transaction, artifact admission, registry-event, or successor-prefix path.

# 4C — D17, D18, ordinary retry handoff, and AX-F09

## Exact producer seam

Use the existing callable. Do not introduce a second completion callable.

Add the source-internal types in `hog/execute.ts`:

```ts
export interface RetryFrontierHandoff {
  readonly kind: "retry_frontier_handoff";
  readonly schemaVersion: "5.0.0";
  readonly retryTransition:
    RetryRuntimeFailureTransitionAdmission & {
      readonly disposition: "retry";
      readonly progress: RetryContinuationProgressAdmission;
      readonly successorPrefix: DurablePrefixCoordinate;
    };
  readonly selector: RetryFrontierSelector;
}

export type CompleteExecutableTraversalResult =
  | ExecutableTraversalCompletion
  | RetryFrontierHandoff;
```

The handoff has exactly four keys:

```text
kind
schemaVersion
retryTransition
selector
```

Widen the existing callable:

```ts
export async function completeExecutableTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
): Promise<CompleteExecutableTraversalResult>
```

The sole construction site remains the existing private transition producer, whose return type is widened:

```ts
function completeRuntimeFailureTransition<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
): CompleteExecutableTraversalResult
```

On admitted retry disposition it returns `RetryFrontierHandoff`. On blocked or failed disposition it returns `ExecutableTraversalCompletion`.

There is:

- One handoff producer: `completeRuntimeFailureTransition`.
- One semantic handoff consumer: `graph_execute.ts`.
- No new source-internal callable.
- No callback, fallback, retained map, cycle, or alternate retry carrier.

## Direct-caller migration

Live direct callers are exhaustively:

1. `code/src/hog/graph_execute.ts`
   - One call.
   - Discriminate immediately by `completion.kind`.
   - Handoff branch performs D17, then D18, then recursive `executeGraphTraversal({projectedRetryResume})`.
   - Completion branch continues the existing completion path.
2. `test_env/tests/rival-authority-mutations.test.mjs`
   - One direct deep-module call.
   - Assert `kind === "executable_traversal_completion"` before reading completion fields.
   - An unexpected handoff fails the test; it is not converted or retried.
3. `test_env/tests/r9-causal-result-closure.test.mjs`
   - Two direct deep-module calls.
   - Each asserts `kind === "executable_traversal_completion"` before reading completion fields.
   - An unexpected handoff fails the test; it is not converted or retried.

No other live direct caller exists.

## Installed export-negative law

Do not export through `hog/index.ts`, `code/src/index.ts`, or installed `./hog`:

- `completeExecutableTraversal`
- `RetryFrontierHandoff`
- `CompleteExecutableTraversalResult`

`graph_execute.ts` imports the callable and types directly from `./execute.js`. Existing installed negative assertions remain affirmative proof that the low-level completion surface is hidden.

D17 and D18 retain only their accepted installed exports.

## 4C file set — 17

1. `code/src/abg/c_call.ts`
2. `code/src/abg/index.ts`
3. `code/src/abg/open_call.ts`
4. `code/src/abg/retry.ts`
5. `code/src/abg/traversal_cursor.ts`
6. `code/src/abg/traversal_route.ts`
7. `code/src/hog/execute.ts`
8. `code/src/hog/graph_execute.ts`
9. `code/src/hog/index.ts`
10. `test_env/falsifiers/runtime-f09-worker.mjs`
11. `test_env/falsifiers/runtime-f09.mjs`
12. `test_env/tests/m5-retry-lifecycle-authority.test.mjs`
13. `test_env/tests/r9-causal-result-closure.test.mjs`
14. `test_env/tests/rival-authority-mutations.test.mjs`
15. `test_env/tests/t287-ax-f09-d17-d18.test.mjs`
16. `test_env/tests/t287-r4-aba-retry.test.mjs`
17. `test_env/tests/t287-r6-retry-success-exit.test.mjs`

## 4C proof gate

```sh
git diff --check
npm run build
node --test --test-concurrency=1 \
  test_env/tests/t287-ax-f09-d17-d18.test.mjs \
  test_env/tests/t287-r4-aba-retry.test.mjs \
  test_env/tests/m5-installed-retry.test.mjs \
  test_env/tests/t287-r6-retry-success-exit.test.mjs \
  test_env/tests/m5-retry-lifecycle-authority.test.mjs \
  test_env/tests/r9-causal-result-closure.test.mjs \
  test_env/tests/rival-authority-mutations.test.mjs
```

Caller/export oracles:

```sh
rg -n 'completeExecutableTraversal\\(' code/src test_env
rg -n \
  'completeExecutableTraversal|RetryFrontierHandoff|CompleteExecutableTraversalResult' \
  code/src/hog/index.ts code/src/index.ts
```

Expected:

- Direct calls occur only in `graph_execute.ts`, the one rival-authority test, and the two R9 test sites.
- Installed index searches return no matches.
- Tests discriminate the union; only `graph_execute.ts` consumes the handoff.

# Exact overlap — 12

1. `code/src/abg/c_call.ts`
2. `code/src/abg/index.ts`
3. `code/src/abg/open_call.ts`
4. `code/src/abg/retry.ts`
5. `code/src/abg/traversal_cursor.ts`
6. `code/src/abg/traversal_route.ts`
7. `code/src/hog/execute.ts`
8. `test_env/falsifiers/runtime-f09-worker.mjs`
9. `test_env/tests/m5-retry-lifecycle-authority.test.mjs`
10. `test_env/tests/r9-causal-result-closure.test.mjs`
11. `test_env/tests/rival-authority-mutations.test.mjs`
12. `test_env/tests/t287-r6-retry-success-exit.test.mjs`

# Final integrated gate

```sh
git diff --check
npm run build
npm run test:r10
npm run test:m5
npm pack --dry-run
```

A5-F10 acceptance remains an integrated-candidate judgment after both compile-closed checkpoints pass.

## Entry 090 - Final Plan 4 Caller Closure And 4AB Authorization

Timestamp: 2026-08-07T09:46:52+10:00

Source: independent Max live-code review, Codex F_H-proxy review of the
ratified design, and exact transitive caller census.

Disposition: Entry 089 is accepted with the bounded caller-closure amendment
below. Checkpoint 4AB implementation and its focused proof gate are authorized.
Checkpoint 4C remains held.

The xhigh delta review accepted preservation of store-accepting artifact
wrappers based on the earlier planning allowance. That disposition is not
sustained. The ratified design is higher authority and states that
`hasAdmittedProductInstall` consumes the immutable artifact-truth projection
and has no store overload or fallback. The same single-truth relation applies
to workspace-binding verification. Commentary cannot override that design.

The transitive migration adds exactly four files to 4AB:

1. `code/src/abg/actor_process.ts`
2. `code/src/hog/leaf_invocation_port.ts`
3. `code/src/hog/installed_product.ts`
4. `test_env/tests/m5-s03-authority.test.mjs`

`leaf_invocation_port.ts` receives the immutable projection through its
install-bound HoG authority. `installed_product.ts` owns that authority
carrier, and `m5-s03-authority.test.mjs` is its only direct caller outside the
existing 4AB set. Actor workspace-binding projection threads through the
existing `ActorRuntimeBinding` path; its other construction and consumption
sites are already in 4AB. Every other direct artifact-install/workspace caller
is already present in Entry 089.

Final checkpoint arithmetic is:

```text
4AB:             60 files
4C:              17 files
4AB intersect 4C: 12 files
unique union:    65 files
```

Add `test_env/tests/m5-s03-authority.test.mjs` to the focused 4AB proof gate.
The existing R6, installed FP, installed Consensus, and fresh-process lanes
cover actor-runtime projection threading.

Implementation authority is limited to the 60-file 4AB set formed by Entry
089 plus these four paths. The worker shall implement the complete
compile-closed hard break, run the focused 4AB gate, freeze one exact candidate,
and stop for independent Max code review. No 4C, specification, design,
ticket, catalog-lifecycle, compatibility, release, tag, push, or unrelated
change is authorized.

## Entry 091 - 4AB Canonical Artifact Projector Census Correction

Timestamp: 2026-08-07T10:02:19+10:00

Source: Codex active code-surface review at the first artifact migration edit.

The worker edited `code/src/abg/artifact_truth.ts` outside the Entry 090 set
and was interrupted immediately. The edit is a required realization of the
already-ratified artifact-truth relation, not a new design: the sole canonical
projector lacks `definitionKey` and `definitionDigest`, while the ratified
`ArtifactTruthRow` and admitted event envelope require both. Without those
fields, `environment_admission.ts` cannot prove the complete install/workspace
relation through `projectArtifactTruth` and would need a rival raw-event read.

The file is therefore added to 4AB. No other new file is authorized. Final
arithmetic becomes:

```text
4AB:              61 files
4C:               17 files
4AB intersect 4C: 12 files
unique union:     66 files
```

The worker may resume from the current local patch. The canonical projector
must expose the ratified row fields; environment admission must consume it and
must not reinterpret `invocationRef` as a causation ref. Selection proves the
exact definition, authority-scope, artifact identity/digest, owner-admitted
disposition, and uniqueness relation. No second projector or store overload is
permitted. This is a local implementation correction; the accepted design and
4AB outcome remain closed.

## Entry 092 - Exact-Prefix Artifact Carrier Enforcement

Timestamp: 2026-08-07T10:14:44+10:00

Source: Codex active code-surface review against accepted design Section 5.4.

The worker was interrupted before threading the low-level structural
`ArtifactTruthProjection` any further as runtime admission authority. That
fold result lacks the durable prefix, prefix counts, projection ref, and
projection digest required by the ratified
`ExactPrefixArtifactTruthProjection`; as a structurally fabricable value it
cannot itself prove admitted runtime truth.

The correction uses no new file and makes no design decision. The existing
pure `projectArtifactTruth(ValidatedRuntimeEventPrefix)` remains the one Event
Calculus fold. `artifact_truth.ts` adds the already-specified total owner
boundary:

```text
DurablePrefixCoordinate
  -> stable exact first-N read
  -> ValidatedRuntimeEventPrefix
  -> projectArtifactTruth
  -> ExactPrefixArtifactTruthProjection | typed refusal
```

The exact projection carries the ratified prefix, event count, last admission
ordinal, code-unit-sorted rows, projection ref, and projection digest. The
total boundary maps malformed/unreadable prefixes, invalid envelopes/order,
same-scope conflicts, and duplicates to the accepted typed refusal family. It
does not throw for a declared refusal, acquire an append sink, or create a
second semantic fold.

Environment admission and the existing HoG/ABG/Public authority carriers
thread only the exact-prefix projection. The low-level fold is not accepted as
runtime admission authority or an installed alternative. Entry 091's full-row
and same-scope uniqueness rules remain binding. The 61-file 4AB authorization
and all other boundaries remain unchanged.

## Entry 093 - Max-Only Worker And Review Enforcement

Timestamp: 2026-08-07T10:28:38+10:00

Source: direct F_H clarification and live agent census.

The earlier xhigh experiment is ended. Its short-term response speed did not
offset the cost of seams found later by Max review. The active execution model
is one Max implementation worker, one separate Max independent reviewer, and
the Ultra Codex root acting only as executive/F_H proxy and active code-surface
assurance. The completed xhigh review is historical evidence and is not in the
acceptance path.

The Max moving-code review found and returned four bounded blockers before
qualification:

1. Pure run, gap, continuation, and source-result reads must project their
   named prefix without reopening an append sink.
2. Effectful continuation and gap operations must derive all semantic
   preflight from that prefix before acquiring the sink.
3. An `ExactPrefixArtifactTruthProjection` must be re-derived from its named
   prefix and compared in full before its rows decide admission.
4. Artifact collision identity is `authorityScopeRef`; operation and
   definition are compared fields, not partitions that permit two meanings at
   one scope.

The first, third, and projector half of the fourth relation were corrected in
the moving tree. Review then found two residual counterexamples: artifact
admission still filtered preflight by operation plus scope and could append a
cross-operation collision before refusing, while `interaction.respond` and
`run.continue` still admitted Public truth before completing semantic
validation. Both remain blocking; no focused qualification or freeze is
permitted until their effects occur only after complete prefix-derived
preflight.

## Entry 094 - HoG Cursor Prefix-Projection Caller Closure

Timestamp: 2026-08-07T10:35:00+10:00

Source: Max worker transitive-owner report and Codex live caller census.

Prefix-only continuation preflight reaches one HoG-owned carrier boundary not
present in Entry 090: `code/src/hog/traversal.ts` alone owns restoration of the
module-private checked `TraversalCursor`. Public cannot reproduce that check,
fabricate a store adapter, or treat the WeakSet brand as durable truth.

That file is added to 4AB. Its existing cursor rehydration boundary hard-breaks
to a validated immutable prefix, with the ABG cursor admission predicate
projecting the same prefix. The four direct callers are already inside the
authorized transitive test/Public surfaces. No second reachable store/prefix
meaning or lifecycle is permitted. The WeakSet may mark the locally checked
carrier only after durable event proof.

Revised arithmetic:

```text
4AB:              62 files
4C:               17 files
4AB intersect 4C: 12 files
unique union:     67 files
```

This is caller closure for the accepted prefix-only relation, not design
re-entry. All other 4AB boundaries remain unchanged.

## Entry 095 - Atomic Continuation Owner Derived-Carrier Closure

Timestamp: 2026-08-07T11:07:01+10:00

Source: Ultra active code-surface review, independently confirmed by the Max
reviewer.

The production build and the 13/13 Event Store/artifact lane are green, but
three adjacent caller-authored fields remain reachable at the atomic
continuation owner boundary. They are one bounded realization defect, not a
design re-entry:

1. `commitFhInteractionResumeAtExpectedPrefix` accepts a caller-provided
   `durablePrefixDigest` and writes it into admitted resume truth without
   binding it to `predecessorPrefix.prefixDigest`.
2. The supplied successor cursor is checked only for structural validity and
   selected run/frame/input fields. A caller can change node, path, task,
   attempt, or retry lineage, recompute the cursor identity, and present a
   materially different transition.
3. Both atomic owners accept any non-empty operation variant. Direct installed
   calls can therefore bypass the Public parser's declared variant family.

The correction is local and pre-effect. The resume owner derives the durable
prefix digest from its exact predecessor coordinate; it derives the successor
cursor through the one HoG interaction-resume transition from the exact
prefix-held cursor and expected successor input; and the owners enforce the
declared variants (`approve | answer_escalation` for response and
`current_intent` for continuation). Forged digest, cursor, and variant probes
must prove zero durable-byte and zero event-count change.

No Product, design, catalog, event-kind, or Public-family change is authorized.
Caller migration and focused 4AB qualification may continue after these
relations are closed.

## Entry 096 - Preserve HoG Proposal And ABG Verification Separation

Timestamp: 2026-08-07T11:11:18+10:00

Source: Ultra module-dependency review, independently confirmed by the Max
reviewer against Product, Intent, and the accepted traversal design.

Entry 095's first repair imported HoG traversal functions into
`abg/continuation.ts`. That direction is rejected before freeze. HoG already
depends on ABG execution, scope, route, and cursor modules, so the change
created a real ABG/HoG runtime cycle and collapsed the accepted ownership
sequence:

```text
Public -> HoG derives the successor cursor
Public -> ABG verifies and admits that cursor
```

The local correction removes all HoG runtime imports from ABG. Public retains
the existing HoG rehydration and derivation calls. An ABG-owned pure verifier
in `abg/traversal_cursor.ts` independently proves, from the exact validated
prefix, that the held cursor was admitted and that every program, execution,
scope, run, graph-call, frame, graph, node, position, path, task, attempt, and
retry coordinate is unchanged. Only the input ref/digest may change, and those
must equal the ABG-derived successor input. The verifier also checks the
canonical successor cursor ref and digest.

This is the existing proposer/verifier/admitter composition, not a second
derivation or a new framework. The forged-cursor zero-effect probe remains
required. Caller migration and other focused work remain authorized in
parallel; freeze remains held until the cycle is removed.

## Entry 097 - AX-F08 Post-Target Replay Oracle Must Remain Exact

Timestamp: 2026-08-07T11:21:00+10:00

Source: Ultra falsifier code review against accepted Gate 1 Section 13.1.

The migrated AX-F08 response and resume fixtures now reach the atomic owners
on genuine independently reopened durable stores. They are not freeze-ready,
because the harness proves run-R replay equality only before the target call.
After the target it rewrites event refs, removes admission ordinals, and masks
the differing `durablePrefixDigest` while publishing the oracle claim
`exactRunRReplayEquality: true`.

Gate 1 requires exact control/interleaved equality after the target for the
run-R typed disposition, emitted run-R event bodies and refs, and run-R replay.
The unrelated run-S event must remain the sole mutation. The harness must add
the post-target replay equality assertion without silently repricing or
normalizing away a failed relation. If current global event identity or replay
coordinates make that assertion fail, the exact counterexample returns to the
bounded 4AB implementation surface before any freeze.

This holds AX-F08 only. The completed Event Store/artifact tests, R6 atomic
owner probes, other caller migration, and A5-F02 read-only donor review may
continue in parallel.

## Entry 098 - AX-F08 Physical And Run-Semantic Reference Frames

Timestamp: 2026-08-07T11:31:52+10:00

Source: Max independent review and F_H proxy adjudication of Entry 097.

Literal post-target raw `ReplayState` equality is unconstructable under the
accepted durable event envelope. The interleaved store has one additional
valid S event, so every later R event lawfully receives a global admission
ordinal one greater than its control counterpart. The ordinal participates in
`eventId`; downstream causal refs therefore differ. The verified predecessor
prefix, and the resume event's `durablePrefixDigest`, also differ because one
physical prefix contains S. Making those values equal would destroy exact
provenance and violate the gap-free global log.

Gate 1 AX-F08 is clarified into two recursive reference frames:

1. **Physical provenance.** S exists only in the interleaved log; global
   ordinals, event ids, and prefix digests differ exactly as expected; each
   resume event names its own verified predecessor coordinate; and no R event
   causally cites S.
2. **Run-semantic truth.** Under one declared correspondence between the R
   events, the typed disposition, event-kind/count sequence, domain payload and
   identity fields, Event Calculus HoldsAt set, lifecycle, status, and outcome
   are exactly equal.

The realization adds at most one pure replay-owned run-semantic projection and
digest over the exact validated scoped prefix. It reuses the existing Event
Calculus and replay fold, opens no store, admits no event, and creates no rival
truth. AX-F08 compares that production-owned projection exactly and separately
proves the physical-coordinate relations. Ad hoc test-only masking is not an
acceptance oracle.

No event identity, admission ordinal, prefix digest, or resume provenance field
may be deleted or normalized in durable truth. This is a bounded oracle and
projection clarification under F_H proxy authority; all other 4AB boundaries
remain unchanged.

## Entry 099 - Retry-Progress Causal Bridge For Child Foldback

Timestamp: 2026-08-07T12:02:42+10:00

Source: Max worker installed-Consensus counterexample and Ultra F_H proxy
function-to-design review.

The actual published Consensus one-surface Program reaches a lawful child
completion sequence that the current child-foldback owner rejects:

```text
c_call_judged
  -> retry_progress_recorded(progressClass = completed)
  -> traversal_route_admitted(routeKind = terminal)
  -> child foldback preflight
```

`admitChildFoldback` currently requires the terminal route to cite the
judgment event directly. The traversal-route owner instead correctly makes the
final completed retry-progress event its primary causal basis. The accepted
traversal design permits a route to derive from retry progress, so this is a
pre-existing local realization defect inside selected A5-F10 retry/foldback
truth, not a fixture or Product ambiguity.

F_H authorizes one bounded repair. Child foldback accepts either direct
judgment-to-route causation or a primary completed-retry-progress causal bridge
for the exact same Run, GraphCall, Frame, CCall, result, judgment, source
cursor, and target cursor. The complete declared predecessor chain must lead
back to that judgment. Retry/stopped progress, non-primary, foreign,
mismatched, forged, or stale bridges refuse before effects. The smallest
shared causal predicate belongs in `abg/retry_lifecycle.ts`; it proves only
this enclosing relation and must not become another retry projector or Event
Calculus fold.

Proof requires the direct-path positive control, the actual completed-retry
positive path, and eventless mismatched/non-primary negatives. No new event,
carrier, controller, fixture Program, or broad retry refactor is authorized.

## Entry 100 - A5-F02 Coding-Map Corrections Before Implementation

Timestamp: 2026-08-07T12:02:42+10:00

Source: Max F02 isolated-worktree census and Ultra F_H proxy review against
Product A5-F02, GTL identity/recursion requirements, and frozen S06 Section 8.

The F02 donor-to-current coding map is accepted with three corrections:

1. Whole-Program validation must not impose blanket acyclicity. A cycle is
   lawful only where the exact declared recursion constructor and its governed
   bound/foldback law authorize that cycle. C re-entry program loci do not
   become graph-edge identity. Qualification needs a positive declared bounded
   recursion control and an unauthorized-cycle refusal.
2. F02 owns opaque GraphFunction identity through authoring, raw/canonical
   admission and serialization, Module/Program publication membership,
   starts, applications, validator identity, and materialization. F03 owns
   carrying the admitted identity through HoG and ABG runtime facts. F02 may
   make compile-preserving runtime edits but cannot silently consume F03.
3. The installed `./gtl/m01` and `./gtl/m02` locators are required by the
   Public-contract requirement, but they must be thin entrypoints over one
   common implementation and type family. They cannot recreate two schema or
   language authorities.

Existing correct C operations are conserved and verified, not rewritten.
The isolated Max worker may now implement the corrected map; independent
acceptance remains separate.

## Entry 101 - Preserve GraphFunction Label And Opaque Identity Separation

Timestamp: 2026-08-07T12:07:00+10:00

Source: Ultra active review of the first isolated F02 identity edit.

The first draft added `GraphFunction.id`, but changed composition constructors
from a required human `name` to a required `id` and then derived `name` from
that id. That direction is stopped before broader caller migration. It
contradicts the live identity law and the selected donor contract: `name`
remains an independent human-readable label with no targeting semantics;
`id` is opaque, is automatically minted by default, and may be explicitly
provided where lawful.

The corrected GraphFunction constructor shape is `name` plus optional `id`.
All application, membership, start, substitution, and publication targeting
uses the resolved `.id`. Existing published URI identities may be supplied as
explicit ids during hard-break migration while human labels remain labels.
A label helper cannot become the sole authoring path.

Before broad migration, focused proof must show deterministic omitted-id
minting, lawful explicit-id preservation, equal labels with distinct ids, and
that changing or supplying a label cannot target another declaration. The
strict canonical-ingest work is unaffected and may continue.

## Entry 102 - One Public GraphFunction Identity Minting Surface

Timestamp: 2026-08-07T12:15:42+10:00

Source: Ultra active review of the corrected F02 identity increment.

The corrected constructor restores independent `name` and optional `id`, but
its aggregate GTL export also exposed `resolveGraphFunctionId({
canonicalBasis: unknown })`. That generic helper would let callers choose the
basis used to mint an apparently canonical identity, creating a second public
identity-authoring seam beside `constructGraphFunction` and the typed relation
constructors.

The helper is removed from the installed aggregate export. Public authoring
uses the one GraphFunction constructor family; relation-specific derivation is
internal and typed. Later raw admission must recompute or verify the applicable
canonical identity law rather than trust an arbitrary caller-supplied basis.
Validation must also reject two materially different carriers sharing one
explicit id. The F02 publication/validator migration may continue under that
correction.

## Entry 103 - Compress Retry Foldback Bridge To Its Cross-Owner Join

Timestamp: 2026-08-07T12:15:42+10:00

Source: Ultra active review of the landed Entry 099 implementation.

The real installed Consensus path now proves the repaired positive sequence:

```text
retry_progress_recorded
  -> terminal traversal_route_admitted
  -> graph_call_closed
  -> child_foldback_admitted
```

The first helper implementation is nevertheless not freezeable. Roughly 300
new lines in `retry_lifecycle.ts` restate completed-progress closed keys,
digest/ref law, attempt law, retry-path law, and predecessor projection already
owned by `retry.ts::projectRetryProgressAt`. It also restricts the bridge to
`judged_success` and introduces another sequence-equality implementation.
That is broader and less complete than the authorized cross-owner causal join.

The local correction retains the successful evidence but compresses the
helper to consume already admitted closed retry-progress events and prove only
the route's primary cause, exact scope and coordinates, completed class,
result/judgment/source/target equality, and the closed predecessor chain back
to the judgment. It must not re-admit retry payload schema, attempts, digests,
or full retry semantics. Sequence equality is exact elementwise equality.
Every current lawful completed class remains representable; existing
blocked/stopped child truth is not narrowed.

Fixture/catalog alignment and the run-semantic replay projection may continue
in parallel. Freeze remains held until the duplicate projection logic is
removed and focused controls remain green.

## Entry 104 - AX-F08 Physical Fork Copies Bytes, Not Event Meaning

Timestamp: 2026-08-07T12:38:35+10:00

Source: Ultra active review of the installed AX-F08 interleaving harness.

The prior fork helper reconstructed the control and interleaved logs by
re-admitting parsed events through owner ingress and a generic writer. That
made the falsifier a second semantic producer: the two histories could differ
because the test reinterpreted event meaning rather than because one durable
history contains the unrelated S event.

The accepted physical construction is narrower. Produce one authentic closed
Public/ABG durable log, verify its bytes and parsed events, select the exact
prefix boundary by admission ordinal, copy the exact JSONL byte prefix into
inode-distinct files, derive and validate each physical durable-prefix
coordinate, and reopen those copies through the installed event-store
authority. Then append the one lawful unrelated S-owner event only to the
interleaved branch before invoking the same target owner path.

No event envelope, payload, identity, ordinal, or causation is rebuilt by the
test. Physical coordinates and prefix digests are expected to differ where S
exists. AX-F08 separately compares the production-owned R-scoped semantic
projection under the declared event-reference isomorphism. Exact-byte copying
is accepted as harness infrastructure; the candidate remains held pending the
continuation-prefix repair, run-semantic projection, focused execution, and
independent review.

## Entry 105 - Retry Bridge Still Duplicates Its Owner Projection

Timestamp: 2026-08-07T12:43:00+10:00

Source: Independent Max moving-tree review and Ultra F_H proxy adjudication.

The physical AX-F08 fork passes review: it copies exact verified durable bytes
and performs no event re-admission. The revised retry bridge does not yet pass.
`retry_lifecycle.ts` still hard-codes the three CCall completion classes,
reparses raw `retry_progress_recorded` payload fields, and reconstructs the
predecessor-progress chain. Those semantics are already owned by
`retry.ts::projectRetryProgressAt`; the helper's claim that retry projection
remains wholly there is therefore false in code.

This is a local ownership repair, not design re-entry. The retry owner must
provide one typed, validated completed-progress-chain projection, or the
canonical projection must move behind one dependency-neutral module consumed
by `retry.ts`. Child foldback then verifies only its cross-owner join: the
route's primary cause, exact Run/GraphCall/Frame/CCall/result/judgment/source/
target coordinates, and the projected chain's terminal link to the judgment.
It must not retain a second raw progress schema, completion-class list, digest
law, attempt law, or predecessor projector.

The block is semantic, not stylistic. The duplicate bridge accepts progress
events with more than two causal refs and permits a predecessor progress event
that is not the immediately preceding event. The canonical retry projector
requires exactly two causes and an adjacent predecessor. A raw event admitted
by the generic Event Store but rejected by the retry owner can therefore
authorize child foldback through the duplicate predicate. The repaired proof
must include that forged/non-adjacent negative.

AX-F08 continuation and run-semantic projection work may continue in parallel.
Freeze remains held until the retry owner supplies the typed truth and the
independent reviewer closes this finding.

## Entry 106 - Delete Store-Selected Continuation Currentness

Timestamp: 2026-08-07T12:51:00+10:00

Source: Independent Max continuation census and Ultra F_H proxy adjudication.

The exact-prefix continuation migration is incomplete. The installed ABG
barrel still exports store-selecting `deriveFhResumeSuccessorInput`,
`projectFhInteractionSemanticBasis`, and `rehydrateFhContinuation` beside their
exact-prefix forms. No external consumer requires those wrappers; one is used
only by the legacy private response/resume path. Keeping both surfaces leaves
two reachable meanings of continuation currentness.

The same census found one active path: `admitFhInteractionOpen`, called by HoG,
performs several mutable-store preflights and then appends directly. An append
between preflight and effect can change its authority basis. The unused
`admitContinuationTerminal` similarly validates one snapshot but obtains its
expected digest from a later store read.

The bounded correction is deletion and migration under the accepted 4AB law:
remove unused store wrappers and dead legacy response/resume/terminal ingress;
change the active interaction-open owner to consume an explicit durable-prefix
coordinate, run every preflight over that exact validated prefix, and append
atomically at the expected prefix; update its HoG caller. Retain only prefix
projection, prepare, and expected-prefix commit surfaces. No adapter, new
authority, or design re-entry is authorized.

## Entry 107 - Run-Semantic Projection Must Preserve Opaque Domain Values

Timestamp: 2026-08-07T12:57:00+10:00

Source: Ultra moving-code review, followed by independent Max confirmation.

The first production `RunSemanticReplayProjection` passed the current AX-F08
path but was not freezeable. Its recursive field-name walker treated names such
as `admissionEventRef` as event-reference types at every depth, including
inside opaque Product input, result, response, and successor-input JSON. A
lawful domain value using that ordinary key could be rejected or silently
alpha-mapped. The first draft also recursively omitted every `payloadDigest`
and `admissionOrdinal`; that deleted a live semantic invocation payload digest,
not only the physical event envelope.

The physical-field defect is corrected by destructuring only the root event
envelope and moving only the exact
`fh_interaction_resume_admitted.payload.durablePrefixDigest` coordinate. The
remaining correction must replace recursive key-name interpretation with a
closed event-kind/carrier-path relation and stop at opaque domain values, or
with an explicitly ratified admitted-event-atom isomorphism that maps only
actual selected R identities and rejects actual non-R identities. URI spelling
or a coincidental key name is not a type.

Proof must preserve opaque domain values containing event-like keys and URI
strings exactly, reject an actual R-to-S admitted-event reference, and continue
to distinguish physical coordinates while producing equal R semantics. The
green run is diagnostic only until those controls and independent review pass.

## Entry 108 - Child Foldback Owner Must Join At One Exact Prefix

Timestamp: 2026-08-07T13:00:00+10:00

Source: Independent Max active-path census and Ultra F_H proxy adjudication.

`admitChildFoldback` remains an active mutable-currentness owner. It validates
parent, execution basis, and scope through store-selecting APIs, then performs
its own raw `readAll()` selections of result, judgment, latest route, terminal,
frame closure, and GraphCall closure. It appends directly without an expected
prefix. Its downstream sub-traversal evidence additionally requires membership
in the process-local `admittedChildFoldbacks` WeakSet.

This lies inside T-287's selected result/judgment/route/closure migration. The
bounded correction consumes one explicit durable prefix and the typed
projections of each owner, validates the complete foldback relation before
effects, commits at that expected prefix, and reconstructs evidence from the
exact admitted foldback event. The WeakSet and raw latest-selection path are
deleted. No new foldback lifecycle or design re-entry is authorized, and F10
cannot freeze while this rival authority remains reachable.

## Entry 109 - Consolidate Existing Child-Foldback Law

Timestamp: 2026-08-07T13:09:00+10:00

Source: Independent Max duplicate-authority census and Ultra F_H proxy
adjudication.

The exact-prefix child-foldback repair must replace, not supplement, the
existing foldback law. `fan_out_projection.ts` already owns
`exactChildFoldbackBody` and independently validates the admitted-foldback,
C-call evidence, result, and judgment spine. Adding another standalone
projector in `c_call.ts` while retaining that validation would create two
materially overlapping meanings of the same admitted relation.

The bounded construction is one C-call-owned or dependency-neutral exact
admitted-foldback projection consumed by both the active foldback/evidence
path and the fan-out projection. Fan-out retains only its batch/task census
around that shared relation. The application-foldback variant in
`graph_application.ts` is a distinct relation and is not merged silently.

The Max worker accepted this boundary before implementing relation 5. Current
run-semantic projection work continues; freeze remains held.

## Entry 110 - Route Admission Must Commit Its Exact Prefix

Timestamp: 2026-08-07T13:11:00+10:00

Source: Independent Max active-route census and Ultra F_H proxy adjudication.

The active `admitRoute` owner validates execution-basis, cursor, replay, and
current-cursor truth by reading a mutable store. After a substantial evidence
derivation it appends a route, or a route plus related events, without binding
the commit to the predecessor digest that was validated. A concurrent append
after preflight can therefore invalidate the cursor or replay basis while the
stale route still commits. The resulting carrier is placed in the process-local
`admittedRoutes` WeakSet, which active HoG application and continuation-open
paths consume.

This is inside T-287's selected route-truth migration and its frozen 4AB file
cone. The bounded repair changes the active owner to consume one explicit
validated durable prefix, derive every participant from that prefix, validate
before effects, and append the complete transition atomically at the expected
prefix. A same-call operation-local brand may be retained only after that
commit; reconstructed consumers use the exact admitted-route projection rather
than the WeakSet. Existing route law is migrated rather than duplicated.

No Product or design re-entry is required. F10 freeze remains held.

## Entry 111 - Opaque Values Cannot Self-Declare ABG Carrier Type

Timestamp: 2026-08-07T13:14:00+10:00

Source: Independent Max delta review and Ultra F_H proxy adjudication.

The closed-path run-semantic mapper fixes recursive key-name interpretation and
tag collisions, but `mapActionEvaluationBasisCarrier` still recognizes a typed
ABG carrier from the nested value's `kind` and `schemaVersion` alone. That
helper is applied at Product-owned result and successor-input positions. A
lawful opaque Product value using the same ordinary discriminants can therefore
be reinterpreted, rejected for missing ABG fields, or mutated.

Carrier type must be selected by the enclosing admitted owner and its declared
value-kind or contract relation. Opaque data cannot promote itself into an ABG
type. The bounded correction adds that enclosing proof and a control whose
opaque value carries the complete colliding discriminant while remaining
unchanged. Existing exact-R, exact-S, literal-label, event-like-key, and typed-S
controls remain required.

The worker was held on semantic relation 1 before moving to retry. Freeze
remains held.

## Entry 112 - A5-F02 Identity And Cycle Corrections Locally Pass

Timestamp: 2026-08-07T13:15:00+10:00

Source: Ultra moving-code review of the isolated Max A5-F02 worktree.

The whole-module identity closure now rejects equal duplicates and
same-identity/different-carrier collisions across Contract, Evaluator, Rule,
ImplementationBinding, ClosureContract, Program, GraphFunction, contribution,
and the nested identity families used by Programs and graphs. The dedicated
Program falsifier constructs the prior Map-last/find-first divergence and
proves refusal before either consumer can observe a different Program.

The GraphFunction call-topology correction removes only individually validated
governed recursion edges, then requires the residual call graph to be acyclic.
The mixed-SCC falsifier proves that one governed edge cannot legalize another
cycle, while the installed bounded-recursion witness remains accepted.

These two local relations pass and are banked against further speculative
iteration. A5-F02 continues on recursion-owner tightening, contract asset and
corpus packaging, source-blind installed proof, and regression qualification.
It remains isolated from the moving A5-F10 tree and is not yet frozen.

## Entry 113 - Semantic Mapping Must Preserve Identity Law

Timestamp: 2026-08-07T13:22:00+10:00

Source: Ultra positive-proof review, independently confirmed and extended by
the Max reviewer.

The relation-1 opaque controls now pass: an opaque Product result may carry the
complete `action_evaluation_basis` discriminant, exact R and S event-id
strings, an event-like URI, an event-like key, and the literal semantic label
without reinterpretation. A declared typed reference to S fails closed.

The typed positive remains invalid. The projector maps an admitted action
basis's runtime and admitted-evidence event references but retains the
physical `basisDigest` and `basisRef` calculated over the pre-map body. The
enclosing result or successor-input digests and identities also remain
physical-derived. Fan-out mapping has the same defect when it maps foldback or
stopping event references while retaining its completion identity. The output
therefore can violate its own content-addressed identity law.

The owner join is also incomplete: an F_H resume must prove that its opened
construction-intent reference equals the successor carrier's exact intent;
retry must prove that its admitted input contract declares the action-basis
value kind. Carrier shape or a non-empty contract reference is insufficient.

The bounded repair chooses one coherent semantic representation: either
rederive the complete enclosing identity cone after typed mapping, or retain
the immutable carrier and place correspondence outside it without presenting a
self-invalid carrier. Proof adds a genuine typed positive with coherent
identity, mismatched-intent refusal, and valid-shaped wrong-contract retry
control. Relation 1 remains held and no later relation may freeze ahead of it.

## Entry 114 - Finite A5-F10 4AB Pre-Freeze Roster

Timestamp: 2026-08-07T13:29:00+10:00

Source: Independent Max whole-selected-path census and Ultra F_H proxy
adjudication.

The independent reviewer has completed the selected A5-F10 4AB census. The
pre-freeze blocker family is finite. Subsequent review is delta-only unless a
repair introduces a new counterexample. The required relations are:

1. run-semantic correspondence preserves every immutable carrier identity;
2. F_H intent and retry input-contract joins select the exact typed carrier;
3. `retry_lifecycle.ts` no longer rivals canonical retry projection;
4. invocation preflights and commits its complete two-event transition at one
   expected prefix;
5. F_H interaction opening consumes an explicit prefix and obsolete
   store-selecting response, resume, and rehydration wrappers are retired;
6. active route and AX-F08 recursion-route currentness consume explicit
   prefixes and commit against their validated predecessors;
7. replay and C-call code consume one exact typed C-call phase projector,
   including the rejected-child result and judgment spine;
8. rejected C-call totalization validates before effect and commits atomically;
9. D12 child terminality and its foldback token form one atomic transition and
   one shared projection;
10. closure composes typed owner projections and every refusal is eventless;
11. terminal or closed Runs cannot project `quiescent_for_close`; and
12. the separate store-selected `admitChildClosure` path is replaced by the D12
    owner rather than repaired in parallel.

Lawful operation-local brands may survive only inside one synchronous,
fully-validated atomic owner transition. They cannot decide reconstructed
truth. F02 topology, F03 traversal detail, F04 evidence meaning, 4C D17/D18,
Wave-2 Public migration, and 5.1 structural compression remain outside this
census except at the named shared authority seams.

## Entry 115 - Worker Reconciliation Corrected To The Frozen Roster

Timestamp: 2026-08-07T13:30:00+10:00

Source: Ultra comparison of the worker estimate with Entry 114.

The worker initially reconciled its remaining work against an older twelve-row
list and marked C-call, closure, and child-terminal relations already
satisfied. That list did not correspond to the independent reviewer's frozen
roster. The mismatch was caught before test, freeze, or commit.

The exact Entry 114 roster has been returned to the worker. Claims that rows
7 through 12 are already satisfied require file-and-relation evidence and Max
delta confirmation. The worker may continue the active run-semantic repair but
must not freeze against its narrower estimate. No Product decision or design
re-entry is required; this is enforcement of the already accepted owner,
prefix, atomicity, replay, and zero-effect-refusal laws.

## Entry 116 - Exact Roster Reconciled And Work Resumed

Timestamp: 2026-08-07T13:31:00+10:00

Source: Max worker code-level reconciliation and Ultra F_H proxy disposition.

The worker re-ran the reconciliation against Entry 114 and confirmed every
row as live until independent delta review. The file-level census identified
the existing mutable-store, direct-append, duplicate-projector, WeakSet, and
post-effect-refusal paths for all twelve relations. No row is being carried as
implicitly satisfied.

The bounded 4AB estimate consequently changed from the worker's earlier eight
to twelve hours to approximately 15.75 engineering hours. Work resumed at the
run-semantic identity relation, followed by exact owner joins, retry projector
collapse, invocation atomicity, F_H and route prefix migration, C-call phase
and rejection atomicity, D12 child terminal/foldback ownership, and closure
composition. This is corrected scope accounting under accepted design, not a
new Product requirement or design cycle. Freeze remains held pending Max
delta PASS on every row.

## Entry 117 - Run-Semantic Wrapper Repair Remains Partial

Timestamp: 2026-08-07T13:32:00+10:00

Source: Independent Max saved-edit delta review and Ultra F_H proxy return.

The new semantic action-evaluation-basis and C-call-result wrappers validate
their physical carriers and mint new identities from their fully mapped
bodies. That removes the stale basis and result identity defect reported in
Entry 113.

Relation 1 still cannot pass. The projector mutates event references inside
ActionEvaluationProjection, construction-delta admission and evaluation
carriers, and fan-out completed or stopping rows while retaining enclosing
physical refs and digests. Each enclosing hashed boundary must either become a
self-valid replay-owned semantic wrapper or remain immutable with
correspondence external to it.

The admission joins remain incomplete. Admitted evidence must join its exact
event kind, payload, reference, and digest; C-call and retry values must join a
contract declaring the selected typed value kind; F_H opened intent must equal
the successor carrier's construction intent. The required positive and
negative controls cover genuine typed self-hash, construction delta, fan-out,
forged evidence, wrong typed contract, and mismatched F_H intent.

The reviewer independently reconfirmed that C-call phase, rejected C-call
atomicity, D12 child terminal/foldback, closure composition and refusal, and
post-terminal quiescence rows remain unresolved in the saved tree. The exact
delta was returned to the worker. Freeze remains held.

## Entry 118 - Closure Refusal Oracle Must Change With Production

Timestamp: 2026-08-07T13:33:00+10:00

Source: Independent Max AX-F08 oracle inspection and Ultra F_H proxy return.

The AX-F08 baseline still expects a runtime-basis closure refusal to append one
`runtime_failure_observed` event and reports `failure=true`. That expectation
encodes the rejected implementation rather than the accepted eventless
stale/nonquiescent refusal law.

Row 10 therefore requires one production-and-oracle correction. Closure
refusal returns its typed refusal with no admitted-event delta, and the
falsifier explicitly proves that no runtime-failure event was appended. A
green run retaining the old failure-event expectation is not admissible
evidence.

## Entry 119 - F02 Native C Witness Is A Bounded Admission Brand

Timestamp: 2026-08-07T13:34:00+10:00

Source: Ultra code-level pre-review of the isolated Max F02 worktree.

The strict C and GraphFunction admission repair reconstructs the existing
non-enumerable native C witness only after the complete term has passed the
closed structural parser. Its witness constructor is not exported through the
GTL root or M01 installed entrypoint, and fresh-process admission deterministically
reconstructs it from the serialized term. The WeakSet is consumed as immediate
constructor provenance, not as durable Program, validation, or runtime truth.

No stop is issued on this relation. `admitProgram` and `admitModule` remain
syntactic admission and canonicalization boundaries; `validateProgram` and
`validatePublication` remain the semantic closure owners. Independent F02
review must still prove that no alternate ingress reaches the internal witness
and no later runtime decision depends on brand survival. Focused F02 is green
22/22 and the worker has entered regression and source-blind package proof.

## Entry 120 - Stop Nested Run-Semantic Carrier Proliferation

Timestamp: 2026-08-07T13:37:00+10:00

Source: Independent Max proportionality review and Ultra F_H proxy
adjudication.

The relation-1 patch had expanded to roughly 1,350 lines and minted separate
`run_semantic_*` refs and digests for construction intent, action basis,
C-call result, action evaluation and admission, construction delta, fan-out,
and F_H successor carriers. That is a second semantic carrier family. It
duplicates each owner's identity and admission law inside replay and exceeds
Entry 098's authorization of at most one replay-owned run-semantic projection.

The direction is stopped before test or freeze. The bounded replacement has
one top-level `RunSemanticRelationView` identity and digest. Original immutable
carriers, refs, and digests remain untouched in physical coordinates. The
semantic body contains event atoms, a closed table of typed causal/reference
edges, stable owner-projected fact tuples, lifecycle/status/outcome, and
event-identity HoldsAt values. A typed path targeting S fails closed. Opaque
JSON is never traversed.

Replay reuses Event Calculus and the exact owner projectors; it does not
revalidate or remint C-call, fan-out, action-evaluation, construction-delta, or
F_H carrier families. The nested wrapper patch is donor evidence only and must
be contracted in place. This is a local proportionality correction inside
relation 1, not a Product re-entry or a Wave-1 reset.

## Entry 121 - Isolated F02 Enters Full M5 Regression

Timestamp: 2026-08-07T13:38:00+10:00

Source: Max F02 worker transition and Ultra process inspection.

The isolated F02 implementation has completed its focused admission,
identity, topology, native-C composition, contract-asset, and installed-export
increment with 22 of 22 focused tests passing. It has entered the serialized
full M5 regression lane in its separate worktree. The process is active and
does not share the moving F10 build directory.

This is diagnostic and integration evidence, not acceptance. F02 remains
unfrozen pending the current M5 result, R-lane and source-blind package
evidence, exact candidate cleanup, and independent review.

## Entry 122 - F03 Matrix Still Lacks Its Immutable 4.6 Witnesses

Timestamp: 2026-08-07T13:42:00+10:00

Source: Ultra read-only F03 next-wave preflight against Product and the live
conservation test.

The installed traversal-conservation suite contains the fixed forty-row
inventory and substantial 5.0 execution evidence, but its row constructor
marks every row `proven` while setting `witness46` to the literal placeholder
`PENDING immutable RC5 witness reconciliation`. The test title itself says it
does not claim RC5 reconciliation.

Product A5-F03 requires the complete 4.6 traversal conservation matrix, and
the Product proof record requires each row's 4.6 behavior identity and witness.
The immutable `v4.6.0-rc.5` tag is available locally. F03 therefore includes a
finite exact-witness tether from that tag; a non-empty placeholder and a green
5.0 scenario cannot close it. This is not evidence of missing traversal code,
but it is real Wave-1 acceptance work and is now included before F03 starts and
in ETA review.

## Entry 123 - Semantic Relation View Cannot Re-Admit Owner Types

Timestamp: 2026-08-07T13:45:00+10:00

Source: Ultra live code review of the contracted relation-view replacement.

The nested semantic carrier family has been removed and the replacement is
one top-level relation view. The first contracted draft still revalidates
admitted evidence and decides whether nested values are action-evaluation
bases. Its retry guard treats a prior C-call result carrying the same contract
reference and value-kind as if it were the contract declaration. A result
event is not contract authority.

Replay may extract typed edges only from an exact already-validated owner
projection or an owner-admitted discriminant. C-call and F_H extraction consume
their replay/continuation owners. If the canonical retry owner does not yet
project the input value-kind, nested retry input edges wait for roster item 3's
typed owner fact; replay cannot infer or recreate that law. Owner hash,
evidence, and contract validation are removed from the relation view. This
delta was returned before focused tests; freeze remains held.

## Entry 124 - Wave-1 ETA Includes The RC5 Tether

Timestamp: 2026-08-07T13:46:00+10:00

Source: Independent Max F03 evidence census and Ultra F_H proxy schedule
correction.

The earlier three-to-five-hour F03 estimate did not include immutable 4.6 RC5
witness reconciliation. RC5 contains 224 semantic test files, several current
row names use successor vocabulary, and RC5 explicitly did not claim complete
runtime realization for workflow C, batch C, or retry C. The row-by-row
baseline mapping and honest disposition is estimated at eight to twelve
engineering hours.

That work can run in parallel after the isolated F02 lane frees. The resulting
unbuffered Wave-1 critical-path estimate is approximately thirty productive
wall-clock hours from 13:45 AEST, with a credible range of twenty-six to
thirty-six hours. An RC5 exclusion is recorded as an exact exclusion witness;
it cannot be fabricated into positive 4.6 behavior. No Product-level decision
is currently indicated.

## Entry 125 - Contracted View Must Consume Typed Projectors

Timestamp: 2026-08-07T13:47:00+10:00

Source: Independent Max contracted-view delta review and Ultra F_H proxy
return.

The worker removed the relation view's evidence rehashing and false retry
contract inference. The remaining draft still selects the C-call owner event
by raw aggregate scan instead of consuming the exact C-call phase projector,
and selects F_H facts from the generic replay row rather than its continuation
projector. Those are duplicate reads of owner meaning and must be replaced by
typed projector composition.

The physical-coordinate builder also treats any payload field named
`durablePrefixDigest` as runtime prefix metadata. Only the declared typed owner
coordinate may supply that field; ordinary Product payloads remain opaque.
Finally, the focused and AX-F08 tests still reference the deleted nested-wrapper
interface and must move to event atoms, relation edges, and the one top-level
view identity. No test result is current until those changes land.

## Entry 126 - Semantic View Proof Requires An Owner-Valid C-Call Spine

Timestamp: 2026-08-07T13:49:00+10:00

Source: Ultra focused-test preflight and return to Max worker/reviewer.

The current S03 relation-view test fabricates `c_call_opened` followed directly
by `c_call_result_admitted` through raw event admission. It omits fibre
selection and judgment. Once the view correctly consumes the exact C-call
phase projector, that partial spine must refuse.

The fixture is replaced with an owner-valid C-call phase, preferably through
the installed owner helper, or with the exact fibre, result, and judgment
sequence and identities. The projector must not be weakened to preserve a
synthetic green test. Opaque-value, genuine typed-edge, and out-of-scope S
controls remain required over semantically admitted truth.

## Entry 127 - Relation View Contraction Passes, Semantic Commitment Holds

Timestamp: 2026-08-07T13:56:00+10:00

Source: Independent Max roster-item-1 delta review and Ultra F_H proxy
disposition.

## Entry 200 - Core D17 D18 Executor XOR Is Present In Moving Code

Timestamp: 2026-08-07T19:06:35+10:00

Source: alternate-account Max implementation; independent Max sentinel
control-flow verification.

The sole leaf-completion await now returns either ordinary completion or the
internal retry failure transition. The graph executor discriminates that
transition immediately, invokes D17, invokes atomic D18, and recursively calls
the same installed `executeGraphTraversal` with only
`projectedRetryResume`. There is no intervening await, callback, raw input,
input digest, or raw resume between D18 success and projected traversal.

The old direct retry-completion suffix and retained `retryInput` carrier are
deleted and neither raw transition nor union result is barrel-exposed. Raw
resume again rejects non-empty retry paths. The core authority seam is
directionally correct; the Entry 199 diagnostic boundary remains open before
typecheck and focused proof.

The contracted structure passes its proportionality checks: there is one
`RunSemanticRelationView`, no nested reminted semantic-carrier family, relation
extraction uses a closed path table rather than recursive payload traversal,
and physical replay coordinates do not participate in the semantic identity.

Roster item 1 remains held on four bounded defects. F_H nested action-basis
edges still discriminate on caller/content `kind` without an owner-projected
contract fact. C-call owner facts still expose result contract, value kind,
and judgment copied from generic replay even though `projectCCallPhase` proves
only lifecycle cardinality. Event atoms commit envelope and topology but not
opaque result content, allowing two materially different Runs to share a view
digest. AX-F08 also replaced exact applicable Run-R body equality with weaker
projection and event-count checks while retaining the stronger claim.

The returned repair removes unproven conditional paths and semantic fields,
adds one per-event semantic payload commitment that substitutes only declared
typed references with Run atoms while hashing all other payload content, and
restores the exact AX-F08 body-equality oracle. An opaque-byte mutation must
change the semantic digest while an unrelated interleaved Run must not. The
known eventful closure-refusal oracle remains held for roster item 10. No
design re-entry, broader carrier, evidence refresh, freeze, or qualification
is authorized by this disposition.

## Entry 128 - F02 Full M5 Finds One Shared Installed-Execution Regression

Timestamp: 2026-08-07T14:00:00+10:00

Source: Isolated Max F02 worker live full-M5 transition and Ultra F_H proxy
disposition.

The isolated F02 lane remains active and is making progress through the full
M5 suite. Native GTL, HoG, Event Calculus, reopen, fibre, and authority-only
negative cases are green. The run has nevertheless found failures in installed
CLI execution and the execution-bearing Consensus, external-Product, and
construction variants, plus one unchanged fixed-R10 history-reopen case.

The distribution indicates one common installed execution boundary, not a
license to repair scenarios separately. The run continues to its final TAP
summary. The worker then classifies every failure as the shared F02 regression,
unchanged baseline behavior, or stale generated/package evidence and repairs
only the earliest common owner boundary. Test weakening, compatibility
facades, alternate Program/C admission paths, and per-scenario patches remain
forbidden. F02 cannot freeze on its focused 22-of-22 result.

## Entry 129 - Relation 1 Reaches Corrected Focused Checkpoint

Timestamp: 2026-08-07T14:02:00+10:00

Source: Max F10 worker focused result and Ultra F_H proxy review handoff.

The bounded roster-item-1 repair builds and its focused S03 semantic test
passes. One top-level view remains. Each event atom now commits the complete
opaque payload after replacing only unconditional, declared event-reference
paths with stable Run atoms. A one-byte opaque-value mutation changes both the
event semantic-payload digest and the view digest without changing topology;
an unrelated interleaved Run does not. Raw C-call result contract, value-kind,
and judgment fields and the unproved F_H nested action-basis paths are absent.
Exact semantic-body equality remains an assertion rather than being renamed to
a weaker count check.

The wider AX-F08 execution remains red. It passes the S-interleave equality
through F_H resume and normal closure, then stops later in the interaction
closure fixture because route admission returns `judgment_mismatch`. It does
not reach later child/refusal-causation rows. The item-1 delta is held in place
for independent Max review; the worker may diagnose but cannot repair a later
roster relation under item 1 or refresh aggregate evidence.

## Entry 130 - Relation 1 Held On Three Immutable Envelope Fields

Timestamp: 2026-08-07T14:05:00+10:00

Source: Independent Max roster-item-1 review and Ultra F_H proxy return.

The single-view architecture, closed typed-reference table, opaque payload
commitment, C-call phase projection, self-hash, and physical-coordinate
separation pass independent review. One exact equality omission remains:
`RunSemanticEventAtom` does not carry immutable `eventTime`, `correlationId`,
or `workflowVersion`. The previous exact applicable-body comparison covered
those fields, and the accepted physical-divergence set does not exclude them.
Two Runs could therefore differ in one of those fields while AX-F08 continued
to claim exact applicable-body equality.

The only authorized correction is to add and populate those three fields in
the existing atom so the existing semantic-body equality covers them.
Event identity, ordinal, payload digest, and F_H resume durable-prefix digest
remain physical; causation remains a typed relation. The later interaction
route `judgment_mismatch` is independently confirmed as downstream roster
rows 6 and 7: pure F_H reconstruction is being consumed by route and C-call
checks that still demand process-local WeakSet identity. The repair must migrate
those consumers to exact prefix-derived projections, never rebrand carriers or
restore mutable-store wrappers.

## Entry 131 - Roster Item 1 Independently Passes And Freezes

Timestamp: 2026-08-07T14:08:00+10:00

Source: Independent Max final re-review and Ultra F_H proxy acceptance.

Roster item 1 passes. Its frozen relation is:

`explicit validated immutable prefix + exact Run selection`
` -> one pure replay-owned RunSemanticRelationView`.

Event atoms establish exact R correspondence. Every nonphysical immutable
envelope field and every opaque payload byte participates in the view digest.
Only event references declared by the closed event contract become atom
relations. Existing typed owner projectors supply owner meaning. Original
event identities, admission ordinals, payload digests, and prefix coordinates
remain immutable physical provenance outside semantic identity. No second
semantic projector or nested carrier family is reachable.

The later AX-F08 `judgment_mismatch` is the already-rostered rows-6-and-7
process-brand consumer defect and does not reopen item 1. Item 1 is locked
absent a new counterexample. Work advances directly to item 2: exact typed F_H
construction-intent and retry input-contract joins, sourced from canonical
owner projections rather than payload-content inference.

## Entry 132 - F02 Full M5 Rejects The Incomplete Hard-Break Migration

Timestamp: 2026-08-07T14:12:00+10:00

Source: Isolated Max F02 full-M5 result and Ultra F_H proxy disposition.

The isolated full M5 completed normally in 2,102 seconds: 203 tests, 133 pass,
70 fail, with no cancellation or skipped case. Focused 22-of-22 evidence was
therefore insufficient for integration. The failures cluster around the
incomplete F02 hard break: authored GraphFunctions or fixtures omit the newly
required stable id, some retain pre-admission order or identity after canonical
admission, and some consumers select semantic rows by array position rather
than stable identity. The earliest installed symptom is an authored-versus-
admitted publication or Program digest mismatch before runtime.

One checked-in R10 history case rejects under unchanged S05 exact-invocation
code and is separated onto the existing F10 invocation roster. No stale
package or manifest digest was observed. The F02 worker now produces an exact
failure-to-owner cluster map and repairs shared authoring/admission producers
plus mandatory donor fixture constructors only. IDs are minted by the
canonical owner, ordering precedes identity, and consumers select by stable
identity. Per-scenario patches, compatibility carriers, and validator or test
weakening are forbidden. The prior two-to-four-hour F02 estimate is withdrawn
pending that cluster map.

## Entry 133 - Roster Item 2 Reaches A Typed-Provenance Boundary

Timestamp: 2026-08-07T14:14:00+10:00

Source: Max F10 worker read-only owner census and Ultra F_H proxy independent
review handoff.

F_H already has a canonical typed constructor:
`deriveFhResumeSuccessorInputAtPrefix` proves an action-evaluation successor
from the exact public operation, execution basis, closure contract, admitted
construction intent, response, and evidence. The two-argument Run semantic
projector does not possess those owner inputs, and the current continuation
projector proves lifecycle and hashes rather than the Product/closure contract.

Retry's canonical `projectRetryAttempt` proves its exact materialized Graph,
C.retry input contract reference, input identity, digest, and bytes. Neither
the retry event nor its admitted carrier identifies the input value kind or a
typed origin/path declaration, while the materialized Graph does not carry the
Module's contract declarations. A matching contract string or content `kind`
cannot supply that authority.

No implementation edit is authorized until independent review selects the
smallest existing owner composition or confirms a bounded missing relation.
Replay may not validate Product semantics, and the repair may not introduce a
semantic registry, parallel carrier, brand, or store-selected wrapper. The
review also determines whether the isolated F02 native-contract authority is a
real dependency rather than duplicating it in F10.

## Entry 134 - F02 Seventy Failures Collapse To Three Repairs

Timestamp: 2026-08-07T14:19:00+10:00

Source: Max F02 exact failure cluster map and Ultra F_H proxy authorization.

The frozen diagnostic roster partitions all seventy failures: fourteen
portability cases share one flavored-donor GraphFunction literal without its
required stable id; fifty-one installed Consensus and external-Product cases
share one catalog owner boundary that computes an admitted canonical
publication and then discards it in favor of raw pre-admission Module bodies;
four compose/retry/F_P cases select runtime semantic rows by unstable array
position; one unchanged S05 R10-history failure belongs to F10.

F02 is authorized to repair only the three shared causes. Donor authors mint
GraphFunction ids before publication identity. Catalog admission consumes the
exact admitted canonical `ModulePublication` value, with ordering before every
dependent identity, and leaves no parallel raw/admitted family. The four
consumers select stable declared identities rather than positions. S05 remains
untouched. Compatibility layers, post-hash mutation, validator relaxation,
scenario-specific branches, and test deletion are excluded. Each shared repair
runs its focused cluster before one repeated F02 focused suite and one final
full M5. The worker estimate is 4.25 engineering hours plus independent review,
parallel to the F10 critical path.

## Entry 135 - F02 Cluster A Removes The GraphFunction Id Failure

Timestamp: 2026-08-07T14:34:00+10:00

Source: Max F02 focused cluster result and Ultra F_H proxy transition.

The flavored external-Product donor now constructs its GraphFunction through
the canonical author with the declared reference as stable `id` and a separate
human name before Module, publication, package, and manifest identity are
minted. The leaked non-enumerable C-term symbol was removed from serialized
values; operation-local constructor provenance remains internal, while the
canonical Module is strict I-JSON.

After a mechanical candidate-basis refresh for changed package bytes, the
portability cluster moves from four of eighteen to sixteen of eighteen. Its two
remaining failures mutate `publication.contributions[0]` after canonical
ordering and belong to the already-declared stable-selector cluster. Cluster A
is accepted as a local transition, not a candidate freeze. Work proceeds to
the fifty-one-case canonical-publication owner boundary and then the four
stable-ref selectors; no full qualification is implied by the refresh.

## Entry 136 - F10 Item 2 Is A Bounded Design Relation, Not A Product Reprice

Timestamp: 2026-08-07T14:35:00+10:00

Source: independent Max review and Ultra F_H proxy disposition.

The held F_H C-call cannot select the successor input contract: its
`outputContractRef` is the interaction response contract. HoG must derive the
successor target GTL locus from the admitted held Graph and cursor, then resolve
that locus's exact contract declaration through the already-admitted
`ModulePublication`. The lookup is by unique exact `contractRef` and yields the
declared `valueKind` independently of the declaration's current input/output
use-role label. F02's canonical unique-contract admission is the integration
dependency for that join.

The proportional construction keeps the existing F_H resume and retry carrier,
event, and projection families. They preserve and reproject the exact target
contract reference, value kind, and only the fixed ABG
`action_evaluation_basis` reference paths:
`constructionIntent.admissionEventRef`,
`admittedEvidence[*].admissionEventRef`, and
`runtimeEvidenceEventRefs[*]`. Event-shaped strings in other values remain
opaque. A generic contract-path language, semantic registry, new carrier
family, replay-side Product validator, and new event kind are rejected.

One concrete relation remains to be frozen before implementation:
`continuation.ts` constructs four runtime-evidence references while the
accepted Consensus action-basis validator requires exactly five. The missing
F_H causal reference must be derived from an existing admitted relation; the
interaction-response public-operation admission is only a hypothesis until
the construction map proves it. F_H authorizes one bounded design-relation pass
only, followed by independent review. No code is authorized from the current
row wording.

## Entry 137 - The Complete RC5 Traversal Witness Map Is Now Known

Timestamp: 2026-08-07T14:41:00+10:00

Source: independent Max read-only reconciliation against immutable tag
`v4.6.0-rc.5` at `8d43dc8968e3df16029e6201680a0301eda035f1`.

All forty A5-F03 conservation rows now have an evidence disposition: eighteen
direct RC5 behavior witnesses, sixteen renamed or equivalent predecessor
witnesses, and six exact RC5 absences or weaker precursors. No lawful positive
RC5 execution witness exists for rows 3 (`compute/F_H`), 9
(`structural/batch`), 10 (`structural/transparent_child_traversal`), 11
(`structural/graph_recursion`), 12 (`structural/retry`), or 18
(`consequence/fh_input_required`). Those rows remain required positive 5.0
successor capabilities; their RC5 cells must state the historic absence rather
than fabricate conservation evidence.

The current 5.0 behavior materially strengthens the RC5 predecessor on rows 4,
7, 8, 14, 16, 17, 19, 30, and 39. This is lawful successor conservation, not
permission to relabel an RC5 gap as executed behavior. The reviewer supplied
exact immutable test paths and line witnesses for every row. A final narrow
check now determines whether A5-F03 requires only table realization and focused
proof or whether any live 5.0 assertion remains incomplete.

The exact RC5 classification and witness roster is:

| Row | Relation | Class | Immutable RC5 witness |
|---:|---|:---:|---|
| 1 | `compute/F_D` | D | `test_m03_engine_kernel_integration.test.mjs:212` |
| 2 | `compute/F_P` | D | `test_m03_engine_kernel_integration.test.mjs:344` |
| 3 | `compute/F_H` | A | `test_t200_c_call_envelope.test.mjs:813`; `test_m04_control_loop_integration.test.mjs:178` only escalate/preserve the gate seam |
| 4 | `compute/mixed` | E | `test_t192_temporal_properties.test.mjs:850`; F_H escalates/stops in RC5 |
| 5 | `structural/atomic_call` | E | `test_t200_c_call_envelope.test.mjs:248` predecessor stage carrier |
| 6 | `structural/flat_composition` | E | `test_t220_c_algebra.test.mjs:135`; `test_m03_graph_function_iteration_integration.test.mjs:21` predecessor lowering |
| 7 | `structural/edge_program` | E | `test_t220_c_algebra.test.mjs:103` normalized HoG lowering |
| 8 | `structural/adaptive_declared_selection` | E | `test_t200_c_call_envelope.test.mjs:501,590,928` predecessor catalog/ladder |
| 9 | `structural/batch` | A | `test_t220_c_algebra.test.mjs:216-245` declares `gtl-c-unrealized-batch` |
| 10 | `structural/transparent_child_traversal` | A | `test_t220_c_algebra.test.mjs:216-245` declares `gtl-c-unrealized-workflow-lift` |
| 11 | `structural/graph_recursion` | A | `test_m01_gtl_core_integration.test.mjs:868,958` authors/inspects only |
| 12 | `structural/retry` | A | `test_t220_c_algebra.test.mjs:216-245` declares `gtl-c-unrealized-retry` |
| 13 | `consequence/same_edge_retry` | D | `test_t106_traversal_non_progress_continuation.test.mjs:679`; `test_t156_consequence_allowed_traversal_catalog.test.mjs:223` |
| 14 | `consequence/depth_traversal` | E | `test_t155_graph_function_zoom_plan.test.mjs:42,78`; `test_t156_consequence_allowed_traversal_catalog.test.mjs:166` |
| 15 | `consequence/graph_span_reentry` | D | `test_t103_graph_span_reentry_unit.test.mjs:93,191`; `test_t154_runtime_authoring_routes.test.mjs:110` |
| 16 | `consequence/public_start_reentry` | E | `test_m04_engine_start_integration.test.mjs:241` predecessor closed-F_P re-entry |
| 17 | `consequence/ticket_traversal` | E | `test_t156_consequence_ticket_traversal_bridge.test.mjs:84` Product route admission only |
| 18 | `consequence/fh_input_required` | A | `test_t127_fp_consciousness_loop_unit.test.mjs:914`; `test_t200_c_call_envelope.test.mjs:813` escalation only |
| 19 | `consequence/escalation_or_reprice` | E | `test_t127_fp_consciousness_loop_unit.test.mjs:914,1937`; `test_t103_graph_span_reentry_unit.test.mjs:281` |
| 20 | `consequence/gap_stop` | D | `test_m03_graph_function_iteration_unit.test.mjs:145`; `test_t156_consequence_allowed_traversal_catalog.test.mjs:223` |
| 21 | `consequence/non_admit` | D | `test_t156_consequence_allowed_traversal_catalog.test.mjs:200,223` |
| 22 | `disposition/advance_vector` | E | `test_m03_graph_function_iteration_integration.test.mjs:21` predecessor vector vocabulary |
| 23 | `disposition/close` | E | `test_t149_iteration_state_action_algebra.test.mjs:475` predecessor terminal carrier |
| 24 | `disposition/retry_same_edge` | D | `test_t148_runtime_continuation_transition.test.mjs:96,134` |
| 25 | `disposition/repair` | E | `test_t103_graph_span_reentry_semantic_deep.test.mjs:311`; `test_t127_fp_consciousness_loop_unit.test.mjs:1186` |
| 26 | `disposition/re_enter` | E | `test_t149_iteration_state_action_algebra.test.mjs:534`; `test_t103_graph_span_reentry_unit.test.mjs:191` |
| 27 | `disposition/yield_continuation` | D | `test_t148_runtime_continuation_transition.test.mjs:134` |
| 28 | `disposition/inspect_runtime_archive` | D | `test_t106_traversal_non_progress_continuation.test.mjs:407,734`; `test_t148_runtime_continuation_transition.test.mjs:134` |
| 29 | `disposition/reprice` | D | `test_t148_runtime_continuation_transition.test.mjs:134,155` |
| 30 | `disposition/human_assurance_required` | E | `test_t127_fp_consciousness_loop_unit.test.mjs:914`; `test_t131_edge_assurance_contract.test.mjs:427` |
| 31 | `disposition/escalate` | E | `test_t135_vector_local_runtime_regime.test.mjs:178`; `test_t127_fp_consciousness_loop_unit.test.mjs:914` |
| 32 | `disposition/gap_stop` | D | `test_m03_graph_function_iteration_unit.test.mjs:145` |
| 33 | `disposition/block` | D | `test_t148_runtime_continuation_transition.test.mjs:134,155` |
| 34 | `disposition/non_admit` | D | `test_t156_consequence_allowed_traversal_catalog.test.mjs:223` |
| 35 | `public/advance_next` | D | `test_m04_cli_binary_integration.test.mjs:410` |
| 36 | `public/graph_function_target` | D | `test_m04_cli_binary_integration.test.mjs:354` |
| 37 | `public/asset_target` | D | `test_m04_cli_binary_integration.test.mjs:433` |
| 38 | `public/bounded_until` | D | `test_m04_app_bootstrap_unit.test.mjs:28,51`; `test_m03_internal_control_loop_sufficiency.test.mjs:20` |
| 39 | `public/fh_control` | E | `test_m04_control_loop_integration.test.mjs:178`; RC5 has no durable respond/resume proof |
| 40 | `public/root_control` | D | `test_m04_control_loop_integration.test.mjs:28`; `test_m04_complete_start_surface_unit.test.mjs:28` |

## Entry 138 - Frozen F10 Item 2 Construction Map

Timestamp: 2026-08-07T14:49:00+10:00

Source: Max F10 worker bounded design-relation pass. No code changed.

### Exact relation

```text
heldGraph + heldCursor
  -> existing HoG direct continuation
  -> exact target GTL term
  -> targetTerm.inputCarrierRef
  -> exactly one admitted ContractDeclaration with that contractRef
  -> declaration.valueKind
  -> F_H successor input admission
  -> optional retry input admission preserving the same typed origin
```

The held F_H C-call's `outputContractRef` remains response truth and never
selects the successor carrier. For a direct response, independently derived
target and response contracts must agree. For a construction successor, the
target contract must resolve to `action_evaluation_basis`. A construction
continuation with no target refuses. A non-construction terminal continuation
has no successor contract or value kind.

### HoG and contract join

Add `deriveInteractionSuccessorInputCarrierRef(graph, heldCursor)` in
`hog/traversal.ts`, exported by `hog/index.ts`. It validates the materialized
Graph and held cursor, calls `deriveDirectCContinuationStepFromGraph`, returns
`null` for `complete_term`, and for `continue_term` resolves the existing target
with `resolveCProgramTermAtPath` and returns its `inputCarrierRef`.

Extend the admitted `LeafInvocationPort` with exact
`contractValueKindByRef(contractRef)` and
`validateContractValueByRef(contractRef, value)`. The implementation filters
the already-bound admitted `ModulePublication.contracts` by exact
`contractRef`, requires exactly one declaration, returns its non-empty
`valueKind`, and delegates value validation to installed Product semantics.
It never filters by `contractKind`, infers from `value.kind`, or falls back.

### Existing F_H carriers

Extend `FhResumeSuccessorInput` with nullable `inputContractRef` and
`inputValueKind`; extend `FhInteractionResumeAdmission` and the existing
`fh_interaction_resume_admitted` payload with nullable
`successorInputContractRef` and `successorInputValueKind`; and extend
`ReplayContinuationState` with nullable `respondedPublicOperationEventRef`,
`resumedPublicOperationEventRef`, `successorInputContractRef`, and
`successorInputValueKind`.

Advance requires both contract and kind. Terminal requires both null.
Construction requires kind `action_evaluation_basis`. Direct continuation
independently equates target and response contracts and validates the response.
Projection requires the pair to be jointly null or non-null. Completion
rederives the target carrier, compares it with the persisted field, and returns
the resume's successor contract rather than the held C-call response contract.

### Exact five-event construction basis

The exact ordered `runtimeEvidenceEventRefs` are:

```text
1 constructionIntent.admissionEventRef
2 continuation.openedEventRef
3 continuation.respondedPublicOperationEventRef
4 continuation.respondedEventRef
5 run.continue operation.admissionEventRef
```

`projectFhContinuations` already proves reference 3 through
`exactPublicOperation`: exactly one referenced `public_operation_admitted`
event names `abg.operation.interaction.respond`; continuation, actor,
capability, and grant agree; its ordinal lies strictly between open and
response; and the response cites it in causation. The projector exposes that
proven identity. Successor construction does not rescan a response payload.
Preparation also proves strict ordinal order across all five refs and requires
five distinct identities.

### Existing retry carriers

Extend `RetryInputBasis`, `RetryAttemptAdmission`, and the existing
`retry_attempt_opened` payload with `inputValueKind` and
`inputSourceEventRef`. The input contract still equals the enclosing
`C.retry.inputCarrierRef`; value kind comes from the unique admitted
publication; F_H uses the resume admission event as source; otherwise the
source is the exact route event admitting the target cursor. Subsequent
attempts preserve the original source. Causation includes current route and a
distinct source. `projectRetryAttempt` validates source precedence and, for an
F_H source, exact input ref, digest, contract, value kind, and value against the
projected resume. `graph_execute.ts` threads the same `RetryInputBasis` through
structural descent.

### Closed replay reference paths

Only when the owner field `successorInputValueKind` or `inputValueKind` equals
`action_evaluation_basis`, replay may map the corresponding value's:

```text
constructionIntent.admissionEventRef
admittedEvidence[*].admissionEventRef
runtimeEvidenceEventRefs[*]
```

`retry_attempt_opened.payload.inputSourceEventRef` is mapped unconditionally.
Selection uses the ABG owner field, never nested Product `value.kind`. Other
Product JSON stays opaque and replay loads no Product validator.

### Admission ordering

`run.continue` freezes and validates the prefix; reconstructs continuation,
Graph, cursor, C-call, execution basis, admitted publication, Program,
implementation set, interaction set, and leaf port; derives target carrier;
resolves and validates kind/value; purely prepares the public operation and
five-reference basis; derives cursor and resume; proves exact reprojection;
atomically appends the public operation and resume under the existing expected
prefix; then reprojects before HoG completion. Retry validates typed input
before its existing structural route call and retains its existing one-event
expected-prefix attempt append. Route/attempt transaction redesign belongs to
later roster rows.

Every malformed target, missing/duplicate contract, kind/value mismatch,
substituted/unordered causal ref, stale prefix, retry contract/source mismatch,
or persisted projection mismatch refuses before its governed append or fails
closed in projection.

### Exact proposed file cut

- `code/src/implementation/contracts.ts`
- `code/src/hog/leaf_invocation_port.ts`
- `code/src/hog/traversal.ts`
- `code/src/hog/index.ts`
- `code/src/hog/execute.ts`
- `code/src/hog/graph_execute.ts`
- `code/src/hog/structural_execute.ts`
- `code/src/abg/continuation.ts`
- `code/src/abg/fh_continuation_projection.ts`
- `code/src/abg/retry.ts`
- `code/src/abg/event_store.ts`
- `code/src/abg/replay.ts`
- `code/src/public/operations.ts`

No change is proposed to `ContractDeclaration`,
`deriveCSourceContinuation`, route admission, retry lifecycle ownership, or
C-call phase ordering. Required focused proofs cover different response/target
contracts, inconsistent use-role labels, missing/duplicate declarations,
construction terminal refusal, exact five-event order and substitutions,
reopen preservation, multi-attempt F_H retry source preservation, exact fixed
semantic reference mapping, and opaque non-action Product JSON. The developer
mini Product's action-basis expectation moves from four refs to five; Consensus
already requires five.

F02 is the hard integration seam for unique canonical contract admission but
does not change this relation. Retry-lifecycle deletion is roster row 3;
route/currentness and AX-F08 recursion are row 6; C-call phase/result replay is
row 7; response-wrapper retirement is row 5. This map does not authorize any
of those changes.

## Entry 139 - F02 Is Held At Its Boundary, Not Allowed To Repair F10

Timestamp: 2026-08-07T14:54:00+10:00

Source: Max F02 transition report and Ultra F_H proxy scope correction.

The corrected external Product representative passes one of one. The
Consensus representative now passes catalog admission and Program topology and
reaches child foldback. That downstream `child_truth_mismatch` belongs to F10
roster rows 6 and 7; it is evidence that F02 crossed its own boundary, not an
F02 failure to repair.

The F02 worker had temporarily narrowed a same-judgment route lookup by causal
reference inside `abg/c_call.ts`. F_H stopped that repair immediately. The
worker restored the exact pre-change `admitChildFoldback` selection and removed
all temporary diagnostics without resetting or disturbing the F02 surface.
F02 proceeds only to stable identity selectors and its authoring/validation
proof. It may not obtain a green installed Consensus test by modifying route,
foldback, judgment, or other runtime semantics.

## Entry 140 - F03 Evidence Realization Runs In An Isolated Lane

Timestamp: 2026-08-07T14:55:00+10:00

Source: Ultra F_H proxy authorization.

The clean detached worktree
`/Users/jim/src/apps/abiogenesis-5-wave1-f03f04-scout` at `75a1daf5` is assigned
to one Max worker. Its entire authority is the single existing
`m5-traversal-conservation.test.mjs` evidence surface: replace all forty RC5
placeholders with the reviewed D/E/A witness map, preserve every positive 5.0
assertion, assert counts 18/16/6 and the exact six absence rows, run the focused
proof once, and freeze an isolated candidate. No production, Product, design,
ticket, or other test change is authorized.

## Entry 141 - F02 Stable Identity And Portability Are Green

Timestamp: 2026-08-07T15:01:00+10:00

Source: Max F02 cluster-C result and Ultra F_H proxy transition.

The installed portability lane passes eighteen of eighteen in 239.5 seconds.
Graph-function, node-type, and overlay contribution mutations and dispositions
now resolve by exact declared handle; no contribution or row-disposition array
index remains. Canonical Module admission, catalog readiness, SDK, CLI,
delegate, exact locators, and the external flavored execution all pass. The
separate independent developer-authored Product representative also passes one
of one.

Consensus catalog and topology proceed to the already-isolated F10 child
foldback failure. No route, foldback, judgment, or other runtime edit remains
in the F02 worktree. F02 now runs only its authoring, validation, source-blind,
build, and diff-check roster before freezing an isolated candidate. Full M5 is
deferred to integration because its known remaining failures are outside F02.

## Entry 142 - F10 Item 2 Passes Design Review With Two Local Corrections

Timestamp: 2026-08-07T15:06:00+10:00

Source: independent Max review and Ultra F_H proxy disposition.

The item-2 relation is constructable, proportional, and requires no Product or
design re-entry. The review independently proves that the fifth construction
reference is the exact admitted `interaction.respond` public-operation event;
the HoG target derivation is total for advance and terminal; the unique exact
contract-reference join is fail-closed; the new kind/source facts are the
minimum needed for owner-gated replay; and the existing expected-prefix
transaction atomically appends the `run.continue` public operation and resume.

Two map corrections are mandatory. First, an ordinary first retry names its
current retry-route event as its source, so causation is exactly
`[currentRoute]` when source equals route and otherwise
`[currentRoute, source]`, with no duplicate; projection proves the same order,
and later attempts preserve the original source. Second, an F_H retry basis may
survive only carrier-preserving descent where ref, digest, value, and contract
remain equal. Batch/fan-out materialization transforms that input, so item 2
must refuse rather than attribute the transformed value to the F_H resume; its
positive transformed-source relation belongs to F03 or a later exact owner
join. A focused refusal counterexample is required.

With those corrections, item-2 implementation is authorized inside the frozen
file/relation cut after the currently running isolated F03 proof reaches its
logical freeze. Rows 3, 6, and 7 remain excluded.

## Entry 143 - F02 Freezes A Clean Independent-Review Candidate

Timestamp: 2026-08-07T15:06:00+10:00

Source: Max F02 worker freeze; independent acceptance pending.

Candidate commit `8200083d541e6ce25e52a3d252f8ce67b0e026fa`, tree
`2b2e9904225ba2927675d6630214e81e5d59e3a5`, is frozen on isolated branch
`codex/t287-wave1-f02-core` from base `75a1daf5`. The worktree is clean and the
65-file delta is `+7818/-433`; 2,452 added lines are the generated GTL JSON
schema rather than handwritten runtime growth.

Current-tree evidence is: F02 22/22, M5 GTL 21/21, installed R1-R6 10/10,
portability 18/18, and the independent developer Product representative 1/1.
Every command rebuilt successfully. Known Consensus child-foldback and S05/R10
failures are unchanged F10 integration dependencies. Direct current F10 merge
overlap is `public/operations.ts`; later row-7 overlap is limited to F02's
stable-id changes in `c_call.ts` and `graph_execute.ts`, plus shared focused
tests. The candidate is under independent Max code review and is neither merged
nor accepted.

## Entry 144 - F02 Frozen Candidate Has A Canonical-Identity Counterexample

Timestamp: 2026-08-07T15:11:00+10:00

Source: Ultra F_H proxy live code review; independent Max confirmation pending.

Candidate `8200083d` is held. A generated identity GraphFunction was serialized,
cloned, and changed only by setting `tags` to a different semantic value.
`admitGraphFunction` accepted the changed body under the unchanged generated
canonical id. The executed result was `accepted=true` and `sameId=true`.

`hasCanonicalGraphFunctionId` currently accepts identity, compose, substitute,
and promote values from reduced constructor bases. Whole-Program validation
does not then prove the complete deterministic constructor output. This permits
more than one admitted body for one generated identity and contradicts the
accepted D(R) equation and invariant that applied GraphFunction identity covers
every result field. Lawful explicit opaque ids remain a separate case and must
not be converted into content hashes.

The candidate is not merged or accepted. Independent review is reproducing the
counterexample and enumerating adjacent mutable fields. The F02 worker is held
to a read-only repair map until that review selects the smallest non-circular
complete-body or complete-constructor-equation proof.

## Entry 145 - F03 Evidence Candidate Freezes Against A Known F10 Red

Timestamp: 2026-08-07T15:12:00+10:00

Source: Max isolated F03 worker result.

The one-file F03 evidence candidate is commit
`c9d6b4057204f1f910ea0f8eacf95915eb80270a`, tree
`6928506c12bbc6eee50dc8da26edfb057dafc969`, on branch
`codex/t287-wave1-f03-evidence` from base `75a1daf5`. Its delta is `+221/-3` in
`m5-traversal-conservation.test.mjs`; syntax, build, and diff checks pass.

The 607.5-second serialized live proof is red: 34 pass and 7 fail, comprising
six row verifiers plus the outer test. All stop after installed `matrix-compose`
returns `diagnostic://abiogenesis/hog/retry-input-basis-absent@5`. The affected
rows are flat composition, edge program, batch, structural retry,
same-edge retry, and advance vector. The patch changes only RC5 evidence and
source assertions; it does not change those live callbacks or production.
Therefore this is a frozen review candidate whose live acceptance depends on
the existing F10 retry-input relation, not an accepted F03 feature. The worker
returns immediately to reviewed F10 item-2 implementation.

## Entry 146 - Independent Review Confirms F02 Generated Identity Is Unsound

Timestamp: 2026-08-07T15:15:00+10:00

Source: independent Max frozen-candidate review.

The blocker in Entry 144 reproduces across identity, compose, substitute, and
promote generated GraphFunctions. Independent probes changed tags,
declarations, graph reference, effects, or a node term; all twenty mutations
were admitted under the unchanged generated id. Six independently mutated
identity GraphFunctions were then inserted into an otherwise valid Module;
whole-Program typecheck accepted changes to tags, declarations, graph
reference, effects, node identity, and term.

This is Critical because installed catalog and invocation now select by
GraphFunction id, permitting distinct executable semantics under one selected
identity. The repair removes reduced alternative-hash acceptance and defines
one cycle-safe normalized complete-body identity projection used by constructors
and admission. Legitimate self references receive one fixed normalization and
identity-dependent graph references must be derived without circularly
weakening the body equation. Explicit stable opaque ids remain governed by
catalog collision and publication truth rather than being converted to content
hashes. Acceptance requires field-mutation falsifiers for all four generated
constructors plus whole-Program and fresh serialization/install parity. The
independent reviewer continues the rest of F02 now so the repair receives one
consolidated finding set.

## Entry 147 - F10 Item 2 Enters Red-First Realization With Live Review

Timestamp: 2026-08-07T15:17:00+10:00

Source: Max F10 worker transition and Ultra F_H proxy active code review.

The existing installed R6/F_H proof now demands the exact successor contract
and value kind, ordered five-event construction basis, projected respond and
continue public-operation identities, retry input kind/source, and canonical
duplicate-free causation. Production was initially untouched, leaving the
relation intentionally red before owner wiring.

The first production cluster adds exact contract-by-ref lookup on the existing
admitted leaf port and a HoG successor-carrier derivation. Live review found the
initial helper proved only materialized Graph, cursor identity, and `at_term`;
it did not yet prove that the source coordinate was the held `c_of` F_H
interaction locus. The worker was directed to resolve that source term and
require `c_of`, `F_H`, and the interaction requirement before deriving any
successor, with a non-F_H same-coordinate refusal probe. This correction stays
inside item 2 and prevents a generic successor-authority seam from opening.

## Entry 148 - Frozen F02 Review Rejects Four Complete Blocker Families

Timestamp: 2026-08-07T15:29:00+10:00

Source: independent Max frozen-candidate review; Ultra F_H proxy adjudication.

Candidate `8200083d541e6ce25e52a3d252f8ce67b0e026fa`, tree
`2b2e9904225ba2927675d6630214e81e5d59e3a5`, is rejected rather than merged.
The reviewer completed the whole declared F02 surface before returning the
candidate, so this is one consolidated disposition rather than a sequence of
single-counterexample review cycles.

Four blocker families are established. First, the reserved generated
GraphFunction id accepts any of five competing digest bases and therefore
aliases materially different bodies. Second, whole-Program validation checks
that outer contracts are published but does not prove the exact environment,
outer-template, start/terminal, or workflow-child carrier joins before effects.
Third, object and text admission are not equivalent: object ingress can discard
symbol keys, invalid Unicode can differ across forms, and raw JSON text is
rejected before the existing text-aware admission path. Fourth, the published
conformance issue and negative corpus omit governing evidence and several
declared static C-algebra failure families. Existing 22/22 focused evidence is
therefore green but blind to these relations.

The F_H proxy authorizes one bounded replacement repair now: one cycle-safe
normalized complete-body identity for the reserved generated namespace;
preservation of explicit nonreserved opaque ids; complete static carrier-law
validation before effects; one I-JSON object/text boundary; and the missing
statically decidable issue/evidence/corpus coverage. Runtime semantic
realization remains F03-owned where it requires HoG execution. No F10
retry/closure rewrite, exported identity framework, alternative hash family,
or new Public schema family is authorized. The worker must build the falsifiers
first, freeze once, and return exact evidence for independent review.

## Entry 149 - Wave 1 Unbuffered ETA Holds At Twenty-Two Hours

Timestamp: 2026-08-07T15:29:30+10:00

Source: live worker estimates and current dependency graph.

The central unbuffered estimate from this checkpoint to accepted Wave 1 is 22
productive wall-clock hours, with a credible 18-27-hour range. F10 item 2 is
approximately three worker hours plus review from a reviewable cut. The F02
replacement is estimated at 7-11 hours including independent review and
installed qualification, but runs in parallel with the longer F10 path. F03's
frozen evidence is waiting on F10 rather than a new design, and F04 can enter a
parallel slot after the current frozen-candidate review. The final serialized
integration qualification remains on the critical path. At this checkpoint the
central calendar target is approximately 2026-08-08T13:30:00+10:00.

## Entry 150 - Active F10 Review Removes Three Retry Admission Gaps

Timestamp: 2026-08-07T15:44:00+10:00

Source: Ultra F_H proxy live code review; Max worker corrections in progress.

The item-2 implementation had not frozen when three related gaps were found.
First, retry admission rejected every source whose ordinal equalled the current
route before evaluating its explicit same-route case, while replay allowed that
case. Second, the first correction passed an unverified callback-shaped
`RetryInputContractAuthority` into the ABG owner, allowing a direct caller to
claim any value kind or validator result. Third, HoG initially checked that the
retry value matched some Product contract but did not prove that contract was
the enclosing declared `C.retry.inputCarrierRef` until after the route event had
already been admitted.

The selected correction retains the one privately branded installed
`LeafInvocationPort`; HoG validates the exact Product contract, value kind, and
value before route admission. ABG receives the immutable publication, rehydrates
the exact implementation set from its prefix, equates the publication digest,
requires one exact contract row, and rechecks the cursor preimage before the
attempt event. Same-route and earlier-source causation remain exactly `[route]`
or `[route, source]`. Forged port/callback, publication, different valid
contract, kind, and preimage probes must prove no governed append.

Live projection review also found `exactPublicOperation` allowed arbitrary,
duplicated, or reordered causal references around the respond/continue Public
event. The worker accepted an exact two-reference relation
`[predecessorEventRef, publicOperationEventRef]` plus reorder, substitution,
duplicate, and extra-reference projection negatives for both lifecycle events.
These are item-2 corrections before freeze, not design expansion.

## Entry 151 - Frozen F03 Evidence Candidate Is Rejected For Status Conflation

Timestamp: 2026-08-07T15:45:21+10:00

Source: independent Max cold review; Ultra F_H proxy adjudication.

Candidate `c9d6b4057204f1f910ea0f8eacf95915eb80270a`, tree
`6928506c12bbc6eee50dc8da26edfb057dafc969`, is rejected. Its immutable RC5
census is exact and evidence-only: 40 unique rows across the required axes, 18
direct, 16 equivalent-predecessor, and 6 absence/weaker-precursor rows; all 55
cited line references resolve. No live verifier was removed or weakened.

The blocker is a false current-status claim. `proven()` assigns every row
`status: proven`, and the parent claims all 40 are reconciled, while a cold
609.7-second run produces 55 pass and 7 fail: the parent plus flat composition,
edge program, batch, structural retry, same-edge retry, and advance vector.
Only two of those current runtime-red rows overlap the six RC5 source-class-A
rows. Source provenance and present execution status are therefore orthogonal.

One separate Max worker is authorized to preserve the census and every live
verifier, record 34 current rows as proven and those exact six as
`dependency_red` owned by A5-F10 with reason `retry-input-basis-absent`, and
rename the parent to a census/mapping claim. It must not skip, catch, or weaken
the live failures. Estimated correction and re-review is one to two hours with
no design re-entry and no expansion into six implementation tasks.

## Entry 152 - Corrected F03 Evidence Passes Review And Is Banked

Timestamp: 2026-08-07T16:05:00+10:00

Source: Max replacement worker, independent Max cold review, and Ultra F_H
proxy adjudication.

The replacement freezes as commit
`86f015295d1a65ca58b19b4bf6d7daf080205b9e`, tree
`6bc868dff792c2585bbe1c04877bca6d8ec38b44`. It preserves the exact 40-row
D18/E16/A6 census and every live verifier, records 34 rows as currently proven,
and records the exact six runtime-red rows as `dependency_red` owned by A5-F10
with reason `retry-input-basis-absent`. The cold result is 55 pass and 7 fail:
the parent plus those six named dependency failures, with zero skipped or
weakened evidence.

Independent review returns PASS with no findings because the artifact now
states its evidence boundary exactly; this is not an assertion that A5-F03 is
complete. The corrected one-file evidence delta was squashed onto the main
Wave 1 branch as commit `dd935a1cd14a85c0a4871281def8af5e4d074019`, tree
`6bc868dff792c2585bbe1c04877bca6d8ec38b44`. The rejected intermediate is not
in main history. The six live reds remain on the A5-F10 critical path and must
turn green before A5-F03 can be accepted.

## Entry 153 - F10 Item 2 Reaches Final Pre-Freeze Rehydration Repair

Timestamp: 2026-08-07T16:09:00+10:00

Source: Ultra F_H proxy live review and Max F10 worker checkpoint.

Prepared response and resume operations now require canonical operation
coordinates and exact two-reference causation before their atomic two-event
commit. Forged actor, grant, event-body, ordering, duplicate, and substitution
forms are being added as zero-append negatives. The focused lane then reached
the real post-resume route owner and exposed a narrower defect: a C-call
carrier reconstructed from the durable prefix was structurally valid but was
not admitted to the installed HoG port's private authority set. The worker has
replaced that process-local handoff with exact store-backed rehydration inside
`completeInteractionResume`; the repair is awaiting its first runtime rerun.

No new design family or external blocker is open. The remaining item-2 path is
the forged-carrier negatives, build, four focused F_H cases, adjacent F09/direct
and replay cases, and a scoped diff audit. Current unbuffered estimate to one
frozen independently reviewable item-2 cut is 1.0-1.5 hours.

## Entry 154 - F02 Replacement Freezes After Complete Installed Qualification

Timestamp: 2026-08-07T16:24:00+10:00

Source: Max F02 worker frozen receipt; independent disposition pending.

The F02 replacement freezes at commit
`1b17c5ff10ce76ed25cd205f0f14638de675dd78`, tree
`fe2dda19c09a57f4803b961d7a051f20e1c28cb2`, over rejected intermediate
`8200083d541e6ce25e52a3d252f8ce67b0e026fa`. The full F02 candidate begins at
lawful base `75a1daf5e4e0410c8536ca98e74a2162294d93eb`; review must assess that
complete cumulative surface rather than only the final 18-file repair.

Frozen evidence is green: F02 29/29, M5 GTL 21/21, R1-R6 10/10, portability
18/18, and external installed Product 36/36. The clean replacement delta is
`+1177/-228`; its fixture change contains only reproducible artifact, Product
content, and manifest digests. The candidate claims one complete-body reserved
identity equation, exact static carrier joins, one I-JSON object/text ingress,
and complete static conformance evidence. Runtime `semantic_not_realized`
remains F03-owned. No acceptance or main-branch integration occurs before a
separate Max review of the full candidate.

## Entry 155 - F10 Complete-CCall Review Closes Before Effects

Timestamp: 2026-08-07T16:26:00+10:00

Source: Ultra F_H proxy code review and Max F10 worker correction.

The first post-resume rehydration repair was held before freeze because its
generic projector verified only the digest's locus fields and two event refs,
then trusted caller-carried C-call fields such as Run identity and transition
and closure contracts. Those unbound fields feed later route and closure
effects. The corrected owner now reconstructs the complete F_H C-call from the
admitted execution basis, traversal scope, Program and Graph, interaction set
and row, held cursor, and exact five-event spine; the supplied held carriers
must canonically equal that reconstruction. A forged transition contract must
refuse with zero appends. Build is green.

The focused positive then exposed a test-fixture lifecycle mismatch after
durable reopen. Production already binds a fresh child-preparation port to the
reopened store. The fixture replaced its store but retained the pre-reopen port;
it now replaces both without changing production ownership. Execution advances
through response, resume, exact C-call reconstruction, retry attempt, child
terminal result, and parent success judgment. One local
`judgment_mismatch` at successful retry exit remains under diagnostic review;
no candidate is frozen.

## Entry 156 - F10 C1 Projection Is Exact But Its First Placement Is Rejected

Timestamp: 2026-08-07T16:41:00+10:00

Source: Ultra F_H proxy live code review and Max F10 worker diagnostics.

The successful retry-exit mismatch resolved to one stale projector predicate:
`exactAttemptEvent` required one causal reference although C1 requires exactly
`[currentRoute]` when the route is the input source and exactly
`[currentRoute, distinctOriginalSource]` for a preserved F_H source. The repair
derives that ordered vector, validates the unique route and source, and rejects
reorder, substitution, duplicate, extra, and forged-origin forms. Review also
found that a raw partially checked prior-attempt row could bootstrap later
source authority; the worker is replacing it with bounded exact prior-origin
projection rather than weakening cardinality.

The resulting F_H positive is green. Its paired ordinary same-route retry
control is red at initial structural retry because the first shared helper read
source-cursor fields that do not exist on ordinary retry-progress bodies. That
regression must be corrected from the attempt's exact cursor relation before
the C1 patch can freeze.

Separately, the complete F_H C-call reconstruction was initially placed in
HoG. Its semantics were exact, but HoG then selected and interpreted ABG event
history, reconstructed C-call/result/judgment carriers, and rebranded them.
That is a second ABG projector and violates the Wave 1 ownership seam. The
logic must move unchanged into one ABG-owned explicit-prefix typed projector;
HoG may consume and traversal-check the result but may not fold ABG history.
This is a bounded ownership relocation, not design re-entry.

## Entry 157 - Independent F02 Review Reopens Two Candidate Claims

Timestamp: 2026-08-07T16:41:30+10:00

Source: independent Max read-only review in progress.

The frozen F02 replacement remains held. An executable counterexample shows
whole-Program validation accepts duplicate GraphFunction tags while the
installed language schema declares those tags unique, so code and schema
currently admit different Programs. The reviewer is expanding this into one
complete `uniqueItems` family audit rather than serial findings.

The new conformance issue carrier also assigns every diagnostic the same
compiler-era design axiom, while several diagnostic-to-requirement mappings do
not govern the failure they name. B4's machine-readable provenance claim is
therefore false, not merely imprecise. B2 exact carrier joins and B3 object/text
parity remain under review before one consolidated disposition. No F02 code is
integrated into main.

## Entry 158 - Frozen F02 Replacement Is Rejected And Bounded Repair Resumes

Timestamp: 2026-08-07T16:45:00+10:00

Source: independent Max full-candidate review; Ultra F_H proxy adjudication.

Candidate `1b17c5ff10ce76ed25cd205f0f14638de675dd78`, tree
`fe2dda19c09a57f4803b961d7a051f20e1c28cb2`, is rejected. Five exact defect
families remain. The static C-algebra validator does not equate each leaf's
input and output carrier references with its enclosing requirement contracts,
including the outer F_H request and response relation. Twelve schema-declared
unique sets accept duplicate values in native and raw-text admission. Raw
I-JSON accepts unsafe integers after JavaScript numeric rounding. Diagnostic
provenance assigns a compiler-era axiom and inaccurate requirement set to
unrelated failures. Finally, the conformance corpus cannot truthfully encode
the F03-owned `semantic_not_realized` disposition.

Executable carrier-mismatch, duplicate, and unsafe-integer counterexamples all
passed the rejected validator, so the green qualification receipt was blind to
the claimed relations. One bounded replacement is authorized from the clean
rejected baseline: install those falsifiers first, validate the complete
F_D/F_P/F_H enclosing relation before effects, reject all twelve duplicate-set
families identically at object and text ingress, reject unsafe I-JSON numbers,
bind each diagnostic to its current operative axiom and exact requirements,
and represent runtime realization honestly as an F03 dependency-red where no
installed supplier exists. No F10 redesign or new schema family is authorized.

## Entry 159 - F10 Shared Product Validation And Projector Ownership Correction

Timestamp: 2026-08-07T16:48:00+10:00

Source: Ultra F_H proxy live code review; Max F10 worker correction.

The ordinary F_P retry control failed because the shared Product conformance
validator omitted `fp_hello_instruction` even though the Product supplies the
typed `isFpHelloInstruction` predicate. The proportional repair adds that
missing declared case and retains complete contract validation for ordinary
and F_H retry; no F_H-only bypass is permitted.

The held F_H C-call reconstruction remains exact in relation but was placed in
HoG, where it selected and interpreted ABG event history. Freeze is held until
the unchanged relation is owned by one ABG explicit-prefix typed projector,
Public passes the exact validated prefix, and HoG only consumes the projected
carrier plus traversal coordinates. Focused F_H, paired ordinary retry,
forged-causation, replay, and zero-append controls must pass before independent
review. This is a bounded ownership relocation, not design re-entry.

## Entry 160 - F10 Direct-Port Forgery Forces Admission-Time Reconstruction

Timestamp: 2026-08-07T17:01:00+10:00

Source: Ultra F_H proxy live code review; Max worker correction selected.

The ABG-owned held-interaction projector is exact, but its first consumer form
passed the projected result to `completeInteractionResume` as a plain
structural object. That function compared it only with the separately
caller-supplied held interaction. A direct HoG caller could therefore forge
both carriers consistently, including a basis-owned transition contract, and
reach route admission. The existing negative changed only one carrier and did
not express this counterexample.

The worker's first proposed repair, an ABG-private `WeakSet` projection brand,
is rejected. Although reconstructible in a fresh process, membership would
still decide admission from process-local object identity rather than the
durable relation. The selected correction removes projected outcome authority
from the external resume input. Inside the existing atomic successful-retry
exit owner and before any append, the owner takes one immutable
transaction-entry prefix and rederives the complete F_H C-call, result, and
judgment from the execution basis, Graph, source, resume, Program, interaction
set, and admitted event spine. A paired forged-both carrier must refuse with
zero append; an independently reconstructed carrier must pass. HoG does not
parse event history and no local brand becomes truth.

## Entry 161 - F04 Map Accepted And Dependency-Free Port Starts In Isolation

Timestamp: 2026-08-07T17:03:00+10:00

Source: Max read-only current/donor census; Ultra F_H proxy adjudication.

The F04 map is accepted. The current path lacks a raw-result admission atom,
conflates raw-response and final-output contracts, accepts implementation-owned
actor and transport coordinates, retains four WeakSet authenticity seams, and
admits evidence and result through multiple calls. Accepted T-257 donor
`4d662228` already supplies the pure closed admission/refusal algorithm; T-270
`098c7666` supplies per-locus contract projection. No architecture re-entry or
new event family is required.

One isolated safe-now slice is authorized from banked main `dd935a1c`: direct
red falsifiers plus one ABG-owned pure atom binding raw artifact, exact C-call
locus, actor and worker, distinct raw and final contracts, schema,
renderer/materialization/transport lane, and projector identity. It may not
append events, alter retry/route/closure, use a WeakMap or WeakSet, create a
registry/controller/framework, or implement F02/F10-dependent joins. The
worker must freeze the isolated candidate for a separate Max review.

## Entry 162 - External 17:02 Review Is Rebased And Split By Owning Wave

Timestamp: 2026-08-07T17:10:00+10:00

Source: independent review supplied by F_H; Ultra live-tree reproduction and
adjudication.

Two current A5-F10 counterexamples are confirmed. First,
`hog/structural_execute.ts` projects resolved F_H continuation history from a
mutable store and then admits the structural route before the retry attempt. A
late attempt refusal leaves partial route truth. This is an HoG rival projector
and non-atomic transition inside the active retry-input relation. Second,
Public obtains a Product-owned response decision, but the installed ABG
prepare/commit exports accept a plain record. A direct ABG caller can therefore
bypass Product response meaning while satisfying lifecycle and contract-shape
checks. Both block the item-2 freeze and have been returned to the Max worker
as bounded code corrections with zero-append bypass and partial-failure
falsifiers.

The artifact finding is also confirmed: Event Calculus currently initiates
one unscoped `public_operation_artifact_available` fluent and
`artifact_truth.ts` explicitly requires `identity === null`, while
REQ-R-ABG3-EVENTS-032 requires identity by `authorityScopeRef`. This remains a
finite later A5-F10 roster repair; it does not require design re-entry.

The install-order finding is factually correct but belongs primarily to
A5-F01 in Wave 2. `installProduct` materializes the Product candidate before
the Public owner attempts ABG artifact admission, so admission failure can
leave unadmitted bytes. It blocks release and requires a failure-injection
rollback or exact staged-owner relation in its owning wave, but it does not
expand the current F10 item-2 correction. RootOperationState, empty reopen
registry, Public dispatch, and legacy 18/56 replacement are likewise already
declared Wave-2 migration work rather than new Wave-1 design ambiguity.

## Entry 163 - External Fixture Falsifies The F02 F_H Output Equality Claim

Timestamp: 2026-08-07T17:36:00+10:00

Source: Max F02 installed-external run; Ultra authority/code review.

The repaired F02 validator passed its focused, GTL, R1-R6, and portability
lanes, then refused the developer mini Product's one-surface F_H leaf. The
failure is not a fixture defect. The leaf deliberately declares
`next-action -> action-evaluation-basis` as its enclosing continued C output,
while the external human response contract is `human-approval`. Accepted M05
law keeps those relations distinct: the F_H request completes a pending C-call,
response admission does not invoke HoG, and `run.continue` re-enters the same
locus before the continued C output exists.

Entry 158's statement that an F_H outer output must equal the raw response
contract is therefore corrected. F_D and F_P outer input/output carriers must
equal their executable seam contracts. F_H input must equal its request
contract; its continued output must not be equated with the external response
contract. The worker is applying only that validator/test correction and must
re-run the installed external lane before a final basis refresh. No fixture
semantic edit is authorized.

## Entry 164 - F04 Parallel Carrier Candidate Is Rejected In Prefreeze Review

Timestamp: 2026-08-07T17:39:00+10:00

Source: Ultra prefreeze code/authority review; Max F04 worker self-audit.

The first isolated F04 construction is not promotable. Although it separated
Product meaning from an `authority: none` ABG binding candidate, it introduced
two undeclared carrier families, `ProductProbabilisticResultDecision` and
`ProbabilisticResultBindingCandidate`, across roughly 1,385 production lines.
It also claimed A5-F04 and its requirements while ten downstream obligations
remained explicit dependency-red. This would coexist with, rather than realize,
the accepted `FpResultContractAdmission` family.

The accepted design and donor already contain the smaller relation. Commit
`3c2d86d4` supplies the amended two-profile admission atom with a distinct
opaque transform target candidate; `4d662228` supplies its earlier installed
vertical and falsifiers. The rejected Product/ABG files were removed before
freeze. The corrected red surface now asks for exactly one flat ABG admission
atom, exact I-JSON framing, closed profiles, request-owned contract/edge/actor/
assessment relations, typed non-close refusal, and no event or target-schema
authority. This is donor correction under accepted design, not design re-entry.

## Entry 165 - Alternate-Account Max Worker Takes The Clean F04 Red Boundary

Timestamp: 2026-08-07T17:42:00+10:00

Source: Ultra F_H proxy execution handoff.

The in-account F04 writer stopped after producing the corrected red oracle.
The separate `codex-alt` account is authenticated and now owns only the bounded
implementation phase in isolated worktree
`/Users/jim/src/apps/abiogenesis-5-wave1-f04-safe`. Its session is pinned to
Max reasoning and has no acceptance authority. It must restore only the donor
I-JSON primitive using pinned `jsonc-parser@3.3.1`, implement the one accepted
flat ABG atom, make the focused oracle green twice, and stop prefreeze.

The Ultra session remains F_H proxy and forensic reviewer. No other writer may
touch the F04 worktree. F10 and F02 remain separately owned in their existing
worktrees, so the account transition opens no competing write path.

## Entry 166 - F10 Retry Re-entry Moves To One Explicit-Prefix Atomic Owner

Timestamp: 2026-08-07T17:55:00+10:00

Source: Max worker transition report; independent Max sentinel; Ultra F_H
proxy adjudication.

The F10 worker has begun the bounded replacement selected by the 17:02 review.
HoG caller-authored `retryInput` is being removed. The replacement ABG owner
takes one explicit validated prefix, projects the exact active retry and F_H
origin, binds the publication contract, and stages the route plus attempt as
one expected-prefix two-event transaction. Its next proofs are zero prefix
change after a late invalid-route refusal, stale-prefix refusal, and equality
for an independently reconstructed carrier.

The independent sentinel confirms that the moving tree still contains four
paths that must be deleted or made unreachable before freeze: both HoG
route-then-attempt split writes, the installed raw `admitRetryAttempt` and
`RetryInputBasis` exports, a raw-filter frontier alias, and runtime-failure
prefix selection through internal `store.readAll()`. These are completion
conditions on the current correction, not a design re-entry. No build or green
claim exists yet.

## Entry 167 - F04 Shared I-JSON Primitive Enters Prefreeze Review

Timestamp: 2026-08-07T17:56:00+10:00

Source: alternate-account Max worker; Ultra live-file prefreeze review.

The isolated F04 worker has added only the pinned `jsonc-parser@3.3.1`
dependency and the first shared I-JSON primitive. The primitive detects
duplicate text keys before normalization, rejects comments, trailing commas,
non-finite numbers, sparse arrays, accessors, non-plain objects, and lone
surrogates, and returns a deeply immutable value. No F04 production admission
atom exists yet.

One prefreeze gap is recorded now: numeric admission rejects non-finite values
but does not yet reject unsafe integral values. That would let a parsed integer
outside the exact binary64 interoperable range be rounded before it becomes an
identity-bearing contract value. The final candidate must add one shared
safe-integer rule and an exact text/value oracle; it may not paper over this in
the F04 admission atom. The alternate worker remains the sole F04 writer and
has no acceptance authority.

## Entry 168 - F02 Final Installed Basis Passes 36 Of 36

Timestamp: 2026-08-07T17:58:00+10:00

Source: Max F02 worker installed run; Ultra transition adjudication.

The corrected F02 final basis completed `test:m5:external` with 36 tests passed,
zero failed, in 780.263 seconds. The former 26 failures are eliminated without
fixture-semantic edits. The passing surface includes mixed F_D/F_P/F_H C
algebra, F_H continuation and refusal, closure, exact-basis, gap re-entry, and
correction cases. This confirms the corrected F_H law: request equality is
required at the interaction seam, while raw response and continued C output
remain distinct carriers.

The result is not yet a frozen candidate. R1-R6, portability, the inherited
Consensus red control, final diff inspection, and exact commit/tree freeze are
running next on the same refreshed artifact basis.

## Entry 169 - F10 Full Durable Coordinate Is Required Through Atomic Commit

Timestamp: 2026-08-07T18:01:00+10:00

Source: independent Max sentinel; Ultra live-code verification and F_H
adjudication.

The moving retry atom initially reduced its validated event prefix to one
digest and supplied that digest to the expected-prefix transaction. The
existing store exposes the stronger `DurablePrefixCoordinate` relation—event
count, last event identity, and digest—and an assertion that the held store is
still at that coordinate. A digest-only callback is not the accepted durable
carrier and its public `store.digest()` method can be replaced by a hostile
caller.

Exact D18 Section 7.3 narrows the bounded correction. The request must carry
the full predecessor coordinate and synchronously call the existing physical
held-store assertion immediately before capturing the mechanical in-memory
`store.digest()`. It must then enter the existing digest-guarded transaction
without an intervening effect or message turn. The generic transaction is not
changed and no forged-method threat model is added. Tests cover a wrong or
physically mismatched predecessor with zero append. This is the same atomic
retry relation, not a new design or wider Event Store rewrite.

## Entry 170 - F02 Replacement Candidate Freezes For Cold Review

Timestamp: 2026-08-07T18:03:00+10:00

Source: Max F02 worker final disposition; Ultra transition check.

The F02 replacement is frozen and clean at commit
`e1f483adcc5587e40aa07a6a95baba6f9dd4381e`, tree
`f341f6d62f9a8a2c12d124acc6440e75a31ff2ae`, parent
`1b17c5ff10ce76ed25cd205f0f14638de675dd78`. The exact candidate reports F02
34/34, GTL 21/21, R1-R6 10/10, portability 18/18, and installed external
36/36. The sole Consensus-unit failure is the exact parent-identical
`invalid_event_history` fixture and is excluded from the candidate claim.

The worker has stopped. A fresh Max reviewer with no write or acceptance
authority is reviewing the exact commit/tree at function, module, and global
authority levels. The candidate is not accepted until that review and Ultra
F_H adjudication complete.

## Entry 171 - F04 Prefreeze Candidate Held On Unsafe I-JSON Integer

Timestamp: 2026-08-07T18:04:00+10:00

Source: alternate-account Max worker candidate; Ultra direct counterexample.

The isolated F04 candidate builds and reproduces its focused surface twice:
11 executable checks pass, zero fail, and seven downstream dependencies remain
explicit TODOs. It contains one shared I-JSON primitive, one flat ABG
`FpResultContractAdmission` atom, the pinned `jsonc-parser@3.3.1`, and no
Product, event, store, runtime, registry, retry, closure, WeakMap, or WeakSet
authority.

It is held prefreeze. Direct execution proves that
`admitIJsonText('{"n":9007199254740993}')` returns the rounded value
`9007199254740992` and admits an unsafe integer before canonical hashing. The
same common value ingress accepts an unsafe integral JavaScript number. The
alternate Max worker has received one bounded correction: reject non-safe
integers in the shared primitive, prove raw-value and raw-text refusals plus a
safe boundary control, rerun the focused lane twice, and stop without commit or
freeze. No carrier or downstream integration change is authorized.

## Entry 172 - Generalized Retry Transition Is Deleted In Favor Of Exact D17 D18

Timestamp: 2026-08-07T18:08:00+10:00

Source: independent Max sentinel; Ultra exact-design review and F_H
adjudication; Max worker action.

The untracked `abg/retry_transition.ts` is rejected and deleted, not repaired
forward. Its request accepted caller-provided source and target cursors,
replay state, route candidate and evidence, target input value, and separate
admission bases. It therefore generalized retry admission across initial and
restart paths instead of realizing the frozen D17/D18 relation. An interim
manual `AdmittedRoute` construction also bypassed the route module's private
brand and would have committed route and attempt events before `applyRoute`
refused.

The replacement is the exact two-callable map already accepted at Gate 1.
ABG `projectExecutableRetryInput` reconstructs one closed executable retry
carrier from the explicit immutable full frontier. HoG
`resumeProjectedRetry` reruns that projection from the supplied predecessor,
derives step, route, cursor, and attempt internally, physically validates the
held durable prefix, and performs existing route admission, route application
and exact target verification, then attempt admission inside one rollback
transaction. Existing `executeGraphTraversal` gains only the closed projected
retry branch. No initial-attempt controller, third installed callable, or
caller-authored retry carrier is allowed.

## Entry 173 - F04 Corrected Candidate Freezes For Cold Review

Timestamp: 2026-08-07T18:11:00+10:00

Source: alternate-account Max worker exact freeze; Ultra prefreeze review.

The corrected isolated F04 candidate is frozen and clean at commit
`8815eceb12aceb4ed7c8b2a66a39caaaf9e84f07`, tree
`a05c1ce1bbc2b980affd7dc25d4ea6a06ab0e52a`, parent
`dd935a1cd14a85c0a4871281def8af5e4d074019`. The commit contains exactly seven
reviewed paths: the pinned dependency and lock, shared I-JSON source/export,
flat ABG result-admission source/export, and focused oracle. The worktree is
clean.

The exact precommit build passed and the final focused lane reports 13 passed,
zero failed, and seven explicit dependency-red TODOs. Unsafe integral values
now refuse in both object and exact-text ingress while the safe integer
boundary admits. No integration, amendment, Product authority, event/runtime
authority, or acceptance occurred. A fresh main-account Max cold review is
queued; the frozen candidate is not accepted.

## Entry 174 - D17 Route-Origin Join Implemented Pending Falsification

Timestamp: 2026-08-07T18:17:36+10:00

Source: Max worker transition report; Ultra live code inspection.

The moving D17 implementation now contains the accepted
`projectExecutableRetryInput` carrier family. The prior raw route-chain walk in
`retry.ts::hasExactRouteChainFromCursor` has been replaced by a same-prefix
join between one replay-projected route and one admitted route event. For each
link it recomputes the route body digest and reference, compares source and
target cursor coordinates, declaration, C-call, judgment, contract, replay
state and consumed-availability fields, and requires one prior scoped source
cursor carrier. Later retry attempts preserve the original input-source event;
only attempt one may select a route-connected resolved F_H origin.

This is an implementation transition, not acceptance. The independent Max
sentinel is checking the exact join against forged and stale route bridges.
The worker is continuing only through compilation, the exact D18 installed
callable, and focused stale-F_H, forged-route and route-application rollback
falsifiers. No broad qualification or freeze is authorized yet.

## Entry 175 - D17 Route Join Falsified As Circular Replay Equality

Timestamp: 2026-08-07T18:18:32+10:00

Source: independent Max sentinel counterexample; Ultra code and accepted-design
adjudication.

The moving `hasExactRouteChainFromCursor` correction is held. Its supposed
independent join is circular: `replayValidatedRuntimeEventPrefix(...).routes`
normalizes the same raw `traversal_route_admitted` payload and does not
rederive route-owner admission. A schema-valid advance route can therefore use
an authentic stale F_H successor as source, the current retry-route source as
target, and self-consistent route digest, ref and replay-state fields. Replay
echoes that payload, the raw `sourceCarriers` match finds the authentic resume,
and the helper accepts the forged bridge before attempt admission.

This is a bounded implementation defect inside the settled D17/D18 direction,
not a design re-entry. The worker has been told to delete the circular proof
and either consume the exact relation already admitted by the route owner or
verify that owner's complete same-prefix relation, including causation,
evidence, declared graph, basis, predecessor replay and exact cursor
projections. It must add the concrete stale-F_H forged-route falsifier and must
not create a generic route controller or second route authority. F10 remains
moving and unfrozen.

## Entry 176 - F02 Cold Review Passes And Candidate Is Accepted For Integration

Timestamp: 2026-08-07T18:20:14+10:00

Source: fresh Max cold review; Ultra F_H adjudication.

The frozen F02 candidate at commit
`e1f483adcc5587e40aa07a6a95baba6f9dd4381e`, tree
`f341f6d62f9a8a2c12d124acc6440e75a31ff2ae`, parent
`1b17c5ff10ce76ed25cd205f0f14638de675dd78`, passes cold review with no
current-subject finding. The reviewer verified the one common unique-string
relation across all twelve set ingresses, shared object/text unsafe-integer
refusal before identity, exhaustive seven-constructor C topology, exact
F_D/F_P and asymmetric F_H contracts, pre-selection collision refusal, live
diagnostic-authority mappings, and the explicit A5-F03 dependency-red row.
Fresh basis regeneration reproduced all three candidate digests.

Evidence remains F02 34/34, GTL 21/21, R1-R6 10/10, portability 18/18, and
installed external 36/36. Consensus unit is 17/18 only because the exact
parent-identical `invalid_event_history` case reproduces unchanged. Ultra F_H
accepts this exact F02 candidate for Wave 1 integration. Acceptance does not
yet cherry-pick it into the moving F10 tree and does not accept Wave 1.

## Entry 177 - D17 Progress Currentness Must Be Scope First

Timestamp: 2026-08-07T18:20:14+10:00

Source: independent Max sentinel counterexample; Ultra frozen-D17
adjudication.

The moving D17 projector derives Event Calculus over the complete prefix and
queries `retry_progress_available(progressRef)` without first restricting the
history to the selector's run, graph call, frame, and retry boundary. Because
the current fluent identity is only the progress ref, a later run can copy the
same progress payload, re-initiate that fluent, and make an earlier run's
consumed progress appear current. D17 then selects the earlier event by run
fields while borrowing currentness from the later run.

Frozen D17 explicitly requires scope-first Event Calculus selection. The
worker has received the proportional repair: construct the exact immutable
selector scope before deriving the calculus and current-progress relation, add
the copied-progress cross-run stale control, and do not redesign Event
Calculus. This remains a local implementation correction before D18.

## Entry 178 - D17 Frontier Cardinality Cannot Prefilter Competing Progress

Timestamp: 2026-08-07T18:21:17+10:00

Source: independent Max sentinel counterexample; Ultra frozen-D17
adjudication.

The moving projector counts only raw `retry_progress_recorded` rows already
labelled `progressClass: "retry"`. It can therefore ignore an additional
stopped, completed, or malformed progress row for the same run, graph call,
frame, retry boundary and attempt while constructing an apparently unique
retry frontier. Frozen D17 requires each frontier row to join exactly one
progress relation; competing same-attempt progress cannot be filtered away
before cardinality is decided.

The worker has received the bounded correction: count every same-scope,
same-boundary and same-attempt progress candidate first, then exact-project and
classify the sole row. Extra or malformed competitors must refuse. A focused
same-attempt competing-progress falsifier is required. This stays inside the
one D17 projector and does not reopen Event Calculus or retry design.

## Entry 179 - Forged Route Bridge Deleted; Same-Run Scope Still Open

Timestamp: 2026-08-07T18:24:13+10:00

Source: Max worker correction; independent Max sentinel delta review; Ultra
adjudication.

The circular replay/raw route-chain helper has been deleted. Live admission
now treats an F_H resume as the first retry input source only when the exact
projected F_H successor cursor ref and digest equal the current retry route's
source cursor ref and digest; otherwise the current retry-route event is the
source. No intermediate route bridge or second route projector remains. This
closes the previously demonstrated stale/forged bridge in the live admission
path.

The run-scoped prefix also closes the cross-run progress-currentness example,
but not the complete frozen scope relation. A second graph call or frame in the
same run can still reuse a progress ref and re-initiate the unscoped fluent.
Exact graph-call, frame and retry-boundary provenance remains required before
D17 currentness can pass.

## Entry 180 - Restart Source Join And Installed D18 Bypass Hold F10

Timestamp: 2026-08-07T18:24:13+10:00

Source: independent Max sentinel installed-surface review; Ultra frozen-D17
and D18 adjudication.

Two stop-grade defects remain after the live route correction.

First, `projectRetryAttempt` and `exactAttemptEvent` still recognize an F_H
input source from resume and input fields alone. They do not require the cited
F_H successor cursor coordinate to equal the cited retry route's source cursor
coordinate. A durable first attempt with causation `[currentRoute,
staleResume]`, recomputed identity and the same input can therefore reconstruct
as exact and enter D17 even though live admission would refuse it.

Second, the installed `admitRetryAttempt` export was widened to accept
`ModulePublication | ExecutableRetryInput`. Its projected branch does not
assert the full frontier, verify projection identity, bind the durable prefix,
or rerun D17. An installed caller can fabricate a minimal executable-retry
object and admit the next attempt outside D18's physical-prefix check and
atomic route, apply and attempt transaction. This is a rival retry-reentry
authority forbidden by frozen D18.

The worker is held from freeze. Reconstruction must apply the same exact
F_H-cursor-to-route-source join as live admission. The installed initial
attempt API must return to publication authority only; D18-specific attempt
admission must be source-internal and consume only D18's freshly reprojected
carrier inside its transaction. No new public or installed callable is
authorized.

## Entry 181 - Retry Attempt Returns To The Frozen Minimal Relation

Timestamp: 2026-08-07T18:28:06+10:00

Source: Ultra comparison of the frozen D17/D18 text, parent implementation,
and moving retry delta; F_H proportionality adjudication.

The moving repair had added `inputValueKind`, `inputSourceEventRef`, F_H-origin
selection, prior-origin recursion, and a `ModulePublication |
ExecutableRetryInput` authority union to `admitRetryAttempt`. None belongs to
the frozen D17/D18 attempt relation. The accepted design requires the attempt
to preserve its input contract, ref, digest and canonical value and to bind the
exact source cursor through the cited retry route. The parent implementation
already expresses that relation with one route cause.

The worker has therefore been directed to delete the added source-provenance
mechanism and restore the original seven-argument `admitRetryAttempt` surface:
held store, admitted execution basis, graph, admitted route-applied cursor,
canonical input value, route event ref, and runtime basis. D18 can call that
unchanged admission after fresh D17 projection, route admission, and exact
cursor application inside its atomic transaction. No publication union,
caller-supplied executable carrier, F_H source branch, private replacement, or
extra attempt event field is required. This is deletion and reuse of the
existing owner relation, not another repair layer.

## Entry 182 - Retry Fluent Identity Must Carry The Frozen Scope

Timestamp: 2026-08-07T18:30:28+10:00

Source: independent Max same-run counterexample; Ultra frozen Section 7.3
adjudication.

Run-only prefix selection closes the cross-run example but cannot close retry
currentness. `retry_attempt_active(attemptRef)` and
`retry_progress_available(progressRef)` still use bare refs. A second graph
call or frame in the same run can therefore re-initiate the same progress ref
after the selected frame consumed it; the selector filters that competing row
while run-scoped Event Calculus borrows its currentness.

Frozen Section 7.3 states that all three retry effects are scoped by run,
graph call, frame, and retry boundary. The worker has been directed to add one
common retry-fluent identity constructor and use it for retry attempt/progress
initiation, termination, and every currentness consumer. The generic
`RuntimeFluent` remains unchanged. Paired same-run/different-frame and
same-boundary controls are required. No manual local fold or rival projector is
allowed.

The previously reported progress-cardinality defect is closed in the moving
cut: selection now counts all same-coordinate progress rows before classifying
the sole projected row, so wrong-class or extra rows produce ambiguity or
lineage refusal.

## Entry 183 - F04 Cold Review Rejects Four Local Relations

Timestamp: 2026-08-07T18:34:29+10:00

Source: fresh main-account Max cold review of exact frozen commit; Ultra
authority and proportionality adjudication.

The F04 candidate at `8815eceb12aceb4ed7c8b2a66a39caaaf9e84f07`
is rejected. The reviewer reproduced four current-subject defects against the
compiled exact candidate:

1. Live review admission accepts `expectedActorRef: null` and neither validates
   nor preserves request-owned producer attribution.
2. Raw-object I-JSON reads array accessors, accepts custom array prototypes,
   and drops extra, hidden, or symbol-owned fields from admitted identity.
3. Set-equivalent expected assessment rosters produce different typed failure
   objects because caller order leaks into missing-assessment diagnostics.
4. The module-local wire-profile roster and locus selector are exposed through
   the installed ABG and package-root surfaces.

The seven downstream TODOs remain honest dependency-red rows and were not
treated as installed closure defects. Build/typecheck, 13 focused executable
checks, dependency pin, diff check, and the absence of runtime/event/store
authority all passed. Ultra accepts the four findings because Product requires
unattributed output refusal, the design makes producer identity request-owned,
the raw/text carrier is closed data, request assessment membership is a set,
and the wire-profile selector is explicitly module-local.

## Entry 184 - Alternate Max Worker Starts Bounded F04 Replacement

Timestamp: 2026-08-07T18:35:21+10:00

Source: Ultra F_H correction authority; alternate-account Max worker thread
`019fdb5c-b825-7553-ba38-2288bdb8fb05`.

The alternate account now owns one bounded F04 replacement commit on top of
the rejected candidate. Its allowed surface is the shared I-JSON primitive,
the flat F_P result-admission atom, necessary export pruning, and the focused
test. It must require and preserve request-owned actor attribution, reject
non-data raw-object members without executing accessors, canonicalize the
request-owned assessment set, and remove module-local policy exports. It may
not consume any of the seven dependency-red rows, add runtime authority, edit
constitutional/design/tracking surfaces, or claim acceptance. It will build,
run the focused lane twice, diff-check, commit one clean replacement, and stop
for cold review.

## Entry 185 - D17 Must Refuse Any Later Route From Its Selected Cursor

Timestamp: 2026-08-07T18:37:19+10:00

Source: independent Max forged-history counterexample; Ultra proportional
D17 adjudication.

D17 still treats a held `retry_progress_available` fluent as sufficient
currentness. A later schema-valid `traversal_route_admitted` can cite the
selected retry cursor as source while omitting the selected progress ref from
`consumedAvailabilityRefs`. Replay has moved beyond that cursor, but raw Event
Calculus leaves the progress fluent held and D17 returns the old executable
input.

The correction is fail-closed and local. After D17 rehydrates the exact
selected source cursor, the presence of any later same-run, graph-call and
frame route whose source cursor ref and digest equal that selected cursor makes
the frontier stale, irrespective of the route's consumption payload. D17 does
not authorize, project, or otherwise trust that row; it uses the row only as
negative evidence that the selected frontier cannot be current. The worker
must add paired no-later-route and omitted-consumption-later-route controls.
No route projector or authority surface is added.

## Entry 186 - Same-Run Retry Fluent Scope Is Closed In The Moving Cut

Timestamp: 2026-08-07T18:38:07+10:00

Source: Max worker implementation; independent Max sentinel delta review.

The moving Event Calculus now constructs one canonical retry-fluent identity
over `runId`, `graphCallId`, `frameId`, `retryBoundaryRef`, and the attempt or
progress authority ref. Retry-attempt and retry-progress effects use that
identity, route consumption resolves the matching prior scoped progress
identity, and retry consumers construct the same key. The earlier same-run,
cross-frame fluent-resurrection counterexample is closed on a cut retaining
this implementation.

This is not yet a freeze. The independent Max scope mapper is checking every
producer, terminator, and consumer for exact-key parity. The distinct malformed
outgoing-route case from Entry 185 remains open because scoping alone cannot
terminate a progress ref that the later route omits from its payload.

## Entry 187 - Retry Route Must Consume One Cited Scoped Progress

Timestamp: 2026-08-07T18:38:36+10:00

Source: independent Max retry-scope mapper; Ultra exact-effect adjudication.

The common composite retry key is directionally correct, but route consumption
currently searches every prior progress row with the same run, graph call,
frame, and progress ref and terminates each matching retry-boundary identity.
If a same-frame forged or colliding row reuses that progress ref under another
boundary, one route can consume both scoped fluents.

The one-helper correction is to require exactly one matching prior
`retry_progress_recorded` event whose event id is cited by the route's
`causationEventRefs`, derive its retry boundary from that cited row, and
terminate only that composite identity. Zero or ambiguous cited matches
terminate nothing and fail closed. The worker has received this correction and
a paired same-frame/different-boundary reused-ref control. No RouteCandidate
field or generic fluent change is authorized.

## Entry 188 - Composite Retry Production Shape Passes; Proof Migration Holds Freeze

Timestamp: 2026-08-07T18:42:52+10:00

Source: independent Max retry-scope mapper final disposition; Ultra live
compile and proportional adjudication.

The moving production cut now has one Event-Calculus-owned composite retry
fluent identity over run, graph call, frame, retry boundary, and attempt or
progress authority ref. Every inspected production retry-currentness query
uses that identity; route consumption requires exactly one causally cited
same-scope progress row; the generic `RuntimeFluent` and durable event schemas
remain unchanged. The main tree passes `tsc --noEmit`.

Freeze remains held because proof code still carries the deleted bare-ref and
expanded-attempt model. Required bounded migration is: remove stale
`inputSourceEventRef` and `inputValueKind` assertions, migrate all retry-fluent
oracles to the common identity, add same-ref/different-scope controls with an
exact-scope positive control, pair post-consumption negatives with
pre-consumption positives, cover retry/blocked/advance/terminal routes, and
prove reconstructed-prefix identity plus D17 disposition equality in a fresh
process. The worker must stop at that coherent focused-test boundary for
alternate-account handoff; no new production slice is authorized.

## Entry 189 - D18 Must Authenticate Graph Validation Before Store State

Timestamp: 2026-08-07T18:45:02+10:00

Source: independent Max F10 sentinel; Ultra frozen-design adjudication.

The installed `resumeProjectedRetry` callable compares selected fields from
the caller-supplied `GraphValidation` but does not invoke its owner predicate,
bind its `validationRef` to the execution basis, or establish the exact
validation carrier relation. A forged plain object with copied graph and
function fields can therefore reach the route-and-attempt transaction. This
violates D18 complete runtime-basis preflight and must return
`runtime_basis_mismatch` before effects.

The callable also asserts the live store is at the predecessor prefix before
runtime-basis and route preflight, then repeats that assertion immediately
before the transaction. The first assertion is unnecessary and changes the
frozen refusal priority by consulting mutable store state too early. The
bounded correction is to read the supplied immutable predecessor independently,
authenticate all runtime carriers and compute the route/step purely, then keep
only the immediate pre-transaction held-prefix assertion. Both corrections
are included in the alternate-account implementation handoff; no design
re-entry is required.

## Entry 190 - D17 Currentness Starts At Cursor Admission; D18 Clock Is Preflight

Timestamp: 2026-08-07T18:45:02+10:00

Source: independent Max F10 sentinel follow-up; Ultra event-order
adjudication; alternate-account worker handoff correction.

The first outgoing-route guard compared route ordinal only with the selected
progress ordinal. That leaves a forged but schema-valid sequence in which the
selected retry cursor is admitted, an outgoing route advances it, and retry
progress is recorded afterward. The later progress initiation makes the
fluent held even though the cursor was already consumed. Currentness therefore
starts at the selected retry attempt/cursor admission: any later same-scope
route naming that exact cursor ref and digest as source makes D17 stale. The
retry route that created the cursor names it as target and remains unaffected.

D18 also accepted any non-empty `eventTime`. An unparsable value could reach
event construction, throw inside the transaction, and be mislabeled as a
prefix failure. Timestamp shape belongs to the immutable runtime declaration
preflight and must be validated before store currentness or effects. Both
corrections and paired positive/negative controls were added to the resumed
`codex-alt` worker brief before implementation began.

## Entry 191 - Alternate-Account F04 Replacement Frozen For Cold Review

Timestamp: 2026-08-07T18:49:25+10:00

Source: alternate-account Max F04 worker; Ultra exact-cut intake.

The bounded F04 replacement is commit
`01951d18a46d9952ae8314da0483fcebca3b003a`, tree
`1b8e47acfe021f994d1a329f81581e239a66aeaa`, parent
`8815eceb12aceb4ed7c8b2a66a39caaaf9e84f07`. Its worktree is clean and its
delta is exactly four paths: the F_P admission atom, common I-JSON admission,
ABG barrel exports, and the focused F04 test.

The worker reports both profiles now require and retain one request-owned
actor, raw object admission uses descriptor-only exact member inspection,
expected assessment rosters are canonicalized as sets while wire order remains
digest-significant, and profile/locus policy is module-local. Build and
no-emit typecheck pass; two focused runs each report 23 tests, 16 passed, zero
failed, and the same seven explicit dependency-red TODOs. A fresh main-account
Max cold reviewer now owns the disposition. This cut is not accepted or
integrated until that independent review returns.

## Entry 192 - Nested Retry Progress Cause Closure Is The Next F10 Slice

Timestamp: 2026-08-07T18:51:05+10:00

Source: independent Max F10 sentinel; Ultra scope and owner adjudication.

Direct ABG judged advance and terminal route construction validates a complete
`completedProgresses` relation but writes only the last progress event as its
primary cause and omits the earlier progress event refs from additional
causation. Scoped Event Calculus terminates a progress fluent only from the
exact cited progress admission, so a direct valid ABG nested route can leave
earlier progress fluents held. The installed HoG retry-exit helper currently
compensates by injecting all earlier progress causes, making ABG owner
correctness depend on undocumented caller duplication.

This is an inherited/exposed A5-F10 route-owner defect, not a counterexample to
the moving D18 transaction. It is banked as the next bounded correction after
D17/D18: the ABG admission owner must derive and emit its complete validated
causal set itself, with direct and nested controls. The active alternate worker
is not expanded mid-slice.

## Entry 193 - Old Retry Completion Deletion Includes Its Retained Input Carrier

Timestamp: 2026-08-07T18:55:29+10:00

Source: independent Max F10 sentinel; Ultra scope adjudication.

The provisional old completion path widened
`RetryRuntimeFailureTransitionAdmission` with `retryInput` and returns the
projected attempt through that field solely for the still-live
`completeRetryTraversal` suffix. Deleting only the HoG call would leave a
second event-derived input carrier outside the accepted D17/D18 relation.

The active alternate-worker brief already requires removal of the old direct
completion path and forbids retained retry input. Its exact acceptance check
now includes deletion of the transition field and return member as well as the
old HoG consumer. This is deletion completeness, not a new slice.

## Entry 194 - F04 Admission Atom Accepted For Wave 1 Integration

Timestamp: 2026-08-07T18:56:26+10:00

Source: fresh main-account Max cold review; Ultra F_H-proxy disposition.

The cold review passed exact candidate
`01951d18a46d9952ae8314da0483fcebca3b003a`, tree
`1b8e47acfe021f994d1a329f81581e239a66aeaa`, with no finding. It independently
verified mandatory request-owned actor attribution for both profiles,
descriptor-only identity-exact raw I-JSON admission, duplicate-safe canonical
expected-roster sets, module-local profile/locus policy, zero event or runtime
authority, four-path scope, clean worktree, build/typecheck, focused tests, and
the continued visibility of all seven dependency-red TODOs.

The F_H proxy accepts this exact isolated atom for Wave 1 integration. The
acceptance does not complete A5-F04 or Wave 1; F04-05, F04-08, F04-10 through
F04-14 remain downstream work. The cut stays banked in its clean worktree and
must not be cherry-picked while the main F10 tree is moving.

## Entry 195 - Alternate Worker Begins F10 At The Existing Executor Seam

Timestamp: 2026-08-07T18:57:13+10:00

Source: alternate-account Max implementation worker transition; Ultra live
scope review.

After completing authority reconstruction without edits, the alternate worker
started at the accepted ownership seam. The leaf completion layer is being
reduced to return the already-admitted ABG failure transition and to stop
authoring retry route/attempt completion. The existing graph executor will own
the D17 projection, atomic D18 re-entry, and verified projected-resume XOR
branch. The temporary retained `retryInput` member is being deleted with its
old consumer.

The first changed files are `abg/retry.ts` and `hog/execute.ts`. This direction
matches the frozen D17/D18 construction and has not opened a new callable or
controller. The main diff hash moved from `08bd83af...` to `017ee145...`; no
freeze, focused evidence, or acceptance exists yet.

## Entry 196 - Raw Resume Must Remain Non-Retry In The XOR Cut

Timestamp: 2026-08-07T18:58:59+10:00

Source: Ultra live source-diff review; independent Max sentinel stop check.

The moving `graph_execute.ts` omits the prior rejection when
`input.resume.cursor.retryPath` is non-empty. Frozen D18 explicitly preserves
the raw resume branch only for non-retry cursors; retry reconstruction belongs
exclusively to the projected D17/D18 branch. Leaving the check removed would
retain caller-authored retry ingress beside the new authority path.

The active XOR cut must restore the empty-retry-path condition and enforce
both sides of the closed branch: projected retry forbids raw `input`,
`inputDigest`, and `resume`; initial/non-retry resume forbids
`projectedRetryResume`. The sentinel will stop any cut that does not close this
before focused tests or freeze.

## Entry 197 - Projected Resume Binds The Exact Global D18 Tail

Timestamp: 2026-08-07T19:03:30+10:00

Source: independent Max F10 sentinel counterexample; Ultra stop and
alternate-account thread resumption.

The first projected-resume reprojector read the carrier successor prefix,
filtered immediately to the retry Run, and validated the route, attempt, and
Event Calculus truth. A caller could append an unrelated-Run event, replace
only `successorPrefix` with that later authentic same-file coordinate, and
still pass every run-filtered relation. That violates the frozen uninterrupted
D18-to-traversal handoff.

The worker was stopped before branch wiring and resumed on the same thread
without resetting its edits. The corrected branch must synchronously require
the carrier coordinate to equal the held store physical tail, inspect the
unfiltered durable prefix, and require the cited retry attempt to be the global
last event and cited retry route the global penultimate event with adjacent
ordinals. Only then may it project run-scoped truth and traverse. The raw
non-retry resume condition from Entry 196 remains part of the same cut.

## Entry 198 - Exact D18 Global Successor Suffix Is Closed In Moving Code

Timestamp: 2026-08-07T19:04:45+10:00

Source: alternate-account Max implementation; independent Max sentinel delta
verification.

The projected reprojector now reads the unfiltered durable coordinate before
selecting the retry Run. It requires the carrier route to be the global
penultimate event, the carrier attempt to be the global last event, and their
admission ordinals to be adjacent. The later-tail and cross-Run prefix
substitution counterexample from Entry 197 is closed on a cut retaining these
checks.

This remains moving code. The projected XOR branch is still being wired and
has not reached a stable typecheck or focused proof boundary.

## Entry 199 - Projected Carrier Pure-Check Exceptions Map To One Diagnostic

Timestamp: 2026-08-07T19:05:39+10:00

Source: independent Max F10 sentinel counterexample; Ultra stop and
alternate-account thread resumption.

`isProjectedRetryResumeCarrier` directly canonicalized the supplied input and
cursor outside a catch. A correct-key forged carrier containing cyclic or
otherwise non-I-JSON data could throw a lower canonicalization error instead
of the frozen
`diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5` exception.
That breaks the branch's closed diagnostic contract even though no event is
written.

The alternate worker was paused and resumed on the same edits. The complete
carrier predicate or its call boundary must be exception-safe so every lower
pure-check failure maps to the exact carrier-mismatch TypeError with zero
events. A cyclic/malformed carrier control is required before focused-green
disposition.

## Entry 200 - Installed D17-D18 Execution Reached And Held

Timestamp: 2026-08-07T19:14:56+10:00

Source: alternate-account Max implementation worker focused run; Ultra live
adjudication; independent Max sentinel.

The first installed executor run reached the new owner path, proving that the
old direct retry route is no longer the exercised success path. The focused
installed retry suite returned one pass and two failures. Retry success
reached the admitted failure-progress frontier and then D17 refused with
`frontier_lineage_mismatch`; the stationary and budget-stopped case returned
`failed` where its oracle requires `blocked`. No freeze or acceptance exists.

The worker may debug the exact D17 lineage and terminal-disposition relations,
but cannot weaken the frontier, causation, or projected-resume checks to make
the current fixtures green.

## Entry 201 - Projected Retry Lost The Root Graph Input Preimage

Timestamp: 2026-08-07T19:14:56+10:00

Source: independent Max sentinel counterexample; Ultra code-path review.

The current projected branch computes `graphEntryInput` from D18's retry-locus
`inputValue` while assigning `graph.admittedInputDigest` as its digest. Those
values are equal only when no earlier graph term transformed the input. A
lawful `C.compose(transform, C.retry(F_P), workflow.C(F_H child))` therefore
passes retry re-entry but cannot construct a downstream held suspension:
`sha256(parentGraphInput)` differs from `parentGraphInputDigest`.

This is a real constructability gap at the join between the frozen projected
retry entry and the inherited held-workflow/recursion carrier, not authority
to fabricate a pair. Casts, non-null assertions, caller fields, reuse of the
retry-locus value, or validation weakening are held. A fresh Max review is
tracing whether the admitted root preimage already has one authoritative
carrier; otherwise the F_H proxy will select the smallest global correction
before the alternate worker resumes this seam.

## Entry 202 - ExecutionBasis Is The Existing Root-Preimage Authority Seam

Timestamp: 2026-08-07T19:25:16+10:00

Source: independent Max constructability review; Ultra F_H-proxy
adjudication.

The missing value belongs to the existing per-GraphCall `ExecutionBasis`, not
to D17's retry carrier and not to a new Graph, catalog, or caller authority.
`ExecutionBasis` already binds `rawInputAdmissionRef` and `rawInputDigest` and
is rehydrated from the durable `basis_admitted` event for root and child
graphs, but the accepted event/carrier drops the canonical value preimage.

The bounded correction is to add that exact graph-entry value to the existing
ExecutionBasis body and `basis_admitted` event, cover it by `basisDigest`, and
require its canonical hash to equal both `rawInputDigest` and the admitted
Graph input digest. The projected executor derives `graphEntryInput` only from
that rehydrated basis. D17 remains retry-locus-only; D18's projected entry
continues to reject caller-authored raw `input`, `inputDigest`, and `resume`.

This is a bounded constructability delta inside the already-selected ABG
authority path. It is not a Product decision or permission for a second
controller. Exact event-schema, caller, and falsifier impact is under the same
independent review before the alternate worker receives the correction.

## Entry 203 - Max Consensus Selects Basis-Admitted Preimage

Timestamp: 2026-08-07T19:31:36+10:00

Source: two independent Max authority traces; Ultra F_H-proxy acceptance.

The independent comparison selected `ExecutionBasis`/`basis_admitted` over
`traversal_cursor_entered`. The basis is the first common root-and-child atom
that already closes raw-input ref/digest, validated Graph, GraphValidation,
Program, implementation sets, and closure. It also survives prefixes that
refuse before an initial traversal cursor exists. The cursor alternative would
split that relation into a later vector-local event and still leave earlier
admitted prefixes unable to reconstruct the input.

The accepted bounded correction adds canonical `rawInputValue` to root and
child ExecutionBasis inputs and the existing basis event/body, includes it in
`basisDigest`, and rejects unless its digest equals the basis and Graph input
digests. Rehydration independently rechecks that semantic equality. Initial
and non-retry execution authenticate their raw value against the basis;
projected retry uses only the basis value for later suspension lineage while
its live `currentInput` remains D18's retry-locus value.

No D17 or D18 request/result field changes, new event kind, caller field,
projector family, or controller are authorized. The required falsifier is an
installed transform-before-retry prefix, fresh-process D17/D18 re-entry, then
a downstream workflow or recursion hold whose parent Graph input reconstructs
from the basis. AX-F09's existing JS fixture must also supply and validate the
real admitted input instead of relying on its non-fan-out early-return hole.

## Entry 204 - Entry203 Basis-Preimage Relation Accepted

Timestamp: 2026-08-08T00:25:04+10:00

Source: frozen Max implementation candidate; cold Max review; replacement
F_H-proxy code-path and evidence adjudication.

The reviewed subject remained exact at HEAD
`dd935a1cd14a85c0a4871281def8af5e4d074019`, tracked binary-diff digest
`2de2741519c04e59bd80803b774992038eaabea2a036b7777c989b0f403c2284`,
and porcelain digest
`6b7b302c23e598d2ad6f79fb7acb6dc2eab082e6b6f4d95565899b392ca83841`.
The cold rebuild reproduced artifact `89879189...`, Product content
`4d021cdd...`, and manifest `102f8db5...`.

The Entry203 relation passes. Root and child `ExecutionBasis` retain the
canonical graph-entry preimage in the existing `basis_admitted` truth, cover
it with `basisDigest`, and check its equality with the admitted input digest.
Fresh-process projected retry rehydrates that basis. It uses the basis value
for root-Graph lineage while retaining D18's transformed retry-locus value as
the live input. Initial-entry mismatch refuses before effects. The installed
D17/D18 lane passed 4/4 and installed AX-F09 passed with
`preserved_green` across separate producer and consumer processes.

The seven red cases in the broader R6 file do not reach this relation. Four
are inherited fan-out/structural-step integration reds. Three use removed
Event Store test-harness APIs. They remain integration debt and are not
accepted as Wave 1 qualification. The AX-F09 fixture's runtime identifier
roster is also wider than its authored declaration roster; this is a local
fixture-projection cleanup, not an Entry203 authority defect.

Disposition: `accept` for Entry203 only. This does not accept A5-F10, Wave 1,
the moving worktree, or the stale broader suites. No commit or checkpoint is
created by this disposition.

## Entry 205 - Select The Banked Complete Retry-Progress Cause Relation

Timestamp: 2026-08-08T00:25:04+10:00

Source: Entry192 banked finding; Entry204 acceptance; replacement F_H-proxy
work selection.

The next bounded A5-F10 relation is Entry192. ABG's route-admission owner must
derive and emit the complete validated causal set for direct and nested retry
progress. HoG must stop compensating by injecting earlier progress-event
causes. Direct ABG and installed nested controls must prove that all completed
retry-progress fluents terminate through ABG-owned admitted causation.

No new event kind, caller-supplied cause roster, controller, Event Calculus
authority, Product meaning, Public operation, or compatibility path is
authorized. The worker must preserve the accepted Entry203 relation, freeze
one exact candidate, and stop for cold review. Unrelated fan-out and Event
Store harness migration remains held unless it is an unavoidable prerequisite
of the exact Entry192 proof.

## Entry 206 - Entry205 Frozen Candidate Requires One Local Cause Repair

Timestamp: 2026-08-08T00:56:00+10:00

Source: frozen Entry205 candidate; cold Max review; replacement F_H-proxy
source adjudication.

The frozen subject at tracked binary-diff digest
`a28fc2617ed0b2065fa45b279802cec57844dee5ef48fc1211a79456347472fc`
is rejected for one confirmed High finding. Judged terminal and ordinary
judged advance now cite the complete validated retry-progress chain, but an
advance that also admits `construction_delta_observed` constructs the route
with the new delta event as its primary cause. The outermost completed
progress had been selected as the ordinary route primary and is not present
in the earlier-progress suffix. The resulting route therefore cites the delta
and inner progress, but omits the outer progress.

Event Calculus terminates a consumed retry-progress fluent only when the route
directly cites that progress admission. A lawful construction/evaluateAction
advance exiting nested `C.retry` can consequently leave the outer progress
fluent held while the focused terminal proof and installed retry suite remain
green.

Disposition: `local_repair`. The worker may repair only the construction-delta
batch join so its route cites the delta plus the complete owner-validated
progress cause set, without caller compensation or Event Calculus changes.
One focused judged-advance construction-delta control must prove both nested
progress fluents terminate. Entry203, ordinary Entry205 terminal/advance,
construction-delta provenance, and eventless malformed-chain refusals must be
preserved. No construction redesign, new event, carrier, controller, Public
or Product change is authorized.

## Entry 207 - Reachability Audit Withdraws Entry206 Finding; Entry205 Passes

Timestamp: 2026-08-08T01:04:45+10:00

Source: worker constructability counterexample; live validator and route-owner
inspection; cold Max reachability delta; replacement F_H adjudication.

Entry206's High finding is withdrawn. Current Product admission requires a
construction-composition GraphFunction with exactly eight immediate terms.
`evaluateAction` is the direct `C.of` at index 4 with the exact declared
composition, vector and locus. `constructionDeltaForAdvance` activates only at
that source term. Its lawful cursor therefore has no enclosing retry context
and `hasCompletedRetryProgressChain` requires zero completed rows.

Wrapping a parent workflow call in `C.retry` does not make the finding
reachable: the child GraphCall's evaluateAction cursor remains retry-empty,
while the parent retry-exit route originates from `c_workflow` and cannot emit
the construction delta. The attempted Product-level retry wrapper was refused
by normal catalog admission with `missing_membership`; it was removed. No
validator, Product, Event Calculus or production repair was made.

The exact frozen candidate was restored at tracked binary-diff digest
`a28fc2617ed0b2065fa45b279802cec57844dee5ef48fc1211a79456347472fc`,
porcelain digest
`6b7b302c23e598d2ad6f79fb7acb6dc2eab082e6b6f4d95565899b392ca83841`,
and candidate-basis digest
`116b92c747881576ba60528179d03833231ea436f93fbc6f566082ddd525d28c`.
Cold isolated build and package identities reproduced; installed retry passed
4/4 and AX-F09 remained `preserved_green` across six cases. The generic
provenance-basis merge does not substitute an owner-derived cause and is not a
finding.

Corrected disposition: `accept` for Entry205 only. ABG owns and emits the
complete validated retry-progress cause set on every reachable judged
terminal and advance exit; HoG no longer compensates. This does not accept
A5-F10, Wave 1, the moving worktree, or broader qualification.

## Entry 208 - Serialized A5-F10 Qualification Fails With One Bounded Repair

Timestamp: 2026-08-08T02:39:51+10:00

Source: accepted Entry203 and Entry205 relations; serialized conservation,
M4 and full M5 qualification; cold Max diagnostic review; replacement F_H
adjudication against live authority and code.

The accepted Entry205 semantic cut remained
`a28fc2617ed0b2065fa45b279802cec57844dee5ef48fc1211a79456347472fc`.
M4 lawfully regenerated five tracked Governor/R10 proof artifacts, so the
post-qualification whole-tree digests are binary
`3016a186d2518c16870e96c82372739ab309a642089b79a1e6b3b21e127a22d9`
and porcelain
`8b6b74e301a6fb9459676b6176b79e602482dc954a3cbcfe943ce35bd51c9725`.
No semantic source or test edit occurred during qualification and
`git diff --check` passed.

Serialized results were:

- conservation: 43/62, with 19 failures collapsing to four witnesses plus
  the outer aggregate;
- M4: 19/30, with 11 failures collapsing to three proof-harness roots;
- full M5: 177/216, with 39 failures classified exactly;
- installed retry: 4/4 green inside full M5;
- AX-F09 and the accepted Entry203/Entry205 retry relations remain intact.

The candidate is not A5-F10 qualification-capable. Five existing-owner
production/integration relations require repair:

1. `public/cli.ts` must carry the complete existing durable close pair
   `{prefix, reopenAuthority}` into `reopenRootOperationContext`; passing the
   reopen coordinate alone causes `basis_mismatch` across installed
   continuation and Consensus paths.
2. Public continuation refusal paths must retain the current exact
   continuation-authority projection. Early open-state validation currently
   falls through the generic Public catch and drops it.
3. Gap re-entry must not acquire and then leak the exclusive append context
   across pre-effect refusal. Acquisition and cleanup must remain one existing
   Event Store ownership boundary; lock weakening or another store path is
   prohibited.
4. Consensus transport failure after admitted retry progress must complete
   through the existing ordinary failed route and `run_stopped` topology.
   The current path ends in `runtime_failure_observed` after an
   operation-application/open-call exception. Entry205 causation must remain
   unchanged.
5. Required setup invocation references must bind to the exact admitted
   install/workspace facts. A substituted `workspaceBindingInvocationRef`
   currently succeeds despite the durable identity contract.

The remaining failures are proof migrations, not permission to restore old
authority: synthetic close-pair fixtures; direct/private Event Store
construction and removed `configureDurableLog`; missing `artifactTruth`; B8
whole-log and outcome-index assumptions; nested retry `[1,1,2]` topology;
five exact runtime-evidence references; zero append for Product-invalid
correction response; and unavailable-worker `failed` disposition required by
the accepted M05 transport-failure law.

Disposition: `local_repair`. Authorize one A5-F10 realization-refactor
candidate covering only these five relations and their exact proof migrations.
The worker chooses owner-local call signatures and mechanics. It may not add
Product meaning, another event kind, controller, runtime, catalog, admission
authority, compatibility path, public Event Store constructor, or
`configureDurableLog`; weaken exact validation or locking; alter Entry203 or
Entry205; edit specification, design, goals or tickets; adopt donor code; or
begin packaging before focused and serialized qualification are green.

## Entry 209 - TV5 Opened-CCall Generic Projection Repair Frozen

Timestamp: 2026-08-09T00:27:44+10:00

Transition: Max worker to F_H assessor after the bounded TV5
`nested_retry_exit_frame_shift` local repair and corrected cold constructability
review.

The frozen input basis reproduced at HEAD
`dd935a1cd14a85c0a4871281def8af5e4d074019`, 93 tracked modifications and 22
untracked paths, status 9,560 bytes with SHA-256
`3c53db9d310971d5458149246aa40491f0aa47ea07265e4a46e36daa669661ca`,
and canonical 97-path composite 5,093,148 bytes with SHA-256
`87df9a6d4803f775f4b94a7d1addb194fd5d89813d24377e2d962dc1d6d927eb`.

The frozen candidate retains the same HEAD and path census. Its canonical
97-path composite is 5,104,743 bytes with SHA-256
`7f39fbe8fd3861395d1d9a2985a7b34b9de89174d67374607d738c9f7842c050`;
status remains 9,560 bytes with the same SHA-256. Exact authored identities are:

- T-287 content SHA-256
  `3485f6aab816880ddb0c30f958cad7e63f92a59cbe242088d8caf50ae92c2649`,
  blob `96a9d38a5eaf465dacef35fb7be2b9e59ea4ba50`;
- `code/src/abg/c_call.ts` content SHA-256
  `9539af98b34e1f615ab2876d77f06d2add7f21fae0fd7b2623ea1e6a1816231e`,
  blob `57b8a32d2283b9acd5cbcd85af277ca8a1efec36`;
- R6 proof content SHA-256
  `6a5fa58c622a937d6b43cc4d3464fbfb832f009e5f075ad2164fe823108fb904`,
  blob `8ea01af6f7bc78b2adec3ce97e02c658b57823c2`;
- candidate-basis content SHA-256
  `f6cb7627fa16f24ec90b1490296c685ece23a4ba24e13d80f506f389f09ca712`,
  blob `603c640a7728d640825742ae3a7f9ef3980c7179`.

The production repair is one private generic CCall coordinate predicate shared
by the leaf and workflow opened-carrier projectors. It requires one safe
positive integer attempt and an array whose entries are safe positive
integers. It does not impose retry-path non-emptiness or couple the attempt to
the path tail. Retry coupling remains in the retry owner.

The proof uses only existing published topology. The unchanged bounded-
recursion Product with `constructBoundedRecursionState(3)` emits the admitted
foldback and advance route that owns the attempt-two, empty-path parent leaf
cursor; its opened prefix reconstructs the exact leaf CCall. The existing
nested-retry fan-out proof derives the depth-zero continuation into its already-
published reducer `workflow.C`; its admitted attempt-one, empty-path prefix
reconstructs the exact workflow CCall. No coordinates or events are restamped.
The two retained held-F_H reconstruction assertions and existing non-empty
retry and corruption controls are unchanged.

Verification is green:

- `npm run build`: exit 0;
- TV5 rooted-topology common laws: 3/3;
- exact serial R6: 18/18 in 191,138 ms;
- serialized conservation: 62/62 in 640,134 ms;
- `git diff --check`: clean.

The prescribed candidate-basis owner was run after the stable build and again
after conservation's deterministic rebuild; both runs reproduced artifact
`sha256:3a48f248042acb9d63ad6f82c5ce701ae697bee002f159e1a0ebcfe20dbbb0d1`,
Product content
`sha256:96e0d1a91c368a6bee261e18bb84f11426d0a352d8fe85bbef47241f3d8a95af`,
and manifest
`sha256:5d279c127e2a733116c8ce65b2534c0312db5b98a803f236eade3716b8dd7d31`.

No production redesign, new GTL topology, Product or design meaning, event or
identity change, admission or export change, compatibility path, alternate
projector, process-local authority, Public redesign, or RootOperationState work
entered this delta. Nothing was staged or committed. The candidate stops here
for assessment.

Assessor Disposition:

### Entry 213 F_H Adjudication - Rejected, One Proof-Support Repair

Timestamp: 2026-08-09T10:53:00+1000

The fresh cold-start Max reviewer returned `FAIL`. F_H independently
reproduced the blocking relation against the frozen retained proof. Entry213 is
rejected only; its one-Run R10 correction, exact candidate identities, and
lawful physical-prefix handling remain valid.

R2 accepts a different self-consistent lock and install projection. A caller
can change the sole resolved-lock row's artifact identity, recompute the lock
digest and lock id, bind the ProductInstall outcome to that forged pair,
recompute both outer outcome digests, and still obtain `root_satisfied` with
all ten obligations true. F_H separately confirmed that independently changing
the ProductInstall artifact, Product-content, manifest, package-name, or
package-version field also remains green. The current mutations cover product
id, row count, and one-sided lock mismatch only; they do not falsify these
complete forged relations.

The cross-execution proof-byte difference is not a defect. Independent runs
delete and recreate the event file, and the accepted durable-prefix authority
deliberately carries its device and inode. The diagnostic proved inode was the
sole independent changed leaf and every changed ref or digest was canonically
derived. No physical authority may be removed or normalized to make separate
stores byte-identical.

One bounded proof-support repair is authorized. R2 must:

- require one actual resolved-lock row and bind its Product id, package name,
  package version, artifact digest, Product-content digest, and manifest digest
  to the exact candidate basis;
- recompute the lock digest over its exact rows, dependency edges, and native
  contract closure and derive the lock id from that digest;
- bind the complete resolved-lock outcome to the same lock durably carried by
  the owner-admitted install event;
- bind the ProductInstall identity fields and exact install identity to the
  candidate and that lock; and
- preserve every existing setup-event, invocation, event-accounting, prefix,
  replay, and governor relation.

Decision-exact negatives must include a non-array indexed row carrier; each
candidate identity changed in the lock row; a self-consistent changed row with
recomputed lock/install/outcome identities; a changed non-candidate lock field
against the owner-admitted event; each ProductInstall candidate-identity field;
and inconsistent lock digest/id and install identity. Each reaches first
frontier R2 without an earlier outer-digest failure.

The repair remains limited to the existing R10 test, root governor, governor
test, and five generated proof files. It may add no production, Product,
requirement, design, ticket, schema, operation, event kind, authority, store,
runtime, compatibility, or physical-prefix change. Run one exact R10 proof,
the retained-proof governor mutations, and mechanical identity/scope checks;
then freeze once for a fresh cold review. Do not resume M4 or wider
qualification before acceptance.

Assessor Disposition:

### Entry 212 F_H Adjudication - Accepted

Timestamp: 2026-08-09T09:04:31+1000

The fresh cold-start Max reviewer returned `PASS` for Entry212 with no
Critical, High, Medium, or Low finding. Freeze-before and freeze-after were
identical at HEAD `dd935a1c`, status SHA-256
`1aeec3b928330f7cc0501471eda53a6a93a0be552abfa3c457cd3b8d4ee532b4`,
and implementation-subject SHA-256
`21bd732a1fe905540793501a368f9c477ecffa360b59281618b77f8f5a30181b`.
The reviewer independently reproduced the 117-path, 9,887,509-byte composite,
the 521-byte candidate basis, and the artifact, Product-content, manifest, and
assurance-log identities. No review edit, generation, package refresh, staging,
commit, or test execution occurred.

F_H independently sustains the PASS.

1. Live F_H resume and replay now apply one owner relation. The relation
   reconstructs the responded continuation, full durable predecessor, exact
   execution basis and closure, construction successor input, complete cursor,
   and held-to-successor law. A restamped input, cursor, predecessor, or owner
   coordinate invalidates the F_H projection and therefore masks an unrelated
   invocation query rather than publishing partial truth.
2. Workspace binding now consumes the Product-reconstructed
   `WorkspaceAuthorityBasis` and the ABG-reconstructed causal ProductSet and
   lock. Live admission and replay repeat the same complete constructor
   relation. An internally re-digested impossible authority coordinate has no
   owner-admission or projection path.
3. Artifact owners validate the complete Public operation basis and project the
   exact successor semantics before the checked durable append. Malformed and
   empty install, bind, run, respond, and continue bases refuse without
   changing the held prefix. No returned semantic refusal follows an invalid
   durable mutation.
4. The construction-resume correction uses the existing ABG rehydration seam.
   Rehydration first reconstructs the unique exact `basis_admitted` fact and
   then issues the in-process witness consumed by the unchanged owner relation.
   Object identity does not replace the event prefix: a fresh process derives
   the same witness, while an arbitrary self-consistent object remains
   non-authoritative.

The common rooted-topology partition remains authority-neutral. The repair adds
no Public operation, semantic switch, event kind, catalog, store, registry,
runtime, callback, controller, compatibility path, donor path, or alternate
admission relation. The two-pass package identity and the worker's focused and
serialized-conservation results remain persisted implementation evidence; the
reviewer did not substitute those counts for code review.

Entry212 `setup_invocation_authority_reconstruction` is accepted. This accepts
only the bounded increment. A5-F10, the wider candidate, Wave 1, T-287, full M5,
final Wave qualification, and release readiness remain unaccepted.

PASS — accepted for the Entry209 opened-CCall projection relation only.

Timestamp: 2026-08-09T00:37:42+10:00

The cold-start Max review reproduced the exact frozen subject before and after
review: HEAD `dd935a1cd14a85c0a4871281def8af5e4d074019`, 93 tracked plus 22
untracked paths, status SHA-256
`3c53db9d310971d5458149246aa40491f0aa47ea07265e4a46e36daa669661ca`,
and canonical 97-path composite SHA-256
`7f39fbe8fd3861395d1d9a2985a7b34b9de89174d67374607d738c9f7842c050`.
It returned PASS with no findings. The F_H proxy independently confirms that
one private positive-attempt/positive-path-entry predicate serves both opened
CCall projectors; the unchanged bounded-recursion owner supplies the admitted
leaf `2, []` witness; the existing fan-out continuation supplies the admitted
flat-workflow `1, []` witness; and retry-tail coupling remains retry-owner
local. No event or coordinate was fabricated or restamped.

This disposition accepts neither A5-F10 nor Wave 1, does not overwrite the
last full serialized Entry208 red verdict, and authorizes no Public,
RootOperationState, compatibility, topology, event, export, or Product change.
The next work is a separately bounded A5-F10 authority increment for removal
of reachable RootOperationState/process-local setup and invocation truth before
another full serialized qualification.

## Entry 210 - Setup And Invocation Authority Reconstruction Frozen

Timestamp: 2026-08-09T03:37:10+1000

```text
fixed 5.0 features:
  A5-F01..A5-F11 and A5-F13..A5-F17
active wave:
  W1 = A5-F10, A5-F02, A5-F03, A5-F04
selected feature and slice:
  A5-F10 / graph_catalog_contraction_and_runtime_recovery
active increment:
  setup_invocation_authority_reconstruction
  = complete verified-carrier revalidation + exact ABG-prefix setup/invocation
    truth + no process-local semantic authority
semantic source/tool/runtime split:
  GTL definition and topology own meaning
  HoG owns traversal and selection
  ABG events, Event Calculus, and replay own runtime truth
  catalog readiness, view, and application remain pure reconstructible tools
```

Transition: Max worker to F_H assessor after the separately bounded removal of
reachable `RootOperationState` and process-local setup/invocation semantic
authority. TV5 remains accepted Entry209 history and was not reopened.

The frozen candidate is at HEAD
`dd935a1cd14a85c0a4871281def8af5e4d074019` on
`codex/t287-wave1`, with 107 tracked modifications and 25 untracked paths.
`git status --short` is 10,834 bytes with SHA-256
`db7b2bef6d0bf26e86d48724744e0a4aa533787da914b40210586ac5c4d06d46`.

The canonical implementation subject contains the 107 tracked delta paths and
seven untracked tenant paths. It excludes all 18 untracked commentary paths,
including this append-only assurance log. The 114 paths are C-sorted and each
is encoded as `path NUL status NUL content NUL`; status is `F` for a present
file and `D` with empty content for the one deleted tracked path. That composite
is 9,806,327 bytes with SHA-256
`18247fe74f724db2c408db9b79b75420f010a1af5d8bfa9a86e4fb9b7a42c30f`.

The realization hard break is:

- Product verification returns one complete immutable carrier; resolution
  independently rereads exact artifact bytes, revalidates every carrier seam,
  and requires canonical equality with the supplied complete carrier;
- Product install, workspace bind, and run reconstruct their exact owner facts
  from explicit durable ABG prefixes and invocation references;
- catalog admission remains pure and eventless from one complete immutable
  readiness basis;
- one common ABG projection owns effectful outer invocation identity for exactly
  install, bind, run, respond, and continue, including typed prior coordinates,
  invalid-history refusal, and cross-kind collision refusal;
- admitted respond/continue retries are checked through that owner projection
  before continuation lifecycle status; and
- the deleted `product/root_operation_state.ts`, its exports, Public context
  map, Product invocation brands, resolved-lock brand, and source-result brand
  do not remain as setup or invocation authority.

The increment adds no Product operation, event kind, runtime, catalog, store,
controller, Public-authored meaning, donor path, compatibility path, or W2
replacement. Exact current coordination pointers in `GOALS.md`, T-287, and the
sole restart bootstrap now select this successor increment; the completed TV5
boundary is historical only.

Proportional verification is green:

- production TypeScript build: exit 0;
- focused installed setup/invocation authority proof: 1/1;
- event-store reopen proof: 13/13;
- admitted external continuation retry target: 1/1;
- full installed portability: 18/18 in 354,847.729583 ms;
- serialized R1-R5: 9/9 in 75,502.2465 ms;
- Product-declared public next/asset target child: 1/1 in 227,179.973042 ms;
- Product-declared graph-span re-entry child: 1/1 in 101,479.04075 ms;
- governed correction child: 8/8 in 237,887.902375 ms;
- fresh serialized conservation: 62/62 in 1,184,240.879875 ms; and
- `git diff --check`: clean.

The proof-only conservation repair moved the exact two-Product and dependency-
edge oracle from a removed enriched binding outcome to the complete Product
resolve result, checked the admitted binding's lock ID and digest against that
exact lock, and raised only the fixed installed-witness timeout from 180,000 to
360,000 ms. The unwrapped correction child had already proved 8/8 and clean
teardown in 237,962.671875 ms; no production repair followed.

The prescribed candidate-basis owner was run after conservation's deterministic
build and reproduced:

- artifact
  `sha256:24ba5c4ffefec15c5d22cb981cf1275f89b91351f92fac0214310ce6cf0868c8`;
- Product content
  `sha256:70f0677647af2b4c11a611f34933025a3de19d02b95f17e827bf0645f53011e4`;
- manifest
  `sha256:44a46154607631d09fef5208982b72e601877f8c0f1a476057665a52bc17c8da`;
  and
- candidate-basis file content SHA-256
  `7a84da1965f94f4031330b5f2843e3d51400fde684936de776fa22cdca8880eb`.

The forbidden executable-path census is exact:

- zero `RootOperationState`, `rootOperationStates`, or
  `root_operation_state` references in production source, deterministic build,
  or the generated Product manifest;
- zero removed `sourceResultBases`, `resolvedProductLocks`, or Product
  policy/grant/authority/invocation WeakSet brand names in Product, Public, and
  ABG source;
- zero `legacyRequest` or `indexedRequest ?? legacyRequest` references in
  production source or deterministic build; and
- zero `RootPublicInvocation` or `ROOT_PUBLIC_OPERATION_DEFINITIONS` references
  outside the owning Public module family.

One falsifier retains a quoted pre-repair baseline signature naming
`RootOperationState`; it is not executable authority. Two persisted R10 proof
artifacts retain 210 declaration-path strings from an earlier packed snapshot.
They are disclosed historical proof content, not current production/build
reachability, and were not refreshed or claimed by this proportional increment.

No process from the build, focused proofs, conservation, or candidate refresh
remains. Nothing was staged or committed. The worker stops here without
accepting A5-F10, Wave 1, or this candidate.

Assessor Disposition:

## Entry 210A - Frozen Review Pointer Corrected

Timestamp: 2026-08-09T03:41:55+1000

```text
fixed 5.0 features: A5-F01..A5-F11 and A5-F13..A5-F17
active wave: W1 = A5-F10, A5-F02, A5-F03, A5-F04
selected slice: A5-F10 / graph_catalog_contraction_and_runtime_recovery
frozen increment: setup_invocation_authority_reconstruction
next action: exact cold review -> F_H adjudication
```

Transition: pointer-only correction after Entry210. The sole restart bootstrap
now states that the Entry210 implementation candidate is frozen, the Max worker
is stopped, no implementation or semantic edit is authorized, and the next act
is exact cold review followed by F_H adjudication. The accepted increment
description and later serialized Wave qualification sequence remain present.
No production, GOALS, T-287, design, test, candidate-basis, or existing Entry210
text changed.

The corrected bootstrap content SHA-256 is
`508b5959bc41af6e27f0fd7fab2910c1eae9f0db2a3087ab17fb9fb0bb155cff`.
HEAD remains `dd935a1cd14a85c0a4871281def8af5e4d074019`; the worktree remains 107
tracked modifications plus 25 untracked paths. `git status --short` remains
10,834 bytes with SHA-256
`db7b2bef6d0bf26e86d48724744e0a4aa533787da914b40210586ac5c4d06d46`.

The same C-sorted `path NUL status NUL content NUL` candidate subject remains
107 tracked delta paths plus seven untracked tenant paths, excluding all 18
untracked commentary paths. Its 114 paths, including one `D` deletion, encode
to 9,806,312 bytes with SHA-256
`d00af7215b7804bcf683bc21c975fe0d9a919a81de6906a6fdd80df00716396c`.
The append predecessor assurance-log content SHA-256 is
`26fbd55c7cf40063ef6e6a0cc84c7bf08c24e78456e0211f587e3ddf47277589`;
the post-append log hash is supplied separately because the log excludes itself
from the frozen candidate subject.

`git diff --check` is clean, the index is unchanged, and no build, proof,
conservation, or candidate-refresh process remains. Nothing was staged or
committed. No semantic proof was rerun for this pointer-only correction.

Assessor Disposition:

## Entry 210A - F_H Adjudication: Rejected, One Bounded Repair

Timestamp: 2026-08-09T04:06:43+1000

The frozen subject remained exact through review:

- HEAD `dd935a1cd14a85c0a4871281def8af5e4d074019`;
- 114-path candidate composite, 9,806,312 bytes, SHA-256
  `d00af7215b7804bcf683bc21c975fe0d9a919a81de6906a6fdd80df00716396c`;
- status SHA-256
  `db7b2bef6d0bf26e86d48724744e0a4aa533787da914b40210586ac5c4d06d46`;
- clean `git diff --check`; and
- unchanged index.

The cold Max review returned `FAIL`. F_H independently inspected the authority,
live code, and executable relations. Entry210A is rejected for three blocking
counterexamples.

1. **High - supplied GTL meaning is not bound to verified publication truth.**
   Product catalog readiness selects the contribution-manifest publication
   binding by `moduleRef` but does not compare its `publicationDigest` with the
   supplied publication before constructing the catalog. A structurally valid
   publication with changed semantic content can therefore become catalog and
   invocation meaning while verified Product truth attests another digest.

2. **Critical - the common effectful-invocation projector authors incomplete
   continuation meaning.** The response/continue branch accepts a partial
   Public/owner event pair without reconstructing the owning continuation
   lifecycle predecessor and conserved runtime coordinates. F_H and the cold
   reviewer independently confirmed that malformed history can project as a
   duplicate instead of `invalid_history`.

3. **Critical - the exported ABG workspace-binding owner port admits an
   unvalidated carrier.** `admitWorkspaceBinding` checks only candidate scope
   identity, despite importing the existing Product validator. F_H confirmed
   that a two-field fabricated candidate can append a durable binding event and
   return an admitted `workspace_binding`. Public currently constructs a valid
   candidate, but Public cannot substitute for the concrete owner's semantic
   admission boundary.

The confirmed deletion of `RootOperationState`, legacy fallback, and removed
brands remains valid work. It does not cure these active authority violations.
No Product, requirement, feature-wave, or authority reprice is required.

One realization-local repair is authorized:

- bind every supplied publication to the verified contribution-manifest
  publication digest before catalog construction or reconstruction;
- compose response and continue invocation truth from complete owner-local ABG
  lifecycle validation. The common effectful-invocation relation may union,
  collision-check, and query exact owner-issued facts; it may not reimplement
  continuation semantics. Any malformed effectful pair makes the exact prefix
  `invalid_history`, including queries for another invocation identity; and
- make the ABG workspace-binding admission owner reconstruct its exact causal
  lock and Product-set basis and apply the existing Product candidate
  validation before append. Refusal appends no event.

Decision-exact proof must cover changed publication meaning under retained
outer identities, malformed response and resume pairs, invalid-prefix masking
against another invocation reference, and direct fabricated workspace-binding
admission with zero append. Existing valid response, resume, bind, and
fresh-process relations must remain green.

The worker selects local names, carriers, module placement, and signatures
inside those existing owner frames. The repair may add no Product operation,
event kind, catalog lifecycle, runtime, store, controller, Public-authored
meaning, compatibility path, donor adoption, ticket hierarchy, or broader Wave
1 redesign. Do not perform full M5 or final Wave qualification in this repair
window. Run proportional focused checks and conservation, freeze exactly once,
and stop for a fresh cold review.

The frame method has worked as a diagnostic and scope constraint: all three
defects are relations crossing the topology between GTL source, Product
readiness, ABG owner admission, and common projection. It has not yet earned a
delivery claim; that requires the bounded repair to pass cold review and the
subsequent serialized A5-F10 qualification.

Assessor Disposition:

## Entry 211 - Setup And Invocation Authority Reconstruction Repair Frozen

Timestamp: 2026-08-09T05:46:43+1000

```text
fixed 5.0 features: A5-F01..A5-F11 and A5-F13..A5-F17
active wave: W1 = A5-F10, A5-F02, A5-F03, A5-F04
selected slice: A5-F10 / graph_catalog_contraction_and_runtime_recovery
frozen increment: setup_invocation_authority_reconstruction
next action: exact cold review -> F_H adjudication
```

Transition: bounded realization-local repair after the Entry210A F_H rejection
and its two subsequent owner-boundary holds. No requirement, Product, feature,
wave, or authority reprice was taken. No full M5 or final Wave qualification
was run.

The repaired realization now enforces these exact owner relations:

- catalog readiness rejects a supplied publication whose semantic digest does
  not equal the verified contribution-manifest publication binding, including
  changed meaning under retained outer identities;
- the continuation owner reconstructs complete response and resume lifecycle
  facts, event identity, causal predecessor, time, correlation, and conserved
  runtime coordinates. The common effectful-invocation projector only unions,
  collision-checks, and queries owner-issued facts; a malformed pair invalidates
  the whole queried prefix, including a query for another invocation;
- `admitWorkspaceBinding` reconstructs the exact causal validated installs,
  lock, and ordered ProductSet before applying Product candidate validation.
  A fabricated direct candidate refuses with zero append;
- the artifact owner fold validates common operation-definition and invocation
  identity plus exact event correlation, causation, and envelope. Install
  requires the exact Product candidate and lock with zero causes; binding uses
  only earlier validated, uniquely caused installs from the same exact lock and
  reconstructs ProductSet order from the causes and lock rows. Any forged
  artifact owner row invalidates the whole prefix; and
- the run owner is the sole exact projector for run admission. It reconstructs
  every owner/Public pair, validates their refs, basis, cause, workspace,
  workflow, scope, time, correlation, definition, authority, grants, catalog,
  policy, binding, program, graph function, fibre, plan, and selected definition,
  and enforces a bijection across the prefix. Empty, malformed, or orphaned
  outer references invalidate the relation before the common projector unions
  or collision-checks it.

No Product operation, event kind, runtime, catalog lifecycle, store,
controller, Public-authored meaning, donor path, compatibility path, ticket
hierarchy, or wider Wave 1 redesign was added.

Proportional verification is green on the final semantic candidate:

- production TypeScript build: exit 0;
- complete installed setup/invocation authority proof: 1/1 in
  109,990.199833 ms;
- event-store reopen proof, including forged artifact rows and exact run-owner
  reconstruction/collision falsifiers: 13/13 in 16,272.9035 ms;
- R3 workspace-binding owner proof: 1/1 in 15,890.106125 ms;
- R5 setup/invocation reconstruction proof: 1/1 in 16,414.131541 ms;
- admitted external mixed-continuation proof: 1/1 in 37,417.377958 ms;
- low-level nested F_H proof: 1/1 in 17,859.299583 ms; and
- one fresh serialized conservation run: 62/62, with zero fail, cancel, skip,
  or todo, in 1,207,524.035792 ms.

Earlier interrupted conservation attempts are not evidence. One accidentally
broad external-continuation run was terminated after three unrelated passes and
is also excluded. The listed serialized conservation run is the sole final
conservation evidence.

The prescribed candidate-basis refresh ran after final conservation and then
reproduced identically on a second run:

- artifact
  `sha256:671693e15d4148159cce52969b247758c500c69920174f15c1ace68e15b1fb8e`;
- Product content
  `sha256:e94ac2fa66cea3c52fa207488fc53c8cf01ba8998c5860b03270cc6125a99147`;
- manifest
  `sha256:9c0dbb10d68e6f02cb30eb6d3ee27070f66a3887fc1de736e6a8bb66578481a2`;
  and
- candidate-basis file content SHA-256
  `6533ba0cea9c99e5cbd016d53e7f891ef91e8a03ee3ac3fffed4dcec828e850a`.

The frozen candidate remains at HEAD
`dd935a1cd14a85c0a4871281def8af5e4d074019` on
`codex/t287-wave1`, with 107 tracked modifications and 26 untracked paths.
`git status --short` is 10,917 bytes with SHA-256
`ab9e28e75f3298f44142895b45894d2a6d08807b97b8883622483a7c63f81f86`.

The canonical implementation subject contains all 107 tracked delta paths and
all eight untracked tenant paths. It excludes all 18 untracked commentary
paths, including this append-only assurance log. The 115 paths are C-sorted and
each is encoded as `path NUL status NUL content NUL`; status is `F` for a
present file and `D` with empty content for the one deleted tracked path. The
9,839,117-byte composite reproduced twice with SHA-256
`2b4ff6bb5247248e932440541515b702de8f351f505d7757a7dfa25faa509632`.

The forbidden executable-path census is exact:

- zero `RootOperationState`, `rootOperationStates`, or
  `root_operation_state` references in production source, deterministic build,
  or the generated Product manifest;
- zero removed `sourceResultBases`, `resolvedProductLocks`, or Product
  policy/grant/authority/invocation WeakSet declarations in Product, Public,
  and ABG source or deterministic build;
- zero `legacyRequest` or `indexedRequest ?? legacyRequest` references in
  production source or deterministic build;
- zero removed common partial-parser names `exactContinuationPair`,
  `exactRunAdmissionBody`, or `exactRunPair` in production source or
  deterministic build; and
- all `RootPublicInvocation` and `ROOT_PUBLIC_OPERATION_DEFINITIONS`
  production/build declaration locations remain inside the owning Public
  module family. The generated manifest contains packed derived text naming
  those Public declarations, not a second executable owner.

`git diff --check` is clean and the index is unchanged. The append predecessor
assurance-log content SHA-256 is
`6287971ff8342db57bbff81e81fa13c48ce161722e66654ae147ce11d44a44b2`;
the post-append log hash is supplied separately because the log excludes itself
from the frozen candidate subject.

Nothing was staged or committed. The worker stops at this frozen repair and
does not accept A5-F10, Wave 1, or the candidate.

Assessor Disposition:

### Entry 211 F_H Adjudication - Rejected

Timestamp: 2026-08-09T06:09:25+1000

The cold reviewer preserved the exact Entry211 subject and returned `FAIL`.
Freeze-before and freeze-after are identical at HEAD `dd935a1c`, status SHA-256
`ab9e28e75f3298f44142895b45894d2a6d08807b97b8883622483a7c63f81f86`,
and implementation-subject SHA-256
`2b4ff6bb5247248e932440541515b702de8f351f505d7757a7dfa25faa509632`.
No reviewer edit, generation, package refresh, staging, or commit occurred.

F_H independently sustains all three blocking findings.

1. **F_H successor replay is not admission-equivalent.** Live preparation
   derives the exact successor input, validates the full successor cursor, and
   proves `H -> S` successorhood. The durable resume event retains only the
   cursor ref/digest, and `projectFhContinuations` checks only stored strings
   and self-digested input. It cannot reconstruct the live successor relation.
   A restamped owner event can therefore publish resolved continuation and
   admitted `run.continue` truth that the live owner would refuse. This violates
   FS-02, FS-09, FS-12, FS-13, and the selected F_H `H -> S` owner instance.

2. **Workspace-binding candidacy does not conserve its authority witness.**
   F_H dynamically supplied a complete, internally re-digested binding
   candidate whose `authorityBasisId` differed from the lawful Product
   constructor relation while its authentic ProductSet, lock, roots, actor,
   and authority digest were retained. `isWorkspaceBindingCandidate` returned
   `true`; `admitWorkspaceBinding` appended a third event and returned
   `artifact_owner_result/admitted`. The admitted event retained the forged
   authority ID. The existing two-field R3 mutation is masked by an earlier
   shape refusal and does not test this relation. A workspace-binding owner
   must consume and conserve the exact existing `WorkspaceAuthorityBasis`
   witness, not accept independently caller-minted coordinates.

3. **Artifact refusal can poison durable truth.** F_H dynamically supplied a
   valid Product-install candidate and lock with
   `invocationPayloadDigest: "x"`, then recomputed `invocationDigest` over that
   malformed coordinate. The owner returned
   `artifact_owner_coordinate_refusal` with `successorPrefix: null`, but the
   store changed from zero to one event and durably retained the malformed
   `public_operation_artifact_admitted` row. Exact-prefix projection then
   returned `event_envelope_invalid`. Product install and workspace binding
   share this append-then-project relation. This directly violates FS-14.
   The shared basis validator also reaches run and continuation owners, so it
   must reject a malformed supplied basis rather than let a downstream owner
   discard or reinterpret it.

Entry211 is rejected only. A5-F10 and Wave 1 remain unaccepted. The green build,
focused tests, and 62/62 conservation evidence do not cover these mutations.

The frame method is sustained. It localized the failures to three owner
instances and prevented common projection, caller coordinates, or the event
store from acquiring missing domain authority. No Product, requirement,
Public-family, catalog, runtime, topology, or method reprice is required.

### Authorized Entry 212 Correction Cut

One consolidated realization-local correction is authorized under the same
`setup_invocation_authority_reconstruction` increment:

- Make F_H resume admission and fresh-process projection evaluate the same
  exact owner relation. Durable truth must retain or reconstruct every existing
  typed witness required to prove the exact derived successor input, complete
  successor cursor, held-to-successor relation, conserved runtime coordinates,
  and exact prefix basis. Restamping any one of those relations must invalidate
  the whole prefix, including a query for another invocation identity.
- Make workspace binding consume and conserve the existing exact
  `WorkspaceAuthorityBasis` relation together with the reconstructed causal
  ProductSet and lock. A complete re-digested candidate with an invented,
  mismatched, or non-reconstructable authority coordinate must refuse before
  append, and replay must reject an equivalent forged historical row. Reuse the
  existing Product carrier and constructor law; add no authority type or store.
- Make `PublicOperationAdmissionBasis` validation decision-complete for every
  current owner consumer. For artifact owners, all semantic validation and
  exact successor projection must succeed before durable commit, or occur
  inside one rollback-safe ABG semantic commit unit. Every returned refusal
  must leave the in-memory store, durable bytes, held coordinate, and
  fresh-process predecessor projection exactly unchanged.

The worker owns local function names, carrier placement, and the smallest
typed composition. It may extract or reuse owner-local pure predicates so live
admission and replay share one relation. It may not add a Public operation,
event kind, authority, store, registry, runtime, controller, callback-selected
semantics, compatibility path, donor adoption, ticket/design amendment, or
general framework.

Decision-exact proof must include:

- a restamped F_H resume successor-input/cursor relation and unrelated-query
  whole-prefix masking, plus unchanged valid live and fresh-process resume;
- a complete re-digested workspace binding with an impossible authority
  witness, proving direct zero append and forged-history replay refusal;
- malformed and empty Public basis identities/digests for install and bind,
  plus the shared run/continuation validator consumers, proving exact refusal;
- before/after event count, durable byte length/digest, held coordinate, close,
  and fresh-process reopen equality for every pre-effect refusal; and
- the existing catalog semantic-binding, artifact/run/continuation owner,
  setup/invocation, R3, R5, external continuation, and conservation relations
  remaining green.

Run proportional focused checks, production build, and one fresh serialized
conservation pass. Do not run full M5 or final Wave qualification. Freeze one
exact Entry212 subject, append its identity and evidence here, and stop for a
new cold-start Max review. If the repair requires a new authority or a choice
between materially different Product structures, stop once and return the
alternatives; do not grow a repair framework.

## Entry 212 - Exact Owner Reconstruction And Basis Rehydration Correction Frozen

Timestamp: 2026-08-09T08:38:50+1000

```text
fixed 5.0 features: A5-F01..A5-F11 and A5-F13..A5-F17
active wave: W1 = A5-F10, A5-F02, A5-F03, A5-F04
selected slice: A5-F10 / graph_catalog_contraction_and_runtime_recovery
frozen increment: setup_invocation_authority_reconstruction
next action: exact cold review -> F_H adjudication
```

Transition: consolidated realization-local correction after the Entry211 F_H
rejection, followed by the bounded construction-resume rehydration repair held
by pre-freeze review. No requirement, Product, feature, wave, design, ticket,
or authority reprice was taken. No full M5 or final Wave qualification was run.

The Entry212 realization preserves one admission-equivalent owner relation
across live execution and replay:

- F_H resume admission and fresh-process projection reconstruct the exact
  successor input, complete successor cursor, held-to-successor relation,
  conserved runtime coordinates, and prefix basis. A malformed owner pair
  invalidates the queried prefix rather than being masked by another invocation;
- workspace binding consumes the existing exact WorkspaceAuthorityBasis with
  its causal ProductSet and lock. Invented or non-reconstructable authority
  coordinates refuse before append, and equivalent forged history does not
  project as owner truth;
- artifact admission validates the complete PublicOperationAdmissionBasis and
  successor projection before durable commit. A refusal preserves event count,
  durable bytes, held coordinate, close relation, and fresh-process predecessor
  truth; and
- the final construction-resume repair passes the reconstructed event-backed
  ExecutionBasis through the existing rehydration boundary in the continuation
  owner. Raw exact projection remains structurally exact but does not mint
  process-local admission identity. Rehydration accepts the exact admitted
  basis, while an internally consistent arbitrary object with a recomputed
  digest and ref remains non-authoritative.

The final bounded production delta is one existing-boundary import and one
owner-path call substitution in
`code/src/abg/fh_continuation_projection.ts`. Its focused regression remains
inside `test_env/tests/m5-installed-external-product.test.mjs`. No new store,
registry, authority path, Product operation, event kind, runtime, controller,
Public-authored meaning, compatibility path, or donor path entered that repair.

Proportional verification is green on the final semantic candidate:

- production TypeScript build: exit 0;
- exact durable-gap and external-Product re-entry lane: 7/7 in
  44,279.098083 ms;
- exact governed-corrections lane: 8/8 in 267,217.573334 ms, including all
  four positive dispositions and all three refusal mutations;
- direct nested F_H/Entry212 mutation lane: 1/1 in 22,505.446417 ms; and
- one replacement serialized conservation command: deterministic build green,
  C-algebra validation 21/21, and traversal census 62/62 with zero failures in
  1,278,451.432958 ms.

The first durable-gap attempt is not evidence. Its added replay assertion
incorrectly treated a two-run validated prefix as one run and met the existing
`run_stopped` contradiction. The corrected assertion selects the completed-run
prefix; the authorized replacement lane above is the final evidence. No
production repair followed that test-only scope correction.

After conservation, the prescribed candidate-basis owner ran exactly twice
sequentially from unchanged source. Both runs produced byte-identical 521-byte
candidate-basis content and identical identities:

- artifact
  `sha256:3594f955dee76763ab41e76ecd0e3010268bb2759c953fdad938aa2668ebbacf`;
- Product content
  `sha256:bbc85582c8deeeb10cf09436fd30325df8f2f3175c38c3f755e0747d0f0386d3`;
- manifest
  `sha256:7619d5e28607aba96c8c742369e4541d72fe1d2cb20e358cf11bd51e81b5811b`;
  and
- candidate-basis file content SHA-256
  `9790b97a7a717380c3c1c64a7daf57898d600f6b6e4f8894a69f55ec831b7df6`.

The frozen candidate remains at HEAD
`dd935a1cd14a85c0a4871281def8af5e4d074019` on
`codex/t287-wave1`, with 107 tracked modifications and 28 untracked paths.
`git status --short` is 11,081 bytes with SHA-256
`1aeec3b928330f7cc0501471eda53a6a93a0be552abfa3c457cd3b8d4ee532b4`.

The canonical implementation subject contains all 107 tracked delta paths and
all 10 untracked tenant paths. It excludes all 18 untracked commentary paths,
including this append-only assurance log. The 117 paths are C-sorted and each
is encoded as `path NUL status NUL content NUL`; status is `F` for a present
file and `D` with empty content for the one deleted tracked path. The
9,887,509-byte composite reproduced twice with SHA-256
`21bd732a1fe905540793501a368f9c477ecffa360b59281618b77f8f5a30181b`.

The forbidden executable-path census is exact:

- zero `RootOperationState`, `rootOperationStates`, or
  `root_operation_state` references in production source, deterministic build,
  or the generated Product manifest;
- zero removed `sourceResultBases`, `resolvedProductLocks`, or Product
  policy/grant/authority/invocation WeakSet declarations in Product, Public,
  and ABG source or deterministic build;
- zero `legacyRequest` or `indexedRequest ?? legacyRequest` references in
  production source or deterministic build;
- zero removed common partial-parser names `exactContinuationPair`,
  `exactRunAdmissionBody`, or `exactRunPair` in production source or
  deterministic build; and
- all 16 production/build files naming `RootPublicInvocation` or
  `ROOT_PUBLIC_OPERATION_DEFINITIONS` remain inside the owning Public module
  family, with zero outside-owner files. The generated manifest contains three
  packed derived-text mentions, not a second executable owner.

`git diff --check` is clean and the index is unchanged. The append predecessor
assurance-log content SHA-256 is
`4368fe4bab9054d0fca47f8c7c3e356167e0e310a2f2069716570ad53f788cf8`;
the post-append log hash is supplied separately because commentary is excluded
from the frozen implementation subject.

Nothing was staged or committed. The worker stops at this exact frozen repair
and does not accept A5-F10, Wave 1, or the candidate.

Assessor Disposition:

## Entry 213 - Installed Root R10 Proof And Governor Closure Frozen

Timestamp: 2026-08-09T10:36:09+1000

Transition: proof-only installed-root closure after Entry212 acceptance. The
bounded delta contains exactly three authored proof-support files and five
generated R10/Governor proofs. It changes no production, Product, requirement,
design, feature, wave, authority, event kind, runtime, store, catalog, or
compatibility surface.

The focused installed R10 command passed twice from the unchanged Entry212
candidate: each run was 1/1 green, returned the exact seven successful setup
and run outcomes, projected `Hello World`, retained exactly one `run_closed`,
and evaluated ABI5-ROOT-001 as `root_satisfied`. Run 1 produced five-proof
composite SHA-256
`a5da95b4f6952a224b833200359923d23f963022f4ad1b18c4bf4cb6ad8b4c90`.
Run 2 produced composite SHA-256
`fc4b54440899b6c5185416f760fe3095f04299ca70476a3c596995e4537adf82`
and is the retained proof subject.

Cross-execution byte identity was diagnostically inapplicable. A disposable
mirror packed byte-for-byte to accepted artifact
`sha256:3594f955dee76763ab41e76ecd0e3010268bb2759c953fdad938aa2668ebbacf`
and passed the same focused R10 once. The sole independent difference from the
retained run was the recreated event-store inode `398544386 -> 398548561`,
represented in the durable prefix coordinate and reopen authority; device
`16777230` and every other non-derived scalar were identical. Coordinate,
authority, invocation, event, outcome, Governor, and proof identities were
canonical derivatives. This is lawful exact-subject identity under the
accepted `DurablePrefixCoordinate` and `EventStoreReopenAuthority`; it is not
unordered projection, runtime semantic nondeterminism, or proof-only
noncanonical data. No coordinate was canonicalized, omitted, stabilized, or
weakened. The disposable mirror was removed.

The retained-proof Governor command then ran exactly once:

```text
node --test --test-concurrency=1 test_env/tests/root-governor.test.mjs
```

It passed 1/1 in 1,318.068917 ms, re-evaluated the exact retained durable proof
to Governor digest
`sha256:3e4e026b7aeb1328f4bf636e3899412a16ef9450541c66515c51f91f9f5f8bf0`,
kept R1-R10 true with no frontier or failures, and passed every embedded
negative mutation.

The retained run-2 proof identities are:

- Governor: 1,295 bytes,
  `02da6ce7fabfdd63b341c8813bcb58b1936e5c94426e150c5870d1d36f207269`;
- events: 492,541 bytes,
  `483454102ba6813acd24e80fb93af886f5ea402aadedb3555826ccc3d0c7c92a`;
- R10 summary: 3,015 bytes,
  `14529316efdf6bcbfed3b1c33cf4f3f6fcc3ad066a4c6c99a7bc7e7db76f6327`;
- outcomes: 1,883,187 bytes,
  `b01291e6550368656291a517c3b52a68912eaa21f753bcbfb86f5575cd37096b`;
- transcript: 8,830,531 bytes,
  `622dd96e072fcdb3147bc7d1e047dfe2e8a1e28f3a3c7811cd6551363f3cf561`.

All four Entry212 candidate identities remain exact: artifact
`sha256:3594f955dee76763ab41e76ecd0e3010268bb2759c953fdad938aa2668ebbacf`,
Product content
`sha256:bbc85582c8deeeb10cf09436fd30325df8f2f3175c38c3f755e0747d0f0386d3`,
manifest
`sha256:7619d5e28607aba96c8c742369e4541d72fe1d2cb20e358cf11bd51e81b5811b`,
and 521-byte candidate-basis content
`9790b97a7a717380c3c1c64a7daf57898d600f6b6e4f8894a69f55ec831b7df6`.

The authorized-path invariant excludes the three authored proof-support paths
and five generated proofs from the accepted implementation base. Its exact
C-sorted `path NUL status NUL content NUL` composite remains 112 paths,
4,091,497 bytes, SHA-256
`a1ac0d7b0d7cea660d48ecfd284c77b44b1a54cb5987b25249b38806a6d7b1f1`.
The frozen Entry213 implementation candidate includes the three authored paths
and excludes the five generated proofs: 115 paths, 4,135,580 bytes, SHA-256
`62833d618796c6ae949047b0cd35208767f03d75b5dd6578048cbb71d6cb400f`.
It remains at HEAD `dd935a1cd14a85c0a4871281def8af5e4d074019` on
`codex/t287-wave1`. `git status --short` is 11,324 bytes with SHA-256
`11ef8806cf35b68f8e5249ca76c3a474f81b4c0d3d409f215079b455bb7f0d90`.
`git diff --check` is clean. The append predecessor assurance-log SHA-256 is
`dad1237be4784239a0f365217f3ddb1e28c929aeec975dc7d0d7ed400e5809c9`.

No M4, M5, conservation, package qualification, candidate refresh, staging, or
commit followed the prescribed Governor check. The worker stops at this exact
Entry213 proof closure without accepting A5-F10, Wave 1, or the candidate.

Assessor Disposition:

## Entry 213 Authority Correction And Entry 214A F_H Adjudication

Timestamp: 2026-08-09T12:14:08+1000

Entry213 remains rejected. Its previously authorized Governor-side R2
"hardening" is superseded and may not be implemented. Live inspection confirms
that the installed-root harness constructs future Product, install, workspace,
catalog, and view carriers, executes verify through bind directly through
installed Public in the parent process, executes only the tail through
`abg.cli`, and concatenates the two outcome vectors. The Governor then
independently reconstructs Product lock/install meaning, ABG event identity and
causation, and the exact runtime spine. That is fixture-authored proof plus a
second Product/ABG interpreter, not the required source-blind installed CLI path
or a lawful structural assurance reduction.

The missing residual is narrower than a Public or authority redesign. Existing
owners already supply `EventStoreCloseHandoff`,
`projectRootOperationContextAuthority`, `reopenRootOperationContext`, complete
Product outcomes, ABG artifact-truth projections, replay, and Public outcome
projection. A later bounded realization refactor may expose and consume those
owner-issued carriers through CLI episode transport, remove parent Public
execution and stdout splicing, and contract Governor to owner projections plus
the R1-R10 reduction. It may add no Public operation, handoff carrier, runtime,
controller, dynamic request resolver, owner algorithm, or semantic Governor
rule. The current CLI operation-identity roster may not be extended as a
substitute for explicit transport steering.

Entry214A is independently accepted as the authored TV5 atomic stopped-retry
relation only. The frozen subject is:

- HEAD `dd935a1cd14a85c0a4871281def8af5e4d074019`;
- candidate: 115 paths, 4,125,757 bytes,
  `582a8443ad78cdf196e969843db8b7513c7182f0aaee7d4692c80c247367df92`;
- authorized five-file composite: 5 paths, 594,259 bytes,
  `9215404d2722493f8b874fe484ee5e85a0a192fe211b18db4ab1ed0b47dca0ff`;
- status snapshot: 11,324 bytes,
  `11ef8806cf35b68f8e5249ca76c3a474f81b4c0d3d409f215079b455bb7f0d90`.

The fresh cold-start Max reviewer reproduced those identities and returned
PASS with no Critical, High, Medium, Low, or advisory finding. F_H independently
sustains the PASS. One immutable entry snapshot now opens one existing ABG
transaction; CCall close, the complete predecessor-linked stopped suffix,
blocked route, and applicable `run_stopped` commit together. Any non-blocked
route result aborts the transaction, the Event Store removes its staged suffix,
and only a post-rollback diagnostic may be admitted. The installed ABG index
does not export the active staging callable or either split progress writer;
the standalone transition is retry-only and rolls a blocked disposition back;
and a valid historical stopped suffix cannot enter `admitRoute` outside the
active owner transaction. No controller, callback, second topology, new
catalog, Public meaning, compatibility path, or process-local authority entered
the cut.

This acceptance does not claim installed proof green. TypeScript build,
JavaScript syntax, and `git diff --check` passed, but the focused installed M5
and retained R6 bodies stopped at the intentionally stale Entry213 artifact's
`artifact_digest_mismatch`. No intermediate package, candidate basis, or proof
refresh was authorized. Installed stopped-route execution, PID-2 equality,
late-split zero append, success regression, M5, and Wave qualification remain
pending the one final authored-closure refresh and serialized qualification.

Assessor Disposition:
