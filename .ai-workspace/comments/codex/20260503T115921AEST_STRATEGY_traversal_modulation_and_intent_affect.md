# Strategy: Traversal Modulation And Intent Affect

**Status**: Strategy proposal, not ratified specification
**Repo**: `/Users/jim/src/apps/abiogenesis`
**Author**: Codex
**Date**: 2026-05-03
**Governance lens**: STDO / ODD / GTL-ABG boundary

## Claim

ABG needs a typed traversal modulation surface.

The surface should let a domain product say, "this edge contains too much
probabilistic work for one unbounded F_P call; execute it through a bounded
attempt policy such as steel thread, layered build, by obligation, by feature,
or gap repair."

This should not be prompt-only. The prompt should be a projection of admitted
modulation truth.

This should also not become SDLC-local controller logic. The domain may supply
obligation meaning, schedule pressure, and policy preference. ABG must own the
runtime carrier, event truth, retry/continuation projection, and consistency of
the public summary.

## Context

The current ABG RC6 substrate has the necessary lower primitives:

- T-082: ABG-owned output instance allocation.
- T-100: workspace-visible obligation ledger, schedule, slice assessment, and
  foldback.
- T-102: eval suite projection and repeatable sandbox runs.
- T-103: graph-span foldback and reentry frontier.
- T-104: input workspace and output workspace separation for parallel review
  streams.

The remaining strategic question is not whether ABG can record ledgers or route
reentry. It can. The question is how ABG should shape a probabilistic worker
attempt when the outer graph edge is valid but too large for one agentic call.

Example operator intent:

```text
This folder has 100 features. Build them.
```

The operator should not have to manually manage 100 sub-tasks. The system
should let the worker make bounded progress, then evaluate real semantic
deviation requirement-by-requirement, then continue the same edge with sharper
gap pressure until the ledger closes or a lawful reentry is required.

## Philosophy Decision

There are two wrong endpoints.

1. Prompt-only chunking:
   - prompt says "do the first 5"
   - no typed runtime law records why
   - no replayable attempt envelope exists
   - CLI/gap surfaces can disagree
   - later intent affect becomes another prompt convention

2. SDLC-local controller loop:
   - SDLC decides chunking, retries, and next traversal privately
   - ABG becomes a single-hop execution substrate
   - downstream products rebuild iteration logic
   - graph-span reentry and foldback lose authority

The correct middle is:

```text
SDLC/domain owns obligation meaning and product policy preference.
GTL exposes a declaration/hook attachment for traversal modulation.
ABG admits and resolves a traversal modulation profile.
ABG derives bounded F_P attempt envelopes.
F_P performs the bounded construction.
ABG records artifacts, non-progress, retry, foldback, and reentry truth.
Semantic F_P/F_H evaluation decides requirement-by-requirement fit.
```

## Layering Rule

Traversal modulation is not domain semantics.

It is a control-pressure carrier around an edge attempt:

- how much work may be attempted
- how work may be sliced
- whether progress artifacts are mandatory
- how retry budget is applied
- how gap pressure is injected into the next attempt
- when same-edge continuation remains lawful
- when upstream graph or constitutional reentry is required

It does not decide whether `A.req_i` is satisfied by `B.result_i`.

That remains semantic evaluation under the declared evaluator regime.

## GTL Shape

GTL should not become a policy semantic language.

The existing GTL requirement direction already allows hook attachment and opaque
configuration on `GraphFunction`, `GraphVector`, `Role`, `Rule`, and related
declaration surfaces. That is enough for the language side.

The proposed GTL-level shape is a visible declaration attachment:

```text
GraphVector.declarations.traversal_modulation_ref
GraphFunction.declarations.default_traversal_modulation_ref
Role.policy_hooks.traversal_modulation
```

or an equivalent `Attrs`/hook shape consistent with the current GTL 3 law.

GTL declares:

- this graph function or vector permits modulation
- these are the opaque config refs or policy hook refs
- these are the declared evaluator/role boundaries
- this is the outer `A -> B` contract

GTL does not define the semantics of `steel_thread`, `layered_build`, or
`agent_selected` as in-language law. ABG resolves those through runtime policy
and admitted product/domain policy inputs.

## ABG Shape

ABG should introduce a runtime carrier family roughly equivalent to:

```ts
type TraversalModulationStrategy =
  | "atomic"
  | "bounded_batch"
  | "steel_thread"
  | "layered_build"
  | "by_obligation"
  | "by_feature"
  | "gap_repair"
  | "agent_selected";

interface TraversalModulationProfile {
  readonly kind: "traversal_modulation_profile";
  readonly profileRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly strategy: TraversalModulationStrategy;
  readonly policyRefs: readonly string[];
  readonly obligationScheduleRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly batch: {
    readonly targetItemCount?: number;
    readonly maxItemCount?: number;
    readonly maxTokenPressure?: number;
  };
  readonly progressContract: {
    readonly progressArtifactRequired: boolean;
    readonly allowedProgressArtifactKinds: readonly string[];
    readonly noProgressClass: "runtime_non_progress";
  };
  readonly continuation: {
    readonly sameEdgeUntil: "foldback_closed" | "retry_budget_exhausted";
    readonly maxAttemptsWithoutNewSignal: number;
    readonly maxTotalAttempts: number;
  };
}
```

ABG then derives an attempt envelope:

```ts
interface TraversalAttemptEnvelope {
  readonly kind: "traversal_attempt_envelope";
  readonly envelopeRef: string;
  readonly profileRef: string;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly requiredProgressArtifactRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly retryBudgetRemaining: number;
  readonly mustExitAfterBoundedAttempt: boolean;
}
```

The F_P prompt is generated from that envelope. The prompt is not the authority.

## Event And Projection Truth

The minimum replay-visible events should be:

```text
traversal_modulation_resolved
traversal_attempt_envelope_derived
traversal_attempt_dispatched
traversal_attempt_progress_observed
traversal_attempt_non_progress_classified
traversal_same_edge_continuation_planned
traversal_modulation_exhausted
```

These events should compose with the existing T-100/T-103/T-104 carriers rather
than duplicating them.

T-100 owns obligation schedule and foldback.
T-103 owns graph-span foldback and reentry frontier.
T-104 owns W1/W2 materialization lineage.
Traversal modulation owns the bounded attempt envelope and continuation pressure
for an edge attempt.

## Outcome Law

For a modulated F_P traversal attempt, the lawful result is exactly one of:

```text
artifact produced
  -> admission
  -> semantic eval / foldback
  -> ledger progress or closure

typed partial progress produced
  -> admission
  -> open schedule rows remain
  -> same-edge continuation pressure

typed runtime non-progress
  -> no artifact/report/progress signal
  -> bounded retry if policy allows
  -> public summary and carrier agree

typed semantic gap
  -> requirement-by-requirement gap pressure
  -> same-edge continuation or graph/constitutional reentry

typed exhausted / blocked
  -> no private retry
  -> projection-visible stop
```

The public operator rule becomes:

```text
Either produce an artifact and ledger-close/progress,
or emit a typed retry/continuation path whose carrier and CLI summary agree.
```

## Intent Affect

This strategy leaves a clean path for affect derived from intent.

Here "affect" means a typed control signal, not loose emotional prose. It is a
modulator input produced from intent, current risk, urgency, confidence,
operator preference, or uncertainty.

Possible first-class affect signals:

```ts
type TraversalAffect =
  | { readonly kind: "urgency"; readonly level: "low" | "normal" | "high" }
  | { readonly kind: "risk"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "confidence"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "precision"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "exploration"; readonly level: "low" | "medium" | "high" };
```

Examples:

- high risk -> smaller batch, stronger progress artifact requirement
- high urgency -> faster bounded attempts, thinner first pass, quicker same-edge
  continuation
- low confidence -> steel thread first, preserve alternatives
- high precision -> smaller slice, stricter foldback
- high exploration -> allow broader candidate generation before foldback

Affect must not certify semantic correctness. It only changes attempt pressure.

## Relationship To odd_sdlc

For odd_sdlc, this avoids two bad outcomes:

1. SDLC hardcodes private chunking loops.
2. A single F_P worker call receives a massive edge prompt and silently times
   out without an artifact.

The SDLC product can say:

```text
Build this folder of 100 features.
Policy: steel_thread, target 5, max 10, progress artifact required.
Continue same edge until semantic foldback closes or upstream reentry is
projected.
```

ABG then turns that into:

- selected schedule rows
- output allocation roots
- F_P attempt envelope
- progress artifact requirements
- retry budget
- replay-visible carrier truth
- public summary truth

The operator can remain simple. The system carries the bounded construction
mechanics.

## STDO Reading

### Specification

This is at least a requirement-level proposal for ABG if accepted. Existing
requirements cover policy hooks, retry, convergence, transport, projection,
assurance, output allocation, and span reentry. They do not yet name traversal
modulation as the typed carrier that shapes a bounded F_P attempt.

### Ticket

This should become a new ticket before implementation. It should not be hidden
inside odd_sdlc T-109 or test66 repair work.

Candidate change class:

```text
requirement_reprice
```

Reason: the proposed feature expands ABG runtime law for how a graph-vector
attempt is modulated, admitted, retried, and projected. It is not merely a
realization refactor.

### Design

The design should land in the TypeScript M03 design family and explicitly map
to:

- `workspace_zoom_foldback.ts`
- graph-span reentry carriers
- output allocation carriers
- eval-suite projection
- runner next-transition logic
- CLI/result projection consistency

### ODD

This preserves the ODD boundary.

ABG owns traversal mechanics, event truth, ledger projection, continuation, and
reentry routing. The downstream product owns domain meaning, requirement
content, policy defaults, and semantic evaluation.

## Rejected Alternatives

### Prompt-only modulation

Rejected because it is not replayable, not inspectable, and cannot make CLI,
carrier, and ledger truth agree.

### SDLC-only chunking

Rejected because it rebuilds ABG iteration in the downstream product and
reintroduces a private controller loop.

### GTL policy DSL

Rejected because current GTL law says GTL exposes hooks and opaque config, not
a policy semantic language. GTL can attach modulation declarations. ABG should
own runtime interpretation.

### Unbounded F_P edge call

Rejected because it makes non-progress indistinguishable from semantic
non-closure unless the runtime has an explicit non-progress carrier and retry
path.

## Proposed Next Ticket Seed

Title:

```text
Define ABG traversal modulation profiles for bounded F_P graph-vector attempts
```

Goal:

```text
Make ABG resolve GTL-visible traversal modulation policy into replay-visible
attempt envelopes so large probabilistic graph-vector work can progress through
bounded artifacts, semantic foldback, same-edge continuation, and lawful reentry
without downstream products implementing private chunking loops.
```

Initial acceptance criteria:

1. Requirements name traversal modulation as ABG-owned runtime law with
   GTL-visible hook/config attachment.
2. Design defines `TraversalModulationProfile`, `TraversalAttemptEnvelope`,
   events, projection, and runner/CLI integration.
3. Implementation derives attempt envelopes as pure functions from basis,
   resolved policy, schedule, gap pressure, and prior attempt facts.
4. F_P handoff manifests carry the attempt envelope and required progress
   artifact refs.
5. Runtime non-progress emits a typed carrier with retry/continuation action
   derived from the same projection shown by CLI/gaps.
6. Tests prove bounded progress, same-edge continuation, retry budget
   exhaustion, and CLI/carrier agreement.
7. A sandbox proves a large-obligation mini data-mapper edge can progress in
   slices without SDLC-local orchestration.
