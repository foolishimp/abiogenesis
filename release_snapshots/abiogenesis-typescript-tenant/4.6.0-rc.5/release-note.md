# abiogenesis 4.6.0-rc.5 Release Candidate Note

It follows `4.6.0-rc.4` and publishes the 4.6 support-line candidate as one
immutable downstream-consumable cut. This is an RC publication, not the final
4.6.0 tap. The cut carries one bounded correction to the B-001 worker transport
family after a corporate downstream Claude run exposed that rc.4 declared the
capability lane without carrying it through the real dispatch path.

## RC5 correction: connect the declared lane end to end

- `AgentTransportRequest.lane` reaches the Claude argv composition used by
  `runAgentTransport`; the default remains `closed_prompt_proof`.
- Result classification applies the no-tool contract only to the closed-prompt
  lane. Tool activity in `worker_executes` remains process evidence and does
  not become a transport contract failure merely because execution occurred.
- The deterministic regression now crosses the real `runAgentTransport`
  subprocess, stream parser, tool-event counter, and classifier in both
  postures; it also checks the written transport artifact on the
  `worker_executes` path. The proof-only argv composer is not a published API.
- Downstream graph products remain responsible for deriving the lane from
  their declared execution-stage truth. This cut adds no graph semantics,
  scheduler, retry controller, or public operator verb.

## Retained B-001 transport contract

- The claude stream-json transport carries a declared capability lane.
  Closed-prompt proof dispatches stay tool-less (`--safe-mode --tools ""`).
  Worker-executes dispatches carry neither execution-gating flag, so the
  execution-default law ("run the declared command yourself in your turn") is
  satisfiable by an honest live worker. Both gating flags are lane-owned and
  protocol-owned: append configuration cannot reintroduce them.
- All four agent transport contracts admit bounded downstream command-line
  localization through `ABG_TS_<AGENT>_APPEND_ARGS` (a JSON array of argv
  entries). Protocol-owned flags and template placeholders are rejected
  fail-closed with governed diagnostics. Append entries land before the
  positional prompt/output placeholders for every agent shape.
- `ABG_TS_WORKER_SANDBOX=external` declares that worker sandboxing is provided
  by the environment (layered corporate/cloud sandboxes). Agent transports
  drop their own confinement; agent-specific bindings such as
  `ABG_TS_CODEX_SANDBOX` take precedence; unknown values fail closed. This
  retires the socket-binding failure class (services, forked test transports)
  for externally sandboxed installs.
- The m03 transport protocol proof is repriced from exact-argv equality to
  invariant assertions: required flags present, lane tool posture correct,
  prompt not leaked into argv, downstream extension permitted. A lawful
  downstream localization such as `--append-system-prompt` no longer diverges
  from the release-snapshot gate.

## Retained 4.6 substrate

The `4.6.0-rc.4` substrate is retained unchanged outside the B-001 boundary:
the T-217 witness/operator/observer/tuner substrate, capability-gated plugin
selection and admission, the finite R5 repair gate, T-219 specification
reconciliation, and the T-220 typed GTL and C authoring boundary with its
semantic compiler diagnostics and compiled execution-declaration handoff.

## Exact-cut evidence

The versioned release snapshot is the exact-cut proof carrier. Its manifest
records the clean source commit, semantic build, semantic lint, full semantic
suite summary, package identity, packed tarball identity, checksums, and this
RC note. Downstream qualification must consume that tarball rather than a
mutable source path.

Pre-snapshot proof beyond the deterministic gates crossed `runAgentTransport`
with a real Claude worker: the dispatched argv carried neither execution gate,
one tool call was observed, the command output returned, and failure
classification was null. Packed downstream qualification is a publication
gate for this candidate and is not pre-claimed by this embedded note.

## Predecessor lineage

The rc.3 and rc.4 qualification lineages remain valid predecessor evidence only
for the paths that actually ran on those cuts. In particular, rc.4 does not
qualify Claude execution-stage dispatch because its lane stopped before
`runAgentTransport`. The paired odd_glc qualification for rc.5 must be recorded
on the odd_glc support line before publication and remains outside this
immutable snapshot note.

## Explicit exclusions

- T-217 did not complete its original feature ticket. Its retained substrate
  closed through a superseded-and-split disposition with named successors.
- Declarations-only odd_glc adoption, the one-schema downstream worker result,
  the 11.5B audit, and the full data-mapper rerun remain odd_glc T-033 work.
- `workflow.C`, `C.batch`, and `C.retry` are lawful authored terms, but their
  complete runtime realization is not claimed by this cut.
- Live observer/tuner campaign closure, executable Review/Consensus
  composition, sticky sessions, and integrated zero-out-of-framework proof are
  not claimed.
- C-2 monolith splitting and C-6 barrel pruning are not release claims.
- ABG 5.0 catalog, graph shell, marketplace compatibility, public consumption,
  and self-hosting claims are outside this RC.
- Typed environment-capability-denial classification and ledger-admitted
  sandbox-posture escalation (the self-healing successor to the
  `ABG_TS_WORKER_SANDBOX` declaration) are named follow-up work for the 5.0
  line, not claims of this cut.

## Operating boundary

This RC targets one trusted developer desktop, or an externally sandboxed
install that declares `ABG_TS_WORKER_SANDBOX=external` and owns its own
confinement layers. Its defensive boundary is malformed authored GTL and
malformed, incomplete, or contradictory F_P output. It does not claim hostile
local-object, filesystem-tamper, hosted multi-tenant, or marketplace-service
hardening. Dropping agent confinement is lawful only under the external
declaration; the default posture keeps each agent's native sandbox.
