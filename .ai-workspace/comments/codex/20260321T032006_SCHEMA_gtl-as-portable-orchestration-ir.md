# SCHEMA: GTL As Portable Orchestration IR

**Author**: Codex
**Date**: 2026-03-21T03:20:06+11:00
**Addresses**: GTL portability, backend orchestration targets, worker interoperability, event-bus standardization
**For**: all

## Summary
GTL should be treated as the portable orchestration representation, not as the private configuration language of one engine build. The same GTL graph should be able to execute across different orchestration stacks by compiling to different backends while preserving the same semantic model.

That means portability and interoperability are both first-class design goals. Portability requires GTL to remain backend-neutral. Interoperability requires standardized interfaces between workers, orchestrators, and technology handoff layers, with the event bus as the primary cross-stack contract surface.

## Core Principle

```text
GTL representation = canonical orchestration IR
Execution stack    = backend realization target
```

Examples of backend targets:
- local in-process iterator
- AWS Step Functions + Fargate + Bedrock
- Temporal
- Prefect
- other future orchestration stacks

The GTL representation should remain stable enough that the same workflow semantics can move across these targets without rewriting the workflow meaning.

## Why This Matters
Without this abstraction, GTL becomes tied to one runtime and loses much of its value.

With this abstraction:
- workflows become portable across stacks
- backend choice becomes an implementation decision
- orchestration semantics survive technology churn
- local and distributed realizations can coexist
- the engine becomes a compiler family, not a single hardcoded runtime

This is especially important if the long-term direction includes:
- multiple `F_P` workers
- consensus across workers
- dynamic workflow assembly from intent vectors
- migration between local and distributed deployments

## Portability Requirement
Portability means:
- GTL must not encode backend-specific execution syntax
- GTL must express orchestration semantics abstractly
- backend compilers may realize those semantics differently, but not reinterpret them

So GTL should define things like:
- assets, edges, jobs, workers
- routing and capability constraints
- evaluator categories
- consensus requirements
- lineage and governance semantics
- event/handoff meaning

It should not directly define:
- Step Functions state JSON
- Temporal workflow code
- Prefect flow syntax
- Bedrock agent invocation payload shapes

Those belong to backend compilers.

## Interoperability Requirement
Portability alone is not enough.

If different workers, backends, and technologies cannot hand work to one another through stable interfaces, then portability degenerates into isolated backends that merely happen to share a source model.

So interoperability requires standardized interfaces at the handoff boundaries.

The main boundaries are:
- orchestrator → worker dispatch
- worker → result return
- worker/orchestrator → event bus emission
- event bus → projection/observer/consensus layer

## Event Bus As Primary Handoff Contract
The event bus should be the main interoperability surface.

Why:
- it decouples worker implementation from orchestrator implementation
- it allows different technologies to participate in the same execution
- it provides auditability and replay
- it supports local and distributed builds with the same conceptual handoff model

This means:
- workers should not need direct knowledge of each other's runtime stack
- workers and orchestrators communicate progression through standardized events
- the event substrate must carry enough semantic structure to support projection, consensus, provenance, and audit

Given the agreed direction, this event substrate should be OpenLineage-based.

## Standard Interfaces Needed

### 1. Worker Dispatch Contract

Every backend should be able to map GTL execution intent into a worker dispatch contract that answers:
- which job is being executed
- under which scope/workflow version
- with which contexts
- with which expected output contract

### 2. Worker Result Contract

Every worker should return results in a standardizable way:
- success/failure
- produced artifact references
- assessment payloads
- lineage/event metadata needed by the control layer

### 3. Event Emission Contract

Every backend should emit semantically equivalent events/facets for:
- dispatch
- result assessment
- approvals/revocations
- convergence markers
- overrides and exceptional paths

If this contract is not standardized, GTL workflows stop being truly portable because projection and governance become backend-specific.

## Consequence For Backend Design
Backend implementations should be viewed as compilers plus runtime adapters.

A backend is responsible for:
- compiling GTL constructs into local orchestration primitives
- mapping worker invocation into the target platform
- emitting standard event semantics
- preserving required convergence/governance behavior

A backend is **not** allowed to redefine workflow meaning just because its host platform has different native concepts.

## Examples

### Local build

GTL compiles to:
- in-process iterator
- local worker dispatch
- local OL event emission

### AWS-native build

GTL compiles to:
- Step Functions orchestration
- Fargate/Lambda tasks
- Bedrock-backed `F_P` workers
- OL-compatible event handoff layer

### Temporal build

GTL compiles to:
- Temporal workflows/activities
- worker processes
- same event semantics at the lineage boundary

In all three cases, the orchestration backend changes.
The GTL workflow meaning should not.

## Recommended Action
1. Ratify GTL as the canonical portable orchestration IR.
2. Ratify backend orchestrators as compilation targets, not constitutional workflow definitions.
3. Treat portability and interoperability as separate but linked requirements.
4. Standardize worker dispatch/result/event interfaces, with the event bus as the primary technology handoff surface.
5. Keep OpenLineage as the canonical event substrate so heterogeneous stacks can participate in one execution model without losing auditability or projection semantics.

