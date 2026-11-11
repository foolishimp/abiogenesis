# M03 Transport Protocol Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Derive the late TypeScript `M03` transport and result-artifact
protocol boundary from the paused Python reference transport line without turning
shell/process details into runtime semantic authority.

## 1. Position

The TypeScript tenant already owns:

- runtime basis admission
- advancement transition derivation
- runtime event emission
- bounded dispatch request derivation at the effect edge

What it does not yet own explicitly is the protocol boundary between:

- the closed `fp_dispatch` request derived from runtime truth
- the transport substrate that runs the external actor
- the result artifact that returns from that substrate
- the ingestion decision that turns artifact truth back into kernel-owned
  runtime meaning

That missing boundary is the remaining late `M03` transport family.

## 2. Python Reference Inputs

The paused Python reference line establishes the relevant reference through:

- `design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `code/genesis/transport.py`
- `code/genesis/result_ingest.py`
- `test_env/test_surface_map.md`

The Python line proves these design truths:

- transport is an effect-edge substrate, not a semantic center
- environment sanitization is explicit transport policy, not ambient runtime
  behavior
- result artifacts are admitted and validated explicitly
- dispatch and result handling must fail closed on malformed or contradictory
  truth

## 3. Current TypeScript State

Current TypeScript `M03` already derives a bounded dispatch request in:

- `code/src/abg/m03/events/emit.ts`

Current bounded truth:

- `dispatchRequestsForTransition(...)` derives a typed `fp_dispatch_request`
- `resultRef` is already explicit
- dispatch remains below `AdvancementTransition`

Current missing truth:

- no explicit transport contract carrier family
- no explicit result-artifact receipt carrier
- no explicit typed ingest outcome family
- no explicit design asset separating transport policy from runtime event law

## 4. Target TypeScript Consequence

The TypeScript line should derive one explicit late-`M03` transport protocol
boundary with:

1. one authoritative transport dispatch request carrier
2. one authoritative admitted result-artifact carrier
3. one authoritative closed ingest outcome family

This keeps:

- runtime event truth in `M03`
- subprocess/CLI details below the semantic center
- later `M04` result-assessment above the canonical ingest truth rather than
  beside it

## 5. Repriced Python Details

The TypeScript line carries the Python transport truth but does not need to
copy Python implementation shape exactly.

### Carried

- explicit environment sanitization policy
- explicit dispatch/result protocol boundary
- explicit failure classification and fail-closed ingestion

### Repriced

- Python dataclass/object shaping becomes readonly TypeScript carriers
- Python subprocess helper layout becomes a TypeScript module-bounded protocol
  family
- salvage/retry/process-supervision detail may remain subordinate or deferred
  if not needed for the first transport slice

## 6. First Slice Scope

The first late-`M03` transport slice should include:

- dispatch request truth derived from `fp_dispatch` transition law
- admitted result-artifact truth
- closed ingest outcome truth
- explicit sanitization policy as subordinate transport contract detail

It should not yet include:

- installed-runtime sandbox binding
- archive/publication of transport artifacts
- PTY supervision and progress-lease orchestration as a prime boundary
- `M04` app-owned result-assessment projection

## 7. Required Assets

This derivation requires:

- `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md`
- bounded strict-lane coverage for `code/src/abg/m03/transport/**`
- module-derived proof lanes declared before code opens

## 8. Consequence

Later code for this wave should open only under:

- `code/src/abg/m03/transport/**`

and should remain bounded to protocol truth.

It must not silently absorb:

- `M04` result-assessment ownership
- installed qualification/archive behavior
- cross-module asset registry or app bootstrap doctrine
