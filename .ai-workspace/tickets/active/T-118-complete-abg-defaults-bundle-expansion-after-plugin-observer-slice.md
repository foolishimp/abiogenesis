---
id: T-118
title: Complete ABG defaults bundle expansion after plugin observer slice
type: feature
ticket_category: ordinary
status: active
proof_status: partial_m04_proven_remaining_defaults_open
goal: rc-next-visible-abg-defaults
change_class: design_reframe
re_entry_point: design
created_at: 2026-05-06T02:14:45+10:00
updated_at: 2026-06-07T21:00:00+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
priority: medium
build_tenant: typescript
depends_on:
  - T-117
related_tickets:
  - T-110
  - T-111
  - T-113
  - T-116
affected_boundary:
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - build_tenants/abiogenesis/typescript/config/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/
  - build_tenants/abiogenesis/typescript/code/src/shared/
intake_source: External STDO review accepted the T-117 plugin traversal observer fallback slice but found that the ticket overclaimed complete default externalization.
target_truth: All product-affecting ABG defaults are classified as configurable defaults, internal code constants, or test-only defaults, and every configurable runtime default has visible config/provenance or an explicit non-configurability reason.
superseded_truth: Runtime defaults remain hidden as optional-field fallbacks, local constants, prompt prose, test harness convention, or installer behavior without a durable defaults-bundle decision.
---

# T-118 Complete ABG Defaults Bundle Expansion After Plugin Observer Slice

## STDO Triage

### First Missing Layer

Design.

T-117 externalized the plugin traversal observer fallback bundle and proved
runtime provenance for that first `abg_defaults` member. The remaining default
families still need a design slice that decides which values become
configurable defaults and which remain internal invariants or test-only
conventions.

### Lawful Re-Entry

`design_reframe`.

Do not move hidden defaults directly into code. First declare the defaults
family, classification, precedence, file/install surface, and replay-visible
provenance rule.

## Scope

Audit and close the remaining default families left visible by T-117:

- transport executor defaults such as `local-spawn`;
- PTY command, capability probe, polling, and terminal session defaults;
- actor timeout, heartbeat, termination grace, and inactivity defaults;
- parser inference such as Claude stream JSON versus generic text;
- worker binding fallbacks such as `workerRef ?? agentKey`;
- trace and archive path defaults;
- environment sanitation policy defaults;
- retry, continuation, and non-progress budget defaults;
- traversal modulation local defaults;
- M04 request defaults such as `until`, max-autonomy mode, asset-addressing
  keys, and timeout values;
- installer refresh defaults not already closed by T-117;
- live-test and harness defaults that must remain `test_only_default`.

## Acceptance Criteria

- Each family above is classified as `configurable_default`, `code_constant`, or
  `test_only_default`, with a reason when not configurable.
- Every `configurable_default` has a visible bundle/config path and schema
  admission rule.
- Runtime decisions that consume configurable defaults record bundle ref,
  digest, config path when file-backed, selected key, and override source.
- Installed workspaces preserve user-editable default config across refreshes
  for every installed config file added by this ticket.
- Malformed defaults config fails closed; missing optional config follows a
  declared absence law.
- Deterministic tests prove load, override, malformed, missing, refresh, and
  projection/provenance behavior for every closed family.
- Any live-lane defaults remain test-only and cannot become runtime authority.

## Defaults Audit And Completion Checklist (2026-06-07)

**Status: partial — early.** The `abg_defaults` bundle mechanism and provenance
pattern exist, with two externalized members:

- `config/abg.reference-fallbacks.json` — T-117 plugin traversal observer
  fallback (`abgDefaultsFamily: abg_defaults`, `bundleRef`,
  transform/evaluate/consequence bindings).
- `config/gtl.target-carrier-defaults.json` — target-carrier defaults.

The §Scope families below are still in the superseded (hidden) state — local
constants, raw `??` fallbacks, or inline heuristics with no bundle or
provenance — and are unclassified. T-118 is essentially unstarted beyond T-117's
first member.

### Per-family audit + classification

Classify each `CD` (configurable_default), `CC` (code_constant, with reason), or
`TO` (test_only_default). The proposed class is a starting decision for the
`design_reframe`, not ratified.

| # | Family | Observed today (file:line) | Proposed class |
| --- | --- | --- | --- |
| 1 | actor timeout / termination grace / heartbeat | `transport/process_actor.ts:82-84` (`DEFAULT_TIMEOUT_MS=30m`, `…GRACE_MS=10s`, `…HEARTBEAT_MS=30s`) | CD |
| 2 | actor inactivity | `transport/process_actor.ts:250` (`inactivityTimeoutMs = request.inactivityTimeoutMs` — request-carried, no local default; origin upstream) | CD (decide default origin) |
| 3 | retry / continuation / non-progress budgets | `runner/attached_fp_worker.ts:43` (`DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS=3`) | CD |
| 4 | transport executor default | `shared/traced_process/index.ts:708` (`executorProfile ?? "local-spawn"`) | CD |
| 5 | PTY supervisor grace / terminal-lost / inactivity / session | `shared/traced_process/index.ts:424-425` (`TERMINAL_LOST_GRACE_MS=5s`, `PTY_AGENT_SUPERVISOR_DECISION_GRACE_MS=5s`); profiles `:24` | CD |
| 6 | parser inference (claude stream-json vs text) | `transport/process_actor.ts:97-99` (`includes("stream-json")`) | CC? |
| 7 | worker binding fallback | `shared/abg_library/agent_transport.ts:224` (`workerRef ?? contract.agentKey`) | CC? |
| 8 | trace / archive path defaults | `agent_transport.ts:221` (`traceRoot ?? defaultPath(".trace")`); `workspace_zoom_foldback.ts:411` (`.ai-workspace`) | CD/CC |
| 9 | env sanitation policy | `transport/admission.ts:103` (contract-carried); default policy/prefixes | CD+CC |
| 10 | traversal modulation local defaults | `contracts/traversal_modulation.ts:55` (`…DEFAULT_ATTR_KEYS`) | CD/CC |
| 11 | M04 request defaults (`until`, `fh_mode`, `root_mode`) | `app/m04/max_autonomy/admission.ts:38,42` (`until ?? "converged"`, `fh_mode ?? "direct"`); `gaps/projection.ts:236` | CD |
| 12 | installer refresh defaults not closed by T-117 | `app/m04/install_bootstrap/` | CD |
| 13 | live-test / harness defaults | `test_env/` | TO |

### Complete each `configurable_default` family

- [ ] declared in an `abg_defaults` bundle member with `bundleRef` + version (extend `abg.reference-fallbacks.json` or add a bundle file)
- [ ] schema admission: malformed config fails closed; missing-optional follows a declared absence law
- [ ] consuming runtime decision records provenance: `bundleRef`, `digest`, config path (if file-backed), selected key, override source
- [ ] installed-workspace refresh preserves user edits to the new config file
- [ ] deterministic tests: load · override · malformed · missing · refresh · projection/provenance

### Complete each `code_constant` / `test_only_default` family

- [ ] CC: record the non-configurability reason at the constant
- [ ] TO: mark `test_only_default` and guard it cannot enter product runtime config (non-closure §3)

### Design decision that must precede any code move (the `design_reframe`)

- [ ] ratify the class column (CD/CC/TO + reasons) — §First Missing Layer requires declaring the family, classification, precedence, file/install surface, and replay-visible provenance rule **before** moving hidden defaults into code
- [ ] decide default-origin for request-carried defaults (e.g. #2 actor inactivity is `request.inactivityTimeoutMs`, #4 transport executor is `request.executorProfile ??`): whether the default seeds from the `abg_defaults` bundle or remains a declared caller obligation, and where provenance is recorded for each

### Closure gate

- [ ] every family carries a ratified class with reason (AC-1)
- [ ] no runtime-affecting default remains an unclassified `??`, local constant, prompt prose, or installer side effect (non-closure §1)
- [ ] no configurable default affects behavior without replay-visible provenance (non-closure §2)
- [ ] T-117 plugin-observer fallback behavior does not regress (non-closure §4)

## Ratified Bundle Design (design_reframe gate — 2026-06-07)

This is the design slice §First-Missing-Layer requires before any value moves into code.

### Classification framework

- `configurable_default` (CD): may be overridden via an `abg_defaults` bundle member; the in-code constant remains as the **absence-law default** used when no bundle/config is present.
- `code_constant` (CC): internal invariant, not configurable; reason recorded at the constant.
- `test_only_default` (TO): exists only for tests; guarded against entering product runtime config.

### Precedence (CD families)

`explicit request/config value > admitted bundle member value > in-code absence-law constant`

The in-code constant never changes value — it is the absence law, not a duplicate truth. The bundle only overrides. This preserves behavior by construction and satisfies the "missing optional follows a declared absence law" AC and the no-T-117-regression non-closure for free.

### Bundle + file/install surface

One bundle file per concern under `config/`, admitted by a family `admit…Bundle` + `load…FromFile` + `resolve…Path` following the T-117 / target-carrier-defaults pattern (`plugin_traversal_observer.ts:476/543`, `target_carrier_contract.ts:685/739/749`). Installed workspaces preserve user edits to each new config file across refresh.

### Provenance rule

A runtime decision that consumes a CD records `bundleRef`, `bundleDigest`, config path (when file-backed), selected key, and override source (`request | bundle | absence_law`).

### Steel-thread family ratified: M04 request defaults

- **Family / class:** M04 request defaults (`until`, `fh_mode`) — `configurable_default`.
- **Absence law:** the existing `?? "converged"` / `?? "direct"` constants (`max_autonomy/admission.ts:38,42`).
- **Bundle:** `config/abg.m04-request-defaults.json` (kind `abg_m04_request_defaults_bundle`).
- **Chosen first** because it is pure admission logic, deterministically testable (load/override/malformed/missing/precedence/provenance) without a live worker run. The actor-runtime-timeout family (#1) is high value but requires live-lane behavior proof, so it follows this steel thread.

Remaining audit-table families inherit this framework and are ratified per-family as implemented.

## Unified Lever Registry Realization (2026-06-07)

The per-family bundle approach is superseded by a single **unified lever
registry** (user decision: "one stop shop … visibility and consistency win").
The registry is the single governance + visibility source of truth; it is a
leaf module that mirrors values by default, so consumption sites keep their
literals and a golden-equality test pins `registry value === live constant`.
Current runtime behavior is preserved exactly (user decision: keep behavior).

### Landed

- `shared/lever_registry/registry.ts` — all 32 product-affecting defaults
  declared under dotted keys (`abg.transport.actor.timeout_ms`, …) with class,
  value, reason, consumed-at. This is the ratified classification (the
  `design_reframe` deliverable).
- `shared/validation/governed_enums.ts` — `parseUntil` / `parseFhMode` /
  `parseRootMode` extracted to one leaf; the start-intent gate
  (`abg/m03/admission/carriers.ts`) and control-mode gate
  (`app/m04/admission/public_start.ts`) now import it, so the override admitter
  validates against the SAME allowed-set (closes the schema-drift hole).
- `shared/lever_registry/overrides.ts` — registry-keyed override bundle;
  fail-closed at load (unknown key, fixed-lever key, or out-of-enum value
  rejected); `request > override > registry-default` precedence with provenance.
- **Single consolidated config file** `config/abg.config.json` (installed at
  `.abiogenesis/config/abg.config.json`) holds three sections — `levers`,
  `fallbacks` (T-117), `targetCarriers` — replacing the three separate files.
  `shared/abg_config/load.ts` is a leaf returning raw sections; each existing
  loader (lever, fallback, target-carrier) reads its section and hands it to its
  own admitter, so admission/behavior is unchanged. Each loader keeps its prior
  resolution semantics (fallback: installed-workspace-only; lever/targetCarrier:
  installed → package → walk-up).
- M04 request defaults (`until`, `fh_mode`) wired through the production path
  (`callable_start.ts` → context → admission), and the CLI start path now
  resolves `fh_mode` through the bundle when `--fh-mode` is omitted
  (`runStartCommand`) — removing the parallel CLI default that previously made
  the override inert on installed CLI starts. Deterministic consumption tests
  prove the override is consumed (`test_t118_override_consumption`).
- `gen-config` CLI projection prints the full tree with per-row source
  (`registry-default` vs `config-override`).
- Installer copies + refresh-preserves the single `abg.config.json`.

### Classification (tunable = operator-overridable; fixed = internal/structural)

- `tunable / live`: `abg.m04.until`, `abg.m04.fh_mode` (override + behavior wired).
- `tunable / deferred`: actor timeouts/grace/heartbeat, retry budget, executor
  profile, PTY graces + parser/screen/TERM, traversal-modulation budgets.
  Surfaced + classified; override/event wiring deferred — behavior is verifiable
  only under the live actor/PTY harness (currently blocked).
- `fixed`: structural `?? seed` defaults (vector index, generation, scores,
  weights, severity, saga lease/release), `regime ?? "F_D"`, and the derived
  `root_mode` rule. Surfaced for visibility; no override path (config keyed to a
  fixed lever fails closed).

### M04 closure update (2026-06-07)

- **Replay-event provenance closed:** callable-start admission now carries the
  resolved `M04RequestDefaultsResolution` on `PublicCallableStartRequest`, and
  `publicCallableStartFromRequest` emits a canonical
  `lever_resolution_admitted` runtime event before the control loop runs.
- The event is admitted through the M03 `RuntimeEvent` union and
  `RUNTIME_EVENT_ADMITTERS`; aggregate projection and retry-frontier replay
  treat it as an explicit observational no-op.
- The event records the consumed workspace/module/target, resolved `until`,
  `fhMode`, `rootMode`, runtime/policy refs, bundle ref/digest/path, selected
  lever keys, and source for each live M04 lever (`request`, `override`, or
  `registry_default`).
- The CLI start handoff no longer pre-expands omitted `fh_mode`; omitted CLI
  flags reach callable-start admission as omitted fields so the event reports
  the true override/default source.
- Deferred live-lane levers remain classified and visible in the registry with
  explicit `wiring: "deferred"` reasons. They are not accepted by the override
  bundle until their live actor/PTY/traversal harness work is undertaken; a
  config key for a non-live lever still fails closed.

### root_mode — ratified by requirement_reprice (2026-06-07)

- `root_mode` default `supervised`-on-`converged` is now **product law**:
  REQ-P-POLICY-013 and PRODUCT.md repriced so `supervised` is the converged
  default (`direct` is the opt-out). The old `direct` default is deleted, not
  kept as a compat path (CLI included). The supervised-on-converged rule is
  single-sourced in `defaultRootMode` (`shared/validation/governed_enums.ts`),
  applied by the governed control-mode gate (`admitPublicControlModes`); the
  duplicate defaults in `admission.ts` and the CLI are removed.

### Codex review resolutions (2026-06-07)

- **README contradiction** — fixed: `README.md` repriced to `fh_mode` defaults
  `direct`, `root_mode` defaults `supervised` (was contradicting REQ-P-POLICY-013).
- **Registry completeness** — fixed: added the missing families (asset-addressing
  field-key defaults, worker ref-fallback, trace root suffix, env sanitation
  policy, parser inference) as `fixed` levers → 43 levers; the header no longer
  claims provable exhaustiveness.
- **`abg.m04.until` CLI scope** — clarified: the CLI requires `--until`
  (REQ-P-POLICY-009), so the `until` lever governs only the programmatic
  max-autonomy callable-start, not the CLI; recorded in the lever reason.
- **Config-section resolution asymmetry — intentional, not a defect:** the
  `levers` and `targetCarriers` sections resolve installed → package → walk-up
  (shipped defaults must always apply, and target-carrier is required); the
  `fallbacks` section is installed-workspace-only and returns null when absent
  (an installed workspace with an absent fallback config must not silently
  inherit package plugin-observer bindings — `command.ts` `loadCliFallbackBundle`).
- **CLI output** — already correct: the start output reports the resolved
  `controlModes.fhMode/rootMode`, not the raw flags.

## Non-Closure Conditions

- A runtime-affecting default remains as an unclassified `??`, local constant,
  prompt prose convention, or installer side effect.
- A configurable default can affect behavior without replay-visible
  provenance.
- A test harness default is copied into product runtime config without explicit
  policy authority.
- T-117 plugin traversal observer fallback behavior regresses while expanding
  the broader defaults bundle.

## Closure Evidence (2026-06-07)

- `npm run build:semantic` — passed.
- `node --test test_env/tests/test_t118_lever_registry.test.mjs test_env/tests/test_t118_lever_overrides.test.mjs test_env/tests/test_t118_override_consumption.test.mjs test_env/tests/test_m04_complete_start_surface_integration.test.mjs test_env/tests/test_m04_cli_binary_integration.test.mjs` — passed, 22/22, 0 todo.
- `test_t118_override_consumption` proves the `lever_resolution_admitted` event
  is replay-visible and carries bundle ref, digest, selected keys, and source.
