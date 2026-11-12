# TD-28 retirement map

Commentary for T-292. This map states facts and verdicts by function; it rules
nothing. The Executive rules each capability against the owner decision of
2026-11-12 (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:95-127`).

## 1. Basis, method and limits

- Repository `/Users/jim/src/apps/abiogenesis`, branch `main` at `c1f655735`.
  `T` = `build_tenants/abiogenesis/typescript`. Source paths are relative to
  `T/code/src` unless they start with `T/`, `specification/` or
  `.ai-workspace/`.
- Declaration graph: TypeScript compiler API from `T/node_modules`, built at
  `b13bdd5c2`; scratch under `/private/tmp/abg-td28map-work/`. Between
  `b13bdd5c2` and `c1f655735` four files changed in `code/src`
  (`abg/event_prefix.ts`, `abg/project_read_definition_bindings.ts`,
  `abg/runtime_history.ts`, `abg/witness_definition_bindings.ts`); none is a
  capability file. Every line cited here was re-read at `c1f655735`.
- Reachability roots: the two CLIs (`public/cli.ts`, `public/codex_cli.ts`);
  the spawned C2 helper (`implementation/worksite_command_helper.ts` `main`);
  the spawned GC03 client (`abg/governed_context_client.ts`); the 62 named
  imports of `T/scripts/generate-product-manifest.mjs`; the 29 typed native
  locators; the 14 definition-binding exports named in
  `public/binding/owner_contract_source_set.ts`; the `./public` SDK. String
  locators (`modulePath: "build/code/src/….js"` with `namedSymbol`) are edges.
  Package barrels (`product/index.ts`, `gtl/index.ts`, `abg/index.ts`) are not
  roots (TD-45 ruling).
- **Decl lines**: lines of the declarations that leave: the capability's own
  declarations (seed) plus declarations that no root reaches once the seed is
  gone (newly dead). Lines edited inside kept declarations at coupling sites are
  not counted; section e of each capability names those sites. **File lines**:
  `wc -l` of whole files.
- Marking: a statement with a file and line is read at `main`. "Inferred" marks
  a conclusion drawn from read facts. "Likely" marks a reachability or usage
  claim whose callers I did not follow to a root.
- Recorded history: `rg -uu` over `.ai-workspace` (154 GB) and `T/test_env`
  for 52 capability patterns (event kinds, task and contract kinds, program,
  graph-function and module refs, Public members, policy keys): 180,454 files
  hit. 611 line-based event logs and 32 JSON-array logs were parsed. A hit
  counts as run-time only outside the `public_operation_artifact_admitted`
  resolved-lock rows, which copy the install catalog into every installed Run.
- Limits: no build and no test run. Test attribution is by pattern and by
  reading, not by execution. Decl lines exclude `build/`, `.d.ts` and generated
  contracts.

## 2. Shared facts

### 2.1 What ships, and what the default configuration uses

Ten module publications ship (`T/scripts/generate-product-manifest.mjs:1091-1102`).
Read from the publications the generator constructs:

| Module | Programs | Graph functions | Capability |
|---|---|---|---|
| `abiogenesis/default-library/default@5` | `default` | construction, design, executive, executive-step, induction, review, specification, testing, uat | current |
| `abg/consensus@5` | `system/consensus-one-surface` | 8 | TD-26 |
| `abiogenesis/worksite/construction@5` | `branch-construction`, `construction`, `file-parents`, `file-replace` | branch-construction (+ branch-application, reduce), construction (+ reduce, vector-application), file-parents, file-replace | C3, C1, C0 |
| `abiogenesis/worksite/command-execution@5` | `command-execution`, `native-command-reacquisition`, `revision-command-execution` | the same three | C2 (stays), reacquisition (current), revision |
| `abiogenesis/worksite/native-work@5` | `native-work`, `native-work/assessment` | the same two | current |
| `abiogenesis/worksite/command-forward@5` | `command-forward` | command-forward, command-forward/execute | forward |
| `abiogenesis/requirement-handoff@5` | `requirement-handoff` | `requirement-handoff` | semantic family |
| `abiogenesis/semantic-stage@5` | `semantic-stage` | `semantic-stage` | semantic family |
| `abiogenesis/semantic-revision@5` | `semantic-revision` | `semantic-revision` | semantic family |
| `abiogenesis/qualification/self-conformance@5` | 7 | 7 | TD-29 |

- The default library binds seven F_D operations (`gtl/default_library.ts:15-20`).
  `"prepare-testing"` maps governance state straight to the C2 task contract
  through `prepareObservedTestingTask` (`:19`); `"prepare-native"` maps it to
  the native-work task (`:18`). The default library does not use the six C2
  preparation bindings that select C1, C3 or revision
  (`gtl/worksite_command_execution.ts:149-167`).
- The live rc.12 Run
  (`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/live-01/events.json`,
  1,692 events) references the default-library graph functions, C2
  (`graph-function://abiogenesis/worksite/command-execution@5`, 106 refs),
  native work and native-work assessment, and the policy
  `abg.default_library_prerequisites`. It does not select
  `abg.default_library_fulfillment`.
- Recoverable failure: `abg/default_library.ts:153-170` lists the
  unrecoverable native classes (`write_scope_violation`,
  `transport_identity_mismatch`, `assessment_independence_mismatch`); selector
  refusals and native work or assessment failures with attributable effects
  return to the Executive; a C2 failure stops the Run.

### 2.2 Event kinds stay declared

`LEGACY_ROOT_EVENT_KIND_VALUES` (`abg/event_store.ts:58-100`) feeds an immutable
legacy digest guarded at `abg/event_store.ts:1076-1084` ("the immutable legacy
event-contract table changed"); the current-profile digest
`ROOT_EVENT_CONTRACT_DIGEST` is set at `:1213`. Removing a kind changes both.
Precedent TD-25R (register line 208): producers retire, "The four kinds stay
declared with their schema", and replay of recorded logs is compared before and
after. This map applies the same rule to every capability: producers, members
and bindings leave; event kinds, their schemas and their axioms stay.

### 2.3 What a caller gets for a retired member

A member still declared in the operation contracts but without a binding is
refused at transport with `installed_binding_unavailable`; a member removed from
the contracts gets `unknown_definition`
(`public/installed_definition_call_transport.ts:247-256`; codes at `:40-49`).
`T/test_env/tests/t287-framework-handoff-types.test.mjs:230-275` asserts the
first outcome for the nine declared unbound members of today.

### 2.4 The C2 renderer pin

`gtl/worksite_command_execution.ts:33-62` pins the digest
`sha256:b7dfeb2c3c287e5bd4a17fc25570911276cb330215e734b704a01d90c798657f`
(116,268 bytes) of `build/code/src/product/worksite_command_execution.js` and a
span (bytes 106,183 to 108,615) inside the C2 run-environment declaration; the
generator verifies the pin (`T/scripts/generate-product-manifest.mjs:93-106`).
Any byte change to `product/worksite_command_execution.ts` changes the C2
publication and the manifest pins. Forward, revision, C1, C3 and preparation all
have cut sites in that file, so every package that touches them re-pins C2.

### 2.5 The qualification gate depends on C1

`abg/qualification_proof.ts:636-660` (`nativeConstructionAuthors`) accepts an
author only when the producing C-call's implementation is
`WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef` and the value is a
`WorksiteCandidateBundle` ("C1's actual admitted candidate owner establishes
byte authorship"). `validator/qualification.ts:553` refuses any other
provenance with `"external_attribution_requires_future_judgment"`. Inferred:
bytes written by native workspace work have no authorship route through this
gate today, and with C1 gone no route remains. Qualification has not run
(TD-29); the Executive's TD-29 ruling decides what this gate becomes.

### 2.6 The dependency graph between the capabilities

Read from imports and the declaration graph:

- One module constructor publishes four capabilities.
  `gtl/worksite_construction.ts` (`constructWorksiteConstructionModulePublication`)
  publishes C1, the C3 parts (`:464-650`), C0 file replace and file parents
  (`:156-613`), and the preserved-result contract and bindings of recovery
  (`:111-610`, `:596`).
- C3 composes C1 (one C1 construction per branch); C1 composes C0 file replace
  (a child batch).
- C2's module constructor binds the six preparation F_D bindings
  (`gtl/worksite_command_execution.ts:149-167`): the C1 selector and preparer,
  the C3 selector and preparer, the revision selector and preparer. It also
  publishes the revision Program (`:226-258`).
- Forward consumes a closed C1 result (`product/worksite_command_forward.ts:24-55`)
  and builds on revision's task types (`:80-83`).
- Recovery imports C1 and semantic stage (`abg/worksite_construction_recovery.ts:112-148`,
  `taskBridge`).
- Revision imports C1 and the semantic types. Semantic revision, semantic job,
  semantic stage and worksite revision import each other: one strongly
  connected component.
- Semantic stage and semantic job compose C0 file parents
  (`gtl/semantic_stage_publication.ts:27-28`, `abg/semantic_job.ts:312`,
  `product/semantic_job.ts:708`).
- Requirement handoff is imported by the semantic modules and by kept owners
  (default-library fulfillment, run environment, qualification, GC03; 4.7 e).
- The default library imports from the chain:
  - `invocationRootAtPrefix` from `abg/semantic_job.ts` (`abg/default_library.ts:14`,
    used at `:59`);
  - three requirement-handoff schemas and `groundBoundSourceQuote`
    (`product/default_library_fulfillment.ts:4, 11`);
  - the semantic-stage `POLICY_SCHEMA` and `SHAPE_SCHEMA` (`:5`).
- Native-work reacquisition and governance-covered source use import revision's
  binding-cover helpers (`abg/native_work_reacquisition.ts:87-414`,
  `abg/invocation_execution_truth.ts:151-260`,
  `abg/construction_continuation.ts:761-763` into `abg/worksite_revision.ts:121-160`).
- The four independent capabilities have no edge to the chain:
  - result assessment;
  - the witness acts;
  - regsel;
  - GC03, except one requirement-handoff schema import (3.2 e).

Inferred consequence: the chain can only leave in one order. Forward and
recovery (leaves) go first. Revision and the semantic family go next, then
requirement handoff (after its schemas are rehomed), then C3 with preparation,
then C1, then C0. Regsel, GC03, result assessment and the witness acts are
independent of the chain and of each other.

## 3. Capabilities decided to retire

### 3.1 Native registered-selection task route

**a. What it does.** A native coding agent, instead of a model call, answers a
registered-selection choice. The runtime renders a `registered_selection_task`
with the native renderer `renderer://abiogenesis/registered-selection/native@5`.
The agent returns a `registered_selection_response`, which is materialized into
the registered choice.
- Code: `product/registered_selection_native.ts`;
  `abg/instruction_assembly.ts:291-365, 536-568`; the native role at
  `gtl/stdo_run_environment.ts:193-208`.
- Specification: no Product sentence or requirement names it. The general
  selection law is SELECTION-BOUNDARY-016..019
  (`specification/requirements/README.md:124`).
- Decision: retire (register line 101). No feature identifier.

**b. Who uses it.**
- Shipped Programs: none. The default library selects through its F_P `select`
  binding (`gtl/default_library.ts:17`, `selectGovernanceWork`).
- Kept code dispatches on it at:
  - `abg/c_call_outcome.ts:1257-1258`;
  - `abg/instruction_assembly.ts:512-525`;
  - `hog/ccall_lifecycle.ts:484`.
- The `./product` barrel exports it (`product/index.ts:3-5`).
- Whole test files:
  - `t287-native-registered-selection.test.mjs` (151);
  - `t287-native-selection-profile-scope.test.mjs` (66);
  - `fixtures/registered-selection-product/native.mjs` (64).
- The recursive test is not regsel-only.
  `t287-recursive-registered-selection.test.mjs` (601) with
  `fixtures/registered-selection-product/recursive.mjs` (108) proves recursion,
  child-failure foldback and pending resume through a fixture that declares
  "one native selector" (test `:43`; fixture `:1, 50, 69-71`). Its cases:
  - `:26` run.continue arms (a contract test; no selector);
  - `:43` the fixture's native selector;
  - `:55` counterevidence survives child returns until parent evaluation;
  - `:163` an authenticated recursive child failure keeps its diagnostic, prior
    work and cold failed truth;
  - `:296` a live native choice revised from child evidence
    (`ABI5_RECURSIVE_SELECTION_LIVE`);
  - `:406` a same-Run pending-execution resume;
  - `:505` a cold `pending_execution` resume.
- Default-lane counterparts, read by test title:
  - `:505` matches `t287-default-library.test.mjs:2005`;
  - `:163` overlaps `t287-recursive-failure-foldback.test.mjs:193-251`
    (declared child-failure foldback), but that file does not assert "cold
    failed truth";
  - `:55` and `:406` have no counterpart I could name. Likely: the default
    library's mandatory parent evaluation (`t287-default-library.test.mjs:135, 179`)
    covers part of `:55`.

**d. Removal inventory.**
- Specification: none.
- Design: `T/design/T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` (306;
  whole note, likely: confirm it owns nothing about the kept registered-selection
  application); the stale mention at `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:629`.
- Source, 184 decl lines, nothing newly dead:
  - `product/registered_selection_native.ts` (74 file lines, 60 decl);
  - `abg/instruction_assembly.ts` (108);
  - `gtl/stdo_run_environment.ts:193-208` (16);
  - cuts at the three dispatch sites.
- Generated: the native role row of the run-environment declarations that
  carry it (likely; confirm by generator diff).
- Tests:
  - 281 file lines deleted (three files);
  - the recursive test and its fixture (709 lines) are edited, not deleted. The
    cases at `:43` and `:296` (about 120 lines) go; the fixture's selector is
    rewritten to the default F_P registered selection; the cases at `:26`,
    `:55`, `:163`, `:406` and `:505` stay, because they prove recursion and
    resume, which are current features.
- Qualification mirrors: `T/test_env/qualification/inventory.json`,
  `recipe/verification-recipe.json`, `recipe/expected-output-inventory.json`
  (2 refs each).

**e. Coupling.** None with the chain. It shares `abg/instruction_assembly.ts`,
`gtl/stdo_run_environment.ts`, `abg/c_call_outcome.ts` and
`hog/ccall_lifecycle.ts` with chain packages (edit conflicts only) and no file
with GC03.

**f. Recorded history.** Two logs, both test runs:
`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/registered-selection-native/attempt-04`
and `.../registered-selection-recursive/attempt-01`. No default-library log.

**g. Public contract change.**
- No Public operation, member or event kind (the task travels in
  `c_call_result_admitted` values).
- Leave: the contract kinds `registered_selection_task` and
  `registered_selection_response`; the `./product` exports
  `isNativeRegisteredSelectionTask`, `isNativeRegisteredSelectionResponse` and
  `materializeNativeRegisteredChoice`.
- Inferred: a Program that declares the native selector role is refused at
  declaration validation.

### 3.2 Governed context (GC03) with its Python adapter

**a. What it does.** GC03 selects a bounded set of context artifacts for a
native actor's invocation through a host lookup adapter, and gives the actor a
permit-checked query channel.
- Adapter: `code/support/governed-context/host_adapter.py` (199 lines),
  published as `contracts/governed-context/host_adapter.py` with
  `selection.json`.
- Policy: `abg.governed_context` (`abg/governed_context.ts:812`).
- Query channel: `abg/actor_process.ts:848-1391`.
- Design: `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1505-1669`;
  `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md:941-1031`.
- No requirement names it. Decision: retire (register line 101). TD-59 records
  that it is refused as `basis_stale` against the Product's STDO 3.0.4.

**b. Who uses it.**
- The default library carries an optional hook,
  `projectGovernedContextTestingAtPrefix` (`abg/default_library.ts:612-645`).
  No shipped Program selects the policy; rc.12 does not.
- The generator imports it and writes the adapter and selection contract
  (`T/scripts/generate-product-manifest.mjs:3, 384-401, 422-424`).
- The client `abg/governed_context_client.ts` is a spawned root.
- Tests:
  - `t287-governed-context.test.mjs` (1,062) and
    `support/t287-governed-context.mjs` (129);
  - `r1-packed-artifact.test.mjs` (11 refs; it runs in `test:r1` to `test:r9`
    and `test:m4`);
  - `support/evidence-gates.json` (6 refs).

**d. Removal inventory.**
- Specification: none.
- Design: the two sections above (165 and 91 lines).
- Source, 903 decl lines (61 already unreachable today):
  - `abg/governed_context.ts` (987 file lines, 827 decl);
  - `abg/governed_context_client.ts` (58, 42);
  - `abg/default_library.ts:612-645` (34);
  - about 165 lines of cuts in `abg/actor_process.ts:848-1391` (the
    `queryArtifacts: () => null` default at `:1031` stays);
  - about 22 generator lines;
  - `code/support/governed-context/host_adapter.py` (199).
- Generated: `contracts/governed-context/host_adapter.py`, `selection.json`.
- Tests: 1,191 file lines; edits in `r1-packed-artifact.test.mjs` and
  `support/evidence-gates.json`.

**e. Coupling.** `abg/governed_context.ts:896-903` imports
`CONTEXT_DECLARATION_SCHEMA` from requirement handoff. GC03 goes before the
requirement-handoff package, or that package rehomes the schema first (it must
be rehomed anyway for the default library). GC03 shares
`abg/default_library.ts` with nothing else in this map.

**f. Recorded history.** The policy `abg.governed_context` (value
`member://abi5-tests/gc03/private-policy@5`) appears only in rc3 dogfood runs
of the test Program `program://abi5-tests/sandbox-uat/lifecycle@5`:
- `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/witness-001-prep/runtime-b09-002`,
  `runtime-b10-003` and `runtime-b11-004`;
- `setup-001` and `setup-002`;
- the call requests and the attempt-007/008 terminals.

No default-library Run selected it.

**g. Public contract change.** No Public operation or event kind. The published
adapter and selection contract leave. Likely: a Program that still declares the
policy key `abg.governed_context` gets an undeclared-policy outcome; this was
not traced.

## 4. Capabilities to be ruled

Twelve logs carry the identifiers of every capability in this section; they
are called "the inventory logs" below. All are Runs of the qualification
Programs (TD-29) and their conformance fixtures:
- `program://abiogenesis/qualification/native-runtime@5`, `exact-candidate@5`,
  `self-conformance@5`, `assess@5`;
- `program://abiogenesis-qualification/a01/*`;
- `program://abiogenesis/conformance/hello-world@5`.

They live under `.ai-workspace/comments/codex/`:
- `20260921_TRUSTED_DESKTOP_STEEL_THREAD/native-reacquisition-01` (6 logs);
- `20260921_TRUSTED_DESKTOP_STEEL_THREAD/qualification-release-composition-01`;
- `20260921_TRUSTED_DESKTOP_STEEL_THREAD/native-body-installed-01`;
- `20260922_AF22_PROOF_REUSE/installed-proof`;
- `20260922_QUALIFICATION_CONTRACTION/installed-proof-02`;
- `20260928_FRAMED_GOVERNANCE/final-native-setup-03`;
- `20260928_FRAMED_GOVERNANCE/final-f11-native-assessment-execution-01`.

Where the hits sit:
- **All twelve logs.** The qualification declaration inventory:
  `basis_admitted` at `payload/rawInputValue/proof/declarations[]` or
  `payload/rawInputValue/task/declarations[]`, and `c_call_result_admitted` at
  `payload/value/input/proof/declarations`. About 80 identifiers per event; no
  capability executes.
- **The two FRAMED_GOVERNANCE final logs only.** Here a native actor serves C2
  (`program://abiogenesis/worksite/command-execution@5`) under
  `program://abiogenesis/qualification/assess@5`. Fourteen identifiers sit in
  `actor_transport_binding_admitted` at
  `payload/instructionAssembly/envelope/nativeBasis/publication`. That field
  holds the C2 module publication the native actor receives: its revision
  Program, graph function, bindings and closure, and its C1, C3 and preparation
  contracts and bindings.
- These are C2 logs. When K1, K2, K5 or K6 change C2's module, the envelopes
  recorded in these two logs keep the old content. They are not default-library
  Runs. The rc.12 envelopes embed `module://default-library-witness/witness@5`
  instead, with no capability identifier (6.4).

Each section f below counts the logs beyond these twelve.

### 4.1 Worksite construction (C1)

**a. What it does.** C1 is a construction Program in which a model worker
returns file contents as text and deterministic owners apply them:
1. the F_P worker returns a result;
2. it is validated into a `WorksiteCandidateBundle`;
3. an F_D join turns the bundle into a `WorksiteFileReplaceVector`;
4. a child batch of C0 file replaces writes each file;
5. an F_D reducer returns one `WorksiteConstructionResult`.

The design states it: "C1 composes the existing ABIogenesis surfaces into one
generic construction Program"
(`T/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:26-48`). The
native-work design states its status: "C1 remains available when its closed
construction protocol is selected. It is not compulsory on this path."
(`T/design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md:34-36`). `specification/PRODUCT.md`
does not name it. The requirements it cites (WORKER-006, BINDING-016..018,
EVENTS-029..032) are general ABG law. No feature identifier.

**b. Who uses it.**
- Publication: `program://abiogenesis/worksite/construction@5` in
  `module://abiogenesis/worksite/construction@5`.
- Composers and binders:
  - C2's preparation (`gtl/worksite_command_execution.ts:149-153`);
  - C3's branch application;
  - semantic stage and job (`product/semantic_stage.ts:68-343`,
    `product/semantic_job.ts:635-892`);
  - recovery and forward.
- Kept code with cut sites:
  - `abg/execution_basis.ts:549-2536`;
  - `abg/instruction_assembly.ts:225-1188`;
  - `abg/qualification_proof.ts:642-652` (2.5);
  - `abg/worksite_input_provenance.ts:257-512`;
  - `gtl/stdo_run_environment.ts:63-66`;
  - `product/builtin_semantics.ts:149-851`;
  - `product/declaration_closure.ts:648`;
  - `product/execution_resolution.ts:843`;
  - `product/worksite_command_execution.ts:277-1668` (a C2 task accepts a
    construction result as its source).
- Default library: no use; rc.12 does not reference it.
- Whole test files, 2,496 lines:
  - `t287-worksite-construction.test.mjs` (1,022);
  - `t287-live-worksite-construction.test.mjs` (291);
  - `w2-steel-single-start.test.mjs` (145);
  - `w2-steel-single-start-installed.test.mjs` (608);
  - `support/single-start-worksite-program.mjs` (430).
- Edits in:
  - `t287-default-library.test.mjs` (a C1 branch at `:874-880`);
  - `t287-qualification-scopes.test.mjs` (7 refs);
  - `t287-c2-core-environment.test.mjs`, `t287-worksite-command-execution.test.mjs`,
    `steel-basic-cli-c2.test.mjs`, `steel-basic-cli-public.test.mjs`;
  - `support/root-cli-environment.mjs`, `support/root-installed-environment.mjs`,
    `support/declared-testing-capability.mjs`;
  - `falsifiers/runtime-f09-worker.mjs`.

**c. Functional equivalence.** The default configuration constructs through
native workspace work. A native coding agent edits the worksite in its own
loop; ABIogenesis observes it before and after, records `changedPaths`, and
native-work assessment judges the result. That delivers "produce source changes
for a selected task". Four things C1 offers that native work does not:
1. The model never touches the filesystem; every write is a deterministic
   owner effect.
2. Per-file write guarantees from C0. These are revalidation of the exact
   predecessor, territory and protected-root checks, refusal of symlinked or
   out-of-territory targets, same-directory atomic publication, a zero-delta
   install inventory, and Event Calculus currentness from current(O0) to
   current(O1) (`T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md:166-200, 382-426`).
   The native path states the opposite:
   - "before/after observations and `changedPaths` cover only selected worksite
     facts, not absence of off-scope writes… This presentation adds no
     containment guarantee, effect scanner…" (native design `:58-66`);
   - "trusted-developer workspace boundary, not hostile-workstation containment"
     (`:82-86`);
   - "physical work is not represented as an atomic rollback" (`:96-104`).
3. A declared target set fixed before the worker runs.
4. The typed candidate bundle as byte-authorship evidence, which is the only
   author route of the qualification independence gate (2.5).

Verdict: **partly**. Construction is delivered. Lost: the contained-write mode
(model output applied only by owner-checked atomic per-file writes with
currentness) and the only authorship route of qualification.

**d. Removal inventory.**
- Specification: none names C1.
- Design:
  - `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md` (805, whole);
  - `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md` (407): whole
    except section 1, "Typed retention at the graph edge" (`:57-179`), which
    describes the retention the default library uses (likely; confirm);
  - mentions in `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` (31),
    `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md` (16) and the native design
    `:34-36`.
- Source, whole files, 2,125 file lines:
  - `gtl/worksite_construction.ts` (653);
  - `implementation/worksite_construction.ts` (285);
  - `product/worksite_construction.ts` (1,073);
  - `product/worksite_construction_identity.ts` (114).
- Decl lines:
  - alone: 3,992 (1,921 seed and 2,071 newly dead). C3's publication parts and
    the C0 owners die with C1's module constructor.
  - in chain order (after C3, preparation and the semantic family have gone):
    1,829 for C1, leaving 1,534 C0 lines dead for package K7.
- Generated: the construction module (4 Programs, 8 graph functions) leaves
  `T/product-toolchain-manifest.json`. The C2 publication loses two
  preparation bindings and re-pins.
- Tests: 2,496 whole-file lines, plus the edits in b.
- Qualification mirrors: `T/test_env/qualification/recipe/expected-output-inventory.json`
  (3 refs).

**e. Coupling.**
- C1 can leave only after everything that composes or consumes it: recovery,
  forward, revision, the semantic family, C3 and preparation.
- The qualification gate (`abg/qualification_proof.ts:636-660`,
  `validator/qualification.ts:553`) changes in the same package, under the
  Executive's TD-29 ruling.
- C0 has no other composer once C1, C3 and the semantic family are gone, so it
  becomes dead code and follows in K7.
- `WORKSITE_CONSTRUCTION_GTL_IDS` lives in `gtl/worksite_construction_recovery.ts:36-40`
  and is read by C1's module constructor. If recovery goes first and C1 stays,
  it moves to `gtl/worksite_construction.ts`.

**f. Recorded history.** Beyond the twelve inventory logs, 42 logs carry C1
run-time identifiers:
- `.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-implementation` (12);
- `T/test_env` test runs (12);
- `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/p5-installed-final-04` (4);
- `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR` (4);
- `.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/c0-diagnosis-03` (1);
- others in single digits.

These include the order-summary single-start executions. No default-library log
carries one.

**g. Public contract change.**
- No Public operation, member or event kind.
- Leave: `module://abiogenesis/worksite/construction@5` with its four Programs;
  the contract kinds `worksite_construction_task`, `worksite_construction_worker_result`,
  `worksite_candidate_bundle` and `worksite_construction_result`.
- Inferred: a `run.start` naming the Program is refused at catalog resolution
  (refusal code not traced).

### 4.2 Construction recovery

**a. What it does.** Recovery handles a C1 worker whose transport failed after
it produced a result artifact. It admits the preserved artifact in a new
ordinary occurrence, without running the model again. The design states it:
"Select deterministic recovery in a new ordinary occurrence."
(`T/design/T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md:21-34`). Requirement
REQ-R-ABG3-TRANSPORT-014 (`specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md:43`):
"When an actor invocation reports timeout, crash, nonzero exit, or equivalent
transport failure after producing a candidate result artifact, ABG shall
attempt deterministic admission of that artifact against the original
`DispatchRequest`." TRANSPORT-003 (`:21`), -022 (`:59`) and -029 (`:73`) are
related. It accepts one failure shape only: `no_output`, status 0, zero tools,
empty `finalOutput` (`abg/worksite_construction_recovery.ts:296-305`). It needs
a semantic-stage bridge (`taskBridge`, `:112-148`). No feature identifier.

**b. Who uses it.**
- Construction: authors build the recovery graph function with
  `constructWorksitePreservedResultRecoveryGraphFunction`
  (`gtl/worksite_construction_recovery.ts:101`; `gtl/index.ts`).
- Publication: the construction module publishes the contract
  `worksite_preserved_result_artifact` and its bindings
  (`gtl/worksite_construction.ts:111-610, 596`). No shipped Program composes the
  recovery graph function.
- Kept code with cut sites:
  - `abg/c_call_outcome.ts:1281-1282`;
  - `abg/worksite_input_provenance.ts:332`;
  - `hog/ccall_lifecycle.ts:474-475`;
  - `implementation/contracts.ts:109`;
  - `implementation/leaf_invocation_port.ts:690-693`;
  - `product/builtin_semantics.ts:111-254`;
  - `product/declaration_closure.ts:618-619`;
  - `validator/validation.ts:1825-1826`.
- Whole test files, 862 lines:
  - `d1-preserved-result-mechanics.test.mjs` (72);
  - `t287-d5-authentic-preserved-result.test.mjs` (186);
  - `support/d1-preserved-result-harness.mjs` (54);
  - `support/d5-authentic-preserved-result-fixture.mjs` (550).
- Edits in `integration-shared-seams.test.mjs`, `t287-worksite-construction.test.mjs`,
  `t292-td37a-path-relation.test.mjs` and `support/evidence-gates.json`.

**c. Functional equivalence.** When a native actor fails (timeout, nonzero
exit, missing report), the default configuration keeps the partial edits in the
worksite and reports failure (native design `:96-104`). The Executive
re-selects recoverable classes, or a fresh Run tests the retained worksite
through native reacquisition (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:933-946`).
The work survives; the failed actor's report does not become admitted truth.
In-call salvage of a preserved artifact exists only in C1
(`implementation/worksite_construction.ts:232-233`) and Consensus
(`implementation/consensus.ts:613-616`, retired by TD-26). Likely: once C1,
recovery and Consensus are gone, no source realizes TRANSPORT-014.

Verdict: **partly**. Lost: admission in a later occurrence of a completed C1
proposal after its transport failed. It cannot outlive C1 or semantic stage.

**d. Removal inventory.**
- Specification: TRANSPORT-014 loses its realization (likely). That is a
  `requirement_reprice` if no other owner realizes it.
- Design: `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md` (176, whole).
- Source, 774 whole-file lines:
  - `abg/worksite_construction_recovery.ts` (457);
  - `gtl/worksite_construction_recovery.ts` (159);
  - `product/worksite_construction_recovery.ts` (158).
- Decl lines: 749 (700 seed, 49 newly dead in `abg/c_call.ts` 18,
  `gtl/semantic_stage_publication.ts` 26, `implementation/worksite_construction.ts` 18,
  `shared/process/facts.ts` 5).
- Generated: the construction module loses the preserved-result contract and
  bindings.
- Tests: 862 whole-file lines.
- Qualification mirrors: 10 refs in `inventory.json` and in
  `verification-recipe.json`, 6 in `expected-output-inventory.json`.

**e. Coupling.** Recovery is a leaf: it depends on C1 and semantic stage, and
nothing kept depends on it except the dispatch sites in b. It shares those sites
with forward, so the two form one package (K1).

**f. Recorded history.** No recorded execution: the only hits are the twelve
inventory logs. No default-library log.

**g. Public contract change.** No Public operation, member or event kind. The
contract kind `worksite_preserved_result_artifact` and the exported
constructor leave. Inferred: a declaration that composes the recovery graph
function is refused at declaration validation.

### 4.3 Branch construction (C3)

**a. What it does.** C3 runs an ordered vector of C1 constructions as
branches:
- it allocates disjoint write targets to the branches before any branch opens;
- it orders the branches by a declared `dependsOn` DAG and traverses them
  serially;
- a fan-in reducer folds the branch results into one flat construction result
  (`T/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md:59-100`).

Partial failure is specified at `:514-556`. The note is "pending independent
design review" (`:3-5`). No Product passage or requirement names it. No feature
identifier.

**b. Who uses it.**
- Publication: `program://abiogenesis/worksite/branch-construction@5` with
  three graph functions, inside the construction module
  (`gtl/worksite_construction.ts:464-650`).
- Bound by C2's branch preparation (`gtl/worksite_command_execution.ts:157-167`).
- Kept code with cut sites:
  - `abg/execution_basis.ts:558-2537`;
  - `abg/worksite_input_provenance.ts:257-534`;
  - `product/builtin_semantics.ts:130-370`;
  - `product/worksite_preparation.ts:40-221`;
  - `product/worksite_preparation_contracts.ts:26-91`.
- Whole test files, 2,090 lines:
  - `t287-worksite-branch-construction.test.mjs` (784);
  - `w2-steel-serial-branch-installed.test.mjs` (734);
  - `support/serial-branch-worksite-program.mjs` (572).

**c. Functional equivalence.** The default library splits multi-part work by
Executive selection of successive native-work steps and by recursion into child
graph functions. Lost:
- a declared, ordered branch DAG;
- disjoint target allocation checked before any write;
- one aggregate result over all branches;
- everything C1 loses (4.1 c).

Verdict: **partly**.

**d. Removal inventory.**
- Specification: none.
- Design: `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md` (860, whole);
  24 mentions in the C2 design.
- Source, 1,448 whole-file lines:
  - `gtl/worksite_branch_construction.ts` (574);
  - `implementation/worksite_branch_construction.ts` (116);
  - `product/worksite_branch_construction.ts` (758).
- Decl lines: 1,325 alone; 1,680 with preparation in chain order (K5).
- Generated: the Program and three graph functions leave the construction
  module. The C2 publication loses two bindings and re-pins.
- Tests: 2,090 whole-file lines.
- Qualification mirrors: 8 refs each in `inventory.json` and
  `verification-recipe.json`, 6 in `expected-output-inventory.json`.

**e. Coupling.** C3 depends on C1 and on `WORKSITE_C0_IDS`
(`gtl/worksite_branch_construction.ts:452`). It is depended on by preparation
and by C2's module constructor. The semantic modules read branch preparation
inputs (`abg/semantic_job.ts:357-464`, `abg/semantic_revision.ts:607-1013`,
`abg/semantic_stage.ts:364-385`). C3 therefore goes with preparation, after the
semantic family and before C1.

**f. Recorded history.** Beyond the inventory logs, 7 logs carry it:
- `20260909_D1_LIFECYCLE/native-implementation` (3);
- `T/test_env` runs (3): the parcel-summary serial-branch executions;
- `20260928_FRAMED_GOVERNANCE/final-observed-c2-01` (1).

No default-library log.

**g. Public contract change.** No Public operation, member or event kind. Leave:
the Program `branch-construction@5`, its three graph functions, and the contract
kinds of the branch task, vector, output vector and failure.

### 4.4 Preparation, C0 file replace and file parents

**a. What it does.**
- **Preparation.** Six F_D bindings in C2's module turn a construction request
  into a C2 command task (`gtl/worksite_command_execution.ts:149-167`;
  `product/worksite_preparation.ts`; `implementation/worksite_command_execution.ts`).
  A selector picks the C1, C3 or revision construction task; a preparer turns
  the closed construction result into the C2 task.
- **C0 file replace** (`program://abiogenesis/worksite/file-replace@5`). An
  owner effect that replaces one file. It revalidates the predecessor
  observation O0, checks protected roots and territory, refuses symlinked or
  out-of-territory targets, publishes atomically in the same directory, keeps a
  zero-delta install inventory, and records current(O0) to current(O1) in the
  Event Calculus (C0 design `:166-200, 382-426`).
- **C0 file parents** (`program://abiogenesis/worksite/file-parents@5`). It
  creates the parent directories of a planned file set (C0 design `:7-126`,
  prerequisite for the semantic plan).

No Product passage or requirement names any of them. No feature identifier.

**b. Who uses it.**
- Preparation:
  - composed only by C2's module;
  - read by the semantic modules and by recovery's `taskBridge`;
  - kept code with cut sites: `abg/execution_basis.ts:537-1978`,
    `abg/replay.ts:775`, `abg/traversal_route.ts:4123-4125`,
    `abg/worksite_input_provenance.ts:255-586`, `hog/ccall_lifecycle.ts:79`,
    `product/execution_resolution.ts:839-849`,
    `product/worksite_preparation_contracts.ts:92-178`. At
    `abg/traversal_route.ts:4123-4125` the default library's retained graph
    input takes the other branch (`constructRetainedGraphInput`);
  - the default library imports only the graph-input retention from
    `product/worksite_preparation_contracts.ts` (`gtl/default_library.ts:6`),
    and that stays.
- C0 file replace:
  - composed by C1, C3 (`gtl/worksite_branch_construction.ts:452`) and revision
    (`abg/worksite_revision.ts:628`);
  - kept code: `abg/c_call_outcome.ts:240-1130`, `abg/event_calculus.ts:126-131`,
    `hog/ccall_lifecycle.ts:150-630`, `product/builtin_semantics.ts:124-254`.
- C0 file parents: composed by semantic stage (`gtl/semantic_stage_publication.ts:27-28`)
  and semantic job (`abg/semantic_job.ts:312`, `product/semantic_job.ts:708`).
- Whole test files for C0, 2,720 lines:
  - `t287-post-binding-worksite-write.test.mjs` (1,546);
  - `t287-c0-correction-regressions.test.mjs` (127);
  - `t287-generic-job-worksite.test.mjs` (212);
  - `support/t287-generic-job-worksite.mjs` (94);
  - `support/c0-post-publication-failure.mjs` (741).
- Edits for C0:
  - `t287-native-work-currentness-consumers.test.mjs` (26 refs). It builds C0
    file-replace results next to native work (`:92-129`, `:652-752`, `:840-860`);
  - `support/t287-native-work-currentness-consumers.mjs` (12 refs);
  - `support/neutral-schema-product.mjs`;
  - `t292-binding-row-owner-differential.test.mjs`;
  - `t292-td36r-remaining-owners.test.mjs`.
- Preparation has no whole test file. Edits in:
  - `t287-c2-core-environment.test.mjs` (4 refs);
  - `support/single-start-worksite-program.mjs` and
    `support/serial-branch-worksite-program.mjs` (3 each);
  - `w2-steel-single-start.test.mjs`, `d2-acknowledgment.test.mjs`,
    `support/declared-testing-capability.mjs`.

**c. Functional equivalence.**
- **Preparation.** The default library's `prepare-testing` maps governance state
  straight to the C2 task (`gtl/default_library.ts:19`). Native reacquisition
  prepares C2 over native sources: "For selected historical native work, the
  Testing branch uses the existing `NativeWorksiteCommandReacquisitionRequest`…"
  (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:933-946`). Preparation serves only
  C1, C3 and revision sources. Verdict: **equivalent**, given that C1 and C3
  go. While C1 or C3 stays, preparation is its only route into C2 and stays
  with it.
- **C0 file replace.** Native work writes files with no containment guarantee
  and no atomic rollback (native design `:58-66, 96-104`). Verdict:
  **partly**, as C1. Lost: an owner-checked atomic single-file replacement with
  predecessor revalidation and per-file currentness. It has no composer once
  C1, C3 and revision go.
- **C0 file parents.** Native work creates directories in its own loop; only
  the semantic stage and job compose file parents. Verdict: **equivalent**.

**d. Removal inventory.**
- Specification: none.
- Design: `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md` (801, whole);
  the "D2-Only Preparation Tuple" section of the single-start note (`:343-369`).
- Preparation source:
  - `product/worksite_preparation.ts` (257 file lines);
  - 336 decl lines in all, including `implementation/worksite_command_execution.ts` (54),
    `product/worksite_preparation_contracts.ts` (74) and `product/worksite_revision.ts` (6).
- C0 source:
  - `gtl/worksite_c0.ts` (401) and `implementation/worksite_file_replace.ts` (759),
    1,160 file lines;
  - 1,619 decl lines alone (1,025 seed, 594 newly dead). This includes 574 decl
    lines of `product/worksite_operations.ts` (1,215 file lines; the rest stays)
    and 20 of `product/worksite_effect.ts`.
- What stays in C0's files: the `worksite_effect_refusal` kind
  (`product/worksite_effect.ts:188, 252`). Native work emits it
  (`implementation/native_workspace_work.ts:80`), and `abg/runtime_history.ts:703`
  and `abg/c_call_outcome.ts:424` read it.
- Generated: the Programs and graph functions `file-replace@5` and
  `file-parents@5` leave with the construction module. The C2 publication loses
  the two C1 preparation bindings and re-pins.
- Tests: 2,720 whole-file lines for C0, plus the edits in b.
- Qualification mirrors: 2 or 4 refs per mirror file.

**e. Coupling.**
- Preparation goes with C3 (K5).
- C0 goes last (K7).
- Replay hazard: `abg/event_calculus.ts:126-131` adds a
  `worksite-observation-dependency` for C0 output and post-publication failure
  results. Removing that branch changes the dependency derivation for recorded
  logs that hold C0 results (4.4 f). Under the TD-25R method those logs either
  keep a reader or leave the replay comparison set by explicit ruling.

**f. Recorded history.** Beyond the inventory logs:
- C0 has run-time hits in 43 logs:
  - `20260909_D1_LIFECYCLE/native-implementation` (11);
  - `T/test_env` runs (11);
  - `T287_COMMON_LIBRARY_DELIVERY_01/realization/p5-installed-final-04` (4);
  - `u1-physical-scope-successor-01` (2);
  - `20260911_D2_BOUNDED_REPAIR` (4);
  - others.
- File parents has run-time hits in 2 logs (`u1-physical-scope-successor-01`).
- Preparation has run-time hits in 37 logs, the same families as C1.

Two of the C0 hits are not C0 artifacts. In
`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-001/resources/events/runtime.events.jsonl`
and `.../runtime-003/...`, the hit is a `worksite_effect_refusal` value inside a
sandbox-UAT lifecycle Run (`program://abi5-tests/sandbox-uat/lifecycle@5`).
Native work also emits that kind. No default-library log carries any of the
three.

**g. Public contract change.** No Public operation, member or event kind.
Leave:
- the Programs and graph functions `file-replace@5` and `file-parents@5`;
- the contract kinds of the file-replace input, request, output and failure and
  of the file-parents plan;
- the preparation input contracts and the six preparation bindings of C2's
  module.

### 4.5 Command forward (C2 forward re-entry)

**a. What it does.** Forward re-runs C2 for a C1 construction result after a C2
attempt failed before dispatch, without rebuilding the construction. The design
states it: "The explicitly declared forward-only successor Program serves an
already selected C2 obligation whose preparation succeeded but whose C2 attempt
failed before actor dispatch. It consumes the original closed nested
construction result…" (`T/design/T287_C2_FORWARD_REENTRY_DESIGN.md:10-16`).
Its source carries the `constructionGraphCallRef` of the closed C1 call
(`product/worksite_command_forward.ts:24-36`), and its snapshot source kind is
`retained_construction` (`:50-55`). No Product passage or requirement names it.
No feature identifier.

**b. Who uses it.**
- Publication: `module://abiogenesis/worksite/command-forward@5` (Program
  `command-forward@5`; graph functions `command-forward@5` and
  `command-forward/execute@5`).
- No shipped Program composes it.
- Kept code with cut sites:
  - `abg/c_call_outcome.ts:1272-1273`;
  - `abg/execution_basis.ts:549-2624`;
  - `abg/invocation_admission.ts:1293`;
  - `hog/ccall_lifecycle.ts:477-478`;
  - `implementation/contracts.ts:108`;
  - `implementation/leaf_invocation_port.ts:678-681`;
  - `implementation/worksite_command_execution.ts:129-615`;
  - `implementation/worksite_command_helper.ts:256-1526`;
  - `product/builtin_semantics.ts:108-418`;
  - `product/declaration_closure.ts:608-613`;
  - `product/worksite_command_execution.ts:757-2421`;
  - `product/worksite_command_launch.ts:51-87`.
- The C2 task union `ExecutableWorksiteCommandTask = PriorTask | WorksiteCommandForwardTask`
  (`product/worksite_command_forward.ts:80-83`) is the type C2's implementation
  and helper accept.
- Whole test files, 509 lines:
  - `forward-command-contracts.test.mjs` (162) and `forward-command-owners.test.mjs` (71),
    both in `test:unit`;
  - `support/forward-command-harness.mjs` (40), `support/forward-observation-carrier.mjs` (48),
    `support/forward-owner-lookups.mjs` (121);
  - `fixtures/forward-command/input.mjs` (67).
- Edits in:
  - `t292-td37b-launch-identity.test.mjs`, `t292-td37a-worksite-subject.test.mjs`;
  - `t287-owned-process-lifetime.test.mjs`, `t287-c2-child-program.test.mjs`;
  - `t287-native-semantic-job.test.mjs`, `t287-w2-05-install-catalog-owner-chain.test.mjs`;
  - `steel-basic-cli-public.test.mjs`;
  - `uat/public-setup.mjs`, `support/installed-qualification-conservation.mjs`,
    `support/d2-frame-fixture.mjs`.

**c. Functional equivalence.** In the default configuration a C2 failure stops
the Run (`abg/default_library.ts:153-170`). Work continues in a fresh Run:
- "A fresh Run can make new progress on the same task/obligations without
  rebuilding a failed Run's scopes/parents."
  (`T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md:24-26`);
- Testing runs over the retained worksite through native reacquisition
  (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:933-946`).

Forward accepts only C1 results.

Verdict: **equivalent**. Nothing a default-configuration user relies on is
lost. If C1 stays, forward is C1's only route back into C2 after a
pre-dispatch failure, so keeping C1 while retiring forward removes that route
for C1 users.

**d. Removal inventory.**
- Specification: none.
- Design: `T287_C2_FORWARD_REENTRY_DESIGN.md` (339, whole); 7 mentions in the
  C2 design.
- Source, 655 whole-file lines:
  - `abg/worksite_command_forward.ts` (317);
  - `gtl/worksite_command_forward.ts` (85);
  - `implementation/worksite_command_forward.ts` (48);
  - `product/worksite_command_forward.ts` (187);
  - `product/worksite_command_forward_identity.ts` (18).
- Decl lines: 618 (556 seed, 62 newly dead in `abg/worksite_revision.ts` 50,
  `product/worksite_revision.ts` 9 and `product/builtin_semantics.ts` 3).
- Generated: the module leaves the manifest's publication bindings and catalog.
  The C2 publication re-pins, because `product/worksite_command_execution.ts`
  changes.
- Tests: 509 whole-file lines, two `test:unit` entries in `T/package.json`, and
  the edits in b.
- Qualification mirrors: 10 refs each in `inventory.json`,
  `verification-recipe.json` and `expected-output-inventory.json`.

**e. Coupling.** Forward is a leaf: it depends on C1's result type and on
revision's task types, and nothing kept depends on it except the dispatch
sites. After removal, C2 takes `PriorTask` directly. Package K1, with recovery.

**f. Recorded history.** No recorded execution: the only hits are the twelve
inventory logs. No default-library log.

**g. Public contract change.** No Public operation, member or event kind.
Leave: `module://abiogenesis/worksite/command-forward@5`, its Program, its two
graph functions and the contract kinds `worksite_command_forward_*`.

### 4.6 Revision (C2 revision Program and `worksite_revision`)

**a. What it does.** The revision Program re-runs the declared commands of an
earlier C2 execution over a revised worksite.
- Program: `program://abiogenesis/worksite/revision-command-execution@5`
  (`gtl/worksite_command_execution.ts:226-258`), supervised and without a start.
- It has its own selector and preparer bindings (`:149-153`).
- `abg/worksite_revision.ts` projects revision origins, binding covers and
  retained vectors. One origin kind is `admitted_initial_job_bridge`.
- `product/worksite_revision.ts:1` calls its carriers "Closed D2-only source
  carriers".
- Design: `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md:320-344, 677-700`.
- TD-26 open point 1 (`T/design/TD-26_RETIREMENT_PLAN.md:920-930`) records it as
  the only other supervised Program, and as having no start.
- No requirement names it. No feature identifier.

**b. Who uses it.**
- Composer: semantic revision only (`abg/semantic_revision.ts:65-1047`).
- Read by:
  - semantic job (`abg/semantic_job.ts:115-548`);
  - semantic stage (`abg/semantic_stage.ts:248-364`);
  - recovery (`abg/worksite_construction_recovery.ts:117`);
  - forward (`abg/worksite_command_forward.ts:223-226`).
- Kept current-feature code imports two parts of it:
  - **Binding-cover helpers.** `projectAdmittedWorkspaceBindingAtCoordinate`,
    `projectWorksiteRevisionBindingCover` and
    `projectWitnessedWorkspaceBindingCover` (`abg/worksite_revision.ts:121-160`).
    They are used by native-work reacquisition (`abg/native_work_reacquisition.ts:87-414`),
    governance-covered source use (`abg/invocation_execution_truth.ts:151-260`)
    and pending action use (`abg/construction_continuation.ts:761-763`).
  - **The C2 task union.** `WorksiteExecutionTask`, `isWorksiteExecutionTask`
    and `worksiteExecutionImplementationRef` (`product/worksite_revision.ts`).
    They are used by C2's implementation, its helper, `abg/execution_basis.ts`,
    `abg/replay.ts:1994` and `abg/worksite_input_provenance.ts`.
- Tests: the D2 files listed in 4.7 b. Edits in:
  - `t287-governance-covered-source-use.test.mjs`;
  - `t287-native-work-reacquisition.test.mjs`;
  - `t287-owned-native-proof.test.mjs`;
  - `t287-selected-action.test.mjs`;
  - `t292-td37b-launch-identity.test.mjs`, `t292-td37a-*`;
  - `uat/continuation.mjs`.

**c. Functional equivalence.** In the default configuration, re-checking after
a change is a new Testing selection by the Executive (`prepare-testing` into
C2) or native reacquisition in a fresh Run. Revision serves only semantic
revision.

Verdict: **equivalent**, on two conditions:
1. it leaves only together with semantic revision, its only composer;
2. the binding-cover helpers and the C2 task union move to kept owners first,
   because current features use them.

**d. Removal inventory.**
- Specification: none.
- Design: the D2 design (976) is shared with semantic revision (4.7 d).
- Source, 1,055 whole-file lines:
  - `abg/worksite_revision.ts` (866);
  - `product/worksite_revision.ts` (174);
  - `product/worksite_revision_identity.ts` (15).
- Decl lines: 979 alone; 2,578 with semantic revision in chain order (K2).
- Lines that move rather than leave:
  - the binding-cover helpers (about 40);
  - the `WorksiteExecutionTask` family.
- Generated: C2's module loses the revision Program, graph function, two
  bindings and the closure (`gtl/worksite_command_execution.ts:143-148`), and
  re-pins.
- Qualification mirrors: 6 refs each.

**e. Coupling.** Revision is in the strongly connected component with the
semantic family and goes in K2. Every cut in `product/worksite_command_execution.ts`
(`:1918-2418`) re-pins C2.

**f. Recorded history.** Beyond the inventory logs, three logs:
- `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-observed-c2-01`;
- `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09`;
- `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-witness-continuation-13`.

No default-library log.

**g. Public contract change.** No Public operation, member or event kind. The
Program and graph function leave C2's module; the module ref stays. The
revision contract kinds leave.

### 4.7 Semantic job, stage and revision, with requirement handoff

**a. What it does.** Four declared surfaces carry a specification-driven
lifecycle:
- **Semantic stage** (`module://abiogenesis/semantic-stage@5`). A declared stage
  of a lifecycle (`SemanticLifecycleDeclaration`, `gtl/semantic_stage.ts`) in
  which a native actor produces a stage asset with semantic evidence. It
  composes C0 file parents and C1 to write the asset.
- **Semantic job.** A module-publication member `semanticJobLifecycle`
  (`gtl/semantic_job.ts`). `SemanticJobLifecycleDeclaration` requires all four
  evidence roles and ordered stages. It runs the stages in declared order and
  closes when the obligations are covered. Its root is projected by
  `semanticJobRootAtPrefix` (`abg/semantic_job.ts:54-90`).
- **Semantic revision** (`module://abiogenesis/semantic-revision@5`). A targeted
  revision of a job's stage after a failed verification or a changed
  requirement. It composes the revision Program (4.6).
- **Requirement handoff** (`module://abiogenesis/requirement-handoff@5`). A
  module-publication member `requirementHandoffs` that carries requirement
  terms from a requirement source into a consuming publication, with an
  authenticated basis (`authenticateRequirementHandoffBasis`).

The Product and requirement sentences that state the function:
- A5-F17 (`specification/PRODUCT.md:1378`): "**Specification-driven downstream
  lifecycle.** A prospectively selected real specification progresses through
  Intent/Product, Requirements, Design, working application behavior, admitted
  evidence and targeted revision through only installed public ABIogenesis
  contracts."
- S06 (`PRODUCT.md:1481-1495`): "one consequential targeted revision";
  "Admitted semantic assessments establish meaning and adequacy under their
  declared authority; total deterministic checks establish identity, role
  compatibility, freshness, coverage and closure eligibility over those admitted
  inputs."; "A failed verification or changed requirement creates
  replay-visible pressure and invalidates affected evidence."
- REQ-L-GTL3-JOB-001 (`specification/requirements/gtl/REQ-L-GTL3-JOB.md:16`):
  "`Job` shall be a first-class GTL declaration type."
- REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-001..019 (lines 44-80): obligations
  carry into paired realization and proof.
- REQ-P-PUBLIC-CONTRACTS-005, rows `:89-90`: `abg.contract.gtl.requirements` and
  `abg.contract.abg.requirements`.
- GOALS (`specification/GOALS.md:514-524`) selects "the generic F17/S06
  specification-driven lifecycle" and names "the installed ABG default library"
  as its carrier.
- The register's TD-28 row leaves the carrier to the owner ("Owner chooses the
  A5-F17 carrier").

**b. Who uses it.**
- Publications: three of the ten shipped modules. The default library composes
  none of them.
- Kept code that imports from the family:
  - `abg/actor_process.ts:686-896`;
  - `abg/c_call_outcome.ts:1276-1336`;
  - `abg/default_library.ts:14, 59`;
  - `abg/execution_basis.ts:2518`;
  - `abg/instruction_assembly.ts:122-1272`;
  - `abg/stdo_environment.ts:97-189`;
  - `gtl/serialization_contracts.ts:209-220`;
  - `gtl/stdo_run_environment.ts:46-148`;
  - `hog/ccall_lifecycle.ts:455-466`;
  - `implementation/contracts.ts:113-114`;
  - `implementation/leaf_invocation_port.ts:682-1506`;
  - `owner_bindings/run_invocation.ts:272`;
  - `product/catalog_operations.ts:214-221`;
  - `product/declaration_closure.ts:488-670`;
  - `product/default_library.ts:420-544`;
  - `product/default_library_fulfillment.ts:4-5, 11, 26-223`;
  - `product/execution_resolution.ts:828-1176`;
  - `product/stdo_environment.ts:74-216`;
  - `validator/qualification.ts:572-928`;
  - `validator/qualification_contracts.ts:213-506`;
  - `validator/raw_admission.ts:122-125`;
  - `validator/validation.ts:176-767`.
- Typed native locators: `T/scripts/generate-product-manifest.mjs:612-613`.
- Export subpaths: `T/package.json:52-58`.
- Whole test files, semantic revision and D2, 18 files, 3,756 lines:
  - `t287-native-semantic-revision.test.mjs` (576, in `test:unit`);
  - `d2-acknowledgment` (87), `d2-binding-query-reuse` (126),
    `d2-binding-transition` (336), `d2-bounded-repair` (68),
    `d2-frame-installed` (724), `d2-historical-design` (94),
    `d2-workflow-step` (113);
  - support `d2-binding-harness` (247), `d2-bounded-harness` (103),
    `d2-evidence-owner-harness` (115), `d2-frame-fixture` (368),
    `d2-historical-design-harness` (95), `d2-static-smoke` (119),
    `d2-workflow-step-harness` (116);
  - `t287-generic-job-revision` (160) and its support (109);
  - `fixtures/native-semantic-revision/declarations.mjs` (200).
- Whole test files, semantic job and stage, 13 files, 1,791 lines:
  - `t287-native-semantic-job` (378), `t287-d1-semantic-stage` (43);
  - `t287-generic-job-intake` (79), `-lifecycle` (83), `-meaning` (103),
    `-read-dependency` (120);
  - support `t287-generic-job-intake` (183) and `t287-generic-job-lifecycle` (153);
  - likely also: `t287-management-context` (439) with
    `fixtures/t287-management-supervision/semantic-worker.mjs` (44),
    `t287-predecessor-context` (34) with its support (66), and
    `support/t287-native-frame-observation.mjs` (66).
- Edits in default lanes:
  - `t287-default-library.test.mjs` (16 refs; `:101-106` links
    `build/code/src/abg/semantic_job.js`);
  - `t287-default-library-fulfillment` (3), `-prerequisites` (2), `-reviews` (2);
  - `t287-native-work-currentness-consumers` (29);
  - `t288-instruction-assembly-owner` (18);
  - `t287-single-address-space-consolidation` (16);
  - `t287-gtl-serialization-publication` (9);
  - `t287-common-computational-library` (6);
  - `steel-basic-cli-public`, `uat/public-setup.mjs`.

**c. Functional equivalence.** The default library delivers the F17 lifecycle
by Executive selection over its registered graph functions (specification,
design, construction, testing, review, uat), with:
- prerequisites (`PRODUCT.md:1146-1150`);
- recoverable failure and re-selection (`:1152-1158`);
- the optional admitted fulfillment profile `abg.default_library_fulfillment`
  (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1256-1340`). It carries
  RequirementTerms, GtlContractFulfillmentBindings, semantic proof policies and
  shapes, the evidence roles realization, verifier_artifact and
  verifier_execution, independent assessment and per-obligation coverage. The
  design states: "No semantic-job root, stage order, ledger, event kind or new
  graph operator is introduced."

The fulfillment profile ran in five S6 default-library logs
(`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-*`) with no
semantic-family identifier at run time. Lost:
1. An author-declared, runtime-enforced stage order. The default library
   "imposes no unconditional lifecycle or mandatory hierarchy"
   (`PRODUCT.md:1122-1126`).
2. The module-publication members `semanticLifecycle`, `semanticJobLifecycle`
   and `requirementHandoffs` (`gtl/serialization_contracts.ts:218-220`).
   `semanticJobLifecycle` is likely the only realization of REQ-L-GTL3-JOB-001.
3. Requirement handoff between publications with an authenticated basis: the
   content of `abg.contract.abg.requirements`.
4. A declared, targeted stage revision with evidence invalidation. The default
   library re-enters by Executive re-selection or a fresh Run.
5. The native semantic assessment schema.

Verdict: **partly**. F17 is delivered; the declared and enforced lifecycle
mode, the GTL `Job` declaration and requirement handoff are lost.

**d. Removal inventory.**
- Specification, if the family goes:
  - REQ-L-GTL3-JOB-001 (likely `requirement_reprice`);
  - REQ-P-PUBLIC-CONTRACTS-005 rows 89-90;
  - PRODUCT and GOALS stay as they are: they name the default library as the
    carrier.
- Design:
  - `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md` (943) and
    `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md` (976), whole notes, likely.
  - Two sections need confirming before deletion: D1 `:935-943` ("Native
    workspace source adapter") and D2's NATIVE-D2-01 section (`:5-197`). The
    native-work design refers to NATIVE-D2-01 (`T287_NATIVE_WORKSPACE_WORK_DESIGN.md:3-27`).
- Source, 18 whole files, 5,496 file lines:
  - abg: `requirement_handoff` 90, `semantic_job` 667, `semantic_revision` 1,061,
    `semantic_stage` 400;
  - gtl: `requirement_handoff` 188, `semantic_job` 77,
    `semantic_revision_identity` 34, `semantic_revision_publication` 121,
    `semantic_stage` 186, `semantic_stage_identity` 70,
    `semantic_stage_publication` 198;
  - implementation: `requirement_handoff` 47, `semantic_revision` 131,
    `semantic_stage` 173;
  - product: `requirement_handoff` 122, `semantic_job` 1,041,
    `semantic_revision` 439, `semantic_stage` 451.
  - Plus `gtl/requirements.ts` and `abg/requirements.ts` (one re-export line
    each).
- Decl lines: 5,419 alone (4,934 seed, 485 newly dead). In chain order: K2
  2,578 (with worksite revision), K3 3,240, K4 414.
- Lines that move rather than leave:
  - `invocationRootAtPrefix` (`abg/semantic_job.ts:70-90`), to a kept ABG owner;
  - `POLICY_SCHEMA` and `SHAPE_SCHEMA` (`gtl/semantic_stage.ts`), to the
    default-library fulfillment owner or a GTL owner;
  - `CONTEXT_DECLARATION_SCHEMA`, `REQUIREMENT_TERM_SCHEMA` and
    `GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA` (`gtl/requirement_handoff.ts:11-31`),
    to a kept GTL owner. The run environment, the default library,
    qualification and GC03 use them;
  - `groundBoundSourceQuote` (`product/requirement_handoff.ts:11`), to the
    fulfillment owner.
- Generated:
  - `contracts/schemas/gtl-serialization.schema.json` (three members);
  - `contracts/schemas/native-semantic-assessment.schema.json` (generator `:4,
    203-206, 899-904`);
  - three module publications and their contribution-manifest rows;
  - the typed locators `:612-613`.
- Tests: 5,547 whole-file lines, plus the edits in b.
- Qualification mirrors: 46 refs in `inventory.json`, 50 in
  `verification-recipe.json`, 36 in `expected-output-inventory.json`, 6 in
  `declared-commands.json`.

**e. Coupling.**
- Semantic revision, semantic job, semantic stage and worksite revision import
  each other, so they leave in two consecutive packages:
  - K2 (semantic revision with worksite revision) makes temporary cuts in the
    job and stage files that K3 then deletes;
  - K3 (semantic job and stage) is 3,240 decl lines, over the 2,500 aim. It
    cannot be split without further temporary cuts.
- Requirement handoff goes after them (K4), once its schemas are rehomed. K4
  also changes the two Public contract rows.
- The family composes C0 file parents and C1, so it goes before C3, preparation,
  C1 and C0.
- GC03 imports one of its schemas (3.2 e).

**f. Recorded history.** Beyond the inventory logs, 70 logs:
- `.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01` (35);
- `20260916_ABG5_RC7_OBSERVATION_REPAIR/time-correction` (6) and
  `time-correction-review` (6);
- `20260909_D1_LIFECYCLE` (4), `20260911_D2_BOUNDED_REPAIR` (4),
  `20260926_CALCULUS_CROSSCUT` (2);
- single logs under `20260913_ABG5_PLAN_EXECUTION`,
  `20260915_ABG5_EXECUTIVE_PILOT` and `20260915_ABG5_RC7_TASK_1B`.

No default-library log, including the S6 fulfillment runs and rc.12.

**g. Public contract change.**
- Export subpaths `./gtl/requirements` and `./abg/requirements` (`T/package.json:52-58`;
  contract ids `abg.contract.gtl.requirements` and `abg.contract.abg.requirements`).
  - If the rehomed schemas are exported from `./gtl/requirements`, that subpath
    stays with changed content and a changed typed locator.
  - Inferred: `./abg/requirements` has nothing left to export.
  - Either way REQ-P-PUBLIC-CONTRACTS-005 row 90 changes.
- Module-publication members `semanticLifecycle`, `semanticJobLifecycle` and
  `requirementHandoffs` leave the serialization schema and the `ModulePublication`
  type (`gtl/contracts.ts:128`). Likely: a publication that presents them is
  refused at publication-schema validation.
- Three modules leave the catalog, and the native semantic assessment schema
  leaves.
- No Public operation; no event kind of its own (likely).

### 4.8 Result assessment (`result.assess`)

**a. What it does.** The Public operation `abg.operation.result.assess#assess`
admits the assessed truth of an F_P result from outside a Run. The caller
presents the expected result, the assessment contract, the assessment, the
evidence and the current basis. The owner either appends one `assessed` event
(`product/result_assessment_operation.ts:680`) or refuses.
- REQ-P-POLICY-034 (`specification/requirements/product/REQ-P-POLICY.md:263-266`):
  "`abg.operation.result.assess` shall admit assessed F_P result truth only for
  the expected result, assessment, actor or capability, contract, evidence, and
  current basis identities…".
- It is listed in the operation table of
  `specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md:214-222` and in
  REQ-R-ABG3-WITNESS-009
  (`specification/requirements/abg/REQ-R-ABG3-SUPERVISOR-WITNESS.md:38`).
- Register row (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:275`): "A Public
  operation only; no shipped graph calls it; its fluent
  `result_assessment_admitted` … is read by nothing", sized "About 1,100
  lines", verdict "Investigate".
- Packet: `product/interaction_operation_contracts.ts:202-255`. Effect class
  `result_assessment_event`; terminal outcomes admitted and rejected;
  non-terminal outcomes retry and blocked; `sdk.result.assess`.
- No feature identifier.

**b. Who uses it.**
- Binding: `RESULT_DEFINITION_BINDINGS`, which binds only `assess`
  (`product/result_definition_bindings.ts:310-312`); route row
  `public/binding/owner_contract_source_set.ts:194-200`.
- References elsewhere:
  - capability row `shared/capability_contracts.ts:86`;
  - `product/admission_authority.ts:271`;
  - `abg/environment_admission.ts:73`;
  - `shared/public_invocation.ts:192`.
- No shipped Program or default-library code calls it.
- Readers of its truth: none. The fluent `result_assessment_admitted` that
  `assessed` initiates (`abg/calculus/axioms.ts:277-280, 1121-1130`) has no
  reader; `abg/calculus/liveness.ts:262` only lists the kind.
- Tests:
  - `t287-required-operation-bindings.test.mjs` (538). Its header names only
    result.assess (`:1-3, 130`), so the whole file goes (likely);
  - edits in `t287-wave2-owner-contract-source-set.test.mjs:215, 340, 412`,
    `t287-runtime-failure-diagnostic.test.mjs:714` and
    `types/framework-handoff.compile.ts:87`;
  - edits in `fixtures/t287-current-owner/native-assessment/fixture.json` and
    `qualification/tenant-manifest.json`.

**c. Functional equivalence.** The default configuration admits assessments
inside the Run: native-work assessment
(`program://abiogenesis/worksite/native-work/assessment@5`, with independence
enforced, `abg/default_library.ts:153-170`) and the default library's review
graph function. Only result.assess offers an attributed assessment of an
already admitted F_P result, given after the fact by an outside actor or
capability, through the Public surface, without a Run.

Verdict: **distinct**. The function exists nowhere else. Inferred: nothing
consumes it today.

**d. Removal inventory.**
- Specification: REQ-P-POLICY-034 and the operation-table row
  (`requirement_reprice`). WITNESS-009 lists it.
- Source:
  - `product/result_assessment_operation.ts` (762 file lines) and
    `product/result_definition_bindings.ts` (312): 1,074 file lines, 923 decl;
  - the packet at `product/interaction_operation_contracts.ts:202-255` (54,
    likely dead afterwards);
  - the route row, the capability row and the `./product` export
    (`product/index.ts:412`).
- Generated:
  - `contracts/public-operations/result/assess/operation-contract.json`;
  - `contracts/schemas/operations/result/assess/{request,result,non-terminal,refusal}.schema.json`;
  - the capability-graph row in `contracts/capabilities/capability-definition-graph.json`;
  - the manifest catalog rows;
  - `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST` (`public/binding/owner_contract_source_set.ts:36-37`).
- The `assessed` kind stays declared (2.2).
- Tests: 538 whole-file lines, plus the edits.

**e. Coupling.** None with the chain or with the other capabilities. It shares
`owner_contract_source_set.ts` and `capability_contracts.ts` with the witness
package.

**f. Recorded history.** No `assessed` event exists in any recorded log. Its
identifiers appear only in the twelve inventory logs and in install-catalog
rows. No default-library log carries it at run time.

**g. Public contract change.**
- Leave: the operation `abg.operation.result.assess`, member `assess`, its
  definition key and route row, `sdk.result.assess`, the four schemas, the
  refusal code `result_assess_execution_failure` and the capability-graph row.
- A caller then gets `unknown_definition`. If the Executive keeps the
  declaration and drops only the binding, the caller gets
  `installed_binding_unavailable`.
- The definition-binding roots go from 14 to 13.

### 4.9 The four witness acts

**a. What it does.** `abg.operation.witness.admit` admits witness events
attributed to an actor. Six members are declared
(`abg/witness_operation_contracts.ts:17-24`); two are bound, `reprice` and
`run-stopped` (`abg/witness_definition_bindings.ts:379-384`). The four unbound
acts:
- `attest` appends `replay_log_attested`. REQ-R-ABG3-WITNESS-016 (`:52`):
  "Replay-log attestation shall be witness truth: the attestation digest shall
  chain over the full canonical event content of the attested span in
  admission-ordinal order…".
- `hygiene-stamp` appends `workspace_hygiene_stamped`. WITNESS-007 (`:34`):
  "ABG shall witness workspace hygiene over evidence surfaces: kernel digests at
  segment boundaries, detection and typed classification of foreign writes…".
  WITNESS-008 (`:36`) makes "hygiene clean" a conjunct of citability.
- `intake` appends `defect_intake_admitted`. WITNESS-002 (`:24`): "Defect intake
  from a halt shall be a typed triage record admitted as an event…".
- `run-resumed` appends `run_resumed`. WITNESS-006 (`:32`): "at minimum
  `run_resumed` and `run_stopped` with a typed reason". `run_resumed` initiates
  `run_active` and terminates `operator_run_stopped`
  (`abg/calculus/axioms.ts:173-176`).

REQ-P-POLICY-035 (`REQ-P-POLICY.md:269-270`): "`abg.operation.witness.admit`
shall retain the public acts `reprice`, `attest`, `hygiene-stamp`, `intake`,
`run-resumed`, and `run-stopped`". No feature identifier.

**b. Who uses it.**
- Bindings: none. `t287-framework-handoff-types.test.mjs:230-275` asserts
  `installed_binding_unavailable` for them.
- Code in `abg/witness_admission_operation.ts` (1,230 lines):
  - the member and value tables (`:37-44, 198-210, 212-280`);
  - validation (`:393-420`);
  - the act branches of `prepareSemanticEvent`: attest `:817-860`,
    hygiene-stamp `:861-949`, intake `:950-1052`. run-resumed shares
    `:1053-1112` with the kept run-stopped;
  - the port rows (`:1221-1230`).
- Readers:
  - no projection reads hygiene stamps or attestations; `code/src` has no
    citability projection (no match for "citab");
  - `operator_run_stopped` is read by replay (`abg/replay.ts:1363-1366`).
- Tests (edits only):
  - `witness-reprice-definition-binding.test.mjs:193-213`;
  - `t287-framework-handoff-types.test.mjs`;
  - `types/framework-handoff.compile.ts` (7 refs);
  - `fixtures/native-semantic-revision/declarations.mjs`;
  - `support/t287-generic-job-intake.mjs`, `support/t287-generic-job-lifecycle.mjs`;
  - `t287-runtime-failure-diagnostic.test.mjs`, `t287-wave2-owner-contract-source-set.test.mjs`.

**c. Functional equivalence.** The default configuration has no replay-log
attestation, no workspace-hygiene witness, no defect-intake event and no
operator resume of a stopped Run. After a stop it continues in a fresh Run
(pending-consumer continuation).

Verdict: **distinct**. The functions exist nowhere else. All four are unbound
today, so no current user has a working path to lose. What leaves is the
surface REQ-P-POLICY-035 requires, and with it the realization path for
WITNESS-002, -006, -007, -008 and -016.

**d. Removal inventory.** The register row
(`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:277`) reads "Public schemas; about 20
lines of dead residue | Bind them or reserve them; the residue goes now". Three
shapes, from smallest to largest:

| Shape | What leaves | What stays | Lines |
|---|---|---|---|
| Residue only (the register's "the residue goes now") | The declarations no root reaches: `abg/witness_admission_operation.ts:205-210` (`WORKSPACE_HYGIENE_CLASSIFICATION_VALUES`), `:1217-1219` (`WitnessAdmissionPort`), `:1221-1230` (a second, unused `WITNESS_OPERATION_CONTRACTS`); `abg/witness_operation_contracts.ts:163-172` (`WitnessAdmissionPort` interface). Not residue: `abg/witness_definition_bindings.ts:132-142` (`witnessRepriceResourcesCorrespond`) has no caller in `code/src`, but it belongs to the kept `reprice` and `witness-reprice-definition-binding.test.mjs:154-160` exercises it | everything else | 29 |
| Reserve | The residue, plus the native admission code of the four acts: the act branches of `prepareSemanticEvent` (`:817-1052`), the run-resumed arms inside `:1053-1112`, the per-member table entries and validation cases (`:39-42, 198-203, 212-280, 393-420`). The members stay declared, so callers keep `installed_binding_unavailable`, and REQ-P-POLICY-035 is unchanged | the Public contract: `abg/witness_operation_contracts.ts`, the operation-contract file and its schemas | about 315 (inferred from branch ranges) |
| Full removal | The reserve set, plus the four members and their contracts (about 16 lines in `abg/witness_operation_contracts.ts`) and their entries in the operation-contract file | `reprice` and `run-stopped` | about 330 (inferred) |

The register's 20 lines are the residue-only shape: they leave under either
register option (bind or reserve). Choosing between reserve and full removal is
the decision that remains.
- Specification, full removal only: REQ-P-POLICY-035 (`requirement_reprice`);
  WITNESS-002, -006, -007, -008 and -016; the witness kinds listed in
  REQ-R-ABG3-EVENTS (line 101).
- The shared run-lifecycle branch keeps its run-stopped path in every shape.
- What stays declared (2.2): the four event kinds with their schemas
  (`abg/event_store.ts:66-69, 463-500, 3072-3088, 3162-3212, 3332`) and their
  axioms (`abg/calculus/axioms.ts:161-176, 843-880`).
- Generated:
  - `contracts/public-operations/witness/admit/operation-contract.json`
    (members and schemas);
  - the capability-graph row (`shared/capability_contracts.ts:88`);
  - the manifest catalog;
  - the owner contract key-set digest.
- Tests: edits only. The unavailable-member list drops from nine to five.

**e. Coupling.** None with the chain. It shares
`abg/witness_admission_operation.ts` with the kept `reprice` and `run-stopped`,
and the contract key-set digest with result assessment.

**f. Recorded history.**
- `replay_log_attested` and `workspace_hygiene_stamped` events exist in four
  logs: `.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-01`
  and `operator-stop-02` (`effects/witness-*/events.jsonl`, two each).
- No `defect_intake_admitted` or `run_resumed` event exists anywhere.
- The twelve inventory logs carry the member names.
- No default-library log.

**g. Public contract change.**
- Leave: the members `attest`, `hygiene-stamp`, `intake` and `run-resumed`, with
  their subject, context and content schemas.
- A caller then gets `unknown_definition` instead of today's
  `installed_binding_unavailable`.
- The four event kinds stay declared.
- Under the residue or reserve shape nothing Public changes: the members stay
  declared and unbound.

## 5. Staying: what C2 and release snapshot share

### 5.1 Command execution (C2)

C2 shares with the capabilities above:
- **Its module publication** (`gtl/worksite_command_execution.ts`). It holds
  the six preparation bindings (`:149-167`; C1, C3, revision), the revision
  Program, graph function, bindings and closure (`:143-148, 226-258`), and the
  renderer pin (`:33-62`; 2.4).
- **Its task types.** C2's implementation and helper accept
  `ExecutableWorksiteCommandTask = PriorTask | WorksiteCommandForwardTask`
  (`product/worksite_command_forward.ts:80-83`). `PriorTask` is the
  initial-or-revision union from `product/worksite_revision.ts`. A C2 task also
  accepts a C1 construction result as source
  (`product/worksite_command_execution.ts:277-1668`).
- **Its helper.** `implementation/worksite_command_helper.ts:256-1526`
  materializes forward and revision snapshot sources.
- **Its run environment** (`gtl/stdo_run_environment.ts`). It holds the regsel
  role (`:193-208`), the semantic stage and revision identities (`:46-55`), the
  C1 identity (`:63-66`) and the requirement-handoff schemas (`:102-148`).
- **Its launch loci and ambient environment.** `product/worksite_command_launch.ts:51-87`
  carries the forward and revision identities; `hog/ccall_lifecycle.ts:79-80`
  carries preparation and revision.

C2 changes in K1, K2, K5 and K6. The pinned file
`product/worksite_command_execution.ts` changes in K1, K2 and K6, so those
packages re-pin. C2's own lanes run in every package.

### 5.2 Release snapshot

`product/release_snapshot_definition_bindings.ts` imports nothing from a
capability file. Its call graph reaches capability identities only through
shared owners:
- `product/declaration_closure.ts` (`resolveDeclarationClosure` branches on the
  semantic, requirement-handoff, forward, recovery, C1 and revision identities);
- `abg/worksite_input_provenance.ts`;
- `abg/c_call_outcome.ts`;
- `gtl/serialization_contracts.ts`;
- `gtl/stdo_run_environment.ts`.

Every chain package and the regsel package edit code on its path, so its lanes
run in each of them.

## 6. Across the capabilities

### 6.1 Table

Decl lines are each capability removed alone; they overlap and do not add up.

| # | Capability | Verdict | Source decl lines | Source file lines | Test file lines (whole files) | Must go with | What blocks it |
|---|---|---|---|---|---|---|---|
| 1 | Native registered-selection task | retire by decision | 184 | 74 | 281 deleted, plus 709 edited (the recursive test and fixture) | none | the recursive-selection test proves current recursion and resume through a native-selector fixture, which must be rewritten first |
| 2 | GC03 with Python adapter | retire by decision | 903, plus about 165 cut in `abg/actor_process.ts` and about 22 in the generator | 1,045 + 199 Python | 1,191 | none | its `CONTEXT_DECLARATION_SCHEMA` import (go before K4); `r1-packed-artifact` edits |
| 3 | Worksite construction (C1) | partly | 3,992 (includes C3 parts and C0) | 2,125 | 2,496 | C0, which dies with it | every composer first (K1 to K5); the qualification gate (2.5, TD-29); C2 re-pin |
| 4 | Construction recovery | partly | 749 | 774 | 862 | C1 at the latest | TRANSPORT-014 keeps no realization (likely) |
| 5 | Branch construction (C3) | partly | 1,325 | 1,448 | 2,090 | preparation | the semantic family first; C2 publication change |
| 6 | Preparation | equivalent, only with C1 and C3 | 336 | 257 | edits only | C3 (K5), then C1 | C1 or C3 in use |
| 6 | C0 file replace | partly, as C1 | 1,619, with file parents | 1,160 | 2,720 | C1 | replay of recorded C0 logs (`abg/event_calculus.ts:126-131`) |
| 6 | C0 file parents | equivalent | in C0 | in C0 | in C0 | the semantic stage and job | the semantic family in use |
| 7 | Command forward | equivalent | 618 | 655 | 509 | none | C2 re-pin only |
| 8 | Revision | equivalent, only with semantic revision | 979 | 1,055 | in row 9 | semantic revision | helper and C2-task-union moves; C2 re-pin; TD-26 open point 1 |
| 9 | Semantic job, stage, revision, requirement handoff | partly | 5,419 | 5,496 | 5,547 | revision; file parents | moves of the root projection, five schemas and `groundBoundSourceQuote`; Public subpaths; REQ-L-GTL3-JOB-001 |
| 10 | Result assessment | distinct | 923 | 1,074 | 538 | none | REQ-P-POLICY-034 |
| 11 | Four witness acts | distinct | residue 29; reserve about 315; full about 330 (inferred) | none whole | edits only | none | REQ-P-POLICY-035 (full removal only) |

Totals if every capability left:

| Layer | Lines |
|---|---|
| Source, decl | 14,873, plus about 330 for the witness acts. The chain (rows 3 to 9) together is 12,863: 11,747 seed and 1,116 newly dead |
| Source, whole files | 15,163, plus 199 Python |
| Design notes, whole | 5,613: 306 + 805 + 407 + 176 + 860 + 801 + 339 + 943 + 976, before the sections to confirm in 4.1 d and 4.7 d |
| Design notes, sections | 256 (GC03) |
| Tests, whole files | 16,234, plus edits in about 64 partly affected test, support, fixture, UAT and qualification files (the recursive-selection test and fixture among them) |
| `T/package.json` | three `test:unit` entries (forward ×2, semantic revision) and two export subpaths (`:52-58`) |
| Generated contracts | by content, not lines: the files named in each d |

Applying the three rules to these verdicts removes three capabilities:
- regsel and GC03, by rule 1;
- forward, by rule 2.

Everything else is either *partly* or *distinct*, or is *equivalent* only
together with a *partly* capability:
- preparation with C1 and C3;
- file parents with the semantic family;
- revision with semantic revision.

By rule 3 those stay in source and go to the backlog.

### 6.2 Removal order

Every package replays the 19 default-library logs and the rc.12 Run with the
TD-25R method, with identical digests before and after. K1, K2, K5 and K6 also
replay the two FRAMED_GOVERNANCE final logs that embed the C2 module
publication (section 4 introduction). Every package runs the lanes in 6.4.

Schemas that K3 and K4 move must keep byte-identical content.
`POLICY_SCHEMA`, `SHAPE_SCHEMA`, `CONTEXT_DECLARATION_SCHEMA`,
`REQUIREMENT_TERM_SCHEMA` and `GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA` shape
the fulfillment-policy and run-environment declarations that the S6
default-library logs recorded. A content drift breaks the replay-digest gate
even though no capability kind appears.

**Independent packages.** They can run side by side with each other; none
depends on the chain.

| Package | Content | Decl lines | Side by side with | Order constraint |
|---|---|---|---|---|
| R1 | native registered-selection task | 184 | R2, R3, R4 | none; shares four files with chain packages, so not at the same time as K1 to K3 |
| R2 | GC03 and the adapter | 903, plus cuts | R1, R3, R4 | before K3 (`abg/actor_process.ts`) and K4 (schema) |
| R3 | result assessment, if ruled out | 923 | R1, R2 | shares the key-set digest with R4: run them in sequence or as one package (about 1,253) |
| R4 | witness acts: the residue (29) under either register option; reserve (about 315) or full removal (about 330) if ruled | 29 to 330 | R1, R2 | as R3; the residue and reserve shapes do not touch the key-set digest |

**Chain packages.** They run strictly in sequence: each removes the consumers
of the next. No two run side by side, and none runs beside a TD-26 package.
They share `product/builtin_semantics.ts`, `product/declaration_closure.ts`,
`abg/execution_basis.ts`, `implementation/leaf_invocation_port.ts`,
`abg/c_call_outcome.ts`, `hog/ccall_lifecycle.ts` and the C2 publication.
TD-26 shares builtin_semantics, execution_basis, c_call_outcome,
ccall_lifecycle, validator/validation, replay, event_store, axioms and the
generator (`T/design/TD-26_RETIREMENT_PLAN.md`).

| Package | Content | Decl lines | Moves and hazards |
|---|---|---|---|
| K1 | forward and recovery | 1,367 (forward alone 618) | C2 re-pin. If only forward goes, `WORKSITE_CONSTRUCTION_GTL_IDS` stays where it is |
| K2 | semantic revision and worksite revision | 2,578 | moves the binding-cover helpers and the C2 task union to kept owners; temporary cuts in the job and stage files; C2 re-pin |
| K3 | semantic job and semantic stage | 3,240, over the aim | moves `invocationRootAtPrefix`, `POLICY_SCHEMA` and `SHAPE_SCHEMA`; the default-library lanes are the gate |
| K4 | requirement handoff | 414 | moves three schemas and `groundBoundSourceQuote`; changes `./gtl/requirements` and `./abg/requirements` (REQ-P-PUBLIC-CONTRACTS-005 rows 89-90) |
| K5 | C3 and preparation | 1,680 | C2 publication change (four preparation bindings) |
| K6 | C1 | 1,829 | qualification gate under TD-29; C2 re-pin; leaves 1,534 C0 decl lines dead |
| K7 | C0 file replace and file parents | 1,755 | event-calculus branch and the replay set of recorded C0 logs |

Under the verdicts in this map, the order reduces to R1 and R2 side by side,
then K1 with forward only (618).

### 6.3 Backlog notes

- **Worksite construction (C1), with C0 file replace.** Contained construction:
  a model proposes file text, and owner effects apply it with predecessor,
  territory, protected-root and atomic-publication checks and per-file
  currentness. Not in 5.0.0 because the default library constructs through
  native workspace work, which by design states no containment guarantee. Would
  need a default-library selection that routes construction through it, lanes
  in the default suite, and a TD-29 ruling on qualification authorship.
- **Construction recovery.** Admission in a later occurrence of a preserved C1
  worker result after a transport failure (REQ-R-ABG3-TRANSPORT-014). Not in
  5.0.0 because it serves only C1, needs a semantic-stage bridge and accepts one
  failure shape. Would need C1 in use and a bridge that does not depend on
  semantic stage.
- **Branch construction (C3).** Declared multi-branch construction with
  disjoint target allocation before any write and one aggregate result. Not in
  5.0.0 because the default library sequences native work by Executive
  selection, and the design note awaits independent review. Would need C1, that
  review, and a default-library selection.
- **Semantic job, stage, revision and requirement handoff.** A declared,
  runtime-enforced specification lifecycle of ordered stages, requirement
  handoff between publications, and declared targeted stage revision. Not in
  5.0.0 because the default library delivers F17 by Executive selection with
  admitted fulfillment and "imposes no unconditional lifecycle or mandatory
  hierarchy" (`PRODUCT.md:1122-1126`). Would need the owner's A5-F17 carrier
  ruling and a ruling on REQ-L-GTL3-JOB-001.
- **Result assessment.** Attributed assessment of an admitted F_P result,
  outside a Run, through the Public surface. Not in 5.0.0 because nothing reads
  the admitted truth and the default configuration assesses inside the Run.
  Would need a consumer of `result_assessment_admitted`.
- **Witness acts** (attest, hygiene-stamp, intake, run-resumed). Replay-log
  attestation, workspace-hygiene stamps, defect intake and operator resume as
  attributed witness events. Not in 5.0.0 because they are unbound, no
  projection reads them (no citability projection exists for WITNESS-008), and
  the default configuration continues after a stop with a fresh Run. Would need
  bindings and the projections that consume them.

### 6.4 The default configuration's lanes

These tests prove the current feature set; every package runs them. Paths are
under `T/test_env/tests/`.

| Area | Tests (lines; live gate) |
|---|---|
| Default library | `t287-default-library` (2,727; `ABI5_DEFAULT_LIBRARY_LIVE`), `t287-default-library-fulfillment` (274), `-prerequisites` (224), `-reviews` (514), `-recoverable-failure` (203) |
| Native work | `t287-native-workspace-work` (1,144), `t287-native-worksite-execution` (409; `ABI5_NATIVE_SOURCE_READY_CATALOG`), `t287-native-work-reacquisition` (410), `t287-native-work-reacquisition-normalization` (48; `ABG_REACQUISITION_NORMALIZATION_RETAINED_ROOT`), `t287-reacquisition-root-contract` (58), `t287-native-work-unknown-effect` (160), `t287-native-work-currentness-consumers` (1,454), `t287-governance-covered-source-use` (481) |
| C2 | `t287-worksite-command-execution` (1,651; `ABG_T287_C2_PROOF_CONFIG`), `t287-c2-core-environment` (222), `t287-c2-child-program` (92), `t287-native-c2-instruction-assembly` (120), `steel-basic-cli-public` (853), `steel-basic-cli-c2` (146) |
| Selection, recursion, retry | `t287-registered-graph-selection` (143), `t287-recursive-failure-foldback` (321), `t287-recursive-registered-selection` (601; cases `:26, 55, 163, 406, 505`; R1 rewrites its fixture's selector, and until then it runs as is) |
| Amendment witness | `t287-amendment-witness` (460; `ABI5_AMENDMENT_WITNESS_LIVE`) |
| Release snapshot | `t287-w2-05-release-snapshot-definition-bindings` (139), `t287-release-publication` (114), `t287-release-acceptance` (161) |
| Install and catalog | `t287-w2-05-install-catalog-owner-chain` (1,650) |
| Scripts | `test:m4`, `test:public-groups`, `test:installed:language`, `test:uat:harness` |
| Build | the generator pin check (`T/scripts/generate-product-manifest.mjs:93-106`) |
| Replay | the 19 default-library logs and rc.12 `live-01/events.json`, with identical digests before and after |

The 19 default-library logs:
- 18 are of `program://default-library-witness/witness@5`, under
  `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/practical-witness-004`
  and `-005` and `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/`
  (`s6-*`, `default-library-implementation/*`, `s7-pending-consumer-01/*`);
- 1 is of `program://abiogenesis/default-library/default@5`:
  `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl`.

None of them, and not rc.12, carries a kind, task, Program, graph function or
publication member of any capability in this map at run time. Their only
references sit in the `public_operation_artifact_admitted` resolved-lock rows,
which copy the install catalog. Every `nativeBasis.publication` in the rc.12
`actor_transport_binding_admitted` events (7 occurrences) is
`module://default-library-witness/witness@5`, which carries no capability
identifier. No default-library log stops a removal.

One qualification: C2 itself produced capability-bearing logs outside the
default library. In the two FRAMED_GOVERNANCE final logs (section 4
introduction), a native actor serves C2 under the qualification `assess`
Program, and its transport envelope embeds the C2 module publication with the
revision and preparation members. Two consequences:
- these two logs join the replay set of every package that changes C2's module
  (K1, K2, K5, K6);
- the Executive decides whether their recorded envelopes must stay
  reproducible.
