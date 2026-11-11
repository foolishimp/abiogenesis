# TD-37b Return: one owner for the C2 launch identity

Writer: Claude Opus 5.5. Branch `claude/td37b-launch-identity` from `main` at
`f0e7cd739`, worktree `/private/tmp/abg-td37b` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.
Line numbers marked "base" are at `f0e7cd739`.

**Status: complete, for review. `product/worksite_command_launch.ts` owns the
launch identity of one C2 command attempt: the attempt reference, the
authority-free occurrence rule, and the launch-manifest type, body, digest and
reference. The parent and the helper import it; `abg/instruction_assembly.ts`
keeps its exported name as a one-line delegate to it. Every copy equals the
owner over the grids and over every recorded value that carries its inputs
(60 launch manifests, 131 occurrences, 76 of 119 attempt references; the
other 43 references have no recorded occurrence): 12 differential rules,
0 differences. The helper's ":122" is the shared trimmed-string
predicate, not a binding check, and is replaced by that predicate. The
helper's start-up closure grows by 1 module (253 → 254) and its median
start-up time moves by less than 2%. All 497 base `.d.ts` files are
byte-identical and the public contract catalog is unchanged. All 56 lane
files keep their before counts (515 / 466 / 1 / 48; the 1 is the known GC03
red), and the new lane passes on both builds. Net 59 source lines go. One
premise needs the Executive's reading (section 9); nothing blocks.**

## 1. The owner

`code/src/product/worksite_command_launch.ts` (125 lines). Its imports are
`shared/digests`, `shared/admission_predicates`, `product/contracts` and the
three import-free identity modules (`worksite_command_execution_identity`,
`worksite_revision_identity`, `worksite_command_forward_identity`). It imports
nothing from `abg/` and no module the helper did not already load except
itself.

| Export | Rule |
| --- | --- |
| `worksiteCommandExecutionAttemptRef(occurrence)` | `worksite-command-attempt://abiogenesis/<hex>` over `sha256Canonical` of the six coordinates |
| `isAuthorityFreeWorksiteCommandOccurrence(value)` (`@internal`) | exact eight keys; four nonblank ids; locus in the three command loci; `taskOrdinal` null or a safe integer ≥ 0; `attempt` a safe integer ≥ 1; `executionAuthority === null` |
| `constructWorksiteCommandExecutionLaunchManifest(input)` (`@internal`) | the body over the ten copied-through members, with `occurrenceDigest`, `attemptRef`, `attemptDigest`, the implementation pair chosen by the occurrence's locus and the package pair derived; then `launchManifestDigest = sha256Canonical(body)` and `launchManifestRef` over it |
| types `AuthorityFreeWorksiteCommandExecutionOccurrence`, `WorksiteCommandExecutionLaunchManifest` (`@internal`) | the two shapes |

Callers:

- **Parent** (`implementation/worksite_command_execution.ts`).
  `exactAuthorityFreeOccurrence` keeps its assembly-companion step and its
  I-JSON step and calls the owner's occurrence rule in between, with the same
  message ("command execution requires one exact authority-free C2
  occurrence"). `constructWorksiteCommandExecutionLaunchPlan` calls the owner's
  attempt reference for the helper plan and the owner's constructor for the
  manifest; it still writes `canonicalJson(manifest) + "\n"`.
- **Helper** (`implementation/worksite_command_helper.ts`).
  `isWorksiteCommandExecutionLaunchManifest` keeps the 21-key check, checks
  the occurrence with the owner's rule and the nine members the owner copies
  through (`exactString` for six paths and refs, `isSha256Digest` for two
  digests, the byte length as a safe integer ≥ 1), then requires the
  admitted value to equal the owner's manifest over those members
  (`canonicalEquals`). The members the owner derives (kind, schema version,
  the three digests, the two references, the implementation pair, the
  package pair) are checked by that equality alone. `admitLaunchManifest`
  and its messages are unchanged.
- **Assembly** (`abg/instruction_assembly.ts`). The exported
  `worksiteCommandExecutionAttemptRef` keeps its signature and docstring and
  returns the owner's value. `abg/index.ts` is untouched.

## 2. Copies, differentials and replacements

Grid differentials run every base copy, vendored verbatim from `f0e7cd739`
source and bound to the base build, beside the built owner and the changed
parent and helper code vendored from the worktree. Script:
`/private/tmp/abg-td37b-work/differential.mjs` (`after` mode adds the owner and
the changed code). Reports: `differential-base.json`,
`differential-after.json` in the same directory.

| Rule | Copies (base) | Grid | Result | Replaced by |
| --- | --- | --- | --- | --- |
| A. Attempt reference | helper `:150-162`; `abg/instruction_assembly.ts:127-135` (the parent calls this one at `implementation/worksite_command_execution.ts:179`) | 8,546 occurrences; helper source, assembly source and built `./abg` export | 0 differences; all three ignore extra keys (8,546/8,546) | owner `worksiteCommandExecutionAttemptRef`; assembly delegates to it |
| B. Occurrence rule | parent `:153-166` (in `exactAuthorityFreeOccurrence` `:140-171`); helper `:130-148` with `occurrenceIdentity` `:126-128` | 20,736 values | 0 differences; 4,546 admitted, 15,826 refused by the rule. 364 pass the rule and are refused by the parent's I-JSON step (lone surrogates); the helper's manifest admission (`admitIJsonText`, `admitJson`) refuses all 364. 3 inputs throw the parent's companion check first and 2 (null, undefined) throw on destructuring; all count as refusals in both | owner `isAuthorityFreeWorksiteCommandOccurrence` |
| B′. Occurrence id strings | helper `occurrenceIdentity` `:126-128`; parent inline `typeof === "string" && trim() !== ""` | 36,920 values | 0 differences against `shared/admission_predicates.ts` `isNonblankString` | `isNonblankString` inside the owner rule |
| C. Body and digest | parent `:179-213` (in the plan `:173-230`); helper `:199-230` (in `isWorksiteCommandExecutionLaunchManifest` `:164-233`) | 4,546 admitted occurrences, each through a task of its locus's arm | 0 differences in canonical bytes among parent, helper, owner and changed parent | owner `constructWorksiteCommandExecutionLaunchManifest` |
| C′. Parent manifest admitted | helper predicate, base and changed | 4,546 parent manifests | admitted 4,546/4,546 by both | — |
| C″. One-field changes | helper predicate, base and changed | 133,200 changes over all 21 members, raw and re-minted, with non-string values for every derived member | 0 verdict differences; 126,865 refused, 6,335 admitted by both (re-minted changes of a copied-through coordinate such as `taskRef` or a path, which `admitLaunchManifest` refuses later against the task and the filesystem) | — |
| D. Manifest type | parent `:103-125` (type alias); helper `:96-119` (interface) | type only | same 21 members; the helper typed the implementation pair as the command-execution literals, narrower than the values it admits; the parent and owner type them `string` | owner type |
| D′. Occurrence type | parent `:92-101`; helper `:85-94` | type only | identical | owner type |
| E. Helper `:121-124` (`nonempty`) | helper only | 36,920 values | 0 differences against `isTrimmedNonblankNulFreeString` (`shared/admission_predicates.ts:14`) | the shared predicate, imported as `exactString` |

### Recorded values

Search, under `/Users/jim/src/apps/abiogenesis/.ai-workspace`, read only:

- `rg -l -uuu -z` for the strings `worksite-command-attempt://abiogenesis/`,
  `worksite_command_execution_launch_manifest`,
  `worksite-command-launch-manifest://` and the three command `nodeRef`s:
  4,539 files, including gzip members.
- Every `.zip` and `.zst` under the root, read member by member (rg does not
  read them): 18 archives, plus 2 large files streamed in a second pass.
- 4,559 files, 6,646 units, 1,571,829 compressed members; 40 duplicate
  compressed archives skipped; 0 unreadable. Every JSON value is walked for
  launch manifests and C2 occurrences; every text line is scanned for the two
  reference forms.
- `test_env/fixtures` in the worktree holds none of these values.

| Recorded set | Found | Result |
| --- | --- | --- |
| Launch manifests | 60 distinct in 66 units; package versions rc.1–rc.6, rc.12 and dev.286 | At each manifest's recorded package version, the base parent, the base helper block and the owner reproduce its canonical bytes 60/60. `attemptRef`, `attemptDigest`, `occurrenceDigest`, archive path segments and the implementation pair by locus equal 60/60. The base and changed helper predicates admit 60/60 at the recorded version and give the same verdict 60/60 at the current version (1 admitted, the rc.12 one) |
| `launch.json` files | 62 | canonical bytes 62/62 |
| Launch-manifest references | 60 distinct, 69 mentions | each is the reference of one recorded manifest, reproduced through the byte equality above |
| C2 occurrences | 131 distinct | rule verdict equal 131/131 (61 admitted; 70 lack `executionAuthority` and are refused by every copy); attempt reference equal 131/131 |
| Attempt references | 119 distinct, 2,706 mentions | 76 reproduced from a recorded occurrence or manifest; 43 appear only in captured output (test logs, stdout, result records) with no recorded occurrence, so nothing could be compared for them |

## 3. The binding check (ruling 3)

The brief and TD-36's residual name helper `:122` as a copy of the
workspace-binding check. At `f0e7cd739` helper `:121-124` is `nonempty`, a
verbatim copy of `isTrimmedNonblankNulFreeString`, which is the string rule
`isExactWorkspaceBinding` applies to its members (`exactString`,
`product/environment.ts:1291`). The helper applies it to eight launch-manifest
strings, not to a binding. It admits nothing the shared predicate refuses
(rule E, 0 differences), so it is not stricter, and the helper now imports
the shared predicate.

The helper holds no other binding check. Its binding is admitted by the
owner on every task arm: `admitLaunchManifest` (base `:457`) requires
`isExecutableWorksiteCommandTask` (`product/worksite_command_forward.ts:167`),
and each arm reaches `exactWorkspaceAuthorityJoin`
(`product/environment.ts:1314`), which calls `isExactWorkspaceBinding`
(`:1319`):

| Arm | Site |
| --- | --- |
| C2 execution task | `isWorksiteCommandExecutionTask`, `product/worksite_command_execution.ts:1648`; constructor `:1552` |
| Native task | `nativeCommandTaskBody`, `:430` |
| Observed task | `constructObservedWorksiteCommandExecutionTask`, `:484` |
| Revision task | through `constructWorksiteCommandExecutionTask`, `:1552` |
| Forward task | `isWorksiteCommandForwardTask` (`product/worksite_command_forward.ts:163`) → forward request → `constructWorksiteSubject` (`product/worksite_effect.ts:647`) on `request.workspaceBinding`, once per protected observation (at least one) |

## 4. Helper start-up (ruling 4)

Method: `/private/tmp/abg-td37b-work/startup.mjs`. The static closure
follows relative `import`/`export … from` specifiers from the built helper.
The runtime closure is every `file:` URL the loader resolves while
`node worksite_command_helper.js` loads (no arguments: the graph loads,
then `main` refuses the missing `--task`). This counts differently from
TD-37a's "289 → 290 lines".

| | Before | After |
| --- | --- | --- |
| Static relative modules | 253 | 254 |
| Runtime build modules | 253 | 254 |
| Runtime package modules | 156 | 156 |
| Added | — | `product/worksite_command_launch.js` only |
| Median of 25 sequential runs | 334.2 ms (load 8.62 / 10.77 / 11.60) | 321.2 ms (load 7.16 / 10.38 / 12.57) |

Interleaved runs (`startup-ab.mjs`, base and after alternate which goes
first, 40 rounds each):

| Pair | Base median | After median | Change | Load (1-minute, start → end) |
| --- | --- | --- | --- | --- |
| base snapshot vs worktree build | 317.6 ms | 322.4 ms | +1.51% | 10.00 → 9.23 |
| base snapshot vs after snapshot, same layout | 322.2 ms | 321.5 ms | −0.23% | 9.23 → 8.70 |
| same, repeated | 324.6 ms | 325.6 ms | +0.33% | 8.70 → 8.18 |

The machine has 16 cores; another package's lanes ran throughout. The base
snapshot is a copy of the `f0e7cd739` build under
`/private/tmp/abg-td37b-work/base` with a `node_modules` link; the worktree
build sits in the tenant tree. The same-layout pair compares two copies laid
out the same way under the scratch directory, so it separates the code change
from any difference of location. An intermediate head of this
package (before the helper predicate was trimmed) measured +4.46% and
+3.64% against the worktree build and +1.04% and +0.34% same-layout under
load 11–15; the final figures above replace those. The bound (5 modules,
10%) holds.

## 5. Bytes, declarations and the C2 pin

- `product/worksite_command_execution.ts` is unchanged, and its built
  `.js` is byte-identical: sha256
  `b7dfeb2c3c287e5bd4a17fc25570911276cb330215e734b704a01d90c798657f`,
  116,268 bytes. The C2 renderer pin in `gtl/worksite_command_execution.ts`
  (`:37`, `:39`, `:61`: digest above, byteCount 116268, span 106183–108615,
  spanDigest `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf`)
  stays as it is; no repin.
- `contracts/worksite/command-execution-context.inventory.json` does not
  change (sha256 `9289027ca884f75a64fcffe09146bc34f5c6a54df89dba60cd3507c18d5ff20e`).
  The brief expected it to change in digests; it depends on the unchanged
  file above.
- All 497 base `.d.ts` files under `build/` are byte-identical (sha256 list
  before and after). One is added:
  `product/worksite_command_launch.d.ts` (the `@internal` members are
  stripped; it declares only the attempt reference). It is in no catalog
  row's declaration inventory.
- `publicContractCatalog` is identical, rows and digest
  (`sha256:9366decf0cfef0241bb5cac33b3df374d38a2a0892239ae8a0558e75c853aa8d`).

## 6. Lanes

Command from T, one file at a time:
`mkdir -p /private/tmp/abg-td37b-tmp && TMPDIR=/private/tmp/abg-td37b-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`.
Files: the brief's list plus every file under `test_env/tests` (excluding the
ignored output trees) that names the helper, `attemptRef`, the launch
manifest or `instruction_assembly`: 56 files. Counts are tests / pass / fail
/ skip.

| File | Before | After |
| --- | --- | --- |
| `t287-worksite-command-execution` | 12 / 12 / 0 / 0 | 12 / 12 / 0 / 0 |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-native-c2-instruction-assembly` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t288-instruction-assembly-owner` | 6 / 4 / 0 / 2 | 6 / 4 / 0 / 2 |
| `t287-native-assembly-retained-input` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `steel-basic-cli-c2` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `t287-c2-core-environment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t292-td37a-worksite-subject` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t292-td37a-path-relation` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `m5-worker-transport` | 39 / 39 / 0 / 0 | 39 / 39 / 0 / 0 |
| `t287-declared-testing-capability` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-governed-context` | 15 / 14 / 1 / 0 | 15 / 14 / 1 / 0 |
| `t287-lifecycle-failure-carrier` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-owned-process-lifetime` | 34 / 34 / 0 / 0 | 34 / 34 / 0 / 0 |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-d1-semantic-stage` | 3 / 1 / 0 / 2 | 3 / 1 / 0 / 2 |
| `t287-default-library-fulfillment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-event-body-encoding` | 26 / 25 / 0 / 1 | 26 / 25 / 0 / 1 |
| `t287-generic-job-revision` | 4 / 1 / 0 / 3 | 4 / 1 / 0 / 3 |
| `t287-management-context` | 14 / 12 / 0 / 2 | 14 / 12 / 0 / 2 |
| `t287-native-registered-selection` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-native-selection-profile-scope` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-native-workspace-work` | 44 / 43 / 0 / 1 | 44 / 43 / 0 / 1 |
| `t287-predecessor-context` | 3 / 0 / 0 / 3 | 3 / 0 / 0 / 3 |
| `t287-stdo-run-environment` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-native-semantic-job` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `d2-acknowledgment` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `forward-command-contracts` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `m5-event-calculus-runtime` | 19 / 18 / 0 / 1 | 19 / 18 / 0 / 1 |
| `m5-retry-lifecycle-authority` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-native-frame-observation` | 7 / 1 / 0 / 6 | 7 / 1 / 0 / 6 |
| `t287-qual056-material` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-retry-run-prefix` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-runtime-failure-diagnostic` | 21 / 21 / 0 / 0 | 21 / 21 / 0 / 0 |
| `d2-bounded-repair` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-generic-job-intake` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-generic-job-lifecycle` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-generic-job-read-dependency` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-generic-job-meaning` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-management-supervision` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-default-library` | 37 / 34 / 0 / 3 | 37 / 34 / 0 / 3 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `d2-binding-transition` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `d2-workflow-step` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-native-semantic-revision` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-native-work-currentness-consumers` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-native-work-reacquisition` | 10 / 7 / 0 / 3 | 10 / 7 / 0 / 3 |
| `t287-authenticated-owner-values` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-default-library-prerequisites` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library-reviews` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-qualification-fp-proof-delivery` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |

All 56 files give the same counts before and after: 515 tests, 466 pass,
1 fail, 48 skip on both builds. The one failure is the GC03 case of
`t287-governed-context`, a known red on `main`. No case timed out or was
cancelled, so no rerun was needed. The other two known reds
(`witness-reprice-definition-binding`, `t287-single-address-space-consolidation`)
are not in this set.

### New lane

`test_env/tests/t292-td37b-launch-identity.test.mjs`, 4 tests. It passes 4/4
on the `f0e7cd739` build (`ABG_WORKSITE_BUILD_ROOT` set to that build) and
4/4 on the final build.

1. The parent's manifest at each of the three command loci is admitted by
   the helper's re-admission. Its attempt reference equals the `./abg`
   export's; its digests and reference recompute from its body; its attempt
   root has the archive segments; its implementation pair is its locus's.
2. The parent's occurrence verdict equals the helper's on the manifest that
   carries the occurrence, over 18 variants and each missing key.
3. The helper refuses each of the 21 members changed once, raw, and a set of
   re-minted changes (implementation pair, package pair, schema version,
   byte length, padded `taskRef`, an execution authority).
4. Through the built helper process: the parent's manifest passes
   re-admission and stops at "helper task manifest does not retain one exact
   Product task" (the lane builds no task); a raw attempt change and a
   re-minted crossed implementation binding are refused with "helper
   received an invalid command-execution launch manifest"; a second trailing
   newline is refused with "helper launch manifest bytes or locus are not
   canonical".

### Checks

`npm run build`, `npm run lint:imports` (3 forbidden owner pairs hold),
`lint:lifecycle` (293 modules, no offender) and `lint:calculus` (no
offender) pass on the final source.

## 7. Identity after the final build

Generated files are restored to their `f0e7cd739` bytes before each commit;
none is committed.

| Identity | Base `f0e7cd739` | Final build |
| --- | --- | --- |
| `productContentDigest` | `sha256:d0b3dc8e6edf8f24de969a9cdea637175958c0589eb37007f76fbab17b8c6a05` | `sha256:fb215b359aa9cc01aa39976d8184622d73855d7ac7c8be0a076e814f5a962ed2` |
| `contributionManifestDigest` | `sha256:475946bc5eb72e0974895ec772a5c0b620a21f1d5160020c667bcf86becff122` | `sha256:ab6f97d76052cce1f96d783b241e7b6903b508e7b55db16bf1d58d06a8b472dd` |
| `publicContractCatalog.catalogDigest` | `sha256:9366decf0cfef0241bb5cac33b3df374d38a2a0892239ae8a0558e75c853aa8d` | unchanged |
| capability graph `graphDigest` | `sha256:1133544d6313db1f4b3f5509759f91a9a2bac29fba19a725a6322cb7676b15af` | `sha256:a18026483bbde1b22fce33f9b702e6d5c24944cad82677f7060d3908bb28b675` |
| `product-toolchain-manifest.json` sha256 | `cb346552a6cf05986672ccd4c8b7fd39fc1922150f8f68af27fe93d4c9d434f5` | `1e5dd6fd50b9e556977e6886be9d627bf5e273b2e9f522853a3b6f901878255d` |
| `contracts/capabilities/capability-definition-graph.json` sha256 | `df617a5ad9b2a2931f9059b621436974972936d84cad60812d92213feed32daf` | `69bd667d6f5b062ce3ce2e56ee098f288a68d8bccb54330a1a08eedff31620b6` |
| `contracts/worksite/command-execution-context.inventory.json` sha256 | `9289027ca884f75a64fcffe09146bc34f5c6a54df89dba60cd3507c18d5ff20e` | unchanged |
| `test_env/fixtures/abi5-root-candidate-basis.json` sha256 | `cc99d7b1cd3a2fdf1fea3976ad31821cfa561557fbe0cb250939476f737bd1ac` | unchanged |

`productContentDigest` digests every payload file, so any source change
moves it and the values that carry it.

## 8. Size

`git diff --numstat f0e7cd739 HEAD -- build_tenants/abiogenesis/typescript/code/src`
after the source commit:

| File | Added | Deleted |
| --- | --- | --- |
| `abg/instruction_assembly.ts` | 2 | 4 |
| `implementation/worksite_command_execution.ts` | 12 | 78 |
| `implementation/worksite_command_helper.ts` | 15 | 131 |
| `product/worksite_command_launch.ts` (new) | 125 | 0 |
| Total | 154 | 213 |

213 lines are deleted and 154 added: net 59 lines fewer. The three
existing files lose 184 lines net; the owner adds 125.

## 9. Deviations, residuals and the premise for the Executive

Premise (for the Executive's reading; not a stop). The brief and TD-36's
residual call helper `:122` a copy of the workspace-binding check. It is the
trimmed-string predicate applied to eight manifest strings (section 3). It
equals the shared predicate over the grid and is replaced by it. The
helper's binding is checked by `isExactWorkspaceBinding` on all five task
arms, so no binding copy remains in the helper. The register's TD-36
carry-forward line can close on that reading.

Deviations:

1. **Assembly keeps a delegate.** Ruling 1 says `abg/instruction_assembly.ts`
   imports the owner. A re-export
   (`export { worksiteCommandExecutionAttemptRef }`) changes
   `abg/instruction_assembly.d.ts`, which is in the declaration inventory of
   47 public contract rows, and adds the owner's `.d.ts` to their
   inventories, so the catalog digest moves (observed on an intermediate
   head with the re-export:
   `sha256:094c2d090d529572090bd01dc36e0f6fff2329f942f3f82383b9a34f9e9c5802`).
   Following TD-36's precedent for `exactWorkspaceBinding`, the exported
   function stays with the same signature and docstring and returns the
   owner's value. The rule has one owner; the name has one forwarding line.
2. **The context inventory and the C2 pin do not move** (section 5); the
   brief expected the inventory to change.
3. **The helper predicate checks derived members by equality only.** Kind,
   schema version, the three derived digests, the two references, the
   implementation pair and the package pair are no longer checked one by
   one before the owner comparison. The owner never reads them, so the
   constructor cannot throw on them, and equality with the owner's exact
   values implies every check that was dropped. Rule C″ covers these members
   with string and non-string values: 0 verdict differences.
4. **The parent's occurrence rule reads the snapshot.** The base parent
   checked key exactness on the destructured copy and the members on the
   live input; the owner rule reads the copy throughout. They differ only
   for an input with accessors that return different values on successive
   reads, which is outside the JSON domain the occurrence comes from.
5. **The helper's manifest type widens.** The helper typed the
   implementation pair as the command-execution literals while admitting the
   revision and forward values; the owner's type says `string`, as the
   parent's did. No runtime effect.
6. **Size.** The brief estimated about 110 lines. The net is 59 lines fewer
   (213 deleted, 154 added) because the owner carries the two types, their
   docs and a module comment (about 40 lines), the assembly keeps a
   three-line delegate, and the helper keeps its nine copied-member checks.

Residuals:

1. The assembly docstring still reads "One attempt identity calculation
   shared with the existing C2 helper owner." It is in the pinned
   declaration text, so changing it would move the catalog; it stays.
2. 43 of 119 recorded attempt references have no recorded occurrence or
   manifest; they could not be compared (section 2).
3. The tree walkers and the leaf-authority gate (TD-37's third part) are
   untouched.

## 10. Commits

| Commit | Content |
| --- | --- |
| `ad1a8784c` | TD-37b: one Product owner for the C2 launch identity (source) |
| `516f2c717` | TD-37b: lane for the unchanged launch identity contract |
| this commit | TD-37b Return |

Generated files (`contracts/`, `product-toolchain-manifest.json`,
`test_env/fixtures/abi5-root-candidate-basis.json`) are restored to their
`f0e7cd739` bytes before each commit. Scratch evidence (differential scripts
and reports, recorded-value collection, start-up measurements, lane TAP
files) is under `/private/tmp/abg-td37b-work/`.
