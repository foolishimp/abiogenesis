# TD-37a Return: one owner for worksite path confinement

Writer: Claude Opus 5.5. Branch `claude/td37a-path-confinement` from `main` at
`52afade26`, worktree `/private/tmp/abg-td37a` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.

**Status: census committed; owner and site changes not yet made.**

## 1. Census

Line numbers are at `52afade26`. `relation` is `relative(root, candidate)`.
Forms: *prefix* is outside when `relation.startsWith("..")`; *segment-exact*
is outside when `relation` is absolute, `..`, or begins with `..` and a
separator, spelled `"../"` (`/`) or `` `..${sep}` `` (sep). "Root" says how the
site treats `relation === ""`: for confinement whether the root passes, for
exclusion whether the root counts as inside. A changed cell is always a
relation whose first segment begins with two dots and is not `..`
(`inside_dotted`).

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
| O2 | `validator/self_conformance.ts:185` | confinement: catalog source in the package root | admitted | prefix, no `isAbsolute` | `pathConfined` | none on POSIX; prefix form kept, outside the worksite domain |
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

## 2. Owner

To be completed.

## 3. Sites before and after

To be completed.

## 4. Lanes

To be completed.

## 5. Recorded history

To be completed.

## 6. Identity digests

To be completed.

## 7. Deviations

To be completed.

## 8. Needs a ruling; residuals

To be completed.
