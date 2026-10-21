# Step 4. Value family

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 4.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 4.
Outcome: one `derive` family in `shared/value/` owns canonical equality,
canonical record digests and canonical writing over `JsonValue`; every
private equality copy, inline canonical comparison, inline digest-of-both-
sides comparison, hand-rolled record digest and NUL-joined sequence
comparison in the tree calls it; the C2 currentness path keeps its truthful
materialization and is proved positive and negative; O-TYPE is decided per
site touched. Change class: `realization_refactor`. One commit on `main`, no
push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 3 commit in the plan ledger. Tenant root
`build_tenants/abiogenesis/typescript`; source `code/src`. Frames `f-law`,
`f-checks`, `f-claim`. Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§4.3 (`derive`: `shared/value/`, domain `JsonValue` only), §6 (Prime atoms:
`canonicalEquals`), §10.2 (D3), §10.5 (P-EQUAL). Read those sections only.
`admitJson` from step 3 (`shared/admit/`) is the ingress for `unknown`.

**Census the Executive made at `93a4b08df` (re-verify; lines move):**

- Twelve private equality functions, all `(left: unknown, right: unknown)`
  except the last: `shared/public_function_family.ts:175`,
  `product/public_contract_publication.ts:416`, `product/worksite_operations.ts:99`,
  `product/verify_product.ts:1361`, `product/worksite_branch_construction.ts:227`,
  `product/worksite_construction.ts:198`, `abg/open_call.ts:153`,
  `abg/retry.ts:672`, `abg/c_call.ts:1386`, `abg/execution_basis.ts:529`,
  `hog/operator_support.ts:28` (exported), `hog/parent_rehydration.ts:62`
  (`(left: object, right: object)` with casts).
- About 70 inline `canonicalJson(a) === canonicalJson(b)` (or `!==`) sites
  across `abg/`, `product/`, `gtl/`, `hog/`, `validator/`.
- About 44 inline `sha256Canonical(a) === sha256Canonical(b)` sites. Only
  those that digest both sides for equality are in scope; a comparison of a
  freshly computed digest against a stored digest is a digest check and
  stays.
- Two hand-rolled record digests over `unknown`:
  `abg/execution_basis.ts:955` and `abg/invocation_execution_truth.ts:233`
  (`canonicalRecordDigest`).
- Eighteen NUL-joined sequence comparisons of two string arrays
  (`a.join("\0") === b.join("\0")`) in `abg/closure.ts`, `abg/execution_basis.ts:2171`,
  `abg/fh_resume_relation.ts`, `abg/traversal_route.ts:2992`, `gtl/consensus.ts`,
  `gtl/declarations.ts`, `hog/route_proposal.ts`, `product/environment.ts`,
  `product/invocation.ts`, `product/result_assessment_operation.ts`,
  `product/verify_product.ts`, `abg/invocation_admission.ts`: these are
  equality of two `JsonValue` arrays and belong to `canonicalEquals`.
- The C2 path: `abg/execution_basis.ts:800` materializes the event-body view
  (`runtimeEventBodiesAtPrefix(...).materialize()`) before comparing with the
  durable read; the private `sameCanonical` at `:529` compares `unknown`.
  `shared/i_json.ts:141` refuses a non-plain object (custom prototype), so an
  unmaterialized lazy view is refused at ingress.
- Existing modules `shared/canonical_json.ts` (`JsonValue`, `canonicalJson`,
  `writeCanonicalJson`, `compareUnicodeCodeUnits`), `shared/digests.ts`
  (`sha256Bytes`, `sha256Canonical`, `sha256File`, `payloadInventoryDigest`,
  `isSha256Digest`), `shared/immutable.ts` (`deepFreeze`, `isDeeplyFrozen`)
  are imported by 73 test files through `build/` and by most of the tree.
  **Do not move or rename them.** `shared/value/` is a directory that adds
  the new atoms and re-exports those three modules, so the design's naming
  holds without import churn.

**What changes.**

1. New `shared/value/equality.ts`: `canonicalEquals(left: JsonValue, right: JsonValue): boolean`
   (equal canonical text; implement without allocating two full strings if
   `writeCanonicalJson` lets you stream-compare, else by `canonicalJson`),
   and `shared/value/record.ts`: `canonicalRecordDigest(value: JsonValue): Sha256Digest`
   and `writeCanonicalRecord` as design §4.3 types it. `shared/value/index.ts`
   re-exports these and the three existing modules.
2. The twelve private equality functions go; their call sites call
   `canonicalEquals`. Where a caller holds `unknown`, it admits through
   `admitJson` first (an `Outcome`; a refusal takes the site's existing
   negative branch) or, where the value is already typed `JsonValue`, calls
   directly. `hog/parent_rehydration.ts:62` compares suspension carriers that
   are not typed `JsonValue`: decide it per D3 (admit at the site, or type the
   carrier) and record it; if neither is possible without a behavior change,
   leave the cast with a one-line comment and list it.
3. The inline canonical comparisons, the both-sides digest comparisons and
   the sequence comparisons call `canonicalEquals`. Behavior is preserved
   for every valid input; a comparison whose operands can today be non-JSON
   (`undefined`, `bigint`, functions, class instances) is a D3 site: admit
   or type, record, or leave and list.
4. The two `canonicalRecordDigest(unknown)` copies become the one atom over
   `JsonValue`, with `admitJson` at their ingress.
5. The C2 path: keep `.materialize()` at `:800`; replace `:529` with
   `canonicalEquals` over the materialized bodies and the durable read.
6. Unit lane, one file `test_env/tests/t287-value-equality.test.mjs`
   (module-derived; constitution SP-05, SP-06): P-EQUAL positive: two
   materialized event-body sequences from one recorded prefix compare equal
   to the durable read and the C2 reuse branch proceeds (use the existing
   test support for a recorded store if one exists; otherwise a minimal
   fixture of plain `JsonValue` bodies); P-EQUAL negative: an unmaterialized
   view object with a custom prototype is refused by `admitJson` before any
   comparison; plus `canonicalEquals` agrees with `sha256Canonical` equality
   on a small set of `JsonValue` pairs including key order and unicode keys.
7. O-TYPE per site (D3): every site where a producer's data was not
   assignable to `JsonValue` is recorded in Return with the decision taken.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/value/**`
(new), every file holding a site in the census (the sites and the imports
they need), the new test file, and the build outputs the gate regenerates.
Plus this file's `## Return`. No moves of the three existing modules, no
design text, no ticket, no GOALS, no change to any comparison outcome for a
valid `JsonValue` input.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order): `npm run build`;
`npm run lint:imports`; `node --experimental-vm-modules --test test_env/tests/t287-value-equality.test.mjs`;
`npm run test:installed:language`. Record exit codes and wall times.

**Self-check:** (1) `grep -rn "function sameCanonical" code/src` returns nothing; (2) `grep -rn -E 'canonicalJson\([^)]*\) [!=]== canonicalJson\(' code/src` returns nothing; (3) `grep -rn -E '\.join\("\\0"\) [!=]== ' code/src | grep -v Object.keys` returns nothing or only sites you listed as left; (4) `grep -rn "function canonicalRecordDigest" code/src` shows one definition, in `shared/value/`; (5) the gate passed; (6) only grant files in `git diff --stat`.

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 4: value family; one owner for canonical equality and record digests`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append:

```
## Return
- commit: <hash>
- atoms: <file: exported names>
- retired: counts before/after for each census class (private functions, inline canonical, both-sides digest, record digest copies, sequence joins), with the file list
- D3 / O-TYPE sites: <site: decision>, one per line; sites left with a cast, listed
- C2 path: what :800 and :529 now read
- gate: build; lint:imports; unit lane (pass/fail counts); test:installed:language
- self-check: 1..6
- residuals
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing if: (a) a replacement would change
a comparison outcome for a valid input at a site (report the site and both
behaviors); (b) the gate fails after one bounded fix; (c) the C2 positive
test cannot be written without a Product or ABG behavior change.

ACTION: execute step 4 as activated.

## Executive note (2026-10-22, from the step 3 Return at `a2516dbdc`)

Head for this step is `a2516dbdc` (the Executive's bookkeeping commit sits
on top; the source tree equals it). Steps 2 and 3 landed: `shared/refusal.ts`
(`ok`, `refused`, `andThen`), `shared/select/exact_match.ts`,
`shared/admit/` (`isRecord`, `hasExactKeys`, `admitJson`, `admitContract`,
`admitRef`), the binding family in `public/binding/`. The retired names
`isJsonRecord`, `isJsonRecordShape`, `hasUnicodeNulJoinedKeys`,
`hasExactJsonKeys` and the other NUL-joined predicates no longer exist. Three
items join your grant:

1. **D3 ruling at `abg/retry.ts:659-663`** (`isProjectedRetryResumeCarrier`):
   the site keeps `sha256Canonical(value.inputValue as JsonValue)` behind an
   `isRecord` check. Ruling: ingress through `admitJson`; the digest is
   computed over the admitted value. The carrier's contract makes
   `inputValue` a JSON value whose canonical digest is `inputDigest`; a value
   that is not I-JSON has no canonical digest, so refusing it changes no valid
   input's outcome, and digesting a cast value is the C2 bug class this
   step closes. Record it under O-TYPE with the site.
2. **Test maintenance for the library's own unit lane.**
   `test_env/tests/t287-common-computational-library.test.mjs` imports
   retired names (`sameJson`, `sameCoordinate` from the binding mechanics;
   `hasUnicodeNulJoinedKeys`) and fails to import. Rewrite its four cases
   over the consolidated atoms: D02 over `canonicalEquals` (this step), D02
   coordinate equality over whatever `exactContractCoordinate` now exposes
   or drop it if the binding mechanics no longer export an equality,
   D03 unchanged over `resolveExactMatch`, D04 over `hasExactKeys` with the
   P-KEYS counterexample (a key containing U+0000 against the split keys
   yields `false`; the retired NUL-joined bodies returned `true`). Keep the
   file name. Delete `test_env/tests/t288-admission-predicates.test.mjs`:
   it asserts the retired bodies by name and their mutual differences,
   which row 2 of the design retires; say so in Return. Neither file is in
   a package script; the step 8 run names the first.
3. Your own unit lane `t287-value-equality.test.mjs` stays as activated.

List the files and the retry decision in Return.

## Return

- commit: the commit that carries this Return, first line `Step 4: value family; one owner for canonical equality and record digests` (hash in the Worker's report).
- atoms: `shared/value/equality.ts`: `canonicalEquals`. `shared/value/record.ts`: `writeCanonicalRecord` (typed as design §4.3), `canonicalRecordDigest`, types `CanonicalJsonSink`, `JsonRecord`. `shared/value/index.ts` re-exports these and `canonical_json.ts`, `digests.ts`, `immutable.ts`, which keep their paths. `canonicalEquals` builds the left canonical text once and streams the right side against it, so one full string is allocated. It writes both sides in full: an encoding failure on either side propagates, and there is no identity shortcut. `canonicalRecordDigest` takes `JsonRecord` (the record member of `JsonValue`), not `JsonValue`. A non-record has no record digest, so the caller selects with `isRecord` after `admitJson`.
- grant basis: the census, re-verified by a TypeScript AST pass at `a2516dbdc`. The activation's counts (12/70/44/18) are what the single-line greps of self-checks 2 and 3 return; the AST pass also finds multi-line sites, more equality bodies and comparisons through local digest aliases. All five classes in `code/src` were rewritten by a type-checked codemod (operand text and existing casts moved unchanged into the call), plus the hand sites below.
- retired, before → after:
  - private equality bodies: census 12 → 0. Re-verified: 44 two-argument bodies (38 over the encoders, 6 over local digest aliases: `sameQualificationValue`, `abg/runtime_liveness same`, `abg/semantic_revision same`, `abg/semantic_job equal`, `product/semantic_revision same`, `product/semantic_job equal`) → 1 kept: the binding `sameJson` lift. 648 call sites now call `canonicalEquals`; 5 of them were rewritten by hand.
  - inline canonical comparisons: grep 70 → 0; AST 178 → 2 (left: the installed-codec sites below).
  - both-sides digest comparisons: grep 44 → 0; AST 192 → 0. Also 156 both-sides comparisons through single-parameter digest aliases (`hash`, `qualificationHash`, `runtimeLivenessDigest`) → 0. Digest checks against stored digests stay.
  - record digest copies: 2 → 0. One definition remains, in `shared/value/record.ts`.
  - sequence joins: grep 18 → 0. AST: 25 two-sided sites → 0; 7 one-sided sites in `gtl/consensus.ts` → 0, each compared as `canonicalEquals(refs, [CONST])`; 2 join bodies → 0 (`sameOrderedValues` in execution_basis and `sameValues` in traversal_route, 41 call sites).
  - result: 1204 `canonicalEquals` calls in 121 files. Files changed: 125 source files plus `shared/value/`. These are the 121 files listed under O-TYPE below, plus `hog/operator_support.ts` and `validator/qualification_contracts.ts` (exported bodies removed), `product/release_snapshot_operations.ts` (an unused body removed) and `gtl/worksite_command_execution.ts` (pin, see self-check 6).
- D3 / O-TYPE sites:
  - `abg/retry.ts` `isProjectedRetryResumeCarrier` (old :659-663), Executive ruling applied: `inputValue` enters through `admitJson`, and `sha256Canonical` runs over the admitted value; a refusal is not a carrier.
  - `abg/execution_basis.ts` `exactC2SourceEnvironment` (C2): the durable read and the materialized view are each admitted. A refusal of either side means not current.
  - `abg/execution_basis.ts` `detachJsonRecord` (the raw-input ingress of both record-digest sites): `structuredClone` is replaced by `admitJson` plus the record member; then `canonicalRecordDigest`.
  - `abg/invocation_execution_truth.ts` basis projection: `rawInputValue` is admitted, checked with `isRecord`, then `canonicalRecordDigest`.
  - `product/verify_product.ts` `makeCoordinate`: the `unknown` projection fragment is admitted; a refusal returns `null` (the existing negative branch). This is the only `unknown` operand among the call sites of the census twelve.
  - `hog/parent_rehydration.ts`: the two `application` sites are already typed `JsonValue`, so they call directly and the `object` casts are gone. The execution-basis and traversal-scope carrier site keeps its cast with a one-line comment (left). Typing those carriers belongs to abg, and admitting would deep-copy both carriers on every check.
  - retired try/catch bodies (`open_call`, `c_call`, `retry`, `hog/operator_support`, `project_read_definition_bindings`, `run_invocation_operation exactJson`; 44 sites, plus 5 hand sites):
    - `| undefined` operands are guarded explicitly, so `undefined` still takes the negative branch: the `project_read_definition_bindings` run-gap row; `run_invocation_operation` `input`, `inputContract` and `allowlist`.
    - Owner-typed carrier operands take the cast. A non-JSON member inside a typed carrier (NaN, or `undefined` behind a cast) now throws `TypeError` where it returned false.
    - Sites per file: c_call 10, open_call 3, retry 7, hog entry 5, retry_lifecycle 5, recursion_lifecycle 2, project_read_definition_bindings 8, run_invocation_operation 3.
  - binding `sameJson` (`public/binding/definition_binding_mechanics.ts`) is kept as the Lift-family body, `try { canonicalEquals(left as JsonValue, right as JsonValue) } catch { false }`. It has 14 importers and about 100 calls, and its fault surface (P-BIND) depends on an encoding failure counting as inequality.
  - sequence joins: `canonicalEquals` differs from the NUL join only when an element contains U+0000 (`["a\0b"]` used to equal `["a","b"]`) or when `[]` meets `[""]`. This is the P-KEYS correction class; recorded, not stopped. The consensus constants are non-empty and NUL-free, so `[CONST]` is exactly equivalent at those sites.
  - casts left (owner carriers not typed `JsonValue`): each is the cast the retired body or the inline site already applied, so behaviour is unchanged. 867 of 1204 calls carry a `JsonValue` cast. Per file, cast calls/calls: abg/actor_process.ts 1/1; abg/artifact_truth.ts 7/8; abg/c_call.ts 22/24; abg/c_call_outcome.ts 6/6; abg/closure.ts 2/3; abg/construction_continuation.ts 1/2; abg/continuation.ts 10/10; abg/definition_event_resource.ts 2/2; abg/environment_admission.ts 3/3; abg/event_calculus.ts 1/1; abg/event_log.ts 1/1; abg/event_prefix.ts 1/1; abg/event_store.ts 1/1; abg/execution_basis.ts 31/35; abg/fan_out_projection.ts 3/3; abg/fh_continuation_projection.ts 2/3; abg/fh_resume_relation.ts 1/2; abg/graph_application.ts 4/4; abg/instruction_assembly.ts 9/11; abg/invocation_admission.ts 16/22; abg/invocation_execution_truth.ts 10/13; abg/native_work_effect.ts 1/1; abg/native_work_reacquisition.ts 1/1; abg/native_worksite_execution.ts 1/1; abg/open_call.ts 3/3; abg/project_read_definition_bindings.ts 5/9; abg/project_read_ports.ts 4/7; abg/qualification_proof.ts 14/40; abg/registered_selection_provenance.ts 2/2; abg/replay.ts 2/2; abg/requirement_handoff.ts 4/4; abg/retry.ts 21/26; abg/runtime_liveness.ts 6/8; abg/runtime_liveness_contracts.ts 2/2; abg/semantic_job.ts 45/50; abg/semantic_revision.ts 86/96; abg/semantic_stage.ts 23/25; abg/stdo_environment.ts 5/20; abg/traversal_cursor.ts 2/3; abg/traversal_route.ts 22/63; abg/worker_transport.ts 1/2; abg/worksite_command_forward.ts 18/19; abg/worksite_construction_recovery.ts 23/27; abg/worksite_input_provenance.ts 19/21; abg/worksite_revision.ts 63/66; gtl/consensus.ts 30/37; gtl/graph_construction.ts 1/1; gtl/semantic_revision_publication.ts 1/1; gtl/semantic_stage.ts 1/1; gtl/semantic_stage_publication.ts 1/1; gtl/worksite_c0.ts 1/1; gtl/worksite_command_forward.ts 1/1; gtl/worksite_construction_recovery.ts 1/1; hog/entry.ts 3/5; hog/parent_rehydration.ts 3/5; hog/recursion_lifecycle.ts 2/2; hog/retry_lifecycle.ts 4/5; hog/traversal.ts 3/3; implementation/leaf_invocation_port.ts 7/7; implementation/native_workspace_work.ts 2/3; implementation/qualification.ts 1/1; implementation/release_publication.ts 12/38; implementation/semantic_revision.ts 3/3; implementation/semantic_stage.ts 1/1; implementation/worksite_command_execution.ts 4/4; implementation/worksite_command_forward.ts 2/2; implementation/worksite_command_helper.ts 4/4; implementation/worksite_construction.ts 1/1; implementation/worksite_file_replace.ts 11/12; product/builtin_semantics.ts 37/39; product/catalog.ts 5/6; product/catalog_operation_contracts.ts 1/2; product/declaration_closure.ts 10/10; product/declaration_exports.ts 3/3; product/environment.ts 7/12; product/environment_operation_contracts.ts 1/3; product/execution_resolution.ts 6/6; product/implementation_resolution.ts 1/1; product/install_product.ts 2/3; product/invocation.ts 6/10; product/native_workspace_assessment.ts 1/1; product/native_workspace_work.ts 8/12; product/public_contract_publication.ts 2/2; product/requirement_handoff.ts 1/1; product/run_invocation_operation.ts 3/7; product/semantic_job.ts 29/38; product/semantic_revision.ts 23/24; product/semantic_stage.ts 3/4; product/semantics.ts 1/2; product/verification_definition_bindings.ts 4/4; product/verify_product.ts 19/22; product/worksite_branch_construction.ts 11/11; product/worksite_command_execution.ts 1/1; product/worksite_command_forward.ts 9/9; product/worksite_construction.ts 8/8; product/worksite_construction_recovery.ts 4/5; product/worksite_effect.ts 7/7; product/worksite_operations.ts 9/12; product/worksite_preparation.ts 6/6; product/worksite_preparation_contracts.ts 2/2; product/worksite_revision.ts 2/2; product/workspace_operations.ts 1/1; public/binding/definition_binding_mechanics.ts 1/1; public/binding/public_function_family.ts 5/5; shared/capability_contracts.ts 3/4; validator/conformance_operation.ts 1/1; validator/graph.ts 2/2; validator/implementation_resolution.ts 2/2; validator/qualification.ts 6/51; validator/self_conformance_semantics.ts 7/8.
  - typed, no cast: abg/event_body_encoding.ts; gtl/declarations.ts; gtl/registered_selection.ts; hog/route_proposal.ts; owner_bindings/run_invocation.ts; product/release_acceptance.ts; product/result_assessment_operation.ts; product/stdo_environment.ts; validator/qualification_resources.ts; validator/self_conformance.ts; validator/validation.ts.
- C2 path:
  - `:800` (now :796) keeps `runtimeEventBodiesAtPrefix(sourcePrefix).materialize()`.
  - The `:529` `sameCanonical` is gone. The check now reads `admitJson(readRuntimeEventsAtDurablePrefix(sourceDurablePrefix))` and `admitJson(sourceEvents)`. A refusal on either side returns false; otherwise the result is `canonicalEquals(durable, view)`.
  - Coverage: a temporary counter on the compiled C2 comparison recorded 0 hits across the C2 core, child, owner-reuse, native-work currentness, worksite command, native worksite and observed worksite suites. The counter was removed and the build regenerated. No passing test reaches the production comparison; the C2 owner-reuse suite (0/6) is red at `a2516dbdc` with identical failures. The positive and negative proof is the unit lane, which runs the same sequence over the same event-store and prefix functions.
- gate (in order):
  - `npm run build`: exit 0, 32 s.
  - `npm run lint:imports`: exit 0, under 1 s, 24 shared modules.
  - unit lane `t287-value-equality`: exit 0, 4 pass / 0 fail, under 1 s.
  - `npm run test:installed:language`: exit 0, 1 pass / 0 fail, 45 s.
  - Run once in addition:
    - `t287-common-computational-library`: 4/4.
    - `test:unit`: 68 pass / 8 fail / 5 skipped, the same failure set as `a2516dbdc`.
    - An 11-file end-to-end set (C2 owner and core and child, native-work currentness, R4 A-B-A, retry-run-prefix, native semantic revision, D1 semantic stage, generic-job revision, STDO and STDO 3 run environment): 20 pass / 15 fail / 7 skipped. All 15 failures reproduce at `a2516dbdc`: 14 with identical messages, and the R4 A-B-A `manifest_malformed` with `parseProductManifest` returning null under the HEAD code.
    - `t287-worksite-command-execution` 3 pass / 1 fail and `t287-observed-worksite-command` 7 pass / 1 fail: the same failures at `a2516dbdc`.
- self-check:
  1. none.
  2. none (an AST pass also finds none; only the installed-codec `product.canonicalJson` pair remains).
  3. none; no join site left.
  4. one definition, `shared/value/record.ts:46`.
  5. passed.
  6. grant files only:
     - census-site source files and their imports;
     - `shared/value/**`;
     - tests: the new lane, the rewritten library lane, the deleted t288;
     - regenerated outputs: 18 tracked `build/**` files, `contracts/capabilities/capability-definition-graph.json`, `contracts/worksite/command-execution-context.inventory.json`, `product-toolchain-manifest.json`;
     - `gtl/worksite_command_execution.ts`: the generator verifies pinned digest, byte count and span offsets for `build/code/src/product/worksite_command_execution.js`, which is the compiled output of a census site. They were updated as in step 3; the span digest is unchanged.
- tests:
  - `t287-common-computational-library` rewritten:
    - D02 now runs over `canonicalEquals`. Its non-I-JSON cases (sparse array, unsafe integer, accessor, NaN, `undefined`) became `admitJson` refusals.
    - D02 coordinate stays over `sameCoordinate`. The binding mechanics still export it and `sameJson`; the import failed only on `hasUnicodeNulJoinedKeys`.
    - D03 is unchanged.
    - D04 runs over `hasExactKeys` with the P-KEYS counterexample.
  - `t288-admission-predicates` deleted: it asserted the retired NUL-joined bodies by name and their mutual differences, which design row 2 retires.
- residuals:
  - Left, not converted:
    - The two installed-codec equalities, `public/installed_definition_call_transport.ts` `sameStructure` and `public/installed_public_definition_call.ts` `sameJson(product, …)`, use the installed Product's `canonicalJson`.
    - The memoized `lockBody` comparison at `abg/environment_admission.ts:936`.
    - Five one-sided text-vs-bytes encoding checks.
    - The three hand-rolled record writers that produce persisted plan digests: `abg/c_call.ts` `pendingInteractionBodyDigest`, `abg/replay.ts` `writeReplayBody`, `abg/retry.ts` `completedRetryProgressPlanDigest`.
    - Four fast-path equality wrappers (identity, then `isDeepStrictEqual`, then `canonicalEquals`): `product/worksite_command_execution` `same`, `abg/native_worksite_execution` `same`, `abg/native_work_reacquisition` `same`, `abg/qualification_proof` `sameFact`.
    - 41 single-parameter digest aliases, now used only for digests.
    - About 65 re-verified-census call sites that hold `unknown` (semantic_*, worksite_*_recovery, worksite_command_forward, stdo_environment, qualification) keep the old body's `as JsonValue` instead of `admitJson`.
  - Evaluation order: the old form encoded A before evaluating B; `canonicalEquals` evaluates both operands first. This matters only where B has side effects or does IO (for example `readRuntimeEventsAtDurablePrefix`, `worksiteExecutionSources(task)[ordinal]`). No outcome change was found.
  - Public surface: `validator/qualification_contracts.ts` `sameQualificationValue` was re-exported by `validator/index.ts` `export *`, so its removal drops it from the package `"."` and `"./validator"` entries. No consumer outside `code/src` imports it; only historical `.ai-workspace` snapshots name it.
  - `test_env/support/t288-admission-helper-preimages.json` is orphaned by the t288 deletion. It was not removed because it is outside the grant.
  - Dense single-line files gained long lines where casts moved from bodies into calls.
  - Design §4.3 says the inline digest comparisons stay as `===`. The activation's narrower rule was followed instead: comparisons that digest both sides became `canonicalEquals`; digest checks against stored digests stay `===`.
- return route: this file

## Disposition (Executive)

Accepted at `5f4a1d4c9`. Rulings on the two stop questions: (a) the join
replacement distinguishing `["a\0b"]` from `["a","b"]` and `[]` from `[""]`
is the P-KEYS correction the design specifies; the retired joins conflated
distinct sequences, so no valid input changed outcome. Encoding failures
propagating as `TypeError` from typed carriers is the derive family's defect
channel (design §3: defects keep `throw`). (c) The C2 positive and negative
proof on a test-side copy of the sequence is accepted as the atom-level
P-EQUAL evidence; the production comparison in `exactC2SourceEnvironment`
stays unproven by any suite until the C2 owner-reuse suite is green, which
is a step 8 matter (the suite is red at `a2516dbdc` with the same failures,
before this step). Public surface: the removal of `sameQualificationValue`
from the `validator` barrel and so from the package `"."` and `"./validator"`
entries is a surface change outside `realization_refactor`; no consumer
outside the tree imports it, and it is one line to restore; flagged for Jim,
not reverted. Residuals carried to step 8: the three record writers that
produce persisted plan digests (left for digest stability; the design's row
3 count is corrected at close), the installed-codec pair (installed
Product's encoder, correctly left), four fast-path wrappers, about 65
`unknown` call sites that still cast (O-TYPE residue), the orphaned
`test_env/support/t288-admission-helper-preimages.json` (step 8a deletes),
and the §4.3 wording on inline digest comparisons (step 8b clarifies).
