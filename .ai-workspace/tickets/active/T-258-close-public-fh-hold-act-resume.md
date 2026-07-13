# T-258 - Close Public F_H Hold, Act, And Resume

- id: T-258
- status: active
- phase_status: implementation_authorized
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-257
- accepted_design: build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md
- fh_design_decision: .ai-workspace/comments/codex/20260713T151415Z_DECISION_delegated_fh_accept_t258_design.md

## Boundary

Close `fh_pending_runtime_hold` through one public typed interaction contract:
an F_H C call holds traversal, exposes lawful act/assess/answer/escalate input,
and resumes the same continuation without graph-success fabrication or caller-
owned orchestration.

## T-252 Census Gap Ownership

- gap_family: fh_pending_runtime_hold

## Entry And Exit

Author domain, sequence, and state views against the public SDK/CLI design and
obtain F_H acceptance. The unchanged T-252 body must stop at its F_H boundary;
public act and resume must cite the pending interaction, actor, capability,
continuation, result, and replay truth. Include one non-Consensus F_H fixture.

## Non-Closure

Returning escalation as graph success, a new Consensus CLI verb, shell-owned
continuation, ambient approval subject, scheduler, watcher, or ticket mutation.
