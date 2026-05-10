# B-032 Restore Typed Workspace Install Event For Python Parity

- id: B-032
- title: Restore typed workspace install event for Python parity
- type: bug
- ticket_category: ordinary
- status: completed
- build_tenant: typescript
- goal: restore-typed-install-audit-parity
- change_intent: Restore the install-time admitted runtime event the Python line emitted as `genesis_installed`. ABG's typed `RuntimeEvent` union had no install kind, so TypeScript installs left `events.jsonl` empty even though install was successful. The repair adds the missing typed carrier so downstream installers (odd_sdlc TS) can emit admitted install truth onto the runtime event log.
- change_class: realization_refactor
- re_entry_point: code
- triaged_at: 2026-05-10
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-05-10
- updated_at: 2026-05-10
- completed_at: 2026-05-10
- dependencies: []
- affected_boundary:
  - `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
  - `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts`
  - `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
  - `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts`
  - `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts`
  - `build_tenants/abiogenesis/typescript/test_env/`
- intake_source: Operator-observed regression on a fresh `data_mapper.test71.TS.cl` install. The Python line historically emitted a `genesis_installed` event into `.ai-workspace/events/events.jsonl` at install time. The TypeScript line wrote an empty `events.jsonl` because ABG's typed `RuntimeEvent` union had no install kind, leaving `assertRuntimeEvent` unable to admit any install-shaped record. Replay tooling that depended on event-log presence saw a workspace with no provenance for how it got into its installed state.
- target_truth: ABG's typed `RuntimeEvent` union admits `workspace_installation_admitted` as a first-class runtime event kind. Downstream installers can emit this event through `appendOddSdlcRuntimeEvents` (or any equivalent typed-event append path) and have it pass `assertRuntimeEvent`. The event carries enough metadata for replay-time reconstruction of install provenance: `installResult`, `targetRoot`, `packageName`, `packageVersion`, `resolvedRuntimeRef`, `installManifestPath`, `installerEcosystem`, `causationEventRefs`, `correlationId`.
- superseded_truth: Install was treated as a pre-runtime concern that lived only in `install-manifest.json` / `install-provenance.json`, with no admittance into the typed runtime event log. This left A13 (Replayability) silently violated for the very first transition any installed workspace experiences.
- closure_law: This ticket closes only when (a) the typed `WorkspaceInstallationAdmittedRuntimeEvent` is admitted and rejected by ABG's `assertRuntimeEvent` according to declared field rules, (b) an ABG-owned admittance regression test exercises both happy-path and malformed-shape rejection, (c) the carrier ships only the dispositions for which a real producer exists today, and (d) backwards-compat is preserved for existing event-log consumers.
- evaluation_criteria:
  - `WorkspaceInstallationAdmittedRuntimeEvent` is in the `RuntimeEvent` union.
  - `RUNTIME_EVENT_KIND_VALUES` includes `"workspace_installation_admitted"`.
  - `RUNTIME_EVENT_ADMITTERS` contains a typed admitter for the new kind.
  - All ABG-internal exhaustive switches on `event.kind` handle the new kind.
  - `assertRuntimeEvent` admits a valid install-shaped event and rejects malformed ones (missing fields, wrong field types, invalid `installResult`).
  - `installResult` accepts only dispositions with real producers. `"installed"` is the only producer ABG currently has visibility into; rejected/partial dispositions stay out of the union until a producer exists for them.
  - ABG semantic tests pass with no regressions.
  - No package version or RC bump.
  - Existing pre-this-ticket `events.jsonl` files (empty or with prior events) parse identically through `assertRuntimeEvent`.
- proof_surface:
  - `code/src/abg/m03/contracts/carriers.ts` — interface, union member, kind value, result-value constants
  - `code/src/abg/m03/contracts/event_admission.ts` — admitter
  - `code/src/abg/m03/contracts/projection.ts:691`, `retry_frontier.ts:694` — exhaustive-switch coverage
  - `code/src/abg/m03/contracts/index.ts` — re-export
  - `test_env/` — ABG-side admittance regression test (happy path + malformed rejection)
  - downstream `odd_sdlc` test `test_install_event_emission.test.mjs` — proves emission path round-trips through the typed admitter
- non_closure_conditions:
  - `installResult` admits a disposition that has no producer (e.g., `"rejected"` while no installer code emits it).
  - The new event kind is added to the union without admitter coverage in `RUNTIME_EVENT_ADMITTERS`.
  - An existing exhaustive `event.kind` switch in ABG reaches the `never` default for the new kind.
  - `assertRuntimeEvent` admits an install event with missing required fields.
  - The repair changes ABG package version or RC.
  - Existing event logs fail to parse after the change.

## Defect

The Python installer emitted `genesis_installed` into `.ai-workspace/events/events.jsonl` at install time, carrying engine version + engine_files metadata. Replay tooling and audit surfaces could read that event to reconstruct "this workspace exists because install N happened at time T against package P".

The TypeScript line:

1. Created `events.jsonl` as an empty placeholder (ABG installer scaffold).
2. Wrote `install-manifest.json` and `install-provenance.json` next to it.
3. Did **not** emit any event into `events.jsonl`.

Reason: `RuntimeEvent` is a closed discriminated union over kinds like `basis_admitted`, `vector_evaluated`, `evidence_admitted`, etc. There was no `workspace_installation_admitted` kind. `appendOddSdlcRuntimeEvents` calls `assertRuntimeEvent` on parse, which would reject any install-shaped record. The install path therefore had no typed surface to emit through.

Result: A13 (Replayability) was silently violated for the workspace's most upstream admitted state. Replay began from "as if the workspace already existed installed" with no event-log evidence of how.

This is a regression against the Python parity contract, not a new requirement. Adding the typed carrier does not introduce new install behavior; it makes existing install truth admittable into the typed event log.

## Why This Was Missed

The TS line modeled `RuntimeEvent` as strictly traversal-shaped (graph calls, frames, vector closures, evidence admission within edges). Install is upstream of traversal, so it didn't fit the existing event vocabulary. The decision to put install audit only in `install-manifest.json` / `install-provenance.json` looked defensible in isolation — but it dropped the Python parity property that the runtime event log is the single replay source for the workspace's history.

The fix is structural alignment, not a feature add: every workspace state transition admitted into the runtime should be on the event log, including install.

## Repair

Already shipped under commit `a8e7878` on `rc/3.7.1`:

- `WorkspaceInstallationAdmittedRuntimeEvent` interface in `carriers.ts`
- `WorkspaceInstallationResult` type and `WORKSPACE_INSTALLATION_RESULT_VALUES`
- Union member + kind value
- `RUNTIME_EVENT_ADMITTERS` entry
- Exhaustive-switch coverage in `projection.ts`, `retry_frontier.ts`
- `contracts/index.ts` re-export
- 488/488 ABG semantic tests pass, lint clean, no version/RC bump

## Closure Tightening Landed

1. **Narrowed `installResult` to `"installed"` only.** `WORKSPACE_INSTALLATION_RESULT_VALUES` and the `event_admission.ts` admitter `oneOf` now ship only the disposition for which a real producer exists. Rejected/partial dispositions stay out of the typed contract until producer code emits them.

2. **Added ABG-side admittance regression test** at `test_env/tests/test_b032_workspace_installation_event_admittance.test.mjs`. 13 cases: (a) kind is published in `RUNTIME_EVENT_KIND_VALUES`; (b) result-values list ships only producer-backed dispositions; (c) `assertRuntimeEvent` admits a fully-formed event; (d) rejection cases for unsupported `installResult`, empty required string fields, non-array `causationEventRefs`, non-string causation entries.

## Verification

- ABG semantic build: clean
- ABG semantic tests: 501/501 pass (488 prior + 13 new B-032 cases)
- ABG semantic lint: clean
- odd_sdlc rebuilds against narrowed type cleanly
- odd_sdlc downstream regression test (`test_install_event_emission.test.mjs`): 2/2 pass with `installResult: "installed"`
- No package version or RC bump.

## Cross-Repo Note

odd_sdlc TS installer already emits the new event after admission (commit pending in odd_sdlc tree). That side has its own regression test (`test_install_event_emission.test.mjs`). odd_sdlc's release of that emission is a separate ticket scoped to odd_sdlc and is not blocking on this ticket — once ABG ships, any installer that emits `workspace_installation_admitted` will be admitted by the typed contract.
