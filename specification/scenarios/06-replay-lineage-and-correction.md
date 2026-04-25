# Scenario Bundle - Replay, Lineage, And Correction

**Validates**: REQ-R-ABG3-PROJECTION, REQ-R-ABG3-LINEAGE, REQ-R-ABG3-PROVENANCE, REQ-R-ABG3-CORRECTION, REQ-R-ABG3-RETRY

**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/abg/README.md](../requirements/abg/README.md)

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
3. retry prompt and manifest truth are rebuilt from current state rather than
   reused stale controller state
4. stale progress is never treated as current truth after correction or retry
5. cross-run carry-forward uses closed-old/open-new continuation truth with
   explicit causal linkage
