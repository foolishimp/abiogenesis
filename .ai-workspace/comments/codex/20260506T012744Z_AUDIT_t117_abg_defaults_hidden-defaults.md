# T-117 ABG Defaults Hidden-Default Audit

Status: implemented first live slice; broader defaults expansion tracked by
T-118.

## Governing Rule

ABG defaults may exist, but product-affecting defaults must be visible,
schema-validated, overrideable where lawful, and replay-visible when they
participate in runtime behavior.

The first live `abg_defaults` member is:

```text
build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json
.abiogenesis/config/abg.fallbacks.json
```

The bundle is data/config. It does not execute prompt rendering, select a
worker, select transport, close traversal, or enable an observer by itself.

## Classification

| Default family | Classification | Current disposition |
| --- | --- | --- |
| Transform plugin traversal observer prompt fallback | `configurable_default` | Live in `abg.reference-fallbacks.json`; loaded with ref/digest; opt-in by traversal kind. |
| Eval plugin traversal observer prompt fallback | `configurable_default` | Live in `abg.reference-fallbacks.json`; loaded with ref/digest; opt-in by traversal kind. |
| Generic observer prompt refs/template refs/contracts | `configurable_default` | Visible in fallback bundle; user-editable installed copy is copied to `.abiogenesis/config/abg.fallbacks.json`. |
| Observer fallback activation | `configurable_default` | Runtime option, not implicit. `pluginTraversalObserverFallbackKinds` enables only named traversal kinds. |
| GTL observer qualifier precedence | `code_constant` | GraphVector, then GraphFunction, then Role, then opt-in `abg_defaults`; this is method/order law, not user preference. |
| Malformed qualifier or fallback bundle behavior | `code_constant` | Fail closed. No silent fallback to embedded prompt behavior. |
| Prompt materialization provenance | `code_constant` | Event/projection law records selected prompt refs, rendered prompt ref, input digest, bundle ref/digest/path, causation, and correlation. |
| Transport executor default such as `local-spawn` | `configurable_default` candidate | Not externalized in this slice; remains listed for next `abg_defaults` expansion. |
| PTY command/poll/session defaults | `configurable_default` candidate | Not externalized in this slice; T-113 proves PTY behavior but does not move these defaults. |
| Actor timeout, heartbeat, termination grace, inactivity defaults | `configurable_default` candidate | Not externalized in this slice. |
| Parser inference such as Claude stream JSON vs generic text | `configurable_default` candidate | Not externalized in this slice. |
| Worker binding fallback such as `workerRef ?? agentKey` | `configurable_default` candidate | Not externalized in this slice. |
| Trace/archive path defaults | `configurable_default` candidate | Not externalized in this slice. |
| Environment sanitation policy defaults | `configurable_default` candidate | Not externalized in this slice. |
| Retry/continuation budgets | `configurable_default` candidate | Not externalized in this slice; existing T-106/T-107 proof remains intact. |
| Traversal modulation local defaults | mixed `code_constant` and `configurable_default` candidates | Existing GTL qualifier path remains; deeper default externalization is future work. |
| M04 request defaults such as `until`, max-autonomy mode, asset-addressing keys | mixed `code_constant` and `configurable_default` candidates | Not externalized in this slice. |
| Live-test agent/env defaults | `test_only_default` | Must stay in test harness and not become product runtime authority. |

## Closure For This Slice

This slice closes the hidden-default defect for plugin traversal observer
fallbacks, which are the active T-116/T-117 pressure point.

It does not claim every historical runtime default has been moved into one
universal file. The remaining candidate rows are now visible backlog scope in
`T-118-complete-abg-defaults-bundle-expansion-after-plugin-observer-slice`
rather than hidden closure claims.

## Review Feedback Repair

External STDO review correctly found that the original T-117 closure language
could be read as full default externalization. The completed ticket has been
narrowed to the plugin traversal observer fallback slice plus this audit
inventory, and T-118 now owns the remaining default families.

The installed editable fallback config also now has concrete runtime proof:

- installer refresh preserves local edits to `.abiogenesis/config/abg.fallbacks.json`;
- generated installed CLI runtime binding points at that file;
- public `genesis-ts gaps` loads the installed config and fails closed on a
  malformed edited bundle.

## Live Matrix Proof

Latest summary:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The summary records:

```text
defaultPluginActorEnabled
defaultPluginActorDisabled
customPluginActorEnabled
customPluginActorDisabled
```

The default-plugin rows carry `fallback-bundle://abg/reference/typescript` and
the bundle digest. The custom-plugin rows resolve through
`graph_vector_declarations` and carry no fallback bundle digest. The
actor-disabled rows carry `actorInvocationId: null`.

## Proof

```text
npm run build:semantic
npm run lint:semantic
npm run lint:test-harness
npm run test:t116
npm run test:t117
npm run test:t116:live
npm run test:t113:live
npm run test:t115
npm run test:t097
npm run test:t087
npm run test:t106
npm run test:t107
npm run test:t111
git diff --check
```
