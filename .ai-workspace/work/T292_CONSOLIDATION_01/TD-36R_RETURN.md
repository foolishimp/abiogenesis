# TD-36R Return: the remaining binding, join, grant and set copies

Writer: Claude Opus 5.5. Branch `claude/td36-remaining-copies` from `main` at
`aaf02dcbb`, worktree `/private/tmp/abg-td36r` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.

**Status: done; items 1 to 6.** Item 5 is closed at the door under the
Executive's second ruling (section 1.5), which replaced the first ("leave
item 5 unchanged"). No stop condition fired: the recorded history holds no
padded binding, no refusal code or message is added, no lane binds with a
padded value, and the change is in `product/environment.ts` and one new test
file.

| Commit | Content |
| --- | --- |
| `9a6ff864e` | items 1 to 4, with the regenerated manifest, capability graph and candidate basis |
| `0ff92bb14` | item 6 (delete the delegate), with the regenerated manifest, capability graph and candidate basis |
| `f3d420b8b` | the two new test files |
| `33f5ded46` | item 5 at the bind door, with the regenerated manifest, capability graph and candidate basis, and the new lane file `t292-td36r-bind-door-strings` |
| this commit | this Return |

Source size: `git diff --numstat aaf02dcbb -- code/src` is +32, −40 over five
files (`abg/environment_admission.ts` 3/12, `product/environment.ts` 15/7,
`product/invocation.ts` 1/1, `product/native_workspace_work.ts` 3/5,
`product/worksite_effect.ts` 10/15).

## 1. Trace

Line numbers are at `aaf02dcbb`.

| # | Site | What it omitted | Callers | Done |
| --- | --- | --- | --- | --- |
| 1 | `abg/environment_admission.ts:1103` `hasAdmittedWorkspaceBinding` | Re-digested the nine-field body; no record shape, key set, string, root, `admitJson` or `bindingId` identity check | `abg/actor_process.ts:877` (`invokeActorProcessWithAssembly`), `abg/continuation.ts:1152`, `product/project_read_definition_bindings.ts:690` (workspace status); exported from `abg/index.ts:64` | Body is `isExactWorkspaceBinding(binding) && selectExactArtifactTruthRow(...) !== null`. The row selection is unchanged. No caller changed |
| 2 | `product/native_workspace_work.ts:39-41` `isNativeWorkspaceWorkTask` | Join: no `workspaceId` equality. Grant: no `memberKey` check. `definitionKey.operationId` was already implied (`isCapabilityGrantValue` requires `operationId === definitionKey.operationId`) | `constructNativeWorkspaceWorkTask`; `builtin_semantics.ts:106, 195, 273, 312`; `semantic_revision.ts:350, 412-413, 433` | `exactWorkspaceAuthorityJoin(a, w) && isExactDirectGrant(g, w)`. New refusals: `w.workspaceId !== a.workspaceId`; `memberKey` not `invoke` or `start` |
| 3 | `product/worksite_effect.ts:1066-1073` in `isWorksiteFileReplaceRequest` | Nothing: the inline rule equals the owner grant over the request's binding coordinates and the authority's actor | `constructWorksiteEffectAuthorization`; `product/index.ts` export | `isExactDirectGrant(value.capabilityGrant, { authorizedActorRef: authority.authorizedActorRef, bindingId: value.workspaceBindingIdentity, bindingDigest: value.workspaceBindingDigest })`. The owner's second parameter is widened to `Pick<WorkspaceBinding, "authorizedActorRef" \| "bindingId" \| "bindingDigest">`; it is `@internal`, so no declaration changes. Same verdict |
| 4 | `product/worksite_effect.ts:539-561` `exactImplementationSet` | Digested the raw post-spread body | `constructWorksiteEffectAuthorization` (`:1100`, `:1121`), `constructWorksiteFileParentsAuthorization` (`:1639`) | `admitJson(body)` first; digest of the admitted value. Newly refused: lone surrogates, unsafe integers, nested accessor, symbol, non-enumerable or Proxy members, and top-level enumerable symbols (the spread copies them; the canonical writer ignores them) |
| 5 | `product/environment.ts:1129-1179` bind constructor and `:1200-1274` candidate owner | Constructor: roots only `typeof string` and `isAbsolute`; authority, ProductSet and lock ids unchecked as strings. Candidate owner: `isNonblankString`, so padding and NUL allowed in the binding id, `workspaceId`, `authorityBasisId`, `authorizedActorRef`, `productSetId` and the roots | Constructor: the Public bind port (`environment_operations.ts:38-54`), admission's reconstruction (`abg/environment_admission.ts:1318`), the artifact-truth fold of bind events (`abg/artifact_truth.ts:570`). Candidate owner: admission (`:1330`), the fold (`artifact_truth.ts:556`), catalog (`catalog.ts:470`), workspace status (`project_read_ports.ts:658`) | Closed at the door (section 1.5): the constructor refuses with the existing `invalid_declared_root` when `workspaceId`, `authorityBasisId`, `authorizedActorRef`, `productSetId`, `lockId` or a root fails `exactString`; the candidate owner uses `exactString` for the binding id, those four ids and the roots. `isAbsolute` kept. `isWorkspaceAuthorityBasis` and `constructWorkspaceAuthorityBasis` unchanged |
| 6 | `product/worksite_effect.ts:448-452` `exactWorkspaceBinding` | An exported second name with no caller | none (not re-exported from `product/index.ts`, and package exports refuse deep imports) | Deleted |

### 1.4 Item 4: no accepted digest moves

`admitJson` either refuses a value or returns one whose canonical bytes equal
the input's: the canonical writer reads own enumerable string keys and dense
array indices, and `admitJson` accepts only records whose own keys are all
enumerable string data members and arrays with exactly dense indices; strings
are unchanged and `-0` is written `0` by both. So for every set that is still
accepted, `sha256Canonical(admitJson(body).value) === sha256Canonical(body)`.
Checked:
- The lanes assert both digests equal on the exact fixture set and on a re-minted set.
- Recorded sets: every file under the evidence root that names `implementationSetDigest` (812 files; 344 set values, 101 distinct) and the sparse checkout (1 set): no lone surrogate and no unsafe integer, so `admitJson` accepts every one and its digest is unchanged. 22 files did not parse as JSON or JSONL (logs and sources).

### 1.5 Item 5: closed at the door

The Executive's second ruling: the stricter check moves to its owner's door
(TD-36: "the consolidated form is the strictest existing copy"; TD-34: "the
stricter check moves to its owner; this wave loosens no Public admission").
The invariant: the constructor never returns, and admission never admits, a
candidate whose admitted form `isExactWorkspaceBinding` refuses for a string
reason.

The path that admitted them before:
- The bind request carries the authority only as `{ref, digest}` (`product/environment_operation_contracts.ts:444`, `refDigestSchema`; `nonblankSchema` is `/\S/`, `shared/public_function_contracts.ts:123-126`). The authority itself is the caller's resource assertion.
- `validateBindResources` (`product/environment_definition_bindings.ts:514-580`) checks it with `isWorkspaceAuthorityBasis` (`:534`, which uses `isNonblankString`), and relates only `workspaceId` and `canonicalRoot` to the workspace manifest (`:558-559`).
- `constructWorkspaceAuthorityBasis` (`product/environment.ts:1044-1046`) refuses only an empty `workspaceId` or actor. The bind constructor checked the roots only for `typeof string` and `isAbsolute`; the candidate owner used `isNonblankString`.
- `checkAdmissionScope` (`product/admission_authority.ts:400-404`) skips the environment relation for a `workspaceBindingRequirement: "forbidden"` operation, which bind is (`environment_operation_contracts.ts:478`).
- `admitWorkspaceBinding` (`abg/environment_admission.ts:1247-1386`) reconstructs the candidate with the constructor and admits it.

`workspaceId` cannot be padded on the Public path (it must equal the
manifest's generated `workspace://abiogenesis/<hex>`); the actor and the six
roots could (`absolutePathSchema` and `isAbsolute` accept trailing whitespace
and NUL). `authorityBasisId`, `productSetId` and `lockId` are identities the
owners mint.

The change (`product/environment.ts` only):
- `constructWorkspaceBindingWithSetCheck`: after the authority and set checks, `[authority.workspaceId, authority.authorityBasisId, authority.authorizedActorRef, productSet.productSetId, lock.lockId].every(exactString)`, and each root `exactString(root) && isAbsolute(root)`. A failure returns the existing refusal: code `invalid_declared_root`, message "workspace authority, ProductSet, and every declared root must be exact". `lock.lockId` was already read by the set check, so no new throw path.
- `workspaceBindingCandidateMatches`: `exactString` in place of `isNonblankString` for `bindingId`, `workspaceId`, `authorityBasisId`, `authorizedActorRef`, `productSetId` and the roots. `lockId` stays an equality with the lock's id, which the constructor now checks.
- `exactString` is the module's existing alias of `isTrimmedNonblankNulFreeString`, the rule `isExactWorkspaceBinding` applies. No import changes.

Refusal codes. No refusal code or message is added.
- Public bind: the port (`ProductEnvironmentPort.bindWorkspace` = `constructExactWorkspaceBinding`) returns `invalid_declared_root`; `bindRefusalCode` maps it to the Public refusal code **`root_mismatch`**, issue path `/request` (`environment_definition_bindings.ts:594-595`, `:692`). Admission is not reached.
- Owner-level admission of a candidate minted outside the constructor: the reconstruction refuses, so `admitWorkspaceBinding` returns its existing `scope_mismatch` (`abg/environment_admission.ts:1348`), which the Public bind would map to `product_mismatch` (`environment_definition_bindings.ts:740-741`).

Recorded history, walked before the source change. Every file under the
evidence root that names `workspace_binding` (44,244 files), every
compressed file there (1,321 `.gz`, `.tgz`, `.tar.gz`, `.zip`, members walked)
and the one `.tar.zst` (decompressed to scratch) were walked, bind event
bodies in event logs and embedded JSON strings included:
- 3,366 admitted-binding values (227 and 64 distinct in the plain and compressed walks) and 3,370 binding-candidate values (183, 106 and 9 distinct in the plain, compressed and `.zst` walks): 0 fail `exactString` in the binding id, `workspaceId`, `authorityBasisId`, `authorizedActorRef`, `productSetId`, `lockId` or a root; 0 admitted bindings have a failing `admissionEventRef`.
- Text fallback for units that do not parse as JSON (mostly `.js`, `.ts`, `.mjs` and `.md` sources and logs): 479 `"<field>": "<string>"` members for those twelve fields; 0 fail.
- 423 unreadable files are V8 `node-compile-cache` binaries; 3 `changed-archive.tgz` files hold the text "changed archive bytes". 37 `kind: "workspace_authority_basis"` values without the three fields are import-handoff coordinates (`authorityRef`, `authorityDigest`, …), not authority bases.

This matters beyond the door: the artifact-truth fold replays every bind
event through the constructor and the candidate owner
(`abg/artifact_truth.ts:556`, `:570`), so a recorded padded bind would now
fail its fold. None exists.

Lane: `t292-td36r-bind-door-strings` (section 3).

## 2. The change

- `abg/environment_admission.ts`: imports `isExactWorkspaceBinding` from `product/environment.js` (the module already imported it); the nine-field digest is gone.
- `product/native_workspace_work.ts`: imports the owner join and the owner grant.
- `product/invocation.ts`: `isExactDirectGrant`'s second parameter is a `Pick` of the three fields it reads.
- `product/worksite_effect.ts`: the file-replace grant calls the owner; `exactImplementationSet` admits the body; the delegate is deleted.
- `product/environment.ts` (item 5): the bind constructor and the candidate owner apply `exactString` (section 1.5).

Unchanged:
- No identity formula, digest input, admitted event byte or refusal code set changed. Every refusal keeps its code and message.
- After commit `9a6ff864e`, all 496 `.d.ts` files under `build/` are byte-identical to the base build (sha256 lists compared).
- After commit `0ff92bb14`, exactly one differs: `build/code/src/product/worksite_effect.d.ts` (`907159dd…935b` → `2fda84c6…3769`).
- After commit `33f5ded46`, all 496 `.d.ts` files are byte-identical to the `0ff92bb14` build: both changed functions are module-private.

Import direction: `lint:imports`, `lint:lifecycle` and `lint:calculus` are green after each commit. No new module edge: `environment_admission` already imported `product/environment`, `native_workspace_work` already imported both owners' modules, `worksite_effect` already imported `product/invocation`, and `environment.ts` already imported `exactString`.

## 3. Tests

New lanes, three new files. Each tightened lane was run on the pre-change build
(a copy of the base build and, for the packed lane, an archive of the base
tenant with that build) and failed exactly at the tightened assertion, after
its control passed.

| File | Lane | Pre-change build | After |
| --- | --- | --- | --- |
| `t292-td36r-remaining-owners` | native work: binding `workspaceId` differs from the authority (binding, grant scope and context re-minted, each exact on its own) | red at `:80` (accepted) | green |
| | native work: grant `memberKey: "resume"` (re-minted); controls `invoke` and `start` | red at `:91` | green |
| | file-replace grant: 7 grant variants against the vendored old rule | green (equivalence) | green |
| | both authorizations: implementation set with an enumerable symbol member (raw digest unchanged) | red at `:201` (both authorized) | green |
| | both authorizations: set body with a lone surrogate (set, execution basis and C call re-minted; well-formed re-mint is the control) | red at `:215` (both authorized) | green |
| | `exactWorkspaceBinding` is not exported | red at `:219` | green |
| `t292-td36r-admitted-binding-owner` | `hasAdmittedWorkspaceBinding` on an admitted binding with one extra top-level key (packs, verifies, installs, admits install and bind) | red at `:80` (accepted) | green |
| `t292-td36r-bind-door-strings` (item 5; packs, verifies, installs, admits install, then binds in one store) | control: a well-formed binding is constructed, equals the constructor formula, is accepted by the candidate owner and admitted | green | green |
| | actor `" actor://t292/td36r/door "`: the constructor and the Public bind port (`ProductEnvironmentPort.bindWorkspace`) return exactly `invalid_declared_root` with its existing message; a candidate minted by the constructor formula is refused by the candidate owner and by admission (`scope_mismatch`) | red at `:117` (candidate returned) | green |
| | actor with a NUL (`"actor://t292/td36r/\0door"`): the same four assertions | red at `:117` | green |
| | `eventLogRoot` with a trailing space: the same four assertions | red at `:117` | green |
| | invariant: the admitted control passes `isExactWorkspaceBinding` and `hasAdmittedWorkspaceBinding` | green | green |

To rerun a lane on another build, set `ABG_WORKSITE_BUILD_ROOT` to that
build's `code/src`; the packed lanes pack the tenant that holds the build.
The item 5 lane's pre-change build is a snapshot of `f3d420b8b` (its source
archive and its build).

Reruns, one file at a time on the `0ff92bb14` build (items 1 to 4 and 6), with
`ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace` and
`TMPDIR=/private/tmp/abg-td36r-tmp`:

| File | Touched caller it exercises | Tests | Pass | Fail | Skip | Wall s |
| --- | --- | --- | --- | --- | --- | --- |
| `t292-td36r-remaining-owners` (new) | items 2, 3, 4, 6 | 6 | 6 | 0 | 0 | 0 |
| `t292-td36r-admitted-binding-owner` (new) | item 1 | 1 | 1 | 0 | 0 | 33 |
| `t292-workspace-binding-extra-key` | native work, semantic revision, construction | 3 | 3 | 0 | 0 | 1 |
| `t292-binding-row-owner-differential` | the TD-36 owners, `isExactDirectGrant` | 5 | 5 | 0 | 0 | 0 |
| `t287-native-workspace-work` | native work input admission; actor process (stubbed binding check) | 44 | 43 | 0 | 1 | 2 |
| `t287-native-semantic-revision` | semantic revision over native work tasks | 7 | 7 | 0 | 0 | 3 |
| `d2-binding-transition` | semantic revision | 10 | 10 | 0 | 0 | 38 |
| `t287-generic-job-worksite` | file replace, both authorizations (implementation set) | 9 | 9 | 0 | 0 | 0 |
| `t287-post-binding-worksite-write` | file replace request, effect authorization | 2 | 2 | 0 | 0 | 58 |
| `t287-native-worksite-execution` | native work task, worksite execution | 7 | 4 | 0 | 3 | 1 |
| `r3-workspace-binding` | binding admission | 1 | 1 | 0 | 0 | 38 |
| `t287-management-supervision` | **actor process binding admission**: V8 coverage shows `actor_process.js:507` (`hasAdmittedWorkspaceBinding`) and the new `isExactWorkspaceBinding` branch each reached 5 times, in installed child processes | 5 | 5 | 0 | 0 | 487 (under coverage) |
| `t287-w2-05-install-catalog-owner-chain` | **workspace status**: coverage shows `project_read_definition_bindings.js:413` reached 5 times | 3 | 3 | 0 | 0 | 82 |
| `t287-st1-installed-cross-owner-hello` | calls `abg.hasAdmittedWorkspaceBinding` directly (`:688`) | 3 | 3 | 0 | 0 | 122 |
| `t287-continuation-causation` | continuation (recorded input) | 1 | 1 | 0 | 0 | 0 |
| `t287-qualification-scopes` | actor process (stubs `hasAdmittedWorkspaceBinding`) | 24 | 24 | 0 | 0 | 4 |
| `t288-instruction-assembly-owner` | actor process (stub) | 6 | 4 | 0 | 2 | 0 |
| `t287-lifecycle-failure-carrier` | actor process (stub) | 7 | 7 | 0 | 0 | 1 |
| `t287-management-context` | actor process (does not reach the check; coverage 0) | 14 | 12 | 0 | 2 | 1 |
| `t287-native-work-currentness-consumers` | native work, semantic revision, worksite effect | 6 | 6 | 0 | 0 | 41 |
| `t287-native-work-reacquisition` | native work task | 10 | 7 | 0 | 3 | 1 |
| `t287-native-c2-instruction-assembly` | native work task | 1 | 1 | 0 | 0 | 0 |
| `t287-native-assembly-retained-input` | native work task | 2 | 1 | 0 | 1 | 1 |
| `t287-event-body-encoding` | native work task values in event bodies | 26 | 25 | 0 | 1 | 16 |
| `t287-observed-worksite-command` | native work task | 8 | 8 | 0 | 0 | 1 |
| `t287-owned-native-proof` | native work task | 1 | 0 | 0 | 1 | 1 |
| `t287-generic-job-read-dependency` | worksite authorizations | 2 | 1 | 0 | 1 | 1 |
| `t287-retained-installed-consumer` | worksite authorizations | 1 | 0 | 0 | 1 | 0 |
| `t287-st2a-g-capability-definition-graph` | workspace status contract | 4 | 4 | 0 | 0 | 32 |
| `t287-selected-action-authority` | recorded catalog (item 6) | 3 | 2 | 0 | 1 | — |
| `t287-native-assessment-evidence` | recorded catalog (item 6) | 4 | 4 | 0 | 0 | — |
| `t287-default-library` | native work, execution basis, worksite effect (run only; another package edits it) | 37 | 34 | 0 | 3 | 330 |
| `t287-governed-context` | native work | 15 | 14 | **1** | 0 | 9 |
| `t287-single-address-space-consolidation` | file replace and authorizations; F_H | 12 | 5 | **7** | 0 | 352 |
| `npm run test:r2` (the r1 and r2 files), after each source commit | candidate basis | 2 | 2 | 0 | 0 | — |

The two red files are red for inputs this package does not touch:
- `t287-governed-context`, lane "GC03 real owner allowed denied cold tamper": `method/EVALUATION.md differs from its custody digest` (`:599`). The lane resolves the STDO release that `stdo_abiogenesis.json` selects (`stdo://releases/v3.0.4/` at the base) and compares its standards with digests pinned for STDO 3.0.2 (`:523`). The assertion runs before any owner code.
- `t287-single-address-space-consolidation`, 7 lanes: `ENOENT …/consolidation-inputs/native-02/EXTERNAL_READ_RESOURCES.json`. `ABI5_CONSOLIDATION_INPUTS` is unset and the default directory exists in no checkout on this machine. The 5 lanes that run, including the file-replace and F_H lanes, pass.

Skips are environment gates with no recorded value here: `ABI5_NATIVE_WORK_RETAINED_ROOT` (1), `ABG_NATIVE_EXECUTION_RETAINED_LOG` (2), `ABI5_NATIVE_SOURCE_READY_CATALOG` (1), `ABI5_D07_PREDECESSOR_SCRATCH` (1), `ABI5_NATIVE_D2_SELECTOR_PROMPT` (1), `ABG_NATIVE_REACQUISITION_RETAINED_ROOT` (3), `ABI5_NATIVE_RETAINED_JOB` (1), `ABG_RC5_ROUTE_SAMPLE_FILE` (1), `ABI5_OWNED_PROOF_NATIVE_REQUEST` (1), `ABI5_GENERIC_JOB_COMPLETED_ROOT` (1), `ABI5_RETAINED_CONSUMER_CONFIG` (1), `ABI5_CONTEXT_PUBLIC_PROOF` and `ABI5_CONTEXT_STDO_CONFIGURATION` (1 each), `ABI5_SELECTED_ACTION_OWNER_SUBJECT` (1), `ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_NATIVE_OBSERVATION_CAPTURE` and `ABI5_PLANNING_PROJECTION_CAPTURE` (1 each). With the evidence root set, `d2-binding-transition` (10) and `t287-native-semantic-revision` (2) now run; the first part skipped them.

Recorded inputs (item 2): every file under the evidence root that names `native_workspace_work_task` (1,264 files; 802 task values, 85 distinct) was walked, embedded JSON strings included. 0 tasks have `binding.workspaceId ≠ authority.workspaceId`, a `memberKey` outside {invoke, start}, or a padded or NUL binding string. 27 files did not parse as JSON or JSONL; none holds a `"workspaceBinding"` member. The sparse checkout holds no task value.

Reruns after item 5, one file at a time on the `33f5ded46` build, same
environment. The list is the Executive's, plus every test file that builds
or admits a binding from a hand-built authority or roots. No lane binds with
a padded or NUL value (searched in `test_env/tests`, `support`, `uat`,
`fixtures`); the only padded and NUL binding values in tests are the TD-36
differential's own cases.

| File | Tests | Pass | Fail | Skip | Wall s |
| --- | --- | --- | --- | --- | --- |
| `t292-td36r-bind-door-strings` (new) | 6 | 6 | 0 | 0 | 34 |
| `t292-td36r-remaining-owners` | 6 | 6 | 0 | 0 | 0 |
| `t292-td36r-admitted-binding-owner` | 1 | 1 | 0 | 0 | 33 |
| `t292-workspace-binding-extra-key` | 3 | 3 | 0 | 0 | 0 |
| `t292-binding-row-owner-differential` (candidate cases the owner now tightens beyond the catalog copy: 35 → 53, the 18 new ones padding and NUL cases) | 5 | 5 | 0 | 0 | 1 |
| `r3-workspace-binding` | 1 | 1 | 0 | 0 | 47 |
| `t287-st2a-e-exact-prefix-workspace-environment` | 2 | 2 | 0 | 0 | 81 |
| `t287-installed-dependency-lock` | 2 | 0 | 0 | 2 | 0 |
| `t289-install-event-bodies` | 4 | 4 | 0 | 0 | 57 |
| `t287-w2-05-static-binding-algebra` | 5 | 3 | 0 | 2 | 1 |
| `t287-conformance-owner-reuse` | 1 | 0 | 0 | 1 | 0 |
| `t287-held-owner-fold-reuse` | 1 | 1 | 0 | 0 | 42 |
| `t287-post-binding-worksite-write` | 2 | 2 | 0 | 0 | 61 |
| `t287-native-work-currentness-consumers` | 6 | 6 | 0 | 0 | 44 |
| `t287-w2-05-install-catalog-owner-chain` | 3 | 3 | 0 | 0 | 84 |
| `t287-st1-installed-cross-owner-hello` | 3 | 3 | 0 | 0 | 129 |
| `t287-selected-action` | 1 | 0 | 0 | 1 | 1 |
| `t287-d1-requirement-handoff` | 5 | 2 | 0 | 3 | 0 |
| `m5-event-store-reopen` | 27 | 27 | 0 | 0 | 64 |
| `steel-basic-cli-public` | 1 | 1 | 0 | 0 | 322 |
| `steel-consumer-declaration` | 1 | 0 | 0 | 1 | 0 |
| `w2-steel-single-start-installed` | 1 | 0 | 0 | 1 | 0 |
| `w2-steel-serial-branch-installed` | 2 | 0 | 0 | 2 | 0 |
| `npm run test:r2` | 2 | 2 | 0 | 0 | — |

The item 5 skips are environment gates, all unset: `ABI232_NATIVE_IDENTITY` or `ABI232_ISOLATED_MANIFEST` and `ABI207_NATIVE_IDENTITY` (dependency lock), `ABI5_PREPARATION_RESOLVE_CALL` (2), `ABI5_CONFORMANCE_PREDECESSOR_ROOT`/`_PROOF_ROOT`/`_METADATA`, `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`, `ABI5_D1_EVIDENCE_ROOT`, `ABI5_D1_POSITIVE_PROOF`, `ABI5_D1_RETAINED_NATIVE_BASIS` or `ABI5_D1_BUILD_ROOT`, and the frozen-artifact gates of the three steel files (`ABI5_STEEL02_*`, `ABI5_STEEL03_*`, `ABI5_STEEL04_*`, `ABI5_WAVE1_FROZEN_ARTIFACT_PATH`).

Lints: `lint:imports`, `lint:lifecycle` and `lint:calculus` pass after each source commit, `33f5ded46` included; `node --check` passes on the three new files.

## 4. Pins

| Value (file) | Base `aaf02dcbb` | After `9a6ff864e` | After `0ff92bb14` | After `33f5ded46` |
| --- | --- | --- | --- | --- |
| `productContentDigest` (manifest; capability graph) | `sha256:c46cd50ffdfa1943ef17642c6b0fed1f0c343fca94f70223d90e62f9f61a1c84` | `sha256:8be5b417da40e6d476141c87f72e10015d96735580719d45835a40cd3209feb5` | `sha256:322792cd3014b5fa6d5ab8ec2b614296625dcc1e025a65afdb91bbbae25f709c` | `sha256:05d3cbb57ed17afaf541d946b0c33fb6a2ccac4f512a78a90d0808e9c3d66c1d` |
| `contributionManifestDigest` (manifest) | `sha256:3c104740283c7317960566f81fc96d7a00101676b2739ec687004197089da9ea` | `sha256:f65a7b5bf6d52b8f0d332e701027f476ef85fe1b29392d2746f7c8d23659ad42` | `sha256:42fc74dc3d3af69e78ebdd682ed2a599bb4b1f9a984a4ca3cc138b7ab06cc063` | `sha256:3365e708a7f2f5c114a4a8785e274861527429e13b606d4a240ad3978a0d49b3` |
| capability graph `graphDigest` | `sha256:f9e6457b54b1bc548c00137a26d6790995e92cab20967479da832539a77590b2` | `sha256:5efd753e86a910ec46a987b2a20d9bb76d580e67c1ec46e271c072d4b3efbb4b` | `sha256:776105bbf58474dd9889d262628245c336154a169dffabc8f204ce5f915dab7a` | `sha256:cfdde989323acc08af3448888d2dbd401455f6b06c1369a09f54c4eb25dcb3dc` |
| capability graph asset `contentDigest` | `sha256:5be41ce6948b9395ff8ba710a94a18732e2c98be9acb010119875e0e48dd2dac` | `sha256:7a596759150626d64eea62f95851829293fad633a8fc88661df02400e665958b` | `sha256:f10aa3eba5d6d7d77ff83146e13004b59fc4bd76741ffb686270ac41eb3eeac7` | `sha256:e90880089bc5ea65a83aeb2b73f07b0d2c5fb329c86c2c8a0cf14fedd2620e71` |
| `publicContractCatalog.catalogDigest` (also `contributionManifest.publicContractCatalogDigest`) | `sha256:a67e743ca8fb775927c6ad67394d41797632d7895a9e7a9edce966ffb0f073f7` | unchanged | `sha256:0f682de18a2316d4dac034fbd80400f77a686d3930a2b35664f6ef8cac501125` | unchanged |
| candidate basis `artifactDigest` | `sha256:a03f1f7be520ef047a36946c16b0e4041469ddd5d9918cbb7930ad4b1b308c2a` | `sha256:a5a1a33f556420f4b1355d40cb293589923f4000264880d218288f97324a3373` | `sha256:9fbb0622ac5943393bbd3833520263ce73b0172f9286b5ad8c3ddece4cdb8c1c` | `sha256:7df27afc4b65ec069bd7eddad36dd759d565a0eb07bbeff4c1f11c6f4efba01f` |
| candidate basis `productContentDigest` | `sha256:c46cd50f…1c84` | `sha256:8be5b417…feb5` | `sha256:322792cd…709c` | `sha256:05d3cbb5…6c1d` |
| candidate basis `manifestDigest` | `sha256:abc60f8b7bb1254cff3d2e6bebd830130ccbacbdbc5c2ce5ecf08286d5ddae41` | `sha256:dbea26ee2b44bc852231b070b72f23de46abab478484ce901d8ea168b354de90` | `sha256:1bd4cff36b41d639d91756a1f7b8f8ad87da2074aa1305220f71cf6e96986218` | `sha256:34f60e6c9fd405d108163131a90978bc50297e48d1b5a45debe57f8300cc4a21` |

The manifest:
- Commit `9a6ff864e`: 70 leaf values changed, the TD-36 shape (49 row `provenanceRef`s, 10 `publicationBindings` digests, the identity refs and digests above). `publicContractCatalog` unchanged.
- Commit `0ff92bb14`: 140 leaf values changed: the same 70, plus the catalog digest (twice), 47 `declarationInventory` digests of `worksite_effect.d.ts` and 21 Public contract `contractDigest`s (`abg.contract.abg.c-call-root`, `…environment-admission`, `…execution-basis-root`, `…invocation-root-admission`, `…m03`, `…open-call-root`, `…replay-root`, `…requirements`, `…transport`, `abg.contract.app.m04`, `abg.contract.gtl.m01`, `…materialization-root`, `…root-declaration`, `…validation-root`, `abg.contract.hog.graph-function-catalog`, `…judgment-transition-root`, `…traversal-root`, `abg.contract.product.implementation-resolution-root`, `…invocation-root`, `…verification`, `abg.contract.qualification.m05`).
- Commit `33f5ded46`: 70 leaf values changed against `0ff92bb14`, the same TD-36 shape as `9a6ff864e` (49 `provenanceRef`s, 10 `publicationDigest`s, the identity refs and digests above). `publicContractCatalog` and every `declarationInventory` digest unchanged.

No other pin went red. `npm run test:r2` (the r1 and r2 files) passed 2 of 2 after each source commit, `33f5ded46` included. No byte pin on `worksite_effect.js`, `native_workspace_work.js`, `environment_admission.js`, `invocation.js` or `environment.js` exists; the C2 renderer pin (`product/worksite_command_execution.js`) is untouched.

Where the old catalog and contract values are named:
- Tracked (`git grep` over the whole tree at the base, sparse or not): the old catalog digest only in the regenerated manifest and graph and in `TD-36_RETURN.md` (narrative); the 21 old contract digests only in the regenerated manifest.
- Evidence root: the 21 old contract digests in no file. The old catalog digest (or the old `worksite_effect.d.ts` digest) in 140 files, all release evidence under `work/T287_RELEASE_RESUMPTION_01/rc8-…` to `rc12-…` (the catalog has had this digest since RC8). No lane reads any of them through `evidenceInput`. The one lane that names one of those directories (`t287-selected-action-authority`, "retained catalog and view authority…") reads an explicitly selected subject (`ABI5_SELECTED_ACTION_OWNER_SUBJECT`, unset; a native run regenerates it); its two other lanes, and the four lanes of `t287-native-assessment-evidence`, read the tracked `t287-current-owner` fixtures and pass after the change.

## 5. Deviations

- **Item 5 changed** under the Executive's second ruling, which replaced the first (section 1.5). The constructor also refuses a padded `workspaceId`, `authorityBasisId`, `productSetId` or `lockId`; the Public path cannot produce one (the workspace id must equal the manifest's generated reference; the other three are owner-minted identities), so this is the invariant's completion, not a further tightening of a reachable value.
- **Item 6 moves the Public contract catalog** (section 4). The first part kept the delegate for this reason; the ruling deletes it.
- **Throw becomes refusal** in `exactImplementationSet` on a body member that is `undefined` (the canonical writer throws on it; `admitJson` refuses it). The callers return their existing refusals: `subject_outside_territory` (effect authorization) and `authorization_mismatch` (file-parents authorization).
- **`isExactDirectGrant` widened** to a `Pick` of the three fields it reads, so the file-replace request can pass its coordinates. `@internal`; no declaration change.

## 6. Residual risks and residuals

- **Item 5 closed at the door.** The Public bind now refuses a padded or NUL actor or root with `root_mismatch` (section 1.5); before, it admitted the binding and every consumer then refused it. The Public request schema (`absolutePathSchema`) and `isWorkspaceAuthorityBasis` still accept such strings; by the ruling they stay, because `canonicalRoot` and `authorityManifestRef` are not binding fields and the binding fields are refused at the constructor.
- **F_H continuation check not observed.** V8 coverage reached the actor process check (`t287-management-supervision`) and workspace status (`t287-w2-05-install-catalog-owner-chain`), but `abg/continuation.js:622` (`admitFhInteractionOpen`, called from `admitOwnedFhInteractionHold`, whose one caller is `hog/interaction_lifecycle.ts:160` `holdOwnedInteraction`) ran 0 times in `t287-exact-construction-intent`, `t287-multi-candidate-admission`, `m5-event-calculus-runtime` (18 pass, 1 skip) and `t287-event-calculus-owner-continuation` (1 skip). Its binding is `productBasis.workspaceBinding`, the admitted value; the single-address-space F_H lanes that run pass.
- **Same weakness, out of scope:** in `worksite_effect.ts`, `exactExecutionBasis` (`:479`) and `exactCCall` digest raw bodies, as do the identity checks of subjects, territories, observations, authorizations and receipts in that file. Each is one owner today, so none is a copy.
- **Not this package:** `implementation/worksite_command_helper.ts:122` (TD-37).
- **Unverified lanes:** the skips in section 3 are environment gates with no recorded value here; this package changes no gate.
- **Qualification inventory:** member digests move again (five source files, the manifest, the capability graph, the candidate basis, and now the catalog). As at TD-35 and TD-36, the refresh is a cut-level step.
- `lint:evidence` was not run: its input is outside the sparse checkout.

## Executive completion (2026-11-12)

The Executive merged the branch at `52afade26` and removed the worktree before
the Writer's last edit to this Return. The Writer's hand-back adds three points
that the text above does not carry:

- The recorded-history walk also rescanned files that contain U+FEFF with
  JavaScript trim semantics: 0 values fail. In the sparse checkout 0 of 3
  candidates fail (Python trim only).
- The Public code `root_mismatch` for the bind-door refusal is read from the
  mapping in `bindRefusalCode`; the lane exercises the bind port, which returns
  `invalid_declared_root`.
- On the `33f5ded46` build the Writer reran 23 files and `test:r2`; all pass,
  and the skips are unset environment gates.

Executive rerun on `main` after the merge, on the tree that also holds TD-47:
the three new files 13/13, `t292-workspace-binding-extra-key` 3/3,
`t292-binding-row-owner-differential` 5/5, `r1`, `r2`, `r3` and
`t287-continuation-causation` pass, with no tracked change.
