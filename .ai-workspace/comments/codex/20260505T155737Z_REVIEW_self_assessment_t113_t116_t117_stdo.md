# STDO Self-Assessment: T-113 / T-116 / T-117

Status: self-assessment for external review after accepted review repairs.

## Scope

Reviewed the completed ticket wave:

- `.ai-workspace/tickets/completed/T-113-fix-pty-screen-capability-probe-on-local-macos-screen.md`
- `.ai-workspace/tickets/completed/T-116-enable-gtl-plugin-traversal-observer-bindings-for-transform-and-eval.md`
- `.ai-workspace/tickets/completed/T-117-audit-hidden-defaults-and-externalize-abg-defaults-bundle.md`

Controlling method read:

- `specification_methodology/specification/standards/SPEC_METHOD.md`
- `specification_methodology/specification/standards/TICKET_METHOD.md`

## Findings

No blocking STDO defect found in the implemented RC2 slice after review
repairs.

High review finding accepted and repaired: T-116 prompt materialization identity
was previously not unique per materialization. The event factory now derives
`materializationRef` and `promptInputDigest` from bundle digest, actor/work
identity, causation, correlation, and selection basis. The live matrix asserts
four unique materialization refs and four unique input digests.

High review finding accepted and repaired: T-113 successful PTY actor process
starts previously carried terminal session id in trace artifacts but not in ABG
runtime event/projection truth. `ActorProcessStartedEvent`, admission, emission,
and projection now carry `terminalSessionId`; T-097 and T-113 assertions prove
successful PTY terminal id projection.

Medium review finding accepted and repaired: T-117 is closed only for the
plugin traversal observer fallback slice plus audit inventory. T-118 now owns
transport, PTY, timeout, parser, worker-binding, trace path, environment,
retry, traversal-modulation, M04 request, installer, and live-harness defaults
that were not externalized in this slice.

Medium review finding accepted and repaired: the installed editable fallback
config is preserved across installer refresh and is loaded by the public
installed CLI path. The installer test mutates the installed config, proves
refresh preservation, and proves public `genesis-ts gaps` fails closed on a
malformed edited bundle.

Medium residual risk: T-116 acceptance names both Transform and Eval, but the
live matrix proof exercises Transform. Eval is covered deterministically through
selection/input exposure and fallback-bundle validation, not by a live Eval
worker/evaluator traversal. This is acceptable for the current ticket closure
only if reviewers agree that live proof was requested for actor/default/custom
plugin completeness in the Transform actor-worker path. If Eval requires live
agent proof, open a follow-up ticket instead of broadening these completed
tickets silently.

Medium residual risk: T-117 is closed for the first live `abg_defaults` member,
the plugin traversal observer fallback bundle. The audit explicitly leaves
transport executor defaults, PTY timing defaults, parser inference, environment
sanitation, retry budgets, and M04 defaults as T-118 scope. This is not an RC2
closure defect because the ticket closure text now states the bounded slice,
but reviewers should reject any release note claiming every ABG default has
already been externalized.

Low residual risk: T-113 deterministic coverage proves the PTY executor success
path and timeout/inactivity behavior through `test:t111`, and live coverage
proves the local macOS `screen` path. It does not deterministically fixture all
failure classifications for every incompatible `screen` shape. The ticket text
keeps that as a future regression requirement if the probe is refactored again.

Low hygiene issue: the repo worktree contains unrelated dirty and untracked
files from the surrounding crash-recovery wave. The ticket-specific work is
reviewable, but reviewers should scope their review to the T-113/T-116/T-117
surfaces rather than treating the full dirty tree as one coherent change.

## STDO Assessment

Lawful re-entry was declared and followed.

- T-113 uses `realization_refactor`; it repaired the PTY executor/probe behavior
  without repricing the public transport model.
- T-116 uses `design_reframe`; it introduced a declared GTL hook/config
  convention and ABG materialization path instead of hiding prompt selection in
  runtime prose or worker labels.
- T-117 uses `design_reframe`; it externalized the first visible defaults bundle
  member and recorded the broader default audit without claiming universal
  completion.

Authority direction is preserved. GTL declarations carry observer-binding
truth, ABG resolves and materializes runtime prompt/provenance truth, and the
JSON fallback bundle is data/config rather than executable policy logic.
Worker identity, backend transport, and actor labels remain runtime/test
surfaces, not GTL law.

Ticket authority was updated. The three tickets now live under
`.ai-workspace/tickets/completed/` and carry closure evidence with command names
and proof paths. This matches `TICKET_METHOD.md`: tickets are durable status
authority, while this comment is review publication.

## Evidence Reviewed

Focused commands run during closure:

```text
npm run build:semantic
npm run lint:semantic
npm run lint:test-harness
npm run test:t111
npm run test:t087
npm run test:t116
npm run test:t117
npm run test:t116:live
git diff --check
```

Latest live proof summary:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The live proof records:

```text
defaultPluginActorEnabled
defaultPluginActorDisabled
customPluginActorEnabled
customPluginActorDisabled
```

The actor-disabled rows carry `actorInvocationId: null`. Default-plugin rows
carry `fallback-bundle://abg/reference/typescript` and its digest. Custom-plugin
rows resolve through `graph_vector_declarations` and carry no fallback bundle
digest.

## Recommendation

Accept the T-113/T-116/T-117 slice as complete under STDO for the stated
scope. Accept RC2 only if the release note keeps the bounded claim: PTY runtime
event/projection repair, plugin traversal observer materialization/provenance,
installed fallback config proof, and a visible T-118 follow-up for remaining
defaults. Do not broaden the release claim to universal default
externalization or live Eval traversal proof.
