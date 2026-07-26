# T-256 Canonical Consumer Review Gate

**Date**: 2026-07-13
**Checkpoint**: `ec172f2`
**Verdict**: reject closure; retain checkpoint unpushed; do not start T-257

## Confirmed Findings

1. The join searches public execution bindings for the selected helper
   GraphFunction. Consensus publishes only the outer function, so contained
   effect-bearing helpers resolve to zero bindings.
2. Consensus C terms retain domain roles such as `reduce_round`, while the
   composition contract carries the generic T-183 role `transform`. Exact
   string equality rejects the canonical body instead of deriving the generic
   compute role from admitted composition truth.
3. The public join accepts caller-authored relevance rows, section decisions,
   binding slots, runtime facts, and proportionality. Hashing these values does
   not make them F_D-derived instruction truth.
4. The T-252 census removes two gap families by inspecting declarations and
   role names without invoking `joinDeclaredExecutionContext`.
5. `DerivedInstructionCarrierTruth.outputContractRefs` combines prompt-asset
   output contracts with worker-result contracts, contrary to the accepted
   separation law.

## Bounded Repair

- resolve the selected helper by exact containment in one admitted catalog
  Module while retaining the public outer entry as catalog authority;
- retain the domain C-stage role for protocol matching and derive the generic
  T-183 compute role from the exact composition binding;
- derive relevance, sections, slots, runtime facts, available inputs, and
  proportionality inside the adapter from admitted program, protocol, carrier,
  and catalog truth;
- keep prompt-asset output contracts out of worker-result contract truth; and
- make the T-252 probe call the real join and retain a gap unless that call
  reaches the expected T-268 capability block or a constructed request.

The existing green gates remain useful regression evidence but do not satisfy
the canonical consumer exit condition.
