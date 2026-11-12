# T-292 first group: independent review

Reviewer: Claude Opus 5.5. I took no part in the work under review.

Subject: `main` at `727ec20f3`. Code, design and specification are the same at `332bfed27`, which adds one record commit. `T` means `build_tenants/abiogenesis/typescript`. Code line numbers refer to `727ec20f3`.

Each finding says which parts I read, which I ran and which I infer:

- **Read.** I read every merge diff in the brief, every Return, register entries TD-25 to TD-37, the T-292 rules and ledger, and the requirement and design sentences quoted below.
- **Ran.** I ran read-only `rg` scans of recorded data that sits outside the Writers' census roots, including the RC12 demo store, and three small Python parses of the hits. All output is under `/private/tmp/abg-review1-work/`.
- **Not run.** I ran no test file, no build and no script against the built tenant. Every lane result below comes from a Writer's or the Executive's record.

## Verdicts

| Package | Verdict | Reason |
| --- | --- | --- |
| TD-35 (`32e60ae65`) | Accept with findings | One owner now refuses a `graph_function` start under any Program that is not `direct`, on both the Product and the ABG path, as REQ-P-POLICY-013 and -023 support, with two notes (F7, F8). |
| TD-36 and follow-up (`0269c244f`, `52afade26`) | Accept with findings | The consolidated checks are at least as strict as every copy I compared and no recorded binding fails them, but the bind door refuses a narrow lawful class on register rules alone (F1). |
| TD-31 (`73e6bdba1`) | Accept with findings | No replay, reopen or re-admission path raw-admits a recorded publication, and the removed sort branch moves no recorded digest; the census missed only archived copies of the pilot publications (F6), and its accepted Public contract changes need versioning at the next cut (F10). |
| TD-37, first part (`6bda7c498`) | Accept with findings | The segment-exact owner states the C0 law (`T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md:260-266`) and nothing downstream reads `..x` as a parent step; this review closes the one census gap (F5). |
| TD-37, second part (`efa3f98c8`) | Accept | Sound: both replaced predicates equal the shared ones, and `canonicalEquals` against the owner-built manifest covers the helper checks that were dropped. |
| TD-34, first part (`78f1e3c5e`) | Accept | Sound: the owner schemas plus the three named checks equal the copy except at the five tightenings the Return lists, each backed by REQ-L-GTL3-C-ALGEBRA-004 or -007 or the owner's strict tuples, and no shipped or fixture publication reaches them. |
| TD-25, residue (`3b4a27acd`) | Accept with findings | The code agrees with the Product's 5.1 reservation and harms no store that the Writer or I scanned, but it removes 24 names from the published `abg/m03` contract group without the Public contract ruling the T-292 rule requires (F2, major; also F3, F9, F10, F11). |
| TD-60, triage (`0551268ab`) | Accept | Case 2 now asserts what library design `:649` and recovery design `:60` allow a prepared historical read to do, and the remaining exposure lies outside what the design promises to detect (doubt f). |

### Questions 1 to 5, per package

**TD-35**

1. **Whole change.** Yes, with one unlisted refusal-code shift (F7). `graphFunctionStartRefusal` (`gtl/public_start.ts:71`) is `@internal`. Its only callers are `product/execution_resolution.ts:581` and `abg/invocation_admission.ts:1153` (read).
2. **History.** No replay or reopen path calls the start law. `admitExactInvocation` is called only at run start (`owner_bindings/run_invocation.ts:950`) (read).
3. **Rulings.** REQ-P-POLICY-013 supports the ruling: "`supervised` is the default… `direct` selects one admitted entry traversal without that Product policy overlay" (`specification/requirements/product/REQ-P-POLICY.md:62-65`). So does REQ-P-POLICY-023: "When `root_mode = direct`, `start` selects one admitted entry traversal… When `root_mode = supervised`, it selects the admitted standard system program" (`:176-178`). The predicate "refuse unless the Program is `direct`" follows from "`supervised` is the default".
4. **Lanes.** The ST-1 lane failed on the old build because a `graph_function` start under the supervised Program resolved (Return section 3). `t287-c2-child-program` fails there only through the missing export (F8).
5. **Interactions.** TD-34A reran both of TD-35's lanes on its own build, with the same counts.

**TD-36 and follow-up**

1. **Whole change.** Yes, as far as I checked. I spot-checked two replacements and both are at least as strict:
   - `product/catalog.ts:468-471` now applies exact keys, exact strings, I-JSON identity and lock equality through `isWorkspaceBindingCandidateInResolvedLock` (`product/environment.ts:1208-1279`).
   - `product/materialization_operations.ts` now applies `isExactWorkspaceBinding`, which also requires exactly fourteen keys.

   The `shared/` part of the first diff only adds code: `isTrimmedNonblankNulFreeString` in `shared/admission_predicates.ts` (6 lines) and `hasExactDataFields` in `shared/admit/record.ts` (20 lines), with no line removed (read: `git diff 0269c244f^1 0269c244f -- T/code/src/shared/`). So no existing caller of a shared helper changes meaning.
2. **History.** The artifact-truth fold rebuilds every bind event through the candidate owner and the constructor (`abg/artifact_truth.ts:556`, `:570`). A recorded padded bind would therefore throw. None exists: the Writer's census covered the evidence root, and my scan covered the other roots (F4).
3. **Rulings.** The door ruling rests on register rules only (F1).
4. **Lanes.** The ledger records each lane as red on the old build at each tightened assertion. `t292-td36r-bind-door-strings` drives the bind port with three padded or NUL binds (read).
5. **Interactions.** TD-37's second part closed the helper carry-forward: the helper line is the shared predicate, and every task arm reaches `isExactWorkspaceBinding`. The generated files that conflicted with TD-47 were rebuilt on `main`.

**TD-31**

1. **Whole change.** Yes. It also deletes the `stdoRunEnvironments` sort branch in `canonicalizeModulePublication`, which the Return names. That branch can move a semantic digest only for an array with two or more entries. All 338 recorded arrays have exactly one entry (ran: I parsed the 130 files).
2. **History.** Verified under doubt b.
3. **Rulings.** The ruling that the check covers the publications resolution raw-admits, with the wider gap recorded under TD-34, rests on register rules. Validation already refused the shape (register TD-31), so the catalog, conformance and resolution doors give the same verdict as before, now at an earlier stage. The new Public refusal by `./gtl/m02` `admitModule` and `serializeModule` is named.
4. **Lanes.** Base 2 pass and 1 fail, final 3/3. This is plausible: the failing case asserts that `admitModule` refuses, and the base build admitted the value (read).
5. **Interactions.** TD-34A re-measured its drift after TD-31 (TD-34A Return section 1).

**TD-37, first part**

1. **Whole change.** Yes. The site table matches the diff.
2. **History.** No recorded path has a dotted first segment. The Writer covered the evidence root including zip files; my scan covered the other roots (F5).
3. **Rulings.** The C0 design supports the rule (doubt c, and the boundary check below).
4. **Lanes.** `t292-td37a-worksite-subject` is red on the old build at exactly its six `changed:` cases. The path-relation lane cannot load the absent owner on the old build, so it asserts vendored base forms instead (Return section 9.4).
5. **Interactions.** The second part was built on `f0e7cd739`, after this part.

TD-37 boundary check:

- The withdrawn "strictest rule wins" is replaced by the register's corrected boundary (`TECHNICAL_DEBT_REGISTER.md:379`).
- That boundary matches C0 `:260-266`: "a subject must be a strict descendant of `A.canonicalRoot` and must neither equal nor descend beneath any member of `R_protected`… Alternate spelling, `.`/`..`… refuse". The C2 design agrees at `:300-306`.
- In the owner, `pathStrictlyWithin` is the strict-descendant test, and `pathWithin` is "contained by" for territories and "equal or beneath" for protected roots.

**TD-37, second part**

1. **Whole change.** Yes:
   - The base helper's `nonempty` is character for character `isTrimmedNonblankNulFreeString`.
   - `occurrenceIdentity` equals `isNonblankString` (`shared/admission_predicates.ts:23-25`). The new owner applies it at `product/worksite_command_launch.ts:63-64`.
   - The derived members that the helper no longer checks one by one are covered by `canonicalEquals` against the owner-built manifest (read).
2. **History.** The Writer reproduced 60 recorded launch manifests byte for byte.
3. **Rulings.** Ruling 3 matches the code. The C2 design states the occurrence identities as "strings whose trimmed form is non-empty" (`T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:533`), which is `isNonblankString`.
4. **Lanes.** This is an identity package. Its differentials vendor the base copies (Return section 2).
5. **Interactions.** None.

**TD-34, first part**

1. **Whole change.** Yes. My own field-by-field comparison of the removed copy (base `owner_bindings/run_invocation.ts:249-717`) against `gtl/serialization_contracts.ts` finds no difference beyond the eight in the Return's table:
   - three that the named checks keep;
   - five tightenings at `:59`, `:68`, `:164`, `:166` and `:190`.

   The equivalences I checked: `vectorIndex`, `budget`, `bound` and `maxApplications` (safe integer against bounded integer), union against variant, the shared `jsonValueSchema` against the owner's local one, and the semantic-job stage array, which keeps `minLength(1)`.
2. **History.** The door runs only on live calls. The Writer found the same verdict for 689 recorded Catalogs and views.
3. **Rulings.**
   - REQ-L-GTL3-C-ALGEBRA-007 backs the refusal of an empty batch: "`C.batch(tasks, batchRef)` groups a non-empty ordered task family" (`REQ-L-GTL3-C-ALGEBRA.md:84-85`).
   - REQ-L-GTL3-C-ALGEBRA-004 backs the refusal of a one-term compose: it states a binary, flat `C.compose` (`:60-64`).
   - The three named door checks rest on the register rule that a stricter check moves to its owner.
4. **Lanes.** Test 1 of the new lane fails on the old build by behaviour, because all seven cases reach the owner (Return section 8).
5. **Interactions.** The package ran after TD-31, and TD-35's lanes are in its selection.

**TD-25, residue**

1. **Whole change.** Yes, as listed, apart from its contract effect: 11 value names and 13 type names leave the `abg/index.ts` barrel, and with it the published `abg/m03` contract group (F2).
2. **History.** The census covers `test_runs` and `uat/runs` (Return section 1), and the Writer replayed 11 logs with identical results. Exposure: F2.
3. **Rulings.**
   - The removal of the `abg/m03` names rests on "uncalled" inside the repository and on ruling 7, which is in the grants. No recorded ruling treats it as the Public contract change that it is (F2).
   - Ruling 4 reuses the F_H owner's message. It rests on the Product's 5.1 reservation: "Native human response and response-driven same-run resumption are reserved for 5.1" (`specification/PRODUCT.md:93-94`), restated in the F_H row at `:373`. That sentence covers the response and resume kinds. It does not plainly cover an F_H abandonment or supersession (F2).
   - REQ-R-ABG3-CONTINUATION-005 asks for "open, resolved, superseded, and abandoned termination truth" (`specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md:37`). It stays true after the package: the selected-action projection derives `abandoned` from a Run terminal or a route departure, without a `continuation_abandoned` event (`abg/construction_continuation.ts:643`, `:709-710`).
   - REQ-P-CONSENSUS-015 still requires the response chain that the 5.1 reservation defers. That conflict predates the package, and the package does not change the requirement's truth (F11).
   - Ruling 2 keeps the qualification owner-ruling leaf because TD-29 keeps the qualification Program. TD-29 is a Decision entry still waiting for the owner, so the ruling rests on the register only.
   - The kept admission entry is ruling 1 (F9).
4. **Lanes.** Four hand-built kinds are red on the old build. This is plausible, because the old fold folded them.
5. **Interactions.** It was built on `72ac59366`, before TD-37's first part, and merged after it. The Executive reran it on `main` with that part present.

**TD-60, triage**

1. **Whole change.** It touches tests only. The diff lists four test files and the Return.
2. **History.** Not applicable.
3. **Rulings.** Case 2 rests on library design `:649`, recovery design `:60` and `:66`, and the trusted-desktop boundary (`specification/PRODUCT.md:1644-1645`; native qualification design `:294-296`) (doubt f). Case 3 rests on library design section 10.12, and case 5 on section 4.4.
4. **Lanes.** The restated cases pass with the root set (Writer, and the Executive's rerun). Case 1 stays red as a registered defect.
5. **Interactions.** It was built on `a356416eb` and merged after TD-25R and TD-34A. The Executive reran it on `main`.

## Findings

There is no blocker. There is one major finding, F2, listed first.

### F2 (major). TD-25 residue: the package removes 24 names from a published Public contract group, and no recorded ruling treats that as a Public contract change

Read:

- **What was published.** On the old build (`3b4a27acd^1`), `abg/m03.ts:2` re-exports the `abg/index.ts` barrel with `export * from "./index.js"`. TD-25R removes 11 value names and 13 type names from that barrel (read: `git diff 3b4a27acd^1 3b4a27acd -- T/code/src/abg/index.ts`). Three of the values were event writers in `abg/continuation.ts`:
  - `admitContinuationTerminal` (`:79`, exported at `abg/index.ts:300`) appended `continuation_abandoned` or `continuation_superseded` with `continuationKind: "fh_interaction"`;
  - `prepareFhInteractionResponse` (`:1469`, exported at `:306`) built an `fh_interaction_responded` event (`:1511`);
  - `commitFhInteractionResponseAtExpectedPrefix` (`:1564`, exported at `:302`) appended it.

  The other removed values are `isInteractionResumeCursorSuccessorAtPrefix`, `deriveFhResumeSuccessorInput`, `deriveFhResumeSuccessorInputAtPrefix`, `prepareContinuationPublicOperation`, `projectHeldInteractionCCallOutcomeAtPrefix`, `projectFhInteractionSemanticBasis`, `projectFhInteractionSemanticBasisAtPrefix` and `resolveContinuationPublicOperationGrant`. The module `abg/fh_resume_relation` is deleted.
- **That group is Public contract.**
  - REQ-P-PUBLIC-CONTRACTS-005 requires the product to publish `abg.contract.abg.m03` at `@abiogenesis/typescript-tenant/abg/m03`, with "runtime event, admission, catalog, traversal, result, replay, continuation, and conformance contracts" (`specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md:81`, `:91`).
  - The -006 roster is a minimum: it "shall locate the named symbols" it lists (`:110-116`).
  - The manifest defines the group by its whole declaration surface. Its row in `publicContractCatalog` is a `native_typed_group` whose `declarationInventory` lists every declaration file reachable from `./abg/m03`, `abg/continuation.d.ts` and `abg/index.d.ts` included.
  - Across TD-25R that row keeps `contractVersion` `5.0.0`, while its inventory drops from 317 to 316 entries (`fh_resume_relation.d.ts` leaves) and its `contractDigest` changes from `sha256:4d56df8e867a…` to `sha256:6f6aecd8ab29…` (ran: parsed `product-toolchain-manifest.json` at `3b4a27acd^1` and at `d5c1be89a`).
- **What the records say.**
  - The T-292 rule: "A package stops and returns to the Executive if it would change the bytes of a recorded Run's replay, the Public contract, or the truth of a requirement" (T-292 ticket `:57-58` at `332bfed27`).
  - The Return says "No schema, no contract member list, no other contract file changes" (TD-25R Return `:479-480`). It asks the Executive to confirm the inventory loss as "outside `T/contracts`" under ruling 7 (`:569-571`).
  - The ledger confirms "the manifest's loss of the deleted module" and the two projectors. It sends the package to this review as "(replay)", while TD-31's schema change goes as "(Public contract)" (ticket `:95`, `:90` at `332bfed27`).
  - TD-31 shows the recorded form such a change takes. Its Return carries the Executive's ruling: "The removed `./gtl` exports and the removed optional member of `ModulePublication` are accepted" (TD-31 Return `:62-63`). TD-25R has no such line for its `abg/m03` names.
  - The removals rest on "uncalled". That is true inside the repository: at `3b4a27acd^1`, `git grep` finds no caller in `code/src` except `commitFhInteractionResponseAtExpectedPrefix` calling `prepareFhInteractionResponse` (`abg/continuation.ts:1595`). It is unproven for consumers of the published group.
  - No recorded ruling weighs REQ-P-PUBLIC-CONTRACTS-004 or those consumers. Ruling 7 is in the Writers' grants, which I could not read.
- **What happens to a store.** The fold now throws `continuation <ref> has an invalid event lifecycle` for `fh_interaction_responded`, `fh_interaction_resume_admitted`, `continuation_abandoned`, and any supersession outside three construction kinds (`abg/calculus/axioms.ts:1314-1332`). The old fold folded each of them (`axioms.ts:1314`, `:1325` and `:1356-1357` at `3b4a27acd^1`). A store written through these exports by a consumer of rc.12 or earlier would no longer reopen.
- **What covers the refusals.** The two cases differ:
  - **Response events.** Refusing them follows the Product: "Native human response and response-driven same-run resumption are reserved for 5.1" (`specification/PRODUCT.md:93-94`). The design at the subject still names `commitFhInteractionResponseAtExpectedPrefix` as a published export (F3).
  - **F_H abandonment or supersession.** No sentence I found covers refusing these. REQ-R-ABG3-CONTINUATION-005 stays true through the derived construction-continuation status (TD-25 question 3), and the requirement file defers only "the native F_H response/resume portion of CONTINUATION-011" (`specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md:23-27`).

Ran:

- My scan of the RC12 demo store `/private/tmp/abg-demo-tmp`, with the Return's pattern, finds none of the four kinds. As a positive control, the store's 1,695-line `runtime/events.jsonl` matches `"kind":"run_closed"`.

Read, not rerun:

- The Return's census searched the evidence root, `test_runs`, `uat/runs`, `test_env/proof`, `test_env/fixtures`, `test_env/evidence` and compressed archives for all four kinds. It found only construction supersessions (TD-25R Return `:30-71`).

Inferred:

- The code change agrees with the Product's 5.1 reservation, and no scanned store is harmed.
- What is missing is the Public contract ruling that the T-292 rule calls for, and a stated basis for refusing an F_H terminal.
- Stores outside the scanned roots, on this machine or elsewhere, are not covered.

What would settle it:

- **A recorded ruling.** The Executive or the owner rules on the record that these `abg/m03` names leave the Public contract, and the next cut versions the group and lists them (F10). The owner decision recorded after the subject retires the response chain (register TD-25 row at `e9bf12548`). I did not review whether it covers these names.
- **And one of these.** Either state that no consumer outside the repository used them, or fold an F_H supersession or abandonment as terminal until 5.1, which is the old behaviour.

### F1 (minor). TD-36 follow-up: the bind door refuses a narrow lawful class on register rules alone

Read:

- **The constructor.** It now refuses any authority string, ProductSet string or declared root that is not `isTrimmedNonblankNulFreeString` (`product/environment.ts:1139-1163`). It returns `invalid_declared_root`, and `bindRefusalCode` maps that code to the Public code `root_mismatch` (`product/environment_definition_bindings.ts:594-595`).
- **The bind contract.** It admits the same values:
  - each root is `absolutePathSchema`, a regex on the first character only (`shared/public_function_contracts.ts:147-150`);
  - the authority basis is checked with `isWorkspaceAuthorityBasis`, which applies `nonEmptyString` to `authorizedActorRef` (`product/environment.ts:1087`);
  - `constructWorkspaceAuthorityBasis` checks only that the length is greater than zero (`:1044-1046`).
- **What a lawful caller can produce.**
  - An actor reference with surrounding whitespace.
  - An absolute root whose last segment ends in a JavaScript-trim whitespace character. POSIX allows such a directory name; leading whitespace is impossible for an absolute path.
  - Both now pass the authority door and are refused at bind. A padded actor reference gets the code `root_mismatch`, which names the wrong cause.
- **The other doors.** The follow-up also moved the candidate owner from `isNonblankString` to the same string rule (TD-36R Return `:37`, row 5). The same class is therefore refused at four more places, each with its own outcome:
  - catalog admission returns `binding_lock_mismatch` (`product/catalog.ts:468-473`);
  - workspace status returns `not_ready` (`product/project_read_ports.ts:658-667`);
  - rehydration of a recorded binding row returns null (`abg/environment_admission.ts:393-405`, where `checkCandidate` defaults to `isWorkspaceBindingCandidate`);
  - the artifact-truth fold throws "workspace binding artifact truth requires its exact causal Product set" (`abg/artifact_truth.ts:552-566`) before it rebuilds the bind through the constructor (`:570`).

  The Return's row names these callers, but not the outcomes they now return, and it does not name the rehydration path.
- **The authority.** No requirement or design sentence requires trimmed roots or actor references. REQ-R-ABG3-BINDING-016 asks the authority basis for a "canonical root locator" (`specification/requirements/abg/REQ-R-ABG3-BINDING.md:49`), and the six declared roots are a separate field. The ledger's ruling cites TD-36's "strictest existing copy" and TD-34's "this wave loosens no Public admission". The second rule governs loosening, not this tightening.

Ran:

- None of these values occurs in the recorded data I scanned (F4).

Read, at `0269c244f`:

- `isExactWorkspaceBinding` applied the trimmed predicate itself to `authorizedActorRef` and to every root (`product/environment.ts:1290-1300`, where `exactString` is `isTrimmedNonblankNulFreeString`, imported at `:2`). So before the follow-up such a binding could be bound, and catalog admission and workspace status accepted it, but the task arms that check `isExactWorkspaceBinding` refused it (all of them at `727ec20f3`; TD-36 question 5). The follow-up moves an existing dead end to the door; it does not create a new one.

Inferred:

- A store that rc.12 or TD-36's first part admitted with such a bind would no longer reopen, because the fold throws. None exists in the scanned roots; stores outside them are not covered.

To settle it, the Executive could do one of these:

- cite a requirement or design sentence for the string rule on roots and actors, or add one;
- state the rule in the bind request contract;
- route authority-string failures to the existing `invalid_workspace_authority`, which maps to `workspace_mismatch`, so that a padded actor is not reported as a root mismatch.

### F3 (minor). TD-25 residue: the code contradicts a live ratified design sentence

Library design `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:649` says: "A complete validated prefix remains only where a named export publishes it (`commitFhInteractionResponseAtExpectedPrefix`, …)". TD-25R deletes that export. Design ranks above code, so the code now runs ahead of its design.

The Return lists the stale design passages as a residual, and TD-25S carries the repair (read). TD-25S, merged after the subject at `73eb6342b`, removes the name: `git show e9bf12548:T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` has no occurrence of `commitFhInteractionResponseAtExpectedPrefix`. I did not review TD-25S, so this is settled on `main` but unreviewed.

### F4 (note). TD-36 follow-up census scope; closed by this review

The Writer walked the evidence root `.ai-workspace` only (TD-36R Return `:84`). The fold now throws on a padded recorded bind, so I covered the other roots.

Ran:

- **The scan.** `rg -z -uuu` over `T/test_env/test_runs`, `T/test_env/uat/runs`, `T/test_env/evidence`, `T/test_env/proof`, `T/test_env/fixtures` and the RC12 demo store `/private/tmp/abg-demo-tmp`. It looked for any of the twelve binding fields whose value starts or ends with Unicode whitespace or U+FEFF, as raw characters or JSON escapes, or contains `\u0000`. The regex is in `/private/tmp/abg-review1-work/bind-regex.txt`, and I checked it against a sample with known positives and negatives.
- **The result.** It found 0 values. The only two hits were package tarballs reported as binary.
- **Positive control.** A plain `authorizedActorRef` search over the same roots finds 1,458 recorded JSON and JSONL files, among them:
  - 78 `runtime.events.jsonl`;
  - 20 `abi5-root-r*.events.jsonl`;
  - 14 `runtime-events.json`;
  - 63 `workspace-bind.request.jsonl`.

  So the scan did see bind data.

### F5 (note). TD-37 first part census scope; closed by this review

The Writer covered the evidence root, including zip files.

Ran:

- **The scan.** The same roots as F4, with the pattern `[/\\"]\.\.[^/\\".\s*]`.
- **The result.** Among recorded JSON files it finds only source-text fragments (`'/..'`, `/..)`) and range notation (`"..05"`). No path value has a dotted segment.

### F6 (note). TD-31 census missed the archived copies of the pilot publications

The Writer searched `*.json` and `*.jsonl` only.

Ran:

- **Uncompressed files.** `rg -z -uuu` over the evidence root finds the member as a JSON key in 520 uncompressed files:
  - 390 are copies of the old serialization schema;
  - 130 are the Return's data files, in eight `comments/codex` folders.
- **Archives.** 173 archives hold it:
  - 15 are `abiogenesis-fixtures-stdo-note-pilot-5.0.0.tgz`, in the same eight folders. Their member `package/build/publication.json` carries it; I confirmed this by extracting one.
  - The rest are product tarballs and source tarballs that carry the old schema.
  - `work/T287_RC5_LOCAL_EVIDENCE_01/operator-inputs.tar.gz` carries only schema seeds; I confirmed this by extraction.
- **Event logs.** No event log carries the member.
- **Other recorded data.** In `test_runs`, `uat/runs` and the demo store, the 26,876 occurrences are TypeScript declaration text embedded in recorded CLI requests (`readonly stdoRunEnvironments?: …`), or schema copies. None is a value.

The Return's conclusion stands. Its count of 338 publications in 130 files leaves out the archived package copies.

### F7 (note). TD-35: the refusal code changes for an absent handle under a non-direct Program

Read: `product/execution_resolution.ts:577-594` now runs `graphFunctionStartRefusal` before `lookupGraphFunction`.

- **Before.** A `graph_function` start with a handle missing from the CatalogView, under a supervised Program, was refused `absent`/`catalog`.
- **Now.** The same start is refused by the start law (`incompatible_or_unproven`, Public `invalid_target`).

The request is refused both before and after. The Return does not list this shift. To settle it, record it in the Return or the ledger, or run the lookup first for a handle that is absent.

### F8 (note). TD-35 lanes and the ABG guard

Read:

- `t287-c2-child-program` calls the new export directly. On the old build it fails only with "graphFunctionStartRefusal is not a function". The ST-1 lane carries the behavioural red.
- No lane drives `admitExactInvocation` with a `graph_function` start under a supervised Program. The Return says so (`TD-35_RETURN.md:151`).
- The `exactRequest !== null` term added at `abg/invocation_admission.ts:1150` adds nothing, because `exactStartTarget` (`:1074`) is non-null only when `exactRequest` is.
- Ruling 3 stays open: a stated `supervised` with a `graph_function` target against a direct Program is recorded as stated. This predates TD-35, and the Return names it.

### F9 (note). TD-25 residue: store admission and the fold disagree on `continuationKind`

Read:

- `payloadVariant` defaults the required keys to the allowed keys (`abg/event_store.ts:173-176`). So the contracts for `continuation_abandoned` and `continuation_superseded` (`:978-989`) require `continuationKind` but admit any string in it. The store also still admits `fh_interaction_responded` and `fh_interaction_resume_admitted` (`:959-977`).
- The fold refuses all four kinds, except a supersession of three kinds (`abg/calculus/axioms.ts:1314-1332`). A caller of an exported append owner can therefore admit an event that makes its own store unreadable.
- `pending_execution` passes the fold, but nothing produces a supersession of that kind.

This is ruling 1 (the kinds stay declared until 5.1). I did not check whether TD-25S, merged after the subject, changes it.

### F10 (note). TD-25 residue and TD-31: the next cut must version the Public contract changes

REQ-P-PUBLIC-CONTRACTS-004 says: "The same identity shall not resolve to different schema, symbol, semantics, or digest. Removal or semantic change requires a new version or explicit supersession" (`REQ-P-PUBLIC-CONTRACTS.md:73-77`).

The removed names are not among the symbols that -006 names (`:110-116`). That roster is a minimum, though, and the manifest's `abg.contract.abg.m03` row covers the group's whole declaration inventory (F2). At `d5c1be89a` the row still says `contractVersion` `5.0.0`, with a new digest, and `main` still carries `5.0.0-rc.12` (`T/package.json:3`, `product/contracts.ts:12`). The requirement is therefore met only if the next cut versions the group, or records an explicit supersession, and names the removed symbols.

The same holds for TD-31. The Executive accepted its removed `./gtl` exports, the removed optional member of `ModulePublication`, and the new refusal at `./gtl/m02` `admitModule` and `serializeModule` (TD-31 Return `:56-63`). Under -004, each of these is a removal or a semantic change, so each needs the same versioning at the next cut.

### F11 (note). TD-25 residue: a Consensus requirement still requires the response chain that the Product reserves for 5.1

Read:

- **The Consensus requirement.** REQ-P-CONSENSUS-015 says: "`interaction.respond` shall admit the exact actor, capability, hold, provisional unresolved result, and one decision from `accept_with_dissent | reject`; `run.continue` shall resume the same Run, admit exactly one final result, and close through the ordinary ABG path" (`specification/requirements/product/REQ-P-CONSENSUS.md:218-221`). REQ-P-CONSENSUS-018 asks the unresolved fixture to prove it (`:266-268`). The file's status line reserves only "dedicated F08/S05 qualification" for 5.1 (`:3`).
- **The reservation.** `REQ-P-PUBLIC-CONTRACTS.md:229-232` reserves `abg.operation.interaction.respond` and its five variants for 5.1, and so do `specification/requirements/README.md:93-97` and `specification/PRODUCT.md:93-94`.
- **The package's part.** TD-25R does not change the truth of -015. Before it, the Public member had no runtime binding:
  - The constitution row for `interaction.respond#{select,approve,reject,assess,answer_escalation}` says "Runtime value absent; C2-pending five exact member bindings" (`T/design/ABI5_REALIZATION_CONSTITUTION.md:1934`).
  - `git grep` at `3b4a27acd^1` finds `InteractionResponsePort` (`product/interaction_operation_contracts.ts:263`) only as an interface.
  - The removed writers had no caller in the repository (F2).

  The package removes code that a 5.1 realization might have reused.

TD-25S's Return raises the same conflict for the Executive (section 9, item 2). The owner decision is recorded after the subject; under it, the Executive's reading retires One Surface with Consensus (TD-26). Neither is part of this review.

## Answers to doubts a to g

**a. Is there a lawful binding the tightened door now refuses?** Yes, a narrow class: an actor reference with surrounding whitespace, or a declared root whose last segment ends in whitespace (F1).

How a real installation produces each field (read):

- **`workspaceId`.** It cannot be padded on the Public path, because it must equal the manifest's generated `workspace://abiogenesis/<hex>` (TD-36R Return `:68-70`).
- **Minted identities.** `authorityBasisId`, `productSetId` and `lockId` are minted by their owners.
- **Actor reference.** The caller supplies it in the authority basis, and the authority door checks only that it is nonblank.
- **Roots.** The operator declares them. The recorded sandbox and qualification bind requests declare roots under the run directory, for example `…/sandbox-uat/basic-cli/<run>/…`.

What follows:

- **Fold.** It rebuilds each bind through the constructor (`abg/artifact_truth.ts:556`, `:570`), so a store that holds such a bind would throw on reopen.
- **Recorded data.** None exists. The Writer counted 3,366 admitted bindings and 3,370 candidates in the evidence root, and my scan of the other roots found none (F4).
- **Before this package.** Since TD-36's first part, the task arms that check `isExactWorkspaceBinding` refused such a binding, while bind, catalog admission and workspace status still accepted it (F1).

**b. Does anything raw-admit the 338 recorded publications?** No. I traced every caller of `rawAdmitValue` and every user of `MODULE_PUBLICATION_SCHEMA` (read):

| Caller | Subject | When it runs |
| --- | --- | --- |
| `product/catalog_operations.ts:270`, `:279` (`constructReadyCatalog`) | caller's publications and contributions | live `catalog.admit` |
| `product/catalog_operations.ts:117` via `constructProgramValidationInputFromResolvedClosure` (`:129`) | closure publications | live run resolution (`product/execution_resolution.ts:759`) and conformance (`validator/conformance_operation.ts:207`, `:237`) |
| `owner_bindings/run_invocation.ts:281` (TD-34A door) | caller-supplied Catalog | live run calls |
| `gtl/serialization.ts:8-16` (`admitModule`, `serializeModule`) | caller value | live library calls (`./gtl/m02`) |
| `validator/qualification.ts:284`, `:301` | case values in a malformed-GTL assessment | qualification over authored cases |
| `validator/conformance_operation.ts:44`, `validator/conformance_definition_bindings.ts:199` | conformance packet | live `conformance.evaluate` |
| `abg/traversal_route.ts:4085`, `:4126`; `abg/worksite_input_provenance.ts:351`; `abg/registered_selection_provenance.ts:88`; `product/declaration_application.ts:188`; `product/run_invocation_operation.ts:730` | `invocation_input` | live input admission; none passes a publication |
| `validator/raw_admission.ts:92`; `gtl/serialization_contracts.ts:216`, `:230`, `:263` | schema definitions | none |

Replay and reopen sites see publications only through `modulePublicationSemanticDigest` (`product/publication.ts:5-19`), which canonicalizes and hashes without admission.

The removed sort branch cannot move a recorded digest, because all 338 recorded arrays have exactly one entry (ran). No event log anywhere I scanned carries the member (F6).

**c. Does anything downstream treat `..x` as a parent step, or let it escape?** No.

Read:

- **Remaining dot-dot checks.** Every one is segment-exact:
  - `product/stdo_environment.ts:34`;
  - `product/verify_product.ts:1023`, `:2042`;
  - `product/declaration_exports.ts:323`;
  - `product/worksite_effect.ts:611`, `:1860`;
  - `product/semantic_job.ts:52`;
  - `product/worksite_command_execution.ts:837`, and `:1280` (`hasParentPathSegment`, a `..` token bounded by separators);
  - `abg/stdo_environment.ts:44`, `:68`;
  - `abg/governed_context.ts:106`, `:833`;
  - `implementation/release_publication.ts:39`.

  No `startsWith("..")` remains. `declaration_exports.ts:462`, `:880` and `:2301` test `startsWith(".")` on module specifiers and export keys, not on worksite paths.
- **Pattern matching and exclusion lists.** No minimatch, picomatch or glob library appears in `code/src`, and no exclusion list filters by a leading dot.
- **Downstream consumers.**
  - `normalizeWorksiteRelativePath` (`product/worksite_effect.ts:598-622`) refuses backslash, NUL, absolute paths and `..` segments, and admits `..x`.
  - The helper's inventory has no name filter.
  - `productDelta` territory matching uses `withinRelativeRoot`, a prefix test against `root/` (`product/worksite_command_execution.ts:1260-1264`), so `..x/f` matches a territory only when it really lies under it.
  - Archive path digests hash the relative string, where `..x` is an ordinary name.
- **Escape.** `resolve(root, "..x")` is `root/..x`. A string such as `..x/../../y` carries `..` segments and is refused by the segment checks. `classifyPathRelation` (`shared/path_confinement.ts:18`) sees only the normalized output of `relative()`, so its result is `../y`, which is outside.

Ran: no recorded path has a dotted segment (F5).

**d. Does any shipped or fixture publication hit the three new refusals, and does verdict or cost change?** No publication hits them, and the verdict for a well-formed Catalog is unchanged.

Read:

- **One-term compose and empty batch.** The C-algebra owner refuses them (`gtl/c_algebra.ts:276-301`: "C.compose requires at least two terms", "C.batch requires a non-empty ordered task family"). `cCompose` collapses zero or one term into identity or the single term (`:455-475`).
- **Fixture literals.** The three literal `c_compose` terms in `test_env/fixtures/developer-mini-product/src/index.ts` have four, four and eight top-level terms (ran: a bracket count).
- **Tuples.** Every literal `eventKindRefs` and `authorities` tuple in `code/src` and `test_env/fixtures` has the exact length: four for `run` scope, three for `graph_call` scope, four authorities.
- **Shipped publications.** The ten shipped publications are not raw-admitted when they are generated. Every Catalog a caller can pass through the CLI is the output of `catalog.admit` (`constructReadyCatalog`), which raw-admits each publication with the owner's `MODULE_PUBLICATION_SCHEMA` (`product/catalog_operations.ts:270-285`). The door applies that same schema plus the copy's three rules, so a Catalog the product built keeps its verdict.
- **Recorded Catalogs.** The Writer ran both doors over 689 distinct recorded Catalogs and views with no verdict change.
- **Cost.** The copy's `v.lazy(() => v.union([...]))` built a new seven-way union, with six fresh strict objects, at every nested term, and tried its options in order. The owner's lazy getter returns one prebuilt `v.variant` keyed on `kind`. Per-term work therefore falls. Two things add work:
  - the three `v.check` pipes, which are linear in declarations, policies and stages;
  - each semantic-job stage, which `STAGE_SCHEMA` now checks twice (owner, then `isSemanticStageDeclaration`).

  I infer that the net cost on a CLI call is lower, but I did not measure it.

**e. Can a lawful 5.0 history hold a supersession with another kind, or with no kind?**

- **No kind.** No. `continuationKind` is required at store admission (`abg/event_store.ts:173-176`, `:984-989`).
- **Another kind.** Only through the removed `admitContinuationTerminal`, which wrote `fh_interaction` and was published through `abg/m03` (F2), or through a direct append, which the store contract admits with any string in the field (F9).
- **Current producers.** The live producers emit only two kinds:
  - `abg/construction_continuation.ts:591` emits `construction_intent`;
  - `:845` emits `selected_action` with `constructionIntentRef`.
- **Recorded stores.** The Return's census of the evidence root, `test_runs`, `uat/runs` and archives finds 28 supersessions, all of those two kinds, and no F_H use. The register's refutation pass adds `test_env/proof`, `test_env/evidence`, `uat/runs` and the live RC12 Run. My scan of the RC12 demo store finds none of the four kinds (ran; F2).
- **`pending_execution`.** The fold allows it, but no supersession of that kind is produced (F9).

**f. Is the prepared-read behaviour ratified, how long does a prepared read live, and what is the exposure?**

The behaviour is ratified:

- Library design `:649`: "`readOwnedRuntimeEventPrefixAtDurablePrefix` is the explicit fresh read: it borrows only an actively owned selection, and a copied or closed-owner coordinate is authenticated cold. `projectOwnedRuntimeEventPrefixAtDurablePrefix` and `projectOwnedPrefixArtifactTruth` are pure historical projections: the exact coordinate's retained immutable authenticated selection serves them after its owner closes, and an unbound or copied coordinate is authenticated cold."
- Recovery design `T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md:60`: "A caller that separately retains the authenticated owner prefix or validated snapshot keeps its existing immutable post-close reads and preparation callbacks; close does not purge that evidence."
- The same design at `:66`: "Internal prefix consumers borrow this private history selection and current facts. … Portable close detachment, explicit fresh reads, physical mutation uncertainty, append/fsync/rollback and the one-writer law remain unchanged."
- Native qualification design `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md:294-296`: "The trusted-desktop boundary does not require rehashing unchanged prior bytes for hostile same-length mutation." The Product lists "hostile-workstation resistance … on the trusted-desktop boundary" among what 5.0 does not include (`specification/PRODUCT.md:1614-1616`, `:1644-1645`).
- REQ-R-ABG3-PROJECTION-025 allows reuse "under their exact subject, basis, scope, provenance and validity conditions… preserving required checks at actual acquisition".

Exposure (read). A prepared read object lives for one call. Three sites prepare and project in the same function (`abg/project_read_ports.ts:614-621`, `:951-955` and `:1840-1844`). `prepareRunReadAtDurablePrefix` (`:981`, through `prepareRunRead` at `:1008`) has two callers in `code/src`: the population at `abg/project_read_definition_bindings.ts:715`, which never projects, and `runReadKernel`, which prepares at `:837` and projects at `:867`, synchronously, between `acquireAbgEventResource` and `finishRunRead`. It is not a published export: `abg/index.ts` does not name it, and the case 2 test imports it from the build path. The CLI runs one request per process (`public/cli.ts:88-125`). The authenticated selection behind a read lives as long as its exact coordinate object: it is held in the `durableHistoryDerivations` WeakMap (`abg/event_store.ts:1769`), and the read-owner caches are WeakMaps too (`abg/project_read_ports.ts:574-575`). While the owner is open, the explicit fresh read borrows the active selection without touching the file, as the design says it does: `readOwnedRuntimeEventPrefixAtDurablePrefix` (`abg/event_prefix.ts:99-102`) calls `readOwnedRuntimeHistoryAtDurablePrefix`, which returns `DurableHistoryDerivation.activeSelection` whenever the owner is open (`abg/event_store.ts:3636-3640`, `:1808-1814`), and `requireCurrent` compares the coordinate digest, not the bytes. The maintained SDK setup holds one event resource for its whole session and borrows its selection for every history-dependent call (library design `:649`). So a byte changed inside the authenticated prefix, in a row the history keeps in memory, goes unseen for one call on the CLI and for as long as an SDK caller holds the resource, fresh reads included. A row read again lazily by location is checked against its own digest, and no read of a coordinate looks at bytes beyond its prefix. Only a cold read detects the change, and a cold read happens only for a closed-owner or copied coordinate, or on reopen. Case 2's last check (`test_env/tests/t287-cross-cut-public-read.test.mjs:212`; `:208` in the Return, numbered at `a356416eb`) detects the change for that reason: it prepares again after the owner has closed. Under the one-writer law such a change comes from outside the product: tampering, media corruption or an accidental edit. The trusted-desktop boundary leaves hostile same-length mutation outside 5.0 (the Product and design sentences above). For corruption or an accidental edit, the design says only that "physical mutation uncertainty" remains unchanged (recovery design `:66`). No recorded sentence promises earlier detection, so TD-60T stays at accept.

**g. Does any diff weaken a check without the Return saying so?** I found none. What I checked (read):

- **TD-34A.** Field by field: equal apart from the named five tightenings.
- **TD-36.** The catalog and materialization replacements are stricter.
- **TD-37B.** Both predicates are equal to the ones they replace.
- **TD-25R `abg/effectful_invocation_truth.ts`.** It no longer pushes F_H facts. Any F_H operation now refuses the whole history as an orphan (`abg/fh_continuation_projection.ts:330-332`, `:473-477`), which is stricter.
- **TD-25R, `responded` status.** It leaves `canonicalRunContext` (`abg/project_read_ports.ts:881`), consistent with the fold refusing `fh_interaction_responded`.
- **TD-37A.** The widening is the stated claim. On win32 the owner refuses more, and the register names this.
- **TD-31.** The deleted sort branch is named, and inert on recorded data.
- **Removed public names.** I scanned each of the other seven merges for removed top-level `export` declarations and for changed barrel files (ran: `git diff` of each merge against its first parent).
  - Only TD-31 removes a name from a barrel, at `gtl/index.ts:6`, and the Executive accepted that (TD-31 Return `:62-63`).
  - TD-36R removes the top-level export `exactWorkspaceBinding`, which no barrel re-exported.
  - TD-25R's removals are F2.

Unlisted refusal-outcome changes, not weakenings: F7 (TD-35), and the `root_mismatch`, `binding_lock_mismatch`, `not_ready` and null outcomes in F1 (TD-36R).

## What I did not check

- **Lanes and red-on-base.** I ran no lane, differential or build. Every red-on-base and pass count above comes from a Return or the ledger.
- **TD-36 copies.** I did not re-derive all fourteen source files of TD-36's first part. I compared the catalog and materialization replacements only, not the `worksite_effect.ts`, `worksite_construction.ts`, `leaf_execution_authority.ts` and `worksite_command_execution.ts` copies.
- **Shipped publications.** I did not run the owner schema over the ten shipped publications. Doubt d rests on their constructors, the C-algebra owner and the recorded `catalog.admit` calls.
- **Zip and other stores.** I did not search zip archives for `stdoRunEnvironments` or padded binding values. I did not search stores outside the roots named in F4 and F6, such as other repositories' installs or other `/private/tmp` trees.
- **Launch manifests.** I did not scan the launch manifests under `test_runs` (TD-37B). Because the owner equals every copy over the Writer's differentials, I infer they reproduce too.
- **TD-60 triage.** Beyond the Return and the case 2 design sentences, I did not check cases 1, 3, 4 and 5; I did not reread section 10.12 or section 4.4.
- **TD-37A win32 cells and TD-34A performance.** Not checked.
- **The Writers' grants.** They hold rulings 1 to 9 and are not in the work folder. I judged rulings from the ledger, the register and the Returns.
- **After the subject.** `main` has moved to `e9bf12548`. It merges TD-25's second part (`73eb6342b`) and records an owner decision of 2026-11-12 on the register's retirements; that record lists TD-29 as still open. I did not review either. F2, F3, F9 and F11 mention them as facts only.
