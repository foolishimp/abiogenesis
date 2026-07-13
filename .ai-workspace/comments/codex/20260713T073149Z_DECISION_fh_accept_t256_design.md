# Invalidated Decision Record: T-256 Design Acceptance

**Status**: Invalidated by
`.ai-workspace/comments/codex/20260713T074427Z_REVIEW_GATE_t256_design_rejected.md`.
This record is retained only to preserve the correction lineage. It grants no
design or implementation authority.

## Decision

Continuation was interpreted as F_H acceptance on 2026-07-13 after the current
T-256 design checkpoint was presented as the active acceptance gate. The next
review rejected that interpretation and superseded this record before any
implementation commit or push.

`M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md` remains a candidate design.
Implementation is paused pending bounded design repair, independent review,
and a new explicit F_H decision.

## Retained Guards

- GTL declaration data remains the instruction and field-projection source.
- Registry selection remains event-sourced and replay-derived.
- Declaration Modules receive no invocation authority.
- T-256 validates one caller-supplied C-stage basis and owns no sequencing.
- Capability absence remains the exact T-268 block.
- Every constructed request preserves the exact T-267 startup block.
- T-256 performs no dispatch, response admission, human act, traversal, event
  write, continuation, or closure.
- Consensus-specific data may be supplied through admitted companion Module
  declarations, but no Consensus-specific M03 branch or carrier is admitted.

## Next Gate

Implementation must satisfy the accepted design proof matrix, focused tests,
broad semantic and package gates, and an independent self-review before ticket
closure is presented or recorded.
