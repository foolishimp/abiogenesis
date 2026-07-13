# T-267 Design Amendment: Mandatory Compute Stage Slots

**Timestamp**: 2026-07-13T21:42:00Z
**Ticket**: T-267
**Disposition**: bounded correction under delegated F_H authority

The accepted design described selected work stages plus one consequence stage.
The existing `typecheckGtlProgram(...)` law requires each compute composition
to provide `transform.C`, `evaluate.C`, and `consequence.C`; F_H work also
retains its `human_callout` stage.

T-267 will preserve that existing algebra. A selected non-human work stage
occupies `transform.C`. A deterministic `evaluate.C` row binds the exact
admitted result authority. `consequence.C` projects the exact target and edge
closure. F_H additionally receives a deterministic `transform.C` request
projection before the exact `human_callout` stage. Every derived boundary is
authority-denied and static: it invokes no worker or human, admits no runtime
payload, and creates no product regime.

This is a compiler-shape correction, not a new atom or runtime path.
