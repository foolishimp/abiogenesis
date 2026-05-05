# abiogenesis 3.5.0-rc.2 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the RC identity from `3.5.0-rc.1` to `3.5.0-rc.2`.

It is an RC candidate, not the final tapped `3.5.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
accepts the T-113/T-116/T-117 repair wave over the rc.1 traced call-out and PTY
substrate.

RC2 adds:

- successful PTY actor process start events and projections carry
  `terminalSessionId`, not only trace-local terminal evidence;
- plugin traversal observer prompt materialization is replay-visible and unique
  per materialization, including config digest, actor/work identity, causation,
  and correlation in the materialization identity;
- Transform plugin traversal observer bindings resolve from GTL declarations or
  from the explicit ABG fallback bundle when fallback is enabled;
- live proof covers enabled actor and disabled actor paths with both default
  plugin fallback and custom GraphVector plugin binding;
- the first `abg_defaults` member is the reference plugin traversal observer
  fallback bundle;
- installed workspaces receive an editable `.abiogenesis/config/abg.fallbacks.json`
  copy, preserve local edits across refresh, and load that config through the
  public installed CLI path.

## Non-Claims

T-117 is closed only for the plugin traversal observer fallback slice plus
audit inventory. RC2 does not claim every historical runtime default has been
externalized. T-118 owns the remaining defaults expansion.

Sticky-session reuse, warm agent pools, and automatic session affinity remain
future T-110 work.

## Versioned Artifacts

- RC branch: `rc/3.5.0`
- RC identity: `3.5.0-rc.2`
- Candidate package version: `3.5.0-rc.2`
- Candidate tag: `v3.5.0-rc.2`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:t087
4 passed

npm run test:t097
5 passed

npm run test:t106
14 passed

npm run test:t111
4 passed

npm run test:t115
6 passed

npm run test:t116
5 passed

npm run test:t117
8 passed

npm run test:t116:live
1 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.5.0-rc.2, files 321, package abiogenesis-typescript-tenant-3.5.0-rc.2.tgz
```

Fresh RC2 live proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The live matrix records:

```text
defaultPluginActorEnabled
defaultPluginActorDisabled
customPluginActorEnabled
customPluginActorDisabled
```

The disabled rows carry `actorInvocationId: null`. Default-plugin rows carry
`fallback-bundle://abg/reference/typescript` and its digest. Custom-plugin rows
resolve through `graph_vector_declarations` and carry no fallback bundle digest.
The four prompt materialization refs are unique in the live matrix.

## RC Decision

The release operator requested RC2 after external review. The review findings
were accepted and repaired before the cut. Cut `v3.5.0-rc.2` as a
release-candidate checkpoint. This is not the final tapped `3.5.0` release.
