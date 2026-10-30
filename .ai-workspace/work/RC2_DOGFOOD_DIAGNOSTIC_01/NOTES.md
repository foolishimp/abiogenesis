# RC2 Dogfood Diagnostic 01 — Construction Notes

Commentary only. Not specification, design, or acceptance.

## Reuse

- The operator task (`rc2-operator-inputs/diagnostic-01/task.md`) and rubric
  (`rubric.json`) serve as the specification for this repair. No Product,
  requirement, or design surface was rewritten.
- The existing C2 constructor guard set and the existing t287 fixture
  (`test_env/support/t287-generic-job-worksite.mjs`) were reused unchanged.

## Bounded change

- `code/src/product/worksite_command_execution.ts`,
  `constructWorksiteCommandConfiguration`: two conditions moved out of the
  combined guard into their own guards. Each still throws `TypeError`.
  - Duplicate `commandId`: `worksite command identities must be unique;
    commandId "<id>" is declared more than once`.
  - Protected subject inside an allowed write territory: `worksite command
    protected subject "<path>" overlaps allowed write territory <pathKind>
    "<relativePath>"; protected subjects cannot be command write targets`.
  - All other combined conditions keep their existing guard and message.
    No guard was removed or loosened. No error class or public contract field
    was changed.
- `test_env/tests/t287-worksite-command-execution.test.mjs`: two tests,
  `C2 RC2 diagnostic duplicate command identity ...` and
  `C2 RC2 diagnostic protected subject inside an allowed write territory ...`.

## Observed outcomes

- `npm run build`: **failed** (exit 1). `tsc` succeeded.
  `scripts/generate-product-manifest.mjs` refused: `C2 declared context member
  differs from its packaged Product source:
  build/code/src/product/worksite_command_execution.js`.
  - Cause: the compiled module is the pinned C2 renderer context member in
    `code/src/gtl/worksite_command_execution.ts:36-39,61` (digest, byteCount,
    span offsets). That file is outside this work unit's write scope.
  - Values computed from the current tsc output: byteCount `118675`, digest
    `sha256:9c5716a15fdb888291e2e65ccabcdc410e0e796d0c67815f78758b5fa150fd3d`,
    startByte `108590`, endByte `111022`, spanDigest unchanged
    (`sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf`).
  - `test_env/qualification/recipe/expected-output-inventory.json` also
    mirrors this module's digest (line 468) and the inventory and GTL module
    digests that derive from it.
  - Side effect: the build's `clean` step deleted 83 tracked generated files
    (82 under `contracts/`, plus `product-toolchain-manifest.json`). The failed
    generator did not regenerate them. A successful `npm run build` restores
    them.
- Focused: `node --experimental-vm-modules --test
  --test-name-pattern="C2 RC2 diagnostic"
  test_env/tests/t287-worksite-command-execution.test.mjs`: 2 pass, 0 fail,
  0 skipped. This ran against the partial tsc output of a failed build.
- Whole file: `node --experimental-vm-modules --test --test-concurrency=1
  test_env/tests/t287-worksite-command-execution.test.mjs`: 6 pass, 6 fail.
  All 6 installed-path tests failed with `ENOENT ...
  product-toolchain-manifest.json`, which is a consequence of the failed
  build.

## Open

- Owner repair of the C2 renderer pin, followed by a rerun of the build and
  the whole test file.
- The residual combined guard still reports `worksite command and predicate
  identities must be unique` for its non-identity conditions. That is outside
  this bounded change.

## Diagnostic-03 Construction: C2 context-pin maintenance

- Inspected the source and test edits above and kept them unchanged. The
  union of refusal conditions matches the predecessor guard, every refusal
  still throws `TypeError`, and no test or consumer outside the two new tests
  matches either message.
- Measured directly from the observed
  `build/code/src/product/worksite_command_execution.js` (mtime later than the
  edited `.ts`, contains both new guards): byteCount `118675`, digest
  `sha256:9c5716a15fdb888291e2e65ccabcdc410e0e796d0c67815f78758b5fa150fd3d`.
  `function renderWorksiteCommandExecutionPrompt(` occurs once, at byte
  `108590`. The bytes `[108590, 111022)` equal
  `renderWorksiteCommandExecutionPrompt.toString()` and hash to the unchanged
  spanDigest `sha256:1fcd7184…a896bf`. No non-ASCII bytes precede the span.
- `code/src/gtl/worksite_command_execution.ts`: changed only the member
  digest, `byteCount` and `startByte`/`endByte`. The spanDigest, renderer
  policy text, Program/GraphFunction declarations and schemas are unchanged.
- Construction ran no build or tests and wrote no generated outputs. The owner
  build, which regenerates `contracts/` and `product-toolchain-manifest.json`,
  and the focused and whole-file tests belong to Testing. Their outcomes are
  not yet observed.
- `test_env/qualification/recipe/expected-output-inventory.json:468` still
  carries the old digest. The qualification inventory is deferred to the
  later RC2 cut.

## Assessment-intake-01 Construction: early assessment role separation

Task: `rc2-operator-inputs/assessment-intake-01/task.md`. Source edits only.

### Bounded change

- `code/src/product/default_library.ts`: private
  `governanceAssessmentRolesDistinct` (line 68), conjoined into
  `isGovernanceWorkState` (line 76). It holds the existing native rule of
  `isNativeWorkspaceAssessmentSelection`
  (`native_workspace_assessment.ts:67-71`) over the same path strings.
  `assessment.sources` must be unique and must not contain `candidatePath`
  or `rubricPath`, and `candidatePath` must differ from `rubricPath`.
- `constructGovernanceWorkState` already calls the predicate before it
  returns, so it now refuses these selections at construction. The existing
  refusal is reused unchanged: `TypeError` "governance input requires complete
  original source, scope and declared work contracts". No schema key, failure
  class, message, controller or bypass was added. The native check is
  unchanged.
- The native predicate itself is not reachable at intake. It needs digests,
  a producer and a schema-valid asset, which do not exist before UAT
  preparation. Calling it at intake would mean fabricating a producer. The
  relation is restated, not imported. `abg/default_library.ts:247-252` passes
  these strings unchanged into the native selection, so exact equality is the
  same relation.
- New test file `test_env/tests/rc2-assessment-intake.test.mjs` has 5 cases,
  all prefixed `RC2 assessment intake`:
  - one valid disjoint control: constructible, unchanged state shape and
    selection, plus a two-source variant;
  - duplicate sources;
  - a source equal to `candidatePath`;
  - a source equal to `rubricPath` (the RC1-OP-006 relation), plus the check
    that removing only that source restores the control;
  - `candidatePath` equal to `rubricPath`.

  Each invalid case asserts that only `assessment` differs from the control,
  that the actual predicate returns false over a complete state, and that the
  actual constructor throws the existing refusal. Fixtures are in memory.
  Only `assessmentContract`, `assessmentSchema` and `witnessRef` are reused
  from `test_env/support/default-library.mjs`. The test does not use
  `witnessInput`, which reads seeds from a historic
  `.ai-workspace/comments/codex/...` path. No operator trial file is read.

### Construction self-checks (not Testing evidence, not acceptance)

- `./node_modules/.bin/tsc --noEmit -p tsconfig.json`: exit 0. No emit, and
  no incremental build info is configured.
- New test file against the pre-change canonical `build/`: 1 pass, 4 fail,
  0 skipped. The control passes. Every invalid-role case fails because the
  old predicate accepts it. This shows the cases discriminate.
- The same unmodified test file against the edited source: 5 pass, 0 fail,
  0 skipped. A stdin script registered an in-memory loader hook that
  transpiled `code/src/product/default_library.ts` in place of the stale
  `build/.../default_library.js`. All other modules came from the existing
  build. This is not the declared isolated build.
- No build was run and no generated file was written in the canonical
  worktree. One type-check command carried a stray redirect to
  `/tmp/../dev/null`. It failed to open (`/private/dev/null` does not exist),
  so it created no file.

### Dependency: existing owner tests now refused at construction (outside grant)

Required behavior refuses these existing fixtures. Each declares the same path
as source, candidate and rubric, and builds it through
`constructGovernanceWorkState`. Each needs an owner fixture repair to use
disjoint role paths. The repair is not made here.

- `test_env/tests/t287-native-work-reacquisition.test.mjs:85`, reached
  through `declarationFixture(t,false,true)` by the cases at `:214` ("library
  prepare-testing reuses the invoking private operation ...") and `:268`
  ("library Testing first-refusal diagnostics ...").
- `test_env/tests/t287-native-work-currentness-consumers.test.mjs:161`
  (`governanceInput`), reached through `observedConsumers` and
  `governanceConsumers` by the case at `:596` ("U1-P5-02 actual C0 successor
  ...").

This follows from reading the source; the cases were not executed here. They
are not among the six C2 guard/budget cases of the declared plan. The sandbox
UAT requests, `default-library.mjs`, `default-library-fulfillment.mjs` and the
UAT consumer selection all declare disjoint roles and are unaffected.

### Open

- Declared Testing: isolated build, the new intake tests and the six C2 cases.
  Not yet observed.
- The refusal text is still the generic governance-input message. The more
  specific diagnostic is a separate usability observation and is not
  addressed here.
- Retained governance states with overlapping roles, such as the RC1-OP-006
  Run, now fail `isGovernanceWorkState` at every consumer of that predicate.
  This matches the recorded smallest recovery (a corrected new input).
- Unchanged residuals: the prior owner-file criterion (two installed
  integration tests exceeded their 180 s deadlines; the 600 s outer command
  expired), full fifteen-family qualification, model-identity independence,
  full owner-suite acceptance, RC2 release readiness, and reconciliation of
  the old generated-file deletions in the canonical worktree.

## Fixture-repair-01 Construction: disjoint assessment roles in three owner cases

Grant: the two test files below and this note. Product, implementation and GTL
source, the C2 diagnostic files and `rc2-assessment-intake.test.mjs` are
unchanged.

### Bounded change

- `test_env/tests/t287-native-work-reacquisition.test.mjs`,
  `declarationFixture` (library branch, `:86`): assessment roles change from
  `source.txt` ×3 to `sources:['source.txt']`, `candidatePath:'candidate.txt'`,
  `rubricPath:'rubric.json'`. `assessment.sources` stays equal to the declared
  original source. One comment line was added.
- `test_env/tests/t287-native-work-currentness-consumers.test.mjs`,
  `governanceInput` (`:162`): roles change from `path` ×3 to
  `sources:[path+'.source']`, `candidatePath:path`,
  `rubricPath:path+'.rubric'`. This is the same disjoint selection that
  `governanceConsumers` already materializes (`:284-301`), so its override,
  physical files, `asset()` digests and `nativeWorkspaceAssessmentSubjectMatches`
  check are unchanged. One comment line was added.

Nothing else changed: no owner call, physical currentness check, causal or
provenance check, assertion, trace count, timeout, skip or mock.

### Why no new files are materialized

The role paths are read, digested or currentness-checked only in UAT
preparation (`abg/default_library.ts:218-252`). In the affected Testing and
observed-C2 paths, the owners read only `original.sources`, `readRoots`,
context bounds and `testing` (`abg/default_library.ts:64-71, 262-311`;
`abg/native_work_reacquisition.ts:172-205`; `abg/worksite_input_provenance.ts:419-421`).
The assessment roles reach them only through `isGovernanceWorkState`. The one
case that does exercise UAT preparation, `governanceConsumers`, already writes
`path.source` and `path.rubric` and observes them in its own context. Adding
files to the reacquisition or observed fixtures would change their physical
inventory and context entries (`maxFiles:1` in the reacquisition fixture)
without exercising a new relation.

### Construction self-checks (not Testing evidence, not acceptance)

- `node --check` on both edited files: both pass.
- In memory, I extracted `governanceAssessmentRolesDistinct` from the current
  `code/src/product/default_library.ts` bytes, stripped its types and
  evaluated it. Both old selections return `false`. The repaired reacquisition
  selection and the repaired `governanceInput` selection for `target.txt` and
  `keep.txt` return `true`.
- These five files still match the hashes in `evidence.json`:
  `default_library.ts` (eaff034…), `rc2-assessment-intake.test.mjs`
  (60efacd…), product `worksite_command_execution.ts` (0d9a133…), GTL
  `worksite_command_execution.ts` (edeb385…) and
  `t287-worksite-command-execution.test.mjs` (1c02eada…).
- I ran none of the three cases. Their fixtures create scratch worksites, and
  the canonical `build/` predates the intake predicate. I ran no build and
  wrote no generated output.

### Open

- Declared Testing has not run yet: the isolated build, the five intake cases
  and the three named cases.
- Unchanged residuals, none claimed here: the prior full owner-file run timed
  out (two 180 s cases and the 600 s outer limit), the canonical
  generated-file deletions still need reconciliation through ABG, and full
  owner-suite acceptance, fifteen-family qualification, model-identity
  independence, installed-CLI early-refusal proof and RC2 release readiness
  are open.

## Fixture-repair-01 local repair: `fixture-tests` failure diagnosis

Input: Testing Result `3607433a…`, command ordinal 4 (`fixture-tests`): exit 1,
no timeout, no signal, empty stderr, 4616-byte stdout (`sha256:bee000fc…`),
pass count 2. Grant unchanged: the two test files and this note.

### The actual failure stream was not read

- The full stdout body and predicate evidence bodies are not in this work
  unit's readable scope. The planning view marks them
  `omittedFromPlanningView` and says field paths confer no access. I did not
  read `.abiogenesis/` or any runtime, archive or result store.
- So the failing case, its assertion or thrown error, and its file and line
  are **not identified**. Nothing below is inferred from the planning view.
- Why the planning view did not show it: `planningStream`
  (`code/src/product/default_library.ts:194-195`) displays only lines that
  contain `***` or `[error]`, plus the first and last line. Node's spec
  reporter marks failures with neither marker. A 4616-byte stream, well under
  the 8192-byte display bound, therefore showed 105 bytes: the VM-modules
  warning and a trailing `  }`, with `omittedCandidates: 0`. Only UAT is given
  full producer streams (`abg/default_library.ts:234-235`). Construction
  gets the bounded view (`:201`).

### What admitted counts plus source do establish

- The name filter matches exactly the three named tests: reacquisition `:215`
  and `:269`, currentness `:597`. The names are unique, and there are no
  subtests or suites. Pass 2 with exit 1 means exactly one did not pass. The
  view doesn't say whether it failed, was cancelled, or failed to load at file
  level.
- Both reacquisition cases build the same `declarationFixture(t,false,true)`.
  It runs `constructGovernanceWorkState(original)` and
  `assert.ok(p.isGovernanceWorkState(raw))` before any case-specific step, so a
  refusal there fails both cases. With 2 passes, at least one reacquisition
  case passed, so the repaired reacquisition selection passes intake in the
  built Product.
- So the failure is either U1-P5-02 (or a failure loading the currentness
  file), or exactly one reacquisition case at a step after the shared fixture.

### Classification against owner code (source reading, not stream evidence)

- (a) incomplete fixture repair: **not supported by the source.**
  - No owner on the exercised Testing or observed-C2 paths reads, digests,
    path-normalizes or context-limits `candidate.txt`, `rubric.json`,
    `<path>.source` or `<path>.rubric`. `abg/default_library.ts` reads
    `assessment` only in the UAT branch of `nativeTask` (`:216-253`). The
    Testing owners (`projectGovernanceTestingTask`, `testingTask`,
    `observeGovernanceWorksite`) read `original.sources`, `readRoots`, the
    context bounds and `testing`. `abg/native_work_reacquisition.ts` and
    `abg/worksite_input_provenance.ts:419-421` see the roles only through
    `isGovernanceWorkState`.
  - In U1-P5-02, `governanceConsumers` (`:285-302`) replaces the assessment
    with the disjoint selection it writes as files. That selection is the same
    as before this repair. `observedConsumers` computes its expected trace
    counts (6/12/18) and its acquisition and preparation refs from actual
    events, not from role paths.
  - No same-file expectation (digest, file list, context count, trace count,
    selected path) encodes the old single-path selection.
- (b), (c), (d): cannot be told apart without the stream. The U1-P5-02 chain
  also runs `c0Success`, `semanticFoldConsumer`, `revisionIntakeConsumer` and
  `revisionEvidenceConsumer`, none of which uses `governanceInput`. Whether
  the three cases passed before the intake increment is not observed in this
  trial.

### Disposition

- No repair made. Neither test file changed in this work unit. Editing them
  without an identified cause would be speculative.
- Dependency returned (outside this grant): identifying the failure needs the
  actual `commandResults[4].stdout` body. Either supply it to the work unit
  through a declared read, or change the owner so the Construction view
  carries failure lines. The second means changing the `planningStream`
  candidate rule at `code/src/product/default_library.ts:194-195`; the
  existing bound would carry all 4616 bytes.

### Construction self-checks (not Testing evidence, not acceptance)

- In memory: I extracted `governanceAssessmentRolesDistinct` from the current
  `code/src/product/default_library.ts` and evaluated it on the selections
  parsed from the current test files. The repaired reacquisition selection
  (`source.txt` / `candidate.txt` / `rubric.json`) is `true`. The repaired
  `governanceInput` and `governanceConsumers` selections for `target.txt` and
  `keep.txt` are `true`. Both old single-path selections are `false`.
- sha256 of the five protected files matches `evidence.json`: eaff034…,
  60efacd…, 0d9a133…, edeb385…, 1c02eada…. The two test files still match
  the inventory identities (b79d5265…, 3a05a432…).
- I ran no build, tests, network or install, and wrote no scratch or
  generated files. A root `ls -a` and `git status` listed file names outside
  the readable scope; I read none of their contents.

## Candidate-rc2-01 Construction: 5.0.0-rc.2 identity and candidate claim

Task: `rc2-operator-inputs/candidate-rc2-01/task.md`. Grant: `package.json`,
`package-lock.json`, `code/src/product/contracts.ts`, `release-claim.md` and
this note.

### Pre-edit checks

- All seven `preserveFiles` in `candidate-rc2-01/evidence.json` matched before
  editing and still match after: eaff034…, 0d9a133…, edeb385…, 60efacd…,
  1c02eada…, b79d5265…, 3a05a432….
- None of the four granted files showed `rc.2`. All carried `5.0.0-rc.1`.
- `release-claim.md` before the edit hashed to `sha256:d3e9cb70…be21`, the
  same as `git show v5.0.0-rc.1:…/release-claim.md`. The RC1 claim stays
  intact at its tag.

### Identity mechanism

- `scripts/generate-product-manifest.mjs:90,130-135` derives the Product ID
  from `package.json` `version` and refuses unless `name`, `version` and the
  derived ID equal `ABI5_PACKAGE_NAME`, `ABI5_PACKAGE_VERSION` and
  `ABI5_PRODUCT_ID` from `contracts.ts`. `scripts/refresh-candidate-basis.mjs`
  rewrites `test_env/fixtures/abi5-root-candidate-basis.json` from the built
  manifest and the actual `npm pack` archive. `default_library_identity.ts`
  has no version literal. No other source file or generator needs an edit
  for the build and packaging path.
- The C2 context pin (`gtl/worksite_command_execution.ts:36`) covers only
  `build/code/src/product/worksite_command_execution.js`. That module does not
  import `contracts.js`, so the version change leaves the pinned bytes
  unchanged by construction. The build, not this note, verifies the pin.

### Bounded change

- `package.json`: `version` only, `5.0.0-rc.1` → `5.0.0-rc.2`.
- `package-lock.json`: top-level `version` and `packages[""].version` only.
  When both version fields are reset in memory, the parsed lock is equal to
  `HEAD`, so dependency versions, `resolved` and `integrity` are unchanged.
- `code/src/product/contracts.ts`: `ABI5_PRODUCT_ID` and
  `ABI5_PACKAGE_VERSION` literals only. No type, shape or runtime line
  changed.
- `release-claim.md`: rewritten as a local, unqualified `5.0.0-rc.2`
  development-preview candidate with no tag, publication or deployment. It
  states the delta (C2 diagnostics plus the pin, intake role separation, the
  two-line fixture repair, identity) and the open limits: qualification,
  model-identity independence, owner-suite timing (two 180 s cases and the
  600 s outer timeout), installed-CLI early-refusal proof, partial
  diagnostics, RC1-carried defects, the release boundary including native
  human response/resume, and generated-output reconciliation. It reports no
  test result and keeps the earlier ENOENT fixture command as a failure.

### Construction self-checks (not Testing evidence, not acceptance)

- In memory: both JSON files parse. The `package.json` and lock objects equal
  `HEAD` once the version fields are reset. The generator's identity
  predicate holds over the edited `package.json` and `contracts.ts`.
- `git diff -U0` shows 5 changed version lines across the three identity
  files.
- I ran no build, generator, pack or test, used no network or install, wrote
  no scratch or generated file and touched no RC1 artifact, tag or install.

### Dependencies returned (outside this grant, left unchanged)

Literal `5.0.0-rc.1` identities remain outside the Testing plan:

- `test_env/tests/t287-selected-action.test.mjs:87` passes
  `expectedPackageVersion:'5.0.0-rc.1'` against the actual verified artifact.
  This will likely mismatch an rc.2 artifact. Not observed.
- `t287-default-library-fulfillment.test.mjs:17` and
  `t287-governance-covered-source-use.test.mjs:27` pair
  `ABI5_PRODUCT_ID` (now rc.2) with literal `packageVersion:'5.0.0-rc.1'`.
  Whether an owner rejects that pairing is not observed.
- The `test_env/qualification/` recipe (`tenant-manifest.json`,
  `resources.json`, `build-resources.mjs`, `classification.json`, comments)
  and the qualification-scope tests describe the RC1 subject. They need
  repricing before any RC2 qualification.

### Open

- Declared Testing on the RC2 candidate has not run: isolated build, basis
  refresh, seven diagnostic/intake cases, three fixture cases, packed-artifact
  and installed-language smoke. Artifact identities are not yet observed.
- Unchanged residuals: full owner-suite acceptance and timing, fifteen-family
  qualification, model-identity independence, installed-CLI early-refusal
  proof, canonical generated-output reconciliation and the RC2 cut decision.
