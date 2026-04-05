# Scenario Bundle - Replay, Lineage, And Correction

**Validates**: REQ-R-ABG3-PROJECTION, REQ-R-ABG3-LINEAGE, REQ-R-ABG3-PROVENANCE, REQ-R-ABG3-CORRECTION

**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../ABG_3_CONSTITUTIONAL_DESIGN.md)

**Purpose**: Prove that ABG 3 current truth is replay-derived and that lineage,
provenance, and correction remain explainable under retry, foldback, and
supersession.

## Scenario

Replay a run with one graph call and one recursive frame through suspension,
rebound, continuation opening, correction, and replacement run supersession.

## Significant Paths

- replay path: current run/call/frame/continuation truth is derived from events
- lineage path: work scope, graph-call causality, and frame lineage remain
  explicit under retry and reopen
- provenance path: graph-function, materialization, policy, selection, and
  continuation provenance stay replay-visible
- correction path: stale frame progress and stale continuation truth are
  invalidated by authoritative correction or supersession events

## Expected Outcomes

1. replay alone determines what currently holds
2. retries mint fresh attempt identities without losing lawful lineage
3. stale progress is never treated as current truth after correction
4. cross-run carry-forward uses closed-old/open-new continuation truth with
   explicit causal linkage
