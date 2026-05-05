---
id: T-117
title: Audit hidden defaults and externalize ABG defaults bundle
type: feature
ticket_category: default_policy_visibility
status: completed
completion_scope: plugin_traversal_observer_fallback_slice_plus_audit_inventory
goal: rc-next-visible-abg-defaults
change_class: design_reframe
re_entry_point: design
created_at: 2026-05-06T01:05:51+10:00
updated_at: 2026-05-06T02:14:45+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
affected_boundary:
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - build_tenants/abiogenesis/typescript/config/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/
  - build_tenants/abiogenesis/typescript/code/src/shared/
  - build_tenants/abiogenesis/typescript/test_env/tests/
related_tickets:
  - T-112
  - T-116
  - T-118
governing_requirements:
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run test:t117
  - npm run test:t116:live
intake_source: User asked whether ABG has a JSON configuration for universal fallbacks and then requested a ticket to review all hidden defaults and make them explicit in abg_defaults.
target_truth: ABG reference/default behavior is represented through a visible, versioned, editable `abg_defaults` bundle with digest/provenance, and runtime selections record when a default participates.
superseded_truth: Defaults live as scattered `??`, optional parameter fallbacks, prompt prose, local test conventions, or hidden runtime constants with no config path, bundle identity, or replay-visible provenance.
---

# T-117 Audit Hidden Defaults And Externalize ABG Defaults Bundle

## STDO Triage

### First Missing Layer

Design.

ABG already has requirement authority for editable reference default bundles:
`REQ-R-ABG3-POLICY-003` and `REQ-R-ABG3-POLICY-004`. The gap is a concrete
design and realization plan that inventories defaults and gives them one
visible configuration surface.

### Lawful Re-Entry

`design_reframe`.

Reprice requirements only if the audit finds default classes that current
policy/provenance/transport requirements do not cover.

## Problem

ABG has several lawful defaults, but many are currently implemented as local
constants, optional-field fallbacks, helper conventions, test harness defaults,
or prompt construction behavior.

That makes default behavior hard to inspect, customize, prove, or replay.

The product-method issue is not that defaults exist. The issue is hidden
defaults.

## Target Surface

Create one visible ABG defaults bundle family:

```text
abg_defaults
```

The first concrete member of that family is the fallback bundle used for
reference prompt/default behavior.

Shipped reference fallback bundle:

```text
build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json
```

Installed/editable fallback copy:

```text
.abiogenesis/config/abg.fallbacks.json
```

This ticket may still design a broader `abg_defaults` schema or index, but the
fallback paths above are accepted as the concrete Transform/Eval fallback
configuration surface. They are not a parallel hidden-default system.

Every default that can affect runtime behavior should be classed into one of
three buckets:

- `configurable_default`: visible in `abg_defaults` and overrideable.
- `code_constant`: internal invariant, not user-configurable, with reason.
- `test_only_default`: harness convenience, prohibited from production/runtime
  authority.

## Initial Audit Scope

Audit at least these hidden/default families:

- plugin traversal observer defaults for Transform and Eval;
- generic observer prompt refs and prompt template refs;
- traversal modulation absence/fallback behavior;
- retry and continuation default budgets or action choices;
- non-progress timeout-class retry mappings;
- transport executor defaults such as `local-spawn`;
- PTY defaults such as `screen`, terminal polling, and terminal session
  behavior;
- actor timeout, heartbeat, termination grace, and inactivity defaults;
- parser defaults and agent-specific parser inference;
- worker binding defaults such as `workerRef ?? agentKey`;
- trace/archive path defaults;
- environment sanitation default policy;
- resolved policy default bundle refs and default regime handling;
- installer defaults such as clean-target behavior and fallback CLI runtime
  binding;
- M04 request defaults such as `until`, max-autonomy modes, asset-addressing
  keys, and timeout values;
- qualification/live-test defaults that must remain test-only.

## Proposed Bundle Shape

Illustrative only:

```json
{
  "kind": "abg_defaults",
  "version": 1,
  "bundleRef": "abg-defaults://reference/typescript",
  "defaults": {
    "pluginTraversalObserver": {
      "transform": {
        "absenceLawful": true,
        "observerPromptRef": "prompt://abg/reference/generic-transform-observer",
        "promptTemplateRef": "template://abg/reference/generic-transform-observer",
        "promptInputContractRef": "contract://abg/plugin-traversal/transform-input",
        "expectedOutputContractRef": "contract://abg/plugin-traversal/transform-output"
      },
      "eval": {
        "absenceLawful": true,
        "observerPromptRef": "prompt://abg/reference/generic-eval-observer",
        "promptTemplateRef": "template://abg/reference/generic-eval-observer",
        "promptInputContractRef": "contract://abg/plugin-traversal/eval-input",
        "expectedOutputContractRef": "contract://abg/plugin-traversal/eval-output"
      }
    },
    "transport": {
      "executorProfile": "local-spawn",
      "timeoutMs": 1800000,
      "terminationGraceMs": 10000,
      "heartbeatMs": 30000
    }
  }
}
```

The exact schema is part of this ticket. The core rule is that the bundle is
data/config, not executable strategy code.

## Runtime Provenance

When a configurable default participates in a runtime decision, ABG shall
preserve:

- `defaultsBundleRef`
- `defaultsBundleDigest`
- `defaultsPath` when file-backed
- `defaultKey`
- selected value or selected value ref
- whether the default was overridden by GTL, runtime policy, install config, or
  explicit request input

This provenance may appear on resolved policy, prompt materialization,
transport invocation, projection, or a dedicated defaults-resolution event,
depending on the owning design slice.

## Acceptance Criteria

- A hidden-default audit exists for the TypeScript ABG tenant and distinguishes
  the RC2 closure slice from remaining `abg_defaults` expansion candidates.
- Each default is classified as `configurable_default`, `code_constant`, or
  `test_only_default`, or explicitly recorded as a follow-up candidate when the
  classification cannot close without a later design slice.
- `build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json`
  exists and is schema-validated as an `abg_defaults` fallback bundle member.
- Installed workspaces can carry an editable
  `.abiogenesis/config/abg.fallbacks.json`.
- ABG fails closed on malformed defaults config.
- ABG records bundle ref/digest when a configurable default participates in a
  runtime decision.
- T-116 plugin traversal observer fallback consumes `abg_defaults` rather than
  a separate hidden fallback bundle.
- Deterministic tests prove default load, override, malformed config, missing
  config, and runtime provenance behavior.
- Full externalization of transport, PTY, parser, timeout, worker-binding,
  trace-path, environment, retry, traversal-modulation, M04 request, and live
  harness defaults is tracked by T-118, not claimed by this ticket.

## Non-Closure Conditions

- Defaults remain scattered across runtime code with no inventory.
- Generic prompt fallback exists outside `abg_defaults`.
- Runtime behavior silently changes because an optional field was omitted.
- Defaults are configurable but not replay-visible.
- Test-only defaults can leak into runtime/product authority.
- Malformed defaults config silently falls back to embedded values.
- `abg_defaults` becomes executable policy logic rather than data/config.

## 2026-05-06 closure verification

Status: completed for the plugin traversal observer fallback slice and audit
inventory.

This ticket does not claim that every ABG default family has been externalized
into one universal defaults file. The remaining default families are visible
follow-up scope in T-118.

Implementation surfaces:

- `build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugin_traversal_observer.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer.ts`
- `build_tenants/abiogenesis/typescript/code/src/cli/command.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t117_abg_defaults_bundle.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_typescript_installer_integration.test.mjs`
- `.ai-workspace/comments/codex/20260506T012744Z_AUDIT_t117_abg_defaults_hidden-defaults.md`
- `.ai-workspace/tickets/backlog/T-118-complete-abg-defaults-bundle-expansion-after-plugin-observer-slice.md`

Commands run:

```text
npm run build:semantic
npm run lint:semantic
npm run lint:test-harness
npm run test:t117
npm run test:t116:live
npm run test:t111
npm run test:t097
```

Latest live proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The deterministic lane proves shipped bundle load, installed editable copy,
refresh preservation for local edits, public installed CLI loading,
override, malformed/missing/partial fail-closed behavior, and non-implicit
activation. The live matrix proves default fallback provenance participates in
runtime-visible prompt materialization when selected, and that custom
GraphVector plugin binding does not falsely carry fallback bundle provenance.
