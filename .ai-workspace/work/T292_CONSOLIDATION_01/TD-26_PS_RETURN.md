# TD-26 PS Return: the Executive's Program takes the `supervised` root mode

**Status: STOPPED at the trace, before any edit. When the library's own Program declares `supervised`, the RC7 fixed Testing/UAT route is refused. That route is a kept lane that invokes the library's wrappers through the `invoke` member under that Program. The two direct-invocation guards refuse a direct invocation of a supervised Program, and neither guard is the start law. Observed: the case "RC7 fixed admission" passes on the base and fails on a probe build with only the policy changed, refused `invalid_intent` at `/request` with no events appended. No code, design or test change is committed. Two items need a ruling (section 6).**

- Ticket: T-292, package TD-26 PS. Writer: Claude Opus 5.5.
- Branch `claude/td26-ps-executive-supervised`, worktree `/private/tmp/abg-td26ps`, from local `main` at `5c9df5056`. Nothing is pushed or tagged.
- T is `build_tenants/abiogenesis/typescript`. Paths without a prefix are under `T/code/src`. Line numbers are at `5c9df5056`.
- Scratch evidence is under `/private/tmp/abg-td26ps-work/`:
  - `trace-start-law.mjs` with `trace-start-law.base.json` and `.flipped.json`;
  - `probe-consumer-policy.mjs` with `.base.json` and `.flipped.json`;
  - `probe-rc7-fixed-admission.base.tap` and `.flipped.tap`.

## 1. Start table (ruling 2)

**Method.**
- `trace-start-law.mjs` builds the library publication with `constructDefaultGovernanceLibraryModulePublication`. It runs `resolveProgramStart` and `graphFunctionStartRefusal` (`gtl/public_start.ts`) over every request shape the law distinguishes: 3 stated root modes × 5 targets × 2 `until` values, 30 rows.
- Each row runs on the base Program (`abg.root_mode: direct`) and on the same Program with `supervised`.
- On a probe build with only `gtl/default_library.ts:318` set to `supervised`, the law gives the "after" column on all 30 rows.

**The Program.**
- `program://abiogenesis/default-library/default@5` declares one start, `start://abiogenesis/default-library/default@5`, which runs `graph-function://abiogenesis/default-library/executive@5`.
- `abg.default_start_ref` names that start.
- The Program publishes no asset targets.

**Rows.** Every row with `until` other than `converged` is refused `unsupported_control`, on the base and after. At the Public surface the request schema admits only `converged`. Every start-law refusal reaches Public as `invalid_target` at `["/program"]`: `programStartRefusal` (`product/execution_resolution.ts:282-294`), stage `catalog`, maps through `resolutionRefusalCode` (`product/run_invocation_operation.ts:283-290`). The rows below are for `until: converged`.

| Stated root mode | Target | Today (policy `direct`) | After (policy `supervised`) |
|---|---|---|---|
| absent (the default, `supervised`) | `next` | refused `unsupported_control` | refused `unsupported_control` |
| absent | `declared_start` naming the declared start | refused `unsupported_control` | **started**: `declared_start`, the Executive |
| absent | `declared_start` naming another ref | refused `unsupported_control` | refused `missing_target` |
| absent | `asset` | refused `unsupported_control` | refused `unsupported_control` |
| absent | `graph_function` (a member) | admitted by the law (TD-35: a direct start; the stated mode is not read) | **refused `unsupported_control`** |
| `supervised` | each target | as the absent rows | as the absent rows |
| `direct` | `next` | **started**: `next`, the default start, the Executive | **refused `unsupported_control`** |
| `direct` | `declared_start` (either ref) | refused `unsupported_control` | refused `unsupported_control` |
| `direct` | `asset` | refused `missing_target` (no asset targets) | refused `unsupported_control` |
| `direct` | `graph_function` (a member) | admitted by the law | **refused `unsupported_control`** |

The `invoke` member is not governed by the start law. It is added here because it decides the stop:

| Member | Request | Today | After |
|---|---|---|---|
| `invoke` | `catalogHandle` of the Testing or UAT wrapper under the library Program | admitted; observed in "RC7 fixed admission" on the base | Product refuses `authority_mismatch`, "a supervised Program may be entered only through public start selection" (`product/invocation.ts:1155-1162`); Public gives `invalid_intent` at `["/request"]` with no events (observed on the probe build). Behind it, ABG refuses `selection_mismatch`, "a supervised Program cannot be admitted through direct invocation" (`abg/invocation_admission.ts:958-966`, read). On every Public path Product refuses first. |

## 2. What a caller would write

**A start of the default library after the change.**
- The SDK selection intent is `{memberKey: "start", target: {kind: "declared_start", startRef: "start://abiogenesis/default-library/default@5"}, rootMode: "supervised", fhMode: "direct"}`, with `programRef: "program://abiogenesis/default-library/default@5"`.
- The Public request that Product populates from it has:
  - `scope: "program"`;
  - `target: {kind: "declared_start", start: {ref: "start://abiogenesis/default-library/default@5", digest: "sha256:72560165afd84c5c5e9c30991f09e497eef722ff919f320b0ed212ed9b01aa68"}}`, where the digest is `sha256Canonical` of the declared start (`product/run_invocation_operation.ts:1030-1035`);
  - `until: "converged"`;
  - `rootMode` omitted, which defaults to `supervised` (`product/run_operation_contracts.ts:161`), or stated as `supervised`.

**Today's request after the change.** `{target: {kind: "next"}, rootMode: "direct"}` against the library's own Program is refused at Product resolution: law code `unsupported_control`, Public `invalid_target` at `["/program"]`.

**Who starts the library's own Program today: no lane and no maintained caller.**
- Every Executive Run in the lanes, and the live rc.12 Run, starts a consumer Program that copies the library Program: the witness fixture, the sandbox-UAT lifecycle or the registered-selection fixtures (section 4).
- The one maintained use of the library's own Program is the RC7 fixed route through `invoke`.
- The one recorded log of the library's own Program (TD-28 map §6.4, `release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl`) records `invocationVariant: "direct"` and no `rootMode`. It is a fixed-route invocation, read from the main checkout.

## 3. The stop

**Observed.** Both runs are one case each, run with the brief's command and `--test-name-pattern='RC7 fixed admission'` on `test_env/tests/t287-default-library.test.mjs`.

| Build | Result | Wall |
|---|---|---|
| base | `ok 1`: 1 test, 1 pass | 86 s |
| probe (only `:318` set to `supervised`) | `not ok 1` at `:2487` (`completedRun`): `{"label":"fixed-testing","exitCode":1,"outcomeKind":"refusal","code":"invalid_intent","issuePaths":["/request"],"failure":null,"events":[]}` | 63 s |

The probe edit was reverted and the base rebuilt. `git status` shows no tracked change.

**Why the route has no lawful form under a supervised library Program.**
- The route invokes the registered Testing wrapper and then the UAT wrapper with no selector, through `invoke` (the `direct` variant). The callers are `test_env/uat/public-setup.mjs` `constructFixedTestingCall` (`:419`), `constructFixedUatCall` (`:444`) and `constructFixedWrapperCall` (`:450`), with `libraryProgram` (`:401`). The design is `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` "RC7 fixed Testing/UAT direct wrapper route" (`:260`): "Product makes the Executive optional".
- F2-PROGRAM-001 (`:403`) keeps the library's wrapper rows on `program://abiogenesis/default-library/default@5`. A consumer Program cannot host the route: population refuses `wrong_owner`, and Public reports `invalid_target` at `/program`.
- Under a supervised policy the start law offers no other entry:
  - the Program declares one start, the Executive;
  - a `graph_function` start is a direct start, refused under `supervised` (section 1);
  - the Program publishes no asset targets.

**Stop conditions met.**
- "A kept lane's claim cannot be stated with the new start." The lane claims that a Public direct Testing state Result admits a direct UAT invocation on the library Program.
- Ruling 1. Keeping the lane needs a change to law other than the Program's policy: the two guards in section 1.
- Lanes that carry the route:
  - `t287-default-library` "RC7 fixed admission" (`:2399`, installed, observed red);
  - "RC7 fixed proof: public-setup invokes Testing directly…" (`:1342`). It stubs the SDK constructor, so it does not reach the guard, but its claim is the same route.
- The UAT runner, scenarios and harness do not call the fixed route: a search of `uat/runner.mjs`, `uat/scenarios.mjs` and `uat/harness.test.mjs` finds no call.

## 4. Consumer Programs inherit the policy (ruling 4)

Two consumer Programs build their policies by spreading the library Program's policies:
- `test_env/support/default-library.mjs:22-25`, the witness fixture `program://default-library-witness/witness@5`. Its Runs are the live rc.12 Run and 18 of the 19 recorded default-library logs.
- `test_env/uat/consumer.mjs:35-41`, the sandbox-UAT lifecycle `program://abi5-tests/sandbox-uat/lifecycle@5`.

`probe-consumer-policy.mjs` gives:

| Program | Base: root mode, digest | Probe build, unpinned | Probe build, with `'abg.root_mode': 'direct'` pinned |
|---|---|---|---|
| library `…/default-library/default@5` | `direct`, `sha256:d97c7579…9dca` | `supervised`, `sha256:67f4543c…b459` | (not pinned) |
| witness `…/witness@5` | `direct`, `sha256:4c24090c…e651` | `supervised`, `sha256:f21befc0…2884` | `direct`, `sha256:4c24090c…e651` (equals base) |
| sandbox-UAT `…/lifecycle@5` | `direct`, `sha256:ef753b16…8d98` | `supervised`, `sha256:d5913f08…0237` | `direct`, `sha256:ef753b16…8d98` (equals base) |

- Without a pin, the change flips both consumers to `supervised`. That is what ruling 4 excludes.
- With one explicit pin in each spread, both keep `direct` with a byte-identical Program digest. The pin is a two-line support change and is digest-neutral.
- Two unit lanes spread the library policies into in-test Programs and would follow the library: `t287-default-library-reviews.test.mjs:261` and `t287-default-library-fulfillment.test.mjs:129`.

**Root-mode policies in source.**
- `supervised`: `gtl/consensus.ts:4910` (One Surface) and `gtl/worksite_command_execution.ts:257` (the revision child, `starts: []`).
- `direct`: every other Program, including `gtl/default_library.ts:318`. The others are:
  - `worksite_command_execution.ts:272`, `:288`;
  - `native_workspace_work.ts:40`;
  - `requirement_handoff.ts:132`, `:183`;
  - `semantic_stage_publication.ts:131`;
  - `semantic_revision_publication.ts:84`;
  - `self_conformance.ts:51`, `:160`, `:190`;
  - `worksite_c0.ts:199`, `:341`;
  - `worksite_construction.ts:452`;
  - `worksite_branch_construction.ts:457`;
  - `worksite_command_forward.ts:81`.

**Root-mode policies in fixtures and support.**
- `supervised`:
  - `fixtures/exact-intent-product`;
  - `fixtures/t287-selected-action-product`;
  - `fixtures/t287-s03-automatic-product`;
  - developer-mini One Surface (one of six Programs);
  - the in-test override in `r5-invocation-admission`.
- `direct`, declared:
  - `fixtures/registered-selection-product`;
  - `language-smoke`;
  - `language-structural`;
  - `flavored-catalog-product`;
  - `native-semantic-revision`;
  - developer-mini (five Programs);
  - `falsifiers/runtime-f09-product`;
  - the support Programs (`serial-branch-worksite-program`, `single-start-worksite-program`, `d2-static-smoke`, `d2-frame-fixture`, `d5-authentic-preserved-result-fixture`, `t287-generic-job-intake`);
  - `w2-steel-single-start`;
  - `t287-retry-run-prefix`.
- Inherited from the library: the witness fixture and the sandbox-UAT lifecycle, above.
- `support/root-installed-environment.mjs:918`, `:965` take the start or direct variant from the selected Program's own policy. Its callers select root fixtures, not the default library.

## 5. Corrected site list for ruling 7

With the consumer pin from section 4, the sites named by the specification step's Return fall as follows.

| Site | Program it names | Change |
|---|---|---|
| `t287-default-library.test.mjs:436`, `:458` | the library's own Program (`library.programs[0].programRef`), in unit premises | moves to the declared start: `invocationVariant: "start"`, target and `startRef` the declared start, `rootMode: "supervised"`; the binding section shows what the start records |
| `t287-default-library.test.mjs:1436` | sandbox-UAT lifecycle (consumer) | none (ruling 4) |
| `t287-default-library.test.mjs:2606` | witness (consumer) | none (ruling 4) |
| `support/registered-graph-selection.mjs:236`, `:263` | consumer fixture Programs (default `fixture.ids.programRef`) | none (ruling 4) |
| `uat/public-setup.mjs:412`; `uat/continuation.mjs:319`, `:370` | sandbox-UAT lifecycle (consumer) | none (ruling 4) |
| `uat/public-setup.mjs:419-452`; `t287-default-library.test.mjs:1342`, `:2399` | the library's own Program, through `invoke` | cannot be stated (section 3) |

No lane starts the library's own Program through a Public start. Only the new lane of ruling 7 would.

## 6. Needs a ruling

1. **The RC7 fixed route under a supervised library Program.** Options:

   | Option | Change | What it touches |
   |---|---|---|
   | (a) Add a `direct` Program for the fixed route | The library publication declares a second Program with `direct` policy that hosts the fixed wrapper route. The wrapper rows' `programMembershipRefs` name it. | A design_reframe of F2-PROGRAM-001 and the RC7 section. It moves the library publication and its catalog rows. `uat/public-setup.mjs` `SETUP_PROGRAMS.library` and `libraryProgram` select the new Program. The recorded fixed-route log stays on the old Program reference. |
   | (a') The reverse of (a) | `…/default@5` stays `direct` for the fixed route, and a new Program declares `supervised` and the Executive start. | The same scope as (a), with the recorded log keeping its Program's meaning. |
   | (b) Change the guards | The direct-invocation guards (`product/invocation.ts:1155-1162`, `abg/invocation_admission.ts:958-966`) admit a direct `invoke` under a supervised Program. | A law change outside ruling 1. Whether REQ-P-POLICY-013 ("`direct` selects one admitted entry traversal without that Product policy overlay") permits a direct invoke under a supervised Program is a requirement reading. It touches no Program identity. |
   | (c) Retire the route | Retire the RC7 fixed route. | A feature decision: "Product makes the Executive optional" leaves the design note. It removes the `constructFixed*` callers and the two cases. No UAT runner path uses the route. |

2. **What "a default start selects the standard system program" covers.**
   - Under ruling 4 every Executive Run in use today stays a `direct` start of a consumer copy: the witness fixture, the sandbox-UAT lifecycle and the registered-selection fixtures.
   - After the change, the sentence holds for a caller that names the library's own Program. No current lane or maintained caller does.
   - The ruling needed: is the new lane alone the intended evidence, or should a consumer copy of the Executive also declare `supervised`? The second reverses ruling 4.

## 7. Not reached

These steps come after the stop, and none was done:
- the Run comparison (ruling 3);
- the replay and artifact-truth comparison (ruling 5);
- the design restatement (ruling 6);
- the test changes and the new lane (ruling 7);
- the generated-contract report (ruling 8);
- the before-and-after lane set.

Other figures:
- Lines changed under `code/src`, `design` and `test_env`: 0.
- No lane needing a live provider was run. Only the one RC7 case ran, on the base and the probe build, with the scripted stand-in actor.
- The machine was not left with background commands.
