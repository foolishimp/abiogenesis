# Delegated F_H Decision: Accept And Close T-258

Date: 2026-07-13
Decision: accepted and closed
Implementation checkpoint: `8e71464`
Authority: the human owner delegated F_H authority to continue section by
section, self-review, remediate proportionately, and proceed until return

T-258 is accepted after implementation, adversarial self-review, bounded
remediation, and fresh proof at the recorded checkpoint.

The accepted boundary is one existing public F_H interaction. The five F_H
response operations and `run.resume` share one public invocation grammar, one
M03 lifecycle, canonical actor-attributed events, deterministic response and
resume identities, and replay-derived projection. Replay revalidates the same
semantic invariants as the live mutation path. Resume admission remains
nonterminal and preserves the startup fence.

The canonical T-252 body remains unchanged at
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
Its compiler-derived census no longer reports `fh_pending_runtime_hold` and
still reports eight successor gap families. The post-closure ownership read
model is sealed at
`sha256:258651ab60ce8af9da725b8d6efc56605505bd5517d799d76691c6e9e3ac59e7`.

This decision does not accept post-resume traversal, closure, automatic wake
control, multiple sequential interactions per GraphCall, universal tenant
response-schema execution, or multi-process event-store concurrency. T-267
retains traversal-result and bind-conservation authority. T-268 retains tenant-
conformance-manifest publication. T-259 through T-262 retain the generic C and
higher-order runtime atoms.

Evidence is recorded in
`.ai-workspace/comments/codex/20260713T162933Z_SELF_REVIEW_t258_public_fh_interaction.md`.
T-259 and T-267 are now eligible for dependency-aware triage; neither is
accepted by this decision.
