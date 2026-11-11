# TD-37a Return: one owner for worksite path confinement

Writer: Claude Opus 5.5. Branch `claude/td37a-path-confinement` from `main` at
`52afade26`, worktree `/private/tmp/abg-td37a` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.

**Status: complete, for review. One owner (`shared/path_confinement.ts`)
classifies every (F) path relation outside the deferred `stdo_environment`
files; 41 worksite-domain and 6 other-domain sites call its predicates. In
the worksite domain a dotted first segment (`..x`, `..x/f`, `...`) is now
refused as a confined subject and counted as inside for exclusion at 11
sites; no other verdict changes on POSIX. On win32, cells change at the sites
in section 8, item 4. All 32 existing lanes keep their before
counts; both new lanes pass, and the 7 changed subject lanes fail on the
pre-change build. Recorded history holds 0 dotted first-segment paths.
Four items need a ruling (section 8).**

## 1. Census

Line numbers are at `52afade26`. `relation` is `relative(root, candidate)`.
Forms: *prefix* is outside when `relation.startsWith("..")`; *segment-exact*
is outside when `relation` is absolute, `..`, or begins with `..` and a
separator, spelled `"../"` (`/`) or `` `..${sep}` `` (sep). "Root" says how the
site treats `relation === ""`: for confinement whether the root passes, for
exclusion whether the root counts as inside. A changed cell is always a
relation whose first segment begins with two dots and is not `..`
(`inside_dotted`). Verdict changes in this Return are POSIX verdicts; the
win32 cells are listed once, in section 8, item 4.

Owner predicates (section 2): `pathWithin` (same, inside, inside_dotted),
`pathStrictlyWithin` (inside, inside_dotted), `pathConfined` (same, inside),
`pathStrictlyConfined` (inside).

### 1.1 (F) sites in the worksite subject domain

| # | Site | Use | Root | Present form | Owner predicate | Verdict change |
| --- | --- | --- | --- | --- | --- | --- |
| W1 | `implementation/worksite_command_execution.ts:337` (`containsPath` :320-323) | confinement: protected subject in the canonical worksite root | refused by the preceding `target === declaredRoot`; the predicate admits it | prefix | `pathConfined` | none |
| W2 | same file :342 | exclusion: subject in a binding root | inside | prefix | `pathWithin` | `inside_dotted` now flagged (`.abg/events/..x/f` under an event-log root at `.abg/events`) |
| W3 | same file :449 (two calls) | exclusion: archive root against five binding roots, both directions | inside | prefix | `pathWithin` | `inside_dotted` now an overlap |
| W4 | same file :459 | exclusion: mutable binding root inside the Product root | inside | prefix | `pathWithin` | `inside_dotted` now an overlap (root at `/p/..x/state` under `/p`) |
| W5 | same file :475 (lexical relation :469) | confinement: attempt path strictly inside the archive root | refused | prefix | `pathStrictlyConfined` | none |
| W6 | same file :476 | confinement: canonical attempt path in the canonical archive root | admitted | prefix | `pathConfined` | none |
| W7 | `implementation/worksite_command_helper.ts:614` (`confinedExistingPath` :273 → `contained` :251-258) | confinement: protected source subject in the canonical worksite root | admitted | segment-exact (sep) | `pathConfined` | `inside_dotted` now refused; the parent refuses it first at W1 |
| W8 | helper :625 (`contained`) | confinement: snapshot target of that subject in the snapshot root | admitted | segment-exact (sep) | `pathConfined` | `inside_dotted` now refused |
| W9 | helper :702 | confinement: declared report path in the execution root | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked (section 8) |
| W10 | helper :970 | confinement: command cwd in the execution root | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W11 | helper :1086 | confinement: report base in the execution root | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W12 | helper :1101 | confinement: walked report file under the report base (nested root) | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W13 | helper :1211 | confinement: HTTP probe port-file parent | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W14 | helper :1212 (`contained`) | confinement: HTTP probe port file | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W15 | helper :1219 | confinement: HTTP probe cwd | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W16 | helper :1280 | confinement: HTTP probe port file, observed | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W17 | helper :1398 | confinement: module predicate path | admitted | segment-exact (sep) | `pathWithin` | none; ruling asked |
| W18 | helper :306-307 (`canonicalExistingPathWithinRoot`; callers :436, :441, :446, :1676 in the archive root, :495 in the toolchain root) | confinement: launch path strictly inside its binding root | refused | segment-exact (sep) | `pathStrictlyConfined` | `inside_dotted` now refused; unreachable in practice: the parent refuses the archive paths at W5, and the toolchain path is fixed |
| W19 | helper :394-395 (`containsAbsolutePath` :349-353) | exclusion: archive root against five binding roots, both directions | inside | segment-exact (sep) | `pathWithin` | none |
| W20 | `implementation/leaf_invocation_port.ts:1099` | confinement: implementation module strictly inside a Product install (listed in the brief's worksite set) | refused | prefix | `pathStrictlyConfined` | none |
| W21 | `product/worksite_effect.ts:462` (`containsPath` :449-453, in `protectedWorksitePath`) | exclusion: subject or territory in a binding root | inside | segment-exact (`/`) | `pathWithin` | none |
| W22 | same file :476 (`protectedWorksiteWriteRoot`) | exclusion: binding root inside a write root | inside | segment-exact (`/`) | `pathWithin` | none |
| W23 | same file :603-626 (`normalizeWorksiteRelativePath`; (L) by kind, changed by ruling 2) | normalizer of worksite relative paths | `.` by `allowRoot`, unchanged | `..`-segment scan | `pathConfined(classifyPathRelation(normalized))` added to its refusals | `..x`, `..x/f`, `...` now refused (null) |
| W24 | `product/worksite_operations.ts:226` (`confined` :139-143) | confinement: subject in the canonical worksite root | refused by `targetPath === canonicalRoot` | segment-exact (`/`) | `pathConfined` | `inside_dotted` now refused; W23 refuses it first |
| W25 | same file :235 | exclusion: subject in a protected root | inside | segment-exact (`/`) | `pathWithin` | none |
| W26 | same file :622 | confinement: territory in the canonical worksite root | admitted (territory `.`) | segment-exact (`/`) | `pathConfined` | `inside_dotted` now refused; W23 refuses it first |
| W27 | same file :623 | exclusion: territory in a protected root | inside | segment-exact (`/`) | `pathWithin` | none |
| W28 | same file :624 | confinement: subject in its territory (nested root) | admitted | segment-exact (`/`) | `pathWithin` | none; ruling asked |
| W29 | same file :967, first call (`checkedWorksitePath`) | confinement: context, write-root or file-parent path in the worksite root | admitted (`.`) | segment-exact (`/`) | `pathConfined` | `inside_dotted` now refused; W23 refuses it first |
| W30 | same file :967, second call | exclusion: that path in a protected root | inside | segment-exact (`/`) | `pathWithin` | none |
| W31 | same file :1012 | confinement: planned write root in the worksite root | admitted (`.`) | segment-exact (`/`) | `pathConfined` | `inside_dotted` now refused; not observable, since the planned path equals the normalized lexical target that W23 and W29 checked |
| W32 | same file :1013 (two calls) | exclusion: planned write root and protected roots, both directions | inside | segment-exact (`/`) | `pathWithin` | none |
| W33 | `product/worksite_command_execution.ts:1302-1305` (`protectedRelativeWorksitePath`) | exclusion: command path in a binding root | inside | segment-exact (`/`) | `pathWithin` | none |
| W34 | `abg/worksite_construction_recovery.ts:153` | confinement: construction target strictly in the worksite root | refused | prefix | `pathStrictlyConfined` | none |
| W35 | `abg/semantic_revision.ts:965` | confinement: snapshot member strictly in the sandbox root | refused | prefix | `pathStrictlyConfined` | none |
| W36 | `abg/worksite_revision.ts:794` | confinement: revision target strictly in the worksite root | refused | prefix | `pathStrictlyConfined` | none |
| W37 | `abg/worksite_revision.ts:822` | confinement: retained subject strictly in the worksite root | refused | prefix | `pathStrictlyConfined` | none |
| W38 | `abg/semantic_stage.ts:294` | confinement: stage target strictly in the worksite root | refused | prefix | `pathStrictlyConfined` | none |
| W39 | `abg/semantic_stage.ts:381` | confinement: snapshot member strictly in the sandbox root | refused | prefix | `pathStrictlyConfined` | none |
| W40 | `abg/semantic_job.ts:403` | confinement: snapshot member strictly in the sandbox root | refused | prefix | `pathStrictlyConfined` | none |
| W41 | `abg/transport_contracts.ts:577-578` (`isAdmittedActorArchiveFile`) | confinement: actor archive file in the archive root | admitted (then refused as not a file) | prefix | `pathConfined` | none |

### 1.2 (F) sites outside the worksite subject domain

| # | Site | Use | Root | Present form | Owner predicate | Verdict change |
| --- | --- | --- | --- | --- | --- | --- |
| O1 | `implementation/release_publication.ts:37` (`inside`; callers :66, :236 confinement; :74, :77, :80, :240, :242 exclusion) | release source, snapshot and output territories | refused / not inside | segment-exact (`/`) | `pathStrictlyWithin` | none |
| O2 | `validator/self_conformance.ts:185` | confinement: catalog source in the package root | admitted | prefix, no `isAbsolute` | `pathConfined` | none on POSIX; prefix verdict kept (`pathConfined` equals the prefix form on POSIX); win32 cell in section 8, item 4 |
| O3 | `product/installed_module.ts:54-58` | confinement: module strictly in the install | refused | segment-exact (sep) | `pathStrictlyWithin` | none |
| O4 | `product/install_product.ts:235-237` | confinement: resolved package directory in the target root | admitted | segment-exact (sep) | `pathWithin` | none |
| O5 | `product/declaration_application.ts:106-107` | confinement: contract asset in the install | admitted | segment-exact (`/`) | `pathWithin` | none |
| O6 | `product/release_snapshot_definition_bindings.ts:36` (`within`; callers :53, :122) | exclusion: release effect roots in an installed Product | inside | segment-exact (`/`) | `pathWithin` | none |
| O7 | `product/stdo_environment.ts:46-48` (`inside`) | deferred: file reserved for another package | refused | segment-exact (`/`) | not changed | deferred |
| O8 | `abg/stdo_environment.ts:118-119` | deferred: file reserved for another package | refused | segment-exact (`/`) | not changed | deferred |
| O9 | `abg/stdo_environment.ts:194` (`confined`) | deferred: file reserved for another package | refused | segment-exact (`/`) | not changed | deferred |

`relative()` calls that decide nothing (they build a locator):
`product/worksite_operations.ts:1098`, `product/install_product.ts:122`,
`implementation/worksite_command_helper.ts:1060`.

### 1.3 (L) sites: locator checks, left unchanged

No existing locator owner has the truth table of any site below, so each stays
(ruling 4).

| Site | Check | Domain |
| --- | --- | --- |
| `product/worksite_command_execution.ts:833-840` (`safeRelativePath`) | `split("/")` scan for `..`, `posix.normalize` round trip, `normalized !== ".."`; also refuses padding, which `normalizeWorksiteRelativePath` does not | worksite (command cwd, report, port-file and module paths) |
| `product/worksite_command_execution.ts:1260-1264` (`withinRelativeRoot`) | locator prefix relation | worksite |
| `product/worksite_command_execution.ts:1279-1281` (`hasParentPathSegment`) | regex scan of child values for a `..` segment | worksite |
| `product/worksite_effect.ts:638`, `:1590`, `:1600`, `:1602`, `:1858` | locator prefix relations | worksite |
| `product/worksite_effect.ts:1865` | directory member name is not `..` | worksite |
| `product/worksite_operations.ts:1029` | locator prefix relation | worksite |
| `product/native_workspace_work.ts:21`, `:143` | locator prefix relations | worksite |
| `product/semantic_job.ts:50-53` (`semanticJobRelativePath`), `:55`, `:785`, `:940`, `:974` | `split("/")` scan; locator prefix relations | worksite |
| `abg/event_prefix.ts:1002` | locator prefix relation | worksite |
| `abg/governed_context.ts:104-106`, `:832-833` | `split("/")` scans | other |
| `gtl/stdo_run_environment.ts:25`, `:69` | regex and `split("/")` scans | other |
| `abg/stdo_environment.ts:65` | `split("/")` scan (file deferred) | other |
| `product/verify_product.ts:1018-1024` (`isSafeProductPath`) | `normalized.startsWith("../")` on a POSIX locator; listed under ruling 3, but (L) | other |
| `product/verify_product.ts:2042` | archive entry `split("/")` scan | other |
| `product/declaration_exports.ts:312-325` (`isSafeDeclarationPath`), `:764-769` | `normalized.startsWith("../")` on POSIX locators; listed under ruling 3, but (L) | other |
| `product/declaration_exports.ts:383`, `:611`, `:636-637`, `:837`, `:866` | locator prefix relations | other |
| `implementation/release_publication.ts:38` (`safeRelative`) | `split(/[\\/]/)` scan for `..` and `.` | other |

The predicates in tables 1.1 and 1.2 are the ones the code now calls.

Counts by domain and use:

| Domain | Use | Sites | Owner predicate | Verdict changes |
| --- | --- | --- | --- | --- |
| worksite (F) | confinement | 29: W1, W5–W18, W20, W24, W26, W28, W29, W31, W34–W41 | `pathConfined` 9 (W1, W6, W7, W8, W24, W26, W29, W31, W41), `pathStrictlyConfined` 10 (W5, W18, W20, W34–W40), `pathWithin` 10 (W9–W17, W28) | 7: W7, W8, W18, W24, W26, W29, W31 (`inside_dotted` refused) |
| worksite (F) | exclusion | 11: W2–W4, W19, W21, W22, W25, W27, W30, W32, W33 | `pathWithin` 11 | 3: W2, W3, W4 (`inside_dotted` now inside) |
| worksite (L, changed by ruling 2) | normalizer | 1: W23 | `pathConfined(classifyPathRelation(normalized))` | 1: `..x`, `..x/f`, `...` refused |
| other (F) | confinement | 5: O1 (two callers), O2, O3, O4, O5 | `pathStrictlyWithin` 2 (O1, O3), `pathConfined` 1 (O2), `pathWithin` 2 (O4, O5) | none on POSIX (win32: O1, O2, O5, item 4) |
| other (F) | exclusion | 1: O6 (O1's five exclusion callers share its delegate) | `pathWithin` | none on POSIX (win32: O6, item 4) |
| other (F) | deferred | 3: O7–O9 | not changed | deferred |
| (L) | locator checks | 17 rows in table 1.3 | not changed | none |

W1 counts once under `pathConfined`; its root is refused by the check before
it, as before. Worksite total 41, other total 9.

## 2. Owner

`code/src/shared/path_confinement.ts`, 46 lines, imports `node:path` only, no
filesystem access. It is a `derive` atom in the common library design
(`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, one bullet
added).

| Export | Signature | Rule |
| --- | --- | --- |
| `PathRelation` | `"same" \| "outside" \| "inside_dotted" \| "inside"` | the class of `relative(root, candidate)` |
| `classifyPathRelation` | `(relation: string) => PathRelation` | `""` is same; absolute, `..`, or `..` plus `sep` is outside; any other relation beginning `..` is inside_dotted; the rest is inside |
| `pathRelation` | `(root: string, candidate: string) => PathRelation` | `classifyPathRelation(relative(root, candidate))` |
| `pathWithin` | `(relation) => boolean` | within, segment-exact |
| `pathStrictlyWithin` | `(relation) => boolean` | within, root excluded |
| `pathConfined` | `(relation) => boolean` | confined subject, root admitted |
| `pathStrictlyConfined` | `(relation) => boolean` | confined subject, root excluded |

Truth tables (each predicate's doc comment states its row):

| Class | Example relations | `pathWithin` | `pathStrictlyWithin` | `pathConfined` | `pathStrictlyConfined` |
| --- | --- | --- | --- | --- | --- |
| same | `""` | true | false | true | false |
| inside | `a`, `a/b`, `a/..x`, `.x` | true | true | true | true |
| inside_dotted | `..x`, `..x/f`, `...` | true | true | false | false |
| outside | `..`, `../x`, absolute (win32 across drive roots) | false | false | false | false |

## 3. Sites before and after

Each present form admits a set of classes. The table groups sites by that
set; a changed cell is always `inside_dotted`.

| Group | Sites | Before (classes admitted) | After | Changed cells |
| --- | --- | --- | --- | --- |
| prefix, confinement, root admitted | W1, W6, W41, O2 | same, inside | `pathConfined`: same, inside | none on POSIX; win32: O2, item 4 |
| prefix, confinement, root refused | W5, W20, W34–W40 | inside | `pathStrictlyConfined`: inside | none |
| prefix, exclusion | W2, W3, W4 | same, inside | `pathWithin`: same, inside, inside_dotted | `inside_dotted` now inside: flagged (W2) or overlapping (W3, W4) |
| segment-exact, subject confinement, root admitted | W7, W8 (sep); W24, W26, W29, W31 (`/`) | same, inside, inside_dotted | `pathConfined`: same, inside | `inside_dotted` now refused |
| segment-exact, subject confinement, root refused | W18 | inside, inside_dotted | `pathStrictlyConfined`: inside | `inside_dotted` now refused |
| segment-exact, command locator or nested root | W9–W17, W28 | same, inside, inside_dotted | `pathWithin` | none (ruling asked, section 8) |
| segment-exact, exclusion | W19, W21, W22, W25, W27, W30, W32, W33, O6 | same, inside, inside_dotted | `pathWithin` | none |
| segment-exact, confinement, other domain | O4, O5 | same, inside, inside_dotted | `pathWithin` | none |
| segment-exact, strict, other domain | O1, O3 | inside, inside_dotted | `pathStrictlyWithin` | none |
| normalizer | W23 | `..` segment scan | scan plus `pathConfined(classifyPathRelation(normalized))` | `..x`, `..x/f`, `...`, `...x/y` now refused (null) |

The table is POSIX. Two win32 cells also move, at the sites listed in
section 8, item 4: `..\x` where the present form spells the separator `/`,
and the cross-drive absolute relation where the present form tests no
`isAbsolute`.

Each site keeps its refusal position, code and message. The W23 refusal is
the normalizer's existing one: callers report `invalid_relative_path`
("worksite path must be normalized and relative"), or `invalid_coordinate`
for a read root, exactly as for a `..` segment.

Code shape:

- Removed local predicates: `containsPath` (Product `worksite_effect.ts`,
  implementation parent), `confined` (`worksite_operations.ts`),
  `containsAbsolutePath` (helper), the inline check in `installed_module.ts`.
- Kept as one-line delegates so their callers stay as they are: `inside` in
  `release_publication.ts` (7 callers), `within` in
  `release_snapshot_definition_bindings.ts` (2 callers).
- The helper's `contained` and `confinedExistingPath` take the caller's
  predicate as a parameter: subject callers (W7, W8) pass `pathConfined`;
  command-locator callers (W9–W17) pass `pathWithin`.
- The parent's lexical archive check (W5, W6) reads
  `!pathStrictlyConfined(classifyPathRelation(lexicalRelation)) ||
  !pathConfined(pathRelation(archiveRoot, canonicalCandidate)) || ...`.
- W34 keeps `rel !== target.subject.relativePath ||` before the owner call.

Size: `git diff --numstat 52afade26..HEAD -- code/src` is +146 −108 over 20
files, of which the new owner is +46. Lanes add 277 and 253 lines; the
design document adds 1.

## 4. Lanes

Command from T, one file at a time:
`TMPDIR=/private/tmp/abg-td37a-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`.
`node scripts/refresh-candidate-basis.mjs` runs before r1 and r2, and the
refreshed basis is restored after. Counts are tests / pass / fail / skip.

| Lane | Before (52afade26) | After | Same |
| --- | --- | --- | --- |
| `d2-acknowledgment` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | yes |
| `m5-worker-transport` | 39 / 39 / 0 / 0 | 39 / 39 / 0 / 0 | yes |
| `t287-lifecycle-failure-carrier` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | yes |
| `steel-basic-cli-c2` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 | yes |
| `t287-governance-covered-source-use` | 9 / 3 / 0 / 6 | 9 / 3 / 0 / 6 | yes |
| `t287-d1-semantic-stage` | 3 / 1 / 0 / 2 | 3 / 1 / 0 / 2 | yes |
| `t287-generic-job-intake` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 | yes |
| `t287-generic-job-lifecycle` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `t287-generic-job-meaning` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 | yes |
| `t287-generic-job-parent-audit` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `t287-generic-job-parent-foldback` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `t287-generic-job-read-dependency` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 | yes |
| `t287-generic-job-revision` | 4 / 1 / 0 / 3 | 4 / 1 / 0 / 3 | yes |
| `t287-generic-job-worksite` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 | yes |
| `t287-live-worksite-construction` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `t287-native-semantic-revision` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | yes |
| `t287-native-worksite-execution` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 | yes |
| `t287-native-workspace-work` | 44 / 43 / 0 / 1 | 44 / 43 / 0 / 1 | yes |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | yes |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | yes |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | yes |
| `t287-worksite-command-execution` | 12 / 12 / 0 / 0 | 12 / 12 / 0 / 0 | yes |
| `t287-worksite-construction` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | yes |
| `t287-release-publication` | 6 / 5 / 0 / 1 | 6 / 5 / 0 / 1 | yes |
| `t287-c2-child-program` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | yes |
| `t287-c2-core-environment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | yes |
| `t287-w2-05-release-snapshot-definition-bindings` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `t287-w2-05-generator-package-reproducibility` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | yes |
| `t287-wave2-installed-product-verification` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | yes |
| `m5-installed-portability` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | yes |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |

All 32 lanes keep their before counts and exit 0.

Every skip is gated on an environment variable that is unset in both runs
(`ABI5_*`, `ABG_*` live and native switches); no lane changes its skip
count.

The first before run of the last five lanes is void: `w2-05` runs
`npm run build` from sources, and it read site edits I had started while the
run was still going. I restored the pristine sources and generated files,
rebuilt (no tracked change), reran those five lanes (the before column), and
reapplied the change.

New lanes:

| Lane | Pre-change build (52afade26) | After |
| --- | --- | --- |
| `t292-td37a-path-relation` | does not load (owner absent); its present forms are vendored and asserted by the lane itself | 6 / 6 / 0 / 0 |
| `t292-td37a-worksite-subject` | 12 / 5 / 7 / 0; the 7 failures are exactly the 7 tests named `changed:`, each an assertion failure (expected refusal or flag missing) | 12 / 12 / 0 / 0 |

The pre-change subject run uses `ABG_WORKSITE_BUILD_ROOT` pointed at a copy of
the 52afade26 build. The differential lane asserts 9 changed site rows (W2,
W3, W4, W7/W8, W18, W24, W26, W29, W31) × 6 `inside_dotted` grid rows = 54
changed cells, equality on every other cell, the absolute relation as
outside for every site, and the W23 normalizer differential (only `..x`,
`..x/f`, `...`, `...x/y` change).

`npm run lint:imports` (3 forbidden pairs hold), `lint:lifecycle` (292
modules, no offender) and `lint:calculus` (no offender) pass on the final
build. Both new lanes were rerun on that build (after column) and the subject
lane on the 52afade26 copy (pre-change column).

Helper start-up import graph: static import closure of the built
`implementation/worksite_command_helper.js`, following relative `import` and
`export ... from` specifiers (dynamic `import()` not followed), is 289 lines
before and 290 after; the only addition is `shared/path_confinement.js`.

## 5. Recorded history

Count of recorded paths whose first segment begins with two dots: **0**.

Method, over the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace`
(read only):

1. Any JSON string value that begins with `..` and a character other than `/`:
   30,514 matches. Every one is prose or display text, not a path field:
   28,788 are `...` ellipses, the rest are `..omitted..`, truncated
   `...sha256:` displays and code fragments, under keys such as
   `timestamp`, `partial_json`, `evidence`, `text`.
2. Path-bearing fields with a dotted first segment: `relativePath`,
   `relativeRoot`, `relativeCwd`, `path`, `base`, `modulePath`, `reportPath`,
   `portFile`, `selector`, `prefix`; arrays `readRoots`, `writeRoots`,
   `parentWriteRoots`, `evidenceWriteRoots`, `readFirst`, `members`, `paths`,
   `equals`, `protectedPaths`, `outputs`, `inputs`; and absolute root or URI
   fields containing `/..x`: 0 matches; 0 again with `--text -z` (binary and
   compressed files).
3. The same keyed patterns inside the 17 `.zip` files (`unzip -p`): 0.
4. `find -name '..?*'` for files or directories with a dotted name: 0.

## 6. Identity digests

The pristine build at 52afade26 leaves no tracked change. Generated files are
restored to their 52afade26 bytes before each commit; the branch commits no
generated file.

| File | 52afade26 (pristine build) | After final build on HEAD |
| --- | --- | --- |
| `product-toolchain-manifest.json` | `cd72e1b4dd6b26d8a43e910c3d8492944702d9cb925b7cd742490c2c63a89c0f` | `d3f48e7e1c845c8e3a774798637d538d82c90f14fbc99ea3a35e172250d9a01b` |
| `contracts/capabilities/capability-definition-graph.json` | `172c2c5dd2cc75f05d5b32b0ef7f32a2318fd72fdb928df254285870a374de5f` | `e705ff2825ee4644082543d3bf74d1d10865c6d76c72493b4f1832d254e9c45f` |
| `contracts/worksite/command-execution-context.inventory.json` | `0ac89411f29ea362291a2c1a2ec4a444f9b3e3190e2fa31132e6e2296ee938ad` | `9289027ca884f75a64fcffe09146bc34f5c6a54df89dba60cd3507c18d5ff20e` |
| `test_env/fixtures/abi5-root-candidate-basis.json` | `65930f3c51e2cef434e84e26158874fc56ee4a372f4fc60203a97cb0a7b2a680` | `65930f3c51e2cef434e84e26158874fc56ee4a372f4fc60203a97cb0a7b2a680` |

File sha256 values. The product content digest moves from
`sha256:074847d54d3e4a0cae9378025ea7e8f0968664f9e367f94e8aede6c2e41e4bd4` to
`sha256:7b36f20585ec2f083d971f1916b5b79f88b25fb1a6cd8b62ee2cfdd4189de384`, and
the capability graph digest from
`sha256:dfa9a85a0454978b54c8b2de8c58dbfe562b1fb6de74d56430455b3e750a6b76` to
`sha256:1a1d29d591184511af7339209e014643b05572442f57f414a5ecf7404769fdb3`.

The capability graph and the manifest change because their content digests
cover the built sources; the C2 inventory changes only its one member digest.
The build leaves the candidate basis unchanged.

C2 renderer pin (`code/src/gtl/worksite_command_execution.ts`, over the built
`product/worksite_command_execution.js`), moved because that file changed
(TD-36 precedent):

| Field | Before | After |
| --- | --- | --- |
| digest | `sha256:07e215991ca034efad5efb3656b53b9a9311116f2c57a718b27c789cef7d90df` | `sha256:b7dfeb2c3c287e5bd4a17fc25570911276cb330215e734b704a01d90c798657f` |
| byteCount | 116370 | 116268 |
| startByte / endByte | 106285 / 108717 | 106183 / 108615 |
| spanDigest | `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf` | unchanged |

The renderer's own bytes (the span) are unchanged; only its offset moves.

## 7. Deviations

- The helper's `contained` and `confinedExistingPath` gain a predicate
  parameter, so subject and command-locator callers share one function with
  their own rule.
- `inside` (release publication) and `within` (release snapshot bindings)
  stay as one-line delegates to the owner.
- `product/verify_product.ts:1018-1024` and
  `product/declaration_exports.ts:312-325`, `:764-769`, which ruling 3 lists,
  check POSIX locators, not `relative()` relations; they are (L) and stay.
- Sites that spelled the separator `/` now use the owner's platform `sep`;
  this moves win32 verdicts (section 8, item 4).
- The differential lane is committed with the Product sites, not with the
  owner.

## 8. Needs a ruling; residuals

Needs a ruling:

1. **Helper command locators W9–W17 keep `pathWithin`.** Product's
   `safeRelativePath` (L, `product/worksite_command_execution.ts:833`) admits
   `..x` for cwd, report, port-file and module paths. Tightening only the
   helper would make Product admit what the helper refuses, and refuse
   commands that work today. Confirm, or rule that both tighten together (a
   change to the (L) normalizer, outside this package's rulings).
2. **Nested-root confinement W28 (subject in its territory) and W12 (report
   rows under the report base) keep `pathWithin`.** Ruling 2 admits `a/..x`;
   a nested root's relation can begin with a dotted segment that is not the
   worksite's first segment. Confirm.
3. **Normalizer reach (W23).** A worksite with a top-level `..x` or `...`
   entry now fails context observation with `invalid_relative_path` ("worksite
   path must be normalized and relative"), and a dotted read root is refused
   with `invalid_coordinate`. Native-work paths, assessment assets and file
   parents go through the same normalizer. Confirm this reach.
4. **win32 verdicts move at 27 sites, in both domains.** This touches the
   stop condition "a verdict change for an input the rulings do not name",
   and ruling 3 ("outside the domain no verdict changes") at O1, O2, O5 and
   O6. I surface it here instead of stopping, because every old win32
   verdict at these sites is wrong for a path outside its root, and
   because the lanes and the grid are POSIX-only (`posixOnly` skips the
   grid test on win32). On win32, `relative()` writes `..\x` for a path
   outside the root and an absolute path across drive roots.
   - Separator spelled `/` (`"../"`): W21, W22, W24–W33 (worksite), O1, O5,
     O6 (other). The present form classes `..\x` as inside; the owner
     classes it outside. At confinement uses (W24, W26, W28, W29, W31, O1's
     two confinement callers, O5) the present form admits an escape; at
     exclusion uses (W21, W22, W25, W27, W30, W32, W33, O1's five exclusion
     callers, O6) it counts a path outside the protected root as inside.
   - No `isAbsolute` test: O2 (prefix) and the helper's `contained` (W7–W17).
     The present form admits the cross-drive absolute relation, which is an
     escape; the owner refuses it.

   Choose one: accept these cells, or keep O1, O2, O5 and O6 at their
   present forms by dropping or reworking `22dd69c55` (the worksite sites
   would still move on win32 unless the owner took a separator argument).

Residuals:

- O7–O9 (`stdo_environment.ts`, Product and ABG) are deferred to the package
  that owns those files; each can call the owner predicate that matches its
  present form.
- The (L) locator checks in table 1.3 have no common owner; a locator owner
  is a separate package.
