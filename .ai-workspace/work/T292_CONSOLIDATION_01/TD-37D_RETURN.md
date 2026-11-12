# TD-37d Return: one worksite leaf-authority gate

Writer: Claude Opus 5.5. Branch `claude/td37d-leaf-authority-gate` from local
`main` at `42eabe9e8`, worktree `/private/tmp/abg-td37d` (sparse). Change
class: realization_refactor. No push, no tag. T =
`build_tenants/abiogenesis/typescript`; paths below are under `T/code/src`
unless they say otherwise. Line numbers marked "base" are at `42eabe9e8`;
unmarked line numbers are at the source commit `9b46cea9c`.

**Status: complete, for review, with three findings for the register.** One
internal function, `openWorksiteLeafGate` in
`implementation/leaf_execution_authority.ts`, computes the worksite
leaf-authority gate. The leaf port's `hasExactWorksiteLeafExecutionAuthority`,
`realizeWorksiteFileReplace` and `realizeWorksiteFileParents` call it; their
three copies are deleted. The function returns three steps (coordinates,
current, remaining), and each site calls them in its own order, so every
check keeps its place relative to the awaits and effects around it. Over
5,454 scratch inputs (10,908 runs per build) every outcome and every thrown
error is equal on the base and final builds, and on the real C0 runtime the
new lane gives byte-identical outcomes for 11 probes and the valid call on
both builds, with no event appended by any probe. All 489 base `.d.ts` files
are byte-identical, the owner file's included. The 25 existing lane files
keep their counts and the new lane passes on both builds. 431 source lines
go and 341 come in: net 90 fewer. The row validator is already one owner
(TD-36, `3a32adb4a`); nothing changes there. The answer to ruling 8 is No
(section 7). The register findings are in section 5. Nothing needs a
ruling.

## 1. The owner and what each site takes

`openWorksiteLeafGate` (`implementation/leaf_execution_authority.ts:269-459`,
`@internal` on all three overload signatures) takes the authority, the
occurrence, the resolution, the input digest, the effect (`file_replace` or
`file_parents`) with its request, optional precomputed digests, and either
`port` (the row, its owner, the graph function and the port's set) or
`realizer` (the graph function ref, binding ref and descriptor the realizer
is published under). It returns:

| Step | Lines | What it does | Result |
| --- | --- | --- | --- |
| `coordinates()` | `:289-312` | Comparisons that need no read: request and resolution digests, raw input digest and hash, effect URI and handler, the 7 occurrence fields, call class and regime; for a realizer, the selected row against its descriptor | boolean |
| `current(planCheck?)` | `:313-401` | Reads the owned prefix with `requireCurrent: true` (only this read is caught, as `null`), then the port's or the realizer's currentness checks | port: `true` or `null`; realizer: the hold (basis, set, protected install roots, conservation roots) or `null` |
| `remaining()` | `:402-457` | The remaining comparisons between authority, basis, request, call and row | boolean |

| Site | File and line | Takes | Order of calls |
| --- | --- | --- | --- |
| Leaf port `hasExactWorksiteLeafExecutionAuthority` (non-native branch) | `implementation/leaf_invocation_port.ts:1148-1156` | `port` coordinates; `validateWorksiteFileParentsPlanAtPrefix` as the plan check | `current(planCheck) !== null && coordinates() && remaining()` |
| `realizeWorksiteFileReplace` | `implementation/worksite_file_replace.ts:256-270` | `realizer` identity; both digests taken before the gate | `current()` inside try (throw → `null`), then `coordinates()`, then `remaining()`; the hold supplies basis, set and both root lists |
| `realizeWorksiteFileParents` | `implementation/worksite_file_replace.ts:438-451` | `realizer` identity; the plan check from its dynamic import | `coordinates()` before the await; `current(planCheck)` inside the try after the await; its own authorization comparison (F4) in place of `remaining()` |

The native branch of the port (`leaf_invocation_port.ts:1157-1185`) is not
part of the gate and keeps its own prefix read and checks.

No new edge appears in `npm run lint:imports`. The owner gains value imports
of `shared/value`, `abg/invocation_admission`, `abg/c_call`,
`abg/event_calculus`, `abg/environment_admission` and `abg/event_prefix`
(it already imported `abg/execution_basis` and `product/worksite_effect`), and
type-only imports that leave no module request. The two sites, which import
the owner, already imported all six. The two sites keep
`import {} from` lines for modules they no longer use, at their original
positions, so the module evaluation order stays the same: a simulator of the
ESM evaluation order over the built modules gives the same order for all 284
entry modules on both builds. An `import {}` line keeps the JavaScript module
request and leaves no trace in the `.d.ts`; a bare `import "x"` would have
changed three `.d.ts` files.

## 2. Census

Each table lists one base copy's checks in its own order. "Step" is the owner
step that now holds the check; "dropped" marks a check implied by another
(section 3). When a check fails, the port returns false and the owner boundary
records a closed F_D owner receipt: failure `implementation_exception`, stage
`authority_verification`, reason `refused`; a throw inside the check is
recorded with reason `thrown` and its cause. A realizer returns `null`, which
the boundary records as `malformed_return` at `implementation_invocation`; a
throw outside a realizer's try leaves the realizer and is recorded as
`implementation_invocation` `thrown`.

### 2.1 Leaf port, base `implementation/leaf_invocation_port.ts:1135-1321`

| # | Base line | Check | On failure | Step |
| --- | --- | --- | --- | --- |
| P0 | 1143-1149 | Request is replace, parents or native; `isLeafExecutionAuthority` | false | stays at the site |
| P1 | 1150-1151 | Row has an implementation owner; graph function resolves in the catalog | false | stays at the site |
| P2 | 1153-1167 | Owned prefix read with `requireCurrent: true`, runtime prefix selected (try) | false | current |
| P3 | 1188-1194 | `sha256Canonical` of resolution, request and carrier resolution (eager) | throw recorded | coordinates (resolution, request); carrier dropped |
| P4 | 1195-1207 | Authorization built (`constructWorksiteFileParentsAuthorization` or `constructWorksiteEffectAuthorization`) from the authority's values (eager) | throw recorded | current |
| P5 | 1208-1211 | Phase projection (eager) | throw recorded | current |
| P6 | 1212-1215 | Selected input current: parents plan check, or `isWorksiteFileReplaceRequest(input) && worksiteSelectedOccurrenceInputCurrent(...)` (eager) | throw recorded | current (the repeated request predicate is dropped) |
| P7 | 1217-1227 | Authorization kind; phase `selected_no_evidence`; observation; basis admitted at prefix; set admitted at prefix | false | current |
| P8 | 1228-1232 | Request digest equals input digest and basis raw input digest; raw input hashes to it | false | coordinates |
| P9 | 1233-1235 | Actor equals binding's authorized actor and basis actor | false | remaining |
| P10 | 1236-1239 | Binding identity and digest equal the basis's | false | remaining (port only) |
| P11 | 1240-1246 | Program ref and digest, graph function ref and digest equal the basis's | false | remaining |
| P12 | 1247-1250 | Catalog graph function: name, canonical hash, effect list includes the effect URI | false | remaining (port only) |
| P13 | 1251-1263 | Request binding identity and digest; grant actor, ref, digest, scope ref, scope digest | false | remaining |
| P14 | 1264-1273 | The 7 occurrence fields; call class `leaf`; regime `F_D` | false | coordinates |
| P15 | 1274-1278 | Call basis, graph function ref, set ref equal the authority's | false | remaining |
| P16 | 1279-1287 | Call requirement key, binding ref, implementation ref, 4 contracts equal the row's | false | remaining |
| P17 | 1288-1295 | Set ref, digest and canonical value equal the port's set | false | remaining (port only) |
| P18 | 1296 | Carrier resolution digest equals resolution digest | false | dropped |
| P19 | 1297 | Authority's resolution digest equals resolution digest | false | coordinates |
| P20 | 1298-1299 | Resolution ref formed from the digest | false | remaining (port only; formed from the authority's digest, equal once P19 holds) |
| P21 | 1300-1317 | Candidate ref and digest, binding ref and digest, implementation ref, owner ref against the row; owner product, publication digest, package name and version, declaration kind and ref | false | remaining (port only) |
| P22 | 1318-1320 | Effect URI, handler ref, handler digest | false | coordinates |

### 2.2 `realizeWorksiteFileReplace`, base `implementation/worksite_file_replace.ts:255-453`

| # | Base line | Check | On failure | Step |
| --- | --- | --- | --- | --- |
| R0 | 262-265 | `isLeafExecutionAuthority`; `isWorksiteFileReplaceRequest` | null | stays at the site |
| R1 | 267-270 | `sha256Canonical` of request and resolution (eager, outside the try) | throw leaves the realizer | stays at the site, passed as `digests` |
| R2 | 281-371 | In the try, every read made before any decision: prefix read and select; basis and set rehydrated; environment projected; basis and set equal the authority's; phase; selected input current; root walk (cycle gives no root); program owner, graph owners, implementation owners; root invocation; grant count, grant equality, member key; root program ref, digest and invocation admission ref; environment binding and authority basis | null (a throw in the try gives null) | current |
| R3 | 377-453 | One conjunction: the held values above; input digest ×3; resolution digest; 7 occurrence fields; call class; regime; call basis, graph function, set ref; call program locus, requirement key, binding, implementation, 4 contracts against the selected row; graph function ref against the C0 constant and the selected row; graph function digest against the selected row; program and graph function against the basis; set ref and digest against the basis; binding ref and implementation ref against constants (authority and selected row); selected row against the descriptor (digest, package, version, module path, symbol, regime, 4 contracts); request binding ×2; grant ×5; actor ×2; binding identity and digest; effect URI and handler | null | coordinates, remaining; the authority's binding and implementation refs against constants and the binding identity and digest are dropped |

After the gate: the conservation inventory (await), the authorization
(refusal gives a failure candidate), then `replaceWorksiteFile`. These are
unchanged.

### 2.3 `realizeWorksiteFileParents`, base `implementation/worksite_file_replace.ts:613-687`

| # | Base line | Check | On failure | Step |
| --- | --- | --- | --- | --- |
| F0 | 620-631 | `isLeafExecutionAuthority`; `isWorksiteFileParentsRequest`; request digest ×3; resolution digest; effect URI and handler; 7 occurrence fields; call class; regime; graph function ref against the constant | null; a hash throw leaves the realizer | entry stays at the site; the rest is coordinates |
| F1 | 633-640 | Selected row against the descriptor: implementation ref, binding ref, package, version, module path, symbol, descriptor digest, regime, 4 contracts | null | coordinates (realizer identity) |
| F2 | 644-681 | In the try, each failing check returns at once: await the `abg/semantic_job.js` import; prefix read and select; basis, set, environment; 4 equalities; phase; plan check; root walk (cycle gives null); root program ref, digest, invocation admission ref; root invocation; program owner, implementation owners, graph owners; grant count, grant equality, member key | null (a throw in the try gives null) | current |
| F3 | 682-687 | F4: the file-parents authorization built from the held basis and set; its kind; every field it shares with the authority equal to the authority's; candidate ref and digest equal the selected row's | null | stays at the site |

Then `createWorksiteFileParents`, unchanged.

### 2.4 Row validators

The brief names a row validator in `implementation/leaf_execution_authority.ts`
(about `:57-150`) and another in `product/worksite_effect.ts` (about
`:610-698`). At `42eabe9e8` there is one: `isExactAdmittedImplementationRow`
in `abg/execution_basis.ts:1299`, made the single owner by TD-36
(`3a32adb4a`). `leaf_execution_authority.ts:151` and `worksite_effect.ts:562`
both call it. There is nothing to prove equal or to merge, and no code
changes here. `product/worksite_effect.ts` does not hold it; moving it there
would change a file under `abg/`, which ruling 9 excludes.

## 3. Differences between the copies and how each is kept

| # | Difference | Kept by |
| --- | --- | --- |
| D1 | Order of reads and comparisons. The port reads first and builds the authorization before it compares, so a read that throws is the recorded cause even when a coordinate also fails. The file-replace realizer hashes first, then makes every read, then compares. The file-parents realizer compares first, awaits its import, then reads and stops at the first failing read | Three steps; each site calls them in its base order (section 1) |
| D2 | Every read versus stop at the first failure. The reads have side effects worth keeping: rehydration registers values in a WeakSet, basis row facts are memoized, work counters count | `current` makes every realizer read for file replace and returns at each failing read for file parents (the `parents` flag) |
| D3 | The root invocation read: file parents reads it before the owner installs, file replace after | `readInvocation` called before or after the owners by the `parents` flag (`:369-386`) |
| D4 | Port-only checks: catalog graph function (P12), port set (P17), resolution ref (P20), row and owner coordinates (P21), binding against basis (P10) | `port` parameter in `remaining` |
| D5 | Port currentness uses `hasAdmitted*AtPrefix` and the authorization's kind; realizers rehydrate the basis and set and compare them with `canonicalEquals`, project the environment, walk to the root and derive owners | Port and realizer branches of `current` |
| D6 | Realizer-only checks: the selected row against the descriptor and the graph function ref against a constant (coordinates); environment, root, owners, invocation and grant (current); program locus and graph function against the selected row and set against the basis (remaining) | `realizer` parameter |
| D7 | The file-parents realizer has no `remaining` step; its F4 comparison stands in for it | The file-parents site does not call `remaining`; F4 stays at the site unchanged. What F4 does not cover is finding 1 (section 5) |
| D8 | The root's invocation admission ref is compared with the held basis's in file parents and with the authority's basis in file replace | One comparison with the authority's basis: file parents has already required the held basis to equal the authority's basis canonically, so both values are the same string |
| D9 | The port's file-replace observation repeats `isWorksiteFileReplaceRequest(input)` | Dropped: a pure predicate already true at P0. This is the only change to the order of calls the differential records (section 4) |

Checks dropped because another check implies them:

| Site | Dropped check (base line) | Implied by |
| --- | --- | --- |
| Port | Carrier resolution digest equals resolution digest (1296) | `isLeafExecutionAuthority` requires the authority's resolution digest to equal the carrier's hash (`leaf_execution_authority.ts:178`), and P19 compares that digest with the resolution's |
| Port | Resolution ref formed from the resolution digest (1298-1299) | Now formed from the authority's digest; equal once P19 holds |
| Port | Repeated replace-request predicate (1214) | P0 |
| File replace | Authority's binding ref and implementation ref against constants (421-425) | `isLeafExecutionAuthority` ties them to the selected row (`:188`, `:192`), and coordinates compares the selected row's with the realizer identity |
| File replace | Binding id and digest against the authority's identity and digest (448-449) | `isLeafExecutionAuthority` (`:118-119`) |

None of the comparisons in `coordinates` or `remaining` can throw at the port,
which is why their order relative to each other is free: the request
predicates admit only values that can be hashed, the resolution is an admitted
row already hashed by `exactAdmittedResolution`, the authority body was hashed
by `isLeafExecutionAuthority`, and the graph function comes from the admitted
catalog. Every read that can throw stays first at the port.

## 4. Differential

**A. Scratch harness, all three sites.** `/private/tmp/abg-td37d-work/diff/a.mjs`
takes the three gate functions verbatim from the built JavaScript of each
build (base: the port function and both realizers; final: the same and
`openWorksiteLeafGate`) and runs them over one environment: the real pure
helpers and constants, and a recording stub for every read and every effect.
Each input is a fixture with one coordinate altered and a configuration of
what the reads return or throw.

- Coordinates: 264 for file replace and 271 for file parents, covering every
  field of the authority, its basis, call, set and selected row, the request,
  the occurrence, the resolution and the input digest.
- Read configurations: 52 on the valid fixture (prefix and select throw, which
  is how a stale prefix appears; basis and set null, different or throwing;
  environment refused, wrong binding, wrong authority basis or throwing; phase
  null, wrong (`evidence_admitted`) or throwing; observation and plan check
  false or throwing, which is how a changed selected input appears;
  `hasAdmitted*` false or throwing; authorization refused or throwing at the
  port and at the realizer, one field different, candidate different; root
  null, throwing, cyclic, wrong program ref or digest, wrong invocation ref,
  deeper; invocation null, throwing, two grants, none, different grant,
  different variant; program owner null or throwing; other graph owner, two
  graph owners, other implementation package; owner or graph function null;
  import throwing; inventory throwing).
- Each altered coordinate also runs under 10 configurations that include each
  read that can throw at the port, so a throw and a failing comparison meet.

Result: 5,454 inputs, each through its port and its realizer, 10,908 runs per
build. Outcomes equal on every input; thrown errors (constructor and message)
equal on every input. 590 inputs per effect are refused at entry by both
builds. The ordered call logs are equal except on 1,474 port inputs, where
the base calls `isWorksiteFileReplaceRequest(request)` a second time inside
its observation check (D9). The rerun on the final build after the after-lanes
gives the same figures.

| Effect | Site | Admitted | Refused | Thrown | Refused at entry |
| --- | --- | --- | --- | --- | --- |
| file replace | port | 97 | 980 | 1,025 | 590 |
| file replace | realizer | 402 | 1,699 | 1 | 590 |
| file parents | port | 97 | 1,015 | 1,060 | 590 |
| file parents | realizer | 543 | 1,628 | 1 | 590 |

Coordinates that cannot be altered alone, and why:

- The selected row's fields, the authority's resolution digest and ref, and
  the resolution passed in. `isLeafExecutionAuthority` binds the selected row
  to the resolution digest and ref and to one row of the set, and coordinates
  step 4 binds the resolution passed in to that digest. Altering one alone
  refuses at entry. They are also altered together with a re-seal, with and
  without the matching set row.
- `workspaceBinding.bindingId` with `workspaceBindingIdentity`, and
  `bindingDigest` with `workspaceBindingDigest`: `isLeafExecutionAuthority`
  requires them equal. Altered as pairs.
- The authority's `implementationBindingRef` with the selected row's, and
  `implementationRef` with the selected row's: same reason. Altered as pairs.
- Every authority field is otherwise altered alone and re-sealed, so the seal
  itself never decides.

**B. Real C0 runtime, the new lane.**
`T/test_env/tests/t292-td37d-leaf-authority-gate.test.mjs` installs the C0
Product from the packed artifact, runs one real file-replace traversal, and
intercepts the leaf call. Before delegating, it runs the port and both
realizers on 9 altered calls: input digest, occurrence attempt, occurrence
frame, call regime (`F_P`, re-sealed), effect handler (file-parents triple,
re-sealed), a call carrier missing one identity member (`stageRole`), the same
with a wrong input digest, capability grant ref, and a changed selected input
(request, digest and basis raw input agree with each other but not with the
selected occurrence). After the valid call closes it runs 2 more: the
retained call (stale prefix) and an authority re-sealed at the current prefix
(wrong phase).

| Probe | Port | File replace | File parents |
| --- | --- | --- | --- |
| 7 refused probes before the call and the 2 after it | `authority_verification`, `refused`, no cause | null | null |
| Identity member missing (alone and with a wrong input digest) | `authority_verification`, `thrown`, `TypeError: Cannot convert undefined or null to object` | null | null |
| Valid call | closes; file written; events `c_call_opened`, `c_call_fibre_selected`, `c_call_evidenced`, `c_call_result_admitted`, `c_call_judged` | | |

No probe appends an event or writes the file. The lane passes on both builds
(1/1/0/0) and its 12 diagnostic lines are byte-identical between the base run
and the after run. The identity-member probes are the case D1 keeps: with a
missing member the port's authorization read throws, and on the base the
throw is recorded even when a coordinate also fails; a body that compared
first would record `refused`. The file-parents realizer has no real-runtime
path to a valid authority without a live provider, so its admitted outcomes
come from harness A.

## 5. Findings for the register

These are differences the brief says not to repair. Each is present at
`42eabe9e8` and unchanged here.

1. **The file-parents realizer does not compare the authority's graph
   function digest with the selected row's.** The file-replace realizer does
   (base `worksite_file_replace.ts:411`, now `remaining`). F4 covers every
   other check in `remaining`: actor, program, graph function and set against
   the basis through the authorization's construction and its shared fields;
   the grant scope through `isWorksiteFileParentsRequest`; and the call's row
   coordinates through `selectedImplementation` plus the candidate digest,
   which is the digest of the row body (`abg/execution_basis.ts:1346-1359`),
   so the row F4 selects has the selected row's body. The graph function
   digest of that row is never compared with the authority's. The set's
   admission binds row digests to the graph function
   (`abg/execution_basis.ts:703` for a child basis, `:1925` for the root
   resolution set), so the site relies on admission for it. This is a missing
   check at an effect site.
2. **Neither realizer repeats the port's catalog checks.** The graph
   function's name, canonical hash and effect list (P12), the port set's
   equality with the authority's (P17) and the owner's declaration coordinate
   (P21) are checked only by the port. The realizers check related facts
   another way (owner installs from the environment, the set rehydrated at the
   prefix), not these. Through the port they hold before the realizer loads; a
   direct call of an exported realizer does not check them.
3. **The native workspace realizer runs no currentness gate.**
   `realizeNativeWorkspaceWork` (`implementation/native_workspace_work.ts:27-57`)
   checks `isLeafExecutionAuthority`, `nativeWorkspaceWorkAuthorityMatches`,
   the environment at the authority's prefix (not read with
   `requireCurrent`), the write roots and a fresh worksite observation. It
   does not re-read the prefix as current, check the phase, check the basis
   and set at the prefix, or compare the occurrence and input digest. Only the
   port's native branch checks those, before the F_P preparation and dispatch.
   This is outside the three sites of TD-37d.

## 6. The dynamic import (ruling 7)

The `await import("../abg/semantic_job.js")` in `realizeWorksiteFileParents`
stays (`worksite_file_replace.ts:446-447`). `abg/semantic_job.ts` imports
`implementation/worksite_file_replace.js`, so a static import back would make
a direct cycle. The owner does not import `abg/semantic_job.js` either for the
same reason: the port and the file-parents realizer pass
`validateWorksiteFileParentsPlanAtPrefix` into `current`, and the owner takes
only its type.

## 7. Ruling 8: does every worksite realizer run the gate after the port's check on every path?

**No.** By reading, with no code change:

| Path | Port check | Realizer gate after it |
| --- | --- | --- |
| File replace, F_D: `invoke` → `invokeLeafOwnerBoundary` → `verifyAuthority` → `loadImplementation` (await) → `realizeWorksiteFileReplace` → inventory (await) → authorization → `replaceWorksiteFile` | Full gate (`leaf_invocation_port.ts:1148-1156`) | Yes, full realizer gate before the first await (`worksite_file_replace.ts:256-268`), but without the port-only checks (finding 2) |
| File parents, F_D: the same to `realizeWorksiteFileParents` → coordinates → import (await) → current → F4 → `createWorksiteFileParents` | Full gate | Yes, without `remaining`; F4 covers it except the graph function digest (finding 1) and the port-only checks (finding 2) |
| Native workspace work, F_P: `verifyAuthority` (native branch, `leaf_invocation_port.ts:1157-1185`) → worker contracts → `loadImplementation` → `realizeNativeWorkspaceWork` (prepare) → dispatch | Native branch: grant, authority match, graph function, phase, basis and set at the prefix, resolution digest, occurrence | No (finding 3) |
| Direct call of an exported realizer (`implementation/index.ts:43`, `:104`) | None | The realizer gate is the only check |
| Command execution and revision (`implementation/worksite_command_execution.ts:490`, `:741`) | `hasExactWorksiteCommandLeafSourceAtDurablePrefix` | Not this gate: the occurrence must be authority-free (`:102-122`); the realizer re-checks the protected worksite observations and its manifests |

The port's check also decides recorded values the realizer would not record
even where both refuse. A port refusal is an owner receipt at
`authority_verification` with reason `refused` or `thrown` and its cause, and
no module is loaded. A realizer's `null` is recorded as `malformed_return` at
`implementation_invocation`, after loading, and a throw inside a realizer's
try is lost. So removing the port's check would change the recorded failure
for every refused worksite call, besides losing the checks in findings 2 and 3.

## 8. Lanes before and after

One file at a time, from T, with the brief's command. "Before" is the base
build at `42eabe9e8`; "after" is the final build. Tests / pass / fail / skip.

| Lane | Before | After |
| --- | --- | --- |
| `t292-td37a-worksite-subject` | 16/16/0/0 | 16/16/0/0 |
| `t292-td37c-tree-walker` | 3/3/0/0 | 3/3/0/0 |
| `t287-generic-job-worksite` | 9/9/0/0 | 9/9/0/0 |
| `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 |
| `t287-post-binding-worksite-write` | 2/2/0/0 | 2/2/0/0 |
| `t287-worksite-construction` | 3/3/0/0 | 3/3/0/0 |
| `t287-worksite-branch-construction` | 2/2/0/0 | 2/2/0/0 |
| `t292-binding-row-owner-differential` | 5/5/0/0 | 5/5/0/0 |
| `t292-td36r-remaining-owners` | 6/6/0/0 | 6/6/0/0 |
| `t287-generic-job-read-dependency` | 1/1/0/0 | 1/1/0/0 |
| `t287-generic-job-revision` | 2/1/0/1 | 2/1/0/1 |
| `t287-live-worksite-construction` | 1/0/0/1 | 1/0/0/1 |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 |
| `t287-held-owner-fold-reuse` | 1/1/0/0 | 1/1/0/0 |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 |
| `t287-native-work-currentness-consumers` | 6/6/0/0 | 6/6/0/0 |
| `d2-binding-transition` | 10/10/0/0 | 10/10/0/0 |
| `t287-worksite-command-execution` | 13/13/0/0 | 13/13/0/0 |
| `t287-observed-worksite-command` | 8/8/0/0 | 8/8/0/0 |
| `t287-c0-post-publication-failure` | 16/16/0/0 | 16/16/0/0 |
| `t287-c0-post-publication-failure-owner-admission-close` | 15/15/0/0 | 15/15/0/0 |
| `t287-registered-graph-selection` | 1/1/0/0 | 1/1/0/0 |
| `t287-recursive-registered-selection` | 7/7/0/0 | 7/7/0/0 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 |
| `t292-td37d-leaf-authority-gate` (new) | 1/1/0/0 on the base build | 1/1/0/0 |
| 25 existing files, total | 214/210/0/4 | 214/210/0/4 |

Every existing file keeps its counts. The four skips are the same live cases
on both builds, each gated by an environment variable that is not set
(`ABI5_GENERIC_JOB_CORRECTION_NATIVE`, `ABI5_T287_C1_LIVE`,
`ABI5_GENERIC_JOB_FULL_NATIVE`, `ABI5_DEFAULT_LIBRARY_LIVE`). No case timed
out, so none needed a rerun. The after runs are in
`/private/tmp/abg-td37d-work/lanes/after/`.

## 9. Declarations, build and lints

All 489 base `.d.ts` files are byte-identical in the final build, the owner
file's included: every new declaration is `@internal` and stripped. `npm run
build` passes on the final source, and `npm run lint:imports` (3 forbidden
owner pairs hold), `npm run lint:lifecycle` (284 modules, 7 on the allow
list, no offender) and `npm run lint:calculus` (no offender) pass on the
source commit `9b46cea9c`.

## 10. Identity after the final build

Generated files are restored to their `42eabe9e8` bytes before each commit;
none is committed. "Base" is the committed file at `42eabe9e8`.

| Identity | Base `42eabe9e8` | Final build |
| --- | --- | --- |
| `productContentDigest` | `sha256:80bb4526ac254ac1fed7e6e6ecfa8c1721b150dd972a1824665756b5a0edda05` | `sha256:edef8747979ab9dfdd02413d96aae15b51bf3179d19636528072adb48b50071b` |
| `contributionManifestDigest` | `sha256:56f814122447e1897599e92666a38c7730676aa74efd681a0081d922484fb666` | `sha256:b0223866520bfae42a51898e5d8ccbef4c12d5e3447bc69aac2c835de513edbf` |
| `publicContractCatalog.catalogDigest` | `sha256:f478d2a141b186475288c313e862ddfd924bb9b83158bf6b7e0d0db8bb0a5ae2` | unchanged |
| capability graph `graphDigest` | `sha256:7202df5a3c7bb6ab640b792a286c3f4eba2e0c5a5aa5487af84ad05b32e14dc3` | `sha256:1b1763defa534e68dde71315c5d6ccdb010fc75f465f505f11769c1c307576a8` |
| Product-relative locators | 5,308 | 5,308 |
| `product-toolchain-manifest.json` sha256 | `034b0abe24d7f477cb8b45b97dcebed8003c97a6744dcb692871036d09675ed3` | `71b98d6de1abdd5a92f882517a0e88caf147fdd619e2f7ab8a140ed51454523e` |
| `contracts/capabilities/capability-definition-graph.json` sha256 | `6548389a0bc84e41a69fd3d16d26769c7d2a0721bb38eb68d8b4f8c0cbd04f06` | `b1647ec9b7101ceb8832ee175bc46cb21407d385572df548019530339a310ee4` |
| `contracts/worksite/command-execution-context.inventory.json` sha256 | `9e61bdf4adf1b0489d814a579cad555272c37fe4d84efe5cd9f1f686ba886ed1` | unchanged |
| `test_env/fixtures/abi5-root-candidate-basis.json` sha256 | `1b802004769ad8330211fe7ddfaab4ddf15bbeb9b6782be956325ba2ff29b944` | unchanged |

The product content digest moves because three built modules change.

## 11. Size, deviations, residuals

`git diff --numstat 42eabe9e8 HEAD -- build_tenants/abiogenesis/typescript/code/src`
after the source commit:

| File | Added | Deleted |
| --- | --- | --- |
| `implementation/leaf_execution_authority.ts` | 276 | 1 |
| `implementation/leaf_invocation_port.ts` | 33 | 168 |
| `implementation/worksite_file_replace.ts` | 32 | 262 |
| Total | 341 | 431 |

431 lines go, against the brief's estimate of about 250; 341 come in, net
90 fewer. The owner's 276 added lines are 17 import lines, 42 comment lines,
44 lines of internal types and overload signatures, 166 lines of the
function body (the three steps and the two parameters that keep each site's
behaviour, D1 to D8) and 7 blank lines.

Deviations:

1. **Commit trailers.** The Writer is Opus 5.5; both commits carry the
   trailers the brief names (`Co-Authored-By: Claude Fable 5.2` and the
   `Claude-Session` line).
2. **Ruling 6 has nothing to do.** One row validator already exists (section
   2.4); `product/worksite_effect.ts` does not hold it and is not made to.
3. **The comment "Pre-effect currentness stays explicit; the owned reader
   borrows only the active owner and authenticates any other coordinate
   cold" moves with the prefix read into the owner (`:317-318`).** The port's
   native branch keeps its read without it.

Residuals:

- The three register findings in section 5.
- The file-parents realizer could call `remaining` and drop F4's shared-field
  comparison, or keep F4 and add the graph function digest; either is a
  behaviour change for a later package, not this one.
