# RC12 package B2b continuation Return: recoverable step failure in the default library

Writer Return (commentary).

- **Location.** Worktree `/private/tmp/abg-rc12-consensus-20261111`, branch `claude/rc12-integration`, start `f7b039ffb`. T = `build_tenants/abiogenesis/typescript`.
- **Commits.** `92536a383` T1+T2; `b99709fa3` merge `claude/rc12-heartbeat`; `a87bf8838` merge `claude/rc12-readback2` (`9c6886650`); `173b2b99d` code and tests; this Return. Both merges were clean, with no conflicts. Regenerated `T/contracts/` and `T/product-toolchain-manifest.json` are uncommitted.
- **Scratch.** S = `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/b2b2/`: census copy `census/`, E4 logs `e4/`, witness logs `logs/`.

## Verdict

Done; no stop. R1–R8, rulings A and B, and S2 are implemented as ruled. A failed step whose class is in the declared list returns to the Executive as a typed row, when its origin is the select, native-work or assessment leaf and its effects are attributable. The Executive then selects again within the same bound. Without a failure, every byte is unchanged (R7). E1–E5 are green, with no new failure or skip.

## Executive addition (S2)

- **Typed select refusal.** `implementation/default_library.ts` `selectGovernanceWork.complete`:
  - An exchange whose request, promptDigest, inputDigest or implementationRef differs still throws `native selector exchange mismatch`, and the Run stops.
  - Every other unbound completion returns `realized("select", input, null, diagnosticRef)` through `refusalReport("select", occurrence, inputDigest, "F_P")`. `refusalReport` gained a `computeRegime` parameter, default `F_D`.
  - The class is `diagnostic://abiogenesis/default-library/missing-owned-select@5`; the stage is `selector_completion`.
- **Relations** (`GOVERNANCE_SELECTION_REFUSALS`):
  - `selector_process_ended`, selectors `{actorInvocationRef, failureClass, timeoutClass}`;
  - `target_not_permitted`, selectors `{graphFunctionRef, reviewRef, missingReviews, staleReviews, missingSelectedPaths}`, each list space-joined or null;
  - `response_refused`, selectors `{graphFunctionRef (an offered target or null), reviewRef}`. This also covers `toolCallCount ≠ 0` and non-I-JSON output (my decision).
- No new event kind and no change outside the permitted files were needed. `leaf_invocation_port.ts` is untouched: F_P admits the typed failure candidate (census `select-refuse-once`, `select-exit-once`).
- Ruling A reads the relation from the retained diagnostic of the admitted select Result. `selector_process_ended` also requires an `actor_invocation_failed` with that actor, CCall and Run.
- **PRODUCT** prerequisites paragraph: "Only permitted work can be selected next, …". The design's prerequisites section is corrected the same way (see the deviations).

## O1. Classes and origins

Default `failedChildDiagnosticClassRefs` = `…/worksite/native-work/transport_failure@5`, `…/worksite/native-work/contract_failure@5`, `…/default-library/missing-owned-select@5`. An option overrides it; `[]` omits the member.

| Census origin (previous Return) | Class | Reading at re-entry | By |
|---|---|---|---|
| Worker exit after a partial write | transport_failure | continues | native origin, `after`, no unknown-effect fact, paths inside the grant (census `native-exit-once`, W2) |
| Absolute ceiling | transport_failure | continues while `after` holds and no termination is unconfirmed | same condition; not rerun |
| Inactivity | transport_failure | continues, row `timeoutClass: inactivity` | W3. Census `native-inactivity-once` recovered, then stopped in C2 preparation because the harness's 6 s limit is below the helper budget: a harness limit, not a product stop |
| Report refused | contract_failure | continues | native origin, same condition; not rerun |
| Write outside the grant, exit 0 | write_scope_violation (undeclared) | route stop; nothing folds back | W4b |
| Write outside the grant, exit ≠ 0 | transport_failure | parent refuses `failure_write_outside_grant` | W4a |
| Assessor exit | transport_failure at the assessment leaf | continues | assessment origin, same condition |
| Selection refused | missing-owned-select | continues | relation `response_refused` or `target_not_permitted` (census `select-refuse-once`, W1, W6) |
| Selector exit | missing-owned-select | continues | `selector_process_ended` plus `actor_invocation_failed` (census `select-exit-once`, E2) |
| Selector identity mismatch | implementation-exception (undeclared) | route stop | thrown; unit only (W7) |
| C2 helper mismatch | `worksite/command-execution/*` (undeclared) | route stop | origin and class |
| Unconfirmed termination or transport exception | any | parent refuses `failure_effects_unattributed` | E2 |
| Any other origin, or a class in `write_scope_violation`, `transport_identity_mismatch`, `assessment_independence_mismatch` under an override | – | parent refuses `failure_origin_not_recoverable` or `failure_class_not_recoverable` | E2 |

## O2. Readers of the selection task and the evidence domain

| Reader | Old | New |
|---|---|---|
| `isFramedSynthesisTask` (product; used by builtin_semantics 668–696, instruction_assembly 373/389, implementation select, abg owner) | `{kind, schemaVersion, state, context}` | plus exactOptional `failedAttempts`, non-empty, unique `resultRef`; builtin semantics still compare `state` only |
| `framedSynthesisEvidenceRefs` (binder, response schema enum, `deriveGovernanceObligations` via binder and `projectGovernanceChoice`) | taskRef, context, observation Results, prior synthesis | plus each failed attempt's `resultRef`, last |
| `projectFramedSynthesisPromptTask` (assembly prompt) | view | plus `failedAttempts {attempts, meaning}` only when present |
| `selectionTask` / `governanceResultMatches` prepare-selection | state and context | plus the fold over the same predecessor prefix (R5) |
| `owner()`, `projectGovernedContextTestingAtPrefix`, `runtime_history` body path `["context"]` | `task.state`, `task.context` | unchanged |

## O3. R7 pins (empty list reproduces every old value; E2 asserts them)

| Test | Pin | Old | New |
|---|---|---|---|
| `t287-default-library-prerequisites` | `HEAD_PINS.graphs` | `sha256:d29a3c03…f779` | `sha256:b8d87f1b0257c54798496456a67f14957700afcd3a5ae0b31cc5abe9b7a8ae80` |
| same | `HEAD_PINS.library` | `sha256:30d2ea23…9c82` | `sha256:d47c2c6a0fd7ca3a80637a07fd9cf07f1aede26954af2f776869996414a6aa95` |
| `t287-default-library-reviews` | `OLD_INSTANCE_PINS.gtl3` | `sha256:6ded5137…ad48` | `sha256:610e07824bf49251e08426991fb90aa022586cd07798648bd60c864060a6bb4b` |
| `t287-recursive-failure-foldback` l.90 | executive `foldbackRef` | equal to base `e7df59cd…` | `foldback://abiogenesis/1f184e200905b22d6a49ab76ccae7d363fe7a4f71c434913e3511a4633ea8eec` |
| same l.91 | executive `applicationRef` | `ac6f1ba5…2e70` | `graph-function-application://abiogenesis/b4ec9b6512e13015eb2d681b49c8ed49a188a51a142c7904aab3ff902f79550a` |
| same l.92 | `sha256Canonical(executive)` | `235f8c59…f86b` | `sha256:e297debd7a30cbcb0153b94dd83ec4de3174c806a5e21bc47f866a38808c2781` |
| same l.94 | round-trip digest | `ca78eb2f…3397` | `sha256:f933a2fef4c03805b0eeb221bd39adcb72effb4ea8af5b261d0f6aa335b934be` |

`view`, `schema`, `reviewed`, `bindings`, `environment` and every other `OLD_INSTANCE_PINS` member did not move: no prompt, schema or task byte changes without a failed step. The foldback test's title ("…without failedChildDiagnosticClassRefs keeps its base bytes…") still names the base fixture, which keeps its bytes. Its executive lines now pin the declared default; I may edit only the pins, so the title is unchanged.

## O4. Events the parent reads

- `child_foldback_admitted`:
  - the recursion foldback (`basis:<executive basis>`, with `applicationRef`, same Run), its latest one at re-entry and all of them in the fold;
  - failed workflow foldbacks under `payload:parentCCallRef:<failed CCall>`, the last before the lifted Result.
- `c_call_result_admitted`: the step's failed Result (`payload:resultRef`, graphCall, digest), each lifted failure, the origin leaf Result, and the step's `registered_graph_choice` (`graph-call:<step>`).
- `c_call_opened`: origin locus (`related:<cCallRef>`). `c_call_evidenced`: the last one before the origin Result, for `timeoutClass`.
- `actor_invocation_failed`: the selector process end, matched on actor, CCall and Run; also `transport_exception` as an unknown-effect cause. `actor_process_termination_unconfirmed` (`invocation:<actor>`).
- `basis_admitted`, through `projectNativeWorkspaceWorkResultTaskAtPrefix`: the origin's task, for the write roots.

## O5. Evidence

E1: `npm run build`, `lint:imports`, `lint:lifecycle` and `lint:calculus` are green on `173b2b99d`, rerun at close. `lint:evidence` is outside E1. It reports mirror and oversize paths under `rc3-dogfood-01/` and `T287_RC5_LOCAL_EVIDENCE_01/`, which have not changed since `f7b039ffb`. This is a pre-existing failure and I did not repair it. `npm run lint` needs a recipe path (`argv[2]`) and throws without one. E2 and E3 are in the table. E4 ran one file at a time on `173b2b99d` (logs in `S/e4/`).

| File | Tests | Pass | Fail | Skip | Base | Change |
|---|---|---|---|---|---|---|
| default-library-recoverable-failure (E2, new) | 4 | 4 | 0 | 0 | – | new |
| default-library | 37 | 34 | 0 | 3 | 34/37, 3 skip | none |
| default-library-fulfillment | 7 | 7 | 0 | 0 | 7/7 | none |
| default-library-reviews | 10 | 10 | 0 | 0 | 10/10 | gtl3 pin |
| default-library-prerequisites | 6 | 6 | 0 | 0 | 6/6 | two HEAD pins |
| recursive-registered-selection | 7 | 6 | 0 | 1 | 6/7, 1 skip | none |
| registered-graph-selection | 1 | 1 | 0 | 0 | 1/1 | none |
| governance-covered-source-use | 9 | 3 | 0 | 6 | 3/9, 6 skip | none |
| recursive-failure-foldback | 8 | 8 | 0 | 0 | 8/8 | four pins, F7 patch |
| readable-stops | 5 | 5 | 0 | 0 | 4/4 + merged fifth | two cases pass `[]` |
| readable-stops-foldback (merged) | 4 | 4 | 0 | 0 | – | none |
| amendment-witness (E3) | 13 | 12 | 0 | 1 | 7/8, 1 skip | EARLY replaced by W1–W6 |
| liveness-heartbeat (new from heartbeat merge) | 6 | 6 | 0 | 0 | – | none |
| liveness-inactivity (existing, unchanged) | 3 | 3 | 0 | 0 | no base log | none |
| management-supervision (changed by heartbeat merge) | 5 | 5 | 0 | 0 | no base log | none |

Every skip is the same environment-gated or live case as at the base. No new failure and no new skip.

The deliberately changed claims:
- the amendment-witness EARLY case, which said a refused choice stops the Run, is replaced by W1;
- the STDO_COVERAGE row now reads "only permitted work can be selected next, and an early choice is refused before its stage runs and returns to the Executive";
- the R7 pins in O3;
- the two readable-stops failure-stop cases, which now declare `[]`.

**E5.** All three interruption proofs pass:
- default-library: ✔ "default-library Run interrupted at the durable entered Testing cursor resumes once in the same Run through the cold Public pending_execution arm" (77 s);
- recursive-registered-selection: ✔ "interrupted recursive workflow resumes its exact pending execution once in the same Run" (38 s);
- recursive-registered-selection: ✔ "interrupted recursive workflow resumes once through the cold Public run.continue pending_execution arm" (52 s).

## Merges and the F7 patch

- `b99709fa3` (`claude/rc12-heartbeat`) and `a87bf8838` (`claude/rc12-readback2` at `9c6886650`) merged with no conflicts, and `git show --cc` of each is empty, so I made no hand edits in them.
- My commits touch only permitted files. `92536a383` changes PRODUCT.md and the design file. `173b2b99d` changes the four `default_library.ts` files (`product`, `abg`, `gtl`, `implementation`), `native_work_effect.ts`, three support files and six test files. `project_read_ports.ts`, `worker_transport.ts` and every other changed path came from the merges.
- The F7 patch (`…/scratchpad/rr/foldback-test-F7.patch`) applies cleanly to the last test of `t287-recursive-failure-foldback`. It changes three readings: an ended frame's probe fluent is not presented as active (`probeFluentHeld` false); no native invocation is presented for an ended frame (`nativeFrame` null); each folded child GraphCall reads `failed`, not `closed`. With the R7 pins the file passes 8/8.
- Ruling B: the two failure-stop cases of `t287-readable-stops` ("worker exit failure reads back…", "absolute time ceiling reads back…") pass `failedChildDiagnosticClassRefs: []`, forwarded by `support/default-library.mjs`. The merged `t287-readable-stops-foldback` needs no empty list: its fixture declares its own list through `recurseApplication`, and no case depends on a worker failure stopping the Run.

## Deviations and notes

- **Design prerequisites section.** S2 changes what a refused choice does, so the existing prerequisites section was wrong in four places: "offered only permitted work", the binding exception message, "the Run stops at the failed selection", and the diagram's else-branch. I corrected them in the same commit as the new design section.
- **Witness runner.** The runner moved from `t287-amendment-witness.test.mjs` to `support/amendment-witness-run.mjs` so that W1–W6 and E2 share it. The witness test-side grant covers it.
- **Collaborator export.** `abg/native_work_effect.ts` exports its existing `causeActor` as `/** @internal */ nativeWorkUnknownEffectActor`. The parent uses it to find unknown-effect facts. Behaviour is unchanged.
- **R2.** A failed disposition is classed `transport_failure` by `implementation/native_workspace_work.ts:72-74` before the scope check. So the parent runs `nativeWorkspaceScopeViolations` itself (W4a). Integrity classes are refused by name even under an override. A preparation refusal or a failed deterministic projection has no select, native or assessment origin, so it is refused as `failure_origin_not_recoverable`. A C2 helper mismatch has a class outside the list, so the route stops.
- **`response_refused`** also covers tool calls and non-I-JSON output. These are refusals of the response, not of a target.
- **W7 is proven at unit level.** No stand-in actor can change the transport's request, prompt, input or implementation identity. The unit test drives `selectGovernanceWork` with each identity field altered and gets the throw.
- **Parent refusal record.** The refusal is the executive root's failure Result, whose `diagnosticRef` is a data URI. The Run disposition is `runtime_failed`, and no `runtime_failure_observed` is emitted. W4 reads the Result.
- **Census inactivity.** `native-inactivity-once` recovered and then stopped in C2 preparation. Preparation requires the inactivity limit to exceed the helper budget of about 29 s, and the census used 6 s. W3 uses the budget plus 5 s and completes.
- **New exports.** `product`: `GOVERNANCE_SELECTION_REFUSALS`, `GOVERNANCE_RECOVERABLE_FAILURE_CLASSES`, `FramedSynthesisFailedAttempt`. `abg`: `projectGovernanceFailedStepAtPrefix`, `projectGovernanceFailedAttemptsAtPrefix`; E2 tests the fold, R5 and the ten parent mutations through them. Two things are left as is because my grant covers only the pins: the stale comment above `HEAD_PINS` in the prerequisites test, and the foldback test title.
- **R6.** Failed steps count toward the bound. W5 runs with bound 4, which allows three children. All three steps fail, and the Run then stops with `run_stopped` `reason://abiogenesis/recursion/bound-exhausted@5`, disposition `blocked`.
