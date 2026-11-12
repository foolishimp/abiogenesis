# TD-78 trace: a Run driven by Product bytes other than the bound Product

**Answer (run).** Admitted: build B's CLI (current source `21c108af0`, product content digest `sha256:060b0259…`) admits and completes a `run.invoke#start` on a store that 5.0.0-rc.12 (`sha256:dcfbcf42…`) installed and bound, and rc.12's CLI does the same on a store bound by B; the only refusal, `invalid_definition_call` from `selectedCallable` (`public/installed_definition_call_transport.ts:261-266`), refuses a request that carries the other build's definition digests, on either store; `run.continue#current_intent` is not driven, because the only path to a pending execution dispatches an actor.

Each statement is marked **run** (observed in this experiment) or **read** (from source). Source lines are B's source at `21c108af0`. Every cited source file is unchanged at main `347babbe6` (run: `git diff` between the two commits is empty for them).

**Scope of the read (read).** One owner module, `owner_bindings/run_invocation.ts`, serves both `run.invoke` and `run.continue`. Its exported bindings, `RUN_DEFINITION_BINDINGS` (`:1906-1909`: `invoke`, `start`, `current_intent`, `selected_action`), are not wrapped with `withAdmissionAuthority`. That wrapper is what runs `checkExecutingOwner` (section 9).

On this path the executing identity is used in two places, and neither compares it with the bound lock:
- `prepareRunQualificationResources` (`product/run_invocation_operation.ts:545-547`) loads the executing package's own qualification rule catalog for qualification inputs.
- At Run admission, each Catalog application the Run carries is reconstructed against the executing manifest (section 9). The hello Run carries none, so this use is untested.

By reading, a continuation meets the same doors as a start. This is untested by run.

## 1. Builds and identities

| | A | B |
| --- | --- | --- |
| Origin | The immutable install `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12`, package `node_modules/@abiogenesis/typescript-tenant`. Source commit `95da94e72`, from its `CUT_RECORD.json`. | A copy of `build_tenants/abiogenesis/typescript` at `21c108af0`, without `test_env/test_runs`, `test_env/downstream` or `test_env/evidence`. Built with `npm run build` and packed with `npm pack` in `/private/tmp/abg-td78-work/B/typescript`. |
| Product id | `product://abiogenesis/typescript-tenant@5.0.0-rc.12` | the same |
| Package name and version | `@abiogenesis/typescript-tenant` `5.0.0-rc.12` | the same |
| Product content digest | `sha256:dcfbcf4268a08efb15616507fb74bdc19fb0bb504342cd56b3df5dd5bf1fd106` | `sha256:060b02590b8fbd3d44c22f49d4397ea78dbfbe664b3a659fc64a2fabc157b030` |
| Toolchain manifest digest | `sha256:644edeccc157dd7daf36463237ddd22f4fb4063ff4ba50c72e6b32218f3ba3d3` | `sha256:16fa37b31a7c6bf14d89883b244c698ead1777e9b4ac7b0c8ac75e6652b55766` |
| Artifact digest (packed `.tgz`) | `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca` | `sha256:71210debb6e6f3811a5eafbf25179611661ffc37fc645c8b1d56a15ea4128f5d` |
| Public contract catalog digest | `sha256:a67e743c…` | `sha256:0fa17427…` |
| CLI | the install's `build/code/src/public/cli.js`, cwd `/private/tmp/abg-td78-work/tmp` | the copy's `build/code/src/public/cli.js`, cwd the copy's package root |

All rows of this table are run.

B's built `product-toolchain-manifest.json` is byte-equal to the committed one (5,319 locators). B's pack holds 5,321 entries (10,993,680 bytes). Node is v24.7.0 and npm is 11.5.1. All run.

Each build computes its own definition digests (run):

| Coordinate | A | B |
| --- | --- | --- |
| `run.invoke#start` definition digest | `sha256:967161365de4…` | `sha256:5e72ba65f3bb…` |
| `run.invoke#start` operation-contract asset | `sha256:56f05479…` | `sha256:79e10dbb…` |
| `run.continue#current_intent` definition digest | `sha256:29951c80…` | `sha256:27296132…` |
| `project.read#run_status` definition digest | `sha256:27725def958c…` | `sha256:7a10c7d0fa56…` |
| `project.read#run_status` operation-contract asset | `sha256:a7949acc…` | `sha256:bcfce2c2…` |
| common public-operation schema asset | `sha256:0f50e23ae28d…` | `sha256:183744352040…` |
| event contract digest on rows | `sha256:51299706…` | equal |

The two builds share product id, package name and version. The `wrong_owner` checks compare installs with `ABI5_PRODUCT_ID`, `ABI5_PACKAGE_NAME` and `ABI5_PACKAGE_VERSION` (`product/execution_resolution.ts:796-801`, `:854-860`). They therefore cannot tell the two builds apart. They also apply only to graph edges that carry an `inputBinding`, and the hello Program has none. (Read; run: `inputBinding` occurs 0 times in the Program source.)

## 2. Credentials removed

- (run) Every command runs through `/private/tmp/abg-td78-work/scripts/cleanenv.sh`. That script runs `/usr/bin/env -i`, which unsets every inherited variable, and sets only these:
  - `PATH`: a scratch bin with `node`, `npm` and `npx` links, then `/usr/bin:/bin:/usr/sbin:/sbin`;
  - `HOME` and `TMPDIR`, both under `/private/tmp/abg-td78-work/`;
  - `LANG`;
  - four `npm_config_*` settings: a cache in the work directory, and no update notifier, fund or audit.
- (run) The parent environment has none of `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN`, `OPENAI_API_KEY` or any `ABG_*` variable.
- (run) The parent does carry these Claude Code session variables, and no command has them: `CLAUDE_CODE_BRIDGE_SESSION_ID`, `CLAUDE_CODE_CHILD_SESSION`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_EXECPATH`, `CLAUDE_CODE_MESSAGING_SOCKET`, `CLAUDE_CODE_MESSAGING_TOKEN`, `CLAUDE_CODE_SESSION_ATTENDED`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_EFFORT`, `CLAUDE_PID`, `CLAUDECODE`.
- (run) The setup and attempt drivers refuse to start if any variable outside the allowlist is present. macOS adds `__CF_USER_TEXT_ENCODING`, which the allowlist admits.
- (run) No step reads a keychain or credential file.
- (read) `product.install` runs `npm install --bin-links=false --ignore-scripts --no-audit --no-fund --offline --package-lock=true <artifact>` (`product/install_product.ts:53-77`).
- (run) No row in either store has an actor, process, worker, native-dispatch or provider kind, from setup or from any attempt.
- (run) Writes land only in `/private/tmp/abg-td78-work/` and in this file:
  - (read) The event-store append lock directory is `join(tmpdir(), "abiogenesis-event-store-locks-v5")` (`abg/event_store.ts:1594-1598`). (run) It resolves under the work directory's `tmp/`.
  - (run) npm logs are in the work directory's `npm-cache/_logs`.
- (run) A's install root hashes the same before and after the experiment: 5,916 members, tree sha256 `c01d6383…`. So does A's release root `~/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12`: 5,922 members, `36cf9972…`.
- (run) `git status` in `/Users/jim/src/apps/abiogenesis` shows no tracked change.

## 3. Program

The Program is the language-smoke hello in `test_env/fixtures/language-smoke/`.

- (read) It is the Program the steel CLI lane drives by default (`test_env/support/root-cli-environment.mjs:203`).
- (run) It is a consumer-owned Product, `product://abi5-tests/language-fixtures@5.0.0`. Its one graph function has one F_D leaf: `render` in `build/leaf.mjs`, which returns `Hello <subject>`. It is deterministic code and calls no actor and no model.
- (run) Neither Product ships a hello Program of its own: no file under B's `code/src` or A's `build/code/src` mentions one.
- The fixture files come from A's source commit `95da94e72`:
  - (read) rc.12's semantics provider check requires `evaluateInteractionResponse` (rc.12 `product/semantics.js:164`). The current fixture, since `de96441a9`, no longer exports it.
  - (run) B admits the same fixture source (setup B).
- (run) The fixture package depends on the ABI archive of the build that sets the store up. Each fixture install therefore holds a copy of that build's ABI package.

## 4. Setup requests and outcomes

### Store A, bound by A

(run) Every CLI step uses A's CLI. The requests are in `/private/tmp/abg-td78-work/setupA/requests/` and the outcomes in `/private/tmp/abg-td78-work/setupA/outcomes/`.

| Step | Operation | Exit | Outcome | Log rows |
| --- | --- | --- | --- | --- |
| 01 | `product.verify`, ABI artifact | 0 | result, `locally_verified` | 0→0 |
| 02 | `product.verify`, fixture artifact | 0 | result, `locally_verified` | 0→0 |
| 03 | `product.resolve` | 0 | result: lock `product-lock://abiogenesis/19b940f9…`, with ABI row `dcfbcf42…` and fixture row `ddb240ff…` | 0→0 |
| 04 | `product.install`, ABI, into `liveA/installed-0` | 0 | result, `materialized` | 0→1 |
| 05 | `product.install`, fixture, into `liveA/installed-1` | 0 | result, `materialized` | 1→2 |
| — | workspace create, in process through A's `product` module, as the steel lane does | — | created | no row |
| 06 | `workspace.bind` | 0 | result: binding `workspace-binding://abiogenesis/6fbcdd90…` | 2→3 |
| 07 | `catalog.admit`: the ten toolchain module publications and the fixture's | 0 | result | 3→3 |
| 08 | `run.invoke#start` | 0 | result, `completed`: Run `run://abiogenesis/1cac852a…` | 3→34 |
| 09 | `project.read#run_status` | 0 | result, `closed` | 34→34 |

Store A at rest (run):
- log: 3,301,012 bytes, 34 rows, sha256 `e27dffc1…`, last row `run_closed` (`4a5b8398…`);
- log file: device 16777231, inode 816946303;
- tree: 11,862 members, sha256 `ed284243…`.

(run) A refuses a `catalog.admit` that carries only two publications, worksite construction and the fixture's. The code is `conservation_failure` at `/contributionManifests`. The record of that first setup is at `/private/tmp/abg-td78-work/logs/setupA-attempt1-conservation-failure/`. The setup above supplies all ten module publications that the toolchain's contribution manifest binds, checked by semantic digest, plus the fixture's.

### Store B, bound by B (for the reverse)

(run) The same steps run with B's CLI, with cwd B's package root. All nine CLI steps exit 0, with the same outcomes and row counts as store A.

- lock: `product-lock://abiogenesis/5d92379a…`, with ABI row `060b0259…` and fixture row `d81db524…`;
- binding: `workspace-binding://abiogenesis/ad5aa3ef…`;
- Run: `run://abiogenesis/b0205c2b…`;
- log: 3,292,062 bytes, 34 rows, sha256 `80e3a616…`, last row `run_closed` (`0d611c1a…`), inode 818123364;
- tree: 11,848 members, sha256 `dc7cb602…`.

### Fresh copies

(read) A store's identity binds the event log's device and inode together with the event contract digest (`DurablePrefixCoordinate.storeIdentity`, `abg/event_store.ts:1305-1316`). A copy at another path or inode is therefore another store.

(run) So every attempt runs at the same live path, after `restore.mjs` has done three things:
1. rsync every non-log file from the pristine copy;
2. truncate the log in place to its pristine length;
3. check that the inode is unchanged and that the log and the whole tree hash equal to the pristine copy.

Every attempt below starts from a passing check, recorded in `/private/tmp/abg-td78-work/logs/restore-*.json`.

## 5. Control

(run)
- **C1:** A starts the same Program again on a fresh store A. The Run completes and appends 31 rows (34→65).
- **C2:** A reads `run_status` of the setup Run. It is `closed`, and no row is appended.
- **R0** (the reverse control): B starts again on a fresh store B. The Run completes and appends 31 rows.

## 6. Attempts

Outcomes, exit statuses, log sizes and rows are run. Refusing owners are read.

- **Outcome:** for an admission, the owner outcome and disposition or status. For a refusal, the transport code.
- **Log before → after:** bytes, rows, and the last row's sha256 prefix.
- **Request built by:** the build whose SDK produced the request. A replay sends another attempt's request unchanged.

| Attempt | Operation | CLI (executing build) | Store bound by | Request built by | Outcome | Exit | Rows appended | Log before → after | Refusing owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | `run.invoke#start`, control | A | A | A | `result`, `completed` | 0 | 31 | 3,301,012→3,405,760 B; 34→65; `4a5b8398`→`1e6bf699` | — |
| C2 | `project.read#run_status`, control | A | A | A | `result`, `closed` | 0 | 0 | 3,301,012 B, 34, `4a5b8398`, unchanged | — |
| B1 | (i) `run.invoke#start`; B re-admits the Catalog over A's recorded readiness basis | B | A | B | `result`, `completed` | 0 | 31 | 3,301,012→3,405,760 B; 34→65; `4a5b8398`→`01e9bd97` | none |
| B2 | (i) `run.invoke#start`; A's recorded Catalog | B | A | B | `result`, `completed` | 0 | 31 | 3,301,012→3,405,765 B; 34→65; `4a5b8398`→`10974ecf` | none |
| B6 | (i) B1 repeated, then a hash check of the store outside the log | B | A | B | `result`, `completed` | 0 | 31 | 3,301,012→3,405,756 B; 34→65; `4a5b8398`→`45218d26` | none |
| B3 | (i) with A's digests: C1's request replayed to B's CLI | B | A | A | `invalid_definition_call` | 2 | 0 | 3,301,012 B, 34, `4a5b8398`, unchanged | B: `selectedCallable`, `public/installed_definition_call_transport.ts:240`, refusal `:261-266`, through `admitExactDefinitionCall`, `public/binding/definition_binding_mechanics.ts:433` |
| (ii) | `run.continue#current_intent` | — | — | — | not driven (section 8) | — | — | — | — |
| B4 | (iii) `project.read#run_status` of the setup Run | B | A | B | `result`, `closed` | 0 | 0 | 3,301,012 B, 34, `4a5b8398`, unchanged | — |
| B5 | (iii) with A's digests: C2's request replayed to B's CLI | B | A | A | `invalid_definition_call` | 2 | 0 | 3,301,012 B, 34, `4a5b8398`, unchanged | as B3 |
| P1 | `project.read#run_status` of B1's Run, on the store as B1 left it | A | A | A | `result`, `closed` | 0 | 0 | 3,405,760 B, 65, `01e9bd97`, unchanged | — |
| P2 | the same read, by B | B | A | B | `result`, `closed` | 0 | 0 | 3,405,760 B, 65, `01e9bd97`, unchanged | — |
| R0 | `run.invoke#start`, reverse control | B | B | B | `result`, `completed` | 0 | 31 | 3,292,062→3,396,812 B; 34→65; `0d611c1a`→`ea5bc88f` | — |
| R1 | reverse (i): `run.invoke#start`; A re-admits the Catalog over B's readiness basis | A | B | A | `result`, `completed` | 0 | 31 | 3,292,062→3,396,808 B; 34→65; `0d611c1a`→`bad22efb` | none |
| R2 | reverse (iii): `project.read#run_status` of B's setup Run | A | B | A | `result`, `closed` | 0 | 0 | 3,292,062 B, 34, `0d611c1a`, unchanged | — |
| R3 | reverse with B's digests: R0's request replayed to A's CLI | A | B | B | `invalid_definition_call` | 2 | 0 | 3,292,062 B, 34, `0d611c1a`, unchanged | A: `selectedCallable`, built `public/installed_definition_call_transport.js:103`, refusal `:113-115` |
| R4 | A's digests on B's own store: R1's request replayed to B's CLI | B | B | A | `invalid_definition_call` | 2 | 0 | 3,292,062 B, 34, `0d611c1a`, unchanged | as B3 |

**Exact outcomes (run).**
- Every admitted attempt has:
  - transport kind `installed_definition_call_transport_result`;
  - receipt exit code 0;
  - owner `outcomeKind` `result`;
  - code null, and no message.
- Every refused attempt has:
  - transport kind `installed_definition_call_transport_refusal`;
  - code `invalid_definition_call`;
  - message "DefinitionCall differs from its exact installed invocation contract";
  - no receipt.

**Other observations.**
- (run) In B1 and R1 the executing build's client-side steps all pass over the other build's store:
  - it projects the store's workspace environment (`projectExactPrefixWorkspaceEnvironment`);
  - it re-admits the Catalog, which comes out equal to the recorded Catalog;
  - it narrows the view and populates the start call.
- (run) B1 and B2 send byte-identical requests (sha256 `c3445df3…`), so both name the Run `run://abiogenesis/32b5de33…`. Event times are sampled from the clock, so the two logs differ by 5 bytes.
- (run) Every attempt leaves both installs hash-equal to their state before it. After B6, `installed-0`, `installed-1`, `workspace` and `fixture` all hash equal to the pristine copy. An admitted Run changes only the event log.
- (read) The refusal in B3, B5, R3 and R4 happens before the owner runs and before any store access:
  - `invokeInstalledDefinitionCall` (`public/installed_definition_call_transport.ts:481-486`) calls `selectedCallable` first.
  - For serialized CLI ingress, `admitExactDefinitionCall` must then admit the call. Its strict schema fixes `definitionDigest` to the executing definition's digest (`public/binding/definition_binding_mechanics.ts:394`). It also fixes the invocation, request, result and refusal contract coordinates to the executing build's assets (`:518-529`).
- (run) The refusal depends on the request's digests, not on the store. B's CLI refuses A's digests on store A (B3) and on store B (R4).

## 7. What the appended rows record

(run) B1 appends 31 rows of the same kinds, in the same order, as C1:
- `public_operation_admitted`, `invocation_admitted`, `implementation_admitted`, `basis_admitted`;
- `run_segment_opened`, `graph_call_opened`, `frame_opened`;
- the traversal and `c_call_*` rows;
- `terminal_reached`, `frame_closed`, `graph_call_closed`, `run_closed`;
- `runtime_activity_probe_observed` rows between them.

The rows carry the setup rows' `eventContractDigest` (`sha256:51299706…`) and `workflowVersion` `5.0.0`. They name store A's binding, lock and fixture install, with the same counts as C1.

- **The executing build appears only as its definition digest (run).** B's `run.invoke#start` digest `5e72ba65…` is in two places: `public_operation_admitted.payload.definitionDigest` and `invocation_admitted.payload.capabilityGrants[0].definitionDigest`.
- **The only toolchain identity in the rows is the bound one (run).** `invocation_admitted.payload.capabilityGrants[0].operationContract` names A's contract catalog: `catalog://abiogenesis/typescript-tenant/public-contracts@5.0.0-rc.12`, catalog digest `a67e743c…`, product content digest `dcfbcf42…`. It also names A's `run.invoke#start` contract asset `56f05479…`.
  - None of B's identities appears in any row: not its product content digest, toolchain manifest digest, artifact digest or contract catalog digest.
  - `implementation_admitted` names the fixture Product, `build/leaf.mjs` and `render`. Nothing in it names the toolchain that runs the leaf.
- **The request carries both identities, and the rows keep only the bound one (run).**
  - The request's `invocation.contractCatalog` names B's catalog (`0fa17427…`, content digest `060b0259…`).
  - Its `invocation.invocationAuthority.slots.product_set[0]` names the bound install `product-install://@abiogenesis/typescript-tenant/5.0.0-rc.12/dcfbcf42…/19b940f9…`.
  - The door admits the request with the two unequal, and B's catalog does not reach the log.
  - The request carries no `admissionAuthority` and no `ownerArtifact`. The `workspace.bind` request carries both.
- **One process runs both builds' bytes.** The leaf imports `@abiogenesis/typescript-tenant/product`.
  - (run) Node's ESM resolver, run from the leaf's installed path, resolves that import to the rc.12 copy inside the fixture install: `liveA/installed-1/node_modules/@abiogenesis/typescript-tenant/build/code/src/product/index.js`.
  - (run) Both installs' toolchain manifests carry `dcfbcf42…`.
  - So the leaf that B's runtime executes in B1 loads rc.12's `product` module. The resolution is run; the load itself is not traced.
- **The store now disagrees with its bound lock (run).**
  - The lock, both installs and the binding are unchanged.
  - After B1 the log holds two rows naming the `run.invoke#start` definition `5e72ba65…`. No file in store A publishes that digest.
  - The bound toolchain install publishes `967161365de4…`. It appears in `installed-0/node_modules/@abiogenesis/typescript-tenant/contracts/public-operations/run/invoke/operation-contract.json` and in two other contract files.
  - The same grant pairs B's definition digest with A's operation contract.
- **The reverse mirrors it (run).**
  - R1's rows hold A's definition digest `967161365de4…`. They pair it with B's catalog (`0fa17427…`, `060b0259…`) and B's asset `79e10dbb…`.
  - Store B's files publish `5e72ba65…` and not `967161365de4…`.
- **Both builds read the mixed log without complaint (run).**
  - P1 (A) and P2 (B) report B1's Run as `closed`, and R2 (A) reports B's setup Run as `closed`.
  - The `run_status` projection names no Product at all: neither build's definition digest or content digest appears in the output of C2, P1 or P2.

## 8. What could not be done, and why

- **(ii) The continuation.**
  - (read) `run.invoke#start` admits only `until: "converged"`: in the closed domain at `product/run_operation_contracts.ts:116` and in the request schema at `:156`. A Public start therefore runs to convergence.
  - (run) The hello Program converges and closes in one start. Setup step 08 and every admitted start end with `run_closed`.
  - (read) One lane continues with `run.continue#current_intent`: `test_env/tests/t287-exact-construction-intent.test.mjs`.
    - It opens its pending execution with in-process traversal internals (`abg.openTraversalScope` and `hog.executeGraphTraversal`, `:27-30`), not through the installed CLI.
    - Its continuation dispatches one actor process: the lane asserts one `actor_invocation_started` row at `:103`.
  - The rules forbid that dispatch, so this line stops here, and no request goes to `run.continue`.
  - (read) The `run.continue#current_intent` definition digests differ between the builds (A `29951c80…`, B `27296132…`). A continuation replayed across builds therefore meets the same transport check as B3.
- **Driving the stores through anything other than the two CLIs.** The experiment does not attempt it. Every attempt is a request to one build's installed CLI.

## 9. The existing comparison at another door

(read) **`linkNativeContractSet`, `product/declaration_exports.ts:2068`, comparison at `:2073-2080`.** This is the one comparison in the source that tells "the executing Product is not the toolchain the lock names".

- **What it compares.**
  - One side is the executing toolchain's product content digest. `installedToolchainProductContentDigest` (`:547-553`) returns it, reading the running build's `product-toolchain-manifest.json` through `readExecutingToolchainIdentity` (`:519-542`).
  - The other side is the content digest of the lock's ABI toolchain artifact, which `resolveProductArtifacts` passes in (`product/environment.ts:475-477`, `:504-508`).
- **What it refuses.** A difference refuses `incompatible_dependency`: "selected ABIogenesis Product does not match the installed compiler basis".
- **Where it runs.** Only where a lock is constructed:
  - the `product.resolve` callable (`product/environment_definition_bindings.ts:445`, call at `:460-462`);
  - `constructResolvedProductLock` (`product/environment.ts:534-541`), which `resolveProductEnvironment` uses (`product/environment_operations.ts:32-36`).
- The retained-link shortcut in `resolveProductArtifacts` (`product/environment.ts:434-438`) makes the same comparison before it reuses a link.

(read) **TD-77's second candidate does not make this comparison.** `checkExecutingOwner` (`product/admission_authority.ts:445-453`; refusal `owner_artifact_mismatch` at `:192-193`) compares the executing manifest and content digests with the capability's owner artifact.
- The caller supplies that artifact, and nothing ties it to the store's bound lock, as TD-77 states.
- It tells "the executing Product is not the named owner", not "the executing Product is not the bound toolchain".
- It runs inside `withAdmissionAuthority`, which wraps, among others, these owners:
  - `product.verify`, `product.resolve` and `workspace.bind` (`product/environment_definition_bindings.ts:814-815`);
  - `product.install`, the `catalog.*` operations and `workspace.create` and `workspace.open`;
  - the materialization, result, conformance and witness owners.
- It does not wrap the run owners (scope note above).

(read) **The other readers of the executing identity in B's source.** None compares it with the bound lock:
- `abg/project_read_definition_bindings.ts:796-807`, the run read door. It compares the request's contract catalog and flat row with the executing manifest. Its comment at `:794-795` says historical grants "remain permission over the source binding, not the reader's Product". This is why B4, P1, P2 and R2 are admitted.
- `abg/definition_event_resource.ts:457`, the event-resource recovery path. It compares with a caller-supplied owner artifact.
- `product/declaration_application.ts:239`, inside `constructCatalogApplicationResources` (`:129`). A Catalog application's validation receipt digests the executing manifest digest.
  - At Run admission, `admitExactInvocation` (`abg/invocation_admission.ts:1760`) reaches `admitInvocationWithRequest` (`:863`), whose application check is at `:932-956`.
  - That function reconstructs each application the Run carries (`reconstructCatalogApplication`, `product/declaration_application.ts:261-267`). It refuses `catalog_view_not_admitted` when the caller's receipt differs from the rebuilt one.
  - This compares the executing build with the build that issued the caller-supplied receipt, not with the bound lock. The receipt is caller-supplied, like the owner artifact of `checkExecutingOwner`.
  - The hello Run carries no application (`applications: []`), so this is untested.
- `validator/qualification_catalogs.ts:128`. It admits the executing package's own qualification catalogs against that package's own manifest. The run path's `prepareRunQualificationResources` reads it.

(read) **Correction to TD-77.** Its door table, in the `workspace.bind` row of `TD-77_RETURN.md`, cites `product/environment_definition_bindings.ts:460-462` for `workspace.bind`. Those lines are in the `product.resolve` callable (`const resolve`, `:445`).
- `workspace.bind` (`const bind`, `:645-812`) checks the caller's lock and installs by shape only: `isResolvedProductLock` at `:533` and `isProductInstall` at `:537-539`.
- It builds the binding with `constructExactWorkspaceBinding` (`product/environment_operations.ts:38`).
- So `linkNativeContractSet` is not on bind's path. Bind's executing-identity check is `checkExecutingOwner`, through `withAdmissionAuthority` (`:815`). It refuses `owner_artifact_mismatch`, not `incompatible_dependency`, and only against the caller's owner artifact.

This experiment does not drive `workspace.bind` across builds.

## 10. Evidence

- **Scripts** (`/private/tmp/abg-td78-work/scripts/`): `cleanenv.sh`, `setup.mjs`, `attempt.mjs`, `restore.mjs`, `inventory.mjs`, `definition-digests.mjs`.
- **Setup records:** `/private/tmp/abg-td78-work/setupA/` and `/private/tmp/abg-td78-work/setupB/`. Each holds `requests/`, `outcomes/`, `setup-record.json` and `setup-state.json`.
- **Pristine stores:** `/private/tmp/abg-td78-work/pristineA/` and `/private/tmp/abg-td78-work/pristineB/`.
- **Attempts** (`/private/tmp/abg-td78-work/attempts/<directory>/`). Each directory holds `request.jsonl`, `stdout.json`, `stderr.log`, `attempt-record.json`, `close-handoff.json` and `appended-rows.jsonl`. The directories are:

  | Attempt | Directory |
  | --- | --- |
  | C1 | `C1-A-start` |
  | C2 | `C2-A-read` |
  | B1 | `B1-B-start-rebuilt` (also holds the post-B1 log, `post-attempt.events.jsonl`) |
  | B2 | `B2-B-start-recorded` |
  | B3 | `B3-B-replay-A-start` |
  | B4 | `B4-B-read` |
  | B5 | `B5-B-replay-A-read` |
  | B6 | `B6-B-start-rebuilt-tree-check` |
  | P1 | `B1-post-read-by-A` |
  | P2 | `B1-post-read-by-B` |
  | R0 | `R0-B-start-on-B-control` |
  | R1 | `R1-A-start-rebuilt-on-B` |
  | R2 | `R2-A-read-on-B` |
  | R3 | `R3-A-replay-B-start` |
  | R4 | `R4-B-replay-A-start-on-B` |

- **Logs** (`/private/tmp/abg-td78-work/logs/`): the B build and pack, both builds' digests, restore checks, inventories of A's install and release before, after and final, and the B6 tree diff.
