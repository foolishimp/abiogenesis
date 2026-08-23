# STRATEGY: Consensus Reviewer Identity And Historical Sessions

**Author**: Codex
**Date**: 2026-07-26T04:28:49Z
**Addresses**: T-110, T-111, T-275, `REQ-P-CONSENSUS-006`,
`REQ-P-CONSENSUS-016`, and M05 Section 13
**Status**: Open
**Authority**: Commentary only; this post does not alter ABIogenesis 5.0,
reactivate T-110, or authorize implementation

## Summary

The selected ABIogenesis 5.0 S05 contract requires attributed heterogeneous
review through cold worker starts. The current repair is intended to prove
that boundary. Cold starts are sufficient session semantics for S05 and remain
the correct default for independent exact-cut review.

T-110 already describes sticky execution over the traced agent call-out
substrate. Its current target is warm reuse within a traversal, initially for a
same-edge retry. That target reduces latency, token cost, and repeated context
discovery. It does not yet define a reviewer whose admitted history and
experience persist across separate reviews.

Historical reviewer identity would add a separate future semantic relation:

```text
reviewer profile
  + actor attribution
  + worker binding
  + declared historical-context basis
  + session lineage
  + replay-derived participation history
  -> one attributed review result over one exact subject
```

The governing separation is:

> Reviewer profile, actor, worker, transport, session, context, experience, and
> review result are distinct identities. Session continuity changes available
> evidence context. It grants no review, Product, qualification, or acceptance
> authority.

The first use after S05 should remain cold-start dogfooding over subsequent
ABIogenesis stages. A controlled mixed panel can vary initial context and
review posture now. Those runs can establish the latency, cost, and quality
evidence required before T-110 is repriced for a future Product wave.

## Current Reality

### Consensus identity today

The selected S05 boundary requires, and the current repair carries:

- one exact subject materialization;
- one stable reviewer profile per panel member;
- one exact instruction and response contract per profile;
- explicit actor and worker-binding identities;
- a duplicate-free ordered panel;
- attributed findings, result, and replay; and
- F_H escalation for unresolved disagreement.

These relations remain candidate Product behavior until one exact S05 subject
is verified, reviewed, and accepted.

`ConsensusReviewerProfile` identifies a declared review role and execution
configuration. It does not identify a persistent conversation. A worker
binding identifies the selected executable endpoint. It does not prove that
the endpoint has prior experience.

Current live agent traversals start a new process or PTY callout and
materialize context again. The S05 candidate therefore exercises cold-start
heterogeneity:

```text
exact subject
  -> exact reviewer instruction
  -> fresh worker callout
  -> attributed findings
  -> ordinary Consensus reduction
```

This is the appropriate S05 proof boundary. A fresh reviewer exposes
assumptions that exist only in the authoring session and avoids accidental
dependence on hidden conversation state.

### T-110 today

T-110 is a deferred executor design. It proposes:

- a pool executor behind the existing traced call-out interface;
- a typed session-affinity key;
- same-edge retry reuse as the first closure slice;
- later graph-run reuse;
- cache-prefix discipline;
- typed session failure and replacement; and
- the same per-call forensic archive shape across cold and pooled execution.

T-110 deliberately prevents hidden session memory from becoming closure
authority. It currently scopes warm slots to a traversal and specifies
eviction at traversal closure. Its release scope explicitly excludes the
admitted 5.0 floor.

T-111, which T-110 still describes as backlog, is now completed. That stale
dependency status should be reconciled if T-110 is later reactivated. It does
not authorize current work.

## The Missing Relation

Warm execution and historical reviewer identity solve different problems.

| Relation | Question | Owner or future boundary | Semantic effect |
|---|---|---|---|
| reviewer profile | What review role and instruction are selected? | Product Consensus domain | Determines the declared review contract |
| actor identity | Who is attributed with the act? | Product input and ABG admission | Preserves accountability |
| worker binding | Which admitted implementation performs the call? | Product resolution and ABG execution basis | Selects the executable leaf seam |
| provider or model | Which backend realizes the worker? | implementation and transport evidence | Describes realization, not authority |
| session identity | Which conversational process or provider thread is used? | future session substrate and ABG lineage | Determines continuity and lifecycle |
| context basis | Which exact prior material is available at invocation? | future caller/Product policy; ABG admission if selected | Makes initial conditions inspectable |
| experience projection | Which admitted earlier review episodes are associated with the reviewer? | future replay-derived read model | Describes history without granting rank |
| review result | What did this invocation conclude about this exact subject? | Product result semantics; ABG admission | Supplies evidence to Consensus |

Collapsing these identities creates predictable defects:

- a stable profile can be mistaken for a stable session;
- a provider label can be mistaken for reviewer identity;
- a retained session can leak state across unrelated subjects or workspaces;
- hidden conversational memory can replace exact subject evidence;
- a historically successful reviewer can appear to possess acceptance
  authority;
- several panel members can unknowingly share one correlated context; and
- a retained authoring session can be mislabeled as independent review.

The future design must keep the relation explicit:

```text
Profile != Actor != Worker != Session != ContextBasis != Result
```

## Old, New, Borrowed, Blue

The mnemonic describes useful review diversity. It is not a fixed panel roster
or a new Consensus outcome law.

| Profile | Context condition | Contribution | Independence |
|---|---|---|---|
| old | admitted historical context or a later sticky session | remembers lineage, prior failures, intent, and earlier rejected substitutes | historically informed; independent only if it did not author the subject |
| new | cold start with the exact subject and minimum lawful authority context | exposes undocumented assumptions and tests comprehensibility | strongest context independence |
| borrowed | cold or forked specialist context from an adjacent domain | applies release, security, language, downstream-consumer, or operational knowledge | independent of the local implementation when separately attributed |
| blue | cold or historical defensive context focused on failure and recovery | checks refusal, replay, operability, preservation, and safe degradation | posture-specific; does not replace an adversarial red review where required |

The useful heterogeneity is multidimensional:

```text
provider or model
  x reviewer role
  x initial context condition
  x historical continuity
  x domain experience
  x review posture
```

Four identical workers with the same prompt and context are four executions,
not four independent perspectives.

An external worker may fan out internally. ABIogenesis remains indifferent to
that internal realization. Unless the child results are separately declared,
attributed, and admitted, the external invocation produces one reviewer
result.

## Cold-Start Dogfood Before Sticky Sessions

After S05 acceptance, the installed candidate can review S06, observer/tuner,
qualification preparation, and release surfaces through ordinary Consensus.
This is development use of an accepted Product construction. It is not a
self-hosting release gate and cannot qualify itself.

The first controlled panel can run entirely through cold starts:

1. a new reviewer receives the exact subject and minimal authority context;
2. a history-seeded reviewer receives selected prior decisions and failures
   inside its existing exact digest-bound reviewer instruction;
3. a borrowed specialist receives the exact subject plus one bounded adjacent
   domain context;
4. a blue reviewer receives the exact subject plus failure, recovery, and
   conservation instructions.

The history-seeded reviewer is a cold-start approximation of “old.” Its
history is explicit instruction content rather than hidden session memory or a
new S05 carrier. This supplies a controlled baseline for later comparison with
a genuinely retained session.

All panel members should share:

- the same exact review subject;
- the same result schema;
- the same candidate identity and acceptance boundary; and
- explicit profile, instruction, actor, and worker attribution.

Their exact role instructions differ deliberately and carry any supplied
history or specialist context. Consensus reduces the resulting findings. It
does not erase those initial-condition differences. A separately addressable
context-basis identity remains future Product work.

## Evidence For Future Reactivation

T-110 already requires observed latency, cost, or quality pressure before
reactivation. Subsequent-stage dogfood can record that evidence without adding
sticky execution to 5.0.

Useful comparisons include:

| Measure | Cold baseline | Future sticky comparison |
|---|---|---|
| subject-to-first-finding latency | fresh process and full context load | resumed admitted session |
| context construction cost | explicit context bytes and tokens | retained prefix plus fresh suffix |
| unique relevant findings | per profile and exact instruction | same profile with admitted history |
| repeated stale findings | repeated rediscovery across rounds | expected reduction under continuity |
| false positives | disposition after exact review or F_H ruling | same measure under continuity |
| seeded-defect detection | detected or missed by each initial condition | same subject under retained history |
| disagreement convergence | rounds and unresolved residuals | same policy under retained history |
| context contamination | cold control should remain isolated | sticky run must prove no unrelated leakage |

Review quality cannot be inferred from confidence, verbosity, agreement, or
worker self-description. It must be evaluated against exact findings,
evidence, controlled defects, later dispositions, and preserved Product
outcomes.

## Future Session Questions

Future Product intake should decide which continuity relations are required.
Candidate distinctions for evaluation include:

- whether execution is fresh or resumes retained conversational state;
- whether a lawful session may fork from an admitted history;
- which reset, termination, or expiry behavior prevents later reuse;
- whether scope is retry, traversal, work item, or a bounded review family;
- what context lineage must identify the history available to a call;
- how one call retains its result and archive identity inside a longer
  session; and
- which unhealthy, replacement, expiry, and failure distinctions are
  Product-visible.

This post selects none of those modes or carriers. If future Product authority
admits continuity, the Product or calling review policy must select it. A
worker or transport cannot silently resume a session.

Under an admitted future relation, ABG would own admission, lifecycle facts,
lineage, replay, and failure truth. The executor would own PTY, process,
provider-thread, cache, and transport mechanics. GTL would own the declared
panel and review topology. Product Consensus would own reviewer-profile and
result meaning. Public surfaces would remain projections.

A session transcript is evidence. It is not an ABG event stream, a Program, a
continuation, or a closure authority.

Experience must be a replay-derived projection of admitted work:

```text
reviewer identity
  -> cited prior review episodes
  -> exact subjects, roles, findings, and dispositions
  -> bounded experience projection
```

It must not become an opaque reputation score, automatic voting weight, or
authority rank. A reviewer with extensive history still evaluates the current
exact subject under the current instruction and result contract.

## Re-Entry Classification

Two future changes must remain separate.

### Executor-only reuse

If session reuse is invisible to Product semantics and preserves the same
profile, input, result, attribution, archive, and ABG truth, T-110 remains a
`design_reframe`. It is an executor and economics improvement.

### Selectable historical reviewer experience

If a user or GTL Product can select fresh, resumed, forked, or historically
experienced reviewers and inspect their context lineage, the Product gains a
new capability. That change requires future Product re-entry before T-110
realizes it. Requirements and design must then state the identity, admission,
isolation, lifecycle, and evidence invariants.

T-110 should remain the executor realization owner. Consensus must not own a
session pool, PTY manager, provider cache, or scheduler.

## Non-Goals

This strategy does not:

- expand or delay S05;
- make sticky sessions part of ABIogenesis 5.0 qualification;
- make dogfooding a 5.0 release gate;
- prescribe a four-member panel;
- privilege a provider or model;
- add reviewer reputation, voting weight, or automatic authority;
- permit hidden context to satisfy subject or evidence requirements;
- allow cross-workspace or cross-subject state leakage;
- create a Consensus scheduler, session controller, or second runtime;
- authorize new session events, schemas, public operations, or code now; or
- reactivate T-110 from commentary alone.

## Recommended Action

1. Close S05 using the current cold-start contract.
2. Use accepted Consensus as an optional review tool for subsequent stages
   with mixed cold-start profiles whose exact instructions carry the supplied
   history or specialist context.
3. Record latency, token, quality, contamination, and finding-disposition
   evidence against exact subjects.
4. Keep cold-start review as the independent control and deterministic test
   default.
5. After stable 5.0, decide whether measured evidence selects:
   - executor-only T-110 reactivation; or
   - a future Product reprice for selectable historical reviewer identity,
     with T-110 subordinate as the pool realization owner.
6. Reconcile T-110’s stale T-111 dependency status only when that future work
   is admitted.

The desired future panel combines a clean outsider, a historically informed
reviewer, an adjacent specialist, and a defensive reviewer while preserving
one exact subject and one attributable result per admitted worker invocation.
That supplies heterogeneous judgment without granting hidden session state any
constitutional power.
