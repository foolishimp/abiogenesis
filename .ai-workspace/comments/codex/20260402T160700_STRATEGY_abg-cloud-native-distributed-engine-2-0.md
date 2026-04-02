# STRATEGY: ABG 2.0 Cloud-Native Distributed Engine

**Author**: Codex
**Date**: 2026-04-02
**Addresses**: ABG 2.0 cloud-native target architecture, distributed recursive control plane, AWS-oriented deployment mapping
**Status**: Draft
**Supersedes in emphasis**: `claude/20260331T110000_STRATEGY_abg-cloud-native-distributed-engine.md`

## Summary

ABG 2.0 is now a stable semantic target for a cloud-native implementation.

The important change from older cloud notes is this:

> the central artifact is no longer “compile the graph to a static workflow and
> let the cloud runtime be the semantics.”
>
> the central artifact is “preserve ABG 2.0’s recursive event-sourced
> interpreter contract in a distributed substrate.”

That means:

- GTL remains a portable language SDK
- ABG becomes a distributed recursive control plane
- event truth remains authoritative
- recursive next-action truth lives in explicit continuation/frontier state
- cloud services host the interpreter contract; they do not replace it

The constitutional laws do not change.
The transport, persistence, and coordination substrate changes.

## 1. Why ABG 2.0 Changes the Cloud Design

Older ABG cloud ideas were directionally right about event-sourcing, but they
were still too topology-centric.

ABG 2.0 clarified that:

- recursive selection is invocation-local
- the published module stays stable
- child completion yields fold-back input, not parent certification
- parent truth requires rebind and re-evaluation
- recursive progress is carried by explicit continuation/frontier state
- checkpoints are resumability aids, not a second truth surface

So the cloud target is not:

> a graph compiler that lowers GTL into one static cloud state machine

It is:

> a distributed, resumable recursive state machine that interprets GTL contracts

This is a better fit for real cloud orchestration anyway.

## 2. What Must Not Change In The Cloud Target

Any cloud-native ABG must preserve these ABG 2.0 laws:

1. No global module rewrite for recursive graph-function application.
2. No synthetic traversal targets because publication truth is missing.
3. No parent certification from “all child work completed”.
4. No hidden fold-back logic outside declared GTL recursion law.
5. No checkpoint or snapshot becoming authority over causal events.
6. No runtime path where wrapper/orchestration logic becomes the real semantic carrier instead of ABG interpreter state.
7. No cloud-specific service abstraction becoming a second rival workflow language beside GTL.

If the cloud target breaks any of those, it is not an ABG 2.0 implementation.

## 3. Core Architectural Thesis

### GTL

GTL remains:

- a portable language SDK
- engine-independent
- cloud-independent
- publishable in JVM, Python, TypeScript, or other host languages

GTL owns:

- graph structure
- graph algebra
- graph functions
- candidate families
- refinement boundaries
- jobs and roles
- recursion law

### ABG

ABG cloud-native owns:

- append-only events
- recursive machine control
- materialization
- lawful selection application
- projection and indexes
- lineage
- convergence
- worker binding
- transport adapters
- correction/reset
- provenance

### Key principle

Port the contract, not the Python shape.

The Python release is the reference implementation of the law.
The cloud engine should preserve the same truth model, not replicate every file or function boundary one-to-one.

## 4. Recommended Cloud Runtime Shape

The prime cloud shape for ABG 2.0 is:

### 4.1 Event Store

Append-only authoritative event store.

Minimal requirements:

- durable append-only writes
- per-work / per-frame scoped replay
- monotonic event ordering within a scope
- efficient projector subscriptions
- no hidden mutation path outside event emission

AWS candidate:

- DynamoDB as the primary event ledger
- S3 as optional immutable archive/export layer

Recommended event identity shape:

- partition by workflow instance / work scope, not just one global stream
- include explicit event sequence or monotonic sortable id
- do not rely only on ISO timestamps for ordering

### 4.2 Recursive Machine State

ABG 2.0 requires explicit recursive control state as first-class distributed data.

That state should include at least:

- current frame id
- frame lineage id
- frame attempt id
- continuation phase
- child frontier state
- fold-back pending state
- suspension/checkpoint metadata
- current-frame cursor / scheduling control

This state may be projected from events and cached/indexed, but the cloud
implementation should treat it as ABG-owned runtime state, not as an incidental
property of a vendor workflow engine.

### 4.3 Projection And Indexes

Read models and indexes exist to make the runtime efficient, not to redefine truth.

Needed indexes:

- active recursive frames by work/workflow instance
- current recursive machine cursor
- pending child frontier obligations
- open human gates
- latest materialization/provenance for a frame
- convergence summaries by contract scope

These can live in:

- DynamoDB projection tables
- OpenSearch / Athena / lakehouse projections for analytics
- in-memory caches for hot control loops

But the law remains:

> events are authority; projections are read models

### 4.4 Dispatch Frontier

The cloud runtime should expose explicit ready obligations rather than hiding
work inside one monolithic orchestrator.

Typical obligation kinds:

- run deterministic evaluator
- dispatch probabilistic operator
- await human gate
- open child frame
- fold back child result
- re-evaluate parent

AWS candidate services:

- SQS for ready-work queues
- EventBridge for routing and wakeups
- Lambda / ECS / Batch / CodeBuild / Bedrock as execution targets

## 5. AWS Mapping, Corrected For ABG 2.0

### Event store

Use DynamoDB for append-only event truth and projector wakeups.

Good fit:

- durable
- scalable
- naturally partitioned
- stream support

### Deterministic work

Use Lambda for bounded deterministic checks.
Use CodeBuild, ECS, or Batch when the deterministic job needs a full build/test environment.

### Probabilistic work

Use Bedrock as one transport adapter, not as ABG semantics.

Good fit for:

- model invocation
- managed agent backends
- knowledge-base-backed context retrieval
- guardrails as additional deterministic safety checks

But keep this explicit:

> Bedrock is an F_P / transport substrate, not the workflow language and not the recursive interpreter.

### Human gates

Use API Gateway + Cognito + callback/task tokens or queue-driven approvals.

The important thing is not the UI shape.
The important thing is:

- explicit approval/rejection events
- actor identity captured in provenance
- no hidden out-of-band approval state

### Artifacts and contexts

Use S3 for:

- manifests
- result payloads
- context bundles
- immutable evidence artifacts

Context locators can resolve to cloud-backed stores, but the GTL context law
remains the same.

### Observability

Use OpenTelemetry/X-Ray/CloudWatch as projections over lineage/provenance.

Good mapping:

- work scope -> trace root
- run/evaluator dispatch -> spans
- frame lineage -> parent/child span structure

But do not confuse observability traces with runtime authority.

## 6. Step Functions: Useful, But Not The Semantic Center

This is the biggest correction to the older note.

Step Functions may still be useful, but they should not be assumed to be the
primary semantic carrier of ABG 2.0.

Why:

- ABG 2.0 recursion is invocation-local and dynamic
- frame-local publication and lawful selection can open child structure at runtime
- parent rebind and re-evaluation are semantic obligations, not just state transitions
- explicit continuation/frontier state is the real recursive truth surface

That means a static “compile Module to ASL and let Step Functions be the engine”
model is too weak as the main design.

Better stance:

- Step Functions can host bounded orchestration shells
- Step Functions can execute specific obligation chains
- Step Functions can coordinate human callbacks and retries
- Step Functions can host static subgraph fragments where useful

But:

> ABG’s recursive machine state must remain explicit and ABG-owned, not hidden
> inside ASL topology

If Step Functions becomes too constraining, Temporal or another workflow engine
is a substrate choice, not a semantic change.

## 7. Better Cloud Control Loop

The cloud-native ABG 2.0 control loop should look more like this:

1. event emitted
2. projector updates indexes and machine state
3. planner computes lawful next obligations from GTL contracts + event truth + recursive state
4. ready obligations are queued
5. execution adapters run work
6. results are ingested as events
7. child completion triggers fold-back barrier evaluation
8. parent is rebound and re-evaluated if lawful
9. loop repeats until convergence or suspension

This is:

- event-driven
- resumable
- distributed
- still semantically ABG

## 8. Bedrock-Specific Position

For an AWS-first deployment, Bedrock is the natural first F_P target.

Valid Bedrock integrations:

- `F_P` operator transport
- evaluator transport for probabilistic judgments
- knowledge-base-backed context retrieval
- guardrail checks before result ingestion
- explicit model family selection as published policy or candidate surfaces

What should not happen:

- model choice becomes hidden config instead of explicit workflow/runtime policy
- Bedrock agent behavior becomes the real workflow semantics
- ABG recursive state is replaced by Bedrock conversation state

## 9. Multi-Tenancy

Cloud ABG should support multi-tenant isolation at the event, artifact, and
execution layers.

Likely isolation axes:

- tenant/workflow namespace
- event partitions
- artifact prefixes/buckets
- role-to-worker binding policies
- backend credentials and quotas

But tenant isolation must not change the GTL/ABG law surface.
It is runtime partitioning, not language semantics.

## 10. Recommended Implementation Order

1. External event store and projector/index model.
   Replace JSONL-first local assumptions with real append-only distributed persistence.

2. Cloud transport adapters for F_P/F_D/F_H.
   Bedrock, Lambda/CodeBuild, approval gateway.

3. Explicit recursive machine state service.
   This is the real center of the 2.0 cloud design.

4. Read-only reporting and resolved-runtime projections.
   `gaps`, `status`, and observability derived from events + indexes.

5. Human-gate and authority integration.

6. Optional orchestration shells.
   Step Functions, Temporal, or equivalent for bounded execution helpers.

7. Static subgraph compiler only as an optimization or deployment convenience.
   Not as the foundational semantic carrier.

## 11. Risks

### Risk 1: Reintroducing topology-first thinking

If the cloud implementation treats topology compilation as the main artifact,
it will regress toward the old globalization mindset.

### Risk 2: Letting vendor orchestration become the semantics

If Step Functions/Temporal state becomes the real truth instead of ABG events +
recursive machine state, portability and correctness will drift.

### Risk 3: Treating checkpoints as authority

Cloud resumability makes this tempting.
It is still wrong.

### Risk 4: Hiding model/policy choice in platform config

ABG/GTL requires explicit policy/provenance surfaces.
Cloud config must not replace lawful workflow declaration.

## 12. Recommended Action

Use ABG 2.0 as the contract baseline for the cloud target.

The first serious design artifact should not be “GTL to Step Functions compiler.”
It should be:

> ABG recursive machine state schema + event schema + projection/index schema

Then map cloud services onto that contract.

The thesis is:

> ABG was always event-native.
> ABG 2.0 makes it recursive-machine-native as well.
> A cloud-native ABG should therefore be designed as a distributed recursive
> event-sourced interpreter, not as a static workflow compiler with some event
> logging around it.
