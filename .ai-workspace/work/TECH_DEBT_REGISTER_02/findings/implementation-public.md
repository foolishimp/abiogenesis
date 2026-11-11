# Findings: implementation-public

Commentary, not law. Independent read-only area review for the second edition of the technical debt register, 2026-11-12. Reviewer: Claude Opus 5.5, working for the Executive's brief (`../REVIEW_BRIEF.md`).

T = `build_tenants/abiogenesis/typescript`. Source paths are relative to `T/code/src` unless a path starts with `T/`, `specification/` or `.ai-workspace/`.

## Scope and method

- Area: `implementation/` (20 files, 8,149 lines), `public/` (12 files, 4,558 lines), `app/m04.ts`, `qualification/m05.ts`.
- Read the census outputs (`declarations.json`, `summary.json`, `modules.json`, `compiler-unused.json`, `kinds-never-produced.json`, `kinds-never-read.json`, `clones-by-file-pair.json`), the existing register's closure section (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md`, section "Closures and intentional retention that must not become new debt"), and the coverage table at the end records how each file was read.
- Commands run: `grep`, `sed`, `wc`, `find`/`du` on `T/build`, short Python filters over the census JSON and the published adapter projection, and one member-to-test scan script (scratchpad `members.py`) that searches test, support and UAT files for each Public member key and records whether a test sends a call for it.
- Not done: no tests, no builds, no runtime measurement, no reading of `T/test_env/test_runs`. Every performance item below is structural (by reading) unless it cites a measurement. I did not read `implementation/consensus.ts` beyond its outline and clone census, and I read `worksite_command_helper.ts` lines 660-1340 only as an outline.
- Labels used below:
  - "Serialized call": a DefinitionCall that arrives as JSON through the CLI (`--jsonl <file>`) or through `runInstalledDefinitionCallTransport` with a `new`, `reopen` or `eventless` acquisition.
  - "Acquired call": a call sent through `runInstalledDefinitionCallWithResource` with an owner-issued event-resource selection (acquisition kind `acquired`).
  - "Established call": a call the SDK marked through `establishExactDefinitionCall` (§10.11 X1/X3); the transport carries it by reference.
  - "Gate": a check that must hold immediately before an effect (currentness, selected occurrence, owner admission).

## Public surface against its users

The published family declares 18 operations and 56 definitions (`T/contracts/public-functions/adapter-projection.json`, re-listed by script). The test `t287-framework-handoff-types.test.mjs:243-245` asserts 47 callable and 9 unavailable. "Executing test" means a test, support or UAT file constructs and sends a call for that member key. "None found" is a string scan; a call built from a computed key would be missed.

The CLI (`public/cli.ts`) accepts only `--jsonl <file>` and forwards the definition key it finds, so every bound member is equally reachable from the CLI and no member has a CLI spelling of its own. The default governance library invokes no Public member. The amendment witness uses `run.invoke#start` only (`T/test_env/uat/amendment-witness-run.mjs:56-58`: SDK construction, then the installed CLI with a reopen acquisition).

| Operation | Members | Binding | Executing test |
|---|---|---|---|
| catalog.admit, catalog.apply, catalog.view | admit; node_type, overlay; allowlist | bound | yes |
| conformance.evaluate | gtl_program | bound | yes |
| interaction.respond | answer_escalation, approve, assess, reject, select | none: `installed_binding_unavailable` | only the refusal test |
| product.install, resolve, verify, materialize | install; resolve; verify; configuration, context_bootstrap | bound | yes |
| project.read | catalog_describe, catalog_list, workspace_status, install_evidence, release_evidence, ticket_consensus (`product/project_read_definition_bindings.ts:1019`) | bound | yes |
| project.read | run_status, run_result, run_replay, run_gaps, graph_call_result, graph_call_replay (`RUN_READ_DEFINITION_BINDINGS`, `abg/project_read_definition_bindings.ts:1005-1039`, through `bindExactPrefixRead` and `bindStaticOwner`) | bound, owner-admitted | yes |
| project.read | run_evidence, workspace_replay | bound, legacy `binding()` (:894, :992-1002) | yes |
| project.read | c_call_replay, continuation_replay, graph_call_evidence, graph_call_status, interaction_replay, result_evidence, run_lawful_actions | bound, legacy `binding()` | none found |
| project.read | assessment_evidence, witness_evidence, workspace_gaps | bound, legacy `binding()` | roster or inventory assertions only |
| release.snapshot | published_rc, tapped_release | bound | yes |
| result.assess | assess (`product/result_definition_bindings.ts:310`) | bound | roster only |
| run.continue, run.invoke | current_intent, selected_action; invoke, start | bound | yes |
| witness.admit | reprice, run-stopped (`abg/witness_definition_bindings.ts:379`) | bound | yes |
| witness.admit | attest, hygiene-stamp, intake, run-resumed | none: `installed_binding_unavailable` | only the refusal test |
| workspace.bind, workspace.open | bind; open | bound | yes |
| workspace.create | clean; imported | bound | clean yes; imported none found |

## Candidate entries

Ordered by value. Each entry names one owner and what it absorbs.

### Make the published outcome schemas describe what the transport returns

- Category: design and specification
- Evidence:
  - The transport and CLI return `installed_definition_call_transport_result`, `installed_definition_call_transport_refusal`, `public_transport_refusal` and the receipt kind `definition_host_receipt` (`public/installed_definition_call_transport.ts:511-516`, `public/cli.ts`, `shared/effect_definition.ts:80-150`). None of these kinds appears in any file under `T/contracts`, the 2.88 MB common schema included (recursive grep, no file matched).
  - The published schemas instead declare four envelope kinds that no source produces: `indexed_invocation_admission_refusal` (`public/binding/public_function_projections.ts:427`), `public_envelope_admission_refusal` (:449), `public_family_lookup_refusal` (:474) and `public_outcome` (:537). Census `kinds-never-read.json` lists them as schema constants only; I found no producer by grep.
  - Established by grep and by reading the transport, the CLI and the projection builders.
- Retire: one outcome owner. Either the published schema derives from the transport's actual result and refusal types, or the transport produces the published envelope. Delete the four unproduced envelope schema constants once one shape is chosen.
- Size: L. About 150 lines of schema builders change, plus every caller that reads outcomes.
- Risk: Public contract. Callers parse whichever shape is chosen, and the published schema bytes and their pinned digests change.
- Change class: requirement_reprice if the published envelope is withdrawn; design_reframe if the transport adopts it.
- Confidence: verified for the mismatch. Investigate which shape the requirements name; reading the outcome section of `specification/requirements/REQ-P-PUBLIC-CONTRACTS.md` against both shapes settles it.

### One owner for DefinitionCall admission

- Category: second owner
- Evidence:
  - `admitExactDefinitionCall` (`public/binding/definition_binding_mechanics.ts:433`) checks a call against its installed declaration with valibot, three `sha256Canonical` digests and coordinate checks. It runs:
    - at the transport for every serialized call (`public/installed_definition_call_transport.ts:261-262`). The comment there says this serves "legacy read owners whose admission is at this boundary";
    - again at the transport after an acquired call's owner has already run, selected by matching the exact fault message string `"TypeError: definition call differs from its fixed owner"` (:491-510).
  - `implementation/release_publication.ts:145` also calls it, inside `isReleaseOperationArtifact` (:142), to validate a recorded artifact's embedded invocation. That is reuse of the owner function, not a second owner.
  - Bound owners admit the same call again inside the callable (`public/binding/static_definition_bindings.ts`, `bindStaticOwner`, `admitResources`). The six run reads go through `bindExactPrefixRead`, which uses `bindStaticOwner` (`abg/exact_prefix_bindings.ts:105-150`). The legacy read binding `binding()` (`abg/project_read_definition_bindings.ts:894`, roster :992-1002) serves the other twelve ABG reads. It checks resource shape and acquires the event resource but does not admit the invocation, which is why the transport still admits.
  - `runInstalledDefinitionCallWithResource`, the only entry that produces acquired calls, has no source caller besides the barrel (`public/index.ts:11`). Its users are tests, test support and UAT (`T/test_env/uat/public-setup.mjs`, `continuation.mjs`). The string-match path therefore runs only for SDK consumers, never on the CLI route.
  - Established by reading these files and by grep.
- Retire: the fixed owner binding (`bindStaticOwner` with `withAdmissionAuthority`) admits every call once. Move the twelve legacy reads onto it, the way the six run reads already are. Ten of the twelve have no executing test (next-but-one entry), so either migrate them with a lane each or withdraw them. The transport keeps only selection by definition key, and the fault-message string match disappears with the double admission.
- Size: L. About 120 lines in the transport and legacy read bindings; it spans three owners.
- Risk: Public contract. A serialized call that fails admission now refuses with the transport's `invalid_definition_call`; after the change it would carry the owner's receipt, so refusal codes seen by callers change.
- Change class: design_reframe
- Confidence: likely. Settle by tracing one serialized call to a bound owner and one to a legacy read owner and counting admissions.

### Worksite path confinement: one owner for rules that have already drifted

- Category: second owner
- Evidence:
  - The parent process and the command helper process each keep their own path rules:
    - parent `implementation/worksite_command_execution.ts`: `plannedCanonicalPath` :279, `assertFinalRootNotSymlink` :301, `assertCanonicalArchiveRoot` :311, `containsPath` :320, `assertExistingCanonicalNode` :483, `publishCreateOnly` :517;
    - helper `implementation/worksite_command_helper.ts`: `contained` :251, `canonicalDirectoryRoot` :260, `confinedExistingPath` :273, `canonicalExistingPathWithinRoot` :297, `containsAbsolutePath` :349, `plannedCanonicalDirectoryPath` :355, `publishCreateOnly` :1524.
  - A third set lives in `implementation/release_publication.ts:37-38`: `inside` and `safeRelative`, which assume `/` separators.
  - The rules differ, established by reading:
    - `containsPath` (parent :320-323) rejects any relation starting with `..`, so a child directory named `..x` counts as outside the root. `containsAbsolutePath` (helper :349-353) tests `..${sep}` and counts it inside.
    - The parent splits the symlink rule out of `plannedCanonicalPath` into a separate `assertFinalRootNotSymlink`. The helper's `plannedCanonicalDirectoryPath` refuses a symlink or non-directory at any existing node inline.
    - The helper's archive-overlap check (`assertLaunchArchiveBoundary`, :377-399) covers five roots. The parent's (`assertArchiveExecutionBoundary`, :431-481) also refuses mutable roots nested inside the Product root and confines every attempt path.
- Retire: one confinement module in `product/` (for example beside `product/worksite_operations.ts`). Both processes already load `product/` (helper imports at :12-29). The three sites above import it. The parent and the helper still each run the checks; only the code becomes one copy.
- Size: M. About 180 lines removed across three files.
- Risk: none for recorded bytes, since the checks return booleans or throw. Choosing one rule for `..x` names changes behaviour only for such names.
- Change class: realization_refactor
- Confidence: verified for the drift. Settle the intended rule for names that begin with `..` before merging.

### The command helper restates the launch identity rules instead of importing them

- Category: second owner
- Evidence:
  - The helper is a separate Node process. The Worker launches it through its Bash tool with `--task <launch-manifest>` (`worksite_command_helper.ts:234-242`, `worksite_command_execution.ts:274-276`), so it must re-admit the manifest from disk. That re-admission is by design.
  - Re-implementing the rules is not forced by the process boundary. The helper already imports `product/worksite_command_forward.js`, `product/worksite_command_execution.js` and `product/worksite_effect.js`, but nothing from `abg/` (imports :1-40, read). It keeps its own copies of:
    - the attempt reference: helper :149. `abg/instruction_assembly.ts:128` holds another copy, whose docstring says it is "shared with the existing C2 helper owner"; the parent calls it at `worksite_command_execution.ts:178`;
    - the launch-manifest body and digest: parent :184-212, helper :202-229;
    - the authority-free occurrence validator: parent :139-170, helper :129-147;
    - the manifest type: parent :102-124, helper :96-118 (17-line clone in the census).
  - Inferred, not read: the helper avoids `abg/` to keep its start-up module graph small. The helper's closure in `census/out/modules.json` would settle it.
- Retire: one `product/` module, for example `product/worksite_command_execution.ts`, exports the attempt reference, the occurrence validator and the manifest body. The parent, the helper and `abg/instruction_assembly.ts` import it, and `abg/` imports from `product/`, not the reverse.
- Size: M. About 110 lines removed from the helper and `abg/instruction_assembly.ts`.
- Risk: replay digests of recorded Runs. The attempt reference, the attempt digest in the archive path and the launch-manifest reference enter recorded helper artifacts and observations, so the shared code must emit identical bytes.
- Change class: realization_refactor
- Confidence: verified for the duplication; the reason the helper avoids `abg/` is inferred.

### Installed-tree inventory: one walker, and count the full-tree walks per invocation

- Category: performance
- Evidence:
  - Three copies of the same recursive walk read every file and hash it:
    - `implementation/worksite_command_execution.ts:375` (`installedProductInventoryDigest`, synchronous, blocks the event loop);
    - `implementation/worksite_file_replace.ts:188` (`installedProductInventory`, asynchronous, same row shape);
    - `implementation/worksite_command_helper.ts:520` (`filesystemInventory`, asynchronous, a different row kind `worksite_path_observation` without file identity).
  - `product/install_product.ts:181` (`installedProductContentMatches`) is the related manifest-based check.
  - Full walks per invocation, by reading:
    - one command execution: the parent walks `productRoot` before dispatch and after completion (:652, :691), and the helper walks `productRoot` and the sandbox before and after (:1586, :1607, :1640, :1642);
    - one command forward: three extra walks of every installed root (`worksite_command_forward.ts:37,41,44`) on top of the command execution;
    - one file replace: two walks of each conservation root (`worksite_file_replace.ts:506,554`).
  - Scale: an installed root is the installed package. `T/product-toolchain-manifest.json` names 5,325 product-relative locators, so each installed-root walk reads and hashes on the order of 5,000 files. The cost is structural; I measured nothing. The RC9 review recorded install verification at about 3×5,323 hashes per call, which is the same order.
- Retire: one walker in `product/` (the confinement module above, or beside `install_product.ts`) that returns rows and digest. The parent and the file-replace walks share one row shape now; the helper's rows can be derived from it. Reducing the number of walks is a separate decision. The parent's before and after walks bracket the helper's pair on the same root, and the forward command's three walks bracket the execution's walks. Do not drop a conservation check without that decision.
- Size: M. About 120 lines removed by the walker merge; the walk reduction is L.
- Risk: replay digests of recorded Runs for the helper. Its `productDelta` rows enter the helper artifact, so its row shape must stay byte-identical. The parent's digests are compared in process only (inferred from reading; they are not placed in the result).
- Change class: realization_refactor for the walker; design_reframe for fewer walks.
- Confidence: verified for the duplication; likely for the cost. Timing one command forward on an existing install would measure it.

### Worksite leaf authority: one currentness gate, called where it is needed

- Category: second owner
- Evidence:
  - The same gate body is written three times. Each reads the owned runtime prefix with `requireCurrent: true`, projects the CCall phase (`selected_no_evidence`), checks the execution basis and implementation set at the prefix, checks the selected occurrence input, and compares about forty coordinates between the authority, the CCall, the resolution and the request:
    - `implementation/leaf_invocation_port.ts:1141-1327` (`hasExactWorksiteLeafExecutionAuthority`);
    - `implementation/worksite_file_replace.ts:331-503` (inside `realizeWorksiteFileReplace`);
    - `implementation/worksite_file_replace.ts:670-731` (inside `realizeWorksiteFileParents`).
  - The port copy and the file-replace copy carry the same comment word for word ("Pre-effect currentness stays explicit…", port :1162-1163, file replace :332-333). The two realizer copies also share the root-basis walk and the program, graph and implementation owner-install derivation (file replace :376-406, file parents :708-729).
  - The row validator in `implementation/leaf_execution_authority.ts:57-150` duplicates `product/worksite_effect.ts:610-698` (census clones of 30 and 26 lines). Producers are `abg/execution_basis.ts:1927` and `product/implementation_resolution.ts:521`.
  - The register's closure says to retain the "causal/currentness and selected-occurrence gates". This entry keeps every gate. It asks for one function that computes the gate, called from each place that needs it.
  - The realizer's copy runs after awaits: `verifyAuthority` is awaited (port :675) and `loadImplementation` awaits a module load (:1679-1682). It is the gate closest to the effect and must stay.
  - Inferred: `realizeWorksiteFileParents` imports `validateWorksiteFileParentsPlanAtPrefix` dynamically (`import("../abg/semantic_job.js")`, :695) while the port imports the same function statically, which looks like a module-cycle workaround.
- Retire: one function, for example `currentWorksiteLeafAuthority(authority, call)` in `product/worksite_effect.ts`, returning the held basis, set, environment and protected and conservation roots, or null. Both realizers and the port call it. One row validator: `product/worksite_effect.ts` keeps it and `leaf_execution_authority.ts` imports it. Whether the port's pre-check adds anything once the realizer runs the same gate is a separate trace.
- Size: L. About 250 lines removed across three owners.
- Risk: replay digests of recorded Runs if the order of refusals changes. The port refuses with an owner refusal while the realizer returns null, so they record different failure values. A pure extraction that keeps both call sites keeps the bytes.
- Change class: realization_refactor
- Confidence: verified for the duplication; investigate whether the port's copy is redundant, by tracing whether every worksite realizer runs the gate after the port's check.

### Per-invocation hashing of deep-frozen carriers: memoize by identity

- Category: performance
- Evidence, by reading (structural):
  - `isLeafExecutionAuthority` (`implementation/leaf_execution_authority.ts:201-297`) hashes the whole authority body, the resolution, every implementation-set row and the program publication, then walks the value for `isDeeplyFrozen`. It runs at least three times per worksite file-replace invocation: port :694, port :1151, realizer :313. `native_workspace_work.ts:30` adds another.
  - `exactAdmittedResolution` (port :1110-1121) hashes every row of the implementation set on each call to find one match. The cost grows with the set's row count on every leaf call.
  - Port :1254 hashes the graph function on each worksite call. Port :676 re-hashes the input already digested by the caller. File replace re-hashes the input, the resolution and the raw input value again (:317-320, :434-436).
  - `verifyAuthority` awaits `semantics.verifyInstalledContent()` (port :1647-1649), which reaches `product/install_product.ts:181` and reads and verifies the installed payload on each invocation. `t287-held-owner-fold-reuse.test.mjs:95,205` states an intent to reuse held owners; I did not check whether this path reuses them.
- Retire: these carriers are required to be deeply frozen, so a validated result can be held in a `WeakSet` or `WeakMap` keyed by the frozen object. This follows the identity-passing ruling recorded in `.ai-workspace/comments/claude/20261107T020000Z_REVIEW_RC7_TRANSPORT_CLONE/README.md`. Index the implementation set's rows by digest once per set. Only the shape and digest validation (`isLeafExecutionAuthority`, the row lookup, the graph-function and input digests) is memoized. The currentness reads (`requireCurrent: true`, the CCall phase, the selected occurrence) still run on every invocation, as the register's closure requires.
- Size: M. About 60 lines changed.
- Risk: none. The checks keep the same result; only repeated work goes.
- Change class: realization_refactor
- Confidence: likely. Count `sha256Canonical` calls during one file-replace invocation to measure it.

### Nine declared Public members have no binding, and one module-source row names a missing export

- Category: failed or superseded feature
- Evidence:
  - `interaction.respond` (five members) and `witness.admit` attest, hygiene-stamp, intake and run-resumed are published in the adapter projection and schemas. They are counted in the 18/56 family check and the pinned key-set digest (`public/binding/owner_contract_source_set.ts:36-37, 690-701`). They refuse `installed_binding_unavailable` (`public/installed_definition_call_transport.ts:268-299`), which the test `t287-framework-handoff-types.test.mjs:259-310` asserts.
  - `OWNER_CONTRACT_MODULE_SOURCES` names `INTERACTION_DEFINITION_BINDINGS` (`owner_contract_source_set.ts:190`). No module exports it; the census lists it under `unresolvedNamedRoots`.
  - Requirements:
    - `specification/requirements/REQ-P-PUBLIC-CONTRACTS.md:225-238` reserves `interaction.respond` for 5.1;
    - `REQ-P-POLICY.md:235-275` reserves 031/032 for 5.1, and 035 requires the six witness acts as admitted events.
  - The read `project.read#interaction_replay` reads interactions that no bound member can create. I infer it is residue of the same reserved feature.
- Retire: an owner decision between two paths.
  - Bind the four witness acts, which 035 requires. That is unfinished work, not removal.
  - Withdraw the reserved `interaction.respond` members and the phantom module row from the 5.0 published family, and re-add them in 5.1.
- Size: L. A contract decision is needed.
- Risk: Public contract, and manifest or digest pins (`EXACT_OWNER_CONTRACT_KEY_SET_DIGEST`, the published schemas, the adapter projection).
- Change class: requirement_reprice for withdrawing the `interaction.respond` members and the phantom row; design_reframe for binding the four witness acts (realization_refactor if the ratified design already names their owner).
- Confidence: verified.

### Public members that nothing executes

- Category: test debt
- Evidence: the member scan found no executing test for `project.read` c_call_replay, continuation_replay, graph_call_evidence, graph_call_status, interaction_replay, result_evidence and run_lawful_actions. Tests name assessment_evidence, witness_evidence, workspace_gaps and `result.assess#assess` only in roster or inventory assertions. `workspace.create#imported` had no hit. Neither the default library nor the amendment witness calls any of them. All ten untested `project.read` members are served by the legacy `binding()` route (`abg/project_read_definition_bindings.ts:894`, :992-1002), so that route and its untested members form one unit.
- Retire: one lane per member through the installed CLI, or withdraw the member with its read owner.
- Size: M
- Risk: none for adding lanes; Public contract for withdrawal.
- Change class: realization_refactor for lanes; requirement_reprice for withdrawal.
- Confidence: likely. A string scan can miss a computed key; grepping the generated lane inventory would settle it.

### Consensus surface in this area waits on the owner's A5-F07 decision

- Category: failed or superseded feature
- Evidence:
  - `implementation/consensus.ts` (819 lines) is loaded by the module-path string in `gtl/consensus.ts:4937`, so the census marks it runtime. `implementation/index.ts` re-exports it.
  - `public/run_projection_authority.ts` (189 lines) has no source caller. Its only user is `m5-consensus-module.test.mjs:26-27,2099-2150`. RV4 F7 records it as a dead seam (`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/C_RETURN.md`).
  - `project.read#ticket_consensus` is bound in `product/project_read_definition_bindings.ts:1019`.
  - The RC12 retirement commits fb86974e3 and f4aad7d5e were reverted. b3bd2b113 stands, and branch `claude/rc12-consensus` is at 9c086294b. The owner decision on A5-F07 One Surface is pending.
- Retire: after the decision, retire the module, the authority seam, the read member and the consensus test together.
- Size: L
- Risk: replay digests of recorded Runs. If admitted Runs selected the consensus implementation, replay resolves `build/code/src/implementation/consensus.js` by its module path, and deleting it would break replay. It also touches the Public contract (`ticket_consensus`).
- Change class: product_reprice (owner decision).
- Confidence: verified for the state. Investigate whether any admitted Run used the consensus GTL, by searching recorded runs for its implementation reference.

### Transport still copies every serialized call, including on the CLI route where nothing else holds it

- Category: performance
- Evidence:
  - The CLI reads the file, calls `JSON.parse` (`public/cli.ts:90-102`) and hands the fresh value to `runInstalledDefinitionCallTransport` (:110-122).
  - The transport then:
    - deep-copies the acquisition (`installed_definition_call_transport.ts:389`);
    - detaches the call with one `structuredClone` of the invocation and resources (:356, inside `detachDefinitionCall` :317-364);
    - clones non-candidate input (:391).
  - Since the RC7 review the head reattaches retained product-verification values by reference (:320-362), so those identity caches survive. Only established calls skip the clone (:385-391), and only the SDK establishes calls.
  - Measured at rc.7: the 20261107 review recorded calls of 23.6 and 32.0 MB and two 20.8 MB catalog comparisons per call. The cost at head is structural, since I measured nothing.
  - Inferred from reading `cli.ts:90-122`: on the CLI route, which every governance run and the amendment witness use, the clone protects nothing, because no other code holds the parsed value.
- Retire: the CLI hands the parsed call over as transport-owned, for example by deep-freezing it once and admitting it as detached, so the transport skips the copy for that route. The isolation stays for SDK callers that pass mutable values.
- Size: S. About 20 lines.
- Risk: none. Admission is unchanged.
- Change class: realization_refactor
- Confidence: likely. `observeDefinitionTransportWork().detaches` plus a byte-size probe on one amendment-witness call would settle it.

### The Public projection payloads, including a 2.88 MB common schema, are built on every process start

- Category: performance
- Evidence:
  - `PUBLIC_PROJECTION_PAYLOADS = constructPayloads()` runs at module load (`public/binding/public_function_projections.ts:797`, builder :681). The module is runtime tier, so every CLI process builds it.
  - It builds the common schema (2,881,186 bytes as canonical JSON, the size of the published file), the operation schemas, `canonicalJson` and `sha256Bytes` over each (`projectionAsset` :610-619), and deep-freezes all of it.
  - Runtime readers of the common schema use only its `contentDigest`, `path` and `mediaType` (`definition_binding_mechanics.ts:509`, `installed_public_definition_call.ts:318`, `product/public_contract_publication.ts:217-231`). The operation assets' content is read by `product/verify_product.ts:1628` and their digests by `definition_binding_mechanics.ts:278,499`.
- Retire: build the common schema bytes lazily on first need, or let the generator pin its digest and check it at qualification. The operation assets stay as they are.
- Size: S. About 30 lines.
- Risk: manifest or digest pins. The `contentDigest` values must stay byte-identical.
- Change class: realization_refactor
- Confidence: likely; structural. Timing an `import()` of the built module would measure it (not run: build is stale).

### One schema source for the invocation contract and one authority-slot list

- Category: second owner
- Evidence:
  - The published JSON Schema builders (`public/binding/public_function_projections.ts`) and the valibot runtime schema `admittedInvocationRuntimeSchema` (`definition_binding_mechanics.ts:367`, the 13 slots inline at :401-415) state the same invocation shape twice.
  - `AUTHORITY_SLOTS` (`public_function_projections.ts:29`) duplicates `PUBLIC_AUTHORITY_SLOTS` (`shared/public_function_contracts.ts:78`); the census records a 12-line clone. The test restates the slot list again (`t287-framework-handoff-types.test.mjs:274-276`).
- Retire: `shared/public_function_contracts.ts` owns the slot list. One schema declaration produces both the published JSON Schema and the runtime validator.
- Size: M. About 100 lines.
- Risk: Public contract and manifest or digest pins if the published schema bytes change. The consolidation must reproduce them exactly.
- Change class: realization_refactor if byte-identical; otherwise design_reframe.
- Confidence: verified for the duplication; likely that one source can reproduce both.

### Implementation descriptors and leaf candidates are hand-built in every module

- Category: second owner
- Evidence:
  - Fifteen files build `packaged_leaf_implementation_descriptor` by hand (grep). Each restates `modulePath` and `namedSymbol` strings that the GTL binding also states, for example `implementation/consensus.ts:79` against `gtl/consensus.ts:4937`.
  - `implementation/semantic_stage.ts:27-31` and `implementation/semantic_revision.ts:31-33` already derive their descriptors from the GTL binding publications (with placeholder digests). That is the pattern to adopt.
  - The deterministic evidence candidate and the success and failure candidates are rebuilt in each module. The census records clones between `consensus.ts:240`, `worksite_branch_construction.ts:69` and `worksite_construction.ts:135`. `implementation/contracts.ts:28` declares the type but no constructor.
  - Dead branch inside a live function, which the census cannot see: in `semantic_revision.ts`, `evidenceCandidates` computed at :44 is used only on failure, and the spread at :49 never fires because failure returns at :45.
  - The descriptor exports are not dead. `product/implementation_resolution.ts:184-232` harvests them by shape from loaded module values (`Object.values(moduleResult.module).filter(isPackagedLeafImplementationDescriptor)`).
- Retire: descriptors derive from the GTL implementation-binding publication, the owner of `modulePath` and `namedSymbol`. One constructor in `implementation/contracts.ts` builds deterministic, success and failure candidates. Fold the dead branch.
- Size: M. About 250 lines across 15 files.
- Risk: manifest or digest pins (descriptor digests) and replay digests of recorded Runs (evidence-candidate digests). A shared constructor is safe only if it emits identical bytes.
- Change class: realization_refactor
- Confidence: verified for the duplication; likely for byte-identical consolidation.

### `release_publication.ts`: version-line literals and a misplaced owner

- Category: structure
- Evidence:
  - The release mechanics hard-code the 5.0.0 line:
    - :44 filters refs by `refs/tags/v5.0.0` and `/v5.0.0(-rc.*)?$`;
    - :59 requires `version === 5.0.0-rc.<ordinal>`;
    - :87 parses `refs/tags/v5.0.0-rc.<n>`.
  - The request already carries `requestedIdentity.versionLine` (:54).
  - The module is a release owner, not a leaf implementation, since it has no descriptor. Yet `abg/artifact_truth.ts:4`, `product/index.ts:595`, `product/project_read_ports.ts:5` and `product/release_snapshot_definition_bindings.ts:19` import it from `implementation/`.
  - Its path rules (:37-38) are covered in the confinement entry above.
- Retire: derive the ref patterns and the RC form from the request's version line. Move the module beside `product/release_snapshot_operations.ts`.
- Size: S. About 20 lines changed; the move is a rename.
- Risk: none for bytes, provided the 5.0.0 behaviour is preserved.
- Change class: design_reframe for the literals; realization_refactor for the move.
- Confidence: verified for the literals. Investigate whether the literal is an intended release-line pin, by reading the release-snapshot requirement.

### Leaf invocation port: features are branches inside one closure

- Category: structure
- Evidence:
  - `implementation/leaf_invocation_port.ts` (1,700 lines) dispatches per feature inside one closure: the forward-basis check (:675-680), the native workspace branch (:1175-1192), the command-source check (:1657-1659), and the qualification relation (:1666-1670).
  - `LeafExecutionOccurrence` (`implementation/contracts.ts`) is a bag of optional per-feature members: `nativeInstructionAssemblyBasis`, `worksiteCommandForwardBasis`, `semanticStageBasis`, `qualificationOwnerBasis`, `qualificationCatalogs`, `commandAmbientEnvironment` and `executionAuthority`.
  - This blocks the gate and descriptor consolidations above, because each feature's admission lives in the port rather than with the feature's owner.
- Retire: each feature registers its admission with its implementation binding, and the port runs the registered check generically.
- Size: L
- Risk: replay digests of recorded Runs if refusal order changes.
- Change class: design_reframe
- Confidence: likely.

### Dead residue, grouped by feature

- Category: dead code
- Evidence and groups (census tier and test count, then a grep for string use):
  - Gap authority, a superseded public start seam: `public/gap_authority.ts` (144 lines). The whole module, including `AUTHORITY_KEYS` :75, `PUBLIC_START_KEYS` :94 and `SOURCE_KEYS` :106, which the compiler reports unused. It has no source caller and no test, and `O1_TRACE.md:115` notes no constructor callers. Its `PublicStartIdentity` (`rootMode: "supervised"`) is a second shape of `public_start_identity` beside `abg/invocation_admission.ts:181,1304,1324,1343`.
  - Probabilistic leaf shape: `ProbabilisticLeafImplementation` (`implementation/contracts.ts:218`, tier none, 0 tests). `isClosedProbabilisticLeafInvocation` (`implementation/leaf_invocation_port.ts:138`, 39 lines, tier none) has one test-file hit, which I did not open; likely a name coincidence.
  - Owner-source variant never produced: the kind `direct_owner_primitive` (`public/binding/owner_contract_source_set.ts:51`, type only). `IntrinsicOwnerNativeSchemaIdentity` (`public/binding/public_function_family.ts`, package tier, 0 tests).
  - Test-only exports kept in product source: `OWNER_CONTRACT_SOURCE_MAP` (`owner_contract_source_set.ts:703`, used only by `t287-wave2-owner-contract-source-set.test.mjs:13,95,101,440`). `implementation/index.ts` (122 lines) is a barrel that neither the runtime nor the package reaches; it is used by `T/test_env/support/root-installed-environment.mjs:351` and `t287-post-binding-worksite-write.test.mjs:24`.
- Retire: delete the gap authority module and the probabilistic shape. Delete `direct_owner_primitive` from the union. Move the test-only map and barrel into test support, or have the tests import the owners directly.
- Size: S. About 330 lines.
- Risk: none. Nothing at runtime loads them, and they appear in no manifest row I found.
- Change class: realization_refactor
- Confidence: verified for gap authority, `ProbabilisticLeafImplementation`, `direct_owner_primitive` and the barrel. Likely for `isClosedProbabilisticLeafInvocation`; opening its one test hit would settle it.

### `abg.codex` is a pass-through second CLI

- Category: repository
- Evidence:
  - `public/codex_cli.ts` (77 lines) checks that `--cli` names the sibling `./cli.js`, then spawns it with `--jsonl <file>`. It adds no behaviour.
  - It is published as the `bin` entry `abg.codex` in `T/package.json` and listed in `T/test_env/qualification/inventory.json`, `recipe/expected-output-inventory.json` and `verification-recipe.json`.
  - Tests: `m5-installed-portability.test.mjs:427` (source lint only). `T/test_env/support/root-cli-environment.mjs:229` computes a `codexPath` that nothing uses.
  - `specification/PRODUCT.md:1055-1057` allows "one bounded Codex projection"; `PRODUCT.md:1233` defers parity to 5.1.
- Retire: remove the bin entry and module, or give the projection the bounded role the Product Definition names.
- Size: S. About 80 lines plus mirror rows.
- Risk: Public contract and qualification mirrors.
- Change class: requirement_reprice
- Confidence: verified that it adds no behaviour; keeping it is an owner decision.

### Published adapter metadata that nothing executes

- Category: failed or superseded feature
- Evidence:
  - `shared/public_function_contracts.ts:40-62` declares per-member adapter exit maps, published in the adapter projection (69,025 bytes). Nothing reads them at runtime (grep).
  - The exit codes actually come from `shared/effect_definition.ts:80-150` (`runExactDefinition`, codes 0, 1, 3 and 70) and from `public/cli.ts`, which exits 2 on a transport refusal.
  - The CLI parses no per-member CLI coordinate.
- Retire: one owner. Either the receipt and CLI read the adapter projection's maps, or the adapter fields are withdrawn from the published projection.
- Size: M
- Risk: Public contract.
- Change class: requirement_reprice for withdrawal; design_reframe for adoption.
- Confidence: verified that runtime does not read them. Investigate whether the published codes equal the hard-coded ones, by comparing the two tables.

### Milestone-named contract barrels `app/m04` and `qualification/m05`

- Category: design and specification
- Evidence:
  - `app/m04.ts` (10 lines) and `qualification/m05.ts` (9 lines) only re-export. They are package exports `./app/m04` and `./qualification/m05` (`T/package.json`).
  - They are pinned by the REQ-P-PUBLIC-CONTRACTS-005 rows `abg.contract.app.m04` and `abg.contract.qualification.m05` (`T/contracts/qualification/sources/REQ-P-PUBLIC-CONTRACTS.md:93-94`) and by manifest rows (`T/scripts/generate-product-manifest.mjs:715-745`).
  - Users: `t287-public-groups.test.mjs:20-21`, `t287-public-preparation.test.mjs:15,29,280,313` and `T/test_env/support/installed-qualification-conservation.mjs:13`.
- Retire: rename them by feature, or fold them into `./public` and `./validator`, in a requirement change.
- Size: S
- Risk: Public contract and manifest or digest pins.
- Change class: requirement_reprice
- Confidence: verified.

### Compiler-unused names in this area

- Category: dead code
- Evidence (compiler census, each confirmed by reading):
  - `implementation/worksite_command_helper.ts:379`: the `manifest` parameter of `assertLaunchArchiveBoundary`; the body reads only `task`.
  - `implementation/worksite_construction.ts:151`: the `task` parameter of `exactActorExchange`; the body compares against `WORKSITE_CONSTRUCTION_IDS` constants.
  - The three key arrays in `public/gap_authority.ts` are covered by the dead-residue entry.
- Retire: drop both parameters and their arguments.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified.

### The `module_export_return_exact` predicate runs outside the per-command lifetime and budget, and a throw reads as null

- Category: design and specification
- Evidence:
  - `implementation/worksite_command_helper.ts:1392-1412` imports a module from under the sandbox root (whatever the commands left there) into the helper process itself (`import(…?abi=<taskDigest>&p=<ordinal>)`, :1404) and calls its export. This is not duplication.
  - The import runs outside the owned process lifetime and its deadlines, which govern spawned commands (`createOwnedProcessLifetime`, imported at :9).
  - The task budget (`product/worksite_command_execution.ts:166`, `projectWorksiteCommandExecutionBudget`) counts command timeouts and HTTP probes only, so a module predicate has no budget of its own. A hang is still bounded from outside: `realizeWorksiteCommandExecution` requires the actor's absolute and inactivity timeouts to exceed the task budget (`implementation/worksite_command_execution.ts:623-631`), and the helper runs inside that actor tool call.
  - The `catch` at :1410 turns any throw into `observedValue = null`. A module that throws is therefore indistinguishable from one that returns null or undefined.
- Retire: run the module in an owned child process under the same lifetime, and record a throw as a distinct observation. The alternative is for the requirement to state that a null-expecting predicate cannot be declared.
- Size: M
- Risk: replay digests of recorded Runs. The predicate observation bytes would change for throwing modules.
- Change class: design_reframe
- Confidence: investigate. Check whether any declared predicate expects `null`, and whether the requirement for predicates bounds their execution time.

## Named checks

1. **Dead declarations.**
   - Confirmed: the dead-residue groups above (gap authority; probabilistic leaf shape; `direct_owner_primitive` and `IntrinsicOwnerNativeSchemaIdentity`; test-only map and barrel) and `public/run_projection_authority.ts` (waiting on A5-F07).
   - Refuted:
     - `public/index.ts`: SDK barrel, used through `@abiogenesis/typescript-tenant/public`, by `amendment-witness-run.mjs` (`load('public/index')`) and by `generate-product-manifest.mjs:608` (`nativeClosureFor("./public")`).
     - `establishExactDefinitionCall`, `establishDeepImmutability` and the SDK constructors in `public/installed_public_definition_call.ts` (package tier, many tests, used by UAT and the amendment witness).
     - `runInstalledDefinitionCallWithResource`: package tier, the SDK route for acquired calls, used by UAT and tests.
     - `observeDefinitionTransportWork` and `observeDefinitionCallWork`: observation-only §10.11 counters, read by tests (`T/test_env/support/owned-call-reference.mjs` and others).
     - Every `*_IMPLEMENTATION_DESCRIPTOR` export: harvested by shape at `product/implementation_resolution.ts:184-232`, which the census cannot see.
     - `requirement_handoff.ts` placeholder, `_jobKind` and `_jobBindingRef`: module-initialization value and destructuring discards.
   - Every other declaration in `implementation/` outside these files is runtime tier.
2. **Compiler-unused.** One entry above: `worksite_command_helper.ts:379` and `worksite_construction.ts:151`. The three `gap_authority.ts` arrays go with that module.
3. **Kinds never produced or never read.**
   - Never produced:
     - `abg_cli_transport_request` (`public/cli.ts:27`): external input, written by callers' JSONL files.
     - `direct_owner_primitive`: residue of an owner-source variant never finished.
     - `strict_object`: a valibot-internal name, external.
   - Never read: the refusal and diagnostic codes are external output that callers read. `public_outcome`, `indexed_invocation_admission_refusal`, `public_envelope_admission_refusal` and `public_family_lookup_refusal` are residue of a published envelope the runtime never produces (first entry).
4. **Second owners.** DefinitionCall admission; worksite path confinement; command-helper launch identity; installed-tree inventory; worksite leaf authority gate and row validator; invocation schema and authority-slot list; implementation descriptors and leaf candidates. The clone pairs `worksite_command_execution:395` with `worksite_file_replace:208` and `worksite_file_replace` 522 with 578 are the evidence-candidate and refusal-candidate constructors absorbed by the descriptor entry. `abg/actor_process.ts:94` with `implementation/contracts.ts:64` is a type restatement I did not pursue.
5. **Failed, unfinished or superseded.**
   - Entries above: nine unbound members and the phantom module row; unexecuted members; Consensus; unproduced envelope; adapter metadata; the `abg.codex` pass-through; the `m04` and `m05` barrels.
   - Compatibility path for an old shape: the fault-message string match at `installed_definition_call_transport.ts:496-501`, in the admission entry.
6. **Structure.**
   - Entries: leaf invocation port; `release_publication.ts` placement.
   - Over 200 lines, not listed separately: `realizeWorksiteFileReplace` (`worksite_file_replace.ts:305-641`) is mostly the gate copy and shrinks with that entry. `worksite_command_helper.ts` `main` (118 lines) and `predicateObservation` (157 lines) do not block consolidation.
7. **Performance.** Entries: installed-tree walks; per-invocation hashing; transport copies (measured at rc.7, structural at head); payload construction at load. Every cost is structural at head except the rc.7 measurement cited in the transport entry.
8. **Coverage.** Table below.

## What I did not check

- I did not run any code, so no performance figure is a head measurement.
- I did not read `implementation/consensus.ts` beyond its outline, so a dead branch inside it would be missed.
- I did not read `worksite_command_helper.ts:660-1340` (process launch, report parsing and HTTP probe) beyond the outline.
- I did not check whether recorded Runs reference the consensus implementation.
- I did not check whether the published adapter exit codes equal the hard-coded ones.
- I did not open the one test hit for `isClosedProbabilisticLeafInvocation`.
- The member scan is by string. A call built from a computed key would be missed.
- My search for `runInstalledDefinitionCallWithResource` outside `code/src`, `test_env/tests`, `test_env/support` and `test_env/uat` was stopped before it finished. A sibling consumer that embeds the SDK in process could rely on the acquired-call fault-message match, which bears on retiring it.

## Coverage

| File | Lines | How read | Findings |
|---|---|---|---|
| implementation/consensus.ts | 819 | outline and clone census | Consensus entry; descriptor entry (clones) |
| implementation/contracts.ts | 442 | full | probabilistic residue; occurrence bag (port structure); candidate constructor owner |
| implementation/default_library.ts | 140 | full | descriptor entry |
| implementation/index.ts | 122 | full | dead residue (test-only barrel) |
| implementation/leaf_execution_authority.ts | 297 | full | leaf authority gate; per-invocation hashing |
| implementation/leaf_invocation_port.ts | 1,700 | full | leaf authority gate; hashing; port structure; probabilistic residue |
| implementation/native_work_reacquisition.ts | 32 | full | descriptor entry |
| implementation/native_workspace_work.ts | 88 | full | hashing (extra authority validation) |
| implementation/qualification.ts | 102 | full | descriptor entry (its `qualificationHash` is a plain alias of `sha256Canonical`, covered by the register closure) |
| implementation/release_publication.ts | 251 | lines 1-70 and grep | release entry; confinement (its admission call at :145 is reuse, noted in the admission entry) |
| implementation/requirement_handoff.ts | 47 | full | none (census hits refuted) |
| implementation/self_conformance.ts | 36 | full | descriptor entry |
| implementation/semantic_revision.ts | 131 | full | descriptor entry (pattern to adopt; dead branch :44-49) |
| implementation/semantic_stage.ts | 173 | lines 1-60 and outline | descriptor entry (pattern to adopt) |
| implementation/worksite_branch_construction.ts | 116 | full | descriptor entry |
| implementation/worksite_command_execution.ts | 864 | lines 70-864, head by imports | confinement; helper identity; inventory |
| implementation/worksite_command_forward.ts | 48 | full | inventory (three walks per installed root) |
| implementation/worksite_command_helper.ts | 1,697 | full except 660-1340 (outline) | confinement; helper identity; inventory; predicate import; compiler-unused |
| implementation/worksite_construction.ts | 285 | lines 1-40 and 120-200 | descriptor entry; compiler-unused |
| implementation/worksite_file_replace.ts | 759 | lines 180-759, the rest outline | leaf authority gate; inventory; hashing; descriptor entry |
| public/cli.ts | 142 | full | transport copies; adapter metadata; outcome schema |
| public/codex_cli.ts | 77 | full | `abg.codex` entry |
| public/gap_authority.ts | 144 | full | dead residue |
| public/index.ts | 68 | full | none (refuted dead) |
| public/installed_definition_call_transport.ts | 517 | full | admission; transport copies; outcome schema; unbound members |
| public/installed_public_definition_call.ts | 701 | full | none beyond the refuted SDK tier (its codec comparison is the register's deliberate closure) |
| public/run_projection_authority.ts | 189 | full | Consensus entry |
| public/binding/definition_binding_mechanics.ts | 545 | full | admission; schema source |
| public/binding/owner_contract_source_set.ts | 715 | full | unbound members and phantom row; dead residue |
| public/binding/public_function_family.ts | 486 | full | dead residue (`IntrinsicOwnerNativeSchemaIdentity`) |
| public/binding/public_function_projections.ts | 797 | full | outcome schema; payload construction; schema source |
| public/binding/static_definition_bindings.ts | 177 | full | admission (owner side) |
| app/m04.ts | 10 | full | milestone barrels |
| qualification/m05.ts | 9 | full | milestone barrels |
