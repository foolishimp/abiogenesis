# Consensus Assurance Through Independent Reasoning-Depth Review

Status: open methodology commentary. This post records a reusable assurance
model and its first ABIogenesis application. It is not Product, requirement,
design, ticket, STDO, implementation, or acceptance authority.

Recorded: `2026-08-04T02:30:36Z`

## Governing Claim

Consensus assurance is the preservation and adjudication of independent
judgments over one exact candidate and one exact governing basis.

It is not majority voting. It is not reviewer negotiation. It is not one
reviewer revising another review. Agreement is evidence, not acceptance.
Disagreement is also evidence.

The relation is:

```text
one exact candidate
  + one exact governing basis
  + one identical review contract
  -> independent judgment A
  + independent judgment B
  -> preserved evidence sets
  -> F_H adjudication against live code and authority
  -> accept | local_repair | re_enter | reject
```

## Why This Exists

One reviewer can be independent from the worker and still miss a defect. A
cold context removes construction attachment, but does not guarantee complete
search, correct scope, or identical sensitivity to reasoning depth.

The failure modes are distinct:

- construction bias: the reviewer inherits the worker's framing;
- scope bias: the review contract names only previously known defects;
- depth sensitivity: a valid counterexample requires a longer causal walk;
- lens sensitivity: one reviewer follows the diff while another follows the
  entity lifecycle or authority seam;
- proof capture: green tests repeat the same invalid oracle;
- consensus collapse: reviewers see each other's results and converge without
  independent evidence.

Independent judgments make these differences observable.

## Required Subject Identity

Both reviewers receive the same immutable review subject:

- base commit and tree;
- complete tracked patch identity;
- exact intended untracked files and their identity;
- built artifact, Product-content, and manifest identities when applicable;
- governing Product, requirements, accepted design, and selected method;
- exact ticket/work-wave authority;
- identical named falsification and reporting contract.

If either reviewer observes a different subject, the judgments are not one
Consensus set.

## Separation Of Duties

| Role | May do | Must not do |
|---|---|---|
| Worker | interpret outcomes, implement, test, freeze one candidate | review or accept its own candidate |
| Reviewer A | read authority/code, falsify, freeze judgment | edit, commit, reset, direct worker, consume Reviewer B |
| Reviewer B | read authority/code, falsify, freeze judgment | edit, commit, reset, direct worker, consume Reviewer A |
| F_H proxy | preserve evidence, reproduce findings, adjudicate, accept or return outcomes | implement the repair or substitute reviewer agreement for evidence |
| Product authority | change Product, requirement, or governing design meaning | silently widen a local repair |

The worker receives adjudicated outcomes only after both reviews freeze.

## Required Role Assignment

The role definitions above do not assign a live session to a role. Every
Consensus instantiation must durably bind the participating actor or canonical
session identity before work begins.

An unassigned session has no authority merely because it can read this post.
Reading the method does not make a session the worker, reviewer, F_H proxy,
Product authority, status reporter, or log maintainer.

Each run records:

```text
Product authority:
F_H proxy and executive adjudicator:
implementation worker:
Consensus Reviewer A:
Consensus Reviewer B:
status reporter:
append-log maintainer:
checkpoint administrator:
```

One actor may hold status reporting, append-log maintenance, and checkpoint
administration together with F_H adjudication because those actions do not
construct candidate semantics. The same actor must not also implement the
candidate.

The implementation worker may interpret adjudicated outcomes, produce the
design/coding plan when assigned, edit code and tests, run proof, freeze one
candidate, and report. It may not review or accept its own candidate.

Each Consensus reviewer may read, falsify, and freeze one judgment. It may not
edit, repair, commit, accept, direct the worker, maintain the progression log,
or consume another review before both freeze.

The F_H proxy may bootstrap actors, define identical review contracts, preserve
separation, reproduce and adjudicate findings, return outcome-level findings to
the worker, accept or reject an exact frozen subject, administer an accepted
checkpoint, report status, and maintain the evidence log. It may not implement
or repair candidate semantics.

The Product authority alone reprices Product, requirements, governing design
scope, or the F_H delegation. The F_H proxy may authorize already-selected
bounded work and the smallest re-entry already permitted by that delegation;
it cannot silently widen it.

If a session resumes after interruption or context loss, it must recover its
assignment from the current instantiation record. If no exact assignment is
present, it remains read-only and requests or obtains assignment before acting.

## Blindness Rule

Before both judgments freeze:

- neither reviewer receives the other's prompt transcript, findings, status,
  or conclusion;
- neither reviewer receives commentary as authority;
- neither reviewer messages the worker;
- the worker does not anticipate or consume either review;
- F_H does not steer one reviewer using the other's discoveries.

After both freeze, their full evidence sets are retained without rewriting
them into one synthetic review.

## Identical Review Contract

The contract is identical except for reviewer identity and configured reasoning
effort. It requires:

1. bootstrap from live constitutional and accepted design authority;
2. verify the exact candidate identity;
3. inspect the complete affected production and proof surface;
4. review function -> module -> global constraint network;
5. enumerate affected entity lifecycles, admissions, projections, consumers,
   consumption/supersession, and competing paths;
6. mutate empty values, duplicates, interleaving, cross-scope substitution,
   effects-before-refusal, terminal reuse, consumed reuse, restart, raw event
   order, caller-carried state, nominal brands, and static/dynamic law parity;
7. distinguish historical admission from current transformation authority;
8. state concrete findings with executable counterexamples and exact paths;
9. state inspected and unverified scope;
10. freeze `accept | local_repair | re_enter | reject` plus checkpoint safety.

Green tests cannot substitute for this review. Reviewers must inspect whether
the tests make the governing claim falsifiable.

## Reasoning-Depth Experiment

The current controlled comparison uses the same model family with different
reasoning effort:

```text
Reviewer A: gpt-5.6-sol, Max
Reviewer B: gpt-5.6-sol, XHigh
```

The worker remains at its preselected effort through candidate freeze. Effort
is not changed mid-candidate.

The experiment measures:

- elapsed review time;
- overlapping valid findings;
- valid findings unique to Max;
- valid findings unique to XHigh;
- false positives by reviewer;
- severity accuracy;
- causal depth of each counterexample;
- downstream repair avoided;
- checkpoint disposition agreement.

## F_H Adjudication

F_H evaluates every finding independently against live code and governing
authority.

Each finding receives:

- `confirmed` — executable or structurally decisive;
- `qualified` — real defect, but the stated counterexample, severity, or repair
  is partly wrong;
- `not_reproduced` — evidence does not establish the claim;
- `tracking_only` — authority/evidence record defect without the alleged code
  semantics;
- `out_of_scope_gap` — real but not caused by or required for this candidate;
- `duplicate` — same causal defect already carried by another finding.

Reviewer agreement does not bypass adjudication. Reviewer disagreement does
not force rejection. The governing relation and executable evidence decide.

## Decision Rule For Reasoning Effort

Evaluate at least two or three comparable frozen candidates before changing
the default.

- If Max repeatedly finds valid High/Critical defects missed by XHigh, retain
  Max for assurance.
- If their valid findings are materially equivalent, use XHigh for routine
  review and retain Max for feature, wave, release, or constitutional gates.
- If XHigh is faster but misses bounded lower-severity issues, use XHigh as an
  early review and Max at final acceptance boundaries.
- If unique findings arise from both, reasoning effort is not the dominant
  variable; retain plural lenses or refine the review contract.

Do not decide from one candidate merely because one reviewer finishes first.

## Current Operating Decision

After the first Consensus sample:

- the next construction worker starts clean at XHigh reasoning;
- the worker freezes one candidate before assurance begins;
- one blind Max reviewer and one blind XHigh reviewer remain in parallel;
- F_H adjudicates both evidence sets;
- no reviewer result is supplied to the other reviewer or to the worker before
  both judgments freeze.

Reason: XHigh found the major checkpoint blockers about `38.8%` faster, while
Max still added valid causal decomposition. XHigh also found one explicit
static/dynamic parity counterexample not isolated by Max. The first sample
therefore supports an XHigh worker speed trial but does not yet justify removing
Max assurance.

Review-effort selection will be reconsidered after at least two or three
comparable candidates:

- if XHigh consistently matches Max on valid High/Critical findings, remove Max
  from routine slice review and retain it for feature, wave, release, or
  constitutional boundaries;
- if Max repeatedly contributes valid High/Critical findings missed by XHigh,
  retain both for high-risk runtime-authority work;
- if both contribute unique valid findings, preserve plural reviewers or refine
  the identical contract before attributing the difference to effort alone.

## First ABIogenesis Instantiation

The first recorded subject is the T-287 Wave 1 H1/H2 corrective candidate:

```text
base HEAD: a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99
artifact: sha256:e66199168c33c29f3a4fcbfdcbb278924d22919ebe92762279f6e8b1e580cc3b
product content: sha256:55b7aba184379a299e9ea55c5248155d37d207e464eb1ede7a6a196f563b3a7f
manifest: sha256:947b504d2cbd9fc5af7b47336eebad176e3dd4494ed78f05ecdf986def2e4078
intended binary patch: sha256:abac6114b6bbf36879dc7b917437a79dc98f4331f789246f47118a6506bfe9c1
```

Worker qualification before review:

- Event Calculus `12/12`;
- installed recursion `3/3`;
- conservation `62/62`;
- R1-R10 `13/13`;
- full M5 `193/193`;
- governor `root_satisfied`;
- `git diff --check` clean.

The Max and XHigh judgments remain separate evidence. Their results and F_H
adjudication belong in the Wave 1 append log and may be referenced from future
Consensus evaluations.

### Active ABIogenesis Role Binding

```text
Product authority: Jim
F_H proxy and executive adjudicator: /root
status reporter: /root
append-log maintainer: /root
checkpoint administrator after acceptance: /root

current implementation worker:
  /root/wave1_terminal_barrier_xhigh

completed first-sample Consensus Reviewer A:
  /root/consensus_max_review

completed first-sample Consensus Reviewer B:
  /root/consensus_xhigh_review
```

`/root` must not implement or repair candidate semantics. It reviews and
adjudicates the independent evidence, sends accepted outcome-level findings to
the separate worker, reports status, maintains the append log, and may
checkpoint only an accepted exact candidate.

`/root/wave1_terminal_barrier_xhigh` is the current construction worker. It may
produce the assigned bounded design/coding plan and, after F_H acceptance of
that boundary, implement and freeze the candidate. It may not accept itself.

New Consensus reviewers have no standing authority until `/root` creates and
records their exact canonical identities for the next frozen subject.

## Record Shape For Each Consensus Run

```text
candidate identity:
governing basis:
review contract identity:
Reviewer A model/effort/start/end:
Reviewer B model/effort/start/end:
overlapping findings:
A-only findings:
B-only findings:
F_H adjudication per finding:
accepted disposition:
repair avoided or incurred:
reasoning-effort conclusion:
```

## Active Blocking And Advisory Configuration

The active delivery configuration from 2026-08-04 is:

```text
construction worker: XHigh
blocking independent reviewer: XHigh
parallel depth reviewer: Max, advisory and non-blocking
adjudicator: F_H proxy at /root
```

The blocking XHigh review decides whether the candidate may advance to the
next bounded transition. The Max review starts blind on the same frozen subject
and may finish later. Routine progression does not wait for Max after a clean
XHigh disposition.

A later Max finding is not ignored. The F_H proxy compares it with the XHigh
review and current candidate state. A valid material finding stops advancement
at the next safe boundary and is returned to the worker. Lower-severity or
already-covered findings enter the evidence record without reopening accepted
work. Max never edits, repairs, directs the worker, or accepts the candidate.

This configuration tests whether XHigh supplies sufficient blocking assurance
at lower latency while retaining Max as an independent detector of additional
depth. Findings and elapsed time remain recorded per frozen candidate.

## Independent Delivery Teams

ABIogenesis delivery may run as multiple independent teams when the shared
authority contract is frozen and their edit surfaces can be made disjoint.
Parallel work is organized around owner seams, not around arbitrary file or
ticket subdivision.

```text
Product authority: Jim
F_H execution and integration authority: /root

runtime team:
  Run, CCall, continuation, retry, route, foldback, result, and closure truth

catalog and artifact team:
  catalog and artifact event, Event Calculus, replay, and typed projection

fresh-process proof team:
  durable carriers, serialization, second-process workers, equality oracles,
  and interleaving controls

blocking assurance:
  one blind XHigh reviewer for each frozen candidate

additional assurance:
  one blind Max reviewer when capacity permits; advisory and non-blocking
```

Team rules:

- one shared ABG event and Event Calculus authority substrate;
- one explicit file and callable ownership manifest before concurrent edits;
- no overlapping semantic implementation without F_H reassignment;
- cross-team dependencies are frozen typed contracts, not copied helpers or
  process-local coordination;
- each team freezes an exact candidate and reports identity, changed relations,
  proof, and unresolved dependencies;
- XHigh review is the blocking assurance gate;
- F_H alone adjudicates cross-team findings and selects the atomic integration
  cut;
- Max findings may stop the next safe boundary only when they identify a valid
  material global defect;
- installed integration and acceptance remain one exact candidate even when
  construction ran in parallel.

Later-wave contract work may start before its acceptance wave opens when the
Product interface is already stable. It may prepare consumers, migration,
falsifiers, and source-independence, but it cannot invent missing upstream
runtime behavior or claim the upstream wave closed.

### Restart Contract

A replacement F_H session restores execution by reading, in order:

1. live `specification/GOALS.md` and active T-287;
2. the accepted checkpoint and current worktree status;
3. this method post for role, blocking, advisory, and team rules;
4. the progression log for the latest exact frozen subjects and dispositions;
5. live agent state, treating an agent summary as status rather than authority.

The replacement session reconstructs a table containing each team, exact
subject, state, owned files or callables, dependencies, reviewer, and next
transition before restarting work. It does not infer acceptance from a commit,
test result, commentary claim, or agent completion state.

## Boundary

This post describes local assurance practice. It does not amend STDO or the
ABIogenesis Product. Reusable federal law, if warranted by repeated evidence,
must be proposed and ratified in `specification_methodology`. Until then this
post is an enduring reference for the ABIogenesis F_H proxy review model.
