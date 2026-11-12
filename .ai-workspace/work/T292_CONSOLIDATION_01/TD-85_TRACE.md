# TD-85 trace: path spelling, the canonical-path checks and the protected roots

Analyst trace for T-292. Commentary, not specification or design. Built and run on a copy of `main` at `7102112b2`. `main` is now `7f4c4ef46`. Its two newer commits change no file under `code/`, `design/` or `specification/requirements/` (run: `git diff --stat 7102112b2 7f4c4ef46` over those paths is empty), so every file and line below holds at both commits. Paths without a prefix are under `build_tenants/abiogenesis/typescript/code/src/`.

## The answer

A subject in another letter case or normalization form was refused before any write at every effect site when the protected root it enters already exists (run), but when that root does not exist yet the subject creates the directory, or links a file, that the root then resolves to (run, driven directly), and a Public run can carry such a subject, because a Design's targets need only lie lexically inside the caller's write roots (read). The sites that write are file parents, file replace (refused only after the file is linked) and native work's write-root check for an absent root, and, for a binding root declared equal to, inside or as another spelling of another root, materialization and the actor transport, which have no overlap rule even in stored spelling (materialization driven directly, both reachable through Public operations by reading), and the command-execution parent's `task.json` and `launch.json` (driven directly; by reading not reachable through Public operations, because an earlier owner on the same binding refuses first). I recommend that every synchronous check refuse unless each existing component is spelled as stored (`realpathSync.native`, cheaper than today's call), that workspace binding refuse a declared root that is absent, not spelled as stored, or overlapping another root (the product root inside the toolchain root excepted), and that the worksite owners refuse while a protected root is absent; no case folding.

The refusals in the first sentence come from the asynchronous physical-spelling checks, not from the protected-root rule, which admits every variant (run).

## Terms

| Term | Meaning here |
|---|---|
| worksite, `A.canonicalRoot` | The directory declared effects may change: the canonical root of the workspace authority basis (`WorkspaceAuthorityBasis`). |
| subject | The worksite-relative path one effect acts on (`WorksiteSubject.relativePath`). |
| binding, binding roots | The `WorkspaceBinding`: the six declared roots `toolchainRoot`, `productRoot`, `eventLogRoot`, `runtimeStateRoot`, `projectionRoot`, `archiveRoot`. |
| protected roots | The six binding roots plus every admitted install root (`ProductInstall.installedRoot`), named `R_protected` in the design. |
| stored spelling | The name exactly as the directory holds it, as `readdir` and `realpathSync.native` return it. |
| variant spelling | A different string that this volume resolves to the same node: another letter case, or another Unicode normalization form. NFC is the composed form, NFD the decomposed form. Names below are written with code points because the two forms render alike. |
| JS realpath | `fs.realpathSync` and callback `fs.realpath`, implemented in JavaScript. They resolve symbolic links and keep the spelling they are given. |
| native realpath | `fs.realpathSync.native`, `fs.realpath.native` and `fs/promises` `realpath`. They return the stored spelling. |
| async owners | The physical owners in `product/worksite_operations.ts` (`resolveWorksiteTarget`, `inspectTargetPath`, `inspectPhysicalDirectory`, `worksiteReadRoots`, `checkWorksiteWriteRoots`, `observeWorksiteContext`). They use `fs/promises` `realpath`. |
| sync checks | Checks that use JS `realpathSync`, mostly in `abg/` and in the command-execution parent `implementation/worksite_command_execution.ts`. |
| absent root | A declared protected root whose directory does not exist yet. The lanes bind `.ai-workspace/runtime`, `projections` and `archive` this way. |
| cold coordinates | Effect inputs built directly with the Product constructors, in the way `test_env/support/t287-generic-job-worksite.mjs` and `test_env/fixtures/c2-component/input.mjs` build them, without a Public operation, a store or a model call. |
| C0 | One worksite file replace: observe the subject, authorize, publish the new bytes, observe again. |
| C1, C3 | Worksite construction and branch construction: a vector of C0 file replaces built from a Design's file targets. |
| C2 | Worksite command execution. A parent step checks the sources and writes a task manifest and a launch manifest under the archive root. A helper, launched by the Worker, copies the C1 or C3 outputs into a sandbox there and runs the declared commands. |
| O0, O1 | The observation of a subject before (O0) and after (O1) a C0. |

## What this volume does (run)

Node v24.7.0 on Darwin 25.6.0. The scratch directories sit on the default APFS volume, which ignores letter case and normalization form. Probe: `/private/tmp/abg-td85-work/probe/volume.mjs`.

| Action | Result |
|---|---|
| `mkdir Alpha`, then `mkdir alpha` | `EEXIST` |
| `writeFile alpha/FILE.TXT` with flag `wx` after `Alpha/file.txt` | `EEXIST` |
| `mkdir café` NFC (U+00E9), then NFD (U+0065 U+0301) | `EEXIST`; the reverse order also gives `EEXIST` |
| `readdirSync` | the stored names: `Alpha`, NFC `café`, NFD `résumé` |
| `lstatSync` of `alpha`, `ALPHA`, `ALPHA/FILE.TXT`, the other normalization form | the same inode as the stored name |
| `realpathSync` (JS) and callback `realpath` | the given spelling, including `/private/TMP/…` and `/PRIVATE/…` for the ancestors |
| `realpathSync.native`, `fs/promises` `realpath`, `fs.realpath.native` | the stored spelling of every component |

On a case-sensitive APFS image mounted under scratch (run, `probe/cs.mjs`), `alpha` after `Alpha` is a second directory and `ALPHA` is `ENOENT`. Creating NFD `café` after NFC `café` still gives `EEXIST`, and `realpathSync.native` still returns the stored NFC name. Case-sensitive APFS still ignores normalization form.

## 1. The checks

### 1a. JS-realpath checks: they compare the given spelling with itself (read)

Each compares `realpathSync(x)` with `x`. On this volume it therefore passes any variant spelling of an existing path (run for the command-execution parent and the revision gates below).

| File:line | What it guards | Write or read gate |
|---|---|---|
| `implementation/worksite_command_execution.ts:219` | `plannedCanonicalPath` (sync): binding roots for the subject and archive overlap checks | gates the parent's manifest writes |
| `…:246` | `assertCanonicalArchiveRoot`: archive root is one canonical directory | gates the manifest writes |
| `…:259` | worksite root before Worker dispatch | gates source reads |
| `…:275` | each component of a protected source subject | gates source reads |
| `…:369` | `assertExistingCanonicalNode`: attempt root and manifests | after the manifest writes |
| `abg/worksite_revision.ts:724`, `:731`, `:736` | `worksiteRevisionPhysicalMatches`: root, ancestors, file | read-only currentness gate |
| `abg/worksite_revision.ts:752`, `:759`, `:762` | `retainedWorksitePhysicalMatches`: root, ancestors, file | read-only currentness gate |
| `abg/semantic_stage.ts:292`, `:300`, `:305` | stage physical currentness: root, ancestors, target | read-only gate |
| `abg/semantic_stage.ts:379`, `:382` | snapshot root and paths | read-only gate |
| `abg/semantic_job.ts:219` | native context entry currentness | read-only gate |
| `abg/semantic_job.ts:401`, `:404` | snapshot locus root and paths | read-only gate |
| `abg/semantic_revision.ts:963`, `:966` | snapshot root and paths, revision | read-only gate |
| `abg/worksite_construction_recovery.ts:151`, `:157` | recovery currentness: root and paths | read-only gate |
| `abg/transport_contracts.ts:578` | an admitted actor archive file before it is read | read gate |
| `abg/runtime_liveness.ts:342` | a bound native asset's directory | read gate |
| `product/stdo_environment.ts:98`, `:102` | installed owner root and files for C2 Context | read gate |
| `product/tree_inventory.ts:88` | the realpath step of the synchronous tree walk | root check of the installed Product inventory |

That is 28 call sites in 10 files. TD-81 counted 27 checks; the planner at `:219` returns a path rather than comparing one.

### 1b. Native-realpath checks: they compare with the stored spelling (read)

All of them import `realpath` from `node:fs/promises` (`abg/worker_transport.ts:3`, `implementation/release_publication.ts:5`, `implementation/worksite_command_helper.ts:30`, `product/worksite_operations.ts`). Run: `fs/promises` `realpath` returns the stored spelling.

| File:line | What it guards |
|---|---|
| `product/worksite_operations.ts:167` | `plannedCanonicalPath` (async): every binding and install root, and planned write roots. It throws "workspace root is not physical-canonical" when the deepest existing ancestor is not spelled as stored. |
| `…:209` | `resolveWorksiteTarget`: `A.canonicalRoot` equals its stored spelling |
| `…:266` | `inspectTargetPath`: every existing component of the subject |
| `…:366` | `inspectPhysicalDirectory`: the commit parent and file-parents ancestors |
| `…:480` | `inspectStagingFile` |
| `…:1145`, `:1183` | context observation, before and after reading a file |
| `implementation/worksite_command_helper.ts:148`, `:167`, `:197`, `:206`, `:239`, `:378-379`, `:1356`, `:1368` | helper: directory roots, worksite source paths, the launch root within the archive, planned paths, the helper module, the artifact parent and the artifact |
| `product/stdo_environment.ts:38`, `:185`, `:186`, `:201` | run-environment dependency files, temporary root, archive root, symlink members |
| `product/tree_inventory.ts:98` | the realpath step of the asynchronous tree walk |
| `product/workspace_operations.ts:525`, `:589` | not a check: this is where `A.canonicalRoot` is made, at workspace create and open |
| `abg/worker_transport.ts:1013` | not a check: resolves the actor's working directory |
| `implementation/release_publication.ts:61`, `:67`, `:237` | release source and snapshot paths (not a worksite effect) |

`product/declaration_exports.ts:703-705` is a TypeScript compiler-host hook, not a path check.

### 1c. Protected-root and confinement predicates on real paths (read)

`shared/path_confinement.ts` is lexical (`relative`, segment comparison) and compares exact strings.

| File:line | Predicate | Spelling of the subject | Spelling of the roots |
|---|---|---|---|
| `product/worksite_effect.ts:450-459` (`protectedWorksitePath`), used at `:656` (subject), `:738` (territory), `:1622-1623` (file-parents targets and parents) | subject within a root | given | declared strings |
| `product/worksite_effect.ts:464-472` (`protectedWorksiteWriteRoot`), used at `product/worksite_operations.ts:1000` | either direction | given | declared strings |
| `product/worksite_operations.ts:221`, `:230` (`resolveWorksiteTarget`) | target within A; target within a root | given | stored spelling of the deepest existing ancestor, plus the declared remainder |
| `product/worksite_operations.ts:617-619` | territory checks | given | same as above |
| `product/worksite_operations.ts:962` (`checkedWorksitePath`) | path within A or a root | given | same as above |
| `product/worksite_operations.ts:1007-1009` | planned write root against the roots, both directions | stored spelling of the planned root | same as above |
| `implementation/worksite_command_execution.ts:263`, `:268` | source subject within A or a root | given | JS planner: declared spelling |
| `implementation/worksite_command_execution.ts:326`, `:336`, `:353` | archive root against the other roots; Product root; attempt paths | JS planner | JS planner |
| `implementation/worksite_command_helper.ts:269-270` | archive root against the other roots | async planner: stored | async planner: stored |
| `abg/transport_contracts.ts:578` | archive file within `archiveRoot` | given | declared |
| `product/semantic_job.ts:555`, `:781`; `product/native_workspace_work.ts:141-143` | Design targets and stage paths within the job's declared write roots | given | given |

The protected-root decision on an existing path is therefore taken twice. The lexical rule admits every variant. The physical owner then refuses the variant through `:266` or `:366`, because those require each existing component to be spelled as stored, not because the variant meets the protected-root comparison.

## 2. The protected roots (read; spellings run where marked)

`R_protected` = the six binding roots plus every admitted install root (C0 design, quoted in section 6).

| Root | Where its string comes from | Spelling it carries |
|---|---|---|
| `A.canonicalRoot` (not protected; the boundary) | workspace create and open: `realpath(targetRoot)` (`product/workspace_operations.ts:525`, `:589`) | stored. Run: `fs/promises` `realpath` returns the stored spelling. |
| six binding roots | the caller's `workspace.bind` request, `declaredRoots[].path` (`product/environment_operation_contracts.ts:427-445`) | as declared. Admission requires only `^(?:/\|[A-Za-z]:[\\/])` (`shared/public_function_contracts.ts:123-126`) and exact absolute strings (`product/environment.ts:1136-1157`). There is no realpath, no existence check and no disjointness check. |
| install roots | `join(request.targetRoot, "node_modules", …packageName)` (`product/install_product.ts:390-393`) | as the install target was given. `install_product.ts` calls no realpath. |

Recorded bindings (run, read-only over the 58 helper `task.json` files under `.ai-workspace/work/`, probe `probe/recorded-roots.mjs`): the toolchain and product roots lie outside the worksite in all 58. Event-log, runtime, projection and archive roots lie outside the worksite in 54 to 56 of the 58. Two tasks put `.ai-workspace/events`, `runtime`, `projections` and `archive` inside the worksite. Two put `archives`, `projections` and `runtime` inside it. The lanes' root fixture binds `.ai-workspace/*` roots inside the worksite and does not create them (`test_env/support/root-installed-environment.mjs:450-476`). The CLI steel lane does the same through Public `workspace.bind` (`test_env/tests/steel-basic-cli-public.test.mjs:545-551`).

## 3. Each effect site with a subject in another spelling

Every row was driven directly with cold coordinates, not through a Public operation. Probes: `probe/owners.mjs` with `probe/owners-lib.mjs` (C0 file replace, file parents, native write roots, context), `probe/absent-root.mjs`, `probe/absent-root-2.mjs`, `probe/q5.mjs` (case pairs and revision gates), `build_tenants/abiogenesis/typescript/td85-probe/c2.mjs` (command-execution parent and helper), `probe/materialize.mjs`, `probe/cs.mjs` (case-sensitive image). Each case has a fresh worksite. Its layout is `.abg/events` holding a log file, `.abg/<NFC café>` holding `state.json`, `.abg/<NFD résumé>`, and `src/`; the binding roots are those directories. File inventories before and after locate every write by inode.

### 3a. The table

| Site | (a) control `src/x.txt` | (b) `.abg/events/x.txt` stored | (c) `.ABG/events/x.txt`, `.abg/EVENTS/x.txt`, `.abg/EVENTS/runtime.events.jsonl` | (d) NFD form of the NFC-stored root, NFC form of the NFD-stored root | (e) equal to a root in another case or form | (f) outside through a variant of the root |
|---|---|---|---|---|---|---|
| File replace (C0) | committed, file written | subject refused `invalid_coordinate` (lexical, `worksite_effect.ts:656`) | subject admitted. O0 refused `aliased_subject` at the parent (`worksite_operations.ts:366`). Nothing written. | the same, `aliased_subject` | existing root `.abg/EVENTS` or NFD `café`: O0 refused `aliased_subject` (`:266`). **Absent root `.abg/PROJECTION`: O0 absent, the file is linked (`:786`), then refused `invalid_worksite_root` at `phase: post_publication` (`physicalOutcome: publication_only`); the file stays.** | `../WORKSITE/x.txt`: refused `invalid_relative_path`. `A.canonicalRoot` in another case: refused `aliased_subject` (`:209-215`). |
| File parents | created `src/new` | refused `subject_outside_territory` (`:962`) | refused `aliased_subject` (`:366`). **Absent root: `.abg/PROJECTION/x.txt` created `.abg/PROJECTION`; `.AI-WORKSPACE/events/runtime.events.jsonl` created `.AI-WORKSPACE` and `.AI-WORKSPACE/events` (the lanes' layout).** | `aliased_subject` | parent `.abg` exists; nothing created | `invalid_relative_path` |
| Construction and branch construction | each member is one C0 file replace (read: `implementation/worksite_construction.ts:251-265` builds the vector as data; `gtl/worksite_construction.ts:174`) | as C0 | as C0 | as C0 | as C0 | as C0 |
| Revision | writes go through C0 (read: `abg/semantic_revision.ts:451-455`, `:512-513`, `:766`; `gtl/worksite_c0.ts:268`). The gates `worksiteRevisionPhysicalMatches` and `retainedWorksitePhysicalMatches` return true. | the gates return true for the stored log file. They consult no protected root (read: `abg/worksite_revision.ts:721-770`). | gates true for `SRC/a.txt`, `src/A.TXT`, `.ABG/events/runtime.events.jsonl` | not driven | not driven | not driven |
| Command execution (C2): source subject, parent `realizeWorksiteCommandExecution` | Worker request built | parent refused "protected subject enters a WorkspaceBinding protected root" (`implementation/worksite_command_execution.ts:268`) | **parent admitted and read the protected log file** (`:251-298`, JS realpath). The helper's `confinedExistingPath` refused "worksite path has a symlink or aliased component" (`worksite_command_helper.ts:167`) before its copy into the sandbox (read: `:444-457`). | parent admitted (run); helper refusal by the same check as (c) (read) | not a source case | not driven |
| Command execution: archive root | archive at `.abg/archive`: manifests written there | `archiveRoot` = `eventLogRoot` in identical strings: parent refused "archive root overlaps a protected workspace root" (`:328`) | **`archiveRoot` = `.abg/EVENTS`, or nested `.ABG/events/archive`: the parent passed and wrote `task.json` and `launch.json` into `.abg/events/worksite-command-execution/…`.** The helper then refused "helper launch root must be physical-canonical" (`:197-206`) and "archive root overlaps" (`:269-271`). | **`eventLogRoot` NFC `café`, `archiveRoot` NFD `café`: the same, two manifests written into the event-log directory.** | as (c) | not applicable |
| Command helper's writes back from its sandbox | none. The helper writes only its snapshot and sandbox (`worksite_command_helper.ts:441-457`, `:1426`) and `result.json` (`:1503`, `:1352-1371`), all under the attempt root in the archive root (read). | — | — | — | — | — |
| Native workspace work: write roots (`checkWorksiteWriteRoots`, the check before dispatch; `implementation/native_workspace_work.ts:40-44`) | `src` admitted | `.abg/events` refused `subject_outside_territory` | `.ABG/events`, `.abg/EVENTS`, `.ABG`: refused `invalid_coordinate` "workspace root is not physical-canonical" (`:167-169` through `plannedWriteRootPath`) | refused, the same | existing root: refused. **Absent root: `.abg/PROJECTION`, `.abg/Projection`, `.abg/PROJECTION/sub`, `.AI-WORKSPACE`, `.AI-WORKSPACE/events`, `.ai-workspace/EVENTS` admitted**, while `.abg/projection` and `.ai-workspace` are refused. | `../WORKSITE`: `invalid_relative_path` |
| Materialization (`materializeContextBootstrap`; its subject is the binding's projection root; no realpath and no overlap check, read `product/materialization_operations.ts:223-243`) | projection root `.abg/projection`: written there | **projection root = event-log root, identical strings: written into `.abg/events/product-materializations/…`** | **`.abg/EVENTS`, or `.ABG/events/projection`: written into the event-log directory** | **NFD form of the NFC runtime root: written into the runtime root** | as (c) | not applicable |
| Context observation (a read, for comparison) | observed | refused | refused `aliased_subject` (`:1145`) | refused | refused | refused |

Not driven (read only): the actor transport. It runs `mkdir(archiveRoot, { recursive: true })` and writes the prompt, output, stdout, stderr and transport files under whatever `archiveRoot` the binding declares (`abg/worker_transport.ts:749-756`; the archive root comes from `abg/actor_process.ts:932-933`), with no spelling or overlap check. Running it needs a process spawn, so I did not run it.

### 3b. What happens after an absent root is reached (run)

- After file parents made `.abg/PROJECTION`, the declared root `.abg/projection` resolves to it. Every later effect on that binding is refused, including a stored-spelled `src/later.txt` (`invalid_worksite_root` or `invalid_coordinate`: "workspace root is not physical-canonical"). When the Product then wrote its projection root the way materialization does, the files landed inside the directory the worksite effect had made: `realpath.native` gives `.abg/PROJECTION/product-materializations/…`.
- After file replace linked a file named `.abg/PROJECTION`, materialization of the projection root failed `ENOTDIR`.
- Not a spelling case, but the same window: a stored-spelled file at an ancestor of absent roots (`.ai-workspace`, and also `.AI-WORKSPACE` and `.Ai-Workspace`) is admitted and linked, then refused after publication with `ENOTDIR`. Later `mkdir -p` of the event-log root fails `ENOTDIR`.

### 3c. Case-sensitive APFS (run, image mounted under scratch, then detached)

`.ABG/events/x.txt` and `.abg/EVENTS/x.txt` are different directories there. File parents creates them, the write-root check admits them, and context observes them: correct, since no protected byte is involved. The NFD/NFC variants are still refused `aliased_subject` and `invalid_coordinate`. The command-execution parent with archive `.abg/EVENTS` refuses `ENOENT`. With NFC event root and NFD archive root it still wrote both manifests into the event-log directory, as on the default volume.

## 4. Where each effect's subject comes from, and whether a Public door carries a variant

| Effect | Source of the subject or path | Admission on the way | Variant reaches the effect? |
|---|---|---|---|
| File replace (C0) | Design targets: an actor's output, held in the recorded construction task (C1), or the recorded revision plan. Targets must lie lexically inside the job's `worksiteScope.writeRoots`, a caller's `run.invoke` input (`product/semantic_job.ts:555`, `:81`). | `constructWorksiteSubject`: `normalizeWorksiteRelativePath` refuses `.`, `..`, empty, absolute and repeated separators (`product/worksite_effect.ts:598-622`), plus the lexical protected rule (`:656`). Nothing normalizes case or form. | Yes, it reaches the async owner (run: every variant subject was admitted by construction). The owner refuses it for an existing component and admits it for an absent protected root. Through a live Run the string would come from model output (not run). |
| File parents | the same Design targets, plus `worksiteScope.parentWriteRoots` (caller's input) | `worksite_effect.ts:1577-1623`: lexical | the same as file replace |
| Construction and branch construction | recorded construction task (C1/C3) built from Design targets | lexical distinct-subject rules (section 5) | the same as file replace |
| Revision | recorded revision basis and plan (`product/worksite_preparation.ts:155-199`) | the gates in `abg/worksite_revision.ts` (sync, no protected roots) | the same as file replace; writes are C0 |
| Command execution: sources | C1 results (recorded), or paths the Program and caller select (`abg/default_library.ts:117-123`) | the parent's sync checks admit variants (run); the helper refuses them (run) | read only. No write back. |
| Command execution: archive root | the binding: the caller's `workspace.bind` request | none at bind (section 2); the parent's sync overlap check admits variants (run) | Not reachable through the Public operations as far as I read. Every route to the parent first runs an async owner over all binding roots on the same binding: C1 and revision through C0 (`worksite_operations.ts:228-229`), observed C2 through `observeWorksiteContext` → `worksiteReadRoots` (`:947-957`), native C2 through `checkWorksiteWriteRoots`. That owner refuses a root whose existing directory is spelled other than stored (run). The parent also needs the archive root to exist (`implementation/worksite_command_execution.ts:243-249`). Not run end to end. |
| Native work write roots | stage asset path from the job envelope (`product/semantic_job.ts:914`, checked lexically at `:781`), or Design targets (`:950`) | lexical, then `checkWorksiteWriteRoots` (run) | yes for an absent protected root (admitted, run); refused for an existing one (run). The native tool's own writes were not run. |
| Materialization | the binding's projection root, from the caller's `workspace.bind` request | none. The Public `product.materialize` binding passes the admitted binding from the exact-prefix environment to the owner and checks only the binding's identity (`product/materialization_definition_bindings.ts:209-265`). | yes, by reading: whatever spelling and whatever overlap was declared at bind. Driven directly (run), not through the Public operation. |
| Actor transport archive | the binding's archive root, from `workspace.bind` | none | yes by reading (read; not run) |
| `A.canonicalRoot` | workspace create and open | `realpath` (`workspace_operations.ts:525`, `:589`) | no: always stored spelling (read; realpath behaviour run) |

## 5. What a spelling variant does elsewhere

- **Two subjects that differ only in case are two subjects to the rules and one file on disk.** Run: `a/X.txt` and `a/x.txt` get distinct `subjectRef` values. Read: the rules that require distinct subjects compare `subjectRef` or `relativePath` strings and so admit both: `product/worksite_construction.ts:345-347`, `:440-442`, `:731-733`; `product/worksite_effect.ts:1579`; `product/worksite_command_execution.ts:228`, `:479`. Run, writing them in vector order with both O0 observed first (both absent): the first committed `a/X.txt` and the second was refused `aliased_subject` with the first file unchanged. Observing the second only after the first write also refuses at O0. A construction vector over the pair therefore ends partial, with member 0 committed and member 1 refused (read: the reduction needs the complete output vector, `implementation/worksite_construction.ts:268-283`).
- **Conservation is not affected.** Read: conservation inventories the installed Product roots before and after a replace (`implementation/worksite_file_replace.ts:177-180`, `:270-335`) through the tree walk, which reads stored names. A worksite subject can enter an install root only through a variant spelling, and the async owner refuses that for an existing root.
- **Revision disagrees with C0 after a case-only rename.** Run: after renaming `src` to `SRC`, both revision gates still return true for the recorded `src/a.txt`, while `observeWorksiteSubject` refuses it `aliased_subject`. The gate says current; the next C0 write refuses. No wrong write results.
- **Two spellings of one root give two identities.** Read: the binding identity is a digest over the body, root strings included (`product/environment.ts`, `hasWorkspaceBindingIdentity`), so two spellings of one directory give two bindings. Read: a different declared root set is a separately admitted binding by requirement (`REQ-P-POLICY.md:389-390`). Bind's `binding_conflict` refusal covers an artifact-truth conflict or a duplicate invocation (`product/environment_definition_bindings.ts:738-742`), not a second binding over one `A`. I found no rule refusing the second binding and did not run one. Whether cross-binding invalidation (`invalidatedAcrossBindings`, `abg/worksite_revision.ts`) then misses a change was not run. An existing root in non-stored spelling makes every async owner refuse every effect on that binding (run, rows h1 and h2 of `probe/owners.json`).
- **An install target spelled two ways gives two `installedRoot` strings for one directory** (read: `product/install_product.ts:390-393`, no realpath). The execution basis compares `installedRoot` with `productRoot` as strings (`abg/execution_basis.ts:646`, `:719`), so a mismatch refuses rather than writes (read).

## 6. The design and the requirements

Sentences about canonical roots, path spelling, protected roots, and case or normalization (run: `git grep` over live design, `history/` excluded, and `specification/requirements/` at `7f4c4ef46`).

`design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`:
- `:55-57`: "The ancestor is a strict descendant of A.canonicalRoot, contained by the pre-admitted writable territory and needed by at least one exact assessed file target. It neither equals nor enters any protected install/runtime root."
- `:60-62`: "Every existing ancestor is canonical and a concrete directory with its observed physical identity. Symlinks, non-directory collisions, aliases, escaping paths and changed preconditions refuse."
- `:235-236`: "All equality above is canonical closed-value equality, not label or path-text agreement."
- `:240-241`: "`WorksiteSubject`, `WorksiteTerritory`, `WorksiteObservation`, and the physical target resolve only beneath `A.canonicalRoot`."
- `:246-258`: "The protected-root set is exact: R_protected = { W.roots.productRoot, W.roots.toolchainRoot, W.roots.eventLogRoot, W.roots.runtimeStateRoot, W.roots.projectionRoot, W.roots.archiveRoot, every admitted ProductInstall.installedRoot }"
- `:260-271`: "After lexical normalization and no-symlink physical resolution through the nearest existing ancestor, a subject must be a strict descendant of `A.canonicalRoot` and must neither equal nor descend beneath any member of `R_protected`. A territory must be contained by `A.canonicalRoot` and must not equal or descend beneath any protected root. … A missing path may be created only when every existing ancestor satisfies the same canonical and no-symlink checks. Alternate spelling, `.`/`..`, repeated separator, case/volume alias where applicable, hard-link alias of an existing file, symlink traversal, crossed root, or target/parent substitution visible to the owner's final pre-effect validation refuses before write."
- `:325`: "`WorksiteSubject` | One canonical absent-or-regular-file target under `A.canonicalRoot`."
- `:326`: "`WorksiteTerritory` | … It cannot itself lie in a protected root …; every exact subject remains independently subject to the protected-root check."
- `:399-404`: "resolve the subject and territory canonically under `A.canonicalRoot`, refuse a subject equal to or beneath `R_protected`, refuse a territory itself in `R_protected`, … refuse a directory, non-regular, aliased, symlinked, or out-of-territory subject"
- `:726`: "Alias confinement | Try parent escape, alternate spelling, symlinked ancestor/target, hard-link alias, physical target outside `A.canonicalRoot`, and target/parent substitution visible at the final pre-effect validation. … | Every substituted or confined locus visible at the final validation refuses before write"
- `:727`: "Protected roots | Target a path in or beneath Product, toolchain, event, runtime-state, projection, or archive root … | Refusal occurs before dispatch/effect and no protected byte changes"

`design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:111-116`: "Their root-relative paths resolve under `A.canonicalRoot`; no target derives from `W.roots.productRoot`. The protected root and canonical no-alias/no-symlink law is exactly C0's `R_protected` relation and applies during task construction, invocation-basis admission, deterministic join, child-basis admission, and C0 owner re-observation."

`design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`:
- `:285-296`: the same `R_protected` set.
- `:299-306`: "Original worksite subjects, source paths, declared cwd/report/module/selector/port-file paths, and authored write territories are canonical-root-relative. Their original-root interpretation must be confined beneath `A.canonicalRoot` and must not equal or descend beneath any protected root; … Lexical alias, physical alias, hard link, symlink, crossed root, or nearest-existing-parent escape refuses."
- `:308-310`: "The helper's create-only `attemptRoot` writes beneath `archiveRoot` are Product-owner evidence mechanics, not authority for a task path or command to target the original archive tree."
- `:480-483`: "Before execution, the ABI owner resolves every protected subject beneath `A.canonicalRoot`, re-observes every protected `O1` through no-symlink confinement, and verifies exact file bytes, digest, length, full `A`, and full `W`."
- `:523`: "the task-owned canonical `archiveRoot`, exact `attemptRoot`, and structurally derived `launchManifestPath`"
- `:899`: "Alias and protected roots | Use lexical aliases, symlink ancestors, hard-link aliases, crossed roots, a target beneath a protected root, or a territory itself inside one. | Host/helper refuses at the owning pre-effect seam; no snapshot command begins and no protected byte changes."

`design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md`:
- `:134-139`: "Protected roots P are the WorkspaceBinding roots plus the `installedRoot` of each Product install in the exact-prefix workspace environment. A write root w ∈ W overlaps P when w equals, encloses or lies inside some p ∈ P. All three overlap classes refuse the task before assembly and provider dispatch."
- `:141-155`: "The relation has a path reading and a physical reading, both in the existing worksite owners … a directory or missing path resolves through `plannedCanonicalPath`; a link at any existing component refuses."

Requirements:
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md:49` (REQ-R-ABG3-BINDING-016): "`WorkspaceAuthorityBasis` shall contain only stable workspace identity, canonical root locator, authority mode, … `WorkspaceBinding` shall immutably join that basis to the exact installed product set, resolved lock, and declared roots. … each of its declared roots are non-blank strings with no leading or trailing whitespace and no NUL character; a bind request that carries any other value is refused."
- `REQ-R-ABG3-BINDING.md:53-55` (REQ-R-ABG3-BINDING-018): "A changed workspace authority basis, installed product set, resolved lock, or declared root shall require a separately admitted immutable workspace binding."
- `specification/requirements/product/REQ-P-INSTALL.md:63-64` (REQ-P-INSTALL-008): "A `WorkspaceAuthorityBasis` shall bind the stable workspace identity, canonical root locator, authority mode, …"
- `specification/requirements/product/REQ-P-POLICY.md:389-390`: "A different product set, lock, authority basis, or declared root set shall create a separately admitted immutable binding identity"

Further sentences in the same designs:

- C0 `:209-210`: "`WorkspaceAuthorityBasis A.canonicalRoot` is the mutable source worksite admitted for the stable workspace identity"; `:215`: "They are not aliases."
- C0 `:362-364`: "Every ref is derived from canonical carrier bytes. Equality requires ref, digest, and covered coordinates to agree. A label, path spelling, caller object, ambient current directory, fixture, or owner self-report cannot supply …"
- C0 `:491-493`: "A valid successor observation can be retained only if actually obtained; alias, EIO, absent, or digest/length mismatch does not synthesize O1."
- C0 `:723`: "Distinct roots | Admit `A.canonicalRoot != I_P.installedRoot` and `W.roots.productRoot == I_P.installedRoot`. | A `package.json` subject resolves beneath `A.canonicalRoot`; publication changes only that worksite file."
- C0 `:740-742`: the owner test refuses "a protected target or territory, an alias, a symlink or non-file subject, an escaped target, and target/parent substitution visible …"
- C0 Falsifiers (`:768-786`): "The increment fails if any of these occur: … a worksite subject, territory, observation, or source snapshot resolves from `W.roots.productRoot` instead of `A.canonicalRoot`; … a target equals or descends beneath a protected root, its territory itself lies in one, or an alias/symlink reaches one; a write occurs after stale-observation detection"
- C0 `:565` (the observation current for "the subject path under the canonical root at that prefix") and `:669-670` (a fixture constructs "requests with full A beneath `A.canonicalRoot`"): about coordinates, not spelling.
- C1 `:300-304`: admission checks "unique target refs and subjects, targets beneath `A.canonicalRoot` and outside every protected root, target-within-territory, and observations bound to the corresponding `A`/`W` subjects."
- C1 `:705-707`: "no Worker or non-C0 implementation writes the canonical worksite, only C0 writes a declared target beneath `A.canonicalRoot`, and no actor changes any Product/toolchain/event/runtime-state/projection/archive root."
- C1 `:644`, `:647`: the distinct-roots and C3-inheritance proof rows (`A.canonicalRoot != W.roots.productRoot`; a branch with a different canonical root refuses).
- C2 `:273-274`: "Direct possession of task bytes, `canonicalRoot`, or a helper command is not exact-prefix authority."
- C2 `:276-279`: "All original protected subjects and observations resolve under `A.canonicalRoot`, never `W.roots.productRoot`. C2 re-observes each protected `O1` there before snapshot creation …"
- C2 `:470-474`: "Every cwd, report, module, selector, port-file, and write-territory path is safe and relative to the canonical worksite … Declared child executable, argv, and environment values must not expose `A.canonicalRoot` or any original WorkspaceBinding root or contain a parent path segment."
- C2 `:609-612`: "All declared command cwd, report reads, module imports, report walks, and HTTP probes resolve their canonical-root-relative coordinates inside that snapshot mirror through canonical, no-symlink confinement."
- C2 `:632-634`: "It also re-observes every original `O1` under `A.canonicalRoot` after the Worker returns and requires exact equality …"
- C2 `:885`: names the refusal `helper_protected_mismatch`.
- C2 `:897`: "Distinct worksite/install | Use `A.canonicalRoot != I_P.installedRoot` …"
- Native work `:86-89`: "ABG's existing native host/transport runs at the exact `A.canonicalRoot`, with ordinary local read/edit/search/shell tools. Installed Product/runtime resources remain outside the granted worksite. This is a trusted-developer workspace boundary, not hostile-workstation containment."
- Native work `:123`, `:316`: C0 facts are retired "at the same canonical root".
- Native work `:206-210`: the lane plan: "Physical controls use an install root inside A from the environment and a link alias to a protected root."
- `design/ABI5_REALIZATION_CONSTITUTION.md:1676`: the bind result row: "declared roots -> `root_mismatch`; existing unequal binding -> `binding_conflict`".
- `design/ABI5_REALIZATION_CONSTITUTION.md:3160`: "`WorkspaceAuthorityBasis + ProductSet + resolved lock + declared roots` determine stable binding identity. … Changed binding constituents require a new binding". This bears on question 5: two spellings of one root are two bindings.
- `design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:117-119`: "A content change under the same `WorkspaceAuthorityBasis`, ProductSet, resolved lock, and declared roots preserves `WorkspaceBinding` and creates a new observation." `:141-144`: a changed "declared root … invalidates the activation or requires the declared re-entry."
- `design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:125`: WorkspaceBinding "immutably joins workspace authority to ProductSet, resolved lock, and declared roots". `:317`: `constructWorkspaceBinding` has "no runtime effect".
- `design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1805`: `workspace.bind` takes "complete declared roots" and returns "workspace/product/lock/content/root/binding/incompatibility refusal".
- `design/T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md:54`: "The binding owner creates W from those inputs".
- `design/T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md:111-112`: "The owner checks canonical roots, protected install/runtime roots, symlinks and explicit limits". `:190`: "It refuses escape, aliases, protected roots, …"
- `design/T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md:476`: "by exact canonical root/path"; `:873`: "It preserves A/canonical root, subject URI and relative path …"
- `design/T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md:256`: "Every mutable target stays beneath A.canonicalRoot." `:46` is a flow label.
- `design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md:226`: "For an unchanged actual A, canonical root, actor and declared worksite meaning, …"
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md:54` (REQ-R-ABG3-CONTINUATION-014): "A changed workspace authority basis, workspace binding, product/install/catalog authority, declared root, or other execution authority on a continued spine shall require a separately admitted binding when applicable …"

Not about filesystem paths, so not quoted: `ABI5_REALIZATION_CONSTITUTION.md:309`, `:2366`, `:2952`, `:3202` (topology roots and catalog rows); `:2536` (a platform API list naming `realPath`); `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:79`, `:696` (topology); `:80` describes `path_confinement.ts` as lexical, matching section 1c; `ABI5_STDO3_COMPUTATIONAL_BINDING.md:92`, `:158`; `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md:21`, `:109`. The other "spelling" hits name identifier or field spellings, not paths: `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1154`, D1 `:470`, D2 `:28`, `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md:111`, `T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN.md:74`, `:185`, `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md:115`, C2 `:513`, and the requirement lines in `REQ-R-ABG3-EVENTS.md:54`, `REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md:72`, `REQ-R-ABG3-SUPERVISOR-WITNESS.md:38`, `REQ-R-ABG3-TUNER.md:38`, the five `REQ-L-GTL3-*` hits and `REQ-P-PUBLIC-CONTRACTS.md:227`, `:236`. `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1422` and C1 `:372` say file bytes undergo no Unicode normalization (content, not paths).

No requirement sentence mentions path spelling, letter case or Unicode normalization of paths (run: grep). No live design or requirement sentence requires the six binding roots to be disjoint from one another (run: grep for disjoint and overlap). The only stated overlap rule is native work's write roots against P.

## 7. The options

Measured per call on a path 11 components deep, Node v24.7.0, this machine (run, `probe/cost-fold.mjs`; n = 20,000, 2,000 for the readdir walk, 5,000 for the awaited call):

| Call | µs per call |
|---|---|
| `lstatSync` (one system call, the baseline) | 1.17 |
| `realpathSync` (JS, today's sync checks) | 13.28 |
| `realpathSync.native` | 10.07 |
| (a) stored spelling of the deepest existing ancestor plus the remainder: existing file / variant spelling / two missing components | 10.90 / 11.19 / 35.41 |
| (b) as a `readdir` walk over every component | 727.01 |
| (c) fold the subject and seven roots, no system call | 2.14 |
| `fs/promises` `realpath`, awaited one at a time (today's async owners) | 19.45 |

Folds against this volume (run, 28 name pairs, each created and looked up on the volume):

- No JavaScript fold tried agrees with the volume on every pair.
- `normalize("NFD"|"NFC").toLowerCase()` says distinct where the volume says same for ß/ss, σ/ς, Σ/ς and ﬁ/fi. Each of these is an admitted alias.
- `normalize("NFD").toUpperCase().toLowerCase()` says distinct for ß/ẞ, which is also an admitted alias. It says same for ı/i and ı/I where the volume says distinct, which over-refuses.
- The NFKD variant also over-folds Ａ/A and ①/1.
- The volume folds Georgian Mtavruli (U+1C90) and Cherokee lowercase, so its tables are recent.

| | (a) one owner states the stored spelling; checks and the protected-root rule compare stored spellings | (b) refuse unless every existing component is spelled as stored | (c) the protected-root rule compares case-folded and normalized strings |
|---|---|---|---|
| Source lines | a sync `storedSpelling(path)` in `shared/` (shape of `plannedCanonicalPath`, using `realpathSync.native`). The 28 sites in 1a compare against it. `protectedWorksitePath` (`worksite_effect.ts:450-459`) and the C2 parent planner (`implementation/worksite_command_execution.ts:210-229`) compare stored spellings. | Replace `realpathSync(x) !== x` with `realpathSync.native(x) !== x` at the 28 sites, and make the sync planner at `:219` refuse when the stored spelling differs. This is what the async owners already do (`worksite_operations.ts:167`, `:266`, `:366`). | Fold in `shared/path_confinement.ts` or in `protectedWorksitePath`; needs a volume test, since Node has no `pathconf(_PC_CASE_SENSITIVE)`. |
| Q3 rows refused | all existing-root variants, including the C2 parent's source-subject rows and archive rows (the archive's stored spelling equals the event-log root's). **Not the absent-root rows**: an absent remainder keeps the declared spelling. Not materialization or transport, which call no check. | the same as (a). The archive root `.abg/EVENTS` refuses at `:246`. **Not the absent-root rows**, and not materialization or transport. | lexical variants of existing and absent roots, if the fold matches the volume. It does not: ß/ss and σ/ς slip through the fold this would most likely use. Not materialization or transport. |
| Cost per check | about 10 to 11 µs for an existing path, 35 µs with missing components; today's JS call is 13 µs | 10 µs; cheaper than today | 2 µs plus one volume test per root |
| Case-sensitive volume | correct: the stored spelling is the only spelling | correct; NFD/NFC still refused, which is right because APFS still aliases them | over-refuses: refuses `.ABG/events/x`, a distinct directory there (run: it exists separately) |
| Lanes and recorded subjects | Recorded subjects (run, read-only, `probe/recorded-subjects-native.mjs`): the 58 recorded tasks hold 36,814 protected subjects. The 1,549 still on disk are all spelled as stored (0 mismatches); the other 35,265 are gone, so (a) changes none that can still be checked. Lanes on the default TMPDIR realpath their scratch (`fsp.realpath(mkdtemp)`) and so should keep passing (not run). Lanes asserting the C2 parent's refusal messages may change wording. | the same | lanes that bind absent roots keep passing; any lane with an ı/i-like name would change (none seen) |

Two further measures close the rows the three options leave open. They must work together, and both at bind. A disjointness check over roots that do not exist yet compares the absent remainders as strings. It would admit `projectionRoot` `.abg/EVENTS` beside `eventLogRoot` `.abg/events` when both are absent, and materialization would later write into the event-log directory. Materialization and the actor transport are not worksite effects, so a rule held only by the worksite owners does not protect them.

| | (d) every declared root exists as a directory spelled as stored: at bind, and again at each worksite effect | (e) the declared roots do not overlap, compared in stored spelling |
|---|---|---|
| Rule | Bind refuses a root that is absent or for which `realpathSync.native(root) !== root`. The async owners refuse while any protected root is absent. They already `lstat` each root in `plannedCanonicalPath`, `worksite_operations.ts:158-180`. | The archive, event-log, runtime-state and projection roots are pairwise disjoint and disjoint from the toolchain and product roots. The product root may lie inside the toolchain root: that is the installed layout (`…/installed-abi` and `…/installed-abi/node_modules/@abiogenesis/typescript-tenant`). The C2 parent's two rules (`implementation/worksite_command_execution.ts:324-338`) are a subset. |
| Closes | the absent-root rows: file parents creating a protected root's alias, file replace linking a file at it, native write roots admitting it. Once the root exists, the async owners refuse every variant (run for existing roots). Also roots in another spelling (rows h1 and h2), refused at bind rather than at every later effect. | materialization's control (b) failure and its variants (run); the actor transport (read); the C2 parent's archive rows (run) |
| Where | the bind owner (`product/environment_definition_bindings.ts`, `bind`), not the pure constructor `constructWorkspaceBinding`. Fixtures that construct bindings over paths that do not exist (`test_env/fixtures/c2-component/input.mjs` uses `/component/forward/…`) would otherwise refuse. The worksite-owner half goes in `worksiteReadRoots` and `resolveWorksiteTarget`. | the bind owner, after (d) |
| Alternative | Bind creates each absent root, then applies the rule. That is a write at bind to caller-declared paths, possibly outside `A`. Creating two roots that alias each other leaves an empty directory behind before the refusal. | none needed |
| Cost | six native calls at bind (about 10 µs each); no extra system call in the owners | fifteen string comparisons at bind |
| Lanes and recorded bindings | `root-installed-environment.mjs:450-476` and the CLI steel bind (`steel-basic-cli-public.test.mjs:545-551`) bind absent `.ai-workspace/*` roots and would have to create them first. Recorded (run, read-only, `probe/recorded-roots-native.mjs`): of the 58 recorded bindings, 50 still have all six roots on disk; 17 roots in the rest have been deleted since. Every existing root is spelled as stored (0 mismatches). | Recorded (run): 55 of 58 have pairwise-disjoint roots. The other 3 differ only in the product root lying inside the toolchain root, which the rule allows, so 58 of 58 pass. `t292-td36s-bind-string-rule.test.mjs` gains cases. Binding identity is unchanged, because roots stay strings. |
| Change class | REQ-R-ABG3-BINDING-016 states the bind refusal rule as a string rule, so a physical refusal at bind is a requirement re-entry. The creating alternative also adds an effect to `workspace.bind` (REQ-P-POLICY.md:387-389 lists what binding shall not do). | requirement re-entry, for the same reason |

**Recommendation:** (b) at every sync site, and (d) with (e) at bind, (d) first. The reasons:

- **(b)** brings the 28 sync checks to the rule the async owners already keep. That closes every existing-root row, including the command-execution parent's manifest write into the event-log directory and the revision gates' acceptance of an old spelling. It costs less per call than today: 10.07 µs against 13.28 µs (run). It is a realization refactor, because the C0 design already requires "case/volume alias where applicable … refuses before write" (C0 design `:268-271`).
- **(d)** closes the absent-root rows, which (a), (b) and (e) leave open. Once every protected root exists, the volume itself answers the alias question for every variant. It also makes (e) exact, since there are no absent remainders left to compare.
- **(e)** closes the writes that need no spelling at all: materialization into the event-log root when the roots coincide (run), and the actor transport (read). It also closes their spelling variants. The Executive may want to register the disjointness part apart from TD-85, since it fails control (b) in stored spelling.
- **Check-only (d) over the creating alternative.** Bind stays free of effects, and no path the caller declared is written before it is checked.
- **Not (c).** No fold I tried agrees with this volume, it would over-refuse on a case-sensitive volume, and with (b), (d) and (e) no row of section 3 needs it.

What the combination leaves open: a root renamed or deleted after bind. The worksite owners refuse it through (d)'s second half. Materialization and the transport do not re-check, and they write wherever the binding's string now resolves. The requirements exclude a hostile local actor; an accidental rename after bind is not covered by any option here.

The register row classes TD-85 as `realization_refactor`. That holds for (b) only. (d) and (e) are a requirement re-entry.

The register's closure says the lane "is skipped with a stated reason on a case-sensitive volume". That is wrong for normalization: case-sensitive APFS still aliases NFC and NFD (run). The lane should test the volume for each kind of variant, case and normalization, and skip only the kinds the volume does not alias.

**What I am unsure of:**

- **Who creates the roots under (d).** It requires callers to create their roots before `workspace.bind`. I did not check whether the CLI or any user-facing flow does so today. The two lanes that bind absent `.ai-workspace/*` roots do not.
- **The C2 parent through Public operations.** I traced its reachability by reading three routes. I did not run a live Run, so a route I did not find could reach it.
- **The native tool.** I did not run its writes. Its write roots are checked only before dispatch.
- **Cross-binding invalidation.** I did not check what it does with two bindings over one `A` whose roots differ only in spelling.
- **(b)'s effect on the lanes.** I did not run the lanes with (b) applied.

## What I did not check

- No Public `run.invoke`, no model call, no actor transport run, no native tool run. Every effect was driven directly with cold coordinates.
- Branch construction (C3) was not driven separately; read only, it uses C0.
- The revision gates were driven only for (a), (b) and (c), plus the case-only rename; not for (d), (e) or (f).
- Conservation was read, not run, with a variant subject.
- `abg/semantic_stage.ts`, `abg/semantic_job.ts`, `abg/semantic_revision.ts`, `abg/worksite_construction_recovery.ts`, `abg/runtime_liveness.ts` and `abg/transport_contracts.ts` were classified by reading. Each is a read-only gate; none was driven.
- Hard-link, symlink and `..` aliases were outside the brief and not re-run.
- A fold that over-approximates the volume, to be used only for absent remainders, was not tried.
- Whether Windows or Linux volumes behave differently was not checked. Linux ext4 is case-sensitive; Windows NTFS ignores case and not normalization.

## Scratch

Run with `du -sh` at 01:21 AEDT, 2026-11-13. Nothing deleted.

- `/private/tmp/abg-td85-work`: 150 MB. That is the copied tenant with `node_modules` and its build (134 MB), the case-sensitive image `td85cs.dmg` (16 MB, detached, mount point `csmnt/` empty), probes and their JSON output in `probe/` (228 KB), and `vol/`. The probe copy `build_tenants/abiogenesis/typescript/td85-probe/c2.mjs` lives in the copied tenant so that its bare imports resolve.
- `/private/tmp/abg-td85-tmp`: 2.8 MB, the fixtures' worksites.
