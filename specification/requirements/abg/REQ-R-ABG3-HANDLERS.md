# REQ-R-ABG3-HANDLERS — Effect Handlers And Program Interpretation

**Status**: Active (T-205 P0; codex review requested before realization)
**Realizes**: T-205 (design: ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN §8.1/§15–§17; T-205 factoring + handler classes)
**Derives from**: REQ-R-ABG3-CCALL-001..-017; T-030 emergence boundary law; T-195 C3/C4 adjudications.

ONTOLOGY: C is compute. A plugin factors into its CATEGORY (the
declared shape of compute — programs, catalogs, ladders, contracts:
GTL data) and its FUNCTOR (the effect handler realizing compute in the
world). This family governs the functor.

## Handler obligations

- **-001 Arm fidelity.** A handler realizes exactly the census-bound
  arm it is registered for; the (stageRole × regime × armId) census is
  asserted at the one interpretation seam.
- **-002 Interiors only.** Handlers return interior results and never
  mint spine or truth events. Spine construction has ONE authority
  (runner/c_call_spine.ts); handler-reachable sinks are kind-restricted
  to the transport envelope.
- **-003 Evidence honesty.** Outcome status and evidence refs
  correspond to real effects: external sessions reconcile against
  interior refs under the -012 audit, per configuration. Asserted-but-
  unevidenced effects are drift.
- **-004 Tool emergence.** Tool knowledge (commands, models, paths)
  enters only through the handler's DECLARED config (transport
  contracts, plans, env ingress). No tool name in handler code.
- **-005 Declared config only.** Handler parameters come from admitted
  declarations; ambient authority (globals, undeclared env, filesystem
  discovery) is a defect.
- **-006 Typed failure.** A handler throw IS a blocked outcome carrying
  the contract_failure class at both executor twins; the spine closes;
  the retry allowlist judges it. No handler error may kill a run.
- **-007 Idempotent evidence.** Evidence archives key on cCallRef;
  re-execution after resume must not duplicate or orphan evidence.
- **-008 Budget respect.** Handlers receive and honor the selected
  configuration's timeout/attempt envelope; overrun is a typed
  judgment, never a hang.

## Handler classes

- **-009 Pipeline handlers** (substrate-shipped standard set): realize
  the constructed interior — F_P agent-transport (manifest → transport
  → payload admission), F_D process-execution, F_D materialization,
  F_H gate. Products configure them by declarations only; the standard
  path ships zero downstream handler code.
- **-010 Capability handlers** (complete replacement): ONE handler is
  the entire interior — a declared outcall into a local downstream
  capability which itself declares its regime. All obligations hold;
  -003 especially: outcall effects are evidenced, never asserted.

## Program interpretation (the one seam)

- **-011 One seam.** Programs, catalogs, selections, and -017 ladders
  are consumed at exactly ONE interpretation point; the census derives
  from the admitted program; the baked bootstrap triple is the
  undeclared default. No second consumption path.
- **-012 Fail-closed interpretation.** An admitted-but-unresolvable
  selection (unknown programRef, unknown arm, missing handler binding)
  blocks the C call with a typed reason before any interior runs.
- **-013 Ladder semantics.** Attempt N's configuration is the ladder's
  declared rung for the observed signals; the selection row records the
  governing programRef (CCALL-017); escalation never skips declared
  rungs.
- **-014 Resume semantics.** Re-entry over persisted replay continues
  from the frontier (closed C calls stay closed). After a
  gap_stop(retry_budget_exhausted), a ratified resume opens a fresh
  attempt window under a DECLARED re-entry policy; replay-derived
  frontier state is never hand-edited.

## Non-closure

Weakened tests; a handler minting truth; a tool name in handler code;
unevidenced outcall effects; a second interpretation seam; a handler
throw killing a run; duplicated evidence after resume; glc adoption
before the ABG-internal everything-gate is green.
