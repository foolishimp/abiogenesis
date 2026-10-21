# ADR-045 - Global design constraints survive local projection

**Status**: Proposed for T-270 S05 design review

**Date**: 2026-07-27

**Owner**: T-270

## Context

S05 churn occurred because local implementation and review decisions changed
or rediscovered global Product relations. More local detail did not remove the
ambiguity; it obscured whether lineage, event truth, replay, authority, and
closure still formed one system.

## Decision

Design is a global-to-local constraint network.

For every material Product decision it shall state:

- the global invariant;
- its owning authority;
- the abstract module and interface projection;
- the local obligations that preserve it; and
- one falsification condition showing when local work has violated it.

The design shall resolve product-wide identity, lineage, authoritative event
truth, Event Calculus, replay, authority, refusal, retry, closure, persistence,
and public projection once. A feature binds local values to those relations;
it does not redefine them.

The ABG event log is authoritative runtime truth. Diagnostic logs, traces,
metrics, and telemetry are downstream observations only.

Local design may choose algorithms and interfaces within the global
constraints. Code may choose mechanical realization within the accepted local
design. If a local choice changes a global invariant or leaves two semantic
systems lawful, design is incomplete.

ADRs record only material architecture decisions and rejected alternatives.
They are rationale, not a parallel source of law. Do not create an ADR per
function, file, test, or review finding.

## Rejected Alternatives

- feature-specific lineage, logging, replay, retry, or closure;
- exhaustive local detail without a global invariant trace;
- one concrete implementation mandated where several equivalent projections
  preserve the same relation; and
- repeated candidate review used as design discovery.

## Consequence

Review begins at the Product system and drills down only far enough to prove
that modules, interfaces, algorithms, and code preserve its decisions. A
global decision that cannot be located at local scope is a design defect.
