# Native HC2 completion notes

Writer increment over admitted C3 custody (source 0a8d330a32d5f577b424394c0424a1cd9abe519b,
tree 37256c94ccc68050275bfdd5e67f322911d48fc7). Change class: realization_refactor.
Seams 1-4 of the original task only. No acceptance is claimed.

## Basis and skill use

- `stdo_abiogenesis.json` resolved to STDO v3.0.2. The toolchain manager verified the installed
  release manifest (f7f3f824…4477) as valid.
- `.claude/references/PRODUCT_BASIS.md` procedure followed; `.claude/skills/stdo-work/SKILL.md`
  bootstrap applied. Direct Writer entry is permitted by `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
  One Writer context; no Worker/Reviewer activation.
- HOW: `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md` (canonical factories, `checkedInstalledCall`).
- Read in full: REQ-R-ABG3-CONTINUATION (-003 run-local continuation backs the wrong-run case).
  Consulted by targeted search only, not read in full: PRODUCT.md, REQ-P-POLICY,
  REQ-R-ABG3-INSTRUCTION-ASSEMBLY, M05_S06 public-function design, T287_NATIVE_WORKSPACE_WORK_DESIGN.

## Changes

1. `uat/public-setup.mjs` `constructLifecycleCall`: `api.constructInstalledStartCall`
   (start/next, explicit actor, input value, value ref, source none, envelope). The
   run-environment support is the factory's `runEnvironmentResources({authority})` callback, so
   the support root is created only after a successful population. Refusal stages:
   `lifecycle-input-admission` (owner `invalid_input`) or `lifecycle-start-population`.
   Returns `{call, resolution}` from the population.
   `uat/runner.mjs` `freshReadbacks`: the Run check still comes first. `caller.refresh()` is kept
   as the currentness check, then `api.constructInstalledRunReadCall` runs per member. A
   population refusal or a foreign populated source refuses before dispatch. Event-byte and
   terminal checks are unchanged.
   `uat/harness.test.mjs`: case (a) mocks `constructInstalledStartCall`, invokes the actual
   environment callback, asserts the explicit identities and adds refusal-before-support-root.
   Case (c) mocks `constructInstalledRunReadCall`, asserts the factory inputs and the exact
   dispatched call, and adds population-refusal and foreign-source cases with no dispatch. The
   failed/blocked readbacks and the install-root and no-Run cases are kept.
2. `support/declared-testing-capability.mjs`: the post-construction `stdoEnvironmentResources`
   insertion and the `pilotResources` import are deleted; the canonical call is dispatched
   unchanged. The legacy RC7 pilot is deferred as T287-HC2-LEGACY-STDO-PILOT-01.
3. `qualification/dispatch.mjs`: `startCall` uses the `input.factory`, which returns the
   explicit input and retains `{resolution}`. The preliminary `rootResolution` is removed. The
   population's `invalid_input` `/input` refusal yields `{inputAdmitted:false, call:null}`; any
   other refusal throws. The result shape `{root, inputAdmitted, call}` is kept, and the
   supplied cache is now unused. `observedC2Task` takes its resolution and grant from the
   factory. `rootResolution` and `admitsInput` exports are unchanged.
   ST1 adds one test with the unchanged developer-mini fixture and one installed setup. The
   ticket graph_function START goes through `qualification.startCall`, plus one input refusal
   with zero bytes and an `admitsInput` agreement check. The greeting asset START uses the
   shipped factory with `ids.greetingAssetHandle`. No target patch, fixture write or publication
   write.
4. Recursive cold Public pending test: the wrong-run pair follows the default-library
   precedent (`missing_continuation` `/continuation`; `basis_mismatch` `/run`), with zero events.
   A closed child GraphCall (has `parentFrameId`, not a root GraphCall) is read through
   `graph_call_result` with `abg_historical_declaration_proof {catalog, catalogView}`: the result
   names this Run and that GraphCall. With the proof omitted, the read refuses with
   `projection_basis_mismatch`, issuePaths `[]`, and appends zero events. The existing
   crossed/continue/duplicate/second-use/read proofs are unchanged.

## Checks

- `tsc 5.9.2 --noEmit --incremental false -p tsconfig.json`: exit 0. Only TS source under
  `code/src`; no TS source changed.
- `node --check` passes on all 7 edited .mjs files.
- In-memory probes (stdin, mocks only): constructLifecycleCall refusal/success,
  freshReadbacks refusal ordering, `startCall` admitted / input-refused / early-refused, and
  `observedC2Task` factory resolution all passed.
- Not run: the harness/ST1/recursive/default-library node tests and the framework-handoff
  compile fixture. No `build/` exists, and C2 owns build, package and installed tests.

## Disclosed actions inside the writable scratch

- The tsc run (TS 5.9 enables the Node compile cache) and the probe wrote
  `tmp/node-compile-cache` and `tmp/probe-archive`. Both were removed before readiness.
- Edits used `python3` and `node` reading from stdin/heredoc; no temporary files.
