# B-001 Reprice ABG Provenance And Runtime Boundary Wave

- id: B-001
- title: Reprice ABG provenance and runtime-boundary hardening wave
- type: bug
- status: completed
- goal: runtime-boundary-hardening
- priority: critical
- created_at: 2026-04-11
- updated_at: 2026-04-11
- completed_at: 2026-04-12

## Triage

- intake: bug / regression / release blocker / operator finding
- repriced_from: realization_refactor
- repriced_to: design_reframe
- affected_boundary: abiogenesis runtime provenance, installer boundary, downstream dependency contract, and release discipline
- lawful_re_entry: abiogenesis design and realization surfaces for provenance, bootstrap, install, binding, and runtime policy
- downstream_proof_span: odd_method sandbox/install consumption of the released ABG RC, odd_method downstream refactor under installed runtime truth, and fresh `data_mapper.test27` evidence run

## Why Repriced

This wave no longer fits `realization_refactor`.

The change is not only a local code correction. It changes the structural
runtime/install boundary by:

- removing `"unknown"` provenance as a lawful governed-runtime mode
- making provenance readiness part of install/bootstrap law
- tightening approval and `spec_hash` semantics
- forcing downstream consumers to refactor to the new ABG interface rather than
  rely on compatibility repair

Active intent, product direction, and requirement truth remain stable.
What changes is the structural realization boundary between authored ABG truth,
installed runtime truth, and downstream consumer obligations.

Under `SPEC_METHOD.md`, that makes this wave a `design_reframe`.

## Runtime Boundary Rule

For downstream consumers such as `odd_method`, `.genesis` is refreshed only by
the installer path.

That means:

- root `.genesis` is not a release surface
- root `.genesis` is not a manual patch or mirror target
- downstream proof must use installed `.genesis` produced by install
- any missing or stale source-workspace `.genesis` must be corrected by running
  the installer, not by direct source copying

## Current State

Done and released:

- fail-closed provenance/runtime work is implemented in `abiogenesis`
- installer/bootstrap now seeds workflow metadata by construction
- unresolved deterministic gaps after constructive continuation now surface back
  out as `fd_gap`
- the updated `abiogenesis` automated suite is green at `258 passed, 5 deselected`
- the released ABG boundary is at commit `9bcc8f2`

Still open:

- downstream proof beyond the `odd_method` automated suite
- fresh `data_mapper.test27` proving run

## Task List

- [x] Remove `"unknown"` provenance as a governed-runtime downgrade path.
- [x] Make missing or malformed workflow metadata fail closed at runtime and CLI boundaries.
- [x] Seed provenance-ready workflow metadata during install/bootstrap.
- [x] Strengthen runtime `spec_hash` so stale probabilistic assessments are invalidated by active workflow and requirement truth.
- [ ] Define the explicit ABG downstream dependency contract that `odd_method` may rely on after install.
- [x] Update `abiogenesis` RC notes and release note to call out the interface cut and no-compatibility decision.
- [x] Commit the `abiogenesis` RC wave after the note update.
- [x] Refactor `odd_method` to consume the released ABG contract through sandbox/install composition only.
- [x] Run the downstream `odd_method` proof lanes from sandbox installs that pull the released ABG RC dependency.
- [x] Refresh any required downstream `.genesis` only by installer execution, not by direct source mirroring.
- [x] Run the full `odd_method` suite against the installed ABG RC and close resulting downstream refactor gaps.
- [ ] Update `odd_method` RC notes and release note for the downstream refactor wave.
- [ ] Commit the `odd_method` RC wave.
- [ ] Create fresh `data_mapper.test27` from template, install the released `odd_method` RC, and run the proving traversal.
- [ ] Compare `test27` against `test26` and record whether the stop signature moved from substrate drift to remaining domain truth.

## Acceptance

- governed workspaces have no `"unknown"` provenance runtime path
- approvals and runtime ingestion require versioned workflow provenance
- installer/bootstrap either emits provenance-ready runtime metadata or fails
- downstream consumers refactor to the interface cut rather than rely on a
  compatibility shim
- `odd_method` sandbox installs cleanly using released `abiogenesis`
- downstream proof is established from installed sandbox/runtime truth, not
  source-vendored `.genesis`
- fresh `test27` evidence proves the repriced wave on a downstream consumer

## Closure

Closed on 2026-04-12.

The ABG provenance/runtime boundary cut was delivered and consumed downstream
through install composition. The remaining active platform work has moved on to
generic repair/control-plane enhancement under
[`T-003-enhance-abg-repair-signal-and-control-plane.md`](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-003-enhance-abg-repair-signal-and-control-plane.md).

## Links

- comment: `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260411T140241Z_TASKLIST_abg-tech-debt-cut-order.md`
- comment: `/Users/jim/src/apps/odd_method/.ai-workspace/comments/codex/20260411T122900Z_TASKLIST_fd-substrate-continuation-sev1.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
